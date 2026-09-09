# BRIEF REVIEW — arch-d-brief-r1.md — VERDICT: DISPATCH

## Findings

1. **Low, non-blocking — fixture gap in task 24's runLoop arm.** The brief's quoted task 24(iv) arm (c) is `runLoop(ctx, { runner: '<cheap id>', dryRun: true })`, and the fixture description (ii) names only "a cheap entry with `job_types` and `escalates_to` naming an unrestricted frontier entry". `run.mjs:911` unconditionally resolves a reviewer: `pickRunner(registry, { id: opts.reviewer, role: 'reviewer' })` throws `no registered runner is cleared for role "reviewer"` when no registry entry carries the reviewer role, so the arm's own `runners.yml` must include a reviewer-cleared entry (or the runLoop call a reviewer id) or the arm is red for a fixture reason. A worker following (ii) literally (two author-only entries) hits a thrown error on the first run and self-corrects; nothing in the library code is affected. EVIDENCE: `git -C D:/AddictedtoAI show da1ace0:loop/run.mjs` lines 910-911. Smallest change: one clause in task 24 resolution (ii) or the brief's arm text — "the fixture registry also names a reviewer-cleared entry, since `runLoop` resolves a reviewer before selecting".

2. **Low, non-blocking — internal tension in task 24(iv): pure-helper arms cannot observe two of arm (d)'s outcomes.** (iv) says each arm observes the pure helper's return and "at least (c)" runs runLoop, but arm (d) requires "the log names both refusals", and arms (a)/(b) require "the returned runner is the frontier entry" / "the runner is unchanged" — phrases only `runLoop`'s return or `ctx.output()` can evidence. Two readings: (a),(b),(d) also run `runLoop` dry-run (the "at least (c)" allows it), or those phrases are simulated from `selectJob`+`escalationTarget` returns. Both readings converge on the same code under test, so no wrong thing gets built; the mutation-table row "pure-helper arms stay green" only holds under the second reading. EVIDENCE: quoted 24(iii)/(iv) text at tasks.md 1082-1086 and 1068-1082. Smallest change: one clause — "(a), (b) and (d) may also run the dry-run call; only (c)'s assertion set is what the call-site mutation must turn red."

3. **Low, non-blocking — `topRanked`'s shape on the early-return refusals is unspecified.** The quoted (iii) fixes `topRanked` = `{candidate, rule}` "(`null` when the top-ranked candidate was eligible)" but the conformance/health/lane-paused returns in `select.mjs:154-195` have no candidate list at all (`refusals: [{candidate: null, ...}]`). A worker may read "null" or "refusal of the empty candidate" either way; the escalation behavior is identical because `escalationTarget` fires only on rule `runner:job-type`, which none of those carries (and (vi) says a `blocked` escalation entry stands). EVIDENCE: `select.mjs:154-195`. Smallest change: one clause in (iii) — "and `null` on the conformance/health/lane returns, which have no candidates".

No finding reaches the REVISE bar: nothing here makes the worker build the wrong library behaviour or turn a file red that the brief forbids it to touch.

## Checked and sound

1. VERBATIM QUOTES — `git -C D:/AddictedtoAI show da1ace0:.../tasks.md` lines 983-1096; both tasks and both bold "Resolved before D's freeze" paragraphs present word-for-word; no dropped paragraph.
2. CLOSURE — `git grep` at da1ace0 for `topRanked|escalationTarget|escalates_to`: zero hits in `loop|pulse|scripts|lib|app|tools` (additive names, nothing pinned). `selectJob`'s result is never deepEqual'd whole: deepest pins are `budget.test.mjs:558-562` (refusals rules map, list unchanged), `:613`, `selector-rules.test.mjs:280` (`sel.warnings`), `:391` (registry `job_types`). `portability.test.mjs` scans only skipTests roots; `budget.test.mjs:569-598` source-regex forbids `.frontier` reads only in `select.mjs`/`budget.mjs` — the new `topRanked`/`escalationTarget` code needs none. All four selector-test files import and call `selectJob`. Files list is the closure.
3. QUANTIFIERS — spec.md:1235-1247 escalation bullets all resolved by quoted (i)-(viii)/(i)-(vi); the phases that read `runner` enumerated (:264, :287, :305, :757, :1439-1441) and verified.
4. LINE NUMBERS — every cited line verified at da1ace0; `git diff --stat 9c1d980 da1ace0` over all cited files is empty, so the "from the code at `9c1d980`" enumeration holds at the authority commit: `select.mjs:88-103/199-207/200`, `runners.mjs:16/63-76`, `budget.mjs:553-577`, `run.mjs:910/1160-1221/1223/1303/264/287/305/757/1439-1441`, `selector-rules.test.mjs:374-387/415-448` (real registry via `loadRunners` at :426), `budget.test.mjs:477-498` (C42), `helpers.mjs:69-98` (runnersYaml, no clearance).
5. CONTRADICTIONS — none. "roles include `author`" (23iv) and "not cleared for `author`" (24v) are the same roles-list property (ROLES = author/reviewer); prose, quote and code agree everywhere checked.
6. INSTRUMENTS — property 1 enforced by `loop/tests/portability.test.mjs` (:109 model/provider/harness scan of loop+pulse+scripts+lib+app+tools+config; :146 runner-id scan of pulse/scripts; reads the REAL registry); property 2 by `scripts/no-change-dir-refs.test.mjs:73`; closure by `selector-rules.test.mjs:415-448`; refusal-regression instruments `budget.test.mjs`, `expiring-proposal-precedence.test.mjs`, `runner-health.test.mjs` all call `selectJob` (grep-verified). No escalation instrument exists anywhere — zero `escalat*` hits in loop/pulse/scripts/lib/app/tools at da1ace0 — so the brief's claim that arms (b) and (d) become the first is true.
7. MUTATIONS — all five are realisable at the named site and go red under a correct implementation, checked against the real code paths: `sel.selected === null` keying turns (c) red while (a) passes (scout alone, nothing below) and (b) stays green (`escalationTarget` still null on a budget rule); dropping the adoption condition turns (d) red (the frontier re-run selects `repair` — budget is spent only on `new_writing` — and would be adopted onto the frontier entry); `escalationTarget`→null turns (a)/(c) red; self-referencing `escalates_to` acceptance turns the (v) registry arm red; a dead call site turns only the runLoop arm red.
8. AMBIGUITY — three minor items, listed as findings 1-3 above; none can change what gets built.
9. REPORT CONTRACT — numbered `RESULT1.md` (never bare), seven ordered sections, mutation table, blocked calls, unfixed findings — all present.
10. GROUND RULES — all present: never the token `cd`, absolute paths only, no build/verify/push, no edits outside the Files list, blocked calls reported not routed around, exactly one final full-suite iteration (`npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-D test`, ≥600 s) at the committed tip, `RESULT1.md` and `.agent-brief.md` excluded from the commit.

