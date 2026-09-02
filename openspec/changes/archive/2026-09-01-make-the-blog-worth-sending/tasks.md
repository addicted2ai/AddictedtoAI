# Tasks: make-the-blog-worth-sending

**How to work this list.** Sections in order — §1 (the deletion) is first
because the maintainer's corpus restart is decided and everything later
assumes the empty state (the launch floor, the removed ceiling machinery,
the trivially-clean anchor check), and §2's first task completes a
reserved-path config edit nothing after it can run without. (An earlier
revision's ordering argument — that the voice lint would fail the build
against the five live posts — dissolved when the lint became advisory;
the order stands on the corpus decision alone.) Every task that touches
code carries its tests beside it,
and `npm test` plus `npm run build` green after each task is part of that
task. No task writes a blog post: this change builds the producer and the
bar; the ordinary loop writes the posts, through the ordinary review gate.
Every named file, symbol and line was verified to exist at HEAD on
2026-08-30, except files this change creates.

## 1. The deletion

- [x] **1.1 — Delete the five posts and their review records.** *(Done
  2026-08-30 at `bde5a6e`; verified in-tree: `content/blog/` holds only
  `README.md`, all five records and both evidence files are gone, and the
  `pulse/lib/corpus.mjs` comment now cites the deleted post in past tense
  against git history.)* Remove all
  five `content/blog/*.md` posts and the five review records that join
  them — named exactly, because only three carry the `seed-blog-` prefix:
  `data/reviews/seed-blog-seven-open-licences-seven-lines.md`,
  `seed-blog-three-definitions-of-a-knowledge-cutoff.md`,
  `seed-blog-twelve-months-of-model-retirements.md`,
  `seed-same-catalog-same-day.md`, and
  `seed-reference-urls-that-still-return-200.md` (an orphaned record is a
  standing false alarm in the reviews join). Also remove the two orphaned
  evidence files
  `data/reviews/evidence/post-same-catalog-same-day.md` and
  `post-reference-urls-that-still-return-200.md` — no code joins that
  directory (the only reference anywhere is the brief string at
  `loop/lib/brief.mjs:62`). Update the comment at `pulse/lib/corpus.mjs`
  (around line 65) that cites
  `content/blog/reference-urls-that-still-return-200.md` as its living
  example — rewrite it to cite the case in past tense against git
  history, so the comment does not point at nothing. Run the build; fix
  any inbound link it names. Git history keeps everything deleted.
- [x] **1.2 — Lower the launch floor.** *(Done 2026-08-30 at `bde5a6e`;
  verified: `FLOORS.posts` is 0 with a comment naming this change.)*
  `scripts/verify-launch.mjs`: `posts: 2` becomes `posts: 0`, with a
  comment naming this change —
  the blog restarts empty by decision, and a floor that fails the gates on
  an intended state is a false alarm. Test: `verify-launch` passes on the
  post-deletion corpus.
- [x] **1.3 — Remove the count-ceiling machinery, both copies.** *(Done
  2026-08-30 at `bde5a6e`; verified: the only remaining occurrences of the
  removed symbols are past-tense comments marking where they stood, and
  the `blog-ceiling` fixtures are gone.)* In
  `lib/posts.mjs`: `POST_CEILING`, `ceilingBreaches`, `warnPostCeiling`
  and their call site in the build, plus their tests in
  `lib/surfaces.test.mjs`. In `loop/lib/config.mjs`:
  `BLOG_CEILING_POSTS` / `BLOG_CEILING_DAYS`; in `loop/lib/surfaces.mjs`:
  `blogCeilingGate` and its wiring in `loop/lib/select.mjs`, plus
  selector-rules tests. Removed, not disabled — no gate and no warning
  counts published posts anywhere afterward, and a grep for the removed
  symbols comes back empty.
- [x] **1.4 — An honest empty blog.** *(Done 2026-08-30 at `bde5a6e`;
  verified: the empty state reads as a decision, the ceiling copy is gone,
  and `content/blog/README.md` describes the two forms, the anchor, and
  the scout.)* Update the blog index copy in
  `lib/render/blog.mjs` (the line advertising "three in any seven days"
  goes with the ceiling it described) to describe the two forms in reader
  terms, and give the zero-post index an empty state that does not read as
  breakage. Rewrite `content/blog/README.md` for the two forms, the
  anchor, and the scout as the producer.

