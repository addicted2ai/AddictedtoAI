# Packet B2 — round 6 report

## 1. Commits

Command: `git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 log --oneline main..HEAD`

```text
5bc12ee test: arm cited revision boundaries
e413ebe test: cover cited excerpt edge returns
7999203 test: pin revision brief tail
a5de24b test: arm cited revision behavior
6502b98 Pin complete cites template guidance
9630614 Harden cited revision brief contracts
5fb9b2b Preserve revision pass marker
a4c3a8c Implement cited revision briefs
```

The new commit contains only `loop/tests/brief.test.mjs` and
`loop/tests/review.test.mjs`. The supplied round reports and review artifacts
remain untracked.

## 2. Findings, each with its arm

### Finding 1 — cited constitution sections are not silently omitted

- Arms: `loop/tests/brief.test.mjs:241-263`, `heading excerpts charge the
  separator between cited sections in one constitution`; and
  `loop/tests/brief.test.mjs:267-276`, `heading-mode carries all cited
  constitution sections at an ample cap`.
- Named mutation: `loop/lib/specs.mjs:355-357`, limit constitution candidates
  with `.slice(0, 1)`.
- Status: done in round 5; both arms and their named mutation are carried from
  that round and were not rerun as mutations here.

### Finding 2 — heading-mode truncation respects the advertised cap

- Arm: `loop/tests/brief.test.mjs:279-320`, `heading-mode truncation tells the
  revision reader to open the full files`.
- Named mutation: `loop/lib/specs.mjs:421-429`, replace the `floorOverhead`
  calculation with `0`.
- Status: done in round 5; the named mutation was not rerun here.

### Finding 3 — revision section order is measured outside fenced blocks

- Arm: `loop/tests/review.test.mjs:364-404`, `C46 the revision brief
  supersedes the stale figures it inherits`.
- Diagnosis and correction: the prior arm used `brief.indexOf(heading)` and
  found the ground-rules heading inside the fenced judged diff at offset 8,737.
  The arm now strips every fenced block at line 390 and checks the six section
  indexes at lines 391-396, in this order: Verdict, Acceptance checks, Diff
  under revision, Relevant spec excerpts, Ground rules, and How to end.
- Named mutation: `loop/lib/brief.mjs:798-812`, move the complete Relevant spec
  excerpts block before the Diff under revision block.

### Finding 4 — `(preamble)` is not a requirement heading

- Arm: `loop/tests/review.test.mjs:794-805`, `merge refuses `(preamble)` cites
  on approve and revise`.
- Named mutation: `loop/lib/specs.mjs:169`, remove the `(preamble)` exclusion
  from the live heading set.
- Status: the existing arm was run this round; both approve and revise paths
  refused with `cites-unresolved`.

## 3. The sweep

none this round; rounds 3's enumeration and REVIEW3's seven extra mutants stand.

No additional sweep or new mutant was run.

## 4. Tests run

The old finding-3 arm was first run against the unmutated production files to
diagnose the red:

```text
node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs
TAP version 13
# Subtest: C46 the revision brief supersedes the stale figures it inherits
not ok 1 - C46 the revision brief supersedes the stale figures it inherits
  error: '## Ground rules (non-negotiable) index 8737 must follow ## Relevant spec excerpts index 16168'
1..1
# tests 1
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 6618.2655
```

After correcting the arm to ignore fenced blocks:

```text
node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs
TAP version 13
# Subtest: C46 the revision brief supersedes the stale figures it inherits
ok 1 - C46 the revision brief supersedes the stale figures it inherits
1..1
# tests 1
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 6708.4809
```

Finding 3 named mutation, with the excerpt block moved before the diff:

```text
node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs
TAP version 13
# Subtest: C46 the revision brief supersedes the stale figures it inherits
not ok 1 - C46 the revision brief supersedes the stale figures it inherits
  error: '## Relevant spec excerpts index 2122 must follow ## Diff under revision index 2273'
1..1
# tests 1
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 6653.1569
```

Finding 3 after restoring `brief.mjs` to SHA-256
`7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2`:

```text
node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs
TAP version 13
# Subtest: C46 the revision brief supersedes the stale figures it inherits
ok 1 - C46 the revision brief supersedes the stale figures it inherits
1..1
# tests 1
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 6679.5828
```

