---
job: seed-wiki-technique-flash-attention
verdict: approve
reasons: []
would-cite: >-
  The person insisting FlashAttention trades accuracy for speed, or that a
  famous kernel is finished software, gets both corrections here: the papers
  say "exact", and each release's own abstract rates its predecessor at
  25-40% of peak, then 35% on H100 — the speedups are the size of the gap
  the last version left.
reviewer: r5-fable
date: 2026-08-28
---

Checklist: wiki technique entry. Sources fetched 2026-08-28.

- arxiv.org/abs/2205.14135 (v1: 27 May 2022, matching first_published and the
  timeline): abstract confirmed verbatim — "IO-aware exact attention algorithm
  that uses tiling to reduce the number of memory reads/writes between GPU high
  bandwidth memory (HBM) and GPU on-chip SRAM"; "15% end-to-end wall-clock
  speedup on BERT-large (seq. length 512) compared to the MLPerf 1.1 training
  speed record, 3x speedup on GPT-2 (seq. length 1K), and 2.4x speedup on
  long-range arena (seq. length 1K-4K)"; "the first Transformers to achieve
  better-than-chance performance on the Path-X challenge (seq. length 16K,
  61.4% accuracy) and Path-256 (seq. length 64K, 63.1% accuracy)". All four
  fact blocks sourced here are exact.
- arxiv.org/abs/2307.08691 (v1: 17 Jul 2023, matching the timeline): the
  load-bearing self-report is verbatim — "reaching only 25-40% of the
  theoretical maximum FLOPs/s" — and the cause is stated as "suboptimal work
  partitioning between different thread blocks and warps", exactly the piece's
  framing. "around 2x speedup", "50-73% of the theoretical maximum FLOPs/s on
  A100", "up to 225 TFLOPs/s per A100 GPU (72% model FLOPs utilization)" all
  verbatim.
- arxiv.org/abs/2407.08608 (v1: 11 Jul 2024, matching the timeline):
  "FlashAttention-2 achieving only 35% utilization on the H100 GPU",
  "1.5-2.0x with FP16 reaching up to 740 TFLOPs/s (75% utilization)", "with
  FP8 reaching close to 1.2 PFLOPs/s", "FP8 FlashAttention-3 achieves 2.6x
  lower numerical error than a baseline FP8 attention" — all verbatim. The
  piece attributes the FP8 error result to block quantization and incoherent
  processing; the abstract lists exactly those as the FP8 technique, distinct
  from the two asynchrony techniques, so the attribution holds.
- Not independently verified: the backward-pass-recomputes-from-statistics
  description of the mechanism (body of the 2022 paper, not the abstract). It
  is the standard, uncontested account of the algorithm and nothing numerical
  hangs on it.

The payload is real and unfamiliar even to daily followers: a technique with a
reputation for making attention fast is documented by its own authors leaving
60-75% of the machine idle in each prior release, and the closing observation —
utilization roughly halves when the next chip arrives — is a synthesis the
three abstracts support but none of them states. Every number in the fact
blocks is the paper's number in the paper's unit. Approve.
