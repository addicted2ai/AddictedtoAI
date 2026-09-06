/**
 * Task 7.4 — the review step.
 *
 * The three checks that carry the weight here are mechanisms, not manners:
 * an `approve` with a blank `would-cite` is refused, an `approve` recycling
 * another record's sentence is refused, and a reviewer that edits the tree has
 * its edits thrown away. Each is tested by ATTEMPTING what it forbids and
 * observing the result, which is the same standard specs/review holds a
 * machinery reviewer to.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

import { runLoop } from '../run.mjs';
import { readLedger } from '../lib/ledger.mjs';
import { loadConfig } from '../lib/config.mjs';
import { tierShares } from '../lib/budget.mjs';
import {
  assembleReviewBrief,
  gatesSection,
  joinableSubjects,
  mergeGate,
  parseVerdict,
  verdictPath,
  writeRecordSubjects,
  writeVerdictRecord,
  REASONS,
} from '../lib/review.mjs';
// The site-side join, imported deliberately: what the loop writes has to be
// what the build reads, and asserting that here is the only place the two ends
// meet (beads addictedtoai-sge).
import { subjectsOf } from '../../lib/reviews.mjs';
import { reviewedHashOfFile } from '../../lib/review-hash.mjs';
import { makeRepo, writeQueue, mockCommand, runnersYaml, git, daysAgo } from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');

function repo(authorMode, reviewerMode, opts = {}) {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: mockCommand(authorMode), reviewerCommand: mockCommand(reviewerMode) }),
    ...opts,
  });
  writeQueue(ctx, opts.queue ?? [{ type: 'entry', title: 'write the entry for the fixture subject' }]);
  return ctx;
}

const go = (ctx, o = {}) =>
  runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true, ...o });

test('merge refuses without any recorded verdict — nothing model-written merges unreviewed', async () => {
  const ctx = repo('done-edit', 'review-nothing');
  const res = await go(ctx);
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.match(ctx.output(), /no reviewer verdict recorded/);
  assert.ok(!existsSync(join(ctx.repoRoot, 'site-note.md')), 'and nothing merged');
  ctx.cleanup();
});

test('an `approve` with a blank would-cite is refused at merge', async () => {
  const ctx = repo('done-edit', 'review-approve-blank-cite');
  const res = await go(ctx);
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.match(ctx.output(), /would-cite-empty/);
  assert.match(ctx.output(), /who would link this, and in what argument/);
  assert.ok(!existsSync(join(ctx.repoRoot, 'site-note.md')));
  ctx.cleanup();
});

test('an `approve` whose would-cite exactly duplicates an existing record is refused at merge', async () => {
  const ctx = repo('done-edit', 'review-approve-duplicate-cite');
  mkdirSync(ctx.reviewsDir, { recursive: true });
  writeFileSync(
    join(ctx.reviewsDir, 'seed-something-else.md'),
    '---\nverdict: approve\nwould-cite: "  A recycled sentence that already appears in another record.  "\n---\n',
    'utf8',
  );
  const res = await go(ctx);
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.match(ctx.output(), /would-cite-duplicate/);
  assert.match(ctx.output(), /seed-something-else\.md/);
  ctx.cleanup();
});

test('the duplicate check trims whitespace and ignores line endings', () => {
  const ctx = makeRepo({ now: () => NOW });
  mkdirSync(ctx.reviewsDir, { recursive: true });
  writeFileSync(
    join(ctx.reviewsDir, 'seed-a.md'),
    '---\nverdict: approve\nwould-cite: "Someone arguing about dated deltas."\n---\n',
    'utf8',
  );
  writeVerdictRecord(ctx, 'j-1', {
    verdict: 'approve',
    wouldCite: '\r\n  Someone arguing about dated deltas.  \n',
  });
  const g = mergeGate(ctx, { jobId: 'j-1', type: 'post' });
  assert.equal(g.ok, false);
  assert.equal(g.code, 'would-cite-duplicate');
  ctx.cleanup();
});

test('a planted unsupported claim is rejected, and a second failure discards the job with the record kept', async () => {
  const ctx = repo('done-edit', 'review-reject');
  const res = await go(ctx);
  assert.equal(res.outcome, 'discarded', ctx.output());
  assert.match(ctx.output(), /false-or-unsupported-claim/);
  assert.match(ctx.output(), /one revision pass against the named findings/);
  assert.match(ctx.output(), /a second non-approval discards the job/);
  // the record of the reasons is kept
  assert.ok(existsSync(verdictPath(ctx, res.jobId, 1)));
  assert.ok(existsSync(verdictPath(ctx, res.jobId, 2)), 'the delta review record is kept too');
  const kept = readFileSync(verdictPath(ctx, res.jobId, 2), 'utf8');
  assert.match(kept, /false-or-unsupported-claim/);
  // and the ledger records it as a failure that counts toward breaker 1
  assert.equal(readLedger(ctx).at(-1).outcome, 'discarded');
  assert.ok(!existsSync(join(ctx.repoRoot, 'site-note.md')), 'nothing merged');
  ctx.cleanup();
});

test('a reviewer that edits the reviewed tree has its edits discarded', async () => {
  const ctx = repo('done-edit', 'review-edits-tree');
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  assert.match(ctx.output(), /the reviewer changed its worktree; those changes were discarded \(branch unchanged\)/);
  // the merged tree carries the author's file and none of the reviewer's
  assert.ok(existsSync(join(ctx.repoRoot, 'site-note.md')));
  assert.ok(!existsSync(join(ctx.repoRoot, 'reviewer-was-here.txt')), "the reviewer's file never merged");
  assert.match(readFileSync(join(ctx.repoRoot, 'site-note.md'), 'utf8'), /Written by the mock author/);
  // nothing the reviewer touched is left anywhere in the working tree
  const status = git(ctx.repoRoot, ['status', '--porcelain']);
  assert.ok(!/reviewer-was-here/.test(status), status);
  // and the loop committed its own records rather than leaving them loose
  assert.match(git(ctx.repoRoot, ['log', '--oneline', '-3']), /records \(done\)/);
  ctx.cleanup();
});

test("a proposal-originated job's reviewer brief carries the rejection index", async () => {
  const ctx = repo('done-edit', 'review-approve', { queue: [] });
  mkdirSync(ctx.rejectedDir, { recursive: true });
  writeFileSync(
    join(ctx.rejectedDir, 'weekly-model-roundup.md'),
    '---\nslug: weekly-model-roundup\nrejection_reason: a roundup nobody would cite; not-worth-reading\n---\n',
    'utf8',
  );
  mkdirSync(ctx.proposalsDir, { recursive: true });
  const p = join(ctx.proposalsDir, 'dated-delta-piece.md');
  writeFileSync(
    p,
    '---\nslug: dated-delta-piece\ntype: post\ndate: 2026-09-01\nsummary: a dated-delta piece with receipts\n---\n\nEvidence here.\n',
    'utf8',
  );
  const { utimesSync } = await import('node:fs');
  const old = new Date(NOW.getTime() - 5 * 24 * 3600 * 1000);
  utimesSync(p, old, old);

  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  const briefPath = join(ctx.worktreeRoot, `${res.jobId}-review-1-brief.md`);
  const brief = readFileSync(briefPath, 'utf8');
  assert.match(brief, /## The rejection index/);
  assert.match(brief, /weekly-model-roundup/);
  assert.match(brief, /a roundup nobody would cite/);
  assert.match(brief, /Fuzzy matching is guessing/);
  ctx.cleanup();
});

test('the reviewer brief carries the closed reason list, the checklist, and no author reasoning', () => {
  const ctx = makeRepo({ now: () => NOW });
  const brief = assembleReviewBrief(ctx, {
    jobId: 'j-20260910-01',
    job: { type: 'machinery', source: 'queue', title: 'tighten a check' },
    diffText: '--- a/x\n+++ b/x\n+changed\n',
    pass: 1,
    findings: '',
    outPath: verdictPath(ctx, 'j-20260910-01'),
  });
  for (const r of REASONS) assert.match(brief, new RegExp(r.replace(/-/g, '\\-')));
  assert.match(brief, /Run the changed check or script and confirm the claimed behaviour/);
  assert.match(brief, /Guard rails are tested by attempting what they forbid/);
  assert.match(brief, /you have not seen the author's\s+reasoning/);
  assert.match(brief, /no edit rights/);
  assert.match(brief, /outside\*\* the worktree you are reviewing/);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// What the reviewer is told it need not repeat (beads addictedtoai-5z9).
//
// On job j-20260829-01 the loop's gates ran `npm test` and `npm run build` on
// the branch and both passed; the reviewer then re-ran the same suite at its own
// expense, formed its judgment ("everything else in the review is settled") and
// ended before recording it. The merge was refused for `no-record` — correctly,
// fail-closed — and 20.87 model-minutes were lost. Nothing in the brief told the
// reviewer what had already been verified, or that its run ends when it stops.
//
// The gates in the first test below are REAL: the fixture's package.json carries
// real `test` and `build` scripts and `runGates` really runs them. Stubbing the
// gate result would test the assertion against itself.
// ---------------------------------------------------------------------------

function repoWithRealGates(reviewerMode = 'review-approve') {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: mockCommand('done-edit'), reviewerCommand: mockCommand(reviewerMode) }),
    files: {
      'package.json':
        JSON.stringify(
          { name: 'fixture', private: true, scripts: { test: 'node --version', build: 'node --version' } },
          null,
          2,
        ) + '\n',
    },
  });
  writeQueue(ctx, [{ type: 'entry', title: 'write the entry for the fixture subject' }]);
  return ctx;
}

test('the review brief states which gates really ran on this branch, and on which commit', async () => {
  const ctx = repoWithRealGates();
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer' });
  assert.equal(res.outcome, 'done', ctx.output());

  const brief = readFileSync(join(ctx.worktreeRoot, `${res.jobId}-review-1-brief.md`), 'utf8');
  assert.match(brief, /## What the loop has already verified on this branch/);
  assert.match(brief, /`npm run test` — \*\*PASS\*\*/);
  assert.match(brief, /`npm run build` — \*\*PASS\*\*/);
  assert.match(brief, /on commit `[0-9a-f]{12}`/, 'which commit, not just "the branch"');
  assert.match(brief, /\*\*Do not re-run them\.\*\*/);
  assert.match(brief, /run\s+\*\*that\*\* check/);
  ctx.cleanup();
});

