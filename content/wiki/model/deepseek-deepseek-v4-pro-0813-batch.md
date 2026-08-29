---
id: model/deepseek-deepseek-v4-pro-0813-batch
kind: model
display_name: "DeepSeek: DeepSeek V4 Pro 0813 (batch)"
status: active
maintenance: living
aliases:
  - name: "DeepSeek: DeepSeek V4 Pro 0813 (batch)"
    class: manual
feeds:
  openrouter-models: deepseek/deepseek-v4-pro-0813:batch
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
