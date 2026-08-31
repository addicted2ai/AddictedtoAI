/**
 * budget.mjs — the selector's arithmetic: budget shares, the upkeep floor,
 * lane pauses, and capacity degradation.
 *
 * Those four read `data/ledger.jsonl` and the clock; the job-total bound at the
 * top of the file reads the ledger and nothing else, because a budget that
 * accumulates across runs cannot be a function of what time it is now.
 *
 * Nothing here is stored state; nothing here is a prediction. specs/loop is explicit that a
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
  JOB_TOTAL_CAP_MULTIPLIER,
  LANE_BACKOFF_FIRST_MS,
  LANE_BACKOFF_MAX_MS,
  MIN_INVOCATION_MINUTES,
} from './config.mjs';
import { withinWindow } from './ledger.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;

/* ---------------------------------------------------------------------------
 * A JOB'S TOTAL SPEND (beads addictedtoai-o5t).
 *
 * Everything else in this module is the SELECTOR's arithmetic: it answers "may
 * a job of this type start at all", once, before anything runs. The three
 * functions below answer a different question at a different moment — "may this
 * job make another invocation, and how long may it be" — and they are here
 * because this is the file whose job is what a job may spend, and because a
 * second home for that would be two definitions that can drift.
 *
 * They read no clock and no window. Their only input beyond the config is the
 * job's own accumulated spend, which the caller gets from `jobSpendSoFar()` —
 * the ledger, which is the only durable record of what an earlier run cost.
 *
 * RULED 2026-08-31 (beads addictedtoai-z7a, the maintainer's delegated
 * decision): THE GUARANTEE IS HONEST ONLY IF STATED PRECISELY. "A job cannot
 * spend more than its total, counting what the ledger records" is true of the
 * mechanism above; "counting what the job cost" is not, and this paragraph is
 * that distinction written down where the bound is defined, per the issue's
 * own framing.
 *
 * THE HOLE, restated: `run.mjs` writes the job's ledger line (via its
 * `recordOutcome()`) only after an invocation returns. Model-minutes are
 * measured by the loop's own clock, inside the loop's own process
 * (`lib/exec.mjs`). A process that dies before that write — SIGKILL from
 * outside, a machine reboot, power loss — contributes ZERO recorded spend for
 * that invocation, even though it may have run for most of its cap and left
 * partial work committed to the branch (which `scanJobBranches` correctly
 * finds resumable). The measurement and the process that would record it die
 * together.
 *
 * WHAT WAS MEASURED BEFORE RULING, per the issue's own instruction to price
 * this against what remains rather than what it used to be. `addictedtoai-1yt`
 * removed `loop/run.mjs`'s `process.exit()` call the same day this issue was
 * filed, and the issue text suggested that removal closed "one real way to
 * die before writing". Read against `run.mjs`'s actual control flow, it does
 * not, for a narrower and more precise reason than "the crash was fixed":
 * that `process.exit()` was called exactly once, at the top of `main()`'s
 * `.then()`, strictly AFTER `runLoop()` returns — and on the only path that
 * ever reaches a `fetch()` call (`publishStep`, inside the merged/`done`
 * branch), `recordOutcome()` is called explicitly BEFORE `rederiveStep()` and
 * BEFORE `publishStep()` (see the "THE LEDGER LINE IS WRITTEN BEFORE ANYTHING
 * RECOMPUTES THE QUEUE FROM IT" comment lower in `run.mjs`). So even under the
 * pre-1yt code, that specific crash could only fire after the ledger line for
 * the run in question had already been written to disk and already committed
 * to git — it could not have been the cause of a lost line. What 1yt actually
 * fixed is a DIFFERENT harm: a run that crashed there reported the wrong EXIT
 * CODE (0xC0000409 instead of the real one), not a lost ledger line. Recorded
 * here rather than as an edit to `addictedtoai-1yt`'s own (closed) text, per
 * this repository's rule that a note inside something already closed is a
 * note that is already lost — this comment, in a file this loop actually
 * reads, is the durable place for it.
 *
 * So the residual risk this bound cannot close is unchanged by 1yt: a process
 * killed from OUTSIDE this program — not by anything `loop/` itself does —
 * during the awaited span between an invocation starting and `recordOutcome()`
 * running. No application-level mechanism inside this process can close that
 * gap in general, because the same kill that loses the spend record would
 * just as readily lose a heartbeat line written to try to capture it first —
 * the write and the process that would make it die together either way.
 *
 * OPTIONS WEIGHED, per the issue, and why none is taken:
 *  - A heartbeat line at invocation START, superseded by the real line at the
 *    end. Closes SOME of the gap (a heartbeat's own write is smaller and
 *    earlier, so it is less likely to race the kill) but introduces a SECOND
 *    notion of "what has happened" beside the ledger — exactly what the
 *    ledger-before-rederive fix (`addictedtoai-942`) argued against adding,
 *    for the same reason: two records of history that can disagree is worse
 *    than one record with a known, stated limit.
 *  - A flat penalty charged to a resumed branch for each ledger line missing
 *    relative to its commit count. It is an ESTIMATE, and this repository's
 *    rule (`data/derived/` is a pure function of state; nothing here is a
 *    prediction) does not put estimates on the ledger — the whole reason MM is
 *    measured wall-clock rather than modelled from tokens.
 *  - RULED: accept it, and state the limit here, where the bound is defined —
 *    which is what this paragraph is. No measured incident supports building
 *    machinery for this: no resumed branch has ever shown evidence of spend
 *    the ledger did not record (checked against `data/ledger.jsonl` and the
 *    live `job/*` branches, 2026-08-31 — every branch with a job id has a
 *    matching ledger line). Building either alternative would be inventing
 *    machinery for a risk this repository cannot currently measure, which the
 *    ruling above this one (dyw) declines to do for the same reason.
 * ------------------------------------------------------------------------ */

