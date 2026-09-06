---
id: org/aion-labs
kind: org
display_name: AionLabs
status: active
maintenance: living
aliases:
  - name: AionLabs
    class: exclusive
  - name: Aion Labs
    class: shared
  - name: Aion
    class: manual
  - name: Deep Forge
    class: manual
facts:
  - field: operator
    source: cited
    value: "the terms of service are 'a legally binding agreement between you and Deep Forge sp. z o.o. (NIP: 1231533694), the company operating Aion Labs', and they 'shall be governed by and construed in accordance with the laws of the Republic of Poland'"
    source_url: "https://www.aionlabs.ai/terms/"
    accessed: "2026-09-06"
    volatility: slow
  - field: router_recorded_headquarters
    source: cited
    value: "OpenRouter's provider record for aion-labs gives headquarters \"IL\" and an empty datacenters list"
    source_url: "https://openrouter.ai/api/v1/providers"
    accessed: "2026-09-06"
    volatility: slow
  - field: second_product
    source: cited
    value: "alongside the model API, email agents — 'Deploy agents with a dedicated email address', each of which 'Runs on its own isolated computer with full internet access' and can 'edit and return documents in the reply'"
    source_url: "https://www.aionlabs.ai/"
    accessed: "2026-09-06"
    volatility: slow
  - field: public_model_endpoint
    source: cited
    value: "an OpenAI-compatible API at https://api.aionlabs.ai/v1 whose GET /v1/models 'endpoint is publicly accessible without authentication'"
    source_url: "https://www.aionlabs.ai/docs/"
    accessed: "2026-09-06"
    volatility: slow
  - field: vendor_model_list
    source: cited
    value: "the vendor's own model endpoint returns exactly four models — aion-labs/aion-2.0, aion-labs/aion-3.0, aion-labs/aion-3.0-mini and aion-labs/aion-rp-llama-3.1-8b — every one of them is_moderated false"
    source_url: "https://api.aionlabs.ai/v1/models"
    accessed: "2026-09-06"
    volatility: fast
  - field: vendor_release_dates
    source: cited
    value: "the vendor's own model table carries a Released tag per row: Aion-RP 1.0 (8B) 2024-11-30, Aion 2.0 2025-12-21, Aion 3.0 2026-05-05, Aion 3.0 Mini 2026-05-14"
    source_url: "https://www.aionlabs.ai/docs/models/"
    accessed: "2026-09-06"
    volatility: static
  - field: open_weights
    source: cited
    value: "two Hugging Face repositories and no others: aion-labs/Aion-RP-Llama-3.1-8B, created 2024-11-09, declaring base_model meta-llama/Llama-3.1-8B, and aion-labs/Aion-RP-Llama-3.1-8B-GGUF, created 2024-11-30 — both apache-2.0, with 76 and 1,258 downloads"
    source_url: "https://huggingface.co/api/models?author=aion-labs&limit=100&sort=createdAt&direction=-1"
    accessed: "2026-09-06"
    volatility: slow
  - field: rp_model_card
    source: cited
    value: "'This is a completely uncensored model that has been trained to excel at roleplaying and creative writing. It can utilize the full 131K context.'"
    source_url: "https://huggingface.co/aion-labs/Aion-RP-Llama-3.1-8B/raw/main/README.md"
    accessed: "2026-09-06"
    volatility: static
  - field: router_benchmark_claim
    source: cited
    value: "'Aion-RP-Llama-3.1-8B ranks the highest in the character evaluation portion of the RPBench-Auto benchmark, a roleplaying-specific variant of Arena-Hard-Auto, where LLMs evaluate each other’s responses. It is a fine-tuned base model rather than an instruct model, designed to produce more natural and varied writing.'"
    source_url: "https://openrouter.ai/aion-labs/aion-rp-llama-3.1-8b"
    accessed: "2026-09-06"
    volatility: slow
  - field: vendor_rp_description
    source: cited
    value: "'A variant of LLama 3.1 8B optimized for immersive roleplaying and storytelling.' — the whole of it; no benchmark is named"
    source_url: "https://api.aionlabs.ai/v1/models"
    accessed: "2026-09-06"
    volatility: slow
  - field: rpbench_published_leaderboard
    source: cited
    value: "17 rows, headed by Higgs-Llama-3 70B V2 at 68.25% on Character and closed by Character.AI at 12.47%; no Aion model appears"
    source_url: "https://raw.githubusercontent.com/boson-ai/RPBench-Auto/main/results/leaderboard_for_display.csv"
    accessed: "2026-09-06"
    volatility: static
  - field: rpbench_leaderboard_last_commit
    source: cited
    value: "d1cca01f, 'rename to V1 for consistency', committed 2024-08-06 — the most recent change to the leaderboard file"
    source_url: "https://api.github.com/repos/boson-ai/RPBench-Auto/commits?path=results/leaderboard_for_display.csv&per_page=3"
    accessed: "2026-09-06"
    volatility: static
  - field: rpbench_leaderboard_page
    source: cited
    value: "gone: it redirected to https://www.boson.ai/rpbench and returned HTTP 404 when requested on 2026-09-06"
    source_url: "https://boson.ai/rpbench/"
    accessed: "2026-09-06"
    volatility: dated
  - field: vendor_description_aion_3
    source: cited
    value: "'A multi-model system built on the GLM family of models. Aion 3.0 employs a collaborative generation process in which multiple specialized models contribute to each response. The result is stronger narrative structure, more compelling tension and conflict, and a nuanced treatment of mature and darker themes.'"
    source_url: "https://api.aionlabs.ai/v1/models"
    accessed: "2026-09-06"
    volatility: slow
  - field: router_description_aion_3
    source: cited
    value: "'Aion-3.0 is a multi-model roleplaying and storytelling system from AionLabs, built on the GLM family of models. It uses a collaborative generation process in which multiple specialized models each contribute to a response, producing stronger narrative structure and more compelling tension and conflict.'"
    source_url: "https://openrouter.ai/aion-labs/aion-3.0"
    accessed: "2026-09-06"
    volatility: slow
  - field: router_privacy_link_status
    source: cited
    value: "the privacy-policy URL OpenRouter publishes for this provider, https://www.aionlabs.ai/privacy-policy/, returned HTTP 404 when requested on 2026-09-06 — the citation here is that response"
    source_url: "https://www.aionlabs.ai/privacy-policy/"
    accessed: "2026-09-06"
    volatility: dated
  - field: retention_policy
    source: cited
    value: "the policy the site's own footer links states only that 'We retain your Personal Data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law' — no interval is named"
    source_url: "https://www.aionlabs.ai/privacy/"
    accessed: "2026-09-06"
    volatility: slow
