# Implementation brief — SPEC DELTA CORRECTIONS, round 1

authority: two-desks-work-orders-and-trains@53779c3676e4135108aec5b295c4840592f75fa5

You are implementing text corrections to the OpenSpec delta documents of the
change `two-desks-work-orders-and-trains`. This is not code. Read this whole
brief before your first edit.

The attached reviews were written against `6ab1925`, an earlier commit. That
does not make their line numbers stale, and I checked rather than assuming:
`git diff 6ab1925 53779c3 -- openspec/changes/two-desks-work-orders-and-trains/specs/`
prints nothing, so the three delta files are byte-identical between the review
commit and the authority commit. Every line number below and in the attached
findings lands on the text it claims.

## WHERE YOU WORK — a worktree, never the main tree

Your worktree is **`D:/addictedtoai-worktrees/fleet6-specfix`**. Every path in
this brief is relative to it, and every absolute path you type starts with it.

**Do not edit anything under `D:/AddictedtoAI` itself.** That is not a style
preference, it is a correctness condition the orchestrator stated: `npm test`
reads these very delta files (`scripts/check-spec-deltas.mjs` among others), and
a gate run is live on the main tree. An edit landing there mid-run silently
changes what a green means, and a green that means something other than what it
says is worse than a red. You may READ the main tree — comparing against live
law at `D:/AddictedtoAI/openspec/specs/loop/spec.md` is expected — but write
only inside your worktree.

## Files

Work only in:

- `openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md` — reason: carries six of the seven findings (the four `lane` collisions, the breaker scenario, the runner-health window, the 10%-vs-30% scenario, and the two dangling removals needing new MODIFIED blocks).
- `openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md` — reason: carries the seventh, the `would-cite-for` refusal that contradicts its own scenario.
- `RESULT1.md` — (new) reason: your report, at the WORKTREE root, specified below.

That list is the closure over this change: nothing else may be edited, created
or deleted.

## WHY THIS WORK MATTERS MORE THAN ITS SIZE SUGGESTS

`openspec archive <name>` merges every requirement block of a change's deltas
into `openspec/specs/<capability>/spec.md`, which is the durable normative home
of this repository. A defect left in a delta does not cost a review round — it
becomes permanent law that later readers and implementers obey.

These seven defects were found by a review pass over the deltas at
`6ab1925`. They were not found earlier because `tasks.md` is exercised on every
round — quoted to a worker, linted, re-derived by a reviewer — while the spec
deltas are consumed by nobody until archive. They rotted exactly where nothing
looked. You are the first reader who is going to fix them.

Archiving this change is BLOCKED on this work.

## SCOPE — exactly seven findings, and nothing else

The full review documents are attached. They carry the evidence, the quoted
requirement, the severity and a one-sentence fix for each finding. Read the
attached finding before making its edit; do not work from this list alone.

### 1. `lane` means two different things in permanent law
Attached: `arch-spec-loop-added-requirements-2.spec-review-muse.md`, finding 2.

This one has a prepared edit, because I measured its scope myself and the
measurement is the reason the fix is surgical rather than a sweep.

**COUNT LINES, NOT MATCHES, AND THE DIFFERENCE IS NOT PEDANTRY HERE.** `lane`
occurs on **14 lines** of the loop delta but **15 times**: line 2012 carries two
(`SHALL pause that provider's lane. **A lane is the set of runners sharing a`).
Verified: `grep -c lane` prints 14, `grep -o lane | wc -l` prints 15. A worker
counting matches instead of lines can never reach the target below, so the
target is stated in lines throughout. **Ten lines are the correct provider sense**
(lines 1034, 1153, 1394, 1415, 2012, 2014, 2018, 2025, 2055, 2060 — the
capacity-pause requirement, matching live law at
`openspec/specs/loop/spec.md:373` and the implementation `lanePause(ledger,
provider, now)` at `loop/lib/budget.mjs:591`). **DO NOT TOUCH THOSE TEN.**

