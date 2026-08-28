---
id: model/meituan-longcat-2-0
kind: model
display_name: "Meituan: LongCat 2.0"
status: active
maintenance: living
aliases:
  - name: "Meituan: LongCat 2.0"
    class: manual
feeds:
  openrouter-models: meituan/longcat-2.0
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
