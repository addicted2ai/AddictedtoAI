---
id: model/openai-o1
kind: model
display_name: "OpenAI: o1"
status: active
maintenance: living
aliases:
  - name: "OpenAI: o1"
    class: manual
feeds:
  openrouter-models: openai/o1
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
