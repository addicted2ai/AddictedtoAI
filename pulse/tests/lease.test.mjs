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
// Round 4 instrument: pin the whole observable, not a substring of it.
//
// A check that asserts a substring is blind to everything else on the line,
// so the cheapest attack is addition and never alteration. Each live trial
// below therefore asserts the complete lease-related output of the run:
//
// - gateLines: lines containing GATE_LEASE (case-sensitive token). Refusals
//   print exactly one; stale and stat-failed print exactly one WARN line;
//   absent and STOP print none.
// - leaseWordLines: lines matching /lease/i (any case). Absent and STOP must
//   print none in any case, so a lowercase paraphrase cannot hide.
// - For refusals (fresh, future) the whole stdout is one line, so any extra
//   line in any wording fails the single-line assert.
// - For proceeds (stale, stat-failed) the WARN line itself is pinned whole
//   (^...$ with narrow slots), so any same-line addition fails.
//
// Variable slots use the narrowest shape that admits true variation:
// path is exact (we know the root), holder is exact (we wrote it), age and
// ahead magnitudes use \d+ shapes (seconds vs minutes kinds), max and
// tolerance stay literal (900s, 60s) so value drift fails. A permissive
// placeholder would give the check back its blindness where an attacker
// would put a sentence.
// ---------------------------------------------------------------------------

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function gateLines(out) {
  return out.split('\n').filter((l) => l.includes('GATE_LEASE'));
}

function leaseWordLines(out) {
  return out.split('\n').filter((l) => /lease/i.test(l));
}

function nonEmptyLines(out) {
  return out.split('\n').filter((l) => l.trim() !== '');
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
  // Whole-output pin: the complete lease-related output is the empty set.
  // gateLines (GATE_LEASE token) is the strongest form this check ever had;
  // leaseWordLines (any case) closes the lowercase paraphrase
  // `pulse: no gate lease today, proceeding.` that defeated the token match.
  assert.deepEqual(gateLines(run.out), [], 'no GATE_LEASE line on the ordinary path: ' + run.out);
  assert.deepEqual(leaseWordLines(run.out), [], 'no lease word in any case on the ordinary path: ' + run.out);
  assert.equal(existsSync(queueFile(root)), true, 'derived state was written');
});

test('fresh lease: the Pulse refuses, names the holder, exits 0, writes nothing', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeFreshLease(root);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, 'a refused Pulse is an instruction obeyed, not an error: ' + run.out);
  // Whole-line pin: the complete lease-related output is exactly this line.
  // Narrow slots: path exact, age shape \d+s (spawn may read 59-61s), holder
  // exact. Same-line additions such as `Exiting immediately like STOP; clear
  // STOP to proceed.` fail the ^...$ match by construction.
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, 'fresh refusal prints exactly one GATE_LEASE line: ' + run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE present at ${escapeRegExp(leasePath(root))} \\(age \\d+s, holder ${escapeRegExp(HOLDER)}\\) — a gate run holds the tree, refusing this run, nothing done\\.$`), 'whole fresh line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, 'a refused run prints nothing else, so a separate-line addition fails too: ' + run.out);
  assert.equal(leaseWordLines(run.out).length, 1, 'exactly one lease-word line: ' + run.out);
  assert.doesNotMatch(run.out, /STOP file present/, 'the refusal must not read like STOP');
  assert.equal(existsSync(queueFile(root)), false, 'no derived state was written under a live gate run');
  assert.equal(existsSync(leasePath(root)), true, 'the Pulse never removes the lease');
});

test('stale lease: the Pulse proceeds loudly, naming the file, the age and the disregard', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeStaleLease(root);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  // Whole-line pin: the complete stale lease output is exactly this WARN line.
  // Narrow slots: path exact, age shape \d+s, max literal 900s, holder exact.
  // Same-line addition `This is routine, no action needed.` fails ^...$ by
  // construction. leaseWordLines length 1 closes a separate lowercase lease
  // line; a separate non-lease line is outside lease-related output by design.
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, 'stale prints exactly one GATE_LEASE line: ' + run.out);
  assert.match(gl[0], new RegExp(`^pulse: WARN stale GATE_LEASE at ${escapeRegExp(leasePath(root))} \\(age \\d+s exceeds max 900s\\) — disregarding it and proceeding; holder ${escapeRegExp(HOLDER)} may have died without releasing\\.$`), 'whole stale line: ' + run.out);
  assert.equal(leaseWordLines(run.out).length, 1, 'exactly one lease-word line on the stale path: ' + run.out);
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
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, 'fresh empty prints one GATE_LEASE line: ' + run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE present at ${escapeRegExp(leasePath(root))} \\(age \\d+s, holder unnamed\\) — a gate run holds the tree, refusing this run, nothing done\\.$`), 'whole fresh-empty line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);
  assert.equal(existsSync(queueFile(root)), false);
});

