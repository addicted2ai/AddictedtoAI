# ui-loop — iteration 0 verdict (prose)

**Date:** 2026-08-31 · **Overall: 7.0 · Verdict: Competent**

Iteration 0. No anchor, no baseline, no implemented items to acknowledge. All absolute
values below are provisional and exist mainly to be moved from.

---

## What I looked at

All 20 `--1440` captures (ten labels × two themes) and the `--390` captures for home,
table-catalog, index-wiki and article. The catalog capture is 13,427px tall and the wiki
index 3,624px, so both were cropped to legible scale before reading rather than judged
from a thumbnail. I read `app/globals.css` only where a finding turned on the token
system (I1, I2, I4), and `scripts/verify-design.mjs` output for everything
hard-measured. The evidence is the un-stamped theme state — `prefers-color-scheme` with
no `data-theme` attribute — which is what a viewer on the system default sees.

Hard oracle, run fresh: **45 checks, 0 failures.** axe-core clean in both themes on four
routes across 45–51 rules each; no horizontal scroll at 320px on any probed route, with
the catalog table correctly scrolling inside its own container; first-load JS 122.3 KB
gzipped against the 150 KB bound; keyboard traversal reaches *and activates* nav, search
and theme toggle on every probed route, with keyboard-only search returning results and
Enter navigating to the selected one.

---

## The one-sentence version

The system underneath this site is real — a genuine six-step type scale, a chosen serif,
a tokenised neutral with both themes fully specified, an accent with a documented
semantic, and an accessibility record most sites do not have. What is missing is a
**layout** system: there is a token for prose width and a token for the page shell and
nothing between them, so every row-based surface on the site defaults to full width and
the craft that the type system earns is spent across a thousand pixels of empty space.

---

## Per category

### 1. First-read hierarchy — 7

Every one of the ten templates opens the same way: a mono small-caps eyebrow, a serif H1,
a deck at controlled measure, a mono metadata line, then content. That is hierarchy from
weight and space with no boxes anywhere near it, and it is repeated with real discipline —
`WIKI` / *Every thing, typed and dated*, `DIRECTORY · STANDING TABLE` / *Every model you
can call today*, `OPEN DATA` / *Take the whole thing*. A reader lands and knows what the
page is inside a second. That is the exemplars' mechanism, correctly applied.

It loses three points below the header. On the row surfaces the first read of a *row* is
not cheap: on `index-tools--light--1440.png` the category "agents" and its count "2" are
1135px apart, so establishing the single most basic fact about a row costs a full-width
eye traverse. On `index-blog--light--1440.png` the four post titles run ~110 characters
per line, which is not a scan, it is a paragraph. And on `home--light--1440.png` the top
feed item carries a twelve-line indented explainer that outweighs the next eight dated
changes combined — filed as I13, a reader question rather than a defect.

### 2. Chrome restraint — 6

The weakest category, and the clearest gap against **Linear**. Linear's mechanism is that
a list needs no rules: uniform row height and a hard left edge do the separating, and a
divider appears only where a group actually changes. This site does the opposite — a
hairline under every row on every list surface: 24 on the home feed, 95 on the wiki index,
396 on the catalog, 12 on the tools jump list, 14 on `/data`. The catalog is additionally
wrapped in an outer box border, which makes a 396-row reference table read as a card.

Worse than the rules is the boxing of the default state. `index-wiki--light--1440.png`
shows a bordered `ACTIVE` pill on roughly 70 of 95 rows; `table-catalog--light--1440.png`
shows one on nearly all 396. The exceptional states — `DEPRECATED`, `RETIRED`, `DEAD` —
are the ones a reader of *this* site is hunting, and they are rendered in the same box, at
the same size, in the same position as the norm they are supposed to stand out from. The
ember colour is doing all the work and the box is doing none. The wiki entry header piles
five bordered pills in a row across two colour families.

### 3. Information density — 6

Bimodal, and the rubric asks specifically whether density is *consistent between
templates*. It is not. `/catalog` and `/tools` are genuinely dense and good — the catalog
puts seven columns of real data on 396 rows and `index-tools--light--1440.png` gets a
name, a licence, a pricing model, a verification date and a link onto one line per tool.
Against that: `index-blog--light--1440.png` delivers four rows on a 900px viewport and
leaves ~300px of dead page below the footer; the wiki index spends a 37px row on twenty
characters and 1,100px of white; the tools jump list spends twelve rows on twelve words
and twelve single digits; and `wiki-entry--light--1440.png` — the site's most numerous
template at 495 records — runs 2,400px of prose down a 610px left-hand column with 700px
empty beside it the whole way.

