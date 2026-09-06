/**
 * brief-acceptance.test.mjs — what an assembled brief actually TELLS the
 * executor (make-the-blog-worth-sending, tasks 2.3, 3.3 and 3.8's brief half).
 *
 * These tests assemble real briefs and read them, rather than asserting on the
 * `ACCEPTANCE_BY_TYPE` table directly. The table is not the contract; the
 * assembled markdown is. A check that exists in the table but never reaches the
 * text — dropped by a template edit, filtered by a `?? []`, or shadowed by a
 * heading that never renders — has not been given to anybody, and `.job/brief.md`
 * is the executor's ONLY channel: no session, no memory across invocations, no
 * way to ask.
 *
 * Every brief here is assembled against a FIXTURE repository with no
 * `openspec/` tree at all, so the "Relevant spec excerpts" section is empty.
 * That is deliberate and load-bearing: the acceptance checks must carry the
 * whole bar on their own, and a brief that leans on an excerpt to state its
 * rules is a brief that stated them nowhere the day the excerpt changes.
 *
 * That day arrived while this change was in flight, which is the strongest
 * argument for the fixture. `loop/lib/specs.mjs` used to read
 * `openspec/specs/<cap>/spec.md` and nothing else reachable, so a scout brief
 * assembled in the working repository quoted the pre-change `specs/loop` and
 * never mentioned a scout — `grep -c "The scout looks outward"` over the whole
 * brief returned 0. It was repaired on 2026-08-30 to quote the constitution
 * PLUS every in-flight change's delta for that capability, labelled as a
 * pending amendment and discovered by listing `openspec/changes/`. The excerpt
 * section is richer now and these tests are unaffected by that, on purpose.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { assembleBrief, ACCEPTANCE_BY_TYPE, acceptanceChecksFor, proposalRule } from '../lib/brief.mjs';
import { JOB_TYPES } from '../lib/config.mjs';
import { DOMAINS, FRONTIER_CRITERIA } from '../../lib/domains.mjs';
import { makeRepo } from './helpers.mjs';

/** Assemble one brief of `type` against a spec-less fixture repository. */
function brief(t, type, extra = {}) {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup?.());
  const text = assembleBrief(ctx, {
    jobId: 'j-20260830-01',
    job: { type, source: 'queue', title: `a ${type} job`, detail: 'the stated outcome', ...extra },
    branch: 'job/j-20260830-01',
    capMinutes: 60,
  });
  assert.match(
    text,
    /_No spec files found in this worktree\._/,
    'precondition: this fixture has no openspec tree, so nothing below may be carried by an excerpt',
  );
  return text;
}

/** Assert every phrase is present, naming the missing one rather than "false !== true". */
function carries(text, phrases, what) {
  for (const p of phrases) {
    assert.ok(text.includes(p), `${what}: the assembled brief never says ${JSON.stringify(p)}`);
  }
}

// ---------------------------------------------------------------------------
// Task 2.3 — the scout brief
// ---------------------------------------------------------------------------

test('2.3 the scout brief carries the outward charge and its evidence requirement', (t) => {
  carries(
    brief(t, 'scout'),
    [
      'bring back work the site could not have thought of by looking at itself',
      'externally retrieved evidence',
      'the date you retrieved it',
      'could have been written without leaving this repository',
      'spec-violation',
    ],
    '2.3 charge',
  );
});

test('2.3 the scout brief carries the two tests, the cap of three, and the docket', (t) => {
  const text = brief(t, 'scout');
  carries(
    text,
    [
      'worth a stranger',           // test 1, in its would-send form for a post
      'would-SEND form',
      'true, checkable and current', // test 2
      'AT MOST THREE UNFLAGGED',
      'the most worthy three, not the first three',
      'data/proposals/',
      'kebab-case `slug`',
      '`type` from the closed job-type list',
      '`expires:` date',
      'at most 7 days out for an event-driven candidate, at most 14 for a synthesis',
      'why-now',
      'done-when acceptance lines',
    ],
    '2.3 bar and docket',
  );
});

