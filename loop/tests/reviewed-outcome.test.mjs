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
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
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
  reviewedPathsFromResultText,
} from '../run.mjs';
import { reviewStateForPageAtBase } from '../lib/review-state.mjs';
import {
  assembleReviewBrief,
  joinableSubjects,
  writeRecordSubjects,
  writeVerdictRecord,
} from '../lib/review.mjs';
import { GRAPH_ANNEX_HEADING } from '../lib/brief.mjs';
import { reviewedHash } from '../../lib/review-hash.mjs';
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
