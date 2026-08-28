---
id: model/moonshotai-kimi-k2
kind: model
display_name: "MoonshotAI: Kimi K2 0711"
status: active
maintenance: living
aliases:
  - name: "MoonshotAI: Kimi K2 0711"
    class: manual
feeds:
  openrouter-models: moonshotai/kimi-k2
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
