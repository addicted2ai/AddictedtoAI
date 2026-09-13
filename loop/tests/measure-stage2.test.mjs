/**
 * measure-stage2.test.mjs — task 68: the Stage-2 measurement, and the
 * decision rule stated in advance.
 *
 * What is tested here, per the brief:
 * - the measurement writer appends the required shapes to the task-52 store
 *   (`data/measurements.jsonl`, append-only, never a gate-rewritten file):
 *   merged items per train (a count keyed by train id, joined through the
 *   manifest's jobId), distinct subjects per work order (the DISTINCT path
 *   set per order, deduped AND sorted — distinctness asserted, not just
 *   presence), and the review-minute side (per-job review minutes from
 *   review* phases; train-review model-minutes including every re-review);
 * - the window samples the FIRST TWENTY work orders;
 * - the N-distribution guard both ways: a window spanning N=1..4 counts, a
 *   single-level window does not;
 * - both rise criteria exercised (twofold; monotonic across three
 *   represented N-levels — and two rising levels are not three);
 * - the version boundary: a machinery fix annotates the next run stale, that
 *   run is excluded from the rates, and the annotation is annotation-only —
 *   the importer path is untouched;
 * - the per-subject breakdown rides the `train:` key beside the task-44
 *   count (tested in train-review.test.mjs, where the count's witness lives);
 * - both zero-findings interpretations (holds asserted / not asserted);
 * - the lower-to target recorded exactly (4→2, floor 1) with an enforceable
 *   no-auto-tuning arm (a config file beside the store is byte-unchanged by
 *   the write — the machinery writes metadata, never config);
 * - the recorded rule set carries the Stage-3 gate text verbatim, and a
 *   window whose proxy rises with N annotates STAGE-3-GATE-HELD beside the
 *   window.
 *
 * Fixture policy: the ledger lines here are plain objects mirroring the
 * documented shapes (task 67 `items`, task 59s `phases`, task 36 `train`
 * key with task 68's breakdown extension) — the writer takes parsed lines,
 * the same way `scripts/fold-train-series.mjs` takes ledger text. N is the
 * ITEM count per order (task 68's `N`), and an item may carry several
 * subjects, so a fixture controls N and the subject-slot count separately.
 * No live model, no gate, no push, no config write anywhere in this file.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  LOWER_TO_TARGET,
  STAGE2_RULE_SET,
  STAGE3_GATE_TEXT,
  ZERO_FINDINGS_TEXT,
  WINDOW_SIZE,
  annotateStale,
  appendStage2Measurement,
  buildStage2Measurement,
  mergedItemsPerTrain,
  stage2Verdict,
  stage2Window,
  stage2WorkOrders,
} from '../lib/measure-stage2.mjs';
import { localDate } from '../lib/dates.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FOLD_SCRIPT = join(HERE, '..', '..', 'scripts', 'fold-train-series.mjs');

const NOW = new Date('2026-09-13T10:00:00.000Z');

let seq = 0;
function tmpDir() {
  return mkdtempSync(join(tmpdir(), `atai-m68-${++seq}-`));
}

/** Minute offsets from 2026-09-12T00:00Z — always valid ISO, order-preserving. */
const T = (mins) => new Date(Date.UTC(2026, 8, 12) + mins * 60000).toISOString();

/** A job line shaped like the ledger's (task 67 items, task 59s phases). */
function jobLine(id, ts, items, phases = []) {
  return {
    ts,
    id,
    type: 'entry',
    runner: 'mock-frontier',
    provider: 'mock',
    tier: 'frontier',
    mm: 1,
    outcome: 'done',
    ...(phases.length ? { phases } : {}),
    ...(items.length ? { items } : {}),
  };
}

function item(subjects, { open = false } = {}) {
  return { index: 0, bead: 'addictedtoai-fixture', type: 'entry', subjects, ...(open ? { open } : {}) };
}

/**
 * A work order at level N: `n` items carrying `subjectGroups` (one array of
 * subjects per item), so N and the subject-slot count are set independently.
 */
function orderAt(id, ts, subjectGroups, phases = []) {
  return jobLine(id, ts, subjectGroups.map((g) => item(g)), phases);
}

