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
 * RE-MEASURED on 2026-09-06 (beads addictedtoai-8tr0), by resolving every
 * relative import in `lib/`, `loop/`, `pulse/`, `scripts/` and `app/` to the
 * directory it lands in. The counts as of that date:
 *
 *   scripts/ -> lib/     34 imports across 10 files (already open, already used
 *                        for exactly this: `verify-design` and
 *                        `verify-analytics` both import `todayIso`)
 *   loop/    -> lib/     10 imports across 6 files  (review records and
 *                        `lib/domains.mjs`, the shared frontier vocabulary)
 *   pulse/   -> lib/     13 imports across 9 files  — 9 of them in the ENGINE
 *                        (`derive`, `diff`, `domain-seeds`, `frontier` x2,
 *                        `indexnow` x2, `mint`, `queue`), 4 in its tests
 *   lib/     -> pulse/    3 imports (`site.mjs` and `declined-fields.mjs` read
 *                        the source registry; one test)
 *
 * THE 2026-08-31 VERSION OF THIS COMMENT SAID THAT LAST PAIR WAS "ZERO. Not one
 * import, in either direction", AND CALLED IT "the whole argument". It is no
 * longer zero in either direction, and a stale measurement presented as current
 * is the defect class the verification rules name, so the argument is restated
 * here against what is actually true rather than left standing on a number that
 * has moved.
 *
 * THE ARGUMENT SURVIVES, BECAUSE IT WAS NEVER REALLY ABOUT THE COUNT. What
 * `pulse/` must not acquire is the SITE BUILD — its schema, its validation
 * stack, its content layer. Measured the same day: every `lib/` module the
 * Pulse now imports (`change-kinds.mjs`, `asset-routes.mjs`, `site-config.mjs`,
 * `domains.mjs`, `frontier-metrics.mjs`) has ZERO imports of its own. They are
 * dependency-free leaf modules holding shared vocabulary — the closed list of
 * change kinds, the site's hosts, the domain names — and a constant that two
 * directories must agree on is exactly the thing that should have one
 * definition. `lib/facts.mjs`, where `todayIso()` lives, is the opposite shape
 * and that is what settles this file: it imports `lib/schema.mjs` (and with it
 * zod), `lib/data-layer.mjs` and `lib/units.mjs`, so the model-free Pulse would
 * acquire the site build's validation stack in order to learn what day it is.
 *
 * So the boundary is not "nothing crosses" and was mis-stated as that; it is
 * **what may cross**: a leaf module of shared constants may, and a module that
 * drags the build behind it may not. That is a restatement, not a loosening —
 * it forbids the same import it always forbade — and it is checkable, because
 * "the module I am importing has no imports of its own" is a thing an author
 * can measure in one command before adding the edge.
 *
 * A shared helper still has to live somewhere, and every candidate is still
 * worse than three small copies:
 *
 *  - In `lib/`: the objection is the one measured above — not that the edge
 *    would be the first (it would not be: commit `5afab61`, 2026-08-31, the
 *    same day this comment was first written, gave `pulse/lib/indexnow.mjs`
 *    `lib/asset-routes.mjs` and `lib/site-config.mjs`), but that `lib/facts.mjs`
 *    is not a leaf and the five modules the Pulse already imports are. Putting the helper beside `todayIso()` hands the Pulse zod, and
 *    putting a second, leaf date module in `lib/` beside `todayIso()` leaves
 *    `lib/` with two date helpers and no rule about which to reach for — which
 *    is the failure this whole class is made of.
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
