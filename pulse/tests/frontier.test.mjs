/**
 * frontier.test.mjs — `separate-a-claim-from-a-fact` task 24, the six cases the
 * change names as its acceptance test, run against the real `pulse/run.mjs`
 * over a locally served source.
 *
 *   (a) unchanged snapshots        -> zero lines, byte-identical derived file
 *   (b) a new row takes the lead   -> exactly one line, cause: arrival
 *   (c) the old leader marked down -> cause: rescored
 *   (d) the same leader marked down, no identity change -> the OTHER event
 *   (e) re-running (b)             -> appends nothing
 *   (f) deleting the line and re-running -> restores it
 *   (g) no leader on the PREVIOUS snapshot -> zero lines (added in review round 2)
 *
 * (e) and (f) are the idempotence and restore proofs: the key is a pure
 * function of the two snapshot row hashes, the metric and the kind, so a re-run
 * recomputes the identical candidate and deletion is not a retirement path.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  assertIngested,
  cleanup,
  jsonSource,
  makeRoot,
  paths,
  readJson,
  readLines,
  readText,
  runPulse,
  serve,
  writeEntry,
  writeJson,
} from './helpers.mjs';
// The key's INPUTS, computed independently in the test rather than matched as a
// suffix — see the key assertion in (b) for why a suffix match measures nothing.
import { rowsHash } from '../lib/sources.mjs';
import { LEAD_CHANGE_CAUSES } from '../lib/frontier.mjs';

const ARGS = ['--no-build', '--no-mint'];
const frontierFile = (root) => join(root, 'data', 'derived', 'frontier.json');

const METRIC = {
  id: 'fixture-index',
  field: 'fixture_index',
  path: 'benchmarks.idx',
  source: 'models',
  publisher: 'Fixture Analysis',
  publisher_url: 'https://fixture.invalid/',
  republisher: 'Fixture Router',
  direction: 'higher',
  label: 'Fixture Index',
  // Registered and NOT cleared, which is today's real state for both live
  // candidates. It still ranks, still has a leader and still writes a
  // lead-change line: recording a value is not rendering one.
  rights: { terms_url: 'https://fixture.invalid/terms', checked_on: '2026-09-06', outcome: 'unresolved' },
};

const EXCLUSIONS = [
  { id_contains: ':', reason: 'service variant of a base row', decided_on: '2026-09-06', note: 'fixture: `:batch` and `:free` twins' },
  { id_prefix: 'openrouter/', reason: 'router pseudo-row', decided_on: '2026-09-06', note: 'fixture: the platform routing over other people models' },
];

/** A fixture root whose registry declares the metric and the exclusions. */
function frontierRoot(url, { metrics = [METRIC], exclusions = EXCLUSIONS } = {}) {
  // The metric's path is ALSO a declared material field here, and that is now
  // REQUIRED rather than a fixture convenience: `validateFrontier` refuses a
  // metric whose path is not an event-bearing `material_fields` path on its own
  // source, because `diffSnapshots`' field_change line is the only recorder of
  // "a value moved under an unchanged leader" — case (d)'s other event. Before
  // the cross-check existed this fixture's declaration was the only thing making
  // case (d) pass, and both real candidate metrics sit on paths that would have
  // had no recorder at all. `pulse/tests/registry.test.mjs` measures the refusal.
  const root = makeRoot([
    jsonSource('models', url, {
      material_fields: [
        { field: 'price_input', path: 'pricing.prompt' },
        { field: 'context_window', path: 'context_length' },
        { field: 'status', path: '$status' },
        { field: 'idx', path: 'benchmarks.idx' },
      ],
    }),
  ]);
  const file = join(root, 'data', 'sources', 'registry.json');
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  raw.frontier = { metrics, row_exclusions: exclusions };
  writeFileSync(file, JSON.stringify(raw, null, 2) + '\n', 'utf8');
  return root;
}

const row = (id, name, idx) => ({
  id,
  name,
  pricing: { prompt: '0.000001' },
  context_length: 100000,
  expiration_date: null,
  benchmarks: idx === null ? {} : { idx },
});

