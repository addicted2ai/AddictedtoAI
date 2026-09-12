---
date: 2026-09-11
slug: pre-train-366c8cd0-red
type: repair
summary: >
  The pre-train commit 366c8cd04242508ca9c2d875680fbe518de80f4c is red under the full train gate set, so train t-ba60687c holds: no admitted merge is at fault and nothing is reverted. Repair the red base; the held merges ride the next train once its tip is green.
evidence: >
  Train t-ba60687c ran the full TRAIN_GATES set red at its tip and re-ran the same set red on the pre-train commit 366c8cd04242508ca9c2d875680fbe518de80f4c (classification-first, task 38) — last lines:     operator: 'deepStrictEqual', |     diff: 'simple' |   }.
---

Why this is upkeep and not train work. The train cannot fix its own base: every removal it could try leaves the red in place, because the red predates every merge on the train. The fix belongs to a repair job against the base tip named above, after which the held train re-runs green.
