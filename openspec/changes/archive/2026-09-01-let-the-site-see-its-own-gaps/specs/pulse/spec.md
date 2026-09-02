# pulse — delta for let-the-site-see-its-own-gaps

Every normative sentence below names, in `tasks.md`, the task that implements
it and the check that measures it.

## ADDED Requirements

### Requirement: A surface's unmet declared coverage is queue input

Every other queue reason answers *the world changed* or *a timer elapsed*.
Neither can express that this site has declared an intention it has not met, so
nothing in the machinery has ever looked inward at the corpus's own stated
shape. Where a surface has a **curriculum of record** — a written enumeration of
the pages it intends to publish — the Pulse SHALL derive one queue item for each
enumerated page that `content/` does not publish.

- The item SHALL propose an `education` job and SHALL carry the reason
  `curriculum-gap`, ranked below every reason describing something broken or
  overdue and below `want-eligible-mint`. Nothing is wrong on any page because a
  page the site intends to write does not exist yet.
- The derivation SHALL be a set difference between two committed files and
  SHALL NOT score, rank, or otherwise judge either side. It is the same
  arithmetic a reader could do with two directory listings, and its result is
  falsifiable by doing so.
- The item SHALL retire by recomputation alone, like every other queue item:
  publishing the page removes it at the next run, with no close or archive
  action by anyone.
- The Pulse SHALL read the curriculum tolerantly. A curriculum that is absent,
  unreadable, or carries no catalog section SHALL yield no items and SHALL NOT
  halt the run — the engine must keep the data layer true on a day when the
  build would fail.

#### Scenario: A declared page nobody has written becomes work

- **WHEN** the curriculum enumerates a page whose slug has no file in
  `content/learn/`
- **THEN** the next queue carries one `education` item with reason
  `curriculum-gap` naming that slug

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

The decision of record is that `tutorial`, `post`, `prune` and `machinery` are
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
- `tutorial` is excluded for a different and weaker reason: the declared-coverage
  shape above would fit it, but no curriculum of record exists for that surface.
  Writing one is an editorial decision about what the site should teach by
  doing, not a machinery decision.

#### Scenario: A queue item of an undeclared type fails the suite

- **WHEN** a queue producer emits an item whose type is not on the declared
  list
- **THEN** the test suite fails, naming the type and the item's reason

#### Scenario: The list states its own exclusions

- **WHEN** a reader asks why the queue cannot produce a `prune` job
- **THEN** the answer is in the declared list beside the decision, not
  inferred from the absence of a producer