**Four are the colliding desk sense**, all inside one requirement:

- `:925` — the requirement TITLE, "The front desk and the back desk share an
  intake and **never share a lane**". This is the worst of the four: read under
  the surviving definition of `lane` the title asserts that the two desks never
  use runners from the same provider, which is a different requirement entirely
  and is not what anyone intends.
  → `The front desk and the back desk share an intake and are otherwise separate`
- `:927` — "Work is divided by kind, into two **lanes** that share one intake"
  → "into two **desks** that share one intake"
- `:943-944` — "A **lane** decides which work is reached; it never decides what
  may be afforded." → "A **desk** decides which work is reached; …"
- `:950` — "a ceiling on the Desk's share does not reduce machinery work while a
  **lane** exists that the ledger cannot see"
  → "while a **body of work** exists that the ledger cannot see". `desk` would
  be WRONG here — the sentence is about work outside the ledger's view, not
  about a desk. This is the one place where the mechanical substitution fails,
  which is why it is called out.

Then add ONE sentence to that requirement reserving the word: `lane` is the
provider set, `desk` is the work partition, and the two are never
interchangeable.

Verify the line numbers before editing — the file may have moved under them.
If a number does not land on the text quoted above, find the text and say so
in your RESULT.

### 2–5. A scenario contradicting the norm inside its own requirement

These four are the highest-value class in the audit: whoever implements picks
one reading and the other becomes permanently wrong. Each attached finding
names which side is correct.

- `arch-spec-loop-modified-requirements-1.spec-review-muse.md` **F1** — the
  breaker scenario still states the consecutive rule the requirement
  deliberately replaces.
- `arch-spec-loop-modified-requirements-2.spec-review-muse.md` **finding 2** —
  the runner-health requirement says the window "SHALL NOT be a backwards walk"
  while its own scenarios say the streak is "cleared".
- `arch-spec-loop-modified-requirements-2.spec-review-muse.md` **finding 4** —
  the table says ceiling 30%, a scenario in the same requirement says 10%. The
  live configured value is already 30, so the table is the correct side.
- `arch-spec-review.spec-review-muse.md` **finding 1** — the `would-cite-for`
  refusal condition reads as accept where its own scenario refuses.

### 6–7. A removal whose dependents are live

- `arch-spec-loop-removed-requirements.spec-review-muse.md` **F2** — the delta
  removes the requirement defining "three work sources" while live constitution
  requirements at `openspec/specs/loop/spec.md:69,84` still order behaviour
  around them. Add a `MODIFIED` block for `Jobs have identities, and interrupted
  jobs resume by branch` rephrasing the ordering around the one intake.
- `arch-spec-loop-removed-requirements.spec-review-muse.md` **F3** — the delta
  retires `DIRECTIVES.md` while a live requirement at
  `openspec/specs/loop/spec.md:1168-1178` still mandates harvesting ids from it.
  After archive the law would both retire the file and require reading it. Add
  a `MODIFIED` or `REMOVED` block for those harvesting bullets.

Both were independently reproduced by a second reviewer on a different
provider, with different evidence (it reached them via `tasks.md:2205-2209`,
task 89, "Migrate DIRECTIVES.md … the file is deleted", unchecked). Two
reviewers, two evidence paths, same conclusion — treat these as settled.

## EXPLICITLY OUT OF SCOPE

- **The other 38 findings.** They are real and they are queued; they are not
  this round. Do not fix them, and do not mention them in RESULT beyond a bare
  count if you must.
- **`removed` F4** (code pointers in `loop/lib/proposals.mjs:1000` and
  `loop/lib/brief.mjs:393` naming the old heading). It is a real finding, it is
  about CODE rather than spec text, and it is already covered by tasks 89–90.
  Keeping this round to one kind of file is deliberate. Do not edit code.
