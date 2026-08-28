---
id: model/cognitivecomputations-dolphin-mistral-24b-venice-edition
kind: model
display_name: "Venice: Uncensored"
status: active
maintenance: living
aliases:
  - name: "Venice: Uncensored"
    class: manual
feeds:
  openrouter-models: cognitivecomputations/dolphin-mistral-24b-venice-edition
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
