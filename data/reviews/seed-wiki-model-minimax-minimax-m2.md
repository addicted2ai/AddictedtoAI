---
job: seed-wiki-model-minimax-minimax-m2
verdict: revise
reasons:
  - false-or-unsupported-claim
would-cite: >-
  A startup counsel deciding whether MiniMax M2's weights are safe to ship in
  a product needs the exact trigger this page quotes: the licence is MIT
  until the product passes 100 million monthly active users or US$30 million
  ARR, at which point the only obligation is displaying "MiniMax M2" in the
  interface — no fee, no revenue share.
reviewer: r8-opus
date: 2026-08-28
---

Checklist: model entry, three cited sources plus three cross-entry org and
model facts. All re-fetched 2026-08-28; corpus licence census recomputed
with a script over every model entry declaring a `license` field.

**Verified — and the licence quotation is exact:**
- https://github.com/MiniMax-AI/MiniMax-M2/blob/main/LICENSE resolves. It is
  standard MIT text with an appended clause, verbatim: "if the Software (or
  any derivative works thereof) is used for any of your commercial products
  or services that have more than 100 million monthly active users, or more
  than 30 million US dollars (or equivalent in other currencies) in annual
  recurring revenue, you shall prominently display 'MiniMax M2' on the user
  interface of such product or service." The `license` fact reproduces both
  thresholds and the obligation correctly.
- https://huggingface.co/MiniMaxAI/MiniMax-M2 resolves; states "230 billion
  total parameters with 10 billion active parameters" and "License:
  modified-mit" — so both the `parameters` fact and the page's
  "modified MIT" characterisation *of MiniMax* are right.
- https://openrouter.ai/minimax/minimax-m2 resolves, gives "October 23,
  2025" matching `listed_date` and the feed's `created`, plus 204,800
  context and $0.255/M input matching the feed's 0.000000255.
- "Scale-wise this is the smallest of the three": MiniMax 230B total,
  DeepSeek V4 Flash 284B (per the transcluded fact; see the caveat below),
  Kimi K3 2.8T total / 104B activated. Smallest holds under any of the
  candidate DeepSeek figures.
- All 7 transclusions resolve, including the two org facts.

**The defect — "the third lab in this catalog to publish a flagship under a
modified MIT licence" is unsupported under every reading, and the page's own
examples refute it.**
- DeepSeek is not one. The page itself says its licence is "plain MIT, no
  clause attached at all" — a licence with no modification cannot be an
  instance of "a modified MIT licence", so "each modification asks for
  something different" has nothing to say about DeepSeek.
- Moonshot's Kimi K3 is not one either. I fetched
  https://en.wikipedia.org/wiki/Moonshot_AI: it verifies the revenue-share
  fact verbatim ("revenue sharing of up to 30% for inference providers
  generating over US$20 million annually") but describes K3's licence as a
  "custom license", explicitly distinguishing it from **K2's** modified MIT
  licence. This corpus agrees with Wikipedia: the `license` fact on
  `model/moonshotai-kimi-k3` reads "Kimi K3 License — bespoke, with a
  revenue-sharing clause".
- The count is wrong even taken generously. I enumerated every model entry
  declaring a `license` fact (nine). Exactly **two** carry a modified MIT:
  `minimax-minimax-m2` and `moonshotai-kimi-k2-5` ("Modified MIT License,
  code and weights"). So MiniMax is the second, not the third. And if the
  intended category was "MIT-derived" rather than "modified MIT", the count
  omits `z-ai-glm-5-1` (plain MIT), which would make four.
- The fix is concrete and improves the paragraph: compare against
  **Kimi K2.5**, which really does carry a modified MIT licence, rather than
  K3; call MiniMax the second such lab; and reframe DeepSeek and Z.ai as the
  unmodified-MIT baseline the two modifications depart from. The taxonomy
  the paragraph is reaching for — a display requirement versus a revenue
  share versus nothing — is genuinely interesting and survives the
  correction intact.

**Secondary — "flagship" is doing unearned work.** M2 was listed 2025-10-23
and is not MiniMax's current flagship; `minimax/minimax-m3` (2026-05-31,
intelligence_index 45.4) is. Likewise `deepseek-v4-flash-0731` is the Flash
tier, not DeepSeek's flagship — `deepseek-v4-pro-0813` outscores it (53.2 vs
51.8) in the same snapshot. Only Kimi K3 is actually its lab's flagship.
Either drop the word or pick the rows it is true of.

**Inherited caveat:** the DeepSeek parameter comparison transcludes
`model/deepseek-deepseek-v4-flash-0731#parameters` = "284B total". That
figure comes from OpenRouter, but the checkpoint's own Hugging Face card
says "Model size: 304B params" and the Simon Willison post cited on that
entry independently says "304 billion parameters". I have filed this against
the DeepSeek entry; here it changes no conclusion, since 230B is smallest
either way. Flagging it so a fix there propagates.

**Not a defect, but worth knowing:** the OpenRouter page shows the $0.255/M
input rate as "15% off" a standard $0.30/M. The page describes this as "an
ordinary paid API" price without noting the discount. The value is bound, so
it will not rot — but the sibling gemini-3.7-flash entry made exactly this
kind of promotional pricing its whole payload.

The licence quotation is exact and the underlying idea — three labs, three
different things asked of you after you download the weights — is a real
assembled finding. It is the counting sentence wrapped around it that fails,
and it fails against the page's own examples. Revise.
