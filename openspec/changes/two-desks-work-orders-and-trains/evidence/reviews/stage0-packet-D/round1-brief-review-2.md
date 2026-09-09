I've completed all checks within budget (15 read-only commands). The review file at `C:/Users/BadBitch/.local/share/opencode/plans/brief-review-arch-d-brief-r1.md` could not be written: this harness is running in plan mode (read-only) and its plan-mode reminder explicitly overrides the review instructions' edit step, so no "in progress" markers or final form could be written there — it remains `PENDING`. The review is delivered here in the required shape. All evidence was gathered at `D:/AddictedtoAI`, HEAD == `2940298` (the authority commit), and `9c1d980` was confirmed an ancestor with an empty `diff --stat ... -- loop`, so every "code at 9c1d980" citation holds at the authority commit.

# BRIEF REVIEW — arch-d-brief-r1.md — VERDICT: DISPATCH

## Findings

1. **Arm (b)'s budget-pool condition for the named mutation is not stated (check 7/8).** The brief's task-24 arm (b) says "the fixture ledger spends *that tier's* `new_writing` past its ceiling" — one tier. Budget pools are scoped per runner tier: `selectJob` computes `shares = tierShares(cfg, ledger, runner.tier, now)` (`select.mjs:150`) and `budgetGate(cfg, shares, c.type)` is the ceiling gate (`select.mjs:202`); the helper fixture's entries sit on *different* tiers (`mock-frontier` tier `frontier`, `mock-cheap` tier `cheap`, `helpers.mjs:75-86`). If the run entry (cheap) and its `escalates_to` target (frontier) have different tiers, then under the named mutation ("escalate when `sel.selected === null`") the rerun on the escalation entry finds that tier's `new_writing` ceiling unspent, ADOPTS the top-ranked candidate, and arm (b)'s "nothing is escalated, nothing is selected" goes red — contradicting the quoted task-24 requirement that "the other two still pass." The brief never says the escalation target's pool must also be busted (or the tiers shared). Evidence: `tierShares`/`budgetGate` lines above; task-24 text "escalate only when every candidate is refused, and confirm the scout case fails while the other two still pass." A worker can keep (b) green only by asserting (b) purely at the helper level (which resolution (iv) permits but does not make mandatory: "(b) … may also run the dry-run call") or by busting the target's pool too — neither is stated. Smallest fix: one sentence in (b) — "assert (b) only on the pure helpers, or also spend the escalation entry's tier past its ceiling, so the escalated rerun refuses and the mutation cannot adopt in (b)."

2. **The named mutation's site is not named (check 7/8).** The mutation row says "key the escalation on `sel.selected === null`" without saying where. Keyed inside `escalationTarget` (whose condition the resolution at (iii) defines as the `runner:job-type` rule), arm (b) goes red (budget refusal, nothing selected → helper would return the declared entry) and arm (d) semantics shift; only keyed at the `run.mjs:1223`-area call site does "(c) goes red while (a) and (b) stay green" hold. Resolution (iv)'s clause "only (c)'s assertion set is what the call-site mutation must turn red" pins the site contextually, but the mutation table row — which is what the worker performs — does not. Smallest fix: one word in the mutation row: "key the escalation at the `run.mjs` call site on `sel.selected === null`."

3. **Informational, not a D defect (check 5):** the real `runners.yml:220-232` currently *documents* the caller-side routing design ("Routing is therefore the caller's job: the chain re-runs … was `runner:job-type`. It deliberately does not escalate past a…"). When D moves escalation into `loop/` and the handover retires `desk-chain3.sh`, that comment block becomes false until the orchestrator rewrites it alongside the `escalates_to:` line. `runners.yml` is a reserved file outside the Files list, so the codex worker must not touch it — record the stale-comment rewrite in the handover, and optionally say so in the brief's registry-half section. No build impact: no `escalates_to:` field exists in the shipped registry today (verified), so D's code escalates nothing until the orchestrator line lands, exactly as the brief says.

## Checked and sound

