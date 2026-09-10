# Packet B2 — tasks 10–12 of `two-desks-work-orders-and-trains` (author brief, round 1)

authority: two-desks-work-orders-and-trains@de400f7

You are a codex worker, alone and unattended, in the git worktree
`D:/addictedtoai-worktrees/fleet6-stage0-B2` on branch `stage0/b2-cited-revision`,
checked out at `de400f7`. `node_modules` is a junction to the main checkout —
do not run `npm install`. This brief is everything you have: no prior
conversation, no session to resume. The standard you implement is quoted
verbatim below from `openspec/changes/two-desks-work-orders-and-trains/tasks.md`
at the authority commit; where this brief's prose and the quoted text differ,
the quoted text wins. Its bold "Resolved before B2's freeze" paragraphs are
the architect's resolution of every quantifier in the tasks — they are the
spec, not commentary.

## Ground rules (non-negotiable)

- Never use the token `cd` anywhere — not in a command, a comment, or a
  script: the approval guard matches the token and refuses the call. Run
  everything by absolute path; git is `git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 ...`.
- Keep shell commands short; put anything multi-step in a `.mjs` file under
  `D:/addictedtoai-worktrees/fleet6-stage0-B2/.job/` and run that.
- Do NOT run `npm run build`, any `scripts/verify-*.mjs`, the Pulse, the Desk,
  `git push`, or `bd close`. Do not edit `package.json`, `runners.yml`,
  `data/config.json`, `CLAUDE.md`, `AGENTS.md`, anything under `data/`, or
  any file outside the "## Files" list below.
- Nothing under `lib/`, `loop/`, `scripts/`, `app/` or `tools/` may name a
  model, provider, harness or runner id, or reference an unarchived change
  directory (`openspec/changes/<name>/`). Both properties have enforcement in
  this tree — find what enforces each and run it (see "## Properties").
- If a tool call is blocked or refused, record it in `RESULT1.md` and stop
  that step; do not route around it and do not edit any permission file.
- All dates are the machine's LOCAL date.

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

Work only in these files. Every other path is out of scope; a diff that
touches one is a scope violation at review.

- `loop/lib/verdict.mjs` — parse `cites:` from front matter on `carry:`'s terms; return it as `cites` (task 10(i))
- `loop/lib/review.mjs` — `mergeGate` refusal `cites-unresolved` before the verdict branch on all three verdicts; the code joins `REISSUE_CODES`; the commented `cites:` line in the record template of `assembleReviewBrief` (task 10(iv)–(v))
- `loop/lib/specs.mjs` — the one exported heading enumeration beside `requirementSections`; the `headings` option of `excerptsFor` (tasks 10(iii), 11(iii))
- `loop/lib/brief.mjs` — `assembleRevisionBrief` (new export) and the one shared acceptance-checks helper both assemblers call (task 11)
- `loop/run.mjs` — the ONE call site: the inline revision-brief concatenation near line 733 at the authority commit becomes the call; nothing else in this file changes (task 11(i))
- `loop/tests/review.test.mjs` — the `cites-unresolved` arm beside the other `mergeGate` refusals (task 10(vi))
- `loop/tests/brief.test.mjs` — (new) task 12, all assertions on the pinned fixture
- `RESULT1.md` — (new) your report, in the worktree root; see "## How to end"

`loop/tests/helpers.mjs` is read-only: use `makeRepo` as
`brief-excerpt-budget.test.mjs` does. If you believe a file outside this list
must change, do not change it — describe the need in `RESULT1.md` with the
line and the reason.

## Properties (find what enforces each, and run it)

These are properties of the tree that must hold after your change. Do not
assume which test enforces which; find it, run it, and quote the result.

- The machinery names no model, provider, harness or runner id outside
  `runners.yml` — a test under `loop/tests/` enforces this; find it and run it.
- No source under `lib/`, `loop/`, `pulse/`, `scripts/`, `app/`, `tools/`
  references an unarchived change directory — a test under `scripts/`
  enforces this; find it and run it.
- There is exactly one parser of a verdict record (`verdict.mjs`'s header
  says why); `cites` is read there and nowhere else — find whether anything enforces this;
  if nothing does, say so in `RESULT1.md` (do not add a test for it — it is
  outside tasks 10–12).
