/**
 * frontier.mjs — the leaders of the declared index metrics, the derived
 * `data/derived/frontier.json`, and the `lead-change` lines that record a
 * leader changing between two consecutive snapshots.
 *
 * specs/pulse, "A lead change and a rescoring are different events, and the
 * difference is computed"; `separate-a-claim-from-a-fact` task 23. What is
 * declared — the metrics, their publishers, their rights, and the row-eligibility
 * exclusions — lives in `data/sources/registry.json`'s `frontier` block and is
 * read through `lib/frontier-metrics.mjs`. Nothing about which rows count or
 * which index leads is compiled into this file.
 *
 * ## A leader can lose the lead without anything shipping
 *
 * That sentence is the whole reason `cause` exists. Measured across the
 * committed snapshots: between 2026-09-03 and 2026-09-04 exactly one row's
 * indices moved and every one moved DOWN — `qwen/qwen3.8-max`, 58.1 → 53.4
 * intelligence, 71.8 → 68.9 coding, 58.4 → 49.9 agentic. A history line saying
 * "X overtook Y" when Y was marked down is false about an event that did not
 * happen. So a line carries a `cause` drawn from a closed set, and **the cause
 * is COMPUTED from the two snapshots and never judged** — a model invocation on
 * this path would make the history a model's opinion about what happened.
 *
 * The three causes, and the order they are tested in, which is the one judgment
 * call here and is written down rather than left to fall out of the code:
 *
 *   1. **`arrival`** — an incoming leader was absent from the previous snapshot,
 *      or present in it with no value. Tested FIRST, because the question a
 *      history line answers is how the NEW leader got there: if it is new, it
 *      arrived, whatever the outgoing leader did.
 *   2. **`withdrawn`** — no incoming leader is new, and an outgoing leader is
 *      gone from the latest snapshot. The lead moved because the holder left.
 *   3. **`rescored`** — everyone involved was present in both snapshots, so what
 *      moved was a value.
 *
 * ## What is NOT a lead change
 *
 * A change in the leader's VALUE with no change in the leader's IDENTITY. It is
 * a different event and this module emits nothing for it: `diffSnapshots`
 * already writes the `field_change` line that records it, keyed to the row and
 * the field. Recording it a second time here — under a kind that says the lead
 * changed — is exactly the conflation the requirement forbids.
 *
 * **That delegation is only true because the registry now enforces it.**
 * `field_change` fires ONLY for a path declared in the same source's
 * `material_fields` and not marked `event: false` (`pulse/lib/diff.mjs`), so
 * without a cross-check a metric could be registered on a path no material field
 * covers and the value move would be recorded NOWHERE. `validateFrontier`
 * (`pulse/lib/registry.mjs`) refuses that registration, naming both ends and the
 * remedy — so "the other event has a recorder" is a declared coupling rather
 * than a coincidence of how the two lists happen to overlap today.
 *
 * And it is NOT recorded by the derived file, which an earlier draft of this
 * header wrongly claimed. `data/derived/frontier.json` is recomputed from
 * scratch on every run and carries only the CURRENT value of every eligible row;
 * it holds no history, so it records no movement at all. The history is
 * `data/changes.jsonl` and nothing else.
 *
 * ## Keys, and why there is no clock in this file
 *
 * A line's key is a pure function of state: the source, the two snapshot row
 * hashes, the metric id and the kind. So a re-run over an unchanged pair
 * recomputes the identical candidate, `appendChanges` finds the key already
 * present and appends nothing; a clock rollover with no fetch appends nothing;
 * and deleting a line by hand and re-running puts it back, because deletion is
 * not a retirement path. The line's `date` is the LATEST SNAPSHOT'S OWN DATE and
 * never `today()` — the same property that makes `data/derived/frontier.json`
 * byte-identical across a re-run with no world change, which is what every file
 * under `data/derived/` already promises.
 *
 * ## What this module never does
 *
 * It never edits or deletes a line. A correction is a new line keyed to the
 * corrected one, which is the treatment the `annotation` kind already receives.
 * And it records only the LEADER: membership churn in a top-N table is noise
 * against the question the history answers — *when did the lead change* — and
 * belongs in the derived file, which is recomputed anyway.
 *
 * ## Rights are not this module's gate
 *
 * A registered metric whose republication rights are not cleared is still
 * ranked, still has a leader, and still produces a `lead-change` line when its
 * leader changes. Recording a value is not rendering it: `specs/pulse` already
 * requires every material change entry to embed its archived source excerpt, and
 * `data/derived/` is committed but not served. The rights gate binds the
 * SURFACE, and it reads the registry rather than this file — see
 * `lib/frontier-metrics.mjs`. That is why nothing below writes a rights answer
 * into the derived file: an answer copied here would be an answer read at Pulse
 * time by a renderer that must ask at build time.
 */

