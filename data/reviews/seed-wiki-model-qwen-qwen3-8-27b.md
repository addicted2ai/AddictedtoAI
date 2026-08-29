---
job: seed-wiki-model-qwen-qwen3-8-27b
verdict: approve
reasons: []
would-cite: >-
  Someone claiming Qwen's open weights had been stuck at a 256K context window
  for over a year — this row is where that ceiling broke: 262,144 held across all
  32 Qwen open-weights listings from July 2025 to August 2026, then went twice in
  two days, on the 2.4T flagship and on this 27B.
reviewer: rr4b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29; catalog claims measured against `data/derived/feed-rows.json`
(`$as_of` 2026-08-28), confirmed by literal substring match.

- huggingface.co/Qwen/Qwen3.8-27B README: PRESENT verbatim — "Following the
  widespread community adoption of the Qwen3.5 and Qwen3.6 series, we are pleased
  to introduce Qwen3.8, the most capable generation in the Qwen open-model family
  to date." The grammatical subject really is the **generation**. The entry's
  opening claim — that the superlative on the card is not about this row — is
  correct, and I confirmed it from the sentence rather than from the fact value.
- Front matter declares `license: apache-2.0`; the repo's `LICENSE` (11,544 b) is
  the Apache License, Version 2.0. **"no field-of-use and no user-count clause"
  earns its absence**: "monthly active users", "revenue" and "field of use" are
  each ABSENT from that file.
- Two days apart: `qwen/qwen3.8-2.4t-a95b` created 2026-08-12, `qwen/qwen3.8-27b`
  2026-08-14. "Open by the same test": the 2.4T row carries
  `hugging_face_id` "Qwen/Qwen3.8-2.4T-A95B"; `qwen/qwen3.8-max` carries null.
  Intelligence index 57.7 against 52 — "outscores this row", anchored to the
  dated snapshot. All four measured, all true.
- **The context-window claim, checked exhaustively rather than sampled.** 35
  `qwen/*` rows carry a `hugging_face_id`; 32 of them were created before
  2026-08-01, and the **maximum `context_length` across all 32 is exactly
  262,144** — none exceeds it. The ceiling is first reached 2025-07-21
  (`qwen3-235b-a22b-2507`) and holds to August 2026. So "every Qwen release with
  published weights before August 2026 stops at the smaller of those two figures",
  "the ceiling held from July 2025 to August 2026", "more than thirty rows" and
  "broke twice, two days apart" are all true as written. (The only third row above
  the ceiling is `qwen3.8-2.4t-a95b:batch`, the same weights on a batch endpoint —
  counting two breaks is right.)
- Volatile values: both context windows, both prices, the index and the parameter
  count are `{{fact:…}}` transclusions, not literals; the one comparative is
  anchored to "the 28 August 2026 snapshot". Both rules the brief asked me to
  re-check are intact.

Round 1 (r9-opus) **rejected** it, finding: the body converted the card's
generation-level superlative into a row-level claim Alibaba never made; and it
omitted `qwen/qwen3.8-2.4t-a95b`, the open sibling that outscores this row and
decides the open-versus-closed framing — **both fixed, and the rejection was
correct**. The revision does not patch around either: it opens on the
misattribution as the finding, names the omitted row in the second sentence, and
replaces the falsified framing with a different, verified payload (the context
ceiling). This is the rare case of a rejected piece rebuilt rather than repaired.

I checked the new payload harder than anything else in my slice precisely because
it is new and was not reviewed in round 1, and it survives an exhaustive census
rather than a spot check. It clears all three bar criteria — an assembled finding
no vendor page shows, specific to the row, and worth pasting into an argument.
Approve.
