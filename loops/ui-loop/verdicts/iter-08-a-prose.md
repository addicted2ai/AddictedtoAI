# Iteration 8 — Judge A

**Anchor: `iter-07.json`, overall 8.25, "Well-designed reference site".**
**Overall: 8.40. Ladder: Well-designed reference site. The loop has NOT converged.**

**No mapping changed this round.** The rubric, the accessibility table, the payload table,
the capped-category arithmetic and the ten-category basis are all identical to the ones
`iter-07` was scored under. Every category movement below is therefore artifact, not
instrument. I state this before the numbers because the last three rounds of this loop have
each carried an instrument correction, and a reader who has learned to discount the
aggregate should stop discounting it here.

---

## 1. Gates, run by me, read as logs

| gate | result | how |
|---|---|---|
| `node tools/ui-invariants.mjs` | **PASS, 19 of 19**, exit 0 | S1 S2 S5 S6 S7 S8 S9 S10 S11 S12 S13 S14 S15 S16 S17 S18 S19 S20 S21, all `ok` |
| `node scripts/verify-design.mjs out 4599` | **45 checks, 0 failures**, exit 0 | 8 axe passes (4 routes x 2 themes, zero violations); 4 focus sweeps, all "the complete tab order" |
| `npm run build` | clean, exit 0 | full static export |

`serve-static exited with 1` reproduced twice on the default port and cleared entirely by
moving to port 4599. L1, not a defect, not debugged.

**L6 checked, and the check very nearly went vacuous on me.** All 40 captures carry
`buildStamp 2026-09-01T06:19:57Z`; the manifest records `captured 06:24:42Z`. The obvious
staleness probe is `find app lib content data tools scripts -newermt '2026-09-01 06:19:57'`
— which returns nothing, because `find` reads that argument in local time while the stamp is
UTC, so on this machine it asks whether anything is newer than a moment six hours in the
future. It passes for every possible tree. Re-run as `-newermt '2026-09-01 00:19:57'` it
returns twenty files, all of them build-generated derivatives under `data/derived/`,
`public/` and `data/launch.json`, re-emitted by my own `npm run build`. No presentation
source is newer than the stamp. L6 genuinely satisfied — but a check that passes vacuously
and looks exactly like a check that passes is this loop's oldest recurring shape, and it is
worth recording that the evidence-freshness probe is one of them.

The two `/catalog` 1440 captures are labelled `capture: "viewport"` with a reason naming
`#catalog-table-wrap`'s 732.656px max-height. L5 honoured: I judged what is in frame and
routed everything below it to measurement.

---

## 2. The five implemented items

All five verified against the shipped build rather than accepted on report.

**I35 — resolved.** `.rail-posts` measures 500px (144.0–644.0); every `.rail-item` resolves
`grid-template-columns: 100px 384px` with a 16px gap, so 100 + 16 + 384 = 500 and the
`border-top` follows the rows exactly. The widest glyph in the list ends at 639.9. The
anchor's measured 652px overhang is gone, and R10 is now applied on every index template
rather than on all but one. I falsified the rewritten check myself:
`--only S5 --break '.rail-posts{width:100% !important}'` fires, 1 of 1.

The instrument bug the implementer self-reported is the more valuable half of this item. Its
first clause measured `.rail-item`'s own `getBoundingClientRect()`, which cannot fire —
a grid item is a block-level box that fills its parent, so reverting `.rail-posts` to 100%
drags every row's outer box along with it, 0 diff, while the actual defect is fully
reproduced. That is S1's own preserved post-mortem, on a new surface, written by someone who
had just read it. Reporting it rather than quietly fixing it is exactly the behaviour the
falsifier requirement exists to buy, and it is the single strongest piece of evidence in this
round that the process is working.

**I36 — resolved, and I nearly filed a false regression against it.** My first probe read
each Read cell's `<td>` computed colour and got `rgb(26,27,34)` — full ink, identical to the
numeric columns, which reads as the fix not having landed. It had. The `<td>` is a flex box
whose own colour is inherited ink; the glyphs are painted by a `<time>` child at
`rgb(90,95,107)`. **Measuring the box instead of the thing that paints is the same mistake as
S1's and S5's vacuous checks, and it is worth recording that it produces a false POSITIVE in
a judge where it produces a false NEGATIVE in a check.** Corrected reading: 396 of 396 Read
values at `rgb(90,95,107)`; 35 of 35 `.listing-verified` at `rgb(90,95,107)` against
`.listing-pricing`'s now-explicit `rgb(26,27,34)`. One honest limit: all 35 listings carry
`data-default="yes"`, so no live row exercises the exception branch on `/tools` — the
synthetic fixture is doing that work and says so in its own field.

