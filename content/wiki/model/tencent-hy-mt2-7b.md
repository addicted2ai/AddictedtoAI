---
id: model/tencent-hy-mt2-7b
kind: model
display_name: "Tencent: Hy-MT2-7B"
status: active
maintenance: living
aliases:
  - name: "Tencent: Hy-MT2-7B"
    class: manual
feeds:
  openrouter-models: tencent/hy-mt2-7b
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
