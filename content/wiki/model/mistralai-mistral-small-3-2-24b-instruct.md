---
id: model/mistralai-mistral-small-3-2-24b-instruct
kind: model
display_name: "Mistral: Mistral Small 3.2 24B"
status: active
maintenance: living
aliases:
  - name: "Mistral: Mistral Small 3.2 24B"
    class: manual
feeds:
  openrouter-models: mistralai/mistral-small-3.2-24b-instruct
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
