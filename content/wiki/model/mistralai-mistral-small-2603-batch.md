---
id: model/mistralai-mistral-small-2603-batch
kind: model
display_name: "Mistral: Mistral Small 4 (batch)"
status: active
maintenance: living
aliases:
  - name: "Mistral: Mistral Small 4 (batch)"
    class: manual
feeds:
  openrouter-models: mistralai/mistral-small-2603:batch
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
