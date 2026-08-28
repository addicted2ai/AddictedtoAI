---
id: model/gryphe-mythomax-l2-13b
kind: model
display_name: MythoMax 13B
status: active
maintenance: living
aliases:
  - name: MythoMax 13B
    class: manual
feeds:
  openrouter-models: gryphe/mythomax-l2-13b
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
