/**
 * Task 56 — the root fix, in `loop/run.mjs` with one parser in
 * `loop/lib/result.mjs`.
 *
 * The merge's subject set is CONSTITUTED from the committed
 * `declared_subjects` (on `reviewed:`, from the executor's declared paths
 * intersected with it); the measured diff is used ONLY to CHECK it (every
 * diff content path inside the declaration, else `scope-violation`);
 * retirement is PER ITEM (measured diff on the item's own subjects or
 * `reviewed:` coverage, else the item stays open and the ledger line records
 * the order partially done); the missing/empty-declaration refusal stays
 * scoped to content-carrying merges per the AMENDED text (task 55); and the
 * H2/H3 folded hooks ride the same gate (content-path-scoped graph
 * corroboration, the `graph-ack:` sibling block honored where present,
 * three-way absence, no transitive refusal, old-contract branches untouched).
 *
 * Reuse (not reimplemented): task-53 `candidateSubjects`/`bundleWorkOrders`
 * (`loop/lib/select.mjs`), task-55 `buildWorkOrderDeclaration` /
 * `checkCommittedDeclaration` / `declarationMergeDecision` /
 * `isOldContractSource` (`loop/run.mjs`), `joinableSubjects` +
 * `writeRecordSubjects` (`loop/lib/review.mjs`).
 *
 * FIXTURE POLICY (task 37, binding here): throwaway repositories in the OS
 * temp directory with real git plumbing; graph spawns stubbed through the
 * injected merge-path seam (`opts.mergeGraphAnalysis`) and the
 * declaration/sidecar read seams — never a live push or live index write.
 * Every history assertion reads the fixture's own branches; every
 * graph-read assertion reads the stub's recorded argv. Copy-based mutants
 * only: each named mutation is a test-side copy of the production
 * expression it replaces, so nothing under test is edited and there is
 * nothing to restore (A, B, C, G, H, I, J1, J2). H1/D–F belong to task 59
 * (the brief annex), not here.
 *
 * Task-56 amendment (in the branch): a declared `data/carried/*.md` path
 * contributes its `subject:` front-matter field to the union (F1 arms
 * below); the code-only exemption downgrades scope-violation only, never
 * `graph-incomplete` (F2 arm below); the binds-nothing log names the
 * declaration (F4 assertion on H2(a2)).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

import {
  buildWorkOrderDeclaration,
  checkDeclarationSubset,
  checkMergeGraphScope,
  constituteMergeSubjects,
  declarationMergeDecision,
  resolveCarriedDeclaration,
  retireWorkOrderItems,
  runLoop,
} from '../run.mjs';
import { graphAckForSubject, parseGraphAck } from '../lib/result.mjs';
import { checkWorkOrderMergeBounds, joinableSubjects, mergeGate, verdictPath, writeRecordSubjects, writeVerdictRecord } from '../lib/review.mjs';
import { bundleWorkOrders } from '../lib/select.mjs';
import { readCommittedJobSource } from '../lib/resume.mjs';
import { readLedger } from '../lib/ledger.mjs';
import {
  git,
  makeRepo,
  mockCommand,
  plantJobBranch,
  runnersYaml,
  writeLedger,
  writeQueue,
} from './helpers.mjs';

const NOW = new Date('2026-09-12T12:00:00.000Z');

const A = 'content/wiki/model/alpha-page.md';
const B = 'content/wiki/model/forbidden-page.md';
const P1 = 'content/wiki/model/p1.md';
const P2 = 'content/wiki/model/p2.md';
const P3 = 'content/wiki/model/p3.md';
const P4 = 'content/wiki/model/p4.md';
const F = 'loop/lib/fixture-shared.mjs';
const PA = 'content/wiki/model/page-a.md';
const PB = 'content/wiki/model/page-b.md';
const Q1 = 'content/wiki/model/prose-1.md';
const Q2 = 'content/wiki/model/prose-2.md';

const item = (subjects) => ({ bead: null, type: 'repair', subjects, reason: 'fixture' });
const sourceOf = (list) => {
  const items = list.map((s) => item(Array.isArray(s) ? [...s] : [s]));
  const declared = [...new Set(items.flatMap((i) => i.subjects))].sort();
  return { job: 'j-fixture', type: 'repair', source: 'queue', slug: null, path: null, issues: [], items, declared_subjects: declared };
};
const uni = (symbols = [], extra = {}) => ({ universe: true, symbols, risk: 'LOW', ...extra });

function go(ctx, extra = {}) {
  return runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true, ...extra });
}

function selectionRepo(t, queueItem, authorMode, authorExtra = '') {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({
      command: mockCommand(authorMode, authorExtra),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  t.after(() => ctx.cleanup());
  writeQueue(ctx, [queueItem]);
  writeLedger(ctx, []);
  return ctx;
}

function plantWorkOrder(ctx, id, list, extraFiles = {}) {
  const items = list.map((s) => item(Array.isArray(s) ? [...s] : [s]));
  const declared = [...new Set(items.flatMap((i) => i.subjects))].sort();
  const source = { job: id, type: 'repair', source: 'queue', slug: null, path: null, issues: [], items, declared_subjects: declared };
  plantJobBranch(ctx, id, {
    brief: '# a planted work-order brief\n',
    files: { '.job/source.json': `${JSON.stringify(source, null, 2)}\n`, ...extraFiles },
  });
  writeLedger(ctx, []);
  writeQueue(ctx, []);
  return { source, declared };
}

// ---------------------------------------------------------------------------
// Constitution.
// ---------------------------------------------------------------------------

test('task 56: the merge subject set is constituted from the committed declaration, never the diff', () => {
  const source = sourceOf([[A], [B]]);
  const c = constituteMergeSubjects(source);
  assert.equal(c.ok, true);
  assert.deepEqual(c.subjects, [A, B].sort());
  // A copy, not an alias: mutating the constituted set moves no record.
  c.subjects.push('content/wiki/model/injected.md');
  assert.deepEqual(source.declared_subjects, [A, B].sort());
  // The diff is not read at all — not even for ordering.
  const fromDiff = joinableSubjects([{ status: 'M', path: B }]);
  assert.deepEqual(fromDiff, [B]);
  assert.deepEqual(constituteMergeSubjects(source).subjects, [A, B].sort());
});

test('task 56: on the read-and-unchanged outcome the set is the executor paths intersected with the declaration', () => {
  const source = sourceOf([[A], [B]]);
  const c = constituteMergeSubjects(source, { executorPaths: [B, 'content/wiki/model/elsewhere.md'] });
  assert.equal(c.ok, true);
  assert.deepEqual(c.subjects, [B], 'intersected: the executor-only path authorises nothing');
});

test('task 56: old-contract sources constitute nothing; missing/empty declarations refuse', () => {
  const old = { job: 'j-old', type: 'repair', source: 'directive', issues: [] };
  const cOld = constituteMergeSubjects(old);
  assert.equal(cOld.ok, true);
  assert.equal(cOld.oldContract, true);
  assert.equal(cOld.subjects, null, 'the caller falls back to the diff-derived set, exactly as before');

  assert.equal(constituteMergeSubjects(null).oldContract, true);
  const empty = { items: [item([])], declared_subjects: [] };
  const cEmpty = constituteMergeSubjects(empty);
  assert.equal(cEmpty.ok, false);
  assert.equal(cEmpty.code, 'missing-declaration');
  // The refusal itself stays scoped per the AMENDED text (task 55): only
  // where the diff carries content paths.
  assert.equal(declarationMergeDecision(empty, [A]).ok, false);
  assert.equal(declarationMergeDecision(empty, []).ok, true);
});

test('task 56: the subset check names every undeclared content path (scope-violation)', () => {
  assert.deepEqual(checkDeclarationSubset([A], [A, B]), { ok: true, undeclared: [] });
  assert.deepEqual(checkDeclarationSubset([], [A]), { ok: true, undeclared: [] });
  const bad = checkDeclarationSubset([A, B], [A]);
  assert.equal(bad.ok, false);
  assert.deepEqual(bad.undeclared, [B]);
});

// ---------------------------------------------------------------------------
// Per-item retirement.
// ---------------------------------------------------------------------------

test('task 56: four items across four subjects with one file changed retires one and leaves three open', () => {
  const source = sourceOf([[P1], [P2], [P3], [P4]]);
  const r = retireWorkOrderItems(source, { diffPaths: [P2] });
  assert.equal(r.retired.length, 1);
  assert.equal(r.retired[0].index, 1);
  assert.equal(r.retired[0].via, 'diff');
  assert.deepEqual(r.retired[0].touched, [P2]);
  assert.deepEqual(r.open.map((o) => o.index), [0, 2, 3]);
  assert.equal(r.partiallyDone, true);
  assert.match(r.note, /partially done: retired 1 of 4 items/);
  for (const p of [P1, P3, P4]) assert.match(r.note, new RegExp(p.replace(/\//g, '\\/')), `the note names ${p}`);
});

test('task 56: read-and-unchanged coverage retires without a diff; partial coverage retires partially', () => {
  const source = sourceOf([[P1], [P2]]);
  const full = retireWorkOrderItems(source, { diffPaths: [], reviewedPaths: [P1, P2] });
  assert.equal(full.retired.length, 2);
  assert.ok(full.retired.every((e) => e.via === 'reviewed'));
  assert.equal(full.partiallyDone, false);
  assert.equal(full.note, null, 'nothing open, nothing to record');

  const part = retireWorkOrderItems(source, { diffPaths: [], reviewedPaths: [P1] });
  assert.deepEqual(part.retired.map((e) => e.index), [0]);
  assert.deepEqual(part.open.map((o) => o.index), [1]);
  assert.match(part.note, /partially done: retired 1 of 2 items/);

  // Coverage of nothing, and an item declaring nothing, retire nothing.
  const none = retireWorkOrderItems(source, { diffPaths: [] });
  assert.equal(none.retired.length, 0);
  assert.equal(none.open.length, 2);
});

test('task 56: old-contract retirement is whole-job (no per-item gate)', () => {
  const r = retireWorkOrderItems({ job: 'j-old', type: 'repair' }, { diffPaths: [A] });
  assert.equal(r.oldContract, true);
});

test('task 56: shared-subject hits need the item\'s own symbol evidence', () => {
  // A declares [PA, F], B declares [PB, F]; the diff touches only the shared
  // code file F. The changed symbol is owned by PA — A's own evidence.
  const source = sourceOf([[PA, F], [PB, F]]);
  const graph = {
    symbols: [{ name: 'symA', owner: PA }],
    subjects: { [F]: uni(['symA']), [PA]: uni(['symA']), [PB]: uni([]) },
  };
  const r = retireWorkOrderItems(source, { diffPaths: [F], graph });
  assert.deepEqual(r.retired.map((e) => e.index), [0], 'only the symbol-evidenced item retires');
  assert.deepEqual(r.open.map((o) => o.index), [1]);
  assert.match(r.open[0].why, /independent path evidence/);
  // Without the graph (absent tool/index) the path checks stand alone: both
  // retire — which is exactly what mutation J1 proves below.
  const absent = retireWorkOrderItems(source, { diffPaths: [F], graph: null });
  assert.deepEqual(absent.retired.map((e) => e.index), [0, 1]);
});

test('task 56: contradiction retires nothing; no-symbols retires on the path diff alone', () => {
  const contra = retireWorkOrderItems(sourceOf([[F]]), {
    diffPaths: [F],
    graph: { symbols: [], subjects: { [F]: uni([]) } },
  });
  assert.equal(contra.retired.length, 0);
  assert.equal(contra.open.length, 1);
  assert.deepEqual(contra.open[0].contradiction, [F]);
  assert.match(contra.open[0].why, /zero symbols/);

  const noSyms = retireWorkOrderItems(sourceOf([[Q1]]), {
    diffPaths: [Q1],
    graph: { symbols: [], subjects: { [Q1]: { universe: false } } },
  });
  assert.deepEqual(noSyms.retired.map((e) => e.index), [0]);
});

// ---------------------------------------------------------------------------
// The `graph-ack:` sibling block.
// ---------------------------------------------------------------------------

test('task 56: graph-ack entries parse per subject with the closed states; malformed excuses nothing', () => {
  const text = [
    'done',
    '',
    'Did the work.',
    '',
    'graph-ack:',
    `  - subject: "graph:${A}"`,
    '    state: path-checked',
    `    evidence: The stub analysis for ${A} reported callers 2 processes 1 risk LOW.`,
    `  - subject: 'graph:${B}'`,
    '    state: noted',
    '    evidence: Carried as a note for the reviewer.',
    `  - subject: graph:${P1}`,
    '    state: deferred',
    '    evidence: Deferred to the train review with cause stated.',
    '',
  ].join('\n');
  const parsed = parseGraphAck(text);
  assert.equal(parsed.present, true);
  assert.equal(parsed.entries.length, 3);
  assert.equal(parsed.malformed.length, 0);
  assert.equal(graphAckForSubject(parsed, A).state, 'path-checked');
  assert.equal(graphAckForSubject(parsed, B).state, 'noted');
  assert.equal(graphAckForSubject(parsed, P1).state, 'deferred');
  assert.equal(graphAckForSubject(parsed, P2), null);

  const bad = parseGraphAck([
    'done',
    'graph-ack:',
    '  - subject: content/wiki/model/bare.md',
    '    state: path-checked',
    '    evidence: Missing the graph namespace.',
    '  - subject: graph:content/wiki/model/x.md',
    '    state: glanced-at',
    '    evidence: Not a closed state.',
    '  - subject: graph:content/wiki/model/y.md',
    '    state: noted',
    '    evidence:   ',
  ].join('\n'));
  assert.equal(bad.present, true);
  assert.equal(bad.entries.length, 0, 'nothing well-formed');
  assert.equal(bad.malformed.length, 3);
  assert.equal(graphAckForSubject(bad, 'content/wiki/model/x.md'), null);
});

test('task 56: an absent graph-ack block reads as no acknowledgement', () => {
  for (const text of ['', 'done\n\nNo block here.\n']) {
    const parsed = parseGraphAck(text);
    assert.equal(parsed.present, false);
    assert.equal(parsed.entries.length, 0);
    assert.equal(graphAckForSubject(parsed, A), null);
  }
});

test('task 56 F1: declared carried files resolve their subject: field into the union', () => {
  const CARRIED_X = 'data/carried/fixture-x.md';
  const readFile = (p) => (p === CARRIED_X ? `---\ntitle: x\nsubject: ${P1}\n---\n\nfinding\n` : null);
  const r = resolveCarriedDeclaration([CARRIED_X, A], { readFile });
  assert.deepEqual(r.subjects, [CARRIED_X, A, P1].sort());
  assert.deepEqual(r.resolved, { [CARRIED_X]: [P1] });
  assert.deepEqual(r.missing, []);

  // Missing, unreadable, malformed and field-less files contribute nothing
  // (fail closed toward refusal) and are reported, never silent.
  const r2 = resolveCarriedDeclaration(
    [CARRIED_X, 'data/carried/gone.md', 'data/carried/nosub.md', 'data/carried/bad.md', 'data/carried/README.md'],
    {
      readFile: (p) => {
        if (p === CARRIED_X) return '---\nsubject: []\n---\n';
        if (p.endsWith('bad.md')) return '---\nsubject: [unclosed\n---\n';
        if (p.endsWith('nosub.md')) return '---\ntitle: no subject here\n---\n\nfinding\n';
        return null;
      },
    },
  );
  assert.deepEqual(r2.subjects, [CARRIED_X, 'data/carried/README.md', 'data/carried/bad.md', 'data/carried/gone.md', 'data/carried/nosub.md'].sort());
  assert.deepEqual(r2.resolved, {});
  assert.deepEqual(r2.missing.map((m) => m.path).sort(), ['data/carried/bad.md', CARRIED_X, 'data/carried/gone.md', 'data/carried/nosub.md'].sort());
  for (const m of r2.missing) assert.ok(m.why, 'every miss carries its reason');

  // The README is not a finding: ignored entirely, not even missing.
  const r3 = resolveCarriedDeclaration(['data/carried/README.md'], { readFile: () => null });
  assert.deepEqual(r3.subjects, ['data/carried/README.md']);
  assert.deepEqual(r3.missing, []);

  // The resolved page counts as the declaring item's own subject at
  // retirement: the fixing diff (on the page) retires the carried item.
  const retired = retireWorkOrderItems(sourceOf([[CARRIED_X]]), {
    diffPaths: [P1],
    carried: { [CARRIED_X]: [P1] },
  });
  assert.deepEqual(retired.retired.map((e) => e.index), [0]);
});

// ---------------------------------------------------------------------------
// The merge-path graph scope gate, unit level.
// ---------------------------------------------------------------------------

const presentAnalysis = (overrides = {}) => ({
  absent: false, partial: false, truncated: false, symbols: [], processes: [], subjects: {}, ...overrides,
});

test('task 56 H2: absent tool/index warns graph-absent and proceeds on the path checks', () => {
  const source = sourceOf([[A]]);
  for (const analysis of [undefined, null, { absent: true, reason: 'no index beside the tree' }]) {
    const g = checkMergeGraphScope({
      source, declared: [A], contentPaths: [A], diffPaths: [A], resultText: '', analysis,
    });
    assert.equal(g.ok, true);
    assert.equal(g.graphStatus, 'absent');
    assert.ok(g.warnings.some((w) => /graph: absent/.test(w)), `warning recorded: ${g.warnings.join(' | ')}`);
    assert.deepEqual(g.retirement.retired.map((e) => e.index), [0]);
  }
});

test('task 56 H2(a): a changed symbol with a content-path owner outside the declaration is scope-violation; transitive processes never refuse', () => {
  const source = sourceOf([[A]]);
  const g = checkMergeGraphScope({
    source,
    declared: [A],
    contentPaths: [A],
    diffPaths: [A],
    resultText: '',
    analysis: presentAnalysis({
      symbols: [{ name: 'symB', owner: B }],
      processes: [{ name: 'train-finding' }],
      subjects: {},
    }),
  });
  assert.equal(g.ok, false);
  assert.equal(g.code, 'scope-violation');
  assert.match(g.reason, new RegExp(B.replace(/\//g, '\\/')));

  // Same shape, but the owner is inside the declaration: the transitive
  // process is recorded for the reviewer and the merge proceeds.
  const h = checkMergeGraphScope({
    source,
    declared: [A],
    contentPaths: [A],
    diffPaths: [A],
    resultText: '',
    analysis: presentAnalysis({
      symbols: [{ name: 'symA', owner: A }, { name: 'helper', owner: 'loop/lib/helper.mjs' }],
      processes: [{ name: 'train-finding' }],
      subjects: { [A]: uni(['symA']) },
    }),
    sidecar: { subjects: { [A]: { symbols: ['symA'] } } },
  });
  assert.equal(h.ok, true, h.reason ?? '');
  assert.ok(h.warnings.some((w) => /never refuses/.test(w)), `transitive reach is reviewer-only: ${h.warnings.join(' | ')}`);
  assert.ok(h.warnings.some((w) => /non-content path/.test(w)));
});

test('task 56 H2(b/c): present-but-incomplete without acknowledgement refuses graph-incomplete; a well-formed entry answers it', () => {
  const source = sourceOf([[A]]);
  const incomplete = presentAnalysis({ partial: true, subjects: { [A]: uni(['s']) } });
  const refused = checkMergeGraphScope({
    source, declared: [A], contentPaths: [A], diffPaths: [A], resultText: '', analysis: incomplete,
  });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'graph-incomplete');
  assert.match(refused.reason, /graph:content\/wiki\/model\/alpha-page\.md/);
  assert.match(refused.reason, /partial/);

  const acked = checkMergeGraphScope({
    source,
    declared: [A],
    contentPaths: [A],
    diffPaths: [A],
    resultText: `done\ngraph-ack:\n  - subject: "graph:${A}"\n    state: noted\n    evidence: The partial flag is noted for the reviewer.\n`,
    analysis: incomplete,
    // Task 59 hole closure: a diff-retiring merge without a sidecar refuses
    // on the sidecar flag even when incompleteness is answered, so the
    // answered case carries its per-item evidence here.
    sidecar: { subjects: { [A]: { symbols: ['s'] } } },
  });
  assert.equal(acked.ok, true, acked.reason ?? '');
  assert.equal(acked.graphStatus, 'incomplete-answered');

  // A truncated flag and an UNKNOWN risk inside a universe refuse the same
  // way; a malformed ack entry excuses nothing.
  for (const flag of [{ truncated: true }, {}]) {
    const subjects = flag.truncated
      ? { [A]: uni(['s'], { truncated: true }) }
      : { [A]: uni(['s'], { risk: 'UNKNOWN' }) };
    const r = checkMergeGraphScope({
      source,
      declared: [A],
      contentPaths: [A],
      diffPaths: [A],
      resultText: 'done\ngraph-ack:\n  - subject: graph:elsewhere.md\n    state: noted\n    evidence: For another subject entirely.\n',
      analysis: presentAnalysis({ ...flag, subjects }),
    });
    assert.equal(r.ok, false, JSON.stringify(flag));
    assert.equal(r.code, 'graph-incomplete');
  }
});

test('task 56 H2(b2): the sidecar check exempts reviewed-coverage retirements and refuses a missing entry', () => {
  const source = sourceOf([[A], [B]]);
  const analysis = presentAnalysis({
    symbols: [{ name: 's', owner: A }],
    subjects: { [A]: uni(['s']), [B]: uni([]) },
  });
  // Reviewed-coverage retirement needs no sidecar at all.
  const exempt = checkMergeGraphScope({
    source, declared: [A, B], contentPaths: [], diffPaths: [], reviewedPaths: [A, B],
    resultText: '', analysis, sidecar: { subjects: {} },
  });
  assert.equal(exempt.ok, true, exempt.reason ?? '');
  assert.deepEqual(exempt.retirement.retired.map((e) => e.index), [0, 1]);

  // A committed sidecar missing the diff-retired subject refuses.
  const missing = checkMergeGraphScope({
    source, declared: [A, B], contentPaths: [A], diffPaths: [A],
    resultText: '', analysis, sidecar: { subjects: { [B]: { symbols: [] } } },
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.code, 'graph-incomplete');
  assert.match(missing.reason, /graph:content\/wiki\/model\/alpha-page\.md/);
  assert.match(missing.reason, /sidecar/);

  // With the entry present, the same merge proceeds.
  const present = checkMergeGraphScope({
    source, declared: [A, B], contentPaths: [A], diffPaths: [A],
    resultText: '', analysis, sidecar: { subjects: { [A]: { symbols: ['s'] } } },
  });
  assert.equal(present.ok, true, present.reason ?? '');
  assert.deepEqual(present.retirement.retired.map((e) => e.index), [0]);
  assert.deepEqual(present.retirement.open.map((o) => o.index), [1]);
});

test('task 56: an unanswered UNKNOWN risk inside a symbol universe is never an all-clear', () => {
  const source = sourceOf([[A]]);
  const g = checkMergeGraphScope({
    source, declared: [A], contentPaths: [A], diffPaths: [A], resultText: '',
    analysis: presentAnalysis({ subjects: { [A]: uni(['s'], { risk: 'UNKNOWN' }) } }),
  });
  assert.equal(g.ok, false);
  assert.equal(g.code, 'graph-incomplete');
  // Outside any symbol universe the same risk word is complete.
  const h = checkMergeGraphScope({
    source, declared: [A], contentPaths: [A], diffPaths: [A], resultText: '',
    analysis: presentAnalysis({ subjects: { [A]: { universe: false, risk: 'UNKNOWN' } } }),
  });
  assert.equal(h.ok, true, h.reason ?? '');
});

// ---------------------------------------------------------------------------
// Copy-based mutants: each proves its arm measures something.
// ---------------------------------------------------------------------------

test('mutation A: constituting subjects from the diff again binds nothing on the empty-diff reviewed case', () => {
  // The reviewed empty diff: no content paths to constitute from.
  const mutantSubjects = joinableSubjects([]);
  assert.deepEqual(mutantSubjects, [], 'the diff-constituted set is empty');

  const ctx = makeRepo({ now: () => NOW });
  try {
    const p = writeVerdictRecord(ctx, 'j-mutant-a', { verdict: 'approve', wouldCite: 'someone', notes: 'n' });
    assert.equal(writeRecordSubjects(p, mutantSubjects).ok, false, 'the mutant writes no binding');
    const production = constituteMergeSubjects(sourceOf([[P1], [P2]]), { executorPaths: [P1, P2] });
    assert.deepEqual(production.subjects, [P1, P2]);
    assert.equal(writeRecordSubjects(p, production.subjects).ok, true, 'the declaration-constituted set binds both pages');
    const data = matter(readFileSync(p, 'utf8')).data;
    assert.deepEqual([...data.subject].sort(), [P1, P2]);
  } finally {
    ctx.cleanup();
  }
});

test('mutation B: retiring every item on any diff wrongly retires three of four', () => {
  const source = sourceOf([[P1], [P2], [P3], [P4]]);
  const diffPaths = [P2];
  // MUTANT COPY: the per-item measured-diff check, dropped.
  const mutantRetired = diffPaths.length > 0 ? source.items.map((item, index) => index) : [];
  assert.deepEqual(mutantRetired, [0, 1, 2, 3], 'the mutant retires the whole order on one file');
  const production = retireWorkOrderItems(source, { diffPaths });
  assert.deepEqual(production.retired.map((e) => e.index), [1]);
  assert.deepEqual(production.open.map((o) => o.index), [0, 2, 3]);
});

test('mutation C: deriving declared subjects from brief prose authorises the prohibition', () => {
  const candidate = {
    source: 'queue', type: 'repair',
    title: `fix the alpha entry (do NOT touch ${B})`,
    subjects: [A],
  };
  // MUTANT COPY: match content paths out of the title instead of reading
  // declared metadata.
  const mutantDeclared = [...new Set(
    [...String(candidate.title).matchAll(/content\/[^\s'"`]+?\.md/g)].map((m) => m[0]),
  )].sort();
  assert.ok(mutantDeclared.includes(B), `the mutant authorises the prohibition: ${mutantDeclared.join(', ')}`);
  assert.ok(
    checkDeclarationSubset([A, B], [...new Set([...mutantDeclared, A])].sort()).ok,
    'under the mutant the forbidden diff is inside the declaration — it merges',
  );
  const production = buildWorkOrderDeclaration(candidate);
  assert.deepEqual(production.declared_subjects, [A], 'production never reads the prose');
  assert.equal(checkDeclarationSubset([A, B], production.declared_subjects).ok, false);
});

test('mutation G: diff-constitution under the stub writes no binding on the reviewed empty diff', () => {
  const analysis = presentAnalysis({ subjects: { [P1]: uni([]), [P2]: uni([]) } });
  assert.equal(analysis.absent, false);
  // Mutation G is mutation A under the stub: the constituted set is still
  // the empty diff, so still no binding — while the declaration intersected
  // with the executor paths binds both pages.
  assert.deepEqual(joinableSubjects([]), []);
  const production = constituteMergeSubjects(sourceOf([[P1], [P2]]), { executorPaths: [P1, P2] });
  assert.deepEqual(production.subjects, [P1, P2]);
});

test('mutation H: ignoring partial/truncated merges H2(b) when it must not', () => {
  const source = sourceOf([[A]]);
  const flagged = presentAnalysis({ partial: true, subjects: { [A]: uni(['s']) } });
  // Task 59 hole closure carries a sidecar in both arms so the mutant's
  // distinction stays on the flags (not on the missing-sidecar refusal).
  const sidecar = { subjects: { [A]: { symbols: ['s'] } } };
  const production = checkMergeGraphScope({
    source, declared: [A], contentPaths: [A], diffPaths: [A], resultText: '', analysis: flagged, sidecar,
  });
  assert.equal(production.ok, false);
  assert.equal(production.code, 'graph-incomplete');
  // MUTANT COPY: the flags, ignored.
  const mutant = checkMergeGraphScope({
    source, declared: [A], contentPaths: [A], diffPaths: [A], resultText: '',
    analysis: { ...flagged, partial: false, truncated: false },
    sidecar,
  });
  assert.equal(mutant.ok, true, 'the mutant merges a partial answer with no acknowledgement');
});

test('mutation I: reading the working-tree declaration instead of history refuses on the wrong source', async (t) => {
  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  const id = 'j-20260912-11';
  const committed = { job: id, type: 'repair', source: 'queue', slug: null, path: null, issues: [], items: [item([A])], declared_subjects: [A] };
  plantJobBranch(ctx, id, {
    brief: '# a planted brief\n',
    files: { '.job/source.json': `${JSON.stringify(committed, null, 2)}\n` },
  });
  // Diverge the working tree without committing.
  const dir = join(ctx.testRoot, `diverge-${id}`);
  git(ctx.repoRoot, ['worktree', 'add', dir, `job/${id}`]);
  try {
    mkdirSync(join(dir, '.job'), { recursive: true });
    const diverged = { ...committed, items: [item([B])], declared_subjects: [B] };
    writeFileSync(join(dir, '.job', 'source.json'), `${JSON.stringify(diverged, null, 2)}\n`, 'utf8');

    // PRODUCTION: the declaration-read seam reads history. Wrap it in a
    // recorder — the H2(a) arm asserts on this call.
    const calls = [];
    const historyReader = (repo, branch) => {
      calls.push({ repo, branch });
      return readCommittedJobSource(repo, branch);
    };
    const read = historyReader(ctx.repoRoot, `job/${id}`);
    assert.deepEqual(read.declared_subjects, [A]);
    assert.deepEqual(calls, [{ repo: ctx.repoRoot, branch: `job/${id}` }]);
    // On history, a diff of [A, P1] refuses naming P1 only.
    assert.deepEqual(checkDeclarationSubset([A, P1], read.declared_subjects), { ok: false, undeclared: [P1] });

    // MUTANT COPY: the history read, deleted in favour of the working tree.
    const mutantRead = JSON.parse(readFileSync(join(dir, '.job', 'source.json'), 'utf8'));
    assert.deepEqual(mutantRead.declared_subjects, [B]);
    assert.deepEqual(checkDeclarationSubset([A, P1], mutantRead.declared_subjects), {
      ok: false,
      undeclared: [A, P1],
    }, 'the mutant refuses on the wrong source — it names A, which history declares');
  } finally {
    git(ctx.repoRoot, ['worktree', 'remove', '--force', dir]);
  }
});

test('mutation J1: dropping the graph corroboration retires the unattributed shared item', () => {
  const source = sourceOf([[PA, F], [PB, F]]);
  const graph = {
    symbols: [{ name: 'symA', owner: PA }],
    subjects: { [F]: uni(['symA']), [PA]: uni(['symA']), [PB]: uni([]) },
  };
  const production = retireWorkOrderItems(source, { diffPaths: [F], graph });
  assert.deepEqual(production.retired.map((e) => e.index), [0]);
  // MUTANT COPY (J1): only the graph corroboration, dropped.
  const mutant = retireWorkOrderItems(source, { diffPaths: [F], graph: null });
  assert.deepEqual(mutant.retired.map((e) => e.index), [0, 1]);
  assert.ok(
    mutant.retired.some((e) => e.index === 1) && !production.retired.some((e) => e.index === 1),
    'the four-item arm still passes under the mutant while the shared-code arm fails on it',
  );
  const four = retireWorkOrderItems(sourceOf([[P1], [P2], [P3], [P4]]), { diffPaths: [P2], graph: null });
  assert.deepEqual(four.retired.map((e) => e.index), [1]);
});

test('mutation J2: dropping the zero-symbol check retires the diff-evidenced shared item', () => {
  // Same shared-file fixture as J1, but the present index answers ZERO
  // symbols on the diff-evidenced subject: contradiction.
  const source = sourceOf([[PA, F], [PB, F]]);
  const graph = {
    symbols: [{ name: 'symA', owner: PA }],
    subjects: { [F]: uni([]), [PA]: uni(['symA']), [PB]: uni([]) },
  };
  const production = retireWorkOrderItems(source, { diffPaths: [F], graph });
  assert.deepEqual(production.retired, [], 'contradiction retires nothing');
  assert.equal(production.open.length, 2);
  assert.deepEqual(production.open[0].contradiction, [F]);
  // MUTANT COPY (J2): production's shared-hit branch with the contradiction
  // early-return deleted — shared hit plus the item's own symbol evidence
  // retires, exactly what the contradiction gate exists to stop.
  const mutantSharedRetire = () => {
    const subs = source.items.map((it) => [...new Set(it.subjects)].sort());
    const counts = new Map();
    for (const s of subs) for (const p of s) counts.set(p, (counts.get(p) ?? 0) + 1);
    const out = [];
    subs.forEach((s, index) => {
      const sharedHit = s.filter((p) => [F].includes(p) && (counts.get(p) ?? 0) > 1);
      const ownEvidence = graph.symbols.some(
        (sym) => s.includes(sym.owner) && (counts.get(sym.owner) ?? 0) === 1,
      );
      // NOTE: no contradiction gate — the deleted expression.
      if (sharedHit.length && ownEvidence) out.push(index);
    });
    return out;
  };
  assert.deepEqual(mutantSharedRetire(), [0], 'the mutant retires the diff-evidenced item the contradiction arm keeps open');
});

// ---------------------------------------------------------------------------
// Merge-path fixtures: selection flow.
// ---------------------------------------------------------------------------

test('task 56 (merge): an undeclared content-path diff refuses scope-violation and merges nothing', async (t) => {
  const ctx = selectionRepo(
    t,
    { type: 'repair', title: 'fix the alpha entry', subjects: [A] },
    'done-content-paths',
    ` ${A} ${B}`,
  );
  const res = await go(ctx);
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.equal(res.mergedSha, null);
  assert.match(ctx.output(), /scope-violation/);
  assert.match(ctx.output(), new RegExp(B.replace(/\//g, '\\/')), 'the refusal names the undeclared path');
  assert.match(ctx.output(), /graph: absent/, 'three-way absence: absent is recorded and never incomplete');
  assert.ok(!existsSync(join(ctx.repoRoot, B)), 'and nothing merged');
});

test('task 56 (merge): a brief-prose prohibition authorises nothing', async (t) => {
  const ctx = selectionRepo(
    t,
    { type: 'repair', title: `fix the alpha entry (do NOT touch ${B})`, subjects: [A] },
    'done-content-paths',
    ` ${A} ${B}`,
  );
  const res = await go(ctx);
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.match(ctx.output(), /scope-violation/);
  assert.match(ctx.output(), new RegExp(B.replace(/\//g, '\\/')));
});

test('task 56 H2(a): undeclared diff refused with the graph mapping naming the same path; the spawn carried the merge base', async (t) => {
  const ctx = selectionRepo(
    t,
    { type: 'repair', title: 'fix the alpha entry', subjects: [A] },
    'done-content-paths',
    ` ${A} ${B}`,
  );
  const calls = [];
  const res = await go(ctx, {
    mergeGraphAnalysis: ({ repoRoot, base, branch, subjects }) => {
      calls.push({ repoRoot, base, branch, subjects: [...subjects] });
      return presentAnalysis({
        symbols: [{ name: 'symB', owner: B }],
        processes: [{ name: 'train-finding' }],
        subjects: {},
      });
    },
  });
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.match(ctx.output(), /scope-violation/);
  assert.match(ctx.output(), new RegExp(B.replace(/\//g, '\\/')));
  assert.match(ctx.output(), /graph corroboration agrees: scope-violation: graph maps a changed symbol onto undeclared content path/);
  assert.equal(calls.length, 1, 'the analysis ran even though the path check refused');
  const expectedBase = git(ctx.repoRoot, ['merge-base', 'main', res.branch]).trim();
  assert.equal(calls[0].base, expectedBase, 'the analysis ran over the branch diff against the merge base');
  assert.deepEqual(calls[0].subjects, [A], 'mapped against the constituted declaration');
  assert.match(ctx.output(), /never refuses/, 'transitive reach is reviewer-only');
});

test('task 56 H2(a2): a code-only merge with a non-empty declaration binds nothing, logs, and merges', async (t) => {
  const ctx = selectionRepo(
    t,
    { type: 'repair', title: 'touch the shared helper', subjects: [F] },
    'done-content-paths',
    ` ${F}`,
  );
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  assert.ok(res.mergedSha, 'a code-only merge lands');
  assert.match(ctx.output(), /binds nothing/);
  // F4: the no-joinable-path state names the declaration.
  assert.match(ctx.output(), /declaration: loop\/lib\/fixture-shared\.mjs/);
  assert.doesNotMatch(ctx.output(), /scope-violation/);
  assert.doesNotMatch(ctx.output(), /graph-incomplete/);
});

test('task 56 F2: a code-only merge with a partial analysis and no ack refuses graph-incomplete', async (t) => {
  // The binds-nothing exemption downgrades scope-violation ONLY:
  // incompleteness stays a refusal (spec: graph incompleteness is a merge
  // refusal, not a pass — unscoped to content merges).
  const ctx = selectionRepo(
    t,
    { type: 'repair', title: 'touch the shared helper', subjects: [F] },
    'done-content-paths',
    ` ${F}`,
  );
  const res = await go(ctx, {
    mergeGraphAnalysis: () => presentAnalysis({ partial: true, subjects: { [F]: uni(['s']) } }),
  });
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.equal(res.mergedSha, null);
  assert.match(ctx.output(), /binds nothing/, 'the code-only state is still logged');
  assert.match(ctx.output(), /graph-incomplete/);
  assert.match(ctx.output(), /graph:loop\/lib\/fixture-shared\.mjs/);
  assert.match(ctx.output(), /partial/);
});

test('task 56 H2(b): a partial stub with no acknowledgement refuses graph-incomplete naming graph:path and the flag', async (t) => {
  const ctx = selectionRepo(
    t,
    { type: 'repair', title: 'fix the alpha entry', subjects: [A] },
    'done-content-paths',
    ` ${A}`,
  );
  const res = await go(ctx, {
    mergeGraphAnalysis: () => presentAnalysis({ partial: true, subjects: { [A]: uni(['s']) } }),
  });
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.equal(res.mergedSha, null);
  assert.match(ctx.output(), /graph-incomplete/);
  assert.match(ctx.output(), /graph:content\/wiki\/model\/alpha-page\.md/);
  assert.match(ctx.output(), /partial/);
});

test('task 56 H2(c): the same stub with a well-formed graph-ack entry merges', async (t) => {
  const ctx = selectionRepo(
    t,
    { type: 'repair', title: 'fix the alpha entry', subjects: [A] },
    'done-ack-content-paths',
    ` ${A} path-checked`,
  );
  const calls = [];
  const res = await go(ctx, {
    // Fix-round F3: an `absent: true` brief-side entry is not per-item
    // evidence, so the selection flow's production-absent sidecar would refuse
    // (b) here even with the ack answering the partial flag. The fixture
    // stubs the brief seam with real evidence, keeping this arm on the
    // incompleteness question it exists for.
    briefGraphQuery: () => ({ universe: true, symbols: ['s'], callers: 1, processes: 0, risk: 'LOW' }),
    mergeGraphAnalysis: ({ base, subjects }) => {
      calls.push({ base, subjects: [...subjects] });
      return presentAnalysis({ partial: true, subjects: { [A]: uni(['s']) } });
    },
  });
  assert.equal(res.outcome, 'done', ctx.output());
  assert.ok(res.mergedSha);
  assert.equal(calls.length, 1);
  assert.doesNotMatch(ctx.output(), /graph-incomplete/);
});

// ---------------------------------------------------------------------------
// Merge-path fixtures: planted multi-item work orders (resumed).
// ---------------------------------------------------------------------------

function plantedRepo(t, id, list, extraFiles = {}, authorMode = 'done-content-paths', authorExtra = '') {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({
      command: mockCommand(authorMode, authorExtra),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  t.after(() => ctx.cleanup());
  const planted = plantWorkOrder(ctx, id, list, extraFiles);
  return { ctx, planted };
}

test('task 56 F1: a carried-file declaration plus its page diff merges (carried resolution)', async (t) => {
  // The reconciliation GLM#1 demanded: the declared carried file's
  // `subject:` field joins the union at constitution time (history-pinned at
  // the merge base), so the fixing page diff lies inside the declaration.
  const CARRIED_FIX = 'data/carried/fixture-fix-1.md';
  const PAGE = 'content/wiki/model/carry-page.md';
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({
      command: mockCommand('done-content-paths', ` ${PAGE}`),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  t.after(() => ctx.cleanup());
  // The finding exists at the merge base with a structural subject:.
  mkdirSync(join(ctx.repoRoot, 'data', 'carried'), { recursive: true });
  writeFileSync(
    join(ctx.repoRoot, CARRIED_FIX),
    `---\ntitle: fix the carry page\nsubject: ${PAGE}\n---\n\nA finding with a structural subject.\n`,
    'utf8',
  );
  git(ctx.repoRoot, ['add', '-A']);
  git(ctx.repoRoot, ['commit', '--quiet', '--no-verify', '-m', 'fixture: a carried finding with a structural subject']);
  plantWorkOrder(ctx, 'j-20260912-31', [[CARRIED_FIX]]);
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  assert.ok(res.mergedSha);
  assert.doesNotMatch(ctx.output(), /scope-violation/);
  assert.match(ctx.output(), new RegExp(`carried resolution: ${CARRIED_FIX.replace(/\//g, '\\/')} contributes`));
  assert.match(ctx.output(), new RegExp(PAGE.replace(/\//g, '\\/')));
});

test('task 56 H3: four items across four subjects with one file changed retires one, leaves three open, records partially-done', async (t) => {
  const id = 'j-20260912-21';
  // Task 59 hole closure: the merge refuses a diff-retiring branch without a
  // committed sidecar, so the planted branch carries the writer's per-item
  // evidence for the diff-retired subject (P2).
  const sidecar = `${JSON.stringify({ version: 1, index: 'brief-index:merge-base-tree', subjects: { [P2]: { symbols: ['s2'], callers: 1, processes: 0, risk: 'LOW', partial: false, truncated: false } } }, null, 2)}\n`;
  const { ctx } = plantedRepo(t, id, [[P1], [P2], [P3], [P4]], { '.job/graph.json': sidecar }, 'done-content-paths', ` ${P2}`);
  const res = await go(ctx, {
    mergeGraphAnalysis: () => presentAnalysis({
      symbols: [{ name: 's2', owner: P2 }],
      subjects: { [P1]: uni([]), [P2]: uni(['s2']), [P3]: uni([]), [P4]: uni([]) },
    }),
  });
  assert.equal(res.outcome, 'done', ctx.output());
  assert.ok(res.mergedSha);
  const line = readLedger(ctx).at(-1);
  assert.match(line.note, /partially done: retired 1 of 4 items/);
  for (const p of [P1, P3, P4]) assert.match(line.note, new RegExp(p.replace(/\//g, '\\/')), `the ledger line names ${p}`);
  // The record binds the constituted declaration — all four — not the diff.
  const rec = matter(readFileSync(verdictPath(ctx, id, 1), 'utf8'));
  assert.deepEqual([...rec.data.subject].sort(), [P1, P2, P3, P4]);
});

test('task 56 H3: a shared-code-file pair retires only the symbol-evidenced item', async (t) => {
  const id = 'j-20260912-22';
  // Task 59 hole closure: the shared-file retirement is diff-evidenced, so
  // the planted branch carries the sidecar entry for the shared file.
  const sidecar = `${JSON.stringify({ version: 1, index: 'brief-index:merge-base-tree', subjects: { [F]: { symbols: ['symA'], callers: 1, processes: 0, risk: 'LOW', partial: false, truncated: false } } }, null, 2)}\n`;
  const { ctx } = plantedRepo(t, id, [[PA, F], [PB, F]], { '.job/graph.json': sidecar }, 'done-content-paths', ` ${F}`);
  const res = await go(ctx, {
    mergeGraphAnalysis: () => presentAnalysis({
      symbols: [{ name: 'symA', owner: PA }],
      subjects: { [F]: uni(['symA']), [PA]: uni(['symA']), [PB]: uni([]) },
    }),
  });
  assert.equal(res.outcome, 'done', ctx.output());
  const line = readLedger(ctx).at(-1);
  assert.match(line.note, /partially done: retired 1 of 2 items/);
  assert.match(line.note, new RegExp(PB.replace(/\//g, '\\/')), 'the unattributed item stays open by name');
});

test('task 56 H3: no-symbols prose retires on the path diff alone', async (t) => {
  const id = 'j-20260912-23';
  const { ctx } = plantedRepo(t, id, [[Q1], [Q2]], {}, 'done-content-paths', ` ${Q1}`);
  const res = await go(ctx, {
    mergeGraphAnalysis: () => presentAnalysis({
      symbols: [],
      subjects: { [Q1]: { universe: false }, [Q2]: { universe: false } },
    }),
  });
  assert.equal(res.outcome, 'done', ctx.output());
  const line = readLedger(ctx).at(-1);
  assert.match(line.note, /partially done: retired 1 of 2 items/);
  assert.match(ctx.output(), /no-symbols/, 'the graph is recorded summary-only');
});

test('task 56 H3 contradiction: a diff-evidenced subject answered with zero symbols retires nothing', async (t) => {
  const id = 'j-20260912-24';
  const { ctx } = plantedRepo(t, id, [[F]], {}, 'done-content-paths', ` ${F}`);
  const res = await go(ctx, {
    mergeGraphAnalysis: () => presentAnalysis({
      symbols: [],
      subjects: { [F]: uni([]) },
    }),
  });
  assert.equal(res.outcome, 'done', ctx.output());
  assert.match(ctx.output(), /contradiction/, 'the merge report names the contradiction');
  assert.match(ctx.output(), new RegExp(F.replace(/\//g, '\\/').replace(/\./g, '\\.')));
  assert.match(ctx.output(), /zero symbols/);
  const line = readLedger(ctx).at(-1);
  assert.match(line.note, /partially done: retired 0 of 1 items/);
});

test('task 56 H2(b2): a committed sidecar missing the retired subject refuses; with the entry it merges', async (t) => {
  const sidecarFor = (subjects) => `${JSON.stringify({ subjects }, null, 2)}\n`;
  const stub = () => presentAnalysis({
    symbols: [{ name: 's', owner: A }],
    subjects: { [A]: uni(['s']), [B]: uni([]) },
  });
  // Missing entry refuses with the sidecar flag.
  {
    const id = 'j-20260912-25';
    const { ctx } = plantedRepo(
      t, id, [[A], [B]], { '.job/graph.json': sidecarFor({ [B]: { symbols: [] } }) },
      'done-content-paths', ` ${A}`,
    );
    const res = await go(ctx, { mergeGraphAnalysis: stub });
    assert.equal(res.outcome, 'failed', ctx.output());
    assert.match(ctx.output(), /graph-incomplete/);
    assert.match(ctx.output(), /graph:content\/wiki\/model\/alpha-page\.md/);
    assert.match(ctx.output(), /sidecar/);
    // The check, dropped (copy-mutant): retirement alone would merge.
    const alone = retireWorkOrderItems(
      { items: [item([A]), item([B])], declared_subjects: [A, B] },
      { diffPaths: [A], graph: { symbols: [{ name: 's', owner: A }], subjects: { [A]: uni(['s']), [B]: uni([]) } } },
    );
    assert.deepEqual(alone.retired.map((e) => e.index), [0], 'without (b) the merge would retire and land');
  }
  // With the entry present, the same merge lands and retires one of two.
  {
    const id = 'j-20260912-26';
    const { ctx } = plantedRepo(
      t, id, [[A], [B]], { '.job/graph.json': sidecarFor({ [A]: { symbols: ['s'] } }) },
      'done-content-paths', ` ${A}`,
    );
    const res = await go(ctx, { mergeGraphAnalysis: stub });
    assert.equal(res.outcome, 'done', ctx.output());
    assert.match(readLedger(ctx).at(-1).note, /partially done: retired 1 of 2 items/);
  }
});

// ---------------------------------------------------------------------------
// Task 57 — one file's repairs travel as one order; the bounds bind twice.
//
// Reuse, not reimplementation: every arm below tests THROUGH the task-53
// bundler (`bundleWorkOrders`), the task-55 declaration, and the task-56
// constitution/retirement/subset helpers — duplicating none of them. The
// bundling arms live here (not only in `select-bundler.test.mjs`) because
// this file is the Tests home tasks 53/55/56/58 share: the selection half of
// "enforced twice" is proved where the merge half is. The merge-bound arms
// (task 58's home) go through `mergeGate`'s work-order arm with an injected
// size seam — throwaway repositories, stubbed sizes, never a live push.
// ---------------------------------------------------------------------------

/** Minimal category map for the coherence key: repair and post differ. */
const CFG57 = {
  budget: {
    categories: {
      upkeep: ['repair', 'verify'],
      new_writing: ['post', 'entry'],
      machinery: ['machinery'],
    },
  },
};

