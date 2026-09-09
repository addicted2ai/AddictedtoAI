# Packet B2 — cited revision repair, round 2

## 1. Commits

Command: `git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 log --oneline main..HEAD`

```text
6502b98 Pin complete cites template guidance
9630614 Harden cited revision brief contracts
5fb9b2b Preserve revision pass marker
a4c3a8c Implement cited revision briefs
```

## 2. Findings, each with its class and every instance fixed

### Finding 1 — reviewer-facing record-template contract

Class: the commented `cites:` contract in the reviewer-facing verdict-record
template must be armed against removal or narrowing.

Fixed instance: `loop/tests/review.test.mjs:188-194` now asserts the exact
commented `cites:` template line, the trimmed/exact/case-sensitive and
`(preamble)` rule, the all-capability constitution plus every unarchived delta
scope, the revision-excerpt feed wording, and the final omit-field guidance.
The source contract remains at
`loop/lib/review.mjs:719-724`.

Sweep: the only other `assembleReviewBrief` callers are
`loop/tests/carry.test.mjs`, `loop/tests/brief-subject.test.mjs`, and
`loop/tests/review-blog-bar.test.mjs`; each exercises a different review
contract and does not pin the verdict-record template text. No second template
copy or exact template snapshot was found.

### Finding 2 — empty-list fallback argument contract

Class: the empty `cites` fallback must pass the author’s excerpt arguments,
not merely produce an equivalent heading set in the current fixture.

Fixed instances: `loop/lib/brief.mjs:669` and `:775` give both assemblers the
same optional seam, `excerptFn = excerptsFor`; the calls are at `:676` and
`:782`. Existing production callers pass nothing, so both default to the real
function. `loop/tests/brief.test.mjs:57-70` records each injected call’s
options, and `:156-174` deep-compares the empty-cites revision options with the
author options while separately asserting `subjects: []`, `maxChars`, and
`pendingRoot`; the existing heading-set assertion remains at `:174`.

The seam signature is:

```text
assembleBrief(ctx, args, excerptFn = excerptsFor)
assembleRevisionBrief(ctx, args, excerptFn = excerptsFor)
```

Sweep: these are the only two assembler calls to `excerptsFor` in
`loop/lib/brief.mjs`. The direct `excerptsFor` tests in
`loop/tests/brief-excerpt-budget.test.mjs` pin the unchanged return fields
`text`, `truncated`, and `chars`; they need no change. The other references are
direct behavior checks or comments, not another empty-list argument contract.

### Finding 3 — completion evidence must describe the final tip

Class: paired measurements must be taken after the last commit they claim to
measure.

Fixed instance: no production line needed changing. The final measurements in
section 5 were run on committed tip `6502b98`, after the round-2 commits, and
the live values are explicitly measurement-only. The temporary measurement
script was removed after the run; no extra tracked file was created.

Sweep: the stale pair existed only in the round-1 report. No second completion
measurement record or source assertion was found in the permitted files.

### Exact-pin class — `REISSUE_CODES`

Fixed instance: `loop/tests/review-blog-bar.test.mjs:269-277` keeps the exact
list assertion and adds `cites-unresolved` in its natural position with a
task 10(iv) comment.

Sweep list:

- `REISSUE_CODES`: the exact list pin above was the only one; fixed.
- `DIFF_REFUSAL_CODES`: only the declaration and dynamic membership predicate
  in `loop/lib/review.mjs` were found; no exact-list test or snapshot exists.
- Verdict-record template text: the sole behavioral pin is now the strengthened
  assertion in `loop/tests/review.test.mjs:188-194`; other brief callers do not
  duplicate it.
- Revision brief wording/section order: `loop/tests/review.test.mjs:365-373`
  pins the verdict, acceptance-checks, diff section, and absence of the author
  outcome; `loop/tests/brief.test.mjs:102-174` pins cited/uncited heading
  selection and the empty-list heading set. Both remain valid and needed no
  additional edit.
- `excerptsFor` return shape: `loop/tests/brief-excerpt-budget.test.mjs`
  checks `text`, `truncated`, and `chars` across its budget cases. The return
  shape did not change, so those pins remain unchanged.

## 3. Tests run

Initial targeted iteration (expected temporary failure while the new recorder
import and wrapped template assertion were being corrected):

```text
node --test 'D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs' 'D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs' 'D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief-excerpt-budget.test.mjs' 'D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review-blog-bar.test.mjs'
ℹ tests 104
ℹ suites 0
ℹ pass 98
ℹ fail 6
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 111346.4609
```