**I31 — resolved.** All seven `.door` elements resolve `rgb(215,216,224)`; both
`.deltas-strip .delta` elements resolve `rgb(185,187,199)`. `data-feature="yes"` survives as
an attribute with no visual consequence, which is the right disposition. S20 is a real check
and fires under an injected accent border. The item is closed. The **rule** it landed is not
— see I41.

**I38 — resolved, including the half that was a temptation.** My gate run prints all three
headroom lines: `/data` 2 of 3 with 1 line spare, `/blog` **3 of 3 — NO HEADROOM**, and
`.home-side` at 87.7% with 568.0px of feed growth before the floor. `MAX_WRAP_LINES` is still
3 and the occupancy floor is still 60%. The instruction was print the margin and do not
loosen the bound; that is what shipped. A silent cliff became a visible one at zero cost to
strictness.

**I23 — first clause resolved, second clause correctly declined for the wrong reason.** The
first clause: at 390x844 the first record occupies 450.9–660.4, entirely inside the viewport,
against the anchor's y=724.5; the document fell 86,653 → 86,379px. The `<details>` defaults
closed below 33.999rem, its summary is a genuine tab stop, `/catalog` still sweeps its
complete 422-stop tab order, and axe is clean — so R14's activation floor was met rather than
traded away.

The second clause is where I disagree with the round's own account. The manifest declines the
≤120px record-height bound as blocked by keeper I27 — whether the `attr(data-label)` labels
are announced by assistive technology — on the reasoning that removing those labels is the
only remaining CSS-safe lever. I measured the record: **215.9px = 17.6 + 17.6px padding + a
31.2px name line + six 24.9px field lines, and the labels are already inline with their
values** (`#catalog-table tbody td { display: flex; justify-content: space-between }`).
Removing them would free nothing. R12 mandates name, in, out and status: 31.2 + 3 × 24.9 =
105.9px of content, plus the padding, is a 141.1px floor with every optional field deleted —
and the padding is not slack either, since S2's own comment records it as the deliberate
substitute for the per-row rule R8 forbids at this width. **The 120px bound is below the floor
of two rules this loop already wrote.** Right outcome, wrong cause, and a wrong cause left on
the record is precisely how a fabricated "licence" field travelled three documents deep this
round. Filed as I45: retire the clause with the arithmetic, and record that I27 no longer
gates anything.

---

## 3. Interrogating the checks

I did not take the 19/19 as a result. Two checks are new and five were rewritten, so I ran
eight `--break` falsifications of my own and read what each check *measured*, not its verdict
line.

| injection | check | fired? | what it establishes |
|---|---|---|---|
| `.door{border-top-color:var(--accent)}` | S20 | **yes** | S20 works inside its scope |
| `.change-annotation{border-left-color:var(--accent)}` | S20 | **no** | S20 is blind to a live violation of the rule it enforces |
| `.span-rule{background:var(--accent);opacity:1}` | S20 | **no** | blind to 58 more |
| Read `time{color:#1a1b22}` | S17 | **yes** | S17's /catalog clause is real |
| `.listing-verified{color:#1a1b22}` | S17 | **yes** | S17's /tools clause is real |
| `.rail-changes .src{color:#4a3bd4;font-weight:700}` | S17 | **no** | S17 does not sample the third surface R8 governs |
| `.rail-posts{width:100% !important}` | S5 | **yes** | the grid-track rewrite is not vacuous |
| `.entry-facts{max-height:60px}` | S18 | **no** | S18 does not sample the wiki entry template |

