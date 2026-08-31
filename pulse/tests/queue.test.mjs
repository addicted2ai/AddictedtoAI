/**
 * queue.test.mjs — task 3.5: the derived queue.
 *
 * Design D3: "The previous site died of tracked work accumulating faster than
 * it closed — the backlog wrecked the scheduler. A recomputed snapshot cannot
 * backlog: fix the state and the item vanishes."
 *
 * The first two tests are that claim, measured. The rest walk the spec's
 * enumeration of what belongs in the queue.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, jsonSource, makeRoot, paths, readJson, runPulse, writeEntry, writeJson } from './helpers.mjs';

const ARGS = ['--no-build', '--no-mint', '--offline'];
const NOW = { PULSE_NOW: '2026-08-28' };

function overdueEntry(root, slug, accessed = '2026-01-01') {
  writeEntry(root, `content/wiki/model/${slug}.md`, {
    id: `model/${slug}`,
    kind: 'model',
    display_name: slug,
    status: 'active',
    maintenance: 'living',
    aliases: [],
    feeds: {},
    facts: [{ field: 'price_input', source: 'cited', value: '1', source_url: 'https://vendor.invalid/p', accessed, volatility: 'fast' }],
    timeline: [],
    mentions: [],
  });
}

test('re-running with no state change produces a byte-identical queue', async (t) => {
  const root = makeRoot([jsonSource('quiet', 'http://fixture.invalid/q', { expected_change_days: 3 })]);
  t.after(() => cleanup(root));

  // A deliberately mixed state so the file under comparison is not trivial.
  overdueEntry(root, 'alpha');
  overdueEntry(root, 'beta', '2026-02-02');
  writeEntry(root, 'content/tutorials/old.md', { subjects: [], verified_on: '2026-05-01', reverify_days: 30, mentions: [] }, 'body');
  writeEntry(root, 'content/directory/tools/t.md', { url: 'https://t.invalid/', pricing: 'free', last_verified: '2026-01-01', entry: 'tool/t', mentions: [] }, 'body');
  writeJson(paths.latest(root, 'quiet'), { source: 'quiet', url: 'http://fixture.invalid/q', date: '2026-08-01', body_hash: 'x', row_count: 0, rows: {} });
  writeJson(paths.previous(root, 'quiet'), { source: 'quiet', url: 'http://fixture.invalid/q', date: '2026-08-01', body_hash: 'x', row_count: 0, rows: {} });
  writeJson(paths.state(root, 'quiet'), { source: 'quiet', last_fetch_date: '2026-08-28', last_change_date: '2026-07-01', seeded: true, refusing: null, consecutive_no_change_fetches: 9 });
  writeFileSync(
    paths.changes(root),
    JSON.stringify({ key: 'quiet|a|b|acme/one|price_input', date: '2026-08-25', kind: 'field_change', source: 'quiet', source_url: 'http://fixture.invalid/q', row_id: 'acme/one', field: 'price_input', old: '1', new: '2' }) + '\n',
    'utf8',
  );

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const first = readFileSync(paths.queue(root), 'utf8');
  assert.ok(readJson(paths.queue(root)).count > 3, 'the fixture produced a queue worth comparing');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const second = readFileSync(paths.queue(root), 'utf8');
  assert.equal(second, first, 'recomputation produces no accumulation and no drift — byte for byte');

  // Nothing in the file gives an item an identity or a history. `title` is the
  // one optional key (the scout item carries it; nothing else does) and it is
  // neither: it is the one-line outcome the loop's reader documents, and it
  // says nothing about when the item appeared or what has been done to it.
  const queue = readJson(paths.queue(root));
  const ALLOWED = ['detail', 'rank', 'reason', 'subject', 'target', 'title', 'type'];
  for (const item of queue.items) {
    for (const key of Object.keys(item)) assert.ok(ALLOWED.includes(key), `unexpected item key ${key}`);
    for (const key of ['detail', 'rank', 'reason', 'subject', 'target', 'type']) {
      assert.ok(key in item, `every item carries ${key}`);
    }
    for (const key of ['id', 'created', 'created_at', 'status', 'state', 'seen']) {
      assert.equal(key in item, false, `an item must never carry ${key}`);
    }
  }
  assert.equal('generated_at' in queue, false, 'no timestamp: the queue is a snapshot, not a ledger');
});

test('fixing the state removes the item, with no close or archive action by anyone', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  overdueEntry(root, 'alpha', '2026-01-01');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  let queue = readJson(paths.queue(root));
  assert.equal(queue.items.filter((i) => i.subject === 'model/alpha#price_input').length, 1);

  overdueEntry(root, 'alpha', '2026-08-27'); // re-verified
  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  queue = readJson(paths.queue(root));
  assert.equal(queue.items.filter((i) => i.subject === 'model/alpha#price_input').length, 0);
  // The daily scout item remains: it is a function of the ledger and the clock,
  // not of the fact that was just re-verified. Its own idempotence is measured
  // in scout-queue.test.mjs.
  assert.deepEqual(queue.items.map((i) => i.reason), ['scout-due']);
});

test('the queue is capped at 50 and reports what it dropped', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  for (let i = 0; i < 60; i++) overdueEntry(root, `e${String(i).padStart(2, '0')}`);

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const queue = readJson(paths.queue(root));
  assert.equal(queue.count, 50);
  assert.equal(queue.cap, 50);
  assert.equal(queue.total_before_cap, 61, 'the queue is bounded by the size of the site, not by time passing');

  // 60 overdue facts rank 65; the scout ranks 62. The cap is a truncation, not
  // a deferral — the queue has no backlog by construction — so on a day when
  // 50 items outrank it the scout item is simply not offered. Asserted rather
  // than left implicit: this is the one place the normative rank (below
  // corroboration, above the routine timers) meets QUEUE_CAP, and anyone who
  // later exempts the scout from the cap should have to change this line
  // deliberately.
  assert.equal(queue.items.filter((i) => i.type === 'scout').length, 0);
  assert.equal(queue.items.filter((i) => i.rank === 65).length, 50);
});

test('a vanished feed row produces a repair item', async (t) => {
  const root = makeRoot([jsonSource('models', 'http://fixture.invalid/m')]);
  t.after(() => cleanup(root));
  const here = { id: 'acme/here', name: 'Here', pricing: { prompt: '1' }, context_length: 1, expiration_date: null };
  writeJson(paths.previous(root, 'models'), { source: 'models', url: 'u', date: '2026-08-20', row_count: 2, rows: { 'acme/gone': { ...here, id: 'acme/gone' }, 'acme/here': here } });
  writeJson(paths.latest(root, 'models'), { source: 'models', url: 'u', date: '2026-08-28', row_count: 1, rows: { 'acme/here': here } });
  writeJson(paths.state(root, 'models'), { source: 'models', last_fetch_date: '2026-08-28', last_change_date: '2026-08-28', seeded: true, refusing: null });
  writeEntry(root, 'content/wiki/model/gone.md', {
    id: 'model/gone', kind: 'model', display_name: 'Gone', status: 'active', maintenance: 'living',
    aliases: [], feeds: { models: 'acme/gone' }, facts: [], timeline: [], mentions: [],
  });

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const item = readJson(paths.queue(root)).items.find((i) => i.reason === 'vanished-feed-row');
  assert.ok(item, 'a declared row id absent from the latest snapshot files a repair finding');
  assert.equal(item.type, 'repair');
  assert.equal(item.subject, 'models:acme/gone');
});

test('an unannotated material change becomes an interpret item, and an annotation removes it', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  const change = { key: 'k1', date: '2026-08-25', kind: 'field_change', source: 'models', source_url: 'u', row_id: 'acme/one', field: 'price_input', old: '1', new: '2' };
  const stale = { key: 'k2', date: '2026-07-01', kind: 'field_change', source: 'models', source_url: 'u', row_id: 'acme/two', field: 'price_input', old: '1', new: '2' };
  const immaterial = { key: 'k3', date: '2026-08-25', kind: 'field_change', source: 'models', source_url: 'u', row_id: 'acme/three', field: 'context_window', old: '1', new: '2' };
  writeFileSync(paths.changes(root), [change, stale, immaterial].map((c) => JSON.stringify(c)).join('\n') + '\n', 'utf8');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  let items = readJson(paths.queue(root)).items.filter((i) => i.type === 'interpret');
  assert.equal(items.length, 1, 'only the material change inside the trailing 14 days qualifies');
  assert.equal(items[0].subject, 'k1');
  assert.equal(items[0].reason, 'uninterpreted-price-change');

  // The loop's `interpret` job appends an annotation keyed to the change.
  writeFileSync(
    paths.changes(root),
    readFileSync(paths.changes(root), 'utf8') + JSON.stringify({ kind: 'annotation', annotates: 'k1', date: '2026-08-26', job: 'j-20260826-01', text: 'Acme doubled its prompt price.' }) + '\n',
    'utf8',
  );
  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  items = readJson(paths.queue(root)).items.filter((i) => i.type === 'interpret');
  assert.equal(items.length, 0, 'an interpreted change leaves the queue');
});

test('a field the registry marks event:false files no interpret job, per source (addictedtoai-e31)', async (t) => {
  // addictedtoai-8ho stopped these lines being WRITTEN; it could not unwrite
  // the ones already in append-only history, so the Desk kept proposing
  // interpret jobs for routing noise. The queue now asks the registry the same
  // question the diff asks, so one flag governs both.
  const root = makeRoot([
    jsonSource('models', 'http://fixture.invalid/m', {
      material_fields: [
        { field: 'price_input', path: 'pricing.prompt', event: false },
        { field: 'status', path: '$status' },
      ],
    }),
  ]);
  t.after(() => cleanup(root));
  writeJson(paths.state(root, 'models'), { source: 'models', last_fetch_date: '2026-08-28', last_change_date: '2026-08-28', seeded: true, refusing: null });

  const lines = [
    // Marked event:false on this source — suppressed.
    { key: 'p', date: '2026-08-25', kind: 'field_change', source: 'models', source_url: 'u', row_id: 'acme/one', field: 'price_input', old: '1', new: '2' },
    // Not marked — a real event, still interpreted. This is what proves the
    // capability was gated rather than deleted from INTERPRET_FIELDS.
    { key: 's', date: '2026-08-25', kind: 'field_change', source: 'models', source_url: 'u', row_id: 'acme/two', field: 'status', old: 'active', new: 'deprecated' },
    // The SAME field from a source that says nothing about it — untouched, so
    // the suppression cannot leak across sources.
    { key: 'o', date: '2026-08-25', kind: 'field_change', source: 'elsewhere', source_url: 'u', row_id: 'acme/three', field: 'price_input', old: '1', new: '2' },
  ];
  writeFileSync(paths.changes(root), lines.map((l) => JSON.stringify(l)).join('\n') + '\n', 'utf8');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const subjects = readJson(paths.queue(root)).items.filter((i) => i.type === 'interpret').map((i) => i.subject).sort();
  assert.deepEqual(subjects, ['o', 's'], 'the event:false price line files nothing; the status change and another source\'s price change still do');
});

test('a status change ranks above a price change in the interpret backlog', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  const lines = [
    { key: 'p', date: '2026-08-25', kind: 'field_change', source: 'm', source_url: 'u', row_id: 'a', field: 'price_input', old: '1', new: '2' },
    { key: 's', date: '2026-08-25', kind: 'field_change', source: 'm', source_url: 'u', row_id: 'b', field: 'status', old: 'active', new: 'deprecated' },
  ];
  writeFileSync(paths.changes(root), lines.map((l) => JSON.stringify(l)).join('\n') + '\n', 'utf8');
  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const items = readJson(paths.queue(root)).items.filter((i) => i.type === 'interpret');
  assert.equal(items[0].subject, 's');
  assert.ok(items[0].rank > items[1].rank);
});

test('a want reaching 3 distinct pages becomes an eligible mint; 2 does not', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeJson(join(root, 'data', 'derived', 'wants.json'), {
    wants: [
      { name: 'vLLM', count: 3, pages: ['content/blog/a.md', 'content/blog/b.md', 'content/blog/c.md'] },
      { name: 'SGLang', count: 2, pages: ['content/blog/a.md', 'content/blog/b.md'] },
    ],
  });
  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const items = readJson(paths.queue(root)).items.filter((i) => i.reason === 'want-eligible-mint');
  assert.deepEqual(items.map((i) => i.subject), ['vLLM']);
  assert.equal(items[0].type, 'entry');
});

test('a stale queue file is overwritten whole, never merged', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  writeJson(paths.queue(root), { cap: 50, count: 1, total_before_cap: 1, items: [{ type: 'repair', reason: 'ghost', rank: 999, subject: 'from a previous run', detail: '', target: null }] });
  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const queue = readJson(paths.queue(root));
  assert.equal(queue.items.filter((i) => i.reason === 'ghost').length, 0, 'nothing is ever "filed" into the queue');
  // What IS there is recomputed from current state, not carried over: this
  // fixture's ledger records no scout today, so the scout item derives.
  assert.deepEqual(queue.items.map((i) => i.reason), ['scout-due']);
});

// ── a declared corroboration that disagrees (specs/pulse, addictedtoai-473) ──

const ROW = 'deepseek/deepseek-v4-flash-0731';

/** An entry declaring a feed-bound `parameters` and a cited `card_parameters`. */
function corroboratingEntry(root, { citedValue = '304B params' } = {}) {
  writeEntry(root, 'content/wiki/model/v4-flash.md', {
    id: 'model/v4-flash',
    kind: 'model',
    display_name: 'V4 Flash',
    status: 'active',
    maintenance: 'living',
    aliases: [],
    feeds: { openrouter: ROW },
    facts: [
      { field: 'parameters', source: 'feed', feed: 'openrouter', path: 'parameters', volatility: 'slow' },
      {
        field: 'card_parameters',
        source: 'cited',
        value: citedValue,
        source_url: 'https://huggingface.co/example/card',
        accessed: '2026-08-28',
        volatility: 'static',
        corroborates: 'parameters',
      },
    ],
    timeline: [],
    mentions: [],
  });
}

