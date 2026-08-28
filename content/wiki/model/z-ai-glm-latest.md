---
id: model/z-ai-glm-latest
kind: model
display_name: "Z.ai: GLM Latest"
status: active
maintenance: living
aliases:
  - name: "Z.ai: GLM Latest"
    class: manual
feeds:
  openrouter-models: ~z-ai/glm-latest
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
