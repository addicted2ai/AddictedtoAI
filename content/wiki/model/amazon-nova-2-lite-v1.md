---
id: model/amazon-nova-2-lite-v1
kind: model
display_name: "Amazon: Nova 2 Lite"
status: active
maintenance: living
aliases:
  - name: "Amazon: Nova 2 Lite"
    class: manual
feeds:
  openrouter-models: amazon/nova-2-lite-v1
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
