# RESULT1

## 1. Commits

- `a4c3a8c` — Implement cited revision briefs
- `5fb9b2b` — Preserve revision pass marker

Output of `git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 log --oneline main..HEAD`:

```text
5fb9b2b Preserve revision pass marker
a4c3a8c Implement cited revision briefs
```

## 2. What changed, per file

- `loop/lib/verdict.mjs`: `parseVerdict` now reads `cites:` from front matter only. A scalar becomes one entry; list entries are trimmed, empty entries are discarded, duplicates collapse, and absent/empty values return `cites: []`. The parsed citations never affect the verdict value.
- `loop/lib/review.mjs`: added `cites-unresolved` to `REISSUE_CODES`; `mergeGate` resolves every cited heading against the all-capability constitution and pending-delta heading set before branching on `approve`, `revise`, or `reject`, naming every unresolved heading. The review record template now documents the exact heading source and that citations feed revision excerpts. `writeVerdictRecord` can emit the optional list for tests and local record construction.
- `loop/lib/specs.mjs`: added the exported `requirementHeadings(repoRoot, pendingRoot)` enumeration. It returns unique, trimmed, non-preamble heading text from every capability under `openspec/specs/`, including its constitution and every pending source supplied by `specSources`. `excerptsFor` now accepts a non-empty `headings` option: it exact-matches trimmed headings across every live capability, bypasses keyword scoring, emits constitution sections before matching pending amendments, and retains the existing excerpt cap, floors, cut markers, and truncation behavior. Empty `headings` keeps the author behavior. The result also reports headings absent from the plan as `missingHeadings`.
- `loop/lib/brief.mjs`: added the shared `acceptanceChecksSection(type)` helper, used by both assemblers, so the checklist and generated gate line cannot drift. Added `assembleRevisionBrief`, which emits only the revision header/accounting, verdict and findings, shared acceptance checks, the judged diff, cited excerpts (or the governing-type excerpts for empty citations), ground rules, and result protocol. Missing cited headings receive a one-line marker; the original author brief, outcome section, proposal section, and next-step prose are not resent. The header retains the `Revision pass (one only)` marker required by the existing mock executor contract.
- `loop/run.mjs`: imported `assembleRevisionBrief` and replaced the inline revision-brief concatenation at lines 727–743. The replaced call-site range now is:

  ```js
    // The revision brief is rebuilt from the current verdict, accounting,
    // judged diff and structurally cited requirements. The original author
    // brief is deliberately not sent again: its spend figures are stale and
    // its unrelated outcome and proposal prose are not revision inputs.
    const revisionBrief = assembleRevisionBrief(ctx, {
      jobId,
      job,
      branch,
      capMinutes: revisionAllowance.capMinutes,
      mmSoFar: spent(),
      invocations: prior.invocations + phases.length,
      totalMinutes,
      floorMinutes,
      verdict: gate.verdict,
      findings,
      diffText,
    });
  ```

- `loop/tests/review.test.mjs`: added parser coverage for scalar/list/trimmed/deduplicated/front-matter-only citations; a pending-heading positive arm; independent unresolved-heading refusals for `approve` and `revise`; and the required all-unresolved-reasons checks. The existing revision-format assertion now checks the new compact assembler output.
- `loop/tests/brief.test.mjs`: added the pinned temporary-corpus tests. The corpus gives the governing type multiple capabilities with multiple headings each, cites one governing heading and one outside the governing list, omits other governing headings, includes a pending amendment, checks the missing-heading marker, checks the empty-list fallback, asserts the fixture revision is smaller, and prints fixture/live size measurements.

## 3. Tests run

The Node test runner in this environment emitted `ℹ` summary lines for ordinary runs; those lines are copied verbatim below. Mutation runs used the TAP reporter and therefore emitted `#` summary lines.

- Baseline: `node --test loop/tests/review.test.mjs loop/tests/brief.test.mjs loop/tests/brief-excerpt-budget.test.mjs`

  ```text
  ℹ tests 50
  ℹ suites 0
  ℹ pass 50
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 98061.0231
  ```

- Two intermediate targeted iterations exposed and then fixed stale test expectations. Their tails were:

  ```text
  ℹ tests 57
  ℹ pass 56
  ℹ fail 1
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 93945.0385

  ℹ tests 57
  ℹ pass 56
  ℹ fail 1
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 93400.3049
  ```

