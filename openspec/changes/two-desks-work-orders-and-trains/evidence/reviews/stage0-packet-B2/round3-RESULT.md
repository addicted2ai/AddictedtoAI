# Packet B2 — cited revision repair, round 3

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

## 2. Findings, each with its arm

### Finding 1 — requirement headings span every capability

Arm: `loop/tests/review.test.mjs:724`, `cites from an outside capability resolve on approve and revise`.
The fixture adds an editorial constitution heading and an editorial pending-delta
heading, both outside machinery's governing capability list. An approve record
must return `ok: true`; a valid revise record remains non-approving with code
`revise`, rather than `cites-unresolved`, and retains both citations.

Named mutation: `for (const capability of liveSpecCapabilities(repoRoot))` →
`for (const capability of ['loop'])` in `loop/lib/specs.mjs:166`.

### Finding 2 — cited pending amendments are included

Arm: `loop/tests/brief.test.mjs:137`, `a cited pending amendment follows its
constitution text and keeps its own body`. The pending fixture begins with the
unique `PENDING AMENDMENT SENTINEL`; the test requires the constitution heading,
then the pending-amendment marker, then that sentinel.

Named mutation: the heading-mode delta branch's `candidates` assignment at
`loop/lib/specs.mjs:370-373` → `const candidates = []`.

### Finding 3 — internal cited-heading separators consume the cap

Arm: `loop/tests/brief.test.mjs:236`, `heading excerpts charge the separator
between cited sections in one constitution`. It cites two headings from one
constitution and derives the cap from the two cut-marker lengths, the chunk
heading, and both separators. The assertion compares only the values it names:
`cap=427`; under the mutation the failure was `text.length=429` and
`chars=429`.

Named mutation: `Math.max(0, item.candidates.length - 1) * '\n\n'.length` → `0`
in `loop/lib/specs.mjs:426`.

### Finding 4 — heading-mode truncation remains visible

Arm: `loop/tests/brief.test.mjs:261`, `heading-mode truncation tells the
revision reader to open the full files`. A 48,000-character cited requirement
is cut at the 24,000-character brief excerpt budget; the direct excerpt result
must be truncated and the assembled revision brief must carry the full-files
notice.

Named mutation: the heading-mode `truncated` expression at
`loop/lib/specs.mjs:501-502` → `const truncated = false`.

### Finding 5 — ordinary notes are not diff-refusal findings

Arm: `loop/tests/brief.test.mjs:291`, `revision verdict separates ordinary notes
from diff-measured refusal findings`. The ordinary revise case requires the note
under `Free-form notes` and no `Diff-measured refusal reason` block. A control
with an additional distinct finding requires that block.

Named mutation: `const notes = String(verdict.notes ?? '').trim()` →
`const notes = ''` in `loop/lib/brief.mjs:734`.

### Finding 6 — the running revision prompt receives findings and the judged diff

Arm: `loop/tests/review.test.mjs:417`, `C46 the revision prompt carries the
reviewer finding and the judged diff`. It runs the real loop with the mock
executor, reads the exact revision prompt path passed to the revision runner,
requires the ordinary reviewer note, the diff-measured refusal block, and the
distinctive deleted-file content from the judged diff.

Named mutations:

- `findings: ''` at `loop/run.mjs:741`.
- `diffText: ''` at `loop/run.mjs:742`.

## 3. The sweep

The production-side enumeration was taken with:
`git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 diff --unified=0 de400f7..HEAD -- loop/lib loop/run.mjs`.
The production files were not part of either round-3 commit.

- `loop/lib/brief.mjs:259-270` adds the shared acceptance renderer. The existing
  `C46 the revision brief supersedes the stale figures it inherits` arm and the
  reviewer-brief acceptance assertions reach it; the named mutation changing
  its heading to `Acceptance check` was red in REVIEW2.
- `loop/lib/brief.mjs:669,676` adds the author excerpt-function seam and routes
  the author call through it. `an empty cites list uses the author brief
  requirement selection` records both calls and deep-compares their options;
  the mutation changing the author `subjects: []` to `subjects: ['pulse']`
  was red in REVIEW2.
- `loop/lib/brief.mjs:680,706` removes the duplicate inline acceptance assembly
  and calls the shared renderer. The same C46 acceptance arm reaches the
  behavior; its acceptance-heading mutation was red in REVIEW2.
- `loop/lib/brief.mjs:732-734` extracts reasons and notes for the revision
  verdict. The Finding 5 arm at line 291 mutates the note extraction and goes
  red.
