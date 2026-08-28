---
id: model/google-gemini-pro-latest
kind: model
display_name: Google Gemini Pro Latest
status: active
maintenance: living
aliases:
  - name: Google Gemini Pro Latest
    class: manual
feeds:
  openrouter-models: ~google/gemini-pro-latest
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
