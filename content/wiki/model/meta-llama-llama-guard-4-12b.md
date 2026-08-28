---
id: model/meta-llama-llama-guard-4-12b
kind: model
display_name: "Meta: Llama Guard 4 12B"
status: active
maintenance: living
aliases:
  - name: "Meta: Llama Guard 4 12B"
    class: manual
feeds:
  openrouter-models: meta-llama/llama-guard-4-12b
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
