/**
 * config.mjs — `data/config.json`, the one normative loop config.
 *
 * A reserved path (specs/loop, breaker 4): the maintainer edits it, no job
 * may. Nothing here invents a default for a bound — a malformed config is an
 * error, not something to paper over, because the bounds are the whole point
 * of the budget.
 */

import { readFileSync } from 'node:fs';

/**
 * Every job type, closed list (specs/loop). Adding one needs an OpenSpec change.
 *
 * `scout` is the daily outward sweep (make-the-blog-worth-sending, task 2.1;
 * specs/loop, "The scout looks outward"). Adding it here is the SECOND half of
 * a two-step edit and the order is load-bearing: `loadConfig` below refuses a
 * config with no `job_caps_minutes` entry for a listed type, so this line
 * landing before `data/config.json` gains `scout: 60` breaks every loop
 * invocation, not just a scout one. `data/config.json` is a reserved path — the
 * maintainer's, never a job's — so the two halves are written by two actors and
 * `loop/tests/config.test.mjs` measures that the config half is really there.
 */
export const JOB_TYPES = Object.freeze([
  'interpret',
  'verify',
  'entry',
  'tutorial',
  'post',
  'education',
  'scout',
  'repair',
  'prune',
  'machinery',
]);

/**
 * Every ledger outcome, closed list.
 *
 *  - `done`        merged (or, for a job that never needed a merge, finished
 *                  and accepted)
 *  - `failed`      the executor finished but gates or review rejected the work
 *  - `discarded`   two non-approvals; branch closed, record kept
 *  - `blocked`     the executor honestly reported it could not proceed
 *  - `interrupted` killed at the cap, or exited with no well-formed RESULT.md
 *  - `capacity`    the provider's allowance ran out
 *  - `abandoned`   a resumable branch aged past the 14-day limit
 *
 * Only `failed` and `discarded` are failures (specs/loop, breaker 1).
 */
export const OUTCOMES = Object.freeze([
  'done',
  'failed',
  'discarded',
  'blocked',
  'interrupted',
  'capacity',
  'abandoned',
]);

export const FAILURE_OUTCOMES = Object.freeze(['failed', 'discarded']);

/** Constants normative in specs/loop but deliberately not in config.json (see data/README.md). */
export const LANE_BACKOFF_FIRST_MS = 60 * 60 * 1000; // 1 hour
export const LANE_BACKOFF_MAX_MS = 6 * 60 * 60 * 1000; // 6 hours
export const PROPOSAL_COOLING_DAYS = 3;
export const RESUMABLE_MAX_AGE_DAYS = 14;

/**
 * A JOB'S TOTAL BUDGET, as a multiple of its per-type per-invocation cap
 * (beads addictedtoai-o5t; design D9, option A).
 *
 * `job_caps_minutes` gives one wall-clock cap per job type and the loop passed
 * it unchanged to every invocation — the author, the revision, and each of the
 * two review passes. A job revised once therefore made FOUR invocations, each
 * entitled to the full cap, and nothing anywhere bounded their sum. Measured on
 * `data/ledger.jsonl`, job `j-20260831-08` spent 54.55 model-minutes across
 * exactly that shape (author 32.55, review1 5.54, revision 12.03, review2 4.44);
 * nothing was wrong with that run, and it is the demonstration that the number
 * every brief printed was a quarter of what a job could spend.
 *
 * WHY A MULTIPLE OF THE CAP AND NOT A KEY IN `data/config.json`. Three reasons,
 * and the first is not "because the file is reserved":
 *
 *  1. `data/README.md` documents `config.json` as FOUR key groups and only four,
 *     and `build-initial-site` task 1.3 verifies that count. A fifth group is a
 *     larger change than this defect, and it is the same objection the D8
 *     write-up raises against putting the warm-up denominator there.
 *  2. Derived, the total stays coherent when a cap is edited. This is exactly
 *     the argument `budget.mjs` already makes for `warmUpMm()`: a maintainer who
 *     edits a cap should not have to edit a second number to keep the arithmetic
 *     true, and a hard-coded constant beside a config value is the drift that
 *     module already eliminated once.
 *  3. There is a documented home for precisely this kind of value — the block
 *     above. The lane backoff, the cooling period and the 14-day resumable limit
 *     are all policy normative in specs/loop and deliberately not in the config.
 *
 * WHY 2, MEASURED RATHER THAN CHOSEN. The value is pinned on both sides:
 *
 *  - It must be **greater than 1**, or an author that legitimately used its whole
 *    runaway guard would leave nothing for the review that must happen before
 *    anything merges. That would silently convert a spend limit into "no job may
 *    use its author cap", which is a different rule that nothing asked for.
 *  - It must be **less than 4**, or it bounds nothing: four invocations at the
 *    full cap is exactly what is possible today.
 *
 * 2 is the smallest value satisfying the first, and the property it buys is
 * exact: **the author and one review each get their full per-invocation guard,
 * unconditionally, whatever the other spends.** Only the revision and the delta
 * review — the third and fourth invocations, which exist only because a reviewer
 * asked for changes — can ever be squeezed. Picking the tightest value that
 * preserves a stated property is the same move `warmUpJobs()` makes in the other
 * direction, where the requirement is the most permissive value that preserves
 * one.
 *
 * WHAT IT ACTUALLY CHANGES, measured against the live `data/config.json`: the
 * worst case per job falls from 480 minutes to 240 (from 240 to 120 for
 * `scout`). It refuses nothing this Desk has yet run — the largest recorded job
 * total is 54.55 model-minutes against a 120-minute cap, 0.45x — which is the
 * honest statement of its reach: it halves an unbounded worst case, it does not
 * tighten day-to-day spending. The lever that tightens that is `job_caps_minutes`
 * itself, and that is the maintainer's.
 */
