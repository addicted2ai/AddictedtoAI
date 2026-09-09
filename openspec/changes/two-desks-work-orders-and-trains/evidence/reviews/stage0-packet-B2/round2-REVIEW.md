# Stage 0 packet B2 — round 2 — VERDICT: revise

## Sealing

I opened no earlier REVIEW*.md file, no earlier round's RESULT*.md file, and
no earlier round's brief. I opened only the current .agent-brief.md and the
current RESULT2.md, treating both as evidence rather than as the standard.

## Findings

1. MUST-FIX — Class: full-capability requirement-heading validation.
   File: loop/lib/specs.mjs:166, with the missing arm in
   loop/tests/review.test.mjs.

   The implementation currently iterates liveSpecCapabilities, but the gate
   tests never prove that a cited heading in a capability outside the
   governing type resolves. I mutated the loop at specs.mjs:166 from
   `for (const capability of liveSpecCapabilities(repoRoot))` to
   `for (const capability of ['loop'])`. The focused citation command still
   passed all three tests (3 tests, 3 pass, 0 fail): the only positive gate
   case is a pending loop heading, while the remaining cases cite missing
   headings.

   This leaves Task 10(iii)'s union over every capability unarmed, even though
   Task 10(vi) requires the fixture-held positive case. Add a valid citation
   from a non-governing capability to the gate fixture and assert that
   mergeGate accepts it; the named only-loop mutation must then go red.

2. MUST-FIX — Class: cited pending-amendment excerpt inclusion.
   File: loop/lib/specs.mjs:368-373, with the missing assertion in
   loop/tests/brief.test.mjs.

   I mutated the heading-mode delta branch's candidate assignment to
   `const candidates = []`. All six tests in loop/tests/brief.test.mjs still
   passed (6 tests, 6 pass, 0 fail). The fixture cites a heading present in
   both the constitution and its pending delta, so the constitution heading
   keeps the heading-set assertion green while the amendment body silently
   disappears.

   Task 11(iii) requires constitution text followed by the cited heading's
   pending amendments. Give the pending fixture text a unique sentinel and
   assert that the cited revision contains the pending-amendment marker and
   sentinel body (with the required ordering); this omission mutation must go
   red.

3. MUST-FIX — Class: structural excerpt-budget accounting for multiple
   cited sections.
   File: loop/lib/specs.mjs:421-429, especially line 426, with the missing
   fixture arm in loop/tests/brief.test.mjs.

   I replaced
   Math.max(0, item.candidates.length - 1) * '\n\n'.length
   with 0. All six brief tests still passed (6 tests, 6 pass, 0 fail).
   The current fixture cites one heading per source, so it never exercises the
   newly added separator charge between two cited headings in one constitution.

   Task 11(iii) requires the heading mode to retain the existing floors,
   markers, cut behavior, and BRIEF_EXCERPT_MAX_CHARS bound. Add two cited
   headings from the same constitution and a cap where omitting their internal
   separator exceeds the bound; assert the returned text and chars stay within
   the cap and the mutation goes red.

4. MUST-FIX — Class: heading-mode truncation signaling.
   File: loop/lib/specs.mjs:501-502, with the missing assertion in
   loop/tests/brief.test.mjs.

   I replaced the entire heading-mode truncated expression with
   `const truncated = false`. All six brief tests still passed (6 tests,
   6 pass, 0 fail). The heading-mode implementation can therefore lose the
   notice that relevant material was cut or omitted while the current tests
   continue to check only size and heading membership.

   Task 11(iii) requires the same markers and cut behavior as the existing
   excerpt path. Add an over-budget cited-heading case asserting
   excerptsFor(...).truncated and the revision brief's cut/full-file notice;
   the mutation must go red.

