# Iteration 8 — Judge B

**Anchor: `iter-07.json`, overall 8.25, "Well-designed reference site".**
**This verdict: overall 8.40, "Well-designed reference site". The loop has NOT converged.**

I am one of two judges reading identical evidence without sight of the other's verdict. What
follows is what I measured, what I could not measure, and where I think the number is soft.

---

## 0. No mapping changed this round, and that cuts both ways

I checked the three places a mapping could have moved, because a delta means nothing until
this is settled:

- **Accessibility** is read from the same table, against the same two printed phrases, as at
  iter-05, iter-06 and iter-07. Row 10 requires zero axe violations in both themes and every
  focus sweep printing *"the complete tab order"*. Both hold.
- **Payload** is read against the same 150 KB bound in `data/launch.json`. Row 9 (≤ 85%).
- **`overall`** is the same unweighted mean of the ten uncapped categories introduced at
  iter-04, with `visual_distinctiveness` scored, reported and excluded.

No rubric text, no ladder entry, no capped-category arithmetic changed. **Every part of the
+0.15 I record is artifact, not instrument.** And by the same token, so is the fact that
+0.15 sits *below* this loop's own noise floor of 0.2 (NF1). I am not going to round that
away. Three categories moved half a point each on named, measured changes; the aggregate
those three moves produce is nonetheless smaller than the loop's own declared measurement
noise. Both statements are true simultaneously, and the honest reading is: the round did
real, specific work on three properties, and it did not move the artifact as a whole by an
amount this instrument can distinguish from nothing.

Instrument disclosure required by the rubric's S15 clause: **ten-category mean 8.40**; the
retired **eleven-category mean would read 8.182**.

---

## 1. What I ran, and one thing that nearly went wrong

I ran every gate myself and read the logs rather than exit codes.

`node tools/ui-invariants.mjs` — **19 of 19 PASS**, with I38's new headroom lines printing on
S1, S15 and S18 exactly as prescribed.

`npm run build` — clean.

`node scripts/verify-design.mjs` — **45 checks, 0 failures**, zero axe violations across
light and dark on all four sampled routes (45 / 47 / 52 / 45 rules passed), and every focus
sweep printing *"the complete tab order"* at 83, 27, 422 and 98 stops.

**But it took three attempts, and the first two are a finding.** Twice — once sandboxed, once
with the sandbox explicitly disabled, which is L1's own stated remedy — the run died with
`serve-static exited with 1`. L1 tells me that message is EACCES, is not a broken oracle, and
must not be debugged. Had I obeyed L1 literally I would have written "gate green per L1" in
this verdict without ever having obtained a gate result. I did not, because the sandbox was
already off and L1's explanation had therefore already failed once. Reading
`scripts/verify-design.mjs` line 113 shows why the message is uninformative:

```
stdio: ['ignore', 'pipe', 'ignore']          // the child's stderr is DISCARDED
...
rej(new Error(`serve-static exited with ${code}`))   // every non-zero code, one string
```

The harness throws away the only thing that would distinguish EACCES from EADDRINUSE from a
missing `out/`, and L1 then instructs the reader not to go looking. That is L2's lesson
inverted: L2 warned that a PASS line can be true and worthless; this is a FAIL line that is
uninformative *and* pre-authorised for dismissal. Filed as **I43**.

## 2. I interrogated the checks rather than trusting the record

Seven checks are new or rewritten (S20, S21 new; S1, S5, S15, S17, S18 rewritten). I broke
all seven at runtime and watched each one fire with its own branch's message:

| check | break I injected | what it printed |
|---|---|---|
| S5 | `.rail-posts{width:100% !important}` | `.rail-posts width 1152.0px vs widest row's own grid content 500.0px (diff 652.0px)` |
| S20 | accent border reinstated on the featured `.door` | `at least one .door carries --accent as its resting border-top colour (rgb(74, 59, 212))` |
| S17 | `.listing-verified{color:rgb(26,27,34)}` | `/tools category "agents": ... 2/2 listings (100.0%) ... SAME computed colour as .listing-pricing` |
| S21 | `.catalog-preamble{margin-bottom:400px}` | `first record's top edge (830.9px) to bottom edge (1040.4px) ... bottom exceeds by 196.4px` |
| S18 | the I9 relocation reverted | `.home-side (576.7px) reaches only 46.9% of .rail-changes` |
| S15 | title track forced to 200px | `wraps across 6 lines — the title track has collapsed to 200.0px` |
| S1 | `.browse` track forced to 100px | `wraps across 4 lines — the label column has collapsed to 100.0px` |