test('the review brief states the cap, the spend so far, and that the run ends when the reviewer stops', async () => {
  const ctx = repoWithRealGates();
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer' });
  const brief = readFileSync(join(ctx.worktreeRoot, `${res.jobId}-review-1-brief.md`), 'utf8');
  // The cap is stated per invocation and wraps across a line; matching it
  // whitespace-insensitively keeps this assertion about the wording rather than
  // about where the paragraph happens to break.
  assert.match(brief, /per-invocation wall-clock cap of\s+60 minutes/);
  assert.match(brief, /When you stop producing output, your run is over/);
  assert.match(brief, /never\s+end your turn intending to come back to it/);
  assert.match(brief, /Write the verdict record the moment your judgment is formed/);
  assert.match(brief, /This job has already cost \d+\.\d\d model-minutes/);
  ctx.cleanup();
});

/* ---------------------------------------------------------------------------
 * The cap is named for what it is (specs/loop delta, C45/C46/C47; beads
 * addictedtoai-o5t).
 *
 * GOLDEN LIST — the exact phrasings this change removed. They are asserted
 * absent, not merely "the new wording is present", because a brief that gained
 * the honest sentence AND kept the misleading one would satisfy every positive
 * assertion while still telling an executor it has a job budget it does not
 * have. Each pattern is written so the replacement cannot match it.
 * ------------------------------------------------------------------------ */
