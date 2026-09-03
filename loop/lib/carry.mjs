/**
 * carry.mjs — transcribing a reviewer's carried findings (beads addictedtoai-2bo).
 *
 * THE GAP THIS CLOSES. The loop had exactly two dispositions for a review
 * finding: it blocks the merge (`revise`/`reject`) and the author fixes it,
 * or it does not — and then it lives forever in `data/reviews/*.md`, which
 * nothing reads except the piece-to-record join, and that only cares about
 * the verdict and `would-cite`. `approve` was the end of the road for
 * everything the reviewer noticed but did not block on.
 *
 * Measured, not assumed: reading every `approve` record in `data/reviews/`
 * on 2026-08-31 found 30 of 154 (19.5%) carrying at least one such finding.
 * Most of those survived only because a reviewer, on its own initiative,
 * either hand-annotated an already-merged record afterward or ran `bd create`
 * by hand — the exact ad hoc workaround this mechanism replaces. A minority
 * were never rescued at all.
 *
 * WHY A NEW ROUTE RATHER THAN THE PROPOSAL ONE. `notedProposal` /
 * `transcribeNotedProposal` (`proposals.mjs`) already solve "how does a
 * reviewer's noticing reach work sources when its edits to the tree are
 * discarded" — but a proposal is a job-sized unit (its own type, summary,
 * evidence, a 3-day cooling period), and "change six weeks to four weeks" is
 * not a job. Routing carried findings through `data/proposals/` would flood
 * that queue with items too small to dispatch — the trap the issue names
 * explicitly. This module reuses the SHAPE of the proposal machinery
 * (parse the record, write one durable file per finding, name the reviewing
 * job as origin) without reusing the proposal LIFECYCLE.
 *
 * WHERE A TRANSCRIBED FINDING GOES, AND HOW IT LEAVES. Each entry becomes one
 * file under `data/carried/`. `pulse/lib/queue.mjs` reads that directory into
 * the derived queue on every Pulse run — the file's PRESENCE is the state, in
 * the same sense a vanished feed row or a broken link is state. There is
 * deliberately no separate "resolved" flag and no merge-step bookkeeping to
 * retire one: the fixing job's own diff deletes the file it was dispatched
 * against, and the very next Pulse run stops emitting the item, because
 * nothing is left to read. That is the same "leaves the queue the moment the
 * underlying state is fixed" rule every other queue class already follows
 * (specs/pulse), applied to a directory of files instead of a computed
 * property. See `pulse/lib/queue.mjs`'s `carriedFindingItems` for the read
 * side and the low rank chosen to keep an un-retired item from becoming the
 * unrepairable top-of-queue item addictedtoai-5hn and addictedtoai-cct both
 * warn about.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseVerdict } from './verdict.mjs';
import { localDate } from './dates.mjs';

/**
 * Transcribe every carried finding in a verdict record into `data/carried/`.
 *
 * Attempted on any outcome the merge gate parsed a verdict for, same as
 * `transcribeNotedProposal` — a reviewer that rejects a piece can still have
 * noticed something worth carrying, and its edits to the reviewed tree are
 * discarded, so this record is its only channel.
 *
 * ORPHANED FINDINGS (`subjectMustExist`, beads addictedtoai-z5dj). A finding
 * names a `subject:` and the queue uses that path as the repair job's target.
 * On a MERGED job the subject is in the tree by construction. On a DISCARDED
 * one it may not be, and on 2026-09-03 it was not: both of j-20260903-03's
 * findings named `content/blog/claude-fable-5-1-mythos-5-1.md`, a file that
 * never existed because the branch carrying it was thrown away. A repair job
 * dispatched at either would find nothing — the finding was orphaned at birth,
 * which is the file-the-deferral failure in mechanical form. With this option
 * set, such an entry is returned in `orphaned` and NOT written: the caller puts
 * it where the work that would act on it actually lives, which for a job
 * sourced from a proposal is the proposal (`recordDiscardedAttempt`). A finding
 * whose subject DOES exist is transcribed normally on either outcome, because
 * a reviewer noticing something about a published page is unaffected by what
 * happened to the branch it was reviewing.
 *
 * @param {object} ctx
 * @param {{jobId: string, verdictPath: string, reviewer?: string, dryRun?: boolean, subjectMustExist?: boolean}} args
 * @returns {{transcribed: Array<{dest: string, title: string}>, skipped: Array<{title: string, why: string}>, orphaned: Array<{title: string, detail: string, subject: string}>, warnings: string[], why?: string}}
 */
export function transcribeCarriedFindings(
  ctx,
  { jobId, verdictPath, reviewer = '', dryRun = false, subjectMustExist = false },
) {
  if (!verdictPath || !existsSync(verdictPath)) {
    return { transcribed: [], skipped: [], orphaned: [], warnings: [], why: 'no verdict record' };
  }
  const v = parseVerdict(readFileSync(verdictPath, 'utf8'));
  const warnings = [...(v.carryWarnings ?? [])];
  const entries = v.carry ?? [];
  if (entries.length === 0) {
    return { transcribed: [], skipped: [], orphaned: [], warnings, why: 'the verdict record carries no findings' };
  }

  const dir = ctx.carriedDir ?? join(ctx.repoRoot, 'data', 'carried');
  const today = localDate(ctx.now ? ctx.now() : new Date());
  const transcribed = [];
  const skipped = [];
  const orphaned = [];

  entries.forEach((entry, i) => {
    if (subjectMustExist && entry.subject && !existsSync(join(ctx.repoRoot, entry.subject))) {
      orphaned.push({ title: entry.title, detail: entry.detail, subject: entry.subject });
      return;
    }
    const dest = join(dir, `${jobId}-carry-${i + 1}.md`);
    if (existsSync(dest)) {
      skipped.push({ title: entry.title, why: `a file already exists at ${dest}; the entry was not transcribed over it` });
      return;
    }
    if (dryRun) {
      transcribed.push({ dest, title: entry.title, dryRun: true });
      return;
    }
    const front = [
      '---',
      `title: ${JSON.stringify(entry.title)}`,
      ...(entry.subject ? [`subject: ${JSON.stringify(entry.subject)}`] : []),
      `origin: review of job ${jobId}`,
      `carried_by: the reviewer of job ${jobId}${reviewer ? ` (${reviewer})` : ''}`,
      `date: ${today}`,
      '---',
      '',
    ].join('\n');
    const body =
      `${entry.detail}\n\n` +
      `## Origin\n\n` +
      `Transcribed by the loop from the verdict record for job ${jobId} ` +
      `(\`${jobId}.md\`), which is the one channel a review has: the reviewer's ` +
      `edits to the tree it reviewed are discarded, so a finding it noticed but ` +
      `did not block on reaches work sources only by being written in its ` +
      `record and copied here.\n\n` +
      `## Retiring this item\n\n` +
      `This file's presence is what puts the finding in the Pulse's derived ` +
      `queue. Once it is fixed, delete this file as part of the same diff — ` +
      `that is what removes the item; leaving the file in place causes the ` +
      `same item to reappear on the next Pulse run.\n`;
    mkdirSync(dir, { recursive: true });
    writeFileSync(dest, front + body, 'utf8');
    transcribed.push({ dest, title: entry.title });
  });

  return { transcribed, skipped, orphaned, warnings };
}
