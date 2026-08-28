---
id: model/x-ai-grok-4-3
kind: model
display_name: "SpaceXAI: Grok 4.3"
status: active
maintenance: living
aliases:
  - name: "SpaceXAI: Grok 4.3"
    class: manual
feeds:
  openrouter-models: x-ai/grok-4.3
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
