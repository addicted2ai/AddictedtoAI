# BRIEF REVIEW — arch-f-brief-r2.md — VERDICT: DISPATCH

## Findings
1. (Check 7, non-blocking — does not meet REVISE bar) Brief "How to work" step 3 + FINDING 1 mutation: the named pre-fix mutation (`reason: conformance.reason` → generic `conformance failure`, 19/19 green) would STILL stay green after the prescribed correct fix, because the fix pins the count in a new separate field, not in the reason string. EVIDENCE: `git -C D:/addictedtoai-worktrees/fleet6-stage0-F grep -n "selectJob\|topRanked\|conformance.entries" -- loop/tests/runner-policy.test.mjs loop/tests/selector-rules.test.mjs loop/lib/select.mjs` shows no arm pins `refusals[0].reason`/`blocked` string equality — arms check `topRanked`/selection; `loop/lib/select.mjs:172-182` (read) shows refusal carries `reason: conformance.reason` + `blocked: conformance.reason`; FINDING 1's required arms assert "the count on the ALLOWED path, on the UNRECORDED path, and on the refusal path" (count field), so a generic-reason swap preserving the count field leaves all three green. Smallest change to the brief: add one sentence to FINDING 1 — "the post-fix RED mutation is dropping the count field (or returning it as 0/undefined), not the generic-reason swap, which stays green by design once the count is separate; report it as such in the mutation table."
2. (Check 4, non-blocking — stale citations, worker can still find targets) Two line citations have drifted by the round-1 commit: (a) `selectJob` gate cited as `:169` is blank; gate is at `:170` (`const conformance = conformanceGate(...)`), returns at `:172`,`:190`,`:204`,`:261` correct. EVIDENCE: `Read D:/addictedtoai-worktrees/fleet6-stage0-F/loop/lib/select.mjs:100-279` — line 169 blank, 170 gate, 172/190/204/261 returns. (b) change-dir "still live" test cited as `:79` (Finding 2) / `:87` (quoted standard vi(b)) is now at `:111-120` (`test('every allow-list entry has a reason and is still live'...)`). EVIDENCE: `Read D:/addictedtoai-worktrees/fleet6-stage0-F/scripts/no-change-dir-refs.test.mjs` full (120 lines) — `isAllowed` at `:64-66` tests `v.reference` (round-1 narrowing already landed), live-test at `:111`, literal-match test at `:77-83`. Smallest change: update `:169`→`:170` and `:79`→`:111` (keeping the `:87`/`:79` history as "at dc54da0" where the brief means the pre-round-1 tree).

