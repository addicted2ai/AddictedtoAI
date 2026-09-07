/**
 * review-blog-bar.test.mjs — make-the-blog-worth-sending, tasks 2.6, 3.1, 3.2
 * and 3.8's review-brief half.
 *
 * WHY THIS FILE CARRIES MORE WEIGHT THAN ITS SIZE SUGGESTS.
 *
 * The voice lint (`scripts/check-post-voice.mjs`, task 3.7) is ADVISORY by
 * decision: it warns and never fails the build, because the house model trips
 * the punctuation-rate markers in every register it writes — including in the
 * voice document itself — so a fail-closed gate would have silently stopped all
 * `post` work while every component reported success. The consequence is that
 * nothing mechanical stops machine-made prose downstream of the lint. The
 * model-run review verdict is the whole gate, and the two things this file
 * measures — that the checklist ASKS the right questions, and that the merge
 * REFUSES a verdict which did not answer them — are what stand between a
 * mediocre post and the live site.
 *
 * Every guard rail below is measured by attempting what it forbids AND by a
 * positive control on the same fixture, because a gate that refuses everything
 * passes a refusal test and is useless.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

import { runLoop } from '../run.mjs';
import { JOB_TYPES } from '../lib/config.mjs';
import {
  assembleReviewBrief,
  checklistCoverage,
  checklistFor,
  existingFieldValues,
  isReissueRefusal,
  mergeGate,
  needsReadsHuman,
  normalizeField,
  parseVerdict,
  verdictPath,
  writeVerdictRecord,
  REASONS,
  REISSUE_CODES,
} from '../lib/review.mjs';
import { writeRecordSubjects } from '../lib/review.mjs';
import { subjectsOf } from '../../lib/reviews.mjs';
import { REVIEWS_DIR } from '../../lib/paths.mjs';
import { DOMAINS, FRONTIER_CRITERIA } from '../../lib/domains.mjs';
import { makeRepo, writeQueue, mockCommand, runnersYaml, HERE } from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');
const ctxAt = (o = {}) => makeRepo({ now: () => NOW, ...o });

/** A review brief for one job type, with nothing else varying. */
function briefFor(ctx, type, extra = {}) {
  return assembleReviewBrief(ctx, {
    jobId: 'j-20260910-01',
    job: { type, source: 'queue', title: `a ${type} job`, ...extra },
    diffText: '--- a/x\n+++ b/x\n+changed\n',
    pass: 1,
    findings: '',
    outPath: verdictPath(ctx, 'j-20260910-01'),
  });
}

/* ===========================================================================
 * 3.1 — the reason list
 * ======================================================================== */

test('3.1 `reads-as-generated` is in the closed reason list, and the brief prints it', () => {
  assert.ok(REASONS.includes('reads-as-generated'), REASONS.join(', '));
  // Closed means closed: no duplicates, no accidental growth beyond the eight
  // specs/review names.
  assert.equal(new Set(REASONS).size, REASONS.length);
  assert.deepEqual([...REASONS], [
    'false-or-unsupported-claim',
    'intent-not-measurement',
    'not-worth-reading',
    'reads-as-generated',
    'overclaiming-summary',
    'spec-violation',
    'broken-reference',
    'scope-violation',
  ]);

  // A reason a reviewer is never shown is a reason that does not exist.
  const ctx = ctxAt();
  for (const type of JOB_TYPES) {
    assert.match(briefFor(ctx, type), /- `reads-as-generated`/, `${type}'s brief omits it`);
  }
  ctx.cleanup();
});

test('3.1 parseVerdict reads `reads-human` under every spelling, and never invents one', () => {
  const dash = parseVerdict('---\nverdict: approve\nreads-human: "blunt in paragraph two"\n---\nn');
  assert.equal(dash.readsHuman, 'blunt in paragraph two');
  assert.equal(
    parseVerdict('---\nverdict: approve\nreads_human: "snake case"\n---\nn').readsHuman,
    'snake case',
  );
  assert.equal(
    parseVerdict('---\nverdict: approve\nreadsHuman: "camel case"\n---\nn').readsHuman,
    'camel case',
  );

  // A record without the field reports an empty string, not `undefined` — the
  // merge gate's check is `!v.readsHuman` and both would pass it, but only one
  // of them says the same thing to a caller that prints it.
  assert.equal(parseVerdict('---\nverdict: approve\n---\nn').readsHuman, '');

  // THE FAILURE THE `would-cite` FALLBACK WAS WRITTEN FOR, re-measured for this
  // field: a deliberately empty front-matter value must stay empty. A fallback
  // scanning the whole file would re-read the front matter and hand back the
  // two-character string `""` — a blank field passing the non-empty check.
  const empty = parseVerdict('---\nverdict: approve\nwould-cite: "x"\nreads-human: ""\n---\n\nnotes\n');
  assert.equal(empty.readsHuman, '', JSON.stringify(empty.readsHuman));

  // The plain-text fallback still works for a runner that writes no front
  // matter at all, which is the case it exists for.
  const plain = parseVerdict('Verdict: approve\nwould-cite: someone\nreads-human: it argues with itself\n');
  assert.equal(plain.readsHuman, 'it argues with itself');
});

/* ===========================================================================
 * 3.1 — the merge gate. Refusal and positive control on the same fixture.
 * ======================================================================== */

test('3.1 REFUSAL: an `approve` on a post with a blank reads-human is refused at merge', () => {
  const ctx = ctxAt();
  // The refusal case: every other field answered, so nothing but `reads-human`
  // can be what refuses it.
  writeVerdictRecord(ctx, 'j-blank', {
    verdict: 'approve',
    wouldCite: 'Anyone arguing the retirement window was too short.',
    notes: 'n',
  });
  const refused = mergeGate(ctx, { jobId: 'j-blank', type: 'post' });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'reads-human-empty');
  assert.match(refused.reason, /where does this\s+read machine-made, or why does it not\?/);
  assert.match(refused.reason, /voice lint only warns/);

  // POSITIVE CONTROL, same fixture, `reads-human` supplied: it merges. A gate
  // that refused this too would pass the assertion above and stop every post.
  // (`would-cite` differs as well, deliberately — reusing the refused record's
  // sentence would trip the OLDER duplicate rule and prove nothing about this
  // one. It tripped exactly that way the first time this test ran.)
  writeVerdictRecord(ctx, 'j-filled', {
    verdict: 'approve',
    wouldCite: 'A migration guide author listing which endpoints go dark.',
    readsHuman: 'Rhythm varies and it calls the vendor note evasive; nothing reads assembled.',
    notes: 'n',
  });
  const passed = mergeGate(ctx, { jobId: 'j-filled', type: 'post' });
  assert.equal(passed.ok, true, passed.reason);
  assert.equal(passed.verdict.readsHuman.startsWith('Rhythm varies'), true);
  ctx.cleanup();
});

