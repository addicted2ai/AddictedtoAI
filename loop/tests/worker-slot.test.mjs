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
 *           the Q6 answer, pinned where the mapping lives).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { acquireWorkerSlot, releaseWorkerSlot, workerSlotPath } from '../lib/train.mjs';

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
    assert.equal(readFileSync(LIB, 'utf8'), before, 'tracked train.mjs byte-identical after the mutant run');
  } finally {
    rmSync(copyPath, { force: true });
  }
});

test('arm 4 — structural: the startup refusal returns the did-not-start status', () => {
  // Q6, pinned where the mapping lives: a slot refusal is a loop that did
  // not even start (STOP/HOLD class), so `main()` returns 1. Asserted on
  // source per the exit-code precedent — spawning run.mjs would take a real
  // slot in the live lock dir.
  const src = readFileSync(RUN, 'utf8');
  assert.match(src, /ctx\.log\(slot\.message\);\s*return 1;/, 'slot refusal logs the message and returns 1');
});