5. MUST-FIX — Class: revision-verdict field classification.
   File: loop/lib/brief.mjs:734, with the missing assertion in
   loop/tests/brief.test.mjs.

   I changed
   `const notes = String(verdict.notes ?? '').trim()`
   to `const notes = ''`. The cited-revision test still passed (1 test,
   1 pass, 0 fail). Because run.mjs also puts the ordinary note into findings,
   revisionVerdictSection reclassified that note as the
   Diff-measured refusal reason instead of placing it under Free-form notes;
   the test checks only that the text exists somewhere.

   Task 11(ii) requires the verdict value, free-form notes, and a
   diff-measured refusal reason only when isDiffRefusal holds. Add an assertion
   that an ordinary revise note appears under Free-form notes and that no
   Diff-measured refusal reason block appears for the ordinary findings
   fixture, plus a control for the diff-refusal case.

6. MUST-FIX — Class: run-site forwarding of the review findings and judged
   diff.
   File: loop/run.mjs:741-742, with the missing integration assertions in
   loop/tests/review.test.mjs.

   Two independent mutations each stayed green:

   - replacing the revision call's findings argument with findings: '' made
     C46 pass (1 test, 1 pass, 0 fail);
   - replacing the revision call's diffText argument with diffText: '' made
     C46 pass (1 test, 1 pass, 0 fail).

   C46 checks that the new sections exist and that the author outcome is gone,
   but it does not inspect the revision prompt's actual note or diff payload.
   Task 11(ii) says the findings composition at run.mjs:709-715 is the
   assembler's input and that the diff under revision is the exact string
   passed to runReview at run.mjs:587. Add a runner or prompt-capture
   assertion for both the ordinary reviewer findings and a distinctive judged
   diff; both empty-argument mutations must go red.

## The mutations I ran

All mutation edits were made only as temporary mutations and restored
immediately. Every restoration below matched the pre-mutation SHA-256.

