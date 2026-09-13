/**
 * reviewed-outcome.test.mjs — the test home for task 62's slice of the
 * read-and-unchanged outcome.
 *
 * Task 62 (`loop/lib/result.mjs` fourth first-line form, the task-61b join as
 * the only precondition source, `reviewedOnly` production plumbing, record
 * binding on reviewed bytes) is proved here. Tasks 63 (per-page review
 * invocations, machine-generated surfaces, gates-not-evidence wording) and 64
 * (the `.job/reviewed-hashes.json` store and its equality arms) extend this
 * file; their arms are named where 62 stops so a later reader can tell what
 * this task proved from what it deferred.
 *
 * Reuse, not reimplementation: every arm exercises production directly —
 * `parseReviewedLine` / `readResult` / `classifyRun` (`loop/lib/result.mjs`),
 * `reviewStateForPageAtBase` (`loop/lib/review-state.mjs`, the sole
 * precondition source), `constituteMergeSubjects` / `checkDeclarationSubset`
 * / `checkMergeGraphScope` / `retireWorkOrderItems` (`loop/run.mjs`, task 56),
 * `assembleGraphContext` (`loop/lib/brief.mjs`, task 59's filter),
 * `writeRecordSubjects` (`loop/lib/review.mjs`). Nothing here reimplements a
 * parse, a join, a constitution, or a row format.
 *
 * FIXTURE POLICY (task 37, binding here): throwaway repositories under the OS
 * temp directory via `makeRepo` (real git plumbing; no bare origin — no arm
 * publishes or reads a remote), graph analysis stubbed through the injected
 * merge-path seam (`checkReviewedMerge`'s `analysis` argument, the task-12
 * fixture pattern) with the merge-base argument asserted on the recorded
 * input where the seam is invoked by the caller. No spawns touched,
 * reviewers never invoked. Copy-based mutants only: each named mutation is a
 * test-side copy of the production expression it shadows, so nothing under
 * test is edited and there is nothing to restore.
 *
 * Arms:
 * - the fourth first-line form parses (one path, several paths, spacing and
 *   backslash tolerance) and a pathless `reviewed:` line is malformed
 *   (interrupted), never an acceptance of nothing;
 * - `classifyRun` preserves the declaration and never lets stderr override it;
 * - an empty diff fails `done` and does not fail `reviewed:`;
 * - preconditions authorise by the committed declaration first and read
 *   mismatched-or-not from the 61b join only, re-read at the merge base
 *   (a base that moves moves the answer; old-contract and missing/empty
 *   declarations refuse whatever the first line said);
 * - a non-empty diff on a declared subject refuses naming the path, and an
 *   undeclared content path refuses `scope-violation` (the universal subset
 *   rule, reused — not a second detector);
 * - graph emptiness corroborates (one owned symbol refuses naming the path;
 *   zero symbols pass; absent proceeds `graph: absent`; present-but-
 *   incomplete without an ack refuses `graph-incomplete`, with an ack it
 *   proceeds);
 * - the reviewed merge binds the reviewed bytes (both pages, hashes equal to
 *   the reviewed surfaces) and never returns a null subject set on the
 *   advisory (empty-diff) branch;
 * - the review brief in reviewed mode carries the surface, the filtered annex
 *   AFTER it, and no fenced diff block at all; without the mode the brief is
 *   unchanged.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  RESULT_PROTOCOL_INSTRUCTION,
  classifyRun,
  parseReviewedLine,
  readResult,
} from '../lib/result.mjs';
import {
  checkCommittedDeclaration,
  checkReviewedDiffEmpty,
  checkReviewedGraphEmptiness,
  checkReviewedMerge,
  constituteMergeSubjects,
  emptyDiffFailsOutcome,
  jobPerPageRecordRelPaths,
  perPageRecordPathsForPass,
  reviewedPathsFromResultText,
} from '../run.mjs';
import { reviewStateForPageAtBase } from '../lib/review-state.mjs';
import {
  assembleReviewBrief,
  joinableSubjects,
  writeRecordSubjects,
  writeVerdictRecord,
  reviewedGateTypeForPage,
  checklistForReviewedPage,
  reviewedGatesSection,
  classifyReviewedRun,
  checkReviewedRunnerEligibility,
  reviewedPerPageRecordPath,
  isRecordOfJob,
  REVIEWED_CONTENT_TO_GATE_TYPE,
  checklistFor,
  mergeGate,
  verdictPath,
} from '../lib/review.mjs';
import { GRAPH_ANNEX_HEADING } from '../lib/brief.mjs';
import { transcribeCarriedFindings } from '../lib/carry.mjs';
import { reviewedHash } from '../../lib/review-hash.mjs';
import { loadRunners, pickRunner } from '../lib/runners.mjs';
import { git, makeRepo } from './helpers.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const RUN_LIB = resolve(HERE, '..', 'run.mjs');

// Local date, read from the machine clock (2026-09-12, Mountain).
const NOW = new Date('2026-09-12T12:00:00');
const P1 = 'content/wiki/model/reviewed-one.md';
const P2 = 'content/wiki/model/reviewed-two.md';
const OTHER = 'content/wiki/model/reviewed-other.md';

function pageText(body) {
  return `---\ntitle: reviewed fixture\n---\n\n${body}\n`;
}

function writePage(ctx, rel, body) {
  const full = join(ctx.repoRoot, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, pageText(body), 'utf8');
}

function commitAll(ctx, msg) {
  git(ctx.repoRoot, ['add', '-A']);
  git(ctx.repoRoot, ['commit', '--quiet', '--no-verify', '-m', msg]);
}

function headOf(ctx) {
  return git(ctx.repoRoot, ['rev-parse', 'HEAD']).trim();
}

function approveWithSubjects(ctx, jobId, subjects) {
  const p = writeVerdictRecord(ctx, jobId, {
    verdict: 'approve',
    wouldCite: `a reader checking dates would cite ${jobId}`,
    notes: 'fixture approval',
  });
  const wrote = writeRecordSubjects(p, subjects, { repoRoot: ctx.repoRoot });
  assert.equal(wrote.ok, true, `fixture record binds: ${wrote.why ?? ''}`);
  return p;
}

function sourceOf(subjects, perSubjectItems = true) {
  const items = perSubjectItems
    ? subjects.map((s) => ({ bead: null, type: 'repair', subjects: [s], reason: `fix ${s}` }))
    : [{ bead: null, type: 'repair', subjects: [...subjects], reason: 'fix all' }];
  const declared = [...new Set(subjects)].sort();
  return {
    job: 'j-fixture', type: 'repair', source: 'queue', slug: null, path: null, issues: [],
    items, declared_subjects: declared,
  };
}

/** A mismatched fixture: page approved, then edited, base at the edit. */
function mismatchedRepo(t, pages = [P1]) {
  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  for (const p of pages) writePage(ctx, p, 'the approved version');
  commitAll(ctx, 'fixture: pages');
  approveWithSubjects(ctx, 'j-20260912-01', pages);
  commitAll(ctx, 'fixture: the approving record');
  for (const p of pages) writePage(ctx, p, 'an edit nobody reviewed');
  commitAll(ctx, 'fixture: later edits');
  return ctx;
}

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

const absentAnalysis = { absent: true, reason: 'no graph index wired on the merge path' };
const emptyPresent = {
  absent: false, partial: false, truncated: false, symbols: [], processes: [],
  subjects: { [P1]: { universe: true, symbols: [], risk: 'LOW' } },
};

// ---------------------------------------------------------------------------
// The fourth first-line form.
// ---------------------------------------------------------------------------

test('task 62: `reviewed:` parses as a fourth first-line form', () => {
  const ctx = makeRepo({ now: () => NOW });
  try {
    const dir = ctx.repoRoot;
    writeFileSync(join(dir, 'RESULT.md'), `reviewed: ${P1}\nnotes\n`, 'utf8');
    const one = readResult(dir);
    assert.equal(one.status, 'reviewed');
    assert.deepEqual(one.paths, [P1]);
    assert.equal(one.malformed, false);

    writeFileSync(join(dir, 'RESULT.md'), `reviewed: ${P1},  ${P2}\n`, 'utf8');
    assert.deepEqual(readResult(dir).paths, [P1, P2]);

    // Backslashes tolerate Windows-shaped lines; duplicates collapse.
    writeFileSync(join(dir, 'RESULT.md'), `reviewed: ${P1.replace(/\//g, '\\')}, ${P1}\n`, 'utf8');
    assert.deepEqual(readResult(dir).paths, [P1]);

    // A pathless line is malformed — an acceptance of nothing is refused at
    // the parse, never ratified downstream.
    for (const bad of ['reviewed:\n', 'reviewed:   \n', 'reviewed:\nnotes\n']) {
      writeFileSync(join(dir, 'RESULT.md'), bad, 'utf8');
      const r = readResult(dir);
      assert.equal(r.status, 'interrupted', JSON.stringify(bad));
      assert.equal(r.malformed, true, JSON.stringify(bad));
    }
    assert.deepEqual(parseReviewedLine(`reviewed: ${P1}`), { ok: true, paths: [P1] });
    assert.equal(parseReviewedLine('done'), null);
    assert.equal(parseReviewedLine('reviewed:').ok, false);
  } finally {
    ctx.cleanup();
  }
});

