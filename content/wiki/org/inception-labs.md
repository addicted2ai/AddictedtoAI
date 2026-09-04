---
id: org/inception-labs
kind: org
display_name: Inception Labs
status: active
maintenance: living
aliases:
  - name: Inception Labs
    class: exclusive
  - name: Inception
    class: shared
facts:
  - field: product
    source: cited
    value: "diffusion-based large language models (dLLMs); it calls Mercury 'the world's first commercially available family of diffusion large language models'"
    source_url: "https://www.inceptionlabs.ai/about"
    accessed: "2026-09-03"
    volatility: slow
  - field: architecture
    source: cited
    value: "diffusion rather than autoregressive generation: models produce many tokens in parallel, which Inception says makes them 'several times faster and less than half the cost of conventional LLMs'"
    source_url: "https://www.inceptionlabs.ai/"
    accessed: "2026-09-03"
    volatility: static
  - field: team_origins
    source: cited
    value: "leading researchers and engineers from Stanford, UCLA, Cornell, Google DeepMind, Meta AI, Microsoft AI, and OpenAI"
    source_url: "https://www.inceptionlabs.ai/"
    accessed: "2026-09-03"
    volatility: static
  - field: deployment_claim
    source: cited
    value: "currently deploying these diffusion LLMs at Fortune 500 companies"
    source_url: "https://www.inceptionlabs.ai/"
    accessed: "2026-09-03"
    volatility: slow
timeline:
  - date: "2026-03-04"
    event: "Mercury 2 released"
    source_url: "https://openrouter.ai/inception/mercury-2"
  - date: "2026-08-31"
    event: "Mercury 2.5 Preview released"
    source_url: "https://openrouter.ai/inception/mercury-2.5-preview"
  - date: "2026-09-02"
    event: "the OpenRouter change feed records the Mercury 2.5 Preview row's arrival"
    source_url: "https://openrouter.ai/api/v1/models"
  - date: "2026-09-03"
    event: "the llm-releases feed records the Mercury 2.5 Preview row's arrival; it dates the release August 31"
    source_url: "https://llm-releases.com/models/mercury-2-5-preview"
mentions:
  - model/inception-mercury-2
  - model/inception-mercury-2-5-preview
---

The diffusion category in this catalog is two rows, and both are this lab's:
`inception/mercury-2` and `inception/mercury-2.5-preview` are the only rows in
the current OpenRouter snapshot whose listings describe a diffusion model. The
descriptions Inception wrote for them define the class against itself — Mercury
2 is "the first reasoning diffusion LLM (dLLM)", Mercury 2.5 "the latest" — and
no other listing in the snapshot claims one. A reader comparing this lab with
any other is comparing a different mechanism, not a faster one of the same
kind.

Inception's own pages make the pitch the router repeats. The about page describes
{{fact:org/inception-labs#product}}, and the mechanism is the pitch:
{{fact:org/inception-labs#architecture}}. The team is
{{fact:org/inception-labs#team_origins}}, and the lab says it is
{{fact:org/inception-labs#deployment_claim}} — all of it the vendor speaking.
The catalog's part of the story is narrower: two rows, and the newer one is an
explicit preview — API-only, no weights released, per
[its llm-releases entry](https://llm-releases.com/models/mercury-2-5-preview).

Six months apart — 4 March to 31 August 2026 — the second was announced as a
preview positioned above the first. The about page links
the papers behind the mechanism, under "some of the technologies we've
developed": among them, the foundation line (Diffusion Models, Flash Attention,
Direct Preference Optimization) and the discrete-diffusion line Mercury descends
from
(Masked Diffusion, Block Diffusion, Remasking Diffusion, and
[d1 Reasoning](https://arxiv.org/abs/2504.12216v1), the April 2025 framework
that adapts pre-trained masked dLLMs into reasoning models via SFT and RL).
The family page footnotes that
[Mercury 1 and Mercury Edit 2](https://www.inceptionlabs.ai/models) "remain
supported for existing customers" — the only commitment a listed model
carries there.