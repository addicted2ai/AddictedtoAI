# Tasks: make-the-blog-worth-sending

**How to work this list.** Sections in order — §1 (the deletion) is first
because the voice lint in §3 would fail the build against the five live
posts, and §2's first task is a reserved-path config edit nothing after it
can run without. Every task that touches code carries its tests beside it,
and `npm test` plus `npm run build` green after each task is part of that
task. No task writes a blog post: this change builds the producer and the
bar; the ordinary loop writes the posts, through the ordinary review gate.
Every named file, symbol and line was verified to exist at HEAD on
2026-08-30, except files this change creates.

## 1. The deletion

- [ ] **1.1 — Delete the five posts and their review records.** Remove all
  five `content/blog/*.md` posts and the five `data/reviews/seed-*.md`
  records that join them (an orphaned record is a standing false alarm in
  the reviews join). Run the build; fix any inbound link it names. Git
  history keeps both sets; nothing else references them.
- [ ] **1.2 — Lower the launch floor.** `scripts/verify-launch.mjs` line
  88: `posts: 2` becomes `posts: 0`, with a comment naming this change —
  the blog restarts empty by decision, and a floor that fails the gates on
  an intended state is a false alarm. Test: `verify-launch` passes on the
  post-deletion corpus.
- [ ] **1.3 — Remove the count-ceiling machinery, both copies.** In
  `lib/posts.mjs`: `POST_CEILING`, `ceilingBreaches`, `warnPostCeiling`
  and their call site in the build, plus their tests in
  `lib/surfaces.test.mjs`. In `loop/lib/config.mjs`:
  `BLOG_CEILING_POSTS` / `BLOG_CEILING_DAYS`; in `loop/lib/surfaces.mjs`:
  `blogCeilingGate` and its wiring in `loop/lib/select.mjs`, plus
  selector-rules tests. Removed, not disabled — no gate and no warning
  counts published posts anywhere afterward, and a grep for the removed
  symbols comes back empty.
- [ ] **1.4 — An honest empty blog.** Update the blog index copy in
  `lib/render/blog.mjs` (the line advertising "three in any seven days"
  goes with the ceiling it described) to describe the two forms in reader
  terms, and give the zero-post index an empty state that does not read as
  breakage. Rewrite `content/blog/README.md` for the two forms, the
  anchor, and the scout as the producer.

## 2. The scout

- [ ] **2.1 — Config first, then the closed list.** At execution start,
  the orchestrator applying this approved change (a reserved path — never
  a Desk job) adds to `data/config.json`: `job_caps_minutes.scout: 30`,
  and `scout` in the `new_writing` category list. Then `loop/lib/config.mjs`
  adds `scout` to `JOB_TYPES`. Order matters: `loadConfig` throws on a
  type without a cap. Tests: config fixtures gain the key; a fixture
  lacking it still throws, naming `scout`.
- [ ] **2.2 — The Pulse derives the daily scout item.** In
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
- [ ] **2.3 — The scout brief.** `ACCEPTANCE_BY_TYPE.scout` in
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
- [ ] **2.4 — Merge mechanics for candidates.** At the loop's merge step:
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
- [ ] **2.5 — Expiry semantics in the proposals reader.** In
  `loop/lib/proposals.mjs`: a proposal with `expires:` is ripe without
  the 3-day cooling and never selectable at or past expiry; at expiry the
  reader sweeps it to `data/proposals/dropped/` with a note naming the
  expiry. `dropped/` is never read by the rejection index — only
  `rejected/` blocks slugs. Tests: fresh expiring proposal ripe
  immediately; expired one swept, not selectable; a slug present only in
  `dropped/` does not auto-discard a new filing.
- [ ] **2.6 — The scout review checklist.** `CHECKLISTS.scout` in
  `loop/lib/review.mjs`, from the review delta: charge first (all-inward
  candidates fail it as `spec-violation`), evidence spot-fetched, docket
  fields present, drop records name their tests, at most three filed.
  Test: the assembled scout review brief carries these.

## 3. The bar and the voice

- [ ] **3.1 — The reason list and the voice field.** `REASONS` in
  `loop/lib/verdict.mjs` gains `reads-as-generated`. The merge gate
  requires, on `post` verdicts only, a non-empty `reads-human` field that
  is not an exact duplicate (after trimming) of any existing record's —
  the same two checks, at the same refusal point, as `would-cite`. Tests:
  blank refused; duplicate refused; non-post verdicts unaffected.
