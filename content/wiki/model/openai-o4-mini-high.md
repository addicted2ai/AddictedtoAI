---
id: model/openai-o4-mini-high
kind: model
display_name: "OpenAI: o4 Mini High"
status: active
maintenance: living
aliases:
  - name: "OpenAI: o4 Mini High"
    class: manual
feeds:
  openrouter-models: openai/o4-mini-high
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
