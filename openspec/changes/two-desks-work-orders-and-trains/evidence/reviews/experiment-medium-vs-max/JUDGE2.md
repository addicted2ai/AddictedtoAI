# Blind review of X and Y

## Findings — X

1. **The allow-list still permits a named path on a line containing a generic path.** In scripts/no-change-dir-refs.test.mjs:70, isAllowed tests the whole violating line against the allow-list regex. I appended openspec/changes/planted-named-change/specs/loop/spec.md to the existing generic line in loop/lib/specs.mjs. The check stayed green: TAP 1..3, tests 3, pass 3, fail 0. That is a direct violation of the brief's requirement that a named path in an allow-listed file fail.

2. **The recursive skip-tests behavior has no live arm.** Removing the { skipTests } argument from loop/tests/portability.test.mjs:39 left the targeted file green: TAP 1..13, pass 13, fail 0. A nested .test.mjs fixture containing a registered runner id could therefore change this behavior without a test proving the intended exclusion. The existing root-level lib/stamp.test.mjs use explains why the exclusion is likely intentional, but not why this recursive line is safe.

3. **The new numeric floor is not mutation-protected.** Mutating both floor assertions at loop/tests/portability.test.mjs:133 and :162 from >= MIN_SCANNED_FILES to >= 0 left all 13 tests green. The current floor does reject an actually empty target list, but the changed threshold itself has no arm.

## Findings — Y

1. **The allow-list still permits a named path on a line containing a generic path.** scripts/no-change-dir-refs.test.mjs:70 has the same whole-line behavior as X. The same planted path in loop/lib/specs.mjs passed: TAP 1..3, tests 3, pass 3, fail 0.

2. **The join alternatives are too broad.** At scripts/no-change-dir-refs.test.mjs:36 and loop/lib/specs.mjs:46, the regex permits a violation on a line containing a generic join expression. Appending the named path to scripts/check-spec-deltas.mjs:617 made Y pass all 3 tests; appending it to loop/lib/specs.mjs:75 also made Y pass all 3 tests. X rejected both mutations. A named path is still permitted in an allowed file, contrary to the brief.

3. **The recursive skip-tests behavior has no live arm.** Removing the { skipTests } argument from loop/tests/portability.test.mjs:37 left TAP 1..13 with pass 13 and fail 0.

4. **The floor is only a nonempty check.** The assertions at loop/tests/portability.test.mjs:130 and :149 are > 0, so a broken scan that reads one unrelated file still passes. Mutating either to >= 0 also stayed green (13/13). The required empty-list proof does work, but this is weaker than X's explicit two-file floor.

## The mutations I ran

All mutations were applied to disposable git-archive copies of the supplied trees, never to X or Y. T/P/F below means TAP tests/pass/fail. Every arm was restored immediately; the before and after hashes are listed below and matched.

X — 16 arms, 12 RED and 4 GREEN:

| Arm | Mutation and location | Real TAP result |
|---|---|---|
| 1 | Drop recursive skipTests propagation, portability.test.mjs:39 | GREEN, 1..13, T/P/F 13/13/0 |
| 2 | Return scanned: 0 from scan, portability.test.mjs:87 | RED, not ok 3/4/5, T/P/F 13/10/3 |
| 3 | Empty modelTargets, portability.test.mjs:91 | RED, not ok 3, T/P/F 13/12/1 |
| 4 | Omit lib from runnerTargets, portability.test.mjs:102 | RED, not ok 5 for lib, T/P/F 13/12/1 |
| 5 | Omit app from runnerTargets, portability.test.mjs:103 | RED, not ok 5 for app, T/P/F 13/12/1 |
| 6 | Omit tools from runnerTargets, portability.test.mjs:104 | RED, not ok 5 for tools, T/P/F 13/12/1 |
| 7 | Remove the per-root fixture assertion, portability.test.mjs:192-193 | RED, not ok 5, T/P/F 13/12/1 |
| 8 | Weaken runner floor, portability.test.mjs:162 | GREEN, 1..13, T/P/F 13/13/0 |
| 9 | Weaken model floor, portability.test.mjs:133 | GREEN, 1..13, T/P/F 13/13/0 |
| 10 | Make isAllowed always false, no-change-dir-refs.test.mjs:70 | RED, not ok 1, T/P/F 3/2/1 |
| 11 | Plant named path on a separate allow-listed line, specs.mjs:43 area | RED, not ok 1, T/P/F 3/2/1 |
| 12 | Plant named path on the generic backtick line, specs.mjs:43 | GREEN, 1..3, T/P/F 3/3/0 |
| 13 | Plant named path in check-spec-deltas.mjs:632's fixture file | RED, not ok 1, T/P/F 3/2/1 |
| 14 | Plant named path in check-spec-deltas.test.mjs:76's fixture file | RED, not ok 1, T/P/F 3/2/1 |
| 15 | Plant named path on the changesDir join line, check-spec-deltas.mjs:617 | RED, not ok 1, T/P/F 3/2/1 |
| 16 | Plant named path on the specs join line, specs.mjs:75 | RED, not ok 1, T/P/F 3/2/1 |