Two of my first-attempt breaks did *not* fire, and both were my breaks being wrong rather
than the checks being dead — I tried to inflate the children of a **closed** `<details>`,
which renders nothing. I record that because "the check didn't fire" and "the break didn't
break anything" look identical in the output and the loop should not lose the distinction.

**The S5 result deserves its own sentence.** The break that fires there is precisely the one
that silently passed the implementer's first attempt — the vacuous outer-box comparison, a
reproduction of S1's own documented mistake by someone who had just read the post-mortem
describing it. The rewritten clause catches it. The right lesson is the uncomfortable one:
reading a post-mortem does not confer immunity to the mistake it describes. Only running the
break does. That the implementer found this by falsifying its own work and *reported* it
rather than quietly fixing it is the most valuable thing in this round's manifest.

**And the gate claim is wrong in one respect.** The manifest states the run carried "zero
`oneSidedBecause` escape hatches". S20 declares one. `oneSidedBecause` occurs three times in
`tools/ui-invariants.mjs` — S20's declaration at line 1373, plus two references inside the
audit machinery at 1510 and 1512 — against exactly two when iter-07's judge verified the
identical claim and correctly found zero declarations. So the hatch iter-06 built the audit
to make visible was used for the first time this round, on a check created this round, and
the round's own gate report says it was not. The stated reason is arguable — a flat
prohibition has no opposite excess — but S20's own falsifier then describes three breaks that
give it two independent firing directions, which is what the audit wanted. The exemption looks
unnecessary as well as unreported. Filed as **I42(b)**.

---

## 3. The five implemented items

**I35 — resolved.** `.rail-posts` box 144.0–644.0, all four rows 144.0–644.0, widest content
639.9. The 652px overhang is gone, using the same `fit-content` mechanism `.browse` already
had, so it imports no new vocabulary. Visible in `index-blog--light--1440.png`.

**I36 — resolved on both surfaces, by computed colour.** /tools: 35 of 35 `.listing-verified`
at `rgb(90,95,107)` against `.listing-pricing`'s now-explicit `rgb(26,27,34)` — the anchor
measured these byte-identical. /catalog: the Read cell's `<time>` at `rgb(90,95,107)` on all
50 rows I sampled. I then checked the *generalisation* rather than the two instances, by
measuring dominance and computed colour for all seven /catalog columns. The only other column
past R8's 90% threshold is Status at 99.5% "active", already muted at 11px. R8's clause holds
across the whole surface, not only where S17 looks.

**I31 — resolved.** All eight `.door` borders resolve to one `rgb(215,216,224)`, both
`.delta` to one `rgb(185,187,199)`. Rather than trust the two named selectors I enumerated
*every* element on the home page carrying a non-zero resting border of `rgb(74,59,212)` on
any side. Exactly one survives: `.change-annotation`'s 2px `border-left` on the single
annotated entry of 24. I judge that instance defensible — it marks a state the page names in
its own adjacent "WHAT IT MEANS" label, the exception R9's iter-08 addendum explicitly
permits — so the artifact is probably right and S20's *intent string* is wrong. Filed as
**I42(a)**, against the check rather than the artifact.

**I38 — resolved, and resolved in the way most likely to be quietly inverted, correctly.**
The bounds were not loosened. `MAX_WRAP_LINES` is still 3; the floor is still 60%. The gate
prints `/blog — NO HEADROOM` and `.rail-changes could grow 568.0px more`. The cliff is visible
before a build finds it, which is exactly what the item asked for and all it asked for.

**I23 — first clause resolved, second declined with cause, decline accepted.** First record at
390x844 now occupies 450.9–660.4, entirely inside the 844px viewport. I confirmed it in my
own viewport captures in both themes, because the evidence set cannot show it (§5).

Two caveats on the size of that gain, neither of which makes it not a gain:

1. **The collapse is script-conditional.** The exported HTML ships `<details open>`; an inline
   media-query script closes it below 33.999rem. A reader without script gets the pre-fix
   layout at 390. R14's own text permits this ("only where the uncollapsed default is itself
   the safe fallback", which it is), so it is a bounded caveat, not a defect.
2. **The document is 86,379px against the anchor's 86,653px** — a 274px, 0.3% saving. Record
   height is unchanged at 209.5px. A 390px reader still gets four records per screen over
   about 102 screens.

On the declined second clause I have something to add rather than an argument to re-run. The
anchor routed the entire height saving through removing the `::before attr(data-label)`
labels, which keeper-gate I27 blocks. **There is a second lever I27 does not touch.** Two of
each record's six field rows carry values constant across the whole collection — Read at
100.0% and Status at 99.5% — so roughly 70px of the 209.5px is spent on data that
discriminates nothing. Suppressing the Read row *at the 33.999rem breakpoint only* removes no
generated label, removes no field R12 requires, and leaves the value in `/catalog.json` and in
the 1440 table; on 396 records that is about 13,800px of document. It bears on I39 and should
be adjudicated there, but a breakpoint-scoped presentation choice is a much weaker claim on a
per-row-provenance spec than a wholesale removal would be.

---

## 4. Two new artifact defects, found by looking where nobody had looked

This is the part of the brief I took most seriously: a shrinking queue is also consistent with
a judge running out of things it can see. So I ran two searches this loop has never run.

### I40 — the round's own fix planted a fresh instance of the defect the round's headline fix removed

I swept all fourteen routes at 1440 for a rule wider than the block it divides. One genuine
instance came back, and it was created this round.

`.catalog-preamble[open] > summary` carries `border-bottom: 1px solid var(--rule)`. Its box
spans **144.0 → 1296.0 (1152px, the full shell)**. The widest rendered text inside the
disclosure it introduces reaches **882.9px** — a content width of 738.9px. The summary's own
label, "About this table", occupies **157.8 → 279.6**, or 121.8px.

So: a 122px label, above a 1152px hairline, above a 739px block, in the page's opening read,
immediately under the H1. **A 413.1px overhang.** It is visible in
`table-catalog--light--1440.png` and `table-catalog--dark--1440.png`, and the manifest states
every changed page was inspected visually at both viewports in both themes.

This is R10's exact defect, on the one template `S5` does not sample — the same structural
reason `/blog` carried a 652px overhang undetected for eight iterations. The remedy exists on
this very build twice over.

I record the strongest counter-argument because I do not think it survives: the 1152px rule
aligns with the table's own header rule further down, so it can be read as page rhythm rather
than an orphaned rule. That defence was equally available for `/blog` — where the rule aligned
with the shell — and the loop rejected it there.