| Changed function or arm | Mutation and command | Real result | Restoration proof |
|---|---|---|---|
| parseCites, verdict.mjs:223 | Returned [] instead of the trimmed, deduplicated list. Command: node --test --test-reporter=tap --test-name-pattern="parseVerdict reads a trimmed" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs | RED — 1 test, 0 pass, 1 fail; expected First requirement, got []. | verdict.mjs SHA-256 8BBC6C85EB75A859BB8E7811174F75E76AF92ECE863D00831F8052170EBD4619 |
| parseVerdict, verdict.mjs:252 | Bypassed parseCites with const cites = []. Command: same focused parseVerdict command. | RED — 1 test, 0 pass, 1 fail; expected First requirement, got []. | verdict.mjs SHA-256 8BBC6C85EB75A859BB8E7811174F75E76AF92ECE863D00831F8052170EBD4619 |
| requirementHeadings, specs.mjs:166 | Replaced liveSpecCapabilities(repoRoot) with ['loop']. Command: node --test --test-reporter=tap --test-name-pattern="(a cites heading held by a pending amendment|merge refuses unresolved cites)" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs | GREEN — 3 tests, 3 pass, 0 fail. This is Finding 1. | specs.mjs SHA-256 7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D |
| mergeGate, review.mjs:856 | Replaced the unresolved-cite filter with const unresolvedCites = []. This is the named Task 10(vi) mutation. Command: node --test --test-reporter=tap --test-name-pattern="merge refuses unresolved cites" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs | RED — 2 tests, 0 pass, 2 fail; approve returned true and revise returned code revise. | review.mjs SHA-256 C71DF868483C018390D5045C198F0427438580584B6C4714AD1034C9C56DE798 |
| writeVerdictRecord, review.mjs:1389 | Replaced the cited.length write condition with false. Command: node --test --test-reporter=tap --test-name-pattern="a cites heading held by a pending amendment" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs | RED — 1 test, 0 pass, 1 fail; parsed cites was [] instead of Fixture pending heading. | review.mjs SHA-256 C71DF868483C018390D5045C198F0427438580584B6C4714AD1034C9C56DE798 |
| assembleReviewBrief/template, review.mjs:719 | Renamed the commented # cites: key to # wrong-cites:. Command: node --test --test-reporter=tap --test-name-pattern="the reviewer brief carries the closed reason list" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs | RED — 1 test, 0 pass, 1 fail; the exact template assertion did not match. | review.mjs SHA-256 C71DF868483C018390D5045C198F0427438580584B6C4714AD1034C9C56DE798 |
| excerptsFor heading filter, specs.mjs:331 | Forced headingFilter to false. Command: node --test --test-reporter=tap --test-name-pattern="a cited revision is smaller" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs | RED — 1 test, 0 pass, 1 fail; actual headings were Pulse cited requirement, Site uncited requirement, and Review other requirement, with Editorial cited requirement missing. | specs.mjs SHA-256 7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D |
| acceptanceChecksSection, brief.mjs:263 | Changed the helper heading to Acceptance check. Command: node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs | RED — 1 test, 0 pass, 1 fail; expected ## Acceptance checks. | brief.mjs SHA-256 7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2 |
| assembleBrief, brief.mjs:679 | Changed the author seam's subjects: [] to subjects: ['pulse']. Command: node --test --test-reporter=tap --test-name-pattern="an empty cites list uses the author brief requirement selection" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs | RED — 1 test, 0 pass, 1 fail; injected author options had ['pulse'] while revision options had []. | brief.mjs SHA-256 7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2 |
| revisionVerdictSection, brief.mjs:734 | Changed notes extraction to const notes = ''. Command: node --test --test-reporter=tap --test-name-pattern="a cited revision is smaller" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs | GREEN — 1 test, 1 pass, 0 fail. The note-presence assertion did not distinguish its section. This is Finding 5. | brief.mjs SHA-256 7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2 |
| assembleRevisionBrief cited selection, brief.mjs:776-778 | Forced cited to []. This is the named Task 12 Mutation B. Command: node --test --test-reporter=tap --test-name-pattern="a cited revision is smaller" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs | RED — 1 test, 0 pass, 1 fail; expected the two cited headings but received the governing headings and omitted Editorial cited requirement. | brief.mjs SHA-256 7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2 |
| assembleRevisionBrief missing marker, brief.mjs:783-786 | Disabled missingMarker. Command: node --test --test-reporter=tap --test-name-pattern="a cited heading that cannot be found" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs | RED — 1 test, 0 pass, 1 fail; the expected CITED REQUIREMENT HEADINGS NOT FOUND marker was absent. | brief.mjs SHA-256 7ADACA70377586875451BD81D9980FC84C2DEDB8AE105F1B3402DEEE5FCD83D2 |
| assembleRevisionBrief pending-delta inclusion, specs.mjs:370-371 | Replaced the heading-mode delta candidates with []. Command: node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs | GREEN — 6 tests, 6 pass, 0 fail. This is Finding 2. | specs.mjs SHA-256 7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D |
| excerptsFor multi-heading floor overhead, specs.mjs:426 | Replaced the internal-candidate separator charge with 0. Command: node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs | GREEN — 6 tests, 6 pass, 0 fail. This is Finding 3. | specs.mjs SHA-256 7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D |
| excerptsFor heading truncation, specs.mjs:501-502 | Replaced the full truncated expression with const truncated = false. Command: node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs | GREEN — 6 tests, 6 pass, 0 fail. This is Finding 4. | specs.mjs SHA-256 7152A9E069B42D797F07110DD17A1A27E184F315AAEA74A28130706D6E9C700D |
| run.mjs revision call, run.mjs:742 | Passed diffText: ''. Command: node --test --test-reporter=tap --test-name-pattern="C46 the revision brief supersedes" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs | GREEN — 1 test, 1 pass, 0 fail. This is Finding 6. | run.mjs SHA-256 1E0B8769E6226D10921E928E1B10663B9841EA9468DAC06117E5689152B4E40F |
| run.mjs revision call, run.mjs:741 | Passed findings: ''. Command: same C46 command. | GREEN — 1 test, 1 pass, 0 fail. This is Finding 6. | run.mjs SHA-256 1E0B8769E6226D10921E928E1B10663B9841EA9468DAC06117E5689152B4E40F |
| REISSUE_CODES exact pin, review-blog-bar.test.mjs:269-277 | Removed cites-unresolved from the exact expected list. Command: node --test --test-reporter=tap --test-name-pattern="the re-issue refusals" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review-blog-bar.test.mjs | RED — 1 test, 0 pass, 1 fail; actual list contained cites-unresolved. | review-blog-bar.test.mjs SHA-256 847684AD53ABC444CFE0E80FA6C43AA6E9F6CCFF501BD5DA73240F1EDE8674D0 |
| Task 12 Mutation A, brief.test.mjs:96 | Prepended the whole author brief to the revision. Command: node --test --test-reporter=tap --test-name-pattern="a cited revision is smaller" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs | RED — 1 test, 0 pass, 1 fail; observed author 34483 and revision 58791, so the size assertion failed. | brief.test.mjs SHA-256 2F47E292DD627C5E63167D43C274BB31E996B673A25E686F37F5A53AEF0FCD88 |
| Task 10(vi) named resolution mutation, review.mjs:856 | Covered by the mergeGate row above. Command: node --test --test-reporter=tap --test-name-pattern="merge refuses unresolved cites" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs | RED — both approve and revise refusals failed when the resolution check was removed. | review.mjs SHA-256 C71DF868483C018390D5045C198F0427438580584B6C4714AD1034C9C56DE798 |