test('fresh garbage lease: unparseable contents never throw and never read as absent', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeFreshLease(root, '{{{not json{{{\n');

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, 'fresh garbage prints one GATE_LEASE line: ' + run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE present at ${escapeRegExp(leasePath(root))} \\(age \\d+s, holder ${escapeRegExp('{{{not json{{{')}\\) — a gate run holds the tree, refusing this run, nothing done\\.$`), 'whole fresh-garbage line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);
  assert.equal(existsSync(queueFile(root)), false);
});

test('fresh JSON without a holder field: no name, still refuses on the mtime', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeFreshLease(root, JSON.stringify({ reason: 'verify', since: today() }) + '\n');

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE present at ${escapeRegExp(leasePath(root))} \\(age \\d+s, holder unnamed\\) — a gate run holds the tree, refusing this run, nothing done\\.$`), 'whole line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);
});

test('fresh plain-text lease: the first line names the holder', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeFreshLease(root, 'nightly-gate-7\nverify run\n');

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE present at ${escapeRegExp(leasePath(root))} \\(age \\d+s, holder nightly-gate-7\\) — a gate run holds the tree, refusing this run, nothing done\\.$`), 'whole line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);
});

test('fresh directory at the lease path: read fails, mtime still decides — refuse', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  mkdirSync(leasePath(root), { recursive: true });

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE present at ${escapeRegExp(leasePath(root))} \\(age \\d+s, holder unnamed\\) — a gate run holds the tree, refusing this run, nothing done\\.$`), 'whole line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);
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
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: WARN stale GATE_LEASE at ${escapeRegExp(leasePath(root))} \\(age \\d+s exceeds max 900s\\) — disregarding it and proceeding; holder unnamed may have died without releasing\\.$`), 'whole stale-directory line: ' + run.out);
  assert.equal(leaseWordLines(run.out).length, 1, run.out);
  assert.match(run.out, /queue/, run.out);
});

test('stale malformed lease: bad contents plus old mtime still proceeds loudly', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeStaleLease(root, '{{{not json{{{\n');

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: WARN stale GATE_LEASE at ${escapeRegExp(leasePath(root))} \\(age \\d+s exceeds max 900s\\) — disregarding it and proceeding; holder ${escapeRegExp('{{{not json{{{')} may have died without releasing\\.$`), 'whole stale-malformed line: ' + run.out);
  assert.equal(leaseWordLines(run.out).length, 1, run.out);
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
  // Within tolerance the reader reports fresh; the guard clamps negative age
  // to 0s for display, so this line is literally age 0s.
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE present at ${escapeRegExp(leasePath(root))} \\(age 0s, holder ${escapeRegExp(HOLDER)}\\) — a gate run holds the tree, refusing this run, nothing done\\.$`), 'whole line at tolerance passage: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);

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
  // Whole-output pin: the complete run output is exactly the STOP line.
  // gateLines empty closes GATE_LEASE; leaseWordLines empty in any case
  // closes `(a lease is also present, ignored)` that defeated the token match.
  assert.match(nonEmptyLines(run.out)[0] ?? '', new RegExp(`^pulse: STOP file present at ${escapeRegExp(join(root, 'STOP'))} — exiting immediately, nothing done\\.$`), 'whole STOP line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, 'STOP prints nothing else: ' + run.out);
  assert.deepEqual(gateLines(run.out), [], 'the lease check runs only after STOP had its turn: ' + run.out);
  assert.deepEqual(leaseWordLines(run.out), [], 'no lease word in any case beside STOP: ' + run.out);
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
  // Within tolerance the guard prints the fresh refusal with age clamped to 0s.
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE present at ${escapeRegExp(leasePath(root))} \\(age 0s, holder ${escapeRegExp(HOLDER)}\\) — a gate run holds the tree, refusing this run, nothing done\\.$`), 'whole line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);
  assert.equal(existsSync(queueFile(root)), false);
  assert.equal(checkLease(root).state, 'fresh');
});