test('task 62: the protocol instruction names the fourth form', () => {
  assert.match(RESULT_PROTOCOL_INSTRUCTION, /reviewed: <path>\[, <path>…\]/);
  assert.match(RESULT_PROTOCOL_INSTRUCTION, /four forms/);
  assert.match(RESULT_PROTOCOL_INSTRUCTION, /read-and-unchanged/);
});

test('task 62: `classifyRun` preserves the declaration and never lets stderr override it', () => {
  const runner = { capacity_stderr_pattern: 'LIMIT' };
  const reviewed = { status: 'reviewed', reason: null, paths: [P1, P2], why: 'first line is reviewed' };
  const out = classifyRun({ stderr: 'LIMIT reached', killed: false, code: 0 }, reviewed, runner);
  assert.equal(out.status, 'reviewed');
  assert.deepEqual(out.paths, [P1, P2]);
  assert.equal(out.producedNothing, false);
  // The pre-existing shapes are untouched.
  assert.equal(classifyRun({ stderr: '', killed: false, code: 0 }, { status: 'done', reason: null, why: 'd' }, runner).status, 'done');
  assert.equal(classifyRun({ stderr: '', killed: false, code: 0 }, { status: 'interrupted', present: false, why: 'absent' }, runner).status, 'interrupted');
});

// ---------------------------------------------------------------------------
// Empty diff: failure for `done`, the finding for `reviewed:`.
// ---------------------------------------------------------------------------

test('task 62: an empty diff fails `done` and does not fail `reviewed:`', () => {
  assert.equal(emptyDiffFailsOutcome('done'), true);
  assert.equal(emptyDiffFailsOutcome('blocked'), true);
  assert.equal(emptyDiffFailsOutcome('capacity'), true);
  assert.equal(emptyDiffFailsOutcome('interrupted'), true);
  assert.equal(emptyDiffFailsOutcome('reviewed'), false);
});

test('task 62: reviewed paths read from the first line only', () => {
  const text = `reviewed: ${P1}, ${P2}\n\nfree-form notes\n\ngraph-ack:\n  - subject: graph:${P1}\n    state: noted\n    evidence: The marker was answered.\n`;
  assert.deepEqual(reviewedPathsFromResultText(text), [P1, P2]);
  assert.equal(reviewedPathsFromResultText('done\n'), null);
  assert.equal(reviewedPathsFromResultText(''), null);
});

// ---------------------------------------------------------------------------
// Preconditions: declaration first, then the 61b join only.
// ---------------------------------------------------------------------------

test('task 62: a declared, already-mismatched page ratifies', (t) => {
  const ctx = mismatchedRepo(t, [P1]);
  const base = headOf(ctx);
  assert.equal(reviewStateForPageAtBase(ctx.repoRoot, base, P1).state, 'mismatched');
  const checked = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base, source: sourceOf([P1]), reviewedPaths: [P1],
    contentPaths: [], diffPaths: [], resultText: `reviewed: ${P1}\n`, analysis: absentAnalysis, sidecar: null,
  });
  assert.equal(checked.ok, true, checked.reason ?? '');
  assert.deepEqual(checked.subjects, [P1]);
  assert.ok(checked.warnings.some((w) => /graph: absent/.test(w)), 'absent index warns and proceeds');
  assert.equal(checked.graphStatus, 'absent');
  assert.ok(checked.retirement.retired.some((r) => r.via === 'reviewed'), 'the item retires on reviewed coverage');
});

test('task 62: a page that still matches its record is refused naming the path and the state', (t) => {
  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  writePage(ctx, P1, 'the approved version');
  commitAll(ctx, 'fixture: a page');
  approveWithSubjects(ctx, 'j-20260912-01', [P1]);
  commitAll(ctx, 'fixture: the approving record');
  const base = headOf(ctx);
  assert.equal(reviewStateForPageAtBase(ctx.repoRoot, base, P1).state, 'matched');
  const checked = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base, source: sourceOf([P1]), reviewedPaths: [P1],
    contentPaths: [], diffPaths: [], resultText: `reviewed: ${P1}\n`, analysis: absentAnalysis, sidecar: null,
  });
  assert.equal(checked.ok, false);
  assert.equal(checked.code, 'reviewed-not-mismatched');
  assert.match(checked.reason, new RegExp(P1.replace(/\//g, '\\/')));
  assert.match(checked.reason, /matched/);
});

test('task 62: a page with no record is refused as missing, never ratified', (t) => {
  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  writePage(ctx, P1, 'a page nobody reviewed');
  commitAll(ctx, 'fixture: a page with no record');
  const base = headOf(ctx);
  assert.equal(reviewStateForPageAtBase(ctx.repoRoot, base, P1).state, 'missing');
  const checked = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base, source: sourceOf([P1]), reviewedPaths: [P1],
    contentPaths: [], diffPaths: [], resultText: `reviewed: ${P1}\n`, analysis: absentAnalysis, sidecar: null,
  });
  assert.equal(checked.ok, false);
  assert.equal(checked.code, 'reviewed-not-mismatched');
  assert.match(checked.reason, /missing/);
});

