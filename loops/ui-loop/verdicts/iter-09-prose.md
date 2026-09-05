# iter-09 — closing verdict

**Overall 8.475 against an 8.40 anchor (+0.075). Verdict: Well-designed reference site.**
**This is a STOP on max_iters, not a convergence.** The target (8.5) is unmet by 0.025,
which is a rounding error against a noise floor of 0.2 — the honest statement is that the
loop finished flat, with two named local gains, below its own stopping threshold.

---

## What I did before scoring

Every gate run by me, from logs, never from a piped exit code:

| gate | result |
|---|---|
| `node tools/ui-invariants.mjs` | **18 of 19**. The single FAIL is S18's wiki-entry clause, exactly as the manifest declares. No other check is red. |
| `node scripts/verify-design.mjs` | **45 checks, 0 failures.** Zero axe violations on 4 routes × 2 themes. All four focus sweeps print *"the complete tab order"* — 83, 27, 422 and 98 stops. |
| `npm run build` | Clean. 620 static pages, 2 exports, compiled in 2.3s. The 8 warnings are content-layer `currency-literal` advisories, pre-existing and outside this loop's charter. |

No `serve-static exited with 1` anywhere — all three gates bound their sockets. L1's
amendment was therefore not exercised this session, but the narrowing is right and I note
it held: I had no ambiguous failure to misattribute.

**L6, and I hit it myself.** The evidence set records `buildStamp 2026-09-01T07:52:30Z`;
the tree now reads `08:01:28Z`. The difference is *my own mandated `npm run build`* over a
tree I never edited. I checked the source of the mismatch rather than waving it through,
and it is benign — but the mechanism that produced it is not, and I have filed it as **I48**.
A judge who follows both instructions in this contract is guaranteed an L6 mismatch, and a
fatal rule that fires routinely on a benign cause is how L1 became a blindfold in the first
place.

### Interrogating the checks — I broke everything I scored on

Seven checks were touched. I did not inherit the implementer's falsification evidence; I
re-ran it, and added negative controls the report did not have.

| break I ran | check | result |
|---|---|---|
| `.change-annotation{border-left-color:var(--accent)}` | S20 | **fired** |
| `.span-rule{background:var(--accent);opacity:1}` | S20 | **fired** |
| `.door{border-top-color:var(--accent)}` | S20 | **fired** |
| `.door{border-top-color:red}` | S20 | **green — correct.** Negative control: the sweep is accent-specific, not always-red |
| `.rung{border-top:3px solid var(--accent)}` (/learn) | S20 | **green — a real scope gap**, see I47 |
| `.site-footer{border-top-color:var(--accent)}` | S20 | **green — a second, undeclared scope gap**, see I47 |
| `.listings{grid-template-columns:… !important}` | S19 | **fired**, reproducing the exact 60.9px pre-state |
| `.listing-pricing{font-style:italic}` | S19 | **green — correct** |
| `.catalog-preamble[open] > summary{border-bottom:1px solid var(--rule)}` | S5 | **fired**, 1152.0px vs 670.3px |
| `.src{color:var(--ink) !important}` | S17 | **fired**, "24/24 rows (100.0%)" |
| `.rail-posts .rail-item{…var(--measure-list)}` | S15 | **fired**, collapse branch at 384.0px vs the 608.0px cap |
| `.entry-side{min-height:1200px}` | S18 | **PASSES at 61.7%** — the red clause is satisfiable, not vacuous |

That last one matters most for reading the gate honestly. **S18's failure is a real
measurement of a real defect, not a check that can never be green.** I confirmed that
rather than taking the implementer's word for it, because an honest red is only honest if
the green is reachable.

The two S20 greens are the round's own thesis reproducing inside the round that was about
eliminating it. More on that below.

---

## Category-by-category, as deltas from 8.40

The anchor per category is the mean of the two iteration-8 judges, who differed on exactly
two categories (`first_read_hierarchy` 8.5/8.0, `responsive_integrity` 8.0/8.5) and agreed
on the other nine.

