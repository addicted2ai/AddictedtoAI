---
id: technique/speculative-decoding
kind: technique
display_name: "Speculative decoding"
status: active
maintenance: stable
aliases:
  - name: "Speculative decoding"
    class: exclusive
  - name: "Speculative sampling"
    class: shared
facts:
  - field: first_published
    source: cited
    value: "2022-11-30"
    source_url: "https://arxiv.org/abs/2211.17192"
    accessed: "2026-08-28"
    volatility: dated
  - field: distribution_guarantee
    source: cited
    value: "the emitted distribution is the target model's, unchanged"
    source_url: "https://arxiv.org/abs/2211.17192"
    accessed: "2026-08-28"
    volatility: static
  - field: numerics_caveat
    source: cited
    value: "lossless only up to the precision limits of hardware numerics"
    source_url: "https://docs.vllm.ai/en/latest/features/speculative_decoding/"
    accessed: "2026-08-28"
    volatility: slow
  - field: reported_speedup_t5_xxl
    source: cited
    value: "2x-3x on T5-XXL against the standard T5X implementation"
    source_url: "https://arxiv.org/abs/2211.17192"
    accessed: "2026-08-28"
    volatility: dated
  - field: reported_speedup_chinchilla
    source: cited
    value: "2x-2.5x on Chinchilla 70B in a distributed setup"
    source_url: "https://arxiv.org/abs/2302.01318"
    accessed: "2026-08-28"
    volatility: dated
  - field: reported_speedup_eagle_3
    source: cited
    value: "up to 6.5x single-stream; 1.38x throughput at batch size 64 in SGLang"
    source_url: "https://arxiv.org/abs/2503.01840"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2022-11-30"
    event: "introduced by Leviathan, Kalman and Matias at Google"
    source_url: "https://arxiv.org/abs/2211.17192"
  - date: "2023-02-02"
    event: "published independently as speculative sampling by Chen, Borgeaud, Irving, Lespiau, Sifre and Jumper, benchmarked on Chinchilla 70B"
    source_url: "https://arxiv.org/abs/2302.01318"
  - date: "2024-01-19"
    event: "Medusa replaces the separate draft model with extra decoding heads on the target model"
    source_url: "https://arxiv.org/abs/2401.10774"
  - date: "2025-03-03"
    event: "EAGLE-3 abandons feature prediction for direct token prediction"
    source_url: "https://arxiv.org/abs/2503.01840"
mentions:
  - concept/kv-cache
  - tool/vllm
  - tool/sglang
---

Autoregressive decoding is serial by construction: the token at position *n+1*
cannot be computed until the token at position *n* exists. Speculative decoding
breaks that serialization without changing what the model outputs, and the
second half of that sentence is the part most summaries get wrong.

**The mechanism.** A small *draft* model generates a short continuation — a
handful of tokens — one at a time, cheaply. The large *target* model then scores
that entire continuation in a single forward pass, because scoring many
positions in parallel is what a transformer does well; only generating is
serial. A modified rejection-sampling step then walks the drafted tokens in
order, accepting each with probability min(1, p/q) where p is the target's
probability for that token and q is the draft's, and on the first rejection
resampling that one position from the normalized residual max(0, p − q). The
accepted prefix plus that resampled token is emitted, and the loop repeats.

The reason this is profitable is a hardware fact rather than a modelling one. At
small batch sizes, decoding is bound by moving model weights out of high
bandwidth memory into the accelerator, not by arithmetic — the bottleneck Medusa
names explicitly — so a forward pass that scores five positions costs close to
what a forward pass scoring one costs. The draft turns idle arithmetic into
tokens.

**The guarantee.** Both original papers claim something stronger than "quality
is preserved": the output distribution is the target model's, exactly. Leviathan,
Kalman and Matias (2022-11-30, Google Research) describe sampling "without
changing the distribution" and report 2x-3x on T5-XXL. Two months later Chen and
colleagues published the same idea as speculative sampling, with a "novel
modified rejection sampling scheme which preserves the distribution of the
target model within hardware numerics", measured at 2x-2.5x on Chinchilla 70B.
vLLM's documentation states the caveat plainly — lossless "up to the precision
limits of hardware numerics" — so what you trade is floating-point
reproducibility, not model quality.

**Where the drafts come from now.** The separate draft model was the weak point:
it had to share a tokenizer family with the target, be small enough to be worth
running, and be trained or found. Medusa (2024-01-19) attached extra decoding
heads to the target model itself and verified a tree of candidates, reporting
over 2.2x with a frozen backbone. EAGLE moved drafting into the target's own
feature space, and EAGLE-3 (2025-03-03) dropped feature prediction for direct
token prediction. vLLM now documents
{{fact:tool/vllm#speculative_decoding_methods}} — several of which, n-gram and
suffix decoding among them, use no neural draft at all.

**The number that matters.** Single-stream latency and served throughput are
different quantities, and the gap between them is large enough to reverse a
decision. EAGLE-3's own abstract reports up to 6.5x — and, in SGLang at batch
size 64, 1.38x throughput. Verification compute is nearly free while the GPU
waits on weight loads and is not free when it is already saturated with other
requests, so every point of acceptance rate is worth less as batch size climbs.
vLLM's guidance is that real gains "depend on your model family, traffic
pattern, hardware, and sampling settings", which is the honest form of the
headline multiples: they are ceilings, and the throughput figure is the one that
survives a queue.
