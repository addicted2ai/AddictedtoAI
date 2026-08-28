---
id: tool/vllm
kind: tool
display_name: "vLLM"
status: active
maintenance: stable
aliases:
  - name: "vLLM"
    class: exclusive
  - name: "PagedAttention"
    class: shared
facts:
  - field: license
    source: cited
    value: "Apache-2.0"
    source_url: "https://github.com/vllm-project/vllm"
    accessed: "2026-08-28"
    volatility: static
  - field: origin
    source: cited
    value: "originally developed in the Sky Computing Lab at UC Berkeley"
    source_url: "https://github.com/vllm-project/vllm"
    accessed: "2026-08-28"
    volatility: static
  - field: launch_throughput_claim
    source: cited
    value: "at release, 14x-24x the throughput of HuggingFace Transformers and 2.2x-3.5x that of Text Generation Inference, on LLaMA 7B/13B with ShareGPT request distributions"
    source_url: "https://vllm.ai/blog/2023-06-20-vllm"
    accessed: "2026-08-28"
    volatility: dated
  - field: speculative_decoding_methods
    source: cited
    value: "ten proposer methods, including EAGLE, MTP, draft models, PARD, n-gram and suffix decoding"
    source_url: "https://docs.vllm.ai/en/latest/features/speculative_decoding/"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2023-06-20"
    event: "released with PagedAttention, reporting KV cache waste cut from 60-80% to under 4%"
    source_url: "https://vllm.ai/blog/2023-06-20-vllm"
  - date: "2023-09-12"
    event: "PagedAttention published at SOSP 2023"
    source_url: "https://arxiv.org/abs/2309.06180"
mentions:
  - concept/kv-cache
  - technique/speculative-decoding
---
