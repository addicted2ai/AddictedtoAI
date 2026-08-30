# blog — delta for make-the-blog-worth-sending

Every normative sentence below names, in `tasks.md` §6, the task that
implements it and the check that measures it. A SHALL with no task is
invisible twice over: a literal implementer never builds it and the
integrated verification passes without it.

## ADDED Requirements

### Requirement: A post takes one of two forms, and each form has its own finish line

Every post SHALL be one of two forms, distinguished by its evidence: a
**news note** — a post anchored to a dated event (see the anchor
requirement) — or a **synthesis** — an unanchored post assembling recorded,
dated evidence into a shape no single event shows.

- A news note SHALL lead with what happened and who it lands on, and SHALL
  reference the wiki for identity and background rather than restating it.
  A note has **no minimum length**: it is finished when an affected reader
  knows what happened, what changes for them, and where the primary
  evidence is. Review SHALL NOT treat brevity alone as a defect in a note.
- A synthesis SHALL state the method its shape was derived by — what was
  fetched, filtered, sorted or counted, concretely enough that a skeptical
  reader could reproduce the derivation — and SHALL rest on enumerable
  dated evidence, never on impressions.
- Every post SHALL pass the would-send test (see `editorial`): for a post,
  passing the would-cite test alone does not publish. This is the genre
  control: a survey with a finding someone would forward passes; a survey
  with no such finding does not, however accurate.
- Where earlier published posts share the post's subject (mention overlap
  with existing posts), the post SHALL link at least the most recent of
  them, and the assembled brief SHALL list them — the blog remembers
  itself, so threads can develop.

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

#### Scenario: The blog remembers its own thread

- **WHEN** a note covers the shutdown of a model whose deprecation an
  earlier post covered
- **THEN** the brief lists the earlier post and the published note links it

### Requirement: A news note is anchored in evidence its author cannot create

A news note SHALL declare its anchor in front matter, as one or both of:

- `covers:` — one or more change-feed references (the `key` and `date` of
  lines in `data/changes.jsonl`), for events the Pulse observed; or
- `anchor:` — an external anchor: a primary-source URL and the event's
  date, for events outside the Pulse's aperture.

The build SHALL fail a post whose `covers:` reference resolves to no line
in `data/changes.jsonl`, naming the post file and the unresolved reference.
The build SHALL fail a post whose newest declared anchor date (feed or
external) precedes the post's own `date` by more than 7 days — a "news"
note about a stale event is mislabeled, not early. For an external anchor,
review SHALL fetch the source and confirm it documents both the event and
its date; an anchor that does not hold is `false-or-unsupported-claim`.

A post declaring no anchor is a synthesis and is governed by the unanchored
lane of the rate-control requirement. The asymmetry is the point: the one
lane with no count ceiling admits only posts carrying evidence a model
cannot manufacture — a feed line only the deterministic, model-free Pulse
writes, or a dated URL review is required to fetch.

#### Scenario: A bogus feed reference fails the build

- **WHEN** a post declares `covers:` naming a key and date matching no line
  in `data/changes.jsonl`
- **THEN** the build fails, naming the post file and the reference, before
  any page renders

#### Scenario: A stale anchor fails the build

- **WHEN** a post dated 2026-09-20 declares only an anchor dated 2026-09-01
- **THEN** the build fails naming the post, the anchor date, and the 7-day
  window

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

## MODIFIED Requirements

### Requirement: Publishing is quality-gated, never quota-driven

There SHALL be no minimum posting cadence: zero posts in a week is a
normal, healthy outcome. The rate control classes posts by their evidence,
not their count:

- An **anchored** post (a news note whose anchor passes the anchor
  requirement's checks) SHALL be subject to no count ceiling. Its rate is
  limited by the world: one candidate group can be covered by at most one
  note before it leaves the queue (the coverage join in `pulse`),
  candidates expire after 7 days, and post work remains inside the
  untouched model-minute budget and capacity-shedding rules in `loop` —
  "no ceiling" bounds counts by events and minutes, never by nothing.
- An **unanchored** post SHALL be subject to a ceiling of 1 published
  unanchored post in any rolling 7 days, enforced at a named point: the
  loop's selector SHALL refuse an unanchored `post` job whenever a
  published unanchored post carries a date within the trailing 7 days, and
  the build SHALL warn (not fail, so historical rebuilds never break) when
  the published set already exceeds this ceiling.
- For selection, a `post` candidate is in the anchored lane when its work
  source carries a declared anchor — a queue post candidate, or a proposal
  or directive naming one; all other `post` candidates are unanchored. The
  published set is classed by front matter alone.

A post exists because something happened worth an enthusiast's time — the
editorial bar (see `editorial`) decides, not a schedule. The unanchored
ceiling is deliberately tighter than the 3-in-7 ceiling it replaces, and
the anchored lane deliberately has none: a capacity glut can manufacture
surveys at will, but it cannot manufacture events.

#### Scenario: A slow week publishes nothing

- **WHEN** a week passes in which nothing clears the editorial bar
- **THEN** no post is published and nothing anywhere treats that as a
  failure

#### Scenario: A busy week is covered, not throttled

- **WHEN** five distinct qualifying event groups occur within one week and
  each note clears review
- **THEN** all five anchored notes publish, and no count ceiling refuses
  any of them

#### Scenario: A second survey in one week waits

- **WHEN** an unanchored post published 3 days ago and an unanchored `post`
  proposal is ripe
- **THEN** the selector refuses it naming the unanchored-lane rule, and the
  proposal remains selectable after the window rolls
