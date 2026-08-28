---
job: seed-scaling-laws
verdict: approve
reasons: []
would-cite: >-
  A person citing "the scaling laws" to settle a training-budget argument —
  linkable precisely for separating the power law (held), the Chinchilla fit
  (broken in a checkable way, with the Huber-loss cause), and the objective
  (moved with LLaMA).
reviewer: seed-review-6.5
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched 2026-08-28, quotations checked
verbatim.

- arXiv abs/2001.08361: v1 23 Jan 2020; abstract contains both quoted
  strings ("scales as a power-law with model size, dataset size, and the
  amount of compute used for training, with some trends spanning more than
  seven orders of magnitude"; "optimally compute-efficient training involves
  training very large models on a relatively modest amount of data and
  stopping significantly before convergence").
- GPT-3 caption: verified by direct substring search against ar5iv
  2005.14165 — "based on the analysis in scaling laws for neural language
  models [57] we train much larger models on many fewer tokens than is
  typical" (Figure 2.2's caption). The entry's quotation is exact.
- arXiv abs/2203.15556: v1 29 Mar 2022; abstract carries "over 400 language
  models ranging from 70 million to over 16 billion parameters ... 5 to 500
  billion tokens", the equal-scaling sentence verbatim, and "Chinchilla
  uniformly and significantly outperforms Gopher (280B), GPT-3 (175B),
  Jurassic-1 (178B), and Megatron-Turing NLG (530B)" — the four-larger-models
  list is the abstract's own.
- ar5iv 2404.10102 (Besiroglu et al., v1 15 Apr 2024): the paper contains
  verbatim "we would need to have access to the results from nearly
  240×2116=600,000 training runs" and "likely had between 400 and 500 data
  points", and — the part I most expected to be secondhand — the
  Huber-loss cause is in the cited paper itself: "the authors of Hoffmann
  et al. have confirmed this is because they averaged the Huber loss values
  over different data points instead of summing them ... caused their
  optimization to terminate early." The entry's account of the correction is
  the source's own.
- ar5iv 2302.13971 (LLaMA): direct substring search found the inference-cost
  sentence exactly as quoted ("although it may be cheaper to train a large
  model to reach a certain level of performance, a smaller one trained
  longer will ultimately be cheaper at inference"); smallest model 1.0T
  tokens, largest 1.4T — the entry's numbers match.
- arXiv abs/2406.19146 (Porian et al., v1 27 Jun 2024): abstract attributes
  the discrepancy to exactly three factors — "last layer computational cost,
  warmup duration, and scale-dependent optimizer tuning" — matching the
  entry's three corrections. The per-factor directions given in the entry
  are the paper's (abstract-level match; directions not contradicted
  anywhere I could check).

No volatile literals; every date explicit; the closing three-way split is
earned by the checked record rather than asserted. This is the strongest of
the six entries. Approve.
