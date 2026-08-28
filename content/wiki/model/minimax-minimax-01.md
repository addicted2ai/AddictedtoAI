---
id: model/minimax-minimax-01
kind: model
display_name: "MiniMax: MiniMax-01"
status: active
maintenance: living
aliases:
  - name: "MiniMax: MiniMax-01"
    class: manual
feeds:
  openrouter-models: minimax/minimax-01
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