test('task 62: a path outside the committed declaration is refused before the base is read', (t) => {
  const ctx = mismatchedRepo(t, [P1]);
  const base = headOf(ctx);
  const checked = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base, source: sourceOf([P1]), reviewedPaths: [OTHER],
    contentPaths: [], diffPaths: [], resultText: `reviewed: ${OTHER}\n`, analysis: absentAnalysis, sidecar: null,
  });
  assert.equal(checked.ok, false);
  assert.equal(checked.code, 'reviewed-undeclared');
  assert.match(checked.reason, new RegExp(OTHER.replace(/\//g, '\\/')));
  assert.match(checked.reason, /authorised by the loop's committed list/);
});

test('task 62: old-contract and missing/empty declarations refuse whatever the first line said', (t) => {
  const ctx = mismatchedRepo(t, [P1]);
  const base = headOf(ctx);
  const oldContract = { job: 'j-old', type: 'repair', source: 'directive', issues: [] };
  for (const [tag, source] of [
    ['old-contract', oldContract],
    ['missing', { job: 'j-x', type: 'repair', source: 'queue', issues: [], items: [{ bead: null, type: 'repair', subjects: [P1], reason: 'x' }] }],
    ['empty', { job: 'j-x', type: 'repair', source: 'queue', issues: [], items: [], declared_subjects: [] }],
  ]) {
    const checked = checkReviewedMerge({
      repoRoot: ctx.repoRoot, base, source, reviewedPaths: [P1],
      contentPaths: [], diffPaths: [], resultText: `reviewed: ${P1}\n`, analysis: absentAnalysis, sidecar: null,
    });
    assert.equal(checked.ok, false, tag);
    assert.equal(checked.code, 'reviewed-no-declaration', tag);
    assert.match(checked.reason, new RegExp(P1.replace(/\//g, '\\/')), tag);
  }
  assert.equal(checkCommittedDeclaration(oldContract).oldContract, true);
});

test('task 62: a base that moves between brief assembly and merge moves the gate answer with it', (t) => {
  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  writePage(ctx, P1, 'the approved version');
  commitAll(ctx, 'fixture: a page');
  approveWithSubjects(ctx, 'j-20260912-01', [P1]);
  commitAll(ctx, 'fixture: the approving record');
  const briefBase = headOf(ctx);
  writePage(ctx, P1, 'an edit that landed after the brief');
  commitAll(ctx, 'fixture: a later page edit');
  const mergeBase = headOf(ctx);
  assert.notEqual(mergeBase, briefBase);
  const source = sourceOf([P1]);
  const atBrief = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base: briefBase, source, reviewedPaths: [P1],
    contentPaths: [], diffPaths: [], resultText: `reviewed: ${P1}\n`, analysis: absentAnalysis, sidecar: null,
  });
  assert.equal(atBrief.ok, false, 'at the brief base the page still matches its record');
  assert.equal(atBrief.code, 'reviewed-not-mismatched');
  const atMerge = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base: mergeBase, source, reviewedPaths: [P1],
    contentPaths: [], diffPaths: [], resultText: `reviewed: ${P1}\n`, analysis: absentAnalysis, sidecar: null,
  });
  assert.equal(atMerge.ok, true, atMerge.reason ?? '');
});

test('task 62: the precondition reads the 61b join and no derived store', () => {
  const src = readFileSync(RUN_LIB, 'utf8');
  const start = src.indexOf('export function checkReviewedMerge(');
  assert.ok(start !== -1, 'the reviewed gate is one named function');
  const nextExport = src.indexOf('\nexport function ', start + 10);
  const nextAsync = src.indexOf('\nasync function ', start + 10);
  const end = [nextExport, nextAsync].filter((n) => n !== -1).sort((a, b) => a - b)[0] ?? src.length;
  const body = src.slice(start, end);
  const code = body.replace(/\/\*[\s\S]*?\*\//g, '\n').replace(/^[ \t]*\/\/.*$/gm, '\n');
  assert.ok(code.includes('reviewStateForPageAtBase'), 'the mismatched question is answered by the 61b join');
  assert.ok(!code.includes('reviewed-hashes'), 'no derived hash store is consulted for the precondition');
  assert.ok(src.includes("from './lib/review-state.mjs'"), 'the join is imported as a named capability');
});

// ---------------------------------------------------------------------------
// Diff and graph corroboration on the reviewed outcome.
// ---------------------------------------------------------------------------

test('task 62: a non-empty diff on a declared subject is refused naming the path', (t) => {
  const ctx = mismatchedRepo(t, [P1]);
  const base = headOf(ctx);
  assert.deepEqual(checkReviewedDiffEmpty([], [P1]), { ok: true });
  const diffed = checkReviewedDiffEmpty([P1], [P1]);
  assert.equal(diffed.ok, false);
  assert.equal(diffed.code, 'reviewed-with-diff');
  assert.deepEqual(diffed.paths, [P1]);
  const checked = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base, source: sourceOf([P1]), reviewedPaths: [P1],
    contentPaths: [P1], diffPaths: [P1], resultText: `reviewed: ${P1}\n`, analysis: absentAnalysis, sidecar: null,
  });
  assert.equal(checked.ok, false);
  assert.equal(checked.code, 'reviewed-with-diff');
  assert.match(checked.reason, new RegExp(P1.replace(/\//g, '\\/')));
});

test('task 62: an undeclared content path refuses scope-violation through the reused subset rule', (t) => {
  const ctx = mismatchedRepo(t, [P1]);
  const base = headOf(ctx);
  writePage(ctx, OTHER, 'work outside the declaration');
  commitAll(ctx, 'fixture: an undeclared page');
  const checked = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base, source: sourceOf([P1]), reviewedPaths: [P1],
    contentPaths: [OTHER], diffPaths: [OTHER], resultText: `reviewed: ${P1}\n`, analysis: absentAnalysis, sidecar: null,
  });
  assert.equal(checked.ok, false);
  assert.equal(checked.code, 'scope-violation');
  assert.match(checked.reason, new RegExp(OTHER.replace(/\//g, '\\/')));
});

test('task 62: graph emptiness — one owned symbol refuses naming the path; zero symbols pass', (t) => {
  const ctx = mismatchedRepo(t, [P1]);
  const base = headOf(ctx);
  const source = sourceOf([P1]);
  const oneSymbol = {
    absent: false, partial: false, truncated: false,
    symbols: [{ name: 'symA', owner: P1 }], processes: [],
    subjects: { [P1]: { universe: true, symbols: ['symA'], risk: 'LOW' } },
  };
  assert.deepEqual(checkReviewedGraphEmptiness([P1], absentAnalysis).ok, true);
  const empty = checkReviewedGraphEmptiness([P1], emptyPresent);
  assert.equal(empty.ok, true, empty.reason ?? '');
  const full = checkReviewedGraphEmptiness([P1], oneSymbol);
  assert.equal(full.ok, false);
  assert.equal(full.code, 'reviewed-with-symbols');
  assert.match(full.reason, new RegExp(P1.replace(/\//g, '\\/')));
  // Through the gate: the seam's recorded input pins the merge base.
  const seen = [];
  const caller = ({ repoRoot, base: b, branch, subjects }) => {
    seen.push({ repoRoot, base: b, branch, subjects: [...subjects].sort() });
    return oneSymbol;
  };
  const checked = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base, source, reviewedPaths: [P1],
    contentPaths: [], diffPaths: [], resultText: `reviewed: ${P1}\n`,
    analysis: caller({ repoRoot: ctx.repoRoot, base, branch: 'job/j-fixture', subjects: [P1] }),
    sidecar: null,
  });
  assert.equal(checked.ok, false);
  assert.equal(checked.code, 'reviewed-with-symbols');
  assert.deepEqual(seen[0].base, base, 'the analysis ran against the merge base');
  assert.deepEqual(seen[0].subjects, [P1]);
});

test('task 62: present-but-incomplete without an ack refuses graph-incomplete; with an ack it proceeds', (t) => {
  const ctx = mismatchedRepo(t, [P1]);
  const base = headOf(ctx);
  const source = sourceOf([P1]);
  const partial = {
    absent: false, partial: true, truncated: false, symbols: [], processes: [],
    subjects: { [P1]: { universe: true, symbols: [], risk: 'LOW', partial: true } },
  };
  const bare = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base, source, reviewedPaths: [P1],
    contentPaths: [], diffPaths: [], resultText: `reviewed: ${P1}\n`, analysis: partial, sidecar: null,
  });
  assert.equal(bare.ok, false);
  assert.equal(bare.code, 'graph-incomplete');
  assert.match(bare.reason, new RegExp(`graph:${P1.replace(/\//g, '\\/')}`));
  assert.match(bare.reason, /partial/);
  const acked = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base, source, reviewedPaths: [P1],
    contentPaths: [], diffPaths: [],
    resultText: `reviewed: ${P1}\n\ngraph-ack:\n  - subject: graph:${P1}\n    state: path-checked\n    evidence: The stub reported partial with zero symbols; the empty diff was read directly.\n`,
    analysis: partial, sidecar: null,
  });
  assert.equal(acked.ok, true, acked.reason ?? '');
});

test('task 62 mutation C: a stub reporting zero symbols unconditionally merges when it must not', (t) => {
  const ctx = mismatchedRepo(t, [P1]);
  const base = headOf(ctx);
  const source = sourceOf([P1]);
  const production = {
    absent: false, partial: false, truncated: false,
    symbols: [{ name: 'symA', owner: P1 }], processes: [],
    subjects: { [P1]: { universe: true, symbols: ['symA'], risk: 'LOW' } },
  };
  const refused = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base, source, reviewedPaths: [P1],
    contentPaths: [], diffPaths: [], resultText: `reviewed: ${P1}\n`, analysis: production, sidecar: null,
  });
  assert.equal(refused.ok, false, 'production refuses the non-empty symbol set');
  // MUTANT COPY: the seam reports zero symbols whatever the branch holds.
  const mutant = { ...production, symbols: [] };
  const merged = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base, source, reviewedPaths: [P1],
    contentPaths: [], diffPaths: [], resultText: `reviewed: ${P1}\n`, analysis: mutant, sidecar: null,
  });
  assert.equal(merged.ok, true, 'the mutant merges when it must not — the arm measures the emptiness check');
  assert.notDeepEqual(refused.ok, merged.ok, 'the arm distinguishes the mutant from production');
});

// ---------------------------------------------------------------------------
// Record binding on reviewed bytes — never the diff-derived set.
// ---------------------------------------------------------------------------

test('task 62: the reviewed merge binds both declared pages on their reviewed bytes', (t) => {
  const ctx = mismatchedRepo(t, [P1, P2]);
  const base = headOf(ctx);
  const source = sourceOf([P1, P2]);
  // The empty diff constitutes nothing — the binding comes from the
  // executor's paths intersected with the declaration (mutation A's shape).
  assert.deepEqual(joinableSubjects([]), []);
  const production = constituteMergeSubjects(source, { executorPaths: [P1, P2] });
  assert.deepEqual(production.subjects, [P1, P2]);
  const mutantSubjects = joinableSubjects([]);
  assert.deepEqual(mutantSubjects, [], 'the diff-constituted mutant binds nothing');

  const checked = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base, source, reviewedPaths: [P1, P2],
    contentPaths: [], diffPaths: [], resultText: `reviewed: ${P1}, ${P2}\n`, analysis: absentAnalysis, sidecar: null,
  });
  assert.equal(checked.ok, true, checked.reason ?? '');
  assert.ok(Array.isArray(checked.subjects), 'the advisory branch returns a set, never null');
  assert.deepEqual(checked.subjects, [P1, P2]);

  const p = writeVerdictRecord(ctx, 'j-20260912-62', {
    verdict: 'approve',
    wouldCite: 'A reader checking page dates would link this.',
    notes: 'reviewed both pages, no changes needed',
  });
  const wrote = writeRecordSubjects(p, checked.subjects, { repoRoot: ctx.repoRoot });
  assert.equal(wrote.ok, true, wrote.why ?? '');
  for (const page of [P1, P2]) {
    const expected = reviewedHash(pageText('an edit nobody reviewed'));
    assert.equal(wrote.reviewed[page], expected, `${page} binds its reviewed bytes`);
  }
});

