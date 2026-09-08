# Stage 0 packet A round 4 — VERDICT: revise

Review timestamp from the machine's local clock: 2026-09-08 13:48:17.

## Findings

1. **The tests do not prove that either spawner removes the old record before spawning.** Locations: loop/lib/gates.mjs:460, scripts/verify-launch.mjs:984, loop/tests/gates.test.mjs:127-149 and :165-178, and scripts/tests/verify-launch.test.mjs:177-207. Task 3 requires both spawners to remove any earlier record *before* the child starts. The production lines are present, but the tests only inspect the final state after the spawn returns. I deleted the launch removal at scripts/verify-launch.mjs:984; all 10 launch tests stayed green. I deleted the gate removal at loop/lib/gates.mjs:460; all 7 gate tests stayed green. Post-spawn cleanup or overwrite masks both defects. A concurrent launch check could therefore observe and reuse the stale success record while the new build is still running, and the suite would not detect the violation. Add an assertion inside each injected spawn callback (with a seeded old record) that the record is already absent at spawn time, while retaining the final absence assertion. The two spawners need separate arms so removing either line goes red.

No other MUST-FIX finding was found.

## The mutations I re-ran myself

The round-4 script baseline hash was:

~~~
scripts/verify-launch.mjs
80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
~~~

Mutation D — changed scripts/verify-launch.mjs:287 from built.newest > inputs.newest to built.newest >= inputs.newest.

~~~
RED: tests 10, pass 9, fail 1
AssertionError: equal mtimes are not current
at scripts/tests/verify-launch.test.mjs:164:10
~~~

Exactly one arm moved. After restoration, the test was green: 10 pass, 0 fail. The restored SHA-256 was 80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC, byte-identical to the baseline.

Mutation E — changed the same freshness return to inputs.files > 0 && built.files > 0, deleting the output-newer-than-input comparison.

~~~
RED: tests 10, pass 8, fail 2
AssertionError: a source newer than output defeats reuse
at scripts/tests/verify-launch.test.mjs:155:10
AssertionError: equal mtimes are not current
at scripts/tests/verify-launch.test.mjs:164:10
~~~

Exactly two arms moved: the protected stale-export fixture and the equal-mtime fixture. This agrees with the author's report. Restoration was green: 10 pass, 0 fail, with the same SHA-256 80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC.

Mirror mutation — changed scripts/verify-launch.mjs:1003 to enforce { build: { floorMs: 1 } } instead of the validated repository floors.

~~~
RED: tests 10, pass 9, fail 1
AssertionError: a below-floor build reports failure
at scripts/tests/verify-launch.test.mjs:204:10
~~~

Exactly one arm moved: the new mirror arm. Restoration was green: 10 pass, 0 fail, with the same SHA-256 80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC.

My own mutation 1 — deleted removeBuildSuccessRecord(root) at scripts/verify-launch.mjs:984, immediately before the injected build spawn.

~~~
GREEN: tests 10, pass 10, fail 0
~~~

Zero arms moved. The restored script hash was again 80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC.

My own mutation 2 — deleted if (script === 'build') removeBuildSuccessRecord(worktree) at loop/lib/gates.mjs:460.

~~~
GREEN: tests 7, pass 7, fail 0
~~~

Zero arms moved. The gate-file baseline and restored SHA-256 were both 0F3928004A1367BE818F6D7FD79D0E8E0546A18A53BD9AA5F91468DEE01A99FD.

## Every writer of the build success record

Sweep command:

~~~
rg -n --glob '*.mjs' 'writeBuildSuccessRecord|removeBuildSuccessRecord|BUILD_SUCCESS_RECORD|buildRecordPath|\.build-stamp\.json' loop lib pulse scripts app tools
~~~

The complete production matches were:

- loop/lib/gates.mjs:146 — the sole writer definition. Its writeFileSync is at :160-164; it accepts only script: 'build' and ok: true, and both callers supply the floor-enforced result.
- loop/lib/gates.mjs:460 — removal before the build-gate spawn; :637 — the sole build-gate call to the shared writer; :638 — removal after a non-OK result. These are record plumbing, not additional writers.
- scripts/verify-launch.mjs:92 — import of the shared writer; :984 — removal before its build spawn; :1004 — the sole launch call to the shared writer; :1005 — removal after a non-OK result. The private function at :267-268 only removes the record.
- loop/lib/gates.mjs:134-138 and scripts/verify-launch.mjs:185-186,241-242 — record names and paths; scripts/verify-launch.mjs:247 reads the record and :284 excludes it from the output mtime walk. None writes it.
- Fixture-only writes and reads: loop/tests/gates.test.mjs:124,162; scripts/tests/verify-launch.test.mjs:68,136,179,194. These seed, read, or name fixture records and are not production writers.
- There were no record matches under lib, pulse, app, or tools, and no other production writer in the swept paths.

