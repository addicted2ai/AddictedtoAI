/**
 * paths.mjs — where everything lives, and how a test points it somewhere else.
 *
 * Every other module in `loop/` takes a *context* rather than reading global
 * paths. That is what lets the whole Desk run against a throwaway repository
 * in a temp directory during tests, and against `D:/AddictedtoAI` in
 * production, with the same code path.
 */

import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url)); // <repo>/loop/lib
export const DEFAULT_REPO_ROOT = resolve(HERE, '..', '..');

/**
 * Build the context every loop module takes.
 *
 * @param {object} [opts]
 * @param {string} [opts.repoRoot]      repository root
 * @param {string} [opts.worktreeRoot]  where job worktrees are created. Kept
 *   OUTSIDE the repository on purpose: `.gitignore` is owned by the site
 *   scaffold and anchors its build-output patterns to the root, so a job
 *   worktree inside the tree would be picked up by the build and by
 *   `git status`. Worktrees are scratch — the *branch* carries everything
 *   resumption needs (specs/loop).
 *
 *   BESIDE THE REPOSITORY, NOT IN `tmpdir()`, and the difference is a build
 *   gate that works versus one that cannot pass (beads addictedtoai-vv3h).
 *   `node_modules` is shared into each worktree by a junction pointing at the
 *   repository's copy. When the worktree is on a DIFFERENT WINDOWS DRIVE from
 *   that copy — `tmpdir()` is on `C:` here, the repository on `D:` — Next
 *   builds its client entry by taking `path.relative(worktreeDir,
 *   require.resolve('next/dist/client/next.js'))`. Node resolves through the
 *   junction to the real `D:` path, `path.relative` cannot express a path
 *   across drive letters so it returns that absolute path unchanged, and Next
 *   prefixes it with `./`. The build then fails on
 *   `Can't resolve './D:/.../node_modules/next/dist/client/next.js'`.
 *
 *   MEASURED, one branch, one machine, one minute apart: the same job branch
 *   built in a `C:` worktree FAILS and in a `D:` worktree PASSES. Keeping the
 *   worktree on the repository's own drive removes the whole class, and on
 *   POSIX it additionally keeps worktrees off a possibly-separate `/tmp`
 *   filesystem. `LOOP_WORKTREE_ROOT` still overrides.
 * @param {(s: string) => void} [opts.log]
 */
export function makeContext(opts = {}) {
  const repoRoot = resolve(opts.repoRoot ?? DEFAULT_REPO_ROOT);
  const lines = [];
  const log =
    opts.log ??
    ((s) => {
      process.stdout.write(s + '\n');
    });
  return {
    repoRoot,
    worktreeRoot: resolve(
      opts.worktreeRoot ??
        process.env.LOOP_WORKTREE_ROOT ??
        join(dirname(repoRoot), 'addictedtoai-worktrees'),
    ),
    runnersPath: opts.runnersPath ?? join(repoRoot, 'runners.yml'),
    configPath: opts.configPath ?? join(repoRoot, 'data', 'config.json'),
    ledgerPath: opts.ledgerPath ?? join(repoRoot, 'data', 'ledger.jsonl'),
    directivesPath: opts.directivesPath ?? join(repoRoot, 'DIRECTIVES.md'),
    queuePath: opts.queuePath ?? join(repoRoot, 'data', 'derived', 'queue.json'),
    freshnessPath:
      opts.freshnessPath ?? join(repoRoot, 'data', 'derived', 'freshness.json'),
    proposalsDir: opts.proposalsDir ?? join(repoRoot, 'data', 'proposals'),
    rejectedDir:
      opts.rejectedDir ?? join(repoRoot, 'data', 'proposals', 'rejected'),
    reviewsDir: opts.reviewsDir ?? join(repoRoot, 'data', 'reviews'),
    // Findings a reviewer carried but did not block on (beads addictedtoai-2bo,
    // loop/lib/carry.mjs). One file per entry; a file's PRESENCE is what a
    // Pulse run reads into the queue (`pulse/lib/queue.mjs`), and the fixing
    // job's own diff deletes the file — that is what retires the item, the same
    // "leaves the queue the moment the underlying state is fixed" rule every
    // other queue class already follows, with no extra merge-step bookkeeping.
    carriedDir: opts.carriedDir ?? join(repoRoot, 'data', 'carried'),
    conformancePath:
      opts.conformancePath ?? join(repoRoot, 'data', 'conformance.json'),
    blogDir: opts.blogDir ?? join(repoRoot, 'content', 'blog'),
    holdPath: opts.holdPath ?? join(repoRoot, 'HOLD.md'),
    stopPath: opts.stopPath ?? join(repoRoot, 'STOP'),
    /** injectable clock, so "3 days old" is testable without waiting 3 days */
    now: opts.now ?? (() => new Date()),
    log: (s) => {
      lines.push(s);
      log(s);
    },
    lines,
  };
}
