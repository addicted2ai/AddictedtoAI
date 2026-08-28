---
id: model/openrouter-fusion
kind: model
display_name: "OpenRouter: Fusion"
status: active
maintenance: living
aliases:
  - name: "OpenRouter: Fusion"
    class: manual
feeds:
  openrouter-models: openrouter/fusion
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
