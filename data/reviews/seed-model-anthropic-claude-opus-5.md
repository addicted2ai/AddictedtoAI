---
job: seed-model-anthropic-claude-opus-5
verdict: approve
reasons: []
would-cite: >-
  An engineer explaining a cost regression after upgrading to Opus 5 would
  cite the default-reasoning boolean flip — same effort ladder, different
  default, different bill for a request that says nothing; and the 200x
  price span from a cached batch read to fast-mode output is the page to
  link in any "what does a token from this model actually cost" argument.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching (anthropic.com/news/claude-opus-5):**
- Release 24 July 2026 ("Claude Opus 5 is available today", dated Jul 24,
  2026).
- "greatly improved performance for the same cost as its predecessor,
  Opus 4.8" — supports the timeline entry.
- Fast mode: "runs around 2.5 times the default speed", "available at twice
  Opus 5's base price" — supports the fast_mode_speed fact verbatim.
- "at max effort, the model performs within 0.5% of Fable 5's peak score,
  but at half the cost per task" (Cursor benchmark) — quoted accurately.
- "surpassing Fable 5's best result at just over a third of the cost"
  (OSWorld) — quoted accurately.
- "it remains behind Mythos 5 on cybersecurity tasks" — quoted accurately.

**Verified by measurement:**
- `reasoning.default_enabled`: opus-5 true; opus-4.7 and opus-4.8 both
  false. The quiet boolean is real.
- Effort ladder identical across 4.7, 4.8 and 5: supported_efforts
  [max, xhigh, high, medium, low], default high — "the effort ladder itself
  is unchanged" is measured, not assumed.
- Prices: opus-5 0.000005/0.000025, cache read 0.0000005; opus-5-fast
  0.00001/0.00005 (exactly 2x base); opus-5:batch 0.0000025/0.0000125
  (exactly half), batch cache read 0.00000025. Cached batch read
  0.00000025 to fast output 0.00005 = 200x — "more than two orders of
  magnitude" holds.
- II: opus-5 63.1 vs fable-5 62.1 at 0.00001 input — "the premium tier is
  behind the flagship and ahead of it on the invoice" is exact.
- Transclusions resolve (including cross-entry ones to opus-5-fast and
  fable-5); every volatile value is feed-bound; aliases sane.

The prose earns its place beyond the data row: the default-flip reading,
the exchange-rate framing of the fast/batch/cache spread, and the closing
"top of the purchasable stack rather than the top of the stack" all say
things the table cannot. Approve.