const BUDGET_IMPLYING_PHRASES = [
  // was: `- **Wall-clock cap**: 60 minutes.` in the author brief's facts list,
  // sitting beside the branch and the work source as though it scoped the job.
  { re: /\*\*Wall-clock cap\*\*:/, was: '- **Wall-clock cap**: N minutes.' },
  // was: `a single non-interactive run under a **wall-clock cap of 60 minutes**`
  // in the reviewer brief — true of the run, silent about the job.
  { re: /under a \*\*wall-clock cap of/, was: 'under a **wall-clock cap of N minutes**' },
  // The two sentences THIS list's own change added, removed in turn by
  // addictedtoai-o5t's bound. They were the honest reading while a job's total
  // was unbounded; a job's total is now bounded, and a brief that still said
  // "the cap does not bound it" would be telling an executor it has an
  // entitlement the loop will refuse it — the same defect class, inverted.
  {
    re: /the cap does not bound it/,
    was: "the job's total is the sum of them — the cap does not bound it",
  },
  {
    re: /each get the cap above, so the job's total is the sum/,
    was: 'each review pass each get the cap above, so the job\'s total is the sum of them',
  },
];

test('C45/C46/C47 the author brief states the cap per invocation, with the running total and count', async () => {
  const ctx = repoWithRealGates();
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', dryRun: true });
  assert.equal(res.dryRun, true, 'a dry run assembles the brief and invokes nothing');
  const brief = res.briefText;
  assert.ok(brief, ctx.output());

  // C45 — the cap is this invocation's limit, and says so.
  assert.match(brief, /\*\*Wall-clock cap for THIS invocation\*\*: 60 minutes/);
  assert.match(brief, /per-invocation runaway guard/);
  // C47 — and it explicitly is not the other thing.
  assert.match(brief, /\*\*not a budget for the job\*\*/);
  // C46 — the running total and the invocation count, both present, both numbers.
  assert.match(brief, /\*\*Spent on this job so far\*\*: 0\.00 model-minutes across 0\s+completed invocations/);
  // And the third number, which the cap and the running total together could
  // not supply: what the JOB may spend (beads addictedtoai-o5t). The fixture's
  // `entry` cap is 60, so the total is 120.
  assert.match(brief, /\*\*Total budget for THIS JOB\*\*: 120 minutes across every invocation/);
  assert.match(brief, /\*\*120\.00 remain\*\*/);
  assert.match(brief, /the loop starts no further invocation and records the job `abandoned`/);

  for (const { re, was } of BUDGET_IMPLYING_PHRASES) {
    assert.ok(!re.test(brief), `the author brief still carries the removed phrasing ${was}`);
  }
  ctx.cleanup();
});

