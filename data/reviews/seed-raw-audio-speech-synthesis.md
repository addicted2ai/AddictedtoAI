---
job: seed-raw-audio-speech-synthesis
verdict: approve
reasons: []
would-cite: "A compact research-to-production receipt: the paper's own words called the method computationally expensive, and thirteen months later it was the shipped voice of a consumer assistant at a thousand times the speed."
reviewer: task-6.5 seed reviewer (fresh context, no edit rights)
date: 2026-08-28
---

Checked both ends by fetching.

- End A: fetched the WaveNet post; publication date September 8, 2016
  matches. Observed verbatim: "Building up samples one step at a time like
  this is computationally expensive, but we have found it essential for
  generating complex, realistic-sounding audio" — the delta's end-A sentence
  is supported in the source's own words.
- End B: fetched the Assistant launch post; publication date October 4, 2017
  matches. Observed verbatim: "an updated version of WaveNet is being used
  to generate the Google Assistant voices for US English and Japanese across
  all platforms"; "requires just 50 milliseconds to create one second of
  speech"; "at speeds 1,000 times faster than the original model." Sentence
  and both halves of the metric supported exactly.

Weaknesses, weighed: the impossible end carries no hard metric (the spec
makes metrics optional), and the arc is one organization productionizing its
own research — the least surprising shape on the surface. What keeps it: the
impossibility words are the researchers' own, both ends are exact, and the
flip took thirteen months. The author's self-assessment puts this second on
the cut list; I agree it is the weakest of the approvals, and it should be
the first cut if the surface ever needs to shed one — but it is true, tight,
and does not dilute the set enough to fail `not-worth-reading`.

## Recheck 2026-08-29 (wave addictedtoai-flh) — approve stands

Re-examined because this delta was approved in the earlier seed round, which
the 2026-08-29 seed wave never revisited. Both ends re-fetched; the front
matter's dates were checked against the pages' own machine-readable
publication metadata rather than against rendered prose, because both pages
now carry a 2026 `dateModified` that a careless reader could mistake for the
publication date.

- End A, the WaveNet post (152,813 bytes, HTTP 200):
  `article:published_time` / `datePublished` = **`2016-09-08T00:00:00+00:00`**,
  matching the front matter exactly. Body carries verbatim: "**Building up
  samples one step at a time like this is computationally expensive**, but we
  have found it essential for generating complex, realistic-sounding audio."
  The delta's end-A sentence is the source's own characterisation, not a
  reader's.
- End B, the Assistant launch post (143,539 bytes, HTTP 200):
  `datePublished` = **`2017-10-04T00:00:00+00:00`**, matching. Body carries:
  "an updated version of WaveNet is being used to **generate the Google
  Assistant voices for US English and Japanese across all platforms**";
  "**requires just 50 milliseconds to create one second of speech**"; "at
  **speeds 1,000 times faster than the original model**." Sentence and both
  halves of the metric exact.

Thirteen months between the two published dates, as the record says. Nothing
changed.
