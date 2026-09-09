# Packet B2 — round 4 report

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

No commit was made in this round. The packet stopped when the first new arm was
red against the current, unmutated production code.

## 2. Findings, each with its arm

### Finding 1 — exact cited-heading set and order

Arm: `loop/tests/brief.test.mjs:254`, in `heading excerpts charge the
separator between cited sections in one constitution`. It asserts that the
rendered excerpt's `### Requirement:` heading set is exactly the two cited
headings in order.

Named mutation: `loop/lib/specs.mjs:355-357`, constitution candidates changed
to `.slice(0, 1)`.

### Finding 2 — heading-mode cap invariant

Arm: `loop/tests/brief.test.mjs:263-285`, in `heading-mode truncation tells the
revision reader to open the full files`. It asserts the source fixture is
larger than the cap, `excerpt.text.length === excerpt.chars`, and
`excerpt.chars <= options.maxChars`, with both compared values in the failure
messages.

Named mutation: `loop/lib/specs.mjs:421-429`, `floorOverhead` changed to `0`.

### Finding 3 — revision section order

Arm: `loop/tests/review.test.mjs:379-392`, in `C46 the revision brief
supersedes the stale figures it inherits`. It asserts the indexes of Verdict,
Acceptance checks, Diff under revision, Relevant spec excerpts, Ground rules,
and How to end are strictly increasing.

Named mutation: `loop/lib/brief.mjs:798-812`, the excerpts block moved before
the diff block.

### Finding 4 — `(preamble)` is not a heading

Arm: `loop/tests/review.test.mjs:789-803`, in `merge refuses \`(preamble)\`
cites on approve and revise`. It cites `(preamble)` on both verdict values and
requires `cites-unresolved`.

Named mutation: `loop/lib/specs.mjs:169`, the `(preamble)` exclusion removed
from the live heading set.

## 3. The sweep

none this round; rounds 3's enumeration and REVIEW3's seven extra mutants
stand.

The first new Finding 1 arm itself exposed a current-code failure, so the
packet's stop rule ended this round before any further sweep or named mutation
run.

## 4. Tests run

The first pattern invocation was rejected by Node's regular-expression parser:

```text
node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes|merge refuses \\(preamble\)\ cites" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs
TypeError [ERR_INVALID_ARG_VALUE]: The argument '--test-name-pattern' is an invalid regular expression. Invalid regular expression: /C46 the revision brief supersedes|merge refuses \\\\(preamble\)\ cites/: Unterminated group.
```

The corrected focused brief command ran the three relevant arms. Its last
lines were:

```text
node --test --test-reporter=tap --test-name-pattern="cited revision is smaller|heading excerpts charge|heading-mode truncation" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs
1..3
# tests 3
# pass 2
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2252.8597
```

The failing subtest output was:

```text
not ok 2 - heading excerpts charge the separator between cited sections in one constitution
  failureType: 'testCodeFailure'
  location: 'D:\\addictedtoai-worktrees\\fleet6-stage0-B2\\loop\\tests\\brief.test.mjs:236:1'
  error: |-
    the cited heading set is complete and ordered
    + actual - expected

    + []
    - [
    -   'Pulse cited requirement',
    -   'Pulse other requirement'
    - ]
```

No named mutation command, enforcement command, targeted full group, or final
full-suite iteration was run after this current-code failure, as required by
the stop rule.

## 5. Mutation table

| Arm | Mutation | File and line | Command | Red counts | Restored counts |
|---|---|---|---|---|---|
| Finding 1 | Constitution candidates → `.slice(0, 1)` | `loop/lib/specs.mjs:355-357`; arm `loop/tests/brief.test.mjs:254` | Not run; the unmutated arm was already red in the focused command above | Current-code baseline: `# tests 3; # pass 2; # fail 1` | Not reached; stopped before mutation |
| Finding 2 | `floorOverhead` → `0` | `loop/lib/specs.mjs:421-429`; arm `loop/tests/brief.test.mjs:263-285` | Not run; mandated stop after Finding 1 | Not run | Not run |
| Finding 3 | Move excerpts before diff | `loop/lib/brief.mjs:798-812`; arm `loop/tests/review.test.mjs:379-392` | Not run; mandated stop after Finding 1 | Not run | Not run |
| Finding 4 | Include `(preamble)` in the heading set | `loop/lib/specs.mjs:169`; arm `loop/tests/review.test.mjs:789-803` | Not run; mandated stop after Finding 1 | Not run | Not run |

## 6. Blocked or refused calls

none

## 7. Findings not fixed

Finding 1 is not fixed because its new arm went red against the current,
unmutated production code. The arm is at
`loop/tests/brief.test.mjs:254`; the current implementation rendered no
`### Requirement:` headings at the exact marker-only cap, while the arm
observed an empty set instead of the required ordered set:

```text
+ actual - expected

+ []
- [
-   'Pulse cited requirement',
-   'Pulse other requirement'
- ]
```

Per the packet instruction, this is reported as a production defect rather
than weakening the arm or changing a production file. Findings 2–4 were not
mutation-tested because the same stop rule ended the round. Production files
were not modified; their restored hashes remained those recorded by REVIEW3.
