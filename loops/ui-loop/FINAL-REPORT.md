# ui-loop — final report

**Stopped at iteration 9 on `max_iters`, three rounds after the criterion tripped.
This is budget exhaustion, not convergence.** Both iteration-8 judges and the closing judge
said independently that the loop had not converged, and they were right.

---

## Trajectory

| iteration | overall | what actually happened |
|---|---|---|
| 0 | 7.0 / 6.8 | Two judges, identical evidence. **Noise floor NF1 = 0.2**, per-category spread up to 1.0 |
| 1 | 7.0 | Shipped real craft work **and a severe regression** — `/catalog`'s column headers landed on their own data rows with every gate green |
| 2 | 7.1 → 7.25 | Repaired its own regression. Judge caught two evidence-rig defects and refused to score confidently on evidence it distrusted |
| 3 | — | **No verdict by design.** A blind forced-choice diagnostic, because two rounds of verified work had produced no movement |
| 4 | 7.70 | First movement clearly above the floor |
| 5 | 8.00 | **Taste categories moved 0.000.** All +0.30 was an accessibility instrument correction, decomposed and disclosed |
| 6 | — | Instrument round. **5 of 14 checks proved one-sided** |
| 7 | 8.25 | First honest delta in three verdicts. Ladder → **Well-designed reference site** |
| 8 | 8.40 / 8.40 | Two judges, identical evidence, **identical score** |
| 9 | **8.475** | Closing verdict. Judge computed 8.50, then moved off the target and said so |

**Target 8.5 unmet by 0.025.** The closing judge disclosed it first landed exactly on the
threshold and removed a +0.25 it could not defend. That disclosure is worth more than the
0.025.

## The measurement that surprised me most

**The noise floor is a property of the rubric, not the domain.**

| | iteration 0 | iteration 8 |
|---|---|---|
| overall spread | 0.2 | **0.00** |
| worst per-category | 1.0 | **0.50** |
| categories identical | — | **9 of 11** |

Same method, same model, both times. What changed was the scale: two categories became
hard-measured lookups, one taste category was rewritten from a global preference into a
surface-conditioned test, the capped contributor left the aggregate, and every move
required a named evidenced cause. **A rubric that tells a judge what to look at and how to
decide produces agreement; one that asks for an impression produces a spread.**

Caveat that matters: agreement measures precision, never accuracy. Two judges reading the
same wrong scale agree perfectly — which is what the iteration-3 forced-choice diagnostic
exists for.

## What the artifact gained

Measured, not asserted: ~516 per-row rules removed then **selectively restored** where a
reader must track across rows; `--accent` reserved for state and meaning across 7 routes;
one record-link treatment across five index surfaces; `/catalog` usable at 390px, which it
was not; working sticky column headers; `/tools` columns aligned page-wide at **0px spread
across 35 listings**; the wiki entry's FACTS block moved beside the prose so the answer
surface stops burying its answer; complete 817-stop keyboard sweep on the largest route.

## What is still wrong, with the reason each is open

1. **`/catalog` at 390px is a 102-screen scroll** — 396 records x 215.9px = 86,379px. **The
   artifact's largest defect.** Ruled a product decision, not presentation: pagination
   changes what the table IS — a single addressable surface a reader can Ctrl-F and cite.
   Outside this loop's charter. It was mis-filed as `ui-fixable` for seven iterations, which
   inflated the open queue and made convergence look further away than it was.
2. **S18's wiki-entry clause is gate-red on 495 pages** — dead second track at ~33% against
   a 60% floor, improved from ~23%. The check passes at 61.7% when forced, so the red is a
   real measurement and not an unsatisfiable check.
3. **I46, a regression this round caused** — unboxing the theme badge left it identical to
   the toneless badge, so 495 entry pages read `ACTIVE STABLE HISTORY ARGUMENT CULTURE` as
   one undifferentiated run. The accent went and the field boundary went with it. **Found by
   the closing judge, not by the round that caused it.**
4. **The evidence rig has never captured `/tutorials` or `/impossible-routine`** in nine
   iterations, and 768px is scored every round from an evidence class that does not contain
   it. 54 of this round's 58 span-rule fixes landed on a route no judge has ever seen.
5. **The freshness oracle is a wall-clock stamp**, so running the mandated build guarantees
   a "fatal" mismatch — the mechanism by which a known-lie became a blindfold.

## Ranked queue for whoever picks this up

1. Close S18 by rendering all 495 entries and taking the threshold from the distribution —
   converts a refused guess into a measured constant.
2. **Fix the evidence rig first.** Capture the two never-seen routes and the 768px band.
   Findings on unseen surfaces are unverifiable by construction.
3. Fix the freshness stamp so L6 stops crying wolf.
4. I46 (the badge collision) and I49.
5. `/catalog` mobile density — as a product decision, with the keeper, not as a loop item.

## The honest verdict on the loop itself

**Deliverable: yes, with three named defects.** A reader can use this site for what it
exists for. Every remaining defect has a number, a governing rule, an invariant and a
written reason it is open. The gate is red exactly where the artifact is short and explains
itself in its own intent string. That is worth more on handover than the 0.025 it is
missing.

**But the loop did not finish well, and the closing judge named why:** three of the four
highest-impact items were blocked on a keeper question unanswered since iteration 2, and the
loop responded with three rounds of instrument work. *An instrument that measures a defect
nobody is authorised to fix is, by round nine, a well-calibrated way of not finishing.* When
those rulings were finally made they took minutes and needed no new evidence. What blocked
them was not difficulty — it was that nobody was required to decide.

That is recorded in the builder as **F17**, and it is the most useful thing this loop
produced.
