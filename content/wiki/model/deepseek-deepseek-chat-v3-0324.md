---
id: model/deepseek-deepseek-chat-v3-0324
kind: model
display_name: "DeepSeek: DeepSeek V3 0324"
status: active
maintenance: living
aliases:
  - name: "DeepSeek: DeepSeek V3 0324"
    class: manual
feeds:
  openrouter-models: deepseek/deepseek-chat-v3-0324
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