Corrected targeted group:

```text
node --test 'D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs' 'D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs' 'D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief-excerpt-budget.test.mjs' 'D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review-blog-bar.test.mjs'
ℹ tests 104
ℹ suites 0
ℹ pass 104
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 106206.0055
```

Naming and change-reference enforcement:

```text
node --test 'D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\portability.test.mjs' 'D:\addictedtoai-worktrees\fleet6-stage0-B2\scripts\no-change-dir-refs.test.mjs'
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 751.7731
```

Mutation commands and focused restore checks are also recorded in section 4.
Their focused-test last lines were:

```text
template key renamed — red:
# tests 1
# pass 0
# fail 1
# duration_ms 876.991

template key restored — green:
# tests 1
# pass 1
# fail 0
# duration_ms 881.144

scope sentence deleted — red:
# tests 1
# pass 0
# fail 1
# duration_ms 870.706

scope sentence restored — green:
# tests 1
# pass 1
# fail 0
# duration_ms 874.175

empty fallback subjects changed — red:
# tests 1
# pass 0
# fail 1
# duration_ms 838.865

empty fallback restored — green:
# tests 1
# pass 1
# fail 0
# duration_ms 838.865

seven-entry exact pin — red:
# tests 1
# pass 0
# fail 1
# duration_ms 209.234

exact pin restored — green:
# tests 1
# pass 1
# fail 0
# duration_ms 211.814

final omit-field guidance deleted — red:
# tests 1
# pass 0
# fail 1
# duration_ms 887.57

final omit-field guidance restored — green:
# tests 1
# pass 1
# fail 0
# duration_ms 878.708

complete template arm after the added omit-field assertions — green:
node --test --test-reporter=tap --test-name-pattern="the reviewer brief carries the closed reason list" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs
# tests 1
# pass 1
# fail 0
# duration_ms 878.708
```

The first committed-tip suite was run after `9630614`, before the final
template-only assertion commit:

```text
npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-B2 test
ℹ tests 1763
ℹ suites 0
ℹ pass 1763
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 430972.1485
wall_ms=431669; exit=0
```

Final committed-tip full suite, run once after final commit `6502b98` with the
required 600-second allowance:

```text
npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-B2 test
ℹ tests 1763
ℹ suites 0
ℹ pass 1763
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 431458.4528
wall_ms=432172; exit=0
```

## 4. Mutation table

| Finding | Mutation performed | Test command | Red result | Restored result |
|---|---|---|---|---|
| 1 — template contract | `# cites:` → `# wrong-cites:`; deleted the trimmed/exact scope sentence; deleted the final omit-field sentence | `node --test --test-reporter=tap --test-name-pattern="the reviewer brief carries the closed reason list" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs` | 1 test, 0 pass, 1 fail for each arm | 1 test, 1 pass, 0 fail for each arm |
| 2 — empty-list arguments | `subjects: []` → `subjects: ['pulse']` in the revision fallback | `node --test --test-reporter=tap --test-name-pattern="an empty cites list uses the author brief requirement selection" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs` | 1 test, 0 pass, 1 fail; the deep option comparison observed `['pulse']` vs `[]` | 1 test, 1 pass, 0 fail |
| 3 — final-tip evidence | Not an executable behavior mutation: this finding concerns report provenance, not code behavior. A red/green code arm does not exist; the repair was a post-commit measurement on `6502b98`. | N/A (report-only) | N/A by design | Final-tip pair is recorded in section 5 |
| Exact `REISSUE_CODES` pin | Removed `cites-unresolved`, returning the pinned list to seven entries | `node --test --test-reporter=tap --test-name-pattern="the re-issue refusals" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review-blog-bar.test.mjs` | 1 test, 0 pass, 1 fail | 1 test, 1 pass, 0 fail |

## 5. Paired numbers

All pairs below were measured after the last commit, on final tip `6502b98`, by
the standalone measurement run. The fixture and live output lines are quoted
verbatim:

```text
node D:\addictedtoai-worktrees\fleet6-stage0-B2\.job\final-measure.mjs
fixture brief sizes; author_chars=34483; revision_chars=24306; difference=10177
live brief measurement; type=repair; author_chars=27146; revision_chars=23162; difference=3984
```

The fixture revision is strictly smaller. The live values are measurement only,
not assertions.

## 6. Blocked or refused calls

none

## 7. Findings not fixed

none
