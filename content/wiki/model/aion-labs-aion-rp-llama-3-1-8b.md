---
id: model/aion-labs-aion-rp-llama-3-1-8b
kind: model
display_name: "AionLabs: Aion-RP 1.0 (8B)"
status: active
maintenance: living
aliases:
  - name: "AionLabs: Aion-RP 1.0 (8B)"
    class: manual
feeds:
  openrouter-models: aion-labs/aion-rp-llama-3.1-8b
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
