---
id: org/nous-research
kind: org
display_name: Nous Research
status: active
maintenance: stable
aliases:
  - name: Nous Research
    class: exclusive
  - name: NousResearch
    class: shared
  - name: Nous
    class: shared
facts:
  - field: mission
    source: cited
    value: "\"Our mission is to advance human rights and freedoms by creating and proliferating open source language models, supporting their unrestricted availability and use, and furthering their scientific and popular understanding.\""
    source_url: "https://nousresearch.com/"
    accessed: "2026-09-06"
    volatility: slow
  - field: router_back_catalogue
    source: cited
    value: "\"Access 17 Nous Research models\" — 17 slugs on OpenRouter's Nous Research page, of which four are in its live models list"
    source_url: "https://openrouter.ai/nousresearch"
    accessed: "2026-09-06"
    volatility: dated
  - field: hermes_4_405b_base
    source: cited
    value: "meta-llama/Meta-Llama-3.1-405B"
    source_url: "https://huggingface.co/NousResearch/Hermes-4-405B/raw/main/README.md"
    accessed: "2026-09-06"
    volatility: static
  - field: hermes_4_14b_base
    source: cited
    value: "Qwen/Qwen3-14B"
    source_url: "https://huggingface.co/NousResearch/Hermes-4-14B/raw/main/README.md"
    accessed: "2026-09-06"
    volatility: static
  - field: hermes_4_3_base
    source: cited
    value: "ByteDance-Seed/Seed-OSS-36B-Base"
    source_url: "https://huggingface.co/NousResearch/Hermes-4.3-36B/raw/main/README.md"
    accessed: "2026-09-06"
    volatility: static
  - field: hermes_4_3_claim
    source: cited
    value: "\"nearly matches (and in some cases exceeds) the performance of Hermes 4 70B at half the parameter cost\", the vendor's own comparison"
    source_url: "https://nousresearch.com/introducing-hermes-4-3"
    accessed: "2026-09-06"
    volatility: slow
  - field: psyche_production_first
    source: cited
    value: "\"our first production model post-trained entirely on the Psyche network\""
    source_url: "https://nousresearch.com/introducing-hermes-4-3"
    accessed: "2026-09-06"
    volatility: slow
  - field: hermes_4_likes
    source: cited
    value: "299, against 215 for Hermes-4-70B, 181 for Hermes-4-14B and 94 for Hermes-4-405B"
    source_url: "https://huggingface.co/api/models/NousResearch/Hermes-4.3-36B"
    accessed: "2026-09-06"
    volatility: dated
  - field: nomos_1_base
    source: cited
    value: "Qwen/Qwen3-30B-A3B-Thinking-2507"
    source_url: "https://huggingface.co/NousResearch/nomos-1/raw/main/README.md"
    accessed: "2026-09-06"
    volatility: static
  - field: nomos_1_putnam
    source: cited
    value: "87/120 on Putnam 2025 in the Nomos reasoning harness, against 24/120 for its own base model under the same conditions"
    source_url: "https://huggingface.co/NousResearch/nomos-1/raw/main/README.md"
    accessed: "2026-09-06"
    volatility: dated
  - field: psyche
    source: cited
    value: "\"an open infrastructure that democratizes AI development by decentralizing training across underutilized hardware. Building on DisTrO and its predecessor DeMo, Psyche reduces data transfer by several orders of magnitude, making distributed training practical. Coordination happens on the Solana blockchain\""
    source_url: "https://nousresearch.com/nous-psyche"
    accessed: "2026-09-06"
    volatility: dated
  - field: consilience_architecture
    source: cited
    value: "40 billion parameters, \"DeepSeek v3 + MLA (Dense version without MoE routers)\", pretrained on 20T tokens with the DisTrO optimizer"
    source_url: "https://huggingface.co/PsycheFoundation/consilience-40b-CqX3FUm4/raw/main/README.md"
    accessed: "2026-09-06"
    volatility: static
  - field: consilience_license
    source: cited
    value: "dual — CC0 by default, \"while also allowing it to be used under the MIT license for users who require permissive terms with attribution and warranty disclaimers\""
    source_url: "https://huggingface.co/PsycheFoundation/consilience-40b-CqX3FUm4/raw/main/README.md"
    accessed: "2026-09-06"
    volatility: slow
  - field: portal_description
    source: cited
    value: "\"Nous Portal — one account for Hermes Agent, the Inference API, and Hermes Cloud. Hundreds of models, tools included, free to start.\""
    source_url: "https://portal.nousresearch.com/"
    accessed: "2026-09-06"
    volatility: slow
  - field: portal_catalog
    source: cited
    value: "332 distinct named model rows, counted from the landing page's own per-1M price cells — and not one of them a Nous model"
    source_url: "https://portal.nousresearch.com/"
    accessed: "2026-09-06"
    volatility: dated
