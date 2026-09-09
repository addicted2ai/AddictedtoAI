# Packet D — tasks 23 and 24 — round 2

## 1. Commits

Output of `git -C D:/addictedtoai-worktrees/fleet6-stage0-D log --oneline 5414899..HEAD`:

```text
46528c5 test: cover runner escalation refusal paths
8f5e14f loop: add declared runner escalation
```

Only `loop/tests/runner-policy.test.mjs` was committed in this round. `RESULT2.md` remains untracked as required by the brief.

## 2. Findings, each with its class and every instance fixed

### Finding 1 — the three early-return `topRanked: null` values

Class: TEST-COVERAGE.

Added three independent throwaway-repository arms in `loop/tests/runner-policy.test.mjs`:

- `conformance refusal has no ranked candidate and no escalation target` at line 111. Its queue contains the scout first; it writes a recorded FAIL for the cheap runner, calls `selection(ctx)`, and asserts `sel.topRanked === null`, `sel.selected === null`, a set `sel.blocked`, and `escalationTarget(registry, runner, sel) === null` at lines 126–130.
- `health refusal has no ranked candidate and no escalation target` at line 133. Its queue again contains the scout first; three cheap-runner ledger lines carry `outcome: interrupted`, `signal: NO_OUTPUT_SIGNAL`, and `mm: 0`. The same four result assertions are at lines 150–154.
- `paused lane has no ranked candidate and no escalation target` at line 157. Its queue contains the scout first and its cheap lane has one recent capacity line. The same four result assertions are at lines 171–175.

The three mutations of `loop/lib/select.mjs:158`, `:176`, and `:190` each turned only its corresponding arm red and were restored. The exact counts and restored hash are in section 4.

### Finding 2 — the non-empty-string guard on `escalates_to`

Class: TEST-COVERAGE.

The registry coverage at `loop/tests/runner-policy.test.mjs:276` keeps the existing unknown-id, self-target, reviewer-only, and absent-field arms. Four independent sibling arms now cover the malformed present-value class:

- empty YAML string, `registry rejects an empty escalation string`, line 332;
- whitespace-only YAML string, `registry rejects a whitespace-only escalation string`, line 341;
- numeric YAML value, `registry rejects a non-string escalation value`, line 350;
- bare YAML key producing `null`, `registry rejects a bare escalation key`, line 359.

Each writes its own throwaway registry and asserts the exact `/"escalates_to" must be a non-empty string when present/` message. Disabling the guard made all four independent arms red; restoring it returned all thirteen policy tests to green. The mutation row is in section 4.

### Changed-code sweep

The sweep below is the complete non-comment, non-blank code-line set from:
`git -C D:/addictedtoai-worktrees/fleet6-stage0-D diff 5414899..8f5e14f -- loop/lib/runners.mjs loop/lib/select.mjs loop/run.mjs`.

- `loop/lib/runners.mjs`
  - `:86-87` — the malformed-value predicate and exact error: the four independent malformed registry arms at test lines 332–366.
  - `:104` — the destination-validation loop: the declared-target arms at lines 272–288 and the absent-field arm at lines 290–304 enter or skip this loop.
  - `:105` — the absent-field `continue`: the absent-field assertion at line 304 proves the field stays `undefined`.
  - `:106` — the destination error context: the unknown, self-target, reviewer-only, and malformed arms all execute the constructed error context while asserting their rule-specific message.
  - `:107` — destination lookup: the unknown-id arm at lines 272–276 and the self/reviewer arms at lines 278–288.
  - `:108-109` — unknown destination refusal: the unknown-id arm at lines 272–276.
  - `:111-112` — self-reference refusal: the self-target arm at lines 278–282.
  - `:114-117` — author-role refusal: the reviewer-only arm at lines 284–288.
  - `:118-119` — structural closure of the destination-validation block; there is no distinct behavioral branch to reach, and a mutation here is a syntax failure rather than a policy result.

