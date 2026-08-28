---
id: model/ibm-granite-granite-4-1-8b
kind: model
display_name: "IBM: Granite 4.1 8B"
status: active
maintenance: living
aliases:
  - name: "IBM: Granite 4.1 8B"
    class: manual
feeds:
  openrouter-models: ibm-granite/granite-4.1-8b
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
