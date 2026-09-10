# REVIEW TARGET — spec delta corrections, round 3

authority: two-desks-work-orders-and-trains@12b4ea3

Worktree `D:/addictedtoai-worktrees/fleet6-specfix`, branch `stage0-specfix`,
base `53779c3`. Round 2 was sealed-reviewed (REVISE, four blocking); this is the
revision. Author muse-spark via OpenRouter at xhigh, 29 minutes wall clock,
exit 0.

## WHAT THE ARCHITECT VERIFIED INDEPENDENTLY — do not spend effort re-deriving these

Each of these was measured by me against the worktree after the run exited, not
read from the author's report. They are stated so the review can spend itself on
what is still open.

- **`openspec validate --strict` is green**, re-run by me through a spawned
  `{ cwd: <worktree> }` script whose output prints the cwd it used. This matters
  because the command is cwd-relative and resolves its root by walking up from
  the working directory (`nearest`); a bare run from anywhere else would have
  validated the MAIN tree and reported the same green sentence.
- **The `consecutive` reconciliation reproduces exactly.** The author reports 9
  matches and tabulates 9 line numbers; my own case-insensitive search returns 9
  lines at precisely those numbers (315, 398, 1481, 1495, 1550, 1558, 2243,
  2266, 2269). The table IS the raw count, one row per match — which is the
  structural repair of round 2's defect, where a sweep enumerated the
  requirements it read rather than the occurrences of the word and therefore
  missed four.
- **The closure holds.** `git status` in the worktree shows exactly two modified
  files — the two delta files the brief named — plus the untracked RESULT files.
  Nothing was created, edited or deleted outside the declared list, and the LIVE
  spec is unmodified.
- **F5's term conformance is complete where it counts.** Nine `success`/`succeed`
  occurrences survive in the file; I checked each, and **none is inside the
  breaker-window requirement**. The undefined term is gone from the requirement
  that defined the window, which is what the finding asked for.
- **The F1 trigger is dormant by design, as claimed.**
  `budget.bounds.back_desk_ceiling_pct` is genuinely ABSENT from
  `data/config.json` today (the bounds there are 40/45/30), so the existence
  condition is currently false and the restatement correctly does nothing yet.
- **No literal window survives.** No `rolling 30` or `30 days` remains anywhere
  in the loop delta; the period is named by key throughout.

## THE ARCHITECT'S POSITION ON THE AUTHOR'S DECLARED DEPARTURES

**Both extensions in §5(b) are accepted, and the reviewer should treat them as
ruled rather than as scope creep.** (i) Conforming `success` → `done` across the
requirement's narrative sentences and one scenario heading, when the ruling
named only two sentences, is the consistent reading of a ruling whose stated
option was "or use `done`" — leaving the undefined term in a heading while the
body says `done` would recreate the heading/body divergence that is this
change's most-repeated defect. (ii) Replacing the neighbouring tier rule's
literal "rolling 30 days" with `budget.window_days` is covered verbatim by the
ruling's own rationale ("the number is configuration and the spec should name
the key"). An author that extends a ruling to the sentence next door, says so,
and gives the reason is doing the thing I want.

**No ruling was disobeyed this round.** Rounds 1 and 2 each surfaced a wrong
ruling of mine through this clause; round 3 surfaced none. That is a fact about
this round, NOT evidence that the rulings were right — please read them as
adversarially as if the author had objected.

## WHAT IS ACTUALLY OPEN — spend the review here

1. **The two residuals the author flagged and deliberately did not fix (§5c).**
   The warm-up bullets are tier-framed ("the tier's observed rolling total") and
   therefore do not say what denominator the GLOBAL back-desk ceiling reads on a
   near-empty window; and "tightest configured ceiling percentage" in the warm-up
   derivation will arguably start including `back_desk_ceiling_pct` once that key
   exists, widening the warm-up window without any number being edited. I regard
   both as MINE to rule, not as defects in the author's work — the author was
   right to flag rather than guess. **Tell me if you disagree that they are out
   of this round's scope, and tell me if there is a third consequence of the
   global/per-tier axis split that neither of us has named.**

2. **§5(d), and this is the claim I most want attacked.** Three surviving "until
   the window rolls" phrases (loop:2306, 2412, 2441) were left unchanged on the
   argument that each *inherits* the now-named `budget.window_days` window from a
   governing sentence two paragraphs up. That argument may well be right. It is
   also exactly the shape of claim that reads fine to someone who already knows
   the answer and implements wrong for someone who does not — an inheritance
   nobody wrote down. Is the inheritance actually unambiguous at each of the
   three sites, or does one of them sit under a different governing sentence?

