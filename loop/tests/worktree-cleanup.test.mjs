/**
 * worktree-cleanup.test.mjs — a worktree that will not delete must not cost the
 * run its record (beads addictedtoai-osru).
 *
 * ## The defect, measured 2026-09-06 on job `j-20260906-17`
 *
 * A `verify` job's author committed 527 lines of real work to its branch and
 * exited without `RESULT.md`, so the run was classified `interrupted` —
 * correctly. Then `run.mjs` reached three unguarded cleanup calls,
 *
 *     removeWorktree(ctx.repoRoot, worktree);
 *     rmSync(worktree, { recursive: true, force: true });
 *     gitTry(ctx.repoRoot, ['worktree', 'prune']);
 *
 * and the `rmSync` threw `EPERM` on
 * `\\?\D:\addictedtoai-worktrees\j-20260906-17`, because a process the author
 * had left running still had the worktree as its working directory. Windows
 * lets the files go and refuses the directory.
 *
 * The throw escaped BEFORE `recordOutcome()` and before `commitJobRecords`. The
 * run ended on `loop error: EPERM` with no ledger line (`data/ledger.jsonl`
 * stopped at `j-16`), no verdict record, no records commit, and 11.91
 * model-minutes unaccounted — and a resumed job reads its prior spend from the
 * ledger, so the job's remaining budget was overstated by exactly the
 * invocation that had produced the work.
 *
 * ## What these tests measure
 *
 * The invariant, not the wording: with the removal failing, the ledger line and
 * the `job <id>: records (<outcome>)` commit still land, and the outcome they
 * carry is the run's TRUE outcome — `done` for a merged job, `interrupted` for
 * the shape that actually failed in production.
 *
 * The failure is injected through `ctx.worktreeCleanup`, the seam documented at
 * `removeJobWorktree`. A genuinely undeletable directory is a Windows-only,
 * timing-dependent condition that depends on a stray process; a guard measured
 * only where it happens to reproduce is a guard measured nowhere. The injection
 * reproduces production's shape exactly — `git worktree remove` refuses with
 * a reason, and the `rmSync` seam would throw an `EPERM` if the guard failed.
 *
 * The positive control below runs the identical fixture with NO seam and
 * asserts the worktree is really gone and no failure line was printed, so a
 * `removeJobWorktree` that had quietly stopped removing anything would fail
 * here rather than pass everything.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { runLoop, removeJobWorktree } from '../run.mjs';
import { makeRepo, writeQueue, runnersYaml, mockCommand, git } from './helpers.mjs';

/** The error Windows actually raised, shaped the way `fs` raises it. */
function eperm(path) {
  const e = new Error(`EPERM: operation not permitted, rmdir '${path}'`);
  e.code = 'EPERM';
  e.errno = -4048;
  e.syscall = 'rmdir';
  e.path = path;
  return e;
}

/**
 * The production shape: git refuses to remove the directory without forcing,
 * and the refusal is returned by `removeWorktree` rather than followed by a
 * recursive fallback.
 */
const REFUSES_TO_DELETE = {
  remove: (_repo, dir) => ({ ok: false, reason: `EPERM: operation not permitted, rmdir '${dir}'` }),
  rm: (dir) => {
    throw eperm(dir);
  },
};

function fixture({ command, seam } = {}) {
  const ctx = makeRepo({
    gitignore: 'node_modules/\n*.log\n/HOLD.md\n/STOP\n/RESULT.md\n',
    runners: runnersYaml({
      command: command ?? mockCommand('done-edit'),
      reviewerCommand: mockCommand('review-approve'),
    }),
  });
  writeQueue(ctx, [{ type: 'repair', title: 'a repair job, so the run reaches the cleanup' }]);
  if (seam) ctx.worktreeCleanup = seam;
  return ctx;
}

const go = (ctx) => runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

function ledgerLines(ctx) {
  if (!existsSync(ctx.ledgerPath)) return [];
  return readFileSync(ctx.ledgerPath, 'utf8')
    .split('\n')
    .filter((l) => l.trim() !== '')
    .map((l) => JSON.parse(l));
}

test('A REMOVAL REFUSAL STILL LEAVES THE LEDGER LINE AND THE RECORDS COMMIT', async (t) => {
  const ctx = fixture({ seam: REFUSES_TO_DELETE });
  t.after(() => ctx.cleanup());

  const res = await go(ctx);

  // The run does not die on the `rm`.
  assert.equal(res.outcome, 'done', ctx.output());

  // The ledger line — the record the budget is computed from, and the one thing
  // a resumed job cannot reconstruct.
  const lines = ledgerLines(ctx);
  assert.equal(lines.length, 1, `no ledger line was written:\n${ctx.output()}`);
  assert.equal(lines[0].id, res.jobId);
  assert.equal(lines[0].outcome, 'done', 'and it carries the run\'s TRUE outcome, not a placeholder');

  // The records commit.
  const log = git(ctx.repoRoot, ['log', '--format=%s']);
  assert.match(
    log,
    new RegExp(`job ${res.jobId}: records \\(done\\)`),
    `the records commit never landed:\n${log}\n---\n${ctx.output()}`,
  );

  // And the failure was said out loud, naming the path and the errno.
  const out = ctx.output();
  assert.match(out, /WORKTREE CLEANUP REFUSED/, 'a refused cleanup must not be silent');
  assert.match(out, /EPERM/, 'and must carry the errno');
  assert.match(out, /addictedtoai-osru/, 'and point at the finding');
});

