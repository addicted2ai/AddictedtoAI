# Tasks

Drafted 2026-09-06 (local) on branch `impl/spec-edu`. Nothing below is
implemented: this is a drafting change, and only task 26 was run at drafting
time.

**Ordering is load-bearing in one place and only one.** Task 1 writes the
tutorial map and task 4 makes an unenumerated tutorial a build error. Landing 4
before 1 fails the build on all four published tutorials. Everything else may be
done in any order.

**Every normative sentence in the three deltas is named by the task that
implements it and by the task that tests it.** Twenty-eight normative sentences:
ten in `education-static`, twelve in `education-dynamic`, six new or changed in
`pulse`.

## The tutorial map of record (`education-dynamic`, sentences 1–3)

- [ ] 1. `openspec/curriculum/tutorials.md` (new). The map of record for the
      tutorial surface — outside `openspec/specs/`, which is reserved, and
      outside any change directory, which moves on archiving. Structure it as
      `openspec/curriculum/learn.md` is structured, because two maps read by two
      near-identical parsers must not have two shapes: a §0 that tells a job how
      to use its entry and states the amendment obligation, a §1 that states the
      admission test, and a **`## §4` catalog** whose entries are
      `` #### `slug` — "Title" ``. Enumerate at minimum the four published
      tutorials — `browser-embeddings-no-server`,
      `chat-template-is-not-the-model`, `model-file-header-range-requests`,
      `openrouter-catalog-watch` — transcribing each entry's `subjects`,
      outcome, must-cover, must-not and `reverify_days` from the published file
      rather than inventing them, so the map describes the territory on the day
      it is written. Further entries are an editorial enumeration and each one
      must pass the admission test in task 2. **Implements: the map exists at
      that path; the map enumerates each intended tutorial; each entry declares
      slug, title, subjects, outcome, must-cover, must-not, `reverify_days`.**
- [ ] 2. The admission test, written into §1 of that file as the rule a
      proposed entry is judged against: an entry is not enumerated unless its
      steps can be executed here without a paid account or special hardware, or
      it names in advance exactly which steps will go unexecuted and why. It is
      the same disclosure the published page already owes; stating it at
      enumeration time is what stops the queue carrying a job that can only end
      blocked. **Implements: the admission-test sentence.**
- [ ] 3. `lib/paths.mjs`: `TUTORIAL_CURRICULUM_FILE`, beside `CURRICULUM_FILE`.
      One definition of the path, read by the build check and by the Pulse — two
      string literals for one file is the drift `lib/domains.mjs` was created to
      avoid on a different closed list.

## The publish gate (`education-dynamic`, sentences 4–8)

- [ ] 4. `lib/tutorial-map.mjs` (new): `tutorialMapSlugs(text)` and
      `checkTutorialCoverage(tutorialDocs, mapText, diags, { file })`, the same
      two functions `lib/learn.mjs` already has for the learn surface
      (`curriculumSlugs`, `checkCurriculumCoverage`) with the same three
      properties, each of which exists for a reason already paid for there:
      scoped to the `## §4` catalog section so a backticked slug written
      anywhere else cannot become a phantom entry; returning `null` rather than
      `[]` when there is no catalog section, because "the map is unreadable" and
      "the map is empty" are different facts with different error shapes; and
      one error naming the map when it is `null`, never one per tutorial.
      **Implements: a tutorial may not publish undeclared; the build enforces
      it; the error names file, slug and map path; the check reads the catalog
      and no other part; an unreadable map is one error.**
- [ ] 5. Wire `checkTutorialCoverage` into the `content` step of
      `scripts/prebuild.mjs` beside the learn check. A step that throws fails
      the build naming itself, so the gate needs no new step and no new entry
      point.
- [ ] 6. `lib/tutorial-map.test.mjs`, one test per behaviour task 4 claims:
      a published tutorial in no entry produces exactly one error naming its
      file, its slug and the map's path; an absent map produces exactly **one**
      error naming the map and not one per tutorial; a map whose catalog exists
      but is empty produces one error per published tutorial, which is the
      different fact; a `` #### `slug` `` written outside the catalog section is
      not an entry; and the map written in task 1 admits all four published
      tutorials with zero diagnostics. **Tests: sentences 4–8.**
- [ ] 7. Mutation proof, two halves separately, because two mechanisms are
      described here and a single mutation would not tell them apart. Revert the
      catalog scoping in `tutorialMapSlugs` and confirm the phantom-entry test
      fails while the coverage tests pass; revert the `null` return and confirm
      the one-error test fails while the per-page test passes. Restore and
      verify the file byte-identical by hash.

## The producer (`pulse`, sentences 1, 6)

- [ ] 8. `pulse/lib/queue.mjs`: add `'tutorial'` to `QUEUE_PRODUCIBLE_TYPES` and
      replace the exclusion comment (lines 67–71) with the decision of record —
      the surface has a map, so its unmet declarations are the same set
      difference the learn surface already runs. `post`, `prune` and `machinery`
      keep their comments unchanged. **Implements: `tutorial` is on the list.**
