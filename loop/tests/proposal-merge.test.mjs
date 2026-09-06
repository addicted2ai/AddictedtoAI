/**
 * proposal-merge.test.mjs — task 2.4, the merge mechanics for candidates.
 *
 * specs/loop: "The caps SHALL be mechanisms". A mechanism is what it does when
 * measured, so every test here runs the REAL loop against a REAL executor
 * process that REALLY writes proposal files, and then reads the working tree
 * and the git history. Nothing below stubs the merge or hands the loop a set of
 * paths to cap.
 *
 * Each guardrail carries its positive control in the same file, because a cap
 * that drops everything passes a drop test and is useless:
 *
 *   - four candidates keep three     ← three candidates keep three, drop none
 *   - ranking beats filename         ← unranked candidates fall back to filename
 *   - a `post` proposing `post` is   ← a `post` proposing `interpret` lands in
 *     rejected                         `data/proposals/`
 *   - a noting verdict transcribes   ← a non-noting verdict writes nothing
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, utimesSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

import { runLoop } from '../run.mjs';
import {
  addedProposalPaths,
  applyProposalMergeRules,
  proposalCapFor,
  setFrontMatterKeys,
  notedProposal,
} from '../lib/proposals.mjs';
import { makeRepo, writeQueue, runnersYaml, mockCommand, git, HERE } from './helpers.mjs';

const PMOCK = join(HERE, 'mock-proposal-executor.mjs').replace(/\\/g, '/');
const pmock = (mode) => `node "${PMOCK}" ${mode} "{prompt_file}"`;

function repo(authorMode, { reviewerMode = 'review-approve-plain', type = 'scout', files } = {}) {
  const ctx = makeRepo({
    files,
    runners: runnersYaml({ command: pmock(authorMode), reviewerCommand: pmock(reviewerMode) }),
  });
  writeQueue(ctx, [{ type, title: `a ${type} job for the proposal mechanics` }]);
  return ctx;
}

const go = (ctx, o = {}) =>
  runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true, ...o });

const active = (ctx) =>
  (existsSync(ctx.proposalsDir) ? readdirSync(ctx.proposalsDir, { withFileTypes: true }) : [])
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .sort();

const inDir = (ctx, sub) => {
  const d = join(ctx.proposalsDir, sub);
  return existsSync(d) ? readdirSync(d).sort() : [];
};

const fmOf = (ctx, name, sub = '') =>
  matter(readFileSync(join(ctx.proposalsDir, sub, name), 'utf8')).data;

// ---------------------------------------------------------------------------
// The cap, and its positive control
// ---------------------------------------------------------------------------

test('a four-candidate scout merge keeps three by the job’s ranking and drops one with a note', async () => {
  const ctx = repo('scout-4-ranked');
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  // Three kept — and the three the SCOUT ranked, not the three the alphabet
  // would have chosen. The fixture's filenames run opposite to its ranks
  // precisely so those two answers cannot coincide.
  assert.deepEqual(active(ctx), ['b-third.md', 'c-second.md', 'd-best.md']);

  // The fourth is a record, with the note the requirement asks for.
  const dropped = inDir(ctx, 'dropped');
  assert.ok(dropped.includes('a-weakest.md'), dropped.join(', '));
  const note = readFileSync(join(ctx.proposalsDir, 'dropped', 'a-weakest.md'), 'utf8');
  assert.match(note, /## Dropped: over this job's candidate cap/);
  assert.match(note, /may add at most 3 proposal files; it added 4/);
  assert.match(note, /- ranked: rank 4/);
  assert.match(note, /kept instead: `d-best\.md`, `c-second\.md`, `b-third\.md`/);
  assert.match(note, /record, never a block/);
  assert.match(ctx.output(), /proposal cap: the scout job added 4 proposal files and may add 3/);

  // The scout's OWN drop records are not candidates and were not capped: the
  // cap counts files added directly to `data/proposals/`, and `dropped/` is a
  // record directory.
  assert.ok(dropped.includes('considered-and-declined.md'), dropped.join(', '));
  assert.ok(dropped.includes('also-declined.md'), dropped.join(', '));
  assert.equal(dropped.length, 3);

  // And it really merged: the mechanics are in the history, not just on disk.
  const merged = git(ctx.repoRoot, ['log', '--oneline', '-6']);
  assert.match(merged, /proposal caps, stamps and discards/);
  ctx.cleanup();
});

test('POSITIVE CONTROL — a three-candidate scout merge keeps all three and drops nothing', async () => {
  const ctx = repo('scout-3-ranked');
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  assert.deepEqual(active(ctx), ['b-third.md', 'c-second.md', 'd-best.md']);
  assert.deepEqual(inDir(ctx, 'dropped'), [], 'a cap that drops at the limit is dropping unconditionally');
  assert.ok(!/proposal cap:/.test(ctx.output()), ctx.output());
  ctx.cleanup();
});

test('with no stated ranking the cap falls back to filename, and says which it used', async () => {
  const ctx = repo('scout-4-unranked');
  await go(ctx);
  assert.deepEqual(active(ctx), ['a-one.md', 'b-two.md', 'c-three.md']);
  const note = readFileSync(join(ctx.proposalsDir, 'dropped', 'd-four.md'), 'utf8');
  assert.match(note, /- ranked: no `rank:` declared; ordered by filename/);
  ctx.cleanup();
});

test('an ordinary job’s cap is one: a second proposal is dropped with the same note', async () => {
  // An `entry` job filing two `interpret` proposals: the cap is the only rule
  // that can fire here, which is what makes the assertion about the cap.
  const ctx = repo('proposes-two', { type: 'entry' });
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  assert.deepEqual(active(ctx), ['a-first.md']);
  assert.deepEqual(inDir(ctx, 'dropped'), ['b-second.md']);
  assert.match(
    readFileSync(join(ctx.proposalsDir, 'dropped', 'b-second.md'), 'utf8'),
    /may add at most 1 proposal file; it added 2/,
  );
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// The frontier exemption, and the flag that does not hold
// (flag-what-moved-the-frontier, tasks 7-9)
//
// Two halves that must be independent: the EXEMPTION (a valid flag does not
// count against the scout's three) and the DROP (a flag that does not hold is
// not filed at all). Each is measured through a real loop run against a real
// executor, and each carries the control that stops it from being satisfied by
// a mechanism that simply kept or dropped everything.
//
// MEASURED, 2026-09-06 (task 9). Each half was reverted in
// `loop/lib/proposals.mjs` on its own and this file re-run, and the two
// mutations failed DISJOINT sets — which is the evidence that they are two
// mechanisms and not one described twice:
//
//   mutation A, `exempt` forced to `[]` (the partition reverted, so a valid
//     flag counts against the cap again) — 27 pass, 1 fail:
//       ✖ a validly flagged fourth candidate does not count against the
//         scout's three
//
//   mutation B, `invalidFlagged` forced to `[]` (the drop reverted, so a
//     broken flag rejoins the counted group) — 25 pass, 3 fail:
//       ✖ a flag with no criterion is dropped naming the field, and displaces
//         nobody
//       ✖ every shape of a flag that does not hold is dropped, and the note
//         names the field
//       ✖ a non-boolean `frontier` is refused rather than read as an absent flag
//
// Neither set contains a member of the other, both controls stayed green under
// both mutations, and the file was restored to the committed blob (verified by
// `git hash-object` against `git rev-parse HEAD:loop/lib/proposals.mjs`).
// ---------------------------------------------------------------------------

test('a validly flagged fourth candidate does not count against the scout’s three', async () => {
  // The flagged candidate is ranked LAST — it is exactly the file the cap would
  // have dropped, so nothing here is passed by a run that kept it on merit.
  const ctx = repo('scout-4-one-flagged');
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  assert.deepEqual(active(ctx), ['a-one.md', 'b-two.md', 'c-three.md', 'd-flagged.md']);
  assert.deepEqual(inDir(ctx, 'dropped'), [], 'nothing was over the cap: the flagged one is exempt');

  // The exemption is from the COUNT and from nothing else: the flagged
  // candidate is stamped, cooled, expiring and judged like any other.
  const fm = fmOf(ctx, 'd-flagged.md');
  assert.equal(fm.frontier, true);
  assert.equal(fm.frontier_reason, 'F3');
  assert.deepEqual(fm.domains, ['agents']);
  assert.equal(fm.proposed_by_type, 'scout', 'stamping still runs on the kept set');
  assert.equal(fm.proposed_by_job, res.jobId);
  ctx.cleanup();
});

test('POSITIVE CONTROL — with nothing flagged the same four candidates lose one to the cap', async () => {
  // The pair is the whole evidence: four unflagged candidates drop one, four
  // candidates with one valid flag drop none. Without this the exemption test
  // is also passed by a cap that stopped binding.
  const ctx = repo('scout-4-unranked');
  await go(ctx);
  assert.equal(active(ctx).length, 3, active(ctx).join(', '));
  assert.deepEqual(inDir(ctx, 'dropped'), ['d-four.md']);
  ctx.cleanup();
});

test('a flag with no criterion is dropped naming the field, and displaces nobody', async () => {
  // Ranked FIRST, so a merge that let it rejoin the counted group would push a
  // real candidate out — which is the move the drop exists to prevent: a flag
  // that does not hold must not be able to buy a place among the three by
  // failing.
  const ctx = repo('scout-4-flag-no-criterion');
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  assert.deepEqual(
    active(ctx),
    ['b-two.md', 'c-three.md', 'd-four.md'],
    'the three unflagged candidates are all kept — the broken flag displaced none of them',
  );
  assert.deepEqual(inDir(ctx, 'dropped'), ['a-flagged-no-criterion.md']);

  const note = readFileSync(join(ctx.proposalsDir, 'dropped', 'a-flagged-no-criterion.md'), 'utf8');
  assert.match(note, /## Dropped: the frontier flag it declared does not hold/);
  assert.match(note, /`frontier_reason`/, 'the note names the offending field');
  assert.match(note, /F1, F2, F3, F4, F5/, 'and what would have satisfied it');
  assert.ok(
    !/## Dropped: over this job's candidate cap/.test(note),
    'it was refused for its flag, not for being fourth — the two notes say different things',
  );
  assert.match(note, /`domains` may be ABSENT/, 'and the note does not teach the wrong lesson');
  assert.match(note, /record, never a block/);
  assert.match(ctx.output(), /frontier flag: the scout job declared `frontier: true` on 1 candidate/);
  ctx.cleanup();
});

test('the frontier exemption is the SCOUT’S cap and no other job’s', async () => {
  // An `entry` job filing two `interpret` proposals, the second one validly
  // flagged. DESK-ORDER-001 exempts a flagged story from the three-candidates-
  // per-day cap — the scout's cap. Nothing decided that an ordinary job's
  // one-proposal side-output rule may be lifted by flagging.
  const ctx = repo('entry-two-one-flagged', { type: 'entry' });
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  assert.deepEqual(active(ctx), ['a-first.md'], 'the flag bought this candidate nothing');
  assert.deepEqual(inDir(ctx, 'dropped'), ['b-flagged.md']);
  const note = readFileSync(join(ctx.proposalsDir, 'dropped', 'b-flagged.md'), 'utf8');
  assert.match(note, /## Dropped: over this job's candidate cap/, 'the CAP dropped it, not its flag');
  assert.match(note, /may add at most 1 proposal file; it added 2/);
  assert.match(note, /the frontier exemption is the scout's cap and no other/);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// The stamp, and the same-type discard
// ---------------------------------------------------------------------------

test('the stamp overwrites the origin the executor wrote, and the same-type proposal is discarded', async () => {
  // The executor forges `proposed_by_type: scout` on a proposal filed by a
  // `post` job — the exact move that would launder a self-amplifying candidate
  // past the rule. The stamp is written first and the rule reads it back.
  const ctx = repo('proposes-post', { type: 'post', reviewerMode: 'review-approve-plain' });
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  assert.deepEqual(active(ctx), [], 'a post job’s post proposal must not reach data/proposals/');
  assert.deepEqual(inDir(ctx, 'rejected'), ['more-of-the-same.md']);

  const text = readFileSync(join(ctx.proposalsDir, 'rejected', 'more-of-the-same.md'), 'utf8');
  assert.match(text, /## Auto-discarded: a job may not propose more of itself/);
  assert.match(text, /cannot self-amplify/, 'the pointer names the rule');
  assert.match(text, /No model was invoked and no inference was spent/);

  const fm = fmOf(ctx, 'more-of-the-same.md', 'rejected');
  assert.equal(fm.proposed_by_type, 'post', 'the forged `scout` origin was overwritten');
  assert.equal(fm.proposed_by_job, res.jobId);
  assert.match(fm.rejection_reason, /may not propose another post job/);
  assert.match(ctx.output(), /proposal auto-discarded to data\/proposals\/rejected\/more-of-the-same\.md/);
  ctx.cleanup();
});

test('POSITIVE CONTROL — the cross-type path is the designed one and lands in data/proposals/', async () => {
  const ctx = repo('proposes-interpret', { type: 'post' });
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  assert.deepEqual(active(ctx), ['licence-churn.md']);
  assert.deepEqual(inDir(ctx, 'rejected'), []);
  const fm = fmOf(ctx, 'licence-churn.md');
  assert.equal(fm.type, 'interpret');
  assert.equal(fm.proposed_by_type, 'post', 'stamped with the PROPOSING job’s type');
  assert.equal(fm.proposed_by_job, res.jobId);
  ctx.cleanup();
});

test('every kept candidate carries the proposing job’s stamp', async () => {
  const ctx = repo('scout-3-ranked');
  const res = await go(ctx);
  for (const name of active(ctx)) {
    const fm = fmOf(ctx, name);
    assert.equal(fm.proposed_by_type, 'scout', name);
    assert.equal(fm.proposed_by_job, res.jobId, name);
  }
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// A discarded branch takes its proposals with it
// ---------------------------------------------------------------------------

test('a discarded job’s proposals never reach data/proposals/ — they die with the branch', async () => {
  // Two non-approvals discard the job (a `reject`, a revision pass, a second
  // `reject`). The branch still holds the proposal the executor filed.
  // A reviewer that notes NOTHING, so the only thing that could put a file in
  // `data/proposals/` is the branch.
  const ctx = repo('scout-4-ranked', { reviewerMode: 'review-reject-plain' });
  const res = await go(ctx);
  assert.equal(res.outcome, 'discarded', ctx.output());

  assert.deepEqual(active(ctx), [], 'ideas do not outlive the rejection of the work that produced them');
  assert.deepEqual(inDir(ctx, 'dropped'), []);

  // Measured, not assumed: the files really exist on the branch that was not
  // merged. Without this the assertion above would also pass if the executor
  // had never written anything.
  const onBranch = git(ctx.repoRoot, ['ls-tree', '-r', '--name-only', res.branch])
    .split('\n')
    .filter((l) => l.startsWith('data/proposals/'));
  assert.equal(onBranch.length, 6, onBranch.join(', '));
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// Transcribing a reviewer-noted proposal
// ---------------------------------------------------------------------------

test('a noting verdict produces a well-formed proposal file naming the reviewing job', async () => {
  const ctx = repo('proposes-interpret', { type: 'post', reviewerMode: 'review-approve-noting' });
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  // The job's own proposal AND the reviewer's noted one.
  assert.deepEqual(active(ctx), ['dated-licence-churn.md', 'licence-churn.md']);

  const text = readFileSync(join(ctx.proposalsDir, 'dated-licence-churn.md'), 'utf8');
  const fm = matter(text).data;
  assert.equal(fm.slug, 'dated-licence-churn');
  assert.equal(fm.type, 'interpret');
  assert.equal(fm.origin, `review of job ${res.jobId}`);
  assert.match(String(fm.noted_by), new RegExp(`reviewer of job ${res.jobId}`));
  assert.match(String(fm.noted_by), /mock-reviewer/);
  assert.match(text, /three weeks of licence changes/);
  assert.match(text, /## Origin/);
  assert.match(ctx.output(), /transcribed the reviewer's noted proposal/);

  // Committed with the records it came from, not left untracked. Scoped to
  // `data/proposals` because the fixture's own `data/derived/` is untracked by
  // construction and has nothing to do with this.
  assert.equal(git(ctx.repoRoot, ['status', '--porcelain', '--', 'data/proposals']).trim(), '', ctx.output());
  assert.match(git(ctx.repoRoot, ['log', '-1', '--name-only']), /data\/proposals\/dated-licence-churn\.md/);
  ctx.cleanup();
});

test('POSITIVE CONTROL — a verdict that notes nothing produces no proposal file', async () => {
  const ctx = repo('proposes-interpret', { type: 'post', reviewerMode: 'review-approve-plain' });
  await go(ctx);
  assert.deepEqual(active(ctx), ['licence-churn.md'], 'only the job’s own proposal');
  assert.ok(!/transcribed the reviewer's noted proposal/.test(ctx.output()));
  ctx.cleanup();
});

test('a rejecting reviewer’s noticing is still transcribed — the work was rejected, the idea was not', async () => {
  const ctx = repo('proposes-interpret', { type: 'post', reviewerMode: 'review-reject-noting' });
  const res = await go(ctx);
  assert.equal(res.outcome, 'discarded', ctx.output());
  // The job's own proposal died with the branch; the reviewer's note did not.
  assert.deepEqual(active(ctx), ['dated-licence-churn.md']);
  ctx.cleanup();
});

test('a reviewer noting the type it just reviewed is self-amplification through a side channel', async () => {
  // `review-approve-noting` notes an `interpret` proposal; reviewing an
  // `interpret` job makes the stamped origin type equal the proposed type.
  const ctx = repo('proposes-post', { type: 'interpret', reviewerMode: 'review-approve-noting' });
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  assert.ok(!active(ctx).includes('dated-licence-churn.md'), active(ctx).join(', '));
  assert.ok(inDir(ctx, 'rejected').includes('dated-licence-churn.md'), inDir(ctx, 'rejected').join(', '));
  assert.match(ctx.output(), /written straight to the rejection index/);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// The expiry sweep, through a real run (task 2.5's other half is the reader;
// this is the wiring in run.mjs that calls it)
// ---------------------------------------------------------------------------

const SWEEP_NOW = new Date(2026, 8, 10, 12, 0, 0); // 2026-09-10, local by construction

function sweepRepo(extra = {}) {
  const ctx = makeRepo({
    now: () => SWEEP_NOW,
    runners: runnersYaml({ command: pmock('plain-edit'), reviewerCommand: pmock('review-approve-plain') }),
    files: {
      // Expired yesterday, unselected.
      'data/proposals/stale-news.md':
        '---\nslug: stale-news\ntype: post\ndate: 2026-09-02\nexpires: 2026-09-09\n---\n\nA story whose evidence has stopped being current.\n',
      // Still live — the control. A sweep that took this too would satisfy
      // every "was it swept?" assertion and destroy the mechanism.
      'data/proposals/live-news.md':
        '---\nslug: live-news\ntype: post\ndate: 2026-09-09\nexpires: 2026-09-14\n---\n\nA story that is still current.\n',
    },
    // The job is sourced from a DIRECTIVE, which outranks every proposal and
    // the queue alike, so selection cannot touch either candidate above.
    //
    // This used to be a queue item. Since `let-dated-news-outrank-the-queue`
    // an expiring proposal is reached BEFORE the queue, so `live-news` — whose
    // whole job is to be the control that survives — was being selected and
    // consumed by the very run this test drives, and `active` came back empty.
    // A directive removes selection as a confound entirely, which is what a
    // sweep test wants: what is measured below is the sweep, not the selector.
    directives: '# DIRECTIVES.md\n\n- repair: an ordinary repair, so the run reaches its record commit\n',
    ...extra,
  });
  return ctx;
}

test('a real run sweeps the expired candidate, leaves the live one, and commits the move', async () => {
  const ctx = sweepRepo();
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());

  assert.deepEqual(active(ctx), ['live-news.md'], 'the live candidate must survive the sweep');
  assert.deepEqual(inDir(ctx, 'dropped').map((f) => f.split('.')[0]), ['stale-news']);
  assert.match(ctx.output(), /expired proposal swept to .*dropped/);
  assert.match(ctx.output(), /expired on 2026-09-09; today is 2026-09-10 \(local date\)/);

  const note = readFileSync(join(ctx.proposalsDir, 'dropped', inDir(ctx, 'dropped')[0]), 'utf8');
  assert.match(note, /## Swept: the expiry it declared has arrived/);
  assert.match(note, /- expires: 2026-09-09/);

  // Both halves of the move are in the history, and nothing is left dirty:
  // staging only the destination would leave the deletion uncommitted and the
  // proposal would appear to exist in two places at once.
  assert.equal(git(ctx.repoRoot, ['status', '--porcelain', '--', 'data/proposals']).trim(), '', ctx.output());
  const names = git(ctx.repoRoot, ['log', '-1', '--name-status']);
  assert.match(names, /D\s+data\/proposals\/stale-news\.md/);
  assert.match(names, /A\s+data\/proposals\/dropped\/stale-news\./);
  ctx.cleanup();
});

test('a dry run reports the sweep and moves nothing', async () => {
  const ctx = sweepRepo();
  const res = await go(ctx, { dryRun: true });
  assert.equal(res.dryRun, true, ctx.output());
  assert.match(ctx.output(), /expired proposal swept \(dry run: not moved\)/);
  assert.deepEqual(active(ctx).sort(), ['live-news.md', 'stale-news.md']);
  assert.deepEqual(inDir(ctx, 'dropped'), []);
  ctx.cleanup();
});

test('an expiring candidate is selectable the day it is filed; an ordinary one of the same age is not', async () => {
  const ctx = makeRepo({
    now: () => SWEEP_NOW,
    runners: runnersYaml({ command: pmock('plain-edit'), reviewerCommand: pmock('review-approve-plain') }),
    files: {
      'data/proposals/filed-today-expiring.md':
        '---\nslug: filed-today-expiring\ntype: repair\ndate: 2026-09-10\nexpires: 2026-09-14\n---\n\nFiled today.\n',
      'data/proposals/filed-today-ordinary.md':
        '---\nslug: filed-today-ordinary\ntype: repair\ndate: 2026-09-10\n---\n\nFiled today.\n',
    },
  });
  writeQueue(ctx, []);
  // Cooling reads FILE AGE against the run's clock, and this run's clock is
  // pinned to 2026-09-10 while the fixture's files were written at the real
  // wall clock — which would make both of them days old and neither of them
  // cooling. Both mtimes are set to the pinned instant so each file is 0 days
  // old to this run, and the only difference left between them is the
  // `expires:` line. (This is the mistake this test made first, and it made the
  // pair look like proof of something it was not testing.)
  for (const f of ['filed-today-expiring.md', 'filed-today-ordinary.md']) {
    utimesSync(join(ctx.proposalsDir, f), SWEEP_NOW, SWEEP_NOW);
  }
  const res = await go(ctx, { dryRun: true });
  assert.equal(res.job.source, 'proposal', ctx.output());
  assert.equal(res.job.slug, 'filed-today-expiring', ctx.output());
  assert.match(ctx.output(), /"filed-today-ordinary" is .* days old; it cools for 3 days/);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// The pieces, directly
// ---------------------------------------------------------------------------

test('the cap is three for scout and one for everything else', () => {
  assert.equal(proposalCapFor('scout'), 3);
  for (const t of ['post', 'entry', 'interpret', 'machinery', 'repair', undefined]) {
    assert.equal(proposalCapFor(t), 1, String(t));
  }
});

test('only files ADDED directly under data/proposals/ are candidates', () => {
  const changed = [
    { status: 'A', path: 'data/proposals/a.md' },
    { status: 'A', path: 'data/proposals/dropped/b.md' },
    { status: 'A', path: 'data/proposals/rejected/c.md' },
    { status: 'A', path: 'data/proposals/README.md' },
    { status: 'M', path: 'data/proposals/already-there.md' },
    { status: 'D', path: 'data/proposals/gone.md' },
    { status: 'A', path: 'content/blog/post.md' },
    { status: 'A', path: 'data/proposals/notes.txt' },
  ];
  assert.deepEqual(addedProposalPaths(changed), ['data/proposals/a.md']);
});

test('setFrontMatterKeys replaces a key rather than appending a second one', () => {
  const out = setFrontMatterKeys('---\nslug: x\nproposed_by_type: scout\ntype: post\n---\n\nBody.\n', {
    proposed_by_type: 'post',
    proposed_by_job: 'j-1',
  });
  assert.equal((out.match(/proposed_by_type:/g) ?? []).length, 1);
  const fm = matter(out).data;
  assert.equal(fm.proposed_by_type, 'post');
  assert.equal(fm.proposed_by_job, 'j-1');
  assert.equal(fm.slug, 'x');
  assert.equal(fm.type, 'post');
  assert.match(out, /Body\./);
});

test('setFrontMatterKeys gives a file with no front matter one', () => {
  const out = setFrontMatterKeys('Just a body.\n', { proposed_by_type: 'scout' });
  assert.equal(matter(out).data.proposed_by_type, 'scout');
  assert.match(matter(out).content, /Just a body\./);
});

test('a noted proposal is read from front matter or from a body section, and refused when unusable', () => {
  const fm = notedProposal(
    '---\nverdict: approve\nproposal:\n  slug: a-good-idea\n  type: interpret\n  summary: one line.\n---\n\nNotes.\n',
  );
  assert.equal(fm.ok, true);
  assert.equal(fm.slug, 'a-good-idea');
  assert.equal(fm.type, 'interpret');

  const body = notedProposal(
    '---\nverdict: approve\n---\n\n## Proposal\n\n- slug: from-the-body\n- type: repair\n- summary: a line.\n\n## Other\n\n- slug: not-this-one\n',
  );
  assert.equal(body.ok, true);
  assert.equal(body.slug, 'from-the-body');
  assert.equal(body.type, 'repair');

  assert.equal(notedProposal('---\nverdict: approve\n---\n\nNothing noted.\n'), null);
  assert.equal(
    notedProposal('---\nproposal:\n  slug: fine\n  type: newsletter\n---\n').why,
    'the noted proposal\'s `type` "newsletter" is not in the closed job-type list',
  );
  assert.match(
    notedProposal('---\nproposal:\n  slug: Not Kebab\n  type: repair\n---\n').why,
    /no kebab-case `slug`/,
  );
});

/** A candidate file's text, with whatever front-matter lines the case needs. */
const cand = (slug, lines = []) =>
  `---\nslug: ${slug}\ntype: post\ndate: 2026-09-10\n${lines.join('\n')}${lines.length ? '\n' : ''}---\n\nBody.\n`;

