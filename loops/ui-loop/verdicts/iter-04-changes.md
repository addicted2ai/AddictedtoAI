# Iteration 4 — change manifest

**Anchor: `iter-02-rejudge.json`.** Iteration 3 produced no verdict by design — it was a
diagnostic, described below.

## READ FIRST — the instrument changed twice since your anchor, and both change what a score means

**1. `overall` is now the mean of the TEN UNCAPPED categories.** It was an unweighted mean
of all eleven including the capped `visual_distinctiveness`, which contradicted that
category's own cap — the rubric said it may never hold the overall down while the
arithmetic guaranteed it always did. **On the anchor's own category scores this reads 7.25,
not 7.1.** Anchor against **7.25**. The artifact did not improve by 0.11; the instrument
stopped contradicting itself. State both figures in your verdict.

**2. `chrome_restraint` is now SURFACE-CONDITIONED**, and this is the most important change
in the loop's history. It asked "is there less chrome" and now asks "does this surface's
chrome match what a reader must do on it". A blind, mirror-validated forced-choice
comparison (5/5 mirror-consistent, clean controls) found iteration 1's blanket rule-removal
was RIGHT on link indexes and WRONG on surfaces requiring cross-row tracking. Read the
category's own text in JUDGE.md before scoring it; the old blanket reading is now a defect.

Iteration 3 acted on that: R8 rewritten from a blanket ban into a surface test, row rules
restored on `/catalog` and the home changed feed ONLY, badge de-chipping kept.

## Implemented this iteration — seven items, shared design system

| item | what changed |
|---|---|
| I16 + I17 | `.browse` became a shared CSS Grid with `subgrid` rows, so kind/status columns align down the page instead of each row sizing its own tracks; the list shrink-wraps to `fit-content` instead of stretching to the shell. Same mechanism on `/learn`'s rung ladder |
| I20 | section-heading rules bound to their actual content block rather than the heading, which has no width of its own |
| I18 | ink+underline resting treatment extended to the home changed-feed, "Latest post/tutorial", `/learn` rung titles and the Impossible→Routine headline — R9 now covers five index surfaces, not three |
| I24 | nav collapses into a `<details>/<summary>` disclosure below 34rem. Header 129.3px → **77.9px**, 15.3% → **9.2%** of a 390x844 viewport |
| I25 | catalog trailing padding scoped down via `:has()`; wrap-to-footer gap 96px → **24px**; wrap background dropped to page ground, removing the "card" reading |
| I10 | **webfont DECLINED with reasoning** — no verified font-fetch or subsetting toolchain in this environment, and the site is statically exported and offline-honest. Instead: `size-adjust` metric-matching for the fallback faces actually present, normalised to Georgia |

New rules **R13–R16**; new checks **S9–S12**, plus widened S5 and S6. One premise found
false and reported: `/colophon` was never broken for I20 — added as a regression guard, not
"fixed".

## Gates, re-run by the orchestrator rather than taken on report

`npm run build` clean (620 pages). `scripts/verify-design.mjs` 45/45. `tools/ui-invariants.mjs`
**10 of 10**, every one declaring its viewports. Evidence recaptured after the final change,
40/40 identity-verified, build stamp matching the tree.

## Orchestrator's own verification by direct inspection

`/wiki` at 1440: the kind and status columns now start at fixed x positions and can be
scanned vertically down 85 rows. Before this iteration the status column was ragged across
six positions — the defect I17 described. The list ends at its content width instead of
stretching. Exception chips (RETIRED/DEAD/DEPRECATED) remain boxed while ACTIVE is plain.

## What to weigh honestly

- **Not worked, deferred by scope, live and NOT declines:** I5, I11, I8, I9, I23, plus
  evidence-fixes I12, I13, I26 and keeper-gates I14, I27. Do not mark them resolved.
- **I12 remains the sole reason accessibility scores 7 rather than 10.** The focus sweep
  still caps at 150 of 817 elements on `/catalog`. It is an open evidence-fix against the
  harness, not an artifact defect, and it is the orchestrator's to close.
- **The target is 8.5 and it is demanding.** Computed this iteration: under the corrected
  ten-category mean, 8.5 requires the eight taste categories to average 8.3 with both
  hard-measured categories at their ceilings. **Do not inflate toward it.** The target is a
  stopping condition, not an instruction; convergence is delivery whatever the number reads.

## Standing note on the instrument

NF1 = 0.2 on the overall. Hold a category unless you can name the visible change that moved
it. And note what iteration 3 established: a narrow score spread can conceal total
disagreement about DIRECTION — two judges agreeing on a number is not two judges agreeing.
