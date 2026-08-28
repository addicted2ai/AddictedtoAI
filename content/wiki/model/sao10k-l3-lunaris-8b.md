---
id: model/sao10k-l3-lunaris-8b
kind: model
display_name: "Sao10K: Llama 3 8B Lunaris"
status: active
maintenance: living
aliases:
  - name: "Sao10K: Llama 3 8B Lunaris"
    class: manual
feeds:
  openrouter-models: sao10k/l3-lunaris-8b
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