### colour_discipline 8.5 → **9.0** (+0.5)

The round's real result, and the only category where I moved more than a quarter point.

`.change-annotation`'s border, `.span-rule`'s background (58 instances across two
templates), `.badge[data-tone="theme"]` on 495 entries, and `.src` on 24 of 24 changed-feed
rows all came off `--accent` at rest. Two further dormant instances (`early` badge, `warn`
notice) were fixed pre-emptively rather than left as landmines.

**I did not score this from the check.** The check covers 7 of 14 routes and one theme, so
I swept the rule's actual domain myself: all 14 routes, both colour schemes, every element
of the whole `<body>`, every border side plus background plus outline, compared against
`--accent`'s live-resolved value per theme (`rgb(74,59,212)` light, `rgb(156,147,255)`
dark). **Exactly one hit, on every route, in both themes: `a.skip`'s background** — the skip
link, which sits at `left: -9999px` until focused.

So R9's absolute clause is *substantively satisfied across the entire property, in both
themes* — something no previous verdict in this loop could assert, because no previous check
looked at more than two selectors. That is a genuine systemic result and it earns the half
point. It is inside the 0.5 per-category noise band the manifest declares, and I would
normally hold for that reason; I am moving it because the measurement covers the complete
domain rather than a sample, which makes it the least taste-dependent number in this verdict.

Held below 10 for two reasons: the palette has no third hue — the `early` tone had to fall
back to the base badge *for want of one*, which is a real expressiveness limit the
implementer named honestly — and the rubric explicitly asks about "the un-stamped state",
which **no capture in the evidence set contains**. Every image is `light` or `dark`; the
`auto` default is unphotographed.

### list_and_table_craft 8.5 → **8.75** (+0.25)

`/tools`: `.listing-verified` and `.listing-entry` went from seven x positions with 60.9px
of spread to **exactly one x each across all 35 listings in all 12 categories**. I
reproduced the pre-state myself with the per-category-revert break, which printed the same
60.9px and the same `"Argilla" vs "Aider"` pair the implementer measured.

In `index-tools--light--1440.png` this is two clean, unbroken vertical rails running the
full 4,591px of the page. **This is the Stripe mechanism, and it transfers for the right
reason**: Stripe's tabular surfaces hold a column rail *across* section boundaries, so a
reader scanning for one field never re-acquires it at a heading. That property depends on
the content being a repeated fixed-format record set — which 35 tool listings are, and which
is why the treatment transfers here and would not transfer to prose. Before this round the
rail broke at every one of twelve category headings.

Held at 8.75, not 9: `/catalog` at 390px is a **102-screen scroll** (measured live — 396
records at a uniform 215.9px, 86,379px of document) with no pagination or grouping; and the
newly perfect `/tools` alignment turned a 100%-repeated string into a page-long band (I49).

### typographic_system — **held at 7.5**, and I want to explain the hold

`--measure-title` (38rem) is a correct fix to a real inversion: `/blog`'s post titles were
bounded to 384px while the *lede above them* ran to 608px — the page's primary objects
narrower than its own secondary explanatory text. `index-blog--light--1440.png` shows
headlines and lede now sharing one right edge, and the titles at 2 lines instead of 3.

**I initially scored this 7.75 and then took it back.** Against Vercel's benchmark — a grid
whose rhythm stays visible across *every page of the property* — this is one measure token
on one of ten templates. The scale, the weights, the vertical rhythm and the face are all
unchanged. And the result lands at **2 of 2 lines with zero headroom**: the identical cliff
shape as before, at a different line count, which the implementer recorded honestly rather
than selling as slack. A token whose only consumer sits exactly at its bound has not yet
demonstrated that it is a system. R16 also remains a *narrowing* of the cross-platform
defect, not a closure — Charter and Bitstream Charter are still unadjusted.

This is closer to iteration 2's classification: repair of a defect the loop itself created
by over-sharing a token, rather than progress.

### first_read_hierarchy — **held at 8.25**, with named offsetting changes

