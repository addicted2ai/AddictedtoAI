# Packet B2 — tasks 10–12 of `two-desks-work-orders-and-trains` (author brief, round 3: test arms only)

authority: two-desks-work-orders-and-trains@de400f7

You are a codex worker, alone and unattended, in the git worktree
`D:/addictedtoai-worktrees/fleet6-stage0-B2` on branch `stage0/b2-cited-revision`,
whose tip is `6502b98` (four commits on top of `de400f7`, by the round-1
and round-2 authors). `node_modules` is a junction to the main checkout — do
not run `npm install`. This brief is everything you have: no prior
conversation. The round-2 report is at `<worktree>/RESULT2.md` and the sealed
review that judged it at `<worktree>/REVIEW2.md`; read both, but the standard
is the quoted task text below and the findings in "## What this round fixes",
not either report.

THIS ROUND CHANGES TESTS ONLY. The production code was judged to match the
requirements by two sealed reviews; what it lacks is arms. If building an arm
shows the production code WRONG, that is a stop-and-report (below), not a fix.

## Ground rules (non-negotiable)

- Never use the token `cd` anywhere — not in a command, a comment, or a
  script: the approval guard matches the token and refuses the call. Run
  everything by absolute path; git is `git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 ...`.
- Keep shell commands short; put anything multi-step in a `.mjs` file under
  `D:/addictedtoai-worktrees/fleet6-stage0-B2/.job/` and run that.
- Do NOT run `npm run build`, any `scripts/verify-*.mjs`, the Pulse, the Desk,
  `git push`, or `bd close`. Do not edit `package.json`, `runners.yml`,
  `data/config.json`, `CLAUDE.md`, `AGENTS.md`, anything under `data/`, or
  any file outside the "## Files" list below — in particular NO production
  file under `loop/lib/` or `loop/run.mjs`.
- Nothing under `lib/`, `loop/`, `scripts/`, `app/` or `tools/` may name a
  model, provider, harness or runner id, or reference an unarchived change
  directory. Both properties have enforcement in this tree — find what enforces each, and run it.
- If a tool call is blocked or refused, record it in `RESULT3.md` and stop
  that step; do not route around it.
- All dates are the machine's LOCAL date.

## What this round fixes — the CLASS, then the instances

This round is scoped by CLASS, not by line. Fixing only the lines named here
and leaving another instance of the same class is the failure this
repository has measured five rounds running; the reviewer will sweep for it.

All six findings are of ONE class: a changed behavioural line in the
merge-base diff that no test arm reaches — a mutation of it stays green.
REVIEW2.md names each with the exact mutation it ran and the command; those
mutations are the arms you build. For every finding: add the arm, run the
named mutation, record it RED, restore, record it GREEN. If any arm goes RED
AGAINST THE CURRENT, UNMUTATED CODE, that is a production defect: STOP on
that finding, do not change the production file and do not weaken the arm,
and report it in `RESULT3.md` §7 with the output.

### Finding 1 (REVIEW2 §1) — `requirementHeadings` over every capability, `specs.mjs:166`
Named mutation: `for (const capability of liveSpecCapabilities(repoRoot))` →
`for (const capability of ['loop'])` stays green. Arm, in
`loop/tests/review.test.mjs`: a gate fixture whose verdict cites a VALID
heading from a capability OUTSIDE the governing type's list (a constitution
heading and, separately or in the same record, a pending-delta heading of
that outside capability) and `mergeGate` accepts it on `approve` and on
`revise`; the mutation must then go red.

