/**
 * tripwire.test.mjs — the witness for Stage-1 task 34 (U1, bead avs5).
 *
 * Task 34: `loop/tests/tripwire.test.mjs` — two work orders each green
 * alone and red combined. The Q-S18 fixture policy binds here (architect
 * ruling, in task 37): a throwaway repository with a bare origin in the OS
 * temp directory, real git merges, gate spawns stubbed through the
 * `spawn`/`floorSet` seam `gates.mjs` exposes — no real `next build`, never
 * a live push. (No push happens anywhere below; no origin is even added.)
 *
 * Arms, each found by lookup:
 *
 *   arm 0 — work order A alone (branch + base together): tripwire green.
 *   arm 1 — work order B alone: tripwire green.
 *   arm 2 — combined (A merged, then B's tripwire): red, merge refused,
 *           nothing landed on the base.
 *   arm 3 — the combined arm is not vacuous: a copy-based mutant of
 *           `train.mjs` that builds the branch instead of the merged tip
 *           goes GREEN where it must not (the red arm fails on the mutant),
 *           while the tracked file is byte-identical before and after.
 *   arm 4 — gate-set pins: DEFAULT_GATES holds exactly the tripwire two,
 *           TRAIN_GATES holds the frozen six in Q-S15 order, the frozen set
 *           is immutable from job code.
 *   arm 5 — the post-merge build block is absent by symbol
 *           (`postMergeGateOptions` nowhere in `run.mjs`) while the single
 *           rederive (`await rederiveStep(ctx)`) stands.
 *   arm 6 — green gates with a broken cleanup book environmental, not
 *           ordinary: the gates stub deletes the worktree's gitfile after
 *           the green run, so `discardProvisional` fails and togetherness —
 *           verified green — must refuse the merge as `interrupted`.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { runGates, DEFAULT_GATES, TRAIN_GATES } from '../lib/gates.mjs';
import { runTripwire } from '../lib/train.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB = resolve(HERE, '..', 'lib', 'train.mjs');
const RUN = resolve(HERE, '..', 'run.mjs');

function git(dir, args) {
  return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

/** Throwaway repo: main with gate-shaped files, ready for job branches. */
function tripwireRepo() {
  const root = mkdtempSync(join(tmpdir(), 'atai-tripwire-'));
  const repo = join(root, 'repo');
  mkdirSync(repo, { recursive: true });
  git(repo, ['init', '--quiet']);
  git(repo, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  git(repo, ['config', 'user.email', 'tripwire@example.invalid']);
  git(repo, ['config', 'user.name', 'Tripwire Test']);
  git(repo, ['config', 'commit.gpgsign', 'false']);
  writeFileSync(join(repo, 'package.json'), JSON.stringify({ name: 'tripwire-fixture', private: true, scripts: { build: 'node --version' } }, null, 2) + '\n', 'utf8');
  mkdirSync(join(repo, 'scripts'), { recursive: true });
  writeFileSync(join(repo, 'scripts', 'verify-surfaces.mjs'), 'process.exit(0);\n', 'utf8');
  writeFileSync(join(repo, 'base.txt'), 'base\n', 'utf8');
  git(repo, ['add', '-A']);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', 'base']);
  return { root, repo, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

function plantBranch(repo, name, files) {
  git(repo, ['checkout', '--quiet', '-b', name, 'main']);
  for (const [p, c] of Object.entries(files)) {
    const full = join(repo, p);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, c, 'utf8');
  }
  git(repo, ['add', '-A']);
  git(repo, ['commit', '--quiet', '--no-verify', '-m', `work order ${name}`]);
  git(repo, ['checkout', '--quiet', 'main']);
}

/** A checked-out worktree at `branch` inside the fixture's universe. */
function checkoutBranch(repo, root, branch) {
  const wt = join(root, `wt-${branch.replace('/', '-')}`);
  git(repo, ['worktree', 'add', '--quiet', wt, branch]);
  return wt;
}

function removeWorktree(repo, wt) {
  git(repo, ['worktree', 'remove', '--force', wt]);
}

/**
 * The Q-S18 stub: real `runGates`, stubbed spawn. Red if and only if both
 * work-order sentinels coexist in the tree the gates run over.
 */
function sentinelSpawn(command, args, options) {
  const dir = options && options.cwd ? options.cwd : '';
  let both = false;
  try {
    both = existsSync(join(dir, 'wo-a.txt')) && existsSync(join(dir, 'wo-b.txt'));
  } catch {
    both = false;
  }
  return both
    ? { status: 1, stdout: 'combined red: wo-a and wo-b coexist', stderr: '' }
    : { status: 0, stdout: '', stderr: '' };
}

function stubGates(ctx, worktree, { scripts }) {
  // The `now` seam (gates.test.mjs precedent): the stubbed spawn returns
  // instantly, which reads as below-floor; advancing ticks stand in for
  // real child time. Floor sets stay production-shaped — never zeroed.
  let t = 0;
  const now = () => { t += 50; return t; };
  return runGates(ctx, worktree, { scripts, spawn: sentinelSpawn, timeoutMs: 60000, now });
}

const CTX = (repo) => ({ repoRoot: repo });

test('arm 0 — work order A alone is green together', () => {
  const { root, repo, cleanup } = tripwireRepo();
  try {
    plantBranch(repo, 'job/a', { 'wo-a.txt': 'a\n' });
    const wt = checkoutBranch(repo, root, 'job/a');
    try {
      const r = runTripwire(CTX(repo), { worktree: wt, baseRef: 'main', gates: stubGates });
      assert.equal(r.ok, true, r.reason ?? 'tripwire refused a green-together pair');
    } finally {
      removeWorktree(repo, wt);
    }
  } finally {
    cleanup();
  }
});

test('arm 1 — work order B alone is green together', () => {
  const { root, repo, cleanup } = tripwireRepo();
  try {
    plantBranch(repo, 'job/b', { 'wo-b.txt': 'b\n' });
    const wt = checkoutBranch(repo, root, 'job/b');
    try {
      const r = runTripwire(CTX(repo), { worktree: wt, baseRef: 'main', gates: stubGates });
      assert.equal(r.ok, true, r.reason ?? 'tripwire refused a green-together pair');
    } finally {
      removeWorktree(repo, wt);
    }
  } finally {
    cleanup();
  }
});

test('arm 2 — combined: the second merge tripwire is red and nothing lands', () => {
  const { root, repo, cleanup } = tripwireRepo();
  try {
    // Both work orders branch from the SAME base (each green alone), THEN A
    // merges: B's tripwire must catch what neither branch saw apart.
    plantBranch(repo, 'job/a', { 'wo-a.txt': 'a\n' });
    plantBranch(repo, 'job/b', { 'wo-b.txt': 'b\n' });
    git(repo, ['checkout', '--quiet', 'main']);
    git(repo, ['merge', '--quiet', '--no-ff', '--no-verify', '-m', 'merge A', 'job/a']);
    const wt = checkoutBranch(repo, root, 'job/b');
    try {
      const r = runTripwire(CTX(repo), { worktree: wt, baseRef: 'main', gates: stubGates });
      assert.equal(r.ok, false, 'combined pair must trip the wire');
      assert.equal(r.environmental ?? false, false, 'red-together is an ordinary failure, not environmental');
      // Nothing landed: job/b is not an ancestor of main.
      let bIsAncestor = true;
      try {
        git(repo, ['merge-base', '--is-ancestor', 'job/b', 'main']);
      } catch {
        bIsAncestor = false;
      }
      assert.equal(bIsAncestor, false, 'job/b must not be an ancestor of main');
      // The worktree was left clean at the branch tip (provisional gone).
      assert.equal(git(wt, ['rev-parse', 'HEAD']), git(repo, ['rev-parse', 'job/b']));
      assert.equal(git(wt, ['status', '--porcelain']), '');
    } finally {
      removeWorktree(repo, wt);
    }
  } finally {
    cleanup();
  }
});

test('arm 3 — the combined arm observes the merge (copy-based mutant goes green where it must not)', async () => {
  const before = readFileSync(LIB, 'utf8');
  // The mutant builds the branch instead of the merged tip: the provisional
  // merge is replaced by a no-op success, so the gates run over branch-only
  // content and the combined pair wrongly passes.
  const mutant = before.replace(
    "const m = gitTry(worktree, ['merge', '--no-commit', '--no-ff', baseRef]);",
    'const m = ({ ok: true, stdout: "", stderr: "" });',
  );
  assert.notEqual(mutant, before, 'the mutant must differ from the shipped file');
  const copyPath = resolve(HERE, '..', 'lib', `train.mut-${process.pid}.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  try {
    const { runTripwire: mutantTripwire } = await import(`./../lib/train.mut-${process.pid}.mjs`);
    const { root, repo, cleanup } = tripwireRepo();
    try {
      plantBranch(repo, 'job/a', { 'wo-a.txt': 'a\n' });
      plantBranch(repo, 'job/b', { 'wo-b.txt': 'b\n' });
      git(repo, ['checkout', '--quiet', 'main']);
      git(repo, ['merge', '--quiet', '--no-ff', '--no-verify', '-m', 'merge A', 'job/a']);
      const wt = checkoutBranch(repo, root, 'job/b');
      try {
        const r = mutantTripwire(CTX(repo), { worktree: wt, baseRef: 'main', gates: stubGates });
        assert.equal(r.ok, true, 'mutant must pass the combined pair (the red arm fails on the mutant)');
      } finally {
        removeWorktree(repo, wt);
      }
    } finally {
      cleanup();
    }
    // The tracked file was never written: the mutation lived in the copy.
    // Verified by hash (the acceptance wording): digest after equals digest
    // before — plus the byte-equality assert below, strictly stronger.
    const sha = createHash('sha256').update(before, 'utf8').digest('hex');
    assert.equal(
      createHash('sha256').update(readFileSync(LIB, 'utf8'), 'utf8').digest('hex'),
      sha,
      `tracked train.mjs hash-identical after the mutant run (sha256 ${sha.slice(0, 12)}…)`,
    );
    assert.equal(readFileSync(LIB, 'utf8'), before, 'tracked train.mjs byte-identical after the mutant run');
  } finally {
    rmSync(copyPath, { force: true });
  }
});

test('arm 4 — gate-set pins: tripwire two, frozen six in Q-S15 order', () => {
  assert.deepEqual(DEFAULT_GATES, ['build', 'verify-surfaces']);
  assert.deepEqual([...TRAIN_GATES], ['test', 'build', 'verify-surfaces', 'verify-design', 'verify-launch', 'verify-analytics']);
  assert.equal(Object.isFrozen(TRAIN_GATES), true, 'the frozen set is immutable from job code');
});

test('arm 5 — post-merge block absent by symbol, single rederive stands', () => {
  const src = readFileSync(RUN, 'utf8');
  // The declaration, not the name: comments may cite the removed symbol for
  // archaeology, but no code may construct it.
  assert.equal(src.includes('postMergeGateOptions ='), false, 'the symbol-anchored post-merge build block is gone');
  assert.match(src, /await rederiveStep\(ctx\)/, 'the single rederive stands');
});

test('arm 6 — green gates with a failed cleanup book environmental', () => {
  const { root, repo, cleanup } = tripwireRepo();
  try {
    plantBranch(repo, 'job/a', { 'wo-a.txt': 'a\n' });
    const wt = checkoutBranch(repo, root, 'job/a');
    try {
      // The stub reports green, then destroys the worktree's gitfile (a
      // linked worktree carries `.git` as a pointer file): the provisional
      // cleanup's `git reset --hard` cannot run. Togetherness was verified
      // green, so the refusal is a machine condition — environmental.
      const gates = (ctx, dir, options) => {
        rmSync(join(wt, '.git'), { force: true });
        return { ok: true, results: [], output: '' };
      };
      const r = runTripwire(CTX(repo), { worktree: wt, baseRef: 'main', gates });
      assert.equal(r.ok, false, 'a dirty tree must refuse the merge');
      assert.equal(r.environmental, true, 'green-but-uncleaned books interrupted, never a breaker input');
    } finally {
      // `git worktree remove` may fail with the gitfile gone; the outer
      // cleanup removes the whole fixture universe regardless.
      try { removeWorktree(repo, wt); } catch { /* fixture cleanup below */ }
    }
  } finally {
    cleanup();
  }
});
