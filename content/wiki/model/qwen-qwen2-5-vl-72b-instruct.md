---
id: model/qwen-qwen2-5-vl-72b-instruct
kind: model
display_name: "Qwen: Qwen2.5 VL 72B Instruct"
status: active
maintenance: living
aliases:
  - name: "Qwen: Qwen2.5 VL 72B Instruct"
    class: manual
feeds:
  openrouter-models: qwen/qwen2.5-vl-72b-instruct
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
