# Two desks, work orders, and a release train

## In one page

**The ceiling, and nobody chose it.** The Desk cannot exceed about two jobs an
hour. `npm test` holds a machine-wide lock, so a second worker waits for the first
whatever capacity is spare. Batching K jobs behind one gate pass while running W
workers multiplies. The one-session rule was a person standing in for a lock.

**Six structural changes.** **Two desks** — content and machinery stop competing
for one queue. **Work orders** — a job carries several coherent items. **The
train** — the full gate set runs once per batch. **Parallel workers** — W ordinary
Desk runs, each with a ledger line. **Intake** — routing and fact-checking become
a mechanism, not an orchestrator's reading. **`DIRECTIVES.md` retires into
beads** — one backlog, not two files saying the same thing.

**What was measured.** Jobs too small to batch: **confirmed** — median job, 1 file
and 4 lines against 5.5 minutes of fixed overhead. Backlog files as fast as it
closes: **confirmed over the span, refuted in shape**. Extraordinary tokens:
**refuted** — 96% of codex input is cached.

**What ships first, and why in that order.** Stage 0 this session: the brief diet,
the gate reuse, the runner ladder, the ledger fields. **The train waits for a later
session because it rewrites the publish path** — where a mistake is public rather
than local — and it had two defects in it an hour ago. Sequencing, not scope.

**Decided 2026-09-08** — you agreed with all seven (answers at the end): the
front/back reading; bounds as config dials; the fleet retiring at Stage 3; the
machinery ceiling raised to 30 **for the drain**, with a limit after it on the back
desk's share instead; the three open changes first; the filing rule narrowed; and
the reading of "reviewed before going live".

**Evidence.** `evidence/` — reports, scripts, three sealed reviews.

---

