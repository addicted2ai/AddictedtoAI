```yaml
id: MR-UI-002
version: 1
schema: loops/ui-loop/graph/schemas.md#measurement-request
depends_on: [BRIEF-UI-001.v1, DR-CP-UI-001-2-1.v1]
status: retired  # keeper 2026-09-05, check-in decision 2: "Skip this step" (K36)
closed_by: null
```

**Question.** Does a hatched honest blank read as honesty or as breakage to a first-time reader? (DR-CP-UI-001-2-1, judge-system F-sys + red team FM4; Players Board.)

**Instrument.** Keeper opens /frontier on the CP-UI-001-2 build cold, phone width, dark theme, and says aloud within ten seconds what the hatched cells mean; then the same at 1440 light. Instrument: keeper, two viewings, verbatim note of the first interpretation.

**Acceptance.** First interpretation names missing/unpublished data (not a rendering fault) in both viewings. Anything else fails and routes to the implementer as a label problem.

Opened 2026-09-05 with the round-1 finalist pick (K17). An open MR blocks the stop condition by
design (`score.mjs` no_open_measurement_request); it is scheduled once a finalist build has captures.
