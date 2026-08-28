---
id: model/sakana-fugu-ultra
kind: model
display_name: "Sakana: Fugu Ultra"
status: active
maintenance: living
aliases:
  - name: "Sakana: Fugu Ultra"
    class: manual
feeds:
  openrouter-models: sakana/fugu-ultra
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
