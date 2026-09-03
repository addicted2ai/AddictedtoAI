/**
 * discarded-proposal-retry.test.mjs — a refused candidate does not come back to
 * the front of the queue every run (beads addictedtoai-z5dj).
 *
 * THE REGRESSION THIS PINS, and it was introduced by
 * `let-dated-news-outrank-the-queue` itself. A discarded job does not consume
 * its proposal — correctly, since only a merged `done` may, and what a
 * reviewer rejected was the writing rather than the idea. That was
 * self-limiting while proposals sat below the derived queue: a refused
 * candidate waited behind however much upkeep existed, which on this repository
 * is effectively always some. Ranking an expiring proposal ABOVE the queue
 * removed that spacing without replacing it, so the same candidate returned to
 * the front on the very next run, with the same brief and nothing between
 * attempts changed. Observed 2026-09-03: j-20260903-03 was refused twice and
 * discarded at 34.61 model-minutes, and the next dry run selected the identical
 * proposal again — ~35 mm per run until it expired or three consecutive
 * discards tripped breaker 1 and halted the Desk.
 *
 * TWO HALVES, and the tests below are grouped to match, because neither
 * substitutes for the other: the demotion makes the retry SLOWER, and the
 * record in the proposal makes it SMARTER. A slower retry that repeats the
 * same mistake is still waste; a smarter one that runs every single run is
 * still ~35 mm a run.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, utimesSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

import { gatherCandidates } from '../lib/select.mjs';
import { readProposals, recordDiscardedAttempt } from '../lib/proposals.mjs';
import { transcribeCarriedFindings } from '../lib/carry.mjs';
import { verdictPath } from '../lib/review.mjs';
import { makeRepo, writeQueue } from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');

/** Plant a proposal. `expires` is written BARE, the shape a model writes. */
function plant(ctx, slug, { type = 'post', expires = null, ageDays = 30, discarded = null } = {}) {
  const dir = join(ctx.repoRoot, 'data', 'proposals');
  mkdirSync(dir, { recursive: true });
  const p = join(dir, `${slug}.md`);
  const fm = [
    `slug: ${slug}`,
    `type: ${type}`,
    'date: 2026-09-01',
    ...(expires === null ? [] : [`expires: ${expires}`]),
    ...(discarded === null ? [] : [`discarded_attempts: ${discarded}`]),
  ].join('\n');
  writeFileSync(p, `---\n${fm}\n---\n\nA candidate body.\n`, 'utf8');
  const t = new Date(NOW.getTime() - ageDays * 86400000);
  utimesSync(p, t, t);
  return p;
}

const kinds = (c) => c.candidates.map((x) => `${x.priority}:${x.slug ?? x.type ?? '?'}`);

// ---------------------------------------------------------------------------
// Half one: the demotion — the expiry's precedence is spent by a discard.
// ---------------------------------------------------------------------------

test('an expiring proposal whose last attempt was DISCARDED no longer outranks the queue', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [{ type: 'repair', title: 'a routine repair' }]);
  plant(ctx, 'refused-news', { type: 'post', expires: '2026-09-14', discarded: 1 });

  const got = gatherCandidates(ctx, { dryRun: true });
  assert.equal(
    got.candidates[0]?.type,
    'repair',
    `a candidate that has already been refused must not preempt upkeep, got ${kinds(got).join(' | ')}`,
  );
  ctx.cleanup();
});

test('THE CONTROL: the SAME proposal with no discard on it still outranks the queue', () => {
  // Byte-for-byte the fixture above minus `discarded_attempts`. Without this
  // the test above would pass just as well if the expiring band had been
  // deleted outright, which is the larger change this fix must not become.
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [{ type: 'repair', title: 'a routine repair' }]);
  plant(ctx, 'refused-news', { type: 'post', expires: '2026-09-14' });

  const got = gatherCandidates(ctx, { dryRun: true });
  assert.equal(
    got.candidates[0]?.type,
    'post',
    `an unrefused dated candidate still comes first, got ${kinds(got).join(' | ')}`,
  );
  ctx.cleanup();
});

test('a discarded candidate is DEMOTED, not deleted — it is still selectable, behind the queue', () => {
  // The idea was not what was rejected. Dropping it entirely would be a
  // rejection the reviewer never wrote, and `dropped/`/`rejected/` are the
  // only two places a candidate may go for good.
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [{ type: 'repair', title: 'a routine repair' }]);
  plant(ctx, 'refused-news', { type: 'post', expires: '2026-09-14', discarded: 2 });

  const got = gatherCandidates(ctx, { dryRun: true });
  const post = got.candidates.find((c) => c.slug === 'refused-news');
  assert.ok(post, `the candidate must still be reachable, got ${kinds(got).join(' | ')}`);
  assert.equal(post.priority, 4, 'and it sits with the undated proposals, below the queue');
  ctx.cleanup();
});

