# Design

Every number here cites `evidence/<file>` or `evidence/scripts/<script>` in this
change directory, a bead id, or a named file:line in the tree.
`evidence/README.md` says who produced each artifact and how each script is run.
Where the architect's decision record was silent, the decision is made here and
marked **DRAFTER'S DECISION**. Where a decision was kept that this drafter
believes is wrong or unmechanisable, it is kept and a **DRAFTER'S OBJECTION**
block says why.

---

## D1 — Work orders replace one-item jobs

**Mechanism.** A job's unit becomes a **work order**: 1..N items sharing a
**coherence key** = `budget category` + `subject path or surface` + `source
cohort`. Coherence, not count. Same-category only, so `categoryOf`
(`config.mjs:355`) and `invocationAllowance` (`budget.mjs:158`) keep one cap and
one category per job; the **governing type** is what `checklistFor`
(`review.mjs:381`), `proposalCapFor` (`proposals.mjs:77`), the ledger `type` and
breaker 1 (`run.mjs:2082`) all read.

**The subject set is constituted from the declaration and checked against the
diff — and that single sentence is the fix for two defects that looked like
two.** Today `run.mjs:1577-1583` builds `subjects` by measuring the branch diff
(`joinableSubjects(changedPathsWithStatus(...))`). Constituting it that way has
two consequences that arrive together:

- when the diff is empty by construction — the `reviewed:` outcome —
  `joinableSubjects([])` returns `[]`, `writeRecordSubjects` refuses at
  `review.mjs:1284`, and `run.mjs:1594` logs the refusal only under
  `else if (subjects.length)`, so **nothing is written and nothing is said**. The
  record joins to no piece, the declared pages stay mismatched, and the launch
  check stays red — which is the state the outcome exists to clear;
- when the diff is a *subset* — four items declared, one file changed — the
  subset test passes and **all four items retire on one done**.

So: the merge takes its subject set from `.job/source.json`'s committed
`declared_subjects` (on `reviewed:`, from the executor's declared paths
intersected with it), and uses the measured diff only to **check** that set in
both directions — no diff path outside the declaration, and no item retired
without a measured diff on its own subjects or a `reviewed:` declaration covering
them. Independently, the empty-set refusal at `:1594` is made unconditional, so an
empty set logs and refuses instead of passing in silence. The trace to the single
root is A2AI-Luna-Boss-2's.

`.job/source.json` is the right home: it already exists, is committed at
selection before any executor runs (`run.mjs:1329-1351`), already carries
`issues: []`, and is not the author's to write. Its own comment already makes the
argument — *"a mechanism that had to parse the prose of a brief to find a file
path would be guessing."*

Records need almost nothing: `writeRecordSubjects` (`review.mjs:1283`) already
renders `subject:` as a scalar for one and a list for many, and `reviewed:` as a
path→hash map; `mergeGate` already enforces set equality (`:1086-1104`), which is
orthogonal to the new subset rule and survives untouched. What changes is
`would-cite`: **per prose piece**, reusing `reads-human-from`'s entry shape and
`existingFieldValues`'s existing per-entry walk (`review.mjs:784`, `:798-799`), so
the duplicate check and the same-record exemption fall out for free.

**Invariant preserved.** One job still ends in exactly one merge or one discard,
and every merged path is still bound to a record by a measurement of the tree.

**Failure mode designed against, and the evidence.** `addictedtoai-zrsg`:
*"Batching per subject file silently cost review coverage until a cohort grew
large enough to trip a gate — the more work a job batched, the more of its own
reviewed output the join disowned."* Before that, the first batching attempt was
reverted outright: `64d34da` (2026-09-02) *"Batching a cohort into one job broke
review binding and the 320px reflow"*, redone as per-subject batching the next day
(`evidence/hist-report.md` §F). Those two are the precedents the per-subject
`would-cite` and the subject and byte bounds exist to answer.

**Alternative rejected.** The tabled `addictedtoai-7z07` draft's rule that every
job is the work of **exactly one bead**. A work order is N:M by construction, and
the draft's own reviewer flagged that `resolveBead()`, `closeBead(id)`,
`verifyClosed(id, jobId)` and its `bead-unclosed` gate all hard-code singularity
(`evidence/draft-report.md` §G). Its Part B *plumbing* is reused; its cardinality
is not.

> **DRAFTER'S OBJECTION (D1).** The bounds and per-subject `would-cite` answer
> `zrsg` **by construction**, not by measurement. Nothing measures reviewer
> attention per subject; the closest proxy is the train review's count of findings
> in no per-job record. A proxy is not the property. The Stage-2 measurement task
> therefore carries the decision rule in advance: **if that proxy rises with `N`
> over the first twenty work orders, `N_max` is too high and is lowered before any
> other tuning.**

---

## D2 — A release train replaces the per-job full gate set

**What the gates actually are today, because an earlier draft had this wrong.**
`DEFAULT_GATES` (`gates.mjs:346`) is
`['test','build','verify-surfaces','verify-design']`, asserted exactly by
`job-gate-set.test.mjs:74`, and `run.mjs` has two gate call sites: `:404` (that
set) and `:1661` (`build` alone). So a merged job runs **four** gates and pays for
**two** builds. `verify-launch` and `verify-analytics` are in no job's path at all
— `gates.mjs:293-296` says why, deliberately. The corrected arithmetic:

| | today | after |
|---|---|---|
| per job | 314.8 + 29.2 + 3.7 + 35.7 + 29.2 ≈ **412.6s** | ≈ **32.9s** |
| per train | — | ≈ **403s** with launch-build reuse |
| five merges | **2,063s** | **568s** |

The 442.5s six-gate total (`evidence/gate-timings-final.txt`) is the **push-bar** cost
and is labelled so wherever it appears. Reusing `verify-launch`'s own build saves
~39s per **train** and per hand-run push gate, not per job.

**And the strengthening, which is the strongest argument in the change.**
`verify-launch.mjs:611` and `:769` carry the review-state binding check —
`missing` versus `mismatched`. It has **never run inside the Desk**. Putting the
full set on the train puts the reserved property's own detector into the automated
path for the first time.

**Per job.** Build plus `verify-surfaces` — and **the build is of the merged
tip**, under the merge lock, not of the branch. This is deliberate and it replaces
a guardrail the first draft deleted without naming: today's post-merge build is
what catches two changes green apart and red together. Building the merged tip
keeps that caught **per merge at one build per job**; a red merged tip is reverted
at once with no search, because the merge that made the tip is the merge that made
the red.

**Per train.** The full six, once, then the rederive, then the review, then the
records commit, then the publish.

**Why `npm test` is the item that matters.** It is **314.8s of 442.5s, 70.7%**,
*and* it holds the machine-wide test lock. Moving it to the train is what makes
parallel workers possible, not merely what makes a job cheaper. Historically that
lock cost **8 jobs and ≈194 model-minutes in three days**, with the lock held
1,100s then 1,701s against a 600s wait (`evidence/hist-report.md` §B.3, §C.3).
**Dated honestly:** since the 2026-09-08 reclassification (`gates.mjs:92`'s
`TEST_LOCK_REFUSAL`) contention books `interrupted`, which is resumable and
consumes no breaker step, so the forward cost is 600s of wall-clock per
contention rather than a lost job. The case for moving the suite therefore rests
on wall-clock and on parallelism, not on that historical loss.

**What the suite is.** 1,709 tests, 0 fail, 298,091 ms, 122 files
(`evidence/gate-timings-final.txt`). Already parallel: summed per-test time 1,380s
against 298s wall, ~4.6×, so wall time is bounded by the longest chain of files
and shaving total work buys nothing unless it shortens that chain. Median test
4.4 ms; top 25 carry 31% of summed time. The twelve slowest, 49.5s down to 13.5s,
are all Desk-machinery integration tests standing up real builds, real git and
bare origins in temp directories. **So the gate being moved is dominated by tests
of the machinery being redesigned**: the tasks budget for rewriting them, and the
proposal says the suite may get slower before it gets faster. A cheap candidate
exists and is **flagged, not recommended**: sharing fixtures or splitting the
heaviest files to shorten the longest chain — unmeasured, and it touches the tests
that guard merge and publish, where a shared fixture is how a suite acquires
coupling it cannot see.

**Publishing.** Per train, and the push is of a **verified SHA**. The caller
declares the commit its gates ran over and the step pushes `<sha>:main`, refusing
only when that SHA is not a descendant of the remote tip. The alternative — refuse
whenever the branch carries any commit outside a declared *set* — **deadlocks
permanently** the first time a Pulse commit interleaves with a train: the Pulse's
commit is outside the train's set and the train's commits are outside the Pulse's,
neither may widen its declaration, and the only escapes are to widen one or flip
the flag, which is the "loosen the guardrail to get past it" this repository
forbids. Pushing a SHA cannot push a commit the gates did not see, needs no
at-push re-comparison because the remote enforces the fast-forward atomically, and
composes with the Pulse committing to `train`: after that, `main` has exactly one
writer.

**Both callers, not one.** `pulse/run.mjs` and the train each pass the SHA their
own gates ran over. An earlier draft changed only `pulse/lib/publish.mjs`, leaving
no caller that constructed the scope — which is the whole of `addictedtoai-zuoo`
left open under a requirement that claimed to close it.

**Alternative rejected.** Keeping all gates per job and raising the lock waits,
which is what the chain does today (`ATAI_TEST_LOCK_WAIT_MS=1,800,000`). It treats
the symptom and cannot make two `next build` processes share one `.next/`
(`addictedtoai-6s7`).

## The train's red path, as a decision table

The first act on red is never a revert. It is one re-run of the failing gate on
the pre-train `main` commit.

| Trigger | Search | Outcome |
|---|---|---|
| Gate red; re-run on pre-train `main` **red** | none | `pre-existing`: **train HELD**, reported every run, one upkeep item filed once. No search, no eviction, no `HOLD.md`, no publish. The merge lock admits nothing further onto that train, so accumulation is bounded. |
| Gate red; re-run **green** | **leave-one-out over the whole train** | revert the merge whose removal clears it (`-m 1`), ledger `evicted-at-train`, beads reopened with the gate output; re-run the train's **gates and review**. Still red → whole-train rejection. |
| Gate red; re-run green; **no single removal clears it** | leave-one-out exhausted | reject the whole train: every merge reverted, every bead reopened, nothing published. A genuine two-merge interaction. |
| **Train review non-approval** | findings name merges | evict the named merges (`evicted-at-train`, reason `review`), re-run gates **and review**; a finding naming no merge rejects the whole train. **The publish never runs on a train whose review did not approve the diff being published.** |