function feedSays(root, parameters) {
  writeJson(paths.latest(root, 'openrouter'), {
    source: 'openrouter',
    url: 'http://fixture.invalid/or',
    date: '2026-08-28',
    body_hash: 'x',
    row_count: 1,
    rows: { [ROW]: { id: ROW, parameters } },
  });
}

test('a declared pair that disagrees yields exactly one verify item naming both sides', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  corroboratingEntry(root);
  feedSays(root, '284B total');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0, 'a disagreement is a finding, not a failure');
  const items = readJson(paths.queue(root)).items.filter((i) => i.reason === 'corroboration');
  assert.equal(items.length, 1, 'exactly one item for one disagreeing pair');

  const [i] = items;
  assert.equal(i.type, 'verify', 'it proposes a verify job');
  // Everything the job needs to begin: the entry, both fields, both resolved
  // values, and both sources.
  assert.match(i.subject, /model\/v4-flash/, 'the entry');
  assert.equal(i.target, 'content/wiki/model/v4-flash.md');
  assert.match(i.detail, /card_parameters/, 'the cited field');
  assert.match(i.detail, /\bparameters\b/, 'the feed-bound field');
  assert.match(i.detail, /304B params/, 'the cited value');
  assert.match(i.detail, /284B total/, 'the feed value');
  assert.match(i.detail, /openrouter/, 'the feed’s registry id');
  assert.match(i.detail, /https:\/\/huggingface\.co\/example\/card/, 'the cited source_url');
  // It proposes; it does not decide.
  assert.doesNotMatch(i.detail, /authoritative|correct value|is wrong/i, 'it names no winner');
});