### Finding 2 (REVIEW2 §2) — pending-amendment inclusion in heading mode, `specs.mjs:368-373`
Named mutation: the heading-mode delta branch's `candidates` → `[]` stays
green. Arm, in `loop/tests/brief.test.mjs`: give the fixture's pending
amendment body a unique sentinel string (the constitution and the pending
text must NOT be interchangeable) and assert the cited revision brief
contains the pending-amendment marker AND the sentinel, AFTER the
constitution text of the same heading (task 11(iii)'s order); the mutation
must go red.

### Finding 3 (REVIEW2 §3) — the separator charge between two cited headings in one constitution, `specs.mjs:421-429`
Named mutation: `Math.max(0, item.candidates.length - 1) * '\n\n'.length` →
`0` stays green. Arm, in `loop/tests/brief.test.mjs`: cite TWO headings from
the SAME constitution with a `maxChars` chosen so that omitting the internal
separator's charge would exceed the cap; assert the returned `text.length`
and `chars` stay within the cap and equal each other; the mutation must go
red. State the cap and both numbers in the assertion message (the "both
numbers" rule: a message states only the numbers its assertion compares and
derives them from the values used).

### Finding 4 (REVIEW2 §4) — heading-mode truncation signal, `specs.mjs:501-502`
Named mutation: the heading-mode `truncated` expression → `false` stays
green. Arm, in `loop/tests/brief.test.mjs`: an over-budget cited-heading case
where `excerptsFor(...).truncated` is true AND the assembled revision brief
carries the cut/full-files notice; the mutation must go red.

### Finding 5 (REVIEW2 §5) — verdict-section field classification, `brief.mjs:734`
Named mutation: `const notes = String(verdict.notes ?? '').trim()` →
`const notes = ''` stays green. Arm, in `loop/tests/brief.test.mjs`: with an
ORDINARY revise verdict (no diff refusal) the note appears under the
free-form notes section and NO "diff-measured refusal reason" block appears;
a control with a diff-refusal reason present shows that block; the mutation
must go red.

### Finding 6 (REVIEW2 §6) — run-site forwarding of findings and the judged diff, `run.mjs:741-742`
Named mutations: `findings: ''` stays green; `diffText: ''` stays green.
Arm, in `loop/tests/review.test.mjs` (the C46 integration test or beside it):
capture the revision prompt the runner actually received (the mock executor
records prompts) and assert it contains the reviewer's ordinary finding text
AND a distinctive string from the judged diff; both mutations must go red.

### The SWEEP for this class (required, whatever the six above find)
The reviewer's list is what it reached; the class is every changed
behavioural line. Enumerate `git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 diff de400f7..HEAD -- loop/lib loop/run.mjs`
yourself, line by line, and for each changed behavioural line either name the
existing arm that goes red when it is mutated (test name + the mutation), add
one, or state why no arm can reach it. Put that enumeration in `RESULT3.md`
as its own section. Two sealed reviews of this diff found DIFFERENT unarmed
lines (2, then 6, none overlapping); the sweep exists because a third would
likely find more.

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

- `loop/tests/brief.test.mjs` — (new) on this branch since round 1: task 12's pinned-fixture tests; findings 2, 3, 4, 5 add arms here
- `loop/tests/review.test.mjs` — the `cites-unresolved` arms and the revision integration test; findings 1 and 6 add arms here
- `RESULT3.md` — (new) your report, in the worktree root; see "## How to end"

READ-ONLY, listed so you know where the changed lines live: `loop/lib/specs.mjs`,
`loop/lib/brief.mjs`, `loop/lib/review.mjs`, `loop/lib/verdict.mjs`,
`loop/run.mjs`, `loop/tests/mock-executor.mjs` (how the mock records
prompts), `loop/tests/helpers.mjs`. A change to any of them is out of scope:
if an arm goes red against the current code, STOP on that finding and
report it (§7) with the failing output — do not fix the code and do not
weaken the arm.

## Mutations (perform, observe red, restore; table in RESULT3.md)

For every arm you add: apply the named mutation from the finding, run the
arm, record RED with the `# pass`/`# fail` counts, restore by hash, record
GREEN. The reviewer re-runs every row. A row without a real red run is a
finding against you.

## How to work

1. Read `REVIEW2.md`, then `RESULT2.md`, then the changed lines each finding
   names, then the two test files.
2. Build the six arms. Then do the SWEEP: enumerate the merge-base diff's
   changed behavioural lines yourself and arm or account for each (the
   findings block says how).
3. Run the targeted tests as many iterations as you need:
   `node --test loop/tests/review.test.mjs loop/tests/brief.test.mjs loop/tests/brief-excerpt-budget.test.mjs loop/tests/review-blog-bar.test.mjs`
   from the worktree root by absolute path.
4. Run the enforcement for the naming and change-directory properties: find what enforces each, and run it.
5. Commit ONLY the two test files (`git add` each by path; never
   `git add -A`); do not add `RESULT3.md` or `.agent-brief.md`.
6. LAST, on the committed tip, ONE final iteration of the full suite:
   `npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-B2 test`
   with a timeout of at least 600 seconds. If the harness cut it off at a cap,
   that iteration does not count as an attempt — run it again. Record its
   counts and wall time. A green suite here is the merge precondition.
7. Write `RESULT3.md`.

## How to end (required)

Write `D:/addictedtoai-worktrees/fleet6-stage0-B2/RESULT3.md` — this exact
numbered name — with these sections, in this order:

1. **Commits** — `git -C D:/addictedtoai-worktrees/fleet6-stage0-B2 log --oneline main..HEAD`.
2. **Findings, each with its arm** — one entry per finding: the test name,
   the file and line of the arm, the named mutation.
3. **The sweep** — the merge-base diff's changed behavioural lines, each with
   its arm (test name + mutation) or the stated reason none can reach it.
4. **Tests run** — every command and the last lines of its output verbatim,
   including the final full-suite iteration with its wall time.
5. **Mutation table** — one row per arm: mutation, file and line, command,
   red counts, restored counts.
6. **Blocked or refused calls** — verbatim, or "none".
7. **Findings not fixed** — an arm that went red against the current code
   (the production defect it exposes, with the output), or anything else,
   with file, line and reason; or "none".
