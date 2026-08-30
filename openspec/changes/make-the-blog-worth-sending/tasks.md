# Tasks: make-the-blog-worth-sending

**How to work this list.** Machinery first (§1–§4), in order within each
section — later sections read state earlier sections create. Every task that
touches code carries its tests beside it, and `npm test` plus
`npm run build` green after each task is part of that task, not a separate
one. No task here writes a blog post: this change builds the producer and
the bar; the ordinary loop writes the posts, through the ordinary review
gate. All file paths were verified to exist (and the named symbols to exist
in them) on 2026-08-30, except files this change creates.

## 1. The anchor and the forms

- [ ] **1.1 — Post front-matter keys.** Add `covers:` (a list of change-feed
  references — `key` plus `date` of `data/changes.jsonl` lines) and
  `anchor:` (an object: primary-source `url` plus event `date`) to the post
  schema in `lib/schema.mjs`. Unknown keys already fail the build, so
  absence of this task is loud by design. Tests: a post carrying each key
  validates; a malformed value fails naming the field.
- [ ] **1.2 — Anchor resolution and staleness fail the build.** A build
  check (a `STEPS`-visible failure like every other corpus violation): a
  `covers:` reference resolving to no `data/changes.jsonl` line is an error
  naming the post file and the reference; a post whose newest declared
  anchor date (feed or external) precedes the post's `date` by more than 7
  days is an error naming the post, the date, and the window. Tests for
  both, plus: the real corpus is clean (the five existing posts declare no
  anchor and are legal syntheses).
- [ ] **1.3 — The post brief teaches the two forms.** Rewrite the `post`
  entry in `ACCEPTANCE_BY_TYPE` (`loop/lib/brief.mjs`): the two forms and
  which this job is (a queue candidate is a note; a proposal or directive
  is whichever its evidence supports); a note leads with what happened and
  who it lands on, declares its anchor, has no minimum length; a synthesis
  states its method; where an affected party exists the post names them and
  what changes for them; the post links the most recent earlier post on the
  same subject where one exists; the existing "worth an enthusiast's time
  or report `blocked:`" check is kept verbatim — a
  `blocked: not worth a note` outcome is a success. Test: the assembled
  brief for a `post` job contains these checks.
- [ ] **1.4 — The brief carries the evidence and the memory.** Brief
  assembly for `post` jobs surfaces (a) the candidate group's event lines
  (dates, keys, old/new values, source URLs, excerpts) when the work source
  is a queue candidate, and (b) earlier published posts sharing mentions
  with the subject, newest first. Test: a fixture candidate's lines and a
  fixture prior post both appear in the assembled brief.

## 2. The producer — Pulse post candidates

- [ ] **2.1 — Candidate derivation in `pulse/lib/queue.mjs`.** From
  `data/changes.jsonl` lines dated in the trailing 7 days, of kinds
  `release`, `arrival`, `retirement`, and `field_change` on material fields
  (price/licence/status; annotation lines never): group by
  (source, date, kind, vendor-prefix of `row_id`), one queue item per
  group, `type: 'post'`, rank constant **below** every `repair` and
  `verify` rank in `RANKS` (35 — under `overdue-fact-slow` at 45, above
  `want-eligible-mint` at 30), item detail carrying every line in the
  group. Tests (fixture corpus, pinned clock): the 2026-08-29-shaped
  fixture (2 retirements, 10 arrivals, 17 field changes) yields the
  expected groups; an 8-day-old uncovered group yields nothing; re-running
  on unchanged state is byte-identical; annotation lines yield nothing.
- [ ] **2.2 — The coverage join.** The derivation reads published posts'
  `covers:` front matter and suppresses any group with a covered line.
  Tests: a fixture post covering one of three lines in a group suppresses
  the group; an uncovered group persists; a draft post
  (`draft: true`) suppresses nothing.

## 3. The lanes — selector and build warning