// ── the cap sentence the WRITING side is given (flag-what-moved-the-frontier)
//
// `flag-what-moved-the-frontier` modified exactly one sentence of the scout's
// cap: specs/loop now reads "the loop keeps at most three **unflagged**
// candidate files … and every excess unflagged candidate is moved to the drop
// record". Round 1 rewrote that sentence on the side that JUDGES
// (`review.mjs`, CHECKLISTS.scout — pinned at review-blog-bar.test.mjs:383)
// and left the superseded absolute standing on the side that WRITES, three
// times over: the acceptance check and both halves of `proposalRule`.
//
// That asymmetry is invisible to every other assertion in this file. The cap
// assertions were the bare substrings "AT MOST THREE" and "at most three",
// which pass on the pre-change sentence and on the corrected one alike — so
// nothing pinned the author side in EITHER direction, and the pre-change
// wording survived a full green suite. The delta's own scenario "A frontier
// story is filed beside a full docket" requires the scout to FILE a fourth
// candidate; a job whose brief says "AT MOST THREE candidates are filed per
// run" and "the loop keeps three … and moves the rest to dropped/" does not
// file it. The exemption then never fires in production, and because the merge
// rule is what would have reported it, nothing reports that it did not.
//
// A Desk job is one written prompt in and files out. The brief is its only
// channel; an untold job cannot know. So the sentence is pinned here.
test('the scout brief’s OWN cap sentence counts unflagged candidates, not candidates', (t) => {
  const text = brief(t, 'scout');
  carries(
    text,
    [
      // The acceptance check (ACCEPTANCE_BY_TYPE.scout).
      'AT MOST THREE UNFLAGGED candidates are filed per run',
      'A candidate carrying a valid `frontier: true` does not count against those three',
      'the loop keeps three UNFLAGGED candidates',
      'moves the excess UNFLAGGED candidates to `data/proposals/dropped/`',
      // The proposal rule's body and its merge mechanics (proposalRule('scout')).
      'at most three\nUNFLAGGED candidates per run',
      'every candidate carrying a valid `frontier: true` —\nwhich is exempt from that count',
      'If this branch adds more than three\nUNFLAGGED proposal files, the loop keeps three',
      'moves the excess UNFLAGGED ones to',
      'is kept BESIDE those three and is never the one moved',
      // And the half that keeps the exemption from being read as a budget.
      'the flag lifts the COUNT and lifts nothing else',
      'it does NOT rejoin the three',
    ],
    'scout author-side cap',
  );
  // The superseded absolute must not survive anywhere in the writing side. This
  // is the assertion that would have failed in round 1: each of these three
  // reads as a flat cap of three files, which is what the delta modified.
  for (const gone of [
    'AT MOST THREE candidates are filed per run',
    'at most three\nper run, the most worthy three',
    'If this branch adds more than three\nproposal files, the loop keeps three',
  ]) {
    assert.ok(
      !text.includes(gone),
      `the scout brief still carries the PRE-CHANGE cap sentence ${JSON.stringify(gone)} — `
        + 'a job told a flat cap of three does not file the validly flagged fourth the '
        + 'exemption exists for, and nothing downstream reports that it did not',
    );
  }
});

test('the frontier exemption is NOT offered to a non-scout brief', (t) => {
  // The paired boundary, from the other side. `proposals.mjs` enforces that the
  // exemption is the scout's cap and no other job's; a brief that offered an
  // `entry` job a flag-shaped way out of its one-proposal rule would be telling
  // it to file something the merge then drops — the worst of both, since the
  // job spent the work and the rule still held.
  const text = brief(t, 'entry');
  carries(
    text,
    [
      'If this branch adds more than one\nproposal file, the loop keeps one',
      'the frontier exemption is the SCOUT’S cap and no other job’s'.replace(/’/g, "'"),
      "a `entry` job's flagged proposal is counted exactly as before",
    ],
    'non-scout cap',
  );
  assert.ok(
    !text.includes('UNFLAGGED'),
    'an ordinary job has no unflagged/flagged distinction to make — its cap counts every proposal',
  );
});

