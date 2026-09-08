# How one Desk job runs, and what it costs

Read-only survey of `D:/AddictedtoAI`. Nothing was modified; no gate, build,
Pulse or Desk run was invoked. Every figure below is either read out of a file
in the repository or computed from `data/ledger.jsonl` and `git log` by scripts
in the scratchpad (`desk-mech-*.mjs`). Two measurements required executing
repository code in memory — `assembleBrief`/`assembleReviewBrief`, which read
files and invoke nothing — and are marked as such.

**Corpus as of 2026-09-08:** 242 ledger lines / 241 distinct jobs, 5,151.4
model-minutes (85.9 model-hours) since 2026-08-28; 407 review records; 38
surviving `job/*` branches; 78 live proposals; 10 undone directives; 1 item in
the derived queue.

---

## A. The lifecycle of one job

`node loop/run.mjs` does exactly one of: resume the oldest resumable branch,
select and execute one new job, or report nothing qualified (`run.mjs:12-15`).

| # | Step | Function · file:line | Class |
|---|---|---|---|
| 1 | `STOP`/`HOLD.md` start gate | `startGate` · `breakers.mjs:27` | FIXED |
| 2 | Load config, runner registry, ledger | `loadConfig` `config.mjs:307`, `loadRunners` `runners.mjs:16`, `readLedger` `ledger.mjs:33` | FIXED |
| 3 | Sweep expired proposals (full parse of `data/proposals/`) | `sweepExpiredProposals` · `proposals.mjs:420` → `run.mjs:919` | FIXED |
| 4 | Conformance gate on the author runner | `conformanceGate` · `runners.mjs:144` → `run.mjs:932` | FIXED |
| 5 | Scan every `job/*` branch (3 git spawns each) | `scanJobBranches` · `resume.mjs:87` → `run.mjs:944` | FIXED, grows with undeleted branches |
| 6 | Abandon 14-day-old and budget-exhausted branches | `run.mjs:973`, `run.mjs:1024` | FIXED |
| 7 | Runner-health gate, both roles | `runnerHealthGate` · `health.mjs:223` → `run.mjs:1087` | FIXED |
| 8 | Lane pause check | `lanePause` · `budget.mjs:591` → `run.mjs:1101` | FIXED |
| 9 | Selection: gather 3 sources, run 5 gates + upkeep floor, take `candidates[0]` | `selectJob` · `select.mjs:145`; `gatherCandidates` · `select.mjs:66` | FIXED (a second full proposal parse) |
| 10 | Assemble the brief (spec excerpts up to 88,000 chars) | `assembleBrief` · `brief.mjs:645`; `excerptsFor` · `specs.mjs:243` | PROPORTIONAL only to job *type*, not job size |
| 11 | Create worktree outside the repo; commit `.job/brief.md` + `.job/source.json` | `run.mjs:1302-1352`; `addWorktree` · `git.mjs:81` | FIXED |
| 12 | Junction `node_modules` into the worktree | `linkNodeModules` · `gates.mjs:224` → `run.mjs:300` | FIXED |
| 13 | **Author invocation** | `runExecutor` · `exec.mjs:64` → `run.mjs:304` | PROPORTIONAL |
| 14 | Read `RESULT.md`, classify | `readResult` `result.mjs:60`, `classifyRun` `result.mjs:140` | FIXED |
| 15 | Commit the worktree; re-measure merge base | `commitAll` `git.mjs:129`; `refreshBase` `run.mjs:164` | FIXED |
| 16 | Breaker 4: reserved paths + brake scan | `checkReservedPaths` `breakers.mjs:218`; `brakeScan` `breakers.mjs:188` | FIXED |
| 17 | **Gates: `npm test`, `npm run build`, `verify-surfaces`, `verify-design`** | `runGates` · `gates.mjs:379`; `DEFAULT_GATES` · `gates.mjs:346` | FIXED |
| 18 | Gate retry — once, on *any* failure | `run.mjs:485-576` | FIXED when it fires |
| 19 | Compute the diff | `diffAgainst` · `git.mjs:176` → `run.mjs:587` | PROPORTIONAL |
| 20 | **Review pass 1** in a disposable detached worktree | `runReview` · `review.mjs:1151` | PROPORTIONAL |
| 21 | Merge gate (parses all 407 review records up to 3×) | `mergeGate` · `review.mjs:830` | FIXED, grows with record count |
| 22 | Optional **revision** + **review pass 2** | `run.mjs:751`, loop back to `run.mjs:590` | PROPORTIONAL |
| 23 | Strip `.job/`, `RESULT.md`; apply proposal caps/stamps; drop `data/derived/` | `run.mjs:1462`, `applyProposalMergeRules` `proposals.mjs:816`, `run.mjs:1515` | FIXED |
| 24 | `git merge --no-ff` into `main` | `mergeLocal` · `git.mjs:207` | FIXED |
| 25 | Append the ledger line — **before** any rederive | `recordOutcome` · `run.mjs:1427` | FIXED |
| 26 | **Rederive** the whole `data/derived/` tree, offline | `rederiveStep` · `rederive.mjs:141` | FIXED |
| 27 | Write `subject:` + `reviewed:` hashes onto the record | `writeRecordSubjects` · `review.mjs:1283` | FIXED |
| 28 | Retire the consumed proposal | `consumeProposal` · `proposals.mjs:477` | FIXED |
| 29 | **Post-merge build** on the main checkout | `runGates(..., {scripts:['build']})` · `run.mjs:1657` | FIXED |
| 30 | Breaker 2 / did-not-run third state | `checkBuildRed` `breakers.mjs:76`; `run.mjs:1702` | FIXED |
| 31 | Mark the directive done | `markDirectiveDone` · `directives.mjs:107` | FIXED |
| 32 | Tear down the worktree; delete the merged branch | `removeJobWorktree` · `run.mjs:827`; `run.mjs:1922` | FIXED |
| 33 | Transcribe noted proposal + carried findings + discarded attempt | `proposals.mjs:1116`, `carry.mjs:77`, `proposals.mjs:559` | FIXED |
| 34 | Commit the job's own records by exact path | `commitJobRecords` · `run.mjs:2131` | FIXED |
| 35 | **Publish** through the Pulse's shared step | `publishStep` · `publish.mjs:70` → `run.mjs:2067` | FIXED |
| 36 | Breaker 1 check | `checkConsecutiveFailures` · `breakers.mjs:64` → `run.mjs:2082` | FIXED |

