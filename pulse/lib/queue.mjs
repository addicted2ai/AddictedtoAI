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
 *
 * Every item but one is derived from *site state* — a fact's age, a dead link,
 * a feed row that vanished. The exception is the daily scout item, whose two
 * inputs are `data/ledger.jsonl` and the clock, and which therefore leaves the
 * queue when the day's scout has run rather than when anything on the site is
 * fixed. All three properties above still hold of it: the ledger is state, the
 * item has no identity, and two runs on one local day produce the same bytes.
 * See the scout section below.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';
import { daysSince, now, paths, readJson, readJsonl, today, writeJson } from './core.mjs';
import { uninterpretedChanges } from './diff.mjs';
import { isConfirmedBroken } from './linkcheck.mjs';
import { KIND } from '../../lib/change-kinds.mjs';

export const QUEUE_CAP = 50;
export const WANT_ELIGIBLE_AT = 3; // specs/wiki: "a name wanted by 3 or more distinct pages"
export const SCOUT_CONTEXT_DAYS = 7; // specs/pulse: the scout item's trailing window

/**
 * Every job type the DERIVED QUEUE may produce — a closed list and a stated
 * decision (specs/pulse, "Which job types the queue may produce is a stated
 * decision"). `computeQueue` may not emit an item of any other type, and
 * `pulse/tests/curriculum-queue.test.mjs` measures that.
 *
 * The loop can RUN ten types (`loop/lib/config.mjs` `JOB_TYPES`). This list has
 * six. The four that are absent are absent BY DECISION, not because nobody got
 * to them — which was the state `addictedtoai-3zf` part (d) called out as the
 * thing that is actually wrong: capacity with no trigger and no record of why.
 * Adding a seventh means editing this list, which is the visible decision point.
 *
 *   `post`       — reachable by proposal, and demonstrably so: the scout files
 *                  event-anchored candidates and four post jobs merged from
 *                  them on 2026-08-31. A derived "we are due a post" trigger is
 *                  the cadence that filled the previous site's blog with
 *                  censuses nobody asked for (addictedtoai-18c).
 *   `tutorial`   — excluded for a different reason from the two below: the
 *                  declared-coverage shape would fit it, but
 *                  specs/education-dynamic names no curriculum of record to
 *                  measure against. Writing one is an editorial decision about
 *                  what this site should teach by doing, not a machinery
 *                  decision (addictedtoai-kat1).
 *   `prune`      — NEVER. Removal is the one irreversible act here, and a
 *                  derived trigger would need a measurement of "this is the
 *                  weakest content" that does not exist; the closest available
 *                  thing is a model scoring the corpus on a rubric, which is
 *                  unfalsifiable. Every other queue item that fires wrongly
 *                  wastes a job; this one 404s a published URL. See
 *                  let-the-site-see-its-own-gaps, design D4.
 *   `machinery`  — NEVER from the queue, for the same reason: "the machinery is
 *                  deficient" has no committed-state measurement. The inward
 *                  channel that works is evidence-driven and already runs — a
 *                  reviewer noticing a defect while reviewing other work and
 *                  writing it into its verdict record
 *                  (`loop/lib/proposals.mjs` `transcribeNotedProposal`), which
 *                  produced four machinery proposals in one day. See
 *                  let-the-site-see-its-own-gaps, design D5.
 */
export const QUEUE_PRODUCIBLE_TYPES = Object.freeze([
  'education',
  'entry',
  'interpret',
  'repair',
  'scout',
  'verify',
]);

