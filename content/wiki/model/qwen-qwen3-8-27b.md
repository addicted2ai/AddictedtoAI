---
id: model/qwen-qwen3-8-27b
kind: model
display_name: "Qwen: Qwen3.8 27B"
status: active
maintenance: living
aliases:
  - name: "Qwen: Qwen3.8 27B"
    class: manual
feeds:
  openrouter-models: qwen/qwen3.8-27b
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
    value: "Apache License 2.0"
    source_url: "https://huggingface.co/Qwen/Qwen3.8-27B"
    accessed: "2026-08-28"
    volatility: slow
  - field: parameters
    source: cited
    value: "27B"
    source_url: "https://huggingface.co/Qwen/Qwen3.8-27B"
    accessed: "2026-08-28"
    volatility: static
  - field: generation_claim
    source: cited
    value: "Qwen3.8, the most capable generation in the Qwen open-model family to date"
    source_url: "https://huggingface.co/Qwen/Qwen3.8-27B"
    accessed: "2026-08-28"
    volatility: slow
timeline: []
mentions:
  - org/alibaba-cloud
  - model/qwen-qwen3-8-max
  - model/qwen-qwen3-8-2-4t-a95b
  - model/qwen-qwen3-6-27b
---

The superlative on this model's card is not about this model. The Hugging
Face page for `Qwen/Qwen3.8-27B` introduces
{{fact:model/qwen-qwen3-8-27b#generation_claim}} — the subject is the
Qwen3.8 generation, not the 27B row carrying the sentence. Within that
generation the open lead belongs elsewhere: `qwen/qwen3.8-2.4t-a95b`,
listed two days before this row, is open by the same test — it carries a
Hugging Face id where the cloud-only `qwen/qwen3.8-max` carries none — and
in the 28 August 2026 snapshot it outscores this row on the Artificial
Analysis intelligence index. A reader who takes the card's line as a claim
about the 27B is reading past the model that beats it.

What is genuinely new here is the window. One generation earlier and at
the same size, `qwen/qwen3.6-27b` listed
{{fact:model/qwen-qwen3-6-27b#context_window}} of context; this row lists
{{fact:model/qwen-qwen3-8-27b#context_window}}. Every Qwen release with
published weights before August 2026 stops at the smaller of those two
figures — the ceiling held from July 2025 to August 2026, across more than
thirty rows with published weights, and then broke twice, two days apart:
once on `qwen/qwen3.8-2.4t-a95b` at
{{fact:model/qwen-qwen3-8-2-4t-a95b#context_window}}, and once here, on a
model of {{fact:model/qwen-qwen3-8-27b#parameters}}.

The licence is what makes that size matter. Alibaba Cloud's record of its
policy reads {{fact:org/alibaba-cloud#weights_license}}, and this row sits
on the permissive side of the split:
{{fact:model/qwen-qwen3-8-27b#license}}, which carries no field-of-use and
no user-count clause. Against the closed flagship's
{{fact:model/qwen-qwen3-8-max#price_input}} input this row lists
{{fact:model/qwen-qwen3-8-27b#price_input}} — and on self-hosted weights
that per-token rate is optional entirely.
