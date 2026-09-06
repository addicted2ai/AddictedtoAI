/**
 * seed-frontier-history.test.mjs — the one-time backfill, proved on a THROWAWAY
 * git repository under the OS temp directory (`separate-a-claim-from-a-fact`
 * task 25; the test convention in CLAUDE.md — "tests build throwaway
 * repositories under the OS temp directory and never touch this one").
 *
 * The fixture commits a real sequence of `latest.json` blobs, so the script is
 * measured doing the only thing it exists to do: read committed git history back
 * out through `execFileSync('git', [...])` and recover the lead changes in it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { seedFrontierHistory, committedSnapshots } from './seed-frontier-history.mjs';
import { loadRegistry } from '../pulse/lib/registry.mjs';
import { computeFrontier } from '../pulse/lib/frontier.mjs';

const METRIC = {
  id: 'fixture-index',
  field: 'fixture_index',
  path: 'benchmarks.idx',
  source: 'models',
  publisher: 'Fixture Analysis',
  publisher_url: 'https://fixture.invalid/',
  republisher: null,
  direction: 'higher',
  label: 'Fixture Index',
  rights: { terms_url: 'https://fixture.invalid/terms', checked_on: '2026-09-06', outcome: 'unresolved' },
};

const SOURCE = {
  id: 'models',
  url: 'https://fixture.invalid/models',
  format: 'json',
  rows_path: 'data',
  row_id_field: 'id',
  display_name_field: 'name',
  fetch_every_days: 1,
  expected_change_days: 3,
  material_fields: [{ field: 'idx', path: 'benchmarks.idx' }],
  robots: { checked_on: '2026-09-06', result: 'allowed' },
  verification: { date: '2026-09-06', result: 'live' },
};

const row = (id, name, idx) => (idx === null ? { id, name } : { id, name, benchmarks: { idx } });
const snapshot = (date, rows) => ({
  source: 'models',
  url: SOURCE.url,
  date,
  body_hash: date,
  row_count: rows.length,
  rows: Object.fromEntries(rows.map((r) => [r.id, r])),
});

function git(root, args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' });
}

/** A throwaway repository with the registry committed and one commit per snapshot. */
function makeRepo(history, { metrics = [METRIC] } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'seed-frontier-'));
  mkdirSync(join(root, 'data', 'sources', 'models'), { recursive: true });
  git(root, ['init', '-q']);
  git(root, ['config', 'core.autocrlf', 'false']); // fixture bytes are the bytes; no line-ending warnings
  git(root, ['config', 'user.name', 'fixture']);
  git(root, ['config', 'user.email', 'fixture@example.invalid']);
  writeFileSync(
    join(root, 'data', 'sources', 'registry.json'),
    JSON.stringify({ version: 1, verified_on: '2026-09-06', sources: [SOURCE], frontier: { metrics, row_exclusions: [] } }, null, 2) + '\n',
  );
  git(root, ['add', '-A']);
  git(root, ['commit', '-q', '-m', 'registry']);
  for (const snap of history) {
    writeFileSync(join(root, 'data', 'sources', 'models', 'latest.json'), JSON.stringify(snap, null, 2) + '\n');
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', `snapshot ${snap.date}`]);
  }
  return root;
}

const HISTORY = [
  snapshot('2026-09-01', [row('acme/one', 'Acme One', 50), row('acme/two', 'Acme Two', 40)]),
  snapshot('2026-09-02', [row('acme/one', 'Acme One', 50), row('acme/two', 'Acme Two', 40)]),
  // A new row arrives and takes the lead.
  snapshot('2026-09-03', [row('acme/one', 'Acme One', 50), row('acme/two', 'Acme Two', 40), row('acme/three', 'Acme Three', 90)]),
  // The leader is marked down and loses the lead without anything shipping.
  snapshot('2026-09-04', [row('acme/one', 'Acme One', 50), row('acme/two', 'Acme Two', 40), row('acme/three', 'Acme Three', 20)]),
];

