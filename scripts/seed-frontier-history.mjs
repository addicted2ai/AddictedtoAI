#!/usr/bin/env node
/**
 * seed-frontier-history.mjs — replay the committed snapshot blobs once, so the
 * lead-change record is not empty on the day the surface ships.
 *
 * specs/pulse: "The history SHALL be **seeded once** from the snapshots already
 * committed to this repository, as dated, sourced, `seeded: true` entries under
 * the existing seeding rule ... Seeding SHALL be idempotent and SHALL never
 * overwrite an observed entry. Its limits SHALL be stated on the surface rather
 * than implied: the record begins when observation began, and a baseline line
 * says *observation began here*, not *this model became the leader here*."
 * (`separate-a-claim-from-a-fact` task 25.)
 *
 * ## Who runs this, and who does not
 *
 * **The orchestrator, once, by hand.** Not a Desk job — a job that seeds its own
 * history is writing the evidence it will later be judged against. And not the
 * Pulse: the Pulse is the standing engine and this is a one-time backfill over
 * git history, which is not state the Pulse recomputes. It is a script for the
 * same reason `scripts/verify-*.mjs` are scripts.
 *
 *   node scripts/seed-frontier-history.mjs            # append what is missing
 *   node scripts/seed-frontier-history.mjs --dry-run  # print, write nothing
 *   node scripts/seed-frontier-history.mjs --root D:/somewhere
 *
 * With no metric registered it writes nothing and says so. That is the state on
 * 2026-09-06 and it is not a failure: `separate-a-claim-from-a-fact` registers
 * no index and clears nobody's terms.
 *
 * ## Why git plumbing runs through `execFileSync` and never a shell
 *
 * CLAUDE.md, "Windows notes": `git show "origin/main:.dotfile/path"` in Git Bash
 * silently returns zero bytes with exit 0, because MSYS mangles the `rev:path`
 * argument. `execFileSync` spawns `git.exe` directly with an argv array and no
 * shell runtime touches the arguments, so the same command returns the blob.
 * Zero bytes and a clean exit is the worst possible failure here — it would look
 * exactly like a snapshot with no rows and seed a history of nothing.
 *
 * ## What is replayed, and what a dated replay cannot recover
 *
 * The commits that touched `data/sources/<source>/latest.json`, oldest first,
 * each blob parsed as the snapshot that WAS the latest at that commit. Two
 * consecutive blobs are exactly the pair `diffSnapshots` would have compared, so
 * the leaders are computed by the same functions the live engine uses
 * (`pulse/lib/frontier.mjs`) rather than by a second implementation of the rule.
 *
 * Snapshots are keyed by their own `date`, keeping the LAST blob committed for
 * each date. The consequence, stated rather than hidden: a lead that changed and
 * changed back inside one day is not recoverable from a dated replay, and this
 * script does not invent it. A change that happened intra-day and persisted IS
 * recovered, because the next day's blob carries it.
 *
 * ## Idempotence, and what "never overwrites an observed entry" means here
 *
 * Two guards, and they are different. `appendChanges` skips any key already in
 * the file, which makes a second run of this script a no-op. And before that,
 * a seeded candidate is dropped when an OBSERVED (non-seeded) `lead-change` line
 * already records the same metric on the same date — the observed line was
 * written by the engine from the standing diff, it carries the row hashes in its
 * key, and a seeded line beside it would be the same event recorded twice under
 * two different keys. Nothing here ever edits or deletes a line.
 */

import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { paths, readJsonl } from '../pulse/lib/core.mjs';
import { loadRegistry } from '../pulse/lib/registry.mjs';
import { appendChanges } from '../pulse/lib/diff.mjs';
import { rankRows, leadChangeCause } from '../pulse/lib/frontier.mjs';
import { frontierBlock } from '../lib/frontier-metrics.mjs';
import { KIND } from '../lib/change-kinds.mjs';
import { ROOT } from '../lib/paths.mjs';

