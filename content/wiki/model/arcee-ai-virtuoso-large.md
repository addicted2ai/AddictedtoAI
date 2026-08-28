---
id: model/arcee-ai-virtuoso-large
kind: model
display_name: "Arcee AI: Virtuoso Large"
status: active
maintenance: living
aliases:
  - name: "Arcee AI: Virtuoso Large"
    class: manual
feeds:
  openrouter-models: arcee-ai/virtuoso-large
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
