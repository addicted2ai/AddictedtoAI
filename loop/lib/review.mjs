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
 *  4. **On a `post`, the voice question is asked the same way**, through
 *     `reads-human` and the same two refusals. It is the fourth mechanism and
 *     not a variation of the third, because of where it sits: the prebuild
 *     voice lint over `content/blog/` is ADVISORY by decision — it warns and
 *     never fails the build, since the house model trips the punctuation-rate
 *     markers in every register it writes and a fail-closed lint would have
 *     silently stopped all post work while every component reported success.
 *     Nothing mechanical downstream of the lint stops machine-made prose. The
 *     model-run verdict is the gate, and this field is what makes it look.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync, unlinkSync } from 'node:fs';
import { join, relative } from 'node:path';
import matter from 'gray-matter';
import { addWorktree, gitTry, headSha, removeWorktree } from './git.mjs';
import { runExecutor, jobLogPath } from './exec.mjs';
import { RESULT_FILENAME } from './result.mjs';
import { PROSE_TYPES, isProsePiece, prosePieces, requirementHeadings, subjectContentType } from './specs.mjs';
import { JOB_TYPES } from './config.mjs';
import { rejectionIndexText } from './proposals.mjs';
import { localDate } from './dates.mjs';
import { GROUND_RULES, assembleGraphContext, formatGraphRow, polaritySection, subjectLines, governingTypeFor } from './brief.mjs';
import { readLedger } from './ledger.mjs';
import { loadRunners, pickRunner } from './runners.mjs';
import { corroborationSection } from './lineage.mjs';
import { gateCommand, gateCommandForName } from './gates.mjs';
import {
  REASONS,
  VERDICTS,
  parseVerdict,
  parseReadsHumanFrom,
  parseWouldCiteFor,
  normalizeWouldCite,
  normalizeField,
} from './verdict.mjs';
import { reviewedHash, reviewedHashOfFile } from '../../lib/review-hash.mjs';
import { WORK_ORDER_DEFAULTS } from './select.mjs';
import { recordFileName, recordNamesPath, reviewedOf } from '../../lib/reviews.mjs';
import { DOMAINS, FRONTIER_CRITERIA } from '../../lib/domains.mjs';

/**
 * The five criteria and the eight domains, rendered for a REVIEW checklist from
 * the one place that defines them, exactly as `brief.mjs` renders them for an
 * author brief.
 *
 * A reviewer receives the diff and the checklist and nothing else — no spec
 * text reaches it (`excerptsFor` is called from the author brief alone), so a
 * rule that is not in the checklist is a rule the reviewer was never given, and
 * a scenario whose THEN is "review rejects it naming the list" cannot happen.
 * Read from `lib/domains.mjs` rather than retyped, for the reason that file
 * states: a second copy of a closed list drifts, and then the side that writes
 * and the side that judges are held to two different rules wearing one name.
 */
const FRONTIER_CRITERIA_LINES = FRONTIER_CRITERIA
  .map((c) => `**${c.id}** ${c.text}`)
  .join(' ');
const DOMAIN_VOCABULARY = DOMAINS.join(', ');

/**
 * Reading a verdict record lives in `verdict.mjs` — a leaf module with no
 * dependency on git, worktrees or the executor — so the site build can share
 * the one parser without importing the Desk. Re-exported here because this is
 * where every caller already looks for it.
 */
export { REASONS, VERDICTS, parseVerdict, parseReadsHumanFrom, parseWouldCiteFor, normalizeWouldCite, normalizeField };
export { isProsePiece, prosePieces };

/**
 * Job types whose verdict must additionally answer the VOICE question
 * (specs/review: "For a blog post, the voice question is asked the same way").
 *
 * Deliberately not `PROSE_TYPES`: `reads-human` is the blog's bar, and the
 * requirement scopes it to `post` in those words. A wiki entry is prose and is
 * not held to it.
 */
export const READS_HUMAN_TYPES = Object.freeze(['post']);

export function needsReadsHuman(type) {
  return READS_HUMAN_TYPES.includes(type);
}

/**
 * The blog posts among a set of merged subjects (specs/review,
 * addictedtoai-37rb).
 *
 * The voice obligation follows the MERGED SUBJECTS and not the job type — the
 * type says what the job was for, the subjects say what it touched, and a job
 * of any type may touch a post. `content/blog/<slug>.md` and nothing deeper:
 * the requirement scopes the bar to a blog post, and a file nested under a
 * post's directory is not one.
 */
export const BLOG_POST_PATH = /^content\/blog\/[^/]+\.md$/;

export function blogPostSubjects(subjects) {
  return (Array.isArray(subjects) ? subjects : [])
    .map((s) => String(s ?? '').replace(/\\/g, '/'))
    .filter((p) => BLOG_POST_PATH.test(p));
}

/**
 * One review record, read by the NAME a carry-forward entry gives it.
 *
 * The name is normalised by `recordFileName` in `lib/reviews.mjs` — the module
 * that owns the record store — so this gate and `scripts/verify-launch.mjs`
 * resolve `j-20260902-20.pass2`, `j-20260902-20.pass2.md` and
 * `data/reviews/j-20260902-20.pass2.md` to the same file.
 */
export function readRecordByName(ctx, name) {
  const file = recordFileName(name);
  if (!file) return null;
  const p = join(ctx.reviewsDir, file);
  if (!existsSync(p)) return null;
  let text;
  try {
    text = readFileSync(p, 'utf8');
  } catch {
    return null;
  }
  const verdict = parseVerdict(text);
  return { name: file, path: p, verdict, data: verdict.data };
}

/**
 * Refusal codes that mean **the record is unusable, not the work** — the
 * reviewer left a forced-judgment field blank or recycled someone else's
 * sentence. The fix is to re-issue the verdict; sending the AUTHOR into a
 * revision pass against a reviewer's clerical failure spends an executor
 * invocation to fix a field.
 *
 * CLOSED, AND THE MEASUREMENT IS KEPT because it is the reason the predicate
 * exists. `loop/run.mjs` used to select that branch by comparing `gate.code`
 * against the two would-cite literals by hand:
 *
 *     if (gate.code === 'would-cite-empty' || gate.code === 'would-cite-duplicate')
 *
 * so a `reads-human-*` refusal fell through to the revision path instead.
 * Measured on 2026-08-30 against a real fixture loop run: a `post` whose
 * reviewer approved with a blank `reads-human` was correctly refused
 * (`reads-human-empty`, nothing merged) but only after a wasted author
 * invocation and a second review, ending `discarded` rather than `failed`. The
 * refusal was right in both shapes and specs/review was satisfied either way —
 * what was wrong is spending an executor run to fix a reviewer's blank field.
 *
 * `loop/run.mjs` now calls `isReissueRefusal(gate.code)`. The literals live
 * here and nowhere else, so a fifth refusal code joins that branch by being
 * added to this list.
 *
 * `corrections-malformed` (beads addictedtoai-4fo) joins on the same
 * argument: a reviewer's `corrections:` block with a missing date or text is
 * the reviewer's own clerical slip in an optional field, not a defect in the
 * work under review, so it is fixed by re-issuing the verdict rather than by
 * sending the author into a revision pass.
 */
export const REISSUE_CODES = Object.freeze([
  'would-cite-empty',
  'would-cite-duplicate',
  'would-cite-for-empty',
  'would-cite-for-duplicate',
  'reads-human-empty',
  'reads-human-duplicate',
  'corrections-malformed',
  'cites-unresolved',
  // The carry-forward's two refusals join on the same argument (specs/review,
  // beads addictedtoai-37rb): a reviewer that named the wrong anchor, or
  // recycled its statement, made a clerical failure in a field ABOUT the
  // record, not a defect in the work. Sending the AUTHOR into a revision pass
  // to fix a reviewer's anchor is exactly the waste this list was built for.
  'reads-human-from-unanchored',
  'reads-human-from-duplicate',
]);

export function isReissueRefusal(code) {
  return REISSUE_CODES.includes(code);
}

/**
 * Refusal codes the merge measured from the DIFF rather than from the verdict
 * record. The record can be a perfectly formed `approve` and the merge still
 * refuses, so the reviewer's own `reasons:` and `notes:` say nothing about why
 * — which matters at exactly one place, `loop/run.mjs`'s revision brief, whose
 * findings are otherwise assembled from those two fields alone. An author sent
 * into a revision against findings that do not mention the refusal cannot
 * answer it.
 *
 * Same shape as `REISSUE_CODES` and for the same reason: the literals live here
 * and nowhere else, so a second diff-measured refusal joins that branch by
 * being added to this list rather than by a `gate.code === '…'` comparison
 * written out by hand at the call site.
 */
export const DIFF_REFUSAL_CODES = Object.freeze(['carried-deletion-unearned', 'closure-candidates', 'work-order-bound']);

export function isDiffRefusal(code) {
  return DIFF_REFUSAL_CODES.includes(code);
}

/** Job scaffolding: on the branch, never on `main`, and never work. */
function isScaffolding(p) {
  return p === RESULT_FILENAME || p === '.job' || p.startsWith('.job/');
}

/**
 * A diff that DELETES a carried finding and does nothing else, or null.
 *
 * WHAT RETIRES A CARRIED FINDING TODAY. `data/carried/<file>.md`'s presence is
 * the queue item (`loop/lib/carry.mjs`, `pulse/lib/queue.mjs`), and the fixing
 * job's own diff deletes the file. Nothing mechanical checked that the deletion
 * was earned: a job could delete the file, change nothing, and the only thing
 * between that and a merge was the reviewer noticing (beads addictedtoai-jdt8).
 *
 * WHY THIS SHAPE AND NOT THE OBVIOUS ONE. The first proposal was: for every
 * carried file deleted, require the diff to touch that finding's `subject:`.
 * A real instance refutes it. On 2026-09-03, job j-20260903-20 deleted
 * `data/carried/j-20260903-13-carry-1.md`, a finding naming TWO pages, having
 * documented one of them; its `subject:` was the page it did touch, so that
 * check would have passed a half-done finding. The review gate caught it. So
 * the check here claims strictly less and can be believed: it refuses the one
 * unambiguous shape — **the finding is gone and nothing else changed** — which
 * is what a job reaches for when it cannot do the work. It never claims to
 * judge whether a finding was satisfied; the finding is prose and its scope is
 * prose, and the reviewer remains the only reader of that.
 *
 * THE SUBJECT-IS-THE-CARRIED-FILE CASE, which the subject-touching version got
 * wrong twice over. A finding with no `subject:` is keyed by the queue on its
 * own path (`pulse/lib/queue.mjs`: `const key = subject ?? 'data/carried/…'`),
 * so a job dispatched at one has the carried file itself as its subject and
 * "touched its subject" is satisfied by the deletion. Here nothing under
 * `data/carried/` counts as work — not the deletion, and not an added or
 * edited file beside it — so a subject-less finding is refused on exactly the
 * same terms as any other, which is the intent.
 *
 * Scaffolding (`.job/`, `RESULT.md`) is not work either: `.job/brief.md` is
 * committed to every branch by construction, so counting it would make this
 * guard fire never.
 *
 * A finding whose correct resolution really is "nothing to do here" is refused
 * by this, deliberately. That case is then argued explicitly in a revision —
 * which is the whole point, since it is indistinguishable, in the diff, from a
 * job that could not do the work.
 *
 * @param {Array<{path: string, status: string}|string>} changed
 * @returns {{deleted: string[]}|null}
 */
export function unearnedCarriedDeletion(changed) {
  if (!Array.isArray(changed)) return null;
  const entries = changed.map((c) => ({
    path: String(typeof c === 'string' ? c : (c?.path ?? '')).replace(/\\/g, '/'),
    status: typeof c === 'string' ? '' : String(c?.status ?? ''),
  }));
  const deleted = entries
    .filter(
      (e) =>
        e.status === 'D' &&
        /^data\/carried\/[^/]+\.md$/.test(e.path) &&
        !e.path.endsWith('/README.md'),
    )
    .map((e) => e.path);
  if (!deleted.length) return null;
  const work = entries.filter((e) => e.path && !e.path.startsWith('data/carried/') && !isScaffolding(e.path));
  if (work.length) return null;
  return { deleted: [...new Set(deleted)].sort() };
}

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
    '**Identify the form first — news note or synthesis — and apply that form\'s finish line.** They are not the same piece and they do not fail in the same way.',
    '**Note:** the declared anchor holds. **Fetch every external `anchor:` yourself** and confirm the page documents both the event and its date; an anchor that does not hold is `false-or-unsupported-claim`. A post about a dated event that declares no anchor at all is `spec-violation`, naming the missing anchor.',
    '**Note:** the affected party is named where one exists — who breaks, what changes for them, what to do, and by when where a date exists. An actor-event post that never says who it lands on is `revise` with reason `not-worth-reading`, naming the missing party. A synthesis whose subject has no affected party is not required to invent one.',
    '**Note: brevity alone is never a defect.** A note has no minimum length; it is finished when an affected reader knows what happened, what changes for them, and where the primary evidence is. Do not revise a complete 150-word note for shortness.',
    '**Synthesis:** the derivation method is stated — what was fetched, filtered, sorted or counted, concretely enough that a skeptical reader could reproduce it — and the evidence is enumerable and dated, never impressions. A trend asserted without its method is `revise`, naming the missing method.',
    "The subject is the world's AI, never this site. A post whose subject is this site's machinery, corpus, build, process or history is `spec-violation` naming that rule, however well written. Using the site's own data layer as *evidence* about the world is fine — the subject is the vendor's change, not the snapshot.",
    '**Judge the prose against the house voice of record at `openspec/style/blog-voice.md`, and reject `reads-as-generated` where it reads machine-made** — uniform rhythm and paragraph shape, structure signposted rather than felt, meta-commentary narrating its own method, no willingness to be blunt. The prebuild voice lint is ADVISORY: it warns and never fails the build, so it stopped nothing. You may cite its warnings as evidence; the verdict is yours, not the count\'s, and a draft that trips no marker and still reads machine-made is still `reads-as-generated`.',
    "The site's disclosure of AI authorship stands. A diff that hides, softens or qualifies it so posts \"feel human\" is `spec-violation`. The writing must not read machine-made; the site must not pretend human-made. Both, always.",
    `**THE FRONTIER FLAG, WHERE THE POST DECLARES ONE — check that it was EARNED, not merely well formed.** The build already refuses a flag with no criterion, a criterion outside F1-F5, or a domain outside the vocabulary; what it cannot judge is whether the story qualifies, and that is yours. The five criteria, exactly one of which a flagged post cites: ${FRONTIER_CRITERIA_LINES} **NOT QUALIFYING:** a new checkpoint, a price change, a benchmark post with no new artifact, a tool release. The test, stated as a test rather than as a list to be extended: *what every other AI news site already shows does not qualify on its own.* A flag on one of those is \`spec-violation\` **naming the not-qualifying list** — a price change is not F5, which is a change in ACCESS and not in price. \`domains\` is OPTIONAL flagged or not (${DOMAIN_VOCABULARY}): "general" is the UNMARKED default and \`text\` is not a value, so a flagged post carrying no \`domains\` is a general record and is NOT a defect to ask repaired.`,
    "**AN F2 RECORD CARRIES THE PUBLISHER'S ACT, NEVER THE PUBLISHER'S NUMBERS, and BOTH lists below are normative — neither may be dropped as redundant.** **PERMITTED in an F2 record's copy:** the publisher; the index name and its version; the date; the direction of the rescoring; the coverage change, as a count of rows scored before and after; the fact that a non-uniform rescoring can invert orderings. **FORBIDDEN in an F2 record's copy:** any index value, any ratio, any rank, any per-model score. A median is a value however it is aggregated; a leaderboard position is a rank. A draft carrying any of the forbidden four is `spec-violation` **naming the forbidden list** — those are derived from republished numbers, they belong in the review record where you can check the author's work, and never on a rendered page. Check the ANCHOR too: an F2 record anchors on the **publisher's own changelog or announcement** for the rescoring, cited and quoted verbatim, and a third-party write-up is not that anchor; where the publisher's page states the act but not its shape, the record says so and rests its shape on its own measurement. Why BOTH lists reach you rather than only the permitted one: a list that says only what is permitted is not a source test but a field-name test, and a field-name test has already failed in this corpus — an allow-list keyed on field names admitted a router's measured throughput and a third-party analysis site as vendor claims, because the names matched and the sources did not. A rescoring described by its numbers becomes a republished value BY ACCIDENT, with nobody having decided to republish anything.",
    '**Answer both questions in your own words: the send question in `would-cite` (who would send this, and to whom?) and the voice question in `reads-human` (where does this read machine-made, or why does it not?).** For a post, being worth citing alone does not publish — a correct, sourced, forgettable draft is `not-worth-reading`, in those words.',
    '**WHERE THE DIFF IS A REPAIR TO AN ALREADY-APPROVED POST, say which branch you are taking.** A `reads-human` answers for the bytes its writer read, so a diff that changed them must either answer the voice question afresh or carry the prior answer forward in a `reads-human-from` entry — naming the post, the earlier approving record whose `reads-human` answered for it, and why this diff did not move that post\'s voice. **A diff that rewrites the post\'s prose is not a carry-forward:** carrying a verdict forward across a genuine rewrite is `spec-violation` against specs/review, and nothing mechanical catches it — the next reviewer of that piece is the only thing that does.',
  ],
  scout: [
    "**The charge is checked first, before anything else: bring back work the site could not have thought of by looking at itself.** If every filed candidate could have been written without leaving this repository — from the change feed, the snapshots, the corpus — reject the run `spec-violation` naming the charge. An inward run that is otherwise flawless still fails this.",
    "**Spot-fetch the evidence URLs yourself.** A URL in a candidate is a claim until you open it: confirm the page exists and says what the candidate says it says. Externally *retrieved* is the point; a plausible-looking link is not retrieval.",
    'Every candidate carries the docket discipline in full: a kebab-case `slug`, a proposed job `type` from the closed list, an `expires:` date (at most 7 days out for an event-driven candidate, at most 14 for a synthesis), a why-now, externally retrieved evidence with URLs **and retrieval dates**, and done-when acceptance lines written at filing time. A missing field is a missing field — say which candidate and which field.',
    'Every declined story has one record in `data/proposals/dropped/` naming **which test it failed** and **what would make it worth refiling**. A drop record that names neither is not a record. **Where a story was weighed as a frontier candidate, that record ALSO names which criterion (F1-F5) it was weighed against and why it failed** — unconditionally, not only in a domain that has gone quiet and not only on a day something was filed. The declines are the only record of where the frontier line was drawn, so a drop record that names only the two-test bar leaves that judgment unauditable: say which run it applies to and ask for it. (These prove the *form* of the bar, never its *rate*: nothing measures how many stories were considered, so do not read three drop records as evidence of a wide sweep.)',
    '**At most three UNFLAGGED candidates are filed.** Count the added proposal files that do NOT carry a valid `frontier: true` — a candidate carrying a valid flag (`frontier_reason`, exactly one of F1-F5, and every `domains` value from the closed vocabulary) is exempt from the COUNT and from nothing else, so a fourth file is expected rather than over-filing when one of them is validly flagged. A candidate whose flag does not hold is dropped at merge with the offending field named and does not rejoin the three. The merge enforces all of that mechanically, so a fourth *unflagged* file is a signal about the run, not a thing you must stop.',
    'Zero candidates is not a defect. A run that swept honestly and found nothing that clears the bar is the bar working — judge what was filed and what was declined, never the count.',
  ],
  education: [
    'No perishable literals.',
    'Prerequisites and the "after this you will understand" statement are honest.',
    'It beats the obvious alternative a reader would otherwise read.',
  ],
  directory: [
    'Spot-check the changed rows against their sources.',
    // The list a `repair` job actually gets (`CHECKLIST_FOR_TYPE.repair`), which
    // is why this sentence lives here and not only on the post list: the bead's
    // own instance (addictedtoai-37rb) is a `repair` whose diff landed on a
    // published post, and a reviewer cannot answer a question it was never
    // asked.
    '**WHERE THE DIFF LANDS ON A BLOG POST — an already-approved one, as a repair usually does — say which branch you are taking.** A `reads-human` answers for the bytes its writer read, so this verdict must either answer the voice question afresh (where does this post read machine-made, or why does it not?) or carry the prior answer forward in a `reads-human-from` entry — naming the post, the earlier approving record whose `reads-human` answered for it, and why this diff did not move that post\'s voice. One entry per post. **A diff that rewrites the post\'s prose is not a carry-forward:** carrying a verdict forward across a genuine rewrite is `spec-violation` against specs/review, judged by the next reviewer of that piece and by nothing mechanical.',
  ],
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
  scout: 'scout',
};