test('3.1 REFUSAL: an `approve` whose reads-human duplicates an existing record is refused', () => {
  const ctx = ctxAt();
  const SENTENCE = 'The prose reads human: varied rhythm, a point of view, no self-narration.';
  writeVerdictRecord(ctx, 'j-earlier', {
    verdict: 'approve',
    wouldCite: 'Someone citing the earlier post.',
    readsHuman: SENTENCE,
    notes: 'n',
  });
  // Recycled verbatim except for whitespace and line endings — the normalisation
  // specs/review names ("exactly identical after whitespace trimming").
  writeVerdictRecord(ctx, 'j-recycler', {
    verdict: 'approve',
    wouldCite: 'A different argument entirely.',
    readsHuman: `\r\n  ${SENTENCE}  \n`,
    notes: 'n',
  });
  const refused = mergeGate(ctx, { jobId: 'j-recycler', type: 'post' });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'reads-human-duplicate');
  assert.match(refused.reason, /j-earlier\.md/, 'and it names the record it collided with');

  // POSITIVE CONTROL: a distinct sentence beside the same earlier record merges.
  // Its `would-cite` differs too, so nothing but `reads-human` separates this
  // record from the refused one above.
  writeVerdictRecord(ctx, 'j-fresh', {
    verdict: 'approve',
    wouldCite: 'A third argument, unlike either of the others.',
    readsHuman: 'Two paragraphs are the same shape but the closing line is blunt enough to land.',
    notes: 'n',
  });
  assert.equal(mergeGate(ctx, { jobId: 'j-fresh', type: 'post' }).ok, true);
  ctx.cleanup();
});

test('3.1 a delta review may repeat its OWN earlier answer — same piece, same judgment', () => {
  // The same deviation `would-cite` already carries, and for the same reason:
  // records for the same job id are excluded from the duplicate sweep. The rule
  // exists to stop one sentence being pasted across DIFFERENT pieces.
  const ctx = ctxAt();
  const SAME = 'It still reads human; the revision changed the dates, not the prose.';
  writeVerdictRecord(ctx, 'j-two-pass', { verdict: 'revise', wouldCite: 'x', readsHuman: SAME, notes: 'n', pass: 1 });
  writeVerdictRecord(ctx, 'j-two-pass', {
    verdict: 'approve',
    wouldCite: 'Anyone tracking the licence change.',
    readsHuman: SAME,
    notes: 'n',
    pass: 2,
  });
  assert.equal(mergeGate(ctx, { jobId: 'j-two-pass', type: 'post', pass: 2 }).ok, true);
  ctx.cleanup();
});

test('3.1 non-post verdicts are unaffected — the voice field binds `post` and nothing else', () => {
  const ctx = ctxAt();
  writeVerdictRecord(ctx, 'j-entry', { verdict: 'approve', wouldCite: 'a wiki reader', notes: 'n' });

  // `entry` is prose, so it still needs `would-cite` — and does NOT need
  // `reads-human`. The two rules are scoped differently on purpose.
  assert.equal(needsReadsHuman('entry'), false);
  assert.equal(mergeGate(ctx, { jobId: 'j-entry', type: 'entry' }).ok, true);
  for (const type of ['tutorial', 'education', 'interpret', 'prune']) {
    assert.equal(mergeGate(ctx, { jobId: 'j-entry', type }).ok, true, `${type} must not need reads-human`);
  }

  // A non-prose type needs neither.
  writeVerdictRecord(ctx, 'j-machinery', { verdict: 'approve', wouldCite: '', notes: 'n' });
  assert.equal(mergeGate(ctx, { jobId: 'j-machinery', type: 'machinery' }).ok, true);

  // And `post` is the one that does.
  assert.equal(needsReadsHuman('post'), true);
  assert.equal(mergeGate(ctx, { jobId: 'j-entry', type: 'post' }).code, 'reads-human-empty');
  ctx.cleanup();
});

test('3.1 would-cite is judged before reads-human, so a record missing both says so once', () => {
  // Ordering is observable and worth pinning: a reviewer that skipped both
  // fields should be told about the older, more general rule first rather than
  // being sent back twice.
  const ctx = ctxAt();
  writeVerdictRecord(ctx, 'j-neither', { verdict: 'approve', wouldCite: '', notes: 'n' });
  assert.equal(mergeGate(ctx, { jobId: 'j-neither', type: 'post' }).code, 'would-cite-empty');
  ctx.cleanup();
});

test('3.1 one normaliser and one sweep serve both fields', () => {
  // specs/review words the reads-human duplicate rule as "on the same terms" as
  // would-cite's. Two implementations that agree today are how they stop
  // agreeing later, so this asserts they are the same code path.
  assert.equal(normalizeField('\r\n  x  \n'), 'x');

  const ctx = ctxAt();
  writeVerdictRecord(ctx, 'j-a', { verdict: 'approve', wouldCite: 'cite A', readsHuman: 'voice A', notes: 'n' });
  writeVerdictRecord(ctx, 'j-b', { verdict: 'approve', wouldCite: 'cite B', notes: 'n' });
  assert.deepEqual(
    existingFieldValues(ctx, null, 'wouldCite').map((e) => e.value).sort(),
    ['cite A', 'cite B'],
  );
  assert.deepEqual(
    existingFieldValues(ctx, null, 'readsHuman').map((e) => e.value),
    ['voice A'],
    'a record with no reads-human contributes nothing to the reads-human sweep',
  );
  assert.deepEqual(existingFieldValues(ctx, 'j-a', 'readsHuman'), [], 'the excluded job is excluded');
  ctx.cleanup();
});

test('3.1 the re-issue refusals are named together, so callers need not list them by hand', () => {
  assert.deepEqual([...REISSUE_CODES], [
    'would-cite-empty',
    'would-cite-duplicate',
    'reads-human-empty',
    'reads-human-duplicate',
    'corrections-malformed',
    // The carry-forward's two (addictedtoai-37rb): a reviewer's anchor or its
    // recycled statement is a clerical failure in a field ABOUT the record, so
    // the fix is a re-issued verdict, never an author revision pass.
    'reads-human-from-unanchored',
    'reads-human-from-duplicate',
  ]);
  for (const c of REISSUE_CODES) assert.equal(isReissueRefusal(c), true);
  for (const c of ['no-record', 'malformed-verdict', 'reviewed-subject-mismatch', 'revise', 'reject']) {
    assert.equal(isReissueRefusal(c), false, c);
  }
});

/* ===========================================================================
 * 3.2 — the post checklist
 * ======================================================================== */

