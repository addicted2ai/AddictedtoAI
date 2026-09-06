# blog Specification

## Purpose
Dated stories about the technologies, methods, models and companies trying to
advance AI. Posts are true on their date and stay honest about being dated;
they reference the wiki rather than restating its facts.

## Requirements

### Requirement: Posts are dated and never silently rewritten

Every post SHALL carry its publication date visibly. After publication, a
post's body SHALL NOT be edited except to append a dated correction block
("Correction, <date>: ...") or to fix typos that change no meaning. A post is
true as of its date; aging is not a defect and generates no rework. Volatile
facts inside posts follow the wiki transclusion rule, so the data a post
displays stays current even while its narrative stays dated.

#### Scenario: A correction is appended, not smuggled

- **WHEN** a published post is found to contain a wrong external claim
- **THEN** the fix is a dated correction block appended to the post (and the
  claim struck through or amended inline with the correction referenced),
  never a silent rewrite

### Requirement: Titles and excerpts may not outclaim bodies

A post's title, excerpt, and any summary line SHALL claim no more than the
body demonstrates. Motive attribution, legal characterization ("broke the
law", "lied"), and stronger time or causation claims than the evidence
supports are rejection reasons in review even when every fact in the body is
verified. Summary copy gets more scrutiny than body copy, not less — that is
where overclaims hide.

#### Scenario: Verified body, overclaiming headline

- **WHEN** a draft post's body carefully documents a vendor changing a policy
  but its title asserts why the vendor did it
- **THEN** review rejects it with reason `false-or-unsupported-claim` against
  the title, even though the body passes

### Requirement: External claims meet a sourcing bar

Every externally checkable claim in a post (what a company did, what a model
scored, what a price was, what a person said) SHALL carry a source a reader
can follow. Quotations attributed to named people MUST link a source that
contains the quotation. Claims about a named company's conduct SHALL be held
to a news-fact-checking standard: primary sources over aggregators, dates
explicit, and uncertainty stated as uncertainty rather than resolved toward
the more dramatic reading.

#### Scenario: Unsourced conduct claim is rejected

- **WHEN** a draft asserts a company quietly changed a data-retention promise
  without linking evidence of both the before and after states
- **THEN** review rejects it with reason `false-or-unsupported-claim` naming
  the unsupported half

### Requirement: Publishing is quality-gated, never quota-driven

There SHALL be no minimum posting cadence: zero posts in a week is a
normal, healthy outcome — and, on the measured event supply, a rare one. A
day with no qualifying headline opens the scout's synthesis branch (see
`loop`); it never lowers the bar.

There SHALL be no count ceiling on published posts, and no selector gate or
build warning SHALL count them. What bounds volume, each bound enforced at
its own named point:

- the scout's cap of three candidates per day, mechanical at its merge
  (see `loop`), from which a candidate flagged `frontier: true` is exempt —
  the flag carries its own bar (the frontier requirement in this
  specification), and a flag citing no valid criterion, or a domain outside
  the vocabulary, is not filed at all;
- the editorial bar, applied by the author (an honest `blocked:` is a
  success) and by review's kill discipline, with declined candidates
  recorded rather than deferred;
- the new-writing model-minute ceiling and the capacity-shedding order in
  `loop`, which bound volume from outside the blog's own rules and are
  owned by `loop`, not by anything here.

**The frontier exemption lifts a count, never a budget.** `post` and `scout`
work over the new-writing ceiling is refused whether or not a candidate carries
the flag, and nothing about the flag changes the ceiling, the upkeep floor or
the shedding order. Both halves are required and neither substitutes for the
other: a bar with no budget behind it makes flagging everything the rational
move, and a budget with no bar in front of it spends the whole ceiling on
stories that did not qualify.

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

#### Scenario: A frontier flag buys no budget

- **WHEN** new-writing model-minutes are at their ceiling in a tier and a ripe
  candidate carries `frontier: true` with a valid criterion and domain
- **THEN** the selector refuses it exactly as it refuses any other `post` or
  `scout` work in that tier — the exemption is from the candidate cap and from
  nothing else

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

### Requirement: A frontier flag is earned, declared, and gated at the build

