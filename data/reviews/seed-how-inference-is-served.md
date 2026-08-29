---
job: seed-how-inference-is-served
verdict: approve
reasons: []
would-cite: >-
  Anyone asked why output tokens cost more than input, or why prompt caching
  needs a byte-identical prefix — the prefill/decode asymmetry here answers
  both mechanistically, vendor-free.
reviewer: seed-review-6.5
date: 2026-08-28
---

Checklist: education page.

- **No perishable literals**: full-text check — no vendor names, no prices,
  no model names, no hardware SKUs, no rates. Remarkable for a page about
  pricing; it derives the billing asymmetry from hardware character rather
  than quoting any tariff, which is exactly what the education-static spec
  wants.
- **Mechanism claims checked**: prefill compute-bound / decode
  memory-bandwidth-bound is the correct standard characterization; the KV
  cache description (what is stored, why byte-identical prefixes are
  required — each position's entries depend on everything before it, why
  savings land on input only) is accurate; continuous batching is correctly
  described; TTFT vs inter-token latency decomposition is right, including
  which optimisations move which number; quantisation's
  fewer-bytes-per-token reasoning is correct; speculative decoding's
  same-distribution guarantee is real (the accept/reject scheme preserves
  the target distribution) and correctly framed as speed-not-quality;
  grouped/multi-query attention as "less cache per token" is correct;
  quadratic prefill vs linear cache growth is correct and the two long-input
  cost shapes are properly separated.
- **Prerequisites and outcome honest**: assumes the token-loop page and the
  training page (weights as fixed artifact, adapters) — both declared; the
  outcome statement matches the content precisely, including "which of the
  two latency numbers a given optimisation improves".
- **Beats the obvious alternative**: the reader's alternative is vendor
  pricing docs (which state rates, not reasons) or scattered engineering
  blog posts. One page that derives pricing, caching, batching and latency
  behavior from a single asymmetry is an assembly that did not previously
  exist for this reader.
- Cut list: clean; the level tag `advanced` is honest.

Approve.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, no change

This page has no citable literal to re-fetch, so the recheck took the two
forms that can actually falsify it.

- **The no-perishable-literals claim, re-measured rather than re-asserted.**
  A regex sweep for `[0-9]|\$|OpenAI|Anthropic|Google|NVIDIA|GPT|Claude|
  Gemini|Llama|H100|A100` over the whole file returns **zero matches**. Not
  a digit, not a currency symbol, not a vendor or model or SKU name anywhere
  in 126 lines. Round one's "remarkable for a page about pricing" was
  literally true.
- **Superlative sweep.** A case-insensitive search for "the only / the first
  / zero exceptions / no other / every / always / never / all of / nobody /
  anyone / none" returns nine hits, and every one is a mechanism
  quantifier — "every position runs at once", "every layer and every
  attention head", "every position is compared against every other". There
  is no empirical superlative about the world for a source to contradict,
  which is why this page has no exposure to the defect class that produced
  addictedtoai-flh.
- **The one mechanism claim with an external check available** is
  speculative decoding's same-distribution guarantee. Verified against the
  primary papers while rechecking `technique/speculative-decoding` in the
  same pass: arxiv 2211.17192 "without changing the distribution" and arxiv
  2302.01318 "preserves the distribution of the target model within hardware
  numerics". The page states it without the hardware-numerics qualifier
  ("the accepted output is drawn from the same distribution the large model
  would have produced alone"), which is the standard statement of the
  guarantee and is carried with its caveat on the wiki entry this page's
  reader is pointed at. Noted, deliberately not corrected: qualifying it
  here would cost more than it buys on a page whose job is the asymmetry.

No claim in this page required correction.
