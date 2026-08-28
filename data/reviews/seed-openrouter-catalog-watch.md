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
