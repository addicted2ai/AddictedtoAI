---
id: model/nousresearch-hermes-3-llama-3-1-70b
kind: model
display_name: "Nous: Hermes 3 70B Instruct"
status: active
maintenance: living
aliases:
  - name: "Nous: Hermes 3 70B Instruct"
    class: manual
feeds:
  openrouter-models: nousresearch/hermes-3-llama-3.1-70b
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
