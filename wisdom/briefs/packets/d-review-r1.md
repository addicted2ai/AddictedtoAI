# SEALED REVIEW — Stage 0, packet D (tasks 23 and 24: escalation into the repository). Round 1. NO EDIT RIGHTS.

authority: two-desks-work-orders-and-trains@5414899

You are the REVIEWER of one change, reviewing it ALONE. You fix nothing; you
judge and show your evidence. You have NO EDIT RIGHTS to any tracked file:
do not commit, do not push, do not modify the implementation or its tests
except as a MUTATION you restore immediately and prove restored by hash.

The worktree, and the only place you may write:

    D:/addictedtoai-worktrees/fleet6-stage0-D

Branch `stage0/d-escalation`, tip **`8f5e14f`**, merge base
**`5414899`** (`git -C D:/addictedtoai-worktrees/fleet6-stage0-D merge-base main HEAD`).
The author's brief is at `<worktree>/.agent-brief.md` and its report at
`<worktree>/RESULT1.md`.

## Sealing

THIS PACKET HAS NO EARLIER ROUNDS AND NO EARLIER VERDICTS. There is nothing to be sealed from. It is a first review. Do not go looking for a `REVIEW0.md` or an earlier report; if a file by such a name exists in the worktree, say so in your Sealing section and do not open it.

State in your report, in a section headed "Sealing", whether you opened any
earlier `REVIEW*.md` file or any earlier round's report, and which.

## Known state at dispatch

