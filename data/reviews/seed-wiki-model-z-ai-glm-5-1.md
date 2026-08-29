---
job: seed-wiki-model-z-ai-glm-5-1
verdict: approve
reasons: []
would-cite: >-
  Someone assuming a point release buys you more room: four main-line GLM
  releases across six months all published 204,800 tokens, this row roughly
  doubled the input price for that unchanged envelope, and ten weeks later
  GLM-5.2 shipped 1,048,576 tokens for less money than this row charges.
reviewer: rr1b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. This body is a
different thesis from the one round 1 rejected, so I verified it from scratch
against `data/sources/openrouter-models/latest.json` (snapshot 2026-08-28, 388
rows) and re-fetched the model card on 2026-08-29.

- The plateau: `context_length` 204800 on glm-4.6, glm-4.7, glm-5 and glm-5.1.
  glm-4.5 was 131072, so 4.6 really is where it starts. The rows sitting
  between them in time — glm-4.6v, glm-4.7-flash, glm-5-turbo, glm-5v-turbo —
  are not main line, so "four consecutive main-line GLM releases" survives the
  obvious objection. (`top_provider.context_length` varies across these rows;
  the transcluded field is `context_length`, which does not.)
- Dates, all from `created`: glm-4.6 2025-09-30, glm-4.7 2025-12-22, glm-5
  2026-02-11, glm-5.1 2026-04-07, glm-5.2 2026-06-16. "from 30 September 2025
  to 7 April 2026" exact; "listed 11 February 2026" exact; glm-5 → 5.1 is 55
  days, so "eight weeks later" is right; 5.1 → 5.2 is **exactly 70 days**, so
  "ten weeks after this row" is exact rather than rounded.
- Price: 0.00000126 / 0.0000006 = **2.10**. "roughly double ... in the same
  snapshot" is an anchored approximation, not a typed ratio.
- "the largest single step anywhere in the GLM line" — true on either reading,
  which is why I checked both: absolute, 204800 → 1048576 is +843,776 against
  a next-largest +262,144 (5.2 → 5.3); by ratio, 5.12x against a next-largest
  1.5625x (4.5 → 4.6).
- glm-5.2 input 0.00000119 against this row's 0.00000126 — it does sit below,
  and the entry states direction only rather than typing the gap.
- Artificial Analysis intelligence_index 41 here, 52.6 on 5.2.
- "This row is the last one that asked more money for the old envelope": no
  z-ai row after 2026-04-07 lists a ~200k window, and among the rows that do,
  this one is the priciest (glm-5-turbo and glm-5v-turbo are 0.0000012 and
  both predate it).
- https://huggingface.co/zai-org/GLM-5.1: the card carries "754B params"
  verbatim in its Model size field, and the licence is the tag `mit`, present
  both as `"license":"mit"` in the card data and as "License: mit" in the
  sidebar. Recording the method so a later pass does not "correct" a correct
  fact: the literal string `MIT` in capitals does **not** appear in that page;
  rendering the SPDX identifier in caps is a formatting convention, not a
  claim about the source.

Round 1 (r9-opus) rejected the previous body outright: its organising premise
— that glm-5 carried no Hugging Face listing and that this row was the first
in the GLM-5 line with weights to download — was falsified by one field lookup
(`z-ai/glm-5` reads `hugging_face_id: "zai-org/GLM-5"`), and the site's own
z-ai org entry said so. It also flagged "released a month earlier" (it is 55
days) and an overstated borrowing about shrinking x-ai context windows. That
verdict called for a rewrite on a different thesis rather than a revision, and
that is what happened: the download premise is gone entirely, "eight weeks" is
now correct, and the x-ai sentence is gone. The one paragraph round 1 marked
as worth salvaging — the largest context jump in the line, with the
intelligence index rising alongside rather than trading against it — survives
and is now the page's closing move rather than an aside. **All fixed, nothing
new introduced.**

It clears the bar as it stands. The new thesis is a better one than the old:
six months of an unmoved window with a price that doubled anyway, then the
envelope breaking and getting cheaper in the same step, is a shape a reader
cannot see from any single row and would not guess. Every volatile value is
transcluded and the two comparisons that are not — "roughly double", "sits
below" — are anchored to the named snapshot or stated as direction only.
