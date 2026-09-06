# pulse — delta for let-the-queue-see-a-judgment

Two requirements modified and one added. The queue stays derived and stays
incapable of accumulating; nothing here files anything into it, and every item
this change adds retires by recomputation.

Two judgments the engine already has in front of it are invisible to the queue,
in opposite directions. A review verdict that has stopped applying to the file it
approved fails the launch gate and cannot become work — so the only route to
green is a person writing a directive by hand (`addictedtoai-ccky`). A declared
corroboration that two people have already adjudicated cannot be marked settled —
so the mechanism is safe only on pairs that agree, which is the opposite of the
pairs it was built for, and no entry declares one (`addictedtoai-cct`).

Both are the same shape: the queue can see the world and the corpus, and cannot
see a judgment about either. Neither is fixed by letting the queue remember
anything — the fix in both directions is a committed record the recomputation
reads, which is the shape `A carried finding is queue state, and its file is the
state` and `A withdrawn feed row is recorded once and retires when the site
answers it` already established here.

## ADDED Requirements

### Requirement: A review that no longer describes its file is work the queue can see

`lib/reviews.mjs` resolves every piece of content to the review record that
approved it and reports one of four states. `mismatched` — a record binds,
carries a hash for that path, and the file's reviewed surface now hashes to
something else — means a piece that was approved has since been edited outside
the review gate. It fails the launch minimums. Nothing in `pulse/lib/` reads
review state at all, so no queue item can exist for it, no Desk job can select
one, and the gate has no mechanical route back to green.

- The Pulse SHALL derive one queue item for each piece whose review state is
  `mismatched`, reading that state from the **single** piece-to-record join
  `lib/reviews.mjs` exposes. It SHALL NOT compute a second resolution of pieces
  to records and SHALL NOT compute a second reviewed hash: one join is a
  standing invariant here, and a second one would disagree with the launch gate
  on the exact condition both are measuring.
- The item SHALL propose a `verify` job — a type already on the closed list of
  what the queue may produce — and SHALL name the piece, the record that binds
  it, and that record's date. The work is re-establishing that an approved
  surface still says what was approved, which is a check against a record rather
  than an authoring pass; typing it as `entry` would put it in the authoring
  budget category and shed it with authoring, on a condition that blocks every
  publish.
- The item SHALL rank above the corroboration disagreement and below every
  finding that reports a dead or unreachable resource. Published editorial that
  is outside the review gate is worse than a citation pointing at the wrong page
  and less urgent than a resource that is gone.
- The item SHALL retire by recomputation alone: a newer record whose recorded
  hash equals the file's current reviewed hash removes it at the next run, with
  no close or archive action by anyone and no durable record of its own. This is
  the property that distinguishes it from a withdrawn feed row — that condition
  is permanent and needs a record of the answer, this one is repairable by the
  job that takes it, and inventing a store for it would create exactly the
  un-retirable high-rank item this spec twice says not to create.
- The states `unbound` and `missing` SHALL NOT produce this item, and the `no`
  is written rather than left as an omission. `unbound` means a record that
  predates byte-binding: it fails nothing, it is informative exactly as it was
  before, and turning every one of them into an item would flood the queue's cap
  with work nobody asked for. `missing` is the opposite finding — unreviewed
  rather than reviewed-then-changed — and has its own gate; a producer for it is
  a separate decision and is not taken here.
- Nothing in this requirement SHALL invoke a model or edit a piece of content.
  Comparing a recorded hash to a computed one is arithmetic, and which of the
  two is right is the job's question, not the engine's.

#### Scenario: An approval that stopped applying becomes selectable work

- **WHEN** a piece carrying a bound review record is edited so its reviewed
  surface hashes differently, and the Pulse recomputes the queue
- **THEN** the queue holds one `verify` item naming the piece and the record,
  ranked above the corroboration disagreement and below the dead-resource
  findings

#### Scenario: A fresh approval retires it

- **WHEN** a job re-reviews that piece and merges a record whose recorded hash
  equals the file's current reviewed hash
- **THEN** the next run's queue no longer holds the item, with no close or
  archive action by anyone and nothing recording that it was done

#### Scenario: Unbound records produce nothing

- **WHEN** the corpus holds many review records written before byte-binding
  existed, none of which carries a hash for its piece
- **THEN** the queue holds no item for any of them, and the run reports the
  unbound count exactly as it did before

#### Scenario: The queue and the launch gate cannot disagree

- **WHEN** the launch minimums report a piece as `mismatched`
- **THEN** the derived queue holds an item for that same piece, because both
  read the same join and the same hash

## MODIFIED Requirements

### Requirement: The work queue is derived, never accumulated

The Pulse SHALL recompute the loop's work queue from current state on every
run: overdue facts, overdue tutorials, failed verifications, broken links,
want-demand eligible mints, suspect sources, refusing sources, vanished
feed rows, pieces whose recorded review no longer matches the file, material
changes on price/licence/status fields from the
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

### Requirement: Declared corroborations are compared every run, and disagreement becomes work