Up: `/blog`'s inversion is gone; the wiki entry's answer-first structure is now complete
rather than half-relocated (FACTS, TIMELINE and RAILS all reached the freed column instead
of RAILS stranding below the whole two-column block).

Down: **I46**, and it is caused by this round. Unboxing `.badge[data-tone="theme"]` was
right on R8's own terms — a topic tag is a category, not an exceptional state, and boxing it
marked the norm as the exception. But nothing took the box's place. `.badge[data-tone="theme"]`
now resolves *byte-identically* to `.badge:not([data-tone])`, so on 495 pages three
different fields render as one undifferentiated caps run:

> ACTIVE STABLE HISTORY ARGUMENT CULTURE

`ACTIVE` is a lifecycle status, `STABLE` is a maintenance state, the last three are topics.
A reader cannot see where one field ends and the next begins — and this site distinguishes
exactly these field classes everywhere else. Confirmed in both themes and both viewports
(`wiki-entry--light--1440.png`, `wiki-entry--dark--390.png`) and in the built HTML.

This is JUDGE.md's **"relocation is not resolution"** test failing. I asked what took the
old thing's place, and the answer was: the field boundary went with it.

One clear gain on one template with four rows, one subtle loss on 495 pages. I judge them
to cancel and hold at 8.25 — recorded as an explicit hold with both movements named, not as
a default.

### family_coherence — **held at 7.5**, and this is the round's central tension

Three real convergences: `/tools` joins one page-wide track system; `/blog`'s measure now
agrees with the prose templates' `--measure`; `.src` adopts the same rest/hover pair every
other record link already uses. Each is a template rejoining the family.

Against them, one measured, gate-acknowledged divergence: **the wiki entry template runs the
same two-column mechanism as the home page at 32.9% where home runs at 87.7%.** In
`wiki-entry--light--1440.png` the right column ends around y=740 while prose continues to
~1830 — roughly 1,300px of empty column beside the prose body's lower two thirds. The rubric
says a template that looks good alone but breaks the family caps this category, and this one
does, on 495 pages.

**The honest red is progress in documentation, not in coherence.** The loop now *knows and
has written down* that this template diverges. The divergence itself is still there. I will
not pay a category for candour about an unfixed defect — that would make the gate's honesty
a scoring instrument, which would corrupt it immediately.

### chrome_restraint — held at 9.0

The catalog preamble's 481.7px rule overhang was removed rather than resized (the better
choice: the control exists to solve a 390px problem, and the rule was only ever painted at
1440 where there was none). No chrome was added anywhere. The surface classification still
holds correctly: `/catalog` (396×7, cross-row tracking) and the home feed (ragged entry
heights) keep their rules; `/wiki`, `/data`, `/tools` — link indexes of near-uniform
single-line rows, which is why **Linear's near-chromeless treatment genuinely transfers
there and not to `/catalog`** — keep them off. One hairline removed on one route does not
move a category scoring the whole system.

### information_density — held at 7.5

No density change. `/blog` saves one line on four rows; `/tools`' alignment marginally aids
scanning. The dominant constraints are both keeper-blocked and unchanged: `/catalog` at
390px yields ~3.9 records per screen at 215.9px each, and the only remaining CSS-safe
reduction is blocked behind I27.

### responsive_integrity — held at 8.25

I verified the round's riskiest change at narrow myself. `.entry-side` uses
`display: contents` below 60rem, and `wiki-entry--dark--390.png` confirms FACTS still
renders *before* prose — S14's answer-first order survived a grid-topology change intact.
`/catalog` at 390: no page-level horizontal scroll, first record at 451–660px inside an
844px viewport. `/tools` stacks below 26rem. Nothing regressed.

I note without scoring it that "holds at 390" is doing considerable work when the flagship
route holds by producing 102 screens. That is I14, it is a keeper gate, and R12's actual
requirement is met.

### accessibility — 10 (hard-measured, read not judged)

