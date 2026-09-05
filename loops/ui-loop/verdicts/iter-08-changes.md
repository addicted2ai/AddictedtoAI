# Iteration 8 — change manifest

**Anchor: `iter-07.json`, overall 8.25, ladder "Well-designed reference site".**
**No mapping changed this round.** Any movement you record is the artifact.

## Implemented — five items

| item | what changed |
|---|---|
| I35 | `/blog`'s `.rail-posts` spanned 1152px over 500px of content — a 652px overhang. Bounded. Orchestrator measured the overhang independently before the round: container 1152.0, content right edge 500.0 |
| I36 | R8's badge clause (colour weight reserved for exceptions) widened to the two surfaces it governs but did not reach: `/catalog`'s Read column and `/tools`' `.listing-verified` |
| I31 | The home page's decorative `--accent` on `.door` / `.delta` removed — colour returns to state and meaning (R9). This defect predated the anchor; a previous judge found it and correctly held the category rather than scoring a pre-existing defect as a regression |
| I38 | **The tolerance cliff.** S1/S15/S18 now PRINT REMAINING HEADROOM on every pass instead of silently sitting at the bound. `/blog` was at exactly 3 of 3 permitted lines with zero margin — one longer title would have fired the gate with no lever left. The instruction was print the margin, do not loosen the bound, and that is what shipped |
| I23 | **Partially resolved, second clause declined with cause.** The preamble collapse gets `/catalog`'s first record fully visible in the first viewport at 390x844 (measured top 450.9, bottom 660.4, both inside [0,844]). The record-height clause (<=120px) was declined per the item's own stated fallback: I27, still unresolved, blocks the only lever that closes it without a content edit |

New checks S20, S21. S1, S5, S15, S17, S18 rewritten or extended, all re-falsified in both
directions. R7, R8, R9, R10, R13 addenda in `RULES.md`.

## Three factual errors found and corrected — two of them mine

The implementer was asked to verify each item's checkable specifics against source. It
found:

1. **My queue said "four items" and listed five.** Orchestrator error.
2. **My scope line omitted `app/page.tsx`**, which I31 legitimately needs. Orchestrator error.
3. **A fabricated "licence" field had propagated into `app/globals.css`'s source comments.**
   Origin: the iteration-5 verdict itemised four fields on `/tools` including a licence field
   that exists nowhere on that surface. It travelled verdict -> iteration-7 implementer
   report (via a charitable reinterpretation that preserved the false detail) -> a source
   comment, where a later reader would have met it as documentation of the artifact.
   Corrected in place with a note recording what was wrong, rather than silently deleted.

## An instrument bug the implementer caught by falsifying its own work

Its first `/blog` clause for S5 measured a grid row's **outer box** and did not fire under a
real, visible break — **reproducing the exact "vacuous box" mistake documented in S1's own
preserved post-mortem, on a new surface, minutes after reading that post-mortem.** Rewritten
to read the row's resolved grid tracks; both directions now verified firing. Reported rather
than quietly fixed.

## Gates, re-run by the orchestrator

`npm run build` clean. `scripts/verify-design.mjs` 45/45. `tools/ui-invariants.mjs`
**19 of 19**, every check carrying falsifier evidence in both directions, zero
`oneSidedBecause` escape hatches. Evidence recaptured after the final change, 40/40
identity-verified, stamp matching the tree. Every changed page inspected visually at
1440x900 and 390x844 in both themes by the implementer.

## Still live

I23's second clause (blocked by keeper-gate I27), evidence-fixes I13 and I26, keeper-gates
I14 and I27, and I39.

## THE QUESTION FOR THIS VERDICT

**Has this loop converged, and is the artifact delivered?**

You are one of TWO judges scoring this identical evidence, deliberately. Your predecessor
cited D3: a shrinking item queue is not proof of a clean artifact, it is also consistent
with a judge running out of things it can see. A second reading at the end is owed for the
same reason one was taken at the beginning.

So: **score it, and answer the convergence question on its own merits.** If actionable
`ui-fixable` items remain, name them and say the loop has not converged. If none do, say so
plainly — that is delivery, whatever the number reads. **Do not inflate toward the 8.5 gate
and do not withhold a number the evidence supports.** The taste categories averaged 7.94
last round against the 8.3 that gate requires; that gap is information, not a target to
close by drift.

## Standing note

NF1 = 0.2 on the overall, measured at iteration 0. Hold a category unless you can name the
visible change that moved it.
