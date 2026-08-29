/**
 * review.mjs — mandatory review (specs/review).
 *
 * Three things here are mechanisms rather than instructions, and that is the
 * whole design:
 *
 *  1. **No edit rights** is enforced by throwing the reviewer's tree away.
 *     The reviewer runs in a disposable worktree; whatever it changed there is
 *     discarded and the reviewed branch is asserted unchanged afterwards. An
 *     instruction not to edit would be an instruction; this is a mechanism.
 *  2. **Fresh context** is enforced by invoking a separate process with a
 *     brief that contains the diff and the checklist and nothing of the
 *     author's reasoning. The authoring run and the reviewing run are never
 *     the same session.
 *  3. **The quality question is asked**, not merely available: an `approve`
 *     with an empty `would-cite`, or one whose `would-cite` exactly duplicates
 *     an existing record's, is refused at merge. Neither check can compel
 *     judgment — a reviewer writing a fresh-but-vacuous sentence each time
 *     passes them, and specs/review accepts that explicitly. The field's job
 *     is to make the question asked.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { addWorktree, gitTry, headSha, removeWorktree } from './git.mjs';
import { runExecutor, jobLogPath } from './exec.mjs';
import { PROSE_TYPES } from './specs.mjs';
import { rejectionIndexText } from './proposals.mjs';
import { GROUND_RULES } from './brief.mjs';
import { REASONS, VERDICTS, parseVerdict, normalizeWouldCite } from './verdict.mjs';

/**
 * Reading a verdict record lives in `verdict.mjs` — a leaf module with no
 * dependency on git, worktrees or the executor — so the site build can share
 * the one parser without importing the Desk. Re-exported here because this is
 * where every caller already looks for it.
 */
export { REASONS, VERDICTS, parseVerdict, normalizeWouldCite };

const CHECKLISTS = {
  entry: [
    'Every cited fact has a reachable source, and the source says what the fact says. **Fetch it and confirm — do not assume.**',
    'Volatile values are transclusions or feed-bound, not literals.',
    'Aliases are sanely classed.',
    'Where there is prose, it adds something beyond the data.',
  ],
  tutorial: [
    'There is evidence the steps were actually executed — a transcript or reproduced outputs. **Plausibility is not verification.**',
    '`subjects`, `verified_against` and `verified_on` are complete and honest.',
    'Unexecuted steps are disclosed as unexecuted.',
    'Every perishable is declared.',
  ],
  post: [
    'Every external claim is source-checked by fetching the source yourself.',
    'The title and excerpt read against the body: does either claim more than the body proves?',
    'Company-conduct claims are held to the news-fact-checking standard.',
    'Dates are explicit.',
  ],
  education: [
    'No perishable literals.',
    'Prerequisites and the "after this you will understand" statement are honest.',
    'It beats the obvious alternative a reader would otherwise read.',
  ],
  directory: ['Spot-check the changed rows against their sources.'],
  machinery: [
    '**Run the changed check or script and confirm the claimed behaviour** — red before, green after where applicable.',
    'Every claim about what the change does is verified by executing it, not by reading it.',
    'Guard rails are tested by attempting what they forbid.',
  ],
};

const CHECKLIST_FOR_TYPE = {
  entry: 'entry',
  interpret: 'entry',
  verify: 'tutorial',
  tutorial: 'tutorial',
  post: 'post',
  education: 'education',
  repair: 'directory',
  prune: 'entry',
  machinery: 'machinery',
};

export function checklistFor(type) {
  return CHECKLISTS[CHECKLIST_FOR_TYPE[type] ?? 'entry'];
}

export function isProse(type) {
  return PROSE_TYPES.includes(type);
}

export function verdictPath(ctx, jobId, pass = 1) {
  return join(ctx.reviewsDir, pass === 1 ? `${jobId}.md` : `${jobId}.pass${pass}.md`);
}

/**
 * What the loop already ran on this branch, as the reviewer's brief states it.
 *
 * specs/review's machinery checklist tells a reviewer to "run the changed check
 * and confirm the claimed behaviour", which is right — and on job j-20260829-01
 * the reviewer read that as "run the suite", re-ran `npm test` and
 * `npm run build` that the loop's own gates had just run and passed on that
 * exact branch, and spent its whole run doing it. Nothing told it what had
 * already been verified. This does (beads addictedtoai-5z9).
 *
 * It states a MEASUREMENT — which scripts ran, on which commit, with which exit
 * status — and never a reassurance. A skipped gate is reported as skipped, in
 * the same place and just as plainly, because a brief that implies verification
 * which did not happen is worse than one that says nothing.
 *
 * @param {{ran: boolean, ok?: boolean, results?: Array, why?: string}|null|undefined} gates
 * @param {string} [sha] the commit the gates ran on
 */
