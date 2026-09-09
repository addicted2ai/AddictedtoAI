---
id: model/deepseek-deepseek-v4-flash-vision-exp-batch
kind: model
display_name: "DeepSeek: DeepSeek V4 Flash Vision Exp (batch)"
status: active
maintenance: living
aliases:
  - name: "DeepSeek: DeepSeek V4 Flash Vision Exp (batch)"
    class: manual
feeds:
  openrouter-models: deepseek/deepseek-v4-flash-vision-exp:batch
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
timeline: [ { date: "2026-09-09", event: arrived, source_url: https://openrouter.ai/api/v1/models } ]
mentions: []
domains_seeded:
  - image
---
