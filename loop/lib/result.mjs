/**
 * result.mjs — the executor result protocol (specs/loop).
 *
 * "Leaves its output as files" needs a signal channel, or the loop cannot
 * distinguish blocked from guessing from interrupted. The channel is one
 * file, `RESULT.md`, at the worktree root, whose FIRST LINE is exactly one of:
 *
 *     done
 *     blocked: <one-line reason>
 *     capacity
 *
 * Everything else in the file is free-form notes the loop does not parse.
 *
 * Two rules matter more than they look:
 *
 *  1. Absent or malformed after the process exited or was killed is
 *     `interrupted` — NOT `failed`. Nothing was rejected; we simply do not
 *     know. The branch is kept and no retry is consumed.
 *  2. A well-formed `blocked:` with a clean tree is a SUCCESSFUL honest
 *     outcome. This is the whole mechanism by which "reports blocked rather
 *     than guessing" is observed rather than hoped for: it is a file on disk,
 *     read from the filesystem, never a status value the loop was handed.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const RESULT_FILENAME = 'RESULT.md';

/** The exact instruction every brief carries. Kept here so brief and parser cannot drift. */
export const RESULT_PROTOCOL_INSTRUCTION = `## How to end (required)

End by writing a file named \`RESULT.md\` at the root of this worktree. Its
**first line** must be exactly one of:

- \`done\` — you attempted the outcome; the diff is your claim.
- \`blocked: <one-line reason>\` — the task could not be done honestly
  (missing information, an acceptance check that cannot be met, a forbidden
  action). This is a **successful** outcome, recorded as such. Reporting
  blocked is always better than producing something plausible.
- \`capacity\` — you observed your own provider's limit.

Everything after the first line is free-form notes; nothing reads them
mechanically. Write no other status anywhere: this file is the only channel.
If \`RESULT.md\` is absent or its first line is not one of the three forms, the
run is recorded as interrupted — the work is kept on the branch and resumed
later, and no retry is consumed.`;

const BLOCKED_RE = /^blocked:\s*(\S.*)$/;

/**
 * Read and classify RESULT.md from the filesystem. Never accepts a status
 * from anywhere else.
 *
 * @param {string} worktree
 * @returns {{status: 'done'|'blocked'|'capacity'|'interrupted',
 *            reason: string|null, malformed: boolean, present: boolean,
 *            firstLine: string|null, text: string|null, why: string}}
 */
export function readResult(worktree) {
  const path = join(worktree, RESULT_FILENAME);
  if (!existsSync(path)) {
    return {
      status: 'interrupted',
      reason: null,
      malformed: false,
      present: false,
      firstLine: null,
      text: null,
      why: `${RESULT_FILENAME} is absent`,
    };
  }
  const text = readFileSync(path, 'utf8');
  const firstLine = text.split(/\r?\n/, 1)[0].trim();
  if (firstLine === 'done') {
    return { status: 'done', reason: null, malformed: false, present: true, firstLine, text, why: 'first line is `done`' };
  }
  if (firstLine === 'capacity') {
    return { status: 'capacity', reason: null, malformed: false, present: true, firstLine, text, why: 'first line is `capacity`' };
  }
  const m = BLOCKED_RE.exec(firstLine);
  if (m) {
    return {
      status: 'blocked',
      reason: m[1].trim(),
      malformed: false,
      present: true,
      firstLine,
      text,
      why: 'first line is a well-formed `blocked:` line',
    };
  }
  return {
    status: 'interrupted',
    reason: null,
    malformed: true,
    present: true,
    firstLine,
    text,
    why: `${RESULT_FILENAME} first line is malformed: ${JSON.stringify(firstLine.slice(0, 120))}`,
  };
}

/**
 * Combine the file's verdict with what the process did.
 *
 * Precedence, and why:
 *  - A runner's declared `capacity_stderr_pattern` wins over an absent file:
 *    the provider said so in its own words, which is better evidence than
 *    silence. It does NOT override an explicit `done`/`blocked` — if the
 *    executor finished and said something, that is what happened.
 *  - Killed at the cap with a well-formed file still honours the file: work
 *    that reported itself before the axe fell reported itself.
 *
 * @param {object} run   result of runExecutor(): { killed, code, stderr }
 * @param {object} runner  the runners.yml entry
 */
export function classifyRun(run, fileResult, runner) {
  const pattern = runner?.capacity_stderr_pattern;
  const stderrSaysCapacity =
    Boolean(pattern) && new RegExp(pattern, 'i').test(run.stderr ?? '');

  if (fileResult.status === 'done' || fileResult.status === 'blocked') {
    return {
      status: fileResult.status,
      reason: fileResult.reason,
      evidence: fileResult.why,
    };
  }
  if (fileResult.status === 'capacity') {
    return { status: 'capacity', reason: null, evidence: fileResult.why };
  }
  if (stderrSaysCapacity) {
    return {
      status: 'capacity',
      reason: null,
      evidence:
        `${fileResult.why}; the runner's declared capacity_stderr_pattern matched its stderr`,
    };
  }
  return {
    status: 'interrupted',
    reason: null,
    evidence:
      fileResult.why +
      (run.killed ? ' and the executor was killed at its wall-clock cap' : ` and the executor exited with code ${run.code}`),
  };
}
