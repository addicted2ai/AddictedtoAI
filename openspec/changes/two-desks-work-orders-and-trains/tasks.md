# Tasks

Four stages. **Stage 0 ships first and alone**: no new module, no new branch,
nothing on the merge or publish path, every item a local edit to an existing file
with a test and a named mutation, and every item independently reversible. It is
also where the baseline measurement is taken, while brief-commit → merge means
what it meant when the 5.5-minute figure was measured.

Each later stage starts only when the previous stage's measurement task has been
recorded and read. Every testing task names the **mutation** that proves it
measures something: the named change to production code, the test that must go red
on the same input path, and restoration verified by hash.

Tasks marked **[orchestrator]** touch `CLAUDE.md`, `AGENTS.md`, `runners.yml` or
`data/config.json`. Those are reserved paths: no job may edit them, and these are
the orchestrator's work between runs.

## Stage 0 — measurable local edits, and the baseline

### The gate floor and the launch build

- [ ] 1. `loop/lib/gates.mjs`: every gate declares a **floor duration**, derived
      from a recorded calibration of that gate's runtime on this repository with a
      stated margin and the date it was taken; `runGates` fails the stage when a
      gate returns below its floor, naming the gate and the observed duration.
      Invoke npm scripts through `cmd.exe /c`, never `shell: true`. Implements:
      *A job's gates are a tripwire; the full set runs once, on the train*, the
      floor bullets.
- [ ] 2. `loop/tests/gates.test.mjs`: a fake gate returning exit 0, no output, in
      2 ms fails the stage naming the floor; a real gate above its floor passes.
      **Mutation**: delete the floor comparison and confirm the 2 ms case passes
      while the real case still passes — if both stay green the test measures
      nothing. Restore and verify byte-identical by hash. Tests task 1.
- [ ] 3. `scripts/verify-launch.mjs`: reuse an existing build of the tree under
      check instead of spawning its own when one is present and current; keep
      spawning one when it is not. The timer at `:832` and the report at `:847`
      then report the reuse. Implements the same requirement's reuse bullet.
- [ ] 4. `scripts/tests/verify-launch.test.mjs`: with a present build the run
      **spawns no build process** — asserted on the spawn, not only on the branch —
      and reports reuse; with none it builds. **Mutation**: make the presence check
      always return false and confirm the reuse case fails while the build case
      still passes. Tests task 3.

### The brief diet

- [ ] 5. `loop/lib/specs.mjs`: delete pass 2b (`:317-330`). Excerpts become the
      requirements the governing type and the declared subjects name plus the
      pending-amendment deltas for those requirements only. Implements: *The brief
      carries the requirements the work order names, and nothing else*, bullet 1.
- [ ] 6. `loop/lib/config.mjs`: the per-source excerpt budget stops dividing across
      unarchived changes. Implements the same requirement's bullet 2.
- [ ] 7. `loop/lib/config.mjs`: **lower `BRIEF_EXCERPT_MAX_CHARS` from 88,000 to
      24,000**, its value before the four raises. Deleting pass 2b removes
      saturation; it does not lower a ceiling, and a ceiling four times the size of
      the material below it bounds nothing. Implements the same requirement's
      ceiling bullet.
- [ ] 8. `loop/tests/specs.test.mjs`: a fixture with three unarchived changes and a
      `repair` type produces the same excerpt set as one with zero, **and the
      assembled brief is at most 30,000 characters against the live tree** — an
      upper bound on the artifact, not merely unspent budget. **Mutation A**:
      restore pass 2b and confirm the size assertion fails while the excerpt-set
      assertion still passes. **Mutation B**: restore the ceiling to 88,000 and
      confirm the size assertion fails. Tests tasks 5–7.
- [ ] 9. `loop/lib/specs.mjs` and `loop/lib/brief.mjs`: deleting pass 2b makes
      `specs.mjs:335`'s `truncated` flag true far more often, which changes the
      brief's "read the full files" guidance. Update that guidance to say what
      truncation now means. Test: a brief whose excerpts are bounded carries the
      corrected wording. Implements the same requirement's bullet 1 rider.
- [ ] 10. `loop/lib/verdict.mjs` and `loop/lib/review.mjs`: a verdict record MAY
      carry a structured `cites:` list of requirement headings, validated against
      the live specification's headings the way reasons are validated against the
      closed reason list; a heading resolving to no requirement is refused.
      Implements: *The reviewer judges quality with full standing, from a named
      reason list*, the `cites:` bullet.
- [ ] 11. `loop/lib/brief.mjs`: `assembleRevisionBrief` carries the verdict, the
      acceptance checks, the diff and the excerpts **for exactly the headings
      `cites:` names** — and not `briefText` whole (`run.mjs:734`). An empty
      `cites:` yields the checklist's requirements for the governing type and
      nothing else. Implements: *The brief carries…*, revision bullets.
- [ ] 12. `loop/tests/brief.test.mjs`: a revision brief is strictly smaller than its
      author brief, contains the excerpt for each cited heading, and contains no
      section for an uncited one. **Mutation A**: prepend the whole original brief
      and confirm the size assertion fails. **Mutation B**: ignore `cites:` and
      send the governing type's whole checklist, and confirm the
      no-uncited-section assertion fails — omission and padding must both be
      caught. Tests tasks 10–11.

### The carry channel and the filing lint

- [ ] 13. `loop/lib/verdict.mjs` and `loop/lib/carry.mjs`: `subject` becomes
      **required** on a `carry:` entry; an entry without one is refused and
      reported naming the record. A finding whose subject already carries standing
      findings merges into that subject's item. **No numeric cap** is added.
      Implements: *A reviewer's non-blocking finding reaches work without editing
      anything*, the subject and merge bullets.
- [ ] 14. `loop/lib/review.mjs`: the reviewer's brief documents both fields and the
      required subject. Implements the same requirement's brief bullet.
- [ ] 15. `loop/tests/carry.test.mjs`: a subject-less entry is refused; a second
      finding on a carried subject produces no second item; five entries in one
      record are all accepted. **Mutation A**: make `subject` optional again and
      confirm the refusal test fails. **Mutation B**: reinstate a cap of two and
      confirm the five-entry test fails — the absence of a cap is a decision under
      test, not an omission. Tests tasks 13–14.
