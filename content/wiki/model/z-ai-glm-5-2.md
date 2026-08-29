---
id: model/z-ai-glm-5-2
kind: model
display_name: "Z.ai: GLM 5.2"
status: active
maintenance: living
aliases:
  - name: "Z.ai: GLM 5.2"
    class: manual
feeds:
  openrouter-models: z-ai/glm-5.2
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
  - field: intelligence_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.intelligence_index
    volatility: fast
timeline: []
mentions: []
---
