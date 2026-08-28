---
id: model/bytedance-seed-seed-2-0-mini
kind: model
display_name: "ByteDance Seed: Seed-2.0-Mini"
status: active
maintenance: living
aliases:
  - name: "ByteDance Seed: Seed-2.0-Mini"
    class: manual
feeds:
  openrouter-models: bytedance-seed/seed-2.0-mini
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