test('3.2 the assembled post review brief carries the form, the anchor, the party and the voice', () => {
  const ctx = ctxAt();
  const brief = briefFor(ctx, 'post');

  // Form first — the two forms are not the same piece.
  assert.match(brief, /Identify the form first — news note or synthesis/);

  // A note's finish line.
  assert.match(brief, /Fetch every external `anchor:` yourself/);
  assert.match(brief, /documents both the event and its date/);
  assert.match(brief, /an anchor that does not hold is `false-or-unsupported-claim`/);
  assert.match(brief, /declares no anchor at all is `spec-violation`/);
  assert.match(brief, /the affected party is named where one exists/);
  assert.match(brief, /`revise` with reason `not-worth-reading`, naming the missing party/);
  assert.match(brief, /brevity alone is never a defect/i);
  assert.match(brief, /150-word note for shortness/);

  // A synthesis's finish line.
  assert.match(brief, /the derivation method is stated/);
  assert.match(brief, /a skeptical reader could reproduce it/);
  assert.match(brief, /enumerable and dated/);

  // The subject rule.
  assert.match(brief, /The subject is the world's AI, never this site/);
  assert.match(brief, /is `spec-violation` naming that rule/);

  // The voice bar, and the honest statement of why this verdict is the gate.
  assert.match(brief, /openspec\/style\/blog-voice\.md/);
  assert.match(brief, /reject `reads-as-generated` where it reads machine-made/);
  assert.match(brief, /voice lint is ADVISORY/);
  assert.match(brief, /never fails the build/);
  assert.match(brief, /only\s+thing standing between machine-made prose and the live site/);
  assert.match(brief, /trips no marker and still reads machine-made is still\s+`reads-as-generated`/);

  // Disclosure is a boundary, not a style note.
  assert.match(brief, /disclosure of AI authorship stands/);
  assert.match(brief, /must not read machine-made; the site must\s+not pretend human-made/);

  // Both questions, and the shape the record must take.
  assert.match(brief, /\*\*Required, non-empty: `would-cite`\.\*\*/);
  assert.match(brief, /\*\*Required, non-empty: `reads-human`\.\*\*/);
  assert.match(brief, /^reads-human: >-$/m, 'the front-matter template carries the key');
  // The stranger test in its WOULD-SEND form, which is the post's version of it
  // (specs/blog: being worth citing alone does not publish).
  assert.match(brief, /the send question in `would-cite` \(who would send this, and to whom\?\)/);
  assert.match(brief, /the voice question in `reads-human` \(where does this read machine-made, or why does it not\?\)/);
  assert.match(brief, /correct, sourced, forgettable draft is `not-worth-reading`/i);
  ctx.cleanup();
});

test('3.2 a non-post brief carries no reads-human demand it cannot be refused for', () => {
  // The brief and the gate must agree: asking an `entry` reviewer for a field
  // the merge does not check trains it to fill fields, and asking a `post`
  // reviewer for nothing while refusing it at merge is the worse direction.
  const ctx = ctxAt();
  for (const type of JOB_TYPES) {
    const brief = briefFor(ctx, type);
    const asked = /Required, non-empty: `reads-human`/.test(brief);
    assert.equal(asked, needsReadsHuman(type), `${type}: brief asks=${asked}, gate needs=${needsReadsHuman(type)}`);
    assert.equal(/^reads-human: >-$/m.test(brief), needsReadsHuman(type), `${type}: template key`);
  }
  ctx.cleanup();
});

/* ===========================================================================
 * 2.6 — the scout checklist, and the silent fallback that hid its absence
 * ======================================================================== */

test('2.6 the assembled scout review brief carries the charge, the evidence, the docket, the drops and the cap', () => {
  const ctx = ctxAt();
  const brief = briefFor(ctx, 'scout');

  // The charge, first and failing.
  assert.match(brief, /The charge is checked first/);
  assert.match(brief, /bring back work the site could not have thought of by looking at itself/);
  assert.match(brief, /reject the run `spec-violation` naming the charge/);
  assert.match(brief, /An inward run that is otherwise flawless still fails this/);

  // Evidence, fetched rather than believed.
  assert.match(brief, /Spot-fetch the evidence URLs yourself/);
  assert.match(brief, /a plausible-looking link is not retrieval/);

  // The docket fields, all of them.
  assert.match(brief, /kebab-case `slug`/);
  assert.match(brief, /job `type` from the closed list/);
  assert.match(brief, /at most 7 days out for an event-driven candidate, at most 14 for a synthesis/);
  assert.match(brief, /why-now/);
  assert.match(brief, /retrieval dates/);
  assert.match(brief, /done-when acceptance lines/);

  // The drop records, and the honest limit on what they prove.
  assert.match(brief, /data\/proposals\/dropped\//);
  assert.match(brief, /which test it failed/);
  assert.match(brief, /what would make it worth refiling/);
  assert.match(brief, /prove the \*form\* of the bar, never its \*rate\*/);

  // The cap, and that zero is not a failure. The cap sentence counts UNFLAGGED
  // candidates since `flag-what-moved-the-frontier` modified it: a reviewer told
  // "at most three" and instructed to count files reads the four-file run that
  // change exists to enable as over-filing.
  assert.match(brief, /At most three UNFLAGGED candidates are filed/);
  assert.match(brief, /Zero candidates is not a defect/);
  ctx.cleanup();
});

test('2.6 REGRESSION: a scout review is no longer checked against the wiki-entry checklist', () => {
  // Found by wave 1. `CHECKLIST_FOR_TYPE` had no `scout` key and `checklistFor`
  // fell back to `entry` — so a scout run was reviewed against "volatile values
  // are transclusions" and "aliases are sanely classed", silently, with every
  // component reporting success. The wrong criteria are worse than none: a
  // reviewer cannot notice a checklist it was never given.
  const ctx = ctxAt();
  const brief = briefFor(ctx, 'scout');
  assert.ok(!/Aliases are sanely classed/.test(brief), 'the entry checklist leaked into a scout review');
  assert.ok(!/Volatile values are transclusions/.test(brief), 'the entry checklist leaked into a scout review');
  assert.notDeepEqual(checklistFor('scout'), checklistFor('entry'));
  ctx.cleanup();
});

test('2.6 the fallback is LOUD: an unknown job type throws instead of borrowing a checklist', () => {
  // The decision, recorded where it can be measured: the silent `?? "entry"`
  // default is gone. Fail closed — a review constituted against another type's
  // list is not a weaker review, it is a different one.
  assert.throws(
    () => checklistFor('nonesuch'),
    (e) => /no checklist for job type "nonesuch"/.test(e.message) && /CHECKLIST_FOR_TYPE/.test(e.message),
  );
  assert.throws(() => checklistFor(undefined), /no checklist for job type/);

  // POSITIVE CONTROL: every type that SHOULD have one still gets one, non-empty.
  // A `checklistFor` that threw for everything would pass the assertions above.
  for (const type of JOB_TYPES) {
    const list = checklistFor(type);
    assert.ok(Array.isArray(list) && list.length > 0, `${type} has no checklist`);
  }
});

test('2.6 every closed-list job type has a checklist, and no mapping dangles', () => {
  // This is the check that would have caught the scout gap the day `scout`
  // joined JOB_TYPES, rather than a wave later.
  const cov = checklistCoverage();
  assert.deepEqual(cov.unmapped, [], `job types with no checklist: ${cov.unmapped.join(', ')}`);
  assert.deepEqual(cov.danglingMappings, [], cov.danglingMappings.join(', '));
  assert.deepEqual(checklistCoverage(['scout', 'no-such-type']).unmapped, ['no-such-type'], 'and it can find one');
});

/* ===========================================================================
 * flag-what-moved-the-frontier — the side that JUDGES
 *
 * WHY THESE ARE HERE AND NOT ONLY IN `brief-acceptance.test.mjs`. A reviewer
 * receives the diff and the checklist and nothing else: `excerptsFor` is called
 * from exactly one place (`brief.mjs`, the AUTHOR brief), so no spec text and no
 * delta text reaches a review. A rule written into the brief and not into the
 * checklist is a rule the writer is held to and the checker has never seen —
 * which is the ledger-#10 shape one layer up, and it is the shape that makes a
 * scenario's THEN impossible: a model reviewer cannot reject a draft "naming the
 * forbidden list" it was never given.
 * ======================================================================== */

test('the post checklist carries the not-qualifying list and its test, with the verdict named', () => {
  const ctx = ctxAt();
  const brief = briefFor(ctx, 'post');

  // The blog delta's "A price change is not a frontier story": THEN review
  // rejects it as `spec-violation` naming the not-qualifying list.
  assert.match(brief, /a new checkpoint, a price change, a benchmark post with no new artifact, a tool release/);
  assert.match(brief, /what every other AI news site already shows does not qualify on its own/);
  assert.match(brief, /`spec-violation` \*\*naming the not-qualifying list\*\*/);
  assert.match(brief, /a price change is not F5, which is a change in ACCESS and not in price/);

  // Every criterion by id AND by its meaning — an id list tells a reviewer which
  // labels exist and nothing about whether the story earned one.
  for (const c of FRONTIER_CRITERIA) {
    assert.ok(brief.includes(`**${c.id}**`), `the post checklist omits ${c.id}`);
    assert.ok(brief.includes(c.text), `the post checklist omits what ${c.id} means`);
  }

  // K46 on the judging side: a reviewer told "at least one domain" asks for a
  // repair the vocabulary forbids, and the flag quietly stops reaching general
  // records (a court filing, a regulator's action, a licence term, a system card).
  for (const d of DOMAINS) assert.ok(brief.includes(d), `the post checklist omits the domain ${d}`);
  assert.match(brief, /`domains` is OPTIONAL flagged or not/);
  assert.match(brief, /"general" is the UNMARKED default and `text` is not a value/);
  assert.match(brief, /NOT a defect to ask repaired/);
  ctx.cleanup();
});

test('the post checklist carries BOTH F2 lists, in full, and the verdict for the forbidden half', () => {
  // The load-bearing one. The delta: "Both lists are normative and neither may
  // be dropped as redundant. A list that says only what is permitted is not a
  // source test." Writing both halves into the author brief and neither into the
  // checklist reproduces exactly the asymmetry the requirement was written
  // against — the guard on the side that writes and none on the side that judges.
  const ctx = ctxAt();
  const brief = briefFor(ctx, 'post');

  // Permitted, all six, verbatim from the blog delta.
  assert.ok(brief.includes(
    'the publisher; the index name and its version; the date; the direction of the rescoring; '
    + 'the coverage change, as a count of rows scored before and after; the fact that a '
    + 'non-uniform rescoring can invert orderings',
  ), 'the permitted half is not carried verbatim');

  // Forbidden, all four, plus the two rulings that decide the hard cases.
  assert.ok(brief.includes('any index value, any ratio, any rank, any per-model score'),
    'the forbidden half is not carried verbatim');
  assert.match(brief, /A median is a value however it is aggregated; a leaderboard position is a rank/);
  assert.match(brief, /`spec-violation` \*\*naming the forbidden list\*\*/);
  assert.match(brief, /BOTH lists below are normative — neither may be dropped as redundant/);

  // The anchor rule, which is where an F2 record is most easily laundered.
  assert.match(brief, /publisher's own changelog or announcement/);
  assert.match(brief, /a third-party write-up is not that anchor/);

  // And the reason both halves are here, so a later editor trimming for length
  // knows which sentence is load-bearing.
  assert.match(brief, /not a source test but a field-name test/);
  assert.match(brief, /BY ACCIDENT/);
  ctx.cleanup();
});

test('the scout checklist asks for the criterion behind a frontier decline, unconditionally', () => {
  // The loop delta's new SHALL: "A story considered as a frontier candidate and
  // declined SHALL name which criterion it was weighed against and why it
  // failed." Satisfied for quiet domains and defeated everywhere else is the
  // shape of a conditional standing in for an unconditional rule, so the word
  // that matters most in this assertion is "unconditionally".
  const ctx = ctxAt();
  const brief = briefFor(ctx, 'scout');
  assert.match(brief, /ALSO names which criterion \(F1-F5\) it was weighed against and why it failed/);
  assert.match(brief, /unconditionally, not only in a domain that has gone quiet/);
  assert.match(brief, /only record of where the frontier line was drawn/);
  ctx.cleanup();
});

test('the scout checklist counts UNFLAGGED candidates against the cap of three', () => {
  // "A frontier story is filed beside a full docket" expects four candidates to
  // merge and be judged normally. A reviewer handed the pre-change sentence and
  // told to count files reads that run as over-filing.
  const ctx = ctxAt();
  const brief = briefFor(ctx, 'scout');
  assert.match(brief, /At most three UNFLAGGED candidates are filed/);
  assert.match(brief, /exempt from the COUNT and from nothing else/);
  assert.match(brief, /a fourth file is expected rather than over-filing/);
  assert.match(brief, /dropped at merge with the offending field named and does not rejoin the three/);
  ctx.cleanup();
});

/* ===========================================================================
 * 3.8 — the review brief's proposal rule
 * ======================================================================== */

test('3.8 every review brief asks for a noted proposal and restates the front-matter contract', () => {
  const ctx = ctxAt();
  for (const type of JOB_TYPES) {
    const brief = briefFor(ctx, type);
    assert.match(brief, /## If your review surfaced a proposal/, type);
    assert.match(brief, /at most one\*\* proposal in the verdict record/, type);
    // No edit rights is a mechanism; the brief must not ask for a file.
    assert.match(brief, /so do not write a file: note it in the front matter/, type);
    assert.match(brief, /naming this\s+review's job as its origin/, type);
    assert.match(brief, /Noting nothing is the normal case/, type);
    // The contract, including the key this change adds.
    for (const key of ['slug:', 'type:', 'date:', 'summary:', 'evidence:', 'expires:']) {
      assert.match(brief, new RegExp(`^\\s*${key.replace(':', ':')}`, 'm'), `${type}: contract lacks ${key}`);
    }
    assert.match(brief, /skips the 3-day cooling and is swept once it expires/, type);
    assert.match(brief, /never a new kind of work/, type);
  }
  ctx.cleanup();
});

/* ===========================================================================
 * The gate, end to end: the loop refuses the merge, and nothing merges.
 *
 * The unit tests above measure `mergeGate`. This measures the thing that
 * matters to the site — that a post whose review did not answer the voice
 * question does not reach `main` — through the real loop, real git, real
 * worktrees and a real executor process.
 * ======================================================================== */

const VOICE_MOCK = join(HERE, 'mock-voice-reviewer.mjs');
const voiceReviewer = (mode) => `node "${VOICE_MOCK.replace(/\\/g, '/')}" ${mode} "{prompt_file}"`;

function postRepo(reviewerMode) {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: mockCommand('done-edit'), reviewerCommand: voiceReviewer(reviewerMode) }),
  });
  writeQueue(ctx, [{ type: 'post', title: 'write the note about the retirement' }]);
  return ctx;
}

test('3.1 END TO END — a post approved with a blank reads-human does not reach main', async () => {
  const ctx = postRepo('blank');
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

  // The claim that matters, and the only one asserted about the outcome: the
  // merge was refused for this reason and the author's file is not on main.
  // (Deliberately not asserting WHICH non-merging outcome the loop records —
  // `loop/run.mjs` classifies refusal codes and belongs to another lane.)
  assert.notEqual(res.outcome, 'done', ctx.output());
  assert.match(ctx.output(), /reads-human-empty/, ctx.output());
  assert.match(ctx.output(), /voice lint only warns/);
  assert.ok(!existsSync(join(ctx.repoRoot, 'site-note.md')), 'the post job merged nothing');

  // And the reviewer really did write a record — this is a refusal on the
  // record's content, not the `no-record` refusal wearing a different name.
  const rec = parseVerdict(readFileSync(verdictPath(ctx, res.jobId, 1), 'utf8'));
  assert.equal(rec.verdict, 'approve');
  assert.equal(rec.wouldCite, 'Anyone arguing that the retirement window was too short.');
  assert.equal(rec.readsHuman, '', 'the field was written and left blank on purpose');
  ctx.cleanup();
});

test('3.1 END TO END POSITIVE CONTROL — the same post, one field answered, merges', async () => {
  const ctx = postRepo('filled');
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

  assert.equal(res.outcome, 'done', ctx.output());
  assert.ok(existsSync(join(ctx.repoRoot, 'site-note.md')), 'the post merged');
  assert.ok(!/reads-human-empty/.test(ctx.output()), ctx.output());
  ctx.cleanup();
});

test('3.1 the reviewer brief a real post run receives states the voice bar', async () => {
  const ctx = postRepo('filled');
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  const brief = readFileSync(join(ctx.worktreeRoot, `${res.jobId}-review-1-brief.md`), 'utf8');
  assert.match(brief, /\*\*Required, non-empty: `reads-human`\.\*\*/);
  assert.match(brief, /Identify the form first/);
  assert.match(brief, /- `reads-as-generated`/);
  ctx.cleanup();
});

/* ===========================================================================
 * The gate is not the only reader of a verdict record.
 * ======================================================================== */

test('a reads-human record still parses everywhere else that reads one', () => {
  // `lib/reviews.mjs` owns the piece -> record join and the build reads verdicts
  // through the one parser. A new front-matter key must not disturb either.
  const ctx = ctxAt();
  mkdirSync(ctx.reviewsDir, { recursive: true });
  const p = join(ctx.reviewsDir, 'seed-hand-written.md');
  writeFileSync(
    p,
    '---\nsubject: "content/blog/a-note.md"\nverdict: approve\nreasons: []\n' +
      'would-cite: "Someone arguing about the licence change."\n' +
      'reads-human: "It is short and it is blunt; nothing narrates itself."\n---\n\nNotes.\n',
    'utf8',
  );
  const v = parseVerdict(readFileSync(p, 'utf8'));
  assert.equal(v.verdict, 'approve');
  assert.equal(v.readsHuman, 'It is short and it is blunt; nothing narrates itself.');
  assert.equal(v.data.subject, 'content/blog/a-note.md', 'the unparsed keys still ride along');

  // And the site-side join still finds the piece: `reads-human` is a new key
  // beside `subject:`, not a change to it.
  assert.deepEqual(subjectsOf({ data: v.data }).slice(0, 1), ['content/blog/a-note.md']);
  ctx.cleanup();
});

/* ===========================================================================
 * say-what-a-review-record-covers — THE CARRY-FORWARD (specs/review, beads
 * addictedtoai-37rb). Tasks 13 and 14.
 *
 * A `reads-human` answers for the bytes its writer read. A repair, a revision
 * or any later job may rewrite those bytes, be approved by a reviewer of its
 * own, and leave the piece bound and clean while the only reviewer that ever
 * answered the voice question read a version that is gone. The obligation
 * therefore follows the MERGED SUBJECTS, not the job type — which is the one
 * thing every test below turns on, because the bead's own instance
 * (j-20260902-23, approving content/blog/glm-5-3-license-revenue-gate.md with
 * no `reads-human`) is a `repair`, and a type-keyed gate asks that reviewer for
 * neither field.
 *
 * One refusal per test, each asserting the CODE and that the message names the
 * offending record, field or post; and the controls beside them, because a gate
 * that refuses everything passes every refusal test and is useless.
 * ======================================================================== */

const POST_A = 'content/blog/a-note.md';
const POST_B = 'content/blog/b-note.md';

/**
 * A record written the way the loop leaves one: the reviewer's fields, then the
 * merge step's `subject:`. `subject:` is what makes the record NAME a piece, so
 * an anchor written without it is not an anchor at all.
 */
function record(ctx, jobId, { subject, ...fields }) {
  const p = writeVerdictRecord(ctx, jobId, { verdict: 'approve', notes: 'n', ...fields });
  if (subject) writeRecordSubjects(p, Array.isArray(subject) ? subject : [subject]);
  return p;
}

/** The anchor the happy path stands on: an approving post review with a voice verdict. */
function anchorFor(ctx, post = POST_A, jobId = 'j-anchor') {
  return record(ctx, jobId, {
    subject: post,
    wouldCite: `Someone citing ${post}.`,
    readsHuman: `${post} argues with itself and the closing line is blunt; nothing narrates itself.`,
  });
}

const CARRY_WHY = 'Three licence sentences changed; the prose, its rhythm and its point of view did not move.';

test('37rb REFUSAL: a repair whose subjects include a post, approving with NEITHER field', () => {
  // THE BEAD'S OWN SHAPE, and the one case a type-keyed gate lets through:
  // `needsReadsHuman('repair')` is false, so the older branch asks this reviewer
  // for nothing at all. The merged subjects are what make the demand.
  const ctx = ctxAt();
  record(ctx, 'j-repair', { wouldCite: 'a licence-tracking reader' });
  const refused = mergeGate(ctx, { jobId: 'j-repair', type: 'repair', subjects: [POST_A] });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'reads-human-empty');
  assert.match(refused.reason, /content\/blog\/a-note\.md/, 'the message names the unanswered post');
  assert.match(refused.reason, /reads-human-from/);
  assert.equal(needsReadsHuman('repair'), false, 'and the type-keyed rule still says nothing about it');
  ctx.cleanup();
});

