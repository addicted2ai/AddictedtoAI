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
  verbatim). The transcluded `tool/vllm` fact, **as it read on the date of
  this review**, was "ten proposer methods, including EAGLE, MTP, draft
  models, PARD, n-gram and suffix decoding", and this review recorded it as
  matching the page. The body's "several of which ... use no neural draft at
  all" holds for n-gram and suffix decoding, and still does.

  **Superseded 2026-08-29 by `addictedtoai-4nq`, recorded here rather than
  overwritten (`addictedtoai-hul`).** The count was withdrawn: the docs page
  publishes no count at all — in 622,789 bytes, "proposer methods" occurs 0
  times, "ten" 0 times and "twelve" 0 times, and the page's own two lists
  disagree (12 bullet items against 10 table rows). The fact now reads "a
  range of speculation methods, model-based ones such as EAGLE, MTP, draft
  models, PARD and MLP alongside simpler ones such as n-gram and suffix
  decoding" — no number, which is what the source supports. So the "matches"
  verdict above was true of the value it was given and is not true of the
  value that ships today; the sentence in the entry that hosts the
  transclusion still reads correctly with the new value, checked at the time.
  This is a record-accuracy correction, not a content defect.

  The original wording is left standing above rather than edited away,
  because a review record is a dated account of what a reviewer concluded
  and rewriting it would destroy the only evidence that the count was ever
  asserted — which is precisely the thing `4nq` needed in order to withdraw
  it.

**Also checked:** the acceptance rule min(1, p/q) with resampling from the
normalized residual max(0, p - q) is the papers' actual algorithm;
transclusions resolve; mentions resolve; aliases sane; no volatile
literals.

The piece knows exactly which mistake its reader is about to make (quality
loss; headline multiples) and heads off both with sourced numbers.
Approve.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, no change

All five sources re-fetched to disk and every quoted string re-matched
literally. This entry's exposure was the arithmetic-across-rows class — its
central contrast sets 6.5x against 1.38x — so both operands were checked in
the same document.

- arxiv.org/abs/2211.17192 (41,908 bytes): "[Submitted on 30 Nov 2022";
  authors Yaniv Leviathan, Matan Kalman, Yossi Matias; "without changing the
  distribution"; "a 2X-3X acceleration compared to the standard T5X
  implementation, with identical outputs".
- arxiv.org/abs/2302.01318 (40,250 bytes): "[Submitted on 2 Feb 2023"; all
  six authors including John Jumper; "a novel modified rejection sampling
  scheme which preserves the distribution of the target model within
  hardware numerics"; "achieving a 2-2.5x decoding speedup in a distributed
  setup". False-absence note: the literal "Chinchilla 70B" is **not** on the
  page — it reads "with Chinchilla, a 70 billion parameter language model".
  A format variant, not a defect; the `reported_speedup_chinchilla` fact is
  supported.
- arxiv.org/abs/2401.10774 (45,392 bytes): "[Submitted on 19 Jan 2024";
  "adding extra decoding heads"; "Using a tree-based attention mechanism";
  "Medusa-1 can achieve over 2.2x speedup". The body's claim that Medusa
  "names explicitly" the weight-movement bottleneck is the paper's own
  sentence: "each step necessitates moving the full model parameters from
  High-Bandwidth Memory (HBM) to the accelerator's cache".
- arxiv.org/abs/2503.01840 (42,071 bytes): "[Submitted on 3 Mar 2025";
  "abandons feature prediction in favor of direct token prediction"; and
  **both operands of the contrast in one sentence** — "EAGLE-3 achieves a
  speedup ratio up to 6.5x, with about 1.4x improvement over EAGLE-2. In the
  SGLang framework, EAGLE-3 achieves a 1.38x throughput improvement at a
  batch size of 64." Same paper, same abstract; the comparison cannot invert
  on a mis-read operand.
- docs.vllm.ai speculative decoding page (622,789 bytes): "Speculative
  decoding sampling is theoretically lossless up to the precision limits of
  hardware numerics" (the `numerics_caveat` fact) and "Real gains depend on
  your model family, traffic pattern, hardware, and sampling settings" (the
  body's closing quote), both verbatim. The body's "several of which,
  n-gram and suffix decoding among them, use no neural draft at all" is
  supported by the page's own contrast: "Model-based methods such as EAGLE,
  MTP, draft models, PARD and MLP provide the best latency reduction, while
  simpler methods such as n-gram and suffix decoding provide modest speedups
  without increasing workload during peak traffic."

Outside this slice, so reported rather than touched: the transcluded
`tool/vllm#speculative_decoding_methods` fact **said, on 2026-08-28**, "ten
proposer methods". *(It no longer does — the count was withdrawn on 2026-08-29
by `addictedtoai-4nq`. The paragraph below is the finding that prompted the
withdrawal, and is left as written.)*
The page's current list reads EAGLE, MTP, Draft Model, PARD, MLP, N-Gram,
Suffix Decoding, Hidden State Extraction, Custom Proposer Backend
(Experimental), then Dynamic Speculative Decoding, Adaptive Verification and
Per-Request Acceptance Metrics — so the count lands between nine and twelve
depending on whether the trailing three are read as proposers or as features
of the feature. Defensible as written; not a finding, but the next editor of
`content/wiki/tool/vllm.md` should know the boundary is soft.

No claim in this entry required correction.
