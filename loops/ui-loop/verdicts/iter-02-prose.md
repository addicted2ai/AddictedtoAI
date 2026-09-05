# Iteration 2 — judge's prose evaluation

Anchor: `verdicts/iter-01.json`, overall **7.0**. Scope worked: `/catalog` only, items I15 and I1.
Verdict: **Competent**. Overall **7.1** — a rise of 0.1, which is *below* NF1's 0.2 noise floor and
must not be reported as measurable progress.

---

## 0. The instrument failed before the artifact did, and it is the headline

I set out to score two closed items from the evidence set I was handed. I ended up filing the two
highest-impact findings of this round against the evidence rig instead, because the set cannot show
the surface the iteration worked. Both are reproducible and both are recorded as items I21 and I22.

**The evidence set is one build stale.** `evidence/current/manifest.json` records
`captured 2026-08-31T22:40:05Z`. Every image's own footer reads `built 2026-08-31T22:31:33Z`. The
tree in `out/` is `built 2026-08-31T22:47:15Z`. The captures therefore predate the last change to the
tree. This is not a cosmetic discrepancy: the 390px catalog document measures **81,157px** in the
evidence and **86,776px** on the tree, a difference of 5,619px, or 14.2px per record across 396
records — exactly the round-3 change in which a `border-bottom` between every stacked record was
replaced by padding. `current/table-catalog--light--390.png` shows a 1px rule between every pair of
records. That is R8's exact shape, on a brand-new surface, and it is the sort of thing a judge files
as a regression. **The tree does not have it.** I nearly filed a phantom.

The change manifest states the set "was recaptured after the final change, 40/40 identity-verified".
The identity check in `tools/ui-evidence.mjs` verifies the served path, a non-empty `<title>` and a
minimum `<main>` character count. None of those can detect a stale build. This is the same failure
shape the loop has now recorded three times in three iterations under three different names — a
check whose passing region is larger than the property it claims to enforce.

**The full-page capture mode misrenders `/catalog` at 1440.** On the tree,
`#catalog-table-wrap` is 661.3px tall (top 416.3, bottom 1077.7) and `.site-footer` runs
1173.7–1254.8 in a 1255px document. `current/table-catalog--light--1440.png` paints the wrap
**350px** tall — white panel from y=416 to y=766, ten rows of 396 — puts the footer at y≈855, and
leaves ~320px of blank ground below it, *while still reporting the settled 1255px document height*.
The image is inconsistent with itself: painted content stops 320px short of the height it declares.

I reproduced this deterministically. Viewport-sized screenshots taken at 0, 200, 500, 1000 and
3000ms after `networkidle` all render the wrap at its correct 661px. Only `fullPage: true`
collapses it. The cause is structural: `fullPage` resizes the viewport to the document height, the
wrap's `max-height: calc(100vh - var(--header-h) - var(--footer-h))` is viewport-dependent, and
`--footer-h` was measured once against a 900px viewport by `FOOTER_HEIGHT_SCRIPT`. Every route whose
layout depends on viewport units is exposed the same way; `/catalog` is simply the first to acquire
one, and it acquired it *this iteration, as the remedy for I15*.

The irony deserves to be stated plainly rather than buried, because it bears on how the loop routes
work. The change manifest's own account of round 2 is that the automated gate was green while the
surface was broken, and "the orchestrator caught it by looking at a rendered screenshot". The
rendered screenshot of this page is wrong. The oracle that caught the last failure cannot see the
fix.

Everything I say below about `/catalog` at 1440 and at 390 is measured on the tree, not read off the
capture set. Everything I say about the other nine routes is read off the capture set, which is
faithful for them: I pixel-diffed all 40 images against `iter-01` and the only non-catalog
difference on any route is the build timestamp in the footer — a 53×9px box at the page's
bottom right. Scope was respected exactly. `/colophon` showed a larger diff bounding box only
because the timestamp appears twice on that page, once in its FACTS block and once in the footer.

---

## 1. What actually changed, and what it is worth

### I15 — resolved, and it should not be counted as forward progress

At 1440x900 the thead now occupies 416.3–445.1px against tbody row 0 at 445.1–476.9px: zero overlap,
against the anchor's measured thead 462.3–491.1 lying across rows 445.1–476.9 and 476.9–508.2. At
390px the thead computes `display: none`, and S7's clause 3 asserts that absence on the element
rather than passing on a missing DOM node — the distinction R11 now requires and the right one.