test('37rb CONTROL: the same repair with a valid carry-forward merges', () => {
  const ctx = ctxAt();
  anchorFor(ctx);
  record(ctx, 'j-repair', {
    wouldCite: 'a licence-tracking reader',
    readsHumanFrom: [{ subject: POST_A, record: 'j-anchor.md', why: CARRY_WHY }],
  });
  const gate = mergeGate(ctx, { jobId: 'j-repair', type: 'repair', subjects: [POST_A] });
  assert.equal(gate.ok, true, gate.reason);
  // And the record round-trips: what the writer wrote is what the parser reads.
  assert.deepEqual(gate.verdict.readsHumanFrom, [
    { subject: POST_A, record: 'j-anchor.md', why: CARRY_WHY },
  ]);
  ctx.cleanup();
});

test('37rb CONTROL: a repair whose subjects hold no post is asked for neither field', () => {
  // The boundary of the new branch, and the assertion that it keys on SUBJECTS
  // rather than on "not a post job": nothing about a repair itself is gated.
  const ctx = ctxAt();
  record(ctx, 'j-wiki-repair', { wouldCite: 'a wiki reader' });
  const gate = mergeGate(ctx, {
    jobId: 'j-wiki-repair',
    type: 'repair',
    subjects: ['content/wiki/model/some-model.md', 'content/directory/tools/vllm.md'],
  });
  assert.equal(gate.ok, true, gate.reason);
  assert.equal(gate.verdict.readsHuman, '');
  assert.deepEqual(gate.verdict.readsHumanFrom, []);
  ctx.cleanup();
});

