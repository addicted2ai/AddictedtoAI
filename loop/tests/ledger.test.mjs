import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LEDGER_FIELDS, LEDGER_ITEM_KEYS, appendLedger, makeLedgerLine, readLedger } from '../lib/ledger.mjs';
import { loadRunners } from '../lib/runners.mjs';
import { itemGraphSummaries, ledgerItemsForOrder, runLoop } from '../run.mjs';
import { git, makeRepo, mockCommand, plantJobBranch, runnersYaml, writeLedger, writeQueue } from './helpers.mjs';

test('ledger telemetry and per-phase effort round-trip without changing required fields', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  const line = makeLedgerLine({
    ts: '2026-09-09T12:00:00.000Z',
    id: 'j-20260909-01',
    type: 'repair',
    runner: 'mock-frontier',
    provider: 'provider-a',
    tier: 'frontier',
    mm: 12.34,
    outcome: 'done',
    phases: [
      { role: 'author', runner: 'mock-frontier', effort: null, mm: 5, killed: false, code: 0, outcome: 'done' },
      { role: 'review1', runner: 'mock-reviewer', effort: 'registry-rung', carried: 2, mm: 3, killed: false, code: 0, outcome: 'approve' },
      { role: 'revision', runner: 'mock-frontier', effort: null, mm: 2, killed: false, code: 0, outcome: 'unclassified' },
      { role: 'review2', runner: 'mock-reviewer', effort: 'registry-rung', carried: 0, mm: 2.34, killed: false, code: 0, outcome: 'approve' },
    ],
    brief_chars: 1234,
    gate_seconds: { test: 1.2, 'verify-surfaces': 0.4 },
    authority_sha: 'a'.repeat(40),
  });

  appendLedger(ctx, line);
  const written = readLedger(ctx);
  assert.deepEqual(written, [line]);
  assert.equal(written[0].brief_chars, 1234);
  assert.deepEqual(written[0].gate_seconds, { test: 1.2, 'verify-surfaces': 0.4 });
  assert.equal(written[0].authority_sha, 'a'.repeat(40));

  for (const phase of written[0].phases) {
    assert.ok(phase.runner);
    assert.ok(Object.hasOwn(phase, 'effort'));
    if (phase.role.startsWith('review')) {
      assert.ok(Object.hasOwn(phase, 'carried'));
    } else {
      assert.equal(Object.hasOwn(phase, 'carried'), false);
    }
  }
});

test('a pre-existing eight-key ledger line still validates', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  const oldLine = {
    ts: '2026-09-08T12:00:00.000Z',
    id: 'j-20260908-01',
    type: 'entry',
    runner: 'mock-frontier',
    provider: 'provider-a',
    tier: 'frontier',
    mm: 4,
    outcome: 'done',
  };

  appendLedger(ctx, oldLine);
  assert.deepEqual(readLedger(ctx), [oldLine]);
});

test('a registry effort is copied to each phase, while absent effort remains null', async (t) => {
  const authorEffort = ['fixture', 'author', 'rung'].join('-');
  const reviewerEffort = ['fixture', 'reviewer', 'rung'].join('-');
  const runners = runnersYaml({
    command: mockCommand('done-edit'),
    reviewerCommand: mockCommand('review-approve'),
  })
    .replace('  - id: mock-frontier\n', `  - id: mock-frontier\n    effort: ${authorEffort}\n`)
    .replace('  - id: mock-reviewer\n', `  - id: mock-reviewer\n    effort: ${reviewerEffort}\n`);
  const ctx = makeRepo({
    runners,
    gitignore: 'node_modules/\n*.log\n/HOLD.md\n/STOP\n/RESULT.md\n',
  });
  t.after(() => ctx.cleanup());
  writeQueue(ctx, [{ type: 'repair', title: 'a repair for phase telemetry' }]);
  const authoritySha = git(ctx.repoRoot, ['rev-parse', 'HEAD']).trim();

  const result = await runLoop(ctx, {
    runner: 'mock-frontier',
    reviewer: 'mock-reviewer',
    noGates: true,
  });
  assert.equal(result.outcome, 'done', ctx.output());
  const line = readLedger(ctx).at(-1);
  assert.equal(line.phases.find((phase) => phase.role === 'author').effort, authorEffort);
  assert.equal(line.phases.find((phase) => phase.role === 'review1').effort, reviewerEffort);
  assert.equal(line.phases.find((phase) => phase.role === 'review1').carried, 0);
  assert.equal(line.phases.find((phase) => phase.role === 'author').carried, undefined);
  assert.equal(line.phases.every((phase) => Object.hasOwn(phase, 'effort')), true);
  const briefCommit = git(ctx.repoRoot, [
    'log',
    '-1',
    '--format=%H',
    '--full-history',
    '--diff-filter=A',
    `${result.mergedSha}^2`,
    '--',
    '.job/brief.md',
  ]).trim();
  const committedBrief = git(ctx.repoRoot, ['show', `${briefCommit}:.job/brief.md`]);
  assert.equal(line.brief_chars, committedBrief.length);
  assert.equal(line.gate_seconds, undefined);
  assert.equal(line.authority_sha, authoritySha);
});

