---
title: "A declared feed row vanished: openrouter-models qwen/qwen3.8-max"
subject: "content/wiki/model/qwen-qwen3-8-max.md"
source: "openrouter-models"
row_id: "qwen/qwen3.8-max"
entry_id: "model/qwen-qwen3-8-max"
last_seen: "2026-09-04"
date: "2026-09-05"
---

`model/qwen-qwen3-8-max` declares the row `qwen/qwen3.8-max` from the `openrouter-models` feed, and that row is
no longer present in the source's latest snapshot. It was last seen on 2026-09-04.

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
| `architecture` | {"input_modalities":["text","image","video"],"instruct_type":null,"modality":"text+image+video->text","output_modalities":["text"],"tokenizer":"Qwen"} |
| `benchmarks` | {"artificial_analysis":{"agentic_index":49.9,"coding_index":68.9,"intelligence_index":53.4},"design_arena":[{"arena":"agents","category":"fullstack","elo":1331,"rank":4,"win_rate":65.2},{"arena":"agents","category":"mobileapps","elo":1261,"rank":4,"win_rate":55.9},{"arena":"agents","category":"webapps","elo":1335,"rank":2,"win_rate":64.1},{"arena":"models","category":"3d","elo":1367,"rank":4,"win_rate":59.5},{"arena":"models","category":"codecategories","elo":1312,"rank":9,"win_rate":54.7},{"arena":"models","category":"dataviz","elo":1275,"rank":21,"win_rate":52.1},{"arena":"models","category":"gamedev","elo":1335,"rank":8,"win_rate":56.8},{"arena":"models","category":"uicomponent","elo":1350,"rank":4,"win_rate":60},{"arena":"models","category":"website","elo":1295,"rank":16,"win_rate":53}]} |
| `canonical_slug` | qwen/qwen3.8-max-20260803 |
| `context_length` | 1000000 |
| `created` | 1785731612 |
| `default_parameters` | {} |
| `description` | Qwen3.8 Max is the flagship model in Alibaba's Qwen3.8 series, the general-availability successor to the Qwen3.8 Max Preview. It is a multimodal reasoning model intended for complex reasoning, visual understanding,... |
| `expiration_date` | (absent) |
| `hugging_face_id` | (absent) |
| `id` | qwen/qwen3.8-max |
| `knowledge_cutoff` | (absent) |
| `links` | {"details":"/api/v1/models/qwen/qwen3.8-max-20260803/endpoints"} |
| `name` | Qwen: Qwen3.8 Max |
| `per_request_limits` | (absent) |
| `pricing` | {"completion":"0.000006","input_cache_read":"0.00000025","input_cache_write":"0.0000025","prompt":"0.000002"} |
| `reasoning` | {"default_effort":"xhigh","default_enabled":true,"mandatory":true,"supported_efforts":["xhigh","high","medium","low","minimal"]} |
| `supported_parameters` | ["frequency_penalty","include_reasoning","logprobs","max_tokens","presence_penalty","reasoning","reasoning_effort","response_format","seed","stop","structured_outputs","temperature","tool_choice","tools","top_k","top_logprobs","top_p"] |
| `supported_voices` | (absent) |
| `top_provider` | {"context_length":1000000,"is_moderated":false,"max_completion_tokens":131072} |

## Retiring this item

MOVE this file into `data/vanished/answered/`, unchanged, in the same diff as the
fix. Do NOT delete it. The row stays absent from the feed forever, so a deleted
record is simply written again on the next run and the finding becomes immortal;
the answered record is the only durable evidence that the site has responded, and
it is what stops the question being asked again.