The other candidates my sweep returned (`/data`'s section titles, `/catalog`'s `.filters`,
home's "Everything here") all resolve to grid-track artifacts where the rule genuinely does
match its block's rendered box. I report that because a sweep that finds one thing is more
credible when you know what it declined to find.

### I41 — /tools is column-aligned within a category and ragged across the page

iter-07 recorded I11 as producing `.listing-verified` at "left 1047.5 ... identical on every
entry" across all twelve categories. That is true *within* a category and false across the
page. Each `.listings` container declares its own track set, and the trailing columns are
`max-content` sized against that category's own longest wiki-entry label. Measured across all
twelve:

- `.listing-verified` left ∈ {1009.4, 1032.2, 1039.9, 1047.5, 1055.1, 1062.7, 1070.3} — **seven
  distinct positions, 60.9px of spread**
- `.listing-entry` left ∈ {1174.1 … 1235.1}

A reader scanning `/tools` for pricing or for a verification date re-acquires the column at
every category heading. The vertical band I11 created wobbles down the page — plainly visible
in `index-tools--light--1440.png` as the "verified 2026-08-28" run stepping left and right
between category blocks. `S19` is green because its clause is "the same x across every entry
*within* a category", which is narrower than R13's property.

This is a **correction to the anchor's measurement**, not a regression — nothing this round
made it worse — so under the anchoring rules it cannot pull `list_and_table_craft` down. But
it stops I36's genuine demotion gain from pushing that category up, and it is squarely
actionable.

---

## 5. The evidence rig hid something for four iterations, and I can now say what

The two `/catalog` 390x844 captures are fullPage PNGs **390 pixels wide and 86,379 pixels
tall**. At any size a judge can display them, that is roughly 43 source pixels per displayed
pixel: they resolve to a vertical grey smear carrying no legible content at all. So the two
captures covering the surface that holds this loop's largest open reader-facing defect are
the two captures in the set that cannot be read.

This is distinct from I13 (nothing scroll-linked is observable) and from L5 (a viewport-coupled
layout misrenders). Here the capture is faithful, correctly labelled, and carries zero
information — and the rig has no condition for that.

It has a measurable consequence in this loop's own record. I23 has been carried at impact 5 for
four iterations; iter-07's judge wrote that impact 5 is "almost certainly under-weighted
relative to what it does to a real reader"; and the reason nobody revised it is that no judge
has ever *looked* at the surface. I only formed a view because I rendered my own 390x844
captures. That is exactly the recall failure D3 describes, produced silently by the rig.
Filed as **I44**.

---

## 6. The arithmetic, where resolved items and new findings pull against each other

Three categories moved. Seven held. Each hold is a claim I checked, not a default.

**Moved up:**

- **`colour_discipline` 8.0 → 8.5.** Two of the loop's three named colour defects closed and
  verified by computed value on the shipped tree — the home page's two decorative accent
  hairlines gone, `/tools`' constant date demoted and its pricing promoted. Colour has returned
  to state and meaning on all three surfaces the anchor named. Held at 8.5 rather than 9.0
  because the loop has never audited `/wiki`, `/data`, `/learn` or `/tutorials` for the same
  property.
- **`family_coherence` 7.0 → 7.5.** The anchor stated its own hold-reason explicitly — I35 and
  the repeated-date treatment differing across three templates — and both are closed, the
  second by one shared mechanism (`data-default`, computed per collection, mirroring
  `isDefaultFetch`). Held at 7.5 by two coherence gaps I measured this round: I40 and I41.
- **`responsive_integrity` 8.0 → 8.5.** The first complete record now sits inside the first
  viewport on the flagship surface at the viewport where it was worst. Held at 8.5 by the
  unchanged 209.5px record and the 86,379px document, and by the script-conditionality above.

**Held, and why the two obvious raises did not happen:**

- **`first_read_hierarchy` 8.0.** This round changed two opening reads *in opposite
  directions on the same page*. At 390, `/catalog`'s first record entered the viewport — a
  real gain. At 1440, the same remedy inserted a summary line and a 1152px overhanging rule
  between the H1 and the content it introduces — a real cost, at the exact point of first
  read. Netting those two at +0.5 would be taste drift dressed as arithmetic; the residue is
  inside NF1.
- **`chrome_restraint` 9.0.** I36 lowered weight without adding a single mark, and I checked
  specifically for the relocation — `.listing`'s per-entry rule, `.browse-row`'s absence of
  one and `/catalog`'s row rules are all unchanged. But the same round added a disclosure
  control *and* a 1152px hairline to `/catalog`'s desktop view, where nothing was wrong.
  Chrome removed on two surfaces, chrome added on the flagship one.
- **`list_and_table_craft` 8.5.** Both >90%-dominant columns are now correctly demoted, which
  is a real gain; I41 says the surface iter-07 credited as column-aligned is aligned only
  within a category. The correction cannot push the category down, and it stops the gain from
  pushing it up.
- `information_density` 7.5 (86,379 against 86,653 is 0.3%; `/catalog` at 1440 spends one line
  it did not spend before). `typographic_system` 7.5 (scale, weights and `--measure-list`
  untouched; the new summary uses `.sort-note`'s existing mono register).
  `visual_distinctiveness` 6.0 (nothing touched identity; the cap and NF1 both say hold).
  `accessibility` 10.0 and `payload_discipline` 9.0 are lookups.

**Overall: 84.0 / 10 = 8.40**, against the anchor's 8.25. Delta **+0.15 — below NF1 = 0.2**.

**The taste categories average 8.125** against the 8.3 the 8.5 gate requires. Last round they
averaged 7.94. That is a genuine +0.19 of taste movement, and it still leaves the gate
unreachable this round by construction, since accessibility and payload are already at 10 and
9. I am reporting 8.40 because it is what the categories sum to, not because it is near 8.5;
had the categories summed to 8.5 I would have written 8.5 and said the gate was met on a
+0.15 aggregate delta, which would have been an embarrassing thing to have to defend.

---

## 7. Benchmarks — the mechanism, not the adjective

**Stripe.** Its comparison surfaces declare the column set once for the whole table, so a
reader's eye tracks a single vertical line from the top of the page to the bottom. The content
property that makes this transfer is present here — a long list of records compared on a small
fixed field set — and `/tools` does not do it: twelve independently-declared track sets put the
same field at seven different x positions down one page (I41).

**Linear.** Its density mechanism is a tight uniform row a reader scans several of per screen.
`/catalog`'s records are short and uniform in *content* — the transferring property holds — and
are simply rendered at six stacked labelled lines each, 209.5px, four per screen, 102 screens
(I23). Note the caution R8's own post-mortem attaches to this exemplar: Linear is the right
benchmark for `/catalog`'s **390px stacked form**, where the records are short and uniform, and
the *wrong* one for its 1440 seven-column table, where the per-row rule earns its place.

**Vercel.** A grid whose rhythm stays visible across every page of the property. `/blog` gained
that this round; `/catalog` lost a little of it in the same round, with a rule spanning 1152px
over 739px of content in the page's opening block (I40).

---

## 8. Convergence — the answer, on its own merits

**The loop has not converged.** Four actionable `ui-fixable` items remain, and I can name each
with a location and a measured quantity:

1. **I40** — `/catalog`'s `.catalog-preamble > summary` border-bottom spans 1152px over 738.9px
   of its own disclosed content; a 413.1px overhang, introduced this round, on the one template
   `S5` does not sample. R10. Impact 5.
2. **I23 (second clause)** — 209.5px records, 396 of them, an 86,379px document at 390x844; with
   a new lever (the Read row, 100.0% dominant, ~70px of each record together with Status) that
   keeper-gate I27 does not block. R12/R14/R8. Impact 5.
3. **I41** — `/tools`' shared trailing columns at seven distinct x across twelve categories,
   60.9px of spread. R13. Impact 4.
4. **I42** — S20 asserts over two selector lists while its intent string claims a page-wide
   prohibition, and a resting `--accent` border survives on the home page under it; plus the
   unreported `oneSidedBecause`. R9. Impact 4.

Three of those four did not exist in the anchor's queue. **That is the whole point.** The
anchor carried four `ui-fixable` items; three were resolved this round. Had I re-scored only
the anchor's list, I would be reporting one remaining item and a converging loop — and I would
have been wrong, because the two searches that produced I40 and I41 had simply never been run.
The queue was shrinking because nobody had looked in those two places, not because the artifact
was clean. D3 is live in this loop right now.

I want to be equally clear about what that does *not* mean. This is a genuinely well-made
reference site. Nineteen invariants hold, seven of which I broke myself and watched fire; 45
design checks pass with zero axe violations in both themes and a complete tab order on every
sampled route; the payload sits at 82% of its bound; three of this round's five items closed
cleanly and the fourth was declined with a reason I checked and accept. The defects that remain
are the defects of a site that is already good: a rule 413px too wide, a column that jogs 61px,
a check whose scope is narrower than its own description. Nobody is going to bounce off this
site because of them.

But the question asked was whether the loop has converged, and it has not — not on a count of
items, but because two new searches in a mature round both returned findings on the first try.
That is the signal that the search space is not exhausted. **Ladder: Well-designed reference
site.** Not best-in-class, and the reason is I23: a reference site whose flagship surface asks
a phone reader to travel 102 screens has not yet done the hardest thing this rubric asks for.

## 9. One note for whoever reads this next

Iteration 5's verdict invented a "licence" field on `/tools` that exists nowhere on that
surface. It travelled from verdict → implementer report → a source comment in
`app/globals.css`, where a later reader would have met it as documentation of the artifact.
This round caught and corrected it, in place, with a note recording what was wrong rather than
a silent deletion — which is the right disposition.

So: **every number in this verdict is one I measured myself on the shipped build**, and where I
am reporting someone else's figure I have said so. The measurements are in the JSON, with the
probe conditions stated, so that the next person to disagree with me can disagree with a
number rather than with a recollection.