- [ ] 9. `pulse/lib/queue.mjs`: `readTutorialMapSlugs`, `publishedTutorialSlugs`
      (excluding `README.md`, as `publishedLearnSlugs` does) and
      `tutorialGapItems`, emitting `item('tutorial', 'curriculum-gap', slug, …)`
      in map order. **No new entry in `RANKS`**: `curriculum-gap` is already 28
      and the item's type is what differs. Call it from `computeQueue` beside
      `curriculumGapItems`. **Implements: the item proposes the job type that
      writes the surface.**

## The upkeep interlock (`pulse`, sentences 2–4)

- [ ] 10. Align the Pulse's notion of an archived tutorial with the render
      side's. `lib/tutorials.mjs:132` derives `archived` from the subject entry's
      status being `retired` or `dead` and decides it **before** `demoted`
      (`STATES`, line 48); `pulse/lib/corpus.mjs:189` reads
      `archived: Boolean(f.data.archived)` from the tutorial's own front matter,
      so `pulse/lib/freshness.mjs:64-67` today calls a dead-subject tutorial
      `demoted` unless its file says otherwise. Give the Pulse the subject-status
      derivation — it already loads `corpus.entries` — keeping the front-matter
      flag as an additional way to archive, not a replacement. **Scope**: this is
      corrected because the interlock cannot be written correctly without it.
      Whether `tutorial-demoted` should stop producing a `verify` job for a
      dead-subject tutorial is a separate question about a separate requirement
      and is not touched here.
- [ ] 11. `computeQueue`: derive no `tutorial` gap item while any tutorial's
      state is `demoted` after task 10's alignment. **Implements: the derivation
      computes the subordination; no gap item while a tutorial stands demoted
      with a live subject; a dead-subject demotion suppresses nothing.**
- [ ] 12. `pulse/tests/`: the tutorial map enumerates three unwritten
      walkthroughs and nothing is demoted — three `tutorial` items at rank 28
      with reason `curriculum-gap`; one tutorial demoted with a live subject —
      zero gap items and the `tutorial-demoted` item still present; the same
      fixture with that subject's entry at status `dead` — three gap items
      again; publishing an enumerated walkthrough removes its item at the next
      recomputation with nothing closed. **Tests: `pulse` sentences 1–4.**
- [ ] 13. `pulse/tests/curriculum-queue.test.mjs`: extend the existing
      every-emitted-type-is-declared assertion to cover the new producer, and
      **assert `tutorial` is now on `QUEUE_PRODUCIBLE_TYPES` while `post`,
      `prune` and `machinery` are not**. The existing test asserts the absent
      types by name (line 251); that list must shrink by one and not by two.
      **Tests: `pulse` sentence 6.**
- [ ] 14. Mutation proof, three halves. Revert the interlock and confirm the
      demoted-suppression test fails while the plain-derivation test passes.
      Revert task 10's alignment and confirm the dead-subject test fails while
      the live-subject test passes — this is the half that proves the two are
      independent rather than one mechanism described twice. Revert the
      `QUEUE_PRODUCIBLE_TYPES` entry and confirm task 13 goes red. Restore and
      verify each file byte-identical by hash.
- [ ] 15. `pulse/tests/`: the tolerance test, both directions. An absent or
      catalog-less tutorial map yields no `tutorial` items, does not halt the
      run, and **leaves the learn surface's `curriculum-gap` items exactly as
      they were**; the mirror case with the learn curriculum absent and the
      tutorial map intact. **Tests: `pulse` sentence 5 (one unreadable map does
      not silence the other).**

## The departure discipline (`education-static`, all ten sentences; `education-dynamic`, sentences 9–12)

- [ ] 16. `lib/learn.mjs`: `curriculumEntryFor(text, slug)` — the entry block for
      one slug, from its `` #### `slug` `` heading to the next heading of the
      same level, `null` when the slug has no entry. The same function shape
      serves the tutorial map from `lib/tutorial-map.mjs`. One extractor per
      map, used by the brief and by any check that needs an entry's text.
- [ ] 17. `loop/lib/brief.mjs`, `ACCEPTANCE_BY_TYPE.education` (currently three
      lines, none of which mentions the curriculum): add the page's entry
      obligation — you are written to the clauses of your entry; where you judge
      a clause wrong, amend the entry in the same diff, dated, with one sentence
      of reasoning, and then write the page to the clause as it now stands; a
      departure recorded only in `RESULT.md` is not an amendment and will be
      rejected; where the departure implies a change to a **different** entry,
      say so in `RESULT.md` and do not edit that entry, because that is the
      reviewer's finding to carry and not your diff to grow. Same for
      `ACCEPTANCE_BY_TYPE.tutorial` against the tutorial map. **Implements:
      `education-static` sentences 1–4 on the author side; `education-dynamic`
      sentence 12 on the author side.**
