---
job: seed-openrouter-catalog-watch
verdict: approve
reasons: []
would-cite: >-
  Someone building on the OpenRouter models endpoint who hit the -1 sentinel
  or the :free naming trap — the field-by-field autopsy with reproduced
  outputs is the reference to paste.
reviewer: seed-review-6.5
date: 2026-08-28
---

Checklist: tutorial. Evidence transcript at
data/reviews/evidence/tutorial-openrouter-catalog-watch.md, compared block
by block, plus an independent fetch of the live endpoint today.

- **Execution evidence**: every output block in the tutorial matches the
  transcript exactly — both snapshot runs (398 rows, the two timestamped
  filenames), the full report.mjs block, the full fields.mjs block
  (sentinel rows, expiration list, suffix census, gap table, tilde list,
  cache-ratio list), the 0-changes diff, and the canary's four signals. The
  transcript also records a first canary version that only fired 3 of 4
  signals and why — real-session texture, and the published version drops a
  named row instead, as the evidence says.
- **Independently re-derived from the live endpoint (2026-08-28T21:15Z),
  my own fetch and script, not the author's**: 398 rows, links.next null;
  priced 372 / zero-priced 21 / sentinel "-1" on the same five router ids;
  cache-priced 236; context disagreements 40; twelve ~ ids; suffix census
  (none)=339 :batch=41 :free=18; the same three zero-priced ids without a
  :free suffix; llama-4-scout 1310720 listed vs 131072 top-provider;
  248 priced rows at >=200k with the same cheapest three;
  372+21=393 and the five-row remainder — all reproduce exactly.
  One drift since the morning snapshot: expiration_date now appears on 7
  rows, not 8 (z-ai/glm-4.5v no longer carries one). The tutorial's own
  "row counts and prices move daily; meant to be re-derived, not quoted"
  caveat covers precisely this.
- **The visibility claim is measured, not asserted**: the kimi-k2.5 check
  (date present in the page's data payload, absent from 14,936 chars of
  rendered text, absent from the listing page) is backed by both a raw
  fetch and a rendered-browser transcript in the evidence, and the
  tutorial's claim is carefully limited to what was measured.
- **Front matter complete and honest**: subject tool/openrouter resolves;
  verified_against is a dated served-state description (right shape for an
  API with no version number); verified_on 2026-08-28; reverify_days 30.
- **Unexecuted steps disclosed**: no multi-day run, so no real
  arrival/departure diff — named, and the canary is correctly framed as the
  substitute. The "what will break this first" list names the real risks
  (pagination, sentinel format, naming conventions).
- Arithmetic spot-checks: 372+21=393 vs 398 (five sentinel rows) correct;
  the 120.8x and 50.0x cache ratios recompute from the shown prices.

Approve.

## Recheck 2026-08-29 (addictedtoai-flh) — one correction, verdict unchanged

I re-derived the whole field census twice: once from the committed
2026-08-28 Pulse snapshot (`data/sources/openrouter-models/latest.json` at
commit 04c6c8f, 388 rows, fetched 18:19Z) and once from my own live fetch of
`https://openrouter.ai/api/v1/models` on 2026-08-29 (655,347 B, 396 rows).

**The live re-derivation reproduces the tutorial almost exactly**, which is
strong evidence the published numbers were real and not reconstructed:
zero-priced **21**; cache-priced **236**; context disagreements **40**;
priced rows at >=200k **248**; sentinel `-1` on the **same five** router ids;
**twelve** `~` ids; the **same three** zero-priced ids without a `:free`
suffix; `:batch=41 :free=18` in the suffix census; the same top cache ratios
(`xiaomi/mimo-v2.5-pro` 120.8x, then three at 50.0x); `links.next` null. Four
of those — 236, 40, 248, 41 — are identical to the published figures a day
later.

The 388-vs-398 gap between the morning snapshot and the tutorial's 20:26Z
fetch resolves cleanly: the suffix census differs **only** in `:batch`
(31 in the snapshot, 41 in the tutorial, 41 live today), and `priced` differs
by the same 10. Ten batch rows were listed between 18:19Z and 20:26Z. Nothing
else moved.

**Correction made — one sentence, one number's denominator.** The body read
"And 248 of 398 rows clear a 200k-token bar". 248 is the count of **priced**
rows clearing the bar: `report.mjs` derives `wide` from `priced`, and the
code's own output line says "(248 rows qualify)" under a `cheapest input`
heading. The all-rows figure is materially larger — **263 of 388** in the
snapshot, **270 of 396** live today — so presenting the priced-only count as
a fraction of every row understates it. Changed to "248 of the 372 priced
rows", using the denominator the tutorial itself printed six lines earlier.
The sentence's point (a 200k bar is now unremarkable) is strengthened, not
weakened. Note the round-one reviewer wrote it correctly as "248 priced rows
at >=200k" — the slip was in the prose only.

**The unreproducible claim, partially reproduced.** The kimi-k2.5 visibility
check rested on a headless-Chromium render I cannot repeat. I did the server
half: fetching `https://openrouter.ai/moonshotai/kimi-k2.5` (827,885 B),
`2026-08-31` appears **only** in the embedded JSON payload, as
`"deprecation_date":"2026-08-31T13:00:00.000Z"`, and none of `2026-08-31`,
`expir`, `retir`, `deprecat` or `sunset` appears in the non-script text.
That is precisely the tutorial's claim — "It is in the page's data payload
and in this endpoint, and nowhere a reader will meet it." (My character count
differs from the published 14,936 because server-side extraction is not a
browser render; the direction of the finding is what reproduces.) The row
still carries `expiration_date: 2026-08-31` live today, two days out.

Drift since publication, all covered by the tutorial's own "meant to be
re-derived, not quoted" caveat: 398 -> 396 rows, `expiration_date` on 7 rows
rather than 8 (`z-ai/glm-4.5v` no longer carries one), and
`deepseek/deepseek-v4-flash-0731` now prices input at 0.000000045 rather than
the 0.050/Mtok shown in the table.
