---
id: model/moonshotai-kimi-k3
kind: model
display_name: "MoonshotAI: Kimi K3"
status: active
maintenance: living
aliases:
  - name: "MoonshotAI: Kimi K3"
    class: manual
  - name: "Kimi K3"
    class: exclusive
  - name: "moonshotai/kimi-k3"
    class: exclusive
feeds:
  openrouter-models: moonshotai/kimi-k3
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
  - field: parameters
    source: cited
    value: "2.8T total, 104B activated"
    source_url: "https://huggingface.co/moonshotai/Kimi-K3"
    accessed: "2026-08-28"
    volatility: static
  - field: license
    source: cited
    value: "Kimi K3 License — bespoke, with a revenue-sharing clause for large inference providers"
    source_url: "https://huggingface.co/moonshotai/Kimi-K3"
    accessed: "2026-08-28"
    volatility: slow
  - field: listed_date
    source: cited
    value: "2026-07-16"
    source_url: "https://openrouter.ai/moonshotai/kimi-k3"
    accessed: "2026-08-28"
    volatility: dated
timeline:
  - date: "2026-07-16"
    event: "listed as an open-weight 2.8T-parameter multimodal reasoning model; migration target for the retiring Kimi K2.5"
    source_url: "https://openrouter.ai/moonshotai/kimi-k3"
mentions:
  - org/moonshot-ai
  - model/moonshotai-kimi-k2-5
---
