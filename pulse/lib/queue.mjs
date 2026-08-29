/**
 * queue.mjs — the derived work queue (specs/pulse, design D3, task 3.5).
 *
 * "The Pulse SHALL recompute the loop's work queue from current state on
 * every run... The queue is a ranked snapshot (a generated file), not a
 * ledger: nothing is ever 'filed' into it, it has no history, and it cannot
 * backlog — an item leaves the queue the moment the underlying state is
 * fixed, and the queue's size is bounded by the size of the site, not by
 * time passing."
 *
 * This is the structural answer to the failure that killed the previous
 * version of the site, where a work ledger only ever grew. Three properties
 * are therefore load-bearing and are enforced here rather than intended:
 *
 *   1. **Recomputed, never accumulated.** Nothing is read from a previous
 *      queue. The file is overwritten whole, every run.
 *   2. **No identity, no history.** Items carry no id, no created date, no
 *      status. There is nothing to close, so nothing can fail to close.
 *   3. **Byte-identical on unchanged state.** No timestamp, no counter, no
 *      insertion order — items are sorted by a total order and written
 *      through `stableStringify`. Re-running produces the same bytes.
 *
 * Ranks are fixed constants, highest first. They express one judgement: a
 * source that has stopped answering, or a link that is dead, damages the
 * site's claim to be current more than an overdue re-check does.
 */

import { paths, readJson, writeJson } from './core.mjs';
import { uninterpretedChanges } from './diff.mjs';
import { isConfirmedBroken } from './linkcheck.mjs';

export const QUEUE_CAP = 50;
export const WANT_ELIGIBLE_AT = 3; // specs/wiki: "a name wanted by 3 or more distinct pages"

export const RANKS = {
  'refusing-source': 100,
  'broken-link': 90,
  'vanished-feed-row': 85,
  'suspect-source': 80,
  'listing-could-not-verify': 75,
  // A citation that resolves to something else is worth repairing and is not
  // urgent: the page is up, and nothing on this site is broken until a reader
  // follows the link. Ranked below every dead-resource repair deliberately —
  // and the fix is always available (re-point the citation, or drop it), which
  // is what keeps it from becoming the unrepairable top-of-queue item that
  // halted the loop on addictedtoai-5hn.
  'reference-drift': 72,
  // Two sources that disagree about the same published quantity. Ranked above
  // every timer in this table and below every confirmed breakage, because that
  // is what it is: not "this value may have gone stale" but "two records of
  // this value are measured to differ, today". It sits under `tutorial-demoted`
  // and `reference-drift`, which are things already visibly wrong on a page.
  corroboration: 68,
  'listing-verification-due': 60,
  'tutorial-demoted': 70,
  'tutorial-stale': 55,
  'overdue-fact-fast': 65,
  'overdue-fact-slow': 45,
  'uninterpreted-status-change': 50,
  'uninterpreted-licence-change': 42,
  'uninterpreted-price-change': 40,
  'want-eligible-mint': 30,
};

/** Read `data/derived/wants.json` (written by the build, task 2.8) tolerantly. */
export function readWants(root) {
  const raw = readJson(`${paths(root).derived}/wants.json`, null);
  if (!raw) return [];
  const out = [];
  const push = (name, count, pages) => {
    if (!name) return;
    out.push({ name: String(name), count: Number(count) || 0, pages: Array.isArray(pages) ? [...pages].sort() : [] });
  };
  if (Array.isArray(raw)) for (const w of raw) push(w?.name, w?.count ?? w?.pages?.length, w?.pages);
  else if (Array.isArray(raw.wants)) for (const w of raw.wants) push(w?.name, w?.count ?? w?.pages?.length, w?.pages);
  else for (const [name, v] of Object.entries(raw)) push(name, v?.count ?? (Array.isArray(v) ? v.length : 0), v?.pages ?? v);
  return out.sort((a, b) => (a.name < b.name ? -1 : 1));
}

function item(type, reason, subject, detail, target) {
  return { type, reason, rank: RANKS[reason] ?? 0, subject, detail, target };
}

/**
 * Recompute the queue. Pure with respect to the queue file: it reads current
 * state only, never a previous queue.
 */