test('beyond tolerance: 90s ahead refuses as future under its own line', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeLease(root, leaseBody(), -90 * 1000);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  // Whole-line pin with narrow seconds shape \d+s: 89s and 90s both satisfy
  // (spawn may shave one second past the rounding half-second, 1 in ~15 runs),
  // while 2m 30s does not. Tolerance stays literal 60s so drift fails.
  // Same-line addition `If it keeps firing, bump the tolerance band until it
  // stops.` fails ^...$ by construction; conditional remedy
  // `In practice just delete it even while a gate is running; the check is
  // advisory.` fails the same way.
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, 'future prints exactly one GATE_LEASE line: ' + run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE future at ${escapeRegExp(leasePath(root))} \\(mtime \\d+s ahead of now, beyond tolerance 60s, holder ${escapeRegExp(HOLDER)}\\) — a gate run with a fast writer clock may hold the tree, refusing this run, nothing done\\. Delete the file only when no gate run is active, or correct the writer clock\\.$`), 'whole future-seconds line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, 'refusal prints nothing else: ' + run.out);
  assert.equal(existsSync(queueFile(root)), false, 'nothing is written under a future lease');
  assert.equal(checkLease(root).state, 'future');
  assert.equal(checkLease(root).path, leasePath(root), 'the future return carries the lease path');
});

test('one hour ahead: refuses as future, nothing written', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeLease(root, leaseBody(), -3600 * 1000);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  // Narrow shapes for the hour boundary: 3600s sits on the minutes/hours edge,
  // so spawn may render 59m 59s or 1h 0m. Both satisfy the alternation; raw
  // seconds or days do not. Proves the hour renders in larger units.
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE future at ${escapeRegExp(leasePath(root))} \\(mtime (?:\\d+m \\d+s|\\d+h \\d+m) ahead of now, beyond tolerance 60s, holder ${escapeRegExp(HOLDER)}\\) — a gate run with a fast writer clock may hold the tree, refusing this run, nothing done\\. Delete the file only when no gate run is active, or correct the writer clock\\.$`), 'whole future-hour line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);
  assert.equal(existsSync(queueFile(root)), false);
  assert.equal(checkLease(root).state, 'future');
});

