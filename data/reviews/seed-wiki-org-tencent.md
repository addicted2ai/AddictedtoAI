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
