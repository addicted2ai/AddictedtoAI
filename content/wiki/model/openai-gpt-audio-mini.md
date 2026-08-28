---
id: model/openai-gpt-audio-mini
kind: model
display_name: "OpenAI: GPT Audio Mini"
status: active
maintenance: living
aliases:
  - name: "OpenAI: GPT Audio Mini"
    class: manual
feeds:
  openrouter-models: openai/gpt-audio-mini
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
