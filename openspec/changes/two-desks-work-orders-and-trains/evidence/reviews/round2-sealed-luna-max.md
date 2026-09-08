# two-desks-work-orders-and-trains — sealed review, round 2

## Seal compliance

Yes. I read `design.md`'s two `Revision record` sections before writing this
file, accidentally, while checking the file's true line count. This violates the
requested order. I state it plainly; the review is not an independent sealed
measurement in the strict sense.

I did not treat the `[WITHHELD FROM THIS COPY — SEAL]` markers or the absent
`reviews/` directory as defects.

## Verdict

NOT READY. The change has a coherent motivation, a real bytes-bound review
interpretation, and several sound mechanisms, but the publication contract is
internally contradictory: the train is reviewed before its records commit while
the publisher must push a SHA the gates ran over. The design also leaves the
Pulse-to-train handoff unspecified, checks the train reading bound before the
bytes they claim to bound are final, and calls an ordered-review seal a
mechanism while relying on a reviewer instruction. The evidence has two
load-bearing count/citation errors. These are correctness and acceptance
problems, not objections to the ambition or size of the redesign.

## Findings

1. **[BLOCKER] — `specs/loop/spec.md` delta, `Merges land on an integration branch and main advances only by a green train`; `specs/pulse/spec.md` delta, `The Pulse publishes what it builds`; tasks 34, 43–46 — the final published SHA is contradictory.**

   The loop delta requires this order: full gates, one rederive, train review,
   records commit, then publish (`specs/loop/spec.md:512-524`). The Pulse delta
   simultaneously requires the caller to declare the SHA its gates ran over and
   push that SHA (`specs/pulse/spec.md:110-118`). If the declared SHA is the
   pre-records tip, the records commit is not pushed and `main` is not the final
   train tip. If it is the post-records tip, the gates did not run over the
   declared SHA. The design calls the records commit an exemption, but never
   states whether it is deliberately left off the live tree or how a final SHA
   containing it can still satisfy the verified-SHA contract.

   Fix the contract before implementation: define the exact final SHA that may
   advance `main`, identify the only post-review paths allowed in it, and add a
   test that reads the remote tree and proves both the reviewed content and the
   allowed records outcome. Do not leave “the SHA its gates ran over” and “the
   records commit after review” as simultaneous unqualified requirements.

2. **[MAJOR] — `specs/pulse/spec.md` delta, `The Pulse publishes what it builds`; tasks 44–46 — the Pulse-to-train handoff is named but not designed.**

   The proposed property is that the Pulse's own commit lands on `train` and
   that `main` has one writer (`specs/pulse/spec.md:105-109`). The tasks only say
   that both callers pass a SHA and that the Pulse commit lands on `train`
   (`tasks.md:275-296`). They do not define which checkout the scheduled
   `node pulse/run.mjs` uses, how it creates or acquires the train worktree, how
   it serializes with a worker merge or train run, what happens when the train is
   held, or how the Pulse avoids invoking the publish step directly.

   The named current code demonstrates the missing seam: `pulse/run.mjs:330-358`
   calls the shared publish step directly, while the current shared step still
   constructs `git push origin main` (`pulse/lib/publish.mjs:858-862, 924-932`).
   No `train`, `intake`, or `chain` module exists in this copy to supply the
   handoff. Until the design specifies and tests an explicit Pulse-to-train
   protocol, a scheduled Pulse remains an untraceable route from bytes to the
   live site.

   Fix by specifying one model-free handoff: the Pulse must write to a locked
   train checkout, must never push on its own, and must be included in the same
   train gates/review/publish transaction. Add a concurrency test with a Pulse
   run racing a worker and a held-train test.

3. **[MAJOR] — `specs/loop/spec.md` delta, `Merges land on an integration branch and main advances only by a green train`; design `Bounds, and how they will be tuned` — `B_train` and `S_train` are bounded at selection, not at the final review.**

   The requirement says a train is bounded by reviewed bytes and distinct
   subjects and runs on a prefix that fits (`specs/loop/spec.md:505-519`). The
   design's bounds table gives `B_train = 150,000` and `S_train = 12`
   (`design.md:616-625`). The prefix is chosen from merges waiting on `train`
   before the ordered rederive and before the train review (`tasks.md:211-227`).
   The rederive is explicitly part of the reviewed diff, so it can add files and
   bytes after the prefix has been accepted. No requirement, task, or train-review
   task remeasures the final diff and refuses or repartitions when the final
   review surface exceeds the bound.

   Fix by measuring the complete post-rederive review surface and subject set
   immediately before assembling the train brief. If it exceeds either bound,
   split/evict/reject before invoking the reviewer. Add a fixture where the
   pre-rederive prefix fits and rederive pushes it over; the old implementation
   must go red.

