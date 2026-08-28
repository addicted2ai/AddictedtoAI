---
id: model/qwen-qwen3-coder-flash
kind: model
display_name: "Qwen: Qwen3 Coder Flash"
status: active
maintenance: living
aliases:
  - name: "Qwen: Qwen3 Coder Flash"
    class: manual
feeds:
  openrouter-models: qwen/qwen3-coder-flash
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
