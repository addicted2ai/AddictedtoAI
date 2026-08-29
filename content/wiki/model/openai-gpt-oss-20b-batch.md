---
id: model/openai-gpt-oss-20b-batch
kind: model
display_name: "OpenAI: gpt-oss-20b (batch)"
status: active
maintenance: living
aliases:
  - name: "OpenAI: gpt-oss-20b (batch)"
    class: manual
feeds:
  openrouter-models: openai/gpt-oss-20b:batch
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
