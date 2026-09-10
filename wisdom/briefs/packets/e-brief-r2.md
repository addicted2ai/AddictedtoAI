# Packet E — tasks 25, 26, 27 and 3b of `two-desks-work-orders-and-trains` (author brief, round 2: revision)

authority: two-desks-work-orders-and-trains@9c1d980

You are a codex worker, alone and unattended, in the git worktree
`D:/addictedtoai-worktrees/fleet6-stage0-E` on branch `stage0/e-ledger-teardown`,
whose tip is `db10eac` (two commits on top of `9c1d980`, by the round-1
author: "loop: record ledger telemetry and refuse forced worktree cleanup",
"loop: clear result protocol before worktree removal"). `node_modules` is a
junction to the main checkout — do not run `npm install`. This brief is
everything you have: no prior conversation. The round-1 report is at
`<worktree>/RESULT1.md` and the sealed review that judged it at
`<worktree>/REVIEW1.md`; read both, but the standard is the quoted task text
below and the findings listed in "## What this round fixes", not either report.

## Ground rules (non-negotiable)

- Never use the token `cd` anywhere — not in a command, a comment, or a
  script: the approval guard matches the token and refuses the call. Run
  everything by absolute path; git is `git -C D:/addictedtoai-worktrees/fleet6-stage0-E ...`.
- Keep shell commands short; put anything multi-step in a `.mjs` file under
  `D:/addictedtoai-worktrees/fleet6-stage0-E/.job/` and run that.
- Do NOT run `npm run build`, any `scripts/verify-*.mjs` as a whole, the
  Pulse, the Desk, `git push`, or `bd close`. Do not edit `package.json`,
  `runners.yml` (its `effort:` half is the orchestrator's), `data/config.json`,
  `CLAUDE.md`, `AGENTS.md`, anything under `data/`, or any file outside the
  "## Files" list below.
- Nothing under `lib/`, `loop/`, `scripts/`, `app/` or `tools/` may name a
  model, provider, harness or runner id, or reference an unarchived change
  directory. Both properties have enforcement in this tree — find what enforces each, and run it.
- Tests build throwaway repositories under the OS temp directory and never
  touch this worktree's own `.git`, `data/` or the real `D:/AddictedtoAI`.
- NEVER `git worktree remove` and never delete a `node_modules`; your probes
  use throwaway repositories under the OS temp directory, as the tests do.
- If a tool call is blocked or refused, record it in `RESULT2.md` and stop
  that step; do not route around it.
- All dates are the machine's LOCAL date.

## What this round fixes — the CLASS, then the instances

This round is scoped by CLASS, not by line. Fixing only the lines named here
and leaving another instance of the same class in the same file is the
failure this repository has measured across two packets; the reviewer will
sweep for it. A red that appears against UNMUTATED code is first DIAGNOSED:
a wrong ARM is fixed and said so in `RESULT2.md`; only a genuine production
defect stops the round, reported in §7 with the evidence.

### Finding 1 (REVIEW1.md §1) — CLASS: an assertion on the SHAPE of a recorded value where the property is its VALUE

`loop/tests/ledger.test.mjs:102` asserts `line.authority_sha.length === 40`.
The reviewer mutated `loop/run.mjs:1486` from `authority_sha: mergeBaseSha`
to `'a'.repeat(40)` and the file stayed green 5/5: the ledger could record a
hash unrelated to the commit the brief was assembled against, which is the
one thing task 25(v) exists to make answerable. Fix, in the integration arm
(`:72-103`): read the fixture repository's HEAD before `runLoop` runs
(`git -C <ctx.repoRoot> rev-parse HEAD`, the merge base of a fresh job on
`main`) and assert `line.authority_sha` EQUALS it. Named mutation: the
reviewer's `'a'.repeat(40)` at `run.mjs:1486` goes red; restore.

### Finding 2 (REVIEW1.md §2) — CLASS: the same class — positivity where the property is a measured count

`loop/tests/ledger.test.mjs:100` asserts `line.brief_chars > 0`. Mutating
`loop/run.mjs:1484` from `briefText.length` to `1` stayed green 5/5. Task
25(ii) says `brief_chars` is the length of the text the author phase
actually received. That text is committed verbatim as `.job/brief.md` in the
job worktree (`run.mjs:1359-1360` on this tip writes `briefText` and adds
it) — BUT two addresses a worker would reach for first are DEAD after a
`done` job, measured on this tip: the scaffolding is removed before the
merge (`run.mjs:1503-1504`, the commit "remove job scaffolding before
merge", so `.job/brief.md` is NOT in the tree at `result.mergedSha`), and
the merged job branch is deleted in cleanup (`run.mjs:1957`, before
`runLoop` returns), so `git show <result.branch>:.job/brief.md` fails. The
file IS reachable in history, because the merge is `--no-ff`
(`git.mjs:216`): resolve the commit that ADDED it from the merged job
branch's own history —
`git -C <ctx.repoRoot> log -1 --format=%H --full-history --diff-filter=A <result.mergedSha>^2 -- .job/brief.md`
— then `git -C <ctx.repoRoot> show <that sha>:.job/brief.md` and assert
its `.length` EQUALS `line.brief_chars`. Both flags are load-bearing,
measured on the real repository on 2026-09-09: without `--full-history`,
git's path-based history simplification follows the main-line parent
(the merge result has no `.job/brief.md`, so the merge is TREESAME to it)
and the walk returns an OLDER job's brief from main or nothing at all;
`^2` starts the walk at the job branch's tip (the scaffolding-removal
commit) so no main-line brief can be reached. If what git returns differs from
`briefText` (line endings, a trailing newline), measure and say which, and
assert against the committed text's true length rather than loosening.
Named mutation: the reviewer's `brief_chars: 1` at `run.mjs:1484` goes red;
restore.

### Finding 3 (REVIEW1.md §3) — CLASS: the production path exercised only at its zero

`loop/tests/ledger.test.mjs:97` asserts `carried === 0` on a review whose
record carries nothing, and the unit arm's `carried: 2` is a hand-built
line that never passes through the parser. Mutating `loop/run.mjs:678` so
every parsed verdict writes `carried: 0` stayed green 5/5. Task 25(iv) says
`carried` is the length of that pass's parsed `carry:` list. Fix: an
integration fixture whose REVIEWER writes a record carrying a non-empty
`carry:` list (two well-formed entries) and an assertion that the
`review1` phase records `carried: 2`, keeping the zero and the no-record
cases. NO reusable reviewer exists for this, measured on this tip:
`mock-executor.mjs`'s `writeVerdict` (`:53-85`) takes no carry parameter
and no mode passes one; the only carrying mode in the tree,
`review-approve-carrying` in `loop/tests/mock-proposal-executor.mjs:269`,
deliberately includes ONE malformed entry (`CARRIED` at `:107-116`) so
`parseCarry` yields 1, not 2; `corrections.test.mjs` and
`discarded-proposal-retry.test.mjs` plant carry records for
`transcribeCarriedFindings` directly, never through a review phase's
parser. So: add ONE mode to `loop/tests/mock-executor.mjs` (it is in your
Files list for exactly this) — `review-approve-carry`, beside
`review-approve` at `:262` — by giving `writeVerdict` an optional `carry`
block parameter and writing the same approve record plus two well-formed
entries in the shape `CARRIED`'s first entry has (`title`, `detail`,
`subject`); use that mode as the fixture's `reviewerCommand`. Named
mutation: the reviewer's `carried: 0`-for-every-verdict at `run.mjs:678`
goes red; restore.

