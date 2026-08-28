---
id: model/google-lyria-3-pro-preview
kind: model
display_name: "Google: Lyria 3 Pro Preview"
status: active
maintenance: living
aliases:
  - name: "Google: Lyria 3 Pro Preview"
    class: manual
feeds:
  openrouter-models: google/lyria-3-pro-preview
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
