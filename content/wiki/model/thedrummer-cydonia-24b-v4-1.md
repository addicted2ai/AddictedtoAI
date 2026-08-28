---
id: model/thedrummer-cydonia-24b-v4-1
kind: model
display_name: "TheDrummer: Cydonia 24B V4.1"
status: active
maintenance: living
aliases:
  - name: "TheDrummer: Cydonia 24B V4.1"
    class: manual
feeds:
  openrouter-models: thedrummer/cydonia-24b-v4.1
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
