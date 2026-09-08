# Stage 0 packet A — VERDICT: revise

## Findings

1. `scripts/verify-launch.mjs:212-218` does not establish that `out/` is a
   build of the exact tree under check. `hasCurrentBuild` only requires one or
   more output files and accepts `built.newest >= inputs.newest`; it never
   compares tree content or a build identity. A concrete wrong world is an
   `out/` copied from another commit with a newer timestamp, or a source file
   whose bytes change while its mtime is preserved. Both return `true`, so
   `checkBuild` at `:896` skips the build and reports reuse for an export that
   was not produced from this tree. The `>=` also accepts equal timestamps.
   This violates the REUSE bullet's “build of that exact tree” condition. The
   comment at `:208` is also factually too narrow: the existing build writes
   `out/status.json` with a commit stamp, although a dirty-tree content
   fingerprint would still be needed for full identity. Use an authoritative
   input-tree identity (and require the expected build artifact, failing closed
   when it is unavailable), then add a test for mismatched output and an
   equal-mtime/content-change case. The current test at
   `scripts/tests/verify-launch.test.mjs:22-33` creates one arbitrary file with
   a newer mtime, so it passes even in this wrong world.

## The mutation I re-ran myself

I reran both named mutations. An initial literal one-line edit that left the
rejection body unconditional was restored immediately and was not counted as
the acceptance mutation; the complete rejection-path deletion below is the
discriminating mutation.

- Floor comparison mutation: in `loop/lib/gates.mjs`, replaced the complete
  below-floor rejection path with `return withFloor;`.

  Command:

  ```text
  node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\gates.test.mjs
  ```

  Real red output:

  ```text
  ✖ a successful two millisecond gate below its floor fails with its observation (5.5036ms)
  ✔ a real gate that runs longer than its calibrated floor passes (91.8377ms)
  ✔ npm gates use cmd.exe /c on Windows without shell mode (3.1562ms)
  ℹ tests 3
  ℹ pass 2
  ℹ fail 1
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  true !== false
      at loop\tests\gates.test.mjs:27:10
  ```

  The original SHA-256 was
  `FC8B58FFA493392888F0840E51289BE626A97D9962F01FBA34CAB201B30DC363`.
  After restoration the same hash was returned, and the green rerun was:

  ```text
  ✔ a successful two millisecond gate below its floor fails with its observation (4.4649ms)
  ✔ a real gate that runs longer than its calibrated floor passes (89.6121ms)
  ✔ npm gates use cmd.exe /c on Windows without shell mode (3.5028ms)
  ℹ tests 3
  ℹ pass 3
  ℹ fail 0
  ```

- Build-presence mutation: in `scripts/verify-launch.mjs`, replaced
  `return built.newest >= inputs.newest;` with `return false;`.

  Command:

  ```text
  node --test D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
  ```

  Real red output:

  ```text
  ✖ a present current build is reused without spawning a build process (5.5304ms)
  ✔ without a current build the launch check spawns the build process (2.2803ms)
  ℹ tests 2
  ℹ pass 1
  ℹ fail 1
  AssertionError [ERR_ASSERTION]: reuse is proved by the spawn count
  1 !== 0
      at scripts\tests\verify-launch.test.mjs:59:10
  ```

  The original SHA-256 was
  `EDA2B6CE3105D523B40070827093D555522F532E554EC82E0ED2DE81E05140EF`.
  After restoration the same hash was returned, and the green rerun was:

  ```text
  ✔ a present current build is reused without spawning a build process (4.7613ms)
  ✔ without a current build the launch check spawns the build process (2.1184ms)
  ℹ tests 2
  ℹ pass 2
  ℹ fail 0
  ```

## What I checked that was sound

- `GATE_FLOORS` declares all six named calibrations with the common 0.1%
  floor rule, calibration date `2026-09-08`, and evidence basenames. The
  corrected npm timings were used; the recorded null/0.0-second npm run was
  not used, and the analytics server-start exclusion was stated.
- `runGates` measures each child with a monotonic clock, fails a successful
  below-floor result with the gate and observed duration, and uses `cmd.exe`
  with `/c` on Windows without `shell: true`.
- The launch tests assert the spawn count, not only the reuse branch, and the
  missing-build control still exercises one build spawn.
- The commit diff is limited to the four permitted paths, has no whitespace
  errors, and adds no model/provider/harness/runner-id token or change-directory
  reference. The two provider words found in `scripts/verify-launch.mjs` are
  unchanged lines already present on `main`.
- The author's reported full suite is plausible (1,714 tests equals the
  reported 1,709 baseline plus the five new focused tests), but I did not run
  it because the sealed-review limits prohibit a full suite.
- GitNexus has no index for this repository, so its graph query was unavailable;
  the call reported this repository as not found and I used direct diff and
  call-site inspection instead.

## Was the brief faithful to the task and the requirement?

Mostly yes. It quoted the relevant requirement and tasks accurately, identified
the four allowed files, described the corrected calibration evidence and the
analytics trap, and stated the two mutations and their required controls. It
did not misstate the committed tree or scope. It did not call out the stronger
“exact tree” identity condition, allowing the implementation to treat
timestamp ordering as current; that is the narrowing exposed in the finding.

## What I ran

The required focused tests, after restoration:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\gates.test.mjs
✔ a successful two millisecond gate below its floor fails with its observation (4.7121ms)
✔ a real gate that runs longer than its calibrated floor passes (94.8255ms)
✔ npm gates use cmd.exe /c on Windows without shell mode (6.8851ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
✔ a present current build is reused without spawning a build process (5.5017ms)
✔ without a current build the launch check spawns the build process (2.4927ms)
ℹ tests 2
ℹ pass 2
ℹ fail 0
```

Scope and tree checks:

```text
git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --stat main...HEAD
 loop/lib/gates.mjs                   | 108 ++++++++++++++++++++++++++++---
 loop/tests/gates.test.mjs            |  74 ++++++++++++++++++++++
 scripts/tests/verify-launch.test.mjs |  81 ++++++++++++++++++++++++
 scripts/verify-launch.mjs            | 119 +++++++++++++++++++++++++++++------
 4 files changed, 357 insertions(+), 25 deletions(-)

git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --name-status main...HEAD
M	loop/lib/gates.mjs
A	loop/tests/gates.test.mjs
A	scripts/tests/verify-launch.test.mjs
M	scripts/verify-launch.mjs

git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --check
Exit code: 0; no output

git -C D:\addictedtoai-worktrees\fleet6-stage0-A status --short
?? .agent-brief.md
```

Calibration evidence read:

```text
Get-Content -Raw D:\addictedtoai-worktrees\fleet6-stage0-A\openspec\changes\two-desks-work-orders-and-trains\evidence\gate-timings.txt
npm test           null       0.0
npm run build      null       0.0
verify-launch         0      39.6
verify-design         0      35.7
verify-surfaces       0       3.7
verify-analytics      0      19.5

Get-Content -Raw D:\addictedtoai-worktrees\fleet6-stage0-A\openspec\changes\two-desks-work-orders-and-trains\evidence\gate-timings-npm.txt
npm test           exit    0     314.8s
npm run build      exit    0      29.2s
```

The review graph command was also attempted read-only and returned:
`Repository "D:\addictedtoai-worktrees\fleet6-stage0-A" not found`.
I did not run the full suite, any build, any verify script, the Pulse, or any
publish/merge/push operation.
