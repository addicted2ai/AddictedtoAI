---
id: model/thinkingmachines-inkling-batch
kind: model
display_name: "Thinking Machines: Inkling (batch)"
status: active
maintenance: living
aliases:
  - name: "Thinking Machines: Inkling (batch)"
    class: manual
feeds:
  openrouter-models: thinkingmachines/inkling:batch
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
