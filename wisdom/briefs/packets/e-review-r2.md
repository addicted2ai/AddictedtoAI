# DELTA REVIEW — Stage 0, packet E (tasks 25, 26, 27 and 3b), round 2. NO EDIT RIGHTS.

authority: two-desks-work-orders-and-trains@9c1d980

You are the REVIEWER of a tests-only revision round, reviewing it ALONE with
NO EDIT RIGHTS: do not commit, do not push, do not modify any tracked file
except as a MUTATION you restore immediately and prove restored by hash.

The worktree, and the only place you may write:

    D:/addictedtoai-worktrees/fleet6-stage0-E

Branch `stage0/e-ledger-teardown`, tip **`ce59b3a`**, merge base
**`9c1d980`**. The previous round's tip was `db10eac`; this round's
diff is `git -C D:/addictedtoai-worktrees/fleet6-stage0-E diff db10eac..HEAD`
and must touch ONLY `loop/tests/ledger.test.mjs`, `loop/tests/breakers.test.mjs`, `loop/tests/gate-transport-retry.test.mjs` and `loop/tests/mock-executor.mjs`
— any other tracked path in it is a finding and a full-review trigger.

## This is a DELTA review, and it is NOT sealed — say so

You are GIVEN the previous review, `<worktree>/REVIEW1.md`,
because you need it: this round exists to build the arms it found missing
and to move the two ledger-shape pins its round-1 suite turned up. The
author's report is `<worktree>/RESULT2.md` (a hypothesis) and its
brief `<worktree>/.agent-brief.md` (evidence). State in a section headed
"Sealing" that you read REVIEW1.md and were not sealed from it,
and name anything else you opened.

## Exit condition (the architect's ruling, in the Stage 0 preamble)

Round 1's sealed review (REVIEW1.md) found three test gaps — assertions on
the SHAPE of a new ledger value where the property is its VALUE — and two
closure pins outside the round-1 Files list; no production defect. Round 2
is tests only. That class of finding has no floor (packet B2's four reviews
of one diff each found new green mutants, none a production defect), so the
architect's exit condition in the Stage 0 preamble applies: you APPROVE
when (a) every named mutation of REVIEW1's three findings — an unrelated
40-character `authority_sha` at `run.mjs:1486`, `brief_chars: 1` at
`run.mjs:1484`, `carried: 0` for every parsed verdict at `run.mjs:678` — goes
RED under you against the current production code and restores GREEN by
hash; (b) the two pins, reverted to their round-1 form, go red on this tip
and restore; (c) this round's diff is within its listed test files; (d) the
standing properties hold; and (e) the author's completed full suite on the
final tip is green (1,782 or more, 0 failed). A further green mutant you
find is written into your review under "Carried, non-blocking" and does NOT
change the verdict — unless it exposes a PRODUCTION defect (an arm that
goes red against the unmutated code, or a wrong world the requirement
forbids), which remains a revise. Do not manufacture a revise from the
carried class; do not approve if any prior named mutation stays green.

## What you judge, in this order

1. EACH FINDING in REVIEW1.md now has an arm: re-run the NAMED
   MUTATION of each finding yourself (the exact mutation the review ran, at
   the line it names, against the current production code), record the arm
   RED with its `# pass`/`# fail` counts, restore by SHA-256, record GREEN. An
   arm the author claims red that stays green under you is a finding; an arm
   that goes red against the UNMUTATED code was to be DIAGNOSED by the
   author (a wrong arm fixed and said so; a production defect stopped on) —
   check §7 of the report and judge the diagnosis.
2. THE TWO PINS: `loop/tests/breakers.test.mjs:172-178` (field-for-field,
   `authority_sha` and `gate_seconds` now exempted, `brief_chars` still
   compared, the shape assertion exact) and
   `loop/tests/gate-transport-retry.test.mjs:876-880` (the additive key set,
   exact). Revert each to its round-1 form and confirm red on this tip;
   restore by hash.
