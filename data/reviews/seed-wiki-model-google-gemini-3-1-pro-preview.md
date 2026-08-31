---
job: seed-wiki-model-google-gemini-3-1-pro-preview
verdict: approve
reasons: []
would-cite: >-
  The engineer being told a "-preview" slug is a formality: Gemini 3.1 Pro has
  worn it for 190 days with all three of its Pro rows still preview-only, while
  the flash-lite preview shed it in 65 days and the flash-image preview in 112,
  the latter doubling its context window on the way out.
reviewer: rr3b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Every catalog claim
recomputed by script against `data/sources/openrouter-models/latest.json`
(date 2026-08-28, 388 rows); source fetched 2026-08-29 and matched by literal
substring against raw bytes.

- https://openrouter.ai/google/gemini-3.1-pro-preview: raw bytes carry
  `"releaseDate":"2026-02-19T14:00:27.000Z"` and the rendered "Released Feb 19,
  2026", matching `listed_date` and the feed's `created`. The prose's "still
  shows no non-preview release" is true and I checked it the hard way rather than
  by reading the page: I enumerated every `google/gemini-3.1-pro*` slug string on
  the page and got four — `-preview` (x69), `-preview-20260219` (x197),
  `-preview-20260219:batch` (x8), `-preview:batch` (x4). Zero non-preview forms.
- Three Pro rows in the snapshot, exactly as stated:
  `google/gemini-3.1-pro-preview`, `google/gemini-3.1-pro-preview:batch` and
  `google/gemini-3.1-pro-preview-customtools`. All three carry "preview" in the
  slug; there is no `google/gemini-3.1-pro` row anywhere in the 388.
- 2026-02-19 to 2026-08-28 is 190 days. "more than six months" holds and, being
  a range rather than a count, does not decay.
- The two graduation intervals, computed not estimated:
  flash-lite-preview 2026-03-03 to flash-lite 2026-05-07 = 28+30+7 = **65 days**.
  flash-image-preview 2026-02-26 to flash-image 2026-06-18 = 2+31+30+31+18 =
  **112 days** (2026 is not a leap year). Both exact as written.
- flash-image context 131,072 against the preview's 65,536 — exactly twice — and
  input price 0.0000005 on both rows, so "twice the room at an unchanged input
  price" is right in both halves.
- Rule checks. The ratio "twice the room" is anchored — "which in the 28 August
  2026 snapshot is twice the room" — so it states a dated measurement, not a
  standing relationship. Volatile values are all transcluded: both context
  windows, the Pro input price and the intelligence index. The only typed numbers
  in the prose are 65, 112 and the listing date, all derived from static `created`
  timestamps rather than from anything that moves. Compliant on both counts.
- All five transclusion targets and all seven mentions resolve to real entries.

Round 1 (r8-opus) found: "That's 189 days ago as of this writing" — a hardcoded
count that was both wrong (190) and decaying (`spec-violation`) — **fixed**,
replaced with the non-decaying "more than six months before the snapshot of 28
August 2026 this page reads", which is what r8 asked for; "three separate Pro
variants" inflating a `:batch` billing suffix into a distinct model — **fixed**,
now "this one, a batch billing tier, and a custom-tools variant", r8's own
phrasing; and a second paragraph whose payload was filler, quoting graduation
prices that are identical to the preview prices and therefore carry no
information — **fixed**, and fixed with the right fact: the paragraph now carries
the two graduation intervals and the flash-image context doubling that r8 said
"this paragraph wanted". I re-derived all three new numbers independently and
found no error, so the fix introduced nothing.

One round-1 imprecision worth recording, in r8's would-cite rather than in its
findings: it says the two siblings "both graduated within three months". 112 days
is about 3.7 months. The fixer did not repeat it, writing the measured interval
instead — the right call, and a case of a fixer improving on its reviewer.

It clears the bar. The payload is a derived view nobody else publishes: a
top-tier row held in preview for over six months while its cheaper siblings
graduated on measured timetables, with the one graduation that actually changed
the product rather than just the slug. Specific throughout, and precisely the
page someone would paste into an argument about building on preview endpoints.

## Superseded in part 2026-08-31 by `addictedtoai-sng` — annotated, not overwritten

**What this record said, on its date.** The rule-check finding above concludes
that "volatile values are all transcluded … the Pro input price and the
intelligence index", and passes the page on that basis. That is still true — but
it was checking the *binding* of the price, not the *attribution* of it, and the
sentence it passed read "The Pro tier, **priced at** X input …".

**What superseded it.** `addictedtoai-l6j` established that an OpenRouter
`pricing.prompt` is the **top listed provider's** rate for a row, re-chosen on a
rolling 30-second window — so a correctly bound, correctly dated transclusion can
still sit in prose that makes a company the payee. This page carried one of the
fifteen transclusions recorded as debt in
`data/price-attribution-debt.json`; `addictedtoai-sng` repaid it. It was the only
one of the fifteen with no cross-row comparison at all: a single row, correct
arithmetic, simply no hedge.

**Re-derived live.** `https://openrouter.ai/api/v1/models/google/gemini-3.1-pro-preview/endpoints`
was fetched on 2026-08-31 (HTTP 200) and read per-provider. All six endpoints are
Google-operated — three on Google AI Studio, three on Google Vertex — and the
standard tier on both is $2.00/M, equal to the headline. So the figure is
Google's own today. **Nothing was withdrawn and no value changed**; the hedge is
additive and states the mechanism, which does not depend on today's coincidence.

**The current text.**

- was: The Pro tier, **priced at** X input and carrying an Artificial Analysis
  intelligence index of Z, has had no such row at all.
- now: The Pro tier, **heading at** X input — **the top listed provider's rate
  for that row rather than necessarily Google's own** — and carrying an
  Artificial Analysis intelligence index of Z, has had no such row at all.

**Also recorded:** this row is the clearest instance in the corpus of the hazard
the check does *not* model, because provider rotation cannot explain it — every
endpoint is Google's, and Google still lists the one row at three prices:
$1.00/M (`/flex`), $2.00/M (standard) and $3.60/M (`/priority`). Filed as
`addictedtoai-pfc`.
