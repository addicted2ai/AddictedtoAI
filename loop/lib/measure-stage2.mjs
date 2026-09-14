/**
 * measure-stage2.mjs — task 68: the Stage-2 measurement, and the decision
 * rule stated in advance.
 *
 * WHAT THIS FILE IS. The writer that appends the Stage-2 measurement to the
 * task-52 store (`data/measurements.jsonl` — append-only, dated, methoded;
 * NEVER `data/launch.json`, which gate runs rewrite) and the rule set that
 * travels with every window it records. The rule's values are the authority's,
 * carried verbatim from the open change two-desks-work-orders-and-trains,
 * task 68 (they were written in advance of any data; this file only records
 * and computes against them).
 *
 * WHAT THIS FILE IS NOT. It is not a decision-maker. On a rise it records the
 * lower-to target (`work_order.max_items` 4→2, floor 1) as METADATA with
 * `applied: false`, and annotates `STAGE-3-GATE-HELD` beside the window — the
 * decision and the gate's enforcement are the orchestrator's acts. No code
 * path here (or anywhere in machinery) edits `data/config.json`: it is a
 * reserved path, and a job editing it writes `HOLD.md`. The store this file
 * appends to is read back by nobody here — append-only means append-only.
 *
 * INPUTS, and where each comes from:
 * - `ledger` — parsed `data/ledger.jsonl` lines. Work orders are the job
 *   lines carrying `items` (task 67's additive key; a line without it is not
 *   a work order). `N` is the order's item count. Distinct subjects per order
 *   are the deduped, sorted union of the items' `subjects`. Per-job review
 *   minutes are the sum of `mm` over the line's `review*`-role `phases`
 *   (task 59s) — the same rows `health.mjs` reads.
 * - Train-review model-minutes including every re-review are the train lines'
 *   `mm` (task 36: review model-minutes summed over every re-review), summed
 *   over the non-replay train lines in the window's era (at or after the first
 *   window order's ts; replay-verdict lines — `train.replay_of` set — are
 *   excluded, the same convention `scripts/fold-train-series.mjs` uses).
 * - `manifests` — parsed `.train/manifest.json` contents (caller-supplied;
 *   the manifest is committed on the train and published to main, so the
 *   orchestrator reads them from git). They carry the only train→job join
 *   that exists (`merges[].jobId`), which is what "merged items per train"
 *   needs: the count of items the train's merged jobs' ledger lines carry
 *   that the merge did not leave open (`open !== true`).
 * - `holds` — the caller's assertion that the seal assertion (task 44) and
 *   the live proving (task 68b) stand. Omitted or false means not asserted,
 *   and the zero-findings reading fails toward `sealing-failure-not-safety`.
 * - `machineryFixes` — timestamps (ms or ISO) of machinery fixes merged
 *   mid-window. The FIRST work order at or after each is annotated `stale`
 *   (the fix lands one run later) and excluded from every rate. Annotation
 *   only: nothing downstream is modified to skip it — the record carries the
 *   annotation, and the importer path is untouched.
 */

import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { localDate } from './dates.mjs';

/** The pre-registered window: the FIRST TWENTY work orders. */
export const WINDOW_SIZE = 20;

/** The per-subject key findings with no attributable subject land under. */
export const UNATTRIBUTED = 'unattributed';

// ---------------------------------------------------------------------------
// The rule set, verbatim from task 68 (stated in advance of any data).
// ---------------------------------------------------------------------------

export const ESTIMATOR_TEXT =
  'the per-subject proxy rate against `N` (items per work order) over the first twenty work orders';
export const RISE_THRESHOLD_TEXT =
  'the rate at N≥3 exceeds the N=1 rate twofold, or rises monotonically across three represented N-levels';
export const N_GUARD_TEXT =
  'the window counts only if it spans N=1..4 rather than sitting at one level';
export const LOWER_TO_TEXT =
  'on a rise, `work_order.max_items` (`N_max`) 4→2 (floor 1) before any other bound is tuned';
