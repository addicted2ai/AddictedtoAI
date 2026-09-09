# Packet D — tasks 23 and 24 of `two-desks-work-orders-and-trains` (author brief, round 2: revision, tests only)

authority: two-desks-work-orders-and-trains@5414899

You are a codex worker, alone and unattended, in the git worktree
`D:/addictedtoai-worktrees/fleet6-stage0-D` on branch `stage0/d-escalation`,
whose tip is `8f5e14f` (one commit on top of `5414899`, by the round-1
author: "loop: add declared runner escalation"). `node_modules` is a junction
to the main checkout — do not run `npm install`. This brief is everything you
have: no prior conversation. The round-1 report is at `<worktree>/RESULT1.md`
and the sealed review that judged it at `<worktree>/REVIEW1.md`; read both,
but the standard is the quoted task text below and the findings listed in
"## What this round fixes", not either report.

## Ground rules (non-negotiable)

- Never use the token `cd` anywhere — not in a command, a comment, or a
  script: the approval guard matches the token and refuses the call. Run
  everything by absolute path; git is `git -C D:/addictedtoai-worktrees/fleet6-stage0-D ...`.
- Keep shell commands short; put anything multi-step in a `.mjs` file under
  `D:/addictedtoai-worktrees/fleet6-stage0-D/.job/` and run that.
