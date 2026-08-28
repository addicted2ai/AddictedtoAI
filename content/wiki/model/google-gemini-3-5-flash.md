---
id: model/google-gemini-3-5-flash
kind: model
display_name: "Google: Gemini 3.5 Flash"
status: active
maintenance: living
aliases:
  - name: "Google: Gemini 3.5 Flash"
    class: manual
feeds:
  openrouter-models: google/gemini-3.5-flash
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
  - field: intelligence_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.intelligence_index
    volatility: fast
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
timeline: []
mentions: []
---
