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
