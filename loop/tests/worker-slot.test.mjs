/**
 * worker-slot.test.mjs — the witness for Stage-1 task 35b (U1, bead avs5).
 *
 * Task 35b: a run takes a worker slot by atomic `mkdir` of `worker-<n>`
 * under the shared per-user lock directory, holding a `pid` file
 * (`<pid>\n<started ISO>\n`); refused when none is free; dead holders
 * reclaimed by rename-aside. All takes below run against an isolated temp
 * directory (`dir` override) — never the live lock dir, so the suite can
 * run beside a real Desk run without touching its slot.
 *
 * Arms, each found by lookup:
 *
 *   arm 0 — a single run proceeds: first take wins slot 1 with a pid file
 *           in the shipped `<pid>\n<ISO>\n` shape.
 *   arm 1 — a second concurrent run refuses, naming the holder: message
 *           shape `worker slots exhausted: workers=1; worker-1 held by pid
 *           <p> since <ISO> (<path>)`.
 *   arm 2 — a dead holder is reclaimed: a slot taken by a dead pid is won
 *           by the next live take.
 *   arm 3 — the refusal is not vacuous: a copy-based mutant whose acquire
 *           always succeeds lets two takes both win (the refusal arm fails
 *           on the mutant), while the tracked file is byte-identical
 *           before and after.
 *   arm 4 — structural: the run.mjs startup refusal returns the
 *           did-not-start status 1 (same status as a STOP/HOLD refusal —
 *           the Q6 answer, pinned where the mapping lives), AND asserts the
 *           acquire call itself — so the pin observes the wiring, not just
 *           the exit number.
 *   arm 4b — the arm-4 pin is not vacuous: a text-level mutant deleting the
 *           acquire line fails the acquire conjunct (while the exit-status
 *           conjunct still matches — each half observes its own line), and
 *           a mutant deleting the `return 1` fails the status conjunct.
 *   arm 5 — merge-lock (task 33) path and single-take discipline: the lock
 *           lives at `<dir>/merge.lock`; a live holder wins and a second
 *           take refuses on `lock_wait_seconds` expiry; release frees it.
 *           The post-release absence assert is the red arm for
 *           `releaseMergeLock` (a no-op mutant keeps the dir and goes red).
 *   arm 6 — merge-lock dead reclaim: a lock planted by a dead pid is won
 *           by the next live take, and the pid file then names the live
 *           holder (the red arm for the reclaim branch of
 *           `acquireMergeLock` — a mutant that never reclaims refuses here).
 *   arm 7 — merge-lock release is best-effort: releasing an absent lock
 *           still reports ok.
 *   arm 8 — the stale-sweep has a red arm: a planted `worker-1.stale-*`
 *           directory is gone after a take (the sweep runs on every win).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { acquireMergeLock, acquireWorkerSlot, mergeLockPath, releaseMergeLock, releaseWorkerSlot, workerSlotPath } from '../lib/train.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB = resolve(HERE, '..', 'lib', 'train.mjs');
const RUN = resolve(HERE, '..', 'run.mjs');

// A pid that cannot be alive on either OS: out of range for real pids.
const DEAD_PID = 2147483647;

function slotRoot() {
  const dir = mkdtempSync(join(tmpdir(), 'atai-slots-'));
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

test('arm 0 — a single run proceeds with a pid file in the shipped shape', () => {
  const { dir, cleanup } = slotRoot();
  try {
    const r = acquireWorkerSlot({ workers: 1, dir });
    assert.equal(r.ok, true);
    assert.equal(r.slot, 1);
    assert.equal(r.path, workerSlotPath(1, dir));
    const body = readFileSync(join(r.path, 'pid'), 'utf8');
    const [pidLine, sinceLine] = body.split(/\r?\n/);
    assert.equal(Number(pidLine), process.pid);
    assert.match(sinceLine, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'started ISO');
    const rel = releaseWorkerSlot(r);
    assert.equal(rel.ok, true);
    assert.equal(existsSync(r.path), false);
  } finally {
    cleanup();
  }
});

test('arm 1 — a second concurrent run refuses, naming the holder', () => {
  const { dir, cleanup } = slotRoot();
  try {
    const first = acquireWorkerSlot({ workers: 1, dir });
    assert.equal(first.ok, true);
    try {
      const second = acquireWorkerSlot({ workers: 1, dir });
      assert.equal(second.ok, false, 'the second run must refuse');
      assert.ok(second.message.startsWith('worker slots exhausted: workers=1; worker-1 held by pid '), second.message);
      assert.ok(second.message.includes(`pid ${process.pid} since `), second.message);
      assert.ok(second.message.endsWith(`(${first.path})`), second.message);
    } finally {
      releaseWorkerSlot(first);
    }
    // After release the next run proceeds again.
    const third = acquireWorkerSlot({ workers: 1, dir });
    assert.equal(third.ok, true);
    releaseWorkerSlot(third);
  } finally {
    cleanup();
  }
});

test('arm 2 — a dead holder is reclaimed by the next live take', () => {
  const { dir, cleanup } = slotRoot();
  try {
    const dead = acquireWorkerSlot({ workers: 1, dir, pid: DEAD_PID, startedAt: '2026-01-01T00:00:00.000Z' });
    assert.equal(dead.ok, true, 'the dead pid takes (nothing alive contests it)');
    const live = acquireWorkerSlot({ workers: 1, dir });
    assert.equal(live.ok, true, 'the live take reclaims the dead slot');
    assert.equal(live.slot, 1);
    const body = readFileSync(join(live.path, 'pid'), 'utf8');
    assert.equal(Number(body.split(/\r?\n/)[0]), process.pid, 'the pid file now names the live holder');
    releaseWorkerSlot(live);
  } finally {
    cleanup();
  }
});

test('arm 3 — the refusal observes the slot (copy-based mutant lets two takes win)', async () => {
  const before = readFileSync(LIB, 'utf8');
  // The mutant takes unconditionally: the atomic mkdir gate is replaced by
  // a constant-true, so every take "wins" and the refusal below never fires.
  const mutant = before.replace('if (mkdirOk(path)) {', 'if (true || mkdirOk(path)) {');
  assert.notEqual(mutant, before, 'the mutant must differ from the shipped file');
  const copyPath = resolve(HERE, '..', 'lib', `train.mut-${process.pid}.mjs`);
  writeFileSync(copyPath, mutant, 'utf8');
  try {
    const { acquireWorkerSlot: mutantAcquire } = await import(`./../lib/train.mut-${process.pid}.mjs`);
    const { dir, cleanup } = slotRoot();
    try {
      const first = mutantAcquire({ workers: 1, dir });
      const second = mutantAcquire({ workers: 1, dir });
      assert.equal(first.ok && second.ok, true, 'mutant must let two takes win (the refusal arm fails on the mutant)');
    } finally {
      cleanup();
    }
    // Verified by hash (the acceptance wording): the digest of the tracked
    // file after the mutant run equals the digest before it — plus the
    // byte-equality assert below, which is strictly stronger.
    const sha = createHash('sha256').update(before, 'utf8').digest('hex');
    assert.equal(
      createHash('sha256').update(readFileSync(LIB, 'utf8'), 'utf8').digest('hex'),
      sha,
      `tracked train.mjs hash-identical after the mutant run (sha256 ${sha.slice(0, 12)}…)`,
    );
    assert.equal(readFileSync(LIB, 'utf8'), before, 'tracked train.mjs byte-identical after the mutant run');
  } finally {
    rmSync(copyPath, { force: true });
  }
});

test('arm 4 — structural: the startup refusal acquires a slot and returns the did-not-start status', () => {
  // Q6, pinned where the mapping lives: a slot refusal is a loop that did
  // not even start (STOP/HOLD class), so `main()` returns 1. Asserted on
  // source per the exit-code precedent — spawning run.mjs would take a real
  // slot in the live lock dir.
  const src = readFileSync(RUN, 'utf8');
  assert.match(src, /slot = acquireWorkerSlot\(\{ workers: loadConfig\(ctx\)\.workers \?\? 1 \}\);/, 'main() acquires a worker slot at startup');
  assert.match(src, /ctx\.log\(slot\.message\);\s*return 1;/, 'slot refusal logs the message and returns 1');
});

test('arm 4b — the arm-4 pin observes the wiring (text-level mutants)', () => {
  // No import, no copy: the mutant is a string with one line deleted, and
  // each conjunct of arm 4 must fail exactly when its own line goes.
  const src = readFileSync(RUN, 'utf8');
  const acquireLine = '    slot = acquireWorkerSlot({ workers: loadConfig(ctx).workers ?? 1 });';
  assert.ok(src.includes(acquireLine), 'the acquire line anchors the mutant');
  const noAcquire = src.replace(acquireLine, '    slot = null;');
  assert.notEqual(noAcquire, src, 'the mutant must differ');
  assert.doesNotMatch(noAcquire, /slot = acquireWorkerSlot\(/, 'deleting the acquire line breaks the acquire conjunct');
  assert.match(noAcquire, /ctx\.log\(slot\.message\);\s*return 1;/, 'the status conjunct still matches — it observes its own lines, not the acquire');
  const noStatus = src.replace('      return 1;', '      return 0;');
  assert.notEqual(noStatus, src, 'the status mutant must differ');
  assert.doesNotMatch(noStatus, /ctx\.log\(slot\.message\);\s*return 1;/, 'losing the did-not-start status breaks the status conjunct');
});

test('arm 5 — merge-lock: beside the lock dir; a live holder wins, expiry refuses, release frees', async () => {
  const { dir, cleanup } = slotRoot();
  try {
    assert.equal(mergeLockPath(dir), join(dir, 'merge.lock'), 'the lock lives beside the build lock');
    const first = await acquireMergeLock({ dir, waitMs: 50, sleepMs: 10 });
    assert.equal(first.ok, true, 'the first take wins');
    assert.equal(first.dir, join(dir, 'merge.lock'));
    const second = await acquireMergeLock({ dir, waitMs: 50, sleepMs: 10 });
    assert.equal(second.ok, false, 'a live-held lock refuses on expiry — no second take steals it');
    assert.match(second.reason, /waited 50ms/, 'the refusal names the waited bound');
    const rel = releaseMergeLock(first);
    assert.equal(rel.ok, true);
    // The red arm for releaseMergeLock: a no-op mutant keeps the dir and
    // goes red here.
    assert.equal(existsSync(join(dir, 'merge.lock')), false, 'release removes the lock');
    const third = await acquireMergeLock({ dir, waitMs: 50 });
    assert.equal(third.ok, true, 'a released lock is winnable again');
    releaseMergeLock(third);
  } finally {
    cleanup();
  }
});

test('arm 6 — merge-lock: a dead holder is reclaimed by the next live take', async () => {
  const { dir, cleanup } = slotRoot();
  try {
    const lockDir = join(dir, 'merge.lock');
    mkdirSync(lockDir, { recursive: true });
    writeFileSync(join(lockDir, 'pid'), `${DEAD_PID}\n2026-01-01T00:00:00.000Z\n`, 'utf8');
    const r = await acquireMergeLock({ dir, waitMs: 50, sleepMs: 10 });
    assert.equal(r.ok, true, 'the dead-held lock is reclaimed, not waited out');
    const [pidLine] = readFileSync(join(lockDir, 'pid'), 'utf8').split(/\r?\n/);
    assert.equal(Number(pidLine), process.pid, 'the pid file now names the live holder');
    releaseMergeLock(r);
  } finally {
    cleanup();
  }
});

test('arm 7 — merge-lock: releasing an absent lock still reports ok (best-effort)', () => {
  const { dir, cleanup } = slotRoot();
  try {
    assert.equal(releaseMergeLock({ dir: join(dir, 'merge.lock') }).ok, true);
  } finally {
    cleanup();
  }
});

test('arm 8 — a take sweeps a stale-aside directory left by a dead reclaimer', () => {
  const { dir, cleanup } = slotRoot();
  try {
    mkdirSync(join(dir, 'worker-1.stale-12345-99999'), { recursive: true });
    const r = acquireWorkerSlot({ workers: 1, dir });
    assert.equal(r.ok, true);
    assert.equal(existsSync(join(dir, 'worker-1.stale-12345-99999')), false, 'the sweep removes the litter on the winning take');
    releaseWorkerSlot(r);
  } finally {
    cleanup();
  }
});
