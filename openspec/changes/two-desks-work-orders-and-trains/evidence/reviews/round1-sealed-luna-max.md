# two-desks-work-orders-and-trains — sealed review

## Verdict

NOT READY. The change has several sound safety instincts, but its publish design still leaves a live path whose caller is not scoped to the commits it verified, and its train puts generated and record bytes after the only stated train review. The work-order scope is only one-way, so a job can retire items it never completed. The Stage 1 claim and several load-bearing measurements are also not defensible as written. Those are correctness and review-boundary failures, not objections to ambition.

## Findings

1. **[BLOCKER] — `specs/pulse/spec.md`, “A publish pushes only the commits its caller verified”; `tasks.md:92-101`; `design.md:143-152` — the Pulse caller is not brought under the new commit-scope mechanism.** The new requirement says “Both engines publish through one step” and requires the caller to declare verified commits (`specs/pulse/spec.md:23-42`). Task 14 only changes `pulse/lib/publish.mjs`; it does not change `pulse/run.mjs` to construct or pass a verified-commit set. The design explicitly says that scoping the Pulse push remains the open half of `addictedtoai-zuoo` (`design.md:143-152`). The current Pulse passes owned paths, not verified commits (`pulse/run.mjs:330-358`), while the shared step ultimately pushes `HEAD` (`pulse/lib/publish.mjs:895-932`). A Pulse run can therefore carry another local commit, including model-written work, to the remote without a reviewer having read it. **Fix:** specify and implement the Pulse caller’s exact verified-commit set, reject any branch state outside it at the final push check, and add the same race/foreign-commit test for the Pulse path, not only the train path.

2. **[BLOCKER] — `design.md`, D2 “Publishing” (`:92-99`, `:143-156`); `specs/review/spec.md`, “The train review is sealed…” (`:75-105`); `tasks.md:6-15`, `:41-101` — the train review does not cover everything the train publishes, and its result protocol is undefined.** The train is reviewed before rederive and the records commit (`specs/loop/spec.md:362-389`; `design.md:92-99`), but those later commits are included in the publish. The design never states whether the reviewer read the regenerated `data/derived/` bytes, the records commit, proposal/queue state, or any mechanically appended front matter, nor how those post-review commits belong to the “commits it verified” set. Separately, the train review requirement defines a non-approval but no first-line result form, required approval record, malformed/absent-result failure, or `would-cite`/record binding; tasks 11–13 only assemble the brief, count findings, and handle non-approval. A missing train result can therefore be turned into an implementation-defined green path. **Fix:** define a train-review result and fail-closed record protocol; put all bytes that can reach the remote either before that review or under an explicit, justified deterministic-output exemption; then declare and check the exact final commit set.

3. **[MAJOR] — `specs/loop/spec.md`, “One job is one work order…” (`:47-62`); `tasks.md:232-244`, `:284-292` — the declared-subject check is a subset, but the required work is not checked for completeness.** The merge refuses content paths outside the committed union (`specs/loop/spec.md:51-55`), and task 38 repeats that one-way test. Nothing requires every item or declared subject to be represented by a measured diff or a valid `reviewed:` outcome before the per-item proposal/bead/directive retirement runs (`specs/loop/spec.md:59-62`). Wrong world: four repairs are selected, the author changes one file, the diff is a subset of the declared union, the reviewer reads and approves that one diff, and the merge retires all four items. Existing equality is only between the record’s `reviewed:` paths and the paths measured from the diff (`loop/lib/review.mjs:1086-1104`); the loop writes subjects from the actual changed paths (`loop/run.mjs:1577-1583`), not from the committed work-order set. **Fix:** require a per-item terminal status—changed and reviewed, or an explicitly accepted blocked/no-op state—before any item is retired; test the “one of four completed” red path.

