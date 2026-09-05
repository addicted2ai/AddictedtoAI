# Iteration 4 — judge's prose verdict

**Overall 7.70** on the corrected ten-category mean, against an anchor of **7.25** on the
same basis. **+0.45**, above the 0.2 noise floor.

Both figures for the instrument change, as required: on the old eleven-category mean this
verdict reads **7.545** and the anchor reads **7.136**. The artifact did not improve by
0.11 when the aggregation was corrected, and I have not spent that 0.11 anywhere.

Ladder: **Competent**, held. I explain the hold below; it is not reluctance about the
work, which was good.

---

## 0. What I did before scoring, and one thing I broke

I read the manifest first, then JUDGE.md, RULES.md and state.md, then verified the
evidence's currency, then re-ran every gate myself, then measured.

- **Evidence currency, checked before anything else.** All 40 manifest entries carry
  `buildStamp: "2026-09-01T01:43:26Z"`, and `out/index.html` carried
  `data-build-stamp="2026-09-01T01:43:26Z"` when I read it. Identity and freshness both
  hold. L6 satisfied.
- **I then ran `npm run build` myself, which re-stamped the tree to
  `2026-09-01T01:51:39Z`.** The evidence set is now stamp-stale against the tree *by my
  own hand*, with no source change between the two builds. I record it rather than hide
  it: every finding below was verified against the stamp-matching state first, and the
  eight content-lint warnings the build prints (`currency-literal` on hard-coded versions
  and prices) are content, outside slot 1, and are warnings not errors. Whoever captures
  next should re-stamp.
- `node tools/ui-invariants.mjs` — **10 of 10**, every one declaring viewports. Read, not
  taken from an exit code.
- `node scripts/verify-design.mjs` — **45 checks, 0 failures.** Read line by line; two
  lines in it turned into findings.
- `npm run build` — clean, 620 pages.

I did not trust three of the manifest's claims and measured them instead. Two held
exactly; one did not.

---

## 1. The seven items, one at a time

**I17 — resolved, and it is the best work in the iteration.** `.browse-row` computes to
`grid-template-columns: subgrid`. Measured by me at 1440x900 on `/wiki`: `.browse-kind`
starts at x=540.0 and `.badge` at x=620.6 on every sampled row of 495. state.md records
the anchor tree's status column ragged across six positions; the current capture shows two
clean vertical rails. I did not take the check on report — I broke it:
`--only S9 --break ".browse-row{display:block !important}"` fires with *".browse-kind's
left edge varies by 146.0px across sampled rows"*. The check measures what it claims.
`loops/ui-loop/evidence/current/index-wiki--light--1440.png`.

**I24 — resolved, cleanly, and it is the second-best.** Header measured by me at 390x844
on `/`, `/wiki`, `/catalog`, `/tools` and `/learn`: **77.9px, 9.2%**, `details.open ===
false` on all five. The anchor's figure was 129.3px / 15.3% held permanently on every
route. 51.4px per screen returned to the page's own content on every route at the mobile
viewport. `current/home--light--390.png` shows the result.

**I25 — resolved, both halves, verified at the state a screenshot cannot reach.** At
1440x900 with `/catalog` scrolled to maximum: wrap bottom 794.7px, footer top 818.7px,
**gap 24.0px against a 32.3px row height** (anchor: 96px, three rows). `#catalog-table-wrap`
background `rgb(246,246,248)` is identical to the body's, so the panel reading is gone.
Neither fact is in any capture — L3 — so I measured it.

**I20 — resolved.** Section rules bind to their content block on every template I can see
it on: `/data`'s three rules end at 349, 741 and 750px, each matching the block beneath;
the wiki entry's REFERENCED HERE spans 145–435 and APPEARS IN 460–751; home's WHAT CHANGED
ends at x=850 against the feed while the rail headings end at x=1297. The manifest's
disclosure that `/colophon` was never broken is **true** — I checked `prose--light--1440.png`
— and reporting a false premise instead of quietly closing it is exactly the discipline
D6 was written for.

**I18 — resolved.** Ink+underline now on the home changed feed, Latest post, Latest
tutorial, `/learn` rung titles and the Impossible→Routine headlines. One side effect the
manifest did not claim, and it is a good one: on the home feed the underline is now the
only thing separating a record name that has a wiki entry from one that does not
("MoonshotAI: Kimi K2.5" underlined, "AllenAI: Olmo 3 32B Think" not), and it does that job
legibly at a glance.

