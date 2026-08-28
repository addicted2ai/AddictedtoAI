---
id: model/relace-relace-search
kind: model
display_name: "Relace: Relace Search"
status: active
maintenance: living
aliases:
  - name: "Relace: Relace Search"
    class: manual
feeds:
  openrouter-models: relace/relace-search
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