const BASE = [row('acme/one', 'Acme One', 50), row('acme/two', 'Acme Two', 40)];

const body = (rows) => JSON.stringify({ data: rows });

function leadLines(root) {
  return readLines(paths.changes(root)).filter((l) => l.kind === 'lead-change');
}

test('(a) unchanged snapshots produce no lead-change line and a byte-identical derived file', async (t) => {
  let rows = BASE;
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');
  const first = readText(frontierFile(root));
  assert.ok(first, 'frontier.json is written on the first run');

  const second = await runPulse(root, [...ARGS, '--force']);
  assert.equal(second.status, 0, second.out);
  assert.equal(leadLines(root).length, 0, 'a world that did not change records no lead change');
  assert.equal(readText(frontierFile(root)), first, 'and the derived file is byte-identical — no clock reaches it');

  // The leader IS computed, so the zero above is a measured absence rather than
  // a module that never ran.
  const data = JSON.parse(first);
  assert.equal(data.metrics.length, 1);
  assert.deepEqual(data.metrics[0].leaders.map((l) => l.row_id), ['acme/one']);
  assert.equal(data.metrics[0].snapshot_date, data.snapshot_date);
});

test('(b) a new row taking the lead appends exactly one line, cause: arrival', async (t) => {
  let rows = BASE;
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');

  rows = [...BASE, row('acme/three', 'Acme Three', 90)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);

  const lines = leadLines(root);
  assert.equal(lines.length, 1, 'exactly one line for one lead change');
  const line = lines[0];
  assert.equal(line.cause, 'arrival', 'the new leader was absent from the previous snapshot');
  assert.equal(line.metric, 'fixture-index');
  assert.equal(line.row_id, 'acme/three');
  assert.deepEqual(line.incoming.map((r) => r.row_id), ['acme/three']);
  assert.deepEqual(line.outgoing.map((r) => r.row_id), ['acme/one']);
  assert.equal(line.date, readJson(paths.latest(root, 'models')).date, "the snapshot's own date, never a clock read");
  assert.ok(line.excerpt.rows['acme/three'], 'the archived source reference travels with the line');
  assert.equal(line.excerpt.rows['acme/three']['benchmarks.idx'], 90);
  assert.ok(LEAD_CHANGE_CAUSES.includes(line.cause), 'the cause is a member of the closed set, which is read');

  /*
   * THE PUBLISHER, WHICH THE REQUIREMENT NAMES AND NOTHING READ. specs/pulse
   * says a `lead-change` line "SHALL carry the metric, the snapshot date the
   * change was observed in, the outgoing and incoming rows, THE PUBLISHER, and
   * the archived source excerpt every material change entry already carries" —
   * and every clause of that sentence had an assertion above except the
   * publisher. A review deleted `publisher`, `metric_label` and `republisher`
   * from the emitted candidate in `pulse/lib/frontier.mjs` and this file still
   * went green, so the three fields were unmeasured: a line that named no
   * publisher would have shipped an unattributed claim to the strip, which is
   * the precise thing this change exists to prevent.
   *
   * The expected values are READ BACK OUT OF THE FIXTURE'S REGISTRY on disk
   * rather than written as literals here. That is the difference between
   * measuring "the line carries what the registry declared" and measuring "the
   * line carries the string I typed in two places" — the second passes just as
   * happily when the emitter invents a value, as long as the invention matches.
   */
  const registry = readJson(join(root, 'data', 'sources', 'registry.json'));
  const declared = registry.frontier.metrics.find((m) => m.id === line.metric);
  assert.ok(declared, 'the line names a metric the registry actually declares');
  assert.ok(
    declared.publisher && declared.label && declared.republisher,
    'the fixture declares all three, so none of the three assertions below can pass vacuously on undefined',
  );
  assert.equal(line.publisher, declared.publisher, 'the line carries the registry-declared publisher of the index');
  assert.equal(line.metric_label, declared.label, "the line carries the metric's registry-declared label");
  assert.equal(line.republisher, declared.republisher, 'the line carries the registry-declared republisher the value reached us through');

  // THE KEY'S INPUTS, NOT ITS SUFFIX. `assert.match(key, /\|fixture-index\|lead-change$/)`
  // used to stand here alone, and a mutant keyed on the SNAPSHOT DATE instead of
  // the two row hashes matched it and passed every test in the change. The
  // property is not decorative: with a date-derived key a second lead change on
  // the same metric on the same day — two fetches, or a re-fetch after a
  // publisher correction — collides with the first key and `appendChanges`
  // silently drops it. So the two hashes are computed here, from the snapshot
  // files on disk, and the whole key is asserted.
  const from = rowsHash(readJson(paths.previous(root, 'models')));
  const to = rowsHash(readJson(paths.latest(root, 'models')));
  assert.equal(
    line.key,
    `models|${from}|${to}|fixture-index|lead-change`,
    'the key is a pure function of the two snapshot row hashes, the metric and the kind',
  );
  assert.equal(line.key.includes(line.date), false, 'and carries no date, which is what makes a same-day pair distinct');

  // Excluded rows cannot take the lead, and the exclusion is a DECLARED pattern.
  rows = [...rows, row('acme/four:batch', 'Acme Four batch', 99), row('openrouter/auto', 'Auto Router', 98)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);
  const data = readJson(frontierFile(root));
  assert.deepEqual(data.metrics[0].leaders.map((l) => l.row_id), ['acme/three'], 'a service variant and a router pseudo-row are not distinct listed models');
  const counts = data.metrics[0].counts;
  assert.equal(counts.rows_excluded, 2);
  // ALL FOUR COUNTS ARE LOAD-BEARING, and until this block only two of them
  // were. `rows_total` could be hard-wired to 0 and `rows_eligible` to any
  // number at all with the whole change still green — measured by mutating
  // `rows_total: Object.keys(rows).length` to `rows_total: 0`. specs/pulse asks
  // the derived file for "the ranked eligible rows, AND THE COUNTS BEHIND
  // THEM": the counts are what lets a surface say how many rows the leader beat
  // and how many the metric does not cover, so a wrong one is a wrong sentence
  // on the page, not a cosmetic field.
  assert.equal(counts.rows_total, 5, 'five rows are in the snapshot');
  assert.equal(counts.rows_eligible, 3, 'and three of them carry a value at the declared path');
  assert.equal(
    counts.rows_total,
    counts.rows_excluded + counts.rows_without_value + counts.rows_eligible,
    'the four counts partition the snapshot — every row is excluded, unscored or ranked, exactly once',
  );
  assert.equal(leadLines(root).length, 1, 'and no second lead change was recorded');
});