- `loop/lib/brief.mjs:735-739` partitions ordinary findings from an appended
  diff-measured finding. Finding 5 covers the ordinary/control distinction;
  Finding 6 at `review.test.mjs:417` reaches the appended refusal through the
  real run.
- `loop/lib/brief.mjs:741-753` renders verdict value, reasons, free-form notes,
  and the optional refusal section. The existing C46 section assertions and
  Finding 5 cover these branches.
- `loop/lib/brief.mjs:762-778` normalizes the cited list. The exact cited-set
  arm at `brief.test.mjs:110` catches the Task 12 Mutation B forced-empty
  selection; the parser arm at `review.test.mjs:687` catches trimming and
  duplicate collapse.
- `loop/lib/brief.mjs:779-782` selects empty-citation author options or exact
  cited-heading options and calls the excerpt function. The empty-list option
  arm at `brief.test.mjs:213` and the exact-heading arm at `:110` cover both
  branches.
- `loop/lib/brief.mjs:783-786` creates the missing-heading marker. The existing
  `a cited heading that cannot be found is named in a marker` arm at
  `brief.test.mjs:155` was red when the marker was disabled in REVIEW2.
- `loop/lib/brief.mjs:787-806` carries the judged diff in the fenced revision
  section. Finding 6 at `review.test.mjs:417` catches an empty `diffText`; the
  existing C46 arm also reaches the section and its ordering.
- `loop/lib/brief.mjs:810` emits the cut/full-files notice. Finding 4 at
  `brief.test.mjs:261` catches a false truncation signal.
- `loop/lib/brief.mjs:814-816` repeats ground rules and the result protocol at
  the end of a revision. The C46 arm at `review.test.mjs:364`, specifically its
  tail assertions at `:382-383`, requires both headings after the excerpt
  section; removing the appended tail was red.
- `loop/lib/review.mjs:37` imports the shared heading enumerator. Finding 1's
  outside-capability fixture reaches that import through `mergeGate`.
- `loop/lib/review.mjs:173` adds `cites-unresolved` to the re-issue code set.
  The exact `the re-issue refusals` pin in `review-blog-bar.test.mjs` and its
  removed-code mutation were red in REVIEW2.
- `loop/lib/review.mjs:719-724` adds the reviewer-facing `cites:` contract.
  `the reviewer brief carries the closed reason list, the checklist, and no
  author reasoning` at `review.test.mjs:176` pins the complete template; the
  key, scope, and omit-guidance mutations were red in REVIEW2.
- `loop/lib/review.mjs:855-867` resolves citations before the verdict branch.
  Finding 1 covers a valid constitution and pending heading outside the
  governing list; the existing unresolved approve and revise refusals cover the
  negative branch and the named resolution-removal mutation was red in REVIEW2.
- `loop/lib/review.mjs:1376,1380-1391` accepts, trims, and writes `cites:`.
  The parser arm at `review.test.mjs:687`, the pending positive record at
  `:712`, and Finding 1's two written records reach this path; the prior
  `cited.length` omission mutation was red in REVIEW2.
- `loop/lib/specs.mjs:147-173` adds capability discovery and the union of
  constitution and pending headings. Finding 1 at `review.test.mjs:724` is the
  outside-capability arm; the only-loop mutation is red.
- `loop/lib/specs.mjs:312-319` is documentation only (the excerpt-option
  contract and return-shape comment), so no executable arm applies.
- `loop/lib/specs.mjs:326-348` normalizes requested headings, switches to all
  live capabilities, and bypasses keyword scoring. The exact cited-set arm at
  `brief.test.mjs:110`, including the outside-capability citation, and the
  earlier forced-filter mutation cover this behavior.
- `loop/lib/specs.mjs:353-375` builds constitution candidates followed by
  matching pending-delta candidates. Finding 2 at `brief.test.mjs:137` catches
  the pending omission; the exact-heading arm also catches constitution
  selection.
- `loop/lib/specs.mjs:398-411` computes resolved and missing headings and
  returns them through the empty-plan path. The missing-heading marker arm at
  `brief.test.mjs:155` reaches the missing result, and the dedicated
  empty-source arm at `brief.test.mjs:170` catches its truncated/missing signal.
- `loop/lib/specs.mjs:421-430` accounts for floor markers, chunk headings, and
  internal cited-heading separators. Finding 3 at `brief.test.mjs:236` is the
  two-heading cap boundary; the prior budget suite covers the other overhead
  terms.