export const ZERO_FINDINGS_TEXT =
  'zero over a guarded window reads as safe batching only while the seal assertion (task 44) and the live proving (task 68b) hold; otherwise it reads as sealing failure, not safety';
export const VERSION_BOUNDARY_TEXT =
  'a machinery fix merged mid-window annotates the next run stale (it lands one run later) and that run is excluded — annotation only, no importer code change';
export const STAGE3_GATE_TEXT =
  'Stage 3 does not start while the proxy rises with `N` across the window — it is the only signal available that batching is costing review coverage, which is the `addictedtoai-zrsg` property.';
export const DECISION_TEXT =
  "The DECISION remains the orchestrator's; the machinery must not tune `work_order.max_items` by itself.";

export const STAGE2_RULE_SET = Object.freeze({
  estimator: ESTIMATOR_TEXT,
  rise_threshold: RISE_THRESHOLD_TEXT,
  n_distribution_guard: N_GUARD_TEXT,
  lower_to: LOWER_TO_TEXT,
  zero_findings_interpretation: ZERO_FINDINGS_TEXT,
  version_boundary: VERSION_BOUNDARY_TEXT,
  stage3_gate: STAGE3_GATE_TEXT,
  decision: DECISION_TEXT,
});

/** The lower-to target, recorded exactly — never applied by machinery. */
export const LOWER_TO_TARGET = Object.freeze({
  key: 'work_order.max_items',
  from: 4,
  to: 2,
  floor: 1,
  applied: false,
  applied_by: 'orchestrator only — the machinery never edits data/config.json',
});

// ---------------------------------------------------------------------------
// Work orders out of the ledger.
// ---------------------------------------------------------------------------

/**
 * The ledger's work orders, file order preserved (file order IS the
 * chronological order the window samples). A work order is a job line
 * carrying a non-empty `items` list (task 67); its `N` is the item count,
 * its subjects the deduped-and-sorted union of the items' `subjects`, its
 * review minutes the sum of `mm` over `review*`-role phases.
 */
export function stage2WorkOrders(ledger) {
  const out = [];
  for (const l of ledger ?? []) {
    if (!l || l.type === 'train') continue;
    if (!Array.isArray(l.items) || !l.items.length) continue;
    const subjects = [...new Set(
      l.items.flatMap((it) => (it && Array.isArray(it.subjects) ? it.subjects : []).map((s) => String(s))),
    )].sort();
    const review_mm = (Array.isArray(l.phases) ? l.phases : [])
      .filter((p) => p && typeof p.role === 'string' && /^review/.test(p.role))
      .reduce((s, p) => s + (Number.isFinite(p.mm) ? p.mm : 0), 0);
    out.push({ id: l.id ?? null, ts: l.ts ?? null, n: l.items.length, subjects, review_mm });
  }
  return out;
}

/**
 * The version boundary (annotation only): the first work order at or after
 * each machinery fix is annotated `stale` — the fix lands one run later —
 * and every rate below excludes it. Returns NEW order objects; the input is
 * never mutated.
 */
export function annotateStale(orders, machineryFixes) {
  const fixes = (machineryFixes ?? [])
    .map((f) => (typeof f === 'number' ? f : Date.parse(f)))
    .filter((t) => Number.isFinite(t));
  const marked = new Set();
  for (const t of fixes) {
    const i = (orders ?? []).findIndex((o) => {
      const ot = Date.parse(o.ts);
      return Number.isFinite(ot) && ot >= t;
    });
    if (i >= 0) marked.add(i);
  }
  return (orders ?? []).map((o, i) => (marked.has(i)
    ? {
      ...o,
      stale: true,
      stale_reason: 'machinery fix merged mid-window: this run is annotated stale (the fix lands one run later) and excluded — task-68 version boundary',
    }
    : o));
}

/** The pre-registered window: the first `size` work orders, stale-annotated. */
export function stage2Window(orders, { size = WINDOW_SIZE, machineryFixes = [] } = {}) {
  return annotateStale((orders ?? []).slice(0, size), machineryFixes);
}