test('(b2) a row PRESENT but unscored on the previous snapshot arriving is also an arrival', async (t) => {
  // THE SECOND HALF OF THE `arrival` CAUSE, which had no fixture behind it.
  // specs/pulse states it in two clauses — the new leader "was absent from the
  // previous snapshot, OR present and unscored" — and case (b) covers only the
  // first. The branch at `computeCause`'s `metricValue(before, …) === null` was
  // correct code no test reached: disabling it left 22/22 green, and the line
  // then says `rescored`, asserting the publisher re-scored an existing leader
  // when nothing of the kind happened. That is the semantic-mislabel class
  // (implementer-ledger rows 2, 4, 5) on an APPEND-ONLY file — `changes.jsonl`
  // cannot be corrected by deletion, only by a further line.
  //
  // The shape is the one the registry's own `declined_fields` note records: the
  // Artificial Analysis v4.2 rebase sent 181 values number->null overnight and
  // left `intelligence_index` on 52 rows where it had been on 164, so a row
  // sitting in the feed with no value at the metric path and gaining one later
  // is this feed's ordinary behaviour, not a contrivance. Case (g) builds the
  // same shape but its own guard (`previousRank.leaders.length === 0`) returns
  // before a cause is computed; here `acme/one` keeps a value throughout, so
  // there IS a previous leader and the cause is reached.
  let rows = [row('acme/one', 'Acme One', 50), row('acme/two', 'Acme Two', null)];
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');
  const first = readJson(frontierFile(root));
  assert.deepEqual(first.metrics[0].leaders.map((l) => l.row_id), ['acme/one'], 'the unscored row is not a leader');
  assert.equal(first.metrics[0].counts.rows_without_value, 1, 'it is counted as present and uncovered');

  rows = [row('acme/one', 'Acme One', 50), row('acme/two', 'Acme Two', 90)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);

  const lines = leadLines(root);
  assert.equal(lines.length, 1, 'exactly one line for one lead change');
  const line = lines[0];
  assert.equal(
    line.cause,
    'arrival',
    'the index first covered this row — the publisher scored something it had not scored, it did not re-score a leader',
  );
  assert.notEqual(line.cause, 'rescored', 'and `rescored` is exactly what the unguarded fall-through produces');
  assert.deepEqual(line.incoming.map((r) => r.row_id), ['acme/two']);
  assert.deepEqual(line.outgoing.map((r) => r.row_id), ['acme/one']);
  assert.equal(line.excerpt.rows['acme/two']['benchmarks.idx'], 90);
});

