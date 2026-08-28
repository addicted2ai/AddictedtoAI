/**
 * stamp.mjs — the build stamp (task 4.13, specs/site).
 *
 * *"The stamp is how deploy success is verified from outside: a fetch of the
 * live site reveals whether a deploy landed, with no hosting-provider API
 * involved. The stamp changes on every build; two builds from different
 * commits MUST carry different stamps."*
 *
 * Two moving parts, and both are needed:
 *   `built_at`  the build's UTC instant — changes on every build, which is
 *               what catches a deploy that never ran.
 *   `commit`    the short hash — changes with the content, which is what
 *               catches a deploy that ran against a stale checkout. A
 *               timestamp alone would advance on a rebuild of the same code
 *               and call it success.
 *
 * `git rev-parse` is spawned with `execFileSync`, not through a shell:
 * `git.exe` gets the arguments verbatim and no MSYS runtime rewrites them
 * (the Windows note in CLAUDE.md — `git show "rev:path"` silently returns
 * zero bytes under Git Bash for exactly this reason).
 *
 * A tree with no git at all still builds: the commit reads `unknown` and the
 * stamp still advances by its timestamp. A build that refused to run outside
 * a repository would be a worse failure than an unknown hash.
 */

import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, PUBLIC_DIR, writeJsonDeterministic, readJson } from './paths.mjs';

export const STATUS_FILE = join(PUBLIC_DIR, 'status.json');

export function shortCommit(cwd = ROOT) {
  try {
    return execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'unknown';
  }
}

export function isDirty(cwd = ROOT) {
  try {
    return (
      execFileSync('git', ['status', '--porcelain'], {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim().length > 0
    );
  } catch {
    return false;
  }
}

/** @returns {{built_at: string, commit: string, dirty: boolean, stamp: string}} */
export function buildStamp(opts = {}) {
  const now = opts.now ?? new Date();
  const commit = opts.commit ?? shortCommit(opts.cwd);
  const dirty = opts.dirty ?? isDirty(opts.cwd);
  const built_at = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
  return {
    built_at,
    commit,
    dirty,
    // The one string a human reads in the footer and a script greps for.
    stamp: `${built_at} · ${commit}${dirty ? '+dirty' : ''}`,
  };
}

/**
 * Write `public/status.json` so it lands at `/status.json` in the export.
 * Not `writeJsonDeterministic`'s usual promise of byte-identity: this file is
 * *supposed* to differ between builds — it is the only file in the tree whose
 * whole job is to change.
 */
export async function writeStatusFile(stamp, file = STATUS_FILE) {
  return writeJsonDeterministic(file, stamp);
}

/**
 * The stamp the *page footer* renders.
 *
 * It reads the file the prebuild step wrote rather than calling `buildStamp()`
 * again, and that is load-bearing: `next build` renders routes in worker
 * processes, each of which would otherwise compute its own `built_at` a few
 * seconds apart. The footer and `/status.json` would then disagree, and the
 * one check that proves a deploy landed would be comparing two different
 * numbers. One file, read by everyone.
 */
export async function readStatusFile(file = STATUS_FILE) {
  return readJson(file, null) ?? null;
}