- [ ] **3.1 — The unanchored-lane gate.** In `loop/lib/config.mjs`, replace
  `BLOG_CEILING_POSTS = 3` with the unanchored-lane constant (1 in 7 days,
  named for what it now counts). In `loop/lib/surfaces.mjs`, reshape
  `blogCeilingGate`: classify the candidate's lane (queue post candidates,
  and proposals/directives declaring an anchor, are anchored; all other
  `post` candidates unanchored); count only published **unanchored** posts
  (no `covers:`/`anchor:` front matter) in the trailing 7 days; refuse an
  unanchored candidate at 1, naming the rule; never refuse an anchored
  candidate on count. Tests in the selector-rules suite: anchored candidate
  passes with five recent anchored posts published; unanchored candidate
  refused with one recent unanchored post; the refusal names the lane rule.
- [ ] **3.2 — The build warning counts the unanchored lane.** In
  `lib/posts.mjs`, `ceilingBreaches`/`warnPostCeiling` count only
  unanchored posts against the new constant (a warning, not a failure,
  unchanged). Update the blog-index copy in `lib/render/blog.mjs` (line 74
  today) that states "the ceiling is three in any seven days" to describe
  the two lanes in reader terms. Tests: existing ceiling fixtures updated;
  five same-week anchored posts warn nothing.

## 4. The proposal producer

- [ ] **4.1 — Every brief states the MAY.** A section in every assembled
  brief (`loop/lib/brief.mjs`): the job may end by writing **at most one**
  proposal file to `data/proposals/`, with the front-matter contract
  restated (date, kebab-case `slug`, `type` from the closed list, summary,
  evidence) and the note that more than one will be mechanically discarded
  and that a proposal of the job's own type will be auto-discarded. Test:
  every job type's assembled brief carries the section.
- [ ] **4.2 — The reviewer is asked, and the loop transcribes.** The review
  brief (`loop/lib/review.mjs`) asks the reviewer to note a proposal where
  its review surfaced one (in the verdict record, outside the reviewed
  tree, as the record already is); the loop transcribes a noted proposal
  into a well-formed `data/proposals/` file naming the reviewing job.
  Tests: a verdict record noting a proposal produces the file; a record
  noting none produces nothing.
- [ ] **4.3 — At-most-one, stamping, and the self-amplification discard are
  mechanisms.** At merge: where the merged branch added more than one
  proposal file, keep exactly the first by filename and discard the rest
  with a note naming them; stamp the proposing job's type onto each kept
  proposal, overwriting any executor-written value; auto-discard (to
  `data/proposals/rejected/`, pointer to the rule, no inference) any
  proposal whose stamped origin type equals its proposed type. A discarded
  branch's proposals die with the branch. Tests: three proposals on a
  branch merge to one kept, two discarded with notes; a `post` job's `post`
  proposal lands in `rejected/` with the pointer; a discarded job's
  proposal never reaches `data/proposals/`.
- [ ] **4.4 — The post review checklist.** Extend the blog-post entry in
  `CHECKLISTS` (`loop/lib/review.mjs`): identify the form and apply its
  finish line — for a note, the anchor holds (fetch external anchors and
  confirm event and date), the affected party is named where one exists,
  and brevity alone is never a defect; for a synthesis, the method is
  stated and the evidence enumerable; and the `would-cite` field for a post
  answers who would send this and to whom. Test: the assembled review brief
  for a `post` job carries these items.

## 5. Docs, validation, and measurement

- [ ] **5.1 — Docs and gates.** Update `content/blog/README.md` to describe
  the two forms and two lanes. `npm test` and `npm run build` green;
  `openspec validate make-the-blog-worth-sending --type change --strict
  --no-interactive` passes; whoever publishes runs the full gate set per
  `CLAUDE.md`.
- [ ] **5.2 — Measure the machine end-to-end on fixtures.** With a fixture
  `data/changes.jsonl` modeled on the measured 2026-08-29 diff and an empty
  repair/verify queue, a Pulse run derives the expected candidates and a
  Desk dry-run selects the top candidate as a `post` job whose brief
  carries the group's evidence. Record the measurement — date, method,
  observed output — in this file against this task.
- [ ] **5.3 — File the deferred work as issues, before archiving.** Two
  beads issues, filed at execution time so they carry their own ids:
  (a) observe and record the first live anchored note and the first
  proposal-originated synthesis, end to end (job → review → merge →
  publish), with dates and job ids; (b) widen the Pulse aperture (more
  registered sources: vendor deprecation pages, licence files, status
  pages, changelogs) as the measured lever toward the maintainer's
  one-good-topic-a-day instinct — routine source-registry work, no spec
  change. The issues are the deliverable of this task; their work is not.

