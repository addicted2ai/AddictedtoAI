# REVIEW TARGET — spec delta corrections, round 1

authority: two-desks-work-orders-and-trains@53779c3676e4135108aec5b295c4840592f75fa5

Worktree `D:/addictedtoai-worktrees/fleet6-specfix`, branch `stage0-specfix`, base 53779c3. Author was muse-spark
via OpenRouter at xhigh. `openspec validate ... --strict` passes (exit 0,
"Change 'two-desks-work-orders-and-trains' is valid"), re-run independently by
the architect, not taken from the author's report.

## THE AUTHOR'S REPORT

# RESULT1 — SPEC DELTA CORRECTIONS, round 1

Worktree: `D:/addictedtoai-worktrees/fleet6-specfix`. Main tree was read, never written.

## 1. Finding → file → change → line

| # | Finding (source) | File | What changed | Line(s) |
|---|---|---|---|---|
| 1a | added-2 F2, title | loop delta | Title `…never share a lane` → `…share an intake and are otherwise separate` | loop:925 |
| 1b | added-2 F2, intro | loop delta | `two lanes` → `two desks`; added one sentence reserving terms (`A lane is the set of runners sharing a provider` = provider set only; `desk` = work partition; never interchangeable) | loop:927-931 |
| 1c | added-2 F2, gating bullet | loop delta | `A lane decides…` → `A desk decides…` | loop:946-947 |
| 1d | added-2 F2, ledger bullet | loop delta | `while a lane exists…` → `while a body of work exists…` (not `desk`, per brief) | loop:953-954 |
| 2 | modified-1 F1, breaker scenario | loop delta | `three consecutive post jobs` → `three post jobs … within the last five failed/done jobs of that governing type` | loop:1520-1521 |
| 3 | modified-2 F2, runner-health scenarios | loop delta | `streak is cleared rather than advanced` → `counts as a producing invocation in the window rather than advancing the no-output count`; `streak is zero…` → window-slot replacement, selectable again once <3 of last 5 are empty; scenario title `One real run clears it` kept (validate requires the live heading name) with conforming body | loop:2153-2158, 2166-2171 |
| 4 | modified-2 F4, 10%-vs-30% scenario | loop delta | `reaches 10%` → `reaches 30%` (table + live config already 30) | loop:2382 |
| 5 | review F1, `would-cite-for` refusal | review delta | `no entry and no record-wide` → each piece requires its own entry; record-wide alone satisfies nothing for N>1 | review:230-236 |
| 6 | removed F2, dangling "three sources" | loop delta | New MODIFIED block `Jobs have identities, and interrupted jobs resume by branch` rephrasing ordering around the one intake | loop:2428-2458 |
| 7 | removed F3, dangling DIRECTIVES harvest | loop delta | New MODIFIED block for the front-matter/prose requirement: DIRECTIVES.md retires via task-89 migration (pending lines → routed beads, file + directives.mjs deleted), harvesting bullets deleted with it, no repoint | loop:2460-2482 |

## 2. Validate

Command (worktree `D:/addictedtoai-worktrees/fleet6-specfix`):

    openspec validate two-desks-work-orders-and-trains --type change --strict --no-interactive

Output:

    Change 'two-desks-work-orders-and-trains' is valid

