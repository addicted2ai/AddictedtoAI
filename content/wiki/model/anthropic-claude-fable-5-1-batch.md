---
id: model/anthropic-claude-fable-5-1-batch
kind: model
display_name: "Anthropic: Claude Fable 5.1 (batch)"
status: active
maintenance: living
aliases:
  - name: "Anthropic: Claude Fable 5.1 (batch)"
    class: manual
feeds:
  openrouter-models: anthropic/claude-fable-5.1:batch
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