test('37rb REFUSAL: a carry-forward naming a record that does not exist', () => {
  const ctx = ctxAt();
  record(ctx, 'j-repair', {
    wouldCite: 'a licence-tracking reader',
    readsHumanFrom: [{ subject: POST_A, record: 'j-no-such-record.md', why: CARRY_WHY }],
  });
  const refused = mergeGate(ctx, { jobId: 'j-repair', type: 'repair', subjects: [POST_A] });
  assert.equal(refused.code, 'reads-human-from-unanchored');
  assert.match(refused.reason, /j-no-such-record\.md/);
  assert.match(refused.reason, /does not exist/);
  ctx.cleanup();
});

test('37rb REFUSAL: a carry-forward naming a record that names a different piece', () => {
  const ctx = ctxAt();
  record(ctx, 'j-elsewhere', {
    subject: 'content/blog/some-other-note.md',
    wouldCite: 'a reader of the other note',
    readsHuman: 'The other note is blunt and short; it reads like a person wrote it.',
  });
  record(ctx, 'j-repair', {
    wouldCite: 'a licence-tracking reader',
    readsHumanFrom: [{ subject: POST_A, record: 'j-elsewhere.md', why: CARRY_WHY }],
  });
  const refused = mergeGate(ctx, { jobId: 'j-repair', type: 'repair', subjects: [POST_A] });
  assert.equal(refused.code, 'reads-human-from-unanchored');
  assert.match(refused.reason, /j-elsewhere\.md/);
  assert.match(refused.reason, /does not name this same piece/);
  assert.match(refused.reason, /content\/blog\/a-note\.md/, 'and it names WHICH post failed');
  ctx.cleanup();
});

