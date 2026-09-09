# Stage 0 packet B2 — round 1 — VERDICT: revise

## Sealing

I opened only the current author report, `RESULT1.md`, and the current
`.agent-brief.md`. No earlier `REVIEW*.md` or earlier-round `RESULT*.md` file
was present or opened.

## Findings

1. **The new reviewer-record template contract has no test arm.**
   `loop/lib/review.mjs:719-724` is the reviewer-facing `cites:` instruction,
   including exact trimming/case rules, all-capability constitution and pending
   delta scope, and its feed into revision excerpts. The only relevant test,
   `loop/tests/review.test.mjs:172-188`, does not assert any of that new text.
   I mutated `# cites:` to `# wrong-cites:` and its targeted test remained
   green (`# tests 1`, `# pass 1`, `# fail 0`). This leaves a changed,
   load-bearing line unprotected, contrary to task 10(v) and the review rule
   that every changed behavioral line have a red arm.

   **CLASS — reviewer-facing record-schema/template contract.** Add an
   assertion for the commented `cites:` line and its scope/feed wording, so a
   future removal or narrowing of the instructions fails the review tests.

2. **The empty-citation test does not enforce the required byte-identical
   excerpt call.** `loop/lib/brief.mjs:781` correctly uses
   `{ maxChars: BRIEF_EXCERPT_MAX_CHARS, subjects: [], pendingRoot: ctx.pendingRoot }`,
   but `loop/tests/brief.test.mjs:138-150` compares only the resulting heading
   sets. I mutated `subjects: []` to `subjects: ['pulse']`; because `pulse` is
   already governing for `repair`, the test stayed green (`# tests 1`,
   `# pass 1`, `# fail 0`). That wrong call violates task 11(iii) while
   passing the current test.

   **CLASS — empty-list fallback argument contract.** Add a seam or direct
   call-observation assertion that pins the exact author options, including an
   empty subject list and the same pending root, rather than only asserting
   equivalent output for this fixture.

3. **`RESULT1.md` reports stale task-12 measurements.** At
   `RESULT1.md:230-231`, the report gives fixture revision/live revision sizes
   of 24,295/23,151 characters. The same test on the final tip `5fb9b2b`
   printed 24,306/23,162 (the 11-character difference is the committed
   `Revision pass (one only)` marker in that tip). The strict ordering still
   holds, but the report's paired numbers are not measurements of its claimed
   final implementation.

   **CLASS — completion evidence and measurement record.** Re-run the targeted
   measurement after the final commit and replace the stale paired numbers;
   keep the live values explicitly measurement-only.

## The mutations I ran

Every mutation was restored immediately. The restored tree matched these
baseline SHA-256 values exactly:

```text
loop/lib/verdict.mjs       8BBC6C85EB75A859BB8E7811174F75E76AF92ECE863D00831F8052170EBD4619
loop/lib/review.mjs        C71DF868483C018390D5045C198F0427438580584B6C4714AD1034C9C56DE798
loop/lib/specs.mjs         7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D
loop/lib/brief.mjs         FD917398929D388C9747A39E0941FF686CBD688B0F7BA47AE8CA726A34E3D430
loop/run.mjs               1E0B8769E6226D10921E928E1B10663B9841EA9468DAC06117E5689152B4E40F
loop/tests/review.test.mjs A4B110237F971CD12296A76F15981E97ABE33F3EA443DC7959D0C0F20F7E4CBF
loop/tests/brief.test.mjs  F72D507BE4ABE945B35249BD1ED73D5B38998E9F95385927C47D28C36EAA172E
```

