---
id: model/inference-net-schematron-v2-small
kind: model
display_name: "Inference.net: Schematron V2 Small"
status: active
maintenance: living
aliases:
  - name: "Inference.net: Schematron V2 Small"
    class: manual
feeds:
  openrouter-models: inference-net/schematron-v2-small
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
timeline: [ { date: "2026-09-12", event: arrived, source_url: https://openrouter.ai/api/v1/models } ]
mentions: []
---
