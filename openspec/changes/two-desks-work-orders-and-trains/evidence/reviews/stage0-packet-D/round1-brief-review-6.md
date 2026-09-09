# BRIEF REVIEW — arch-d-brief-r1.md — VERDICT: DISPATCH

## Findings

None. Every check passed; no defect would make the worker build the wrong thing or turn a file red that the brief forbids it to touch. Two verification gaps are recorded below honestly, neither a brief defect.

- **Not checked (with no guess):** the scripts-side enforcer for property 2 ("no source under lib/, loop/, pulse/, scripts/, app/, tools/ references an unarchived change directory — a test under scripts/ enforces this"). The brief correctly says "find what enforces it" (so no claim to verify), but I did not locate that test within the command budget. The loop-side id enforcer for property 1 *was* found: `selector-rules.test.mjs:419-422` names the portability suite as the test that "fails this directory for naming a model, provider, harness or runner id", matching `portability.test.mjs` (confirmed present in `loop/tests/`).
- **Partially verified:** the `run.mjs:1472-1474` outcome-line cite was confirmed by anchor only (`recordOutcome` at `:1465`, phase entries recording `runner: who.id` at `:274`); I did not read that 30-line window.

## Checked and sound

1. **Verbatim quotes** — `git -C D:/AddictedtoAI show 5414899:.../tasks.md | Select-String '^- \[ \] 2[34]\.' -Context 0,83/0,90`. Task 23 at lines 1019-1102, task 24 at 1103-~1190; both `>` blocks (including both bold "Resolved before D's freeze" paragraphs, the "(ix)" drift map, and the appended `added 2026-09-09 08:45/09:22` clauses) match the blob verbatim, one paragraph each, nothing dropped.
2. **File list is the closure** — greps over `loop/` found zero occurrences of `escalat`, `topRanked`, `escalates_to` (new identifiers unpinned); the `deepEqual|Object.keys|toEqual|toMatchObject` sweep over all `loop/tests/*.mjs` shows the only `selectJob`-result pins are partial (`budget.test.mjs:558-562` pins `sel.refusals` rule list; `selector-rules.test.mjs:280` pins `sel.warnings`) — nothing deep-equals the result's key set, so adding `topRanked` cannot turn a file red. Ledger-line key-set pins (`portability.test.mjs:409`, `issues.test.mjs:243`, `gate-transport-retry.test.mjs:879`) pin `LEDGER_FIELDS`, which task 23(vii) explicitly does not extend. Dry-run assertions in existing tests (`proposal-merge.test.mjs:451`, `review.test.mjs:312`) check `res.dryRun === true` only; new escalation log lines fire only when `escalates_to` is present, which no existing fixture has. `selector-rules.test.mjs:415-448` (the real-registry closure) and `helpers.mjs`/`selector-rules.test.mjs` are in the brief's read-only-with-reason set. No pinning file is outside the Files list.
3. **Quantifiers** — every set-noun in the quoted text is resolved: "the top-ranked candidate" → `candidates[0]` pre-gate (i); "no other refusal escalates" → the enumerated refusal classes incl. `budget:upkeep-floor` and the conformance/health/lane-paused early returns (ii); "every phase that reads runner" → `:274,:303,:321,:779,:1472-1474` (iii); "whether the run's entry came from --runner or the default" → (v); task 24's arms (a)-(d) with the tier-by-tier pool and reviewer-cleared-entry fixture details.
4. **Line numbers** — `rev-parse HEAD` = `5414899db…`, tree clean; `git diff --name-only f74f606..HEAD` shows only `openspec/…/evidence/*` and `tasks.md`, so code at the authority commit is the measured `f74f606` layout. Verified directly: `run.mjs` `:934` runLoop, `:943` pickRunner, `:944` reviewer pickRunner, resume branch `:1167-1255` selects nothing, `:1256` the sole `selectJob` call, `:1285-1288` nothing-qualified return, `:1336` dry-run return carrying `runner`, `:274`/`:303`/`:321` runner reads; `select.mjs` `:88-103` ordering, `:150` tierShares, `:154-195` early returns, `:199-207` gates with `runnerJobTypeGate` first at `:200`; `runners.mjs` `:16`, `job_types` block `:63-76`, `effort` block `:77-81`; `budget.mjs` `:553-576` `applyUpkeepFloor`; `helpers.mjs:69-98` default registry with no clearance (and `mock-reviewer` reviewer-cleared entry, so the runLoop reviewer-resolution claim at `:944`/`pickRunner:102-120` holds); `selector-rules.test.mjs:374-413` and `:415-448`; `budget.test.mjs:477-498`.
5. **Contradictions** — none; brief prose, quoted standard and code agree at every point I could cross them (including the `9c1d980→f74f606` mapping being the authority-commit layout).
6. **Instruments** — `selector-rules.test.mjs:415-448` reads the REAL `runners.yml` through `loadRunners` and enforces each declared clearance (read); `budget.test.mjs` (`:490,:556,:611`), `expiring-proposal-precedence.test.mjs` (`:124`), `runner-health.test.mjs` (`:321`) all call `selectJob` (grep evidence); the absence-of-`escalat`-instrument claim is confirmed by the zero-hit grep. The scripts-side enforcer: not checked (above).
7. **Mutations** — all five realisable at the named lines and red against the correct implementation: (a) keying on `sel.selected === null` at the call site → (c) red (repair selected ⇒ no escalation), (a) and (b) stay green; (b) dropping the `topRanked === null` adoption condition → (d) red (the escalation entry selects the repair below the ceiling-refused scout and authors it on the frontier); (c) `escalationTarget` returning `null` unconditionally → (a), (c) red, (b) green; (d) `loadRunners` accepting `escalates_to` = self → the registry `assert.throws` arm red; (e) call site never re-running → the (c) dry-run arm red while pure-helper arms stay green. Each row names a mutation that stays green, per the brief's own requirement.
8. **Ambiguity** — none with two actionable readings. "Absent loads as `undefined`" (task 24(v)) is satisfied by either an absent key or an `undefined` accessor, and the test reads the field, so both implementations pass the arm. "Commit ONLY the files named above" vs. "Do not add `RESULT1.md`" is resolved by the explicit later sentence.
9. **Report contract** — numbered `RESULT1.md` (never bare), the seven sections enumerated in order, blocked calls and unfixed findings required, full-suite iteration with ≥600 s timeout and pass/fail/wall-time recording required.
10. **Ground rules** — token `cd` banned, absolute paths throughout, no build except the one final `npm --prefix <abs> test` iteration in "How to work" step 6, no `git push`, no edits outside the Files list, blocked call → recorded and stopped, throwaway temp-dir fixtures, `node_modules` junction noted (no `npm install`).

