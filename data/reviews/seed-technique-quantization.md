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

## Recheck 2026-08-29 (wave addictedtoai-flh) — approve stands

Re-examined because this entry was approved in the earlier seed round, which
the 2026-08-29 seed wave never revisited. All three sources re-fetched. The
`quantize/README.md` was pulled as **raw text** (12,406 bytes) rather than as
rendered HTML, so the table could be read cell by cell rather than by
searching for loose numbers.

- `tools/quantize/README.md`, the `meta-llama/Llama-3.1-8B` tables — every one
  of the seven numbers in the two measured facts is the value in the cell the
  entry attributes it to, not merely a string present somewhere on the page:
  bits/weight Q4_K_S **4.6672**, Q4_K_M **4.8944**, Q6_K **6.5633**, Q8_0
  **8.5008**; text generation t/s @128 F16 **29.17** against Q4_K_M **71.93**;
  prompt processing t/s @512 F16 **923.49** against Q4_K_M **821.81**.
- The three readings the body draws from those cells were recomputed:
  4.6672/4 = 1.167 and 4.8944/4 = 1.224, so "roughly a fifth above their
  nominal width" holds; 71.93/29.17 = **2.466**, so "about two and a half
  times faster" holds; 821.81 against 923.49 is a small decrease, so "moves
  barely at all — slightly *slower* quantized" holds in direction and rough
  size. The "two builds both labelled four-bit can differ by several hundred
  megabytes" claim is supported by the same table's size column: Q4_K_S 4.36
  GiB against Q4_K_M 4.58 GiB, and IQ4_XS 4.17 GiB against Q4_K_M 4.58 GiB —
  a ~420 MB spread across rows a user would call four-bit.
- `github.com/ggml-org/llama.cpp/pull/1684` (716,642 bytes) — page states
  "**Merged** … **Jun 5, 2023**", matching the timeline row. Carries verbatim
  "GGML_TYPE_Q4_K - 'type-1' 4-bit quantization in **super-blocks containing 8
  blocks, each block having 32 weights**. Scales and mins are quantized with 6
  bits. This ends up using **4.5 bpw**." — the `k_quant_block_structure` fact
  exactly. The type-0/type-1 sentence the body paraphrases is there too:
  "In 'type-0', weights w are obtained from quants q using w = d * q, where d
  is the block scale. In 'type-1', weights are given by w = d * q + m, where m
  is the block minimum." And the S/M/L claim is the PR's own mix table:
  `Q4_K_S` "uses GGML_TYPE_Q4_K for all tensors" against `Q4_K_M` "uses
  GGML_TYPE_Q6_K for half of the attention.wv and feed_forward.w2 tensors,
  else GGML_TYPE_Q4_K", and for the `_L` half of the claim, `Q3_K_M` promotes
  those tensors to Q4_K while `Q3_K_L` promotes them to Q5_K — "`_L` more
  still" is right.
- `arxiv.org/abs/2305.14314` (44,173 bytes, "[Submitted on **23 May 2023**")
  — "**finetune a 65B parameter model on a single 48GB GPU**", "(a) **4-bit
  NormalFloat** (NF4)", "(b) **double quantization** to reduce the average
  memory footprint by quantizing the quantization constants, and (c) **paged
  optimziers** to manage memory spikes". Note the last one for any future
  pass: the abstract contains the **typo `optimziers`**, so a naive search for
  "paged optimizers" returns a false absence. The `nf4_origin` fact is
  supported in full.

Nothing changed.
