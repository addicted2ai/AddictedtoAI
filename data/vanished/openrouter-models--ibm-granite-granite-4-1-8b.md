---
title: "A declared feed row vanished: openrouter-models ibm-granite/granite-4.1-8b"
subject: "content/wiki/model/ibm-granite-granite-4-1-8b.md"
source: "openrouter-models"
row_id: "ibm-granite/granite-4.1-8b"
entry_id: "model/ibm-granite-granite-4-1-8b"
last_seen: "2026-09-04"
date: "2026-09-05"
---

`model/ibm-granite-granite-4-1-8b` declares the row `ibm-granite/granite-4.1-8b` from the `openrouter-models` feed, and that row is
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
| `architecture` | {"input_modalities":["text"],"instruct_type":null,"modality":"text->text","output_modalities":["text"],"tokenizer":"Other"} |
| `benchmarks` | {"artificial_analysis":{"agentic_index":null,"coding_index":9.5,"intelligence_index":null},"design_arena":[]} |
| `canonical_slug` | ibm-granite/granite-4.1-8b-20260429 |
| `context_length` | 131072 |
| `created` | 1777577071 |
| `default_parameters` | {"frequency_penalty":null,"presence_penalty":null,"repetition_penalty":null,"temperature":null,"top_k":null,"top_p":null} |
| `description` | Granite 4.1 8B is a dense, decoder-only 8-billion-parameter language model from IBM, part of the Granite 4.1 family. It supports a 131K-token context window and is designed for enterprise tasks... |
| `expiration_date` | (absent) |
| `hugging_face_id` | ibm-granite/granite-4.1-8b |
| `id` | ibm-granite/granite-4.1-8b |
| `knowledge_cutoff` | (absent) |
| `links` | {"details":"/api/v1/models/ibm-granite/granite-4.1-8b-20260429/endpoints"} |
| `name` | IBM: Granite 4.1 8B |
| `per_request_limits` | (absent) |
| `pricing` | {"completion":"0.0000001","input_cache_read":"0.00000005","prompt":"0.00000005"} |
| `supported_parameters` | ["frequency_penalty","logprobs","max_tokens","presence_penalty","repetition_penalty","response_format","seed","stop","structured_outputs","temperature","tool_choice","tools","top_k","top_logprobs","top_p"] |
| `supported_voices` | (absent) |
| `top_provider` | {"context_length":131072,"is_moderated":false,"max_completion_tokens":117964} |

## Retiring this item

MOVE this file into `data/vanished/answered/`, unchanged, in the same diff as the
fix. Do NOT delete it. The row stays absent from the feed forever, so a deleted
record is simply written again on the next run and the finding becomes immortal;
the answered record is the only durable evidence that the site has responded, and
it is what stops the question being asked again.
