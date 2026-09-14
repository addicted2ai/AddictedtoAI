---
title: "A declared feed row vanished: openrouter-models ~openai/gpt-latest"
subject: "content/wiki/model/openai-gpt-latest.md"
source: "openrouter-models"
row_id: "~openai/gpt-latest"
entry_id: "model/openai-gpt-latest"
last_seen: "2026-09-10"
date: "2026-09-11"
---

`model/openai-gpt-latest` declares the row `~openai/gpt-latest` from the `openrouter-models` feed, and that row is
no longer present in the source's latest snapshot. It was last seen on 2026-09-10.

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
| `alias_target` | {"name":"OpenAI: GPT-5.6 Sol","slug":"openai/gpt-5.6-sol"} |
| `architecture` | {"input_modalities":["file","image","text"],"instruct_type":null,"modality":"text+image+file->text","output_modalities":["text"],"tokenizer":"Router"} |
| `canonical_slug` | ~openai/gpt-latest |
| `context_length` | 1050000 |
| `created` | 1777318334 |
| `default_parameters` | {"frequency_penalty":null,"presence_penalty":null,"repetition_penalty":null,"temperature":null,"top_k":null,"top_p":null} |
| `description` | This model always redirects to the latest model in the OpenAI GPT family. |
| `expiration_date` | (absent) |
| `hugging_face_id` | (absent) |
| `id` | ~openai/gpt-latest |
| `knowledge_cutoff` | 2026-02-16 |
| `links` | {"details":"/api/v1/models/~openai/gpt-latest/endpoints"} |
| `name` | OpenAI GPT Latest |
| `per_request_limits` | (absent) |
| `pricing` | {"completion":"0.00001","input_cache_read":"0.0000002","input_cache_write":"0.0000025","overrides":[{"completion":"0.000015","input_cache_read":"0.0000004","input_cache_write":"0.000005","min_prompt_tokens":272000,"prompt":"0.000004"}],"prompt":"0.000002","web_search":"0.01"} |
| `reasoning` | {"default_effort":"medium","default_enabled":true,"mandatory":false,"supported_efforts":["max","xhigh","high","medium","low","none"]} |
| `supported_parameters` | ["include_reasoning","max_completion_tokens","max_tokens","reasoning","reasoning_effort","response_format","seed","structured_outputs","tool_choice","tools"] |
| `supported_voices` | (absent) |
| `top_provider` | {"context_length":1050000,"is_moderated":true,"max_completion_tokens":128000} |

## Retiring this item

MOVE this file into `data/vanished/answered/`, unchanged, in the same diff as the
fix. Do NOT delete it. The row stays absent from the feed forever, so a deleted
record is simply written again on the next run and the finding becomes immortal;
the answered record is the only durable evidence that the site has responded, and
it is what stops the question being asked again.
