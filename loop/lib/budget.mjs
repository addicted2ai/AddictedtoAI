/**
 * budget.mjs — the selector's arithmetic: budget shares, the upkeep floor,
 * lane pauses, and capacity degradation.
 *
 * All four read `data/ledger.jsonl` and the clock. Nothing here is stored
 * state; nothing here is a prediction. specs/loop is explicit that a
 * provider's window is unknowable for consumer subscriptions, so the only
 * honest inputs are what already happened and what time it is now.
 *
 * The machinery ceiling in particular is enforced HERE, by the selector,
 * "not by good intentions" — the previous site spent roughly seven lines of
 * process per line of site.
 */

import {
  categoryOf,
  FAILURE_OUTCOMES,
  LANE_BACKOFF_FIRST_MS,
  LANE_BACKOFF_MAX_MS,
} from './config.mjs';
import { withinWindow } from './ledger.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How many full-length jobs a rolling window must be able to hold before a
 * ceiling is measured against the window's own total rather than against this
 * floor. See warmUpMm() for the derivation; the number is not a taste.
 */
export const WARM_UP_JOBS = 10;

/**
 * The warm-up denominator: the smallest window a *share* means anything in.
 *
 * READING, recorded rather than hidden — this is the fix for the defect found
 * by running the loop (beads addictedtoai-3on), and it is a reading of
 * specs/loop rather than a quotation of it. specs/loop says a category's share
 * is its MM divided by the tier's total MM over the rolling 30 days. After
 * exactly one real job that arithmetic said `new_writing 100.0%`, so the 45%
 * ceiling refused every subsequent entry, tutorial, post and education job for
 * a month. The rule is right; at n=1 it has no meaning, because a share is a
 * share OF something and one job is not a something.
 *
 * The existing code already took this reading for the empty case (`0/0` is
 * undefined, so no bound binds). This is the same reading, made continuous
 * instead of a special case: a **ceiling** is evaluated against
 * `max(observed total, warm-up)`. Below the warm-up the question asked is "has
 * this category spent more than 45% of a window worth having?"; above it, the
 * denominator IS the observed total and the rule is exactly the spec's rule,
 * unchanged. There is no cliff and no stored state.
 *
 * The number is derived, not chosen. `WARM_UP_JOBS` (10) times the largest
 * per-type wall-clock cap in `data/config.json` (60 minutes) is 600 MM. Ten is
 * the smallest window in which one maximum-length job does not by itself reach
 * the tightest ceiling: one 60-minute job is exactly 10% of 600, so the first
 * machinery job is allowed and the second is refused. Below ten, the arithmetic
 * is dominated by a single job's length rather than by a policy. 600 MM is also
 * far smaller than any plausible steady-state month for this Desk (one job a
 * day at 30–60 minutes is 900–1800 MM), so every allowance during warm-up is
 * SMALLER than the steady-state allowance it converges to — the ceiling's
 * purpose survives, which is the whole constraint. The machinery cap exists
 * because the previous site spent roughly seven lines of process per line of
 * site, and under warm-up machinery still gets one job before it binds.
 *
 * The upkeep FLOOR is deliberately left alone: a floor measured on a thin
 * window errs toward doing upkeep, which is the safe direction, and it already
 * binds only when an upkeep job is actually available. One upkeep job clears it.
 */
export function warmUpMm(cfg) {
  const caps = Object.values(cfg?.job_caps_minutes ?? {}).filter(
    (n) => typeof n === 'number' && Number.isFinite(n) && n > 0,
  );
  const maxCap = caps.length ? Math.max(...caps) : 60;
  return WARM_UP_JOBS * maxCap;
}

/**
 * Shares within one tier over the rolling window.
 *
 * specs/loop: "a category's share is its MM divided by that tier's total MM
 * over the rolling 30 days, and the bounds SHALL hold in each tier
 * independently". Never summed across tiers.
 *
 * Two percentages come back, and they are not the same number:
 *  - `share_pct` — the observed share, the spec's arithmetic exactly. This is
 *    what gets printed and what the upkeep floor reads.
 *  - `ceiling_pct` — the same MM over `max(total, warm-up)`. Only the ceilings
 *    read this, and it equals `share_pct` for any window past the warm-up.
 */
