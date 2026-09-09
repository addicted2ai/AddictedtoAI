# DELTA REVIEW — Stage 0, packet D (tasks 23 and 24), round 2. NO EDIT RIGHTS.

authority: two-desks-work-orders-and-trains@5414899

You are the REVIEWER of a tests-only revision round, reviewing it ALONE with
NO EDIT RIGHTS: do not commit, do not push, do not modify any tracked file
except as a MUTATION you restore immediately and prove restored by hash.

The worktree, and the only place you may write:

    D:/addictedtoai-worktrees/fleet6-stage0-D

Branch `stage0/d-escalation`, tip **`46528c5`**, merge base
**`5414899`**. The previous round's tip was `8f5e14f`; this round's
diff is `git -C D:/addictedtoai-worktrees/fleet6-stage0-D diff 8f5e14f..HEAD`
and must touch ONLY `loop/tests/runner-policy.test.mjs`
— any other tracked path in it is a finding and a full-review trigger.

## This is a DELTA review, and it is NOT sealed — say so

You are GIVEN the previous review, `<worktree>/REVIEW1.md`,
because you need it: this round exists to build the arms it found missing.
The author's report is `<worktree>/RESULT2.md` (a hypothesis) and its
brief `<worktree>/.agent-brief.md` (evidence). State in a section headed
"Sealing" that you read REVIEW1.md and were not sealed from it,
and name anything else you opened.

## Exit condition (the architect's ruling, in the Stage 0 preamble)

Round 1's sealed review (REVIEW1.md) found two test gaps — changed lines
whose mutation stayed green: the three early returns' `topRanked: null`
(`select.mjs:158`, `:176`, `:190`) and the non-empty-string guard on
`escalates_to` (`runners.mjs:86-88`) — and no production defect; all six
author mutations and its own floor mutation went red. Round 2 is tests only,
in one file. That class of finding has no floor (packet B2's four reviews of
one diff each found new green mutants, none a production defect; packet E's
delta review carried two more), so the architect's exit condition in the
Stage 0 preamble applies: you APPROVE when (a) every named mutation of
REVIEW1's two findings — each of the three `null` → `{}` mutations, and the
guard disabled — goes RED under you against the current production code and
restores GREEN by hash; (b) the author's sweep lists every code line of the
round-1 diff with its covering arm or the reason none can, and your reading
of the diff finds no omitted line; (c) this round's diff is within its one
listed test file; (d) the standing properties hold; and (e) the author's
completed full suite on the final tip is green (1,790 or more, 0 failed). A
further green mutant you find is written into your review under "Carried,
non-blocking" and does NOT change the verdict — unless it exposes a
PRODUCTION defect (an arm that goes red against the unmutated code, or a
wrong world the requirement forbids), which remains a revise. Do not
manufacture a revise from the carried class; do not approve if any prior
named mutation stays green.

## What you judge, in this order

1. EACH FINDING in REVIEW1.md now has an arm: re-run the NAMED
   MUTATION of each finding yourself — `loop/lib/select.mjs:158`, `:176` and
   `:190` `topRanked: null` → `{}` one at a time, and the guard at
   `loop/lib/runners.mjs:86-88` disabled — against the current production
   code, record the arm RED with its `# pass`/`# fail` counts, restore by
   SHA-256, record GREEN. An arm the author claims red that stays green under
   you is a finding; an arm that goes red against the UNMUTATED code was to
   be DIAGNOSED by the author (a wrong arm fixed and said so; a production
   defect stopped on) — check §7 of the report and judge the diagnosis.
2. THE SWEEP: the author was required to list EVERY added or changed code
   line of `git diff 5414899..8f5e14f -- loop/lib/runners.mjs loop/lib/select.mjs loop/run.mjs`
   with the arm (in `runner-policy.test.mjs` or an outside suite) whose
   mutation of it goes red, or the reason none can. Read the diff yourself;
   a code line the list omits is a finding. Spot-check at least three lines
   the list attributes to an arm in `runner-policy.test.mjs` other than the
   round-1 six, by mutating them.
3. THE DIFF-AS-THE-LIST on THIS round's changed TEST lines: a test arm is
   itself behaviour; for each new or changed arm, ask what wrong world it
   still passes on — an `assert.throws` without the exact message (with the
   guard disabled, `''` still throws as an unknown runner); a loose
   `== null` where `{}` must fail; an early-return arm whose queue holds no
   scout, so it never shows the return winning over a candidate that would
   have escalated; an arm reaching the gate without going through `selectJob`.
