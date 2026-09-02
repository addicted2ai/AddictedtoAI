# blog — delta for make-the-blog-worth-sending

Every normative sentence below names, in `tasks.md` §6, the task that
implements it and the check that measures it. A SHALL with no task is
invisible twice over: a literal implementer never builds it and the
integrated verification passes without it.

For the record, outside any requirement body: the machinery that enforced
the previous 3-in-7 count ceiling — both constants, the selector gate, and
the build warning — is removed by this change, not left disabled. The
modified quality-gated requirement below states the timeless rule that
results. Removing that ceiling touches nothing in `loop`: the new-writing
model-minute ceiling and the capacity-shedding order are owned there and
are neither relaxed nor restated by this change. The requirement body
below names them as standing bounds, in the constitution's voice, without
narrating that fact — a reader who finds that body after archiving cannot
reach this preamble, and does not need to.

## ADDED Requirements

### Requirement: A post takes one of two forms, and each form has its own finish line

Every post SHALL be one of two forms: a **news note** — a post about a
dated event, carrying the anchor the next requirement defines — or a
**synthesis** — a post assembling recorded, dated evidence into a shape no
single event shows.

- A news note SHALL lead with what happened and who it lands on, and SHALL
  reference the wiki for identity and background rather than restating it.
  A note has **no minimum length**: it is finished when an affected reader
  knows what happened, what changes for them, and where the primary
  evidence is. Review SHALL NOT treat brevity alone as a defect in a note.
- A synthesis SHALL state the method its shape was derived by — what was
  fetched, filtered, sorted or counted, concretely enough that a skeptical
  reader could reproduce the derivation — and SHALL rest on enumerable
  dated evidence, never on impressions.
- Every post SHALL pass the stranger test (see `editorial`) in its
  **would-send** form: for a post, being worth citing alone does not
  publish. A survey with a finding someone would forward passes; a survey
  with no such finding does not, however accurate.

#### Scenario: A 150-word note is complete

- **WHEN** a note covers a retirement in 150 words that name the event, the
  affected users, the shutdown date and the primary source
- **THEN** review judges it on its finish line and does not reject or revise
  it for shortness

#### Scenario: A synthesis without its method is sent back

- **WHEN** a draft synthesis asserts a trend across the catalog but never
  states how the trend was derived
- **THEN** review returns `revise` naming the missing method, and the post
  does not publish until the derivation is stated

#### Scenario: Correct, sourced, and forgettable does not publish

- **WHEN** a draft post is factually clean and fully sourced but the
  reviewer cannot say who would send it, or to whom
- **THEN** it is rejected `not-worth-reading`, in those words

### Requirement: A news note is anchored in evidence its author cannot create

A news note SHALL declare its anchor in front matter, as one or both of:

- `covers:` — one or more change-feed references (the `key` and `date` of
  lines in `data/changes.jsonl`), for events the Pulse observed; or
- `anchor:` — an external anchor: a primary-source URL and the event's
  date, for events outside the Pulse's aperture.

The checks, mechanical where mechanism is cheap and review-run where it is
not:

- The build SHALL fail a post whose `covers:` reference resolves to no line
  in `data/changes.jsonl`, naming the post file and the unresolved
  reference.
- The build SHALL fail a post any of whose declared anchor dates falls
  outside the 7 days ending on the post's own `date` — **every** declared
  anchor, in **both** directions: an anchor after the post's date is as
  mislabeled as one more than 7 days before it. An older event a note
  refers to in passing is a link in prose, never a declared anchor, so
  freshness cannot be laundered by adding one fresh line beside a stale
  one. Stated honestly: the window is anchored to the post's own declared
  `date`, which the author writes — nothing compares either date to the
  build clock, so this check guarantees internal consistency, not absolute
  recency. Absolute recency is held by the machinery around it: the
  scout's 7/14-day `expires:` windows keep candidates fresh, and review's
  existing dates check reads the dates against the world.
- For an external anchor, review SHALL fetch the source and confirm it
  documents both the event and its date; an anchor that does not hold is
  `false-or-unsupported-claim`.
- The rendered post page SHALL show the anchor — the primary evidence,
  dated and linked, visible to the reader — rather than leaving it as
  front matter only. A note's finish line includes "where the primary
  evidence is", and evidence the reader cannot see does not count.
