---
job: seed-wiki-model-anthropic-claude-haiku-4-5
verdict: revise
reasons:
  - false-or-unsupported-claim
would-cite: >-
  Someone insisting that the million-token context window is now table stakes
  across a whole vendor's lineup would be corrected here: Anthropic's cheap
  tier still ships the same 200k ceiling Claude 3 Haiku had in March 2024,
  and it is the only current Anthropic tier that never moved.
reviewer: r8-opus
date: 2026-08-28
---

Checklist: model entry, no cited URLs — every claim is feed arithmetic.
Recomputed against `data/sources/openrouter-models/latest.json`
(snapshot 2026-08-28, 388 rows) with a script; all 28 Anthropic rows
enumerated rather than sampled.

**Verified:**
- "Every other current Anthropic tier runs at a million-token context
  window": the current row of each tier is haiku-4.5 (200000), sonnet-5
  (1000000), opus-5 (1000000), fable-5 (1000000). True on the natural
  reading of "current tier". The other sub-1M Anthropic rows are all
  superseded (claude-3-haiku, opus-4, 4.1, 4.5) or `:batch` variants of the
  same, so nothing current contradicts it.
- haiku-4.5 `context_length` 200000, identical to claude-3-haiku's 200000,
  and those are the only two Haiku rows in the feed — so "nothing about the
  Haiku line's context window has moved since" is exhaustively true, not
  true-of-a-sample.
- claude-3-haiku carries no `intelligence_index` — "no recorded benchmark
  index at all" holds.
- sonnet-4 1000000 vs opus-4 200000 is exactly a fifth.
- **The fifteen-minute claim is real.** sonnet-4 created
  2025-05-22T16:12:51Z, opus-4 created 2025-05-22T16:27:25Z — 14.57 minutes
  apart. I checked this expecting it to be the invented detail; it is exact.
- Opus "caught up at 4.6": 4.6 is the first Opus row at 1000000, and 4.7,
  4.8 and opus-5 all hold it.
- All 6 transclusions resolve; every volatile value is bound.

**The defect — final sentence:**
- "Haiku, released later than either jump, is the tier that never got one."
  Half of this is false, and it is the load-bearing half. haiku-4.5 was
  listed 2025-10-15T17:00:38Z. The Opus jump to 1M happened on
  **claude-opus-4.6, created 2026-02-04T15:30:50Z** — roughly three and a
  half months *after* Haiku 4.5 shipped, not before it. Haiku 4.5 was not
  "released later than either jump"; it was released later than one of them
  and earlier than the other. The sentence's rhetorical force — Anthropic had
  already moved every other tier and declined to move this one — is not
  supported by the dates.
- The fix is small and makes the observation stronger, not weaker: Haiku 4.5
  landed *between* the two jumps and has sat at 200k through the Opus jump
  and two Sonnet releases since without being refreshed. The interesting fact
  is the ten-month silence after the jump, not a false ordering.
- Related wording to tighten while there: "Sonnet has run at 1M since at
  least sonnet-4" is correctly hedged, because there is no earlier Sonnet row
  in the feed — which means there is no observable Sonnet *jump* at all, and
  "either jump" promises two events where the data shows one.

The piece clears the bar on payload — "Haiku is the only current Anthropic
tier still at 200k, and has been since March 2024" is a real assembled
finding an enthusiast would not have to hand, and the 14-minute listing gap
is the kind of detail only this site's data can produce. It fails on a
checkable date ordering in its closing sentence. Worth saving; revise.
