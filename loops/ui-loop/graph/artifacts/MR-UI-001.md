```yaml
id: MR-UI-001
version: 1
schema: loops/ui-loop/graph/schemas.md#measurement-request
depends_on: [BRIEF-UI-001.v1, CP-UI-001-1.v1, CP-UI-001-2.v1]
status: retired  # keeper 2026-09-05, check-in decision 2: "Skip this step" (K36)
closed_by: null
```

**Question.** Keeper find-task test, main vs finalist (BRIEF success criterion; K9).

**Instrument.** Five find-tasks (a model by name, a model's context window, the newest entry, a tutorial by topic, what changed this week), each timed with success/fail, run on the main build and on each finalist build; same tasks, same order, one sitting. Instrument: keeper, stopwatch, two preview builds side by side.

**Acceptance.** No task slower or failed on the finalist versus main. Recorded raw as CAL-UI-001 (task, build, success, seconds, notes).

Opened 2026-09-05 with the round-1 finalist pick (K17). An open MR blocks the stop condition by
design (`score.mjs` no_open_measurement_request); it is scheduled once a finalist build has captures.
