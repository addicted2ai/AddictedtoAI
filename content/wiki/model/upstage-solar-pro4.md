---
id: model/upstage-solar-pro4
kind: model
display_name: "Upstage: Solar Pro 4"
status: active
maintenance: living
aliases:
  - name: "Upstage: Solar Pro 4"
    class: manual
feeds:
  openrouter-models: upstage/solar-pro4
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
