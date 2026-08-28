---
id: model/mistralai-ministral-8b-2512
kind: model
display_name: "Mistral: Ministral 3 8B 2512"
status: active
maintenance: living
aliases:
  - name: "Mistral: Ministral 3 8B 2512"
    class: manual
feeds:
  openrouter-models: mistralai/ministral-8b-2512
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
