# Sealed Opus review — `two-desks-work-orders-and-trains`

Reviewer: sealed Opus, high effort, 2026-09-08. Nothing modified. Gates run:
`openspec validate … --strict --no-interactive` → **valid, exit 0**;
`node scripts/check-spec-deltas.mjs --strict --root D:/AddictedtoAI` → **0 errors,
1 warning** (a `stale-id` belonging to `keep-the-map-describing-the-territory`,
not to this change).

I did not read `arch-design-outline.md` or `arch-adjudication.md`, which sit in
the same scratchpad; they are the architect's outline and adjudication and the
brief seals me from them.

---

## 1. THE RESERVED PROPERTY — nothing publishes that a real reviewer has not read

Walked path by path.

| Path bytes take to the live site | Did a real reviewer read them? |
|---|---|
| Author writes on a job branch | n/a — nothing published |
| Per-job tripwire (`build`, `verify-surfaces`) | mechanical, not a reader; unchanged in kind |
| Per-job review gate | **YES, unchanged.** Separate invocation, fresh context, worktree discarded unconditionally, merge refuses without `approve`, record bound to bytes. The change touches none of it. |
| Merge `--no-ff` onto `train` | reviewed above; `train` is not published |
| Train full gate set | mechanical — but see the strengthening note below |
| Sealed train review | **YES, and it is new.** Fresh context, no edit rights, whole train diff, findings written before it sees any per-job verdict. An *additional* gate, explicitly not a substitute. |
| Fast-forward of `main` | mechanical; `main` only ever carries a train that passed both |
| The push | scoped to the train's verified commits — **but see F1** |
| `reviewed:` outcome, empty diff | **YES as specified** — the reviewer is handed each declared page's reviewed surface and no diff fence, with the gates section explicitly disclaiming evidence about the pages. **But the mechanism cannot produce the record it claims — F2 — and the byte bound that limits how much the reviewer must read is not enforced on this path — F5.** |
| A work order of N items | **YES**, and the `would-cite-for` entry-per-prose-piece rule is the mechanism that forces the reviewer to answer per piece rather than once for N. Honest limit stated by the drafter's own D1 objection: this is construction, not measurement. |
| W parallel workers | each is an ordinary `loop/run.mjs` run, so each inherits the review gate. **YES.** |
| The Pulse's own publish | model-free work, no review required; unchanged — but F1 |

**Verdict on the reserved property: PRESERVED, and in one place strengthened —
and the strengthening is not claimed.** `scripts/verify-launch.mjs:611` and
`:769` carry the review-state binding check over every reviewable piece
(`missing` = unreviewed, `mismatched` = reviewed then changed). **That check has
never run inside the Desk**: `loop/lib/gates.mjs:346` is
`['test','build','verify-surfaces','verify-design']` and `loop/run.mjs` has
exactly two `runGates` call sites, `:404` (that set) and `:1661`
(`{scripts:['build']}`). Putting `verify-launch` on the train puts the
reserved property's own detector into the automated path for the first time.
The proposal should say so; it is the strongest single argument in the change
and it is absent.

**One consequence of the change is a real loosening and is nowhere named — F12.**

---

## FINDINGS

### F1 — MAJOR (most serious). The publish-scope rule deadlocks the train and the Pulse against each other, permanently.
**Where:** `specs/pulse/spec.md`, *"A publish pushes only the commits its caller
verified"*, bullets 2 and 4; `specs/loop/spec.md`, *"Merges land on an
integration branch…"*, publish bullets; tasks 14–15.

**Evidence.** `pulse/lib/publish.mjs:931` is `git(root, ['push','origin','main'])`
— branch-wide, and it is the only push in the codebase; `loop/lib/publish.mjs:46`
routes the Desk through the same file. The new rule: *"Where the branch carries
any commit outside [the declared set], the step SHALL refuse the push."*

Sequence, all of it ordinary operation:
1. A train ff's `main` with T1…T5 and declares {T1…T5}.
2. A Pulse run commits P2 to `main` before the train reaches its push.
3. Train push: branch-beyond-remote = {T1…T5, P2}. P2 is outside its set → **refused**.
4. Pulse publish: branch-beyond-remote = {T1…T5, P2}. T1…T5 are outside *its* set → **refused**.

Neither actor may widen its declaration, and the loop's own recovery bullet —
*"the verified train SHALL remain on `main` locally and the next enabled train
SHALL carry it"* — cannot help, because the next train inherits P2. Publishing
stops for good and reports "nothing published" on every run. It fails **safe**
against the reserved property, which is why this is MAJOR and not BLOCKER; but
the only obvious operational escape is to widen a declaration or flip a flag,
which is the "loosen the guardrail to get past it" the repository forbids
everywhere, and the requirement offers no legitimate alternative.

**Fix.** Declare a verified **tree**, not a set of commits. The caller declares
the SHA its gates ran on; the step pushes `git push origin <verified-sha>:main`
and refuses only when that SHA is not a descendant of the remote tip. Every
commit reachable from the verified SHA was in the tree the gates examined, by
construction; anything that landed after it is simply not pushed and the next
run carries it. This is strictly stronger than the set rule (it cannot push a
commit the gates did not see), it needs no "at the moment of the push"
re-comparison because the remote enforces the fast-forward atomically, and it
dissolves the deadlock. Rewrite the requirement's four bullets around it and
recast task 15's third case accordingly.

---

