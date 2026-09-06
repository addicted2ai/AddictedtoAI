---
id: org/bytedance-seed
kind: org
display_name: ByteDance Seed
status: active
maintenance: stable
aliases:
  - name: ByteDance Seed
    class: exclusive
  - name: ByteDance Seed Team
    class: exclusive
  - name: Seed
    class: manual
facts:
  - field: founded
    source: cited
    value: "2023"
    source_url: "https://github.com/ByteDance-Seed"
    accessed: "2026-09-06"
    volatility: static
  - field: labs
    source: cited
    value: "China, Singapore and the U.S."
    source_url: "https://github.com/ByteDance-Seed"
    accessed: "2026-09-06"
    volatility: slow
  - field: research_areas
    source: cited
    value: "large language models, speech, vision, world models, AI infrastructure, next-generation interfaces"
    source_url: "https://github.com/ByteDance-Seed"
    accessed: "2026-09-06"
    volatility: slow
  - field: applications_served
    source: cited
    value: "\"over 50 real-world applications — including Doubao, Coze, and Jimeng\", the team's own count"
    source_url: "https://github.com/ByteDance-Seed"
    accessed: "2026-09-06"
    volatility: slow
  - field: current_text_family
    source: cited
    value: "Seed2.1, in two sizes — Pro and Turbo"
    source_url: "https://seed.bytedance.com/en/seed2_1"
    accessed: "2026-09-06"
    volatility: dated
  - field: china_product_name
    source: cited
    value: "Doubao Seed 2.1, reachable through Doubao and Volcano Engine"
    source_url: "https://seed.bytedance.com/en/blog/seed2-1-officially-released-advancing-ai-productivity"
    accessed: "2026-09-06"
    volatility: dated
  - field: international_serving_name
    source: cited
    value: "dola-seed-2-1-turbo, on BytePlus — the only endpoint the vendor's own product page links to"
    source_url: "https://seed.bytedance.com/en/seed2_1"
    accessed: "2026-09-06"
    volatility: slow
  - field: weights_namespace
    source: cited
    value: "huggingface.co/ByteDance-Seed"
    source_url: "https://huggingface.co/ByteDance-Seed/UI-TARS-1.5-7B"
    accessed: "2026-09-06"
    volatility: slow
  - field: gui_agent_line
    source: cited
    value: "UI-TARS — UI-TARS-1.5-7B open-sourced 2025-04-16, UI-TARS-2 announced 2025-09-04"
    source_url: "https://github.com/bytedance/UI-TARS"
    accessed: "2026-09-06"
    volatility: dated
timeline:
  - date: "2025-04-16"
    event: "UI-TARS-1.5-7B open-sourced under the ByteDance-Seed Hugging Face organisation"
    source_url: "https://huggingface.co/ByteDance-Seed/UI-TARS-1.5-7B"
  - date: "2025-07-22"
    event: "bytedance/ui-tars-1.5-7b listed on OpenRouter — the only row filed under the bytedance provider id"
    source_url: "https://openrouter.ai/bytedance/ui-tars-1.5-7b"
  - date: "2025-09-04"
    event: "UI-TARS-2 announced, described as a major upgrade over UI-TARS-1.5; it has never been listed on OpenRouter"
    source_url: "https://github.com/bytedance/UI-TARS"
  - date: "2025-12-23"
    event: "bytedance-seed/seed-1.6 and bytedance-seed/seed-1.6-flash listed on OpenRouter — the first rows under the bytedance-seed provider id"
    source_url: "https://openrouter.ai/bytedance-seed/seed-1.6"
  - date: "2026-06-19"
    event: "Seed-2.1-Preview released on Arena"
    source_url: "https://seed.bytedance.com/en/blog"
  - date: "2026-06-23"
    event: "Seed2.1 released in two sizes, Pro and Turbo"
    source_url: "https://seed.bytedance.com/en/blog/seed2-1-officially-released-advancing-ai-productivity"
  - date: "2026-08-12"
    event: "bytedance-seed/seed-2-1-turbo listed on OpenRouter, seven weeks after the vendor's release; Seed-2.0-Code arrived the same day"
    source_url: "https://openrouter.ai/bytedance-seed/seed-2-1-turbo"
