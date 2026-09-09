# BRIEF REVIEW — arch-e-brief-r2.md — VERDICT: DISPATCH

## Findings
None rise to the REVISE bar (wrong-build or forbidden-file-red). Verified load-bearing claims below held at `db10eac`; the two previously-red pins sit exactly where the brief says and in Files.

- **Check 4 — citations all held** (the highest-risk class, given this round's two prior failures): `run.mjs:1486` `authority_sha: mergeBaseSha` ✓; `:1484` `brief_chars: briefText.length` ✓; `:678` `reviewPhase.carried = …gate.verdict.carry…length : 0` ✓; `:1359-1360` `writeFileSync(.job/brief.md, briefText)` + `git add` ✓; `:1503-1504` `rm .job` + commit `remove job scaffolding before merge` ✓ (grep: commit at 1504, rm at 1503); `:1957` `deleteBranch(ctx.repoRoot, mergedBranch)` in the merge-success cleanup ✓; `git.mjs:216` `merge --no-ff` ✓; `mergedSha` is in runLoop's return (`run.mjs:2120`) so `<result.mergedSha>^2` is reachable after branch deletion ✓; `ledger.test.mjs:43` `assert.ok(phase.runner)`, `:97` carried 0, `:100` brief_chars>0, `:102` authority_sha length 40 ✓ and the integration arm is `:72-103` ✓; `breakers.test.mjs:172-178` key-shape+field-for-field with `varies` at `:176` ✓; `gate-transport-retry.test.mjs:876-880` exact `['phases']` pin ✓; `mock-executor.mjs:53-85` `writeVerdict` takes no carry ✓ and `case 'review-approve'` at `:262` ✓; `mock-proposal-executor.mjs:269` `review-approve-carrying` with `CARRIED` (one well-formed title/detail/subject entry at `:111-113`, one title-less malformed entry) ✓ — so "no reusable two-carry reviewer exists" holds.
- **Check 2 — closure**: the round's production surface is zero (all fixes are assertions and fixture modes; `run.mjs` is mutation/restore only), so red-risk is confined to the four changed test files, all in the Files list. Sweep pins found: `Object.keys(line)` sites at `breakers.test.mjs:172`, `gate-transport-retry.test.mjs:877`, `portability.test.mjs:409` — the first two are in Files, the third is named with a reason (own eight-key line, stays green); `issues.test.mjs:243` pins `LEDGER_FIELDS` itself, which is unchanged. No pinning file outside the list turns red from this round's diff.
- **Not checked within the 20-command cap** (no guess attached): (1) check 1's character-level quote comparison — relied on the stated linter pass and one read-through; no dropped paragraph was visible. (2) `portability.test.mjs:409`'s line construction and `issues.test.mjs` were confirmed by grep output but not read in full context. (3) The `gate_seconds`-absence premise in `gate-transport-retry` (stub records no `durationMs`) — the derivation in `run.mjs:288-289` (`gateSecondsForLedger`) was not read, so I did not independently confirm the stubbed line omits the key; if it does not, the worker will see the exact-pin assertion fail against the real line and the brief's "exact pin, do not loosen" wording lets them report it. Flagged, not a REVISE.
- **Style/quantifier note (not a finding)**: Finding 3 says "CARRIED at :107-116"; the constant starts at `:109` (`:107-108` are the comment). Harmless — the block and its malformed entry are unambiguous.

## Checked and sound
- Check 3 (quantifiers): every "each phase / every review / all additive keys / only" claim in the fix prose resolves to a concrete fixture, line, or exemption with a reason.
- Check 4 (line numbers): all citations above verified against the tip.
- Check 5 (contradictions): none found between fix prose, quoted standard, and code — the two dead-address claims (`.job/brief.md` absent at `mergedSha`; branch deleted at `:1957`) both hold.
- Check 6 (instruments): named files exist (`ls-files`: `ledger.test.mjs`, `verify-launch-build-reuse.test.mjs`, `breakers.test.mjs`, `gate-transport-retry.test.mjs`, `mock-executor.mjs`, `mock-proposal-executor.mjs`, `helpers.mjs`); `mockCommand` at `helpers.mjs:231` dispatches by mode string so a new mode is additive.
- Check 7 (mutations): each named mutation is realisable at a real line with the described value (`'a'.repeat(40)`, `1`, `carried: 0` at `:678`) and each goes red against the strengthened assertions; pin reverts red on this tip by construction.
- Check 8 (ambiguity): none material — line-ending caveat in Finding 2 and the unit-arm/sweep decisions are explicitly delegated with reasons.
- Check 9 (report contract): `RESULT2.md`, numbered sections 1-7, blocked calls, unfixed findings — all present.
- Check 10 (ground rules): `cd` ban, absolute paths, no-build, one final full-suite iteration with 600s timeout, no `git push`, Files-only edits, blocked-call reporting — all present.

## What I ran (verbatim)
1. `git -C D:/addictedtoai-worktrees/fleet6-stage0-E log --oneline --decorate -3` + `ls-files …| rg …` (rg unavailable on this host)
2. `git -C … grep -n -E "LEDGER_FIELDS|BUILD_INPUT_EXCLUSIONS" -- loop scripts app tools lib`
3. `git -C … grep -n -E "Object\.keys\(|deepEqual|varies|writeVerdict|reviewerCommand|removeJobWorktree|removeWorktree" -- loop/tests`
4. `git -C … grep -n -E "authority_sha|brief_chars|gate_seconds|carried|\.job/brief|mergeBaseSha" -- loop scripts`
5. `git -C … ls-files scripts loop/tests | Select-String -Pattern "verify-launch|ledger\.test|mock-…|breakers|…"`
6. `git -C … grep -n -E "case 'review-approve|review-approve-carry|function mockCommand" -- loop/tests/mock-executor.mjs loop/tests/mock-proposal-executor.mjs loop/tests/helpers.mjs`
7. `git -C … grep -n -E "CARRIED|parseCarry|carry:" -- loop/tests/mock-proposal-executor.mjs loop/lib/carry.mjs loop/lib/verdict.mjs loop/run.mjs`
8-10. Read: `ledger.test.mjs` (full, 168 lines); `mock-executor.mjs:45-94`; `mock-executor.mjs:255-309`
11-14. `git -C … show HEAD:loop/run.mjs | Select-Object -Skip 1345/-Skip 1478/-Skip 1945 -First …`; `…loop/lib/git.mjs | Select-Object -Skip 205 -First 20`
15-18. Read: `breakers.test.mjs:60-174`; `gate-transport-retry.test.mjs:850-893`; `mock-proposal-executor.mjs:100-129`; `mock-proposal-executor.mjs:255-289`
19. `git -C … grep -n -e "no-ff" -e "remove job scaffolding before merge" -e "deleteBranch" -- loop/lib/git.mjs loop/run.mjs`
20. `git -C … grep -n -e "reviewPhase.carried" -e "function gateSecondsForLedger" -e "mergedSha" -e "return ledgerLine" -- loop/run.mjs | Select-Object -First 20`

Note: the instruction to first edit the review skeleton file was not performed — this environment is read-only (plan mode); per your instruction, this final message is the review.

## Out of scope, not pursued
- None beyond the three items listed as "not checked" above.
