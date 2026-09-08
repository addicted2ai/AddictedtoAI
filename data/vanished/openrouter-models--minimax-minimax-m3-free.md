---
title: "A declared feed row vanished: openrouter-models minimax/minimax-m3:free"
subject: "content/wiki/model/minimax-minimax-m3-free.md"
source: "openrouter-models"
row_id: "minimax/minimax-m3:free"
entry_id: "model/minimax-minimax-m3-free"
last_seen: "2026-09-07"
date: "2026-09-08"
---

`model/minimax-minimax-m3-free` declares the row `minimax/minimax-m3:free` from the `openrouter-models` feed, and that row is
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
| `architecture` | {"input_modalities":["text","image","video"],"instruct_type":null,"modality":"text+image+video->text","output_modalities":["text"],"tokenizer":"Other"} |
| `benchmarks` | {"artificial_analysis":{"agentic_index":31,"coding_index":58.6,"intelligence_index":35.7},"design_arena":[{"arena":"agents","category":"agenticgamedev","elo":1158,"rank":18,"win_rate":44.5},{"arena":"agents","category":"androidnative","elo":1171,"rank":23,"win_rate":43.6},{"arena":"agents","category":"fullstack","elo":1207,"rank":14,"win_rate":49.4},{"arena":"agents","category":"htmlslides","elo":1186,"rank":10,"win_rate":46.3},{"arena":"agents","category":"mobileapps","elo":1197,"rank":19,"win_rate":46.1},{"arena":"agents","category":"python-pptxslides","elo":1228,"rank":10,"win_rate":49.1},{"arena":"agents","category":"webapps","elo":1227,"rank":17,"win_rate":48.8},{"arena":"models","category":"3d","elo":1248,"rank":33,"win_rate":52.1},{"arena":"models","category":"asciiart","elo":1185,"rank":27,"win_rate":47.7},{"arena":"models","category":"codecategories","elo":1267,"rank":28,"win_rate":52.3},{"arena":"models","category":"dataviz","elo":1251,"rank":31,"win_rate":51.7},{"arena":"models","category":"gamedev","elo":1241,"rank":35,"win_rate":47.7},{"arena":"models","category":"svg","elo":1204,"rank":30,"win_rate":48.5},{"arena":"models","category":"uicomponent","elo":1266,"rank":29,"win_rate":51.9},{"arena":"models","category":"website","elo":1272,"rank":26,"win_rate":52.8}]} |
| `canonical_slug` | minimax/minimax-m3-20260531 |
| `context_length` | 1048576 |
| `created` | 1780245374 |
| `default_parameters` | {"frequency_penalty":null,"presence_penalty":null,"repetition_penalty":null,"temperature":1,"top_k":null,"top_p":0.95} |
| `description` | MiniMax-M3 is a multimodal foundation model from MiniMax. It supports text, image, and video inputs with text output, a 1M-token context window, and is suited for long-horizon agentic work, coding,... |
| `expiration_date` | (absent) |
| `hugging_face_id` | MiniMaxAI/Minimax-M3 |
| `id` | minimax/minimax-m3:free |
| `knowledge_cutoff` | (absent) |
| `links` | {"details":"/api/v1/models/minimax/minimax-m3-20260531/endpoints"} |
| `name` | MiniMax: MiniMax M3 (free) |
| `per_request_limits` | (absent) |
| `pricing` | {"completion":"0","prompt":"0"} |
| `reasoning` | {"mandatory":false} |
| `supported_parameters` | ["include_reasoning","max_tokens","reasoning","response_format","seed","temperature","tool_choice","tools","top_p"] |
| `supported_voices` | (absent) |
| `top_provider` | {"context_length":1048576,"is_moderated":false,"max_completion_tokens":943718} |

## Retiring this item

MOVE this file into `data/vanished/answered/`, unchanged, in the same diff as the
fix. Do NOT delete it. The row stays absent from the feed forever, so a deleted
record is simply written again on the next run and the finding becomes immortal;
the answered record is the only durable evidence that the site has responded, and
it is what stops the question being asked again.
