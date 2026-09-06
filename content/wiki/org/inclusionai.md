---
id: org/inclusionai
kind: org
display_name: inclusionAI
status: active
maintenance: living
aliases:
  - name: inclusionAI
    class: exclusive
  - name: InclusionAI
    class: exclusive
  - name: IAI
    class: manual
facts:
  - field: vision
    source: cited
    value: "\"inclusionAI (IAI) envisions AGI as humanity's shared milestone, not a privileged asset. Backed by Ant Research, we're forging a global open platform to accelerate collaborative breakthroughs in intelligent civilization.\" — the Vision section"
    source_url: "https://www.inclusion-ai.org/about"
    accessed: "2026-09-06"
    volatility: slow
  - field: founding_and_backing
    source: cited
    value: "\"inclusionAI (IAI), founded by Ant Group with researchers from OpenAI, Google, and FAIR (Meta AI)\" — the About Team section; the page footer reads \"© 2026 inclusionAI, Ant Group. All rights reserved.\""
    source_url: "https://www.inclusion-ai.org/about"
    accessed: "2026-09-06"
    volatility: static
  - field: open_source_commitment
    source: cited
    value: "\"Share code, models, and data (within legal/ethical guidelines) to accelerate global AGI progress\" — the Mission card headed \"Open-Source Commitment\""
    source_url: "https://www.inclusion-ai.org/about"
    accessed: "2026-09-06"
    volatility: slow
  - field: flash_launch_claim
    source: cited
    value: "\"124B parameters. Just 5.1B active per token. With 1/8 of the total and 1/12 of the active parameters, it matches or beats our 1T flagship model on most benchmarks shown.\" — the opening tweet of the launch thread, 2026-07-23T17:55:09Z"
    source_url: "https://x.com/AntLingAGI/status/2080351022028095681"
    accessed: "2026-09-06"
    volatility: dated
  - field: flash_architecture_claim
    source: cited
    value: "\"Ling-3.0 starts with native hybrid-linear attention: KDA and MLA layers stacked 5:1.\" and \"It supports 256K context natively and can scale to 1M.\" — the second tweet of the launch thread"
    source_url: "https://x.com/AntLingAGI/status/2080351022028095681"
    accessed: "2026-09-06"
    volatility: static
  - field: launch_thread_shape
    source: cited
    value: "ten tweets posted between 17:55:09Z and 17:56:55Z on 2026-07-23 — three on specifications and availability, seven captioned \"Demo 1\" through \"Demo 7\" — none of which mentions weights, a licence, or Hugging Face"
    source_url: "https://x.com/AntLingAGI/status/2080351022028095681"
    accessed: "2026-09-06"
    volatility: dated
  - field: weights_question
    source: cited
    value: "\"any open weights? I noticed you forgot the hugging face link...\" — a reply on the launch thread timestamped 2026-07-23T18:14:41Z, nineteen minutes after the opening tweet"
    source_url: "https://x.com/AntLingAGI/status/2080351022028095681"
    accessed: "2026-09-06"
    volatility: dated
  - field: weights_promise
    source: cited
    value: "\"Free access runs through Aug 3. Open-source release coming soon—stay tuned.\" — a follow-up tweet timestamped 2026-07-24T07:22:34Z, the first mention of open weights by the account itself"
    source_url: "https://x.com/AntLingAGI/status/2080351022028095681"
    accessed: "2026-09-06"
    volatility: dated
  - field: flash_licence
    source: cited
    value: "mit — the `cardData.license` and the `license:mit` tag on inclusionAI/Ling-3.0-flash"
    source_url: "https://huggingface.co/api/models/inclusionAI/Ling-3.0-flash"
    accessed: "2026-09-06"
    volatility: static
  - field: flash_parameter_total
    source: cited
    value: "127,486,405,600, the safetensors parameter total the Hugging Face API reports for inclusionAI/Ling-3.0-flash (F32 165,472 plus BF16 127,486,240,128)"
    source_url: "https://huggingface.co/api/models/inclusionAI/Ling-3.0-flash"
    accessed: "2026-09-06"
    volatility: static
  - field: flash_reception
    source: cited
    value: "396 likes and 18,655 downloads on inclusionAI/Ling-3.0-flash, repository created 2026-08-02T16:14:41Z"
    source_url: "https://huggingface.co/api/models/inclusionAI/Ling-3.0-flash"
    accessed: "2026-09-06"
    volatility: dated
  - field: fin_base_model
    source: cited
    value: "inclusionAI/Ling-3.0-flash, declared as `cardData.base_model` and as the tag `base_model:finetune:inclusionAI/Ling-3.0-flash` on inclusionAI/Ling-3.0-flash-Fin"
    source_url: "https://huggingface.co/api/models/inclusionAI/Ling-3.0-flash-Fin"
    accessed: "2026-09-06"
    volatility: static
  - field: fin_parameter_total
    source: cited
    value: "127,486,405,600 (F32 165,472 plus BF16 127,486,240,128) — the same safetensors totals the API reports for the base model, digit for digit, across 64 shards rather than 24 plus a separate model-mtp shard"
    source_url: "https://huggingface.co/api/models/inclusionAI/Ling-3.0-flash-Fin"
    accessed: "2026-09-06"
    volatility: static
  - field: fin_repository_created
    source: cited
    value: "2026-09-03T06:09:53Z, licensed mit, tagged finance, financial-research, agents, tool-use, long-context and mixture-of-experts"
    source_url: "https://huggingface.co/api/models/inclusionAI/Ling-3.0-flash-Fin"
    accessed: "2026-09-06"
    volatility: static
  - field: tiny_repository
    source: cited
    value: "inclusionAI/Ling-3.0-tiny, created 2026-08-10T02:44:06Z, licensed mit, 7,893,392,800 safetensors parameters, 418 likes and 25,927 downloads"
    source_url: "https://huggingface.co/api/models/inclusionAI/Ling-3.0-tiny"
    accessed: "2026-09-06"
    volatility: dated
  - field: sante_weights_absent
    source: cited
    value: "no repository whose name contains \"Sante\" appears among the 100 most recently created inclusionAI repositories, which reach back to 2026-08-26 and whose newest is dated 2026-09-05T05:16:19Z"
    source_url: "https://huggingface.co/api/models?author=inclusionAI&limit=100&sort=createdAt&direction=-1"
    accessed: "2026-09-06"
    volatility: dated
  - field: router_rows
    source: cited
    value: "four rows — inclusionai/ling-3.0-flash created 2026-07-23T14:56:20Z, inclusionai/ling-3.0-flash-fin and its :free twin created 2026-08-27T15:58:10Z, inclusionai/ling-3.0-flash-sante:free created 2026-09-04T18:19:06Z"
    source_url: "https://openrouter.ai/api/v1/models"
    accessed: "2026-09-06"
    volatility: dated
  - field: router_weight_links
    source: cited
    value: "only inclusionai/ling-3.0-flash carries a `hugging_face_id`; the two Fin rows and the Sante row all report null, the Fin rows despite the Fin weights having been published on 2026-09-03"
    source_url: "https://openrouter.ai/api/v1/models"
    accessed: "2026-09-06"
    volatility: dated
  - field: router_price_listings
    source: cited
    value: "as the endpoint served them on 2026-09-06 — inclusionai/ling-3.0-flash at prompt 0.000000021 and completion 0.000000063, inclusionai/ling-3.0-flash-fin at prompt 0.00000006 and completion 0.00000018, and both :free rows at zero on each half"
    source_url: "https://openrouter.ai/api/v1/models"
    accessed: "2026-09-06"
    volatility: dated
  - field: fin_output_ceiling
    source: cited
    value: "`top_provider.max_completion_tokens` of 235,929 on the paid Fin row against 32,768 on its free twin, from identical `context_length` of 262,144"
    source_url: "https://openrouter.ai/api/v1/models"
    accessed: "2026-09-06"
    volatility: dated
  - field: community_gguf
    source: cited
    value: "AtomicChat/Ling-3.0-flash-GGUF, created 2026-08-04T20:00:45Z — two days after the weights — with 265,904 downloads, 59 likes, and thirty quantisation build directories from BF16 down to AD-IQ1_S plus an imatrix"
    source_url: "https://huggingface.co/api/models/AtomicChat/Ling-3.0-flash-GGUF"
    accessed: "2026-09-06"
    volatility: dated
  - field: vendor_gguf
    source: cited
    value: "inclusionAI/Ling-3.0-flash-GGUF, created 2026-08-31T03:18:15Z, with 427 downloads, 4 likes, and five build directories — BF16, Q4_K_M, Q5_K_M, Q6_K, Q8_0"
    source_url: "https://huggingface.co/api/models/inclusionAI/Ling-3.0-flash-GGUF"
    accessed: "2026-09-06"
    volatility: dated
  - field: most_downloaded_repository
    source: cited
    value: "inclusionAI/LLaDA2.0-mini at 229,915 downloads against 70 likes, ahead of LLaDA2.1-mini at 111,105 — both diffusion language models; the most-liked repository is Ling-1T at 545 likes and 2,679 downloads"
    source_url: "https://huggingface.co/api/models?author=inclusionAI&limit=100&sort=likes&direction=-1"
    accessed: "2026-09-06"
    volatility: dated
  - field: tracker_licence_record
    source: cited
    value: "\"Open weights · Apache 2.0 (announced; weights not yet posted as of 2026-07-24)\" against a Weights row reading \"Not released\", still served on 2026-09-06"
    source_url: "https://llm-releases.com/models/ling-3-0-flash"
    accessed: "2026-09-06"
    volatility: dated