/* ---------------------------------------------------------------------------
 * A `node_modules` junction that will not unlink is a STOP. Measured 2026-09-07
 * on job j-20260907-03: `git worktree remove --force` on a worktree whose
 * junction was still linked followed the link into D:/AddictedtoAI/node_modules
 * and emptied the shared install under every running suite on the machine.
 * The removal must be REFUSED while the link stands — never attempted and
 * reported afterwards, because the damage is done by the attempt.
 * ------------------------------------------------------------------------ */
function logger() {
  const lines = [];
  return { repoRoot: 'D:/nowhere', log: (l) => lines.push(l), lines };
}

test('A JUNCTION THAT WILL NOT UNLINK REFUSES THE REMOVAL — nothing recursive runs', () => {
  const ctx = logger();
  const calls = [];
  const res = removeJobWorktree(ctx, join('D:/nowhere', 'wt'), {
    lstat: () => ({ isSymbolicLink: () => true }), // the link is there, before and after the unlink
    unlink: (p) => {
      calls.push('unlink');
      throw eperm(p);
    },
    remove: () => {
      calls.push('remove');
      return { ok: true };
    },
    rm: () => calls.push('rm'),
    prune: () => calls.push('prune'),
  });
  assert.equal(res.removed, false);
  assert.equal(res.refused, true);
  assert.deepEqual(calls, ['unlink', 'prune'], 'the unlink is retried, the prune still runs, and NEITHER removal is attempted');
  assert.match(ctx.lines.join('\n'), /WORKTREE CLEANUP REFUSED/, 'the refusal is said out loud');
  assert.match(ctx.lines.join('\n'), /shared node_modules/, 'and says what it protected');
});

test('a junction that DOES unlink lets the removal proceed (positive control)', () => {
  const ctx = logger();
  const calls = [];
  let linked = true;
  const res = removeJobWorktree(ctx, join('D:/nowhere', 'wt'), {
    lstat: () => {
      if (!linked) throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
      return { isSymbolicLink: () => true };
    },
    unlink: () => {
      calls.push('unlink');
      linked = false;
    },
    remove: () => {
      calls.push('remove');
      return { ok: true };
    },
    rm: () => calls.push('rm'),
    prune: () => calls.push('prune'),
  });
  assert.equal(res.removed, true);
  assert.deepEqual(calls, ['unlink', 'remove', 'rm', 'prune']);
  assert.ok(!ctx.lines.some((l) => /REFUSED/.test(l)), 'no refusal when the link came off');
});

test('THE PRODUCTION SHAPE — an INTERRUPTED job records itself even when the worktree will not delete', async (t) => {
  // `j-20260906-17` exactly: an author that exits without `RESULT.md`, leaving
  // a process behind that pins the worktree. This is the only path on which the
  // defect was ever observed, so it gets its own test rather than riding on the
  // merged-job one.
  const ctx = fixture({ command: mockCommand('done-no-result'), seam: REFUSES_TO_DELETE });
  t.after(() => ctx.cleanup());

  const res = await go(ctx);

  assert.equal(res.outcome, 'interrupted', ctx.output());
  const lines = ledgerLines(ctx);
  assert.equal(lines.length, 1, `no ledger line was written:\n${ctx.output()}`);
  assert.equal(lines[0].outcome, 'interrupted', 'the recorded outcome is the real one');
  assert.equal(lines[0].id, res.jobId);
  assert.match(
    git(ctx.repoRoot, ['log', '--format=%s']),
    new RegExp(`job ${res.jobId}: records \\(interrupted\\)`),
    ctx.output(),
  );
  // The work itself was never at risk — the branch is what carries it — but the
  // test says so, because "the record is lost, not the work" is the reason a
  // failed removal is allowed to be non-fatal at all.
  assert.match(git(ctx.repoRoot, ['branch', '--list', `job/${res.jobId}`]), /job\//, 'the branch survives');
});

test('STARTUP REFUSES CLEANLY WHEN THE STALE WORKTREE CANNOT BE REMOVED', async (t) => {
  const ctx = fixture();
  ctx.worktreeStartup = REFUSES_TO_DELETE;
  t.after(() => ctx.cleanup());

  const res = await go(ctx);
  const worktree = join(ctx.worktreeRoot, res.jobId);

  assert.equal(res.refused, 'could not clear stale worktree before startup (path=' + worktree + '; errno=-4048)');
  assert.equal(existsSync(worktree), false, 'the refused startup must not create a worktree');
  assert.ok(ctx.output().includes(`path=${worktree}`));
  assert.match(ctx.output(), /errno=-4048/);
  assert.doesNotMatch(ctx.output(), /loop error:/, 'the refusal is not an uncaught exception');
});

test('POSITIVE CONTROL — with no seam the worktree is really removed and nothing is logged', async (t) => {
  // Without this, a `removeJobWorktree` that swallowed everything and deleted
  // nothing would pass every test above.
  const ctx = fixture();
  t.after(() => ctx.cleanup());

  const res = await go(ctx);

  assert.equal(res.outcome, 'done', ctx.output());
  assert.equal(
    existsSync(join(ctx.worktreeRoot, res.jobId)),
    false,
    'the ordinary path must still delete the worktree directory',
  );
  assert.doesNotMatch(ctx.output(), /WORKTREE CLEANUP FAILED/, 'and must not print a failure line');
  assert.equal(
    git(ctx.repoRoot, ['worktree', 'list', '--porcelain']).match(/^worktree /gm).length,
    1,
    'and the admin entry under .git/worktrees/ must be pruned, leaving only the main worktree',
  );
});

// ---------------------------------------------------------------------------
// The unit: each step is guarded on its own, so one failure never skips the next.
// ---------------------------------------------------------------------------

test('the prune STILL RUNS when the remove throws, while rmSync stays guarded', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  const ran = [];
  const r = removeJobWorktree(ctx, join(ctx.worktreeRoot, 'j-x'), {
    remove: () => {
      throw new Error('git refused');
    },
    rm: () => ran.push('rm'),
    prune: () => ran.push('prune'),
  });

  assert.deepEqual(ran, ['prune'], 'a refusal must not trigger recursive deletion, but prune still runs');
  assert.equal(r.removed, false);
  assert.deepEqual(r.failures, ['git worktree remove']);
});

