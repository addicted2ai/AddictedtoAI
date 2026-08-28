---
id: model/anthropic-claude-3-haiku
kind: model
display_name: "Anthropic: Claude 3 Haiku"
status: active
maintenance: living
aliases:
  - name: "Anthropic: Claude 3 Haiku"
    class: manual
feeds:
  openrouter-models: anthropic/claude-3-haiku
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