test('37rb REFUSAL: a carry-forward naming a record that records `revise`', () => {
  const ctx = ctxAt();
  record(ctx, 'j-revised', {
    verdict: 'revise',
    reasons: ['not-worth-reading'],
    subject: POST_A,
    wouldCite: 'nobody yet',
    readsHuman: 'It reads assembled: every paragraph is the same shape.',
  });
  record(ctx, 'j-repair', {
    wouldCite: 'a licence-tracking reader',
    readsHumanFrom: [{ subject: POST_A, record: 'j-revised.md', why: CARRY_WHY }],
  });
  const refused = mergeGate(ctx, { jobId: 'j-repair', type: 'repair', subjects: [POST_A] });
  assert.equal(refused.code, 'reads-human-from-unanchored');
  assert.match(refused.reason, /j-revised\.md/);
  assert.match(refused.reason, /records `revise`/);
  ctx.cleanup();
});

test('37rb REFUSAL: a carry-forward naming a record that carries no reads-human', () => {
  const ctx = ctxAt();
  record(ctx, 'j-silent', { subject: POST_A, wouldCite: 'a reader of the note' });
  record(ctx, 'j-repair', {
    wouldCite: 'a licence-tracking reader',
    readsHumanFrom: [{ subject: POST_A, record: 'j-silent.md', why: CARRY_WHY }],
  });
  const refused = mergeGate(ctx, { jobId: 'j-repair', type: 'repair', subjects: [POST_A] });
  assert.equal(refused.code, 'reads-human-from-unanchored');
  assert.match(refused.reason, /j-silent\.md/);
  assert.match(refused.reason, /carries no non-empty `reads-human` of its own/);
  ctx.cleanup();
});

test('37rb REFUSAL: an anchor whose OWN answer is only a carry-forward — one hop, never a chain', () => {
  // A resolver that walked the chain here would accept a record the launch check
  // must then either refuse (the two ends disagreeing) or accept by walking the
  // same chain — which is exactly the drift this change exists to stop. The
  // reviewer is sent to name the record that actually answered.
  const ctx = ctxAt();
  anchorFor(ctx, POST_A, 'j-real-answer');
  record(ctx, 'j-middle', {
    subject: POST_A,
    wouldCite: 'the middle repair',
    readsHumanFrom: [{ subject: POST_A, record: 'j-real-answer.md', why: 'A dead link was fixed; the prose is untouched.' }],
  });
  record(ctx, 'j-repair', {
    wouldCite: 'a licence-tracking reader',
    readsHumanFrom: [{ subject: POST_A, record: 'j-middle.md', why: CARRY_WHY }],
  });
  const refused = mergeGate(ctx, { jobId: 'j-repair', type: 'repair', subjects: [POST_A] });
  assert.equal(refused.code, 'reads-human-from-unanchored');
  assert.match(refused.reason, /j-middle\.md/);
  assert.match(refused.reason, /one hop and never a chain/);
  ctx.cleanup();
});

test('37rb REFUSAL: an entry whose subject is not among the merged subjects', () => {
  // An entry cannot answer for a post this job did not touch.
  const ctx = ctxAt();
  anchorFor(ctx, POST_B, 'j-anchor-b');
  record(ctx, 'j-repair', {
    wouldCite: 'a licence-tracking reader',
    readsHuman: 'The note reads human: it is short and it refuses to hedge.',
    readsHumanFrom: [{ subject: POST_B, record: 'j-anchor-b.md', why: CARRY_WHY }],
  });
  const refused = mergeGate(ctx, { jobId: 'j-repair', type: 'repair', subjects: [POST_A] });
  assert.equal(refused.code, 'reads-human-from-unanchored');
  assert.match(refused.reason, /content\/blog\/b-note\.md/);
  assert.match(refused.reason, /did not merge/);
  ctx.cleanup();
});