test('a parsed non-empty carry list reaches the review phase ledger entry', async (t) => {
  const ctx = makeRepo({
    gitignore: 'node_modules/\n*.log\n/HOLD.md\n/STOP\n/RESULT.md\n',
    runners: runnersYaml({
      command: mockCommand('done-edit'),
      reviewerCommand: mockCommand('review-approve-carry'),
    }),
  });
  t.after(() => ctx.cleanup());
  writeQueue(ctx, [{ type: 'repair', title: 'a repair with carried review findings' }]);

  const result = await runLoop(ctx, {
    runner: 'mock-frontier',
    reviewer: 'mock-reviewer',
    noGates: true,
  });
  assert.equal(result.outcome, 'done', ctx.output());
  const review = readLedger(ctx).at(-1).phases.find((phase) => phase.role === 'review1');
  assert.equal(review.carried, 2);
});

test('a review phase without a verdict has no carried key', async (t) => {
  const ctx = makeRepo({
    gitignore: 'node_modules/\n*.log\n/HOLD.md\n/STOP\n/RESULT.md\n',
    runners: runnersYaml({
      command: mockCommand('done-edit'),
      reviewerCommand: mockCommand('review-nothing'),
    }),
  });
  t.after(() => ctx.cleanup());
  writeQueue(ctx, [{ type: 'repair', title: 'a repair with no review record' }]);

  const result = await runLoop(ctx, {
    runner: 'mock-frontier',
    reviewer: 'mock-reviewer',
    noGates: true,
  });
  assert.equal(result.outcome, 'failed', ctx.output());
  const review = readLedger(ctx).at(-1).phases.find((phase) => phase.role === 'review1');
  assert.equal(Object.hasOwn(review, 'carried'), false);
});

test('a registry effort is optional but invalid empty values fail at load time', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  const runnersPath = join(ctx.repoRoot, 'runners.yml');
  const original = runnersYaml({
    command: mockCommand('noop'),
    reviewerCommand: mockCommand('review-approve'),
  });
  assert.equal(loadRunners({ runnersPath }).byId.get('mock-frontier').effort, undefined);

  writeFileSync(
    runnersPath,
    original.replace('    provider: provider-a\n', '    effort: ""\n    provider: provider-a\n'),
    'utf8',
  );
  assert.throws(() => loadRunners({ runnersPath }), /effort.*non-empty string/);
});