4. **[MAJOR] — `specs/review/spec.md`, “A review of unchanged pages…” (`:19-73`); `tasks.md:260-283` — the unchanged-page scenario is vacuous about the bytes actually shown to the reviewer.** The scenario only requires that the brief contains a surface and no diff (`:56-60`), and task 46 asserts the absence of a fenced diff plus a moved-page refusal. It does not assert that the surface equals the current reviewed bytes, that the hash printed/bound in the brief equals the record hash, or that a tampered/stale surface makes the same test red. That is exactly the escape vqbo warns about: the review can appear to show a page while binding a different byte set. **Fix:** make the brief carry a machine-generated exact surface and hash; assert `hash(brief bytes) === hash(record binding)` on the same input path, with a red mutation for a stale/altered surface and a green control for the current one.

5. **[MAJOR] — `design.md`, D3 “Mechanism — the verifier” and “DRAFTER’S OBJECTION (D3a)” (`:219-224`, `:289-298`); `specs/loop/spec.md`, intake verification (`:469-486`) — a claimed intake guardrail is explicitly only an instruction.** The design mechanically records a failed claim, then asks the author to re-derive it; it admits that the re-derivation is “documentation, not a guardrail” and is checked only by the reviewer. That is the mechanism-documented-rather-than-enforced defect this repository’s rules specifically reject. **Fix:** either make a failed claim a hard, non-authorable state until intake records a fresh mechanical check, or require structured re-derivation evidence that the merge gate verifies. Do not label the author instruction the mechanism.

6. **[MAJOR] — `specs/loop/spec.md`, revision brief (`:551-583`); `tasks.md:117-124` — “the excerpts the verdict cited” has no structured source.** A verdict is free-form prose; no field identifies cited requirement sections, and task 19 gives no parser or validation for that relation. The implementation could resend the whole original brief, copy arbitrary excerpts, or omit a cited section while still satisfying the prose description. **Fix:** add structured section/path identifiers to the verdict or define a deterministic excerpt-selection rule; reject a revision whose cited identifiers are absent, and mutate-test both omission and unrelated padding.

7. **[MAJOR] — `proposal.md:132-138`, `design.md:197-209`, `tasks.md:9-216` — Stage 1 is not genuinely small, and the proposal contradicts its own task plan.** The proposal calls Stage 1 four items with “no new module” and “no selection change” (`proposal.md:132-138`). Stage 1 actually adds `loop/lib/train.mjs` (`tasks.md:41-43`), changes gate semantics and launch reuse, adds a train review, changes publishing scope, deletes brief-budget behavior, changes carry handling, changes runner policy/escalation, changes ledger shape, and changes breaker behavior (`tasks.md:13-216`). This is several interacting mechanisms before any work-order implementation begins. **Fix:** split the measured gate/brief improvements from the train/publish/runner redesign, or rewrite the staged claim and add explicit integration gates for the larger Stage 1.

8. **[MAJOR] — `proposal.md:3-8`, `:33-42`, `:67-75`, `:109-122`; epic `addictedtoai-douz` acceptance — provenance for the three complaint measurements is not reproducible from the supplied evidence.** The proposal presents local-day `99/69 = 1.43`, a `442.5s` gate table, and `182.4M/685K` with `96%` cached as load-bearing measurements. The supplied `beads-report.md:18-25`, `:49-75` explicitly uses UTC and reports `101/86 = 1.17`; `arch-rerun-beads.txt` also reports a different UTC table. The supplied `desk-mech-report.md:398-402` says token counts were not measured, only character estimates; `arch-design-outline.md:164-172` gives only partial gate timings, not the claimed total. The epic requires provenance and confirmation/refutation by number, not an unrepeatable correction note. **Fix:** include the exact scripts or immutable outputs used for each local-day, gate, token, and spend claim in the proposal’s provenance, then state which claims are confirmed or refuted from those reproducible inputs.

9. **[MAJOR] — `proposal.md:3-8`, `:211-240`; epic acceptance; beads report `:304-338` — the front-desk/back-desk acceptance item is not closed against a named bead.** The proposal says the idea was a comment on `addictedtoai-h0z0` and leaves machinery affordability as an open question (`proposal.md:242-256`). The read-only beads survey found no dedicated front/back/two-desk issue and describes the h0z0 text as a musing/comment, not a bead (`beads-report.md:304-338`). The epic requires that bead to be implemented by this change or closed with a stated reason. The change has a two-lane requirement, but it never identifies the acceptance object it implements or closes. **Fix:** name the exact bead and state whether this change implements its split or closes it with a reason; resolve the 10% machinery-ceiling interaction instead of leaving the back desk as an acknowledged throughput hole.

