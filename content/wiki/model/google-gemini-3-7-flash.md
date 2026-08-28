---
id: model/google-gemini-3-7-flash
kind: model
display_name: "Google: Gemini 3.7 Flash"
status: active
maintenance: living
aliases:
  - name: "Google: Gemini 3.7 Flash"
    class: manual
feeds:
  openrouter-models: google/gemini-3.7-flash
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
