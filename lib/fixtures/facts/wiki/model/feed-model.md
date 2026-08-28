---
id: model/feed-model
kind: model
display_name: "Feed Model"
status: active
maintenance: living
aliases:
  - name: "Feed Model"
    class: exclusive
feeds:
  demo-source: "vendor/feed-model"
facts:
  - field: price_input
    source: feed
    feed: demo-source
    path: pricing.prompt
    volatility: fast
  - field: context_window
    source: feed
    feed: demo-source
    path: context_length
    volatility: fast
  # The feed row exists but does not carry this field: it must render as
  # absent, never as a guess (specs/directory).
  - field: output_modalities
    source: feed
    feed: demo-source
    path: architecture.output_modalities
    volatility: slow
timeline: []
mentions: []
---
