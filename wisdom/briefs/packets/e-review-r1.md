# SEALED REVIEW — Stage 0, packet E (tasks 25, 26, 27 and 3b: the ledger fields, the refusing teardown, the build-input rule). Round 1. NO EDIT RIGHTS.

authority: two-desks-work-orders-and-trains@9c1d980

You are the REVIEWER of one change, reviewing it ALONE. You fix nothing; you
judge and show your evidence. You have NO EDIT RIGHTS to any tracked file:
do not commit, do not push, do not modify the implementation or its tests
except as a MUTATION you restore immediately and prove restored by hash.

The worktree, and the only place you may write:

    D:/addictedtoai-worktrees/fleet6-stage0-E

Branch `stage0/e-ledger-teardown`, tip **`db10eac`**, merge base
**`9c1d980`** (`git -C D:/addictedtoai-worktrees/fleet6-stage0-E merge-base main HEAD`).
The author's brief is at `<worktree>/.agent-brief.md` and its report at
`<worktree>/RESULT1.md`.

## Sealing

THIS PACKET HAS NO EARLIER ROUNDS AND NO EARLIER VERDICTS. There is nothing to be sealed from. It is a first review.

State in your report, in a section headed "Sealing", whether you opened any
earlier `REVIEW*.md` file or any earlier round's report, and which.

## Known state at dispatch

The author's report (`RESULT1.md`) says, and the architect verified before
this dispatch, that:

- The branch carries two commits, `2808f42` and `db10eac`, and the diff from
  the merge base touches exactly the ten code files in the list below (the
  architect's `git diff --stat 9c1d980..db10eac`: 10 files, +481/−69).
- The author's FULL SUITE on `db10eac` completed: 1,782 tests, 1,780 passed,
  2 failed, 429.7 s reported by the runner. THE TWO REDS ARE KNOWN AND ARE
  THE BRIEF'S DEFECT, not the author's: `loop/tests/breakers.test.mjs:172-178`
  compares two throwaway jobs' ledger lines field for field, and the new
  `authority_sha` (each repository's own merge base) differs;
  `loop/tests/gate-transport-retry.test.mjs:876-880` pins the outcome line's
  additive key set to exactly `['phases']`, and this packet adds
  `brief_chars`, `gate_seconds` and `authority_sha`. Both files were OUTSIDE
  the author's Files list, so the author left them and reported them
  (RESULT1 §7), which is what the brief asked. The Files list was the tasks'
  list, not the closure over the change — the same brief defect packet B2's
  round 1 had. Do not count the two reds against the author. The architect
  re-ran both files on `db10eac` at 07:45: 49 tests, 47 passed, 2 failed,
  exactly those two ("field `authority_sha` differs"; the additive key set
  actual `['authority_sha', 'brief_chars', 'phases']` against expected
  `['phases']`). The architect's own targeted run on `db10eac` at 07:44
  (`ledger.test.mjs`, `worktree-cleanup.test.mjs`,
  `verify-launch-build-reuse.test.mjs`, `portability.test.mjs`,
  `no-change-dir-refs.test.mjs`): 34 tests, 34 passed.
- ONE OBSERVATION FROM THAT RE-RUN, for you to settle: in
  `gate-transport-retry.test.mjs`'s failing line, the outcome line carried
  `brief_chars` and `authority_sha` but NO `gate_seconds`, although that
  job's (stubbed) gates ran twice (`gates: { retried: true, ... }` on the
  author phase). Task 25(iii) says the map is present for every gate the
  job's own run executed and absent only when no gate ran. Determine
  whether the stub's gate results simply carry no `durationMs` (a fixture
  property, not a defect) or whether the code omits the map when gates did
  run (a finding against task 25(iii)). DO judge
  whether any OTHER test in the tree pins the outcome line's shape and was
  missed (the architect's sweep at the merge base found `Object.keys(line)`
  pins only at those two sites plus `portability.test.mjs:409`, which builds
  its own line and stays green — check that reading); a third pin would be a
  finding against the sweep, reported as such.
