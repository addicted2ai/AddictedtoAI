---
job: seed-wiki-concept-emergence
verdict: approve
reasons: []
would-cite: >-
  Someone in a scaling-skeptic thread citing the Mirage paper as proof that
  LLM capability jumps were fabricated — this page settles that the paper
  attacks the discontinuity of the plotted curve (4 of 39 metrics, >92% under
  two scorers), not the reality of capability gains, and demonstrates the
  effect manufactured on demand in vision networks.
reviewer: r4-fable
date: 2026-08-28
---

Checklist: wiki concept entry. Sources fetched 2026-08-28.

- arxiv.org/abs/2206.07682 — the definition verbatim, both sentences: "We
  consider an ability to be emergent if it is not present in smaller models
  but is present in larger models. Thus, emergent abilities cannot be
  predicted simply by extrapolating the performance of smaller models."
  Sixteen authors, so "Wei and fifteen co-authors" is right; v1 Wed,
  15 Jun 2022, matching the timeline.
- arxiv.org/abs/2304.15004 + ar5iv — the abstract's alternative-explanation
  sentence is character-exact in the piece, including the absence of a comma:
  "nonlinear or discontinuous metrics produce apparent emergent abilities,
  whereas linear or continuous metrics produce smooth, continuous predictable
  changes in model performance"; the meta-analysis gives "emergent abilities
  appear with 4/39 metrics" and ">92% of emergent abilities appear under one
  of two metrics: Multiple Choice Grade and Exact String Match"; the induced
  vision experiments are exactly the piece's list (autoencoders on CIFAR100,
  LeNet on MNIST, autoregressive transformers on Omniglot); v1 Fri,
  28 Apr 2023, matching the timeline.
- Not independently verified: nothing material; all decisive strings were
  re-fetched today.

This entry is the exact case the review brief flagged — a piece whose payload
is a narrowing of a famous paper — and the narrowing is the paper's own: the
abstract says apparent emergence arises "due to the researcher's choice of
metric rather than due to fundamental changes in model behavior with scale",
which is precisely the line the piece holds ("What evaporates is the
discontinuity", not the capability gains). The what-survives paragraph is the
part most write-ups of the Mirage paper get wrong in one direction or the
other, and the closing question (does the same data on a continuous metric
still have a kink?) makes it portable. Approve.