### 4. List and table craft — 6

The catalog table itself is the best-made object on the site and close to **Stripe**'s
standard: mono small-caps header row, correct column order, right-aligned tabular
numerics that let you compare `$0.06` against `$1.50` down the column, live filters with a
row count, and a machine-readable sibling linked directly above it. Structurally it is
right.

What pulls the category to 6 is everything around it. The name-to-metadata void (I1) is a
list-craft failure before it is anything else. The wiki index right-aligns its type labels
so `concept`, `org`, `model` and `technique` share a right edge and have no left edge at
all — there is no column, just a ragged margin. The home feed's rows are ragged in height
because the trailing `source` link wraps on some rows and not others (I9), so the rules
land at irregular intervals and the vertical rhythm a 24-row scan depends on is gone.

And at 390px the catalog shows the MODEL column and nothing else. The six data columns are
correctly inside their own scroller per R2 — but `table-catalog--light--390.png` shows no
fade, no shadow, no hint, no scrollbar track. Stripe's move on exactly this problem is to
pin the identifier column and mask the scrolling edge, so the reader can always see both
what a row *is* and that there is more of it. Here a reader on a phone gets a price table
with no prices and no indication that prices exist.

### 5. Typographic system — 8

The strongest category and the reason this site is not generic. `globals.css` defines a
real six-step scale (`--step--1` through `--step-4`), Charter for prose with a proper
fallback stack, a UI mono for every piece of metadata, and `--measure: 38rem` which lands
at ~62 characters on every prose surface — the colophon, the article and the wiki entry
body all measure correctly, which is rarer than it should be.

This is **Vercel**'s first mechanism satisfied: a face chosen for the domain rather than
inherited. Charter is a reference-work serif and it pairs correctly with the mono
metadata; the site reads as a periodical, which is the right register for a dated,
sourced catalogue.

It is Vercel's *second* mechanism — a grid whose rhythm stays visible across every page —
that fails, and that is what holds this at 8 rather than 9. The scale governs type but
nothing governs list measure, so the same H-level element is 605px wide on an article and
1,150px wide on the blog index. One scale, two measures, same element.

### 6. Colour discipline — 7

Good bones, over-applied. The neutral is chosen rather than defaulted — `#f6f6f8` paper
against `#1a1b22` ink, both carrying a deliberate blue cast. `--accent` indigo and
`--ember` red are two colours with two stated jobs, and the stylesheet says so in a
comment: *indigo means "follow this"*. Both themes are fully specified, including the
`prefers-color-scheme` branch and the `data-theme` overrides, all three states handled
correctly; the dark captures are a real dark theme, not an inversion, and axe finds zero
contrast violations in either.

The problem is density. On a reference site nearly every noun is a link, so applying the
accent to every link paints the page. `table-catalog--light--1440.png` has 396 indigo
model names beside 396 indigo dates — two fully coloured columns out of seven.
`index-blog--light--1440.png` is 100% indigo content. `index-learn--light--1440.png` is
speckled with indigo mid-sentence through every description. At that density indigo stops
meaning "follow this" and becomes the body colour, which is precisely the state the
stylesheet comment says it is avoiding — and it costs ember its alarm value, because a red
badge no longer stands out against an already-coloured field.

Then the system contradicts itself: one semantic, three treatments. A link to a record is
dark serif on the wiki index, indigo bold serif on the blog index, indigo mono on the
catalog. On `data--light--1440.png` one link is blue and underlined while eleven sibling
links in the same rows get no link treatment at all — the reader cannot tell what is
clickable.

### 7. Family coherence — 6

One header, one footer, one eyebrow/H1/deck opening on all ten templates, and the dark
theme is an exact structural parity of the light one on every template I checked. That
shared skeleton is real and it is why this is a 6 and not a 4.

Against it: the three link treatments above; two radii vocabularies inside a single
control row on the catalog, where a square-cornered text input sits 150px from an
unstyled native `<select>` with a larger radius and a platform chevron (I10); section
rules scoped to `--shell` while the content they divide is scoped to `--measure`, so on
the article, the colophon, `/data` and the wiki entry a 1,152px rule underlines a 605px
column and points at emptiness (I2); and three unaligned left edges on a single wiki entry
page — prose at 97, FACTS values at 205, cross-references at 497, none on a shared track.
A template that reads well alone while breaking the family caps this category, and the
wiki entry is that template.

