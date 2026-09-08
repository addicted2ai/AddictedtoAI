# Stage 0 packet A round 3 — VERDICT: revise

## Findings

1. `scripts/verify-launch.mjs:1025-1026` still writes the build success record from `res.status === 0` alone. `checkBuild()` removes the old record at `:1018`, spawns the build, sets `ok` from the exit status, and immediately calls `writeBuildSuccessRecord()`; it does not measure or enforce the declared floor for that spawner. The round-3 change in `loop/lib/gates.mjs:634-637` covers only the `runGates()` build path. This violates the frozen task-3 wording that both `verify-launch`'s own build and the loop build gate write only after a zero exit that has also cleared the floor, and it violates the requirement's rule that each gate's floor is enforced. A concrete wrong world is a valid `out/status.json` plus a zero-exit shim that returns below the `verify-launch` floor: `checkBuild()` records success and reports `ok`, and a later `hasCurrentBuild()` can reuse the export. Make this writer consume the same floor-checked result (and remove the record on a floor failure), and add a standing test for a below-floor zero-exit `verify-launch` build with a valid status stamp.

## The mutations I re-ran myself

- Mutation D: in `scripts/verify-launch.mjs:323`, changed `built.newest > inputs.newest` to `built.newest >= inputs.newest`.
  - Before mutation SHA-256: `2C4641F1FF17F0DF2408CE5CE7B33613F92FC4CB0B9D12A7BC37D86CC795BE6C`.
  - Red: `scripts/tests/verify-launch.test.mjs` had 8 pass / 1 fail. Exactly one arm moved: `an export whose newest input equals newest output builds`; assertion `equal mtimes are not current`, `0 !== 1`, at line 157. No other arm failed.
  - Restored `>` immediately. After-restoration SHA-256 was exactly `2C4641F1FF17F0DF2408CE5CE7B33613F92FC4CB0B9D12A7BC37D86CC795BE6C`.
  - Green after restoration: 9 pass / 0 fail.

- Floor mutation: in `loop/lib/gates.mjs:369`, replaced `if (!result.ok || result.durationMs >= floorMs(floor)) return withFloor;` with `return withFloor;`.
  - Before mutation SHA-256: `A49F1EFD3B54378DE57964D5E84B80A540ACB3ABB433179467621082655E1D31`.
  - Red: `loop/tests/gates.test.mjs` had 4 pass / 3 fail. The failures named `a successful two millisecond gate below its floor fails with its observation` (line 28), `a 400ms test gate fails under repository floors and passes only with fixture floors` (line 67), and `a below-floor build leaves no success record` (line 175); each showed `true !== false`.
  - Restored the comparison immediately. After-restoration SHA-256 was exactly `A49F1EFD3B54378DE57964D5E84B80A540ACB3ABB433179467621082655E1D31`.
  - Green after restoration: 7 pass / 0 fail.

## Every writer of the build success record

- `loop/lib/gates.mjs:146` defines the loop writer. `npmRun()` removes an old record at `:459`; `runGates()` applies `enforceGateFloor()` at `:634`, writes only when the resulting `r.ok` is true at `:636`, and removes the record on every non-`ok` result at `:637`. The round-3 guarantee covers this writer.
- `scripts/verify-launch.mjs:279` defines the standalone writer. Its only production call is `:1026`, after `checkBuild()` has removed the old record at `:1018`, but the call is governed only by `const ok = res.status === 0` at `:1025`. No floor result reaches it. The round-3 guarantee does not cover this writer; this is the finding above.
- The remaining matches are fixture setup writes, not production writers: `loop/tests/gates.test.mjs:125` and `:163`, and `scripts/tests/verify-launch.test.mjs:67`. The search covered `loop`, `lib`, `pulse`, `scripts`, `app`, and `tools` and found no other production writer.

## What I checked that was sound

