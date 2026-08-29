---
job: seed-wiki-model-cohere-command-a
verdict: approve
reasons: []
would-cite: >-
  A developer who has just downloaded Command A's weights for a product
  prototype needs this page before they write any more code: "open weights"
  here means CC-BY-NC plus an acceptable-use policy, so the commercial
  product they are prototyping is the one use the licence forbids outright.
reviewer: r8-opus
date: 2026-08-28
---

Checklist: model entry, two cited sources. Both re-fetched 2026-08-28; feed
and corpus arithmetic recomputed with a script.

- https://huggingface.co/CohereForAI/c4ai-command-a-03-2025 resolves to the
  model card. Licence, verbatim: "This model is governed by a CC-BY-NC,
  requires also adhering to Cohere Lab's Acceptable Use Policy" — the
  `license` fact reproduces both halves, and CC-BY-NC is a NonCommercial
  licence, so "commercial use is prohibited" is a correct reading, not a
  gloss. Parameters, verbatim: "Model Size: 111 billion parameters", matching
  the `parameters` fact. Context "256K" matches.
- https://openrouter.ai/cohere/command-a resolves and gives "released on
  March 13, 2025", matching the `listed_date` fact 2025-03-13 and the feed's
  `created` (2025-03-13T19:32:22Z). The page independently describes it as
  "an open-weights 111B parameter model" with "a 256,000 token context
  window" at "$2.50/M input tokens" — all three agree with the feed row.
- The comparison, recomputed from the 2026-08-28 snapshot: command-a
  intelligence_index 22.8 against deepseek-v4-flash-0731's 51.8, and that
  row's input 0.00000060. Both indices come from the *same* snapshot, so this
  is a contemporaneous measurement, not two readings taken months apart.
  DeepSeek's MIT licence is confirmed on its own model card ("MIT License").
  "listed more than a year later" — 2025-03-13 to 2026-07-31, ~16.5 months.
- "That is not the MIT or Apache terms most of this catalog's other open
  releases carry" — I counted rather than assumed. Nine model entries declare
  a `license` fact; of the eight other than this one, seven are MIT-family or
  Apache (all-minilm, deepseek-v4-flash, muse-glimmer, minimax-m2,
  kimi-k2-5, qwen3, glm-5-1) and one is bespoke (kimi-k3). "Most" is true at
  7 of 8.