### 8. Responsive integrity — 8

Hard-measured and good. Zero horizontal page scroll at 320px on all four probed routes;
wide content scrolls inside its own container as designed; R6's above-the-fold check
passes at both 1440×900 (12 of 24 feed lines visible, first line 105px down) and 390×844
(4 of 24, first line 188px down).

The 390 reflows are thoughtful rather than merely functional. `index-wiki--light--390.png`
moves the type label out from the right edge to directly under the name and left-aligns
it — which means the mobile treatment binds a name to its type *better than the desktop
one does*. That is worth saying plainly: the responsive layer solved a problem the desktop
layer still has.

Held at 8 by the catalog's uncued in-container scroll (I5) and by the header consuming
260px of an 844px viewport at 390 before the eyebrow appears — within R6, but a third of
the first screen.

### 9. Accessibility — 9 *(hard-measured)*

Scored from axe and traversal only, never from a screenshot. Zero axe violations in both
themes across four routes at 45–51 rules each. Keyboard traversal does more than reach
controls — it activates the theme toggle, runs a keyboard-only search, and presses Enter
to land on the selected result, which is R4's "reaching a control is not the same as being
able to use it" actually enforced. Focus indicators verified on every stop with complete
sweeps on three of four routes.

Not a 10, for two reasons that are the rig's fault rather than the artifact's, and are
filed as `evidence-fix`:

- **I7:** the `/catalog` focus sweep reports PASS having examined 150 of 817 focusable
  elements, with 667 explicitly "unswept". This is the exact failure mode R5's own
  preserved post-mortem was written about — a traversal that quits early passes for the
  wrong reason and keeps passing for as long as it exists. R5 requires focus visibility
  "on the whole page" and this run does not establish it for `/catalog`.
- **I8:** axe covers four of the ten templates the screenshot rig samples. The blog index,
  the article, the wiki index, `/learn`, `/colophon` and `/data` have never been tested in
  either theme, so the charter's "every sampled route" is not literally true.

The score reflects a genuinely strong result measured over 40% of the templates.

### 10. Payload discipline — 9 *(hard-measured)*

122.3 KB gzipped against the 150 KB bound — 18% headroom, on the heaviest route in the
site (a 396-row table with live client-side filtering). 104.5 KB of chunks plus 17.5 KB
inline. That is disciplined. Held off 10 only because `/catalog` is the sole measured
route, so the bound is verified at one point rather than across the property.

### 11. Visual distinctiveness — 7 *(capped contributor)*

Scored, and observing the cap: it is not a reason the overall is held down, and no item
above impact 4 rests on it. This site has a real identity — Charter over a blue-cast
neutral, mono small-caps eyebrows, a two-colour indigo/ember semantic, the
`impossible → routine` dated-pair module, a changed feed with inline `WHAT IT MEANS`
annotation. Nobody would mistake it for a framework starter, and the register — printed
reference work — is the correct one for the content. Held at 7 because the identity is
carried almost entirely by the type choice; the layout contributes little to it, and the
native `<select>` chrome on the catalog is the one visible inherited element.

---

## Benchmarks — the mechanisms, named

**Linear.** Linear's list surfaces carry almost no chrome: uniform row height and a hard
left edge do the separating, and a rule appears only at a genuine group boundary. This
site rules every row on every list surface and boxes the majority status value on top of
it — 396 `ACTIVE` pills on the catalog, ~70 on the wiki index — which spends the
exceptional-state treatment on the unexceptional case and leaves `DEPRECATED` no more
findable than `ACTIVE`. The specific move Linear makes and this does not: *let rhythm
separate, and reserve every visible mark for a difference that matters.*

**Stripe.** Stripe treats structured tabular data as a first-class surface and solves the
narrow viewport by pinning the identifier column and masking the scrolling edge, so a
reader always sees both what a row is and that the row continues. This site gets the
desktop table right — right-aligned tabular numerics, correct column order, mono header —
then at 390px shows the MODEL column alone with no visual cue that six data columns exist
one swipe away (`table-catalog--light--390.png`). The specific move: *a sticky identifier
plus a persistent edge mask, so an in-container scroll advertises itself in a static
render.*

