---
slug: render-pinned-last-known-for-vanished-rows
type: machinery
date: 2026-09-07
origin: review of job j-20260906-19
noted_by: the reviewer of job j-20260906-19 (claude-code-opus)
proposed_by_job: j-20260906-19
proposed_by_type: entry
---
A vanished feed row's last-known values survive for exactly one snapshot rotation in the render path, after which the entry page renders an absent value labelled "last known value, as of an unrecorded date" — while the real last-known values sit pinned and complete in the row's data/vanished/ record. Teach the derived feed-row join to fall back to the pinned record when the row is in neither latest nor previous, so the page renders what specs/wiki requires: the last-known value with a visible as-of date. The pinning already exists (addictedtoai-64fk); only the render path does not read it.

## Evidence

Measured on this branch, 2026-09-06. pulse/lib/derive.mjs:119-132 joins `inLatest ?? inPrevious ?? null` and, on null, writes the literal `{ $status: null, $as_of: null, $vanished: true }`. For `ibm-granite/granite-4.1-8b` data/derived/feed-rows.json now holds exactly that, because previous.json has rotated to the 2026-09-05 fetch which no longer contains the row. lib/facts.mjs:271-277 then renders `ABSENT` plus `last known value, as of an unrecorded date — the source no longer lists this row`. Meanwhile data/vanished/answered/openrouter-models--ibm-granite-granite-4-1-8b.md pins `last_seen: 2026-09-04` together with `context_length` 131072 and `pricing` {"prompt":"0.00000005","completion":"0.0000001"} — written for this exact reason ("snapshot rotation will eventually take them out of both snapshots and they cannot be recovered afterwards"). specs/wiki requires "a declared row id that is absent from the current snapshot SHALL cause the fact to render its last-known value with a visible as-of date"; today the page renders neither the value nor the date, two days after the withdrawal. Six records already sit in data/vanished/answered/, so this is not a one-entry symptom.

## Origin

Transcribed by the loop from the verdict record for job j-20260906-19 (`j-20260906-19.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