export function gatesSection(gates, sha = '') {
  const on = sha ? ` on commit \`${sha.slice(0, 12)}\`` : '';
  if (!gates || gates.ran === false) {
    return `## What the loop has verified on this branch

**Nothing.** The loop did not run its gates this run${gates?.why ? ` (${gates.why})` : ''}, so
no mechanical check has been run on this diff at all. Run whatever you need to
judge it, and say in your notes what you ran and what you observed.
`;
  }
  const lines = (gates.results ?? []).map(
    (r) =>
      `- \`npm run ${r.script}\` — **${r.ok ? 'PASS' : `FAIL (exit ${r.status})`}**`,
  );
  return `## What the loop has already verified on this branch

The loop ran these itself, in this branch's own worktree, immediately before
this review${on} — the same commit the diff below was computed from:

${lines.join('\n') || '- (no gate ran)'}

**Do not re-run them.** They have run, on this branch, and their result is above.
A review on this loop once spent its entire run re-running exactly this suite,
formed its judgment, and ended before writing it down; the job was discarded and
every minute of it was lost. If a specific claim in the diff needs a check, run
**that** check — the one that would be red if the claim were false — and quote
what it printed. That is what the checklist asks for. Re-running the whole suite
is not that, and it is the one way this review can run out of time.
`;
}

/**
 * The reviewer's own run, stated: it has a cap, it gets one shot, and the record
 * is the only thing that survives it.
 */
export function runShapeSection({ capMinutes, mmSoFar }) {
  return `## How this run ends — read this before you start

This is a single non-interactive run under a **wall-clock cap of ${capMinutes} minutes**.
When you stop producing output, your run is over: there is no later turn, nothing
will wake you, and anything still running is killed with you. If you start a
long-running command, wait for it and read its output **in this same run** — never
end your turn intending to come back to it.${
    typeof mmSoFar === 'number'
      ? `\n\nThis job has already cost ${mmSoFar.toFixed(2)} model-minutes, and your minutes are added
to the same job. Spend them on judgment, not on repetition.`
      : ''
  }

**Write the verdict record the moment your judgment is formed, then keep checking
and rewrite it if it changes.** The record is the only output of this run that
exists afterwards. A judgment you formed and did not write down is, to the loop,
identical to no review at all: the merge is refused, the job is thrown away, and
everything spent on it is lost. Do not leave the writing until last.
`;
}

/**
 * Assemble the reviewer's brief: the diff and the checklist, and nothing of
 * the author's reasoning.
 */
export function assembleReviewBrief(
  ctx,
  { jobId, job, diffText, pass, findings, outPath, gates = null, sha = '', capMinutes = 0, mmSoFar },
) {
  const prose = isProse(job.type);
  const fromProposal = job.source === 'proposal';
  const rejection = fromProposal
    ? `\n## The rejection index\n\nThis job originated from a proposal. Part of your checklist is the judgment\nhalf of duplicate suppression: confirm this piece is not a differently-worded\nre-tread of an idea already rejected. The mechanical half — exact slug match —\nalready ran and passed. Fuzzy matching is guessing, so this half is yours.\n\n${rejectionIndexText(ctx)}\n`
    : '';

  return `# Review — job ${jobId} (${job.type})${pass > 1 ? `, delta review, pass ${pass}` : ''}

You are the reviewer. You have fresh context: you have not seen the author's
reasoning and you will not get it. You have the diff below and the checklist.
You have **no edit rights** — any change you make to this worktree is thrown
away, so do not try to fix anything. Your only accepted output is the verdict
record.

${runShapeSection({ capMinutes, mmSoFar })}
${gatesSection(gates, sha)}
${pass > 1 ? `## What this delta review covers\n\nThe previous verdict asked for revisions. Review **only what changed since
then**, against these findings:\n\n${findings}\n\nThis is the last pass. A second non-approval discards the job.\n` : ''}
## Your standing instruction

**For every claim about what something does, run the cheap direct check. For
every sourced claim, confirm the source supports it.** The defect class this
review exists to catch is the claim written from intent rather than
measurement — found repeatedly by skeptical readers on the previous version of
this site, and never once by an automated check.

## Checklist for this kind of work

${checklistFor(job.type).map((c) => `- ${c}`).join('\n')}
${rejection}
## The verdict

Return exactly one verdict: \`approve\`, \`revise\` (naming the required
changes), or \`reject\`. Give one or more reasons **from this closed list**:

${REASONS.map((r) => `- \`${r}\``).join('\n')}

