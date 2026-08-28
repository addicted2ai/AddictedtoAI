---
id: model/aion-labs-aion-3-0-mini
kind: model
display_name: "AionLabs: Aion-3.0-Mini"
status: active
maintenance: living
aliases:
  - name: "AionLabs: Aion-3.0-Mini"
    class: manual
feeds:
  openrouter-models: aion-labs/aion-3.0-mini
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