export function tierShares(cfg, ledger, tier, now) {
  const win = withinWindow(ledger, now, cfg.budget.window_days * DAY_MS).filter(
    (l) => l.tier === tier,
  );
  const total = win.reduce((s, l) => s + (Number(l.mm) || 0), 0);
  const byCategory = {};
  for (const cat of Object.keys(cfg.budget.categories)) byCategory[cat] = 0;
  for (const l of win) {
    const cat = categoryOf(cfg, l.type);
    if (cat) byCategory[cat] += Number(l.mm) || 0;
  }
  const warmUp = warmUpMm(cfg);
  const denominator = Math.max(total, warmUp);
  const shares = {};
  const ceilingPct = {};
  for (const [cat, mm] of Object.entries(byCategory)) {
    // 0/0 is undefined, not 0. An empty tier has no shares at all — see
    // budgetGate for why that means "no bound binds yet".
    shares[cat] = total > 0 ? (mm / total) * 100 : null;
    ceilingPct[cat] = (mm / denominator) * 100;
  }
  return {
    tier,
    total_mm: total,
    mm: byCategory,
    share_pct: shares,
    ceiling_pct: ceilingPct,
    warm_up_mm: warmUp,
    ceiling_denominator_mm: denominator,
    warming_up: total < warmUp,
    lines: win.length,
  };
}

/**
 * Does the budget permit a job of `type` in `tier`?
 *
 * The ceilings only. The upkeep FLOOR is not a per-candidate predicate — it
 * depends on whether an upkeep job is *available* — so it is applied by
 * applyUpkeepFloor() once the candidate list exists.
 *
 * @returns {{ok: true} | {ok: false, rule: string, reason: string}}
 */
export function budgetGate(cfg, shares, type) {
  const cat = categoryOf(cfg, type);
  if (!cat) return { ok: true };
  if (shares.total_mm === 0) {
    // No history in this tier: every share is 0/0. Treating an undefined share
    // as "over the floor" and "under the ceilings" is the only reading that
    // lets a fresh install run at all; the alternative deadlocks the first job.
    return { ok: true };
  }
  const b = cfg.budget.bounds;
  const ceilings = {
    new_writing: b.new_writing_ceiling_pct,
    machinery: b.machinery_ceiling_pct,
  };
  const ceiling = ceilings[cat];
  // The ceiling reads `ceiling_pct`, not `share_pct`: below the warm-up the
  // denominator is the warm-up rather than the handful of minutes recorded so
  // far. See warmUpMm(). `ceiling_pct` is absent only if a caller built a
  // shares object by hand, in which case fall back to the observed share.
  const pct = shares.ceiling_pct?.[cat] ?? shares.share_pct[cat];
  if (ceiling !== undefined && pct >= ceiling) {
    const warming = shares.warming_up && shares.ceiling_denominator_mm > shares.total_mm;
    return {
      ok: false,
      rule: `budget:${cat}-ceiling`,
      reason:
        `${cat} is at ${pct.toFixed(1)}% of the ${shares.tier} tier's ` +
        (warming
          ? `warm-up window of ${shares.ceiling_denominator_mm} model-minutes ` +
            `(${shares.total_mm.toFixed(2)} MM actually recorded in the rolling ` +
            `${cfg.budget.window_days} days — too few for a share to mean anything, so the ` +
            `ceiling is measured against the warm-up instead)`
          : `rolling ${cfg.budget.window_days}-day model-minutes`) +
        `, at or over its ${ceiling}% ceiling — no ${type} job is selectable until ` +
        (warming ? 'the window grows or rolls' : 'the window rolls'),
    };
  }
  return { ok: true };
}

/**
 * The upkeep floor, with its own enforcement point (specs/loop):
 * "when the upkeep share in a tier is below its floor and any upkeep job is
 * available in that tier, only upkeep jobs are selectable in that tier until
 * the floor is met — the floor binds on its own, not merely as the arithmetic
 * residue of the ceilings."
 *
 * @param candidates already past the ceiling/degradation/surface gates
 */
export function applyUpkeepFloor(cfg, shares, candidates) {
  const floor = cfg.budget.bounds.upkeep_floor_pct;
  if (shares.total_mm === 0) return { candidates, refused: [] };
  const upkeepShare = shares.share_pct.upkeep;
  if (upkeepShare === null || upkeepShare >= floor) return { candidates, refused: [] };
  const upkeep = candidates.filter((c) => categoryOf(cfg, c.type) === 'upkeep');
  if (upkeep.length === 0) return { candidates, refused: [] }; // floor binds only when upkeep is available
  const refused = candidates
    .filter((c) => categoryOf(cfg, c.type) !== 'upkeep')
    .map((c) => ({
      candidate: c,
      rule: 'budget:upkeep-floor',
      reason:
        `upkeep is at ${upkeepShare.toFixed(1)}% of the ${shares.tier} tier's rolling ` +
        `${cfg.budget.window_days}-day model-minutes, below its ${floor}% floor, and an ` +
        `upkeep job is available — only upkeep jobs are selectable in this tier until the ` +
        `floor is met`,
    }));
  return { candidates: upkeep, refused };
}

