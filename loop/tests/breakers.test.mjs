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
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { runLoop, attemptMergeWithoutReview } from '../run.mjs';
import { readLedger } from '../lib/ledger.mjs';
import {
  BREAKERS,
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
