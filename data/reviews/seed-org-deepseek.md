---
job: seed-org-deepseek
verdict: revise
reasons: [false-or-unsupported-claim]
would-cite: >-
  The person in every "is the expensive API worth it" thread needs exactly
  this page: three vendors within about 1.5 points on the same intelligence
  index with a forty-fold input-price spread, plus the stated mechanism
  (13B active of 284B) that makes the floor price structural rather than a
  subsidy.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching:**
- huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731 — exists, "This
  repository and the model weights are licensed under the MIT License."
- en.wikipedia.org/wiki/DeepSeek — confirms founded 2023-07-17, Hangzhou,
  High-Flyer ownership, MIT since January 2025, V4-Flash 284B / V4-Pro 1.6T
  with one-million-token windows, V4 preview 24 April 2026, V4-Pro released
  13 August.
- simonwillison.net/2026/Jul/31/deepseek-v4-flash-0731/ — fetched; see the
  required change below.

**Verified by measurement:**
- `deepseek/deepseek-v4-flash-0731` created 2026-07-31, input 0.00000006,
  II 51.8; `openai/gpt-5.4` II 53.1 at 0.0000025; `google/gemini-3.5-flash`
  II 52 at 0.0000015. Spread 1.3 points; price spread 41x input — "more
  than an order of magnitude" holds with room.
- The OpenRouter row description reads "284B total parameters and 13B
  activated parameters, supporting a 1M-token context window" — the body's
  paraphrase is exact.
- Preview rows `deepseek-v4-flash` and `deepseek-v4-pro` both created
  2026-04-24 — the preview date is in the catalog too.
- Transclusions resolve; volatile values feed-bound; aliases sane.

**Required change (the revise):**
1. `false-or-unsupported-claim` — the Simon Willison quotation. The body
   renders it as: called the release "currently the best
   value-per-intelligence model out there." The post's actual sentence is:
   "…means this **may currently be** the best value-per-intelligence model
   out there." The quotation drops the modal and turns a hedged assessment
   into a flat assertion attributed to a named person. Requote with the
   hedge intact ("may currently be the best value-per-intelligence model
   out there") or paraphrase without quotation marks.

One small note, not part of the verdict: the Pro release is dated 13 August
(per Wikipedia, correctly cited) while the catalog row `deepseek-v4-pro-0813`
was created 2026-08-12; the body's "for Pro on 13 August" rests on the cited
source, so it stands, but the one-day divergence between announcement date
and listing date is worth knowing if the sentence is ever re-anchored to the
catalog.

Otherwise a sharp piece that clears the bar: the price-floor framing is an
assembled comparison no single vendor page shows.
