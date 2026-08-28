---
id: model/mancer-weaver
kind: model
display_name: "Mancer: Weaver (alpha)"
status: active
maintenance: living
aliases:
  - name: "Mancer: Weaver (alpha)"
    class: manual
feeds:
  openrouter-models: mancer/weaver
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
