---
id: model/openai-gpt-6-astra-pro-batch
kind: model
display_name: "OpenAI: GPT-6 Astra Pro (batch)"
status: active
maintenance: living
aliases:
  - name: "OpenAI: GPT-6 Astra Pro (batch)"
    class: manual
feeds:
  openrouter-models: openai/gpt-6-astra-pro:batch
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
