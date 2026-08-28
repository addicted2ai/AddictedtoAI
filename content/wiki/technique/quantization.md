---
id: technique/quantization
kind: technique
display_name: "Quantization"
status: active
maintenance: stable
aliases:
  - name: "Quantization"
    class: shared
  - name: "K-quants"
    class: exclusive
  - name: "NormalFloat"
    class: shared
facts:
  - field: k_quant_block_structure
    source: cited
    value: "Q4_K is a super-block of 8 blocks of 32 weights at 4.5 bits per weight by construction; the S/M/L suffix promotes attention and feed-forward tensors to a higher type"
    source_url: "https://github.com/ggml-org/llama.cpp/pull/1684"
    accessed: "2026-08-28"
    volatility: static
  - field: measured_bits_per_weight
    source: cited
    value: "Q4_K_S 4.6672, Q4_K_M 4.8944, Q6_K 6.5633 and Q8_0 8.5008 bits per weight, measured on Llama-3.1-8B"
    source_url: "https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md"
    accessed: "2026-08-28"
    volatility: slow
  - field: measured_generation_speed
    source: cited
    value: "29.17 generation tokens/s at F16 against 71.93 at Q4_K_M, while prompt processing moves only from 923.49 to 821.81 tokens/s"
    source_url: "https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md"
    accessed: "2026-08-28"
    volatility: slow
  - field: nf4_origin
    source: cited
    value: "4-bit NormalFloat, double quantization and paged optimizers introduced in QLoRA, which fine-tuned a 65B model on a single 48GB GPU"
    source_url: "https://arxiv.org/abs/2305.14314"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2023-05-23"
    event: "QLoRA introduces the NF4 data type and 4-bit fine-tuning"
    source_url: "https://arxiv.org/abs/2305.14314"
  - date: "2023-06-05"
    event: "k-quants merged into llama.cpp, adding super-block types Q2_K through Q6_K"
    source_url: "https://github.com/ggml-org/llama.cpp/pull/1684"
mentions:
  - tool/llama-cpp
  - tool/ollama
---

`Q4` does not mean four bits per weight, and the difference is large enough to
change which file fits on a card.

Block quantization stores a group of weights as small integers plus per-block
metadata — a scale, and for the "type-1" variants a minimum — and that metadata
ships in the file. llama.cpp's k-quants, merged 2023-06-05, group weights into
super-blocks: `Q4_K` is eight blocks of thirty-two weights, 4.5 bits per weight
by construction before any per-tensor exceptions. The `_S`, `_M` and `_L` suffix
is not a file-size class. It selects which tensors get promoted: `_M` gives the
attention and feed-forward tensors a higher type than the base, `_L` more still.

Measured on the file rather than on the block, llama.cpp's own table gives
{{fact:technique/quantization#measured_bits_per_weight}}. The four-bit types land
roughly a fifth above their nominal width. The nominal number is a floor the file
never touches, which is why two builds both labelled four-bit can differ by
several hundred megabytes.

The same table, same model and hardware, shows what quantization actually buys,
and it is not what the "smaller and faster" shorthand implies:
{{fact:technique/quantization#measured_generation_speed}}. Generation is bound by
reading weights out of memory, and a smaller file is a shorter read, so it gets
about two and a half times faster. Prompt processing multiplies the whole input
at once, is bound by arithmetic rather than bandwidth, and moves barely at all —
slightly *slower* quantized, since the blocks must be unpacked before they can be
multiplied.

So the trade is memory footprint and generation speed against accuracy, with
prefill throughput roughly untouched. A long prompt costs about the same to
process whichever quantization you picked.
