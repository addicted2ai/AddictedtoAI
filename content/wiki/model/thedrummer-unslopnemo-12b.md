---
id: model/thedrummer-unslopnemo-12b
kind: model
display_name: "TheDrummer: UnslopNemo 12B"
status: active
maintenance: living
aliases:
  - name: "TheDrummer: UnslopNemo 12B"
    class: manual
feeds:
  openrouter-models: thedrummer/unslopnemo-12b
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