Y — 16 arms, 10 RED and 6 GREEN:

| Arm | Mutation and location | Real TAP result |
|---|---|---|
| 1 | Drop recursive skipTests propagation, portability.test.mjs:37 | GREEN, 1..13, T/P/F 13/13/0 |
| 2 | Return scanned: 0 from scan, portability.test.mjs:85 | RED, not ok 3/4/5, T/P/F 13/10/3 |
| 3 | Empty modelTargets, portability.test.mjs:89 | RED, not ok 3, T/P/F 13/12/1 |
| 4 | Omit lib from runnerTargets, portability.test.mjs:97 | RED, not ok 5, T/P/F 13/12/1 |
| 5 | Omit app from runnerTargets, portability.test.mjs:98 | RED, not ok 5, T/P/F 13/12/1 |
| 6 | Omit tools from runnerTargets, portability.test.mjs:99 | RED, not ok 5, T/P/F 13/12/1 |
| 7 | Remove the fixture hit assertion, portability.test.mjs:170-171 | RED, not ok 5, T/P/F 13/12/1 |
| 8 | Weaken runner floor, portability.test.mjs:149 | GREEN, 1..13, T/P/F 13/13/0 |
| 9 | Weaken model floor, portability.test.mjs:130 | GREEN, 1..13, T/P/F 13/13/0 |
| 10 | Make isAllowed always false, no-change-dir-refs.test.mjs:70 | RED, not ok 1, T/P/F 3/2/1 |
| 11 | Plant named path on a separate allow-listed line, specs.mjs:43 area | RED, not ok 1, T/P/F 3/2/1 |
| 12 | Plant named path on the generic backtick line, specs.mjs:43 | GREEN, 1..3, T/P/F 3/3/0 |
| 13 | Plant named path in check-spec-deltas.mjs:632's fixture file | RED, not ok 1, T/P/F 3/2/1 |
| 14 | Plant named path in check-spec-deltas.test.mjs:76's fixture file | RED, not ok 1, T/P/F 3/2/1 |
| 15 | Plant named path on the changesDir join line, check-spec-deltas.mjs:617 | GREEN, 1..3, T/P/F 3/3/0 |
| 16 | Plant named path on the specs join line, specs.mjs:75 | GREEN, 1..3, T/P/F 3/3/0 |

Restoration hash proof:

| Implementation | File | SHA-256 before = after |
|---|---|---|
| X | loop/tests/portability.test.mjs | 1d6f6ca2c93f8699d625e95a66016c25816883baab033b8b2ed2e3128acc4d0c |
| X | scripts/no-change-dir-refs.test.mjs | e4eeaaf3db4009687bffcb057172bd16ad60ac2ae229572a33fe6904280c0e32 |
| X | loop/lib/specs.mjs | bb082b836b3cc4e4e5e705bc4d6641db0bfb4a4d5f0f832021cbb9fb42773c7a |
| X | scripts/check-spec-deltas.mjs | 1d1e5e6029ff887ddca9fbc214c1f0b378db9e19266ec2e0a4561dcbb0f3eeef |
| X | scripts/check-spec-deltas.test.mjs | a8435a86d164cdcc859e47c790bf8c3af35d45e4647c5f1db7f729a19d115e1d |
| Y | loop/tests/portability.test.mjs | cef427be348007e680270362b9d06f0b4fa50d43b779df31294e71b0a90eb128 |
| Y | scripts/no-change-dir-refs.test.mjs | b26a974f0f4d54a367f566c9f509945b23070054a73b879c72bfbcfa42bd55d2 |
| Y | loop/lib/specs.mjs | bb082b836b3cc4e4e5e705bc4d6641db0bfb4a4d5f0f832021cbb9fb42773c7a |
| Y | scripts/check-spec-deltas.mjs | 1d1e5e6029ff887ddca9fbc214c1f0b378db9e19266ec2e0a4561dcbb0f3eeef |
| Y | scripts/check-spec-deltas.test.mjs | a8435a86d164cdcc859e47c790bf8c3af35d45e4647c5f1db7f729a19d115e1d |

