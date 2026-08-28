---
id: model/google-gemini-2-5-flash-image
kind: model
display_name: "Google: Nano Banana (Gemini 2.5 Flash Image)"
status: active
maintenance: living
aliases:
  - name: "Google: Nano Banana (Gemini 2.5 Flash Image)"
    class: manual
feeds:
  openrouter-models: google/gemini-2.5-flash-image
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