test('(c) the old leader marked down is a rescoring, not an overtaking', async (t) => {
  let rows = BASE;
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');

  // Exactly the shape measured between 2026-09-03 and 2026-09-04: one row's
  // value moved, and it moved DOWN. Nothing shipped.
  rows = [row('acme/one', 'Acme One', 30), row('acme/two', 'Acme Two', 40)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);

  const lines = leadLines(root);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].cause, 'rescored', 'both rows were present in both snapshots and a value moved');
  assert.deepEqual(lines[0].incoming.map((r) => r.row_id), ['acme/two']);
  assert.deepEqual(lines[0].outgoing.map((r) => r.row_id), ['acme/one']);
  // NOTHING IN THE DATA SAYS THE NEW LEADER IMPROVED, which is the whole point
  // of the cause: its own value is unchanged at 40. The outgoing row is
  // described AS IT STOOD WHEN IT LED (50) — that is what "the outgoing row"
  // means — and what it fell TO is in the archived source excerpt, which is
  // read from the latest snapshot. A reader of the line can therefore see both
  // ends of the movement without the line asserting a comparison.
  assert.equal(lines[0].incoming[0].value, 40);
  assert.equal(lines[0].outgoing[0].value, 50);
  assert.equal(lines[0].excerpt.rows['acme/one']['benchmarks.idx'], 30, 'and the excerpt carries where it landed');
});

test('(c2) the previous leader leaving the snapshot is a withdrawal', async (t) => {
  let rows = BASE;
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');

  rows = [row('acme/two', 'Acme Two', 40)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);

  const lines = leadLines(root);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].cause, 'withdrawn', 'no incoming leader is new, and the outgoing one is gone');
});

test('(c3) an arrival that coincides with a withdrawal is an arrival, and the precedence is measured', async (t) => {
  // THE ONE JUDGMENT CALL IN `leadChangeCause`, and until this fixture existed it
  // was a sentence in a module header that nothing could contradict: swapping the
  // two loops so `withdrawn` is tested first passed every test in the change.
  // The overlap is real — the outgoing leader leaves the snapshot on the same day
  // a new row arrives and takes the lead — and the header's reason decides it:
  // the question a history line answers is how the NEW leader got there, so if it
  // is new, it arrived, whatever the outgoing leader did.
  let rows = BASE;
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');

  // `acme/one` (the leader) leaves AND `acme/three` arrives above everything.
  rows = [row('acme/two', 'Acme Two', 40), row('acme/three', 'Acme Three', 90)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);

  const lines = leadLines(root);
  assert.equal(lines.length, 1);
  assert.deepEqual(lines[0].incoming.map((r) => r.row_id), ['acme/three']);
  assert.deepEqual(lines[0].outgoing.map((r) => r.row_id), ['acme/one']);
  assert.equal(
    lines[0].cause,
    'arrival',
    'arrival is tested before withdrawal: the line answers how the NEW leader got there, and it is new',
  );
});