The round-3 guarantee covers the gate path, and round 4 now covers the launch path as well: one exported writer at loop/lib/gates.mjs:146, with call sites at loop/lib/gates.mjs:637 and scripts/verify-launch.mjs:1004. The ordering assertion is the remaining coverage gap described in Finding 1.

## What I checked that was sound

- Read the frozen tasks and loop requirement from b189256, including the floor bullets, the reuse bullet, and the exact “both spawners” clause. Read the round-4 diff line by line and used main...HEAD for branch context.
- The round changes are limited to the four permitted files. package.json is untouched; git diff --check is clean.
- GATE_FLOORS carries calibration metadata, date, run count, stated 25% margin, and a cold-build note. validateFloorSet rejects invalid or sub-tripwire overrides. runGates uses repository floors for the real repository context and fixture floors for throwaway trees.
- Both production spawners remove the old record before spawning, floor-check the result, and invoke the one shared writer. A below-floor zero exit becomes ok: false and removes the record in both paths.
- hasCurrentBuild requires a valid success record, a matching commit, non-empty output, and strict output-newer-than-input freshness. The no-record, wrong-commit, stale, equal-mtime, and empty-output arms all exist.
- The mirror arm asserts both failed reporting and record absence. Mutation E protects the stale-export fixture independently from identity checking.
- Targeted gates, launch, job-gate-set, portability, zero-model, launch-voice, and gate-retry tests all passed in the restored tree.
- No concrete runner/provider/harness identifier or forbidden change-path reference was introduced in the four changed files. The portability and zero-model tests passed.

## Was the brief faithful to the task and the requirement?

Yes. I read it before forming findings. It correctly quoted the frozen “both” requirement, named the four-file scope, retained the protected stale fixture, and distinguished the old line anchors from the current tree. I treated its RESULT.md claims as hypotheses and independently reran the relevant tests and mutations. Its full-suite claim was not used as reviewer evidence because this sealed review forbids rerunning the full suite.

## Did you read REVIEW.md, REVIEW2.md or REVIEW3.md?

- REVIEW.md: no — never opened, before or after writing these findings.
- REVIEW2.md: no — never opened, before or after writing these findings.
- REVIEW3.md: no — never opened, before or after writing these findings.

## What I ran

Authoritative reads and diff context:

~~~
git -C D:\AddictedToAI show b189256:openspec/changes/two-desks-work-orders-and-trains/tasks.md
git -C D:\AddictedToAI show b189256:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff 317832b..ad087aa
git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --stat main...HEAD
~~~

Real scope output:

~~~
loop/lib/gates.mjs                   | 235 +++++++++++++++++++++++++++++++++--
loop/tests/gates.test.mjs            | 179 ++++++++++++++++++++++++++
scripts/tests/verify-launch.test.mjs | 222 +++++++++++++++++++++++++++++++++
scripts/verify-launch.mjs            | 234 ++++++++++++++++++++++++++++++----
4 files changed, 835 insertions(+), 35 deletions(-)
~~~

Restored targeted tests:

~~~
node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\gates.test.mjs
7 pass, 0 fail

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
10 pass, 0 fail

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\job-gate-set.test.mjs
7 pass, 0 fail

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\portability.test.mjs
12 pass, 0 fail

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\pulse\tests\zero-model.test.mjs
5 pass, 0 fail

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\verify-launch-voice-carry.test.mjs
10 pass, 0 fail

node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\gate-transport-retry.test.mjs
30 pass, 0 fail
~~~

The final tracked-tree check was:

~~~
git -C D:\addictedtoai-worktrees\fleet6-stage0-A status --short --branch
## stage0/a-gates-launch
?? .agent-brief.md
?? REVIEW.md
?? REVIEW2.md
?? REVIEW3.md
~~~

No npm run build, full npm test, production verify-* script, Pulse run, push, merge, or GitHub command was run.
