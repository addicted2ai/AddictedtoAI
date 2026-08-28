---
id: model/allenai-olmo-3-32b-think
kind: model
display_name: "AllenAI: Olmo 3 32B Think"
status: active
maintenance: living
aliases:
  - name: "AllenAI: Olmo 3 32B Think"
    class: manual
feeds:
  openrouter-models: allenai/olmo-3-32b-think
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