- A post about a dated event that declares no anchor SHALL be returned in
  review as `spec-violation` naming the missing anchor; a post declaring
  no anchor and claiming no event is a synthesis and is judged as one.

The anchor is unforgeable where it matters: `data/changes.jsonl` is written
only by the deterministic, model-free Pulse, and an unresolved reference
fails the build. An external anchor is weaker — a URL is claimable — which
is why its date sits under a mechanical check and its content under
review's mandatory fetch.

#### Scenario: A bogus feed reference fails the build

- **WHEN** a post declares `covers:` naming a key and date matching no line
  in `data/changes.jsonl`
- **THEN** the build fails, naming the post file and the reference, before
  any page renders

#### Scenario: An anchor outside the window fails the build

- **WHEN** a post dated 2026-09-20 declares one anchor dated 2026-09-01 and
  another dated 2026-09-18
- **THEN** the build fails naming the post, the 2026-09-01 anchor, and the
  7-day window — the fresh anchor beside it launders nothing

#### Scenario: An external anchor is fetched, not trusted

- **WHEN** a note's only anchor is an external URL and the fetched page does
  not document the claimed event on the claimed date
- **THEN** review rejects with `false-or-unsupported-claim` naming the
  anchor

### Requirement: A post with an affected party names them

Where a post's subject has an identifiable affected party — users of a
retiring model, holders of a licence that changed, subscribers to a
repriced tier — the post SHALL name who is affected and what changes for
them, concretely: what breaks or changes, what to do about it, and by when,
where a date exists. A post about an actor-event that never says who it
lands on SHALL be returned in review as `revise` with reason
`not-worth-reading`, naming the missing party. A synthesis whose subject
has no affected party (a shape of the catalog, a property of a document
set) is not required to invent one.

#### Scenario: A retirement note that lands on nobody is sent back

- **WHEN** a draft note lists three retired model ids and their shutdown
  date but never says whose calls fail that day or what to migrate to
- **THEN** review returns `revise` with reason `not-worth-reading`, naming
  the missing affected-party move

#### Scenario: A catalog-shape synthesis is not forced to invent a victim

- **WHEN** a synthesis derives a pricing-floor trend from the catalog and
  no specific party is affected by the trend's existence
- **THEN** the affected-party requirement does not apply and review does
  not demand one

### Requirement: The blog is about AI, never about this site

The blog's subject SHALL be the world's AI — its models, vendors, prices,
licences, incidents, methods and people-facing consequences. A post MAY
draw on the site's own data layer as evidence, because that layer records
the world. The site itself — its machinery, its corpus, its build, its
process, its history — SHALL NOT be a post's subject, and review SHALL
reject a post whose subject it is as `spec-violation` naming this rule.
Self-description belongs to the colophon, which this requirement does not
touch.

#### Scenario: The site's own process is not a story

- **WHEN** a draft post's subject is how this site's review gate or content
  pipeline works
- **THEN** review rejects it as `spec-violation` naming this rule, however
  well it is written

#### Scenario: Site data about the world is fair evidence

- **WHEN** a note documents a vendor's price change using the site's own
  snapshot diff as its record of the before and after
- **THEN** nothing in this rule objects — the subject is the vendor's
  change, and the data layer is evidence of it

### Requirement: Posts read as human writing, and the disclosure of AI authorship stands

The prose bar, ordered the way the maintainer ordered it: quality first —
a post earns publication by being worth a stranger's attention, and
reading human is craft in service of that, a stylistic preference that
can only be measured so accurately. Measurement where measurement is
cheap (advisory), model-run judgment where it is not (the gate) — and a
hard boundary around disclosure.

- Every post SHALL be written to the house voice of record at
  `openspec/style/blog-voice.md` — the lede a fact, specifics over
  abstraction, varied rhythm, headers that state findings, emphasis spent
  sparingly, length set by what there is to say, a point of view where the
  evidence supports one. The path is outside `openspec/changes/` (which
  archiving moves) and outside `openspec/specs/` (which is reserved, and
  the voice document must stay amendable as ordinary editorial work).
