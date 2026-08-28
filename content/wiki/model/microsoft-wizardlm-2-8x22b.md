---
id: model/microsoft-wizardlm-2-8x22b
kind: model
display_name: WizardLM-2 8x22B
status: active
maintenance: living
aliases:
  - name: WizardLM-2 8x22B
    class: manual
feeds:
  openrouter-models: microsoft/wizardlm-2-8x22b
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
