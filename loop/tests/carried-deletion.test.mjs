/**
 * carried-deletion.test.mjs — beads addictedtoai-jdt8: a carried finding may
 * not be retired by deletion alone.
 *
 * `data/carried/<file>.md`'s presence IS the queue item, and the fixing job's
 * own diff deletes it. Nothing mechanical checked that the deletion was earned:
 * a job could delete the file, change nothing, and only the reviewer stood
 * between that and a merge. The guard refuses the one unambiguous shape —
 * the finding is gone and nothing else changed.
 *
 * Every test here ATTEMPTS what the mechanism forbids and measures the result,
 * and the control tests matter as much as the refusals: a guard that also
 * refuses a real fix would be a wall, and the second end-to-end test is the one
 * that proves it is not.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { mergeGate, unearnedCarriedDeletion, isDiffRefusal, verdictPath } from '../lib/review.mjs';
import { runLoop } from '../run.mjs';
import { makeRepo, mockCommand, runnersYaml, writeQueue } from './helpers.mjs';

const NOW = new Date('2026-09-06T12:00:00.000Z');
const CARRIED = 'data/carried/j-seed-carry-1.md';

const del = (p) => ({ path: p, status: 'D' });
const add = (p) => ({ path: p, status: 'A' });
const mod = (p) => ({ path: p, status: 'M' });

// ---------------------------------------------------------------------------
// unearnedCarriedDeletion — the pure predicate
// ---------------------------------------------------------------------------

test('the deletion of a carried finding with nothing else in the diff is refused', () => {
  const u = unearnedCarriedDeletion([del(CARRIED)]);
  assert.ok(u, 'a diff that deletes the finding and nothing else is the refused shape');
  assert.deepEqual(u.deleted, [CARRIED]);
});

test('job scaffolding is not work: `.job/` and RESULT.md never rescue a bare deletion', () => {
  // `.job/brief.md` is committed to EVERY branch by construction, so counting
  // it as work would make this guard fire never.
  const u = unearnedCarriedDeletion([add('.job/brief.md'), add('.job/source.json'), del(CARRIED), add('RESULT.md')]);
  assert.ok(u);
  assert.deepEqual(u.deleted, [CARRIED]);
});

test('nothing under data/carried/ counts as work — the subject-less finding keys on its own path', () => {
  // A finding with no `subject:` is keyed by the queue on `data/carried/<file>`
  // (pulse/lib/queue.mjs), so "touched its subject" would be satisfied by the
  // deletion itself. Neither the deletion nor a file added beside it is work.
  assert.ok(unearnedCarriedDeletion([del(CARRIED), del('data/carried/j-seed-carry-2.md')]));
  assert.ok(unearnedCarriedDeletion([del(CARRIED), add('data/carried/j-seed-carry-9.md')]));
  assert.ok(unearnedCarriedDeletion([del(CARRIED), mod('data/carried/README.md')]));
});

test('a diff that deletes the finding AND changes something else is not refused', () => {
  assert.equal(unearnedCarriedDeletion([del(CARRIED), mod('content/wiki/model/x.md')]), null);
  assert.equal(unearnedCarriedDeletion([del(CARRIED), add('.job/brief.md'), mod('lib/schema.mjs')]), null);
});

test('a diff that deletes no carried finding is never refused, whatever else it does', () => {
  assert.equal(unearnedCarriedDeletion([]), null);
  assert.equal(unearnedCarriedDeletion([mod('content/wiki/model/x.md')]), null);
  assert.equal(unearnedCarriedDeletion([add(CARRIED)]), null, 'ADDING a finding is not retiring one');
  assert.equal(unearnedCarriedDeletion([mod(CARRIED)]), null, 'editing one in place is not retiring it');
  assert.equal(unearnedCarriedDeletion([del('data/carried/README.md')]), null, 'the directory README is not a finding');
  assert.equal(unearnedCarriedDeletion([del('data/proposals/dropped/x.md')]), null);
  assert.equal(unearnedCarriedDeletion(null), null, 'an absent measurement runs no check');
});

test('a path list with no statuses cannot fire the guard — a deletion is a status, not a name', () => {
  assert.equal(unearnedCarriedDeletion([CARRIED]), null);
});

test('the refusal code is a diff refusal, not a re-issue one', () => {
  assert.equal(isDiffRefusal('carried-deletion-unearned'), true);
  assert.equal(isDiffRefusal('would-cite-empty'), false);
});

// ---------------------------------------------------------------------------
// mergeGate — the refusal, and the record checks it must not disturb
// ---------------------------------------------------------------------------

function writeRecordAt(ctx, jobId, front, notes = 'reviewer notes\n') {
  mkdirSync(ctx.reviewsDir, { recursive: true });
  const p = verdictPath(ctx, jobId, 1);
  writeFileSync(p, `---\njob: ${jobId}\n${front}---\n\n${notes}`, 'utf8');
  return p;
}

test('mergeGate refuses a valid `approve` whose diff only deletes a carried finding', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeRecordAt(ctx, 'j-bare', 'verdict: approve\nwould-cite: "someone arguing X"\n');

  // The same record, with no `changed` measurement, merges — the check is
  // optional in the same sense `subjects` is.
  assert.equal(mergeGate(ctx, { jobId: 'j-bare', type: 'repair' }).ok, true);

  const g = mergeGate(ctx, { jobId: 'j-bare', type: 'repair', changed: [add('.job/brief.md'), del(CARRIED)] });
  assert.equal(g.ok, false);
  assert.equal(g.code, 'carried-deletion-unearned');
  assert.match(g.reason, /data\/carried\/j-seed-carry-1\.md/);
  assert.match(g.reason, /nothing else/);
  assert.ok(g.verdict, 'the verdict is returned, so the run can still transcribe what the reviewer carried');

  // And the same diff with real work in it passes.
  assert.equal(
    mergeGate(ctx, { jobId: 'j-bare', type: 'repair', changed: [del(CARRIED), mod('content/wiki/model/x.md')] }).ok,
    true,
  );
  ctx.cleanup();
});

test('a bare carried deletion does not rescue a record the gate already refuses', () => {
  const ctx = makeRepo({ now: () => NOW });
  writeRecordAt(ctx, 'j-blank', 'verdict: approve\nwould-cite: ""\n');
  const g = mergeGate(ctx, { jobId: 'j-blank', type: 'post', changed: [del(CARRIED)] });
  assert.equal(g.ok, false);
  assert.equal(g.code, 'would-cite-empty', 'the record checks still run first');
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// End to end — a real loop run against a real branch
// ---------------------------------------------------------------------------

function carriedRepo(authorMode) {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({
      command: mockCommand(authorMode),
      reviewerCommand: mockCommand('review-approve'),
    }),
    files: {
      [CARRIED]:
        '---\ntitle: "name the measurement on the fixture page"\n' +
        'origin: review of job j-seed\ndate: 2026-09-05\n---\n\n' +
        'The page asserts an interval it never measured.\n',
    },
  });
  writeQueue(ctx, [
    {
      type: 'repair',
      title: 'Clear the carried finding on the fixture page',
      detail: 'The page asserts an interval it never measured.',
      subject: CARRIED,
      target: CARRIED,
    },
  ]);
  return ctx;
}

const go = (ctx) => runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

test('end to end: a job that deletes the carried finding and nothing else never merges', async () => {
  const ctx = carriedRepo('retire-carried-only');
  const res = await go(ctx);
  assert.match(ctx.output(), /carried-deletion-unearned/, ctx.output());
  assert.match(ctx.output(), /claims a fix it does not contain/);
  assert.equal(res.outcome, 'discarded', 'refused on pass 1, refused again on pass 2');
  assert.ok(
    existsSync(join(ctx.repoRoot, CARRIED)),
    'and the finding is still on main, so the next Pulse run still queues it',
  );
  ctx.cleanup();
});

test('end to end: the same job clears the refusal by making the change in the same diff', async () => {
  const ctx = carriedRepo('retire-carried-then-fix');
  const res = await go(ctx);
  assert.match(ctx.output(), /carried-deletion-unearned/, 'pass 1 is refused');
  assert.equal(res.outcome, 'done', ctx.output());
  assert.ok(
    existsSync(join(ctx.repoRoot, 'content', 'wiki', 'model', 'fixture-model.md')),
    'the revision’s work merged',
  );
  assert.ok(!existsSync(join(ctx.repoRoot, CARRIED)), 'and the finding retired with it');
  ctx.cleanup();
});