import { getPath, paths, readJsonl, writeJson } from './core.mjs';
import { displayName, excerptRow } from './diff.mjs';
import { loadSnapshot, rowsHash } from './sources.mjs';
import { feedBindings } from './corpus.mjs';
import { sortedSources } from './registry.mjs';
import { KIND } from '../../lib/change-kinds.mjs';
import { frontierBlock, isRowExcluded } from '../../lib/frontier-metrics.mjs';

/**
 * The causes a `lead-change` line may carry. Closed, and computed, never judged.
 *
 * It has a READER — `leadChangeCause` below checks its own answer against it —
 * because a frozen list nothing consults is the `MATERIAL_KINDS` decoy this same
 * change deletes in task 18, reintroduced: authoritative-looking, unread, and
 * free to disagree with the data. The delta says `cause` is "drawn from a closed
 * set"; a closed set with no reader is the weakest possible form of that.
 */
export const LEAD_CHANGE_CAUSES = Object.freeze(['arrival', 'rescored', 'withdrawn']);

/**
 * A row's value for a metric, as a finite number, or null.
 *
 * Only a number: the metric declares which end of the values LEADS, and a
 * string that happens to sort has no such end. A row carrying a non-numeric
 * value at the path is counted as carrying no value rather than coerced —
 * coercion is how `"58.1 (v4.2)"` becomes 58.1 and a note about which index it
 * came from disappears.
 */
export function metricValue(row, path) {
  const raw = getPath(row, path);
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return null;
  return raw;
}

/**
 * The eligible rows of one snapshot for one metric, ranked, with the counts
 * behind them.
 *
 * Order: by value in the declared direction, then by row id ascending. The row
 * id breaks ties in the ORDERING so the file is deterministic; it decides
 * nothing about who leads — every row holding the best value is a leader, and
 * the surface says so (specs/pulse: "Ties SHALL all be leaders ... no tie-break
 * invents an order").
 */
export function rankRows(source, metric, snapshot, exclusions, entryIdFor) {
  const rows = snapshot?.rows ?? {};
  const ranked = [];
  let excluded = 0;
  let withoutValue = 0;
  for (const rowId of Object.keys(rows).sort()) {
    if (isRowExcluded(rowId, exclusions)) {
      excluded += 1;
      continue;
    }
    const value = metricValue(rows[rowId], metric.path);
    if (value === null) {
      withoutValue += 1;
      continue;
    }
    ranked.push({
      row_id: rowId,
      // The join to an entry is by the DECLARED feed row id and never by name
      // (specs/wiki). A row no entry declares still ranks; it just has no entry.
      entry_id: entryIdFor(rowId),
      display_name: displayName(source, rows[rowId]),
      value,
    });
  }
  // `lower` ranks ascending, `higher` descending; the row id breaks ties.
  const sign = metric.direction === 'lower' ? 1 : -1;
  ranked.sort((a, b) => (a.value === b.value ? (a.row_id < b.row_id ? -1 : 1) : sign * (a.value - b.value)));
  const best = ranked.length ? ranked[0].value : null;
  return {
    ranked,
    leaders: ranked.filter((r) => r.value === best),
    counts: {
      rows_total: Object.keys(rows).length,
      rows_excluded: excluded,
      rows_without_value: withoutValue,
      rows_eligible: ranked.length,
    },
  };
}

/** Did the set of leaders change identity between two ranks? */
function leadersChanged(previous, latest) {
  const a = previous.leaders.map((r) => r.row_id).join('\0');
  const b = latest.leaders.map((r) => r.row_id).join('\0');
  return a !== b;
}

/**
 * Which of the three causes this lead change is, computed from the two
 * snapshots. See the header for why the tests are in this order.
 */
export function leadChangeCause(metric, previousRows, latestRows, previousRank, latestRank) {
  const cause = computeCause(metric, previousRows, latestRows, previousRank, latestRank);
  // The closed set is READ, not decoration. A fourth cause added to the function
  // and not to the list stops here rather than reaching the history.
  if (!LEAD_CHANGE_CAUSES.includes(cause)) {
    throw new Error(
      `lead-change cause ${JSON.stringify(cause)} is not in the closed set ` +
        `(${LEAD_CHANGE_CAUSES.join(', ')}) — a cause is computed from the two snapshots and drawn from that ` +
        `set; add it to LEAD_CHANGE_CAUSES before emitting it`,
    );
  }
  return cause;
}

