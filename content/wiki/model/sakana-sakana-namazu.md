---
id: model/sakana-sakana-namazu
kind: model
display_name: "Sakana: Sakana Namazu"
status: active
maintenance: living
aliases:
  - name: "Sakana: Sakana Namazu"
    class: manual
feeds:
  openrouter-models: sakana/sakana-namazu
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