The green rows are findings, not passing coverage. Every red run was executed
with the temporary mutation in place, and every temporary mutation was restored
before the next audit step.

## The mutation table, judged

The merge-base diff contains these changed production functions or behavioral
arms: parseCites and parseVerdict; assembleReviewBrief's template;
requirementHeadings; mergeGate; writeVerdictRecord; excerptsFor;
acceptanceChecksSection; assembleBrief; revisionVerdictSection;
assembleRevisionBrief; and the run.mjs revision call. Each has a mutation row
above. The new and changed test files also have their own rows, including the
exact REISSUE_CODES pin and both Task 12 named mutations.

The red mutations are plausible competent-author mistakes and each affected
test was actually run. The green mutations are also plausible omissions:
the current fixture naturally duplicates the constitution heading in the
pending amendment, cites only one heading per source, does not overrun the
heading-mode cap, and only checks section presence at the run integration
boundary. Those are precisely the wrong worlds the added arms must distinguish.

## What I checked that was sound

- The merge base measured from the review worktree is
  de400f7da552b3c298f3cb9ec189c012a9de0ed7, and the tip is
  6502b98805a224335540806fbe5a651f6b0cba17. The tracked diff contains only
  the eight permitted implementation/test paths. The only untracked paths are
  the permitted .agent-brief.md and RESULT2.md. git diff --check produced no
  output.
- parseVerdict reads cites from front matter only. The focused parser test
  passed for scalar input, list input, trimming, duplicate collapse, empty
  entries, and a body-only cites line; the parsed verdict remained revise.
- requirementHeadings uses specSources and the shared requirementSections
  parser. The pending-heading positive control passed, and the unresolved
  approve and revise controls both refused with cites-unresolved and named all
  unresolved entries. The resolution block is before the non-approve verdict
  branch, and cites-unresolved is in REISSUE_CODES.
- The reviewer template carries a commented cites line with the exact trim,
  case, preamble, all-capability constitution and pending-delta scope, and
  revision-excerpt feed. The strengthened template arm and its deletion/name
  mutations behaved as expected.
- The cited revision fixture carries a governing heading and a heading outside
  the governing capability list, omits uncited governing headings, reports a
  missing heading in a marker, uses the empty-list author options, and keeps
  the fixture size assertion separate from the live measurement. Task 12
  Mutation A and Mutation B both went red.
- The live size test prints author_chars=27146 and revision_chars=23162 with
  a difference of 3984. The fixture prints author_chars=34483 and
  revision_chars=24306 with a difference of 10177. These are measurements,
  not live-tree size assertions.
- The existing excerpt-budget suite still passed all 23 tests after the
  heading option was present. Its prior text, chars, floor, separator,
  pending-source and truncation assertions remained green.
- The exact-one semantic verdict parser has one definition at
  loop/lib/verdict.mjs:227. Production readers call that parser from
  loop/lib/review.mjs, loop/lib/carry.mjs and lib/reviews.mjs; no second
  Requirement-heading parser exists in review.mjs. The dedicated legacy
  parser-control test passed 1 test, 1 pass, 0 fail. No separate cardinality
  assertion was found; the source search and parser-control test are the
  enforcement available in this tree.
