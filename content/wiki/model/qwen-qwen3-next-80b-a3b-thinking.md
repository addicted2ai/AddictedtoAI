---
id: model/qwen-qwen3-next-80b-a3b-thinking
kind: model
display_name: "Qwen: Qwen3 Next 80B A3B Thinking"
status: active
maintenance: living
aliases:
  - name: "Qwen: Qwen3 Next 80B A3B Thinking"
    class: manual
feeds:
  openrouter-models: qwen/qwen3-next-80b-a3b-thinking
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
