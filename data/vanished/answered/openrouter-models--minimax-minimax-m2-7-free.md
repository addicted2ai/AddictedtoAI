---
title: "A declared feed row vanished: openrouter-models minimax/minimax-m2.7:free"
subject: "content/wiki/model/minimax-minimax-m2-7-free.md"
source: "openrouter-models"
row_id: "minimax/minimax-m2.7:free"
entry_id: "model/minimax-minimax-m2-7-free"
last_seen: "2026-09-07"
date: "2026-09-08"
---

`model/minimax-minimax-m2-7-free` declares the row `minimax/minimax-m2.7:free` from the `openrouter-models` feed, and that row is
no longer present in the source's latest snapshot. It was last seen on 2026-09-07.

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
| `benchmarks` | {"artificial_analysis":{"agentic_index":null,"coding_index":52.6,"intelligence_index":null},"design_arena":[{"arena":"models","category":"3d","elo":1231,"rank":38,"win_rate":50.6},{"arena":"models","category":"asciiart","elo":1164,"rank":36,"win_rate":47.5},{"arena":"models","category":"codecategories","elo":1251,"rank":35,"win_rate":52},{"arena":"models","category":"dataviz","elo":1251,"rank":30,"win_rate":52.8},{"arena":"models","category":"gamedev","elo":1237,"rank":37,"win_rate":51.4},{"arena":"models","category":"svg","elo":1172,"rank":44,"win_rate":48.9},{"arena":"models","category":"uicomponent","elo":1232,"rank":41,"win_rate":49.4},{"arena":"models","category":"website","elo":1258,"rank":33,"win_rate":52.4}]} |
| `canonical_slug` | minimax/minimax-m2.7-20260318 |
| `context_length` | 196608 |
| `created` | 1773836697 |
| `default_parameters` | {"frequency_penalty":null,"presence_penalty":null,"repetition_penalty":null,"temperature":1,"top_k":null,"top_p":0.95} |
| `description` | MiniMax-M2.7 is a next-generation large language model designed for autonomous, real-world productivity and continuous improvement. Built to actively participate in its own evolution, M2.7 integrates advanced agentic capabilities through multi-agent... |
| `expiration_date` | (absent) |
| `hugging_face_id` | MiniMaxAI/MiniMax-M2.7 |
| `id` | minimax/minimax-m2.7:free |
| `knowledge_cutoff` | (absent) |
| `links` | {"details":"/api/v1/models/minimax/minimax-m2.7-20260318/endpoints"} |
| `name` | MiniMax: MiniMax M2.7 (free) |
| `per_request_limits` | (absent) |
| `pricing` | {"completion":"0","prompt":"0"} |
| `reasoning` | {"mandatory":true} |
| `supported_parameters` | ["include_reasoning","max_tokens","reasoning","response_format","seed","temperature","tool_choice","tools","top_p"] |
| `supported_voices` | (absent) |
| `top_provider` | {"context_length":196608,"is_moderated":false,"max_completion_tokens":176947} |

## Retiring this item

Move this record into `data/vanished/answered/` in the same diff as the fix.
Its presence there is the durable evidence that the vanished-row finding was
answered; the entry and its `feeds:` binding remain published.
