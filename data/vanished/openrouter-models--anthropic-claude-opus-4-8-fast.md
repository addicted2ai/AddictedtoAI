---
title: "A declared feed row vanished: openrouter-models anthropic/claude-opus-4.8-fast"
subject: "content/wiki/model/anthropic-claude-opus-4-8-fast.md"
source: "openrouter-models"
row_id: "anthropic/claude-opus-4.8-fast"
entry_id: "model/anthropic-claude-opus-4-8-fast"
last_seen: "2026-09-01"
date: "2026-09-02"
---

`model/anthropic-claude-opus-4-8-fast` declares the row `anthropic/claude-opus-4.8-fast` from the `openrouter-models` feed, and that row is
no longer present in the source's latest snapshot. It was last seen on 2026-09-01.

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
| `architecture` | {"input_modalities":["text","image","file"],"instruct_type":null,"modality":"text+image+file->text","output_modalities":["text"],"tokenizer":"Claude"} |
| `canonical_slug` | anthropic/claude-4.8-opus-fast-20260528 |
| `context_length` | 1000000 |
| `created` | 1779913703 |
| `default_parameters` | {"frequency_penalty":null,"presence_penalty":null,"repetition_penalty":null,"temperature":null,"top_k":null,"top_p":null} |
| `description` | Fast-mode variant of [Opus 4.8](/anthropic/claude-opus-4.8) - identical capabilities with higher output speed at 2x pricing relative to regular Opus 4.8.

Learn more in Anthropic's docs: https://platform.claude.com/docs/en/build-with-claude/fast-mode |
| `expiration_date` | (absent) |
| `hugging_face_id` | (absent) |
| `id` | anthropic/claude-opus-4.8-fast |
| `knowledge_cutoff` | (absent) |
| `links` | {"details":"/api/v1/models/anthropic/claude-4.8-opus-fast-20260528/endpoints"} |
| `name` | Anthropic: Claude Opus 4.8 (Fast) |
| `per_request_limits` | (absent) |
| `pricing` | {"completion":"0.00005","input_cache_read":"0.000001","input_cache_write":"0.0000125","input_cache_write_1h":"0.00002","prompt":"0.00001","web_search":"0.01"} |
| `reasoning` | {"default_effort":"high","default_enabled":false,"mandatory":false,"supported_efforts":["max","xhigh","high","medium","low"]} |
| `supported_parameters` | ["include_reasoning","max_tokens","reasoning","reasoning_effort","response_format","stop","structured_outputs","tool_choice","tools","verbosity"] |
| `supported_voices` | (absent) |
| `top_provider` | {"context_length":1000000,"is_moderated":true,"max_completion_tokens":128000} |

## Retiring this item

Delete this file in the same diff as the fix. Its presence is the whole of the
state: the queue reads this directory every run, and nothing else records that the
withdrawal has been dealt with.