test('two lead changes on the same date get two keys, because the key carries no date', async (t) => {
  // The failure a date-derived key would cause, made reachable. Two snapshot
  // pairs land on the same local date — an ordinary second fetch — and each is a
  // distinct event. Keyed on the date they would collide and `appendChanges`
  // would silently drop the second, losing an event nobody would look for again.
  let rows = BASE;
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');

  rows = [...BASE, row('acme/three', 'Acme Three', 90)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);
  rows = [...rows, row('acme/four', 'Acme Four', 95)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);

  const lines = leadLines(root);
  assert.equal(lines.length, 2, 'two lead changes, both recorded');
  assert.equal(lines[0].date, lines[1].date, 'on one date — the fixture is only interesting if they collide by date');
  assert.notEqual(lines[0].key, lines[1].key, 'and under two keys, because the key is the two row hashes');
  assert.deepEqual(lines.map((l) => l.row_id).sort(), ['acme/four', 'acme/three']);
});

test('the line and the derived file carry the snapshot date, on a run whose clock says otherwise', async (t) => {
  // THE CLOCK, MEASURED. The assertion `line.date === latest.date` was vacuous
  // while the fixture ingested on the real clock: the snapshot's own date WAS
  // today's date, so `today()` and `latest.date` were indistinguishable and
  // substituting one for the other passed every test. Here the snapshot pair is
  // frozen at 2026-01-03 and the run that recomputes the line happens on
  // 2026-06-15 — `PULSE_NOW`, the pinned clock the helpers already support.
  let rows = BASE;
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS, { PULSE_NOW: '2026-01-02' })).status, 0);
  assertIngested(root, ['models'], 'first ingest');
  rows = [...BASE, row('acme/three', 'Acme Three', 90)];
  assert.equal((await runPulse(root, [...ARGS, '--force'], { PULSE_NOW: '2026-01-03' })).status, 0);
  assert.equal(readJson(paths.latest(root, 'models')).date, '2026-01-03');
  const key = leadLines(root)[0].key;

  // Delete the line and re-run on a LATER day with the source unchanged. The
  // snapshots do not rotate when the body is unchanged, so the pair — and its
  // date — stay at 2026-01-03 while the clock says June.
  const kept = readLines(paths.changes(root)).filter((l) => l.key !== key);
  writeFileSync(paths.changes(root), kept.map((l) => JSON.stringify(l)).join('\n') + (kept.length ? '\n' : ''), 'utf8');
  assert.equal((await runPulse(root, [...ARGS, '--force'], { PULSE_NOW: '2026-06-15' })).status, 0);

  const line = leadLines(root)[0];
  assert.equal(line.date, '2026-01-03', "the line carries the snapshot's own date");
  assert.notEqual(line.date, '2026-06-15', 'and never the clock of the run that recomputed it');
  const data = readJson(frontierFile(root));
  assert.equal(data.snapshot_date, '2026-01-03', 'the derived file reads the same date from the same place');
  assert.notEqual(data.snapshot_date, '2026-06-15');
});

test('(d) the same leader marked down is the other event, and not a lead change', async (t) => {
  let rows = BASE;
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');

  // The leader's VALUE moves and its IDENTITY does not.
  rows = [row('acme/one', 'Acme One', 45), row('acme/two', 'Acme Two', 40)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);

  assert.equal(leadLines(root).length, 0, 'a value moving under an unchanged leader is not a lead change');

  // It IS recorded, and by the machinery that already records a field moving:
  // the fixture declares the metric path as a material field too, so
  // `diffSnapshots` writes the `field_change` line keyed to the row and the
  // field. Recording it a second time here, under a kind that says the lead
  // changed, is the conflation the requirement forbids.
  const field = readLines(paths.changes(root)).filter((l) => l.kind === 'field_change' && l.field === 'idx');
  assert.equal(field.length, 1, 'the other event exists');
  assert.equal(field[0].row_id, 'acme/one');
  assert.equal(field[0].old, '50');
  assert.equal(field[0].new, '45');

  // And the derived file carries the movement regardless of which line kind
  // recorded it, because it carries the current value of every eligible row.
  const data = readJson(frontierFile(root));
  assert.equal(data.metrics[0].leaders[0].value, 45);
});

