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
 * already records the same EVENT — same metric, same date, same incoming and
 * outgoing leaders. The observed line was written by the engine from the
 * standing diff, it carries the row hashes in its key, and a seeded line beside
 * it would be the same event recorded twice under two different keys. Matching
 * the event and not the metric and date alone is what keeps a GENUINE second
 * lead change on that date — one the engine saw intra-day and the dated replay
 * collapsed — from being silently dropped; it is the same predicate
 * `computeFrontier` uses for the mirror guard, imported rather than restated.
 * Nothing here ever edits or deletes a line.
 *
 * **And the guard runs in BOTH directions, which it did not at first.** This
 * script's newest recovered line comes from the two newest committed snapshot
 * blobs — exactly the `previous.json`/`latest.json` pair the Pulse re-diffs on
 * every run — so seeding and then running the Pulse would have produced two
 * lines for one event, one of them marked "seeded from the archive" on the
 * strip. `computeFrontier` (`pulse/lib/frontier.mjs`, `seededEvents`) now drops a
 * candidate whose EVENT — metric, date, incoming leaders, outgoing leaders — a
 * seeded line already records. It matches the event and not the metric and date
 * alone, so a genuine second lead change on the same day is still recorded.
 */

import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { paths, readJsonl } from '../pulse/lib/core.mjs';
import { loadRegistry } from '../pulse/lib/registry.mjs';
// `excerptRow` is THE definition of "the archived source excerpt" — the row id,
// the display name, the lifecycle fields and the source's own declared material
// field paths, and nothing else. The seeder used to write the whole raw row
// instead, which was a second implementation of a rule that already has one
// home (the exact duplication tasks 17-18 spend themselves removing) and was
// not an excerpt in the first place: an `openrouter-models` row carries a
// multi-kilobyte `description` plus architecture and pricing blocks, so a
// backfill of three metrics across eight committed snapshot days would have
// appended well over a hundred kilobytes of duplicated feed body to an
// append-only file that today holds 182 lines — and append-only means it could
// never be taken back out.
import { appendChanges, excerptRow } from '../pulse/lib/diff.mjs';
import { rankRows, leadChangeCause, eventSignature, metricValue } from '../pulse/lib/frontier.mjs';
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

/**
 * The EVENTS an observed (non-seeded) lead-change line already records.
 *
 * ONE PREDICATE FOR BOTH HALVES OF THE GUARD. This used to match on metric and
 * date alone while `computeFrontier`'s mirror half matched the whole event —
 * metric, date, incoming leaders, outgoing leaders. The asymmetry was not a
 * style point: metric + date is the predicate `pulse/lib/frontier.mjs` argues
 * against in its own header and `pulse/tests/frontier.test.mjs` has a case for
 * ("two lead changes on the same date get two keys"), because it suppresses a
 * GENUINE second lead change on the same metric on the same day. It was safe
 * here only because the dated replay keeps one blob per date and therefore
 * cannot produce two same-date events itself — but the OTHER side of the
 * comparison is the observed history, which can and does. An engine line
 * recording an intra-day change the replay collapsed away would have deleted the
 * seeded line for the different event on that date, silently.
 */
function observedEvents(lines) {
  const seen = new Set();
  for (const l of lines) {
    if (!l || l.kind !== KIND.LEAD_CHANGE || l.seeded) continue;
    if (!l.metric || !l.date) continue;
    seen.add(eventSignature(l));
  }
  return seen;
}

/**
 * Every seeded candidate: one baseline line per metric, plus one `lead-change`
 * line per pair of consecutive committed snapshots whose leader differs.
 */
export function seedCandidates(root, registry, { lines = [] } = {}) {
  const { metrics, row_exclusions } = frontierBlock(registry);
  const observed = observedEvents(lines);
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
      // NOTHING WAS LEADING, SO NOTHING CHANGED HANDS — the same guard, and the
      // same reason, as `computeFrontier`'s. `before === after` below catches
      // empty against empty and not empty against non-empty, so without this a
      // replay whose earlier blob carried no eligible row for the metric would
      // recover a "lead change" for a day on which observation merely resumed.
      // The baseline annotation is the line that may say that, and it says it
      // about the first blob only.
      if (previousRank.leaders.length === 0) continue;
      const before = previousRank.leaders.map((r) => r.row_id).join(' ');
      const after = latestRank.leaders.map((r) => r.row_id).join(' ');
      if (before === after) continue;

      const date = history[i].date;
      const incoming = latestRank.leaders.map((r) => ({ row_id: r.row_id, display_name: r.display_name, value: r.value }));
      const outgoing = previousRank.leaders.map((r) => ({ row_id: r.row_id, display_name: r.display_name, value: r.value }));
      // The engine already recorded THIS EVENT — same metric, same date, same
      // rows on both ends. A different event on the same date is still seeded.
      if (observed.has(eventSignature({ metric: metric.id, date, incoming, outgoing }))) continue;
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
          // Built exactly as `leadExcerpt` builds the engine's: the declared
          // excerpt, plus the metric path's own value beside it. One rule, one
          // home — see the import above. `from_commit`/`to_commit` stay,
          // because they are the seeder's own honest addition: a replayed line
          // can name the two commits it was recovered from and a live one
          // cannot.
          rows: Object.fromEntries(
            [...outgoing, ...incoming]
              .map((r) => {
                const row = latest.rows?.[r.row_id] ?? previous.rows?.[r.row_id] ?? null;
                if (!row) return null;
                return [r.row_id, { ...excerptRow(source, row), [metric.path]: metricValue(row, metric.path) }];
              })
              .filter(Boolean),
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