- `db10eac` (12 lines in `run.mjs`, before `removeJobWorktree`) unlinks the
  job worktree's executor protocol file (`RESULT_FILENAME` in `run.mjs`, the
  Desk's job report) before asking git to remove the worktree. The author's
  comment says this keeps throwaway fixtures — whose ignore rules do not name
  the protocol file — equivalent to the real repository, where that file is
  ignored at the root (`.gitignore:78`) and so does not make a worktree
  dirty. This is a PRODUCTION change made for fixture parity, and the
  author's mutation table shows `loop/tests/branch-cleanup.test.mjs` goes
  4/2 red without it. Judge it against task 27(ii) — "the removal is the
  whole of `removeJobWorktree`" — and against the requirement: is deleting
  the protocol file before the refusing removal a narrowing of what git may
  refuse on, is that file's content fully consumed before that point, and
  would the alternative (a fixture with the ignore rule; `helpers.mjs` was
  read-only to the author) have been the right place? Report what you find
  either way; a sound change with a fixture-shaped justification is not a
  defect, and an unsound one is.
- The registry half of task 25 — the four `effort:` lines in `runners.yml`
  (RESULT1 §5) — is the ORCHESTRATOR'S, a reserved file, and lands with this
  packet's handover. Until it does the code records `effort: null` for every
  entry, by design (task 25(i)). Do not report its absence as a finding.
- The OpenSpec task checkboxes are the architect's to tick at merge; the
  author left them, correctly.

## What you judge against, in this order

1. THE REQUIREMENTS, read from the authority commit, read-only:
   in the loop delta, *The ledger line carries the join, as a list,
   additively* (its measurement bullet), *Runner selection is a declared
   policy, and escalation is part of it* (bullet 4: every invocation records
   the runner and the effort it ran at, per phase), *The chain from intake to
   train lives in the repository* (the teardown bullet), the gate-seconds
   bullet under the gate floor; in the review delta, *A reviewer's
   non-blocking finding reaches work without editing anything* (its ledger
   bullet).

       git -C D:/AddictedtoAI show 9c1d980:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md
       git -C D:/AddictedtoAI show 9c1d980:openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md

2. THE TASK TEXT — tasks 25, 26, 27 and 3b, quoted verbatim below, including
   their bold "Resolved before E's freeze" paragraphs, which are the
   architect's resolution of every quantifier and are the standard.
3. The tree.

Never write anything under `D:/AddictedtoAI` — it is the shared checkout.

THE AUTHOR'S BRIEF IS EVIDENCE, NOT THE STANDARD. If the brief contradicts
the requirement or the task, the brief is the defect: report it against the
brief, and note that an author who did what a wrong brief said did its job.
Of the twenty-three review rounds this change has run, most were caused by
the specification, not the workers — and packet B2's round-1 brief listed
the tasks' files rather than the closure over the change. Check the closure
yourself: does `REISSUE_CODES`, `LEDGER_FIELDS`, the phase-entry shape or the
removal's return shape have an exact pin anywhere the author's file list
did not reach?

RESULT1.md IS A HYPOTHESIS. Every claim in it is unverified until you
verify it.

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

Task 3b:

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

The author was permitted exactly these; a diff touching any other path is a
scope finding. Judge each against the reason it was in scope.

- `loop/lib/ledger.mjs` — `makeLedgerLine` accepts and emits `brief_chars`, `gate_seconds`, `authority_sha`, all optional; `LEDGER_FIELDS` unchanged (task 25)
- `loop/lib/runners.mjs` — the optional `effort` string per entry (task 25(i))
- `loop/run.mjs` — the phase entry's `effort`; a review phase's `carried`; the outcome line's three new keys; `rmSync` only after git's ok in `removeJobWorktree` (tasks 25, 27(ii))
- `loop/tests/ledger.test.mjs` — (new) task 26
- `loop/lib/git.mjs` — `removeWorktree` in the refusing form (task 27(i))
- `loop/lib/review.mjs` — the reviewer-worktree caller logs a refusal (task 27(iii))
- `loop/conformance.mjs` — its two callers log a refusal (task 27(iii))
- `loop/tests/worktree-cleanup.test.mjs` — the refusal arm, the positive control, the `rmSync`-not-called observation (task 27(v))
- `scripts/verify-launch.mjs` — `.beads` in `BUILD_INPUT_EXCLUSIONS` with the rule documented (task 3b)
- `scripts/verify-launch-build-reuse.test.mjs` — (new) task 3b
- `RESULT1.md` — (new) the author's report, uncommitted, in the worktree root


## What to check