## 6. Traceability — every normative clause, its task and its check

### blog: A post takes one of two forms (ADDED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| every post is one of two forms, by evidence | 1.1, 3.1 | classification is mechanical: front matter (build) and lane (selector tests) |
| a note leads with the event and who it lands on; references the wiki | 1.3, 4.4 | review, per the form's finish line; brief text test |
| no minimum length; review never treats brevity alone as a defect | 1.3, 4.4 | checklist text test; the 150-word scenario |
| a synthesis states its method and rests on enumerable dated evidence | 1.3, 4.4 | review, per the missing-method scenario |
| every post passes the would-send test | 4.4 | review: `not-worth-reading` when the reviewer cannot answer the send question |
| the post links the most recent prior post on the subject; the brief lists them | 1.3, 1.4 | brief assembly test; review checks the link |

### blog: A news note is anchored (ADDED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| a note declares its anchor in front matter | 1.1 | schema test; unknown keys already fail the build |
| unresolved `covers:` fails the build naming file and reference | 1.2 | build-check test |
| a stale anchor (>7 days before post date) fails the build | 1.2 | build-check test |
| review fetches an external anchor and confirms event and date | 4.4 | review checklist test; `false-or-unsupported-claim` scenario |
| no anchor means synthesis, governed by the unanchored lane | 3.1, 3.2 | lane classification in selector and warning tests |

### blog: A post with an affected party names them (ADDED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| who is affected and what changes for them, concretely | 1.3, 4.4 | review, per the retirement-note scenario |
| missing party returns `revise` / `not-worth-reading` naming it | 4.4 | checklist text test |
| a party-less synthesis is not forced to invent one | 4.4 | checklist text test (the exemption is stated where the demand is) |

### blog: Publishing is quality-gated, never quota-driven (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| no minimum cadence | none — implemented by the absence of any floor mechanism | selector tests: the slow-week scenario selects nothing and reports it healthy |
| anchored posts carry no count ceiling | 3.1, 3.2 | selector test: five recent anchored posts refuse nothing; warning test |
| unanchored ceiling 1-in-7, refused at the selector, warned by the build | 3.1, 3.2 | selector and warning tests; refusal names the rule |
| lane classing: work source for candidates, front matter for published | 3.1 | selector tests for each source kind |

### editorial: Every published prose piece must earn its reader (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| clause 3 passes on either would-cite or would-send | 4.4 (post checklist); the spec text itself for other kinds | review: rejection requires failing both, per the link-or-send scenario |
| a surface may require one test (blog requires send) | 4.4 | the blog table's would-send row |
| correct, sourced, and forgettable fails the requirement | 1.3, 4.4 | brief and checklist text tests; the forgettable scenario |

### pulse: Noteworthy events become post candidates (ADDED) + queue enumeration (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| candidates derive from trailing 7 days, named kinds, annotations never | 2.1 | fixture tests incl. annotation exclusion |
| grouping is deterministic and same-day-related-as-one | 2.1 | the three-retirements fixture yields one candidate |
| suppression while covered; leave when covered or expired | 2.2, 2.1 | coverage-join and expiry tests |
| items propose `post`, ranked below repair and verify, carrying the lines | 2.1 | rank assertion against `RANKS`; brief evidence test (1.4) |
| queue properties preserved (recomputed, no identity, byte-identical) | 2.1 | the existing byte-identical test extended over candidates |

### loop: Work comes from three sources and cannot self-amplify (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| every brief states the at-most-one proposal MAY and the contract | 4.1 | brief text test across all job types |
| the review brief asks; the loop transcribes noted proposals | 4.2 | transcription tests both ways |
| at-most-one is mechanical; extras discarded with a note; discarded branches take their proposals with them | 4.3 | merge tests: three-to-one; discarded-branch death |
| the loop stamps origin type; same-type proposals auto-discarded, no inference | 4.3 | stamping and rejected-with-pointer tests |

### review: What is checked depends on what the work is (MODIFIED)

| Normative clause | Task | Check that measures it |
|---|---|---|
| the reviewer identifies the form and applies its finish line | 4.4 | review-brief text test |
| a post's `would-cite` answers the send question; mechanics unchanged | 4.4 | review-brief text test; existing merge-gate tests untouched and still green |
