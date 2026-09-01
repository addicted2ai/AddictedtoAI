/**
 * dates.mjs — the Desk's one answer to "what day is it" (beads addictedtoai-t9h,
 * addictedtoai-nmr).
 *
 * ---------------------------------------------------------------------------
 * THE DECISION THIS FILE IS, AND THE BOUNDARY IT MAY CROSS: NONE.
 *
 * `addictedtoai-t9h` asked whether one exported local-date helper should be
 * shared by `pulse/`, `lib/`, `loop/` and `scripts/`. The answer is **no**, and
 * this module is deliberately the narrow form: `loop/`'s own helper, imported
 * only within `loop/`, crossing no directory boundary at all.
 *
 * MEASURED on 2026-08-31, by counting the import edges that already exist
 * between the five architectural directories `CLAUDE.md` names:
 *
 *   scripts/ -> lib/     14 imports across 5 files  (already open, already used
 *                        for exactly this: `verify-design` and
 *                        `verify-analytics` both import `todayIso`)
 *   loop/    -> lib/      2 imports, both in `lib/review.mjs`, both about
 *                        review records (`review-hash.mjs`, `reviews.mjs`)
 *   pulse/   -> lib/      ZERO. Not one import, in either direction.
 *
 * That last number is the whole argument. `pulse/` is specified as model-free
 * and independent of the site build, and it is not merely *described* that way
 * — it is measurably that way, with no edge to `lib/` anywhere. A shared helper
 * has to live somewhere, and every candidate is worse than three small copies:
 *
 *  - In `lib/`: the Pulse would import from the site build for the first time
 *    in the repository's life. `lib/facts.mjs` — where `todayIso()` lives —
 *    imports `lib/schema.mjs` (and therefore zod), `lib/data-layer.mjs` and
 *    `lib/units.mjs`. The model-free Pulse would acquire the site build's
 *    validation stack in order to learn what day it is.
 *  - In a new sixth top-level directory: an architectural element added to the
 *    five that `CLAUDE.md` says *are* the design, to hold three lines.
 *  - In `loop/`, imported by the others: same objection as `lib/`, pointed the
 *    other way, and worse — `pulse/` would then depend on the agentic loop.
 *
 * AND THE CONSOLIDATION WOULD NOT HAVE PREVENTED THE RECURRENCE ANYWAY, which
 * is the measurement that actually settles it. Of the **nine** defect sites
 * this class produced, **two** were helpers written wrongly
 * (`pulse/lib/core.mjs` `today()` — addictedtoai-4ih; `lib/facts.mjs`
 * `todayIso()` — addictedtoai-aw6) and **seven** were bare
 * `toISOString().slice(0, 10)` or `getUTC*` written inline by an author who
 * never looked for a helper at all (the seven itemised in addictedtoai-nmr:
 * `verify-design.mjs` x2, `verify-analytics.mjs`, `proposals.mjs`, `run.mjs`,
 * `review.mjs`, `ledger.mjs`). A shared module fixes an implementation once; it
 * does nothing whatever about not reaching for it, and not reaching for it is
 * seven ninths of the problem. So the deliverable that ends the class is not this
 * file — it is `scripts/local-dates.test.mjs`, the source check that fires the
 * moment the bad form is *typed*, on any machine, in any zone.
 *
 * What this file is for, then, is smaller and honest: `loop/` had `localDate`
 * buried in `proposals.mjs`, so the three remaining bad sites could only reach
 * it by importing the proposal engine. `ledger.mjs` imports one module today
 * (`config.mjs`); making it import `proposals.mjs` — and with it `gray-matter`
 * and `issues.mjs` — to format a date would be a worse edge than the bug.
 * ---------------------------------------------------------------------------
 */

/**
 * The LOCAL calendar date of the machine that is writing, as `YYYY-MM-DD`.
 *
 * Not `toISOString().slice(0, 10)`, which is UTC. `CLAUDE.md` and `AGENTS.md`
 * set one convention for the whole repository — *"Every date in this repository
 * is the LOCAL date of the machine that wrote it"* — because the freshness
 * layer compares these dates against each other, and an interval computed
 * across two conventions is off by a day for no reason a later reader can
 * reconstruct. MEASURED at UTC-6: the UTC form writes TOMORROW from 18:00 local
 * onward, six hours out of every twenty-four; east of Greenwich it writes
 * YESTERDAY through the early morning.
 */
export function localDate(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * The same local day with no separators, `YYYYMMDD` — the day part of a job id.
 *
 * A job id is a calendar-day label a human reads beside the records that job
 * writes, so it is the first category and not the second: `nextJobId` used
 * `getUTCFullYear`/`getUTCMonth`/`getUTCDate` until 2026-08-31, and a job
 * started at 20:31 local on the 29th was named `j-20260830-01` while the review
 * record it went on to write was dated the 29th. Two dates for one job, on one
 * machine, in one minute (beads addictedtoai-nmr, found live).
 */
export function localDayStamp(d = new Date()) {
  return localDate(d).replace(/-/g, '');
}
