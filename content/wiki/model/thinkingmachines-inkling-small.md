---
id: model/thinkingmachines-inkling-small
kind: model
display_name: "Thinking Machines: Inkling Small"
status: active
maintenance: living
aliases:
  - name: "Thinking Machines: Inkling Small"
    class: manual
feeds:
  openrouter-models: thinkingmachines/inkling-small
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