test('2.3 the scout brief requires a drop record per decline, naming test and refile condition', (t) => {
  carries(
    brief(t, 'scout'),
    [
      'data/proposals/dropped/',
      'which of the two tests it failed',
      'what would make it worth refiling',
      'never silently dropped',
    ],
    '2.3 drop records',
  );
});

test('2.3 a quiet day opens the synthesis branch, and nothing clearing it is a success', (t) => {
  const text = brief(t, 'scout');
  carries(
    text,
    [
      'A QUIET DAY OPENS THE SYNTHESIS BRANCH, and never a floor',
      'accumulated recorded evidence',
      'an opportunity, not an obligation',
      'blocked: nothing cleared the bar',
      'Zero candidates on a quiet day is the bar working',
    ],
    '2.3 quiet day',
  );
  // The exact string the executor must write, not a paraphrase of it: the loop
  // classifies on `RESULT.md`'s first line, so a brief that only gestures at
  // the wording gets a `blocked:` line the ledger records under some other
  // reason, and the honest-quiet case stops being countable.
  assert.match(
    text,
    /first line exactly `blocked: nothing cleared the bar`/,
    'the blocked line must be given verbatim, since the loop parses it',
  );
});

// ---------------------------------------------------------------------------
// Task 3.3 — the post brief
// ---------------------------------------------------------------------------

test('3.3 the post brief carries both forms and each form’s finish line', (t) => {
  carries(
    brief(t, 'post'),
    [
      'ONE OF TWO FORMS',
      'no minimum length',
      'brevity alone is never a defect',
      'where the primary evidence is',
      'state the method',
      'reproduce the derivation',
      'enumerable dated evidence',
    ],
    '3.3 forms',
  );
});

test('3.3 the post brief states the anchor declaration and its two-sided window', (t) => {
  carries(
    brief(t, 'post'),
    [
      'DECLARES ITS ANCHOR in front matter',
      '`covers:`',
      '`anchor:`',
      'data/changes.jsonl',
      '7 days ENDING on the post',
      'launders nothing',
      'A dated-event post with no anchor comes back `spec-violation`',
    ],
    '3.3 anchor',
  );
});

test('3.3 the post brief demands the affected party, and exempts a synthesis', (t) => {
  carries(
    brief(t, 'post'),
    [
      'AFFECTED PARTY',
      'what changes for them, concretely',
      'not-worth-reading',
      'is not required to invent one',
    ],
    '3.3 affected party',
  );
});

test('3.3 the post brief says the subject is the world’s AI and never this site', (t) => {
  carries(
    brief(t, 'post'),
    [
      '**This site is never the subject**',
      'its machinery, its corpus, its build, its process, or its history',
      'data layer IS fair evidence',
    ],
    '3.3 subject',
  );
});

test('3.3 the post brief names the voice document and says the lint does not gate', (t) => {
  carries(
    brief(t, 'post'),
    [
      'openspec/style/blog-voice.md',
      'reads-as-generated',
      'never fails the build',
      'a green build is not a passed voice check',
    ],
    '3.3 voice',
  );
});

test('3.3 the rewrite KEEPS the four checks that were already there', (t) => {
  const text = brief(t, 'post');
  // Verbatim, because the rewrite's risk is not omission-by-accident but
  // dilution: these four are the checks that were carrying the post job before
  // this change, and the task says the final one stays what it is today.
  carries(
    text,
    [
      'Every external claim was source-checked by fetching the source during this job.',
      'The title and excerpt claim no more than the body proves.',
      'Dates are explicit; nothing reads as current that is merely recent.',
      'It is worth an enthusiast’s time. If it is not, write nothing and report `blocked:` — a post exists because something happened, never because a slot was open.',
    ],
    '3.3 preserved checks',
  );
});

