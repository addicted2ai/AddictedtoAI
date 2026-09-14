---
title: "A declared feed row vanished: openrouter-models nex-agi/nex-n2-pro"
subject: "content/wiki/model/nex-agi-nex-n2-pro.md"
source: "openrouter-models"
row_id: "nex-agi/nex-n2-pro"
entry_id: "model/nex-agi-nex-n2-pro"
last_seen: "2026-09-08"
date: "2026-09-09"
---

`model/nex-agi-nex-n2-pro` declares the row `nex-agi/nex-n2-pro` from the `openrouter-models` feed, and that row is
no longer present in the source's latest snapshot. It was last seen on 2026-09-08.

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
| `architecture` | {"input_modalities":["text","image"],"instruct_type":null,"modality":"text+image->text","output_modalities":["text"],"tokenizer":"Qwen3"} |
| `benchmarks` | {"artificial_analysis":{"agentic_index":null,"coding_index":59.1,"intelligence_index":null},"design_arena":[{"arena":"models","category":"3d","elo":1282,"rank":21,"win_rate":53},{"arena":"models","category":"asciiart","elo":1126,"rank":53,"win_rate":37.4},{"arena":"models","category":"codecategories","elo":1250,"rank":36,"win_rate":48.1},{"arena":"models","category":"dataviz","elo":1242,"rank":34,"win_rate":48.5},{"arena":"models","category":"gamedev","elo":1253,"rank":31,"win_rate":49.1},{"arena":"models","category":"svg","elo":1223,"rank":19,"win_rate":50.6},{"arena":"models","category":"uicomponent","elo":1237,"rank":39,"win_rate":46.9},{"arena":"models","category":"website","elo":1237,"rank":41,"win_rate":46}]} |
| `canonical_slug` | nex-agi/nex-n2-pro |
| `context_length` | 262144 |
| `created` | 1780937140 |
| `default_parameters` | {"frequency_penalty":null,"presence_penalty":null,"repetition_penalty":null,"temperature":0.7,"top_k":40,"top_p":0.95} |
| `description` | Nex-N2-Pro is an agentic mixture-of-experts model from Nex AGI, with 17B active parameters out of 397B total. Built on the Qwen3.5 architecture, it accepts text and image input and produces... |
| `expiration_date` | 2026-09-08 |
| `hugging_face_id` | nex-agi/Nex-N2-Pro |
| `id` | nex-agi/nex-n2-pro |
| `knowledge_cutoff` | (absent) |
| `links` | {"details":"/api/v1/models/nex-agi/nex-n2-pro/endpoints"} |
| `name` | Nex AGI: Nex-N2-Pro |
| `per_request_limits` | (absent) |
| `pricing` | {"completion":"0.000001","input_cache_read":"0.000000025","prompt":"0.00000025"} |
| `reasoning` | {"mandatory":false} |
| `supported_parameters` | ["include_reasoning","logprobs","max_tokens","reasoning","temperature","tool_choice","tools","top_k","top_logprobs","top_p"] |
| `supported_voices` | (absent) |
| `top_provider` | {"context_length":262144,"is_moderated":false,"max_completion_tokens":235929} |

## Retiring this item

MOVE this file into `data/vanished/answered/`, unchanged, in the same diff as the
fix. Do NOT delete it. The row stays absent from the feed forever, so a deleted
record is simply written again on the next run and the finding becomes immortal;
the answered record is the only durable evidence that the site has responded, and
it is what stops the question being asked again.
