---
job: seed-technique-speculative-decoding
verdict: approve
reasons: []
would-cite: >-
  Someone correcting the claim that speculative decoding trades quality for
  speed would link the guarantee section — both original papers quoted on
  exact distribution preservation; and the 6.5x-versus-1.38x split between
  single-stream and batched throughput is the citation for anyone arguing a
  headline speedup will not survive production batch sizes.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. All five cited sources fetched.

**Verified by fetching:**
- arxiv.org/abs/2211.17192 (submitted 30 Nov 2022; Leviathan, Kalman,
  Matias) — "make exact decoding from the large models faster ... without
  changing the distribution"; "2X-3X acceleration compared to the standard
  T5X implementation" on T5-XXL. Dates, authors, both quotes exact.
- arxiv.org/abs/2302.01318 (submitted 2 Feb 2023; Chen, Borgeaud, Irving,
  Lespiau, Sifre, Jumper) — "a novel modified rejection sampling scheme
  which preserves the distribution of the target model within hardware
  numerics"; "2-2.5x decoding speedup in a distributed setup" on
  Chinchilla 70B. All exact, including the six author names in the
  timeline.
- arxiv.org/abs/2401.10774 (Medusa, submitted 19 Jan 2024) — extra decoding
  heads plus tree-based candidate verification; "Medusa-1 can achieve over
  2.2x speedup"; and the body's hardware framing is the paper's own: "each
  step necessitates moving the full model parameters from High-Bandwidth
  Memory (HBM) to the accelerator's cache" — "the bottleneck Medusa names
  explicitly" is accurate.
- arxiv.org/abs/2503.01840 (EAGLE-3, submitted 3 Mar 2025) — "abandons
  feature prediction in favor of direct token prediction"; "speedup ratio
  up to 6.5x"; "1.38x throughput improvement at a batch size of 64" in
  SGLang. The body's central contrast quotes the same paper's own two
  numbers, which is the honest way to make the latency-versus-throughput
  point.
- docs.vllm.ai speculative decoding page — "theoretically lossless up to
  the precision limits of hardware numerics" (the numerics_caveat fact,
  near-verbatim) and "Real gains depend on your model family, traffic
  pattern, hardware, and sampling settings" (the body's closing quote,
  verbatim). The page documents ten proposer methods including N-Gram and
  Suffix Decoding — the transcluded tool/vllm fact ("ten proposer methods,
  including EAGLE, MTP, draft models, PARD, n-gram and suffix decoding")
  matches, and the body's "several of which ... use no neural draft at
  all" holds for n-gram and suffix decoding.

**Also checked:** the acceptance rule min(1, p/q) with resampling from the
normalized residual max(0, p - q) is the papers' actual algorithm;
transclusions resolve; mentions resolve; aliases sane; no volatile
literals.

The piece knows exactly which mistake its reader is about to make (quality
loss; headline multiples) and heads off both with sourced numbers.
Approve.
