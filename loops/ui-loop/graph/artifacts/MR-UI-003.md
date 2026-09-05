```yaml
id: MR-UI-003
version: 1
schema: loops/ui-loop/graph/schemas.md#measurement-request
depends_on: [BRIEF-UI-001.v1, DR-CP-UI-001-1-1.v1]
status: retired  # keeper 2026-09-05, check-in decision 2: "Skip this step" (K36)
closed_by: null
```

**Question.** Does a time-proportional rail read as cadence or as ragged spacing? (DR-CP-UI-001-1-1; Dated Ledger.)

**Instrument.** Keeper views the home rail and /frontier spine on the CP-UI-001-1 build at 1440 light, then at 390 dark, without being told the spacing rule, and says what the vertical gaps mean. Instrument: keeper, two viewings, verbatim note.

**Acceptance.** Keeper names elapsed time / pace unprompted in at least one viewing. If not, the concept's core bet is unmeasurable at current history depth and the finding is recorded, not fixed.

Opened 2026-09-05 with the round-1 finalist pick (K17). An open MR blocks the stop condition by
design (`score.mjs` no_open_measurement_request); it is scheduled once a finalist build has captures.
