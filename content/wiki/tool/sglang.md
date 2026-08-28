---
id: tool/sglang
kind: tool
display_name: "SGLang"
status: active
maintenance: stable
aliases:
  - name: "SGLang"
    class: exclusive
  - name: "RadixAttention"
    class: shared
facts:
  - field: license
    source: cited
    value: "Apache-2.0"
    source_url: "https://github.com/sgl-project/sglang"
    accessed: "2026-08-28"
    volatility: static
  - field: hosted_by
    source: cited
    value: "hosted under the non-profit open-source organization LMSYS; joined the PyTorch Ecosystem in March 2025"
    source_url: "https://github.com/sgl-project/sglang"
    accessed: "2026-08-28"
    volatility: slow
  - field: kv_cache_reuse
    source: cited
    value: "RadixAttention, which keeps a radix tree of prefixes so unrelated requests can share KV cache blocks"
    source_url: "https://arxiv.org/abs/2312.07104"
    accessed: "2026-08-28"
    volatility: static
  - field: paper_throughput_claim
    source: cited
    value: "up to 6.4x higher throughput than the inference systems it was compared against at publication"
    source_url: "https://arxiv.org/abs/2312.07104"
    accessed: "2026-08-28"
    volatility: dated
  - field: deployment_claim
    source: cited
    value: "the project's own README claims deployments on over 400,000 GPUs; the figure is self-reported and not independently verified here"
    source_url: "https://github.com/sgl-project/sglang"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2023-12-12"
    event: "SGLang published, pairing a frontend language with a runtime built on RadixAttention"
    source_url: "https://arxiv.org/abs/2312.07104"
mentions:
  - concept/kv-cache
  - technique/speculative-decoding
---