/**
 * Which `JOB_TYPES` entries have no checklist mapping, and which mappings point
 * at a checklist that does not exist. Both are empty in a correct tree; the test
 * beside this file asserts that, so a new job type cannot reach a review without
 * one.
 */
export function checklistCoverage(types = JOB_TYPES) {
  return {
    unmapped: types.filter((t) => !CHECKLIST_FOR_TYPE[t]),
    danglingMappings: Object.entries(CHECKLIST_FOR_TYPE)
      .filter(([, k]) => !CHECKLISTS[k])
      .map(([t, k]) => `${t} -> ${k}`),
  };
}

/**
 * The checklist for a job type — and a THROW for a type that has none.
 *
 * This used to be `CHECKLISTS[CHECKLIST_FOR_TYPE[type] ?? 'entry']`, and the
 * default was not a convenience, it was a silent wrong answer. `scout` was
 * added to `JOB_TYPES` before this map knew about it, and the effect was not a
 * missing checklist — it was a scout run reviewed against the WIKI ENTRY
 * checklist ("volatile values are transclusions", "aliases sanely classed"),
 * with every component reporting success and no line of output anywhere saying
 * the wrong criteria had been applied. A reviewer cannot notice a checklist it
 * was never given.
 *
 * So the fallback is gone. specs/review is explicit that what is checked depends
 * on what the work is, and a review constituted against the wrong list is not a
 * weaker review, it is a different one. Refusing to assemble the brief fails the
 * job closed, which is the outcome this repository takes everywhere else a
 * closed list is violated. It is also unreachable in a correct tree —
 * `checklistCoverage()` and its test are what keep it that way, and they fail at
 * `npm test`, long before any run.
 */
export function checklistFor(type) {
  const key = CHECKLIST_FOR_TYPE[type];
  const list = key ? CHECKLISTS[key] : null;
  if (!list) {
    throw new Error(
      `review: no checklist for job type ${JSON.stringify(type)}. specs/review: what is ` +
        `checked depends on what the work is, so there is no default — a review assembled ` +
        `against another type's list would be silently wrong. Add ${JSON.stringify(type)} to ` +
        `CHECKLIST_FOR_TYPE (and a CHECKLISTS entry if it needs its own) in loop/lib/review.mjs. ` +
        `Known types: ${Object.keys(CHECKLIST_FOR_TYPE).join(', ')}.`,
    );
  }
  return list;
}

export function isProse(type) {
  return PROSE_TYPES.includes(type);
}

/**
 * Per-page reviewed checklist mapping (Stage 2, task 63).
 *
 * The review brief for a `reviewed:` outcome carries the checklist for each
 * declared page's KIND, not for the job's type — there is no diff whose type
 * is the subject. A page's kind is its content type via the schema's own
 * `CONTENT_TYPES` directory table (`subjectContentType` in `loop/lib/specs.mjs`,
 * derived, never retyped — the same source task 60's `isProsePiece` reads).
 * The gate type below is the job-type key whose checklist answers for that
 * kind, so the brief and the merge gate read one mapping:
 *
 * - `entry` (wiki), `delta` (deltas, prose with no dedicated checklist — the
 *   generic prose entry list answers) -> `entry`;
 * - `learn` (learn) -> `education` (the education checklist is the learn
 *   checklist; no `learn` job type exists);
 * - `tutorial` (tutorials) -> `tutorial`;
 * - `post` (blog) -> `post` (including the voice bar);
 * - `tool` (directory rows), `claim` (data rows, non-prose) -> `repair`
 *   (the directory checklist's spot-check rows; `repair` is non-prose so no
 *   `would-cite` is demanded for non-prose pages, exactly as the merge gate
 *   demands none for them).
 *
 * Unknown content types (a code file, or a content path outside every known
 * directory) throw, failing the assembly closed — a review assembled against
 * another kind's list would be silently wrong, on the same terms
 * `checklistFor` refuses an unknown job type. Reused, never reimplemented:
 * the checklist itself is still `checklistFor`, and the merge gate reads
 * `reviewedGateTypeForPage` for its `type` argument.
 */
export const REVIEWED_CONTENT_TO_GATE_TYPE = Object.freeze({
  entry: 'entry',
  learn: 'education',
  tutorial: 'tutorial',
  post: 'post',
  tool: 'repair',
  delta: 'entry',
  claim: 'repair',
});

export function reviewedGateTypeForPage(page) {
  const norm = String(page ?? '').replace(/\\/g, '/').trim();
  if (!norm) throw new Error('review: no page path for the reviewed checklist — without a page there is no kind, so the brief is refused rather than assembled against the wrong list.');
  const contentType = subjectContentType(norm);
  const mapped = contentType ? REVIEWED_CONTENT_TO_GATE_TYPE[contentType] : null;
  if (!mapped) {
    throw new Error(
      `review: no checklist for reviewed page ${JSON.stringify(norm)} (content type ${JSON.stringify(contentType)}). ` +
        `specs/review: what is checked depends on what the work is, so there is no default — a review assembled ` +
        `against another kind's list would be silently wrong. Known content types: ${Object.keys(REVIEWED_CONTENT_TO_GATE_TYPE).join(', ')}.`,
    );
  }
  return mapped;
}

export function checklistForReviewedPage(page) {
  return checklistFor(reviewedGateTypeForPage(page));
}

/**
 * The per-page verdict record path for a multi-page `reviewed:` outcome
 * (Stage 2, task 63).
 *
 * Single-page outcomes keep `verdictPath` exactly (byte-stable naming); only
 * multi-page gains invocations, each with its own record so no per-page
 * verdict bypasses the merge gate. The name carries the page index and the
 * revision pass (`<jobId>.reviewed-<i>.md`, `<jobId>.reviewed-<i>.pass2.md`),
 * so a revision re-reviews every page without colliding with the first pass.
 * The duplicate-`would-cite` sweep excludes every record of the same job
 * (any name starting with `<jobId>.`), which is what lets two pages honestly
 * share one sentence the way two entries in one record may.
 *
 * @param {number} pageIndex zero-based page position in the sorted declared list
 */
export function reviewedPerPageRecordPath(ctx, jobId, pageIndex, pass = 1) {
  const i = Number(pageIndex);
  if (!Number.isInteger(i) || i < 0) throw new Error('review: page index for a per-page reviewed record must be a non-negative integer');
  const p = Number(pass) || 1;
  const base = `${jobId}.reviewed-${i}`;
  return join(ctx.reviewsDir, p === 1 ? `${base}.md` : `${base}.pass${p}.md`);
}

/**
 * Whether a per-page reviewed record belongs to a job (for the duplicate
 * sweep's exclusion): the job's own record plus every per-page sibling.
 */
export function isRecordOfJob(name, jobId) {
  if (!jobId) return false;
  const n = String(name ?? '');
  const j = String(jobId);
  return n === `${j}.md` || n.startsWith(`${j}.`);
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
 * @param {{ran: boolean, ok?: boolean, results?: Array, why?: string,
 *          retried?: boolean, transport?: boolean, firstFailed?: string[]}|null|undefined} gates
 *   `firstFailed` carries gate NAMES, as the ledger records them, and each is
 *   rendered through `gateCommandForName` (beads addictedtoai-one6): since the
 *   per-job set gained `verify-surfaces` and `verify-design`, which are
 *   `node scripts/*.mjs` invocations rather than npm scripts, a rendered
 *   `npm run verify-design` would name a command that does not exist — and this
 *   line is exactly what a reader pastes to reproduce.
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
      `- \`${gateCommand(r)}\` — **${r.ok ? 'PASS' : `FAIL (exit ${r.status})`}**`,
  );
  // THE SECOND RUN IS NOT THE ONLY RUN, AND SAYING SO IS THE POINT.
  //
  // Since beads addictedtoai-xzdd the loop retries a failing gate run ONCE on
  // ANY failure, so the results above can be a second attempt. Reaching a review
  // at all means the retry passed. That is worth stating rather than smoothing
  // over: the reviewer is the only judgment in the loop that could notice a real
  // intermittent defect the second run happened to miss, and it cannot weigh
  // what it is not told. Stated as a MEASUREMENT — what ran, what it said — like
  // the rest of this section, and never as an instruction to re-run the suite,
  // which is the failure the paragraph below exists to prevent.
  const retryNote = gates.retried
    ? `
**These gates were run twice.** The first run FAILED and the second PASSED; the
results above are the second run's${
        Array.isArray(gates.firstFailed) && gates.firstFailed.length
          ? `. What failed the first time: ${gates.firstFailed.map((s) => `\`${gateCommandForName(s)}\``).join(', ')}`
          : ''
      }. The first run's full output ${
        gates.transport
          ? 'carried the machine-failure marker, so something measured does say that failure was the machine rather than the diff'
          : 'carried NO machine-failure marker, so nothing measured says whether that failure was the machine or the diff'
      } — only that a second run of the same gates, on the same commit, in the
same worktree, disagreed with the first. Weigh that as you judge the diff.
`
    : '';
  return `## What the loop has already verified on this branch

The loop ran these itself, in this branch's own worktree, immediately before
this review${on} — the same commit the diff below was computed from:

${lines.join('\n') || '- (no gate ran)'}
${retryNote}
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
 * The gates section for a `reviewed:` review (Stage 2, task 63).
 *
 * The gates ran green on a tree identical to the merge base — the empty diff
 * is empty because the executor changed nothing, so the tree under review IS
 * the base tree. That makes the gates evidence that the base is green and
 * NOT evidence about the pages under review: a green suite on unchanged
 * bytes says nothing about whether those bytes are sound, which is the
 * judgment this review exists to make. Every word a normal gates section
 * prints on this outcome would otherwise imply the pages were checked, so
 * this section replaces it (never supplements it) wherever `reviewedOnly`
 * names a page. Reused measurements only: the gate lines render through the
 * same `gateCommand` the normal section reads, duplicated nowhere.
 */
export function reviewedGatesSection(gates, sha = '') {
  const on = sha ? ` on commit \`${String(sha).slice(0, 12)}\`` : '';
  if (!gates || gates.ran === false) {
    return `## What the loop has verified on this branch

The loop did not run its gates this run${gates?.why ? ` (${gates.why})` : ''}. That means there is NO evidence here that the base is green — no gate ran, so no base-green evidence exists — and NOT evidence
about the page under review either. Judge the page below on its own, and say in your notes what you ran and what you observed.
`;
  }
  const lines = (gates.results ?? []).map(
    (r) =>
      `- \`${gateCommand(r)}\` — **${r.ok ? 'PASS' : `FAIL (exit ${r.status})`}**`,
  );
  const retryNote = gates.retried
    ? `
These gates were run twice; the results above are the second run's. That, too, is evidence about the base tree, not about the page.
`
    : '';
  return `## What the loop has verified on this branch

The loop ran these itself, in this branch's own worktree, immediately before
this review${on} — on a tree identical to the merge base, because this outcome carries no diff.
They are therefore evidence that the base is green and NOT evidence about the page under review:
a green suite on unchanged bytes says nothing about whether those bytes are sound, and that judgment is yours.

${lines.join('\n') || '- (no gate ran)'}
${retryNote}
**Do not re-run them as a substitute for reading.** If a specific claim on the page needs a check, run
**that** check — the one that would be red if the claim were false — and quote
what it printed. Re-running the whole suite is the one way this review can run out of time.
`;
}

/**
 * How a `reviewed:` review invocation ended (Stage 2, task 63).
 *
 * A timeout (killed at the wall-clock cap) classifies as `interrupted` —
 * resumable, never a breaker input — rather than as absent review
 * (`no-record`/`failed`). Nothing was rejected; the reviewer simply did not
 * finish writing, so the branch is kept and the review is retried. An
 * invocation that ended on its own with no usable verdict is still absent
 * review and fails closed downstream; only the killed shape is reclassified.
 * Pure over its arguments so the run path and the tests share one predicate.
 *
 * @param {{killed?: boolean, recordWritten?: boolean}} o
 * @returns {'interrupted'|'recorded'|'absent'}
 */
export function classifyReviewedRun({ killed = false, recordWritten = false } = {}) {
  if (killed && !recordWritten) return 'interrupted';
  if (recordWritten) return 'recorded';
  return 'absent';
}

/**
 * Whether a runner may take `reviewed:`-outcome reviews (Stage 2, task 63).
 *
 * A timeout-prone runner is excluded from reviewed-outcome reviews unless an
 * explicit timeout/interrupted-rate guard is recorded. Timeout-prone here is
 * measured from the ledger, not from a name: the last three reviewer-role
 * invocations for this runner id all killed at their caps (the
 * `review*`-role phases `loop/run.mjs` already writes, the same rows
 * `health.mjs` reads for its no-output streak). Anything else — fewer than
 * three reviewer invocations, any one that finished on its own — is not
 * timeout-prone and is eligible with no guard. Where the runner IS
 * timeout-prone, `guard` must be a non-empty string naming the recorded guard
 * (carried in the brief/log by the caller); absent or blank refuses.
 * No ledger (null/empty) is eligible: with no evidence the runner is
 * timeout-prone, exclusion would be a refusal on nothing.
 *
 * @param {{id?: string}|string|null} runner the reviewer entry or its id
 * @param {{ledger?: Array|null, guard?: string|null}} [opts]
 * @returns {{ok: boolean, reason?: string, prone?: boolean}}
 */
export function checkReviewedRunnerEligibility(runner, { ledger = null, guard = null } = {}) {
  const id = typeof runner === 'string' ? runner : runner?.id;
  if (!id) return { ok: false, reason: 'reviewed: no reviewer runner to judge eligibility for', prone: false };
  const rows = [];
  if (Array.isArray(ledger)) {
    for (const line of ledger) {
      if (!line || !Array.isArray(line.phases)) continue;
      for (const p of line.phases) {
        if (!p || typeof p.role !== 'string' || !/^review/.test(p.role)) continue;
        if (p.runner !== id) continue;
        rows.push(p);
      }
    }
  }
  const last3 = rows.slice(-3);
  const prone = last3.length === 3 && last3.every((p) => p.killed === true);
  if (!prone) return { ok: true, prone: false };
  const g = typeof guard === 'string' ? guard.trim() : '';
  if (g) return { ok: true, prone: true };
  return {
    ok: false,
    prone: true,
    reason:
      `reviewed: reviewer "${id}" is timeout-prone (its last 3 reviewer invocations were all killed at their caps) ` +
      `and no explicit timeout/interrupted-rate guard is recorded — it is excluded from reviewed-outcome reviews until such a guard is recorded`,
  };
}

/**
 * The reviewer's own run, stated: it has a cap, it gets one shot, and the record
 * is the only thing that survives it.
 */
