# Packet E — tasks 25, 26, 27 and 3b of `two-desks-work-orders-and-trains` (author brief, round 1)

authority: two-desks-work-orders-and-trains@9c1d980

You are a codex worker, alone and unattended, in the git worktree
`D:/addictedtoai-worktrees/fleet6-stage0-E` on branch `stage0/e-ledger-teardown`,
checked out at `9c1d980`. `node_modules` is a junction to the main checkout —
do not run `npm install`. This brief is everything you have: no prior
conversation, no session to resume. The standard you implement is quoted
verbatim below from `openspec/changes/two-desks-work-orders-and-trains/tasks.md`
at the authority commit; where this brief's prose and the quoted text differ,
the quoted text wins. Its bold "Resolved before E's freeze" paragraphs are the
architect's resolution of every quantifier in the tasks — they are the spec,
not commentary.

## Ground rules (non-negotiable)

- Never use the token `cd` anywhere — not in a command, a comment, or a
  script: the approval guard matches the token and refuses the call. Run
  everything by absolute path; git is `git -C D:/addictedtoai-worktrees/fleet6-stage0-E ...`.
- Keep shell commands short; put anything multi-step in a `.mjs` file under
  `D:/addictedtoai-worktrees/fleet6-stage0-E/.job/` and run that.
