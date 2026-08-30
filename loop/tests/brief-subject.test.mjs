/**
 * beads addictedtoai-1md — a queue-sourced brief must name WHAT to work on.
 *
 * The defect these tests exist for: `loop/lib/brief.mjs` rendered only
 * `job.title` and `job.detail`, and `loop/lib/queue.mjs` sets
 * `title: it.title ?? it.detail`. Queue items carry no `title`, so the title
 * WAS the detail, the `detail !== title` guard suppressed the duplicate, and
 * the outcome section could only ever print the REASON. `subject` and `target`
 * — the only two fields that identify the work — never reached the executor.
 *
 * WHY THE EXISTING TEST DID NOT CATCH IT, which is the part worth keeping:
 * `portability.test.mjs` asserts a brief is self-contained, but builds its job
 * as `{ type, source, title, detail }` — a hand-written fixture with no target
 * at all. The fixture encoded the bug. These tests therefore go through
 * `readQueue()` from a real queue file, so the job object is the one the loop
 * actually builds rather than one a test author imagined.
 *
 * The second case covers the reviewer, where the same omission is worse:
 * `scope-violation` is a verdict the reviewer may return (`verdict.mjs`), the
 * author brief warns that exceeding the stated outcome earns it, and the
 * review brief stated no outcome at all.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { assembleBrief } from '../lib/brief.mjs';
import { assembleReviewBrief } from '../lib/review.mjs';
import { readQueue } from '../lib/queue.mjs';
import { makeRepo, writeQueue } from './helpers.mjs';

/** The two `vanished-feed-row` repairs the real queue held on 2026-08-29. */
const TWIN_ITEMS = [
  {
    type: 'repair',
    reason: 'vanished-feed-row',
    rank: 85,
    subject: 'openrouter-models:allenai/olmo-3-32b-think',
    target: 'content/wiki/model/allenai-olmo-3-32b-think.md',
    detail:
      'declared row id absent from the latest snapshot; last seen 2026-08-28 — bound facts render last-known values with an as-of date',
  },
  {
    type: 'repair',
    reason: 'vanished-feed-row',
    rank: 85,
    subject: 'openrouter-models:arcee-ai/virtuoso-large',
    target: 'content/wiki/model/arcee-ai-virtuoso-large.md',
    detail:
      'declared row id absent from the latest snapshot; last seen 2026-08-28 — bound facts render last-known values with an as-of date',
  },
];

test('a queue-sourced brief names the file to work on', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup?.());
  writeQueue(ctx, TWIN_ITEMS);

  const [job] = readQueue(ctx).items;
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260829-03',
    job,
    branch: 'job/j-20260829-03',
    capMinutes: 120,
  });

  assert.ok(
    brief.includes('content/wiki/model/allenai-olmo-3-32b-think.md'),
    'the brief must name the target file; the executor has no session to ask',
  );
  assert.ok(
    brief.includes('openrouter-models:allenai/olmo-3-32b-think'),
    'and the subject the Pulse keyed the item on',
  );
});

test('two items with an identical detail produce briefs that differ', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup?.());
  writeQueue(ctx, TWIN_ITEMS);

  const { items } = readQueue(ctx);
  assert.equal(items[0].detail, items[1].detail, 'precondition: the details really are identical');

  const briefs = items.map((job, i) =>
    assembleBrief(ctx, { jobId: `j-2026082${i}-01`, job, branch: `job/b${i}`, capMinutes: 120 }),
  );

  // Strip the job id and branch, which differ for unrelated reasons. What is
  // left must still distinguish the two, or the executor cannot tell which
  // entry it was sent to repair.
  const body = (s) => s.replace(/j-\d{8}-\d\d/g, 'JOB').replace(/job\/b\d/g, 'BRANCH');
  assert.notEqual(
    body(briefs[0]),
    body(briefs[1]),
    'identical details must not yield identical briefs — this is the whole defect',
  );
  assert.ok(body(briefs[0]).includes('olmo-3-32b-think'));
  assert.ok(body(briefs[1]).includes('virtuoso-large'));
});

test('the review brief states the outcome its scope verdict is measured against', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup?.());
  writeQueue(ctx, TWIN_ITEMS);

  const [job] = readQueue(ctx).items;
  const brief = assembleReviewBrief(ctx, {
    jobId: 'j-20260829-03',
    job,
    diffText: 'diff --git a/x b/x\n',
    pass: 1,
    findings: '',
    outPath: 'verdict.md',
    capMinutes: 120,
  });

  assert.ok(
    brief.includes('content/wiki/model/allenai-olmo-3-32b-think.md'),
    'the reviewer cannot judge scope against an outcome it was never given',
  );
  assert.ok(brief.includes(job.detail), 'and it needs the stated outcome verbatim');
});

test('a job with no target emits no empty target line', (t) => {
  const ctx = makeRepo();
  t.after(() => ctx.cleanup?.());

  // Directives and proposals set these null; `- **Target**: null` would be
  // worse than no line at all.
  const brief = assembleBrief(ctx, {
    jobId: 'j-20260829-04',
    job: { type: 'machinery', source: 'directives', title: 'do a thing', detail: '', target: null, id: null },
    branch: 'job/j-20260829-04',
    capMinutes: 60,
  });

  assert.ok(!brief.includes('**Target**'), 'no target line when there is no target');
  assert.ok(!brief.includes('null'), 'and certainly no literal null');
});
