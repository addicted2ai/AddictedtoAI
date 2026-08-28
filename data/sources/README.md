# data/sources/

The source registry and its snapshots (`specs/pulse`).

`registry.json` declares every external source the Pulse fetches: URL, the
fields it yields, which field is the **row id** (the join key entries declare
in their `feeds` map), `fetch_every_days`, `expected_change_days`, an
optional `mints` mapping, its robots/terms check result, and the date that
check was made. Adding or removing a source is an ordinary data change, not
an OpenSpec change.

Each source gets a directory `sources/<source-id>/` holding `latest.json`
(newest snapshot) and `previous.json` (the diff base). Only those two are
retained, which is why every material change in `changes.jsonl` embeds its
own source-row excerpt — the archived source reference outlives the vendor's
page.