\`not-worth-reading\` is a complete rejection reason in its own right. If a
factually clean draft is simply not worth a reader's time, say that plainly —
never dress it up as a manufactured factual objection. Verdicts are
categorical, never numeric.

${prose ? `**Required, non-empty: \`would-cite\`.** In your own words: who would link
this, and in what argument? An \`approve\` with this field blank, or with text
identical to another review record's, is refused at merge and you will be
asked to re-issue the verdict. Answer the question; do not fill the field.
` : ''}
## Write your verdict here

Write the verdict record to this exact absolute path — it is deliberately
**outside** the worktree you are reviewing:

\`${outPath.replace(/\\/g, '/')}\`

The file is markdown with YAML front matter:

\`\`\`
---
job: ${jobId}
verdict: approve            # or revise / reject
reasons: []                 # from the closed list above; required unless approve
would-cite: >-
  <your own-words answer: who would link this, and in what argument>
---

Free-form notes: what you checked, what you fetched, what you ran, and what
you observed. Quote the observed output for anything you ran.
\`\`\`

${GROUND_RULES}

## The diff under review

The loop computed this diff itself from the branch state; it is not the
author's account of what changed.

\`\`\`diff
${diffText.length > 200000 ? diffText.slice(0, 200000) + '\n... [diff truncated at 200 KB]' : diffText}
\`\`\`
`;
}

/**
 * Every other review record's `would-cite`, for the duplicate check.
 *
 * DEVIATION, recorded rather than hidden: records for the SAME job id are
 * excluded. specs/review says "any existing review record", which read
 * literally would refuse a delta review whose answer to "who would link this?"
 * is unchanged — and it should be unchanged, because it is the same piece. The
 * rule exists to stop one sentence being pasted across different pieces, and
 * that is what this implements.
 */
export function existingWouldCites(ctx, excludeJobId) {
  if (!existsSync(ctx.reviewsDir)) return [];
  const out = [];
  for (const name of readdirSync(ctx.reviewsDir)) {
    if (!name.endsWith('.md') || name === 'README.md') continue;
    if (excludeJobId && (name === `${excludeJobId}.md` || name.startsWith(`${excludeJobId}.pass`))) continue;
    let text;
    try {
      text = readFileSync(join(ctx.reviewsDir, name), 'utf8');
    } catch {
      continue;
    }
    const v = parseVerdict(text);
    if (v.wouldCite) out.push({ file: name, wouldCite: normalizeWouldCite(v.wouldCite) });
  }
  return out;
}

/**
 * The merge gate. Refuses without an `approve`; refuses an `approve` whose
 * `would-cite` is empty or duplicates an existing record's.
 *
 * @returns {{ok: boolean, reason?: string, verdict?: object}}
 */
export function mergeGate(ctx, { jobId, type, pass = 1 }) {
  const path = verdictPath(ctx, jobId, pass);
  if (!existsSync(path)) {
    return {
      ok: false,
      code: 'no-record',
      reason: `no reviewer verdict recorded at ${path}. Nothing model-written merges unreviewed.`,
    };
  }
  const v = parseVerdict(readFileSync(path, 'utf8'));
  if (!VERDICTS.includes(v.verdict)) {
    return {
      ok: false,
      code: 'malformed-verdict',
      reason: `the verdict record at ${path} does not carry one of ${VERDICTS.join(' / ')} (found ${JSON.stringify(v.verdict)}).`,
      verdict: v,
    };
  }
  if (v.verdict !== 'approve') {
    const bad = v.reasons.filter((r) => !REASONS.includes(r));
    return {
      ok: false,
      code: v.verdict,
      reason:
        `verdict is \`${v.verdict}\`${v.reasons.length ? ` for: ${v.reasons.join(', ')}` : ''}` +
        (bad.length ? ` (not from the closed reason list: ${bad.join(', ')})` : ''),
      verdict: v,
    };
  }
  if (isProse(type)) {
    if (!v.wouldCite) {
      return {
        ok: false,
        code: 'would-cite-empty',
        reason:
          `\`approve\` with an empty \`would-cite\` is not a valid verdict (specs/review). The ` +
          `quality question is asked, not merely available: who would link this, and in what ` +
          `argument? Re-issue the verdict with the field answered.`,
        verdict: v,
      };
    }
    const mine = normalizeWouldCite(v.wouldCite);
    const dup = existingWouldCites(ctx, jobId).find((e) => e.wouldCite === mine);
    if (dup) {
      return {
        ok: false,
        code: 'would-cite-duplicate',
        reason:
          `\`approve\` whose \`would-cite\` is exactly identical (after whitespace trimming) to ` +
          `the field in ${dup.file}. A recycled sentence is not an answer to the question.`,
        verdict: v,
      };
    }
  }
  return { ok: true, verdict: v, path };
}

