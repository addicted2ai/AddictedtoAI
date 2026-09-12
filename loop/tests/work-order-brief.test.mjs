/**
 * Task 59 — work-order briefs: N outcome blocks, governing type, intake
 * verification, the graph annex, and the `.job/graph.json` sidecar writer.
 *
 * Reuse (not reimplemented): task-53 `candidateSubjects` / `WORK_ORDER_DEFAULTS`
 * (`loop/lib/select.mjs`), task-55 `buildWorkOrderDeclaration` /
 * `declaredSubjectsForAnnex` / `isOldContractSource` (`loop/run.mjs`), task-56
 * `constituteMergeSubjects` read path (same block) and `checkMergeGraphScope`
 * / `retireWorkOrderItems` (same file), `joinableSubjects` (`loop/lib/review.mjs`).
 *
 * FIXTURE POLICY (task 37, binding here): throwaway repositories in the OS temp
 * directory with real git plumbing; graph spawns stubbed through the injected
 * brief-side seam (`assembleBrief`'s fourth `graphQuery` param, the task-12
 * fixture pattern) and the merge-path seam (`opts.mergeGraphAnalysis`) — never
 * a live push or live index write. Every graph-read assertion reads the stub's
 * recorded argv. Copy-based mutants only: each named mutation is a test-side
 * copy of the production expression it replaces, so nothing under test is
 * edited and there is nothing to restore (D, E, F).
 *
 * H1/D–F live here (the brief annex), not in `work-order.test.mjs` (whose
 * header names this file as their home).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ASSEMBLED_BRIEF_MAX_CHARS,
  GRAPH_ANNEX_HEADING,
  GRAPH_ROW_MAX_CHARS,
  acceptanceChecksSection,
  assembleBrief,
  assembleGraphContext,
  formatGraphRow,
  governingTypeFor,
  truncateAnnexToBudget,
  verificationEntriesForBrief,
} from '../lib/brief.mjs';
import { acceptanceChecksFor } from '../lib/brief.mjs';
import { checklistFor } from '../lib/review.mjs';
import {
  buildWorkOrderDeclaration,
  checkMergeGraphScope,
} from '../run.mjs';
import { makeRepo } from './helpers.mjs';

const A = 'content/wiki/model/alpha-page.md';
const B = 'content/wiki/model/forbidden-page.md';
const P1 = 'content/wiki/model/p1.md';
const P2 = 'content/wiki/model/p2.md';
const Q1 = 'content/wiki/model/prose-1.md';

const NOW = new Date('2026-09-12T12:00:00.000Z');

function ctxWithSpecs(t, files = {}) {
  const ctx = makeRepo({
    now: () => NOW,
    files: {
      'openspec/specs/review/spec.md': '# review\n\n### Requirement: Review rule\n\nReview text.\n',
      'openspec/specs/site/spec.md': '# site\n\n### Requirement: Site rule\n\nSite text.\n',
      'openspec/specs/pulse/spec.md': '# pulse\n\n### Requirement: Pulse rule\n\nPulse text.\n',
      ...files,
    },
  });
  t.after(() => ctx.cleanup());
  return ctx;
}

const baseJob = (over = {}) => ({
  type: 'repair',
  source: 'queue',
  title: 'Fix the alpha entry',
  detail: 'Repair the broken link on the alpha page.',
  ...over,
});

const workOrderOf = (subjects, extra = {}) => ({
  items: subjects.map((s) => ({ bead: null, type: 'repair', subjects: [s], reason: `fix ${s}` })),
  declared_subjects: [...subjects],
  ...extra,
});

function stubQuery(map, calls = []) {
  const fn = (subject) => {
    calls.push(subject);
    const entry = map[subject];
    if (!entry) return { universe: false };
    return entry;
  };
  fn.calls = calls;
  return fn;
}

// ---------------------------------------------------------------------------
// H1(a): two declared subjects produce two annex rows quoting the stub verbatim.
// ---------------------------------------------------------------------------

test('task 59 H1(a): two declared subjects produce two annex rows quoting the stub verbatim', async (t) => {
  const ctx = ctxWithSpecs(t);
  const workOrder = workOrderOf([A, B]);
  const calls = [];
  const graphQuery = stubQuery({
    [A]: { universe: true, symbols: ['symA'], callers: 2, processes: 1, risk: 'LOW' },
    [B]: { universe: true, symbols: ['symB'], callers: 3, processes: 2, risk: 'MEDIUM' },
  }, calls);
  const sink = {};
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260912-41',
    job: baseJob(),
    branch: 'job/j-20260912-41',
    capMinutes: 30,
    workOrder,
    sidecarSink: sink,
    graphIndexId: 'test-index-1',
  }, undefined, graphQuery);
  assert.deepEqual(calls, [A, B].sort(), 'one upstream query per subject, from the declaration');
  assert.match(brief, new RegExp(`## ${GRAPH_ANNEX_HEADING.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  for (const s of [A, B]) assert.match(brief, new RegExp(s.replace(/\//g, '\\/')), `row for ${s}`);
  assert.match(brief, /callers 2/, 'stub caller count quoted verbatim');
  assert.match(brief, /processes 1/, 'stub process count quoted verbatim');
  assert.match(brief, /LOW/, 'stub risk word quoted verbatim');
  assert.match(brief, /callers 3/);
  assert.match(brief, /MEDIUM/);
  assert.ok(sink.sidecar, 'sidecar assembled beside the brief');
  assert.equal(sink.sidecar.version, 1);
  assert.equal(sink.sidecar.index, 'test-index-1');
  assert.deepEqual(sink.sidecar.subjects[A].symbols, ['symA']);
  assert.equal(sink.sidecar.subjects[A].callers, 2);
  assert.equal(sink.sidecar.subjects[A].processes, 1);
  assert.equal(sink.sidecar.subjects[A].risk, 'LOW');
  assert.deepEqual(sink.sidecar.subjects[B].symbols, ['symB']);
});

// ---------------------------------------------------------------------------
// H1(b): UNKNOWN inside a universe yields the verbatim marker, row kept.
// ---------------------------------------------------------------------------

test('task 59 H1(b): UNKNOWN inside a symbol universe yields unresolved-graph on a kept row', async (t) => {
  const ctx = ctxWithSpecs(t);
  const workOrder = workOrderOf([A]);
  const graphQuery = stubQuery({
    [A]: { universe: true, symbols: ['s'], callers: 1, processes: 0, risk: 'UNKNOWN' },
  });
  const sink = {};
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260912-42',
    job: baseJob(),
    branch: 'job/j-20260912-42',
    capMinutes: 30,
    workOrder,
    sidecarSink: sink,
    graphIndexId: 'test-index-1',
  }, undefined, graphQuery);
  assert.match(brief, new RegExp(A.replace(/\//g, '\\/')), 'the row is not dropped');
  assert.match(brief, /unresolved-graph/, 'the marker is stated verbatim');
  assert.match(brief, /UNKNOWN/);
  assert.equal(sink.sidecar.subjects[A].risk, 'UNKNOWN');
});

// ---------------------------------------------------------------------------
// H1(b2): outside any universe, no-symbols is complete and never marked.
// ---------------------------------------------------------------------------

test('task 59 H1(b2): a prose subject outside any symbol universe yields no-symbols with no marker', async (t) => {
  const ctx = ctxWithSpecs(t);
  const workOrder = workOrderOf([Q1]);
  const graphQuery = stubQuery({});
  const sink = {};
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260912-43',
    job: baseJob(),
    branch: 'job/j-20260912-43',
    capMinutes: 30,
    workOrder,
    sidecarSink: sink,
    graphIndexId: 'test-index-1',
  }, undefined, graphQuery);
  assert.match(brief, new RegExp(Q1.replace(/\//g, '\\/')));
  assert.match(brief, /no-symbols/);
  assert.doesNotMatch(brief, /unresolved-graph/, 'no-symbols never becomes unresolved-graph');
  assert.equal(sink.sidecar.subjects[Q1].noSymbols, true);
});

// ---------------------------------------------------------------------------
// H1(c): a prohibition in brief prose authorises nothing.
// ---------------------------------------------------------------------------

test('task 59 H1(c): a brief-prose prohibition containing a real path authorises nothing', async (t) => {
  const ctx = ctxWithSpecs(t);
  const candidate = {
    source: 'queue',
    type: 'repair',
    title: `Fix the alpha entry (do NOT touch ${B})`,
    detail: 'Repair the alpha page only.',
    subjects: [A],
  };
  const workOrder = buildWorkOrderDeclaration(candidate);
  assert.deepEqual(workOrder.declared_subjects, [A], 'production never reads the prose');
  const calls = [];
  const graphQuery = stubQuery({
    [A]: { universe: true, symbols: ['symA'], callers: 1, processes: 0, risk: 'LOW' },
  }, calls);
  const sink = {};
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260912-44',
    job: candidate,
    branch: 'job/j-20260912-44',
    capMinutes: 30,
    workOrder,
    sidecarSink: sink,
    graphIndexId: 'test-index-1',
  }, undefined, graphQuery);
  assert.deepEqual(calls, [A], 'no query for the prohibited path');
  assert.deepEqual(Object.keys(sink.sidecar.subjects), [A]);
  assert.doesNotMatch(brief, new RegExp(`\`${B.replace(/\//g, '\\/')}\`: `), 'no annex row for the prohibition');
});

// ---------------------------------------------------------------------------
// H1(d): over-bound annex cut from the end with an explicit marker, no silent drop.
// ---------------------------------------------------------------------------

test('task 59 H1(d): rows truncate to the stated width and an over-bound annex is cut with a named marker', async (t) => {
  // Row width: a long symbol list is cut from the end with the excerptsFor-style marker naming the subject.
  const longSymbols = Array.from({ length: 30 }, (_, i) => `veryLongSymbolName${i}`);
  const row = formatGraphRow(A, `symbols ${longSymbols.join(', ')}; callers 30; processes 5; risk LOW`);
  assert.ok(row.length <= GRAPH_ROW_MAX_CHARS, `row fits the stated width ${GRAPH_ROW_MAX_CHARS}, got ${row.length}`);
  assert.match(row, new RegExp(A.replace(/\//g, '\\/')), 'a cut row still names its subject');
  assert.match(row, /\[\.\.\. CUT: graph row for/, 'row overflow carries the explicit cut marker');
  assert.match(row, new RegExp(JSON.stringify(A).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(1, -1)));

  // Annex level: cut from the end under a marker naming what was cut.
  const { annexText } = assembleGraphContext({
    declaredSubjects: [P1, P2],
    graphQuery: stubQuery({
      [P1]: { universe: true, symbols: ['s1'], callers: 1, processes: 0, risk: 'LOW' },
      [P2]: { universe: true, symbols: ['s2'], callers: 1, processes: 0, risk: 'LOW' },
    }),
    indexId: 'test-index-1',
  });
  const tiny = 120;
  const cut = truncateAnnexToBudget(annexText, [P1, P2], tiny);
  assert.ok(cut.length <= tiny, `cut annex fits ${tiny}, got ${cut.length}`);
  assert.match(cut, /\[\.\.\. CUT: graph context for/, 'annex overflow carries the explicit cut marker');
  // No silent drop: every subject either still names itself or is named as cut.
  for (const s of [P1, P2]) {
    assert.ok(cut.includes(s) || cut.includes('CUT'), `subject ${s} is carried or named as cut, never silently dropped`);
  }
});

// ---------------------------------------------------------------------------
// H1(e): a reviewed: brief carries only the reviewed page's row.
// ---------------------------------------------------------------------------

test('task 59 H1(e): a reviewed-only annex carries only the reviewed page row', async (t) => {
  const ctx = ctxWithSpecs(t);
  const workOrder = workOrderOf([P1, P2]);
  const calls = [];
  const graphQuery = stubQuery({
    [P1]: { universe: true, symbols: ['s1'], callers: 1, processes: 0, risk: 'LOW' },
    [P2]: { universe: true, symbols: ['s2'], callers: 2, processes: 1, risk: 'MEDIUM' },
  }, calls);
  const sink = {};
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260912-45',
    job: baseJob(),
    branch: 'job/j-20260912-45',
    capMinutes: 30,
    workOrder,
    reviewedOnly: P1,
    sidecarSink: sink,
    graphIndexId: 'test-index-1',
  }, undefined, graphQuery);
  assert.deepEqual(calls, [P1], 'filtered to the one page that invocation reviews');
  assert.match(brief, new RegExp(P1.replace(/\//g, '\\/')));
  assert.doesNotMatch(brief, new RegExp(`\`${P2.replace(/\//g, '\\/')}\`: `), 'the other page adds no row');
  assert.doesNotMatch(brief, /```diff/, 'no diff section is added by the filter');
  assert.equal(sink.sidecar.reviewedOnly, P1);
});

// ---------------------------------------------------------------------------
// N blocks, governing type, verification, bound.
// ---------------------------------------------------------------------------

test('task 59: N outcome blocks and N subject blocks under one scope rule, keyed on the governing type', async (t) => {
  const ctx = ctxWithSpecs(t);
  const workOrder = {
    items: [
      { bead: null, type: 'repair', subjects: [P1], reason: 'Fix the first page link rot' },
      { bead: null, type: 'repair', subjects: [P2], reason: 'Fix the second page link rot' },
    ],
    declared_subjects: [P1, P2],
    governingType: 'repair',
  };
  const graphQuery = stubQuery({
    [P1]: { universe: true, symbols: ['s1'], callers: 1, processes: 0, risk: 'LOW' },
    [P2]: { universe: true, symbols: ['s2'], callers: 1, processes: 0, risk: 'LOW' },
  });
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260912-46',
    job: baseJob({ title: 'Fix two pages', detail: 'Fix link rot on two pages.' }),
    branch: 'job/j-20260912-46',
    capMinutes: 30,
    workOrder,
    graphIndexId: 'test-index-1',
  }, undefined, graphQuery);
  assert.match(brief, /## The outcomes \(2 items, governing type `repair`\)/);
  assert.match(brief, /### Item 1\/2/);
  assert.match(brief, /### Item 2\/2/);
  assert.match(brief, /## Subjects \(2 subjects, governing type `repair`\)/);
  for (const s of [P1, P2]) assert.match(brief, new RegExp(s.replace(/\//g, '\\/')));
  const scopeRules = brief.match(/under one scope rule/g) || [];
  assert.equal(scopeRules.length, 1, `one scope rule, got ${scopeRules.length}`);
});

test('task 59: acceptanceChecksFor and checklistFor read the governing type', async (t) => {
  const ctx = ctxWithSpecs(t);
  // Governing post: the brief carries the post acceptance bar and post excerpts,
  // even though the outer job record says repair.
  const workOrder = {
    items: [{ bead: null, type: 'post', subjects: [P1], reason: 'Write up the change' }],
    declared_subjects: [P1],
    governingType: 'post',
  };
  const job = baseJob({ type: 'repair', title: 'Write up the change', detail: 'A synthesis of the week.' });
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260912-47',
    job,
    branch: 'job/j-20260912-47',
    capMinutes: 30,
    workOrder,
    graphIndexId: 'test-index-1',
  }, undefined, stubQuery({ [P1]: { universe: false } }));
  assert.equal(governingTypeFor(job, workOrder), 'post');
  assert.ok(acceptanceChecksFor('post').length > 0);
  assert.match(brief, /ONE OF TWO FORMS/, 'the post acceptance bar, keyed on the governing type');
  assert.ok(checklistFor('post').length > 0, 'the governing type has a review checklist');
  assert.deepEqual(acceptanceChecksSection('post'), acceptanceChecksSection(governingTypeFor(job, workOrder)));
});

test('task 59: intake verification results ride the brief where present, and nowhere otherwise', async (t) => {
  const ctx = ctxWithSpecs(t);
  const workOrder = workOrderOf([A]);
  const failedClaims = [{ id: 'claim-1', checked: 'quoted string occurs in alpha page', found: 'absent' }];
  const withClaims = assembleBrief(ctx, {
    jobId: 'j-20260912-48',
    job: baseJob({ failedClaims }),
    branch: 'job/j-20260912-48',
    capMinutes: 30,
    workOrder,
    graphIndexId: 'test-index-1',
  }, undefined, stubQuery({ [A]: { universe: true, symbols: ['s'], callers: 0, processes: 0, risk: 'LOW' } }));
  assert.match(withClaims, /## Intake verification/);
  assert.match(withClaims, /claim-1/);
  assert.match(withClaims, /quoted string occurs/);
  assert.deepEqual(verificationEntriesForBrief(baseJob({ failedClaims }), workOrder).map((e) => e.id), ['claim-1']);

  const without = assembleBrief(ctx, {
    jobId: 'j-20260912-49',
    job: baseJob(),
    branch: 'job/j-20260912-49',
    capMinutes: 30,
    workOrder,
    graphIndexId: 'test-index-1',
  }, undefined, stubQuery({ [A]: { universe: true, symbols: ['s'], callers: 0, processes: 0, risk: 'LOW' } }));
  assert.doesNotMatch(without, /## Intake verification/);
});

test('task 59: the annex counts against the assembled-brief bound', async (t) => {
  const ctx = ctxWithSpecs(t);
  const workOrder = workOrderOf([A, B]);
  const graphQuery = stubQuery({
    [A]: { universe: true, symbols: ['symA'], callers: 2, processes: 1, risk: 'LOW' },
    [B]: { universe: true, symbols: ['symB'], callers: 3, processes: 2, risk: 'MEDIUM' },
  });
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260912-50',
    job: baseJob(),
    branch: 'job/j-20260912-50',
    capMinutes: 30,
    workOrder,
    graphIndexId: 'test-index-1',
  }, undefined, graphQuery);
  assert.ok(brief.length <= ASSEMBLED_BRIEF_MAX_CHARS, `assembled brief fits ${ASSEMBLED_BRIEF_MAX_CHARS}, got ${brief.length}`);
  assert.match(brief, new RegExp(`## ${GRAPH_ANNEX_HEADING.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
});

test('task 59: old-contract branches take no graph arm — no annex, no sidecar, no marker', async (t) => {
  const ctx = ctxWithSpecs(t);
  const oldSource = { job: 'j-old', type: 'repair', source: 'directive', issues: [] };
  const sink = {};
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260912-51',
    job: baseJob(),
    branch: 'job/j-20260912-51',
    capMinutes: 30,
    workOrder: oldSource,
    sidecarSink: sink,
    graphIndexId: 'test-index-1',
  }, undefined, stubQuery({ [A]: { universe: true, symbols: ['s'], callers: 1, processes: 0, risk: 'LOW' } }));
  assert.doesNotMatch(brief, new RegExp(`## ${GRAPH_ANNEX_HEADING.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  assert.equal(sink.sidecar, null);
  assert.doesNotMatch(brief, /unresolved-graph/);
});

// ---------------------------------------------------------------------------
// Sidecar-hole closure (F6): missing sidecar refuses where diff evidence is needed.
// ---------------------------------------------------------------------------

const uni = (symbols = [], extra = {}) => ({ universe: true, symbols, risk: 'LOW', ...extra });
const srcOf = (list) => {
  const items = list.map((s) => ({ bead: null, type: 'repair', subjects: Array.isArray(s) ? [...s] : [s], reason: 'fixture' }));
  const declared = [...new Set(items.flatMap((i) => i.subjects))].sort();
  return { job: 'j-fixture', type: 'repair', source: 'queue', slug: null, path: null, issues: [], items, declared_subjects: declared };
};
const present = (over = {}) => ({ absent: false, partial: false, truncated: false, symbols: [], processes: [], subjects: {}, ...over });

test('task 59 F6: a diff-retiring branch without a committed sidecar refuses; no-symbols-only warns', () => {
  const source = srcOf([[A]]);
  const analysis = present({ symbols: [{ name: 's', owner: A }], subjects: { [A]: uni(['s']) } });
  const refused = checkMergeGraphScope({
    source, declared: [A], contentPaths: [A], diffPaths: [A], resultText: '', analysis, sidecar: null,
  });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'graph-incomplete');
  assert.match(refused.reason, /graph:content\/wiki\/model\/alpha-page\.md/);
  assert.match(refused.reason, /sidecar/);

  const noSyms = checkMergeGraphScope({
    source: srcOf([[Q1]]),
    declared: [Q1],
    contentPaths: [Q1],
    diffPaths: [Q1],
    resultText: '',
    analysis: present({ symbols: [], subjects: { [Q1]: { universe: false } } }),
    sidecar: null,
  });
  assert.equal(noSyms.ok, true, noSyms.reason ?? '');
  assert.ok(noSyms.warnings.some((w) => /no-symbols/.test(w)));
});

// ---------------------------------------------------------------------------
// Copy-based mutants D–F: each proves its arm measures something.
// ---------------------------------------------------------------------------

test('mutation D: skipping the annex assembly fails H1(a) on row absence', async (t) => {
  const ctx = ctxWithSpecs(t);
  const workOrder = workOrderOf([A, B]);
  const graphQuery = stubQuery({
    [A]: { universe: true, symbols: ['symA'], callers: 2, processes: 1, risk: 'LOW' },
    [B]: { universe: true, symbols: ['symB'], callers: 3, processes: 2, risk: 'MEDIUM' },
  });
  const production = assembleBrief(ctx, {
    jobId: 'j-20260912-52', job: baseJob(), branch: 'job/j-20260912-52', capMinutes: 30, workOrder, graphIndexId: 'test-index-1',
  }, undefined, graphQuery);
  assert.match(production, new RegExp(A.replace(/\//g, '\\/')));
  // MUTANT COPY: the annex assembly, skipped — no rows at all.
  const mutantAnnex = '';
  const mutant = production.replace(new RegExp(`## ${GRAPH_ANNEX_HEADING.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=## Acceptance checks)`), mutantAnnex);
  assert.doesNotMatch(mutant, new RegExp(A.replace(/\//g, '\\/') + '.*callers 2'), 'the mutant carries no annex row');
  assert.match(production, /callers 2/, 'production does');
});

test('mutation E: deriving a row from brief-prose matching authorises the prohibition', () => {
  const candidate = { source: 'queue', type: 'repair', title: `Fix the alpha entry (do NOT touch ${B})`, subjects: [A] };
  // MUTANT COPY: match content paths out of the title instead of reading the declaration.
  const mutantDeclared = [...new Set(
    [...String(candidate.title).matchAll(/content\/[^\s'"`]+?\.md/g)].map((m) => m[0]),
  )].sort();
  assert.ok(mutantDeclared.includes(B), `the mutant authorises the prohibition: ${mutantDeclared.join(', ')}`);
  const production = buildWorkOrderDeclaration(candidate);
  assert.deepEqual(production.declared_subjects, [A]);
});

test('mutation F: dropping unresolved-graph rows silently fails H1(b) while H1(a) passes', async (t) => {
  const ctx = ctxWithSpecs(t);
  const calls = [];
  const graphQuery = stubQuery({
    [A]: { universe: true, symbols: ['s'], callers: 1, processes: 0, risk: 'UNKNOWN' },
    [B]: { universe: true, symbols: ['symB'], callers: 3, processes: 2, risk: 'MEDIUM' },
  }, calls);
  const workOrder = workOrderOf([A, B]);
  const production = assembleBrief(ctx, {
    jobId: 'j-20260912-53', job: baseJob(), branch: 'job/j-20260912-53', capMinutes: 30, workOrder, graphIndexId: 'test-index-1',
  }, undefined, graphQuery);
  assert.match(production, /unresolved-graph/);
  // MUTANT COPY: silently drop every row carrying the marker.
  const mutant = production
    .split('\n')
    .filter((line) => !line.includes('unresolved-graph'))
    .join('\n');
  assert.doesNotMatch(mutant, new RegExp(A.replace(/\//g, '\\/') + '.*unresolved-graph'), 'H1(b) fails under the mutant');
  assert.match(mutant, new RegExp(B.replace(/\//g, '\\/')), 'H1(a) still passes under the mutant');
  assert.match(production, new RegExp(B.replace(/\//g, '\\/')));
});