function lines(root) {
  const file = join(root, 'data', 'changes.jsonl');
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  return text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}

test('the replay recovers the lead changes in committed history, each marked seeded', (t) => {
  const root = makeRepo(HISTORY);
  t.after(() => rmSync(root, { recursive: true, force: true }));

  // Read back through git plumbing, not off the working tree: this is the half
  // that silently returns zero bytes when a shell mangles `rev:path`.
  assert.deepEqual(
    committedSnapshots(root, 'models').map((s) => s.date),
    ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04'],
  );

  const said = [];
  seedFrontierHistory(root, { write: (s) => said.push(s) });
  const written = lines(root);
  assert.match(said.join(''), /3 candidate\(s\), 3 appended/);

  const leads = written.filter((l) => l.kind === 'lead-change');
  assert.equal(leads.length, 2, 'two lead changes in four days; the unchanged pair produced nothing');
  assert.deepEqual(leads.map((l) => l.date), ['2026-09-03', '2026-09-04']);
  assert.deepEqual(leads.map((l) => l.cause), ['arrival', 'rescored']);
  for (const l of leads) {
    assert.equal(l.seeded, true, 'a seeded line is distinguishable from an observed one');
    assert.equal(l.metric, 'fixture-index');
    assert.match(l.key, /^seed\|frontier\|fixture-index\|2026-09-0\d\|lead-change$/, 'the key is derived from the snapshot date');
    assert.ok(l.excerpt.rows[l.row_id], 'the archived source reference travels with it');
    assert.ok(l.excerpt.from_commit && l.excerpt.to_commit, 'and names the two commits it was replayed from');
  }
  assert.deepEqual(leads[1].incoming.map((r) => r.row_id), ['acme/one'], 'a rescoring hands the lead back without anything shipping');
});

test('the baseline says observation began here, and never that a lead changed', (t) => {
  const root = makeRepo(HISTORY);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  seedFrontierHistory(root, { write: () => {} });

  const baselines = lines(root).filter((l) => l.baseline);
  assert.equal(baselines.length, 1, 'one baseline per metric');
  const b = baselines[0];
  assert.equal(b.date, '2026-09-01', 'the earliest committed snapshot');
  assert.equal(b.kind, 'annotation', 'not a lead-change: nothing changed on that date');
  assert.equal(b.annotates, undefined, 'and it attaches to no change, so it is never an event on the feed');
  assert.equal(b.seeded, true);
  assert.match(b.text, /Observation of Fixture Index begins here/);
  assert.match(b.text, /Nothing became the leader on this date/);
});

test('a second run appends nothing, and an observed line is never duplicated', (t) => {
  const root = makeRepo(HISTORY);
  t.after(() => rmSync(root, { recursive: true, force: true }));

  seedFrontierHistory(root, { write: () => {} });
  const first = lines(root);
  const said = [];
  seedFrontierHistory(root, { write: (s) => said.push(s) });
  assert.deepEqual(lines(root), first, 'idempotent: the same replay recomputes the same keys');
  assert.match(said.join(''), /3 candidate\(s\), 0 appended, 3 already present/);

  // An OBSERVED line — written by the engine from the standing diff, keyed on
  // the row hashes — must not acquire a seeded twin for the SAME EVENT. The
  // line carries `incoming` and `outgoing` because every line the engine writes
  // does, and because those are half the predicate: the guard matches the event,
  // not the metric and the date.
  const observedLine = {
    key: 'models|aaaa|bbbb|fixture-index|lead-change',
    date: '2026-09-03',
    kind: 'lead-change',
    metric: 'fixture-index',
    source: 'models',
    row_id: 'acme/three',
    cause: 'arrival',
    incoming: [{ row_id: 'acme/three', display_name: 'Acme Three', value: 90 }],
    outgoing: [{ row_id: 'acme/one', display_name: 'Acme One', value: 50 }],
  };
  const fresh = makeRepo(HISTORY);
  t.after(() => rmSync(fresh, { recursive: true, force: true }));
  writeFileSync(join(fresh, 'data', 'changes.jsonl'), JSON.stringify(observedLine) + '\n');
  seedFrontierHistory(fresh, { write: () => {} });
  const leads = lines(fresh).filter((l) => l.kind === 'lead-change');
  assert.deepEqual(
    leads.map((l) => `${l.date}${l.seeded ? ' seeded' : ' observed'}`),
    ['2026-09-03 observed', '2026-09-04 seeded'],
    'the observed event keeps its own line; only the day it does not cover is seeded',
  );
});