test('(e) re-running over the same pair appends nothing, and (f) a deleted line comes back', async (t) => {
  let rows = BASE;
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');
  rows = [...BASE, row('acme/three', 'Acme Three', 90)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);
  assert.equal(leadLines(root).length, 1);
  const key = leadLines(root)[0].key;
  const derivedAfterChange = readText(frontierFile(root));

  // (e) The world has not moved: the snapshots rotate only when the source
  // changes, so the standing diff recomputes the identical candidate and its
  // key is already present.
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);
  assert.equal(leadLines(root).length, 1, 're-running appends nothing');
  assert.equal(readText(frontierFile(root)), derivedAfterChange, 'and rewrites the derived file byte-identically');

  // (f) Deletion is not a retirement path. The key is a function of state, so
  // the line is recomputed and appended again.
  const kept = readLines(paths.changes(root)).filter((l) => l.key !== key);
  writeFileSync(paths.changes(root), kept.map((l) => JSON.stringify(l)).join('\n') + (kept.length ? '\n' : ''), 'utf8');
  assert.equal(leadLines(root).length, 0, 'the line is gone from the file by hand');

  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);
  const restored = leadLines(root);
  assert.equal(restored.length, 1, 'and comes back on the next run');
  assert.equal(restored[0].key, key, 'with the identical key, because the key is a function of state');
});

test('(g) no leader on the previous snapshot is not a lead change, and the control proves the engine still emits', async (t) => {
  /*
   * NOTHING WAS LEADING, SO NOTHING CHANGED HANDS. Before the guard existed
   * `leadersChanged` compared `''` against `'acme/one'`, called them different,
   * and a line was written with `outgoing: []` and `cause: 'arrival'` — the
   * strip rendering "Acme One — lead changed on Fixture Index" about a day on
   * which no lead moved. That is the semantic-mislabel class (implementer-ledger
   * rows 2, 4 and 5) on an APPEND-ONLY file, so the false line could never have
   * been removed.
   *
   * Reachable rather than theoretical: the registry's own `declined_fields` note
   * records the Artificial Analysis v4.2 rebase sending 181 values
   * number->null overnight. A metric on such a path reaching zero eligible rows
   * on one snapshot and recovering on the next writes exactly this line.
   */
  let rows = [row('acme/one', 'Acme One', null), row('acme/two', 'Acme Two', null)];
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');
  assert.deepEqual(readJson(frontierFile(root)).metrics[0].leaders, [], 'the previous snapshot has no eligible row at all');

  rows = [row('acme/one', 'Acme One', 50), row('acme/two', 'Acme Two', null)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);

  assert.equal(leadLines(root).length, 0, 'observation began; no lead changed hands, so no line says one did');

  // THE HALF THAT KEEPS THE ZERO FROM BEING AN ENGINE THAT NEVER RAN: the
  // metric is live, the leader is computed, and the row without a value is
  // counted. The absence above is a refusal, not a vacuum.
  const data = readJson(frontierFile(root));
  assert.deepEqual(data.metrics[0].leaders.map((l) => l.row_id), ['acme/one']);
  assert.equal(data.metrics[0].counts.rows_without_value, 1);

  // THE CONTROL, on a second fixture: the same engine, the same metric, a leader
  // on BOTH ends — and it does emit. Without this the new guard could be
  // satisfied by an engine that emits nothing at all.
  let ctrlRows = BASE;
  const ctrlServer = await serve(() => ({ status: 200, body: body(ctrlRows) }));
  const ctrl = frontierRoot(`${ctrlServer.url}/models`);
  t.after(async () => {
    await ctrlServer.close();
    cleanup(ctrl);
  });
  assert.equal((await runPulse(ctrl, ARGS)).status, 0);
  assertIngested(ctrl, ['models'], 'control ingest');
  ctrlRows = [...BASE, row('acme/three', 'Acme Three', 90)];
  assert.equal((await runPulse(ctrl, [...ARGS, '--force'])).status, 0);
  const ctrlLines = leadLines(ctrl);
  assert.equal(ctrlLines.length, 1, 'a lead that genuinely changed hands is still recorded');
  assert.deepEqual(ctrlLines[0].outgoing.map((r) => r.row_id), ['acme/one'], 'and it names what lost the lead');
});