**Measured fixed overhead.** Comparing each job's `job <id>: brief` commit to
its `job <id>: records (...)` commit against its ledger `mm`, across 172 jobs
since 2026-09-01: total wall 5,273.8 min, model 3,905.7 min, **non-model
overhead 1,368.1 min = 25.9%**. Median overhead for a merged job is **5.5
minutes**; the last twelve merged jobs sit in a tight 5.8–7.3 min band.
Blocked jobs show ~0 overhead because they never reach the gates. This
excludes selection, which happens before the brief commit.

---

## B. Model invocations per job

Up to four, in a fixed shape: author → review 1 → revision → review 2
(`run.mjs:135-784`; `AGENTS.md:79-88`). Measured over the 239 ledger lines that
carry `phases`:

| Role | Invocations | Model-minutes | Share of phase MM | Mean per invocation |
|---|---|---|---|---|
| author | 239 | 3,553.6 | 69.5% | 14.87 |
| review1 | 211 | 1,020.3 | 20.0% | 4.84 |
| revision | 38 | 359.5 | 7.0% | 9.46 |
| review2 | 38 | 180.5 | 3.5% | 4.75 |

211 of 241 jobs (87.6%) reached at least one review; 38 (15.8%) needed a
revision and a delta review. Mean 2.18 invocations per job. There is no third
reviewer and no separate voice/blog reviewer — the voice question is a
*required field* (`reads-human`) on the same single reviewer's record
(`review.mjs:901-927`).

