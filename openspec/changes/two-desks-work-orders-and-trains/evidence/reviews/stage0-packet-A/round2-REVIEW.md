# Stage 0 packet A round 2 — VERDICT: revise

## Findings

1. **`loop/lib/gates.mjs:481` writes a success record before the floor tripwire is applied.** `npmRun()` writes `.build-stamp.json` whenever the child exits 0, but `runGates()` only passes that result through `enforceGateFloor()` at `:635` afterward. I added a temporary assertion using the existing status fixture: a build returning 0 in 2 ms against a 3 ms floor correctly returned `ok: false`, but the success record still existed. A stale/current `out/` can therefore be paired with a record left by a below-floor no-op and later be accepted by `hasCurrentBuild`, defeating the property that a gate below its floor did not run. Move record creation after the final floor-enforced result is known (or remove it on `floorFailure`) and add the below-floor record assertion as a permanent regression test.

2. **`.agent-brief.md:40-41` names the wrong frozen authority revision.** The brief says the authority is `40a5795` at `:35` and `:51`, but its commands tell the author to read `6a8adba`, which contains superseded text. The RESULT and implementation show that the author ultimately used `40a5795`, so this did not contaminate the code; the brief itself still needs both commands corrected to the frozen revision.

## The mutations I re-ran myself

- **Mutation C:** I replaced `hasCurrentBuild()`'s body with `existsSync(join(root, BUILD_OUTPUT_DIR))`. The real command was:

  ```text
  node --test D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
  ```

  Real result: 4 passed, 4 failed. The failures were the no-record assertion at `:122`, wrong-commit at `:134`, stale at `:143`, and empty-output at `:152`. I restored the body. `scripts/verify-launch.mjs` was SHA-256 `2C4641F1FF17F0DF2408CE5CE7B33613F92FC4CB0B9D12A7BC37D86CC795BE6C` before and after. The restored test was green: 8 passed, 0 failed.

- **Floor-comparison mutation:** I replaced the below-floor branch in `enforceGateFloor()` with `return withFloor;`. The real command was:

  ```text
  node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\gates.test.mjs
  ```

  Real result: 4 passed, 2 failed. The 2 ms assertion at `:28` and 400 ms test-floor assertion at `:67` failed; the real-gate control and the other four tests stayed green. I restored the branch. `loop/lib/gates.mjs` was SHA-256 `3C038D57CFF10DF1252593535C3C084188845EB4C365A7142882300AABA25965` before and after. The restored test was green: 6 passed, 0 failed.

- **Additional record mutation B:** I made `hasSuccessfulBuildRecord()` always return true. The same verify-launch test went 6 passed, 2 failed, at the no-record `:122` and wrong-commit `:134` assertions. I restored it; the same `2C4641F1...` hash returned and the test was 8/8 green.

- **Additional empty-guard probe:** I deleted `if (built.files === 0) return false` at `scripts/verify-launch.mjs:321`. The existing test stayed 8/8 green because the strict `built.newest > inputs.newest` check independently rejects the ordinary empty fixture. I restored it and the `2C4641F1...` hash returned. The required Mutation C still makes the empty case red; this probe shows that the individual empty-file guard is redundant for the normal-mtime fixture.

- **Record-ordering probe:** I temporarily added a below-floor build case to `loop/tests/gates.test.mjs`. The real result was 5 passed, 1 failed, with `AssertionError: a below-floor build is not a success record` and `true !== false` at temporary line `:147`. I removed the probe. `loop/tests/gates.test.mjs` was SHA-256 `8B846357E19D98526C01876D5410B278022EF7F0820662D5BAD7CABE60E93445` before and after, and the restored test was 6/6 green.

## The three parts of the floor shape

- **Repository floors:** `GATE_FLOORS` uses 25% of each recorded runtime, with `calibrationRuns: 1`, the local date `2026-09-08`, a serial wall-clock method, and basename-only evidence (`gate-timings-final.txt` or `gate-timings-npm.txt`). The source and comments state that 25% is deliberately generous pending a distribution, not justified by an unmeasured variance. The recorded values are test 78,700 ms, build 7,300 ms, verify-launch 9,900 ms, verify-design 8,925 ms, verify-analytics 4,875 ms, and verify-surfaces 925 ms.
- **Fixture override:** `runGates()` accepts `floorSet` (and its alias `floors`), validates the active set, and the 400 ms fake test gate fails under repository floors but passes with an explicit 1 ms fixture floor. The required `job-gate-set.test.mjs` canary also passed all 7 tests.
- **Tripwire minimum:** `MIN_GATE_FLOOR_MS` is 1, and `validateFloorSet()` rejects an override of 0.9 ms before spawning. The dedicated below-tripwire test passed.

## What I checked that was sound

The round-2 diff is exactly the four permitted files and is `+476/-67`; `package.json` is untouched. The build callers remove an earlier record before spawning, copy the parsed `out/status.json` stamp without recomputing it, and only attempt to write after exit 0. `hasCurrentBuild()` validates `ok`, local time, status shape, commit identity, non-empty output, and strict output-newer-than-input timestamps; `data/derived/`, `openspec/`, and other non-build-only inputs remain in the walk, while `public/` is the stated build-only exclusion.

The recorded-current fixture asserts zero build spawns; no-record, wrong-commit, stale, and empty fixtures assert a spawn. Mutation C proves the stale and empty assertions are not satisfied by presence alone. The targeted portability test passed 12/12, and the round-2 additions contain no model/provider/harness/runner-id token or change-directory citation. A raw scan found one historical `Anthropic` mention at the unchanged base line `scripts/verify-launch.mjs:821`; it is not introduced by round 2.

## Was the brief faithful to the task and the requirement?

Not completely. It correctly states that `40a5795` controls and the RESULT says that revision was used, but the authority commands at `.agent-brief.md:40-41` still point at superseded `6a8adba`. The amended floor, fixture, tripwire, and build-record requirements themselves were implemented against the correct revision.

## Did you read REVIEW.md?

No. I did not open it before, during, or after forming these findings and writing `REVIEW2.md`.

## What I ran

The frozen authority was read read-only with:

```text
git -C D:\AddictedToAI show 40a5795:openspec/changes/two-desks-work-orders-and-trains/tasks.md
git -C D:\AddictedToAI show 40a5795:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
```

The round-2 and branch context checks were:

```text
git diff --no-ext-diff --unified=3 f9bf386..46865e7 -- <each of the four permitted files>
git diff --stat main...HEAD
git diff --stat f9bf386..46865e7
git diff --check f9bf386..46865e7
```

The final scope output was:

```text
## stage0/a-gates-launch
?? .agent-brief.md
?? REVIEW.md
 loop/lib/gates.mjs                   | 187 ++++++++++++++++++++++++++++-------
 loop/tests/gates.test.mjs            |  84 +++++++++++++++-
 scripts/tests/verify-launch.test.mjs | 132 ++++++++++++++++++++++---
 scripts/verify-launch.mjs            | 140 +++++++++++++++++++++++---
 4 files changed, 476 insertions(+), 67 deletions(-)
```

The targeted green runs were:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\gates.test.mjs
6 pass, 0 fail

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
8 pass, 0 fail

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\job-gate-set.test.mjs
7 pass, 0 fail

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\portability.test.mjs
12 pass, 0 fail
```

The local clock command returned `2026-09-08 12:17:55`. I did not run `npm run build`, the full `npm test`, any verify script, or the Pulse.