export function runShapeSection({ capMinutes, mmSoFar, invocations = 0, totalMinutes = null }) {
  const n = Number(invocations) || 0;
  const total = Number(totalMinutes) || 0;
  const spent = Number(mmSoFar) || 0;
  // The job's whole budget, when the caller knows it (beads addictedtoai-o5t).
  // The cap above is already `min(per-invocation guard, remainder)`, so this
  // says where the number came from rather than announcing a second one.
  const budget = total
    ? ` The whole job — authoring, the
revision and both review passes — has a budget of ${total} minutes, of which
${Math.max(0, total - spent).toFixed(2)} are left, and the cap above is the smaller of the
per-invocation guard and that remainder.`
    : ` Authoring, a
revision and each review pass are each charged to this same job.`;
  return `## How this run ends — read this before you start

This is a single non-interactive run under a **per-invocation wall-clock cap of
${capMinutes} minutes** — the limit on THIS run, not a budget for the job.
When you stop producing output, your run is over: there is no later turn, nothing
will wake you, and anything still running is killed with you. If you start a
long-running command, wait for it and read its output **in this same run** — never
end your turn intending to come back to it.${
    typeof mmSoFar === 'number'
      ? `\n\nThis job has already cost ${spent.toFixed(2)} model-minutes across ${n} completed
invocation${n === 1 ? '' : 's'}, and your minutes are added to the same job.${budget}
Spend yours on judgment, not on repetition.`
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
 *
 * Read-and-unchanged mode (Stage 2, tasks 62-63): where `reviewedOnly` names
 * the one page this invocation reviews, the brief carries that page's
 * machine-supplied surface (`reviewedSurfaceText`, injected — this function
 * generates no bytes; the caller reads the tree) and its hash, the graph
 * annex filtered to that page APPENDED AFTER the surface, and NO diff section
 * at all. The filter is task 59's `assembleGraphContext` with the same
 * `reviewedOnly` — reused, never reimplemented — so the row the reviewer sees
 * is the row the merge gate reads. The hash is `reviewedHash` over the
 * carried surface bytes, printed beside the surface so the equality the merge
 * checks (`hash(brief bytes) === hash(record binding)`, task 64) is readable
 * here. The gates section is the reviewed disclaimer (evidence the base is
 * green, not evidence about the page), and the checklist is the checklist for
 * the page's kind, not the job's type. The per-page invocation split (one
 * invocation per declared page, never a bundle) is task 63's; this function
 * renders one page, and callers pass one page.
 */
export function assembleReviewBrief(
  ctx,
  { jobId, job, diffText, pass, findings, outPath, gates = null, sha = '', capMinutes = 0, mmSoFar, invocations = 0, totalMinutes = null, workOrder = null, reviewedOnly = null, reviewedSurfaceText = null, reviewGraphQuery = null, graphIndexId = 'unknown-index', reviewer = null },
) {
  // Task 59: the review checklist is keyed on the work order's governing type
  // (via the shared `governingTypeFor`), never on an item's own type — the
  // same governing value the author brief's excerpts and acceptance checks
  // read. Without a work order this resolves to `job.type`, so every existing
  // caller keeps its exact brief. On a `reviewed:` invocation (below) the
  // checklist, prose and voice are keyed on the PAGE's kind instead — there
  // is no diff whose type is the subject.
  const governing = governingTypeFor(job, workOrder ?? null);
  const reviewedPageEarly = typeof reviewedOnly === 'string' && reviewedOnly.trim()
    ? reviewedOnly.replace(/\\/g, '/').trim()
    : null;
  // The page kind is resolved once: it keys the checklist below and the
  // prose/voice demands. Unknown kinds throw here, failing the assembly
  // closed rather than reviewing against another kind's list. Resolved before
  // any rendering so a page with no checklist never produces a half-brief.
  let reviewedGateType = null;
  if (reviewedPageEarly) {
    reviewedGateType = reviewedGateTypeForPage(reviewedPageEarly);
  }
  const prose = reviewedGateType ? PROSE_TYPES.includes(reviewedGateType) : isProse(governing);
  const voice = reviewedGateType
    ? reviewedGateType === 'post' || blogPostSubjects([reviewedPageEarly]).length > 0
    : needsReadsHuman(governing);
  const fromProposal = job.source === 'proposal';
  const rejection = fromProposal
    ? `\n## The rejection index\n\nThis job originated from a proposal. Part of your checklist is the judgment\nhalf of duplicate suppression: confirm this piece is not a differently-worded\nre-tread of an idea already rejected. The mechanical half — exact slug match —\nalready ran and passed. Fuzzy matching is guessing, so this half is yours.\n\n${rejectionIndexText(ctx)}\n`
    : '';

  // Read-and-unchanged tail (tasks 62-63): the reviewed page's surface, its
  // hash, and the filtered graph annex APPENDED AFTER the surface, and no diff
  // section at all. The annex is task 59's filter (`assembleGraphContext`
  // with `reviewedOnly`), so the merge gate and the reviewer read one row
  // assembled one way. The surface is machine-generated from the tree by the
  // caller (read from the worktree/branch, never from brief prose); the hash
  // beside it is `reviewedHash` over those carried bytes. Where
  // `reviewedOnly` is absent the brief below is byte-identical to before.
  const reviewedPage = reviewedPageEarly;
  let reviewedTail = null;
  if (reviewedPage) {
    const hasSurface = typeof reviewedSurfaceText === 'string' && reviewedSurfaceText;
    const surface = hasSurface
      ? reviewedSurfaceText
      : '(no surface text was supplied for this page — judge nothing from memory; say so in your notes.)';
    let hashLine;
    if (hasSurface) {
      let hash = null;
      try {
        hash = reviewedHash(reviewedSurfaceText);
      } catch {
        hash = null;
      }
      hashLine = hash
        ? `Reviewed hash: \`${hash}\` (SHA-256 of the reviewed surface above, as the record will bind it)`
        : 'Reviewed hash: (the surface above could not be hashed — say so in your notes and bind nothing)';
    } else {
      hashLine = 'Reviewed hash: (no surface was supplied, so no hash is bound by this brief)';
    }
    const seam = typeof reviewGraphQuery === 'function'
      ? reviewGraphQuery
      : () => ({ absent: true, reason: 'no graph index wired on the review path' });
    const indexId = typeof graphIndexId === 'string' && graphIndexId.trim() ? graphIndexId.trim() : 'unknown-index';
    const built = assembleGraphContext({
      declaredSubjects: [reviewedPage],
      graphQuery: seam,
      reviewedOnly: reviewedPage,
      indexId,
    });
    reviewedTail = `## Reviewed page surface

You are judging THIS page, as it stands — not a diff. There is none: the
executor read these pages, judged them sound, and correctly left them
unchanged. The absence of a diff is the finding.

### \`${reviewedPage}\`

${surface}

${hashLine}

${built.annexText}`;
  }
  const diffTail = `## The diff under review

The loop computed this diff itself from the branch state; it is not the
author's account of what changed.

\`\`\`diff
${diffText.length > 200000 ? diffText.slice(0, 200000) + '\n... [diff truncated at 200 KB]' : diffText}
\`\`\`
`;

  // Task 63: on a reviewed invocation the gates section is the disclaimer
  // (evidence the base is green, not evidence about the page), the checklist
  // is the page kind's, and the reviewer rung is named (the rung and route
  // the invocation runs on, read at review time — no model is named here).
  // Without the mode both read exactly as before.
  const gatesBlock = reviewedPage ? reviewedGatesSection(gates, sha) : gatesSection(gates, sha);
  const checklistList = reviewedGateType ? checklistFor(reviewedGateType) : checklistFor(governing);
  const checklistHeading = reviewedPage
    ? `## Checklist for this page's kind (\`${reviewedGateType}\`, from \`${reviewedPage}\`)`
    : '## Checklist for this kind of work';
  const rung = reviewer && typeof reviewer === 'object' && reviewer.id ? reviewer : null;
  const rungBlock = reviewedPage
    ? `## Reviewer rung

${rung ? `\`${rung.id}\` (provider \`${rung.provider ?? '?'}\`, tier \`${rung.tier ?? '?'}\`) — read from the registry at review time; no model is named here.` : '(no rung — the review must not run)'}
`
    : '';

  return `# Review — job ${jobId} (${reviewedGateType ?? governing})${pass > 1 ? `, delta review, pass ${pass}` : ''}${reviewedPage ? `
(one page of a per-page reviewed outcome: this invocation reviews ONLY \`${reviewedPage}\`; never judge another page from this brief)` : ''}

You are the reviewer. You have fresh context: you have not seen the author's
reasoning and you will not get it. You have ${reviewedTail ? 'the reviewed page surface below' : 'the diff below'} and the checklist.
You have **no edit rights** — any change you make to this worktree is thrown
away, so do not try to fix anything. Your only accepted output is the verdict
record.

## What this job was asked to do

You are judging ${reviewedTail ? 'the reviewed page against THIS' : 'the diff against THIS'} and nothing wider. \`scope-violation\` is
one of the verdicts you may return, and this is the outcome the scope is
measured against — a diff that goes beyond it earns that verdict even if every
line of it is correct work.

${job.title}

${subjectLines(job)}${job.detail && job.detail !== job.title ? `\n${job.detail}\n` : ''}
${runShapeSection({ capMinutes, mmSoFar, invocations, totalMinutes })}
${gatesBlock}
${rungBlock}${pass > 1 ? `## What this delta review covers\n\nThe previous verdict asked for revisions. Review **only what changed since
then**, against these findings:\n\n${findings}\n\nThis is the last pass. A second non-approval discards the job.\n` : ''}
## Your standing instruction

**For every claim about what something does, run the cheap direct check. For
every sourced claim, confirm the source supports it.** The defect class this
review exists to catch is the claim written from intent rather than
measurement — found repeatedly by skeptical readers on the previous version of
this site, and never once by an automated check.

${checklistHeading}

${checklistList.map((c) => `- ${c}`).join('\n')}
${rejection}
${corroborationSection()}
${polaritySection()}
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

**If this diff merges more than one prose piece, answer once PER PIECE.**
One sentence standing for several pieces is the 1/N attention problem, and a
record-wide \`would-cite\` alone satisfies nothing for N>1: carry a
\`would-cite-for\` list with one entry per merged prose piece (a wiki entry,
a learn page, a tutorial, a blog post or a delta — a directory row is not
one), each naming its piece (\`subject:\`, the merged path) with that piece's
own answer (\`statement:\`). A piece left with no entry is refused exactly as
a blank \`would-cite\` is. Each statement must be non-empty and must not
recycle another review's sentence; two of your own entries may share one
statement where one correction really did land the same way twice.
` : ''}${voice ? `
**Required, non-empty: \`reads-human\`.** In your own words: where does this
post read machine-made, or why does it not? Same two mechanics as
\`would-cite\` — an \`approve\` with this field blank, or with text identical to
another record's, is refused at merge.

Read this before you fill it in, because the field is load-bearing in a way the
others are not. The prebuild voice lint over \`content/blog/\` is **advisory**:
it warns, naming each tripped marker with its measured value and threshold, and
it **never fails the build**. That was a deliberate decision — the house model
trips the punctuation-rate markers in every register it writes, so a
fail-closed lint would have silently stopped all post work while every
component reported success. The consequence is this: **your verdict is the only
thing standing between machine-made prose and the live site.** No other check
in this repository will catch it after you.

So judge the prose, not the counters. You may cite the lint's warnings as
evidence; a draft that trips no marker and still reads machine-made is still
\`reads-as-generated\`, and a draft that trips several and reads like a person
wrote it is not.
` : `
## If your diff lands on a blog post — the voice question, and the two ways to answer it

**This applies whatever kind of job this is.** The obligation follows what the
diff MERGES, not what the job was for: if any \`content/blog/*.md\` file is in
this diff, an \`approve\` must answer the voice question **for each such post**,
in one of exactly two ways, and the merge refuses an \`approve\` that answers
neither.

1. **Answer it afresh** in a non-empty \`reads-human\`: where does this post read
   machine-made, or why does it not? Same two mechanics as \`would-cite\` —
   blank, or identical to another record's, is refused.
2. **Carry the prior answer forward**, in a \`reads-human-from\` entry. A
   \`reads-human\` answers for the bytes its writer read; this diff changed
   them. So name the post, name the earlier approving record whose
   \`reads-human\` answered for it, and say **in your own words** why this diff
   did not move that post's voice.

**One entry per post.** A single entry does not cover a second post in the same
diff — that post is then unanswered and the merge refuses.

**The anchor must itself answer, and a carry-forward is one hop and never a
chain.** The record you name must exist, must name that same post, must record
\`approve\`, and must carry a non-empty \`reads-human\` of its own. A record
whose own answer is another \`reads-human-from\` is not an anchor; name the
record that actually answered.

**A diff that REWRITES the post's prose is not a carry-forward.** The
carry-forward is for a diff with no voice in it — a licence correction, a fixed
date, a broken link. If the prose moved, the old verdict no longer speaks for
what is on the page, and carrying it forward is a \`spec-violation\` against
specs/review, catchable by the next reviewer of that piece and by nothing
mechanical. Your statement is held to the same rules \`would-cite\` is: it must
be non-empty and must not be a sentence recycled from another review. Two of
your own entries may share a statement when one correction really did land the
same way on two posts.
`}
## If your review surfaced a proposal

You may note **at most one** proposal in the verdict record — an idea this
review made visible that is not this job's work to do. You have no edit rights,
so do not write a file: note it in the front matter below and the loop
transcribes it into \`data/proposals/\` as a well-formed proposal naming this
review's job as its origin. Noting nothing is the normal case and is not a gap;
a proposal manufactured to fill the field is worse than an empty one.

The front-matter contract a proposal must satisfy, restated here because this
brief is the only channel you have:

\`\`\`
proposal:
  slug: kebab-case-name-for-the-idea
  type: <one job type from the closed list — a proposal proposes a job of an
        existing type, never a new kind of work>
  date: <today, YYYY-MM-DD>
  summary: <one paragraph>
  evidence: <what in this diff or its sources prompted it>
  expires: <optional, YYYY-MM-DD — only for evidence that decays; an expiring
           proposal skips the 3-day cooling and is swept once it expires>
\`\`\`

## If you noticed something you are not blocking on

A one-word error, a dropped source qualifier, a citation that resolves to a
login wall instead of the page it cites — real, and not worth \`revise\` on a
piece that is otherwise sound. \`approve\` used to be the end of the road for
this: written into your free-form notes below, which nothing but a human
re-reading this file will ever see again. It does not have to be.

List each such finding under \`carry:\` in the front matter — zero or more
entries, each a separate small correction, never a job-sized idea (that is
what \`proposal:\` above is for). Each needs a short \`title\` — one line, what
needs doing, not a restatement of the finding — and a \`detail\` naming what
you found and what would fix it. \`subject\` is required: the repository path
the finding concerns.

\`\`\`
carry:
  - title: <one line — what needs doing>
    detail: <the finding — quote the wrong text, name what is wrong, say what
             would fix it>
    subject: <required — the repository path this concerns, e.g.
             "content/wiki/model/example.md">
  # - title: ...              # a second entry, if there is a second finding
  #   detail: ...
\`\`\`

Carrying nothing is the normal case, same as noting no proposal — most reviews
have nothing to carry. A finding invented to fill the field is worse than an
empty list.

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
# would-cite-for:          # required when the merged subjects hold MORE THAN ONE
#   - subject: ...          # prose piece: one entry per piece, naming the merged
#     statement: ...        # path, with THAT piece's own answer. A record-wide
#                          # \`would-cite\` alone satisfies nothing for N>1; a piece
#                          # left with no entry is refused as a blank \`would-cite\`
#                          # is. Omit the key entirely for a single piece.
# cites: [<exact heading text after \`### Requirement:\` on its heading line>]
#        # Trimmed, exact and case-sensitive; \`(preamble)\` is not a heading.
#        # Choose from every capability under \`openspec/specs/\`, using its
#        # constitution and every unarchived change's delta; this feeds the
#        # revision brief's requirement excerpts. Omit the field when no
#        # requirement was relied on.
${voice ? `reads-human: >-
  <your own-words answer: where does this read machine-made, or why does it not>
` : `# reads-human-from:         # required IF this diff merges a blog post and you
#   - subject: ...           # are not answering the voice question afresh above:
#     record: ...            # one entry per post — the post, the earlier
#     why: ...               # approving record whose \`reads-human\` answered for
#                            # it, and why this diff did not move its voice
`}# proposal:                # optional, at most one — omit the key entirely if
#   slug: ...               # your review surfaced nothing
# carry:                    # optional, zero or more — omit the key entirely
#   - title: ...             # if you are carrying nothing forward
#     detail: ...
#     subject: ...           # required repository path this concerns
---

Free-form notes: what you checked, what you fetched, what you ran, and what
you observed. Quote the observed output for anything you ran.
\`\`\`

${GROUND_RULES}

${reviewedTail ?? diffTail}`;
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
  return existingFieldValues(ctx, excludeJobId, 'wouldCite').map((e) => ({
    file: e.file,
    wouldCite: e.value,
  }));
}

/**
 * The same sweep for either forced-judgment field. ONE reader, because
 * specs/review words the `reads-human` duplicate rule as "on the same terms"
 * as `would-cite`'s — and two sweeps that agree today are how the two rules
 * stop agreeing later.
 *
 * ONE sweep for the LIST-shaped fields too (`readsHumanFrom` and
 * `wouldCiteFor`), rather than a second walk of the same directory: a
 * carry-forward's `why` — and a per-piece entry's `statement` — are held to
 * the same duplicate rule, so each is collected here, one row per entry, and
 * compared with the same `normalizeField`. A record contributes as many rows
 * as it carries entries; the same record's own rows are excluded by the same
 * job-id rule, which is what lets two entries in ONE record share a statement
 * (one job making the same trivial correction to two posts has one honest
 * sentence to write about both) while a sentence recycled across reviews is
 * refused.
 *
 * @param {'wouldCite'|'readsHuman'|'readsHumanFrom'|'wouldCiteFor'} field the parsed key to collect
 * @returns {Array<{file: string, value: string}>}
 */
