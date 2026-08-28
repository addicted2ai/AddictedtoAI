---
id: model/anthracite-org-magnum-v4-72b
kind: model
display_name: Magnum v4 72B
status: active
maintenance: living
aliases:
  - name: Magnum v4 72B
    class: manual
feeds:
  openrouter-models: anthracite-org/magnum-v4-72b
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
