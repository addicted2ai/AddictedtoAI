---
id: model/relace-relace-apply-3
kind: model
display_name: "Relace: Relace Apply 3"
status: active
maintenance: living
aliases:
  - name: "Relace: Relace Apply 3"
    class: manual
feeds:
  openrouter-models: relace/relace-apply-3
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
