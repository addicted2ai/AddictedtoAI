---
id: model/google-gemini-flash-latest
kind: model
display_name: Google Gemini Flash Latest
status: active
maintenance: living
aliases:
  - name: Google Gemini Flash Latest
    class: manual
feeds:
  openrouter-models: ~google/gemini-flash-latest
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
