# Design outline — the front desk and the back desk

Author: A2AI-Fable-Arch, 2026-09-08. Tracking bead: addictedtoai-douz.
This is the decision record the openspec change is drafted from. Every number
below has a source in one of the research reports in this scratchpad
(ledger-report.md, desk-mech-report.md, draft-report.md, beads-report.md,
hist-report.md, spend-report.md, stale-report.md) or in a peer session's
measurement; the drafter pulls the exact figures and provenance from those
files, never from memory.

## 0. The one reserved property

The maintainer, 2026-09-08, on bead addictedtoai-vqbo: "as long as work is
getting reviewed before going live, I am good." Restated as the acceptance bar:
NOTHING PUBLISHES THAT A REAL REVIEWER HAS NOT ACTUALLY READ. Every mechanism
below either preserves that property or is out.

Four mechanisms currently deliver it and are kept: the review gate (the
reviewer's tree is discarded, the merge refuses without approve); review
records bound to bytes; the brakes (STOP, HOLD.md, reserved paths; a job
never clears its own halt or edits its own budget); fail-the-build-don't-warn.

## 1. What was measured (the drafter cites the reports for exact figures)

1. The unit of work is far smaller than the unit of overhead. Median merged
   job: 1 content file, 4 content lines, ~$3.20, ~24 min dispatch-to-merge,
   ~18 model-minutes. Repair is 58% of jobs and the cheapest per job.
2. Per-job fixed cost, four parts:
   a. Gates: npm test (1,201 tests), TWO full site builds, verify-surfaces,
      verify-design (Playwright) on every job whatever it touched. Median
      non-model overhead 5.5 min per merged job, 25.9% of wall-clock since
      09-01 (brief commit to records commit; excludes selection). Orch's
      ledger-gap ratio 1.45x is an UPPER bound on the same quantity and must
      be quoted with that qualifier.
   b. The brief: BRIEF_EXCERPT_MAX_CHARS raised 14k -> 88k in eleven days
      because unarchived openspec changes split the per-source budget
      (addictedtoai-2sx8); pass 2b of excerptsFor SATURATES the budget with
      keyword matches. Author brief 16,181 chars on 08-28 -> 103,881 on
      09-08; ~85% spec excerpt; ~25k tokens per author invocation; re-sent
      whole on revision (38 jobs).
   c. Reviewer orientation: review costs 2.6-3.2x implementation on 19- and
      98-line changes (Luna, codex model-minutes, bead f4vy). Mostly fixed.
   d. Cold start: codex lane 266:1 input:output, 96% cached; marginal cost
      of one more session ~127K uncached input + output (bead f4vy). So
      batching saves wall-clock, gate passes and reviewer orientation first;
      tokens a distant third.
3. The routing bottleneck. Review records bind to bytes; only the actor that
   writes the record may edit a reviewed page; that actor is the serial Desk
   (one job per run, gates lock-serialised machine-wide, ceiling ~55 jobs/day,
   observed 23-52). ~81 of ~100 open beads are edit-shaped site work; no
   create-shaped work remains for the hand-driven fleet (Orch's triage).
4. Inflow. Beads, BY LOCAL DAY (Orch's corrected script
   orch-beads-flow-local.mjs; every UTC-bucketed table sent earlier is
   superseded, including beads-report.md's per-day table): 313 filed / 212
   closed, net +101; last 7 local days 99 filed vs 69 closed, ratio 1.43.
   Barbell by local day: 47 open from 08-29..08-31, 18 from 09-01..09-05,
   36 from 09-06..09-08. 64-81% of beads filed since 09-01 reference only machinery
   paths; 5% content-only; 81 of 100 OPEN beads are about the machinery, 14
   about content (beads-report.md). ~68% of all issues explicitly reference a
   review finding, a Desk job or the file-the-deferral rule; churn is 0.3-0.6
   new beads per bead closed. The open set is a barbell: 27 by LOCAL date
   from the 08-31 audit (37 by UTC; stale-report.md checked all 27 against
   the tree: 25 still valid, 1 partial, 1 FIXED but open — en3s — so there is
   no triage dividend, and the 25 fall into seven natural batches by shared
   file or surface) and ~37 from the last three days. Inside the Desk the same dynamic:
   carried findings are the one uncapped channel (37 filed / 35 retired in
   three days, 76% onto a file already carried; 23 jobs on 09-02 published
   nothing); the proposal directory is a 78-deep oldest-first FIFO behind the
   derived queue; four proposal-retirement mechanisms (expiry sweep, over-cap
   drop, duplicate discard, self-amplification discard) have NEVER fired —
   re-verified 2026-09-08: only "## Consumed" headings exist, 35 of them.
5. Where the money goes (spend-report.md, fork-corrected, cross-validated
   against workspace_total_cost $7,385.50): interactive sessions 85.6%
   ($6,325), Desk jobs 14.3% ($1,057, a floor: 40 of 240 job ids named in
   commits were never priced), conformance probes 0.04%. Desk inference is
   sweep-priced and "consistent" with the ledger join, not independent.
   The interactive layer (triage, directives, briefs, fleet coordination,
   merges, memory, spec work, done by Fable/Opus sessions) is the cost.
   Output side, 15 days: content/ is 4.15% of all changed lines; data/
   34.8%; machinery 12.0%; "other" 44.8%, dominated by .job/brief.md and
   .job/source.json (187,820 lines written to job branches and stripped
   again) and docket/ queue-state churn. Last 7 days: Desk $934 for 42 new
   content files ($22.23/file) — content creation slowed while Desk activity
   did not.
   The fleet is a session-level pattern with no code, no ledger, no budget,
   no record: one codex worker at a time, a sealed max-effort reviewer,
   hand-written briefs, hand-driven revision, handover of a branch.
6. Two second-order defects the redesign must not leave standing: directives
   outrank the entire derived queue so the daily scout is unreachable while
   any directive is pending (addictedtoai-bfn0); a re-review whose honest
   answer is "no edit" cannot succeed (addictedtoai-vqbo).

## 2. The shape: a front desk and a back desk

The maintainer's idea is recorded once, in a 2026-09-07 comment on epic
addictedtoai-h0z0: "the back-desk idea the maintainer is musing on
(front-desk = content jobs; back-desk = machinery, spec changes, beads)". So
the split is BY KIND OF WORK, and the design builds it:

FRONT DESK = the site's work. Content jobs — entry, post, repair, interpret,
verify, re-review, scout, tutorial, education, prune — arriving as beads,
routed and bundled into WORK ORDERS, executed by parallel WORKERS behind a
build tripwire, gated, batch-reviewed, rederived and published ONCE PER
TRAIN. Its budget is the upkeep floor and the new-writing ceiling. This is
the product lane and nothing else may run on it.

BACK DESK = the machine's work on itself. Machinery beads, openspec changes,
the tracker's own hygiene, memory. It runs under the machinery ceiling on its
own queue, and its inflow (64-81% of all beads filed since 09-01) is where the
filing budget bites. Back-desk work NEVER fills an idle front-desk run: today
the selector falls through to machinery proposals when the queue is empty
(72 model-minutes on one machinery proposal on 2026-09-07); after this change
an idle front desk runs the scout or nothing.

Both desks share one INTAKE: beads as the one backlog, a model-free ROUTER
that classifies each bead (front or back, create- or edit-shaped, subjects,
record status, clearance, budget category, coherence key), a model-free
VERIFIER that checks every checkable claim in a bead against the tree, and a
BUNDLER that emits work orders. The judgment half of intake — is the bead's
premise still true, what should the prose say — is NOT mechanised; it is done
by the author at full effort inside the job, informed by the verifier's
results.

The hand-driven fleet retires. Its two real advantages are absorbed: parallel
worktrees (front-desk workers) and a sealed max-effort review that judges
cross-change interactions (the train review, which is the every-5 batch
review made mechanical). Its reviewer-grading instrument is kept as a
measurement the train review reports (findings the per-job reviews missed).
Spec changes stay with the orchestrator sessions, on the back desk, as today.

## 3. Decisions, each with the reason and the objection it survived

### D1 Work orders replace one-item jobs (H1)
- A job carries a work order: 1..N items sharing a COHERENCE KEY
  (budget category + subject path or surface + source cohort). Coherence,
  not count. Same-category only, so budgets keep one cap and one category
  per job.
- Bounds enforced by the selector when bundling and by the merge gate when
  measuring: max items N_max, max distinct subjects S_max, max reviewed bytes
  B_total and B_per_subject. Luna's objection: bytes alone bound reading
  volume not attention — hence the subject bound. Orch's objection: a total
  says nothing about the distribution — hence the per-subject bound.
- The work order's subject list is STRUCTURED, LOOP-AUTHORED and COMMITTED in
  .job/source.json at selection (vqbo D2+D4, one defect two hats). The merge
  gate refuses a diff whose subjects are not a subset of the declared list
  (scope-violation already exists). No string matching against prose.
- Records stay per piece (writeRecordSubjects already writes subject: as a
  list and reviewed: as a path->hash map). would-cite becomes PER SUBJECT,
  modelled on reads-human-from (Orch's fix); the duplicate check runs per
  subject.
- A work order whose outcome is `reviewed: <paths>` with an empty diff is the
  vqbo fourth result form; precondition: every declared path already reads
  mismatched; the reviewer is handed the PAGES, never an empty diff fence,
  and the gates section states that gates ran on a tree identical to base
  (so it is not evidence about the page). This lands vqbo inside the change
  rather than beside it.
- Brief: N outcome blocks under one scope rule; the acceptance checks keyed on
  the governing type; intake's verification results included so the
  author knows which claims of the bead failed against the tree.
- Ledger line: `items: [...]` (bead ids + subjects) beside the existing
  singular type (= governing type). Breaker 1 keys on governing type.
- Directive marker / proposal consumption become per item.

### D2 A release train replaces six gates per job (H2)
- Per-gate timings measured by A2AI-Orch on 78c6361, publishing off:
  verify-launch 39.6s of which its OWN build is 39s (the launch checks
  themselves across 684 pieces cost ~0.6s); verify-design 35.7s (Playwright);
  verify-surfaces 3.7s; npm test and npm run build and verify-analytics to
  follow. So today a job pays for at least THREE builds (gates build, launch's
  build, post-merge build). Cheapest change first: verify-launch reuses the
  job's build output instead of building again — no new machinery, one
  build saved per job — and that is a stage-1 item on its own.
- Per job: `npm run build` only, as the tripwire (schema, link, transclusion,
  alias errors FAIL THE BUILD by design and are the failures a job causes),
  plus verify-surfaces (3.7s) because it is cheap and DOM-level.
- Jobs merge --no-ff onto an integration branch `train`. main advances only
  by fast-forward when a train passes. main is therefore always green and
  always pushable; the local tree can carry an unpushed train.
- The train runs when K merges have landed or T minutes have passed since the
  first unpublished merge, or when the back desk is idle with merges pending.
  It runs, once: npm test, verify-surfaces, verify-design, verify-launch
  (which builds), verify-analytics; the TRAIN REVIEW (sealed, max effort, over
  the train's whole diff, writes its own findings before seeing the per-job
  verdicts, reports what the per-job reviews missed); the rederive of
  data/derived (pure function of state, once); the records commit; the
  publish (push). Per-gate timings recorded on the train's ledger line so the
  amortisation claim is measurable.
- On red: FIRST re-run the failing gate on main (the pre-train commit). Red
  there too = "the world moved" (record mismatch, census ageing, a vanished
  feed row): file an upkeep item, do not bisect, do not evict. Green there =
  a merge did this: bisect over the train's merge commits running only the
  failing gate, revert the culprit merge (-m 1), mark its ledger line
  `evicted-at-train`, reopen its bead with the gate output, re-run the train.
  Luna's objection (84s8: the defect is in an EARLIER merge and surfaces when
  a later one arrives) is why it is a bisect and not "drop the newest", and
  why the fallback when bisect cannot isolate one merge is "reject the whole
  train, reopen every bead" rather than a guess.
- Publishing per train, not per job. `publish: true` arms the train's push
  only; nothing else pushes.

### D3 Beads are the one backlog; intake routes and bundles for both desks (H3, 7z07)
- Reuse the tabled draft's Part B plumbing (draft-report.md G): loop/lib/
  beads.mjs as the single bd choke point with the import-boundary test;
  loop mints/claims/closes, a job never touches its own bead; closure
  verified by reading back; routedBeadDefects() as the one intake predicate.
  REJECT its 1:1 job:bead rule — a work order is N:M — and make every
  call site set-valued.
- Sources: routed beads (label desk-job) become the primary source;
  DIRECTIVES.md retires after migration (each directive becomes a P1/P2 bead
  with the same text); proposals stay the job's OUTPUT channel (a job may not
  write to the tracker) but intake converts each live proposal into a
  P3 bead with dedup by subject, so the proposal directory is
  transient, not a FIFO; the derived queue stays authoritative and is
  MIRRORED into beads by intake (condition wins on disagreement),
  exactly the maintainer's recommended shape on 7z07.
- The ROUTER (model-free, node loop/intake.mjs): for every ready bead —
  FRONT or BACK desk (content subjects vs machinery/spec/tracker paths);
  create- or edit-shaped; subject paths referenced; whether each carries a
  record and its status; blocked/deferred/claimed; runner clearance; budget
  category; coherence key. A bead naming both content and machinery paths
  is back-desk (Luna's measurement: all 19 such beads were machinery beads
  citing a content file as evidence). Orch's split: routing is a query against the tree
  and is mechanised; brief content is judgment and is not.
- The VERIFIER (model-free): every checkable claim in a bead — path exists,
  quoted string occurs, cited line still reads as claimed — checked against
  the tree; failures recorded as a note on the bead and carried into the
  brief. Luna's 4i2 miss ("ChatGPT" never occurs in content/learn/) is the
  worked example; the design rule is that the cheap half's confidence never
  launders the expensive half: a bead with a failed claim is routed as
  needs-rederivation, and the author's first outcome is to re-derive.
- The BUNDLER groups affordable candidates by coherence key within D1's
  bounds and emits work orders in priority-band order (bead priority mapped to
  the selector's bands, per the maintainer's 7z07 answer 2).
- The scout gets its own floor (bfn0 option b): a daily sweep outranks routed
  beads once overdue. A parked-directives workaround is no longer needed
  because directives are beads with priorities.
- The chain moves into the repository (loop/chain.mjs or scripts/desk.mjs):
  intake -> N workers -> train, with the documented pause procedure built in
  and the self-proving quiet check. It no longer lives in a session scratchpad.
- Workers: run.mjs keeps "one job per run"; the chain launches up to W runs in
  parallel, each in its own worktree; the build lock serialises only the
  tripwire; merges onto `train` are serialised by a lock.

### D4 Inflow gets a budget (H4)
- Carried findings: cap per review (2), each must name a subject; findings on
  a subject already carried merge into that subject's item (the Pulse already
  emits one item per subject).
- Proposals: at most one per job (exists); converted to beads at intake with a
  default 14-day defer; the never-fired expiry sweep and duplicate-slug
  discard are DELETED (intake owns dedup and expiry); over-cap drop and
  self-amplification discard are KEPT (they bound a job's own output, a
  conflict-of-interest guard, not a traffic guard).
- Bead filing rule, amended in CLAUDE.md/AGENTS.md and enforced by intake's
  lint: a deferral becomes its own bead only if it names a subject path
  or a spec requirement AND cannot be fixed in the same job; otherwise it is a
  note on the parent bead. The maintainer's rule that a machinery bead
  spawning more than one follow-up is stopped and reconsidered is written
  down. Machinery beads are back-desk work under the machinery ceiling;
  intake reports the machinery share of inflow on every run so the number
  is visible.
- The requirement "a finding must not die inside finished work" is preserved:
  notes on an open bead are not finished work.

### D5 The brief goes on a diet
- excerptsFor stops saturating: pass 2b (fill unspent budget with keyword
  matches) is removed; excerpts are the requirements the job's type and
  declared subjects name, plus the pending-amendment deltas for those
  requirements only.
- Per-source budget no longer splits across unarchived changes; a change that
  is finished is archived (openspec archive) as a chain step condition.
- A revision brief carries the verdict, the acceptance, the diff and the
  excerpts the verdict cited — not the whole original brief.
- Target: author brief back under ~30k chars for a repair; measured and
  recorded on the ledger line (brief_chars) so the claim is checkable.

### D6 Retire the hand-driven fleet; keep its instrument
- No new fleet waves. Site work routes through intake to the front desk; code work
  routes as machinery beads under the ceiling or, for spec work, stays with
  the orchestrator as today.
- The train review reports "findings the per-job reviews missed" — the
  grading instrument, mechanised. seal-the-second-review is a requirement:
  the train reviewer writes its findings before it is shown the per-job
  verdicts.

## 4. What this does NOT change
- The review gate, bytes-bound records, the four breakers, reserved paths,
  STOP/HOLD.md semantics, fail-the-build, the executor contract (one prompt
  in, files out), runners.yml as the single swap point, the Pulse's derive
  step (model-free, byte-identical), ledger-before-rederive ordering.

## 5. Staging (each stage shippable and independently valuable)
- Stage 1 — the train and the diet (D2, D5) plus the carried-findings cap
  and the filing-rule text (D4 in part). No selection change. Expected: per-
  job overhead from ~5.5 min to ~1 min; author tokens down ~3-4x; publish per
  train.
- Stage 2 — work orders (D1) including the vqbo reviewed: outcome and per-
  subject would-cite.
- Stage 3 — intake and the two desks (D3: router, verifier, bundler, beads
  as the one backlog, the front/back lane split with the idle rule),
  retirement of DIRECTIVES.md and the hand fleet (D6), proposals-to-beads
  and deletion of the never-fired mechanisms (D4 rest), the chain in the
  repo, parallel workers.
Each stage ends with: gates green, openspec validate --strict, the change's
tasks ticked, a measurement recorded on data/launch.json or the ledger.

## 6. What must be measured after, to know it worked
- Per merged item: wall-clock, model-minutes, dollars (floor), brief chars.
- Per train: per-gate seconds, evictions, world-moved reds, train-review
  findings not in per-job records.
- Backlog: filed vs closed per day, machinery share of inflow, median age.
- The two complaints restated as numbers with a before/after.

## 7. Risks the reviewer should attack
- A train that is red for a world-moved reason blocks publishing until an
  upkeep item lands; is the classification step itself trustworthy?
- Work-order bounds: what N_max/S_max/B values, and how were they chosen? (Start
  conservative: N_max 4, S_max 4, B_total 60k, B_per_subject 30k — from the
  review-diff p90 of 55k; to be tuned from the ledger.)
- Beads as intake makes bd availability a Desk dependency: refusal not halt
  (draft's rule), and the derived queue still runs without bd.
- Parallel workers and the Windows worktree junction hazard (never
  `git worktree remove --force` through a junction).
- The spec collision hazard: three unarchived changes exist; which loop/review
  requirements do they MODIFY, and does this change touch the same headings?