- [ ] 16. `scripts/lint-deferrals.mjs` (new, standalone): take **a JSON export path
      as its argument** and report every open issue that names neither a subject
      path nor a specification requirement, exiting non-zero only under a
      `--strict` flag. **It SHALL NOT spawn the tracker**: the delta reserves
      tracker invocation to exactly one module, and that module does not exist
      until task 67 in Stage 3. The operator produces the input with
      `bd list --json > <file>` and passes the file, the same shape
      `evidence/scripts/machinery-share.mjs` and `open-by-day.mjs` already use.
      Implements: *A deferral becomes its own bead only when it names a subject or
      a requirement*, the reporting bullet.
- [ ] 17. `scripts/tests/lint-deferrals.test.mjs`: a fixture export in which an
      issue naming a path is not reported and one naming neither is reported by id.
      **Mutation A**: skip unroutable issues silently and confirm the reporting
      assertion fails. **Mutation B**: have the script spawn the tracker instead of
      reading the file, and confirm a source check that no module outside
      `loop/lib/beads.mjs` spawns it goes red. Tests task 16.
- [ ] 18. **HELD, pending the maintainer's answer to open question 6.**
      `CLAUDE.md` and `AGENTS.md`: state the bounded filing rule — a deferral
      becomes its own issue only when it names a subject path or a specification
      requirement and cannot be fixed in the same job; otherwise a note on the
      parent issue; a machinery issue that would spawn more than one follow-up is
      stopped and reconsidered. **[orchestrator]** — and held because the rule
      being amended is the maintainer's own, in his words: *"Any time something
      like this pops up, file a beads issue or it will get lost!"* Do not do this
      task until he answers.

### The runner policy and the record

- [ ] 19. **Build the effort ladder in the registry.** `runners.yml`: add
      `codex-gpt-luna-high` and `codex-gpt-luna-xhigh` entries — same model, same
      lane, same cheap tier, differing only in `model_reasoning_effort`
      (`high` / `xhigh`; both accepted by `codex`, verified by running it, as
      `medium` and `max` are, while a bogus value is rejected). Run
      `node loop/conformance.mjs --runner <id>` against each and commit the record:
      the `max` entry's four checks cost 2.61 / 2.28 / 2.26 / 0.66 model-minutes,
      so this is cheap. Then declare `job_types` **per rung** — `medium` narrows
      from `[interpret, verify, entry, tutorial, education, repair, prune,
      machinery]` to `[repair, interpret]`, `high` carries the rest of the
      authoring types, `xhigh` is the reviewer rung — plus the escalation target
      and each entry's role clearance, as data. Implements: *Runner selection is a
      declared policy, and escalation is part of it*, the ladder and starting-rung
      bullets. The registry is the only file that may name a model or an effort.
      **[orchestrator]**
- [ ] 20. `CLAUDE.md` and `runners.yml`: correct the conformance paragraph and every
      `conformance:` field from `data/conformance.json` as read 2026-09-08 — seven
      runners recorded, six pass all four checks (`claude-code-sonnet`,
      `claude-code-opus`, `opencode-deepseek`, `opencode-muse-spark`,
      `codex-gpt-luna` 15:46:57Z 09-07, `codex-gpt-luna-medium` 22:10:07Z 09-07)
      and `opencode-openrouter-muse-spark` fails all four. `CLAUDE.md` says four
      runners and calls `codex-gpt-luna` a FAIL for an expired login; its own
      instruction is that the JSON is the authority and that the passage "has now
      been wrong twice" — this is the third. **[orchestrator]**
- [ ] 21. `loop/lib/select.mjs` and `loop/lib/runners.mjs`: escalation moves into the
      repository and fires when the **top-ranked** candidate is refused *solely* on
      `runner:job-type`; no other refusal escalates. Implements the same
      requirement's escalation bullets.
- [ ] 22. `loop/tests/runner-policy.test.mjs`: a top-ranked clearance-only refusal
      escalates and authors the top-ranked candidate; a budget-ceiling refusal does
      not escalate; **and the control that matters** — an overdue scout top-ranked
      and refused on clearance with one cleared `repair` below it authors the
      scout, not the repair. **Mutation**: escalate only when every candidate is
      refused, and confirm the scout case fails while the other two still pass.
      Tests task 21.

### The ledger fields, and the baseline

- [ ] 23. `loop/lib/ledger.mjs`: every phase entry records the runner and the effort
      it ran at; every line records `brief_chars`, a `gate_seconds` map, and the
      count of findings each review carried. All additive; `LEDGER_FIELDS` not
      extended. Implements: *The ledger line carries the join, as a list,
      additively*, the measurement bullet, and *Runner selection is a declared
      policy*, bullet 4, and *A reviewer's non-blocking finding…*, the ledger
      bullet.
- [ ] 24. `loop/tests/ledger.test.mjs`: a line carries runner and effort per phase,
      `brief_chars`, `gate_seconds` and a carried-entry count; a pre-existing line
      without any of them still validates. **Mutation**: extend `LEDGER_FIELDS` to
      require `gate_seconds` and confirm the old-line test fails — the additive
      property is the thing under test. Tests task 23.
- [ ] 25. `loop/lib/git.mjs:116`: `worktree remove --force` becomes a removal that
      **refuses** rather than forcing when it cannot complete. Implements: *The
      chain from intake to train lives in the repository*, the teardown bullet —
      a requirement that had a scenario and no task, and whose absence deleted 177
      packages from the real `node_modules`. Test with a **mutation** restoring
      `--force`, which must make the refusal assertion fail.
- [ ] 26. **Measure `bd` before anything mocks it.** Against a throwaway store:
      whether `--claim` keys the actor; whether a second claim under a different
      actor fails; whether `close` on an already-closed issue no-ops; whether
      `close_reason` survives a reopen; whether non-empty `metadata` round-trips
      through `ready --json`; and **whether several ids fit one argv on Windows**.
      Record the answers in `evidence/`. Costs nothing and blocks nothing, which is
      why it is here and not two stages away.
- [ ] 27. `evidence/README.md`: an invocation line beside every script row, read
      from each script's own header, marking any that needs a session-scoped path
      as such. Record the `orch-backlog-classify.mjs` gap: named in the
      adjudication, not present here, its four figures carried on attribution.
