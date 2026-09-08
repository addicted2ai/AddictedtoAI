# Stage 0 packet A round 5 — VERDICT: revise

## Findings

1. **The production-default coverage is incomplete for checkBuild.** Task 4(ii)
   states that every injected dependency has an arm that takes the production
   default. The helper at
   scripts/tests/verify-launch.test.mjs:77-104 injects root, spawn, now,
   localNow, floorSet, write, and report on its fixture arms. The direct arms at
   :124-134 and :228-249 inject most of those again. The only arm that omits
   now, localNow, and write is the failed-build arm at :211-219, and it does
   not assert duration, floor measurement, output, or the local-time writer.
   Every arm injects report, and no spawned arm uses the production spawnSync
   default.

   This is observable, not theoretical: replacing now = Date.now at
   scripts/verify-launch.mjs:949 with now = () => 0 left the launch suite green
   at 12 tests, 12 pass, 0 fail. Replacing report = record at :955 with
   report = () => null also left 12 tests green. In the first wrong world, a
   real successful build measures zero duration and fails or bypasses the floor
   decision; in the second, the production result can disappear from the
   launch result collection. The current suite cannot distinguish either
   world. Add meaningful default arms for the production-default dependencies
   (at minimum make the omitted now path assert its observed duration and
   exercise a successful localNow/writer path, and invoke the default report
   and spawn seams or explicitly narrow the task's rule). Keep the two existing
   decision-default arms; they are not a substitute for the broad rule.

## The mutations I re-ran myself

All temporary production edits were restored immediately. The restored
production SHA-256 values were:

- loop/lib/gates.mjs:
  0F3928004A1367BE818F6D7FD79D0E8E0546A18A53BD9AA5F91468DEE01A99FD
- scripts/verify-launch.mjs:
  80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC

The current Git blob ids also equal the corresponding ad087aa blob ids:
b09611c711cc1f815282f870dab15203f5c5d1ec for gates.mjs, and
1716cbda549ef91dab9209bb7288b7254acce4eb for verify-launch.mjs.

### Gate ordering mutation

Mutation: remove if (script === 'build') removeBuildSuccessRecord(worktree);
at loop/lib/gates.mjs:460.

Before and after SHA-256:

    before  0F3928004A1367BE818F6D7FD79D0E8E0546A18A53BD9AA5F91468DEE01A99FD
    after   0F3928004A1367BE818F6D7FD79D0E8E0546A18A53BD9AA5F91468DEE01A99FD

Real red output from node --test
D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\gates.test.mjs:

    ✖ the build gate removes an old record before the injected spawn
    ℹ tests 8
    ℹ pass 7
    ℹ fail 1
    AssertionError [ERR_ASSERTION]: the old success record is absent when the build child starts
    true !== false
    at spawn (file:///D:/addictedtoai-worktrees/fleet6-stage0-A/loop/tests/gates.test.mjs:136:14)

After restoration, real green output:

    ℹ tests 8
    ℹ pass 8
    ℹ fail 0

Exactly 1 of 8 gate arms moved.

### Mutation F

Mutation: remove removeBuildSuccessRecord(root) at
scripts/verify-launch.mjs:984.

Before and after SHA-256:

    before  80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
    after   80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC

Real red output from node --test
D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs:

    ✖ verify-launch removes an old record before the injected spawn
    ℹ tests 12
    ℹ pass 11
    ℹ fail 1
    AssertionError [ERR_ASSERTION]: the old success record is absent when the build child starts
    true !== false
    at spawn (file:///D:/addictedtoai-worktrees/fleet6-stage0-A/scripts/tests/verify-launch.test.mjs:240:14)

While F was active, the independent gate suite remained:

    ℹ tests 8
    ℹ pass 8
    ℹ fail 0

After restoration, the launch suite was:

    ℹ tests 12
    ℹ pass 12
    ℹ fail 0

Exactly 1 of 12 launch arms moved, and it was only the launch ordering arm.
The gate ordering arm did not move.

### Mutation G

Mutation: replace floorSet = GATE_FLOORS with floorSet = {} at
scripts/verify-launch.mjs:952.

Before and after SHA-256:

    before  80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
    after   80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC

Real red output:

    ✖ without an injected floor set, checkBuild applies the repository build floor
    ℹ tests 12
    ℹ pass 11
    ℹ fail 1
    AssertionError [ERR_ASSERTION]: the omitted floor set uses the repository build floor
    actual undefined
    expected 7300
    at TestContext.<anonymous> (file:///D:/addictedtoai-worktrees/fleet6-stage0-A/scripts/tests/verify-launch.test.mjs:139:10)

After restoration, real green output:

    ℹ tests 12
    ℹ pass 12
    ℹ fail 0

Exactly 1 of 12 launch arms moved.

### My independent mutation: now

Mutation: replace now = Date.now at scripts/verify-launch.mjs:949 with
now = () => 0.

The real result was green, not red:

    ℹ tests 12
    ℹ pass 12
    ℹ fail 0

The file was restored to the exact before hash:

    before  80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC
    after   80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC

No arm moved: 0 of 12.

### My independent mutation: report

Mutation: replace report = record at scripts/verify-launch.mjs:955 with
report = () => null.

Real result:

    ℹ tests 12
    ℹ pass 12
    ℹ fail 0

Before and after SHA-256 were both
80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC.
No arm moved: 0 of 12.

### Additional check of the sound isCurrent arm

Mutation: replace isCurrent = hasCurrentBuild at
scripts/verify-launch.mjs:951 with isCurrent = () => false.

Real red output:

    ✖ checkBuild uses hasCurrentBuild by default for a present recorded build
    ℹ tests 12
    ℹ pass 11
    ℹ fail 1
    AssertionError [ERR_ASSERTION]: reuse is proved by the spawn count
    1 !== 0
    at TestContext (file:///D:/addictedtoai-worktrees/fleet6-stage0-A/scripts/tests/verify-launch.test.mjs:112:10)

The restored launch suite was 12 tests, 12 pass, 0 fail, and the after hash
again equalled
80164640691704A38C185877C6C2D3CD3A702519374178FE4335029A52901ACC.
Exactly 1 of 12 arms moved.

## Every injected dependency of checkBuild

The signature is scripts/verify-launch.mjs:946-956.

| Option and production default | What governs it | What the suite does |
|---|---|---|
| root = ROOT | Tree whose output, inputs and record are checked | Every fixture passes root: dir; no production-root arm, for fixture isolation. |
| spawn = spawnSync | Actual build child invocation | Every spawned fixture passes an injected callback at helper :97 or direct arms :133, :215, :238; the default is not invoked. |
| now = Date.now | Start/end duration and floor measurement | Helper :91 and direct floor/order arms inject clocks; the failed arm omits it but has no timing assertion. The constant-clock mutation stayed green. |
| localNow = () => new Date() | Local timestamp in a successful record | Helper :95 always injects it; direct arms omit it only on paths that do not write a success record. No default success-writer path. |
| isCurrent = hasCurrentBuild | Reuse decision | runBuildCheck omits it when no override is supplied; the current/no-record/other-commit/stale/equal/empty matrix exercises it. The mutation moved only the reuse arm. |
| floorSet = GATE_FLOORS | Repository floor set | The direct arm at :124-146 omits both floorSet and floors, asserts GATE_FLOORS.build.floorMs (7300), and goes red under G. |
| floors | Optional alias selected before floorSet | No independent production default; it remains undefined in the tests. |
| write = out | Human-readable launch output | The helper and ordering/floor arms inject writers; the failed arm omits it but does not assert output. |
| report = record | Result collection and printed report | Every test arm injects report; the default is never called. The no-op report mutation stayed green. |

## What I checked that was sound

- I used the frozen authority only through the requested read-only
  git -C D:\AddictedToAI show 99de120:... commands. I did not use the
  superseded local openspec/ text.
- The round-5 diff is exactly two test files:
  loop/tests/gates.test.mjs and scripts/tests/verify-launch.test.mjs. The
  production files and package.json have no round-5 diff; git diff --check is
  clean.
- The gate ordering arm at loop/tests/gates.test.mjs:113-148 seeds a real old
  record, asserts absence inside its own injected spawn callback, and retains
  the final absence assertion.
- The launch ordering arm at scripts/tests/verify-launch.test.mjs:222-252 does
  the same in a separate arm. F proves that its removal is independent of the
  gate arm.
- The floor-default arm omits both floorSet and floors, reaches a below-floor
  spawn, checks the repository floor, and checks that no record remains. G
  proves that assertion is live.
- The isCurrent default arm and the existing current/no-record, other-commit,
  stale, equal-mtime and empty-output cases are live; the extra mutation
  confirms the reuse arm moves alone.
- The required fixture canary loop/tests/job-gate-set.test.mjs ran 7 tests with
  7 passes. The portability suite ran 12 tests with 12 passes.
- The record-writer sweep found one exported production writer,
  loop/lib/gates.mjs:146, and the two production call sites at :637 and
  scripts/verify-launch.mjs:1004; both spawners remove the earlier record
  before their spawn.
- No build, full npm test, verify-* script, or Pulse was run, as the
  sealed-review limits require. The author's full-suite claim was not treated
  as my evidence.

## Was the brief faithful to the task and the requirement?

Partly. It was faithful about the round-4 evidence gaps, the two separate
ordering arms, seeded records, retained final-absence assertions, the three
required mutation locations, and the two new decision-default arms. It was not
fully faithful to task 4(ii)'s broad “every injected dependency” rule: its
inventory names the other seams, but the suite does not behaviorally exercise
their production defaults, and the now and report green mutations prove that
gap. The report's statement that the production decision defaults are
reachable is true for floorSet and isCurrent, but incomplete as evidence for
the rule as written.

## Did you read REVIEW.md, REVIEW2.md, REVIEW3.md or REVIEW4.md?

- REVIEW.md — no; unopened before, during, and after writing these findings.
- REVIEW2.md — no; unopened before, during, and after writing these findings.
- REVIEW3.md — no; unopened before, during, and after writing these findings.
- REVIEW4.md — no; unopened before, during, and after writing these findings.

## What I ran

Authority and diff inspection:

    git -C D:\AddictedToAI show 99de120:openspec/changes/two-desks-work-orders-and-trains/tasks.md
    git -C D:\AddictedToAI show 99de120:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
    git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --unified=80 ad087aa..dc62d39 -- loop/tests/gates.test.mjs
    git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --unified=80 ad087aa..dc62d39 -- scripts/tests/verify-launch.test.mjs
    git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --unified=20 main...HEAD -- loop/lib/gates.mjs loop/tests/gates.test.mjs scripts/verify-launch.mjs scripts/tests/verify-launch.test.mjs
    git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --name-status ad087aa..dc62d39
    git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --check ad087aa..dc62d39

The frozen requirement and tasks matched the cited round-5 obligations. The
round-5 name-status output was exactly:

    M  loop/tests/gates.test.mjs
    M  scripts/tests/verify-launch.test.mjs

Production equality checks returned exit 0 for both:

    git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --exit-code ad087aa..dc62d39 -- loop/lib/gates.mjs
    git -C D:\addictedtoai-worktrees\fleet6-stage0-A diff --exit-code ad087aa..dc62d39 -- scripts/verify-launch.mjs

Targeted test commands and real final summaries:

    node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\gates.test.mjs
    ℹ tests 8
    ℹ pass 8
    ℹ fail 0

    node --test D:\addictedtoai-worktrees\fleet6-stage0-A\scripts\tests\verify-launch.test.mjs
    ℹ tests 12
    ℹ pass 12
    ℹ fail 0

    node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\job-gate-set.test.mjs
    ℹ tests 7
    ℹ pass 7
    ℹ fail 0

    node --test D:\addictedtoai-worktrees\fleet6-stage0-A\loop\tests\portability.test.mjs
    ℹ tests 12
    ℹ pass 12
    ℹ fail 0

The first parallel wrapper attempt timed out after 14.5 seconds with exit 124
while one 7-test process was still producing output. I reran all four exact
targeted commands individually with a 120-second command cap; the complete
outputs above are from those successful runs. No tracked file was changed by
that timeout.

Mutation commands were the same targeted node --test commands shown above,
with the named one-line production edit applied by apply_patch, then restored
by apply_patch. Every mutation section above records its real red or green
result, test count, before/after hash, and restored green run.

Final status after all restorations:

    ## stage0/a-gates-launch
    ?? .agent-brief.md
    ?? REVIEW.md
    ?? REVIEW2.md
    ?? REVIEW3.md
    ?? REVIEW4.md

No tracked production mutation remains.
