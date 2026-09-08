# The machinery since the greenfield relaunch (2026-08-28 → 2026-09-08)

Research report for an architect proposing a redesign. Read-only; nothing in
`D:/AddictedtoAI` was modified and no build, test, verify, Pulse, Desk or push
command was run.

Scope note: "the machinery" = `pulse/` (the Pulse), `loop/` (the Desk),
`scripts/` (the gates), `lib/` (the build core the gates run), `runners.yml`,
`data/config.json`, and the orchestration around them.

---

## 0. The shape of the thing, in numbers

Measured 2026-09-08 from the repository itself.

| Measure | Value | Source |
|---|---|---|
| Repo commits since 2026-08-28 | **2,063** | `git log --since=2026-08-28` |
| Commits touching machinery paths | **300** (293 substantive) | `git log -- loop pulse scripts lib runners.yml data/config.json` |
| Machinery `.mjs` LOC, 2026-08-28 | **23,941** across 129 files | `git ls-tree` at each day's last commit |
| Machinery `.mjs` LOC, 2026-09-08 | **83,477** across 254 files | same |
| Growth in 11 days | **3.49×** | same |
| Machinery `.mjs` files that are tests | **119 of 254 (47%)** | `git ls-files` |
| Insertions: machinery + `lib/` | **+91,131** | `git log --numstat` |
| Insertions: `openspec/` | **+41,538** | same |
| Insertions: `content/` (the actual site) | **+43,947** | same |
| **Ratio, process code+specs : site content** | **≈3.0 : 1** | derived from the two rows above |
| Desk jobs recorded in the ledger | **242** | `data/ledger.jsonl` |
| Total Desk model-minutes | **5,151 min = 85.9 h** | same |
| Review records on disk | **408** (252 job, 150 seed, 5 orchestrator) | `data/reviews/` |
| Live proposals / consumed / dropped | **79 / 35 / 54** | `data/proposals/` |
| Derived queue depth right now | **1 item** (cap 50) | `data/derived/queue.json` |
| `HOLD.md` / `STOP` standing right now | **neither** | filesystem |
| `publish` right now | **`false`** — turned off 2026-09-08 08:03 local, *"while the Desk/fleet redesign is worked out"* (`78c6361`) | `data/config.json` |

**Live-state note.** `data/config.json` read `"publish": true` at the start of
this research session and `false` by the end: commit `78c6361` landed at
08:03:01 while I was working. **The redesign this report is written for is
already in flight, and the maintainer's stated preference — stop the Desk and
publishing while it is fixed (`addictedtoai-douz`) — has been acted on.**

The founding proposal `build-initial-site` states the reason the previous site
was wiped: *"the previous version died of machinery: … roughly seven lines of
process for every line of site."* Eleven days after the relaunch the ratio is
back to **about three to one** and rising. That is the single most important
number in this report.

---

## A. Dated timeline

### A.1 Archived OpenSpec changes (24)

`MACH` = touches the Desk, Pulse, gates, review, budgets, publishing, runners
or the queue. `CONT` = content/site only.

| Date | Change | Kind | What and why |
|---|---|---|---|
| 08-30 | `build-initial-site` | MACH+CONT | The founding change — wiki substrate, five surfaces, Pulse, Desk, mandatory review, GA4. Explicitly a reaction to the old site dying of machinery. |
| 08-30 | `harden-seed-wave-guardrails` | MACH | Six defects from a 12-agent wave in which **37 of 83 pieces failed review**; converts instructions into mechanisms. (`zlq`, `48r`, `473`, `pfv`, `tr8`, `o5t`) |
| 08-30 | `teach-the-whole-subject` | CONT | 37-page curriculum of record (27 new). (`18c`) |
| 08-31 | `bound-a-jobs-total-spend` | MACH | The wall-clock cap was **per invocation** and a job makes four — "a post was entitled to 480 minutes". Worst case 480→240. (`o5t`) |
| 08-31 | `record-state-before-anything-reads-it` | MACH | Commit≠publish; ledger before rederive; consumed proposals retire. "Careful about producing state and careless about retiring it." (`1ml`) |
| 08-31 | `write-the-constitution-in-timeless-voice` | MACH (text) | Six requirement bodies rewritten out of change-narration voice. |
| 09-01 | `catch-the-constitution-up-to-the-code` | MACH (text) | Six shipped mechanisms the constitution did not describe. |
| 09-01 | `group-tool-listings-by-category` | CONT | Closed `category` field on 35 tool listings. (`0eg`) |
| 09-01 | `let-the-site-see-its-own-gaps` | MACH | First inward-looking queue producer; `QUEUE_PRODUCIBLE_TYPES` as a closed list. (`3zf`, `wemx`, `kat1`) |
| 09-01 | `link-the-machines-work-to-beads` | MACH | Mechanical bead join at the three work entry points + ledger. (`occ0`, `fyd3`, `fvoo`) |
| 09-01 | `make-the-blog-worth-sending` | MACH+CONT | The daily **scout**: Pulse derives it, Desk runs it, ≤3 expiring proposals/day. Largest pipeline addition after the founding change. (`6ov`, `3zf`) |
| 09-01 | `make-the-site-machine-readable` | CONT/site | JSON-LD, robots stance, `/catalog.json`, IndexNow behind five guards. (`k1j`, `dwo`, `1r7`, `nq36`, `en3s`) |
| 09-02 | `answer-a-withdrawal-instead-of-deleting-it` | MACH | Deleting a vanished-row record retired nothing — "the finding was still immortal; it had merely acquired a file." |
| 09-02 | `retire-a-withdrawn-feed-row` | MACH | A rank-85 item with no retirement condition made **everything below rank 85 unreachable** for two Pulse cycles, starving the scout. (`javv`, `qupq`, `5hn`, `64fk`) |
| 09-03 | `batch-carried-findings-by-subject` | MACH | **The batching change.** One queue item per *subject*, not per file: 27 findings → 16 jobs. (`5hn`) |
| 09-03 | `let-dated-news-outrank-the-queue` | MACH | Expiring proposals outrank the queue — on 09-01, 23 jobs ran and none was a `post`. Plus the same-day regression fix (`z5dj`). (`mtnk`) |
| 09-06 | `correct-wordings-the-archive-carried` | CONT | Four inaccurate sentences the archive had already merged into live specs. |
| 09-06 | `flag-what-moved-the-frontier` | MACH+CONT | Frontier flag with a build gate — "an exemption without a bar is a loophole." (`ego8`) |
| 09-06 | `separate-a-claim-from-a-fact` | MACH+CONT | Vendor claims become their own record type with a vendor-domain test. (`eb4l`, `ego8`, `c563`) |
| 09-06 | `tag-the-corpus-by-domain` | CONT | Eight-value `domains` facet as a second axis beside `kind`. (`ego8`, `bju`) |
| 09-07 | `bind-a-price-to-the-vendor-that-posts-it` | MACH | Price events re-keyed to a vendor-posted rate; the site had emitted **no price event for eight days**. (`ak9`, `8ho`, `pfc`, `k7d`) |
| 09-07 | `retry-the-gates-once-and-name-the-failure` | MACH | Unconditional gate retry + transport-marker classification; **refuses** `juig`'s exemption. (`icpb`, `xzdd`, `brsp`, `ovrk`, `ucbv`, `e71c`, `juig`) |
| 09-07 | `say-what-a-review-record-covers` | MACH | An approving verdict must answer the voice question afresh; **458 body-less entries were outside the binding entirely**. (`37rb`, `kpgn`, `4nq`) |
| 09-07 | `tell-a-missed-deploy-from-a-slow-one` | MACH | Deploy verification: SHA equality → containment + confirmation window + classified hold. (`k2y0`) |

**Tally: 16 machinery, 5 content, 3 both.** Two-thirds of all specified work
since the relaunch was spent on the machine, not the site.

### A.2 Open (unarchived) changes — all three at **0 tasks done**

| Change | Tasks | Restructures? | Substance |
|---|---|---|---|
| `bind-what-the-catalog-knows` | 0/25 | partly | A **census fact** computed at build time so "it cannot rot, carries no date and needs no hedge" — the structural fix for the census class in §B.1. Records a schema landmine (`discriminatedUnion` on `source` vs timeline events that declare none). |
| `keep-the-map-describing-the-territory` | 0/29 | **yes** | A tutorial curriculum of record + departure discipline; `tutorial` becomes queue-producible. Root cause: *`curriculum` occurs zero times in `loop/`* — the map "binds the build and the queue and reaches neither actor who could amend it." |
| `let-the-queue-see-a-judgment` | 0/24 | **yes** | A Pulse producer minting a `verify` item for `mismatched` review state at rank 69. Today a lapsed approval fails the launch gate and **cannot become work** — the only route to green is a hand-written directive. |

