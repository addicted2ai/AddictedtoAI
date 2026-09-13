/**
 * review-state.test.mjs — the test home for the review-state join capability.
 *
 * Task 61b: `loop/lib/review-state.mjs` exposes missing / matched /
 * mismatched for a declared page pinned at an explicit base commit, with the
 * concurrency rule re-read at merge and never a derived store as source. Task
 * 62 reads this capability as its only source of truth for the reviewed
 * precondition.
 *
 * Reuse, not reimplementation: every arm below exercises production directly —
 * `reviewedHash` (the same hashing the merge step writes with),
 * `mergeBase` plumbing, `readCommittedJobSource` for the declaration helper,
 * and `recordNamesPath` / `reviewedOf` / `recencyOf` for membership and
 * ordering. Nothing here reimplements a hash, a base computation, a source
 * read, or a recency parse.
 *
 * FIXTURE POLICY throughout: throwaway repositories under the OS temp
 * directory via `makeRepo` (real git plumbing, no bare origin needed — no arm
 * publishes or reads a remote), no spawns touched, reviewers never invoked.
 * Never a test whose red path is a live remote update.
 *
 * Arms:
 * - missing where no record names the page; matched where the base hash
 *   equals the recorded one; mismatched where it differs;
 * - unbound (names the page, carries no hash) reads missing, never
 *   mismatched;
 * - the most recent record binds where several name one page;
 * - a base that moves between brief assembly and merge moves the answers
 *   with it, and working-tree edits without a commit move nothing;
 * - a gate-rewritten file is never consulted (functional arms plus a
 *   structural arm pinning the import list and the absence of derived-store
 *   reads);
 * - the change analysis never answers (no such import or parameter; an extra
 *   analysis-shaped option changes nothing).
 *
 * Copy-based mutants below prove the arms measure something; each writes one
 * copy beside production, imports the copy, and removes that one file again.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  REVIEW_STATE_VALUES,
  declaredReviewStatesAtJobMergeBase,
  isMismatchedAtJobMergeBase,
  jobMergeBase,
  normalizeReviewStatePath,
  reviewStateAtJobMergeBase,
  reviewStateForPageAtBase,
  reviewStatesAtJobMergeBase,
} from '../lib/review-state.mjs';
import { reviewedHash } from '../../lib/review-hash.mjs';
import { mergeBase } from '../lib/git.mjs';
import { readCommittedJobSource } from '../lib/resume.mjs';
import { writeRecordSubjects, writeVerdictRecord } from '../lib/review.mjs';
import { git, makeRepo, plantJobBranch } from './helpers.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const STATE_LIB = resolve(HERE, '..', 'lib', 'review-state.mjs');

// Local date, read from the machine clock (2026-09-12, Mountain).
const NOW = new Date('2026-09-12T12:00:00');
const PAGE = 'content/wiki/model/review-state-page.md';
const OTHER = 'content/wiki/model/review-state-other.md';

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function pageText(body) {
  return `---\ntitle: review-state fixture\n---\n\n${body}\n`;
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

function ctxWithPage(t, body = 'the first version') {
  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  writePage(ctx, PAGE, body);
  commitAll(ctx, 'fixture: a page with no record yet');
  return ctx;
}

function approveWithSubjects(ctx, jobId, subjects, { repoRoot = ctx.repoRoot } = {}) {
  const p = writeVerdictRecord(ctx, jobId, {
    verdict: 'approve',
    wouldCite: `a reader checking dates would cite ${jobId}`,
    notes: 'fixture approval',
  });
  const wrote = repoRoot
    ? writeRecordSubjects(p, subjects, { repoRoot })
    : writeRecordSubjects(p, subjects);
  assert.equal(wrote.ok, true, `fixture record binds: ${wrote.why ?? ''}`);
  return p;
}

/** Copy-mutant harness for review-state.mjs: pairs of (search, replacement). */
async function withStateMutant(tag, pairs, fn) {
  const before = readFileSync(STATE_LIB, 'utf8');
  let mutant = before;
  for (const [search, replacement] of pairs) {
    const next = mutant.replace(search, replacement);
    assert.notEqual(next, mutant, `the mutant must differ from the shipped file (${tag})`);
    mutant = next;
  }
  const sha = sha256(before);
  const copyPath = resolve(HERE, '..', 'lib', `review-state.mut-${process.pid}-61b-${tag}.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  try {
    await fn(await import(`./../lib/review-state.mut-${process.pid}-61b-${tag}.mjs`));
    assert.equal(sha256(readFileSync(STATE_LIB, 'utf8')), sha, `tracked review-state.mjs hash-identical after the mutant run (${tag})`);
    assert.equal(readFileSync(STATE_LIB, 'utf8'), before, `tracked review-state.mjs byte-identical after the mutant run (${tag})`);
  } finally {
    rmSync(copyPath, { force: true });
  }
  assert.equal(existsSync(copyPath), false, 'the mutant copy is gone');
  const residue = readdirSync(resolve(HERE, '..', 'lib')).filter((f) => f.startsWith(`review-state.mut-${process.pid}-61b-`));
  assert.deepEqual(residue, [], 'no mutant residue of this file in loop/lib');
}

// ---------------------------------------------------------------------------
// The three states, pinned at the base.
// ---------------------------------------------------------------------------

test('task 61b: a page with no record reads missing at the base', (t) => {
  const ctx = ctxWithPage(t);
  const base = headOf(ctx);
  const r = reviewStateForPageAtBase(ctx.repoRoot, base, PAGE);
  assert.equal(r.state, 'missing');
  assert.equal(r.record, null);
  assert.equal(r.base, base);
  assert.equal(r.page, PAGE);
  assert.ok(r.currentHash, 'the current hash is still reported as evidence');
});

test('task 61b: a record hash matching the base bytes reads matched', (t) => {
  const ctx = ctxWithPage(t, 'the approved version');
  approveWithSubjects(ctx, 'j-20260912-01', [PAGE]);
  commitAll(ctx, 'fixture: the approving record');
  const base = headOf(ctx);
  const r = reviewStateForPageAtBase(ctx.repoRoot, base, PAGE);
  assert.equal(r.state, 'matched', r.why);
  assert.ok(r.record, 'the binding record is named');
  assert.equal(r.recordedHash, r.currentHash);
  assert.deepEqual(REVIEW_STATE_VALUES, ['missing', 'matched', 'mismatched']);
});

test('task 61b: a page edited after its record reads mismatched at the base', (t) => {
  const ctx = ctxWithPage(t, 'the approved version');
  approveWithSubjects(ctx, 'j-20260912-01', [PAGE]);
  commitAll(ctx, 'fixture: the approving record');
  writePage(ctx, PAGE, 'an edit nobody reviewed');
  commitAll(ctx, 'fixture: a later edit to the page');
  const base = headOf(ctx);
  const r = reviewStateForPageAtBase(ctx.repoRoot, base, PAGE);
  assert.equal(r.state, 'mismatched', r.why);
  assert.ok(r.record, 'the mismatch names the record it moved from');
  assert.notEqual(r.recordedHash, r.currentHash);
  assert.equal(isMismatchedAtJobMergeBase(ctx.repoRoot, 'HEAD', 'HEAD', PAGE).mismatched, true);
});

test('task 61b: an unbound record reads missing, never mismatched', (t) => {
  const ctx = ctxWithPage(t, 'the approved version');
  // Subject with no hash: the record names the page but binds no bytes.
  approveWithSubjects(ctx, 'j-20260912-01', [PAGE], { repoRoot: null });
  commitAll(ctx, 'fixture: an unbound record');
  const base = headOf(ctx);
  const r = reviewStateForPageAtBase(ctx.repoRoot, base, PAGE);
  assert.equal(r.state, 'missing', 'no hash means no binding, not a mismatch');
  assert.equal(r.recordedHash, null);
  assert.equal(isMismatchedAtJobMergeBase(ctx.repoRoot, 'HEAD', 'HEAD', PAGE).mismatched, false);
});

test('task 61b: the most recent record binds where several name one page', (t) => {
  const ctx = ctxWithPage(t, 'the approved version');
  approveWithSubjects(ctx, 'j-20260912-01', [PAGE]);
  commitAll(ctx, 'fixture: the first approval');
  // A re-review carrying the current bytes supersedes the stale first one.
  approveWithSubjects(ctx, 'j-20260912-02', [PAGE]);
  commitAll(ctx, 'fixture: the re-review');
  const base = headOf(ctx);
  const r = reviewStateForPageAtBase(ctx.repoRoot, base, PAGE);
  assert.equal(r.state, 'matched', r.why);
  assert.match(r.record ?? '', /j-20260912-02/, 'the newer record binds');

  // The other direction: the newer record carries a stale hash, so the page
  // reads mismatched even though an older record once matched it.
  const ctx2 = ctxWithPage(t, 'the approved version');
  approveWithSubjects(ctx2, 'j-20260912-01', [PAGE]);
  commitAll(ctx2, 'fixture: the first approval');
  writePage(ctx2, PAGE, 'an edit nobody reviewed');
  // A stale re-review written against the old bytes (hash the pre-edit tree).
  const stale = writeVerdictRecord(ctx2, 'j-20260912-02', {
    verdict: 'approve',
    wouldCite: 'a reader checking dates would cite j-20260912-02',
    notes: 'fixture stale re-review',
  });
  const preEditHash = reviewedHash(pageText('the approved version'));
  const before = readFileSync(stale, 'utf8');
  const withSubject = before.replace(/^---\n/, `---\nsubject: ${JSON.stringify(PAGE)}\n`);
  const withBoth = withSubject.replace(/\n---\n/, `\nreviewed:\n  ${JSON.stringify(PAGE)}: ${JSON.stringify(preEditHash)}\n---\n`);
  writeFileSync(stale, withBoth, 'utf8');
  commitAll(ctx2, 'fixture: a stale re-review plus the edit');
  const r2 = reviewStateForPageAtBase(ctx2.repoRoot, headOf(ctx2), PAGE);
  assert.equal(r2.state, 'mismatched', 'the current record decides, not the older one');
});

// ---------------------------------------------------------------------------
// The base moves the answers; the working tree does not.
// ---------------------------------------------------------------------------

test('task 61b: a base that moves between brief assembly and merge moves the answers with it', (t) => {
  const ctx = ctxWithPage(t, 'the approved version');
  approveWithSubjects(ctx, 'j-20260912-01', [PAGE]);
  commitAll(ctx, 'fixture: the approving record');
  const briefBase = headOf(ctx);
  const atBrief = reviewStateForPageAtBase(ctx.repoRoot, briefBase, PAGE);
  assert.equal(atBrief.state, 'matched', 'at brief assembly the page matches its record');

  // A later actor edits the page; the merge-time base is a new commit. The
  // job branch is planted BEFORE that edit, so it forks at the brief base —
  // the shape a real job has when its base moves underneath it.
  const branch = plantJobBranch(ctx, 'j-20260912-11', { files: {} });
  writePage(ctx, PAGE, 'an edit that landed after the brief');
  commitAll(ctx, 'fixture: a later page edit');
  const mergeBaseSha = headOf(ctx);
  assert.notEqual(mergeBaseSha, briefBase);
  const atMerge = reviewStateForPageAtBase(ctx.repoRoot, mergeBaseSha, PAGE);
  assert.equal(atMerge.state, 'mismatched', 'the same page at the merge base reads mismatched');
  assert.equal(atMerge.record, atBrief.record, 'the record is the same one — the bytes moved');

  // The job-merge-base entry point recomputes through plumbing on every call.
  const viaPlumbing = jobMergeBase(ctx.repoRoot, 'main', branch);
  assert.equal(viaPlumbing, mergeBase(ctx.repoRoot, 'main', branch));
  const atJobBase = reviewStateAtJobMergeBase(ctx.repoRoot, 'main', branch, PAGE);
  assert.equal(atJobBase.base, viaPlumbing);
  assert.equal(atJobBase.state, 'matched', 'the planted branch forks before the later edit, so its merge base still matches');

  // Working-tree edits move nothing until committed: the answer is pinned at
  // the base, never at ambient files.
  writePage(ctx, PAGE, 'an uncommitted working-tree edit');
  const still = reviewStateForPageAtBase(ctx.repoRoot, mergeBaseSha, PAGE);
  assert.equal(still.state, 'mismatched');
  assert.equal(still.currentHash, atMerge.currentHash, 'uncommitted bytes are not read');
});

test('task 61b: the declaration helper answers the committed subjects at the job merge base', (t) => {
  const ctx = makeRepo({ now: () => NOW });
  t.after(() => ctx.cleanup());
  writePage(ctx, PAGE, 'the approved version');
  writePage(ctx, OTHER, 'another approved version');
  commitAll(ctx, 'fixture: two pages');
  approveWithSubjects(ctx, 'j-20260912-01', [PAGE]);
  approveWithSubjects(ctx, 'j-20260912-02', [OTHER]);
  commitAll(ctx, 'fixture: two approving records');
  const id = 'j-20260912-21';
  const source = {
    job: id, type: 'repair', source: 'queue', slug: null, path: null, issues: [],
    items: [{ bead: null, type: 'repair', subjects: [PAGE], reason: 'fixture' }],
    declared_subjects: [PAGE],
  };
  plantJobBranch(ctx, id, { files: { '.job/source.json': `${JSON.stringify(source, null, 2)}\n` } });
  // The helper reads the committed declaration through the shared reader —
  // duplicating that read would be a second source for the same fact.
  const committed = readCommittedJobSource(ctx.repoRoot, `job/${id}`);
  assert.deepEqual(committed.declared_subjects, [PAGE]);
  const r = declaredReviewStatesAtJobMergeBase(ctx.repoRoot, 'main', `job/${id}`);
  assert.equal(r.ok, true, r.why ?? '');
  assert.deepEqual(r.declared, [PAGE]);
  assert.equal(r.states.get(PAGE).state, 'matched');
  const multi = reviewStatesAtJobMergeBase(ctx.repoRoot, 'main', `job/${id}`, [PAGE, OTHER]);
  assert.equal(multi.states.get(PAGE).state, 'matched');
  assert.equal(multi.states.get(OTHER).state, 'matched');
  assert.equal(normalizeReviewStatePath('content\\wiki/model/review-state-page.md'), PAGE);
});

// ---------------------------------------------------------------------------
// Never a derived store, never the change analysis.
// ---------------------------------------------------------------------------

test('task 61b: a gate-rewritten file is never consulted', (t) => {
  const ctx = ctxWithPage(t, 'the approved version');
  approveWithSubjects(ctx, 'j-20260912-01', [PAGE]);
  commitAll(ctx, 'fixture: the approving record');
  const base = headOf(ctx);
  assert.equal(reviewStateForPageAtBase(ctx.repoRoot, base, PAGE).state, 'matched');

  // Derived stores claiming the opposite, first uncommitted then committed on
  // a job branch: the answers do not move because neither is ever read.
  const gateDir = join(ctx.repoRoot, '.job');
  mkdirSync(gateDir, { recursive: true });
  writeFileSync(join(gateDir, 'reviewed-hashes.json'), JSON.stringify({ [PAGE]: '0'.repeat(64) }, null, 2), 'utf8');
  mkdirSync(join(ctx.repoRoot, '.job2'), { recursive: true });
  assert.equal(reviewStateForPageAtBase(ctx.repoRoot, base, PAGE).state, 'matched', 'working-tree derived files change nothing');
  const id = 'j-20260912-31';
  plantJobBranch(ctx, id, {
    files: { '.job/reviewed-hashes.json': JSON.stringify({ [PAGE]: '0'.repeat(64) }, null, 2) },
  });
  assert.equal(reviewStateForPageAtBase(ctx.repoRoot, base, PAGE).state, 'matched', 'committed derived files change nothing either');
  assert.equal(reviewStateAtJobMergeBase(ctx.repoRoot, 'main', `job/${id}`, PAGE).state, 'matched');

  // Structural half: the capability imports no derived-store reader and names
  // no derived-store path outside comments. Comments are stripped so prose
  // about the rule cannot trip the check.
  const src = readFileSync(STATE_LIB, 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '\n').replace(/^[ \t]*\/\/.*$/gm, '\n');
  assert.ok(!code.includes('reviewed-hashes'), 'no derived hash store is read');
  assert.ok(!code.includes('graph.json'), 'no sidecar store is read');
});

test('task 61b: the change analysis never answers missing / matched / mismatched', (t) => {
  const ctx = ctxWithPage(t, 'the approved version');
  approveWithSubjects(ctx, 'j-20260912-01', [PAGE]);
  commitAll(ctx, 'fixture: the approving record');
  const base = headOf(ctx);
  const plain = reviewStateForPageAtBase(ctx.repoRoot, base, PAGE);
  assert.equal(plain.state, 'matched');
  // An extra analysis-shaped option is ignored — there is no parameter for
  // it to land on, so it cannot move an answer.
  const withExtra = reviewStateForPageAtBase(ctx.repoRoot, base, PAGE, { reviewsDir: 'data/reviews', analysis: { symbols: [{ name: 's', owner: PAGE }] } });
  assert.equal(withExtra.state, plain.state);
  assert.equal(withExtra.record, plain.record);

  // Structural half: the only modules this capability imports are the hash,
  // the record join, the git plumbing, the source reader, and the front
  // matter reader — no analysis seam anywhere.
  const src = readFileSync(STATE_LIB, 'utf8');
  const specs = [...src.matchAll(/^[ \t]*import[ \t]+[^'";]*from[ \t]+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  assert.ok(specs.length >= 4, `imports are visible to the check: ${specs.join(', ')}`);
  for (const s of specs) {
    const ok =
      s.startsWith('node:') ||
      s === 'gray-matter' ||
      s === './git.mjs' ||
      s === './resume.mjs' ||
      s === '../../lib/review-hash.mjs' ||
      s === '../../lib/reviews.mjs';
    assert.ok(ok, `unexpected import ${s} — the join reads records plus the base tree only`);
  }
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '\n').replace(/^[ \t]*\/\/.*$/gm, '\n');
  assert.ok(!code.includes('mergeGraphAnalysis'), 'no merge-path analysis seam');
  assert.ok(!code.includes('briefGraphQuery'), 'no brief-side analysis seam');
  assert.ok(!code.includes('graph-ack'), 'no acknowledgement block');
});

// ---------------------------------------------------------------------------
// Copy-based mutants: each proves its arm measures something.
// ---------------------------------------------------------------------------

test('mutation A: a join that always matches merges a mismatch it must not', async () => {
  const ctx = makeRepo({ now: () => NOW });
  try {
    writePage(ctx, PAGE, 'the approved version');
    commitAll(ctx, 'fixture: a page');
    approveWithSubjects(ctx, 'j-20260912-01', [PAGE]);
    commitAll(ctx, 'fixture: the approving record');
    writePage(ctx, PAGE, 'an edit nobody reviewed');
    commitAll(ctx, 'fixture: a later edit');
    const base = headOf(ctx);
    const production = reviewStateForPageAtBase(ctx.repoRoot, base, PAGE);
    assert.equal(production.state, 'mismatched');
    await withStateMutant('always-matched', [[`state: 'mismatched',`, `state: 'matched',`]], async (mut) => {
      const r = mut.reviewStateForPageAtBase(ctx.repoRoot, base, PAGE);
      assert.equal(r.state, 'matched', 'the mutant matches a page it must report as moved');
      assert.notEqual(r.state, production.state, 'the arm distinguishes the mutant from production');
    });
  } finally {
    ctx.cleanup();
  }
});

test('mutation B: a join that ignores its base argument misses a base that moved', async () => {
  const ctx = makeRepo({ now: () => NOW });
  try {
    writePage(ctx, PAGE, 'the approved version');
    commitAll(ctx, 'fixture: a page');
    approveWithSubjects(ctx, 'j-20260912-01', [PAGE]);
    commitAll(ctx, 'fixture: the approving record');
    const briefBase = headOf(ctx);
    writePage(ctx, PAGE, 'an edit that landed after the brief');
    commitAll(ctx, 'fixture: a later edit');
    const mergeBaseSha = headOf(ctx);
    assert.equal(reviewStateForPageAtBase(ctx.repoRoot, briefBase, PAGE).state, 'matched');
    assert.equal(reviewStateForPageAtBase(ctx.repoRoot, mergeBaseSha, PAGE).state, 'mismatched');
    // MUTANT COPY: the base argument, ignored in favour of the ambient HEAD.
    await withStateMutant(
      'ignore-base',
      [['showAtBase(repo, base, normPage)', `showAtBase(repo, 'HEAD', normPage)`]],
      async (mut) => {
        const atBrief = mut.reviewStateForPageAtBase(ctx.repoRoot, briefBase, PAGE);
        assert.equal(atBrief.state, 'mismatched', 'the mutant reads HEAD bytes against brief-base records');
        assert.notEqual(atBrief.state, 'matched', 'the base-moves arm goes red under the mutant');
      },
    );
  } finally {
    ctx.cleanup();
  }
});