timeline:
  - date: "2024-11-09"
    event: "the Aion-RP-Llama-3.1-8B weights repository is created on Hugging Face"
    source_url: "https://huggingface.co/api/models?author=aion-labs&limit=100&sort=createdAt&direction=-1"
  - date: "2024-11-30"
    event: "Aion-RP 1.0 (8B) released, per the vendor's own model table"
    source_url: "https://www.aionlabs.ai/docs/models/"
  - date: "2025-02-04"
    event: "the row aion-labs/aion-rp-llama-3.1-8b is created in OpenRouter's catalog"
    source_url: "https://openrouter.ai/api/v1/models"
  - date: "2025-12-21"
    event: "Aion 2.0 released, per the vendor's own model table"
    source_url: "https://www.aionlabs.ai/docs/models/"
  - date: "2026-02-23"
    event: "the row aion-labs/aion-2.0 is created in OpenRouter's catalog, permaslug aion-labs/aion-2.0-20260223"
    source_url: "https://openrouter.ai/api/v1/models"
  - date: "2026-05-05"
    event: "Aion 3.0 released, per the vendor's own model table"
    source_url: "https://www.aionlabs.ai/docs/models/"
  - date: "2026-05-14"
    event: "Aion 3.0 Mini released, per the vendor's own model table"
    source_url: "https://www.aionlabs.ai/docs/models/"
  - date: "2026-07-07"
    event: "the rows aion-labs/aion-3.0 and aion-labs/aion-3.0-mini are created in OpenRouter's catalog, one second apart"
    source_url: "https://openrouter.ai/api/v1/models"
