---
job: seed-wiki-technique-pruning
verdict: approve
reasons: []
would-cite: >-
  The person promising "prune half the weights, get 2x speed" gets the
  uncomfortable table: SparseGPT's quality-preserving pattern (unstructured,
  8.21 perplexity, better than dense) is the one silicon ignores, the
  accelerated 2:4 pattern is the worst row at 8.74, and delivered GPU speedup
  is 1.54-1.79x against the 2x ceiling.
reviewer: r5-fable
date: 2026-08-28
---

Checklist: wiki technique entry. Sources fetched 2026-08-28.

- arxiv.org/abs/2301.00774 (v1: 2 Jan 2023, matching the piece's 2023-01-02;
  fetched abstract and full text via ar5iv): "pruned to at least 50% sparsity
  in one-shot, without any retraining, at minimal loss of accuracy" and "can
  reach 60% unstructured sparsity with negligible increase in perplexity:
  remarkably, more than 100 billion weights from these models can be ignored
  at inference time" — verbatim. "in under 4.5 hours" for OPT-175B/BLOOM-176B,
  described by the paper as "the largest available open-source models" —
  verbatim. The OPT-175B raw-WikiText2 row matches exactly: 8.35 dense, 8.21
  at 50% unstructured, 8.45 at 4:8, 8.74 at 2:4 — so the piece's two flagged
  claims hold: 2:4 really is the worst of the three sparsity patterns, and
  the hedge really is the authors' own, verbatim: "at the very largest scale
  there is even a slight accuracy improvement over the dense baseline, which
  however seems to be dataset specific". Speedups confirmed: 1.54x-1.79x for
  2:4 on Ampere, and DeepSparse CPU 1.57x / 1.82x / 2.16x at 40/50/60%.
- arxiv.org/abs/2306.11695 (v1: 20 Jun 2023): Wanda abstract verbatim —
  "prunes weights with the smallest magnitudes multiplied by the
  corresponding input activations, on a per-output basis", "requires no
  retraining or weight update, and the pruned LLM can be used as is",
  "Motivated by the recent observation of emergent large magnitude features",
  "performs competitively against recent method involving intensive weight
  update". The wanda_metric fact and the motivation sentence in the body are
  both exact.
- One caveat for a future editor, not a defect: the CPU DeepSparse speedups
  were measured on OPT-2.7B, not the 175B model; the fact does not name a
  model, so nothing stated is wrong, but a reader could over-generalize.

This is the slice's best demonstration of the site's editorial move done
right: both flagged claims survived re-fetching verbatim, and the closing
observation — that the honest pair of sentences is usually merged into one
dishonest one — is exactly what the table shows. The quality-vs-acceleration
inversion is something most enthusiasts have not seen stated. Approve.
