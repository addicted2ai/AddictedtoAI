---
job: seed-wiki-org-z-ai
verdict: approve
reasons: []
would-cite: >-
  The page to hand anyone claiming no LLM vendor ever announces a model's
  retirement: a census showing eight dated rows in a 388-row catalog, six of
  them Z.ai's — one a real 2026-12-31 retirement for the GLM-4.5 pair, four a
  2098 sentinel — with the twist that neither date is printed on the listing
  page a buyer reads, verified against the live pages.
reviewer: r6-fable
date: 2026-08-28
---

Checklist: wiki org entry whose findings are censuses over the OpenRouter
snapshot. Every census re-run by script against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows); sources
fetched 2026-08-28.

Verified by measurement (r6-fable-census.mjs over the snapshot):
- 13 of 15 z-ai rows carry a Hugging Face id; the two that do not are
  exactly `glm-5-turbo` and `glm-5v-turbo`. Turbo input is exactly 2.000x
  glm-5's input (1.2 vs 0.6 per M) and 2.083x on output (4 vs 1.92) — "exactly
  double ... a shade over double" is the measured truth. `glm-5v-turbo`
  matches `glm-5-turbo` to the digit (1.2/4 vs 1.2/4).
- Expiration census exact: 8 non-null `expiration_date` rows in 388; six are
  z-ai's; the other two vendors (dots-studio, moonshotai) carry one each.
  glm-4.5 and glm-4.5v both read 2026-12-31; the four current rows all read
  2098-12-31 — seventy-two years out, as written.
- Listing dates all exact: glm-5 2026-02-11, glm-5-turbo 2026-03-15,
  glm-5v-turbo 2026-04-01, glm-5.3 2026-08-18, glm-5.3-flash 2026-08-26
  (eight days later). 5.3 and 5.3-flash share ctx 1310720; input 1.4 vs
  0.075 per M = 18.67x, i.e. "around a nineteenth". Modalities match the
  prose (5.3 text-only; flash text+image+video).
- All transcluded model files exist and carry the referenced fields
  (feed-bound), including the `expiration_date` facts the author added.

Verified by fetching:
- en.wikipedia.org/wiki/Zhipu_AI — all five front-matter facts confirmed
  verbatim ("Founded in 2019", "Headquarters Beijing, China", "formerly known
  as Zhipu AI outside China until its rebranding in 2025", "MIT License since
  July 2025", "On 8 January 2026, Z.ai held its IPO on the Hong Kong Stock
  Exchange" + "China's first major LLM company that went through an
  initial public offering"), plus all five timeline release dates (GLM-5
  12 Feb, 5.1 7 Apr open-source, 5.2 16 Jun with one-million-token window,
  5.3 14 Aug). Independently re-fetched; agrees with the prior evidence file
  `data/reviews/evidence/org-z-ai-fact-reverification.md`.
- openrouter.ai/z-ai/glm-5.3-flash — the quoted "hybrid sparse and linear
  attention architecture" appears verbatim; the page prints no expiration
  date; live prices ($0.075/$0.25, ctx 1,310,720) match the snapshot.
- openrouter.ai/z-ai/glm-4.5 — no expiration/retirement date printed on the
  public page either; live prices ($0.60/$2.20) match the snapshot. So
  "Neither date is printed on the listing page a buyer reads" is verified on
  both a retirement-dated row and a sentinel-dated row.

Not independently verified: nothing material. One rounding note, not a
defect: "seventeen months after listing" is exact for glm-4.5 (25 Jul 2025 →
31 Dec 2026) and slightly generous for glm-4.5v (11 Aug 2025 → 16.7 months).

The payload is real and doubly so: the expiration-date census (a field almost
nobody fills, used two distinct ways) and the only public number for a closed
premium at this vendor. Every "zero exceptions"-shaped claim re-ran clean,
the ratio claims are anchored to the dated snapshot in the prose, and the
one claim about live pages held when fetched. approve