mentions:
  - model/aion-labs-aion-2-0
  - model/aion-labs-aion-3-0
  - model/aion-labs-aion-3-0-mini
  - model/aion-labs-aion-rp-llama-3-1-8b
---

This vendor sells roleplay models on a router, and the router is the only place
most people meet it. That turns out to be worth checking, because AionLabs runs
its own catalogue — {{fact:org/aion-labs#public_model_endpoint}} — and the two
listings of the same four models do not say the same things.

Start with the clock. The vendor stamps each model with a release date and the
router stamps each row with a creation timestamp, and the four pairings run 66
days for `aion-labs/aion-rp-llama-3.1-8b` (30 November 2024 to 4 February 2025),
64 for `aion-labs/aion-2.0` (21 December 2025 to 23 February 2026), then 63 and
54 for Aion-3.0 and Aion-3.0-Mini, released nine days apart in May 2026 and
listed one second apart on 7 July. Nothing on either site explains the delay.
Four samples is not many, but a twelve-day band across seventeen months of
releases is a tighter spread than "whenever someone filed the paperwork"
usually produces.

The router's oldest row carries the more interesting drift. Its listing still
leads with a ranking: {{fact:org/aion-labs#router_benchmark_claim}} RPBench-Auto
is a real benchmark with a public leaderboard, and that leaderboard is
{{fact:org/aion-labs#rpbench_published_leaderboard}}. It has not moved since
{{fact:org/aion-labs#rpbench_leaderboard_last_commit}} — 95 days before this
model's weights repository was created, so the model could never have been on
it. Models join that leaderboard by opening a pull request, so an absence proves
nothing about how the model would score; what it means is that the claim cannot
be checked where it points. The live leaderboard linked at the top of the
benchmark's
[own README](https://raw.githubusercontent.com/boson-ai/RPBench-Auto/main/README.md)
is {{fact:org/aion-labs#rpbench_leaderboard_page}}. AionLabs' own catalogue does
not repeat the ranking: its entry for the same model reads, in full,
{{fact:org/aion-labs#vendor_rp_description}}. The weights' model card is out of
step too, in the other direction — it promises
{{fact:org/aion-labs#rp_model_card}}, while the vendor's own table and the
router's endpoint both serve a window four times smaller.

The newer rows drift the other way, and this one lands on the choice a reader
is actually making. The vendor describes Aion-3.0 as
{{fact:org/aion-labs#vendor_description_aion_3}} OpenRouter's paraphrase is
{{fact:org/aion-labs#router_description_aion_3}} The closing clause is gone —
from Aion-3.0 and from its Mini, though the equivalent sentence survives intact
on the listing for Aion-2.0. For anyone picking between these rows that clause
is usually the deciding one, and it is missing from the page where the picking
happens.

Two last things the board cannot show. The first is who this is:
{{fact:org/aion-labs#operator}} — a Polish company, where
{{fact:org/aion-labs#router_recorded_headquarters}}. The plain two-word name is
not a linkable alias here for a related reason: an unrelated
[AION Labs](https://aionlabs.com/) owns that name in another field entirely,
selling itself on "the future of pharma" and "drug discovery and development".
The second is that models are at most half the business. The front page gives
equal billing to {{fact:org/aion-labs#second_product}} — a product line with no
row in any catalog, sold by the company whose four rows in the catalog snapshot
of 5 September 2026 are all any board can see of it.
