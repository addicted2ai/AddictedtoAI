---
id: model/qwen-qwen-2-5-7b-instruct
kind: model
display_name: "Qwen: Qwen2.5 7B Instruct"
status: active
maintenance: living
aliases:
  - name: "Qwen: Qwen2.5 7B Instruct"
    class: manual
feeds:
  openrouter-models: qwen/qwen-2.5-7b-instruct
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
