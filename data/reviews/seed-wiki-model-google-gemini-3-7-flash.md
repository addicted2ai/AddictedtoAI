---
job: seed-wiki-model-google-gemini-3-7-flash
verdict: approve
reasons: []
would-cite: >-
  A team lead defending a budget forecast that assumed 3.7 Flash and 3.6 Flash
  cost the same would lose the argument to this page: the matching rate is a
  promotional price with a published expiry, and on 1 January 2027 it doubles
  to $1.50/M input and $7.50/M output while 3.6 stays put.
reviewer: r8-opus
date: 2026-08-28
---

Checklist: model entry, one cited source. Source re-fetched 2026-08-28;
feed arithmetic recomputed against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

- https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/
  resolves, and is the launch post it is claimed to be, dated "Aug 13, 2026"
  — matching the `release_date` fact exactly.
  - Introductory pricing, verbatim: "3.7 Flash is available through the end
    of the year at an introductory price of $0.75/1M input tokens and
    $3.75/1M output tokens", with the footnote "Introductory pricing expires
    on December 31, 2026. Starting January 1, 2027, $1.50/1M input tokens and
    $7.50/1M output tokens will apply." $1.50 / $0.75 = 2 and $7.50 / $3.75
    = 2, so the fact's "regular pricing is double the introductory rate on
    input and output" is exact on both, not just input. The prose's "On 1
    January 2027 the shared price stops being shared" is the post's own date.
  - "DeepSWE at 65.3%" and "against 49.0% for the preceding Flash release":
    the post reports "65.3% vs 49.0%" for DeepSWE v1.1. Verbatim.
  - "FrontierCode at 43.6%" against "34.4%": the post reports "43.6% vs
    34.4%" for FrontierCode 1.1 Main. Verbatim. The page's claim that both
    are "already stated against the 3.6 baseline, not left for a reader to
    compute" is true — the post prints them as paired comparisons.
- Feed cross-check: `google/gemini-3.7-flash` and `google/gemini-3.6-flash`
  both list `prompt` 0.00000075 and `completion` 0.00000375 — identical, so
  "Right now, this row costs exactly what its predecessor does" holds today,
  and $0.75/M reconciles with the blog's introductory figure.
  intelligence_index 51.6 → 56 as stated.
- Minor, not defects: the post labels the benchmarks "DeepSWE v1.1" and
  "FrontierCode 1.1 Main"; the page drops the version qualifiers. And the
  price match is a base-row fact only — on the batch rows 3.7 Flash is
  already *half* of 3.6 (0.0000001875 vs 0.000000375), which the page does
  not mention and which would strengthen it.

This is the best-anchored piece in my slice, and it is the one that handles
the trap the others fell into: it states a price *relationship* ("costs
exactly what its predecessor does") and immediately pins it to a dated
snapshot with "Right now" and a sourced expiry, so the comparison cannot
quietly rot into a false timeless claim. The payload — that a listed rate a
shopper would read as a permanent position is a discount with a published
end date — is actionable and is not visible anywhere on the catalog row.
Approve.
