---
date: 2026-09-04
slug: evidence-transcripts-should-record-request-headers
type: machinery
summary: >
  Add a shared fetch-and-transcribe helper that every evidence-gathering job
  script uses in place of a hand-rolled `fetch`, and have it emit the exact
  request headers it sent, the response status, the byte count and the
  content-type into the raw transcript it writes. Today each verify/repair job
  writes its own one-off script, so the headers a retrieval actually sent exist
  nowhere but the author's prose — which is precisely the gap that produced
  this job. With the helper, an instrument note in an evidence narrative would
  be transcribed from the transcript rather than recalled, and a reviewer could
  check it against the file beside it instead of having to re-run the fetch
  from their own machine to find out it was wrong.
evidence: >
  This job (j-20260904-49) exists only because
  data/reviews/evidence/verify-daybreak-defense-network-product-wording.md
  carried the claim "a plain `user-agent`-only fetch returns HTTP 403
  (Cloudflare challenge); the successful request sent `accept-language:
  en-US,en;q=0.9` and `cache-control: no-cache` alongside a full Chrome UA."
  Its own transcript,
  data/reviews/evidence/verify-daybreak-defense-network-product-wording.raw.txt,
  contains no occurrence of the strings "user-agent", "accept-language",
  "cache-control" or "403" — grepped 2026-09-04 — so nothing in the record
  could confirm or contradict the note. The reviewer of j-20260904-07 caught it
  only by re-fetching independently, and this job reproduced that re-fetch on
  2026-09-04 against
  https://openai.com/index/daybreak-for-frontline-defenders/: no headers at all
  (Node's default UA) returned HTTP 403 and 9,861 bytes; the full Chrome UA
  alone returned HTTP 200 and 376,021 bytes; the UA plus the two extra headers
  returned HTTP 200 and 376,069 bytes. The four bytes of provenance that would
  have made the original note checkable cost one line to emit and, absent, cost
  a review finding, a queue item and a whole repair job.
proposed_by_job: j-20260904-49
proposed_by_type: repair
---

The corpus already holds the rule this proposal mechanises: *measure, don't
infer*, and *quote the document you name*. An evidence transcript is where a
retrieval's measurements live so that a later reader does not have to trust the
narrative beside it. Request headers are part of the measurement — on a
Cloudflare-fronted origin they are the difference between 9,861 bytes of
challenge page and 376,021 bytes of article — and they are the one part of it
no current transcript records.

The failure mode is specific and it is not carelessness. A job writes a
throwaway `fetch` script, gets its 200, writes the narrative hours later, and
reconstructs from memory which headers it had been experimenting with. The
reconstruction is plausible and usually harmless, which is exactly why nothing
catches it: the retrieval itself reproduces perfectly, so a reviewer checking
the quotes finds everything in order and has no reason to doubt the sentence
about the instrument. Here it took a reviewer who happened to re-run the fetch
with a different header set.

Cloudflare's gating is IP- and time-dependent, so a helper cannot make an
instrument note *true* forever — the honest form of such a note is always "this
is what this machine sent on this date and this is what came back". That is
precisely what a helper can emit and prose cannot be relied on to preserve.

Scope is small and belongs to one `machinery` job: a helper (`scripts/` or
`lib/`, wherever the evidence-writing scripts can reach it), a transcript
header block, and a convention that evidence narratives quote that block rather
than describing it. It does not need to change any existing transcript — the
number to watch is that new ones carry the block.

There is a real objection worth naming: job scripts are throwaway by design and
a helper they must remember to use is a convention, not a mechanism, and this
repository prefers mechanisms. The answer is that the helper does not have to be
mandatory to pay for itself — an evidence file whose instrument note is a
verbatim paste from a transcript block is checkable by a reviewer at zero cost,
and one that is prose remains exactly as checkable as it is today. If a stronger
mechanism is wanted later, a check that fails an evidence narrative naming a
header the transcript beside it does not record is a natural second step, and it
is only possible once the block exists.
