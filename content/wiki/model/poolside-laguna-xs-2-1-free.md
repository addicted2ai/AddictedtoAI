---
id: model/poolside-laguna-xs-2-1-free
kind: model
display_name: "Poolside: Laguna XS 2.1 (free)"
status: active
maintenance: living
aliases:
  - name: "Poolside: Laguna XS 2.1 (free)"
    class: manual
feeds:
  openrouter-models: poolside/laguna-xs-2.1:free
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
