---
job: seed-wiki-org-tencent
verdict: approve
reasons: []
would-cite: >-
  Someone assuming a preview is the cheap way in and that context windows only
  ratchet upward: Tencent's preview row still lists above the generally available
  row that replaced it, and the same vendor shipped 8K and 1.05M windows nine
  days apart in August 2026.
reviewer: rr2b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Censuses re-run from
scratch against `data/sources/openrouter-models/latest.json` (2026-08-28, 388
rows); sources fetched 2026-08-29 and confirmed by literal substring match.

Verified by measurement:

- Tencent has exactly seven rows. `tencent/hy-mt2-7b` created 2026-08-19;
  `tencent/hy-mt2-30b-a3b` and `tencent/hy-mt2-1.8b` created 2026-08-20; all
  three advertise 8,192. Across all 193 rows created in 2026 those three are the
  smallest, and the next smallest is `rekaai/reka-edge` at 16,384 — exactly
  twice, as the page says.
- `tencent/hy4-preview` created 2026-08-28 at 1,048,576. 1,048,576 / 8,192 = 128
  exactly, and 19 to 28 August is nine days. 1,048,576 is large but not the
  largest 2026 row — several sit at 2,000,000 — and the page correctly writes
  "one of the longest" rather than the longest.
- hy4-preview is the only one of the seven with `hugging_face_id` null, checked
  against all seven, and the only one above a dollar per million output tokens:
  $2.5010 against the next highest at $0.6000. Its description carries "with 49B
  active parameters out of 770B total", matching `newest_model_parameters`, and
  it has no weights link.
- `tencent/hy3-preview` created 2026-04-22 at prompt 0.00000018;
  `tencent/hy3` created 2026-07-06 at 0.0000000825 — the generally available row
  does undercut the preview, and the preview is still listed beside it. The
  oldest row, `tencent/hunyuan-a13b-instruct`, created 2025-07-08, is still
  listed and still carries `tencent/Hunyuan-A13B-Instruct`. All nine
  transclusions resolve to declared fields.

Verified by fetching:

- huggingface.co/tencent/Hy-MT2-7B, raw README: front matter `license:
  apache-2.0`, body "all of which support translation among 33 languages" — the
  fact's wording is the card's own. Worth recording, because it is a place a
  later pass could go wrong: OpenRouter's copy for these rows says "33 language
  pairs" instead, which is a different claim. The entry cites the card, and the
  card is what it matches.
- en.wikipedia.org/wiki/Tencent, raw wikitext: `founded = {{Start date and
  age|df=yes|1998|11|7}}`; `hq_location = [[Tencent Binhai Mansion]], [[Nanshan
  District, Shenzhen]], Guangdong, China`; "Tencent debuted its Hunyuan line of
  large language models in September 2023"; "After a preview release in April
  2026, the company's open-weights Hy3 model was made available under the Apache
  License in July 2026." All four facts confirmed verbatim.

Round 1 (r6-fable) found: `false-or-unsupported-claim` on the 2026-07-06 timeline
entry, which typed a ratio — "at under half the preview's list price" — computed
from the 28 August snapshot and pinned to a 6 July event, already false against
the live page. **Fixed exactly as the rule prescribes**: the entry now reads
"priced below the preview it replaced", direction only, with the two prices left
to transclusion in the body where they cannot rot. r6-fable also noted, without
blocking, that "Tencent's release pattern is preview first, then weights and a
price cut" generalises from one completed generation.

I reached that same sentence independently and by a different route, and record it
as the one soft spot left. "Preview first, then weights" sits four lines above
"Tencent shipped downloadable weights at preview stage last generation", and the
entry's own timeline says the April preview was listed "with published weights at
preview stage" — which I confirmed, since hy3-preview's `hugging_face_id` is
`tencent/Hy3-preview`. The topic sentence survives only if "weights" is read as
"Apache-licensed weights", which is what the Wikipedia fact transcluded in the
same sentence actually says. It is ambiguous rather than flatly self-contradictory,
but a reader can hit it without leaving the page. Separately, "the next smallest
is exactly twice that" is true under the 2026 scope the preceding clause
establishes, and would be false read against the whole snapshot, where four
pre-2025 rows sit between 4,095 and 8,000; the fence is carried by the clause
before it.

