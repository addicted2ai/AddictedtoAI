# pulse — delta for separate-a-claim-from-a-fact

Three requirements added. Nothing here changes the fetch/snapshot/hash/diff
cycle, the append-only nature of `data/changes.jsonl`, the zero-model property,
the stop-file behaviour, or the publish step. `data/derived/` stays a pure
function of state, and the new derived file is held to the same byte-identity
property as every other file under it.

The order is `loops/ui-loop/graph/knowledge/DESK-ORDER-001.md` §4; the mechanism
is `loops/ui-loop/graph/knowledge/frontier-plan.md` §2.3 and §6; the reason each
clause exists is `loops/ui-loop/graph/knowledge/SPEC-REVIEW-GUIDE.md` §4 rows 53
and 54.

## ADDED Requirements

### Requirement: A change line's kind comes from a closed list with one home

`data/changes.jsonl` is the append-only history everything downstream reads: the
home changed feed, `/catalog/changed`, the RSS feed, the sitemap's
`lastModified` join, a blog note's `covers:` anchor, the scout's assembled
context, and the `interpret` job's work source. What a line *is* travels in its
`kind`, and that field is currently unchecked in both directions.

Measured on 2026-09-05: the file holds **182 lines** in five kinds — `arrival`
77, `release` 60, `field_change` 23, `retirement` 14, `annotation` 8. Those five
are the kinds the system means to have. Nothing declares them. They are string
literals at their emission sites and every consumer tests equality against a
literal of its own, so a misspelled kind would be written, committed, rendered
through the changed feed's catch-all, and caught by nothing.

Worse, the tree already carries a constant that *looks* like the list —
commented as the material change kinds "in the order specs/pulse names them" —
which is imported nowhere, and three of whose five values are not kinds at all
but material **field** names carried on a line's `field`, appearing as a `kind`
on zero of the 182 lines. A list that reads as authoritative, is consulted by
nobody, and disagrees with the data is worse than no list: the obvious way to
add a new kind is to add it there, which changes nothing anywhere.

- The kinds a change line may carry SHALL be a **closed list declared in exactly
  one place** in the source tree, and every producer and consumer SHALL read that
  declaration rather than restating a literal.
- **`lead-change` SHALL be a member of that list**, alongside `arrival`,
  `release`, `field_change`, `retirement` and `annotation`.
- The Pulse SHALL **refuse to append** a line whose kind is not a member, naming
  the kind and the caller. This is the point the mistake is made, and a refusal
  there costs a failing test rather than a corrupt history.
- The build SHALL **report** the number of lines on disk carrying an unrecognised
  kind, in its summary, and SHALL NOT fail on one. This is deliberately not
  symmetric with the write side: the file is append-only history, a corrupt line
  already committed cannot be removed, and the reader's existing stance is that a
  malformed line is the Pulse's problem to report rather than a reason to stop
  rendering the others. A build that failed here would let one bad historical
  line take the whole site down.
- Any constant that duplicates the list without being read SHALL be removed
  rather than updated, so there is one home and not two.
- `lead-change` lines SHALL NOT produce `interpret` work. The `interpret` source
  is material field changes, and a lead change is an event the site states
  outright rather than a movement needing interpretation. This SHALL be asserted
  by a test rather than left true by the current filter's incidental shape.

#### Scenario: An unknown kind cannot be written

- **WHEN** the Pulse is asked to append a line whose kind is not in the declared
  list
- **THEN** it refuses, naming the kind, and appends nothing

#### Scenario: An unknown kind already on disk is reported, not fatal

- **WHEN** the build reads a committed line carrying a kind the list does not
  contain
- **THEN** the summary reports how many such lines exist and the build completes,
  and the rest of the feed renders

#### Scenario: A lead change queues no interpretation

- **WHEN** a `lead-change` line is appended within the trailing interpretation
  window
- **THEN** the derived queue contains no `interpret` item for it

### Requirement: A lead change and a rescoring are different events, and the difference is computed

A published index's leader can change because something new arrived, or because
the publisher re-scored the model that was already leading. Measured across the
committed snapshots: between 2026-09-03 and 2026-09-04 exactly one row's indices
moved and every one moved **down** — `qwen/qwen3.8-max`, 58.1 → 53.4
intelligence, 71.8 → 68.9 coding, 58.4 → 49.9 agentic. A leader can therefore
lose the lead without anything shipping, and a history line saying "X overtook Y"
when Y was marked down is false about an event that did not happen.

