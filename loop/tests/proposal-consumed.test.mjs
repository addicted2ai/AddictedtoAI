/**
 * proposal-consumed.test.mjs — a proposal that produced merged work is retired.
 *
 * ## The defect, observed 2026-08-30
 *
 * A proposal selected, written, reviewed and merged into a published post
 * stayed in `data/proposals/` and stayed selectable. The next `--dry-run` after
 * the first post selected THE SAME PROPOSAL again; its `expires:` was a week
 * out, so the loop would have rewritten that post on every run until then.
 * Three were retired by hand (commit `5e226a6`) before this mechanism existed.
 *
 * The tests below run the REAL loop against a REAL executor process and then
 * read the working tree, the git history, and — the assertion that actually
 * matters — what a SECOND run selects. "It is not in `data/proposals/` any
 * more" is a claim about a directory; "the next run does not pick it up" is the
 * property the incident was about.
 *
 * ## The controls, because a mechanism that retires everything is useless
 *
 *   - a merged job retires its proposal   ← a DISCARDED job does not: what was
 *                                            rejected was the work, not the idea
 *   - a merged job retires ITS proposal   ← and leaves every other proposal, and
 *                                            a merged job with no proposal
 *                                            behind it retires nothing at all
 *   - a resumed branch retires the        ← the branch carries the fact; a
 *     proposal it was selected from         resumed job's rebuilt job object
 *                                            cannot remember it
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, utimesSync } from 'node:fs';
import { join } from 'node:path';

import { runLoop } from '../run.mjs';
import { readProposals, consumedDir } from '../lib/proposals.mjs';
import { makeRepo, writeQueue, runnersYaml, plantJobBranch, git, HERE } from './helpers.mjs';

const PMOCK = join(HERE, 'mock-proposal-executor.mjs').replace(/\\/g, '/');
const pmock = (mode) => `node "${PMOCK}" ${mode} "{prompt_file}"`;

/** 2026-09-10, local by construction — the same pinned day the sweep tests use. */
const NOW = new Date(2026, 8, 10, 12, 0, 0);

/** An expiring candidate skips cooling, so it is selectable on the day it is written. */
const RIPE =
  '---\nslug: dated-repair\ntype: repair\ndate: 2026-09-10\nexpires: 2026-09-14\n---\n\n' +
  'A repair worth making, with evidence that has a shelf life.\n';

const OTHER =
  '---\nslug: another-repair\ntype: repair\ndate: 2026-09-10\nexpires: 2026-09-13\n---\n\n' +
  'A different repair, filed the same day.\n';

/**
 * The same proposal with no `expires:`, so cooling (3 days of file age) keeps
 * it out of the selector. Used by the resumption test, where the selector must
 * NOT be the thing that finds it.
 */
const COOLING =
  '---\nslug: dated-repair\ntype: repair\ndate: 2026-09-10\n---\n\n' +
  'A repair worth making, still cooling.\n';

function repo({ reviewerMode = 'review-approve-plain', files, queue = [], now = () => NOW } = {}) {
  const ctx = makeRepo({
    now,
    runners: runnersYaml({ command: pmock('plain-edit'), reviewerCommand: pmock(reviewerMode) }),
    files,
  });
  writeQueue(ctx, queue);
  return ctx;
}

const go = (ctx, o = {}) =>
  runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true, ...o });

/** Top-level `data/proposals/*.md` — exactly what `readProposals` considers. */
const active = (ctx) =>
  (existsSync(ctx.proposalsDir) ? readdirSync(ctx.proposalsDir, { withFileTypes: true }) : [])
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .sort();

const consumed = (ctx) => (existsSync(consumedDir(ctx)) ? readdirSync(consumedDir(ctx)).sort() : []);

// ---------------------------------------------------------------------------

