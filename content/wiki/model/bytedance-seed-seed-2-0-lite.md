---
id: model/bytedance-seed-seed-2-0-lite
kind: model
display_name: "ByteDance Seed: Seed-2.0-Lite"
status: active
maintenance: living
aliases:
  - name: "ByteDance Seed: Seed-2.0-Lite"
    class: manual
feeds:
  openrouter-models: bytedance-seed/seed-2.0-lite
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