Both finalist builds shipped a lead-change element that was an empty state on
day one, because no such line has ever been written.

- A **`lead-change`** line SHALL record that the leader of a declared metric
  changed between two consecutive snapshots. It SHALL carry the metric, the
  snapshot date the change was observed in, the outgoing and incoming rows, the
  publisher, and the archived source excerpt every material change entry already
  carries.
- It SHALL carry a **`cause`**, drawn from a closed set — `arrival` (the new
  leader was absent from the previous snapshot, or present and unscored),
  `rescored` (both were present and a value moved), `withdrawn` (the previous
  leader left the snapshot). **`cause` SHALL be computed from the two snapshots
  and never judged.** A model invocation on this path would make the history a
  model's opinion about what happened.
- A change in the leader's **value** with no change in the leader's **identity**
  is a different event and SHALL be recorded as such, distinguishable by kind or
  by a declared field. It SHALL NOT be recorded as a lead change.
- The line's **key SHALL be a pure function of state** — the two snapshot row
  hashes, the metric, and the kind — so that a re-run over an unchanged pair
  recomputes the identical candidate and appends nothing. A clock rollover with
  no fetch SHALL append nothing.
- The module producing these lines SHALL never edit or delete a line. A
  correction is a new line keyed to the corrected one, which is the treatment the
  `annotation` kind already receives.
- Only the **leader** SHALL be recorded. Membership churn in a top-N table is
  noise against the question the history answers — *when did the lead change* —
  and belongs in the derived file, which is recomputed anyway.
- **`data/derived/frontier.json` SHALL be derived on every run** as a pure
  function of the latest snapshot and the registry: leaders per declared metric,
  the ranked eligible rows, and the counts behind them, each row joined to its
  entry by the **declared** feed row id and never by name. It SHALL carry the
  snapshot's own date and SHALL read no clock, so a re-run with no world change
  produces a byte-identical file — the property every file under `data/derived/`
  already holds. Ties SHALL all be leaders and the surface SHALL say so; no
  tie-break invents an order.
- **With zero declared metrics the file SHALL still be written**, carrying an
  empty `metrics` collection — no leaders, no ranked rows — and the snapshot's
  own date. It SHALL NOT be absent and SHALL NOT be stood in for by a placeholder
  anywhere downstream. This is the day-one state, and it is the state both
  finalist builds were in when each hard-wired an empty element instead
  (`implementer-ledger.md` row 6: a cell renderer that ignored both its arguments
  and returned the same string). A surface SHALL therefore be able to **look the
  metric up and then collapse**, so that declaring one cleared metric populates it
  with no edit to any renderer.
- Rows that are not distinct listed models — service variants of a base row,
  router pseudo-rows, alias rows redirecting elsewhere — SHALL be excluded by
  **declared** criteria in the registry rather than by a rule compiled into the
  code, so the exclusions are visible and reviewable. They are patterns over ids
  and the registry SHALL record that, rather than presenting them as facts.
- The history SHALL be **seeded once** from the snapshots already committed to
  this repository, as dated, sourced, `seeded: true` entries under the existing
  seeding rule, so the surface is not empty on the day it ships. Seeding SHALL be
  idempotent and SHALL never overwrite an observed entry. Its limits SHALL be
  stated on the surface rather than implied: the record begins when observation
  began, and a baseline line says *observation began here*, not *this model
  became the leader here*. **Recording a value in a history line is not rendering
  it**: the rights gate in the next requirement binds the surface, not the
  record, and `specs/pulse` already requires every material change entry to embed
  its archived source excerpt.

#### Scenario: A rescoring is not an overtaking

- **WHEN** the previous leader's index value falls between two snapshots and
  another row is now highest
- **THEN** the appended line carries `cause: rescored`, and nothing in the data
  says the new leader improved

#### Scenario: An arrival is named as one

- **WHEN** a row absent from the previous snapshot appears carrying the highest
  value for a declared metric
- **THEN** the appended line carries `cause: arrival`

#### Scenario: A re-run appends nothing

- **WHEN** the Pulse runs twice over an unchanged pair of snapshots
- **THEN** the second run appends no line and rewrites `frontier.json`
  byte-identically

#### Scenario: A deleted line comes back