## 2. The scout

- [x] **2.1 — Config first, then the closed list.** *(Done 2026-08-30 at
  `896ad93`; verified in `data/config.json` by reading the file:
  `job_caps_minutes.scout` is `60`, `budget.categories.new_writing`
  contains `scout`, and all three `degradation.shed_levels[]
  .exclude_types` arrays contain it. `loop/lib/config.mjs` lists `scout`
  in `JOB_TYPES`, and `selector-rules.test.mjs` asserts both directions —
  a level-1 shed refuses it naming the rule, and with nothing shed the
  selector selects it.)* The `data/config.json`
  half is a reserved path — the orchestrator's, never a Desk job's — and
  it is three edits, one already applied:
  - **Done 2026-08-30, verified**: `scout` added to all three
    `degradation.shed_levels[].exclude_types` arrays. This is what makes
    shedding work — `loop/lib/budget.mjs:372` sheds on the literal
    per-level `exclude_types` lists; budget categories feed only the
    ceiling — so without it `scout` stayed selectable at every shed
    level.
  - **Done 2026-08-30**: `job_caps_minutes.scout: 60` (60, not the
    30 first proposed — reason recorded in design D9.2) and `scout` in
    the `budget.categories.new_writing` list.
  Then, and only then, `loop/lib/config.mjs` adds `scout` to `JOB_TYPES`.
  Order matters: `loadConfig` throws on any `JOB_TYPES` entry lacking a
  `job_caps_minutes` cap (`loop/lib/config.mjs:99`), so a `JOB_TYPES`
  edit landing before the config edit breaks every loop invocation.
  Tests: config fixtures gain the key; a fixture lacking it still throws,
  naming `scout`; a degradation test asserts a level-1 shed excludes a
  `scout` candidate via the config's own arrays.
- [x] **2.2 — The Pulse derives the daily scout item.** *(Done 2026-08-30
  at `896ad93`; verified: `pulse/lib/queue.mjs` exports `scoutItems` and
  `scoutRanToday`, ranks `'scout-due': 62`, and sets
  `SCOUT_CONTEXT_DAYS = 7`. `pulse/tests/scout-queue.test.mjs` — 22 tests,
  all passing — covers derives-once, second-same-day-derives-nothing,
  next-local-date-derives-again, the covers: join, and byte-identity on
  unchanged state, including four timezone tests that straddle UTC
  midnight in both directions.)* In
  `pulse/lib/queue.mjs`: derive one item of `type: 'scout'` exactly when
  `data/ledger.jsonl` records no `scout` job started on the current local
  date; rank constant 62 (below `corroboration` 68, above
  `listing-verification-due` 60 — the normative relative position in the
  pulse delta); item detail carries the trailing-7-day
  `data/changes.jsonl` event lines not covered by any published post's
  `covers:` declarations (annotation lines excluded — they carry no
  event). Tests (fixture tree, pinned clock): derives once; second
  same-day run derives nothing; next local date derives again; the
  coverage join excludes covered lines; byte-identical on unchanged state.
- [x] **2.3 — The scout brief.** *(Done 2026-08-30 at `fa39d35`; verified:
  `ACCEPTANCE_BY_TYPE.scout` exists in `loop/lib/brief.mjs` and the
  assembled brief carries the charge, the two tests, the cap of three, the
  docket fields, the drop-record rule and the `blocked: nothing cleared
  the bar` sentinel — asserted against the assembled markdown, not the
  table, by `loop/tests/brief-acceptance.test.mjs`.)*
  `ACCEPTANCE_BY_TYPE.scout` in
  `loop/lib/brief.mjs`: the charge (bring back work the site could not
  have thought of by looking at itself — every candidate carries
  externally retrieved evidence with URLs and retrieval dates); judge
  everything found against the two tests and file at most three, the most
  worthy, as proposals with `slug`, `type` (any from the closed list),
  `expires:` (at most 7 days out event-driven, 14 for a synthesis), a
  why-now, evidence, and done-when lines; write one drop record per
  declined story into `data/proposals/dropped/` naming the failed test
  and the refile condition; a quiet day opens the synthesis branch over
  the recorded evidence; when nothing clears either branch, end
  `RESULT.md` with `blocked: nothing cleared the bar` — a success. Test:
  the assembled scout brief carries each of these.
