---
id: model/anthropic-claude-opus-5-batch
kind: model
display_name: Claude Opus 5 (batch)
status: active
maintenance: living
aliases:
  - name: Claude Opus 5 (batch)
    class: manual
feeds:
  openrouter-models: anthropic/claude-opus-5:batch
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
