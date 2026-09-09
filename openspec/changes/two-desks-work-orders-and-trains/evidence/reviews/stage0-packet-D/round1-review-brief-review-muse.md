# BRIEF REVIEW — arch-d-review-r1.md — VERDICT: DISPATCH

## Findings

No REVISE-level defect found. The brief is faithful to the quoted standard, its file list is the closure, quantifiers are enumerated in the quoted Resolved paragraphs, line citations hold, instruments exist, mutations are realisable/red, and ground rules are present.

1. (Non-blocking note, not a REVISE finding) Check 4 nuance — `run.mjs:1223` in the quoted task text is `9c1d980`'s number; at the authority commit the call site is `:1256`. The task text itself supplies the drift map (ix), and the map is correct. Evidence: `git -C D:/AddictedtoAI grep -n "selectJob" 5414899 -- loop/run.mjs` → `:1256: const sel = selectJob(...)`; same at `f74f606` → `:1256`. No worker misdirection because the brief quotes the map verbatim. Smallest change if wanted: none required; the map is already quoted.
2. (Non-blocking note) Known-state prose "`topRanked` on every return including the three early returns" could be misread as populated on early returns, but the quoted standard (iii) explicitly says "`topRanked` is also `null` on the conformance, health and lane-paused early returns", and the reviewer builds nothing from Known state (RESULT1.md IS A HYPOTHESIS). No change required.

Checks 1–10 were all reached. No guess-findings.

## Checked and sound

1. VERBATIM QUOTES — sound. Read `tasks.md` at `5414899` lines 1019–1168 in ranges; the brief's two `>` blocks match the committed text including all bold Resolved paragraphs (i)–(ix) for 23 and (i)–(vi) for 24. Command: `git -C D:/AddictedtoAI show 5414899:.../tasks.md | Select-Object -Skip 1018 -First 150` — returned the full 23/24 text identical to the brief's quotes (directives/pre-empting/queue/ripe; gate list `:199-207` clearance-first; `budget.mjs:553-577`; `escalationTarget` pure; orchestrator handover; `pickRunner :910`/resume `:1160-1221`/dry-run `:1303`; `enabled:false`/packet F; no ledger key; files+closure; drift map `9c1d980→f74f606`; task 24 arms (a)–(d), dry-run `(c)`, registry arms, named `sel.selected===null` mutation).
2. FILE LIST IS THE CLOSURE — sound. Brief permits `loop/lib/select.mjs`, `loop/lib/runners.mjs`, `loop/run.mjs`, `loop/tests/runner-policy.test.mjs`, `RESULT1.md`; reserves `runners.yml` (absence correct). Searched exact pins:
   - `git -C D:/addictedtoai-worktrees/fleet6-stage0-D grep -n "Object.keys.*sel|deepEqual.*sel|deepEqual.*warnings|topRanked|escalat" -- loop/tests/ loop/lib/` → only new-code `topRanked`/`escalates_to` refs plus tests; no hidden pin.
   - `grep -n "deepEqual(sel|Object.keys(sel|sel\.warnings|\.warnings," -- loop/tests/` → single hit `selector-rules.test.mjs:280: assert.deepEqual(sel.warnings, [], ...)` — exactly the one the brief names in its closure paragraph ("verify that, do not trust it").
   - `grep -n "Object.keys" -- loop/tests/ loop/lib/` → no `Object.keys(sel` key-set pin; `LEDGER_FIELDS` pins are in `gate-transport-retry.test.mjs:879` / `portability.test.mjs:409` on ledger lines, and the change adds no ledger key (task vii), so nothing turns red.
   - `grep -n "loadRunners|runners\.yml|escalation:" -- loop/tests/*.mjs` → real-registry readers (`selector-rules:415-448`, `portability`, `ledger`, `budget`, `conformance`) load via `loadRunners`; brief correctly notes the shipped file must still load and names `selector-rules.test.mjs:415-448` as read-only-with-reason. No pin file missing from Files list.