Zero axe violations, both themes, all sampled routes. All four sweeps print *"the complete
tab order"*. Mapping row 10. No interpretation applied.

### payload_discipline — 9 (hard-measured)

Worst page `/catalog`: **122.6 KB gzipped** against the 150 KB bound = 81.7%. ≤85% → 9.
Reaching 10 needs ≤90 KB, which the catalog's 17.9 KB of inline payload puts out of reach
without a structural change.

### visual_distinctiveness — 6 (capped, excluded from the aggregate)

The site has real identity: the mono/serif pairing, a home page that opens on a dated line
with no hero, "impossible → routine" as a nav destination, the wordmark dot. This round made
the palette quieter by removing accent from five resting surfaces — marginally *less*
distinctive, entirely correct on every other axis. **That is the cap working exactly as
designed**, and it is why the cap exists. Held at 6.0 and excluded from the overall, per the
iter-04 correction.

> **Instrument-change disclosure, carried per JUDGE.md:** under the ten-category mean the
> iteration-2 scores read **7.25** where the old eleven-category mean read **7.136**. The
> artifact did not improve by 0.11; the instrument stopped contradicting itself.

---

## The arithmetic

```
8.25 first_read_hierarchy
9.00 chrome_restraint
7.50 information_density
8.75 list_and_table_craft
7.50 typographic_system
9.00 colour_discipline
7.50 family_coherence
8.25 responsive_integrity
10.0 accessibility
9.00 payload_discipline
----
84.75 / 10 = 8.475          (visual_distinctiveness 6.0 scored, excluded)
```

Anchor 8.40 → **8.475, +0.075.**