// ---------------------------------------------------------------------------
// Task 3.8 (brief half) — every brief states the proposal rule binding its job
// ---------------------------------------------------------------------------

const FRONT_MATTER_CONTRACT = ['date:', 'slug:', 'type:', 'summary:', 'evidence:', 'expires:'];

test('3.8 an ordinary job’s brief states the one-proposal rule and the front-matter contract', (t) => {
  const text = brief(t, 'entry');
  carries(
    text,
    [
      '## Proposals — the one thing you may file beside this job',
      'at most one** proposal in `data/proposals/`',
      'not** a way to widen this job',
      'cools for 3 days',
      'never a new kind of work',
      ...FRONT_MATTER_CONTRACT,
    ],
    '3.8 ordinary',
  );
  // The rule is stated for the job READING it: the stamped type is this job's,
  // and the self-amplification guard is named in its own terms.
  assert.ok(text.includes('this job\'s type (`entry`)'), 'the stamp names this job’s own type');
  assert.ok(text.includes('cannot propose another `entry`'), 'and the self-amplification guard in its terms');
});

test('3.8 the scout brief states the scout’s own rule, not the one-proposal rule', (t) => {
  const text = brief(t, 'scout');
  carries(
    text,
    [
      'Filing candidates **is** this job\'s outcome',
      'at most three',
      'data/proposals/dropped/',
      ...FRONT_MATTER_CONTRACT,
    ],
    '3.8 scout',
  );
  assert.ok(
    !text.includes('at most one** proposal'),
    'the scout must not be handed the ordinary one-proposal cap — its cap is three',
  );
});

test('3.8 the expiry half of the contract is stated, both directions', (t) => {
  for (const type of ['entry', 'scout']) {
    const text = brief(t, type);
    carries(
      text,
      [
        'WITHOUT it a proposal cools for 3 days',
        'WITH it the',
        'cooling is skipped and it is selectable at once',
        'swept to data/proposals/dropped/',
      ],
      `3.8 expiry (${type})`,
    );
  }
});

test('3.8 EVERY job type’s brief states a proposal rule — the spec says every brief', (t) => {
  // "Every brief the loop assembles SHALL state the proposal rule that binds
  // its job" (specs/loop). Every, so this loops the closed list rather than
  // sampling two types.
  for (const type of JOB_TYPES) {
    const text = brief(t, type);
    assert.match(
      text,
      /^## (Proposals — the one thing you may file beside this job|Filing candidates — this job's outcome, and its mechanical cap)$/m,
      `a ${type} brief states no proposal rule`,
    );
    for (const key of FRONT_MATTER_CONTRACT) {
      assert.ok(text.includes(key), `a ${type} brief omits "${key}" from the front-matter contract`);
    }
  }
});

test('3.8 the proposal rule is plain markdown, like the rest of a brief', (t) => {
  // Portability: a brief carries no harness syntax anywhere, and this section
  // is new text that could have introduced some.
  for (const type of ['entry', 'scout']) {
    const text = proposalRule(type);
    for (const bad of [/<function_calls>/, /\bslash command\b/, /\/[a-z-]+\s+skill/i]) {
      assert.ok(!bad.test(text), `${type}: the proposal rule must carry no harness-specific syntax (${bad})`);
    }
  }
});

// ---------------------------------------------------------------------------
// The frontier flag (flag-what-moved-the-frontier, tasks 10-11)
//
// A Desk job is one written prompt in and files out: no session, no memory
// across invocations, no way to ask. An untold job cannot know, so everything
// the flag requires has to reach the assembled markdown — and these fixtures
// have no `openspec/` tree at all, so nothing below can be carried by a spec
// excerpt that happens to quote the delta today.
// ---------------------------------------------------------------------------