- The author's ONE commit `8f5e14f` ("loop: add declared runner escalation",
  2026-09-09 11:38) on `stage0/d-escalation` over merge base `5414899`, which
  is local `main` (origin/main `f74f606` is one openspec-only commit behind).
  `git diff --stat 5414899..8f5e14f` = exactly the four permitted files,
  +332/−5: `loop/lib/runners.mjs` +22 (the `escalates_to` validation — a
  non-empty string when present; after every entry is indexed: an unknown id,
  the entry itself, or a target whose `roles` lack `author` are load errors),
  `loop/lib/select.mjs` +29/−2 (`topRanked` on every return including the
  three early returns; set from the FIRST gate refusal of `candidates[0]` or,
  failing that, from the upkeep floor's refusal of it; `escalationTarget`
  pure), `loop/run.mjs` +37/−3 (`let runner`, `let sel`; after the refusal
  log, `escalationTarget` → a second `selectJob` on the escalation entry →
  adopted iff `escalated.topRanked === null && escalated.selected !== null`;
  two log templates, "escalation: …re-running selection on declared runner"
  and "escalation adopted: …" / "escalation refused: …keeping the original
  selection"), `loop/tests/runner-policy.test.mjs` new (six tests).
- RESULT1.md's claims — HYPOTHESES until you verify them: six mutation rows
  red (call site keyed on `sel.selected === null` 4/6; adoption condition
  dropped 5/6; `escalationTarget` null 3/6; self-referencing `escalates_to`
  accepted 5/6; no re-run at the call site 4/6; `topRanked` not populated
  2/6), each restored to 6/6; targeted 71/71; `portability.test.mjs` 13/13;
  `no-change-dir-refs.test.mjs` 3/3; the full suite COMPLETED on `8f5e14f`
  at 1,790 of 1,790 in 477.5 s (main at `5414899` has 1,784; the six new
  tests account for the difference). The architect's own re-run at 11:41
  on the tip: 87 of 87 across the five selector tests and both enforcers —
  that is not a substitute for your arms.
- `runners.yml` at the authority declares NO `escalates_to` on any entry (the
  orchestrator's handover adds `escalates_to: codex-gpt-luna` on
  `codex-gpt-luna-medium` after the merge) and carries `effort:` on the four
  codex entries (`f74f606`), which `loadRunners` validates at
  `runners.mjs:77-81` — the real-registry test must still load it unchanged.
- In the worktree and not in the diff: `.agent-brief.md` (the author's brief)
  and `RESULT1.md`, both untracked; nothing else.
- The machine: another project's codex sessions (`-C
  D:\shared_workspace\solidworks_mcp`) are live and are the maintainer's —
  load to note, never a process to touch. Targeted tests only.
- FOUR READINGS OF THE ARCHITECT'S, to test rather than take: (a) the
  adoption condition implies the selected job IS the top-ranked candidate,
  because the gates push to `eligible` in candidate order and
  `applyUpkeepFloor` (`budget.mjs:553-577`) never reorders — it returns the
  list unchanged or filters it to upkeep, order preserved, with a refusal per
  non-upkeep candidate; confirm from the tip or construct the wrong world.
  (b) the floor-refusal `topRanked` matches by object identity
  (`r.candidate === topCandidate`); confirm the same object reaches the
  floor. (c) the second `selectJob` gathers the same candidate list — task
  23(iii)'s "gathering is deterministic within a run" — confirm
  `gatherCandidates` has no side effect that changes a second call (the
  expired-proposal sweep, a dry-run note, a one-shot warning). (d) the
  "escalation refused" branch matches the escalation entry's refusal by rule
  AND candidate TYPE, not identity; arm (d) reads that log — decide whether a
  same-type, different-candidate match is reachable and whether it matters.

## What you judge against, in this order

1. THE REQUIREMENT, read from the authority commit, read-only: in the loop
   delta, *Runner selection is a declared policy, and escalation is part of
   it* — its escalation bullets (escalation is a registry fact, `escalates_to`,
   one step, fired only by a clearance-only refusal of the top-ranked
   candidate, recorded on the ledger by the phase's `runner`).

       git -C D:/AddictedtoAI show 5414899:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md

2. THE TASK TEXT — tasks 23 and 24, quoted verbatim below, including their
   bold "Resolved before D's freeze" paragraphs, which are the architect's
   resolution of every quantifier and are the standard.
3. The tree.

Never write anything under `D:/AddictedtoAI` — it is the shared checkout.

THE AUTHOR'S BRIEF IS EVIDENCE, NOT THE STANDARD. If the brief contradicts
the requirement or the task, the brief is the defect: report it against the
brief, and note that an author who did what a wrong brief said did its job.
Of the twenty-five review rounds this change has run, most were caused by
the specification, not the workers — and packets B2 and E each lost a round
to a brief whose file list was the tasks' files rather than the closure over
the change. Check the closure yourself: does the shape of `selectJob`'s
return (`Object.keys`, `deepEqual` on the whole result), `loadRunners`'s
per-entry shape, the dry-run log's exact text, or the refusal-reason strings
have an exact pin anywhere the author's file list did not reach? (The
architect's pre-dispatch sweep found one field-level compare,
`deepEqual(sel.warnings, [])` in `selector-rules.test.mjs`, and no key-set
pin; verify that, do not trust it.)

RESULT1.md IS A HYPOTHESIS. Every claim in it is unverified until you
verify it.

## The standard (verbatim, `tasks.md` at the authority commit)

Tasks 23 and 24:

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

The author was permitted exactly these; a diff touching any other path is a
scope finding. Judge each against the reason it was in scope.

- `loop/lib/select.mjs` — `selectJob` exposes `topRanked: { candidate, rule } | null`; the new pure `escalationTarget(registry, runner, sel)` (task 23(iii))
- `loop/lib/runners.mjs` — the optional `escalates_to` string per entry, validated at load on the `job_types` pattern (task 23(iv))
- `loop/run.mjs` — the one `selectJob` call site re-runs the selection on the escalation entry and adopts it only when the top-ranked candidate itself was selected there; the dry-run log names the decision (task 23(iii), (v))
- `loop/tests/runner-policy.test.mjs` — (new) task 24
- `RESULT1.md` — (new) the author's report, uncommitted, in the worktree root
Nothing beyond the list above was permitted; runners.yml is reserved and untouched, and its absence from the diff is correct.

`runners.yml` is RESERVED: its `escalates_to:` line is the orchestrator's and
lands at the handover, not in this branch. A diff touching it is a scope
finding; its ABSENCE from the diff is correct. Until it lands the loop
escalates nothing — the author's report section 5 states the exact line.

## What to check

1. DOES IT DO WHAT THE REQUIREMENT SAYS? Ask of every threshold, assertion
   and fixture: WHAT WRONG WORLD WOULD THIS STILL PASS ON? Construct it.
   In particular: escalation fires ONLY when the TOP-RANKED candidate was
   refused for clearance alone (`runner:job-type`), never on a budget,
   health, cooling, or expiry refusal, and never when a lower-ranked
   candidate was selected; the escalated selection is adopted ONLY when the
   same top-ranked candidate is what the escalation entry selected; one
   step, never a chain.
2. THE DIFF FROM THE MERGE BASE IS THE LIST OF CHANGED BEHAVIOURAL LINES.
   Mutate lines you choose — at least one per changed function — run the
   affected tests, report the arm counts red and restored; a changed line
   with no arm is a finding; a mutation that stays GREEN is the finding.
   Restore by SHA-256. Re-run the author's named mutations (escalate on
   `sel.selected === null`; drop the adoption condition; `escalationTarget`
   returns `null`; `loadRunners` accepts a self-referencing `escalates_to`;
   the call site never re-runs the selection) rather than trusting the
   table; then at least one of your own against the weakest link.
3. THE PROPERTIES — find what enforces each and run it: the machinery names
   no model, provider, harness or runner id (the escalation entry is read
   from the registry at run time; a real runner id in `loop/` — test files
   included, the portability scan reads them — is a violation); no source
   references an unarchived change directory; every clearance the shipped
   registry declares is still enforced and the shipped registry still loads
   (`selector-rules.test.mjs` reads the real `runners.yml`); the selector's
   other refusals are unchanged (`budget`, `expiring-proposal-precedence`,
   `runner-health` tests).
4. THE CALL SITE, NOT THE HELPER, IS WHERE THE DECISION LIVES: an arm that
   observes only `escalationTarget`'s return cannot see the adoption
   condition; at least one arm must run `runLoop` (dry-run) and read the
   selected runner and the two log lines. Check which arms do.
5. THE LEDGER READS THE ESCALATED RUNNER: every later read of `runner`
   (phase entries, the outcome line, the dry-run return) sees the escalation
   entry's id, not the refused one — task 23(v). The abandon-sweep lines are
   unaffected.
6. THE FULL SUITE: one completed author iteration on the final tip, counts
   quoted (1,784 or more, 0 failed); a cut-off, a red or an earlier commit's
   counts is a finding. Do not run it yourself.
7. WHEN YOU PARSE TEST OUTPUT, ASSERT THE TEST COUNT (`--test-reporter=tap`).

## Hard limits

- NEVER run `npm run build`, NEVER the full `npm test`, never any `verify-*`
  script as a whole (importing a function from one in a test is fine), the
  Pulse or the Desk against the real repository. Targeted
  `node --test <absolute path>` only.
- Never use the token `cd` anywhere in a command, including in a comment — a
  guard blocks the string. Absolute paths and `git -C <dir>`.
- A blocked or refused command is REPORTED, not routed around.
- NEVER `git worktree remove`, and never delete a `node_modules`: a forced
  removal follows the junction and, on this machine, deleted 177 packages in
  a single attempt. Probes use throwaway repositories under the OS temp
  directory.
- Keep commands short; write a `.mjs` under `<worktree>/.job/` and run it
  rather than `node -e`. Delete any probe file you create and say so.
- Every date you write is this machine's LOCAL date, read from
  `node -p "new Date().toLocaleString('sv-SE')"`.
- DO NOT RUN `bd close`, and do not run `bd update` on any bead.
- No `git push`, `git merge`, `git commit`, or `gh`.

## Output — write to `D:/addictedtoai-worktrees/fleet6-stage0-D/REVIEW1.md`

This exact numbered name, never the bare un-numbered one.

    # Stage 0 packet D — round 1 — VERDICT: approve | revise

    ## Sealing
    ## Findings
    (if revise: NUMBERED must-fix items, each with file and line, what is
     wrong, which requirement or task clause it violates, what would make it
     right, and its CLASS)
    ## The mutations I ran
    ## The mutation table, judged
    ## What I checked that was sound
    ## Was the brief faithful to the tasks and the requirement? (and the closure)
    ## What I ran

Be adversarial about correctness and fair about scope. Approve work that is
right and narrow; a small, correct packet deserves `approve`; inventing a
finding to justify `revise` is as much a failure as missing a real one.