**Leave-one-out, not a bisect, and the difference is the whole point.** A bisect
over a train's merges is a **prefix** search: with the defect latent in M2 and
surfacing at M5, M1–M4 are each green and M5 is red, so first-bad is **M5** — the
same answer "revert the newest" gives, and the innocent merge. That is exactly
`addictedtoai-84s8`'s shape, which is the shape the search was added for.
Leave-one-out reverts each merge in turn from the complete set and isolates the
one whose removal clears the red. It identifies the **surfacing** merge, not
necessarily the causing one, and the requirement says so: the property required is
that the train goes green and the finding travels with the work, not that blame is
correct.

**Priced, because nothing in an earlier draft was.** Leave-one-out over K = 5
running `npm test` is 5 × 314.8s ≈ **26 minutes of gate time per red train**, on
top of the retry. Two further costs: the classification re-run must build the
pre-train commit, which reintroduces a build inside the red path; and
`verify-analytics`/`verify-design` bind a port (`gates.mjs:321-324` already records
port collision as a gate failure unrelated to the diff), so the re-run and the
train cannot overlap.

**The retry, made explicit.** A job's tripwire retries its two gates. **A train
retries the failing gate, not the set** — re-running all six after `npm test` fails
costs 442s of which 315s is the gate that failed. The classification re-run on the
pre-train commit is a **measurement**, not a retry, and consumes neither.

**Time-dependent predicates.** A train records the local date it began under, and
any classification re-run or search that would cross a change in that date is
refused and the red classified `pre-existing`. Several checks here compare a
stated date against the current one, so the same tree is green before midnight and
red after; a search whose predicate moves underneath it isolates whichever merge
it happened to test last.

**The canonical `pre-existing` case, dated.** The snapshot-census class: all four
recorded Pulse build failures are that class and three of the four are the 00:00
run, because the local date rolls over and the 06:00 Pulse then advances the
snapshot date on pages nobody edited (`evidence/hist-report.md` §B.1). It is a
**class**, not a daily event: the hedge count read 21 of 23 claims hedged on
2026-09-07 and 23 of 23 on 2026-09-08, at which point it was settled as ageing.
The structural fix is `bind-what-the-catalog-knows`, at 0 of 25 tasks — which is
why open question 5 is less optional than it reads.

> **DRAFTER'S OBJECTION (D2).** "The world moved" over-claims. The re-run
> establishes only that `main` was already red, which is equally consistent with
> an earlier merge already on `main` having done it. The outcome is therefore
> named **`pre-existing`**, and "the world moved" is recorded as its usual cause.
> Naming it for a cause the check cannot measure would put a claim in a guardrail
> that the guardrail cannot check.

> **DRAFTER'S OBJECTION (D2b), new this round.** The train review now has three
> obligations that compound: it runs **after** the rederive (so its diff includes
> regenerated data), it re-runs after **every** eviction, and it is bounded by
> `B_train`/`S_train`. A train that evicts twice therefore pays **three**
> maximum-effort reviews over overlapping diffs, and nothing in this change prices
> that. The per-train gate arithmetic above counts gate seconds only. If the
> measured eviction rate is anything but rare, the review cost of a red train will
> dominate its gate cost, and the honest response is a smaller `K` rather than a
> weaker re-review — a subset of a reviewed diff genuinely is not reviewed.

---

## D3 — Beads are the one backlog; intake routes and bundles for both desks

**Plumbing, reused from the tabled draft and now built on measurement rather than
on the draft's assumptions.** `loop/lib/beads.mjs` as the single `bd` **invocation**
choke point, `--sandbox` on every call, a static import-boundary test asserting
nothing under `lib/` or the prebuild imports it or spawns `bd`; the loop mints,
claims and closes and a job never touches its own bead; `routedBeadDefects()`
shared by the selector and any filing helper. Every call site **set-valued**.

`evidence/bd-measurements.md` (task 26, done) settled six things the design had
been asserting, and two of them change a mechanism. **A second `--claim` by
another actor fails with exit 1**, so the claim is genuine mutual exclusion and
the loop needs no second mechanism to keep two runs off one issue. **Re-closing a
closed issue is a silent exit-0 no-op that discards the new reason**, so closure
cannot be verified by exit code and the tabled draft's read-back rule is now
measured rather than prudent; `reopen` clears `close_reason`, so the reason a later
reader finds is not necessarily any particular job's. The rest is plumbing detail
that stops an implementer guessing: `show --json` wraps in an array; comment bodies
need `--include-comments` and are **absent from `list --json`**, which is why the
`h0z0` comment that this whole front/back split rests on was invisible to every
earlier scan; metadata round-trips as JSON objects and `--set-metadata` merges;
200 ids in one argv worked, so the argv ceiling flagged in the Windows notes needs
no design around it; `--json` stdout is clean.

**And one safety finding nobody went looking for, which adds a clause.**
Initialising a store with an explicit `--db` path, from a process whose working
directory sat inside this repository, **auto-detected the repository's real remote
and cloned the project's Dolt history into a second store under the user profile**.
The stray store was deleted and nothing under `.beads/` was touched. The choke
point therefore **pins the working directory of every invocation to the store it
addresses and refuses before spawning when it is not** — a tool that infers what it
is addressing from where it was started will eventually address the wrong thing,
and the cheapest place to stop that is before it runs. The **format** half of the
requirement already exists in `loop/lib/issues.mjs:1-56`, which already states the
format/existence split and the Vercel reason; the new module adds the
**invocation** choke point beside it and does not define a second id format.

**The router**, model-free. Per candidate: desk; create- or edit-shaped; subject
paths; each subject's review state; blocked/deferred/claimed; runner clearance;
budget category; coherence key. **It keys on declared metadata — a candidate's own
declared subjects and desk — and never on its title or prose.** An earlier draft
rested a routing default on the claim that all 19 beads naming both a content and
a machinery path were machinery beads citing content as evidence; that claim came
from a title regex and is **withdrawn**. A regular expression over a sentence
written for a human is the same reasoning this change refuses where it decides
which paths a job may touch. The 15 beads that name both are triaged **once**, by
a person, at migration; while one waits, the recorded default is the back desk and
the default's basis is recorded rather than asserted.

**The verifier**, model-free: path exists, quoted string occurs, cited line still
reads as claimed. Each failure gets a **stable identifier**, is noted on the
candidate, and is carried into the brief by that identifier. The worked example is
`addictedtoai-4i2` — the string "ChatGPT" occurs nowhere in `content/learn/`, and
a bead asserting it did would have sent an author to fix nothing.

**And the answer is structured, not merely requested.** The executor's result file
carries a `rederived:` block with one entry per failed-claim identifier its brief
carried: the identifier, one of `confirmed-stale` / `still-true` / `corrected`,
and a sentence of evidence. `result.mjs` parses it and **the merge refuses a work
order whose brief carried failed claims and whose result file lacks an entry for
any of them**. That is what turns "the author is asked to re-derive" from an
instruction into a gate; what it still cannot do is judge whether the answer is
right, which is the reviewer's, and D3a below says exactly where the line falls.

**The bundler** groups affordable candidates by coherence key within the bounds,
**splits** an over-bound set into more work orders rather than truncating it, and
refuses at selection an item that alone exceeds the per-subject bound — with the
refusal recorded where refusals are recorded, so a bound cannot silently become
the work list.

**Sources.** Routed beads primary; `DIRECTIVES.md` retires after migration;
proposals stay the job's **output** channel — a job filing its own bead is the
conflict of interest the tabled draft correctly refused — but intake converts each
live proposal into a bead, so the proposal directory is transient rather than a
78-deep FIFO. The derived queue **stays authoritative** and is mirrored into beads
by a step outside the derivation, and **the condition wins** on disagreement.

**Why machinery beads become directly reachable.** `machinery` work is reachable
today **only by proposal**, structurally last in `select.mjs:66-105`, and
`addictedtoai-wemx` records that nothing states a decision that it should be. The
consequence is measured: the 10% ceiling refused all five of the largest machinery
lines, so they were done by orchestrator subagents outside the Desk
(`addictedtoai-h0z0`).

**Availability.** `bd` unreachable is a **refusal, not a halt**: select nothing,
exit with the refusal status, no `HOLD.md`, and the derived queue still computes.

**The chain and the workers, with the constraints verified against the tree.**

0. **The serial rule is lifted, and its scope is settled.** The maintainer,
   2026-09-08, via A2AI-Orch: *"It really was meant to prevent collisions and
   machinery lock issues, you can disregard it moving forward."* It was a person
   standing in for a lock, in a lane that had no other control — the unbudgeted,
   hand-driven fleet, with no budget, no breaker, no shed and no ledger line, where
   one-at-a-time was the only bound available. A mechanised worker is a different
   actor whose concurrency is bounded by mechanisms rather than by a count someone
   has to remember. **But he lifted it on the understanding that machinery had
   replaced it, and for four of the six controls it had not.** The rest of this
   section is what makes that understanding true before the change relies on it.

### The controls, re-derived rather than inherited

A2AI-Luna-Boss-2's diagnostic, which is the whole test and is worth quoting
because it predicts every result below: **"A control that counts within a window
survives concurrency. A control that depends on order, or that reads-then-acts,
does not."** Six controls, verified in code by A2AI-Orch.

| # | Control | Verdict |
|---|---|---|
| 1 | Breaker 1 — `consecutiveFailures` (`budget.mjs:673-683`) | **BROKEN.** Walks the ledger backwards, stops at the first `done`. Fixed by a window. |
| 2 | Budget ceilings, read at selection | **BROKEN.** Reads-then-acts: the ledger records a job when it *ends*. Fixed by the reservation. |
| 3 | Runner health — `noOutputStreak` (`health.mjs:202-214`) | **BROKEN.** Walks backwards and breaks on the first invocation that produced something, so one healthy invocation between two dead ones resets it and a broken runner is never refused while other workers on it succeed. Fixed by a window. |
| 4 | Lane pause — `lanePause` (`budget.mjs:591-607`) | **BROKEN, and the worst of the four.** It reads only the provider's single most recent line: `const last = lane[lane.length - 1]; if (last.outcome !== 'capacity') return …`. A rate limit hits every worker on a lane **at once**, so one worker records `capacity` and another finishing a second later makes the newest line something else — the pause never engages. Under three workers that is the *normal* shape of a 429, not a tail case. Fixed by asking whether any `capacity` falls inside the backoff window, which is strictly simpler than what is there. |
| 5 | Shed levels — `shedState` (`budget.mjs:625-639`) | **SOUND.** Already a trailing-window count, order-independent. It inherits the read-at-selection lag, which is inherent to it and no worse under W. |
| 6 | The ledger (append-only under the ledger lock) and the build/test locks | **SOUND.** Real mutual exclusion. |

Four broken, two sound — and every one of the four is an order-dependent or
read-then-act control, exactly as the diagnostic predicts. **The worker count
therefore starts at 1**, and the Stage-3 experiment raises it to 3 only after
controls 1, 3, 4 and the reservation pass. That condition is in the requirement
text, not only here, because the count is a config key and raising it needs no
code change.
1. **A worker is a `loop/run.mjs` invocation in its own worktree** — not a port of
   the fleet's script. It thereby inherits the budget, the breakers, the ledger
   line, the review gate and the records, every one of which the fleet lacks.
