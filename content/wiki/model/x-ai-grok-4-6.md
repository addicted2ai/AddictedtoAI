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

This release moved the scoreboard without moving anything a buyer pays
for. In the 28 August 2026 snapshot this row and `x-ai/grok-4.5` list the
same context window — {{fact:model/x-ai-grok-4-5#context_window}} there
against {{fact:model/x-ai-grok-4-6#context_window}} here — the same input
price, {{fact:model/x-ai-grok-4-5#price_input}} against
{{fact:model/x-ai-grok-4-6#price_input}}, and the same output price,
{{fact:model/x-ai-grok-4-5#price_output}} against
{{fact:model/x-ai-grok-4-6#price_output}}.

What separates them is measurement. Artificial Analysis's intelligence
index reads {{fact:model/x-ai-grok-4-5#intelligence_index}} on the July
row and {{fact:model/x-ai-grok-4-6#intelligence_index}} on this one, five
weeks later, with this row's coding index at
{{fact:model/x-ai-grok-4-6#coding_index}} and its agentic index at
{{fact:model/x-ai-grok-4-6#agentic_index}}. Same window, same meter,
higher numbers.

The envelope moved a release earlier, and so did the reasoning settings
this row is often credited with. `x-ai/grok-4.3` listed
{{fact:model/x-ai-grok-4-3#context_window}} of context at
{{fact:model/x-ai-grok-4-3#price_input}} input, and read
{{fact:model/x-ai-grok-4-3#reasoning_mandatory}} for
`reasoning.mandatory` at an effort of
{{fact:model/x-ai-grok-4-3#default_reasoning_effort}}; this row reads
{{fact:model/x-ai-grok-4-6#reasoning_mandatory}} at
{{fact:model/x-ai-grok-4-6#default_reasoning_effort}}. Grok 4.5 is where
that flipped — in the same snapshot it already carries this row's pair,
along with the halved window and the raised price — and the only reasoning
difference left between the two is an extra `xhigh` effort tier here.
Anyone dating the end of optional reasoning to
{{fact:model/x-ai-grok-4-6#listed_date}} is a month late.