test('10 the scout brief carries the standing sweep, the five criteria and the not-qualifying test', (t) => {
  const text = brief(t, 'scout');
  carries(
    text,
    [
      'asked on EVERY run across EVERY domain',
      'NOT QUALIFYING',
      'a new checkpoint, a price change, a benchmark post with no new artifact, a tool release',
      'what every other AI news site already shows does not qualify on its own',
    ],
    '10 sweep',
  );
  // Every criterion, by id AND by its text — an id list would tell a job which
  // labels exist and nothing about what they mean.
  for (const c of FRONTIER_CRITERIA) {
    assert.ok(text.includes(`**${c.id}**`), `the scout brief omits ${c.id}`);
    assert.ok(text.includes(c.text), `the scout brief omits what ${c.id} means`);
  }
});

test('10 the scout brief carries the flag’s own bar, the vocabulary, and the exemption', (t) => {
  const text = brief(t, 'scout');
  carries(
    text,
    [
      '`frontier_reason`, exactly one of F1-F5',
      'IS NOT FILED',
      'A VALID FLAG DOES NOT SPEND ONE OF THE THREE',
      'The exemption is from the COUNT and from nothing else',
      'refuses a flagged candidate over the ceiling exactly as it refuses an unflagged one',
      'A flag applied to fill a quiet domain is the failure the criteria exist to prevent',
      'RADAR FEEDS ARE INPUTS TO THE SWEEP AND ARE NEVER DISPLAYED RAW',
    ],
    '10 bar and exemption',
  );
  for (const d of DOMAINS) assert.ok(text.includes(d), `the scout brief omits the domain ${d}`);
  // K46, in the brief rather than only in the schema: a job told "at least one
  // domain" would decline to flag a court filing at all, and nothing would
  // report that it had.
  assert.match(text, /`domains` is OPTIONAL/);
  assert.match(text, /"general" is the UNMARKED default/);
});

test('10 a frontier decline names its criterion, and the rule is UNCONDITIONAL', (t) => {
  // The loop delta adds a SHALL to the drop-record bullet: "A story considered
  // as a frontier candidate and declined SHALL name which criterion it was
  // weighed against and why it failed — the surface's own claim is that it shows
  // what other AI news sites do not, and the declines are the only record of
  // where that line was drawn."
  //
  // The defect this pins is a conditional standing in for an unconditional rule.
  // The quiet-domain check already says "record the declines against the
  // criteria they failed", which satisfies the sentence in the one case a domain
  // has gone quiet and defeats it everywhere else — so a scout that weighs eight
  // stories against F1-F5 and declines all eight writes eight records naming
  // only the two-test bar, and where the frontier line was drawn that day is
  // unrecoverable.
  const text = brief(t, 'scout');
  carries(
    text,
    [
      'ALSO NAMES WHICH CRITERION (F1-F5) IT WAS WEIGHED AGAINST AND WHY IT FAILED',
      'That is unconditional — every run, every domain',
      'whether or not the domain is quiet',
      'these declines are the ONLY record of where that line was drawn',
    ],
    '10 frontier declines',
  );
  // Measured, not assumed: the sentence must be in the DROP-RECORD check, not
  // only inside the quiet-domain one it is too easily read as a restatement of.
  const dropCheck = ACCEPTANCE_BY_TYPE.scout.find((c) => c.startsWith('EVERY STORY CONSIDERED AND DECLINED'));
  assert.ok(dropCheck, 'the scout brief has no drop-record acceptance check');
  assert.ok(
    /WHICH CRITERION \(F1-F5\)/.test(dropCheck),
    'the frontier half of the drop-record rule lives outside the drop-record check, where it reads as conditional',
  );
});

