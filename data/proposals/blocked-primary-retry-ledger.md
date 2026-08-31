---
slug: blocked-primary-retry-ledger
type: machinery
date: 2026-08-31
origin: review of job j-20260831-03
noted_by: the reviewer of job j-20260831-03 (claude-code-opus)
proposed_by_job: j-20260831-03
proposed_by_type: scout
---
Four distinct URLs returned HTTP 403 to direct fetch during this one scout run, and in two cases the 403 was the decisive reason a story was declined rather than filed — the clause text in OpenAI's services agreement, and the current resale-economy figures behind cybernews/SOCRadar. Today that fact lives only inside a drop record's prose, where nothing re-checks it, so a document that becomes reachable next week never re-opens the story it killed. Build a small record in the data layer of URLs a run needed and could not retrieve, carrying the fetch status, the date, and the slug whose filing depended on it, so a later run can re-attempt the blocked primaries and surface the ones that now resolve.

## Evidence

In this diff: dropped/openai-cursor-model-supply-termination.md declines principally because openai.com/policies/services-agreement/ 403'd (I reproduced this on 2026-08-31 — WebFetch returned "The server returned HTTP 403 Forbidden"); dropped/claude-session-theft-infostealers' economics section is dropped because cybernews and SOCRadar 403'd; anthropic-usage-policy-pentagon-ruling.md records congress.gov CRS product IN12669 as "an unfetched pointer only" after a 403. Three of the run's eight artifacts turn on a retrieval failure that nothing will ever retry.

## Origin

Transcribed by the loop from the verdict record for job j-20260831-03 (`j-20260831-03.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