/**
 * Merged items per train, keyed by train id: through the manifest's
 * `merges[].jobId` (the only train→job join that exists), count each merged
 * job's ledger items that the merge did not leave open. A job with no ledger
 * line contributes nothing it cannot prove — the count counts items, and a
 * missing line is not an item.
 */
export function mergedItemsPerTrain(ledger, manifests) {
  const itemsByJob = new Map();
  for (const l of ledger ?? []) {
    if (!l || l.type === 'train' || !Array.isArray(l.items)) continue;
    itemsByJob.set(String(l.id), l.items);
  }
  const out = {};
  for (const m of manifests ?? []) {
    const id = m && m.train != null ? String(m.train) : null;
    if (!id || !Array.isArray(m.merges)) continue;
    let count = 0;
    let resolved = 0;
    for (const merge of m.merges) {
      const items = itemsByJob.get(String(merge && merge.jobId));
      if (!items) continue;
      resolved += 1;
      count += items.filter((it) => it && it.open !== true).length;
    }
    // A train whose merges resolve to no ledger line at all is unmeasurable,
    // not zero — omit it rather than land a 0 that reads as a measurement.
    if (resolved === 0) continue;
    out[id] = (Object.hasOwn(out, id) ? out[id] : 0) + count;
  }
  return out;
}

// ---------------------------------------------------------------------------
// The estimator and the decision rule, computed — never decided.
// ---------------------------------------------------------------------------

/**
 * The verdict over one window against the rule set. `windowOrders` are
 * already stale-annotated; stale orders are excluded from every rate, from
 * the guard's span, and from the review-minute totals (that run is excluded).
 * `trainLines` are the non-replay train lines whose findings the window owns
 * (the caller bounds them — the writer bounds them to the window's era).
 *
 * The estimator: per-subject proxy rate against N. A train line's
 * `findings_not_in_any_record_by_subject` (task 68's additive extension of
 * the task-36 `train:` key, beside task 44's count) attributes each
 * not-in-any-record finding to a subject; that subject belongs to the FIRST
 * non-stale window order declaring it (a tie rule, stated), whose N is the
 * level the finding counts at. The rate at level n is findings at n divided
 * by subject slots at n (every distinct subject the level's orders carry, not
 * only findings-carrying ones). A count without a breakdown cannot be
 * attributed per subject and lands in `unattributed` — counted, never silent.
 */
