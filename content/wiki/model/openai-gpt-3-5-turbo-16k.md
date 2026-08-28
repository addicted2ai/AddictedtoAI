---
id: model/openai-gpt-3-5-turbo-16k
kind: model
display_name: "OpenAI: GPT-3.5 Turbo 16k"
status: active
maintenance: living
aliases:
  - name: "OpenAI: GPT-3.5 Turbo 16k"
    class: manual
feeds:
  openrouter-models: openai/gpt-3.5-turbo-16k
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