// ---------------------------------------------------------------------------
// Reviewed review brief: surface, filtered annex after it, no diff.
// ---------------------------------------------------------------------------

function reviewCtx(t) {
  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  return ctx;
}

const baseReviewJob = () => ({
  type: 'repair',
  source: 'queue',
  title: 'Ratify the reviewed page',
  detail: 'The executor read the page, judged it sound, and left it unchanged.',
});

test('task 62: a reviewed review brief carries the surface, the one filtered row after it, and no fence', (t) => {
  const ctx = reviewCtx(t);
  const calls = [];
  const graphQuery = stubQuery({
    [P1]: { universe: true, symbols: ['s1'], callers: 2, processes: 1, risk: 'LOW' },
    [P2]: { universe: true, symbols: ['s2'], callers: 3, processes: 2, risk: 'MEDIUM' },
  }, calls);
  const surface = pageText('the reviewed bytes');
  const brief = assembleReviewBrief(ctx, {
    jobId: 'j-20260912-62',
    job: baseReviewJob(),
    diffText: '',
    pass: 1,
    findings: '',
    outPath: `${ctx.reviewsDir}/j-20260912-62.md`,
    gates: null,
    sha: '',
    capMinutes: 30,
    reviewedOnly: P1,
    reviewedSurfaceText: surface,
    reviewGraphQuery: graphQuery,
    graphIndexId: 'test-index-1',
  });
  assert.deepEqual(calls, [P1], 'one upstream query for the one page that invocation reviews');
  assert.match(brief, /## Reviewed page surface/);
  assert.match(brief, new RegExp(`### \`${P1.replace(/\//g, '\\/')}\``));
  assert.match(brief, /the reviewed bytes/);
  assert.match(brief, new RegExp(`## ${GRAPH_ANNEX_HEADING.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  assert.match(brief, /callers 2/, 'the stub caller count is quoted verbatim');
  assert.doesNotMatch(brief, new RegExp(`\`${P2.replace(/\//g, '\\/')}\`: `), 'the other page adds no row');
  const surfaceAt = brief.indexOf('## Reviewed page surface');
  const annexAt = brief.indexOf(`## ${GRAPH_ANNEX_HEADING}`);
  assert.ok(surfaceAt !== -1 && annexAt !== -1 && annexAt > surfaceAt, 'the annex is appended after the page surface');
  assert.doesNotMatch(brief, /```diff/, 'no diff section at all on a reviewed brief');
  assert.doesNotMatch(brief, /## The diff under review/);
  assert.match(brief, /the reviewed page surface below/);
});

test('task 62: without the mode the review brief is unchanged', (t) => {
  const ctx = reviewCtx(t);
  const brief = assembleReviewBrief(ctx, {
    jobId: 'j-20260912-63',
    job: baseReviewJob(),
    diffText: 'diff --git a/content/wiki/model/reviewed-one.md b/content/wiki/model/reviewed-one.md\n',
    pass: 1,
    findings: '',
    outPath: `${ctx.reviewsDir}/j-20260912-63.md`,
    gates: null,
    sha: '',
    capMinutes: 30,
  });
  assert.match(brief, /## The diff under review/);
  assert.match(brief, /```diff/);
  assert.doesNotMatch(brief, /## Reviewed page surface/);
  assert.doesNotMatch(brief, new RegExp(`## ${GRAPH_ANNEX_HEADING.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
});

// ---------------------------------------------------------------------------
// Copy-based mutants for the parse and the precondition.
// ---------------------------------------------------------------------------

test('task 62 mutation: a parser accepting a pathless `reviewed:` line ratifies nothing it should', () => {
  // MUTANT COPY: the empty-list guard, dropped — a bare `reviewed:` line
  // parses as an empty acceptance.
  const mutantParse = (firstLine) => {
    const m = /^reviewed:\s*(.*)$/.exec(String(firstLine ?? '').trim());
    if (!m) return null;
    return { ok: true, paths: m[1].split(',').map((s) => s.trim()).filter(Boolean) };
  };
  assert.deepEqual(mutantParse('reviewed:').paths, [], 'the mutant accepts a pathless line as empty');
  assert.equal(parseReviewedLine('reviewed:').ok, false, 'production refuses it at the parse');
  const dir = makeRepo({ now: () => NOW });
  try {
    writeFileSync(join(dir.repoRoot, 'RESULT.md'), 'reviewed:\n', 'utf8');
    assert.equal(readResult(dir.repoRoot).status, 'interrupted', 'a pathless line never becomes a reviewed status');
  } finally {
    dir.cleanup();
  }
});

test('task 62 mutation: a precondition that always mismatches ratifies a match it must not', (t) => {
  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  writePage(ctx, P1, 'the approved version');
  commitAll(ctx, 'fixture: a page');
  approveWithSubjects(ctx, 'j-20260912-01', [P1]);
  commitAll(ctx, 'fixture: the approving record');
  const base = headOf(ctx);
  assert.equal(reviewStateForPageAtBase(ctx.repoRoot, base, P1).state, 'matched');
  const production = checkReviewedMerge({
    repoRoot: ctx.repoRoot, base, source: sourceOf([P1]), reviewedPaths: [P1],
    contentPaths: [], diffPaths: [], resultText: `reviewed: ${P1}\n`, analysis: absentAnalysis, sidecar: null,
  });
  assert.equal(production.ok, false, 'production refuses the still-matching page');
  // MUTANT COPY: the state comparison, forced — every page reads mismatched.
  const mutantState = 'mismatched';
  assert.equal(mutantState, 'mismatched', 'the mutant would ratify this page');
  assert.notEqual(production.ok, true, 'the arm distinguishes the mutant from production');
});

// ---------------------------------------------------------------------------
// Task 63: per-page review invocations for multi-page `reviewed:` outcomes.
//
// Each declared page gets its own review invocation carrying that page's
// machine-generated surface, its hash and its kind checklist — never a
// multi-page bundle in one prompt — with the gates disclaimer, the rung line,
// timeout => interrupted, and runner exclusion. The single-page `reviewedOnly`
// plumbing (task 62) is extended, never forked; the precondition reads 61b's
// join and 62's outcome shape and nothing else (no `.job/reviewed-hashes.json`
// store — that is task 64's).
// ---------------------------------------------------------------------------

const POST_PAGE = 'content/blog/reviewed-post.md';
const LEARN_PAGE = 'content/learn/reviewed-learn.md';
const TOOL_PAGE = 'content/directory/tools/reviewed-tool.md';

function reviewCtx63(t) {
  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  return ctx;
}

const baseJob63 = () => ({
  type: 'repair',
  source: 'queue',
  title: 'Ratify the reviewed pages',
  detail: 'The executor read the pages, judged them sound, and left them unchanged.',
});

function briefFor63(t, page, surface, extra = {}) {
  const ctx = reviewCtx63(t);
  const calls = [];
  const graphQuery = (subject) => {
    calls.push(subject);
    return { universe: false };
  };
  const brief = assembleReviewBrief(ctx, {
    jobId: 'j-20260912-63',
    job: baseJob63(),
    diffText: '',
    pass: 1,
    findings: '',
    outPath: `${ctx.reviewsDir}/j-20260912-63.md`,
    gates: { ran: true, results: [] },
    sha: 'abc123def456',
    capMinutes: 30,
    reviewedOnly: page,
    reviewedSurfaceText: surface,
    reviewGraphQuery: graphQuery,
    graphIndexId: 'test-index-1',
    reviewer: { id: 'r-63', provider: 'p-63', tier: 't-63' },
    ...extra,
  });
  return { ctx, brief, calls };
}

test('task 63: a reviewed brief carries the surface, its hash, and no diff section at all', (t) => {
  const surface = pageText('the reviewed bytes for 63');
  const { brief, calls } = briefFor63(t, P1, surface);
  assert.deepEqual(calls, [P1], 'one upstream query for the one page that invocation reviews');
  assert.match(brief, /## Reviewed page surface/);
  assert.match(brief, new RegExp(`### \`${P1.replace(/\//g, '\\/')}\``));
  assert.match(brief, /the reviewed bytes for 63/);
  const expectedHash = reviewedHash(surface);
  assert.match(brief, /Reviewed hash:/, 'the brief prints the hash line');
  assert.match(brief, new RegExp(expectedHash.slice(0, 16)), 'the printed hash is the reviewed-surface hash of the carried bytes');
  assert.match(brief, new RegExp(`## ${GRAPH_ANNEX_HEADING.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  const surfaceAt = brief.indexOf('## Reviewed page surface');
  const annexAt = brief.indexOf(`## ${GRAPH_ANNEX_HEADING}`);
  assert.ok(surfaceAt !== -1 && annexAt !== -1 && annexAt > surfaceAt, 'the annex is appended after the page surface');
  assert.doesNotMatch(brief, /```diff/, 'no diff section at all on a reviewed brief');
  assert.doesNotMatch(brief, /## The diff under review/);
  assert.match(brief, /the reviewed page surface below/);
  assert.match(brief, new RegExp(`ONLY \`${P1.replace(/\//g, '\\/')}\``), 'the per-page header names the one page this invocation reviews');
});

test('task 63: two pages assemble as two separate invocations, never a bundle', (t) => {
  const s1 = pageText('page one bytes');
  const s2 = pageText('page two bytes');
  const a = briefFor63(t, P1, s1);
  const b = briefFor63(t, P2, s2);
  assert.match(a.brief, new RegExp(`### \`${P1.replace(/\//g, '\\/')}\``));
  assert.doesNotMatch(a.brief, new RegExp(`### \`${P2.replace(/\//g, '\\/')}\``), 'page one invocation carries no second page');
  assert.match(a.brief, new RegExp(reviewedHash(s1).slice(0, 16)));
  assert.doesNotMatch(a.brief, new RegExp(reviewedHash(s2).slice(0, 16)), 'page one invocation carries no second hash');
  assert.match(b.brief, new RegExp(`### \`${P2.replace(/\//g, '\\/')}\``));
  assert.doesNotMatch(b.brief, new RegExp(`### \`${P1.replace(/\//g, '\\/')}\``), 'page two invocation carries no first page');
  assert.deepEqual(a.calls, [P1]);
  assert.deepEqual(b.calls, [P2], 'one upstream query per page, never a shared bundle query');
});

test('task 63: the gates section says the gates are evidence the base is green, not evidence about the page', (t) => {
  const surface = pageText('gates disclaimer bytes');
  const { brief } = briefFor63(t, P1, surface);
  assert.match(brief, /identical to the merge base/, 'the gates ran on a tree identical to the merge base');
  assert.match(brief, /evidence.*base is green/i, 'the gates are evidence the base is green');
  assert.match(brief, /NOT evidence about the page/, 'and not evidence about the page under review');
  // Gates that did not run state there is NO base-green evidence (never the
  // old "evidence the base is green" claim), while keeping the page disclaimer.
  const { brief: norun } = briefFor63(t, P1, surface, { gates: { ran: false, why: 'the loop was run with --no-gates' } });
  assert.match(norun, /NO evidence here that the base is green/, 'no gate ran, so no base-green evidence exists');
  assert.match(norun, /no base-green evidence exists/);
  assert.match(norun, /NOT evidence/);
  assert.doesNotMatch(norun, /they are evidence the base is green/, 'the ran:false branch never claims base-green evidence');
  assert.doesNotMatch(norun, /identical to the merge base/, 'no run means no identical-tree measurement to cite');
  assert.doesNotMatch(norun, /## The diff under review/);
  // The dedicated section renders the same disclaimer standalone.
  const sec = reviewedGatesSection({ ran: true, results: [] }, 'abc123def456');
  assert.match(sec, /identical to the merge base/);
  assert.match(sec, /NOT evidence about the page/);
  const sec2 = reviewedGatesSection({ ran: false, why: 'x' }, '');
  assert.match(sec2, /NO evidence here that the base is green/);
  assert.match(sec2, /NOT evidence/);
  assert.doesNotMatch(sec2, /they are evidence the base is green/);
});

test('task 63: the checklist is the page kind, not the job type', (t) => {
  // Job type `repair` would assemble the directory checklist (spot-check
  // rows); the wiki page is kind `entry`, so the brief must carry entry's.
  const surface = pageText('kind bytes');
  const { brief } = briefFor63(t, P1, surface);
  assert.match(brief, /Checklist for this page's kind/, 'the heading names the page kind');
  assert.match(brief, /`entry`/, 'the heading names the gate type for the page');
  assert.match(brief, /Every cited fact has a reachable source/, 'the entry checklist answers for the wiki page');
  assert.doesNotMatch(brief, /Spot-check the changed rows/, 'the repair/directory checklist of the job type is not assembled');
  // A blog post page assembles the post checklist and the voice demand even
  // though the job type (`repair`) would ask for neither.
  const postSurface = `---\ntitle: reviewed post\n---\n\npost bytes\n`;
  const { brief: postBrief } = briefFor63(t, POST_PAGE, postSurface);
  assert.match(postBrief, /Every external claim is source-checked/, 'the post checklist answers for the blog page');
  assert.match(postBrief, /reads-human/, 'the voice question is asked for the post page');
});

test('task 63: the brief names the reviewer rung and route', (t) => {
  const surface = pageText('rung bytes');
  const { brief } = briefFor63(t, P1, surface);
  assert.match(brief, /## Reviewer rung/);
  assert.match(brief, /`r-63`/, 'the rung id the invocation runs on');
  assert.match(brief, /`p-63`/, 'the provider route the invocation runs on');
});

test('task 63: content type to gate type mapping, and unknown kinds fail closed', () => {
  assert.equal(reviewedGateTypeForPage('content/wiki/model/x.md'), 'entry');
  assert.equal(reviewedGateTypeForPage('content/learn/x.md'), 'education');
  assert.equal(reviewedGateTypeForPage('content/tutorials/x.md'), 'tutorial');
  assert.equal(reviewedGateTypeForPage('content/blog/x.md'), 'post');
  assert.equal(reviewedGateTypeForPage('content/directory/tools/x.md'), 'repair');
  assert.equal(reviewedGateTypeForPage('content/deltas/x.md'), 'entry');
  assert.equal(reviewedGateTypeForPage('content/claims/x.md'), 'repair');
  // Backslashes tolerate Windows-shaped paths, like the 62 parser.
  assert.equal(reviewedGateTypeForPage('content\\blog\\x.md'), 'post');
  assert.deepEqual(checklistForReviewedPage('content/wiki/model/x.md'), checklistFor('entry'));
  assert.deepEqual(checklistForReviewedPage('content/blog/x.md'), checklistFor('post'));
  assert.deepEqual(checklistForReviewedPage('content/directory/tools/x.md'), checklistFor('repair'));
  assert.throws(() => reviewedGateTypeForPage('scripts/foo.mjs'), /no checklist for reviewed page/);
  assert.throws(() => reviewedGateTypeForPage('content/unknown/x.md'), /no checklist for reviewed page/);
  assert.throws(() => reviewedGateTypeForPage(''), /no page path/);
  assert.deepEqual(
    Object.keys(REVIEWED_CONTENT_TO_GATE_TYPE).sort(),
    ['claim', 'delta', 'entry', 'learn', 'post', 'tool', 'tutorial'],
    'the mapping enumerates every content type once',
  );
});

test('task 63: per-page record paths are distinct and siblings share citations', (t) => {
  const ctx = reviewCtx63(t);
  const jobId = 'j-20260912-63';
  const a = reviewedPerPageRecordPath(ctx, jobId, 0, 1);
  const b = reviewedPerPageRecordPath(ctx, jobId, 1, 1);
  const a2 = reviewedPerPageRecordPath(ctx, jobId, 0, 2);
  assert.notEqual(a, b, 'two pages never share a record');
  assert.notEqual(a, a2, 'two passes never share a record');
  assert.ok(a.endsWith(`${jobId}.reviewed-0.md`), `per-page name carries the index: ${a}`);
  assert.ok(b.endsWith(`${jobId}.reviewed-1.md`), `per-page name carries the index: ${b}`);
  assert.ok(a2.endsWith(`${jobId}.reviewed-0.pass2.md`), `the revision pass is distinct: ${a2}`);
  assert.equal(isRecordOfJob(`${jobId}.md`, jobId), true);
  assert.equal(isRecordOfJob(`${jobId}.reviewed-0.md`, jobId), true, 'a per-page sibling belongs to the job');
  assert.equal(isRecordOfJob(`${jobId}.pass2.md`, jobId), true);
  assert.equal(isRecordOfJob('j-20260912-99.md', jobId), false);
  // Two per-page siblings may honestly share one sentence (the same trivial
  // correction landing the same way twice), while a sentence recycled from
  // another job is still refused.
  const shared = 'an honest sentence shared by both pages';
  const p0 = reviewedPerPageRecordPath(ctx, jobId, 0, 1);
  writeVerdictRecord(ctx, `${jobId}.reviewed-0`, {
    verdict: 'approve', wouldCite: shared, notes: 'page zero',
  });
  assert.equal(readFileSync(p0, 'utf8').includes(shared), true, 'fixture per-page record carries the sentence');
  const p1 = reviewedPerPageRecordPath(ctx, jobId, 1, 1);
  writeVerdictRecord(ctx, `${jobId}.reviewed-1`, {
    verdict: 'approve', wouldCite: shared, notes: 'page one',
  });
  // p1 carries p0's exact sentence: the sibling is excluded by the job
  // exclusion, so sharing it is not a duplicate.
  const gateSameJob = mergeGate(ctx, {
    jobId, type: 'entry', pass: 1, subjects: [P2], changed: [],
    recordPath: p1,
  });
  assert.equal(gateSameJob.ok, true, `sibling sentence passes via the job exclusion: ${gateSameJob.reason ?? ''}`);
  // The same sentence recycled from another job is still refused.
  writeVerdictRecord(ctx, 'j-20260912-99', {
    verdict: 'approve', wouldCite: shared, notes: 'other job',
  });
  const gateCrossJob = mergeGate(ctx, {
    jobId, type: 'entry', pass: 1, subjects: [P2], changed: [],
    recordPath: p1,
  });
  assert.equal(gateCrossJob.ok, false, 'a cross-job duplicate must refuse');
  assert.equal(gateCrossJob.code, 'would-cite-duplicate');
});

test('task 63: a timeout classifies as interrupted, never as absent review', () => {
  assert.equal(classifyReviewedRun({ killed: true, recordWritten: false }), 'interrupted');
  assert.equal(classifyReviewedRun({ killed: true, recordWritten: true }), 'recorded', 'a kill racing a write still leaves a record to judge');
  assert.equal(classifyReviewedRun({ killed: false, recordWritten: true }), 'recorded');
  assert.equal(classifyReviewedRun({ killed: false, recordWritten: false }), 'absent', 'an un-killed run with no record is absent review and fails closed downstream');
  assert.equal(classifyReviewedRun({}), 'absent');
});

test('task 63: a timeout-prone runner is excluded unless a guard is recorded', () => {
  const killedPhase = (runner) => ({ role: 'review1', runner, mm: 1, killed: true, code: null, outcome: 'no-record' });
  const okPhase = (runner) => ({ role: 'review1', runner, mm: 1, killed: false, code: 0, outcome: 'approve' });
  const line = (id, phases) => ({ id, runner: 'author-x', outcome: 'done', phases });
  // No ledger, or too little evidence, is eligible with no guard.
  assert.deepEqual(checkReviewedRunnerEligibility('r-a', { ledger: null }).ok, true);
  assert.deepEqual(checkReviewedRunnerEligibility('r-a', { ledger: [] }).ok, true);
  assert.deepEqual(
    checkReviewedRunnerEligibility('r-a', { ledger: [line('j-1', [killedPhase('r-a')]), line('j-2', [killedPhase('r-a')])] }).ok,
    true,
    'two kills are not yet timeout-prone',
  );
  // Three consecutive kills are timeout-prone: refused without a guard, allowed with one.
  const ledger3 = [line('j-1', [killedPhase('r-t')]), line('j-2', [killedPhase('r-t')]), line('j-3', [killedPhase('r-t')])];
  const refused = checkReviewedRunnerEligibility('r-t', { ledger: ledger3 });
  assert.equal(refused.ok, false);
  assert.equal(refused.prone, true);
  assert.match(refused.reason, /timeout-prone/);
  assert.match(refused.reason, /guard/);
  assert.equal(checkReviewedRunnerEligibility('r-t', { ledger: ledger3, guard: 'recorded guard: timeout budget doubled, 2026-09-12' }).ok, true);
  assert.equal(checkReviewedRunnerEligibility('r-t', { ledger: ledger3, guard: '   ' }).ok, false, 'a blank guard records nothing');
  // A run that finished on its own breaks the streak, however it ended.
  const mixed = [line('j-1', [killedPhase('r-m')]), line('j-2', [killedPhase('r-m')]), line('j-3', [okPhase('r-m')])];
  assert.equal(checkReviewedRunnerEligibility('r-m', { ledger: mixed }).ok, true);
  // Another runner's kills are not this runner's.
  assert.equal(checkReviewedRunnerEligibility('r-other', { ledger: ledger3 }).ok, true);
  assert.equal(checkReviewedRunnerEligibility(null, { ledger: ledger3 }).ok, false);
});

test('task 63: the run path splits multi-page reviewed into per-page invocations (structural)', () => {
  const src = readFileSync(RUN_LIB, 'utf8');
  // One invocation per declared page, never a bundle.
  assert.match(src, /one review invocation per declared page, never a bundle/);
  assert.match(src, /reviewedPerPageRecordPath/);
  assert.match(src, /classifyReviewedRun/);
  assert.match(src, /checkReviewedRunnerEligibility/);
  assert.match(src, /reviewedGateTypeForPage/);
  assert.match(src, /outPathOverride/);
  assert.match(src, /reviewSuffix/);
  assert.match(src, /recordPath: outPath/);
  // Per-page allowance and budget accounting through the one per-type cap —
  // the same `allowance` the single path reads, duplicated nowhere.
  assert.match(src, /review pass \$\{pass\} page/);
  assert.match(src, /mm \+= one\.run\.mm/);
  // A timeout books interrupted (resumable, never a breaker input).
  assert.match(src, /booking interrupted, resumable, never a breaker input/);
  assert.match(src, /outcome: 'interrupted', mm, changed, note: `review pass/);
  // The old bundled single review for multi-page is gone.
  assert.doesNotMatch(src, /per-page review invocations land in task 63; this review carries the empty diff as one bundled review/);
});

test('task 63: the task reads 61b and 62 and no hash store (structural)', () => {
  const reviewSrc = readFileSync(resolve(HERE, '..', 'lib', 'review.mjs'), 'utf8');
  const runSrc = readFileSync(RUN_LIB, 'utf8');
  // The reviewed brief reuses 62's plumbing and 59's annex filter.
  assert.match(reviewSrc, /assembleGraphContext/);
  assert.match(reviewSrc, /reviewedOnly/);
  // Task 64's store is nowhere on this path.
  assert.doesNotMatch(reviewSrc, /reviewed-hashes/);
  const start = runSrc.indexOf('isPerPageReviewed');
  assert.ok(start !== -1, 'the per-page branch is one named predicate');
  const window = runSrc.slice(Math.max(0, start - 2000), start + 12000);
  assert.doesNotMatch(window, /reviewed-hashes/, 'the per-page review loop never consults the task-64 hash store');
  // The merge still ratifies through 62's gate (the 61b join inside it).
  assert.match(runSrc, /checkReviewedMerge/);
});

test('task 63 mutation: a brief emitting the diff section unconditionally fails the no-fence arm', (t) => {
  const surface = pageText('mutant diff bytes');
  const { brief } = briefFor63(t, P1, surface);
  assert.doesNotMatch(brief, /```diff/, 'production carries no fenced block at all');
  // MUTANT COPY: the no-diff guard, dropped — the diff section rides along.
  const mutant = `${brief}\n\`\`\`diff\n--- a\n+++ b\n\`\`\`\n`;
  assert.match(mutant, /```diff/, 'the mutant emits a fenced block, so the no-fence arm goes red on it');
  assert.notDeepEqual(/```diff/.test(brief), /```diff/.test(mutant), 'the arm distinguishes the mutant from production');
});

test('task 63 mutation: a brief dropping the hash line fails the hash arm', (t) => {
  const surface = pageText('mutant hash bytes');
  const { brief } = briefFor63(t, P1, surface);
  assert.match(brief, /Reviewed hash:/);
  assert.match(brief, new RegExp(reviewedHash(surface).slice(0, 16)));
  // MUTANT COPY: the hash print, dropped — the surface without its binding.
  const mutant = brief.replace(/Reviewed hash:[^\n]*\n/, '');
  assert.doesNotMatch(mutant, /Reviewed hash:/, 'the mutant binds nothing readable, so the hash arm goes red on it');
  assert.notEqual(brief.includes('Reviewed hash:'), mutant.includes('Reviewed hash:'), 'the arm distinguishes the mutant from production');
});

test('task 63 mutation: a brief keyed on the job type fails the kind arm', (t) => {
  const surface = pageText('mutant kind bytes');
  const { brief } = briefFor63(t, P1, surface);
  assert.match(brief, /Every cited fact has a reachable source/, 'production carries the page kind (entry)');
  assert.doesNotMatch(brief, /Spot-check the changed rows/, 'production carries no job-type (repair/directory) checklist');
  // MUTANT COPY: the kind switch, dropped — the governing type's list.
  const mutantList = checklistFor('repair').map((c) => `- ${c}`).join('\n');
  assert.match(mutantList, /Spot-check the changed rows/, 'the mutant assembles the job type list, so the kind arm goes red on it');
  assert.notDeepEqual(brief.includes('Spot-check the changed rows'), mutantList.includes('Spot-check the changed rows'), 'the arm distinguishes the mutant from production');
});

// ---------------------------------------------------------------------------
// Stage-2 task 63 FIX (F1-F8): council-adjudicated revise round.
// ---------------------------------------------------------------------------

test('task 63 fix F1: a multi-page reviewed job stages its per-page records', (t) => {
  const ctx = reviewCtx63(t);
  const jobId = 'j-20260912-63';
  // Two per-page records, no single-page verdict record — the multi-page path.
  writeVerdictRecord(ctx, `${jobId}.reviewed-0`, {
    verdict: 'approve', wouldCite: 'a reader checking dates would cite page zero', notes: 'page zero',
  });
  writeVerdictRecord(ctx, `${jobId}.reviewed-1`, {
    verdict: 'approve', wouldCite: 'a reader checking dates would cite page one', notes: 'page one',
  });
  assert.equal(existsSync(verdictPath(ctx, jobId, 1)), false, 'the single-page verdict record does not exist on the multi-page path');
  const rels = jobPerPageRecordRelPaths(ctx, jobId);
  assert.deepEqual(rels, [
    relative(ctx.repoRoot, reviewedPerPageRecordPath(ctx, jobId, 0, 1)).replace(/\\/g, '/'),
    relative(ctx.repoRoot, reviewedPerPageRecordPath(ctx, jobId, 1, 1)).replace(/\\/g, '/'),
  ]);
  for (const rel of rels) {
    assert.ok(existsSync(join(ctx.repoRoot, rel)), `staged by exact path: ${rel}`);
  }
  // MUTANT COPY: recordPaths without the per-page extension — the ledger with
  // none of the records that approved it.
  const mutantPaths = [
    relative(ctx.repoRoot, ctx.ledgerPath),
    relative(ctx.repoRoot, verdictPath(ctx, jobId, 1)),
    relative(ctx.repoRoot, verdictPath(ctx, jobId, 2)),
  ].map((p) => p.replace(/\\/g, '/'));
  const mutantStaged = mutantPaths.filter((p) => existsSync(join(ctx.repoRoot, p)));
  assert.ok(!mutantStaged.some((p) => p.includes('.reviewed-')), 'the mutant stages no per-page record');
  assert.notDeepEqual(rels.length, 0, 'production stages what the mutant drops');
  // Production wires the helper into the records commit, exact paths only.
  const src = readFileSync(RUN_LIB, 'utf8');
  assert.match(src, /jobPerPageRecordRelPaths\(ctx, jobId\)/);
  assert.match(src, /\.\.\.perPageRecordRelPaths/);
  const recIdx = src.indexOf('F1: this job\'s per-page verdict records');
  assert.ok(recIdx !== -1, 'the per-page records commit is one named block');
  const recWindow = src.slice(recIdx, recIdx + 2000);
  assert.match(recWindow, /\.\.\.perPageRecordRelPaths/, 'the per-page records join the exact-path staging list');
  assert.doesNotMatch(recWindow, /\['add', '-A'\]/, 'the per-page staging stages by exact path, never a bulk add');
});

test('task 63 fix F2: a discarded per-page job transcribes every page\'s carried findings', (t) => {
  const ctx = reviewCtx63(t);
  const jobId = 'j-20260912-63';
  const carryRecord = (pi, title, subject) => {
    const perPath = reviewedPerPageRecordPath(ctx, jobId, pi, 1);
    mkdirSync(dirname(perPath), { recursive: true });
    writeFileSync(
      perPath,
      `---\njob: ${jobId}\nverdict: approve\nwould-cite: "fixture cite ${pi}"\ncarry:\n  - title: ${title}\n    detail: finding detail for ${title}\n    subject: ${subject}\n---\n\nfixture notes ${pi}\n`,
      'utf8',
    );
    return perPath;
  };
  // Two per-page records carrying findings that name files the discarded
  // branch never merged — orphaned on a discard, never transcribed as queue
  // items pointed at files that never existed.
  carryRecord(0, 'first page finding', 'content/wiki/model/never-merged-a.md');
  carryRecord(1, 'second page finding', 'content/wiki/model/never-merged-b.md');
  // Detected from the verdict plus the records on disk — never from
  // `mergeSubjects`, which is null on discard.
  const perPaths = perPageRecordPathsForPass(ctx, jobId, 1);
  assert.equal(perPaths.length, 2, 'both per-page records are detected for the pass');
  assert.deepEqual(perPaths, [
    reviewedPerPageRecordPath(ctx, jobId, 0, 1),
    reviewedPerPageRecordPath(ctx, jobId, 1, 1),
  ]);
  const orphaned = [];
  for (const perPath of perPaths) {
    const c = transcribeCarriedFindings(ctx, {
      jobId, verdictPath: perPath, reviewer: 'r-63', subjectMustExist: true,
    });
    orphaned.push(...c.orphaned);
    assert.deepEqual(c.transcribed, [], 'an orphaned finding is never written as a queue item');
  }
  assert.equal(orphaned.length, 2, 'every page\'s carried finding survives the discard');
  assert.deepEqual(orphaned.map((f) => f.title).sort(), ['first page finding', 'second page finding']);
  // The old single-record attempt sees nothing on this path — the defect.
  const single = transcribeCarriedFindings(ctx, {
    jobId, verdictPath: verdictPath(ctx, jobId, 1), reviewer: 'r-63', subjectMustExist: true,
  });
  assert.equal(single.why, 'no verdict record');
  assert.deepEqual(single.orphaned, []);
  // Production keys the per-page block on the verdict plus the records.
  const src = readFileSync(RUN_LIB, 'utf8');
  assert.match(src, /perPageRecordPathsForPass\(ctx, jobId, result\.pass/);
  assert.match(src, /if \(result\.verdict\)/);
  assert.doesNotMatch(src, /Array\.isArray\(mergeSubjects\) && mergeSubjects\.length > 1/, 'the discard-blind mergeSubjects key is gone');
});

test('task 63 fix F4: an unreadable page fails closed before dispatch (structural)', () => {
  const src = readFileSync(RUN_LIB, 'utf8');
  // Fail-closed guard in the per-page loop: no surface, no review.
  assert.match(src, /its machine-generated surface could not be read — failing closed, no review without its bytes/);
  assert.match(src, /if \(surface == null\)/);
  assert.match(src, /outcome: 'failed', mm, changed, note: reason/);
  // Ordered: the guard sits between the surface read and the dispatch.
  const readIdx = src.indexOf('surface = readFileSync(join(worktree, page)');
  const guardIdx = src.indexOf('if (surface == null)');
  const dispatchIdx = src.indexOf('const one = await runReview');
  assert.ok(readIdx !== -1 && guardIdx !== -1 && dispatchIdx !== -1, 'read, guard and dispatch all exist');
  assert.ok(readIdx < guardIdx && guardIdx < dispatchIdx, 'the guard runs after the read and before any review is dispatched');
  // MUTANT COPY: the old fall-through — a null surface riding into the brief's
  // no-surface fallback while the reviewer may still approve.
  const mutantDispatchesWithoutSurface = guardIdx === -1;
  assert.equal(mutantDispatchesWithoutSurface, false, 'production fails closed where the mutant would dispatch without bytes');
  // The task-62 single-page fallback is untouched (out of scope).
  assert.match(src, /reviewedSurfaceText = null/, 'the single-page fallback still stands');
});

test('task 63 fix F5: the duplicated bound comment appears once (structural)', () => {
  const src = readFileSync(RUN_LIB, 'utf8');
  const hits = src.match(/THE REVIEW IS WHERE THE BOUND MOST OFTEN BINDS/g) ?? [];
  assert.equal(hits.length, 1, 'one copy of the duplicated block was dropped');
});

test('task 63 fix F7: single-page reviewed keeps the single record shape (structural)', () => {
  const src = readFileSync(RUN_LIB, 'utf8');
  const hits = src.match(/outPathOverride/g) ?? [];
  assert.equal(hits.length, 1, 'only the per-page branch overrides the record path; the single-page branch keeps verdictPath');
  const elseIdx = src.indexOf('// Single-page and non-reviewed paths, unchanged');
  assert.ok(elseIdx !== -1, 'the single-page branch is one named block');
  const window = src.slice(elseIdx, elseIdx + 6000);
  assert.match(window, /reviewedOnly/, 'the single-page branch still carries its one page');
  assert.doesNotMatch(window, /outPathOverride/, 'a future fan-out of a single page goes red here');
  assert.doesNotMatch(window, /reviewedPerPageRecordPath/, 'a record rename for single-page goes red here');
});

test('task 63 fix F8: per-page invocation clears its stale record before dispatch (structural; folded into F8x)', () => {
  // F8x subsumes F8: the stale-record clear lives in shared `runReview`
  // (every path); the per-page caller must not clear twice.
  const reviewSrc = readFileSync(resolve(HERE, '..', 'lib', 'review.mjs'), 'utf8');
  assert.match(reviewSrc, /F8x: clear a stale record/, 'the shared stale-record clear is one named block');
  assert.match(reviewSrc, /unlinkSync\(outPath\)/, 'best-effort unlink of the target record');
  const outIdx = reviewSrc.indexOf('const outPath = typeof outPathOverride');
  const unlinkIdx = reviewSrc.indexOf('unlinkSync(outPath)');
  const dispatchIdx = reviewSrc.indexOf('const run = await runExecutor');
  assert.ok(outIdx !== -1 && unlinkIdx !== -1 && dispatchIdx !== -1, 'outPath, clear and dispatch all exist in shared runReview');
  assert.ok(outIdx < unlinkIdx && unlinkIdx < dispatchIdx, 'the clear runs after the outPath is final and before the spawn');
  // Folded: no caller-side duplicate on the per-page path.
  const runSrc = readFileSync(RUN_LIB, 'utf8');
  assert.match(runSrc, /F8 \(folded into F8x\)/, 'the per-page caller names the fold');
  const perOut = runSrc.indexOf('const outPath = reviewedPerPageRecordPath(ctx, jobId, pi, pass)');
  assert.ok(perOut !== -1, 'the per-page outPath still exists');
  const perWindow = runSrc.slice(perOut, perOut + 2000);
  assert.doesNotMatch(perWindow, /unlinkSync\(outPath\)/, 'no caller-side duplicate of the shared clear');
});

// ---------------------------------------------------------------------------
// Stage-2 task 63 FIX-2 (F4x, F8x, F9, F10).
// ---------------------------------------------------------------------------

test('task 63 fix F4x: an unreadable single-page surface fails closed before dispatch (structural)', () => {
  const src = readFileSync(RUN_LIB, 'utf8');
  // Fail-closed guard in the single-page branch: no surface, no review.
  assert.match(src, /F4x: fail the single-page invocation closed/, 'the single-page fail-closed is one named block');
  assert.match(src, /cannot review page \$\{reviewedOnly\}/, 'the failure names the single page');
  assert.match(src, /if \(reviewedSurfaceText == null\)/, 'the null-surface guard');
  // Ordered: the guard sits between the single-page surface read and the single dispatch.
  const elseIdx = src.indexOf('// Single-page and non-reviewed paths, unchanged');
  assert.ok(elseIdx !== -1, 'the single-page branch is one named block');
  const window = src.slice(elseIdx, elseIdx + 6000);
  const readIdx = window.indexOf('reviewedSurfaceText = readFileSync(join(worktree, reviewedOnly)');
  const guardIdx = window.indexOf('if (reviewedSurfaceText == null)');
  const dispatchIdx = window.indexOf('rev = await runReview');
  assert.ok(readIdx !== -1 && guardIdx !== -1 && dispatchIdx !== -1, 'read, guard and dispatch all exist in the single-page branch');
  assert.ok(readIdx < guardIdx && guardIdx < dispatchIdx, 'the guard runs after the read and before any review is dispatched');
  assert.match(window, /outcome: 'failed', mm, changed, note: reason/, 'an unreadable single-page surface fails the job closed');
  // MUTANT COPY: the old fall-through — a null surface riding into the brief's
  // no-surface fallback while the reviewer may still approve.
  const mutantDispatchesWithoutSurface = guardIdx === -1;
  assert.equal(mutantDispatchesWithoutSurface, false, 'production fails closed where the mutant would dispatch without bytes');
  // Per-page F4 stays as built (F4x expands, never replaces).
  assert.match(src, /if \(surface == null\)/, 'the per-page fail-closed still stands');
});

test('task 63 fix F8x: a stale record at the target with a killed run classifies interrupted, not recorded', (t) => {
  const reviewSrc = readFileSync(resolve(HERE, '..', 'lib', 'review.mjs'), 'utf8');
  // Shared clear is one named block in runReview; the train review functions
  // are separate, pre-existing, unflagged — untouched.
  const runReviewIdx = reviewSrc.indexOf('export async function runReview(');
  assert.ok(runReviewIdx !== -1, 'shared runReview exists');
  const runReviewWindow = reviewSrc.slice(runReviewIdx, runReviewIdx + 6000);
  assert.match(runReviewWindow, /unlinkSync\(outPath\)/, 'shared runReview clears its target before dispatch');
  for (const name of ['export async function runTrainReview(', 'export async function runTrainComparison(', 'export async function reviewTrain(']) {
    const idx = reviewSrc.indexOf(name);
    assert.ok(idx !== -1, `${name} still exists`);
    const window = reviewSrc.slice(idx, idx + 6000);
    assert.doesNotMatch(window, /unlinkSync\(outPath\)/, `${name} gains no stale-record clear`);
  }
  // Behavioral: a stale record left at the target would make a killed,
  // no-write retry read as `recorded`; cleared, it reads `interrupted`.
  const ctx = reviewCtx63(t);
  const jobId = 'j-20260912-63';
  const target = verdictPath(ctx, jobId, 1);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, '---\njob: j-20260912-63\nverdict: approve\nwould-cite: "stale record from a killed prior run"\n---\n\nstale notes\n', 'utf8');
  assert.equal(existsSync(target), true, 'the stale record exists before the clear');
  // MUTANT COPY: no clear — the killed retry sees the stale record.
  assert.equal(classifyReviewedRun({ killed: true, recordWritten: true }), 'recorded', 'without the clear a stale record misclassifies a killed run as recorded');
  // Production effect: best-effort unlink of the target (single-file removal).
  try {
    unlinkSync(target);
  } catch {
    /* absent is the expected case on retry */
  }
  assert.equal(existsSync(target), false, 'the clear removes the stale record');
  assert.equal(classifyReviewedRun({ killed: true, recordWritten: existsSync(target) }), 'interrupted', 'cleared, a killed no-write run classifies interrupted');
});

test('task 63 fix F9: the registry rejects a blank or non-string timeout guard', (t) => {
  const bad = (guardLine) => {
    const ctx = makeRepo({
      now: () => NOW,
      runners: `version: 1\ndefault: mock-a\nrunners:\n  - id: mock-a\n    provider: provider-a\n    tier: frontier\n    roles: [author, reviewer]\n    command: 'noop'\n    timeout_guard: ${guardLine}\n`,
    });
    t.after(() => ctx.cleanup());
    return ctx;
  };
  for (const line of [`''`, `'   '`, `1`, `true`]) {
    const ctx = bad(line);
    assert.throws(() => loadRunners({ runnersPath: ctx.runnersPath }), /"timeout_guard" must be a non-empty string when present/);
  }
  // A bare key (null) also records nothing and is rejected.
  const bareCtx = makeRepo({
    now: () => NOW,
    runners: `version: 1\ndefault: mock-a\nrunners:\n  - id: mock-a\n    provider: provider-a\n    tier: frontier\n    roles: [author, reviewer]\n    command: 'noop'\n    timeout_guard:\n`,
  });
  t.after(() => bareCtx.cleanup());
  assert.throws(() => loadRunners({ runnersPath: bareCtx.runnersPath }), /"timeout_guard" must be a non-empty string when present/);
});

test('task 63 fix F9: a fixture registry carrying timeout_guard surfaces it on the loaded entry', (t) => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: `version: 1\ndefault: mock-a\nrunners:\n  - id: mock-a\n    provider: provider-a\n    tier: frontier\n    roles: [author, reviewer]\n    command: 'noop'\n    timeout_guard: 'timeout budget doubled, 2026-09-12'\n  - id: mock-b\n    provider: provider-b\n    tier: cheap\n    roles: [author, reviewer]\n    command: 'noop'\n`,
  });
  t.after(() => ctx.cleanup());
  const registry = loadRunners({ runnersPath: ctx.runnersPath });
  // Absent means none — same shape discipline as effort / escalates_to.
  assert.equal(registry.byId.get('mock-b').timeout_guard, undefined);
  // Present survives loadRunners/pickRunner passthrough with no new machinery.
  assert.equal(registry.byId.get('mock-a').timeout_guard, 'timeout budget doubled, 2026-09-12');
  assert.equal(pickRunner(registry, { id: 'mock-a', role: 'reviewer' }).timeout_guard, 'timeout budget doubled, 2026-09-12');
  assert.equal(pickRunner(registry, { role: 'reviewer' }).timeout_guard, 'timeout budget doubled, 2026-09-12', 'the default reviewer carries its guard');
});

test('task 63 fix F9: the run path wires the registry guard into eligibility (structural)', () => {
  const src = readFileSync(RUN_LIB, 'utf8');
  assert.match(src, /reviewer\?\.timeout_guard \?\? null/, 'the eligibility call reads the registry guard');
  const eligIdx = src.indexOf('checkReviewedRunnerEligibility(reviewer');
  assert.ok(eligIdx !== -1, 'the reviewed eligibility call exists');
  const window = src.slice(Math.max(0, eligIdx - 2000), eligIdx + 500);
  assert.match(window, /runners\.yml/, 'the comment names the runner registry as the recording place');
  assert.match(window, /timeout_guard/, 'the comment names timeout_guard as the recording key');
});