- **WHEN** an appended `lead-change` line is removed from the file by hand and
  the Pulse runs again over the same snapshot pair
- **THEN** the line is appended again, because the key is a function of state —
  deletion is not a retirement path

#### Scenario: The first day is not empty

- **WHEN** the surface renders for the first time after seeding
- **THEN** it shows the lead changes recoverable from the committed snapshots,
  each marked as seeded, and states that the record begins where observation
  began

### Requirement: An index is registered with its publisher and its rights, and the empty state is computed

The site does not run benchmarks. Every index it could show is somebody else's
aggregate, reaching the site through a republisher, read on one day — and
whether it may be reprinted at all is a question nobody has answered.

Measured from the source registry on 2026-09-05: both registered sources carry a
`robots` block with a checked date and a `verification` block with a fetch
result. **Neither carries any field about republication.** The registry records
*may we read this*; nothing records *may we reprint what it says*, and those are
different permissions. Meanwhile the three Artificial Analysis index paths are
declared in one source's `yields` and 29 live model pages already bind them as
facts, which is the exposure `addictedtoai-ego8` was filed for;
`addictedtoai-c563` is its Design Arena sibling.

- A published index SHALL be **declared as a metric** in the source registry
  before any surface reads it, recording at least: the field name the corpus uses
  for it, the path into the source row, the **publisher**, the publisher's URL,
  the party republishing it if the site does not read it from the publisher
  directly, the direction that counts as leading, and a display label.
- Each declared metric SHALL carry a **republication decision**: the URL of the
  terms that were read, the local date they were read, the outcome, and a
  verbatim excerpt of the terms the outcome rests on. An unanswered question
  SHALL be recorded as unanswered — a missing field and a cleared right SHALL NOT
  look the same.
- **No index value SHALL render on any surface until its metric is registered and
  its republication decision records the right as cleared.** A metric that is
  registered but not cleared is usable for ordering, for computing a leader, and
  for stating *that* a lead changed; it is not printable.
- **The absence SHALL be computed, never hard-wired.** A surface that would show
  an index value SHALL look up the registry, find no cleared metric, and collapse
  — so that registering a cleared metric populates it with no further edit. A
  renderer whose empty state is a constant is a picture of an empty state: it was
  shipped once, with a cell renderer that ignored both its arguments and returned
  the same string, and no data could ever have filled it. A test SHALL populate a
  cleared metric in a fixture and assert the same renderer produces the value —
  an assertion that a renderer *is* empty proves nothing about whether it can
  stop being empty.
- Reading whether a row **carries** an index is not reprinting what the index
  says, and this requirement SHALL NOT be read to restrict the former. A
  description of a publisher's own act — that it rebased an index, on a date, in
  a direction — is likewise not a value, and is permitted with no value, ratio,
  rank or per-model score in its copy. **This is the same rule as
  `flag-what-moved-the-frontier`'s `blog` requirement "An F2 record carries the
  publisher's act, never the publisher's numbers", stated here for a history line
  as it is stated there for a post's copy** — both are the K44 amendment
  resolving F2 against K24, and the cross-reference is written down so an edit to
  either is visibly an edit to both rather than the start of two copies drifting.
- A surface displaying a registered value SHALL name the publisher, name the
  republisher where there is one, and carry the snapshot date the value was read
  in. The strongest claim available is *the publisher's page says this, as
  republished by that party, in the snapshot of that date*, and no surface SHALL
  imply a measurement date the data does not carry.

#### Scenario: An unregistered index does not render

- **WHEN** a source row carries a benchmark index that no registry metric
  declares
- **THEN** no surface renders its value, and the row still appears wherever rows
  appear

#### Scenario: Registered but not cleared is not printable

- **WHEN** a metric is registered with its republication decision recorded as
  unresolved
- **THEN** no value renders, and the surface may still state that a lead changed
  on that metric, naming the publisher and the date

#### Scenario: The empty state is a lookup that came back empty

- **WHEN** a fixture registers a metric with rights recorded as cleared and the
  same renderer runs
- **THEN** it renders the value — proving the empty state was the result of the
  lookup rather than a constant in the template

#### Scenario: An unanswered question does not read as a cleared one

- **WHEN** a metric is declared with no republication decision at all
- **THEN** the build treats it as unregistered for rendering purposes and reports
  it, rather than defaulting to permitted
