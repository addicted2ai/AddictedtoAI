# Packet F — implementation report

## 1. Commits

Commit created:

df44897 two-desks: append conformance history and enforce runner enablement

Output of git -C D:/addictedtoai-worktrees/fleet6-stage0-F log --oneline main..HEAD:

~~~text
df44897 two-desks: append conformance history and enforce runner enablement
~~~

## 2. What changed, per file

- loop/conformance.mjs: recordConformance appends the new run to the normalized
  history for its runner and preserves earlier entries.
- loop/lib/runners.mjs: conformanceHistory returns [] for an absent runner,
  [record] for the legacy object with checks, and the new array as-is.
  conformanceGate accepts passesToSupersede = 3, evaluates each check name
  oldest to newest, ignores the entry-level pass flag, and returns entries on
  every result. The no-record result is { ok: true, unrecorded: true,
  entries: 0 }; a recorded allowed result is { ok: true, entries: n }; a
  refusal is { ok: false, failed, reason, entries: n }. The reason names each
  standing failure, its date, passes since it, the threshold, and the count.
  enabled is optional and must be boolean when present. The exact load error is
  <path> runner "<id>": "enabled" must be a boolean when present. Explicit
  disabled ids still resolve for reporting; default and alternate searches skip
  them.
- loop/lib/select.mjs: a disabled runner returns selected: null,
  topRanked: null, one refusal with candidate: null and rule runner:disabled,
  empty warnings and notes, the computed shares/shed/lane values, and blocked
  set to the refusal reason. The return is before conformance and health gates.
  A disabled escalation destination returns null.
- loop/run.mjs: after both runner picks, a disabled author or reviewer returns
  started: true, selected: null, refused: reason, rule: runner:disabled.
  The two primary added log lines are:
  REFUSED [runner:disabled]: runner "<id>" is disabled (enabled: false) and cannot be used for the <role> role
  conformance: runner "<id>" — loaded <N> conformance entries
  (with the singular form for one). A disabled escalation destination also
  logs that it is disabled and that the original selection outcome is kept.
- loop/lib/ledger.mjs: the comment beside authority_sha states that it buys
  auditability rather than prevention, does not replace re-reading the frozen
  committed text, and that the hand-driven worker pipeline has no ledger line
  until its later retirement; interim authority is authority: <change>@<sha>
  in RESULT.md and the handover.
- loop/tests/conformance.test.mjs: covers legacy, array, absent, threshold,
  reset, omission, count, append, entry-verdict, and retained-failure cases.
- loop/tests/runner-policy.test.mjs: covers disabled author selection,
  omitted enablement, disabled reviewer precedence, disabled escalation,
  non-boolean load rejection, and disabled-default fallback.
- loop/tests/portability.test.mjs: runner-ID scanning now includes .ts and
  .tsx, and asserts positive scan contributions from loop (33), pulse (22),
  scripts (16), lib (227), app (28), and tools (11). The exported
  meetsScanFloor helper is used by both scans; one-file and nested skipTests
  arms are included.
- scripts/no-change-dir-refs.test.mjs: bad references capture the concrete
  change-name segment and closing slash, and allow-list checks use the matched
  span rather than the whole source line. The same-line generic-template and
  named-path fixture is covered.

## 3. Tests run

Pre-change property baselines:

- portability: 13 tests, 13 pass, 0 fail, duration_ms 1088.8222
- change-directory references: 3 tests, 3 pass, 0 fail, duration_ms 469.112
- real-registry selector policy: 17 tests, 17 pass, 0 fail,
  duration_ms 10970.9475

Post-change enforcement:

- portability: 15 tests, 15 pass, 0 fail
- change-directory references: 4 tests, 4 pass, 0 fail
- real-registry selector policy: 17 tests, 17 pass, 0 fail
- final targeted command: 171 tests, 171 pass, 0 fail, duration_ms
  124010.2033

The final targeted command was:

~~~text
node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/conformance.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/runner-policy.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/selector-rules.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/budget.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/expiring-proposal-precedence.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/runner-health.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/exit-code-refusal.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/portability.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/scripts/no-change-dir-refs.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/issues.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/gate-transport-retry.test.mjs
ℹ tests 171
ℹ suites 0
ℹ pass 171
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
~~~

