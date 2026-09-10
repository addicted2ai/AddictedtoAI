/**
 * lease.test.mjs — the Pulse lease: a brake for the writer that reads nothing.
 *
 * At 00:00:41 on 2026-09-10 the scheduled Pulse rewrote tracked files
 * underneath a gate run that was mid-flight. HOLD.md was the wrong brake: it
 * is read only in pulse/lib/publish.mjs and suspends the publish alone, while
 * fetch, snapshot, diff, derive and commit still run. STOP is the right shape
 * but it belongs to the maintainer alone. So the Pulse carries its own lease:
 * GATE_LEASE at the tree root, touched by the gate harness while it runs.
 *
 * A lease, not a lock. The mtime is the authority; contents only name the
 * holder for the log. Past its max age the Pulse ignores the file loudly, so
 * a dead holder cannot stop the engine forever. A timing read that fails is
 * never a reason to refuse, for the same cause: a read that fails once will
 * usually fail again.
 *
 * Every test here runs the real pulse/run.mjs against a throwaway root under
 * the OS temp area via PULSE_ROOT, or calls the same checkLease the shipped
 * program calls. Timing cases set the file mtime directly rather than
 * waiting, so each stays exact and fast.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cleanup, makeRoot, runPulse } from './helpers.mjs';
import { checkLease, holderFromLeaseText, LEASE_FUTURE_TOLERANCE_MS, LEASE_MAX_AGE_MS, paths, today } from '../lib/core.mjs';

const ARGS = ['--no-build', '--no-mint', '--offline'];
const HOLDER = 'gate-harness-probe-1';

function leasePath(root) {
  return join(root, 'GATE_LEASE');
}

function leaseBody(holder = HOLDER) {
  return JSON.stringify({ holder, reason: 'verify-gates', since: today() }) + '\n';
}

/** Write the lease file and pin its mtime to now minus ageMsAgo. */
function writeLease(root, contents, ageMsAgo) {
  const file = leasePath(root);
  writeFileSync(file, contents, 'utf8');
  const when = new Date(Date.now() - ageMsAgo);
  utimesSync(file, when, when);
  return file;
}

function writeFreshLease(root, contents = leaseBody()) {
  return writeLease(root, contents, 60 * 1000);
}

function writeStaleLease(root, contents = leaseBody()) {
  return writeLease(root, contents, LEASE_MAX_AGE_MS + 60 * 1000);
}

function queueFile(root) {
  return join(root, 'data', 'derived', 'queue.json');
}

// ---------------------------------------------------------------------------
// The three controls from the brief: absent proceeds, fresh refuses naming
// the holder, stale proceeds loudly.
// ---------------------------------------------------------------------------

test('absent lease: the ordinary run proceeds and says nothing about a lease', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  assert.equal(existsSync(leasePath(root)), false);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /registry/, 'the pipeline ran');
  assert.match(run.out, /queue/, 'the pipeline ran to the queue');
  assert.doesNotMatch(run.out, /GATE_LEASE/, 'no lease line on the ordinary path');
  assert.equal(existsSync(queueFile(root)), true, 'derived state was written');
});

test('fresh lease: the Pulse refuses, names the holder, exits 0, writes nothing', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeFreshLease(root);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, 'a refused Pulse is an instruction obeyed, not an error: ' + run.out);
  assert.match(run.out, /GATE_LEASE present/, run.out);
  assert.match(run.out, new RegExp(HOLDER), 'the refusal names the holder: ' + run.out);
  assert.match(run.out, /a gate run holds the tree, refusing this run, nothing done/, run.out);
  assert.doesNotMatch(run.out, /STOP file present/, 'the refusal must not read like STOP');
  assert.doesNotMatch(run.out, /registry/, 'nothing else ran');
  assert.doesNotMatch(run.out, /queue/, 'nothing else ran');
  assert.equal(existsSync(queueFile(root)), false, 'no derived state was written under a live gate run');
  assert.equal(existsSync(leasePath(root)), true, 'the Pulse never removes the lease');
});

test('stale lease: the Pulse proceeds loudly, naming the file, the age and the disregard', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeStaleLease(root);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /WARN stale GATE_LEASE/, run.out);
  assert.match(run.out, new RegExp(HOLDER), 'the loud line still names the holder it is ignoring: ' + run.out);
  assert.match(run.out, /disregarding it and proceeding/, run.out);
  assert.match(run.out, /queue/, 'and the pipeline then ran');
  assert.equal(existsSync(queueFile(root)), true, 'a dead holder cannot keep derived state from being written');
});

