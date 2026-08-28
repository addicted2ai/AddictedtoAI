---
id: model/arcee-ai-trinity-large-thinking
kind: model
display_name: "Arcee AI: Trinity Large Thinking"
status: active
maintenance: living
aliases:
  - name: "Arcee AI: Trinity Large Thinking"
    class: manual
feeds:
  openrouter-models: arcee-ai/trinity-large-thinking
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
