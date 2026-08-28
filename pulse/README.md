# pulse/

The Pulse: the deterministic, model-free engine (`specs/pulse`, design D2).

`node pulse/run.mjs` performs, in order: stop-file check, source fetching,
snapshot/hash/diff, data-layer update (including mechanical stub minting and
lifecycle timeline appends), rolling link check, freshness computation,
derived-queue recomputation, site rebuild, and — only when
`data/config.json` has `publish: true` — the publish step.

**No model invocation on any path.** Nothing in this directory's dependency
graph may import a model SDK; the property is verified by running with every
model-related environment variable unset and observing exit 0 (task 3.7).
It is safe to run on any schedule, idempotent between world changes, and
never prompts.

Fixture tests live in `pulse/tests/` and run under `npm test`.
