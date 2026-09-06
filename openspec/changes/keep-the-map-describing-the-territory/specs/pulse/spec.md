# pulse — delta for keep-the-map-describing-the-territory

Two requirements modified, each in the narrowest way that carries the tutorial
surface's new map of record (`education-dynamic`) into the machinery that reads
maps.

**"A surface's unmet declared coverage is queue input."** The requirement was
written generically — *"Where a surface has a curriculum of record"* — and one
bullet was not: the item always proposes an `education` job, which is the job
type that writes the learn surface and not the one that writes a tutorial. That
bullet is generalised to the job type that writes the surface in question. A
second bullet is added, and it is not new policy: `education-dynamic` already
states that a new tutorial SHALL NOT be started while an existing tutorial
stands demoted for staleness with a live subject. Today that sentence has no
mechanism because nothing can start a new tutorial at all; the moment a producer
exists, the subordination has to be computed rather than hoped for. The set
difference itself, the no-scoring rule, retirement by recomputation and the
tolerant read are unchanged.

**"Which job types the queue may produce is a stated decision."** `tutorial`
moves from the exclusion list to the producible list. Its exclusion rested on
one stated condition — *"no curriculum of record exists for that surface"* — and
`education-dynamic` now requires one. `post`, `prune` and `machinery` stay
excluded on exactly the reasoning already recorded for them, which the new
tutorial map does not touch: "the corpus is due a post" and "the machinery is
deficient" are not enumerations of anything, so no map can ever make them a set
difference.

Measured 2026-09-06, and the reason the interlock is stated in semantic terms
rather than as a state name: `lib/tutorials.mjs` derives `archived` from the
subject entry's status and decides it before `demoted`, while
`pulse/lib/corpus.mjs` reads `archived` from the tutorial's own front matter, so
the Pulse's `demoted` today includes a dead-subject tutorial whose file does not
declare itself archived. Aligning those is implementation work, not a
requirement.

Serves `addictedtoai-kat1`.

## MODIFIED Requirements

### Requirement: A surface's unmet declared coverage is queue input

Every other queue reason answers *the world changed* or *a timer elapsed*.
Neither can express that this site has declared an intention it has not met, so
nothing in the machinery has ever looked inward at the corpus's own stated
shape. Where a surface has a **curriculum of record** — a written enumeration of
the pages it intends to publish — the Pulse SHALL derive one queue item for each
enumerated page that `content/` does not publish.

- The item SHALL propose the job type that writes the surface — `education` for
  the learn surface, `tutorial` for the tutorial surface — and SHALL carry the
  reason `curriculum-gap`, ranked below every reason describing something broken
  or overdue and below `want-eligible-mint`. Nothing is wrong on any page because
  a page the site intends to write does not exist yet. One reason and one rank
  serve every surface: a missing walkthrough and a missing explainer are the same
  event, and a second reason for it would need a second argument for the same
  position in the rank table.
- The derivation SHALL be a set difference between two committed files and
  SHALL NOT score, rank, or otherwise judge either side. It is the same
  arithmetic a reader could do with two directory listings, and its result is
  falsifiable by doing so.
- Where a surface's own specification subordinates new work to upkeep, the
  derivation SHALL compute that subordination rather than leave it to whatever
  selects next. For the tutorial surface, no `curriculum-gap` item SHALL be
  derived while any published tutorial stands demoted for staleness and its
  subject entry is not `retired` or `dead`: a walkthrough the map merely intends
  is not work while a published walkthrough is telling readers it has gone
  unverified. A demoted tutorial whose subject is dead SHALL NOT suppress
  anything — archival is that tutorial's correct end state, so its demotion is
  not upkeep waiting to be done.
- The item SHALL retire by recomputation alone, like every other queue item:
  publishing the page removes it at the next run, with no close or archive
  action by anyone.
- The Pulse SHALL read the curriculum tolerantly. A curriculum that is absent,
  unreadable, or carries no catalog section SHALL yield no items and SHALL NOT
  halt the run — the engine must keep the data layer true on a day when the
  build would fail. This holds for every surface's map independently: an
  unreadable map on one surface SHALL NOT suppress the items derived from
  another's.

#### Scenario: A declared page nobody has written becomes work

- **WHEN** the curriculum enumerates a page whose slug has no file in
  `content/learn/`
