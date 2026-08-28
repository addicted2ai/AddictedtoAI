---
id: model/x-ai-grok-latest
kind: model
display_name: "xAI: Grok Latest"
status: active
maintenance: living
aliases:
  - name: "xAI: Grok Latest"
    class: manual
feeds:
  openrouter-models: ~x-ai/grok-latest
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