4. **[MAJOR] — design D6, `Retire the hand-driven fleet; keep its instrument`; review delta, `The train review is sealed from the per-job verdicts` — the seal is an instruction, not a mechanism.**

   The design says the train reviewer is told to open the per-job verdict file
   only after writing its own findings, and concedes that whether it obeys is not
   mechanised (`design.md:493-501`). The delta repeats the obligation that
   findings precede access (`specs/review/spec.md:109-116` in the delta file), and task
   39 only asks for ordered file access plus an existence check (`tasks.md:251-257`).
   A reviewer with access to the repository can read `data/reviews/` before
   writing its findings. The existence check proves only that a file was written,
   not the order of the reads.

   Fix the mechanism, not the prose: use separate invocations or a staged
   artifact that makes per-job verdicts unavailable to the first train-review
   invocation, then run a separate comparator after the first findings are
   durably written. Keep the reviewer worktree discard as the edit-rights
   mechanism; do not rely on another instruction for the seal.

5. **[MAJOR] — review delta, `The train review is sealed from the per-job verdicts and reports what they missed`; loop delta, `A red train is classified before anything is reverted` — train findings have no structured merge identity.**

   The design requires every non-approval finding to name the merge(s) it
   concerns and evicts those merges (`specs/review/spec.md:119-125` in the delta;
   `specs/loop/spec.md:630-637` in the delta). Task 41 repeats “findings name merges”
   but does not add a structured field, a train manifest, validation of merge ids,
   or a parser for malformed/unknown names (`tasks.md:263-267`). The current
   verdict parser has structured verdict/reason/forced-judgment fields but no
   train-merge association (`loop/lib/verdict.mjs:213-294`). Free-form prose
   saying “merge two” cannot mechanically distinguish a valid merge from a typo
   or a finding about the combination.

   Add a structured `affects_merges` list to each train finding, backed by stable
   merge ids in a committed train manifest. Refuse empty, unknown, or
   combination-only findings through the stated whole-train rejection path, and
   test all three cases.

6. **[MAJOR] — `proposal.md` measurement summary and `evidence/` provenance — load-bearing numbers are not consistently reachable or accurate from their cited sources.**

   Two concrete discrepancies are material to the acceptance object:

   - `proposal.md:103-116` cites `evidence/gate-timings.txt` for a 442.5-second
     six-gate total. That file says `npm test` and `npm run build` exited `null`
     at `0.0s` and reports `TOTAL 98.5` (`evidence/gate-timings.txt:4-10`).
     `evidence/gate-timings-npm.txt:3-5` supplies only the two separate npm
     timings. A reader can reconstruct 442.5 by combining files, but the cited
     timing report itself records a failed/incomplete run, not the claimed total.
   - `proposal.md:143-147` says the opening cohort is 48 beads summarized as 41
     valid, 5 partial and 1 fixed, hence 47 of 101. `stale2-report.md` contains
     an additional still-valid row `addictedtoai-4w2` (`evidence/stale2-report.md:3,
     28-48`), but its totals omit that row and say 16 valid + 4 partial
     (`evidence/stale2-report.md:50-56`). The report's table therefore accounts
     for 21 rows while its totals account for 20; the combined opening cohort is
     48, not 47, if the table is the source of truth.

   A third provenance limitation is explicit in the evidence itself: the local
   beads and token scripts read hard-coded external paths rather than inputs
   copied into the change (`evidence/README.md:53-65`), and `codex-spend.mjs`
   requires a sessions directory argument (`evidence/scripts/codex-spend.mjs:9-17`).
   The change directory alone cannot reproduce those point-in-time numbers.

   Fix the acceptance evidence before implementation: capture the actual command
   outputs or repository-local fixture inputs, correct the gate citation, resolve
   the missing cohort row, and rerun the three complaint verdicts from those
   immutable inputs.

