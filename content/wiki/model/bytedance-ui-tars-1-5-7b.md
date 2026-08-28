---
id: model/bytedance-ui-tars-1-5-7b
kind: model
display_name: "ByteDance: UI-TARS 7B "
status: active
maintenance: living
aliases:
  - name: "ByteDance: UI-TARS 7B "
    class: manual
feeds:
  openrouter-models: bytedance/ui-tars-1.5-7b
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