- `loop/lib/select.mjs`
  - `:158` — conformance early-return shape: the conformance arm at line 111.
  - `:176` — health early-return shape: the health arm at line 133.
  - `:190` — paused-lane early-return shape: the lane arm at line 157.
  - `:202-203` — first-candidate capture and `topRanked` initialization: the clearance-only arm at line 178, budget-ceiling arm at line 200, lower-ranked control at line 216, and escalation-entry refusal control at line 240.
  - `:233` — candidate refusal identity check and top-ranked refusal population: the inherited author mutation arm covering the four candidate-bearing selections at lines 178, 200, 216, and 240.
  - `:239-242` — upkeep-floor identity fallback: REVIEW1’s floor probe, recorded as the outside temporary floor arm; no new packet arm duplicates it.
  - `:247` — returned `topRanked` field: the four candidate-bearing selection assertions above plus the three new early-return null assertions.
  - `:266` — clearance-only rule check: the pure helper arm at line 368 and the four selection arms.
  - `:267` — declared-destination presence check: the pure helper’s missing-field assertion at line 368.
  - `:268` — registry destination lookup: the clearance escalation arm at line 178 and the lower-ranked control at line 216.

- `loop/run.mjs`
  - `:27` — the `escalationTarget` import: exercised through the run-loop arms at lines 216 and 240 and the pure helper import path.
  - `:943` — mutable author runner: the lower-ranked control at line 216 and escalation-entry refusal at line 240 observe the returned runner, with the inherited call-site mutation covering this assignment.
  - `:1256` — mutable selection: the same two dry-run call-site controls observe adoption and refusal.
  - `:1285-1287` — target resolution, branch entry, and top-candidate capture: the two run-loop controls at lines 216 and 240.
  - `:1288-1290` — first escalation log: the escalation-entry refusal arm at line 240 asserts the top-ranked refusal and runner.
  - `:1292` — the one re-selection call: the inherited no-rerun mutation arm, observed by the lower-ranked control and escalation-entry refusal control.
  - `:1293` — adoption condition: the inherited adopt-any-selection mutation arm, caught by the escalation-entry refusal control at line 240.
  - `:1294-1296` — adoption of the runner and selection plus the adopted log: the lower-ranked control at line 216 asserts the scout job and frontier runner.
  - `:1297-1304` — non-adoption and refusal lookup: the escalation-entry refusal control at line 240.
  - `:1305-1309` — refusal detail selection: the same escalation-entry refusal control asserts the frontier budget refusal.
  - `:1310-1313` — refusal log: the same control asserts both refusal descriptions.
  - `:1314-1315` — structural closure of the escalation branch; no distinct behavioral branch exists beyond the arms above.

The named outside-suite closure checks were also run: `runner-health.test.mjs` / `the selector refuses a dead runner too, before any candidate is considered`, `budget.test.mjs` / `a lane pauses on capacity, doubles per consecutive event, caps at 6h, and a success resets it`, `selector-rules.test.mjs` / `every clearance the shipped registry declares is actually enforced by the gate`, and `expiring-proposal-precedence.test.mjs` / `an expiring proposal is reached BEFORE the derived queue`. No changed implementation line in this sweep is left dependent only on those outside suites after the new arms were added.

## 3. Tests run

All commands below ran with the worktree as the process location and used absolute file paths for test targets.

Syntax check after the test additions:

```text
node --check D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/runner-policy.test.mjs
```

Exit 0, no output.

Initial targeted iteration, before splitting the malformed registry values into independent tests:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/runner-policy.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/selector-rules.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/budget.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/expiring-proposal-precedence.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/runner-health.test.mjs

1..74
# tests 74
# suites 0
# pass 74
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 64162.6938
```

Naming-boundary enforcement:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/portability.test.mjs

1..13
# tests 13
# suites 0
# pass 13
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 949.1752
```

Unarchived-change-reference enforcement:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-D/scripts/no-change-dir-refs.test.mjs

1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 400.987
```

Mutation command for every row in section 4:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/runner-policy.test.mjs
```

The three selector mutations each ended with `# tests 9`, `# pass 8`, `# fail 1`, and `# cancelled 0`; the failing subtest was respectively the conformance, health, or paused-lane arm. The common restored-baseline iteration after all three inverse patches ended with `# tests 9`, `# pass 9`, `# fail 0`, and `# cancelled 0`, and each inverse patch produced the same restored SHA-256.

The guard mutation was first observed before the registry-test split at 9 tests, 8 pass, 1 fail. After splitting the four arms, the final guard mutation ended with:

```text
1..13
# tests 13
# suites 0
# pass 9
# fail 4
# cancelled 0
# skipped 0
# todo 0
# duration_ms 8597.4851
```

The restored policy baseline after the split ended with:

```text
1..13
# tests 13
# suites 0
# pass 13
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 8677.5584
```