All three were drafted 2026-09-06/07 in parallel worktrees. **78 specified
tasks are queued and none has started.** Two of the three exist to fix
machinery pathologies this report documents independently.

### A.3 Major code changes, by phase

- **08-28 (24 machinery commits).** The whole machine lands in one day: content model, Pulse, Desk + conformance suite, surfaces, verify-launch. Same day: `63f3985 config: raise every job cap to 120 minutes, temporarily, to gather evidence` — still 120 today, 11 days later.
- **08-29 (11).** Launch. `publish: true`. Two publish-arming incidents (§B.2). `60ccfc2 build-lock: reclaim a lock written by another machine — this was the deploy outage`. Pulse scheduled 4×/day.
- **08-30–08-31 (59).** The guardrail explosion: shell-token guard, spec-delta check, price attribution, snapshot-census gate, budget total-spend bound, test lock separated from build lock. `verify-design` uncapped.
- **09-01–09-05 (37).** Selection and lifecycle repairs — expiring proposals outrank the queue, batching by subject, worktrees moved onto the repo drive, `4f8d9a3 loop: publish after the job's records exist, and declare what it wrote`. `3968a21 loop: re-measure the brief excerpt budget, 24,000 → 56,000`. UI freeze (publishing off, STOP placed).
- **09-06–09-07 (157 — over half the total).** The heaviest two days: frontier/claims/domains, gate retry on any failure, worktree-removal hardening, review carry-forward, conformance fixes, four new runner entries. `8109f8d loop: BRIEF_EXCERPT_MAX_CHARS 56,000 → 88,000`.
- **09-08 (12).** Gate classifier holes, post-merge build tri-state, IndexNow ledger, `1e916f3 publish: correct the stale HOLD.md rule and name its double duty`.

### A.4 Halts and brakes

`HOLD.md` and `STOP` are gitignored (`.gitignore:68-69`), so **there is no
commit history for either** — the halt record survives only in
`FULL-MEM-LOG.md`, the Pulse logs and beads. That is itself a finding: the
brake that governs the machine leaves no durable audit trail.

| Date | Brake | What tripped it | Resolution |
|---|---|---|---|
| 08-29 | `HOLD.md` | `npm test` (`loop/tests/publish.test.mjs`) called the real publish step against `DEFAULT_REPO_ROOT` and **pushed to the live remote**; the breaker then halted the Desk. | Fixture repo. `addictedtoai-wxq`, `-64y` |
| 08-30 | (publish arming) | `node pulse/verify-zero-model.mjs` spawned the real `pulse/run.mjs`, reached its publish step and **pushed `origin/main`** — run by a sealed reviewer told twice never to push. | `--dry-run --assume-publish` *appended* to child argv. `addictedtoai-r8k` |
| 09-01 06:00 | `HOLD.md` | Deploy-verification halt. Pulse log `pulse-20260901-060002.log`: *"publish — HOLD.md present … publish suspended until the hold clears"*. | Diagnosed same day (`addictedtoai-k2y0`) but **left standing for three hours** because the orchestrator read a stale scoping sentence in `CLAUDE.md`. Maintainer: *"This is NOT true … I have given you authorization at least 5 times now."* |
| 09-05 | `STOP` | Maintainer's UI freeze. Pulse gap is visible in the logs: no run between 09-05 06:00 and 09-06 18:00. | Removed 09-05 under a one-time pre-authorisation, now used up. |
| 09-06 | `HOLD.md` (mid-run) | A job's merge reached `origin` **while `HOLD.md` stood** (j-20260906-17). | Chain script now suppresses the push when HOLD appears mid-run. |
| 09-07 | job halt | `opencode-zen-muse-spark` attempted a **reserved-path edit** — breaker 4 fired as designed. | Ledger `j-20260907-13`, outcome `failed`. |

---

## B. Recurring failure classes

Ordered by measured cost.

### B.1 Snapshot-census staleness — the machine breaks itself on a clock

**The most expensive recurring class, and it is still open.**

A page states a count anchored to a snapshot date. The next Pulse renders that
page's transclusions from a newer snapshot, `lib/snapshot-census.mjs` sees the
dates disagree, and **the build fails** — which means the Pulse's own rebuild
fails and publishing stops.

Measured directly from `.pulse-logs/`: of 35 scheduled Pulse runs that recorded
an exit code, **4 failed, and all 4 are this class** — and **3 of the 4 are the
00:00 run**, because the local date rolls over and every un-hedged census
written the previous day detonates at once.

| Pulse run | Exit | Content errors |
|---|---|---|
| `pulse-20260903-000002.log` | 1 | 1 × `[snapshot-census]` |
| `pulse-20260904-000002.log` | 1 | 2 × `[snapshot-census]` |
| `pulse-20260906-180001.log` | 1 | 2 × `[snapshot-census]` |
| `pulse-20260908-000001.log` | 1 | 2 × `[snapshot-census]` |

Recurrence dates: 08-31 (hedge introduced, `23490df`, sweep `a2807fb`,
`addictedtoai-7q8`) · 09-03 · 09-04 · 09-06 (also forced `publish` off:
`76df017 publishing off until the two hedged censuses are re-reviewed`) · 09-07
· 09-08 (`4f669c2 hedge the z-ai:free census so the build passes`).

The killer property, from `FULL-MEM-LOG.md`: **"THE CHECK CANNOT WARN THE
AUTHOR, BECAUSE ON THE DAY OF AUTHORING THE CLAIM IS COMPLIANT."** The hedge
count has climbed 16 → 15 → 18 → 21 → 23; the log records its own threshold —
*"if it climbs well past 15 the corpus is leaning on the hedge as a default …
IT IS ALREADY 21 as of 2026-09-07 — past that threshold, measured, and nobody
has acted on it."*

Structural fix filed as **`addictedtoai-6nrk`** (P2, open) and specified as the
open change `bind-what-the-catalog-knows` — **0 of 25 tasks done**.

### B.2 Publish arming — "a script's name does not tell you whether it publishes"

- **08-29** — `npm test` pushed to the live remote (`addictedtoai-wxq`, `-64y`).
- **08-30** — `verify-zero-model.mjs` pushed `origin/main` (`addictedtoai-r8k`).
- Root cause named as shared: *"both happened because code assumed `publish`
  was false and NOTHING RE-CHECKED when it changed."*
- **09-04** — `640d0ce publishing OFF, and a directive to fix why the Desk publishes undeclared`.
- **09-07** — `addictedtoai-zuoo` raised to **P1** after a Desk job pushed an
  ungated merge commit mid-gate-run. **The push is still not scoped**:
  `pulse/lib/publish.mjs` pushes `origin main` branch-wide and unconditionally.
- **09-08** — quantified: *"FIVE of one session's SEVEN local commits had
  already reached origin/main via OTHER sessions' publish steps, none by any act
  of its own, and the remaining two sat in a ten-commit unpushed backlog."*
  *"THE SWEEP IS THE NORMAL ROUTE TO THE REMOTE HERE, not an occasional
  accident."*

The log names the contradiction plainly: *"CLAUDE.md's 'commit locally as often
as you like' and 'push only what passed the gates' cannot both hold while the
push is branch-wide and unconditional."*

Publishing has been toggled by **21 commits in 11 days** — counted, not
estimated (`git log -- data/config.json | grep -i publish`), from `set publish
true` on 08-29 to `publish false while the Desk/fleet redesign is worked out`
on 09-08. Two of the 21 exist only to correct each other: `61d8008 config:
publish back on` was followed by `f9b48f4 config: actually turn publish on —
61d8008 said it and did the opposite`. **A hand-toggled boolean is doing the job
a scoped push should be doing, and it has already been set wrong at least
once.**

### B.3 Gate failures — the largest single sink of Desk minutes

**17 of 242 jobs (7%) died on "gates failed"**, and 18 of the 33 non-`done`
notes are gate failures. Within that, one sub-class dominates:

**"npm run test (exit 1) — no transport marker in the captured output"** — 8
occurrences, 2026-09-05 → 2026-09-07, costing **≈194 model-minutes**:

| Job | Date | Type | Minutes |
|---|---|---|---|
| j-20260905-02 | 09-05 | machinery | 23.67 |
| j-20260905-17 | 09-06 | interpret | 19.62 |
| j-20260905-20 | 09-06 | interpret | 18.44 |
| j-20260905-23 | 09-06 | verify | 18.21 (transport-marked, retried, failed again) |
| j-20260906-04 | 09-06 | entry | 33.01 |
| j-20260906-13 | 09-06 | post | 22.84 |
| j-20260907-03 | 09-07 | machinery | 40.79 |
| j-20260907-10 | 09-07 | post | 25.43 |

The traced cause is **lock contention, not a defect in the work**:
*"contention → 600s wait → exit 1 → no transport marker → failed."* The test
lock was held 1,100 s then 1,701 s by an implementation stream's `npm test` in a
junctioned worktree; the job waited 600 s twice and died. Closed 2026-09-08 by
`loop/lib/gates.mjs:92`'s `TEST_LOCK_REFUSAL` regex booking it `interrupted`
rather than `failed` — but the underlying serialisation remains.

Related, still live: `j-20260907-22` blocked on the **build** lock;
`j-20260907-18` blocked on a 20-minute `npm test` timeout in
`loop/tests/publish.test.mjs`; `addictedtoai-6s7` (two `next build` processes
share one `.next/`) is why every gate run must be serial.

### B.4 Records-commit pathspec trap

`git add` exits 128 on a single unmatched pathspec and discards the whole run's
records. **09-03: three jobs lost in one afternoon — j-20260903-02, -05, -06 —
each reporting `done`.** Invisible because the call site read none of
`gitTry`'s `{ok,status,stdout,stderr}`. `addictedtoai-tqpq`; ordering cause
`addictedtoai-ps3` (publish ran before the records commit and staged `data/`,
`content/`, `public/` wholesale). Fixed 09-03 (`9c077d1`, `3d7d188`) and
reordered by 09-07, but the log's caveat stands: *"Two nets can hide each
other."*

### B.5 Stale SHA / stale baseline

