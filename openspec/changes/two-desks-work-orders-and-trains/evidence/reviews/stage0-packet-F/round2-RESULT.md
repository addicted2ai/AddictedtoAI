done
# Packet F — round 2 report

## 1. Commits

- `952de9f two-desks: close packet F coverage gaps` contains the five permitted source and test-file changes.
- Its parent is the supplied round-1 tip `df44897`.
- `RESULT2.md` is intentionally uncommitted. Existing untracked `.agent-brief.md`, `RESULT1.md`, and `REVIEW1.md` were preserved.

## 2. What changed, per file, per finding

- `loop/lib/select.mjs` (finding 1): documented optional `conformanceEntries` and carried `conformance.entries` through the conformance-refusal, health-refusal, lane-refusal, and normal selection returns. The disabled pre-gate return remains without a count because it loads no conformance history.
- `loop/tests/runner-policy.test.mjs` (finding 1): asserted counts for the recorded refusal, health refusal, lane refusal, unrecorded allowed selection (`0`), and recorded allowed selection (`2`).
- `loop/tests/conformance.test.mjs` (findings 3 and 4): added a four-entry history with two failed check names whose later histories diverge, asserting the exact standing set and refusal; added a five-entry history where the failed check is absent while another check is present, preserving the whole-array omission control.
- `loop/tests/portability.test.mjs` (finding 5): replaced the self-derived three-root fixture expectation with an independently written six-root expectation. The live scan’s root-presence check and the throwaway fixture scan now cover every required root independently.
- `scripts/no-change-dir-refs.test.mjs` (finding 2): made the trailing slash optional, while preserving the path-form span. Added terminal, path-span, archive, and bare-prefix/backtick arms. The allow-list was not changed.

Temporary in-memory gate-mutation probes were removed from `.job/`; both probe paths were verified absent.

## 3. Tests run (counts quoted, TAP totals)

All dates in this report use the machine-local clock; the report run read `2026-09-09 17:02:19` from the required local-date command.

- Reviewer mutation reproductions before the fixes: selector generic-reason swap `19` tests, `19` pass; conformance name-collector mutation `14` tests, `14` pass; exact absent-check fallback mutation `14` tests, `14` pass; portability root-removal mutation `15` tests, `15` pass.
- Final affected-file run: `56` tests, `56` pass, `0` fail.
- Final full run: `npm test` completed one iteration over `128` test files with `1,817` tests, `1,817` pass, `0` fail, `0` cancelled, `0` skipped.
- Five `node --check` calls and `git diff --check` passed.

## 4. Mutation table

The generic-reason swap from finding 1 remains green after the fix by design; it is not claimed as a red mutation. The red mutations below drop or corrupt the new count field itself.

| Finding | Mutation | GREEN before / RED after | Restored with SHA-256 |
|---|---|---|---|
| 1 | Remove `conformanceEntries` from the conformance refusal; set it to `0` on the recorded allowed path; make it `conformance.entries || 1` on the unrecorded path. | The reviewer’s original generic-reason mutation was green at `19/19`; with the new count arms restored, the suite was `20/20`. Each post-fix count mutation was red at `20` tests with `19` pass and `1` fail. | `loop/lib/select.mjs` — `4356D81ACB47568E02A51D9483A780DBB9992707BF928E4588094D4A5575B1CC` |
| 2 | No code mutation was specified; the regression was the required terminal-reference case. | Final four detector arms green: `4` tests, `4` pass. | `scripts/no-change-dir-refs.test.mjs` — `96A86B1144FEF1452C46329692F8408B8A8615B7CCF77C0529835ECBD1350D5B` |
| 3 | In-memory replacement of the per-name collector’s `seen.has(check.name)` condition with `seen.size > 0`, tracking only the first failed name. | Reviewer mutation was green at `14/14` before the new fixture. After the fixture, `16` tests gave `15` pass and `1` fail. | `loop/tests/conformance.test.mjs` — `134D29EDCA43FA55CA17BD733D7CF017C3A230FD3F1706DFD962AAADBB9FB818` |
| 4 | In-memory conditional fallback to the first available check when the named check is absent. | Exact reviewer mutation was green at `14/14` before the new fixture. After the fixture, `16` tests gave `15` pass and `1` fail. | `loop/tests/conformance.test.mjs` — `134D29EDCA43FA55CA17BD733D7CF017C3A230FD3F1706DFD962AAADBB9FB818` |
| 5 | Remove `loop` from `RUNNER_SCAN_ROOTS`. | Reviewer mutation was green at `15/15` before the independent expectation. After it, `15` tests gave `14` pass and `1` fail on the missing `loop` fixture. | `loop/tests/portability.test.mjs` — `07A2D5C0A1372E3E4F0C5C31C9F1EA3F67B594BA8CE610BD895153B21E9FD6D6` |

## 5. Findings I could not reproduce, if any

None. Finding 2 had no reviewer mutation; its terminal/path/archive/prefix measurements were implemented directly and the four-arm detector test is green. An initial probe for finding 4 was broader than the described conditional fallback and failed an existing control; it was discarded, corrected to the exact mutation, and then reproduced the stated `14/14` green result.

## 6. Blocked or refused calls

No blocked or refused calls. One read-only file-size probe had a PowerShell quote typo and exited `1`; it was corrected immediately without changing files. Mutation commands that exited `1` are intentional red evidence and are listed in section 4.

## Changed-line sweep

- `loop/lib/select.mjs:112` names `conformanceEntries` in the return documentation; the count assertions in `runner-policy.test.mjs` cover the documented field. Lines `181`, `200`, and `215` are covered respectively by the conformance-refusal, health-refusal, and paused-lane assertions. Line `273` is covered by both the recorded allowed and unrecorded allowed assertions. The disabled return at `157` is intentionally unchanged and has no count obligation.
- `loop/tests/runner-policy.test.mjs:153`, `:178`, and `:200` assert the three post-gate refusal counts. The new test’s unrecorded assertion at `:210` and recorded allowed assertion at `:228` cover the normal return and each count value. Its recorded history rows are consumed by the `2` assertion; the empty-history path is consumed by the `0` assertion.
- `loop/tests/conformance.test.mjs:203-250` is one complete divergent-history fixture and arm: every entry and check row supplies the sequence consumed by the exact `failed`, refusal, and absence assertions at `:247-250`. The mutation comment at `:245-246` names the first-name-only failure. Lines `295-349` are one complete omitted-check fixture and arm: the omitted `check-a` beside present `check-b` at `:320` is consumed by the refusal, exact failed-set, count, and pass-run assertions at `:345-348`; the mutation comment at `:343-344` names the incorrect fallback.
- `loop/tests/portability.test.mjs:31-33` introduces the independent six-root contract list, exercised by the independent root-presence assertions at `:164-166` and by every fixture assertion at `:196-205`. Each of the six fixture paths has its own exact-hit assertion, and `:205` checks the expected scanned count. The root-removal mutation therefore leaves the `loop` expectation behind and goes red.
- `scripts/no-change-dir-refs.test.mjs:19` is covered by the four literal arms at `:79-89`: terminal name at `:79-81`, continued path and exact span at `:82-85`, archive exclusion at `:86`, and deliberate bare-prefix/backtick exclusion at `:87-89`.

## 7. Findings not fixed

None of the five round-2 findings remain unfixed.
