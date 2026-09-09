---
title: "A declared feed row vanished: openrouter-models inception/mercury-2.5-preview"
subject: "content/wiki/model/inception-mercury-2-5-preview.md"
source: "openrouter-models"
row_id: "inception/mercury-2.5-preview"
entry_id: "model/inception-mercury-2-5-preview"
last_seen: "2026-09-08"
date: "2026-09-09"
---

`model/inception-mercury-2-5-preview` declares the row `inception/mercury-2.5-preview` from the `openrouter-models` feed, and that row is
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
| `architecture` | {"input_modalities":["text"],"instruct_type":null,"modality":"text->text","output_modalities":["text"],"tokenizer":"Other"} |
| `canonical_slug` | inception/mercury-2.5-preview-20260831 |
| `context_length` | 260000 |
| `created` | 1788209864 |
| `default_parameters` | {} |
| `description` | Mercury 2.5 is the fastest reasoning LLM, and the latest diffusion LLM (dLLM) from Inception. Instead of generating tokens sequentially, Mercury 2.5 produces and refines multiple tokens in parallel, achieving... |
| `expiration_date` | (absent) |
| `hugging_face_id` |  |
| `id` | inception/mercury-2.5-preview |
| `knowledge_cutoff` | (absent) |
| `links` | {"details":"/api/v1/models/inception/mercury-2.5-preview-20260831/endpoints"} |
| `name` | Inception: Mercury 2.5 Preview |
| `per_request_limits` | (absent) |
| `pricing` | {"completion":"0.00000015","input_cache_read":"0.000000004","prompt":"0.00000004"} |
| `reasoning` | {"default_effort":"medium","default_enabled":true,"mandatory":false,"supported_efforts":["high","medium","low","none"]} |
| `supported_parameters` | ["include_reasoning","max_tokens","reasoning","reasoning_effort","response_format","stop","structured_outputs","temperature","tool_choice","tools"] |
| `supported_voices` | (absent) |
| `top_provider` | {"context_length":260000,"is_moderated":false,"max_completion_tokens":65536} |

## Retiring this item

MOVE this file into `data/vanished/answered/`, unchanged, in the same diff as the
fix. Do NOT delete it. The row stays absent from the feed forever, so a deleted
record is simply written again on the next run and the finding becomes immortal;
the answered record is the only durable evidence that the site has responded, and
it is what stops the question being asked again.
