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
four in the 28 August 2026 snapshot, spanning the six months from
30 September 2025 to 7 April 2026. Whatever Z.ai spent those six months
on, it was not the window.

Some of it went onto the price. `z-ai/glm-5`, listed 11 February 2026,
charges {{fact:model/z-ai-glm-5#price_input}} for input; this row, eight
weeks later, charges {{fact:model/z-ai-glm-5-1#price_input}} — roughly
double, in the same snapshot, for an identical window and weights that
stay open: {{fact:model/z-ai-glm-5-1#license}} over
{{fact:model/z-ai-glm-5-1#parameters}}, per the model card for
`zai-org/GLM-5.1`.

Then the plateau broke, and it broke cheaply. Ten weeks after this row,
`z-ai/glm-5.2` arrived listing {{fact:model/z-ai-glm-5-2#context_window}}
of context — the largest single step anywhere in the GLM line — at
{{fact:model/z-ai-glm-5-2#price_input}} input, which in that same snapshot
sits *below* what this row charges. Artificial Analysis's index rose with
it, from {{fact:model/z-ai-glm-5-1#intelligence_index}} here to
{{fact:model/z-ai-glm-5-2#intelligence_index}} there, so the extra room
did not come out of measured capability. This row is the last one that
asked more money for the old envelope.