timeline:
  - date: "2026-07-23"
    event: "Ling-3.0-flash announced in a ten-tweet thread and listed on OpenRouter the same day; the thread names no licence and links no weights"
    source_url: "https://x.com/AntLingAGI/status/2080351022028095681"
  - date: "2026-07-24"
    event: "\"Open-source release coming soon—stay tuned\" — the first commitment to publish weights, a day after the launch"
    source_url: "https://x.com/AntLingAGI/status/2080351022028095681"
  - date: "2026-08-02"
    event: "inclusionAI/Ling-3.0-flash repository created on Hugging Face (createdAt), licensed mit rather than the Apache 2.0 a release tracker had recorded"
    source_url: "https://huggingface.co/api/models/inclusionAI/Ling-3.0-flash"
  - date: "2026-08-04"
    event: "AtomicChat/Ling-3.0-flash-GGUF created, the first widely downloaded quantisation of the weights"
    source_url: "https://huggingface.co/api/models/AtomicChat/Ling-3.0-flash-GGUF"
  - date: "2026-08-10"
    event: "inclusionAI/Ling-3.0-tiny published under MIT — weights first, and never listed on OpenRouter"
    source_url: "https://huggingface.co/api/models/inclusionAI/Ling-3.0-tiny"
  - date: "2026-08-27"
    event: "Ling 3.0 Flash Fin and its free tier arrive on OpenRouter, weights not yet posted"
    source_url: "https://openrouter.ai/api/v1/models"
  - date: "2026-08-31"
    event: "inclusionAI publishes its own GGUF conversion of Ling-3.0-flash, twenty-seven days after a community one"
    source_url: "https://huggingface.co/api/models/inclusionAI/Ling-3.0-flash-GGUF"
  - date: "2026-09-03"
    event: "inclusionAI/Ling-3.0-flash-Fin repository created, seven days after the API listing, under MIT"
    source_url: "https://huggingface.co/api/models/inclusionAI/Ling-3.0-flash-Fin"
  - date: "2026-09-04"
    event: "Ling 3.0 Flash Sante listed on OpenRouter as a free row; no corresponding Hugging Face repository exists"
    source_url: "https://openrouter.ai/api/v1/models"
