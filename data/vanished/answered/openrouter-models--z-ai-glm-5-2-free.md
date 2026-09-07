---
title: "A declared feed row vanished: openrouter-models z-ai/glm-5.2:free"
subject: "content/wiki/model/z-ai-glm-5-2-free.md"
source: "openrouter-models"
row_id: "z-ai/glm-5.2:free"
entry_id: "model/z-ai-glm-5-2-free"
last_seen: "2026-09-05"
date: "2026-09-06"
---

`model/z-ai-glm-5-2-free` declares the row `z-ai/glm-5.2:free` from the `openrouter-models` feed, and that row is
no longer present in the source's latest snapshot. It was last seen on 2026-09-05.

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
| `benchmarks` | {"artificial_analysis":{"agentic_index":39.7,"coding_index":68.8,"intelligence_index":null},"design_arena":[{"arena":"agents","category":"agenticgamedev","elo":1209,"rank":10,"win_rate":49.4},{"arena":"agents","category":"androidnative","elo":1197,"rank":16,"win_rate":53},{"arena":"agents","category":"fullstack","elo":1252,"rank":10,"win_rate":61.4},{"arena":"agents","category":"godotgamedev","elo":1142,"rank":17,"win_rate":40.1},{"arena":"agents","category":"htmlslides","elo":1188,"rank":10,"win_rate":49.8},{"arena":"agents","category":"mobileapps","elo":1208,"rank":16,"win_rate":52.1},{"arena":"agents","category":"python-pptxslides","elo":1218,"rank":13,"win_rate":49},{"arena":"agents","category":"webapps","elo":1251,"rank":11,"win_rate":56.5},{"arena":"models","category":"3d","elo":1339,"rank":8,"win_rate":56.5},{"arena":"models","category":"asciiart","elo":1242,"rank":15,"win_rate":52},{"arena":"models","category":"codecategories","elo":1318,"rank":7,"win_rate":55.8},{"arena":"models","category":"dataviz","elo":1318,"rank":8,"win_rate":54.3},{"arena":"models","category":"gamedev","elo":1311,"rank":13,"win_rate":53.2},{"arena":"models","category":"svg","elo":1255,"rank":15,"win_rate":54},{"arena":"models","category":"uicomponent","elo":1319,"rank":11,"win_rate":57},{"arena":"models","category":"website","elo":1315,"rank":8,"win_rate":56.4}]} |
| `canonical_slug` | z-ai/glm-5.2-20260616 |
| `context_length` | 256000 |
| `created` | 1781631930 |
| `default_parameters` | {"frequency_penalty":null,"presence_penalty":null,"repetition_penalty":null,"temperature":1,"top_k":null,"top_p":0.95} |
| `description` | GLM 5.2 is a large-scale reasoning model from Z.ai. It supports text input and output with a 1M-token context window, and is suited for long-horizon agent workflows, project-level software engineering,... |
| `expiration_date` | (absent) |
| `hugging_face_id` | zai-org/GLM-5.2 |
| `id` | z-ai/glm-5.2:free |
| `knowledge_cutoff` | (absent) |
| `links` | {"details":"/api/v1/models/z-ai/glm-5.2-20260616/endpoints"} |
| `name` | Z.ai: GLM 5.2 (free) |
| `per_request_limits` | (absent) |
| `pricing` | {"completion":"0","prompt":"0"} |
| `reasoning` | {"default_effort":"high","default_enabled":true,"mandatory":false,"supported_efforts":["xhigh","high"]} |
| `supported_parameters` | ["frequency_penalty","include_reasoning","max_tokens","min_p","presence_penalty","reasoning","reasoning_effort","repetition_penalty","response_format","seed","stop","structured_outputs","temperature","tool_choice","tools","top_k","top_p"] |
| `supported_voices` | (absent) |
| `top_provider` | {"context_length":256000,"is_moderated":false,"max_completion_tokens":230400} |

## Retiring this item

MOVE this file into `data/vanished/answered/`, unchanged, in the same diff as the
fix. Do NOT delete it. The row stays absent from the feed forever, so a deleted
record is simply written again on the next run and the finding becomes immortal;
the answered record is the only durable evidence that the site has responded, and
it is what stops the question being asked again.
