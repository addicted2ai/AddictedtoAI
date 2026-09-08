# Sealed Opus — closure check on rounds 1 and 2

Read-only. Validators re-run on the revised artifacts:
`openspec validate … --strict --no-interactive` → **valid, exit 0** (10.3 s);
`node scripts/check-spec-deltas.mjs --strict --root D:/AddictedtoAI` → **0 errors,
1 warning** (the same `stale-id` belonging to `keep-the-map-describing-the-territory`).
Heading enumeration re-run with the repository's own parser: loop 11 ADDED /
8 MODIFIED / 2 REMOVED, review 2/2/0, pulse **1/1/0** — matching the revised count
table exactly, and `The Pulse publishes what it builds` is named by no other
unarchived change, so the pulse surface's move from ADDED to MODIFIED introduces
no collision.

## Closure of F1–F21, §4, §6

| # | Status | What closes it |
|---|---|---|
| **F1** publish-scope deadlock | **CLOSED** | `specs/pulse` MODIFIED *The Pulse publishes what it builds*, bullet 3: the caller declares "the commit SHA its gates ran over", the step pushes that SHA, refuses only on non-descendant. Tasks 43, 44 (both callers), 46 Mutation A (push the branch instead of the SHA → the later-commit case fails). The deadlock argument is written into the delta preamble (:9-20). It also closes the harder half I did not ask for: the Pulse's own commit lands on `train`, so `main` has exactly one writer and "nothing else pushes" becomes true rather than aspirational. |
| **F2** `reviewed:` record binds nothing | **CLOSED** | `specs/loop` *One job is one work order…* :74-87 — the merge's subject set is **constituted** from the committed declared subjects (intersected with the executor's declared paths on the read-and-unchanged outcome) and the diff only **checks** it; :88-92 makes the empty-set refusal unconditional, which is the `run.mjs:1594` guard I found. Task 54 names `run.mjs:1577-1594`; task 55 Mutation A constitutes from the diff again and the `reviewed:` case must write no binding. The false independence claim is corrected in design's collisions section, in terms: *"An earlier draft claimed independence while relying on that change's mechanism to write the record at all."* A second defect I did not find — a four-item order retiring all four on one file's diff — is folded into the same root fix (:93-104, task 55 Mutation B). |
| **F3** bisect returns the newest merge | **CLOSED** (mechanism) | `specs/loop` :608-614: *"leave-one-out over the whole train … A prefix search SHALL NOT be used"*, with the reason stated. Task 36; task 37 Mutation B is rewritten to run a prefix search on the latent-early-defect fixture and confirm it isolates the wrong merge. :615-618 adds an honesty clause I had not asked for — what leave-one-out finds is the *surfacing* merge, not necessarily the introducing one. **Residue:** the red path is still unpriced. Leave-one-out re-runs only the failing gate, so worst case is K × 314.8 s when that gate is `npm test`; neither `design.md` nor task 36 states it. One sentence. |
| **F4** `pre-existing` × breaker 2 | **CLOSED** | `specs/loop` :602-607 — a `pre-existing` red does not halt; the train is **held**, the item filed once not once per run, and the merge lock admits nothing further, so accumulation is bounded. Breakers item 2 :1229-1234 carries the explicit exemption with the "every night a date-coupled check ages over midnight" reason. Task 47's mutation counts `pre-existing` as a trip and must write a false `HOLD.md` on a three-night fixture. Scenario *A held train stops accumulating merges*. |
| **F5** bounds evaporate on the empty diff | **CLOSED** | `specs/loop` :46-51 — on an outcome whose diff is empty by construction the merge gate measures the byte and subject bounds against **the reviewed surfaces of the declared pages**, with my own reasoning ("that path is where reading volume is largest") in the text. Task 56, with the mutation that measures the empty diff and must let four whole pages through a bound sized for four diffs. |
| **F6** carry cap prevents nothing | **CLOSED** | `specs/review` :430-438 — the numeric cap is **dropped**, and the requirement body carries the measurement that convicts it (222 entries in 143 records, 86/37/17/2; 24 of 222 = 10.8%; the subject rule 15 of 222 = 6.8%) and moves the inflow argument to the deferral rule. Tasks 13, 15 Mutation B (reinstate a cap of two → the five-entry test must fail: "the absence of a cap is a decision under test"), 16–18, 23 (entries-per-review on the ledger, so the channel is a readable series). This is the disposition I asked for, taken the harder way. |
| **F7** six gates / three builds | **CLOSED** | `proposal.md` :104 and :112-113, `design.md` :93 and the :102-103 table: four gates, two builds, per job 412.6 s → 32.9 s, per train ≈ 403 s. The strengthening is named in `specs/loop` :426-429 (*"Two of those six have never run inside the Desk on any job"*) and in design's guardrail list item 3. |
| **F8** id and ledger races at W=3 | **CLOSED** | `specs/loop` chain requirement — the **selection lock** (read ledger → mint id → create branch → commit `.job/`) and the **ledger lock** over **one** ledger file, both carrying more than a process id. Task 80; task 81 Mutation A removes the selection lock and the distinct-id assertion must fail. Scenarios *Two workers selecting at once do not mint the same job id* and *A worker's spend is visible to the budget before the next selection* — the second covers the non-merging append paths I named. |
| **F9** what a worker branches from | **CLOSED** | `specs/loop` :482-485 — *"A worker SHALL branch from `train`, not from `main`"*, with the reason. The companion rule is better than the one I proposed: :489-495 requires **subject-disjoint merges** on one train, so an eviction leaves every surviving merge's pieces byte-identical and their records valid — which answers the record-invalidation problem by construction instead of by a cleanup rule. Task 33; scenario at :561-565. |
| **F10** brief target unbounded | **CLOSED** | Task 7 lowers `BRIEF_EXCERPT_MAX_CHARS` 88,000 → 24,000; task 8 asserts the **assembled brief ≤ 30,000 characters against the live tree**, with Mutation B restoring 88,000. Task 9 closes the `truncated`-flag rider I noted in passing. |
| **F11** `bfn0` renamed, not fixed | **CLOSED** | `specs/loop` scenarios *A high-priority backlog does not starve the queue either* and *A candidate that produced nothing is not selected again immediately*; task 74 adds the queue floor and automatic deferral; task 76 Mutation A drops the floor and the starvation case must fail — *"deleting the directives file does not delete the starvation."* |
| **F12** ratification channel unnamed | **CLOSED** | `proposal.md` :228 — *"A ratification channel, named as the deliberate loosening it is"* — and design's guardrail list item 2. |
| **F13** stage gate compares two quantities | **CLOSED** | Task 28 takes the baseline as **brief-commit → merge** in Stage 0, with the reason stated in the task ("before Stage 1 moves the records commit to the train"); task 50 gates Stage 2 on the same quantity, and adds a second gate I did not ask for — no wrongly-recorded eviction in the last twenty trains. |
| **F14** eleven vs twelve | **CLOSED** | `design.md` :648-649, with the correction stated. Re-verified: 12. |
| **F15** p90 mis-cited | **CLOSED** | `design.md` :622 cites `evidence/desk-mech-report.md` §B and names the mis-carried `review.mjs:744` citation explicitly. |
| **F16** branch census | **CLOSED** | `proposal.md` :284-285 — 225 (204 local, 21 remote), `job/*` 38, fleet family 32, `loop/*` 121. |
| **F17** worktree teardown, no task | **CLOSED** | Task 25, `loop/lib/git.mjs:116`, with the `--force`-restoring mutation and the 177-package cost named. |
| **F18** two vacuous scenarios | **CLOSED**, both | *Quiescence* now supplies a live worker and requires the check to name its process id. *The registry's note follows the record* now ends on an observable — *"the entry remains selectable on the strength of the record"* — instead of on a person's edit. |
| **F19** "prose piece" undefined | **CLOSED** | `specs/review` :194-200 defines it as a merged subject whose kind's body is prose, by the schema's own classification, and says why the predicate must not be "any file under the content tree". Task 58; task 59 Mutation B defines it as any `content/**.md` and the directory-row case must fail. |
| **F20** task 51 vs `issues.mjs` | **CLOSED** | Task 67 names `loop/lib/issues.mjs:1-56` as the existing format module and forbids a second id format. |
| **F21** train retry scope | **NOT CLOSED** | See NEW-1. The requirement bullet still reads *"once for a train's full set"*; task 49 says the train retries the failing gate. They now contradict, and task 49 claims to implement that bullet. |
| **§4** re-staging | **CLOSED** | Stage 0/1/2/3 as proposed, and both "belongs earlier" items moved as recommended: the `bd` measurement is task 26 and the deferral lint is tasks 16–17, both in Stage 0. Stage 1 is the train at one worker. The Stage-0 header states the constraint it is under ("no new module, nothing on the merge or publish path, every item independently reversible"). |
| **§6** alternatives | **CLOSED** | `design.md` :742-780, *Alternatives considered, with the decision* — all seven D1–D7 with a disposition, plus the four guardrail changes named. Two are better than "recorded": D1 is kept as the **retreat position** with the Stage-2 trigger that fires it, and D2 is **priced and declared moot** once the per-job gate falls to ~33 s. |