- Restored targeted run: `node --test loop/tests/review.test.mjs loop/tests/brief.test.mjs loop/tests/brief-excerpt-budget.test.mjs`

  ```text
  ℹ tests 60
  ℹ pass 60
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 94698.7057
  ```

- Property enforcement: `node --test loop/tests/portability.test.mjs scripts/no-change-dir-refs.test.mjs scripts/local-dates.test.mjs`

  ```text
  ℹ tests 22
  ℹ suites 0
  ℹ pass 22
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 833.592
  ```

  This ran the machinery model/provider/harness and runner-id enforcement, the no-unarchived-source-reference enforcement, and the local-date enforcement.

- `node --test loop/tests/brief-acceptance.test.mjs loop/tests/brief-subject.test.mjs loop/tests/review-blog-bar.test.mjs` exposed one out-of-scope stale exact-list assertion:

  ```text
  ℹ tests 77
  ℹ suites 0
  ℹ pass 76
  ℹ fail 1
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 48104.6039
  ```

- `node --test --test-reporter=tap --test-name-pattern="cites" loop/tests/review.test.mjs`:

  ```text
  # tests 4
  # pass 4
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  # duration_ms 2351.736
  ```

- `node --test --test-reporter=tap loop/tests/brief.test.mjs`:

  ```text
  # tests 5
  # pass 5
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  # duration_ms 3070.1466
  ```

- `node --test --test-reporter=tap --test-name-pattern="pending amendment passes" loop/tests/review.test.mjs` after restoring the writer mutation:

  ```text
  # tests 1
  # pass 1
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  # duration_ms 926.7766
  ```

- `node --test --test-reporter=tap --test-name-pattern="same job clears the refusal" loop/tests/carried-deletion.test.mjs`:

  ```text
  # tests 1
  # pass 1
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  # duration_ms 6600.2115
  ```

- Combined final property/budget check before the committed-tip suite: `node --test loop/tests/portability.test.mjs scripts/no-change-dir-refs.test.mjs scripts/local-dates.test.mjs loop/tests/brief-excerpt-budget.test.mjs`

  ```text
  ℹ tests 45
  ℹ suites 0
  ℹ pass 45
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 17199.0433
  ```

- Syntax check: `node --check` was run for all seven changed code/test files; all exited 0 with no output.

- First committed-tip full suite, before the compatibility marker fix: `npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-B2 test`

  ```text
  ℹ tests 1763
  ℹ pass 1761
  ℹ fail 2
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 403073.511
  ```

- Required final committed-tip iteration: `npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-B2 test`

  ```text
  ℹ tests 1763
  ℹ pass 1762
  ℹ fail 1
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 414469.6445
  ```

  The remaining failure is the forbidden out-of-scope assertion documented in section 7.

## 4. Mutation table

Each mutation was applied in the worktree, run on its intended input, restored, and run again. The first three are the packet-required mutations; the remaining rows arm changed functions beyond those three.

