---
job: seed-wiki-model-meta-muse-glimmer-30b
verdict: approve
reasons: []
would-cite: >-
  Someone asking whether the August 2026 Meta release means the flagship is
  open: this page separates the two artifacts — the ~29.6B Apache-2.0 student
  you can download and the Muse Spark teacher that stays API-only in the same
  catalog — and names quantization, not size, as what fits it on one 24 GB
  card.
reviewer: rr3
date: 2026-08-28
---

Round 2, sealed. Findings written before opening round 1. Catalog claims
recomputed by script (rr3-census.mjs) against
data/sources/openrouter-models/latest.json (2026-08-28, 388 rows); sources
fetched 2026-08-28 and confirmed by literal substring match.

- Snapshot: meta/muse-glimmer-30b present, hugging_face_id
  "meta-models/Muse-Glimmer-30B" (downloadable); meta/muse-spark-1.2 present
  with hugging_face_id null — "is a row in this same catalog" and "does not
  come with a download" both hold against the feed.
- huggingface.co/meta-models/Muse-Glimmer-30B: "License: Apache 2.0"; "Total
  Parameters ~29.6B"; "Perception encoder ~1.8B param ViT-G/14"; "distilled
  from Muse Spark"; "compress the model's weights to approximately 4-bit
  precision, shrinking the language model to under 20 GB. This leaves enough
  headroom for the model's KV cache, the perception encoder ... and the
  speculative decoding drafter" — the parameters, quantization and headroom
  sentences are the card's, verbatim.
- en.wikipedia.org/wiki/Muse_Spark: "can be run entirely offline on a single
  24 GB consumer GPU" (the local_hardware fact, word for word, and the prose
  attributes it to Wikipedia); "Meta released a smaller open-weight large
  language model, Muse Glimmer, on August 10, 2026".
- Arithmetic re-run: 29.6 − 1.8 = 27.8 ("closer to 28B"); a 28B backbone at
  16-bit is ~56 GB, "more than twice a 24 GB budget" — the causal chain now
  runs size → gap → quantization → fit, which is the card's own account.
- {{fact:org/meta-superintelligence-labs#flagship_weights}} resolves
  ("closed; Meta says it hopes to open-source future versions of the model")
  and the prose use is consistent with it. All mention targets exist.
- Unchanged non-defect, carried forward from round 1: the feed row was
  created 2026-08-09T19:06Z while the Wikipedia-cited release_date is
  2026-08-10; the fact cites Wikipedia and the page does not precision-date
  the announcement.

Round 1 (r8-opus) found: "not offered either way" false against the catalog —
fixed ("Only one of those two paths is open on the teacher ... rented by the
token ... but it does not come with a download", which I re-verified against
the feed); the 24 GB reasoning inverted (size presented as what makes it
fit) — fixed, the quantization step is now explicitly "the step that closes
the gap"; the 24 GB line misattributed to the card — fixed, now "Wikipedia's
summary of the result"; the unsourced "first open-weight release since the
Llama line ended" timeline superlative — fixed by removal. The fixes
introduced no new factual claims that failed checking.

Clears the bar: the same-weights-two-paths reading of one catalog row is a
live derived view, every number is transcluded or verbatim from its source,
and the teacher/student licence asymmetry is exactly the thing an enthusiast
argues about. Publish.
