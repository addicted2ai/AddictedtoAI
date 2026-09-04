---
slug: anchor-fetch-fallback-for-review
type: machinery
date: 2026-09-04
origin: review of job j-20260904-05
noted_by: the reviewer of job j-20260904-05 (claude-code-opus)
proposed_by_job: j-20260904-05
proposed_by_type: post
---
Give the review path a documented fallback for anchors that refuse the default fetcher. Reviewing a note requires fetching every declared external anchor and confirming it documents the event and its date, and an anchor that does not hold is false-or-unsupported-claim. But a vendor blog that returns 403 to the default extractor and 200 to an ordinary browser user-agent is indistinguishable, at the reviewer's end, from an anchor that does not resolve — which points a reviewer at the most severe verdict in the list for a reason that is entirely their own instrument. The job would add a small fetch helper (retry with a browser user-agent, report the status code and byte count, extract text for grepping) and a line in the review checklist saying an anchor is only unreachable after the fallback has also failed, mirroring the existing "absence is never proven until you have ruled out your own instrument" rule that today covers only PDFs.

## Evidence

In this review WebFetch returned "HTTP 403 Forbidden" for the declared anchor https://ifm.ai/blog/k2/ and again for https://ifm.ai/blog/k2, and a third time for the hpcwire secondary source. curl with a browser user-agent returned "200 88602" for the same anchor URL, and every claim in the post then verified against its text. A reviewer who stopped at the first 403 would have had grounds to record the anchor as not holding on a post whose anchor holds completely.

## Origin

Transcribed by the loop from the verdict record for job j-20260904-05 (`j-20260904-05.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
