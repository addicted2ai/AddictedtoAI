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

## Recheck 2026-08-29 (addictedtoai-flh) — holds, verdict unchanged

**Start with the trap, because this entry contains a quotation that looks
like an arithmetic error and is not one.** The entry quotes Besiroglu et al.
as saying reproduction "would need to have access to the results from nearly
240x2116=600,000 training runs". 240 x 2116 = 507,840, not 600,000, so a
recheck is very likely to flag this and "fix" it. **Do not.** The paper says
it. From `arxiv.org/html/2404.10102v2` (144,194 B), verbatim: "That means
that we would need to have access to the results from nearly 240 x 2116 =
600,000 training runs to obtain a confidence interval as tight as that
reported by Hoffmann et al." The entry is quoting faithfully, including the
source's own slip. Correcting the arithmetic would make the quotation false.

Note also that the *abstract* does not contain that sentence — it says
"intervals this narrow would require over 600,000 experiments, while they
likely only ran fewer than 500". The quoted form is in the body, and so is
the entry's other quoted fragment: "we interpret this to mean they likely had
between 400 and 500 data points" — verbatim, and narrower than the
abstract's "fewer than 500", which is why the body is the right citation.

The Huber-loss cause is the paper's own, not the entry's inference: "One of
the lead authors of Hoffmann et al., (2022) has clarified that the reason
behind the low standard errors was a high loss scale in their L-BFGS-B
minimizer resulting from them averaging Huber loss values over examples
instead of summing them ( Borgeaud, (2024) ). This caused early termination
of the optimization process, both during the original model fit and during
bootstrapping. The early stopping of loss minimization during bootstrapping
resulted in little movement of the parameter values from their
initialization". Every clause of the entry's sentence maps onto that,
including "near their initialisation". And "the headline rule survived" is
the abstract's own finding: "our rederivation of the scaling law using the
third approach yields results that are compatible with the findings from the
first two estimation procedures".

Kaplan (43,049 B, "[Submitted on 23 Jan 2020]"): both quotations verbatim —
"scales as a power-law with model size, dataset size, and the amount of
compute used for training, with some trends spanning more than seven orders
of magnitude" and "optimally compute-efficient training involves training
very large models on a relatively modest amount of data and stopping
significantly before convergence".

Hoffmann (44,600 B, "[Submitted on 29 Mar 2022]"): "over 400 language models
ranging from 70 million to over 16 billion parameters on 5 to 500 billion
tokens" and "for every doubling of model size the number of training tokens
should also be doubled", both verbatim; and the four-model list is the
abstract's own — "Chinchilla uniformly and significantly outperforms Gopher
(280B), GPT-3 (175B), Jurassic-1 (178B), and Megatron-Turing NLG (530B)".
The entry's "four models each larger than the one that beat them" is
arithmetic on Chinchilla's 70B: 280, 175, 178 and 530 all exceed it. A search
for `4 times more` returns ABSENT — the abstract writes `4$\times$ more more
data` (with the source's duplicated "more"); the entry's "four times Gopher's
data" is right and the absence is a LaTeX artefact.

Porian (42,010 B, "[Submitted on 27 Jun 2024]"): "identifying three factors
causing the difference: last layer computational cost, warmup duration, and
scale-dependent optimizer tuning", plus "tuning the AdamW $\beta_2$ parameter
is essential at lower batch sizes" and the two datasets, OpenWebText2 and
RefinedWeb. The entry's three corrections map one-to-one. The per-factor
directions remain an abstract-level match, as round one said.

LLaMA: the inference-cost sentence is verbatim in the full text — "although
it may be cheaper to train a large model to reach a certain level of
performance, a smaller one trained longer will ultimately be cheaper at
inference" — and both token counts appear ("1.4T tokens", "1T tokens").
abs/2302.13971 is "[Submitted on 27 Feb 2023]".