export function stage2Verdict(windowOrders, trainLines, { holds = {} } = {}) {
  const active = (windowOrders ?? []).filter((o) => !o.stale);
  const levels = [...new Set(active.map((o) => o.n))].sort((a, b) => a - b);
  const guarded = [1, 2, 3, 4].every((n) => levels.includes(n));

  // Subject ownership: first non-stale window order declaring the subject.
  const owner = new Map();
  for (const o of active) {
    for (const s of o.subjects) {
      if (!owner.has(s)) owner.set(s, o);
    }
  }

  const findingsByLevel = new Map();
  let total = 0;
  let attributed = 0;
  let unattributed = 0;
  for (const t of trainLines ?? []) {
    const tr = t && t.train && typeof t.train === 'object' ? t.train : {};
    const breakdown = tr.findings_not_in_any_record_by_subject;
    if (breakdown && typeof breakdown === 'object' && !Array.isArray(breakdown)) {
      for (const [subject, count] of Object.entries(breakdown)) {
        const c = Number(count);
        if (!Number.isFinite(c) || c <= 0) continue;
        total += c;
        if (subject === UNATTRIBUTED) {
          unattributed += c;
          continue;
        }
        const o = owner.get(subject);
        if (!o) {
          unattributed += c;
          continue;
        }
        findingsByLevel.set(o.n, (findingsByLevel.get(o.n) ?? 0) + c);
        attributed += c;
      }
    } else if (Number(tr.findings_not_in_any_record) > 0) {
      const c = Number(tr.findings_not_in_any_record);
      total += c;
      unattributed += c;
    }
  }

  const slotsByLevel = new Map();
  for (const o of active) {
    slotsByLevel.set(o.n, (slotsByLevel.get(o.n) ?? 0) + o.subjects.length);
  }
  const rate = (n) => {
    const s = slotsByLevel.get(n) ?? 0;
    if (!(s > 0)) return null;
    return (findingsByLevel.get(n) ?? 0) / s;
  };
  const rates = {};
  for (const n of levels) {
    const r = rate(n);
    rates[String(n)] = r == null ? null : Math.round(r * 1e6) / 1e6;
  }
  let hiF = 0;
  let hiS = 0;
  for (const n of levels) {
    if (n >= 3) {
      hiF += findingsByLevel.get(n) ?? 0;
      hiS += slotsByLevel.get(n) ?? 0;
    }
  }
  const rateHigh = hiS > 0 ? hiF / hiS : null;
  const rate1 = rate(1);
  // Rise criterion 1 — twofold: the rate at N≥3 exceeds the N=1 rate twofold.
  const twofold = rate1 != null && rateHigh != null && rateHigh > 2 * rate1;
  // Rise criterion 2 — monotonic: strictly rising across three represented
  // N-levels (some three, in ascending level order).
  const represented = levels.filter((n) => rate(n) != null);
  let monotonic = false;
  let monotonicLevels = null;
  outer:
  for (let i = 0; i < represented.length; i += 1) {
    for (let j = i + 1; j < represented.length; j += 1) {
      for (let k = j + 1; k < represented.length; k += 1) {
        const r1 = rate(represented[i]);
        const r2 = rate(represented[j]);
        const r3 = rate(represented[k]);
        if (r1 < r2 && r2 < r3) {
          monotonic = true;
          monotonicLevels = [represented[i], represented[j], represented[k]];
          break outer;
        }
      }
    }
  }
  const riseDetected = twofold || monotonic;
  const rise = guarded && riseDetected;

  // Zero-findings interpretation, both branches computed from the holds the
  // caller asserts. Absent holds are NOT asserted holds — the reading fails
  // toward sealing failure, never toward safety.
  let interpretation = null;
  if (guarded && total === 0) {
    const seal = holds.seal === true;
    const liveProving = holds.live_proving === true;
    interpretation = seal && liveProving
      ? {
        reading: 'safe-batching',
        text: `${ZERO_FINDINGS_TEXT} — the holds are asserted (seal assertion: yes; live proving: yes): this window reads as safe batching, conditionally on their continuing to hold.`,
      }
      : {
        reading: 'sealing-failure-not-safety',
        text: `${ZERO_FINDINGS_TEXT} — the holds are not asserted (seal assertion: ${seal ? 'yes' : 'no'}; live proving: ${liveProving ? 'yes' : 'no'}): zero here reads as sealing failure, not safety.`,
      };
  }

  return {
    n_levels_represented: levels,
    guarded,
    window_counts: guarded,
    guard_reason: guarded ? null : `${N_GUARD_TEXT} — this window does not count`,
    rates,
    rate_n_ge_3: rateHigh == null ? null : Math.round(rateHigh * 1e6) / 1e6,
    rate_n_1: rate1 == null ? null : Math.round(rate1 * 1e6) / 1e6,
    rise: {
      twofold,
      monotonic,
      monotonic_levels: monotonicLevels,
      detected: riseDetected,
      counts: rise,
    },
    findings: {
      total,
      attributed,
      unattributed,
    },
    zero_findings_interpretation: interpretation,
    lower_to: rise ? { ...LOWER_TO_TARGET } : null,
    stage3_gate_held: rise ? 'STAGE-3-GATE-HELD' : null,
  };
}

// ---------------------------------------------------------------------------
// The writer.
// ---------------------------------------------------------------------------

/**
 * Build one measurement record (the object the store receives). Pure: no
 * clock reads beyond `now`, no writes, no reads of any store.
 */
