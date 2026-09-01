/**
 * A JOB'S TOTAL SPEND IS BOUNDED (beads addictedtoai-o5t).
 *
 * The defect: `job_caps_minutes` gives one wall-clock cap per job type and the
 * loop handed it unchanged to every invocation — author, review 1, revision,
 * review 2 — so a job's entitlement was FOUR caps and nothing added them up.
 *
 * These tests measure the guardrail rather than describing it, and they measure
 * it in BOTH directions, because a bound that stops everything passes the first
 * half and fails the point:
 *
 *   - a job past its total is stopped, at each of the three places it can be
 *     stopped (resumption, the review, the revision);
 *   - a job under its total runs all four invocations with every cap untouched.
 *
 * THE ANCHOR IS A REAL JOB. `j-20260831-08` is on `data/ledger.jsonl`: a `post`
 * that spent 54.55 model-minutes across author 32.55, review1 5.54, revision
 * 12.03, review2 4.44. Its phases are reproduced verbatim below. Against the
 * live 120-minute cap that job sits well inside the new bound and would not have
 * been touched — which is the honest reach of this change, and is asserted as
 * such. It binds against the cheap-tier cap of 30 that `data/README.md` records
 * as the specification's default for the tier `j-20260831-08` actually ran on.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { runLoop } from '../run.mjs';
import { readLedger, jobSpendSoFar } from '../lib/ledger.mjs';
import {
  invocationAllowance,
  jobTotalMinutes,
  minInvocationMinutes,
} from '../lib/budget.mjs';
import {
  JOB_TOTAL_CAP_MULTIPLIER,
  MIN_INVOCATION_MINUTES,
  FAILURE_OUTCOMES,
  OUTCOMES,
} from '../lib/config.mjs';
import {
  DEFAULT_CONFIG,
  makeRepo,
  writeLedger,
  ledgerLine,
  writeQueue,
  plantJobBranch,
  mockCommand,
  runnersYaml,
  daysAgo,
} from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');

/** The four phases of j-20260831-08, copied from `data/ledger.jsonl`. */
const REAL_PHASES = [
  { role: 'author', runner: 'mock-frontier', mm: 32.55, killed: false, code: 0, outcome: 'done' },
  { role: 'review1', runner: 'mock-reviewer', mm: 5.54, killed: false, code: 0, outcome: 'revise' },
  { role: 'revision', runner: 'mock-frontier', mm: 12.03, killed: false, code: 0, outcome: 'unclassified' },
  { role: 'review2', runner: 'mock-reviewer', mm: 4.44, killed: false, code: 0, outcome: 'approve' },
];
const REAL_TOTAL_MM = 54.55;

/** A config whose `post` cap is `capMinutes`; everything else mirrors the fixture. */
function configWithPostCap(capMinutes) {
  return {
    ...DEFAULT_CONFIG,
    job_caps_minutes: { ...DEFAULT_CONFIG.job_caps_minutes, post: capMinutes },
  };
}

/* ===========================================================================
 * 1. The arithmetic, on its own.
 * ======================================================================== */

test('o5t the total budget is the per-type cap times the multiplier, for every type', () => {
  for (const [type, cap] of Object.entries(DEFAULT_CONFIG.job_caps_minutes)) {
    assert.equal(jobTotalMinutes(DEFAULT_CONFIG, type), cap * JOB_TOTAL_CAP_MULTIPLIER, type);
  }
  // The multiplier is pinned on both sides, and the bound is worthless outside
  // them: at or below 1 an author using its whole runaway guard leaves nothing
  // for the review that must happen before anything merges; at or above 4 it
  // bounds nothing, because four full caps is exactly what was already possible.
  assert.ok(JOB_TOTAL_CAP_MULTIPLIER > 1, 'a bound at or below one cap forbids the author its guard');
  assert.ok(JOB_TOTAL_CAP_MULTIPLIER < 4, 'a bound at four caps is the unbounded case with a name');
  // An unknown type has no cap and therefore no bound — invented rather than
  // absent would be the worse answer.
  assert.equal(jobTotalMinutes(DEFAULT_CONFIG, 'not-a-type'), null);
});

