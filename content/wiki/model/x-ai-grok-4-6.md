---
id: model/x-ai-grok-4-6
kind: model
display_name: "SpaceXAI: Grok 4.6"
status: active
maintenance: living
aliases:
  - name: "SpaceXAI: Grok 4.6"
    class: manual
  - name: "Grok 4.6"
    class: exclusive
  - name: "x-ai/grok-4.6"
    class: exclusive
feeds:
  openrouter-models: x-ai/grok-4.6
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
  - field: max_output_tokens
    source: feed
    feed: openrouter-models
    path: top_provider.max_completion_tokens
    volatility: fast
  - field: intelligence_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.intelligence_index
    volatility: fast
  - field: coding_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.coding_index
    volatility: fast
  - field: agentic_index
    source: feed
    feed: openrouter-models
    path: benchmarks.artificial_analysis.agentic_index
    volatility: fast
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
  - field: reasoning_mandatory
    source: feed
    feed: openrouter-models
    path: reasoning.mandatory
    volatility: slow
  - field: default_reasoning_effort
    source: feed
    feed: openrouter-models
    path: reasoning.default_effort
    volatility: slow
  - field: listed_date
    source: cited
    value: "2026-08-12"
    source_url: "https://openrouter.ai/x-ai/grok-4.6"
    accessed: "2026-08-28"
    volatility: dated
  - field: vendor_description
    source: cited
    value: "SpaceXAI's smartest model with frontier performance on coding, knowledge work, and STEM"
    source_url: "https://openrouter.ai/x-ai/grok-4.6"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2026-08-12"
    event: "listed as SpaceXAI's frontier model, keeping the shortened context window introduced with the July release"
    source_url: "https://openrouter.ai/x-ai/grok-4.6"
mentions:
  - org/spacexai
  - model/x-ai-grok-4-5
  - model/x-ai-grok-4-3
  - model/x-ai-grok-4-20
---

Reasoning went from optional to compulsory in the same window this lab
already has an unexplained architecture change on record. `x-ai/grok-4.3`'s
own `reasoning.mandatory` value reads
{{fact:model/x-ai-grok-4-3#reasoning_mandatory}}, with a default effort of
{{fact:model/x-ai-grok-4-3#default_reasoning_effort}} on the requests that
used it at all. This row's same two fields read
{{fact:model/x-ai-grok-4-6#reasoning_mandatory}} and
{{fact:model/x-ai-grok-4-6#default_reasoning_effort}}: reasoning can no
longer be switched off, and by default it now runs at the setting 4.3
treated as its top tier rather than skipping.

The org record for this lab already treats a matching contraction in
advertised context window, across these same four releases, as an
unexplained change that was never marketed as a trade. This is a second
change landing in the same stretch: a request that used to default to no
reasoning at all now defaults to the heaviest setting on offer. Neither
row states that one change bought the other — only that the catalog now
records both happening on the same release.

What the mandatory-reasoning setting bought, if anything, shows up in the
same three-index scoreboard both rows carry. Between the two releases the
Artificial Analysis agentic index moved from
{{fact:model/x-ai-grok-4-3#agentic_index}} to
{{fact:model/x-ai-grok-4-6#agentic_index}}, the coding index from
{{fact:model/x-ai-grok-4-3#coding_index}} to
{{fact:model/x-ai-grok-4-6#coding_index}}, and the intelligence index from
{{fact:model/x-ai-grok-4-3#intelligence_index}} to
{{fact:model/x-ai-grok-4-6#intelligence_index}}. All three moved the same
direction as the reasoning setting — whether that is the setting's effect,
the price increase's effect, or three months of everything else changing
at once is not something either row can separate out on its own.
