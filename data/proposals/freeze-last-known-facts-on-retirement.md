---
slug: freeze-last-known-facts-on-retirement
type: machinery
date: 2026-09-01
origin: review of job j-20260901-03
noted_by: the reviewer of job j-20260901-03 (claude-code-opus)
proposed_by_job: j-20260901-03
proposed_by_type: repair
---
A vanished-feed-row repair currently has one shape available to it: delete the `feeds:` binding and every fact bound through it, because leaving the binding in place keeps the queue item alive forever. That shape retires the entry correctly and discards the last-known values at the same time, which is the opposite of what the wiki spec's vanished-row scenario and CLAUDE.md both promise ("a vanished feed row renders its last-known value with a visible as-of date"). This proposes a machinery job to give an entry a way to declare a row as retired-but-last-known — a binding the freshness computation treats as resolved rather than vanished, so the queue item retires while the last snapshot's values keep rendering behind a visible as-of date. The per-entry judgment (death, or a successor row to rebind to) stays with the model; only the ability to keep the numbers changes.

## Evidence

This diff removes four feed-bound facts (price_input, price_output, context_window, status) from content/wiki/model/mistralai-ministral-8b-2512-batch.md. Their last-known values are not in doubt and are still committed in this repository: data/sources/openrouter-models/previous.json (fetched 2026-08-31T06:00:03Z) carries pricing.prompt and pricing.completion "0.00000015" and context_length 262144 for mistralai/ministral-8b-2512:batch, and the row this diff deletes from data/derived/feed-rows.json carried the same values under "$vanished": true with "$as_of": "2026-08-31" — which is exactly the last-known-value state the spec describes. After the merge the entry renders no price and no context window at all. The same deletion has now landed on four entries (de51f54, 0f48167, e51a46c and this one) with three more of the cohort queued, so the loss is systematic rather than incidental. Distinct from the already-filed batch-cohort-vanished-row-repairs, which proposes batching these jobs, not changing what they keep.

## Origin

Transcribed by the loop from the verdict record for job j-20260901-03 (`j-20260901-03.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