Serves `addictedtoai-douz` (P1, the maintainer's 2026-09-08 charter). He wrote
*"verify this!"* and *"come to your own conclusions"*, so each complaint below
carries a verdict, not a confirmation.

**The acceptance object, named.** `douz` requires the front-desk/back-desk item to
be *"either implemented by this change or closed with a stated reason."* No
dedicated bead exists for it — searched across all 312 issues for `front-desk`,
`back-desk` and `two-desk` (`evidence/beads-report.md` §F). It exists as one
comment on epic **`addictedtoai-h0z0`**, 2026-09-07: *"the back-desk idea the
maintainer is musing on (front-desk = content jobs; back-desk = machinery, spec
changes, beads)."* **This change implements it**, as routing and accounting —
every candidate and every ledger line carries a desk, the idle rule holds, inflow
is reported per desk — and not as two machines. Open question 1 asks him to
confirm the reading, because it rests on one comment.

**Provenance.** Every number below cites `evidence/<file>` or
`evidence/scripts/<script>` in this change directory, or a bead id. The evidence
was copied out of session-scoped temporary directories so it outlives the sessions
that produced it; `evidence/README.md` lists each file, who produced it, and how
each script is invoked. At review time the local-day, gate and token figures were
not reachable from the reports as cited, which a sealed reviewer correctly called
unreproducible; that gap is what the directory closes.

## The one property that is reserved, and the reading used

The maintainer, 2026-09-08, on `addictedtoai-vqbo`: *"as long as work is getting
reviewed before going live, I am good."* Restated: **nothing publishes that a
real reviewer has not actually read.**

**The reading this change applies, stated rather than assumed:** the sentence
governs **model-written bytes and reviewed machinery**. Two things are exempt, and
both are exempt in the live specification already — deterministic outputs of
already-reviewed machinery (`openspec/specs/review/spec.md:26-30`, which names the
Pulse's feed refreshes, derived tables and the derived queue), and the review's
own records, since a review cannot read the record of itself. Everything else the
train publishes is moved *before* the train review rather than after it. **Open
question 7 asks the maintainer to confirm or widen that reading**, because it is
his sentence and this change should not narrow it silently.

Four mechanisms deliver the property today and all four are kept: the review gate
(the reviewer's tree is discarded; the merge refuses without an `approve`), review
records bound to bytes, the brakes (`STOP`, `HOLD.md`, reserved paths; a job never
clears its own halt or edits its own budget), and fail-the-build-don't-warn.

**One place the change strengthens it, and the strengthening is the strongest
single argument here.** `scripts/verify-launch.mjs:611` and `:769` carry the
review-state binding check that distinguishes an unreviewed piece (`missing`) from
a reviewed-then-changed one (`mismatched`). **That check has never run inside the
Desk on any job**: `loop/lib/gates.mjs:346` is
`['test','build','verify-surfaces','verify-design']`, and `loop/run.mjs` has
exactly two gate call sites, `:419` (that set) and `:1750-1755` (`build` alone). Putting
`verify-launch` on the train puts the reserved property's own detector into the
automated path for the first time.

## Complaint 1 — "jobs are very small and could be batched". **CONFIRMED**, and it survives scrutiny best of the three.

The median merged job changes **1 content file and 4 content lines**, costs
**$3.20**, and takes **24.3 minutes** of wall-clock for **18.4 model-minutes**;
52.9% (110/208) of merged jobs touch exactly one content file
(`evidence/ledger-report.md` §B, §C, §F). Against that, the fixed cost per job is
**5.5 minutes median non-model overhead, 25.9% of wall-clock since 2026-09-01**
(`evidence/desk-mech-report.md` §A), and review runs **2.6–3.2× implementation** on
19- and 98-line changes (`addictedtoai-f4vy`). Orch's ledger-gap ratio of **1.45×**
bounds the same quantity from above and is **a ceiling, not a measurement**, on
Orch's own statement (`evidence/rerun-efficiency.txt`,
`evidence/scripts/orch-efficiency.mjs`).

**The gate arithmetic, corrected.** A job today runs **four** gates and pays for
**two** builds, not six and three: `DEFAULT_GATES` is
`['test','build','verify-surfaces','verify-design']` and the second build is the
post-merge one at `run.mjs:1750-1755`. The **442.5s six-gate total** measured on `main`
at `78c6361` with publishing off — `npm test` 314.8s, `verify-launch` 39.6s (of
which its own build is 39s: `verify-launch.mjs:832` starts the timer before the
build spawn and `:847` reports that span), `verify-design` 35.7s, `npm run build`
29.2s, `verify-analytics` 19.5s excluding server start, `verify-surfaces` 3.7s
(`evidence/gate-timings-final.txt`, the combined table; the two partial files it
supersedes are still in `evidence/`) — is the **push-bar** cost, not the job cost, and is
labelled so. Per job today: 314.8 + 29.2 + 3.7 + 35.7 + 29.2 ≈ **412.6s**. Per job
after: ≈ **32.9s**. Per train: ≈ **403s** with the launch-build reuse. At five
merges, **2,063s → 568s**. Reusing `verify-launch`'s build saves ~39s per *train*
and per hand-run push gate — real, and a tenth of what an earlier draft claimed
per job.

**The suite is already parallel, and its cost is the Desk's own.** Parsed:
**1,709 tests, 1,709 pass, 0 fail, 298,091 ms, 122 files**
(`evidence/gate-timings-final.txt`). Summed per-test time is 1,380s against 298s
wall — a factor of ~4.6 — so wall time is bounded by the longest chain of files;
median test 4.4 ms; the top 25 tests carry 31% of summed time. The **twelve
slowest** (49.5s down to 13.5s) are all Desk-machinery integration tests standing
up real builds, real git and bare origins in temp directories. So the gate being
moved is dominated by tests **of the machinery being redesigned**, and **the suite
may get slower before it gets faster** while they are rewritten. One test states
the shape: the slowest, 49.5s — *"CONTROL: a GREEN post-merge build DOES reach the
remote"*, the control arm for `addictedtoai-ml25` — was added on 2026-09-08
without its cost being measured.

**The redirect.** `batch-carried-findings-by-subject` (2026-09-03) cut **27 jobs to
16 for the same backlog** and was scoped to one Pulse producer, never to the
selector (`evidence/hist-report.md` §A.1, §G2). Generalising it to the selector is
the change.

## Complaint 2 — "the backlog has not moved because it files as fast as it closes". **CONFIRMED over the span, PARTLY REFUTED in shape.**

By local day (`evidence/scripts/orch-beads-flow-local.mjs`, which supersedes every
UTC-bucketed table sent earlier — including `evidence/beads-report.md`'s and
`evidence/rerun-beads-utc-superseded.txt`): **313 filed / 212 closed, net +101** as
at 2026-09-08; the last seven local days **99 filed against 69 closed, ratio
1.43**. So it did not stand still — it rose. But the series is **not monotonic**:
09-01 was net −11 and 09-06 net −13, both real drain days. And **47 of the 101 open
issues come from the opening stretch 08-29..08-31**, every one of which has now
been checked line by line against the tree: of the 48-bead opening cohort, **42
still valid, 5 partial, 1 already fixed** — 47 of the 48 still open at the check (`evidence/stale-report.md` for 08-31,
`evidence/stale2-report.md` for 08-29 and 08-30). So the standing number is an
**undigested opening cohort plus a drip that exceeds the drain** — and there is no
triage dividend waiting in it. Ten of those beads already carry same-day
directives in `DIRECTIVES.md:116-141`, none run: the same work stated twice in two
files, which is its own argument for the migration.

Two caveats travel with every total. Closures are dated by `updated_at` because
the dump has no reliable `closed_at`, so the **trend is more trustworthy than any
single cell**. And the backlog moved while it was being measured: open read **100
at 13:56 UTC and 101 ninety minutes later**, which is why each point-in-time total
carries the moment it was taken.

**What the open set actually is**
(`evidence/scripts/orch-backlog-classify.mjs`, 2026-09-08, 101 open): **52 name a
code path only, 18 a content path only, 15 both, 16 neither.** The floor of work
that must pass the review gate is **33**; machinery is about **52**. An earlier
draft quoted "81 of 100 machinery" and "~81 edit-shaped" as though they were
different facts; they shared 63 issues and neither is the number. The script's own
header says what it does not do: it reports the overlap between two keyword
classifications honestly rather than inventing a better classifier, so the
argument rests on a number that is defined.

The drip is measurable: churn runs **0.3–0.6 new beads per bead closed**
(`evidence/beads-report.md` §D), and **~68%** of issues cite a review finding, a
Desk job or the file-the-deferral rule as their occasion (§B). Inside the Desk,
carried findings were **37 filed against 35 retired in three days, 76% onto a file
already carried**, with 23 jobs on 2026-09-02 publishing nothing
(`select.mjs:30-44`).

## Complaint 3 — "extraordinary time and tokens for very little change". **CONFIRMED in wall-clock and model-minutes; PARTLY REFUTED on tokens.**

Interactive orchestrator sessions are **85.6% ($6,325)** of $7,385.50 of workspace
spend as at 2026-09-08 ~08:00 local; Desk jobs are **14.3% ($1,057)**, and that is
a **floor** — 40 of 240 job ids named in commits were never priced, and the sweep
figure is *consistent with* rather than *independent of* the ledger join
(`evidence/spend-report.md` §C, §D). Over 15 days **`content/` is 4.15% of all
changed lines**; `data/` 34.8%; "other" **44.8%**, dominated by `.job/brief.md`
and `.job/source.json` — **187,820 lines written to job branches and stripped
again**. Last 7 days: Desk $934 for 42 new content files, **$22.23 per file**.

Tokens are the half that does not hold as stated. Across the 48 codex sessions that had started before 08:00 local on 2026-09-08,
the lane read **182,873,547 tokens against 688,798 of output**; across all 67
sessions at capture — **as at about 10:00 local, a partial day** — it read
**238,067,103 against 828,209, a 286:1 input-to-output ratio with 96.8% of input
cached** (`evidence/codex-spend-2026-09-08.json`, captured by
`evidence/scripts/codex-spend-capture.mjs`; method also on `addictedtoai-f4vy`).
An earlier reading of 182.4M / 685K was taken while three sessions were still
running and was therefore a running total, not a final one; the fixture is what
replaces it, and A2AI-Luna-Boss-2 corrected its own number to produce it. The dose is far smaller than the headline, so **token count
is the wrong thing to batch for.** The win is wall-clock, gate passes and reviewer
orientation — which argues for the train and for coherence-batched review, not for
token-motivated batching — **plus the brief diet, which is the one place tokens
really are the cost**: the author brief grew **16,181 → 103,881 characters in
eleven days**, ~85% spec excerpt, re-sent whole on every revision (38 jobs),
because `BRIEF_EXCERPT_MAX_CHARS` was raised four times as unarchived changes
split the per-source budget (`addictedtoai-2sx8`) and `excerptsFor`'s pass 2b
saturates whatever is left (`evidence/desk-mech-report.md` §B, §F).

## Why this is not the fourth unstarted change

Twenty-four changes were archived in eleven days while the three open ones carry
**78 tasks with zero started as at 2026-09-08** (`evidence/hist-report.md` §A.2,
§G9; a task can be done in the tree without its box ticked, which that count did
not verify), and process code plus specs outweigh site content **≈3:1** in
insertions with machinery LOC up **3.49× in eleven days** — the predecessor site's
recorded cause of death. **Stage 0 is therefore the whole of what ships first**,
and it contains no new module, no new branch, nothing on the merge or publish
path, and every item is a local edit to an existing file with a test and a named
mutation. The train — the largest new mechanism in the change — is Stage 1 and
ships separately. An earlier draft called that combination "four items, no new
module"; it was not, and the staging below is the correction.

## What changes

- **Work orders.** A job carries 1..N items sharing a **coherence key**, bounded
  by `N_max`, `S_max`, `B_total` and `B_per_subject`. The subject list is
  **structured, loop-authored and committed** in `.job/source.json` at selection.
  The merge's subject set is constituted from that declaration and **checked**
  against the diff in both directions — no diff path outside it, and no item
  retired without a measured diff on its own subjects.
- **A release train.** Per job: build the **merged tip** plus `verify-surfaces`.
  Merges land `--no-ff` on `train`, subject-disjoint; `main` advances only by
  fast-forward after the full gate set, one rederive, and a sealed train review
  over the whole diff including that rederived data. Publishing is per train and
  pushes a **verified SHA**, not a branch.
- **A ratification channel, named as the deliberate loosening it is.** A work
  order may end `reviewed:` — the declared pages were read, judged sound and
  correctly left unchanged — which is what makes `addictedtoai-vqbo` terminable.
  Its precondition is that each declared page **already reads mismatched at the
  merge base**, which means a non-Desk actor changed a published page. That
  removes, in bounded form, the practical constraint that only the Desk may edit a
  published page. Its two bounds: the per-subject byte bound applied to the
  reviewed surfaces, and a `would-cite` entry per piece. The reviewer is handed
  each page's bytes with no diff fence and a gates section that disclaims evidence
  about the pages, so a real reviewer really does read them.
- **One intake, two desks.** Beads is the one backlog. A model-free **router**
  classifies each candidate **on its declared metadata, never on its title**; a
  model-free **verifier** checks every checkable claim against the tree; a
  **bundler** emits work orders. An idle front desk runs the scout or nothing.
- **A declared runner policy, as an effort ladder.** `codex` accepts four
  reasoning efforts — `medium`, `high`, `xhigh`, `max` — and the registry has
  carried only the two ends, so every choice was a jump between them. Effort
  becomes a **rung declared in `runners.yml`**: routine upkeep starts at `medium`,
  authoring and machinery and spec-touching work start at `high`, all review and
  every revision start at `xhigh`, and a rung is raised only when the ledger's
  first-pass revise rate for that type and rung says the one below is not holding.
  Starting everything non-routine at `max` spends the ceiling before anything has
  measured the rung beneath it. Escalation moves into the repository and keys on
  the **top-ranked** candidate. `runners.yml` stays the only file naming a model or
  an effort.
- **A diet and an inflow bound.** Pass 2b of `excerptsFor` goes, the excerpt
  ceiling comes down to a measured value, a revision brief carries the excerpts for
  the headings the verdict **structurally cited**, carried findings must name a
  subject and are counted on the ledger, and a deferral becomes its own bead only
  when it names a subject path or a spec requirement.
- **Retirements.** `DIRECTIVES.md` after migration; the never-fired proposal
  expiry sweep and duplicate-slug discard; the hand-driven fleet; the second
  per-job build.

## What does not change

The review gate, bytes-bound review records, the four breakers, reserved paths,
`STOP`/`HOLD.md` semantics, fail-the-build-don't-warn, the executor contract,
`runners.yml` as the single swap point, the Pulse's derive step (model-free,
byte-identical on unchanged state), and the ledger-before-rederive ordering. No
budget bound moves: upkeep floor 40%, new-writing ceiling 45%, machinery ceiling
10%.

**The train's publish guarantee is enforced for the machine and procedural for a
human.** After this change the only in-repository push is the train's, scoped to a
verified SHA. It does not and cannot prevent the maintainer from running
`git push` himself — that is his own publishing act under his existing grant,
after the gates — nor an old script outside the repository from doing so. An old
script is retired by deleting it, and the fleet's launcher is kept in
`evidence/scripts/fleet-worker-retired.ps1` as the record of what was retired.
Stating the limit is the point: a guarantee that quietly covered a path it cannot
reach would be the kind of claim this repository's review exists to catch.

**The serial rule is lifted, and by whom.** The maintainer, 2026-09-08, via
A2AI-Orch: *"It really was meant to prevent collisions and machinery lock issues,
you can disregard it moving forward."* Its purpose — two runs colliding on the
shared build surface — is now served by `scripts/build-lock.mjs`, the test lock,
and their measured refusal path: since 2026-09-08 contention books `interrupted`
rather than `failed` (`gates.mjs:92`'s `TEST_LOCK_REFUSAL`), which is resumable
and consumes no breaker step. A discipline held by a person, replaced by a
mechanism, and the person freed from remembering it — which is the change's thesis
in miniature.

**"Disregard it" is not "no control", so here is what bounds concurrency now, and
which of it was checked rather than assumed.** Four controls, **one re-derived and
three checked**. The **build and test locks** hold the shared build surface. The
**train's merge lock** stops two workers landing on the integration branch at
once. **Worktrees** isolate the filesystem, with the junction hazard recorded.
The **selection and ledger locks** stop two workers minting one job id or
interleaving appends to one ledger file.

Two of those were not enough, and A2AI-Luna-Boss-2 found both by re-deriving them
rather than trusting them. **Breaker 1 was broken under concurrency** —
`budget.mjs:673-683` walks the ledger backwards and stops at the first `done`, so
it is a function of append order: four `repair` workers where the first, second
and fourth fail and the third finishes in between read `fail, fail, done, fail`
and count **one**. Three of four failed and nothing halts, and it degrades in the
wrong direction, becoming less likely to trip as more concurrent work fails. It is
replaced by a count over the last N completed jobs of that type. And **nothing at
all covered two workers spending the same budget**: ceilings are read at selection
from the ledger, and a ledger line is written when a job *ends*, so W workers
selecting in one window each see the same headroom and each spend it. A selected
job now writes a **reservation** the budget gate reads alongside the ledger. Shed
levels and wall-clock caps were checked and stand unchanged.

**One exclusion is reversed, and named.** The founding change excluded parallelism
from the operating phase — *"the build itself may use any harness features
available now … the product must not inherit those dependencies."* A front-desk
worker is an ordinary `node loop/run.mjs` invocation in its own git worktree, so
no harness dependency is inherited; what is reversed is the exclusion. The choice
is not between parallel and serial. The fleet **already** runs parallel worktrees
outside the Desk with no model-minute cap, no consecutive-failure breaker, no
capacity shed, no ledger line and no review record — and the five largest
machinery lines went that way because the 10% machinery ceiling refused all five
(`addictedtoai-h0z0`). Of 225 branches at 2026-09-08 (204 local, 21 remote),
`job/*` is 38 and the fleet family is 32; the largest category is `loop/*` at 121.
The evidence that this is fragile rather than merely undocumented: **the fleet ran
all day 2026-09-08 from a shell script inside the temporary directory of a session
(`A2AI-luna-boss`) that had already ended at 06:36 that morning.** The choice is
between parallel with a ledger and parallel without one.

## Staging

**The baseline is taken, and taking it moved the definition.** Measured over 206
of the 208 merged jobs (`evidence/stage0-baseline.md`,
`evidence/scripts/stage0-baseline.mjs`): brief-commit → merge wall-clock median
**22.81 min**, of which **3.85 min** is non-model overhead. The old
brief-commit → **records-commit** definition gives **5.497 min**, reproducing
`evidence/desk-mech-report.md`'s 5.5 almost exactly — which validates the method,
and also disqualifies that definition going forward, since the records commit
moves to the train. One empirical reason it was the wrong anchor all along:
**41 of those 206 jobs have no records commit anywhere in history**, their records
apparently riding the next Pulse commit, filed as `addictedtoai-l7cx`.

- **Stage 0 — no new module, nothing on the merge or publish path.**
  `verify-launch` build reuse; the gate floor check; the brief diet including
  lowering the excerpt ceiling; the conformance correction; the runner policy and
  its escalation; the ledger fields (`brief_chars`, `gate_seconds`, runner and
  effort per phase, carried-entry counts); the filing lint as a standalone script;
  measuring `bd` before anything mocks it. **This stage takes the before/after
  baseline** — while brief-commit → records-commit still means what it meant when
  the 5.5-minute figure was measured, which is what keeps the comparison honest
  once the records commit moves to the train.
- **Stage 1 — the train alone, at one worker.** Integration branch, merged-tip
  tripwire, red path, train review, scoped publish, breaker rewiring. One worker is
  the whole mechanism minus the concurrency, and it is the honest place to discover
  what a red train costs.
- **Stage 2 — work orders**, with the `reviewed:` outcome and per-subject
  `would-cite`.
- **Stage 3 — intake, the two desks, more than one worker**, the retirements, and
  the selection and ledger locks parallelism requires.

Each stage's measurement, and the rule that decides whether the next one starts,
is stated in `tasks.md` before the work rather than after it.

## Positions of the three peer sessions — dissents and concessions

- **A2AI-Orch** measured the gate table, the parsed suite, the local-day beads
  flow, the runner-quality table and the backlog classification. Its dissents: **its
  own 1.45× is a ceiling, not a measurement**, and it said so before anyone quoted
  it; **the economics of intake were backwards** — intake is expensive precisely
  because it is judgment, so mechanise the routing and keep the work-order *author*
  human-grade; a byte total says nothing about distribution, hence `B_per_subject`;
  `would-cite` per subject; a red train needs a classification step before any
  revert; and escalation must key on the top-ranked candidate or it silently skips
  the work it was meant to reach.
- **A2AI-Luna-Boss-2** measured review at 2.6–3.2× implementation, the codex
  token figures, the portability test's token scan, and traced the subject-set
  defect to its root. Its dissents: **leave-one-out, not "drop the newest merge"**
  — `addictedtoai-84s8` shows the defect can sit in an earlier merge; **bytes *and*
  distinct subjects**; and a train review needs bounds of its own or it becomes the
  unbounded reader the per-job bounds exist to prevent. Its **concession against
  its own role**: a mechanised verifier would do the checkable-claim half of intake
  *better* than a human-grade coordinator, and the evidence is its own miss,
  `addictedtoai-4i2`. Its earlier claim that all 19 mixed-path beads were machinery
  beads rested on a title regex and is **withdrawn**; routing now keys on declared
  metadata, and the 15 beads naming both a code and a content path are triaged once
  at migration by a person.
- **A2AI-mem-cond** maintains the memory corpus quoted throughout. Its positions:
  **the deferral rule makes inflow a function of throughput**, so any throughput
  gain multiplies filing unless the rule is bounded; **do not cut a review round**;
  the two Desk dollar figures are **consistent, not independent**; and the
  calibration ratios are what make the transcript sweep a floor rather than an
  estimate. It also established that the filing rule is the maintainer's own, in
  his words, which is why amending it is a question for him and not a task here.

## Answered by the maintainer, 2026-09-08

He read the seven and replied: *"I agree with all your recommendations."* One
carried a question of its own, and its answer is below with the reasoning, because
the answer is a decision about what happens after the drain rather than during it.

1. **The front/back reading is confirmed.** Front desk = content jobs; back desk =
   machinery, spec changes and beads. The split is built as routing and accounting.
2. **The work-order and train bounds are configuration dials**, tuned by the
   orchestrator between runs from the ledger — not budget bounds needing an
   OpenSpec change each time. `data/config.json` stays reserved; no job may edit
   them.
3. **The fleet retires at Stage 3**, when the front-desk workers that replace it
   exist. The machine is Luna-first from Stage 0.
4. **Raise the machinery ceiling now, while the cohort drains.** His question was
   the right one — *"Is this until the new back desk is built? We wouldn't want a
   limit after it is built right?"* — and the answer is that **a limit stays, on a
   different quantity.** Today's 10% caps the Desk's *share of its own ledger*, and
   that does not reduce machinery work: it relocates it into sessions the ledger
   cannot see. Once the back desk exists the ledger sees both desks, so the bound
   becomes **the back desk's share of total effort**, set from the measured drain,
   with the filing rule bounding what enters the backlog. A back desk with no limit
   is the predecessor's failure mode exactly — process expanding to fill the
   capacity available to it, the 3:1 process-to-content ratio this repository's own
   history records, and a pre-relaunch audit branch named
   `loop/audit/machinery-crowds-out-visitor-value`.
   **The cost of the raise, stated plainly:** the three bounds share one
   denominator, so machinery at 30 plus the upkeep floor at 40 leaves **at most 30
   points for new writing** against a ceiling of 45. The raise can take up to
   twenty points from site work — the thing complaint 1 was about — and that is
   accepted **for the drain period only**. It carries a revert condition anyone can
   check: the ceiling is 30 while any of `bind-what-the-catalog-knows`,
   `let-the-queue-see-a-judgment` or `keep-the-map-describing-the-territory`
   remains unarchived, and returns to 10 the day the last is archived unless the
   per-desk share has replaced it by then. That is the orchestrator's between runs;
   it cannot be a code check, because nothing under `lib/`, `loop/` or `scripts/`
   may reference a change directory.
5. **The back desk finishes the three open changes first.** They are its scope
   until they are done.
6. **The filing rule is narrowed as proposed.** Task 18 is **unheld** and done at
   `bd84b4b`: `CLAUDE.md` and `AGENTS.md` carry the narrowed rule in his words with
   the measured cause.
7. **The reading of "reviewed before going live" is confirmed** — model-written
   bytes and reviewed machinery, with deterministic derived data and the review's
   own records exempt, as `openspec/specs/review/spec.md:26-30` already exempts
   them.

## Stage 1 — rulings at briefing time, 2026-09-10

Before the first Stage-1 brief was written, the implementing session's plan set
(`D:/addictedtoai-coord/stage1-plan-*.md`) raised nineteen gap questions
(Q-S1–Q-S19) against the Stage-1 tasks. The architect ruled on all nineteen from
the committed design and deltas; the rulings are written INTO the task rows
they govern (each marked `RULED`, `CLARIFIED`, `CORRECTED` or `REWORDED
2026-09-10 (Q-Sn)`) so a worker briefed from a task cannot miss them, and the
extractor reports that quote the governing passages are archived beside the
Stage-1 evidence. Recorded here, per the rule that a correction to an issue's
claims goes in the proposal and not a commit message:

- **One task was WRONG, not merely unclear.** Task 47 said the Pulse's commit
  lands on `train`. Design round NEW-4 reversed that and the pulse delta carries
  the SHALL that a run keep committing to `main`; the task would have
  reinstated the reversed mechanism in the file the delta forbids. Reworded to
  the bullet that replaced it (the train merges `main` in before gating and
  re-merges on a non-descendant refusal), in `loop/lib/train.mjs`.
- **Two tasks contradicted the delta's wording** and the delta wins: task 33's
  "under the merge lock" (the provisional build is unlocked; the lock is taken
  once at the merge); task 38's "admits nothing further" (up to the configured
  size, and waiting workers are told).
- **Seven were specification gaps the tasks now close**: the `TRAIN_GATES`
  order (32); the config keys and their starting values, the manifest's writer
  and the lock-wait budget (35); the counted-set helper, the records
  allow-list, the re-gate's lock and the train's own ledger line (36); the
  fixture policy (37); the Stage-1 upkeep channel and the deferred bead reopen
  (38); the automatic solo replay (40); "unchanged" and where the count lives
  (43); the equal-SHA arm (48); breaker 2's two triggers in one sentence (49).
- **One was a discipline standing in for a mechanism**: nothing enforced one
  worker. Task 35b adds the slot lock and the `workers` key.
- **The heading-to-task table was off by one for every Stage-1 row** and the
  numbering had not moved since it was written; the rows are re-derived from
  the tasks' own `Implements`/`Tests` lines and the rule is now stated. Rows
  for tasks 53 and above were not re-derived; a script that derives the table
  is the durable fix.
- **Two rulings the maintainer may overturn in one line**, made on his behalf
  because both concern brakes and limits he set: breaker 2's Stage-1 trip
  condition (task 49) and the one-worker mechanism (task 35b). Neither blocks
  U1.
- **What Stage 1 does not build, and says so**: no tracker call before task 69
  (upkeep goes through a proposal; the reopen is deferred); the
  tracker-unreachable clause of task 49 is a classification arm only.

The implementing session's sequencing unit U5 was drafted around the stale task
47 ("Pulse onto train") and must be re-cut from the reworded task before it is
briefed. Q-S1 blocks U5, not U1; Q-S2, Q-S15 and Q-S19 were the ones in front of
U1, and all three are ruled.
