---
job: seed-org-spacexai
verdict: approve
reasons: []
would-cite: >-
  Someone arguing that vendors quietly trade context length away would link
  the row-by-row 2M-to-500K contraction — no vendor announced it, this page
  measured it from listing dates; and the 4.20-before-4.3 versioning trap is
  the concrete citation for anyone arguing that catalogs must key on dates
  and ids rather than parsed version numbers.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching:**
- en.wikipedia.org/wiki/SpaceXAI — confirms all five cited facts: founded
  9 March 2023 as xAI; Palo Alto HQ; "On February 2, 2026, SpaceX acquired
  xAI in an all-stock transaction that structured xAI as a wholly owned
  subsidiary"; "In July 2026, xAI was rebranded as SpaceXAI"; deal valued
  SpaceX at $1T and xAI at $250B.
- openrouter.ai/x-ai/grok-4.6 — the description reads "Grok 4.6 is
  SpaceXAI's smartest model with frontier performance on coding, knowledge
  work, and STEM." Also present verbatim in the snapshot row.

**Verified by measurement:**
- Context ladder: `grok-4.20` (2026-03-31) 2,000,000; `grok-4.3`
  (2026-04-30) 1,000,000; `grok-4.5` (2026-07-08) 500,000; `grok-4.6`
  (2026-08-12) 500,000. 2M → 500K is the stated three-quarters reduction,
  and the dates match the body to the day.
- The seven-vendor comparison holds: newest rows for anthropic/ (1,000,000),
  openai/ (1,050,000), google/ (1,048,576), deepseek/ (1,048,576), meta/
  (1,048,576), moonshotai/ (1,048,576), z-ai/ (1,310,720) — every one at a
  million tokens or more, as claimed.
- Index and price: 4.3 II 37.9 → 4.5 II 55.8 → 4.6 II 60.9; input
  0.00000125 → 0.000002. Both rises as written.
- `grok-4.6` is the newest x-ai row in the snapshot — "current frontier
  model" holds.
- 4.20 listed 31 March, 4.3 listed 30 April: the sequence really does read
  4.20 then 4.3, so numeric-suffix sorting misorders this vendor. Measured,
  not asserted.
- Transclusions resolve; volatile values feed-bound; aliases sane (Grok as
  manual is right — it names the model family).

Nothing in the piece is decoration: every paragraph is a measurement with a
reading attached, and the un-marketed context reduction is a finding a
skeptical reader would want to check and can, from the rows cited. Approve.
