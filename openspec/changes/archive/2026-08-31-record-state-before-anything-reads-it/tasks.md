# Tasks: record-state-before-anything-reads-it

**Read section 1's framing before reading its checkboxes.** Everything in it was
implemented and committed before this change existed, in `94e747d`
(*"lifecycle: commit is not publish, ledger before rederive, consumed proposals
retire"*, 2026-08-31 03:59). It is ticked because it was **verified in the tree
on 2026-08-31**, not because a commit message says so: each item names the file
and the symbol that was read. A tick with no verification note would be exactly
the failure mode this repository keeps measuring — *"a claim written from what a
change was meant to do rather than a measurement of what it does."*

> **A note on the commit id.** The overnight work refers to this commit as
> `05b7e65`. That object still exists and `git show 05b7e65` prints it, but
> `git merge-base --is-ancestor 05b7e65 HEAD` reports it is **not** an ancestor:
> it was rebased on the way to `main` and its committed identity is `94e747d`.
> `git diff 05b7e65 94e747d` prints nothing, so the two are the same content
> under two ids. Section 1 cites `94e747d`, the one on the branch.

## 1. What shipped in `94e747d`, verified in the tree

### 1a. Committing is not publishing (`pulse`)

- [x] **1.1 — `publishStep` is two separately-governed phases.**
  *Verified*: `pulse/lib/publish.mjs` defines `commitOwned(root, ownedPaths,
  message, say)` above `publishStep`, and `publishStep` runs it under the
  comment banner `PHASE 1 — THE COMMIT. Governed by attribution, not by
  \`publish\` or a hold.` The flag is read into `configSaysPublish` /
  `effective` **after** that block, at the banner `PHASE 2 — THE PUBLISH`. The
  old first-line early return is gone: there is no `return` between reading
  `config` and the phase-1 block.
- [x] **1.2 — Attribution decides what phase 1 stages.** *Verified*:
  `normalizeOwned()` returns `null` for an undeclared caller and a
  repo-relative POSIX list otherwise; `isEngineWrite()` enumerates the five
  single-writer paths (`data/changes.jsonl`, `data/linkcheck.json`,
  `data/derived/`, `data/sources/<id>/<file>`, `public/`) and returns `false`
  for `data/launch.json`, `data/ledger.jsonl`, `data/config.json` and
  `data/sources/registry.json`; `classifyWorkingTree()` splits `dirtyPaths()`
  into `own` / `foreign` / `foreignContent`.
- [x] **1.3 — An undeclared caller commits nothing outside a publishing run.**
  *Verified*: in `publishStep`, `if (declared === null) stagePaths = STAGE_DIRS…`
  and `commit` keeps its initial `{ attempted: false, reason: 'undeclared' }`;
  the wholesale `git add ...stagePaths` sits below the `!effective` return, on
  the real publish path only. The undeclared caller is the Desk:
  `loop/lib/publish.mjs` calls `fn(ctx.repoRoot, { dryRun, log })` and passes no
  `owned`. It loses nothing — `loop/run.mjs` commits its own records by exact
  path in its own `gitTry(ctx.repoRoot, ['add', '--', ...staged])`.
- [x] **1.4 — A hold suspends phase 2 only, and nothing removes it.**
  *Verified*: `const held = existsSync(p.hold)` is read before phase 1 but
  **consumed** after it, in phase 2's `if (held) { … return { reason: 'hold',
  commit } }`. `writeHold()` is the only function touching `HOLD.md` and it only
  writes. Its text still reads *"The Pulse keeps running; only its deploy step
  is suspended."*
- [x] **1.5 — Foreign uncommitted prose refuses both halves, and does not
  suppress the disabled line.** *Verified*: the `tree.foreignContent.length`
  branch sets `commit.reason = 'foreign-content'`, `commitBlocked =
  'foreign-content'` and `stagePaths = []`, and — with an explicit comment
  saying why — **falls through** instead of returning, so phase 2 still prints
  its one line. Phase 2's `if (commitBlocked)` then refuses the push.
- [x] **1.6 — A refused commit is reported, not thrown.** *Verified*:
  `commitOwned`'s `catch` returns `{ reason: 'commit-failed', error }` after
  `say('commit', …)`; `publishStep` maps it to `commitBlocked` and phase 2
  returns `{ published: false, reason: 'commit-failed' }`. Nothing on this path
  throws.
- [x] **1.7 — The Pulse declares its own writes.** *Verified*: `pulse/run.mjs`
  line 251 builds `owned` from `mints.minted[].path` and
  `timeline.appended[].path` and passes it at line 252.
- [x] **1.8 — Publish still runs after the rebuild.** *Verified*:
  `pulse/run.mjs` runs `npm run build` at step 8 (lines 218–239), sets
  `buildFailed`, and opens `if (!buildFailed) {` at line 241 with the publish
  call inside it at line 252. Both phases are behind that guard.
- [x] **1.9 — `dirtyPaths` distinguishes "not a repository" from "the git call
  failed".** *Verified*: the `catch` calls `isRepository(root)` and, inside a
  real repository, retries `status()` once before answering `null`. Documented
  as prompted by one unreproduced flake and instrumented rather than declared
  fixed.

### 1b. The ledger is appended before the rederive (`loop`)

- [x] **1.10 — The append is a named, idempotent closure.** *Verified*:
  `loop/run.mjs` defines `let ledgerLine = null; const recordOutcome = () => { if
  (ledgerLine) return ledgerLine; … }` at lines 730–751, under a comment block
  citing the 2026-08-30 measurement.
- [x] **1.11 — The merge path calls it before `rederiveStep`.** *Verified*:
  `loop/run.mjs` line 850 is `recordOutcome();` and line 851 is `const
  rederiveResult = await rederiveStep(ctx);` — adjacent, in that order, inside
  the `merged.ok` branch.
- [x] **1.12 — Every other path still records exactly once.** *Verified*: line
  995, `const line = recordOutcome();`, commented *"A no-op on the merge path,
  which already recorded the outcome before its rederive; the append for every
  other path."*
- [x] **1.13 — The queue really is a function of the ledger.** *Verified*:
  `pulse/lib/queue.mjs` exports `scoutRanToday(root, { at, file =
  ledgerPath(root) })`, which reads `data/ledger.jsonl` directly, and
  `scoutItems()` returns `[]` when it is true. `computeQueue()` calls
  `scoutItems` first. Nothing else supplies that fact, so the ordering is the
  whole mechanism.

### 1c. A consumed proposal retires (`loop`)

- [x] **1.14 — `consumeProposal` moves the file and writes the note.**
  *Verified*: `loop/lib/proposals.mjs` exports `consumedDir(ctx)` and
  `consumeProposal(ctx, { path, slug, jobId, jobType, artifacts, mergedSha }, {
  dryRun })`. It writes `original + note` to
  `<consumed>/<slug>.consumed-<stamp>.md` then `unlinkSync(path)`; the note
  carries `date` (local, via `localDate`), `job`, `merged as`, `produced` and
  `was`.
- [x] **1.15 — Only a merged `done` outcome consumes.** *Verified*: the
  `if (proposalOrigin)` call sits inside the `merged.ok` branch of
  `loop/run.mjs` (line 899), after `outcome = 'done'`. The `outcome ===
  'discarded'` branch contains no proposal call at all — an absence, commented
  as deliberate at lines 936–941.
- [x] **1.16 — `consumed/` is a record, never a block.** *Verified*:
  `rejectionIndex(ctx)` reads `ctx.rejectedDir` and nothing else, and
  `readMarkdownDir` filters `e.isFile()`, so nothing under `consumed/`,
  `dropped/` or `rejected/` is ever read by `readProposals`'s top-level scan and
  only `rejected/` feeds slug suppression.
- [x] **1.17 — Selection writes `.job/source.json`, and it never reaches
  `main`.** *Verified*: `loop/run.mjs` lines 653–668 write `{job, type, source,
  slug, path}` with `path` made repo-relative and POSIX by
  `relative(...).replace(/\\/g,'/')`, and `git add` it with the brief. Line 762
  removes `.job` with `git rm -r --ignore-unmatch` before the merge.
- [x] **1.18 — A resumed run reads it back.** *Verified*:
  `loop/lib/resume.mjs` exports `readCommittedJobSource(repo, branch)` using
  `git show <branch>:.job/source.json` through `gitTry` (execFile, not a shell —
  the Windows `rev:path` note in `CLAUDE.md`); `loop/run.mjs` lines 562–566 set
  `proposalOrigin` from it on the resume path.
- [x] **1.19 — Both halves of the move are committed with the job's records.**
  *Verified*: `consumedPaths` collects the source and the destination, and line
  1007 concatenates it onto `staged` **after** the `existsSync` filter — with a
  comment explaining that filtering a moved file's source would stage the
  addition without the deletion.

### 1d. Documentation that shipped with it

- [x] **1.20 — The prose docs were updated in the same commit.** *Verified*:
  `94e747d --stat` lists `data/README.md`, `data/proposals/README.md`,
  `loop/README.md` and `pulse/README.md` among its twelve files.

## 2. Measurement gaps this change found and closed

Three normative sentences in the deltas had **no test**, only a structural
argument. A `SHALL` nothing measures is invisible twice over, so they were
measured rather than asserted. All four tests below were added by this change
and each is paired with a control that fails the opposite way.

- [x] **2.1 — A refused commit.** `pulse/tests/publish.test.mjs`, *"a repository
  that refuses the commit reports it, keeps the state, and does not push"*: a
  `core.hooksPath` pointing at a `pre-commit` that exits 1, on a `publish: true`
  fixture with a real temp remote. Asserts `commit.reason === 'commit-failed'`,
  `reason === 'commit-failed'`, HEAD unchanged, the state still dirty in the
  working tree, and the remote still at the base commit.
- [x] **2.2 — Its positive control.** *"POSITIVE CONTROL — the same repository
  with the hook removed commits and pushes"*: identical fixture, no hook; the
  commit lands and the remote moves. Without it, a step that refused every
  commit would pass 2.1.
- [x] **2.3 — The build gate reaches neither phase.** *"a run whose site rebuild
  fails never reaches the publish step, so it commits nothing either"*: a
  fixture `package.json` whose `build` script is `exit 1`, run **without**
  `--no-build`. Asserts non-zero exit, `site rebuild failed` in the log, **zero**
  lines containing `publish`, and HEAD unchanged.
  *Control, measured 2026-08-31 outside the suite*: the same fixture with
  `"build": "exit 0"` exits 0, prints exactly one publish line
  (`publish — disabled (data/config.json has publish: false) — nothing pushed…`)
  and moves HEAD. So the assertion discriminates rather than passing
  vacuously.
- [x] **2.4 — `consumed/` is a record, never a block, measured as behaviour.**
  `loop/tests/proposal-consumed.test.mjs`, *"`consumed/` is a record, never a
  block: the same slug may be proposed again"*. The pre-existing test asserted
  that the retirement *note contains the words* "record, never a block" — a
  claim about text. This plants a file in `consumed/` and a fresh proposal with
  the same slug and asserts the selector still offers it, with the same file
  under `rejected/` as the control that still blocks.

## 3. Verification this change ran

- [x] **3.1** `openspec validate record-state-before-anything-reads-it --type
  change --strict --no-interactive` → **`Change
  'record-state-before-anything-reads-it' is valid`**.
- [x] **3.2** `npm test` → **672 pass / 0 fail**, 672 tests, 149.4s. The four
  tests in section 2 account for the rise from the 668 recorded in `94e747d`.
- [x] **3.3** Targeted runs before the full suite:
  `node --test pulse/tests/publish.test.mjs` **23/23**;
  `node --test loop/tests/proposal-consumed.test.mjs` **8/8**.
- [x] **3.4** Delta collision check against **all three** other unarchived
  changes — re-derived from the deltas themselves on 2026-08-31, not read off an
  earlier draft. An enumeration that misses a live change is a collision check
  by luck, and the first version of this row missed one.
  - `make-the-blog-worth-sending`: `MODIFIED` on four `loop` headings (*"One job
    is one outcome…"*, *"Work comes from three sources…"*, *"Spending is
    budgeted…"*, *"Capacity exhaustion…"*), on `pulse`'s *"The work queue is
    derived, never accumulated"*, and on headings in `review` / `editorial` /
    `blog`; `ADDED` two scout headings.
  - `group-tool-listings-by-category`: `specs/directory/` only.
  - this change: `MODIFIED` `pulse`'s *"The Pulse publishes what it builds"* and
    *"The Pulse runs to completion with zero model access"*; `ADDED` one `pulse`
    and two `loop` headings.

  The touched-heading sets are **pairwise disjoint**, `ADDED` headings included.
  No heading is modified by two unarchived changes, so all three may archive in
  any order without a body being silently overwritten (`design.md`, D1/D2). One
  cosmetic order-dependence remains and is not a defect: this change's retirement
  requirement cites `data/proposals/dropped/`, whose semantics enter the
  constitution only when make-the-blog archives, so a this-first archive leaves a
  forward reference for a while. The sentence defines its own rule inline, so
  nothing is ambiguous in the interim.
- [x] **3.5** `npm run build` → **exit 0**, 615 `.html` files under `out/`. Run
  rather than reasoned about: nothing here touches `lib/`, `content/`, `app/` or
  `data/`, and it would have been easy to argue the build could not be affected
  — but a claim in this repository is a measurement.
- [x] **3.6** The working tree after all of the above holds **only** the two
  modified `*.test.mjs` files and this change directory: `git status --short`
  shows `M loop/tests/proposal-consumed.test.mjs`, `M
  pulse/tests/publish.test.mjs`, `?? openspec/changes/record-state-before-
  anything-reads-it/` and the untracked draft patch. `openspec/specs/` is
  untouched, nothing was archived, nothing was committed and nothing was pushed.

**What remains is not a task in this file, because it cannot be one.** Reviewing
this change and running `openspec archive record-state-before-anything-reads-it`
are the maintainer's, and they are the entire point of routing the spec edit
through a change rather than typing it into `openspec/specs/`. A task that could
only be ticked after archiving would also break `openspec validate --archived`,
which requires every task complete.

## 4. Traceability — every normative sentence, its implementation and its measure

A requirement nothing builds and nothing measures is invisible twice over: a
literal implementer never builds it and the integrated verification passes
without it. Every `SHALL` written in section 5's deltas appears below.

### pulse: The Pulse runs to completion with zero model access (MODIFIED)

Amended in one clause. Nothing else in the body changes, and no code changes for
it — the sentence was already false of the shipped pipeline; this makes the
constitution say what the machine does.

| Normative clause | Implemented by | Check that measures it |
|---|---|---|
| the pipeline's last step is **commit-and-publish**, whose commit half runs on every run and whose push and deploy verification run only when publishing is enabled | `pulse/run.mjs`'s single `publishStep(…)` call inside `if (!buildFailed)`, which is phase 1 + phase 2; there is no separate commit step and no flag test around the call | `publish.test` *"END TO END: a real `publish: false` run leaves its own state in git, not in the working tree"* — a run of the actual program with the flag down that reaches the step, commits, and pushes nothing. The old wording's reading (the step does not run at all when the flag is down) is exactly what this test refutes |
| the zero-model property is unchanged by the amendment | Structural: neither phase invokes a model; phase 1 is `git` only, phase 2 is `git` plus an HTTP fetch of `/status.json` | `pulse/verify-zero-model.mjs`, which appends `--dry-run --assume-publish` to the child's argv so it walks the publish path model-free on every run rather than skipping it whenever the flag happens to be off |

### pulse: The Pulse publishes what it builds (MODIFIED)

| Normative clause | Implemented by | Check that measures it |
|---|---|---|
| under `publish: true`, commit and push `main` *(pre-existing)* | `publishStep` phase 2: `git add` / `commit` / `push origin main` | `publish.test` *"content the run declares as its own — a minted stub — is staged and published"* |
| the deploy check SHALL confirm the stamp identifies **the commit this run pushed**, read after that commit exists, matched as a hex abbreviation of that SHA | `const expected = git(root,['rev-parse','HEAD'])` read after the commit; `stampMatchesCommit(id, sha)` requires `/^[0-9a-f]{7,40}$/` and `sha.startsWith(seen)` | `pulse/tests/publish-verify.test.mjs` *"declared: success is confirmed against the commit the push actually placed on the remote"*, and *"…the live build being dirty does not defeat the match"* — the only file where the true verification path runs |
| SHALL NOT read the expected value from the local build's `status.json` | Structural: `pulse/lib/publish.mjs` has **no** reader of the local stamp, and says so in a named comment block (`addictedtoai-1ml`). `lib/stamp.mjs` writes it from `git rev-parse --short=12 HEAD` at build time, which is pre-commit | `publish-verify.test` *"declared: a deploy that never lands is a HOLD, not a success — **the pre-commit stamp must not satisfy the check**"* — the exact confusion this clause forbids, measured |
| a stamp that merely changed SHALL NOT satisfy the check | `stampMatchesCommit` has no "it changed" branch | `publish-verify.test` *"declared: a live stamp that merely changes is not a confirmation — there is no any-change fallback"* |
| a stamp that does not advance ⇒ write `HOLD.md`, suspend further publishes *(pre-existing)* | `writeHold()` after the poll deadline | `publish-verify.test` *"declared: a deploy that never lands is a HOLD, not a success"*; `publish.test` *"a dirty file this run did not write is never staged…"* also asserts `reason === 'stamp-did-not-advance'` and the hold file's existence |
| under `publish: false`, push nothing and run no deploy verification | phase 2's `if (!effective) return` precedes `fetchLiveStamp` and `push` | `publish.test` *"with publish: false the step prints one line about publishing and pushes nothing"* (fixture has no `origin`, so a push could only fail loudly) |
| SHALL print **exactly one** line saying publishing is disabled | one `say('publish', 'disabled …')` on that path; phase 1 reports under the `commit` step name | same test — it counts lines containing `publish` and asserts `=== 1` |
| that line SHALL print on every such run, including one that refused something else | the `foreign-content` branch falls through instead of returning | `publish.test` *"POSITIVE CONTROL — publish: false still refuses outright on a foreign uncommitted content file"* asserts the disabled line is still in the log |
| the commit is not gated by this flag | see the ADDED requirement below | — |

### pulse: A run's computed state is committed whether or not it is published (ADDED)

| Normative clause | Implemented by | Check that measures it |
|---|---|---|
| computed state SHALL be committed on every run that produced it, whatever `publish` says and whether or not a hold stands | `commitOwned()` called from phase 1, above the flag and above the hold check | `publish.test` *"publish: false commits the run's own state and pushes nothing"*; *"HOLD.md suspends the publish … but the run's state is still committed"*; and end-to-end through the real program in *"END TO END: a real publish: false run leaves its own state in git, not in the working tree"* |
| SHALL stage only what the run can attribute to itself | `normalizeOwned` + `isEngineWrite` + `classifyWorkingTree` | *"POSITIVE CONTROL — publish: false commits only what the run declared, never a foreign edit"* (asserts `data/launch.json` is still `M` and uncommitted); *"attribution by path: the engine's own files, and nobody else's"* |
| a dirty path the run did not write SHALL NOT be staged and SHALL be named as skipped | the `for (const f of tree.foreign) say('commit', 'not staging …')` loop | *"the run declares its own writes, so the step never falls back to wholesale staging"* asserts the exact line `not staging data/config.json — dirty, but not this run's to commit` |
| a caller that declares nothing SHALL commit nothing outside a publishing run | `declared === null` leaves `commit.attempted === false` and skips phase 1 | *"an undeclared caller commits nothing on a non-publishing run — it cannot attribute anything"*; and the other half of the asymmetry, that it **does** stage on a publishing run, in `publish-verify.test` *"undeclared: the wholesale branch still stages and pushes for real — the Desk reaches it"* |
| **for a caller that declared its writes**, a foreign uncommitted `content/` file SHALL stop both halves, naming the files | the `foreignContent` branch sets `commitBlocked` and `stagePaths = []` — and it sits **inside** the `declared !== null` block, so it is armed only for a declaring caller | *"an uncommitted content file this run did not write refuses the publish outright"*; *"POSITIVE CONTROL — publish: false still refuses outright…"* asserts `commit.reason === 'foreign-content'`, `commit.foreign`, HEAD unchanged and an empty index |
| an undeclared caller SHALL NOT be refused on it, and SHALL name each such file in a warning | `pulse/lib/publish.mjs`'s undeclared branch calls `classifyWorkingTree(root, [])` and `warn(\`publish will commit ${f}, which this run did not write…\`)`, then stages wholesale | `publish-verify.test` *"undeclared: the wholesale branch still stages and pushes for real — the Desk reaches it"* — asserts the remote commit **carries** `content/seed.md` and that the warning names it. This row exists because the clause was written unscoped and the constitution would then have claimed a refusal the machine measurably does not make |
| a hold SHALL suspend the push and verification only, and nothing SHALL remove the hold file | the `held` check lives in phase 2; `writeHold` only writes | *"HOLD.md suspends the publish and nothing removes it — but the run's state is still committed"* asserts the file still exists, the commit happened, and (no `origin` configured) that no push was attempted |
| a refused commit SHALL be reported, leave the state in the tree, stop the push, and not abort the run | `commitOwned`'s `catch` → `commitBlocked` → phase 2's `if (commitBlocked) return` | **2.1** *"a repository that refuses the commit reports it, keeps the state, and does not push"*, with **2.2** as its control |
| a dry run SHALL commit nothing | `if (dryRun) commit = { reason: 'dry-run' }` before `commitOwned` is reached | *"--dry-run with publish assumed …"* asserts `hasCommits(root) === false` |
| the step SHALL run after the site rebuild, so a run the build rejects neither commits nor publishes | `pulse/run.mjs`'s `if (!buildFailed) { … publishStep(…) }` | **2.3** *"a run whose site rebuild fails never reaches the publish step, so it commits nothing either"*, with the `exit 0` control recorded in 2.3 |

### loop: A job's ledger line is written before anything recomputes the queue from it (ADDED)

| Normative clause | Implemented by | Check that measures it |
|---|---|---|
| the ledger line SHALL be appended before any recomputation of the derived tree or queue in the same run | `loop/run.mjs` line 850 `recordOutcome()` immediately before line 851 `rederiveStep(ctx)` | `loop/tests/ledger-order.test.mjs` *"the ledger line exists before the queue is recomputed from it"* — a **witness** `rederive` that calls the shipped `scoutItems` by absolute path and records `ledgerLines` and `scoutItems` at the moment of recomputation, asserting `scoutItems === 0` and `ledgerLines === 1` |
| SHALL be appended exactly once per job run | `recordOutcome`'s `if (ledgerLine) return ledgerLine` guard, with two call sites | *"the ledger line is appended exactly once, not once per call site"* |
| the derivation SHALL remain a pure function of **recorded** state — the ledger file on disk and the clock — and SHALL NOT be taught about an in-flight job | Structural: `pulse/lib/queue.mjs`'s `scoutRanToday(root, { at, file = ledgerPath(root) })` reads `data/ledger.jsonl` **from disk** and the clock, and takes no job argument; nothing in `loop/` passes one | *"POSITIVE CONTROL — a non-scout job leaves the daily scout due"* — the only difference is the job's type, so a mechanism that suppressed the sweep unconditionally would fail here. The word is *recorded*, not *committed*: `recordOutcome()` appends to the working-tree file at `loop/run.mjs:850` and the commit comes at `:1012`, after the rederive at `:851` — so a derivation reading only committed state would not see the line this ordering exists to put in front of it, and the fix would accomplish nothing. `ledger-order.test.mjs`'s witness comment says it: *"the point of the witness is what is on DISK when the derivation runs."* |

### loop: A proposal a merged job consumed is retired (ADDED)

| Normative clause | Implemented by | Check that measures it |
|---|---|---|
| a proposal a job was selected from SHALL be retired on merge, to `data/proposals/consumed/`, naming the job, the merge commit and the artifacts | `consumeProposal()`, called from the `merged.ok` branch with `jobId`, `jobType`, `artifacts: subjects`, `mergedSha` | `proposal-consumed.test` *"a merged job retires the proposal it was selected from, and the next run does not see it"* — asserts the note's `- job:`, `- merged as:` and `- was:` lines and, decisively, that a second run selects nothing |
| only a merged `done` outcome SHALL consume; a discarded job's proposal SHALL stay selectable | the call site is inside `merged.ok`; the `discarded` branch has no call | *"POSITIVE CONTROL — a discarded job leaves its proposal selectable"* |
| a job from the queue or a directive SHALL retire nothing | `proposalOrigin` is set only when `job.source === 'proposal'` | *"POSITIVE CONTROL — a merged job that came from the queue retires nothing"* |
| `consumed/` SHALL be a record and never a block — the slug SHALL NOT suppress a later proposal | `rejectionIndex` reads `ctx.rejectedDir` only; `readMarkdownDir` filters `e.isFile()` so subdirectories are invisible to the top-level scan | **2.4** *"`consumed/` is a record, never a block: the same slug may be proposed again"*, whose control puts the same file under `rejected/` and asserts it *is* suppressed |
| retirement SHALL be mechanical — no model, no inference | Structural: `consumeProposal` imports only `node:fs` / `node:path` helpers and is called after the executor has exited; `loop/run.mjs` records no phase for it | Structural, plus every test in `proposal-consumed.test.mjs` runs a mock executor whose invocation count is fixed by the job, not by the retirement |
| selection SHALL record on the branch what the job came from, as data, repo-relative | `loop/run.mjs` writes `.job/source.json` at lines 653–668 | *"a fresh selection writes `.job/source.json` onto the branch, and only for a proposal"* — asserts `source`, `slug`, and `path === 'data/proposals/dated-repair.md'`, plus a queue-job control with both `null` |
| that record SHALL be removed before the merge and SHALL NOT reach `main` | line 762's `git rm -r -q --ignore-unmatch .job <RESULT_FILENAME>` | *"the merged tree never carries `.job/`, source record included"* — `git ls-tree -r --name-only HEAD` filtered on `.job/` is empty |
| a resumed run SHALL still retire its proposal | `readCommittedJobSource` on the resume path sets `proposalOrigin` | *"a RESUMED branch retires the proposal it was selected from — the branch carries the fact"*; disabling only this recovery was measured at 6 pass / 1 fail, the failing case being exactly the resumed one |
| both halves of the move SHALL be committed together | `consumedPaths` is concatenated **after** the `existsSync` filter in the staging list | the retirement test asserts `git status --porcelain -- data/proposals` is empty and that `git log -1 --name-status` shows both a `D` and an `A` line |

## 5. Deltas

- `specs/pulse/spec.md` — **2 MODIFIED**, 1 ADDED.
- `specs/loop/spec.md` — 2 ADDED, 0 MODIFIED (`design.md`, D1).

## 6. Review, and what it changed

Reviewed 2026-08-31 by a sealed Fable pass (`review.md` in this directory):
findings were formed from the change and the shipped tree **before** the draft
patch was opened. Verdict: **yes, with three conditions**, all of them edits to
this change's own delta text, none touching code, none requiring re-testing.
All three are applied above and in the deltas:

1. **The ledger requirement said "a pure function of committed state".** False of
   the tree, and false in the one change that cannot afford to confuse committed
   with working-tree state: the rederive reads the ledger from **disk**, and if it
   read committed state the ordering fix would do nothing. Now "recorded state —
   the ledger file as it stands on disk, and the clock", with the reason stated so
   the next reader cannot re-make the error.
2. **The foreign-content refusal was unscoped.** As written the constitution
   claimed a refusal the machine measurably does not make: the undeclared
   wholesale branch *warns and pushes* the foreign file, asserted deliberately by
   `publish-verify.test.mjs`. Now scoped to a caller that declared its writes,
   with the undeclared warn-and-commit stated rather than left silent, and a
   scenario for each half.
3. **Both this change and the draft patch left the pipeline enumeration stale.**
   Repealing *"SHALL skip the publish step entirely"* in one requirement while
   *"and — when publishing is enabled — publish"* survived in another would have
   left the constitution saying two incompatible things. Now a third, collision-
   free `MODIFIED` block amends that one clause.

Conditions 1 and 2 were the change's **own** defects, not the patch's — the patch
contains neither sentence; both entered when the draft's paragraphs were enriched
into bullet-level requirements. The enrichment was right and pins more than the
patch did; two of the sentences it minted were wrong of the tree.

**A fourth defect, found after the review, by archiving and then measuring.** The
`MODIFIED` block written for condition 3 opened with a paragraph of change-
relative narration — *"Amended in one clause only… the sentence repealed below…
this change's `design.md`, D2"*. A `MODIFIED` block replaces the whole requirement
body, so `openspec archive` duly wrote that paragraph **into the constitution**,
where it cited a sentence that no longer exists anywhere and told a future reader
that something had been "amended" without saying by what. The archive was
uncommitted, so it was undone (`git checkout -- openspec/specs/`, archive
directory moved back), the block rewritten in the constitution's own voice, and
the archive re-run — no direct edit to the reserved path at any point.

Caught only because the post-archive check counted occurrences of the repealed
sentence and found **1** where 0 was expected. It was the narration quoting it,
not a failed repeal — but the wrong count is what exposed the paragraph. Two
rules earned their keep: *measure, don't infer*, and the reason the check was
worth running at all is that archiving is a one-way door into a file nothing else
may edit.

The durable form of the lesson, applying to every future delta: **a requirement
body is read by someone who will never see the change that wrote it.** Rationale
about *why an edit was made* belongs in the delta file's preamble above
`## ADDED`/`## MODIFIED`, which is not archived; only what the system *does*
belongs under a `### Requirement:` heading. The constitution already carries seven
smaller instances of this wart from earlier changes (`grep -rn "this change"
openspec/specs/`), filed as its own issue rather than fixed here.

Non-blocking items accepted rather than fixed, recorded so a later reader knows
they were seen: the `dropped/` forward reference (3.4 above); *"the publish step
is the only thing that commits any of it"*, true inside a Pulse run though
`loop/run.mjs` commits its own rederive; and pre-`94e747d` resumed branches that
carry no `.job/source.json` and merge without retiring — transient by
construction and self-healing. One was fixed in passing: the discarded/consumed
aphorism now names *the proposal the job was selected from*, so it cannot be read
against make-the-blog's *"ideas do not outlive the rejection of the work that
produced them"* once both bodies sit in one file.