mentions:
  - model/bytedance-seed-seed-1-6
  - model/bytedance-seed-seed-1-6-flash
  - model/bytedance-seed-seed-2-0-code
  - model/bytedance-seed-seed-2-0-lite
  - model/bytedance-seed-seed-2-0-mini
  - model/bytedance-seed-seed-2-1-turbo
  - model/bytedance-ui-tars-1-5-7b
---

OpenRouter files this team's models under two author ids, `bytedance-seed` and
`bytedance`, and the second one holds exactly one row: `bytedance/ui-tars-1.5-7b`.
The split is a router artefact, not two organisations. OpenRouter's own page for
that row links its weights to
[`huggingface.co/ByteDance-Seed/UI-TARS-1.5-7B`](https://huggingface.co/ByteDance-Seed/UI-TARS-1.5-7B) —
the same Hugging Face organisation the Seed models are published from. ByteDance's
namespaces are inconsistent about it in both directions: the UI-TARS weights sit
under `ByteDance-Seed`, while the code for the same model sits under
[`github.com/bytedance/UI-TARS`](https://github.com/bytedance/UI-TARS). A router
that keys on the publishing prefix inherits that inconsistency and turns it into
two vendors.

The UI-TARS row is also the weakest artefact of the line that produced it, which
is invisible from the catalog. Its model card compares three checkpoints on
OSWorld and puts the released UI-TARS-1.5-7B at 27.5 against 42.5 for the
UI-TARS-1.5 the blog headlines — the larger model was offered only as "early
research access" by writing to `TARS@bytedance.com`. Then on 2025-09-04 the team
announced UI-TARS-2, "a major upgrade from UI-TARS-1.5" spanning GUI, games, code
and tool use. That was a year ago, and the router still shows the April 2025 7B.
Its window is {{fact:model/bytedance-ui-tars-1-5-7b#context_window}} against
{{fact:model/bytedance-seed-seed-2-1-turbo#context_window}} on the newest Seed
row, and reading the two prefixes as separate vendors hides that these are the
same team's oldest and newest listings.

What the `bytedance-seed` prefix carries is a narrow slice of what Seed ships.
The team's [own model menu](https://seed.bytedance.com/en/) names six things:
Seed2.1, Seedance 2.5, Seedream 5.0 Pro, SeedRealtime, Seed Audio 1.0 and Seed
GR-RL. Its [blog index](https://seed.bytedance.com/en/blog) served nine
posts on 2026-09-06, dated 9 April to 5 August 2026; two announce a text model —
Seed2.1 and its preview four days earlier — and the other seven are speech,
audio, image, video and 3D work, or frontier research. A language-model router
can list one of those categories, so the six rows in the catalog as observed on
5 September 2026 were not a partial view of ByteDance Seed. They were the only
view a price-and-context table is capable of.

Within that slice the router carries the junior half. Seed2.1 arrived on
2026-06-23 as "two AI productivity models in different sizes: Pro and Turbo", and
Turbo is the one with a row. That is not the router being selective: the vendor's
own [Seed2.1 page](https://seed.bytedance.com/en/seed2_1) has four buttons, and
both "Try it" and "API" point at BytePlus's
`dola-seed-2-1-turbo`. Pro has no link to click anywhere on the page. Yet the
comparison table further down that same page is Pro's: of its twenty-three
benchmarks Turbo comes out ahead on two — BeyondAIME, 88.0 to 87.0, and
Workspace Bench, 54.7 to 53.0 — and trails on the other twenty-one. The model you
can actually call abroad is the one the vendor benchmarks second.

The naming is worth writing down once, because the same family answers to four
strings depending on where you meet it. The research site calls it Seed2.1. The
[release post](https://seed.bytedance.com/en/blog/seed2-1-officially-released-advancing-ai-productivity)
says "Doubao and Volcano Engine users can now start to access Doubao
Seed 2.1". BytePlus sells it as `dola-seed-2-1-turbo`. OpenRouter calls it
`bytedance-seed/seed-2-1-turbo`. That is not branding trivia: neither `doubao`
nor `dola` occurs anywhere in the OpenRouter snapshot of 5 September 2026, so the
two names ByteDance actually ships this model under at home and abroad are both
unsearchable in the one table a router user has.