test('37rb REFUSAL: a blank `why` is dropped by the parser, and its post is then unanswered', () => {
  // The fail-closed direction the parser was written for: a half-written entry
  // is not a weaker answer, it is no answer, and the post it meant to answer
  // for falls through to the choose-one-of-two refusal.
  const ctx = ctxAt();
  anchorFor(ctx);
  mkdirSync(ctx.reviewsDir, { recursive: true });
  writeFileSync(
    verdictPath(ctx, 'j-blank-why'),
    '---\njob: j-blank-why\nverdict: approve\nreasons: []\nwould-cite: "a licence-tracking reader"\n' +
      `reads-human-from:\n  - subject: ${JSON.stringify(POST_A)}\n    record: "j-anchor.md"\n    why: ""\n---\n\nn\n`,
    'utf8',
  );
  const parsed = parseVerdict(readFileSync(verdictPath(ctx, 'j-blank-why'), 'utf8'));
  assert.deepEqual(parsed.readsHumanFrom, [], 'the entry is dropped, not accepted blank');
  assert.match(parsed.readsHumanFromWarnings.join(' '), /no non-empty `why`/);

  const refused = mergeGate(ctx, { jobId: 'j-blank-why', type: 'repair', subjects: [POST_A] });
  assert.equal(refused.code, 'reads-human-empty');
  assert.match(refused.reason, /content\/blog\/a-note\.md/);
  assert.match(refused.reason, /Entries skipped as malformed/, 'and the reviewer is told why its entry vanished');
  ctx.cleanup();
});

test('37rb REFUSAL: a `why` identical to another record\'s statement', () => {
  const ctx = ctxAt();
  anchorFor(ctx);
  record(ctx, 'j-earlier-repair', {
    subject: POST_A,
    wouldCite: 'the earlier repair',
    readsHumanFrom: [{ subject: POST_A, record: 'j-anchor.md', why: CARRY_WHY }],
  });
  // Recycled verbatim except for whitespace and line endings — the same
  // normalisation `would-cite` and `reads-human` are held to, through the same
  // sweep and the same normaliser.
  record(ctx, 'j-repair', {
    wouldCite: 'a different argument entirely',
    readsHumanFrom: [{ subject: POST_A, record: 'j-anchor.md', why: `\r\n  ${CARRY_WHY}  \n` }],
  });
  const refused = mergeGate(ctx, { jobId: 'j-repair', type: 'repair', subjects: [POST_A] });
  assert.equal(refused.code, 'reads-human-from-duplicate');
  assert.match(refused.reason, /j-earlier-repair\.md/, 'and it names the record it collided with');
  assert.match(refused.reason, /content\/blog\/a-note\.md/);
  ctx.cleanup();
});

test('MUST-FIX REFUSAL: a repair whose fresh `reads-human` duplicates another record\'s', () => {
  // The subjects-keyed N1 branch enforced only the non-empty half of "answer
  // the question afresh, in a non-empty, non-duplicated `reads-human`, as
  // above" (specs/review) — the duplicate half never ran for a job whose TYPE
  // does not itself demand the field. MEASURED: a `repair` approving POST_A
  // with a `reads-human` byte-identical (after whitespace trimming) to
  // j-anchor's used to merge, because `needsReadsHuman('repair')` is false so
  // the type-keyed branch never checked it, and this branch's own condition
  // required `!v.readsHuman`, which a fresh field never satisfies.
  const ctx = ctxAt();
  anchorFor(ctx);
  record(ctx, 'j-repair', {
    subject: POST_A,
    wouldCite: 'a licence-tracking reader',
    readsHuman: `\r\n  ${POST_A} argues with itself and the closing line is blunt; nothing narrates itself.  \n`,
  });
  const refused = mergeGate(ctx, { jobId: 'j-repair', type: 'repair', subjects: [POST_A] });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'reads-human-duplicate');
  assert.match(refused.reason, /j-anchor\.md/, 'and it names the record it collided with');
  assert.match(refused.reason, /content\/blog\/a-note\.md/, 'and it names the post');
  assert.equal(needsReadsHuman('repair'), false, 'and the type-keyed rule still says nothing about it');
  ctx.cleanup();
});

test('MUST-FIX CONTROL: a repair with a FRESH, non-duplicated `reads-human` still merges', () => {
  const ctx = ctxAt();
  anchorFor(ctx);
  record(ctx, 'j-repair', {
    subject: POST_A,
    wouldCite: 'a licence-tracking reader',
    readsHuman: 'This repair read the note fresh: the new sentence lands flat, and that flatness is a judgment.',
  });
  const gate = mergeGate(ctx, { jobId: 'j-repair', type: 'repair', subjects: [POST_A] });
  assert.equal(gate.ok, true, gate.reason);
  assert.equal(
    gate.verdict.readsHuman,
    'This repair read the note fresh: the new sentence lands flat, and that flatness is a judgment.',
  );
  ctx.cleanup();
});

test('37rb CONTROL: two entries in the SAME record may share a `why`', () => {
  // One job making the same trivial correction to two posts has one honest
  // sentence to write about both. Forcing variation there manufactures the
  // judgment the duplicate rule exists to catch, rather than catching it.
  const ctx = ctxAt();
  anchorFor(ctx, POST_A, 'j-anchor-a');
  anchorFor(ctx, POST_B, 'j-anchor-b');
  record(ctx, 'j-repair', {
    wouldCite: 'a licence-tracking reader',
    readsHumanFrom: [
      { subject: POST_A, record: 'j-anchor-a.md', why: CARRY_WHY },
      { subject: POST_B, record: 'j-anchor-b.md', why: CARRY_WHY },
    ],
  });
  const gate = mergeGate(ctx, { jobId: 'j-repair', type: 'repair', subjects: [POST_A, POST_B] });
  assert.equal(gate.ok, true, gate.reason);
  ctx.cleanup();
});

test('37rb CONTROL: a record carrying BOTH a fresh reads-human and a valid carry-forward merges', () => {
  // The requirement asks for one of the two answers, not for exactly one — and
  // the anchor check still runs on the carry-forward it carries.
  const ctx = ctxAt();
  anchorFor(ctx);
  record(ctx, 'j-both', {
    wouldCite: 'a licence-tracking reader',
    readsHuman: 'The rewritten half is blunt and uneven in a way no template produces.',
    readsHumanFrom: [{ subject: POST_A, record: 'j-anchor.md', why: CARRY_WHY }],
  });
  assert.equal(mergeGate(ctx, { jobId: 'j-both', type: 'repair', subjects: [POST_A] }).ok, true);

  // And an INVALID anchor beside a valid fresh answer is still refused: the
  // anchor check applies to every entry, not only inside the branch above.
  record(ctx, 'j-both-bad', {
    wouldCite: 'another licence-tracking reader',
    readsHuman: 'A second fresh judgment, unlike the first, about the same rewritten half.',
    readsHumanFrom: [{ subject: POST_A, record: 'j-no-such-record.md', why: 'A different sentence about the same diff.' }],
  });
  const refused = mergeGate(ctx, { jobId: 'j-both-bad', type: 'repair', subjects: [POST_A] });
  assert.equal(refused.code, 'reads-human-from-unanchored');
  ctx.cleanup();
});