test('the outcome line records the last run of each gate in seconds', async (t) => {
  const ctx = makeRepo({
    gitignore: 'node_modules/\n*.log\n/HOLD.md\n/STOP\n/RESULT.md\n',
    runners: runnersYaml({
      command: mockCommand('done-edit'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  t.after(() => ctx.cleanup());
  writeQueue(ctx, [{ type: 'repair', title: 'a repair for gate telemetry' }]);

  const branchAnswers = [
    {
      ok: false,
      results: [{ script: 'test', ok: false, status: 1, durationMs: 1000, output: 'ordinary failure' }],
      output: 'ordinary failure',
    },
    {
      ok: true,
      results: [
        { script: 'test', ok: true, status: 0, durationMs: 2349, output: '' },
        { script: 'build', ok: true, status: 0, durationMs: 3451, output: '' },
      ],
      output: '',
    },
  ];
  let branchRuns = 0;
  const gates = (current, dir) => {
    if (dir === current.repoRoot) {
      return {
        ok: true,
        results: [{ script: 'build', ok: true, status: 0, durationMs: 9999, output: '' }],
        output: '',
      };
    }
    return branchAnswers[Math.min(branchRuns++, branchAnswers.length - 1)];
  };

  const result = await runLoop(ctx, {
    runner: 'mock-frontier',
    reviewer: 'mock-reviewer',
    gates,
  });
  assert.equal(result.outcome, 'done', ctx.output());
  assert.deepEqual(readLedger(ctx).at(-1).gate_seconds, { test: 2.3, build: 3.5 });
});

// ---------------------------------------------------------------------------
// Task 67 — the ledger line carries the join, as a list, additively.
//
// `items` is the work order the job executed, one entry per item, with the
// per-item graph summary keys (`graph_symbols`, `graph_processes`,
// `graph_risk`, `graph_incomplete`) riding only where the merge had evidence,
// and the partially-done marker (`partially_done: true`) present in the line
// iff the order retired fewer items than it carried. LEDGER_FIELDS is NOT
// extended — the additive property is the thing under test, and the mutation
// arm below proves the old-line arm measures it.
// ---------------------------------------------------------------------------

const task67Base = {
  ts: '2026-09-13T12:00:00.000Z',
  id: 'j-20260913-01',
  type: 'repair',
  runner: 'mock-frontier',
  provider: 'provider-a',
  tier: 'frontier',
  mm: 4,
  outcome: 'done',
};

const ORDER_A = 'content/wiki/model/ledger-a.md';
const ORDER_B = 'content/wiki/model/ledger-b.md';
const orderItem = (subjects, bead = null) => ({ bead, type: 'repair', subjects, reason: 'fixture' });
const orderSource = (items) => ({
  job: 'j-fixture',
  type: 'repair',
  source: 'queue',
  slug: null,
  path: null,
  issues: [],
  items,
  declared_subjects: [...new Set(items.flatMap((i) => i.subjects))].sort(),
});

test('task 67 old-line arm (green): a pre-existing line without items and without the graph summary keys still validates', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  const oldLine = { ...task67Base };
  appendLedger(ctx, oldLine);
  const written = readLedger(ctx);
  assert.deepEqual(written, [oldLine], 'the line round-trips byte-for-byte in meaning');
  assert.equal(Object.hasOwn(written[0], 'items'), false, 'no items key');
  assert.equal(Object.hasOwn(written[0], 'partially_done'), false, 'no partially-done marker');
});

test("task 67 mutation (task-26's shape): a writer that makes items REQUIRED is red on the old-line arm", async (t) => {
  const ledgerLib = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'ledger.mjs');
  const before = readFileSync(ledgerLib, 'utf8');
  const anchor = "  'outcome',\n]);";
  assert.ok(before.includes(anchor), 'the mutation anchor is present exactly where LEDGER_FIELDS closes');
  const mutant = before.replace(anchor, "  'outcome',\n  'items',\n]);");
  assert.notEqual(mutant, before, 'the mutant must differ from the shipped file');
  const copyPath = resolve(dirname(ledgerLib), `ledger.mut-${process.pid}-67-items.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  const ctx = makeRepo();
  try {
    const mut = await import(`./../lib/ledger.mut-${process.pid}-67-items.mjs`);
    assert.deepEqual(
      [...mut.LEDGER_FIELDS],
      [...LEDGER_FIELDS, 'items'],
      'the mutant registers items as a required field',
    );
    const oldLine = { ...task67Base };
    assert.throws(
      () => mut.appendLedger(ctx, oldLine),
      /items/,
      'the mutation is RED on the old-line arm: a line written before items existed fails validation',
    );
    // The control, through the REAL module: the same line validates.
    appendLedger(ctx, oldLine);
    assert.deepEqual(readLedger(ctx), [oldLine]);
    assert.equal(readFileSync(ledgerLib, 'utf8'), before, 'tracked ledger.mjs byte-identical after the mutant run');
  } finally {
    rmSync(copyPath, { force: true });
    ctx.cleanup();
  }
  assert.equal(existsSync(copyPath), false, 'the mutant copy is gone');
});

test('task 67 (items, negative): items is omitted entirely when the line has no items', () => {
  for (const items of [undefined, null, [], 'not-a-list']) {
    const line = makeLedgerLine({ ...task67Base, items });
    assert.equal(Object.hasOwn(line, 'items'), false, `items: ${JSON.stringify(items)} must write no key`);
    assert.equal(Object.hasOwn(line, 'partially_done'), false, 'no order, no marker');
  }
});

test('task 67 (items, positive): a non-empty items value IS a list and round-trips', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  const items = [
    { index: 0, bead: null, type: 'repair', subjects: [ORDER_A], via: 'diff' },
    { index: 1, bead: null, type: 'repair', subjects: [ORDER_B], open: true },
  ];
  const line = makeLedgerLine({ ...task67Base, items });
  assert.ok(Array.isArray(line.items), 'the items key is a list');
  assert.deepEqual(line.items, items);
  appendLedger(ctx, line);
  assert.deepEqual(readLedger(ctx), [line], 'the list survives the append-only round-trip');
});

test('task 67 (summary keys, negative): the four per-item graph summary keys are omitted when empty', () => {
  const line = makeLedgerLine({
    ...task67Base,
    items: [
      {
        index: 0,
        bead: null,
        type: 'repair',
        subjects: [ORDER_A],
        graph_symbols: 0,
        graph_processes: 0,
        graph_risk: '',
        graph_incomplete: [],
      },
    ],
  });
  const entry = line.items[0];
  for (const k of ['graph_symbols', 'graph_processes', 'graph_risk', 'graph_incomplete']) {
    assert.equal(Object.hasOwn(entry, k), false, `${k} is omitted when empty`);
  }
  assert.deepEqual(Object.keys(entry).sort(), ['bead', 'index', 'subjects', 'type'], 'only the join fields remain');
});

test('task 67 (summary keys, positive): the four summary keys are present when the merge produced them', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  const entry = {
    index: 0,
    bead: null,
    type: 'repair',
    subjects: [ORDER_A],
    via: 'diff',
    graph_symbols: 2,
    graph_processes: 3,
    graph_risk: 'UNKNOWN',
    graph_incomplete: ['UNKNOWN', 'partial'],
  };
  const line = makeLedgerLine({ ...task67Base, items: [entry] });
  assert.deepEqual(line.items[0], entry);
  appendLedger(ctx, line);
  const written = readLedger(ctx)[0];
  assert.equal(written.items[0].graph_symbols, 2);
  assert.equal(written.items[0].graph_processes, 3);
  assert.equal(written.items[0].graph_risk, 'UNKNOWN');
  assert.deepEqual(written.items[0].graph_incomplete, ['UNKNOWN', 'partial']);
});

test('task 67 (exact-allowlist arm): any other new summary key on an items entry is rejected', () => {
  assert.deepEqual(
    [...LEDGER_ITEM_KEYS],
    ['index', 'bead', 'type', 'subjects', 'via', 'open', 'graph_symbols', 'graph_processes', 'graph_risk', 'graph_incomplete'],
    'the allowlist is exactly the join fields plus the four summary keys',
  );
  assert.ok(Object.isFrozen(LEDGER_ITEM_KEYS), 'the allowlist is frozen');
  for (const rogue of ['graph_callers', 'origin', 'reason', 'graph_symbols_raw']) {
    assert.throws(
      () =>
        makeLedgerLine({
          ...task67Base,
          items: [{ index: 0, bead: null, type: 'repair', subjects: [ORDER_A], [rogue]: 1 }],
        }),
      new RegExp(rogue),
      `the rogue key "${rogue}" fails the write loudly`,
    );
  }
});

test('task 67 (partially-done marker): present in the line iff the order is partially done', () => {
  const retired = { index: 0, bead: null, type: 'repair', subjects: [ORDER_A], via: 'diff' };
  const open = { index: 1, bead: null, type: 'repair', subjects: [ORDER_B], open: true };

  const partial = makeLedgerLine({ ...task67Base, items: [retired, open] });
  assert.equal(partial.partially_done, true, 'present when the order retired fewer items than it carried');

  const full = makeLedgerLine({
    ...task67Base,
    items: [retired, { index: 1, bead: null, type: 'repair', subjects: [ORDER_B], via: 'reviewed' }],
  });
  assert.equal(Object.hasOwn(full, 'partially_done'), false, 'absent when every item retired');

  const none = makeLedgerLine({ ...task67Base });
  assert.equal(Object.hasOwn(none, 'partially_done'), false, 'absent when there is no order at all');
});

test('task 67 (writer join): ledgerItemsForOrder builds the join from the order and the merge retirement', () => {
  // Old contract and empty orders yield null — the key is omitted entirely.
  assert.equal(ledgerItemsForOrder({ job: 'j-old', type: 'repair' }), null);
  assert.equal(ledgerItemsForOrder(null), null);
  assert.equal(ledgerItemsForOrder(orderSource([])), null);

  const source = orderSource([orderItem([ORDER_A]), orderItem(['b\\b', ORDER_B, ORDER_B])]);
  // No retirement computed: entries carry the join fields, no status keys.
  const bare = ledgerItemsForOrder(source);
  assert.deepEqual(bare, [
    { index: 0, bead: null, type: 'repair', subjects: [ORDER_A] },
    { index: 1, bead: null, type: 'repair', subjects: ['b/b', ORDER_B] },
  ]);

  const retirement = {
    retired: [{ index: 1, item: source.items[1], via: 'reviewed', touched: [ORDER_B] }],
    open: [{ index: 0, item: source.items[0], why: 'no measured diff', touched: [] }],
    partiallyDone: true,
    note: 'partially done: retired 1 of 2 items',
  };
  const joined = ledgerItemsForOrder(source, { retirement });
  assert.equal(joined[0].open, true, 'the unretired item is marked open');
  assert.equal(Object.hasOwn(joined[0], 'via'), false, 'an open item carries no via');
  assert.equal(joined[1].via, 'reviewed', 'the retired item carries how it retired');
  assert.equal(Object.hasOwn(joined[1], 'open'), false);

  // Per-item graph summaries ride only where the merge had them.
  const graph = new Map([[0, { graph_symbols: 2, graph_processes: 3, graph_risk: 'LOW' }]]);
  const withGraph = ledgerItemsForOrder(source, { retirement, itemGraph: graph });
  assert.deepEqual(withGraph[0], {
    index: 0,
    bead: null,
    type: 'repair',
    subjects: [ORDER_A],
    open: true,
    graph_symbols: 2,
    graph_processes: 3,
    graph_risk: 'LOW',
  });
  assert.deepEqual(withGraph[1], {
    index: 1,
    bead: null,
    type: 'repair',
    subjects: ['b/b', ORDER_B],
    via: 'reviewed',
  });
});

test('task 67 (per-item graph summaries): derived from the committed sidecar, each key omitted when empty', () => {
  const C = 'content/wiki/model/ledger-c.md';
  const D = 'content/wiki/model/ledger-d.md';
  const E = 'content/wiki/model/ledger-e.md';
  const source = orderSource([
    orderItem([ORDER_A]), // full evidence
    orderItem([ORDER_B]), // no-symbols: complete, risk only
    orderItem([C]), // absent entry — the query could not answer
    orderItem([D]), // UNKNOWN risk plus a partial flag
    orderItem([E]), // no entry at all
    orderItem([ORDER_A, D]), // worst risk across the item's subjects
  ]);
  const sidecar = {
    subjects: {
      [ORDER_A]: { symbols: ['s1', 's2'], callers: 1, processes: 3, risk: 'LOW', partial: false, truncated: false },
      [ORDER_B]: { noSymbols: true, callers: 0, processes: 0, risk: 'LOW', partial: false, truncated: false },
      [C]: { absent: true, reason: 'no index' },
      [D]: { symbols: [], processes: 0, risk: 'UNKNOWN', partial: true, truncated: false },
    },
  };
  const m = itemGraphSummaries(source, { sidecar });
  assert.deepEqual(m.get(0), { graph_symbols: 2, graph_processes: 3, graph_risk: 'LOW' });
  assert.deepEqual(m.get(1), { graph_risk: 'LOW' }, 'no-symbols is complete evidence: risk only, no flags');
  assert.deepEqual(m.get(2), { graph_incomplete: ['absent'] });
  assert.deepEqual(m.get(3), { graph_risk: 'UNKNOWN', graph_incomplete: ['UNKNOWN', 'partial'] });
  assert.equal(m.has(4), false, 'a subject with no sidecar entry contributes nothing');
  assert.deepEqual(
    m.get(5),
    { graph_symbols: 2, graph_processes: 3, graph_risk: 'UNKNOWN', graph_incomplete: ['UNKNOWN', 'partial'] },
    "the item's risk is the worst its subjects' evidence reports",
  );
  assert.equal(itemGraphSummaries(source, { sidecar: null }).size, 0, 'no sidecar, no summaries');
  assert.equal(itemGraphSummaries({ job: 'j-old', type: 'repair' }, { sidecar }).size, 0, 'old contract takes no graph arm');
});

// ---------------------------------------------------------------------------
// Task 67 writer-site fixtures: planted work-order branches through the REAL
// runLoop, the same shape the task-56 merge fixtures use (throwaway repos,
// stubbed graph seams, never a live push or live index write).
// ---------------------------------------------------------------------------

const NOW67 = new Date('2026-09-13T12:00:00.000Z');
const P1 = 'content/wiki/model/ledger-p1.md';
const P2 = 'content/wiki/model/ledger-p2.md';
const sidecarJson = (subjects) =>
  `${JSON.stringify({ version: 1, index: 'brief-index:merge-base-tree', subjects }, null, 2)}\n`;

function plantedOrderRepo(t, id, list, extraFiles = {}, authorMode = 'done-content-paths', authorExtra = '') {
  const ctx = makeRepo({
    now: () => NOW67,
    runners: runnersYaml({
      command: mockCommand(authorMode, authorExtra),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  t.after(() => ctx.cleanup());
  const items = list.map((s) => orderItem([...s]));
  const declared = [...new Set(items.flatMap((i) => i.subjects))].sort();
  const source = { job: id, type: 'repair', source: 'queue', slug: null, path: null, issues: [], items, declared_subjects: declared };
  plantJobBranch(ctx, id, {
    brief: '# a planted work-order brief\n',
    files: { '.job/source.json': `${JSON.stringify(source, null, 2)}\n`, ...extraFiles },
  });
  writeLedger(ctx, []);
  writeQueue(ctx, []);
  return ctx;
}

const go67 = (ctx) => runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

test('task 67 (writer site): a merged work order carries items with the retirement join and graph summaries', async (t) => {
  const id = 'j-20260913-67';
  const ctx = plantedOrderRepo(
    t,
    id,
    [[P1], [P2]],
    {
      '.job/graph.json': sidecarJson({
        [P1]: { symbols: ['s1'], callers: 1, processes: 2, risk: 'LOW', partial: false, truncated: false },
      }),
    },
    'done-content-paths',
    ` ${P1}`,
  );
  const res = await go67(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  const line = readLedger(ctx).at(-1);
  assert.match(line.note, /partially done: retired 1 of 2 items/, 'the existing note is untouched, unchanged');
  assert.equal(line.partially_done, true, 'the marker is present in the line iff the order is partially done');
  assert.ok(Array.isArray(line.items), 'items is a list');
  assert.deepEqual(line.items, [
    {
      index: 0,
      bead: null,
      type: 'repair',
      subjects: [P1],
      via: 'diff',
      graph_symbols: 1,
      graph_processes: 2,
      graph_risk: 'LOW',
    },
    { index: 1, bead: null, type: 'repair', subjects: [P2], open: true },
  ]);
  for (const e of line.items) {
    for (const k of Object.keys(e)) {
      assert.ok(LEDGER_ITEM_KEYS.includes(k), `entry key "${k}" is inside the exact allowlist`);
    }
  }
});

test('task 67 (writer site): a fully retired order carries items with no partially-done marker', async (t) => {
  const id = 'j-20260913-68';
  const ctx = plantedOrderRepo(
    t,
    id,
    [[P1]],
    {
      '.job/graph.json': sidecarJson({
        [P1]: { symbols: ['s1'], callers: 1, processes: 2, risk: 'LOW', partial: false, truncated: false },
      }),
    },
    'done-content-paths',
    ` ${P1}`,
  );
  const res = await go67(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  const line = readLedger(ctx).at(-1);
  assert.equal(line.note, undefined, 'nothing open, nothing to record');
  assert.equal(Object.hasOwn(line, 'partially_done'), false, 'no marker when every item retired');
  assert.deepEqual(line.items, [
    {
      index: 0,
      bead: null,
      type: 'repair',
      subjects: [P1],
      via: 'diff',
      graph_symbols: 1,
      graph_processes: 2,
      graph_risk: 'LOW',
    },
  ]);
});

test('task 67 (writer site, negative): a job with no work order writes no items key at all', async (t) => {
  const id = 'j-20260913-69';
  const ctx = makeRepo({
    now: () => NOW67,
    runners: runnersYaml({
      command: mockCommand('done-edit'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  t.after(() => ctx.cleanup());
  plantJobBranch(ctx, id, {
    brief: '# an old-contract brief\n',
    files: {
      '.job/source.json': `${JSON.stringify({ job: id, type: 'repair', source: 'queue', issues: [] }, null, 2)}\n`,
    },
  });
  writeLedger(ctx, []);
  writeQueue(ctx, []);
  const res = await go67(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  const line = readLedger(ctx).at(-1);
  assert.equal(Object.hasOwn(line, 'items'), false, 'old-contract branches carry no items key');
  assert.equal(Object.hasOwn(line, 'partially_done'), false, 'and no marker');
});
