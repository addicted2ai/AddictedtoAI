---
id: model/openrouter-pareto-code
kind: model
display_name: Pareto Code Router
status: active
maintenance: living
aliases:
  - name: Pareto Code Router
    class: manual
feeds:
  openrouter-models: openrouter/pareto-code
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
