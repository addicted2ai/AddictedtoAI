---
id: model/nvidia-nemotron-3-super-120b-a12b-free
kind: model
display_name: "NVIDIA: Nemotron 3 Super (free)"
status: active
maintenance: living
aliases:
  - name: "NVIDIA: Nemotron 3 Super (free)"
    class: manual
feeds:
  openrouter-models: nvidia/nemotron-3-super-120b-a12b:free
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