test('the leaders join their entries by the DECLARED feed row id, and a row no entry declares still ranks', async (t) => {
  /*
   * specs/pulse states the join as a SHALL — the ranked rows are "each row
   * joined to its entry by the **declared** feed row id and never by name" — and
   * until this fixture existed no test could see it work: every fixture root is
   * built by `makeRoot`, which creates an EMPTY `content/wiki`, so `entryIdFor`
   * returned null on every row in every case and `entry_id: null` passed the
   * whole suite. A typo in the composite key (`${source.id}\0${rowId}` against
   * feedBindings' `${b.source}\0${b.row_id}`) would have shipped with every gate
   * green and the surface would link nothing. Ledger row 6 one level down: a
   * field produced by code no data could reach.
   */
  let rows = [...BASE, row('acme/three', 'Acme Three', 90)];
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  // ONE entry, declaring ONE row. The negative half rides in the same fixture:
  // `acme/one` and `acme/two` are declared by nobody, so an implementation that
  // matched everything would fail here rather than passing quietly.
  writeEntry(
    root,
    'content/wiki/model/acme-three.md',
    {
      id: 'model/acme-three',
      kind: 'model',
      display_name: 'Acme Three',
      aliases: [],
      feeds: { models: 'acme/three' },
      facts: [],
      mentions: [],
    },
    'A fixture entry that declares which feed row it is about.',
  );

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');

  const metric = readJson(frontierFile(root)).metrics[0];
  assert.deepEqual(metric.leaders.map((l) => l.row_id), ['acme/three']);
  assert.equal(metric.leaders[0].entry_id, 'model/acme-three', 'the leader is joined to the entry that DECLARES its row id');
  const byRow = Object.fromEntries(metric.ranked.map((r) => [r.row_id, r.entry_id]));
  assert.equal(byRow['acme/one'], null, 'a row no entry declares still ranks; it just has no entry');
  assert.equal(byRow['acme/two'], null);

  // AND NEVER BY NAME. The entry's `display_name` matches the row's `name`
  // exactly, so a join that fell back to names would be indistinguishable from
  // the declared one above — this row's name is identical and its ROW ID is not
  // declared anywhere, and it must come back null.
  rows = [...rows, row('acme/nine', 'Acme Three', 10)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);
  const after = readJson(frontierFile(root)).metrics[0];
  const nine = after.ranked.find((r) => r.row_id === 'acme/nine');
  assert.equal(nine.display_name, 'Acme Three', 'the fixture is only interesting if the names collide');
  assert.equal(nine.entry_id, null, 'a matching display name joins nothing: the join is the declared row id');
});