test('one day ahead: refuses as future, nothing written', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeLease(root, leaseBody(), -24 * 3600 * 1000);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  // Day boundary: 86400s may render 23h 59m or 1d 0h across spawn. Both satisfy;
  // seconds or years do not.
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE future at ${escapeRegExp(leasePath(root))} \\(mtime (?:\\d+h \\d+m|\\d+d \\d+h) ahead of now, beyond tolerance 60s, holder ${escapeRegExp(HOLDER)}\\) — a gate run with a fast writer clock may hold the tree, refusing this run, nothing done\\. Delete the file only when no gate run is active, or correct the writer clock\\.$`), 'whole future-day line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);
  assert.equal(existsSync(queueFile(root)), false);
  assert.equal(checkLease(root).state, 'future');
});

test('ten years ahead, the threatening end: refuses as future', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  const tenYearsMs = 10 * 365 * 24 * 3600 * 1000;
  writeLease(root, leaseBody(), -tenYearsMs);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE future at ${escapeRegExp(leasePath(root))} \\(mtime 10y 0d ahead of now, beyond tolerance 60s, holder ${escapeRegExp(HOLDER)}\\) — a gate run with a fast writer clock may hold the tree, refusing this run, nothing done\\. Delete the file only when no gate run is active, or correct the writer clock\\.$`), 'ten years renders in years, not 315360000s: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);
  assert.equal(existsSync(queueFile(root)), false);
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
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: WARN stale GATE_LEASE at ${escapeRegExp(leasePath(root))} \\(age \\d+s exceeds max 900s\\) — disregarding it and proceeding; holder ${escapeRegExp(HOLDER)} may have died without releasing\\.$`), 'whole stale-decade line: ' + run.out);
  assert.equal(leaseWordLines(run.out).length, 1, run.out);
  assert.match(run.out, /queue/, run.out);
  assert.equal(checkLease(root).state, 'stale');
});

test('size range: one megabyte of garbage still refuses on the mtime', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeFreshLease(root, 'x'.repeat(1024 * 1024));

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE present at ${escapeRegExp(leasePath(root))} \\(age \\d+s, holder ${escapeRegExp('x'.repeat(120))}\\) — a gate run holds the tree, refusing this run, nothing done\\.$`), 'whole line with truncated garbage holder: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);
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
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE present at ${escapeRegExp(leasePath(root))} \\(age \\d+s, holder ${escapeRegExp('h'.repeat(120))}\\) — a gate run holds the tree, refusing this run, nothing done\\.$`), 'whole line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);
  assert.equal(checkLease(root).holder.length, 120);
});

test('line-count range: a thousand plain-text lines still name the first one', () => {
  const lines = ['first-holder', ...Array.from({ length: 1000 }, (_, i) => `line-${i}`)].join('\n') + '\n';
  assert.equal(holderFromLeaseText(lines), 'first-holder');
  const longFirst = 'k'.repeat(5000) + '\nsecond\n';
  assert.equal(holderFromLeaseText(longFirst).length, 120);
});

// ---------------------------------------------------------------------------
// Round 3: the future arm refuses. The four beyond-tolerance trials above now
// refuse under their own line; the pins below keep the constants honest. A
// computed edge fixture proves the comparison is strict; a literal value pin
// proves the number has not drifted. The file needs both.
// ---------------------------------------------------------------------------

test('value pin: the stale line names the max as 900s literally', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeStaleLease(root);

  const run = await runPulse(root, ARGS);
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: WARN stale GATE_LEASE at ${escapeRegExp(leasePath(root))} \\(age \\d+s exceeds max 900s\\) — disregarding it and proceeding; holder ${escapeRegExp(HOLDER)} may have died without releasing\\.$`), 'multiplying LEASE_MAX_AGE_MS by ten must fail here: ' + run.out);
});

