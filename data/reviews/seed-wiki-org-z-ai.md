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

---

## Recheck, 2026-08-29 (b2-prices) — `addictedtoai-sdh`

Verdict unchanged: **approve**. The expiration-date census — the page's real
payload — re-verified and is untouched. The closed-premium claim beside it was
**false as an attribution** and has been rewritten.

### What was wrong

The approval calls "the only public number for a closed premium at this
vendor" a payload. It was comparing a Z.ai price against a reseller's price.

Measured 2026-08-29 against `https://openrouter.ai/api/v1/models/<row>/endpoints`,
headlines from `data/sources/openrouter-models/latest.json` (`date: 2026-08-29`):

- **`z-ai/glm-5`** (open, 11 endpoints) — headline `0.0000006` in / `0.00000192`
  out is **GMICloud's**, tied with StreamLake and DeepInfra. **Z.ai's own
  endpoint posts `0.000001` in / `0.0000032` out.**
- **`z-ai/glm-5-turbo`** (closed, **1 endpoint: Z.AI**) — `0.0000012` in /
  `0.000004` out. The headline **is** Z.ai's own rate.
- **`z-ai/glm-5v-turbo`** (closed, **1 endpoint: Z.AI**) — `0.0000012` /
  `0.000004`. Same.

So "exactly double on input and a shade over double on output" was arithmetic
on `0.0000012 / 0.0000006` = **2.0** and `0.000004 / 0.00000192` = **2.083** —
correct arithmetic on a mismatched pair. **Z.ai against Z.ai it is
`0.0000012 / 0.000001` = 1.2x input and `0.000004 / 0.0000032` = 1.25x
output.** The superlative was the tell: an "exactly double" that falls to 1.2x
under a like-for-like reading was never measuring a pricing decision.

### What changed in the body

Facts untouched; prose only.

- "both list at twice the price of the open model they shadow" — **deleted**.
- "the closed price is exactly double the open one on input and a shade over
  double on output" — **deleted**. No replacement ratio was typed, because the
  honest one cannot be transcluded: there is no fact for a non-top provider's
  rate.
- "That gap is the only public figure anywhere for what this company charges to
  keep a checkpoint to itself" — **withdrawn**, and replaced with why the gap
  cannot mean that: the open row's figure is whichever host currently heads it.
- Added the one structural point that is genuinely durable and explains the
  whole asymmetry: **a checkpoint with no published weights has no third party
  able to host it, so on the two Turbo rows the listed price is Z.ai's own, and
  on the open rows it need not be.** That is reasoned from a premise the page
  itself states two clauses earlier ("carries no weights"), not from an endpoint
  count — deliberately, because a count rots and a reason does not.

### Re-verified and untouched

The third paragraph (`glm-5.3` vs `glm-5.3-flash`, "around a nineteenth as
much") was checked and is **not** an instance of this defect: **both** rows are
Z.ai-served at the headline — `glm-5.3` headline `0.0000014` matches Z.ai's own
endpoint, and `glm-5.3-flash` headline `0.000000075` matches Z.ai's own (tied
with four others). `0.0000014 / 0.000000075` = **18.67**, so "around a
nineteenth" holds at the vendor's own rates. Left alone.

### Flagged rather than edited

Two counting claims in this file have gone stale and are **not** part of this
defect, so they were left as found: "thirteen of its fifteen rows" (the
2026-08-29 snapshot carries **16** z-ai rows, 14 with a `hugging_face_id`) and
"Of the 388 rows in that snapshot" (`latest.json` is now 396 rows;
`previous.json` is the 388-row 2026-08-28 one the prose names). The prose
anchors itself to 28 August while the transclusions render from the current
snapshot. Filed separately rather than half-fixed here.
