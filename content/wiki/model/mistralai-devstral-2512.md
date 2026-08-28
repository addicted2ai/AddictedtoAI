---
id: model/mistralai-devstral-2512
kind: model
display_name: "Mistral: Devstral 2 2512"
status: active
maintenance: living
aliases:
  - name: "Mistral: Devstral 2 2512"
    class: manual
feeds:
  openrouter-models: mistralai/devstral-2512
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
