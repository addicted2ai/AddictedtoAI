---
title: "A declared feed row vanished: openrouter-models nousresearch/hermes-4-70b"
subject: "content/wiki/model/nousresearch-hermes-4-70b.md"
source: "openrouter-models"
row_id: "nousresearch/hermes-4-70b"
entry_id: "model/nousresearch-hermes-4-70b"
last_seen: "2026-09-09"
date: "2026-09-10"
---

`model/nousresearch-hermes-4-70b` declares the row `nousresearch/hermes-4-70b` from the `openrouter-models` feed, and that row is
no longer present in the source's latest snapshot. It was last seen on 2026-09-09.

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
| `architecture` | {"input_modalities":["text"],"instruct_type":null,"modality":"text->text","output_modalities":["text"],"tokenizer":"Llama3"} |
| `canonical_slug` | nousresearch/hermes-4-70b |
| `context_length` | 131072 |
| `created` | 1756236182 |
| `default_parameters` | {} |
| `description` | Hermes 4 70B is a hybrid reasoning model from Nous Research, built on Meta-Llama-3.1-70B. It introduces the same hybrid mode as the larger 405B release, allowing the model to either... |
| `expiration_date` | (absent) |
| `hugging_face_id` | NousResearch/Hermes-4-70B |
| `id` | nousresearch/hermes-4-70b |
| `knowledge_cutoff` | 2024-08-31 |
| `links` | {"details":"/api/v1/models/nousresearch/hermes-4-70b/endpoints"} |
| `name` | Nous: Hermes 4 70B |
| `per_request_limits` | (absent) |
| `pricing` | {"completion":"0.0000004","prompt":"0.00000013"} |
| `reasoning` | {"mandatory":false} |
| `supported_parameters` | ["frequency_penalty","include_reasoning","max_tokens","presence_penalty","reasoning","repetition_penalty","response_format","temperature","top_k","top_p"] |
| `supported_voices` | (absent) |
| `top_provider` | {"context_length":131072,"is_moderated":false,"max_completion_tokens":117964} |

## Retiring this item

MOVE this file into `data/vanished/answered/`, unchanged, in the same diff as the
fix. Do NOT delete it. The row stays absent from the feed forever, so a deleted
record is simply written again on the next run and the finding becomes immortal;
the answered record is the only durable evidence that the site has responded, and
it is what stops the question being asked again.
