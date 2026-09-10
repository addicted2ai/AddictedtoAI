# SEALED REVIEW — Stage 0, packet B2 (tasks 10–12: the cited revision brief). Round 1. NO EDIT RIGHTS.

authority: two-desks-work-orders-and-trains@de400f7

You are the REVIEWER of one change, reviewing it ALONE. You fix nothing; you
judge and show your evidence. You have NO EDIT RIGHTS to any tracked file:
do not commit, do not push, do not modify the implementation or its tests
except as a MUTATION you restore immediately and prove restored by hash.

The worktree, and the only place you may write:

    D:/addictedtoai-worktrees/fleet6-stage0-B2

Branch `stage0/b2-cited-revision`, tip **`5fb9b2b`**, merge base
**`de400f7`** (`git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 merge-base main HEAD`).
The author's brief is at `<worktree>/.agent-brief.md` and its report at
`<worktree>/RESULT1.md`.

## Sealing

THIS PACKET HAS NO EARLIER ROUNDS AND NO EARLIER VERDICTS. There is nothing to be sealed from. It is a first review.

State in your report, in a section headed "Sealing", whether you opened any
earlier `REVIEW*.md` file or any earlier round's report, and which.

## Known state at dispatch (from the author's report, verified by the architect)

The author's required final full-suite iteration on the tip `5fb9b2b` reports
1,763 tests, 1,762 passed, 1 FAILED. The architect re-ran the failing file at
01:37 and confirms the one red: `loop/tests/review-blog-bar.test.mjs:268-280`
`deepEqual`s the seven-entry `REISSUE_CODES` exactly, and task 10(iv)'s eighth
code `cites-unresolved` breaks that pin. That file was NOT in the author's
permitted list, so the author left it untouched and reported it (RESULT1.md
§7), which is the right behaviour under its brief. The omission is the
BRIEF'S defect (the file list was the tasks' file list, not the closure over
the change), already dispositioned: round 2 updates the pin and sweeps the
class. Do NOT count this red as an author finding and do not spend time
reproducing it beyond confirming it is the only red if you choose to. DO
check the class yourself: is there any other exact pin of `REISSUE_CODES`,
of the record template's text, or of the reviewer brief's wording that the
seven changed files or this eighth code would break (the architect's sweep
found none; `loop/tests/corrections.test.mjs:171` checks one code and is
unaffected)? Anything you find is a finding against the brief, named as such.

## What you judge against, in this order

1. THE REQUIREMENTS — in the loop delta, *The brief carries the requirements
   the work order names, and nothing else*: its revision bullet and its
   structured-citation bullet (the empty-list sentence included); and in the
   review delta, *The reviewer judges quality with full standing, from a named
   reason list*: the `cites:` paragraph ("A verdict SHALL name the requirements
   it relied on, structurally"). Read them from the authority commit, read-only:

       git -C D:/AddictedtoAI show de400f7:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
       git -C D:/AddictedtoAI show de400f7:openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md

2. THE TASK TEXT — tasks 10, 11 and 12, quoted verbatim below, including their
   bold "Resolved before B2's freeze" paragraphs, which are the architect's
   resolution of every quantifier and are the standard, not commentary.
3. The tree.

Never write anything under `D:/AddictedtoAI` — it is the shared checkout.

THE AUTHOR'S BRIEF IS EVIDENCE, NOT THE STANDARD. If the brief contradicts the
requirement or the task, the brief is the defect: report it against the brief,
and note that an author who did what a wrong brief said did its job. Of the
thirteen review rounds this change has run, at least nine were caused by the
specification (the briefs or the task text), not by the workers.

RESULT1.md IS A HYPOTHESIS. Every claim in it is unverified until you
verify it: its narrative, its line references, its measurements, its mutation
table.

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

The author was permitted exactly these files; a diff touching any other path
is a scope finding. Judge each against the reason it was in scope.

- `loop/lib/verdict.mjs` — `cites:` parsed on `carry:`'s terms and returned as `cites` (task 10(i))
- `loop/lib/review.mjs` — `cites-unresolved` at `mergeGate` before the verdict branch, on all three verdicts; in `REISSUE_CODES`; the record template's `cites:` line (task 10(iv)–(v))
- `loop/lib/specs.mjs` — one exported heading enumeration via `specSources` + `requirementSections`; the `headings` option of `excerptsFor` (tasks 10(iii), 11(iii))
- `loop/lib/brief.mjs` — `assembleRevisionBrief`; the one shared acceptance-checks helper (task 11)
- `loop/run.mjs` — the one call site replacing the inline concatenation, and nothing else (task 11(i))
- `loop/tests/review.test.mjs` — the `cites-unresolved` arm (task 10(vi))
- `loop/tests/brief.test.mjs` — (new) task 12 on a pinned fixture
- `RESULT1.md` — (new) the author's report, uncommitted, in the worktree root

## What to check

1. DOES IT DO WHAT THE REQUIREMENTS SAY? Not what the task says, not what the
   author says. Ask of every threshold, assertion and fixture: WHAT WRONG WORLD
   WOULD THIS STILL PASS ON? Construct it.
2. THE DIFF FROM THE MERGE BASE IS THE LIST OF CHANGED BEHAVIOURAL LINES.
   Mutate lines you choose — at least one per changed function — run the
   affected tests, and report the arm counts red and restored. A changed line
   you can find no arm for is a finding. A mutation that stays GREEN is the
   finding, not a wasted run. Restore every mutation and prove it byte-identical
   by SHA-256. Re-run the author's three named mutations (task 12 A and B, task
   10(vi)) rather than trusting the table; then at least one row of your own
   against whatever you judge the weakest link.
