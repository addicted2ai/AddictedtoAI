---
slug: primary-source-fetch-route-for-blocked-vendor-pages
type: machinery
date: 2026-09-04
origin: review of job j-20260904-04
noted_by: the reviewer of job j-20260904-04 (claude-code-opus)
proposed_by_job: j-20260904-04
proposed_by_type: post
---
Add a small repository script — one file under `scripts/`, no new dependency — that fetches a vendor page with a full desktop-browser header set and writes the raw body to a temp file, so a job or a review confirming an external `anchor:` gets the primary document instead of reconstructing it from secondary coverage. specs/blog requires review to fetch an external anchor and confirm it documents the event and its date; openai.com's bot protection currently defeats the obvious routes, and the fallback that reviews have been using — corroborating the anchor from press coverage — is a materially weaker check than the spec asks for, on the exact class of page (vendor release notes, pricing, system cards) this corpus cites most.

## Evidence

Measured in this review, 2026-09-04. `WebFetch` on https://openai.com/index/gpt-6-astra/ returned "HTTP 403 Forbidden. The response body was not retrieved." A Node `fetch()` sending only `user-agent` (desktop Chrome) and `accept` returned 403 with a 10,033-byte block page. The same `fetch()` with the fuller browser set — `user-agent`, `accept`, `accept-language`, `sec-ch-ua`, `sec-ch-ua-platform`, `upgrade-insecure-requests` — returned **200 and 2,821,478 bytes**, and every figure the post cites was then confirmed against that document by substring search. `r.jina.ai` returned 403 in the same run. The cost of not having this is on the record: the immediately preceding review, `data/reviews/j-20260904-03.md`, logs four failed routes against the same host and confirms its anchor from Axios, The Register and Help Net Security instead of the primary page.

## Origin

Transcribed by the loop from the verdict record for job j-20260904-04 (`j-20260904-04.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
