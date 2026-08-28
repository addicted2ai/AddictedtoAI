---
id: model/google-gemini-2-5-pro-preview-05-06
kind: model
display_name: "Google: Gemini 2.5 Pro Preview 05-06"
status: active
maintenance: living
aliases:
  - name: "Google: Gemini 2.5 Pro Preview 05-06"
    class: manual
feeds:
  openrouter-models: google/gemini-2.5-pro-preview-05-06
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
