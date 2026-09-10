/**
 * Tests for record-gate-run.mjs, the six-gate receipt writer.
 *
 * The real six gates NEVER run here. Every run below uses an INJECTED fake
 * runner (`runAllGatesSerially(gates, fake)`), and every receipt lands in a
 * throwaway tree under the OS temp directory. If this file ever spawns
 * `npm test` or `next build`, that is a defect in the file, not in the
 * machine.
 *
 * Arms:
 *   1. the writer emits a pin line plus six zero exits, green under the
 *      receipt checker (round-trip across the two scripts).
 *   2. the pin check passes on equal pins and fails on moved or empty ones.
 *   3. the injected runner runs all six serially in order, even past a red.
 *   4. the local-date unit returns the machine-local day.
 *   5. the pass-count reader finds the count and admits when it cannot.
 *   6. mutation: a writer that drops one exit line is caught by the checker.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  GATE_ORDER,
  buildSummaryText,
  checkPin,
  localDate,
  parseTestCount,
  runAllGatesSerially,
  writeGateRun,
} from '../record-gate-run.mjs';
import { checkGateRecord } from '../require-gate-record.mjs';

const FULL = 'ab12ab12ab12ab12ab12ab12ab12ab12ab12ab12';
const SHORT = FULL.slice(0, 7);

function fakeRunnerFactory(log, plan) {
  return async (gate) => {
    log.push(gate.name);
    const hit = plan[gate.name] ?? { exit: 0, output: `${gate.name} ok\n5 passed\n` };
    return { exit: hit.exit, durationMs: 1000 + log.length, output: hit.output };
  };
}

function writerInput(results) {
  return {
    pinFull: FULL,
    pinShort: SHORT,
    localDateStr: '2026-09-10',
    repoRoot: 'D:/AddictedtoAI',
    evidenceDir: 'D:/AddictedtoAI/evidence',
    startedLocalTime: '10:00:00',
    results,
    testCount: 1784,
    pinCheck: { ok: true, startPin: FULL, endHead: FULL, why: null },
  };
}

function greenResults() {
  return GATE_ORDER.map((name, i) => ({
    name,
    label: `${i + 1}-${name}`,
    command: name === 'test' ? 'npm test' : `node ${name}`,
    exit: 0,
    durationMs: 1000 * (i + 1),
    output: `${name} ok\n`,
  }));
}

test('writer: pin plus six zero exits round-trips green through the checker', async () => {
  const gates = GATE_ORDER.map((name, i) => ({ name, label: `${i + 1}-${name}` }));
  const log = [];
  const results = await runAllGatesSerially(gates, fakeRunnerFactory(log, {}));
  const summaryText = buildSummaryText(writerInput(results));
  const dir = mkdtempSync(join(tmpdir(), 'gate-record-green-'));
  try {
    const { summaryPath } = writeGateRun({
      evidenceDir: dir,
      localDateStr: '2026-09-10',
      pinShort: SHORT,
      summaryText,
      results,
    });
    const onDisk = readFileSync(summaryPath, 'utf8');
    assert.match(onDisk, new RegExp(`^pin ${FULL}`, 'm'));
    for (const r of results) assert.match(onDisk, new RegExp(`${r.label} EXIT=0`));
    const holder = mkdtempSync(join(tmpdir(), 'gate-record-holder-'));
    try {
      const name = `gate-run-2026-09-10-${SHORT}`;
      mkdirSync(join(holder, name), { recursive: true });
      writeFileSync(join(holder, name, 'summary.txt'), onDisk, 'utf8');
      const v = checkGateRecord(holder, SHORT);
      assert.equal(v.ok, true, `expected green, got: ${v.reasons.join('; ')}`);
    } finally {
      rmSync(holder, { recursive: true, force: true });
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('pin check: equal pins pass, moved or empty pins fail', () => {
  assert.equal(checkPin(FULL, FULL).ok, true);
  const moved = checkPin(FULL, 'def5678ddef5678ddef5678ddef5678ddef5678d');
  assert.equal(moved.ok, false);
  assert.match(moved.why ?? '', /moved/);
  assert.equal(checkPin('', FULL).ok, false);
  assert.equal(checkPin(FULL, '').ok, false);
  assert.equal(checkPin(null, null).ok, false);
});

test('runner: all six run serially in order, even past a red gate', async () => {
  const gates = GATE_ORDER.map((name, i) => ({ name, label: `${i + 1}-${name}` }));
  const log = [];
  // N1: order alone does not prove seriality — a fan-out also pushes in
  // call order. Track in-flight concurrency: max 1 or the runner overlaps.
  let active = 0;
  let maxActive = 0;
  const tracking = async (gate) => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    try {
      return await fakeRunnerFactory(log, { build: { exit: 1, output: 'build blew up\n' } })(gate);
    } finally {
      active -= 1;
    }
  };
  const results = await runAllGatesSerially(gates, tracking);
  assert.deepEqual(log, [...GATE_ORDER], 'gates must run in order, one after another');
  assert.equal(maxActive, 1, 'no two gates may be in flight at once');
  assert.equal(results.length, 6);
  assert.equal(results.find((r) => r.name === 'build').exit, 1);
  assert.equal(results.find((r) => r.name === 'launch').exit, 0);
  assert.ok(results.every((r) => r.durationMs > 0), 'every gate keeps its duration');
});

test('local date: the unit returns the machine-local day', () => {
  // 2026-01-02 03:04 local must read back as that day whatever the zone.
  const d = new Date(2026, 0, 2, 3, 4, 5);
  assert.equal(localDate(d), '2026-01-02');
  const e = new Date(2026, 11, 31, 23, 59, 59);
  assert.equal(localDate(e), '2026-12-31');
});

test('pass count: found when present, null when absent', () => {
  assert.equal(parseTestCount('blah\n1734 passed\n'), 1734);
  assert.equal(parseTestCount('ℹ pass 12\nℹ fail 0\n'), 12);
  assert.equal(parseTestCount('nothing countable here'), null);
});

test('mutation: a writer that drops one exit line is caught', () => {
  const full = buildSummaryText(writerInput(greenResults()));
  const dropped = full.split('\n').filter((l) => !l.startsWith('5-surfaces EXIT')).join('\n');
  assert.match(full, /5-surfaces EXIT=0/);
  assert.doesNotMatch(dropped, /5-surfaces EXIT=/);
  // The mutated receipt, on disk under the same directory shape, must fail.
  const holder = mkdtempSync(join(tmpdir(), 'gate-record-mut-'));
  try {
    const name = `gate-run-2026-09-10-${SHORT}`;
    mkdirSync(join(holder, name), { recursive: true });
    writeFileSync(join(holder, name, 'summary.txt'), dropped, 'utf8');
    const v = checkGateRecord(holder, SHORT);
    assert.equal(v.ok, false, 'a receipt missing one gate must not count');
    assert.match(v.reasons.join('\n'), /missing exit for surfaces/);
  } finally {
    rmSync(holder, { recursive: true, force: true });
  }
});