Final targeted iteration before the commit:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/runner-policy.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/selector-rules.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/budget.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/expiring-proposal-precedence.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-D/loop/tests/runner-health.test.mjs

1..78
# tests 78
# suites 0
# pass 78
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 60018.0726
```

Mandatory final committed-tip full suite:

```text
npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-D test

1,797 tests, 1,797 pass, 0 fail; wall time 445.3 seconds.
Final output lines:
ℹ tests 1797
ℹ suites 0
ℹ pass 1797
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 442920.8068
```

## 4. Mutation table

The implementation files were restored immediately after each mutation. The selector restore hash is `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84`; the registry restore hash is `C59129CD78C973C6C7F31869EEF45E09CA01893451A7086356B9B3AB01BC2D9D`.

| Mutation | Red result | Restored result and SHA-256 |
|---|---|---|
| `loop/lib/select.mjs:158` — `topRanked: null` → `{}` | `# tests 9`, `# pass 8`, `# fail 1`; only the conformance arm failed | `# tests 9`, `# pass 9`, `# fail 0`; `select.mjs` `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84` |
| `loop/lib/select.mjs:176` — `topRanked: null` → `{}` | `# tests 9`, `# pass 8`, `# fail 1`; only the health arm failed | `# tests 9`, `# pass 9`, `# fail 0`; `select.mjs` `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84` |
| `loop/lib/select.mjs:190` — `topRanked: null` → `{}` | `# tests 9`, `# pass 8`, `# fail 1`; only the paused-lane arm failed | `# tests 9`, `# pass 9`, `# fail 0`; `select.mjs` `6E4366B340D12C7AE0CE4423A06ECE5387DE6A5CCA77DA01013764AFF5BDED84` |
| `loop/lib/runners.mjs:86-88` — disable the non-empty-string guard | `# tests 13`, `# pass 9`, `# fail 4`; empty, whitespace-only, numeric, and bare-key arms failed independently | `# tests 13`, `# pass 13`, `# fail 0`; `runners.mjs` `C59129CD78C973C6C7F31869EEF45E09CA01893451A7086356B9B3AB01BC2D9D` |

## 5. The registry half

Unchanged from RESULT1 section 5. The orchestrator still owns the reserved edit:

```yaml
    escalates_to: codex-gpt-luna
```

It belongs on `codex-gpt-luna-medium` in `runners.yml`, along with retiring the caller-side grep routing and rewriting the max-entry note. This finding did not change that handover.

## 6. Blocked or refused calls

none

## 7. Findings not fixed

none


---

## Architect's addendum (A2AI-Fable-Arch, 2026-09-09 13:23, not the author's text)

REVIEW2 (delta) found the sweep in §2 incomplete: six non-comment,
non-blank lines of `git diff --unified=0 5414899..8f5e14f` are not listed.
Read from the tip `46528c5` by the architect, they are:

- `loop/lib/runners.mjs:88` — `}` closing the non-empty-string guard (`:86-87`, listed).
- `loop/lib/runners.mjs:110` — `}` closing the unknown-destination refusal (`:108-109`, listed).
- `loop/lib/runners.mjs:113` — `}` closing the self-reference refusal (`:111-112`, listed).
- `loop/lib/select.mjs:265` — `export function escalationTarget(registry, runner, sel) {`, the declaration line of the helper whose three body lines (`:266-268`) are listed; a mutation of the signature (a renamed export, a reordered parameter) is caught by the pure-helper arm (`runner-policy.test.mjs:368`) and by every selection arm that reaches the call site, which import and call it by name and positional order.
- `loop/lib/select.mjs:269` — `}` closing that helper.
- `loop/run.mjs:1291` — `);` closing the first escalation log call (`:1288-1290`, listed).

Five are closing delimiters of blocks whose behavioural lines the sweep
attributes to an arm; a mutation of a delimiter is a syntax error, not a
behaviour, and no arm can distinguish it from the block it closes. The
sixth is a declaration whose only mutable behaviour (name and arity) is
exercised by the arms named above. No arm was added and no file changed:
the finding is one of report completeness, as REVIEW2 itself says ("the
right report entry is a reason-none-can entry rather than a new production
test arm"). The architect closed it here rather than by a third author
round, and said so in the merge message, the task notes and the round-19
record; the reviewer's four named mutations and three spot-check mutations
were all red under it, and its verdict on the code and the tests carried no
other finding.