7. **[MAJOR] — proposal `In one page` / `Why this is not the fourth unstarted change`; tasks Stage 0 — the first shipping stage is not as small or isolated as claimed.**

   The proposal says Stage 0 has “no new module,” “nothing touching merge or
   publish,” and only reversible local edits (`proposal.md:20-23, 201-213`).
   Stage 0 nevertheless creates `scripts/lint-deferrals.mjs` (`tasks.md:104-109`)
   and changes gate invocation/floors, verify-launch, spec excerpt selection,
   verdict/review fields, carry semantics, runner policy and reserved registry
   data, ledger schema, worktree teardown, and baseline measurement (`tasks.md:22-194`).
   This is not merely a large diff: it is several interacting guardrails with
   different owners and rollback conditions, and one of its own tasks contradicts
   the “no new module” claim.

   Either split Stage 0 into independently shippable gate/brief/record slices
   with a gate between them, or correct the stage claim and add an integration
   criterion showing that the cross-cutting changes are reversible together.

8. **[MAJOR] — pulse delta, `The derived queue is mirrored into the tracker outside the derive step`, Scenario `A re-run with no world change is still byte-identical`; task 83 — the idempotence scenario is vacuous on an empty/no-op derivation.**

   The scenario asserts only that two `data/derived/` trees are byte-identical
   and contain no issue id (`specs/pulse/spec.md:64-69` in the delta file; task 83 is
   `tasks.md:528-534`). A wrong implementation that skips derivation or writes
   no queue state passes with an empty tree. The test task likewise does not
   require a known non-empty derived condition or expected queue item.

   Fix the scenario fixture: begin with a known derived condition, assert the
   expected condition is present after the first run, then rerun and assert
   byte identity and no tracker id. Mutate/remove the derive write and require
   the test to fail.

9. **[MAJOR] — design D2b, `The train's red path`, and Stage-1 measurement task 50 — the cost of repeated train reviews is explicitly unpriced.**

   The drafter acknowledges that an eviction can cause three maximum-effort train
   reviews over overlapping diffs (`design.md:234-242`). Task 50 records per-gate
   seconds, evictions and the brief-to-merge figure, but not train-review model
   minutes, train-review wall-clock, or the cost of repeated review passes
   (`tasks.md:316-322`). The Stage-1 decision that permits Stage 2 can therefore
   report a gate saving while omitting the new model cost that the objection says
   may dominate it.

   Add train-review duration/model-minute/attempt fields to the train ledger and
   include them in the Stage-1 go/no-go rule. If the review cost is not yet
   measured, do not call the Stage-1 saving decision complete.

### Hunt summary

- **Vacuous scenario:** found and reported in finding 8. I also checked the
  unchanged-page, train-review, publish-SHA and queue-floor scenarios; their
  paired positive paths are less clearly vacuous than the empty-derivation case.
- **Check narrower or looser than its named property:** found in finding 3: the
  train bound is selected on a pre-rederive prefix but named as a bound on the
  final reviewed train. I found no second independent name/implementation
  inversion in the portions read.
- **Bound checked in one place only:** finding 3 is the train-level instance. The
  work-order delta explicitly requires bundler and merge enforcement, so I did
  not report that pair as missing.
- **Mechanism documented rather than enforced:** finding 4 is the train-review
  seal; finding 5 is the free-form merge association. The reviewer worktree
  discard itself is a real mechanism, not a finding.
- **Every live-site path:** enumerated below.
- **Collision claim:** independently checked; sound, as recorded below.
- **Requirement/task coverage:** independently scripted below.

## Every path by which bytes reach the live site

