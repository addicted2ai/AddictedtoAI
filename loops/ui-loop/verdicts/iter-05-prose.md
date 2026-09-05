# Iteration 5 — judge's prose evaluation

**Anchor: `iter-04.json`, overall 7.70. This verdict: 8.00. Verdict entry: Competent — held.**

**The one-line summary, before any of the detail: the eight taste categories moved by exactly
0.000, and all 0.30 of the overall's rise is an accessibility instrument correction.** On the
anchor's own instrument this iteration reads **7.70** — identical to the anchor. That is not a
failure of the iteration; it is what happens when a large, genuine win and a real,
self-inflicted regression land in the same round.

---

## 1. Gates, run by me, read from the logs

| gate | result |
|---|---|
| `npm run build` | clean, static export, 103 kB shared first-load JS |
| `node scripts/verify-design.mjs` | **45 checks, 0 failures** |
| `node tools/ui-invariants.mjs` | **14 of 14 invariants hold** |

No `EACCES` was encountered; L1 did not apply this run. Evidence identity is clean and I
verified it rather than accepting it: all 40 captures carry `buildStamp
2026-09-01T02:45:26Z`, and the latest modification time in `app/` is `app/globals.css` at
`02:33:29Z`, before the capture. My own `npm run build` re-stamped `out/` to `02:58:16Z`
without touching the tree, so L6 is satisfied — the evidence is a true picture of the
presentation source I am judging. The two `/catalog` 1440 captures are labelled
`capture: "viewport"` with a stated reason; every `/catalog` claim below is measured from the
live DOM, not from those images.

---

## 2. Accessibility: 7 → 10, and every point of it is the instrument

The manifest told me to expect this and to split it. Here is the split, with both numbers as
S15 and D7 require.

**What the harness prints now.** Zero axe violations in both themes on all four sampled
routes (45, 47, 51 and 46 rules passed). Every focus sweep prints *the complete tab order*:
`/` 83 stops, `/wiki/concept/ai-winter` 27, `/catalog` **817**, `/tools` 98. Rubric section 9,
row 10, is satisfied by lookup. **10.**

**What the same tree reads under the anchor's mapping.** `/catalog` reported *150 of 817 —
STOPPED AT THE 150-STOP CAP*, a ratio of 0.18, which is row 7. **7.**

**The decomposition, because "instrument correction" is too coarse a phrase for a 3-point
move.** There were two independent instrument defects and they contribute unequally:

1. **Cap 150 → 2000.** With the cap raised but the denominator still the DOM count, every
   sweep completes and none satisfies `swept == total`: `/` sweeps 83 of 84 DOM-focusable, and
   `/tools` sweeps 98 of 134 (36 hidden behind a closed `<details>`). That is row 8. **+1.**
2. **Denominator DOM → tab order.** Row 10 becomes reachable. **+2.**

**Artifact contribution: 0.0.** Nothing this iteration touched a focus indicator, a label, a
role, or a contrast pair. I16, I5, I30 and I32 are all layout changes; none of them is visible
to axe or to a focus sweep. If the artifact's accessibility had regressed this iteration, this
mapping would still have printed 10, because the mapping does not measure what changed.

Both corrections are right, and the second one is the more important: it closes the case where
**a legitimate improvement silently moved the ceiling of the scale measuring it** — I24's
mobile-nav disclosure, an unambiguous win, had made a 10 unreachable on every route. That is
the same class of defect as the `chrome_restraint` global-category error and the `overall`
eleven-category mean. Three instrument defects in five iterations, all of the same shape: a
rule stated in prose and contradicted by the arithmetic that implements it.

---

## 3. I5 — the oldest item in the loop, closed properly, verified at both viewports

I was asked to verify this at 1440x900 **and** 390x844, and I did, in the DOM rather than from
a picture.

**1440x900, `/wiki/concept/ai-winter`:** `.entry-facts` sits at x 772–1296 (524px) in a real
two-column grid (`608px 524px`), top edge **228.9px**, bottom 680.8px. All eight `dt`/`dd`
pairs fall inside the 900px first viewport. Prose runs 144–752, y 228.9–2173.9 — **1945.1px of
it**, long enough that stacking alone would certainly have buried the answer, which is exactly
what the anchor measured (FACTS beginning past y=2100). `current/wiki-entry--light--1440.png`
shows term origin, the Lighthill report, ALPAC and the Symbolics revenue trend all readable
beside the opening paragraph.