test('value pin: a fixed 960s-old lease is stale without naming the constant', async (t) => {
  // 960000ms is a literal past the current 900000ms max, not an expression
  // built from it. If the max grows tenfold this lease is fresh again and
  // the run refuses, so the suite fails until a person edits this number
  // with eyes open. That conscious edit is the point.
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeLease(root, leaseBody(), 960000);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: WARN stale GATE_LEASE at ${escapeRegExp(leasePath(root))} \\(age \\d+s exceeds max 900s\\) — disregarding it and proceeding; holder ${escapeRegExp(HOLDER)} may have died without releasing\\.$`), 'whole line: ' + run.out);
  assert.equal(leaseWordLines(run.out).length, 1, run.out);
  assert.match(run.out, /queue/, run.out);
  assert.equal(checkLease(root).state, 'stale');
});

test('non-finite mtime never decides: positive and negative infinity read as stat-failed', () => {
  const nowMs = 1_720_000_000_000;
  for (const mtimeMs of [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    const seen = checkLease(tmpdir(), {
      nowMs,
      statSyncImpl: () => ({ mtimeMs }),
      readFileSyncImpl: () => leaseBody(),
    });
    assert.equal(seen.state, 'stat-failed', `mtime ${String(mtimeMs)} must not decide`);
  }
});

test('future return carries the lease path for its own line', () => {
  const nowMs = 1_720_000_000_000;
  const seen = checkLease(tmpdir(), {
    nowMs,
    statSyncImpl: () => ({ mtimeMs: nowMs + LEASE_FUTURE_TOLERANCE_MS + 1000 }),
    readFileSyncImpl: () => leaseBody(),
  });
  assert.equal(seen.state, 'future');
  assert.ok(typeof seen.path === 'string' && seen.path.length > 0, 'path must be present');
  assert.equal(seen.path, paths(tmpdir()).lease, 'path must be the lease path, or the guard prints undefined');
});

test('non-finite injected timepiece refuses: NaN lands on fresh', () => {
  // Refusing is the safe direction when the timepiece cannot be read, not a
  // measurement of anything: a run that cannot tell the age must not
  // rewrite under a gate that may be live.
  const mtimeMs = 1_720_000_000_000;
  const seenNaN = checkLease(tmpdir(), {
    nowMs: Number.NaN,
    statSyncImpl: () => ({ mtimeMs }),
    readFileSyncImpl: () => leaseBody(),
  });
  assert.equal(seenNaN.state, 'fresh', 'NaN nowMs must refuse, not proceed');
  const seenNegInf = checkLease(tmpdir(), {
    nowMs: Number.NEGATIVE_INFINITY,
    statSyncImpl: () => ({ mtimeMs }),
    readFileSyncImpl: () => leaseBody(),
  });
  assert.equal(seenNegInf.state, 'future', 'negative-infinite nowMs must refuse as future');
});

test('display threshold, below: 100s ahead renders as seconds and refuses', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeLease(root, leaseBody(), -100 * 1000);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  // Narrow seconds shape: 99s and 100s both satisfy (spawn may shave one),
  // 2m 30s does not. Tolerance literal 60s.
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE future at ${escapeRegExp(leasePath(root))} \\(mtime \\d+s ahead of now, beyond tolerance 60s, holder ${escapeRegExp(HOLDER)}\\) — a gate run with a fast writer clock may hold the tree, refusing this run, nothing done\\. Delete the file only when no gate run is active, or correct the writer clock\\.$`), 'whole future-seconds line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);
  assert.equal(existsSync(queueFile(root)), false);
});

test('display threshold, above: 150s ahead renders in minutes and refuses', async (t) => {
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeLease(root, leaseBody(), -150 * 1000);

  const run = await runPulse(root, ARGS);
  assert.equal(run.status, 0, run.out);
  // Narrow minutes shape: 2m 29s, 2m 30s and 2m 31s all satisfy; 150s does not.
  const gl = gateLines(run.out);
  assert.equal(gl.length, 1, run.out);
  assert.match(gl[0], new RegExp(`^pulse: GATE_LEASE future at ${escapeRegExp(leasePath(root))} \\(mtime \\d+m \\d+s ahead of now, beyond tolerance 60s, holder ${escapeRegExp(HOLDER)}\\) — a gate run with a fast writer clock may hold the tree, refusing this run, nothing done\\. Delete the file only when no gate run is active, or correct the writer clock\\.$`), 'whole future-minutes line: ' + run.out);
  assert.equal(nonEmptyLines(run.out).length, 1, run.out);
  assert.equal(existsSync(queueFile(root)), false);
});