- [x] **2.4 — Merge mechanics for candidates.** *(Done 2026-08-30 at
  `fa39d35`; verified by `loop/tests/proposal-merge.test.mjs`, 13 tests
  passing over throwaway git repositories, including the positive controls
  the refusals need: a four-candidate scout merge keeps three and drops one
  with a note, a three-candidate one drops nothing, a `post` job's `post`
  proposal lands in `rejected/` with the pointer while the cross-type path
  lands in `data/proposals/`, a discarded job's proposals die with the
  branch, and a noting verdict produces a well-formed file where a
  non-noting one produces none.)* At the loop's merge step:
  keep at most the job's allowed number of added proposal files (three
  for `scout`, one otherwise) by the job's stated ranking else filename,
  moving excess to `data/proposals/dropped/` with a note; stamp the
  proposing job's type onto each kept proposal, overwriting any
  executor-written value; auto-discard (to `rejected/`, pointer to the
  self-amplification rule, no inference) any proposal whose stamped type
  equals its proposed type; a discarded branch's proposals never reach
  `data/proposals/`. Transcribe a reviewer-noted proposal from the
  verdict record into `data/proposals/` naming the reviewing job. Tests:
  four-candidate scout merge keeps three and drops one with a note; a
  `post` job's `post` proposal lands in `rejected/` with the pointer; a
  discarded job's proposal vanishes with its branch; a noting verdict
  produces a well-formed file, a non-noting one produces nothing.
- [x] **2.5 — Expiry semantics in the proposals reader.** *(Done 2026-08-30
  at `fa39d35`; verified by `loop/tests/proposal-expiry.test.mjs`, 12 tests
  passing: ripe immediately with an expiry and cooled without one, not
  selectable at expiry and swept with a note, a dry run that moves nothing,
  a malformed `expires:` skipped rather than read as "no expiry", and a
  slug in `dropped/` that does not auto-discard a refiling where the same
  slug in `rejected/` does. Three timezone tests hold the boundary.)* In
  `loop/lib/proposals.mjs`: a proposal with `expires:` is ripe without
  the 3-day cooling and never selectable at or past expiry; at expiry the
  reader sweeps it to `data/proposals/dropped/` with a note naming the
  expiry. `dropped/` is never read by the rejection index — only
  `rejected/` blocks slugs. Tests: fresh expiring proposal ripe
  immediately; expired one swept, not selectable; a slug present only in
  `dropped/` does not auto-discard a new filing.
- [x] **2.6 — The scout review checklist.** *(Done 2026-08-30 at `fa39d35`;
  verified: `CHECKLISTS.scout` exists in `loop/lib/review.mjs` and the
  assembled scout review brief carries the charge-first ordering, the
  evidence spot-fetch, the docket fields, the drop records and the cap.)*
  `CHECKLISTS.scout` in
  `loop/lib/review.mjs`, from the review delta: charge first (all-inward
  candidates fail it as `spec-violation`), evidence spot-fetched, docket
  fields present, drop records name their tests, at most three filed.
  Test: the assembled scout review brief carries these.
- [x] **2.7 — The blocked streak gets its witness.** *(Done 2026-08-30 at
  `fa39d35`; verified: `lib/stamp.mjs` exports `blockedScoutStreak` and
  `buildStamp` writes `blocked_scout_streak` after the four deploy-check
  fields, leaving their names, order and values untouched — re-measured
  2026-08-30 while repairing the `dirty` field beside it, and
  `verify-surfaces`' `checkStamp()` still passes. Nothing in the repository
  imports the number, which is the point.)* Per the loop delta's
  "blocked streak SHALL have a witness" clause: the build derives, from
  `data/ledger.jsonl`, the count of consecutive `scout` jobs whose
  recorded outcome is a `blocked:` result (reset by any scout run that
  files a candidate; absent scout history reads as 0) and writes it into
  the published `/status.json` beside the build stamp
  (`lib/stamp.mjs` writes that file). Nothing reads the number back —
  no breaker, no floor, no selector rule; observability without
  obligation. Tests (fixture ledger): streak of N computed; filing run
  resets to 0; empty ledger yields 0; the stamp's existing fields and the
  footer-stamp equality check (`verify-surfaces`) are unaffected.