const addedAll = (names) => names.map((n) => ({ status: 'A', path: `data/proposals/${n}` }));

test('every shape of a flag that does not hold is dropped, and the note names the field', () => {
  // The three refusals the build gate makes, made at the merge instead: no
  // criterion, a criterion outside F1-F5, a domain outside the vocabulary. All
  // three are the SAME rule as the build's — `frontierFlagProblems` in
  // lib/domains.mjs — because a flag cannot hold at filing and fail at build.
  const ctx = makeRepo({
    files: {
      'data/proposals/no-criterion.md': cand('no-criterion', ['frontier: true']),
      'data/proposals/bad-criterion.md': cand('bad-criterion', ['frontier: true', 'frontier_reason: F6']),
      'data/proposals/bad-domain.md': cand('bad-domain', [
        'frontier: true',
        'frontier_reason: F2',
        'domains: [text]',
      ]),
      // The controls, in the same call: a valid flag with a domain, a valid
      // flag with NO domain (K46 — absence is the vocabulary's unmarked
      // "general"), and an unflagged candidate. A drop rule that took these too
      // would satisfy every assertion above and destroy the mechanism.
      'data/proposals/good-flag.md': cand('good-flag', [
        'frontier: true',
        'frontier_reason: F1',
        'domains: [coding, agents]',
      ]),
      'data/proposals/general-flag.md': cand('general-flag', ['frontier: true', 'frontier_reason: F5']),
      'data/proposals/plain.md': cand('plain'),
    },
  });
  const r = applyProposalMergeRules(ctx, {
    worktree: ctx.repoRoot,
    jobId: 'j-test-02',
    jobType: 'scout',
    changed: addedAll([
      'no-criterion.md',
      'bad-criterion.md',
      'bad-domain.md',
      'good-flag.md',
      'general-flag.md',
      'plain.md',
    ]),
  });

  assert.deepEqual(
    r.dropped.map((d) => d.name).sort(),
    ['bad-criterion.md', 'bad-domain.md', 'no-criterion.md'],
  );
  assert.deepEqual(
    r.kept.sort(),
    ['general-flag.md', 'good-flag.md', 'plain.md'],
    'two valid flags and one unflagged candidate: nine files would still fit, because only the unflagged one counts',
  );
  // The note names the FIELD, per drop, and they are not the same field.
  const fields = Object.fromEntries(r.dropped.map((d) => [d.name, d.flag]));
  assert.deepEqual(fields['no-criterion.md'], ['frontier_reason']);
  assert.deepEqual(fields['bad-criterion.md'], ['frontier_reason']);
  assert.deepEqual(fields['bad-domain.md'], ['domains.0']);
  const note = readFileSync(join(ctx.proposalsDir, 'dropped', 'bad-domain.md'), 'utf8');
  assert.match(note, /invalid domain "text"/);
  assert.match(note, /"general" is the UNMARKED default/);
  ctx.cleanup();
});

