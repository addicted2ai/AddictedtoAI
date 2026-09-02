---
id: model/inception-mercury-2-5-preview
kind: model
display_name: "Inception: Mercury 2.5 Preview"
status: active
maintenance: living
aliases:
  - name: "Inception: Mercury 2.5 Preview"
    class: manual
feeds:
  openrouter-models: inception/mercury-2.5-preview
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