More than the collision is fixed. The table has gained a property it has never had on this property:
with the container scrolled to row 50 and the page at its 355px maximum, the column labels sit at
`thTop 61.3px` against `headerBottom 45.8px` and stay legible. I rendered that state and it reads
well — a dense 20-row data surface under a persistent column contract. **This is the Stripe
mechanism**: Stripe treats a table as a first-class surface and keeps the column labels on screen
while the data moves under them, so a number three screens down is still a number the reader can
name. Until this round, `/catalog` scrolled its labels away after one screen and every subsequent
row was seven unlabelled numbers.

And it must still be scored as repair, not progress. I15 was created by this loop in iteration 1.
The anchor's 7.0 was measured on a tree whose flagship table had its column labels lying across its
own first two data rows in both themes at both viewports. Removing that returns the loop to a
position it already held before iteration 1 spent a round trip creating it. Scored
counterfactually — what iteration 1 would have earned without its own regression — list-and-table
craft was worth about 6.3 rather than the 5.5 the anchor recorded, and the honest trajectory reads
6.8 → ~7.1 → 7.1: one round of gain, one round of self-repair. I have not adjusted the anchor
number, because it was correctly scored on the tree it was given; I have said what it means.

### I1 — resolved on its invariant, and it bought the result with screen area

Open since iteration 0, closed now. At 390px every record carries name, provider, in, out, context,
status and read as label/value lines. Row 5's cells all span x 14–376 inside a 390px viewport;
`scrollWidth 390 == clientWidth 390`. I verified this independently of S8, because S8 is the loop's
own check and D1's lesson is that a green check is not a rebuttal to a reader.

The craft of the form is genuinely good. The model name is a heading with the R9 record-link
treatment; labels are muted mono on the left, values right-aligned in ink; separation is carried by
whitespace with no rule between records — R8's principle correctly applied to a surface R8 was never
written for. It reads cleanly in both themes.

