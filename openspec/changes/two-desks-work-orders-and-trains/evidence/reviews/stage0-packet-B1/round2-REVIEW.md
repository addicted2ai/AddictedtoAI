# Stage 0 packet B1 round 2 — VERDICT: revise

## Findings

1. **A positive pending section can be admitted without a constitutional requirement to amend.** `loop/lib/specs.mjs:315-317` falls back to the first positive-scoring delta section when `namedHeadings` is empty. The requirement permits pending-amendment deltas for the named requirements only, and task 5 removes the old first-section/zero-score exception. A fixture with an unrelated constitution and a positive-scoring pending heading produced `hasPendingOnlyHeading: true` and emitted that pending heading. When the constitution names no requirement, the delta candidate set must be empty (or otherwise be proven to match a constitutional heading); it must not fall back to keyword score alone.

2. **The constitution floor is not guaranteed when the total cap is smaller than the floor minimums.** `loop/lib/specs.mjs:325-348`, especially `:341-348`, skips a floor whenever `budget <= 0`. With three named constitution requirements and `maxChars: 500`, the result had `chars: 500`, `hasPulse: false`, `hasSite: true`, `hasReview: true`, and two cut markers. That violates the stated conflict behavior: every constitution must be represented before any amendment is admitted, even when the constitutions have to be represented as cuts. The same path can also slice a marker before it names the requirement/path. The allocation needs a defined compact representation that preserves every constitution floor in priority order and admits no amendment while the floor is unresolved; it may not silently omit an earlier capability.

3. **The Stage 0 subject wiring does not consume the source record named by the task, and real subject paths are not converted to capabilities.** `loop/lib/brief.mjs:662-674` selects several optional fields and then falls back to `target`, `raw.subject`, and `id`. `loop/lib/specs.mjs:239-247` recognizes only a capability name or a path containing `specs/<capability>`. The actual source record written by the caller at `loop/run.mjs:1332-1343` contains `job`, `type`, `source`, `slug`, `path`, and `issues`, but no subject-path list. Thus a real content target/queue subject is silently ignored, while the focused test only proves the synthetic `subjects: ['site']` case. Task 5 says the Stage 0 caller supplies the subject paths already named by `.job/source.json`; if that requires a caller change outside the four permitted files, it must be reported as a scope blocker and implemented in the authorized change, not replaced by a heuristic fallback.

4. **The mutation table is incomplete despite claiming complete coverage.** `RESULT.md:86-110` supplies rows for the main allocation choices, but the rewrite also changes behavioral seams at `loop/lib/specs.mjs:237-257` (subject normalization and the overload), `:290-296` (source collection returned through `files`), and `:376-405` (truncation calculation and rendered-output filtering). None has its own plausible mutation row or a specific NON-BEHAVIOURAL reason. The test fixture constructors and measurement-only printing are reasonably declared non-behavioral, but the subject/parser and output decisions are not. Add rows that mutate those seams and identify the failing arms, or explicitly justify only lines that truly cannot affect behavior.

## The mutations I re-ran myself

The focused command was always:

    node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs

Every run reported `tests 15`; no mutation was accepted on an exit code alone. Before the first mutation the four hashes were captured. After each restoration, the changed file returned byte-identically to its corresponding value below, and `git status --short -- <path>` showed no tracked mutation.

| Row | Mutation applied | Real red output | Restoration proof |
|---|---|---|---|
| 1 | Admit every positive delta section in `specs.mjs` | exit 1; 13 passed, 2 failed: whole-heading equality gained two surplus headings; surplus fixture was 34,448 characters | `specs.mjs` before = after = `4F6B9B38012D5A779305FB076BACDFA78B6FF116D83497A02013A4B4C335F170` |
| 2 | Admit the first non-preamble delta even with score zero | exit 1; 14 passed, 1 failed: `a zero-score pending section is not admitted as a named requirement` | same `specs.mjs` hash |
| 3 | Replace the floor's remaining-budget calculation with `Math.floor(maxChars / plan.length)` | exit 1; 11 passed, 4 failed: whole heading set lost `END-pulse`; binding fixture was 30,646; `interpret contains a cut`; constitution-floor `END-pulse` arm | same `specs.mjs` hash |
| 4 | Restore the ceiling from 24,000 to 88,000 | exit 1; 12 passed, 3 failed: ceiling equality; binding fixture was 60,831; bounded-guidance regex absent | `config.mjs` before = after = `F54F4E28F1604A5DCD55FBED1DBC81191DCCA185D9B7AF6AC2B960D6ABC9303C` |
| 5 | Pass `subjects: []` from `brief.mjs` | exit 1; 14 passed, 1 failed: assembled subject arm did not contain `specs/site` | `brief.mjs` before = after = `1C57B5D6B966DE4738EC84DAAFB0E1ADAA36F191AD3B738BC39EF21EFD7ED87A` |
| 6 | Restore the old `targeted and truncated` guidance | exit 1; 14 passed, 1 failed: corrected `relevant material was omitted or cut` guidance absent | same `brief.mjs` hash |
| 7 | Omit `blog` from the pinned constitution corpus | exit 1; 14 passed, 1 failed: `post is missing blog` | `brief-excerpt-budget.test.mjs` before = after = `B0B748D6F87B7E2FC9AD7B1BF7221557B0F3F6BD5E3C86045FEF7FBA55110840` |
| 8 | Replace the tail marker with a raw fragment (`section.text.slice(0, budget)`) | exit 1; 14 passed, 1 failed: binding fixture was 37,811 characters | same `specs.mjs` hash |
| 9 | Remove the constitution floor collection | exit 1; 8 passed, 7 failed: old-cut preconditions, subject order, whole-set presence, binding fixture 35,111, all-capability presence, and floor `END-pulse` arms | same `specs.mjs` hash |
| own | Disable direct capability-name subject recognition in `capabilityFromSubject` | exit 1; 14 passed, 1 failed: `declared subject capabilities follow the governing capabilities` | same `specs.mjs` hash |

