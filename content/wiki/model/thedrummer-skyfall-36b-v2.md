---
id: model/thedrummer-skyfall-36b-v2
kind: model
display_name: "TheDrummer: Skyfall 36B V2"
status: active
maintenance: living
aliases:
  - name: "TheDrummer: Skyfall 36B V2"
    class: manual
feeds:
  openrouter-models: thedrummer/skyfall-36b-v2
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
