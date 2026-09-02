# pulse — delta for make-the-blog-worth-sending

The Pulse gains one derivation: a daily scout item. It gains no judgment —
it never scores an event, never invokes a model, and never decides what is
worth writing. The trigger is deterministic; the judgment it triggers lives
in the Desk (`loop`, "The scout looks outward"). The previous draft of this
change also derived per-event post candidates mechanically; that mechanism
is withdrawn — its grouping key was undefined for two thirds of the feed,
its field list had been emptied by a registry flag, and its queue rank sat
in truncation range — and the scout, which reads the same feed with
judgment attached, replaces it (this change's `design.md`, D4).

## ADDED Requirements

### Requirement: Once per day, the Pulse queues the scout

- On each run, the Pulse SHALL derive a **scout item** into the work queue
  exactly when `data/ledger.jsonl` records no `scout` job started on the
  current local date — at most one item, computed from the ledger and the
  clock alone, so the derivation stays a pure function of current state
  and a re-run on the same day with a scout already recorded derives
  nothing.
- The item SHALL carry mechanically assembled context: the change feed's
  event lines from the trailing 7 days that no published post's `covers:`
  declarations include — a deterministic join, not a judgment, and an
  input to the scout rather than a bound on it (the scout's charge is the
  world beyond this repository; see `loop`).
- The scout item SHALL rank below confirmed-breakage repairs and
  corroboration disagreements and above routine timer-driven
  re-verifications: the site's claim to be true outranks discovery, and
  discovery outranks re-checking things that were true last week. The
  upkeep floor in `loop` keeps this ordering from starving upkeep — rank
  decides within a run; the floor guarantees upkeep's share across runs.

#### Scenario: One scout a day, mechanically

- **WHEN** the Pulse runs twice on one local date and the ledger records a
  `scout` job started that day before the second run
- **THEN** the second run derives no scout item, and the next local date's
  first run derives one

#### Scenario: The context is a join, not a judgment

- **WHEN** the trailing 7 days hold four event lines and a published post's
  `covers:` names one of them
- **THEN** the scout item carries the other three, with no score, no
  ordering beyond the feed's own, and no model invoked

#### Scenario: The Pulse still never judges

- **WHEN** the scout item is derived on any state
- **THEN** no model runs, and nothing in the item says which events are
  worth writing about — that question belongs to the scout job it triggers

## MODIFIED Requirements

### Requirement: The work queue is derived, never accumulated

The Pulse SHALL recompute the loop's work queue from current state on every
run: overdue facts, overdue tutorials, failed verifications, broken links,
want-demand eligible mints, suspect sources, refusing sources, vanished
feed rows, material changes on price/licence/status fields from the
trailing 14 days that lack an interpretation annotation (the source
`interpret` jobs draw from — see `loop`), and the daily scout item (see the
scout requirement). The queue is a ranked snapshot (a generated file), not
a ledger: nothing is ever "filed" into it, it has no history, and it cannot
backlog — an item leaves the queue the moment the underlying state is
fixed, and the queue's size is bounded by the size of the site, not by
time passing. Discovered work that needs human judgment or does not map to
site state (a bug, an idea, a follow-up) goes to beads (`bd`) instead,
filed by whoever discovers it — the two never mirror each other.

#### Scenario: Fixing the state empties the queue

- **WHEN** an overdue fact is re-verified
- **THEN** the next Pulse run's queue no longer contains it, with no
  close/archive action by anyone

#### Scenario: The queue cannot grow monotonically

- **WHEN** the Pulse runs on a site whose state has not changed
- **THEN** the queue is identical to the previous run's — recomputation
  produces no accumulation