/**
 * Run the reviewer, then discard everything it touched.
 *
 * @returns {Promise<{run: object, discarded: object, branchShaBefore: string,
 *                    branchShaAfter: string, recordWritten: boolean}>}
 */
export async function runReview(ctx, { jobId, job, branch, diffText, runner, capMinutes, pass = 1, findings = '', gates = null, mmSoFar }) {
  mkdirSync(ctx.reviewsDir, { recursive: true });
  const outPath = verdictPath(ctx, jobId, pass);
  const reviewDir = join(ctx.worktreeRoot, `${jobId}-review-${pass}`);
  rmSync(reviewDir, { recursive: true, force: true });
  mkdirSync(ctx.worktreeRoot, { recursive: true });

  const before = gitTry(ctx.repoRoot, ['rev-parse', branch]).stdout.trim();
  addWorktree(ctx.repoRoot, reviewDir, branch, { create: false, detach: true });

  // The gate report names the commit it ran on, and that commit is this one:
  // `before` is the branch head the review worktree was just checked out at and
  // the head the diff was computed from.
  const brief = assembleReviewBrief(ctx, {
    jobId,
    job,
    diffText,
    pass,
    findings,
    outPath,
    gates,
    sha: before,
    capMinutes,
    mmSoFar,
  });
  const run = await runExecutor({
    command: runner.command,
    cwd: reviewDir,
    promptText: brief,
    promptPath: join(ctx.worktreeRoot, `${jobId}-review-${pass}-brief.md`),
    timeoutMs: capMinutes * 60 * 1000,
    role: 'reviewer',
    jobId,
    logPath: jobLogPath(ctx.worktreeRoot, jobId, `review${pass}`),
  });

  // No edit rights, as a mechanism: throw the reviewer's tree away.
  const dirtyBefore = gitTry(reviewDir, ['status', '--porcelain']).stdout.trim();
  gitTry(reviewDir, ['reset', '--hard', 'HEAD']);
  gitTry(reviewDir, ['clean', '-fdx']);
  const dirtyAfter = gitTry(reviewDir, ['status', '--porcelain']).stdout.trim();
  removeWorktree(ctx.repoRoot, reviewDir);
  rmSync(reviewDir, { recursive: true, force: true });
  const after = gitTry(ctx.repoRoot, ['rev-parse', branch]).stdout.trim();

  return {
    run,
    outPath,
    recordWritten: existsSync(outPath),
    discarded: { dirtyBefore, dirtyAfter, discardedAnything: Boolean(dirtyBefore) },
    branchShaBefore: before,
    branchShaAfter: after,
    branchUnchanged: before === after,
  };
}

/**
 * ---------------------------------------------------------------------------
 * WHAT A RECORD SAYS IT REVIEWED (beads addictedtoai-sge).
 *
 * A loop-written record is named `<job-id>.md` and its front matter carries
 * `job: j-2026...`. That names the JOB. `lib/reviews.mjs` joins a piece of
 * content to its record by the piece's own identity — its URL-derived name,
 * three alternates, or a front-matter field naming the file — and a job id is
 * none of those, so from the build every loop-written record was an orphan and
 * every loop-written entry looked unreviewed. Measured on 2026-08-29: 45
 * records, 2 orphans, one of them `j-20260829-01.md`.
 *
 * That mattered more than it sounds. The build treats "no record the join
 * recognises" as *not evaluable* rather than *not approved*, precisely so a
 * naming mismatch cannot silently de-index approved work — so the count of
 * unjoinable bodies was set to grow by one for every entry the loop ever
 * merged, and a genuinely unreviewed direct commit hides inside a growing
 * expected number.
 *
 * The merge step is the only place that knows both halves, so it writes the
 * declaration: the content files that ACTUALLY MERGED, into the record that
 * approved them. Not the files the job touched — the files that landed, after
 * the merge succeeded, which is the claim the record can support.
 * ---------------------------------------------------------------------------
 */

