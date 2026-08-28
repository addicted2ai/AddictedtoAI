---
id: model/nex-agi-nex-n2-mini
kind: model
display_name: "Nex AGI: Nex-N2-Mini"
status: active
maintenance: living
aliases:
  - name: "Nex AGI: Nex-N2-Mini"
    class: manual
feeds:
  openrouter-models: nex-agi/nex-n2-mini
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
