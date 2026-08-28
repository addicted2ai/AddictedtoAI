---
id: model/openrouter-auto-beta
kind: model
display_name: Auto Router (Beta)
status: active
maintenance: living
aliases:
  - name: Auto Router (Beta)
    class: manual
feeds:
  openrouter-models: openrouter/auto-beta
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
