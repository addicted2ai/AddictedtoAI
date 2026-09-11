---
id: model/sakana-fugu-ultra-v2
kind: model
display_name: "Sakana: Fugu Ultra v2"
status: active
maintenance: living
aliases:
  - name: "Sakana: Fugu Ultra v2"
    class: manual
feeds:
  openrouter-models: sakana/fugu-ultra-v2
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
timeline: [ { date: "2026-09-11", event: arrived, source_url: https://openrouter.ai/api/v1/models } ]
mentions: []
domains_seeded:
  - image
---