test('C45/C46/C47 the reviewer brief does the same, with the spend the job has actually reached', async () => {
  const ctx = repoWithRealGates();
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer' });
  assert.equal(res.outcome, 'done', ctx.output());
  const brief = readFileSync(join(ctx.worktreeRoot, `${res.jobId}-review-1-brief.md`), 'utf8');

  assert.match(brief, /\*\*per-invocation wall-clock cap of\n60 minutes\*\* — the limit on THIS run, not a budget for the job/);
  assert.match(brief, /This job has already cost \d+\.\d\d model-minutes across 1 completed\ninvocation\b/);
  assert.match(brief, /has a budget of 120 minutes, of which\n\d+\.\d\d are left/);
  assert.match(brief, /the cap above is the smaller of the\nper-invocation guard and that remainder/);

  for (const { re, was } of BUDGET_IMPLYING_PHRASES) {
    assert.ok(!re.test(brief), `the reviewer brief still carries the removed phrasing ${was}`);
  }

  // The count is a measurement, not a constant: by the delta review of a revised
  // job, three invocations have run and the brief says three.
  const ctx2 = repo('done-content-entry', 'review-revise-then-approve');
  const res2 = await go(ctx2);
  assert.equal(res2.outcome, 'done', ctx2.output());
  const pass2 = readFileSync(join(ctx2.worktreeRoot, `${res2.jobId}-review-2-brief.md`), 'utf8');
  assert.match(pass2, /across 3 completed\ninvocations/, 'author + review 1 + revision');
  const line = readLedger(ctx2).at(-1);
  assert.equal(line.phases.length, 4, 'and the fourth is this very review');
  ctx2.cleanup();
  ctx.cleanup();
});

