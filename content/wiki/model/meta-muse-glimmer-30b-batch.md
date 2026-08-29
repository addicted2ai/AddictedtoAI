---
id: model/meta-muse-glimmer-30b-batch
kind: model
display_name: "Meta: Muse Glimmer 30B (batch)"
status: active
maintenance: living
aliases:
  - name: "Meta: Muse Glimmer 30B (batch)"
    class: manual
feeds:
  openrouter-models: meta/muse-glimmer-30b:batch
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
