---
id: model/anthropic-claude-fable-5
kind: model
display_name: "Anthropic: Claude Fable 5"
status: active
maintenance: living
aliases:
  - name: "Anthropic: Claude Fable 5"
    class: manual
feeds:
  openrouter-models: anthropic/claude-fable-5
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
  - field: covered_model_designated
    source: cited
    value: "2026-06-09"
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
    accessed: "2026-09-06"
    volatility: dated
  - field: covered_model_status
    source: cited
    value: "Generally available"
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
    accessed: "2026-09-06"
    volatility: slow
  - field: covered_model_availability
    source: cited
    value: "Claude applications, Claude Platform, Amazon Bedrock, Google Cloud Agent Platform, Microsoft Foundry"
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
    accessed: "2026-09-06"
    volatility: slow
  - field: zero_data_retention
    source: cited
    value: "not available in workspaces, Claude Enterprise organizations, or third-party platforms (e.g., Azure Subscriptions) where Covered Models can be accessed"
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
    accessed: "2026-09-06"
    volatility: slow
timeline:
  - date: "2026-06-09"
    event: "designated a Covered Model by Anthropic"
    source_url: "https://support.claude.com/en/articles/15425695-covered-models"
mentions: []
---
