# data/

The site's data layer. **Commit policy: the entire `data/` tree is
committed** (design D1, task 1.3). Nothing under `data/` is gitignored —
snapshots, diff history, derived files, the ledger and especially the rolling
link-check state all travel with the repo, because the deploy build and the
next machine both need them. If a file here looks like build output, it is
not: build output is `.next/` and `out/`.

| Path | What it is | Kind |
|---|---|---|
| `config.json` | the one normative loop config: publish flag, budget bounds, per-type job caps, degradation thresholds | reserved path (`specs/loop`) |
| `sources/registry.json` | the source registry: URL, fields, row id, cadences, robots/terms result, verification date | state |
| `sources/<id>/latest.json` | newest snapshot per source | state |
| `sources/<id>/previous.json` | prior snapshot, the diff base | state |
| `changes.jsonl` | append-only dated diff history, one JSON object per detected or seeded change, each embedding its source-row excerpt | state |
| `ledger.jsonl` | append-only job ledger (id, type, runner, provider, tier, MM, outcome) | state |
| `linkcheck.json` | rolling link-check dates, plus where each link actually lands (`final_url`, `bytes`, `meta_refresh`) — 30 days of accumulated observations, derivable from nothing else | state |
| `launch.json` | the launch record: measured JS payloads, analytics verification, build verification, launch date | state |
| `proposals/` | proposal files; `rejected/` is the rejection index, `dropped/` and `consumed/` are records | state |
| `reviews/` | verdict records (`seed-<slug>.md`, `<job-id>.md`) | state |
| `analytics/summary.json` | maintainer-supplied aggregate; absent is fine | state |
| `derived/` | **strictly recomputable** on every Pulse run | derived |

`ledger.jsonl` and `linkcheck.json` sit at the data root, not in `derived/`,
precisely because they are state: `derived/` holds only what every Pulse run
recomputes from scratch.

## `config.json` — the one normative loop config

JSON carries no comments, so the shape is documented here. It is a
**reserved path**: the maintainer edits it freely, no job may
(`specs/loop`). Four groups of keys, and only these four:

1. **`publish`** — the publish flag. It governs **the push, and nothing else**.
   With `publish: false` the shared step prints one line saying so and reaches
   no remote; a Pulse run still **commits the state it computed**, because
   committing is not publishing and a run's state belongs in git the moment it
   exists. (It cost 15.47 model-minutes to learn otherwise: a queue derived
   from an uncommitted working tree dispatched the Desk at a record that was
   not on `main`.) The launch checklist (task 9.1) is what flips it, by the
   maintainer's own hand.
2. **`budget`** — the rolling window (`window_days`: 30), the category
   membership of every job type, and the three bounds from `specs/loop`:
   upkeep floor 40%, new-writing ceiling 45%, machinery ceiling 10%. Shares
   are computed **within each tier separately** and each bound has its own
   enforcement point — the floor binds on its own, not as the residue of the
   ceilings. Changing a bound requires an OpenSpec change.
3. **`job_caps_minutes`** — the per-type wall-clock cap. An executor still
   running at its cap is killed and the job classifies `interrupted`. The
   caps are per-type; the spec's defaults are merely tier-derived (cheap-tier
   types 30, frontier authoring types 60), and `machinery` was set by hand
   because those two defaults do not cover it — recorded so the choice is
   visible rather than inferred. **Read the file for the live numbers**: as of
   2026-08-30 every type is 120 except `scout`, which is 60. `scout` is
   deliberately the short one, and deliberately not the 30 first proposed: a
   fetch-bound job killed at its cap ends `interrupted`, and `interrupted` is
   an outcome the breakers exclude — so a cap set too low fails silently and
   repeatedly rather than tripping anything (make-the-blog-worth-sending,
   design D9.2). Every type `loop/lib/config.mjs` lists in `JOB_TYPES` needs
   an entry here or `loadConfig` refuses the whole config, which is why adding
   a job type is two edits in a fixed order — this file first.
4. **`degradation`** — the trailing-48h capacity-event thresholds.
   `shed_levels` is ordered by `capacity_events`; a tier's shed level is the
   count of `capacity` classifications recorded for that tier inside
   `window_hours`, and **a count of 3 or more uses the level-3 entry**. At
   level 3 only `verify`, `repair` and material-field `interpret` remain
   selectable, which is what `interpret_material_only` encodes.

Constants that are normative in `specs/loop` but deliberately **not** here,
because task 1.3 names exactly four groups: the lane backoff schedule (1h,
doubling per consecutive `capacity` line, 6h maximum), the proposal cooling
period (3 days), the resumable-branch age limit (14 days), and the derived
queue's cap (50). Read those from the spec.
