---
id: model/openrouter-bodybuilder
kind: model
display_name: Body Builder (beta)
status: active
maintenance: living
aliases:
  - name: Body Builder (beta)
    class: manual
feeds:
  openrouter-models: openrouter/bodybuilder
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
