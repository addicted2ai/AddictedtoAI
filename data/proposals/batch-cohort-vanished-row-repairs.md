---
slug: batch-cohort-vanished-row-repairs
type: machinery
date: 2026-09-01
origin: review of job j-20260901-01
noted_by: the reviewer of job j-20260901-01 (claude-code-opus)
proposed_by_job: j-20260901-01
proposed_by_type: repair
---
One vanished-feed-row repair currently costs one author invocation plus one or two review invocations, and the queue derives one item per row id. When a single upstream event delists a cohort of rows at once, that becomes N near-identical jobs producing N near-identical diffs, each re-establishing the same finding against the same source fetch. This proposes a machinery job to let the Pulse's queue derivation group vanished-feed-row items that share a source and a last_seen_date into one repair item carrying the whole cohort, so one job verifies the source once and records the retirement on each affected entry. The grouping stays mechanical — same source, same last-seen date — and the per-entry judgment (is there a successor row to rebind to, or is this a death?) stays with the model, which is where it belongs; only the invocation accounting changes.

## Evidence

After this job's merge, data/derived/queue.json still carries five vanished-feed-row repair items, all from openrouter-models, all mistralai/*:batch row ids, and data/derived/freshness.json records every one of them with the same last_seen_date of 2026-08-31 — codestral-2508:batch, ministral-8b-2512:batch, mistral-large-2512:batch, mistral-medium-3.1:batch and mistral-small-2603:batch. A live fetch of https://openrouter.ai/api/v1/models on 2026-09-01 returns exactly one surviving mistralai batch variant, mistralai/mistral-medium-3-5:batch, which confirms the five are one coordinated upstream pruning rather than five independent events. At this job's recorded cost of 9.32 model-minutes for the authoring invocation alone, the cohort is queued to spend that five times over on one world event.

## Origin

Transcribed by the loop from the verdict record for job j-20260901-01 (`j-20260901-01.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
