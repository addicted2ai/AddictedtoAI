---
id: model/liquid-lfm-2-5-2-6b-free
kind: model
display_name: "LiquidAI: LFM2.5-2.6B (free)"
status: active
maintenance: living
aliases:
  - name: "LiquidAI: LFM2.5-2.6B (free)"
    class: manual
feeds:
  openrouter-models: liquid/lfm-2.5-2.6b:free
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
