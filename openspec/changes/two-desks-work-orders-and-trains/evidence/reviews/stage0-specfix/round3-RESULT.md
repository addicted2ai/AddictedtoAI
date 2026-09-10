# RESULT3 — SPEC DELTA CORRECTIONS, round 3

Worktree: `D:/addictedtoai-worktrees/fleet6-specfix`.
Round-1 and round-2 edits kept and amended. Live spec
(`openspec/specs/loop/spec.md`) read, never written. Local date 2026-09-09.
No `npm run build`, no `npm test`, no commit, no worktree changes,
`STOP`/`HOLD.md` untouched. Only
`openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md`
was edited this round; the review delta was read and left untouched (§6).

## 1. Finding → change → line

| # | Finding | What changed | Line(s) |
|---|---|---|---|
| F1 | Back-desk bound names no key | Both restatement bodies and the scenario WHEN now name **`budget.bounds.back_desk_ceiling_pct`**: "once `budget.bounds.back_desk_ceiling_pct` is present in `data/config.json`" | loop:951-952 (desks body), loop:978-979 (scenario WHEN), loop:2357-2358 (spending restatement) |
| F2 | Global share states no period | "over the same period" → "**globally over the `budget.window_days` rolling window**" in both bodies; "until the window rolls" → "until the `budget.window_days` rolling window moves past the spend that tripped it" in the scenario THEN. No literal 30 anywhere in the new text; the number stays configuration (`data/config.json: window_days: 30`, verified). The neighbouring tier-rule sentence's literal "rolling 30 days" was likewise replaced with "the `budget.window_days` rolling window" (see §5b) | loop:955-956, loop:980-984, loop:2290-2291, loop:2360-2362 |
| F3 | Tier-separate rule contradicts global exception | Tier rule scoped to what it governs: "Shares SHALL be computed **within each tier separately** for the category bounds". Back-desk bound stated as a bound "**on a different axis** from the category bounds" — desks partition kinds of work, the share is the machine's share of all the work, not a share of any one tier. No "exception" language remains | loop:2289-2293, loop:956-959, loop:2362-2365 |
| F4 | "One real run clears it" arithmetically false | WHEN conditioned on the evicted slot being empty: "include exactly three empty ones, **the oldest of the five being one of the empty ones**". THEN ("two of the last five remain empty, and the runner is selectable again") is now unconditionally true. Heading kept | loop:2186-2192 |
| F5 | Breaker window uses undefined `succeeded`/`success`; second exclusion drops `evicted-at-train` | "either failed or succeeded" → "either failed or reached `done`"; "stops at the first success" → "stops at the first `done`"; exclusion list extended with `evicted-at-train` ("`blocked`, `interrupted`, `capacity`, `abandoned` and `evicted-at-train` neither count as failures nor occupy a slot in it"). Additionally conformed the same undefined term in the same requirement's narrative ("a success is interleaved" → "a `done` is interleaved"; "a success happened to land" → "a `done` happened to land"; "a single success resets" → "a single `done` resets") and the scenario heading "A success finishing in between…" → "A `done` finishing in between…" (see §5a) | loop:1474-1480, loop:1484, loop:1487-1490, loop:1495-1498, loop:1541-1546 |
| F6 | `parked line` used, never defined | Defined from `DIRECTIVES.md`'s own words (parked section: lines "written WITHOUT a leading `-` so `parseDirectives` cannot see them at all — it matches list items only"): "a parked line — a non-list-item line in the parked section, written without a leading `-` so the directives parser cannot see it —" | loop:2505-2510 |
| Unlisted | `:305` states the superseded consecutive model and names breaker 1 | "it expires or three consecutive discards trip breaker 1 and halt the Desk" → "it expires or three discards within the breaker's window trip breaker 1 and halt the Desk" | loop:302-306 |

## 2. Validate

Command (exactly as prescribed, no `cd`):

    node C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/47a211cc-a047-4474-bb53-9cfe0505f2b9/scratchpad/arch-validate-wt.mjs

Exact output (final run, after all edits):

    cwd: D:/addictedtoai-worktrees/fleet6-specfix
    (node:18816) [DEP0190] DeprecationWarning: Passing args to a child process with shell option true can lead to security vulnerabilities, as the arguments are not escaped, only concatenated.
    (Use `node --trace-deprecation ...` to show where the warning was created)
    exit: 0
    --- stdout ---
    Change 'two-desks-work-orders-and-trains' is valid
    --- stderr ---
    (empty)

