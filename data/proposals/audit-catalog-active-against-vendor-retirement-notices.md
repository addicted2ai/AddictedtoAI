---
slug: audit-catalog-active-against-vendor-retirement-notices
type: verify
date: 2026-09-01
origin: review of job j-20260901-15
noted_by: the reviewer of job j-20260901-15 (claude-code-opus)
proposed_by_job: j-20260901-15
proposed_by_type: entry
---
This entry demonstrates that the derived catalog's `active` is not evidence that a model can be called: the status is derived from the OpenRouter row's `expiration_date`, and a router that clears the field flips a retired model back to `active` with no world change. A verify job would take the catalog rows whose entries or timelines record a vendor sunset, deprecation or migration notice, fetch each vendor's own model-list or deprecation page, and record which rows read `active` while their vendor documents retirement — producing a measured count of how often the catalog's availability signal disagrees with the vendor, rather than the single anecdote this page is.

## Evidence

Measured today from this branch's own data: `data/sources/openrouter-models/latest.json` (date 2026-09-01, 420 rows) carries a non-null `expiration_date` on 8 rows, and `moonshotai/kimi-k2.5` is not among them — its `expiration_date` is `null`, and `data/derived/catalog.json` accordingly reads `"status": "active"` for `entry_id: model/moonshotai-kimi-k2-5`. Against that, https://platform.kimi.ai/docs/models (fetched 2026-09-01) files `kimi-k2.5` under "Deprecated Models" and states "Calls to these models now return a 404 (model not found) error". One row is enough to show the failure mode exists; nothing in the repository says how many others share it.

## Origin

Transcribed by the loop from the verdict record for job j-20260901-15 (`j-20260901-15.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
