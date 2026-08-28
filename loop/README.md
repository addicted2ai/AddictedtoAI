# loop/

The Desk: the agentic loop that produces and maintains content
(`specs/loop`, design D2).

- `node loop/run.mjs [--runner <id>]` — resume the oldest resumable `job/*`
  branch, else select one job (directives, then the derived queue, then ripe
  proposals), assign `j-<yyyymmdd>-<seq>`, commit a self-contained
  `.job/brief.md` to `job/<id>`, invoke the runner under the job type's
  wall-clock cap, classify the outcome from `RESULT.md`, require a recorded
  review verdict before merging, and write the ledger line.
- `node loop/conformance.mjs --runner <id>` — the four canned checks a
  model/provider/harness combination must pass before it may author or
  review.

Configuration is `runners.yml` (the only file that names a model, provider
or harness) and `data/config.json` (budget bounds, job caps, degradation
thresholds, publish flag). Reserved paths no job may edit: `openspec/specs/`,
`data/config.json`, `runners.yml`, `STOP`, and `HOLD.md`'s removal.