- [ ] 28. **The baseline — taken, on the definition the stage gates use.** Done:
      `evidence/stage0-baseline.md`, from
      `evidence/scripts/stage0-baseline.mjs` (n = 206 of 208 `done` jobs, each
      anchored on its ledger line's `ts` and the parent of its records commit).
      **On the new definition — brief-commit → merge —** the wall-clock median is
      **22.81 min** all-time and **23.35 min** since 09-01, and the overhead
      (wall minus model-minutes) median is **3.85 / 3.90 min**. On the **old**
      definition — brief-commit → records-commit — the overhead median is
      **5.497 / 5.52 min**, which reproduces `desk-mech-report.md`'s 5.5 almost
      exactly and is what validates the method rather than a separate claim.
      Record both definitions in `data/launch.json` with the date and the method,
      so that a later reader cannot compare one against the other by accident.
      **[orchestrator]**
- [ ] 29. **Stage-0 interim measurement, and what it may and may not claim.**
      After 20 merged jobs, record `brief_chars` and the saved launch build against
      task 28's baseline.
      **The `brief_chars` baseline is the recent window — jobs since 2026-09-06,
      roughly 70,000–104,000 characters — and NOT the all-time median of 37,183.**
      The all-time median is already below the 45,000 figure the later gate uses,
      so measuring against it would make that gate vacuous on day one; the series
      it comes from (16,181 → 33,491 → 70,349 → 103,881) is the reason the recent
      window is the honest comparator. The gate compares **post-change jobs only**.
      **The overhead threshold is not Stage 0's to meet.** At 3.85 min on the new
      definition, and with the diet touching prompt size rather than wall-clock,
      Stage 0 has no mechanism that moves it; the 1.5-minute target belongs to
      Stage 1's gate, where the train is what would move it. Stage 0's own claim is
      `brief_chars` and one build.

## Stage 1 — the train alone, at one worker

- [ ] 30. `loop/lib/gates.mjs`: `DEFAULT_GATES` becomes `['build',
      'verify-surfaces']` and a frozen `TRAIN_GATES` carries the full six in order.
      `loop/run.mjs` drops the post-merge build call site (`:1661`). Implements:
      *A job's gates are a tripwire…*, bullets 1 and 3.
- [ ] 31. `loop/run.mjs` and `loop/lib/train.mjs` (new): **the tripwire builds the
      merged tip**, under the merge lock, not the branch; a red merged tip reverts
      the merge at once with no search. This is what keeps "green apart, red
      together" caught per merge after the post-merge build is deleted. Implements
      the same requirement's merged-tip bullet.
- [ ] 32. `loop/tests/tripwire.test.mjs`: two work orders each green alone and red
      combined — the second merge's tripwire is red and that merge is reverted
      immediately. **Mutation**: build the branch instead of the merged tip and
      confirm the combined case passes when it must not. Tests task 31.
- [ ] 33. `loop/lib/train.mjs`: the integration branch, the merge lock,
      **subject-disjoint merges**, the `K`/`T`/idle triggers, the `B_train` and
      `S_train` bounds with the prefix-that-fits rule, and workers branching from
      `train`. Implements: *Merges land on an integration branch and main advances
      only by a green train*.
- [ ] 34. `loop/lib/train.mjs`: the ordered run — full gate set; **one rederive**;
      **then the train review over the whole diff including the rederived data**;
      then the records commit; then the publish. Implements the same requirement's
      ordering bullets and *The train review is sealed…*'s diff bullet.
- [ ] 35. `loop/tests/train.test.mjs`: five merges trigger one train running the
      full set once, one rederive, one records commit, one push; two merges plus
      elapsed `T` trigger a train on two; seven merges past `B_train` run on the
      prefix that fits; a job whose subjects overlap a merge on the train waits.
      **Mutation A**: rederive per merge and confirm the single-recomputation
      assertion fails. **Mutation B**: assemble the train review before the rederive
      and confirm the assertion that the reviewed diff contains the regenerated
      files fails. Tests tasks 33–34.
- [ ] 36. `loop/lib/train.mjs`: the red path — classification re-run on the pre-train
      commit first; `pre-existing` **holds** the train (reported every run, one
      upkeep item, no `HOLD.md`, merge lock admits nothing further);
      **leave-one-out over the whole train** otherwise; revert `-m 1`, mark
      `evicted-at-train`, reopen beads, re-run gates **and review**; still red →
      whole-train rejection; no single removal clears it → whole-train rejection.
      The train records the local date it began under and refuses a search that
      would cross a change in it. Implements: *A red train is classified before
      anything is reverted*.
- [ ] 37. `loop/tests/train-red.test.mjs`: four fixtures — pre-train red; a defect
      latent in an **early** merge surfacing at the last; no single removal
      clearing it; and a date change mid-search. Assert the classification, the
      reverts, the re-review after eviction and the ledger marks in each.
      **Mutation A**: replace the classification re-run with "assume a merge did
      it" and confirm only the pre-existing case fails. **Mutation B**: replace
      leave-one-out with a **prefix search** on the fixture whose defect is latent
      in an early merge, and confirm it isolates the wrong merge — a prefix search
      returns the newest, which is the answer "revert the newest" gives and the
      reason leave-one-out exists. Tests task 36.
- [ ] 38. `loop/lib/train.mjs`: an evicted merge replayed alone on a fresh train that
      passes is recorded on the ledger as an eviction made wrongly. Implements the
      same requirement's auditability bullet. Test with a **mutation** that never
      records the replay result, which must make the audit assertion fail.
- [ ] 39. `loop/lib/review.mjs`: `assembleTrainReviewBrief` — the whole train diff,
      the checklists of every kind it touches, the reviewer rung declared in the
      registry, and **no
      per-job verdict record**. The seal is **ordered file access**: the per-job
      verdicts sit in a separate file the reviewer is told to open only after
      writing its own findings file, and the assembler verifies the findings file
      exists before exposing the verdicts. Implements: *The train review is sealed
      from the per-job verdicts and reports what they missed*.
- [ ] 40. `loop/lib/review.mjs`: the train review produces a verdict record on the
      ordinary protocol — a verdict from the closed list, `would-cite` per prose
      piece, the same refusals — and an **absent, empty or malformed record fails
      closed**: no fast-forward, no publish. Implements the same requirement's
      protocol bullet.
- [ ] 41. `loop/lib/train.mjs`: a non-approving train review evicts the merges its
      findings name (`evicted-at-train`, reason review) and re-runs gates and
      review; a finding naming no merge rejects the whole train; two consecutive
      non-approvals over unchanged merges reject the whole train. Implements the
      same requirement's red-path bullets and *A red train…*'s fourth row.
- [ ] 42. `loop/tests/train-review.test.mjs`: the assembled brief contains none of
      the per-job records' text; a missing record fails closed; the
      not-in-any-record count lands on the train's line; a finding naming one merge
      evicts it and triggers a re-review. **Mutation A**: interpolate the per-job
      verdicts into the brief and confirm the seal assertion fails. **Mutation B**:
      treat an absent train-review record as an approval and confirm the
      fail-closed test goes green when it must not. Tests tasks 39–41.
- [ ] 43. `pulse/lib/publish.mjs`: the caller declares **the SHA its gates ran
      over**; the step pushes `<sha>:main` and refuses only when that SHA is not a
      descendant of the remote tip, naming both; it reads `data/config.json`'s
      publish flag **itself**; it does not push while `HOLD.md` stands; a scope
      refusal writes no `HOLD.md` and the run states it published nothing and why.
      Implements: *The Pulse publishes what it builds*, the push bullets.
- [ ] 44. `pulse/run.mjs` **and** `loop/lib/train.mjs`: both callers construct and
      pass their verified SHA. Changing only the shared step leaves no caller that
      constructs the scope, which is the whole of `addictedtoai-zuoo` left open
      under a requirement claiming to close it. Implements the same bullets, caller
      side.
- [ ] 45. `pulse/run.mjs`: the run's own data and content commit lands on `train`,
      not `main`. Implements the same requirement's integration-branch bullet.
- [ ] 46. `pulse/tests/publish-scope.test.mjs`: a throwaway repository with a **bare
      origin** in the OS temp directory. A declared SHA plus a later local commit
      pushes only the declared tree — read back with `git show --name-only`
      **off the remote**, never from the local tree; a non-descendant SHA is
      refused naming both; a caller asserting the flag while `data/config.json`
      reads false pushes nothing; a standing `HOLD.md` suppresses the push. Never a
      test whose red path is a live push. **Mutation A**: push the branch instead of
      the SHA and confirm the later-commit case fails. **Mutation B**: trust the
      caller's flag assertion and confirm the flag case fails. Tests tasks 43–45.
- [ ] 47. `loop/lib/breakers.mjs`: breaker 2 reads the **train's** build; a build
      classified `pre-existing` does not trip it; `evicted-at-train` never counts
      toward breaker 1; a tracker-unreachable refusal is not a halt. Implements:
      *Breakers halt the loop, and only the named ones*. Test with a **mutation**
      counting `pre-existing` as a breaker-2 trip, which must write a false
      `HOLD.md` on a three-night fixture.
- [ ] 48. `loop/run.mjs` and `loop/lib/train.mjs`: every merged job's ledger line is
      appended before the train's single rederive. Implements: *A job's ledger line
      is written before anything recomputes the queue from it*, the batching
      bullet. Test: five merges, one rederive, none re-advertised. **Mutation**:
      rederive before the fifth line is appended and confirm exactly the fifth item
      is re-advertised.
- [ ] 49. `loop/lib/gates.mjs`: the retry-once policy per gate stage — a job's
      tripwire retries its two gates; **a train retries the failing gate, not the
      set**; the classification re-run is a measurement and consumes neither.
      Implements: *A gate failure is retried once, and the record names which kind
      it was*, its new first bullet. Test with a **mutation** making the train retry
      the whole set, which must make the "one re-run of the failing gate"
      assertion fail.
- [ ] 50. **Stage-1 measurement, and the gate on Stage 2.** Record in
      `data/launch.json`, with date and method: per-gate seconds per train,
      evictions and how many were later recorded wrong, `pre-existing` holds, and
      the per-job brief-commit → merge figure against task 28's baseline.
      **Stage 2 does not start while any eviction in the last twenty trains is
      recorded as wrong**, and does not start unless the per-job brief-commit →
      merge overhead has fallen below **1.5 minutes** against task 28's baseline of
      3.85. That threshold is Stage 1's because the train is the mechanism that
      moves it. **[orchestrator]**

## Stage 2 — work orders

- [ ] 51. `loop/lib/select.mjs`: a bundler grouping affordable candidates by
      coherence key within the four bounds; it **splits** an over-bound set into
      more work orders and **refuses at selection**, with a recorded reason, an item
      that alone exceeds the per-subject bound. Implements: *One job is one work
      order, ending in one merge or one discard*, the coherence, bounds and split
      bullets.
- [ ] 52. `data/config.json`: add `work_order.max_items` 4, `max_subjects` 4,
      `max_reviewed_bytes` 60000, `max_reviewed_bytes_per_subject` 30000, and the
      train's `merges` 5, `minutes` 90, `workers` 3, `max_reviewed_bytes` 150000,
      `max_subjects` 12. **[orchestrator]**
- [ ] 53. `loop/run.mjs`: `.job/source.json` gains `items` and `declared_subjects`,
      committed at selection before any executor runs; a missing or empty
      declaration is a merge refusal. Implements the same requirement's structured
      list and empty-declaration bullets.
- [ ] 54. **The root fix, and it is one task because it is one defect.**
      `loop/run.mjs:1577-1594`: the merge's subject set is **constituted** from the
      committed `declared_subjects` — on the `reviewed:` outcome, from the
      executor's declared paths intersected with it — and the measured diff is used
      only to **check** it: every diff content path inside the declaration
      (`scope-violation` otherwise), and every item retired only with a measured
      diff on its own subjects or a `reviewed:` declaration covering them.
      Unretired items stay open and the line records the order partially done.
      Separately, make the empty-set refusal at `:1594` **unconditional** — today it
      is itself guarded on `subjects.length`, so the empty set neither records nor
      logs. Implements the same requirement's constitution, retirement and
      empty-set bullets, and *The executor result protocol…*'s `reviewed:` subject
      bullet.
- [ ] 55. `loop/tests/work-order.test.mjs`: four repairs on one page bundle into one
      order; a mixed-category pair does not; an undeclared diff path is refused; a
      bundle inside the total but over the per-subject limit is refused; **four
      items declared and one file changed retires one item and leaves three open**;
      a `reviewed:` outcome with an empty diff writes a record binding both declared
      pages; an empty subject set logs and refuses. **Mutation A**: constitute
      `subjects` from the diff again and confirm the `reviewed:` case writes no
      binding. **Mutation B**: drop the per-item measured-diff check and confirm
      three of four items are wrongly retired. **Mutation C**: derive declared
      subjects by matching paths in the brief text, and confirm a fixture whose
      brief says "do NOT touch `pulse/lib/queue.mjs`" then authorises that path.
      Tests tasks 51, 53, 54.
- [ ] 56. `loop/lib/review.mjs` `mergeGate`: re-measure all four bounds against the
      work the job produced, and **against the declared pages' reviewed surfaces**
      on the empty-diff outcome. Implements the same requirement's enforced-twice
      bullet. Test with a **mutation** measuring the empty diff instead, which must
      let four whole pages through a bound sized for four diffs.
- [ ] 57. `loop/lib/brief.mjs`: render N outcome blocks and N subject blocks under
      one scope rule, keyed on the governing type, including intake's verification
      results where present. `acceptanceChecksFor` and `checklistFor` read the
      governing type. Implements the same requirement, brief side.
- [ ] 58. `loop/lib/review.mjs` and `loop/lib/verdict.mjs`: `would-cite-for` as a
      list of entries sharing `reads-human-from`'s parser and entry shape; the
      duplicate check per entry across other records; two entries in one record may
      match; **"prose piece" is the schema's prose kinds**, not any content file.
      Implements: *The reviewer judges quality with full standing…*.
- [ ] 59. `loop/tests/would-cite.test.mjs`: three prose subjects with one
      record-wide field is refused naming the unanswered two; an entry per subject
      passes; two identical entries in one record pass; an entry duplicating
      another record's statement is refused; a directory row among the subjects
      requires no entry. **Mutation A**: make the duplicate check ignore entries and
      confirm only the cross-record case fails. **Mutation B**: define a prose piece
      as any `content/**.md` and confirm the directory-row case fails. Tests
      task 58.
- [ ] 60. `loop/lib/result.mjs`: `reviewed: <path>[, <path>…]` as a fourth first-line
      form, accepted only when every path is in `declared_subjects` **and** already
      reads `mismatched` at the merge base; `failed` naming the path and the missed
      precondition otherwise; an empty diff on this outcome is not a failure.
      Implements: *The executor result protocol is how outcomes are known*.
- [ ] 61. `loop/lib/review.mjs`: the review brief for that outcome carries each
      declared page's **machine-generated** reviewed surface and its hash, **no diff
      section at all**, a gates section stating the gates ran on a tree identical to
      the merge base and are therefore not evidence about the pages, and the
      checklist for each page's kind. Implements: *A review of unchanged pages is a
      review of the pages, never of an empty diff*.
- [ ] 62. `loop/run.mjs`: record each declared page's reviewed-surface hash on the
      branch at review-brief assembly; re-measure at merge; **the hash the record
      binds must equal the hash of the bytes the brief carried**, and the merge is
      refused and the run settled `failed` naming the path where they differ.
      Implements the same requirement's hash bullets.
- [ ] 63. `loop/tests/reviewed-outcome.test.mjs`: a declared, already-mismatched page
      ratifies and its record binds the current bytes; an undeclared path is
      refused; a page that was not mismatched is refused; a page moved on `train`
      between brief assembly and merge is refused; and **`hash(brief bytes) ===
      hash(record binding)`** on the same input path. Assert the brief contains no
      fenced block at all. **Mutation A**: emit the diff section unconditionally and
      confirm the empty-fence assertion fails. **Mutation B**: put a stale copy of
      the page in the brief and confirm the equality assertion fails while a
      presence-only assertion would still pass. Tests tasks 60–62.
- [ ] 64. `loop/lib/proposals.mjs` and `loop/run.mjs`: proposal consumption and
      directive marking run per item, gated on the same per-item evidence task 54
      requires. Implements: *A proposal a merged job consumed is retired*. Test with
      a **mutation** consuming both items' proposals when only one item was done,
      which must leave a proposal wrongly retired.
- [ ] 65. `loop/lib/ledger.mjs`: the `items` key and the partially-done marker,
      omitted when empty, `LEDGER_FIELDS` unextended. Implements: *The ledger line
      carries the join, as a list, additively*, its `items` bullets. Same additive
      mutation as task 24.
- [ ] 66. **Stage-2 measurement, and the decision rule stated in advance.** Record
      merged items per train, distinct subjects per work order, and **train-review
      findings present in no per-job record, per subject**. **If that proxy rises
      with `N` over the first twenty work orders, `N_max` is lowered before any
      other bound is tuned** — it is the only signal available that batching is
      costing review coverage, which is the `addictedtoai-zrsg` property.
      **[orchestrator]**

## Stage 3 — intake, the two desks, more than one worker

- [ ] 67. `loop/lib/beads.mjs` (new): the single `bd` **invocation** choke point —
      mint, claim, close, read-back verification, orphaned-claim release, retry of
      unverified closures — with `--sandbox` on every call and every call site
      set-valued. It **names `loop/lib/issues.mjs` as the existing format module**
      and defines no second id format: `issues.mjs:1-56` already states the
      format/existence split and the Vercel reason. Implements: *The machine's work
      is joinable to the issue tracker*.
- [ ] 68. `loop/lib/beads.mjs`: closure **refuses** while the bead carries unresolved
      deferral notes, naming them, with a `--promote` path that mints a bead per
      note carrying the parent id. Implements the same requirement's closure
      bullets and *A deferral becomes its own bead…*.
- [ ] 69. `loop/tests/beads-boundary.test.mjs`: a static assertion that no file under
      `lib/` and no prebuild step imports `loop/lib/beads.mjs` or spawns the
      tracker. **Mutation**: add such an import to a `lib/` file and confirm the
      test fails — the build must never acquire a dependency the host lacks. Tests
      task 67.
- [ ] 70. `loop/tests/beads-lifecycle.test.mjs`: only the named points touch the
      tracker; a job closing its own bead is recorded unverified; an unverified
      closure retries later; a close with unresolved notes refuses and `--promote`
      mints them. **Mutation**: trust the close command's exit code instead of
      reading back, and confirm the self-closed case passes when it must not. Tests
      tasks 67–68.
- [ ] 71. `loop/intake.mjs` (new): the router — desk, shape, subjects, record state,
      blocked/deferred/claimed, clearance, category, coherence key — keying on
      **declared metadata, never on a title or prose**; an undeclared mixed-path
      candidate is reported for a person, with the recorded default applied
      meanwhile. Plus the machinery-share-of-inflow report. Implements: *Intake
      routes and verifies every candidate before a model is invoked*, routing and
      reporting bullets.
- [ ] 72. `loop/intake.mjs`: the verifier — path exists, quoted string occurs, cited
      line still reads as claimed — writing each failure as a note and carrying it
      into the brief; a failed claim routes as needing re-derivation. Implements
      the same requirement's verification bullets.
- [ ] 73. `loop/tests/intake.test.mjs`: a bead asserting a word that occurs nowhere
      in the named file routes as needing re-derivation and its failure reaches the
      brief; a bead declaring its desk routes by that declaration; an undeclared
      mixed-path bead is reported, not guessed; an unreachable tracker refuses with
      the refusal status and no `HOLD.md`; **and verification completes with no
      executor invocation recorded**. **Mutation A**: report success on a missing
      string and confirm the first case fails. **Mutation B**: route on a title
      regex and confirm the declaration case still passes while the
      report-for-a-person case fails. Tests tasks 71–72.
- [ ] 74. `loop/lib/select.mjs`: sources become routed beads, the derived queue and
      proposals, in priority-band order; the scout's overdue floor above routed
      beads; **a queue floor** after N consecutive runs in which the queue was
      reachable and not reached; **automatic deferral** of a candidate whose run
      produced no result or ended failed/discarded. Intake owns expiry and
      duplicate suppression. Implements: *Work comes from one intake, and cannot
      self-amplify*.
- [ ] 75. `loop/lib/proposals.mjs`: delete `sweepExpired` (`:380`),
      `sweepExpiredProposals` (`:420`) and `discardDuplicate` (`:346`); keep the
      over-cap drop and the self-amplification discard, which bound a job's own
      output and are conflict-of-interest guards rather than traffic guards.
      Implements the same requirement's expiry and duplicate bullets.
- [ ] 76. `loop/tests/select.test.mjs`: an overdue scout outranks forty routed beads;
      a rejected-slug candidate is not routed; an expiring proposal outranks the
      queue and a discarded one does not; the queue floor fires after N unreached
      runs; a candidate that produced no result is not reselected next run.
      **Mutation A**: drop the queue floor and confirm the starvation case fails —
      deleting the directives file does not delete the starvation. **Mutation B**:
      drop the automatic deferral and confirm the reselection case fails. Tests
      tasks 74–75.
- [ ] 77. `loop/lib/select.mjs` and `loop/lib/budget.mjs`: the two lanes — content
      types on the front desk against the floor and new-writing ceiling, machinery
      and tracker work on the back desk against the machinery ceiling, machinery
      reachable directly in its own band, and an idle front desk running the scout
      or nothing. Implements: *The front desk and the back desk share an intake and
      never share a lane*.
- [ ] 78. `loop/tests/desks.test.mjs`: an idle front desk with machinery candidates
      ready selects the scout or nothing; a routed machinery bead is offered with no
      proposal file present. **Mutation**: let the front desk fall through to
      machinery and confirm the first case fails — this is today's behaviour and the
      72-model-minute measurement it produced. Tests task 77.
- [ ] 79. `loop/chain.mjs` (new): intake → up to `W` workers, each an ordinary
      `loop/run.mjs` invocation in its own worktree → train. `STOP` and `HOLD.md`
      checked before each worker and before the train; **stop on a failed run**;
      the lock-wait budget the train's own gates need. Implements: *The chain from
      intake to train lives in the repository*.
- [ ] 80. `loop/lib/`: the **selection lock** (read ledger → mint id → create branch
      → commit `.job/`) and the **ledger lock** (every append, including the paths
      that never merge), both carrying more than a process id, over **one** ledger
      file. Implements the same requirement's lock bullets.
- [ ] 81. **The budget reservation.** `loop/lib/budget.mjs` and
      `loop/lib/select.mjs`: under the selection lock a selected job writes a
      reservation — its per-invocation cap, its category, its tier — and the
      ceilings and the floor are computed over recorded spend **plus** live
      reservations; a reservation clears when the job's ledger line lands or the
      job is abandoned. Implements: *The chain from intake to train lives in the
      repository*, the reservation bullet. Test: two workers select simultaneously
      against a category with room for one job of that type; the second is refused
      on the ceiling and the printed arithmetic **names the reservation** as part
      of the numerator. A reservation is released on **every** terminal path —
      `done`, `failed`, `discarded`, `blocked`, `interrupted`, `capacity`,
      `abandoned` — and carries an **expiry** derived from the job's wall-clock cap
      so a killed worker cannot leave one holding budget forever; a second test
      asserts that a reservation whose job never writes a ledger line is ignored
      once the cap has elapsed. **Mutation A**: read the ledger alone and confirm
      both workers are offered the same headroom and both proceed. **Mutation B**:
      drop the expiry and confirm the lost-worker test holds budget indefinitely —
      the stale-lock failure this repository has already paid for once. Note in the
      test's header that a per-job cap under W workers permits W times the
      wall-clock spend a serial reading of it predicts, which is why the tier-total
      arithmetic and not the per-job cap is what must count reservations.
- [ ] 82. **Re-derive the four controls the parallel-worker argument leans on,
      one verdict each, before W is raised above 1.**
      (a) **Breaker 1 — re-derived, and it was broken.** `loop/lib/budget.mjs:673-683`
      `consecutiveFailures()` walks the ledger backwards and stops at the first
      `done`, so it is a pure function of append order. Replace it with a count over
      the last N completed jobs of that type (N = 5, trip at 3). Implements:
      *Breakers halt the loop, and only the named ones*, the window clause. Test
      that **fails on today's code** against the ledger `failed, failed, done,
      failed` — three of four failed and the current function returns 1 —
      and a **mutation** restoring the consecutive walk, which must make it red
      again.
      (b) **Budget ceilings — covered by task 81**, and only by it: without the
      reservation the ceilings are read from a ledger that records a job when it
      ends.
      (c) **Runner health — re-derived, and it was broken.**
      `loop/lib/health.mjs:202-214` `noOutputStreak()` walks backwards and breaks
      on the first invocation that produced something, so under more than one
      worker a healthy invocation between two dead ones resets it and a broken
      runner is never refused while other workers on it succeed. Replace it with a
      count of no-output invocations within that runner's last five in that role,
      the same shape as (a). Implements: *A runner proven unable to run is refused,
      and refusal is not a halt*, the window bullets. Test with an **interleaved
      ledger — empty, empty, producing, empty — that fails on today's code**, and a
      **mutation** restoring the backwards walk.
      (d) **Lane pause — re-derived, and it is the worst of the four.**
      `loop/lib/budget.mjs:591-607` reads only the provider's single most recent
      line (`const last = lane[lane.length - 1]; if (last.outcome !== 'capacity')
      return …`), so one worker hitting a rate limit and any other finishing a
      second later means the pause never engages — and a provider rate limit hits
      every worker on the lane **at once**, so that is the normal shape of a 429
      under three workers, not a tail case. Replace it with: any `capacity` for
      that provider inside the backoff window pauses the lane, which is strictly
      simpler than what is there. Implements: *Capacity exhaustion is a pause, and
      degradation is ordered*, the window bullet. Test with the ledger `capacity,
      done, capacity`, which **must pause** and does not today.
      (e) **Shed levels — checked, verdict unchanged.** `budget.mjs:625-639` is
      already a trailing-window count of `capacity` outcomes per tier and is
      order-independent; it inherits the read-at-selection lag that is inherent to
      it and no worse under concurrency. Assert it with a test rather than leaving
      it asserted in prose.
      (f) **Wall-clock caps, the ledger and the build/test locks — checked,
      verdict unchanged.** The caps bound one invocation and one job's total, both
      per job; the ledger is append-only under its lock and the build and test
      locks are real mutual exclusion.
- [ ] 83. `loop/tests/chain.test.mjs`: three workers run concurrently and two
      selecting in one window mint **different** job ids; a worker exhausting its
      budget is abandoned with the same ledger line a lone run would write; a
      failed run stops the chain; the pause check names a live worker's pid; the
      source scan finds no model, provider or harness token in the chain or the
      worker step. **Mutation A**: remove the selection lock and confirm the
      distinct-id assertion fails. **Mutation B**: hard-code a runner command in the
      chain and confirm `loop/tests/portability.test.mjs` fails. **Mutation C**:
      decide concurrency by matching the worktree path and confirm the lock test
      fails once every worktree is a Desk worktree. Tests tasks 79–80.
- [ ] 84. `pulse/lib/`: the mirror step, outside the derive step — one issue per
      condition that has none, closed when the condition clears, no issue id in
      `data/derived/`, the condition winning on disagreement with the disagreement
      reported, skipped with a reason when the tracker is unreachable. Implements:
      *The derived queue is mirrored into the tracker outside the derive step*.
- [ ] 85. `pulse/tests/mirror.test.mjs`: two runs with no world change produce a
      byte-identical `data/derived/` with no issue id in it; a hand-closed issue
      does not clear a standing condition; an unreachable tracker leaves the
      derivation untouched; **and a recomputation over a tree carrying the run's own
      committed data reproduces it byte for byte**. **Mutation**: call the tracker
      from inside the derive step and confirm the byte-identity test fails. Tests
      task 82.
- [ ] 86. `loop/lib/select.mjs`: an issue becomes selectable only when it is
      **routed** — the routing label plus the required fields — and intake refuses
      to route one naming neither a subject path nor a requirement, reporting it.
      Implements: *Routine work never touches OpenSpec; beads holds judgment work*,
      its routed-only bullet, and *A deferral becomes its own bead…*, its intake
      bullet. Test with a **mutation** that skips unroutable issues silently, which
      must make the reporting assertion fail, and one that selects an unlabelled P0.
- [ ] 87. Migrate `DIRECTIVES.md`: each pending line becomes a routed bead carrying
      the same text and a priority; the file is deleted and
      `loop/lib/directives.mjs` and its call sites go with it, including the parked
      section. Implements: *Work comes from one intake…*, source list.
      **[orchestrator]**
- [ ] 88. `CLAUDE.md`, `AGENTS.md` and the operating documentation: remove the fleet
      as an operating mechanism and record what replaces it — front-desk workers and
      the train review. No new fleet wave starts after this task, and not before it:
      until Stage 3 the fleet is this change's own implementation engine.
      **[orchestrator]**
- [ ] 89. **Stage-3 measurement.** Record filed versus closed per local day, the
      machinery share of inflow, and jobs per train-hour, each against the
      pre-change figures in `proposal.md`. **[orchestrator]**
- [ ] 90. `loop/intake.mjs`, `loop/lib/brief.mjs`, `loop/lib/result.mjs` and
      `loop/lib/review.mjs`: each failed claim gets a **stable identifier**; the
      brief carries the list by identifier with what was checked and what was
      found; `result.mjs` parses a `rederived:` block of one entry per identifier,
      each carrying one of `confirmed-stale` / `still-true` / `corrected` and a
      sentence of evidence; **the merge refuses a work order whose brief carried
      failed claims and whose result file lacks an entry for any of them**, naming
      the missing identifiers; the reviewer's checklist presents each entry beside
      the claim it answers. Implements: *Intake routes and verifies every candidate
      before a model is invoked*, the identifier and `rederived:` bullets, and
      *The executor result protocol is how outcomes are known*, its named-block
      bullet. Test in `loop/tests/intake.test.mjs`: a brief with two failed claims
      and two entries merges; one with two failed claims and one entry is refused
      naming the missing identifier; an entry with a state outside the three is
      refused. **Mutation**: drop the per-identifier presence check and confirm a
      brief carrying two failed claims merges with one entry — the check is the
      only thing standing between this and the instruction it replaced. Closes the
      sealed Luna reviewer's MAJOR 5.

## Gates

- [ ] 91. `openspec validate two-desks-work-orders-and-trains --type change
      --strict --no-interactive` and `node scripts/check-spec-deltas.mjs --strict`,
      at drafting time and after every review round. Neither validator catches a
      dropped requirement heading — one was dropped and both passed — so run the
      heading-to-task count as well.
- [ ] 92. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics` green at the end of each stage, run
      serially. Expect the suite to be **slower** at the end of Stage 1 than at its
      start: the twelve slowest tests are integration tests of the machinery these
      tasks rewrite, and rewriting them is inside the work rather than beside it.
- [ ] 93. Re-run `openspec validate` for every unarchived change after each stage:
      archiving order is load-bearing, and a change archived in between moves paths
      this one's tests may reference.

## The count

| Capability | ADDED | MODIFIED | REMOVED |
|---|---|---|---|
| `loop` | 11 | 10 | 2 |
| `review` | 2 | 2 | 0 |
| `pulse` | 1 | 1 | 0 |
| **Total** | **14** | **13** | **2** |

Ninety-three numbered tasks, 1–93 with no gaps, of which **26 name a proof by
mutation and 43 distinct mutations are named** (several tasks name an A, a B and a
C, where one mutation alone would leave a control unmeasured). Counted by script,
not by hand: `tasks: 93, contiguous=true; tasks naming a mutation: 26; distinct
mutations: 43`.

### Heading-to-task mapping

Machine-readable, covering ADDED, MODIFIED **and REMOVED**. Each row is
`capability | kind | heading | tasks`.

| Cap | Kind | Requirement heading | Tasks |
|---|---|---|---|
| loop | ADDED | One job is one work order, ending in one merge or one discard | 51, 53, 54, 55, 56, 57 |
| loop | ADDED | Work comes from one intake, and cannot self-amplify | 74, 75, 76, 87 |
| loop | ADDED | A job's gates are a tripwire; the full set runs once, on the train | 1, 2, 3, 4, 30, 31, 32 |
| loop | ADDED | Merges land on an integration branch and main advances only by a green train | 33, 34, 35 |
| loop | ADDED | A red train is classified before anything is reverted | 36, 37, 38, 41 |
| loop | ADDED | Intake routes and verifies every candidate before a model is invoked | 71, 72, 73, 90 |
| loop | ADDED | The front desk and the back desk share an intake and never share a lane | 77, 78 |
| loop | ADDED | The brief carries the requirements the work order names, and nothing else | 5, 6, 7, 8, 9, 11, 12 |
| loop | ADDED | The chain from intake to train lives in the repository | 25, 79, 80, 81, 82, 83 |
| loop | ADDED | Runner selection is a declared policy, and escalation is part of it | 19, 20, 21, 22, 23 |
| loop | ADDED | A deferral becomes its own bead only when it names a subject or a requirement | 16, 17, 18, 68, 86 |
| loop | MODIFIED | The executor result protocol is how outcomes are known | 54, 60, 63, 90 |
| loop | MODIFIED | Breakers halt the loop, and only the named ones | 47, 82 |
| loop | MODIFIED | A job's ledger line is written before anything recomputes the queue from it | 48 |
| loop | MODIFIED | The ledger line carries the join, as a list, additively | 23, 24, 65 |
| loop | MODIFIED | The machine's work is joinable to the issue tracker | 67, 68, 69, 70 |
| loop | MODIFIED | Routine work never touches OpenSpec; beads holds judgment work | 86, 87 |
| loop | MODIFIED | A proposal a merged job consumed is retired | 64, 75 |
| loop | MODIFIED | A gate failure is retried once, and the record names which kind it was | 49 |
| loop | MODIFIED | Capacity exhaustion is a pause, and degradation is ordered | 82 |
| loop | MODIFIED | A runner proven unable to run is refused, and refusal is not a halt | 82 |
| loop | REMOVED | One job is one outcome with one merge or discard | 51, 53, 54 |
| loop | REMOVED | Work comes from three sources and cannot self-amplify | 74, 75, 87 |
| review | ADDED | A review of unchanged pages is a review of the pages, never of an empty diff | 61, 62, 63 |
| review | ADDED | The train review is sealed from the per-job verdicts and reports what they missed | 39, 40, 41, 42 |
| review | MODIFIED | The reviewer judges quality with full standing, from a named reason list | 10, 12, 58, 59 |
| review | MODIFIED | A reviewer's non-blocking finding reaches work without editing anything | 13, 14, 15, 23 |
| pulse | ADDED | The derived queue is mirrored into the tracker outside the derive step | 84, 85 |
| pulse | MODIFIED | The Pulse publishes what it builds | 43, 44, 45, 46 |

Twenty-nine rows: 14 ADDED + 13 MODIFIED + 2 REMOVED. Every row names at least
one task, and the REMOVED rows name the tasks that build the requirements their
bodies were carried into.

## Not tasks of this change, recorded so they are not read as omissions

- **`OVERRIDE.md`** — drafted and reviewed twice on branch `impl/spec`, **tabled
  by the maintainer 2026-09-06**. Not re-proposed; its Part A is adoptable close
  to verbatim whenever he untables it. `addictedtoai-7z07`.
- **Making a discarded job's branch resumable by its successor** — the maintainer
  is *"stewing on"* it; **tabled, not declined**, and silence is not approval.
  `addictedtoai-d5f6` (P1).
- **Wontfix suppression for the mirror.** The mirror does not honour a closed
  issue as a suppression — the condition wins, full stop. Whether a `wontfix`
  close should become a visible, reported suppression on the model of the build's
  debt ratchets is a real question, not answered here; file it against task 82.
- **Sharing fixtures or splitting the heaviest test files** to shorten the suite's
  longest chain. Cheap-looking, **unmeasured**, and it touches the tests guarding
  merge and publish, where a shared fixture is how a suite acquires coupling it
  cannot see. Flagged, not scheduled.
- **Raising the 10% machinery ceiling.** Making machinery reachable is in scope;
  making it affordable is a budget bound, which is the maintainer's — open
  question 4, which now carries a recommendation rather than a bare question.
- **Making a failed claim a non-authorable state** until a fresh mechanical check
  records otherwise — the stronger of the two forms a sealed reviewer offered for
  its MAJOR 5. The structured-evidence form is adopted instead (task 88): the
  merge refuses when any failed claim is unanswered, and the answer's *truth* is
  the reviewer's. Blocking authorship outright would stop a job whose honest first
  finding is that the claim was stale, which is the common case.
- **Finishing the three unarchived changes.** `bind-what-the-catalog-knows` fixes
  the canonical held-train red; `let-the-queue-see-a-judgment` fixes the queue
  starvation. Both would make this change's numbers better; neither is this
  change's to do — open question 5.
- **Preventing a human or an external script from pushing.** Out of reach by
  construction: a human `git push` is the maintainer's own act under his existing
  grant. Stated as a limit in `proposal.md`, not papered over.
