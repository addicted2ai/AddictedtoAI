/**
 * Tests for require-gate-record.mjs, the pre-push receipt check.
 *
 * Every fixture is a throwaway evidence tree under the OS temp directory;
 * none touches this repository. Shapes mirror the banked
 * `gate-run-<localdate>-<sha>/summary.txt` form: a `pin` line plus six
 * `<n>-<gate> EXIT=<code>` lines.
 *
 * Arms:
 *   1. green on the good shape.
 *   2. red when no directory matches.
 *   3. red on a nonzero recorded exit, naming the gate.
 *   4. red on a pin mismatch, naming it.
 *   5. red when one gate line is absent.
 *   6. mutation: a checker that looks only at exits would let arm 4 pass;
 *      the real checker does not — so a pin-ignoring mutation is caught.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { checkGateRecord, parseSummary } from '../require-gate-record.mjs';

const PIN = 'abc1234';
const OTHER = 'def5678';

function goodSummary(pin) {
  return [
    `gate-run 2026-09-10 ${pin}`,
    `pin ${pin}`,
    `short ${pin}`,
    'date 2026-09-10 (machine-local)',
    `gating HEAD ${pin} at 10:00:00`,
    '1-test EXIT=0 10s duration_ms=10000',
    '1-test counts: 5 passed',
    '2-build EXIT=0 5s duration_ms=5000',
    '3-launch EXIT=0 5s duration_ms=5000',
    '4-design EXIT=0 5s duration_ms=5000',
    '5-surfaces EXIT=0 5s duration_ms=5000',
    '6-analytics EXIT=0 5s duration_ms=5000',
    `ALL SIX GATES GREEN at ${pin}`,
    `pin OK: pinned and HEAD agree at ${pin}`,
    '',
  ].join('\n');
}

function writeRecord(root, pin, text) {
  const name = `gate-run-2026-09-10-${pin}`;
  mkdirSync(join(root, name), { recursive: true });
  writeFileSync(join(root, name, 'summary.txt'), text, 'utf8');
  return join(root, name, 'summary.txt');
}

test('GREEN: a receipt with matching pin and six zero exits passes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gate-require-green-'));
  try {
    writeRecord(dir, PIN, goodSummary(PIN));
    const v = checkGateRecord(dir, PIN);
    assert.equal(v.ok, true, `expected green, got: ${v.reasons.join('; ')}`);
    assert.deepEqual(Object.keys(v.exits).sort(), ['analytics', 'build', 'design', 'launch', 'surfaces', 'test']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('RED: no matching directory names what is missing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gate-require-missing-'));
  try {
    const v = checkGateRecord(dir, PIN);
    assert.equal(v.ok, false);
    assert.match(v.reasons.join('\n'), /no evidence\/gate-run-\*-abc1234\/summary\.txt/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('RED: a nonzero recorded exit names the gate', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gate-require-exit-'));
  try {
    const bad = goodSummary(PIN).replace('3-launch EXIT=0', '3-launch EXIT=1');
    writeRecord(dir, PIN, bad);
    const v = checkGateRecord(dir, PIN);
    assert.equal(v.ok, false);
    assert.match(v.reasons.join('\n'), /launch exit 1/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('RED: a recorded pin that differs from the request is refused', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gate-require-pin-'));
  try {
    writeRecord(dir, PIN, goodSummary(OTHER));
    const v = checkGateRecord(dir, PIN);
    assert.equal(v.ok, false);
    assert.match(v.reasons.join('\n'), /pin mismatch/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('RED: a receipt with one gate line absent names the missing gate', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gate-require-absent-'));
  try {
    const short = goodSummary(PIN).split('\n').filter((l) => !l.startsWith('5-surfaces EXIT')).join('\n');
    writeRecord(dir, PIN, short);
    const v = checkGateRecord(dir, PIN);
    assert.equal(v.ok, false);
    assert.match(v.reasons.join('\n'), /missing exit for surfaces/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('mutation: a checker that ignores the pin would let the mismatch pass', () => {
  // The in-memory mutation: exits-only logic, pin unread.
  const buggyOk = (exits) => Object.values(exits).every((c) => c === 0);
  const { pin, exits } = parseSummary(goodSummary(OTHER));
  assert.equal(buggyOk(exits), true, 'the mutated checker sees only green exits');
  const dir = mkdtempSync(join(tmpdir(), 'gate-require-mut-'));
  try {
    writeRecord(dir, PIN, goodSummary(OTHER));
    const real = checkGateRecord(dir, PIN);
    assert.equal(real.ok, false, 'the real checker still refuses on the pin');
    assert.notEqual(pin, PIN);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('GREEN: a full-sha request matches a short-suffix receipt dir (F1)', () => {
  // Receipt dirs carry the 7-char short sha; callers pass git rev-parse HEAD.
  const dir = mkdtempSync(join(tmpdir(), 'gate-require-full-'));
  try {
    writeRecord(dir, PIN, goodSummary(PIN));
    const full = `${PIN}89abcdef0123456789abcdef012345678`; // 40 hex chars, PIN-prefixed
    assert.equal(full.length, 40);
    const v = checkGateRecord(dir, full);
    assert.equal(v.ok, true, `full-sha request must reach the pin comparison, got: ${v.reasons.join('; ')}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
