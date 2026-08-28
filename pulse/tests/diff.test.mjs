/**
 * diff.test.mjs — task 3.2: fetch -> snapshot -> hash -> diff -> changed feed.
 *
 * The two checks the task names are the first two here, run against the real
 * `pulse/run.mjs` over a locally served source.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanup, jsonSource, makeRoot, paths, readJson, readLines, runPulse, serve, writeJson } from './helpers.mjs';
import { deriveStatus } from '../lib/diff.mjs';

const ARGS = ['--no-build', '--no-mint'];

function catalogBody(rows) {
  return JSON.stringify({ data: rows });
}

const BASE_ROWS = [
  { id: 'acme/one', name: 'Acme One', pricing: { prompt: '0.000001' }, context_length: 100000, expiration_date: null },
  { id: 'acme/two', name: 'Acme Two', pricing: { prompt: '0.000002' }, context_length: 200000, expiration_date: null },
];

test('an unchanged source produces no new change lines on a second run', async (t) => {
  let rows = BASE_ROWS;
  const server = await serve(() => ({ status: 200, body: catalogBody(rows) }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  const first = await runPulse(root, ARGS);
  assert.equal(first.status, 0, first.out);
  assert.match(first.out, /first-ingest, 2 row\(s\)/);
  assert.equal(readLines(paths.changes(root)).length, 0, 'first ingest establishes the diff base and emits nothing');

  const second = await runPulse(root, [...ARGS, '--force']);
  assert.equal(second.status, 0, second.out);
  assert.match(second.out, /source models — unchanged/);
  assert.equal(readLines(paths.changes(root)).length, 0, 'a second run over an unchanged world appends nothing');
});

test('a hand-edited previous.json price produces exactly one change line naming old and new', async (t) => {
  const server = await serve(() => ({ status: 200, body: catalogBody(BASE_ROWS) }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assert.equal(readLines(paths.changes(root)).length, 0);

  // Hand-edit the diff base, exactly as the task's verification describes.
  const previous = readJson(paths.previous(root, 'models'));
  previous.rows['acme/one'].pricing.prompt = '0.000009';
  writeJson(paths.previous(root, 'models'), previous);

  const run = await runPulse(root, [...ARGS, '--offline']);
  assert.equal(run.status, 0, run.out);
  const lines = readLines(paths.changes(root));
  assert.equal(lines.length, 1, `expected exactly one change line, got ${lines.length}`);
  const line = lines[0];
  assert.equal(line.kind, 'field_change');
  assert.equal(line.row_id, 'acme/one');
  assert.equal(line.field, 'price_input');
  assert.equal(line.old, '0.000009', 'the line names the old value');
  assert.equal(line.new, '0.000001', 'the line names the new value');
  assert.ok(line.date && /^\d{4}-\d{2}-\d{2}$/.test(line.date), 'the line is dated');
  assert.ok(line.source_url, 'the line is sourced');
  assert.ok(line.excerpt && line.excerpt.id === 'acme/one', 'the line embeds its source-row excerpt (the archived source reference)');

  // Idempotent: recomputing the same standing diff appends nothing.
  const again = await runPulse(root, [...ARGS, '--offline']);
  assert.equal(again.status, 0);
  assert.equal(readLines(paths.changes(root)).length, 1, 're-running appends no duplicate');
});

test('arrivals and retirements are material; a rolling-window source emits neither on removal', async (t) => {
  let rows = [...BASE_ROWS];
  const server = await serve(() => ({ status: 200, body: catalogBody(rows) }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);

  rows = [...BASE_ROWS, { id: 'acme/three', name: 'Acme Three', pricing: { prompt: '0.000003' }, context_length: 300000, expiration_date: null }];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);
  let lines = readLines(paths.changes(root));
  assert.equal(lines.length, 1);
  assert.equal(lines[0].kind, 'arrival');
  assert.equal(lines[0].row_id, 'acme/three');

  rows = [BASE_ROWS[0]];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);
  lines = readLines(paths.changes(root));
  const retirements = lines.filter((l) => l.kind === 'retirement').map((l) => l.row_id).sort();
  assert.deepEqual(retirements, ['acme/three', 'acme/two']);
});

test('a rolling-window source does not report a rolled-off row as a retirement', async (t) => {
  // emit_on_remove: false is why the release feed's window sliding is not
  // mistaken for a model being retired.
  let rows = [...BASE_ROWS];
  const server = await serve(() => ({ status: 200, body: catalogBody(rows) }));
  const root = makeRoot([jsonSource('feed', `${server.url}/feed`, { emit_on_remove: false, rolling_window: true })]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  rows = [BASE_ROWS[0]];
  assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);
  assert.equal(readLines(paths.changes(root)).filter((l) => l.kind === 'retirement').length, 0);
});

test('derived status treats a far-future sentinel expiry as active, not deprecated', () => {
  const source = { status_rule: { kind: 'expiration_date', path: 'expiration_date', deprecated_within_days: 365 } };
  assert.equal(deriveStatus(source, { expiration_date: null }), 'active');
  assert.equal(deriveStatus(source, { expiration_date: '2098-12-31' }), 'active', 'the sentinel OpenRouter serves must not fire a false deprecation');
  assert.equal(deriveStatus(source, { expiration_date: '2020-01-01' }), 'retired');
  assert.equal(deriveStatus(source, { expiration_date: '2026-09-30' }), 'deprecated');
});

test('the catalog row matches the raw snapshot value it came from', async (t) => {
  const server = await serve(() => ({ status: 200, body: catalogBody(BASE_ROWS) }));
  const root = makeRoot([jsonSource('models', `${server.url}/models`)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  const catalog = readJson(paths.catalog(root));
  const row = catalog.rows.find((r) => r.row_id === 'acme/two');
  const snapshot = readJson(paths.latest(root, 'models'));
  assert.equal(row.price_input, snapshot.rows['acme/two'].pricing.prompt);
  assert.equal(row.context_window, String(snapshot.rows['acme/two'].context_length));
  assert.equal(row.provider, 'acme');
  assert.equal(row.status, 'active');
});