## Checked and sound
- Check 1 VERBATIM QUOTES: spot-read brief's `>` blocks; `git -C D:/AddictedtoAI grep -n "The conformance record appends" ddbfd52... -- tasks.md` → `tasks.md:882` matches task 21 header; full char comparison deferred to linter per instructions — no dropped paragraph seen.
- Check 2 CLOSURE: `grep -n LEDGER_FIELDS -- loop/lib/ledger.mjs loop/tests/portability.test.mjs loop/tests/issues.test.mjs` shows pins at `issues.test.mjs:241-243`, `portability.test.mjs:428,439` — none touched by this round's Files list (ledger/run/runners read-only, select change additive); `grep selectJob` shows no `deepEqual` on whole `selectJob` result in `runner-policy`/`selector-rules`, so added count field cannot turn a forbidden file red; `run.mjs:979-983` verified logging count, `specs.mjs:42-44` bare-prefix shape confirmed.
- Check 3 QUANTIFIERS: domains resolved concretely — five return sites named, four must carry count with `:157` exempted and reason given; six roots listed by name for finding 5; four arms (a)–(d) for finding 2; divergent-histories fixture for finding 3.
- Check 4 (apart from finding 2 above): `select.mjs:146-272`, `:107-112` @returns, `:151` ordering note, `:154-168` disabled return; `runners.mjs:195-247`,`:200-210`,`:212-229`,`:217`; `conformance.test.mjs:116-201`-range,`:228-243` (verified `228: test('an absent check breaks...')`); `portability.test.mjs:30-33` MIN/FIXTURE/SCAN_ROOTS/EXTENSIONS, `:162-165` per-root loop over `RUNNER_SCAN_ROOTS`; `no-change-dir-refs.test.mjs:19` `BAD_REFERENCE` requiring trailing `/` — all hold what the brief says.
- Check 5 CONTRADICTIONS: none — "run.mjs READ-ONLY, already logs at :979-983" consistent with code at `run.mjs:979-990`; "do not restore allow-list entry / do not move gate above :151 / leave archive-parent flagged" consistent with Files list and code.
- Check 6 INSTRUMENTS: all named tests exist and enforce the property — `runner-policy.test.mjs:18` imports `selectJob,escalationTarget`; `conformance.test.mjs:18-23` imports gate+`recordConformance`+`runLoop`, helper at `:32-41` (`includeCheck:false` → `checks:[]` whole-array-empty, confirming finding 4 premise); `portability.test.mjs:180-224` fixture/floor/`skipTests` arms; `no-change-dir-refs.test.mjs:68-109` refusal + span test.
- Check 7 (apart from finding 1 above): findings 3, 4, 5 mutations realisable at named lines and go RED against correct fix — `runners.mjs:204 seen.has`→`seen.size>0`, `:217 find(name===)`→first-available fallback, `portability RUNNER_SCAN_ROOTS` drop `loop`; finding 2 one-char `/?` verified in principle from `:19` text.
- Check 8 AMBIGUITY: no sentence with two actionable readings found; "exactly FIVE return sites", "do not invent one there", "allow-list NOT touched", "no escape hatch on run.mjs" are explicit.
- Check 9 REPORT CONTRACT: names numbered `RESULT2.md` at worktree root uncommitted, first line `done`/`blocked:`, sections 1–7 listed, blocked/refused + unfixed-findings recording required.
- Check 10 GROUND RULES: never token `cd`, absolute paths, short shells via `.job/*.mjs`, no build/no full verify/no Pulse/Desk/no push/no `bd close`, reserved files, no `node loop/conformance.mjs` on real repo, no worktree remove, local-date rule, no-model-names rule — all present.

## What I ran
- `Read C:/Users/BadBitch/.local/share/opencode/plans/brief-review-arch-f-brief-r2-muse.md`
- `Read D:/addictedtoai-worktrees/fleet6-stage0-F/loop/lib/select.mjs offset 100 limit 180`
- `Read D:/addictedtoai-worktrees/fleet6-stage0-F/scripts/no-change-dir-refs.test.mjs`
- `Read D:/addictedtoai-worktrees/fleet6-stage0-F/loop/lib/runners.mjs offset 190 limit 70`
- `Read D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/portability.test.mjs offset 1 limit 180`
- `Read D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/portability.test.mjs offset 180 limit 130`
- `Read D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/conformance.test.mjs offset 100 limit 150`
- `Read D:/addictedtoai-worktrees/fleet6-stage0-F/loop/run.mjs offset 970 limit 30`
- `Read D:/addictedtoai-worktrees/fleet6-stage0-F/loop/lib/specs.mjs offset 30 limit 30`
- `git -C D:/AddictedtoAI show ddbfd52ca16ccf5cff92633d0b571e1a4ce69c91:openspec/changes/two-desks-work-orders-and-trains/tasks.md` (truncated, saved to tool-output)
- `git -C D:/AddictedtoAI grep -n "The conformance record appends" ddbfd52ca16ccf5cff92633d0b571e1a4ce69c91 -- openspec/changes/two-desks-work-orders-and-trains/tasks.md`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-F grep -n "LEDGER_FIELDS" -- loop/lib/ledger.mjs loop/tests/portability.test.mjs loop/tests/issues.test.mjs`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-F grep -n "entries" -- loop/lib/select.mjs loop/run.mjs`
- `Read D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/conformance.test.mjs offset 1 limit 100`
- `git -C D:/addictedtoai-worktrees/fleet6-stage0-F grep -n "selectJob|topRanked|blocked.*reason|conformance.entries" -- loop/tests/runner-policy.test.mjs loop/tests/selector-rules.test.mjs loop/lib/select.mjs`
- `node -p "<BAD_REFERENCE shipped vs proposed probe>"` (failed on pwsh quoting — ParserError, no measurement taken; pattern conclusion rests on Read of :19)
- Note: review file edit not performed — read-only plan mode + user "Read-only: you may not edit" overrides the prompt's edit instruction; review delivered as final message.

## Out of scope, not pursued
- none (re-measurement of Finding 2's 302-file/3-hit counts not pursued beyond reading `:19` + `specs.mjs:43`; full suite/build not run per hard limits)