One intermediate failure occurred and was fixed: after renaming the runner-health
scenario `One real run clears it` → `One real run moves the window`, validate
reported the MODIFIED block omits a scenario the live spec still has ("a
MODIFIED requirement replaces the whole block, so archive refuses to drop
them"). I restored the original scenario title and kept the conforming body;
validate then passed.

## 3. Lane count after edit

The brief's target: ten lines in the provider sense. My count is twelve lines /
thirteen matches, because the plan below did not survive two facts: my new
MODIFIED block for finding 6 copies the live resumption bullet, which itself
contains `lane` (`and whose lane is not paused`), and my reserving sentence in
finding 1 mentions `lane` as a word. Extra provider-sense mentions are
harmless; deleting the live bullet's word would falsify the MODIFIED block.

Commands:

    @(Select-String -Path 'D:\addictedtoai-worktrees\fleet6-specfix\openspec\changes\two-desks-work-orders-and-trains\specs\loop\spec.md' -Pattern 'lane' -CaseSensitive).Count
    ([regex]::Matches([System.IO.File]::ReadAllText('D:\addictedtoai-worktrees\fleet6-specfix\openspec\changes\two-desks-work-orders-and-trains\specs\loop\spec.md'), 'lane')).Count

Output: `12` lines, `13` matches.

Remaining lines: 929 (reserving sentence, meta-mention), 1037, 1156, 1397,
1418, 2016, 2018, 2022, 2029, 2059, 2064, 2439 (resumption bullet carried from
live law). No remaining line uses `lane` in the desk sense.

## 4. Line-number mismatches

The brief's MODIFIED-1 numbers did not match the worktree file: it cited the
breaker scenario near its old position, but in the worktree the `Repeated
failure` scenario is at loop:1515-1519 (edited to 1520-1521), the runner-health
`cleared`/`zero` scenarios at 2149-2165, and the 10% scenario at 2374-2378
(edited to 2382). I found each by its quoted text and edited the text, so no
change was misapplied.

## 5. Choices between readings

- Runner-health wording (finding 3): I wrote "counts as a producing invocation
  in the window" / "replaces one window slot, selectable again once fewer than
  three of the last five produced nothing" rather than "decrements by one",
  because the window norm itself never defines arithmetic beyond share-of-five;
  mirroring its language is the smaller change.
- DIRECTIVES harvest block (finding 7): I chose REMOVED-by-MODIFIED semantics —
  the three directive-prose bullets are deleted with the file rather than
  repointed at routed-issue prose — because a routed bead carries its own id
  (there is nothing to harvest) and tasks.md:2205-2208 already defines the
  migration (pending lines → routed beads, file + directives.mjs deleted) as the
  surviving record. A repointed harvest rule would invent a mechanism.
- The new MODIFIED blocks carry the minimal scenario set (resumption +
  stale-branch; malformed-id) to satisfy validate's no-drop rule without
  importing unrelated live scenarios.

## 6. Omissions

Nothing the brief asked for was omitted. The four desk-sense `lane` lines were
all changed; the four scenario contradictions were conformed to the side the
brief named; both dangling removals got new MODIFIED blocks; no file outside
the two deltas was touched; no code was edited; `npm test` / `npm run build`
were not run per the brief. The only target not met as literally stated is the
ten-line `lane` count (see §3: twelve lines, thirteen matches, all provider
sense, for stated reasons).

## THE DIFF

```diff
diff --git a/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md b/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
index 9e8c86d..a680ada 100644
--- a/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
+++ b/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
@@ -922,10 +922,13 @@ prose should say is the other half and is not mechanised.
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
+partition, and the two words are never interchangeable.
 
 - The **front desk** runs the site's work: content work orders of the content job
   types, executed by up to a configured number of parallel workers, gated by the
@@ -940,15 +943,15 @@ budget bounds.
   no qualifying content work, it runs the daily outward sweep if that is due, and
   otherwise nothing.
 - Both desks SHALL be gated by the same rules: the ceilings, the floor, the shed
-  levels, the runner clearance and the review gate apply identically. A lane
+  levels, the runner clearance and the review gate apply identically. A desk
   decides which work is reached; it never decides what may be afforded.
 - **Once both desks exist, the bound on the machine's work on itself SHALL be
   restated as the back desk's share of total effort**, a declared configuration
   bound whose starting value is taken from the measured drain, rather than as a
   ceiling on one engine's share of its own ledger. The two are different
   quantities and only the second is the one anybody cares about: a ceiling on the
-  Desk's share does not reduce machinery work while a lane exists that the ledger
-  cannot see, and with two desks the ledger sees both. The bound SHALL NOT lapse
+  Desk's share does not reduce machinery work while a body of work exists that
+  the ledger cannot see, and with two desks the ledger sees both. The bound SHALL NOT lapse
   when it is restated — a back desk with no limit is process expanding to fill the
   capacity available to it, which is the failure this repository was rebuilt to
   escape.
@@ -1514,7 +1517,8 @@ discard reviewed work to save nothing, since none of it can reach the remote.
 
 #### Scenario: Repeated failure stops the bleeding
 
-- **WHEN** three consecutive `post` jobs fail review twice each
+- **WHEN** three `post` jobs fail review twice each within the last five
+  `failed`/`done` jobs of that governing type
 - **THEN** the Desk writes `HOLD.md` naming the pattern and stops, leaving
   the Pulse running
 
@@ -2150,7 +2154,8 @@ detection covers one is a rule that reads as present and does nothing.
 
 - **WHEN** a reviewer invocation writes a verdict record that the merge gate
   refuses as malformed
-- **THEN** the no-output streak is cleared rather than advanced, and the
+- **THEN** the invocation counts as a producing invocation in the window rather
+  than advancing the no-output count, and the
   malformed record is handled by the merge gate's own refusal
 
 #### Scenario: Refusal is not a halt
@@ -2161,8 +2166,9 @@ detection covers one is a rule that reads as present and does nothing.
 #### Scenario: One real run clears it
 
 - **WHEN** a refused runner is repaired and its next run produces a diff
-- **THEN** the streak is zero and the runner is selectable again with no other
-  action
+- **THEN** that producing invocation replaces one window slot, the count falls,
+  and the runner is selectable again once fewer than three of its last five
+  invocations produced nothing, with no other action
 
 #### Scenario: A healthy invocation between two dead ones does not clear the count
 
@@ -2373,7 +2379,7 @@ denominator therefore has a floor of its own.
 
 #### Scenario: Machinery work hits its ceiling
 
-- **WHEN** `machinery` MM reaches 10% of the rolling window
+- **WHEN** `machinery` MM reaches 30% of the rolling window
 - **THEN** no further machinery job is selectable until the window rolls,
   regardless of how appealing the improvement looks
 
@@ -2419,6 +2425,66 @@ denominator therefore has a floor of its own.
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
+- `DIRECTIVES.md` retires: each pending line migrates into a routed bead
+  carrying the same text, the file is deleted with `loop/lib/directives.mjs`
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
index 0b25d60..1c3e4ba 100644
--- a/openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md
+++ b/openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md
@@ -229,8 +229,10 @@ For every verdict on a prose piece, the review record SHALL contain the
 reviewer's own-words answer to "who would link this, and in what argument?", in a
 required, non-empty `would-cite`. Where the merged subjects hold **more than
 one** prose piece, the record SHALL carry a `would-cite-for` **list of entries**,
-each naming its piece and carrying that piece's own answer, and a piece among the
-merged subjects left with no entry and no record-wide `would-cite` is refused
+each naming its piece and carrying that piece's own answer, and each piece
+among the merged subjects requires its own entry: a record-wide `would-cite`
+alone satisfies nothing for N>1. A piece among the
+merged subjects left with no entry is refused
 exactly as a blank `would-cite` is refused. A work order carries several pieces
 by design, and one sentence standing for all of them is the 1/N attention problem
 in the one field that exists to prevent it.
```
