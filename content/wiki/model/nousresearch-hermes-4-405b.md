---
id: model/nousresearch-hermes-4-405b
kind: model
display_name: "Nous: Hermes 4 405B"
status: active
maintenance: living
aliases:
  - name: "Nous: Hermes 4 405B"
    class: manual
feeds:
  openrouter-models: nousresearch/hermes-4-405b
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