const BOUNDS57 = Object.freeze({
  maxItems: 4,
  maxSubjects: 4,
  maxReviewedBytes: 60000,
  maxReviewedBytesPerSubject: 30000,
});

const cand57 = (type, title, subjects) => ({ source: 'queue', type, title, subjects: [...subjects] });

test('task 57: four repairs on one page bundle into one work order', () => {
  const candidates = [1, 2, 3, 4].map((n) =>
    cand57('repair', `fix link ${n}`, ['content/wiki/model/x.md']),
  );
  const { orders, refusals } = bundleWorkOrders(candidates, { cfg: CFG57, measure: () => 3000 });
  assert.equal(refusals.length, 0);
  assert.equal(orders.length, 1, 'one page, one coherence key, one order');
  assert.equal(orders[0].items.length, 4);
  assert.deepEqual(orders[0].subjects, ['content/wiki/model/x.md']);
  assert.equal(orders[0].governingType, 'repair');
  assert.equal(orders[0].totalBytes, 12000);
});

test('task 57: a mixed-category pair on one subject is not bundled', () => {
  const candidates = [
    cand57('repair', 'fix a link', ['content/wiki/model/x.md']),
    cand57('post', 'write up x', ['content/wiki/model/x.md']),
  ];
  const { orders, refusals } = bundleWorkOrders(candidates, { cfg: CFG57, measure: () => 3000 });
  assert.equal(refusals.length, 0);
  assert.equal(orders.length, 2, 'one budget category per work order — coherence decides, count only bounds');
  assert.deepEqual(orders.map((o) => o.items.length), [1, 1]);
  assert.deepEqual(orders.map((o) => o.governingType).sort(), ['post', 'repair']);
});