- The excerpt budget's existing assertions still hold — `loop/tests/brief-excerpt-budget.test.mjs` enforces them;
  run it after changing `excerptsFor`.
- Every date written by the code is local — `scripts/local-dates.test.mjs` enforces the source-level rule;
  run it if you write any date code (you should not need to).

## Mutations (perform, observe red, restore; table in RESULT1.md)

The review takes the diff from the merge base as the list of changed
behavioural lines and expects at least one mutation per changed function,
each with its red run and its restored green run recorded. A changed line
with no arm is a finding. The three named mutations below are required; add
one per changed function beyond them.

- Task 12 Mutation A: prepend the whole original brief to the revision brief;
  the size assertion goes red. Restore.
- Task 12 Mutation B: ignore `cites:` and send the governing type's whole
  checklist; the no-uncited-section assertion goes red (and the cited outside
  heading disappears — say whether that assertion went red too). Restore.
- Task 10(vi): drop the resolution check in `mergeGate`; both `cites-unresolved`
  refusals (on `approve` and on `revise`) go green. Restore.

For each row: the mutation in one line, the file and line, the command, the
red output's last lines verbatim (the `# pass`/`# fail` counts), the restored
output's counts.

## How to work

1. Read `loop/lib/verdict.mjs`, `loop/lib/review.mjs` (the `REISSUE_CODES`
   block, `assembleReviewBrief`'s record template, `mergeGate`),
   `loop/lib/specs.mjs` (`specSources`, `requirementSections`, `excerptsFor`),
   `loop/lib/brief.mjs` (`assembleBrief`, `resumeBrief`), `loop/run.mjs`
   from the review pass through the revision (the `findings` composition and
   the revision brief), `loop/tests/brief-excerpt-budget.test.mjs` (the
   fixture pattern) and `loop/tests/review.test.mjs` (the `mergeGate` tests).
2. Implement task 10, then 11, then 12, running the targeted tests as many
   iterations as you need:
   `node --test loop/tests/review.test.mjs loop/tests/brief.test.mjs loop/tests/brief-excerpt-budget.test.mjs`
   (run from the worktree root by absolute path). Task 12(vi)'s live
   measurement prints from the test; copy the printed numbers into
   `RESULT1.md` beside the fixture's numbers — both together, always.
3. Run the enforcement for every property in "## Properties".
4. Perform the mutations and fill the table.
5. Commit ONLY the seven code and test files named above (`git add` each by
   path; never `git add -A`): one commit per task is ideal, one commit for
   all three is acceptable. Do not add `RESULT1.md` or `.agent-brief.md`.
6. LAST, on the committed tip, ONE final iteration of the full suite:
   `npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-B2 test`
   with a timeout of at least 600 seconds. A completed suite is required for
   merge; if the harness cut it off at a cap, that iteration was not an
   attempt that counts — run it again. Record its `# pass` / `# fail` counts
   and wall time.
7. Write `RESULT1.md`.

## How to end (required)

Write `D:/addictedtoai-worktrees/fleet6-stage0-B2/RESULT1.md` — this exact
name, numbered, never the bare un-numbered name — with these sections, in
this order:

1. **Commits** — each sha and its one-line message; the output of
   `git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 log --oneline main..HEAD`.
2. **What changed, per file** — for each of the seven files, what it now does
   that it did not; for `specs.mjs` name the new export and the `headings`
   option's exact semantics; for `run.mjs` quote the replaced lines' range.
3. **Tests run** — every command and the last lines of its output verbatim
   (`# pass N`, `# fail N`); the targeted tests, every property's enforcement,
   and the final full-suite iteration with its wall time.
4. **Mutation table** — one row per mutation as described above.
5. **Paired numbers** — task 12's fixture sizes (author brief chars, revision
   brief chars, and the difference) beside the live tree's printed sizes for
   the same job type; say which is a bound and which is a measurement.
6. **Blocked or refused calls** — each one, verbatim, or "none".
7. **Findings not fixed** — anything you saw that this brief's files could not
   fix, with file and line and numbers; or "none". Nothing is deferred silently.