export const JOB_TOTAL_CAP_MULTIPLIER = 2;

/**
 * The shortest invocation worth starting, in minutes (beads addictedtoai-o5t).
 *
 * The wrinkle option A has to design rather than discover: once each invocation
 * is capped at what the job has left, a late review pass can inherit a remainder
 * too small to judge anything in. A review killed at its cap writes no verdict
 * record, and the merge gate then fails the job at `no-record` — so a stub review
 * does not save minutes, it spends the whole job. Handing one out would quietly
 * convert a spend limit into a review-quality limit, which is the failure mode
 * this floor exists to refuse.
 *
 * DERIVED FROM MEASUREMENT, not chosen: across every phase-carrying line in
 * `data/ledger.jsonl` as of 2026-08-31, the longest invocation that was not the
 * author run is 12.03 model-minutes (j-20260831-08's revision); the fourteen
 * recorded review passes run 2.82–8.47. 15 is the smallest multiple of five above
 * every one of them, so an invocation granted exactly this floor would have been
 * enough for every non-author invocation this Desk has ever made.
 *
 * Clamped to the per-type cap by `minInvocationMinutes()`: a type whose cap is
 * below the floor would otherwise be unable to start its own author run, and a
 * bound that deadlocks a job type is worse than no bound.
 */
export const MIN_INVOCATION_MINUTES = 15;
// `BLOG_CEILING_POSTS` / `BLOG_CEILING_DAYS` stood here and are gone
// (make-the-blog-worth-sending, task 1.3). Publishing is quality-gated, never
// quota-driven: no selector rule counts published posts. What limits volume now
// is the scout's filing cap at merge, the review gate, and the model-minute
// budget — none of which needs to know how many posts the blog already holds.

/** Material fields for `interpret` shedding (specs/pulse, specs/loop). */
export const MATERIAL_FIELDS = Object.freeze(['price', 'licence', 'license', 'status']);

export function loadConfig(ctx) {
  let raw;
  try {
    raw = readFileSync(ctx.configPath, 'utf8');
  } catch (e) {
    throw new Error(`cannot read config at ${ctx.configPath}: ${e.message}`);
  }
  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (e) {
    throw new Error(`${ctx.configPath} is not valid JSON: ${e.message}`);
  }

  const need = (path, v) => {
    if (v === undefined || v === null) {
      throw new Error(`${ctx.configPath} is missing required key: ${path}`);
    }
    return v;
  };

  need('publish', cfg.publish);
  need('budget', cfg.budget);
  need('budget.window_days', cfg.budget.window_days);
  need('budget.categories', cfg.budget.categories);
  need('budget.bounds', cfg.budget.bounds);
  need('budget.bounds.upkeep_floor_pct', cfg.budget.bounds.upkeep_floor_pct);
  need(
    'budget.bounds.new_writing_ceiling_pct',
    cfg.budget.bounds.new_writing_ceiling_pct,
  );
  need('budget.bounds.machinery_ceiling_pct', cfg.budget.bounds.machinery_ceiling_pct);
  need('job_caps_minutes', cfg.job_caps_minutes);
  need('degradation', cfg.degradation);
  need('degradation.window_hours', cfg.degradation.window_hours);
  need('degradation.shed_levels', cfg.degradation.shed_levels);

  for (const t of JOB_TYPES) {
    if (typeof cfg.job_caps_minutes[t] !== 'number') {
      throw new Error(
        `${ctx.configPath}: job_caps_minutes is missing a cap for job type "${t}"`,
      );
    }
  }
  return cfg;
}

/** Which budget category a job type belongs to, per config.budget.categories. */
export function categoryOf(cfg, type) {
  for (const [cat, types] of Object.entries(cfg.budget.categories)) {
    if (types.includes(type)) return cat;
  }
  return null;
}