2. **Four locks, and two of them are new.** The existing build and test locks; a
   **selection lock** over "read the ledger → mint the id → create the branch →
   commit `.job/`" as one critical section, because `nextJobId`
   (`ledger.mjs:173`) derives the id from the ledger plus existing branch names
   and two workers in one window mint the **same id**; and a **ledger lock** over
   every append (`run.mjs:977`, `:1048`, `:1429`), including the paths that never
   reach a merge. **One ledger file.** Per-run line-files that something later
   concatenates were considered and rejected: the budget, the breakers and
   `scoutRanToday` all derive from the ledger, so unconcatenated lines are
   invisible to exactly the mechanisms that bound `W` workers. Both new locks
   carry more than a process id, because pid liveness is defeated by pid reuse
   inside the staleness window (`build-lock.mjs:116-117`). Per-job files under
   `data/carried/`, `data/proposals/` and `data/reviews/` collide only if job ids
   collide, which the selection lock prevents.
   Concurrency is **never** keyed on a path: the fleet's guard matches
   `*\fleet*`, which permits or refuses everything once every worktree is a Desk
   worktree. Its `-OutsideLoop` exemption does not survive; a one-off is a routed
   bead, which has a ledger line.
3. **Model, effort and harness come only from `runners.yml`**, through
   `loop/lib/runners.mjs`. `loop/tests/portability.test.mjs:85` scans every token
   under `loop/` and `data/config.json` for those names and has already forced
   rewordings in `loop/run.mjs` and `records-commit.test.mjs:152-153`. No absolute
   harness paths, no model names, not even in comments — written as a scenario.

**`HOLD.md` now does three jobs, and all three must be kept together.** It is
breaker 1's halt; it is *also* the publish gate, because `pulse/lib/publish.mjs`
suspends publication while the file exists — `run.mjs:1682-1690` records why, and
records that the obvious tidy-up (suppressing it for an environmental failure)
would silently remove the publish gate along with the halt. Under more than one
worker it acquires a third: bounding what is in flight. A halt stops **selection
and publishing**, not work already running, so up to `W − 1` merges may still land
on the integration branch afterwards — and none of them publish, because the halt
stops the train *and* the publish step independently refuses while the file
stands. The reserved property survives a halt by two mechanisms meeting, not one,
and anyone changing either has to know the other is there.

**Alternative rejected.** Beads as the source of *truth*. The derived queue is a
pure function of committed state, byte-identical every run and reproducible from a
fresh clone; beads is mutable Dolt state outside git that the tool itself calls
"not the source of truth". Making it the truth would mean the repository no longer
describes the system's state and every Dolt hiccup is a Desk outage.

> **DRAFTER'S OBJECTION (D3a) — raised, sustained, and now largely answered.**
> The original objection was that the verifier's rule — *"a bead with a failed
> claim is routed as needs-rederivation, and the author's first outcome is to
> re-derive"* — was half a mechanism: routing is mechanical, and the author
> actually re-deriving was an instruction checked by a checklist and nothing else,
> which by this repository's own standard is documentation rather than a
> guardrail. The sealed Luna reviewer reached the same conclusion independently
> (its MAJOR 5) and asked for structured re-derivation evidence the merge gate
> verifies. **That is now adopted**, overturning the earlier disposition to keep
> the wording as it stood.
>
> The split, stated exactly, because the honest part of the objection survives:
> **mechanised** — every failed claim carries a stable identifier, the brief
> carries the list, the executor's result file must carry a `rederived:` entry per
> identifier with one of three states (`confirmed-stale`, `still-true`,
> `corrected`) and a sentence of evidence, and **the merge refuses when any
> identifier has no entry**. An author cannot skip the question, and a work order
> that leaves one unanswered cannot reach the integration branch.
> **Not mechanised** — whether the answer is *true*. A `still-true` written
> carelessly passes the gate exactly as a fresh-but-vacuous `would-cite` does. The
> reviewer's checklist puts each entry beside the claim it answers, and that is
> the whole of the check on content.
>
> What remains of the objection is therefore narrow and worth keeping in view: the
> gate now compels the asking, in a closed vocabulary, with evidence attached, and
> it still cannot compel a correct answer. That is the same bargain this
> specification already strikes with `would-cite`, and it is a materially stronger
> position than the instruction it replaces.

> **DRAFTER'S OBJECTION (D3b).** The idle-front-desk rule makes the back desk
> *slower*. Today an idle front desk falls through to a machinery proposal — 72
> model-minutes went to one on 2026-09-07. After this change it runs the scout or
> nothing, with the 10% ceiling unchanged and roughly 52 of 101 open beads naming
> a code path. The rule is kept because it is the maintainer's split and because a
> lane that fills with machinery is how the site stopped being written. The
> arithmetic does not close, which is why open question 4 now carries a
> **recommendation** with named commits rather than handing him the sum to redo:
> the ceiling does not reduce machinery work, it relocates it to sessions the
> ledger cannot see.

---

## D4 — Inflow gets a bound, and the bound is not the one nearest to hand

**What changed this round.** An earlier draft capped carried findings at two per
review and called that an inflow budget. A sealed reviewer measured the channel:
across all 407 records in `data/reviews/` on 2026-09-08 there are **222 `carry:`
entries in 143 records — 86 records with one, 37 with two, 17 with three, two with
four**. A cap of 2 would have suppressed **24 of 222 entries, 10.8%**, in 20 of
407 records; the required subject would refuse **15 of 222, 6.8%**; and the
merge-into-existing-subject rule is something `pulse/lib/queue.mjs:436-459`
already does. Against a channel filing 37 in three days and a tracker growing at
1.43, 10.8% is not a budget. This change deletes two other mechanisms *because*
they never fired and would have "measurably prevented nothing"
(`addictedtoai-occ0`); a cap convicted by the same standard is not adopted because
it was convenient. **The numeric cap is dropped.**

**What is kept, and why each earns its place.** The `subject` requirement becomes
mandatory — a finding with no subject cannot be grouped, cannot be retired by the
work that fixes it, and becomes an item nothing can close. The
merge-into-subject rule stays. And the count of entries per review goes **on the
ledger**, so the channel's volume is a readable series rather than something
re-derived from record files each time anyone asks.

**Where the inflow argument actually goes.** ~68% of filings cite a review
finding, a Desk job or the deferral rule as their occasion
(`evidence/beads-report.md` §B). The lever is the **deferral rule**: a deferral
becomes its own issue only when it names a subject path or a specification
requirement and cannot be fixed in the same job. That rule has two halves and they
are separated on purpose. The **text** is the maintainer's own — *"Any time
something like this pops up, file a beads issue or it will get lost!"* — so
amending it is **open question 6** and the task that edits `CLAUDE.md` and
`AGENTS.md` is **held** until he answers. The **lint** is mechanical and ships in
Stage 0 as a standalone script reading `bd list --json`, reporting issues that
name neither, and depending on nothing this change has not built yet.

**Also kept, and this needs saying because it looks inconsistent.** The proposal
over-cap drop and the self-amplification discard are kept **despite never having
fired**. The distinction from the expiry sweep and the duplicate-slug discard is
not how often they fire: those two are traffic guards that intake now performs,
while these two bound **a job's own output** and are conflict-of-interest guards.
A guard against a conflict of interest is worth keeping at a zero firing rate,
because its value is that the path is closed, not that it is busy.

**Proposals.** At most one per job (already true); converted to beads at intake
with a default defer. The never-fired expiry sweep and duplicate-slug discard are
deleted because intake owns dedup and expiry.

> **DRAFTER'S OBJECTION (D4), new this round.** With the cap dropped, **nothing
> in Stage 0 mechanically bounds inflow.** The lint reports; it does not refuse,
> because the thing that would refuse — intake — is Stage 3. The filing-rule text
> is held on the maintainer. So between Stage 0 and Stage 3 this change makes the
> Desk faster while leaving the channel that files work about the Desk exactly as
> it is, and A2AI-mem-cond's position — the deferral rule makes inflow a function
> of throughput — predicts that filing *rises*. That is the honest reading and the
> measurement plan tracks it; it is not a reason to reinstate a bound measured to
> prevent 10.8%.

---

## D5 — The brief goes on a diet, and the diet has a ceiling

**Mechanism.** `excerptsFor`'s **pass 2b** (`specs.mjs:317-330`) — "whatever is
still unspent, round-robin" — is deleted, so the budget is *bounded* rather than
*saturated*. Excerpts become the requirements the governing type and the declared
subjects name, plus the pending-amendment deltas for those requirements only. The
per-source budget stops splitting across unarchived changes.

**And the ceiling comes down, which an earlier draft did not do.**
`BRIEF_EXCERPT_MAX_CHARS` is **88,000** today. Deleting pass 2b removes the
saturation; task 17 *raises* what passes 1 and 2 may each spend; nothing lowered
the constant, so the headline "~100,000 → ~30,000 characters" had no mechanism
behind it and the only thing touching 30,000 was a Stage-2 gate that *measured*
the claim it was supposed to enforce. The ceiling is restored to **24,000** — its
value before the four raises — and the test asserts an **upper bound on the
assembled brief** (a `repair` at most 30,000 characters against the live tree),
not merely that budget went unspent. A rider no task covered: deleting pass 2b
makes `specs.mjs:335`'s `truncated` flag true far more often, which changes the
brief's "read the full files" guidance, so a task covers that too.

**The revision brief gets a structured source.** It carries the verdict, the
acceptance checks, the diff and the excerpts for the requirement headings the
verdict **structurally cited** — a new `cites:` list validated against the live
specification's headings the way reasons are validated against the closed reason
list. Left as prose, "the excerpts the verdict cited" is satisfied equally by
re-sending everything, by sending an unrelated section, and by omitting the one
the reviewer leant on, and no check tells the three apart. An empty list means the
checklist's requirements for the governing type and nothing else.

**Evidence.** 16,181 chars on 2026-08-28 → 103,881 on 09-08, ~85% spec excerpt
(`evidence/desk-mech-report.md` §B). The constant was raised four times, each time
because unarchived changes split the per-source budget, at ~13,000 chars per
additional in-flight change; its own comment says raising it *"is restoring
service, not a fix"* (`addictedtoai-2sx8`).

**Alternative rejected.** Making the constant a function of source count, which is
what `2sx8` proposes. Insufficient alone: it makes the constant honest and leaves
pass 2b spending whatever the formula yields.

---

## D6 — Retire the hand-driven fleet; keep its instrument

No new fleet waves **from Stage 3**, when the front-desk workers that replace it
exist. Retiring it earlier would remove the only channel by which the largest
machinery work has ever been done, while the ceiling that caused that is still an
open question — "retire it" and "we have not decided whether the replacement can
afford it" should not be in the same stage. Until then the fleet is the
implementation engine for this change.

