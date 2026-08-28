---
id: model/anthropic-claude-opus-4-8-fast
kind: model
display_name: "Anthropic: Claude Opus 4.8 (Fast)"
status: active
maintenance: living
aliases:
  - name: "Anthropic: Claude Opus 4.8 (Fast)"
    class: manual
feeds:
  openrouter-models: anthropic/claude-opus-4.8-fast
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
