---
id: model/cohere-command-a
kind: model
display_name: "Cohere: Command A"
status: active
maintenance: living
aliases:
  - name: "Cohere: Command A"
    class: manual
feeds:
  openrouter-models: cohere/command-a
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
  - field: license
    source: cited
    value: "CC-BY-NC, plus Cohere Labs' Acceptable Use Policy — commercial use is prohibited"
    source_url: "https://huggingface.co/CohereLabs/c4ai-command-a-03-2025"
    accessed: "2026-08-29"
    volatility: slow
  - field: parameters
    source: cited
    value: "111B"
    source_url: "https://huggingface.co/CohereLabs/c4ai-command-a-03-2025"
    accessed: "2026-08-29"
    volatility: static
  - field: listed_date
    source: cited
    value: "2025-03-13"
    source_url: "https://openrouter.ai/cohere/command-a"
    accessed: "2026-08-29"
    volatility: dated
timeline: []
mentions:
  - model/deepseek-deepseek-v4-flash-0731
---

The word "open" does less work on this row than it does on most of this
catalog's other open-weight releases. Command A's weights are
downloadable, but under {{fact:model/cohere-command-a#license}}, per the
model card for `CohereLabs/c4ai-command-a-03-2025`. That is not the MIT
or Apache terms most of this catalog's other open releases carry:
downloading the weights is free, but the licence does not permit building
a commercial product on them at all.

The restriction is not attached to a small model, either. Command A
publishes at {{fact:model/cohere-command-a#parameters}}, listed
{{fact:model/cohere-command-a#listed_date}} with a
{{fact:model/cohere-command-a#context_window}} context window — a
full-sized release, not a research checkpoint scoped down to make the
non-commercial terms easier to accept.

Nor is the restriction obviously buying this row competitive standing. On
the Artificial Analysis intelligence index, Command A scores
{{fact:model/cohere-command-a#intelligence_index}}, against
{{fact:model/deepseek-deepseek-v4-flash-0731#intelligence_index}} for
DeepSeek's `deepseek-ai/DeepSeek-V4-Flash-0731` — a model listed more than
a year later, whose OpenRouter row heads at
{{fact:model/deepseek-deepseek-v4-flash-0731#price_input}} input, and which
is licensed under plain MIT with no commercial restriction whatsoever. That
figure is the top listed provider's rate for that row rather than
necessarily DeepSeek's own, because a licence with no commercial
restriction is exactly what lets anyone else host the weights and quote a
price for them. A non-commercial licence is a harder sell on a model
trailing a permissively licensed rival than on one that leads.
