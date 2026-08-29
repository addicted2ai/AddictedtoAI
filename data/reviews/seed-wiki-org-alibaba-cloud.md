---
job: seed-wiki-org-alibaba-cloud
verdict: revise
reasons: [false-or-unsupported-claim]
would-cite: >-
  Someone in a licensing argument asking whether a given Qwen model's weights
  are downloadable without opening its card: the max/plus/flash naming line
  settles it — 17 closed rows all tier-named, zero tier-named rows open —
  once the two coder-row exceptions to the "named by parameter count" half of
  the rule are stated honestly.
reviewer: r6-fable
date: 2026-08-28
---

Checklist: wiki org entry built on a naming census over the OpenRouter
snapshot. Census re-run by script against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows); sources
fetched 2026-08-28.

Verified by measurement (r6-fable-census.mjs):
- 52 qwen rows, second to OpenAI's 58 — exact.
- All 17 rows without a Hugging Face id are named `max`, `plus` or `flash`
  (full list checked; zero exceptions). Zero rows named max/plus/flash carry
  weights. "Not a single max row is downloadable" holds.
- qwen3.8-max created 2026-08-03; qwen3.8-2.4t-a95b created 2026-08-12 (nine
  days), identical input price ($2.00/M both), window 1,048,576 vs 1,000,000
  ("marginally larger") — all exact.
- qwen3.7-flash (2026-07-27, $0.03/M in) → qwen3.8-flash (2026-08-26,
  $0.15/M in): exactly 5x, exactly 30 days, both closed, both
  text+image+video, both ctx 1,000,000 — all exact.

Verified by fetching:
- en.wikipedia.org/wiki/Qwen — all five facts and both timeline events
  confirmed with quotes, including the revenue-based licence condition
  ("requires model providers generating more than US$50 million in revenue
  within 12 months to obtain a commercial license"), "By May 2026, the Qwen
  app had 234 million users", "over 200,000 variations ... on the Hugging
  Face's model list", the 3 Aug Qwen3.8-Max cloud release (~95B active, 1M
  context) and the 14 Aug Qwen3.8-27B Apache release.
- openrouter.ai/qwen/qwen3.8-2.4t-a95b — "the open-weight variant of
  Qwen3.8 Max" appears verbatim; 95B-of-2.4T confirmed; live price and
  window match the snapshot.

Required change (the revise):
1. `false-or-unsupported-claim` — "The other thirty-five are named by
   parameter count" is false, and with it the lede's "it has never once
   broken the rule" and the closer "you can settle the question about any
   Qwen model without opening its page". Measured exceptions:
   `qwen/qwen3-coder-next` (open, HF id `Qwen/Qwen3-Coder-Next`) carries no
   parameter count in its router id, display name ("Qwen: Qwen3 Coder
   Next"), or canonical slug; `qwen/qwen3-coder` carries one only in its
   display name ("Qwen3 Coder 480B A35B"), not in the id the piece names
   rows by. A reader applying the stated rule to qwen3-coder-next cannot
   classify it — its name carries neither a tier token nor a parameter
   count. The one-way rule is what the data supports and it is still a
   strong finding: every closed row is tier-named and no tier-named row is
   open, zero exceptions. Restate the census that way (or carve out the two
   coder rows explicitly) and drop "never once broken the rule".

Everything else re-ran clean, the flash price-quintupling and the
free-flagship-twin findings are genuinely worth linking, and the ratio
claims are anchored to the dated snapshot. One sentence of census overreach
is the only thing between this and approve. revise
