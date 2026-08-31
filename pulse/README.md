# pulse/

The Pulse: the deterministic, model-free engine (`specs/pulse`, design D2).

`node pulse/run.mjs` performs, in order: stop-file check, source fetching,
snapshot/hash/diff, data-layer update (including mechanical stub minting and
lifecycle timeline appends), rolling link check, freshness computation,
derived-queue recomputation, site rebuild, and the commit-and-publish step.

**Committing is not publishing.** That last step has two halves and only the
second is gated by `data/config.json`'s `publish` flag: the run's own state —
the changed feed, the snapshots, the link-check record, the derived tree, the
lifecycle appends — is committed on every run that produced it, and the push
and deploy verification happen only when `publish: true` and no `HOLD.md`
stands. Both halves come after the site rebuild, so a run producing content
the build rejects neither commits nor publishes it. Holding publishing down
used to mean holding the whole run's state out of git, which then cost the
Desk a 15.47-minute job dispatched at a record that was not on `main`.

**No model invocation on any path.** Nothing in this directory's dependency
graph may import a model SDK; the property is verified by running with every
model-related environment variable unset and observing exit 0
(`node pulse/verify-zero-model.mjs`), and structurally by
`pulse/tests/zero-model.test.mjs`, which allowlists the four packages the
Pulse may import. It is safe to run on any schedule, idempotent between world
changes, and never prompts.

Fixture tests live in `pulse/tests/` and run under `npm test`.

## Flags

| Flag | Effect |
|---|---|
| `--force` | ignore each source's `fetch_every_days` cadence |
| `--offline` | make no network request at all: no fetches, no link checks |
| `--no-build` | skip the site rebuild step |
| `--no-mint` | skip mechanical stub minting |
| `--dry-run` | the publish step prints what it would do and executes nothing |
| `--assume-publish` | treat `publish` as true — **refused unless `--dry-run` is also given** |

Environment: `PULSE_ROOT` points a whole run at another tree (this is how the
fixture tests exercise the real program); `PULSE_NOW` fixes the clock;
`SITE_URL` overrides the deploy poll target. No model-related variable is read
anywhere.

## Files the Pulse owns

```
data/sources/registry.json          the source registry
data/sources/<id>/latest.json       newest snapshot   ┐ only these two are
data/sources/<id>/previous.json     the diff base     ┘ retained, which is why
data/sources/<id>/state.json        fetch/refusal/seed state
data/sources/<id>/minted.json       minting provenance (see below)
data/changes.jsonl                  append-only dated diff history
data/linkcheck.json                 rolling link-check dates + destinations — state
data/derived/catalog.json           model catalog rows
data/derived/status-tables.json     deprecations + changed-in-30-days
data/derived/sources.json           per-source public state (refusing, suspect)
data/derived/feed-rows.json         joined rows for declared row ids
data/derived/freshness.json         all staleness, computed
data/derived/queue.json             the ranked work snapshot
```

Everything under `data/derived/` is recomputed from scratch every run.
Everything at the data root is state that is not derivable from anything else.

## Contracts other parts of the system depend on

**Change line keys.** Every line in `data/changes.jsonl` carries a
deterministic `key` of the form
`<source>|<hash of previous rows>|<hash of latest rows>|<row id>|<field>`,
computed from the snapshot files at diff time. Appending skips any key already
present, which is what makes the engine idempotent between world changes.
Seeded lines key off the row id alone: `seed|<source>|<row id>`.

**Annotation lines.** An `interpret` job (specs/loop) appends its
interpretation to `data/changes.jsonl` rather than editing history. The shape
the derived queue looks for:

```json
{ "kind": "annotation", "annotates": "<the change line's key>",
  "date": "2026-08-28", "job": "j-20260828-01", "text": "..." }
```

A material change on price/licence/status from the trailing 14 days with no
annotation line pointing at it is what produces an `interpret` queue item; the
item disappears the moment the annotation exists.

**Feed facts.** `data/derived/feed-rows.json` holds the joined source row for
every row id some entry declares, plus three computed fields: `$status` (the
registry-derived lifecycle status), `$as_of` (the date of the snapshot the
values came from) and `$vanished` (true when the latest snapshot no longer
contains the row). A vanished row's last-known values stay in the file
precisely so the renderer can show them with a visible as-of date rather than
as current.

**Minting provenance.** `lib/schema.mjs` validates entries with a strict
schema, so a minted stub carries no extra front-matter key saying a machine
made it. That record lives in `data/sources/<id>/minted.json`
(`row id -> { entry_id, path, date }`). Minting idempotency does not depend on
that file: a row never mints twice because some entry already declares it.

**The publish step is shared.** `loop/run.mjs` calls
`publishStep()` from `pulse/lib/publish.mjs` after a merge (design D2), so
there is exactly one implementation of deploy and exactly one gate on it.
