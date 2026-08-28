---
id: model/meta-llama-llama-4-maverick
kind: model
display_name: "Meta: Llama 4 Maverick"
status: active
maintenance: living
aliases:
  - name: "Meta: Llama 4 Maverick"
    class: manual
feeds:
  openrouter-models: meta-llama/llama-4-maverick
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