**I10 — declined with cause, decline accepted, and I am saying plainly what it costs.**
The substitute landed and is real: `document.fonts` reports `Sitka Text Metric` loaded,
and S12 confirms the `size-adjust` arithmetic lands within 3px over a ~3730px sample
against Georgia. That genuinely serves the category's *controlled measure and consistent
vertical rhythm* clause, on the platforms most readers are actually on, and R16's own text
is honest that it narrows rather than closes.

**Can `typographic_system` honestly rise without a real face? A little, and not far.** It
rises to 7.5 and stops there. The category's other clause is "a face chosen for this
domain rather than inherited", and metric-matching is the opposite operation: it
normalises whatever face the reader's OS happens to hold *toward Georgia*, a general-purpose
1993 screen serif. Vercel's mechanism — the benchmark this category names — is a chosen
face; there is still no `@font-face` with a payload anywhere in `app/`. So 7.5 is this
category's ceiling while the decline stands, and moving it is a **keeper decision** about
R3 payload budget and offline-honesty, not implementer work. I have not filed it as an
item; re-filing a decline without new evidence wastes a round trip, and I have no new
evidence. I have recorded the ceiling instead so it is visible rather than silently
capping the category every round.

**I16 — NOT resolved, and this is the finding of the iteration.**

The manifest frames I16 and I17 as one job: *"I16 is the dead space left when a row's
label column was capped; I17 is the trailing columns going ragged; a shared track set
(subgrid on the row, `width: fit-content` on the list) addresses both at once."* It does
not. It addresses I17 and moves I16 in the wrong direction.

I measured it directly, by scanning each capture for the rightmost non-background pixel on
every scanline, excluding the header band and the footer, and counting scanlines carrying
ink past 55% of the 1440 viewport:

| capture | scanlines with ink past 55% |
|---|---|
| `baseline/index-wiki--light--1440.png` | **1874 / 3444** |
| `iter-01/index-wiki--light--1440.png` | **27 / 3383** |
| `current/index-wiki--light--1440.png` | **26 / 3383** |

**Iteration 4 changed this number by one scanline.** And on three further templates it is
flat zero: `/data` 0 of 1031, `/colophon` 0 of 1043, `/wiki/concept/ai-winter` 0 of 2794.
Four of ten sampled templates leave roughly half the viewport blank down their entire
height. `fit-content` made the list *narrower*, which is movement away from R13's second
clause, not toward it.

## 2. The interactions no single item's invariant catches

The brief asked for these. There are two, and both are structural rather than incidental.

### 2a. S9 bounds R13 on one side only (I28)

This is why I16 could be worked, gated green, and stand still.

```
--break ".browse{width:100% !important}"   → FAIL  (correct)
--break ".browse{width:240px !important}"  → ok    (0 of 1 fired as intended)
```

A `.browse` shrunk to **240px inside a 1216px shell** — leaving 1056px, nearly a whole
shell, unoccupied for 3563px — satisfies S9 completely. R13's own text names both edges:
*at most two declared tracks* **and** *shall not leave a track's worth of the shell
permanently unoccupied along its full height*. S9 enforces only the upper one.

**This is JUDGE.md L4 recurring in a new dimension.** L4 says: an invariant of the form "A
must not collide with B" shall bound the corridor, not the single edge. It was written
about sticky collisions. The same failure shape applies to *occupancy*, and the lesson was
not carried across when S9 was written three iterations later. It belongs in the same
family as D8 and the vacuous-pass cases: a third way a check's passing region ends up
larger than the property it claims to enforce. I recommend promoting L4 from a note about
one geometry to a standing requirement on every geometric invariant this loop registers —
both directions of displacement observed failing, or the check is not trusted.

### 2b. Accessibility 10 is now unreachable by construction (I29)

I24's disclosure is correct, R14 requires it, R4 is satisfied (keyboard reaches all 7 nav
links in 11 tab stops on every route), and the focus sweep reports it honestly. That is
the problem. The sweep now says, on `/`:

> *the complete tab order, 83 stop(s); 84 focusable element(s) in the DOM, 1 of them not
> currently tabbable (a closed `<details>` hides its links)*

and on `/tools`: *98 stop(s); 134 focusable element(s) ... 36 of them not currently
tabbable*.

The rubric's row 10 requires **`swept == total`**. With a closed `<details>` on every route
there is now a permanent, correct, by-design gap between the two. **Row 10 is unreachable,
so the accessibility ceiling is 8 even after I12 closes** — and JUDGE.md's own target
arithmetic ("8.5 ... only if accessibility reaches 10") is therefore no longer satisfiable
by any amount of implementer work. Two items landed in different rounds and their
interaction is invisible to both of their invariants.

A smaller half rides along: three of the four sweeps no longer print the bare
`<swept> of <total>` ratio the mapping instructs me to read — only `/catalog` does. The
rubric's own escape clause covers it, and it does not change this verdict (the derivable
83/84, 27/28 and 98/134 are all above 0.5; `/catalog`'s 0.183 governs regardless). It will
govern the next one.