/**
 * The TOTAL wall-clock budget for one job of `type`, covering every invocation
 * it makes: authoring, the revision, and each review pass.
 *
 * Null when the type has no cap. `loadConfig` refuses such a config outright, so
 * this is reachable only from a hand-built one, and the honest answer there is
 * "no bound is defined" rather than an invented default.
 */
export function jobTotalMinutes(cfg, type) {
  const cap = cfg?.job_caps_minutes?.[type];
  if (typeof cap !== 'number' || !Number.isFinite(cap) || cap <= 0) return null;
  return cap * JOB_TOTAL_CAP_MULTIPLIER;
}

/** The shortest invocation worth starting for a job of `type`, clamped to its cap. */
export function minInvocationMinutes(cfg, type) {
  const cap = cfg?.job_caps_minutes?.[type];
  if (typeof cap !== 'number' || !Number.isFinite(cap) || cap <= 0) return MIN_INVOCATION_MINUTES;
  return Math.min(MIN_INVOCATION_MINUTES, cap);
}

/**
 * What the NEXT invocation of this job may spend.
 *
 * TWO THINGS AT ONCE, and both matter:
 *
 *  - `capMinutes` is `min(per-invocation cap, what the job has left)`. The
 *    per-invocation cap is UNTOUCHED as an upper bound — it is a runaway-process
 *    guard and this never raises it, only ever lowers it. That is what makes the
 *    number a brief prints and the number the budget spends the same number.
 *  - `ok: false` when what is left is below the minimum-invocation floor. The
 *    refusal happens BEFORE the invocation, so the bound is exact rather than
 *    exceeded-then-noticed: a job cannot spend past its total, because no
 *    invocation is ever started with more than the remainder.
 *
 * @param {object} cfg
 * @param {string} type      the job type
 * @param {number} spentMm   model-minutes already charged to this job, across
 *                           every run of it — `jobSpendSoFar()` plus whatever
 *                           the current run has spent so far
 * @param {string} [role]    what is about to be invoked, for the refusal text
 * @returns {{ok: true, capMinutes: number, derived: boolean, ...} |
 *           {ok: false, rule: string, reason: string, ...}}
 */
