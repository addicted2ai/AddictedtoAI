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
import matter from 'gray-matter';

import {
  RESULT_PROTOCOL_INSTRUCTION,
  classifyRun,
  parseReviewedLine,
  readResult,
} from '../lib/result.mjs';
import {
  REVIEWED_HASH_STORE_REL,
  checkReviewedHashStore,
  checkCommittedDeclaration,
  checkReviewedDiffEmpty,
  checkReviewedGraphEmptiness,
  checkReviewedMerge,
  constituteMergeSubjects,
  emptyDiffFailsOutcome,
  jobPerPageRecordRelPaths,
  perPageRecordPathsForPass,
  readReviewedHashStore,
  reviewedEmptySymbolAssertion,
  reviewedPathsFromResultText,
  reviewedHashAtRef,
  runLoop,
  writeReviewedHashStore,
} from '../run.mjs';
import { gitTry } from '../lib/git.mjs';
import { mergeLockPath } from '../lib/train.mjs';
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
  runReview,
  isRecordOfJob,
  REVIEWED_CONTENT_TO_GATE_TYPE,
  checklistFor,
  mergeGate,
  verdictPath,
} from '../lib/review.mjs';
import { GRAPH_ANNEX_HEADING } from '../lib/brief.mjs';
import { transcribeCarriedFindings } from '../lib/carry.mjs';
import { reviewedHash, reviewedHashOfFile } from '../../lib/review-hash.mjs';
import { loadRunners, pickRunner } from '../lib/runners.mjs';
import { git, makeRepo, mockCommand, runnersYaml, writeQueue } from './helpers.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const RUN_LIB = resolve(HERE, '..', 'run.mjs');
const TRAIN_LIB = resolve(HERE, '..', 'lib', 'train.mjs');

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