**Runner and effort** come only from `runners.yml`, `default:
claude-code-opus` (`runners.yml:115`, provider `anthropic`, tier `frontier`,
both roles). Six other entries exist; `codex-gpt-luna-medium` is the only one
carrying a `job_types` restriction (`runners.yml:247`). Recorded conformance
(`data/conformance.json`): six PASS, one FAIL
(`opencode-openrouter-muse-spark`, all four checks, no `RESULT.md`). Ledger
runner distribution: `opencode-deepseek` 114, `claude-code-opus` 88,
`codex-gpt-luna-medium` 24, `codex-gpt-luna` 10, `claude-code-sonnet` 4.

**Prompt size, measured** by assembling real briefs against the live tree:

| type | author brief | of which spec excerpt | review brief (excl. diff) |
|---|---|---|---|
| interpret | 103,384 | 87,343 (84.5%) | 16,631 |
| repair | 99,901 | 84,815 (84.9%) | 16,858 |
| entry | 99,565 | 84,828 (85.2%) | 16,627 |
| verify | 91,139 | 75,957 | 16,335 |
| machinery | 87,270 | 73,045 | 16,315 |
| scout | 84,270 | 57,269 | 18,720 |
| post | 74,540 | 54,280 | 22,129 |
| tutorial | 41,239 | 26,823 | 16,636 |
| education | 36,929 | 22,626 | 16,523 |
| prune | 30,844 | 17,347 | 16,627 |

The real committed `.job/brief.md` on the newest branches confirms it:
`job/j-20260908-07` (repair) 103,881 chars, `job/j-20260908-14` (machinery)
89,003. **The same measurement on older branches shows the growth: 16,181 chars
on 2026-08-28, 33,491 on 2026-09-02, 70,349 on 2026-09-06, 103,881 on
2026-09-08 — a 6.4× rise in eleven days.** The cause is
`BRIEF_EXCERPT_MAX_CHARS`, raised 14,000 → 20,000 → 24,000 → 56,000 → 88,000,
each time because unarchived OpenSpec changes split the per-source budget
(`config.mjs:150-297` records all four re-measurements). At ~4 chars/token an
author brief is now **~25,000 tokens**; the review brief is ~16,300 static plus
the diff (median 8,101 chars, p90 55,034, truncated at 200,000 —
`review.mjs:744`), so ~6,000 tokens.

**Gates run inside the job.** Four scripts on the branch — `test`, `build`,
`verify-surfaces`, `verify-design` (`gates.mjs:346`) — retried once as a set on
*any* failure (`run.mjs:485`), plus a post-merge `build` on the main checkout
(`run.mjs:1656`). So **two full site builds and one full test suite per merged
job minimum**, three builds and two suites when the retry fires. Retries are
rare: 4 of 239 author phases recorded one, 1 of which passed.

---

## C. Job granularity

**A queue item** is one object in `data/derived/queue.json` with `type`
(from the closed `JOB_TYPES`), `title`, `detail`, optional `target`, `field`,
`subject_kind`, `rank` (`queue.mjs:9-39`). The file's order *is* the ranking;
`rank` is carried as data and never sorted on (`queue.mjs:84`). The queue is
recomputed every Pulse run, capped at 50, and cannot backlog
(`specs/pulse:484-498`). It currently holds **one** item.

**Selection** gathers directives → expiring proposals → queue → other
proposals (`select.mjs:66-105`), applies five gates plus the upkeep floor, and
takes `floor.candidates[0] ?? null` (`select.mjs:233`) — one candidate.

**One item per job is assumed in these places:**