test('the corroboration item edits no fact and does not accumulate', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  corroboratingEntry(root);
  feedSays(root, '284B total');
  const file = join(root, 'content', 'wiki', 'model', 'v4-flash.md');
  const snapshotFile = paths.latest(root, 'openrouter');
  const contentBefore = readFileSync(file, 'utf8');
  const feedBefore = readFileSync(snapshotFile, 'utf8');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const first = readFileSync(paths.queue(root), 'utf8');

  assert.equal(readFileSync(file, 'utf8'), contentBefore, 'the cited fact is untouched, byte for byte');
  assert.equal(readFileSync(snapshotFile, 'utf8'), feedBefore, 'and so is the feed row — verbatim is verbatim');

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  assert.equal(readFileSync(paths.queue(root), 'utf8'), first, 'a second run produces the same bytes, not a second item');
});

test('agreement empties the item, with no close action by anyone', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  corroboratingEntry(root);
  feedSays(root, '284B total');
  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  assert.equal(readJson(paths.queue(root)).items.filter((i) => i.reason === 'corroboration').length, 1);

  // The source is corrected. Nothing is closed, archived or acknowledged.
  feedSays(root, '304B total');
  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  assert.deepEqual(
    readJson(paths.queue(root)).items.filter((i) => i.reason === 'corroboration'),
    [],
    'fix the state and the item vanishes',
  );
});

test('a vanished declared row produces no corroboration item', async (t) => {
  const root = makeRoot([]);
  t.after(() => cleanup(root));
  corroboratingEntry(root);
  // The snapshot no longer carries the declared row at all.
  writeJson(paths.latest(root, 'openrouter'), {
    source: 'openrouter',
    url: 'http://fixture.invalid/or',
    date: '2026-08-28',
    body_hash: 'x',
    row_count: 0,
    rows: {},
  });

  assert.equal((await runPulse(root, ARGS, NOW)).status, 0);
  const items = readJson(paths.queue(root)).items;
  assert.deepEqual(
    items.filter((i) => i.reason === 'corroboration'),
    [],
    'absence is not disagreement — reporting it under a second name makes both findings less legible',
  );
});