export const RANKS = {
  'refusing-source': 100,
  'broken-link': 90,
  'vanished-feed-row': 85,
  // A live feed row that cannot mint because its slug lands on an existing
  // entry that does not declare it (addictedtoai-2wa). Ranked beside its
  // mirror case `vanished-feed-row` and deliberately just under it: there, a
  // fact the site already asserts is now stale; here, the site asserts
  // nothing yet, which is missing rather than wrong. Both outrank a merely
  // suspect source, because both are a corpus/world mismatch measured today,
  // not a source that has gone quiet.
  'slug-collision': 82,
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
  // The daily scout (specs/pulse, "Once per day, the Pulse queues the scout").
  // Its position is normative, not a preference: *below* confirmed breakage and
  // a corroboration disagreement — the site's claim to be true outranks
  // discovery — and *above* the routine timers, because discovery outranks
  // re-checking things that were true last week. The upkeep floor in `loop` is
  // what stops that ordering starving upkeep: rank decides within a run, the
  // floor guarantees upkeep's share across runs.
  //
  // One consequence, stated because the cap is a truncation and not a deferral:
  // on a day when 50 items outrank 62 the scout item is not offered at all, and
  // there is no backlog to carry it. Only `overdue-fact-fast` (65) can
  // plausibly reach 50 instances — the eight classes above it are all confirmed
  // breakage or a declared disagreement — so this is a "the site is on fire"
  // state, in which discovery waiting is the right answer. Measured, not
  // assumed: `pulse/tests/queue.test.mjs` runs 60 overdue facts against it.
  'scout-due': 62,
  'listing-verification-due': 60,
  'tutorial-demoted': 70,
  'tutorial-stale': 55,
  'overdue-fact-fast': 65,
  'overdue-fact-slow': 45,
  'uninterpreted-status-change': 50,
  'uninterpreted-licence-change': 42,
  'uninterpreted-price-change': 40,
  'want-eligible-mint': 30,
  // The learn surface declares a page its curriculum of record enumerates and
  // `content/learn/` does not publish (specs/education-static; specs/pulse, "A
  // surface's unmet declared coverage is queue input"). The first queue reason
  // that looks INWARD: every other one answers "the world changed" or "a timer
  // elapsed", and this one answers "the site said it would do this and has not".
  //
  // Ranked below every breakage and every timer because nothing is wrong — no
  // page is stale, no link is dead, no reader sees anything false. A surface
  // that has not finished growing has not rotted, and this whole table is
  // ordered by damage to the site's claim to be current.
  //
  // Below `want-eligible-mint` (30) specifically: that reason means three or
  // more published pages already link to a name that does not exist, so a
  // reader is hitting the gap today, and it mints a cheap stub. This is a
  // standing intention nobody is currently walking into, and it costs a
  // 120-minute `education` job.
  //
  // Above `carried-finding` (25) for the reason that entry's own comment gives
  // for sitting where it does: a carried finding cannot retire on its own, so
  // it is ranked low enough that a stuck one can never dominate the queue. This
  // item has the opposite property — publishing the page removes it at the next
  // recomputation — so it does not need that protection.
  'curriculum-gap': 28,
  // A finding a reviewer carried but did not block on (beads addictedtoai-2bo,
  // loop/lib/carry.mjs). Ranked deliberately LOW — below every timer and below
  // `want-eligible-mint` — because there is no automatic way to tell a fixed
  // carried finding from an unfixed one (the fixing job's own diff has to
  // delete the file that names it; see `carriedFindingItems` below). An item
  // this rank cannot retire on its own is precisely the failure
  // addictedtoai-cct documents for a declared corroboration and the failure
  // addictedtoai-5hn already caused once at a HIGH rank — reference-drift sits
  // low in this same table for the identical reason. A carried finding waiting
  // one extra day behind real breakage costs little; a stuck one dominating
  // the queue would cost a great deal.
  'carried-finding': 25,
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

/**
 * `title` is optional and is emitted only when given, so every item that had
 * none before is byte-identical to what it was. The loop's reader documents the
 * two fields as different things — "title: one line, what needs doing" and
 * "detail: free text for the brief" (`loop/lib/queue.mjs`) — and falls back to
 * `title: it.title ?? it.detail` when a title is absent. That fallback is right
 * for a one-line detail and wrong for a long one: the selection log prints the
 * title whole (`loop/run.mjs:598`) and the brief renders it as the job's
 * outcome heading, so an item whose detail is many lines needs to say its
 * outcome in one.
 */
function item(type, reason, subject, detail, target, title) {
  const out = { type, reason, rank: RANKS[reason] ?? 0, subject, detail, target };
  if (title) out.title = title;
  return out;
}

/* ===========================================================================
 * The daily scout item (specs/pulse, "Once per day, the Pulse queues the
 * scout"; this change's design D2).
 *
 * The Pulse does not become the scout — it stays model-free, structurally
 * (`pulse/verify-zero-model.mjs`). It *triggers* the scout, from two inputs
 * and no others: the ledger and the clock. Nothing here scores an event,
 * ranks one above another, or says which is worth writing about. The context
 * it assembles is a **join**, and the join's output is an input to the
 * scout's judgment rather than a bound on it: the scout's charge is the world
 * beyond this repository, and these lines are only what the site already
 * knows about that world.
 * ======================================================================== */

/** The loop's append-only job record. Read tolerantly; absent means empty. */
function ledgerPath(root) {
  return join(paths(root).root, 'data', 'ledger.jsonl');
}

/**
 * Has a `scout` job been recorded on the run's own LOCAL calendar date?
 *
 * ## Why this compares local days rather than slicing the timestamp
 *
 * A ledger line's `ts` is an *instant* — `new Date().toISOString()`, UTC by
 * construction (`loop/lib/ledger.mjs`). Its first ten characters are a UTC
 * calendar date, and "the current local date" is what this repository means by
 * a date everywhere else (CLAUDE.md; `pulse/lib/core.mjs` rule 2). West of
 * Greenwich those two disagree every evening and east of it every morning, so
 * `String(l.ts).slice(0, 10) === today()` would be the *fifth* UTC-vs-local
 * bug here: it would both re-derive a scout item hours after one ran, and
 * suppress tomorrow's because yesterday's UTC stamp happened to match. Going
 * through `daysSince`, which resolves a datetime to the local calendar day it
 * falls on, is the whole fix — and `pulse/tests/scout-queue.test.mjs` forces
 * `TZ` in a child process in both directions, because a test on a UTC box
 * cannot tell the two implementations apart.
 *
 * The job **id** (`j-YYYYMMDD-NN`) is deliberately not used either: it is
 * minted from `getUTC*` in `loop/lib/ledger.mjs`, so matching on it would
 * reintroduce the same bug through a different door.
 *
 * Any `scout` line counts, whatever its outcome. `blocked: nothing cleared the
 * bar` is a success (specs/loop), and a `failed` scout still started — this
 * asks whether the day's scout has run, not whether it went well.
 *
 * `ts` is when the line was *recorded*, which is the closest thing the ledger
 * holds to when the job started; it carries no start field, and `ts - mm` is
 * an approximation (`mm` sums invocations, not wall-clock) that would put a
 * guess inside a mechanism.
 */
export function scoutRanToday(root, { at = now(), file = ledgerPath(root) } = {}) {
  for (const line of readJsonl(file)) {
    if (!line || line.type !== 'scout') continue;
    if (daysSince(line.ts, at) === 0) return true;
  }
  return false;
}

/**
 * Every `data/changes.jsonl` key a published post declares it covers.
 *
 * Read straight off `content/blog/` rather than through `readCorpus`, for the
 * reason that module states about itself: the Pulse is tolerant where the
 * build is strict. A post that will not parse is skipped, not fatal — a
 * malformed file must not stop the engine, and the consequence of skipping one
 * is at worst a line offered to the scout that a post already covered.
 */
export function coveredKeys(root, { dir = join(paths(root).content, 'blog') } = {}) {
  const keys = new Set();
  if (!existsSync(dir)) return keys;
  let files = [];
  try {
    files = fg.sync('**/*.md', { cwd: dir, absolute: true, dot: false, ignore: ['**/README.md'] }).sort();
  } catch {
    return keys;
  }
  for (const file of files) {
    let data;
    try {
      data = matter(readFileSync(file, 'utf8')).data ?? {};
    } catch {
      continue;
    }
    if (!Array.isArray(data.covers)) continue;
    for (const ref of data.covers) {
      // `covers:` is `[{key, date}]` (lib/schema.mjs). A bare string is
      // accepted too: this reader must not be the thing that decides the shape.
      const key = typeof ref === 'string' ? ref : ref && typeof ref === 'object' ? ref.key : null;
      if (typeof key === 'string' && key !== '') keys.add(key);
    }
  }
  return keys;
}

/**
 * The change feed's event lines from the trailing 7 days that no published
 * post covers, in the feed's own order.
 *
 * Annotation lines are excluded because they carry no event — they are an
 * `interpret` job's commentary *on* a line, keyed to it (`kind: 'annotation'`,
 * `annotates`). Nothing else is filtered: a seeded release inside the window is
 * a real dated event from a real source, and deciding that some kinds of event
 * are less interesting is exactly the judgment this file does not make.
 */
export function uncoveredEvents(changesFile, { at = now(), windowDays = SCOUT_CONTEXT_DAYS, covered = new Set() } = {}) {
  return readJsonl(changesFile).filter((l) => {
    if (!l || l.kind === KIND.ANNOTATION) return false;
    if (l.key && covered.has(l.key)) return false;
    const age = daysSince(l.date, at);
    return age !== null && age >= 0 && age <= windowDays;
  });
}

/** One assembled context line: enough to look the event up and to cite it. */
function eventLine(l) {
  const parts = [`- ${l.date ?? 'undated'} ${l.kind ?? 'change'}`];
  if (l.display_name) parts.push(`— ${l.display_name}`);
  const where = [l.source, l.row_id].filter(Boolean).join(' ');
  if (where) parts.push(`(${where})`);
  if (l.field) parts.push(`${l.field}: ${l.old} -> ${l.new}`);
  // Both URLs are labelled and neither stands in for the other. `item_url` is
  // the row's own link; `source_url` is per-row for a seeded line (the vendor's
  // announcement) but the *feed endpoint* for a diffed one — measured on the
  // live corpus, where 25 openrouter lines carry the same `/api/v1/models`.
  // Emitting whichever exists as a bare URL would hand the scout an API
  // endpoint labelled as the evidence for an event.
  if (l.item_url) parts.push(`url: ${l.item_url}`);
  if (l.source_url) parts.push(`source-url: ${l.source_url}`);
  // Verbatim, because a post's `covers:` must copy it verbatim (lib/schema.mjs).
  if (l.key) parts.push(`key: ${l.key}`);
  return parts.join(' ');
}

/** The one-line outcome. The charge and the filing rules are the brief's. */
const SCOUT_TITLE =
  'The daily outward sweep — bring back work this site could not have thought of by looking at itself';

/** The scout item's detail: what the join found, and what it does not mean. */
function scoutDetail(events) {
  const preamble =
    events.length === 0
      ? `No change-feed line from the trailing ${SCOUT_CONTEXT_DAYS} days is uncovered by a published post. ` +
        'That is a fact about this repository, not about the world, and it bounds nothing.'
      : `Assembled context — the ${events.length} change-feed line(s) from the trailing ${SCOUT_CONTEXT_DAYS} ` +
        "days that no published post's `covers:` declares. A mechanical join of `data/changes.jsonl` " +
        'against those declarations, in the feed\'s own order: no score, no shortlist, and no claim that ' +
        'any of it is worth writing about. It is what the site already knows, offered as an input — the ' +
        'search is the world beyond this repository, and these lines do not bound it.';
  return [preamble, ...(events.length ? ['', ...events.map(eventLine)] : [])].join('\n');
}

/**
 * The daily scout item, or nothing. Exactly one item or none, ever: the
 * derivation is a function of the ledger and the clock, so a re-run on a day
 * whose scout is already recorded derives nothing at all.
 */
export function scoutItems(root, { changesFile, at = now() } = {}) {
  if (scoutRanToday(root, { at })) return [];
  const events = uncoveredEvents(changesFile, { at, covered: coveredKeys(root) });
  return [item('scout', 'scout-due', today(at), scoutDetail(events), null, SCOUT_TITLE)];
}

/**
 * Findings a reviewer carried but did not block on (beads addictedtoai-2bo),
 * queued from the files under `data/carried/` (`loop/lib/carry.mjs` writes
 * them; nothing else does). Each file's own `title:` becomes the item's
 * `title` — never the `detail ?? title` fallback the loop's reader otherwise
 * applies, because a carried finding's detail is review prose and can run
 * long enough to make an undispatchable job heading.
 *
 * ## ONE ITEM PER SUBJECT, not per file (2026-09-03)
 *
 * It was one item per file until the queue was measured: on 2026-09-03 all 26
 * standing items were carried findings, on **15 distinct subjects**, with the
 * top seven subjects holding 18 of them. Four separate findings named
 * `content/blog/glm-5-3-license-revenue-gate.md` and three named one model
 * entry. Dispatched one per file, that is four jobs that each open the same
 * post, re-read the same licence, and re-establish the same context, and four
 * review passes over four one-line diffs to the same paragraph — with three of
 * them reviewing a file the other three are also editing.
 *
 * Grouping by subject is the whole change and it is a change to the QUEUE, not
 * to the mechanism: a finding is still one file, the file's presence is still
 * the state, and retirement is still the fixing job's own diff deleting it.
 * What changes is how many of them one job is handed. The count of jobs needed
 * to drain the queue drops from the number of findings to the number of
 * subjects — 26 to 15 as measured — and the saving is larger than that ratio
 * because the context a repair job must build is per-subject, not per-finding.
 *
 * A finding with no `subject:` keys on its own path, so it never groups with
 * anything: two subject-less findings stay two items, which is correct, since
 * nothing says they concern the same file.
 *
 * The total order in `computeQueue` (rank, then reason, then subject) is
 * untouched, and deliberately: ordering the groups by SIZE would put the
 * biggest batch permanently at the head of the carried block, which is the
 * shape addictedtoai-5hn and -cct both warn about. Alphabetical by subject
 * drains just as completely and cannot starve.
 *
 * A malformed file (no front matter, no `title:`) is skipped rather than
 * queued with a guessed title — the same "do not manufacture a name" rule
 * every other reader in this file follows. It is not reported as a queue
 * warning: `readQueue` in the loop already reports whatever this function
 * omits by omitting it, the same way an unreadable proposal is reported by
 * `readProposals`, not by the Pulse.
 */
export function carriedFindingItems(root) {
  const dir = join(paths(root).root, 'data', 'carried');
  if (!existsSync(dir)) return [];
  let names;
  try {
    names = readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'README.md')
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
  const groups = new Map();
  for (const name of names) {
    let text;
    try {
      text = readFileSync(join(dir, name), 'utf8');
    } catch {
      continue;
    }
    let data = {};
    let body = text;
    try {
      const p = matter(text);
      data = p.data ?? {};
      body = p.content ?? '';
    } catch {
      continue;
    }
    const title = String(data.title ?? '').trim();
    if (!title) continue;
    const subject = data.subject ? String(data.subject).trim() : null;
    const key = subject ?? `data/carried/${name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ file: `data/carried/${name}`, title, body: body.trim() });
  }

  const out = [];
  for (const [key, found] of groups) {
    if (found.length === 1) {
      // Byte-identical to what a single finding produced before grouping
      // existed. Its body already reads correctly on its own, including the
      // retirement instruction `loop/lib/carry.mjs` writes into it.
      out.push(item('repair', 'carried-finding', key, found[0].body, key, found[0].title));
      continue;
    }
    out.push(
      item('repair', 'carried-finding', key, batchedDetail(key, found), key, batchedTitle(key, found)),
    );
  }
  return out;
}

/** One line naming the whole batch — never a detail, which runs to kilobytes. */
function batchedTitle(subject, found) {
  return `Clear the ${found.length} carried findings on ${subject}`;
}

/**
 * The reviewer's own words for each finding in a batch, under a heading naming
 * the file that carries it, followed by ONE retirement instruction.
 *
 * The two trailing sections `loop/lib/carry.mjs` generates into every carried
 * file — `## Origin` and `## Retiring this item` — are dropped here and
 * replaced by the closing section below. Repeated four times they are noise,
 * and worse than noise: each says "delete **this** file" without naming it,
 * which is unambiguous in a one-finding brief and exactly ambiguous in a
 * four-finding one. The replacement names every path.
 *
 * The split is on the generated `## Origin` heading, taking the LAST
 * occurrence so a reviewer who wrote that heading inside its own prose keeps
 * it; a file without the heading at all (hand-written, or written by some
 * future version) contributes its whole body, which is the safe direction.
 */
function batchedDetail(subject, found) {
  const parts = [
    `${found.length} findings carried by reviewers against \`${subject}\`, batched into one job ` +
      `because they concern the same file. Each is stated below in the reviewing reviewer's own ` +
      `words. Fix every one, or say in \`RESULT.md\` which you did not and why — a finding you ` +
      `leave standing must keep its file.`,
  ];
  for (const f of found) {
    parts.push(`### ${f.title}\n\nCarried in \`${f.file}\`.\n\n${reviewerDetail(f.body)}`);
  }
  parts.push(
    `### Retiring these findings\n\n` +
      `These files' presence is what puts the findings in the Pulse's derived queue. Delete the ` +
      `file for each finding you fixed, in the same diff as the fix — that is what removes the ` +
      `item, and a file left in place puts the same finding back on the next Pulse run:\n\n` +
      found.map((f) => `- \`${f.file}\``).join('\n'),
  );
  return parts.join('\n\n');
}

/** A carried file's body without the two sections `carry.mjs` appends. */
function reviewerDetail(body) {
  const at = body.lastIndexOf('\n## Origin\n');
  return (at === -1 ? body : body.slice(0, at)).trim();
}

/**
 * A declared feed row that vanished from its source (beads addictedtoai-u0n5),
 * one queue item per file under `data/vanished/` (`pulse/lib/vanished.mjs`
 * writes them; nothing else does).
 *
 * This deliberately mirrors `carriedFindingItems` rather than computing from
 * `freshness.vanished_feed_rows`. A withdrawn row is absent from the latest
 * snapshot forever, so the computed form could never retire: it re-dispatched
 * work that had already been done and, at rank 85, starved every finding
 * beneath it. Presence of the file is the state; the fixing job's own diff
 * deletes it; nothing records "done" separately. That is what `specs/pulse`
 * requires of a retirable finding, and the reason it gives — "a retirement
 * that depended on a separate step recording 'this one is done' is how a
 * high-rank item becomes permanently un-retirable and blocks everything
 * beneath it forever" — is a description of the defect this replaces.
 *
 * A malformed record (no front matter, no `title:`) is skipped rather than
 * queued under a guessed name, the same rule every other reader here follows.
 */
export function vanishedRowItems(root) {
  const dir = join(paths(root).root, 'data', 'vanished');
  if (!existsSync(dir)) return [];
  let names;
  try {
    names = readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'README.md')
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
  const out = [];
  for (const name of names) {
    let text;
    try {
      text = readFileSync(join(dir, name), 'utf8');
    } catch {
      continue;
    }
    let data = {};
    let body = text;
    try {
      const p = matter(text);
      data = p.data ?? {};
      body = p.content ?? '';
    } catch {
      continue;
    }
    const title = String(data.title ?? '').trim();
    if (!title) continue;
    const source = data.source ? String(data.source).trim() : null;
    const rowId = data.row_id ? String(data.row_id).trim() : null;
    const subject = source && rowId ? `${source}:${rowId}` : `data/vanished/${name}`;
    const target = data.subject ? String(data.subject).trim() : null;
    out.push(item('repair', 'vanished-feed-row', subject, body.trim(), target, title));
  }
  return out;
}

/* ===========================================================================
 * Declared coverage: the gap between what a surface says it will teach and
 * what it has published (specs/pulse, "A surface's unmet declared coverage is
 * queue input"; specs/education-static, the curriculum of record).
 *
 * THE PULSE PARSES THE CURRICULUM ITSELF rather than importing
 * `lib/learn.mjs`. That is the boundary `pulse/lib/corpus.mjs` states in its
 * own header — *"The build owns schema validation and fails loudly on a
 * malformed file. The Pulse deliberately does not share that code and
 * deliberately does not throw"* — and the same reason `coveredKeys` above reads
 * `content/blog/` directly instead of going through the build's loader. An
 * absent, unreadable or catalog-less curriculum yields NO items and halts
 * nothing: the engine has to keep the data layer true on a day the build fails.
 *
 * The cost of two parsers is that they can drift apart. That is answered by
 * measuring it rather than by breaking the boundary: `lib/learn.test.mjs` reads
 * the real curriculum through both and asserts the slug lists are identical.
 * ======================================================================== */

/** The curriculum of record, relative to a repository root. */
function curriculumPath(root) {
  return join(paths(root).root, 'openspec', 'curriculum', 'learn.md');
}

/**
 * Every page slug the curriculum's `## §4` catalog enumerates, in document
 * order. Scoped to that section deliberately: a `#### \`term\`` written
 * anywhere else in the document would otherwise become a phantom entry, and a
 * phantom entry is a permanent queue item for a page that must never be
 * written.
 *
 * Tolerant throughout — an absent file, an unreadable one, or one with no
 * catalog section all return `[]`, which produces no work and no complaint.
 */
export function readCurriculumSlugs(root, { file = curriculumPath(root) } = {}) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  const start = /^## §4\b/m.exec(text);
  if (!start) return [];
  const after = text.slice(start.index + start[0].length);
  const end = /^## §/m.exec(after);
  const section = end ? after.slice(0, end.index) : after;

  const seen = new Set();
  const out = [];
  for (const m of section.matchAll(/^#### `([a-z0-9]+(?:-[a-z0-9]+)*)`/gm)) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    out.push(m[1]);
  }
  return out;
}

/** The slugs `content/learn/` actually publishes. `README.md` is not a page. */
export function publishedLearnSlugs(root, { dir = join(paths(root).content, 'learn') } = {}) {
  if (!existsSync(dir)) return new Set();
  try {
    return new Set(
      readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'README.md')
        .map((e) => e.name.replace(/\.md$/, '')),
    );
  } catch {
    return new Set();
  }
}

/**
 * One `education` item per declared-but-unpublished page, in curriculum order.
 *
 * A SET DIFFERENCE AND NOTHING MORE. Nothing here scores a gap, ranks one above
 * another, or decides which missing page matters most — the order is the
 * curriculum's own, because any other order would be this file making an
 * editorial judgment it has no basis for. The result is falsifiable by anyone
 * who can read two directory listings, which is the property that makes it a
 * legitimate queue reason rather than a rubric.
 *
 * It retires by recomputation like everything else: publish the page and the
 * item is gone on the next run, with nothing to close.
 */
export function curriculumGapItems(root, { declared = readCurriculumSlugs(root), published = publishedLearnSlugs(root) } = {}) {
  const out = [];
  for (const slug of declared) {
    if (published.has(slug)) continue;
    out.push(
      item(
        'education',
        'curriculum-gap',
        slug,
        `the learn curriculum of record enumerates "${slug}" and content/learn/${slug}.md does not ` +
          `exist. Its entry in openspec/curriculum/learn.md carries the level, the outcome string, ` +
          `the prerequisites, what to cover and what to refuse to cover — write the page to that ` +
          `entry, and amend the entry rather than deviating from it silently.`,
        `content/learn/${slug}.md`,
        `Write the declared learn page "${slug}", which the curriculum enumerates and the site has not published`,
      ),
    );
  }
  return out;
}

/**
 * Recompute the queue. Pure with respect to the queue file: it reads current
 * state only, never a previous queue.
 */
export function computeQueue(root, { freshness, changesFile, wants = readWants(root), corroborations = [], registry = null, at = now() }) {
  const items = [];

  // One scout a day, from the ledger and the clock alone. Taken once, at the
  // top, and with a single `at` shared by every date comparison in this
  // function's scout path — a run that straddled local midnight between two
  // `now()` calls could otherwise suppress today's item against tomorrow's
  // date.
  items.push(...scoutItems(root, { changesFile, at }));

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

  // `vanished-feed-row` is NOT produced from `freshness.vanished_feed_rows`.
  // That field is a level signal — a withdrawn row is absent forever — so
  // producing from it gave a rank-85 item with no retirement condition, which
  // re-dispatched already-finished work on every run and blocked everything
  // beneath it (addictedtoai-u0n5). The finding is now file-presence state
  // under `data/vanished/`, retired by the fixing job's own diff, exactly as
  // `specs/pulse` requires of a carried finding and for the reason it gives.
  // `freshness.vanished_feed_rows` remains as reporting, and is still what the
  // Pulse uses to decide which records to write.
  items.push(...vanishedRowItems(root));

  for (const c of freshness.slug_collisions ?? []) {
    items.push(
      item(
        'repair',
        'slug-collision',
        `${c.source}:${c.row_id}`,
        `${c.source} row "${c.row_id}" is present in the latest snapshot; its slug would land on ${c.path} (${c.entry_id ?? 'unknown id'}, status ${c.entry_status ?? 'unknown'}), which does not declare it — minting refuses to overwrite an existing entry, so this row mints nothing and the refusal repeats every run. If the entry covers the same subject, restore its feeds: binding; if this is a genuine collision between two different subjects, resolve it (rename the entry, or otherwise disambiguate) rather than leaving the row permanently unminted.`,
        c.path,
        'Feed row live again but slug-collides with an entry that does not declare it',
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

  // The registry goes in so that a field it marks `event: false` stops
  // producing `interpret` jobs as well as change lines — one definition of
  // "is this an event", not two (addictedtoai-e31). Omitting it suppresses
  // nothing, which is the old behaviour.
  for (const c of uninterpretedChanges(changesFile, { registry })) {
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

  // Findings a reviewer carried but did not block on (beads addictedtoai-2bo).
  // One item per file under data/carried/ — see `carriedFindingItems` above
  // for why the rank is low and how an item retires.
  for (const it of carriedFindingItems(root)) items.push(it);

  // A page the learn curriculum declares and the corpus does not publish.
  for (const it of curriculumGapItems(root)) items.push(it);

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
