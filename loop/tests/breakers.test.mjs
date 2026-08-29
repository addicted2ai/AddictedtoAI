/**
 * Task 7.5 — breakers and holds.
 *
 * Four breakers, and only four. The tests below check both halves of that
 * sentence: each named breaker writes `HOLD.md` with its reason, and the
 * conditions specs/loop deliberately did NOT make breakers — a `blocked`
 * outcome, a capacity pause, an empty queue — do not.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { runLoop, attemptMergeWithoutReview } from '../run.mjs';
import { readLedger } from '../lib/ledger.mjs';
import {
  BREAKERS,
  brakeScan,
  brakeState,
  checkBuildRed,
  checkConsecutiveFailures,
  checkReservedPaths,
  reservedPathViolations,
  startGate,
} from '../lib/breakers.mjs';
import { makeRepo, writeLedger, ledgerLine, writeQueue, mockCommand, runnersYaml, daysAgo } from './helpers.mjs';

const NOW = new Date('2026-09-10T12:00:00.000Z');

test('breaker 1 — three consecutive same-type failures write HOLD.md; two failed and a blocked do not', () => {
  const ctx = makeRepo({ now: () => NOW });
  const line = (outcome, i) => ledgerLine({ id: `j-${i}`, type: 'post', outcome, ts: daysAgo(NOW, 5 - i) });

  const notYet = checkConsecutiveFailures(ctx, [line('failed', 1), line('failed', 2), line('blocked', 3)], 'post');
  assert.equal(notYet.tripped, false);
  assert.equal(notYet.count, 2, 'the blocked outcome is not a failure and is not counted');
  assert.ok(!existsSync(ctx.holdPath), 'and no hold was written');

  const tripped = checkConsecutiveFailures(
    ctx,
    [line('failed', 1), line('discarded', 2), line('failed', 3)],
    'post',
  );
  assert.equal(tripped.tripped, true);
  assert.equal(tripped.breaker, BREAKERS.CONSECUTIVE_FAILURES);
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /three consecutive post jobs ended failed or discarded/);
  assert.match(hold, /blocked, interrupted, capacity and abandoned outcomes are not failures/);
  assert.match(hold, /This file is the maintainer's to remove/);
  ctx.cleanup();
});

test('breaker 2 — a red build after a merge writes HOLD.md', () => {
  const ctx = makeRepo({ now: () => NOW });
  assert.equal(checkBuildRed(ctx, { ok: true }).tripped, false);
  assert.ok(!existsSync(ctx.holdPath));
  const r = checkBuildRed(ctx, { ok: false, output: 'Error: build failed on page /wiki/x' });
  assert.equal(r.tripped, true);
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /failed to build after a merge/);
  assert.match(hold, /build failed on page \/wiki\/x/);
  assert.match(hold, /except for its deploy step/);
  ctx.cleanup();
});

test('breaker 3 — a review bypass attempt writes HOLD.md', () => {
  const ctx = makeRepo({ now: () => NOW });
  const r = attemptMergeWithoutReview(ctx, 'j-20260910-01', 'merge invoked with --skip-review');
  assert.equal(r.tripped, true);
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /without a recorded reviewer verdict/);
  assert.match(hold, /j-20260910-01/);
  ctx.cleanup();
});

test('breaker 4 — the reserved paths are exactly the named five', () => {
  const v = reservedPathViolations([
    { status: 'M', path: 'openspec/specs/loop/spec.md' },
    { status: 'M', path: 'data/config.json' },
    { status: 'M', path: 'runners.yml' },
    { status: 'A', path: 'STOP' },
    { status: 'D', path: 'HOLD.md' },
    { status: 'M', path: 'openspec/changes/build-initial-site/tasks.md' },
    { status: 'M', path: 'loop/run.mjs' },
    { status: 'M', path: 'data/ledger.jsonl' },
    { status: 'M', path: 'HOLD.md' },
  ]);
  assert.deepEqual(
    v.map((x) => x.path).sort(),
    ['HOLD.md', 'STOP', 'data/config.json', 'openspec/specs/loop/spec.md', 'runners.yml'],
  );
  // loop/ is deliberately NOT reserved (design D4): reserving it would deadlock
  // the first loop bugfix on an absent maintainer.
  assert.ok(!v.some((x) => x.path.startsWith('loop/')));
  // and only REMOVAL of HOLD.md counts, not modifying it
  assert.equal(v.filter((x) => x.path === 'HOLD.md').length, 1);
});

test('breaker 4 — a job that really edits runners.yml trips the breaker and does not merge', async () => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: mockCommand('reserved-path-edit'), reviewerCommand: mockCommand('review-approve') }),
  });
  writeQueue(ctx, [{ type: 'machinery', title: 'a job that will overstep' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });
  assert.equal(res.outcome, 'failed', ctx.output());
  assert.ok(existsSync(ctx.holdPath), ctx.output());
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /changed reserved path\(s\).*runners\.yml/s);
  assert.match(hold, /The maintainer edits these freely; no job may/);
  // the edit never reached main
  assert.ok(!/edited by a job/.test(readFileSync(join(ctx.repoRoot, 'runners.yml'), 'utf8')));
  ctx.cleanup();
});

// ---------------------------------------------------------------------------
// Breaker 4's filesystem companion (beads addictedtoai-59q, addictedtoai-ut1).
//
// Both brakes are gitignored, so neither can appear in a branch diff any more.
// The STOP clause went blind when the ignore landed; the removal-of-HOLD.md
// clause had never fired at all, because HOLD.md has been untracked its whole
// life and `git diff --name-status` reports only tracked files.
//
// These tests do the thing the guardrail is supposed to prevent, and are
// paired with a control: a guardrail that fires on an innocent run is noise,
// and noise is how a guardrail gets switched off.
// ---------------------------------------------------------------------------

test('brakeScan — a STOP in the job worktree is a violation; a forged HOLD.md is a notice, not a fifth reserved path', () => {
  const ctx = makeRepo({ now: () => NOW });
  const wt = join(ctx.testRoot, 'fake-worktree');
  mkdirSync(wt, { recursive: true });

  assert.deepEqual(brakeScan(ctx, { worktree: wt }), { entries: [], notices: [] }, 'a clean worktree scans clean');

  writeFileSync(join(wt, 'STOP'), '', 'utf8');
  const withStop = brakeScan(ctx, { worktree: wt });
  assert.deepEqual(withStop.entries, [{ status: 'A', path: 'STOP', where: 'the job worktree' }]);
  // The entry is judged by the SAME function a real diff entry is.
  const v = reservedPathViolations(withStop.entries);
  assert.equal(v.length, 1);
  assert.equal(v[0].reserved, 'STOP');
  assert.equal(v[0].where, 'the job worktree');

  writeFileSync(join(wt, 'HOLD.md'), '# HOLD\n', 'utf8');
  const withBoth = brakeScan(ctx, { worktree: wt });
  assert.equal(withBoth.entries.length, 1, 'a job-created HOLD.md is NOT a violation');
  assert.equal(withBoth.notices.length, 1, 'it is reported as a notice instead');
  assert.match(withBoth.notices[0], /not among the reserved paths/);
  ctx.cleanup();
});

test('brakeScan — a brake that disappears from the repository root is a violation, and only a disappearance is', () => {
  const ctx = makeRepo({ now: () => NOW });
  assert.deepEqual(brakeState(ctx), { STOP: false, 'HOLD.md': false });

  // present before, gone after: the removal clause, now reachable.
  writeFileSync(ctx.holdPath, '# HOLD\n', 'utf8');
  writeFileSync(ctx.stopPath, '', 'utf8');
  const before = brakeState(ctx);
  assert.deepEqual(before, { STOP: true, 'HOLD.md': true });
  rmSync(ctx.holdPath);
  rmSync(ctx.stopPath);
  const gone = brakeScan(ctx, { before });
  assert.deepEqual(
    gone.entries.map((e) => `${e.status} ${e.path}`).sort(),
    ['D HOLD.md', 'D STOP'],
  );
  assert.deepEqual(
    reservedPathViolations(gone.entries).map((v) => v.reserved).sort(),
    ['STOP', 'removal of HOLD.md'],
  );

  // absent before, appearing after — a breaker writing its own hold — is not.
  const before2 = brakeState(ctx);
  writeFileSync(ctx.holdPath, '# HOLD\n', 'utf8');
  assert.deepEqual(brakeScan(ctx, { before: before2 }).entries, [], 'an appearance at the root is not a violation');
  ctx.cleanup();
});

test('breaker 4 — a job that really writes STOP into its worktree trips the breaker (it did not before)', async () => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: mockCommand('writes-stop'), reviewerCommand: mockCommand('review-approve') }),
  });
  writeQueue(ctx, [{ type: 'machinery', title: 'a job that reaches for the brake' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

  assert.equal(res.outcome, 'failed', ctx.output());
  assert.ok(existsSync(ctx.holdPath), ctx.output());
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /breaker-4-reserved-path-edit-attempt/);
  assert.match(hold, /`STOP` \(A, reserved as STOP, found in the job worktree\)/);
  // The branch diff genuinely could not see it — this is why the companion
  // exists, and asserting it here keeps the test honest if the ignore is ever
  // removed and the diff clause starts carrying the case again.
  assert.ok(!/STOP/.test(ctx.output().match(/committed the executor's output[^\n]*/)?.[0] ?? ''));
  // and the job's ordinary work never merged
  assert.ok(!existsSync(join(ctx.repoRoot, 'site-note.md')));
  // the maintainer's brake was never created at the root, only in the scratch tree
  assert.ok(!existsSync(ctx.stopPath));
  ctx.cleanup();
});