test('every step failing is reported once each, and the function still returns', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  const boom = () => {
    throw new Error('no');
  };
  const r = removeJobWorktree(ctx, '/nowhere', {
    remove: () => ({ ok: true }),
    rm: boom,
    prune: boom,
  });

  assert.deepEqual(r.failures, ['rmSync', 'git worktree prune']);
  assert.equal(ctx.output().match(/WORKTREE CLEANUP FAILED/g).length, 2, 'one line per failed step');
});

test('a dirty git worktree refuses removal, leaves its file, and never calls rmSync', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  mkdirSync(ctx.worktreeRoot, { recursive: true });
  const dir = join(ctx.worktreeRoot, 'dirty-worktree');
  git(ctx.repoRoot, ['worktree', 'add', '-b', 'cleanup-dirty', dir, 'HEAD']);
  const tracked = join(dir, 'README.md');
  writeFileSync(tracked, '# modified by the refusal arm\n', 'utf8');

  const calls = [];
  const refused = removeJobWorktree(ctx, dir, {
    rm: () => calls.push('rm'),
    prune: () => calls.push('prune'),
  });

  assert.equal(refused.removed, false);
  assert.deepEqual(refused.failures, ['git worktree remove']);
  assert.deepEqual(calls, ['prune'], 'prune runs, but rmSync is not called after git refuses');
  assert.equal(existsSync(tracked), true, 'the refused worktree and its modified file remain');
  assert.match(ctx.output(), /WORKTREE CLEANUP REFUSED/);
  assert.match(ctx.output(), /modified|untracked/i, 'the git refusal explains why deletion was denied');

  git(dir, ['reset', '--hard', 'HEAD']);
  assert.equal(removeJobWorktree(ctx, dir).removed, true, 'the clean worktree can be removed afterward');
});

test('the happy path reports nothing and really deletes a clean worktree', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup());
  mkdirSync(ctx.worktreeRoot, { recursive: true });
  const dir = join(ctx.worktreeRoot, 'plain-dir');
  git(ctx.repoRoot, ['worktree', 'add', '-b', 'cleanup-happy', dir, 'HEAD']);

  const r = removeJobWorktree(ctx, dir);

  assert.equal(r.removed, true);
  assert.equal(existsSync(dir), false);
  assert.equal(ctx.output(), '', 'a successful cleanup says nothing');
});

test('review and conformance callers guard recursive cleanup on a refusal', () => {
  const review = readFileSync(new URL('../lib/review.mjs', import.meta.url), 'utf8');
  assert.match(review, /const removed = removeWorktree\(ctx\.repoRoot, reviewDir\);/);
  assert.match(
    review,
    /if \(removed\.ok\) \{\s*rmSync\(reviewDir, \{ recursive: true, force: true \}\);\s*\} else \{\s*ctx\.log\(/s,
  );

  const conformance = readFileSync(new URL('../conformance.mjs', import.meta.url), 'utf8');
  assert.match(conformance, /const teardownRemoval = removeWorktree\(ctx\.repoRoot, dir\);/);
  assert.match(conformance, /if \(!teardownRemoval\.ok\) \{\s*ctx\.log\(/s);
});