- [ ] 18. `loop/lib/brief.mjs`, `assembleBrief`: where the job's target is a
      learn page or a tutorial, inject that page's curriculum entry verbatim,
      via task 16, under its own heading in the brief. A Desk job is one written
      prompt in and files out with no session and no memory; a brief that names
      a file the job must go and find is a step a job can skip, and the four
      standing deviations are what skipping it costs. **Implements: the author's
      brief carries the page's entry.**
- [ ] 19. `loop/lib/review.mjs`, `CHECKLISTS.education` and `CHECKLISTS.tutorial`
      (currently three lines each, neither mentioning the curriculum): add the
      clause-by-clause comparison and **both** of its outcomes — a departure the
      diff leaves unamended is `spec-violation` naming the clause and the page,
      whether or not you agree with the departure; a departure whose amendment
      is in the same diff is judged on its merits like any other editorial
      choice; a departure that implies a change to a **different** entry is a
      `carry:` entry whose `subject` is the map's path, not a rejection and not
      a demand that the diff grow. Name the map's path explicitly in both
      checklists. `excerptsFor` assembles spec text for the **author's** brief
      alone, so a reviewer receives no spec text: a rule absent from the
      checklist is a rule the reviewer never sees. **Implements:
      `education-static` sentences 5–8; `education-dynamic` sentence 12 on the
      review side.**
- [ ] 20. `loop/lib/brief.mjs`: the reviewer's own brief already runs in the
      job's worktree, so it can read the map; task 19 is what tells it to.
      Confirm by reading `assembleBrief`'s review path that no injection is
      needed there, and record the confirmation in the change's own record
      rather than assuming it — if the review brief cannot reach the tree, the
      entry must be injected the way task 18 injects it for the author.
- [ ] 21. Brief and checklist text tests, in `loop/tests/`: assert that
      `ACCEPTANCE_BY_TYPE.education`, `ACCEPTANCE_BY_TYPE.tutorial`,
      `CHECKLISTS.education` and `CHECKLISTS.tutorial` each name the map's path,
      the amend-in-the-same-diff obligation, the `spec-violation` outcome and
      the `carry:` outcome; and that a brief assembled for an `education` job
      whose target is a declared page contains that entry's text. The measurable
      form of the failure this closes: the string `curriculum` occurs zero times
      in `loop/` outside one comment in a test today. **Tests:
      `education-static` sentences 1–10; `education-dynamic` sentences 9–12.**
- [ ] 22. Mutation proof on the checklist, both outcomes separately: delete the
      `spec-violation` clause from `CHECKLISTS.education` and confirm only that
      assertion fails; delete the `carry:` clause and confirm only that one
      fails. Two mutations failing disjoint assertions is the evidence the two
      outcomes are separately stated rather than one sentence read twice.
      Restore and verify byte-identical by hash.
- [ ] 23. Mutation proof on the injection: revert task 18 and confirm the
      assembled-brief test fails while the text-content tests still pass.
      Restore and verify byte-identical by hash.

## Ledger

- [ ] 24. Record in the change's own record which of the four standing
      deviations (`addictedtoai-f7l`/`-4wm`, `-88x`, `-mfm`, and the hardware
      instance in `addictedtoai-c29`) were still unamended on the day the
      mechanism landed, measured rather than recalled, so that the mechanism's
      first job has a baseline to be judged against. Amending them is **not** a
      task here.
- [ ] 25. Confirm no other unarchived change carries a `MODIFIED` block on
      `A surface's unmet declared coverage is queue input` or on
      `Which job types the queue may produce is a stated decision`. Both live in
      `specs/pulse`, which no bead in this group owns, so a collision is
      plausible rather than theoretical.

## Gates

- [ ] 26. `openspec validate keep-the-map-describing-the-territory --type change
      --strict --no-interactive`, and `node scripts/check-spec-deltas.mjs
      --strict`. Run at drafting time.
- [ ] 27. `npm test`, `npm run build`, `verify-launch`, `verify-design`,
      `verify-surfaces`, `verify-analytics`.

## Not tasks here, recorded so the absences are not read as oversights

- **The four standing curriculum deviations.** Each is a one-line edit and each
  needs an editorial judgment about which side of the deviation was right, which
  is content work under the review gate. The beads carry them.
- **The tutorial map's full enumeration beyond the four published walkthroughs.**
  The map's required shape is a requirement; which walkthroughs the site should
  publish is an editorial enumeration made under the admission test, and it can
  grow one entry at a time thereafter.
- **`tutorial-demoted` and `tutorial-stale` semantics.** Task 10 corrects the
  Pulse's notion of `archived` only as far as the interlock needs it.
- **The display of any of this.** Nothing here renders.
