---
id: model/qwen-qwen3-5-plus-20260420
kind: model
display_name: "Qwen: Qwen3.5 Plus 2026-04-20"
status: active
maintenance: living
aliases:
  - name: "Qwen: Qwen3.5 Plus 2026-04-20"
    class: manual
feeds:
  openrouter-models: qwen/qwen3.5-plus-20260420
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
