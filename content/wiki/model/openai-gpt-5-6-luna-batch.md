---
id: model/openai-gpt-5-6-luna-batch
kind: model
display_name: "OpenAI: GPT-5.6 Luna (batch)"
status: active
maintenance: living
aliases:
  - name: "OpenAI: GPT-5.6 Luna (batch)"
    class: manual
feeds:
  openrouter-models: openai/gpt-5.6-luna:batch
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