// ---------------------------------------------------------------------------
// The sweep: every other way the file can exist, fail to exist, or exist
// wrongly. Each asserts what the real program did.
// ---------------------------------------------------------------------------

test('fresh empty lease: malformed means no name, never absent — it still refuses', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeFreshLease(root, '');

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /GATE_LEASE present/, run.out);
  assert.match(run.out, /holder unnamed/, 'an empty file carries no name: ' + run.out);
  assert.doesNotMatch(run.out, /queue/, 'mtime decided, not contents: a fresh empty file refuses');
  assert.equal(existsSync(queueFile(root)), false);
});

test('fresh garbage lease: unparseable contents never throw and never read as absent', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeFreshLease(root, '{{{not json{{{\n');

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /GATE_LEASE present/, run.out);
  assert.doesNotMatch(run.out, /queue/, 'a fresh file with bad contents still refuses: ' + run.out);
  assert.equal(existsSync(queueFile(root)), false);
});

test('fresh JSON without a holder field: no name, still refuses on the mtime', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeFreshLease(root, JSON.stringify({ reason: 'verify', since: today() }) + '\n');

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /GATE_LEASE present/, run.out);
  assert.match(run.out, /holder unnamed/, run.out);
  assert.doesNotMatch(run.out, /queue/, run.out);
});

test('fresh plain-text lease: the first line names the holder', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeFreshLease(root, 'nightly-gate-7\nverify run\n');

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /GATE_LEASE present/, run.out);
  assert.match(run.out, /nightly-gate-7/, run.out);
  assert.doesNotMatch(run.out, /queue/, run.out);
});

test('fresh directory at the lease path: read fails, mtime still decides — refuse', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  mkdirSync(leasePath(root), { recursive: true });

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /GATE_LEASE present/, run.out);
  assert.match(run.out, /holder unnamed/, 'a directory carries no name: ' + run.out);
  assert.doesNotMatch(run.out, /queue/, run.out);
});

test('stale directory at the lease path: the same unreadable file proceeds loudly', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  const dir = leasePath(root);
  mkdirSync(dir, { recursive: true });
  const when = new Date(Date.now() - (LEASE_MAX_AGE_MS + 60 * 1000));
  utimesSync(dir, when, when);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /WARN stale GATE_LEASE/, run.out);
  assert.match(run.out, /disregarding it and proceeding/, run.out);
  assert.match(run.out, /queue/, run.out);
});

test('stale malformed lease: bad contents plus old mtime still proceeds loudly', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeStaleLease(root, '{{{not json{{{\n');

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /WARN stale GATE_LEASE/, run.out);
  assert.match(run.out, /queue/, run.out);
  assert.equal(existsSync(queueFile(root)), true);
});

test('future mtime: a touch ahead of the wall time is fresh, and still ages out on its own', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  // mtime one minute ahead: age starts negative, which is under the max.
  writeLease(root, leaseBody(), -60 * 1000);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /GATE_LEASE present/, run.out);
  assert.doesNotMatch(run.out, /queue/, 'a future touch is a live lease, not a stale one: ' + run.out);

  const seen = checkLease(root);
  assert.equal(seen.state, 'fresh');
});

test('STOP plus a fresh lease: STOP is the visible reason, the lease never hides it', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeFileSync(join(root, 'STOP'), 'maintainer brake\n', 'utf8');
  writeFreshLease(root);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /STOP file present/, run.out);
  assert.doesNotMatch(run.out, /GATE_LEASE/, 'the lease check runs only after STOP had its turn: ' + run.out);
  assert.doesNotMatch(run.out, /queue/, run.out);
});

// ---------------------------------------------------------------------------
// The arithmetic, pinned: the boundary is strict and counted in milliseconds.
// A sweep that only ever tried "long ago" versus "just now" would pass with
// the units wrong (minutes read as milliseconds) or the comparison flipped.
// ---------------------------------------------------------------------------

test('boundary arithmetic: at the max age it is fresh; one millisecond past it is stale', () => {
  const nowMs = 1_720_000_000_000;
  const atMax = checkLease(tmpdir(), {
    nowMs,
    statSyncImpl: () => ({ mtimeMs: nowMs - LEASE_MAX_AGE_MS }),
    readFileSyncImpl: () => leaseBody(),
  });
  assert.equal(atMax.state, 'fresh', 'age equal to the max is still a live lease');

  const pastMax = checkLease(tmpdir(), {
    nowMs,
    statSyncImpl: () => ({ mtimeMs: nowMs - LEASE_MAX_AGE_MS - 1 }),
    readFileSyncImpl: () => leaseBody(),
  });
  assert.equal(pastMax.state, 'stale', 'age one millisecond past the max is ignored');
  assert.ok(pastMax.ageMs > LEASE_MAX_AGE_MS);
});

