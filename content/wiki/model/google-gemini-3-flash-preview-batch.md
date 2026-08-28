---
id: model/google-gemini-3-flash-preview-batch
kind: model
display_name: "Google: Gemini 3 Flash Preview (batch)"
status: active
maintenance: living
aliases:
  - name: "Google: Gemini 3 Flash Preview (batch)"
    class: manual
feeds:
  openrouter-models: google/gemini-3-flash-preview:batch
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
