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
import matter from 'gray-matter';
import { addWorktree, gitTry, headSha, removeWorktree } from './git.mjs';
import { runExecutor, jobLogPath } from './exec.mjs';
import { PROSE_TYPES } from './specs.mjs';
import { rejectionIndexText } from './proposals.mjs';
import { GROUND_RULES } from './brief.mjs';

/** The closed reason list (specs/review). Verdicts are categorical, never numeric. */
export const REASONS = Object.freeze([
  'false-or-unsupported-claim',
  'intent-not-measurement',
  'not-worth-reading',
  'overclaiming-summary',
  'spec-violation',
  'broken-reference',
  'scope-violation',
]);

export const VERDICTS = Object.freeze(['approve', 'revise', 'reject']);

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
 * Assemble the reviewer's brief: the diff and the checklist, and nothing of
 * the author's reasoning.
 */
export function assembleReviewBrief(ctx, { jobId, job, diffText, pass, findings, outPath }) {
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

/** Parse a verdict record. Front matter first; a plain-text fallback keeps weaker runners usable. */
export function parseVerdict(text) {
  let data = {};
  let body = text;
  try {
    const p = matter(text);
    data = p.data ?? {};
    body = p.content ?? '';
  } catch {
    data = {};
  }
  let verdict = String(data.verdict ?? '').trim().toLowerCase();
  let wouldCite = data['would-cite'] ?? data.would_cite ?? data.wouldCite ?? '';
  let reasons = data.reasons ?? [];

  // The fallback scans the BODY only. Scanning the whole file would re-read the
  // front matter it just parsed and turn a deliberately empty `would-cite: ""`
  // into the two-character string `""` — a blank field passing the non-empty
  // check, which is precisely the failure this field exists to prevent.
  const hasFrontMatter = Object.keys(data).length > 0;
  const fallbackText = hasFrontMatter ? body : text;
  if (!verdict) {
    const m = /^\s*(?:\*\*)?verdict(?:\*\*)?\s*:\s*`?([a-z]+)`?/im.exec(fallbackText);
    if (m) verdict = m[1].toLowerCase();
  }
  if (!wouldCite && !hasFrontMatter) {
    const m = /^\s*(?:\*\*)?would[-_ ]cite(?:\*\*)?\s*:\s*(.+)$/im.exec(fallbackText);
    if (m) wouldCite = m[1];
  }
  if (!Array.isArray(reasons)) reasons = String(reasons).split(/[,\n]/);
  if (reasons.length === 0) {
    const m = /^\s*(?:\*\*)?reasons?(?:\*\*)?\s*:\s*(.+)$/im.exec(fallbackText);
    if (m) reasons = m[1].split(',');
  }
  reasons = reasons.map((r) => String(r).trim().replace(/^[`'"]|[`'"]$/g, '')).filter(Boolean);

  return {
    verdict,
    reasons,
    wouldCite: String(wouldCite ?? '').trim(),
    notes: body.trim(),
    raw: text,
  };
}

/** Normalisation for the duplicate check: "exactly identical (after whitespace trimming)". */
export function normalizeWouldCite(s) {
  return String(s ?? '').replace(/\r\n/g, '\n').trim();
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
export async function runReview(ctx, { jobId, job, branch, diffText, runner, capMinutes, pass = 1, findings = '' }) {
  mkdirSync(ctx.reviewsDir, { recursive: true });
  const outPath = verdictPath(ctx, jobId, pass);
  const reviewDir = join(ctx.worktreeRoot, `${jobId}-review-${pass}`);
  rmSync(reviewDir, { recursive: true, force: true });
  mkdirSync(ctx.worktreeRoot, { recursive: true });

  const before = gitTry(ctx.repoRoot, ['rev-parse', branch]).stdout.trim();
  addWorktree(ctx.repoRoot, reviewDir, branch, { create: false, detach: true });

  const brief = assembleReviewBrief(ctx, { jobId, job, diffText, pass, findings, outPath });
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