test('o5t the per-invocation cap is an upper bound this only ever tightens', () => {
  const cfg = configWithPostCap(30);
  // Nothing spent: the runaway guard binds, unchanged, and the derived flag says
  // so. This is the claim that the fix ADDS a bound rather than replacing one.
  const fresh = invocationAllowance(cfg, { type: 'post', spentMm: 0 });
  assert.equal(fresh.ok, true);
  assert.equal(fresh.capMinutes, 30, 'the per-invocation cap, untouched');
  assert.equal(fresh.derived, false, 'the job remainder did not set this cap');
  assert.equal(fresh.total_minutes, 60);
  assert.equal(fresh.remaining_minutes, 60);

  // Half spent: the remainder is still larger than the cap, so the cap still
  // binds. An allowance that grew to fill the remainder would have destroyed the
  // runaway guard while claiming to add a budget.
  const half = invocationAllowance(cfg, { type: 'post', spentMm: 25 });
  assert.equal(half.capMinutes, 30, 'never above the per-invocation cap');
  assert.equal(half.derived, false);

  // Past the cap: now the remainder is what binds, and it says so.
  const late = invocationAllowance(cfg, { type: 'post', spentMm: 40 });
  assert.equal(late.ok, true);
  assert.equal(late.capMinutes, 20, 'min(cap, remainder)');
  assert.equal(late.derived, true);
});

test('o5t an invocation is refused below the minimum length, with the arithmetic stated', () => {
  const cfg = configWithPostCap(30); // total 60, floor 15
  const floor = minInvocationMinutes(cfg, 'post');
  assert.equal(floor, MIN_INVOCATION_MINUTES);

  // Exactly at the floor is allowed: the comparison is `remaining < floor`, and
  // an allowance equal to the floor is by construction long enough.
  const atFloor = invocationAllowance(cfg, { type: 'post', spentMm: 60 - floor });
  assert.equal(atFloor.ok, true);
  assert.equal(atFloor.capMinutes, floor);

  const under = invocationAllowance(cfg, { type: 'post', spentMm: 60 - floor + 0.01, role: 'review pass 2' });
  assert.equal(under.ok, false);
  assert.equal(under.rule, 'job:total-budget');
  // A refusal that printed only "over budget" would be the percentage-without-a-
  // denominator defect this repository already fixed once for the selector.
  assert.match(under.reason, /spent 45\.01 of its 60-minute total budget/);
  assert.match(under.reason, /30-minute per-invocation cap × 2/);
  assert.match(under.reason, /14\.99 minutes/);
  assert.match(under.reason, /below the 15-minute minimum/);
  assert.match(under.reason, /review pass 2 is not invoked/);
});

test('o5t the floor is clamped to the cap, so a short-capped type cannot deadlock', () => {
  // A type whose whole cap is below the floor would otherwise be refused its own
  // author run and never start at all. A bound that deadlocks a job type is
  // worse than no bound.
  const cfg = { ...DEFAULT_CONFIG, job_caps_minutes: { ...DEFAULT_CONFIG.job_caps_minutes, prune: 10 } };
  assert.equal(minInvocationMinutes(cfg, 'prune'), 10);
  const first = invocationAllowance(cfg, { type: 'prune', spentMm: 0 });
  assert.equal(first.ok, true);
  assert.equal(first.capMinutes, 10);
});

test('o5t `abandoned` is a real outcome and is not a failure outcome', () => {
  // The outcome vocabulary is a closed list, and this change deliberately
  // invents nothing. `abandoned` already means "given up on, not on its merits"
  // and is already excluded from breaker 1 — so a budget exhaustion cannot
  // disable a whole job type for a reason unrelated to that type's quality.
  assert.ok(OUTCOMES.includes('abandoned'));
  assert.ok(!FAILURE_OUTCOMES.includes('abandoned'));
});

/* ===========================================================================
 * 2. The real job, reconstructed.
 * ======================================================================== */

test('o5t j-20260831-08: its four recorded phases sum to the job total the ledger carries', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeLedger(ctx, [
    ledgerLine({
      id: 'j-20260831-08',
      type: 'post',
      tier: 'cheap',
      mm: REAL_TOTAL_MM,
      outcome: 'interrupted',
      phases: REAL_PHASES,
      ts: daysAgo(NOW, 1),
    }),
  ]);
  const spend = jobSpendSoFar(readLedger(ctx), 'j-20260831-08');
  assert.equal(spend.mm, REAL_TOTAL_MM, 'the ledger `mm` is the job total, and this is it');
  assert.equal(spend.invocations, 4, 'four invocations, from the phases array');
  // And the phases really do add up. Each phase and the total are rounded to 2dp
  // independently by the loop, so four phases can drift from the total by at
  // most 4 × 0.005 plus the total's own 0.005 — and on this real line they do,
  // by exactly 0.01 (32.55 + 5.54 + 12.03 + 4.44 = 54.56 against a recorded
  // 54.55). The tolerance is the same one review.test.mjs uses for the same
  // reason; asserting equality here would be asserting that rounding does not
  // happen.
  const phaseSum = REAL_PHASES.reduce((s, p) => s + p.mm, 0);
  assert.ok(
    Math.abs(phaseSum - REAL_TOTAL_MM) <= 0.025,
    `${phaseSum} vs ${REAL_TOTAL_MM} — the fixture is the measurement, not a retelling`,
  );
  ctx.cleanup();
});

