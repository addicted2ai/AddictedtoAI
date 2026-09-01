---
id: model/openai-gpt-4o-mini-batch
kind: model
display_name: "OpenAI: GPT-4o-mini (batch)"
status: active
maintenance: living
aliases:
  - name: "OpenAI: GPT-4o-mini (batch)"
    class: manual
feeds:
  openrouter-models: openai/gpt-4o-mini:batch
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
