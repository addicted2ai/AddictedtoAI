/**
 * config.mjs — `data/config.json`, the one normative loop config.
 *
 * A reserved path (specs/loop, breaker 4): the maintainer edits it, no job
 * may. Nothing here invents a default for a bound — a malformed config is an
 * error, not something to paper over, because the bounds are the whole point
 * of the budget.
 */

import { readFileSync } from 'node:fs';

/** Every job type, closed list (specs/loop). Adding one needs an OpenSpec change. */
export const JOB_TYPES = Object.freeze([
  'interpret',
  'verify',
  'entry',
  'tutorial',
  'post',
  'education',
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
export const BLOG_CEILING_POSTS = 3;
export const BLOG_CEILING_DAYS = 7;

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
