---
job: seed-org-google-deepmind
verdict: approve
reasons: []
would-cite: >-
  Anyone arguing "just use Flash, the Pro row is stale" would cite this — it
  shows Google's cheap tier scoring above its expensive one on the same
  index at less than half the price, with listing dates; and anyone warning
  that a screenshot of today's Gemini price sheet expires on 2027-01-01 has
  the sourced introductory-pricing end date here.
reviewer: task-6.5 seed reviewer (fresh invocation, no authorship of any seed content)
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched, catalog claims measured against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows).

**Verified by fetching:**
- blog.google (introducing-gemini-3-7-flash) — confirms 13 August 2026,
  "$0.75/1M input tokens and $3.75/1M output tokens" introductory pricing,
  the footnote "Introductory pricing expires on December 31, 2026. Starting
  January 1, 2027, $1.50/1M input tokens and $7.50/1M output tokens will
  apply", DeepSWE v1.1 65.3% vs 49.0%, FrontierCode 1.1 Main 43.6% vs
  34.4%. All four figures exact.
- 9to5google.com 2026/08/13 — confirms the 13 August launch and "Just three
  weeks after the last release", linking the 2026-07-21 Gemini 3.6 Flash
  launch article.
- en.wikipedia.org/wiki/Google_DeepMind — confirms 15 November 2010
  founding, London HQ, April 2023 DeepMind + Google Brain merger, and the
  26 January 2014 acquisition.

**Verified by measurement:**
- `gemini-3.1-pro-preview` created 2026-02-19, II 47.7, input 0.000002.
- `gemini-3.5-flash` 2026-05-19 (II 52, input 0.0000015);
  `gemini-3.6-flash` 2026-07-21 (II 51.6, input 0.00000075);
  `gemini-3.7-flash` 2026-08-13 (II 56, input 0.00000075).
- The inversion is exact: 3.7 Flash beats the Pro preview by 8.3 index
  points at 37.5% of its input price. The 3.6 dip (51.6 vs 52 at half the
  price) and the 23-day gap to 3.7 both hold.
- Catalog price 0.00000075/0.00000375 per token matches the announced
  $0.75/$3.75 per million — the introductory price is what the feed serves.
- Transclusions resolve; volatile values feed-bound; the introductory-price
  fact is a dated literal with its end date inside the value, which is the
  right shape for a price with a published expiry.

**One observation, not blocking:** "the newest Gemini row on the Pro line
is google/gemini-3.1-pro-preview" — the snapshot also holds
`gemini-3.1-pro-preview-customtools` (2026-02-25, a variant of the same
preview) and `gemini-3-pro-image` (2026-06-18, an image-generation model).
Read as "the Pro language-model line" the sentence is true; a pedant could
quibble. Not worth a pass.

The closing paragraph — a price sheet that is "wrong from 1 January 2027
onward, and says nothing about it" — is the kind of sentence this site
exists for. Approve.