export function existingFieldValues(ctx, excludeJobId, field) {
  if (!existsSync(ctx.reviewsDir)) return [];
  const out = [];
  for (const name of readdirSync(ctx.reviewsDir)) {
    if (!name.endsWith('.md') || name === 'README.md') continue;
    // Task 63: the exclusion covers every record of the same job — the job's
    // own record plus every per-page sibling (`<jobId>.reviewed-<i>.md`) —
    // so two pages honestly sharing one sentence are allowed the way two
    // entries in one record are. Previously this excluded only `<jobId>.md`
    // and `<jobId>.pass*`; no such sibling existed then, so the set is
    // unchanged for every existing path.
    if (excludeJobId && isRecordOfJob(name, excludeJobId)) continue;
    let text;
    try {
      text = readFileSync(join(ctx.reviewsDir, name), 'utf8');
    } catch {
      continue;
    }
    const v = parseVerdict(text);
    const val = v[field];
    if (Array.isArray(val)) {
      // List-shaped forced-judgment fields carry their statement under
      // different keys (`why` for a carry-forward, `statement` for a
      // per-piece cite) but one sweep reads both, so the two duplicate
      // rules stay one rule.
      for (const e of val) {
        const statement = e?.why ?? e?.statement;
        if (statement) out.push({ file: name, value: normalizeField(statement) });
      }
    } else if (val) {
      out.push({ file: name, value: normalizeField(val) });
    }
  }
  return out;
}

/**
 * Every other record's `would-cite` answers, for the duplicate check:
 * record-wide fields AND per-piece entry statements, as ONE universe.
 *
 * specs/review refuses an `approve` whose `would-cite` is "exactly identical
 * (after whitespace trimming) to the `would-cite` field or entry of any
 * OTHER existing review record", "entry by entry" for `would-cite-for` —
 * so a sentence recycled from another record's entry into this record's
 * field (or entry) is refused, while two entries in THIS record may match.
 */
export function existingCiteValues(ctx, excludeJobId) {
  return [
    ...existingFieldValues(ctx, excludeJobId, 'wouldCite'),
    ...existingFieldValues(ctx, excludeJobId, 'wouldCiteFor'),
  ];
}

/**
 * The work-order bound check at the merge (Stage 2, tasks 57/58).
 *
 * Re-measures the four configured bounds against the work the job produced:
 * a maximum number of items, a maximum number of distinct subjects, a
 * maximum total of reviewed bytes, and a maximum of reviewed bytes for any
 * one subject. Pure function over its arguments so the gate and the tests
 * share exactly one implementation.
 *
 * - `workOrder` is the committed declaration (`{items, declared_subjects}`).
 * - `subjects` is the measured set to charge the byte bounds against — the
 *   constituted declaration the caller already computed. On an empty-diff
 *   read-and-unchanged outcome that set IS the declared pages, so the gate
 *   measures the pages' reviewed surfaces rather than the empty diff.
 * - `measure` is the injected size seam (`(path) => bytes`, positive
 *   numbers only; anything else reads as 0). Null skips the two byte bounds
 *   — the gate cannot invent sizes — while the two count bounds still bind.
 * - `bounds` is an already-resolved `{maxItems, maxSubjects,
 *   maxReviewedBytes, maxReviewedBytesPerSubject}`. Null resolves to the
 *   task-53 defaults (`WORK_ORDER_DEFAULTS`).
 *
 * @returns {{ok: true, totalBytes: number, perSubjectBytes: object} |
 *            {ok: false, code: 'work-order-bound', reason: string}}
 */
export function checkWorkOrderMergeBounds({ workOrder, subjects = null, measure = null, bounds = null } = {}) {
  const b = bounds ?? { ...(WORK_ORDER_DEFAULTS ?? {}) };
  const maxItems = b.maxItems ?? b.max_items ?? 4;
  const maxSubjects = b.maxSubjects ?? b.max_subjects ?? 4;
  const maxBytes = b.maxReviewedBytes ?? b.max_reviewed_bytes ?? 60000;
  const maxPerSubject = b.maxReviewedBytesPerSubject ?? b.max_reviewed_bytes_per_subject ?? 30000;
  const items = Array.isArray(workOrder?.items) ? workOrder.items : [];
  const declared = Array.isArray(workOrder?.declared_subjects)
    ? workOrder.declared_subjects
    : Array.isArray(workOrder?.declared)
    ? workOrder.declared
    : [];
  const measured = Array.isArray(subjects) ? subjects : [...declared];
  const norm = (p) => String(p ?? '').replace(/\\/g, '/').trim();
  const declaredNorm = [...new Set(declared.map(norm).filter(Boolean))].sort();
  const measuredNorm = [...new Set(measured.map(norm).filter(Boolean))].sort();
  if (items.length > maxItems) {
    return {
      ok: false,
      code: 'work-order-bound',
      reason:
        `work-order-bound: work order carries ${items.length} items over work_order.max_items ${maxItems}`,
    };
  }
  if (declaredNorm.length > maxSubjects) {
    return {
      ok: false,
      code: 'work-order-bound',
      reason:
        `work-order-bound: work order declares ${declaredNorm.length} subjects over work_order.max_subjects ${maxSubjects}`,
    };
  }
  if (typeof measure !== 'function') {
    return { ok: true, totalBytes: 0, perSubjectBytes: {} };
  }
  const perSubjectBytes = {};
  let totalBytes = 0;
  for (const s of measuredNorm) {
    let n = null;
    try {
      n = measure(s);
    } catch {
      n = null;
    }
    const bytes = typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    perSubjectBytes[s] = bytes;
    totalBytes += bytes;
  }
  if (totalBytes > maxBytes) {
    return {
      ok: false,
      code: 'work-order-bound',
      reason:
        `work-order-bound: produced ${totalBytes} reviewed bytes over work_order.max_reviewed_bytes ${maxBytes}`,
    };
  }
  for (const s of measuredNorm) {
    if ((perSubjectBytes[s] ?? 0) > maxPerSubject) {
      return {
        ok: false,
        code: 'work-order-bound',
        reason:
          `work-order-bound: subject ${s} measures ${perSubjectBytes[s]} reviewed bytes over work_order.max_reviewed_bytes_per_subject ${maxPerSubject}`,
      };
    }
  }
  return { ok: true, totalBytes, perSubjectBytes };
}

/**
 * The merge gate. Refuses without an `approve`; refuses an `approve` whose
 * `would-cite` is empty or duplicates an existing record's; and refuses a
 * record whose `reviewed:` paths are not the paths the merge measured.
 *
 * `subjects` is the joinable content paths measured from the branch — the same
 * set `writeRecordSubjects` will write as `subject:`. The two fields are
 * written from one measurement, so they can only disagree if someone edited one
 * by hand, and THAT is precisely the case worth refusing: a record whose
 * `subject:` claims one piece and whose `reviewed:` hashes another passes every
 * other check here while binding an approval to the wrong bytes (design D2).
 *
 * A record carrying no `reviewed:` at all is NOT refused. Every record written
 * before this mechanism existed is one, and the normal path writes `reviewed:`
 * after the merge, not before it — refusing here would refuse every merge.
 *
 * `changed` is the branch's full changed-path list with statuses, from the same
 * measurement `subjects` is derived from. It carries ONE refusal
 * (`unearnedCarriedDeletion`), and it is optional in the same sense `subjects`
 * is: absent, that check does not run.
 *
 * @returns {{ok: boolean, reason?: string, verdict?: object}}
 */