The cost is 215.9px per record — a 31.2px name, six 24.9px label/value lines, 35.2px of padding —
so the catalog is now an **86,776px document, 103 viewport-heights, 3.9 models per screen**. The
anchor's complaint was that a mobile reader got 396 names and no numbers. The numbers have arrived
and the comparison has left with them: a reader hunting a cheap long-context model can read any one
model's price and can hold four models in view where they previously held twenty-four names. That is
the contract's relocation case expressed in geometry rather than in colour — information hidden
behind a horizontal container scroll, re-issued as vertical distance. It is filed as I23 with a
records-per-screen invariant, and I have said in that item what presentation can actually do about
it: two of the six lines don't earn their place. `Read` holds the identical string `2026-08-31` on
all 396 records (the anchor's own I8, now costing a line in every mobile record too), and In/Out is
a price pair a reader reads together. Three lines plus the name instead of seven, tighter leading,
and the document halves.

I still call I1 **resolved**. Its invariant is met and unreachable data is worse than distant data.
But the item that follows it is not a new defect that appeared by coincidence; it is the bill.

---

## 2. Category by category

**First-read hierarchy 7.5 → 7.5 (hold).** No named change. The capped table does make `/catalog`'s
shape legible in about 1.4 screens instead of 14.5, which is a real gain, but the mechanism is
density, not weight-and-space hierarchy, and it is confined to one route. Holding is the disciplined
call under NF1.

**Chrome restraint 7.5 → 7.5 (hold), with a note.** Two movements cancel. Against: the scrollport
turns the 396-row table into a bounded white panel on grey with a hard edge and an internal
scrollbar, so the site's flagship surface now has its structure carried partly by a box. That is
precisely the move **Linear** avoids — Linear's density comes from tight uniform rows with almost no
chrome, structure carried by type weight and spacing, and it does not put its lists in a card. The
panel background predates this round (it is S2's chosen alternative to an outer border), but capping
it at 661px with clear ground above and below makes it read far more like a card than it did when it
ran the page's full length. For: the 390px record form carries separation by padding alone, with no
rule between records, which is R8 applied well to a surface R8 never anticipated. Net zero. The one
list surface still ruling every row is `/tools` (I19), which was deferred by scope.

**Information density 6.5 → 6.0 (−0.5).** The only category I moved down, and it moved because of
this iteration's own changes, measured at both viewports. At 1440 the readable table region went
from the full 854px below the sticky header to a 661.3px scrollport of which 28.7px is the thead:
**~27 rows per screen to 20**, a 26% loss, with 96px of ground sitting empty between the
scrollport's bottom edge (722.7px) and the footer top (818.7px) at maximum page scroll — reserved
space nothing occupies, because `--footer-h` computes to 192.7px against an 81.1px footer (item
I25). At 390 it is 3.9 records per screen against ~24 names. Counted as raw data points a mobile
screen is roughly a wash (24 names, versus 3.9 records × 7 fields = 27 values), but density in this
rubric is what the reader can *use* per screen, and comparability across records is exactly what a
catalogue is for. The anchor's own density complaints — I16's unspent shell residue, `/wiki` leaving
55% of the shell empty — are untouched.

**List and table craft 5.5 → 7.0 (+1.5).** The largest move, and the best-evidenced. Two impact-9
items closed on the site's primary surface; the table gained persistent column labels under scroll;
the mobile form is well-crafted within its type scale. Held at 7.0 and no higher because I11
(`/tools` set as 35 run-on middot sentences where the data is plainly tabular), I17 (`.browse-row`'s
trailing tracks sizing per row, so nothing aligns across rows on `/wiki`) and I19 all remain, and
because the 390px form's 216px record is a craft problem of its own. Against **Stripe**: Stripe
would not have let the record form spend seven lines on six fields and one constant, and would not
present 396 records without a way to narrow them.

**Typographic system 7.0 → 7.0 (hold).** No type change. I10 stands: there is no `@font-face` and no
bundled face anywhere in `app/`, so the resolved body face — Charter, or Sitka Text, or Cambria, or
Georgia depending on the reader's machine — differs per platform, and with it the vertical rhythm
the whole system is built on. This is the gap to **Vercel**, and the mechanism is specific rather
than a matter of taste: Vercel ships one face, so the grid it draws is the grid every reader sees.
Here the serif/mono split is a genuinely good domain choice — serif for argument, mono for every
dated machine-read fact — applied with discipline and then left to chance at the last step.

**Colour discipline 8.0 → 8.0 (hold).** Nothing in scope touched colour. The mobile record form
inherits the correct treatment: muted labels, ink values, the ember chip reserved for
DEAD/RETIRED/DEPRECATED, `--accent` nowhere at rest. I18 (the home feed and `/learn` still outside
R9) was deferred by scope.

**Family coherence 6.0 → 6.0 (hold).** I considered moving this down and decided against it, and the
reasoning is worth recording because it could go the other way next round. `/catalog` now has a
layout mechanism no other template uses: a viewport-capped, sticky, internally scrolling panel,
where `/tools`, `/wiki`, `/data` and `/learn` all present their long lists as page-length scrolls.
At 390 it uses a stacked-record dialect that `/tools`' equally tabular listing does not. That is one
template in its own dialect, which the rubric says caps this category. Against that: `/catalog` is
the only `<table>` on the property and the only 396-row surface, the divergence is load-bearing
rather than decorative, and `/catalog` now supplies a template `/tools` should copy (I11) — the same
work that would close I19. Holding at 6.0 is the honest number for a round that touched none of the
four template-scoped items that actually govern this category.

**Responsive integrity 6.5 → 7.5 (+1.0).** The property's largest responsive defect, open since
iteration 0, is closed and independently verified. Separately, the instrument was repaired: S1, S2,
S5 and S6 now declare and actually run at 390x844 as well as 1440x900 — the harness prints
`[viewports: 1440x900, 390x844]` on each — which closes the open evidence-fix `state.md` still lists
as outstanding, and which paid for itself immediately by catching the per-record rule in the new
mobile layout during round 3. **`state.md`'s "OPEN EVIDENCE-FIX" paragraph is stale and should be
marked closed.** Held at 7.5 rather than 8 by the 129.3px sticky header at 390px (I24) and by the
103-viewport mobile document (I23).

**Accessibility 7.0 → 7.0 (hold).** Pure lookup, no judgement. Zero axe violations in both themes on
all four sampled routes (45/45/47/47/51/51/46/46 rules passed). Focus sweeps: `/` complete (83
stops), `/wiki/concept/ai-winter` complete (27), `/tools` complete (98), `/catalog`
**150 of 817 = 0.18**. Lowest ratio < 0.5 with zero violations → row 7. I12 remains the sole reason
this is not an 8, for the second consecutive iteration.

I am also recording the disclosure the change manifest volunteered, because the loop asked to carry
the finding rather than the silence: `content: attr(data-label)` for the mobile labels is not
reliably announced by every screen-reader/AT combination. axe-core does not flag the pattern, so R1
stays green. I am **not** filing it as an item, and the reason is a rubric constraint rather than a
disagreement: category 9 is hard-measured, its mapping reads two values out of the harness output
and nothing else, and admitting an unmeasured accessibility judgement into it is exactly the defect
T1 records — a mapping containing a determination stops being a mapping. The correct route is a new
measurement (a real AT check, or generated text alternatives asserted in the DOM), which is
orchestrator work, not a verdict item. It should be raised with the keeper.

**Payload discipline 9.0 → 9.0 (hold).** Pure lookup. Worst route `/catalog` at 122.9 KB gzipped
against the 150 KB bound = 81.9%, ≤ 85% → row 9. Note for the record: `/catalog`'s inline payload is
18.2 KB gzipped of 402.1 KB raw, and its HTML is 686.3 KB raw. Neither counts against R3 as written.

**Visual distinctiveness 6.0 → 6.0 (hold).** Capped contributor, no identity change this round. It
is not the reason for any number above, and no item filed has its only symptom here.

---

## 3. The arithmetic, where resolved items and new costs pull in different directions

Mean of eleven categories: (7.5 + 7.5 + 6.0 + 7.0 + 7.0 + 8.0 + 6.0 + 7.5 + 7.0 + 9.0 + 6.0) / 11
= 78.5 / 11 = **7.136 → 7.1**. The anchor's own eleven mean to 6.955 → 7.0, so the aggregation is
the same one.

Two impact-9 items closed and the overall moved **+0.1**, under the 0.2 floor. That is not an
instrument problem and it is not modesty. Three things account for it, in order of weight.

1. **Only one of the two closures is forward motion.** I15 was self-inflicted in iteration 1. On the
   counterfactual trajectory the loop's real position went 6.8 → ~7.1 → 7.1.
2. **The remaining gain paid for itself in another category.** +1.5 on list craft and +1.0 on
   responsive integrity are partly financed by −0.5 on density, because both fixes bought
   reachability with screen area: the mobile form is 6.5× longer than the table it replaced, the
   desktop scrollport is 23% shorter than the page region it replaced. Netted across eleven
   categories, +1.5 +1.0 −0.5 = +2.0, or +0.18 on the mean. That is the whole of the move, and it
   rounds to +0.2 before the mean is rounded to one decimal.
3. **Nine of the anchor's fifteen items were not worked**, four of them deferred by scope rather
   than declined. The seven categories they govern were held by construction.

A +0.1 that sits under the noise floor is not evidence of improvement. What *is* evidence is the
per-category detail: two named, measured category moves upward on the surface that was worked, one
named, measured move downward as its price, and eight categories correctly untouched.

---

## 4. Verdict — Competent

Unchanged from the anchor, and the ladder entry is right rather than merely safe. The site is a
capable reference tool with a real spine: one type scale, a disciplined serif/mono split, colour
reserved for state, a flagship table that now behaves like a data surface instead of a document. It
is not a **Well-designed reference site**, and the blockers are specific and enumerable:

- `/tools`, an obviously tabular 35-entry surface, is set as 35 run-on middot sentences and is the
  last list on the property drawing a rule under every row (I11, I19).
- `/wiki`'s rows misalign column-to-column because each row is its own grid (I17), and the template
  leaves 55% of the shell permanently empty (I16).
- The wiki entry — the site's answer surface — puts its FACTS block after every word of prose (I5).
- There is no chosen typeface; the rhythm the system depends on resolves differently per platform
  (I10).
- The mobile catalog is a 103-screen scroll and the mobile header eats 15.3% of every screen of it
  (I23, I24).
- And the loop cannot currently see the surface it just fixed (I21, I22).

That last one is why the two highest-impact items in this verdict are evidence-fixes rather than
artifact fixes. **This is the third consecutive iteration in which the loop's instruments, not its
implementers, produced the most serious finding** — D6's false premise, D8's adaptive check, and now
a stale capture set plus a capture mode that cannot render the route under test. The trust asymmetry
the protocol is built on holds (both anchor problems were real; both were fixed), but the failures
that cost this loop rounds are not coming from bad prescriptions. They are coming from oracles whose
passing region is wider than the property they claim to enforce, and every one of them was caught by
a human or a judge looking at the artifact rather than at a green line. Iteration 3 should fix the
rig before it fixes the templates, or it will be scoring the wrong tree again.
