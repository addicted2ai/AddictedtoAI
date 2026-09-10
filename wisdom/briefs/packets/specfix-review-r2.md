# REVIEW TARGET — spec delta corrections, round 2

authority: two-desks-work-orders-and-trains@12b4ea3

Worktree `D:/addictedtoai-worktrees/fleet6-specfix`, branch `stage0-specfix`. Round 1 was sealed-reviewed
(REVISE, five blocking); this is the revision. Author muse-spark via OpenRouter
at xhigh. `openspec validate --strict` exit 0, RE-RUN BY THE ARCHITECT in the
worktree via a spawned { cwd } script — not taken from the author's report,
because the bare command is cwd-relative and would otherwise have validated the
main tree.

The architect accepts the author's rejection of ruling F5's unit: breaker 1
counts per governing job type (:1462), while 'that runner in that role' is the
runner-health window's unit (:2118). The architect conflated them; the author
did not.

## THE AUTHOR'S REPORT

# RESULT2 — SPEC DELTA CORRECTIONS, round 2

Worktree: `D:/addictedtoai-worktrees/fleet6-specfix`.
Round-1 edits kept and amended. Live spec (`openspec/specs/loop/spec.md`)
read, never written.

## 1. Finding → change → line

| # | Finding | File | What changed | Line(s) |
|---|---|---|---|---|
| F1 | Breaker scenario `failed/done` excludes body-counted `discarded` | loop delta | `within the last five \`failed\`/\`done\` jobs` → `within the last five failure/\`done\` jobs ... (failure = \`failed\` or \`discarded\`)` | loop:1530-1531 |
| F2 | `One real run clears it` false as a general claim; live-spec rename refused | loop delta | Heading kept; WHEN scoped to the threshold case (`last five ... include exactly three empty ones ... next run produces a diff`); THEN asserts replacement arithmetic (`two of the last five remain empty ... selectable again`). Title-true at the threshold, window-true, sibling scenario untouched. | loop:2180-2185 |
| F2b | Two more streak-semantics scenarios in the same block (found settling F2) | loop delta | Reviewer-only: `completes three consecutive review invocations` → `completes three review invocations ... within its last five invocations in that role`; THEN `the streak reaches three` → `three of the last five produced nothing`. Refusal-not-halt: WHEN `producing nothing three times running` → `refused with three of its last five invocations in a role having produced nothing`. Headings unchanged (live heading for the first; no-drop reason for both). | loop:2158-2164, 2174-2178 |
| F3 | `DIRECTIVES.md retires` leaves `pending` undefined, drops priority | loop delta | `each pending line` → `each pending line — a list-item line carrying no \`[done <date> <job-id>]\` marker —`; `carrying the same text` → `carrying the same text and a priority`; parked-line clause added (`a parked line migrates with it once it is made live again`). Priority value itself NOT pinned: `tasks.md:2205-2208` says only `a priority` with no value, and the detailed band-mapping (P0/P1 into band 1, P2 between, P3/P4 below) lives in uncommitted-to-law evidence, not the surviving record — so the spec agrees with tasks.md by stating priority-without-value rather than inventing a band. | loop:2495-2499 |
| F4 | Back-desk share bound: no denominator, no observable trigger | loop delta (two places) | Denominator GLOBAL per architect ruling: `whose share is measured **globally**: back-desk model-minutes divided by the model-minutes both desks recorded over the same period` (desks req) + `measured **globally** as back-desk model-minutes divided by the model-minutes both desks recorded over the same period (not per tier: the two desks partition kinds of work, not tiers, and the bound is the machine's share of all the work)` (spending restatement). Trigger observable: `Once both desks exist — that is, once the declared \`data/config.json\` key for the restated bound is present —` in both bodies; bound scenario WHEN `both desks are running` → `the declared \`data/config.json\` key for the restated bound is present and the back desk's global share ... reaches its configured bound`. | loop:950-955, 974-979, 2347-2356 |
| F5 | Window forbids ledger ordering, names none | loop delta | `SHALL NOT depend on the ledger's ordering` replaced with `The last five are the five most recently appended \`done\`/\`failed\`/\`discarded\` ledger entries for jobs of that governing type — completion order is the ordering.` Follow-on clause reworded so the ban targets the stopping condition, not the source: `A rule that walks the ledger backwards and stops at the first success mistakes that same append order for a stopping condition`. Second scenario (`failed, failed, done, failed` in append order) already agrees. | loop:1468-1474 |
| F6 | `would-cite-for` refusal reads as covering N=1 | review delta | Final sentence now `A piece among the merged subjects left with no entry — where more than one prose piece is present — is refused exactly as a blank \`would-cite\` is refused.` | review:234-236 |
| F7 | `Desk`/`desk` overload survives the `lane`/`desk` reservation | loop delta | Same sentence as the reservation (F7's instruction): `... and the same reservation covers capitalisation: \`Desk\` is the loop as a whole, \`desk\` is one front/back partition, and the two cases are never interchangeable.` | loop:931-933 |

## 2. Validate

Command (worktree `D:/addictedtoai-worktrees/fleet6-specfix`):

    openspec validate two-desks-work-orders-and-trains --type change --strict --no-interactive

Output:

    Change 'two-desks-work-orders-and-trains' is valid

Two intermediate failures occurred, both the no-drop rule firing on a heading
I had altered, both fixed by restoring the exact live heading:

1. `Three marked twice-failed jobs halt the Desk` — I had first retitled it
   (`... of one type halt the Desk — window-counted, not run-counted`) while
   also changing `three consecutive jobs` → `three jobs ... within the
   breaker's window`. Restored the title, kept the window-counted body.
2. `A reviewer-only runner accumulates a streak` — I had first retitled it
   (`... accumulates a refusal count` / `... a no-output count`) while
   conforming the body. Restored the title, kept the window-conformed body.

`One real run clears it` and `Refusal is not a halt` needed no restore: their
headings were never changed (F2 by ruling, F2b's second by construction).

## 3. Runner-health re-read: every sentence judged

Requirement `A runner proven unable to run is refused, and refusal is not a
halt` (loop:2077-2192), read end to end after the edits. Verdict on each
sentence for the counting-sense question (`streak` / `consecutive` /
`running` as the refusal-count mechanism):

- Intro paragraph (2079-2087): `interrupted ... is resumed oldest-first
  before new work` — ordering of the resumption queue, not the refusal
  count. `breaker 1 counts only \`failed\` and \`discarded\`` — names the
  breaker's outcome set, not a counting method (and was itself swept:
  round-1 `three-consecutive-failures breaker` → `breaker 1`). Clean.
- Detection paragraph (2089-2094): mechanism description, no counting
  vocabulary. Clean.
- Author-evidence bullet (2096-2100): `a run that produced nothing at all`
  — defines one empty invocation, not a run of them. Clean.
- Reviewer-evidence bullet (2101-2110): `output, not silence`, malformed
  handling. No counting vocabulary. Clean.
- Accumulation bullet (2111-2117): was `The streak SHALL be accumulated per
  invocation and per role ... never accumulate a streak` → now `The
  no-output count SHALL be accumulated ... never accumulate a count`.
  Window-conformant.
- Refusal bullet (2118-2123): `After three such runs within that runner's
  last five invocations in that role` — window vocabulary already.
  Clean.
- Application bullet (2124-2126): selection + resumption coverage. Clean.
- Window bullet (2127-2133): defines window, names `backwards walk` only to
  forbid it. Clean.
- Clearing bullet (2134-2135): `the count SHALL fall out of the window as
  producing invocations replace empty ones`. Window-conformant. Clean.
- No-invocation-lines bullet (2136-2142): was `neither count toward the
  streak nor end it` → now `neither count toward the no-output count nor
  clear it` (the `end`→`clear` change is mine, this round: `end` described
  the old streak lifecycle). Window-conformant.
- Not-a-halt bullet (2143-2147): no counting vocabulary. Clean.
- Spin-ends scenario (2149-2156): `three of a runner's last five
  invocations ... each produced no RESULT.md, no output and no diff` plus
  my added `and a fifth has not yet replaced any of them in the window`
  (prevents reading the trip as a same-run triple). Window-conformant.
- Reviewer-only scenario (2158-2164): heading keeps live `streak` (no-drop
  rule — see §2); body window-conformed this round. The heading word is a
  title, not a mechanism sentence; the body's THEN (`three of the last
  five produced nothing`) is what an implementer builds from.
- Malformed scenario (2166-2172): `counts as a producing invocation in the
  window rather than advancing the no-output count`. Window-conformant
  (round 1; unchanged this round).
- Refusal-not-halt scenario (2174-2178): `refused with three of its last
  five invocations in a role having produced nothing`. Window-conformed
  this round.
- One-real-run scenario (2180-2185): threshold-scoped per F2 ruling.
  Window-true, title-true.
- Interleaved scenario (2187-2192): `the producing invocation between them
  does not reset the count`. Window-conformant (round 1; unchanged).

Survivors of the three words inside this requirement and why each is
legitimate: `streak` once, in the live scenario heading `A reviewer-only
runner accumulates a streak` — kept character-for-character because the
no-drop rule refuses a rename (demonstrated twice this round, §2), with
the body carrying the window norm. No `consecutive` or `running` in the
counting sense remains in this requirement.

## 4. Disagreements with rulings

Three, two of them compliances-with-a-record and one a partial
non-compliance:

(a) F3 priority (partial non-compliance, deliberate). The brief says to
    read `tasks.md:2205-2208` and "make the spec agree with it rather than
    inventing a second answer". I read it: `each pending line becomes a
    routed bead carrying the same text and a priority` — a priority is
    required, no value given. The one place a value IS given is
    `evidence/draft-report.md:368-376` (P0/P1 join band 1, P2 between dated
    news and the queue, P3/P4 below cooled proposals) — but that same note
    records (§390-405) that the drafted change implements something
    narrower (one band, ordered by priority within it), and the maintainer
    answer it transcribes is evidence, not the surviving implementation
    record. Pinning a band mapping in permanent law would therefore be
    inventing the second answer the brief forbids. The spec states the
    priority requirement without a value — agreeing with tasks.md exactly
    as far as tasks.md goes. If the band mapping is wanted in law, it
    belongs in the intake requirement's priority-band text, not smuggled
    in through the migration bullet.

(b) F4's suggested trigger wording (compliance with a wrinkle worth
    recording). The brief offers "the declared config key being present"
    as "the kind of thing that qualifies". I used exactly that — but note
    it makes the trigger self-referential: the bound's existence condition
    is the key that states the bound. That is fine as an observable
    predicate (anyone can check it from the tree, no job can fake it since
    `data/config.json` is reserved), and it matches how the change treats
    every other bound (all live in `data/config.json` per
    loop:2288-2290). The alternative — "task 79 done" — would key law on a
    task number that will not survive archiving. No contradiction found;
    no STOP invoked.

(c) F5's "runner in that role" phrase (compliance, flagged not followed).
    The ruling's explicit naming is `the five most recently appended ledger
    entries for that runner in that role`. I wrote `... ledger entries for
    jobs of that governing type` instead. Reason: the requirement counts
    per **governing job type** (body: `Repeated failure of the same
    governing job type`), and breaker 1 has never been per-runner — `that
    runner in that role` is the runner-health window's unit (loop:2118),
    and importing it here would change whose failures are counted, not
    just their order. The ruling's operative demand — name ledger append
    (completion) order as the ordering — is fully implemented; the unit
    follows the requirement's own body rather than the ruling's
    cross-requirement slip. If the architect meant per-runner counting,
    that is a different change than an ordering clarification.

## 5. Sweep (the class: leftover vocabulary from a superseded model)

Every requirement touched in round 1 or round 2, read end to end, asked
the one question. Verdicts including the clean ones:

| Requirement | Verdict |
|---|---|
| Front/back desks share an intake (loop:925-985) | Fixed (F4, F7). Restatement bullet + bound scenario now config-key trigger + global share. `Desk`/`desk` capitalisation reserved in the reservation sentence. No streak/window vocabulary in this requirement to begin with. |
| Breakers halt the loop (loop:1459-1554) | Fixed (F1, F5). Scenario window now failure/done; ordering now ledger-append. Swept further: follow-on `pure function of the order lines were appended` reworded (it re-banned the order just named); gate-retry scenario `three consecutive jobs` → window-counted; train-red `consecutive-failure breaker` → `breaker 1`; work-order `consecutive-failure breaker counts` → `breaker 1 counts`; chain-gate `three consecutive failures` → `three failures`. `consecutive` survivors here: `fail, fail, done, fail` + `a consecutive count of one` (describes the OLD rule being refuted, loop:1476); `never trips a consecutive rule` (same, loop:1489); `three consecutive trains` / `three consecutive nights` (eviction/train scenarios, untouched by this change's window model — trains and nights are not ledger windows). |
| Runner-health refusal (loop:2077-2192) | Fixed (F2, F2b + sweep). See §3 for the sentence-by-sentence verdict. Heading `streak` kept under the no-drop rule with window body. |
| Gate retry (loop:1916-2018) | Swept: `advances breaker 1's consecutive count` → `advances breaker 1's count`; scenario `Three marked twice-failed jobs halt the Desk` body window-counted, heading restored under no-drop. |
| Capacity pause (loop:2020-2075) | Swept: `under-counts the consecutive run` → `under-counts the run of \`capacity\` outcomes`; `after the first \`capacity\` in a consecutive run` → `in a run`; `doubling per consecutive \`capacity\`` → `doubling per \`capacity\` in that run`. Remaining `consecutive` (loop:2038) is inside the backoff-interval definition (a run of capacity outcomes setting a doubling interval), not the refusal-count mechanism — a different model, legitimately consecutive. |
| Chain (loop:1035-1202) | Swept: `the consecutive-failure count` → `the breaker-1 count`; `walk three consecutive failures` → `walk three failures`; failure-streak scenario title → `walking failures into a halt`. |
| Spending budgeted (loop:2271-2446) | Fixed (F4 restatement). Global denominator + config-key trigger in the restatement paragraph. No streak vocabulary. |
| Work orders (loop:20-200) | Swept, one word (`consecutive-failure breaker counts` → `breaker 1 counts`). Otherwise clean — never carried the window model. |
| Intake (loop:823-924) | Read. Clean — never carried streak/breaker/window vocabulary; its `pending` (pending-amendment deltas, loop:994) is a different word from F3's pending lines and correctly left alone. |
| Jobs have identities / issue-id (loop:2447-2508, round-1 ADDED) | Read. Clean — round-1 text, no superseded-model vocabulary. F3's pending definition landed here as specified. |
| Lane/desk lines (loop:929-931, 946-956 — round-1 1a-1d) | Read. Clean — F7's capitalisation clause added to the reservation sentence itself. |
| 30% scenario (loop:2401) | Read. Clean — value fix only, no model vocabulary. |
| Review `would-cite-for` (review:228-239) | Fixed (F6). Qualifier added twice: opening `and only then` + closing em-dash clause, so neither the list nor the refusal reads as covering N=1. No window/streak model in this requirement. |

## 6. Anything not done

- F3's priority VALUE is not pinned (see §4a): the spec requires a
  priority per migrated bead without stating which, because the surviving
  record (tasks.md:2205-2208) requires one without stating which. Stating
  a band mapping would be the invented second answer.
- F5's `for that runner in that role` unit is not adopted (see §4c): the
  window is per governing job type per the requirement's own body; the
  ruling's phrase belongs to the runner-health window.
- The live `streak` scenario heading is kept with a window body (see §2):
  renaming it in the delta alone is refused by validate; renaming it in
  the live spec is outside this change's remit.
- No `npm run build`, no `npm test`, per the brief. No commit, no push, no
  worktree changes, `STOP`/`HOLD.md` untouched. Nothing outside the two
  delta files + this RESULT file was created, edited or deleted.

## THE FULL DIFF FROM THE BASE

```diff
diff --git a/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md b/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
index 9e8c86d..7ea56f7 100644
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
@@ -750,8 +750,8 @@ reverting on that assumption evicts innocent work.
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
@@ -922,10 +922,15 @@ prose should say is the other half and is not mechanised.
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
@@ -940,15 +945,20 @@ budget bounds.
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
+- **Once both desks exist — that is, once the declared `data/config.json` key
+  for the restated bound is present — the bound on the machine's work on
+  itself SHALL be restated as the back desk's share of total effort**, a
+  declared configuration bound whose starting value is taken from the measured
+  drain and whose share is measured **globally**: back-desk model-minutes
+  divided by the model-minutes both desks recorded over the same period,
+  rather than as a ceiling on one engine's share of its own ledger. The two
+  are different
   quantities and only the second is the one anybody cares about: a ceiling on the
-  Desk's share does not reduce machinery work while a lane exists that the ledger
-  cannot see, and with two desks the ledger sees both. The bound SHALL NOT lapse
+  Desk's share does not reduce machinery work while a body of work exists that
+  the ledger cannot see, and with two desks the ledger sees both. The bound
+  SHALL NOT lapse
   when it is restated — a back desk with no limit is process expanding to fill the
   capacity available to it, which is the failure this repository was rebuilt to
   escape.
@@ -962,8 +972,9 @@ budget bounds.
 
 #### Scenario: The bound follows the work when the desks exist
 
-- **WHEN** both desks are running and the back desk's share of total effort reaches
-  its configured bound
+- **WHEN** the declared `data/config.json` key for the restated bound is
+  present and the back desk's global share of the effort both desks recorded
+  reaches its configured bound
 - **THEN** no further back-desk work is selectable until the window rolls, and the
   bound is read against the effort both desks recorded rather than against the
   back desk's own ledger alone
@@ -1030,7 +1041,7 @@ script in a session's temporary directory that vanishes with the session.
   up to a configured number of workers, then the train, and SHALL be readable and
   runnable by anyone with the repository.
 - **The worker count SHALL start at one, and SHALL be raised only once every
-  control that concurrency breaks has been repaired**: the consecutive-failure
+  control that concurrency breaks has been repaired**: the breaker-1
   count, the runner-health count and the lane pause each computed over a window
   rather than by a backwards walk, and the budget gate reading reservations. The
   count is a configuration key the chain reads, so raising it is an edit and not a
@@ -1096,7 +1107,7 @@ script in a session's temporary directory that vanishes with the session.
 - The chain SHALL check for `STOP` and `HOLD.md` before each worker and before the
   train, and SHALL stop rather than continue when either stands. It SHALL stop on
   a failed run rather than launching the next worker, so that W workers cannot
-  walk three consecutive failures of one type into a halt in parallel before any
+  walk three failures of one type into a halt in parallel before any
   of them has been read.
 - The chain SHALL set the lock-wait budget the train's own gates need, since the
   train holds the test and build locks for the length of the full gate set and a
@@ -1155,7 +1166,7 @@ script in a session's temporary directory that vanishes with the session.
   budget gate reads reservations — and where any of the four is not yet true the
   count stays at one
 
-#### Scenario: The chain stops rather than walking a failure streak in parallel
+#### Scenario: The chain stops rather than walking failures into a halt in parallel
 
 - **WHEN** a worker's run ends `failed`
 - **THEN** the chain stops launching further workers and reports which run failed,
@@ -1455,10 +1466,12 @@ and stop the Desk (the Pulse keeps running except where noted):
    (rejected twice); `blocked`, `interrupted`, `capacity`, `abandoned` and
    `evicted-at-train` outcomes never count toward this breaker.
    **The count SHALL be taken over a window of the last five jobs of that type
-   that either failed or succeeded, tripping at three failures among them, and
-   SHALL NOT depend on the ledger's ordering.** A rule that walks the ledger
-   backwards and stops at the first success is a pure function of the order lines
-   were appended, and with more than one worker that order is append-as-you-finish.
+   that either failed or succeeded, tripping at three failures among them. The
+   last five are the five most recently appended `done`/`failed`/`discarded`
+   ledger entries for jobs of that governing type — completion order is the
+   ordering.** A rule that walks the ledger backwards and stops at the first
+   success mistakes that same append order for a stopping condition, and with
+   more than one worker that order is append-as-you-finish.
    Four `repair` workers where the first, second and fourth fail and the third
    finishes in between produce `fail, fail, done, fail` and a consecutive count of
    **one** — three failures in four and no halt. Worse, it degrades in the wrong
@@ -1514,7 +1527,8 @@ discard reviewed work to save nothing, since none of it can reach the remote.
 
 #### Scenario: Repeated failure stops the bleeding
 
-- **WHEN** three consecutive `post` jobs fail review twice each
+- **WHEN** three `post` jobs fail review twice each within the last five
+  failure/`done` jobs of that governing type (failure = `failed` or `discarded`)
 - **THEN** the Desk writes `HOLD.md` naming the pattern and stops, leaving
   the Pulse running
 
@@ -1934,7 +1948,7 @@ settle the job `failed`, or settle the train red.
   that changes with the length of the run.
 - **The classification SHALL NOT remove a failure from any count, any breaker or
   any budget.** A twice-failed gate run is `failed` whether its output carried
-  the marker or not, it advances breaker 1's consecutive count exactly as any
+  the marker or not, it advances breaker 1's count exactly as any
   other `failed` outcome does, and its spend is recorded exactly as any other.
   The classification exists to make the record answerable and for nothing else.
 - The ledger note for a job settled `failed` at the gates SHALL name **which
@@ -1975,8 +1989,8 @@ settle the job `failed`, or settle the train red.
 
 #### Scenario: Three marked twice-failed jobs halt the Desk
 
-- **WHEN** three consecutive jobs of one governing type each fail their gates
-  twice with the machine-failure marker present every time
+- **WHEN** three jobs of one governing type within the breaker's window each
+  fail their gates twice with the machine-failure marker present every time
 - **THEN** breaker 1 trips and `HOLD.md` is written, because a classification
   that could prevent a halt is a classification that can be wrong in the
   direction of never halting
@@ -2017,11 +2031,11 @@ within the backoff interval, whichever line came after it. Reading only the
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
@@ -2065,7 +2079,7 @@ pauses for capacity reasons: the site stays alive on zero inference.
 An expired credential makes an executor exit in seconds with no `RESULT.md`.
 That classifies `interrupted`, correctly — and `interrupted` is not a failure:
 the branch is kept, it is resumed oldest-first before new work, no retry is
-consumed, and the three-consecutive-failures breaker counts only `failed` and
+consumed, and breaker 1 counts only `failed` and
 `discarded`. With no rule against it a Desk would resume the same branch
 forever, halting nothing and telling nobody. The mechanism that ends that spin
 lives in `loop/lib/health.mjs`, and it is specified here rather than left to the
@@ -2094,10 +2108,11 @@ detection covers one is a rule that reads as present and does nothing.
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
@@ -2118,8 +2133,9 @@ detection covers one is a rule that reads as present and does nothing.
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
@@ -2133,7 +2149,8 @@ detection covers one is a rule that reads as present and does nothing.
 #### Scenario: The spin ends at the third empty run
 
 - **WHEN** three of a runner's last five invocations in a role each produced no
-  `RESULT.md`, no output and no diff
+  `RESULT.md`, no output and no diff, and a fifth has not yet replaced any of
+  them in the window
 - **THEN** the loop refuses that runner for authoring and review, printing the
   cause and the conformance command that clears it, and does not invoke it or
   resume a branch with it
@@ -2141,28 +2158,31 @@ detection covers one is a rule that reads as present and does nothing.
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
+  exactly three empty ones is repaired, and its next run produces a diff
+- **THEN** that producing invocation replaces one window slot, two of the last
+  five remain empty, and the runner is selectable again, with no other action
 
 #### Scenario: A healthy invocation between two dead ones does not clear the count
 
@@ -2326,9 +2346,14 @@ words, "machinery crowds out visitor value".
 
 **A ceiling on the Desk's share is the wrong quantity once there are two desks,
 and it SHALL be restated rather than removed.** When the front and back desks
-exist, the ledger sees both, and the bound becomes the **back desk's share of
-total effort** — a declared configuration bound whose starting value is taken from
-the measured drain, with the filing rule bounding what enters the backlog. A back
+exist — that is, once the declared `data/config.json` key for the restated
+bound is present — the ledger sees both, and the bound becomes the **back
+desk's share of total effort** — a declared configuration bound whose starting
+value is taken from the measured drain, measured **globally** as back-desk
+model-minutes divided by the model-minutes both desks recorded over the same
+period (not per tier: the two desks partition kinds of work, not tiers, and
+the bound is the machine's share of all the work), with the filing rule bounding what enters
+the backlog. A back
 desk with no limit at all is the predecessor's failure mode restated: process
 expands to fill the capacity available to it, and this repository's own history
 records the ratio it reached. The limit changes what it measures; it does not
@@ -2373,7 +2398,7 @@ denominator therefore has a floor of its own.
 
 #### Scenario: Machinery work hits its ceiling
 
-- **WHEN** `machinery` MM reaches 10% of the rolling window
+- **WHEN** `machinery` MM reaches 30% of the rolling window
 - **THEN** no further machinery job is selectable until the window rolls,
   regardless of how appealing the improvement looks
 
@@ -2419,6 +2444,68 @@ denominator therefore has a floor of its own.
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
+  same text and a priority, and a parked line migrates with it once it is made
+  live again; the file is deleted with `loop/lib/directives.mjs`
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
