# Packet D — tasks 23 and 24 of `two-desks-work-orders-and-trains` (author brief, round 1)

authority: two-desks-work-orders-and-trains@2940298

You are a codex worker, alone and unattended, in the git worktree
`D:/addictedtoai-worktrees/fleet6-stage0-D` on branch `stage0/d-escalation`,
checked out at `2940298`. `node_modules` is a junction to the main checkout —
do not run `npm install`. This brief is everything you have: no prior
conversation, no session to resume. The standard you implement is quoted
verbatim below from `openspec/changes/two-desks-work-orders-and-trains/tasks.md`
at the authority commit; where this brief's prose and the quoted text differ,
the quoted text wins. Its bold "Resolved before D's freeze" paragraphs are the
architect's resolution of every quantifier in the tasks — they are the spec,
not commentary.

## Ground rules (non-negotiable)

- Never use the token `cd` anywhere — not in a command, a comment, or a
  script: the approval guard matches the token and refuses the call. Run
  everything by absolute path; git is `git -C D:/addictedtoai-worktrees/fleet6-stage0-D ...`.
- Keep shell commands short; put anything multi-step in a `.mjs` file under
  `D:/addictedtoai-worktrees/fleet6-stage0-D/.job/` and run that.
- Do NOT run `npm run build`, any `scripts/verify-*.mjs` as a whole, the
  Pulse, the Desk against the real repository, `git push`, or `bd close`. Do
  not edit `package.json`, `runners.yml` (its `escalates_to:` half is the
  orchestrator's), `data/config.json`, `CLAUDE.md`, `AGENTS.md`, anything
  under `data/`, or any file outside the "## Files" list below.
- Nothing under `lib/`, `loop/`, `scripts/`, `app/` or `tools/` may name a
  model, provider, harness or runner id, or reference an unarchived change
  directory. Both properties have enforcement in this tree — find what enforces each, and run it.
  Test fixtures use generic ids (`mock-…`), never a real one.
- Tests build throwaway repositories under the OS temp directory (`makeRepo`
  in `loop/tests/helpers.mjs`) and never touch this worktree's own `.git`,
  `data/` or the real `D:/AddictedtoAI`.
- If a tool call is blocked or refused, record it in `RESULT1.md` and stop
  that step; do not route around it.
- All dates are the machine's LOCAL date.

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
>       comment records that it never fired across 18 jobs on 2026-09-08). (v)
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
>       for the top-ranked type and the fixture ledger spends that tier's
>       `new_writing` past its ceiling (the `budget.test.mjs:477-498` pattern):
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
>       `undefined`. (vi) The named mutation: key the escalation on
>       `sel.selected === null` (escalate only when every candidate is refused)
>       — (c) fails because the repair is selected on the cheap entry and nothing
>       escalates, while (a) and (b) still pass ((a) has nothing below the
>       scout, which is why it is a separate arm); restore. The diff-as-the-list
>       rule adds at least one mutation per changed function beyond it: (d)'s
>       adoption condition dropped (adopt any non-null escalated selection) must
>       go red under (d).
>

The requirement these implement, read-only, at the authority commit — the
escalation bullets of *Runner selection is a declared policy, and escalation
is part of it*:

    git -C D:/AddictedtoAI show 2940298:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md

## Files

Work only in these files. Every other path is out of scope; a diff that
touches one is a scope violation at review.

- `loop/lib/select.mjs` — `selectJob` exposes `topRanked: { candidate, rule } | null`; the new pure `escalationTarget(registry, runner, sel)` (task 23(iii))
- `loop/lib/runners.mjs` — the optional `escalates_to` string per entry, validated at load on the `job_types` pattern (task 23(iv))
- `loop/run.mjs` — the one `selectJob` call site re-runs the selection on the escalation entry and adopts it only when the top-ranked candidate itself was selected there; the dry-run log names the decision (task 23(iii), (v))
- `loop/tests/runner-policy.test.mjs` — (new) task 24
- `RESULT1.md` — (new) your report, in the worktree root; see "## How to end"

`loop/tests/helpers.mjs` and `loop/tests/selector-rules.test.mjs` are
read-only. If you believe a file outside this list must change, do not change
it — describe the need in `RESULT1.md` with the line and the reason, and
stop there.

## Properties (find what enforces each, and run it)

- The machinery names no model, provider, harness or runner id outside
  `runners.yml` — a test under `loop/tests/` enforces this; find it and run it.
  The escalation entry is read from the registry at run time; no id belongs in
  `loop/`.
- No source under `lib/`, `loop/`, `pulse/`, `scripts/`, `app/`, `tools/`
  references an unarchived change directory — a test under `scripts/`
  enforces this; find it and run it.
