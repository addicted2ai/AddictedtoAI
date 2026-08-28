---
id: model/mistralai-mistral-large
kind: model
display_name: Mistral Large
status: active
maintenance: living
aliases:
  - name: Mistral Large
    class: manual
feeds:
  openrouter-models: mistralai/mistral-large
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