## 3. Chrome restraint under the rewritten category

The category is right now and it was wrong before, and I want to say what that changed for
me: under the old text I would have scored the *removal* on `/catalog` and the home feed as
restraint. Under the new text I classify each surface and check whether its chrome matches
its class. Every surface I can see:

| surface | cross-row tracking? | why | rule present? | correct? |
|---|---|---|---|---|
| `/catalog` | **YES** | 396 rows × 7 columns; a reader crosses the row to compare IN/OUT/CONTEXT | yes | ✅ |
| home changed feed | **YES** | ragged heights — the WHAT IT MEANS block and wrapped `source` lines | yes | ✅ |
| `/tools` `.listing` | **YES** | ragged — the Deepgram fact line wraps where its neighbours do not | yes | ✅ |
| wiki entry FACTS | **YES** | wide label→value gap, multi-line values | yes | ✅ |
| `.browse` (`/wiki`, `/data`, `/tools` index) | **NO** | near-uniform single-line rows, nearly every row a link | no | ✅ |
| `/learn` rung ladder | **NO** | heights are ragged, but a bold underlined title reliably starts each entry, so grouping is never ambiguous from whitespace alone | no | ✅ |

**Every surface I can classify matches its class.** That is worth 8.5 and it is the
largest delta in the verdict.

Two consequences I have to state honestly:

1. **The delta overstates iteration 4.** The row-rule restoration was *iteration 3's*
   work, and the anchor's 7.5 was produced under a reading now declared a defect. The
   7.5 → 8.5 movement is an absolute reading on a new scale, not the artifact moving by
   1.0. I have disclosed this in the verdict's `instrument_disclosure`.
2. **I19 is withdrawn, not deferred.** The anchor filed it at impact 5, asking for
   `/tools`' per-entry rules to be removed. Under the revised R8 test that surface is
   ragged, so the rule is **required** and its removal would be the defect. The artifact
   is already correct. I have marked it closed in `acknowledged` so it stops resurfacing
   as actionable — which is precisely the failure mode R8's own post-mortem warns about.

Held below 9 by two things: `/catalog`'s READ column, which renders the identical string
`2026-08-31` on all 396 rows *underlined* — a full column of link chrome carrying zero
discriminating information, which is the same failure R8's badge clause already forbids
for status chips, applied to a link treatment instead (I8); and the decorative accent rule
on the home page (I31).

## 4. Where the arithmetic pulls against itself

**`information_density`, 6.0 → 6.5, and why not more.** Three measured recoveries: I25
returns 72px per catalog screen; I24 returns 51.4px per mobile screen on every route; I17
makes 495 rows scannable down two fixed rails rather than six ragged positions, which is
density of *usable* information rather than of pixels. Against that, the single largest
density defect on the property did not move at all — 26 of 3383 scanlines, one away from
its iteration-1 value. Three recoveries worth roughly 120px per screen against four
templates wasting ~600px of width for their full height is +0.5, not +1.0.

**`typographic_system`, 7.0 → 7.5, and why not more.** R16 landed cleanly and half the
category's own definition is untouched by it. Stated at length in §1.

**`colour_discipline` HELD at 8.0 despite a real defect found.** I found a full-strength
accent rule, `rgb(74,59,212)` light / `rgb(156,147,255)` dark, spanning 1153px above the
**first** Impossible→Routine pair's heading, while the structurally identical rule above
the second pair is neutral `rgb(185,187,199)` / `rgb(65,71,87)`. Same element, two
treatments, and the coloured one marks no state and no meaning. I was ready to move the
category down — and then measured the same pixel in `iter-01/home--light--1440.png`
(y=1642) and `baseline/home--light--1440.png` (y=1666) and found it in both. **It predates
the anchor.** No change since the anchor made it worse, so under the anchored re-scoring
contract it may not move the category down; it moves the item list instead (I31). It is a
finding the anchor missed, not a regression, and I will not let it masquerade as one — the
symmetric case of D7.

**`accessibility` and `payload_discipline` are lookups, not opinions.** Zero axe
violations both themes on four routes; lowest printed ratio 150/818 = 0.183 < 0.5 → **7**.
`/catalog` first-load 123.1 KB gzipped against the 150 KB bound = 82.1%, at or under 85%
→ **9**. Worth recording that I10's decline is what preserved the payload row: a
self-hosted subset face would have spent into the remaining 26.9 KB.

