# Packet B2 — tasks 10–12 of `two-desks-work-orders-and-trains` (author brief, round 2: revision)

authority: two-desks-work-orders-and-trains@de400f7

You are a codex worker, alone and unattended, in the git worktree
`D:/addictedtoai-worktrees/fleet6-stage0-B2` on branch `stage0/b2-cited-revision`,
whose tip is `5fb9b2b` (two commits on top of `de400f7`, by the round-1
author: "Implement cited revision briefs", "Preserve revision pass marker").
`node_modules` is a junction to the main checkout — do not run `npm install`.
This brief is everything you have: no prior conversation. The round-1 report is
at `<worktree>/RESULT1.md` and the sealed review that judged it at
`<worktree>/REVIEW1.md`; read both, but the standard is the quoted task text
below and the findings listed in "## What this round fixes", not either report.

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
  directory. Both properties have enforcement in this tree — find what enforces each, and run it.
- If a tool call is blocked or refused, record it in `RESULT2.md` and stop
  that step; do not route around it.
- All dates are the machine's LOCAL date.

## What this round fixes — the CLASS, then the instances

This round is scoped by CLASS, not by line. Fixing only the lines named here
and leaving another instance of the same class in the same file is the
failure this repository has measured five rounds running; the reviewer will
sweep for it.

### Finding 1 (REVIEW1.md §1) — CLASS: the reviewer-facing record template's contract has no arm

`loop/lib/review.mjs:719-724` is the commented `cites:` instruction in the
verdict-record template (the heading source, trimming and case rule, the
all-capability constitution plus pending-delta scope, and that the field
feeds revision excerpts). The reviewer mutated `# cites:` to `# wrong-cites:`
and `loop/tests/review.test.mjs:172-188` stayed green. Fix, in
`loop/tests/review.test.mjs`: assert that the assembled review brief carries
the `cites:` template line AND its scope and feed wording (the exact text of
`review.mjs:719-724`, or an unambiguous fragment of each sentence), so a
removal or narrowing of the instruction goes red. Named mutation: `# cites:`
→ `# wrong-cites:` red; a deleted scope sentence red. SWEEP the class: every
line the record template gained or changed in round 1 is either covered by
this assertion or listed in `RESULT2.md` with the reason it is not.

### Finding 2 (REVIEW1.md §2) — CLASS: the empty-list fallback's ARGUMENT contract

