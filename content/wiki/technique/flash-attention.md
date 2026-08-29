---
id: technique/flash-attention
kind: technique
display_name: "FlashAttention"
status: active
maintenance: stable
aliases:
  - name: "FlashAttention"
    class: shared
  - name: "Flash attention"
    class: shared
  - name: "IO-aware attention"
    class: shared
facts:
  - field: first_published
    source: cited
    value: "2022-05-27"
    source_url: "https://arxiv.org/abs/2205.14135"
    accessed: "2026-08-28"
    volatility: dated
  - field: approximation
    source: cited
    value: "exact attention — the same output as the standard implementation, reached with fewer reads and writes between high-bandwidth memory and on-chip SRAM"
    source_url: "https://arxiv.org/abs/2205.14135"
    accessed: "2026-08-28"
    volatility: static
  - field: reported_training_speedups
    source: cited
    value: "15% end-to-end against the MLPerf 1.1 training speed record on BERT-large at sequence length 512, 3x on GPT-2 at 1K, and 2.4x on Long Range Arena at 1K-4K"
    source_url: "https://arxiv.org/abs/2205.14135"
    accessed: "2026-08-28"
    volatility: dated
  - field: long_sequence_results
    source: cited
    value: "61.4% on Path-X at sequence length 16K and 63.1% on Path-256 at 64K — the first transformers above chance on either"
    source_url: "https://arxiv.org/abs/2205.14135"
    accessed: "2026-08-28"
    volatility: dated
  - field: v1_measured_utilization
    source: cited
    value: "25-40% of theoretical maximum FLOPs/s"
    source_url: "https://arxiv.org/abs/2307.08691"
    accessed: "2026-08-28"
    volatility: dated
  - field: v2_measured_utilization
    source: cited
    value: "around 2x FlashAttention, at 50-73% of theoretical maximum FLOPs/s on A100 and up to 225 TFLOPs/s per GPU end-to-end, 72% model FLOPs utilization"
    source_url: "https://arxiv.org/abs/2307.08691"
    accessed: "2026-08-28"
    volatility: dated
  - field: v2_utilization_on_hopper
    source: cited
    value: "35% utilization on the H100 GPU"
    source_url: "https://arxiv.org/abs/2407.08608"
    accessed: "2026-08-28"
    volatility: dated
  - field: v3_measured_utilization
    source: cited
    value: "1.5-2.0x over FlashAttention-2 on H100, up to 740 TFLOPs/s in FP16 at 75% utilization, and close to 1.2 PFLOPs/s in FP8"
    source_url: "https://arxiv.org/abs/2407.08608"
    accessed: "2026-08-28"
    volatility: dated
  - field: fp8_numerical_error
    source: cited
    value: "2.6x lower numerical error than a baseline FP8 attention"
    source_url: "https://arxiv.org/abs/2407.08608"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2022-05-27"
    event: "FlashAttention published by Dao, Fu, Ermon, Rudra and Ré"
    source_url: "https://arxiv.org/abs/2205.14135"
  - date: "2023-07-17"
    event: "FlashAttention-2 rewrites the work partitioning across thread blocks and warps"
    source_url: "https://arxiv.org/abs/2307.08691"
  - date: "2024-07-11"
    event: "FlashAttention-3 targets Hopper asynchrony and FP8"
    source_url: "https://arxiv.org/abs/2407.08608"
mentions:
  - concept/kv-cache
  - technique/quantization
---

Attention is quadratic in sequence length, and the standard implementation pays
that cost twice — once in arithmetic, and once in memory traffic, writing the
full score matrix out to high-bandwidth memory and reading it back to normalize
it. FlashAttention's argument is that the traffic dominates, and that removing it
costs nothing in quality: {{fact:technique/flash-attention#approximation}}.

**The mechanism.** Blocks of queries, keys and values are loaded into on-chip
SRAM, scored there, and combined with a running softmax normalizer carried from
block to block, so the full score matrix never exists in HBM at all. The backward
pass recomputes scores from the saved normalizing statistics instead of reading
them back — recomputation is arithmetic, and arithmetic was never the constraint.
That is the whole idea: the algorithm does *more* floating-point work than the
standard one and finishes sooner.

This is why the paper's title says *exact*. The line of work it displaced —
sparse and low-rank attention approximations — traded quality for asymptotics and
frequently failed to produce wall-clock gains at all. FlashAttention changed the
memory hierarchy, not the mathematics, and the reported training results were
{{fact:technique/flash-attention#reported_training_speedups}}. Longer sequences
also became reachable rather than merely cheaper:
{{fact:technique/flash-attention#long_sequence_results}}.

**What the headline speedups are measured against.** Each release states the
previous one's inefficiency plainly, and the numbers are larger than the
technique's reputation suggests. FlashAttention-2 opens by reporting that
FlashAttention itself reached only
{{fact:technique/flash-attention#v1_measured_utilization}} — a kernel famous for
making attention fast was leaving most of the machine idle, and the fix was work
partitioning between thread blocks and warps, not a new algorithm. The rewrite
delivered {{fact:technique/flash-attention#v2_measured_utilization}}.

One hardware generation later the same sentence is written about the fix.
FlashAttention-3 opens by reporting FlashAttention-2 at
{{fact:technique/flash-attention#v2_utilization_on_hopper}}, because it does not
use Hopper's asynchronous tensor cores or its FP8 support, and reports
{{fact:technique/flash-attention#v3_measured_utilization}}. Its FP8 path is worth
separating from the FP16 one: low precision is a quality claim, and the paper
makes a measured one — {{fact:technique/flash-attention#fp8_numerical_error}},
attributed to block quantization and incoherent processing rather than to the
scheduling work.

The pattern across three papers is the useful part. An attention kernel is not
fast or slow in the abstract; it is fast on the chip it was tuned for, and its
measured utilization falls by roughly half when the next chip arrives. The
speedup a version reports is mostly the size of the gap the previous version left
on that generation's silicon.
