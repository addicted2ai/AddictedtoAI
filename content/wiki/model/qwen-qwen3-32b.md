---
id: model/qwen-qwen3-32b
kind: model
display_name: "Qwen: Qwen3 32B"
status: active
maintenance: living
aliases:
  - name: "Qwen: Qwen3 32B"
    class: manual
feeds:
  openrouter-models: qwen/qwen3-32b
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