test('a merged job retires the proposal it was selected from, and the next run does not see it', async (t) => {
  const ctx = repo({ files: { 'data/proposals/dated-repair.md': RIPE } });
  t.after(() => ctx.cleanup());

  // Precondition, measured rather than assumed: this proposal really is what
  // the selector would pick. Without it the test below could pass because the
  // loop never selected anything.
  assert.deepEqual(readProposals(ctx).ripe.map((p) => p.slug), ['dated-repair']);

  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  assert.equal(res.result?.mm !== undefined, true);

  assert.deepEqual(active(ctx), [], 'a consumed proposal must not stay selectable');
  const retired = consumed(ctx);
  assert.equal(retired.length, 1, retired.join(', '));
  assert.match(retired[0], /^dated-repair\.consumed-/);

  const note = readFileSync(join(consumedDir(ctx), retired[0]), 'utf8');
  assert.match(note, /## Consumed: this candidate produced merged work/);
  assert.match(note, new RegExp(`- job: ${res.jobId} \\(repair\\)`));
  assert.match(note, new RegExp(`- merged as: \`${res.mergedSha}\``), note);
  assert.match(note, /- was: `dated-repair\.md` \(slug `dated-repair`\)/);
  assert.match(note, /record, never a block/);
  assert.match(ctx.output(), /retired the consumed proposal to .*consumed/);

  // Both halves of the move are in the history and nothing is left dirty —
  // staging only the destination would leave the deletion uncommitted and the
  // proposal would appear to exist in two places at once.
  assert.equal(git(ctx.repoRoot, ['status', '--porcelain', '--', 'data/proposals']).trim(), '', ctx.output());
  const names = git(ctx.repoRoot, ['log', '-1', '--name-status']);
  assert.match(names, /D\s+data\/proposals\/dated-repair\.md/);
  assert.match(names, /A\s+data\/proposals\/consumed\/dated-repair\.consumed-/);

  // THE PROPERTY THE INCIDENT WAS ABOUT: the run after the first one does not
  // select the same proposal again.
  assert.deepEqual(readProposals(ctx).ripe.map((p) => p.slug), []);
  const second = await go(ctx, { dryRun: true });
  assert.equal(second.selected ?? null, null, ctx.output());
  assert.equal(second.nothingQualified, true, ctx.output());
});

test('`consumed/` is a record, never a block: the same slug may be proposed again', async (t) => {
  // The test above asserts that the retirement NOTE says "record, never a
  // block". That is a claim about text. This is the behaviour: a guardrail is
  // not what it was built to do, it is what it does when measured.
  //
  // `rejected/` suppresses a later proposal carrying the same slug. `consumed/`
  // must not — being written about once is not a reason a subject may never be
  // written about again — so the mechanism is checked from the other side, by
  // planting a retired file and asking the selector what it sees.
  const ctx = repo({
    files: {
      'data/proposals/consumed/dated-repair.consumed-20260910T120000.md': RIPE,
      'data/proposals/dated-repair.md': RIPE,
    },
  });
  t.after(() => ctx.cleanup());

  const seen = readProposals(ctx);
  assert.deepEqual(seen.ripe.map((p) => p.slug), ['dated-repair'], 'a consumed slug must not suppress a refiling');
  assert.deepEqual(seen.duplicates.map((d) => d.slug ?? d), [], 'and it must not be reported as a duplicate either');

  // The control that makes the assertion mean something: the SAME file under
  // `rejected/` does suppress it.
  const blocked = repo({
    files: {
      'data/proposals/rejected/dated-repair.md': RIPE,
      'data/proposals/dated-repair.md': RIPE,
    },
  });
  t.after(() => blocked.cleanup());
  assert.deepEqual(readProposals(blocked).ripe.map((p) => p.slug), [], 'the rejection index still blocks');
});

test('POSITIVE CONTROL — a discarded job leaves its proposal selectable', async (t) => {
  // Two non-approvals discard the job. What was rejected is the work; the idea
  // is untouched, and a mechanism that retired the proposal here would be
  // deleting candidates on the strength of one bad attempt at them.
  const ctx = repo({
    reviewerMode: 'review-reject-plain',
    files: { 'data/proposals/dated-repair.md': RIPE },
  });
  t.after(() => ctx.cleanup());

  const res = await go(ctx);
  assert.equal(res.outcome, 'discarded', ctx.output());

  assert.deepEqual(active(ctx), ['dated-repair.md']);
  assert.deepEqual(consumed(ctx), []);
  assert.deepEqual(readProposals(ctx).ripe.map((p) => p.slug), ['dated-repair']);

  // But it does NOT come straight back to the front of the queue. The attempt
  // is stamped on the candidate, which spends the precedence an `expires:`
  // buys over the derived queue (addictedtoai-z5dj). Asserted end to end here,
  // through the real `runLoop`, because the unit tests in
  // `discarded-proposal-retry.test.mjs` call `recordDiscardedAttempt` directly
  // and so cannot see whether run.mjs ever calls it.
  const after = readProposals(ctx).ripe.find((p) => p.slug === 'dated-repair');
  assert.equal(after.discardedAttempts, 1, ctx.output());
  assert.equal(after.preempts, false, 'a refused candidate stops outranking the queue');
  const amended = readFileSync(join(ctx.proposalsDir, 'dated-repair.md'), 'utf8');
  assert.match(amended, new RegExp(`## Discarded attempt 1: job ${res.jobId}`), amended);
  assert.match(amended, /Read this before attempting it again/);

  // And it is COMMITTED with the job's records, not left dirty in the working
  // tree for the next run to trip over.
  assert.equal(
    git(ctx.repoRoot, ['status', '--porcelain', '--', 'data/proposals/dated-repair.md']).trim(),
    '',
    'the amended proposal must land in the job records commit',
  );
});

test('POSITIVE CONTROL — only the consumed proposal is retired; the others are left alone', async (t) => {
  const ctx = repo({
    files: { 'data/proposals/dated-repair.md': RIPE, 'data/proposals/another-repair.md': OTHER },
  });
  t.after(() => ctx.cleanup());

  // `another-repair` expires sooner, so the comparator ranks it first — which
  // makes it the one that gets selected and consumed, and `dated-repair` the
  // one that must survive.
  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  assert.equal(res.result?.outcome, 'approve', ctx.output());

  assert.deepEqual(active(ctx), ['dated-repair.md'], 'the unselected candidate is untouched');
  assert.equal(consumed(ctx).length, 1);
  assert.match(consumed(ctx)[0], /^another-repair\.consumed-/);
});

test('POSITIVE CONTROL — a merged job that came from the queue retires nothing', async (t) => {
  // The source of the job is what decides. A queue item that happened to merge
  // while a proposal sat in the directory must not consume it.
  //
  // The candidate here is UNDATED and backdated past cooling, which is what
  // makes it a live candidate that genuinely LOSES to the queue. It used to
  // carry an expiry, and since `let-dated-news-outrank-the-queue` an expiring
  // proposal is reached BEFORE the queue — so the old fixture would have been
  // selected from source 2's new superior, and this test would have been
  // asserting nothing about queue-sourced jobs at all. Keeping it ripe rather
  // than cooling is the point: a cooling candidate the selector never
  // considered would make the assertion vacuous.
  const ctx = repo({
    files: { 'data/proposals/dated-repair.md': COOLING },
    queue: [{ type: 'repair', title: 'an ordinary queue item, not a proposal' }],
  });
  t.after(() => ctx.cleanup());
  const ripeAge = new Date(NOW.getTime() - 30 * 86400000);
  utimesSync(join(ctx.proposalsDir, 'dated-repair.md'), ripeAge, ripeAge);

  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  assert.equal(res.result?.outcome, 'approve', ctx.output());

  assert.deepEqual(active(ctx), ['dated-repair.md']);
  assert.deepEqual(consumed(ctx), []);
  assert.ok(!/retired the consumed proposal/.test(ctx.output()), ctx.output());
});

test('a RESUMED branch retires the proposal it was selected from — the branch carries the fact', async (t) => {
  // A resumed run rebuilds a synthetic job object (`source: 'resumed'`) and
  // cannot remember what it was selected from, so the selection writes it into
  // `.job/source.json` beside the brief. Without that, an interrupted proposal
  // job would merge and leave its proposal selectable — the same defect through
  // the resumption door.
  //
  // The real clock here, deliberately: the proposal is never selected by the
  // selector in this test (a freshly written one is still cooling), so the ONLY
  // way it can be retired is the record on the branch.
  const ctx = repo({ files: { 'data/proposals/dated-repair.md': COOLING }, now: () => new Date() });
  t.after(() => ctx.cleanup());

  assert.deepEqual(readProposals(ctx).ripe.map((p) => p.slug), [], 'precondition: not selectable by cooling');

  plantJobBranch(ctx, 'j-20260910-01', {
    brief: '# a planted brief\n\nDo the repair the proposal describes.\n',
    files: {
      '.job/source.json':
        JSON.stringify(
          { job: 'j-20260910-01', type: 'repair', source: 'proposal', slug: 'dated-repair', path: 'data/proposals/dated-repair.md' },
          null,
          2,
        ) + '\n',
    },
  });

  const res = await go(ctx);
  assert.equal(res.jobId, 'j-20260910-01', ctx.output());
  assert.equal(res.outcome, 'done', ctx.output());
  assert.match(ctx.output(), /selected from proposal `dated-repair`/);

  assert.deepEqual(active(ctx), []);
  assert.equal(consumed(ctx).length, 1);
  assert.equal(git(ctx.repoRoot, ['status', '--porcelain', '--', 'data/proposals']).trim(), '', ctx.output());
});

test('a fresh selection writes .job/source.json onto the branch, and only for a proposal', async (t) => {
  // The mechanism the resume path reads. Asserted on the branch itself, because
  // that is where resumption looks — and `.job/` is stripped before the merge,
  // so it must never reach `main`.
  const ctx = repo({
    reviewerMode: 'review-reject-plain', // rejected twice, so the branch survives to be read
    files: { 'data/proposals/dated-repair.md': RIPE },
  });
  t.after(() => ctx.cleanup());

  const res = await go(ctx);
  assert.equal(res.outcome, 'discarded', ctx.output());
  const recorded = JSON.parse(git(ctx.repoRoot, ['show', `${res.branch}:.job/source.json`]));
  assert.equal(recorded.source, 'proposal');
  assert.equal(recorded.slug, 'dated-repair');
  assert.equal(recorded.path, 'data/proposals/dated-repair.md', 'repo-relative and POSIX, so another worktree can read it');

  // The control: a queue job records its source with no proposal in it.
  const q = repo({ queue: [{ type: 'repair', title: 'from the queue' }], reviewerMode: 'review-reject-plain' });
  t.after(() => q.cleanup());
  const qres = await go(q);
  const qrec = JSON.parse(git(q.repoRoot, ['show', `${qres.branch}:.job/source.json`]));
  assert.equal(qrec.slug, null);
  assert.equal(qrec.path, null);
});

test('the merged tree never carries .job/, source record included', async (t) => {
  const ctx = repo({ files: { 'data/proposals/dated-repair.md': RIPE } });
  t.after(() => ctx.cleanup());

  const res = await go(ctx);
  assert.equal(res.outcome, 'done', ctx.output());
  const tracked = git(ctx.repoRoot, ['ls-tree', '-r', '--name-only', 'HEAD']).split('\n').map((s) => s.trim());
  assert.deepEqual(tracked.filter((p) => p.startsWith('.job/')), []);
});