**Vercel.** Two mechanisms. The first — a typeface chosen for the domain rather than a
general-purpose default — this site satisfies; Charter is a deliberate reference-work
choice, not an inherited system stack, and it is the single best decision in the artifact.
The second — a grid whose rhythm stays visible across every page of the property — it does
not. There is a token for prose width (`--measure: 38rem`) and a token for the shell
(`--shell: 76rem`) and nothing between, and `--measure` is applied at exactly five places
in 1,456 lines of CSS. Everything else defaults to the shell. So rows span 1,216px because
nothing constrained them, not because 1,216px was chosen for them, and the property has no
consistent grid rhythm below the header. The specific move: *a width token per surface
class, not per page.*

---

## Path to target for every category below 8.5

The target is 8.5 overall. Seven categories sit below it. Almost all of the gap traces to
two root causes, which is good news for the round trip: I1 and I2 between them move five
categories.

| Category | Now | Path |
|---|---|---|
| First-read hierarchy | 7 | I1 (bind row label to row metadata within 24rem) and I6 (blog titles under 75ch). Both make the *row* as fast to read as the page header already is. |
| Chrome restraint | 6 | I3. Remove the per-row hairline on `/wiki`, `/tools`, `/data`; remove the catalog's outer table border; render `ACTIVE` as plain muted small-caps and keep the boxed ember treatment for `DEPRECATED`/`RETIRED`/`DEAD` only. This is the single largest available gain in the verdict. |
| Information density | 6 | I1 and I6. Reclaiming the 700–1,135px of per-row void is what lets more reach the reader per screen; the blog index needs a second field per row drawn from data already rendered elsewhere (no new copy — charter slot 1). |
| List and table craft | 6 | I5 (sticky MODEL column plus persistent edge mask at 390), I9 (fixed column for the trailing `source` link so row heights stop varying), plus I1's column structure on the wiki index so the type labels gain a left edge. |
| Colour discipline | 7 | I4. Set list and table links in `--ink` with an underline for affordance; reserve `--accent` for prose inline links and one primary action per surface; apply that one treatment to `/wiki`, `/blog` and `/catalog` alike and to the eleven untreated `/data` paths. Must stay axe-clean in both themes (R1) and the focus ring must stay distinct from the new underline (R5). |
| Family coherence | 6 | I2 (rules span what they divide; one width per template; align the wiki entry's three left edges to one track), I4 (one link treatment), I10 (one radius across controls), I11 (drop the doubled rule under EVERYTHING HERE). |
| Responsive integrity | 8 | I5 alone. |

Accessibility (9) and payload (9) need no artifact change; I7 and I8 harden the evidence
so those numbers keep meaning what they say.

---

## Items

13 filed: **9 `ui-fixable`, 3 `evidence-fix`, 1 `keeper-gate`**. Ordered by impact in the
verdict block. Note for KP2 — the keeper trims this list — the four items above impact 6
(I1–I4) are where essentially all of the score movement lives; I11 and I12 are cheap and
may not be worth a round trip on their own.

A note on **I12**, because it is the kind of call the oracle table exists to force: the
Tools cell in the home page's EVERYTHING HERE block carries a 2px indigo underline no
sibling cell has, at identical coordinates in both themes. I could not determine from the
evidence whether that is a real style or a hover state captured with the pointer parked
over the cell — screenshots are declared blind to hover, so it is undecidable from what I
have. Filing it as an artifact defect would have sent an implementer after a style that
may not exist. It is filed instead against the capture procedure: move the pointer
off-canvas before each screenshot, and if the underline survives that, re-file it as a
coherence item.

And **I13** is `keeper-gate:reader`. Whether the home feed's top item should carry a
twelve-line explainer that outweighs the next eight changes turns on what a reader arrives
wanting — the single most consequential change explained, or the widest possible scan.
No screenshot answers that, and R6 exists precisely to stop this loop from relocating the
site's substance while every other check stays green.

---

## Verdict: Competent

Not *Well-designed reference site*, and the reason is specific rather than atmospheric.
The type system is well-designed, the theme system is well-designed, and the
accessibility and payload work is better than most production sites manage. But a
reference site is judged on its primary surfaces, and three of them are not right: the
wiki entry template — 495 pages, the most numerous thing on the site — sets its body in a
left-hand gutter under full-width rules; the blog index sets 110-character headlines; and
the catalog hides its prices on a phone with no cue that they exist. Those are not
finishing defects, they are the surfaces the site is *for*.

It clears *Functional* by a wide margin — this is a considered artifact with a real system
underneath it, and the distance from here to 8.5 is mostly the mechanical application of
one missing token plus the removal of chrome that is already there. That is a good
position to be in at iteration 0.
