---
id: technique/pruning
kind: technique
display_name: "Pruning"
status: active
maintenance: stable
aliases:
  - name: "Pruning"
    class: shared
  - name: "Sparsity"
    class: shared
  - name: "One-shot pruning"
    class: shared
  - name: "SparseGPT"
    class: shared
  - name: "Wanda"
    class: manual
themes:
  - argument
facts:
  - field: one_shot_claim
    source: cited
    value: "at least 50% sparsity in one shot without any retraining at minimal loss of accuracy, and up to 60% unstructured sparsity with negligible increase in perplexity — more than 100 billion weights ignored at inference time"
    source_url: "https://arxiv.org/abs/2301.00774"
    accessed: "2026-08-28"
    volatility: dated
  - field: pruning_runtime
    source: cited
    value: "under 4.5 hours to prune OPT-175B or BLOOM-176B, the largest open models available at the time"
    source_url: "https://arxiv.org/abs/2301.00774"
    accessed: "2026-08-28"
    volatility: dated
  - field: opt_175b_perplexity
    source: cited
    value: "raw-WikiText2 perplexity for OPT-175B: 8.35 dense, 8.21 at 50% unstructured, 8.45 at 4:8 and 8.74 at 2:4"
    source_url: "https://arxiv.org/abs/2301.00774"
    accessed: "2026-08-28"
    volatility: dated
  - field: authors_hedge
    source: cited
    value: "at the very largest scale there is even a slight accuracy improvement over the dense baseline, which however seems to be dataset specific"
    source_url: "https://arxiv.org/abs/2301.00774"
    accessed: "2026-08-28"
    volatility: static
  - field: measured_speedups
    source: cited
    value: "2:4 sparsity gives roughly 1.54x-1.79x on the matrix shapes of OPT-175B on NVIDIA Ampere GPUs against a 2x theoretical ceiling; unstructured sparsity gave 1.57x, 1.82x and 2.16x end-to-end at 40%, 50% and 60% on CPU with DeepSparse"
    source_url: "https://arxiv.org/abs/2301.00774"
    accessed: "2026-08-28"
    volatility: dated
  - field: wanda_metric
    source: cited
    value: "prune the weights with the smallest magnitude multiplied by the corresponding input activation, per output — no retraining and no weight update, and the pruned model is used as is"
    source_url: "https://arxiv.org/abs/2306.11695"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2023-01-02"
    event: "SparseGPT prunes OPT-175B and BLOOM-176B in one shot, without retraining"
    source_url: "https://arxiv.org/abs/2301.00774"
  - date: "2023-06-20"
    event: "Wanda reaches comparable results from weights times activations alone, with no weight update at all"
    source_url: "https://arxiv.org/abs/2306.11695"
mentions:
  - technique/quantization
---

The claim SparseGPT made on 2023-01-02 is easy to state and was not obviously
true: {{fact:technique/pruning#one_shot_claim}}. No gradient step, no fine-tuning
run to recover, and {{fact:technique/pruning#pruning_runtime}}.

**How half a model becomes optional.** Pruning is solved one layer at a time
against a small calibration set: choose which weights in a column to drop, then
adjust the weights that remain so the layer's output on the calibration data moves
as little as possible. The compensation is where the accuracy comes from, and
Wanda's contribution in June was to show how much of it you can skip —
{{fact:technique/pruning#wanda_metric}} — while still performing competitively
against the methods that do the intensive weight update. Its motivation is the
observation of emergent large-magnitude features in these models: a weight's
importance is approximated well enough by its own size times the size of what it
multiplies.

**The number that gets misread.** The measurement on the largest model is
{{fact:technique/pruning#opt_175b_perplexity}}. Half the weights removed, and
perplexity slightly *better* than dense. The authors do not lean on it, and the
caution is theirs, not a reviewer's:
{{fact:technique/pruning#authors_hedge}}.

**The pattern that keeps quality is the one silicon ignores.** Read the same table
in the other direction and the ordering is uncomfortable. The best result comes
from unstructured sparsity, where a zero may sit anywhere — and a dense matrix
multiply does not run faster because some of its inputs are zero. The pattern
hardware does accelerate is 2:4, two non-zeros in every group of four, supported
from NVIDIA's Ampere generation onward, and 2:4 is the worst row in the table. The
delivered speed is smaller than the pattern promises, too:
{{fact:technique/pruning#measured_speedups}}. Note where the larger end-to-end
gains in that figure come from — a CPU inference engine, not the accelerators
these models are served on.

So there are two honest sentences about pruning a large language model, and they
are usually merged into one dishonest one. Half the weights can be removed with
almost no measurable quality cost. Removing them makes the model smaller, and
makes it meaningfully faster only in the arrangement that costs the most quality,
on hardware that supports that arrangement.