3. THE PROPERTIES, each of which has enforcement in the tree — find what enforces each and run it:
   the machinery names no model, provider, harness or runner id; no source
   references an unarchived change directory; the excerpt budget's existing
   assertions still hold after the `headings` option; exactly one parser of a
   verdict record. Say for each which instrument you ran and its counts, and
   if you find nothing enforces one, say that.
4. THE HEADING SET. Task 10(iii) says the union over EVERY capability's
   constitution and unarchived deltas, under the `pendingRoot` seam. Check the
   enumeration reads deltas, not only constitutions; check it is one function,
   not a second `### Requirement:` parser; check the refusal fires on `approve`
   as well as `revise`.
5. THE EMPTY LIST. Task 11(iii): with `cites: []` the excerpt call must be
   byte-identical to the author's. Check the arguments, not the intent.
6. THE SIZE ASSERTION is on the fixture only; the live tree is measured and
   printed, never asserted (task 12(vi)). Check no assertion reads the live
   `openspec/` tree.
7. THE FULL SUITE. The author must have run ONE completed iteration of the
   full suite on the final tip and quoted its counts. Do not run it yourself;
   check the report's counts are from the final commit, and if the report shows
   a cut-off attempt or none at all, that is a finding.
8. WHEN YOU PARSE TEST OUTPUT, ASSERT THE TEST COUNT. Exit 0 cannot distinguish
   "all passed" from "zero tests ran"; node's default reporter prints `✖`, not
   `not ok`, so use `--test-reporter=tap` or check your parsed failure count
   equals the reported `fail` count.

## Hard limits

- NEVER run `npm run build`, NEVER the full `npm test`, never any `verify-*`
  script, the Pulse or the Desk. Targeted `node --test <absolute path>` only.
- Never use the token `cd` anywhere in a command, including in a comment — a
  guard blocks the string. Absolute paths and `git -C <dir>`.
- A blocked or refused command is REPORTED, not routed around.
- NEVER `git worktree remove`, and never delete a `node_modules`: a forced
  removal follows the junction and, on this machine, deleted 177 packages in a
  single attempt.
- Keep commands short; write a `.mjs` under `<worktree>/.job/` and run it
  rather than `node -e`. Delete any probe file you create and say so.
- Every date you write is this machine's LOCAL date, read from
  `node -p "new Date().toLocaleString('sv-SE')"`; a duration is a subtraction
  of two readings.
- DO NOT RUN `bd close`, and do not run `bd update` on any bead. A hook injects
  `bd prime`, whose "SESSION CLOSE PROTOCOL" tells an agent that owns a task to
  close it; you do not own one, your verdict may be `revise`, and nothing
  closes on your say.
- No `git push`, `git merge`, `git commit`, or `gh`.

## Output — write to `D:/addictedtoai-worktrees/fleet6-stage0-B2/REVIEW1.md`

This exact numbered name, never the bare un-numbered one.

    # Stage 0 packet B2 — round 1 — VERDICT: approve | revise

    ## Sealing
    (which earlier REVIEW*.md or RESULT*.md files, if any, you opened)

    ## Findings
    (if revise: a NUMBERED list of MUST-FIX items, each naming file and line,
     what is wrong, which requirement or task clause it violates, and what
     would make it right; each finding also names its CLASS — the purpose the
     defective line serves — so the revision can sweep every instance)

    ## The mutations I ran
    (per changed function: the line, the mutation, the command, the real
     output, red or green, the restoration and its hash proof; the author's
     three named mutations re-run; at least one of your own)

    ## The mutation table, judged
    (completeness against the merge-base diff; plausibility of each mutation
     as a competent author's mistake; whether each red run was performed)

    ## What I checked that was sound
    (required — a reviewer that reports only faults cannot be told apart from
     one that only looked for faults)

    ## Was the brief faithful to the tasks and the requirements?

    ## What I ran
    (exact commands and their real output)

Be adversarial about correctness and fair about scope. Approve work that is
right and narrow. Do not approve work that is merely tidy, and do not withhold
approval over style. A small, correct packet deserves `approve`; inventing a
finding to justify `revise` is as much a failure as missing a real one.