**390x844:** `.entry-facts` top **288.2px**, bottom 827.1px, **8 of 8** `dt`/`dd` inside the
844px viewport, with prose beginning at 827.1px. The answer-first order below the two-column
breakpoint is achieved by paint order only (`order: 2` on `.entry-facts` against `3` on
`.prose`), DOM order unchanged. That is the right mechanism and it is presentation-only as
claimed.

**And I falsified the check rather than trusting its record.** `--break
".entry-facts{order:9}"` fires at 1440 (`FACTS top edge (2362.9px) falls below the first
viewport`); the same break scoped to `@media (max-width: 59.99rem)` fires at 390
(`3820.5px ... below 844px`). S14 is genuinely two-viewport, not a check that passes the second
viewport by never reaching it. This is the best invariant in the registry.

This is the loop's oldest item, open since iteration 0, and it is closed. It is also the only
place on the property where I16's freed track is genuinely **filled** rather than balanced —
which is precisely why it is the model the rest of the fix should have followed, and did not.

Judged against **Linear**: Linear's density comes from putting the values a reader wants
adjacent to the identity they belong to, in one screen, without chrome. The property of
Linear's content that makes that mechanism transfer is a short, uniform field set per record —
which is what a wiki entry's FACTS block is. It holds here. (It does *not* hold at `/catalog`'s
396 rows × 7 columns, which is the mistake R8's post-mortem records.)

---

## 4. I16 — the decline is sound; the remedy relocates the defect

I was asked to adjudicate this and to measure the result rather than accept the argument. I did
both, and they come apart.

### The decline is sound. I re-derived it.