export function invocationAllowance(cfg, { type, spentMm = 0, role = 'invocation' } = {}) {
  const cap = cfg?.job_caps_minutes?.[type];
  const total = jobTotalMinutes(cfg, type);
  const spent = Number(spentMm) || 0;
  if (total === null) {
    return {
      ok: true,
      capMinutes: typeof cap === 'number' && cap > 0 ? cap : null,
      derived: false,
      per_invocation_cap_minutes: cap ?? null,
      total_minutes: null,
      spent_mm: Math.round(spent * 100) / 100,
      remaining_minutes: null,
      floor_minutes: null,
    };
  }
  const floor = minInvocationMinutes(cfg, type);
  const remaining = total - spent;
  const common = {
    per_invocation_cap_minutes: cap,
    total_minutes: total,
    spent_mm: Math.round(spent * 100) / 100,
    remaining_minutes: Math.round(remaining * 100) / 100,
    floor_minutes: floor,
  };
  if (remaining < floor) {
    return {
      ...common,
      ok: false,
      rule: 'job:total-budget',
      reason:
        `this ${type} job has spent ${spent.toFixed(2)} of its ${total}-minute total budget ` +
        `(the ${cap}-minute per-invocation cap × ${JOB_TOTAL_CAP_MULTIPLIER}), leaving ` +
        `${remaining.toFixed(2)} minutes — below the ${floor}-minute minimum for an invocation ` +
        `worth starting. The ${role} is not invoked and the job is recorded \`abandoned\`: an ` +
        `invocation too short to do its work is not a cheaper invocation, and a truncated ` +
        `review is not a cheaper review.`,
    };
  }
  return {
    ...common,
    ok: true,
    // Never above the per-invocation cap: the runaway guard is an upper bound
    // this only ever tightens.
    //
    // Rounded DOWN to 2dp, and down rather than to-nearest deliberately: this
    // number is both a kill deadline and a figure printed in a brief, and
    // `70 - 54.55` is `15.450000000000003` in binary floating point. Rounding up
    // would grant a few milliseconds more than the job has left, which is a
    // bound that does not quite hold; rounding down cannot.
    capMinutes: Math.floor(Math.min(cap, remaining) * 100) / 100,
    // True when the JOB's remainder, not the runaway guard, is what set the cap
    // — which is the only case worth saying out loud in a log or a brief.
    derived: remaining < cap,
  };
}

/**
 * The tightest ceiling in `data/config.json`, as a percentage.
 *
 * Every `*_ceiling_pct` bound is considered, so adding a third category's
 * ceiling cannot silently leave this reading only the two that exist today.
 * The fallback matters only for a hand-built config with no ceilings at all,
 * where no ceiling binds and the warm-up denominator changes nothing.
 */
export function tightestCeilingPct(cfg) {
  const pcts = Object.entries(cfg?.budget?.bounds ?? {})
    .filter(([k, v]) => k.endsWith('_ceiling_pct') && typeof v === 'number' && Number.isFinite(v) && v > 0)
    .map(([, v]) => v);
  return pcts.length ? Math.min(...pcts) : 10;
}

/**
 * How many full-length jobs a rolling window must be able to hold before a
 * ceiling is measured against the window's own total rather than against this
 * floor.
 *
 * DERIVED, not chosen, and now derived IN CODE rather than in a comment. It was
 * the literal `10`, which is `100 / 10` for the 10% machinery ceiling — correct
 * for today's config and silently wrong the moment that percentage is edited,
 * which is exactly the drift the sibling `warmUpMm()` already avoids by reading
 * the live caps. Nothing about the constant announced its dependency, so the
 * dependency is now a function argument.
 */
export function warmUpJobs(cfg) {
  return 100 / tightestCeilingPct(cfg);
}