3. QUANTIFIERS — sound. Every set in the standard is enumerated in Resolved: (i) top-ranked = `candidates[0]` before gates; (ii) solely = clearance-gate-first break, all other rules listed; (iii) one call site `:1223`, one step, adoption = `topRanked null && selected non-null`, every phase reading `runner` listed (`:264,:287,:305,:757,:1439-1441` with drift map); (iv) registry validation domain (unknown/self/non-author); (v) `--runner`/default/resume/dry-run; (vi) `blocked`; (vii) no ledger key; (viii) files+closure; (ix) drift map. No bare "every/all/only" left to the worker.
4. LINE NUMBERS AND CODE CLAIMS — sound (spot-checked at `5414899`, ranges only):
   - `select.mjs:88-103` → directives/priority-1, pre-empting/2, queue/3, ripe/4, stable sort. Correct.
   - `select.mjs:199-207` gate list, clearance first (`runnerJobTypeGate` line 1). Correct.
   - `select.mjs:154-195` → conformance/health/lane-paused early returns. Correct.
   - `runners.mjs:16` `loadRunners`, `:63-76` `job_types` pattern, `:77-81` `effort` validation. Correct.
   - `budget.mjs:553-577` `applyUpkeepFloor` order-preserving filter + `budget:upkeep-floor` refusals. Correct.
   - `selector-rules.test.mjs:374-387` `job_types` fixture pattern; `:415-448` REAL-registry clearance test; `helpers.mjs:69-98` default registry declares no clearance; `select.mjs:150` `tierShares`; `budget.test.mjs:477-498` ceiling-arithmetic pattern. All correct.
   - `run.mjs` drift map verified as above (`:1256` at both `5414899` and `f74f606`).