test('future refusal remedy reason documents why raising wording is forbidden (documentation, not coverage)', async (t) => {
  // DOCUMENTATION WITH A TRIGGER, not coverage. The whole-line pins above
  // (90s, 100s, 150s, hour, day, decade) already prove the line is exactly the
  // shipped refusal; any added sentence fails those ^...$ matches whether or
  // not it contains these substrings. This check carries the REASON the line
  // must not say that — widening the band until the guard stops speaking
  // silences it permanently, while deleting an abandoned file when nothing
  // holds the tree is maintenance — which a whole-line pin cannot express.
  // Do not count this a second time as coverage.
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  writeLease(root, leaseBody(), -90 * 1000);

  const run = await runPulse(root, ARGS);
  assert.match(run.out, /GATE_LEASE future/, run.out);
  assert.doesNotMatch(run.out, /rais/i, 'no remedy may point at the tolerance: ' + run.out);
  assert.doesNotMatch(run.out, /widen/i, run.out);
  assert.doesNotMatch(run.out, /increas/i, run.out);
});

// ---------------------------------------------------------------------------
// Round 4 additions: the display edge at its value, the renewal pair that
// documents a hole, and the stat-failed guard pinned by source where no live
// timing failure can be built on this machine.
// ---------------------------------------------------------------------------