test('a DIFFERENT event on a date the observed history already touches is still seeded', (t) => {
  /*
   * THE OTHER HALF OF ONE PREDICATE. The two ends of this duplicate guard used
   * to disagree: `computeFrontier` matched the whole EVENT — metric, date,
   * incoming leaders, outgoing leaders — and the seeder matched metric + date
   * alone, dropping any seeded candidate on a date an observed line touched at
   * all. That is exactly the predicate `pulse/lib/frontier.mjs` argues against
   * in its own header and `pulse/tests/frontier.test.mjs` has a case for ("two
   * lead changes on the same date get two keys"), because it suppresses a
   * GENUINE second lead change on the same metric on the same day.
   *
   * It was safe only by accident of shape — the dated replay keeps one blob per
   * date and cannot produce two same-date events itself — but the OTHER side of
   * the comparison is observed history, which can: the engine sees an intra-day
   * pair the replay collapses away. This is that case. `true by the incidental
   * shape of a filter` is what this change refuses elsewhere; it is refused here
   * too.
   */
  const root = makeRepo(HISTORY);
  t.after(() => rmSync(root, { recursive: true, force: true }));

  // An observed line on 2026-09-03 about a DIFFERENT pair of rows — an
  // intra-day change the dated replay cannot see, because only the last blob of
  // the day survives into `committedSnapshots`.
  writeFileSync(
    join(root, 'data', 'changes.jsonl'),
    JSON.stringify({
      key: 'models|aaaa|bbbb|fixture-index|lead-change',
      date: '2026-09-03',
      kind: 'lead-change',
      metric: 'fixture-index',
      source: 'models',
      row_id: 'acme/two',
      cause: 'rescored',
      incoming: [{ row_id: 'acme/two', display_name: 'Acme Two', value: 60 }],
      outgoing: [{ row_id: 'acme/one', display_name: 'Acme One', value: 50 }],
    }) + '\n',
  );
  seedFrontierHistory(root, { write: () => {} });

  const onThatDay = lines(root).filter((l) => l.kind === 'lead-change' && l.date === '2026-09-03');
  assert.equal(onThatDay.length, 2, 'two distinct events on one date, both recorded');
  assert.deepEqual(
    onThatDay.map((l) => `${l.seeded ? 'seeded' : 'observed'} ${l.incoming[0].row_id}`),
    ['observed acme/two', 'seeded acme/three'],
    'the seeded line records the event the observed one does not, rather than being dropped for sharing its date',
  );
});