Its two real advantages are absorbed: parallel worktrees become the front desk's
workers, and its sealed cross-change review becomes the **train review**. Its
grading instrument is kept as a measurement the train review reports — findings
the per-job reviews missed. The seal is a requirement, not a habit, and it is
**ordered file access**: the per-job verdicts live in a separate file the train
reviewer is instructed to open only after writing its own findings file, and the
brief assembler verifies the findings file exists before exposing the verdicts.
What is mechanised is the **order and the existence check**; what is not is
whether the reviewer honoured the instruction, and the requirement says so.

**Evidence for keeping the instrument.** A batch review over five changes found
**three instances of a class that thirteen sealed per-change reviews had all
missed** (`evidence/hist-report.md` §B.10).

---

## D7 — Runner policy: an effort ladder, climbed on evidence

**The instruction.** The maintainer, 2026-09-08: *"you can use and should use
codex Luna sessions for token heavy tasks. Yes medium effort for basic work and
max effort complex and review work. Luna on max effort lands somewhere between
Sonnet and Opus in terms of capabilities, but is much cheaper."* Recorded in the
memory store as statement 21 (`b34f584`) and **relayed rather than witnessed** by
this drafter. He had already ruled one type on 2026-09-07 — *"Scout should be max
effort for luna"* — which `runners.yml` records, along with his rule that all Luna
runners are cheap tier.

**Agreement with the reviewer, by author runner** (`evidence/scripts/
orch-runner-quality.mjs`). First-pass revise rate = review 1 said `revise`. It is
a proxy for agreement, **not a defect rate**; it counts only jobs that reached
review, so gate failures sit in the fail column against a different denominator
and **the two must never be combined**.

| Author runner | n | done | mm/job | first-pass revise |
|---|---|---|---|---|
| `opencode-deepseek` | 114 | 93% | 20.1 | 22/108 = **20%** |
| `claude-code-opus` | 88 | 86% | 23.2 | 8/76 = **11%** |
| `codex-gpt-luna-medium` | 25 | 72% (8% discarded) | 21.5 | 7/19 = **37%** |
| `codex-gpt-luna` (max) | 10 | 70% | 24.1 | 1/7 = **14%** |

Like-for-like on `repair`: luna-medium 5/15 = **33%**, deepseek 11/77 = **14%**,
opus 1/32 = **3%**.

**Workflow-adjusted cost per merged job** (`evidence/runner-workflow-cost.md`,
`evidence/scripts/runner-workflow-cost.mjs`, 243 ledger lines,
2026-08-28..09-08). Every model-minute recorded against a cell — every role, every
outcome, including jobs that never merged — divided by the jobs that did merge.
The denominator is results delivered; the numerator is everything the workflow
spent trying.

| Author runner | n | merged | **workflow mm/merged job** | author-only mm | revision share |
|---|---|---|---|---|---|
| `opencode-deepseek` | 114 | 106 | **21.6** | 14.2 | 13% |
| `claude-code-opus` | 88 | 76 | **26.8** | 20.1 | 5% |
| `codex-gpt-luna-medium` | 25 | 18 | **29.9** | 16.5 | 23% |
| `codex-gpt-luna` (max) | 10 | 7 | **34.4** | 25.5 | 14% |

On `repair` alone: deepseek **18.0** vs 12.2 author-only (n=80); opus **17.7** vs
13.6 (n=34); luna-medium **23.2** vs 11.8 (n=19); luna-max **27.1** vs 23.8 (n=8).

**So the sum, done rather than gestured at.** On `repair`, `codex-gpt-luna-medium`
is the **cheapest author** and the **most expensive workflow** of the three main
runners in model-minutes: revisions and failures add about **11 minutes per merged
job**. The policy below therefore holds **on price only if Luna's cost per
model-minute is at least about 1.3× lower than Opus's**. The maintainer's
instruction asserts exactly that ("much cheaper"); **the ledger cannot measure it,
because it records minutes and not dollars.** That is the policy's stated
assumption, recorded as one.

**And the table has a second, sharper limit that reshapes the policy.** It prices
**two** rungs — `medium` and `max` — because the registry has exactly two Luna
entries. **`high` and `xhigh` are unmeasured**, and that is not a gap to be
apologised for; it is the experiment. The Stage-0 ledger fields — runner **and
effort** per phase — are the instrument that makes both the missing rungs and the
missing dollars measurable later.

**The ladder, and why the policy is one.** The maintainer, 2026-09-08: *"As far as
the lunar runner goes, I'd like to experiment with using the other effort level
settings before going straight to max there's a high and an extra high I
believe."* A2AI-Orch checked it against `codex` rather than the documentation:
`model_reasoning_effort` **accepts `medium`, `high`, `xhigh` and `max`**, and a
bogus value is **rejected**, so the four acceptances mean something. **`low` is
untested, not rejected** — a first detector misread an unrelated cache warning as
a rejection, and the corrected reading is that nobody has tried it.

So the earlier policy's real defect was structural: it had two settings because
the *registry* had two entries, and every decision was therefore a jump from the
cheapest rung to the most expensive one. Effort is a **rung declared in
`runners.yml`** — a registry entry, no code — and the policy names a **starting
rung**.

**The policy.**

- `codex-gpt-luna-medium` is the starting rung for **`repair` and `interpret`**
  (`interpret` on n=1, stated rather than hidden), with `verify` and `prune`
  considered on evidence.
- **Every other type starts at `max`**: `verify`, `prune`, `entry`, `post`,
  `scout`, `machinery`, `tutorial`, `education` and anything touching `openspec/`.
  For `verify` and `prune` the reason to start above `medium` is consequence rather
  than difficulty — a `verify` writes fetched facts into the corpus and a `prune`
  deletes published work. `machinery` on `medium` is **contradicted** by the
  ledger: n=2, 2/2 revise, one discarded, **64.8 mm/job, three times any other
  cell**, plus `j-20260908-14` (machinery, medium, 56.93 mm, discarded for a spec
  violation). `entry` on `medium` is **not supported**: n=3, two failed.
- **All review, the train review and every revision start at `max`.**
- **`high` and `xhigh` are named for no role.** `high` stays registered and
  conformance-passed and may be reopened by a ledger measurement; `xhigh` failed
  the fabrication trap and is named for nothing at all.

**Three declarations, and they are deliberately separate.** The **registry**
declares rungs, clearances and **enablement**; the **chain** declares the policy —
which runner is named for which type and role; the **conformance gate** declares
fitness. Keeping them apart is what lets a rung be registered, conformance-passing
and named by nothing, which is exactly `high`'s position. It also survived a
correction: the registry alone could not express it. An **absent** `job_types`
means *cleared for every type* (`select.mjs:132-134`; the comment at `:122` says
so), and an empty list is a load-time error — so leaving `high` without
`job_types` would have made it eligible for anything the escalation path reached.
Hence an explicit `enabled: false`, checked before every other gate, with absent
meaning enabled on the same fail-open convention `job_types` already uses. Until
that ships, `high` is unnamed **by discipline rather than by mechanism**, and
these artifacts say so, because a discipline standing in for a mechanism is
invisible until it lapses — which is the shape of the serial rule this change
lifted.

**Why two rungs and not four, decided by the maintainer against the measurement.**
He was shown `high` at 7.03 model-minutes against `max`'s 7.81 — about 90% — and
ruled: *"If going to high vs max only saves 10%, I'd rather just use max."* That
returns the policy to his original instruction, now confirmed rather than assumed.
**The caveat he was given travels with it**: the 10% comes from four tiny canned
conformance tasks, which are not a workload, and a difference that is small on a
one-file edit can be large on a blog post. It is held loosely, and the thing that
would justify revisiting it is the **first-pass revise rate per type and rung on
real jobs**, which the Stage-0 per-phase runner-and-effort fields exist to make
computable. **The ladder requirement itself is kept** — a rung is a declared
registry entry, and a rung rises or falls on that measured rate — so reopening
`high` later is a registry edit and a ledger reading, not a specification change.
- `codex-gpt-luna-medium`'s `job_types` narrows from
  `[interpret, verify, entry, tutorial, education, repair, prune, machinery]` to
  `[repair, interpret]`; the new `high` and `xhigh` entries carry the rest.
- Escalation moves into the repository and keys on the **top-ranked** candidate.
- Claude runners stay registered and conformance-passing; they are not the
  default.

Every Luna cell is small — 25 jobs, in service only since 2026-09-07, across two
of four rungs — so the policy is provisional by construction and says so. The
qualitative evidence for Luna at max as a *reviewer* is A2AI-Luna-Boss-2's
observation, not the ledger's: it found a live regression on `4lrp` with a probe
and graded well against withheld findings. That is an argument for reviewing high
on the ladder; it is not evidence that `xhigh` is insufficient, which nobody has
measured.

**`xhigh` failed the fabricated-quote trap, and that is why it is named for
nothing.** A2AI-Orch ran conformance against both new rungs (task 19's first half,
`10be428`, verified from the committed blob). `codex-gpt-luna-high`: **four
passes**, 2.51 / 2.65 / 1.02 / 0.85 = 7.03 model-minutes.
`codex-gpt-luna-xhigh`: PASS, PASS, **FAIL**, PASS — it produced a quoted
sentence, *"The Institute publishes no benchmark numbers with this release and
makes no claim about response times."*, which appears nowhere in the source it was
given. `medium`, `high` and `max` all passed the same trap. The selector's own gate
now refuses `xhigh` for author and review, verified by calling it, and
`runners.yml`'s `conformance:` fields read pass / FAIL accordingly.

**The method rules matter more than the result, because this is n = 1.** One trap,
one run. A **second** run is a legitimate measurement and one has been requested.
Re-running until it passes is not a measurement, it is selection. And if a second
run passes, the record reads **"fabricated on 1 of 2 runs"** — never "passes".
A fabrication check is the last one whose failures may be averaged away: the
defect it catches is the one this site exists to avoid, and a rung that produced a
plausible sentence from nothing once will do it again on work nobody is testing.
"Pending investigation" is not a status a role assignment may rest on, so `xhigh`
is not named at all rather than named provisionally.

**The cost observation, and what the maintainer did with it.** At 7.03 mm against
`max`'s 7.81 and `medium`'s 5.06, `high` costs about 90% of `max` and `medium`
about 65% of it — on four canned checks, which is not a workload. Shown that, he
ruled: *"If going to high vs max only saves 10%, I'd rather just use max."* So the
policy is two rungs, `medium` and `max`, which is his original instruction
confirmed against a measurement rather than assumed. The observation that the
interesting gap may be **medium-to-high rather than high-to-max** stands as an
observation, and the ledger's per-rung revise rate on real jobs is what could
reopen it.

