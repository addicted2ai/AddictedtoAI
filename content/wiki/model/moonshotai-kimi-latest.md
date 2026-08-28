---
id: model/moonshotai-kimi-latest
kind: model
display_name: MoonshotAI Kimi Latest
status: active
maintenance: living
aliases:
  - name: MoonshotAI Kimi Latest
    class: manual
feeds:
  openrouter-models: ~moonshotai/kimi-latest
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
