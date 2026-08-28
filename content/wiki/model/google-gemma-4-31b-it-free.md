---
id: model/google-gemma-4-31b-it-free
kind: model
display_name: "Google: Gemma 4 31B (free)"
status: active
maintenance: living
aliases:
  - name: "Google: Gemma 4 31B (free)"
    class: manual
feeds:
  openrouter-models: google/gemma-4-31b-it:free
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
