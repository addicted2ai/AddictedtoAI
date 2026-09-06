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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

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
import { subjectsOf } from '../../lib/reviews.mjs';
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

test('3.1 the five re-issue refusals are named together, so callers need not list them by hand', () => {
  assert.deepEqual([...REISSUE_CODES], [
    'would-cite-empty',
    'would-cite-duplicate',
    'reads-human-empty',
    'reads-human-duplicate',
    'corrections-malformed',
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