SWEEP for the three findings' class in `loop/tests/ledger.test.mjs`: every
assertion on a NEW key (`effort`, `carried`, `brief_chars`, `gate_seconds`,
`authority_sha`) either asserts the exact expected VALUE against an
independent source (the registry text, the committed brief, the fixture's
HEAD, the record the reviewer wrote, the gate results' `durationMs`) or is
listed in `RESULT2.md` with the reason a value cannot be asserted there
(`assert.ok(phase.runner)` at `:43` and `Object.hasOwn` checks are the
obvious members — decide each).

### The class from the round-1 suite: an exact pin of the OUTCOME LINE's shape that the packet's change must move in the same diff

Two tests outside round 1's Files list pin the ledger outcome line's shape
and are red on `db10eac` (the two reds in 1,782; the round-1 author
correctly left them and reported them in RESULT1 §7 — the brief's list was
the tasks' list, not the closure over the change):

- `loop/tests/breakers.test.mjs:172-178` compares a marked and an unmarked
  twice-failed job's ledger lines FIELD FOR FIELD, exempting only
  `ts`, `id`, `note`, `mm` and `phases`. The two throwaway repositories
  have different merge bases, so `authority_sha` differs. Fix: add
  `authority_sha` to the `varies` set with a one-line comment naming task
  25(v), AND `gate_seconds` with a comment naming task 25(iii) — it is a
  timing map, and two runs' timings agree only by accident (the fixture's
  gate stub carries no `durationMs`, so the key is absent on both sides
  today; the exemption is for the day a fixture times its gates). Keep
  `brief_chars` compared: both jobs receive the same assembled brief, so an
  inequality there is real information. Keep the shape assertion at `:172`
  exact.
- `loop/tests/gate-transport-retry.test.mjs:876-880` asserts that the only
  keys outside `LEDGER_FIELDS` on the outcome line are exactly `['phases']`.
  The packet adds `brief_chars`, `gate_seconds` and `authority_sha`, all
  additive (task 25(vi)). Fix: the expected list becomes the sorted set of
  the additive keys the line carries — `['authority_sha', 'brief_chars',
  'phases']` when the stubbed gates record no duration, and say in a comment
  why `gate_seconds` is absent in this fixture — keeping the assertion EXACT:
  an exact pin is the right direction of strictness here (any deviation
  means the premise changed), so do not loosen it to a subset or a filter.

SWEEP the class: every test or script that pins, by exact key set, exact
object equality, field-for-field comparison or snapshot, (a) a ledger line
written by `makeLedgerLine` or read back by `readLedger`, (b) a phase entry's
key set, (c) `removeWorktree`'s return shape or `removeJobWorktree`'s return
shape, (d) `BUILD_INPUT_EXCLUSIONS`. Start from `grep -n "Object.keys(line"`,
`"LEDGER_FIELDS"`, `"varies"`, `"removeWorktree"`, `"BUILD_INPUT_EXCLUSIONS"`
across `loop/tests/`, `scripts/` and `loop/lib/`. For each instance found:
fix it in the same way if it is in your Files list, or list it in
`RESULT2.md` with file, line, what the pin holds and why it stands. The
sweep's list is a required section of the report even when it is empty of
changes. The architect's own sweep at `9c1d980` found `Object.keys(line)`
pins at the two sites above and at `loop/tests/portability.test.mjs:409`,
which builds its own eight-key line and stays green — confirm that reading.

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

Work only in these files. Every other path is out of scope.

- `loop/lib/ledger.mjs` — round 1's optional keys, if a finding names it
- `loop/lib/runners.mjs` — the optional `effort`, if a finding names it
- `loop/run.mjs` — the phase entry, the outcome line, the guarded cleanup order, the protocol-file unlink, if a finding names it
- `loop/tests/ledger.test.mjs` — (new) on this branch since round 1: task 26's arms
- `loop/lib/git.mjs` — `removeWorktree`'s refusing form, if a finding names it
- `loop/lib/review.mjs` — the reviewer-worktree caller, if a finding names it
- `loop/conformance.mjs` — its two callers, if a finding names it
- `loop/tests/worktree-cleanup.test.mjs` — task 27's arms
- `scripts/verify-launch.mjs` — the exclusion set and its comment, if a finding names it
- `scripts/verify-launch-build-reuse.test.mjs` — (new) on this branch since round 1: task 3b's arms
- `loop/tests/breakers.test.mjs` — the field-for-field comparison at `:172-178` (the class above)
- `loop/tests/gate-transport-retry.test.mjs` — the additive-key pin at `:876-880` (the class above)
- `loop/tests/mock-executor.mjs` — ONE new reviewer mode, `review-approve-carry`, and the optional `carry` parameter of `writeVerdict` it needs (finding 3); nothing else in the file
- `RESULT2.md` — (new) your report, in the worktree root; see "## How to end"

`loop/tests/helpers.mjs` is read-only. Any other file the sweep turns up is
NOT yours to edit: list it in `RESULT2.md` with file, line and what the pin
holds, and stop there.

## Mutations (perform, observe red, restore; table in RESULT2.md)

The reviewer takes the diff from the merge base `9c1d980` as the list of
changed behavioural lines and re-runs mutations. For every finding you fix:
the mutation that reproduces the finding (the wrong world it names) goes RED
against your fix and restores GREEN; record both. For the two pins: revert
each to its round-1 form and confirm the test goes red on this tip; restore.

## How to work

1. Read `REVIEW1.md`, then `RESULT1.md`, then the files a finding names.
2. Fix each finding at its CLASS: for every instance named, ask where else
   the same purpose is served in the same file and fix those too; list them.
3. Run the targeted tests as many iterations as you need:
   `node --test loop/tests/ledger.test.mjs loop/tests/worktree-cleanup.test.mjs scripts/verify-launch-build-reuse.test.mjs loop/tests/breakers.test.mjs loop/tests/gate-transport-retry.test.mjs loop/tests/ledger-order.test.mjs loop/tests/ledger-before-publish.test.mjs loop/tests/job-budget.test.mjs`
   from the worktree root by absolute path.
4. Run the enforcement for the naming and change-directory properties: find what enforces each, and run it.
5. Commit ONLY the files named above (`git add` each by path; never
   `git add -A`); do not add `RESULT2.md`, `RESULT1.md`, `REVIEW1.md` or `.agent-brief.md`.
6. LAST, on the committed tip, ONE final iteration of the full suite:
   `npm --prefix D:/addictedtoai-worktrees/fleet6-stage0-E test`
   with a timeout of at least 600 seconds. If the harness cut it off at a cap,
   that iteration does not count as an attempt — run it again. Record its
   counts and wall time. A green suite here is the merge precondition.
7. Write `RESULT2.md`.

## How to end (required)

Write `D:/addictedtoai-worktrees/fleet6-stage0-E/RESULT2.md` — this exact
numbered name — with these sections, in this order:

1. **Commits** — `git -C D:/addictedtoai-worktrees/fleet6-stage0-E log --oneline main..HEAD`.
2. **Findings, each with its class and every instance fixed** — one entry per
   finding in "## What this round fixes": the class, the lines changed, and
   the SWEEP list (every other instance in the file, fixed or with the reason
   it stands).
3. **Tests run** — every command and the last lines of its output verbatim,
   including the final full-suite iteration with its wall time.
4. **Mutation table** — one row per finding and one per pin.
5. **The registry half** — unchanged from RESULT1 §5 unless a finding changed
   it; say which.
6. **Blocked or refused calls** — verbatim, or "none".
7. **Findings not fixed** — with file, line and reason; or "none".