test('the engine does not re-record an event a seeded line already carries — the mirror guard', (t) => {
  // THE OTHER DIRECTION, and the one that actually fires. `observedDates` above
  // stops a seeded line landing beside an observed one. Nothing stopped the
  // reverse: this script's newest recovered line comes from the two newest
  // committed blobs, which are exactly the `previous.json`/`latest.json` pair the
  // Pulse re-diffs on its very next run — so seeding and then running the Pulse
  // wrote one event twice, under two keys, one of them marked "seeded from the
  // archive" on the strip. Moot while no metric is registered, which is why it
  // would not have been noticed until it shipped.
  const root = makeRepo(HISTORY);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  seedFrontierHistory(root, { write: () => {} });

  // The state the Pulse would be in immediately after seeding: the newest
  // committed pair sitting on disk as previous/latest.
  const dir = join(root, 'data', 'sources', 'models');
  writeFileSync(join(dir, 'previous.json'), JSON.stringify(HISTORY[2], null, 2) + '\n');
  writeFileSync(join(dir, 'latest.json'), JSON.stringify(HISTORY[3], null, 2) + '\n');

  const registry = loadRegistry(root);
  const { candidates } = computeFrontier(root, registry, { entries: [] }, { write: false });
  assert.deepEqual(candidates, [], 'the seeded line already records this event; one event, one line');

  // THE CONTROL, without which the assertion above would pass on an engine that
  // never produces a candidate at all. A pair the seeder never saw is recorded.
  const next = snapshot('2026-09-05', [
    row('acme/one', 'Acme One', 50),
    row('acme/two', 'Acme Two', 99),
    row('acme/three', 'Acme Three', 20),
  ]);
  writeFileSync(join(dir, 'previous.json'), JSON.stringify(HISTORY[3], null, 2) + '\n');
  writeFileSync(join(dir, 'latest.json'), JSON.stringify(next, null, 2) + '\n');
  const fresh = computeFrontier(root, registry, { entries: [] }, { write: false }).candidates;
  assert.equal(fresh.length, 1, 'an event no seeded line covers is still recorded');
  assert.deepEqual(fresh[0].incoming.map((r) => r.row_id), ['acme/two']);
  assert.equal(fresh[0].seeded, undefined, 'and it is an observed line, not a seeded one');
});

test('a day the metric had no leader on is not replayed as a lead change', (t) => {
  /*
   * The seeder's half of the same guard `computeFrontier` carries. `before ===
   * after` catches empty against empty and NOT empty against non-empty, so a
   * replay whose earlier blob carried no eligible row would have recovered a
   * "lead change" — with `outgoing: []` — for a day on which observation merely
   * began. `data/changes.jsonl` is append-only, so a seeded line saying that
   * could never be taken back. The baseline annotation is the one line entitled
   * to say "observation began here", and it says it about the first blob only.
   */
  const late = [
    snapshot('2026-09-01', [row('acme/one', 'Acme One', null), row('acme/two', 'Acme Two', null)]),
    snapshot('2026-09-02', [row('acme/one', 'Acme One', 50), row('acme/two', 'Acme Two', 40)]),
    // The control, in the same replay: a day on which the lead genuinely changed
    // hands still produces a line, so the zero above is a refusal and not a
    // seeder that recovered nothing.
    snapshot('2026-09-03', [row('acme/one', 'Acme One', 50), row('acme/two', 'Acme Two', 40), row('acme/three', 'Acme Three', 90)]),
  ];
  const root = makeRepo(late);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  seedFrontierHistory(root, { write: () => {} });

  const leads = lines(root).filter((l) => l.kind === 'lead-change');
  assert.deepEqual(leads.map((l) => l.date), ['2026-09-03'], 'the day the index first carried a value changed no lead');
  assert.deepEqual(leads[0].outgoing.map((r) => r.row_id), ['acme/one'], 'and the line that IS written names what lost the lead');
  const baselines = lines(root).filter((l) => l.baseline);
  assert.deepEqual(baselines.map((l) => l.date), ['2026-09-01'], 'the earliest blob is where observation began, and it says so');
});

test('--dry-run writes nothing, and no declared metric seeds nothing', (t) => {
  const root = makeRepo(HISTORY);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const said = [];
  seedFrontierHistory(root, { dryRun: true, write: (s) => said.push(s) });
  assert.equal(lines(root).length, 0, 'a dry run appends nothing');
  assert.match(said.join(''), /would append seed\|frontier\|fixture-index\|baseline/);

  const bare = makeRepo(HISTORY, { metrics: [] });
  t.after(() => rmSync(bare, { recursive: true, force: true }));
  const quiet = [];
  seedFrontierHistory(bare, { write: (s) => quiet.push(s) });
  assert.match(quiet.join(''), /nothing to seed/);
  assert.equal(lines(bare).length, 0, 'with no metric registered there is no history to recover — today\'s state');
});