| Where | file:line | What it assumes |
|---|---|---|
| Spec | `specs/loop:11-14` | "one stated outcome … exactly one merge or one discard" |
| Selector | `select.mjs:233` | takes `[0]` |
| Run | `run.mjs:1251` | `job` is one object |
| Brief | `brief.mjs:683-688` | one `title`, one `detail`, "This is **one job with one outcome** … do not widen it" |
| Brief | `brief.mjs:637-643` | `subjectLines` renders one `target`/`id`/`field` |
| Brief | `brief.mjs:662` | `excerptsFor(…, job.type)` — one type's capabilities |
| Brief | `brief.mjs:663` | `acceptanceChecksFor(job.type)` — throws for an unknown type |
| Budget | `budget.mjs:158` | `invocationAllowance({type})` — one type ⇒ one cap |
| Budget | `config.mjs:355` | `categoryOf(cfg, type)` — one budget category |
| Review | `review.mjs:381` | `checklistFor(job.type)` — throws, no default |
| Review | `review.mjs:551-554` | "judging the diff against THIS and nothing wider" |
| Reason list | `verdict.mjs:37` | `scope-violation` exists precisely to reject a widened diff |
| Proposals | `proposals.mjs:77` | `proposalCapFor(jobType)` — one type sets the cap |
| Proposals | `run.mjs:1617-1641` | `proposalOrigin` is one `{slug, path}` |
| Directives | `run.mjs:1747-1753` | one `job.lineNumber` gets the done marker |
| Ledger | `ledger.mjs:85` | one `type` per line |
| Breaker 1 | `run.mjs:2082` | `checkConsecutiveFailures(…, job.type)` |

**What already generalises, and this is the useful half:**

- **The review record is already set-valued.** `joinableSubjects`
  (`review.mjs:1236`) returns a *list*, `writeRecordSubjects`
  (`review.mjs:1283`) writes `subject:` as a list and `reviewed:` as a
  path→hash map, and `mergeGate` enforces set equality
  (`review.mjs:1086-1104`). N files in one job already bind correctly.
- **The blog-voice gate is already per-subject** (`review.mjs:951-996`).
- **The ledger already carries `issues` as a list** (`ledger.mjs:99-113`),
  deliberately, "one job can serve more than one issue".
- **`.job/source.json` already records `issues: []`** (`run.mjs:1342`).
- **The merge, the rederive, the publish, the records commit and the worktree
  are all per-run, not per-item.**

