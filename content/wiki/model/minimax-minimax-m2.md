---
id: model/minimax-minimax-m2
kind: model
display_name: "MiniMax: MiniMax M2"
status: active
maintenance: living
aliases:
  - name: "MiniMax: MiniMax M2"
    class: manual
feeds:
  openrouter-models: minimax/minimax-m2
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