**On landing near 8.5.** My first pass computed exactly **8.50** — the target, to the
decimal. I went back through the three category moves and removed the weakest of them
(typographic_system's +0.25, for the reasons given above). I am recording that I moved
*off* the threshold rather than onto it, because a judge whose arithmetic lands precisely on
the stopping condition owes the record an account of which way they leaned and why. The
remaining +0.075 is **below the 0.2 iteration-0 noise floor** and should be read as *flat
with two named, independently-measured local gains* — not as progress toward a target.

### Why six resolved items produce +0.075

Five of the six were **check-scope widenings**, and the artifact-visible change each carried
was small by construction: a hairline recoloured, a link muted, one rule deleted, one column
set re-anchored. The round's actual deliverable was *enforcement coverage over a rule's full
domain* — and **this rubric has no category that scores "the gate now measures what the rule
says."** state.md pre-registered exactly this at iteration 6 ("hardening checks changes
nothing a judge can see — it changes what the loop can PROVE"), and it reproduced precisely.

That is not a complaint about the round. Widening R9's enforcement from two selectors to a
document sweep is how the three live accent violations — and two dormant ones — were found at
all. It bought credibility, not visible quality, and the score should say so rather than
manufacture a number that flatters it.

---

## Convergence: NO. This is a stop.

**Both iteration-8 judges said the loop had not converged. I verified it, and they are still
right.**

The charter's gate is `overall >= 8.5, or zero ui-fixable items remain, or max_iters 6`.

- **Overall 8.475 — target unmet.** Not by much, and not meaningfully: 0.025 against a 0.2
  noise floor is not a near miss, it is the same number.
- **Zero ui-fixable items — false.** Three remain, one of them carried and red at the gate.
- **max_iters 6 — exceeded by three rounds**, and this is the criterion actually stopping the
  loop. Budget exhaustion.

**The distinction matters and I will state it plainly: the loop is being halted by a rule it
already broke, not because it ran out of findings.** It is still producing them. This round's
own widened checks discovered two violations nobody had reported (`data-tone="early"`,
`data-tone="warn"`), and my own interrogation of this round's flagship check found two more
scope gaps in it (I47) plus one regression the round itself caused (I46). A loop that
generates three new findings in its closing verdict has not converged by any reading.

### What remains open, with impact

**Actionable now (`ui-fixable`) — 3 items:**

1. **I40 — the wiki entry dead track (impact 6).** 495 pages, ~1,300px of empty column,
   32.9% against a 60% floor, red at the gate. The single largest presentation defect left.
2. **I46 — the collapsed badge field run (impact 5).** 495 pages. New, caused this round,
   cheap to fix.
3. **I49 — `/tools`' 35 identical verification dates (impact 4).** Now perfectly aligned into
   a page-long band. The remedy is already established on `/catalog` and, unlike there, is
   *not* content-blocked here.

**Instrument and evidence (`evidence-fix`) — 6 items:** I47 (S20 misses the header/footer,
7 of 14 routes, and every check is light-theme-only while S20's intent string claims both),
I44a (`/tutorials` and `/impossible-routine` never captured in nine iterations — and 54 of
this round's 58 span-rule fixes landed on `/impossible-routine`), I48 (the freshness oracle
punishes a judge for running the mandated gates), I44b (the `/catalog` 390 captures are
86,379px tall), I13 (nothing scroll-linked is observable), I26 (fidelity by signature-match),
I45 (a carried item that is arithmetically unsatisfiable and should be a tombstone).

**Keeper-blocked — 3 items:** I14 (102 screens, now measured), I27 (the screen-reader
measurement, unperformed since iteration 2, now blocking two other items), I39.

**The shape of what is left is worth naming.** The artifact's single largest *reader-facing*
defect — I14 — is one this loop is structurally forbidden to fix. Its most leveraged
*unblocking* action — I27 — is a measurement no agent in the loop is permitted to perform.
The loop did not stall on difficulty; it converged onto its own charter boundary and then
kept spending rounds on the instrument, which is exactly what a loop does when its remaining
work is out of scope and nobody evaluates the kill criterion. That is the trajectory's real
lesson and it is worth more than the score.

---

## What a tenth iteration should do, ranked

1. **Close I40 by measurement, not by heuristic.** The declined lever was declined for the
   right reason — an unvalidatable threshold — but the validation is *one batch job*: render
   all 495 entries headless, record `.prose` and `.entry-side` heights, pick the threshold
   from the distribution. That converts a refused guess into a measured constant and turns
   the loop's only red gate green honestly. If the distribution has no clean split, that is
   itself the answer: change the mechanism for this template rather than lower the floor.
2. **Fix the evidence rig before touching the artifact again (I44a, I47).** Two of seven nav
   destinations have never been seen, in nine rounds, and this round shipped most of a fix to
   one of them. Everything downstream of the rig — including every verdict, including this
   one — is bounded by what it captures. Widen S20's sweep to `<body>` (one exclusion needed,
   for `.skip` — I verified that is the only thing it would fire on) and add a dark-theme
   context to the runner.
3. **Fix I48.** Cheapest item on the list, and it currently teaches every judge that a fatal
   freshness check can be ignored. That is the precise failure mode L1's amendment was
   written to prevent, growing back in a different field.
4. **Ship I46 and I49.** Both small, both on primary surfaces, both with the remedy already
   established elsewhere in the system.
5. **Take three questions to the keeper as one package:** retire or restate I45; perform I27's
   screen-reader measurement (it unblocks I45 and materially affects I14); and rule on I14
   itself. These are now the majority of the artifact's remaining defect surface and none of
   them moves while they sit in a queue no one is authorised to action.
6. **Budget for the harness.** It now exceeds two minutes per run — the cost of widening
   checks to full rule domains, and a cost worth paying. But the next loop should pay it
   deliberately: the marginal check is no longer free, and a round that adds three more
   document sweeps will feel it.

**One process note, since state.md already promoted it to B22 and this verdict is the
evidence for it:** the kill criterion was never evaluated, not once, in nine rounds, and
every individual round was defensible. That is the signature of an overrun — a stopping
condition exists precisely so a sequence of individually-reasonable steps cannot run past it.
Evaluating it must be a named, recorded step, not a thing an orchestrator is trusted to
remember.

---

## Is the artifact in a deliverable state?

**Yes — with three named defects a reader will actually meet, all of them written down.**

I am answering the question asked, not the one about the target. The site exists so a reader
arriving to find or learn one specific thing can find it. Judged as that reader's tool:

**What works.** The gates that bound the floor are genuinely green and I ran them myself:
zero axe violations in both themes, every tab stop indicated across the complete tab order
including `/catalog`'s 422 stops, no horizontal scroll at 320 or 390, 122.6 KB against a 150
KB budget. Accent is reserved for hover and focus across the entire property in both
themes — verified over the whole domain, not sampled. `/tools` and `/blog` read cleanly and
scan well. `/catalog` at 1440 is close to Stripe-grade: quiet muted provenance, right-aligned
numerics, unboxed default status, row rules where the surface genuinely needs cross-row
tracking, sticky column headers that stay in their corridor. The wiki entry template puts the
FACTS a reader came for above the fold at both viewports, in both themes. A reader can use
this site.

**What they will hit.**

- **`/catalog` on a phone is a 102-screen scroll.** Four filter controls, no pagination, no
  grouping. Anyone browsing rather than filtering will bounce. This is the biggest thing
  wrong with the artifact and it is *outside this loop's charter* — recorded as I14 with a
  measured number so the decision can be made on a fact.
- **The wiki entry template — 495 pages, the site's most numerous surface — shows a large
  empty column at desktop widths.** It is not broken, it looks unfinished. Recorded, measured,
  and red at the gate.
- **The entry identity line runs three fields together as one caps string.** New this round,
  subtle, on 495 pages. Recorded as I46.

**The deliverability test I actually applied is the second half of the question — "with its
remaining defects known and written down" — and this is where the artifact is unambiguously
strong.** Every defect above is filed with a measured number, a governing rule, an invariant,
and a named reason it was not closed. The gate is red where the artifact is short, and the
red explains itself in its own intent string rather than being scoped away or floored down.
When a fix failed, the failure was measured and reported (the three-independent-grid-items
attempt) rather than quietly replaced. A fabricated field name was caught against source
before it propagated — the second such catch in this loop. Declines carry cause, in writing,
in the rule file.

That last property is worth more, on handover, than the 0.025 the loop is short. **An
artifact whose remaining defects are measured, located and explained is deliverable in a way
that an artifact with a higher score and an unexamined gate is not.** I would hand this to a
reader today, and I would hand this queue to whoever picks it up next without apology.

Where I would push back on the loop's own self-assessment: it is *slightly* better at
documenting boundaries than at crossing them. Three of the four highest-impact remaining
items are blocked on a keeper who has been asked and has not answered since iteration 2, and
the loop responded by spending rounds seven, eight and nine on the instrument. The
instrument work was real and I verified it. But an instrument that measures a defect nobody
is authorised to fix is, at the ninth round, a well-calibrated way of not finishing.

---

## Benchmarks cited

**Stripe** — structured tabular presentation as a first-class surface, with a column rail
that survives across section boundaries so a field is never re-acquired at a heading. This
round's `/tools` fix is exactly that move, and it transfers because the content is a repeated
fixed-format record set. `/catalog` at 1440 already had it; `/catalog` at 390 does not,
because 396 stacked records at 215.9px is not a table any more.

**Linear** — density without clutter, structure from type weight and spacing. Correctly
scoped by this loop's own iter-03 ruling: it transfers to `/wiki`, `/data` and `/tools`
because their rows are short, uniform-height and few-columned — the property of Linear's
*content* that makes its treatment portable. It does not transfer to a 396-row seven-column
price table, and the loop no longer pretends it does. That scoping is one of this loop's more
durable results.

**Vercel** — a grid whose rhythm stays visible across every page of the property. This is
where the artifact is furthest behind, and it is why `typographic_system` is held at 7.5. The
`--measure-title` token is a correct move in the right direction on one template out of ten;
the property-wide rhythm Vercel demonstrates would require the same examination applied to
the other nine, and the wiki entry template's 33%-filled second column is the loudest
evidence that it has not been.
