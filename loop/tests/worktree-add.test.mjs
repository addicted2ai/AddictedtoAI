/**
 * worktree-add.test.mjs — `addWorktree` survives a stale entry at its own path.
 *
 * ## The defect, carried out of the review of job j-20260904-42
 *
 * `run.mjs` gained a `worktree prune` on its cleanup path, which closes the
 * branch-deletion case for any run that REACHES cleanup. The same stale entry
 * has a second effect that prune cannot reach, because it lands on the NEXT
 * run: `review.mjs` does `rmSync(reviewDir)` and then `addWorktree(...)` at that
 * exact path, and `run.mjs` does the same for the job worktree. Deleting the
 * directory does not remove the admin entry under `.git/worktrees/`, and git
 * answers from the entry. `addWorktree` throws on a non-ok result, so the add
 * fails and the run aborts before it does anything.
 *
 * The state only arises from a run killed at the wall-clock cap after a failed
 * `worktree remove` — which is why no completed run ever showed it, and why the
 * cost falls on a different process from the one that caused it.
 *
 * ## How this measures it rather than describing it
 *
 * The first test is git's own refusal, reproduced with a raw `worktree add`
 * against the exact state a killed run leaves. It is the cause, observed: if git
 * ever stops refusing, the prune this file defends is unnecessary and this test
 * says so instead of quietly passing. The rest call the REAL `addWorktree` at
 * that same path, in both forms the Desk uses — the reviewer's detached checkout
 * and the resumed job's branch checkout.
 *
 * The last test is the control. Prune is the narrow tool here precisely because
 * it cannot touch a live worktree; `add -f`, the other thing git suggests in the
 * error, would have overridden a genuine collision with one. A fix that reached
 * for force would pass every test above it and would silently steal a path out
 * from under a concurrent run.
 *
 * Everything here builds its own repository under the OS temp directory.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { addWorktree, gitTry } from '../lib/git.mjs';
import { makeRepo, git } from './helpers.mjs';

/**
 * The state a run killed after a failed `worktree remove` leaves behind: a
 * worktree registered at `dir`, `dir` itself deleted, the entry never pruned.
 * Built the short way — by deleting the directory without removing the worktree
 * — because the state is all git reads, and it cannot tell which route made it.
 */
function staleEntryAt(ctx, dir, branch) {
  git(ctx.repoRoot, ['worktree', 'add', '-b', branch, dir, 'HEAD']);
  rmSync(dir, { recursive: true, force: true });
  assert.match(
    gitTry(ctx.repoRoot, ['worktree', 'list', '--porcelain']).stdout,
    /prunable/,
    'the setup must actually leave a prunable entry, or nothing below is testing anything',
  );
}

test('GIT REFUSES a worktree add at a path whose stale entry was never pruned', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  const dir = join(ctx.testRoot, 'stale-add');
  staleEntryAt(ctx, dir, 'job/stale-add');

  const raw = gitTry(ctx.repoRoot, ['worktree', 'add', '--detach', dir, 'job/stale-add']);
  assert.equal(raw.ok, false, 'if git allows this, the prune in addWorktree is unnecessary');
  assert.equal(raw.status, 128);
  assert.match(raw.stderr, /missing but already registered worktree/);
});

test('THE REVIEWER FORM SUCCEEDS anyway — addWorktree prunes before it adds', (t) => {
  // `review.mjs`: rmSync(reviewDir) then a detached add at that same path.
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  const dir = join(ctx.testRoot, 'stale-review');
  staleEntryAt(ctx, dir, 'job/stale-review');

  addWorktree(ctx.repoRoot, dir, 'job/stale-review', { create: false, detach: true });

  assert.equal(existsSync(join(dir, '.git')), true, 'the worktree is really checked out, not merely not-thrown');
  assert.equal(gitTry(dir, ['rev-parse', '--is-inside-work-tree']).stdout.trim(), 'true');
  assert.doesNotMatch(
    gitTry(ctx.repoRoot, ['worktree', 'list', '--porcelain']).stdout,
    /prunable/,
    'and no stale entry survives the add',
  );
});

test('THE RESUMED-JOB FORM SUCCEEDS TOO — the killed run is always a resume', (t) => {
  // `run.mjs` adds with `create: !resumed`, and the run that hits this state is
  // by construction a resume: the branch already exists, so `create` is false.
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  const dir = join(ctx.testRoot, 'stale-job');
  staleEntryAt(ctx, dir, 'job/stale-job');

  addWorktree(ctx.repoRoot, dir, 'job/stale-job', { create: false });

  assert.equal(gitTry(dir, ['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim(), 'job/stale-job');
});

test('CONTROL — the prune does not disturb a LIVE worktree at another path', (t) => {
  // The failure a forced add would have introduced. A concurrent Desk run's
  // worktree is present on disk and must be exactly as registered afterwards.
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());

  const live = join(ctx.testRoot, 'live-worktree');
  git(ctx.repoRoot, ['worktree', 'add', '-b', 'job/live', live, 'HEAD']);

  const stale = join(ctx.testRoot, 'stale-neighbour');
  staleEntryAt(ctx, stale, 'job/stale-neighbour');

  addWorktree(ctx.repoRoot, stale, 'job/stale-neighbour', { create: false, detach: true });

  const list = gitTry(ctx.repoRoot, ['worktree', 'list', '--porcelain']).stdout;
  assert.match(list, /job\/live/, 'the live worktree must still be registered on its branch');
  assert.equal(existsSync(join(live, '.git')), true, 'and still be a working tree on disk');
  assert.equal(gitTry(live, ['status', '--porcelain']).ok, true, 'and still usable from inside');
});
