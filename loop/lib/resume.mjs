/**
 * resume.mjs — resumable branches (specs/loop).
 *
 * "Job identity and resumption are mechanical, not remembered." The branch
 * carries everything resumption needs: the committed `.job/brief.md` plus
 * whatever the interrupted run committed. Nothing is recalled from a session,
 * and resumption consumes no retry.
 *
 * At the start of every run, BEFORE the three work sources are consulted.
 */

import { existsSync } from 'node:fs';
import { gitTry, jobBranches, mergeBase } from './git.mjs';
import { RESUMABLE_MAX_AGE_DAYS } from './config.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;

/** The oldest commit on the branch that is not on `base` — when the job started. */
function branchStartedAt(repo, branch, base) {
  const mb = (() => {
    try {
      return mergeBase(repo, base, branch);
    } catch {
      return null;
    }
  })();
  const range = mb ? `${mb}..${branch}` : branch;
  const r = gitTry(repo, ['log', '--format=%cI', range]);
  const dates = r.stdout.split('\n').map((s) => s.trim()).filter(Boolean);
  return dates.length ? dates[dates.length - 1] : null;
}

export function hasCommittedBrief(repo, branch) {
  // execFile, not a shell: MSYS never sees the `rev:path` argument, which in
  // Git Bash silently returns zero bytes with exit 0 (CLAUDE.md's Windows note).
  return gitTry(repo, ['cat-file', '-e', `${branch}:.job/brief.md`]).ok;
}

export function readCommittedBrief(repo, branch) {
  const r = gitTry(repo, ['show', `${branch}:.job/brief.md`]);
  return r.ok ? r.stdout : null;
}

/**
 * Classify every `job/*` branch.
 *
 * @returns {{resumable: Array, abandonable: Array, other: Array}}
 */
export function scanJobBranches(ctx, { ledger, base = 'main' } = {}) {
  const now = ctx.now();
  const lastLineFor = (id) => {
    const lines = ledger.filter((l) => l.id === id);
    return lines.length ? lines[lines.length - 1] : null;
  };

  const resumable = [];
  const abandonable = [];
  const other = [];

  for (const b of jobBranches(ctx.repoRoot)) {
    const last = lastLineFor(b.id);
    const startedAt = branchStartedAt(ctx.repoRoot, b.branch, base) ?? b.committed;
    const ageDays = startedAt ? (now.getTime() - Date.parse(startedAt)) / DAY_MS : 0;
    const briefPresent = hasCommittedBrief(ctx.repoRoot, b.branch);

    // Extension, recorded rather than hidden: specs/loop defines resumable by
    // the branch's most recent LEDGER line, which leaves a branch created just
    // before a crash — brief committed, no line yet — neither resumable nor
    // abandonable, i.e. accumulating silently, which is the exact thing the
    // 14-day rule exists to prevent. A branch with a committed brief and no
    // ledger line at all is treated as interrupted.
    const isResumable =
      (last && (last.outcome === 'interrupted' || last.outcome === 'capacity')) ||
      (!last && briefPresent);

    const entry = {
      ...b,
      last,
      startedAt,
      ageDays,
      briefPresent,
      reason: last ? `last ledger line is \`${last.outcome}\`` : 'no ledger line, but a brief is committed',
    };
    if (!isResumable) {
      other.push(entry);
      continue;
    }
    if (ageDays > RESUMABLE_MAX_AGE_DAYS) abandonable.push(entry);
    else resumable.push(entry);
  }

  const byAge = (a, b) => b.ageDays - a.ageDays; // oldest first
  resumable.sort(byAge);
  abandonable.sort(byAge);
  return { resumable, abandonable, other };
}
