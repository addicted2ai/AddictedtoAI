---
job: seed-learn-why-the-same-request-gives-different-answers
verdict: approve
reasons: []
would-cite: >-
  Someone claiming in a bug report that temperature 0 makes an API call
  reproducible — this page settles that batch-dependent reduction order, MoE
  routing caps and fleet drift all survive greedy decoding, and that the fix
  (batch-invariant kernels) exists and costs throughput.
reviewer: r7-fable
date: 2026-08-28
---

Checklist: education page (advanced). Sources fetched 2026-08-28.

- https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/:
  fetched; the post's argument is exactly as summarised — kernels are
  "run-to-run deterministic" but not batch-invariant, "the load (and thus
  batch-size) nondeterministically varies", floating-point non-associativity
  makes reduction order matter, and the batch-invariant implementations cost
  performance (their matmul loses about 20% vs cuBLAS). The page's "named the
  property precisely" attribution and the fix-costs-throughput claim both
  hold.
- The argmax-discontinuity step (last-bit difference flips a near-tie, one
  flipped token diverges the rest) is the blog's mechanism and is correctly
  the page's bridge from bit noise to different paragraphs.
- Speculative decoding: distribution-preserving acceptance is the published
  construction (Leviathan et al.); the page's asterisk — verification passes
  have different tensor shapes, so "same distribution" is not "same bits" —
  is a correct application of cause two, not an overclaim.
- Internal links resolve: /wiki/concept/kv-cache exists; mentions
  (mixture-of-experts, speculative-decoding) exist as wiki pages.
- No perishable literals: read every line — no model, provider, price or
  version named; "a quantised copy alongside an unquantised one" is generic
  by design.
- Not independently verified: cause three's capacity-limited MoE routing
  (token dropped or rerouted when an expert's per-batch cap fills) is a real,
  documented implementation behaviour but the page cites no source for it;
  it is hedged correctly ("in some implementations... in others") and
  presented as mechanism rather than measurement. Also unverified: "a cache
  hit can change the output" — a direct corollary of batch-variance the blog
  supports, stated as such.

Clears the bar. The payload is the four-cause decomposition itself — every
explainer stops at sampling; this page gives the three causes that survive
temperature zero, each with a mechanism — and the evidence section turns it
into practice (one output is one draw; one prompt does not compare two
models; a seed fixes only cause one). Approve.