test('an unrefused dated candidate is reached ahead of a refused one, whatever their deadlines say', () => {
  // Soonest-deadline-first orders the band; it does not put a candidate back
  // INTO the band. This is the shape of the real case that motivated the fix:
  // an unwritten candidate expiring 2026-09-09 could not be reached at all,
  // because a refused one with an earlier expiry sat in front of it on every
  // run.
  const ctx = makeRepo({ now: () => NOW });
  plant(ctx, 'refused-sooner', { type: 'post', expires: '2026-09-12', discarded: 1 });
  plant(ctx, 'fresh-later', { type: 'post', expires: '2026-09-20' });

  const got = gatherCandidates(ctx, { dryRun: true });
  assert.equal(got.candidates[0]?.slug, 'fresh-later', kinds(got).join(' | '));
  ctx.cleanup();
});

test('an unreadable discarded_attempts does not silently demote a candidate', () => {
  // Fail toward the documented behaviour, not toward the new one: a garbled
  // value must not become a bound nobody asked for and nothing explains.
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, [{ type: 'repair', title: 'a routine repair' }]);
  plant(ctx, 'dated-news', { type: 'post', expires: '2026-09-14', discarded: 'lots' });

  const got = gatherCandidates(ctx, { dryRun: true });
  assert.equal(got.candidates[0]?.type, 'post', kinds(got).join(' | '));
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// Half two: the record — the retry is briefed on why the last one failed.
// ---------------------------------------------------------------------------

test('recordDiscardedAttempt stamps the count and writes the reasons into the proposal', () => {
  const ctx = makeRepo({ now: () => NOW });
  const p = plant(ctx, 'refused-news', { type: 'post', expires: '2026-09-14' });

  const r = recordDiscardedAttempt(ctx, {
    path: p,
    slug: 'refused-news',
    jobId: 'j-20260903-03',
    jobType: 'post',
    reasons: ['false-or-unsupported-claim'],
    notes: 'CVP access to Mythos-class models is future, not current.',
    findings: [{ title: 'the access sentence', detail: 'who regained access is wrong', subject: 'content/blog/never-merged.md' }],
  });

  assert.equal(r.recorded, true);
  assert.equal(r.attempts, 1);
  const doc = matter(readFileSync(p, 'utf8'));
  assert.equal(doc.data.discarded_attempts, 1);
  assert.equal(doc.data.slug, 'refused-news', 'the stamp must not disturb the rest of the front matter');
  assert.equal(doc.data.expires instanceof Date || typeof doc.data.expires === 'string', true, 'nor drop the expiry');
  assert.match(doc.content, /Discarded attempt 1: job j-20260903-03/);
  assert.match(doc.content, /false-or-unsupported-claim/);
  assert.match(doc.content, /CVP access to Mythos-class models is future, not current/);
  assert.match(doc.content, /who regained access is wrong/);
  assert.match(doc.content, /content\/blog\/never-merged\.md/, 'and it says which file the branch never merged');
  ctx.cleanup();
});

test('the recorded reason reaches the next brief, because a proposal body IS the brief detail', () => {
  // The end-to-end claim, and the reason the record goes in the proposal rather
  // than beside it: `readProposals` builds `detail` from summary + body, and
  // that is what the next attempt's brief renders.
  const ctx = makeRepo({ now: () => NOW });
  const p = plant(ctx, 'refused-news', { type: 'post', expires: '2026-09-14' });
  recordDiscardedAttempt(ctx, {
    path: p,
    slug: 'refused-news',
    jobId: 'j-20260903-03',
    jobType: 'post',
    reasons: ['false-or-unsupported-claim'],
    notes: 'CVP access to Mythos-class models is future, not current.',
    findings: [],
  });

  const props = readProposals(ctx);
  const c = props.ripe.find((x) => x.slug === 'refused-news');
  assert.ok(c, 'still ripe — demoted, not dropped');
  assert.match(c.detail, /CVP access to Mythos-class models is future, not current/);
  assert.equal(c.discardedAttempts, 1);
  assert.equal(c.preempts, false);
  ctx.cleanup();
});

test('a second discard increments rather than overwriting the first attempt record', () => {
  const ctx = makeRepo({ now: () => NOW });
  const p = plant(ctx, 'refused-news', { type: 'post', expires: '2026-09-14' });
  recordDiscardedAttempt(ctx, { path: p, slug: 'refused-news', jobId: 'j-a', jobType: 'post', reasons: ['a'], notes: 'first reason' });
  const r = recordDiscardedAttempt(ctx, { path: p, slug: 'refused-news', jobId: 'j-b', jobType: 'post', reasons: ['b'], notes: 'second reason' });

  assert.equal(r.attempts, 2);
  const text = readFileSync(p, 'utf8');
  assert.match(text, /Discarded attempt 1: job j-a/);
  assert.match(text, /Discarded attempt 2: job j-b/);
  assert.match(text, /first reason/, 'the earlier attempt is still readable — a retry needs both');
  assert.equal(matter(text).data.discarded_attempts, 2);
  ctx.cleanup();
});

test('recording against a proposal that is gone reports it rather than throwing', () => {
  const ctx = makeRepo({ now: () => NOW });
  const r = recordDiscardedAttempt(ctx, {
    path: join(ctx.repoRoot, 'data', 'proposals', 'vanished.md'),
    slug: 'vanished',
    jobId: 'j-x',
    jobType: 'post',
  });
  assert.equal(r.recorded, false);
  assert.match(r.why, /no longer exists/);
  ctx.cleanup();
});

test('a dry run computes the count and writes nothing', () => {
  const ctx = makeRepo({ now: () => NOW });
  const p = plant(ctx, 'refused-news', { type: 'post', expires: '2026-09-14' });
  const before = readFileSync(p, 'utf8');
  const r = recordDiscardedAttempt(ctx, { path: p, slug: 'refused-news', jobId: 'j-x', jobType: 'post' }, { dryRun: true });
  assert.equal(r.recorded, false);
  assert.equal(r.attempts, 1);
  assert.equal(readFileSync(p, 'utf8'), before);
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// The orphaning: a finding naming a file the discarded branch never merged.
// ---------------------------------------------------------------------------

function writeRecord(ctx, jobId, carryYaml) {
  mkdirSync(ctx.reviewsDir, { recursive: true });
  const p = verdictPath(ctx, jobId, 1);
  writeFileSync(p, `---\njob: ${jobId}\nverdict: revise\nreasons: [false-or-unsupported-claim]\n${carryYaml}---\n\nreviewer notes\n`, 'utf8');
  return p;
}

test('a carried finding naming a file that does not exist is orphaned, not written to data/carried/', () => {
  const ctx = makeRepo({ now: () => NOW });
  const p = writeRecord(
    ctx,
    'j-discarded',
    'carry:\n  - title: the access sentence\n    detail: who regained access is wrong\n    subject: content/blog/never-merged.md\n',
  );
  const r = transcribeCarriedFindings(ctx, { jobId: 'j-discarded', verdictPath: p, subjectMustExist: true });

  assert.equal(r.transcribed.length, 0, 'nothing may be queued against a path that never existed');
  assert.equal(r.orphaned.length, 1);
  assert.equal(r.orphaned[0].subject, 'content/blog/never-merged.md');
  assert.equal(r.orphaned[0].detail, 'who regained access is wrong');
  assert.ok(!existsSync(ctx.carriedDir) || readdirSync(ctx.carriedDir).length === 0);
  ctx.cleanup();
});

test('THE CONTROL: a finding whose subject DOES exist is transcribed on a discard like any other', () => {
  // A reviewer noticing something about a page that is already published is
  // unaffected by what happened to the branch it was reviewing. Without this
  // the fix would silently swallow every finding on a discarded job.
  const ctx = makeRepo({ now: () => NOW, files: { 'content/blog/live.md': '# a published post\n' } });
  const p = writeRecord(
    ctx,
    'j-discarded',
    'carry:\n  - title: a note about a live page\n    detail: the licence sentence is stale\n    subject: content/blog/live.md\n',
  );
  const r = transcribeCarriedFindings(ctx, { jobId: 'j-discarded', verdictPath: p, subjectMustExist: true });

  assert.equal(r.orphaned.length, 0);
  assert.equal(r.transcribed.length, 1);
  assert.match(readFileSync(r.transcribed[0].dest, 'utf8'), /the licence sentence is stale/);
  ctx.cleanup();
});

test('without the flag — the merge path — nothing is orphaned, because the subject is in the tree by construction', () => {
  const ctx = makeRepo({ now: () => NOW });
  const p = writeRecord(
    ctx,
    'j-merged',
    'carry:\n  - title: a note\n    detail: some detail\n    subject: content/blog/whatever.md\n',
  );
  const r = transcribeCarriedFindings(ctx, { jobId: 'j-merged', verdictPath: p });
  assert.equal(r.orphaned.length, 0);
  assert.equal(r.transcribed.length, 1);
  ctx.cleanup();
});