- `loop/lib/specs.mjs:441-447` adds the heading-mode zero-budget return shape.
  The delta-only zero-budget arm at `brief.test.mjs:194` reaches the branch and
  its `truncated: false` mutation was red.
- `loop/lib/specs.mjs:501-522` computes heading-mode truncation and returns
  `missingHeadings`. Finding 4 at `brief.test.mjs:261` covers the truncation
  signal; the marker arm
  covers the missing-heading field and the existing non-heading truncation
  cases retain the original branch.
- `loop/lib/verdict.mjs:213-225,252,301` parses front-matter-only scalar/list
  citations, trims and deduplicates them, and returns them without changing
  the verdict. `parseVerdict reads a trimmed, deduplicated cites list from
  front matter only` at `review.test.mjs:687` catches the parser mutations.
- `loop/run.mjs:28` imports the revision assembler. Finding 6's real loop run
  reaches the imported function; the prior C46 integration arm also proved the
  call site was live.
- `loop/run.mjs:727-742` replaces the old whole-author-brief concatenation with
  the assembler and forwards verdict, findings, and judged diff. Existing C46
  assertions cover the replacement and Finding 6 catches both empty forwarding
  mutations. Comment-only replacement lines in this hunk have no separate
  runtime behavior.

## 4. Tests run

Commands below are shown with their final summary lines. The initial review-file
failure was a development expectation that `mergeGate` would return `ok: true`
for `revise`; the implementation correctly keeps `revise` non-approving, so the
arm was corrected before mutation evidence was collected.

Baseline targeted group:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief-excerpt-budget.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review-blog-bar.test.mjs
1..104
# tests 104
# suites 0
# pass 104
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 101221.865
```

Post-edit brief file:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs
1..10
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 6637.2365
```

Initial post-edit review file, before correcting the revise expectation:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs
1..33
# tests 33
# suites 0
# pass 32
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 97174.14
```

Corrected outside-capability arm:

```text
node --test --test-reporter=tap --test-name-pattern="cites from an outside capability" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 961.0567
```

Sweep edge arms, each green after restoration:

```text
node --test --test-reporter=tap --test-name-pattern="unresolved cited heading with no live sources" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 765.57

node --test --test-reporter=tap --test-name-pattern="heading-mode zero budget" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 791.8603
```

The six named finding arms (seven mutations, because Finding 6 has two) and
three sweep mutations were each run with their
focused command, observed red, restored, and observed green. Their summary
tails are recorded in section 5. The first complete focused group after the six
arms was:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief-excerpt-budget.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review-blog-bar.test.mjs
1..110
# tests 110
# suites 0
# pass 110
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 107270.0584
```

The enforcement command for model/provider/harness names and runner ids, plus
the enforcement command for unarchived change-directory references:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/portability.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/scripts/no-change-dir-refs.test.mjs
1..16
# tests 16
# suites 0
# pass 16
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 762.403
```

The first committed-tip full suite, before the sweep-tail tightening commit,
was green but is not the final committed-tip run:

```text
npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-B2 test
ℹ tests 1769
ℹ suites 0
ℹ pass 1769
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 438296.2759
wall_ms≈440700; wall_time≈440.7s; exit=0
```

After commit `7999203`, the final focused group and enforcement rerun were:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief-excerpt-budget.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review-blog-bar.test.mjs
1..110
# tests 110
# suites 0
# pass 110
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 103035.8959

node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/portability.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/scripts/no-change-dir-refs.test.mjs
1..16
# tests 16
# suites 0
# pass 16
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 747.293
```

After commit `e413ebe`, the final focused group and enforcement rerun were:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief-excerpt-budget.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review-blog-bar.test.mjs
1..112
# tests 112
# suites 0
# pass 112
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 118133.7851