- **`added-2` findings 4 and 5.** Both were TRUE when the reviewer read the
  tree and are FALSE now — packet F resolved them at `f879ec9`. I verified both
  against merged code (`select.mjs:151`, `runners.mjs:193-198`,
  `select.mjs:112,181,200,215,273`, `run.mjs:979-982`). Do not re-open them.
- **Any file outside the two delta files above** (`RESULT1.md` excepted — it is
  the report and you must write it). In particular do not edit
  `openspec/specs/**` (that is live law, changed only by archiving), `tasks.md`,
  or anything under `loop/`, `lib/`, `scripts/`, `data/`.

## HOW TO EDIT SPEC TEXT

- **Change the minimum.** These requirements are read as law. A rewrite that
  improves prose while changing scope is a defect, not an improvement.
- **Never invent a requirement to resolve a contradiction.** Where a scenario
  and its norm disagree, the attached finding names which side is correct;
  conform the other side to it. If a finding does not make that clear, make the
  smaller change and say in RESULT that you had to choose.
- Preserve the OpenSpec structure exactly: `## ADDED|MODIFIED|REMOVED
  Requirements`, `### Requirement: <title>`, `#### Scenario: <name>`, and the
  `- **WHEN**/**THEN**` bullet shapes already in the file. A malformed block
  fails `openspec validate`.
- Keep `SHALL` where it is; do not add new `SHALL`s.

## VERIFY BEFORE YOU FINISH

Run, by absolute path, against your worktree:

    openspec validate two-desks-work-orders-and-trains --type change --strict --no-interactive

It must pass. If it fails, fix what it names and run it again.

Then re-count `lane` in the loop delta and confirm **ten lines** remain, all of
them the provider sense. Report BOTH numbers, because they differ and the
difference is the point:

    grep -c lane <worktree>/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
    grep -o lane <worktree>/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md | wc -l

Expected after your edit: **10 lines**. The match count depends on how you
reword line 925 and is NOT pinned to a target — report it, do not chase it.

Do not run `npm run build` or `npm test`. No code changed, so neither gate can
tell you anything this validate does not — and a build started here can collide
with one already running on this machine, which fails both with an `ENOENT` on
`pages-manifest.json` that looks nothing like its cause.

## RESULT

Write `RESULT1.md` at your WORKTREE root. It must contain, in this order:

1. A table: finding → file → what you changed → the line you changed it at.
2. The `openspec validate` command you ran and its exact output.
3. The `lane` count after your edit, with the command that produced it.
4. Anywhere the brief's line numbers did not match the text, and what you did.
5. Anywhere you had to choose between two readings, and why you chose.
6. Anything you did NOT do that the brief asked for. An honest omission is
   worth more than a silent one; a RESULT that claims completeness it does not
   have is the one failure this process cannot absorb.

## GROUND RULES — these are not inherited by working here, so they are repeated

- **Never `cd`.** Not at the start of a command, in the middle of one, in a
  comment, or as a shell function name — the approval classifier matches the
  token, not the intent. Run scripts by absolute path; use
  `git -C D:/AddictedtoAI ...` for git; read and write files by absolute path.
- **Keep command strings short.** A long multi-step one-liner is more likely to
  trip approval than a small script is. The same goes for `node -e` — write a
  `.mjs` and run it.
- **Prefer file tools over shell equivalents** — read/write/edit/grep/glob
  rather than `cat`, `sed -i`, `echo >`, `find`. They handle Windows paths and
  line endings correctly.
- **Never manipulate credentials on a command line**, and **never print a
  secret**, including a partial token.
- **If a tool call is blocked, report it and stop.** Do not route around a
  denial, and do not edit a permission or settings file to clear your own path.
- **Never run two builds concurrently.** One is running now; that is why the
  verify step above is `openspec validate` only.
- **Do not commit, do not push, do not create or remove a git worktree, and do
  not touch `STOP` or `HOLD.md`.** Leave your edits in the working tree. The
  commit is the architect's.
- **Every date is the LOCAL date of this machine**, not UTC.
- A guardrail that blocks you is reported and stopped at — never loosened to
  get past it.