test('C46 the revision brief supersedes the stale figures it inherits', async () => {
  // The revision brief is the author brief plus the findings. The author brief
  // was assembled before anything ran, so on its own it would tell the third
  // invocation of a job that the job had spent nothing — the precise misreading
  // this requirement exists to end.
  const ctx = repo('done-content-entry', 'review-revise-then-approve');
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  const brief = readFileSync(join(ctx.worktreeRoot, `${res.jobId}-revision-brief.md`), 'utf8');

  assert.match(brief, /\*\*This job's accounting, as of now\*\*/);
  assert.match(brief, /these supersede the figures near the top/);
  assert.match(brief, /across 2\s+completed invocations/, 'the author run and the first review');
  // The stale block is still above it — that is what "supersede" means — so the
  // fresh one must not be the only thing asserted.
  assert.ok(brief.indexOf('as of now') > brief.indexOf('## The outcome'), 'the fresh accounting comes after the inherited brief body');
  for (const { re, was } of BUDGET_IMPLYING_PHRASES) {
    assert.ok(!re.test(brief), `the revision brief still carries the removed phrasing ${was}`);
  }
  ctx.cleanup();
});

test('a brief never claims a verification that did not happen', async () => {
  // The same plumbing, with the gates skipped. A brief that said "already
  // verified" here would be worse than one that said nothing at all.
  const ctx = repoWithRealGates();
  const res = await go(ctx); // noGates
  assert.equal(res.outcome, 'done', ctx.output());
  const brief = readFileSync(join(ctx.worktreeRoot, `${res.jobId}-review-1-brief.md`), 'utf8');
  assert.match(brief, /## What the loop has verified on this branch\n\n\*\*Nothing\.\*\*/);
  assert.match(brief, /no mechanical check has been run on this diff at all/);
  assert.ok(!/already verified/.test(brief));
  ctx.cleanup();
});

test('a failed gate is reported to the reviewer as failed, with its exit status', () => {
  const failing = gatesSection(
    { ran: true, ok: false, results: [{ script: 'test', ok: true, status: 0 }, { script: 'build', ok: false, status: 1 }] },
    'abcdef0123456789',
  );
  assert.match(failing, /`npm run test` — \*\*PASS\*\*/);
  assert.match(failing, /`npm run build` — \*\*FAIL \(exit 1\)\*\*/);
  assert.match(failing, /on commit `abcdef012345`/);
});

test('a reviewer told the gates passed is told when they passed on a SECOND run', () => {
  // The reviewer is the only judgment in the loop that could notice a real
  // intermittent defect the second gate run happened to miss, and since beads
  // addictedtoai-xzdd a retry fires on ANY failure — so a clean PASS in this
  // section can be a second attempt. `retried` was being set on the report and
  // rendered nowhere: a field that says nothing to anyone.
  const retried = gatesSection(
    {
      ran: true,
      ok: true,
      results: [{ script: 'test', ok: true, status: 0 }],
      retried: true,
      transport: false,
      firstFailed: ['test'],
    },
    'abcdef0123456789',
  );
  assert.match(retried, /\*\*These gates were run twice\.\*\*/);
  assert.match(retried, /The first run FAILED and the second PASSED/);
  assert.match(retried, /What failed the first time: `npm run test`/);
  assert.match(retried, /carried NO machine-failure marker/, 'stated as a measurement, not a reassurance');
  // And it must not turn into the one instruction this section exists to refuse.
  assert.match(retried, /\*\*Do not re-run them\.\*\*/);
});

test('a MARKED first failure says so, and a first-time pass says nothing at all', () => {
  const marked = gatesSection(
    { ran: true, ok: true, results: [{ script: 'test', ok: true, status: 0 }], retried: true, transport: true, firstFailed: ['test'] },
  );
  assert.match(marked, /carried the machine-failure marker/);
  assert.doesNotMatch(marked, /carried NO machine-failure marker/);

  // The control: the common path is unchanged, so the paragraph means something
  // when it appears.
  const clean = gatesSection({ ran: true, ok: true, results: [{ script: 'test', ok: true, status: 0 }] });
  assert.doesNotMatch(clean, /run twice/);
  assert.doesNotMatch(clean, /first run/i);
});

test('the loop says WHY a verdict is missing, and still refuses the merge', async () => {
  const ctx = repo('done-edit', 'review-nothing');
  const res = await go(ctx);
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.match(ctx.output(), /no reviewer verdict recorded/);
  assert.match(
    ctx.output(),
    /the reviewer's run ended on its own after \d+\.\d\d model-minutes \(exit 0\) and left no usable verdict/,
    ctx.output(),
  );
  ctx.cleanup();
});

/* ---------------------------------------------------------------------------
 * What a merged job leaves behind: a record that says what it reviewed, and a
 * ledger line that says where the minutes went (beads addictedtoai-sge, -59s).
 *
 * One real loop run drives all four invocations — author, review pass 1,
 * revision, delta review — because that is the only shape that can show a
 * per-invocation record differing from the job total. Nothing below is
 * hand-written JSON: every field asserted was written by the loop's own code.
 * ------------------------------------------------------------------------ */

test('59s the ledger records model-minutes PER INVOCATION, and `mm` is still the job total', async () => {
  const ctx = repo('done-content-entry', 'review-revise-then-approve');
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  const line = readLedger(ctx).at(-1);
  assert.equal(line.id, res.jobId);
  assert.ok(Array.isArray(line.phases), `no phases on the ledger line: ${JSON.stringify(line)}`);
  assert.deepEqual(
    line.phases.map((p) => p.role),
    ['author', 'review1', 'revision', 'review2'],
    'every invocation, in the order the loop made them',
  );
  assert.deepEqual(
    line.phases.map((p) => p.runner),
    ['mock-frontier', 'mock-reviewer', 'mock-frontier', 'mock-reviewer'],
    'and which runner each one cost — the author and the reviewer are not the same runner',
  );
  assert.deepEqual(
    line.phases.map((p) => p.outcome),
    ['done', 'revise', 'unclassified', 'approve'],
    'the author\'s result protocol, each reviewer\'s merge-gate verdict, and an honest gap for the revision',
  );
  for (const p of line.phases) {
    assert.equal(typeof p.mm, 'number');
    assert.ok(p.mm >= 0);
    assert.equal(p.killed, false, 'nothing here hit the cap');
    assert.equal(p.code, 0);
  }

  // `mm` REMAINS THE TOTAL. This is the compatibility claim, measured rather
  // than asserted: budget.mjs sums `mm` and must keep working unchanged.
  // Every phase and the total are each rounded to 2dp independently, so four
  // phases can drift from the total by at most 4 × 0.005 plus the total's own
  // 0.005. Anything beyond that is a phase that was not counted.
  const sum = line.phases.reduce((s, p) => s + p.mm, 0);
  assert.ok(Math.abs(sum - line.mm) <= 0.025, `${sum} vs ${line.mm} — phases must add up to the total`);
  const shares = tierShares(loadConfig(ctx), readLedger(ctx), 'frontier', NOW);
  assert.equal(shares.total_mm, line.mm, 'the budget still reads one number per job, and it is the total');

  // The line the maintainer actually reads, printed by the run itself.
  assert.match(ctx.output(), /ledger: \{.*"phases":\[/);
  ctx.cleanup();
});

test('C44 a job that makes one invocation records one phase, and it is the whole total', async () => {
  // The four-phase case above shows the breakdown can differ from the total.
  // This is the other end of the same claim, and it is the one that catches a
  // `phases` array padded with roles the loop did not actually invoke: a
  // well-formed `blocked:` is a SUCCESSFUL honest outcome that ends the job
  // after the author run, with no review pass and no revision. One invocation,
  // one measurement, and the sum is the total exactly.
  const ctx = repo('blocked', 'review-approve');
  const res = await go(ctx);
  assert.equal(res.outcome, 'blocked', ctx.output());

  const line = readLedger(ctx).at(-1);
  assert.ok(Array.isArray(line.phases), `no phases on the ledger line: ${JSON.stringify(line)}`);
  assert.equal(line.phases.length, 1, 'one invocation, one phase — not a placeholder for each role');
  assert.deepEqual(line.phases.map((p) => p.role), ['author']);
  assert.deepEqual(line.phases.map((p) => p.runner), ['mock-frontier']);
  assert.equal(line.phases[0].outcome, 'blocked', 'the author\'s own result-protocol classification');
  assert.equal(line.phases[0].mm, line.mm, 'with one phase the breakdown IS the total, to the last hundredth');
  ctx.cleanup();
});

test('sge a merged job writes into its verdict record which files it reviewed', async () => {
  const ctx = repo('done-content-entry', 'review-revise-then-approve');
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  // The approving record is the delta review's, and it is the one that gains
  // the declaration.
  const path = verdictPath(ctx, res.jobId, 2);
  const rec = matter(readFileSync(path, 'utf8'));
  assert.deepEqual(
    rec.data.subject,
    ['content/blog/fixture-post.md', 'content/wiki/model/fixture-model.md'],
    'the content files that merged — and only those',
  );
  assert.ok(!JSON.stringify(rec.data.subject).includes('notes.txt'), 'a non-content file is not a piece anything reviews');

  // The record is otherwise untouched: the verdict still parses, and the
  // would-cite is byte-identical, which the duplicate check depends on.
  const v = parseVerdict(readFileSync(path, 'utf8'));
  assert.equal(v.verdict, 'approve');
  assert.match(v.wouldCite, /per-invocation cap needs per-invocation evidence/);
  assert.match(v.notes, /The revision named what it measured/);

  // And it is what the site-side join reads: `subject` was already a
  // SUBJECT_KEY, so the declaration is all that was missing.
  assert.deepEqual(subjectsOf({ data: rec.data }).slice(0, 2), [
    'content/blog/fixture-post.md',
    'content/wiki/model/fixture-model.md',
  ]);

  // zlq — and WHAT it reviewed, from the same measurement: one reviewed-surface
  // hash per subject, each equal to the file as it landed on the merged tree.
  assert.deepEqual(
    Object.keys(rec.data.reviewed ?? {}).sort(),
    ['content/blog/fixture-post.md', 'content/wiki/model/fixture-model.md'],
    'the reviewed: key set equals the subject: key set',
  );
  for (const [p, h] of Object.entries(rec.data.reviewed)) {
    assert.equal(h, reviewedHashOfFile(join(ctx.repoRoot, p)), `${p} hashes what merged`);
  }

  // It is committed with the rest of the job's records, not left loose.
  assert.match(ctx.output(), /recorded subject: content\/blog\/fixture-post\.md/);
  assert.match(ctx.output(), /recorded reviewed: 2 reviewed-surface hash\(es\)/);
  assert.ok(!/data\/reviews/.test(git(ctx.repoRoot, ['status', '--porcelain'])), 'nothing left uncommitted');
  ctx.cleanup();
});

test('sge writing the subject is idempotent and never invents one', () => {
  const ctx = makeRepo({ now: () => NOW });
  const p = writeVerdictRecord(ctx, 'j-3', { verdict: 'approve', wouldCite: 'someone', notes: 'notes here' });

  assert.equal(joinableSubjects([]).length, 0);
  assert.deepEqual(
    joinableSubjects([
      { status: 'A', path: 'content/wiki/model/a.md' },
      { status: 'M', path: 'content\\blog\\b.md' },
      { status: 'D', path: 'content/wiki/model/gone.md' },
      { status: 'A', path: 'lib/thing.mjs' },
      { status: 'A', path: 'content/wiki/model/a.md' },
    ]),
    ['content/blog/b.md', 'content/wiki/model/a.md'],
    'merged content files only: no deletions, no machinery, no duplicates',
  );

  // No content file merged is not an error and not a lie — it writes nothing.
  assert.equal(writeRecordSubjects(p, []).ok, false);
  assert.ok(!/subject/.test(readFileSync(p, 'utf8')));

  // Twice with different sets replaces rather than accumulates.
  assert.equal(writeRecordSubjects(p, ['content/a.md', 'content/b.md']).ok, true);
  assert.equal(writeRecordSubjects(p, ['content/c.md']).ok, true);
  const data = matter(readFileSync(p, 'utf8')).data;
  assert.equal(data.subject, 'content/c.md');
  assert.equal(data.verdict, 'approve', 'and the reviewer\'s own keys survive');
  assert.equal(parseVerdict(readFileSync(p, 'utf8')).notes, 'notes here');

  // A record with no front matter at all is reported, not silently mangled.
  const bare = join(ctx.reviewsDir, 'bare.md');
  writeFileSync(bare, 'verdict: approve\n', 'utf8');
  const r = writeRecordSubjects(bare, ['content/a.md']);
  assert.equal(r.ok, false);
  assert.match(r.why, /no YAML front-matter block/);
  assert.equal(readFileSync(bare, 'utf8'), 'verdict: approve\n', 'and left exactly as it was');
  ctx.cleanup();
});

test('parseVerdict reads front matter and falls back to plain text for weaker runners', () => {
  const fm = parseVerdict('---\nverdict: approve\nreasons: []\nwould-cite: "someone arguing X"\n---\nnotes');
  assert.equal(fm.verdict, 'approve');
  assert.equal(fm.wouldCite, 'someone arguing X');

  const plain = parseVerdict('Verdict: revise\nReasons: not-worth-reading, overclaiming-summary\nwould-cite: nobody yet\n');
  assert.equal(plain.verdict, 'revise');
  assert.deepEqual(plain.reasons, ['not-worth-reading', 'overclaiming-summary']);
  assert.equal(plain.wouldCite, 'nobody yet');
});

test('a non-prose job type does not require would-cite', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeVerdictRecord(ctx, 'j-2', { verdict: 'approve', wouldCite: '' });
  assert.equal(mergeGate(ctx, { jobId: 'j-2', type: 'machinery' }).ok, true);
  assert.equal(mergeGate(ctx, { jobId: 'j-2', type: 'post' }).ok, false);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// beads addictedtoai-zlq — the record names the BYTES it reviewed, not only the
// files. Everything below attempts what the mechanism forbids and measures the
// result, which is the standard specs/review holds a machinery reviewer to.
// ---------------------------------------------------------------------------

const PIECE = (n) => `---\ntitle: "Piece ${n}"\ndate: "2026-09-01"\nmentions: []\n---\n\nBody ${n}.\n`;

test('zlq the merge writes `reviewed:` from the same measurement as `subject:`', () => {
  const ctx = makeRepo({
    now: () => NOW,
    files: {
      'content/blog/one.md': PIECE(1),
      'content/blog/two.md': PIECE(2),
      'content/blog/three.md': PIECE(3),
    },
  });
  const hash = (p) => reviewedHashOfFile(join(ctx.repoRoot, p));

  // One path: `subject:` stays a bare string, and one hash rides beside it.
  const p1 = writeVerdictRecord(ctx, 'j-one', { verdict: 'approve', wouldCite: 'one', notes: 'n' });
  const w1 = writeRecordSubjects(p1, ['content/blog/one.md'], { repoRoot: ctx.repoRoot });
  assert.equal(w1.ok, true);
  const d1 = matter(readFileSync(p1, 'utf8')).data;
  assert.equal(d1.subject, 'content/blog/one.md', 'subject: keeps its one-path shape');
  assert.deepEqual(d1.reviewed, { 'content/blog/one.md': hash('content/blog/one.md') });

  // Three paths: a hash per subject, and the two key sets are equal.
  const three = ['content/blog/one.md', 'content/blog/three.md', 'content/blog/two.md'];
  const p3 = writeVerdictRecord(ctx, 'j-three', { verdict: 'approve', wouldCite: 'three', notes: 'n' });
  assert.equal(writeRecordSubjects(p3, three, { repoRoot: ctx.repoRoot }).ok, true);
  const d3 = matter(readFileSync(p3, 'utf8')).data;
  assert.deepEqual(d3.subject, three, 'subject: keeps its many-path list shape');
  assert.deepEqual(Object.keys(d3.reviewed).sort(), [...three].sort());
  for (const p of three) assert.equal(d3.reviewed[p], hash(p), `${p} hashes its reviewed surface`);

  // A hash that is not the file's is not written by accident: edit the file and
  // the recorded hash stops matching, which is the entire mechanism.
  writeFileSync(join(ctx.repoRoot, 'content/blog/one.md'), PIECE('1 edited'), 'utf8');
  assert.notEqual(d3.reviewed['content/blog/one.md'], hash('content/blog/one.md'));

  // Golden: `subjectsOf()` returns exactly what it returned before this change,
  // for a one-path record, a many-path record, and a hand-written subject.
  assert.deepEqual(subjectsOf({ data: d1 }), ['content/blog/one.md', 'j-one']);
  assert.deepEqual(subjectsOf({ data: d3 }), [...three, 'j-three']);
  assert.deepEqual(subjectsOf({ data: { subject: 'content/blog/x.md' } }), ['content/blog/x.md']);
  ctx.cleanup();
});

test('zlq with no merged tree to hash against, `reviewed:` is omitted, never guessed', () => {
  const ctx = makeRepo({ now: () => NOW });
  const p = writeVerdictRecord(ctx, 'j-nohash', { verdict: 'approve', wouldCite: 'x', notes: 'n' });

  // No repoRoot at all.
  const bare = writeRecordSubjects(p, ['content/blog/one.md']);
  assert.equal(bare.ok, true);
  assert.equal(bare.reviewed, null);
  assert.match(bare.hashWhy, /no merged tree/);
  assert.equal(matter(readFileSync(p, 'utf8')).data.reviewed, undefined);

  // A repoRoot where one of the subjects does not exist: NO partial map, because
  // the merge gate's invariant is that the two key sets are equal.
  const partial = writeRecordSubjects(p, ['content/blog/one.md', 'content/blog/gone.md'], {
    repoRoot: ctx.repoRoot,
  });
  assert.equal(partial.reviewed, null);
  assert.match(partial.hashWhy, /content\/blog\/gone\.md/);
  assert.equal(matter(readFileSync(p, 'utf8')).data.reviewed, undefined);
  ctx.cleanup();
});

test('zlq the merge refuses a record whose `reviewed:` names a different set than it measured', () => {
  const ctx = makeRepo({
    now: () => NOW,
    files: { 'content/blog/one.md': PIECE(1), 'content/blog/two.md': PIECE(2) },
  });
  // `type: 'post'` below, so the record needs BOTH forced-judgment fields —
  // this test is about the `reviewed:` set, and a record refused for a blank
  // `reads-human` would never reach that check.
  const p = writeVerdictRecord(ctx, 'j-gate', {
    verdict: 'approve',
    wouldCite: 'gate',
    readsHuman: 'reads like a person wrote it: the second paragraph is blunt.',
    notes: 'n',
  });
  const measured = ['content/blog/one.md'];

  // Matching sets merge.
  writeRecordSubjects(p, measured, { repoRoot: ctx.repoRoot });
  assert.equal(mergeGate(ctx, { jobId: 'j-gate', type: 'post', subjects: measured }).ok, true);

  // An EXTRA path in `reviewed:` is refused, with both sets named.
  writeRecordSubjects(p, ['content/blog/one.md', 'content/blog/two.md'], { repoRoot: ctx.repoRoot });
  const extra = mergeGate(ctx, { jobId: 'j-gate', type: 'post', subjects: measured });
  assert.equal(extra.ok, false);
  assert.equal(extra.code, 'reviewed-subject-mismatch');
  assert.match(extra.reason, /content\/blog\/two\.md/);
  assert.match(extra.reason, /measured for subject: content\/blog\/one\.md/);

  // A MISSING path is refused too.
  const missing = mergeGate(ctx, {
    jobId: 'j-gate',
    type: 'post',
    subjects: ['content/blog/one.md', 'content/blog/two.md', 'content/blog/three.md'],
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.code, 'reviewed-subject-mismatch');
  assert.match(missing.reason, /content\/blog\/three\.md/);

  // A record with NO `reviewed:` is not refused — every record written before
  // this mechanism existed is one, and the normal path writes it AFTER the merge.
  const p2 = writeVerdictRecord(ctx, 'j-unbound', {
    verdict: 'approve',
    wouldCite: 'unbound',
    readsHuman: 'no signposting, no self-narration; the lede is a fact.',
    notes: 'n',
  });
  assert.ok(p2);
  assert.equal(mergeGate(ctx, { jobId: 'j-unbound', type: 'post', subjects: measured }).ok, true);
  ctx.cleanup();
});
