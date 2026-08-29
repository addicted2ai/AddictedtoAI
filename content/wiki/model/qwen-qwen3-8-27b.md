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
  - field: self_description
    source: cited
    value: "the most capable generation in the Qwen open-model family to date"
    source_url: "https://huggingface.co/Qwen/Qwen3.8-27B"
    accessed: "2026-08-28"
    volatility: slow
timeline: []
mentions:
  - org/alibaba-cloud
  - model/qwen-qwen3-8-max
---

Alibaba's own card for this release does not hedge:
{{fact:model/qwen-qwen3-8-27b#self_description}}, per the Hugging Face page
for `Qwen/Qwen3.8-27B`. The claim is scoped to the open half of the Qwen
line specifically — Alibaba Cloud's own record of its licensing policy
states {{fact:org/alibaba-cloud#weights_license}}, and this row sits on
the permissive side of that split: {{fact:model/qwen-qwen3-8-27b#license}}
over {{fact:model/qwen-qwen3-8-27b#parameters}}.

Eleven days earlier, Alibaba had already shipped the model this one does
not have to beat to earn that description. `qwen/qwen3.8-max` — the
cloud-only flagship of the same generation — carries no Hugging Face
listing in the catalog's feed at all; there is nothing under that row to
download. On the Artificial Analysis intelligence index, the closed
flagship scores {{fact:model/qwen-qwen3-8-max#intelligence_index}} against
this row's {{fact:model/qwen-qwen3-8-27b#intelligence_index}}: the open
model Alibaba calls its most capable open release is not the model that
actually tops its own family's scoreboard.

What the smaller, open row does undercut the closed one on is price. This
row lists at {{fact:model/qwen-qwen3-8-27b#price_input}} input against the
closed flagship's {{fact:model/qwen-qwen3-8-max#price_input}}, for a model
that trails it by only a handful of points on the index above. And unlike
the flagship, this row's price is optional:
{{fact:model/qwen-qwen3-8-27b#license}} carries no field-of-use or
user-count clause, so a self-hosted deployment pays nothing per token at
all.