/** A train line shaped like task 36's, with task 68's breakdown extension. */
function trainLine(id, ts, { mm = 0, review_rounds = 0, findings = 0, by_subject = null } = {}) {
  return {
    ts,
    id,
    type: 'train',
    runner: 'stub-reviewer',
    provider: 'stub',
    tier: 'stub',
    mm,
    outcome: 'done',
    train: {
      id,
      merges: [],
      gate_seconds: {},
      evictions: [],
      pre_existing_hold: false,
      findings_not_in_any_record: findings,
      ...(by_subject ? { findings_not_in_any_record_by_subject: by_subject } : {}),
      review_rounds,
    },
  };
}

// ---------------------------------------------------------------------------
// The writer: shapes, append-only.
// ---------------------------------------------------------------------------

test('task 68: the writer appends the required shapes, append-only', () => {
  const dir = tmpDir();
  try {
    const storePath = join(dir, 'data', 'measurements.jsonl');
    const ledger = [
      // A pre-window train: before the first work order, so its mm and its
      // findings are outside the window's era and contribute nothing.
      trainLine('t-early', T(60), { mm: 100, findings: 50, by_subject: { 'content/early.md': 50 } }),
      // Four work orders, N=1..4 — the guarded span.
      orderAt('j-1', T(120), [['content/a.md']], [
        { role: 'author', runner: 'mock-frontier', mm: 10 },
        { role: 'review1', runner: 'mock-reviewer', mm: 2.5 },
        { role: 'review2', runner: 'mock-reviewer', mm: 1.25 },
      ]),
      // Duplicate + unsorted subjects across two items: distinctness is the
      // assertion.
      orderAt('j-2', T(180), [['content/b.md', 'content/a.md'], ['content/a.md']], [
        { role: 'author', runner: 'mock-frontier', mm: 10 },
      ]),
      orderAt('j-3', T(240), [['content/c1.md', 'content/c2.md'], ['content/c3.md'], ['content/c4.md']]),
      orderAt('j-4', T(300), [['content/d1.md'], ['content/d2.md'], ['content/d3.md'], ['content/d4.md']]),
      // The train that merged j-1 and j-2: mm sums every re-review
      // (review_rounds 2), findings zero, breakdown empty.
      trainLine('t-1', T(360), { mm: 6.5, review_rounds: 2 }),
    ];
    const manifests = [
      { train: 't-1', merges: [{ sha: 's1', jobId: 'j-1' }, { sha: 's2', jobId: 'j-2' }] },
    ];
    const record = appendStage2Measurement({ storePath, ledger, manifests, now: NOW });

    // Append-only: exactly one line, and it is the record the call returned.
    const text = readFileSync(storePath, 'utf8');
    const lines = text.split('\n').filter(Boolean);
    assert.equal(lines.length, 1, 'the store carries exactly one line');
    assert.deepEqual(JSON.parse(lines[0]), record, 'the stored line is the record');

    assert.equal(record.task, 68, 'the record names its task');
    assert.equal(record.measured_on, localDate(NOW), 'the record carries the local date');
    assert.match(record.method, /measure-stage2\.mjs/, 'the method line names the writer');

    // The window: the work orders, with N and the DISTINCT subject set.
    assert.equal(record.window.order_count, 4);
    assert.deepEqual(record.window.orders.map((o) => o.n), [1, 2, 3, 4],
      'N is the item count per work order');
    const j2 = record.window.orders.find((o) => o.id === 'j-2');
    assert.ok(j2, 'the j-2 order is in the window');
    assert.deepEqual(j2.subjects, ['content/a.md', 'content/b.md'],
      'distinct subjects per work order: deduped AND sorted, distinctness asserted');

    // Merged items per train: a count keyed by train id. j-1 carries one
    // item; j-2 carries two, neither left open — 3 merged items.
    assert.deepEqual(record.window.merged_items_per_train, { 't-1': 3 },
      'merged items per train: a count of merged items keyed by train id');

    // The review-minute side: per-job review minutes are the review* phases
    // only (the author phase's 10 minutes are not review minutes), and
    // train-review minutes include every re-review (one line, two rounds,
    // mm 6.5). The pre-window train contributes nothing.
    assert.deepEqual(record.window.review_minutes, {
      per_job_review_mm: 3.75,
      train_review_mm: 6.5,
    });

    // The rule set rides with the window.
    assert.deepEqual(record.rule_set, STAGE2_RULE_SET, 'the rule set is recorded with the window');

    // Append-only, again: a second append adds a line and leaves the first
    // byte-identical — the store is never rewritten.
    appendStage2Measurement({ storePath, ledger: [], manifests: [], now: NOW });
    const text2 = readFileSync(storePath, 'utf8');
    const lines2 = text2.split('\n').filter(Boolean);
    assert.equal(lines2.length, 2, 'the second append adds exactly one line');
    assert.equal(lines2[0], lines[0], 'the first line is byte-identical: append-only, never rewritten');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// The window: the FIRST TWENTY work orders.
// ---------------------------------------------------------------------------

test('task 68: the window samples the first twenty work orders', () => {
  const ledger = [];
  for (let i = 1; i <= 25; i += 1) {
    const n = ((i - 1) % 4) + 1; // N cycles 1..4, so the first twenty span the guard
    const groups = Array.from({ length: n }, (_, k) => [`content/w${i}-${k}.md`]);
    ledger.push(orderAt(`j-${String(i).padStart(2, '0')}`, T(120 + i), groups));
  }
  // A train after the window's era whose findings sit ONLY on a subject the
  // late orders (21..25) declare: they must not enter any level's rate.
  ledger.push(trainLine('t-late', T(600), { mm: 3, findings: 5, by_subject: { 'content/w21-0.md': 5 } }));
  const record = buildStage2Measurement({ ledger, now: NOW });
  assert.equal(record.window.order_count, WINDOW_SIZE, 'the window is twenty work orders');
  const ids = record.window.orders.map((o) => o.id);
  assert.deepEqual(ids, Array.from({ length: 20 }, (_, i) => `j-${String(i + 1).padStart(2, '0')}`),
    'the window is the FIRST twenty, in file order');
  assert.equal(record.guarded, true, 'the first twenty span N=1..4');
  assert.equal(record.findings.total, 5, 'the late findings are counted');
  assert.equal(record.findings.attributed, 0, 'none of them are attributed inside the window');
  assert.equal(record.findings.unattributed, 5, 'they land in unattributed, never silently dropped');
  for (const key of Object.keys(record.rates)) {
    assert.equal(record.rates[key], 0, `no window rate carries the late findings (level ${key})`);
  }
});

// ---------------------------------------------------------------------------
// The N-distribution guard, both ways.
// ---------------------------------------------------------------------------

test('task 68: the guard — a window spanning N=1..4 counts', () => {
  const ledger = [
    orderAt('j-a', T(120), [['content/a.md']]),
    orderAt('j-b', T(180), [['content/b1.md'], ['content/b2.md']]),
    orderAt('j-c', T(240), [['content/c1.md'], ['content/c2.md'], ['content/c3.md']]),
    orderAt('j-d', T(300), [['content/d1.md'], ['content/d2.md'], ['content/d3.md'], ['content/d4.md']]),
    trainLine('t-1', T(540), { mm: 1 }),
  ];
  const record = buildStage2Measurement({ ledger, now: NOW });
  assert.equal(record.guarded, true, 'the span N=1..4 is guarded');
  assert.equal(record.window_counts, true, 'a guarded window counts');
  assert.equal(record.guard_reason, null);
  assert.deepEqual(record.n_levels_represented, [1, 2, 3, 4]);
});

test('task 68: the guard — a single-level window does not count', () => {
  const ledger = [
    orderAt('j-a', T(120), [['content/a1.md'], ['content/a2.md']]),
    orderAt('j-b', T(180), [['content/b1.md'], ['content/b2.md']]),
    orderAt('j-c', T(240), [['content/c1.md'], ['content/c2.md']]),
    orderAt('j-d', T(300), [['content/d1.md'], ['content/d2.md']]),
    trainLine('t-1', T(540), { mm: 1 }),
  ];
  const record = buildStage2Measurement({ ledger, now: NOW });
  assert.equal(record.guarded, false, 'every order at N=2: the window sits at one level');
  assert.equal(record.window_counts, false, 'an unguarded window does not count');
  assert.match(record.guard_reason, /spans N=1\.\.4/, 'the refusal names the guard');
  assert.equal(record.rise.counts, false, 'no rise is counted on an unguarded window');
  assert.equal(record.zero_findings_interpretation, undefined,
    'zero findings over an unguarded window earns no interpretation at all');
  assert.equal(record.stage3_gate, undefined, 'no gate annotation beside an unguarded window');
  assert.equal(record.lower_to, undefined, 'no lower-to target beside an unguarded window');
});

// ---------------------------------------------------------------------------
// The rise criteria, both exercised.
// ---------------------------------------------------------------------------

/**
 * Four orders, one per level, each carrying `slots` distinct subjects
 * distributed across its N items; findings per level ride the first subject
 * of the level's order, so the subject-owner map attributes them back.
 */
function guardedFixture({ slots, findingsByLevel }) {
  const groups = (p, n) => {
    const out = [];
    let left = slots;
    let idx = 0;
    for (let i = 0; i < n; i += 1) {
      const take = i === n - 1 ? left : Math.max(1, Math.floor(slots / n));
      out.push(Array.from({ length: take }, () => `content/${p}-${idx++}.md`));
      left -= take;
    }
    return out;
  };
  const specs = [
    { n: 1, p: 'a' }, { n: 2, p: 'b' }, { n: 3, p: 'c' }, { n: 4, p: 'd' },
  ];
  const ledger = specs.map(({ n, p }, i) => orderAt(`j-${p}`, T(120 + (i + 1) * 60), groups(p, n)));
  const by_subject = {};
  let total = 0;
  for (const [n, count] of Object.entries(findingsByLevel)) {
    if (count > 0) {
      by_subject[`content/${specs[Number(n) - 1].p}-0.md`] = count;
      total += count;
    }
  }
  ledger.push(trainLine('t-1', T(540), { mm: 2, findings: total, by_subject }));
  return { ledger };
}

test('task 68: rise criterion 1 — the rate at N≥3 exceeds the N=1 rate twofold', () => {
  // Level 1: 1 finding over 4 subject slots = 0.25. Levels 3+4 pooled:
  // 9 findings over 8 slots = 1.125 > 2 × 0.25.
  const { ledger } = guardedFixture({ slots: 4, findingsByLevel: { 1: 1, 3: 9 } });
  const record = buildStage2Measurement({ ledger, now: NOW });
  assert.equal(record.guarded, true);
  assert.equal(record.rate_n_1, 0.25);
  assert.equal(record.rate_n_ge_3, 1.125);
  assert.equal(record.rise.twofold, true, '1.125 > 2 × 0.25: the twofold criterion fires');
  assert.equal(record.rise.detected, true);
  assert.equal(record.stage3_gate, 'STAGE-3-GATE-HELD', 'the gate annotation lands beside the window');
  assert.ok(record.lower_to, 'the lower-to target is recorded on a rise');
});

test('task 68: rise criterion 2 — monotonic across three represented N-levels', () => {
  // Rates 0.2, 0.3, 0.4, 0.4 across levels 1..4: strictly rising across
  // levels 1,2,3 — while the pooled N≥3 rate (0.4) does NOT exceed 2 × 0.2.
  const { ledger } = guardedFixture({ slots: 10, findingsByLevel: { 1: 2, 2: 3, 3: 4, 4: 4 } });
  const record = buildStage2Measurement({ ledger, now: NOW });
  assert.equal(record.guarded, true);
  assert.equal(record.rate_n_1, 0.2);
  assert.equal(record.rate_n_ge_3, 0.4);
  assert.equal(record.rise.twofold, false, '0.4 is not more than 2 × 0.2: twofold does not fire');
  assert.equal(record.rise.monotonic, true, '0.2 < 0.3 < 0.4 across levels 1,2,3: monotonic fires');
  assert.deepEqual(record.rise.monotonic_levels, [1, 2, 3]);
  assert.equal(record.rise.detected, true);
  assert.equal(record.stage3_gate, 'STAGE-3-GATE-HELD');
});

test('task 68: two rising levels are not three — no monotonic rise', () => {
  // Rates 0.2, 0.3, 0.2, 0.2: only two levels rise; no three-level rise exists.
  const { ledger } = guardedFixture({ slots: 10, findingsByLevel: { 1: 2, 2: 3, 3: 2, 4: 2 } });
  const record = buildStage2Measurement({ ledger, now: NOW });
  assert.equal(record.rise.monotonic, false, 'two rising levels do not satisfy the three-level criterion');
  assert.equal(record.rise.twofold, false);
  assert.equal(record.rise.detected, false, 'no rise: no gate annotation, no lower-to target');
  assert.equal(record.stage3_gate, undefined);
  assert.equal(record.lower_to, undefined);
});

// ---------------------------------------------------------------------------
// The version boundary: annotation lands one run later; that run is excluded;
// annotation only — the importer path is untouched.
// ---------------------------------------------------------------------------

test('task 68: a machinery fix annotates the next run stale and that run is excluded', () => {
  // Five orders: N=1 (e), N=2 (f), N=3 (g), N=3 (h), N=4 (i), four subject
  // slots each. The findings sit on the FIRST N=3 order's subject. Without
  // the fix, the pooled N≥3 rate is 9/12 > 2 × 0.25 and the window rises.
  // The fix lands between the N=2 and the first N=3 order: that order is
  // annotated stale, excluded, and its subject's findings become
  // unattributable — the rise disappears.
  const ledger = [
    orderAt('j-e', T(120), [['content/e-0.md', 'content/e-1.md', 'content/e-2.md', 'content/e-3.md']]),
    orderAt('j-f', T(180), [['content/f-0.md', 'content/f-1.md'], ['content/f-2.md', 'content/f-3.md']]),
    orderAt('j-g', T(240), [['content/g-0.md', 'content/g-1.md'], ['content/g-2.md'], ['content/g-3.md']]),
    orderAt('j-h', T(300), [['content/h-0.md', 'content/h-1.md'], ['content/h-2.md'], ['content/h-3.md']]),
    orderAt('j-i', T(360), [['content/i-0.md'], ['content/i-1.md'], ['content/i-2.md'], ['content/i-3.md']]),
    trainLine('t-1', T(540), { mm: 2, findings: 10, by_subject: { 'content/e-0.md': 1, 'content/g-0.md': 9 } }),
  ];
  // Counterfactual: with no fix, the window rises on the twofold criterion.
  const without = buildStage2Measurement({ ledger, now: NOW });
  assert.equal(without.rise.twofold, true, 'without the fix, 9/12 > 2 × 0.25 rises');
  assert.equal(without.stage3_gate, 'STAGE-3-GATE-HELD');

  // With the fix: the next run after it (j-g) is annotated and excluded.
  const record = buildStage2Measurement({ ledger, machineryFixes: [T(210)], now: NOW });
  const staleOrder = record.window.orders.find((o) => o.id === 'j-g');
  assert.ok(staleOrder, 'the annotated order is still listed in the window');
  assert.equal(staleOrder.stale, true, 'the next run after the fix is annotated stale');
  assert.match(staleOrder.stale_reason, /lands one run later/, 'the annotation names the boundary');
  assert.deepEqual(record.stale_runs.map((s) => s.id), ['j-g'], 'the stale run is recorded beside the window');
  assert.equal(record.findings.unattributed, 9, 'the stale run\'s findings are excluded from every level');
  assert.equal(record.rates['3'], 0, 'the N=3 rate no longer carries the excluded run');
  assert.equal(record.rise.twofold, false, 'with the run excluded, the twofold criterion no longer fires');
  assert.equal(record.rise.detected, false, 'no rise survives the exclusion');
  assert.equal(record.stage3_gate, undefined, 'no gate annotation survives the exclusion');

  // Annotation only: the importer path (task 52's folding script) is
  // untouched — the annotation rides the record, and no importer code
  // change exists to read it.
  const foldSource = readFileSync(FOLD_SCRIPT, 'utf8');
  assert.ok(!/stale/.test(foldSource), 'the task-52 folding script carries no stale handling: annotation only, no importer code change');
});

test('task 68: annotateStale annotates exactly the first order at or after each fix', () => {
  const orders = [
    { id: 'a', ts: T(120), n: 1, subjects: ['x'], review_mm: 0 },
    { id: 'b', ts: T(180), n: 1, subjects: ['x'], review_mm: 0 },
    { id: 'c', ts: T(240), n: 1, subjects: ['x'], review_mm: 0 },
  ];
  const marked = annotateStale(orders, [T(150), T(210)]);
  assert.deepEqual(marked.map((o) => o.stale ?? false), [false, true, true],
    'each fix marks the first order at or after it (150 → b, 210 → c)');
  assert.deepEqual(orders.map((o) => o.stale ?? false), [false, false, false], 'the input is never mutated');
  // A fix after every order annotates nothing.
  assert.deepEqual(annotateStale(orders, [T(540)]).map((o) => o.stale ?? false), [false, false, false]);
});

// ---------------------------------------------------------------------------
// Zero findings: both interpretations, exercised.
// ---------------------------------------------------------------------------

function zeroFindingsLedger() {
  return [
    orderAt('j-a', T(120), [['content/a.md']]),
    orderAt('j-b', T(180), [['content/b1.md'], ['content/b2.md']]),
    orderAt('j-c', T(240), [['content/c1.md'], ['content/c2.md'], ['content/c3.md']]),
    orderAt('j-d', T(300), [['content/d1.md'], ['content/d2.md'], ['content/d3.md'], ['content/d4.md']]),
    trainLine('t-1', T(540), { mm: 1, findings: 0, by_subject: {} }),
  ];
}

test('task 68: zero findings with the holds asserted reads as safe batching, conditionally', () => {
  const record = buildStage2Measurement({
    ledger: zeroFindingsLedger(),
    holds: { seal: true, live_proving: true },
    now: NOW,
  });
  assert.equal(record.guarded, true);
  assert.equal(record.findings.total, 0, 'the window carries zero findings');
  assert.ok(record.zero_findings_interpretation, 'a guarded zero carries an interpretation');
  assert.equal(record.zero_findings_interpretation.reading, 'safe-batching');
  assert.ok(record.zero_findings_interpretation.text.includes(ZERO_FINDINGS_TEXT),
    'the interpretation carries the pre-registered text');
});

test('task 68: zero findings without the holds reads as sealing failure, not safety', () => {
  const record = buildStage2Measurement({ ledger: zeroFindingsLedger(), now: NOW });
  assert.equal(record.guarded, true);
  assert.equal(record.findings.total, 0);
  assert.ok(record.zero_findings_interpretation, 'a guarded zero still carries an interpretation');
  assert.equal(record.zero_findings_interpretation.reading, 'sealing-failure-not-safety',
    'holds not asserted: the zero reads as sealing failure, not safety');
  assert.ok(record.zero_findings_interpretation.text.includes(ZERO_FINDINGS_TEXT));
});

// ---------------------------------------------------------------------------
// The lower-to target: recorded exactly; the machinery never tunes config.
// ---------------------------------------------------------------------------

test('task 68: the lower-to target is recorded exactly, and no code path edits config', () => {
  const dir = tmpDir();
  try {
    const storePath = join(dir, 'data', 'measurements.jsonl');
    const configPath = join(dir, 'data', 'config.json');
    mkdirSync(dirname(configPath), { recursive: true });
    writeFileSync(configPath, '{"work_order":{"max_items":4}}\n', 'utf8');
    const before = readFileSync(configPath, 'utf8');

    const { ledger } = guardedFixture({ slots: 4, findingsByLevel: { 1: 1, 3: 9 } });
    const record = appendStage2Measurement({ storePath, ledger, now: NOW });

    assert.deepEqual(record.lower_to, LOWER_TO_TARGET,
      'the lower-to target is recorded exactly: work_order.max_items 4→2, floor 1, applied by the orchestrator only');
    assert.equal(record.lower_to.from, 4);
    assert.equal(record.lower_to.to, 2);
    assert.equal(record.lower_to.floor, 1);
    assert.equal(record.lower_to.applied, false, 'the machinery records the target; it does not apply it');
    assert.equal(existsSync(configPath), true, 'the config file still exists');
    assert.equal(readFileSync(configPath, 'utf8'), before,
      'the write to the task-52 store left data/config.json byte-unchanged: no auto-tuning arm exists');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// The rule set: the Stage-3 gate text verbatim, carried with the window.
// ---------------------------------------------------------------------------

test('task 68: the recorded rule set carries the Stage-3 gate text verbatim', () => {
  assert.equal(STAGE2_RULE_SET.stage3_gate,
    'Stage 3 does not start while the proxy rises with `N` across the window — it is the only signal available that batching is costing review coverage, which is the `addictedtoai-zrsg` property.',
    'the gate text is the authority\'s sentence, verbatim');
  const { ledger } = guardedFixture({ slots: 4, findingsByLevel: { 1: 1, 3: 9 } });
  const record = buildStage2Measurement({ ledger, now: NOW });
  assert.equal(record.rule_set.stage3_gate, STAGE3_GATE_TEXT,
    'the window\'s recorded rule set carries the same verbatim text');
  assert.equal(record.rule_set.estimator, 'the per-subject proxy rate against `N` (items per work order) over the first twenty work orders');
  assert.equal(record.rule_set.rise_threshold, 'the rate at N≥3 exceeds the N=1 rate twofold, or rises monotonically across three represented N-levels');
  assert.equal(record.rule_set.n_distribution_guard, 'the window counts only if it spans N=1..4 rather than sitting at one level');
  assert.equal(record.rule_set.lower_to, 'on a rise, `work_order.max_items` (`N_max`) 4→2 (floor 1) before any other bound is tuned');
  assert.equal(record.rule_set.zero_findings_interpretation,
    'zero over a guarded window reads as safe batching only while the seal assertion (task 44) and the live proving (task 68b) hold; otherwise it reads as sealing failure, not safety');
  assert.equal(record.rule_set.version_boundary,
    'a machinery fix merged mid-window annotates the next run stale (it lands one run later) and that run is excluded — annotation only, no importer code change');
});

// ---------------------------------------------------------------------------
// Unit seams the record leans on.
// ---------------------------------------------------------------------------

test('task 68: mergedItemsPerTrain counts non-open items through the manifest join', () => {
  const ledger = [
    jobLine('j-1', T(120), [item(['a']), item(['b'], { open: true })]),
    jobLine('j-2', T(180), [item(['c']), item(['d'])]),
    trainLine('t-1', T(540)),
  ];
  const manifests = [
    { train: 't-1', merges: [{ sha: 's1', jobId: 'j-1' }, { sha: 's2', jobId: 'j-2' }] },
    { train: 't-2', merges: [{ sha: 's3', jobId: 'j-1' }] },
    { train: 't-3', merges: [{ sha: 's4', jobId: 'j-missing' }] },
  ];
  assert.deepEqual(mergedItemsPerTrain(ledger, manifests), {
    't-1': 3, // j-1's one merged item + j-2's two
    't-2': 1, // the same j-1 line, counted for the train that also merged it
    // t-3 absent: a job with no ledger line contributes nothing it cannot
    // prove — unmeasurable, not zero.
  });
});

test('task 68: stage2WorkOrders reads N, distinct sorted subjects and review minutes', () => {
  const ledger = [
    orderAt('j-1', T(120), [['b.md', 'a.md'], ['a.md']], [
      { role: 'author', runner: 'r', mm: 10 },
      { role: 'review1', runner: 'r', mm: 2 },
    ]),
    trainLine('t-1', T(180)), // never a work order
    orderAt('j-2', T(240), []), // no items: not a work order
    { ts: T(300), id: 'j-3', type: 'entry', runner: 'r', provider: 'p', tier: 't', mm: 1, outcome: 'done' },
  ];
  const orders = stage2WorkOrders(ledger);
  assert.equal(orders.length, 1, 'only job lines carrying items are work orders');
  assert.deepEqual(orders[0], {
    id: 'j-1', ts: T(120), n: 2, subjects: ['a.md', 'b.md'], review_mm: 2,
  });
});

test('task 68: stage2Window slices the first twenty and annotates staleness', () => {
  const orders = Array.from({ length: 25 }, (_, i) => ({
    id: `j-${i + 1}`, ts: T(120 + i), n: 1, subjects: [`s${i}`], review_mm: 0,
  }));
  const window = stage2Window(orders, { machineryFixes: [T(128)] });
  assert.equal(window.length, 20, 'the window is the first twenty');
  assert.equal(window[8].id, 'j-9', 'the ninth order is the first at or after the fix');
  assert.equal(window[8].stale, true);
  assert.equal(window[7].stale, undefined, 'orders before the fix are not annotated');
});