test('timing read that fails is never a refusal: it proceeds loudly', () => {
  const denied = checkLease(tmpdir(), {
    statSyncImpl: () => {
      throw Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' });
    },
  });
  assert.equal(denied.state, 'stat-failed');

  const noMtime = checkLease(tmpdir(), {
    statSyncImpl: () => ({}),
  });
  assert.equal(noMtime.state, 'stat-failed');

  const missing = checkLease(tmpdir(), {
    statSyncImpl: () => {
      throw Object.assign(new Error('ENOENT: no such file'), { code: 'ENOENT' });
    },
  });
  assert.equal(missing.state, 'absent');
});

test('holder naming: JSON holder wins, plain text falls back, anything else is unnamed', () => {
  assert.equal(holderFromLeaseText(leaseBody('job-42')), 'job-42');
  assert.equal(holderFromLeaseText(JSON.stringify({ job: 'job-43' })), 'job-43');
  assert.equal(holderFromLeaseText('plain-holder\nmore lines\n'), 'plain-holder');
  assert.equal(holderFromLeaseText(''), null);
  assert.equal(holderFromLeaseText('   \n  \n'), null);
  assert.equal(holderFromLeaseText(JSON.stringify({ reason: 'x' })), null);
  assert.equal(holderFromLeaseText(JSON.stringify({ holder: 42 })), null);
  assert.equal(holderFromLeaseText(null), null);
  assert.equal(holderFromLeaseText(undefined), null);
});

test('lease path lives beside STOP and HOLD at the tree root', () => {
  const root = makeRoot([], { publish: false });
  try {
    const p = paths(root);
    assert.equal(p.lease, join(root, 'GATE_LEASE'));
    assert.equal(p.stop, join(root, 'STOP'));
    assert.equal(p.hold, join(root, 'HOLD.md'));
  } finally {
    cleanup(root);
  }
});

test('the shipped guard reads the real file: fresh fixture refuses through checkLease too', () => {
  const root = makeRoot([], { publish: false });
  try {
    writeFreshLease(root);
    const seen = checkLease(root);
    assert.equal(seen.state, 'fresh');
    assert.equal(seen.holder, HOLDER);
    assert.ok(seen.ageMs >= 0 && seen.ageMs < LEASE_MAX_AGE_MS);
  } finally {
    cleanup(root);
  }
});

// ---------------------------------------------------------------------------
// Round 2: the range ends. Row 11 was tested one minute ahead, at the near
// end of a range that runs to a decade. The repair bounds every refuse to
// at most max plus tolerance from now; beyond tolerance a future mtime is
// disregarded loudly on clock skew, under a line distinct from the aged-out
// one. Live runs below use margins clear of spawn delay (30s inside, 90s
// outside) with exact edges pinned.
// ---------------------------------------------------------------------------

test('within tolerance: 30s ahead still refuses as a live lease', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeLease(root, leaseBody(), -30 * 1000);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /GATE_LEASE present/, run.out);
  assert.match(run.out, new RegExp(HOLDER), run.out);
  assert.doesNotMatch(run.out, /WARN future GATE_LEASE/, run.out);
  assert.doesNotMatch(run.out, /queue/, run.out);
  assert.equal(existsSync(queueFile(root)), false);
  assert.equal(checkLease(root).state, 'fresh');
});

test('beyond tolerance: 90s ahead proceeds loudly on clock skew', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeLease(root, leaseBody(), -90 * 1000);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /WARN future GATE_LEASE/, run.out);
  assert.match(run.out, new RegExp(HOLDER), run.out);
  assert.match(run.out, /ahead of now, beyond tolerance/, run.out);
  assert.match(run.out, /disregarding it and proceeding/, run.out);
  assert.doesNotMatch(run.out, /GATE_LEASE present/, run.out);
  assert.match(run.out, /queue/, run.out);
  assert.equal(existsSync(queueFile(root)), true);
  assert.equal(checkLease(root).state, 'future');
});

test('one hour ahead: refuses nothing, proceeds as future', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeLease(root, leaseBody(), -3600 * 1000);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /WARN future GATE_LEASE/, run.out);
  assert.match(run.out, /queue/, run.out);
  assert.equal(checkLease(root).state, 'future');
});