test('breaker 4 — a job that removes a HOLD.md written while it ran trips the removal clause', async () => {
  // `startGate` refuses to start while a hold exists, so the ONLY window in
  // which a job can remove one is between its own invocations: the reviewer
  // here writes the hold mid-job and the revision pass deletes it.
  const ctx = makeRepo({ now: () => NOW });
  const root = ctx.repoRoot.replace(/\\/g, '/');
  writeFileSync(
    ctx.runnersPath,
    runnersYaml({
      command: mockCommand('removes-root-hold', ` "${root}"`),
      reviewerCommand: mockCommand('review-revise-and-brake', ` "${root}"`),
    }),
    'utf8',
  );
  writeQueue(ctx, [{ type: 'machinery', title: 'a job that clears the halt and carries on' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

  assert.equal(res.outcome, 'failed', ctx.output());
  const hold = readFileSync(ctx.holdPath, 'utf8');
  assert.match(hold, /breaker-4-reserved-path-edit-attempt/);
  assert.match(hold, /`HOLD\.md` \(D, reserved as removal of HOLD\.md, found in the repository root\)/);
  assert.match(ctx.output(), /reserved-path edit attempt \(revision pass\)/);
  ctx.cleanup();
});

test('breaker 4 — an innocent job runs clean: no notice, no hold, and it merges', async () => {
  const ctx = makeRepo({
    now: () => NOW,
    runners: runnersYaml({ command: mockCommand('done-edit'), reviewerCommand: mockCommand('review-approve') }),
  });
  writeQueue(ctx, [{ type: 'machinery', title: 'an ordinary job' }]);
  const res = await runLoop(ctx, { runner: 'mock-frontier', reviewer: 'mock-reviewer', noGates: true });

  assert.equal(res.outcome, 'done', ctx.output());
  assert.ok(!existsSync(ctx.holdPath), `the filesystem companion must not fire on innocent work:\n${ctx.output()}`);
  assert.ok(!/NOTICE:/.test(ctx.output()), ctx.output());
  assert.ok(!/BREAKER/.test(ctx.output()), ctx.output());
  assert.ok(existsSync(join(ctx.repoRoot, 'site-note.md')), 'and the work merged');
  ctx.cleanup();
});

test('the loop refuses to start while STOP exists, and does not remove it', async () => {
  const ctx = makeRepo({ now: () => NOW });
  writeFileSync(ctx.stopPath, '', 'utf8');
  assert.equal(startGate(ctx).ok, false);
  const res = await runLoop(ctx, { runner: 'mock-frontier' });
  assert.equal(res.started, false);
  assert.match(res.reason, /the maintainer's brake/);
  assert.ok(existsSync(ctx.stopPath), 'STOP is still there');
  ctx.cleanup();
});

test('the loop refuses to start while HOLD.md exists, and does not remove it', async () => {
  const ctx = makeRepo({ now: () => NOW });
  writeFileSync(ctx.holdPath, '# HOLD\n\nbecause of a thing\n', 'utf8');
  const res = await runLoop(ctx, { runner: 'mock-frontier' });
  assert.equal(res.started, false);
  assert.match(res.reason, /halted until the maintainer clears it/);
  assert.ok(existsSync(ctx.holdPath));
  ctx.cleanup();
});

test('a capacity pause and an empty queue are NOT breakers', async () => {
  const ctx = makeRepo({ now: () => NOW });
  writeLedger(ctx, [ledgerLine({ provider: 'provider-a', outcome: 'capacity', ts: daysAgo(NOW, 0.01) })]);
  writeQueue(ctx, []);
  const res = await runLoop(ctx, { runner: 'mock-frontier', noGates: true });
  assert.equal(res.started, true);
  assert.ok(!existsSync(ctx.holdPath), 'a paused lane writes no hold');
  assert.match(ctx.output(), /lane "provider-a" is paused/);
  assert.equal(readLedger(ctx).length, 1, 'and no new line was written');
  ctx.cleanup();
});

test('an empty run reports "nothing qualified" and is not an error', async () => {
  const ctx = makeRepo({ now: () => NOW });
  writeQueue(ctx, []);
  const res = await runLoop(ctx, { runner: 'mock-frontier', noGates: true });
  assert.equal(res.nothingQualified, true);
  assert.match(ctx.output(), /nothing qualified — the run ends here, and that is a normal, healthy outcome/);
  assert.ok(!existsSync(ctx.holdPath));
  ctx.cleanup();
});
