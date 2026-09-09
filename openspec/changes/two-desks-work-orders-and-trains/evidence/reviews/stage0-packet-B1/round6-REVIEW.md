# Stage 0 packet B1 round 6 — DELTA REVIEW (NOT SEALED) — VERDICT: revise

## What kind of review this was

This is a DELTA review with `REVIEW5.md` disclosed. Rounds 1–5 were sealed
reviews; this round is not sealed. I did not open the earlier sealed verdicts.

## Findings

1. `loop/tests/brief-excerpt-budget.test.mjs:357`: the new failure message says
   the emitted length and cap, but no arm fails when the cap number in that
   message is wrong. Changing `cap 24000` to `cap 1` stayed green (`23/23/0`).
   Add an assertion that deliberately exercises the diagnostic and compares
   both numbers, rather than merely interpolating them into a message used by
   a passing assertion.

2. `loop/tests/brief-excerpt-budget.test.mjs:375-379`: the separator diagnostic
   has the same defect. Changing its message cap from `900` to `1` stayed green
   (`23/23/0`). Add a failing-path assertion that compares the emitted length
   and cap.

3. `RESULT6.md:1-49` is an added tracked file in the delta. The requested
   round-6 delta is only `loop/tests/brief-excerpt-budget.test.mjs`; this is
   outside scope and must be removed from the implementation delta (or handled
   by the process that owns review-result artifacts). Mutating its title had no
   executable arm: the targeted suite stayed `23/23/0`.

## REVIEW5's findings 1 and 3, verified

Finding 1: mutating `loop/lib/specs.mjs:346` to `const shortfall = 1;` made
subtest 20 red: `tests 23`, `pass 22`, `fail 1`. Restored. Separately adding 1
to `floorMinimumTotal` (the minimum) also made subtest 20 red: `23/22/1`.
The exact regex mutation from `shortfall=33` to `shortfall=34` likewise made
subtest 20 red: `23/22/1`. These prove both shortfall and minimum are pinned.

Finding 3: mutating `chars` to `0` made subtests 17 and 18 red: `23/21/2`.
Mutating the separator join to omit one newline made subtest 18 red:
`23/22/1`. But mutating the newly added message cap literals themselves made
the suite stay green: line 357 `23/23/0`, and lines 375-379 `23/23/0`.
Every mutation was restored. `loop/lib/specs.mjs` restored to SHA-256
`3c16894d3c0c208f18abfe8370350af37cf3ac98`; the test file restored to
`871176f6e05c1fbd49c99b61f654770d8a0928d3`; `RESULT6.md` restored to
`067c1cb837329b5ebb1c28d776245992c67a732a`.

## The diff as the list

The changed behavioral lines are the two diagnostic assertions and the exact
shortfall regex in `loop/tests/brief-excerpt-budget.test.mjs`. The line-357
message mutation stayed green (`23/23/0`); the line-375-379 message mutation
stayed green (`23/23/0`); the line-398 exact-value mutation went red
(`23/22/1`) and was restored. The production mutations required to verify
those arms were `chars=0` (`23/21/2`) and the shortened separator (`23/22/1`),
both restored. The added `RESULT6.md` is 49 changed prose lines, has no test
arm, and a representative title mutation stayed green (`23/23/0`); this is
the out-of-scope finding above, not a missing production behavior.

## The properties, and what I found enforced them

- The model/provider/harness/runner-id property is enforced by
  `loop/tests/portability.test.mjs`; targeted output was `tests 12`, `pass 12`,
  `fail 0`. Its source walk covers the required machinery directories and the
  runner registry is the single source of actual combinations.
- The change-directory reference property is enforced by
  `scripts/no-change-dir-refs.test.mjs`; targeted output was `tests 3`, `pass
  3`, `fail 0`. Its fixture-aware source walk covers `lib`, `loop`, `pulse`,
  `scripts`, `app`, and `tools`.
- The merge-base delta check showed `RESULT6.md` and
  `loop/tests/brief-excerpt-budget.test.mjs`, not only the required test file.
  `loop/tests/portability.test.mjs` was unchanged in `bcea121..HEAD`.
  `package.json` and `loop/run.mjs` were unchanged in the merge-base scope.

## Anything outside my scope

`RESULT6.md` is outside the stated round-6 implementation delta. I did not run
the claimed full suite because the review hard limit explicitly forbids it.

## What I checked that was sound

The HEAD check was `8930036`. The clean excerpt test had `tests 23`, `pass 23`,
`fail 0`. The exact shortfall and minimum values both fail under mutation;
the `chars` and separator behavior fail under their production mutations; and
all mutations were restored byte-identically by hash. The two standing
property tests passed with their full reported counts. The required
`portability.test.mjs` file, `package.json`, and `loop/run.mjs` were not changed
by this round's delta.

## Did you open REVIEW.md, REVIEW2.md, REVIEW3.md or REVIEW4.md?

- `REVIEW.md`: no
- `REVIEW2.md`: no
- `REVIEW3.md`: no
- `REVIEW4.md`: no

## What I ran

Exact targeted commands and reported output:

```text
node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs
tests 23; pass 23; fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs  [shortfall=1]
tests 23; pass 22; fail 1; not ok 20

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs  [wrong minimum]
tests 23; pass 22; fail 1; not ok 20

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs  [shortfall=34]
tests 23; pass 22; fail 1; not ok 20

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs  [chars=0]
tests 23; pass 21; fail 2; not ok 17; not ok 18

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs  [short separator]
tests 23; pass 22; fail 1; not ok 18

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs  [wrong message cap at 357]
tests 23; pass 23; fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs  [wrong message cap at 375]
tests 23; pass 23; fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs  [RESULT6 title mutation]
tests 23; pass 23; fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\portability.test.mjs
tests 12; pass 12; fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B1\scripts\no-change-dir-refs.test.mjs
tests 3; pass 3; fail 0
```

The authority was read read-only with the two requested `git -C D:\AddictedToAI
show 4d86826:...` commands. No probe file was created. No forbidden sealed
review file was opened, and no build, full suite, verify script, Pulse, push,
merge, or bead-close/update command was run.