**Score: 20 closed, 1 not closed, both cross-cutting items closed.**

## New defects the revision introduced

Six, all in text that round 1 or round 2 changed.

**NEW-1 — MAJOR. F21's fix landed in the task and not in the requirement, and the
two now contradict.** `specs/loop`, *A gate failure is retried once…* :1596-1597
still reads *"once for a job's tripwire, and once for a train's **full set**"*.
Task 49 reads *"a train retries the failing gate, not the set"*, with a mutation
that makes the train retry the whole set and must fail. `grep "failing gate"` over
the delta returns three lines — :586, :610, :1598 — and not one of them is a
retry-scope statement. A task cannot implement a bullet that says the opposite of
it. Fix: one clause in the bullet, and the retry cost follows from it (re-running
the set after `npm test` fails costs 442 s of which 315 s is the gate that failed).

**NEW-2 — MAJOR. The tripwire moved onto the merged tip and, with it, out from
before the review — and one requirement now asserts both.** The round-1 bullet at
:414-422 puts the tripwire under *"the same lock that serialises the merge onto
the integration branch"*, explicitly at *"one build per job"*, and a merge happens
only after an approve (:486). So the tripwire now runs **after** review. But the
opening bullet at :410 has quietly lost the words "before review" that the round-0
text carried, and the floor scenario at :463-468 still ends *"and the job does not
proceed to review"* — which is only true of a gate that runs before it. Two
consequences, neither named: a job whose diff does not build now spends a **full
review invocation** before anything discovers it, where today the gates run first
and a red build settles `failed` for zero reviewer model-minutes (review 1 is
20.0% of all model-minutes on the ledger); and the floor check itself, whose whole
purpose is to catch a gate that did not run, is described as protecting a step it
no longer precedes. Fix: state which it is. If there are two tripwire runs — the
branch before review, the merged tip at merge — then "one build per job" is wrong
and the second build must be priced. If there is one, at merge, delete "does not
proceed to review" from the scenario and name the review spend as accepted.

