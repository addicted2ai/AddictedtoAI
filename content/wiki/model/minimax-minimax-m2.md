---
id: model/minimax-minimax-m2
kind: model
display_name: "MiniMax: MiniMax M2"
status: active
maintenance: living
aliases:
  - name: "MiniMax: MiniMax M2"
    class: manual
feeds:
  openrouter-models: minimax/minimax-m2
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
  - field: license
    source: cited
    value: "Modified MIT License — commercial products or services with more than 100 million monthly active users, or more than US$30 million in annual recurring revenue, must prominently display \"MiniMax M2\" in the user interface"
    source_url: "https://github.com/MiniMax-AI/MiniMax-M2/blob/main/LICENSE"
    accessed: "2026-08-29"
    volatility: slow
  - field: parameters
    source: cited
    value: "230B total, 10B active"
    source_url: "https://huggingface.co/MiniMaxAI/MiniMax-M2"
    accessed: "2026-08-29"
    volatility: static
  - field: listed_date
    source: cited
    value: "2025-10-23"
    source_url: "https://openrouter.ai/minimax/minimax-m2"
    accessed: "2026-08-29"
    volatility: dated
timeline: []
mentions:
  - org/deepseek
  - org/moonshot-ai
  - model/deepseek-deepseek-v4-flash-0731
  - model/moonshotai-kimi-k3
  - model/moonshotai-kimi-k2-5
  - model/z-ai-glm-5-1
---
