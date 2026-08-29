---
id: model/deepseek-deepseek-v4-flash-0731
kind: model
display_name: "DeepSeek: DeepSeek V4 Flash 0731"
status: active
maintenance: living
aliases:
  - name: "DeepSeek: DeepSeek V4 Flash 0731"
    class: manual
  - name: "DeepSeek-V4-Flash-0731"
    class: exclusive
  - name: "deepseek/deepseek-v4-flash-0731"
    class: exclusive
feeds:
  openrouter-models: deepseek/deepseek-v4-flash-0731
facts:
  - field: price_input
    source: feed
    feed: openrouter-models
    path: pricing.prompt
    volatility: fast
  - field: price_output
    source: feed
    feed: openrouter-models
    path: pricing.completion
    volatility: fast
  - field: context_window
    source: feed
    feed: openrouter-models
    path: context_length
    volatility: fast
  - field: intelligence_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.intelligence_index
    volatility: fast
  - field: coding_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.coding_index
    volatility: fast
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: license
    source: cited
    value: "MIT License, repository and weights"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
    accessed: "2026-08-28"
    volatility: slow
  - field: parameters
    source: cited
    value: "284B total, 13B active per token (sparse mixture of experts)"
    source_url: "https://openrouter.ai/api/v1/models"
    accessed: "2026-08-28"
    volatility: static
  - field: card_parameters
    source: cited
    value: "304B params"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
    accessed: "2026-08-28"
    volatility: static
  - field: preview_parameters
    source: cited
    value: "284 billion parameters"
    source_url: "https://en.wikipedia.org/wiki/DeepSeek"
    accessed: "2026-08-28"
    volatility: static
  - field: structure
    source: cited
    value: "the same model structure as DeepSeek-V4-Flash-DSpark, i.e. it comes with a speculative decoding module attached"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
    accessed: "2026-08-28"
    volatility: static
  - field: terminal_bench_score
    source: cited
    value: "82.7 on Terminal Bench (2.1), per the model card"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
    accessed: "2026-08-28"
    volatility: dated
  - field: cybergym_score
    source: cited
    value: "76.7 on CyberGym, per the model card"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
    accessed: "2026-08-28"
    volatility: dated
  - field: preview_terminal_bench_score
    source: cited
    value: "61.8 on Terminal Bench (2.1) — the April preview checkpoint's score, per the same table on the July model card"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
    accessed: "2026-08-28"
    volatility: dated
  - field: preview_cybergym_score
    source: cited
    value: "38.7 on CyberGym — the April preview checkpoint's score, per the same table on the July model card"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
    accessed: "2026-08-28"
    volatility: dated
  - field: release_date
    source: cited
    value: "2026-07-31"
    source_url: "https://simonwillison.net/2026/Jul/31/deepseek-v4-flash-0731/"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2026-04-24"
    event: "V4 series previewed, including the 284-billion-parameter DeepSeek-V4-Flash that this row's release supersedes"
    source_url: "https://en.wikipedia.org/wiki/DeepSeek"
  - date: "2026-07-31"
    event: "released with MIT-licensed weights on Hugging Face"
    source_url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731"
mentions:
  - org/deepseek
  - model/deepseek-deepseek-v4-flash
  - model/deepseek-deepseek-v4-pro-0813
---
