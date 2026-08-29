---
job: seed-wiki-model-moonshotai-kimi-k3
verdict: revise
reasons:
  - false-or-unsupported-claim
would-cite: >-
  Someone arguing that a successor flagship is usually a cheaper-to-serve
  trim of the model it replaces would be answered by Kimi K3's activated path
  growing 3.25x against 2.8x total — the served cost per token went up, not
  down, across a generation handover.
reviewer: r9-opus
date: 2026-08-28
---

Checklist: wiki model entry. Sources fetched 2026-08-28; catalog claims
measured against `data/sources/openrouter-models/latest.json` (2026-08-28,
388 rows).

**Verified by fetching:**

- huggingface.co/moonshotai/Kimi-K3 — "Total Parameters 2.8T", "Activated
  Parameters 104B" (MoE, 16 of 896 experts per token). The `parameters` fact
  is exact.
- huggingface.co/moonshotai/Kimi-K2.5 — "Both the code repository and the
  model weights are released under the Modified MIT License"; 1T total, 32B
  activated. Both transcluded K2.5 facts hold.
- openrouter.ai/moonshotai/kimi-k3 — listing date "Jul 16, 2026", context
  1,048,576, described as "a 2.8T parameter open-weight multimodal reasoning
  model from Moonshot AI". `listed_date` and the timeline event both hold.

**The defect — the licence fact is wrong.** The entry's `license` value reads
"Kimi K3 License — bespoke, with a **revenue-sharing clause** for large
inference providers", cited to the Hugging Face page. I fetched the actual
licence at huggingface.co/moonshotai/Kimi-K3/raw/main/LICENSE. It contains no
revenue share of any kind. It contains two different conditions:

- §2, a **separate-agreement** trigger: "the aggregate revenue of the Licensee
  and its affiliates exceeds 20 million US dollars (or the equivalent in other
  currencies) in total over any consecutive 12 months" — above which the
  licensee must negotiate a separate agreement with Moonshot AI before
  commercial use.
- §3, a **UI-branding** requirement at "more than 100 million monthly active
  users, or more than 20 million US dollars (or equivalent in other
  currencies) in monthly revenue" — above which "Kimi K3" must be displayed
  prominently in the product interface.

Asked directly whether any percentage revenue share exists, the licence text
returns none. "Revenue-sharing" is a paraphrase into wrongness of a
negotiate-separately threshold, and it is a legal claim on the page. Replace
the value with the two real conditions and their real numbers.

**Verified by measurement:**

- 2.8T/1T = 2.8 ("nearly three") and 104B/32B = 3.25 ("just over three"). Both
  exact, and both are ratios over `static` facts, so they cannot rot.
- 2026-07-16 → 2026-08-31 is **46 days**. Exact. It is also the complement of
  the sibling page's arithmetic (216 − 170), which is internally consistent.
- Intelligence index 59.7 on K3 against 36 on K2.5; K2.5 `expiration_date`
  2026-08-31. Paragraph three anchors explicitly to "the same snapshot", which
  the rest of this batch mostly fails to do.
- All seven transclusions resolve, including
  `model/moonshotai-kimi-k2-5#api_sunset`.

**Two smaller things to fix.** (1) The 46-day window runs from an *OpenRouter
listing date* to a *Moonshot platform* sunset, but the conclusion drawn is
"both were live on Moonshot's own platform at once" — which the OpenRouter
listing does not establish. Either source K3's availability on Moonshot's own
platform or narrow the claim to the catalog. (2) The second half of paragraph
two — that what ends is the hosted endpoint and not the model, because the
weights stay downloadable — restates `model/moonshotai-kimi-k2-5`'s closing
paragraph, which is that page's payload and what its own review record singled
out. Trim it to a clause.

The piece deliberately cedes the licence angle to `org/moonshot-ai` and takes
scale instead, which is the right call and genuinely different; the org page's
parameter figures serve a comparison against Claude Opus 5, this one against
the model's own predecessor. The payload is real. Fix the licence value, the
platform inference and the restated clause. Revise.