function computeCause(metric, previousRows, latestRows, previousRank, latestRank) {
  for (const leader of latestRank.leaders) {
    const before = previousRows?.[leader.row_id];
    if (before === undefined) return 'arrival';
    if (metricValue(before, metric.path) === null) return 'arrival';
  }
  for (const leader of previousRank.leaders) {
    if (latestRows?.[leader.row_id] === undefined) return 'withdrawn';
  }
  return 'rescored';
}

/** The archived source reference a lead-change line carries: the rows it is about. */
function leadExcerpt(source, metric, previousRows, latestRows, previousRank, latestRank, snapshotDate) {
  const rows = {};
  for (const leader of previousRank.leaders) {
    const row = latestRows?.[leader.row_id] ?? previousRows?.[leader.row_id];
    if (row) rows[leader.row_id] = { ...excerptRow(source, row), [metric.path]: metricValue(row, metric.path) };
  }
  for (const leader of latestRank.leaders) {
    const row = latestRows?.[leader.row_id];
    if (row) rows[leader.row_id] = { ...excerptRow(source, row), [metric.path]: metricValue(row, metric.path) };
  }
  return { metric: metric.id, path: metric.path, snapshot_date: snapshotDate ?? null, rows };
}

/** Strip the entry join out of a leader for a change line: the line is data, not a view. */
function lineRow(r) {
  return { row_id: r.row_id, display_name: r.display_name, value: r.value };
}

/** The identity of an EVENT, independent of which key recorded it. */
function eventSignature(line) {
  const ids = (rows) => (rows ?? []).map((r) => r?.row_id).sort().join('\0');
  return `${line.metric}\0${line.date}\0${ids(line.incoming)}\0${ids(line.outgoing)}`;
}

/**
 * The events a SEEDED lead-change line already records.
 *
 * The other half of a guard that ran in one direction only. `scripts/seed-frontier-history.mjs`
 * drops a seeded candidate when an OBSERVED line already covers that metric and
 * date; nothing stopped the reverse, and the reverse is the one that actually
 * fires. The seeder's newest recovered line is computed from the two newest
 * committed snapshot blobs — which are exactly the `previous.json`/`latest.json`
 * pair this module re-diffs on every run — so seeding and then running the Pulse
 * produced two lines for one event under two different keys, one of them marked
 * "seeded from the archive" on the strip. Moot while no metric is registered,
 * which is precisely why it would not have been noticed until it shipped.
 *
 * The match is the EVENT, not the metric and date alone: same metric, same date,
 * same incoming leaders, same outgoing leaders. A genuine second lead change on
 * the same metric on the same day moves a different pair of rows and is still
 * recorded — the case `frontier.test.mjs` covers under "two lead changes on the
 * same date get two keys". Only the seeded line's own event is suppressed, and
 * nothing is edited or deleted: the seeded line stands, because this file is
 * append-only and a seeded line is real recovered history, not a placeholder.
 */
function seededEvents(lines) {
  const seen = new Set();
  for (const l of lines ?? []) {
    if (!l || l.kind !== KIND.LEAD_CHANGE || !l.seeded) continue;
    seen.add(eventSignature(l));
  }
  return seen;
}

/**
 * Compute `data/derived/frontier.json` and the `lead-change` candidates.
 *
 * Pure with respect to the clock and the network: it reads the registry, the
 * corpus's declared feed bindings, the two committed snapshots per source, and
 * the existing change lines — all state on disk, no clock and no network.
 * `write: false` returns the same result without touching the derived file,
 * which is what a test that only wants the candidates uses.
 *
 * `lines` defaults to the committed history and exists so a caller can supply
 * it; it is read ONLY to suppress an event a seeded line already records (see
 * `seededEvents`), never to decide a leader or a value. The derived file does
 * not depend on it at all.
 *
 * @returns {{ data: object, candidates: object[] }}
 */
