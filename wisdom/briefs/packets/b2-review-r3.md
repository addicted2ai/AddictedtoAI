# DELTA REVIEW — Stage 0, packet B2 (tasks 10–12), round 3. NO EDIT RIGHTS.

authority: two-desks-work-orders-and-trains@de400f7

You are the REVIEWER of a tests-only revision round, reviewing it ALONE with
NO EDIT RIGHTS: do not commit, do not push, do not modify any tracked file
except as a MUTATION you restore immediately and prove restored by hash.

The worktree, and the only place you may write:

    D:/addictedtoai-worktrees/fleet6-stage0-B2

Branch `stage0/b2-cited-revision`, tip **`e413ebe`**, merge base
**`de400f7`**. The previous round's tip was `6502b98`; this round's
diff is `git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 diff 6502b98..HEAD`
and must touch ONLY `loop/tests/brief.test.mjs` and `loop/tests/review.test.mjs`
— any other tracked path in it is a finding and a full-review trigger.

## This is a DELTA review, and it is NOT sealed — say so

You are GIVEN the previous sealed review, `<worktree>/REVIEW2.md`,
because you need it: this round exists to build the six arms it found
missing. The author's report is `<worktree>/RESULT3.md` (a hypothesis)
and its brief `<worktree>/.agent-brief.md` (evidence). State in a section
headed "Sealing" that you read REVIEW2.md and were not sealed
from it.

## What you judge, in this order

1. EACH OF THE SIX FINDINGS in REVIEW2.md now has an arm: re-run
   the NAMED MUTATION of each finding yourself (the exact mutation
   REVIEW2.md ran, at the line it names, against the current
   production code), record the arm RED with its `# pass`/`# fail` counts,
   restore by SHA-256, record GREEN. An arm the author claims red that stays
   green under you is a finding; an arm that goes red against the UNMUTATED
   code is a production defect the author was told to stop on — check §7 of
   the report says so.
2. THE SWEEP: the author was required to enumerate every changed behavioural
   line of the merge-base diff (`git diff de400f7..HEAD -- loop/lib loop/run.mjs`)
   and arm or account for each, in a section of its own in the report. Read
   the diff yourself. For at least THREE changed lines the author's list does
   not name as armed by one of the six new arms, mutate and run — a green one
   is a finding and, since two sealed reviews of this diff already found
   different unarmed lines, expect to find one.
3. THE DIFF-AS-THE-LIST on THIS round's changed TEST lines: a test arm is
   itself behaviour; for each new arm, ask what wrong world it still passes
   on (an assertion on presence rather than position; a sentinel that could
   match the constitution text; a cap that does not actually bind).
4. THE FULL SUITE: the author must have run ONE completed iteration on the
   final tip and quoted its counts (1,763 or more, 0 failed); a cut-off, a
   red, or counts from an earlier commit is a finding.
5. THE STANDING PROPERTIES — find what enforces each and run it: the machinery
   names no model, provider, harness or runner id; no source references an
   unarchived change directory.
6. WHEN YOU PARSE TEST OUTPUT, ASSERT THE TEST COUNT (`--test-reporter=tap`).

## The standard (verbatim, `tasks.md` at the authority commit)