node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/portability.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/scripts/no-change-dir-refs.test.mjs
1..16
# tests 16
# suites 0
# pass 16
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 753.4024
```

Required final full-suite iteration on committed tip `e413ebe`:

```text
npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-B2 test
ℹ tests 1769
ℹ suites 0
ℹ pass 1769
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 434132.1869
wall_ms≈436500; wall_time≈436.5s; exit=0
```

## 5. Mutation table

| Arm | Mutation | File and line | Command | Red result | Restored result |
|---|---|---|---|---|---|
| Finding 1 | `liveSpecCapabilities(repoRoot)` → `['loop']` | `loop/lib/specs.mjs:166`; arm `loop/tests/review.test.mjs:724` | `node --test --test-reporter=tap --test-name-pattern="cites from an outside capability" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs` | `# tests 1; # pass 0; # fail 1` | `# tests 1; # pass 1; # fail 0`; `specs.mjs` SHA-256 `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D` |
| Finding 2 | Heading-mode delta `candidates` → `[]` | `loop/lib/specs.mjs:370-373`; arm `loop/tests/brief.test.mjs:137` | `node --test --test-reporter=tap --test-name-pattern="cited pending amendment follows" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `# tests 1; # pass 0; # fail 1` | `# tests 1; # pass 1; # fail 0`; `specs.mjs` SHA-256 `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D` |
| Finding 3 | Internal separator charge → `0` | `loop/lib/specs.mjs:426`; arm `loop/tests/brief.test.mjs:236` | `node --test --test-reporter=tap --test-name-pattern="charge the separator" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `# tests 1; # pass 0; # fail 1`; failure message `cap=427; text.length=429; chars=429` | `# tests 1; # pass 1; # fail 0`; `specs.mjs` SHA-256 `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D` |
| Finding 4 | Heading-mode truncation → `false` | `loop/lib/specs.mjs:501-502`; arm `loop/tests/brief.test.mjs:261` | `node --test --test-reporter=tap --test-name-pattern="heading-mode truncation" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `# tests 1; # pass 0; # fail 1` | `# tests 1; # pass 1; # fail 0`; `specs.mjs` SHA-256 `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D` |
| Finding 5 | `verdict.notes` extraction → `''` | `loop/lib/brief.mjs:734`; arm `loop/tests/brief.test.mjs:291` | `node --test --test-reporter=tap --test-name-pattern="revision verdict separates ordinary notes" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `# tests 1; # pass 0; # fail 1` | `# tests 1; # pass 1; # fail 0`; `brief.mjs` SHA-256 `7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2` |
| Finding 6a | Revision `findings` → `''` | `loop/run.mjs:741`; arm `loop/tests/review.test.mjs:417` | `node --test --test-reporter=tap --test-name-pattern="revision prompt carries the reviewer finding" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs` | `# tests 1; # pass 0; # fail 1` | `# tests 1; # pass 1; # fail 0`; `run.mjs` SHA-256 `1E0B8769E6226D10921E928E1B10663B9841EA9468DAC06117E5689152B4E40F` |
| Finding 6b | Revision `diffText` → `''` | `loop/run.mjs:742`; arm `loop/tests/review.test.mjs:417` | `node --test --test-reporter=tap --test-name-pattern="revision prompt carries the reviewer finding" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs` | `# tests 1; # pass 0; # fail 1` | `# tests 1; # pass 1; # fail 0`; `run.mjs` SHA-256 `1E0B8769E6226D10921E928E1B10663B9841EA9468DAC06117E5689152B4E40F` |
| Sweep arm | Remove `${GROUND_RULES}` and `${RESULT_PROTOCOL_INSTRUCTION}` from the revision template | `loop/lib/brief.mjs:814-816`; arm `loop/tests/review.test.mjs:364`, assertions `:382-383` | `node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs` | `# tests 1; # pass 0; # fail 1` | `# tests 1; # pass 1; # fail 0`; `brief.mjs` SHA-256 `7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2` |
| Sweep edge arm | Empty-plan `truncated` signal → `false` | `loop/lib/specs.mjs:408`; arm `loop/tests/brief.test.mjs:170` | `node --test --test-reporter=tap --test-name-pattern="unresolved cited heading with no live sources" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `# tests 1; # pass 0; # fail 1` | `# tests 1; # pass 1; # fail 0`; `specs.mjs` SHA-256 `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D` |
| Sweep edge arm | Heading-mode zero-budget `truncated` → `false` | `loop/lib/specs.mjs:444`; arm `loop/tests/brief.test.mjs:194` | `node --test --test-reporter=tap --test-name-pattern="heading-mode zero budget" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `# tests 1; # pass 0; # fail 1` | `# tests 1; # pass 1; # fail 0`; `specs.mjs` SHA-256 `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D` |

All ten rows were temporary mutations only. The production hashes after
restoration matched the pre-mutation hashes; the only committed files in this
round are the two test files.

## 6. Blocked or refused calls

none

## 7. Findings not fixed

none. The initial revise expectation noted in section 4 was corrected before
the mutation runs; it was a test expectation issue, not a current-code defect.
