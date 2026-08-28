---
id: model/mistralai-mistral-medium-3-1
kind: model
display_name: "Mistral: Mistral Medium 3.1"
status: active
maintenance: living
aliases:
  - name: "Mistral: Mistral Medium 3.1"
    class: manual
feeds:
  openrouter-models: mistralai/mistral-medium-3.1
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
