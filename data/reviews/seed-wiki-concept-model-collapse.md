---
job: seed-wiki-concept-model-collapse
verdict: revise
reasons: [false-or-unsupported-claim]
would-cite: >-
  Someone arguing AI-generated text filling the web makes future-model
  degradation inevitable — this page settles that the demonstrated collapse
  assumes each generation replaces its predecessor's data, and that under
  accumulation the proved test-error bound is finite and independent of the
  number of iterations.
reviewer: r4-fable
date: 2026-08-28
---

Checklist: wiki concept entry. Sources fetched 2026-08-28.

- ar5iv.labs.arxiv.org/html/2305.17493 + arxiv.org/abs/2305.17493 — the
  definition verbatim ("use of model-generated content in training causes
  irreversible defects in the resulting models, where tails of the original
  content distribution disappear"); the setup exact: OPT-125m finetuned on
  wikitext2, "For data generation from the trained models we use a 5-way
  beam-search", two arms (no original data / 10% of original data preserved);
  generation 1 of the church-architecture example does drift to St. Peter's
  Basilica and Pope Innocent III as the piece says; v1 Sat, 27 May 2023.
  DEFECT: the example shows Gen 0, 1, 7 and 9, and the jackrabbit enumeration
  ("black @-@ tailed jackrabbits, white @-@ tailed jackrabbits, blue @-@
  tailed jackrabbits, red @-@ tailed jackrabbits, yellow @-") is Gen 9's
  output — Gen 7 begins "architecture in England. In an interview". The
  piece's "by generation 7 the model is enumerating ..." is false. Confirmed
  in two independent fetches of the paper.
- api.crossref.org/works/10.1038/s41586-024-07566-y — Nature, volume 631,
  issue 8022, pages 755-759, published 24 July 2024: every field of the
  journal_publication fact exact.
- arxiv.org/abs/2404.01413 — abstract verbatim: prior studies "largely
  assumed that new data replace old data over time, where an arguably more
  realistic assumption is that data accumulate over time"; "accumulating the
  successive generations of synthetic data alongside the original real data
  avoids model collapse"; "if data instead accumulate, the test error has a
  finite upper bound independent of the number of iterations"; domains match
  (language models, diffusion models for molecule conformation, VAEs for
  images); 14 authors, so "Gerstgrasser and thirteen co-authors" is right;
  v1 Mon, 1 Apr 2024, matching the timeline.
- Not independently verified: nothing else material; every other quote and
  number was re-fetched today.

The narrowing this entry is built on is real and is the sources' own text:
the replacement assumption is named by the accumulation paper in exactly the
words quoted, so the piece's central claim survives the check the brief
flagged. The payload — collapse is demonstrated for a closed self-training
loop, not for a corpus that grows — is the correction most coverage of the
Nature paper needs. One fix before publication: change "by generation 7" to
"by generation 9" (source: the paper's own example table, fetched today; Gen
7 exists but shows different text, so this is a wrong reading, not a version
difference). Everything else stands as written. Revise.