The final exact runner-targets-empty probe also restored byte-identically. Its real output was:

    X runnerTargets-empty status=1 RED
    not ok 4 - no machinery path references a runner by id
    1..13
    # tests 13
    # pass 12
    # fail 1
    Y runnerTargets-empty status=1 RED
    not ok 4 - no machinery path references a runner by id
    1..13
    # tests 13
    # pass 12
    # fail 1

## The five red proofs

The empty-target floor is shown for both target lists because the brief requires the floor in both tests.

| Proof | X | Y |
|---|---|---|
| Runner id planted under lib | RED: not ok 5; 13/12/1 | RED: not ok 5; 13/12/1 |
| Runner id planted under app | RED: not ok 5; 13/12/1 | RED: not ok 5; 13/12/1 |
| Runner id planted under tools | RED: not ok 5; 13/12/1 | RED: not ok 5; 13/12/1 |
| Model targets emptied | RED: not ok 3; 13/12/1 | RED: not ok 3; 13/12/1 |
| Runner targets emptied | RED: not ok 4; 13/12/1 | RED: not ok 4; 13/12/1 |
| Named path planted on a separate line in an allow-listed fixture | RED: not ok 1; 3/2/1 | RED: not ok 1; 3/2/1 |

All six rows were restored immediately and their file hashes returned to the values above. The first three arms failed specifically with the root named in the assertion message. The separate-line named-path arm failed the first no-change-dir-refs test.

## Which better meets the brief

**State X.** X still has the shared line-level allow-list hole and two unarmed threshold/recursion mutations, so it is not fully correct. It is nevertheless better: its allow-list rejects named paths added to generic join lines, its floor is an explicit two-file minimum, and its fixture test asserts each new root independently. Y additionally allows named paths on both generic join forms and uses only a one-file floor.

## What I ran

Read-only inputs:

    Get-Content -Raw -LiteralPath C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/d005b682-58b5-4330-b9ab-4eac8f7af78d/scratchpad/f6-exp-brief.md
    Get-Content -Raw -LiteralPath C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/d005b682-58b5-4330-b9ab-4eac8f7af78d/scratchpad/f6-exp-diff-X-judge2.diff
    Get-Content -Raw -LiteralPath C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/d005b682-58b5-4330-b9ab-4eac8f7af78d/scratchpad/f6-exp-diff-Y-judge2.diff

Clean targeted runs, all with TAP:

    node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-exp-max/loop/tests/portability.test.mjs
    1..13, # tests 13, # pass 13, # fail 0

    node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-exp-max/scripts/no-change-dir-refs.test.mjs
    1..3, # tests 3, # pass 3, # fail 0

    node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-exp-medium/loop/tests/portability.test.mjs
    1..13, # tests 13, # pass 13, # fail 0

    node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-exp-medium/scripts/no-change-dir-refs.test.mjs
    1..3, # tests 3, # pass 3, # fail 0

Mutation runs:

    node ./f6-review-probe.mjs
    OUTPUT_PATH=C:/Users/BadBitch/AppData/Local/Temp/f6-review-mutation-output-29952.txt

    node ./f6-floor-probe.mjs
    X runnerTargets-empty status=1 RED; 1..13; # tests 13; # pass 12; # fail 1
    Y runnerTargets-empty status=1 RED; 1..13; # tests 13; # pass 12; # fail 1

All three temporary probe files were deleted after use. The successful disposable mutation roots were removed by the probes; one failed intermediate root, f6-review-mutations-37984, remains in TEMP. An explicit cleanup command for the six temporary mutation-output logs was blocked by policy; I did not route around that refusal. The supplied X and Y trees were never written: both retained only their pre-existing untracked .agent-brief.md, with no tracked changes.

Other limits observed: no npm test, npm run build, verify-* script, Pulse, commit, merge, push, or GitHub CLI command was run.
