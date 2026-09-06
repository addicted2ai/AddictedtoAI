---
date: 2026-09-06
slug: a-feed-row-quotes-a-vendor-sentence-the-vendor-never-wrote
type: verify
summary: >
  Audit the `llm-releases` snapshot for row descriptions that put a quoted
  phrase in a vendor's mouth and attribute it to a `source_url` that does not
  contain the phrase. One instance is already measured: the Laguna S 2.1 row
  says Poolside pitched the model as "the West's most capable open-weight
  model" for its weight class, and names
  https://poolside.ai/blog/introducing-laguna-s-2-1 as its source, where the
  strings "West", "most capable open" and "open-weight model" are all absent
  from the served bytes. The job would fetch each row's `source_url`, search
  the served bytes for every quoted fragment in that row's `description`, and
  record which rows survive and which do not — the same instrument discipline
  the ground rules require, ruling out the extractor before concluding absence.
evidence: >
  Read from data/sources/llm-releases/latest.json on 2026-09-06 (fetched_at
  2026-09-04T06:00:03.587Z, row_count 60). The Laguna S 2.1 row carries
  source_name "Poolside", source_url
  https://poolside.ai/blog/introducing-laguna-s-2-1, link
  https://llm-releases.com/models/laguna-s-2-1, and a description containing
  the single-quoted phrase "the West's most capable open-weight model". That
  post was fetched raw on 2026-09-06 (HTTP 200, 465,592 bytes) and searched
  case-insensitively for "West", "most capable open" and "open-weight model":
  zero matches for each, against two matches for the phrase Poolside did
  write, "the most capable agentic coding model in its weight class by a wide
  margin". The nearest real sentence in the post's Sanity payload is "The
  open-weight ecosystem in the West is still early in its development", which
  is from a different post (introducing-laguna-xs2-m1, 2026-04-28) and is
  about the ecosystem, not the model. The same snapshot's other 59 rows were
  not checked, which is the job.
proposed_by_job: j-20260906-05
proposed_by_type: entry
---

Why this is a `verify` and not a repair. Nothing in the corpus is wrong today:
no entry cites the llm-releases description, and the Poolside org entry written
alongside this proposal deliberately quotes only Poolside's own bytes. What is
unknown is the **rate**. If one row in sixty carries a manufactured vendor
quotation, the feed is a source whose descriptions must never be quoted, and
that is worth knowing before a future job quotes one — the changed feed and the
model catalog both read this source, and a description is exactly the kind of
ready-made sentence a job under time pressure lifts.

Why the check has to fetch rather than reason. A quoted fragment absent from
one representation of a document is misattribution, not fabrication, until the
other representations are ruled out: these are Svelte-hydrated pages that carry
the same prose twice, once as rendered HTML with comment markers interleaved
mid-sentence and once as a Sanity block payload with the sentence intact. A
search that only reads the rendered text will report false absences on every
sentence containing a link. The measurement above searched the raw served
bytes, which contain both, and searched fragments short enough to straddle
neither the comment markers nor a `<` escape.

What "done" looks like: a record naming, for each of the 60 rows, whether every
quoted fragment in its description was found in its `source_url`'s served
bytes; the fragments and byte counts for the ones that were not; and a stated
verdict on whether llm-releases descriptions are quotable at all. If the rate
is one in sixty it is a footnote; if it is one in six it is a finding about a
source this site's data layer depends on.
