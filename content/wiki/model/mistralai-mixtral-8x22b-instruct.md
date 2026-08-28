---
id: model/mistralai-mixtral-8x22b-instruct
kind: model
display_name: "Mistral: Mixtral 8x22B Instruct"
status: active
maintenance: living
aliases:
  - name: "Mistral: Mixtral 8x22B Instruct"
    class: manual
feeds:
  openrouter-models: mistralai/mixtral-8x22b-instruct
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