3. **F4's arithmetic, checked rather than accepted.** The WHEN now reads "include
   exactly three empty ones, the oldest of the five being one of the empty ones".
   Verify the THEN is now unconditionally true under a sliding window that evicts
   the oldest slot. Round 2's version of this scenario was arithmetically false
   and I ruled it wrong; the sealed review caught me. Do that again.

4. **Whether the bound sweep in §3 is a real enumeration.** It claims to cover
   every bound, ceiling, floor and share in the loop delta, with a key, a period
   and a denominator for each, marking the ones whose keys the spec leaves
   unnamed as "as-is" rather than repairing them. Is anything missing from it,
   and is any row's stated period or denominator wrong?

## THE AUTHOR'S REPORT

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

## THE FULL DIFF FROM THE BASE

```
 .../specs/loop/spec.md                             | 225 +++++++++++++++------
 .../specs/review/spec.md                           |   9 +-
 2 files changed, 168 insertions(+), 66 deletions(-)
```

```diff
diff --git a/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md b/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
index 9e8c86d..7d55e87 100644
--- a/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
+++ b/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
@@ -29,7 +29,7 @@ decides what may travel together; count only bounds it.
   order SHALL carry a **governing type** from the closed list below. The
   governing type is what sets the per-invocation cap, the budget category, the
   review checklist, the proposal cap, the ledger line's `type`, and the job type
-  the consecutive-failure breaker counts.
+  breaker 1 counts.
 - A work order SHALL be bounded by four configured limits, each stated in
   `data/config.json`: a maximum number of items, a maximum number of distinct
   subjects, a maximum total of reviewed bytes across all subjects, and a maximum
@@ -302,7 +302,8 @@ work.
   the writing, not the idea. The reason is that a discarded job does **not**
   consume its proposal (a separate requirement, and correct), so without this the
   same candidate returns to the front of the queue on every run, unchanged, until
-  it expires or three consecutive discards trip breaker 1 and halt the Desk.
+  it expires or three discards within the breaker's window trip breaker 1 and
+  halt the Desk.
 - `data/proposals/dropped/` is a **record, never a block**: unlike `rejected/`, it
   SHALL NOT feed automatic slug suppression, so a story declined today may be
   refiled when its stated refile condition arrives.
@@ -750,8 +751,8 @@ reverting on that assumption evicts innocent work.
   review** on the new diff. A finding that names no merge rejects the whole train.
   **The publish SHALL NOT run on a train whose review did not approve the diff
   being published.**
-- An eviction SHALL NOT write `HOLD.md` and SHALL NOT count toward the
-  consecutive-failure breaker. It is a rejection of finished work by a gate or a
+- An eviction SHALL NOT write `HOLD.md` and SHALL NOT count toward breaker 1.
+  It is a rejection of finished work by a gate or a
   reviewer, which the `failed` outcome already covers for the job it evicts; a
   second count would halt the Desk for one red gate.
 - **An eviction SHALL be checkable after the fact.** An evicted merge replayed
@@ -922,10 +923,15 @@ prose should say is the other half and is not mechanised.
 - **THEN** the run selects nothing and exits with the refusal status, no `HOLD.md`
   is written, and the next run tries again
 
-### Requirement: The front desk and the back desk share an intake and never share a lane
+### Requirement: The front desk and the back desk share an intake and are otherwise separate
 
-Work is divided by kind, into two lanes that share one intake and one set of
-budget bounds.
+Work is divided by kind, into two desks that share one intake and one set of
+budget bounds. The capacity-pause sense defined in `Capacity exhaustion is a
+pause, and degradation is ordered` (`A lane is the set of runners sharing a
+provider`) is the only sense these specifications use; a `desk` is a work
+partition, and the two words are never interchangeable, and the same
+reservation covers capitalisation: `Desk` is the loop as a whole, `desk` is
+one front/back partition, and the two cases are never interchangeable.
 
 - The **front desk** runs the site's work: content work orders of the content job
   types, executed by up to a configured number of parallel workers, gated by the
@@ -940,15 +946,22 @@ budget bounds.
   no qualifying content work, it runs the daily outward sweep if that is due, and
   otherwise nothing.
 - Both desks SHALL be gated by the same rules: the ceilings, the floor, the shed
-  levels, the runner clearance and the review gate apply identically. A lane
+  levels, the runner clearance and the review gate apply identically. A desk
   decides which work is reached; it never decides what may be afforded.
-- **Once both desks exist, the bound on the machine's work on itself SHALL be
-  restated as the back desk's share of total effort**, a declared configuration
-  bound whose starting value is taken from the measured drain, rather than as a
-  ceiling on one engine's share of its own ledger. The two are different
-  quantities and only the second is the one anybody cares about: a ceiling on the
-  Desk's share does not reduce machinery work while a lane exists that the ledger
-  cannot see, and with two desks the ledger sees both. The bound SHALL NOT lapse
+- **Once both desks exist — that is, once `budget.bounds.back_desk_ceiling_pct`
+  is present in `data/config.json` — the bound on the machine's work on
+  itself SHALL be restated as the back desk's share of total effort**, a
+  declared configuration bound whose starting value is taken from the measured
+  drain and whose share is measured **globally over the `budget.window_days`
+  rolling window**: back-desk model-minutes divided by the model-minutes both
+  desks recorded over that window, on a different axis from the category
+  bounds — the two desks partition kinds of work, not tiers, so this bound is
+  the machine's share of all the work,
+  rather than as a ceiling on one engine's share of its own ledger. The two
+  are different quantities and only the second is the one anybody cares about:
+  a ceiling on the Desk's share does not reduce machinery work while a body of
+  work exists that the ledger cannot see, and with two desks the ledger sees
+  both. The bound SHALL NOT lapse
   when it is restated — a back desk with no limit is process expanding to fill the
   capacity available to it, which is the failure this repository was rebuilt to
   escape.
@@ -962,9 +975,12 @@ budget bounds.
 
 #### Scenario: The bound follows the work when the desks exist
 
-- **WHEN** both desks are running and the back desk's share of total effort reaches
-  its configured bound
-- **THEN** no further back-desk work is selectable until the window rolls, and the
+- **WHEN** `budget.bounds.back_desk_ceiling_pct` is present in
+  `data/config.json` and the back desk's global share of the effort both
+  desks recorded over the `budget.window_days` rolling window
+  reaches its configured bound
+- **THEN** no further back-desk work is selectable until the
+  `budget.window_days` rolling window moves past the spend that tripped it, and the
   bound is read against the effort both desks recorded rather than against the
   back desk's own ledger alone
 
@@ -1030,7 +1046,7 @@ script in a session's temporary directory that vanishes with the session.
   up to a configured number of workers, then the train, and SHALL be readable and
   runnable by anyone with the repository.
 - **The worker count SHALL start at one, and SHALL be raised only once every
-  control that concurrency breaks has been repaired**: the consecutive-failure
+  control that concurrency breaks has been repaired**: the breaker-1
   count, the runner-health count and the lane pause each computed over a window
   rather than by a backwards walk, and the budget gate reading reservations. The
   count is a configuration key the chain reads, so raising it is an edit and not a
@@ -1096,7 +1112,7 @@ script in a session's temporary directory that vanishes with the session.
 - The chain SHALL check for `STOP` and `HOLD.md` before each worker and before the
   train, and SHALL stop rather than continue when either stands. It SHALL stop on
   a failed run rather than launching the next worker, so that W workers cannot
-  walk three consecutive failures of one type into a halt in parallel before any
+  walk three failures of one type into a halt in parallel before any
   of them has been read.
 - The chain SHALL set the lock-wait budget the train's own gates need, since the
   train holds the test and build locks for the length of the full gate set and a
@@ -1155,7 +1171,7 @@ script in a session's temporary directory that vanishes with the session.
   budget gate reads reservations — and where any of the four is not yet true the
   count stays at one
 
-#### Scenario: The chain stops rather than walking a failure streak in parallel
+#### Scenario: The chain stops rather than walking failures into a halt in parallel
 
 - **WHEN** a worker's run ends `failed`
 - **THEN** the chain stops launching further workers and reports which run failed,
@@ -1455,19 +1471,22 @@ and stop the Desk (the Pulse keeps running except where noted):
    (rejected twice); `blocked`, `interrupted`, `capacity`, `abandoned` and
    `evicted-at-train` outcomes never count toward this breaker.
    **The count SHALL be taken over a window of the last five jobs of that type
-   that either failed or succeeded, tripping at three failures among them, and
-   SHALL NOT depend on the ledger's ordering.** A rule that walks the ledger
-   backwards and stops at the first success is a pure function of the order lines
-   were appended, and with more than one worker that order is append-as-you-finish.
+   that either failed or reached `done`, tripping at three failures among them. The
+   last five are the five most recently appended `done`/`failed`/`discarded`
+   ledger entries for jobs of that governing type — completion order is the
+   ordering.** A rule that walks the ledger backwards and stops at the first
+   `done` mistakes that same append order for a stopping condition, and with
+   more than one worker that order is append-as-you-finish.
    Four `repair` workers where the first, second and fourth fail and the third
    finishes in between produce `fail, fail, done, fail` and a consecutive count of
    **one** — three failures in four and no halt. Worse, it degrades in the wrong
-   direction: the more concurrent work fails, the more likely a success is
+   direction: the more concurrent work fails, the more likely a `done` is
    interleaved among the failures, so the breaker becomes *less* likely to trip
    exactly as the evidence for tripping it grows.
-   **The window SHALL be drawn only from outcomes that are a failure or a `done`.**
-   `blocked`, `interrupted`, `capacity` and `abandoned` neither count as failures
-   nor occupy a slot in it — the same treatment they already have, for the same
+    **The window SHALL be drawn only from outcomes that are a failure or a `done`.**
+    `blocked`, `interrupted`, `capacity`, `abandoned` and `evicted-at-train`
+    neither count as failures nor occupy a slot in it — the same treatment they
+    already have, for the same
    reason, and it matters more here than it did: `interrupted` is what lock
    contention produces, contention rises with the number of workers, and a window
    those outcomes could pad would be weakest under exactly the parallelism this
@@ -1475,8 +1494,8 @@ and stop the Desk (the Pulse keeps running except where noted):
    **This changes the serial case too, and the change is intended.** A type
    alternating `fail, done, fail, done, fail` never trips a consecutive rule and
    trips this one. Three failures in five attempts at one kind of work is a signal
-   worth halting on whether or not a success happened to land between them; a rule
-   that a single success resets is a rule that measures spacing rather than rate.
+   worth halting on whether or not a `done` happened to land between them; a rule
+   that a single `done` resets is a rule that measures spacing rather than rate.
 2. The published site failing to build or deploy. The build this breaker reads is
    the **train's**, run on the tree that is about to advance `main`; a job's
    tripwire build failing is an ordinary gate failure for that job and not a halt.
@@ -1514,11 +1533,12 @@ discard reviewed work to save nothing, since none of it can reach the remote.
 
 #### Scenario: Repeated failure stops the bleeding
 
-- **WHEN** three consecutive `post` jobs fail review twice each
+- **WHEN** three `post` jobs fail review twice each within the last five
+  failure/`done` jobs of that governing type (failure = `failed` or `discarded`)
 - **THEN** the Desk writes `HOLD.md` naming the pattern and stops, leaving
   the Pulse running
 
-#### Scenario: A success finishing in between does not hide three failures
+#### Scenario: A `done` finishing in between does not hide three failures
 
 - **WHEN** four `repair` jobs complete and the ledger records, in append order,
   `failed`, `failed`, `done`, `failed`
@@ -1934,7 +1954,7 @@ settle the job `failed`, or settle the train red.
   that changes with the length of the run.
 - **The classification SHALL NOT remove a failure from any count, any breaker or
   any budget.** A twice-failed gate run is `failed` whether its output carried
-  the marker or not, it advances breaker 1's consecutive count exactly as any
+  the marker or not, it advances breaker 1's count exactly as any
   other `failed` outcome does, and its spend is recorded exactly as any other.
   The classification exists to make the record answerable and for nothing else.
 - The ledger note for a job settled `failed` at the gates SHALL name **which
@@ -1975,8 +1995,8 @@ settle the job `failed`, or settle the train red.
 
 #### Scenario: Three marked twice-failed jobs halt the Desk
 
-- **WHEN** three consecutive jobs of one governing type each fail their gates
-  twice with the machine-failure marker present every time
+- **WHEN** three jobs of one governing type within the breaker's window each
+  fail their gates twice with the machine-failure marker present every time
 - **THEN** breaker 1 trips and `HOLD.md` is written, because a classification
   that could prevent a halt is a classification that can be wrong in the
   direction of never halting
@@ -2017,11 +2037,11 @@ within the backoff interval, whichever line came after it. Reading only the
 provider's most recent line cannot survive more than one worker: a rate limit
 hits every worker on a lane at once, so one worker records `capacity` and
 another finishing a second later makes the newest line something else and the
-pause never engages — and the same backwards walk under-counts the consecutive
-run that sets the interval. Asking whether any `capacity` falls inside the
+pause never engages — and the same backwards walk under-counts the run of
+`capacity` outcomes that sets the interval. Asking whether any `capacity` falls inside the
 window is strictly simpler than asking whether the newest line is one, and it is
-the shape a rate limit actually has. The interval is — 1 hour after the first `capacity` in a consecutive run of them,
-doubling per consecutive `capacity` to a 6-hour maximum; any successful
+the shape a rate limit actually has. The interval is — 1 hour after the first `capacity` in a run of them,
+  doubling per `capacity` in that run to a 6-hour maximum; any successful
 completion on the lane resets the sequence. No pause file exists; the
 predicate reads `data/ledger.jsonl` plus clock arithmetic — never a
 prediction of the provider's window, which is unknowable for consumer
@@ -2065,7 +2085,7 @@ pauses for capacity reasons: the site stays alive on zero inference.
 An expired credential makes an executor exit in seconds with no `RESULT.md`.
 That classifies `interrupted`, correctly — and `interrupted` is not a failure:
 the branch is kept, it is resumed oldest-first before new work, no retry is
-consumed, and the three-consecutive-failures breaker counts only `failed` and
+consumed, and breaker 1 counts only `failed` and
 `discarded`. With no rule against it a Desk would resume the same branch
 forever, halting nothing and telling nobody. The mechanism that ends that spin
 lives in `loop/lib/health.mjs`, and it is specified here rather than left to the
@@ -2094,10 +2114,11 @@ detection covers one is a rule that reads as present and does nothing.
   `loop/run.mjs`'s `phase()` call for `review*` roles, and read by
   `noOutputStreak()` in `loop/lib/health.mjs`; measured by the `G8A` tests in
   `loop/tests/runner-health.test.mjs`.
-- The streak SHALL be accumulated **per invocation and per role**, not from a
-  ledger line's runner field alone. A line's runner field names the author, so a
-  runner configured only as reviewer could otherwise never accumulate a streak
-  however many times it produced nothing. Implemented by `noOutputStreak()`'s
+- The no-output count SHALL be accumulated **per invocation and per role**,
+  not from a ledger line's runner field alone. A line's runner field names
+  the author, so a runner configured only as reviewer could otherwise never
+  accumulate a count however many times it produced nothing. Implemented by
+  `noOutputStreak()`'s
   `invocationsFor` helper in `loop/lib/health.mjs`; measured by the `G8A` tests
   in `loop/tests/runner-health.test.mjs`.
 - After three such runs **within that runner's last five invocations in that
@@ -2118,8 +2139,9 @@ detection covers one is a rule that reads as present and does nothing.
   nothing, which is the question the refusal is for.
 - The refusal SHALL name the cause and the exact command that clears it, and the
   count SHALL fall out of the window as producing invocations replace empty ones.
-- Lines that record no invocation at all SHALL neither count toward the streak
-  nor end it — the 14-day abandon sweep writes a line carrying the dead runner's
+- Lines that record no invocation at all SHALL neither count toward the
+  no-output count nor clear it — the 14-day abandon sweep writes a line carrying
+  the dead runner's
   id and zero model-minutes, and counting it as evidence would clear a refusal
   that nothing had fixed. This is the same treatment the failure breaker gives
   outcomes that are not failures, and it is the stickier reading: a guardrail is
@@ -2133,7 +2155,8 @@ detection covers one is a rule that reads as present and does nothing.
 #### Scenario: The spin ends at the third empty run
 
 - **WHEN** three of a runner's last five invocations in a role each produced no
-  `RESULT.md`, no output and no diff
+  `RESULT.md`, no output and no diff, and a fifth has not yet replaced any of
+  them in the window
 - **THEN** the loop refuses that runner for authoring and review, printing the
   cause and the conformance command that clears it, and does not invoke it or
   resume a branch with it
@@ -2141,28 +2164,32 @@ detection covers one is a rule that reads as present and does nothing.
 #### Scenario: A reviewer-only runner accumulates a streak
 
 - **WHEN** a runner configured only for the reviewer role completes three
-  consecutive review invocations that each wrote no verdict record and printed
-  nothing
-- **THEN** the streak reaches three and that runner is refused for review, even
-  though no ledger line names it as an author
+  review invocations that each wrote no verdict record and printed nothing,
+  within its last five invocations in that role
+- **THEN** three of the last five produced nothing and that runner is refused
+  for review, even though no ledger line names it as an author
 
 #### Scenario: A malformed verdict record is output, not silence
 
 - **WHEN** a reviewer invocation writes a verdict record that the merge gate
   refuses as malformed
-- **THEN** the no-output streak is cleared rather than advanced, and the
+- **THEN** the invocation counts as a producing invocation in the window rather
+  than advancing the no-output count, and the
   malformed record is handled by the merge gate's own refusal
 
 #### Scenario: Refusal is not a halt
 
-- **WHEN** a runner is refused for producing nothing three times running
+- **WHEN** a runner is refused with three of its last five invocations in a
+  role having produced nothing
 - **THEN** no `HOLD.md` is written and the Desk's other runners remain usable
 
 #### Scenario: One real run clears it
 
-- **WHEN** a refused runner is repaired and its next run produces a diff
-- **THEN** the streak is zero and the runner is selectable again with no other
-  action
+- **WHEN** a refused runner whose last five invocations in that role include
+  exactly three empty ones, the oldest of the five being one of the empty
+  ones, is repaired, and its next run produces a diff
+- **THEN** that producing invocation replaces one window slot, two of the last
+  five remain empty, and the runner is selectable again, with no other action
 
 #### Scenario: A healthy invocation between two dead ones does not clear the count
 
@@ -2259,8 +2286,9 @@ previous site; wall-clock per tier is measurable by the orchestrator alone,
 comparable across providers, and readable by a non-programmer. Every job
 records its MM actuals in a run ledger.
 
-Shares SHALL be computed **within each tier separately**: a category's
-share is its MM divided by that tier's total MM over the rolling 30 days,
+Shares SHALL be computed **within each tier separately** for the category
+bounds: a category's share is its MM divided by that tier's total MM over
+the `budget.window_days` rolling window,
 and the bounds below SHALL hold in each tier independently (frontier shares
 of the frontier total; cheap shares of the cheap total):
 
@@ -2326,9 +2354,16 @@ words, "machinery crowds out visitor value".
 
 **A ceiling on the Desk's share is the wrong quantity once there are two desks,
 and it SHALL be restated rather than removed.** When the front and back desks
-exist, the ledger sees both, and the bound becomes the **back desk's share of
-total effort** — a declared configuration bound whose starting value is taken from
-the measured drain, with the filing rule bounding what enters the backlog. A back
+exist — that is, once `budget.bounds.back_desk_ceiling_pct` is present in
+`data/config.json` — the ledger sees both, and the bound becomes the **back
+desk's share of total effort** — a declared configuration bound whose starting
+value is taken from the measured drain, measured **globally over the
+`budget.window_days` rolling window** as back-desk model-minutes divided by
+the model-minutes both desks recorded over that window, on a different axis
+from the category bounds above (the two desks partition kinds of work, and
+the back desk's share is the machine's share of all the work, not a share of
+any one tier), with the filing rule bounding what enters
+the backlog. A back
 desk with no limit at all is the predecessor's failure mode restated: process
 expands to fill the capacity available to it, and this repository's own history
 records the ratio it reached. The limit changes what it measures; it does not
@@ -2373,7 +2408,7 @@ denominator therefore has a floor of its own.
 
 #### Scenario: Machinery work hits its ceiling
 
-- **WHEN** `machinery` MM reaches 10% of the rolling window
+- **WHEN** `machinery` MM reaches 30% of the rolling window
 - **THEN** no further machinery job is selectable until the window rolls,
   regardless of how appealing the improvement looks
 
@@ -2419,6 +2454,70 @@ denominator therefore has a floor of its own.
   is below its own ceiling, and the refusal states the arithmetic it refused on
   exactly as any other budget refusal does
 
+### Requirement: Jobs have identities, and interrupted jobs resume by branch
+
+Job identity and resumption are mechanical, not remembered:
+
+- At selection, the loop SHALL assign the job an id of the form
+  `j-<yyyymmdd>-<seq>` (sequence within the day), name its branch
+  `job/<id>`, and commit the assembled brief to the branch as
+  `.job/brief.md` before invoking any executor — the branch itself carries
+  everything resumption needs.
+- At the start of every run, **before** consulting the one intake,
+  the loop SHALL look for resumable branches: any `job/*` branch whose most
+  recent ledger line is `interrupted` or `capacity` (and whose lane is not
+  paused). If one exists, the oldest SHALL be resumed instead of selecting
+  new work: the runner is re-invoked in that branch's worktree with the
+  committed brief plus a fixed one-line preamble stating the branch
+  contains partial work to continue. Resumption consumes no retry.
+- A resumable branch older than 14 days SHALL be discarded with a ledger
+  line (`abandoned`), so dead branches cannot accumulate silently.
+
+#### Scenario: An interrupted job is picked up first
+
+- **WHEN** a run starts and `job/j-20260901-02`'s last ledger line is
+  `interrupted`
+- **THEN** the loop resumes that branch with its committed `.job/brief.md`
+  before consulting the one intake
+
+#### Scenario: Stale branches do not pile up
+
+- **WHEN** a resumable branch is 15 days old
+- **THEN** the loop discards it and writes an `abandoned` ledger line
+  naming the job id
+
+### Requirement: An issue id declared in front matter is format-checked; prose is harvested
+
+A **declared field** is a promise about its own shape. A line of **prose** makes
+no such promise. The two SHALL therefore be read differently, and the asymmetry
+is deliberate rather than an inconsistency.
+
+- A proposal MAY declare `issue:` in its front matter, carrying one id or
+  several. The loop SHALL validate its **format** at parse time, beside the
+  existing `slug` and `type` checks. Implemented by task 2.1; measured by
+  `issues.test.mjs` case 3a.
+- A proposal whose declared `issue:` is not a well-formed id SHALL be treated as
+  `malformed` and SHALL NOT be selectable, and the run SHALL report it naming
+  the file and the offending value — on exactly the terms a bad `type:` already
+  gets. An `issue: see the tracker` that parsed as *no issue* would be a link
+  that reads as present and joins to nothing. Implemented by task 2.1; measured
+  by `issues.test.mjs` case 3a and by the mutation test in task 5.2.
+- `DIRECTIVES.md` retires: each pending line — a list-item line carrying no
+  `[done <date> <job-id>]` marker — migrates into a routed bead carrying the
+  same text and a priority, and a parked line — a non-list-item line in the
+  parked section, written without a leading `-` so the directives parser
+  cannot see it — migrates with it once it is made live again; the file is
+  deleted with `loop/lib/directives.mjs`
+  and its call sites, and the three directive-prose harvesting bullets this
+  requirement carried for that file are deleted with it rather than repointed.
+  A routed bead already carries its own id, so no harvest rule replaces them.
+
+#### Scenario: A malformed declared id stops the proposal rather than being ignored
+
+- **WHEN** a proposal declares `issue: see the tracker`
+- **THEN** it is reported as malformed naming the file and the value, it is not
+  selectable, and a sibling proposal declaring nothing at all is still selectable
+
 ## REMOVED Requirements
 
 ### Requirement: One job is one outcome with one merge or discard
diff --git a/openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md b/openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md
index 0b25d60..d1348af 100644
--- a/openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md
+++ b/openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md
@@ -229,9 +229,12 @@ For every verdict on a prose piece, the review record SHALL contain the
 reviewer's own-words answer to "who would link this, and in what argument?", in a
 required, non-empty `would-cite`. Where the merged subjects hold **more than
 one** prose piece, the record SHALL carry a `would-cite-for` **list of entries**,
-each naming its piece and carrying that piece's own answer, and a piece among the
-merged subjects left with no entry and no record-wide `would-cite` is refused
-exactly as a blank `would-cite` is refused. A work order carries several pieces
+each naming its piece and carrying that piece's own answer, and each piece
+among the merged subjects requires its own entry: a record-wide `would-cite`
+  alone satisfies nothing for N>1. A piece among the
+  merged subjects left with no entry — where more than one prose piece is
+  present — is refused exactly as a blank `would-cite` is refused. A work order
+  carries several pieces
 by design, and one sentence standing for all of them is the 1/N attention problem
 in the one field that exists to prevent it.
```
