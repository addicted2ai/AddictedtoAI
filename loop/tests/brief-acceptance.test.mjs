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
 * That is deliberate and load-bearing. The excerpt machinery
 * (`loop/lib/specs.mjs`) reads `openspec/specs/<cap>/spec.md`, which carries a
 * capability's text only AFTER its change is archived — so today, before this
 * change archives, a scout brief assembled in the working repository quotes the
 * pre-change `specs/loop`, which never mentions a scout. Asserting against a
 * spec-less fixture measures the property that matters either way: the
 * acceptance checks carry the whole bar on their own, and a brief that leans on
 * an excerpt to state its rules is a brief that stated them nowhere the day the
 * excerpt changes.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { assembleBrief, ACCEPTANCE_BY_TYPE, acceptanceChecksFor, proposalRule } from '../lib/brief.mjs';
import { JOB_TYPES } from '../lib/config.mjs';
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
      'AT MOST THREE',
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