/**
 * The warm-up denominator: the smallest window a *share* means anything in.
 *
 * RULED 2026-08-31 (design D8, beads addictedtoai-tr8 — the maintainer's
 * delegated decision, adopted as Option A from design.md: "adopt the
 * implemented reading"). This was carried for a day as "a reading, recorded
 * rather than hidden... this decides NOTHING about which denominator is
 * correct" while D8 stayed open; it no longer is. The mechanism below is
 * UNCHANGED by the ruling — it was already the recommended shape — what
 * changed is that it is now the decided answer, not a placeholder for one.
 * WHY THIS READING AND NOT THE TWO ALTERNATIVES design.md weighed: (B) revert
 * to the literal spec arithmetic reintroduces the exact defect
 * addictedtoai-3on measured — one job saturating a category for 30 days —
 * which is a worse failure than a stated substitution; (C) suspend ceilings
 * until the window holds N jobs trades a smooth warm-up for a cliff, binding
 * on nothing and then fully at job N+1, which is a harder thing to explain to
 * an operator than "measured against the larger of two denominators, both
 * named". WHERE THE WARM-UP NUMBER LIVES, ALSO RULED: derived from
 * `job_caps_minutes` and the tightest configured ceiling, exactly as
 * implemented, not a `data/config.json` key — both inputs are already
 * configuration, so a maintainer who edits a cap or a ceiling gets a coherent
 * warm-up without editing a third number, and a config key would add a fifth
 * key group to the four `build-initial-site` task 1.3 verifies. The
 * corresponding requirement text (drafted in the archived
 * `harden-seed-wave-guardrails` design.md as "DRAFT — NOT ADOPTED") belongs in
 * `openspec/specs/loop/spec.md`, a reserved path this file may not edit; the
 * OpenSpec change to land it is filed separately as beads addictedtoai-fq4a.
 *
 * WHAT FOLLOWS BELOW is the reasoning as it was recorded while the question
 * was still open, kept because the arithmetic and its motivation have not
 * changed — only its status has. specs/loop says a category's share is its MM
 * divided by the tier's total MM over the rolling 30 days. After exactly one
 * real job that arithmetic said `new_writing 100.0%`, so the 45% ceiling
 * refused every subsequent entry, tutorial, post and education job for a
 * month. The rule is right; at n=1 it has no meaning, because a share is a
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
 * Both factors are derived, not chosen, and both are read from the live config:
 * `warmUpJobs(cfg)` — `100 / tightest ceiling` — times the largest per-type
 * wall-clock cap. At a 10% machinery ceiling and 60-minute caps that is 10 × 60
 * = 600 MM; at the same ceiling and today's 120-minute caps it is 1200 MM.
 *
 * What `100 / tightest ceiling` is, MEASURED rather than intended. It is the
 * LARGEST multiplier at which one maximum-length job still binds the tightest
 * ceiling — the most permissive value that preserves it. One 60-minute job
 * against a 600 MM denominator is exactly 10%, the gate is `>=`, so it IS at
 * the ceiling: the first machinery job is allowed (machinery is at 0% when it
 * is selected) and the second is refused. At 11 the same job would be 9.09%,
 * under the ceiling, and machinery would get two jobs before anything bound;
 * below 10 the ceiling binds harder, so the arithmetic is dominated by a single
 * job's length rather than by a policy. An earlier version of this comment said
 * ten was the *smallest* window in which one job "does not by itself reach" the
 * ceiling. Both halves were false — it reaches it exactly, and reaching it is
 * what refuses the second job, which the next clause always described
 * correctly.
 *
 * 600 MM is also far smaller than any plausible steady-state month for this
 * Desk (one job a day at 30–60 minutes is 900–1800 MM), so every allowance
 * during warm-up is SMALLER than the steady-state allowance it converges to —
 * the ceiling's purpose survives, which is the whole constraint. The machinery
 * cap exists because the previous site spent roughly seven lines of process per
 * line of site, and under warm-up machinery still gets one job before it binds.
 *
 * The upkeep FLOOR is deliberately left alone: a floor measured on a thin
 * window errs toward doing upkeep, which is the safe direction, and it already
 * binds only when an upkeep job is actually available. One upkeep job clears it.
 *
 * RULED 2026-08-31 (beads addictedtoai-dyw, tied to D8 above): what
 * `largestCapMinutes(cfg)` MEASURES, corrected. Every "one maximum-length job"
 * above was written before `addictedtoai-o5t` bounded a job's TOTAL spend at
 * `JOB_TOTAL_CAP_MULTIPLIER` (2) times its per-invocation cap — before that, a
 * job's length was open-ended (four invocations at the cap, unbounded), so
 * "one maximum-length job" was a reasonable stand-in for "one maximum-length
 * invocation", the two having no exact relationship worth stating. `o5t` made
 * the gap exact and nameable: a maximum-length JOB (author + revision + two
 * reviews, each possibly at the full per-invocation cap until the total bites)
 * can now reach `largestCapMinutes(cfg) × JOB_TOTAL_CAP_MULTIPLIER` — 240
 * minutes against today's config, not 120 — while this function still returns
 * the length of one INVOCATION at the largest per-type cap. The property this
 * comment claimed — "one maximum-length job still binds the tightest ceiling"
 * — has therefore been overstated since `o5t` landed: measured against a true
 * maximum-length JOB, `warmUpMm(cfg)` (600 MM at today's config) is only 2.5
 * such jobs, not 10, and the ceiling binds roughly twice as hard during
 * warm-up as the words above claim.
 *
 * TWO WAYS TO SETTLE IT, per the issue: (a) redefine "maximum-length job" to
 * mean `jobTotalMinutes(cfg, type)` and re-derive `warmUpJobs()` so the stated
 * property holds exactly again — which would DOUBLE the warm-up denominator
 * (1200 MM instead of 600 at today's config), a real loosening of every
 * ceiling during warm-up, not a wording fix; or (b) declare the denominator's
 * unit is deliberately one INVOCATION at the largest per-type cap, not one
 * whole job with its possible revision and delta review, and correct the
 * words rather than the arithmetic.
 *
 * RULING: (b). NO NUMBER CHANGES — `warmUpMm(cfg)` is unchanged, still
 * `warmUpJobs(cfg) × largestCapMinutes(cfg)` (600 MM / 1200 MM at today's cheap
 * / frontier configs, per `job-budget.test.mjs` and `budget.test.mjs`'s own
 * fixtures). No ceiling loosens or tightens: BEFORE this ruling and AFTER it,
 * `warmUpMm()` returns the identical value for every config measured
 * (`tightestCeilingPct`, `warmUpJobs`, `largestCapMinutes` are all read-only
 * here — nothing below this comment was edited). The reasons: (1) doubling
 * the warm-up window is a budget-POLICY change — it lets a category spend
 * twice as much before its ceiling binds during warm-up — and `o5t`'s mandate
 * was to ADD a bound on a job's total, not to relax three unrelated ceilings;
 * a decision with that effect deserves its own measurement of what it costs
 * upkeep and new-writing headroom, which nobody has made. (2) The direction of
 * the existing overstatement is safe, not merely tolerable: a SMALLER
 * denominator makes every ceiling bind HARDER, so the warm-up window is
 * currently stricter than the (corrected) property intends, never looser —
 * the same direction `tierShares`' own `0/0` handling and the whole warm-up
 * mechanism already err in. (3) The warm-up window is temporary by
 * construction: the moment a tier's observed total exceeds it, the
 * denominator becomes the observed total and this whole question stops
 * applying — a category that finds warm-up too tight for long is, by
 * definition, no longer in warm-up. (4) No measured harm exists to weigh
 * against the cost: nothing on `data/ledger.jsonl` has ever been refused by
 * the warm-up ceiling binding "too hard" — there is no incident to fix, only
 * a comment that overstated its own guarantee. So this is a documentation
 * correction, not a behaviour change: `largestCapMinutes(cfg)` below measures
 * one maximum-length INVOCATION at the largest per-type wall-clock cap, and
 * every "job" in the paragraphs above should be read that way now.
 */
