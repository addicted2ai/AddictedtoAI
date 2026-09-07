/**
 * diff.test.mjs — task 3.2: fetch -> snapshot -> hash -> diff -> changed feed.
 *
 * The two checks the task names are the first two here, run against the real
 * `pulse/run.mjs` over a locally served source.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertIngested, cleanup, jsonSource, makeRoot, paths, readJson, readLines, runPulse, serve, writeJson } from './helpers.mjs';
import { appendChanges, deriveStatus, diffSnapshots, isScheduled, substitutionSuccessors, VENDOR_BOUND } from '../lib/diff.mjs';

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
    assertIngested(root, 'models', 'first run, before the price is moved');
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
  assertIngested(root, 'models', 'first run, before every price is moved');

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

// ── a departure the publisher replaced is not a retirement ──────────────────

/** The registry's substitution rule, as `openrouter-models` declares it. */
const SUBSTITUTION_RULE = {
  kind: 'dated_slug_stem',
  path: 'canonical_slug',
  variant_separator: ':',
};

function row(id, canonical_slug, name = id) {
  return { id, name, canonical_slug, pricing: { prompt: '0.000001' }, context_length: 100000, expiration_date: null };
}

/**
 * The 2026-09-05 fetch pair, in miniature. `acme/max` is the Qwen case — its
 * name moves onto a newer snapshot, which arrives in the same fetch — and
 * `acme/gone` is the Granite case, a withdrawal with no successor anywhere.
 */
const BEFORE_DEPARTURE = [row('acme/max', 'acme/max-20260803'), row('acme/gone', 'acme/gone-20260429')];
const AFTER_DEPARTURE = [row('acme/max-0902', 'acme/max-20260902', 'Acme Max (0902)')];

test('a replaced row reports a substitution naming its successor; a withdrawn one still retires', async (t) => {
  // The control and the fix over identical worlds, so the only difference
  // measured is the registry rule. The control IS the behaviour before this
  // change: with no `substitution_rule` the departure loop is byte-for-byte
  // what it was, which is the case the proposal says must not move.
  let rows = [...BEFORE_DEPARTURE];
  const control = await serve(() => ({ status: 200, body: catalogBody(rows) }));
  const fixed = await serve(() => ({ status: 200, body: catalogBody(rows) }));
  const controlRoot = makeRoot([jsonSource('models', `${control.url}/models`)]);
  const fixedRoot = makeRoot([
    jsonSource('models', `${fixed.url}/models`, { substitution_rule: SUBSTITUTION_RULE }),
  ]);
  t.after(async () => {
    await control.close();
    await fixed.close();
    cleanup(controlRoot);
    cleanup(fixedRoot);
  });

  for (const root of [controlRoot, fixedRoot]) {
    assert.equal((await runPulse(root, ARGS)).status, 0);
    assertIngested(root, 'models', 'first run, before the name is moved');
  }
  rows = [...AFTER_DEPARTURE];
  for (const root of [controlRoot, fixedRoot]) {
    assert.equal((await runPulse(root, [...ARGS, '--force'])).status, 0);
    assertIngested(root, 'models', 'second run, after the name is moved');
  }

  const before = readLines(paths.changes(controlRoot)).filter((l) => l.row_id === 'acme/max');
  assert.equal(before.length, 1);
  assert.equal(before[0].kind, 'retirement', 'without the rule a replaced row is recorded as retired');

  const after = readLines(paths.changes(fixedRoot));
  const replaced = after.find((l) => l.row_id === 'acme/max');
  assert.equal(replaced.kind, 'substitution', 'with the rule it is recorded as the substitution it was');
  assert.deepEqual(
    replaced.successors,
    [{ row_id: 'acme/max-0902', display_name: 'Acme Max (0902)' }],
    'and it hands on the arriving row id, which is what lets a surface say what the name now points at',
  );

  // The case that must not move, measured in the same run rather than argued.
  const withdrawn = after.find((l) => l.row_id === 'acme/gone');
  assert.equal(withdrawn.kind, 'retirement', 'a departure with no same-stem arrival is unchanged');
  assert.equal(withdrawn.successors, undefined, 'and carries no successors key at all');
  // Identical to the control's line in everything but the fixture's own port,
  // which is the only thing that differs between the two roots.
  const shape = (l) => ({ ...l, source_url: null });
  assert.deepEqual(
    shape(withdrawn),
    shape(readLines(paths.changes(controlRoot)).find((l) => l.row_id === 'acme/gone')),
    'the withdrawal line is byte-for-byte what the source without the rule wrote',
  );

  // The arrival is still an arrival: this change adds a word for the departure
  // and takes nothing away from the other half of the publisher's act.
  const arrival = after.find((l) => l.row_id === 'acme/max-0902');
  assert.equal(arrival.kind, 'arrival');
});