10. **[MINOR] — `specs/loop/spec.md`, gate floor (`:318-339`); `tasks.md:19-37` — the gate-duration floor is required but not defined by a reproducible measurement.** The scenario uses “under one second,” while the requirement says “any real run” and task 2 says every gate declares a floor. No source states the per-gate floors, how they are derived, or how they are refreshed when CI/Windows timing changes. **Fix:** define per-gate fixture-backed floors or a recorded calibration procedure, and test each gate’s real invocation plus the under-floor mutation.

### The seven specified hunts

1. **Vacuous scenario — found.** The unchanged-page scenario (`specs/review/spec.md:56-60`) can pass with stale or placeholder bytes; the intake scenario (`specs/loop/spec.md:497-503`) does not assert that the model was not invoked before verification. The fixes are findings 4 and the intake mechanism finding 5.
2. **Subset/equality mismatch — found.** The work-order scope is explicitly a subset check (`specs/loop/spec.md:51-55`) but retirement needs reverse completeness; see finding 3. The publish relation is correctly a subset of actual branch commits by the verified set, provided both callers actually declare it; finding 1 is the missing caller half.
3. **Bound checked at selection but not merge — numeric work-order bounds: looked and found the intended two-point check.** `specs/loop/spec.md:44-46` and `tasks.md:232-244` require bundler selection checks and merge-time remeasurement. The defect is the separate reverse item-completeness hole, not a missing second check for the four numeric bounds.
4. **Mechanism documented rather than enforced — found.** D3a says the verifier’s re-derivation is an author instruction checked by a reviewer (`design.md:289-298`); the revision-excerpt relation is another unmechanised instruction (finding 6).
5. **Live-site paths — incomplete under this design.** The full enumeration is below. The Pulse path and train post-review path cannot both answer “a real reviewer read these bytes” as written.
6. **Collision claim — checked independently.** I compared the requirement headings in all three other unarchived changes, listed below. This change does not share a heading with them; the two other Pulse changes do collide with each other.
7. **Requirement/task coverage — script run and output below.** It finds exact task-text coverage for all ADDED/MODIFIED headings, but both REMOVED headings have no exact task occurrence; the tasks only give an unnamed generic statement that tasks 35 and 57 cover them (`tasks.md:475-476`).

## Every path by which bytes reach the live site

1. **Desk work-order path:** author writes a job branch; per-job tripwire runs; a separate per-job reviewer sees the diff; the branch lands on `train`; full train gates and a separate train reviewer run; `main` fast-forwards; rederive/records are committed; the shared publish step pushes. The author’s model-written diff is read by the per-job reviewer if the review record is valid, and the train reviewer reads the train diff as specified. The post-review rederive and records commit are not shown to be read by either reviewer. The design relies implicitly on the existing deterministic-output exemption for some derived data, but it never states that exemption or proves that every post-review byte is deterministic and non-model-written. The publish-set ambiguity is a blocker (findings 1–2).

2. **Scheduled Pulse path:** fetches and snapshots, diff history, mechanical stubs, lifecycle timeline appends, derived files, build output, then `pulse/lib/publish.mjs`. No real reviewer reads each run’s generated bytes. The live review spec expressly exempts deterministic Pulse output (`openspec/specs/review/spec.md:26-30`), but the change never reconciles that exception with the maintainer’s reserved sentence, “nothing publishes that a real reviewer has not actually read.” The path also remains able to push unscoped local commits until finding 1 is fixed. A model-free exemption is the only stated basis for calling this safe; it is not a reviewer reading the generated bytes.