mentions:
  - model/inclusionai-ling-3-0-flash
  - model/inclusionai-ling-3-0-flash-fin
  - model/inclusionai-ling-3-0-flash-fin-free
  - model/inclusionai-ling-3-0-flash-sante-free
---

Every Ling 3.0 model inclusionAI has shipped in 2026 reached a commercial API
before it reached Hugging Face, and the newest one has not reached Hugging Face
at all. The lab is Ant Group's open-source arm —
{{fact:org/inclusionai#founding_and_backing}} — and it states the commitment
plainly on its own site, as one of four mission cards:
{{fact:org/inclusionai#open_source_commitment}}. It keeps that commitment. What
the record shows is that it keeps it second.

The launch of Ling-3.0-flash is the clearest instance because the interval is
documented on both ends. On 23 July the account posted
{{fact:org/inclusionai#launch_thread_shape}}. The specification tweets are
confident and precise — {{fact:org/inclusionai#flash_launch_claim}}, on
{{fact:org/inclusionai#flash_architecture_claim}} — and the third tweet put the
model on OpenRouter free through 3 August. Nineteen minutes after the first
tweet, a reply on the thread asked
{{fact:org/inclusionai#weights_question}}. The account answered the next
morning, in a post about inference partners:
{{fact:org/inclusionai#weights_promise}}. The repository appeared on 2 August,
ten days after the thread, and it was
{{fact:org/inclusionai#flash_licence}} — not the Apache 2.0 that llm-releases
had recorded from the same announcement, and that
[its page](https://llm-releases.com/models/ling-3-0-flash) still reports today
alongside {{fact:org/inclusionai#tracker_licence_record}}. The weights have
been downloadable for five weeks; the tracker has not noticed.

The pattern held twice more and the gap is closing. Ling 3.0 Flash Fin went up
on the router on 27 August and its weights followed on 3 September — seven
days, down from ten. Ling 3.0 Flash Sante went up on 4 September, and as of
today {{fact:org/inclusionai#sante_weights_absent}}; a direct request for
`inclusionAI/Ling-3.0-flash-Sante` returns an authentication error rather than
a record. The counter-example is the one model that was never sold: Ling-3.0-tiny
went straight to Hugging Face on 10 August under MIT and has no router row at
all. Weights-first happens here when there is no API to lead with.

Every inclusionAI row in the OpenRouter snapshot of 5 September 2026 is one
model wearing three names. Fin declares its parent outright —
{{fact:org/inclusionai#fin_base_model}} — and the weights agree to the digit:
{{fact:org/inclusionai#fin_parameter_total}}, against
{{fact:org/inclusionai#flash_parameter_total}} on the base. A fine-tune and a
set of finance tags are the whole difference between them. The catalog does not
list them alike: in that snapshot `inclusionai/ling-3.0-flash` heads at
{{fact:model/inclusionai-ling-3-0-flash#price_input}} and
`inclusionai/ling-3.0-flash-fin` heads at
{{fact:model/inclusionai-ling-3-0-flash-fin#price_input}}. Each of those is the
top listed provider's rate for its own row rather than necessarily inclusionAI's
own, and nothing requires the two rows to be headed by the same provider.

What is not a listing artefact is how much room the two Fin tiers give an
answer. They are the same weights behind the same declared context length, and
{{fact:org/inclusionai#fin_output_ceiling}} — identical context in, a seventh of
the room to reply.

Worth knowing before trusting the headline number: the shipped file is larger
than the announcement. The launch said 124B parameters; the safetensors index
reports {{fact:org/inclusionai#flash_parameter_total}}.

Distribution went somewhere else entirely. Two days after the weights landed,
{{fact:org/inclusionai#community_gguf}} — a stranger's repository, and a more
thorough one than the lab ever shipped. inclusionAI got to its own GGUF on 31
August, twenty-seven days later:
{{fact:org/inclusionai#vendor_gguf}}. Against the same base weights at
{{fact:org/inclusionai#flash_reception}}, the community conversion has been
fetched more than six hundred times as often as the vendor's. And Ling is not
even where this org's downloads are: its most-fetched artefact is
{{fact:org/inclusionai#most_downloaded_repository}}. The whole of this lab's
presence in the 5 September 2026 catalog snapshot is one fine-tuned MoE, while
its actual traffic sits in a diffusion line no router carries at all.
