/**
 * git.mjs — every git call the Desk makes.
 *
 * Two Windows-specific reasons this is a module and not inline shell:
 *  - `execFileSync` spawns git.exe directly, so no MSYS runtime mangles a
 *    `rev:path` argument (CLAUDE.md's Windows note: `git show "rev:path"` in
 *    Git Bash silently returns zero bytes with exit 0).
 *  - `-C <repo>` everywhere means nothing ever changes directory.
 *
 * NOTHING HERE PUSHES. There is no push helper in this file, deliberately:
 * publishing is the Pulse's shared step (specs/pulse), gated by
 * `data/config.json`'s publish flag, and during the build phase it prints one
 * skip line.
 *
 * The measured form of that claim, rather than the intended one: no source
 * file under `loop/` contains the string `push` as a quoted argument anywhere,
 * which is what portability.test.mjs asserts by reading the files. Prose about
 * pushing is not a code path, and a comment saying "this never pushes" is not
 * evidence that it never pushes.
 */

import { execFileSync, spawnSync } from 'node:child_process';

function run(repo, args, opts = {}) {
  return execFileSync('git', ['-C', repo, ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...opts,
  });
}

export function git(repo, args, opts = {}) {
  return run(repo, args, opts).toString();
}

/** Non-throwing variant: returns { ok, stdout, stderr, status }. */
export function gitTry(repo, args) {
  const r = spawnSync('git', ['-C', repo, ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    ok: r.status === 0,
    status: r.status,
    stdout: (r.stdout ?? '').toString(),
    stderr: (r.stderr ?? '').toString(),
  };
}

export function headSha(repo) {
  return git(repo, ['rev-parse', 'HEAD']).trim();
}

export function currentBranch(repo) {
  return git(repo, ['rev-parse', '--abbrev-ref', 'HEAD']).trim();
}

/** Every local branch under `job/`. Never consults a remote. */
export function jobBranches(repo) {
  const out = gitTry(repo, ['for-each-ref', '--format=%(refname:short)%09%(committerdate:iso-strict)', 'refs/heads/job/']);
  if (!out.ok) return [];
  return out.stdout
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [name, date] = l.split('\t');
      return { branch: name, id: name.slice('job/'.length), committed: date };
    });
}

export function branchExists(repo, branch) {
  return gitTry(repo, ['show-ref', '--verify', '--quiet', `refs/heads/${branch}`]).ok;
}

/**
 * Create a worktree for a job branch. Worktrees live outside the repository
 * (see paths.mjs) and are scratch: everything resumption needs is committed
 * to the branch.
 */
export function addWorktree(repo, dir, branch, { create = false, base = 'HEAD', detach = false } = {}) {
  // Prune first, because the caller's `rmSync` is not enough on its own. Every
  // call site deletes `dir` before calling this, but deleting the DIRECTORY does
  // not remove the admin entry under `.git/worktrees/` — and git answers from
  // that entry, not from the filesystem. Measured in a throwaway repository on
  // git 2.40.0.windows.1: with the directory gone and the entry unpruned,
  //     git worktree add --detach <same path> <branch>
  // exits 128 with
  //     fatal: '<path>' is a missing but already registered worktree;
  //     use 'add -f' to override, or 'prune' or 'remove' to clear
  // and one `worktree prune` at that point makes the identical call succeed.
  // Since this function throws on a non-ok result, that aborts the whole run.
  //
  // The state only arises from a run KILLED at the wall-clock cap after a failed
  // `worktree remove` — a run that reaches cleanup prunes on its way out
  // (`run.mjs`) — which is exactly why it belongs here: the next run is the one
  // that pays, and it is a different process from the one that left the mess.
  // Prune is the narrow tool for it rather than `add -f`: it removes only
  // registrations whose directory is already gone and cannot disturb a live
  // worktree, where `-f` would override a genuine collision with one.
  gitTry(repo, ['worktree', 'prune']);
  // `detach` matters for the reviewer: git refuses two worktrees on one branch,
  // and a detached checkout is the stronger arrangement anyway — the reviewer
  // physically cannot move the branch it is reviewing.
  const args = create
    ? ['worktree', 'add', '-b', branch, dir, base]
    : detach
      ? ['worktree', 'add', '--detach', dir, branch]
      : ['worktree', 'add', dir, branch];
  const r = gitTry(repo, args);
  if (!r.ok) throw new Error(`git worktree add failed: ${r.stderr.trim() || r.stdout.trim()}`);
  return dir;
}

