---
slug: keep-last-known-values-for-vanished-feed-rows
type: machinery
date: 2026-09-03
origin: review of job j-20260903-22
noted_by: the reviewer of job j-20260903-22 (claude-code-opus)
proposed_by_job: j-20260903-22
proposed_by_type: repair
---
A vanished feed row keeps its last-known values for exactly one Pulse run. pulse/lib/derive.mjs:113-126 joins a declared row from `latest ?? previous`, so once the row is absent from BOTH snapshots it falls to the bare `{ $status: null, $as_of: null, $vanished: true }` branch and every value and the as-of date are gone for good. The page then renders "not published" followed by "last known value, as of an unrecorded date" — a note promising a last-known value beside no value and no date. specs/wiki (quoted in derive.mjs's own comment at 102-107) says a vanished row's "last-known values must render with a visible as-of date and never as current", which the implementation delivers for one run and then silently stops delivering. A machinery job would either freeze the last-known row and its as-of date into the derived tree when a row first vanishes, or — if the values are genuinely unrecoverable — stop emitting the as-of note when there is nothing to be as-of, so the page does not describe data it no longer holds.

## Evidence

Measured in this branch's own derived tree on 2026-09-03. Rendering model/anthropic-claude-opus-4-7-fast's price facts through lib/facts.mjs with data/derived/feed-rows.json gives, for both price_input and price_output: `<span class="fact-absent">not published</span><span class="fact-as-of" role="note">last known value, as of an unrecorded date — the source no longer lists this row</span>`. The row itself is `{"$as_of": null, "$status": null, "$vanished": true}`. Counting the whole file: 4 vanished rows, 3 of them with a null `$as_of` — the three Anthropic fast rows that left the OpenRouter catalog on 2026-09-02, i.e. every row that has been gone for more than one run. This is also why the page under review has to hardcode "$30.00 in / $150.00 out" in prose with an HTML comment explaining that they cannot be transcluded.

## Origin

Transcribed by the loop from the verdict record for job j-20260903-22 (`j-20260903-22.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
