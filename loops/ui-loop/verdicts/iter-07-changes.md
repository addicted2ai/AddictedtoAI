# Iterations 6 + 7 — combined change manifest

**Anchor: `iter-05.json`, overall 8.00.** Iterations 6 and 7 are judged together because
iteration 6 was instrument work with almost nothing a judge can score.

## No mapping changed this round — scores are directly comparable to the anchor

The previous two verdicts each carried an instrument correction (the ten-category mean, then
the accessibility mapping). **This round has none.** Any movement you record is the artifact.

## Iteration 6 — the loop's own checks, hardened

The registry now REFUSES any invariant whose falsifier record does not show it observed
firing on BOTH ends of its property. Applying it refused all fourteen existing checks —
nobody had ever established that any of them fired on both sides.

**Result: 5 of 14 were genuinely one-sided (36%).** S1, S15, S16 (a gap-only formula could
not see a label column collapsing or its text wrapping), S11 (no floor — negative gap and
overlap passed), S14 (no floor — FACTS pushed above the viewport passed). The other nine
fired correctly on a fresh, previously untested opposite direction. Only two of the five had
been found by inspection; three surfaced solely because the registry refused them unproven.

**I33 resolved.** Iteration 5's centring remedy had relocated a defect — it split the
unoccupied width but broke the shared left rail (`/data` had four sibling headings at four
different left edges). Centring removed, `width: fit-content` kept, and S9/S13 rewritten
from an occupancy test to a direct shared-rail assertion. R13 amended with the reasoning:
`/tools` and `/learn` both FAIL the old occupancy test and both read fine, which proves
occupancy was never the load-bearing property.

**The hardening immediately exposed two real artifact defects** that were invisible to the
one-sided checks: a `/data` label wrapped to 2 lines and all four `/blog` titles to 3.

## Iteration 7 — four items

| item | what changed |
|---|---|
| ITEM 0 (S1/S15) | The R7 tension resolved, not papered over. Both tracks sat exactly at the 384px cap with content exceeding it. Checks rewritten to a three-way test: too wide (unchanged), collapsed below cap (unchanged), and a tolerated case — wrapping up to 3 lines when pinned AT the cap, a bound derived from the real worst case. **A second masked defect was found en route:** S1 lacked the narrow-viewport gate S15/S16 already had, so `/data` was silently wrapping at 390px too. R7 amended |
| I8 | `/catalog`'s READ column carried one identical date across all 396 rows. The date stays visible per row, but is linked and underlined only where a row's date differs from the table's dominant value — R8's badge clause generalised to a link treatment |
| I9 | **The literal prescription was DECLINED with cause** — the only CSS mechanism (float) requires putting the aside before the page's own H1 in DOM order, contradicting the page's stated design. Instead the existing "Everything here" section was relocated into the rail (no new content), taking fill from underfilled to **87.7%** against a 60% floor |
| I11 | The item's "four fields" claim was corrected to the three that actually exist in the data. Pricing (genuine prose, up to 148 chars) got a flexible column rather than a short-label cap; verified-date and entry-link share `max-content` columns. **The implementer caught and fixed its own mobile regression** — pricing squeezed to a 70px sliver at 390px — before shipping |

New checks S17, S18, S19.

## Gates, re-run by the orchestrator

`npm run build` clean. `scripts/verify-design.mjs` 45/45. `tools/ui-invariants.mjs`
**17 of 17**, every check now carrying falsifier evidence for BOTH directions and **zero
`oneSidedBecause` escape hatches used**. The implementer also ran `npm test`: 419/420, the
single failure pre-existing, unrelated to this loop's scope, and unchanged before and after.
Evidence recaptured after the final change, 40/40 identity-verified, stamp matching.

## Orchestrator's own inspection

Home at 1440: the right rail now runs the full height of the changed feed — catalog count,
deprecations, latest post and tutorial, and the section index — instead of stopping at
roughly y=630 beside a much longer feed.

## Still live — NOT declines, do not mark resolved

I23 (`/catalog` at 390px scannability), I31 (a full-strength accent rule predating the
anchor), I35; evidence-fixes I13, I26; keeper-gates I14, I27.

## What to weigh

- **Three checks are new and two were rewritten.** Interrogate any you doubt:
  `--only S17 --break "<css>"` — 3s, banner, always exits 2, never a gate result.
- **I9's decline needs adjudicating** — is the DOM-order argument sound, and does relocating
  an existing section into the rail satisfy I9's invariant or merely fill space?
- **Convergence.** If no `ui-fixable` item remains that an implementer could act on, say so
  plainly and say the loop has delivered. **The 8.5 target is a stopping condition, not an
  instruction — do not inflate toward it, and do not withhold a number the evidence
  supports.**

## Standing note

NF1 = 0.2 on the overall. Hold a category unless you can name the visible change that moved
it.