export function computeQueue(root, { freshness, changesFile, wants = readWants(root), corroborations = [] }) {
  const items = [];

  // A declared pair whose two sides disagree (specs/pulse, addictedtoai-473).
  // The item proposes a `verify` job and carries everything that job needs to
  // begin: the entry, both fields, both resolved values, and both sources — the
  // feed's registry id for one side and the cited `source_url` for the other.
  // It names no winner. Which source is right is judgment, and judgment is the
  // job, not this line.
  for (const c of corroborations) {
    const side = (s) => `${s.field} = ${JSON.stringify(String(s.value))} (${s.kind}: ${s.source ?? 'unrecorded'})`;
    items.push(
      item(
        'verify',
        'corroboration',
        `${c.entry_id ?? c.path}#${c.a.field}`,
        `declared corroboration disagrees: ${side(c.a)} against ${side(c.b)}. ` +
          'Both are transcribed faithfully; establish which source is right for this entry and ' +
          'repair the claim that rests on it. Do not edit a feed-bound fact to match a citation.',
        c.path,
      ),
    );
  }

  for (const s of freshness.sources ?? []) {
    if (s.refusing) {
      items.push(
        item(
          'repair',
          'refusing-source',
          s.id,
          `source refusing since ${s.refusing.since} (${s.refusing.reason ?? 'HTTP ' + s.refusing.status}); last snapshot ${s.snapshot_date ?? 'none'} is what the site serves`,
          'data/sources/registry.json',
        ),
      );
    }
    if (s.suspect) {
      items.push(
        item(
          'repair',
          'suspect-source',
          s.id,
          `no change for ${s.days_since_change}d, past 3x expected_change_days (${s.expected_change_days}d) — extractor may be silently broken`,
          'data/sources/registry.json',
        ),
      );
    }
  }

  for (const l of freshness.broken_links ?? []) {
    // A single failure is not yet a broken link — one flaky timeout is not a
    // dead resource, the same reasoning specs/directory already applies to a
    // listing below (`listing-could-not-verify` waits for the second failure
    // too). `broken-link` is the highest-ranked repair in the queue after a
    // refusing source, so filing it on one observation put an item the Desk
    // selects first, and that may have healed by the time it is selected, at
    // the top of the queue. See CONFIRM_AFTER_FAILURES in linkcheck.mjs.
    if (!isConfirmedBroken(l.consecutive_failures)) continue;
    items.push(
      item(
        'repair',
        'broken-link',
        l.url,
        `HTTP ${l.status ?? l.error ?? 'unreachable'} on ${l.consecutive_failures} consecutive check(s); cited by ${l.cited_by.length} file(s)`,
        l.cited_by[0] ?? null,
      ),
    );
  }

  // Only `reference_drift` files work. `freshness.redirected_links` holds
  // every recorded move, most of them legitimate, and is deliberately not read
  // here: a repair item for an http -> https or an org rename is an item no
  // job can close.
  for (const d of freshness.reference_drift ?? []) {
    items.push(
      item(
        'repair',
        'reference-drift',
        d.url,
        `${d.detail}; cited by ${d.cited_by.length} file(s)` +
          (d.meta_refresh ? ` (reached through a meta refresh from ${d.meta_refresh})` : '') +
          '. Re-point the citation at the resource it was citing, or remove the claim it supports.',
        d.cited_by[0] ?? null,
      ),
    );
  }

  for (const v of freshness.vanished_feed_rows ?? []) {
    items.push(
      item(
        'repair',
        'vanished-feed-row',
        `${v.source}:${v.row_id}`,
        `declared row id absent from the latest snapshot; last seen ${v.last_seen_date ?? 'never'} — bound facts render last-known values with an as-of date`,
        v.path,
      ),
    );
  }

  for (const l of freshness.listings ?? []) {
    if (l.state === 'could-not-verify') {
      items.push(item('verify', 'listing-could-not-verify', l.slug, `${l.url} failed ${l.consecutive_failures} consecutive checks`, l.path));
    } else if (l.state === 'due' || l.state === 'unverified') {
      items.push(
        item('verify', 'listing-verification-due', l.slug, `last_verified ${l.last_verified ?? 'never'} (${l.age_days ?? '?'}d, interval ${l.interval_days}d)`, l.path),
      );
    }
  }

  for (const t of freshness.tutorials ?? []) {
    if (t.state === 'demoted') {
      items.push(item('verify', 'tutorial-demoted', t.slug, `verified ${t.verified_on}, ${t.age_days}d ago — past 2x reverify_days (${t.reverify_days}d), demoted`, t.path));
    } else if (t.state === 'stale') {
      items.push(item('verify', 'tutorial-stale', t.slug, `verified ${t.verified_on}, ${t.age_days}d ago — past reverify_days (${t.reverify_days}d)`, t.path));
    }
  }

  for (const f of freshness.overdue_facts ?? []) {
    const reason = f.volatility === 'slow' ? 'overdue-fact-slow' : 'overdue-fact-fast';
    items.push(item('verify', reason, `${f.entry_id ?? f.path}#${f.field}`, `accessed ${f.accessed}, ${f.days_overdue}d past its ${f.interval_days}d ${f.volatility} interval`, f.path));
  }

  for (const c of uninterpretedChanges(changesFile)) {
    const reason =
      c.field === 'status'
        ? 'uninterpreted-status-change'
        : c.field === 'license' || c.field === 'licence'
          ? 'uninterpreted-licence-change'
          : 'uninterpreted-price-change';
    items.push(item('interpret', reason, c.key, `${c.source} ${c.row_id} ${c.field}: ${c.old} -> ${c.new} on ${c.date}`, 'data/changes.jsonl'));
  }

  for (const w of wants) {
    if (w.count < WANT_ELIGIBLE_AT) continue;
    items.push(item('entry', 'want-eligible-mint', w.name, `wanted by ${w.count} distinct pages`, w.pages[0] ?? null));
  }

  // Total order: rank descending, then reason, then subject. Deterministic
  // without giving any item an identity.
  items.sort((a, b) => {
    if (a.rank !== b.rank) return b.rank - a.rank;
    if (a.reason !== b.reason) return a.reason < b.reason ? -1 : 1;
    if (a.subject !== b.subject) return String(a.subject) < String(b.subject) ? -1 : 1;
    return String(a.target) < String(b.target) ? -1 : 1;
  });

  const capped = items.slice(0, QUEUE_CAP);
  return {
    cap: QUEUE_CAP,
    count: capped.length,
    total_before_cap: items.length,
    items: capped,
  };
}

export function writeQueue(root, queue) {
  writeJson(`${paths(root).derived}/queue.json`, queue);
}
