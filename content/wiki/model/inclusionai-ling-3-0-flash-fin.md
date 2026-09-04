---
id: model/inclusionai-ling-3-0-flash-fin
kind: model
display_name: Ling 3.0 Flash Fin
status: active
maintenance: living
aliases:
  - name: Ling 3.0 Flash Fin
    class: manual
feeds:
  openrouter-models: inclusionai/ling-3.0-flash-fin
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
