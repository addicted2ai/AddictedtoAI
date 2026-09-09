# Packet B2 — round 5 report

## 1. Commits

Command: `git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 log --oneline main..HEAD`

```text
e413ebe test: cover cited excerpt edge returns
7999203 test: pin revision brief tail
a5de24b test: arm cited revision behavior
6502b98 Pin complete cites template guidance
9630614 Harden cited revision brief contracts
5fb9b2b Preserve revision pass marker
a4c3a8c Implement cited revision briefs
```

No commit was made in this round. The packet stopped when the preserved
Finding 3 arm was red against the restored, unmutated production code.

## 2. Findings, each with its arm

### Finding 1 — both cited headings from one constitution are present

- Arm: `loop/tests/brief.test.mjs:241-263`, `heading excerpts charge the
  separator between cited sections in one constitution`. At the exact
  marker-only cap it parses the ordered quoted headings from the CUT markers.
- Arm: `loop/tests/brief.test.mjs:267-277`, `heading-mode carries all cited
  constitution sections at an ample cap`. At `maxChars: 20000` it asserts the
  ordered `### Requirement:` heading set.
- Named mutation: `loop/lib/specs.mjs:355-357`, constitution candidates
  changed to `.slice(0, 1)`.

### Finding 2 — the cap binds in heading mode

- Arm: `loop/tests/brief.test.mjs:279-321`, `heading-mode truncation tells the
  revision reader to open the full files`. It asserts source size, rendered
  size equality, and the cap invariant before checking truncation.
- Named mutation: `loop/lib/specs.mjs:421-429`, `floorOverhead` changed to
  `0`.

### Finding 3 — the revision brief section order

- Arm: `loop/tests/review.test.mjs:364-404`, `C46 the revision brief
  supersedes the stale figures it inherits`. It asserts Verdict, Acceptance
  checks, Diff, excerpts, Ground rules, and How to end in order.
- Named mutation: `loop/lib/brief.mjs:798-812`, the complete excerpts block
  moved before the Diff under revision block.

### Finding 4 — `(preamble)` is not a heading

- Arm: `loop/tests/review.test.mjs:789-802`, `merge refuses `(preamble)` cites
  on approve and revise`. It requires `cites-unresolved` for both verdicts.
- Named mutation: `loop/lib/specs.mjs:169`, the `(preamble)` exclusion removed
  from the live heading set.

## 3. The sweep

none this round; rounds 3's enumeration and REVIEW3's seven extra mutants
stand.

No additional sweep was run. The packet stop rule triggered on Finding 3's
current-code RED before its named mutation; Finding 4, enforcement, commit,
and final-suite work were not attempted.

## 4. Tests run

Baseline for the corrected Finding 1 arms and the existing Finding 2 arm:

```text
node --test --test-reporter=tap --test-name-pattern="heading excerpts charge|heading-mode carries all cited constitution sections|heading-mode truncation" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs
1..3
# tests 3
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2147.6333
```

Finding 1, exact-cap arm, with the constitution-candidate `.slice(0, 1)`
mutation:

```text
node --test --test-reporter=tap --test-name-pattern="heading excerpts charge" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs
1..1
# tests 1
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 780.5077
```

Finding 1, ample-cap arm, with the same mutation:

```text
node --test --test-reporter=tap --test-name-pattern="heading-mode carries all cited constitution sections" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs
1..1
# tests 1
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 786.1661
```

Finding 1 after restoration, both arms together:

```text
node --test --test-reporter=tap --test-name-pattern="heading excerpts charge|heading-mode carries all cited constitution sections" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs
1..2
# tests 2
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1499.449
```

Finding 2 with `floorOverhead` set to `0`:

```text
node --test --test-reporter=tap --test-name-pattern="heading-mode truncation" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs
1..1
# tests 1
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 803.9639
```

Finding 2 after restoration:

```text
node --test --test-reporter=tap --test-name-pattern="heading-mode truncation" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs
1..1
# tests 1
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 808.3493
```

Finding 3 with production restored before its named mutation:

```text
node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs
1..1
# tests 1
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 6623.6589
```

The Finding 3 arm’s failure was:

```text
error: '## Ground rules (non-negotiable) index 8737 must follow ## Relevant spec excerpts index 16168'
```

The required enforcement command was not run because the stop rule fired:

```text
node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\portability.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\scripts\no-change-dir-refs.test.mjs
not run: stopped on Finding 3 current-code RED
```

The required final committed-tip full-suite iteration was not run because no
commit was made and the same stop rule remained active:

```text
npm --prefix D:\addictedtoai-worktrees\fleet6-stage0-B2 test
not run: stopped on Finding 3 current-code RED
```

## 5. Mutation table

| Arm | Mutation | File and line | Command | Red counts | Restored counts |
|---|---|---|---|---|---|
| Finding 1 exact-cap arm | Constitution candidates → `.slice(0, 1)` | `loop/lib/specs.mjs:355-357`; arm `loop/tests/brief.test.mjs:241-263` | `node --test --test-reporter=tap --test-name-pattern="heading excerpts charge" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs` | `# tests 1; # pass 0; # fail 1` | Shared restoration run: `# tests 2; # pass 2; # fail 0` |
| Finding 1 ample-cap arm | Constitution candidates → `.slice(0, 1)` | `loop/lib/specs.mjs:355-357`; arm `loop/tests/brief.test.mjs:267-277` | `node --test --test-reporter=tap --test-name-pattern="heading-mode carries all cited constitution sections" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs` | `# tests 1; # pass 0; # fail 1` | Shared restoration run: `# tests 2; # pass 2; # fail 0` |
| Finding 2 | `floorOverhead` → `0` | `loop/lib/specs.mjs:421-429`; arm `loop/tests/brief.test.mjs:279-321` | `node --test --test-reporter=tap --test-name-pattern="heading-mode truncation" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs` | `# tests 1; # pass 0; # fail 1` | `# tests 1; # pass 1; # fail 0`; restored SHA-256 `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D` |
| Finding 3 | Move excerpts before Diff under revision | `loop/lib/brief.mjs:798-812`; arm `loop/tests/review.test.mjs:364-404` | `node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs` | Not run; the unmutated arm was already RED | Restored SHA-256 `7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D`; arm remained RED: `# tests 1; # pass 0; # fail 1` |
| Finding 4 | Include `(preamble)` in the live heading set | `loop/lib/specs.mjs:169`; arm `loop/tests/review.test.mjs:789-802` | Not run; mandated stop after Finding 3 | Not run |

## 6. Blocked or refused calls

none

## 7. Findings not fixed

Finding 3 is not fixed. Its preserved arm at
`loop/tests/review.test.mjs:379-392` is RED against the current production
code before the named mutation:

```text
not ok 1 - C46 the revision brief supersedes the stale figures it inherits
error: '## Ground rules (non-negotiable) index 8737 must follow ## Relevant spec excerpts index 16168'
1..1
# tests 1
# pass 0
# fail 1
```

The generated brief contains `## Ground rules (non-negotiable)` twice: at
offset 8737 inside the judged diff and at offset 17469 in the actual revision
tail. The arm uses the first `indexOf` result, so this RED does not establish a
production ordering defect; the arm was not rewritten because the packet says
to preserve it and stop. The restored `loop/lib/brief.mjs` hash is
`7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2`.

Finding 4 was not mutation-tested because the stop rule fired on Finding 3.
The enforcement checks, permitted-file commit, and final full-suite iteration
were likewise not run.
