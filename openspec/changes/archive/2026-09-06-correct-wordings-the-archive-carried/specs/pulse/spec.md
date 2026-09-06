# pulse — delta for correct-wordings-the-archive-carried

Wording only. This delta changes no requirement, no gate, no field and no
behaviour: the MODIFIED block below is the live requirement copied whole, with
one sentence corrected. It exists because the sentence sat INSIDE a requirement
block when `separate-a-claim-from-a-fact` was archived on 2026-09-06, so the archive merged it into
this constitution, and a live spec is only editable through a change.

The finding, the re-measurement and why each correction is wording rather than
substance are in this change's `proposal.md`.

**The correction:** "the state both finalist builds were in when each
hard-wired an empty element instead" becomes "the state both finalist builds
were in on day one, and the state in which one of them hard-wired an empty
element instead". Re-measured: `implementer-ledger.md` holds ten rows and
exactly one `fake-empty-state` row — row 6 — and it names only
`CP-UI-001-1 Dated Ledger`. No second row records the Players Board build
hard-wiring an empty element, and the directive itself kept the two apart. The
day-one state was shared; the hard-wiring was one build's. (The genuine
two-builder recurrence in this corpus is the founding-date mislabel, ledger rows
2 and 4, which this same requirement's neighbours cite correctly.)

## MODIFIED Requirements

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
  anywhere downstream. This is the state both finalist builds were in on
  day one, and the state in which one of them hard-wired an empty element instead
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
