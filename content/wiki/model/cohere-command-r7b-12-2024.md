---
id: model/cohere-command-r7b-12-2024
kind: model
display_name: "Cohere: Command R7B (12-2024)"
status: active
maintenance: living
aliases:
  - name: "Cohere: Command R7B (12-2024)"
    class: manual
feeds:
  openrouter-models: cohere/command-r7b-12-2024
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