3. **Wrappers that invoke the Pulse:** a verifier or scheduler that starts `pulse/run.mjs` reaches the same Pulse publish path. The repository search found only the two production `publishStep` callers (`pulse/run.mjs:358` and `loop/run.mjs:2067`), but an indirect Pulse launcher is still a live route because the Pulse itself pushes. Its reviewer status is therefore the same as path 2, and its commit scope is not independently declared.

4. **Maintainer/orchestrator direct push or external fleet path:** the standing repository instructions permit a human-reviewed `git push` after the gates, and the historical fleet scripts/worktrees lived outside this repository (`proposal.md:180-195`; `hist-report.md:546-633`). The change retires that fleet by documentation/tasks (`tasks.md:391-399`) but does not mechanically prevent an old external script or a human from pushing. A real reviewer read is not enforced by this change; it is a procedural promise outside the train/Pulse mechanism. If this path remains authorised, the handoff must say that it is a maintainer-only exception and how the same gate/reviewer evidence is recorded.

5. **Vercel/live serving:** Vercel serves whatever commit a push to `main` selects; it is not a separate byte-producing path. The only in-repository push implementation is the shared step (`pulse/lib/publish.mjs:931`), but the caller scope and post-review commit set are not yet sufficient to prove that the pushed commit contains only bytes a real reviewer read.

## The five spot-checks

1. **Claim:** median merged job = 1 content file and 4 content lines; 52.9% touch exactly one content file; median `$3.20`; 24.3 wall minutes and 18.4 model minutes (`proposal.md:23-31`). **Source:** `ledger-report.md:86-95`, `:125-131`, `:181-183`. **What the source says:** exactly those medians and the 110/208 = 52.9% fraction, with the joined-cost median `$3.20`. **Verdict: matches.**

2. **Claim:** the six gates cost 442.5 seconds, including 314.8 seconds for `npm test` and 39.6 for launch (`proposal.md:33-42`). **Source:** supplied `arch-design-outline.md:164-172` plus the named `gate-timings.txt`, which is not present in the supplied scratchpad. **What the source says:** launch is 39.6 seconds, its build is 39 seconds, and surfaces is 3.7 seconds; it says the remaining timings are still to follow. **Verdict: unsupported/unreproducible as a total.**

3. **Claim:** local-day beads flow is 313 filed / 212 closed, and the last seven local days are 99 / 69 = 1.43 (`proposal.md:67-75`). **Source:** `beads-report.md:18-25`, `:49-75`, and `arch-rerun-beads.txt`. **What the source says:** the report’s explicitly stated UTC convention produces 311/211 and 101/86 = 1.17; the rerun text also uses a different UTC table. The epic’s later bead note contains the corrected local-day table, but the cited local-day script/output is not in the supplied scratchpad. **Verdict: differs from the named report; plausible only through an uncaptured correction, therefore not reproducible here.**

4. **Claim:** today’s lane read 182.4M input tokens versus 685K output, 266:1, with 96% cached and about 6.1M marginal input (`proposal.md:109-122`). **Source:** `ctx-report.md:55-70` and `desk-mech-report.md:398-402`. **What the source says:** the context report measures bytes per turn/tool call and explicitly warns about the CLI confound; the desk report says token counts were not measured, only character counts with a rough 4:1 estimate. **Verdict: unsupported by the supplied reports.**

5. **Claim:** five of one session’s seven local commits reached `origin/main` through other publish steps (`design.md:143-152`; `specs/pulse/spec.md:7-14`). **Source:** `hist-report.md:167-185`. **What the source says:** the same five-of-seven incident and the branch-wide unconditional push are recorded. **Verdict: matches.** It supports, rather than weakens, the finding that the Pulse caller must be included in commit scoping.

## Requirement-to-task coverage

The temporary script was written as `coverage-check.mjs`, run by absolute path, returned exit code 1, and was deleted afterwards. Its complete source was:

```mjs
import { readFileSync } from 'node:fs';

const root = 'D:/addictedtoai-worktrees/fleet5-designreview';
const deltaPaths = [
  `${root}/openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md`,
  `${root}/openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md`,
  `${root}/openspec/changes/two-desks-work-orders-and-trains/specs/pulse/spec.md`,
];
const taskPath = `${root}/openspec/changes/two-desks-work-orders-and-trains/tasks.md`;
const normalize = (value) => String(value)
  .toLowerCase()
  .replace(/[`*_]/g, '')
  .replace(/\s+/g, ' ')
  .trim();