## 3. The bar and the voice

- [x] **3.1 — The reason list and the voice field.** *(Done 2026-08-30 at
  `fa39d35`; verified by `loop/tests/review-blog-bar.test.mjs` — blank
  refused (`reads-human-empty`), duplicate refused
  (`reads-human-duplicate`), every non-post type unaffected, and an
  end-to-end loop run in which a post approved with a blank field does not
  reach main. **Completed 2026-08-30 (wave 3)**: `scripts/verify-launch.mjs`
  now applies the same two rules, importing `READS_HUMAN_TYPES` and
  `needsReadsHuman` from the gate rather than restating the scope. Until
  then the launch check and the merge gate disagreed by exactly this rule
  while `verify-launch`'s own header claimed they agreed — invisible only
  because `content/blog/` holds no posts. Measured across seven cases on
  two fixture corpora: blank refused, duplicate refused, a near-duplicate
  differing by one clause allowed, learn/tutorial records with no
  `reads-human` untouched, and a post's field duplicating a *learn*
  record's refused, because the gate's sweep reads every record and so does
  this one.)* `REASONS` in
  `loop/lib/verdict.mjs` gains `reads-as-generated`. The merge gate
  requires, on `post` verdicts only, a non-empty `reads-human` field that
  is not an exact duplicate (after trimming) of any existing record's —
  the same two checks, at the same refusal point, as `would-cite`. Tests:
  blank refused; duplicate refused; non-post verdicts unaffected.
- [x] **3.2 — The post checklist.** *(Done 2026-08-30 at `fa39d35`;
  verified: `CHECKLISTS.post` exists in `loop/lib/review.mjs`, the
  assembled post review brief carries both forms and their finish lines,
  points at `openspec/style/blog-voice.md`, and asks both questions in
  those words — "the send question in `would-cite` ... and the voice
  question in `reads-human`". A non-post brief carries no `reads-human`
  demand it cannot be refused for, which is asserted type by type against
  `needsReadsHuman`.)* `CHECKLISTS.post` in
  `loop/lib/review.mjs`, from the review delta: identify the form and
  apply its finish line (note: anchor holds with external anchors
  fetched, affected party named where one exists, brevity never a defect;
  synthesis: method stated, evidence enumerable); judge the prose against
  `openspec/style/blog-voice.md`, rejecting `reads-as-generated` where it
  reads machine-made; answer the send question in `would-cite` and the
  voice question in `reads-human`. Test: the assembled post review brief
  carries these.
- [x] **3.3 — The post brief.** *(Done 2026-08-30 at `fa39d35`; verified:
  `ACCEPTANCE_BY_TYPE.post` is rewritten and the assembled post brief
  carries the two forms and their finish lines, the anchor declaration, the
  affected-party rule, "the world's AI, never this site", the voice
  reference, and the unchanged final check — write nothing and report
  `blocked:`. Asserted against the assembled markdown.)* Rewrite
  `ACCEPTANCE_BY_TYPE.post` in
  `loop/lib/brief.mjs`: the two forms and their finish lines; declare the
  anchor (`covers:` and/or `anchor:`) for a note; name the affected party
  and what changes for them where one exists; the subject is the world's
  AI, never this site; write to `openspec/style/blog-voice.md`; the
  existing source-check, overclaim and dates checks stay; the final check
  stays what it is today — not worth an enthusiast's time means write
  nothing and report `blocked:`. Test: the assembled post brief carries
  each.
