/**
 * breakers.mjs — the four breakers, and only the four (specs/loop).
 *
 * Each writes `HOLD.md` at the repository root with its reason and stops the
 * Desk. `HOLD.md` is the loop's self-halt for things needing the maintainer;
 * `STOP` is the maintainer's brake. THE LOOP MUST NOT REMOVE EITHER — there is
 * no function in this file that deletes them, deliberately.
 *
 * "No other condition halts the loop": capacity exhaustion pauses a lane, an
 * empty queue ends a run normally, and a `blocked:` result is a success. Each
 * of those is a place a less careful design would have added a fifth breaker.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { consecutiveFailures } from './budget.mjs';
import { RESERVED_PATHS } from './brief.mjs';

export const BREAKERS = Object.freeze({
  CONSECUTIVE_FAILURES: 'breaker-1-three-consecutive-failures',
  BUILD_OR_DEPLOY_RED: 'breaker-2-build-or-deploy-red',
  REVIEW_BYPASS: 'breaker-3-review-bypass-attempt',
  RESERVED_PATH: 'breaker-4-reserved-path-edit-attempt',
});

/** The loop refuses to start while either file exists. */
export function startGate(ctx) {
  if (existsSync(ctx.stopPath)) {
    return {
      ok: false,
      why: `STOP exists at ${ctx.stopPath} — the maintainer's brake. The Desk does not start, and does not remove it.`,
    };
  }
  if (existsSync(ctx.holdPath)) {
    let first = '';
    try {
      first = readFileSync(ctx.holdPath, 'utf8').split('\n').slice(0, 6).join('\n');
    } catch {
      /* unreadable is still a hold */
    }
    return {
      ok: false,
      why: `HOLD.md exists at ${ctx.holdPath} — the Desk is halted until the maintainer clears it. The loop does not remove it.\n${first}`,
    };
  }
  return { ok: true };
}

export function writeHold(ctx, breaker, reason, detail = '') {
  const body =
    `# HOLD — the Desk has stopped\n\n` +
    `- **breaker**: \`${breaker}\`\n` +
    `- **written**: ${ctx.now().toISOString()}\n\n` +
    `## Reason\n\n${reason}\n\n` +
    (detail ? `## Detail\n\n${detail}\n\n` : '') +
    `## Clearing it\n\nThis file is the maintainer's to remove, and only the maintainer's. The loop\n` +
    `does not delete it and will refuse to start while it exists. The Pulse keeps\n` +
    `running${breaker === BREAKERS.BUILD_OR_DEPLOY_RED ? ', except for its deploy step' : ''}.\n`;
  writeFileSync(ctx.holdPath, body, 'utf8');
  return { breaker, reason, path: ctx.holdPath };
}

/** Breaker 1: three consecutive `failed`/`discarded` of the same type. */
export function checkConsecutiveFailures(ctx, ledger, type) {
  const n = consecutiveFailures(ledger, type);
  if (n < 3) return { tripped: false, count: n };
  const reason =
    `three consecutive ${type} jobs ended failed or discarded (${n} in a row, counting only ` +
    `\`failed\` and \`discarded\` — blocked, interrupted, capacity and abandoned outcomes are ` +
    `not failures and do not count). Something about ${type} work is broken in a way retrying ` +
    `will not fix.`;
  return { tripped: true, count: n, ...writeHold(ctx, BREAKERS.CONSECUTIVE_FAILURES, reason) };
}

/** Breaker 2: the published site failing to build or deploy. */
export function checkBuildRed(ctx, { ok, output = '' }) {
  if (ok) return { tripped: false };
  return {
    tripped: true,
    ...writeHold(
      ctx,
      BREAKERS.BUILD_OR_DEPLOY_RED,
      'the site failed to build after a merge, so the published site cannot be trusted to rebuild.',
      output.slice(-4000),
    ),
  };
}

/** Breaker 3: any attempt to publish work that skipped review. */
export function checkReviewBypass(ctx, detail) {
  return {
    tripped: true,
    ...writeHold(
      ctx,
      BREAKERS.REVIEW_BYPASS,
      'an attempt was made to merge or publish work without a recorded reviewer verdict. ' +
        'Nothing model-written publishes unreviewed; a bypass is not a bug to route around.',
      detail,
    ),
  };
}

/**
 * Breaker 4: any attempted edit to a reserved path. The list is exactly:
 * `openspec/specs/`, `data/config.json`, `runners.yml`, `STOP`, and removal of
 * `HOLD.md` by the loop itself.
 */
