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
  - model/z-ai-glm-4-6
  - model/z-ai-glm-4-7
  - model/z-ai-glm-5
  - model/z-ai-glm-5-2
---

Four consecutive main-line GLM releases published the same context window.
`z-ai/glm-4.6` lists {{fact:model/z-ai-glm-4-6#context_window}},
`z-ai/glm-4.7` lists {{fact:model/z-ai-glm-4-7#context_window}},
`z-ai/glm-5` lists {{fact:model/z-ai-glm-5#context_window}}, and this row
lists {{fact:model/z-ai-glm-5-1#context_window}} — the same figure on all
four in the 31 August 2026 snapshot, spanning the six months from
30 September 2025 to 7 April 2026. Whatever Z.ai spent those six months
on, it was not the window.

Some of it went onto the price. `z-ai/glm-5`, listed 11 February 2026,
heads at {{fact:model/z-ai-glm-5#price_input}} for input; this row, eight
weeks later, heads at {{fact:model/z-ai-glm-5-1#price_input}} in the same
snapshot, for an identical window and weights that stay open:
{{fact:model/z-ai-glm-5-1#license}} over
{{fact:model/z-ai-glm-5-1#parameters}}, per the model card for
`zai-org/GLM-5.1`. Each of those is the top listed provider's rate for its
row rather than necessarily Z.ai's own, and the two rows are headed by
different providers, so the distance between them measures the hosts as
much as the models.

Then the plateau broke. Ten weeks after this row, `z-ai/glm-5.2` arrived
listing {{fact:model/z-ai-glm-5-2#context_window}} of context — the largest
single step anywhere in the GLM line — while its input listing stayed
beside this row's instead of climbing with the window:
{{fact:model/z-ai-glm-5-2#price_input}} there against
{{fact:model/z-ai-glm-5-1#price_input}} here. Those two figures come from
different top providers, so how they line up is a fact about hosts rather
than about the models; what the pair does show is that a fivefold
window did not arrive with a fivefold price. This row is the last of the
main line on the old envelope.
