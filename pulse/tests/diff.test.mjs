/**
 * diff.test.mjs — task 3.2: fetch -> snapshot -> hash -> diff -> changed feed.
 *
 * The two checks the task names are the first two here, run against the real
 * `pulse/run.mjs` over a locally served source.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanup, jsonSource, makeRoot, paths, readJson, readLines, runPulse, serve, writeJson } from './helpers.mjs';
import { deriveStatus, isScheduled } from '../lib/diff.mjs';

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

// ── addictedtoai-8ho: a material field is a column, a fact, and maybe an event ──

/** The registry's clock-window rule, as `openrouter-models` declares it. */
const SCHEDULE_RULE = {
  kind: 'utc_windows',
  path: 'pricing.overrides',
  window_keys: ['utc_start', 'utc_end', 'utc_days'],
  governs: ['price_input'],
};

/**
 * Three rows that differ only in what their `pricing.overrides` array holds:
 * nothing, a clock schedule, and a long-context tier. Only the middle one is a
 * value whose reading depends on the time of day.
 */
const OVERRIDE_ROWS = [
  { id: 'acme/plain', name: 'Acme Plain', pricing: { prompt: '0.000001' }, context_length: 100000, expiration_date: null },
  {
    id: 'acme/clock',
    name: 'Acme Clock',
    pricing: {
      prompt: '0.000002',
      overrides: [
        { prompt: '0.000002', utc_start: 0, utc_end: 1600 },
        { prompt: '0.00000125', utc_start: 1600, utc_end: 0 },
      ],
    },
    context_length: 200000,
    expiration_date: null,
  },
  {
    id: 'acme/tiered',
    name: 'Acme Tiered',
    pricing: { prompt: '0.000003', overrides: [{ prompt: '0.000006', min_prompt_tokens: 200000 }] },
    context_length: 300000,
    expiration_date: null,
  },
];

test('a field marked event:false keeps its catalog column and stops producing feed lines', async (t) => {
  // The control and the fix over identical worlds, so the only difference
  // measured is the flag. The trap this guards is deleting the field instead:
  // pulse/lib/derive.mjs builds catalog rows *from* material_fields.
  const control = await serve(() => ({ status: 200, body: catalogBody(BASE_ROWS) }));
  const fixed = await serve(() => ({ status: 200, body: catalogBody(BASE_ROWS) }));
  const controlRoot = makeRoot([jsonSource('models', `${control.url}/models`)]);
  const fixedRoot = makeRoot([
    jsonSource('models', `${fixed.url}/models`, {
      material_fields: [
        { field: 'price_input', path: 'pricing.prompt', event: false },
        { field: 'context_window', path: 'context_length' },
        { field: 'status', path: '$status' },
      ],
    }),
  ]);
  t.after(async () => {
    await control.close();
    await fixed.close();
    cleanup(controlRoot);
    cleanup(fixedRoot);
  });

  for (const root of [controlRoot, fixedRoot]) {
    assert.equal((await runPulse(root, ARGS)).status, 0);
    const previous = readJson(paths.previous(root, 'models'));
    previous.rows['acme/one'].pricing.prompt = '0.000009';
    writeJson(paths.previous(root, 'models'), previous);
    assert.equal((await runPulse(root, [...ARGS, '--offline'])).status, 0);
  }

  const before = readLines(paths.changes(controlRoot));
  assert.equal(before.length, 1, 'without the flag the price movement is a feed line');
  assert.equal(before[0].field, 'price_input');

  assert.deepEqual(readLines(paths.changes(fixedRoot)), [], 'with event:false it is not');

  // ...and the column is still there, byte for byte, which is the whole point.
  const row = readJson(paths.catalog(fixedRoot)).rows.find((r) => r.row_id === 'acme/one');
  const snapshot = readJson(paths.latest(fixedRoot, 'models'));
  assert.equal(row.price_input, snapshot.rows['acme/one'].pricing.prompt, 'the catalog price column survives');
  assert.equal(row.price_input, '0.000001');
  assert.equal(row.context_window, '100000', 'an unflagged field is unaffected');
});

test('a clock-scheduled price produces no change line, while a tiered one still does', async (t) => {
  // tencent/hy3 posts one rate for 00:00-16:00 UTC and another for 16:00-00:00;
  // a fetch either side of 16:00 reads the same price sheet twice. A
  // min_prompt_tokens tier does not move with the clock and is not suppressed.
  const server = await serve(() => ({ status: 200, body: catalogBody(OVERRIDE_ROWS) }));
  const root = makeRoot([
    jsonSource('models', `${server.url}/models`, { schedule_rule: SCHEDULE_RULE }),
  ]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);

  // Move every row's price, so the only reason a row is missing is suppression.
  const previous = readJson(paths.previous(root, 'models'));
  for (const id of ['acme/plain', 'acme/clock', 'acme/tiered']) {
    previous.rows[id].pricing.prompt = '0.000009';
  }
  writeJson(paths.previous(root, 'models'), previous);

  const run = await runPulse(root, [...ARGS, '--offline']);
  assert.equal(run.status, 0, run.out);
  const priced = readLines(paths.changes(root)).filter((l) => l.field === 'price_input');
  assert.deepEqual(
    priced.map((l) => l.row_id).sort(),
    ['acme/plain', 'acme/tiered'],
    'the clock-windowed row is suppressed; the long-context tier is not',
  );

  // All three rows keep their catalog price regardless.
  const rows = readJson(paths.catalog(root)).rows;
  assert.deepEqual(
    rows.map((r) => [r.row_id, r.price_input]),
    [['acme/clock', '0.000002'], ['acme/plain', '0.000001'], ['acme/tiered', '0.000003']],
  );
});

test('isScheduled fires on either side of a comparison, and only on governed fields', () => {
  const source = { schedule_rule: SCHEDULE_RULE };
  const clock = OVERRIDE_ROWS[1];
  const tiered = OVERRIDE_ROWS[2];
  const plain = OVERRIDE_ROWS[0];
  const price = { field: 'price_input', path: 'pricing.prompt' };
  const context = { field: 'context_window', path: 'context_length' };

  assert.equal(isScheduled(source, clock, price), true);
  assert.equal(isScheduled(source, tiered, price), false, 'min_prompt_tokens is not a clock window');
  assert.equal(isScheduled(source, plain, price), false);
  assert.equal(isScheduled(source, clock, context), false, 'the rule governs only the fields it names');
  assert.equal(isScheduled({}, clock, price), false, 'no rule, no suppression');
  assert.equal(isScheduled(source, null, price), false, 'a row that does not exist is not scheduled');
  assert.equal(
    isScheduled(source, { pricing: { prompt: '1', overrides: [{ prompt: '2', utc_days: [0, 6] }] } }, price),
    true,
    'utc_days alone is a window',
  );
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