- Do NOT run `npm run build`, any `scripts/verify-*.mjs` as a whole (importing
  a function from `verify-launch.mjs` in a test is fine; running the script
  is not), the Pulse, the Desk, `git push`, or `bd close`. Do not edit
  `package.json`, `runners.yml` (its `effort:` half is the orchestrator's),
  `data/config.json`, `CLAUDE.md`, `AGENTS.md`, anything under `data/`, or
  any file outside the "## Files" list below.
- Nothing under `lib/`, `loop/`, `scripts/`, `app/` or `tools/` may name a
  model, provider, harness or runner id, or reference an unarchived change
  directory. Both properties have enforcement in this tree — find what enforces each, and run it.
- Tests build throwaway repositories under the OS temp directory and never
  touch this worktree's own `.git`, `data/` or the real `D:/AddictedtoAI`.
- If a tool call is blocked or refused, record it in `RESULT1.md` and stop
  that step; do not route around it.
- All dates are the machine's LOCAL date.

## The standard (verbatim, `tasks.md` at the authority commit)

Tasks 25 to 27:

> - [ ] 25. `loop/lib/ledger.mjs`: every phase entry records the runner and the effort
>       it ran at; every line records `brief_chars`, a `gate_seconds` map, the
>       count of findings each review carried, and **`authority_sha`** — the commit
>       the brief was assembled against (main at brief time; for work on this
>       change, the commit of its artifacts) — so that "was this work judged
>       against the standard it was built against" is answerable from the ledger
>       rather than from a coordinator's write-up (added 2026-09-08 after tasks
>       1–4 moved four times in fifteen minutes under one brief, two versions
>       specifying opposite floor designs; proposed by A2AI-Luna-Boss-2, mechanism
>       from the `specgraph-origin` session; buys auditability, not prevention —
>       re-reading the committed blob at dispatch stays the habit). Until Stage 3
>       retires the fleet, a fleet round carries the same fact as a line in
>       RESULT.md and the handover, `authority: <change>@<sha>`. All additive;
>       `LEDGER_FIELDS` not extended. Implements: *The ledger line carries the join, as a list,
>       additively*, the measurement bullet, and *Runner selection is a declared
>       policy*, bullet 4, and *A reviewer's non-blocking finding…*, the ledger
>       bullet.
>       **Resolved before E's freeze (the architect's quantifier enumeration,
>       2026-09-09 02:50, from the code at `de400f7`):** (i) "the runner" per
>       phase is already `who.id` (`run.mjs:261-273`); "the effort it ran at"
>       is a property of the REGISTRY ENTRY, because a rung IS an entry ("the
>       registry MAY carry one entry per rung"): `loadRunners`
>       (`runners.mjs:16`) accepts an optional `effort` string per entry
>       (non-empty when present, else a load-time error, the `job_types`
>       pattern; absent means the entry declares no rung), and every phase
>       entry records `effort: who.effort ?? null` — `null` rather than
>       omitted, so a reader can tell "no rung declared" from "written before
>       the key existed". The `runners.yml` half — `effort: max` on
>       `codex-gpt-luna`, `medium`, `high` and `xhigh` on its three siblings,
>       nothing on the Claude and opencode entries until their harnesses expose
>       a rung — is **[orchestrator]** (a reserved file) and lands with E's
>       handover; the code half merges independently and records `null` until
>       it does. (ii) `brief_chars` is `briefText.length` of the text the
>       AUTHOR phase actually received (the assembled brief for a new job, the
>       resumed brief for a resumed one), on the job's outcome line
>       (`run.mjs:1431`); the two abandon-sweep lines (`:979`, `:1050`) carry
>       none of the new keys, because no process ran. (iii) `gate_seconds` is a
>       map `{ <gate name>: <seconds, one decimal> }` for every gate the job's
>       OWN run executed (`runGates` results' `durationMs / 1000`), a retried
>       gate recording its LAST run; absent when no gate ran. (iv) "the count of
>       findings each review carried" is, per REVIEW phase entry, `carried:
>       <n>` = the length of that pass's parsed `carry:` list (`parseCarry`,
>       the non-blocking findings of the review delta's ledger bullet): `0`
>       when the record parsed and carried none, absent when there was no
>       record. (v) `authority_sha` is the full 40-character sha the author
>       brief was assembled against — for a Desk job `mergeBaseSha` at brief
>       time (`run.mjs:1369`); a fleet round's is its RESULT line, a practice
>       not code. (vi) Additive: `LEDGER_FIELDS` unchanged (task 26's mutation
>       proves it), a pre-existing eight-key line validates unchanged. (vii)
>       Files: `loop/lib/ledger.mjs` (`makeLedgerLine` accepts and emits the new
>       optional keys), `loop/lib/runners.mjs` (the optional `effort`),
>       `loop/run.mjs` (the phase entry gains `effort`, a review phase gains
>       `carried`, the outcome line passes `brief_chars`, `gate_seconds`,
>       `authority_sha`), and task 26's new test.
> - [ ] 26. `loop/tests/ledger.test.mjs`: a line carries runner and effort per phase,
>       `brief_chars`, `gate_seconds`, a carried-entry count and `authority_sha`; a
>       pre-existing line without any of them still validates. **Mutation**: extend `LEDGER_FIELDS` to
>       require `gate_seconds` and confirm the old-line test fails — the additive
>       property is the thing under test. Tests task 25.
>       **Resolved before E's freeze (2026-09-09 02:50):** (i)
>       `loop/tests/ledger.test.mjs` is NEW — no file of that name exists;
>       `ledger-order`, `ledger-before-publish` and `job-budget` test other
>       properties and stay where they are. (ii) Arms, on a throwaway repository
>       via `makeRepo`: a line built by `makeLedgerLine` with phases carrying
>       `effort` (one `null`, one string) and a review phase carrying
>       `carried`, plus `brief_chars`, `gate_seconds` and `authority_sha`,
>       round-trips through `appendLedger` and `readLedger` with every key
>       present and equal; a pre-existing line of the eight required keys only
>       passes `appendLedger`'s validation unchanged. (iii) "Per phase" quantifies
>       over EVERY entry of `phases` (author, review1, revision, review2):
>       each carries `runner` and `effort`; `carried` appears on review entries
>       only. (iv) The named mutation: extend `LEDGER_FIELDS` with
>       `gate_seconds` and confirm the old-line arm fails; restore.
> - [ ] 27. `loop/lib/git.mjs:116`: `worktree remove --force` becomes a removal that
>       **refuses** rather than forcing when it cannot complete. Implements: *The
>       chain from intake to train lives in the repository*, the teardown bullet —
>       a requirement that had a scenario and no task, and whose absence deleted 177
>       packages from the real `node_modules`. Test with a **mutation** restoring
>       `--force`, which must make the refusal assertion fail.
>       **Resolved before E's freeze (2026-09-09 02:50, from `de400f7`):** (i)
>       `removeWorktree` (`git.mjs:115-118`) runs `git worktree remove <dir>`
>       WITHOUT `--force`; on a non-zero exit it returns `{ ok: false, reason }`
>       (git's stderr, which names why) and does not fall back to `--force` or
>       to any delete; on success `{ ok: true }`. (ii) "The removal" is the
>       whole of `removeJobWorktree` (`run.mjs:827-894`), not the git call
>       alone: today it runs `remove`, then `rmSync(worktree, { recursive,
>       force })`, then `prune`, each guarded separately, so a git REFUSAL would
>       be followed by a recursive delete of the very directory git refused to
>       delete. Under this task the `rmSync` step runs ONLY after git's removal
>       returned `ok` (it exists for the Windows EPERM case where git has already
>       taken the files and left the directory — `addictedtoai-osru`); on a
>       refusal the directory is left standing, the reason logged, and the run
>       continues to its ledger line and records commit exactly as the junction
>       refusal at `:852-874` already does; `prune` still runs in every case (the
>       test at `worktree-cleanup.test.mjs:252` pins that). (iii) The other
>       callers get the same behaviour: `review.mjs:1194` (the reviewer's
>       detached worktree, `reset --hard` and `clean -fdx` before removal, so a
>       refusal there is news and is logged) and `conformance.mjs:321,370`. (iv)
>       RECORDED, out of scope: `worktree prune` (`git.mjs:101`, `:117`,
>       `run.mjs:830`) deregisters ANY registration whose directory is absent,
>       including one temporarily moved — on 2026-09-08 about twenty registered
>       worktrees were moved by accident and repaired by hand; the Desk's
>       worktrees are the only ones it creates, but prune is repository-wide.
>       (v) Arms, in `loop/tests/worktree-cleanup.test.mjs` (the file that owns
>       removal; no new file): a worktree git refuses to remove without force
>       (one modified tracked file) is left standing with its file intact and the
>       refusal reported, and `rmSync` was not called (observe it through the
>       existing `deps.rm` seam); positive control: a clean worktree is removed.
>       Named mutation: restore `--force` and confirm the refusal arm fails.

Task 3b (it rides with this packet):

> - [ ] 3b. `scripts/verify-launch.mjs` (`hasCurrentBuild`'s input walk) and its
>       test: **the combined rule, which supersedes task 3's writer-only
>       sentence** — a path is an INPUT only if some build step READS it
>       (membership by readers), and a read path is EXCLUDED only if every writer
>       of it runs inside `npm run build` (the exception for build-internal
>       outputs such as `public/`; `data/derived/**` stays in because the Pulse
>       writes it from outside and 24 modules read it). Under that rule `.beads/`
>       at the repository root is excluded explicitly, with the reason recorded
>       in the code: the issue tracker's embedded Dolt database, backup set and
>       journal are written autonomously by `bd` on every issue operation from
>       any session, and no build step reads them (found by A2AI-Orch on
>       2026-09-08 after a captured fourth run rebuilt 49 s three minutes after a
>       0.365 s reuse; seven of the eight inputs written in between were under
>       `.beads/`). Why this is priority rather than tidiness (Luna-Boss-2): every
>       fleet brief's ground rules say "`bd create` for something you find and
>       cannot fix is welcome", so a worker filing a finding mid-run defeats the
>       reuse for whoever runs verify-launch next, 46 to 52 seconds bought by
>       packet A and spent by an instruction the coordinator rightly keeps — the
>       excluded-path rule is what decides whether the reuse fires at all in a
>       repository where a tracker writes on every operation from any session.
>       Test: with a current export and record, a write under `.beads/` does not
>       defeat reuse (no spawn), and a write to a read input still does.
>       **Mutation**: remove the `.beads/` exclusion and confirm the first arm
>       fails while the second still passes. Small; rides with packet E. Serves
>       task 31's availability measurement.
>       **Resolved before E's freeze (2026-09-09 02:50, from `de400f7`):** (i)
>       `hasCurrentBuild(root)` (`verify-launch.mjs:279-288`) walks the whole
>       root with `BUILD_INPUT_EXCLUSIONS` = `.git`, `.next`, `node_modules`,
>       `out`, `public` (`:190-196`, root-level names only, `:210`), so `.beads`
>       is walked today and every `bd` write defeats reuse; `data/derived/**` is
>       walked and stays walked. (ii) The combined rule is DOCUMENTED beside the
>       set — a comment stating membership-by-readers and exclusion-by-writers,
>       with `.beads` added and its reason — not computed: deriving readership
>       from the build is design beyond this task. (iii) The test is NEW,
>       `scripts/verify-launch-build-reuse.test.mjs` — no test names
>       `hasCurrentBuild` today; `hasCurrentBuild` takes a root, so the fixture is
>       a throwaway git repository under the OS temp directory with one commit,
>       an `out/` holding one file, and a valid `.build-stamp.json` whose
>       `status.commit` equals that repository's short HEAD (read
>       `readBuildSuccessRecord` at `:245` for the exact shape). Arms: (a) with
>       that current record, a later write under `.beads/` leaves
>       `hasCurrentBuild` true; (b) a later write under `content/` makes it
>       false. Named mutation: remove `.beads` from the exclusion set and confirm
>       (a) fails while (b) still passes. (iv) Files: `scripts/verify-launch.mjs`
>       (the set and its comment only) and the new test.
>

## Files

Work only in these files. Every other path is out of scope; a diff that
touches one is a scope violation at review.

- `loop/lib/ledger.mjs` — `makeLedgerLine` accepts and emits the optional `brief_chars`, `gate_seconds`, `authority_sha`; the doc comment names them (task 25)
- `loop/lib/runners.mjs` — the optional `effort` string per registry entry, validated on the `job_types` pattern (task 25(i))
- `loop/run.mjs` — the phase entry gains `effort`; a review phase gains `carried`; the outcome line passes the three new keys; the `rmSync` step of `removeJobWorktree` runs only after git's removal returned ok (tasks 25, 27(ii))
- `loop/tests/ledger.test.mjs` — (new) task 26
- `loop/lib/git.mjs` — `removeWorktree` in the refusing form returning `{ ok, reason }` (task 27(i))
- `loop/lib/review.mjs` — the reviewer-worktree caller logs a refusal (task 27(iii))
- `loop/conformance.mjs` — its two callers log a refusal (task 27(iii))
- `loop/tests/worktree-cleanup.test.mjs` — the refusal arm, the positive control, the `rmSync`-not-called observation (task 27(v))
- `scripts/verify-launch.mjs` — `.beads` joins `BUILD_INPUT_EXCLUSIONS` with the combined rule documented beside the set, nothing else (task 3b)
- `scripts/verify-launch-build-reuse.test.mjs` — (new) task 3b's two arms
- `RESULT1.md` — (new) your report, in the worktree root; see "## How to end"

`loop/tests/helpers.mjs` is read-only. If you believe a file outside this
list must change, do not change it — describe the need in `RESULT1.md` with
the line and the reason, and stop there.

## Properties (find what enforces each, and run it)

- The machinery names no model, provider, harness or runner id outside
  `runners.yml` — a test under `loop/tests/` enforces this; find it and run it.
  Note the phase entry's new `effort` value comes from the registry at run
  time; no string literal naming an effort belongs in `loop/`.
- No source under `lib/`, `loop/`, `pulse/`, `scripts/`, `app/`, `tools/`
  references an unarchived change directory — a test under `scripts/`
  enforces this; find it and run it.
- Every ledger line ever written still validates — `loop/tests/ledger-order.test.mjs`, `loop/tests/ledger-before-publish.test.mjs` and `loop/tests/job-budget.test.mjs` read ledger lines; run them after changing `ledger.mjs`.
- A worktree that will not delete never costs the run its ledger line —
  `loop/tests/worktree-cleanup.test.mjs` enforces this; every test in it must stay green beside the new arms.
- The launch check's build reuse and its refusals — find what enforces `hasCurrentBuild`'s behaviour today (the architect found no test naming it; if you find none, say so, and your new test is the first).

## Mutations (perform, observe red, restore; table in RESULT1.md)

The review takes the diff from the merge base as the list of changed
behavioural lines and expects at least one mutation per changed function,
each with its red run and its restored green run recorded. A changed line
with no arm is a finding. The named mutations are required; add one per
changed function beyond them.

- Task 26: extend `LEDGER_FIELDS` with `gate_seconds`; the old-line arm goes
  red. Restore.
- Task 27: restore `--force` in `removeWorktree`; the refusal arm goes red
  (the dirty worktree is deleted). Restore.
- Task 27(ii): let `rmSync` run after a refused removal; the
  `rmSync`-not-called observation goes red. Restore.
- Task 3b: remove `.beads` from the exclusion set; arm (a) goes red while
  (b) stays green. Restore.
- Task 25: record `effort` from anywhere other than the registry entry, or
  omit `carried` on a review phase; the task 26 arms go red. Restore.

For each row: the mutation in one line, the file and line, the command, the
red output's last lines verbatim (the `# pass`/`# fail` counts), the restored
output's counts.

## How to work

1. Read `loop/lib/ledger.mjs`, `loop/lib/runners.mjs`, `loop/run.mjs` (the
   `phase` closure near line 261, `removeJobWorktree` near 827, the three
   `makeLedgerLine` call sites near 979, 1050 and 1431 — line numbers at the
   authority commit), `loop/lib/git.mjs:95-118`, `loop/lib/review.mjs:1151-1207`,
   `loop/conformance.mjs` around its two `removeWorktree` calls,
   `loop/tests/worktree-cleanup.test.mjs` whole, `scripts/verify-launch.mjs:184-288`,
   and `loop/tests/helpers.mjs` (`makeRepo`).
2. Implement task 25, then 26, then 27, then 3b, running the targeted tests
   as many iterations as you need:
   `node --test loop/tests/ledger.test.mjs loop/tests/worktree-cleanup.test.mjs scripts/verify-launch-build-reuse.test.mjs loop/tests/ledger-order.test.mjs loop/tests/ledger-before-publish.test.mjs loop/tests/job-budget.test.mjs`
   from the worktree root by absolute path.
3. Run the enforcement for every property in "## Properties".
4. Perform the mutations and fill the table.
5. Commit ONLY the files named above (`git add` each by path; never
   `git add -A`). Do not add `RESULT1.md` or `.agent-brief.md`.
6. LAST, on the committed tip, ONE final iteration of the full suite:
   `npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-E test`
   with a timeout of at least 600 seconds. A completed suite is required for
   merge; if the harness cut it off at a cap, that iteration was not an
   attempt that counts — run it again. Record its `# pass` / `# fail` counts
   and wall time.
7. Write `RESULT1.md`.

## How to end (required)

Write `D:/addictedtoai-worktrees/fleet6-stage0-E/RESULT1.md` — this exact
name, numbered, never the bare un-numbered name — with these sections, in
this order:

1. **Commits** — each sha and its one-line message; the output of
   `git -C D:/addictedtoai-worktrees/fleet6-stage0-E log --oneline main..HEAD`.
2. **What changed, per file** — for each file, what it now does that it did
   not; for `git.mjs` the exact return shape; for `run.mjs` the phase entry's
   new keys and the guarded order of the three cleanup steps; for
   `verify-launch.mjs` the exclusion set as it now reads.
3. **Tests run** — every command and the last lines of its output verbatim
   (`# pass N`, `# fail N`); the targeted tests, every property's enforcement,
   and the final full-suite iteration with its wall time.
4. **Mutation table** — one row per mutation as described above.
5. **The registry half** — the exact `effort:` lines the orchestrator must add
   to `runners.yml` for the four codex entries, and what the ledger records
   until it does (`null`), so the handover can be checked against your code.
6. **Blocked or refused calls** — each one, verbatim, or "none".
7. **Findings not fixed** — anything you saw that this brief's files could not
   fix, with file and line and numbers; or "none". Nothing is deferred silently.