A post MAY declare that it records something that moved the frontier. When it
does, the flag SHALL carry its bar with it — the criterion it qualifies under
and the domain it lands in — because the flag buys an exemption from the
scout's candidate cap, and an exemption without a bar is a loophole.

What the flag marks is a **record**: something that happened, on a date, with
evidence a reader can check. It is never a position in a ranking. A rank is not
a claim this site states on its own authority (`directory`), and a table of
positions has no motion in it — which is the whole reason a dated record and
not a leaderboard is what a frontier surface is built from.

Three front-matter keys, and only one of them is ever required:

- `frontier: true` — optional; absent means false.
- `frontier_reason` — REQUIRED when `frontier: true`; exactly one of `F1`,
  `F2`, `F3`, `F4`, `F5`.
- `domains` — OPTIONAL, flagged or not; zero or more values from the closed
  domain vocabulary: `coding`, `agents`, `image`, `video`, `audio`, `research`,
  `science-math`, `robotics`. "General" is the unmarked default and is not a
  value; `text` is not a value. **Absence is that default, spelled out**: a
  flagged record carrying no `domains` is a general one, not an untagged one,
  and an empty list means what an absent key means.

The criteria, one of which is cited and only one:

- **F1** — a capability shown for the first time, with an artifact anyone can
  check (executed transcript, paper with code, public demo).
- **F2** — a lead change on a published index, or a rescoring that moved a
  leader.
- **F3** — a release by a covered organisation of a model it positions as its
  frontier, or an open-weights release matching a covered lab's frontier on a
  published measure.
- **F4** — a verbatim vendor claim by a major player about a new ability,
  labelled unverified.
- **F5** — a material change in access: a frontier model withdrawn, gated, or
  opened.

**Not qualifying:** a new checkpoint, a price change, a benchmark post with no
new artifact, a tool release. The test, stated as the test rather than as a
list to be extended: *what every other AI news site already shows does not
qualify on its own.*

The build SHALL fail a post declaring `frontier: true` with no
`frontier_reason`, with a `frontier_reason` outside F1–F5, or with any
`domains` value outside the closed vocabulary — naming the post file and the
offending field, before any page renders. **A post carrying no `domains` SHALL
NOT fail**, flagged or not. The domain vocabulary SHALL have exactly one
definition in the source tree, shared with every other surface that reads a
domain, because two closed lists of the same eight values drift and the drift
is silent.

**That the absent case passes is a decision, and it is recorded here because it
is the kind of bar that gets re-tightened by someone who has forgotten why it
loosened.** An earlier draft of this requirement made `domains` required when
the flag is set, transcribing DESK-ORDER-001 §1 as it then stood. The bar was
withdrawn as ruling K46, taken under the K40 delegation, on the blind
arbiter record
`loops/ui-loop/graph/artifacts/BLIND-002.md`, and §1's own gate line was
amended to match. Two reasons, and both are about the vocabulary rather than
about this surface. First, K38 makes "general" the **unmarked** default and
removes `text`, so absence is not a missing value but a stated one — and a gate
that fails a record for carrying the vocabulary's own default contradicts the
vocabulary it is enforcing. Second, the ≥1 bar was written while `text` was
still a value a general story could carry; at that moment it excluded nothing,
and it acquired an editorial effect no ruling ever stated only when K38 removed
the value. The cost is concrete: a court filing, a regulator's enforcement
action, a licence revenue gate and a system card are F4- and F5-shaped events,
and four such posts existed on 2026-09-05 —
`content/blog/doj-statement-of-interest-llm-training-fair-use.md`,
`content/blog/eu-ai-office-first-enforcement-rfis.md`,
`content/blog/glm-5-3-license-revenue-gate.md` and
`content/blog/openai-gpt-6-astra-system-card.md` — none of which maps to any
value in the vocabulary. Under the withdrawn bar not one of them could be
flagged at all, which would make the criteria above unreachable on the one
surface the flag exists to populate.

These three keys are **editorial judgment and not machine-maintained data**.
They SHALL NOT be exempted from a post's reviewed surface: adding or changing
any of them on a published post is an edit to what was reviewed, it makes that
post's review record report `mismatched`, and it is corrected by review rather
than by exemption. Tagging a post is a review event, and paying that cost is
the point — what a story is, and where it lands, is exactly the kind of
judgment this site does not let publish unreviewed.