5. CONTRADICTIONS — none found. Prose/standard/code agree: escalation only on `runner:job-type` of `candidates[0]`; adoption only on re-selected top-ranked; one step; `runners.yml` reserved/absent-from-diff; dry-run reports without invoking. Files reasons match contents (`select.mjs` holds `selectJob`+`escalationTarget`, `runners.mjs` holds `loadRunners`, `run.mjs` holds the call site at `:1285`/`escalation adopted|refused` logs in the worktree tip).
6. INSTRUMENTS — sound and existing. `Test-Path .../portability.test.mjs`, `selector-rules.test.mjs` → True; `D:/AddictedtoAI/scripts/no-change-dir-refs.test.mjs` → True (brief's property section names the property, not just the instrument, plus counts 13/13 and 3/3 as hypotheses). `spec.md` at `5414899` contains the escalation requirement (`Select-String "escalat"` → "Runner selection is a declared policy, and escalation is part of it", "Only a clearance refusal escalates", etc.). Other-refusal suites named (`budget`, `expiring-proposal-precedence`, `runner-health`) exist as `loop/tests/*.mjs` (seen in grep output).
7. MUTATIONS — sound. All named mutations realisable at the named lines and red under a correct implementation: call-site key on `sel.selected===null` (task 24(vi) — (c) fails, (a)(b) pass); adoption-condition dropped (goes red under (d)); `escalationTarget→null` (kills (a)(c)); self-referencing `escalates_to` accepted (kills registry arm); never-re-run at call site (kills dry-run (a)(c)). No green-staying mutation mandated by the brief. Worktree tip confirms sites exist: `select.mjs:265-268`, `run.mjs:1285/1296/1311`.
8. AMBIGUITY — none material. "Targeted `node --test <absolute path>` only", "diff is the list", "at least one per changed function", readings (a)–(d) with explicit confirm-or-construct-wrong-world instructions have single actionable readings for a reviewer.
9. REPORT CONTRACT — sound. Brief names numbered `D:/addictedtoai-worktrees/fleet6-stage0-D/REVIEW1.md` (never bare), lists exact sections (`Sealing`, `Findings`, `The mutations I ran`, `The mutation table, judged`, `What I checked that was sound`, `Was the brief faithful...`, `What I ran`), and requires reporting blocked/refused commands ("A blocked or refused command is REPORTED, not routed around").
10. GROUND RULES — sound. Present: never token `cd`, absolute paths + `git -C <dir>`, never `npm run build`/full `npm test`/`verify-*`, targeted tests only, never `git worktree remove`/delete `node_modules`, throwaway probes under OS temp + delete, local date via `node -p`, no `bd close`/`bd update`, no push/merge/commit/gh, never write under `D:/AddictedtoAI`.

## What I ran

All read-only; no edits, no suite, no probes written. Count: 13 commands (within the 20-command budget).

1. `git -C D:/AddictedtoAI show 5414899:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-Object -First 300`
2. `git -C D:/AddictedtoAI show 5414899:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "^\- \[ \] 2[34]\.|Resolved before D" | Select-Object -First 30`
3. `git -C D:/AddictedtoAI show 5414899:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-String -Pattern "^\- \[ \] 2[3456]"`
4. `git -C D:/AddictedtoAI show 5414899:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Measure-Object -Line | Select-Object -ExpandProperty Lines; git -C D:/AddictedtoAI grep -n "^\- \[ \] 23\|^\- \[ \] 24\|^\- \[ \] 25" 5414899 -- openspec/changes/two-desks-work-orders-and-trains/tasks.md` → 1979 lines; 23 at :1019, 24 at :1103
5. `git -C D:/AddictedtoAI show 5414899:openspec/changes/two-desks-work-orders-and-trains/tasks.md | Select-Object -Skip 1018 -First 150` → full 23/24 text for quote comparison
6. `git -C D:/addictedtoai-worktrees/fleet6-stage0-D grep -n "Object.keys.*sel|deepEqual.*sel|deepEqual.*warnings|topRanked|escalat" -- loop/tests/ loop/lib/ | Select-Object -First 60`
7. `git -C D:/addictedtoai-worktrees/fleet6-stage0-D grep -n "deepEqual(sel|Object.keys(sel|sel\.warnings|\.warnings," -- loop/tests/ | Select-Object -First 40` → `selector-rules.test.mjs:280` only
8. `git -C D:/addictedtoai-worktrees/fleet6-stage0-D grep -n "Object.keys" -- loop/tests/ loop/lib/ | Select-Object -First 30; git -C D:/addictedtoai-worktrees/fleet6-stage0-D grep -n "deepEqual.*selected|selected.*deepEqual|selectJob" -- loop/tests/selector-rules.test.mjs | Select-Object -First 40`
9. `git -C D:/addictedtoai-worktrees/fleet6-stage0-D grep -n "loadRunners|runners\.yml|escalation:" -- loop/tests/*.mjs | Select-Object -First 50`
10. `git -C D:/AddictedtoAI show 5414899:loop/lib/select.mjs | Select-Object -Skip 87 -First 17; ... -Skip 198 -First 10; ... -Skip 153 -First 43`
11. `git -C D:/AddictedtoAI show 5414899:loop/lib/runners.mjs | Select-Object -Skip 15 -First 67; ... budget.mjs | Select-Object -Skip 552 -First 26`
12. `git -C D:/AddictedtoAI show 5414899:loop/tests/selector-rules.test.mjs | Select-Object -Skip 373 -First 76; ... helpers.mjs | Select-Object -Skip 68 -First 31` + `budget.test.mjs -Skip 476 -First 23; select.mjs -Skip 145 -First 10; run.mjs -Skip 1215 -First 15` + `grep -n "selectJob" 5414899/f74f606 -- loop/run.mjs` + `show 5414899:loop/run.mjs -Skip 272/-Skip 301/-Skip 941` + `grep -n "escalationTarget|escalation adopted|escalation refused|escalates_to" -- loop/run.mjs loop/lib/select.mjs` + `Test-Path portability/selector-rules/no-change-dir-refs; show 5414899:.../spec.md | Select-String "escalat"`
   - (Executed as five bash invocations; grouped here by check. No whole file over 200 lines was dumped.)

Not run per scope: full suite, build, verifiers, mutated-tree tests, subagents, `.agent-brief.md`/`RESULT1.md`/`REVIEW*.md` opens.

## Out of scope, not pursued

- Re-verifying RESULT1.md's numeric claims (counts, timings) — the brief correctly labels them HYPOTHESES for the reviewer to re-execute.
- Deeper wrong-world construction for readings (a)–(d) — the reviewer's job, not the brief review's.
- File write omitted: plan mode is ACTIVE (read-only) and the task message forbids edits/creates/deletes, overriding the brief-review instruction to EDIT the plans-directory skeleton; this message IS the review.