test('a tie is all of the leaders, and the row id decides a link rather than who leads', async (t) => {
  /*
   * specs/pulse: "Ties SHALL all be leaders and the surface SHALL say so; no
   * tie-break invents an order." Both halves were asserted only on the SURFACE
   * (`lib/render/frontier.test.mjs` hands `renderIndexLeaders` a hand-written
   * two-leader array), which proves the renderer prints "tied:" when someone
   * gives it a tie and nothing about whether a tie ever reaches it. No fixture
   * held two rows at the same value, so `leaders: ranked.filter(r => r.value ===
   * best)` could be `ranked.slice(0, 1)` — the row id silently deciding who
   * leads — and the whole suite stayed green.
   */
  let rows = BASE;
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');

  // `acme/two` is marked up to exactly the leader's value: two rows hold the
  // best value and neither overtook the other.
  rows = [row('acme/one', 'Acme One', 50), row('acme/two', 'Acme Two', 50), row('acme/three', 'Acme Three', 20)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);

  const metric = readJson(frontierFile(root)).metrics[0];
  assert.deepEqual(
    metric.leaders.map((l) => l.row_id),
    ['acme/one', 'acme/two'],
    'every row holding the best value is a leader, in row-id order',
  );
  assert.deepEqual([...new Set(metric.leaders.map((l) => l.value))], [50], 'and they are leaders because the value is equal');

  const line = leadLines(root)[0];
  assert.deepEqual(line.incoming.map((r) => r.row_id), ['acme/one', 'acme/two'], 'the whole tie travels in the line');
  assert.equal(
    line.row_id,
    'acme/one',
    'the line`s own row_id is the changed feed`s join key — the first incoming leader by row id, a LINK choice',
  );
  assert.equal(line.incoming.length > 1, true, 'so the row id above cannot be read as the tie-break that picked a winner');
});

test('a metric declaring direction "lower" leads from the other end', async (t) => {
  /*
   * `direction` is validated against a closed set by `pulse/lib/registry.mjs`
   * and its EFFECT was half measured: no fixture anywhere declared `lower`, so
   * `const sign = metric.direction === 'lower' ? 1 : -1` could be `const sign =
   * -1` with the registry gate green and the whole suite green. A latency, a
   * cost-per-task or an error-rate index — the kinds a frontier board would want
   * beside an intelligence index — would have ranked backwards, named the wrong
   * leader, and written lead-change lines about the wrong transitions.
   */
  const lower = { ...METRIC, id: 'fixture-cost', field: 'fixture_cost', label: 'Fixture Cost', direction: 'lower' };
  let rows = BASE;
  const server = await serve(() => ({ status: 200, body: body(rows) }));
  const root = frontierRoot(`${server.url}/models`, { metrics: [lower] });
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');
  const first = readJson(frontierFile(root)).metrics[0];
  assert.equal(first.direction, 'lower');
  assert.deepEqual(first.leaders.map((l) => l.row_id), ['acme/two'], 'the LOWEST value leads — 40, not 50');
  assert.deepEqual(first.ranked.map((r) => r.value), [40, 50], 'and the whole ranking runs the other way');

  // And the lead changes at the other end too: a cheaper row arrives.
  rows = [...BASE, row('acme/three', 'Acme Three', 10)];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);
  const line = leadLines(root)[0];
  assert.equal(line.metric, 'fixture-cost');
  assert.equal(line.cause, 'arrival');
  assert.deepEqual(line.incoming.map((r) => r.row_id), ['acme/three']);
  assert.deepEqual(line.outgoing.map((r) => r.row_id), ['acme/two']);
});

test('with no metric registered the derived file still exists, empty and dated', async (t) => {
  // The day-one state, and the one implementer-ledger row 6 was filed for. The
  // file is written, carries the snapshot's own date, and says "no metrics"
  // rather than being absent — so a surface looks it up and then collapses.
  const server = await serve(() => ({ status: 200, body: body(BASE) }));
  const root = frontierRoot(`${server.url}/models`, { metrics: [] });
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');
  const data = readJson(frontierFile(root));
  assert.deepEqual(data.metrics, [], 'an empty metrics array, never a placeholder string');
  assert.equal(data.snapshot_date, readJson(paths.latest(root, 'models')).date, "and the snapshot's own date");
});

test('a registry with no frontier block at all still writes the file', async (t) => {
  const server = await serve(() => ({ status: 200, body: body(BASE) }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, ['models'], 'first ingest');
  const data = readJson(frontierFile(root));
  assert.deepEqual(data.metrics, []);
  assert.ok(data.snapshot_date, 'the date is computed from the snapshots on disk, not from a clock');
});