**The cap, honoured arithmetically for the first time.** `visual_distinctiveness` holds at
6.0, is reported, and is excluded from the overall. No item in this verdict has its only
symptom in that category, and none exceeds impact 4 on that basis.

## 5. Benchmarks — the mechanisms, not the adjectives

**Stripe — structured tabular presentation as a first-class surface.** The property this
makes transfer is that Stripe's tables are *comparison* surfaces: a reader crosses the row.
`/catalog` now has that mechanism at 1440 — fixed column starts, right-aligned numerics,
rules restored, the header corridor holding at maximum scroll. It does not have it at 390,
where the same 396 records become an 86,653px stack of 215.9px label/value blocks and a
reader comparing two models holds six lines in memory across a screen of scrolling (I23).
And `/tools` does not have it anywhere: 35 listings set four comparable fields as a
run-on middot line spanning 1150px, so `verified 2026-08-28` starts at x≈884 on one entry,
x≈790 on the next and x≈555 on the one after (I11). Stripe would make those four fields
four columns.

**Linear — density without clutter — cited with its scope, per the iteration-3 ruling.**
The property of Linear's *content* that makes its treatment transfer is short,
uniform-height, few-columned lists where the row is itself the link. That is exactly
`.browse` on `/wiki`, `/data` and the `/tools` category index, and those three surfaces now
have the mechanism honestly: no per-row rule, one shared track set, the link carrying the
row's signal. It is **not** `/catalog`, and this loop already paid for citing it there.
Where the artifact still falls short of Linear on its *own* class of surface is width
discipline: Linear's rows use the space they are given, and `/wiki`'s 495-row index now
occupies 560px of a 1216px shell.

**Vercel — a typeface chosen for the domain, and a grid whose rhythm stays visible across
every page.** Neither half holds. The face is inherited and metric-matched rather than
chosen (§1). The grid is *three* grids: a record-title link is bounded to a 384px track on
`/wiki`, ~608px on `/learn` and **1019px** on `/blog`, on a page whose own intro paragraph
is bounded at ~605px, so that template contradicts itself (I30).

## 6. Why the ladder holds at Competent

+0.45 is real movement, above the floor, and every point of it is attributable to a named
change I measured. It does not move the ladder, because the ladder is about whether the
site's primary surfaces are *all* well-made, and three of them are not:

- `/tools`, 4583px of run-on middot lines with no column structure;
- `/catalog` at 390, 86,653px for 396 records;
- four of ten templates leaving half the viewport unoccupied for their full height.

Two flagship surfaces — `/catalog` at 1440 and `/wiki` — are now genuinely good, and that
is what moved the number. "Well-designed reference site" needs the tail as well as the
head.

## 7. Has this loop converged?

**No. Plainly no.** There are seven `ui-fixable` items an implementer could act on
tomorrow without asking a question, and three of them are specific enough to be one-session
work:

- **I16** — restore a real second column on `/wiki` and `/data` now that subgrid holds the
  values in place (the alignment objection that motivated capping the width no longer
  applies), and centre or occupy the empty track on the prose templates.
- **I5** — put the wiki entry's FACTS block in the 576px track that is empty beside it,
  which closes I5 and part of I16 with one change.
- **I32** — size `.browse`'s label track to the surface's own max-content bounded by
  `--measure-list`, so `/tools`' thirteen one-word categories stop sitting 300px from their
  counts.

Two more are checks, not artifact work, and both route to the orchestrator: **I28** (S9 is
one-sided and certified a half-done fix) and **I29** (the accessibility ceiling is now 8 by
construction, which invalidates the target arithmetic in JUDGE.md).

And one standing caution from state.md D3, which applies with full force here: **"zero
items remain" would mean "this judge has nothing further", never "the artifact is clean".**
I filed 16 items and three of them are new defects that four previous judges over this same
property did not file — I31 has been visible in every capture since baseline. Confirm with
a second judge before anyone declares convergence.

## 8. What I could not judge, and said so instead of guessing

- The two `/catalog` 1440 captures are `capture: "viewport"`. I judged what is in frame —
  the header row above tbody row 0, the column alignment, the wrap background — and routed
  everything below it to measurement or to I13, never to inference from an image that does
  not contain it.
- Every scroll-linked property (I25's gap at maximum scroll, S7's corridor) is invisible to
  38 of 40 captures, which are scroll-0. I measured those with my own Playwright run
  rather than reading them out of a picture that structurally cannot contain them. That
  escalation worked, and it also means the screenshot oracle contributed nothing to judging
  the iteration's third-largest item — which is I13, still open.
- The `attr(data-label)` assistive-technology question at 390 (I27) remains unmeasurable by
  any evidence class this loop has. I did not score it into accessibility. That was T1's
  defect and it is not repeating here.
