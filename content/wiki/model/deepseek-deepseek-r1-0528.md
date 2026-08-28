---
id: model/deepseek-deepseek-r1-0528
kind: model
display_name: "DeepSeek: R1 0528"
status: active
maintenance: living
aliases:
  - name: "DeepSeek: R1 0528"
    class: manual
feeds:
  openrouter-models: deepseek/deepseek-r1-0528
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