1. **Verbatim quotes:** `tasks.md` at `2940298` contains both task headings and both bold "Resolved before D's freeze" paragraphs between the task-23 and task-25 markers (marker scan). Character-level comparison was pre-verified by the linter per instructions; read once, no dropped paragraph seen.
2. **Closure / exact pins:** no test pins the full `selectJob` result key set — the only whole-object-style pins near it are `sel.refusals` *list/rule* pins (`budget.test.mjs:558-562` — three identical ceiling rules; `runner-health.test.mjs:323` — `refusals[0].rule`), which the additive `topRanked` key cannot disturb; `selector-rules.test.mjs:391` pins `job_types` on the entry, not the entry shape; `exit-code`/`breakers` tests read individual `runLoop` fields. No `topRanked`/`escalationTarget` identifier exists anywhere in `loop/` today. `selector-rules.test.mjs:415-448` loads the REAL `runners.yml` through `loadRunners` (verified) and is unaffected because no shipped entry carries `escalates_to` and no existing fixture declares one — so no existing runLoop behaviour can change. `helpers.mjs` and `selector-rules.test.mjs` are read-only-with-reasons in the Files list; nothing else that the change can turn red is outside it. (Commands: full-file `deepEqual|deepStrictEqual|Object.keys` greps; `selectJob(` caller grep; repo-wide `escalat`/`topRanked` greps; real `runners.yml` field scan.)
3. **Quantifiers:** every "the" over a set is resolved by (i)–(viii): top-ranked = `candidates[0]` of the sorted `gatherCandidates` list before any gate; the refusal set = the gate list plus floor; all `runner` readers enumerated at `:264/:287/:305/:757/:1439-1441/:1303`; entry-source and resume cases covered in (v).
4. **Line numbers:** spot-verified at HEAD = authority = `2940298`, all correct: `run.mjs:910` `pickRunner`, `:911` reviewer, resume block `:1160-1221` (resume log `:1211`, no selection), sole `selectJob` call `:1223`, dry-run return `:1303` incl. `runner`; `select.mjs:88-103` (directives→pre-empting→queue→ripe + sort), gates `:199-207` with clearance first at `:200`, early returns `:154-195`, `gatherCandidates` at `:197`; `budget.mjs:553` `applyUpkeepFloor` with rule `budget:upkeep-floor`; `helpers.mjs:69` `runnersYaml` (no clearances), `:107` `makeRepo`, `:127` runners override, `:170`/`:199`; `budget.test.mjs:477-498` = the C42 fixture pattern; `runnerJobTypeGate` rule string `runner:job-type` confirmed.
5. **Contradictions:** none found between prose, quoted standard and code; the arm/mutation/assertion design is internally coherent (adoption requires rerun `topRanked === null && selected !== null`, so (d) reddens under the adoption-drop mutation via the rerun selecting the second-ranked `repair` on the frontier, and the call-site mutation reddens only (c)'s dry-run assertions).
6. **Instruments:** `budget.test.mjs`, `expiring-proposal-precedence.test.mjs`, `runner-health.test.mjs`, `selector-rules.test.mjs` all call `selectJob` (verified per-file); the real-registry closure test exists at `selector-rules.test.mjs:415+`; the two "find what enforces it" properties use the brief's sanctioned form.
7. **Mutations:** all five are realisable and would go red as claimed at the described sites — the named mutation at the call site reddens (c) while (a) passes (nothing below the scout, escalation fires under both keys) and (b) passes only under finding 1's proviso; `escalationTarget` unconditional-null reddens (a)+(c) pure-helper arms; self-referential `escalates_to` reddens the registry arm; call-site-never-reruns reddens (c)'s `runLoop` arm with pure arms green; adoption-drop reddens (d).
8. **Ambiguity:** the two findings above; otherwise none a careful worker could act on two ways.
9. **Report contract:** numbered `RESULT1.md`, five ordered sections, blocked-call and unfixed-findings obligations all present.
10. **Ground rules:** `cd` ban, absolute paths, `.job/` scripting, no build/push/`bd close`, no edits outside the Files list, blocked-call-reporting, and the one sanctioned final full-suite iteration in "How to work" item 6 — all present.

## What I ran

```
git -C D:/AddictedtoAI rev-parse --short HEAD 2940298 9c1d980     → 2940298, 2940298, 9c1d980
git -C D:/AddictedtoAI ls-tree -r --name-only 2940298 openspec/changes/two-desks-work-orders-and-trains
git -C D:/AddictedtoAI ls-tree -r --name-only 2940298 loop/tests        → no runner-policy.test.mjs
git -C D:/AddictedtoAI show 2940298:…/tasks.md | Select-String -Pattern '\[ \] 2[345]\.|Resolved before D|declared policy'
git -C D:/AddictedtoAI merge-base 9c1d980 2940298                      → 9c1d980 (ancestor); diff --stat 9c1d980 2940298 -- loop → empty
git -C D:/AddictedtoAI show 2940298:loop/lib/select.mjs | Select-Object -Skip 80 -First 131 / -Skip 210 -First 115
git -C D:/AddictedtoAI show 2940298:loop/lib/runners.mjs | Select-Object -Skip 15 -First 101
git -C D:/AddictedtoAI grep -n -E '…' 2940298 -- loop/lib/select.mjs loop/lib/budget.mjs   (gates/floor/ceiling line audit)
git -C D:/AddictedtoAI grep -n -E '…runner…' 2940298 -- loop/run.mjs  (selectJob/pickRunner/reviewer/resume audit)
git -C D:/AddictedtoAI show 2940298:loop/run.mjs | Select-Object -Skip 1149 -First 190 / -Skip 254 -First 16 / -Skip 1429 -First 25
git -C D:/AddictedtoAI show 2940298:loop/lib/budget.mjs | Select-Object -Skip 539 -First 55
git -C D:/AddictedtoAI show 2940298:loop/tests/budget.test.mjs | Select-Object -Skip 469 -First 45 / -Skip 548 -First 22
git -C D:/AddictedtoAI grep -n -E 'makeRepo|runnersYaml|writeQueue|…' 2940298 -- loop/tests/helpers.mjs; show helpers.mjs -Skip 59 -First 80
git -C D:/AddictedtoAI show 2940298:loop/tests/selector-rules.test.mjs | Select-Object -Skip 354 -First 96
git -C D:/AddictedtoAI grep -n -E 'deepEqual|deepStrictEqual|Object.keys' 2940298 -- loop/tests/{budget,expiring-proposal-precedence,runner-health,selector-rules,job-budget,job-gate-set}.test.mjs
git -C D:/AddictedtoAI grep -n -i 'escalat' 2940298 -- loop scripts tools app pulse runners.yml data
git -C D:/AddictedtoAI grep -n -E 'selectJob\(|runLoop\(|dryRun' 2940298 -- loop/tests
git -C D:/AddictedtoAI grep -n 'selectJob(' 2940298 -- loop/tests; grep -i 'topRanked|escalationTarget' 2940298 -- loop lib scripts tools app pulse
git -C D:/AddictedtoAI grep -n -A9 'selectJob(' 2940298 -- loop/tests/runner-health.test.mjs loop/tests/expiring-proposal-precedence.test.mjs
git -C D:/AddictedtoAI show 2940298:…/specs/loop/spec.md | Select-String 'declared policy|escalat'
git -C D:/AddictedtoAI show 2940298:runners.yml | Select-String '^default:|id:|tier:|roles:|job_types:|escalates_to:'   → no escalates_to field
```
(15 bash calls, all read-only.)

## Out of scope, not pursued

- The pre-existing `…/evidence/reviews/stage0-packet-D/round1-brief-review-1.md` was not opened (worktree review file, no instruction to read).
- The orchestrator's `desk-chain3.sh` scratchpad is not in this repository; its `:94-132` claim was not verifiable here and is not needed for dispatch.
- Full test execution, fixtures' final tier naming, and the portability/unarchived-directory enforcement test names were not run or located (read-only review; the brief's "find what enforces it" form is sanctioned).