Every check that fired, fired with its own branch's message. Every check that did not fire,
did not fire because its route or selector list is narrower than the rule text in `RULES.md`
— and in **three of those four cases the artifact has a live instance sitting in the blind
zone**. This is the shape I36 itself named one round ago ("the check being narrower than the
rule it enforces"), reproduced in the same round that fixed it, on the rule that round wrote.
It is not carelessness; it is what happens when a check is written to close a specific item
rather than to enforce a general clause, and it will keep happening until a check's scope is
derived from the rule's own text.

---

## 4. What a tiring judge would have missed — and what was actually there

My predecessor cited D3 and was right to. The instruction this round was to go and find
something new rather than confirm the existing list, so I looked in three places nobody had:

**(a) Outside the evidence set's route list.** Two of the site's seven primary nav
destinations — `/tutorials` and `/impossible-routine` — have never been captured, in eight
iterations, at any viewport. They are in the header of all 40 images and in none of them.
`/impossible-routine` is a 9,137px page carrying 27 dated pairs, the site's second-largest
surface after `/catalog`, and it is where **54 of the 58** resting-accent hairlines behind I41
live. I found them only by going outside the set. Filed as I44.

**(b) At 768px.** The rubric's responsive category names 390, 768 and 1440. The evidence set
contains two of those. `tools/ui-invariants.mjs` runs at 1440x900 and 390x844 and at no
intermediate width, so five checks with breakpoints between 416 and 960 are never exercised
from either side of them. I closed the gap myself — 11 routes at 416, 544, 768 and 960, no
page-level horizontal scroll anywhere (the only elements exceeding the viewport are
`/catalog`'s table inside its own overflow container, correct per R2), and `/tools`' new
three-column `.listing` holds at 768 with pricing at 415.3–476.3px of a 721.9px row. **The
artifact passes at 768. The evidence rig has been silent about it for eight rounds.** That
distinction is the whole of I44.

**(c) In the rules the new checks were written for.** Three findings, all live, all under
green gates, all pre-existing:

**I40 — the wiki entry template holds a 1,493px dead column.** R13's iter-07(a) addendum
states the rule and S18 enforces it on one route. On `/wiki/concept/ai-winter`,
`.entry-facts` occupies 228.9–680.8 (451.9px) in a 524px-wide right track, while `.prose`
runs 228.9–2173.9 (1945.1px) beside it. **23.2% against S18's own 60% floor.** On
`/wiki/event/attention-is-all-you-need`, 17.0%. Sampling 24 entries across the index: 4
render the two-column form (the rest are model records with no prose, correctly single
column) and 3 of those 4 fall below the floor, median 52.5%. And `.rails` — REFERENCED HERE
and APPEARS IN, 156.9px tall — sits *below* the prose at x=144–752, inside the narrow column,
with the empty wide track directly above it. **This is I9's defect and I9's accepted remedy
on the same page**: the content that belongs in the freed track already exists on the
template and is stacked underneath the column that has no room for it. This is my highest-
impact item because the home page had one instance of this shape and the wiki entry template
has 495.

**I41 — R9's iter-08 addendum is violated on two templates in both themes, by the round that
wrote it.** The addendum says a resting border, rule or divider shall *never* carry
`--accent`. A full-DOM sweep for computed background and border colours equal to the resolved
accent, run over 11 routes in both themes, returns: `.change-annotation`'s `border-left: 2px`
at opacity 1, 161.1px tall, on the home page's first feed entry — the loudest colour mark in
the site's main content column, decorating an annotation whose presence is already a paragraph
of prose; `.span-rule`'s accent background at opacity 0.45, 4 on home and 54 on
`/impossible-routine`; and `.badge[data-kind="theme"]` on wiki entries, a 1px accent border
plus an accent tint plus accent text, three chips sitting on the same line as "ACTIVE" and
"STABLE", which are the same class of metadata rendered as unboxed muted text. Two treatments
for one object class, on one line, and the boxed three are the loudest thing on a page whose
point is its prose — which is also R8's badge clause, since nothing distinguishes the three
from each other.

**I42 — the home changed feed inverts the weight ordering R8 exists to protect.** 24 of 24
entries carry an `a.src` reading the identical string "source" at `--accent` with an
underline, while `.change-name` — the model name, the value a reader scans the feed for — sits
at ink with the same underline. Dark theme identical in structure. In
`home--light--1440.png` this is a coloured column of 24 identical words running down the right
of the feed, pulling the eye off the names on the left. **This is exactly the defect I8
removed from `/catalog`'s Read column one round ago, left standing on the page the site opens
with**, because S17's route list has two entries and R8's clause governs three surfaces.

**I43 — /blog sets its headlines narrower than its own explanatory paragraph.** Every
`.rail-item`'s second track resolves to 384.0px; all four titles wrap to exactly 3 lines
(S15's own new headroom line says so); the list is 500px inside a 1152px shell with 796px
empty to its right; and the lede directly above it is bounded to `--measure` (608px). The page
sets its secondary prose 224px wider than its primary objects. `--measure-list` was sized for a
row *label* — a model name, a wiki term, a category count — and a post headline is a sentence.
I30 bound `.rail-title` to this token at iteration 5 because it was 1019px, which was the
opposite excess and correctly fixed; the token it landed on is the wrong one for the object.

---

## 5. Benchmarks — the mechanism, not the adjective

**Stripe**, cited for I40. Stripe's long-form documentation holds a persistent right rail for
the *full scroll length* of the article. The transferring property of Stripe's content is
exactly this template's: a long body, a short block of structured facts, and a set of
cross-references. Stripe populates the rail with the cross-references so the second track is
occupied wherever the first one is; this template puts the cross-references *underneath* the
prose and lets the rail stop at 451.9px of 1945.1px. The move is not "add a sidebar" — the
sidebar exists — it is **which content is assigned to it**.

**Linear**, cited for I42, and cited carefully, because R8's own post-mortem records that
citing Linear at the wrong surface class is how this rubric went wrong once already. I am not
citing Linear's chromelessness. I am citing its weight ordering: in a Linear list row the
highest visual weight goes to the value that *differs between rows*, and secondary
affordances sit at the lowest weight the interaction allows. The transferring property of
Linear's content genuinely holds on the home feed — short, near-uniform, single-line rows with
one discriminating label each and a small fixed set of secondary affordances. This row does
the reverse of Linear's ordering: the constant is accent, the discriminator is ink.

**Vercel**, cited for I43. A headline gets a headline measure and a list label gets a list
measure, and they are different tokens because they are different objects. That is what keeps
a grid's rhythm visible across a property instead of collapsing every text object onto one
width. This site has `--measure` (38rem) and `--measure-list` (24rem) and no third token, so a
post headline had to be assigned to one of the two, and it was assigned to the one for labels.

---

## 6. The arithmetic, where resolved items and new findings pull against each other

Four pixel-visible improvements landed and I verified all four. Two of the five implemented
items (I38, and half of I23) change no pixel at all. **Zero regressions**: I looked
specifically for relocation — nothing was added to compensate for I36's colour demotion
(`/catalog`'s default-tone `.badge` still resolves `border-width: 0px`; `.listing`'s per-entry
rule is unchanged and R8-required), and I31's removal did not push the "featured" distinction
into weight, spacing or a border.

Three categories moved up, and each move is the anchor's own stated reason for its hold being
retired:

- **colour_discipline 8.0 → 8.5.** The anchor held it at 8.0 on two named grounds: "I8 removed
  396 underlines but moved the value to full ink rather than muted" and "I31's two
  full-strength accent border-tops are still live". Both are now closed and measured closed.
  Held at 8.5, not 9.0, by I41 and I42.
- **family_coherence 7.0 → 7.5.** The anchor held it at 7.0 on two named grounds: I35's
  overhang and the repeated-date treatment differing across three templates. Both closed. Held
  at 7.5, not 8.0, because I found a new gap of exactly the same class — R13's dead-track rule
  holds on `.home-grid` and is violated on the wiki entry template; R9's resting-accent
  addendum holds on `.door`/`.delta` and is violated on three other selectors. One rule applied
  on some members of the family and not others *is* this category's defect.
- **first_read_hierarchy 8.0 → 8.5.** The anchor held it at 8.0 saying "nothing this round
  altered any page's opening weight-and-space read". Something did: `/catalog` at 390 now opens
  on a whole record instead of four paragraphs of preamble. Held at 8.5 by I43.

Five taste categories held, and two of those holds are the more interesting number:

- **chrome_restraint 9.0.** I36 is a *weight demotion*, not a chrome removal, so its gain here
  is small; against it I can now name chrome the anchor did not count (three accent-bordered,
  accent-tinted chips on the wiki entry, and the 2px annotation bar). Gain and newly-named loss
  are the same size.
- **responsive_integrity 8.0.** I deliberately refused to credit I23's preamble collapse twice.
  It is one 274px change and it is scored once, in first_read_hierarchy, where the opening read
  is the property. The 390px catalog is still 396 records over 86,379px, and 768 is still
  unphotographed.
- **information_density 7.5** (274px saved of 86,379 is 0.3%, and I now measure 1,493px of
  dead column on a 495-instance template), **list_and_table_craft 8.5** (both of the anchor's
  named holds survive in substance), **typographic_system 7.5** (scale, weights and the
  metric-adjusted stack untouched; I38 changed what a check prints, not what it measures).

**Ten-category mean: 8.40. Delta against the anchor: +0.15.**

**That delta is inside NF1's 0.2 noise floor, and I am going to say what that means rather
than round past it.** Four named, measured, pixel-level improvements shipped this round with
zero regressions, and the aggregate cannot distinguish the result from a different judge on
the same artifact. Both halves of that are true and neither cancels the other. The category
moves are each anchored to a specific closed hold, so they are real; the *aggregate* is not
evidence on its own, and a reader should treat the per-category reasoning as the finding and
8.40 as a summary of it. The eleven-category mean, reported for continuity across the S15
instrument change, is 8.18.

**The taste eight average 8.125 against the 8.3 the 8.5 gate requires.** That is up from
7.94 and still 0.175 short, which on the ten-category mean is a 0.10 gap. I want to be explicit
that I noticed the gap is now small enough that a single half-point anywhere would close it,
and that I did not take any of the five available half-points I was tempted by:
responsive_integrity (double-counting I23), list_and_table_craft (I35 and I36 both touched
list surfaces), information_density (the same 274px again), chrome_restraint (I36 read
generously as removal rather than demotion), or visual_distinctiveness (capped, and excluded
from the aggregate anyway, so it could not have helped). The gap is information: this artifact
is 0.10 short of its gate and it has four actionable defects, three of which are live
violations of its own rules. Those two facts are consistent with each other, and closing them
by scoring would have destroyed the only instrument the loop has.

---

## 7. Convergence — answered on its own merits

**The loop has NOT converged, and the artifact is not delivered.**

Four actionable `ui-fixable` items remain. Each is implementable now from the shared design
system or one page template, each names an invariant a check can execute, and each cites a
rule already in `RULES.md`:

1. **I40** — the wiki entry template holds its second track open at 23.2% and 17.0% against
   R13's own 60% floor, on the site's most numerous template, with the content that belongs in
   that track already on the page and stacked below the column that has no room for it.
2. **I41** — three classes of resting `--accent` border/background survive R9's iter-08
   addendum on two templates in both themes, 58 instances of one of them, with S20 green over
   all of it and confirmed by my own falsification not to fire.
3. **I42** — the home changed feed renders one identical non-discriminating label on 24 of 24
   rows at higher visual weight than the record link beside it: the exact defect I8 removed
   from `/catalog` one round ago, on a surface S17 does not sample.
4. **I43** — `/blog` sets its four post titles 224px narrower than the descriptive paragraph
   directly above them.

Three of those four are live violations of rules this loop wrote for itself, sitting under
green gates. That is not a judge scraping the barrel; it is the recall failure D3 predicted,
caught in the act, one round after a shrinking queue made it look like the opposite.

Three further evidence-fixes remain (I13, I26, and the new I44), and I44 is the one that
matters most for the next round: a rig that has never photographed two of seven primary nav
destinations and has never sampled a viewport the rubric scores is not a rig a convergence
claim can rest on. Three keeper-gates stand (I14, I27, I39), and I27's standing is corrected
— it no longer gates anything, because the lever it was blocking would free zero pixels. I45
retires a bound my predecessor set that the loop's own rules make unreachable.

**Ladder: Well-designed reference site.** It is comfortably that. It is not best-in-class
while its most numerous template runs 1,493px of empty column beside its body text, its
opening page colours the one word that is identical on every row louder than the words that
differ, and its narrow-viewport flagship is 102 screens of stacked blocks. Those are three
mechanisms, not three adjectives, and all three are fixable.

---

## 8. One note on the instrument, offered because the round asked for it

The most useful thing I did this round was not scoring. It was running eight `--break`
injections and finding that **three of the four checks that did not fire were sitting over a
live violation**. The falsifier discipline this loop invented proves that a check *can* catch
its property being broken. It does not prove the check's scope matches the rule's text, and
this round produced two independent demonstrations that scope is now the binding constraint:
I36 found S17 narrower than R8, the same round wrote S20 narrower than R9, and I found S18
narrower than R13 and S17 still narrower than R8 on a third surface.

The generalisation worth adding to `state.md` is: **a check registered to close an ITEM
inherits the item's scope, not the rule's. Register checks against rule text, and derive the
route and selector list from the rule's own words.** Every one of my three new
`ui-fixable` findings is an instance of that single failure mode, which suggests one change to
the registry would prevent more future defects than the three fixes will.