- [x] **3.4 — Anchor front-matter keys.** *(Done 2026-08-30 at `fa39d35`;
  verified by `lib/render/blog.test.mjs`: both keys validate, each
  malformed value fails naming its field, and all four new string-valued
  paths are classified in `NON_PROSE_FIELDS` so the build's
  field-classification gate stays satisfied rather than being trusted to
  catch it elsewhere.)* `postSchema` in `lib/schema.mjs`
  (strict, so absent this task the keys fail the build) gains `covers:`
  (a list of `{key, date}` change-feed references) and `anchor:`
  (`{url, date}`). Tests: each validates; malformed values fail naming
  the field.
- [x] **3.5 — The anchor build check.** *(Done 2026-08-30 at `fa39d35`;
  verified: `{ name: 'anchors', run: anchorCheckStep }` is registered in
  `scripts/prebuild.mjs` between `content` and `post-voice`, and
  `lib/anchors.test.mjs` covers both failures, the compliant post, and the
  zero-post corpus. It ran in every `npm run build` below.)* A prebuild
  `STEPS` check: a
  `covers:` reference resolving to no `data/changes.jsonl` line fails
  naming the post file and the reference; any declared anchor date
  outside the 7 days ending on the post's `date` — either direction —
  fails naming the post, the anchor, and the window. Tests: both
  failures; a compliant post passes; the post-deletion corpus (zero
  posts) is trivially clean.
- [x] **3.6 — The anchor renders.** *(Done 2026-08-30 at `fa39d35`;
  verified by `lib/render/blog.test.mjs`: a `covers:` post and an `anchor:`
  post each render the dated, linked evidence line, a post declaring both
  renders both with the unforgeable evidence first, and a synthesis renders
  no block at all rather than an empty one. **Completed 2026-08-30 (wave
  3)**: `app/blog/[slug]/page.tsx` now passes `{ changes: site.changeLines }`.
  Until then the renderer accepted the option and the only call site never
  supplied it, so every covered anchor on a real page would have rendered
  the generic "Recorded in this site's change feed" instead of the event's
  name and source. Measured on the `blog-anchors` fixture against the live
  90-line feed: without the argument, two placeholder lines and no source
  URL; with it, both keys resolve, the event is named and
  `openai.com/index/gpt-5-6` is cited.)* `renderPostPage` in
  `lib/render/blog.mjs` shows a note's anchor — the primary evidence,
  dated, linked — on the page. Test: a fixture post with `covers:` and
  one with `anchor:` each render the evidence line; a synthesis renders
  none.
- [x] **3.7 — The voice lint, advisory.** *(Done 2026-08-30 at `3ecd581` /
  `fa39d35`; verified by `scripts/check-post-voice.test.mjs`, 17 tests
  passing: a post tripping every marker still leaves the step successful,
  the step never throws whatever it is handed, entities are decoded before
  counting, and the pinned corpora reproduce the calibration record's
  per-document table **exactly — 0 mismatches of 12** across word counts,
  semicolons, em-dashes, self-narration and What/Why/How headers, firing 12
  of 12 at the union and 1 of 9 on the human sample. **Completed 2026-08-30
  (wave 3)**: the third instrument artifact is now recorded in
  `openspec/style/blog-voice-calibration.md` beside the other two, with the
  headline result the record did not yet state. Re-measured before writing
  it: joining multi-word markers with a literal space misses six
  occurrences — `this post` five times and `labelled as such` once — and
  puts four per-document self-narration counts below the record's; sparing
  the one marker a coder would spell with `\s+` by habit gives five and
  three, which is why the arithmetic is stated rather than the number
  quoted.)* New
  `scripts/check-post-voice.mjs`, run from the prebuild `STEPS` array,
  **warning — never failing the build** — for `content/blog/` posts on
  the closed marker list documented in `openspec/style/blog-voice.md` §3
  — semicolons > 2.5/1k words, em-dashes > 10/1k, self-narration ≥ 1,
  What/Why/How headers ≥ 2, the presence-level register guards,
  focal-word family ≥ 3/1k, bold-lead lists — counting outside code
  fences, blockquotes, and dated correction blocks (decode HTML entities
  before counting — the calibration record documents the `&sect;`
  artifact that once inflated a threshold), and naming, for every tripped
  marker, the post, the marker, the measured value, and the threshold.
  The step returns success with warnings; it joins the currency-literal
  warning as a deliberate warn-not-fail check, and the reviewer is the
  gate (3.2). Tests: unit cases per marker; an assertion that a post
  tripping every marker still exits the step successfully (warn, not
  fail); plus the **pinned-corpora calibration tests** — the twelve
  predecessor posts' extracted prose (from `d34040b`, pinned as fixtures
  so the check survives that commit's eventual garbage collection) and
  the nine-piece human sample (pinned the same way; sources, retrieval
  dates and expected per-marker firing counts in
  `openspec/style/blog-voice-calibration.md`) must warn at exactly the
  calibration record's recorded counts — 12 of 12 and 1 of 9 (the
  documented chrome artifact) at the union. A lint edit that silently
  moves either count fails these tests.
