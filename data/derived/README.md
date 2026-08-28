# data/derived/

**Strictly recomputable.** Every file here is regenerated from scratch by a
Pulse run or a build; deleting the whole directory costs one run and nothing
else. Nothing that is state may live here — the job ledger
(`data/ledger.jsonl`) and the rolling link-check dates
(`data/linkcheck.json`) sit at the data root for exactly that reason.

Expected contents: the model catalog rows and status tables, `freshness.json`,
`queue.json` (the loop's ranked work snapshot — capped at 50, no identity, no
history, cannot backlog), `aliases.json`, `backlinks.json`, `wants.json` and
`search-index.json`.

These files are still committed (design D1): the deploy build and the next
machine read them.