export function largestCapMinutes(cfg) {
  const caps = Object.values(cfg?.job_caps_minutes ?? {}).filter(
    (n) => typeof n === 'number' && Number.isFinite(n) && n > 0,
  );
  return caps.length ? Math.max(...caps) : 60;
}

export function warmUpMm(cfg) {
  return warmUpJobs(cfg) * largestCapMinutes(cfg);
}

/**
 * The arithmetic a refusal refused on: the numerator, the denominator, and
 * WHERE THE DENOMINATOR CAME FROM (specs/loop delta, `A budget refusal states
 * the arithmetic it refused on`; beads addictedtoai-tr8).
 *
 * A share is a percentage of something and the something is not always the
 * number the reader assumes. This module measures ceilings against
 * `max(observed total, warm-up)` while specs/loop says a category's share is its
 * MM over the tier's rolling total. The divergence is defensible; it was
 * invisible, because a refusal printed a percentage and a percentage hides its
 * own denominator.
 *
 * Design D8 (beads addictedtoai-tr8) — which denominator is correct — is now
 * RULED (see `warmUpMm()` above): the warm-up substitution below is the
 * decided answer, not an undecided reading. What this function does is
 * independent of that ruling either way and would be worth keeping even if D8
 * had gone the other way: it makes the answer impossible to hide — a
 * substituted denominator announces itself, names the value it replaced, and
 * says where it came from, so a refusal is reconstructible from its own text.
 * An origin that is merely true is not enough; the refusal has to be readable
 * by whoever is looking at a job that did not run.
 *
 * @param {object} cfg
 * @param {object} shares  from tierShares()
 * @param {string} cat     the budget category being refused
 * @param {'ceiling'|'floor'} against  a ceiling reads the warm-up; the floor
 *   never does, deliberately — a floor measured on a thin window errs toward
 *   doing upkeep, which is the safe direction.
 */
