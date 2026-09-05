# ui-loop evaluation log

One table line per iteration (appended in the judge phase), plus one post-mortem
section per iteration (written before the iteration's commit). Append-only.

| date | iter | overall | verdict | items ui-fixable/evidence-fix/keeper-gate |
|---|---|---|---|---|
| 2026-08-31 | 0 (a) | 7.0 | Competent | 13 total (Opus 5, pair member) |
| 2026-08-31 | 0 (b) | 6.8 | Competent | 14 total (Opus 5, LIVE anchor) |
| 2026-08-31 | 1 | 7.0 | Competent | 12 / 2 / 1 |

## Post-mortem format

Per iteration, under a `## Iteration N — <date> — overall X — <verdict>` heading:

- what resolved, what was declined and how each decline was adjudicated;
- **what the orchestrator or the expensive evidence found that the cheap checks could
  not see** — write "nothing" honestly when true; a run of "nothing" entries is spin
  evidence, and each real entry also lands in the state file's defect-class section;
- any re-baseline, rescore, or rubric change, with both scores when a rescore happened;
- score-hold arithmetic when resolved items outweighed regressions yet the overall held.

The trajectory recorded here is allowed to be ugly — collapses on re-baselining and
flat rounds are the number measuring something real. A smooth monotonic rise is a spin
signature, not a success.


---

## Iteration 1 — 2026-08-31 — overall 7.0 — Competent

Scope: the shared design system only (`app/globals.css`, `app/layout.tsx`). Seven items
S1–S7, merged from the union of `iter-00-a` and `iter-00-b`. Judge: Opus 5, anchored on
`iter-00-b` (6.8). Delta **+0.2 — exactly at NF1**, which is the honest reading: this
round is not distinguishable from noise on the aggregate, and says so.

**What resolved.** I2, I4, I6, I7 resolved; I3 and I8 partially. Chrome restraint 5.0 →
7.5 (~516 per-row rules, the catalog's outer box and ~480 default-state chips removed) and
colour discipline 7.0 → 8.0 (`--accent` out of the resting state) are the real movements,
both with named, evidenced causes.

**Declines, adjudicated.** DC1 (column-start alignment) accepted and binding — it needs
`<dt>/<dd>` markup outside scope, and unlabelled facts read worse than misaligned ones.
DC2 (grid track convergence) accepted for scope but its stated reason was WRONG on
re-derivation: `.shell` is at `layout.tsx:127` and `.prose` is in `globals.css`, both in
scope; what is per-template is which content *carries* `.prose`. Recorded as achievable
work deferred, not work that is wrong — and the judge took the explicit invitation and
re-filed it as I16 at a measurably larger size than the anchor described.

**What the expensive evidence found that the cheap checks could not — the round's whole
story.** S7 shipped a severe regression: `/catalog`'s column headers are displaced
downward onto their own first data rows **at scroll position 0**, both themes, both
viewports (1440: thead 462.3–491.1 over rows at 445.1–476.9 and 476.9–508.2; 390: onto
rows 3 and 4). The site's 396-row flagship table has no legible column labels. Three
compounding failures, each recorded where its reader will meet it:

1. **The premise was false.** `.table-wrap` declares `overflow-x: auto`; per CSS the
   visible cross-axis coerces to `auto`, so `.table-wrap` — not the viewport — is the
   thead's sticky containing block. The collision `I7` prescribed a fix for could not
   occur. A faithfully-implemented remedy created the defect it was meant to prevent.
   → RULES.md R11 post-mortem.
2. **The invariant was one-sided.** `S7` asserted only `thTop >= headerBottom`.
   Displacement in the opposite direction makes `thTop` larger and passes.
   → JUDGE.md L4; assertion rewritten two-sided, now correctly FAILING.
3. **The screenshot oracle is structurally blind to it.** Every capture is at scroll 0.
   → JUDGE.md L3.

Build, axe (45 checks), payload and all five invariants were green while this shipped.
**This is the loop's most valuable single output so far: not the fix, but the discovery
that the gate was shaped so that the defect could not be seen.**

**Instrument correction, disclosed.** Accessibility 8.5 → 7.0 and payload 9.5 → 9.0 are
NOT artifact regressions. Both categories are now pure mapping lookups (lowest focus-sweep
ratio 150/817 = 0.18 → 7; 122.2 KB of the 150 KB bound = 81.5% → 9) and the anchor's
numbers were not producible from those tables. The tables are right and the anchor was
loose. **Arithmetic: these two corrections cost 0.18 off the mean for an artifact that did
not get worse. On the anchor's unmapped numbers the overall would read 7.1, not 7.0.**
Both figures are recorded so the trajectory is not silently flattered.

**Held, with justification:** density 6.5, list craft 5.5, typography 7.0,
distinctiveness 6.0 (capped category, unmoved).

**Orchestrator's own misses this round.** (a) The iteration scope line contradicted
`IMPLEMENT.md` — recorded as SKILL.md H3. (b) The orchestrator privately predicted two
findings and withheld them to test recall: the judge did NOT file underline-on-every-row
as a relocated defect (it filed the related but different I18, R9's incompleteness across
templates), and did NOT file `--measure-list` name wrapping — which independent
measurement then showed affects 2 names out of 146, correctly below the filing bar. **One
genuine recall gap; one case where the judge's triage was better than the orchestrator's
prediction.** The judge instead found two S1 side-effects the orchestrator had not
predicted at all (I16 unspent margin, I17 ragged status column).

---

## Iteration 2 — 2026-08-31 — /catalog — score PROVISIONAL, re-judged

Scope: `/catalog` only. I15 (the sticky-header regression **this loop created in iteration
1**) and I1 (unusable at 390px, open since iteration 0). Both impact 9. Three rounds of
implementer work.

**Outcome on the artifact.** Both resolved, verified by direct geometry rather than by
report: labels hold at `thTop 61.3` vs `headerBottom 45.8` at maximum page scroll composed
with container scroll; at 390 the table reflows to one record per row with name, in, out
and status inside the viewport and no horizontal scroll. Round 3 additionally caught and
removed a per-row rule between stacked mobile records — R8's shape relocated into the new
mobile layout.

**Outcome on the instrument, which is the real story of this iteration.** Three separate
rig defects surfaced, none of which any gate could see:

1. **The check certified an incomplete fix (D8).** Round 1's remedy held only at page
   scroll 0. S7 passed because its procedure scrolled "whichever scrollport moves the
   table" — a branch the remedy itself flipped. Found by looking at a screenshot.
2. **The harness verified every rule at one viewport only (closed this round).** S1/S2/S5/S6
   ran at 1440x900 and nothing said so. They now declare `viewports` and the harness
   REFUSES an invariant that declares none. The fix immediately caught the mobile R8
   defect above — a rule that had been green while unverified at the width it was broken.
3. **The screenshot oracle could not render the route this iteration worked (D9, L5).**
   `fullPage` painted `/catalog`'s capped sticky container at ~350px against 661.3px live:
   10 rows of 396, a prematurely-placed footer, ~360px of blank, inside a correctly-sized
   PNG reporting the correct document height. All five identity checks passed. **Identity
   is not fidelity.**

**Process failures, the orchestrator's own, recorded because they cost a whole verdict.**
A parallel session continued implementer work AFTER evidence was captured and AFTER the
judge was dispatched, on the strength of a "stopped" notification. The tree moved under
both. **A stop notice is not proof a writer released the tree.** The first verdict (7.1,
+0.1, below the 0.2 floor) was therefore scored on evidence that was both stale and
misrendered for the one route worked, and is kept as `iter-02.json` but is not comparable.

**What the loop got right under that failure.** The judge caught both rig defects itself,
filed them at impact 8 each, and declined to score confidently on evidence it distrusted
rather than producing a clean-looking number. It also refused to file the
`attr(data-label)` accessibility question into a hard-measured category, correctly citing
T1: admitting an unmeasured judgement into a lookup category is the defect that rubric
change was rejected for. **A judge that reports its instrument is broken is worth more
than one that returns a tidy score.**

**Trajectory, stated honestly.** Iteration 1's +0.2 was scored on a tree whose flagship
table had its column labels lying on its own data rows. Iteration 2 removed a defect this
loop introduced. The counterfactual — what the score would read had iteration 1 never
shipped the regression — is roughly flat. **Two iterations of real work on the shared
system and the catalog have produced substantial craft improvements and approximately zero
net movement in the number.** Whether that indicts the artifact, the rubric, or the noise
floor is the question iteration 3 should open with.

---

## Iteration 3 — 2026-09-01 — a diagnostic, then a surface-typed correction

**This iteration filed no items. It questioned the instrument instead**, because two
iterations of verified work had produced no movement and the loop could not tell "the work
failed" from "the rubric is blind".

**Method.** Blind forced-choice paired comparison, pre-registered in `state.md` before any
result was known. Three runs, escalating in rigour:
1. Reference-tool framing, 9 pairs with a 4-pair control -> baseline won 5/5.
2. Neutral framing, re-randomised -> chose the same SIDE in all five differing pairs,
   mapping to current 4/5. **Failed the position-bias check; uninterpretable.**
3. Mirrored design — every route shown TWICE with sides flipped, so content-tracking and
   position-tracking are distinguishable -> **5/5 mirror-consistent, controls clean.**

**Only run 3 is trustworthy, and its verdict was a SPLIT by surface type**, not a verdict on
the loop: rules earn their keep on `/catalog` (396 rows x 7 columns) and the home changed
feed (ragged entry heights), and cost on `/wiki`, `/data`, `/tools` (uniform link indexes).
De-chipping default badges was right — boxing all 495 statuses destroyed the exception
signal.

**The defect was in the RUBRIC'S SHAPE, not its direction.** `chrome_restraint` was a single
global category scoring a property whose correct value varies by surface. One policy applied
everywhere helped three surfaces, harmed two, and the category averaged the opposing effects
into `5.0 -> 7.5`. No judge could catch it: the scale could not express the distinction.

**Corrections shipped, all keeper-by-delegation:** the rubric category is now
surface-conditioned with an explicit test; R8 rewritten from a blanket ban into that test
with its original text preserved; S2 rewritten to assert rules PRESENT where required and
ABSENT where forbidden across five surfaces at both viewports, falsified in both directions
plus a mobile-leak sub-case; rules restored on `/catalog` desktop and the home feed only.
Gates: build clean, verify-design 45/45, invariants 6/6.

**The orchestrator's own error this round, recorded:** it stalled the loop at a keeper gate
the keeper had already delegated twice. A gate nobody is available to answer is a spin
signature, not caution. Promoted to the builder as B20 with a charter slot for keeper
fallback.

**What iteration 3 cost and returned.** No score was produced and none was wanted. It
returned a corrected instrument, two new scoring rules for the builder (S17 directional
agreement, S18 surface-dependent categories), and the finding that **a narrow score spread
can conceal total disagreement about direction** — NF1 = 0.2 had been read as agreement all
session and was agreement on a number only.