export function reservedPathViolations(entries) {
  const out = [];
  for (const e of entries) {
    const p = e.path.replace(/\\/g, '/');
    const where = e.where ? { where: e.where } : {};
    for (const reserved of RESERVED_PATHS) {
      if (reserved.endsWith('/') ? p.startsWith(reserved) : p === reserved) {
        out.push({ path: p, status: e.status, reserved, ...where });
      }
    }
    if (p === 'HOLD.md' && e.status === 'D') {
      out.push({ path: p, status: e.status, reserved: 'removal of HOLD.md', ...where });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// BREAKER 4'S FILESYSTEM COMPANION — the half a branch diff cannot see.
//
// `reservedPathViolations` reads entries from a BRANCH DIFF, and both brakes
// are now gitignored (beads addictedtoai-ufu). An ignored file is never staged
// by `commitAll`'s `add -A`, so it never reaches a diff, so two of breaker 4's
// five clauses were reading a channel the file can no longer travel on:
//
//   • `STOP` — went blind when the ignore lines landed (addictedtoai-59q).
//   • removal of `HOLD.md` — has NEVER fired, because `HOLD.md` has been
//     untracked its whole life and `git diff --name-status` only reports
//     tracked files (addictedtoai-ut1). It still fires for a `HOLD.md` that was
//     tracked in the base, which is why the clause above is kept, not deleted.
//
// MEASURED before this companion existed, on a real job branch in a fixture
// carrying the working repository's own ignore rules:
//
//   route A (job writes STOP into its worktree)
//     branch diff: [{"A",".job/brief.md"},{"A","site-note.md"}]  breaker 4: no
//   route E (job edits runners.yml — the clause that always worked)
//     branch diff: [{"A",".job/brief.md"},{"M","runners.yml"}]   breaker 4: YES
//
// The repair asks the filesystem instead, and hands its answers to the SAME
// `reservedPathViolations` so there is one definition of a violation, not two.
//
// WHAT IS DELIBERATELY NOT HERE: a `HOLD.md` a job CREATES. specs/loop says the
// reserved paths are "exactly ... `STOP`, and removal of `HOLD.md`" — creation
// is not on that list, and a fifth reserved path is the spec's to add, not this
// file's. It is surfaced as a notice instead (filed as its own beads issue).
// ---------------------------------------------------------------------------

/** The two brakes, by their repository-root-relative names. */
export const BRAKE_FILES = Object.freeze(['STOP', 'HOLD.md']);

/**
 * Which brakes exist at the repository root right now.
 *
 * Taken immediately BEFORE an executor is invoked and compared immediately
 * after, so the window the comparison covers is exactly the window a job can
 * act in. A whole-job snapshot would be weaker: `startGate` refuses to start
 * while either file exists, so a job-start snapshot is always `false/false` and
 * the disappearance test is vacuous. Per invocation it is not — a hold or a
 * brake written by the maintainer while the review is running is present when
 * the revision run starts, and gone if that run removes it.
 *
 * The limit, stated rather than papered over: two points cannot see a file that
 * appeared AND vanished inside one invocation. Catching that needs a watcher,
 * which is a different mechanism and a different cost.
 */
export function brakeState(ctx) {
  return { STOP: existsSync(ctx.stopPath), 'HOLD.md': existsSync(ctx.holdPath) };
}

/**
 * Scan the filesystem for brake violations, in `changedPathsWithStatus()` shape
 * so `reservedPathViolations` judges them by the same rules as a real diff.
 *
 * @param {object} ctx
 * @param {object} o
 * @param {string|null} [o.worktree] the job worktree, checked for a forged brake
 * @param {object|null} [o.before]   a `brakeState()` taken before the invocation
 * @returns {{entries: Array<{status: string, path: string, where: string}>, notices: string[]}}
 */
export function brakeScan(ctx, { worktree = null, before = null } = {}) {
  const entries = [];
  const notices = [];
  if (worktree) {
    // A `STOP` in the job worktree is the maintainer's brake, written by a job.
    // It cannot reach the repository root any more — it is ignored, so it is
    // never committed and never merged — but the ATTEMPT is what breaker 4 is
    // for, and the attempt is what stopped being visible.
    if (existsSync(join(worktree, 'STOP'))) {
      entries.push({ status: 'A', path: 'STOP', where: 'the job worktree' });
    }
    if (existsSync(join(worktree, 'HOLD.md'))) {
      notices.push(
        'the job left a `HOLD.md` at the root of its worktree. It is gitignored, so it was ' +
          'never committed and never merged, and creating one is not among the reserved paths ' +
          'specs/loop names — but nothing in a job should be writing the Desk\'s own halt.',
      );
    }
  }
  if (before) {
    const after = brakeState(ctx);
    for (const name of BRAKE_FILES) {
      if (before[name] && !after[name]) {
        entries.push({ status: 'D', path: name, where: 'the repository root' });
      }
    }
  }
  return { entries, notices };
}

export function checkReservedPaths(ctx, entries, jobId) {
  const violations = reservedPathViolations(entries);
  if (violations.length === 0) return { tripped: false, violations };
  const reason =
    `job ${jobId} changed reserved path(s): ` +
    violations
      .map(
        (v) =>
          `\`${v.path}\` (${v.status}, reserved as ${v.reserved}${v.where ? `, found in ${v.where}` : ''})`,
      )
      .join(', ') +
    `. The maintainer edits these freely; no job may.`;
  return {
    tripped: true,
    violations,
    ...writeHold(ctx, BREAKERS.RESERVED_PATH, reason),
  };
}
