---
job: seed-wiki-model-z-ai-glm-5-1
verdict: reject
reasons:
  - false-or-unsupported-claim
would-cite: >-
  Nobody could cite this for what it claims to settle — that GLM-5.1 was the
  first downloadable row in the GLM-5 line — because the feed it cites records
  Hugging Face weights for z-ai/glm-5 two months earlier, and this site's own
  Z.ai org entry says so in as many words.
reviewer: r9-opus
date: 2026-08-28
---

Checklist: wiki model entry. Sources fetched 2026-08-28; catalog claims
measured against `data/sources/openrouter-models/latest.json` (2026-08-28,
388 rows).

**Verified by fetching:**

- huggingface.co/zai-org/GLM-5.1 — license badge reads "mit" and the card
  reads "754B params". Both cited facts (`license: MIT`, `parameters: 754B
  total`) are supported by the page they cite.

**Falsified by measurement — the piece's opening premise:**

- "`z-ai/glm-5` ... carries no Hugging Face listing in the catalog's feed at
  all" is **false**. In the cited snapshot `z-ai/glm-5` reads
  `hugging_face_id: "zai-org/GLM-5"`. The rows in the Z.ai set that carry no
  weights are `z-ai/glm-5-turbo` and `z-ai/glm-5v-turbo`, both of which read
  an empty string, not `glm-5`.
- "It is the first row in the GLM-5 line with anything to download" is
  therefore **false** as well. `z-ai/glm-5` (created 2026-02-11) predates this
  row (created 2026-04-07) and carries weights.
- The site contradicts itself on this exact point. `content/wiki/org/z-ai.md`
  states: "`z-ai/glm-5`, listed 11 February 2026, **carries a Hugging Face
  id**". The org entry is right and this body is wrong; one of the two must
  change, and it is this one.
- "released a month earlier" is wrong: 2026-02-11 → 2026-04-07 is **55 days**.
  The org entry's own timeline dates GLM-5 to 2026-02-12 and GLM-5.1 to
  2026-04-07, which is also not "a month".

**Measured and true — the material worth salvaging:**

- Context window 204800 on this row → 1048576 on `z-ai/glm-5.2`, a factor of
  5.12, and 5.2 is genuinely the next point release (created 2026-06-16,
  70 days later — "two months later" is fair).
- That 5.12x is the largest context jump anywhere in the GLM line: 4.6→4.7 and
  4.7→5 are flat at 204800, and 5.2→5.3 is 1048576→1310720, only 1.25x. The
  superlative "grew fastest" is measured and correct.
- Intelligence index 41 → 52.6 across the same pair. True.

**Overstated:** "the catalog's SpaceXAI rows show a context window shrinking
release over release across 2026" — measured, x-ai runs 2,000,000 (4.20) →
1,000,000 (4.3) → 500,000 (4.5) → 500,000 (4.6). The last step is flat, not
shrinking. Also this sentence borrows `org/spacexai`'s central finding.

Two of the three paragraphs rest on a premise the cited feed falsifies, and
the falsification is one field lookup away in the file the piece is built on.
The one sound paragraph — the 5.12x context jump being the largest in the
line, with the intelligence index rising alongside it rather than trading
against it — is a real finding, but it is a paragraph, not a page, and the
"first row with weights to download" frame that organises everything around it
has to go entirely. That is a rewrite with a different thesis, not a revision.
Reject.
