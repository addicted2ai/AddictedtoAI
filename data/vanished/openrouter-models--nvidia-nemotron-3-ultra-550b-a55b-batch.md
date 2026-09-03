---
title: "A declared feed row vanished: openrouter-models nvidia/nemotron-3-ultra-550b-a55b:batch"
subject: "content/wiki/model/nvidia-nemotron-3-ultra-550b-a55b-batch.md"
source: "openrouter-models"
row_id: "nvidia/nemotron-3-ultra-550b-a55b:batch"
entry_id: "model/nvidia-nemotron-3-ultra-550b-a55b-batch"
last_seen: "2026-09-02"
date: "2026-09-03"
---

`model/nvidia-nemotron-3-ultra-550b-a55b-batch` declares the row `nvidia/nemotron-3-ultra-550b-a55b:batch` from the `openrouter-models` feed, and that row is
no longer present in the source's latest snapshot. It was last seen on 2026-09-02.

This is not automatically a defect in the entry. A row can leave a feed because
the vendor retired the model, because it was renamed, because it was folded into
another service tier, or because this one router delisted something that is still
served elsewhere — and those are materially different facts that a reader needs
told apart. Establish which one happened from the vendor's and the feed
publisher's own sources before writing anything. If they do not settle it, say so
on the page rather than guessing: reporting `blocked` is a successful outcome and
a plausible invention is not.

Do NOT remove the entry or its `feeds:` binding. A binding removed after a row
vanishes is what makes the row permanently unmintable if it ever re-lists, which
is the failure `addictedtoai-javv` documents.

## Last known values, pinned

Recorded here at the moment the row went missing, because snapshot rotation will
eventually take them out of both snapshots and they cannot be recovered afterwards
(`addictedtoai-64fk`).

| field | last known value |
|---|---|
| `architecture` | {"input_modalities":["text"],"instruct_type":null,"modality":"text->text","output_modalities":["text"],"tokenizer":"Other"} |
| `benchmarks` | {"artificial_analysis":{"agentic_index":27.5,"coding_index":49.3,"intelligence_index":38.3},"design_arena":[{"arena":"models","category":"3d","elo":1175,"rank":57,"win_rate":41},{"arena":"models","category":"asciiart","elo":1098,"rank":55,"win_rate":36.2},{"arena":"models","category":"codecategories","elo":1158,"rank":75,"win_rate":36.3},{"arena":"models","category":"dataviz","elo":1160,"rank":69,"win_rate":38.4},{"arena":"models","category":"gamedev","elo":1160,"rank":68,"win_rate":37},{"arena":"models","category":"svg","elo":1118,"rank":56,"win_rate":36.5},{"arena":"models","category":"uicomponent","elo":1164,"rank":67,"win_rate":37.7},{"arena":"models","category":"website","elo":1146,"rank":80,"win_rate":34.3}]} |
| `canonical_slug` | nvidia/nemotron-3-ultra-550b-a55b-20260604 |
| `context_length` | 512288 |
| `created` | 1780551208 |
| `default_parameters` | {"frequency_penalty":null,"presence_penalty":null,"repetition_penalty":null,"temperature":1,"top_k":null,"top_p":0.95} |
| `description` | NVIDIA Nemotron 3 Ultra is an open frontier-reasoning and orchestration model from NVIDIA, with 55B active parameters out of 550B total (MoE). Built on a hybrid Transformer-Mamba mixture-of-experts architecture, it... |
| `expiration_date` | (absent) |
| `hugging_face_id` | nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16 |
| `id` | nvidia/nemotron-3-ultra-550b-a55b:batch |
| `knowledge_cutoff` | (absent) |
| `links` | {"details":"/api/v1/models/nvidia/nemotron-3-ultra-550b-a55b-20260604/endpoints"} |
| `name` | NVIDIA: Nemotron 3 Ultra (batch) |
| `per_request_limits` | (absent) |
| `pricing` | {"completion":"0.0000036","input_cache_read":"0.0000002","prompt":"0.0000006"} |
| `reasoning` | {"default_effort":"high","default_enabled":true,"mandatory":false,"supported_efforts":["high","medium"],"supports_max_tokens":true} |
| `supported_parameters` | ["frequency_penalty","include_reasoning","logit_bias","max_tokens","min_p","presence_penalty","reasoning","reasoning_effort","repetition_penalty","response_format","stop","structured_outputs","temperature","tool_choice","tools","top_k","top_p"] |
| `supported_voices` | (absent) |
| `top_provider` | {"context_length":512288,"is_moderated":false,"max_completion_tokens":461059} |

## Retiring this item

MOVE this file into `data/vanished/answered/`, unchanged, in the same diff as the
fix. Do NOT delete it. The row stays absent from the feed forever, so a deleted
record is simply written again on the next run and the finding becomes immortal;
the answered record is the only durable evidence that the site has responded, and
it is what stops the question being asked again.