### F2 — BLOCKER. The `reviewed:` outcome writes no review record at all; the approval it exists to produce cannot exist.
**Where:** `specs/review/spec.md`, *"A review of unchanged pages…"*, last bullet
(*"SHALL be bound by `subject:` and `reviewed:` exactly as a merging job's record
is"*); tasks 43–46.

**Evidence.** `loop/run.mjs:1580`:
```js
const subjects = joinableSubjects(changedPathsWithStatus(ctx.repoRoot, mergeBaseSha, branch));
const wrote = writeRecordSubjects(verdictPath(ctx, jobId, result.pass ?? 1), subjects, { repoRoot: ctx.repoRoot });
```
Subjects are measured **from the branch diff**. `review.mjs:1236`
`joinableSubjects([])` returns `[]`. `review.mjs:1284`:
`if (!subjects?.length) return { ok: false, why: 'no joinable content file merged' }`.
And `run.mjs:1594` logs the failure only `else if (subjects.length)` — so on an
empty diff the record is written with **no `subject:` and no `reviewed:` key and
nothing is logged**. `lib/reviews.mjs` cannot join that record to any piece, the
declared pages stay `mismatched`, and `verify-launch` stays red — which is
precisely the state this outcome exists to clear.

No task changes the subject-measurement path. Task 43 is `result.mjs`; 44 is the
brief; 45 is the hash gap; 38 is the merge-gate subset check. The requirement
says "exactly as a merging job's record is", and "exactly as" is the thing that
does not work here.

**Compounding, and it contradicts the design.** `design.md`, Spec collisions,
says of `let-the-queue-see-a-judgment`'s ADDED *"A review-mismatch job's merge
binds by the item it was dispatched at, not by its diff"*: *"if it never
archives, nothing here depends on it."* That is false — the `reviewed:` outcome
depends on exactly that mechanism, and that change has **0 of 24 tasks** started
(measured).

**Fix.** Add a task against `loop/run.mjs`: on the `reviewed:` outcome the
merge's subject set is the executor's declared paths intersected with the
committed `declared_subjects`, not the diff. State it in the requirement text
rather than delegating it to "exactly as". Remove the independence claim in the
collisions section or make it true.

---

### F3 — MAJOR. The bisect reduces to "revert the newest merge" in exactly the case cited to justify it, and task 9's Mutation B would not fail.
**Where:** `specs/loop/spec.md`, *"A red train is classified before anything is
reverted"*, bullet 3; `design.md` D2 red-path table; tasks 8–9.

**Evidence.** The cited shape is `addictedtoai-84s8`: the defect sits in an
earlier merge and surfaces only when a later one arrives. Take merges M1…M5 with
the defect latent in M2 and surfacing at M5. A bisect over the train's merge
commits is a **prefix** search: after M1 green, M2 green, M3 green, M4 green,
M5 red → first-bad = **M5**, the innocent merge. That is the same answer "revert
the newest merge" gives. So task 9's Mutation B — *"replace the bisect with
'revert the newest merge' and confirm only the earlier-merge case fails"* —
**passes with the bisect in place**, and the test proves nothing about the
property that is the bisect's whole reason for existing. The design says
*"'Drop the newest' would evict the innocent merge and leave the defect on
`train`"*, and its own mechanism does that.

**Fix.** Specify **leave-one-out over the full train**, not a prefix bisect:
revert each merge in turn from the complete set, re-run the failing gate, and
isolate the merge whose removal clears it. Whole-train rejection then becomes
genuinely reachable and genuinely meaningful (a true two-merge interaction).
Say it in the requirement text — "bisect" is the wrong word for the search that
answers the cited evidence.

**And price it, because nothing in the change does.** Leave-one-out over K = 5
running `npm test` is 5 × 314.8 s ≈ 26 minutes of gate time per red train, on
top of the retry. Two further costs the tasks miss: the classification re-run
must build the pre-train commit, which reintroduces the build task 4 deletes,
inside the red path; and `verify-analytics`/`verify-design` bind a port
(`gates.mjs:321-324` already records port collision as "a gate failure that has
nothing to do with the diff"), so the re-run and the train cannot overlap.

---

### F4 — MAJOR. The decision table has no answer for `pre-existing` × breaker 2, and the canonical case fires most nights.
**Where:** `specs/loop/spec.md`, *"A red train…"* bullet 2 and *"Breakers halt
the loop, and only the named ones"* item 2; task 31.

**Evidence.** Task 31 makes breaker 2 read **the train's** build. The
`pre-existing` row files an upkeep item, does not bisect, does not evict, does
not publish — and is silent about the breaker. The eviction exemption is written
(*"An eviction SHALL NOT write `HOLD.md`"*); `pre-existing` is not exempted.
Design D2's own evidence: *"all four recorded Pulse build failures are that class
and three of the four are the 00:00 run."*

So either (a) a `pre-existing` red build trips breaker 2 and the Desk writes
`HOLD.md` most nights — worse than today, where the census red hits the Pulse and
not the Desk queue; or (b) it does not, and the Desk goes on merging onto a
`train` that can never advance a `main` the same requirement calls *"always green
and always pushable"*. Neither is stated, and the two requirements are in the
same delta file.

**Fix.** State it. My recommendation: `pre-existing` does **not** halt — it marks
the train *held*, reports, and the next train re-tests; and the requirement must
say what bounds the merges accumulating on `train` while it holds. Also note that
this makes open question 5 less optional than it reads:
`bind-what-the-catalog-knows` is the structural fix for the canonical
`pre-existing` red and it is 0 of 25 tasks.

---

### F5 — MAJOR. The bounds are "enforced twice" against a diff, and on the outcome that has no diff they are enforced once — at selection.
**Where:** `specs/loop/spec.md`, *"One job is one work order…"*, bullet 3;
`design.md` D1 (*"the merge gate re-measures them against the actual diff"*);
task 38.

**Evidence.** The `reviewed:` outcome's diff is empty by construction — the
executor protocol says so explicitly (*"A `reviewed:` outcome with an empty diff
SHALL NOT be settled `failed` for emptiness"*). Re-measuring `B_total`,
`B_per_subject` and `S_max` against that diff measures **zero**, so the bound
whose stated purpose is to bound *reviewer reading volume* is checked only where
the work is chosen — the exact defect the bullet's own second sentence names:
*"A bound checked only where work is chosen is a bound an author can exceed."*
And this is the path where reading volume is **largest**: up to `S_max` = 4
**whole pages** rather than four diffs.

**Fix.** On the `reviewed:` outcome the merge gate measures the bounds against
the declared pages' **reviewed surfaces**, not the diff. One clause in the
requirement, one line in task 38, one case in task 46.

---

### F6 — MAJOR. The carried-findings cap of 2 is not defensible from the cited numbers, and by the change's own `occ0` standard it prevents almost nothing.
**Where:** `specs/review/spec.md`, *"A reviewer's non-blocking finding reaches
work without editing anything"*, bullets 1–3; `design.md` D4; tasks 21–23.

**Evidence — measured by me across all 407 records in `data/reviews/` on
2026-09-08:** 222 `carry:` entries in 143 records. Distribution of entries per
carrying record: **86 records with 1, 37 with 2, 17 with 3, 2 with 4.**

- A cap of **2** would have suppressed **24 of 222 entries = 10.8%**, in 20 of 407 records.
- **207 of 222 entries already name a `subject:`**, so "a subject SHALL be required" would have refused **15 of 222 = 6.8%**.
- The third bullet is honestly labelled as something *"the Pulse already
  supports"* — and it is: `pulse/lib/queue.mjs:436-459` already groups by
  `subject`. So D4's only genuinely new bound is the 10.8% one.

Against a channel measured at 37 filed / 35 retired in three days, that is ~31
filed instead of 37, against a tracker growing at ratio 1.43. The design deletes
`sweepExpired`/`discardDuplicate` because they *"never fired"* and quotes
`addictedtoai-occ0` — *"would have produced a guardrail that measurably prevents
nothing"*. The same measurement convicts this cap.

**Fix.** Either set the cap from the distribution with a stated target (a cap of
**1** suppresses 79 of 222 = 36%, which is a real bound and a real judgment
call — say so and let the maintainer refuse it), or drop the claim that D4
budgets inflow and move the inflow argument onto the deferral rule, which
`beads-report.md §B` measures at ~68% of filings. See also F-plan: task 68 is the
mechanical half of that rule and it is in Stage 3.

---

### F7 — MAJOR. "Six gates per job" and "three builds per merged job" are not true of the tree, and one deletion's justification is measured against a gate set the Desk does not run.
**Where:** `design.md` D2 heading and the deletion table's last row;
`proposal.md` *"a job pays for **three** builds today counting the post-merge one
(`run.mjs:1657`)"*.

**Evidence.** `loop/lib/gates.mjs:346` —
`DEFAULT_GATES = Object.freeze(['test','build','verify-surfaces','verify-design'])`,
asserted exactly by `loop/tests/job-gate-set.test.mjs:74`. `loop/run.mjs` has
exactly **two** `runGates` call sites: `:404` (that set) and `:1661`
(`{ scripts: ['build'] }`). `gates.mjs:293-296` states, deliberately, why
`verify-launch` and `verify-analytics` are excluded — *"`verify-launch` runs its
own build unless told not to, which would double every job's build cost."*

So a merged job pays **two** builds, not three, and **four** gates, not six.
`verify-launch`'s 39-second build is in no job's path. Consequences:

- The deletion row *"Two of the three go"* is one build too many.
- D2's heading *"A release train replaces six gates per job"* is false.
- Task 4, which the proposal calls *"a Stage-1 item that needs no train at all"*
  saving *"~39s per job"*, saves **nothing per job**. It saves ~39 s per **train**
  and per hand-run push gate. Real, but a tenth of the claimed scope.
- The 442.5 s six-gate total is the **push-bar** cost, not the job cost, and it is
  presented in the paragraph that argues per-job overhead. That is the one number
  in the proposal quoted without its qualifier.

**Fix — and the corrected arithmetic still carries the argument, which is why
this is worth doing rather than eliding.** Per job today: 314.8 + 29.2 + 3.7 +
35.7 + 29.2 (post-merge) ≈ **412.6 s**. Per job after ≈ **32.9 s**. Per train ≈
**403 s** with the launch-build reuse. K = 5: 2,063 s → 568 s, a saving of ~1,495 s
per five merges. State it that way and state the strengthening the change
actually buys (§1 above): the train runs `verify-launch`, whose review-state
binding check has never run inside the Desk at all.

---

### F8 — MAJOR. Parallel workers are specified without the two shared-state mechanisms they require: the job id and the ledger append.
**Where:** `specs/loop/spec.md`, *"The chain from intake to train lives in the
repository"*, concurrency bullet; task 62 (*"Concurrency on the existing build
and test locks plus the train's merge lock, and on nothing else"*).

**Evidence.** `loop/lib/ledger.mjs:173` — `nextJobId(ledger, now, existingIds)`
derives `j-YYYYMMDD-NN` from `data/ledger.jsonl` plus existing branch names. Two
workers selecting in the same window read the same ledger and the same branch
list and mint the **same id**, on an append-only file that the budget
(`jobSpendSoFar`), the breakers (`checkConsecutiveFailures`, `run.mjs:2082`) and
part of the queue (`scoutRanToday`) are all derived from. `appendLedger` is called
at `run.mjs:977`, `:1048` and `:1429` — including on `failed`, `blocked` and
`abandoned` paths that never reach the merge lock. Every worker also writes the
shared `data/carried/`, `data/proposals/` and `data/reviews/` in the one
repository root.

"Keyed on locks, never on a path" is the right principle and the fleet critique
is correct; the enumerated locks are not sufficient for `W` = 3.

**Fix.** Name a **selection lock** covering "read the ledger → mint the id →
create the branch → commit `.job/`" as one critical section, and say explicitly
whether the ledger append is inside it or takes its own. Add it to the
requirement, not only to task 62.

---

### F9 — MAJOR. Nothing says what a worker branches from once `train` is ahead of `main`.
**Where:** `specs/loop/spec.md`, *"Merges land on an integration branch…"*.

**Evidence.** Today `base` is `main` and `mergeBaseSha = mergeBase(repoRoot, base,
branch)` (`run.mjs:1353`). Under the train, `main` lags `train` by up to K merges,
and indefinitely on a held `pre-existing` red (F4). A worker branching from `main`
authors and is reviewed against a tree that will not exist when its work lands; a
worker branching from `train` authors against unpublished work whose review
records' `reviewed:` hashes bind bytes the train may still evict.

**Fix.** State it. `train` is the coherent choice — it is the tree the train's
gates will actually run over — and it forces a companion rule the change also
lacks: **an eviction invalidates the records of every merge that landed after
it**, since those hashes were measured over a tree that included the evicted
merge. The eviction bullet says nothing about the records of the survivors.

---

### F10 — MAJOR. Stage 1's headline "author brief ~100,000 → ~30,000 characters" has no mechanism that bounds it.
**Where:** `proposal.md` Staging; `specs/loop/spec.md`, *"The brief carries the
requirements the work order names, and nothing else"*; tasks 16–18.

**Evidence.** `BRIEF_EXCERPT_MAX_CHARS` is **88,000** in `loop/lib/config.mjs`
today (measured). Task 16 deletes pass 2b; task 17 stops dividing the per-source
budget across unarchived changes, which *raises* what passes 1 and 2 may each
spend; **no task lowers the constant**. Task 18's assertion is *"the same excerpt
set … and leaves budget unspent"*, which a 70,000-character brief satisfies. The
only thing that touches 30,000 is task 34's Stage-2 gate, which **measures**
`brief_chars` after 20 jobs rather than bounding it. The change measures the claim
it was meant to enforce.

**Fix.** Restore `BRIEF_EXCERPT_MAX_CHARS` to a measured value as a Stage-1 task,
and make task 18 assert an upper bound on the assembled brief, not merely unspent
budget. Minor rider: deleting pass 2b will make `specs.mjs:335`'s `truncated` flag
true far more often, which changes the brief's "read the full files" guidance —
no task covers it.

---

### F11 — MAJOR. Retiring `DIRECTIVES.md` does not fix `addictedtoai-bfn0`; it renames it.
**Where:** `design.md` deletion table, row 1; `specs/loop/spec.md`, *"Work comes
from one intake…"*, band order; tasks 57, 66.

**Evidence.** The deletion is justified because *"a directive outranks the entire
derived queue, so one unrunnable line starves everything: `j-20260906-10` burned
5.07 model-minutes and wrote no `RESULT.md` while 26 queue items waited."*
`loop/lib/select.mjs:90` gives directives `priority: 1` and `:98` gives the queue
`priority: 3`. After migration, routed beads are source **1** and the derived
queue source **2** — so one unrunnable P1 routed bead starves the queue in exactly
the same way, at the same cost per run. The only protection added is the scout
floor, which protects **one** queue item.

**Fix.** Either generalise the floor honestly (after N consecutive runs in which
the queue was reachable and not reached, the queue is offered), or drop the claim
that this retirement addresses `bfn0` and file the general starvation as its own
bead. As it stands the change deletes the mechanism and keeps the failure.

---

### F12 — MAJOR (unnamed consequence). The `reviewed:` outcome is a ratification channel for edits made outside the Desk, and no artifact says so.
**Where:** `specs/loop/spec.md`, executor result protocol, `reviewed:` bullets;
`specs/review/spec.md`, *"A review of unchanged pages…"*.

**Evidence.** The precondition is that each declared path *"already reads
`mismatched` against its current review record at the job's merge base"* — that
is, a published page whose bytes a **non-Desk actor** changed. The proposal's own
§4 (routing bottleneck) argues that because records bind to bytes, *"a non-Desk
actor may only CREATE or touch CODE"*. This outcome removes that constraint: an
orchestrator session, a fleet worker or the maintainer edits published pages, and
one Desk work order then ratifies up to `S_max` = 4 of them in a single review
pass.

The **reserved property survives** — the reviewer is handed each page's reviewed
surface with no diff fence and a gates section that disclaims evidence about the
pages, so a real reviewer really does read the bytes. But it is the largest new
surface in the change, it is exactly the property the maintainer reserved, and
today it is reachable only by composing three bullets across two delta files. The
mission bead's defended item (b) says the byte binding *"is the one most likely to
be proposed away"*; this does not propose it away, and precisely for that reason
it should be named as the deliberate, bounded loosening it is.

**Fix.** Name it in `proposal.md` "What changes", with its two bounds: the
per-subject byte bound applied to the reviewed surface (F5) and the
`would-cite-for` entry per piece.

---

### F13 — MAJOR. The Stage-2 decision rule compares two different quantities.
**Where:** tasks 34 and 49; `proposal.md` Staging.

**Evidence.** Task 34's rule: *"after 20 merged jobs under Stage 1, if the
ledger's median brief→records overhead is not below 2.5 minutes …"*. The
pre-change baseline is `desk-mech-report.md §A`'s **5.5 min median overhead**,
measured brief-commit → records-commit **per job**. Under Stage 1 the records
commit becomes **once per train** (`specs/loop`: *"A train run SHALL be, in this
order: … the records commit; the publish"*) while the ledger line stays per job
(task 32). So "brief-commit to records-commit" after the change spans up to K
merges and a full train, and is not the same quantity as the baseline it is
compared against. The gate on whether Stage 2 happens is measured against a
mismatched before-value.

**Fix.** Define the Stage-1 measure as **brief-commit → merge-onto-`train`** per
job, plus a separate per-train figure, and restate the 5.5-minute baseline on the
same definition (it is recomputable from the same script). See also the plan
split in §4, which takes the baseline before the records commit moves.

---

### F14 — MINOR. "Eleven headings" is twelve.
`design.md`, Spec collisions: *"This change touches none of those eleven
headings."* Measured with the repository's own parser (`readLiveChanges` from
`scripts/check-spec-deltas.mjs`): `let-the-queue-see-a-judgment` 4,
`keep-the-map-describing-the-territory` 4, `bind-what-the-catalog-knows` 4 =
**12**. The enumeration itself is complete and correct, heading for heading, and
**the collision claim is REPRODUCED**: no heading is shared, and
`check-spec-deltas.mjs --strict` returns 0 errors. Only the count is wrong. The
`tasks.md` count table (loop 11/8/2, review 2/2/0, pulse 2/0/0, total 15/10/2) is
**exactly right** against the same parser.

### F15 — MINOR. The `B_total` bound's source line does not contain the number.
The bounds table cites *"review-diff p90 = 55,034 (`review.mjs:744`)"*.
`review.mjs:744` is the 200 KB diff truncation
(`diffText.length > 200000 ? …`). The p90 is measured at `desk-mech-report.md:123`
— *"the diff (median 8,101 chars, p90 55,034, truncated at 200,000 —
`review.mjs:744`)"* — where the source citation belongs to the truncation clause
and has been carried across to the wrong figure. The number is real; the
attribution is not, and `design.md` opens by promising *"Every number here has a
source named beside it."*

### F16 — MINOR. The branch census is wrong in both directions.
`design.md` D3 / deletion table: *"224 branches at 2026-09-08 of which only ~24
are `job/*`; the rest are `fl/*`, `fleet2..5/*`, `impl/*`."* Measured
2026-09-08: **204 local + 21 remote = 225**; `job/*` = **38**, not ~24;
`fl*` + `fleet2..5/*` + `impl/*` = **32**; and the largest category by far,
unmentioned, is **`loop/*` at 121**. The fleet's own branch footprint is 30, not
"the rest". The argument for the fleet being ungoverned does not need this number,
and as written it overstates the fleet and understates the Desk.

### F17 — MINOR (but with a measured cost). A SHALL with a scenario and no task.
`specs/loop`, *"The chain from intake to train…"*: *"Worktree teardown SHALL
refuse rather than force a removal it cannot complete"*, with the scenario *"A
junction that will not unlink refuses the removal"*. `loop/lib/git.mjs:116` still
reads `gitTry(repo, ['worktree','remove','--force', dir])`. No task in 62–63 or
anywhere else names `git.mjs`. This is the requirement whose absence deleted 177
packages from the real `node_modules` (design's own Windows note, commit
`1461822`).

### F18 — MINOR. Two near-vacuous scenarios.
- *"Quiescence is proved, not assumed"* — **WHEN** the pause procedure is followed
  **THEN** the check reports that no worker process remains. No input, no
  falsifiable output; it asserts a check exists and returns true, and can fail
  only by absence. Rewrite: **WHEN** the pause procedure is followed and one worker
  process is still alive **THEN** the check names that worker's pid and the chain
  is not declared stopped.
- *"The registry's note follows the record"* — **THEN** *"the note is corrected to
  match it"*. Task 25 confirms that correction is orchestrator work between runs,
  not an output of any run, so half the THEN is unobservable. Keep the first
  clause (the record governs selection) and drop the second, or make it a check.

### F19 — MINOR. "Prose piece" is undefined and it decides a merge refusal.
`specs/review`: *"Where the merged subjects hold more than one prose piece, the
record SHALL carry a `would-cite-for` list … a piece among the merged subjects
left with no entry … is refused."* The companion `reads-human` rule anchors
explicitly on `content/blog/` posts; `would-cite-for` anchors on nothing, and
`joinableSubjects` (`review.mjs:1243`) admits any `content/**.md` — directory
rows and data-shaped pages included. Name the predicate, or the merge gate
refuses on a category no implementer can enumerate the same way twice.

### F20 — MINOR. Task 51 creates `loop/lib/beads.mjs` without naming `loop/lib/issues.mjs`, which already owns half the requirement.
The MODIFIED requirement's first two bullets — define the id format in exactly one
place; split validation into format and existence, the format check usable inside
`next build` — are already implemented: `loop/lib/issues.mjs:1-56` states exactly
that split and exactly the Vercel reason. Task 51 should say it adds the
**invocation** choke point beside the existing **format** module, or an
implementer builds a second id definition and the requirement's "exactly one
place" becomes false on the day it ships.

### F21 — MINOR. The retry-once policy does not say what the train retries.
*"The retry-once policy SHALL apply per gate stage: once for a job's tripwire,
and once for a train's full set."* Today `runGates` re-runs *"the same scripts, in
the same worktree"*. On a train, re-running the whole set after `npm test` fails
costs 442 s of which 315 s is the gate that failed. Say whether the retry is the
failing gate or the set.

---

## 2. CORRECTNESS AGAINST THE TREE — what checks out

Reported as findings above where it does not. What does:

- **`.job/source.json` exists, is loop-authored, is committed at selection before
  any executor runs, and already carries `issues: []`** — `run.mjs:1329-1351`
  (design cites `:1330-1352`, off by one at each end). Its comment already makes
  the change's own argument: *"a mechanism that had to parse the prose of a brief
  to find a file path would be guessing."* Task 39's Mutation B is the best
  mutation in the file.
- **Records already scale to N pieces.** `writeRecordSubjects` (`review.mjs:1283`)
  renders `subject:` as a scalar for one and a YAML list for many (`:1325-1329`)
  and `reviewed:` as a path→hash map (`:1330-1334`). ✔
- **Merge-gate set equality** (`review.mjs:1086-1104`) compares the record's
  `reviewed:` keys against the subjects the merge measured. It is orthogonal to
  the new `declared_subjects` **subset** rule (task 38), which constrains the diff
  rather than the record — the two do not conflict, and the design is right that
  the equality survives untouched. ✔
- **`existingFieldValues`** (`review.mjs:784`) already walks `Array.isArray(val)`
  entry by entry (`:798-799`) and already excludes same-job records (`:789`), so
  per-entry `would-cite-for` duplicate checking reuses the existing path exactly
  as claimed, and the "two entries in one record may match" rule falls out for
  free. ✔
- **The ledger's additive-field rule.** `LEDGER_FIELDS` is 8 required keys;
  `makeLedgerLine` (`:85-113`) adds `note`, `signal`, `phases`, `issues`
  conditionally. `items`, `brief_chars` and `gate_seconds` are additive on
  identical terms and task 30's mutation (extend `LEDGER_FIELDS`, watch the
  old-line test go red) tests the right property. ✔
- **`categoryOf`** `config.mjs:355` ✔, **`invocationAllowance`** `budget.mjs:158` ✔,
  **`proposalCapFor`** `proposals.mjs:77` ✔, **`checklistFor`** `review.mjs:381` ✔,
  **breaker 1** `run.mjs:2082` ✔ (counts only `failed`/`discarded`, so the
  `evicted-at-train` exemption is well-formed), **pass 2b** `specs.mjs:317-330` ✔,
  **`candidates[0]`** `select.mjs:233` ✔, **carried-findings comment**
  `select.mjs:30-44` ✔ verbatim, **portability scan** `portability.test.mjs:85`
  (design says `:86`; the test opens at 85) ✔, **`verify-launch.mjs:832/:847`**
  ✔ exactly as described, **`build-lock.mjs:116-117`** — *"The residual risk is pid
  reuse inside the staleness window"* ✔, so "the train's lock must carry more than
  a pid" is correctly derived.
- **`pulse/lib/publish.mjs:931`** is `git(root, ['push','origin','main'])`,
  branch-wide, and `loop/lib/publish.mjs:46` routes the Desk through it. The
  `zuoo` diagnosis is exactly right; only the proposed remedy is broken (F1).
- **`data/config.json` has no unknown-key rejection**, so adding `work_order.*`
  and the train sizing (task 36) will not fail validation. ✔

---

## 3. COMPLETENESS

**Verified by my own script, not by reading the claim.** All 25 ADDED+MODIFIED
headings across `loop` (11+8), `review` (2+2) and `pulse` (2+0) appear in the
count section's mapping, and the two REMOVED are attributed to tasks 35 and 57.
Tasks are numbered 1–72 with no gaps. The claim holds.

**SHALLs with no task:** F17 (worktree teardown, and it has a scenario);
F2's binding clause (*"bound by `subject:` and `reviewed:` exactly as a merging
job's record is"*); *"Where publishing is disabled, or the push is refused, the
verified train SHALL remain on `main` locally and the next enabled train SHALL
carry it"* (no task); *"An issue becomes selectable only when it is routed — the
routing label plus the required fields"* (task 68 lints subject/requirement, not
the label).

