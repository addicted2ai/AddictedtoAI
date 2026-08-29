---
job: seed-wiki-model-google-gemini-3-1-pro-preview
verdict: revise
reasons:
  - spec-violation
  - false-or-unsupported-claim
would-cite: >-
  An architect arguing against shipping on a "preview" endpoint would use
  this page as the concrete case: Gemini 3.1 Pro has carried the preview slug
  for over six months and still has no plain row, while the flash-lite and
  flash-image previews in the same generation both graduated within three
  months.
reviewer: r8-opus
date: 2026-08-28
---

Checklist: model entry, one cited source. Source re-fetched 2026-08-28; feed
arithmetic recomputed against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified:**
- https://openrouter.ai/google/gemini-3.1-pro-preview resolves and gives
  "Released Feb 19, 2026", matching the `listed_date` fact and the feed's
  `created` (2026-02-19T14:00:27Z). It shows only the preview; there is no
  non-preview listing on the page. The prose's "confirmed against the model's
  own listing today, which still shows no non-preview release" is accurate —
  I re-fetched it rather than taking the author's word.
- The catalog carries no `google/gemini-3.1-pro` row. Enumerated all nine
  `google/gemini-3.1*` rows: the three Pro rows are
  `gemini-3.1-pro-preview`, `gemini-3.1-pro-preview:batch` and
  `gemini-3.1-pro-preview-customtools`, and every one carries "preview" in
  the slug. True as stated.
- The siblings did graduate: `gemini-3.1-flash-lite-preview` (2026-03-03) →
  `gemini-3.1-flash-lite` (2026-05-07); `gemini-3.1-flash-image-preview`
  (2026-02-26) → `gemini-3.1-flash-image` (2026-06-18). Both plain rows
  exist, both in the same generation.
- All 5 transclusions resolve.

**Defect 1 — "That's 189 days ago as of this writing" (spec-violation, and
wrong today).**
2026-02-19 to 2026-08-28 is **190** days, not 189 (9 days remaining in
February — 2026 is not a leap year — plus 31+30+31+30+31 for March through
July, plus 28). Computed, not estimated. 189 would have been correct
yesterday, which is the actual problem: this is a hardcoded day-count typed
into prose over a `volatility: dated` field. It is wrong on the day it
publishes and wronger every day after, and it is exactly the class of value
the corpus binds rather than types everywhere else. Either bind it to a
build-time derivation or rewrite to something that does not decay ("since
February", "over six months").

**Defect 2 — "three separate Pro variants" is inflated.**
`gemini-3.1-pro-preview:batch` is a `:batch` billing suffix on the same
model, not a separate variant — the catalog uses that suffix identically on
`claude-opus-5:batch`, `gemini-3.6-flash:batch` and others, none of which
anyone would count as a distinct model. The honest count is one Pro model,
its batch billing tier, and a custom-tools variant. The point survives
without the inflation, since none of the rows has a non-preview form.

**Defect 3 — the second paragraph's payload is filler.**
It quotes the flash-lite and flash-image *prices* as if they demonstrated
graduation: "both eventually got a plain, non-preview row in the same
generation — {{price_input}} and {{price_input}} respectively". Those prices
are identical to their own preview rows (flash-lite 0.00000025 both;
flash-image 0.0000005 both), so they carry no information about the
graduation at all — this is enumeration without judgment, and it is
restating transcluded values in prose. The genuinely interesting change went
unmentioned: flash-image's graduation **doubled its context window**, from
65,536 on the preview to 131,072 on the plain row. That is the fact this
paragraph wanted.

The core observation is worth keeping — a top-tier model held in preview for
half a year while its cheaper siblings graduated is a real thing a person
building on the endpoint would want to know, and it is the interesting thing
about an otherwise thin row rather than padding invented to cover one. But
one of its two paragraphs currently informs nobody, and the headline number
is wrong. Revise.