Task 11(iii) says that with an empty `cites` the excerpt call is
byte-identical to the author's — `{ maxChars: BRIEF_EXCERPT_MAX_CHARS,
subjects: [], pendingRoot: ctx.pendingRoot }`. `loop/lib/brief.mjs:781`
does that; `loop/tests/brief.test.mjs:138-150` compares only heading sets,
so the reviewer's mutation `subjects: ['pulse']` (redundant for `repair`)
stayed green. The property is about the ARGUMENTS, so the arm must observe
them. Fix: give both assemblers ONE optional injection seam for the excerpt
function (packet A's pattern — an optional parameter defaulting to the real
`excerptsFor`, so production behaviour is unchanged and every existing
caller passes nothing), record the options each assembler passes in the
test, and assert the empty-`cites` revision call's options deep-equal the
author call's options (`subjects` exactly `[]`, the same `maxChars`, the
same `pendingRoot`). Named mutation: `subjects: []` → `subjects: ['pulse']`
at `brief.mjs:781` goes red. Keep the existing heading-set assertion beside
it. This touches `loop/lib/brief.mjs`, which is permitted for exactly this
seam and nothing else; state the seam's signature in `RESULT2.md`.

### Finding 3 (REVIEW1.md §3) — CLASS: completion evidence is measured on the FINAL tip

`RESULT1.md:230-231` reported fixture 24,295 / live 23,151 for the revision
brief; the final tip `5fb9b2b` prints 24,306 / 23,162 (the committed
`Revision pass (one only)` marker, 11 characters, landed after the
measurement). The ordering held; the numbers were not of the tip they
claimed. Fix: in `RESULT2.md`, every paired number is taken from a run on
the FINAL committed tip of this round, after the last commit — say which
commit, quote the printed lines verbatim, and keep the live values marked
as measurement only.

### The class from the round-1 suite: an exact pin that the packet's change must move in the same diff

`loop/tests/review-blog-bar.test.mjs:268-280` `deepEqual`s `REISSUE_CODES`
to its seven pre-packet entries; task 10(iv) added the eighth,
`cites-unresolved`, so that test is red on the round-1 tip (the one red in
1,763). The round-1 brief did not permit that file, and the author correctly
left it. Fix: add `cites-unresolved` to the pinned list in its natural place
with a one-line comment naming task 10(iv), keeping the assertion EXACT — an
exact pin is the right direction of strictness here (any deviation means the
premise changed), so do not loosen it to a subset or a length check.
SWEEP the class: every test or script that pins, by exact list, exact string
or snapshot, (a) `REISSUE_CODES` or `DIFF_REFUSAL_CODES`, (b) the verdict
record template text in `assembleReviewBrief`, (c) the revision brief's
wording or section order, (d) `excerptsFor`'s return shape. For each
instance found: fix it in the same way, or list it in `RESULT2.md` with the
reason it needs no change. The sweep's list is a required section of the
report even when it is empty of changes.

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

Work only in these files. Every other path is out of scope.

- `loop/lib/verdict.mjs` — round 1's `cites:` parsing, if a finding names it
- `loop/lib/review.mjs` — `cites-unresolved` at `mergeGate`, `REISSUE_CODES`, the record template line, if a finding names it
- `loop/lib/specs.mjs` — `requirementHeadings` and the `headings` option of `excerptsFor`, if a finding names it
- `loop/lib/brief.mjs` — `assembleRevisionBrief` and the shared acceptance-checks helper, if a finding names it
- `loop/run.mjs` — the one call site, if a finding names it
- `loop/tests/review.test.mjs` — the `cites-unresolved` arms and citation parsing tests
- `loop/tests/brief.test.mjs` — (new) on this branch since round 1: task 12's pinned-fixture tests
- `loop/tests/review-blog-bar.test.mjs` — the exact `REISSUE_CODES` pin at `:268-280` (the class above)
- `RESULT2.md` — (new) your report, in the worktree root; see "## How to end"

Any other file the sweep turns up is NOT yours to edit: list it in
`RESULT2.md` with file, line and what the pin holds, and stop there.

## Mutations (perform, observe red, restore; table in RESULT2.md)

The reviewer takes the diff from the merge base `de400f7` as the list of
changed behavioural lines and re-runs mutations. For every finding you fix:
the mutation that reproduces the finding (the wrong world it names) goes RED
against your fix and restores GREEN; record both. For the pin: revert the
list to seven entries and confirm the test goes red; restore.

## How to work

1. Read `REVIEW1.md`, then `RESULT1.md`, then the files a finding names.
2. Fix each finding at its CLASS: for every instance named, ask where else
   the same purpose is served in the same file and fix those too; list them.
3. Run the targeted tests as many iterations as you need:
   `node --test loop/tests/review.test.mjs loop/tests/brief.test.mjs loop/tests/brief-excerpt-budget.test.mjs loop/tests/review-blog-bar.test.mjs`
   from the worktree root by absolute path.
4. Run the enforcement for the naming and change-directory properties: find what enforces each, and run it.
5. Commit ONLY the files named above (`git add` each by path; never
   `git add -A`); do not add `RESULT2.md` or `.agent-brief.md`.
6. LAST, on the committed tip, ONE final iteration of the full suite:
   `npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-B2 test`
   with a timeout of at least 600 seconds. If the harness cut it off at a cap,
   that iteration does not count as an attempt — run it again. Record its
   counts and wall time. A green suite here is the merge precondition.
7. Write `RESULT2.md`.

## How to end (required)

Write `D:/addictedtoai-worktrees/fleet6-stage0-B2/RESULT2.md` — this exact
numbered name — with these sections, in this order:

1. **Commits** — `git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 log --oneline main..HEAD`.
2. **Findings, each with its class and every instance fixed** — one entry per
   finding in "## What this round fixes": the class, the lines changed, and
   the SWEEP list (every other instance in the file, fixed or with the reason
   it stands).
3. **Tests run** — every command and the last lines of its output verbatim,
   including the final full-suite iteration with its wall time.
4. **Mutation table** — one row per finding and one for the pin.
5. **Paired numbers** — task 12's fixture sizes beside the live tree's printed
   sizes, as in round 1, re-measured on this tip.
6. **Blocked or refused calls** — verbatim, or "none".
7. **Findings not fixed** — with file, line and reason; or "none".