test('display edge pinned exactly: 119 renders seconds, 120 and 121 render minutes (helper reached via source read)', () => {
  // How the helper was reached: importing pulse/run.mjs would execute the
  // Pulse (top-level await runs the pipeline), so this trial reads its source,
  // extracts LEASE_AHEAD_DISPLAY_THRESHOLD_S and formatAheadDuration by a
  // balanced-brace scan, and evaluates the shipped bytes. A threshold drift to
  // 1200 makes 120 render 120s instead of 2m 0s and fails; a rendering flip
  // fails the same way.
  const src = readFileSync(new URL('../run.mjs', import.meta.url), 'utf8');
  const threshMatch = /LEASE_AHEAD_DISPLAY_THRESHOLD_S\s*=\s*(\d+)/.exec(src);
  assert.ok(threshMatch, 'threshold literal present in shipped source');
  assert.equal(threshMatch[1], '120', 'display threshold is 120s literally');
  const threshold = Number(threshMatch[1]);
  const fnAt = src.indexOf('function formatAheadDuration');
  assert.ok(fnAt >= 0, 'helper present in shipped source');
  const braceAt = src.indexOf('{', fnAt);
  let depth = 0;
  let end = -1;
  for (let i = braceAt; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  assert.ok(end > braceAt, 'balanced close found');
  const fnText = src.slice(fnAt, end + 1);
  const factory = new Function('LEASE_AHEAD_DISPLAY_THRESHOLD_S', `${fnText}; return formatAheadDuration;`);
  const format = factory(threshold);
  assert.equal(format(119), '119s', 'below renders seconds');
  assert.equal(format(120), '2m 0s', 'at renders minutes');
  assert.equal(format(121), '2m 1s', 'above renders minutes');
});

test('renewal pair documents a hole it cannot close: 14m refuses, 16m proceeds loudly, retouched to 60s refuses again', async (t) => {
  // This trial pins behaviour across time and makes the sequence visible in
  // the suite instead of in a paragraph nobody opens. It does NOT close the
  // hole, because correctness there lives in touch discipline outside this
  // repository, and the name and this comment both say so. A live holder that
  // runs twenty minutes without touching is overlapped at minute sixteen with
  // every trial green. A trial named for a property it does not hold is the
  // defect this whole round is about.
  const root = makeRoot([], { publish: false });
  t.after(() => cleanup(root));
  const file = leasePath(root);
  writeFileSync(file, leaseBody(), 'utf8');

  const touchAgo = (msAgo) => {
    const when = new Date(Date.now() - msAgo);
    utimesSync(file, when, when);
  };

  touchAgo(14 * 60 * 1000);
  const first = await runPulse(root, ARGS);
  assert.equal(first.status, 0, first.out);
  const g1 = gateLines(first.out);
  assert.equal(g1.length, 1, '14m refuses with one GATE_LEASE line: ' + first.out);
  assert.match(g1[0], new RegExp(`^pulse: GATE_LEASE present at ${escapeRegExp(file)} \\(age \\d+s, holder ${escapeRegExp(HOLDER)}\\) — a gate run holds the tree, refusing this run, nothing done\\.$`), first.out);
  assert.equal(nonEmptyLines(first.out).length, 1, first.out);
  assert.equal(checkLease(root).state, 'fresh');

  touchAgo(16 * 60 * 1000);
  const second = await runPulse(root, ARGS);
  assert.equal(second.status, 0, second.out);
  const g2 = gateLines(second.out);
  assert.equal(g2.length, 1, '16m proceeds with one WARN stale line: ' + second.out);
  assert.match(g2[0], new RegExp(`^pulse: WARN stale GATE_LEASE at ${escapeRegExp(file)} \\(age \\d+s exceeds max 900s\\) — disregarding it and proceeding; holder ${escapeRegExp(HOLDER)} may have died without releasing\\.$`), second.out);
  assert.equal(leaseWordLines(second.out).length, 1, second.out);
  assert.match(second.out, /queue/, second.out);
  assert.equal(checkLease(root).state, 'stale');

  touchAgo(60 * 1000);
  const third = await runPulse(root, ARGS);
  assert.equal(third.status, 0, third.out);
  const g3 = gateLines(third.out);
  assert.equal(g3.length, 1, 'retouched to 60s refuses again: ' + third.out);
  assert.match(g3[0], new RegExp(`^pulse: GATE_LEASE present at ${escapeRegExp(file)} \\(age \\d+s, holder ${escapeRegExp(HOLDER)}\\) — a gate run holds the tree, refusing this run, nothing done\\.$`), third.out);
  assert.equal(nonEmptyLines(third.out).length, 1, third.out);
  assert.equal(checkLease(root).state, 'fresh');
});

test('stat-failed guard text pins WARN-proceed (gap: no live timing failure inducible on this machine — source pin, not a live run)', () => {
  // FINDING: no live path reaches the shipped stat-failed arm here, so this
  // trial pins the guard action by the closest available means — the shipped
  // source text — with the gap stated in its own name. What is not acceptable
  // is a trial that looks live and injects; this one does neither.
  //
  // Tried under a throwaway root, each with the run output or checkLease as
  // evidence:
  // - file symlink to missing target: setup throws EPERM, symlink creation
  //   not permitted for this user, never reaches any arm.
  // - file symlink self-loop: setup throws EPERM for the same reason.
  // - junction to missing target: setup ok, stat throws ENOENT, checkLease
  //   returns absent, run proceeds silently (different arm).
  // - file-as-parent (file/GATE_LEASE): stat throws ENOENT on Windows, not
  //   ENOTDIR, so absent, not stat-failed.
  // - invalid chars * ? < > in parent: stat throws ENOENT, absent.
  // - reserved CON and NUL parents: stat throws ENOENT, absent.
  // - chmod 000 on file and on directory: stat still ok, checkLease fresh
  //   (Windows does not fail timing reads via permission bits).
  // - 1600-char deep path: stat still ok, fresh (long paths supported).
  // - junction to own parent: stat ok as directory, fresh with holder null.
  // Every attempt landed on absent or fresh, never stat-failed.
  //
  // Closest pin: the shipped guard must contain the stat-failed WARN-proceed
  // arm. Silencing the arm (condition to never) removes the first string and
  // fails; flipping it to refuse forever replaces the WARN text with a refusal
  // and fails the second. Both directions go red, shown in RESULT4 section 8.
  const src = readFileSync(new URL('../run.mjs', import.meta.url), 'utf8');
  assert.match(src, /lease\.state === 'stat-failed'/, 'guard tests stat-failed');
  assert.match(src, /WARN cannot read mtime of GATE_LEASE/, 'guard warns loudly on unreadable timing');
  assert.match(src, /proceeding; refusing on unreadable timing would risk refusing forever/, 'guard proceeds, never refuses, with the reason stated');
});
