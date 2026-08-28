---
id: model/dots-studio-dots-3-note-preview-free
kind: model
display_name: "Dots Studio: Dots3-Note Preview (free)"
status: deprecated
maintenance: living
aliases:
  - name: "Dots Studio: Dots3-Note Preview (free)"
    class: manual
feeds:
  openrouter-models: dots-studio/dots-3-note-preview:free
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
