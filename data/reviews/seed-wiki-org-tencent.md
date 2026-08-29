---
job: seed-wiki-org-tencent
verdict: revise
reasons: [false-or-unsupported-claim]
would-cite: >-
  Against the assumption that context windows only ever grow: one vendor
  listed the 2026 catalog's shortest window (8K, on purpose-built
  translation models) and a million-token window nine days apart — a
  measured factor of 128, with the next-smallest 2026 row at exactly twice
  the translators'.
reviewer: r6-fable
date: 2026-08-28
---

Checklist: wiki org entry built on context-window and pricing censuses over
the OpenRouter snapshot. Censuses re-run by script against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows); sources
fetched 2026-08-28.

Verified by measurement (r6-fable-census.mjs):
- The three hy-mt2 rows (created 2026-08-19 and -20) all advertise 8,192 —
  the smallest window of any row created in 2026; the next smallest 2026 row
  is rekaai/reka-edge at 16,384, exactly twice. hy4-preview (created
  2026-08-28) at 1,048,576 is exactly 128x the translators'. All exact.
- hy4-preview is the only tencent row of seven without a Hugging Face id
  and the only one above $1/M output ($2.501; the GA hy3 is $0.33 in the
  snapshot). hy3-preview (2026-04-22) still listed beside hy3 (2026-07-06).
  hunyuan-a13b-instruct created 2025-07-08, weights present. All exact.

Verified by fetching:
- en.wikipedia.org/wiki/Tencent — founded 7 November 1998; Tencent Binhai
  Mansion, Nanshan District, Shenzhen; Hunyuan debuted September 2023;
  "After a preview release in April 2026, the company's open-weights Hy3
  model was made available under the Apache License in July 2026." All
  confirmed.
- huggingface.co/tencent/hy-mt2-7b — Apache 2.0; "support translation among
  33 languages" verbatim.
- openrouter.ai/tencent/hy4-preview — "a mixture-of-experts model from
  Tencent, with 49B active parameters out of 770B total" verbatim; no
  weights link on the page; live prices match the snapshot.
- openrouter.ai/tencent/hy3 and /hy3-preview — decisive for the required
  change below: hy3's live price is now $0.126/$0.522 against the
  snapshot's $0.0825/$0.33, while the preview still lists $0.18/$0.60.

Required change (the revise):
1. `false-or-unsupported-claim` — the timeline entry "2026-07-06 — Hy3
   listed generally available, under the Apache License and at under half
   the preview's list price." The ratio was computed from the 28 August
   snapshot ($0.0825 vs $0.18 = 0.46) and attached to a 6 July event no
   price data in this repository covers — and it is already false against
   the live page fetched today: $0.126 vs $0.18 is 0.70, not under half.
   The body handles the same comparison correctly (both prices transcluded,
   only the direction "undercutting" typed — still true at 0.70). Cut "and
   at under half the preview's list price" from the timeline event, or
   restate it in the body anchored to the snapshot date like the piece's
   other ratios. This is the exact rot the site's transclusion rule exists
   to prevent, in the one place the piece typed a ratio into a dated event.

Also noted (not blocking): "Tencent's release pattern is preview first,
then weights and a price cut" generalizes from one completed generation,
though the piece immediately shows hy4 breaking it, which keeps the
sentence honest in context.

The window census is the strongest single measurement in this slice —
exact, surprising, and self-anchored — and the hy4 closed-weights turn is a
real finding. One typed ratio pinned to the wrong date keeps it from
publishing as-is. revise