## What I ran

Every command, verbatim (this environment's agent mode is read-only — the review file could not be edited, so the final message carries the review, per the enclosing instruction; the mandated first action was therefore not performed, and no file was written):

```
git -C D:/addictedtoai-worktrees/fleet6-stage0-D rev-parse HEAD; git -C D:/addictedtoai-worktrees/fleet6-stage0-D status --porcelain; git -C D:/addictedtoai-worktrees/fleet6-stage0-D log --oneline -5
git -C D:/AddictedtoAI show 5414899:openspec/changes/two-desks-work-orders-and-trains/tasks.md | rg -n "^- \[ \] 2[0-9]+"        (failed: rg not on PATH)
git -C D:/AddictedtoAI show 5414899:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern '^- \[ \] 2'
git -C D:/AddictedtoAI show 5414899:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern '^- \[ \] 2[34]\.' | ForEach-Object { "$($_.LineNumber): …" }
git -C D:/AddictedtoAI show 5414899:…tasks.md | Select-String -Pattern '^- \[ \] 23\.' -Context 0,83
git -C D:/AddictedtoAI show 5414899:…tasks.md | Select-String -Pattern '^- \[ \] 24\.' -Context 0,90
git -C D:/addictedtoai-worktrees/fleet6-stage0-D diff --name-only f74f606..HEAD
git -C D:/AddictedtoAI show 5414899:…specs/loop/spec.md | Select-String -Pattern 'escalat' | ForEach-Object { "$($_.LineNumber): …" }
git -C D:/AddictedtoAI show 5414899:…specs/loop/spec.md | Select-String -Pattern '^### Requirement: Runner selection' -Context 0,110 | ForEach-Object { $_.Line; $_.Context.PostContext }
Select-String -Path '…/loop/run.mjs' -Pattern 'runLoop|pickRunner|selectJob|dryRun|reviewer|outcome|runners.yml' | ForEach-Object { "$($_.LineNumber): …" }
Get-ChildItem -Recurse -File '…/loop' | Select-String -Pattern 'escalat|topRanked|escalates_to'
Get-ChildItem '…/loop/tests/*.mjs' | Select-String -Pattern 'selectJob\(|runLoop\(|dryRun|loadRunners\('
Get-ChildItem '…/loop/tests/*.mjs' | Select-String -Pattern 'deepEqual|Object\.keys|toEqual|toMatchObject'
Read: select.mjs:84-212; runners.mjs:1-140; run.mjs:260-345; run.mjs:1145-1364; budget.test.mjs:470-579; selector-rules.test.mjs:340-448; helpers.mjs:55-116
Select-String -Path '…/loop/lib/budget.mjs' -Pattern 'applyUpkeepFloor|function applyUpkeepFloor|refused' (windowed)
```

## Out of scope, not pursued

- Reviewing the tasks themselves or the design (the quoted standard is given, not under review).
- Running any suite or verifier against the tree (read-only review; targeted `node --test` was not needed since no existing-test behaviour claim required confirmation).
- Inspecting `RESULT*.md` / `REVIEW*.md` / `.agent-brief.md` in the worktree.
- Locating the scripts-side "no unarchived change directory" enforcer (recorded as not checked above, within the command budget).