#### Scenario: A flag with no criterion fails the build

- **WHEN** a post declares `frontier: true` and no `frontier_reason`
- **THEN** the build fails naming the post file and the missing field, before
  any page renders

#### Scenario: A flag with a domain outside the vocabulary fails the build

- **WHEN** a post declares `frontier: true`, a valid `frontier_reason`, and
  `domains: [text]`
- **THEN** the build fails naming the post file and the invalid value — the
  vocabulary is closed, `text` is the value K38 removed from it rather than one
  it forgot, and a domain the section cannot group by is not a domain

#### Scenario: A flagged story with no domain is general, not invalid

- **WHEN** a post covering a court filing declares `frontier: true` and a valid
  `frontier_reason`, and declares no `domains` at all
- **THEN** the build passes and the post is flagged — its absent `domains` is
  the vocabulary's unmarked "general", not an unfilled field, and nothing
  treats the absence as a defect to be repaired

#### Scenario: A price change is not a frontier story

- **WHEN** a draft note covers a vendor cutting a headline price and declares
  `frontier: true` citing F5
- **THEN** review rejects the flag as `spec-violation` naming the
  not-qualifying list — a price change is what every other AI news site
  already shows, and F5 is a change in access, not in price

#### Scenario: Tagging a published post goes back through review

- **WHEN** `frontier`, `frontier_reason` and `domains` are added to a post that
  already carries an approved review record
- **THEN** that record reports `mismatched` and the post is not cleared until a
  new verdict is recorded against the changed bytes

### Requirement: An F2 record carries the publisher's act, never the publisher's numbers

An index rescoring is a real event and one of the most consequential a
frontier surface can report — a leader can lose the lead without anything
shipping. It is also the one criterion whose natural telling is a republication
of somebody else's numbers, which the rights rule forbids until republication
terms are cleared and recorded.

Both halves hold at once, and the seam between them is stated as two lists
rather than one. **Permitted in an F2 record's copy:**

- the publisher;
- the index name and its version;
- the date;
- the direction of the rescoring;
- the coverage change, as a count of rows scored before and after;
- the fact that a non-uniform rescoring can invert orderings.

**Forbidden in an F2 record's copy:** any index value, any ratio, any rank, any
per-model score. These are derived from republished numbers. They belong in the
review record, where a reviewer can check the author's work, and never on a
rendered page.

Both lists are normative and neither may be dropped as redundant. A list that
says only what is permitted is not a source test — it is a field-name test, and
a field-name test has already failed in this corpus: an allow-list keyed on
field names admitted a router's measured throughput and a third-party analysis
site as vendor claims, because the names matched and the sources did not. F2
has that shape exactly. A rescoring described by its numbers becomes a
republished value **by accident**, with nobody having decided to republish
anything.

An F2 record SHALL anchor on the **publisher's own changelog or announcement**
for the rescoring, cited and quoted verbatim, under the ordinary anchor rules.
Where the publisher's page states the act but not its shape, the record SHALL
say so and rest its shape on its own measurement of what it observed — an
anchor is evidence of the act, not a substitute for measuring the effect.

This requirement governs an F2 record's copy. It does not license an index
value anywhere else, and it does not clear anyone's republication terms; index
values render only where a registry index exists and its rights are recorded as
cleared.

#### Scenario: A rescoring is told without a single score

- **WHEN** a publisher rebases its index and the note reports the publisher,
  the index and version, the date, that scores moved down and none up, and that
  the count of scored rows fell from one number to another
- **THEN** the record is within the permitted list, its anchor is the
  publisher's own announcement quoted verbatim, and it publishes

#### Scenario: A median is a value

- **WHEN** an F2 draft states the median ratio by which the rescored index fell
- **THEN** review rejects it as `spec-violation` naming the forbidden list —
  a ratio derived from republished numbers is a value however it is aggregated,
  and it belongs in the review record instead

#### Scenario: A leaderboard position is a rank

- **WHEN** an F2 draft names which model took the lead and which it displaced
  by citing their positions on the published index
- **THEN** review rejects it as `spec-violation` — a rank is on the forbidden
  list, and the lead change is reported as the publisher's act, attributed and
  dated, without the table it came from
