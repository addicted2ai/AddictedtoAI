---
id: model/cohere-north-mini-code-free
kind: model
display_name: "Cohere: North Mini Code (free)"
status: active
maintenance: living
aliases:
  - name: "Cohere: North Mini Code (free)"
    class: manual
feeds:
  openrouter-models: cohere/north-mini-code:free
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
