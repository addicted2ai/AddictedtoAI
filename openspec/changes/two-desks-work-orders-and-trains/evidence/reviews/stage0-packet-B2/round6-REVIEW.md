# Stage 0 packet B2 — round 6 (delta) — VERDICT: approve

## Sealing

I read `REVIEW3.md` and was not sealed from it; its four findings were review
context for this delta. I also read `RESULT6.md`, `.agent-brief.md`, `REVIEW2.md`,
`RESULT2.md`, `RESULT3.md`, the two changed test files, the merge-base production
diff, and the named production files. `REVIEW1.md` is not present in the supplied
worktree; its two findings and the three template-contract mutation variants were
recovered from `RESULT2.md`'s mutation table and re-run below.

## Findings

None. No prior named arm stayed green, no arm was red against unmutated
production, and the only additional green mutant is recorded as carried below.

## The prior findings' arms, re-run

Every mutation was applied to the named production line, tested with TAP, restored
immediately, and followed by a SHA-256 check and a green focused run. The baseline
restoration hashes were:

- `loop/lib/specs.mjs` — `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`
- `loop/lib/brief.mjs` — `7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2`
- `loop/lib/review.mjs` — `C71DF868483C018390D5045C198F0427438580584B6C4714AD1034C9C56DE798`
- `loop/run.mjs` — `1E0B8769E6226D10921E928E1B10663B9841EA9468DAC06117E5689152B4E40F`

### REVIEW1 — finding 1, reviewer template contract

The three contract cuts recorded in `RESULT2.md` all went red under the same
template arm and green after restoration:

| Named mutation | Command | Mutant | Restored hash and result |
|---|---|---|---|
| `loop/lib/review.mjs:719`: `# cites:` → `# wrong-cites:` | `node --test --test-reporter=tap --test-name-pattern="the reviewer brief carries the closed reason list" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs` | `1..1; # tests 1; # pass 0; # fail 1` | `review.mjs` restored to `C71DF868483C018390D5045C198F0427438580584B6C4714AD1034C9C56DE798`; `1..1; # tests 1; # pass 1; # fail 0` |
| `loop/lib/review.mjs:720`: remove the trimmed/exact/`(preamble)` sentence | same command | `1..1; # tests 1; # pass 0; # fail 1` | same hash; `1..1; # tests 1; # pass 1; # fail 0` |
| `loop/lib/review.mjs:724`: remove the final “requirement was relied on” guidance | same command | `1..1; # tests 1; # pass 0; # fail 1` | same hash; `1..1; # tests 1; # pass 1; # fail 0` |

### REVIEW1 — finding 2, empty-cites fallback

`loop/lib/brief.mjs:781`, `subjects: []` → `subjects: ['pulse']`, with
`node --test --test-reporter=tap --test-name-pattern="an empty cites list uses the author brief requirement selection" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs`:

- mutant: `1..1; # tests 1; # pass 0; # fail 1`;
- restored `brief.mjs` hash: `7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2`;
- restored: `1..1; # tests 1; # pass 1; # fail 0`.

### REVIEW2 — six findings (seven source mutations because finding 6 has two)