/** Content files a review record can be joined to. Others cannot be, and are not claimed. */
export function joinableSubjects(changed) {
  const out = [];
  for (const c of changed ?? []) {
    const p = String(typeof c === 'string' ? c : (c?.path ?? '')).replace(/\\/g, '/');
    // A deletion is not a piece anything can review; `D` is the only status
    // whose path does not exist on main after the merge.
    if (typeof c === 'object' && c?.status === 'D') continue;
    if (!p.startsWith('content/') || !p.endsWith('.md')) continue;
    if (!out.includes(p)) out.push(p);
  }
  return out.sort();
}

/**
 * Write `subject:` into an existing verdict record, naming what it reviewed.
 *
 * The edit is deliberately surgical — the front-matter block is rewritten with
 * any prior `subject:` removed and one new key appended, and the reviewer's own
 * keys, its notes and its byte-for-byte `would-cite` are left exactly as they
 * were. Re-serialising the record through a YAML writer would reformat a
 * document a human reads as evidence, and the duplicate-`would-cite` check
 * compares that field after nothing but whitespace trimming.
 *
 * @returns {{ok: boolean, why?: string, subjects?: string[]}}
 */
export function writeRecordSubjects(path, subjects) {
  if (!subjects?.length) return { ok: false, why: 'no joinable content file merged' };
  if (!existsSync(path)) return { ok: false, why: `no record at ${path}` };
  const text = readFileSync(path, 'utf8');
  const m = /^(﻿?---[ \t]*\r?\n)([\s\S]*?)(\r?\n---[ \t]*(?:\r?\n|$))/.exec(text);
  if (!m) return { ok: false, why: 'the record has no YAML front-matter block to add a key to' };

  const eol = /\r\n/.test(m[1]) ? '\r\n' : '\n';
  // Drop a previous `subject:` key and any list items indented under it, so
  // re-running on the same record replaces rather than duplicates.
  const kept = [];
  let dropping = false;
  for (const raw of m[2].split(/\r?\n/)) {
    if (/^subject\s*:/.test(raw)) {
      dropping = true;
      continue;
    }
    if (dropping && /^\s*-\s+/.test(raw)) continue;
    if (dropping && raw.trim() === '') continue;
    dropping = false;
    kept.push(raw);
  }
  while (kept.length && kept[kept.length - 1].trim() === '') kept.pop();

  const block =
    subjects.length === 1
      ? `subject: ${JSON.stringify(subjects[0])}`
      : ['subject:', ...subjects.map((s) => `  - ${JSON.stringify(s)}`)].join(eol);
  const front = [...kept, block].join(eol);
  writeFileSync(path, `${m[1]}${front}${m[3]}${text.slice(m[0].length)}`, 'utf8');
  return { ok: true, subjects };
}

/** Used by the seed-review flow and by tests to write a record by hand. */
export function writeVerdictRecord(ctx, jobId, { verdict, reasons = [], wouldCite = '', notes = '', pass = 1, reviewer = '' }) {
  mkdirSync(ctx.reviewsDir, { recursive: true });
  const p = verdictPath(ctx, jobId, pass);
  const fm = [
    '---',
    `job: ${jobId}`,
    `verdict: ${verdict}`,
    `reasons: [${reasons.join(', ')}]`,
    `would-cite: ${JSON.stringify(wouldCite)}`,
    reviewer ? `reviewer: ${reviewer}` : null,
    `date: ${ctx.now().toISOString().slice(0, 10)}`,
    '---',
    '',
    notes,
    '',
  ]
    .filter((l) => l !== null)
    .join('\n');
  writeFileSync(p, fm, 'utf8');
  return p;
}

export function reviewRecordCount(ctx) {
  if (!existsSync(ctx.reviewsDir)) return 0;
  return readdirSync(ctx.reviewsDir).filter((f) => f.endsWith('.md') && f !== 'README.md').length;
}
