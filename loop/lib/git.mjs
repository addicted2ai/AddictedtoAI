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

export function removeWorktree(repo, dir) {
  gitTry(repo, ['worktree', 'remove', '--force', dir]);
  gitTry(repo, ['worktree', 'prune']);
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

/** The loop computes the diff itself, from branch state (specs/loop rule 5). */
export function diffAgainst(repo, base, head) {
  return git(repo, ['diff', '--no-color', `${base}...${head}`]);
}

export function changedPaths(repo, base, head) {
  return git(repo, ['diff', '--name-only', `${base}...${head}`])
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** `[{status, path}]` — status matters for the reserved-path check: deleting HOLD.md is itself a violation. */
export function changedPathsWithStatus(repo, base, head) {
  return git(repo, ['diff', '--name-status', `${base}...${head}`])
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
