---
id: model/z-ai-glm-4-5v
kind: model
display_name: "Z.ai: GLM 4.5V"
status: active
maintenance: living
aliases:
  - name: "Z.ai: GLM 4.5V"
    class: manual
feeds:
  openrouter-models: z-ai/glm-4.5v
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
timeline:
  - date: "2026-08-29"
    event: active
    source_url: "https://openrouter.ai/api/v1/models"
mentions: []
---