test('one day ahead: refuses nothing, proceeds as future', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeLease(root, leaseBody(), -24 * 3600 * 1000);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /WARN future GATE_LEASE/, run.out);
  assert.match(run.out, /queue/, run.out);
  assert.equal(checkLease(root).state, 'future');
});

test('ten years ahead, the threatening end: proceeds as future', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  const tenYearsMs = 10 * 365 * 24 * 3600 * 1000;
  writeLease(root, leaseBody(), -tenYearsMs);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /WARN future GATE_LEASE/, run.out);
  assert.match(run.out, /beyond tolerance 60s/, run.out);
  assert.match(run.out, /queue/, run.out);
  assert.equal(existsSync(queueFile(root)), true);
  const seen = checkLease(root);
  assert.equal(seen.state, 'future');
  assert.ok(seen.ageMs < -LEASE_FUTURE_TOLERANCE_MS);
});

test('tolerance edge pinned: at tolerance fresh, one millisecond beyond future', () => {
  const nowMs = 1_720_000_000_000;
  const atTol = checkLease(tmpdir(), {
    nowMs,
    statSyncImpl: () => ({ mtimeMs: nowMs + LEASE_FUTURE_TOLERANCE_MS }),
    readFileSyncImpl: () => leaseBody(),
  });
  assert.equal(atTol.state, 'fresh', 'age equal to negative tolerance is still live');

  const pastTol = checkLease(tmpdir(), {
    nowMs,
    statSyncImpl: () => ({ mtimeMs: nowMs + LEASE_FUTURE_TOLERANCE_MS + 1 }),
    readFileSyncImpl: () => leaseBody(),
  });
  assert.equal(pastTol.state, 'future', 'one millisecond beyond tolerance is skew');
  assert.ok(pastTol.ageMs < -LEASE_FUTURE_TOLERANCE_MS);
});

test('a newly written lease refuses for exactly the max, then turns stale', () => {
  const nowMs = 1_720_000_000_000;
  const mtimeMs = nowMs;
  const atWrite = checkLease(tmpdir(), {
    nowMs,
    statSyncImpl: () => ({ mtimeMs }),
    readFileSyncImpl: () => leaseBody(),
  });
  assert.equal(atWrite.state, 'fresh');
  const atMax = checkLease(tmpdir(), {
    nowMs: nowMs + LEASE_MAX_AGE_MS,
    statSyncImpl: () => ({ mtimeMs }),
    readFileSyncImpl: () => leaseBody(),
  });
  assert.equal(atMax.state, 'fresh', 'age equal to max is still live');
  const pastMax = checkLease(tmpdir(), {
    nowMs: nowMs + LEASE_MAX_AGE_MS + 1,
    statSyncImpl: () => ({ mtimeMs }),
    readFileSyncImpl: () => leaseBody(),
  });
  assert.equal(pastMax.state, 'stale', 'one millisecond later it is ignored');
});

test('ten years old: still stale, never future', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  const tenYearsMs = 10 * 365 * 24 * 3600 * 1000;
  writeLease(root, leaseBody(), tenYearsMs + LEASE_MAX_AGE_MS);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /WARN stale GATE_LEASE/, run.out);
  assert.doesNotMatch(run.out, /WARN future GATE_LEASE/, run.out);
  assert.match(run.out, /queue/, run.out);
  assert.equal(checkLease(root).state, 'stale');
});

test('size range: one megabyte of garbage still refuses on the mtime', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeFreshLease(root, 'x'.repeat(1024 * 1024));

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /GATE_LEASE present/, run.out);
  assert.doesNotMatch(run.out, /queue/, run.out);
  assert.equal(checkLease(root).state, 'fresh');
});

test('holder length range: a 5000-char holder is truncated to 120 and still refuses', async (t) => {
  const longHolder = 'h'.repeat(5000);
  assert.equal(holderFromLeaseText(JSON.stringify({ holder: longHolder })).length, 120);
  assert.equal(holderFromLeaseText(longHolder + '\nmore\n').length, 120);

  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeFreshLease(root, JSON.stringify({ holder: longHolder }));

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /GATE_LEASE present/, run.out);
  assert.doesNotMatch(run.out, /queue/, run.out);
  assert.equal(checkLease(root).holder.length, 120);
});

test('line-count range: a thousand plain-text lines still name the first one', () => {
  const lines = ['first-holder', ...Array.from({ length: 1000 }, (_, i) => `line-${i}`)].join('\n') + '\n';
  assert.equal(holderFromLeaseText(lines), 'first-holder');
  const longFirst = 'k'.repeat(5000) + '\nsecond\n';
  assert.equal(holderFromLeaseText(longFirst).length, 120);
});