**NEW-3 — MAJOR. `B_train` / `S_train` are checked before the rederive and the
rederived bytes are then added to what the train reviewer must read.** The bound
(:505-511) is measured on *"the merges waiting"* and decides the **prefix that
fits**. The round-1 reordering (:512-519) then puts *one recomputation of
`data/derived/`* **before** the train review, so the reviewed diff is the merges
**plus** the regenerated derived tree — and on a train carrying a Pulse commit
(now required, `specs/pulse` bullet 2) that regenerated tree can dwarf the merges.
This is F5's shape reintroduced by F5's own sibling fix: a bound checked where the
work is chosen and not where it is measured. Fix: either exclude deterministic
regenerated data from the reviewed-bytes bound **and say so with the reason** —
the train-order bullet at :520-524 already invokes exactly that exemption for the
records commit ("deterministic outputs of already-reviewed machinery") — or
re-measure after the rederive and shrink the prefix.

**NEW-4 — MAJOR. The Pulse's own work can no longer reach `main`, and nothing
triggers a train to carry it.** `specs/pulse` now requires *"A run SHALL commit its
data and content changes to the integration branch (`train`), never directly to
`main`"*, and `main` SHALL have *"exactly one writer: the fast-forward a passing
train performs"*. But every train trigger in `specs/loop` :501-504 is keyed on
**merges** — a count of merges, minutes since the first unpublished **merge**, or
the desks idle **with merges pending**. A Pulse commit is not a merge. So with the
Desk stopped — `STOP`, a `HOLD.md` from any of the four breakers, a held train, or
simply no qualifying work — the Pulse commits to `train` indefinitely and the
site's freshness layer (feed facts, as-of dates, the changed feed, the snapshots)
stops reaching the remote, with no error raised anywhere: the publish step is
never called, so even "nothing was pushed" is never printed. Today the Pulse
publishes independently of the Desk, which is why `STOP` has never frozen the
site; after this change the maintainer's own brake freezes it. Fix: add a trigger —
a train runs when the integration branch carries any unpublished commit and `T`
has elapsed, merges or not — and say what reviews a merge-free train, which the
ordering already contemplates since the rederived data is inside the reviewed diff.