export function mergeGate(ctx, { jobId, type, pass = 1, subjects, changed, workOrder = null, measure = null, bounds = null, recordPath = null }) {
  // Task 63: per-page reviews read their own record (`recordPath`, one per
  // declared page) while the duplicate sweep still excludes every record of
  // the same job — the caller passes the job's own `jobId` (not a suffixed
  // id), so `jobId` already covers the job's own record plus every per-page
  // sibling via `isRecordOfJob`. Without `recordPath` the path and the
  // exclusion are exactly as before.
  const path = typeof recordPath === 'string' && recordPath ? recordPath : verdictPath(ctx, jobId, pass);
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
  const liveHeadings = new Set(requirementHeadings(ctx.repoRoot, ctx.pendingRoot));
  const unresolvedCites = (v.cites ?? []).filter((heading) => !liveHeadings.has(heading));
  if (unresolvedCites.length) {
    return {
      ok: false,
      code: 'cites-unresolved',
      reason:
        `the verdict's \`cites:\` names requirement heading(s) that do not resolve in the live ` +
        `specification: ${unresolvedCites.map((heading) => JSON.stringify(heading)).join(', ')}. ` +
        `Headings are matched exactly after trimming across every capability's constitution and ` +
        `pending amendments; re-issue the verdict with resolvable headings or omit \`cites:\`.`,
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
    // A `would-cite-for`-only record carries no record-wide field: where the
    // entries answer piece by piece, the field has nothing to add, and
    // refusing its absence would make the per-piece shape unwritable. The
    // per-piece coverage refusal below (after the `reviewed:` equality
    // check) is what judges such a record.
    const carriesEntries = (Array.isArray(v.wouldCiteFor) ? v.wouldCiteFor : []).length > 0;
    if (!v.wouldCite && !carriesEntries) {
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
    const mine = normalizeField(v.wouldCite);
    // The duplicate universe is fields AND entries: specs/review refuses a
    // sentence identical to "the `would-cite` field or entry of any OTHER
    // existing review record", so a sentence recycled from another record's
    // per-piece entry into this record's field is refused here.
    const dup = existingCiteValues(ctx, jobId).find((e) => e.value === mine);
    if (dup) {
      return {
        ok: false,
        code: 'would-cite-duplicate',
        reason:
          `\`approve\` whose \`would-cite\` is exactly identical (after whitespace trimming) to ` +
          `the field or entry in ${dup.file}. A recycled sentence is not an answer to the question.`,
        verdict: v,
      };
    }
  }
  // The voice question, on `post` verdicts only — the same two checks, at the
  // same refusal point, as `would-cite` (specs/review: "on the same terms and at
  // the same point it refuses a blank `would-cite`"). Same honesty about the
  // limit, too: a reviewer writing a fresh-but-vacuous sentence each time passes
  // both, and that is accepted. No mechanical check compels judgment. What this
  // one does is make the question ASKED — which matters more here than anywhere
  // else, because the voice lint is advisory and this verdict is the only thing
  // between machine-made prose and the live site.
  //
  // MIRRORED IN `scripts/verify-launch.mjs` since 2026-08-30. It was not, for
  // the window between this gate landing and that repair, and the note is kept
  // because the shape of the miss is worth keeping: nothing was measurably
  // wrong, since `content/blog/` held no posts and the launch check therefore
  // had no post record to be lenient about. The launch check now imports
  // `READS_HUMAN_TYPES` and `needsReadsHuman` from this file rather than
  // restating the scope, so the two ends can only differ by an edit to one of
  // them.
  if (needsReadsHuman(type)) {
    if (!v.readsHuman) {
      return {
        ok: false,
        code: 'reads-human-empty',
        reason:
          `\`approve\` on a post with an empty \`reads-human\` is not a valid verdict ` +
          `(specs/review). The voice question is asked, not merely available: where does this ` +
          `read machine-made, or why does it not? The prebuild voice lint only warns, so this ` +
          `field is the bar. Re-issue the verdict with it answered.`,
        verdict: v,
      };
    }
    const mine = normalizeField(v.readsHuman);
    const dup = existingFieldValues(ctx, jobId, 'readsHuman').find((e) => e.value === mine);
    if (dup) {
      return {
        ok: false,
        code: 'reads-human-duplicate',
        reason:
          `\`approve\` whose \`reads-human\` is exactly identical (after whitespace trimming) to ` +
          `the field in ${dup.file}. A sentence pasted from another post's review is not a ` +
          `judgment about this one's prose.`,
        verdict: v,
      };
    }
  }
  // ---------------------------------------------------------------------
  // N1: an approving verdict on a job whose merged subjects include a blog
  // post answers for EACH such post — afresh, or by carrying a named prior
  // answer forward (specs/review, beads addictedtoai-37rb).
  //
  // KEYED ON `subjects`, NOT ON `type`, and that is the whole point of this
  // branch. The type says what the job was FOR; the merged subjects say what it
  // TOUCHED, and a job of any type may touch a post. Measured: j-20260902-23 is
  // a `repair` (data/ledger.jsonl:68) whose record approves
  // content/blog/glm-5-3-license-revenue-gate.md carrying no `reads-human` and
  // saying so in its own prose — `needsReadsHuman(type)` above asks that
  // reviewer for neither field, so a type-keyed gate never fires on the exact
  // shape this change exists to stop.
  //
  // RESOLVED PER POST. One entry anywhere does not satisfy a record: a job
  // merging two posts would then approve with an entry for post A while post B
  // stayed bound and unanswered, and the launch check would report B as
  // voice-missing — the two-ends drift this refusal exists to prevent. A fresh
  // non-empty `reads-human` answers for every post the record carries no entry
  // for; the requirement asks for one of the two answers, not exactly one.
  //
  // A call with no `subjects` measured is not gated here, exactly as the
  // `reviewed:`/`subject:` equality check below is not.
  const posts = blogPostSubjects(subjects);
  if (posts.length && !v.readsHuman) {
    const answeredFor = new Set(v.readsHumanFrom.map((e) => e.subject));
    const unanswered = posts.filter((p) => !answeredFor.has(p));
    if (unanswered.length) {
      return {
        ok: false,
        code: 'reads-human-empty',
        reason:
          `\`approve\` on a job whose merged subjects include ${unanswered.join(', ')} answers ` +
          `the voice question for neither of the two ways specs/review allows. A \`reads-human\` ` +
          `answers for the bytes its writer read, and this diff changed them, so this verdict ` +
          `must either answer the voice question afresh (where does this post read machine-made, ` +
          `or why does it not?) or carry the prior answer forward in a \`reads-human-from\` entry ` +
          `naming that post, the earlier approving record it stands on, and why this diff did ` +
          `not move that post's voice. Unanswered post(s): ${unanswered.join(', ')}.` +
          (v.readsHumanFromWarnings?.length
            ? ` (Entries skipped as malformed: ${v.readsHumanFromWarnings.join('; ')}.)`
            : ''),
        verdict: v,
      };
    }
  } else if (posts.length && v.readsHuman && !needsReadsHuman(type)) {
    // The other half of "answer the question afresh, in a non-empty,
    // non-duplicated `reads-human`, as above" (specs/review). The branch
    // above enforces non-empty; a fresh field on a job whose TYPE does not
    // itself demand `reads-human` (the `needsReadsHuman(type)` block above
    // already covers the types that do) was never checked against
    // `existingFieldValues` — so a repair merging a post could approve with
    // a `reads-human` copied verbatim from another record's. Same sweep,
    // same normaliser, same refusal code the type-keyed branch uses.
    const mine = normalizeField(v.readsHuman);
    const dup = existingFieldValues(ctx, jobId, 'readsHuman').find((e) => e.value === mine);
    if (dup) {
      return {
        ok: false,
        code: 'reads-human-duplicate',
        reason:
          `\`approve\` on a job whose merged subjects include ${posts.join(', ')} carries a ` +
          `\`reads-human\` exactly identical (after whitespace trimming) to the field in ` +
          `${dup.file}. A sentence pasted from another post's review is not a judgment about ` +
          `this one's prose.`,
        verdict: v,
      };
    }
  }
  // N2: the anchor. Applied to EVERY entry whenever a `reads-human-from` is
  // present — not only inside the branch above — so the three refusals are
  // three separable mechanisms and a record cannot dodge the anchor check by
  // carrying the field on a job the branch does not reach.
  //
  // ONE HOP, NEVER A CHAIN: an anchor whose own record answers only by carrying
  // forward is refused, and the message says so, so the reviewer is sent to
  // name the record that actually answered. Following the chain here would
  // accept records the launch check must then either refuse (two ends
  // disagreeing) or accept by walking the same chain (a hand-written record
  // passing a check the merge refuses).
  for (const [i, e] of v.readsHumanFrom.entries()) {
    const at = `\`reads-human-from\` entry ${i + 1} (subject ${e.subject}, record ${e.record})`;
    if (Array.isArray(subjects) && !subjects.map((s) => String(s).replace(/\\/g, '/')).includes(e.subject)) {
      return {
        ok: false,
        code: 'reads-human-from-unanchored',
        reason:
          `${at} names a post this job did not merge. The merge measured: ` +
          `${subjects.join(', ') || '(none)'}. A carry-forward answers for a post in THIS diff; ` +
          `an entry for any other post answers nothing here.`,
        verdict: v,
      };
    }
    const anchor = readRecordByName(ctx, e.record);
    if (!anchor) {
      return {
        ok: false,
        code: 'reads-human-from-unanchored',
        reason: `${at} names a record that does not exist in ${ctx.reviewsDir}. Name the record the voice verdict actually lives in.`,
        verdict: v,
      };
    }
    if (!recordNamesPath(anchor, e.subject)) {
      return {
        ok: false,
        code: 'reads-human-from-unanchored',
        reason: `${at} names a record that does not name this same piece — ${anchor.name} says nothing about ${e.subject}, so it cannot be where that post's voice verdict lives.`,
        verdict: v,
      };
    }
    if (anchor.verdict.verdict !== 'approve') {
      return {
        ok: false,
        code: 'reads-human-from-unanchored',
        reason: `${at} names ${anchor.name}, which records \`${anchor.verdict.verdict || 'no parseable verdict'}\` and not \`approve\`. A verdict that did not approve the post is not an answer to carry forward.`,
        verdict: v,
      };
    }
    if (!normalizeField(anchor.verdict.readsHuman)) {
      return {
        ok: false,
        code: 'reads-human-from-unanchored',
        reason:
          `${at} names ${anchor.name}, which carries no non-empty \`reads-human\` of its own` +
          (anchor.verdict.readsHumanFrom?.length
            ? ' — it only carries a `reads-human-from` itself, and a carry-forward is one hop and never a chain'
            : '') +
          `. Name the record that actually answered the voice question for ${e.subject}.`,
        verdict: v,
      };
    }
  }
  // N3: the statement, held to the two rules `reads-human` already carries.
  // Non-empty is enforced by the parser (an entry with a blank `why` is dropped
  // and its post is then unanswered above, which is the fail-closed direction);
  // this is the duplicate half, through the ONE sweep and the ONE normaliser
  // `would-cite` and `reads-human` use. Two entries in the SAME record may share
  // a statement — one job making the same trivial correction to two posts has
  // one honest sentence to write about both, and forcing variation there
  // manufactures the judgment the rule exists to catch.
  if (v.readsHumanFrom.length) {
    const others = existingFieldValues(ctx, jobId, 'readsHumanFrom');
    for (const e of v.readsHumanFrom) {
      const mine = normalizeField(e.why);
      const dup = others.find((o) => o.value === mine);
      if (dup) {
        return {
          ok: false,
          code: 'reads-human-from-duplicate',
          reason:
            `the \`reads-human-from\` statement for ${e.subject} is exactly identical (after ` +
            `whitespace trimming) to the statement in ${dup.file}. A sentence pasted from another ` +
            `review is not a judgment about why THIS diff did not move THIS post's voice.`,
          verdict: v,
        };
      }
    }
  }
  if (Array.isArray(subjects)) {
    const hashed = Object.keys(reviewedOf({ data: v.data })).sort();
    if (hashed.length) {
      const measured = [...subjects].sort();
      if (hashed.join('\0') !== measured.join('\0')) {
        return {
          ok: false,
          code: 'reviewed-subject-mismatch',
          reason:
            `the record's \`reviewed:\` names a different set of files than the merge measured. ` +
            `reviewed: ${hashed.join(', ') || '(none)'}; measured for subject: ` +
            `${measured.join(', ') || '(none)'}. One record cannot name one piece and hash ` +
            `another — the two are written from a single measurement, so a difference means the ` +
            `record was edited by hand.`,
          verdict: v,
        };
      }
    }
  }
  // ---------------------------------------------------------------------
  // `would-cite-for`: the quality answer, per prose piece (specs/review,
  // two-desks task 60).
  //
  // PLACED AFTER the `reviewed:`/`subject:` equality check above, and that
  // order is pinned by `review.test.mjs`'s zlq arms: a record whose
  // `reviewed:` names a different set than the merge measured is refused
  // `reviewed-subject-mismatch`, even where its pieces would also fail here.
  //
  // SCOPE, and why a `repair` merging four wiki pages with a record-wide
  // sentence still merges (`work-order.test.mjs`'s task-57 passing arm pins
  // it): the per-entry demand lives INSIDE the would-cite obligation's
  // existing scope. A prose-TYPE job whose merged subjects hold more than
  // one prose piece must answer entry by entry — a record-wide `would-cite`
  // alone satisfies nothing for N>1, and the refusal names the unanswered
  // pieces. A non-prose type keeps its legacy rule (no cite demand), but a
  // record that CARRIES entries is held to them whatever the type: entries
  // present means every prose piece among the measured subjects needs its
  // own entry, and every entry's statement is duplicate-checked. The
  // duplicate rule itself is scope-free — "entry by entry", on every type —
  // because a recycled sentence is recycled whatever job it rode in on.
  //
  // Two entries in the SAME record may carry the same statement (one job
  // making the same trivial correction to two pieces has one honest
  // sentence); the sweep excludes this record's own rows, exactly as the
  // carry-forward's does. A directory row among the subjects requires no
  // entry: it is not a prose piece (`isProsePiece` in `loop/lib/specs.mjs`,
  // the one predicate both this gate and the launch check read).
  //
  // A call with no `subjects` measured is not gated here for coverage,
  // exactly as the `reads-human` N1 branch above is not — but an entry the
  // record carries is still duplicate-checked, which needs no subjects.
  const wouldCiteForEntries = Array.isArray(v.wouldCiteFor) ? v.wouldCiteFor : [];
  if (wouldCiteForEntries.length) {
    const others = existingCiteValues(ctx, jobId);
    for (const e of wouldCiteForEntries) {
      const mine = normalizeField(e.statement);
      const dup = others.find((o) => o.value === mine);
      if (dup) {
        return {
          ok: false,
          code: 'would-cite-for-duplicate',
          reason:
            `the \`would-cite-for\` statement for ${e.subject} is exactly identical (after ` +
            `whitespace trimming) to the field or entry in ${dup.file}. A sentence pasted from another ` +
            `review is not a judgment about THIS piece.`,
          verdict: v,
        };
      }
    }
  }
  if (Array.isArray(subjects)) {
    const pieces = prosePieces(subjects);
    const answeredFor = new Set(wouldCiteForEntries.map((e) => e.subject));
    const unanswered = pieces.filter((p) => !answeredFor.has(p));
    if (unanswered.length && (wouldCiteForEntries.length || (isProse(type) && pieces.length > 1))) {
      return {
        ok: false,
        code: 'would-cite-for-empty',
        reason:
          `\`approve\` on merged subjects holding ${pieces.length} prose piece${pieces.length === 1 ? '' : 's'} ` +
          `(${pieces.join(', ')}) leaves ${unanswered.length} unanswered: ${unanswered.join(', ')}. ` +
          `A record-wide \`would-cite\` alone satisfies nothing where entries are carried or where more ` +
          `than one prose piece is present — each piece requires its own \`would-cite-for\` entry naming ` +
          `it with that piece's own answer (who would link THIS piece, and in what argument?). Re-issue ` +
          `the verdict with an entry per piece.` +
          (v.wouldCiteForWarnings?.length
            ? ` (Entries skipped as malformed: ${v.wouldCiteForWarnings.join('; ')}.)`
            : ''),
        verdict: v,
      };
    }
  }
  // A carried finding retired by deletion alone (beads addictedtoai-jdt8).
  // Measured from the diff, not from the record — see `unearnedCarriedDeletion`
  // for why this shape and not the subject-touching one, and for why nothing
  // under `data/carried/` counts as the work.
  const unearned = unearnedCarriedDeletion(changed);
  if (unearned) {
    return {
      ok: false,
      code: 'carried-deletion-unearned',
      reason:
        `the diff deletes ${unearned.deleted.length} carried finding` +
        `${unearned.deleted.length === 1 ? '' : 's'} (${unearned.deleted.join(', ')}) and ` +
        `changes nothing else. Deleting the file is what RETIRES the finding, so a diff of ` +
        `that shape claims a fix it does not contain. Either make the change the finding ` +
        `asks for in the same diff, or leave the file in place and argue in \`RESULT.md\` ` +
        `that there is nothing to do — this refuses the shape, never the argument.`,
      verdict: v,
    };
  }
  // `corrections:` (specs/review, beads addictedtoai-4fo): front matter is
  // append-only history, and this is its correction path — same shape as
  // `postSchema.corrections` in `lib/schema.mjs`, `[{date, text}]`, so the two
  // places this repo solves "a dated claim was later found wrong" cannot drift
  // into two different rules. Refused here on the same terms as an empty
  // `would-cite`: a malformed entry is a record the merge should not accept,
  // not a warning to notice later.
  if (v.correctionWarnings?.length) {
    return {
      ok: false,
      code: 'corrections-malformed',
      reason:
        `the record's \`corrections:\` entries do not all carry a non-empty ISO \`date\` and ` +
        `\`text\`: ${v.correctionWarnings.join('; ')}. A correction that cannot itself be read ` +
        'is not a correction.',
      verdict: v,
    };
  }
  // Work-order bounds at the merge (Stage 2, tasks 57/58: the enforced-twice
  // bullet's second half). The bundler (`loop/lib/select.mjs`) enforces the
  // same four bounds at selection; this re-measures them against the work the
  // job actually produced. The measured set is the `subjects` argument — the
  // constituted declaration — so on an empty-diff read-and-unchanged outcome
  // the gate measures the declared pages' reviewed surfaces rather than the
  // (empty) diff; measuring an empty diff measures zero, which is exactly the
  // mutation task 58 names. Absent `workOrder` (every pre-task-58 caller,
  // including old-contract branches) this arm does not run: no new refusal
  // for any existing path. Without a `measure` seam only the two count bounds
  // are checked; byte checks need sizes the gate cannot invent.
  if (workOrder !== null && workOrder !== undefined) {
    const boundCheck = checkWorkOrderMergeBounds({
      workOrder,
      subjects,
      measure,
      bounds,
    });
    if (!boundCheck.ok) {
      return { ok: false, code: boundCheck.code, reason: boundCheck.reason, verdict: v };
    }
  }
  return { ok: true, verdict: v, path };
}

/**
 * Run the reviewer, then discard everything it touched.
 *
 * Task 63's per-page split reuses this single implementation (extend, do not
 * fork): callers pass one page per invocation via `reviewedOnly`, with a
 * distinct `outPathOverride` (see `reviewedPerPageRecordPath`) and a distinct
 * `reviewSuffix` for the disposable worktree/brief/log names, so N pages gain
 * N invocations without a second code path. Without those overrides the paths
 * are exactly as before (single-page and non-reviewed callers byte-stable).
 *
 * @returns {Promise<{run: object, discarded: object, branchShaBefore: string,
 *                    branchShaAfter: string, recordWritten: boolean, clearRefused?: string}>}
 *
 * G5: when the pre-dispatch stale-record clear fails and the record persists,
 * the review is NEVER dispatched — the return is a synthetic failure (`run`
 * shaped like `runExecutor`'s contract with `code: 1`, `recordWritten:
 * false`, `clearRefused` naming the refusal), so the existing absent-review
 * machinery fails the job closed with the reason. The train review functions
 * are separate, pre-existing and unflagged — untouched.
 */
export async function runReview(ctx, { jobId, job, branch, diffText, runner, capMinutes, pass = 1, findings = '', gates = null, mmSoFar, invocations = 0, totalMinutes = null, workOrder = null, reviewedOnly = null, reviewedSurfaceText = null, reviewGraphQuery = null, graphIndexId = 'unknown-index', reviewer = null, outPathOverride = null, reviewSuffix = null }) {
  mkdirSync(ctx.reviewsDir, { recursive: true });
  const outPath = typeof outPathOverride === 'string' && outPathOverride ? outPathOverride : verdictPath(ctx, jobId, pass);
  // F8x: clear a stale record at the target before dispatch (best-effort
  // unlink) so `recordWritten` means THIS invocation wrote — on every path
  // (normal, single-page, per-page). Folded from F8's per-page caller-side
  // clear; callers must not clear the same path twice.
  //
  // G5: absent is the expected case — but a record that is STILL THERE after
  // a failed unlink (Windows EPERM/EBUSY locks) must never be dispatched
  // over: `recordWritten: existsSync(outPath)` below would then read the
  // stale record as this invocation's. Absent/gone (ENOENT or a raced
  // deletion) proceeds as before; a persisting record refuses loudly with a
  // synthetic failure shaped like `runExecutor`'s contract, skipping the
  // spawn but returning the full shape — no control-flow changes downstream.
  try {
    unlinkSync(outPath);
    ctx.log(`review: cleared stale record at ${outPath} before dispatch`);
  } catch (e) {
    let stillPresent = e?.code !== 'ENOENT';
    try {
      stillPresent = existsSync(outPath);
    } catch {
      /* an unreadable answer keeps the conservative one above */
    }
    if (stillPresent) {
      const reason =
        `STALE: stale review record at ${outPath} could not be cleared (${e?.message ?? e}) — ` +
        `refusing to dispatch over a record this invocation did not write`;
      ctx.log(reason);
      const shaBefore = gitTry(ctx.repoRoot, ['rev-parse', branch]).stdout.trim();
      return {
        run: { code: 1, killed: false, stdout: '', stderr: reason, mm: 0, ms: 0, command: runner.command },
        outPath,
        recordWritten: false,
        clearRefused: reason,
        discarded: { dirtyBefore: '', dirtyAfter: '', discardedAnything: false },
        branchShaBefore: shaBefore,
        branchShaAfter: shaBefore,
        branchUnchanged: true,
      };
    }
    /* best-effort: absent is the expected case */
  }
  const suffix = typeof reviewSuffix === 'string' && reviewSuffix ? reviewSuffix : '';
  const reviewDir = join(ctx.worktreeRoot, `${jobId}-review-${pass}${suffix}`);
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
    invocations,
    totalMinutes,
    workOrder,
    reviewedOnly,
    reviewedSurfaceText,
    reviewGraphQuery,
    graphIndexId,
    reviewer: reviewer ?? runner ?? null,
  });
  const run = await runExecutor({
    command: runner.command,
    cwd: reviewDir,
    promptText: brief,
    promptPath: join(ctx.worktreeRoot, `${jobId}-review-${pass}${suffix}-brief.md`),
    timeoutMs: capMinutes * 60 * 1000,
    role: 'reviewer',
    jobId,
    logPath: jobLogPath(ctx.worktreeRoot, jobId, `review${pass}${suffix}`),
  });

  // No edit rights, as a mechanism: throw the reviewer's tree away.
  const dirtyBefore = gitTry(reviewDir, ['status', '--porcelain']).stdout.trim();
  gitTry(reviewDir, ['reset', '--hard', 'HEAD']);
  gitTry(reviewDir, ['clean', '-fdx']);
  const dirtyAfter = gitTry(reviewDir, ['status', '--porcelain']).stdout.trim();
  const removed = removeWorktree(ctx.repoRoot, reviewDir);
  if (removed.ok) {
    rmSync(reviewDir, { recursive: true, force: true });
  } else {
    ctx.log(
      `WORKTREE CLEANUP REFUSED: reviewer worktree ${reviewDir} was not removed: ` +
        `${removed.reason}. The directory is left standing.`,
    );
  }
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

/**
 * Content-path membership (Stage 2, task 56, F5): the membership half of
 * `joinableSubjects`, exported so the merge-path graph scope in
 * `loop/run.mjs` tests the same predicate instead of a second copy. Slashes
 * are normalized; the deletion rule is NOT applied here — callers judging
 * diff entries (`joinableSubjects`) apply their own status rule, and callers
 * judging symbol owners have no status to apply.
 *
 * @param {string} p  a repo-relative path (backslashes tolerated)
 */
export function isContentPath(p) {
  const n = String(p ?? '').replace(/\\/g, '/');
  return n.startsWith('content/') && n.endsWith('.md');
}

/** Content files a review record can be joined to. Others cannot be, and are not claimed. */
export function joinableSubjects(changed) {
  const out = [];
  for (const c of changed ?? []) {
    const p = String(typeof c === 'string' ? c : (c?.path ?? '')).replace(/\\/g, '/');
    // A deletion is not a piece anything can review; `D` is the only status
    // whose path does not exist on main after the merge.
    if (typeof c === 'object' && c?.status === 'D') continue;
    if (!isContentPath(p)) continue;
    if (!out.includes(p)) out.push(p);
  }
  return out.sort();
}

/**
 * Write `subject:` and `reviewed:` into an existing verdict record: WHICH files
 * it reviewed, and WHAT they contained.
 *
 * `subject:` alone names a piece; it says nothing about the text that was
 * judged, so an approval survived every later edit to it (beads
 * addictedtoai-zlq). `reviewed:` maps each subject path to the SHA-256 of that
 * file's reviewed surface (`lib/review-hash.mjs`), read from the merged tree —
 * ONE call, ONE measurement, two keys, so the two can never describe different
 * diffs.
 *
 * `subject:`'s value shape does NOT change (design D2). It is read by nine
 * accepted key names in `lib/reviews.mjs` and by hand-written records; carrying
 * the hash inside it would break the join for every record that already exists,
 * which is the opposite of the outcome this is for.
 *
 * If any subject cannot be hashed, NO `reviewed:` is written at all rather than
 * a partial one. The invariant the merge gate enforces is that the two key sets
 * are equal; a partial map would be a record that fails that check on its next
 * reading, for a reason that has nothing to do with what it reviewed.
 *
 * The edit is deliberately surgical — the front-matter block is rewritten with
 * any prior `subject:`/`reviewed:` removed and the new keys appended, and the
 * reviewer's own keys, its notes and its byte-for-byte `would-cite` are left
 * exactly as they were. Re-serialising the record through a YAML writer would
 * reformat a document a human reads as evidence, and the duplicate-`would-cite`
 * check compares that field after nothing but whitespace trimming.
 *
 * @param {string} path         the verdict record
 * @param {string[]} subjects   joinable content paths, repo-relative
 * @param {{repoRoot?: string}} [opts] the merged tree the hashes are read from
 * @returns {{ok: boolean, why?: string, subjects?: string[],
 *            reviewed?: Record<string,string>|null, hashWhy?: string}}
 */
export function writeRecordSubjects(path, subjects, { repoRoot = '' } = {}) {
  if (!subjects?.length) return { ok: false, why: 'no joinable content file merged' };
  if (!existsSync(path)) return { ok: false, why: `no record at ${path}` };
  const text = readFileSync(path, 'utf8');
  const m = /^(﻿?---[ \t]*\r?\n)([\s\S]*?)(\r?\n---[ \t]*(?:\r?\n|$))/.exec(text);
  if (!m) return { ok: false, why: 'the record has no YAML front-matter block to add a key to' };

  let reviewed = null;
  let hashWhy = '';
  if (!repoRoot) {
    hashWhy = 'no merged tree was given to hash the reviewed surfaces against';
  } else {
    const map = {};
    const unreadable = [];
    for (const s of subjects) {
      const h = reviewedHashOfFile(join(repoRoot, s));
      if (h) map[s] = h;
      else unreadable.push(s);
    }
    if (unreadable.length) hashWhy = `could not read ${unreadable.join(', ')} on the merged tree`;
    else reviewed = map;
  }

  const eol = /\r\n/.test(m[1]) ? '\r\n' : '\n';
  // Drop a previous `subject:`/`reviewed:` key and everything indented under
  // it, so re-running on the same record replaces rather than duplicates. The
  // indent test is what makes it work for both shapes: `subject:`'s children
  // are `  - "path"` list items, `reviewed:`'s are `  "path": "<hash>"` pairs.
  const kept = [];
  let dropping = false;
  for (const raw of m[2].split(/\r?\n/)) {
    if (/^(?:subject|reviewed)\s*:/.test(raw)) {
      dropping = true;
      continue;
    }
    if (dropping && /^\s+\S/.test(raw)) continue;
    if (dropping && raw.trim() === '') continue;
    dropping = false;
    kept.push(raw);
  }
  while (kept.length && kept[kept.length - 1].trim() === '') kept.pop();

  const blocks = [
    subjects.length === 1
      ? `subject: ${JSON.stringify(subjects[0])}`
      : ['subject:', ...subjects.map((s) => `  - ${JSON.stringify(s)}`)].join(eol),
  ];
  if (reviewed) {
    blocks.push(
      ['reviewed:', ...subjects.map((s) => `  ${JSON.stringify(s)}: ${JSON.stringify(reviewed[s])}`)].join(eol),
    );
  }
  const front = [...kept, ...blocks].join(eol);
  writeFileSync(path, `${m[1]}${front}${m[3]}${text.slice(m[0].length)}`, 'utf8');
  return { ok: true, subjects, reviewed, hashWhy };
}

/**
 * Used by the seed-review flow and by tests to write a record by hand.
 *
 * `readsHuman` is written only when given. An empty string must produce a
 * record with NO `reads-human` key rather than an empty one, because both are
 * refused by the merge gate for a post and only the first is honest about what
 * the caller supplied.
 *
 * `readsHumanFrom` is written on exactly the same terms: an EMPTY LIST produces
 * no key at all, never an empty one, because absent and empty are different
 * findings and the gate distinguishes them — absent is "this record answers
 * afresh or not at all", empty is "the reviewer wrote a carry-forward block
 * that answers for nothing". Written as a YAML list of mappings, one per post,
 * so the record round-trips through `parseReadsHumanFrom` unchanged.
 *
 * `wouldCiteFor` is written on exactly the same terms again: an EMPTY LIST
 * produces no key, and one mapping per prose piece (`subject` + `statement`),
 * round-tripping through `parseWouldCiteFor` unchanged.
 */
export function writeVerdictRecord(ctx, jobId, { verdict, reasons = [], wouldCite = '', cites = [], readsHuman = '', readsHumanFrom = [], wouldCiteFor = [], notes = '', pass = 1, reviewer = '' }) {
  mkdirSync(ctx.reviewsDir, { recursive: true });
  const p = verdictPath(ctx, jobId, pass);
  const carried = (Array.isArray(readsHumanFrom) ? readsHumanFrom : [readsHumanFrom]).filter(Boolean);
  const perPiece = (Array.isArray(wouldCiteFor) ? wouldCiteFor : [wouldCiteFor]).filter(Boolean);
  const cited = (Array.isArray(cites) ? cites : [cites])
    .map((heading) => String(heading ?? '').trim())
    .filter(Boolean);
  const fm = [
    '---',
    `job: ${jobId}`,
    `verdict: ${verdict}`,
    `reasons: [${reasons.join(', ')}]`,
    `would-cite: ${JSON.stringify(wouldCite)}`,
    cited.length
      ? ['cites:', ...cited.map((heading) => `  - ${JSON.stringify(heading)}`)].join('\n')
      : null,
    readsHuman ? `reads-human: ${JSON.stringify(readsHuman)}` : null,
    carried.length
      ? [
          'reads-human-from:',
          ...carried.map((e) =>
            [
              `  - subject: ${JSON.stringify(String(e.subject ?? ''))}`,
              `    record: ${JSON.stringify(String(e.record ?? ''))}`,
              `    why: ${JSON.stringify(String(e.why ?? ''))}`,
            ].join('\n'),
          ),
        ].join('\n')
      : null,
    perPiece.length
      ? [
          'would-cite-for:',
          ...perPiece.map((e) =>
            [
              `  - subject: ${JSON.stringify(String(e.subject ?? ''))}`,
              `    statement: ${JSON.stringify(String(e.statement ?? ''))}`,
            ].join('\n'),
          ),
        ].join('\n')
      : null,
    reviewer ? `reviewer: ${reviewer}` : null,
    // LOCAL, not UTC. `date:` on a review record is the first category in
    // CLAUDE.md's convention paragraph by name, and `lib/reviews.mjs` compares
    // it against the corpus's other local dates (beads addictedtoai-nmr). This
    // read `toISOString().slice(0, 10)` until 2026-08-31, so an evening review
    // — the Desk runs unattended — stamped tomorrow onto the record.
    `date: ${localDate(ctx.now())}`,
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

// ---------------------------------------------------------------------------
// Train review seal (Stage-1 U4, rows 41-42).
//
// The train review is sealed from the per-job verdicts and reports what they
// missed. Two executor invocations, each in its own disposable worktree:
//   1. `runTrainReview` — the reviewer reads the whole train diff, the
//      committed manifest and the kind checklists, in a tree from which the
//      train's merges' per-job verdict records have been REMOVED, and writes
//      the train verdict record (ordinary protocol, gated by
//      `trainReviewGate` — the same refusals as `mergeGate`, by delegation
//      rather than by a second implementation).
//   2. `runTrainComparison` — a SEPARATE invocation with its own (unredacted)
//      tree compares the train verdict's findings against the per-job
//      records' text and reports the findings present in none of them; the
//      count lands on the train line as `findings_not_in_any_record`.
// `reviewTrain` composes both into the `review({diffText, manifest, repo})`
// seam `train.mjs` runs. Anything absent, empty or malformed fails closed.
// ---------------------------------------------------------------------------

/**
 * Where the train verdict record lives: the ORDINARY per-job path for the
 * train id (`<trainId>.md`), deliberately NOT a second path scheme.
 *
 * `trainReviewGate` below delegates to `mergeGate`, which reads exactly this
 * path — one gate, one parser, no fork. There is no collision with the
 * redaction: train ids (`t-<sha8>`) and job ids (`j-<date>-<seq>`) are
 * disjoint namespaces, and the redaction removes only the manifest's merge
 * job ids, never the train id itself.
 */
export function trainVerdictPath(ctx, trainId) {
  return verdictPath(ctx, trainId, 1);
}

/** Where the comparison invocation writes its `missing:` report. */
export function trainComparisonPath(ctx, trainId) {
  return join(ctx.reviewsDir, `${trainId}.train-compare.md`);
}

/**
 * Remove the train's merges' per-job verdict records from a review worktree.
 *
 * Runs AFTER the checkout (the records are committed files, so they arrive
 * with it) and removes `<jobId>.md` plus any `<jobId>.pass<N>.md` delta
 * records, for every merge job id in the manifest. The train's own record
 * is never among them (disjoint id namespaces — see `trainVerdictPath`).
 *
 * Returns `{removed, missing}` — names, so the caller proves the removal
 * rather than asserting the intent. A job with no record on the tree is
 * reported missing, not failed: the seal holds either way.
 */
export function redactTrainRecords(worktreeReviewsDir, jobIds) {
  let files = [];
  try {
    files = readdirSync(worktreeReviewsDir);
  } catch {
    files = [];
  }
  const removed = [];
  const missing = [];
  for (const id of jobIds ?? []) {
    const hits = files.filter((f) => f === `${id}.md` || (f.startsWith(`${id}.pass`) && f.endsWith('.md')));
    if (!hits.length) {
      missing.push(id);
      continue;
    }
    for (const h of hits) {
      try {
        rmSync(join(worktreeReviewsDir, h));
      } catch {
        // A file that cannot be removed is reported by its absence from
        // `removed`, which the caller reads as a failed seal.
        continue;
      }
      removed.push(h);
    }
  }
  return { removed, missing };
}

/**
 * The job types the train's merges were authored as, read off the ledger
 * through the manifest's job ids. The manifest carries no types (E-closure:
 * it gains ONLY the row-43 `review_rounds` pair-list), so the ledger join is
 * the only honest source — the same types the per-job reviews were held to.
 *
 * Unknown (no ledger line for a merge job id, unreadable ledger) fails
 * closed: without a kind there is no checklist, and `checklistFor` refuses
 * to invent one.
 */
export function trainKinds(ctx, manifest) {
  let lines;
  try {
    lines = readLedger(ctx);
  } catch (e) {
    return { ok: false, reason: `cannot read the ledger to kind the train's merges (${e.message ?? String(e)}) — no checklist without a kind` };
  }
  const byId = new Map((lines ?? []).map((l) => [l && l.id, l && l.type]));
  const kinds = [];
  for (const m of (manifest && manifest.merges) || []) {
    const t = byId.get(m && m.jobId);
    if (!t) {
      return { ok: false, reason: `no ledger line for merge job ${JSON.stringify(m && m.jobId)} — cannot choose its checklist, so the train brief is refused` };
    }
    if (!kinds.includes(t)) kinds.push(t);
  }
  return { ok: true, kinds };
}

/**
 * The train's reviewer rung: the run's resolved reviewer, or the registry default.
 *
 * Effort is per-entry descriptive and never a selector: every entry reviews at
 * its own command-encoded highest effort, so this function never reads
 * `effort` at all. An explicitly threaded reviewer id that is reviewer-cleared
 * WINS; unknown or not reviewer-cleared fails closed. Absent an id, resolution
 * is exactly `pickRunner` without an id (registry default if reviewer-cleared,
 * else first reviewer-cleared entry) — reused here, never reimplemented. The
 * train reads the rung and names no model: the entry's own command is the
 * invocation, so no model, provider or harness literal appears anywhere on
 * this code path.
 *
 * Takes the parsed registry (registry-owned values only), so tests pin the
 * policy without touching the reserved `runners.yml`.
 */
export function trainReviewerRung(registry, { reviewerId } = {}) {
  try {
    const rung = pickRunner(registry, { id: reviewerId, role: 'reviewer' });
    return { ok: true, rung };
  } catch (e) {
    return { ok: false, reason: `${e.message ?? String(e)} — the train review names no fallback model, so it is refused` };
  }
}

/**
 * The per-subject graph summary for a train review (two-desks task 60).
 *
 * ONE row per subject of the train's manifest subject set, rendered from a
 * single graph change analysis run over the train range — the SAME analysis
 * shape task 56's merge-path seam returns (`{absent, partial, truncated,
 * symbols: [{name, owner}], processes, subjects: {<path>: {universe,
 * symbols, risk}}}`): changed symbols with their content-path owners per
 * subject, the subject's risk word, and the incomplete flags verbatim.
 * Affected processes are train-wide in the analysis shape (no per-subject
 * linkage exists to attribute them by), so they ride the intro line,
 * labelled train-wide, rather than invented per row.
 *
 * NEVER from per-job verdict records: this function takes no records, reads
 * no records, and its inputs (`subjects`, `analyse`) carry none — so a
 * summary derived from verdict text (task 61's mutation C) cannot pass
 * through this path, only around it. The seal arm proves the property on
 * the assembled brief's text.
 *
 * Never throws and never refuses: absent analysis, a throwing seam, or a
 * subject outside any symbol universe each render as a row (`graph: absent`
 * / `no-symbols`), and incomplete flags appear verbatim without blocking —
 * the train review gate reads the verdict's per-piece entries, never this
 * summary. Rows share `formatGraphRow` with the per-job annex, so the row
 * width and the cut marker stay one list.
 *
 * @param {object} o
 * @param {string[]} o.subjects the manifest's subject set
 * @param {() => object|null} [o.analyse] injected graph-analysis seam
 *   (task-12 fixture pattern); tests stub it, production closes it over
 *   the train range. Null/absent renders the absent note on every row.
 * @param {{base?: string|null, ref?: string|null}} [o.range] the analysed
 *   range, printed for provenance only
 * @returns {{summaryText: string, rows: Array<{subject: string, text: string}>, absent: boolean}}
 */
export function assembleTrainGraphSummary({ subjects, analyse = null, range = null } = {}) {
  const norm = (p) => String(p ?? '').replace(/\\/g, '/').trim();
  const wanted = [...new Set((Array.isArray(subjects) ? subjects : []).map(norm).filter(Boolean))].sort();
  const base = norm(range?.base ?? '');
  const ref = norm(range?.ref ?? '');
  const provenance = base || ref
    ? `over the train range ${base ? `\`${base.slice(0, 12)}\`` : '(unpinned base)'}..${ref ? `\`${ref.slice(0, 12)}\`` : '(unpinned tip)'}`
    : 'over the train range';
  const intro =
    `Derived from the graph change analysis ${provenance}, from the manifest's subject set and the diff — ` +
    `never from per-job verdict records, which were redacted from this tree. One row per subject; ` +
    `incomplete flags appear verbatim and never block the train alone.`;
  let analysis = null;
  let absentReason = 'no train graph analysis wired on this path';
  if (typeof analyse === 'function') {
    try {
      analysis = analyse();
    } catch (err) {
      analysis = null;
      absentReason = `the train graph analysis threw (${err?.message ?? String(err)})`;
    }
  }
  if (!analysis || analysis.absent) {
    const reason = (!analysis ? absentReason : null) ?? String(analysis?.reason ?? '').trim() ?? absentReason;
    const rows = wanted.map((subject) => ({
      subject,
      text: formatGraphRow(subject, `graph: absent — ${reason || absentReason}; judge the diff without it`),
    }));
    return {
      summaryText:
        `## Per-subject graph summary\n\n${intro}\n\n${rows.map((r) => r.text).join('\n') || '- (no subjects)'}\n`,
      rows,
      absent: true,
    };
  }
  const symbols = Array.isArray(analysis.symbols) ? analysis.symbols : [];
  const universes =
    analysis.subjects && typeof analysis.subjects === 'object' ? analysis.subjects : {};
  const processes = Array.isArray(analysis.processes) ? analysis.processes : [];
  const processNames = processes.map((p) => String(p?.name ?? p)).filter(Boolean);
  const owned = new Map(wanted.map((s) => [s, []]));
  for (const sym of symbols) {
    const owner = norm(sym?.owner ?? '');
    if (owner && owned.has(owner)) owned.get(owner).push(String(sym?.name ?? '?'));
  }
  const SEVERITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  let highest = null;
  const rows = wanted.map((subject) => {
    const entry = universes[subject];
    if (!entry || entry.universe === false) {
      return { subject, text: formatGraphRow(subject, 'no-symbols — no changed symbol owned here; risk LOW') };
    }
    const names = [...new Set(owned.get(subject) ?? [])];
    const symText = names.length ? names.join(', ') : '(no owned changed symbols)';
    const risk = typeof entry.risk === 'string' && entry.risk ? entry.risk : 'UNKNOWN';
    if (SEVERITY.includes(risk) && (highest === null || SEVERITY.indexOf(risk) > SEVERITY.indexOf(highest))) {
      highest = risk;
    }
    const flags = [];
    if (analysis.partial || entry.partial) flags.push('partial');
    if (analysis.truncated || entry.truncated) flags.push('truncated');
    if (risk === 'UNKNOWN') flags.push('UNKNOWN');
    const body =
      `symbols ${symText}; risk ${risk}` +
      (flags.length ? `; unresolved-graph (${flags.join('/')})` : '');
    return { subject, text: formatGraphRow(subject, body) };
  });
  const head =
    `Affected processes (train-wide): ${processNames.length ? `${processNames.length} (${processNames.slice(0, 5).join(', ')}${processNames.length > 5 ? ', …' : ''})` : '0'}. ` +
    `Highest subject risk: ${highest ?? 'UNKNOWN'}.`;
  return {
    summaryText:
      `## Per-subject graph summary\n\n${intro}\n\n${head}\n\n${rows.map((r) => r.text).join('\n') || '- (no subjects)'}\n`,
    rows,
    absent: false,
  };
}

/**
 * Assemble the TRAIN reviewer's brief (row 41; per-subject graph summary row 60):
 * the whole train diff, the committed manifest (merge shas, job ids, subjects),
 * the checklists of every kind the train touches (via the same `checklistFor`
 * the sibling assembly reads — an unknown kind throws, failing the assembly
 * closed), the reviewer rung read from the registry, the per-subject graph
 * summary — and NO per-job verdict record. The seal is by construction: this
 * function never receives the records, so no interpolation can leak them; the
 * test proves the property on the text.
 *
 * `trainGraphAnalysis` is the injected graph-analysis seam (task-12 fixture
 * pattern): `({repoRoot, base, ref, subjects}) => analysis`, the train-range
 * form of the merge-path seam task 56 runs. Tests stub it and assert on its
 * recorded argv (the range pins, never verdict text); production passes
 * nothing until a train-range analysis is wired, and the section then renders
 * the absent note. The assembled summary lives in the brief text only — in no
 * tree, counted by no bound — and no summary file is persisted anywhere by
 * this path, so there is nothing to commit inside or outside `.train/`.
 */
export function assembleTrainReviewBrief(
  ctx,
  { trainId, diffText, manifest, kinds, rung, outPath, capMinutes = 0, mmSoFar, invocations = 0, totalMinutes = null, trainGraphAnalysis = null, graphBase = null, graphRef = null },
) {
  const repoRoot = ctx?.repoRoot ?? null;
  const uniqKinds = [...new Set(kinds ?? [])];
  if (!uniqKinds.length) {
    throw new Error('review: no kinds for the train brief — without a kind there is no checklist, so the brief is refused rather than assembled against the wrong list.');
  }
  const checklistBlocks = uniqKinds
    .map((k) => `### ${k}\n\n${checklistFor(k).map((c) => `- ${c}`).join('\n')}`)
    .join('\n\n');
  const subjects = [...new Set(((manifest && manifest.merges) || []).flatMap((m) => m.subjects || []))].sort();
  const proseKinds = uniqKinds.filter((k) => isProse(k));
  const posts = blogPostSubjects(subjects);
  const rungLine = rung && rung.id
    ? `\`${rung.id}\` (provider \`${rung.provider ?? '?'}\`, tier \`${rung.tier ?? '?'}\`) — read from the registry at review time; no model is named here.`
    : '(no rung — the review must not run)';
  const merges = ((manifest && manifest.merges) || [])
    .map((m) => `- \`${String(m.sha).slice(0, 12)}\` job \`${m.jobId}\`: ${((m.subjects || []).join(', ') || '(no subjects)')}`)
    .join('\n');
  // The per-subject graph summary (task 60): one analysis over the train
  // range, from the manifest's subject set and the diff — never from per-job
  // verdict records, which this function never receives. The seam's argv
  // pins the range (base from the manifest's main tip unless the caller
  // overrides it, ref from the caller); a stub that returns verdict text is
  // a summary ABOUT verdict text, which the seal arm refuses — the shape
  // cannot carry what its inputs never held.
  const graphSubjects = [...subjects];
  const graphRangeBase = graphBase ?? (manifest && manifest.mainTip) ?? null;
  const graphSummary = assembleTrainGraphSummary({
    subjects: graphSubjects,
    analyse:
      typeof trainGraphAnalysis === 'function'
        ? () => trainGraphAnalysis({ repoRoot, base: graphRangeBase, ref: graphRef, subjects: [...graphSubjects] })
        : null,
    range: { base: graphRangeBase, ref: graphRef },
  }).summaryText;
  return `# Train review — ${trainId}

You are the train reviewer. You have fresh context: you have not seen any
author's reasoning, and — unlike every other reviewer in this repository —
you have not seen the PER-JOB VERDICTS either. The worktree you run in had
the per-job verdict records of this train's merges REMOVED before you
arrived. Judge the diff below on its own, against the manifest and the
checklists. You have **no edit rights** — any change you make to this
worktree is thrown away, so do not try to fix anything. Your only accepted
output is the train verdict record.

## What you received — state this first

Open your verdict record's notes by listing exactly what this brief gave
you: the diff file list below, the ${((manifest && manifest.merges) || []).length} manifest merges, and these
checklist kinds: ${uniqKinds.map((k) => `\`${k}\``).join(', ')}. If you can
read any per-job verdict record from this tree, the seal has failed: say so
first and write nothing else.

## The train

Committed manifest \`.train/manifest.json\` at review time (merge shas, job
ids, subjects). Main tip it was measured against: \`${String((manifest && manifest.mainTip) || '').slice(0, 12)}\`.

${merges || '- (no merges)'}

## The whole train diff

The loop computed this diff itself from the train state, INCLUDING
uncommitted rederived data; it is not any author's account of what changed.

\`\`\`diff
${diffText.length > 200000 ? diffText.slice(0, 200000) + '\n... [diff truncated at 200 KB]' : diffText}
\`\`\`

${graphSummary}
${runShapeSection({ capMinutes, mmSoFar, invocations, totalMinutes })}
## Your standing instruction

**For every claim about what something does, run the cheap direct check. For
every sourced claim, confirm the source supports it.** The defect class this
review exists to catch is the claim written from intent rather than
measurement — and, for a train, the finding every per-job verdict missed:
each merge was judged alone, and what breaks is what they do together.

## Checklists — one per kind this train touches

${checklistBlocks}

${corroborationSection()}
${polaritySection()}
## Reviewer rung

${rungLine}

## The verdict

Return exactly one verdict: \`approve\`, \`revise\` (naming the required
changes), or \`reject\`. Give one or more reasons **from this closed list**:

${REASONS.map((r) => `- \`${r}\``).join('\n')}

