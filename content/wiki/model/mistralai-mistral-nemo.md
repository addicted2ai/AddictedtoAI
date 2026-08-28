---
id: model/mistralai-mistral-nemo
kind: model
display_name: "Mistral: Mistral Nemo"
status: active
maintenance: living
aliases:
  - name: "Mistral: Mistral Nemo"
    class: manual
feeds:
  openrouter-models: mistralai/mistral-nemo
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