**Vacuous scenarios:** F18, two of them.

**Tasks with no requirement:** none found. Task 36 (`data/config.json` keys) and
tasks 24/25/67 (`CLAUDE.md`/`AGENTS.md`) are correctly labelled orchestrator work
between runs, which is right — a job may not touch either path.

**Mutation quality is high and is the best part of the tasks file** — 28 named
mutations, and several are genuinely adversarial (task 39B's substring-defeat
fixture; task 28's control arm; task 30's additive-field mutation; task 61's
"this is today's behaviour and the 72-model-minute measurement it produced").
**One is broken: task 9 Mutation B (F3).** One more is weaker than it looks:
task 5's mutation ("make the presence check always return false") tests the
branch, not the saving; add an assertion that no `next build` process was spawned.

---

## 4. THE PLAN

**Stage 1 is not small, and the proposal's own sentence is contradicted by its
own tasks file.** `proposal.md`: *"Stage 1 is deliberately four items, no new
module, no selection change, and no new concept."* Stage 1 contains a **new
module** (`loop/lib/train.mjs`, tasks 6, 8, 13, 32), a new integration branch, a
new merge lock, a new red-path classifier with a search, a new sealed train review
with its own brief assembler (task 11), a rewritten contract on the shared publish
step (task 14), and a repointed breaker 2 (task 31). The train is the single
largest new mechanism in the change and it is inside the stage labelled small.

