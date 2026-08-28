---
id: model/google-gemini-2-5-flash-lite-batch
kind: model
display_name: "Google: Gemini 2.5 Flash Lite (batch)"
status: active
maintenance: living
aliases:
  - name: "Google: Gemini 2.5 Flash Lite (batch)"
    class: manual
feeds:
  openrouter-models: google/gemini-2.5-flash-lite:batch
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
