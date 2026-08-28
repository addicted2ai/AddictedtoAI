---
id: model/x-ai-grok-4-6
kind: model
display_name: "SpaceXAI: Grok 4.6"
status: active
maintenance: living
aliases:
  - name: "SpaceXAI: Grok 4.6"
    class: manual
feeds:
  openrouter-models: x-ai/grok-4.6
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