Rows 1, 2, 3, 4, 5, 6, 7, 8, and 9 were all independently re-run, not inferred from the report. The independent boundary probe was also restored/deleted after use and printed:

    positive pending heading absent from constitution: hasPendingOnlyHeading=true
    cap smaller than all constitution floors: chars=500, hasPulse=false, hasSite=true, hasReview=true, cuts=2

## The mutation table, judged

Completeness fails. The nine rows cover the central allocation decisions and the fixture's named dependencies, but they do not cover every behavioral changed line or declare those seams non-behavioral with a reason. The missing subject/parser and output/truncation seams are material, not filler.

Plausibility is sound. Each listed mutation is a mistake a competent author could make: restoring surplus admission, restoring the zero-score fallback, reintroducing per-source arithmetic, raising the measured ceiling, dropping subject forwarding, reverting the wording, omitting a required fixture capability, reverting tail markers, or removing floor reservations. My direct-capability mutation was equally plausible.

The recorded runs were actually performed. I re-ran every row, asserted 15 tests each time, observed the red arm(s), restored immediately, and verified the file hash. The reported counts and the measured values above match the committed tree. The table's claim of complete changed-line coverage does not follow from that successful red-run evidence.

## The new allocation

No executable per-source share survives in `specs.mjs`: allocation uses one `used` counter and one `maxChars` cap. `plan.length` is only used for the empty-plan guard. The remaining mentions of source shares in `config.mjs` are retained historical measurement prose, not an allocation mechanism.

For ordinary fixtures where all floor minimums fit, the priority order is governing capabilities, then subject capabilities, with each constitution before its pending amendments; the constitution floor is reserved before amendments, and the final rendering preserves plan order. The focused suite and the pinned whole-heading comparisons confirm that normal case.

The floor is not really guaranteed under a floor/cap conflict: the 500-character probe omitted the first constitution and emitted later partial cuts. Amendments were not admitted in that probe, but omission of a named constitution is already a failure of the floor. The total excerpt counter itself stays at or below the cap, and the pinned assembled fixtures stay within the 30,000-character artifact bound; the live measurement is intentionally non-asserting per task 8 and printed `largest=41043` with `post,repair,prune` cut types.

## What I checked that was sound

- The merge-base is `fbe1306`, and the round-2 diff is exactly the four permitted tracked files: `loop/lib/specs.mjs`, `loop/lib/config.mjs`, `loop/lib/brief.mjs`, and `loop/tests/brief-excerpt-budget.test.mjs`. No `package.json` change or new `loop/tests/specs.test.mjs` exists.
- The clean committed baseline and final restored tree both pass the focused suite: `tests 15`, `pass 15`, `fail 0`. The final live measurement is reproducible: largest 41,043; `post`, `repair`, and `prune` have cuts.
- Portability passes: `tests 12`, `pass 12`, `fail 0`. No forbidden model/provider/harness/runner naming or change-path reference was introduced under the checked machinery paths.
- The pinned corpus contains every capability named by `JOB_TYPES`, the pending-versus-zero heading comparison uses whole heading sets without filtering, and the opposite surplus/binding conditions are live; rows 1, 4, and 7–9 demonstrate those arms are not vacuous.
- The implementation has no live per-source divisor or old saturation pass, and direct subject-capability ordering works in the covered synthetic case.
- I did not run the build, full suite, any `verify-*` script, the Pulse, push, merge, or any beads mutation, as the sealed limits require.

## Was the brief faithful to the task and the requirement?

Partly. It correctly describes the single total cap, priority ordering, normal floor-before-amendment behavior, the removal of the per-source denominator, the pinned fixtures, and the live measurement. It is not faithful at the edges that matter here: it claims that constitutions remain represented when the floor and cap conflict even though the implementation omits one, and it presents heuristic job fields as the Stage 0 source-record subject wiring even though the committed source record has no subject list. Its claim that the mutation table covers the rewrite is also false for the added subject/parser and output/truncation behavior.

## Did you read REVIEW.md?

No. It was never opened, before or after forming these findings and before writing this file.

## What I ran

    git -C D:\addictedtoai-worktrees\fleet6-stage0-B1 merge-base main HEAD
    # fbe13066d1458effcc76451dbea0ac6157fcd995

    git -C D:\addictedtoai-worktrees\fleet6-stage0-B1 diff --name-status fbe1306..HEAD
    # M loop/lib/brief.mjs
    # M loop/lib/config.mjs
    # M loop/lib/specs.mjs
    # M loop/tests/brief-excerpt-budget.test.mjs

    git -C D:\addictedtoai-worktrees\fleet6-stage0-B1 diff --name-status 97b31b3..439d083
    # the same four permitted files

    node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\brief-excerpt-budget.test.mjs
    # exit 0; tests 15; pass 15; fail 0

    node --test D:\addictedtoai-worktrees\fleet6-stage0-B1\loop\tests\portability.test.mjs
    # exit 0; tests 12; pass 12; fail 0

    node D:\addictedtoai-worktrees\fleet6-stage0-B1\review-probe.mjs
    # exit 0; positive pending heading absent from constitution: hasPendingOnlyHeading=true
    # exit 0; cap smaller than all constitution floors: chars=500, hasPulse=false,
    # hasSite=true, hasReview=true, cuts=2
    # The temporary probe was then deleted.

The mutation command for every row was the focused `node --test` command shown above; each row's patch, red output, immediate restoration, and hash proof are recorded in the mutation section. The final local date reading was `2026-09-08 17:29:22`.
