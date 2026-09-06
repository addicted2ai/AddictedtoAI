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

/**
 * The per-brief spec-excerpt budget, in characters (design decision, beads
 * addictedtoai-ccs — RULED 2026-08-31, the maintainer's delegated decision).
 *
 * `loop/lib/specs.mjs` `excerptsFor()` defaults to 14,000 and would keep that
 * default for any caller that does not override it. This is the override, and
 * `loop/lib/brief.mjs` `assembleBrief()` is the only caller inside the loop, so
 * this constant is what every real brief actually gets.
 *
 * THE TENSION IT RESOLVES. specs/loop rule 3 is "no minimum context window":
 * the loop must not require a large context to run at all. 14,000 characters
 * (~3,500 tokens) honoured that literally — until a job type's briefed
 * capabilities carry an in-flight OpenSpec delta alongside their constitution
 * (`specs.mjs` `specSources`, added when a hardcoded fallback to one archived
 * change was repaired), which doubles the number of sources sharing one
 * budget. MEASURED against the live tree 2026-08-31, with
 * `make-the-blog-worth-sending` amending `loop`, `editorial`, `review` and
 * `blog`: at 14,000 chars, three of ten job types (`entry`, `post`, `scout`)
 * had at least one `### Requirement:` section cut mid-sentence — the scout's
 * own defining requirement ("The scout looks outward") quoted at 40% of its
 * 5,799 characters. `specs.mjs` already marks every cut with a `[... CUT ...]`
 * note naming the file to read in the worktree, so this was never a SILENT
 * truncation (the sharper defect addictedtoai-ccs's own repair already
 * closed) — but a normative SHALL a reader has to leave the brief to finish
 * reading is still a worse brief than one that does not need to.
 *
 * THE NUMBER, MEASURED RATHER THAN GUESSED. Re-run against the same live tree
 * at 20,000 characters: every one of the ten job types' excerpts has ZERO
 * sections cut mid-requirement — every `### Requirement:` quoted is quoted
 * whole. (`truncated` can still read `true` at 20,000 for some types: that
 * flag also fires when a lower-scoring section is left out ENTIRELY, which
 * this budget does not try to eliminate and should not — a whole section
 * omitted, with the "read the full file in this worktree" note `excerptsFor`
 * already attaches, is a legitimate failure mode; a section chopped
 * mid-requirement, leaving a fragment that reads as complete, is the one this
 * number exists to stop.) 14,000 was tight enough to cut on today's tree;
 * 20,000 was not, for any type measured.
 *
 * WHY THIS DOES NOT REOPEN "NO MINIMUM CONTEXT WINDOW". 20,000 characters is
 * still on the order of 5,000 tokens. Rule 2 already requires an executor
 * that can read files, run shell commands, and act unattended — an agentic
 * coding harness — and any harness meeting that bar needs many times this for
 * its own tool-use scaffolding and system prompt; `loop/conformance.mjs`
 * already exercises every registered runner against briefs of this shape.
 * Raising the shared budget by 43% does not create a dependency rule 3
 * forbids; it stops the budget from being tighter than the
 * constitution-plus-delta shape rule 4 ("every brief carries... the relevant
 * spec excerpts") already produces once more than one source exists per
 * capability — a shape this loop's own repair introduced, not one this number
 * invented a reason to grow into.
 *
 * WHY A CONSTANT HERE RATHER THAN A NEW DEFAULT IN `specs.mjs`. The same
 * reasoning as `JOB_TOTAL_CAP_MULTIPLIER` above: one declared, documented
 * value the loop passes in, rather than a bare number changed at its point of
 * use with no reasoning attached. `excerptsFor`'s own default (14,000) is
 * UNCHANGED by this — only what `brief.mjs` passes to it changes.
 *
 * WHAT WAS CONSIDERED AND NOT DONE. Weighting a source's share by relevance
 * instead of splitting it evenly — so the single highest-scoring section in
 * the whole plan is quoted whole before any source takes a second — would use
 * a fixed budget more precisely. It is a more invasive change to
 * `excerptsFor`'s own allocation algorithm in `specs.mjs`, which this ruling
 * does not touch, and it is unneeded once the flat raise alone measures at
 * zero mid-requirement cuts across every job type today.
 *
 * ---------------------------------------------------------------------------
 * RE-MEASURED 2026-08-31, raised 20,000 -> 24,000
 * (`link-the-machines-work-to-beads`, `addictedtoai-occ0`).
 *
 * A THIRD in-flight delta now amends `loop`, and the even split is per SOURCE,
 * so each source's share fell from a half to a third of the budget. At 20,000
 * the `scout` type had TWO sections cut mid-requirement; every other type had
 * none. This is the same structural cause the 14,000 -> 20,000 raise recorded,
 * one source further along, and it is worth being precise about what did NOT
 * cause it: the delta that tipped it is 6,078 characters, the SMALLEST of the
 * three `loop` sources by a wide margin (the constitution is 36,978 and
 * `make-the-blog-worth-sending`'s delta is 21,976). Trimming the new delta
 * would have been treating the symptom — it is not the large source, it is
 * merely the third one.
 *
 * THE NUMBER, MEASURED RATHER THAN GUESSED, by scanning every budget from
 * 14,000 upward in 500-character steps and recording the smallest at which
 * each job type has zero mid-requirement cuts:
 *
 *     scout      21,500      interpret  16,500      education  15,500
 *     entry      15,000      post       15,000      verify     14,000
 *     tutorial   14,000      repair     14,000      prune      14,000
 *     machinery  14,000
 *
 * 21,500 is therefore the measured floor for the tree as it stands today.
 * 24,000 is what is set, and the headroom is deliberate rather than rounding:
 * a value at the floor is re-broken by the next delta that lands, and this
 * constant has now been re-measured twice for exactly that reason. The gap is
 * roughly one more source's share for the capability under heaviest amendment.
 *
 * RE-MEASURED A THIRD TIME, 2026-09-05, AND THE WAY IT BROKE IS THE USEFUL
 * PART. Job j-20260905-17 was drafting an OpenSpec change and FAILED ITS OWN
 * GATES on this test — because the third in-flight change it had just written
 * was in its worktree when the gates ran. That is the shape to remember: a
 * spec-drafting job is measured against a tree that includes its own output,
 * so it can break a budget that the tree it branched from satisfied. The live
 * tree passed both before and after, which is why the failure looked transient
 * and was not.
 *
 * MEASURED by copying `openspec/` to a temp root, adding synthetic changes
 * modelled on the real ones (same capabilities, same delta sizes), and binary-
 * searching the lowest budget at which no job type cuts:
 *
 *     in-flight changes    2 -> 23,090      3 -> 39,085
 *                          4 -> 50,703      5 -> 63,080
 *
 * So 24,000 was already within 910 characters of its floor, and the third
 * change overshot it by fifteen thousand. The cost is roughly 13,000
 * characters per additional change amending the same capabilities.
 *
 * 56,000 is set: clean at four in-flight changes with headroom, which is one
 * more than the planned peak of three (addictedtoai-9c9t, -1hjf, and the §4
 * claim-record change). The growth is LINEAR IN IN-FLIGHT CHANGES and this
 * constant will therefore be re-broken again — raising it is restoring service,
 * not a fix, and the structural answer is filed as addictedtoai-2sx8. Archiving
 * a finished change is what actually lowers this number, which is one more
 * reason not to leave changes unarchived.
 * ---------------------------------------------------------------------------
 */
export const BRIEF_EXCERPT_MAX_CHARS = 56000;
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