test('a non-boolean `frontier` is refused rather than read as an absent flag', () => {
  // `frontier: yes` is a STRING under YAML 1.2. Read as unflagged it loses a
  // real declaration in silence; read as flagged it lets a value the machinery
  // cannot parse buy an exemption. It is refused, which does neither, and it is
  // what the schema does with the same bytes.
  const ctx = makeRepo({
    files: { 'data/proposals/yes-flag.md': cand('yes-flag', ['frontier: yes', 'frontier_reason: F1']) },
  });
  const r = applyProposalMergeRules(ctx, {
    worktree: ctx.repoRoot,
    jobId: 'j-test-03',
    jobType: 'scout',
    changed: addedAll(['yes-flag.md']),
  });
  assert.deepEqual(r.kept, []);
  assert.deepEqual(r.dropped.map((d) => d.flag), [['frontier']]);
  ctx.cleanup();
});

test('the BAR on the flag binds every job type, and not only the one with the exemption', () => {
  // The second of task 7's TWO BOUNDARIES, and until now the undefended one.
  // The first — "the exemption is the SCOUT'S cap and no other job's" — is
  // pinned by the test below it. This is its pair: the exemption is a privilege
  // the scout has, but the BAR is what the flag MEANS, and a flag that does not
  // hold is not filed by anybody.
  //
  // It was measurable and unmeasured. Every invalid-flag case above passes
  // `jobType: 'scout'`, and the only non-scout case uses a VALID flag — so
  // narrowing the drop to `jobType === 'scout' && e.flagged && …` kept all 28
  // tests in this file green. The doc comment on that filter says a later
  // reader will try to simplify exactly this away, which is precisely the state
  // that lets the simplification land in silence.
  //
  // What the narrowed version would do, stated as the cost rather than the
  // rule: an `entry` job's broken declaration would be KEPT — counted against
  // its cap of one, stamped, and merged into `data/proposals/` — for the reason
  // that its job type had no exemption to lose. It would then fail the build
  // the day it became a post. Dropping it here is the same refusal one step
  // earlier.
  const ctx = makeRepo({
    files: {
      'data/proposals/entry-bad-flag.md': cand('entry-bad-flag', ['frontier: true']),
    },
  });
  const r = applyProposalMergeRules(ctx, {
    worktree: ctx.repoRoot,
    jobId: 'j-test-05',
    jobType: 'entry',
    changed: addedAll(['entry-bad-flag.md']),
  });

  assert.equal(r.cap, 1, 'precondition: an ordinary job\'s cap is one, so the cap alone would have kept this');
  assert.deepEqual(r.kept, [], 'a flag that does not hold is not filed by anybody');
  assert.deepEqual(r.dropped.map((d) => d.name), ['entry-bad-flag.md']);
  assert.deepEqual(r.dropped[0].flag, ['frontier_reason'], 'the drop names the field, as it does for a scout');

  // It is dropped for the FLAG, not swept up by the cap — the two notes are
  // different records and a reader of `dropped/` must be able to tell which
  // rule fired. Under the cap of one this file is the only candidate, so the
  // cap could not have dropped it; asserting the note makes that explicit
  // rather than incidental.
  const note = readFileSync(join(ctx.proposalsDir, 'dropped', 'entry-bad-flag.md'), 'utf8');
  assert.match(note, /## Dropped: the frontier flag it declared does not hold/);
  assert.ok(!note.includes("## Dropped: over this job's candidate cap"), 'the flag note, not the cap note');
  assert.match(note, /job: j-test-05 \(entry\)/, 'and it names the job type it actually fired for');
  ctx.cleanup();
});

test('the exemption lifts a COUNT: four unflagged plus one flagged keeps three plus the flag', () => {
  // The arithmetic the exemption exists FOR, at the scale where the cap still
  // bites: the cap is applied to `counted`, never to `entries`. Every other
  // case measured it in the degenerate direction — `over` was empty in all of
  // them, so the `exempt.length ? … : ''` branches in the cap drop-note and in
  // the run log were never once rendered.
  //
  // That note is the only place a reader of `data/proposals/dropped/` learns
  // WHY a fourth file survived while a fifth did not — the only durable record
  // that "the flag lifts a count, never a budget" actually operated on the run.
  const ctx = makeRepo({
    files: {
      'data/proposals/u1.md': cand('u1', ['rank: 1']),
      'data/proposals/u2.md': cand('u2', ['rank: 2']),
      'data/proposals/u3.md': cand('u3', ['rank: 3']),
      'data/proposals/u4.md': cand('u4', ['rank: 4']),
      // Ranked LAST on the job's own stated ranking, so nothing here can pass
      // by being ordered first: it survives on the flag alone.
      'data/proposals/f5.md': cand('f5', [
        'rank: 5',
        'frontier: true',
        'frontier_reason: F3',
        'domains: [robotics]',
      ]),
    },
  });
  const r = applyProposalMergeRules(ctx, {
    worktree: ctx.repoRoot,
    jobId: 'j-test-06',
    jobType: 'scout',
    changed: addedAll(['u1.md', 'u2.md', 'u3.md', 'u4.md', 'f5.md']),
  });

  assert.equal(r.cap, 3);
  assert.deepEqual(
    r.kept.sort(),
    ['f5.md', 'u1.md', 'u2.md', 'u3.md'],
    'the three top-ranked UNFLAGGED candidates, plus the flagged one that did not count',
  );
  assert.deepEqual(
    r.dropped.map((d) => d.name),
    ['u4.md'],
    'the fourth UNFLAGGED candidate is the one over the cap — the flag lifted the count by one, not the cap',
  );
  assert.equal(r.dropped[0].flag, undefined, 'it went for the cap, not for a flag that did not hold');

  // The exempt lines, in both places they are written. These are the branches
  // no other case reaches.
  const note = readFileSync(join(ctx.proposalsDir, 'dropped', 'u4.md'), 'utf8');
  assert.match(note, /## Dropped: over this job's candidate cap/);
  assert.match(note, /- exempt: 1 valid frontier-flagged candidate \(`f5\.md`\)/);
  assert.match(note, /did not count against it — the flag lifts a count, never a budget/);
  assert.match(note, /it added 4/, 'the count reported is `counted`, not the five files added');
  assert.match(note, /- kept instead: /);
  assert.ok(
    !note.includes('the frontier exemption is the scout\'s cap and no other'),
    'that line is for a NON-scout job; this is the scout, which has the exemption',
  );

  const capNote = r.notes.find((n) => n.startsWith('proposal cap:'));
  assert.ok(capNote, 'the run log records the cap firing');
  assert.match(capNote, /added 4 proposal files and may add 3/);
  assert.match(capNote, /1 valid frontier-flagged candidate \(f5\.md\) did not count/);
  ctx.cleanup();
});

test('a flag that does not hold is NOT the exempt one — the drop record must not name a refused candidate', () => {
  // The half of `validFlagged` nothing measured. Deleting `&& e.flagProblems
  // .length === 0` from proposals.mjs leaves every kept/dropped assertion in
  // this file green, because routing is decided by `invalidSet` and the broken
  // file is excluded from `counted` and `kept` either way. What the deletion
  // corrupts is the RECORD: `exempt` would then contain the broken file, and
  // the cap drop-note — plus the `proposal cap:` run-log line that repeats it —
  // would say "1 valid frontier-flagged candidate (`broken.md`) did not count
  // against it", about a file this same run dropped for a flag that does NOT
  // hold.
  //
  // `data/proposals/dropped/` is the only durable record of why a fourth file
  // survived and a fifth did not. A note naming a REFUSED candidate as the
  // exempt one is a false record with nothing anywhere to contradict it, and
  // both notes are model-free text nobody reviews.
  const ctx = makeRepo({
    files: {
      'data/proposals/u1.md': cand('u1', ['rank: 1']),
      'data/proposals/u2.md': cand('u2', ['rank: 2']),
      'data/proposals/u3.md': cand('u3', ['rank: 3']),
      'data/proposals/u4.md': cand('u4', ['rank: 4']),
      // Declares the flag and does not hold it: no `frontier_reason`.
      'data/proposals/broken.md': cand('broken', ['rank: 5', 'frontier: true']),
    },
  });
  const r = applyProposalMergeRules(ctx, {
    worktree: ctx.repoRoot,
    jobId: 'j-test-07',
    jobType: 'scout',
    changed: addedAll(['u1.md', 'u2.md', 'u3.md', 'u4.md', 'broken.md']),
  });

  // Routing first, as the control: it is identical with or without the
  // `flagProblems` half, which is exactly why the record is the thing to
  // assert.
  assert.equal(r.cap, 3);
  assert.deepEqual(r.kept.sort(), ['u1.md', 'u2.md', 'u3.md'], 'the broken flag bought nothing');
  assert.deepEqual(
    r.dropped.map((d) => d.name).sort(),
    ['broken.md', 'u4.md'],
    'one dropped for the flag, one for the cap',
  );
  const byName = Object.fromEntries(r.dropped.map((d) => [d.name, d]));
  assert.deepEqual(byName['broken.md'].flag, ['frontier_reason'], 'and it went for the FLAG');
  assert.equal(byName['u4.md'].flag, undefined, 'while the fourth unflagged one went for the cap');

  // The record itself. The cap note is written for `u4.md`, and with no valid
  // flag in the run there is nothing for it to call exempt.
  const capFile = readFileSync(join(ctx.proposalsDir, 'dropped', 'u4.md'), 'utf8');
  assert.match(capFile, /## Dropped: over this job's candidate cap/);
  assert.ok(!capFile.includes('- exempt:'), 'no candidate here was exempt — the only flag in the run does not hold');
  assert.ok(
    !capFile.includes('valid frontier-flagged candidate'),
    'and nothing may describe the refused file as a valid frontier-flagged candidate',
  );
  assert.ok(!capFile.includes('broken.md'), 'the cap note must not name the file the FLAG rule dropped');
  assert.match(capFile, /it added 4/, 'four candidates counted: the broken one is not among them either');

  // The run log repeats the same sentence and goes wrong the same way.
  const capNote = r.notes.find((n) => n.startsWith('proposal cap:'));
  assert.ok(capNote, 'the run log records the cap firing');
  assert.ok(!capNote.includes('valid frontier-flagged candidate'), capNote);
  assert.ok(!capNote.includes('broken.md'), capNote);

  // And the flag note is the honest one, in both places.
  const flagFile = readFileSync(join(ctx.proposalsDir, 'dropped', 'broken.md'), 'utf8');
  assert.match(flagFile, /## Dropped: the frontier flag it declared does not hold/);
  const flagNote = r.notes.find((n) => n.startsWith('frontier flag:'));
  assert.match(flagNote, /broken\.md: frontier_reason/);
  ctx.cleanup();
});

test('the documented order still holds for a flagged candidate: cap, stamp, discard', () => {
  // A scout filing a validly flagged `scout` proposal. The exemption keeps it
  // past the cap; the stamp is written; the self-amplification rule then reads
  // the stamp back and discards it. The exemption is from the COUNT and from
  // nothing else — it is not a licence to skip the rules that follow it.
  const ctx = makeRepo({
    files: {
      'data/proposals/more-scouting.md':
        '---\nslug: more-scouting\ntype: scout\ndate: 2026-09-10\nfrontier: true\n'
        + 'frontier_reason: F2\ndomains: [research]\n---\n\nBody.\n',
    },
  });
  const r = applyProposalMergeRules(ctx, {
    worktree: ctx.repoRoot,
    jobId: 'j-test-04',
    jobType: 'scout',
    changed: addedAll(['more-scouting.md']),
  });
  assert.deepEqual(r.dropped, [], 'the flag held, so the drop rule did not fire');
  assert.deepEqual(r.rejected.map((x) => x.name), ['more-scouting.md']);
  assert.deepEqual(r.kept, [], 'kept minus rejected');
  const text = readFileSync(join(ctx.proposalsDir, 'rejected', 'more-scouting.md'), 'utf8');
  assert.match(text, /## Auto-discarded: a job may not propose more of itself/);
  assert.equal(matter(text).data.proposed_by_type, 'scout', 'the stamp ran before the discard read it');
  ctx.cleanup();
});

test('applyProposalMergeRules reports what it did without a loop run', () => {
  const ctx = makeRepo({
    files: {
      'data/proposals/a.md': '---\nslug: a\ntype: entry\n---\n\nA.\n',
      'data/proposals/b.md': '---\nslug: b\ntype: entry\n---\n\nB.\n',
    },
  });
  const r = applyProposalMergeRules(ctx, {
    worktree: ctx.repoRoot,
    jobId: 'j-test-01',
    jobType: 'entry',
    changed: [
      { status: 'A', path: 'data/proposals/a.md' },
      { status: 'A', path: 'data/proposals/b.md' },
    ],
  });
  assert.equal(r.cap, 1);
  assert.deepEqual(r.added, ['a.md', 'b.md']);
  assert.deepEqual(r.kept, []);
  assert.deepEqual(r.dropped.map((d) => d.name), ['b.md']);
  // `a.md` proposes `entry` from an `entry` job, so it is kept by the cap and
  // then discarded by the self-amplification rule — the task's stated order.
  assert.deepEqual(r.rejected.map((x) => x.name), ['a.md']);
  ctx.cleanup();
});
