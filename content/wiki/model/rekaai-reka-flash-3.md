---
id: model/rekaai-reka-flash-3
kind: model
display_name: Reka Flash 3
status: active
maintenance: living
aliases:
  - name: Reka Flash 3
    class: manual
feeds:
  openrouter-models: rekaai/reka-flash-3
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
