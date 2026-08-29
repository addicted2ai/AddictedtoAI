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

---

## Recheck, 2026-08-29 (b2-prices) — `addictedtoai-sdh`

Verdict unchanged: **approve**, but two of the claims the approval above
specifically blessed were **false**, and both are now rewritten. The approval
was not careless — it checked the arithmetic and the arithmetic was right. It
checked the wrong numbers.

### What was wrong

OpenRouter's `pricing.prompt` is documented as the rate of the **top provider
for that row**, and the top provider is re-selected on a rolling window. So
two rows' headline prices can be set by two different companies, and
subtracting one from the other measures the companies, not the models.

Measured 2026-08-29 against `https://openrouter.ai/api/v1/models/<row>/endpoints`,
with the headlines read from `data/sources/openrouter-models/latest.json`
(`date: 2026-08-29`, 396 rows):

- **`z-ai/glm-5.1`** — 17 endpoints. Headline `0.00000126` is **AtlasCloud's**
  (`atlas-cloud/fp8`). **Z.ai's own endpoint (`z-ai/fp8`) posts `0.0000014`
  in / `0.0000044` out.** The row spans `0.0000009086` (Baidu) to `0.00000154`
  (Venice).
- **`z-ai/glm-5.2`** — 33 endpoints. Headline `0.00000119` is **SiliconFlow's**.
  **Z.ai's own endpoint posts `0.0000014` in / `0.0000044` out.** The row spans
  `0.0000003276` (StreamLake) to `0.00000231` (Alibaba fast) — a **7.05x**
  spread within one row.
- **`z-ai/glm-5`** — 11 endpoints. Headline `0.0000006` is **GMICloud's**
  (tied with StreamLake and DeepInfra). **Z.ai's own posts `0.000001`.**

**Z.ai charges the identical rate for glm-5.1 and glm-5.2 — `0.0000014` input
and `0.0000044` output on both.** The approval's finding that 5.2 "shipped
1,048,576 tokens for less money than this row charges" was therefore an
artifact of AtlasCloud heading one row and SiliconFlow heading the other. At
the vendor's own rates the price did not fall; it did not move at all.

The second claim, "roughly double": `0.00000126 / 0.0000006` = **2.10**, which
is what the approval verified. At Z.ai's own rates it is
`0.0000014 / 0.000001` = **1.4**. "Roughly double" does not survive.

### What changed in the body

The **fact transclusions are untouched** — the headline is faithful to
OpenRouter and the entry reproduces it correctly. Only prose changed.

- "charges X ... charges Y — roughly double" → "heads at X ... heads at Y",
  with the multiple **deleted** rather than hedged, plus the house hedge that
  each figure is the top listed provider's rate and the two rows are headed by
  different providers.
- "the plateau broke, and it broke cheaply ... sits *below* what this row
  charges" → the cheapness claim is **withdrawn**. The paragraph now says the
  input listing stayed beside this row's instead of climbing with the window,
  states plainly that which of the two is fractionally lower is a fact about
  hosts rather than models, and rests on the claim that survives both
  readings: **a fivefold window did not arrive with a fivefold price.** That is
  true at the headlines (`0.00000119` vs `0.00000126`, ~6% apart) and true at
  Z.ai's own rates (identical), which is the test a durable sentence has to
  pass.
- "the last one that asked more money for the old envelope" → "the last of the
  main line on the old envelope". The window claim is sound; the money clause
  depended on the broken comparison. Verified no main-line z-ai row after
  2026-04-07 lists 204,800 (glm-5.2 is 1,048,576, glm-5.3 is 1,310,720; the
  two Turbos are 202,752 and both predate this row).

The hedges deliberately **name no provider**, because naming one pins a fact
that rotates — the same failure class being fixed.

### Untouched, and flagged rather than edited

**The `would-cite` in the front matter above still asserts the false claim**
("GLM-5.2 shipped 1,048,576 tokens for less money than this row charges") and
"roughly doubled the input price". Front matter was out of scope for this pass
(unknown-key edits are a build-failure class here and the brief restricted the
edit to the body), so it is recorded here instead: **that `would-cite` no
longer matches the body and is itself an instance of the defect.**

Everything else in the approval re-verified: the context-window plateau, the
`created` dates, the "largest single step" claim on both readings, the
intelligence-index figures, and the licence/parameters method note.