- [x] **3.8 — The brief's proposal rule.** *(Done 2026-08-30 at `fa39d35`;
  verified: `proposalRule` is exported from `loop/lib/brief.mjs` and
  asserted in the assembled text for an ordinary type and for `scout`, with
  the front-matter contract including `expires:`; the review brief asks the
  reviewer to note a proposal its review surfaced, and
  `proposal-merge.test.mjs` carries that noting through to a well-formed
  file naming the reviewing job.)* Every assembled brief states
  the proposal rule binding its job — at most one as a side-output for
  ordinary jobs, the scout's own rule for `scout` — with the front-matter
  contract including `expires:`. The review brief asks the reviewer to
  note a proposal where its review surfaced one. Tests: brief text for
  an ordinary type and for `scout`; review brief text.

## 4. Verification

- [x] **4.1 — Gates.** `npm test` and `npm run build` green at each
  section boundary;
  `openspec validate make-the-blog-worth-sending --type change --strict
  --no-interactive` passes; whoever publishes runs the full gate set per
  `CLAUDE.md`.

  **Run 2026-08-30, wave 3, on `fa39d35` plus this wave's working tree.
  Serially, never concurrently — two `next build` processes race over one
  `.next/` (`addictedtoai-6s7`).**

  | gate | command | result |
  |---|---|---|
  | tests | `npm test` | **652 pass, 0 fail**, 0 skipped, 117s |
  | spec artifacts | `openspec validate make-the-blog-worth-sending --type change --strict --no-interactive` | `Change 'make-the-blog-worth-sending' is valid` |
  | build | `npm run build` | exit 0; 599 pages exported; first-load JS 103 kB shared |
  | launch minimums | `node scripts/verify-launch.mjs` | **15 checks passed, 0 failed**, its own build exit 0 in 29s |

  `verify-launch` reported the blog surface honestly rather than
  vacuously: `blog posts 0 (floor 0) — NO FLOOR`, and on the new voice
  bar, *"applied to 0 piece(s) ... NOTHING IS HELD TO IT THIS RUN — the
  surface is empty, so this rule is verified by its tests and not by this
  corpus."* A check that says which of its rules had nothing to measure
  is the difference between a green line and a measurement.

  `verify-design`, `verify-surfaces`, `measure-payload` and
  `verify-analytics` are the publisher's, per `CLAUDE.md`, and were not
  run by this wave — stated rather than left to be assumed from the row
  list above.
