---
id: model/qwen-qwen3-7-max
kind: model
display_name: "Qwen: Qwen3.7 Max"
status: active
maintenance: living
aliases:
  - name: "Qwen: Qwen3.7 Max"
    class: manual
feeds:
  openrouter-models: qwen/qwen3.7-max
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
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
timeline: []
mentions: []
---