test('o5t the real job would NOT have been stopped by this bound at the live cap — stated, not hidden', () => {
  // The honest reach of the change. At the live 120-minute `post` cap the total
  // budget is 240 minutes and j-20260831-08's 54.55 is nowhere near it. What the
  // bound does is halve an unbounded worst case (480 → 240); what it does not do
  // is tighten anything this Desk has actually spent. A test that only showed the
  // binding case would leave a reader believing the opposite.
  const live = configWithPostCap(120);
  const allow = invocationAllowance(live, { type: 'post', spentMm: REAL_TOTAL_MM });
  assert.equal(allow.ok, true);
  assert.equal(allow.total_minutes, 240);
  assert.equal(allow.capMinutes, 120, 'a fifth invocation would still get the full guard');

  // Against the cheap-tier cap of 30 that `data/README.md` records as the
  // specification's default for the tier this job ran on, the same 54.55 has
  // 5.45 minutes left and the next invocation is refused.
  const cheap = configWithPostCap(30);
  const refused = invocationAllowance(cheap, { type: 'post', spentMm: REAL_TOTAL_MM });
  assert.equal(refused.ok, false);
  assert.equal(refused.remaining_minutes, 5.45);
});

/* ===========================================================================
 * 3. THE MAIN EVENT — a resumed job inherits its accumulated spend.
 * ======================================================================== */

test('o5t a resumed job past its total is abandoned, not handed a fresh allowance', async () => {
  const ctx = makeRepo({
    now: () => NOW,
    config: configWithPostCap(30), // total 60; the real job's 54.55 leaves 5.45
    runners: runnersYaml({ command: mockCommand('done-edit'), reviewerCommand: mockCommand('review-approve') }),
  });
  plantJobBranch(ctx, 'j-20260831-08', { brief: '# Job j-20260831-08\n\nFinish the post.\n' });
  writeLedger(ctx, [
    ledgerLine({
      id: 'j-20260831-08',
      type: 'post',
      tier: 'frontier',
      mm: REAL_TOTAL_MM,
      outcome: 'interrupted',
      phases: REAL_PHASES,
      ts: daysAgo(NOW, 1),
    }),
  ]);
  writeQueue(ctx, []); // nothing else to do, so resumption is the only candidate

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

  // It was NOT resumed. This is the whole claim: the branch is resumable by its
  // ledger line, the brief is committed, and the loop still refused it.
  assert.notEqual(res.jobId, 'j-20260831-08', ctx.output());
  assert.equal(res.nothingQualified, true, ctx.output());

  const abandoned = readLedger(ctx).filter((l) => l.outcome === 'abandoned');
  assert.equal(abandoned.length, 1, ctx.output());
  assert.equal(abandoned[0].id, 'j-20260831-08');
  assert.equal(abandoned[0].type, 'post');
  assert.equal(abandoned[0].mm, 0, 'the spend is already on the line this was computed from');
  assert.match(abandoned[0].note, /spent 54\.55 of its 60-minute total budget/);

  // And the run said where the number came from, rather than merely refusing.
  assert.match(ctx.output(), /abandoning job\/j-20260831-08/);
  assert.match(ctx.output(), /sum of 4 recorded invocation\(s\)/);
  assert.match(ctx.output(), /it does not\s+start again at zero/);
  ctx.cleanup();
});

