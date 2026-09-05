/**
 * branch-cleanup.test.mjs — a merged job branch is actually deleted.
 *
 * ## The defect (DIRECTIVES.md line 60), measured 2026-09-04
 *
 * `loop/run.mjs` called `deleteBranch(ctx.repoRoot, branch)` at the merge,
 * while THIS JOB'S OWN WORKTREE still had that branch checked out — the
 * worktree is not removed until much later in the same function. Git refuses to
 * delete a branch checked out in a linked worktree, and `deleteBranch` returns
 * a boolean out of `gitTry` that the call site discarded. So the refusal was
 * invisible. Measured on this repository 2026-09-04: `main` carries 112
 * `job <id> (<type>):` merge commits, and 113 already-merged `job/*` branches
 * are still present locally. Not one was ever deleted.
 *
 * ## How this measures it rather than describing it
 *
 * The first test is git's own refusal, reproduced against the real
 * `deleteBranch` in the exact state production was in — branch merged, worktree
 * still present — and then again with the worktree removed. It is the cause,
 * observed, and it is what "guard rails are tested by attempting what they
 * forbid" means here: the thing being attempted is the deletion git says no to.
 *
 * The rest run the REAL loop end to end against a throwaway repository and read
 * `refs/heads/job/*` afterwards. A merged job leaves none; a DISCARDED job
 * leaves its branch standing, which is the control — a fix that deleted branches
 * unconditionally would pass the first assertion and would throw away the only
 * copy of rejected work.
 *
 * Everything here builds its own repository under the OS temp directory. No
 * branch is created in the working repository and nothing is merged into it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { join } from 'node:path';

import { runLoop } from '../run.mjs';
import { deleteBranch, jobBranches, branchExists, gitTry } from '../lib/git.mjs';
import { makeRepo, writeQueue, mockCommand, runnersYaml, git } from './helpers.mjs';

function repo(authorMode, reviewerMode, type = 'repair') {
  const ctx = makeRepo({
    runners: runnersYaml({ command: mockCommand(authorMode), reviewerCommand: mockCommand(reviewerMode) }),
  });
  writeQueue(ctx, [{ type, title: `a ${type} job, so the run reaches a merge` }]);
  return ctx;
}

const go = (ctx) => runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

/** Every `job/*` branch left in the repository, by name. */
const leftover = (ctx) => jobBranches(ctx.repoRoot).map((b) => b.branch).sort();

// ---------------------------------------------------------------------------
// THE CAUSE, observed directly.
// ---------------------------------------------------------------------------

test('GIT REFUSES to delete a branch a linked worktree still has checked out', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  // Exactly the state `run.mjs` was in at the old call site: a job branch, held
  // by a linked worktree, already merged into main.
  const dir = join(ctx.testRoot, 'probe-worktree');
  git(ctx.repoRoot, ['worktree', 'add', '-b', 'job/probe', dir, 'HEAD']);
  git(dir, ['commit', '--quiet', '--no-verify', '--allow-empty', '-m', 'job probe: work']);
  git(ctx.repoRoot, ['merge', '--no-ff', '--no-verify', '-m', 'merge job/probe', 'job/probe']);

  assert.equal(
    deleteBranch(ctx.repoRoot, 'job/probe'),
    false,
    'git must refuse while the worktree holds the branch — if it does not, the premise of the fix is wrong',
  );
  assert.equal(branchExists(ctx.repoRoot, 'job/probe'), true, 'and the branch is still there');

  // The other half of the same measurement: nothing about the branch changed,
  // only the worktree, and the identical call now succeeds.
  git(ctx.repoRoot, ['worktree', 'remove', '--force', dir]);
  assert.equal(deleteBranch(ctx.repoRoot, 'job/probe'), true, 'and succeeds the moment the worktree is gone');
  assert.equal(branchExists(ctx.repoRoot, 'job/probe'), false);
});