It clears the bar as it now stands, and the remaining defect is one topic
sentence, not a failed argument. The finding a citer would use this for — one
vendor listing the year's shortest and near-longest context windows nine days
apart, a measured factor of 128, and a preview that costs more than the release
that replaced it and stays on the shelf anyway — verifies to the row, and the one
place the page had previously typed a ratio into a dated event is now stating
direction only.

---

## Recheck, 2026-08-29 (b2-prices) — `addictedtoai-sdh`

Verdict unchanged: **approve**. The context-window finding — the factor of 128
between two Tencent rows nine days apart — re-verified and is untouched. Two
price sentences attributed listings to Tencent that Tencent did not set, and
both are hedged. **One claim the issue flagged turned out to be correct as
written**, and is recorded here so a later pass does not "fix" it.

### What was measured

2026-08-29 against `https://openrouter.ai/api/v1/models/<row>/endpoints`,
headlines from `data/sources/openrouter-models/latest.json` (`date: 2026-08-29`):

- **`tencent/hy3`** — **7 endpoints**. **Tencent's own (`tencent/fp8`) posts
  `0.0000000825` in / `0.00000033` out — the cheapest on the row.** The snapshot
  headline is `0.000000132` / `0.000000528`, which **matches no live endpoint**:
  the nearest are Baidu `0.000000131868` / `0.000000527472` and GMICloud
  `0.000000126` / `0.000000522`. The top provider has already moved since the
  snapshot was taken, which is the defect demonstrating itself inside one row.
- **`tencent/hy3-preview`** — **1 endpoint, GMICloud**, `0.00000018` /
  `0.0000006`. **No Tencent endpoint at all.** The preview row's price is
  entirely a third party's.
- **`tencent/hy4-preview`** — **1 endpoint, Tencent**, `0.000000834` /
  `0.000002501`. The headline **is** Tencent's own rate.

### Hit 1 — the "price cut" (body, second paragraph)

*"Tencent's release pattern is preview first, then weights and a **price cut**
... `tencent/hy3` followed on 6 July **at** X for input against Y on the
preview"*. The direction survives every reading — `0.000000132 < 0.00000018` on
headlines, and `0.0000000825 < 0.00000018` if you take Tencent's own hy3 rate
against the preview — so this is **not** a conclusion inversion. The falsehood
is the actor: **Tencent never posted a price on the preview row**, so there is
no Tencent-to-Tencent cut to describe.

Changed: "a price cut" → "a cheaper row"; "followed on 6 July **at** X" →
"followed on 6 July, **heading at** X"; and the house hedge added — both are
the top listed provider's rate rather than necessarily Tencent's own, so this is
a gap between two listings and not between two prices Tencent set. The
"expensive way to use the same generation" line is kept; it is true of the
listings.

### Hit 2 — the dollar-per-million claim (body, third paragraph)

The issue predicted this one calls it a "Tencent row" while the number is a
third party's. **That prediction is wrong, and I am recording the check rather
than the assumption.** `tencent/hy4-preview` has exactly one endpoint and it is
Tencent's, so `0.000002501` out — $2.501/M — **is** Tencent's own rate.

The superlative also holds. Output prices for all seven Tencent rows in
`latest.json`, per million: `hy4-preview` **2.501**, `hunyuan-a13b-instruct`
0.570, `hy3` 0.528, `hy3-preview` 0.600, `hy-mt2-30b-a3b` 0.295, `hy-mt2-7b`
0.295, `hy-mt2-1.8b` 0.177. Exactly one exceeds a dollar.

What was actually loose here was smaller: the verb, and the **comparison**
figure. `{{fact:model/tencent-hy3#price_output}}` = `0.000000528` matches no
endpoint (Tencent's own hy3 output is `0.00000033`). Changed "the only Tencent
row **priced** above a dollar" → "**listing** above a dollar", and added the
split explicitly: the hy4 figure is Tencent's own — with no published weights
there is no third party to host the row, which the page has already established
two sentences earlier — while the hy3 figure beside it is whichever provider
currently heads a row several other companies also serve.

That asymmetry is reasoned from the page's own stated premise (hy4-preview is
"the only one of Tencent's seven rows with no Hugging Face id") rather than from
an endpoint count, because a count rots and a reason does not.

### Facts untouched

No transclusion or front-matter fact was edited. The headlines are faithful to
OpenRouter; only the prose reading them as vendor rates was wrong.