The Pulse treats a source as truth by construction: it fetches, hashes, diffs,
and never adjudicates. That is right, and it is why nothing noticed when two
sources disagreed and the feed was the wrong one. Comparing a feed-bound value
against a cited value for the same quantity on the same entry is arithmetic, not
judgment, and it costs nothing on top of a run that already resolves both.

- Every Pulse run SHALL compare each pair declared by `corroborates` (see
  `wiki`), resolving the feed-bound side from the latest snapshot through the
  entry's declared row id and the fact's field path, and the cited side from the
  fact's written value.
- Where either side does not resolve — no snapshot yet, a vanished declared row,
  a field path absent from the row — the Pulse SHALL make no comparison and
  SHALL produce no finding. Absence is not disagreement; the vanished-row case
  already has its own rendering and its own repair finding, and reporting it
  twice under two names would make both less legible.
- Two resolved values SHALL be compared by: trimming, collapsing internal
  whitespace, and case-folding both; then extracting from each the first numeric
  magnitude with its optional currency symbol and optional `K`/`M`/`B`/`T`
  suffix. When both sides yield a magnitude they agree exactly when the
  magnitudes are equal; otherwise they agree exactly when the normalised strings
  are equal. There is no tolerance: a tolerance is a policy nobody has set, and
  the observed case (`284B` against `304B`) needs none.
- A disagreement SHALL enter the derived work queue as an item proposing a
  `verify` job, naming the entry, both fields, both resolved values, and both
  sources — the feed's registry id for one side and the cited `source_url` for
  the other, so the job begins with the two things it has to compare in front of
  it.
- The Pulse SHALL NOT edit either fact, mark either source authoritative, or
  fail the build on a disagreement. It reports that two sources disagree; which
  one is right is judgment, and judgment is a job.
- The item SHALL leave the queue when the values agree again or the
  `corroborates` declaration is removed, with no close or archive action by
  anyone — it is derived state like every other queue item and SHALL NOT
  accumulate.
- **A disagreement MAY also be adjudicated, and an adjudication is a committed
  record.** It SHALL live under the data root, one file per adjudicated pair,
  and SHALL carry: the entry, both field names, the local date, the resolution in
  the adjudicator's own words, and **both resolved values as they stood when the
  adjudication was made**. A resolution with no pinned values is not an
  adjudication of anything, because nothing later can tell whether the
  disagreement it settled is the disagreement standing today.
- The Pulse SHALL suppress the queue item for a declared pair **exactly when** an
  adjudication record names that pair and both sides resolve today to the values
  that record pinned. Suppression is by equality with the pinned values and by
  nothing else — not by the record's existence, not by its date, and not by a
  tolerance.
- **If either resolved value differs from its pinned value, the Pulse SHALL
  produce the item again**, and the item SHALL name the adjudication it
  supersedes. A moved value is a new disagreement, not the acknowledged one, and
  the earlier resolution is context for the job rather than a reason not to run
  it.
- The Pulse SHALL NOT write, edit or delete an adjudication record. It still
  never adjudicates: the record is a fixing job's own diff, made under the review
  gate like any other content this repository publishes, and an engine that could
  write one could silence a disagreement it was built to report.
- **An adjudicated pair SHALL remain visible in the run's computed corroboration
  output, marked adjudicated, with both pinned values and both current ones.**
  Suppression is of the work item, never of the finding: a disagreement that
  disappears from the data the moment somebody explains it cannot be audited, and
  the explanation is the thing most worth auditing.

#### Scenario: Two sources disagree and a verify job is proposed

- **WHEN** an entry's feed-bound `parameters` resolves to `284B total` and its
  cited `repository_tensor_total` declaring `corroborates: parameters` says `304B params`
- **THEN** the next Pulse run's queue carries a `verify` item naming the entry,
  both fields, both values and both sources, and neither fact is changed

#### Scenario: The Pulse does not pick a winner

- **WHEN** a declared pair disagrees
- **THEN** the feed-bound fact still renders its source's value verbatim, the
  cited fact still renders its own, and the build succeeds

#### Scenario: A vanished row is not a disagreement

- **WHEN** a declared row id is absent from the latest snapshot, so the
  feed-bound side of a declared pair does not resolve
- **THEN** no corroboration finding is produced, and the existing vanished-row
  rendering and repair finding are what report it

#### Scenario: Agreement empties the item

- **WHEN** the source is corrected so both sides resolve to the same magnitude
- **THEN** the next run's queue no longer contains the corroboration item

#### Scenario: An adjudicated disagreement stops minting work

- **WHEN** a declared pair disagrees, an adjudication record names it and pins
  both values, and both sides resolve today to exactly those values
- **THEN** the queue carries no item for that pair, and the run's corroboration
  output still lists it, marked adjudicated

#### Scenario: A moved value revives it

- **WHEN** either side of an adjudicated pair resolves to a value the record did
  not pin
- **THEN** the queue carries the item again, naming the adjudication it
  supersedes, and no run has edited or deleted that record

#### Scenario: The engine writes no adjudications

- **WHEN** a disagreement stands for any length of time with no record naming it
- **THEN** the Pulse writes nothing, deletes nothing, and keeps producing the
  item — a settled disagreement is settled by a reviewed job, not by waiting