export function refusalArithmetic(cfg, shares, cat, against) {
  const observed = Number(shares.total_mm) || 0;
  const denominator =
    against === 'ceiling' ? (shares.ceiling_denominator_mm ?? observed) : observed;
  const substituted = denominator !== observed;
  const observedOrigin = `the ${shares.tier} tier's observed rolling ${cfg.budget.window_days}-day total`;
  return {
    category_mm: shares.mm?.[cat] ?? null,
    denominator_mm: denominator,
    denominator_substituted: substituted,
    denominator_origin: substituted
      ? `SUBSTITUTED — the warm-up window (100 / ${tightestCeilingPct(cfg)}% tightest ceiling ` +
        `× ${largestCapMinutes(cfg)}-minute largest per-type cap in data/config.json), used instead of ` +
        `${observedOrigin} of ${observed} model-minutes because a share of a window that thin is not ` +
        `a share of anything`
      : observedOrigin,
  };
}

/** The one sentence every budget refusal appends, so the arithmetic is printed and not merely recorded. */
function arithmeticSentence(a, cat) {
  return (
    ` The arithmetic: ${a.category_mm} model-minutes of ${cat} ÷ ${a.denominator_mm} model-minutes ` +
    `= ${a.denominator_mm ? ((a.category_mm / a.denominator_mm) * 100).toFixed(1) : 'n/a'}%; ` +
    `denominator origin: ${a.denominator_origin}.`
  );
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
    const a = refusalArithmetic(cfg, shares, cat, 'ceiling');
    return {
      ok: false,
      rule: `budget:${cat}-ceiling`,
      ...a,
      reason:
        `${cat} is at ${pct.toFixed(1)}% of the ${shares.tier} tier's ` +
        (warming
          ? `warm-up window of ${shares.ceiling_denominator_mm} model-minutes ` +
            `(${shares.total_mm.toFixed(2)} MM actually recorded in the rolling ` +
            `${cfg.budget.window_days} days — too few for a share to mean anything, so the ` +
            `ceiling is measured against the warm-up instead)`
          : `rolling ${cfg.budget.window_days}-day model-minutes`) +
        `, at or over its ${ceiling}% ceiling — no ${type} job is selectable until ` +
        (warming ? 'the window grows or rolls' : 'the window rolls') +
        '.' +
        arithmeticSentence(a, cat),
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
  // The floor's denominator is the observed rolling total and never the warm-up
  // — deliberate, and now stated in the refusal rather than only in a comment.
  const a = refusalArithmetic(cfg, shares, 'upkeep', 'floor');
  const refused = candidates
    .filter((c) => categoryOf(cfg, c.type) !== 'upkeep')
    .map((c) => ({
      candidate: c,
      rule: 'budget:upkeep-floor',
      ...a,
      reason:
        `upkeep is at ${upkeepShare.toFixed(1)}% of the ${shares.tier} tier's rolling ` +
        `${cfg.budget.window_days}-day model-minutes, below its ${floor}% floor, and an ` +
        `upkeep job is available — only upkeep jobs are selectable in this tier until the ` +
        `floor is met.` +
        arithmeticSentence(a, 'upkeep'),
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
