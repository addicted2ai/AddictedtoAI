---
job: seed-wiki-model-anthropic-claude-haiku-4-5
verdict: approve
reasons: []
would-cite: >-
  Someone reading Anthropic's 200k Haiku ceiling as a deliberate house policy
  for the cheap tier: the listing dates put Haiku 4.5 between the two
  million-token jumps — 146 days after Sonnet, 112 days before Opus — so it is
  a row nobody has returned to rather than a decision taken against a standard.
reviewer: rr5b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Claims re-derived
2026-08-29 from `data/sources/openrouter-models/latest.json` (snapshot
2026-08-28, 388 rows) with my own script, enumerating all 28 Anthropic rows
rather than sampling.

- haiku-4.5 `context_length` 200000; claude-3-haiku 200000 — "the same
  ceiling" is exact. claude-3-haiku carries no `benchmarks` key at all, so
  "no recorded benchmark index at all" is true of the whole object, not just
  of one index.
- The Haiku line is exactly three rows (claude-3-haiku, haiku-4.5,
  haiku-4.5:batch), all at 200000, so "nothing about the Haiku line's context
  window has moved since" is exhaustive rather than sampled.
- sonnet-4 created 2025-05-22T16:12:51Z at 1000000; opus-4 created
  2025-05-22T16:27:25Z at 200000. Gap 14.57 minutes → "within fifteen minutes"
  holds with no rounding in its favour, and "essentially the same day" holds.
- haiku-4.5 created 2025-10-15T17:00:38Z: 146.03 days after sonnet-4 ("146
  days") and 111.94 days — exactly 112 calendar days — before opus-4.6 on
  2026-02-04 ("112 days before ... 4 February 2026"). Both intervals check.
- opus-4.6 is the first Opus row at 1000000 and every later Opus row (4.7,
  4.7-fast, 4.8, 4.8-fast, 5, 5-fast) holds it → "held there ever since".
- Listed after haiku-4.5: Opus 4.5, 4.6, 4.7, 4.8 and 5 (five revisions),
  Sonnet 4.6 and 5 (two), Fable 5 (one), and no Haiku. The closing count is
  right, and it is anchored to "the snapshot of 28 August 2026".
- "Every other current Anthropic tier runs at a million" is true of each
  tier's newest row (sonnet-5, opus-5, fable-5 all 1000000). Superseded rows
  at 200k still list, so the sentence leans on "current"; that reading is the
  natural one and the rest of the paragraph supports it.
- All five transclusions resolve.

Round 1 (r8-opus) found: the closing sentence "Haiku, released later than
either jump, is the tier that never got one" reversed a checkable ordering,
since the Opus jump came three and a half months *after* Haiku 4.5 — fixed;
and "either jump" promised two observable jumps where the feed shows only one,
Sonnet having never been below a million — fixed. The closing paragraph now
says Haiku 4.5 "landed in between" and gives both intervals, and paragraph two
now states outright that only one of the two tiers actually climbed. The
replacement is the stronger observation r8 predicted it would be.

It clears the bar as it stands: the 14-minute listing gap and the
146/112-day sandwich are findings only this site's data produces, and every
one of them survived independent recomputation. One clause to note rather than
to fail on — "a fifth of the size" is a ratio between two `volatility: fast`
transclusions and is not anchored to the snapshot date. It is exact today
(1,000,000 / 200,000), round one checked it and let it stand, and the sentence
is pinned to a dated launch event with both numbers rendering inside it, so a
future feed change would contradict itself visibly rather than silently. It is
the one clause I would anchor if there were a third round; it is not worth the
body.
