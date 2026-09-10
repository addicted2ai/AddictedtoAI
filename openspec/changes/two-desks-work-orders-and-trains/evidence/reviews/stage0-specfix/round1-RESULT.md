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
