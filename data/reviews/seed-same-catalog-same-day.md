---
job: seed-same-catalog-same-day
verdict: approve
reasons: []
would-cite: >-
  A person claiming AI prices collapsed — or that they stopped falling — the
  single-response derivation dates both: a 526x fall by mid-2024, then a
  flat floor while context grew tenfold, all from one fetch.
reviewer: seed-review-6.5
date: 2026-08-28
---

Checklist: blog post. The post's single source is the OpenRouter models
endpoint; I fetched it myself today (2026-08-28T21:15Z) and re-derived every
table and number with my own script rather than reading the author's.

- **Headline comparison reproduces**: openai/gpt-4 created 2023-05-28,
  ctx 8191, 30.00 in / 60.00 out per Mtok; ~deepseek/deepseek-v4-flash-latest
  created 2026-08-01, ctx 1310720, 0.03 in / 0.10 out. Arithmetic: 1,161
  days (2023-05-28 to 2026-08-01), 160.0x context, 1000x input, 600x output
  — the title's numbers are the body's numbers and both are the endpoint's.
- **Both progressions reproduce row for row**: the six context record
  holders (gpt-3.5-turbo 16385 -> gpt-4-turbo-preview 128000 ->
  claude-3-haiku 200000 -> unslopnemo-12b 1024000 -> llama-4-scout 1310720
  -> grok-4.20 2000000, with the same dates and prices; 1,038 days checked)
  and the six-step price floor ending 0.019 (mistral-nemo, 2024-07-19) ->
  0.017 (granite-4.0-h-micro, 2025-10-20). Paid rows >=100k: 332;
  zero-priced: 20; 10/0.019 = 526.3; (0.019-0.017)/0.019 = 10.5%; nemo 770
  days listed. All as published.
- **Aging block reproduces**: median 221 (mine: 220-221 depending on
  time-of-day anchor), 96 within 90 days, 170 within 180, by-year
  8/39/150/201, gpt-4.1-nano 501 days / 127.9x / 300x, ling-3.0-flash
  cheapest >=200k at 0.021, kimi-k2.5 listed 2026-01-27 expiring 2026-08-31
  (216-day scheduled life, 3 days left on the post's date).
- **One drift observed in my live fetch**: rows carrying an
  expiration_date are now 7, not 8 — z-ai/glm-4.5v no longer carries one —
  so "four rows carry a real expiration_date" was true of the post's
  snapshot and is three on my fetch. The post is dated, states "every
  number above is dated 2026-08-28", and the evidence shows two
  byte-identical snapshots backing its numbers; this is the catalog moving
  within the day, not an error in the post.
- **The limits section is the best part and is accurate**: prices are
  today's, not listing-date prices (stated twice, at the exact spots a
  reader would misread); created is listing date, not release date; the
  survivor-set caveat is applied to the floor claim correctly ("of 332 paid
  rows, none undercuts" — present tense, catalog-as-it-stands). The
  evidence file additionally records three drafted overclaims corrected
  before publication (the 600 ratio, the paid-only floor, the "original
  price" cut), and the published text matches the corrected versions.
- **Title vs body**: the title claims exactly the two ratios and the day
  count the body derives; no motive or conduct claims anywhere; the scout
  ceiling-vs-served caveat is volunteered right under the record table.
- Mentions: all thirteen referenced model/tool entry ids resolve to files
  in content/wiki/.

No source failed to support its claim. Approve.