- A voice lint SHALL run in the prebuild over `content/blog/` posts,
  measuring the closed marker list documented in the voice document —
  density thresholds and presence tells calibrated against a labeled
  negative corpus and a human sample, with the corpora, per-document
  values and honest limits recorded in
  `openspec/style/blog-voice-calibration.md`. **The lint is advisory: it
  SHALL warn, naming for every tripped marker the post, the marker, the
  measured value and the threshold, and it SHALL NOT fail the build.**
  This is deliberate, and it joins the repository's two existing
  warn-not-fail cases (a currency literal in prose; the old over-ceiling
  post rate): the maintainer's own instruction is that feeling human is a
  stylistic preference that can only be measured so accurately, and the
  measured fact is that the house model trips the punctuation-rate markers
  in every register it writes — a fail-closed gate here would silently
  stop all `post` work while every component reported success. The lint's
  own tests SHALL pin both corpora as fixtures and assert the calibration
  record's measured firing counts against them, and SHALL assert that a
  tripped marker warns without failing the build.
- The gate the lint is not, the review job is: a post that reads as
  generated SHALL be rejected `reads-as-generated` (see `review`), with
  the reviewer's own-words answer recorded in the verdict's `reads-human`
  field. The reviewer MAY cite the lint's warnings as evidence; the
  verdict, not the count, decides.
- This requirement governs craft, never disclosure: the site's disclosure
  of AI authorship SHALL stand, and a change that hides, softens or
  qualifies that disclosure so posts "feel human" SHALL be rejected as
  `spec-violation`. The writing must not read machine-made; the site must
  not pretend human-made. Both, always.

#### Scenario: A tell-dense draft is warned on and rejected in review

- **WHEN** a draft post runs 15 semicolons per 1,000 words and narrates
  that "every number in this post is the vendor's own"
- **THEN** the voice lint warns, naming each tripped marker, its measured
  value, and its threshold — the build does not fail — and the reviewer,
  who sees the same prose and may cite the warnings, rejects it
  `reads-as-generated`

#### Scenario: Smooth, signposted prose is a named rejection

- **WHEN** a draft trips no lint marker but every paragraph is the same
  shape, the structure is signposted, and nothing in it would ever be
  blunt
- **THEN** review rejects it `reads-as-generated`, and the record's
  `reads-human` field says where it reads machine-made in the reviewer's
  own words

#### Scenario: Concealment is not the assignment

- **WHEN** a job proposes removing or softening the site's disclosure of AI
  authorship so that posts feel more human
- **THEN** the proposal is rejected as `spec-violation` — the requirement
  binds the prose, not the disclosure

## MODIFIED Requirements

### Requirement: Publishing is quality-gated, never quota-driven

There SHALL be no minimum posting cadence: zero posts in a week is a
normal, healthy outcome — and, on the measured event supply, a rare one. A
day with no qualifying headline opens the scout's synthesis branch (see
`loop`); it never lowers the bar.

There SHALL be no count ceiling on published posts, and no selector gate or
build warning SHALL count them. What bounds volume, each bound enforced at
its own named point:

- the scout's cap of three candidates per day, mechanical at its merge
  (see `loop`);
- the editorial bar, applied by the author (an honest `blocked:` is a
  success) and by review's kill discipline, with declined candidates
  recorded rather than deferred;
- the new-writing model-minute ceiling and the capacity-shedding order in
  `loop`, which bound volume from outside the blog's own rules and are
  owned by `loop`, not by anything here.

A post exists because something happened worth an enthusiast's time, or
because accumulated evidence shows a shape worth a stranger's attention —
the editorial bar decides, never a schedule and never a quota.

#### Scenario: A slow week publishes nothing

- **WHEN** a week passes in which nothing clears the editorial bar
- **THEN** no post is published and nothing anywhere treats that as a
  failure

#### Scenario: A busy day is judged, not rationed

- **WHEN** five distinct stories all clear the scout's bar on one day
- **THEN** the scout files the three most worthy, records why the other two
  were declined, and every filed candidate that clears review publishes —
  no count gate refuses any of them

#### Scenario: A capacity glut does not become a glut of posts

- **WHEN** new-writing model-minutes reach their budget ceiling in a tier
- **THEN** the selector refuses further `post` and `scout` work in that
  tier until the window rolls, exactly as the budget requirement in `loop`
  specifies