timeline:
  - date: "2024-08-16"
    event: "Hermes 3 405B Instruct listed on OpenRouter"
    source_url: "https://openrouter.ai/nousresearch/hermes-3-llama-3.1-405b"
  - date: "2024-08-18"
    event: "Hermes 3 70B Instruct listed on OpenRouter"
    source_url: "https://openrouter.ai/nousresearch/hermes-3-llama-3.1-70b"
  - date: "2025-05-14"
    event: "The Psyche network architecture published — training distributed over the open internet, coordinated by Solana smart contracts"
    source_url: "https://nousresearch.com/nous-psyche"
  - date: "2025-08-25"
    event: "Hermes 4 Technical Report submitted to arXiv (v1), nine named authors"
    source_url: "https://arxiv.org/abs/2508.18255v1"
  - date: "2025-08-26"
    event: "Hermes 4 405B and Hermes 4 70B listed on OpenRouter — the most recent Nous models the router has listed"
    source_url: "https://openrouter.ai/nousresearch/hermes-4-405b"
  - date: "2025-08-30"
    event: "Hermes-4-14B repository created on Hugging Face (createdAt), on a Qwen3-14B base — the first Hermes 4 variant not built on a Llama"
    source_url: "https://huggingface.co/api/models/NousResearch/Hermes-4-14B"
  - date: "2025-11-17"
    event: "Hermes-4.3-36B repository created on Hugging Face (createdAt), on ByteDance's Seed-OSS-36B-Base"
    source_url: "https://huggingface.co/api/models/NousResearch/Hermes-4.3-36B"
  - date: "2025-12-07"
    event: "nomos-1 repository created on Hugging Face (createdAt), a Qwen3-30B-A3B-Thinking-2507 specialisation for mathematical proof-writing"
    source_url: "https://huggingface.co/api/models/NousResearch/nomos-1"
mentions:
  - model/nousresearch-hermes-3-llama-3-1-405b
  - model/nousresearch-hermes-3-llama-3-1-70b
  - model/nousresearch-hermes-4-405b
  - model/nousresearch-hermes-4-70b
  - org/bytedance-seed
  - org/alibaba-cloud
  - org/deepseek
---

A post-training lab has no base models of its own, so its history is a list of
other people's. Nous Research's is unusually legible, because OpenRouter never
deletes an author page. Read
[theirs](https://openrouter.ai/nousresearch) from the bottom and it goes:
Hermes 13B and 70B on Llama 2; Capybara and the Hermes 2 family on Yi 34B, on
Mixtral 8x7B in both DPO and SFT cuts, and on Mistral 7B; Hermes 2 Pro and
Theta on Llama 3 8B; DeepHermes 3 on Mistral 24B; then Hermes 3 and Hermes 4 on
Llama 3.1 at 70B and 405B. It is a record of which open base was worth building
on in a given quarter, kept by a lab that had to choose one every time.

The choosing stopped being visible there on 26 August 2025, when Hermes 4 70B
and 405B were listed — still on the Llama 3.1 weights the router had been
serving Hermes 3 from since the previous August. Four days later Nous published
Hermes-4-14B on {{fact:org/nous-research#hermes_4_14b_base}}. In November came
Hermes 4.3 on {{fact:org/nous-research#hermes_4_3_base}}; in December, Nomos 1,
a proof-writing specialisation of {{fact:org/nous-research#nomos_1_base}} built
with Hillclimb AI, whose card scores it at
{{fact:org/nous-research#nomos_1_putnam}}. The router lists none of them, and
the most-liked repository in the whole Hermes 4 line is one of them:
Hermes-4.3-36B has {{fact:org/nous-research#hermes_4_likes}}.

So the Llama chapter is the only one the catalog carries, and it closed while
it was being written. What replaced it is not merely a different vendor's
weights. Hermes 4.3 is, in Nous's words,
{{fact:org/nous-research#psyche_production_first}} — the distributed-training
network it had announced six months earlier, on 14 May 2025, which shards a run
across idle hardware and settles who did what through Solana smart contracts.
Decentralised training is the thing Nous is distinguished by and had never
shipped in a product; the first model that carries it is one of the ones with
no row.

Psyche's own first run went further and hid better. Consilience 40B was
pretrained from scratch over the internet —
{{fact:org/nous-research#consilience_architecture}} — with no annealing pass,
on the stated ground that annealing "may potentially constrain creativity and
interesting behaviors", and released under
{{fact:org/nous-research#consilience_license}}. The lab that had spent its
whole existence post-training other companies' foundation models had built one
and put it in the public domain. It sits on Hugging Face under
`PsycheFoundation`, not `NousResearch`, invisible to anyone browsing the lab's
own model list — and on any router that carried it the author prefix would not
be `nousresearch` either.

The last thing a four-row column cannot show is that Nous now runs a catalog of
its own. Nous Portal bills itself as
{{fact:org/nous-research#portal_description}}, and what its landing page
renders is a router's inventory: Anthropic, OpenAI, Google, DeepSeek, Meta,
Qwen, Mistral, xAI and two dozen others, priced per million tokens in and out.
Counted on 6 September 2026 it held
{{fact:org/nous-research#portal_catalog}}. An open-weights lab whose four
listed models sit in somebody else's aggregator has built an aggregator,
stocked it with everybody else's models, and shelved none of its own.
