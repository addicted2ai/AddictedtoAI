---
id: model/meta-llama-llama-4-scout
kind: model
display_name: "Meta: Llama 4 Scout"
status: active
maintenance: living
aliases:
  - name: "Meta: Llama 4 Scout"
    class: manual
feeds:
  openrouter-models: meta-llama/llama-4-scout
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