3. THE SWEEP: the author was required to list every other exact pin of a
   ledger line's shape, a phase entry's key set, the removal's return shape or
   `BUILD_INPUT_EXCLUSIONS`, fixed or with the reason it stands. Grep for
   them yourself (`Object.keys(line`, `LEDGER_FIELDS`, `varies`,
   `removeWorktree`, `BUILD_INPUT_EXCLUSIONS` across `loop/tests/`,
   `scripts/`, `loop/lib/`); an instance the list omits is a finding.
4. THE DIFF-AS-THE-LIST on THIS round's changed TEST lines: a test arm is
   itself behaviour; for each new or changed arm, ask what wrong world it
   still passes on (a presence check where the property is a value; an
   exemption wider than its reason; a cap that does not bind).
5. THE FULL SUITE: the author must have run ONE completed iteration on the
   final tip and quoted its counts (1,782 or more, 0 failed); a cut-off, a
   red, or counts from an earlier commit is a finding.
6. THE STANDING PROPERTIES — find what enforces each and run it: the machinery
   names no model, provider, harness or runner id; no source references an
   unarchived change directory; every pre-existing ledger line still
   validates; every test in `worktree-cleanup.test.mjs` is green.
7. WHEN YOU PARSE TEST OUTPUT, ASSERT THE TEST COUNT (`--test-reporter=tap`).

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

The author was permitted exactly these; anything else in this round's diff is
a scope finding.

- `loop/tests/ledger.test.mjs` — (new) on this branch since round 1; the three value arms (findings 1-3) and the sweep
- `loop/tests/breakers.test.mjs` — the field-for-field comparison's `varies` set at `:172-178` (the pin)
- `loop/tests/gate-transport-retry.test.mjs` — the additive-key pin at `:876-880`
- `loop/tests/mock-executor.mjs` — one new reviewer mode, `review-approve-carry`, and `writeVerdict`'s optional carry block (finding 3)
- `RESULT2.md` — (new) the author's report, uncommitted, in the worktree root

## Hard limits

- NEVER run `npm run build`, NEVER the full `npm test`, never any `verify-*`
  script as a whole (importing a function from one in a test is fine), the
  Pulse or the Desk. Targeted `node --test <absolute path>` only.
- Never use the token `cd` anywhere in a command, including in a comment — a
  guard blocks the string. Absolute paths and `git -C <dir>`.
- A blocked or refused command is REPORTED, not routed around.
- NEVER `git worktree remove`, and never delete a `node_modules`: a forced
  removal follows the junction and, on this machine, deleted 177 packages in
  a single attempt. Your probes use throwaway repositories under the OS temp
  directory, as the tests do.
- Keep commands short; write a `.mjs` under `<worktree>/.job/` and run it
  rather than `node -e`. Delete any probe file you create and say so.
- Every date you write is this machine's LOCAL date, read from
  `node -p "new Date().toLocaleString('sv-SE')"`.
- DO NOT RUN `bd close`, and do not run `bd update` on any bead.
- No `git push`, `git merge`, `git commit`, or `gh`.

## Output — write to `D:/addictedtoai-worktrees/fleet6-stage0-E/REVIEW2.md`

This exact numbered name, never the bare un-numbered one.

    # Stage 0 packet E — round 2 (delta) — VERDICT: approve | revise

    ## Sealing
    (that you read REVIEW1.md, and anything else you opened)

    ## Findings
    (if revise: NUMBERED must-fix items, each with file and line, what is
     wrong, what would make it right, and its CLASS)

    ## The prior findings' arms, re-run
    (per finding: the named mutation, the command, red counts, restoration
     hash, green counts)

    ## The two pins, reverted and restored

    ## The sweep, checked

    ## Carried, non-blocking
    (a further green mutant, if any — see the exit condition)

    ## What I checked that was sound

    ## What I ran
    (exact commands and their real output)

Approve work that is right and narrow; a small correct round deserves
`approve`, and inventing a finding to justify `revise` is as much a failure
as missing a real one.