The DEP0190 line is node's own warning about the helper script's
`shell: true` (the prescribed cwd mechanism), on stderr; the check itself
prints `is valid` and exits 0. Re-run after every edit batch; never red at
any point (all edits are body text inside existing MODIFIED/ADDED
requirements — no heading touched, so the no-drop rule never fired).

## 3. Bound sweep — every bound, ceiling, floor and share in the loop delta

Scope: the loop delta file. (The review delta carries no budget/share
bounds: its "bounds" are byte-count caps — `reviewed-bytes bound`,
`Two consecutive non-approvals` — which inherit the loop train bounds and
train-review rule; nothing to state there.) Key = the `data/config.json`
key where one exists; period = the window it is measured over; denominator
= what a share divides by, or N/A with the reason for absolute caps.
"Unnamed" means the delta states the limit without naming its key — reported
as-is, not repaired (beyond this round's rulings; see §6).

| Bound | Key | Period | Denominator / basis | Verdict |
|---|---|---|---|---|
| Upkeep floor ≥ 40% | `budget.bounds.upkeep_floor_pct` (config-verified: 40) | `budget.window_days` rolling window | Per-tier observed rolling total MM, each tier independently; floor reads the observed total, never the warm-up window | Clean |
| New-writing ceiling ≤ 45% | `budget.bounds.new_writing_ceiling_pct` (config-verified: 45) | Same window | Per-tier total MM; ceiling binds against max(observed total, warm-up window) | Clean |
| Machinery ceiling 30% drain / 10% revert | `budget.bounds.machinery_ceiling_pct` (config-verified: 30) | Same window | Same as above | Clean; revert condition (three named changes archived) checkable from the tree |
| Back-desk ceiling (restated) | `budget.bounds.back_desk_ceiling_pct` — **named this round**; verified ABSENT from `data/config.json` today (bounds are 40/45/30), so the existence trigger is currently false and the restatement dormant, as designed | `budget.window_days` rolling window — **named this round** | GLOBAL: back-desk MM ÷ both desks' MM over the window; different axis from the category bounds, not per tier | Fixed F1/F2/F3. Residual flagged, unchanged: the warm-up bullets ("A ceiling SHALL be measured against the larger of the tier's observed rolling total and a warm-up window") are tier-framed and therefore do not name what the global bound reads on a near-empty window — see §5c |
| Work-order four limits (max items, max distinct subjects, max total reviewed bytes, max per-subject reviewed bytes) | In `data/config.json`, individual keys unnamed in spec | Per work order (no window) | N/A — absolute caps, not shares; explicitly "configuration, not budget bounds" (no OpenSpec-change rule; adjustments must name the ledger measurement) | As-is; keys unnamed, period/denominator stated here |
| Per-invocation wall-clock caps (defaults tier-derived: cheap 30, frontier 60) | `data/config.json` `job_caps_minutes` (key name from config; delta says "`data/config.json` maps each job type to its cap") | Per invocation | N/A — absolute minutes; kill at cap → `interrupted` | As-is |
| Proposal caps (≤1 side-output per run; scout files ≤3/day under its mechanical cap; 3-day cooling; `expires:` dates) | Unnamed | Per run / per day / file age | N/A — count caps | As-is |
| Train bounds (merge count, minutes since first unpublished merge, max reviewed bytes, max distinct subjects) | In `data/config.json`, keys unnamed in spec | Per train | N/A — absolute | As-is |
| Gate floor durations | Per-gate declared floor, recorded with calibration date and run count; fixture override allowed, never below the millisecond tripwire | Duration threshold, not a window | N/A — absolute seconds; derivation stated, not guessed | Clean |
| Conformance supersession (3 consecutive PASSes) | The conformance record (append-only history) | Over successive runs of the same check | N/A — count; "three" stated as value, not principle | Clean |
| Queue / sweep floors ("configured number of consecutive runs") | "Configured number", unnamed | Runs | N/A — count | As-is |
| Capacity backoff (1h, doubling per `capacity` in the run, max 6h; shed level = count of `capacity` per tier in trailing 48h; lane pause = any `capacity` in the backoff interval) | `degradation.window_hours` (config-verified: 48); backoff constants in spec | Event windows (backoff interval / trailing 48h) | N/A — event counts | As-is |
| Breaker 1 (3 failures in last 5) | Ledger-derived, no config key | Last-five window (count-based, not time) | Window slots: `done`/`failed`/`discarded` only; unit = governing job type; ordering = ledger append (completion) order | Clean (F5 conformed the vocabulary) |
| Runner-health refusal (3 empties in last 5) | Invocation record, no config key | Last-five window per runner per role | Window slots; no-invocation lines neither count nor clear | Clean (F4 conditioned the threshold scenario) |
| Brief excerpt budget (per-source cap, ceiling set from measurement) | Unnamed ("excerpt budget", "the ceiling") | Per brief | N/A — characters, absolute | As-is |
| Intake report metric (share of newly filed issues naming only machinery paths) | None — a reported number, not a bound | Per run | Newly filed issues | Not a bound; listed so the sweep is complete |
| Budget reservations (per-invocation cap recorded at selection; released on every terminal path; expiry from the wall-clock cap) | Reservation alongside the ledger | Job lifetime | Recorded spend + live reservations | Clean mechanism |
| Sweep intervals (14-day abandon; 14-day interpret trailing; deferral "stated interval") | Intervals, mostly unnamed keys | Days | N/A | As-is |
| Warm-up window | Derived — (100 ÷ tightest configured ceiling pct) × largest per-type invocation cap — and SHALL NOT be a config key (explicit anti-key rule) | Denominator floor for ceilings | max(observed tier total, warm-up) | Clean, with one latent interaction flagged, unchanged: once `back_desk_ceiling_pct` exists under `budget.bounds`, "tightest configured ceiling percentage" arguably includes it — see §5c |

## 4. `consecutive` reconciliation

Method (per ground rules — `Select-String`, counts via `Measure-Object`,
no `grep -c`/`wc -l`): `Select-String -Pattern "consecutive"`
case-insensitive, `-AllMatches`, over the loop delta file.
**Raw count: 9 matching lines, 9 total matches** (no line carries two;
verified via `Select-String` objects, counting both lines and
`.Matches.Count`).
Round-2 state had 10; the tenth was `:305`, conformed this round (§1),
so 10 − 1 = 9. No `consecutively` anywhere; case variants included in the
same (case-insensitive) count.

Every occurrence classified (line numbers are the final file state):

| Line | Occurrence | Classification |
|---|---|---|
| 315 | "consecutive runs in which the queue held a selectable item and was not reached" (queue floor body) | LEGITIMATE — the queue floor genuinely counts consecutive runs; brief orders DO NOT TOUCH |
| 398 | "configured number of consecutive runs while routed issues were selected" (queue-floor scenario) | LEGITIMATE — same model, same order |
| 1481 | "a consecutive count of one" (`fail, fail, done, fail` example) | KEPT — describes the OLD rule being refuted; the refutation needs the word |
| 1495 | "never trips a consecutive rule" (serial-case paragraph) | KEPT — same refutation narrative |
| 1550 | "three consecutive trains each evict one merge" (eviction scenario) | LEGITIMATE — trains are not ledger windows; brief orders DO NOT TOUCH |
| 1558 | "on three consecutive nights" (date-coupled red scenario) | LEGITIMATE — nights; brief orders DO NOT TOUCH |
| 2243 | "three consecutive PASSes of that same check" (conformance supersession) | LEGITIMATE — a different model; brief orders DO NOT TOUCH |
| 2266 | "Three consecutive passes supersede a failure" (scenario heading) | LEGITIMATE — same model |
| 2269 | "passes that same check on three consecutive runs" (scenario body) | LEGITIMATE — same model |

Agreement with per-requirement verdicts: Work-from-one-intake holds 2
(:315, :398, queue-floor model); Breakers holds 4 (:1481, :1495 old-rule
narrative; :1550, :1558 trains/nights model); Swap/conformance holds 3
(:2243, :2266, :2269, supersession model). 2 + 4 + 3 = 9 = the raw count.
The raw count wins by construction — the table above IS the raw count, one
row per match, so there is nothing left to disagree with.

Separately (outside the loop-file count): the review delta has exactly one
`consecutive` — review:150, "Two consecutive non-approvals of a train" —
train-review model, legitimate, untouched. And the round-2 `streak` residue
stands as reported: one live heading (`A reviewer-only runner accumulates a
streak`, loop:2164, kept under the no-drop rule) plus the `noOutputStreak()`
code identifiers, which are implementation names, not spec vocabulary.

## 5. Disagreements with rulings, extensions of rulings, and residuals

(a) **No ruling was disobeyed.** F1–F4, F6 and the unlisted `:305`
conformance are implemented exactly as ruled, including the two corrected
rulings adopted at the top of the brief (F5's per-governing-type unit, kept
from round 2; F4's evicted-slot condition, new this round).

(b) **Two deliberate extensions beyond the letter, both inside the round's
class.** (i) F5's ruling named two sentences ("failed or succeeded",
"stops at the first success"); I additionally replaced `success` with
``done`` in the same requirement's two narrative sentences and the
"success finishing in between" scenario heading. Reason: leaving the
undefined term in the heading while the body says ``done`` recreates the
heading/body divergence the sealed review itself flags as F6-class
elsewhere; the ruling's option ("or use `done`") applied requirement-wide
is the consistent reading. Every remaining `success`/`succeed` in the file
was checked individually — :91 (empty-set refusal "reports success"),
:442/:443/:454 (build success records), :1387/:1435
(executor-protocol "honest/successful outcome"), :1714 ("silently
succeeding"), :2045 (lane "successful completion"), :2139 (window asks what
share "happens to succeed") — each a
different sense from the breaker window's term, each correctly left alone.
(ii) F2's "name the key, not a literal 30" was applied to the neighbouring
tier-rule sentence ("rolling 30 days" → "`budget.window_days` rolling
window") as well as to the back-desk text. Reason: same window, same
class defect (a bound whose period names a number instead of the key that
carries it); the ruling's rationale ("the number is configuration and the
spec should name the key") covers it verbatim.

(c) **Two residuals observed and deliberately NOT changed — the brief did
not rule them, and changing them would invent the second answer.**
(i) The warm-up bullets are tier-framed ("the tier's observed rolling
total") and do not say what denominator the global back-desk ceiling reads
on a near-empty window. (ii) Latently, "tightest configured ceiling
percentage" in the warm-up derivation will arguably include
`back_desk_ceiling_pct` once it exists under `budget.bounds`, widening the
warm-up without any number changing. Both are real, both concern a bound
whose key is not yet present (no implementation exists to contradict), and
both need an architect's scoping sentence, not an author's guess. Flagged
here instead of fixed.

(d) **"Until the window rolls" survives in three category-bound contexts**
(loop:2306 body, loop:2412 and loop:2441 scenarios). Left as-is
deliberately: each inherits the now-named `budget.window_days` window from
the requirement's governing tier-rule sentence two paragraphs up (stated as
inheritance in §3's table), and the brief's replacement instruction was
scoped to the back-desk text. Churning three MODIFIED scenarios to restate
an inheritance the body already provides would widen the diff for no
checkability gain.

## 6. Anything not done that this brief asked for

Nothing. Every numbered item is done: F1 (key in both bodies + WHEN),
F2 (named window in both bodies + THEN), F3 (tier rule scoped, back-desk
stated as a different axis), F4 (evicted-slot condition, heading kept),
F5 (term defined via `done`, exclusion restored), F6 (`parked line`
defined where `pending` is defined), the unlisted `:305` conformance
(window-counted, breaker 1 still named), the validate gate (exit 0), the
bound sweep with keys/periods/denominators, the `consecutive`
reconciliation (9 = 9), the end-to-end re-read of every edited requirement
(desks :926-992; breakers :1465-1560; spending :2278-2456; intake demotion
bullet :297-306; runner-health threshold scenario :2186-2192; DIRECTIVES
bullet :2505-2513), and this RESULT3 file at the worktree root.

Anticipated non-issues confirmed: the review delta is untouched this round
(its one `consecutive` is legitimate, its byte-caps inherit the loop train
bounds — the sweep found nothing there to fix); the live spec was only
read; no build, no tests, no commit, no push, no worktree operations.
