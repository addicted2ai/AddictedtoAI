---
id: model/z-ai-glm-5-1
kind: model
display_name: "Z.ai: GLM 5.1"
status: active
maintenance: living
aliases:
  - name: "Z.ai: GLM 5.1"
    class: manual
feeds:
  openrouter-models: z-ai/glm-5.1
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
    value: "MIT"
    source_url: "https://huggingface.co/zai-org/GLM-5.1"
    accessed: "2026-08-28"
    volatility: slow
  - field: parameters
    source: cited
    value: "754B total"
    source_url: "https://huggingface.co/zai-org/GLM-5.1"
    accessed: "2026-08-28"
    volatility: static
timeline: []
mentions:
  - org/z-ai
  - model/z-ai-glm-5-2
---

The row before this one had no weights to publish. `z-ai/glm-5` — GLM-5
without a decimal, released a month earlier — carries no Hugging Face
listing in the catalog's feed at all. This row does:
{{fact:model/z-ai-glm-5-1#license}}, per the model card for
`zai-org/GLM-5.1`, on {{fact:model/z-ai-glm-5-1#parameters}}. It is the
first row in the GLM-5 line with anything to download.

What it did not ship with was room. This row's context window is
{{fact:model/z-ai-glm-5-1#context_window}} — not small for a model this
size, but not the number Z.ai would use two months later either.
`z-ai/glm-5.2`'s own context window is
{{fact:model/z-ai-glm-5-2#context_window}}, arriving in the very next
point release. Where the catalog's SpaceXAI rows show a context window
shrinking release over release across 2026, Z.ai's GLM line ran the other
way, and grew fastest in the release right after the one that opened the
weights.

The intelligence gain kept pace with the context increase rather than
trading against it. Artificial Analysis's index moves from
{{fact:model/z-ai-glm-5-1#intelligence_index}} on this row to
{{fact:model/z-ai-glm-5-2#intelligence_index}} two months later — the same
release that multiplied the context window also raised the measured
capability, not one at the other's expense.
