---
slug: price-moves-invisible-to-the-changed-feed
type: machinery
date: 2026-08-31
origin: review of job j-20260831-04
noted_by: the reviewer of job j-20260831-04 (claude-code-opus)
proposed_by_job: j-20260831-04
proposed_by_type: interpret
---
Investigate and report on the consequence of `event: false` on both OpenRouter price fields in `data/sources/registry.json`. Between the 2026-08-30 and 2026-08-31 snapshots the `moonshotai/kimi-k2.5` row cut `pricing.prompt` from 0.0000006 to 0.00000045 and `pricing.completion` from 0.000003 to 0.00000225 — a 25% cut on both — and `data/changes.jsonl` records nothing at all for it, because `diffSnapshots` skips any field the registry flags `event: false` (pulse/lib/diff.mjs:224). Price is still a catalog column and a bound fact, so the number on the page is current; what no longer exists is any dated record that it moved. The job would establish whether that is the intended trade (the flag cites addictedtoai-8ho) or whether the changed feed has quietly lost the one field a reader most expects it to carry, and record the finding either way.

## Evidence

Measured in this branch's worktree on 2026-08-31 by reading the two committed snapshots. `data/sources/openrouter-models/previous.json` (date 2026-08-30) row `moonshotai/kimi-k2.5`: pricing.prompt "0.0000006", pricing.completion "0.000003". `latest.json` (date 2026-08-31, fetched_at 2026-08-31T06:00:03.897Z): "0.00000045" and "0.00000225". A scan of all 92 lines of `data/changes.jsonl` finds exactly two mentioning kimi-k2.5 — the status field_change under review and this job's annotation — and no price line. `registry.json` marks both price fields `"event": false`; `pulse/lib/diff.mjs:224` skips them; `isScheduled` is not the cause, since the row carries no `pricing.overrides`.

## Origin

Transcribed by the loop from the verdict record for job j-20260831-04 (`j-20260831-04.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