## What I ran

1. `git -C D:/AddictedtoAI rev-parse da1ace0 9c1d980 HEAD`
2. `git -C D:/AddictedtoAI diff --stat 9c1d980 da1ace0 -- loop/lib/select.mjs loop/lib/runners.mjs loop/run.mjs loop/lib/budget.mjs loop/tests/{selector-rules,budget,helpers,expiring-proposal-precedence,runner-health}` variants
3. `git -C D:/AddictedtoAI ls-tree --name-only da1ace0 -- loop/tests/ scripts/ loop/lib/ openspec/changes/two-desks-work-orders-and-trains/`
4. `git -C D:/AddictedtoAI grep -n -e loadRunners -e selectJob -e escalat -e topRanked -e escalates_to da1ace0 -- loop scripts`
5. `git -C D:/AddictedtoAI grep -l -e runners.yml -e mock-scout -e mock-author -e codex -e gpt -e harness -e provider da1ace0 -- loop/tests scripts`
6. `git -C D:/AddictedtoAI show da1ace0:loop/lib/select.mjs` (whole, numbered; 253 lines) and `:loop/lib/runners.mjs` lines 1-130
7. `git -C D:/AddictedtoAI show da1ace0:loop/run.mjs` lines 250-320, 745-770, 895-970, 1140-1330, 1425-1460, 40-140 (all numbered)
8. `git -C D:/AddictedtoAI show da1ace0:loop/lib/budget.mjs` lines 440-590 plus rule-string grep
9. `git -C D:/AddictedtoAI show da1ace0:loop/tests/budget.test.mjs` lines 455-620
10. `git -C D:/AddictedtoAI show da1ace0:loop/tests/helpers.mjs` lines 1-210 plus export map
11. `git -C D:/AddictedtoAI show da1ace0:loop/tests/selector-rules.test.mjs` lines 355-448 and `:loop/tests/portability.test.mjs` lines 1-280 plus test-name map
12. `git -C D:/AddictedtoAI grep -n deepEqual|Object.keys|runLoop( da1ace0 -- loop/tests/*` (targeted files)
13. `git -C D:/AddictedtoAI grep -n noGates|startGate da1ace0 -- loop/run.mjs loop/tests/{conformance,runner-health}.test.mjs`
14. `git -C D:/AddictedtoAI show da1ace0:.../tasks.md` lines 983-1120 and line-map for tasks 23/24 and both "Resolved" paragraphs
15. `git -C D:/AddictedtoAI show da1ace0:.../specs/loop/spec.md` lines 1193-1275 and escalation line-map
16. `git -C D:/AddictedtoAI grep -c -e escalat -e topRanked -e escalates_to da1ace0 -- loop pulse scripts lib app tools data openspec/...`

## Out of scope, not pursued

- Assertion bodies of `expiring-proposal-precedence.test.mjs` / `runner-health.test.mjs` not read in full (only their `selectJob` imports/calls verified; their registries declare no `escalates_to`, so behaviour is unchanged under the diff).
- `pulse/`, `app/`, `tools/`, `lib/` internals beyond the token sweep — no file there is touched by the Files list.
- The design of the escalation itself (the quoted standard is given, not under review).
