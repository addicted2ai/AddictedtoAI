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

import { runLoop } from '../run.mjs';
import { readLedger } from '../lib/ledger.mjs';
import {
  assembleReviewBrief,
  mergeGate,
  parseVerdict,
  verdictPath,
  writeVerdictRecord,
  REASONS,
} from '../lib/review.mjs';
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