export function buildStage2Measurement({
  ledger,
  manifests = [],
  holds = {},
  machineryFixes = [],
  now = new Date(),
  windowSize = WINDOW_SIZE,
}) {
  const clock = now instanceof Date ? now : new Date(now);
  const orders = stage2WorkOrders(ledger);
  const window = stage2Window(orders, { size: windowSize, machineryFixes });
  // The window's train lines: non-replay train lines in the window's era —
  // at or after the first window order's ts (a train merging a window order
  // finishes after that order's line is written, so the era bound holds).
  const allTrains = (ledger ?? []).filter(
    (l) => l && l.type === 'train' && !(l.train && l.train.replay_of != null),
  );
  const firstTs = window.length ? Date.parse(window[0].ts) : NaN;
  const trainLines = Number.isFinite(firstTs)
    ? allTrains.filter((t) => {
      const tt = Date.parse(t.ts);
      return Number.isFinite(tt) && tt >= firstTs;
    })
    : [];
  const verdict = stage2Verdict(window, trainLines, { holds });
  const trainReviewMm = trainLines.reduce((s, t) => s + (Number.isFinite(t.mm) ? t.mm : 0), 0);
  const perJobReviewMm = window
    .filter((o) => !o.stale)
    .reduce((s, o) => s + (Number.isFinite(o.review_mm) ? o.review_mm : 0), 0);
  const staleRuns = window
    .filter((o) => o.stale)
    .map((o) => ({ id: o.id, ts: o.ts, reason: o.stale_reason }));
  return {
    measured_on: localDate(clock),
    method:
      'loop/lib/measure-stage2.mjs appendStage2Measurement over data/ledger.jsonl: work orders are the job lines carrying items (task 67); per-job review minutes from review* phases (task 59s); train-review model-minutes from the train lines (task 36 shape, re-reviews included); findings per subject from the train lines\' findings_not_in_any_record_by_subject (task 68, beside task 44\'s count); merged items per train joined through caller-supplied .train/manifest.json contents; window = first twenty work orders (task 68)',
    task: 68,
    window_size: windowSize,
    window: {
      order_count: window.length,
      orders: window.map((o) => ({
        id: o.id,
        ts: o.ts,
        n: o.n,
        subjects: o.subjects,
        review_mm: o.review_mm,
        ...(o.stale ? { stale: true, stale_reason: o.stale_reason } : {}),
      })),
      merged_items_per_train: mergedItemsPerTrain(ledger, manifests),
      review_minutes: {
        per_job_review_mm: Math.round(perJobReviewMm * 100) / 100,
        train_review_mm: Math.round(trainReviewMm * 100) / 100,
      },
    },
    n_levels_represented: verdict.n_levels_represented,
    guarded: verdict.guarded,
    window_counts: verdict.window_counts,
    guard_reason: verdict.guard_reason,
    rates: verdict.rates,
    rate_n_ge_3: verdict.rate_n_ge_3,
    rate_n_1: verdict.rate_n_1,
    rise: verdict.rise,
    findings: verdict.findings,
    ...(verdict.zero_findings_interpretation
      ? { zero_findings_interpretation: verdict.zero_findings_interpretation }
      : {}),
    ...(verdict.lower_to ? { lower_to: verdict.lower_to } : {}),
    ...(verdict.stage3_gate_held ? { stage3_gate: verdict.stage3_gate_held } : {}),
    stale_runs: staleRuns,
    rule_set: STAGE2_RULE_SET,
  };
}

/**
 * Append one measurement record to the task-52 store. APPEND-ONLY: the file
 * is never read here and never rewritten — prior lines are untouched bytes,
 * and the record carries its date and method the way task 52 records do.
 */
export function appendStage2Measurement({
  storePath,
  ledger,
  manifests = [],
  holds = {},
  machineryFixes = [],
  now = new Date(),
  windowSize = WINDOW_SIZE,
}) {
  const record = buildStage2Measurement({ ledger, manifests, holds, machineryFixes, now, windowSize });
  mkdirSync(dirname(storePath), { recursive: true });
  appendFileSync(storePath, `${JSON.stringify(record)}\n`, 'utf8');
  return record;
}
