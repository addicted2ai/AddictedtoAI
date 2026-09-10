# STAGE 0 TASKS 16 AND 17 — the deferral reporter, and the mutation arm that is red before the mutation

authority: two-desks-work-orders-and-trains@ad0a545

Two tasks, one job. Task 16 is a small standalone reporter; task 17 is its test.
The reason this brief is longer than the tasks is that **one of the mutation arms
task 17 specifies cannot demonstrate anything as written**, and you would
otherwise spend the round discovering that and guessing at a repair.

## The tasks, verbatim

> - [ ] 16. `scripts/lint-deferrals.mjs` (new, standalone): take **a JSON export path
>       as its argument** and report every open issue that names neither a subject
>       path nor a specification requirement, exiting non-zero only under a
>       `--strict` flag. **It SHALL NOT spawn the tracker**: the delta reserves
>       tracker invocation to exactly one module, and that module does not exist
>       until task 69 in Stage 3. The operator produces the input with
>       `bd list --json > <file>` and passes the file, the same shape
>       `evidence/scripts/machinery-share.mjs` and `open-by-day.mjs` already use.
>       Implements: *A deferral becomes its own bead only when it names a subject or
>       a requirement*, the reporting bullet.

> - [ ] 17. `scripts/tests/lint-deferrals.test.mjs`: a fixture export in which an
>       issue naming a path is not reported and one naming neither is reported by id.
>       **Mutation A**: skip unroutable issues silently and confirm the reporting
>       assertion fails. **Mutation B**: have the script spawn the tracker instead of
>       reading the file, and confirm a source check that no module outside
>       `loop/lib/beads.mjs` spawns it goes red. Tests task 16.
>       **MUTATION B'S CHECK IS RED AT BASELINE AS WRITTEN, measured at `c15e901`,
>       and an arm that is red before the mutation witnesses nothing.** Two
>       independent causes: `loop/lib/beads.mjs` does not exist (this task list says
>       so one task up), and `scripts/verify-issue-links.mjs:128` spawns the tracker
>       by design, its reason written at that file's lines 96–102 and required by
>       the format/existence split at `specs/loop/spec.md:1688`. Round 2's finding
>       NEW-5 caught this and its fix reached task 16's *"It SHALL NOT spawn the
>       tracker"* without reaching this sentence — **a finding fixed at its cited
>       line is not a finding fixed.** Split the assertion: **B1**, a source check
>       over `scripts/lint-deferrals.mjs` alone, green at baseline and red under the
>       mutation, is the witness; **B2**, the boundary the spec gives a reason for —
>       nothing under `lib/` and no step registered in the prebuild's `STEPS` array
>       imports or spawns the tracker — is measured green at baseline and stays
>       green under the mutation, so it is recorded as a standing assertion and
>       named in the report as NOT the witness. Do not repair this by loosening a
>       check until it passes, and do not repair it by editing
>       `scripts/verify-issue-links.mjs`.

## The correction you are being handed, already measured

**Mutation B's check is red at baseline**, for two reasons that have nothing to do
with the mutation. I measured both off `c15e901` before writing this:

1. **`loop/lib/beads.mjs` does not exist.** Task 16's own text says so — *"that
   module does not exist until task 69 in Stage 3"* — so every module in the
   repository is "outside" it.
2. **`scripts/verify-issue-links.mjs` spawns the tracker by design**, at line 128,
   with the spawn-shape reasoning written into its own header at lines 96–102. Its
   existence check runs only where the tracker is present and prints `SKIP
   existence` otherwise, which is the specification's own format/existence split.

A repository-wide "no module outside `loop/lib/beads.mjs` spawns it" check is
therefore **false before your mutation and false after it**. An arm that is red
either way witnesses nothing.

**Do not repair this by loosening the check until it passes, and do not repair it
by editing `scripts/verify-issue-links.mjs`.** Its spawn is correct and the reason
is recorded. Split the assertion instead:

