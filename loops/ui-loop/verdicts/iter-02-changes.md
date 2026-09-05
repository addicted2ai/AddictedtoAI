# Iteration 2 — change manifest

Handed to the judge with the `iter-01` verdict block as its anchor (overall 7.0). Facts
only.

**Scope.** `/catalog` only. Two items, both impact 9: **I15** (the S7 sticky-header
regression this loop introduced in iteration 1) and **I1** (the catalog unusable at 390px,
filed at iteration 0 and unresolved through two rounds). They were worked together because
they interact — a stacked mobile table has no columns to label.

**Not worked, deferred by scope and NOT on merit:** I16, I17 (grid-track convergence, with
the re-filed DC2), I18 (R9 reaches 3 of 5 index templates), I19 (`/tools` still rules every
row). All four remain live and are queued for a template-scoped iteration 3. **Do not
re-file them as resolved, and do not treat their absence as a decline.**

**Gates, re-run by the orchestrator rather than taken on the implementer's report.**
`npm run build` clean (log read, not exit code). `scripts/verify-design.mjs` 45 checks, 0
failures; axe 51 rules clean in both themes on `/catalog`; no horizontal scroll at 320px;
payload 123.0 KB of 150 KB. `tools/ui-invariants.mjs` 6 registered, 6 pass.

**Evidence.** `evidence/current/` was recaptured after the final change, 40/40
identity-verified, no duplicates. `evidence/iter-01/` archives the set the anchor verdict
was scored from; `evidence/baseline/` is still the iteration-0 set. Before/after is
available for every route, theme and viewport.

---

## Implemented

| item | what changed | rule |
|---|---|---|
| I15 | `.table-wrap` capped into a genuine scrollport; `thead th` back to `top: 0`; `#catalog-table-wrap` made `position: sticky; top: var(--header-h)` with `max-height: calc(100vh - var(--header-h) - var(--footer-h))`; new measured `--footer-h` token (`FOOTER_HEIGHT_SCRIPT` in `layout.tsx`) | R11 (amended twice) |
| I1 | below 33.999rem `#catalog-table` drops out of table layout into one record per row — model name as heading, label/value lines beneath, `content: attr(data-label)` sourced from the existing `COLUMNS` array; `thead` set to `display: none` at that width | R12 (new) |

Files: `app/globals.css`, `app/layout.tsx`, `lib/render/catalog.mjs`,
`tools/ui-invariants.mjs`, `loops/ui-loop/RULES.md`.

**Expected visual deltas, for verification against the evidence:**

- `/catalog` @1440 both themes — the table now occupies a capped, sticky box parked below
  the site header rather than running the full page; the page's own scroll range fell from
  547px to 355px. Column headers remain visible while the table is read.
- `/catalog` @390 both themes — no table columns at all. Each model is a stacked record:
  name as a heading, then Provider / In / Out / Context / Status / Read as label-value
  lines. The column header row is gone by design.
- No other route was touched. Any change you observe elsewhere is either noise or a
  finding.

---

## Two things about this iteration the judge should know, because they bear on scoring

**1. The regression this iteration fixed was created by this loop, in iteration 1.** It is
not pre-existing damage. Iteration 1's `+0.2` was scored on a tree whose flagship table
had its column labels lying on top of its own first data rows. Whatever `/catalog` scores
now, the honest trajectory is: iteration 1 shipped a severe regression that the anchor
verdict caught, and iteration 2 removed it. Do not read the removal of a self-inflicted
defect as the same thing as forward progress.

**2. The fix took two rounds, and the first round passed every gate while still broken.**
Round 1 capped the container; the column labels then held only while the PAGE was at
scroll 0, and went behind the site header at page scroll 400 and off-screen at 547. The
check certified it because its own procedure was conditional on the artifact's structure
and silently switched branches when the remedy changed that structure (state.md D8). The
orchestrator caught it by looking at a rendered screenshot, not by any automated gate.
**The gate was green and the surface was broken; this is the second consecutive iteration
in which that was true.**

---

## Orchestrator's independent geometry, so you need not take the above on report

- 1440x900, container scrolled to row 50, page at 0 / 178 / 355 (355 is the new maximum):
  labels on-screen and unoccluded at every position. Worst case `thTop 61.3px` against
  `headerBottom 45.8px`.
- 390x844: `thead` computes `display: none`; row 5 carries `$0.75`, `$3.75`, `active`,
  spanning x 14-376 inside a 390px viewport; the page does not scroll horizontally.

## Known limitation, disclosed rather than buried

`content: attr(data-label)` is not reliably announced by every screen-reader/AT
combination. axe-core does not flag the pattern, so R1 stays green — but R1 being green is
not the same as this being accessible, and the implementer said so unprompted. If you
believe this matters, file it; the loop would rather carry the finding than the silence.

## Standing note on the instrument

Anchor `iter-01` scored 7.0. **The measured noise floor NF1 is 0.2 on the overall**, and
per-category spread between two judges on identical evidence reached a full point. Hold a
category unless you can name the visible change that moved it.

Also standing, and relevant here: **every invariant except S7 and S8 runs only at
1440x900.** R7-R10 have never been verified at 390px. That is an open evidence-fix, not a
claim that those rules hold at mobile width. Judge the 390px captures on what you can see
in them, not on the harness's green.
