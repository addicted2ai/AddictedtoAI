---
id: model/qwen-qwen-plus-2025-07-28
kind: model
display_name: "Qwen: Qwen Plus 0728"
status: active
maintenance: living
aliases:
  - name: "Qwen: Qwen Plus 0728"
    class: manual
feeds:
  openrouter-models: qwen/qwen-plus-2025-07-28
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