**09-07, `j-20260907-30`:** a brief named commit `3ca0ad1` as the required
baseline for `data/launch.json`; `addictedtoai-91s` had landed as `c003ce1`
meanwhile. The job restored the older blob and **rolled main backwards,
reverting merged work and publishing it — with green gates and an approving
reviewer who saw the divergence and reasoned it away.** → `addictedtoai-lvba`
(P1, opened 09-08). Generalised in memory as *"A NAMED SHA LOOKS IMMUTABLE AND
IS EXACTLY AS PERISHABLE AS ANY MEASUREMENT."* Guard added 09-07: `eef7a0f
scripts: refuse a change that restores a superseded state`.

### B.6 Worktree and environment fragility

- **Junctions.** `git worktree remove --force` follows the `node_modules`
  junction into its target: **177 packages deleted from the real
  `node_modules`** after a cleanup step's "could not remove junction" was
  ignored. Fixed 09-07 (`1461822` — a junction that will not unlink *refuses*
  the removal).
- **Wrong drive.** `a745d29 (09-02) loop: put job worktrees on the repository's
  drive — the build gate could not pass`.
- **Missing `node_modules`.** `j-20260907-14` blocked: *"required repository
  gates cannot run because node_modules is absent, and npm install is forbidden
  by this job's safety rules."* Fixed 09-07 (`3d06d3a` links the shared install
  before the author run, not only the gates).
- **Removal losing the record.** `23bb610 (09-06) a worktree that will not
  delete no longer costs the run its record` (`addictedtoai-osru`);
  `574bc33`/`59872e5` (09-08) again on startup removal.
- **Branch deletion.** A directive records **107 of 107 merged job branches
  failed to delete (100%)** because `deleteBranch` ran while the worktree still
  had the branch checked out. Sweep filed as `addictedtoai-jl09`.

### B.7 Proposal lifecycle — a channel that fills faster than it drains

- **08-31**: scanning all 15 retired proposals showed the **expiry sweep had
  never fired**, nor the over-cap drop, duplicate discard, or self-amplification
  discard. Only consumption ever had — **twice**. (`addictedtoai-occ0`.) The log
  draws the right lesson: building the guardrail as proposed *"would have
  produced a guardrail that measurably prevents nothing."*
- **Today:** 79 live, 35 consumed (21%), 54 dropped (32%). **51 are past the
  3-day cooling gate and selectable**, against a Desk that takes **one job per
  run**. A 2026-09-03 desk log shows 17 proposals all cooling simultaneously.
- Selection is governed by `expires:`, not priority; `PROPOSAL_COOLING_DAYS=3`
  measured on **file mtime** — a fact that has been misread at least twice.

### B.8 Archived-change path breakage

Archiving predictably moves `openspec/changes/<name>/**` →
`openspec/changes/archive/<date>-<name>/**`, and code keeps pointing at the old
path. Maintainer, 09-06: *"There needs to be an immortalized rule about paths
changing after a change is archived, versions of this have happened a few times
now."* Instances: 08-30 `loop/lib/specs.mjs`; 09-06 `lib/domains.test.mjs` —
**the final six-gate run failed on that one test (1 of 1,479) minutes before the
push**; `CLAUDE.md`'s own Build & Test table still cites the archived
`build-initial-site`. Source test filed as `addictedtoai-2hsy`, landed 09-07
(`a357028`, `b4ea5b5`).

### B.9 Vacuous proofs — checks that cannot fail

Catalogued 2026-09-07, at least eight instances: `addictedtoai-84s8`, `-ckvd`,
`-tdl7`, `-5bgo`, `-3ov0`, `-d1ki`. Measured examples: a sitemap/JSON-LD/date
suite at "31 tests, 31 pass" that stayed green with the production fold
mutated; a test that "passed 14/14, and still passed 14/14 with the production
fold mutated"; a lock suite where "deleting the production call site left it
green 1/1". The memory's own summary: **"THE VACUOUS PROOF IS MOST LIKELY
EXACTLY WHERE YOU ARE BEING MOST CAREFUL."** A sibling class, *name test
standing in for a source test*, has three recorded instances.

### B.10 Brief truncation and review misfires

- **09-07:** four briefs written from `bd show <id> | head -N`; **three carried
  a truncation-caused defect** (`nq36`, `gates/x2jl`, `en3s`) — because
  ACCEPTANCE sits at the bottom of a bead. Cost: *"a full author round plus a
  max-effort review."* Dropped requirements refiled as `addictedtoai-mq8e`.
- **09-07:** a batch review over five changes found **three instances of a class
  that thirteen sealed per-change reviews had all missed** — sealed per-change
  review is structurally blind to cross-change facts.
- **09-06 18:25:** direct edits on main left `verify-launch` red — *recorded 53,
  mismatched 2* — and a mismatched record **cannot reach the derived queue**
  (`addictedtoai-ccky`), so the only route back to green was a hand-written
  directive.

### B.11 Shell-token and approval traps

**Nine-plus `cd`-token violations across three days**, plus two on 08-31 and one
by the orchestrator itself on 09-05. Mechanised as
`scripts/shell-token-guard.mjs` (08-31, `56e4761`), widened to `cmd.exe` and
PowerShell wrappers (`222901c`, `addictedtoai-1ho4`) and given a second
grammar-aware matcher (`5d99bfa`, `addictedtoai-pxj`). Measured armed and firing
on 09-05. Cost before it existed: one agent *"STOPPED ITS ENTIRE TASK … having
done nothing but read its brief. The task was intact, nothing was denied — but
the whole invocation was spent."*

### B.12 Date convention splits

**08-28:** nine agents writing simultaneously **split 104/24** between local and
UTC dates, and both were correct. Ended 08-31 with a repo-wide source check
(`887ea8a`, `scripts/local-dates.test.mjs`) after finding **nine defect sites
across seven files**, seven of them bare inline `toISOString().slice(0,10)`.

---

## C. Every recorded measurement of cost, time and throughput

### C.1 Desk throughput, computed directly from `data/ledger.jsonl` (242 records)

| Day | Jobs | Model-minutes | Outcomes |
|---|---|---|---|
| 08-28 | 1 | 12 | 1 failed |
| 08-29 | 3 | 35 | 1 done, 1 failed, 1 blocked |
| 08-30 | 3 | 54 | 2 done, 1 failed |
| 08-31 | 12 | 314 | 10 done, 1 failed, 1 blocked |
| 09-01 | 18 | 285 | 17 done, 1 failed |
| 09-02 | 20 | 380 | 17 done, 3 failed |
| 09-03 | 25 | 658 | 23 done, 1 discarded, 1 failed |
| 09-04 | **52** | **889** | 51 done, 1 failed |
| 09-05 | 28 | 559 | 27 done, 1 failed |
| 09-06 | 30 | 810 | 24 done, 5 failed, 1 blocked |
| 09-07 | 27 | 686 | 19 done, 4 failed, 3 blocked, 1 capacity |
| 09-08 | 23 | 470 | 17 done, 3 blocked, 2 failed, 1 discarded |
| **Total** | **242** | **5,151 (85.9 h)** | **208 done (86.0%)**, 22 failed (9.1%), 9 blocked (3.7%), 2 discarded, 1 capacity |

**Cost per job type:**

| Type | n | done | Total min | Median | Max |
|---|---|---|---|---|---|
| repair | 141 | 129 (91%) | 2,441 | 14.3 | 55.5 |
| entry | 27 | 22 (81%) | 816 | 30.4 | 55.5 |
| post | 23 | 18 (78%) | 709 | 28.3 | 72.0 |
| interpret | 19 | 16 (84%) | 436 | 21.6 | 40.4 |
| machinery | 13 | 8 (**62%**) | 413 | 27.5 | 72.7 |
| scout | 10 | 9 (90%) | 184 | 19.1 | 23.8 |
| verify | 9 | 6 (67%) | 152 | 18.2 | 29.1 |

`machinery` jobs have the **worst success rate of any type (62%)** and the
longest maximum.

**The review tax, measured:**

| Phase | n | Total min | Median | Mean |
|---|---|---|---|---|
| author | 239 | 3,554 | 12.8 | 14.9 |
| review | 249 | **1,201** | 4.6 | 4.8 |
| revision | 38 | 360 | 8.4 | 9.5 |

**Review costs 34% of author time.** 249 review invocations for 239 authoring
invocations. Distribution: 31 jobs had 0 review phases, 173 had exactly 1, 38
had 2. **16% of jobs needed a revision round; none needed more than one.**

**By runner:**

| Runner | n | Done rate | Minutes |
|---|---|---|---|
| opencode-deepseek | 114 | 93% | 2,287 |
| claude-code-opus | 88 | 86% | 2,037 |
| codex-gpt-luna-medium | 24 | 75% | 480 |
| codex-gpt-luna | 10 | 70% | 241 |
| claude-code-sonnet | 4 | 25% | 48 |
| opencode-muse-spark | 1 | 0% | 29 |
| opencode-zen-muse-spark | 1 | 0% | 29 |

### C.2 Dollar cost

- **`$911 total for 288 Desk-job sessions (185 job ids), median $3.15 per job`**
  — priced from transcripts with zero inference, 2026-09-06,
  `usage/_sweep-report.json`.
- **`workspace_total_cost: $7,341.28` across `workspace_sessions: 343`** —
  read from `C:/Users/BadBitch/.claude/usage/<session>.json`, 2026-09-08
  07:56 local. That is the running API-equivalent total for `d:/addictedtoai`
  since 2026-09-06 only (no earlier session wrote a file), so it is a **floor**.
- The memory is explicit that dollars are informational on a flat subscription:
  *"never treat dollars as a budget input"* — the rate-limit percentage governs.

### C.3 Gate and lock timings

- **Test lock: 600 s wait, twice, in one job.** Lock held **1,100 s** then
  **1,701 s** by another worktree's `npm test`. *"the current cost of contention
  is a 600-second wait and a resumable interruption … 600s of a job's
  wall-clock cap is real."*
- `npm run build` inside `verify-launch`: **exit 0 in 21 s** (`data/launch.json`).
- Full test suite: **267 tests** at launch (08-28) → **328** (08-29) →
  **1,479** (09-06). A 5.5× growth in gate cost in nine days.
- `npm test` timed out at **20 minutes** in `loop/tests/publish.test.mjs`
  (`j-20260907-18`, 09-07).
- Six gates run **serially** and must (`addictedtoai-6s7`).
- Build-lock reclaim observed live in the last Pulse log: a lock from a dead pid
  *"started 844s ago"*.

### C.4 Budgets and caps

- `job_caps_minutes`: **120 minutes for every type except `scout` (60)** — set
  08-28 as *"temporarily, to gather evidence"*, unchanged 11 days later.
- Job **total** bounded at 2× the per-type cap → **240 min worst case**
  (was 480 before `bound-a-jobs-total-spend`).
- Budget bounds: upkeep floor **40%**, new-writing ceiling **45%**, machinery
  ceiling **10%**, over a **30-day** window; ceilings measured against a
  **1,200-minute warm-up denominator**.
- Observed on 09-03: *"budget (cheap tier, rolling 30d): upkeep 65.7%,
  new_writing 34.3%, machinery 0.0%"*.
- `BRIEF_EXCERPT_MAX_CHARS` re-measured twice: **24,000 → 56,000** (09-05,
  `3968a21`) → **88,000** (09-07, `8109f8d`, `addictedtoai-ccs`). A 3.7×
  increase in brief size in two days.
- `PROPOSAL_COOLING_DAYS = 3`, on file mtime. Scout cap: **3 candidates/day**.
- Degradation: 3 shed levels over a 48-hour window.

### C.5 Orchestration and idle time

- **Three hours of Desk idle** on a `HOLD.md` whose cause had already cleared
  (09-01) — caused by a stale sentence in `CLAUDE.md`, not by the fault.
- **Desk chain: 11 runs on 2026-09-03**, 07:38→20:44 (`.pulse-logs/desk-06`
  … `desk-14`, `desk-astra`, `desk-astra-2`) ≈ **one job per 79 minutes**.
- Chain default: **6 runs per invocation**, back-to-back, no sleep.
- Chain escalation bug: the per-log-file test *"never fired once across 18 jobs"*
  on 09-08, costing the scout an entire night's outward sweep.
- Cross-session collision 09-07 17:57:11: a standalone reviewer launched **13
  seconds** before a chained review script fired four reviewers, one onto a
  worktree whose `REVIEW.md` the chain had already deleted.
- `fleet3-review-run.sh` polls **every 20 s** under a **90-minute cap**.
- Pulse cadence: **4×/day** (00/06/12/18), 47 log files, **35 with an exit code:
  31 pass, 4 fail**.
- Rate-limit thresholds: stop new parallel work at **≥80%** of the 5-hour
  window; shed to one stream at **≥95%**; pause at **≥99%**.

### C.6 Corpus and gate scale

- **675 docs** in the corpus (09-07); 684 content files tracked (09-08).
- Census: 09-07 — 23 claims in 14 documents, 21 hedged; 09-08 — 23 claims, 23
  hedged. Hedge series **16 → 15 → 18 → 21 → 23**.
- `verify-launch` review binding: **recorded 53, mismatched 2** (09-06).
- Review-record join, 09-06: **357 review records, 135 bindings across 65 paths,
  of which 7 mismatch**.
- Declined bindings: **48 fact bindings across 29 model entries** point at a
  declined field; removing it breaks 33 transclusions and 12 files.
- **458 body-less entries were outside the review binding entirely** until
  `say-what-a-review-record-covers` (09-07).
- Seed wave, 08-30: **37 of 83 pieces failed review (45%)**.
- Archive audit 09-03: **132 assertions, 0 problems**. Untasked-SHALL audit:
  **6 gaps in 168 occurrences**.
- **107 of 107 merged job branches failed to delete (100%)**.

### C.7 Measurements recorded in beads

- **Discard rate: "1 discard in 82 jobs"** (`d5f6`), the discarded job costing
  **34.61 mm** over one subordinate clause.
- **Carry rate, 5 consecutive jobs: 139.86 mm total, +6 carried findings
  created, −4 retired, 2 outstanding** (`yggm`) — *"Substantive work generates
  them, at about 1–2 per job."* **This is the mechanism behind the maintainer's
  complaint 2: the backlog files issues as fast as it closes them.**
- **Escalation fired ZERO times across 18 jobs** on the night of 2026-09-07;
  the Desk spent **72 model-minutes of one run on a machinery proposal**; ten
  site directives ≈ *"roughly twelve hours of Desk time during which no outward
  sweep can run"* (`bfn0`).
- **Batching saved roughly two thirds of the cost on the cohort** — and
  silently cost review coverage (`zrsg`).
- **Brief budget scales ~13,000 characters per additional in-flight OpenSpec
  change**: 2→23,090; 3→39,085; 4→50,703; 5→63,080. Re-measured three times
  (20,000→24,000→56,000, later 88,000). *"The cost is paid by every job of every
  type on every run, in tokens, forever."* (`2sx8`)
- Unrecorded spend from loop crashes after the runner returned: **20.57 mm**,
  **11.91 mm**, **4.45 mm** (`vd5y`, `qqbi`).
- **A full test suite runs 4–6 minutes**; the default lock wait is **600 s** —
  *"the default wait is shorter than the thing it waits for"* (`3ov0`). The
  chain works around it with `ATAI_TEST_LOCK_WAIT_MS=1,800,000`.
- Machine pressure during the `0xC0000142` window: **commit charge 54.6 GB of
  98.2 GB (56%)**, physical free **5.8 GB of 32 GB**, **37** node/claude/
  opencode/git processes (`x2jl`). One long-lived MCP instance reached **2.4 GB**
  while the machine sat at **18% free RAM** (`h7zt`).
- An orphaned process stayed alive **16+ minutes**, past the merge and past its
  worktree's deletion; the post-merge rebuild then **waited the full 600 s**
  (`qqbi`).
- Review-record binding: **141 of 146 records still `unbound`, only 4
  `recorded`** (`ccky`); **386 review records scanned, 19 evidence citations, 1
  real staging gap** (`dn44`).
- `h0z0` records the resource frame the mission was run under: *"~25% of weekly
  inference remaining before the reset (~6 hours)"* and *"the machinery ceiling
  is at 10.81% on the frontier tier and refuses all five lines"* — **the budget
  ceiling is why the biggest machinery work bypassed the Desk entirely.**

---

## D. How a Desk run is launched and chained today

### D.1 One run

```
node D:/AddictedtoAI/loop/run.mjs [--runner <id>] [--reviewer <id>] [--dry-run]
                                  [--no-gates] [--repo <path>] [--worktree-root <path>]
```

`loop/run.mjs:7` states the design intent: *"THE ENTRY POINT IS AN ORDINARY
COMMAND. Not a harness feature, not a skill, not a slash command."*

**One run does exactly one job.** Resume the oldest resumable `job/*` branch →
else select one candidate → else report nothing qualified. Pipeline:
resume-or-select → assign `j-<yyyymmdd>-<seq>` → commit a self-contained
`.job/brief.md` to `job/<id>` → invoke the runner under a wall-clock cap →
classify from the first line of `RESULT.md` → gates → review → merge → publish
step → one ledger line.

**Selection order** (`loop/lib/select.mjs:70,90`, one candidate per run at
`:233`): `DIRECTIVES.md` (priority 1, file order) → expiring proposals (2) →
`data/derived/queue.json` (3) → other ripe proposals (4).

**Default runner** is `runners.yml:115` `default: claude-code-opus`, but the
maintainer moved the Desk to `codex-gpt-luna` for both roles on 2026-09-07
(*"Continue using luna to run the desk"*) — so the live lane is chosen by
`--runner` at the chain's call site, **not** by the registry default. Seven
runner ids are registered.

### D.2 The chain — and where it lives

**There is no chain script in the repository.** `git ls-files scripts/*`
filtered for `chain|fleet|wave|desk|orchestr` returns nothing. (Such scripts
existed pre-relaunch — `scripts/orchestrate*.sh`, commits `cf343c4`, `5875668`,
`3abfa38` — and were wiped on 08-28.)

The live chain is an **ephemeral scratchpad file belonging to another Claude
session**:

```
C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/
  b0a0272b-5058-41e7-ac66-431922257ff6/scratchpad/desk-chain3.sh
```

Three generations: `desk-chain.sh` (53 lines, hardcoded runner) →
`desk-chain2.sh` (runner/push/reviewer/escalation as arguments) →
`desk-chain3.sh` (153 lines, escalation fixed to per-job-type, 2026-09-08).

```bash
R=D:/AddictedtoAI
LOGDIR="$1"; RUNS="${2:-6}"; RUNNER="${3:-claude-code-opus}"
PUSH="${4:-yes}"; REVIEWER="${5:-}"; ESCALATE="${6:-}"
export ATAI_TEST_LOCK_WAIT_MS="${ATAI_TEST_LOCK_WAIT_MS:-1800000}"
export ATAI_BUILD_LOCK_WAIT_MS="${ATAI_BUILD_LOCK_WAIT_MS:-1800000}"

for i in $(seq 1 "$RUNS"); do
  [ -f "$R/HOLD.md" ] && { echo "CHAIN STOP: HOLD.md stands …"; exit 2; }
  [ -f "$R/STOP" ]    && { echo "CHAIN STOP: STOP stands — the maintainer's alone …"; exit 3; }
  node "$R/loop/run.mjs" --runner "$RUNNER" $REVIEWER_FLAG > "$LOG" 2>&1
  …
```

- **6 runs per invocation by default, back-to-back, no sleep.** Serial is
  enforced, not preferred: every run gates with a build and two builds share one
  `.next/`.
- Stops: `HOLD.md` → exit 2 (checked before each run *and* before each push);
  `STOP` → exit 3; any non-zero run → exit 1 with `tail -20`.
- **Pushes after each successful run**, because the records commit lands after
  the publish step has already pushed (`addictedtoai-ny0n`). Suppressed if
  `HOLD.md` appeared mid-run — added after a merge reached `origin` while
  `HOLD.md` stood on 09-06.
- Wrappers `chain-then-gate{,-f…-m}.sh` and `gate-then-chain.sh` bolt the
  six-gate script (`gates.sh`) onto either end.

**Pause procedure** (`FULL-MEM-LOG.md:598-616`, measured 09-07 07:50): **`TaskStop`
kills neither the chain nor the running `node loop/run.mjs`** — the chain
started its next run the moment the current job exited. The procedure that
works: find the chain's bash pid via `Win32_Process.CommandLine` (**there are
two, parent and per-run subshell — stop the PARENT**), leave the loop pid alone,
wait until *no* `loop/run.mjs` process remains, land the work, restart. *"Never
merge onto main while a job is mid-run with publish true."*

### D.3 Fleet / wave orchestration

**There is no mechanism anywhere that runs two Desk jobs concurrently.** The
Desk is one job per process and the chain is strictly serial.

What does exist is a **parallel-subagent wave mechanism that deliberately
bypasses the Desk**, built on the Workflow tool:

```
C:/Users/BadBitch/.claude/projects/D--AddictedtoAI/
  b0a0272b-5058-41e7-ac66-431922257ff6/workflows/scripts/    (12 scripts)
```

`beads-wave-1-wf_*.js`, `frontier-implementation-wf_*.js`,
`queue-gated-repairs-wf_*.js`, `desk-reliability-fixes-wf_*.js`,
`radar-feeds-wf_*.js`, `spec-drafts-for-spec-bound-beads-wf_*.js`, and six more.

Shape: **file-disjoint streams**, each with its own git worktree under
`D:/addictedtoai-worktrees/` on branch `impl/<key>`, one agent per stream, then
a sealed reviewer per stream with mutation proofs and a fix loop capped at 2
rounds. `queue-gated-repairs` runs one author → **seven sealed reviewers in a
pipeline** → a revise round → a recorder writing `data/reviews/orch-<date>-<nn>.md`.

Every script embeds the CLAUDE.md working rules verbatim, and every one
**forbids touching the Desk**: *"Do not run the Pulse … or the Desk … against
the real repository. Work ONLY inside `${wt}`."*

The branch namespace shows how much work took this route rather than the Desk:
`fl/*` (19 branches), `fleet2/*`, `fleet3/*` (3), `fleet4/*` (4), `fleet5/*` (3),
`impl/*`. Against 224 branches total, of which only ~24 are `job/*`.

The five largest machinery directives (`DIRECTIVES.md` lines 84–92, DESK-ORDER-001
§1/§3/§4/§5) all carry the same marker: ***"implemented directly by orchestrator
subagents in parallel worktrees under the maintainer's 2026-09-06 authorisation,
not by a Desk job."***

### D.4 Schedulers

- **The Pulse is scheduled**: `scripts/run-pulse-scheduled.vbs` (hidden window,
  waits so the task's Last Run Result is the real exit code) → `.cmd`
  (self-locating via `%~dp0..`) → `node pulse/run.mjs`, logging to
  `.pulse-logs/pulse-<stamp>.log`. Cadence 4×/day, confirmed by 47 log files at
  00/06/12/18. *The OS task registration itself is **unverified** — I did not
  query the scheduler.*
- **The Desk is deliberately NOT scheduled.** `STANDING-AUTHORITY.md:158-164`:
  creating a scheduler for the Desk is **not granted** — declined 2026-09-01
  because the maintainer is measuring subscription burn; narrowed 09-07 so that
  *"a chain of N runs STARTED BY HAND on a runner he named is instructed work,
  not a scheduler."*
- **No hook starts either engine.** `C:/Users/BadBitch/.claude/settings.json`
  has exactly three hooks: two gitnexus `PreToolUse`/`PostToolUse`, and a
  `SessionEnd` running `usage-sweep.mjs --hook`.

### D.5 How the orchestrator actually feeds the Desk

`DIRECTIVES.md` is 169 lines / ~132 KB, **56 directives: 45 done, 10 pending,
1 parked**. One directive = one Markdown list item = one physical line, and the
whole brief is that line — the longest pending one is **3,679 characters**, the
longest done one **5,881**.

Although the file's title calls it "the maintainer's work, first in line",
*"written by the orchestrator"* appears **36 times** and *"not the maintainer"*
**29 times**. It is the orchestrator's injection channel. The five named reasons
for using it instead of the queue:

1. `mismatched` review records **cannot reach the derived queue**
   (`addictedtoai-ccky`) — a directive is *"the only input that reaches the Desk"*.
2. Queue starvation by rank — one item blocks everything below it.
3. Rebinding review records (13 mentions).
4. A job that changes nothing writes no review record and **cannot terminate**
   (`addictedtoai-vqbo`).
5. Guardrail-forced batching: *"Three separate jobs would each have
   independently rediscovered the same single cause at roughly three times the
   cost."*

**Batching happens inside a line**, because selection takes one candidate per
run — "in this one job", "batched deliberately".

**The parked section is the tell.** Lines 144–166 are written *without* a
leading `- ` so the parser cannot see them, because a directive outranks the
entire derived queue and **one unrunnable line starves every queue item on every
run**. Measured 09-06: `j-20260906-10` took such a line, ran 5.07 model-minutes,
wrote no `RESULT.md`, ended `interrupted` — **while 26 queue items waited**.
Mechanical fix filed as `addictedtoai-fa8a`; hand-ordering was tried and
recorded as not working (`14b050b` "move the blog backfill below the work that
can actually run" → `0e568c7` "park the backfill, because moving it to the foot
did not work").

Known live defect: a **resumed** directive job merges without marking its line
done, so the line is re-selected
(`data/proposals/a-resumed-job-never-marks-its-directive-done.md`; instance
`j-20260906-17`).

---

## E. Open machinery issues

**101 open issues total** (P0 1, P1 7, P2 54, P3 38, P4 1). **68 of the 101 are
machinery.** Retrieved with `bd list --status open,in_progress,blocked,deferred
--limit 0 --flat --json` (the default cap is 50); corroborated by `bd stats`
(Total 312, Open 101, Closed 211). Every non-closed issue is stored `open`;
the 10 "blocked" are a derived state.

### E.0 ⚑ THE MISSION ALREADY EXISTS — read this before proposing anything

**`addictedtoai-douz` | P1 | epic | "Redesign the Desk/fleet for throughput:
batch, cut overhead, stop backlog churn"** — filed by the maintainer 2026-09-08.
This is the architect's charter, and it is verbatim:

> "Examine the Desk mechanics, the fleet mechanics the coordinator/orchestrator
> sessions use, the machinery history and current issues, and devise a more
> efficient way of running the desk/fleet/machine. Almost certainly an openspec
> change. Collaborate with the three other sessions; have an Opus subagent
> review the change artifacts and the implementation plan before enacting.
>
> Primary complaints to verify, not assume:
> 1. The Desk queue seems very inefficient, probably because jobs are very small
>    and could be batched.
> 2. The beads backlog the fleet works has not moved after dozens of sessions
>    because it files issues as fast as it closes them.
> 3. Daily operation takes an extraordinary amount of time and tokens for very
>    little change.
>
> Constraints and grants: the maintainer prefers stopping the Desk and
> publishing while this is fixed. **No part of the machinery is untouchable.
> This is the moment to build or explicitly not build the front-desk/back-desk
> split.** End goal: streamline daily operation."

Its ACCEPTANCE already requires: measurements of cost/time/delivered change per
job, per day and per session **with provenance** in the change's `proposal.md`;
an OpenSpec change whose design **names what is removed, merged or batched**; an
Opus review before implementation; three peer sessions' positions recorded; and
that the front-desk/back-desk bead is *"either implemented by this change or
closed with a stated reason."*

**No front-desk/back-desk bead exists** — searched all 312 issues for
`front-desk`, `back-desk`, `two-desk`. Whether it exists under other wording is
**unverified**. §C of this report supplies the per-job/per-day measurements
`douz` demands.

### E.1 Restructuring proposals already on file (flag these — do not re-invent)

| Id | P | Proposal | Status |
|---|---|---|---|
| `douz` | P1 | The whole redesign (above) | **Open, the mission** |
| `7z07` | P3 | Maintainer's own design: (A) a mechanical way to authorise overriding Desk selection outside the budgets without wrecking them, (B) **unify the Desk queue with beads** — every job requires a bead id, closure verified mechanically, beads routable through the Desk | **TABLED 2026-09-06** by the maintainer. Draft exists on branch `impl/spec`, change `give-every-job-a-bead-and-let-one-pass-the-bounds`, reviewed twice, 21 of 23 findings applied. *"Do NOT merge while three Frontier changes are unarchived."* |
| `d5f6` | P1 | Make a discarded job's branch **resumable by its successor**, so a refusal costs editing a clause rather than re-authoring a post. Maintainer, 09-03: *"Does it really make sense to throw away an entire post over a single fact?"* | **Open but explicitly TABLED** — *"The maintainer is stewing on this… NOT declined, and not to be built until he says so. Do not treat silence as approval."* |
| `zrsg` | P3 | **Counter-evidence on batching** — batching per subject "saved roughly two thirds of the cost on the cohort. IT ALSO SILENTLY COST REVIEW COVERAGE, until a batch got big enough to trip a gate. The more work a job batched, the more of its own reviewed output the join disowned." Both halves fixed (`64d34da`) | Open as a worked example of *"whack-a-mole fixing one thing that breaks another"* |
| `h7zt` | P3 | Cut per-job overhead: disable MCP servers for print-mode Desk runs (`--strict-mcp-config`) — a job's contract is one prompt in, files out | Open |
| `2sx8` | P2 | Make `BRIEF_EXCERPT_MAX_CHARS` a **function of source count** so the test asserts a property, not a constant | Open |
| `bfn0` | P2 | Add a `--type`/`--only` flag, or an upkeep floor for the scout, or take the scout out of the queue entirely | Open |
| `fa8a` | P2 | Add a selector-evaluable precondition predicate (`after:`/`requires:`) to directives | Open; names its own tension with `specs/loop:1107` |
| `wemx` | P2 | Settle whether proposals *should* rank last — *"it may well be correct"*, but **nothing records a decision that it should be** | Open |
| `sfcw` | P2 | Shed capacity **per lane, not per tier** | Open |
| `ckvd` | P2 | Move real coverage off source guards onto the gates | Open |
| `vqbo` | P1 | Add a terminal outcome for "reviewed and sound, no change needed" | Open |
| `ccky` | P2 | Add a queue producer for mismatched review records | Open (= the open change `let-the-queue-see-a-judgment`) |

### E.2 By theme

**Orchestration / mission** — `h0z0` P0 (the 2026-09-06 mission epic; carries a
7-item RESTORE CHECKLIST; records that the Frontier work was done by orchestrator
subagents *"not by Desk jobs"* because *"the machinery ceiling is at 10.81% on
the frontier tier and refuses all five lines"*) · `douz` P1 · `xrsg` P2 (the
only-list-available-becomes-the-work-list shape) · `7z07` P3 · `ze5b` P3.

**Review gate / records** — `vqbo` P1 (an honest "no edit needed" is booked
`failed`, never marked done, re-selected forever, and **cannot clear the
mismatch it exists to clear**; three such failures trip breaker 1) · `lvba` P1
(the stale-baseline revert that reached the live site) · `d5f6` P1 · `81fm` P2
(an implementer closed its own bead **22 seconds** after committing, unreviewed
and unmerged) · `dn44` P2 (reviewers are told to write evidence to
`data/reviews/evidence/`, but `recordPaths` never includes it, so **evidence is
never committed**) · `ccky` P2 · `p805` P2 (nothing measures whether the
reviewer-noticing channel works at all) · `zrsg` P3.

**Gates / breakers / locks / environment** — `qqbi` P1 (orphaned process trees
outlive their invocation; held worktrees and build locks past merge, caused an
EPERM, a 600 s lock timeout and a **false breaker-2 HOLD.md**) · `x2jl` P2 (every
spawn exited `0xC0000142`; root cause **still open**) · `mq8e` P2 · `3ov0` P2 ·
`mhsf` P2 (build-lock liveness fooled by **pid reuse** — pid recycled by
`opencode.exe serve` 90 s after the lock was written) · `fdsp` P2 · `l010` P2 (a
gate **passed at 12:18 and failed at 20:00 on the same branch with no code
change**) · `5hhm` P2 (breaker 4 fired for a `runners.yml` commit the job never
made — stale merge-base) · `84s8` P2 · `ckvd` P2 · `ucbv` P2 (Pulse fixtures bind
ephemeral loopback ports — **the direct cause of the test lock that now
serialises every run on the machine**) · `8wm0` P2 · `31nk` P2 · `d1ki`, `qkxh`,
`ce90`, `fh7`, `tdl7`, `z03i` P3.

**Publishing / deploy** — `zuoo` P1 (`pulse/lib/publish.mjs:904` runs `git push
origin main` unconditionally and branch-wide; three firings on record) ·
`vqp7.1` P2 (**one stray dirty content file refuses both the Desk's publish and
every scheduled Pulse publish, indefinitely, while the run still reports
`done`** — both call sites discard the return value) · `4w2` P2 · `4vjb`, `en3s`
P3.

**Queue / selection / directives / proposals** — `bfn0` P2 (**any** pending
directive makes the daily scout unreachable — a second independent cause) ·
`fa8a` P2 · `wemx` P2 (`machinery` is reachable **only** by proposal, so the
machinery's own self-improvement is structurally last) · `pfq0` P2 (a
blocked/failed job's own proposal file dies with its branch) · `kat1` P2 (the
tutorial surface has **zero** producers) · `cct` P2 · `yggm` P3.

**Records / ledger / briefs** — `vd5y` P2 · `2sx8` P2 · `9q5` P3.

**Worktrees / harness** — `e0s1` P2 (the junction that emptied the shared
`node_modules`) · `oq5d`, `mpzy`, `h7zt`, `d3mq`, `obcr`, `6m3` P3.

**Runners / conformance / shedding** — `ymbd` P2 (a `startup_failure` pattern
matching bare `401`/`403` anywhere in stderr discarded **two full review
passes**; the `runners.yml` edit is the maintainer's) · `sfcw` P2 · `wl5f` P2
(the OpenCode "Contributor" tier means the vendor trains on the traffic — every
brief, spec excerpt and review finding; the consent is the maintainer's alone).

**Pulse feeds / registry** — `226f` P1 (**48 fact bindings across 29 entries**
point at a declined path; the decision is deliberately not the detector's) ·
`64fk`, `4lrp`, `6nrk`, `eexr`, `rnqa` P2.

**Content-checking scripts** — `0vh` P2 · `3liq`, `gd28`, `tm4a`, `k7d` P3.

---

## F. Tried and abandoned or reverted

| Thing | Why it was dropped |
|---|---|
| Browser user-agent for `pulse/lib/linkcheck.mjs` | Measured **worse**: honest UA → HTTP 200 / 209,783 bytes; Chrome UA → HTTP 400 / 1,542 bytes. *"Impersonation is measurably WORSE at link checking here … it would manufacture broken links."* Zero 400s in 427 URLs after reverting. |
| `process.exit()` on any path that used `fetch` | Dies on `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` with `0xC0000409`, **replacing the real exit code**. Fires 6/6 when the run's only fetch is late and light, 0/6 otherwise. Replaced with `process.exitCode` in `pulse/run.mjs` and, 09-07, `loop/run.mjs` (`addictedtoai-1yt`). |
| `MSYS_NO_PATHCONV=1` for `git show "rev:path"` | *"fixes those reads and breaks everything else."* Replaced by doing git plumbing from a Node script. |
| Hanging a new guardrail on the proposal expiry sweep (`addictedtoai-occ0`) | The sweep **had never fired**. Building it as proposed *"would have produced a guardrail that measurably prevents nothing."* |
| The `brief.includes(path)` scope test (`addictedtoai-vqbo`) | Defeated by a live brief line — `- Do NOT touch \`pulse/lib/queue.mjs\`` — *"THE SENTENCE PROHIBITING A PATH AUTHORISES DECLARING IT."* Authority kept, test abandoned. |
| A behavioural regression test for `addictedtoai-r8k` ("run it and assert nothing was pushed") | *"that deploys the site if the guard regresses. A check whose red path is a live push is the defect, not the detector."* |
| Merging the three local-date helpers into one `lib/` helper | *"pulse/ has ZERO import edges to lib/, so a shared helper in lib/ would be the first, for three lines."* A source check does the work instead. |
| Adding entries to `data/snapshot-census-debt.json` to clear a red census | *"forgiving a whole day's worth switches the check off for the entire corpus."* Standing prohibition. |
| Reverting a reviewed piece to make `verify-launch` green | *"that only moves the red to the build"* — the route is an `entry: re-review` directive. |
| `bd show <id> \| head -N` for writing briefs | Structurally truncates ACCEPTANCE, which sits at the bottom. 3 of 4 briefs defective (09-07). |
| Hand-ordering `DIRECTIVES.md` to unstarve the queue | Tried 09-05, parked 09-06: *"the ordering that matters is directives-before-queue, not the order within the file."* |
| Making a defeated source guard's regex cleverer | *"that is an arms race it cannot win."* |
| Batching a cohort into one job (first attempt) | `64d34da (09-02) Batching a cohort into one job broke review binding and the 320px reflow` — redone properly as per-subject batching on 09-03. |
| WebFetch for pricing or any decisive figure | *"fabricates in both directions."* Parse raw JSON, confirm by literal substring. |
| Reusing the peer session's `fleet2-run.sh` / `fleet3-review-run.sh` | That session's Bash had no coreutils — *"`codex`, `cat` and `ls` all exited 127."* |
| Editing a running shell script in place | Bash reads incrementally by byte offset. *"SNAPSHOT AND REPLACE … or kill it first."* |
| Memory `snapshot-census-daily-red` | **Retired 09-07** as falsified — it predicted a red build every morning and the prediction became false. |
| Bead `addictedtoai-4k2a` (missing openspec skills) | Closed as **filed in error**; the maintainer had moved them deliberately to cut context. |
| Blog: five posts + the count machinery governing them | `bde5a6e (08-30) blog: delete the five posts and the count machinery that governed them`. Voice lint made **advisory** rather than fatal. |
| Commit `05b7e65` as the loop-state fix | *"was rebased away and is not an ancestor of main"*; the real fix is `94e747d`. |

**Verified negative — things nobody has proposed.** I had the archive and all
three open changes grepped for `parallel|concurren|simultaneous|worktree`: **20
hits across 11 files, none proposing parallelism, lanes, or concurrent jobs.**
The founding change explicitly *excludes* it: *"the build itself may use any
harness features available now (Claude Code subagents, parallel agents, a Max
account); **the product must not inherit those dependencies**."* A grep for
`skip (the )?review|second review pass|without a review|bypass the review`
returned **no proposal that reduces or removes a review pass**. The only change
that reduces review count does it as a side effect of batching.

---

## G. The biggest structural sources of waste

My own reading of the evidence above, most costly first. **G0 first: the
redesign has already been commissioned as `addictedtoai-douz` (P1), with an
acceptance contract naming exactly the measurements §C supplies, and with the
maintainer's explicit grant that "no part of the machinery is untouchable."
Two adjacent designs are TABLED, not declined — `7z07` (unify the Desk queue
with beads; a reviewed draft already exists on branch `impl/spec`) and `d5f6`
(make a discarded job resumable). Neither may be built until he says so, and
silence is not approval. An architect who proposes either without reading them
will be re-deriving reviewed work.**

**G1. The machine is eating the site — the exact failure the relaunch was
meant to escape.** Process code + specs outweigh site content **≈3:1** in
insertions (91,131 + 41,538 vs 43,947); machinery LOC grew **3.49× in 11 days**
(23,941 → 83,477) while 47% of machinery files are now tests. Two-thirds of
archived changes (16 of 24) are machinery. The founding proposal names the
predecessor's cause of death as *"roughly seven lines of process for every line
of site"* — the trend line is heading back there. There is even a pre-relaunch
audit branch named `loop/audit/machinery-crowds-out-visitor-value` (2026-08-25).
*Evidence: §0, §A.1.*

**G2. The unit of work is one job, and everything expensive is per-job.**
242 jobs consumed 5,151 model-minutes; the *median repair* is 14.3 minutes of
author time but carries a full brief assembly, a worktree, six serial gates, a
sealed review invocation, a merge and a publish. Review alone is **1,201
minutes — 34% of author time — across 249 invocations**. The batching change
(`batch-carried-findings-by-subject`) proved the saving is real (**27 jobs → 16
for the same backlog**, "and by more than that ratio in model-minutes") but was
deliberately scoped to *one producer* and *not* to the selector. Nothing has
generalised it. *Evidence: §C.1, §A.1 09-03.*

**G2b. Work generates work at close to a 1:1 rate — the backlog is a treadmill,
and this is measurable, not anecdotal.** The maintainer's complaint 2 is
confirmed: `addictedtoai-yggm` measured **5 consecutive jobs, 139.86 mm, +6
carried findings created against −4 retired** — *"substantive work generates
them, at about 1–2 per job."* Beads stands at **312 issues, 211 closed, 101
open** after 11 days, and 68 of the 101 open ones are machinery — the machine is
mostly filing issues about itself. Two compounding structural causes: `wemx`
(P2) finds that `machinery` work is reachable **only** by proposal, so it is
structurally last and *"nothing records a decision that it should be"*; and
`h0z0` (P0) records that the **10% machinery budget ceiling refused all five**
of the biggest machinery lines, which is why they were done by orchestrator
subagents outside the Desk. The Desk is thus starved of exactly the work that
would make the Desk cheaper. *Evidence: §C.7, §E.2.*

**G3. The gates are a shared, serial, machine-wide bottleneck that fails
jobs for environmental reasons.** Six gates must run serially because two
`next build` processes share one `.next/` (`addictedtoai-6s7`). The test suite
grew **267 → 1,479 tests in nine days**. Lock contention cost **8 jobs and
≈194 model-minutes** in three days, with locks held 1,100 s and 1,701 s and
jobs waiting 600 s twice before dying. The 09-08 fix reclassifies the symptom
(`failed` → `interrupted`) without removing the serialisation. Every parallel
worktree makes this worse, and the wave mechanism (§D.3) creates exactly that
contention. *Evidence: §B.3, §C.3.*

**G4. Correctness checks are coupled to the wall clock, so the machine breaks
itself on a schedule.** The snapshot-census check fails builds that were
correct when written — **4 of 4 Pulse failures, 3 of them at 00:00**. The check
*cannot warn the author*, because on the day of authoring the claim is
compliant. The hedge count has climbed to 23, past its own stated
leaning-on-it-as-a-default threshold of 15, and the fix
(`bind-what-the-catalog-knows`, `addictedtoai-6nrk`) sits at **0 of 25 tasks**.
This is the single clearest case of a guardrail whose running cost exceeds what
it prevents. *Evidence: §B.1.*

**G5. Publishing is a global flag standing in for a scoped push.**
`pulse/lib/publish.mjs` pushes `origin main` **branch-wide and
unconditionally**, so any run's push carries every other session's local
commits: **5 of one session's 7 commits reached origin via other sessions'
publish steps**. The compensating control is a boolean toggled by hand
**~14 times in 11 days**, and two of the worst incidents (08-29, 08-30) were
scripts that published without their names suggesting they could.
`addictedtoai-zuoo` is P1 and open. *Evidence: §B.2.*

**G6. The queue is not the work source, and the real one has no back-pressure.**
The derived queue holds **1 item**. Actual work arrives via `DIRECTIVES.md` (a
132 KB hand-maintained file whose lines are up to 5,881 characters) and a
proposal pool of **79 live / 35 consumed / 54 dropped** — only **21% of
proposals ever become work**, with 51 currently ripe against a one-job-per-run
Desk. Directives outrank everything, so **one unrunnable line starves the whole
queue** — measured 09-06: 5.07 minutes burned, no result, **26 queue items
waiting**. The mitigation is a "parked" section that hides lines from the parser
by removing their bullet. *Evidence: §B.7, §D.5.*

**G7. Orchestration lives outside the repository and outside the Desk.**
The chain that actually runs the Desk is `desk-chain3.sh` in **another Claude
session's temp scratchpad**; the wave mechanism is 12 Workflow scripts in a
session-scoped directory; both vanish with their sessions. Consequently the five
largest machinery directives were *"implemented directly by orchestrator
subagents in parallel worktrees … not by a Desk job"* — the Desk was bypassed
for the work that mattered most. `HOLD.md` and `STOP` are gitignored, so **the
halt record has no durable history at all**. Meanwhile `TaskStop` does not stop
the chain, and the documented pause procedure requires finding two bash pids by
`Win32_Process.CommandLine`. *Evidence: §D.2, §D.3, §A.4.*

**G8. Sealed per-change review is structurally blind, and the compensations are
manual.** A batch review over five changes found **three instances of a class
that thirteen sealed per-change reviews had all missed**. A reviewer approved a
change that **rolled main backwards and published the revert** because the brief
named a stale SHA (`addictedtoai-lvba`, P1). At least **eight vacuous proofs**
were catalogued in one day — tests that pass with the production code mutated.
And 3 of 4 briefs written the same afternoon were defective because
`bd show | head -N` truncates ACCEPTANCE. Review is 34% of author cost and is
demonstrably not catching the classes that matter most. *Evidence: §B.5, §B.9,
§B.10.*

**G9. Specification throughput exceeds implementation throughput.** 24 changes
archived in 11 days, and the three open ones carry **78 tasks with zero
started** — two of which are the structural fixes for G4 and G6. `openspec/`
absorbed **+41,538 insertions**, comparable to all site content. The
constitution has twice needed its own catch-up changes
(`catch-the-constitution-up-to-the-code`,
`write-the-constitution-in-timeless-voice`) purely to describe code that had
already shipped. *Evidence: §A.1, §A.2, §0.*

**G10. Environment fragility is a first-class cost.** **107 of 107 merged job
branches failed to delete (100%)**; a worktree junction deleted **177 packages**
from the real `node_modules`; worktrees were on the wrong drive until 09-02;
jobs blocked because `node_modules` was absent and `npm install` is forbidden.
Six separate commits across 09-06/07/08 harden worktree removal alone. Each of
these is cheap individually and they never stop arriving. *Evidence: §B.6.*

---

## Caveats

- `HOLD.md` and `STOP` are gitignored, so §A.4 is reconstructed from
  `FULL-MEM-LOG.md`, one Pulse log line and the ledger — **not** from a halt
  history, which does not exist.
- Whether the Windows scheduled task for the Pulse is registered, and at what
  times, is **unverified**: I did not query the OS scheduler. The 4×/day cadence
  is inferred from 47 log filenames.
- Whether session `b0a0272b-…` and its chain are still live is **unverified**;
  I did not inspect running processes.
- `workspace_total_cost` ($7,341.28) covers only sessions since 2026-09-06 and
  omits `claude --print` runs that render no status line, so it is a floor.
- Ledger `mm` figures are model-minutes as recorded by the loop; I did not
  independently verify them against transcripts.
- No front-desk/back-desk bead exists under the spellings `front-desk`,
  `back-desk` or `two-desk` across all 312 issues. Whether one exists under
  other wording is **unverified** — `addictedtoai-douz` requires it be "either
  implemented by this change or closed with a stated reason", so it may be
  notional rather than filed.
- The beads survey read full descriptions and leading notes, not the complete
  385,435 characters of notes across the 101 open issues.
- `data/config.json` changed under me mid-session (see §0); other live state may
  have moved similarly. Re-read before acting.
- The three open OpenSpec changes' task counts (0/25, 0/29, 0/24) are exact
  `- [ ]` / `- [x]` scans, but a task can be done in the tree without its box
  being ticked; I did not verify implementation state against the code.