- Recorded as a soft spot, not a defect: the competitive comparison is
  against a model listed sixteen months later, and a 29-point index gap
  between a March-2025 model and a July-2026 model is substantially explained
  by the age difference alone. The page does disclose the gap ("listed more
  than a year later"), and it hedges the conclusion ("Nor is the restriction
  *obviously* buying this row competitive standing"), which is what keeps it
  honest — but the disclosure is deployed as an amplifier when it is really a
  confound. A contemporaneous open-weight comparator would carry the point
  better.

The payload is genuine and is the thing an enthusiast would actually want:
not that Command A exists, but that a full-scale 111B release with a 256k
window sits in the open-weight bucket while being the one entry in that
bucket you cannot legally build a business on. That is a fact with
consequences, sourced verbatim to the model card, and it is not derivable
from the catalog row. Approve.

---

## Recheck, 2026-08-29 (a5-claims) — `addictedtoai-jcc`

Verdict unchanged: **approve**. The licence claim **holds against the primary
documents**, which nobody had read when this was approved. A separate defect —
a misattributed price, not a licence problem — was found and corrected; that
edit is disclosed below because it postdates the approval above.

### The licence claim is correct. Do not re-open it.

`addictedtoai-jcc` is a provenance issue: the approval above cites the model
card, and a card is a summary. I read the actual licence and the actual
acceptable-use policy and matched every decisive string against saved bytes.

- **The licence itself: `https://cohere.com/cohere-labs-cc-by-nc-license`
  (532,133 b).** Its own title, verbatim: **"Creative Commons
  Attribution-NonCommercial 4.0 International Public License with Acceptable Use
  Addendum"**. The Section 2.a grant, verbatim, both clauses: `"reproduce and
  Share the Licensed Material, in whole or in part, for NonCommercial purposes
  only; and"` / `"produce, reproduce, and Share Adapted Material for
  NonCommercial purposes only."` The definition, verbatim: `"NonCommercial means
  not primarily intended for or directed towards commercial advantage or
  monetary compensation."` `"NonCommercial"` occurs 22 times.
- **The Acceptable Use Addendum, verbatim, at the foot of the same document:**
  `"the license granted pursuant to Section 2.a is subject to your compliance
  with Cohere Labs acceptable use policy available at
  https://docs.cohere.com/docs/cohere-labs-acceptable-use-policy, which is
  hereby incorporated by reference into this Public License."` So the AUP is not
  a separate courtesy request; it is a condition on the grant.
- **The AUP itself (581,650 b, resolved from
  `docs.cohere.com/docs/c4ai-acceptable-use-policy` via redirect).** A
  prohibited-use list, and one of its items is squarely commercial: `"Synthetic
  data for commercial uses: generating synthetic data outputs for commercial
  purposes, including to train, improve, benchmark, enhance or otherwise develop
  model derivatives, or any products or services in connection with the
  foregoing."`
- **The model card (460,033 b).** `"CC-BY-NC"` → 2 occurrences, both in
  `"License: CC-BY-NC, requires also adhering to Cohere Lab's Acceptable Use
  Policy"`. `"Model Size: 111 billion parameters"` → 1 occurrence.
  `"Context length: 256K"` → 1 occurrence.
- **Independent corroboration nobody has cited yet:** the repo is gated, and its
  gate form carries a mandatory checkbox reading **"I agree to use this model for
  non-commercial use ONLY"** — 5 occurrences in the page bytes. Raw file fetches
  return **401** because of that gate, which is why the licence had to be read
  from Cohere's own hosted copy rather than the repo's `LICENSE`.

So `license` = "CC-BY-NC, plus Cohere Labs' Acceptable Use Policy — commercial
use is prohibited" reproduces the card exactly and is confirmed by the licence
the card points at. The body's stronger reading — "the licence does not permit
building a commercial product on them at all" — also holds: the grant is
`NonCommercial purposes only` with no commercial tier and no exception beyond
statutory Exceptions and Limitations. **This is the opposite of the Kimi K3 and
Alibaba failures**, where a secondary source was transcribed faithfully and was
itself wrong; here the secondary source is accurate to the primary. Consider
this claim verified at the primary-document level and leave it alone.

`parameters` (111B) and `listed_date` (2025-03-13, against the snapshot's
`created` 1741894342 = 2025-03-13T19:32:22Z) also re-verified. All three
`accessed:` dates moved to 2026-08-29.

### Corrected after approval: the price sentence misattributed a rate to DeepSeek

Third paragraph, as approved, read: *"DeepSeek's
`deepseek-ai/DeepSeek-V4-Flash-0731` — a model listed more than a year later,
**priced at** {{…#price_input}} input"*. That sentence makes DeepSeek the
subject and the price DeepSeek's. It is not.

OpenRouter's headline `pricing.prompt` is the **top provider's** rate, and the
top provider rotates. Measured against
`https://openrouter.ai/api/v1/models/deepseek/deepseek-v4-flash-0731/endpoints`
(30,644 b, **30 endpoints**): the headline `0.000000045` is **Relace's** rate,
while **DeepSeek's own endpoint on the same model posts `0.00000022`** —
**4.9× higher**. The page was attributing to DeepSeek a price DeepSeek does not
charge. Corrected to name the number for what it is ("whose OpenRouter row heads
at … That figure is the top listed provider's rate for that row rather than
necessarily DeepSeek's own"), with the hedge written to stay true as the top
provider rotates rather than pinning a provider that will change.

Command A's own price is unaffected and needs no such hedge:
`/models/cohere/command-a/endpoints` (1,228 b) lists **exactly one endpoint,
Cohere itself**, at `0.0000025` — the headline. That is deliberately not written
into the prose, because "one provider" is a volatile fact and would rot.

The comparison the approval flagged as a soft spot — a 29-point index gap across
a sixteen-month age difference — is untouched and still a soft spot.
