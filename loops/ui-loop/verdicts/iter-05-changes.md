# Iteration 5 — change manifest

**Anchor: `iter-04.json`, overall 7.70** (ten-category mean).

## READ FIRST — two instrument changes since your anchor, both raise scores for reasons that are NOT artifact improvements

**1. Accessibility can now reach 10, and probably will.** Two defects were fixed in the
harness, neither an artifact change:
- The focus sweep capped at 150 stops, so `/catalog` reported `150 of 817 — STOPPED AT THE
  CAP` and the mapping's own rules forced a 7. **The cap was an instrument limit, not an
  artifact defect.** Raised to 2000; `/catalog` now sweeps its complete 817-stop tab order
  at no measurable cost.
- The mapping's top row demanded `swept == total`, comparing tab stops against
  DOM-focusable elements. Those differ by design — a closed `<details>` correctly hides its
  links from the tab order — so iteration 4's mobile-nav fix had made a 10 **unreachable by
  construction on every route**. The denominator is now the tab order, which is what the
  category is actually about.

**Score this category from the corrected mapping, and state plainly in your prose that any
rise is an instrument correction, not an improvement (S15).** Give both numbers: what it
reads now, and what it would have read under the old mapping.

**2. S9 was one-sided and is now two-sided.** Your predecessor found it: `--break
".browse{width:240px}"` returned `ok` for a list occupying 240px of a 1216px shell. Fixed,
after which it immediately turned the gate RED on the real tree at 48.6% occupancy —
confirming I16 was never resolved despite iteration 4 claiming it. That red is what this
iteration was sent to clear.

## Implemented — four items

| item | what changed |
|---|---|
| I16 | The prescription's "widen `.browse` toward the shell's far edge" half was **DECLINED with cause**: it directly contradicts R7, which binds metadata to sit immediately after its label rather than at the container's far edge. Satisfied instead via the invariant's permitted alternative — the affected blocks are centred so unoccupied width splits rather than pools on one side. Applied to `/wiki`, `/data`, `/colophon`, `/blog/[slug]` |
| I5 | Wiki entry restructured by CSS grid placement and `order` only, no markup change: FACTS sits beside prose at ≥60rem and ahead of prose in paint order below that. Verified on `ai-winter`, whose prose is 1945px tall — long enough that stacking alone would bury the answer |
| I30 | `/blog`'s post-title column bound to the existing `--measure-list` token rather than inventing a new measure |
| I32 | `.browse`'s label track changed from fixed `minmax(0, var(--measure-list))` to `fit-content(var(--measure-list))`, so `/tools`' short category labels size to themselves while `/data`'s long labels still use the cap |

New checks **S13–S16**; **S9 widened**. R7 and R13 addenda in `RULES.md` recording the
R7-conflict reasoning.

## A harness defect the orchestrator found and fixed, disclosed because it bears on trust

The implementer reported two falsifier runs where a check "didn't fire", called it a
probable operational flake, and moved on. **It was not a flake.** Measured: S16 fired in
**3 of 6** runs while being perfectly stable on the real gate. Cause: the fast
runtime-injection falsification mode measured in the same tick as the injection, before
style recalculation, layout and font settle — a false NEGATIVE in the mechanism that exists
to prove checks work. Fixed by awaiting `document.fonts.ready` and two frames; now 8 of 8.

**The relevant point for you: S13–S16's falsifier records were produced under the flaky
harness.** They have been re-verified stable since, but if you doubt any check, interrogate
it yourself with `--only <id> --break "<css>"`. It is 2.9s and it is the cheapest way to
find out whether a check measures what it claims.

## Gates, re-run by the orchestrator

`npm run build` clean. `scripts/verify-design.mjs` 45/45. `tools/ui-invariants.mjs`
**14 of 14**. Evidence recaptured after the final change, 40/40 identity-verified, build
stamp matching the tree.

## Orchestrator's own inspection

`/wiki/concept/ai-winter` at 1440: FACTS now occupies the right column adjacent to the
opening paragraph — term origin, Lighthill, ALPAC and the Symbolics trend are all readable
without scrolling. That is the oldest unresolved item in this loop, open since iteration 0.

## Still live, deferred by scope — NOT declines, do not mark resolved

I8, I9, I11, I23 (page templates); I31 (a full-strength accent rule your predecessor found
and correctly held rather than scoring as a regression, since it predates the anchor);
evidence-fixes I13, I26; keeper-gates I14, I27.

## Standing note

NF1 = 0.2 on the overall. Hold a category unless you can name the visible change that moved
it. **The 8.5 target is a stopping condition, not an instruction** — with accessibility now
able to reach 10, it requires the eight taste categories to average 8.25 against a current
7.625. Do not inflate toward it. If the loop has converged, say so; convergence is delivery
whatever the number reads.