export function computeFrontier(root, registry, corpus, { write = true, lines } = {}) {
  const p = paths(root);
  const { metrics, row_exclusions } = frontierBlock(registry);
  const seeded = seededEvents(lines ?? readJsonl(p.changes));

  const entryIdByRow = new Map();
  for (const b of feedBindings(corpus ?? { entries: [] })) entryIdByRow.set(`${b.source}\0${b.row_id}`, b.entry_id);

  const snapshots = new Map();
  const snapshotsFor = (sourceId) => {
    if (!snapshots.has(sourceId)) {
      snapshots.set(sourceId, {
        latest: loadSnapshot(root, sourceId, 'latest'),
        previous: loadSnapshot(root, sourceId, 'previous'),
      });
    }
    return snapshots.get(sourceId);
  };

  const out = [];
  const candidates = [];

  for (const metric of metrics) {
    const source = (registry.sources ?? []).find((s) => s.id === metric.source);
    if (!source) continue; // the registry load already refuses this; a reader does not crash on it
    const { latest, previous } = snapshotsFor(source.id);
    const entryIdFor = (rowId) => entryIdByRow.get(`${source.id}\0${rowId}`) ?? null;
    const latestRank = rankRows(source, metric, latest, row_exclusions, entryIdFor);
    const previousRank = rankRows(source, metric, previous, row_exclusions, entryIdFor);

    out.push({
      id: metric.id,
      field: metric.field,
      label: metric.label,
      publisher: metric.publisher,
      publisher_url: metric.publisher_url,
      republisher: metric.republisher ?? null,
      source: source.id,
      source_url: source.url,
      path: metric.path,
      direction: metric.direction,
      snapshot_date: latest?.date ?? null,
      leaders: latestRank.leaders,
      ranked: latestRank.ranked,
      counts: latestRank.counts,
    });

    // A lead change needs two snapshots to compare and a leader on the latest
    // one. Nothing else in this module writes a line.
    if (!latest || !previous) continue;
    if (latestRank.leaders.length === 0) continue;
    if (!leadersChanged(previousRank, latestRank)) continue;

    const from = rowsHash(previous);
    const to = rowsHash(latest);
    if (from === to) continue; // identical snapshots cannot have changed a leader

    const cause = leadChangeCause(metric, previous.rows, latest.rows, previousRank, latestRank);
    const incoming = latestRank.leaders.map(lineRow);
    const outgoing = previousRank.leaders.map(lineRow);

    // ONE EVENT, ONE LINE — the seeder's mirror image. Its newest recovered line
    // is computed from the same snapshot pair this diff sees, so without this the
    // backfill and the next Pulse run both record it, under two keys. See
    // `seededEvents`.
    if (seeded.has(eventSignature({ metric: metric.id, date: latest.date ?? null, incoming, outgoing }))) continue;

    candidates.push({
      // A pure function of the two row hashes, the metric and the kind — no
      // clock, no counter, no ordinal.
      key: `${source.id}|${from}|${to}|${metric.id}|${KIND.LEAD_CHANGE}`,
      date: latest.date ?? null,
      kind: KIND.LEAD_CHANGE,
      source: source.id,
      source_url: source.url,
      // The join key the changed feed uses (`${source}|${row_id}`). With a tie
      // it is the first incoming leader by row id, and the whole tie is in
      // `incoming` — the row id here decides a link, never who leads.
      row_id: incoming[0].row_id,
      display_name: incoming[0].display_name,
      field: null,
      old: null,
      new: null,
      metric: metric.id,
      metric_label: metric.label,
      publisher: metric.publisher,
      republisher: metric.republisher ?? null,
      cause,
      incoming,
      outgoing,
      excerpt: leadExcerpt(source, metric, previous.rows, latest.rows, previousRank, latestRank, latest.date),
    });
  }

  /*
   * THE SNAPSHOT DATE WITH NOTHING REGISTERED, which is today's state and the
   * one implementer-ledger row 6 was filed for. The file must exist, carry the
   * snapshot's own date, and be LOOKED UP rather than stood in for — so a
   * surface that declares one cleared metric is populated with no edit to any
   * renderer. With zero metrics there is no metric's source to take a date
   * from, so it is the newest committed snapshot date across the registered
   * sources: a computed answer from the data on disk, not a clock read and not
   * a placeholder string. `null` only when no source has a snapshot at all.
   */
  const dates = sortedSources(registry)
    .map((s) => snapshotsFor(s.id).latest?.date ?? null)
    .filter((d) => typeof d === 'string' && d !== '')
    .sort();
  const data = { snapshot_date: dates.length ? dates[dates.length - 1] : null, metrics: out };

  if (write) writeJson(`${p.derived}/frontier.json`, data);
  return { data, candidates };
}