/** Every commit that touched one path, oldest first. */
export function commitsTouching(root, relPath) {
  const out = execFileSync('git', ['-C', root, 'log', '--format=%H', '--reverse', '--', relPath], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split('\n').map((s) => s.trim()).filter(Boolean);
}

/** One committed blob, parsed. Null when the path did not exist at that commit. */
export function blobAt(root, sha, relPath) {
  let text;
  try {
    text = execFileSync('git', ['-C', root, 'show', `${sha}:${relPath}`], {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });
  } catch {
    return null;
  }
  // A zero-byte read with a clean exit is the MSYS failure this file's header
  // describes. It is refused rather than parsed as "a snapshot with no rows".
  if (text.trim() === '') {
    throw new Error(
      `git show ${sha}:${relPath} returned zero bytes and exited cleanly — this is the MSYS \`rev:path\` ` +
        `mangling CLAUDE.md's Windows note describes, and it would seed a history of nothing. Run this ` +
        `script with node, never through a shell that rewrites arguments.`,
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * The committed snapshots for one source, oldest first, one per snapshot date.
 * The last blob committed on a date wins — see the header.
 */
export function committedSnapshots(root, sourceId) {
  const relPath = `data/sources/${sourceId}/latest.json`;
  const byDate = new Map();
  for (const sha of commitsTouching(root, relPath)) {
    const snapshot = blobAt(root, sha, relPath);
    const date = snapshot?.date;
    if (!snapshot || typeof date !== 'string' || date === '') continue;
    byDate.set(date, { date, sha, snapshot });
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/** `metric id -> Set of dates` an observed (non-seeded) lead-change line already covers. */
function observedDates(lines) {
  const byMetric = new Map();
  for (const l of lines) {
    if (!l || l.kind !== KIND.LEAD_CHANGE || l.seeded) continue;
    if (!l.metric || !l.date) continue;
    if (!byMetric.has(l.metric)) byMetric.set(l.metric, new Set());
    byMetric.get(l.metric).add(l.date);
  }
  return byMetric;
}

/**
 * Every seeded candidate: one baseline line per metric, plus one `lead-change`
 * line per pair of consecutive committed snapshots whose leader differs.
 */
export function seedCandidates(root, registry, { lines = [] } = {}) {
  const { metrics, row_exclusions } = frontierBlock(registry);
  const observed = observedDates(lines);
  const snapshotsBySource = new Map();
  const candidates = [];

  for (const metric of metrics) {
    const source = (registry.sources ?? []).find((s) => s.id === metric.source);
    if (!source) continue;
    if (!snapshotsBySource.has(source.id)) snapshotsBySource.set(source.id, committedSnapshots(root, source.id));
    const history = snapshotsBySource.get(source.id);
    if (history.length === 0) continue;

    // The entry join is deliberately NOT made here. A seeded line records what
    // the snapshot said on a date in the past; joining it to the corpus as it
    // stands today would date-stamp a present-day fact onto a past event. The
    // changed feed joins by `${source}|${row_id}` at render time, which is the
    // join that stays true as the corpus changes.
    const entryIdFor = () => null;

    /*
     * THE BASELINE, and what it does NOT say. It is an `annotation` line — the
     * one declared kind that carries text and is excluded from the changed feed
     * by every consumer — with no `annotates`, so it attaches to no change and
     * never appears as an event anywhere. It is a record the frontier surface
     * can read (by `metric` + `baseline`) to state the limits of what it shows.
     *
     * It is emphatically NOT a `lead-change` line: nothing changed on that date,
     * observation merely began, and a `lead-change` line would say the lead
     * changed — which is precisely the false statement about an event that did
     * not happen that this whole requirement exists to prevent.
     */
    const first = history[0];
    candidates.push({
      key: `seed|frontier|${metric.id}|baseline`,
      date: first.date,
      kind: KIND.ANNOTATION,
      seeded: true,
      baseline: true,
      metric: metric.id,
      metric_label: metric.label,
      publisher: metric.publisher,
      source: source.id,
      source_url: source.url,
      text:
        `Observation of ${metric.label} begins here. This is the earliest snapshot of ${source.id} committed to ` +
        `this repository, read on ${first.date}; the record before it does not exist and is not reconstructed. ` +
        `Nothing became the leader on this date — this is where the site started looking.`,
    });

    for (let i = 1; i < history.length; i += 1) {
      const previous = history[i - 1].snapshot;
      const latest = history[i].snapshot;
      const previousRank = rankRows(source, metric, previous, row_exclusions, entryIdFor);
      const latestRank = rankRows(source, metric, latest, row_exclusions, entryIdFor);
      if (latestRank.leaders.length === 0) continue;
      const before = previousRank.leaders.map((r) => r.row_id).join(' ');
      const after = latestRank.leaders.map((r) => r.row_id).join(' ');
      if (before === after) continue;

      const date = history[i].date;
      if (observed.get(metric.id)?.has(date)) continue; // the engine already recorded this one

      const incoming = latestRank.leaders.map((r) => ({ row_id: r.row_id, display_name: r.display_name, value: r.value }));
      const outgoing = previousRank.leaders.map((r) => ({ row_id: r.row_id, display_name: r.display_name, value: r.value }));
      candidates.push({
        // Derived from the snapshot DATE rather than from the row hashes, which
        // is what makes seeding idempotent forever: the same replay recomputes
        // the same key even after the snapshot files themselves have rotated
        // out of both `latest.json` and `previous.json`.
        key: `seed|frontier|${metric.id}|${date}|${KIND.LEAD_CHANGE}`,
        date,
        kind: KIND.LEAD_CHANGE,
        seeded: true,
        source: source.id,
        source_url: source.url,
        row_id: incoming[0].row_id,
        display_name: incoming[0].display_name,
        field: null,
        old: null,
        new: null,
        metric: metric.id,
        metric_label: metric.label,
        publisher: metric.publisher,
        republisher: metric.republisher ?? null,
        cause: leadChangeCause(metric, previous.rows, latest.rows, previousRank, latestRank),
        incoming,
        outgoing,
        excerpt: {
          metric: metric.id,
          path: metric.path,
          snapshot_date: date,
          from_commit: history[i - 1].sha,
          to_commit: history[i].sha,
          rows: Object.fromEntries(
            [...outgoing, ...incoming].map((r) => [
              r.row_id,
              latest.rows?.[r.row_id] ?? previous.rows?.[r.row_id] ?? null,
            ]),
          ),
        },
      });
    }
  }
  return candidates;
}

export function seedFrontierHistory(root, { dryRun = false, write = (s) => process.stdout.write(s) } = {}) {
  const p = paths(root);
  const registry = loadRegistry(root);
  const lines = readJsonl(p.changes);
  const candidates = seedCandidates(root, registry, { lines });

  if (candidates.length === 0) {
    write('seed-frontier-history: nothing to seed (no declared metric, or no committed snapshot history)\n');
    return { candidates, written: [] };
  }
  if (dryRun) {
    for (const c of candidates) write(`seed-frontier-history: would append ${c.key} (${c.kind}, ${c.date})\n`);
    return { candidates, written: [] };
  }
  const written = appendChanges(p.changes, candidates);
  write(
    `seed-frontier-history: ${candidates.length} candidate(s), ${written.length} appended, ` +
      `${candidates.length - written.length} already present\n`,
  );
  return { candidates, written };
}

// Run only when invoked directly, so the functions above stay testable.
// `pathToFileURL`, not a hand-built `file://` string: on Windows the latter
// yields `file://D:/...`, which parses `D:` as the HOST and never matches.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  const rootFlag = argv.indexOf('--root');
  const root = rootFlag >= 0 ? argv[rootFlag + 1] : ROOT;
  seedFrontierHistory(root, { dryRun: argv.includes('--dry-run') });
}