On `/wiki` the `.browse-name` track runs 440.1–824.1; the widest label glyph
("Dartmouth Summer Research Project on Artificial Intelligence") ends at 799.1; `.browse-kind`
starts at 836.1 and the badge at 916.6 — **37px** from label to metadata. Widening `.browse`
toward the shell's inner edge at 1296 would open roughly **480px** between a label and its own
kind and status. That is verbatim what R7 forbids ("metadata sits immediately after its label
rather than at the container's far edge"), and it is the exact defect iteration 1 removed. My
iter-04 prescription argued the subgrid fix had dissolved the alignment objection; it had not —
subgrid stops the columns going *ragged*, it does nothing about the *distance*. **The
implementer is right, my prescription was wrong, and I accept the decline without
reservation.** This is the loop working: 1 round trip spent, 1 wrong remedy caught.

### The remedy satisfies the invariant and relocates the defect.

Measured at 1440x900, shell content box 144–1296 on every route:

| route | primary block | left | right | occupancy | that route's H1 |
|---|---|---|---|---|---|
| `/wiki` | `.browse` (85 rows) | 440.1 | 999.9 | **48.6%** | **144** |
| `/data` | `.section` ×4 | **617.4 / 420.8 / 471.2 / 580.5** | — | 17.8 / 51.9 / 43.2 / 24.2% | **144** |
| `/colophon` | `.prose`, `.listing-facts` | 416 | 1024 | 52.8% | **144** |
| `/blog/[slug]` | `.entry-head`, `.prose` | 416 | 1024 | 52.8% | **416** ✓ |
| `/wiki/[kind]/[slug]` | prose 144–752, **FACTS 772–1296** | — | — | full shell | **144** ✓ |
| `/learn` (untouched) | `.rung` | **144** | 1008 | **75%** | **144** ✓ |

Three observations follow, and they decide the item.

**(a) The dead space was not reduced. `/wiki`'s occupancy is 48.6% — the anchor's own number,
to one decimal.** Splitting 592px into two 296px gutters is not recovery; it is symmetry.

**(b) The remedy cost the property its shared left rail, and that is a worse defect than the
one it cured.** On `/wiki` the eyebrow, page title, lede, sort-note *and* the closing
delisted-note all sit at x=144, and the 85-row index — the page's entire reason to exist — is
the only block that does not. The eye jumps right for the list and back left for the note
beneath it. `current/index-wiki--light--1440.png` shows a floating island. On `/data` it is
worse still: four sibling `.section` blocks centre *independently*, each carrying its
R10-bound heading and rule with it, so four section headings on one screen start at four
different x values spanning **196.6px**, none matching the H1.
`current/data--light--1440.png` reads as a staircase, and a reader has no rail to run down.
On `/colophon`, `current/prose--light--1440.png` shows a title at 144 over a body at 416,
leaving a conspicuous empty 272px block directly beneath the title that reads as a mis-indent
rather than as a margin — the anchor's version (body at 144, wide right margin) was a normal
editorial page; this one looks broken.

**(c) A better remedy existed and two routes prove it.** `/blog/[slug]` centres its H1 and
`.entry-head` *with* the body — all three at 416–1024 — which is a conventional centred
article and is not a defect at all. `/wiki/[kind]/[slug]` filled the freed track. And
`/learn`'s untouched `.rung` sits **left-aligned at 144–1008 at 75% occupancy** and satisfies
R13's occupancy clause without ever leaving the rail.

This is JUDGE.md's "Relocation is not resolution", in geometry rather than in ink: a fix that
satisfies its invariant while moving the defect into a different channel. I mark I16
**partially-resolved** and file the residue as **I33**.

**And I must take my share.** My iter-04 invariant offered centring as an alternative *without
requiring the centred block to keep the page's own rail*, and the implementer satisfied it
exactly as written. The invariant was under-specified and the check built from it is faithful
to a bad specification. I33 states the corrected condition and proposes amending R13 itself.

### The rule is measuring the wrong property, and `/tools` is the proof

`/tools`' two `.browse` surfaces are now **126px** and **254.3px** wide inside a 1152px shell —
10.9% and 22.1% occupancy, uncentred, with 1026px and 897.7px pooled on the right. Under R13's
occupancy/centring disjunction they fail outright. **And they read fine**, because they keep
the rail at 144. Meanwhile `/data` passes the disjunction and reads badly. A clause that fails
the good case and passes the bad one is not measuring the property it thinks it is. R13 should
require that a template's primary content block starts on the same rail as that template's own
H1 and eyebrow, and that sibling blocks on one route share one left edge — with centring
permitted only when the heading matter centres with the block. That is the amendment I33
proposes.

Judged against **Vercel**: the mechanism is a grid whose rhythm stays visible across every page
of the property, so moving between templates costs the reader nothing. That is exactly what
this iteration gave up — five different content left edges across the property, four of them on
`/data` alone.

---

## 5. I30 and I32 — both real, both narrow, both created something

**I32, resolved.** `/tools`' category index: the `.browse-name` track is 94.3px against a
widest label ("observability") of 94.3px, and `.browse-kind` starts **12px** past the widest
glyph, against the anchor's ~289px of dead air inside a 384px reserved track. The A–Z browse
behaves identically (track 131.3px, widest "Hugging Face Hub" 131.3px, gap 12px), and `/data`'s
cap still binds unloosened — S1 is unchanged and green. `fit-content(var(--measure-list))` is
the right mechanism and R7's addendum (a) records it honestly.

**I30, resolved.** All four `.rail-title` boxes are 260–644 — exactly 384px = `--measure-list`
— against the anchor's 1019px, with item tracks `100px 384px`. The widest line of running type
on the property is gone and `/blog` now uses the same token as `/wiki` and `/learn`. `/blog`
also keeps its rail: eyebrow, H1, lede, sort-note and list all start at 144.

**What each one created.** I30's fix narrowed the list and left the rule above it at full shell
width: the rule at y=315.8 spans 144–1296 while the list's content ends at **639.9px** — a
512px overhang, which is R10's own defect, newly present on a route S5 does not sample. Filed
as **I35**. And all four titles now wrap to 3 lines each, a real density cost I have counted
against I5's gain. I32's fix produced the 126px/254.3px `.browse` surfaces discussed above.

Neither of these is a reason to withhold "resolved" — both items' invariants are satisfied and
both checks fire under injection. But together they are why `list_and_table_craft` does not
move: two narrow gains, two small new defects, and nothing at all on I8, I11 and I23, which
are what hold the category down.

---

## 6. Interrogating the checks — S13–S16 verified, and one real find

The manifest disclosed that S13–S16's falsifier records were produced under a flaky harness. I
re-ran all four myself. Every one fires under a violation of its own property:

| check | injected break | fired |
|---|---|---|
| S13 | `.section:has(> .browse){margin-left:0;margin-right:auto}` | ✅ `/data "Everything, as one file" block is not centred: left gap 0.0px vs right gap 946.9px` |
| S14 @1440 | `.entry-facts{order:9}` | ✅ `FACTS top edge (2362.9px) falls below the first viewport (900px)` |
| S14 @390 | same, scoped `@media (max-width: 59.99rem)` | ✅ `FACTS top edge (3820.5px) falls below the first viewport (844px)` |
| S15 | `.rail-posts .rail-item{grid-template-columns:100px 1036px}` | ✅ `title track is 1036.0px, exceeding --measure-list (384.0px)` |
| S16 | `.browse{grid-template-columns:minmax(0,var(--measure-list)) auto auto}` | ✅ `gap ... is 301.7px` |
| S9 | `main.shell > .browse{margin-left:0;margin-right:auto}` | ✅ `neither >=55% ... NOR centred (left gap 0.0px, right gap 592.2px, occupancy 48.6%)` |

The harness fix (awaiting `document.fonts.ready` plus two frames) holds. S9's widening closes
I28: the check that certified I16 as resolved at iteration 4 while its measurement stood still
now catches exactly that state, quoting the 48.6% figure the anchor opened with.

**Then I broke them the other way, and found something.**

```
node tools/ui-invariants.mjs --only S16 --break ".browse{grid-template-columns:40px auto auto !important}"   →  ok
node tools/ui-invariants.mjs --only S1  --break ".browse{grid-template-columns:40px auto auto !important}"   →  ok
```

That break is not benign. Injecting the identical CSS live on `/tools` at 1440x900: **42 of 47
labels wrap, the worst to 4 lines, and `.browse` collapses from 254.3px to 71.6px wide.** S16's
own stated property is "the label track sizes to that surface's OWN widest label" — a 40px
track does not size to a 131.3px label — and S16 calls it `ok`. Both checks measure only the
*gap* between the label and the trailing track, and that gap shrinks monotonically as the track
narrows, so no track can ever be too narrow for either of them.

This is **JUDGE.md L4 applied to a size bound rather than to a collision**, and it is the second
consecutive iteration in which an R7/R13 check turns out to bound only the direction the last
fix moved in. Filed as **I34**, with S15 flagged for the same audit (nothing bounds
`.rail-title`'s track below either).

**And the check gap that matters most: nothing catches the left-rail drift.** The gate is 14/14
green on a tree where `/data`'s four section headings ladder across 196.6px. That is not a
check failing; it is a property no check was ever asked about, because my own invariant did not
ask about it.

---

## 7. Category-by-category, with the arithmetic where things pull against each other

| category | anchor | now | why |
|---|---|---|---|
| first-read hierarchy | 8.0 | **8.0** | I5 up vs I16-centring down; see below |
| chrome restraint | 8.5 | **8.5** | no surface changed class |
| information density | 6.5 | **7.0** | I5 fills the wiki entry's dead 524px track |
| list and table craft | 8.0 | **8.0** | I30 + I32 vs I35 + `/tools` width; I8/I11/I23 untouched |
| typographic system | 7.5 | **7.5** | one token enforced, three left edges created |
| colour discipline | 8.0 | **8.0** | nothing changed; I31 predates the anchor |
| family coherence | 6.5 | **6.0** | the shared left rail is gone |
| responsive integrity | 8.0 | **8.0** | I5 helps at 390; I23 untouched; centring is a no-op at 390 |
| accessibility | 7.0 | **10.0** | instrument only |
| payload discipline | 9.0 | **9.0** | `/catalog` 123.1 KB = 82.1% of the 150 KB bound → row 9 |
| *visual distinctiveness (capped, excluded)* | 6.0 | **6.0** | the wiki entry is distinctive; `/data` reads as an accident |

**First-read hierarchy, held at 8.0 — the arithmetic.** Two large forces, opposite signs. Up:
I5 puts the dated, sourced answer inside the first viewport on the template that serves 495 of
the site's records, at both viewports, where it previously began at 2173.9px after 1945px of
prose. That is the biggest reader-facing gain this loop has produced. Down: on `/wiki` the
page's own purpose is the only block off the rail, and on `/data` four sibling headings start
at four different x values. One very large gain on one very large template against a clear loss
on two orientation pages. I hold at 8.0 and I am not comfortable calling it either way — which
is what a hold is for.

**Information density, 6.5 → 7.0.** Named cause, measured: the wiki entry's right track (524px
× full page height, empty on all 495 entries) now carries eight label/value pairs in the first
screen. Partly offset by `/blog`'s titles going to 3 lines each and `/data`'s centring
recovering no width at all (sections still 205.1 / 598.4 / 497.7 / 278.9 inside 1152). Held
well below 8 by I23 (86,653px at 390) and I9 (688px of empty rail).

**Family coherence, 6.5 → 6.0 — the only category a change since the baseline made worse, and
I name the change.** Before this iteration every template started its primary content on one
rail at x=144, the same rail the header wordmark uses; it was the one thing that unambiguously
held across all of them. The property now has five, and `/data` alone supplies four. Evidence:
`current/index-wiki--light--1440.png`, `current/data--light--1440.png`,
`current/prose--light--1440.png`, plus the measurement table in §4. Against NF1 = 0.2 this is a
named, measured, screenshot-visible cause, not taste drift.

**Payload, held at 9.** `/catalog` is the binding route at 123.1 KB gzipped of the 150 KB bound
(82.1%, row 9); `/` reads 109.9 KB and the wiki entry 109.6 KB. Row 10 needs 90 KB. Unchanged.

**The taste arithmetic, stated plainly.** Anchor taste mean (eight categories):
`(8.0+8.5+6.5+8.0+7.5+8.0+6.5+8.0)/8 = 61.0/8 = 7.625`. Now:
`(8.0+8.5+7.0+8.0+7.5+8.0+6.0+8.0)/8 = 61.0/8 = 7.625`. **Movement: 0.000.** The +0.5 on
information density and the −0.5 on family coherence cancel to the digit. Ten-category mean:
**8.00** (anchor 7.70, delta +0.30, all of it accessibility). Eleven-category mean including
the capped category: 7.818. **On the anchor's own accessibility mapping this verdict reads
7.70 — exactly the anchor.**

---

## 8. Benchmarks — the mechanisms, not the adjectives

**Stripe.** On Stripe's record tables the identity column and the numeric columns a reader
compares share one grid across every row, and a value constant for the whole collection is
stated once above the table rather than repeated per row. The property of Stripe's *content*
that makes this transfer is that a reader crosses a long list of records to compare a small
fixed field set — which is `/catalog` (396 × 7) and `/tools` (35 entries × 4 fields) exactly.
This artifact does the opposite in both places. `/catalog` repeats `2026-08-31` **396 times out
of 396**, as an underlined link at the same weight as MODEL, occupying 105.2px of a 1152px
table (I8). `/tools` sets the four comparison fields as an inline middot run whose glyphs end
at 1134.3, 1004.8, 1294.2, 799.1, 867.7 and 623.9 across six sampled entries — no field starts
or ends in the same place twice (I11).

**Vercel.** A grid whose rhythm stays visible across every page of the property. That is
precisely the mechanism this iteration surrendered: five content left edges, four of them on
one page (§4).

**Linear.** Values adjacent to the identity they belong to, in one screen, no chrome — valid
where the field set is short and uniform per record, which is the wiki entry's FACTS block. It
now holds there (§3). It does not transfer to `/catalog`, and R8's post-mortem records what
happened the last time it was cited there.

---

## 9. Verdict: Competent — held

The number rose and the ladder entry did not, and that is the correct reading rather than a
grudging one. The wiki entry is now a genuinely well-designed page — the best on the property —
and I5's closure is real work on the loop's oldest defect. But the ladder describes the
artifact, not the mean, and the artifact still fails its reader on three of its four primary
surfaces in ways I measured this run: `/catalog` at 390 is 396 records × 215.9px = an 86,653px
document, 102 screens, with the first record at y=724.5 (I23); `/tools` renders the fields a
reader came to compare as an unalignable middot run (I11); `/catalog` at 1440 spends a full
column on 396 identical underlined dates (I8). And this iteration added a coherence defect
visible on three templates. That is a Competent reference site, not a well-designed one.

---

## 10. Convergence: **the loop has NOT converged.**

Asked directly, answered directly. Seven `ui-fixable` items remain that an implementer can act
on today, each with a named location, a stated invariant and a governing rule: **I33** (restore
the left rail; amend R13), **I8** (396 identical READ dates), **I23** (the 390px catalog
record), **I11** (`/tools` shared tracks), **I35** (`/blog`'s overhanging rule), **I9** (the
home rail), **I31** (the decorative accent). Plus two evidence-fixes with concrete work —
**I34** (S1/S16 one-sided, demonstrated) and **I13**/**I26**. Nothing in this queue is blocked
on a keeper ruling or on content.

Two of these are new this iteration and both were *created* by this iteration's own changes
(I33, I35), which is the honest signal about where the loop is: it is still finding real
defects, and it is now also generating them at a comparable rate. The remaining four
`ui-fixable` items (I8, I9, I11, I23) have survived five iterations untouched because each
round has been spent on the item the previous round's check made visible.

D3's corollary binds here too: I am one judge, and "this judge has nothing further" would not
be proof the artifact is clean even if my queue were empty. It is not empty. **The 8.5 gate is
not reached and should not be chased** — reaching it now would require the eight taste
categories to average 8.30 against a measured 7.625, and the fastest way to get there would be
to stop looking hard, which is the one failure mode this loop cannot detect from inside itself.

**Delivery this round: I5, and the honest number.**