**NEW-5 — MINOR. Task 16 creates a second module that invokes the tracker, two
stages before the one that is supposed to be the only one.** `specs/loop` :1395:
*"**Exactly one module SHALL invoke the tracker**"*. Task 16 (Stage 0) creates
`scripts/lint-deferrals.mjs`, which reads `bd list --json`; `loop/lib/beads.mjs`
does not exist until task 67 in Stage 3. Task 69's boundary test asserts only that
nothing under `lib/` and no prebuild step imports or spawns it, so nothing catches
this. It also sits oddly against the Stage-0 header's "no new module". Fix: one
clause — the rule binds every module **the loop invokes**, and a standalone report
script run by hand is named as outside it — or say task 16 is provisional and
folds into `beads.mjs` at task 67.

**NEW-6 — MINOR. The review delta's preamble contradicts its own body.** Lines
9-10 still read *"Carried findings get a cap, because they are the one uncapped
inflow channel and were measured as the bottleneck"*; :430 now reads *"**No numeric
cap is placed on the entries one review may carry**"*. A delta preamble is never
archived (`check-spec-deltas.mjs` header: *"A delta file's preamble is never
archived"*), so nothing reaches the constitution — but it is the first paragraph a
reader of this delta meets, and it announces the decision the change deliberately
refused after measuring it.

**NEW-7 — MINOR. The descendant check refuses the equal case.** `specs/pulse`:
*"SHALL refuse the push when the declared SHA is **not a descendant of** the remote
tip"*. Where the declared SHA **is** the remote tip — nothing new to publish, or
another actor pushed the identical commit while this train was verifying — the
strict reading refuses and the run reports a scope refusal, when the honest report
is that there was nothing to publish. Fix: "not a descendant of, or equal to".

## Bytes read, for findings per kilobyte

**Round 2 (this pass), measured exactly:**

| File | Bytes |
|---|---|
| `proposal.md` | 25,753 |
| `design.md` | 59,333 |
| `tasks.md` | 48,106 |
| `specs/loop/spec.md` | 97,796 |
| `specs/review/spec.md` | 28,602 |
| `specs/pulse/spec.md` | 19,135 |
| **Total** | **278,725 bytes = 272.2 KB** |

**Round 1, as I read it:** `proposal.md` 17,165, `design.md` 38,044, `tasks.md`
33,409 — **88,618 bytes measured exactly**. The three deltas I did not byte-measure
at the time; from the line counts I read (loop 1,303, review 423, pulse 107 =
1,833 lines) they were **≈114 KB estimated**, for **≈203 KB total**. Marked as an
estimate rather than reported as a measurement.

- **Round 1: 21 numbered findings (+ §4, §6) over ≈203 KB → ≈0.10 findings/KB.**
- **Round 2: 7 new defects over 272.2 KB → 0.026 findings/KB**, a quarter of the
  round-1 rate against artifacts that grew 37%.

Two cautions on reading that ratio. It is not a like-for-like density: round 1
searched artifacts nobody had reviewed, round 2 searched a much larger surface
with a named list of nine mechanisms to check, and four of the seven new defects
sit in text that did not exist in round 1. And the closure rate is the more useful
number — **20 of 21 findings closed, most of them at the root rather than at the
symptom**, with three closed better than I asked (subject-disjoint merges for F9,
the partial-retirement defect folded into F2's root fix, the eviction-audit gate
added to F13's).

## Where this leaves the change

The one finding still open (F21/NEW-1) is a one-clause edit. Of the six new
defects, NEW-2, NEW-3 and NEW-4 are consequences of round-1 fixes and are the kind
a revision written under narrower attention produces: a mechanism moved correctly,
and the sentences around it not moved with it. NEW-4 is the one that matters
operationally — it makes the maintainer's own brake stop the site's data updates —
and, like F1, it fails safe against the reserved property while breaking delivery.
All six are text-level; none requires redesigning anything the revision built.