- [x] **4.2 — The machine end-to-end, on fixtures.** With a pinned clock
  and a fixture tree: a Pulse run derives the scout item (and only one);
  a Desk dry-run selects it and its brief carries the context lines; a
  simulated scout branch with four candidates and two drop records merges
  to three candidates, one mechanical drop, and the records in
  `dropped/`; an expiring candidate is ripe immediately and swept at
  expiry. Record the run — date, method, observed output — against this
  task when it is done.

  **Run 2026-08-30, wave 3.** Method: the four legs as one invocation over
  their own throwaway git repositories and fixture trees, each with a
  pinned clock —

  ```
  node --test pulse/tests/scout-queue.test.mjs \
              loop/tests/selector-rules.test.mjs \
              loop/tests/brief-acceptance.test.mjs \
              loop/tests/proposal-merge.test.mjs \
              loop/tests/proposal-expiry.test.mjs
  ```

  Observed: **83 tests, 83 pass, 0 fail, 47.3s.** Leg by leg —

  - *derivation*: with no scout in the ledger exactly one item is derived
    at rank 62, between a corroboration disagreement and a due listing; a
    scout recorded today derives nothing and the re-run is byte-identical;
    the next local date derives one again. Four timezone tests straddle
    UTC midnight in both directions, and a fifth asserts the fixture zones
    really do straddle it — without which the four prove nothing.
  - *selection and brief*: with nothing shed the selector selects a
    `scout` item — the type is accepted end to end — and at shed level 1
    it is refused by the config's own arrays, naming the rule in the
    printed text. The assembled brief carries the charge, the two tests,
    the cap, the docket and the drop-record rule.
  - *merge*: a four-candidate scout merge keeps three by the job's
    ranking and drops one with a note; the positive control, a
    three-candidate merge, drops nothing.
  - *expiry*: an expiring candidate is ripe the day it is filed while an
    ordinary one of the same age is not; at expiry it stops being
    selectable and is swept, and its neighbour is not.

  Run **through the library over fixtures, never through `pulse/run.mjs`
  or `loop/run.mjs`.** That is a constraint, not a shortcut, and it is
  recorded because it bounds the claim: the production entry points would
  invoke a real Pulse whose publish step pushes when publishing is armed.
  What is measured here is every mechanism those entry points call, on
  trees built for the purpose.

## 5. The record

- [x] **5.1 — Update the three issues; file one.** *(Done 2026-09-01.
  `addictedtoai-6ov` was already closed — §2.4, §2.5 and §3.8 all landed
  2026-08-30. Dispositions appended to `addictedtoai-18c` and
  `addictedtoai-3zf`; the new issue is `addictedtoai-ze5b`.)* Comment
  disposition on
  `addictedtoai-18c` (the send test and the input are both here; the
  scout answers its "bigger finding"), `addictedtoai-6ov` (producing side
  specified here; closes when §2.4/§2.5/§3.8 land), and
  `addictedtoai-3zf` (post gains a producer; the proposal route opens all
  five untriggered types; the rest stays its own). File one new issue: on
  the first live scout cycle, record — with dates and job ids — the scout
  run, its candidates and drops, the post job, the review, and the
  publish, as the measurement that the wiring works outside fixtures.

## 6. Traceability — every normative clause, its task and its check

### blog: A post takes one of two forms (ADDED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| every post is one of two forms | 3.2, 3.3 | review identifies the form; brief/checklist text tests |
| a note leads with the event and who it lands on; references the wiki; no minimum length; brevity never a defect | 3.3, 3.2 | checklist and brief text tests; the 150-word scenario |
| a synthesis states its method; enumerable dated evidence | 3.3, 3.2 | review, per the missing-method scenario |
| every post passes the stranger test in its would-send form | 3.2 | review: `not-worth-reading` when the send question has no answer |

### blog: A news note is anchored (ADDED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| a note declares its anchor in front matter | 3.4 | schema tests; strict schema fails unknown keys by design |
| unresolved `covers:` fails the build | 3.5 | build-check test |
| any anchor outside the two-sided 7-day window fails the build | 3.5 | build-check test, both directions |
| review fetches external anchors | 3.2 | checklist text test; `false-or-unsupported-claim` scenario |
| the rendered page shows the anchor | 3.6 | render tests, both anchor kinds |
| an event post with no anchor is returned `spec-violation` | 3.2 | checklist text test |

### blog: A post with an affected party names them (ADDED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| names who is affected and what changes, concretely | 3.3, 3.2 | review, per the retirement-note scenario |
| missing party returns `revise`/`not-worth-reading`; syntheses exempt | 3.2 | checklist text test |

### blog: The blog is about AI, never about this site (ADDED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| the site is never a post's subject; review rejects `spec-violation`; data layer usable as evidence | 3.3, 3.2 | brief and checklist text tests; the two scenarios |

### blog: Posts read as human writing, and the disclosure stands (ADDED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| posts written to the voice document | 3.3 | brief names it; review judges against it (3.2) |
| the lint runs in the prebuild, warns with named markers, and never fails the build | 3.7 | warn-not-fail assertion; pinned-corpora tests hold the calibration record's counts (12/12 and 1/9 at the union) |
| reads-as-generated is a named rejection with `reads-human` recorded | 3.1, 3.2 | merge-gate tests; checklist text test |
| the disclosure stands; concealment is `spec-violation` | 3.2 | checklist text test; the concealment scenario |

