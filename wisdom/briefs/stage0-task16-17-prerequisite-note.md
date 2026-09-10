# PREREQUISITE FINDING FOR STAGE 0 TASKS 16 AND 17 — Mutation B is red before the mutation

Measured 2026-09-10 ~06:58 local, off `main` at `c15e901`, while the machine was
held for Orch's gate run. Read-only: no repo file touched.

## The defect

Task 17 (`tasks.md:992`) specifies:

> **Mutation B**: have the script spawn the tracker instead of reading the file,
> and confirm **a source check that no module outside `loop/lib/beads.mjs` spawns
> it** goes red.

**That check is red at baseline, for two independent reasons, and neither has
anything to do with the mutation.**

1. **`loop/lib/beads.mjs` DOES NOT EXIST.** `ls` on the path: no such file. The
   task text itself says so one task earlier — *"that module does not exist until
   task 69 in Stage 3"* — and then Mutation B names it as the sole permitted
   invoker anyway. Every module in the repository is "outside" a module that is
   not there.

2. **`scripts/verify-issue-links.mjs` SPAWNS THE TRACKER, BY DESIGN, WITH A
   WRITTEN REASON.** Measured: `execFileSync(bin, [...pre, 'list', '--status',
   'all', '--json'], …)` at `scripts/verify-issue-links.mjs:128`, with the
   spawn-shape analysis in its own header at `:96–:102` (bare `bd` → ENOENT on
   Windows, `bd.cmd` → EINVAL, so it spawns
   `node <prefix>/node_modules/@beads/bd/bin/bd.js`). Its existence half runs
   *only* where `bd` is present and prints `SKIP existence` otherwise — which is
   the spec's own format/existence split at `specs/loop/spec.md:1688`, written
   because `next build` runs on Vercel where `bd` does not exist.

So the arm fails whether or not the mutation is applied. **A MUTATION ARM THAT IS
RED BEFORE THE MUTATION DEMONSTRATES NOTHING** — §7r's rule about an arm that
fails either way, in its sharpest form: there it understated a defect, here it
proves the absence of one.

## What IS green at baseline, and is therefore the enforceable half today

The requirement is two clauses (`specs/loop/spec.md:1693`):

> **Exactly one module SHALL invoke the tracker**, and nothing under `lib/` or in
> the prebuild SHALL import it or spawn it. A static check SHALL assert that
> boundary, **so the build never acquires a dependency on a tool the host does
> not have.**

The stated *reason* binds the second clause, not the first. Measured against the
live tree:

- Files under `loop/`, `pulse/`, `scripts/`, `lib/` mentioning the tracker at
  all: **four**. `loop/lib/carry.mjs:14` (a prose comment, no spawn), the two
  shell-token-guard tests (fixture strings), and `verify-issue-links.mjs` (a real
  spawn).
- Under `lib/`: **none.**
- In the prebuild: **none** — `scripts/prebuild.mjs`'s `STEPS` array (`:97`) does
  not include the issue-link verifier; it is a standalone script run by hand and
  by the gates.

**The `lib/` + prebuild boundary is green now and can be asserted now.** The
"exactly one module" clause cannot be, and will not be until task 67.

## The correction

Task 17's Mutation B must be scoped to **task 16's own module**, which is what
task 16 actually constrains — *"It SHALL NOT spawn the tracker"* — rather than to
a repository-wide sole-invoker rule that Stage 0 cannot satisfy. Two assertions,
both measurable today:

- **B1** — a source check over `scripts/lint-deferrals.mjs` asserting it never
  spawns the tracker (no `child_process` import, no `bd` invocation): green at
  baseline, **red under Mutation B.** This is the arm that demonstrates.
- **B2** — the static boundary check the spec asks for, scoped to its own stated
  reason: nothing under `lib/` and no registered prebuild step imports or spawns
  the tracker. Green at baseline and **still green under Mutation B**, because
  `scripts/` is outside it. Recorded as a standing assertion, explicitly NOT as
  the mutation's witness.

Splitting them is the point. One check answering two questions is how a red gets
attributed to the wrong cause.

## This was already caught once, and the fix landed in half the task

`evidence/reviews/round2-opus-closure.md:106` is finding **NEW-5**, which says
exactly this: task 16 creates a second tracker-invoking module two stages before
the one that is supposed to be the only one, and *"task 69's boundary test asserts
only that nothing under `lib/` and no prebuild step imports or spawns it, so
nothing catches this."* Its proposed fix was one clause naming a standalone report
script as outside the rule.

**The fix reached task 16 and not task 17.** Task 16 now carries *"It SHALL NOT
spawn the tracker"*, which resolves NEW-5 completely — and Mutation B's sentence,
written before that resolution, still names the old sole-invoker check. That is
§7t's plan-nobody-checks in the task list itself: the correction was applied where
the finding pointed and not where the finding's consequence landed. **A FINDING
FIXED AT ITS CITED LINE IS NOT A FINDING FIXED.**

## Input shape — measured, not assumed

Both existing consumers of `bd list --json` are in the change's own evidence and
agree, so the new script matches them rather than inventing a reader:

- Top level is an **ARRAY** of issues.
- The file may carry a **BOM**; both strip it (`.replace(/^﻿/, '')`) before
  `JSON.parse`.
- Fields in use: `id`, `status` (compared lower-cased against `closed`),
  `priority`, `created_at ?? created`, and the text fields
  `title`, `description`, `notes`, `design`, `acceptance`, `context`
  (`machinery-share.mjs`, `open-by-day.mjs`).
- `metadata.subject` exists as a convention —
  `evidence/bd-measurements.md:175` records a create with
  `--metadata '{"subject":"lib/beads.mjs",…}'` returning metadata as a nested
  object. It is a **convention, not a guarantee**, and the reporter must treat an
  absent `metadata` as "no declared subject" rather than as an error.

## What the brief must require of the author

1. **Define "names a subject path" and "names a specification requirement" with
   their limits written into the check's own comment**, enumerating what counts
   and what is excluded *with a reason for each exclusion* — the W2 convention,
   which is already proven in `scripts/brief-lint.mjs` and is the reason W2's
   claim-token rules survive review. A regex over prose is a classifier; an
   undocumented classifier is a judgement wearing a mechanism's clothes.
2. **State the baseline colour of every assertion before its mutation**, so an
   arm that is red either way is caught by the report rather than by the next
   reader.
3. **Not spawn the tracker** — including in the tests. A fixture export is a file
   the test writes.