- **B1 — the arm that demonstrates.** A source check over
  `scripts/lint-deferrals.mjs` alone: it never imports `node:child_process` and
  never invokes the tracker. Green at baseline, **red under Mutation B**. This is
  task 16's own constraint — *"It SHALL NOT spawn the tracker"* — and it is the
  only check whose colour the mutation is allowed to change.
- **B2 — the standing assertion, explicitly not the witness.** Nothing under
  `lib/` and no step registered in the prebuild's `STEPS` array imports or spawns
  **the tracker**. Measured green at baseline and **it stays green under Mutation
  B**, because task 16's module lives outside both. Record it as a standing
  assertion and say in your report that it is not the mutation's witness.

  **B2 IS ABOUT `bd` AND NOT ABOUT `node:child_process`, and the difference is
  load-bearing rather than pedantic.** `lib/stamp.mjs:32` imports
  `node:child_process` and spawns **git** at `:58`, `:71` and `:111`, and
  `lib/facts.test.mjs:12` and `lib/stamp.test.mjs:23` import it too. So a check
  written against child-process usage in general is **RED at baseline** — the
  second arm in this brief that would have been red before its mutation, found by
  the brief's own review rather than by the round. Write B2 against invocation of
  the tracker specifically: the `bd` binary, the `@beads/bd` entrypoint, or a
  variable naming it. The spec's reason is the build host, and a build host that
  lacks `bd` has git.

**Report the baseline colour of every assertion before its mutation.** An arm
whose baseline you did not record is an arm you cannot attribute.

## What "names a subject path or a specification requirement" has to mean

This is the whole difficulty of task 16 and it is a classification problem wearing
a reporter's clothes. A regular expression over prose is a classifier, and an
undocumented classifier is a judgement dressed as a mechanism.

**Enumerate what counts, enumerate what is excluded, and give a reason for every
exclusion, in the check's own comment.** That convention is already proven in this
repository: `scripts/brief-lint.mjs` carries its limits in its header, including
the one it cannot catch, and that is why its rules survive review. Follow it.

At minimum your comment must answer, each with a reason:

- What is a subject path — which directory roots count, whether a bare file name
  with no slash counts, whether a path inside a fenced block or a quoted line
  counts, and what happens to a path that names a directory rather than a file.
- What is a specification requirement reference — the shape you accept, and
  whether a capability name alone is enough.
- Which fields are searched. **The two existing consumers do not agree, and an
  earlier draft of this brief said they did** — `machinery-share.mjs:8-9` reads
  six text fields (`title`, `description`, `notes`, `design`, `acceptance`,
  `context`) while `open-by-day.mjs` reads only `status` and
  `created_at ?? created` and no text field at all. So there is no established
  convention to inherit here, only a precedent for the six. Choose, and say why;
  if you search fewer than six, name the ones you dropped.
- What an absent `metadata` object means. It means **no declared subject**, not an
  error.

## Input shape — measured from the two consumers that already read it

Both live in the change's evidence directory. Read them; do not edit them. They
agree on the container and **differ on the contents**, which is why the fields
question above is yours to settle rather than to copy.

- The top level is an **array** of issues. Both assume it.
- The file may carry a byte-order mark, and both readers strip it at their line 6
  before parsing. Yours must too, or a real export from the operator fails on
  line one.
- `status` is compared lower-cased against `closed` to decide what is open. Both
  do this.
- `id` is what a report names. Report by id, never by array index.

## Refusals the reporter owes

- A missing or unreadable input file, and a file whose top level is not an array:
  refuse with one line naming the path. **Do not** treat an unparseable export as
  "no issues to report" — that is a silent green over a broken instrument.
- **`--strict` changes the exit code and nothing else.** The same rows print
  either way. A flag that changes what is reported as well as how it exits gives
  you two behaviours to test and one name to test them under.

## Files

- `scripts/lint-deferrals.mjs` — (new) the reporter task 16 specifies.
- `scripts/tests/lint-deferrals.test.mjs` — (new) its test, task 17.

