---
id: model/baidu-ernie-4-5-vl-424b-a47b
kind: model
display_name: "Baidu: ERNIE 4.5 VL 424B A47B "
status: active
maintenance: living
aliases:
  - name: "Baidu: ERNIE 4.5 VL 424B A47B "
    class: manual
feeds:
  openrouter-models: baidu/ernie-4.5-vl-424b-a47b
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