**The conformance record, re-read rather than quoted.** `data/conformance.json`
carries **seven** runners: `claude-code-sonnet`, `claude-code-opus`,
`opencode-deepseek`, `opencode-muse-spark`, `codex-gpt-luna`
(2026-09-07T15:46:57Z) and `codex-gpt-luna-medium` (2026-09-07T22:10:07Z) all
**pass on all four checks**, and `opencode-openrouter-muse-spark` **fails all
four**. `CLAUDE.md` still says four runners and calls `codex-gpt-luna` a FAIL for
an expired login — true on 2026-08-30, not now — and `CLAUDE.md` says of that very
paragraph that the JSON is the authority and *"this passage has now been wrong
twice."* **This is the third time.** Correcting it, and the `runners.yml`
`conformance:` fields that read `unverified` on entries the JSON records as
passing, is a Stage-0 task.

> **DRAFTER'S DECISION (D7).** The requirement text names **no runner ids**. It
> states the policy's shape — that effort is a rung on a declared ladder, which
> roles and types start above the cheapest rung, that a rung is raised on the
> ledger, and that escalation is part of the declaration — and leaves every id,
> model and effort string in `runners.yml`.
> `loop/tests/portability.test.mjs` would reject those words in the machinery, and
> a requirement naming today's runners is false the first time he swaps one.

---

## Bounds, and how they will be tuned