/** @returns {{ok: true} | {ok: false, reason: string}} */
export function removeWorktree(repo, dir) {
  const removal = gitTry(repo, ['worktree', 'remove', dir]);
  gitTry(repo, ['worktree', 'prune']);
  if (!removal.ok) {
    return {
      ok: false,
      reason: removal.stderr.trim() || removal.stdout.trim() || 'git worktree remove failed',
    };
  }
  return { ok: true };
}

/**
 * Commit whatever is in a worktree. Called by the loop after the executor
 * returns — including after a kill — so that the branch, not the scratch
 * directory, holds the partial work.
 *
 * `add -A` is safe here and only here: a worktree has its own index
 * (`.git/worktrees/<name>/index`), so this never touches the main working
 * tree or its index.
 */
export function commitAll(repo, dir, message, { exclude = [] } = {}) {
  for (const p of exclude) gitTry(dir, ['rm', '--cached', '-r', '--ignore-unmatch', '--quiet', p]);
  const st = gitTry(dir, ['status', '--porcelain']);
  gitTry(dir, ['add', '-A']);
  for (const p of exclude) gitTry(dir, ['reset', '--quiet', 'HEAD', '--', p]);
  const staged = gitTry(dir, ['diff', '--cached', '--name-only']).stdout.trim();
  if (!staged) return { committed: false, dirty: st.stdout.trim() };
  const r = gitTry(dir, ['commit', '--no-verify', '-m', message]);
  if (!r.ok) throw new Error(`git commit failed: ${r.stderr.trim() || r.stdout.trim()}`);
  return { committed: true, sha: headSha(dir) };
}

/**
 * Retry a READ-ONLY git call once after a short pause, and when it fails
 * twice, throw with the child's stderr appended to the message.
 *
 * Twice a run died right after its runner returned, on
 * `git diff --name-status <base>...<branch>` — "Command failed", nothing else
 * — and the identical command succeeded ninety seconds later (addictedtoai-vd5y:
 * j-20260906-18 on 2026-09-06, j-20260907-11 on 2026-09-07). The cause is not
 * known and the log could not say, because execFileSync puts only the command
 * line in `message`. A read has no side effect, so one retry costs nothing and
 * carries the run to review; the stderr is what the next reader needs when it
 * fails anyway. Reserved for reads: a retried WRITE could commit twice.
 */
export function retryOnce(fn, { sleepMs = 2000, onRetry } = {}) {
  try {
    return fn();
  } catch (first) {
    if (onRetry) onRetry(first);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, sleepMs);
    try {
      return fn();
    } catch (second) {
      const stderr = second && second.stderr ? String(second.stderr).trim() : '';
      if (stderr && !String(second.message).includes(stderr)) {
        second.message = `${second.message}\n${stderr}`;
      }
      throw second;
    }
  }
}

const retryLog = (what) => (e) =>
  console.error(`git: ${what} failed once (${String(e && e.message).split('\n')[0]}); retrying in 2 s`);

/** The loop computes the diff itself, from branch state (specs/loop rule 5). */
export function diffAgainst(repo, base, head) {
  return retryOnce(() => git(repo, ['diff', '--no-color', `${base}...${head}`]), { onRetry: retryLog('diff') });
}

export function changedPaths(repo, base, head) {
  return retryOnce(() => git(repo, ['diff', '--name-only', `${base}...${head}`]), { onRetry: retryLog('diff --name-only') })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** `[{status, path}]` — status matters for the reserved-path check: deleting HOLD.md is itself a violation. */
export function changedPathsWithStatus(repo, base, head) {
  return retryOnce(() => git(repo, ['diff', '--name-status', `${base}...${head}`]), { onRetry: retryLog('diff --name-status') })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((l) => {
      const [status, ...rest] = l.split('\t');
      return { status: status[0], path: rest[rest.length - 1].replace(/\\/g, '/') };
    });
}

export function mergeBase(repo, a, b) {
  return git(repo, ['merge-base', a, b]).trim();
}

/**
 * Merge a job branch into the current branch, locally. `--no-ff` keeps the
 * job visible as a unit in the history the colophon links.
 */
export function mergeLocal(repo, branch, message) {
  const r = gitTry(repo, ['merge', '--no-ff', '--no-verify', '-m', message, branch]);
  if (!r.ok) {
    gitTry(repo, ['merge', '--abort']);
    return { ok: false, reason: r.stderr.trim() || r.stdout.trim() };
  }
  return { ok: true, sha: headSha(repo) };
}

export function deleteBranch(repo, branch) {
  return gitTry(repo, ['branch', '-D', branch]).ok;
}

export function shortSha(repo, rev = 'HEAD') {
  return git(repo, ['rev-parse', '--short', rev]).trim();
}