- **THEN** the next queue carries one `education` item with reason
  `curriculum-gap` naming that slug

#### Scenario: A declared tutorial nobody has written becomes work

- **WHEN** the tutorial map enumerates a walkthrough whose slug has no file in
  `content/tutorials/`, and no published tutorial stands demoted
- **THEN** the next queue carries one `tutorial` item with reason
  `curriculum-gap` naming that slug, at the same rank the learn surface's items
  carry

#### Scenario: A demoted tutorial suppresses the surface's growth

- **WHEN** the tutorial map enumerates three unwritten walkthroughs and one
  published tutorial stands demoted for staleness with a live subject
- **THEN** the queue carries no `curriculum-gap` item of type `tutorial`, and it
  still carries the `tutorial-demoted` item for the demoted one

#### Scenario: A dead subject does not suppress growth

- **WHEN** the only demoted tutorial's subject entry has status `dead`
- **THEN** the tutorial gap items are derived normally, because re-verifying that
  tutorial is not the upkeep the subordination protects

#### Scenario: Writing the page empties the item

- **WHEN** that page is published
- **THEN** the next Pulse run's queue no longer contains the item, with no
  close or archive action by anyone

#### Scenario: A full map produces no work

- **WHEN** every enumerated page is published
- **THEN** the queue carries no `curriculum-gap` item, and that is a complete
  and healthy run rather than a failure to find work

#### Scenario: A missing curriculum is not a halt

- **WHEN** the curriculum of record is absent from the tree the Pulse is
  running against
- **THEN** the run completes, the queue carries no `curriculum-gap` item, and
  nothing is reported as broken

#### Scenario: One unreadable map does not silence the other

- **WHEN** the tutorial map is absent and the learn curriculum is intact
- **THEN** the run completes, the learn surface's `curriculum-gap` items are
  derived as usual, no `tutorial` gap item is derived, and nothing is reported
  as broken

### Requirement: Which job types the queue may produce is a stated decision

The loop can run ten job types and the queue produces a strict subset. Which
types are missing has never been recorded as a decision, so an absent producer
is indistinguishable from an unbuilt one — capacity with no trigger and no
record of why.

The Pulse SHALL declare, as a closed list in the queue's own source, every job
type the derived queue may produce, together with the reason the remaining types
are not on it. Every item the queue computes SHALL carry a type from that list,
and a violation SHALL fail the test suite. Adding a producer for a type not on
the list SHALL require amending the list in the same change.

The decision of record is that `post`, `prune` and `machinery` are
**proposal- and maintainer-initiated by design**, not merely unbuilt:

- `prune` and `machinery` SHALL NOT become queue-producible while the only
  available trigger would be a model scoring the corpus or the codebase against
  a rubric. Removal is the one irreversible act here — a wrongly-fired `prune`
  404s a published URL, where every other queue item that fires wrongly merely
  wastes a job — and "the machinery is deficient" has no committed-state
  measurement at all. The channel that serves machinery work is evidence-driven
  and already exists: a reviewer naming a measured defect in its verdict record.
- `post` is excluded because a derived "a post is due" trigger is a cadence, and
  a cadence is what fills a blog with pieces nobody asked for.

`tutorial` SHALL be on the list. The condition its exclusion rested on was the
absence of a curriculum of record for that surface, and `education-dynamic`
requires one: a surface with a map is a surface whose unmet declarations are a
set difference between two committed files, which is the same falsifiable
derivation the learn surface already runs. The distinction that keeps the other
three off the list survives intact — a map can enumerate walkthroughs and pages,
and nothing can enumerate the posts a blog is due or the defects a codebase has.

#### Scenario: A queue item of an undeclared type fails the suite

- **WHEN** a queue producer emits an item whose type is not on the declared
  list
- **THEN** the test suite fails, naming the type and the item's reason

#### Scenario: The list states its own exclusions

- **WHEN** a reader asks why the queue cannot produce a `prune` job
- **THEN** the answer is in the declared list beside the decision, not
  inferred from the absence of a producer

#### Scenario: A surface that gains a map gains a producer

- **WHEN** a surface acquires a curriculum of record and a producer is written
  for it
- **THEN** its job type appears on the declared list in the same change as the
  producer, and the test that measures every emitted item against the list
  passes without being relaxed