test('o5t an abandoned branch is not resumable, so the sweep cannot spin', async () => {
  // The failure mode a careless fix walks into: stop the job with an outcome
  // that leaves the branch resumable, and every subsequent run resumes it and
  // stops it again, forever. `abandoned` is not in the resumable set, and this
  // measures that by running the loop a second time.
  const ctx = makeRepo({
    now: () => NOW,
    config: configWithPostCap(30),
    runners: runnersYaml({ command: mockCommand('done-edit'), reviewerCommand: mockCommand('review-approve') }),
  });
  plantJobBranch(ctx, 'j-20260831-08');
  writeLedger(ctx, [
    ledgerLine({ id: 'j-20260831-08', type: 'post', mm: REAL_TOTAL_MM, outcome: 'interrupted', phases: REAL_PHASES, ts: daysAgo(NOW, 1) }),
  ]);
  writeQueue(ctx, []);

  await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

  const abandoned = readLedger(ctx).filter((l) => l.outcome === 'abandoned');
  assert.equal(abandoned.length, 1, `the sweep fires once per branch, ever: ${JSON.stringify(abandoned)}`);
  ctx.cleanup();
});

test('o5t a resumed job UNDER its total is resumed, and its brief prints the remainder', async () => {
  // The other direction, at the sharpest point. Same branch, same ledger shape,
  // a cap that leaves room: the job must resume normally, and the cap its brief
  // prints must be the one the invocation would really get.
  const ctx = makeRepo({
    now: () => NOW,
    config: configWithPostCap(35), // total 70; 54.55 spent leaves 15.45, over the 15 floor
    runners: runnersYaml({ command: mockCommand('done-edit') }),
  });
  plantJobBranch(ctx, 'j-20260831-08', { brief: '# Job j-20260831-08\n\nFinish the post.\n' });
  writeLedger(ctx, [
    ledgerLine({ id: 'j-20260831-08', type: 'post', mm: REAL_TOTAL_MM, outcome: 'interrupted', phases: REAL_PHASES, ts: daysAgo(NOW, 1) }),
  ]);
  writeQueue(ctx, [{ type: 'entry', title: 'brand new work that must still lose to resumption' }]);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', dryRun: true, noGates: true });
  assert.equal(res.resumed, true, ctx.output());
  assert.equal(res.jobId, 'j-20260831-08');
  assert.equal(readLedger(ctx).filter((l) => l.outcome === 'abandoned').length, 0, ctx.output());

  // 15.45 remaining, below the 35-minute per-invocation cap — so the brief must
  // print 15.45, not 35. A brief that printed the raw per-type cap here would be
  // restating the exact falsehood this issue is about.
  assert.match(res.briefText, /\*\*Wall-clock cap for THIS invocation\*\*: 15\.45 minutes/, res.briefText);
  assert.match(res.briefText, /\*\*Total budget for THIS JOB\*\*: 70 minutes/);
  assert.match(res.briefText, /\*\*15\.45 remain\*\*/);
  // The spend the ledger records, not a default. This assertion found a real
  // defect: `jobSpendSoFar` returns `{mm, invocations}` and the accounting reads
  // `mmSoFar`, so the spread that used to be here set the count and left the
  // spend at 0 — every resumed brief said "0.00 model-minutes across 4 completed
  // invocations".
  assert.match(res.briefText, /\*\*Spent on this job so far\*\*: 54\.55 model-minutes across 4/);
  ctx.cleanup();
});

/* ===========================================================================
 * 4. Within one run: the bound stops the NEXT invocation.
 * ======================================================================== */

