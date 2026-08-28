---
id: model/google-gemini-3-1-flash-image-preview
kind: model
display_name: "Google: Nano Banana 2 (Gemini 3.1 Flash Image Preview)"
status: active
maintenance: living
aliases:
  - name: "Google: Nano Banana 2 (Gemini 3.1 Flash Image Preview)"
    class: manual
feeds:
  openrouter-models: google/gemini-3.1-flash-image-preview
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