- The portability and naming enforcement passed together: 16 tests, 16 pass,
  0 fail. This includes the exhaustive loop/config model-provider-harness
  scan, the machinery runner-id scan, and the no unarchived change-directory
  reference check.
- The final post-restore targeted group passed 104 tests, 104 pass, 0 fail,
  0 cancelled, 0 skipped, and 0 todo. It used TAP output, so the reported
  test count and fail count were explicit.
- GitNexus had no indexed repository for this worktree, so no graph impact or
  process report was available; no index was created or changed.

## Was the brief faithful to the tasks and the requirements?

The current author brief reproduced the authority commit, task clauses and
permitted scope faithfully, and I did not use it as the standard. RESULT2.md's
final full-suite claim is internally consistent with the final tip and the
paired measurements: it reports one completed final run after 6502b98 with
1763 tests, 1763 pass and 0 fail. Its initial targeted red was explicitly a
development iteration, not the final full-suite result. The report did not
list Task 12 Mutation A or B in its mutation table; I reran both here. More
importantly, the report's green claims do not cover the six green mutations
above, so it is not sufficient evidence for approval.

## What I ran

Commands and real summary output:

    git -C D:\addictedtoai-worktrees\fleet6-stage0-B2 status --short --branch
    git -C D:\addictedtoai-worktrees\fleet6-stage0-B2 rev-parse HEAD
    git -C D:\addictedtoai-worktrees\fleet6-stage0-B2 diff --name-status de400f7..HEAD
    git -C D:\addictedtoai-worktrees\fleet6-stage0-B2 diff --stat de400f7..HEAD
    Output: branch stage0/b2-cited-revision; tip 6502b98; eight permitted
    paths changed; 559 insertions and 55 deletions.

    git -C D:\AddictedtoAI show de400f7:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
    git -C D:\AddictedtoAI show de400f7:openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md
    Output: authority loop revision/empty-list clauses and review cites
    requirement, read read-only from the shared checkout.

    node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief-excerpt-budget.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review-blog-bar.test.mjs
    Final output: 1..104; # tests 104; # pass 104; # fail 0;
    # cancelled 0; # skipped 0; # todo 0.

    node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\portability.test.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\scripts\no-change-dir-refs.test.mjs
    Output: 1..16; # tests 16; # pass 16; # fail 0; # cancelled 0;
    # skipped 0; # todo 0; duration_ms 761.6832.

    node --test --test-reporter=tap D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\brief-excerpt-budget.test.mjs
    Output: 1..23; # tests 23; # pass 23; # fail 0; # cancelled 0;
    # skipped 0; # todo 0; duration_ms 17119.0777.

    node --test --test-reporter=tap --test-name-pattern="THE PARSER CONTROL" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\tests\review-blog-bar.test.mjs
    Output: 1..1; # tests 1; # pass 1; # fail 0; # cancelled 0;
    # skipped 0; # todo 0; duration_ms 311.8619.

    rg -n "^export function parseVerdict|parseVerdict\(" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\lib D:\addictedtoai-worktrees\fleet6-stage0-B2\lib\reviews.mjs
    Output: one definition at loop/lib/verdict.mjs:227 and the expected
    production callers; no second semantic verdict parser.

    rg -n "requirementSections|### Requirement:" D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\lib\specs.mjs D:\addictedtoai-worktrees\fleet6-stage0-B2\loop\lib\review.mjs
    Output: requirementSections is the sole heading parser; review.mjs has
    only the commented template example at line 719.

    git -C D:\addictedtoai-worktrees\fleet6-stage0-B2 diff --check
    Output: no output, exit 0.

The full suite was not run by this reviewer, per the sealed-review hard limit.
The author's RESULT2.md reports this exact final command and completed result:

    npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-B2 test
    Output reported: tests 1763; pass 1763; fail 0; cancelled 0; skipped 0;
    todo 0; duration_ms 431458.4528; wall_ms=432172; exit=0, after final tip
    6502b98.

## Blocked or refused calls

none

## Findings not fixed

All six MUST-FIX coverage findings above remain unfixed because this was a
sealed review with no edit rights.
