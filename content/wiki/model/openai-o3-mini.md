---
id: model/openai-o3-mini
kind: model
display_name: "OpenAI: o3 Mini"
status: active
maintenance: living
aliases:
  - name: "OpenAI: o3 Mini"
    class: manual
feeds:
  openrouter-models: openai/o3-mini
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