test('one departure is one key, so reclassifying it cannot record it twice', async (t) => {
  /*
   * THE GUARD RAIL, TESTED BY ATTEMPTING WHAT IT FORBIDS. `changes.jsonl` is
   * append-only history and the standing diff between `previous` and `latest`
   * is recomputed on every run. If a substitution keyed differently from a
   * retirement, a departure standing at the moment this change landed would
   * be appended a SECOND time under the new word — two lines, both on the home
   * feed, about one row leaving once. The key is a function of state and one
   * departure is one state change, so both kinds carry the same marker.
   */
  const previous = { rows: { 'acme/max': row('acme/max', 'acme/max-20260803') } };
  const latest = { rows: { 'acme/max-0902': row('acme/max-0902', 'acme/max-20260902') } };
  const source = jsonSource('models', 'http://example.invalid/models');
  const withRule = { ...source, substitution_rule: SUBSTITUTION_RULE };

  const asRetirement = diffSnapshots(source, previous, latest, { date: '2026-09-05' });
  const asSubstitution = diffSnapshots(withRule, previous, latest, { date: '2026-09-07' });
  const departure = (lines) => lines.find((l) => l.row_id === 'acme/max');
  assert.equal(departure(asRetirement).kind, 'retirement');
  assert.equal(departure(asSubstitution).kind, 'substitution');
  assert.equal(
    departure(asSubstitution).key,
    departure(asRetirement).key,
    'the classification changes the word, never the identity of the event',
  );

  const dir = mkdtempSync(join(tmpdir(), 'diff-substitution-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'changes.jsonl');
  assert.equal(appendChanges(file, asRetirement).length, 2, 'the departure and the arrival land once');
  assert.deepEqual(
    appendChanges(file, asSubstitution),
    [],
    'and recomputing the same standing diff under the new word appends nothing at all',
  );
  assert.equal(readLines(file).length, 2, 'one row leaving once is one line, whatever it is called');
});

test('substitutionSuccessors pairs only what the two snapshots actually show', () => {
  const source = { ...jsonSource('models', 'http://example.invalid/models'), substitution_rule: SUBSTITUTION_RULE };
  const departed = row('acme/max', 'acme/max-20260803');
  const successor = row('acme/max-0902', 'acme/max-20260902', 'Acme Max (0902)');
  const call = (src, id, dep, arrivals) => substitutionSuccessors(src, id, dep, arrivals);

  assert.deepEqual(
    call(source, 'acme/max', departed, [['acme/max-0902', successor]]),
    [{ row_id: 'acme/max-0902', display_name: 'Acme Max (0902)' }],
  );
  assert.deepEqual(
    call({ ...source, substitution_rule: undefined }, 'acme/max', departed, [['acme/max-0902', successor]]),
    [],
    'no rule, no pairing — a source that never declared one behaves exactly as before',
  );
  assert.deepEqual(
    call(source, 'acme/max', departed, [['acme/other-0902', row('acme/other-0902', 'acme/other-20260902')]]),
    [],
    'a different stem is a different name and pairs with nothing',
  );
  assert.deepEqual(
    call(source, 'acme/max', row('acme/max', 'acme/max'), [['acme/max-0902', successor]]),
    [],
    'an undated departing slug has no stem to share, and is left as the withdrawal it reads as',
  );
  assert.deepEqual(
    call(source, 'acme/max', departed, [['acme/max-next', row('acme/max-next', 'acme/max')]]),
    [{ row_id: 'acme/max-next', display_name: 'acme/max-next' }],
    'an ARRIVING slug need not be dated: moving a dated name onto a bare one is the same publisher act',
  );

  // The version-number tail, which is why only eight digits count. Folding
  // `-3` away would make a departing `medium-3` pair with an arriving
  // `medium-4` and invent a substitution out of a version bump.
  assert.deepEqual(
    call(source, 'acme/medium-3', row('acme/medium-3', 'acme/medium-3'), [
      ['acme/medium-4', row('acme/medium-4', 'acme/medium-4')],
    ]),
    [],
  );
  // ...and the four-digit tail, on real shapes from the live snapshot.
  assert.deepEqual(
    call(source, 'deepseek/deepseek-chat-v3-0324', row('deepseek/deepseek-chat-v3-0324', 'deepseek/deepseek-chat-v3-0324'), [
      ['deepseek/deepseek-chat-v3-0512', row('deepseek/deepseek-chat-v3-0512', 'deepseek/deepseek-chat-v3-0512')],
    ]),
    [],
    'MMDD tails and version numbers are indistinguishable in the string, so neither is stripped',
  );

  // The variant, measured on the live snapshot: 78 canonical slugs are shared
  // by a base row and its `:batch` sibling, byte for byte. Without the scoping
  // each departure would pair with both arrivals.
  const arrivals = [
    ['acme/max-0902', successor],
    ['acme/max-0902:batch', row('acme/max-0902:batch', 'acme/max-20260902', 'Acme Max (0902) batch')],
  ];
  assert.deepEqual(
    call(source, 'acme/max', departed, arrivals).map((s) => s.row_id),
    ['acme/max-0902'],
    'a departing base row pairs with the arriving base row only',
  );
  assert.deepEqual(
    call(source, 'acme/max:batch', row('acme/max:batch', 'acme/max-20260803'), arrivals).map((s) => s.row_id),
    ['acme/max-0902:batch'],
    'and a departing batch row with the arriving batch row',
  );
  assert.deepEqual(
    call({ ...source, substitution_rule: { ...SUBSTITUTION_RULE, variant_separator: undefined } }, 'acme/max', departed, arrivals)
      .map((s) => s.row_id),
    ['acme/max-0902', 'acme/max-0902:batch'],
    'without a declared separator nothing is scoped, and every same-stem arrival is named — sorted, never picked between',
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

/*
 * ── The price event, keyed to the vendor-posted rate ─────────────────────────
 *
 * Change `bind-a-price-to-the-vendor-that-posts-it`, tasks 15 and 16.
 * specs/pulse: "A price event SHALL NOT be derived from the top-provider
 * headline, at any threshold. No percentage threshold SHALL be used to decide
 * whether a price movement is an event."
 *
 * The first two assertions below are the threshold proof, and they are a proof
 * because ANY threshold implementation fails at least one of them: a 2% move in
 * a rate a named vendor posts is news, and a 60% move in the top-provider
 * headline is a routing artifact. The measured failures are a 60% scheduled-
 * window flip and a 14.7x routing flip, both of which clear any threshold anyone
 * would set, against a genuine 2% repricing, which none of them would pass.
 */

const VENDOR_ROWS = [
  { id: 'acme/moved', name: 'Acme Moved', canonical_slug: 'k-moved', pricing: { prompt: '0.000001' } },
  { id: 'acme/flat', name: 'Acme Flat', canonical_slug: 'k-flat', pricing: { prompt: '0.000002' } },
  { id: 'acme/none', name: 'Acme None', canonical_slug: 'k-none', pricing: { prompt: '0.000003' } },
];

function vendorSource(url) {
  return {
    id: 'models',
    url: `${url}/models`,
    format: 'json',
    rows_path: 'data',
    row_id_field: 'id',
    display_name_field: 'name',
    yields: ['id', 'name', 'pricing.prompt', 'canonical_slug'],
    fetch_every_days: 1,
    expected_change_days: 3,
    // The headline stays a column and a bound fact and stops being an event —
    // exactly as `openrouter-models` declares it today. So every line the run
    // below writes is a vendor-posted one.
    material_fields: [{ field: 'price_input', path: 'pricing.prompt', event: false }],
    mints: null,
    robots: { checked_on: '2026-09-07', result: 'allowed', requests_per_day: 10 },
    verification: { date: '2026-09-07', result: 'live' },
    companion: {
      url_template: `${url}/endpoints/{key}`,
      fetch_every_days: 1,
      covers: { field: 'pricing.prompt', test: 'nonzero', key: 'canonical_slug' },
      snapshot: 'endpoints',
      declared_on: '2026-09-07',
      canonical_tier: 'standard',
      provider_field: 'tag',
      provider_identities: { acme: { provider_slug: 'acme', declared_on: '2026-09-07' } },
      rows_path: 'data.endpoints',
      rates: { price_input: 'pricing.prompt', price_output: 'pricing.completion' },
    },
  };
}

test('a 2% vendor move is an event; a 60% headline move is not; a row with no vendor rate emits nothing', async (t) => {
  let rows = VENDOR_ROWS.map((r) => ({ ...r, pricing: { ...r.pricing } }));
  let movedRate = '1.00';
  const server = await serve((pathname) => {
    if (pathname === '/models') return { status: 200, body: catalogBody(rows) };
    if (pathname === '/endpoints/k-moved') {
      return { status: 200, body: JSON.stringify({ data: { endpoints: [{ tag: 'acme', pricing: { prompt: movedRate, completion: '5.00' } }] } }) };
    }
    if (pathname === '/endpoints/k-flat') {
      return { status: 200, body: JSON.stringify({ data: { endpoints: [{ tag: 'acme', pricing: { prompt: '2.00', completion: '6.00' } }] } }) };
    }
    if (pathname === '/endpoints/k-none') {
      // The row's own author posts nothing here, so the row has no vendor rate
      // however far its headline moves.
      return { status: 200, body: JSON.stringify({ data: { endpoints: [{ tag: 'somebody-else', pricing: { prompt: '3.00', completion: '7.00' } }] } }) };
    }
    return { status: 404, body: '' };
  });
  const root = makeRoot([vendorSource(server.url)]);
  t.after(async () => {
    await server.close();
    cleanup(root);
  });

  assert.equal((await runPulse(root, ARGS)).status, 0);
  assertIngested(root, 'models', 'before the world moves');
  assert.equal(readLines(paths.changes(root)).length, 0, 'first ingest establishes both diff bases');

  // Move the world: the vendor rate on one row by 2%, and the HEADLINE on the
  // other two by 60% and 200% with their vendor rates untouched.
  movedRate = '1.02';
  rows = [
    { ...VENDOR_ROWS[0] },
    { ...VENDOR_ROWS[1], pricing: { prompt: '0.0000032' } },
    { ...VENDOR_ROWS[2], pricing: { prompt: '0.000009' } },
  ];

  const run = await runPulse(root, [...ARGS, '--force']);
  assert.equal(run.status, 0, run.out);

  const lines = readLines(paths.changes(root));
  assert.equal(lines.length, 1, `the 2% vendor move is the only event; got ${JSON.stringify(lines.map((l) => [l.row_id, l.field]))}`);
  const line = lines[0];
  assert.equal(line.bound_to, 'vendor_posted_rate');
  assert.equal(line.row_id, 'acme/moved');
  assert.equal(line.field, 'price_input');
  assert.equal(line.old, '1.00');
  assert.equal(line.new, '1.02', 'a 2% move is an event on the same terms as a move of 200%');

  // Task 16: the line names the model, the PROVIDER, the TIER, both values and
  // the source. A rate with no tier is under-specified even when the vendor is
  // unambiguous, and a sentence naming the vendor and the number would be false
  // about which of its prices it names.
  assert.equal(line.provider_slug, 'acme');
  assert.equal(line.tier, 'standard');
  assert.equal(line.display_name, 'Acme Moved');
  assert.equal(line.source, 'models');
  assert.ok(line.source_url);
  assert.match(line.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(line.excerpt, 'and it embeds its archived source reference');

  // The two that emit nothing, named rather than left to the count.
  assert.equal(lines.filter((l) => l.row_id === 'acme/flat').length, 0, 'a 60% headline move is not an event');
  assert.equal(lines.filter((l) => l.row_id === 'acme/none').length, 0, 'and a row with no vendor rate never is');
});

test('a vendor-posted price line that cannot name its provider and tier is refused at the append point', async (t) => {
  // Task 16's other half, and it takes the same stance the closed-kind refusal
  // takes: refused rather than written, because `changes.jsonl` is append-only
  // history and a line already committed cannot be removed.
  const root = makeRoot([]);
  t.after(() => cleanup(root));

  const complete = {
    date: '2026-09-07',
    source: 'models',
    source_url: 'http://fixture.invalid/models',
    key: 'models|companion|aa|bb|acme/one|price_input',
    kind: 'field_change',
    bound_to: VENDOR_BOUND,
    row_id: 'acme/one',
    provider_slug: 'acme',
    tier: 'standard',
    field: 'price_input',
    old: '1',
    new: '2',
  };
  assert.equal(appendChanges(paths.changes(root), [complete]).length, 1, 'the complete line is written');

  for (const missing of ['provider_slug', 'tier']) {
    const broken = { ...complete, key: `${complete.key}|${missing}` };
    delete broken[missing];
    assert.throws(
      () => appendChanges(paths.changes(root), [broken]),
      (err) => {
        assert.match(err.message, /does not name both the provider and the tier/, missing);
        assert.match(err.message, /price_input/, 'and quotes the key that went wrong');
        return true;
      },
    );
  }
  assert.equal(readLines(paths.changes(root)).length, 1, 'and nothing was appended by the refused calls');
});