To let one job carry N related items you would have to change: `select.mjs`
(return a set, and decide which member's type governs), `brief.mjs` (render N
outcomes and N subject blocks; keep the scope rule meaningful), `budget.mjs` /
`config.mjs` (which type's cap and category a mixed batch spends),
`review.mjs`'s checklist selection and its scope-violation framing,
`run.mjs`'s directive marker and proposal-consumption (both singular),
`ledger.mjs`'s `type` field, and breaker 1's keying. The merge, record binding,
issue join, publish and proposal-cap machinery need **no** change.

**Batching already happens by hand and works.** `DIRECTIVES.md` lines 42, 46
and 48 each carry several items in one job — three vanished Anthropic rows as
one cohort, two carried findings against one file — with the reasoning stated
inline ("Three separate jobs would each have independently rediscovered the
same single cause at roughly three times the cost"). A directive's `title` is
free prose, so this required no code change at all. The Pulse has done the same
mechanically: `carriedFindingItems` emits one item per **subject** rather than
per file (`select.mjs:38-44` records the re-measurement: 26 standing findings
on 15 subjects).

---

## D. The upkeep floor, the selector rules, shed levels and breakers

Bounds live in `data/config.json`: upkeep floor 40%, new-writing ceiling 45%,
machinery ceiling 10%, 30-day window, per-type caps 120 min (60 for `scout`).

**Job types** (`config.mjs:24-35`, closed): `interpret`, `verify`, `entry`,
`tutorial`, `post`, `education`, `scout`, `repair`, `prune`, `machinery`.
Categories: upkeep = interpret/verify/repair/prune; new_writing =
entry/tutorial/post/education/scout; machinery = machinery. There is no
"re-review" type — a re-review is routed as an `entry` directive
(`DIRECTIVES.md:38,40,52`).

**The gate order** (`select.mjs:199-207`), each refusal naming its rule:
`runnerJobTypeGate` → `degradationGate` → `budgetGate` → `tutorialDemotionGate`
→ `tutorialPriorityGate`, then `applyUpkeepFloor`.

**What prevents new writing:** the 45% new-writing ceiling
(`budget.mjs:500-542`), measured against `max(observed total, warm-up)` where
warm-up = (100 ÷ tightest ceiling) × largest per-type cap = 10 × 120 = 1,200 MM
(`budget.mjs:376-385`); and the upkeep floor, which when upkeep is under 40%
**and an upkeep job is available** makes only upkeep jobs selectable
(`budget.mjs:553-577`). The floor deliberately never reads the warm-up
denominator. A `tutorial` is additionally blocked by any demoted tutorial
(`surfaces.mjs:23`) and by any competing tutorial `verify` (`surfaces.mjs:42`).
The blog ceiling that used to count published posts was **removed**
(`surfaces.mjs:11-16`, `config.mjs:298-302`) — nothing counts posts now.

**Shed levels** (`budget.mjs:625-665`) = count of `capacity` outcomes for the
tier in the trailing 48h. Level 1 excludes post/education/scout; level 2 adds
entry/tutorial; level 3 adds prune/machinery and restricts `interpret` to
material fields (price/licence/status). One `capacity` line exists in the whole
ledger.

**Breakers** (`breakers.mjs:19-24`, closed at four per `specs/loop:563-584`):
three consecutive `failed`/`discarded` of one type; post-merge build red; a
review bypass; a reserved-path edit. Each writes `HOLD.md` and the Desk refuses
to start. Two *non*-halting refusals sit beside them: a recorded conformance
FAIL, and `runnerHealthGate`'s three-consecutive-no-output rule
(`health.mjs:223`) — deliberately not a fifth breaker, because the spec's list
is closed and `openspec/specs/` is reserved (`health.mjs:37-53`).

---

## E. What files issues — the inflow side

Nothing under `loop/` invokes `bd`. `issues.mjs` is **format-checking only**
and says so (`issues.mjs:6-22`): it parses declared `issue:` fields
(`declaredIssueIds`, `:73`) and harvests ids from directive prose
(`harvestIssueIds`, `:111`). Existence checking is
`scripts/verify-issue-links.mjs`'s. So the loop *joins* to beads; it never
files there.

What the loop actually writes as durable, work-producing artifacts:

| Producer | file:line | Writes | Cap |
|---|---|---|---|
| Author-filed proposal | `applyProposalMergeRules` · `proposals.mjs:816` | `data/proposals/*.md` | 1 per job; 3 unflagged for `scout`, plus unlimited valid `frontier: true` (`proposals.mjs:74`, `:875`) |
| Reviewer-noted proposal | `transcribeNotedProposal` · `proposals.mjs:1116` | `data/proposals/*.md`, or straight to `rejected/` if self-amplifying | 1 per review |
| Reviewer carried findings | `transcribeCarriedFindings` · `carry.mjs:77` | `data/carried/*.md`, one file per entry | **uncapped** |
| Over-cap / invalid-flag candidates | `proposals.mjs:816ff` | `data/proposals/dropped/*.md` | — |
| Expiry sweep | `sweepExpired` · `proposals.mjs:380` | `data/proposals/dropped/*.md` | — |
| Duplicate slug | `discardDuplicate` · `proposals.mjs:346` | `data/proposals/rejected/*.md` | — |
| Consumed proposal | `consumeProposal` · `proposals.mjs:477` | `data/proposals/consumed/*.md` | — |
| Discarded attempt | `recordDiscardedAttempt` · `proposals.mjs:559` | stamps `discarded_attempts` on the source proposal | — |

**Standing inventory:** 78 live proposals, 54 dropped, 35 consumed, 1 rejected,
1 carried finding, 407 review records, 10 undone directives, 1 queue item.

The carried-findings channel is the only *uncapped* inflow, and it is the one
`select.mjs:30-44` measured as the bottleneck: on 2026-09-02 the blog published
nothing across twenty-three jobs because "reviewers file carried findings into
the queue about as fast as jobs retire them (37 filed, 35 retired in three
days, 76% of them onto a file already carried)". The Pulse-side fix was to
group by subject rather than by file. **The proposal directory is the backlog
that does not shrink**: proposals have no expiry unless declared, they sit
behind the derived queue (`select.mjs:100-102`), and the queue is currently one
item — so the effective ordering today is directives, then the scout, then a
78-deep FIFO of proposals sorted oldest-first.

---

## F. Candidate inefficiencies, ranked

1. **The brief carries up to 88,000 characters of spec text per job, and it is
   85% of the prompt.** `BRIEF_EXCERPT_MAX_CHARS` (`config.mjs:297`), spent by
   `excerptsFor` (`specs.mjs:243`) whose pass 2b fills every unspent character
   with any keyword-matching section (`specs.mjs:319-330`), so the budget is
   *saturated* rather than merely bounded. Measured growth 16,181 → 103,881
   chars per brief in eleven days. The constant's own comment says raising it
   "is restoring service, not a fix" and names the structural issue
   (`addictedtoai-2sx8`). Cost: ~20,000 tokens per author invocation, ~239
   author invocations to date, and it is charged again on every revision
   (`run.mjs:734` prepends the whole `briefText`).
2. **The full 1,201-test suite plus two full site builds run on every job,
   whatever the diff touched.** `DEFAULT_GATES` (`gates.mjs:346`) on the branch
   plus the post-merge `build` (`run.mjs:1656`). A one-line wiki-prose repair —
   58% of all jobs are `repair` — runs all 44 `loop/` tests, all 24 `pulse/`
   tests and a Playwright/Chromium pass (`verify-design`, recorded at 40.2s,
   `gates.mjs:310`). This is the bulk of the measured **5.5-minute median
   non-model overhead** and of the 25.9% wall-clock share.
3. **Serialization is total, and enforced by machine-wide locks.** One job per
   `node loop/run.mjs`; `run.mjs:12-15`. Even two Desk processes could not gate
   concurrently: `ATAI_TEST_LOCK_WAIT_MS` / `ATAI_BUILD_LOCK_WAIT_MS`
   (`gates.mjs:386`, `scripts/run-tests.mjs:105`, `scripts/prebuild.mjs:53`)
   serialize the suite and the build across the whole machine, and a lock
   refusal is classified environmental and records `interrupted`
   (`gates.mjs:100-117`, `run.mjs:518`). At a median 26 min wall per job, the
   ceiling is roughly 55 jobs/day; the observed peak was 56 (2026-09-04).
4. **The merge gate re-parses every review record, up to three times per review
   pass.** `existingFieldValues` (`review.mjs:784`) `readdirSync`s
   `data/reviews/` and gray-matter-parses each file; `mergeGate` calls it at
   `:872`, `:915`/`:983` and `:1069`. At 407 records and up to two review
   passes, that is up to ~2,400 markdown parses per job, growing forever with
   no index.
5. **`readProposals` runs twice per run over all 78 proposal files.** Once in
   `sweepExpiredProposals` (`proposals.mjs:423` ← `run.mjs:919`) and again in
   `gatherCandidates` (`select.mjs:76`). Each pass reads, `statSync`s and
   gray-matter-parses every file plus the rejection index.
6. **Whole-corpus rederive after every merge.** `rederiveStep`
   (`rederive.mjs:141`) imports and runs the Pulse's full derivation over the
   merged tree — and its output is then frequently *not committed*, because the
   guard at `run.mjs:1973-1991` refuses to commit `data/derived/` while its own
   inputs are dirty. So on a shared checkout the work can be repeated by the
   next run.
7. **Branch and worktree churn.** `scanJobBranches` (`resume.mjs:87`) spawns
   ~3 git processes per `job/*` branch on every run — 38 branches today, and
   deletion was broken until 2026-09-04 (`run.mjs:1904-1921` records 113
   branches never deleted, "not one was ever deleted"). Each job creates one
   worktree, plus one *more* disposable worktree per review pass
   (`review.mjs:1154-1195`), each with a `node_modules` junction created and
   removed.
8. **A revision costs a full second author invocation with the whole original
   brief re-sent.** `run.mjs:733-738`. 38 jobs took this path; mean revision
   cost 9.46 MM, and the delta review that follows costs another 4.75.
9. **9.3% of all model-minutes bought nothing.** 480.4 MM across 22 `failed`
   and 2 `discarded` outcomes; a further 106.3 MM on 9 `blocked` runs (which
   the design correctly counts as successes).
10. **The gate retry is now unconditional on failure.** `run.mjs:485`. Correct
    per `specs/loop:1218-1231` and cheap at the observed rate (4 of 239), but it
    doubles the ~5 min gate cost whenever it fires.

---

## G. What the design treats as load-bearing

- **The review gate.** `specs/review:13-24`: nothing model-written merges
  without a separate invocation with fresh context. It is a mechanism at three
  points — the reviewer's tree is thrown away rather than write-protected
  (`review.mjs:1189-1195`), the brief carries the diff and the checklist and
  *nothing of the author's reasoning* (`review.mjs:543-547`), and the merge
  refuses without an `approve` (`review.mjs:830-858`). Removing it would return
  ~23.5% of model-minutes and ~2 min of gate-adjacent overhead per job, and
  would remove the only thing that catches the defect class the specs name as
  the reason the site exists: "a claim written from intent rather than
  measurement, found repeatedly by skeptical readers and never once by an
  automated check" (`review.mjs:565-569`).
- **The forced-judgment fields.** A blank or recycled `would-cite`, or
  `reads-human` on a post, refuses the merge (`review.mjs:859-927`). The spec
  is explicit that a fresh-but-vacuous sentence passes and that this is
  accepted — "the field's job is to make the question asked"
  (`specs/review:72-84`). For posts it is the *only* gate: the prebuild voice
  lint is advisory by decision (`verdict.mjs:27-32`).
- **Bytes-bound review records.** `reviewed:` maps each merged path to the
  SHA-256 of its reviewed surface, written from the same measurement as
  `subject:` (`review.mjs:1283-1338`, `specs/review:361-395`). Without it an
  approval survives every later edit to what it approved. It is why several
  directives exist at all — a `mismatched` record cannot reach the derived
  queue, so re-reviews must be routed through `DIRECTIVES.md`
  (`DIRECTIVES.md:38,52,54,56`).
- **Reserved paths and `HOLD.md`.** `openspec/specs/`, `data/config.json`,
  `runners.yml`, `STOP`, and removal of `HOLD.md` (`brief.mjs:44-49`,
  `breakers.mjs:108-123`). The point is a conflict of interest, not a
  permission: a job that could edit `data/config.json` could unblock its own
  publishing mid-run. Breaker 4 reads two channels — the branch diff and a
  filesystem scan — because both brakes are gitignored and could no longer
  appear in a diff (`breakers.mjs:125-154`).
- **The publish ordering.** The post-merge build runs *before* the publish, so
  a run that produces content the build rejects publishes nothing
  (`run.mjs:1656-1746`), and the publish now runs *after* the records commit so
  a job's content and its own records reach the remote in one push
  (`run.mjs:2029-2067`). Both orderings were paid for: `addictedtoai-2v6` and
  `addictedtoai-tqpq` (three jobs' records discarded in one afternoon while
  every run still reported `done`).
- **The ledger-before-rederive ordering** (`run.mjs:1402-1425`,
  `specs/loop:803-823`): the queue is partly a function of the ledger, so
  recomputing first re-advertises the work that just finished — measured at
  20.7 wasted model-minutes on a duplicate daily scout.
- **The executor contract** — one written prompt in, files out, exit or be
  killed (`exec.mjs:10-20`, `specs/loop:426-432`). This is what makes the brief
  self-contained and therefore large; it is also what makes `runners.yml` the
  single point of change for a model/provider/harness swap, and four runners
  have passed conformance under it.

**Unverified:** I did not measure gate wall-clock myself (the 40.2s
`verify-design`, 4.7s `verify-surfaces` and 1,201-test figures are recorded in
`gates.mjs:305-311` and `DIRECTIVES.md:58`, not re-measured here); I did not
measure token counts, only characters at a ~4:1 estimate; and the
brief→records wall-clock proxy excludes the selection phase, so the true fixed
overhead per run is somewhat above the 5.5-minute median stated.