- I read the frozen authority from `160f1c2` in `D:/AddictedToAI`, including tasks 1–4 and the full `A job's gates are a tripwire; the full set runs once, on the train` requirement. I did not use the superseded `openspec/` text in this worktree.
- The round-3 diff is exactly three permitted files: `loop/lib/gates.mjs`, `loop/tests/gates.test.mjs`, and `scripts/tests/verify-launch.test.mjs`. `package.json` is untouched. The whole-branch `main...HEAD` context contains only those plus the already-existing `scripts/verify-launch.mjs` change, all within the four permitted paths.
- The new below-floor test is non-vacuous: it creates `out/.build-stamp.json` before the run, then asserts both stage failure and record absence. The production writer now follows the floor-checked result on the loop path.
- The equal-mtime fixture sets newest input and newest output to the same `BUILD_TIME`, includes a valid success record, and asserts a build spawn. Mutation D made exactly that arm red.
- `loop/tests/job-gate-set.test.mjs` passed all 7 tests. Its real child-process fixture gates passed, including the `node --version` canary and the full ordered four-gate path.
- `loop/tests/portability.test.mjs` passed all 12 tests, and `pulse/tests/zero-model.test.mjs` passed all 5 tests. No portability violation was introduced by the round-3 files.
- The tracked tree had no mutation residue after restoration; `git diff --check` was clean. I did not run a build, the full test command, any `verify-*` command, or the Pulse.

## Was the brief faithful to the task and the requirement?

Partly. It accurately described the equal-mtime fixture, the floor-path change, the seeded below-floor test, and the mutation results it reported. It was not faithful to task 3 and the requirement when it treated the `loop/lib/gates.mjs` writer as the complete record mechanism and called the floor/record guarantee complete. The standalone `verify-launch` writer is the twin spawner that the brief failed to account for; leaving the fourth permitted file untouched is not correct for this requirement.

## Did you read REVIEW.md or REVIEW2.md?

No for both. I formed the findings, ran the inspections and mutations, and wrote this file without opening either prior verdict.

## What I ran

Authority and diff inspection:

```text
git -C D:\AddictedToAI show 160f1c2:openspec/changes/two-desks-work-orders-and-trains/tasks.md
git -C D:\AddictedToAI show 160f1c2:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff 46865e7..317832b
git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff main...HEAD
```

The frozen requirement contained the floor rule, the “whichever caller spawns a build” reuse rule, and the explicit below-floor record requirement. The round-3 name-status output was:

```text
loop/lib/gates.mjs
loop/tests/gates.test.mjs
scripts/tests/verify-launch.test.mjs
```

Focused suites before mutation:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\gates.test.mjs
ℹ tests 7
ℹ pass 7
ℹ fail 0

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
ℹ tests 9
ℹ pass 9
ℹ fail 0

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\job-gate-set.test.mjs
ℹ tests 7
ℹ pass 7
ℹ fail 0

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\portability.test.mjs
ℹ tests 12
ℹ pass 12
ℹ fail 0

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\pulse\tests\zero-model.test.mjs
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

Mutation D red output:

```text
✖ an export whose newest input equals newest output builds
ℹ tests 9
ℹ pass 8
ℹ fail 1
AssertionError [ERR_ASSERTION]: equal mtimes are not current
0 !== 1
at ...scripts/tests/verify-launch.test.mjs:157:10
```

Mutation D restoration and green output:

```text
2C4641F1FF17F0DF2408CE5CE7B33613F92FC4CB0B9D12A7BC37D86CC795BE6C
ℹ tests 9
ℹ pass 9
ℹ fail 0
```

Floor mutation red output:

```text
✖ a successful two millisecond gate below its floor fails with its observation
✖ a 400ms test gate fails under repository floors and passes only with fixture floors
✖ a below-floor build leaves no success record
ℹ tests 7
ℹ pass 4
ℹ fail 3
```

Floor mutation restoration and green output:

```text
A49F1EFD3B54378DE57964D5E84B80A540ACB3ABB433179467621082655E1D31
ℹ tests 7
ℹ pass 7
ℹ fail 0
```

Final tracked-tree check:

```text
git -C D:\addictedtoai-worktrees\fleet6-stage0-A status --short
git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --check
?? .agent-brief.md
?? REVIEW.md
?? REVIEW2.md
?? REVIEW3.md
```

The first three listed files were pre-existing untracked review materials; `REVIEW3.md` is this permitted verdict file. No tracked implementation or test mutation remained.