1. DOES IT DO WHAT THE REQUIREMENTS SAY? Ask of every threshold, assertion
   and fixture: WHAT WRONG WORLD WOULD THIS STILL PASS ON? Construct it.
2. THE DIFF FROM THE MERGE BASE IS THE LIST OF CHANGED BEHAVIOURAL LINES.
   Mutate lines you choose — at least one per changed function — run the
   affected tests, report the arm counts red and restored; a changed line
   with no arm is a finding; a mutation that stays GREEN is the finding.
   Restore by SHA-256. Re-run the author's named mutations (task 26's
   `LEDGER_FIELDS` extension; task 27's `--force` restored; the `rmSync`
   after a refusal; task 3b's `.beads` removed) rather than trusting the
   table; then at least one of your own against the weakest link.
3. THE PROPERTIES — find what enforces each and run it: the machinery names
   no model, provider, harness or runner id (note: the phase's `effort`
   value comes from the registry at run time; a string literal naming a rung
   in `loop/` is a violation); no source references an unarchived change
   directory; every pre-existing ledger line still validates
   (`ledger-order`, `ledger-before-publish`, `job-budget` read them); a
   worktree that will not delete never costs the run its ledger line (every
   test in `worktree-cleanup.test.mjs` green beside the new arms).
4. THE REFUSING FORM COVERS THE WHOLE REMOVAL (task 27(ii)): after a git
   refusal, `rmSync` must NOT run and the directory must stand with its
   file intact; `prune` still runs; the run continues to its ledger line.
   Check the three callers (`run.mjs`, `review.mjs`, `conformance.mjs`) all
   see `{ ok, reason }` and none falls back to `--force`.
5. THE LEDGER'S ADDITIVITY: `LEDGER_FIELDS` unchanged; `effort` recorded as
   `null` when the registry entry declares none (not omitted); `carried` on
   review phases only; `brief_chars` on the outcome line only, never on the
   two abandon-sweep lines; `authority_sha` 40 characters.
6. TASK 3b's FIXTURE never touches the real repository; `.beads` is excluded
   at the ROOT level only (the walk's `isRoot && exclude.has` rule); a write
   under `content/` still defeats reuse.
7. THE FULL SUITE: one completed author iteration on the final tip, counts
   quoted (1,773 or more, 0 failed); a cut-off, a red or an earlier commit's
   counts is a finding. Do not run it yourself.
8. WHEN YOU PARSE TEST OUTPUT, ASSERT THE TEST COUNT (`--test-reporter=tap`).

## Hard limits

- NEVER run `npm run build`, NEVER the full `npm test`, never any `verify-*`
  script as a whole (importing a function from one in a test is fine), the
  Pulse or the Desk. Targeted `node --test <absolute path>` only.
- Never use the token `cd` anywhere in a command, including in a comment — a
  guard blocks the string. Absolute paths and `git -C <dir>`.
- A blocked or refused command is REPORTED, not routed around.
- NEVER `git worktree remove`, and never delete a `node_modules`: a forced
  removal follows the junction and, on this machine, deleted 177 packages in
  a single attempt. (Task 27 is ABOUT this; its tests use throwaway
  repositories under the OS temp directory, and so must your probes.)
- Keep commands short; write a `.mjs` under `<worktree>/.job/` and run it
  rather than `node -e`. Delete any probe file you create and say so.
- Every date you write is this machine's LOCAL date, read from
  `node -p "new Date().toLocaleString('sv-SE')"`.
- DO NOT RUN `bd close`, and do not run `bd update` on any bead.
- No `git push`, `git merge`, `git commit`, or `gh`.

## Output — write to `D:/addictedtoai-worktrees/fleet6-stage0-E/REVIEW1.md`

This exact numbered name, never the bare un-numbered one.

    # Stage 0 packet E — round 1 — VERDICT: approve | revise

    ## Sealing
    ## Findings
    (if revise: NUMBERED must-fix items, each with file and line, what is
     wrong, which requirement or task clause it violates, what would make it
     right, and its CLASS)
    ## The mutations I ran
    ## The mutation table, judged
    ## What I checked that was sound
    ## Was the brief faithful to the tasks and the requirements? (and the closure)
    ## What I ran

Be adversarial about correctness and fair about scope. Approve work that is
right and narrow; a small, correct packet deserves `approve`; inventing a
finding to justify `revise` is as much a failure as missing a real one.
