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
  // the row hashes — must not acquire a seeded twin for the same event.
  const fresh = makeRepo(HISTORY);
  t.after(() => rmSync(fresh, { recursive: true, force: true }));
  writeFileSync(
    join(fresh, 'data', 'changes.jsonl'),
    JSON.stringify({
      key: 'models|aaaa|bbbb|fixture-index|lead-change',
      date: '2026-09-03',
      kind: 'lead-change',
      metric: 'fixture-index',
      source: 'models',
      row_id: 'acme/three',
      cause: 'arrival',
    }) + '\n',
  );
  seedFrontierHistory(fresh, { write: () => {} });
  const leads = lines(fresh).filter((l) => l.kind === 'lead-change');
  assert.deepEqual(
    leads.map((l) => `${l.date}${l.seeded ? ' seeded' : ' observed'}`),
    ['2026-09-03 observed', '2026-09-04 seeded'],
    'the observed event keeps its own line; only the day it does not cover is seeded',
  );
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