test('task 57: a bundle inside the total but over the per-subject limit is refused at selection', () => {
  const huge = cand57('repair', 'rewrite the huge page', ['content/wiki/huge.md']);
  const small = cand57('repair', 'fix a typo', ['content/wiki/small.md']);
  const sizes = { 'content/wiki/huge.md': 34000, 'content/wiki/small.md': 1000 };
  const { orders, refusals } = bundleWorkOrders([huge, small], {
    cfg: CFG57,
    measure: (subject) => sizes[subject] ?? null,
  });
  // 35,000 total sits inside the 60,000 total — the per-subject limit is what
  // refuses, because a total says nothing about the distribution.
  assert.equal(refusals.length, 1);
  assert.equal(refusals[0].rule, 'work-order:per-subject-bound');
  assert.match(refusals[0].reason, /max_reviewed_bytes_per_subject/);
  assert.match(refusals[0].reason, /34000/);
  assert.equal(orders.length, 1);
  assert.deepEqual(orders[0].subjects, ['content/wiki/small.md']);
});

test('task 57: a brief-prose prohibition on pulse/lib/queue.mjs authorises nothing', () => {
  const candidate = {
    source: 'queue',
    type: 'repair',
    title: 'fix the queue (do NOT touch pulse/lib/queue.mjs)',
    subjects: [A],
  };
  const production = buildWorkOrderDeclaration(candidate);
  assert.deepEqual(production.declared_subjects, [A], 'production never reads the prose');
  assert.ok(
    !production.declared_subjects.includes('pulse/lib/queue.mjs'),
    'the forbidden path is not authorised',
  );
  // MUTANT COPY: match paths out of the brief text instead of reading
  // declared metadata.
  const mutantDeclared = [...new Set(
    [...String(candidate.title).matchAll(/[a-z]+\/lib\/[^\s'"`]+?\.mjs/g)].map((m) => m[0]),
  )].sort();
  assert.ok(
    mutantDeclared.includes('pulse/lib/queue.mjs'),
    `the mutant authorises the prohibition: ${mutantDeclared.join(', ')}`,
  );
});

test('task 57: a reviewed outcome with an empty diff writes a record binding both declared pages', () => {
  const source = sourceOf([[P1], [P2]]);
  // The empty diff constitutes nothing — the binding comes from the
  // executor's declared paths intersected with the declaration.
  assert.deepEqual(joinableSubjects([]), []);
  const production = constituteMergeSubjects(source, { executorPaths: [P1, P2] });
  assert.deepEqual(production.subjects, [P1, P2]);

  const ctx = makeRepo({ now: () => NOW });
  try {
    const p = writeVerdictRecord(ctx, 'j-task57-reviewed', {
      verdict: 'approve',
      wouldCite: 'A reader checking page dates would link this.',
      notes: 'reviewed both pages, no changes needed',
    });
    const wrote = writeRecordSubjects(p, production.subjects);
    assert.equal(wrote.ok, true, 'the declaration-constituted set binds both pages');
    const data = matter(readFileSync(p, 'utf8')).data;
    assert.deepEqual([...data.subject].sort(), [P1, P2]);
  } finally {
    ctx.cleanup();
  }
});

test('task 57/58: a job whose produced reviewed bytes exceed the total bound is refused at the merge gate', async (t) => {
  const workOrder = {
    items: [item([P1]), item([P2]), item([P3]), item([P4])],
    declared_subjects: [P1, P2, P3, P4],
  };
  const subjects = [P1, P2, P3, P4];
  // Count bounds, straight through the helper: five items and five subjects
  // refuse on max_items / max_subjects before any byte is measured.
  const tooManyItems = checkWorkOrderMergeBounds({
    workOrder: { items: [1, 2, 3, 4, 5].map(() => item([P1])), declared_subjects: [P1] },
    subjects: [P1],
    bounds: BOUNDS57,
  });
  assert.equal(tooManyItems.ok, false);
  assert.equal(tooManyItems.code, 'work-order-bound');
  assert.match(tooManyItems.reason, /max_items/);
  const tooManySubjects = checkWorkOrderMergeBounds({
    workOrder: {
      items: [item([P1, P2]), item([P3]), item([P4]), item([Q1])],
      declared_subjects: [P1, P2, P3, P4, Q1],
    },
    subjects: [P1, P2, P3, P4, Q1],
    bounds: BOUNDS57,
  });
  assert.equal(tooManySubjects.ok, false);
  assert.equal(tooManySubjects.code, 'work-order-bound');
  assert.match(tooManySubjects.reason, /max_subjects/);

  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  // Four subjects at 20,000 bytes each: 80,000 over the 60,000 total.
  writeVerdictRecord(ctx, 'j-task57-over-total', {
    verdict: 'approve',
    wouldCite: 'A reader checking page dates would link this.',
    notes: 'n',
  });
  const refused = mergeGate(ctx, {
    jobId: 'j-task57-over-total',
    type: 'repair',
    subjects,
    workOrder,
    measure: () => 20000,
    bounds: BOUNDS57,
  });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'work-order-bound');
  assert.match(refused.reason, /max_reviewed_bytes/);
  assert.match(refused.reason, /80000/);

  // One subject at 34,000 with the total inside 60,000: the per-subject
  // limit refuses where the total would pass.
  writeVerdictRecord(ctx, 'j-task57-over-persubject', {
    verdict: 'approve',
    wouldCite: 'A reader checking page dates would link this.',
    notes: 'n',
  });
  const perSubject = mergeGate(ctx, {
    jobId: 'j-task57-over-persubject',
    type: 'repair',
    subjects: [A, B],
    workOrder: { items: [item([A]), item([B])], declared_subjects: [A, B] },
    measure: (s) => (s === A ? 34000 : 1000),
    bounds: BOUNDS57,
  });
  assert.equal(perSubject.ok, false);
  assert.equal(perSubject.code, 'work-order-bound');
  assert.match(perSubject.reason, /max_reviewed_bytes_per_subject/);
  assert.match(perSubject.reason, new RegExp(A.replace(/\//g, '\\/')));

  // The same order at 3,000 bytes a page passes: the bound binds, it does
  // not blanket-refuse.
  writeVerdictRecord(ctx, 'j-task57-within', {
    verdict: 'approve',
    wouldCite: 'A reader checking page dates would link this.',
    notes: 'n',
  });
  const passing = mergeGate(ctx, {
    jobId: 'j-task57-within',
    type: 'repair',
    subjects,
    workOrder,
    measure: () => 3000,
    bounds: BOUNDS57,
  });
  assert.equal(passing.ok, true, passing.reason ?? '');
});

test('task 57/58: an empty-diff outcome binding four pages exceeding a four-diff-sized bound is refused', async (t) => {
  // Four pages at 5,000 bytes each: 20,000 of reviewed surface. The bound is
  // sized for four diffs (8,000) — the empty diff measures zero, so only a
  // gate that measures the declared pages' surfaces can refuse.
  const subjects = [P1, P2, P3, P4];
  const workOrder = {
    items: [item([P1]), item([P2]), item([P3]), item([P4])],
    declared_subjects: [P1, P2, P3, P4],
  };
  const bounds = { maxItems: 4, maxSubjects: 4, maxReviewedBytes: 8000, maxReviewedBytesPerSubject: 30000 };
  const measure = () => 5000;

  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  writeVerdictRecord(ctx, 'j-task57-empty-diff', {
    verdict: 'approve',
    wouldCite: 'A reader checking page dates would link this.',
    notes: 'reviewed four pages, no changes needed',
  });
  const production = mergeGate(ctx, {
    jobId: 'j-task57-empty-diff',
    type: 'repair',
    subjects,
    workOrder,
    measure,
    bounds,
  });
  assert.equal(production.ok, false);
  assert.equal(production.code, 'work-order-bound');
  assert.match(production.reason, /max_reviewed_bytes/);
  assert.match(production.reason, /20000/);

  // MUTATION (task 58's named one): measure the empty diff instead of the
  // declared pages. The diff is empty, so the total is zero and the same
  // bound passes — letting four whole pages through a bound sized for four
  // diffs, which is exactly the evaporation the second enforcement exists
  // to stop. Copy-based: production above is untouched.
  const mutant = checkWorkOrderMergeBounds({ workOrder, subjects: [], measure, bounds });
  assert.equal(mutant.ok, true, 'the mutant measures zero and merges when it must not');
  assert.equal(mutant.totalBytes, 0);
});
