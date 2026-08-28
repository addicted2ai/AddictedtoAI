---
job: seed-technique-quantization
verdict: approve
reasons: []
would-cite: >-
  The person asking why two "four-bit" GGUF builds differ by hundreds of
  megabytes gets the answer here — measured bits-per-weight landing a fifth
  above nominal; and the prefill-versus-generation asymmetry (2.5x faster
  generation, slightly slower prompt processing) is the citable correction
  to the "quantized means faster" shorthand.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. All three cited sources fetched.

**Verified by fetching:**
- github.com/ggml-org/llama.cpp/pull/1684 — merged June 5, 2023; adds
  GGML_TYPE_Q2_K through Q6_K; "GGML_TYPE_Q4_K - 'type-1' 4-bit
  quantization in super-blocks containing 8 blocks, each block having 32
  weights", "ends up using 4.5 bpw"; Q4_K_M described as using
  "GGML_TYPE_Q6_K for half of the attention.wv and feed_forward.w2
  tensors, else GGML_TYPE_Q4_K" while Q4_K_S is uniform — which is exactly
  the body's claim that the S/M/L suffix selects tensor promotion rather
  than a file-size class.
- github.com/ggml-org/llama.cpp tools/quantize/README.md — the measured
  table is there, on meta-llama/Llama-3.1-8B: Q4_K_S 4.6672, Q4_K_M
  4.8944, Q6_K 6.5633, Q8_0 8.5008 bits per weight; text generation
  29.17 t/s (F16) vs 71.93 (Q4_K_M); prompt processing 923.49 vs 821.81.
  All seven numbers in the two facts are exact, and the body's readings
  hold: the four-bit types land roughly a fifth above nominal (4.6672 and
  4.8944 vs 4.0), generation is ~2.5x faster, prefill is slightly slower
  quantized.
- arxiv.org/abs/2305.14314 (QLoRA, submitted 23 May 2023) — introduces
  4-bit NormalFloat, double quantization and paged optimizers, and
  "finetune a 65B parameter model on a single 48GB GPU" — the nf4_origin
  fact is supported in full.

**Also checked:** transclusions resolve against this entry's own facts;
mentions (tool/llama-cpp, tool/ollama) resolve; aliases defensible —
"Quantization" as shared is right for a term with life outside LLMs, and
K-quants points here and nowhere else. The bandwidth-versus-arithmetic
explanation of why generation speeds up while prefill does not is correct
mechanism, matching how the serving literature describes decode as
memory-bound and prefill as compute-bound.

Short, and better for it: every sentence is either a measured number or
the reading of one. The opening — Q4 does not mean four bits, and the
difference decides what fits on a card — passes the "what exactly is this
telling me?" test in its first line. Approve.
