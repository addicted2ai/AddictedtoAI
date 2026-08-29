---
job: seed-wiki-org-mistral-ai
verdict: approve
reasons: []
would-cite: >-
  For anyone budgeting an inference migration on the assumption that a
  ":batch" suffix universally means half price: the measured census showing
  Anthropic discounting all eleven batch rows at exactly 0.5 and Google nine
  of ten (one at 0.25), while Mistral charges identical prices on five of
  its six — the suffix is a convention exactly two vendors keep.
reviewer: r6-fable
date: 2026-08-28
---

Checklist: wiki org entry built on price-ratio and recency censuses over the
OpenRouter snapshot. Every census re-run by script against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows); sources
fetched 2026-08-28.

Verified by measurement (r6-fable-census.mjs):
- mistral-large-2512 (2025-12-01): $0.50/$1.50 per M. mistral-medium-3-5
  (2026-04-30): $1.50/$7.50. Ratios exactly 3x input, 5x output, as written
  and anchored to the snapshot date in the sentence.
- Batch census exact, zero deviations from the prose: Anthropic 11 batch
  rows, every in/out ratio 0.5000; Google 10, nine at 0.5000 and
  gemini-3.7-flash:batch at 0.2500; Mistral 6, the five rows the piece names
  at 1.0000 on both meters to the last digit, only medium-3-5:batch at 0.5.
- Exactly five vendors hold >20 rows, and their newest listings match the
  piece to the day: Mistral 2026-04-30, OpenAI 2026-07-09, Anthropic
  2026-07-24, Google 2026-08-13, Alibaba/qwen 2026-08-26. Mistral's is the
  oldest by 70 days.

Verified by fetching:
- openrouter.ai/mistralai/mistral-large-2512 — "Mistral's most capable model
  to date" verbatim, "sparse mixture-of-experts architecture with 41B active
  parameters (675B total)", "released under the Apache 2.0 license", listed
  December 1, 2025; live prices match the snapshot.
- openrouter.ai/mistralai/mistral-medium-3-5 — "a dense 128B
  instruction-following model" and, decisively for the linked claim,
  "Self-hostable on as few as four GPUs and available under open weights";
  live prices $1.50/$7.50 match. (Neither Large 3 nor Medium 3.5 carries a
  Hugging Face id in the snapshot, so the open-weights claims rest on this
  page text — which carries them.)
- en.wikipedia.org/wiki/Mistral_AI — founded 28 April 2023 by Mensch,
  Lample, Lacroix; Paris HQ; September 2025 €2B round at €12B with ASML's
  €1.3 billion for an 11% shareholding; Koyeb acquired February 2026; Emmi
  AI announced 19 May 2026; $830 million raised March 2026 for datacentres
  near Paris and in Sweden; the July 2026 multibillion-dollar Microsoft
  European-infrastructure expansion. All confirmed with quotes.

Not independently verified: nothing material.

Three findings, all measured, all correctly anchored to the dated snapshot:
an inverted price ladder at the top of the range, a batch suffix that means
nothing at this vendor five times out of six, and a four-month listing
silence made pointed by the acquisitions running through it. A daily
follower of this space would not know the batch census; it is the page you
paste into an argument. approve
