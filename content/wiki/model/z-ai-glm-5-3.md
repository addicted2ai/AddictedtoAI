---
id: model/z-ai-glm-5-3
kind: model
display_name: "Z.ai: GLM 5.3"
status: active
maintenance: living
aliases:
  - name: "Z.ai: GLM 5.3"
    class: manual
feeds:
  openrouter-models: z-ai/glm-5.3
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
  - field: expiration_date
    source: feed
    feed: openrouter-models
    path: expiration_date
    volatility: fast
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
timeline: []
mentions: []
---
