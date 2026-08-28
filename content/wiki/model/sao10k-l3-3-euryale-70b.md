---
id: model/sao10k-l3-3-euryale-70b
kind: model
display_name: "Sao10K: Llama 3.3 Euryale 70B"
status: active
maintenance: living
aliases:
  - name: "Sao10K: Llama 3.3 Euryale 70B"
    class: manual
feeds:
  openrouter-models: sao10k/l3.3-euryale-70b
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