### blog: Publishing is quality-gated, never quota-driven (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| no minimum cadence | none — the absence of any floor mechanism | selector tests: a nothing-qualified run ends healthy |
| no count ceiling; no gate or warning counts posts; machinery removed | 1.3 | grep for removed symbols is empty; selector and build tests updated |

### pulse: Once per day, the Pulse queues the scout (ADDED) + queue enumeration (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| scout item derived exactly when the ledger has no scout today; at most one; ledger+clock only | 2.2 | idempotence tests; byte-identical test |
| item carries the uncovered trailing-7-day lines, a join not a judgment | 2.2 | coverage-join test; zero-model is already structurally enforced |
| ranks below breakage and corroboration, above routine timers | 2.2 | rank assertion against `RANKS` |

### loop: One job is one outcome (MODIFIED — the list gains `scout`)

| Normative clause | Task | Check that measures it |
|---|---|---|
| `scout` is a closed-list job type with a config cap | 2.1 | `loadConfig` tests; selector accepts the type |

### loop: Work comes from three sources (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| every brief states its job's filing rule; review brief asks for noted proposals | 3.8 | brief text tests |
| the loop transcribes noted proposals | 2.4 | transcription tests both ways |
| caps are mechanical; excess dropped with a note; discarded branches take their proposals | 2.4 | merge tests: four-to-three; branch death |
| stamping; same-type auto-discard, one hop, no inference | 2.4 | stamping and rejected-with-pointer tests |
| `expires:` skips cooling, never selects past expiry, sweeps to `dropped/` | 2.5 | proposals-reader tests |
| `dropped/` never blocks slugs | 2.5 | rejection-index test |

### loop: The scout looks outward (ADDED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| outward charge; all-inward runs rejected `spec-violation` | 2.3, 2.6 | brief and checklist text tests; the inward scenario |
| at most three, most worthy, docket discipline with expiry windows | 2.3, 2.4 | brief text test; merge cap test |
| declines recorded in `dropped/` with test and refile condition | 2.3, 2.6 | checklist test: drop records verified in review |
| quiet day opens the synthesis branch, never a floor | 2.3 | brief text test; the two quiet-day scenarios |
| nothing clears → `blocked: nothing cleared the bar`, a success | 2.3 | brief text test; ledger records the honest block (existing result protocol) |
| the blocked streak has a witness in `/status.json`; nothing acts on it | 2.7 | streak tests on a fixture ledger; stamp fields unaffected |
| drop records prove form, not rate — stated in the requirement | none — a truth claim, not a mechanism | the requirement text itself; review checklist still verifies each record's form (2.6) |
| scout diffs pass ordinary review | 2.6 | the review gate is unchanged; scout checklist exists |

### loop: budget table and degradation order (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| `scout` in the new-writing category | 2.1 | config test; budget-gate test with a scout candidate at the ceiling |
| `scout` shed at level 1 | 2.1 — the `exclude_types` arrays in `data/config.json`, edited 2026-08-30: `budget.mjs:372` sheds on those literal lists, not on budget categories | degradation test: one `capacity` line excludes scout |

### editorial: Every published prose piece must earn its reader (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| clause 3 is the stranger test, two operational forms, either satisfies | 3.2 (post), existing review flow (others) | the link-or-send scenario; checklist tests |
| correct, sourced, and forgettable fails the requirement | 3.2, 3.3 | brief and checklist text tests |

### review: reason list and forced fields (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| `reads-as-generated` in the closed list | 3.1 | `REASONS` test |
| post verdicts carry non-empty, non-duplicate `reads-human`; merge refuses otherwise | 3.1 | merge-gate tests, blank and duplicate |

### review: What is checked depends on what the work is (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| the post checklist verifies form, anchor, party, voice, and both questions | 3.2 | checklist text test |
| the scout checklist verifies charge, evidence, docket, drops, cap | 2.6 | checklist text test; the scout scenario |