Finding 4 named mutation, with the `(preamble)` exclusion removed:

```text
node --test --test-reporter=tap --test-name-pattern="preamble" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs
TAP version 13
# Subtest: merge refuses `(preamble)` cites on approve and revise
not ok 1 - merge refuses `(preamble)` cites on approve and revise
  error: |-
    Expected values to be strictly equal:
    true !== false
1..1
# tests 1
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 938.1952
```

Finding 4 after restoring `specs.mjs` to SHA-256
`7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`:

```text
node --test --test-reporter=tap --test-name-pattern="preamble" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs
TAP version 13
# Subtest: merge refuses `(preamble)` cites on approve and revise
ok 1 - merge refuses `(preamble)` cites on approve and revise
1..1
# tests 1
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 997.9627
```

Required targeted group:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief-excerpt-budget.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review-blog-bar.test.mjs
✔ zlq the merge writes `reviewed:` from the same measurement as `subject:` (704.9557ms)
✔ zlq with no merged tree to hash against, `reviewed:` is omitted, never guessed (675.8059ms)
✔ zlq the merge refuses a record whose `reviewed:` names a different set than it measured (683.9638ms)
ℹ tests 114
ℹ suites 0
ℹ pass 114
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 113455.3832
```

Naming and unarchived-change-directory enforcement:

```text
node --test D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\portability.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\scripts\no-change-dir-refs.test.mjs
✔ every allow-list entry has a reason and is still live (60.6869ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 746.7134
```

Required final full-suite iteration on committed tip `5bc12ee`:

```text
npm --prefix D:\addictedtoai-worktrees\fleet6-stage0-B2 test
ℹ tests 1773
ℹ suites 0
ℹ pass 1773
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 421420.7354
```

Observed wall time for that final iteration: approximately 423.8 seconds
(423800 ms), exit 0.

## 5. Mutation table

| Arm | Mutation | File and line | Command | RED result | Restored result |
|---|---|---|---|---|---|
| Finding 1a (done in round 5) | Constitution candidates → `.slice(0, 1)` | `loop/lib/specs.mjs:355-357`; arm `loop/tests/brief.test.mjs:241-263` | `node --test --test-reporter=tap --test-name-pattern="heading excerpts charge" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `# tests 1; # pass 0; # fail 1` | Shared round-5 restoration: `# tests 2; # pass 2; # fail 0` |
| Finding 1b (done in round 5) | Constitution candidates → `.slice(0, 1)` | `loop/lib/specs.mjs:355-357`; arm `loop/tests/brief.test.mjs:267-276` | `node --test --test-reporter=tap --test-name-pattern="heading-mode carries all cited constitution sections" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `# tests 1; # pass 0; # fail 1` | Shared round-5 restoration: `# tests 2; # pass 2; # fail 0` |
| Finding 2 (done in round 5) | `floorOverhead` → `0` | `loop/lib/specs.mjs:421-429`; arm `loop/tests/brief.test.mjs:279-320` | `node --test --test-reporter=tap --test-name-pattern="heading-mode truncation" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `# tests 1; # pass 0; # fail 1` | `# tests 1; # pass 1; # fail 0`; restored `specs.mjs` SHA-256 `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D` |
| Finding 3 | Move Relevant spec excerpts before Diff under revision | `loop/lib/brief.mjs:798-812`; arm `loop/tests/review.test.mjs:390-396` | `node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs` | `# tests 1; # pass 0; # fail 1`; `Relevant spec excerpts index 2122 must follow Diff under revision index 2273` | `# tests 1; # pass 1; # fail 0`; restored `brief.mjs` SHA-256 `7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2` |
| Finding 4 | Include `(preamble)` in the live heading set | `loop/lib/specs.mjs:169`; arm `loop/tests/review.test.mjs:794-805` | `node --test --test-reporter=tap --test-name-pattern="preamble" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs` | `# tests 1; # pass 0; # fail 1`; approve path returned `true` instead of `false` | `# tests 1; # pass 1; # fail 0`; restored `specs.mjs` SHA-256 `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D` |

## 6. Blocked or refused calls

none

## 7. Findings not fixed

none. The initial finding-3 red was an arm defect caused by matching a heading
inside the fenced judged diff. The corrected arm passed against the current
production files and failed on the named production mutation. Both temporary
production mutations were restored by hash, and no production file was
committed.