| Arm | Mutation and command | Result; restored run |
|---|---|---|
| Task 12 Mutation A | `loop/tests/brief.test.mjs:93`: measured `(author + revision).length` instead of the revision alone. `node --test --test-reporter=tap --test-name-pattern='a cited revision is smaller' D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs` | **RED** — `# tests 1`, `# pass 0`, `# fail 1`. Restored: `# tests 1`, `# pass 1`, `# fail 0`. |
| Task 12 Mutation B | `loop/lib/brief.mjs:779-781`: ignored `cites` and used the governing-type excerpt options. `node --test --test-reporter=tap --test-name-pattern='cited revision|cited heading outside|uncited governing' D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs` | **RED** — `# tests 3`, `# pass 0`, `# fail 3`. Restored: `# tests 3`, `# pass 3`, `# fail 0`. |
| Task 10(vi) | `loop/lib/review.mjs:856`: replaced the unresolved-citation filter with `[]`. `node --test --test-reporter=tap --test-name-pattern='merge refuses unresolved cites' D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs` | **RED** on both verdicts — `# tests 2`, `# pass 0`, `# fail 2`; approve became `true` and revise returned `revise`. Restored: `# tests 2`, `# pass 2`, `# fail 0`. |
| Parser | `loop/lib/verdict.mjs:252`: returned `cites: []` instead of parsing front matter. `node --test --test-reporter=tap --test-name-pattern='parseVerdict reads a trimmed, deduplicated cites list' D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs` | **RED** — `# tests 1`, `# pass 0`, `# fail 1`. Restored: `# tests 1`, `# pass 1`, `# fail 0`. |
| Pending enumeration | `loop/lib/specs.mjs:167`: enumerated constitution sources only. `node --test --test-reporter=tap --test-name-pattern='a cites heading held by a pending amendment' D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs` | **RED** — `# tests 1`, `# pass 0`, `# fail 1`. Restored: `# tests 1`, `# pass 1`, `# fail 0`. |
| All-capability discovery | `loop/lib/specs.mjs:152-153`: restricted live capabilities to `review`. `node --test --test-reporter=tap --test-name-pattern='cited revision|cited heading outside|uncited governing' D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs` | **RED** — `# tests 3`, `# pass 1`, `# fail 2`. Restored: `# tests 3`, `# pass 3`, `# fail 0`. |
| Heading filter | `loop/lib/specs.mjs:331`: forced `headingFilter = false`. `node --test --test-reporter=tap --test-name-pattern='cited revision|cited heading outside|uncited governing' D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs` | **RED** — `# tests 3`, `# pass 0`, `# fail 3`. Restored: `# tests 3`, `# pass 3`, `# fail 0`. |
| Shared acceptance helper | `loop/lib/brief.mjs:267`: replaced the generated gate list with an empty list. `node --test --test-reporter=tap --test-name-pattern='one6 every brief' D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief-acceptance.test.mjs` | **RED** — `# tests 1`, `# pass 0`, `# fail 1`. Restored: `# tests 1`, `# pass 1`, `# fail 0`. |
| Author assembler call | `loop/lib/brief.mjs:706`: called the shared helper with an unknown type. Same `one6 every brief` command. | **RED** — `# tests 1`, `# pass 0`, `# fail 1`. Restored: `# tests 1`, `# pass 1`, `# fail 0`. |
| Revision renderer | `loop/lib/brief.mjs:743`: uppercased the rendered verdict. `node --test --test-reporter=tap --test-name-pattern='a cited revision is smaller' D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs` | **RED** — `# tests 1`, `# pass 0`, `# fail 1`. Restored: `# tests 1`, `# pass 1`, `# fail 0`. |
| Live call site | `loop/run.mjs:731`: called `assembleBrief` instead of `assembleRevisionBrief`. `node --test --test-reporter=tap --test-name-pattern='C46 the revision brief' D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs` | **RED** — `# tests 1`, `# pass 0`, `# fail 1`. Restored: `# tests 1`, `# pass 1`, `# fail 0`. |
| Verdict writer | `loop/lib/review.mjs:1389`: suppressed the emitted `cites:` block. `node --test --test-reporter=tap --test-name-pattern='a cites heading held by a pending amendment' D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs` | **RED** — `# tests 1`, `# pass 0`, `# fail 1`. Restored: `# tests 1`, `# pass 1`, `# fail 0`. |
| **Finding 1 arm** | `loop/lib/review.mjs:719`: changed `# cites:` to `# wrong-cites:`. `node --test --test-reporter=tap --test-name-pattern='the reviewer brief carries the closed reason list' D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs` | **GREEN — finding** — `# tests 1`, `# pass 1`, `# fail 0`. Restored: `# tests 1`, `# pass 1`, `# fail 0`. |
| **Finding 2 arm** | `loop/lib/brief.mjs:781`: changed empty `subjects: []` to redundant `subjects: ['pulse']`. `node --test --test-reporter=tap --test-name-pattern='an empty cites list uses the author brief requirement selection' D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs` | **GREEN — finding** — `# tests 1`, `# pass 1`, `# fail 0`. Restored: `# tests 1`, `# pass 1`, `# fail 0`. |

The `REISSUE_CODES` addition at `loop/lib/review.mjs:173` is pinned by the
known stale exact-list test outside the author’s permitted list, so it cannot
produce a valid restored-green mutation on this packet: the correct tree is
already red there. The stale pin is attributed to the brief below, not to the
author.

## The mutation table, judged

The merge-base diff is exactly the seven permitted tracked code/test paths:
`loop/lib/brief.mjs`, `loop/lib/review.mjs`, `loop/lib/specs.mjs`,
`loop/lib/verdict.mjs`, `loop/run.mjs`, `loop/tests/brief.test.mjs`, and
`loop/tests/review.test.mjs` (523 insertions, 53 deletions). The red arms cover
the parser, heading enumeration, heading-filter path, shared acceptance helper,
both assemblers, writer, merge gate, and live run call site. The two green
mutations are plausible regressions in reviewer-facing instructions and the
empty-list argument contract; they are the two findings above. All red runs
were actually executed with TAP counts, not inferred from exit status. Every
mutation was restored and every affected tracked file returned to its exact
baseline hash.