${proseKinds.length ? `**Required, non-empty: \`would-cite\`.** This train touches prose (kinds: ${proseKinds.map((k) => `\`${k}\``).join(', ')}). Answer in your own words, one sentence per prose merge: who would link it, and in what argument? An \`approve\` with this field blank, or with text identical to another review record's, is refused at merge. Answer the question; do not fill the field.

**Where the train's subjects hold more than one prose piece, answer once PER PIECE** in a \`would-cite-for\` list — one entry per piece naming the merged path (\`subject:\`) with that piece's own answer (\`statement:\`); a record-wide \`would-cite\` alone satisfies nothing for N>1, and a piece left with no entry is refused exactly as a blank \`would-cite\` is. The graph summary above is presented beside each piece's entries for your judgment within the train's subject bound; it adds no piece list of its own.
` : `\`would-cite\`: this train touches no prose kind, so the field is not required. Leave it out rather than inventing an answer.
`}${posts.length || uniqKinds.some((k) => needsReadsHuman(k)) ? `
**Voice.** This train merges ${posts.length ? posts.join(', ') : 'a post kind'}: an \`approve\` must answer the voice question — where does it read machine-made, or why does it not? — in a non-empty \`reads-human\`, or carry the prior answer forward per post in a \`reads-human-from\` entry naming the post, the earlier approving record, and why this train's diff did not move its voice. Same duplicate rules as \`would-cite\`.
` : ''}
## Findings — what the per-job verdicts missed

