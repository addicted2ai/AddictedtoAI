---
id: model/morph-morph-v3-fast
kind: model
display_name: "Morph: Morph V3 Fast"
status: active
maintenance: living
aliases:
  - name: "Morph: Morph V3 Fast"
    class: manual
feeds:
  openrouter-models: morph/morph-v3-fast
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
