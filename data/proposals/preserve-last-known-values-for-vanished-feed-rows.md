---
slug: preserve-last-known-values-for-vanished-feed-rows
type: machinery
date: 2026-09-03
origin: review of job j-20260903-01
noted_by: the reviewer of job j-20260903-01 (claude-code-opus)
proposed_by_job: j-20260903-01
proposed_by_type: entry
---
specs/wiki requires that a declared row id absent from the current snapshot "SHALL cause the fact to render its last-known value with a visible as-of date". The implementation honours that for exactly one day. pulse/lib/derive.mjs resolves a declared row as `inLatest ?? inPrevious ?? null`, and only two snapshots are kept on disk, so once a vanished row falls out of `previous.json` the join collapses to `{ $status: null, $as_of: null, $vanished: true }`. Every bound fact on the entry then renders the ABSENT dash followed by "last known value, as of an unrecorded date" — no value and no date, which is the one thing the requirement names. A machinery job would carry the last-seen row and its snapshot date forward into feed-rows.json when a row vanishes; the information already exists, because the retirement record in data/changes.jsonl carries both the excerpt of the row and the date it went. Worth a test that ages a vanished row past `previous`.

## Evidence

Measured on this branch on 2026-09-03. data/derived/feed-rows.json holds `"anthropic/claude-opus-4.7-fast": {"$as_of": null, "$vanished": true, "$status": null}` with no pricing key at all; the same for claude-opus-4.8-fast and claude-opus-5-fast. Executing resolveFact against the real data layer for all four of this entry's facts printed `{"state":"vanished","value":null,"asOf":null}` four times, which lib/facts.mjs:269-273 renders as the ABSENT dash plus "as of an unrecorded date". pulse/lib/derive.mjs:117-126 is the cause. The retirement record in data/changes.jsonl dated 2026-09-02 still carries `"pricing.prompt":"0.00003"` and `"pricing.completion":"0.00015"`, so nothing was lost upstream — only dropped at the join. The visible consequence beyond this entry: content/wiki/model/anthropic-claude-opus-4-7.md lines 50/54/57 and content/wiki/model/anthropic-claude-opus-5.md line 110 transclude price_input from these three rows mid-sentence, so that prose now reads "heading at — input against this row's own $0.000005 — six times over". Fixing the join repairs those pages with no content edit, which is the point of the requirement.

## Origin

Transcribed by the loop from the verdict record for job j-20260903-01 (`j-20260903-01.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