List every defect this train carries that its per-job verdicts did not stop,
in the front matter below as \`findings:\` — one entry per finding:

\`\`\`
findings:
  - text: <what is wrong, concretely — quote the bytes>
    merges: [<merge sha or job id this finding names, ...>]   # EMPTY when the finding names no merge
\`\`\`

Name merges EXACTLY (full sha or job id from the manifest above). A finding
naming no merge rejects the whole train; findings that name merges evict
them. An empty \`findings:\` on a non-approval rejects the whole train — a
refusal that names nothing cannot be answered.

## Write your verdict here

Write the verdict record to this exact absolute path — it is deliberately
**outside** the worktree you are reviewing:

\`${String(outPath).replace(/\\/g, '/')}\`

The file is markdown with YAML front matter:

\`\`\`
---
train: ${trainId}
job: ${trainId}
verdict: approve            # or revise / reject
reasons: []                 # from the closed list above; required unless approve
would-cite: >-
  <your own-words answer, one sentence per prose merge; omit when the train touches no prose>
# would-cite-for:          # required when the train's subjects hold MORE THAN ONE
#   - subject: ...          # prose piece: one entry per piece, naming the merged
#     statement: ...        # path, with THAT piece's own answer. A record-wide
#                          # \`would-cite\` alone satisfies nothing for N>1.
findings:                   # omit the key entirely when there are no findings
  - text: <the finding>
    merges: [<sha or job id, ...>]   # or [] when it names no merge
---

Free-form notes: open with the received-files list above, then what you
checked, what you fetched, what you ran, and what you observed. Quote the
observed output for anything you ran.
\`\`\`

${GROUND_RULES}
`;
}

/**
 * The sealed invocation (row 41): the reviewer runs in a disposable worktree
 * from which the train's merges' per-job verdict records have been REMOVED.
 * Reuses the disposable-worktree machinery (`addWorktree`, `runExecutor`,
 * unconditional discard) — extends it, never a second invoker: `invoke` is
 * the executor seam (tests stub it; production passes nothing and the real
 * `runExecutor` runs).
 *
 * `ref` is the commit the sealed tree checks out detached (the caller passes
 * the train tip sha — no branch name is needed and none is moved). Removal
 * happens AFTER the checkout, at `<tree>/<reviews-relative>/<jobId>.md`
 * (plus `.pass<N>` delta records). The tree is discarded unconditionally;
 * the verdict record lands outside it, like the sibling's.
 */
export async function runTrainReview(ctx, {
  trainId, ref, diffText, manifest, kinds, runner, capMinutes = 0,
  mmSoFar, invocations = 0, totalMinutes = null, invoke = null,
  trainGraphAnalysis = null, graphBase = null,
}) {
  mkdirSync(ctx.reviewsDir, { recursive: true });
  const outPath = trainVerdictPath(ctx, trainId);
  const reviewDir = join(ctx.worktreeRoot, `${trainId}-train-review`);
  rmSync(reviewDir, { recursive: true, force: true });
  mkdirSync(ctx.worktreeRoot, { recursive: true });

  const before = gitTry(ctx.repoRoot, ['rev-parse', 'HEAD']).stdout.trim();
  addWorktree(ctx.repoRoot, reviewDir, ref, { detach: true });

  const rel = relative(ctx.repoRoot, ctx.reviewsDir);
  if (!rel || rel.startsWith('..')) {
    throw new Error(`train review: reviews dir ${ctx.reviewsDir} is outside the repository — the sealed tree cannot redact it`);
  }
  const redacted = redactTrainRecords(join(reviewDir, rel), ((manifest && manifest.merges) || []).map((m) => m.jobId));

  const rung = runner && runner.id ? runner : { id: 'unwired-reviewer', provider: 'unwired-provider', tier: 'unwired-tier' };
  const brief = assembleTrainReviewBrief(ctx, {
    trainId, diffText, manifest, kinds, rung, outPath,
    capMinutes, mmSoFar, invocations, totalMinutes,
    trainGraphAnalysis, graphBase, graphRef: ref,
  });
  const invoker = invoke ?? runExecutor;
  const run = await invoker({
    command: rung.command,
    cwd: reviewDir,
    promptText: brief,
    promptPath: join(ctx.worktreeRoot, `${trainId}-train-review-brief.md`),
    timeoutMs: capMinutes * 60 * 1000,
    role: 'reviewer',
    jobId: trainId,
    logPath: jobLogPath(ctx.worktreeRoot, trainId, 'train-review'),
  });

  const dirtyBefore = gitTry(reviewDir, ['status', '--porcelain']).stdout.trim();
  gitTry(reviewDir, ['reset', '--hard', 'HEAD']);
  gitTry(reviewDir, ['clean', '-fdx']);
  const dirtyAfter = gitTry(reviewDir, ['status', '--porcelain']).stdout.trim();
  const removed = removeWorktree(ctx.repoRoot, reviewDir);
  if (removed.ok) {
    rmSync(reviewDir, { recursive: true, force: true });
  } else {
    ctx.log(
      `WORKTREE CLEANUP REFUSED: train reviewer worktree ${reviewDir} was not removed: ` +
        `${removed.reason}. The directory is left standing.`,
    );
  }
  const after = gitTry(ctx.repoRoot, ['rev-parse', 'HEAD']).stdout.trim();

  return {
    run,
    outPath,
    recordWritten: existsSync(outPath),
    redacted,
    discarded: { dirtyBefore, dirtyAfter, discardedAnything: Boolean(dirtyBefore) },
    headBefore: before,
    headAfter: after,
    headUnchanged: before === after,
  };
}

/**
 * The comparison (row 41): a SEPARATE invocation with its own tree. Where
 * the sealed review must NOT see the per-job records, this one must: it
 * reads the train verdict's findings against every per-job record's text and
 * reports the findings present in NONE of them — "what they missed". Its
 * tree is fresh, unredacted, and discarded unconditionally, like the first.
 */
export async function runTrainComparison(ctx, {
  trainId, ref, trainRecordText, perJobTexts, runner, capMinutes = 0, invoke = null,
}) {
  mkdirSync(ctx.reviewsDir, { recursive: true });
  const outPath = trainComparisonPath(ctx, trainId);
  const compareDir = join(ctx.worktreeRoot, `${trainId}-train-compare`);
  rmSync(compareDir, { recursive: true, force: true });
  mkdirSync(ctx.worktreeRoot, { recursive: true });

  addWorktree(ctx.repoRoot, compareDir, ref, { detach: true });

  const rung = runner && runner.id ? runner : { id: 'unwired-reviewer', provider: 'unwired-provider', tier: 'unwired-tier' };
  const records = Object.entries(perJobTexts ?? {})
    .map(([name, text]) => `### ${name}\n\n${text}`)
    .join('\n\n');
  const brief = `# Train comparison — ${trainId}

You are comparing, not reviewing. Below is the train verdict's record, then
every per-job verdict record of this train's merges. For each finding the
train verdict lists under \`findings:\`, say whether any per-job record
already states it — same defect, not same words. Report the findings present
in NONE of the per-job records.

## The train verdict record

\`\`\`
${trainRecordText ?? '(no train record)'}
\`\`\`

## The per-job records

${records || '(no per-job records)'}

## Write your report here

Write to this exact absolute path — deliberately **outside** the worktree:

\`${String(outPath).replace(/\\/g, '/')}\`

The file is markdown with YAML front matter carrying the machine-readable
answer:

\`\`\`
---
train: ${trainId}
missing:
  - <one entry per train finding present in no per-job record, quoting the finding's text>
---

Free-form notes: for each train finding, where (if anywhere) a per-job
record states it.
\`\`\`

An empty \`missing: []\` is a complete answer — it says the per-job records
caught everything the train found. Omit nothing: every train finding is
either quoted under \`missing:\` or placed in a per-job record in your notes.

${GROUND_RULES}
`;
  const invoker = invoke ?? runExecutor;
  const run = await invoker({
    command: rung.command,
    cwd: compareDir,
    promptText: brief,
    promptPath: join(ctx.worktreeRoot, `${trainId}-train-compare-brief.md`),
    timeoutMs: capMinutes * 60 * 1000,
    role: 'reviewer',
    jobId: trainId,
    logPath: jobLogPath(ctx.worktreeRoot, trainId, 'train-compare'),
  });

  gitTry(compareDir, ['reset', '--hard', 'HEAD']);
  gitTry(compareDir, ['clean', '-fdx']);
  const removed = removeWorktree(ctx.repoRoot, compareDir);
  if (removed.ok) {
    rmSync(compareDir, { recursive: true, force: true });
  } else {
    ctx.log(
      `WORKTREE CLEANUP REFUSED: train comparison worktree ${compareDir} was not removed: ` +
        `${removed.reason}. The directory is left standing.`,
    );
  }

  return { run, outPath, recordWritten: existsSync(outPath) };
}

/**
 * Read the comparison report: the `missing:` list. Absent file, absent key
 * or non-list value FAILS CLOSED — an unreadable comparison cannot become a
 * zero on the train line. (This parses OUR comparison file, not a verdict
 * record: the single-verdict-parser rule is untouched.)
 */
export function parseTrainComparison(text) {
  if (!text || !String(text).trim()) {
    return { ok: false, reason: 'the train comparison report is absent or empty — the not-in-any-record count is unknown' };
  }
  let data = null;
  try {
    data = matter(String(text)).data ?? null;
  } catch {
    data = null;
  }
  if (!data || typeof data !== 'object') {
    return { ok: false, reason: 'the train comparison report has no readable front matter — the not-in-any-record count is unknown' };
  }
  const raw = data.missing;
  if (raw === undefined || raw === null) {
    return { ok: false, reason: 'the train comparison report carries no `missing:` list — the not-in-any-record count is unknown' };
  }
  const list = Array.isArray(raw) ? raw : [raw];
  const missing = list.map((e) => String(e ?? '').trim()).filter(Boolean);
  if (missing.length !== list.length) {
    return { ok: false, reason: 'the train comparison report carries blank `missing:` entries — the not-in-any-record count is unknown' };
  }
  return { ok: true, missing };
}

/**
 * The train verdict's `findings:`, read from the ONE parse (`parseVerdict`
 * in `verdict.mjs` — never a second parser: an entry is `v.data.findings`,
 * the way `subject:` is read off the same parse). Each entry needs a
 * non-empty `text`; `merges` is a sha-or-job-id scalar-or-list, empty when
 * the finding names no merge. Malformed entries are DROPPED with a warning —
 * the fail-closed direction, because a dropped entry names nothing and a
 * non-approval that names nothing rejects the whole train.
 */
export function parseTrainFindings(parsed) {
  const data = (parsed && typeof parsed === 'object' && parsed.data) ? parsed.data : {};
  const raw = data.findings;
  if (raw === undefined || raw === null) return { findings: [], findingWarnings: [] };
  const list = Array.isArray(raw) ? raw : [raw];
  const findings = [];
  const findingWarnings = [];
  list.forEach((entry, i) => {
    const at = `findings[${i}]`;
    if (typeof entry === 'string') {
      const text = entry.trim();
      if (!text) findingWarnings.push(`${at}: blank text — dropped`);
      else findings.push({ text, merges: [] });
      return;
    }
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      findingWarnings.push(`${at}: not a mapping with text/merges — dropped`);
      return;
    }
    const text = String(entry.text ?? '').trim();
    if (!text) {
      findingWarnings.push(`${at}: no non-empty \`text\` — dropped`);
      return;
    }
    const mraw = entry.merges ?? entry.merge ?? [];
    const mlist = Array.isArray(mraw) ? mraw : [mraw];
    const merges = mlist.map((m) => String(m ?? '').trim()).filter(Boolean);
    findings.push({ text, merges });
  });
  return { findings, findingWarnings };
}