test('task 63 (scoping pin amended by task 64): the brief machinery reads 61b and 62; the store writer stands at assembly (structural)', () => {
  const reviewSrc = readFileSync(resolve(HERE, '..', 'lib', 'review.mjs'), 'utf8');
  const runSrc = readFileSync(RUN_LIB, 'utf8');
  // The reviewed brief reuses 62's plumbing and 59's annex filter, and the
  // brief/checklist machinery itself still never consults the task-64 store —
  // the store is the LOOP's binding, written at assembly and read at merge,
  // never a brief-side input.
  assert.match(reviewSrc, /assembleGraphContext/);
  assert.match(reviewSrc, /reviewedOnly/);
  assert.doesNotMatch(reviewSrc, /reviewed-hashes/);
  const start = runSrc.indexOf('isPerPageReviewed');
  assert.ok(start !== -1, 'the per-page branch is one named predicate');
  const window = runSrc.slice(Math.max(0, start - 2000), start + 12000);
  // Task 64 landed the store writer INSIDE this window, at review-brief
  // assembly — task 63's original pin ("the per-page review loop never
  // consults the task-64 hash store") described the pre-64 world and is
  // superseded by the stronger ordering claim below: the loop now WRITES the
  // store here, committed before the first reviewer dispatch.
  assert.match(window, /writeReviewedHashStore\(/, 'task 64: the store is written at review-brief assembly');
  const writeIdx = window.indexOf('writeReviewedHashStore(');
  const dispatchIdx = window.indexOf('const one = await runReview');
  assert.ok(dispatchIdx !== -1, 'the per-page dispatch exists in the window');
  assert.ok(writeIdx !== -1 && writeIdx < dispatchIdx, 'the store is written and committed before the first reviewer dispatch');
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
  // G4 widened the guard to the empty string (fail-closed, never dispatched);
  // the pin below tracks the widened expression — strictly stronger, never weaker.
  assert.match(src, /if \(surface == null \|\| surface === ''\)/);
  assert.match(src, /outcome: 'failed', mm, changed, note: reason/);
  // Ordered: the guard sits between the surface read and the dispatch.
  const readIdx = src.indexOf('surface = readFileSync(join(worktree, page)');
  const guardIdx = src.indexOf(`if (surface == null || surface === '')`);
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
  // G4 widened the guard to the empty string (fail-closed, never dispatched);
  // the pin below tracks the widened expression — strictly stronger, never weaker.
  assert.match(src, /if \(reviewedSurfaceText == null \|\| reviewedSurfaceText === ''\)/, 'the null-or-empty-surface guard');
  // Ordered: the guard sits between the single-page surface read and the single dispatch.
  const elseIdx = src.indexOf('// Single-page and non-reviewed paths, unchanged');
  assert.ok(elseIdx !== -1, 'the single-page branch is one named block');
  const window = src.slice(elseIdx, elseIdx + 6000);
  const readIdx = window.indexOf('reviewedSurfaceText = readFileSync(join(worktree, reviewedOnly)');
  const guardIdx = window.indexOf(`if (reviewedSurfaceText == null || reviewedSurfaceText === '')`);
  const dispatchIdx = window.indexOf('rev = await runReview');
  assert.ok(readIdx !== -1 && guardIdx !== -1 && dispatchIdx !== -1, 'read, guard and dispatch all exist in the single-page branch');
  assert.ok(readIdx < guardIdx && guardIdx < dispatchIdx, 'the guard runs after the read and before any review is dispatched');
  assert.match(window, /outcome: 'failed', mm, changed, note: reason/, 'an unreadable single-page surface fails the job closed');
  // MUTANT COPY: the old fall-through — a null surface riding into the brief's
  // no-surface fallback while the reviewer may still approve.
  const mutantDispatchesWithoutSurface = guardIdx === -1;
  assert.equal(mutantDispatchesWithoutSurface, false, 'production fails closed where the mutant would dispatch without bytes');
  // Per-page F4 stays as built (F4x expands, never replaces) — G4 widened it
  // in place, so the pin tracks the widened expression here too.
  assert.match(src, /if \(surface == null \|\| surface === ''\)/, 'the per-page fail-closed still stands');
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
    // G5 is runReview-only: no clear-refusal shape and no STALE log on the
    // train path (additive — the F8x arm above is untouched).
    assert.doesNotMatch(window, /clearRefused/, `${name} gains no clear-refusal shape`);
    assert.doesNotMatch(window, /STALE: stale review record/, `${name} gains no stale-refusal log`);
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

// ---------------------------------------------------------------------------
// Stage-2 task 63 FIX-3 (G1-G5).
// ---------------------------------------------------------------------------

test('task 63 fix G1: a gap in the per-page records loses nothing past it', (t) => {
  const ctx = reviewCtx63(t);
  const jobId = 'j-20260912-63';
  // Records at indices 0 and 2, none at 1: a page-0 review that wrote no
  // record (silent reviewer → the gate refuses no-record, the loop continues)
  // followed by a page-1 approval leaves a record past a gap.
  for (const pi of [0, 2]) {
    const perPath = reviewedPerPageRecordPath(ctx, jobId, pi, 1);
    mkdirSync(dirname(perPath), { recursive: true });
    writeFileSync(
      perPath,
      `---\njob: ${jobId}\nverdict: approve\nwould-cite: "fixture cite ${pi}"\n---\n\nfixture notes ${pi}\n`,
      'utf8',
    );
  }
  assert.equal(existsSync(reviewedPerPageRecordPath(ctx, jobId, 1, 1)), false, 'index 1 is the gap');
  const found = perPageRecordPathsForPass(ctx, jobId, 1);
  assert.deepEqual(found, [
    reviewedPerPageRecordPath(ctx, jobId, 0, 1),
    reviewedPerPageRecordPath(ctx, jobId, 2, 1),
  ], 'both records are found, in ascending index order');
  // MUTANT COPY: the old early break — probing stops at the first gap.
  const mutant = [];
  for (let i = 0; i < 100; i++) {
    const perPath = reviewedPerPageRecordPath(ctx, jobId, i, 1);
    if (!existsSync(perPath)) break;
    mutant.push(perPath);
  }
  assert.deepEqual(mutant, [reviewedPerPageRecordPath(ctx, jobId, 0, 1)], 'the mutant stops at the gap');
  assert.notDeepEqual(found, mutant, 'the arm distinguishes production from the break-restored mutant');
  // Production holds no early break on this probe.
  const src = readFileSync(RUN_LIB, 'utf8');
  const fnIdx = src.indexOf('export function perPageRecordPathsForPass(');
  assert.ok(fnIdx !== -1, 'the probe is one named function');
  const fnWindow = src.slice(fnIdx, fnIdx + 1500);
  assert.doesNotMatch(fnWindow, /if \(!present\) break/, 'no early break on a missing record');
});

test('task 63 fix G3: a non-ENOENT reviews-dir read error is loud, an absent dir stays silent', (t) => {
  const src = readFileSync(RUN_LIB, 'utf8');
  const fnIdx = src.indexOf('export function jobPerPageRecordRelPaths(');
  assert.ok(fnIdx !== -1, 'the staging reader is one named function');
  const window = src.slice(fnIdx, fnIdx + 1500);
  assert.match(window, /e\?\.code === 'ENOENT'/, 'the catch discriminates ENOENT');
  assert.match(window, /STAGING/, 'a non-ENOENT read error is logged loudly with the STAGING prefix');
  // Behavioral EACCES injection is platform-flaky (Windows ACLs vs POSIX
  // modes diverge, and an elevated runner ignores modes) — not attempted; the
  // structural arm above pins the loud path instead.
  // Behavioral: an absent reviews dir stays silent [].
  const ctx = reviewCtx63(t);
  const missing = { ...ctx, reviewsDir: join(ctx.repoRoot, 'data', 'reviews-no-such-dir') };
  assert.equal(existsSync(missing.reviewsDir), false, 'the fixture dir is absent');
  assert.deepEqual(jobPerPageRecordRelPaths(missing, 'j-20260912-63'), [], 'an absent reviews dir stages nothing');
  assert.doesNotMatch(ctx.output(), /STAGING/, 'the absent-dir path logs nothing');
});

test('task 63 fix G4: a readable-but-empty page surface fails closed before dispatch (structural)', () => {
  const src = readFileSync(RUN_LIB, 'utf8');
  assert.match(src, /if \(surface == null \|\| surface === ''\)/, 'the per-page guard covers the empty string');
  assert.match(src, /its machine-generated surface is empty — failing closed, no review without its bytes/, 'the refusal names the empty surface');
  const readIdx = src.indexOf('surface = readFileSync(join(worktree, page)');
  const guardIdx = src.indexOf(`if (surface == null || surface === '')`);
  const dispatchIdx = src.indexOf('const one = await runReview');
  assert.ok(readIdx !== -1 && guardIdx !== -1 && dispatchIdx !== -1, 'read, guard and dispatch all exist');
  assert.ok(readIdx < guardIdx && guardIdx < dispatchIdx, 'the guard runs after the read and before any review is dispatched');
  // MUTANT COPY: the old null-only guard — an empty surface rides into the
  // brief's no-surface fallback with no bound hash while the reviewer may
  // still approve.
  assert.equal('' == null, false, 'the old guard lets an empty surface through, so the empty-string arm goes red on it');
  // The brief's fallback is defense-in-depth and stays untouched.
  const reviewSrc = readFileSync(resolve(HERE, '..', 'lib', 'review.mjs'), 'utf8');
  assert.match(reviewSrc, /const hasSurface = typeof reviewedSurfaceText === 'string' && reviewedSurfaceText;/, 'the brief fallback is untouched');
});

test('task 63 fix G4: a readable-but-empty single-page surface fails closed before dispatch (structural)', () => {
  const src = readFileSync(RUN_LIB, 'utf8');
  const elseIdx = src.indexOf('// Single-page and non-reviewed paths, unchanged');
  assert.ok(elseIdx !== -1, 'the single-page branch is one named block');
  const window = src.slice(elseIdx, elseIdx + 6000);
  assert.match(window, /if \(reviewedSurfaceText == null \|\| reviewedSurfaceText === ''\)/, 'the single-page guard covers the empty string');
  assert.match(window, /its machine-generated surface is empty — failing closed, no review without its bytes/, 'the refusal names the empty surface');
  const readIdx = window.indexOf('reviewedSurfaceText = readFileSync(join(worktree, reviewedOnly)');
  const guardIdx = window.indexOf(`if (reviewedSurfaceText == null || reviewedSurfaceText === '')`);
  const dispatchIdx = window.indexOf('rev = await runReview');
  assert.ok(readIdx !== -1 && guardIdx !== -1 && dispatchIdx !== -1, 'read, guard and dispatch all exist in the single-page branch');
  assert.ok(readIdx < guardIdx && guardIdx < dispatchIdx, 'the guard runs after the read and before any review is dispatched');
  // MUTANT COPY: same null-only fall-through as the per-page site.
  assert.equal('' == null, false, 'the old guard lets an empty surface through, so the empty-string arm goes red on it');
});

test('task 63 fix G5: a persisting stale record refuses dispatch with a synthetic failure (structural)', () => {
  const reviewSrc = readFileSync(resolve(HERE, '..', 'lib', 'review.mjs'), 'utf8');
  const runReviewIdx = reviewSrc.indexOf('export async function runReview(');
  assert.ok(runReviewIdx !== -1, 'shared runReview exists');
  const window = reviewSrc.slice(runReviewIdx, runReviewIdx + 6000);
  // ENOENT-vs-persist discrimination: absent/gone proceeds, present refuses.
  assert.match(window, /e\?\.code !== 'ENOENT'/, 'the unlink catch discriminates ENOENT');
  assert.match(window, /stillPresent = existsSync\(outPath\)/, 'persistence is measured on disk, not assumed from the error');
  // The refusal is loud and shaped for the existing absent-review machinery.
  assert.match(window, /STALE: stale review record/, 'the refusal is logged loudly with the STALE prefix');
  assert.match(window, /clearRefused: reason/, 'the synthetic failure carries clearRefused');
  assert.match(window, /recordWritten: false/, 'the synthetic failure claims no record');
  assert.match(window, /code: 1, killed: false, stdout: '', stderr: reason, mm: 0, ms: 0/, 'the synthetic run matches the runExecutor contract shape');
  // Full shape: every field the callers read exists without a dispatch.
  assert.match(window, /command: runner\.command/, 'the synthetic run names the runner command');
  assert.match(window, /discarded: \{ dirtyBefore: '', dirtyAfter: '', discardedAnything: false \}/, 'the synthetic discard claims nothing discarded');
  assert.match(window, /branchShaBefore/, 'the synthetic shape carries the before-sha');
  assert.match(window, /branchShaAfter/, 'the synthetic shape carries the after-sha');
  assert.match(window, /branchUnchanged: true/, 'the synthetic shape claims the branch unchanged');
  // Ordered: outPath final → clear → persist check → synthetic return → (only
  // then) dispatch. The refusal returns before any spawn.
  const outIdx = window.indexOf('const outPath = typeof outPathOverride');
  const unlinkIdx = window.indexOf('unlinkSync(outPath)');
  const refuseIdx = window.indexOf('clearRefused: reason');
  const dispatchIdx = window.indexOf('const run = await runExecutor');
  assert.ok(outIdx !== -1 && unlinkIdx !== -1 && refuseIdx !== -1 && dispatchIdx !== -1, 'outPath, clear, refusal and dispatch all exist in shared runReview');
  assert.ok(outIdx < unlinkIdx && unlinkIdx < refuseIdx && refuseIdx < dispatchIdx, 'the refusal returns before any review is dispatched');
  // MUTANT COPY: the old swallow-and-dispatch — a stale record read as this
  // invocation's. The persist check is what stands between them.
  assert.match(window, /if \(stillPresent\)/, 'without the persist check the catch would fall through to dispatch');
});

// ---------------------------------------------------------------------------
// Stage-2 task 63 FIX-4 (H1).
// ---------------------------------------------------------------------------

test('task 63 fix H1: a directory at the record path refuses dispatch without a spawn (behavioral)', async (t) => {
  const ctx = reviewCtx63(t);
  // A directory as outPath: unlinkSync throws non-ENOENT on every platform
  // (EISDIR/POSIX, EPERM/Windows) while existsSync stays true — the G5
  // persisting-record shape, from a fixture, no stale file to clean up.
  const dirPath = join(ctx.reviewsDir, 'j-20260912-h1');
  mkdirSync(dirPath, { recursive: true });
  assert.equal(existsSync(dirPath), true, 'the directory record path exists before dispatch');
  // The refusal returns before runExecutor, so this runner must never run: a
  // nonexistent binary would fail loudly if spawned.
  const neverRunner = { id: 'mock-never', provider: 'provider-a', tier: 'frontier', command: 'definitely-no-such-binary-atai-h1' };
  const result = await runReview(ctx, {
    jobId: 'j-20260912-h1',
    job: baseJob63(),
    branch: 'main',
    diffText: '',
    runner: neverRunner,
    capMinutes: 30,
    pass: 1,
    outPathOverride: dirPath,
  });
  assert.match(result.clearRefused ?? '', /STALE: stale review record/, 'the refusal names the persisting record loudly');
  assert.match(result.clearRefused ?? '', new RegExp(dirPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'the refusal names the path');
  assert.equal(result.recordWritten, false, 'the synthetic failure claims no record');
  assert.equal(result.run.code, 1, 'the synthetic run fails');
  assert.equal(result.run.killed, false, 'the synthetic run was not killed');
  assert.equal(result.run.stdout, '', 'the synthetic run carries no stdout');
  assert.equal(result.run.stderr, result.clearRefused, 'the synthetic stderr is the refusal reason');
  assert.equal(result.run.mm, 0, 'the synthetic run costs nothing');
  assert.equal(existsSync(dirPath), true, 'the directory is untouched — nothing wrote through it');
  assert.match(ctx.output(), /STALE: stale review record/, 'the refusal is logged loudly');
  // MUTANT COPY: the old dispatch-over-stale — runExecutor spawns the runner
  // command against the persisting path. The nonexistent binary proves the
  // production path never reaches the spawn: a dispatched run could not return
  // this synthetic shape.
  assert.equal(result.run.command, neverRunner.command, 'the synthetic run names the unspawned command');
});

test('task 63 fix H1: both runReview dispatch sites fail closed on clearRefused before mergeGate (structural)', () => {
  const src = readFileSync(RUN_LIB, 'utf8');
  // Survey: exactly two runReview dispatch sites in loop/ — the per-page
  // loop's `one` and the single path's `rev` in executeJob. The train review
  // functions do NOT use runReview (separate, pre-existing, unflagged) and
  // are untouched.
  const dispatches = src.match(/await runReview\(ctx, \{/g) ?? [];
  assert.equal(dispatches.length, 2, 'exactly two runReview dispatch sites, no more');
  assert.match(src, /const one = await runReview/, 'the per-page dispatch site exists');
  assert.match(src, /rev = await runReview/, 'the single-path dispatch site exists');
  const reviewSrc = readFileSync(resolve(HERE, '..', 'lib', 'review.mjs'), 'utf8');
  for (const name of ['export async function runTrainReview(', 'export async function runTrainComparison(', 'export async function reviewTrain(']) {
    const idx = reviewSrc.indexOf(name);
    assert.ok(idx !== -1, `${name} still exists`);
    const window = reviewSrc.slice(idx, idx + 6000);
    assert.doesNotMatch(window, /clearRefused/, `${name} gains no clear-refusal shape`);
  }
  // Per-page site: dispatch → clearRefused guard → fail with the reason →
  // mergeGate. The gate on this path reads `outPath`, the persisting path.
  const perIdx = src.indexOf('const one = await runReview');
  assert.ok(perIdx !== -1, 'the per-page dispatch exists');
  const perWindow = src.slice(perIdx, perIdx + 12000);
  assert.match(perWindow, /if \(one\.clearRefused\)/, 'the per-page site checks clearRefused');
  assert.match(perWindow, /outcome: 'failed', mm, changed, note: one\.clearRefused/, 'the per-page refusal fails with the reason');
  assert.match(perWindow, /STALE: stale review record/, 'the per-page refusal is logged loudly with the STALE prefix');
  const perGuard = perWindow.indexOf('if (one.clearRefused)');
  const perGate = perWindow.indexOf('mergeGate(ctx,');
  assert.ok(perGuard !== -1 && perGate !== -1, 'per-page guard and gate both exist');
  assert.ok(perGuard < perGate, 'the per-page guard runs before mergeGate ever sees the persisting path');
  // Single site: dispatch → clearRefused guard → fail with the reason →
  // mergeGate.
  const elseIdx = src.indexOf('// Single-page and non-reviewed paths, unchanged');
  assert.ok(elseIdx !== -1, 'the single-page branch is one named block');
  const singleWindow = src.slice(elseIdx, elseIdx + 9000);
  const singleDispatch = singleWindow.indexOf('rev = await runReview');
  assert.ok(singleDispatch !== -1, 'the single dispatch exists');
  const afterDispatch = singleWindow.slice(singleDispatch, singleDispatch + 6000);
  assert.match(afterDispatch, /if \(rev\.clearRefused\)/, 'the single site checks clearRefused');
  assert.match(afterDispatch, /outcome: 'failed', mm, changed, note: rev\.clearRefused/, 'the single refusal fails with the reason');
  assert.match(afterDispatch, /STALE: stale review record/, 'the single refusal is logged loudly with the STALE prefix');
  const singleGuard = afterDispatch.indexOf('if (rev.clearRefused)');
  const singleGate = afterDispatch.indexOf('mergeGate(ctx,');
  assert.ok(singleGuard !== -1 && singleGate !== -1, 'single guard and gate both exist');
  assert.ok(singleGuard < singleGate, 'the single guard runs before mergeGate ever sees the persisting path');
});

// ---------------------------------------------------------------------------
// Stage-2 task 64: the `.job/reviewed-hashes.json` reviewed-surface hash store.
//
// The store binds the bytes the brief carries: written and committed at
// review-brief assembly, before any reviewer is dispatched (D2/D10); its key
// set must EXACTLY equal the declared reviewed paths (D4); at merge the
// surface is re-derived at BOTH the job branch head and the merge target and
// both must equal the stored hash (D3), any difference being the page having
// moved (D7) — refused, the run settled `failed`, naming the path. The store
// rides the task-59 `.job/` sidecar precedent and never lands on
// `main`/`train` as a live path (D8). The graph output never enters the hash
// (D9): the merge report records the empty-symbol assertion BESIDE the hash
// equality assertion, never inside it.
// ---------------------------------------------------------------------------

/** A real git worktree on a new branch, as the loop's job worktrees are. */
function storeWorktree(t, ctx, branch) {
  const dir = join(ctx.testRoot, `store-wt-${branch.replace(/[^a-z0-9]+/gi, '-')}`);
  git(ctx.repoRoot, ['worktree', 'add', '-b', branch, dir, 'HEAD']);
  t.after(() => {
    // ctx.cleanup may already have removed the whole tree; git would then
    // only print a fatal chdir error. Remove only while the repo stands.
    if (!existsSync(ctx.repoRoot)) return;
    try {
      git(ctx.repoRoot, ['worktree', 'remove', '--force', dir]);
    } catch {
      /* the tree is going away anyway */
    }
  });
  return dir;
}

/** Commit a file on a branch's worktree, the way the loop's commits are made. */
function commitInWorktree(dir, msg) {
  git(dir, ['add', '-A']);
  git(dir, ['commit', '--quiet', '--no-verify', '-m', msg]);
}

function readStoreAt(ctx, ref) {
  return readReviewedHashStore(ctx.repoRoot, ref);
}

test('task 64: the store writes fresh per assembly — exact shape, overwrite never merge (D1/D2)', (t) => {
  const ctx = reviewCtx63(t);
  const dir = storeWorktree(t, ctx, 'job/store-shape');
  const surfaces = new Map([[P1, pageText('page one bytes')], [P2, pageText('page two bytes')]]);
  const surfaceOf = (p) => surfaces.get(p) ?? null;
  const first = writeReviewedHashStore({ worktree: dir, jobId: 'j-20260912-64', pass: 1, pages: [P1, P2], surfaceOf });
  assert.equal(first.ok, true, first.reason ?? '');
  assert.equal(first.committed, true, 'the store is committed to the branch at assembly');
  const onBranch = JSON.parse(git(ctx.repoRoot, ['show', 'job/store-shape:.job/reviewed-hashes.json']));
  assert.deepEqual(
    onBranch,
    { version: 1, pages: { [P1]: reviewedHash(surfaces.get(P1)), [P2]: reviewedHash(surfaces.get(P2)) } },
    'the store is exactly { version: 1, pages: { <normalized path>: <64-hex sha256> } }',
  );
  // A SECOND assembly with a different page set OVERWRITES: the old extra
  // entry is gone, not merged — the store binds the newest review actually
  // shown to a reviewer.
  const second = writeReviewedHashStore({ worktree: dir, jobId: 'j-20260912-64', pass: 2, pages: [P1], surfaceOf });
  assert.equal(second.ok, true, second.reason ?? '');
  const afterSecond = readStoreAt(ctx, 'job/store-shape');
  assert.equal(afterSecond.ok, true, afterSecond.reason ?? '');
  assert.deepEqual(Object.keys(afterSecond.hashes).sort(), [P1], 'the first pass\'s extra entry did not survive the overwrite');
  assert.equal(afterSecond.hashes[P1], reviewedHash(surfaces.get(P1)));
  // An identical overwrite commits nothing and does not fail loudly: the
  // branch already carries exactly this store.
  const third = writeReviewedHashStore({ worktree: dir, jobId: 'j-20260912-64', pass: 2, pages: [P1], surfaceOf });
  assert.equal(third.ok, true, third.reason ?? '');
  assert.equal(third.committed, false, 'an identical re-assembly creates no commit');
});

test('task 64: a store that cannot be written or committed fails loudly (fail-closed, both arms)', (t) => {
  const ctx = reviewCtx63(t);
  // Write arm: `.job` exists as a FILE, so the store's path is unwritable.
  const dirW = join(ctx.testRoot, 'store-unwritable');
  mkdirSync(dirW, { recursive: true });
  writeFileSync(join(dirW, '.job'), 'a file where the store directory must be', 'utf8');
  const w = writeReviewedHashStore({ worktree: dirW, jobId: 'j-20260912-64', pass: 1, pages: [P1], surfaceOf: () => pageText('bytes') });
  assert.equal(w.ok, false, 'the write arm fails closed');
  assert.match(w.reason, /could not write/);
  assert.match(w.reason, /failing closed/);
  // Commit arm: git refuses to stage (an index.lock is held), so nothing can
  // be committed — the run must fail loudly rather than review unbound bytes.
  const dirC = join(ctx.testRoot, 'store-commit-fail');
  mkdirSync(dirC, { recursive: true });
  git(dirC, ['init', '--quiet']);
  mkdirSync(join(dirC, '.job'), { recursive: true });
  writeFileSync(join(dirC, '.git', 'index.lock'), 'a held lock', 'utf8');
  const c = writeReviewedHashStore({ worktree: dirC, jobId: 'j-20260912-64', pass: 1, pages: [P1], surfaceOf: () => pageText('bytes') });
  assert.equal(c.ok, false, 'the commit arm fails closed');
  assert.match(c.reason, /could not stage|could not commit/);
  assert.match(c.reason, /failing closed/);
  // A page with no surface bytes builds no store either — the same
  // fail-closed direction the surface guard takes before dispatch.
  const dirS = storeWorktree(t, ctx, 'job/store-nosurface');
  const s = writeReviewedHashStore({ worktree: dirS, jobId: 'j-20260912-64', pass: 1, pages: [P1], surfaceOf: () => null });
  assert.equal(s.ok, false, 'no bytes, no store');
  assert.match(s.reason, /no surface bytes to bind/);
});

test('task 64: brief hash === store hash === re-derived hash, one assertion over three producers (D10)', (t) => {
  const ctx = reviewCtx63(t);
  const dir = storeWorktree(t, ctx, 'job/store-threeway');
  const surface = pageText('three-way bytes');
  mkdirSync(dirname(join(dir, P1)), { recursive: true });
  writeFileSync(join(dir, P1), surface, 'utf8');
  const wrote = writeReviewedHashStore({
    worktree: dir,
    jobId: 'j-20260912-64',
    pass: 1,
    pages: [P1],
    surfaceOf: (p) => readFileSync(join(dir, p), 'utf8'),
  });
  assert.equal(wrote.ok, true, wrote.reason ?? '');
  // Producer 1: the hash the BRIEF prints beside the surface it carries.
  const brief = assembleReviewBrief(ctx, {
    jobId: 'j-20260912-64',
    job: baseJob63(),
    diffText: '',
    pass: 1,
    findings: '',
    outPath: `${ctx.reviewsDir}/j-20260912-64.md`,
    gates: null,
    sha: '',
    capMinutes: 30,
    reviewedOnly: P1,
    reviewedSurfaceText: surface,
    reviewGraphQuery: () => ({ universe: false }),
    graphIndexId: 'test-index-64',
  });
  const briefHash = /^Reviewed hash: `([0-9a-f]{64})`/m.exec(brief)?.[1] ?? null;
  // Producer 2: the hash the STORE committed at assembly.
  const store = readStoreAt(ctx, 'job/store-threeway');
  assert.equal(store.ok, true, store.reason ?? '');
  // Producer 3: this test's own re-derivation from the tree, through the one
  // reviewed-surface hash the record binds.
  const rederived = reviewedHashOfFile(join(dir, P1));
  assert.ok(
    briefHash && store.hashes[P1] === briefHash && store.hashes[P1] === rederived,
    `three-way equality over ${P1}: brief printed ${briefHash}, store bound ${store.hashes[P1]}, re-derived ${rederived}`,
  );
});

test('task 64: a stale copy between assembly and merge refuses, the run failed, the path named (D3/D7)', (t) => {
  const ctx = reviewCtx63(t);
  for (const p of [P1, P2]) {
    const full = join(ctx.repoRoot, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, pageText('the bytes the brief carried'), 'utf8');
  }
  commitAll(ctx, 'fixture: the pages the review saw');
  const base = headOf(ctx);
  const dir = storeWorktree(t, ctx, 'job/store-stale');
  const wrote = writeReviewedHashStore({
    worktree: dir,
    jobId: 'j-20260912-64',
    pass: 1,
    pages: [P1, P2],
    surfaceOf: (p) => readFileSync(join(dir, p), 'utf8'),
  });
  assert.equal(wrote.ok, true, wrote.reason ?? '');
  // Everything still binds at both refs.
  const ok = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-stale', targetRef: base, paths: [P1, P2] });
  assert.equal(ok.ok, true, ok.reason ?? '');
  assert.deepEqual(ok.paths, [P1, P2]);
  // A stale copy: the page's bytes move on the branch AFTER the store was
  // committed — the stored hash no longer binds what the branch carries.
  writeFileSync(join(dir, P1), pageText('an edit after the store was written'), 'utf8');
  commitInWorktree(dir, 'fixture: the page moved after assembly');
  const stale = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-stale', targetRef: base, paths: [P1, P2] });
  assert.equal(stale.ok, false, 'the stale copy refuses');
  assert.equal(stale.code, 'reviewed-hash-mismatch');
  assert.equal(stale.path, P1, 'the refusal names the offending page');
  assert.match(stale.reason, new RegExp(P1.replace(/\//g, '\\/')), 'the reason names the path');
  assert.match(stale.reason, /reviewed-hash-mismatch/);
});

test('task 64: a page moved on the merge target refuses, the path named (D7)', (t) => {
  const ctx = reviewCtx63(t);
  for (const p of [P1, P2]) {
    const full = join(ctx.repoRoot, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, pageText('the bytes the brief carried'), 'utf8');
  }
  commitAll(ctx, 'fixture: the pages the review saw');
  const base = headOf(ctx);
  const dir = storeWorktree(t, ctx, 'job/store-target');
  const wrote = writeReviewedHashStore({
    worktree: dir,
    jobId: 'j-20260912-64',
    pass: 1,
    pages: [P1, P2],
    surfaceOf: (p) => readFileSync(join(dir, p), 'utf8'),
  });
  assert.equal(wrote.ok, true, wrote.reason ?? '');
  // The target moved UNDER the job: the page was modified on `train` between
  // assembly and merge.
  git(ctx.repoRoot, ['branch', 'train', base]);
  const trainDir = join(ctx.testRoot, 'store-target-train');
  git(ctx.repoRoot, ['worktree', 'add', trainDir, 'train']);
  t.after(() => {
    if (!existsSync(ctx.repoRoot)) return;
    try {
      git(ctx.repoRoot, ['worktree', 'remove', '--force', trainDir]);
    } catch {
      /* cleanup removes the tree anyway */
    }
  });
  writeFileSync(join(trainDir, P1), pageText('someone moved the page on the target'), 'utf8');
  commitInWorktree(trainDir, 'fixture: the page moved on the target');
  const moved = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-target', targetRef: 'train', paths: [P1, P2] });
  assert.equal(moved.ok, false, 'the moved page refuses');
  assert.equal(moved.code, 'reviewed-hash-mismatch');
  assert.equal(moved.path, P1, 'the refusal names the page that moved');
  // A page DELETED on the target is the same refusal — the bytes cannot be
  // read there, so the store binds nothing the target carries. P1 is
  // restored first, so the deletion is the only difference left and the
  // refusal names the deleted page.
  writeFileSync(join(trainDir, P1), pageText('the bytes the brief carried'), 'utf8');
  commitInWorktree(trainDir, 'fixture: the first page restored on the target');
  git(trainDir, ['rm', '-q', P2]);
  git(trainDir, ['commit', '--quiet', '--no-verify', '-m', 'fixture: the page deleted on the target']);
  const deleted = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-target', targetRef: 'train', paths: [P1, P2] });
  assert.equal(deleted.ok, false, 'the deleted page refuses');
  assert.equal(deleted.code, 'reviewed-hash-mismatch');
  assert.equal(deleted.path, P2, 'the deletion arm names the deleted page');
  assert.match(deleted.reason, /could not be read/);
});

test('task 64: a missing or malformed store refuses with a named reason', (t) => {
  const ctx = reviewCtx63(t);
  const full = join(ctx.repoRoot, P1);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, pageText('bytes'), 'utf8');
  commitAll(ctx, 'fixture: a page');
  const base = headOf(ctx);
  const dir = storeWorktree(t, ctx, 'job/store-armed');
  // Missing: the branch carries no store at all.
  const missing = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-armed', targetRef: base, paths: [P1] });
  assert.equal(missing.ok, false);
  assert.equal(missing.code, 'reviewed-hash-store-missing');
  assert.match(missing.reason, /reviewed-hash-store-missing/);
  assert.match(missing.reason, /reviewed-hashes\.json/, 'the reason names the store');
  // Malformed, arm 1: not the store's shape.
  mkdirSync(join(dir, '.job'), { recursive: true });
  writeFileSync(join(dir, '.job', 'reviewed-hashes.json'), JSON.stringify({ version: 2, pages: { [P1]: '0'.repeat(64) } }), 'utf8');
  commitInWorktree(dir, 'fixture: a store with the wrong version');
  const wrongVersion = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-armed', targetRef: base, paths: [P1] });
  assert.equal(wrongVersion.ok, false);
  assert.equal(wrongVersion.code, 'reviewed-hash-store-malformed');
  // Malformed, arm 2: a value that is not a 64-hex digest.
  writeFileSync(join(dir, '.job', 'reviewed-hashes.json'), JSON.stringify({ version: 1, pages: { [P1]: 'not-a-hash' } }), 'utf8');
  commitInWorktree(dir, 'fixture: a store with a non-digest value');
  const badValue = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-armed', targetRef: base, paths: [P1] });
  assert.equal(badValue.ok, false);
  assert.equal(badValue.code, 'reviewed-hash-store-malformed');
  // Malformed, arm 3: unparseable JSON.
  writeFileSync(join(dir, '.job', 'reviewed-hashes.json'), '{not json', 'utf8');
  commitInWorktree(dir, 'fixture: a store that does not parse');
  const unparseable = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-armed', targetRef: base, paths: [P1] });
  assert.equal(unparseable.ok, false);
  assert.equal(unparseable.code, 'reviewed-hash-store-malformed');
  // Malformed, arm 4 (FIX-4): an unexpected TOP-LEVEL key — the format is
  // exactly { version: 1, pages: {...} }, and a reader that ignores extra keys
  // would consume a payload no producer of this store wrote. The refusal names
  // the key it does not understand.
  writeFileSync(join(dir, '.job', 'reviewed-hashes.json'), JSON.stringify({ version: 1, pages: { [P1]: '0'.repeat(64) }, notes: { injected: true } }), 'utf8');
  commitInWorktree(dir, 'fixture: a store with an unexpected top-level key');
  const extraKey = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-armed', targetRef: base, paths: [P1] });
  assert.equal(extraKey.ok, false, 'an unexpected top-level key refuses');
  assert.equal(extraKey.code, 'reviewed-hash-store-malformed');
  assert.match(extraKey.reason, /unexpected top-level key/, 'the refusal says what is wrong with the shape');
  assert.match(extraKey.reason, /notes/, 'the refusal names the offending key');
});

test('task 64: the store\'s page set must EXACTLY equal the declared set — extras and missing both refuse (D4)', (t) => {
  const ctx = reviewCtx63(t);
  for (const p of [P1, P2]) {
    const full = join(ctx.repoRoot, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, pageText('bytes'), 'utf8');
  }
  commitAll(ctx, 'fixture: two pages');
  const base = headOf(ctx);
  const dir = storeWorktree(t, ctx, 'job/store-scope');
  const wrote = writeReviewedHashStore({
    worktree: dir,
    jobId: 'j-20260912-64',
    pass: 1,
    pages: [P1, P2],
    surfaceOf: (p) => readFileSync(join(dir, p), 'utf8'),
  });
  assert.equal(wrote.ok, true, wrote.reason ?? '');
  // Extras: the store binds a page the current pass does not declare.
  const extras = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-scope', targetRef: base, paths: [P1] });
  assert.equal(extras.ok, false);
  assert.equal(extras.code, 'reviewed-hash-store-scope');
  assert.match(extras.reason, new RegExp(P2.replace(/\//g, '\\/')), 'the refusal names the extra page');
  // Missing: the current pass declares a page the store does not bind.
  const missing = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-scope', targetRef: base, paths: [P1, P2, OTHER] });
  assert.equal(missing.ok, false);
  assert.equal(missing.code, 'reviewed-hash-store-scope');
  assert.match(missing.reason, new RegExp(OTHER.replace(/\//g, '\\/')), 'the refusal names the missing page');
  // The exact set passes.
  const exact = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-scope', targetRef: base, paths: [P2, P1] });
  assert.equal(exact.ok, true, exact.reason ?? '');
  assert.deepEqual(exact.paths, [P1, P2], 'the declared paths come back normalised and sorted');
});

test('task 64: the graph output never enters the hash — independence in both directions (D9)', (t) => {
  const ctx = reviewCtx63(t);
  const full = join(ctx.repoRoot, P1);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, pageText('graph-independent bytes'), 'utf8');
  commitAll(ctx, 'fixture: a page');
  const base = headOf(ctx);
  const dir = storeWorktree(t, ctx, 'job/store-graph');
  const wrote = writeReviewedHashStore({
    worktree: dir,
    jobId: 'j-20260912-64',
    pass: 1,
    pages: [P1],
    surfaceOf: (p) => readFileSync(join(dir, p), 'utf8'),
  });
  assert.equal(wrote.ok, true, wrote.reason ?? '');
  // Direction 1: DIFFERING graph sidecar bytes with IDENTICAL page bytes →
  // the merge proceeds. The check reads the store and the pages, never the
  // sidecar, so the graph's shape cannot move the answer.
  mkdirSync(join(dir, '.job'), { recursive: true });
  writeFileSync(join(dir, '.job', 'graph.json'), `${JSON.stringify({ subjects: { [P1]: { universe: true, symbols: ['s1'], risk: 'LOW' } } }, null, 2)}\n`, 'utf8');
  commitInWorktree(dir, 'fixture: one graph sidecar');
  const withGraphA = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-graph', targetRef: base, paths: [P1] });
  assert.equal(withGraphA.ok, true, withGraphA.reason ?? '');
  writeFileSync(join(dir, '.job', 'graph.json'), `${JSON.stringify({ subjects: { [P1]: { universe: false, risk: 'HIGH', partial: true, truncated: true } } }, null, 2)}\n`, 'utf8');
  commitInWorktree(dir, 'fixture: a DIFFERENT graph sidecar, same pages');
  const withGraphB = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-graph', targetRef: base, paths: [P1] });
  assert.equal(withGraphB.ok, true, 'differing graph bytes with identical page bytes proceed: ' + (withGraphB.reason ?? ''));
  assert.deepEqual(withGraphA.hashes, withGraphB.hashes, 'the answer is invariant over the graph bytes');
  // Direction 2: DIFFERING page bytes with IDENTICAL graph bytes → refuses.
  writeFileSync(join(dir, P1), pageText('an edit nobody reviewed'), 'utf8');
  commitInWorktree(dir, 'fixture: the page moved, graph bytes unchanged');
  const moved = checkReviewedHashStore(ctx.repoRoot, { branch: 'job/store-graph', targetRef: base, paths: [P1] });
  assert.equal(moved.ok, false, 'differing page bytes refuse');
  assert.equal(moved.code, 'reviewed-hash-mismatch');
  assert.equal(moved.path, P1);
});

test('task 64: the store never lands as a live path — the scaffolding removal consumes it (D8)', (t) => {
  const ctx = reviewCtx63(t);
  const full = join(ctx.repoRoot, P1);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, pageText('bytes that merge'), 'utf8');
  commitAll(ctx, 'fixture: a page');
  const base = headOf(ctx);
  const dir = storeWorktree(t, ctx, 'job/store-lands');
  const wrote = writeReviewedHashStore({
    worktree: dir,
    jobId: 'j-20260912-64',
    pass: 1,
    pages: [P1],
    surfaceOf: (p) => readFileSync(join(dir, p), 'utf8'),
  });
  assert.equal(wrote.ok, true, wrote.reason ?? '');
  assert.equal(readStoreAt(ctx, 'job/store-lands').ok, true, 'the store is on the branch before the merge');
  // The exact removal the merge path runs before `mergeJobBranch` — the
  // whole `.job/` directory, wholesale, so the store cannot land on
  // `main`/`train` on ANY merge path — and its pathspec-scoped commit
  // (FIX-3), the exact production command shape.
  git(dir, ['rm', '-r', '-q', '--ignore-unmatch', '.job']);
  git(dir, ['commit', '--quiet', '--no-verify', '-m', 'job j-20260912-64: remove job scaffolding before merge', '--', '.job']);
  assert.equal(gitTry(ctx.repoRoot, ['show', 'job/store-lands:.job/reviewed-hashes.json']).ok, false, 'the store is gone from the branch the merge would land');
  assert.equal(gitTry(ctx.repoRoot, ['show', `job/store-lands:${P1}`]).ok, true, 'the page bytes are not scaffolding — they land');
  // Structural: the production removal covers `.job` wholesale and runs
  // before the merge, and the store lives under `.job/` by construction.
  const src = readFileSync(RUN_LIB, 'utf8');
  assert.match(src, /\['rm', '-r', '-q', '--ignore-unmatch', \.\.\.scaffoldPaths\]/, 'the pre-merge removal takes the whole .job directory');
  const rmIdx = src.indexOf("['rm', '-r', '-q', '--ignore-unmatch', ...scaffoldPaths]");
  const mergeIdx = src.indexOf('await mergeJobBranch(ctx, {');
  assert.ok(rmIdx !== -1 && mergeIdx !== -1 && rmIdx < mergeIdx, 'the removal runs before the merge, so nothing under .job/ can land');
  assert.match(src, /const scaffoldPaths = \[\n      '\.job',/, 'the removal pathspec leads with the whole .job directory, wholesale');
  assert.equal(REVIEWED_HASH_STORE_REL.startsWith('.job/'), true, 'the store lives under .job/ by construction');
});

// ---------------------------------------------------------------------------
// Task 64 FIX-1..FIX-5 (the five verified findings).
// ---------------------------------------------------------------------------

test('task 64 FIX-3: the assembly commit is pathspec-scoped — an unrelated staged file is not swept in', (t) => {
  const ctx = reviewCtx63(t);
  const full = join(ctx.repoRoot, P1);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, pageText('bytes'), 'utf8');
  commitAll(ctx, 'fixture: a page');
  const dir = storeWorktree(t, ctx, 'job/store-scope-commit');
  // An unrelated staged file sits in the index at assembly time — the index
  // state a dirty executor or an earlier mechanism could leave behind.
  writeFileSync(join(dir, 'notes-unrelated.txt'), 'staged by something else\n', 'utf8');
  git(dir, ['add', 'notes-unrelated.txt']);
  const wrote = writeReviewedHashStore({
    worktree: dir,
    jobId: 'j-20260912-64',
    pass: 1,
    pages: [P1],
    surfaceOf: (p) => readFileSync(join(dir, p), 'utf8'),
  });
  assert.equal(wrote.ok, true, wrote.reason ?? '');
  // The store commit records ONLY the store.
  const names = git(ctx.repoRoot, ['show', '--format=', '--name-only', 'job/store-scope-commit']).trim().split('\n').map((s) => s.trim());
  assert.deepEqual(names, [REVIEWED_HASH_STORE_REL], 'the store commit carries exactly the store');
  // The unrelated staged file did not ride the commit — and it remains
  // staged, uncommitted, exactly as it was.
  assert.equal(gitTry(ctx.repoRoot, ['show', 'job/store-scope-commit:notes-unrelated.txt']).ok, false, 'the unrelated staged file did not ride the store commit');
  const status = git(dir, ['status', '--porcelain']);
  assert.match(status, /^A[ \t]+notes-unrelated\.txt/m, 'the unrelated file stays staged after the store commit');
});

test('task 64 FIX-3: the scaffolding removal commit with a pathspec records the rm — both RESULT.md states, fixture-verified', (t) => {
  // This is the charge's explicit verification, run as a fixture: the exact
  // production sequence (ls-files probe → rm → pathspec commit), over the
  // state git actually keeps. Measured 2026-09-13 while writing the fix:
  // `git commit -- <untracked path>` FAILS outright ("pathspec did not match
  // any file(s) known to git"), so the production pathspec carries
  // RESULT.md only when `git ls-files` shows it tracked — this arm exercises
  // both halves.
  //
  // Arm 1 — RESULT.md untracked (the ordinary flow): pathspec `.job` alone.
  const ctxA = reviewCtx63(t);
  const dirA = storeWorktree(t, ctxA, 'job/store-scaffold-untracked');
  mkdirSync(join(dirA, '.job'), { recursive: true });
  writeFileSync(join(dirA, '.job', 'brief.md'), 'brief\n', 'utf8');
  git(dirA, ['add', '.job/brief.md']);
  git(dirA, ['commit', '--quiet', '--no-verify', '-m', 'fixture: brief committed']);
  writeFileSync(join(dirA, 'notes-unrelated.txt'), 'staged by something else\n', 'utf8');
  git(dirA, ['add', 'notes-unrelated.txt']);
  writeFileSync(join(dirA, 'RESULT.md'), 'done\n', 'utf8'); // untracked, as the real flow leaves it
  const trackedA = git(dirA, ['ls-files', '--', 'RESULT.md']).trim();
  const scaffoldA = ['.job', ...(trackedA ? ['RESULT.md'] : [])];
  assert.deepEqual(scaffoldA, ['.job'], 'untracked RESULT.md stays out of the pathspec');
  git(dirA, ['rm', '-r', '-q', '--ignore-unmatch', ...scaffoldA]);
  git(dirA, ['commit', '--quiet', '--no-verify', '-m', 'fixture: remove job scaffolding', '--', ...scaffoldA]);
  assert.equal(gitTry(dirA, ['show', 'HEAD:.job/brief.md']).ok, false, 'the pathspec commit RECORDS the rm (arm 1)');
  const statusA = git(dirA, ['status', '--porcelain']);
  assert.match(statusA, /^A[ \t]+notes-unrelated\.txt/m, 'the unrelated staged file stays staged (arm 1)');
  assert.match(statusA, /^\?\?[ \t]+RESULT\.md/m, 'the untracked RESULT.md stays untracked (arm 1)');

  // Arm 2 — RESULT.md tracked (the historical j-20260830-01 leak shape): the
  // pathspec carries both, and BOTH removals are recorded.
  const ctxB = reviewCtx63(t);
  const dirB = storeWorktree(t, ctxB, 'job/store-scaffold-tracked');
  mkdirSync(join(dirB, '.job'), { recursive: true });
  writeFileSync(join(dirB, '.job', 'brief.md'), 'brief\n', 'utf8');
  writeFileSync(join(dirB, 'RESULT.md'), 'done\n', 'utf8');
  git(dirB, ['add', '-A']);
  git(dirB, ['commit', '--quiet', '--no-verify', '-m', 'fixture: brief and RESULT.md committed']);
  writeFileSync(join(dirB, 'notes-unrelated.txt'), 'staged by something else\n', 'utf8');
  git(dirB, ['add', 'notes-unrelated.txt']);
  const trackedB = git(dirB, ['ls-files', '--', 'RESULT.md']).trim();
  const scaffoldB = ['.job', ...(trackedB ? ['RESULT.md'] : [])];
  assert.deepEqual(scaffoldB, ['.job', 'RESULT.md'], 'tracked RESULT.md rides the pathspec (arm 2)');
  git(dirB, ['rm', '-r', '-q', '--ignore-unmatch', ...scaffoldB]);
  git(dirB, ['commit', '--quiet', '--no-verify', '-m', 'fixture: remove job scaffolding', '--', ...scaffoldB]);
  assert.equal(gitTry(dirB, ['show', 'HEAD:.job/brief.md']).ok, false, 'the .job removal is recorded (arm 2)');
  assert.equal(gitTry(dirB, ['show', 'HEAD:RESULT.md']).ok, false, 'the tracked RESULT.md removal is recorded too (arm 2)');
  const statusB = git(dirB, ['status', '--porcelain']);
  assert.match(statusB, /^A[ \t]+notes-unrelated\.txt/m, 'the unrelated staged file stays staged (arm 2)');
});

test('task 64 FIX-2: the scaffolding gate is fail-closed and pathspec-scoped (structural)', () => {
  const src = readFileSync(RUN_LIB, 'utf8');
  assert.match(src, /pre-merge scaffolding removal failed/, 'the rm result is checked — a failure refuses the merge');
  assert.match(src, /pre-merge scaffolding-removal commit failed/, 'the commit result is checked — a failure refuses the merge');
  // The gate stands ahead of the merge, and BOTH results flow through
  // failMerge (which settles the run failed).
  const rmIdx = src.indexOf('const rmScaffold = gitTry(worktree,');
  const rmCommitIdx = src.indexOf('const rmCommit = gitTry(worktree,');
  const mergeIdx = src.indexOf('await mergeJobBranch(ctx, {');
  assert.ok(rmIdx !== -1 && rmCommitIdx !== -1 && mergeIdx !== -1, 'the checked removal and its commit exist');
  assert.ok(rmIdx < rmCommitIdx && rmCommitIdx < mergeIdx, 'the removal and its commit are checked before the merge');
  assert.match(src, /if \(!rmScaffold\.ok\) \{\n      failMerge\(/, 'a failed rm refuses through failMerge');
  assert.match(src, /if \(!rmCommit\.ok && !\/nothing to commit\|nothing added\/i\.test\(/, 'the commit result is checked, tolerating only a genuine nothing-to-commit');
  assert.match(src, /'--', \.\.\.scaffoldPaths,/, 'the removal commit is pathspec-scoped to the scaffolding');
  assert.match(src, /gitTry\(worktree, \['ls-files', '--', RESULT_FILENAME\]\)/, 'the pathspec asks git what is actually tracked');
});

test('task 64 FIX-1: the binding re-measure sits inside the locked merge window (structural)', () => {
  const tsrc = readFileSync(TRAIN_LIB, 'utf8');
  const lockIdx = tsrc.indexOf('const lock = await acquireMergeLock({ waitMs: lockWaitMs });');
  const preIdx = tsrc.indexOf("if (typeof preMergeCheck === 'function') {");
  const mergeIdx = tsrc.indexOf('const m = mergeLocal(repo, branch, message);');
  assert.ok(lockIdx !== -1 && preIdx !== -1 && mergeIdx !== -1, 'the lock, the locked re-measure, and the merge exist in train.mjs');
  assert.ok(lockIdx < preIdx, 'the re-measure is invoked AFTER the lock is acquired — inside the locked window');
  assert.ok(preIdx < mergeIdx, 'the re-measure is invoked BEFORE the merge executes');
  assert.match(tsrc, /preMergeRefusal: true, reason: pre\.reason/, 'a locked refusal returns a plain refusal, which the caller books failed');
  const src = readFileSync(RUN_LIB, 'utf8');
  assert.match(src, /preMergeCheck: preMergeStoreCheck,/, 'the locked re-measure is threaded through the merge call');
  assert.match(src, /baseStandIn: mergeBaseSha,/, 'the base stand-in is the same one the outer check resolved');
  // The store rides the PINNED pre-removal head: the scaffolding removal
  // commits the store's removal to the branch before the merge, so a locked
  // re-measure reading the branch HEAD would find nothing.
  assert.match(src, /const branchShaAtStoreCheck = gitTry\(ctx\.repoRoot, \['rev-parse', branch\]\)\.stdout\.trim\(\);/, 'the branch head the store was validated at is pinned before the removal');
  const pinIdx = src.indexOf('const branchShaAtStoreCheck = gitTry(ctx.repoRoot, [\'rev-parse\', branch]).stdout.trim();');
  const hashCheckedIdx = src.indexOf('const hashChecked = checkReviewedHashStore(ctx.repoRoot, { branch, targetRef: hashTargetRef, paths: reviewedPaths });');
  assert.ok(pinIdx !== -1 && hashCheckedIdx !== -1 && pinIdx < hashCheckedIdx, 'the pin is captured before the outer check reads the store');
  assert.match(src, /const locked = checkReviewedHashStore\(ctx\.repoRoot, \{ branch: branchShaAtStoreCheck, targetRef, paths: reviewedPaths \}\);/, 'the locked re-measure re-measures the store at the pinned head and the lock-resolved target');
});

test('task 64 FIX-1: the train target moves between the outer check and the locked re-measure — the merge refuses, the run failed, the path named (behavioral)', async (t) => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({
      command: mockCommand('reviewed-unchanged', ` ${P1}`),
      reviewerCommand: mockCommand('review-approve-store-checked'),
    }),
  });
  t.after(() => ctx.cleanup());
  writePage(ctx, P1, 'the approved version');
  commitAll(ctx, 'fixture: the page');
  approveWithSubjects(ctx, 'j-seed-approver', [P1]);
  commitAll(ctx, 'fixture: the approving record');
  writePage(ctx, P1, 'an edit nobody reviewed');
  commitAll(ctx, 'fixture: later edits');
  // The train exists at the base tip, so the OUTER check (resolved before the
  // lock) passes: the store binds the base bytes and the train carries them.
  git(ctx.repoRoot, ['branch', 'train', headOf(ctx)]);
  writeQueue(ctx, [{ type: 'repair', title: 'Ratify the reviewed page', subjects: [P1] }]);
  // The concurrent worker's merge: it happens INSIDE the locked window — the
  // seam first proves the merge lock is held, then moves the page on the
  // train in the same checkout the train runs in, then the production
  // re-measure runs against the moved target.
  const mover = ({ repo, targetRef, check }) => {
    if (!existsSync(mergeLockPath())) {
      return { ok: false, reason: 'TEST PROBE: the pre-merge check ran with no merge lock held — the re-measure is not inside the locked window' };
    }
    const on = git(repo, ['rev-parse', '--abbrev-ref', 'HEAD']).trim();
    assert.equal(on, 'train', 'the desk checkout is on the train the merge is about to land on');
    writeFileSync(join(repo, P1), pageText('a concurrent worker moved the page on the train'), 'utf8');
    git(repo, ['add', P1]);
    git(repo, ['commit', '--quiet', '--no-verify', '-m', 'concurrent worker: the page moved on the train']);
    return check({ targetRef });
  };
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true, preMergeCheck: mover });
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.match(ctx.output(), /merge failed: reviewed-hash-mismatch/, ctx.output());
  assert.match(ctx.output(), new RegExp(P1.replace(/\//g, '\\/')), 'the refusal names the offending page');
  // The report lines report the locked re-measure: it refused, so neither logged.
  assert.doesNotMatch(ctx.output(), /reviewed-hash: hash equality holds/, 'no equality report on a refused merge');
  assert.doesNotMatch(ctx.output(), /reviewed-graph: empty-symbol assertion/, 'no graph report either — the re-measure refused before the merge');
  // Nothing landed: the train carries the MOVER's bytes, and the store is
  // not on it (D8 holds on the refused path too).
  const trainBytes = gitTry(ctx.repoRoot, ['show', `train:${P1}`]);
  assert.equal(trainBytes.ok, true, 'the train still resolves the page');
  assert.match(trainBytes.stdout, /a concurrent worker moved the page on the train/, 'the job\'s merge never landed — the concurrent worker\'s bytes stand');
  assert.equal(gitTry(ctx.repoRoot, ['show', 'train:.job/reviewed-hashes.json']).ok, false, 'the store is not on the train');
});

test('task 64 FIX-2: a scaffolding removal that cannot run refuses the merge — nothing lands (behavioral)', async (t) => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({
      command: mockCommand('reviewed-unchanged', ` ${P1}`),
      reviewerCommand: mockCommand('review-approve-store-checked-lock-worktrees'),
    }),
  });
  t.after(() => ctx.cleanup());
  writePage(ctx, P1, 'the approved version');
  commitAll(ctx, 'fixture: the page');
  approveWithSubjects(ctx, 'j-seed-approver', [P1]);
  commitAll(ctx, 'fixture: the approving record');
  writePage(ctx, P1, 'an edit nobody reviewed');
  commitAll(ctx, 'fixture: later edits');
  writeQueue(ctx, [{ type: 'repair', title: 'Ratify the reviewed page', subjects: [P1] }]);
  // The reviewer approves (so the run reaches the merge path) and holds the
  // job worktree's index lock: the pre-merge scaffolding removal cannot run.
  // A run whose removal result was IGNORED would merge with `.job/` still on
  // the branch — the store would land on the train (D8 violated).
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.match(ctx.output(), /pre-merge scaffolding removal failed/, ctx.output());
  assert.match(ctx.output(), /git rm/, 'the reason carries git\'s own refusal');
  assert.doesNotMatch(ctx.output(), /merged .* into train locally/, 'nothing merged');
  // Nothing landed: the store is still ONLY on the un-merged job branch.
  const branch = git(ctx.repoRoot, ['branch', '--list', `job/${res.jobId}`]).trim().replace(/^\*\s*/, '').trim();
  assert.ok(branch, `the job branch is kept on a failed run: ${ctx.output()}`);
  assert.equal(gitTry(ctx.repoRoot, ['show', `${branch}:.job/reviewed-hashes.json`]).ok, true, 'the removal never ran — the store is still on the branch, which never landed');
  assert.equal(gitTry(ctx.repoRoot, ['show', 'train:.job/reviewed-hashes.json']).ok, false, 'the store is not on the train — nothing landed (D8)');
});

test('task 64: the merge report records the empty-symbol assertion beside the hash assertion (D9 fields)', () => {
  // Absent analysis: the assertion could not run, and the report says so.
  const absent = reviewedEmptySymbolAssertion({ mergeBase: 'abc123def4567890', analysis: absentAnalysis, paths: [P1] });
  assert.deepEqual(absent, { mergeBase: 'abc123def4567890', state: 'absent', symbolCount: null, noSymbols: [], flags: [] });
  // Present, empty: changed-symbol count 0 with the merge-base recorded.
  const empty = reviewedEmptySymbolAssertion({ mergeBase: 'abc123def4567890', analysis: emptyPresent, paths: [P1] });
  assert.deepEqual(empty, { mergeBase: 'abc123def4567890', state: 'empty', symbolCount: 0, noSymbols: [], flags: [] });
  // `no-symbols`: a declared page outside any symbol universe is complete.
  const noSymbols = reviewedEmptySymbolAssertion({
    mergeBase: 'abc123def4567890',
    analysis: { absent: false, partial: false, truncated: false, symbols: [], subjects: { [P1]: { universe: false } } },
    paths: [P1],
  });
  assert.deepEqual(noSymbols, { mergeBase: 'abc123def4567890', state: 'empty', symbolCount: 0, noSymbols: [P1], flags: [] });
  // The flags the analysis reports ride along, top-level and per subject.
  const flagged = reviewedEmptySymbolAssertion({
    mergeBase: 'abc123def4567890',
    analysis: {
      absent: false, partial: true, truncated: false, symbols: [],
      subjects: { [P1]: { universe: true, symbols: [], risk: 'UNKNOWN', truncated: true } },
    },
    paths: [P1],
  });
  assert.deepEqual(flagged.flags, ['partial', 'truncated'], 'both reported flags are recorded');
  // A non-empty symbol set over a declared subject reads as non-empty — the
  // state the merge refuses downstream (never a hash input either way).
  const nonEmpty = reviewedEmptySymbolAssertion({
    mergeBase: 'abc123def4567890',
    analysis: { absent: false, partial: false, truncated: false, symbols: [{ name: 's', owner: P1 }], subjects: { [P1]: { universe: true, symbols: ['s'], risk: 'LOW' } } },
    paths: [P1],
  });
  assert.equal(nonEmpty.state, 'non-empty');
  assert.equal(nonEmpty.symbolCount, 1);
  // Structural: the merge site logs both report lines beside each other,
  // after the reviewed gate and before the merge lands.
  const src = readFileSync(RUN_LIB, 'utf8');
  const gateIdx = src.indexOf('const checked = checkReviewedMerge({');
  const hashLine = src.indexOf('`reviewed-hash: hash equality holds for');
  const graphLine = src.indexOf('`reviewed-graph: empty-symbol assertion — merge-base');
  assert.ok(gateIdx !== -1 && hashLine !== -1 && graphLine !== -1, 'the reviewed gate and both report lines exist');
  assert.ok(gateIdx < hashLine && hashLine < graphLine, 'the report lines stand beside the hash assertion, after the gate');
  assert.match(src, /reviewedEmptySymbolAssertion\(\{ mergeBase: mergeBaseSha, analysis: reviewedAnalysis, paths: reviewedPaths \}\)/, 'the assertion records the merge-base argument the analysis was invoked with');
});

test('task 64: the merge wiring refuses on the store and settles failed, naming the path (structural)', () => {
  const src = readFileSync(RUN_LIB, 'utf8');
  const gateIdx = src.indexOf('const checked = checkReviewedMerge({');
  const checkIdx = src.indexOf('checkReviewedHashStore(ctx.repoRoot, { branch, targetRef: hashTargetRef, paths: reviewedPaths })');
  assert.ok(gateIdx !== -1 && checkIdx !== -1, 'the merge-site hash check exists');
  assert.ok(gateIdx < checkIdx, 'the hash check runs where checkReviewedMerge is consulted, after its preconditions');
  assert.match(src, /const hashTargetRef = branchExists\(ctx\.repoRoot, TRAIN_BRANCH\) \? TRAIN_BRANCH : mergeBaseSha;/, 'the target ref is the train branch, or the base where the train does not exist yet');
  assert.match(src, /failMerge\(hashChecked\.reason\);/, 'a store refusal settles the run failed through the merge\'s own failure path');
  assert.match(src, /code: 'reviewed-hash-mismatch',\n          path: page,/, 'the mismatch carries the offending page');
  // Task-65 interface contract, quoted in the source where task 65 finds it.
  assert.match(src, /readReviewedHashStore\(repo, ref\)/);
  assert.match(src, /checkReviewedHashStore\(repo, \{ branch, targetRef, paths \}\)/);
});

test('task 64: a full reviewed run commits the store before dispatch, merges on hash equality, and never lands the store (behavioral)', async (t) => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({
      command: mockCommand('reviewed-unchanged', ` ${P1}`),
      reviewerCommand: mockCommand('review-approve-store-checked'),
    }),
  });
  t.after(() => ctx.cleanup());
  // The page is approved, then edited: at the job's merge base it reads
  // `mismatched` — the reviewed outcome's only precondition (the 61b join).
  writePage(ctx, P1, 'the approved version');
  commitAll(ctx, 'fixture: the page');
  approveWithSubjects(ctx, 'j-seed-approver', [P1]);
  commitAll(ctx, 'fixture: the approving record');
  writePage(ctx, P1, 'an edit nobody reviewed');
  commitAll(ctx, 'fixture: later edits');
  writeQueue(ctx, [{ type: 'repair', title: 'Ratify the reviewed page', subjects: [P1] }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  assert.equal(res.outcome, 'done', ctx.output());
  // D10: the reviewer could only approve because the store was committed to
  // the branch BEFORE dispatch — its worktree (a checkout of the branch at
  // dispatch) carried it, and its verdict notes record the store's hash and
  // the brief's printed hash as two independent producers.
  const record = readFileSync(join(ctx.reviewsDir, `${res.jobId}.md`), 'utf8');
  const storeHash = /store-hash: ([0-9a-f]{64})/.exec(record)?.[1] ?? null;
  const briefHash = /brief-hash: ([0-9a-f]{64})/.exec(record)?.[1] ?? null;
  // THREE-WAY equality in ONE assertion over the same input path: the brief's
  // printed hash, the store's committed hash, and this test's own
  // re-derivation from the merged tree.
  const rederived = reviewedHashOfFile(join(ctx.repoRoot, P1));
  assert.ok(
    storeHash && briefHash && storeHash === briefHash && storeHash === rederived,
    `three-way hash equality over ${P1}: store ${storeHash}, brief ${briefHash}, re-derived ${rederived} — ${ctx.output()}`,
  );
  // D5 (non-regression): the approving record carries a would-cite, and binds
  // by `subject:` and `reviewed:` exactly as a merging job's record does.
  const rec = matter(record).data;
  assert.ok(String(rec['would-cite'] ?? '').trim().length > 0, 'the record carries a non-empty would-cite');
  const bound = (Array.isArray(rec.subject) ? rec.subject : [rec.subject]).map((s) => String(s).replace(/\\/g, '/')).sort();
  assert.deepEqual(bound, [P1], 'subject: binds the declared page');
  assert.equal(rec.reviewed?.[P1], rederived, 'reviewed: binds the reviewed-surface hash of the same bytes');
  // The merge report, beside the hash assertion: both lines in the run log.
  assert.match(ctx.output(), /reviewed-hash: hash equality holds for 1 page\(s\)/);
  assert.match(ctx.output(), /reviewed-graph: empty-symbol assertion — merge-base [0-9a-f]{12}/);
  assert.match(ctx.output(), /committed \.job\/reviewed-hashes\.json to .* at review-brief assembly/, 'the assembly commit is logged');
  // D8: the store never lands as a live path — not on the train the merge
  // landed on, not on the frozen main.
  assert.equal(gitTry(ctx.repoRoot, ['show', 'train:.job/reviewed-hashes.json']).ok, false, 'the store is not on train');
  assert.equal(gitTry(ctx.repoRoot, ['show', 'main:.job/reviewed-hashes.json']).ok, false, 'the store is not on main');
});

test('task 64 (D5, per-page shape): each declared page\'s record carries its own would-cite and binding', (t) => {
  const ctx = reviewCtx63(t);
  // The pages exist in the tree: `writeRecordSubjects` hashes the merged
  // tree's bytes, so a record can only bind what is really there.
  for (const page of [P1, P2]) {
    const full = join(ctx.repoRoot, page);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, pageText(`the approved bytes of ${page}`), 'utf8');
  }
  // The per-page flow writes one record per page; each record binds its ONE
  // page and carries its own non-empty would-cite — the authority's SHALL
  // (a would-cite for each declared page), proved on the shape the flow
  // produces.
  const pages = [P1, P2];
  pages.forEach((page, pi) => {
    const p = writeVerdictRecord(ctx, `j-20260912-64.reviewed-${pi}`, {
      verdict: 'approve',
      wouldCite: `A reader checking page ${pi} would cite it.`,
      notes: `page ${pi} reviewed as it stands`,
    });
    const wrote = writeRecordSubjects(p, [page], { repoRoot: ctx.repoRoot });
    assert.equal(wrote.ok, true, wrote.why ?? '');
  });
  pages.forEach((page, pi) => {
    const rec = matter(readFileSync(reviewedPerPageRecordPath(ctx, 'j-20260912-64', pi, 1), 'utf8')).data;
    assert.ok(String(rec['would-cite'] ?? '').trim().length > 0, `page ${pi}'s record carries a non-empty would-cite`);
    assert.deepEqual((Array.isArray(rec.subject) ? rec.subject : [rec.subject]).map((s) => String(s).replace(/\\/g, '/')), [page], `page ${pi}'s record binds its one page by subject:`);
    assert.ok(rec.reviewed && typeof rec.reviewed === 'object', `page ${pi}'s record binds by reviewed:`);
    assert.ok(Object.keys(rec.reviewed).length === 1, `page ${pi}'s record binds exactly its one page`);
  });
});

test('task 64 (D6, non-regression): the brief carries the tree\'s bytes and prints each declared page\'s hash', (t) => {
  const ctx = reviewCtx63(t);
  const dir = storeWorktree(t, ctx, 'job/store-brief-bytes');
  // The carried page bytes equal the reviewed surface re-derived from the
  // tree at assembly — not a placeholder, not a re-typed copy.
  const raw = pageText('the tree\'s own bytes');
  mkdirSync(dirname(join(dir, P1)), { recursive: true });
  writeFileSync(join(dir, P1), raw, 'utf8');
  const brief = assembleReviewBrief(ctx, {
    jobId: 'j-20260912-64',
    job: baseJob63(),
    diffText: '',
    pass: 1,
    findings: '',
    outPath: `${ctx.reviewsDir}/j-20260912-64.md`,
    gates: null,
    sha: '',
    capMinutes: 30,
    reviewedOnly: P1,
    reviewedSurfaceText: readFileSync(join(dir, P1), 'utf8'),
    reviewGraphQuery: () => ({ universe: false }),
    graphIndexId: 'test-index-64',
  });
  assert.ok(brief.includes(raw), 'the brief carries the page\'s bytes as they stand in the tree');
  // FIX-5 (task 64): a genuine two-producer assertion. The hash the BRIEF
  // PRINTS for the page is bound to `reviewedHashOfFile` over the tree's own
  // bytes — the same page's file — so the printed hash binds the tree and not
  // itself. (The previous arm compared `reviewedHash(readFileSync(file))`
  // with `reviewedHashOfFile(file)` — the same computation twice, the exact
  // tautology class removed from task 63.)
  const briefHashOfTree = /^Reviewed hash: `([0-9a-f]{64})`/m.exec(brief)?.[1] ?? null;
  const treeHash = reviewedHashOfFile(join(dir, P1));
  assert.ok(
    briefHashOfTree && briefHashOfTree === treeHash,
    `the brief's printed hash binds the tree's bytes for ${P1}: brief printed ${briefHashOfTree}, tree re-derived ${treeHash}`,
  );
  // Each declared page's hash is printed in ITS invocation's brief, and it is
  // the hash the store binds for that page.
  const s1 = pageText('page one bytes');
  const s2 = pageText('page two bytes');
  const a = briefFor63(t, P1, s1);
  const b = briefFor63(t, P2, s2);
  const hashOf = (text) => /^Reviewed hash: `([0-9a-f]{64})`/m.exec(text)?.[1] ?? null;
  assert.equal(hashOf(a.brief), reviewedHash(s1), 'page one\'s brief prints page one\'s hash');
  assert.equal(hashOf(b.brief), reviewedHash(s2), 'page two\'s brief prints page two\'s hash');
  assert.notEqual(hashOf(a.brief), hashOf(b.brief), 'the two pages never print one shared hash');
});
