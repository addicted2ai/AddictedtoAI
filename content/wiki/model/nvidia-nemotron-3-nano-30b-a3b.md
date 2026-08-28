---
id: model/nvidia-nemotron-3-nano-30b-a3b
kind: model
display_name: "NVIDIA: Nemotron 3 Nano 30B A3B"
status: active
maintenance: living
aliases:
  - name: "NVIDIA: Nemotron 3 Nano 30B A3B"
    class: manual
feeds:
  openrouter-models: nvidia/nemotron-3-nano-30b-a3b
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