/**
 * Partition the findings against the manifest: which train merges each
 * finding names, and which findings name NO train merge. A merge is named by
 * full sha, by unambiguous sha prefix, or by job id; anything else — prose
 * naming a file, a merge from another train, or a blank list — names no
 * merge and rejects the whole train. Named shas come back in manifest
 * (oldest-first) order, the eviction order the red path already uses.
 */
export function trainFindingsNamingMerges(findings, manifest) {
  const merges = ((manifest && manifest.merges) || []).map((m) => ({ sha: String(m.sha), jobId: String(m.jobId) }));
  const namedSet = new Set();
  const unnamed = [];
  for (const f of findings ?? []) {
    const hit = new Set();
    for (const name of (f && f.merges) || []) {
      const n = String(name);
      for (const m of merges) {
        if (n === m.sha || n === m.jobId || (n.length >= 7 && m.sha.startsWith(n))) hit.add(m.sha);
      }
    }
    if (!hit.size) unnamed.push(f);
    else for (const s of hit) namedSet.add(s);
  }
  return { named: merges.map((m) => m.sha).filter((s) => namedSet.has(s)), unnamed };
}

/** The reserved key unattributable not-in-any-record findings land under. */
const UNATTRIBUTED_KEY = 'unattributed';

/**
 * The per-subject breakdown of the not-in-any-record count (task 68): each
 * `missing` entry the comparison reported — it quotes the finding's text —
 * is matched back to the verdict's findings. Matching is tolerant of quoting
 * drift but never a guess: an entry whose WHOLE normalized text equals a
 * finding's wins that finding outright (exact first, ahead of any earlier
 * containment-only candidate); failing an exact match, a containment match —
 * the entry contains the finding's text or is contained by it,
 * whitespace-collapsed — is accepted only when it is UNIQUE across the
 * findings array. An entry matching nothing, or matching more than one
 * finding by containment, is an ambiguity the helper refuses, never resolves
 * by order: it lands under the reserved `unattributed` key, as does a
 * matched finding's entry when the finding names no merge. A finding's
 * subjects are the union of the subjects of the manifest merges it names (by
 * full sha, job id, or unambiguous sha prefix — the same naming
 * `trainFindingsNamingMerges` accepts).
 * A finding naming merges across several subjects counts under EACH — the
 * distribution is per subject, not a partition — so the values sum to at
 * least the count beside which the breakdown rides, and exactly to it when
 * every finding names one subject. Keys are sorted; the map is the shape the
 * train line's additive `train:` key carries as
 * `findings_not_in_any_record_by_subject`.
 */
export function attributeFindingsBySubject(missing, findings, manifest) {
  const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
  const subjectsByName = new Map();
  for (const m of (manifest && manifest.merges) || []) {
    if (!m) continue;
    const subs = [...new Set((m.subjects || []).map((s) => norm(s)).filter(Boolean))].sort();
    if (m.sha != null) subjectsByName.set(String(m.sha), subs);
    if (m.jobId != null) subjectsByName.set(String(m.jobId), subs);
  }
  const parsed = (findings ?? []).map((f) => {
    const text = norm(f && f.text);
    const merges = ((f && f.merges) || []).map((n) => String(n ?? ''));
    return { text, merges };
  }).filter((f) => f.text);
  const subjectsOf = (f) => {
    const out = new Set();
    for (const name of f.merges) {
      let subs = subjectsByName.get(name);
      if (!subs && name.length >= 7) {
        const hits = [...subjectsByName.keys()].filter((k) => k.startsWith(name));
        if (hits.length === 1) subs = subjectsByName.get(hits[0]);
      }
      for (const s of subs ?? []) out.add(s);
    }
    return out;
  };
  const bySubject = new Map();
  const bump = (key) => bySubject.set(key, (bySubject.get(key) ?? 0) + 1);
  for (const missText of missing ?? []) {
    const mnorm = norm(missText);
    if (!mnorm) continue;
    // Exact normalized match first; else a containment candidate unique
    // across the findings (either direction). More than one containment
    // candidate is an ambiguity — no first-match guess, `unattributed`.
    let f = parsed.find((p) => p.text === mnorm);
    if (!f) {
      const cands = parsed.filter((p) => mnorm.includes(p.text) || p.text.includes(mnorm));
      if (cands.length === 1) f = cands[0];
    }
    const subjects = f ? subjectsOf(f) : new Set();
    if (!subjects.size) {
      bump(UNATTRIBUTED_KEY);
      continue;
    }
    for (const s of subjects) bump(s);
  }
  const out = {};
  for (const k of [...bySubject.keys()].sort()) out[k] = bySubject.get(k);
  return out;
}

/**
 * The train verdict protocol (row 42; per-piece entries row 60): the train
 * review produces a verdict record on the ORDINARY protocol — closed-list
 * verdict, `would-cite` per prose piece, the same refusals as `mergeGate` —
 * by DELEGATING to `mergeGate` once per kind the train touches, first
 * refusal wins. Same codes, same reasons, same sweeps (including the
 * duplicate checks, which read the train record like any other). An absent,
 * empty or malformed record fails closed: `no-record`, `malformed-verdict`
 * and every other refusal surface here unchanged.
 *
 * The per-piece entries ride the delegation with no second list: the
 * `subjects` here are the manifest's subject set, already bounded at train
 * assembly by the `S_train` subject bound, so `would-cite-for` entries are
 * bound within that same bound — the gate adds no piece list of its own.
 * The graph summary is presented beside the entries for judgment; it adds
 * no requirement the gate reads.
 *
 * `kinds` unknown to `checklistFor` fail closed before any gate runs: a
 * kind with no checklist cannot have been reviewed.
 */
export function trainReviewGate(ctx, { trainId, kinds = [], subjects = [], changed = null }) {
  const uniqKinds = [...new Set(kinds ?? [])];
  if (!uniqKinds.length) {
    return { ok: false, code: 'no-kinds', reason: `no kinds for train ${trainId} — without a kind there is no checklist, so the train verdict is refused` };
  }
  for (const kind of uniqKinds) {
    try {
      checklistFor(kind);
    } catch (e) {
      return { ok: false, code: 'unknown-kind', reason: `train ${trainId} touches kind ${JSON.stringify(kind)} with no checklist (${e.message ?? String(e)}) — the verdict is refused` };
    }
  }
  for (const kind of uniqKinds) {
    let g;
    try {
      g = mergeGate(ctx, { jobId: trainId, type: kind, subjects, changed });
    } catch (e) {
      return { ok: false, code: 'gate-threw', reason: `the train verdict gate threw on kind ${JSON.stringify(kind)} (${e.message ?? String(e)}) — fail closed: no fast-forward, no publish` };
    }
    if (!g.ok) return g;
  }
  // Re-read for the caller rather than trusting the last gate's object: the
  // record could have moved between the per-kind passes. A vanishing record
  // is `no-record`, never a throw — the gate fails closed, not loudly.
  try {
    return { ok: true, verdict: parseVerdict(readFileSync(trainVerdictPath(ctx, trainId), 'utf8')) };
  } catch (e) {
    return { ok: false, code: 'no-record', reason: `the train verdict for ${trainId} could not be re-read (${e.message ?? String(e)}) — fail closed: no fast-forward, no publish` };
  }
}

/**
 * The default `review` seam for `runTrain`: `reviewTrain` closed over the
 * loop context. The seam shape is `review({diffText, manifest, repo})` — a
 * single object with no context — while the sealed assembly needs the
 * ledger, the registry, the reviews dir and a worktree root. The factory
 * binds them at the call site (`review = makeReviewTrain(ctx)` or
 * `makeReviewTrain(ctx, { reviewerId })` to carry the run's resolved
 * reviewer), so stubs keep the single-object shape and production gets
 * the sealed reviewer.
 */
export function makeReviewTrain(ctx, { capMinutes = 10, invoke = null, reviewerId, trainGraphAnalysis = null } = {}) {
  return ({ diffText, manifest, repo }) => reviewTrain(ctx, { diffText, manifest, repo, capMinutes, invoke, reviewerId, trainGraphAnalysis });
}

/**
 * The production train review: both invocations composed into the
 * `review({diffText, manifest, repo})` seam `train.mjs` runs. Reads the
 * kinds off the ledger, the rung off the registry, runs the sealed review,
 * gates the record, runs the comparison, and returns the seam shape —
 * `{verdict, reason, runner, provider, tier, findingsNotInAnyRecord,
 * findingsNotInAnyRecordBySubject, findings}`. The per-subject breakdown
 * (task 68) rides beside the count on every verdict that carries a measured
 * count: the same `missing` entries, attributed per subject through the
 * manifest's merge subjects.
 *
 * Every failure is a fail-closed `reject` with no publish: missing kinds, a
 * missing or ambiguous rung, a thrown or unwritten review, a refused record,
 * a missing comparison. The gate refuses EVERY non-approval (`mergeGate`
 * returns ok:false with `code === verdict` for a well-formed `revise` /
 * `reject`), so a refused record is either a legitimate non-approval —
 * which passes through with its findings and its measured comparison count,
 * for the eviction-on-finding loop in `train.mjs` — or a defective record,
 * which fails closed as `reject` carrying the gate's reason. In particular
 * an `approve` the gate refused (empty/duplicate `would-cite`, and the rest
 * of the defective-field refusals) never passes through as approval: the
 * gate never returns ok:true for a non-approval on a stable record, so the
 * post-gate non-approve arm below is a defensive backstop, the road only
 * a mutated record can take.
 */
export async function reviewTrain(ctx, { diffText, manifest, repo, capMinutes = 10, invoke = null, reviewerId, trainGraphAnalysis = null } = {}) {
  const unwired = { runner: 'unwired-reviewer', provider: 'unwired-provider', tier: 'unwired-tier' };
  const trainId = manifest && manifest.train;
  if (!trainId) {
    return { verdict: 'reject', reason: 'the train manifest carries no train id — fail closed: no fast-forward, no publish', ...unwired, findingsNotInAnyRecord: 0, findings: [] };
  }
  const k = trainKinds(ctx, manifest);
  if (!k.ok) {
    return { verdict: 'reject', reason: `${k.reason} — fail closed: no fast-forward, no publish`, ...unwired, findingsNotInAnyRecord: 0, findings: [] };
  }
  let registry;
  try {
    registry = loadRunners(ctx);
  } catch (e) {
    return { verdict: 'reject', reason: `cannot read the runner registry (${e.message ?? String(e)}) — fail closed: no fast-forward, no publish`, ...unwired, findingsNotInAnyRecord: 0, findings: [] };
  }
  const r = trainReviewerRung(registry, { reviewerId });
  if (!r.ok) {
    return { verdict: 'reject', reason: `${r.reason} — fail closed: no fast-forward, no publish`, ...unwired, findingsNotInAnyRecord: 0, findings: [] };
  }
  const rung = r.rung;
  const reviewer = { runner: rung.id, provider: rung.provider, tier: rung.tier };
  const subjects = [...new Set(((manifest && manifest.merges) || []).flatMap((m) => m.subjects || []))].sort();
  const ref = gitTry(repo, ['rev-parse', 'HEAD']).stdout.trim();
  if (!ref) {
    return { verdict: 'reject', reason: 'cannot resolve the train tip to review — fail closed: no fast-forward, no publish', ...unwired, findingsNotInAnyRecord: 0, findings: [] };
  }
  let rev;
  try {
    rev = await runTrainReview(ctx, {
      trainId, ref, diffText, manifest, kinds: k.kinds, runner: rung, capMinutes, invoke,
      trainGraphAnalysis, graphBase: (manifest && manifest.mainTip) || null,
    });
  } catch (e) {
    return { verdict: 'reject', reason: `the sealed train review threw (${e.message ?? String(e)}) — fail closed: no fast-forward, no publish`, ...reviewer, findingsNotInAnyRecord: 0, findings: [] };
  }
  if (!rev.recordWritten) {
    return { verdict: 'reject', reason: `no train verdict recorded at ${rev.outPath} — fail closed: no fast-forward, no publish`, ...reviewer, findingsNotInAnyRecord: 0, findings: [] };
  }
  const g = trainReviewGate(ctx, { trainId, kinds: k.kinds, subjects });
  if (!g.ok) {
    // A refused record is either a legitimate non-approval or a defective
    // record — never an approval. The gate refuses EVERY non-approval
    // (`mergeGate` returns ok:false with `code === verdict` for a
    // well-formed revise/reject), so the refusal arm is where revise/reject
    // passes through; but an approve-with-defective-fields refusal
    // (would-cite-empty/duplicate, would-cite-for-empty/duplicate,
    // reads-human-*, carried-deletion-unearned, corrections-malformed,
    // cites-unresolved, ...) still carries
    // verdict 'approve' on the refused record, and passing that through
    // finished the train done on an empty would-cite. Only the legitimate
    // non-approval shape passes through; every other refusal fails closed
    // as reject carrying the gate's reason.
    const refusedVerdict = g.verdict && g.verdict.verdict;
    const legitimateNonApproval =
      (refusedVerdict === 'revise' || refusedVerdict === 'reject') && g.code === refusedVerdict;
    if (!legitimateNonApproval) {
      const v = g.verdict ? parseTrainFindings(g.verdict) : { findings: [] };
      return {
        verdict: 'reject', reason: `${g.reason} — fail closed: no fast-forward, no publish`,
        ...reviewer, findingsNotInAnyRecord: 0, findings: v.findings,
      };
    }
    // A well-formed non-approval still gets its comparison: the count is
    // measured on every pass-through verdict that can reach the line,
    // never a silent 0 (the gate never returns ok:true for revise/reject,
    // so this refusal arm is the only road here; the defective-refusal
    // reject above carries an unmeasured 0 by design). A comparison that
    // cannot run fails the same closed way the approve arm below does.
    const vLegit = parseTrainFindings(g.verdict);
    const cmpLegit = await compareTrainFindings(ctx, { trainId, ref, runner: rung, capMinutes, invoke, verdictText: g.verdict.raw });
    if (!cmpLegit.ok) {
      return { verdict: 'reject', reason: `${cmpLegit.reason} — fail closed: no fast-forward, no publish`, ...reviewer, findingsNotInAnyRecord: 0, findings: vLegit.findings };
    }
    return {
      verdict: refusedVerdict,
      reason: `train review did not approve (${refusedVerdict}${g.verdict.reasons.length ? `: ${g.verdict.reasons.join(', ')}` : ''})`,
      ...reviewer, findingsNotInAnyRecord: cmpLegit.missing.length,
      findingsNotInAnyRecordBySubject: attributeFindingsBySubject(cmpLegit.missing, vLegit.findings, manifest),
      findings: vLegit.findings,
    };
  }
  const v = parseTrainFindings(g.verdict);
  if (g.verdict.verdict !== 'approve') {
    // Defensive backstop for a record mutated between the gate's per-kind
    // passes and its re-read: on a stable record the gate refuses every
    // non-approval, so ok:true always carries approve — but the re-read
    // can still return a non-approval the passes just refused. A
    // non-approval must not ride the approve path below into a done line —
    // fail closed instead.
    return { verdict: 'reject', reason: `train gate passed a non-approval (${g.verdict.verdict}) — fail closed: no fast-forward, no publish`, ...reviewer, findingsNotInAnyRecord: 0, findings: v.findings };
  }
  const cmp = await compareTrainFindings(ctx, { trainId, ref, runner: rung, capMinutes, invoke, verdictText: g.verdict.raw });
  if (!cmp.ok) {
    return { verdict: 'reject', reason: `${cmp.reason} — fail closed: no fast-forward, no publish`, ...reviewer, findingsNotInAnyRecord: 0, findings: v.findings };
  }
  return {
    verdict: 'approve', reason: '', ...reviewer, findingsNotInAnyRecord: cmp.missing.length,
    findingsNotInAnyRecordBySubject: attributeFindingsBySubject(cmp.missing, v.findings, manifest),
    findings: v.findings,
  };
}

/**
 * The comparison half of `reviewTrain`, factored so the approve and
 * legitimate-non-approval arms share it: read the per-job records' text from
 * the unredacted checkout, run the separate invocation, parse the `missing:`
 * list. Failures return `{ok:false}` and the caller fails closed on every
 * verdict — an approval without its count is a reject, and a non-approval
 * without its count is a reject too: an unmeasured count never rides
 * the seam.
 */
async function compareTrainFindings(ctx, { trainId, ref, runner, capMinutes, invoke, verdictText }) {
  const perJobTexts = {};
  try {
    for (const name of readdirSync(ctx.reviewsDir)) {
      if (!name.endsWith('.md') || name === 'README.md') continue;
      try {
        perJobTexts[name] = readFileSync(join(ctx.reviewsDir, name), 'utf8');
      } catch {
        // An unreadable record is the comparison's problem to report, not
        // this scan's: skip it here, and the invocation judges coverage.
      }
    }
  } catch {
    return { ok: false, reason: `cannot read the per-job records from ${ctx.reviewsDir} — the not-in-any-record count is unknown` };
  }
  delete perJobTexts[`${trainId}.md`];
  delete perJobTexts[`${trainId}.train-compare.md`];
  let cmp;
  try {
    cmp = await runTrainComparison(ctx, {
      trainId, ref, trainRecordText: verdictText, perJobTexts, runner, capMinutes, invoke,
    });
  } catch (e) {
    return { ok: false, reason: `the train comparison threw (${e.message ?? String(e)}) — the not-in-any-record count is unknown` };
  }
  if (!cmp.recordWritten) {
    return { ok: false, reason: `no train comparison written at ${cmp.outPath} — the not-in-any-record count is unknown` };
  }
  const parsed = parseTrainComparison(readFileSync(cmp.outPath, 'utf8'));
  if (!parsed.ok) return parsed;
  return { ok: true, missing: parsed.missing };
}