| Path under the proposed design | What reaches the remote/live site | Did a real reviewer actually read those bytes? |
|---|---|---|
| Ordinary front-desk or back-desk work order | Worker branch → tripwire → `train` merge → full train gates → rederive → train review → records commit → verified-SHA push → host build | The per-job reviewer reads the work-order diff; the train reviewer is required to read the final whole train diff. This is conditional on the unresolved SHA/order and seal findings above. |
| Pulse deterministic data/state | Pulse fetch/snapshot/data-layer/derived output is supposed to commit to `train`, then follow the same train gates/rederive/review/push path | No per-run model review; the train reviewer should read the final diff. The design treats deterministic output of already-reviewed machinery as an explicit exemption (`proposal.md:65-78`). |
| Mechanical front matter, stubs, timeline/domain writes, vanished-row records and derived data | Same Pulse-to-train route; no direct live-site route is specified after the change | The train reviewer should read the final diff. These are deterministic outputs, so the stated exemption applies only if the machinery that produced them was itself reviewed. |
| Train records commit | Review records, ledger, carried/proposal bookkeeping and possibly derived state committed after the train review | No reviewer reads the record of its own verdict. The design expressly treats review records as exempt, but it must resolve whether the final SHA includes them; otherwise this path is not fully traceable. |
| `train` fast-forward / verified-SHA push | Ref movement and host rebuild; no new content bytes are created by the ref update | The review status is inherited from the exact tree whose content was reviewed, subject to finding 1. |
| Human maintainer `git push` | Any local commit the maintainer chooses can reach the remote; the design cannot constrain it | Unknown. No repository mechanism proves a real reviewer read those bytes. The design states this limit rather than hiding it (`proposal.md:265-273`). If the reserved sentence is literal over human pushes, this is outside the claimed guarantee and needs maintainer confirmation. |
| Old/external script push | An external script outside the repository could push bytes | Unknown. The design says retirement removes the known launcher but explicitly cannot prevent an old external script (`proposal.md:265-273`). |

The current pre-change direct route is also visible and must be eliminated by the
implementation: `pulse/run.mjs:330-358` invokes the shared step, and the current
step pushes `origin main` at `pulse/lib/publish.mjs:931`. I do not count that as a
permitted post-change route; I count it as the implementation condition that the
design must close.

## The five spot-checks

1. **Claim:** the six-gate push-bar total is 442.5 seconds (`proposal.md:106-114`).
   **Source:** `evidence/gate-timings.txt` and `evidence/gate-timings-npm.txt`.
   **Source says:** `gate-timings.txt:4-10` has null/0.0 for the two npm gates and
   total 98.5; `gate-timings-npm.txt:3-5` has only the two npm timings. **Verdict:
   differs / unsupported as cited.** The arithmetic can be reconstructed by
   combining files, but the cited timing report does not contain the claimed
   successful six-gate run.

2. **Claim:** median merged-job fixed overhead is 5.5 minutes and 25.9% of wall
   time (`proposal.md:92-99`). **Source:** `evidence/desk-mech-report.md`.
   **Source says:** lines 61-66 report 1,368.1 non-model minutes, 25.9%, and a
   5.5-minute median over 172 jobs. **Verdict: matches.** The source also states
   that selection time is excluded, which travels with the claim.

3. **Claim:** the earlier batching experiment cut 27 jobs to 16 for the same
   backlog (`proposal.md:131-134`). **Source:** `evidence/hist-report.md:885-888`.
   **Source says:** the batch-carried-findings-by-subject experiment reports 27 →
   16 and was scoped to one producer, not the selector. **Verdict: matches.** The
   scope limitation is present and is not silently generalized by the source.

4. **Claim:** 182.4M input tokens, 685K output and 96% cached input (`proposal.md:187-191`).
   **Source:** `evidence/scripts/codex-spend.mjs` and `evidence/README.md:59`.
   **Source says:** the script aggregates an external sessions directory supplied
   as an argument; the README says the source is session-scoped. No captured
   session input or output is in this change directory. **Verdict:
   unsupported/unreproducible from `evidence/`.**

5. **Claim:** 47 of 101 open issues came from the opening stretch, summarized as
   41 valid, 5 partial and 1 fixed (`proposal.md:143-147`). **Source:**
   `evidence/stale-report.md` and `evidence/stale2-report.md`.
   **Source says:** the first report covers 27 items; the second calls its cohort
   21 and includes `addictedtoai-4w2` as STILL-VALID in its table, while its totals
   omit that row. **Verdict: differs.** The evidence as written accounts for 48
   table rows, not 47; its own totals are internally inconsistent.

## Requirement-to-task coverage

I wrote and ran an absolute-path scratch script that parses the three delta files
by `## ADDED Requirements`, `## MODIFIED Requirements` and `## REMOVED Requirements`,
then parses the machine-readable heading-to-task table in `tasks.md`. Its real
output was:

```text
requirements=27 mapping_rows=27
kinds={"ADDED":14,"MODIFIED":11,"REMOVED":2}
missing=0 empty=0
coverage_ok=true
```

ADDED, MODIFIED and REMOVED headings were all treated as requirements. The two
REMOVED headings were checked as headings even though their delta bodies carry
reasons rather than full requirement bodies. The scratch file was deleted with
`apply_patch`; the proof after deletion was:

```text
scratch_exists=False
scratch_status_lines=0
```

This proves mapping coverage, not that every mapped task is sufficient. The
scripted result agrees with the 14/11/2 table in `tasks.md:592-642`.

## D1-D7

- **D1 — work orders:** I would keep coherent batching, because the design
  correctly distinguishes coherence from count and requires subject/byte bounds
  (`design.md:15-61`). I would make the final reviewed-byte measurement and the
  first-twenty decision rule a hard prerequisite before increasing `N_max`; a
  train-review finding proxy is not reviewer attention itself (`design.md:80-86`).

- **D2 — release train:** I agree that merged-tip tripwires plus one full train
  gate set is the right direction, and leave-one-out is better than “drop the
  newest” (`design.md:116-196`). I would first resolve the post-review records
  commit versus verified SHA, then run the one-worker train with final-bound
  measurement before adding parallel workers.

- **D3 — one intake and two desks:** I agree with routing on declared metadata,
  not title prose, and with structured presence checks for rederivation
  (`design.md:258-283`). I would add a repository-local immutable intake
  manifest keyed by stable candidate/claim ids before the model runs, so a
  mutable tracker cannot change the task between verification and execution.

- **D4 — inflow:** I would retain a small mechanical cap or make the deferral
  rule operational before accelerating the rest of the Desk. The design is
  honest that Stage 0 has no mechanical inflow bound (`design.md:431-439`), but
  throughput without that bound can multiply the channel it is meant to drain.

- **D5 — brief diet:** I agree with deleting saturation and making cited
  requirements structured (`design.md:443-476`). I would require size fixtures
  for every governing type and for revision/unchanged-page briefs, not only the
  repair fixture named in task 8, because the requirement is global.

- **D6 — fleet retirement:** I agree that the hand-driven fleet should retire
  only when the repository chain exists and that its cross-change review is worth
  preserving (`design.md:484-505`). I would implement the seal with access
  separation, not an ordered-reading instruction; this is finding 4.

- **D7 — runner policy:** I agree that runner ids belong in `runners.yml`, not in
  portable requirements (`design.md:568-613`). I would keep the policy explicitly
  provisional until price/token telemetry exists; the evidence only supplies
  model-minutes, and the design itself admits the 1.3× cheaper-price assumption
  (`design.md:553-561`).

## The drafter's own objections

I found explicit objection blocks for D1, D2, D2b, D3a, D3b and D4; D7 is a
drafter's decision block, and I found no objection block under D5 or D6.

- **D1 objection:** correctly identified. The proxy is not attention, but the
  advance decision rule is an honest mitigation. I would add a minimum-sample and
  zero-finding guard so “no train finding” cannot be read as evidence of safe
  batching.
- **D2 objection:** correctly resolved by renaming the classification
  `pre-existing`; the design does not claim the rerun measured why `main` was
  red (`design.md:227-232`).
- **D2b objection:** not resolved. The design admits repeated train-review cost
  but task 50 does not measure it. This is finding 9.
- **D3a objection:** correctly separated. Presence of a structured answer is
  mechanised; whether a model's answer is true is a review judgment
  (`design.md:343-370`). Treating that remaining human judgment as a code check
  would be the wrong property.
- **D3b objection:** correctly sustained as a real tension, not solved. The idle
  front desk can leave the back desk slower; open question 4 must decide whether
  that trade is acceptable (`design.md:372-381`).
- **D4 objection:** correctly surfaced and not silently dismissed. It remains a
  staged-change risk because the lint reports but does not refuse and task 18 is
  held pending the maintainer (`design.md:431-439`; `tasks.md:114-122`).
