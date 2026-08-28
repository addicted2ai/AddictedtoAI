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
    for (const reserved of RESERVED_PATHS) {
      if (reserved.endsWith('/') ? p.startsWith(reserved) : p === reserved) {
        out.push({ path: p, status: e.status, reserved });
      }
    }
    if (p === 'HOLD.md' && e.status === 'D') {
      out.push({ path: p, status: e.status, reserved: 'removal of HOLD.md' });
    }
  }
  return out;
}

export function checkReservedPaths(ctx, entries, jobId) {
  const violations = reservedPathViolations(entries);
  if (violations.length === 0) return { tripped: false, violations };
  const reason =
    `job ${jobId} changed reserved path(s): ` +
    violations.map((v) => `\`${v.path}\` (${v.status}, reserved as ${v.reserved})`).join(', ') +
    `. The maintainer edits these freely; no job may.`;
  return {
    tripped: true,
    violations,
    ...writeHold(ctx, BREAKERS.RESERVED_PATH, reason),
  };
}