/**
 * Lane pause (specs/loop). A lane is the set of runners sharing a `provider`.
 *
 * "a lane is paused exactly when its most recent ledger line is a `capacity`
 * classification and the backoff interval since that line has not yet
 * elapsed — 1 hour after the first `capacity` in a consecutive run of them,
 * doubling per consecutive `capacity` to a 6-hour maximum; any successful
 * completion on the lane resets the sequence."
 *
 * Implemented exactly: walk the lane's lines backwards; any non-`capacity`
 * line ends the consecutive run.
 */
export function lanePause(ledger, provider, now) {
  const lane = ledger.filter((l) => l.provider === provider);
  if (lane.length === 0) return { paused: false, consecutive: 0 };
  const last = lane[lane.length - 1];
  if (last.outcome !== 'capacity') return { paused: false, consecutive: 0 };
  let consecutive = 0;
  for (let i = lane.length - 1; i >= 0; i--) {
    if (lane[i].outcome === 'capacity') consecutive++;
    else break;
  }
  const backoff = Math.min(
    LANE_BACKOFF_FIRST_MS * Math.pow(2, consecutive - 1),
    LANE_BACKOFF_MAX_MS,
  );
  const since = now.getTime() - Date.parse(last.ts);
  const paused = since < backoff;
  return {
    paused,
    consecutive,
    backoff_ms: backoff,
    resumes_at: new Date(Date.parse(last.ts) + backoff).toISOString(),
    reason: paused
      ? `lane "${provider}" is paused: ${consecutive} consecutive capacity ` +
        `classification(s), backoff ${(backoff / 3600000).toFixed(0)}h, resumes ` +
        `${new Date(Date.parse(last.ts) + backoff).toISOString()}`
      : null,
  };
}

/**
 * Capacity degradation (specs/loop): "a tier's shed level equals the count of
 * `capacity` classifications recorded for that tier in the trailing 48 hours".
 * The exclusions per level live in `data/config.json`.
 */
export function shedState(cfg, ledger, tier, now) {
  const win = withinWindow(ledger, now, cfg.degradation.window_hours * 3600 * 1000);
  const events = win.filter((l) => l.tier === tier && l.outcome === 'capacity').length;
  const levels = [...cfg.degradation.shed_levels].sort(
    (a, b) => a.capacity_events - b.capacity_events,
  );
  let active = null;
  for (const lv of levels) if (events >= lv.capacity_events) active = lv;
  return {
    events,
    level: active ? active.capacity_events : 0,
    exclude_types: active?.exclude_types ?? [],
    interpret_material_only: Boolean(active?.interpret_material_only),
  };
}

/**
 * @returns {{ok: true} | {ok: false, rule: string, reason: string}}
 */
export function degradationGate(cfg, shed, candidate) {
  if (shed.exclude_types.includes(candidate.type)) {
    return {
      ok: false,
      rule: 'degradation:shed',
      reason:
        `shed level ${shed.level} (${shed.events} capacity classification(s) in the ` +
        `trailing ${cfg.degradation.window_hours}h for this tier) excludes ${candidate.type} jobs`,
    };
  }
  if (shed.interpret_material_only && candidate.type === 'interpret' && !candidate.material) {
    return {
      ok: false,
      rule: 'degradation:interpret-material-only',
      reason:
        `shed level ${shed.level} keeps only verify, repair and material-field interpret ` +
        `selectable; this interpret job is not on a material field ` +
        `(price / licence / status)`,
    };
  }
  return { ok: true };
}

/**
 * Breaker 1 (specs/loop): three consecutive failures of the same job type.
 * Only `failed` and `discarded` count. `blocked`, `interrupted`, `capacity`
 * and `abandoned` are skipped entirely — they neither count nor reset, which
 * is what "never count toward this breaker" means. `done` resets.
 */
export function consecutiveFailures(ledger, type) {
  const relevant = ledger.filter(
    (l) => l.type === type && (l.outcome === 'done' || FAILURE_OUTCOMES.includes(l.outcome)),
  );
  let n = 0;
  for (let i = relevant.length - 1; i >= 0; i--) {
    if (FAILURE_OUTCOMES.includes(relevant[i].outcome)) n++;
    else break;
  }
  return n;
}