test('11 the post brief carries the three keys and their gate', (t) => {
  const text = brief(t, 'post');
  carries(
    text,
    [
      '`frontier: true` (optional; absent means false)',
      'REQUIRED when `frontier: true`',
      '`domains` (OPTIONAL, flagged or not',
      '`text` is not a value',
      'it does not fail an absent `domains`',
    ],
    '11 keys',
  );
  for (const c of FRONTIER_CRITERIA) assert.ok(text.includes(c.text), `post brief omits ${c.id}`);
  for (const d of DOMAINS) assert.ok(text.includes(d), `the post brief omits the domain ${d}`);
});

test('11 the post brief carries BOTH F2 lists, in full, and why both are there', (t) => {
  // The load-bearing one. A brief carrying only the permitted list re-teaches
  // the field-name-is-not-a-source-test lesson at full price: it reads as
  // complete, and the author fills the gap with the numbers that describe the
  // rescoring, which republishes an index value with nobody having decided to.
  const text = brief(t, 'post');
  carries(
    text,
    [
      // permitted, all six, verbatim from the blog delta
      'the publisher; the index name and its version; the date; the direction of the rescoring; '
        + 'the coverage change, as a count of rows scored before and after; the fact that a '
        + 'non-uniform rescoring can invert orderings',
      // forbidden, all four
      'any index value, any ratio, any rank, any per-model score',
      'A median is a value however it is aggregated; a leaderboard position is a rank',
      'they belong in the review record, where a reviewer can check your work',
      'BY ACCIDENT',
      "anchors on the PUBLISHER'S OWN changelog",
    ],
    '11 F2 lists',
  );
  assert.match(text, /both lists below are normative — neither may be dropped as redundant/);
});

test('11 the post brief says tagging a reviewed post is a review event, not a correction', (t) => {
  carries(
    brief(t, 'post'),
    [
      'THE THREE FRONTIER KEYS ARE EDITORIAL, NOT MECHANICAL',
      'report `mismatched`',
      'REVIEW EVENT, not a correction to route around',
      'Do not exempt the keys',
    ],
    '11 review event',
  );
});

// ---------------------------------------------------------------------------
// The silent fallback, made loud
// ---------------------------------------------------------------------------

test('a job type with no acceptance checks fails loudly instead of shipping an empty bar', () => {
  // This was `ACCEPTANCE_BY_TYPE[job.type] ?? []`, and an unfilled type
  // assembled a brief whose only acceptance line was the generic "the outcome
  // above is achieved". `scout` sat in that window: it reached JOB_TYPES before
  // it reached this table. Nothing anywhere reported it.
  assert.throws(
    () => acceptanceChecksFor('nonesuch'),
    (e) => /no acceptance checks for job type "nonesuch"/.test(e.message),
    'an unknown type must name itself in the error',
  );
  assert.throws(() => acceptanceChecksFor(undefined), /no acceptance checks/);
  assert.ok(acceptanceChecksFor('scout').length > 0, 'and a filled type still returns its checks');
});

test('the throw happens at brief assembly, before any branch or worktree exists', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup?.());
  assert.throws(
    () =>
      assembleBrief(ctx, {
        jobId: 'j-20260830-02',
        job: { type: 'nonesuch', source: 'queue', title: 't', detail: 'd' },
        branch: 'job/j-20260830-02',
        capMinutes: 60,
      }),
    /loop\/lib\/brief\.mjs: no acceptance checks for job type "nonesuch"/,
  );
});

test('every job type in the closed list has non-empty acceptance checks', () => {
  // The cheap check that would have caught the scout gap the day it opened,
  // rather than on the first scout run.
  const missing = JOB_TYPES.filter(
    (t) => !Array.isArray(ACCEPTANCE_BY_TYPE[t]) || ACCEPTANCE_BY_TYPE[t].length === 0,
  );
  assert.deepEqual(missing, [], `job types in JOB_TYPES with no acceptance checks: ${missing.join(', ')}`);

  const extra = Object.keys(ACCEPTANCE_BY_TYPE).filter((t) => !JOB_TYPES.includes(t));
  assert.deepEqual(extra, [], `acceptance checks for types that are not jobs: ${extra.join(', ')}`);
});