test('37rb the refusal resolves PER POST: one entry does not answer for a second post', () => {
  // THE TWO-POST FIXTURE, asserted at this end; the launch check asserts the
  // other end in scripts/verify-launch-voice-carry.test.mjs. Refusing on the
  // record as a whole — one entry anywhere satisfies it — is the hole this
  // wording closes: post B would stay bound and unanswered while the launch
  // check reported it voice-missing, which is the two-ends drift this change
  // exists to stop.
  const ctx = ctxAt();
  anchorFor(ctx, POST_A, 'j-anchor-a');
  anchorFor(ctx, POST_B, 'j-anchor-b');
  record(ctx, 'j-two-posts', {
    wouldCite: 'a licence-tracking reader',
    readsHumanFrom: [{ subject: POST_A, record: 'j-anchor-a.md', why: CARRY_WHY }],
  });
  const refused = mergeGate(ctx, { jobId: 'j-two-posts', type: 'repair', subjects: [POST_A, POST_B] });
  assert.equal(refused.ok, false);
  assert.equal(refused.code, 'reads-human-empty');
  assert.match(refused.reason, /content\/blog\/b-note\.md/, 'the message names post B');
  assert.ok(
    !/content\/blog\/a-note\.md/.test(refused.reason.split('Unanswered post(s):')[1] ?? ''),
    'and does not name post A, which was answered',
  );

  // Re-issued — the same job, the same record path, now with an entry for each
  // post — and it merges. Re-issuing under the same job id is what the refusal
  // asks for, and it is also what keeps the duplicate sweep honest: a record
  // does not collide with the version of itself it replaced.
  record(ctx, 'j-two-posts', {
    wouldCite: 'a licence-tracking reader, second pass',
    readsHumanFrom: [
      { subject: POST_A, record: 'j-anchor-a.md', why: CARRY_WHY },
      { subject: POST_B, record: 'j-anchor-b.md', why: 'The same three licence sentences, in the second note; its voice is untouched.' },
    ],
  });
  const gate = mergeGate(ctx, { jobId: 'j-two-posts', type: 'repair', subjects: [POST_A, POST_B] });
  assert.equal(gate.ok, true, gate.reason);
  ctx.cleanup();
});

test('37rb CONTROL: a fresh non-empty reads-human answers for every post in the diff', () => {
  // "One such field answers for every post among the merged subjects that the
  // record carries no carry-forward entry for" — the requirement does not
  // divide one reviewer's own-words judgment per post.
  const ctx = ctxAt();
  record(ctx, 'j-fresh-both', {
    wouldCite: 'a reader of both notes',
    readsHuman: 'Both notes are short, blunt and unevenly paced; neither narrates its own method.',
  });
  assert.equal(
    mergeGate(ctx, { jobId: 'j-fresh-both', type: 'repair', subjects: [POST_A, POST_B] }).ok,
    true,
  );
  ctx.cleanup();
});

test('37rb a job with no measured subjects is not gated here, exactly as `reviewed:` is not', () => {
  const ctx = ctxAt();
  record(ctx, 'j-unmeasured', { wouldCite: 'a licence-tracking reader' });
  assert.equal(mergeGate(ctx, { jobId: 'j-unmeasured', type: 'repair' }).ok, true);
  ctx.cleanup();
});

test('37rb the brief and both checklists a repair reaches state the two branches', () => {
  // A mechanism a reviewer is not told about is a mechanism that does not run.
  // The bead's own instance is a `repair`, whose checklist is `directory` —
  // there is no list named `repair`, and editing one that does not exist is how
  // this gets done wrong.
  const ctx = ctxAt();
  assert.ok(
    checklistFor('repair').some((c) => /Spot-check the changed rows against their sources/.test(c)),
    'a repair gets the `directory` list — there is no CHECKLISTS entry named `repair`',
  );
  for (const type of ['repair', 'post']) {
    const list = checklistFor(type).join('\n');
    assert.match(list, /reads-human-from/, `${type}'s checklist never names the carry-forward`);
    assert.match(list, /not a carry-forward/, `${type}'s checklist never says a rewrite is not one`);
    assert.match(list, /`spec-violation`/, `${type}'s checklist never names the verdict for carrying one wrongly`);
  }
  // The brief itself, for every type held to the subjects-keyed branch rather
  // than to the fresh answer.
  for (const type of JOB_TYPES.filter((t) => !needsReadsHuman(t))) {
    const brief = briefFor(ctx, type);
    assert.match(brief, /If your diff lands on a blog post/, type);
    assert.match(brief, /\*\*Answer it afresh\*\* in a non-empty `reads-human`/, type);
    assert.match(brief, /\*\*Carry the prior answer forward\*\*, in a `reads-human-from` entry/, type);
    assert.match(brief, /\*\*One entry per post\.\*\*/, type);
    assert.match(brief, /one hop and never a\s+chain/, type);
    assert.match(brief, /rewrites the post's prose is not a carry-forward/i, type);
    assert.match(brief, /^# reads-human-from:/m, `${type}: the record skeleton carries the key`);
  }
  // And a `post` reviewer is still asked for the FRESH answer and given no
  // second branch to take instead — the demand this change does not widen.
  const post = briefFor(ctx, 'post');
  assert.ok(!/If your diff lands on a blog post/.test(post));
  assert.match(post, /\*\*Required, non-empty: `reads-human`\.\*\*/);
  ctx.cleanup();
});

test('37rb THE PARSER CONTROL: every record in data/reviews/ parses exactly as it did', () => {
  // Without this, the field could have changed how 357 existing records read and
  // every test above would still pass. The reference below is `parseVerdict` as
  // it stood BEFORE the carry-forward — copied deliberately, because the
  // question is whether the two agree, and comparing the parser against itself
  // answers nothing.
  const reference = (text) => {
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
    let readsHuman = data['reads-human'] ?? data.reads_human ?? data.readsHuman ?? '';
    let reasons = data.reasons ?? [];
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
    if (!readsHuman && !hasFrontMatter) {
      const m = /^\s*(?:\*\*)?reads[-_ ]human(?:\*\*)?\s*:\s*(.+)$/im.exec(fallbackText);
      if (m) readsHuman = m[1];
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
      readsHuman: String(readsHuman ?? '').trim(),
    };
  };

  const names = readdirSync(REVIEWS_DIR).filter((n) => n.endsWith('.md') && n !== 'README.md');
  assert.ok(names.length > 100, `the real records directory is what this measures: ${names.length}`);
  for (const name of names) {
    const text = readFileSync(join(REVIEWS_DIR, name), 'utf8');
    const now = parseVerdict(text);
    const before = reference(text);
    assert.equal(now.verdict, before.verdict, name);
    assert.deepEqual(now.reasons, before.reasons, name);
    assert.equal(now.wouldCite, before.wouldCite, name);
    assert.equal(now.readsHuman, before.readsHuman, name);
    // And none of them carries the new key, well-formed or malformed — so the
    // reach-back the launch check applies to them is the whole answer for this
    // corpus, and no existing record is silently reinterpreted.
    assert.deepEqual(now.readsHumanFromWarnings, [], name);
  }
});