- [ ] **3.2 — The post checklist.** `CHECKLISTS.post` in
  `loop/lib/review.mjs`, from the review delta: identify the form and
  apply its finish line (note: anchor holds with external anchors
  fetched, affected party named where one exists, brevity never a defect;
  synthesis: method stated, evidence enumerable); judge the prose against
  `openspec/style/blog-voice.md`, rejecting `reads-as-generated` where it
  reads machine-made; answer the send question in `would-cite` and the
  voice question in `reads-human`. Test: the assembled post review brief
  carries these.
- [ ] **3.3 — The post brief.** Rewrite `ACCEPTANCE_BY_TYPE.post` in
  `loop/lib/brief.mjs`: the two forms and their finish lines; declare the
  anchor (`covers:` and/or `anchor:`) for a note; name the affected party
  and what changes for them where one exists; the subject is the world's
  AI, never this site; write to `openspec/style/blog-voice.md`; the
  existing source-check, overclaim and dates checks stay; the final check
  stays what it is today — not worth an enthusiast's time means write
  nothing and report `blocked:`. Test: the assembled post brief carries
  each.
- [ ] **3.4 — Anchor front-matter keys.** `postSchema` in `lib/schema.mjs`
  (strict, so absent this task the keys fail the build) gains `covers:`
  (a list of `{key, date}` change-feed references) and `anchor:`
  (`{url, date}`). Tests: each validates; malformed values fail naming
  the field.
- [ ] **3.5 — The anchor build check.** A prebuild `STEPS` check: a
  `covers:` reference resolving to no `data/changes.jsonl` line fails
  naming the post file and the reference; any declared anchor date
  outside the 7 days ending on the post's `date` — either direction —
  fails naming the post, the anchor, and the window. Tests: both
  failures; a compliant post passes; the post-deletion corpus (zero
  posts) is trivially clean.
- [ ] **3.6 — The anchor renders.** `renderPostPage` in
  `lib/render/blog.mjs` shows a note's anchor — the primary evidence,
  dated, linked — on the page. Test: a fixture post with `covers:` and
  one with `anchor:` each render the evidence line; a synthesis renders
  none.
- [ ] **3.7 — The voice lint.** New `scripts/check-post-voice.mjs`, run
  from the prebuild `STEPS` array, failing the build for `content/blog/`
  posts on the closed marker list documented in
  `openspec/style/blog-voice.md` §3 — semicolons > 2.5/1k words,
  em-dashes > 10/1k, self-narration ≥ 1, What/Why/How headers ≥ 2, the
  zero-tolerance register guards, focal-word family ≥ 3/1k, bold-lead
  lists — counting outside code fences, blockquotes, and dated correction
  blocks, and naming, for every fired marker, the marker, the measured
  value, and the threshold. Tests: unit cases per marker, plus the
  **two-direction validation with pinned corpora** — the twelve
  predecessor posts' extracted prose (from `d34040b`, pinned as fixtures
  so the check survives that commit's eventual garbage collection) must
  every one fire, and the nine-piece human sample (pinned the same way,
  sources and retrieval dates in `design.md` D6) must none fire. A lint
  edit that breaks either direction fails these tests.
- [ ] **3.8 — The brief's proposal rule.** Every assembled brief states
  the proposal rule binding its job — at most one as a side-output for
  ordinary jobs, the scout's own rule for `scout` — with the front-matter
  contract including `expires:`. The review brief asks the reviewer to
  note a proposal where its review surfaced one. Tests: brief text for
  an ordinary type and for `scout`; review brief text.

## 4. Verification

- [ ] **4.1 — Gates.** `npm test` and `npm run build` green at each
  section boundary;
  `openspec validate make-the-blog-worth-sending --type change --strict
  --no-interactive` passes; whoever publishes runs the full gate set per
  `CLAUDE.md`.
- [ ] **4.2 — The machine end-to-end, on fixtures.** With a pinned clock
  and a fixture tree: a Pulse run derives the scout item (and only one);
  a Desk dry-run selects it and its brief carries the context lines; a
  simulated scout branch with four candidates and two drop records merges
  to three candidates, one mechanical drop, and the records in
  `dropped/`; an expiring candidate is ripe immediately and swept at
  expiry. Record the run — date, method, observed output — against this
  task when it is done.

## 5. The record

- [ ] **5.1 — Update the three issues; file one.** Comment disposition on
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
| the lint fails the build on the closed list; tests pin both corpora and assert both directions | 3.7 | the lint's own two-corpus tests: 12/12 fire, 0/9 fire |
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
| scout diffs pass ordinary review | 2.6 | the review gate is unchanged; scout checklist exists |

### loop: budget table and degradation order (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| `scout` in the new-writing category | 2.1 | config test; budget-gate test with a scout candidate at the ceiling |
| `scout` shed at level 1 | 2.1 (selector reads config categories) | degradation test: one `capacity` line excludes scout |

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