Eight node --check calls for the modified JavaScript files and git diff
--check exited 0; these commands have no TAP totals.

The isolated diagnostic command
node --test D:/addictedtoai-worktrees/fleet6-stage0-F/pulse/tests/sources.test.mjs
passed:

~~~text
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4565.5584
~~~

The first committed-tip npm test completed in 459.6 seconds with one
environmental EADDRINUSE source-fetch failure:

~~~text
ℹ tests 1814
ℹ suites 0
ℹ pass 1813
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 452099.358
~~~

The final committed-tip npm test completed in 475.5 seconds:

~~~text
ℹ tests 1814
ℹ suites 0
ℹ pass 1814
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 473171.0778
~~~

## 4. Mutation table

Each restoration was followed by a green run. Hashes are SHA-256 values of
the restored files; the two rows whose files later received a report-only
test correction also show their final committed hash.

| # | Mutation, file and line | Red output tail | Restored output tail and SHA-256 |
|---|---|---|---|
| M1 | Restore overwrite at loop/conformance.mjs:415. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/conformance.test.mjs | ℹ tests 14; ℹ suites 0; ℹ pass 11; ℹ fail 3 | ℹ tests 14; ℹ suites 0; ℹ pass 14; ℹ fail 0. conformance.mjs: 9885BACD9E4D4ECD68FD3B4E4488FB76792131EA9730B3CE0519900AE5268DCB |
| M2 | Default threshold 3 to 1 at loop/lib/runners.mjs:195. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/conformance.test.mjs | ℹ tests 14; ℹ suites 0; ℹ pass 11; ℹ fail 3 | ℹ tests 14; ℹ suites 0; ℹ pass 14; ℹ fail 0. runners.mjs: D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706 |
| M3 | Treat an absent check as PASS at loop/lib/runners.mjs:223. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/conformance.test.mjs | ℹ tests 14; ℹ suites 0; ℹ pass 13; ℹ fail 1 | ℹ tests 14; ℹ suites 0; ℹ pass 14; ℹ fail 0. runners.mjs: D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706 |
| M4 | Ignore enablement in loop/run.mjs:946 and loop/lib/select.mjs:154. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/runner-policy.test.mjs | ℹ tests 19; ℹ suites 0; ℹ pass 16; ℹ fail 3 | ℹ tests 19; ℹ suites 0; ℹ pass 19; ℹ fail 0. run.mjs: 26BECFE7CCD0F2C97AED86EE301EB29888486CE63E0F09964CCAB33974E825A1; select.mjs: D6C66C604188B63B9C7B1548479C12051DE6CEBCBDB6C628601452C5412D1BBD |
| M5 | Default absent enablement to disabled at runners.mjs:144-146, select.mjs:154,285, and run.mjs:946,1301. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/runner-policy.test.mjs | ℹ tests 19; ℹ suites 0; ℹ pass 11; ℹ fail 8 | ℹ tests 19; ℹ suites 0; ℹ pass 19; ℹ fail 0. runners.mjs: D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706; select.mjs: D6C66C604188B63B9C7B1548479C12051DE6CEBCBDB6C628601452C5412D1BBD; run.mjs: 3266AC71821E042466C960D44C16E0DA9D12F79724163DADCC42A7F05938F037 |
| M6 | Drop the disabled escalation check at loop/lib/select.mjs:285. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/runner-policy.test.mjs | ℹ tests 19; ℹ suites 0; ℹ pass 18; ℹ fail 1 | ℹ tests 19; ℹ suites 0; ℹ pass 19; ℹ fail 0. select.mjs: D6C66C604188B63B9C7B1548479C12051DE6CEBCBDB6C628601452C5412D1BBD |
| M7 | Drop pickRunner disabled skips at loop/lib/runners.mjs:144-146. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/runner-policy.test.mjs | ℹ tests 19; ℹ suites 0; ℹ pass 18; ℹ fail 1 | ℹ tests 19; ℹ suites 0; ℹ pass 19; ℹ fail 0. runners.mjs: D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706 |
| M8 | Remove enabled type validation at loop/lib/runners.mjs:80-81. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/runner-policy.test.mjs | ℹ tests 19; ℹ suites 0; ℹ pass 18; ℹ fail 1 | ℹ tests 19; ℹ suites 0; ℹ pass 19; ℹ fail 0. runners.mjs: D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706 |
| M9 | Make conformanceHistory discard arrays at loop/lib/runners.mjs:179. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/conformance.test.mjs | ℹ tests 14; ℹ suites 0; ℹ pass 6; ℹ fail 8 | ℹ tests 14; ℹ suites 0; ℹ pass 14; ℹ fail 0. runners.mjs: D46721C90B239F3FDC9B66E25406DA82EDEA50293F102A0642F4C7D7DBDCB706 |
| M10 | Remove both .ts and .tsx at loop/tests/portability.test.mjs:33. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/portability.test.mjs | ℹ tests 15; ℹ suites 0; ℹ pass 14; ℹ fail 1 | ℹ tests 15; ℹ suites 0; ℹ pass 15; ℹ fail 0. portability.test.mjs at restoration: DEF894D8E0658A1E42FE5A2B641278FFF8AD75D57181660572EEB432B503DB64; final: 294E378558AAD076D7BB9A8A93B04218D5C37AA7896F22481D0D13D43C2FF033 |
| M11 | Weaken meetsScanFloor to scanned >= 0 at loop/tests/portability.test.mjs:92. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/portability.test.mjs | ℹ tests 15; ℹ suites 0; ℹ pass 14; ℹ fail 1 | ℹ tests 15; ℹ suites 0; ℹ pass 15; ℹ fail 0. portability.test.mjs: 294E378558AAD076D7BB9A8A93B04218D5C37AA7896F22481D0D13D43C2FF033 |
| M12 | Stop recursive skipTests propagation at loop/tests/portability.test.mjs:40. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/portability.test.mjs | ℹ tests 15; ℹ suites 0; ℹ pass 14; ℹ fail 1 | ℹ tests 15; ℹ suites 0; ℹ pass 15; ℹ fail 0. portability.test.mjs: 294E378558AAD076D7BB9A8A93B04218D5C37AA7896F22481D0D13D43C2FF033 |
| M13 | Test allow-list against the whole line at scripts/no-change-dir-refs.test.mjs:65. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/scripts/no-change-dir-refs.test.mjs | ℹ tests 4; ℹ suites 0; ℹ pass 3; ℹ fail 1 | ℹ tests 4; ℹ suites 0; ℹ pass 4; ℹ fail 0. no-change-dir-refs.test.mjs: 418E182507311317F79A7D11E16A2313120CB8DD543FA1E4625AC30A564C7BAE |
| M14 | Add authority_sha to LEDGER_FIELDS at loop/lib/ledger.mjs:22-31. Command: node --test D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/issues.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/portability.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-F/loop/tests/gate-transport-retry.test.mjs | ℹ tests 60; ℹ suites 0; ℹ pass 57; ℹ fail 3 | ℹ tests 60; ℹ suites 0; ℹ pass 60; ℹ fail 0. ledger.mjs: 9B828ED3D4BF83B66B08ECF49A9341CCC5C13A0D988ED7B5AD93022E80B46480 |

## 5. The registry half

The orchestrator must add this exact line under each of these entries in
runners.yml:

~~~yaml
codex-gpt-luna-medium:
    enabled: false
codex-gpt-luna-high:
    enabled: false
codex-gpt-luna-xhigh:
    enabled: false
~~~

Until those reserved registry edits happen, enabled is absent and the loop
treats every entry as enabled. Existing role, job-type, conformance, health,
budget, and escalation behavior therefore remains exactly as today; the three
entries remain defined and their records remain untouched.

## 6. Blocked or refused calls

none

## 7. Findings not fixed

- The three enabled: false registry edits remain for the orchestrator because
  runners.yml is reserved for that actor.
- The OpenSpec task checkboxes remain unchanged because tasks.md was excluded
  from this packet's permitted files.