test('o5t the review is not invoked once the job has spent its total', async () => {
  // The author is allowed exactly the floor (spent = total − floor), runs, and
  // costs a real, positive number of model-minutes. That is enough to put the
  // remainder under the floor, and the review must then not be invoked at all.
  const cfg = configWithPostCap(30); // total 60, floor 15
  const ctx = makeRepo({
    now: () => NOW,
    config: cfg,
    runners: runnersYaml({ command: mockCommand('done-edit'), reviewerCommand: mockCommand('review-approve') }),
  });
  plantJobBranch(ctx, 'j-20260831-09', { brief: '# Job j-20260831-09\n\nFinish the post.\n' });
  writeLedger(ctx, [
    ledgerLine({ id: 'j-20260831-09', type: 'post', mm: 45, outcome: 'interrupted', ts: daysAgo(NOW, 1) }),
  ]);
  writeQueue(ctx, []);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  assert.equal(res.jobId, 'j-20260831-09', ctx.output());
  assert.equal(res.outcome, 'abandoned', ctx.output());

  // The author ran under the DERIVED cap, and the log says which number bound it.
  assert.match(ctx.output(), /under a 15-minute cap \(the per-invocation cap is 30 minutes/, ctx.output());

  // The reviewer was never invoked: no brief was written for it. This is the
  // measurement rather than the intention — a run that merely logged a refusal
  // and then reviewed anyway would pass a weaker assertion.
  assert.ok(
    !existsSync(join(ctx.worktreeRoot, `${res.jobId}-review-1-brief.md`)),
    'a reviewer brief exists, so the review was invoked despite the refusal',
  );
  assert.match(ctx.output(), /BUDGET: this post job has spent/);
  assert.match(ctx.output(), /nothing merges without a review/);

  const line = readLedger(ctx).at(-1);
  assert.equal(line.id, 'j-20260831-09');
  assert.equal(line.outcome, 'abandoned');
  assert.equal(line.phases.length, 1, 'one invocation happened, and exactly one is recorded');
  assert.equal(line.phases[0].role, 'author');
  // The author run it DID make is charged to the job. Asserted as an identity
  // rather than `mm > 0`: the mock returns in a fraction of a second, so the
  // job total legitimately rounds to 0.00 and a `> 0` assertion would be
  // measuring the fixture's speed rather than the loop's accounting.
  assert.equal(line.mm, line.phases[0].mm, 'the job total is the one invocation that ran');
  assert.ok(!existsSync(join(ctx.repoRoot, 'site-note.md')), 'nothing merged');
  ctx.cleanup();
});

test('o5t the revision is not invoked once the job has spent its total', async () => {
  // THE THIRD PLACE THE BOUND CAN BIND, and the only one a sub-second mock
  // cannot reach: it lies BETWEEN two invocations, so the fixture has to make
  // each invocation cost a known amount rather than an unmeasurable one.
  //
  // The arithmetic. `jobTotalMinutes` is cap × 2 and the floor is clamped to
  // the cap, so with a cap of C the whole shape is fixed: the author always
  // runs, review 1 runs iff its cost ≤ C, and the revision is refused iff the
  // two costs together exceed C. The window is therefore cost ∈ (C/2, C] — a
  // RATIO, which no choice of numbers can widen. Robustness has to come from
  // SCALE instead, and the scale here is chosen from a measured failure.
  //
  // An `entry` cap of 0.5 minutes is a 30-second per-invocation guard, a
  // 1.0-minute (60-second) job total, and a 30-second minimum invocation.
  // Author and reviewer each sleep 21 seconds:
  //   before the author   60.0s left ≥ 30s → runs, and is not killed
  //   before review 1    ~39.0s left ≥ 30s → runs, returns `revise`
  //   before the revision ~18.0s left < 30s → REFUSED
  //
  // WHY THESE NUMBERS AND NOT THE ORIGINAL 9s/18s/6s (addictedtoai-sfny). The
  // fixture spawns REAL subprocesses, so each invocation costs its sleep plus
  // process spawn and teardown. The original left only 9 − 6 = 3 SECONDS for
  // that overhead, and on 2026-08-31 it ran out: Desk job j-20260831-14 was
  // recorded `failed` with "gates failed" after 9.44 model-minutes of perfectly
  // good work, on this single assertion, which then passed 14/14 when re-run
  // alone minutes later. The author had cost more than the 30% of headroom the
  // fixture assumed, so review 1 fell below the floor too and the phases read
  // ['author'] instead of ['author', 'review1'].
  //
  // 21s against a 30s cap leaves 9 SECONDS of overhead allowance (3x the old
  // margin) and 6 seconds above the C/2 floor. The cost is a slower test —
  // roughly 44s rather than 14s — and that trade is deliberate: `npm test` is a
  // MERGE GATE, so a fixture that fails on scheduling jitter fails whatever job
  // is running, and three consecutive same-type failures trip a breaker and
  // write HOLD.md, halting the Desk until a human clears it. Thirty seconds per
  // gate run is cheaper than one false halt.
  //
  // This is the only fixture in the repository that uses real wall-clock sleeps
  // (grepped for `--sleep-ms`), so the class is contained to this one test.
  const cfg = {
    ...DEFAULT_CONFIG,
    job_caps_minutes: { ...DEFAULT_CONFIG.job_caps_minutes, entry: 0.5 },
  };
  const ctx = makeRepo({
    now: () => NOW,
    config: cfg,
    runners: runnersYaml({
      command: mockCommand('done-content-entry', ' --sleep-ms 21000'),
      reviewerCommand: mockCommand('review-revise-then-approve', ' --sleep-ms 21000'),
    }),
  });
  writeQueue(ctx, [{ type: 'entry', title: 'write the entry for the fixture subject' }]);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  const line = readLedger(ctx).at(-1);

  // If either invocation were killed at its cap the fixture's arithmetic has
  // drifted, and the failure below would be about timing rather than about the
  // bound. Say which it is.
  for (const p of line.phases ?? []) {
    assert.equal(p.killed, false, `phase ${p.role} was killed at its cap — the fixture's margins have drifted, not the bound`);
  }

  assert.equal(res.outcome, 'abandoned', ctx.output());
  assert.deepEqual(
    line.phases.map((p) => p.role),
    ['author', 'review1'],
    'the author and one review ran; the revision did not',
  );
  assert.equal(line.phases[1].outcome, 'revise', 'and the review really did ask for one');

  // The measurement, not the log line: no revision brief was ever written.
  assert.ok(
    !existsSync(join(ctx.worktreeRoot, `${res.jobId}-revision-brief.md`)),
    'a revision brief exists, so the revision was invoked despite the refusal',
  );
  assert.match(ctx.output(), /BUDGET: this entry job has spent/);
  assert.match(ctx.output(), /the revision is not invoked/);
  // The findings survive the abandon: what the reviewer judged is not lost
  // because the budget ran out.
  assert.match(ctx.output(), /findings are kept at .*j-\d+-\d+\.md/);
  assert.ok(existsSync(join(ctx.reviewsDir, `${res.jobId}.md`)), 'and the record is really on disk');
  ctx.cleanup();
});

/* ===========================================================================
 * 5. THE OTHER DIRECTION — a job under its bound is untouched.
 * ======================================================================== */

test('o5t a job inside its budget runs all four invocations with every cap untouched', async () => {
  // The test that keeps the bound honest. `review-revise-then-approve` is the
  // only mock shape that drives author → review 1 → revision → review 2, which
  // is the exact shape the defect was about. Nothing here may be shortened,
  // refused or re-capped.
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({
      command: mockCommand('done-content-entry'),
      reviewerCommand: mockCommand('review-revise-then-approve'),
    }),
  });
  writeQueue(ctx, [{ type: 'entry', title: 'write the entry for the fixture subject' }]);

  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  assert.equal(res.outcome, 'done', ctx.output());

  const line = readLedger(ctx).at(-1);
  assert.deepEqual(
    line.phases.map((p) => p.role),
    ['author', 'review1', 'revision', 'review2'],
    'all four invocations really happened',
  );
  assert.ok(line.mm < jobTotalMinutes(DEFAULT_CONFIG, 'entry'), 'and the job stayed inside its budget');

  // Every invocation got the FULL 60-minute cap: the entry cap in the fixture
  // config, not a share of a remainder. If the bound were tightening anything
  // here, one of these would be a smaller number.
  const capLines = ctx.output().split('\n').filter((l) => /under a [\d.]+-minute cap/.test(l));
  assert.equal(
    capLines.length,
    4,
    `all four invocations log the cap they ran under: ${capLines.join(' | ')}`,
  );
  for (const l of capLines) {
    assert.match(l, /under a 60-minute cap/, l);
    assert.ok(!/the per-invocation cap is/.test(l), `a derived cap where none should be: ${l}`);
  }

  // And the brief the last reviewer actually read says the same.
  const pass2 = readFileSync(join(ctx.worktreeRoot, `${res.jobId}-review-2-brief.md`), 'utf8');
  assert.match(pass2, /per-invocation wall-clock cap of\n60 minutes/);
  assert.match(pass2, /budget of 120 minutes, of which\n1\d\d\.\d\d are left/, pass2);

  assert.equal(readLedger(ctx).filter((l) => l.outcome === 'abandoned').length, 0, 'nothing was abandoned');
  ctx.cleanup();
});

test('o5t a one-invocation job is not touched either', async () => {
  // The cheapest shape there is: a well-formed `blocked:` ends the job after the
  // author run. A bound that fired here would be refusing work it never priced.
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: mockCommand('blocked'), reviewerCommand: mockCommand('review-approve') }),
  });
  writeQueue(ctx, [{ type: 'entry', title: 'write the entry for the fixture subject' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  assert.equal(res.outcome, 'blocked', ctx.output());
  assert.match(ctx.output(), /under a 60-minute cap$/m);
  ctx.cleanup();
});