test('THE DIRECTORY BEING GONE IS NOT ENOUGH — an unpruned admin entry refuses the deletion too', (t) => {
  // The residual case behind the prune that now follows the `rmSync` fallback in
  // `run.mjs`. `removeWorktree` prunes BEFORE that `rmSync`, so a
  // `worktree remove --force` that fails — on Windows, a file still held open —
  // leaves this exact state: directory deleted by the fallback, admin entry under
  // `.git/worktrees/` still standing. Constructed here the short way, by deleting
  // the directory without ever removing the worktree, because the state is what
  // the deletion reads and git cannot tell which route produced it.
  //
  // Git answers from that entry, not from the filesystem, and the error names a
  // path that no longer exists — which is why this failed silently: the log line
  // says the branch could not be deleted and the directory it blames is gone.
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  const dir = join(ctx.testRoot, 'stale-worktree');
  git(ctx.repoRoot, ['worktree', 'add', '-b', 'job/stale', dir, 'HEAD']);
  git(dir, ['commit', '--quiet', '--no-verify', '--allow-empty', '-m', 'job stale: work']);
  git(ctx.repoRoot, ['merge', '--no-ff', '--no-verify', '-m', 'merge job/stale', 'job/stale']);

  rmSync(dir, { recursive: true, force: true });

  assert.equal(
    deleteBranch(ctx.repoRoot, 'job/stale'),
    false,
    'a gone directory with an unpruned entry must still refuse — if it does not, this prune is unnecessary',
  );
  assert.equal(branchExists(ctx.repoRoot, 'job/stale'), true);
  assert.match(
    gitTry(ctx.repoRoot, ['worktree', 'list', '--porcelain']).stdout,
    /prunable/,
    'and git itself calls the entry prunable, which is the whole opportunity',
  );

  // The fix, and nothing else changed: the same call, after one prune.
  assert.equal(gitTry(ctx.repoRoot, ['worktree', 'prune']).ok, true);
  assert.equal(deleteBranch(ctx.repoRoot, 'job/stale'), true, 'and one prune is all it takes');
  assert.equal(branchExists(ctx.repoRoot, 'job/stale'), false);
});

test('deleteBranch REPORTS a refusal instead of throwing — `gitTry` semantics are not changed', (t) => {
  // Every other `gitTry` caller depends on a git failure being a value rather
  // than an exception. Asserted by attempting a deletion that cannot succeed:
  // the branch does not exist at all.
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  assert.equal(deleteBranch(ctx.repoRoot, 'job/never-existed'), false);
});

// ---------------------------------------------------------------------------
// THE LOOP, end to end.
// ---------------------------------------------------------------------------

test('A MERGED JOB LEAVES NO BRANCH BEHIND', async (t) => {
  const ctx = repo('done-edit', 'review-approve');
  t.after(() => ctx.cleanup());

  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  assert.deepEqual(leftover(ctx), [], `the merged job branch was not deleted:\n${ctx.output()}`);
  assert.equal(branchExists(ctx.repoRoot, `job/${res.jobId}`), false);
  assert.match(ctx.output(), new RegExp(`deleted the merged branch job/${res.jobId}`));
  // The refusal line must not appear on a healthy run: if it does, the deletion
  // is still being attempted while something holds the branch.
  assert.doesNotMatch(ctx.output(), /could not delete the merged branch/);

  // And the cleanup leaves no worktree metadata behind either — neither a live
  // entry for the job's own worktree nor a stale one for the reviewer's. A
  // leftover entry is what the test above shows blocks the next deletion.
  const worktrees = gitTry(ctx.repoRoot, ['worktree', 'list', '--porcelain']).stdout;
  assert.doesNotMatch(worktrees, /prunable/, `a stale worktree entry survived the run:\n${worktrees}`);
  assert.doesNotMatch(worktrees, new RegExp(res.jobId), `a worktree entry for the job survived:\n${worktrees}`);
});

test('the work survives the deletion — the branch is gone, the merge is not', async (t) => {
  // Deleting the branch must not be deleting the job. `done-edit` writes
  // `site-note.md`, which is on `main` after the merge and stays there.
  const ctx = repo('done-edit', 'review-approve');
  t.after(() => ctx.cleanup());

  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  assert.equal(branchExists(ctx.repoRoot, `job/${res.jobId}`), false);
  assert.match(
    git(ctx.repoRoot, ['show', `${res.mergedSha}:site-note.md`]),
    /\S/,
    'the merged commit still carries the job\'s file',
  );
});

test('CONTROL — a DISCARDED job keeps its branch', async (t) => {
  // A deletion that ran unconditionally would pass the tests above and would
  // destroy the only copy of rejected work. The reviewer rejects twice here, so
  // nothing merges and the branch must survive.
  const ctx = repo('done-edit', 'review-reject');
  t.after(() => ctx.cleanup());

  const res = await go(ctx);
  assert.equal(res.outcome, 'discarded', ctx.output());

  assert.deepEqual(leftover(ctx), [`job/${res.jobId}`], `a discarded job's branch must survive:\n${ctx.output()}`);
  assert.doesNotMatch(ctx.output(), /deleted the merged branch/);
});