> - [ ] 10. `loop/lib/verdict.mjs` and `loop/lib/review.mjs`: a verdict record MAY
>       carry a structured `cites:` list of requirement headings, validated against
>       the live specification's headings the way reasons are validated against the
>       closed reason list; a heading resolving to no requirement is refused.
>       Implements: *The reviewer judges quality with full standing, from a named
>       reason list*, the `cites:` bullet.
>       **Resolved before B2's freeze (the architect's quantifier enumeration,
>       2026-09-08 23:05, from the code at the tip):** (i) `cites:` is read by
>       `parseVerdict` from front matter only, on `carry:`'s terms — a scalar is a
>       one-entry list, each entry is trimmed, duplicates collapse, absent or
>       empty is `[]` (the ordinary case, not a warning) — returned as `cites`,
>       never altering the verdict value. (ii) A "requirement heading" is the text
>       after `### Requirement:` on its heading line, trimmed, exactly as
>       `requirementSections` (`specs.mjs:139`) reads it; `(preamble)` is not a
>       heading; membership is exact after trimming with no case folding, the way
>       `REASONS.includes` is exact. (iii) "The live specification's headings" is
>       the union over EVERY capability under `openspec/specs/` — not only the
>       governing type's — of the headings in its constitution and in every
>       unarchived change's delta for it, read through `specSources` under the
>       same `pendingRoot` seam `excerptsFor` uses so a fixture can pin it; the
>       enumeration is ONE exported function in `loop/lib/specs.mjs` beside
>       `requirementSections` (a second `### Requirement:` parser in `review.mjs`
>       is the two-parsers drift `verdict.mjs`'s header warns against). Measured
>       at the tip: 116 constitution headings across 11 files, none duplicated;
>       31 in this change's deltas. (iv) "Refused" means `mergeGate`
>       (`review.mjs:830`) checks `cites` BEFORE the verdict branch, on all three
>       verdict values — reasons are checked only on non-approve, and that
>       asymmetry is not copied: a `revise` citing nothing that exists would send
>       the author a brief built on a missing heading, and an `approve` carrying
>       one names a requirement the specification does not hold — with a new code
>       `cites-unresolved` naming every unresolved entry, and that code joins
>       `REISSUE_CODES` (the record is unusable, not the work; the job ends
>       `failed` and no revision is invoked, as for a blank `would-cite`). (v) The
>       reviewer is told: the record template in `assembleReviewBrief`
>       (`review.mjs:711-730`) gains a commented `cites:` line stating (ii)–(iii)
>       and what the field feeds (task 11); the heading list is not printed (116
>       lines) — the spec files are in the review worktree. (vi) The arm, in
>       `loop/tests/review.test.mjs` beside the other `mergeGate` refusals: a
>       record citing a heading the fixture holds passes; one citing a heading it
>       does not is refused with `cites-unresolved` on `approve` AND on `revise`;
>       named mutation — drop the resolution check and confirm both refusals go
>       green. This task's files are therefore `verdict.mjs`, `review.mjs`,
>       `specs.mjs` (the enumeration) and `review.test.mjs` (the arm).
> - [ ] 11. `loop/lib/brief.mjs`: `assembleRevisionBrief` carries the verdict, the
>       acceptance checks, the diff and the excerpts **for exactly the headings
>       `cites:` names** — and not `briefText` whole (`run.mjs:734`). An empty
>       `cites:` yields the checklist's requirements for the governing type and
>       nothing else. Implements: *The brief carries…*, revision bullets.
>       **Resolved before B2's freeze (2026-09-08 23:05):** (i)
>       `assembleRevisionBrief` is a NEW export of `brief.mjs`, and
>       `run.mjs:733-738`'s inline concatenation becomes its one call — `run.mjs`
>       is in B2's files for that call site only, because a function nothing
>       calls is the mechanism the memory index's statement 5 warns about:
>       passing tests say a path works, never that it runs. (ii) It carries, in
>       this order: a header naming the job, type and branch with the
>       continuing-invocation sentence (same worktree, no prior conversation);
>       the accounting block as now (`invocationAccounting`; the "supersede the
>       figures above" sentence goes, since the original figures are no longer
>       sent); the VERDICT — value, reasons, the free-form notes, and the
>       diff-measured refusal reason when `isDiffRefusal` holds (the `findings`
>       composition at `run.mjs:709-715` becomes the assembler's input); the
>       ACCEPTANCE CHECKS — the author brief's "## Acceptance checks" section
>       (`acceptanceChecksFor(type)` plus the generated gates line) rendered by
>       ONE shared helper both assemblers call, so they cannot differ; the DIFF
>       under revision — `diffText` as passed to `runReview` (`run.mjs:587`, the
>       string the reviewer judged); the EXCERPTS per (iii); then `GROUND_RULES`
>       and `RESULT_PROTOCOL_INSTRUCTION` (a revision is an unattended invocation
>       that must end in RESULT.md, and the ground rules are repeated in every
>       brief by rule). Not `briefText`, not the outcome section, not the "what
>       happens next" prose. (iii) `excerptsFor` gains a `headings` option: when
>       it names one or more headings the plan is exactly the sections whose
>       heading is in that set — in every capability that holds it (unique across
>       constitutions today; a duplicate would be carried for each), constitution
>       first then that heading's pending amendments — under
>       `BRIEF_EXCERPT_MAX_CHARS` with the same floors, markers and cut, keyword
>       scoring bypassed. When `cites` is empty the call is byte-identical to the
>       author's (`{subjects: [], maxChars, pendingRoot}`), task 5's Stage 0
>       reading. (iv) A cited heading is resolvable here because task 10's gate
>       refused the record otherwise; the assembler still names, in a one-line
>       marker, any heading it could not find — never silently.
> - [ ] 12. `loop/tests/brief.test.mjs`: a revision brief is strictly smaller than its
>       author brief, contains the excerpt for each cited heading, and contains no
>       section for an uncited one. **Mutation A**: prepend the whole original brief
>       and confirm the size assertion fails. **Mutation B**: ignore `cites:` and
>       send the governing type's whole checklist, and confirm the
>       no-uncited-section assertion fails — omission and padding must both be
>       caught. Tests tasks 10–11.
>       **Resolved before B2's freeze (2026-09-08 23:05):** (i)
>       `loop/tests/brief.test.mjs` is NEW — no file of that name exists; four
>       `brief-*.test.mjs` siblings do. (ii) The fixture is a pinned corpus under
>       the OS temp directory via `makeRepo` with the `pendingRoot` seam
>       (`brief-excerpt-budget.test.mjs:59-80` is the pattern): a governing type
>       whose `SPECS_FOR_TYPE` lists two or more capabilities, each constitution
>       holding two or more `### Requirement:` sections, with enough text that
>       the author brief's excerpts outweigh the revision's diff and notes; the
>       fixture's diff and notes contain no `### Requirement:` line. (iii) The
>       fixture's `cites` names exactly two headings — one governing capability's
>       named section and one section of a capability OUTSIDE the governing list
>       — and omits the other governing capability's named section, so Mutation
>       B both admits an uncited section and drops the outside one. (iv) A
>       "section" is a `### Requirement: <H>` line in the brief's excerpt part;
>       "contains the excerpt for each cited heading" and "no section for an
>       uncited one" are asserted on that line set against the corpus's WHOLE
>       heading set, unfiltered (task 8's lesson). (v) A third assertion, for
>       task 11's empty-list clause: with `cites: []` the revision brief's
>       heading set equals the author brief's. (vi) Sizes are asserted on the
>       fixture only; the live tree's author and revision sizes for one type are
>       measured and printed, never asserted (task 8). (vii) The
>       `cites-unresolved` arm lives in `review.test.mjs` (task 10(vi)), not
>       here.
>

## Files

The author was permitted exactly these; anything else in this round's diff is
a scope finding.

- `loop/tests/brief.test.mjs` — (new) on this branch since round 1; arms for findings 2, 3, 4, 5
- `loop/tests/review.test.mjs` — arms for findings 1 and 6
- `RESULT3.md` — (new) the author's report, uncommitted, in the worktree root

## Hard limits

- NEVER run `npm run build`, NEVER the full `npm test`, never any `verify-*`
  script, the Pulse or the Desk. Targeted `node --test <absolute path>` only.
- Never use the token `cd` anywhere in a command, including in a comment — a
  guard blocks the string. Absolute paths and `git -C <dir>`.
- A blocked or refused command is REPORTED, not routed around.
- NEVER `git worktree remove`, and never delete a `node_modules`.
- Keep commands short; write a `.mjs` under `<worktree>/.job/` and run it
  rather than `node -e`. Delete any probe file you create and say so.
- Every date you write is this machine's LOCAL date, read from
  `node -p "new Date().toLocaleString('sv-SE')"`.
- DO NOT RUN `bd close`, and do not run `bd update` on any bead.
- No `git push`, `git merge`, `git commit`, or `gh`.

## Output — write to `D:/addictedtoai-worktrees/fleet6-stage0-B2/REVIEW3.md`

This exact numbered name, never the bare un-numbered one.

    # Stage 0 packet B2 — round 3 (delta) — VERDICT: approve | revise

    ## Sealing
    (that you read REVIEW2.md, and anything else you opened)

    ## Findings
    (if revise: NUMBERED must-fix items, each with file and line, what is
     wrong, what would make it right, and its CLASS)

    ## The six arms, re-run
    (per finding: the named mutation, the command, red counts, restoration
     hash, green counts)

    ## The sweep, checked
    (the three or more extra lines you mutated, each red or green)

    ## What I checked that was sound

    ## What I ran
    (exact commands and their real output)

Approve work that is right and narrow; a small correct round deserves
`approve`, and inventing a finding to justify `revise` is as much a failure
as missing a real one.