## What I checked that was sound

- The authority delta requires structured `cites:` headings, exact trimmed
  membership, all live capabilities plus unarchived deltas, refusal before the
  verdict branch, and the revision excerpt feed. The implementation matches
  those requirements.
- `parseVerdict` reads `cites` from front matter only, handles scalar/list,
  trims, drops empty entries, deduplicates, and returns `[]` when absent.
- `requirementHeadings` calls `specSources` and the existing
  `requirementSections`; there is no second `### Requirement:` parser. A direct
  probe confirmed that an outside-capability constitution heading and an
  outside-capability pending heading both approve, while an unresolved revise
  returns `cites-unresolved`.
- `excerptsFor`’s non-empty heading path uses exact heading membership across
  every live capability, keeps constitution/pending ordering and existing
  budget/cut behavior, and the existing excerpt-budget tests remained green.
- The empty-citation implementation currently passes the exact author options
  `{maxChars, subjects: [], pendingRoot}`; the issue is that the test does not
  distinguish that exact call from an output-equivalent redundant subject.
- The acceptance-check section is one helper called by both assemblers, and the
  revision site passes the reviewer’s measured `diffText`, not `briefText`.
- The diff is narrow and has no tracked scope additions. `git diff --check`
  was clean.
- The machinery/property enforcement run was green: 22 tests, 22 passed,
  0 failed. It covered the no model/provider/harness/runner-id rule, no
  unarchived-change-directory references, and local dates.
- The targeted implementation group was green: 60 tests, 60 passed, 0
  failed. It included `review.test.mjs`, the new `brief.test.mjs`, and
  `brief-excerpt-budget.test.mjs`.

## Was the brief faithful to the tasks and the requirements?

The quoted requirement and task text in the brief was faithful, and the author
correctly implemented the specified seven-file code/test scope. The file list
was not faithful to the closure of the change: adding `cites-unresolved` to
`REISSUE_CODES` necessarily invalidates
`loop/tests/review-blog-bar.test.mjs:269-280`, whose exact seven-entry list was
outside that list. The targeted run reproduced exactly that known red:
44 tests, 43 passed, 1 failed. The architect’s disposition is to update that
pin and sweep the class in round 2; I do not count it as an author finding,
because the author followed the wrong file list and reported the red honestly.
No other exact `REISSUE_CODES` pin, old revision-brief wording pin, or
`cites:`-template pin was found by the source sweep. `loop/tests/corrections.test.mjs:171`
checks only `corrections-malformed` and is unaffected.

The author’s final full-suite report is on tip `5fb9b2b` and records 1,763
tests, 1,762 passed, 1 failed. I did not rerun the full suite, build, verify
scripts, Pulse, or Desk, per the packet’s hard limits.

## What I ran

Read-only authority and scope checks:

```text
git -C D:\AddictedToAI show de400f7:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
git -C D:\AddictedToAI show de400f7:openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md
git status --short --branch
git diff --stat de400f7..HEAD
git diff --name-status de400f7..HEAD
git diff --check de400f7..HEAD
```

The status showed branch `stage0/b2-cited-revision` at `5fb9b2b`, merge base
`de400f7`, exactly seven permitted tracked paths, and only the expected
untracked `.agent-brief.md` and `RESULT1.md`.

Targeted implementation and property commands:

```text
node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief-excerpt-budget.test.mjs
# tests 60
# pass 60
# fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\portability.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\scripts\no-change-dir-refs.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\scripts\local-dates.test.mjs
# tests 22
# pass 22
# fail 0

node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review-blog-bar.test.mjs
# tests 44
# pass 43
# fail 1
```

The green targeted run printed the final-tip measurements:

```text
# fixture brief sizes; author_chars=34483; revision_chars=24306; difference=10177
# live brief measurement; type=repair; author_chars=27146; revision_chars=23162; difference=3984
```

The source scans were:

```text
rg -n "parseVerdict\(" loop/lib
rg -n "matter\(" loop/lib
rg -n "cites" loop/lib loop/run.mjs
```

They showed one verdict-record parser, `loop/lib/verdict.mjs:231`, with
`carry.mjs` and `review.mjs` consuming `parseVerdict`; the other production
`matter()` calls are proposal parsing. No dedicated automated assertion for
the one-parser property exists; it was checked by this source scan and by the
single-parser implementation structure.

The outside-capability probe printed:

```text
outside constitution approve=ok; outside pending approve=ok; unresolved revise=cites-unresolved
```

The probe was `D:\addictedtoai-worktrees\fleet6-stage0-B2\.job\outside-cites-probe.mjs`; it was deleted after the run. The only refused call was
`Remove-Item -LiteralPath '.job' -Force`, rejected by policy while removing the
now-empty scratch directory; I did not route around it. No forbidden full
suite, build, verify script, Pulse, Desk, commit, merge, push, or beads status
mutation was run.