Everything else in the repository is read-only for this round. In particular, do
not edit `scripts/verify-issue-links.mjs`, `scripts/prebuild.mjs`,
`scripts/brief-lint.mjs`, `loop/lib/carry.mjs` or anything under
`openspec/changes/` — several are named above as measurements, and a measurement
you edited is not a measurement.

## Tests

Write the fixture export as a file your test creates under the OS temporary
directory, in the shape `scripts/tests/` already uses. The test SHALL NOT spawn
the tracker either; a fixture export is a file the test writes.

Required arms:

1. An issue naming a path is **not** reported.
2. An issue naming neither is reported **by id**.
3. A closed issue naming neither is **not** reported, because the task says every
   *open* issue.
4. Exit code 0 without `--strict`, non-zero with it, **with identical reported
   rows in both runs**.
5. A malformed input refuses rather than reporting zero rows.
6. **Mutation A** — skip unroutable issues silently; the reporting assertion in
   arm 2 fails.
7. **Mutation B1** — the reporter spawns the tracker; the source check over
   `scripts/lint-deferrals.mjs` goes red.
8. **B2** — the `lib/` and prebuild boundary assertion, recorded green at baseline
   and green under Mutation B, and named in the report as not being the witness.

Every mutation is applied, run, and reverted, and the revert is verified
byte-identical. State the pass/fail counts for baseline and for each mutation.

## Verification, and the count that makes it real

Run your own file by absolute path — `node --test <worktree>/scripts/tests/lint-deferrals.test.mjs`
— and report the collected/pass/fail counts for the baseline and for every
mutation. **Do not run `npm test` here.** This worktree deliberately has no
`node_modules`, so the full suite cannot run in it, and a partial suite reporting
a total is worse than no total: **a count taken from a run that could not collect
every file is a measurement of a different suite.** The whole-suite total is mine
to take on the merge target, where the dependencies are, and I will take it.

Read your counts from the runner's own summary lines rather than from an
impression of the tail. The runner prints `ℹ tests N` when stdout is not a
terminal and `# tests N` when it is; if your parse returns nothing, report
**nothing was measured** rather than zero. A counter that defaults to zero on a
parse miss reports a green suite of no tests as a green suite, and that is a
mistake I made with this exact runner two hours ago.

Every property above is enforced by an arm you are writing rather than by an
instrument that already exists, so a reviewer must find each arm in the test file
and run it. Name each property and its arm in `RESULT1.md` so that finding is a
lookup rather than a search.

## Ground rules — these apply to you and are not inherited by working here

- **Never use the token `cd`**, in a command, in a comment, or as a shell function
  name; the approval classifier matches the token and not the intent. Run scripts
  by absolute path and use `git -C D:/AddictedtoAI` for git.
- Keep command strings short. A step needing more than a couple of operations goes
  into a file that you then run.
- Prefer the file tools over shell equivalents for reading, writing, editing and
  searching.
- **Never manipulate or print a credential**, including a partial token. An
  authentication failure is a finding you report, not an obstacle to route around.
- **If a tool call is blocked, report it and stop.** Do not route around a denial
  and do not edit a permission or settings file to clear your own path.
- Never edit `package.json`. Never run two builds at the same time.
- Every date you write is the local date of this machine.

## Your report

Write it to `RESULT1.md` at the root of your worktree. It carries, in this order:
the baseline colour and the post-mutation colour of every assertion; the full
suite totals before and after; the enumeration-and-exclusions comment you wrote,
quoted from the file; and anything you found that this brief got wrong. The last
of those is not a courtesy — this brief has already corrected the task list on one
point, and it is the kind of document that carries a second error in the same
place.

If any part of this is blocked, finish every part that is not, and say plainly in
`RESULT1.md` what you left out and why. Do not narrow the scope on your own
judgement; a scope decision is mine, and an unstated one is a defect on every
attempt.