- Do NOT run `npm run build`, any `scripts/verify-*.mjs` as a whole, the
  Pulse, the Desk, `git push`, or `bd close`. Do not edit `package.json`,
  `runners.yml` (reserved: its `escalates_to` line is the orchestrator's),
  `data/config.json`, `CLAUDE.md`, `AGENTS.md`, anything under `data/`, or any
  file outside the "## Files" list below — that list is ONE test file: this
  round changes no implementation file, and a mutation you perform on one is
  restored before you commit (the reviewer checks the tip's diff).
- Nothing under `lib/`, `loop/`, `scripts/`, `app/` or `tools/` may name a
  model, provider, harness or runner id, or reference an unarchived change
  directory. Both properties have enforcement in this tree — find what enforces each, and run it.
- Tests build throwaway repositories under the OS temp directory and never
  touch this worktree's own `.git`, `data/` or the real `D:/AddictedtoAI`.
- NEVER `git worktree remove` and never delete a `node_modules`; your probes
  use throwaway repositories under the OS temp directory, as the tests do.
- If a tool call is blocked or refused, record it in `RESULT2.md` and stop
  that step; do not route around it.
- All dates are the machine's LOCAL date.

## What this round fixes — the CLASS, then the instances

This round is scoped by CLASS, not by line. Fixing only the lines named here
and leaving another instance of the same class in the same diff is the
failure this repository has measured across two packets; the reviewer will
sweep for it. A red that appears against UNMUTATED code is first DIAGNOSED:
a wrong ARM is fixed and said so in `RESULT2.md`; only a genuine production
defect stops the round, reported in §7 with the evidence — you do not fix an
implementation file in this round.

### The class: a changed behavioural line whose mutation no arm turns red (TEST-COVERAGE)

Both findings are the same class. REVIEW1 took the diff `5414899..8f5e14f`
as the list of changed lines and mutated each; every mutation the round-1
report named went red with the same counts, and four mutations of changed
lines that the report did NOT name stayed green. A changed line whose mutation
stays green is a finding under the Stage 0 rule (the diff is the list), not a
production defect: REVIEW1 restored every mutation and the code behaves
correctly on those paths. This round adds the arms; it changes no
implementation file.

### Finding 1 — the three early returns' `topRanked: null` (select.mjs:158, :176, :190)

`selectJob` returns early, before it gathers any candidate, on a recorded
conformance FAIL (`loop/lib/select.mjs:154-167`), a runner-health refusal
(`:172-185`) and a paused lane (`:187-198`); task 23(iii) requires
`topRanked: null` on each. REVIEW1 changed each `topRanked: null` to
`topRanked: {}` in turn and the suites stayed green (selector rules 17/17,
runner health 23/23, budget 20/20): `loop/tests/runner-policy.test.mjs` has
no arm that reaches any of the three returns — its `fixture()` (`:63-71`)
writes a queue and a ledger only, and `topRanked` is asserted only on the
candidate-bearing selections (`:92-169`) and on hand-built objects passed to
the pure helper (`:239-249`).

Fix, in `loop/tests/runner-policy.test.mjs`: one arm per early return, each
reaching the return THROUGH `selectJob` on the cheap entry (the `selection()`
helper at `:79-84`) with the escalation declared, and asserting with strict
equality (`assert.equal(sel.topRanked, null)` — `assert/strict` makes `{}`
and `undefined` fail it) that `sel.topRanked === null`, that `sel.selected ===
null`, that `sel.blocked` is set, AND that `escalationTarget(registry, runner,
sel)` returns `null` — an early return escalates nothing. The fixtures the
tree already uses for each path:

- conformance: write a record to `ctx.conformancePath` (`makeRepo` sets it;
  `loop/tests/exit-code-refusal.test.mjs:84` writes one) shaped as
  `conformanceGate` reads it (`loop/lib/runners.mjs:150-165`): `{ [cheapId]:
  { date, checks: [{ name, result: 'FAIL' }] } }`; the refusal rule is
  `conformance:recorded-fail`.
- health: `loop/tests/runner-health.test.mjs:310-325` — three ledger lines
  for the runner id with `outcome: 'interrupted', signal: NO_OUTPUT_SIGNAL,
  mm: 0` trip `runnerHealthGate` (`loop/lib/health.mjs:223`); the rule is
  `runner:produced-nothing`. Import `NO_OUTPUT_SIGNAL` from
  `../lib/health.mjs` (`loop/lib/health.mjs:75`), as that test does.
- lane paused: `loop/tests/budget.test.mjs:284-292` — one ledger line
  `ledgerLine({ provider: 'provider-a', outcome: 'capacity', ts:
  hoursAgo(NOW, 0.5) })` pauses `provider-a`, which is the cheap entry's
  provider in `policyRegistry()` (`:45`); the rule is `capacity:lane-paused`.

Put the queue's scout FIRST in each arm, exactly as arm (a) does, so the arm
proves the early return wins over a candidate that would otherwise have
escalated — that is what makes the arm about task 23(iii) rather than about
the gate it borrows.

Mutations for finding 1 (perform, observe red, restore; one row each in the
table): `select.mjs:158` `null` → `{}`; `:176` `null` → `{}`; `:190` `null` →
`{}`. Each must turn its own arm red and only its own arm. Do NOT commit the
mutation; the implementation files are not in this round's Files list.

### Finding 2 — the non-empty-string guard on `escalates_to` (runners.mjs:86-88)

`loadRunners` rejects a present `escalates_to` that is not a non-empty string
(`loop/lib/runners.mjs:86-88`, the message `"escalates_to" must be a non-empty
string when present`). REVIEW1 disabled the guard and the policy and selector
suites stayed green (6/6, 17/17): the registry arm at
`loop/tests/runner-policy.test.mjs:184-237` covers an unknown id, the entry
itself, a reviewer-only target and an absent key, never a malformed value.

Fix, in the same registry test (or a sibling test in the same file): arms for
`escalates_to: ''` (the empty string — write it as `''` in the YAML so it
parses as a string), a whitespace-only value (`'   '`), a non-string (`1`, or
a list `[mock-target]`) and a bare key with no value (`escalates_to:` alone
parses as `null`, which is present and not a string). EACH arm asserts the
EXACT message with `assert.throws(fn, /"escalates_to" must be a non-empty
string when present/)`. The exact message is the whole point: with the guard
disabled, `''` and `'   '` still throw — but as `names unknown runner ""` from
the second loop (`:104-110`) — so an arm that only asserts "it throws" leaves
the guard's mutation green, which is precisely the survivor REVIEW1 found.

Mutation for finding 2: disable the guard (`runners.mjs:86-88`) — every new
arm goes red; restore. One row.

### The SWEEP this class requires

Take the diff `git -C D:/addictedtoai-worktrees/fleet6-stage0-D diff 5414899..8f5e14f -- loop/lib/runners.mjs loop/lib/select.mjs loop/run.mjs`
as the list. For EVERY added or changed line that is code (not a comment or a
blank), name in RESULT2 §2 the arm in `runner-policy.test.mjs` whose mutation
of that line goes red — the six author mutations and REVIEW1's own floor
mutation (`select.mjs:240`, the upkeep-floor identity match) already cover
most of them; for a line no arm covers, either add the arm in this file (the
same way as above: mutate, observe red, restore, table row) or list the line
with the reason no arm can reach it from this file. The sweep's list is a
required section of the report even when it adds nothing. Lines whose
mutation is caught only by a suite OUTSIDE this file (`selector-rules`,
`budget`, `runner-health`, `expiring-proposal-precedence`) are listed with
that file and test name; do not duplicate those arms here.

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

Work only in this file. Every other path is out of scope.

- `loop/tests/runner-policy.test.mjs` — (new) on this branch since round 1 (task 24): the new arms and the sweep
- `RESULT2.md` — (new) your report, in the worktree root; see "## How to end"

`loop/tests/helpers.mjs`, `loop/lib/select.mjs`, `loop/lib/runners.mjs`,
`loop/run.mjs` and every other file are read-only for you (the mutations are
performed, observed and RESTORED, never committed). If a fix needs an edit
outside the one file, describe the need in `RESULT2.md` §7 with the line and
the reason, and stop there.

## Mutations (perform, observe red, restore; table in RESULT2.md)

The reviewer takes the diff from the merge base `5414899` as the list of
changed behavioural lines and re-runs mutations. For every finding: the
mutation named under it goes RED against your new arm and restores GREEN;
record both with `node --test --test-reporter=tap` counts (`# tests`, `# pass`,
`# fail`) and the file's SHA-256 after the restore. The round-1 table's six
rows and REVIEW1's floor row are NOT re-run here; the reviewer re-runs them.

## How to work

1. Read `REVIEW1.md`, then `RESULT1.md`, then `loop/tests/runner-policy.test.mjs`
   and the three implementation files at the lines the findings name.
2. Fix each finding at its CLASS: the arms named, then the SWEEP over the
   diff, listing every changed code line with the arm that covers it.
3. Run the targeted tests as many iterations as you need:
   `node --test loop/tests/runner-policy.test.mjs loop/tests/selector-rules.test.mjs loop/tests/budget.test.mjs loop/tests/expiring-proposal-precedence.test.mjs loop/tests/runner-health.test.mjs`
   from the worktree root by absolute path.
4. Run the enforcement for the naming and change-directory properties: find what enforces each, and run it.
5. Commit ONLY `loop/tests/runner-policy.test.mjs` (`git add` it by path;
   never `git add -A`); do not add `RESULT2.md`, `RESULT1.md`, `REVIEW1.md`
   or `.agent-brief.md`. Before the commit, `git -C D:/addictedtoai-worktrees/fleet6-stage0-D diff 8f5e14f --stat`
   must name that one file and nothing else.
6. LAST, on the committed tip, ONE final iteration of the full suite:
   `npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-D test`
   with a timeout of at least 600 seconds. If the harness cut it off at a cap,
   that iteration does not count as an attempt — run it again. Record its
   counts and wall time; round 1 finished at 1,790 tests, 1,790 pass, and
   this round only adds. A green suite here is the merge precondition.
7. Write `RESULT2.md`.

## How to end (required)

Write `D:/addictedtoai-worktrees/fleet6-stage0-D/RESULT2.md` — this exact
numbered name — with these sections, in this order:

1. **Commits** — `git -C D:/addictedtoai-worktrees/fleet6-stage0-D log --oneline 5414899..HEAD`.
2. **Findings, each with its class and every instance fixed** — one entry per
   finding in "## What this round fixes": the class, the arms added (test
   names and lines), and the SWEEP list (every changed code line of the
   diff with the arm or outside suite that covers it, or the reason none can).
3. **Tests run** — every command and the last lines of its output verbatim,
   including the final full-suite iteration with its wall time.
4. **Mutation table** — one row per mutation named under the findings, with
   red counts, restored counts and the restored file's SHA-256.
5. **The registry half** — unchanged from RESULT1 §5 unless a finding changed
   it; say which.
6. **Blocked or refused calls** — verbatim, or "none".
7. **Findings not fixed** — with file, line and reason; or "none".