| Finding and mutation | Command | Mutant | Restored hash and result |
|---|---|---|---|
| F1 `loop/lib/specs.mjs:166`: `liveSpecCapabilities(repoRoot)` → `['loop']` | `node --test --test-reporter=tap --test-name-pattern="cites from an outside capability" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs` | `1..1; # tests 1; # pass 0; # fail 1` | `specs.mjs` restored to `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`; `1..1; # tests 1; # pass 1; # fail 0` |
| F2 `loop/lib/specs.mjs:370-373`: delta `candidates` → `[]` | `node --test --test-reporter=tap --test-name-pattern="a cited pending amendment follows" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `1..1; # tests 1; # pass 0; # fail 1` | same hash; `1..1; # tests 1; # pass 1; # fail 0` |
| F3 `loop/lib/specs.mjs:426`: internal separator charge → `0` | `node --test --test-reporter=tap --test-name-pattern="heading excerpts charge the separator" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `1..1; # tests 1; # pass 0; # fail 1` | same hash; `1..1; # tests 1; # pass 1; # fail 0` |
| F4 `loop/lib/specs.mjs:501-502`: heading-mode `truncated` → `false` | `node --test --test-reporter=tap --test-name-pattern="heading-mode truncation" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `1..1; # tests 1; # pass 0; # fail 1` | same hash; `1..1; # tests 1; # pass 1; # fail 0` |
| F5 `loop/lib/brief.mjs:734`: `verdict.notes` extraction → `''` | `node --test --test-reporter=tap --test-name-pattern="revision verdict separates ordinary notes" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `1..1; # tests 1; # pass 0; # fail 1` | `brief.mjs` restored to `7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2`; `1..1; # tests 1; # pass 1; # fail 0` |
| F6a `loop/run.mjs:741`: revision `findings` → `''` | `node --test --test-reporter=tap --test-name-pattern="revision prompt carries the reviewer finding" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs` | `1..1; # tests 1; # pass 0; # fail 1` | `run.mjs` restored to `1E0B8769E6226D10921E928E1B10663B9841EA9468DAC06117E5689152B4E40F`; `1..1; # tests 1; # pass 1; # fail 0` |
| F6b `loop/run.mjs:742`: revision `diffText` → `''` | same command | `1..1; # tests 1; # pass 0; # fail 1` | same hash; `1..1; # tests 1; # pass 1; # fail 0` |

### REVIEW3 — four findings

| Finding and mutation | Command | Mutant | Restored hash and result |
|---|---|---|---|
| F1 `loop/lib/specs.mjs:355-357`: constitution candidates `.slice(0, 1)` | `node --test --test-reporter=tap --test-name-pattern="heading-mode carries all cited constitution sections" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `1..1; # tests 1; # pass 0; # fail 1` | `specs.mjs` restored to `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`; `1..1; # tests 1; # pass 1; # fail 0` |
| F2 `loop/lib/specs.mjs:421-429`: whole `floorOverhead` calculation → `0` | `node --test --test-reporter=tap --test-name-pattern="heading-mode truncation" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | `1..1; # tests 1; # pass 0; # fail 1` | same hash; `1..1; # tests 1; # pass 1; # fail 0` |
| F3 `loop/lib/brief.mjs:798-812`: move Relevant spec excerpts before Diff under revision | `node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs` | `1..1; # tests 1; # pass 0; # fail 1`; the arm reported excerpts index `2122` before diff index `2273` | `brief.mjs` restored to `7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2`; `1..1; # tests 1; # pass 1; # fail 0` |
| F4 `loop/lib/specs.mjs:169`: include `(preamble)` in the live heading set | `node --test --test-reporter=tap --test-name-pattern="preamble" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs` | `1..1; # tests 1; # pass 0; # fail 1`; approve path returned `true` instead of `false` | `specs.mjs` restored to `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`; `1..1; # tests 1; # pass 1; # fail 0` |

No prior arm went red against the unmutated production tree.

## The sweep, checked

The author's `RESULT6.md` says “none this round”; I read the merge-base
production diff myself and ran four additional changed regions outside the
round's new arms:

| Changed line and mutation | Command | Result | Restoration |
|---|---|---|---|
| `loop/lib/specs.mjs:408`: empty-plan `truncated` → `false` | `node --test --test-reporter=tap --test-name-pattern="unresolved cited heading with no live sources" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | red `1..1; # tests 1; # pass 0; # fail 1`; restored green `1..1; # tests 1; # pass 1; # fail 0` | `specs.mjs` hash `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D` |
| `loop/lib/specs.mjs:444`: zero-budget heading-mode `truncated` → `false` | `node --test --test-reporter=tap --test-name-pattern="heading-mode zero budget" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | red `1..1; # tests 1; # pass 0; # fail 1`; restored green `1..1; # tests 1; # pass 1; # fail 0` | same hash |
| `loop/lib/specs.mjs:398-403`: `missingHeadings` → `[]` | `node --test --test-reporter=tap --test-name-pattern="a cited heading that cannot be found" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | red `1..1; # tests 1; # pass 0; # fail 1`; restored green `1..1; # tests 1; # pass 1; # fail 0` | `specs.mjs` hash `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D` |
| `loop/lib/specs.mjs:398-400`: `resolvedHeadings` → `new Set()` | `node --test --test-reporter=tap --test-name-pattern="a cited revision is smaller" D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs` | **green mutant** `1..1; # tests 1; # pass 1; # fail 0`; valid citations silently gained a false missing-heading marker | restored `specs.mjs` hash `7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D`; restored green `1..1; # tests 1; # pass 1; # fail 0` |

### Carried, non-blocking

The `resolvedHeadings` empty-set mutant above is an additional gap in the
existing cited-revision arm: it checks the heading set and size, but not that a
valid cited heading is absent from the “NOT FOUND” marker. It does not change
the verdict for this review because the current unmutated production code is
correct and the architect's ruling makes further green coverage mutants
non-blocking.

## What I checked that was sound

- `git diff e413ebe..HEAD` names only `loop/tests/brief.test.mjs` and
  `loop/tests/review.test.mjs`; `git diff --check` is clean.
- The final tip is `5bc12ee63e6625edcf4113f650356bc3cee3cbc2`, with merge base
  `de400f7da552b3c298f3cb9ec189c012a9de0ed7`.
- The six new test arms are narrow and directly exercised: both constitution
  headings are required in order, both cap-bound cut markers are required in
  order, the excerpt cap is checked against an over-budget source, all six
  revision sections are ordered outside fenced diff text, and `(preamble)` is
  refused on both approve and revise.
- The standing machinery properties are enforced by
  `loop/tests/portability.test.mjs` (no model/provider/harness names and no
  machinery runner ids) and `scripts/no-change-dir-refs.test.mjs` (no source
  reference to an unarchived change directory). The combined run passed 16/16.
- `RESULT6.md` reports one completed final-tip full-suite iteration on `5bc12ee`:
  1,773 tests, 1,773 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo, exit 0.
  This exceeds the required 1,763 and is the author's completed evidence; the
  reviewer did not run the full suite because this review forbids it.
- GitNexus has no indexed repository for this worktree, so no graph impact
  report was available; no index was created or changed.

## What I ran

All targeted test commands below used `--test-reporter=tap`, and I checked both
the TAP plan and the explicit `# tests`, `# pass`, and `# fail` totals.

Final targeted group:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/brief-excerpt-budget.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/review-blog-bar.test.mjs
1..114
# tests 114
# pass 114
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Standing properties:

```text
node --test --test-reporter=tap D:/addictedtoai-worktrees/fleet6-stage0-B2/loop/tests/portability.test.mjs D:/addictedtoai-worktrees/fleet6-stage0-B2/scripts/no-change-dir-refs.test.mjs
1..16
# tests 16
# pass 16
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

The focused mutation commands and their real TAP counts are recorded in the
two arm tables and the sweep table above. The final read-only verification was:

```text
git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 rev-parse HEAD
5bc12ee63e6625edcf4113f650356bc3cee3cbc2
git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 merge-base HEAD de400f7
de400f7da552b3c298f3cb9ec189c012a9de0ed7
git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 diff --name-status e413ebe..HEAD
M	loop/tests/brief.test.mjs
M	loop/tests/review.test.mjs
git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 diff --check
no output
```

Author's completed full-suite evidence, quoted from `RESULT6.md` and not
re-run under this review's hard limit:

```text
npm --prefix D:\addictedtoai-worktrees\fleet6-stage0-B2 test
ℹ tests 1773
ℹ pass 1773
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
Observed wall time: approximately 423.8 seconds; exit 0.
```

## Blocked or refused calls

none
