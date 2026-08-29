---
id: technique/low-rank-adaptation
kind: technique
display_name: "Low-Rank Adaptation"
status: active
maintenance: stable
aliases:
  - name: "Low-Rank Adaptation"
    class: exclusive
  - name: "LoRA"
    class: manual
  - name: "QLoRA"
    class: manual
  - name: "Low-rank adapters"
    class: shared
themes:
  - argument
facts:
  - field: first_published
    source: cited
    value: "2021-06-17"
    source_url: "https://arxiv.org/abs/2106.09685"
    accessed: "2026-08-28"
    volatility: dated
  - field: reported_savings
    source: cited
    value: "10,000x fewer trainable parameters and 3x less GPU memory than fine-tuning GPT-3 175B with Adam"
    source_url: "https://arxiv.org/abs/2106.09685"
    accessed: "2026-08-28"
    volatility: dated
  - field: measured_footprint
    source: cited
    value: "checkpoint 350GB to 35MB, training VRAM 1.2TB to 350GB, and a 25% training speedup on GPT-3 175B"
    source_url: "https://arxiv.org/abs/2106.09685"
    accessed: "2026-08-28"
    volatility: dated
  - field: sufficient_rank
    source: cited
    value: "a rank as small as one sufficed for adapting the query and value projections on the datasets tested"
    source_url: "https://arxiv.org/abs/2106.09685"
    accessed: "2026-08-28"
    volatility: dated
  - field: batching_limitation
    source: cited
    value: "it is not straightforward to batch inputs to different tasks with different adapters in one forward pass, if the adapter is absorbed into the weights to eliminate the added latency"
    source_url: "https://arxiv.org/abs/2106.09685"
    accessed: "2026-08-28"
    volatility: static
  - field: qlora_footprint
    source: cited
    value: "a 65B model finetuned on a single 48GB GPU while preserving 16-bit finetuning task performance"
    source_url: "https://arxiv.org/abs/2305.14314"
    accessed: "2026-08-28"
    volatility: dated
  - field: qlora_result
    source: cited
    value: "Guanaco reached 99.3% of the performance level of ChatGPT on the Vicuna benchmark after 24 hours of finetuning on one GPU"
    source_url: "https://arxiv.org/abs/2305.14314"
    accessed: "2026-08-28"
    volatility: dated
  - field: controlled_comparison
    source: cited
    value: "in the standard low-rank settings LoRA substantially underperforms full finetuning on programming and mathematics, across instruction finetuning of roughly 100K prompt-response pairs and continued pretraining of 20B unstructured tokens"
    source_url: "https://arxiv.org/abs/2405.09673"
    accessed: "2026-08-28"
    volatility: dated
  - field: learned_rank_gap
    source: cited
    value: "full finetuning learns perturbations with a rank 10-100x greater than typical LoRA configurations"
    source_url: "https://arxiv.org/abs/2405.09673"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2021-06-17"
    event: "LoRA published by Hu, Shen, Wallis, Allen-Zhu, Li, Wang, Wang and Chen at Microsoft"
    source_url: "https://arxiv.org/abs/2106.09685"
  - date: "2023-05-23"
    event: "QLoRA adds 4-bit NormalFloat, double quantization and paged optimizers, putting 65B finetuning on one consumer-class card"
    source_url: "https://arxiv.org/abs/2305.14314"
  - date: "2024-05-15"
    event: "a controlled comparison finds LoRA substantially behind full finetuning on code and maths, and better at not forgetting"
    source_url: "https://arxiv.org/abs/2405.09673"
mentions:
  - technique/quantization
  - tool/unsloth
---

Freeze the pretrained weight matrix and learn a rank-decomposed update beside it:
two thin matrices whose product has the shape of the weight but a tiny fraction of
its parameters. The bet is that adaptation to a downstream task has low intrinsic
rank, and the paper's own ablation is the evidence —
{{fact:technique/low-rank-adaptation#sufficient_rank}}.

**What that buys.** Against full fine-tuning of GPT-3 175B with Adam, the paper
reports {{fact:technique/low-rank-adaptation#reported_savings}}, and the concrete
form of it is the number that changed practice:
{{fact:technique/low-rank-adaptation#measured_footprint}}. A per-task artifact
that fits in email rather than in a datacenter is what made serving hundreds of
fine-tunes of one base model an ordinary thing to do.

**The zero-latency claim has a condition.** LoRA adds no inference latency because
the update can be folded into the frozen weight before serving — the served matrix
is just a matrix again. That is also the trade: the paper's own limitations note
that {{fact:technique/low-rank-adaptation#batching_limitation}}. You can have
merged weights and no overhead, or unmerged adapters and mixed-task batching, and
serving stacks that offer many adapters at once are paying for the second.

**QLoRA moved the floor.** Dettmers and colleagues (2023-05-23) backpropagated
through a frozen 4-bit base model into the adapters, with three memory tricks —
NormalFloat, quantizing the quantization constants, and paged optimizer states —
and reported {{fact:technique/low-rank-adaptation#qlora_footprint}}. Their
demonstration model was the headline: {{fact:technique/low-rank-adaptation#qlora_result}}.

**Where the original claim does not hold.** LoRA's abstract says it performs
on-par or better than fine-tuning; that was measured on RoBERTa, DeBERTa, GPT-2
and GPT-3 adapting to tasks close to what they already knew. Biderman and
colleagues (2024-05-15) asked the harder question — teaching a model a domain it
does not have — and report that
{{fact:technique/low-rank-adaptation#controlled_comparison}}. Their explanation is
mechanical rather than rhetorical:
{{fact:technique/low-rank-adaptation#learned_rank_gap}}. The update genuinely is
low-rank; the learning is not.

The same study found the mirror of that result. LoRA holds on to the base model's
abilities outside the target domain better than full fine-tuning does, and better
than weight decay or dropout, while keeping generations more diverse. So the
honest summary is not "cheaper and just as good". It is that constraining the
update to low rank acts as a strong regularizer: less is learned, and less is
destroyed, and which of those matters depends on whether the job is to adjust a
model's behaviour or to give it a new subject.
