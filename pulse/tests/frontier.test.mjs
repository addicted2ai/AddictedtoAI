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
  assert.equal(data.metrics[0].counts.rows_excluded, 2);
  assert.equal(leadLines(root).length, 1, 'and no second lead change was recorded');
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
