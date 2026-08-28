---
id: model/bytedance-seed-seed-1-6
kind: model
display_name: "ByteDance Seed: Seed 1.6"
status: active
maintenance: living
aliases:
  - name: "ByteDance Seed: Seed 1.6"
    class: manual
feeds:
  openrouter-models: bytedance-seed/seed-1.6
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