| Mutation | File and line | Command | Red output tail | Restored output |
|---|---|---|---|---|
| Drop the `mergeGate` citation-resolution return. Both unresolved arms become non-refusals: approve returned `true`, revise returned `revise`. | `loop/lib/review.mjs:857` | `node --test --test-reporter=tap --test-name-pattern="cites" loop/tests/review.test.mjs` | `# tests 4`<br>`# pass 2`<br>`# fail 2`<br>`# cancelled 0`<br>`# skipped 0`<br>`# todo 0`<br>`# duration_ms 2370.675` | `# tests 4`<br>`# pass 4`<br>`# fail 0`<br>`# duration_ms 2368.642` |
| Prepend the complete author brief to the measured revision for the size assertion. | `loop/tests/brief.test.mjs:93` | `node --test --test-reporter=tap --test-name-pattern="a cited revision is smaller" loop/tests/brief.test.mjs` | `# tests 1`<br>`# pass 0`<br>`# fail 1`<br>`# cancelled 0`<br>`# skipped 0`<br>`# todo 0`<br>`# duration_ms 840.335` | `# tests 1`<br>`# pass 1`<br>`# fail 0`<br>`# duration_ms 841.8325` |
| Ignore `cites:` and send the governing type's whole checklist. The exact-set test, outside-heading test, and uncited-heading test all failed; the outside cited heading disappeared and the uncited governing headings appeared. | `loop/lib/brief.mjs:779` | `node --test --test-reporter=tap --test-name-pattern="cited revision|cited heading outside|uncited governing" loop/tests/brief.test.mjs` | `# tests 3`<br>`# pass 0`<br>`# fail 3`<br>`# cancelled 0`<br>`# skipped 0`<br>`# todo 0`<br>`# duration_ms 2285.7635` | `# tests 3`<br>`# pass 3`<br>`# fail 0`<br>`# duration_ms 2305.6271` |
| Remove citation parsing from `parseVerdict`. | `loop/lib/verdict.mjs:252` | `node --test --test-reporter=tap --test-name-pattern="reads a trimmed" loop/tests/review.test.mjs` | `# tests 1`<br>`# pass 0`<br>`# fail 1`<br>`# cancelled 0`<br>`# skipped 0`<br>`# todo 0`<br>`# duration_ms 224.9867` | `# tests 1`<br>`# pass 1`<br>`# fail 0`<br>`# duration_ms 212.6827` |
| Enumerate only constitution sources, omitting pending amendments. | `loop/lib/specs.mjs:167` | `node --test --test-reporter=tap --test-name-pattern="a cites heading held" loop/tests/review.test.mjs` | `# tests 1`<br>`# pass 0`<br>`# fail 1`<br>`# cancelled 0`<br>`# skipped 0`<br>`# todo 0`<br>`# duration_ms 930.7268` | `# tests 1`<br>`# pass 1`<br>`# fail 0`<br>`# duration_ms 957.9851` |
| Replace the shared generated gate line with an empty list. | `loop/lib/brief.mjs:267` | `node --test --test-reporter=tap --test-name-pattern="one6 every brief" loop/tests/brief-acceptance.test.mjs` | `# tests 1`<br>`# pass 0`<br>`# fail 1`<br>`# cancelled 0`<br>`# skipped 0`<br>`# todo 0`<br>`# duration_ms 769.3545` | `# tests 1`<br>`# pass 1`<br>`# fail 0`<br>`# duration_ms 6752.082` |
| Suppress the citation block in `writeVerdictRecord`. | `loop/lib/review.mjs:1389` | `node --test --test-reporter=tap --test-name-pattern="pending amendment passes" loop/tests/review.test.mjs` | `# tests 1`<br>`# pass 0`<br>`# fail 1`<br>`# cancelled 0`<br>`# skipped 0`<br>`# todo 0`<br>`# duration_ms 915.0334` | `# tests 1`<br>`# pass 1`<br>`# fail 0`<br>`# duration_ms 926.7766` |
| Call `assembleBrief` at the revision site instead of `assembleRevisionBrief`. | `loop/run.mjs:731` | `node --test --test-reporter=tap --test-name-pattern="C46 the revision brief" loop/tests/review.test.mjs` | `# tests 1`<br>`# pass 0`<br>`# fail 1`<br>`# cancelled 0`<br>`# skipped 0`<br>`# todo 0`<br>`# duration_ms 6441.3126` | `# tests 1`<br>`# pass 1`<br>`# fail 0`<br>`# duration_ms 6408.4592` |
| Uppercase the rendered verdict value. | `loop/lib/brief.mjs:743` | `node --test loop/tests/review.test.mjs loop/tests/brief.test.mjs loop/tests/brief-excerpt-budget.test.mjs` | `ℹ tests 60`<br>`ℹ pass 59`<br>`ℹ fail 1`<br>`ℹ cancelled 0`<br>`ℹ skipped 0`<br>`ℹ todo 0`<br>`ℹ duration_ms 99566.2602` | `ℹ tests 60`<br>`ℹ pass 60`<br>`ℹ fail 0`<br>`ℹ duration_ms 94698.7057` |

## 5. Paired numbers

- Pinned fixture (asserted): author brief **34,483** chars; revision brief **24,295** chars; difference **10,188** chars. The test asserts only the strict ordering on this fixture. The separate task-8 artifact bound remains **30,000** chars for its pinned fixture; the live production size is not treated as that bound.
- Live tree, `repair` (printed measurement only): author brief **27,146** chars; revision brief **23,151** chars; difference **3,995** chars. This is a measurement, never an assertion or production bound.

## 6. Blocked or refused calls

none

## 7. Findings not fixed

`loop/tests/review-blog-bar.test.mjs:269` exact-matches the old seven-entry `REISSUE_CODES` iterable and does not include the required `cites-unresolved` entry. The packet explicitly forbids editing that file, so it was left untouched. This is the one failure in the required final full suite: 1,762 passed and 1 failed. Updating that out-of-scope expected list is required for a fully green suite; no allowed packet file can correct the stale assertion without violating the file-scope rule.
