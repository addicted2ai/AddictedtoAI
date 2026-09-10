---
id: model/nex-agi-nex-n2-5-mini-free
kind: model
display_name: "Nex AGI: Nex-N2.5-Mini (free)"
status: active
maintenance: living
aliases:
  - name: "Nex AGI: Nex-N2.5-Mini (free)"
    class: manual
feeds:
  openrouter-models: nex-agi/nex-n2.5-mini:free
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
timeline: [ { date: "2026-09-09", event: arrived, source_url: https://openrouter.ai/api/v1/models } ]
mentions: []
domains_seeded:
  - image
---