- Every clearance the shipped registry declares is enforced, and the shipped
  registry still loads — `loop/tests/selector-rules.test.mjs` reads the real
  `runners.yml` through `loadRunners`; run the whole file.
- The selector's other refusals are unchanged — `loop/tests/budget.test.mjs`,
  `loop/tests/expiring-proposal-precedence.test.mjs` and
  `loop/tests/runner-health.test.mjs` call `selectJob`; run them after
  changing `select.mjs`.
- Escalation never fires on a refusal of another kind, and never past the
  first step — no instrument exists for this today (the architect found none
  at the authority commit); task 24's arms (b) and (d) become the first, so
  say so in your report rather than citing an existing test.

## Mutations (perform, observe red, restore; table in RESULT1.md)

The review takes the diff from the merge base as the list of changed
behavioural lines and expects at least one mutation per changed function,
each with its red run and its restored green run recorded. A changed line
with no arm is a finding. The named mutations are required; add one per
changed function beyond them.

- Task 24's named mutation: key the escalation on `sel.selected === null`
  (escalate only when every candidate is refused); arm (c) goes red while (a)
  and (b) stay green. Restore.
- Task 24(vi): drop the adoption condition (adopt any non-null escalated
  selection); arm (d) goes red. Restore.
- `escalationTarget` returns `null` unconditionally; arms (a) and (c) go red.
  Restore.
- `loadRunners` accepts an `escalates_to` naming the entry itself; the
  registry arm goes red. Restore.
- The `run.mjs` call site never re-runs the selection; the `runLoop` dry-run
  arm goes red while the pure-helper arms stay green — which is why that arm
  exists. Restore.

For each row: the mutation in one line, the file and line, the command, the
red output's last lines verbatim (the `# pass`/`# fail` counts), the restored
output's counts.

## How to work

1. Read `loop/lib/select.mjs` whole, `loop/lib/runners.mjs:16-114`,
   `loop/run.mjs` (`runLoop` from line 901: `pickRunner` at `:910`, the
   resume branch, the `selectJob` call near `:1223`, the dry-run return near
   `:1303`, and every later read of `runner` — `:264`, `:287`, `:305`,
   `:757`, `:1439-1441`; line numbers at the authority commit),
   `loop/lib/budget.mjs:553-577` (`applyUpkeepFloor`),
   `loop/tests/selector-rules.test.mjs` whole, `loop/tests/budget.test.mjs:477-498`,
   and `loop/tests/helpers.mjs` (`makeRepo`, `runnersYaml`, `writeQueue`,
   `ledgerLine`).
2. Implement task 23's registry half, then `selectJob`'s `topRanked`, then
   `escalationTarget`, then the `run.mjs` call site, then task 24, running
   the targeted tests as many iterations as you need:
   `node --test loop/tests/runner-policy.test.mjs loop/tests/selector-rules.test.mjs loop/tests/budget.test.mjs loop/tests/expiring-proposal-precedence.test.mjs loop/tests/runner-health.test.mjs`
   from the worktree root by absolute path.
3. Run the enforcement for every property in "## Properties".
4. Perform the mutations and fill the table.
5. Commit ONLY the files named above (`git add` each by path; never
   `git add -A`). Do not add `RESULT1.md` or `.agent-brief.md`.
6. LAST, on the committed tip, ONE final iteration of the full suite:
   `npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-D test`
   with a timeout of at least 600 seconds. A completed suite is required for
   merge; if the harness cut it off at a cap, that iteration was not an
   attempt that counts — run it again. Record its `# pass` / `# fail` counts
   and wall time.
7. Write `RESULT1.md`.

## How to end (required)

Write `D:/addictedtoai-worktrees/fleet6-stage0-D/RESULT1.md` — this exact
name, numbered, never the bare un-numbered name — with these sections, in
this order:

1. **Commits** — each sha and its one-line message; the output of
   `git -C D:/addictedtoai-worktrees/fleet6-stage0-D log --oneline main..HEAD`.
2. **What changed, per file** — for each file, what it now does that it did
   not; for `select.mjs` the exact shape of `topRanked` and
   `escalationTarget`'s return; for `run.mjs` the adoption condition as
   written and the two log lines; for `runners.mjs` the exact load-time
   errors.
3. **Tests run** — every command and the last lines of its output verbatim
   (`# pass N`, `# fail N`); the targeted tests, every property's enforcement,
   and the final full-suite iteration with its wall time.
4. **Mutation table** — one row per mutation as described above.
5. **The registry half** — the exact `escalates_to:` line the orchestrator
   must add to `runners.yml`, and what the loop does until it does (escalates
   nothing), so the handover can be checked against your code.
6. **Blocked or refused calls** — each one, verbatim, or "none".
7. **Findings not fixed** — anything you saw that this brief's files could not
   fix, with file and line and numbers; or "none". Nothing is deferred silently.