- **D7 decision:** right to keep ids out of the requirement text. The small-cell
  evidence and relayed instruction are limitations, not a reason to hard-code
  runner names in portable machinery.

## What I checked that was sound

- `openspec validate two-desks-work-orders-and-trains --type change --strict
  --no-interactive` passed.
- `node scripts/check-spec-deltas.mjs --strict` reported 0 errors. Its one
  stale-id warning belongs to another unarchived change, not this collision claim.
- The collision claim is independently supported by the unarchived tree: the
  three other changes touch 12 headings (4 each), and none touches this change's
  modified `pulse` heading `The Pulse publishes what it builds`. The four other
  change directories were enumerated directly.
- The review delta's unchanged-page property is defensible: it explicitly
  requires machine-generated page bytes, no empty diff section, hash equality,
  and fail-closed movement detection (`specs/review/spec.md:27-60` in the delta file).
- The existing review edit-rights mechanism is real: `runReview` discards the
  review worktree and checks the branch SHA before/after
  (`loop/lib/review.mjs:1189-1205`).
- The work-order subject direction is sound on paper: the design constitutes
  subjects from a committed declaration and uses the diff for both-direction
  checking (`specs/loop/spec.md:57-104` in the delta file). The scripted coverage
  count also covers all 27 headings.
- The `pre-existing` train classification and leave-one-out rationale are
  internally coherent, and the mutation tests named for early latent defects
  are the right kind of tests (`tasks.md:228-246`).
- The targeted current baseline portability test passed all 12 tests. No full
  test suite, build, verify script, or Pulse run was executed.

## What I could not settle

- The exact intended final train SHA after the records commit; the current
  wording permits two incompatible readings. This is finding 1, not an
  implementation question that can be inferred safely.
- The branch/worktree/lock protocol by which a scheduled Pulse joins a train;
  this is finding 2.
- Whether the maintainer intends “nothing publishes…” to bind human and
  external-script pushes literally. The design states that those paths are out
  of reach, so I cannot treat them as machine-enforced review paths.
- The actual price ratio behind D7, because the ledger measures minutes rather
  than dollars, and the train-review cost because task 50 does not measure it.
- Open questions 4, 5, 6 and 7: machinery-ceiling treatment, finishing the
  unarchived changes, the maintainer's deferral-rule answer, and confirmation of
  the reserved-property reading. A design can state these as decisions pending
  the maintainer, but they are not settled by the artifacts alone.

## Reading record

The six core artifacts total **278,725 bytes**; the evidence tree totals
**313,908 bytes**; total change material is **592,633 bytes**.

Read in full:

- `proposal.md`, `tasks.md`, and `design.md` (59,333 bytes; unfortunately
  including both revision-record sections before this file was written).
- All three delta specs and all three live specs.
- `evidence/README.md`, `desk-mech-report.md`, `runner-workflow-cost.md`,
  `stale-report.md`, `stale2-report.md`, `gate-timings.txt`,
  `gate-timings-npm.txt`, `evidence/scripts/orch-beads-flow-local.mjs`, and
  `evidence/scripts/codex-spend.mjs` (82,545 bytes across that evidence subset).
- Both required beads, `addictedtoai-douz` (515 output lines) and
  `addictedtoai-vqbo` (666 output lines), read in chunks to avoid truncation.

Sampled rather than read in full:

- `hist-report.md`, `beads-report.md`, `ledger-report.md`, `spend-report.md`,
  `architect-outline.md`, `draft-report.md`, the rerun text files, and the
  remaining evidence scripts. I read the relevant headings/sections and the
  exact cited lines for the spot checks, but not every line of those files.
- The named codebase: high-impact windows in `loop/run.mjs`,
  `loop/lib/review.mjs`, `loop/lib/result.mjs`, `loop/lib/verdict.mjs`,
  `pulse/run.mjs`, `pulse/lib/publish.mjs`, and `loop/lib/publish.mjs`; symbol
  and call-site scans for the other named modules, including gates, locks,
  verify-launch, delta checking and portability.

Attention thinned after the full core/spec read: I did not perform a full
line-by-line audit of the 1,008-line history report or of every unmodified
library named by the prompt. The remaining evidence and code outside the
publication, review, train-bound, selection and ledger paths were read as
targeted samples, so silence there is not a claim that every unrelated line is
sound.
