# data/derived/

**Strictly recomputable.** Every file here is regenerated from scratch by a
Pulse run or a build; deleting the whole directory costs one run and nothing
else. Nothing that is state may live here — the job ledger
(`data/ledger.jsonl`) and the rolling link-check dates
(`data/linkcheck.json`) sit at the data root for exactly that reason.

Expected contents: the model catalog rows and status tables, `freshness.json`,
`queue.json` (the loop's ranked work snapshot — capped at 50, no identity, no
history, cannot backlog), `aliases.json`, `backlinks.json`, `wants.json`,
`search-index.json` and `frontier.json`.

`frontier.json` is written **on every run, even when no index metric is
registered** — an empty `metrics` array and the newest snapshot's own date. It
is not absent and is never stood in for by a placeholder anywhere downstream,
so a surface looks the metric up and then collapses, and declaring one cleared
metric populates it with no edit to any renderer. Two shipped builds instead
hard-wired that empty state, and no data could ever have filled either
(`loops/ui-loop/graph/knowledge/implementer-ledger.md` row 6).

These files are still committed (design D1): the deploy build and the next
machine read them.
