---
id: model/kwaipilot-kat-coder-air-v2-5
kind: model
display_name: "Kwaipilot: KAT-Coder-Air V2.5"
status: active
maintenance: living
aliases:
  - name: "Kwaipilot: KAT-Coder-Air V2.5"
    class: manual
feeds:
  openrouter-models: kwaipilot/kat-coder-air-v2.5
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