4. NOT RE-RUN HERE: the round-1 table's six mutations and REVIEW1's floor
   mutation — REVIEW1 reproduced them on `8f5e14f` and the production
   files are unchanged in this round (verify that by this round's diff named
   at the top, and say so).
5. THE FULL SUITE: the author must have run ONE completed iteration on the
   final tip and quoted its counts (1,790 or more, 0 failed); a cut-off, a
   red, or counts from an earlier commit is a finding.
6. THE STANDING PROPERTIES — find what enforces each and run it: the machinery
   names no model, provider, harness or runner id; no source references an
   unarchived change directory; the shipped registry still loads through
   `loadRunners` and every clearance it declares is still enforced
   (`loop/tests/selector-rules.test.mjs`).
7. WHEN YOU PARSE TEST OUTPUT, ASSERT THE TEST COUNT (`--test-reporter=tap`).

## The standard (verbatim, `tasks.md` at the authority commit)

> - [ ] 23. `loop/lib/select.mjs` and `loop/lib/runners.mjs`: escalation moves into the
>       repository and fires when the **top-ranked** candidate is refused *solely* on
>       `runner:job-type`; no other refusal escalates. Implements the same
>       requirement's escalation bullets.
>       **Resolved before D's freeze (the architect's quantifier enumeration,
>       2026-09-09 06:59, from the code at `9c1d980`):** (i) "the top-ranked
>       candidate" is `candidates[0]` of `gatherCandidates`' sorted list
>       (`select.mjs:88-103`: directives, then pre-empting proposals, then queue
>       items in the Pulse's ranked order, then ripe proposals) BEFORE any gate —
>       not the first eligible candidate and not the one the upkeep floor kept.
>       (ii) "refused solely on `runner:job-type`": the gate list (`:199-207`)
>       breaks at the first refusal and the clearance gate is first (`:200`), so
>       a candidate refused on clearance has no other rule recorded and the rule
>       name alone decides; every other refusal — `degradation:`, `budget:`
>       (ceiling or `budget:upkeep-floor`, which `applyUpkeepFloor` at
>       `budget.mjs:553-577` applies after the gates), `capacity:`,
>       `conformance:`, the health gate's, the tutorial gates' — escalates
>       nothing. (iii) "Escalation moves into the repository": `selectJob`
>       exposes the top-ranked candidate's refusal as `topRanked: { candidate,
>       rule }` on its result (`null` when the top-ranked candidate was
>       eligible), and a new pure function in `select.mjs`,
>       `escalationTarget(registry, runner, sel)`, returns the registry entry
>       named by the run's entry's `escalates_to` exactly when `sel.topRanked`'s
>       rule is `runner:job-type` and the field is declared, else `null`.
>       `topRanked` is also `null` on the conformance, health and lane-paused
>       early returns (`select.mjs:154-195`), which gather no candidates
>       (added 2026-09-09 08:45 from the brief review's finding 3).
>       `run.mjs`'s one call site (`:1223`) re-runs `selectJob` with that entry
>       as `runner`. The re-run gathers the same list (gathering is deterministic
>       within a run; the duplicate sweep already ran on the first pass), so the
>       escalated selection is ADOPTED exactly when its `topRanked` is `null` and
>       its `selected` is non-null — the top-ranked candidate passed every gate
>       of the escalation entry (its tier's shares and floor, its conformance and
>       health records) and is the job. The run then proceeds with `runner` = the
>       escalation entry for every phase that reads `runner` (`:264` the author
>       phase entry, `:287`, `:305`, `:757` the revision, `:1439-1441` the
>       outcome line): the ledger records what actually ran. Otherwise the
>       ORIGINAL selection's outcome stands — a lower-ranked cleared candidate on
>       the original entry, or nothing — and the log names both the top-ranked
>       refusal and the escalation entry's own refusal of it. That is what "SHALL
>       NOT escalate past a refusal of any other kind" means in code: the run
>       escalates at most one step and never lets the escalation entry take work
>       below the top-ranked candidate, so a routing rule buys no budget and no
>       rung. (iv) The registry half: `loadRunners` (`runners.mjs:16`) accepts an
>       optional `escalates_to` string per entry — when present it must name a
>       registered id other than the entry itself whose `roles` include `author`
>       (load-time errors otherwise, the `job_types` pattern at `:63-76`); absent
>       means the entry escalates nothing; the escalation entry's own
>       `escalates_to`, if any, is not followed in the same run. The
>       `runners.yml` line — `escalates_to: codex-gpt-luna` on
>       `codex-gpt-luna-medium` — is **[orchestrator]** (a reserved file) and
>       lands with D's handover, together with retiring the grep-based
>       escalation in the caller's script the requirement names
>       (`desk-chain3.sh:94-132` in the orchestrator's scratchpad, whose own
>       comment records that it never fired across 18 jobs on 2026-09-08) and
>       rewriting `runners.yml:219-235`, the max entry's note that "routing is
>       therefore the caller's job", which D makes false (added 2026-09-09
>       09:22 from the brief review's finding 3). (v)
>       Escalation applies whether the run's entry came from `--runner` or the
>       default (`pickRunner`, `run.mjs:910`) — the chain passes `--runner`
>       explicitly and that is the case this exists for; the resume path
>       (`:1160-1221`) selects nothing and escalates nothing; `--dry-run`
>       reports the decision on the log and in the returned `runner` (`:1303`)
>       without invoking anything. (vi) Task 22's `enabled: false` (packet F) has
>       not shipped: under D an escalation entry whose selection returns
>       `blocked` (conformance or health) is a refusal of another kind and stands;
>       F adds "disabled" to that list. (vii) Not added, and said so: no ledger
>       key records that a job was escalated — the phases' `runner` and `effort`
>       (task 25) already make the per-rung revise rate computable, and a key no
>       task names is scope. (viii) Files: `loop/lib/select.mjs`,
>       `loop/lib/runners.mjs`, `loop/run.mjs` (the one call site and the
>       dry-run log), and task 24's new test; the closure check —
>       `loop/tests/selector-rules.test.mjs:415-448` loads the REAL registry
>       through `loadRunners`, so the shipped file must still load, and no test
>       pins the exact key set of `selectJob`'s result (grepped at `9c1d980`).
>       (ix) The `run.mjs` line numbers above are `9c1d980`'s; packet E
>       (`c3aa5c7`) moved that file and nothing else this task reads — at
>       `f74f606` read `:264`, `:287`, `:305`, `:757`, `:910`, `:911`,
>       `:1160-1221`, `:1223`, `:1303`, `:1439-1441` as `:274`, `:303`, `:321`,
>       `:779`, `:943`, `:944`, `:1193-1254`, `:1256`, `:1336`, `:1472-1474`;
>       `select.mjs`, `runners.mjs:16-76` and `budget.mjs` did not move
>       (measured by `git diff 9c1d980..f74f606`, 2026-09-09 10:29). The
>       registry now also carries `effort:` on the four codex entries
>       (`f74f606`), which `loadRunners` validates at `runners.mjs:77-81`.
> - [ ] 24. `loop/tests/runner-policy.test.mjs`: a top-ranked clearance-only refusal
>       escalates and authors the top-ranked candidate; a budget-ceiling refusal does
>       not escalate; **and the control that matters** — an overdue scout top-ranked
>       and refused on clearance with one cleared `repair` below it authors the
>       scout, not the repair. **Mutation**: escalate only when every candidate is
>       refused, and confirm the scout case fails while the other two still pass.
>       Tests task 23.
>       **Resolved before D's freeze (2026-09-09 06:59):** (i)
>       `loop/tests/runner-policy.test.mjs` is NEW — no file of that name;
>       `selector-rules.test.mjs` owns the clearance gate and stays. (ii) The
>       fixture is `makeRepo` with the test's OWN `runners.yml` (the
>       `selector-rules.test.mjs:374-387` pattern; `helpers.mjs:69-98`'s default
>       registry declares no clearance): a cheap entry with `job_types` and
>       `escalates_to` naming an unrestricted frontier entry, generic ids only,
>       plus a reviewer-cleared entry — `runLoop` resolves a reviewer before it
>       selects (`run.mjs:911`) and throws without one (added 2026-09-09 08:45
>       from the brief review's finding 1).
>       "Overdue" is the Pulse's ranking, which the fixture expresses as queue
>       ORDER (`writeQueue`): the scout first is the top-ranked candidate.
>       (iii) Arms: (a) the queue holds ONE scout and nothing else, the run's
>       entry is the cheap one: `topRanked.rule` is `runner:job-type`, the
>       escalation fires, the adopted selection's job is the scout and the
>       returned runner is the frontier entry; (b) a budget-ceiling refusal
>       presupposes the candidate PASSED clearance, so (b)'s run entry is cleared
>       for the top-ranked type and the fixture ledger spends `new_writing`
>       past its ceiling on BOTH tiers — the run entry's and the escalation
>       entry's, since pools are per tier (`tierShares` at `select.mjs:150`)
>       and an unspent escalation tier would let the named mutation's re-run
>       adopt the candidate and turn (b) red (added 2026-09-09 09:22 from the
>       brief review's finding 1) — (the `budget.test.mjs:477-498` pattern):
>       the top-ranked is refused on `budget:new_writing-ceiling`, nothing is
>       escalated, the runner is unchanged and nothing is selected; (c) THE
>       CONTROL: the scout first and a `repair` second, the cheap entry cleared
>       for `repair` only — the selected job is the scout on the frontier entry,
>       not the repair on the cheap one; (d) the other-kind refusal AT the
>       escalation entry: as (c) but the frontier tier's `new_writing` spent past
>       its ceiling — the escalation is not adopted, the repair runs on the cheap
>       entry, and the log names both refusals. (iv) Each arm observes the pure
>       helper's return, and at least (c) also runs `runLoop(ctx, { runner:
>       '<cheap id>', dryRun: true })` and asserts the returned `job.type` and
>       `runner.id` (`run.mjs:1303`), so a call-site mutation is caught and not
>       only a library one; (a), (b) and (d) may also run the dry-run call
>       where their outcome is only observable there (the log naming both
>       refusals, the returned runner), and only (c)'s assertion set is what
>       the call-site mutation must turn red (added 2026-09-09 08:45 from the
>       brief review's finding 2). (v) The registry arms, in the same file: an
>       `escalates_to` naming an unknown id, the entry itself, or an entry not
>       cleared for `author` fails `loadRunners` at load; absent loads as
>       `undefined`. (vi) The named mutation: key the escalation, AT THE
>       `run.mjs` CALL SITE (not inside `escalationTarget`, whose rule stays
>       `runner:job-type`; added 2026-09-09 09:22 from the brief review's
>       finding 2), on `sel.selected === null` (escalate only when every
>       candidate is refused)
>       — (c) fails because the repair is selected on the cheap entry and nothing
>       escalates, while (a) and (b) still pass ((a) has nothing below the
>       scout, which is why it is a separate arm); restore. The diff-as-the-list
>       rule adds at least one mutation per changed function beyond it: (d)'s
>       adoption condition dropped (adopt any non-null escalated selection) must
>       go red under (d).
>

## Files

The author was permitted exactly these; anything else in this round's diff is
a scope finding.

- `loop/tests/runner-policy.test.mjs` — (new) on this branch since round 1 (task 24); the early-return and malformed-`escalates_to` arms (findings 1-2) and the sweep
- `RESULT2.md` — (new) the author's report, uncommitted, in the worktree root

## Hard limits

- NEVER run `npm run build`, NEVER the full `npm test`, never any `verify-*`
  script as a whole (importing a function from one in a test is fine), the
  Pulse or the Desk. Targeted `node --test <absolute path>` only.
- Never use the token `cd` anywhere in a command, including in a comment — a
  guard blocks the string. Absolute paths and `git -C <dir>`.
- A blocked or refused command is REPORTED, not routed around.
- NEVER `git worktree remove`, and never delete a `node_modules`: a forced
  removal follows the junction and, on this machine, deleted 177 packages in
  a single attempt. Your probes use throwaway repositories under the OS temp
  directory, as the tests do.
- Keep commands short; write a `.mjs` under `<worktree>/.job/` and run it
  rather than `node -e`. Delete any probe file you create and say so.
- Every date you write is this machine's LOCAL date, read from
  `node -p "new Date().toLocaleString('sv-SE')"`.
- DO NOT RUN `bd close`, and do not run `bd update` on any bead.
- No `git push`, `git merge`, `git commit`, or `gh`.

## Output — write to `D:/addictedtoai-worktrees/fleet6-stage0-D/REVIEW2.md`

This exact numbered name, never the bare un-numbered one.

    # Stage 0 packet D — round 2 (delta) — VERDICT: approve | revise

    ## Sealing
    (that you read REVIEW1.md, and anything else you opened)

    ## Findings
    (if revise: NUMBERED must-fix items, each with file and line, what is
     wrong, what would make it right, and its CLASS)

    ## The prior findings' arms, re-run
    (per finding: the named mutation, the command, red counts, restoration
     hash, green counts)

    ## The sweep, checked
    (the diff's code lines against the author's list; the spot-check mutations)

    ## Carried, non-blocking
    (a further green mutant, if any — see the exit condition)

    ## What I checked that was sound

    ## What I ran
    (exact commands and their real output)

Approve work that is right and narrow; a small correct round deserves
`approve`, and inventing a finding to justify `revise` is as much a failure
as missing a real one.