| Bound | Start | Where it came from |
|---|---|---|
| `N_max` items per work order | 4 | **A practice, not a measurement**: the hand-batched directives ran 2–3. |
| `S_max` distinct subjects | 4 | An argument, not a measurement: bytes bound volume, not attention. |
| `B_total` reviewed bytes | 60,000 | Above the measured review-diff p90 of **55,034** (`evidence/desk-mech-report.md` §B — the p90 is that report's, *not* `review.mjs:744`, which is the 200 KB truncation and was a mis-carried citation). |
| `B_per_subject` reviewed bytes | 30,000 | **No derivation.** It is half of `B_total`; the argument that a total says nothing about distribution justifies the bound's existence and not its value. |
| `B_train` reviewed bytes per train | 150,000 | Conservative; ~2.5 × `B_total`. To be tuned first. |
| `S_train` distinct subjects per train | 12 | Conservative; 3 × `S_max`. |
| `K` merges per train | 5 | The fleet's every-5 batch review, made mechanical. |
| `T` minutes since first unpublished merge | 90 | ≈ one job per 79 min observed on the chain. |
| `W` front-desk workers | **1** | Starts at one. **3** is the proposed experiment value, and it is reached only once the failure count, the runner-health count and the lane pause are windows and the budget gate reads reservations — four of the six controls concurrency touches were broken when this was written. It is a config key the chain reads, so the experiment is an edit, not a code change. |

**The bounds and batching, arithmetically.** The median reviewed diff is **8,101
chars** and the p90 is **55,034**. At the median, `N_max` = 4 binds before
`B_total` (4 × 8,101 = 32,404 < 60,000); in the top decile a single item goes
alone. So the bounds permit batching for typical items and refuse it for outliers,
which is the intent.

These live in `data/config.json` as their own keys. They are **not** budget
bounds: the floor and the ceilings keep their requirement that changing them needs
an OpenSpec change. Tuning these nine is the orchestrator's between runs under
standing authority, and each change must name the ledger measurement that
motivated it. No job may edit them — `data/config.json` stays reserved.

---

## Spec collisions

`check-spec-deltas.mjs --strict` promotes `collision` and `archive-order` from
warnings to refusals, so this is a gate condition. Three changes are unarchived
and they touch **twelve** requirement headings between them — four each. (An
earlier draft said eleven; the enumeration was complete and the count was wrong.)

- **`let-the-queue-see-a-judgment`** — loop: ADDS *"A review-mismatch job's merge
  binds by the item it was dispatched at, not by its diff"*. pulse: ADDS *"A
  review that no longer describes its file is work the queue can see"*, MODIFIES
  *"The work queue is derived, never accumulated"* and *"Declared corroborations
  are compared every run, and disagreement becomes work"*.
- **`keep-the-map-describing-the-territory`** — education-dynamic ADDS *"The
  tutorial surface has a curriculum of record"*; education-static ADDS *"A
  departure from a page's entry amends the entry in the same diff"*; pulse
  MODIFIES *"A surface's unmet declared coverage is queue input"* and *"Which job
  types the queue may produce is a stated decision"*.
- **`bind-what-the-catalog-knows`** — wiki only: ADDS two, MODIFIES *"Entries
  carry structured, sourced, dated facts"* and *"Volatile facts travel by
  transclusion, never by restatement"*.

**Resolution: no heading is shared.** This change's pulse surface is now one
ADDED and **one MODIFIED** — *"The Pulse publishes what it builds"*, live at
`openspec/specs/pulse/spec.md:40`. That heading is named by **no** unarchived
change: a grep for it across every `spec.md` under `openspec/changes/` excluding
`archive/` returns zero matches, run by A2AI-Luna-Boss-2 and re-run by this
drafter on 2026-09-08. `check-spec-deltas.mjs --strict` reports 0 errors, which is
the same fact by machine.

**The earlier additive framing is superseded on purpose.** A previous draft wrote
the publish-scope rule as a new requirement specifically to keep the pulse surface
additive while two other changes amend pulse requirements nearby. That was
**prudential, not a collision constraint** — the check above is what a collision
constraint looks like — and it cost correctness: the Pulse kept committing
directly to `main`, so "nothing else pushes" was false, and the rule sat beside
the requirement it contradicted instead of inside it. Modifying the requirement is
the honest shape, and the grep is what justifies it.

**One near-neighbour, recorded because it is a real interaction.**
`let-the-queue-see-a-judgment`'s loop requirement and this change's `reviewed:`
outcome both let a merge bind a path the branch diff never touched. They key on
different things — that one on the queue item's `review-mismatch` reason, this one
on the committed declared subjects — and **this change does not depend on it**,
because it supplies its own subject source (D1's root fix). An earlier draft
claimed independence while relying on that change's mechanism to write the record
at all; supplying the subject source is what makes the claim true.

**Why two headings are REMOVED and re-ADDED rather than renamed.**
`check-spec-deltas.mjs` cannot resolve a same-delta `RENAMED TO` for a `MODIFIED`
heading, so no delta can rename-and-modify under `--strict` — a limit the tabled
`7z07` draft hit first. *"One job is one outcome with one merge or discard"* and
*"Work comes from three sources and cannot self-amplify"* each carry a count this
change makes false, so each is REMOVED and re-ADDED with its whole body carried
over.

---

## Windows and tooling notes

- **`spawnSync` with `npm.cmd` and `shell: false` does not execute on Node 24.**
  Status `null`, no output, ~0 ms, no throw. The tell is the duration. Use
  `cmd.exe /c`, not `shell: true` (which re-escapes arguments). Every gate needs a
  **floor duration derived from a recorded calibration** — the gate's measured
  runtime here with a stated margin, dated — so the check is a measurement rather
  than a guess and a faster machine does not turn it into a false failure.
- **Worktree junctions.** `git worktree remove --force` follows the
  `node_modules` junction into its target: **177 packages deleted from the real
  `node_modules`**. `loop/lib/git.mjs:116` still passes `--force`; a task changes
  it, because the requirement that a teardown refuse rather than force had a
  scenario and no task.
- **Locks.** The 600s default wait is shorter than the 4–6 minute suite it waits
  for (`addictedtoai-3ov0`). With the suite on the train, only the build lock
  serialises a worker's tripwire; the train holds both and needs a wait budget set
  for the full set. Pid liveness is defeated by pid reuse
  (`build-lock.mjs:116-117`), so the two new locks carry more than a pid.
- **`bd` argv — measured, and the earlier note was wrong.** 200 ids in one argv
  worked, so no batching ceiling needs designing around. Metadata round-trips as
  **JSON objects**, not as a string as an earlier reading of the tabled draft had
  it, and `--set-metadata` merges rather than replacing. `--sandbox` on every call
  stands. Full results in `evidence/bd-measurements.md`.
- **An empty conformance read looks exactly like a permissive gate.**
  `loadConformance`, given the wrong context shape, calls `existsSync(undefined)`,
  returns `{}`, and every runner then reads as "no record, allowed" — because an
  absent record warns rather than refuses, by design. The design is right and the
  consequence is nasty: a **broken reader** of the record is indistinguishable from
  a record in which everything passed. Any code or task that reads conformance
  programmatically asserts the **record count it loaded** before trusting a verdict.
- **Archived-change paths.** Nothing under `loop/`, `pulse/`, `scripts/` or `lib/`
  may reference `openspec/changes/<name>/`; a test that did failed the final gate
  run minutes after that change was archived (`addictedtoai-2hsy`). This applies to
  `evidence/` too: archiving moves it.

---

## What is deleted, and the measurement that justifies each deletion

| Deleted | Measurement |
|---|---|
| `DIRECTIVES.md`, after migration | 169 lines / 131,951 bytes, 56 directives (45 done, 10 pending, 1 parked). One unrunnable line starves the whole queue: `j-20260906-10` burned 5.07 model-minutes and wrote no `RESULT.md` **while 26 queue items waited**. The "parked" section exists only because lines must be hidden from the parser. **Deleting the file does not fix the starvation** — a routed issue at the top band starves the queue on the same arithmetic — which is why a queue floor and automatic deferral of a candidate that produced nothing ship with it. |
| Proposal expiry sweep and duplicate-slug discard | **Never fired.** Audited 2026-08-31 across all 15 retired proposals then; re-verified 2026-09-08 — only "## Consumed" headings exist, 35 of them. Building on a mechanism that has never fired *"would have produced a guardrail that measurably prevents nothing"* (`addictedtoai-occ0`). Intake owns dedup and expiry. |
| The hand-driven fleet (at Stage 3) | No code, no ledger, no budget, no record. It ran all day 2026-09-08 from a script inside a session's temp directory after that session had ended. |
| Pass 2b of `excerptsFor`, and 88,000 → 24,000 | The brief grew 16,181 → 103,881 chars in eleven days, ~85% spec excerpt (`specs.mjs:317-330`; `addictedtoai-2sx8`). |
| The post-merge build (`run.mjs:1661`) | Two builds per merged job today, not three. **The property it carried is not deleted with it**: the tripwire now builds the merged tip, so "green apart, red together" is still caught per merge at one build per job. |

---

## Alternatives considered, with the decision

Recorded because a sealed reviewer named each as unconsidered, and it was right
that they were.

- **D1 — batch the review, not the job.** Keep one item per job and let one
  reviewer read N merged branches in one context load. Recorded as the **retreat
  position**: if Stage 2's proxy rises with `N`, work orders fall back to exactly
  this. Work orders stay primary because the *author's* orientation is 69% of
  model-minutes and only they amortise it, and because `vqbo`'s declared-subject
  list needs them.
- **D2 — overlap the gates with the review.** Gates are 100% machine time and run
  before review 1. Priced at ~5 min/job under today's gate set; **moot** once the
  train reduces the per-job gate to ~33s. Not built.
- **D3 — do not build the second desk.** The mission licenses "build or explicitly
  not build". Built, but as **routing and accounting** — every candidate and every
  ledger line carries a desk, the idle rule, inflow reported per desk — not as two
  machines. One lane with the ceiling is today's state, and today's state is what
  relocated machinery to frontier sessions invisibly; the split is what makes that
  visible and gives the maintainer the dial.
- **D4 — budget the deferral rule instead of the carry channel.** **Adopted.**
- **D5 — bound the brief by the declared subjects rather than by keyword
  matching.** **Adopted**, together with lowering the ceiling.
- **D6 — keep the fleet until the back desk can afford its work.** **Adopted in
  substance**: it retires at Stage 3, when the workers exist, and is the
  implementation engine until then.
- **D7 — compute the workflow-adjusted cost per runner × type.** **Adopted**; the
  table is above and the policy is priced on it.

**Guardrails removed or weakened, named.**

1. **The per-merge integration build** — restored, by moving the tripwire onto the
   merged tip. An earlier draft deleted it and named only the build, not the
   property.
2. **The practical "only the Desk may edit a published page" constraint** — the
   `reviewed:` outcome removes it in bounded form. Named in the proposal's "What
   changes" as the deliberate loosening it is.
3. **`verify-launch` and `verify-analytics` were never job gates** — the change
   *adds* them. A strengthening, now named.
4. `data/config.json` gains tunable keys while staying reserved, stated explicitly.

---

## Measurement plan

- **Per merged item** (ledger line): `items` with each item's bead, type and
  subjects; `brief_chars`; `gate_seconds` per gate; runner and effort per phase;
  carried-entry count; `evicted-at-train` and partially-done markers where they
  apply.
- **Per train** (its own line): per-gate seconds; merges carried; evictions and
  whether each was later recorded as wrong; `pre-existing` holds; and the count of
  train-review findings present in **no** per-job record — the fleet's grading
  instrument, mechanised.
- **Per intake run**: candidates routed front/back, machinery share of inflow,
  filed vs closed for the local day, and every verifier failure by candidate id.
- **The definitions the stage gates use.** The per-job measure is **brief-commit →
  merge-onto-`train`**, and the per-train figure is separate. This matters because
  the records commit moves to the train, so "brief-commit → records-commit" after
  the change spans up to `K` merges and is not the quantity the 5.5-minute
  baseline measured. **Stage 0 takes the baseline on the new definition, with the
  same script, before anything moves.**

---

## Revision record — round 1

Every finding raised, and the one-line disposition applied. Reviewer files:
`evidence/reviews/round1-sealed-opus-high.md`,
`evidence/reviews/round1-sealed-luna-max.md`.

**Drafter's own objections carried forward:** D1 (proxy not measurement) —
accepted, decision rule written into the Stage-2 task. D2 (`pre-existing`, not
"world moved") — accepted as written. D3a (verifier is half a mechanism) —
accepted, honest wording kept. D3b (idle rule slows the back desk) — accepted as a
real tension; recommendation added to open question 4. D7 (no runner ids in
requirement text) — accepted.

**A2AI-Orch (1–8).** 1 escalation keys on the **top-ranked** candidate, not on the
run selecting nothing. 2 the search identifies the **surfacing** merge, and the
train re-runs after an eviction. 3 the "81 of 100" figures replaced by the
classification (52 code-only, 18 content-only, 15 both, 16 neither; review-gate
floor 33) — **with the provenance gap named**, see below. 4 ceiling recommendation
stated as a mechanism with named commits and no ratio. 5 `verify` and `prune` start
at max; the default list narrows to `repair` and `interpret`, with `interpret`'s
n=1 stated. 6 the train records its snapshot date and refuses a search that would
cross a change in it. 7 superseded by the Opus re-staging. 8 chain stops on a
failed run; publish refuses under `HOLD.md`; the train's lock-wait budget is set;
the publish step reads the flag itself.

**A2AI-mem-cond (F1–F10).** F1(a) closure refuses while unresolved deferral notes
stand, with a promote path; F1(b) the filing rule is the maintainer's, so it
becomes open question 6 and the text task is **held**. F2 evidence directory built
and every citation repointed. F3 **superseded by Opus F8**: one ledger file under a
ledger lock, not per-run line-files. F4 the seal is ordered file access with an
existence check; what is and is not mechanised is stated. F5 missing or empty
`declared_subjects` is a refusal. F6 the 194 mm contention loss dated as historical
and the forward cost restated. F7 the census example dated and hedged as a class.
F8 over-cap drop and self-amplification discard kept despite never firing, on
conflict-of-interest grounds, and the distinction stated. F9 the scoped push
verified structurally and behaviourally against a bare origin read off the remote.
F10 the bundler splits rather than truncates; a lone over-bound item is refused
with a ledger-visible reason.

**A2AI-Luna-Boss-2 (B1–B2, M3–M7, m8–m9).** B1 `B_train` and `S_train` added; a
train runs on the prefix that fits. B2 the train review's red path added as the
fourth row. M3 the Pulse commits to `train`; its publish retires in favour of the
train's; the pulse requirement is MODIFIED and the collisions section rewritten.
M4 the train review re-runs after any eviction. M5 re-staging plus a correctness
criterion for evictions. M6 routing keys on declared metadata; the "all 19 were
machinery beads" claim, which rested on a title regex, is **withdrawn**. M7
resolved: the whole 48-bead opening cohort is now checked. m8 the bounds/batching
arithmetic written out. m9 the `CLAUDE.md`/`runners.yml`/`config.json` tasks marked
orchestrator-between-runs. Its "independently confirmed" framing is **struck**: its
47 was a UTC cumulative that coincided with the local count.

**Sealed Opus, high effort (F1–F21, §4, §6).** F1 push a verified **SHA**, not a
commit set — the set rule deadlocked the two publishers permanently. F2 the
`reviewed:` record's subject source, folded with Luna's MAJOR 3 into **one** root
fix at `run.mjs:1577-1594`. F3 **leave-one-out**, not a prefix bisect, which
returns the newest merge in exactly the cited shape; task 9's mutation rewritten to
fail on it. F4 `pre-existing` does not halt; the train is held and accumulation is
bounded. F5 the bounds measured against reviewed surfaces on the empty-diff
outcome. F6 the numeric carry cap **dropped**, convicted by the reviewer's own
distribution. F7 four gates and two builds, with corrected arithmetic and the
`verify-launch` strengthening named. F8 selection lock and ledger lock, one ledger
file. F9 workers branch from `train`, with subject-disjoint merges as the companion
rule. F10 the excerpt ceiling lowered to 24,000 and the test bounds the assembled
brief. F11 a queue floor and automatic deferral, since deleting the file does not
delete the starvation. F12 the ratification channel named in the proposal. F13 the
stage measure redefined as brief-commit → merge-onto-`train`, baselined in Stage 0.
F14 twelve, not eleven. F15 the p90 cited to `evidence/desk-mech-report.md` §B.
F16 branch census corrected (225; `job/*` 38; fleet family 32; `loop/*` 121). F17 a
task on `git.mjs:116`. F18 both vacuous scenarios rewritten. F19 "prose piece"
defined by the schema's kinds. F20 task 51 names `loop/lib/issues.mjs` as the
existing format module. F21 the train retries the failing gate; the tripwire
retries its two. §4 re-staged into Stage 0/1/2/3. §6 every alternative recorded
above with its decision.

**Sealed Luna, max effort.** BLOCKER 1 both callers pass a verified SHA, including
`pulse/run.mjs`. BLOCKER 2 the train order becomes gates → rederive → review →
records → publish, the reading of the reserved property is **stated** and put to
the maintainer as open question 7, and the train review gains a fail-closed result
protocol. MAJOR 3 folded into the F2 root fix. MAJOR 4 the unchanged-page scenario
asserts hash **equality**, not presence. MAJOR 5 — the verifier is an instruction —
**not hardened**; the adjudication kept the honest wording and the tension is
recorded as DRAFTER'S OBJECTION D3a. MAJOR 6 the verdict gains a structured
`cites:` list. MAJOR 7 re-staging. MAJOR 8 and spot-checks 2–4 — the codex figures,
the gate table and the local-day script were not reachable from the reports —
**resolved by the evidence directory and the citation repointing; it was a real
provenance gap at review time.** MAJOR 9 the acceptance object named: this change
implements the `h0z0` comment. MINOR 10 gate floors derived from a recorded
calibration. Its coverage script found the two REMOVED headings mapped only in
prose — `tasks.md` now carries a machine-readable heading-to-task table covering
ADDED, MODIFIED and REMOVED. Its open question 2 — nothing mechanically prevents a
human or an old script from pushing — accepted as a **stated limit** in "What does
not change".

**Not applied in round 1, and both are closed in round 2 below.**

## Revision record — round 2

- **Luna MAJOR 5 — the intake verifier is an instruction, not a mechanism.**
  **Now adopted, in the structured-evidence form**, overturning round 1's
  disposition to keep the wording as it stood. Each failed claim gets a stable
  identifier; the brief carries the list; the executor's result file carries a
  `rederived:` block of one entry per identifier with a state from a closed set of
  three and a sentence of evidence; `result.mjs` parses it; and **the merge
  refuses when any identifier has no entry**. The form is mechanised, the content
  is the reviewer's, and D3a now states exactly where that line falls. Task 88
  implements it, with the mutation that matters: drop the per-identifier presence
  check and a brief carrying two failed claims merges with one entry. The stronger
  alternative — make a failed claim non-authorable until a fresh mechanical check
  says otherwise — is recorded as not taken, because it would block a job whose
  honest first finding is that the claim was stale, which is the common case.
- **The backlog-classification provenance gap is closed.**
  `evidence/scripts/orch-backlog-classify.mjs` is now in the directory with its
  invocation; the four figures (52 code-only, 18 content-only, 15 both, 16
  neither; review-gate floor 33) are reproducible from this change directory, and
  the "needs reproduction or withdrawal" flags in `proposal.md` and
  `evidence/README.md` are removed. Every load-bearing measurement a sealed
  reviewer called unreachable now has its script here.
- **`proposal.md` gains an "In one page" summary** at the top, for the maintainer:
  the three verdicts in a line each, what changes, what Stage 0 ships and saves,
  the seven decisions in a line each, and where the evidence lives. It introduces
  nothing; every figure in it appears below with its citation.

## Revision record — round 3

- **D7 becomes an effort ladder rather than a binary**, on the maintainer's
  instruction: *"As far as the lunar runner goes, I'd like to experiment with using
  the other effort level settings before going straight to max there's a high and
  an extra high I believe."* A2AI-Orch verified against `codex` rather than the
  documentation that `model_reasoning_effort` accepts **`medium`, `high`, `xhigh`
  and `max`**, and that a bogus value is rejected — so the four acceptances are
  evidence. **`low` is untested, not rejected**: a first detector misread an
  unrelated cache warning as a rejection, and that reading is withdrawn rather than
  repeated. The earlier policy's real defect is now named: it had two settings
  because the *registry* had two Luna entries, so every decision was a jump from
  the cheapest rung to the most expensive. Effort is now a **rung declared in
  `runners.yml`** — a registry entry, no code — with a **starting rung** per type
  and role: `medium` for `repair` and `interpret`; **`high`** for `verify`,
  `prune`, `entry`, `post`, `scout`, `machinery`, `tutorial`, `education` and
  anything touching `openspec/`; **`xhigh` for all review, the train review and
  every revision**, which is the experiment he asked for and is labelled as one
  rather than defaulted to `max`. A rung rises only when the ledger's first-pass
  revise rate for that `(type, effort)` pair says the one below is not holding, and
  the Stage-0 ledger fields — runner **and effort** per phase — are the instrument
  that makes that computable. Re-priced honestly: the workflow-cost table prices
  **`medium` and `max` only**, because those are the two entries that exist;
  `high` and `xhigh` are **unmeasured**, which is the point of the experiment
  rather than a defect in the table. Task 19 becomes "add the two entries, run
  conformance against each — the `max` entry's four checks cost 2.61 / 2.28 / 2.26
  / 0.66 model-minutes, so it is cheap — and declare `job_types` per rung". The
  requirement text still names no runner id.
- **"In one page" now opens with the ceiling**: the Desk cannot exceed about two
  jobs an hour, and not for any reason anyone chose — `npm test` holds a
  machine-wide lock, so a second worker waits for the first regardless of spare
  capacity, and batching K jobs per gate pass while running W workers is
  multiplicative. Then the six structural changes in a line each. **Stage 1's
  deferral is framed as sequencing, not caution**: the train rewrites the publish
  path, where a mistake is public rather than local, and it carried two defects an
  hour before this was written.

## Revision record — round 4

A sealed Opus **closure check** (`evidence/reviews/round2-opus-closure.md`) asked
which of round 1's findings actually closed: **20 of 21**, with F21 open because
its fix landed in a task and not in the requirement. It also found **seven new
text-level defects the revision itself introduced**, three of them consequences of
round-1 fixes. Findings per kilobyte fell from about **0.10 in round 1 to 0.026 in
round 2**, with the reviewer's own two cautions on reading that: it is a different
pass over different text, and a falling rate is consistent with a converging
document *and* with a reviewer finding less on a second look.

- **NEW-1** (F21, the one unclosed): the retry bullet still said a train re-runs
  its *full set* while task 49 said the failing gate. The requirement now says the
  failing gate, with the reason — re-running six because one failed spends the five
  that passed again.
- **NEW-2**: the round-1 merged-tip fix had moved the tripwire *after* review, and
  one requirement asserted both. The tripwire now runs **before review, on a
  provisional merge** of the integration tip into the job's branch, built in the
  job's own worktree with nothing committed; at merge, an unchanged tip accepts
  that result and a moved tip costs **one** rebuild under the merge lock. A diff
  that does not build now costs no reviewer minutes, which is a fifth of all
  model-minutes.
- **NEW-3**: `B_train`/`S_train` were measured before the rederive and the
  rederived bytes then added to the reviewer's load. The bounds now count content
  and code only; the regenerated tree is **shown as a summary** with the files
  openable, under the same deterministic-output exemption the records commit uses.
- **NEW-4**, the one that mattered: routing the Pulse's commit onto the
  integration branch, with every train trigger keyed on **merges**, meant `STOP` or
  any breaker's `HOLD.md` would have frozen the site's freshness layer silently —
  the maintainer's own brake becoming an outage. **M3's mechanism is reversed and
  its intent kept**: the Pulse commits and publishes as today, on its own schedule
  and its own gates; the train merges `main` in before its gates run; `main`
  advances by a passing train's fast-forward **or** by the Pulse's own gated
  commit, each pushed by its verified SHA. The property was never "one writer" but
  "no byte reaches the remote in a push whose declared SHA the pusher's gates did
  not examine", and push-by-SHA delivers that for two.
- **NEW-5**: `scripts/lint-deferrals.mjs` no longer spawns the tracker — it takes a
  JSON export path, the shape the evidence scripts already use — since exactly one
  module may invoke it and that module is Stage 3.
- **NEW-6**: the review delta's preamble still announced the carry cap its body
  had dropped. Corrected.
- **NEW-7**: the descendant check treated *equal* as a refusal. Equal now means
  nothing to publish, stated as such.

## Revision record — round 5

The maintainer lifted the serial rule, via A2AI-Orch, verbatim: *"It really was
meant to prevent collisions and machinery lock issues, you can disregard it moving
forward."* Its purpose is now served by `scripts/build-lock.mjs`, the test lock and
their measured refusal path — a discipline held by a person, replaced by a
mechanism.

**But he lifted it on the understanding that machinery had replaced it, and for
four of the six controls it had not.** A2AI-Luna-Boss-2 supplied the diagnostic —
*"A control that counts within a window survives concurrency. A control that
depends on order, or that reads-then-acts, does not"* — and A2AI-Orch verified each
control in code. **Four broken**: breaker 1's backwards walk; the budget ceilings'
read-then-act; `noOutputStreak`'s backwards walk, which lets one healthy
invocation between two dead ones un-refuse a broken runner; and `lanePause`, which
reads only the provider's most recent line, so a rate limit that hits every worker
at once never engages the pause — the normal shape of a 429 under three workers.
**Two sound**: `shedState`'s trailing window, and the ledger and build/test locks.
Each of the four is repaired here as spec text with a test that fails on today's
code; the scorecard is in D3.

Three refinements to the failure count, all shipped as requirement text: the
window is drawn only from failures and `done`, so `interrupted` — which is what
lock contention produces, and contention rises with workers — cannot pad it; the
new rule **also changes serial behaviour**, since `fail, done, fail, done, fail`
trips it and never tripped before, stated as intended because a 60% failure rate
on one type deserves a halt; and a trip stops **selection and publishing**, not
work in flight, so up to `W − 1` merges may land afterwards and none publish,
because `HOLD.md` is both the halt and the publish gate.

The reservation gained a release on every terminal path and an **expiry** keyed to
the job's wall-clock cap, so a killed worker cannot hold budget forever — the
stale-lock failure already paid for once here.

**`W` starts at 1**, not 3; 3 is the experiment, reachable once those four
controls pass. It is a config key the chain reads, so the condition is written
into the requirement rather than left to whoever makes the edit.

**Task 19 status**, for the record: A2AI-Orch has added `codex-gpt-luna-high` and
`codex-gpt-luna-xhigh` to `runners.yml` — 71 insertions, additive, **no
`job_types` yet**, because clearance lists belong with the measurement rather than
ahead of it. The registry parser reads all nine runners and conformance is running
against each. The `job_types`-per-rung half of task 19 stays open until those
results land.

**The Stage-0 baseline is taken** (`evidence/stage0-baseline.md`, A2AI-Orch,
n = 206 of 208 merged jobs), and taking it settled the definition F13 raised.
On the **new** definition, brief-commit → merge: wall-clock median **22.81 min**
all-time and 23.35 since 09-01, overhead **3.85 / 3.90 min**. On the **old** one,
brief-commit → records-commit: overhead **5.497 / 5.52 min**, reproducing
`desk-mech-report.md`'s 5.5 almost exactly — which validates the method rather
than adding a claim. Two consequences are written into the tasks. The overhead
threshold is **Stage 1's**, not Stage 0's: at 3.85 min, with the diet moving
prompt size and not wall-clock, Stage 0 has no mechanism that touches it, so its
own claim is `brief_chars` and one saved build, and 1.5 min is where the train's
gate sits. And the `brief_chars` comparator is the **recent window** — jobs since
2026-09-06, roughly 70,000–104,000 characters — not the all-time median of
**37,183**, which already sits below the 45,000 gate and would have made that gate
vacuous on the day it was written; the day series 16,181 → 33,491 → 70,349 →
103,881 is why.

One finding from the same measurement is recorded rather than acted on here:
**41 of the 206 merged jobs have no records commit anywhere in history**, their
records apparently riding the next Pulse commit. It is a defect in its own right,
filed as **`addictedtoai-l7cx`** (P2, bug), and it is one more empirical reason
the old definition was the wrong anchor — a fifth of the population had no
endpoint to measure to.

Round 4's record above; this record and the D3 scorecard credit both peer sessions
by name where the finding was theirs.

## Revision record — round 6

**Task 26 is done** — `evidence/bd-measurements.md`, committed at `e9ce346` — and
the Stage-3 choke point is now specified against measurement rather than against
the tabled draft's assumptions. Two results change a mechanism: a second `--claim`
by another actor **fails with exit 1**, so the claim is real mutual exclusion and
no second mechanism is needed to keep two runs off one issue; and **re-closing a
closed issue is a silent exit-0 no-op that discards the new reason**, so closure
must be verified by reading back — the draft's rule, now measured instead of
merely prudent. Four more stop an implementer guessing: `show --json` wraps in an
array; comment bodies need `--include-comments` and are absent from `list --json`
(**which is why the `h0z0` comment this whole split rests on was invisible to
every earlier scan**); `reopen` clears `close_reason`; metadata round-trips as JSON
objects and `--set-metadata` merges. One corrects this document: **200 ids in one
argv worked**, so the Windows note's "argv ceiling unmeasured" is withdrawn, and
metadata is objects rather than the string an earlier reading recorded.

**A safety finding nobody went looking for adds a clause.** `bd init --db <path>`,
from a process whose working directory sat inside this repository, auto-detected
the repository's real remote and **cloned the project's Dolt history into a second
store under the user profile**. The stray store was deleted; nothing under
`.beads/` was touched. The requirement now says the choke point pins the working
directory of every invocation to the store it addresses and refuses **before
spawning** when it is not, with a test that asserts on the spawn rather than on the
outcome. A tool that infers what it is addressing from where it was started will
eventually address the wrong thing.

**Three tasks ticked, one qualified.** 28 (`bd-measurements.md`); 29
(`evidence/README.md` carries an invocation line per script, and the
`orch-backlog-classify.mjs` gap it was also to record is closed rather than
recorded, the script having arrived in round 2); 30 (`evidence/stage0-baseline.md`
and `data/launch.json`'s `desk_baseline`, at `301f537`). Task 20's `CLAUDE.md`
half is done at `301f537` and its `runners.yml` `conformance:` fields are set at
`10be428`. (Task numbers here are the current ones; two Stage-0 tasks were
inserted in rounds 9 and 10, which shifted them.)

## Revision record — round 7

**The effort ladder was built, and the experiment produced a refusal rather than a
ranking.** A2AI-Orch committed task 19's first half at `10be428` — `runners.yml`
plus `data/conformance.json`, verified from the committed blob.
`codex-gpt-luna-high`: **four passes**, 7.03 model-minutes.
`codex-gpt-luna-xhigh`: **FAILED the fabricated-quote trap**, producing
*"The Institute publishes no benchmark numbers with this release and makes no
claim about response times."* — a sentence absent from the source it was given —
while `medium`, `high` and `max` all passed the same trap. The selector's own gate
refuses `xhigh` for author and review, verified by calling it, and the
`conformance:` fields read pass / FAIL.

So D7 changes: **review, the train review and revisions start at `high`**, which
is the maintainer's experiment and the rung that passed everything; **`max` is the
proven fallback** the ledger may raise to; and **`xhigh` is named for no role**.
Not "pending investigation" — a role assignment cannot rest on a status like that,
so the rung is simply not named, and the record carries the failure.

**The method rules are the durable part, and they are in the record on purpose.**
This is n = 1: one trap, one run. A **second run is a legitimate measurement**, and
one has been requested. **Re-running until it passes is not a measurement, it is
selection.** And if a second run passes, the record will read **"fabricated on 1 of
2 runs"**, never "passes" — a fabrication check is the last one whose failures may
be averaged away, because the defect it catches is the one this site exists to
avoid.

**A cost observation, held loosely and labelled so**: `high` at 7.03 mm is ~90% of
`max`'s 7.81 and `medium` ~65%, on four canned checks that are not a workload. If
that shape holds, the interesting gap is **medium-to-high, not high-to-max**. The
real comparison is the first-pass revise rate per rung on real jobs, which the
Stage-0 ledger fields exist to make computable.

**A tooling trap found in the same work**, now in the Windows notes, in the
requirement and in task 20: `loadConformance` given the wrong context shape calls
`existsSync(undefined)`, returns `{}`, and every runner then reads as "no record,
allowed". An absent record warns rather than refuses, by design and correctly — so
**a broken reader of the record is indistinguishable from a permissive gate**. Any
step that reads it programmatically asserts the record count it loaded first.

Task 19's second half — `job_types` per rung — remains open.

## Revision record — round 8

**The maintainer ruled against the ladder's middle, on the measurement.** Shown
`high` at 7.03 model-minutes against `max`'s 7.81 — about 90% — he said: *"If
going to high vs max only saves 10%, I'd rather just use max."* So the starting
rungs are **`medium` for `repair` and `interpret`, and `max` for every other type,
for all review, the train review and every revision** — his original instruction,
now confirmed against a measurement rather than assumed. `high` stays registered
and conformance-passing but is named by no policy; `xhigh` is named by nothing and
refused by its own record.

**The caveat travels with the ruling**: the 10% came from four tiny canned
conformance tasks, which are not a workload, and a gap that is small on a one-file
edit can be large on a blog post. **The ladder requirement itself is kept** — a
rung is a declared registry entry, and a rung rises or falls on the ledger's
first-pass revise rate per type and effort — so a later measurement on real work
can reopen `high` with a registry edit and a ledger reading, not a specification
change. The Stage-0 per-phase runner-and-effort fields are what would justify it.

**A correction inside the same round**, caught by A2AI-Orch and verified at
`runners.mjs:63-68`: `job_types` must be a non-empty list when present and
omitting it clears **every** type, so the registry cannot mark a rung
"unselectable by policy" — see round 10.

## Revision record — round 9

**The conformance record forgets, and forgetting is a way through a guardrail.**
A2AI-Orch found it during the `xhigh` re-run: `data/conformance.json` keeps **one
record per runner**, `loop/conformance.mjs` **overwrites** it, and
`conformanceGate` reads only the latest. So a runner that fails a check and is
simply run again has the failure **erased with no trace** — the record afterwards
is byte-identical to that of a runner which never failed. Re-running is therefore
sufficient to clear a conformance refusal: "loosen the guardrail that refused you",
implemented as a data structure, needing nobody to intend it. Today's instance
survives only because the record happened to be committed between the two runs.

The requirement now says the record **appends** — each run its own entry with date,
per-check results and model-minutes — and the gate reads the **history**, refusing
while any recorded FAIL stands unsuperseded, with supersession requiring **three
consecutive passes of that same check** (a starting value, stated as one). An
absent record still warns rather than refuses; that is a different state and the
requirement does not merge them. Filed as **`addictedtoai-2wwu`** (P1), whose two
acceptance clauses are lifted into the task: prove the **threshold** does the work
rather than the rewrite — the same FAIL-then-PASS fixture asserted refusing at
N > 1 and **allowing at N = 1**, the second arm demonstrating that N = 1
reproduces today's defect exactly — and preserve the absent-record warning
alongside the reader-count assertion.

**It is Luna-Boss-2's diagnostic seen from the other side.** *A control that counts
within a window survives concurrency; one that depends on order does not.* The
ledger survives because it **appends**; the conformance record fails because it
**overwrites**, and an overwriting record loses exactly the history an intermittent
failure needs to be visible. Credit to both sessions: Orch for the finding, Luna
for the frame it fits.

## Revision record — round 10

**The registry could not express what round 8's policy needed.** A2AI-Orch caught
the fail-open reading: an absent `job_types` means **cleared for every type**
(`select.mjs:132-134` returns ok on `!Array.isArray`; the comment at `:122` says
so), and an empty list is a load-time error. So leaving `codex-gpt-luna-high`
without `job_types` — the obvious way to write "registered but unused" — would have
made it **eligible for anything the escalation path reached**, which is the
opposite of the intent.

The registry therefore gains an explicit **`enabled: false`**, loaded by
`loop/lib/runners.mjs`, **absent meaning enabled** on the same fail-open convention
`job_types` uses and for the same backward-compatibility reason. The selector
refuses a disabled entry for both roles **before every other gate** — the registry's
own comment explains why the job-type gate sits first today, that the refusal line
a person reads should name the real reason, and a disabled entry has the stronger
claim to that position — and the escalation path never escalates onto one. The test
covers **both arms**, since a field whose default is wrong is worse than no field:
`enabled: false` refuses, and omitting it stays selectable.

Task 19's second half accordingly reads: `codex-gpt-luna-medium`
`[repair, interpret]`; `codex-gpt-luna` (max) unrestricted; `-high` and `-xhigh`
`enabled: false`. And D7 now states the split plainly — the **registry** declares
rungs, clearances and enablement; the **chain** declares the policy; the
**conformance gate** declares fitness. Until task 22 ships, `high` is unnamed **by
discipline rather than by mechanism**, and the artifacts say so, because a
discipline standing in for a mechanism is invisible until it lapses.

## Revision record — round 11

A second sealed Luna review (`evidence/reviews/round2-sealed-luna-max.md`).
**Its seal broke by its own report**: it read the revision records early while
checking a line count, and says so in its first paragraph. So it is not a strictly
independent second reading — and that is itself the proof of its own finding 4,
that an ordered-access seal is an instruction a careful reader breaks by accident.
Findings per kilobyte: round 1 **0.059**, round 2 **0.033**, with the reviewer's
own note that it read the core artifacts and specs in full while attention thinned
on the evidence reports. All nine dispositions accepted.

1. **BLOCKER — the verified SHA was contradictory.** The gates run over the
   pre-records tip; the records commit makes a new one; the publisher must push a
   SHA its gates ran over. Both readings were wrong: declaring the pre-records tip
   leaves the records unpublished, declaring the post-records tip declares a SHA no
   gate saw. Fixed: the records commit is **path-restricted by a machine check** to
   the review records, the ledger, the carried findings and the proposals; the
   train then re-runs build, `verify-launch` (reusing that build) and
   `verify-surfaces` on the post-records tip — about 35 seconds — and publishes
   **that** tip; and the train's record states both that the full set ran on the
   pre-records tip and that the delta touched only record paths. A records commit
   touching anything else fails the train.
2. **The Pulse-to-train handoff is now a mechanism, not a name.** The train works
   in its own worktree and merges `main` in **under the merge lock** — the same
   lock a worker takes to merge onto the integration branch. While a train is held,
   the Pulse keeps committing to `main` and publishing; the held train merges
   `main` in again and re-tests next cycle. Neither engine calls the other.
3. **The train's reading bound was measured before the bytes it bounds were
   final.** It counts content and code paths only; the recomputation writes only
   under the derived tree by construction; so the train now **asserts after the
   rederive that no counted path changed**, and the bound is final rather than
   merely early.
4. **The train-review seal becomes a redacted checkout.** The reviewer runs in a
   worktree from which the per-job verdict records have been **removed** — free,
   since that tree is discarded anyway — and any pass needing the verdicts is a
   separate invocation. Ordered access is an instruction; this is a mechanism.
5. **Train findings carry a structured `affects_merges:` list**, validated against
   a committed train manifest (`.train/manifest.json`: merge shas, job ids,
   subjects). A finding naming no valid merge is the whole-train case, because
   prose naming a merge is not a reference the eviction path can act on.
6. **Provenance.** `evidence/gate-timings-final.txt` carries the combined six-gate
   table and is what the artifacts now cite; the two partial files are kept as the
   record of its assembly. `evidence/stale2-report.md` carries an architect's
   correction — the table has 21 rows and the first totals accounted for 20,
   omitting `addictedtoai-4w2` — so that cohort reads **17 still valid**, and the
   whole 48-bead opening cohort is **42 valid, 5 partial, 1 fixed, with 47 of the
   48 still open at the check**. The proposal's sentence is corrected.
   The codex figures are replaced by a captured fixture,
   `evidence/codex-spend-2026-09-08.json`: the earlier 182.4M / 685K was read while
   three sessions were still running and was a **running total**. The same 48
   sessions final at **182,873,547 / 688,798**; all 67 at capture — **partial day,
   about 10:00 local** — at **238,067,103 / 828,209, 96.8% of input cached,
   286:1**. A2AI-Luna-Boss-2 corrected its own number to produce it.
7. **Stage 0's claim is narrowed to what is true**: no new module **in `loop/`**,
   nothing on the merge or publish path, **one standalone reporting script**.
8. **The derived-queue idempotence scenario asserted something two empty trees
   satisfy.** It now compares hashes over a **non-empty** tree against the engine's
   own derivation at that commit, with a mutation that skips derivation and must
   fail.
9. **Repeated train reviews are priced.** The per-train ledger line records
   train-review model-minutes **including re-reviews after evictions**, and the
   Stage-1 go/no-go compares gate seconds saved against review minutes spent, per
   train — which gives the drafter's own D2b objection a number to answer it.

**`xhigh`'s conformance is final, and it is worse than round 7 recorded.** A
second run was taken — the legitimate measurement, not a re-run until it passed —
and the rung **fabricated on 2 of 2 runs, with two *different* fabrications on the
one trap**: a fresh invented sentence, then a fragment. `medium`, `high` and `max`
pass the same trap. Commit `7790215`, and the round-9 recording rule was fixed
**before** the run. The result is also `addictedtoai-2wwu`'s evidence from the
other direction: even when a re-run **agrees** with the first, an overwriting
record shows one FAIL where two occurred, and the count is the thing a reader
needs.