**Where I would split it.**

- **Stage 0 — genuinely one session, genuinely no new module, and it is where the
  measurements come from.** Tasks 4–5 (`verify-launch` build reuse), 2–3 (the gate
  floor check), 16–20 (the brief diet) **plus a task lowering
  `BRIEF_EXCERPT_MAX_CHARS`** (F10), 25–30 (conformance correction, runner policy,
  escalation, ledger fields). Every one is a local edit to an existing file with a
  test and a mutation. This stage produces `brief_chars`, `gate_seconds` and
  runner-and-effort-per-phase — the fields everything downstream is measured with
  — and it takes the before/after baseline **while brief-commit → records-commit
  still means what it meant in `desk-mech-report.md`, which is what fixes F13.**
- **Stage 1 — the train alone, at `W` = 1.** Tasks 1, 6–15, 31–33, with F1's
  push-by-SHA rewrite, F3's leave-one-out, F4's halt semantics and F9's branch
  base. One worker is the whole mechanism minus the concurrency, and it is the
  honest place to discover what a red train actually costs.
- **Stage 2 — work orders**, as drafted, plus F2 and F5.
- **Stage 3 — intake, the two desks, `W` > 1**, as drafted, plus F8's selection
  lock.

**Two Stage-3 items belong earlier.** Task 68 (intake's filing lint) is the
mechanical half of the only inflow bound that the numbers support (F6) and the
change's own Stage-1 rationale for D4 — *"the deferral rule makes inflow a
function of throughput, so any throughput gain multiplies filing"* (A2AI-mem-cond)
— argues for it directly. And task 50 (*measure `bd` before mocking it*) costs
nothing, blocks nothing, and should not wait two stages.

**The seven starting bounds.** `K` = 5 (from the fleet's every-5 batch review) and
`W` = 3 (one build lock, one machine) are defensible. `T` = 90 min ("≈ one job per
79 min observed") is defensible. `N_max` = 4 is *"conservative; the hand-batched
directives ran 2–3"* — a practice, not a measurement, and the proposal should say
so rather than putting it in a table of derived numbers. `S_max` = 4 rests on
Luna's argument, not a measurement, which the table says. `B_total` = 60,000 is
above a real p90 but cited to the wrong line (F15). `B_per_subject` = 30,000 has
no cited derivation at all — it is half of `B_total`, and the table's "Where it
came from" column says only *"Orch: a total says nothing about distribution"*,
which justifies the bound's **existence** and not its **value**.

---

## 5. THE THREE COMPLAINTS

**Complaint 1 — CONFIRMED.** The verdict follows and every load-bearing number
reproduces: 52.9% (110/208), median wall 24.3 min, median mm 18.4, median $3.20
(`ledger-report.md` §B/§C/§F), 5.5-min median overhead / 25.9% of wall-clock
(`desk-mech-report.md` §A). Orch's 1.45× is carried **with** its qualifier —
*"a ceiling, not a measurement, on Orch's own statement"* — which is exactly
right and exactly what the bead demanded. **One number is quoted without its
qualifier: the 442.5 s six-gate total, presented in the paragraph arguing per-job
overhead, when a job runs four of the six (F7).**

**Complaint 2 — CONFIRMED over the span, PARTLY REFUTED in shape.** The verdict
follows, and this is the most careful section in the proposal. Both caveats travel
(`updated_at` proxy for `closed_at`; open read 100 at 13:56 UTC and 101 ninety
minutes later, hence the moment attached to each point-in-time total). It
correctly **adopts `stale-report.md`'s corrected cohort of 27** over the mission
bead's 37 and reports 25 valid / 1 partial / 1 already fixed — reproduced exactly
from that report's Totals section. Correctly says the trend is more trustworthy
than any cell.

**Complaint 3 — CONFIRMED in wall-clock and model-minutes, PARTLY REFUTED on
tokens.** The 266:1 headline is immediately qualified by 96% cached and ~127 K
uncached per cold start, and the conclusion drawn — *"token count is the wrong
thing to batch for"* — is the honest one and cuts against the proposal's own
interest. The $1,057 Desk figure is labelled a floor with **both** reasons (40 of
240 job ids unpriced; the sweep is *consistent with* rather than *independent of*
the ledger join). No qualifier omitted here.

---

## 6. WHAT I WOULD DO DIFFERENTLY — the strongest alternative per decision

- **D1.** Not considered: **batch the review, not the job.** Keep one item per job
  and let one reviewer invocation read N merged branches back to back in one
  context load. That captures most of review's 20% share and all of the
  reviewer-orientation win, with **zero** change to `mergeGate`,
  `writeRecordSubjects`, `would-cite`, `.job/source.json`, the ledger shape, or
  the `zrsg` binding hazard the drafter's own D1 objection admits is answered by
  construction rather than by measurement. The only alternative the design weighs
  is the tabled one-bead-per-job draft.
- **D2.** Two. First, **push the verified SHA, not the branch** (F1) — strictly
  stronger, atomic, deadlock-free. Second, and unconsidered: **overlap the gates
  with the review.** The gates are 100% machine time and run *before* review1,
  which is 20% of all model-minutes. Running them concurrently removes comparable
  wall-clock per job with no integration branch, no red path, no search, no
  eviction, no merge lock and no new module. It should have been priced and
  refused, not omitted.
- **D3.** Not considered: **do not build the second desk.** D3b concedes the split
  makes the back desk *slower*, and open question 1 asks whether the split was even
  read correctly from a single `h0z0` comment. The mission explicitly licenses
  *"build or explicitly not build"*. One lane with the machinery ceiling already
  does the dividing; the intake router, the verifier and the bundler are the
  valuable parts and none of them needs two desks.
- **D4.** Not considered: **budget the deferral rule instead of the carry
  channel.** ~68% of filings cite a review finding, a Desk job or the deferral rule
  (`beads-report.md §B`); the carry cap suppresses 10.8% (F6). The lever is task
  24 + task 68, and task 68 is in Stage 3.
- **D5.** Not considered: **bound the brief by the job's own declared subjects
  rather than by requirement keyword matching.** The declared subjects are
  committed at selection, so the governing requirement set is closed and small.
  The change half-does this and then leaves an 88,000-character ceiling above it.
- **D6.** Not considered: **keep the fleet as an explicitly ungoverned lane with a
  ledger line, until the back desk can afford its work.** The change's own evidence
  is that the fleet did the five largest machinery lines *because the 10% ceiling
  refused all five*. Retiring it while leaving the ceiling to open question 4
  removes the only channel by which that class of work has ever been done. "Retire
  it" and "we have not decided whether the replacement can afford it" should not be
  in the same change.
- **D7.** Not considered: **compute the workflow-adjusted cost per merged job per
  runner×type cell, which the ledger already supports.** The policy takes
  `luna-medium` on `repair` because it is the cheapest **mm/job** cell (18.3), and
  the same row is the **worst agreement-with-reviewer** cell in the table
  (5/15 = 33%, against deepseek 14% and opus 3% on the same type). D7's own
  paragraph prices a revise at 7.0% + 3.5% of all model-minutes. Pairing the
  cheapest raw cell with a prose caveat is not the same as doing the sum, and the
  sum is one script over `data/ledger.jsonl`. I reproduced all four rows of that
  table exactly, so the data is there.

**Guardrails removed or weakened that the design does not name as removed:**

1. **The per-merge integration build.** Task 1 deletes the post-merge build
   (`run.mjs:1657`) and task 31 repoints breaker 2 at the train's build. Between a
   merge onto `train` and the train's run, **nothing builds the merged tree** — the
   job's tripwire built its own branch, not the merge result. The post-merge build
   is today the thing that catches a merge green on both sides and red combined;
   after the change that class is caught K merges later and then has to be searched
   for (F3). The deletion table names the build as deleted and does not name the
   property that goes with it.
2. **The practical "only the Desk may edit a published page" constraint** — F12.
3. **`verify-launch` and `verify-analytics` were never job gates** — the change
   *adds* them to the automated path. A strengthening, unnamed (F7, §1).
4. Correctly named: `data/config.json` gains tunable keys while staying reserved;
   the delta states it explicitly and repeats that no job may edit it. ✔

---

## 7. THE OPEN QUESTIONS

1. *Is the front/back split read correctly from `h0z0`?* — **His.** Correctly
   asked; it rests on one comment.
2. *The bounds as tunable config, not budget bounds.* — **His**, and the change
   defends the position properly (reserved path, ledger-measurement rule, no job
   may edit). Rider: two of the seven values he is being asked to bless have a
   citation that does not contain them or no derivation at all (F15, §4).
3. *Does the fleet retire at Stage 1 or Stage 3, and is the machine Luna-first from
   Stage 1?* — **This is the change's, and it has already answered it.** Task 67
   puts the retirement in Stage 3; task 26 puts the runner policy in Stage 1. Asking
   afterwards invites an answer the plan cannot take without re-staging. Decide it
   — the front-desk workers that replace the fleet do not exist until Stage 3, so
   the fleet cannot retire before them — state that reason, and let him overrule.
4. *Raise the machinery ceiling, or accept a small back desk?* — **His**; it is a
   budget bound and the specs reserve those. But D3b already did the arithmetic and
   found it does not close, so the change should carry a **recommendation** with
   that arithmetic rather than handing him the sum to redo.
5. *Limit the back desk to finishing the three open changes first?* — **His**, and
   it is the best question in the list. F4 makes half of it less optional than it
   reads: `bind-what-the-catalog-knows` fixes the canonical `pre-existing` red, and
   until it lands the train's most frequent red path is the one whose halt
   semantics the change has not decided.

---

## THE SPOT-CHECKED NUMBERS

| # | Claim and where | Checked against | Result |
|---|---|---|---|
| 1 | D7 / task 25: `data/conformance.json` carries **seven** runners; six pass all four checks; `opencode-openrouter-muse-spark` fails all four; `codex-gpt-luna` 2026-09-07T15:46:57Z, `codex-gpt-luna-medium` 2026-09-07T22:10:07Z | `data/conformance.json` | **REPRODUCED**, exactly, including both timestamps to the second. `CLAUDE.md` does still say four runners and call `codex-gpt-luna` a FAIL — the third time that paragraph is wrong, as task 25 says. |
| 2 | Task 26: `codex-gpt-luna-medium.job_types` = `[interpret, verify, entry, tutorial, education, repair, prune, machinery]`; every `conformance:` field reads `unverified` | `runners.yml:247`, `:127/:143/:158/:253/:323/:372/:437` | **REPRODUCED**, exactly. |
| 3 | D7 runner table: deepseek n=114 / 93% / 20.1 mm; opus n=88 / 86% / 23.2; luna-medium n=25 / 72% / 21.5; luna-max n=10 / 70% / 24.1 | `data/ledger.jsonl`, recomputed by author phase | **REPRODUCED**, all four rows to the decimal. (Ledger is now 243 lines vs the bead's 242; done 208, 85.6%; author+revision share 76.3% vs the bead's 76.5% — one line of drift, not an error.) |
| 4 | Deletion table: `DIRECTIVES.md` "169 lines / ~132 KB, 56 directives" | the file | **REPRODUCED**: 169 lines, 131,951 bytes, 56 bullets. |
| 5 | Proposal: the three open changes carry "78 tasks with zero started" | the three `tasks.md` files | **REPRODUCED**: 25 + 29 + 24 = 78, none ticked. |
| 6 | Proposal: the 08-31 cohort is 27, "25 still valid, 1 partial, 1 already fixed" | `stale-report.md` Totals | **REPRODUCED** exactly (27 table rows; STILL-VALID 25 / PARTIAL 1 / FIXED 1 / MOOT 0 / CANNOT-TELL 0). Credit: the proposal adopts the report's corrected cohort of **27** over the mission bead's 37. |
| 7 | "No heading is shared with the three unarchived changes"; `tasks.md` count table 15/10/2 | `readLiveChanges` + `readLiveSpecs` from `scripts/check-spec-deltas.mjs`; `--strict` run | **REPRODUCED**: no shared heading, 0 errors under `--strict`, count table exact. The word "eleven" should be twelve (F14). |
| 8 | Design/proposal: "a job pays for **three** builds today"; D2 "replaces **six gates per job**" | `gates.mjs:346`, `job-gate-set.test.mjs:74`, `run.mjs:404` and `:1661` | **NOT REPRODUCED.** Four gates, two builds. `verify-launch` is in no job's path (F7). |
| 9 | "224 branches … only ~24 are `job/*`; the rest are `fl/*`, `fleet2..5/*`, `impl/*`" | `git branch` / `git branch -r` | **NOT REPRODUCED.** 225 branches; `job/*` = 38; fleet-family = 32; `loop/*` = 121 (F16). |
| 10 | Bounds table: "review-diff p90 = 55,034 (`review.mjs:744`)" | `review.mjs:744`; `desk-mech-report.md:123` | **Number REPRODUCED; citation NOT.** `:744` is the 200 KB diff truncation (F15). |
| 11 | D4: carried findings are the uncapped inflow — "37 filed against 35 retired, 76% onto a file already carried" | `select.mjs:30-44`; and independently, all 407 records in `data/reviews/` | Cited comment **REPRODUCED verbatim**. The **cap of 2 drawn from it is not supported**: 222 entries in 143 records, 86×1 / 37×2 / 17×3 / 2×4 → the cap suppresses 24 of 222 (10.8%), and 207 of 222 already name a subject (F6). |

---

## OVERALL VERDICT

**Revise before implementation.** This is careful, unusually honest work — the
drafter's own objections (D1, D2, D3a, D3b) name the three places where the design
is weakest, the qualifiers on the borrowed numbers survive intact, the collision
analysis is right and machine-checkable, the mutation discipline in the tasks file
is the best I have seen in this repository, and both gates pass. Eight of the
eleven numbers I chose to check reproduce exactly, including all four rows of the
runner table and the conformance record to the second. And the reserved property
survives every path I could walk, which is the one question that fails a change
outright: it does not fail. But three defects sit inside mechanisms the plan
builds early and would only be discovered after they were built. **F2** is
build-failing on its own terms — the `reviewed:` outcome cannot write the record
it exists to write, because `run.mjs:1580` measures subjects from a diff that is
empty by construction, and no task touches that line; the design's claim that
nothing here depends on `let-the-queue-see-a-judgment` is the same error stated
twice. **F1** would silently and permanently stop publishing the first time a
Pulse commit interleaved with a train, and the fix — declare a verified SHA and
push `<sha>:main` — is smaller and stronger than what is written. **F3** is the
sharpest: the bisect answers the newest merge in precisely the `84s8` shape the
bisect was added to answer, and task 9's Mutation B would not catch it, so both the
mechanism and its proof are wrong together. Add **F4** (the halt semantics of the
red path the design says fires most nights), **F5** and **F6** (a bound checked
only at selection; a cap measured, by me, to suppress 10.8% of the channel it is
supposed to budget), **F7** (four gates and two builds, not six and three, which
moves the deletion table's justification and the entire framing of task 4), and
**F8–F10** (job-id and ledger races at `W` = 3; no stated branch base under a
train; a headline brief target with an 88,000-character ceiling still above it),
and the honest conclusion is that Stage 1 as staged is the largest new mechanism
in the change wearing a small label. Fix F1–F3 in the artifacts, decide F4, close
F5 and F7, re-value or re-argue F6, and re-stage on the Stage-0/Stage-1 split in
§4 — then this is approvable, and most of it will not need rewriting.