const taskText = normalize(readFileSync(taskPath, 'utf8'));
const headings = [];
for (const path of deltaPaths) {
  let section = 'PREAMBLE';
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const sectionMatch = /^## (ADDED|MODIFIED|REMOVED) Requirements$/.exec(line.trim());
    if (sectionMatch) section = sectionMatch[1];
    const headingMatch = /^### Requirement:\s*(.+)$/.exec(line.trim());
    if (headingMatch && section !== 'PREAMBLE') headings.push({ path, section, heading: headingMatch[1].trim() });
  }
}
let missing = 0;
console.log(`DELTA_REQUIREMENT_HEADINGS=${headings.length}`);
for (const item of headings) {
  const hit = taskText.includes(normalize(item.heading));
  if (!hit) missing += 1;
  console.log(`${item.section}\t${hit ? 'MATCH' : 'MISSING'}\t${item.heading}`);
}
console.log(`MISSING=${missing}`);
if (missing) process.exitCode = 1;
```

Real output:

```text
DELTA_REQUIREMENT_HEADINGS=27
ADDED MATCH One job is one work order, ending in one merge or one discard
ADDED MATCH Work comes from one intake, and cannot self-amplify
ADDED MATCH A job's gates are a tripwire; the full set runs once, on the train
ADDED MATCH Merges land on an integration branch and main advances only by a green train
ADDED MATCH A red train is classified before anything is reverted
ADDED MATCH Intake routes and verifies every candidate before a model is invoked
ADDED MATCH The front desk and the back desk share an intake and never share a lane
ADDED MATCH The brief carries the requirements the work order names, and nothing else
ADDED MATCH The chain from intake to train lives in the repository
ADDED MATCH Runner selection is a declared policy, and escalation is part of it
ADDED MATCH A deferral becomes its own bead only when it names a subject or a requirement
MODIFIED MATCH The executor result protocol is how outcomes are known
MODIFIED MATCH Breakers halt the loop, and only the named ones
MODIFIED MATCH A job's ledger line is written before anything recomputes the queue from it
MODIFIED MATCH The ledger line carries the join, as a list, additively
MODIFIED MATCH The machine's work is joinable to the issue tracker
MODIFIED MATCH Routine work never touches OpenSpec; beads holds judgment work
MODIFIED MATCH A proposal a merged job consumed is retired
MODIFIED MATCH A gate failure is retried once, and the record names which kind it was
REMOVED MISSING One job is one outcome with one merge or discard
REMOVED MISSING Work comes from three sources and cannot self-amplify
ADDED MATCH A review of unchanged pages is a review of the pages, never of an empty diff
ADDED MATCH The train review is sealed from the per-job verdicts and reports what they missed
MODIFIED MATCH The reviewer judges quality with full standing, from a named reason list
MODIFIED MATCH A reviewer's non-blocking finding reaches work without editing anything
ADDED MATCH A publish pushes only the commits its caller verified
ADDED MATCH The derived queue is mirrored into the tracker outside the derive step
MISSING=2
```

The 25 added/modified headings have exact task-text matches. The two removed headings are not themselves named by a task; `tasks.md:475-476` only says generically that tasks 35 and 57 carry their bodies forward. Under the requested “every heading” test, coverage is therefore incomplete. If removed headings are intentionally excluded, the task file should say that in a machine-readable mapping rather than relying on a prose afterthought.

## D1-D7

1. **D1 — Work orders replace one-item jobs (`design.md:14-80`).** The merge-time numeric recheck and per-subject `would-cite` are sound instincts, and the objection honestly admits attention is not measured. I would add reverse per-item completion before retirement and a bounded per-subject reviewer receipt; otherwise a four-item order can finish one item and close four.

2. **D2 — Release train (`design.md:84-195`).** Renaming the red baseline result `pre-existing` rather than claiming “the world moved” is correct and should stay. I would add a recorded base SHA, a main/train advancement lock or compare-and-swap, a train-review result protocol, and an explicit rule for the post-review records/rederive commit. Without those, a concurrent Pulse or a generated records commit can make the published train differ from what the reviewer read.

3. **D3 — One backlog and two desks (`design.md:200-309`).** The derived queue remaining authoritative and the tracker being a separate mirror is well defended. I would not call the failed-claim re-derivation a mechanism until the loop can require or verify it; the design’s own D3a objection is right. I would also settle the machinery-ceiling arithmetic before calling the back desk a throughput fix.

4. **D4 — Inflow budget (`design.md:313-340`).** The two-entry, subject-keyed carry cap is a reasonable mechanical bound and the subject merge is sound. I would make over-cap and subjectless entries a merge-visible refusal or explicit residue with a structured count, rather than relying on parser/transcriber behavior whose relation to the reviewer record is not part of the merge gate.

5. **D5 — Brief diet (`design.md:344-369`).** Deleting saturation is supported by the growth evidence and is directionally right. I would replace “excerpts the verdict cited” with structured citations or a deterministic section-selection rule; free-form reviewer prose cannot safely drive a smaller revision brief.

6. **D6 — Retire the hand fleet (`design.md:373-390`).** Keeping the cross-change reviewer and requiring its findings before showing per-job verdicts is sound. I would define the train reviewer’s categorical output, record, edit-discard assertion, and behavior on missing output before treating it as a gate; I would also explicitly revoke or fence the external hand-fleet publish path.

7. **D7 — Runner policy (`design.md:393-481`).** Keeping model/provider/harness names in `runners.yml` and stating policy shape rather than today’s IDs is correct and preserves portability. I would mark the exact policy provisional in the spec/ledger because the supporting Luna samples are small (`design.md:450-453`), and require a measured rollback/escalation rule rather than treating the current table as settled quality evidence.

## What I checked that was sound

- The existing review edit-rights mechanism is real: `runReview` resets/cleans the reviewer worktree, removes it, and checks the reviewed branch SHA afterward (`loop/lib/review.mjs:1145-1206`). The design keeps that property.
- The design preserves the closed verdict/reason model and expands `would-cite` per subject (`specs/review/spec.md:129-179`).
- The four work-order numeric bounds are explicitly required at selection and merge (`specs/loop/spec.md:33-46`), and the tasks include mutation tests for the per-subject bound (`tasks.md:236-244`).
- D2’s `pre-existing` classification is materially more honest than “the world moved” (`design.md:188-195`).
- Keeping the derived queue pure and mirroring it outside derivation is compatible with the live Pulse constitution (`specs/pulse/spec.md:484-498`; delta `specs/pulse/spec.md:64-86`).
- The collision claim is sound for this change: I checked `let-the-queue-see-a-judgment`’s loop/pulse headings, `keep-the-map-describing-the-territory`’s pulse/education headings, and `bind-what-the-catalog-knows`’s wiki headings. None is one of this change’s headings; the two other Pulse deltas do share the live queue/corroboration headings with each other, which this change does not touch.

## What I could not settle

- No implementation of the proposed train, work orders, or new publish scope exists in this checkout, so I could not observe a real train review, a concurrent Pulse/main movement, or a remote deploy. Those need fixture tests that read the remote commit and a live-site observation after implementation.
- The maintainer’s literal reserved sentence and the live review spec’s deterministic Pulse exemption are not reconciled. I recorded the exact behavior: Pulse-generated bytes are not read by a per-run reviewer, and the design relies on the exemption. The maintainer must state whether “nothing” means all bytes or model-written bytes plus reviewed machinery.
- The corrected local-day beads table may exist only in the epic’s later note; the named local-day script/output was not present in the supplied scratchpad, so I could not reproduce 99/69 from the provided evidence.
- I did not run `npm test`, a build, the Pulse, or any `verify-*` script, as required. No repository artifact, source spec, or code file was edited.
