# Iteration 2 — RE-JUDGE on corrected evidence

Anchor: `iter-01.json`, overall **7.0**. Result: **7.1**, ladder entry **Competent**.
Nineteen items. The previous verdict on this same iteration (`iter-02.json`) also returned
7.1; where that is agreement rather than deference is set out in the last section.

---

## 0. Is the evidence sound this time? Verified, not taken on report.

I was told two rig defects were fixed and told not to believe it. I checked both.

**L6 / staleness — the set is current, but the instrument that is supposed to prove it is
half-built.** `evidence/current/manifest.json` records `captured 2026-08-31T23:07:32Z`.
Thirty-two of forty entries carry `buildStamp 2026-08-31T23:01:38Z`. `out/index.html`'s own
footer reads `built 2026-08-31T23:01:38Z`, and no file under `app/` or `lib/` has an mtime
later than that build — the newest are `app/globals.css` at 16:42:55 and `app/layout.tsx`
at 16:31:22 local, against a build at 17:01:38 local. The only file newer than the build is
`tools/ui-evidence.mjs`, which is the rig, not the artifact. **The captures I am scoring
were taken from the tree as it now stands.** I also confirmed the change scope
independently: comparing `current` against `iter-01` by sha, every one of the forty images
differs, but thirty-eight differ by roughly 300 bytes — the footer's build timestamp — and
only the four `/catalog` images differ materially. The manifest's claim that no other route
was touched is true.

The instrument itself is not sound, and I have filed it. `buildStamp` is harvested by
`document.body.innerText.match(/built\s+(\S+)/)`, which takes the first occurrence of the
word "built" anywhere in the rendered page. The home page's tagline is "built not to rot",
so all four home captures record `buildStamp: "not"`; the wiki entry records `"to"`. That
is 8 of 40 — 20% of the set — carrying page prose in the field that exists to prove
freshness. And nothing compares the stamp to anything: I21's invariant said a set whose
identifier differs from the current build "shall be refused as evidence", and no refusal
was implemented. The recording landed; the assertion did not. That is D2 and L2's exact
shape, in the very mechanism built to close L6. Re-filed as **I21 at impact 6**.

**L5 / misrendering — resolved, and I could see it was resolved.** Both `/catalog` @1440
entries now carry `capture: "viewport"` with the reason `viewport-coupled sticky scroll
container (#catalog-table-wrap, max-height 661.328px)`. The images fell from ~2.5 MB to
~152 KB and, crucially, they now agree with the DOM: the header row sits above tbody row 0,
the table fills the frame, there is no phantom footer. `/catalog` @390 is still `fullPage`,
correctly — the 390px block sets `max-height: none`, so the coupling does not exist at that
width. The detector is right about the case it was built for.

What it does not do is generalise, and the general form was the other half of what was
filed. The detector keys on one signature (sticky + actually scrolls + declares a
max-height); a `height: 100vh` block, a `dvh`-sized grid track or a viewport-bound container
query would misrender exactly as silently. The filed invariant's second clause — refuse any
fullPage capture whose painted content bottom falls short of the document height it reports
— does not exist in the file. Thirty-eight of forty captures are fullPage and none is
checked for fidelity. Filed as **I26 at impact 5**.

**Gates, re-run by me, log read rather than exit code.** `tools/ui-invariants.mjs`: 6
registered, 6 pass, and four of them now print `[viewports: 1440x900, 390x844]`.
`scripts/verify-design.mjs`: 45 checks, 0 failures; axe clean across 45/47/51/46 rules in
both themes; no horizontal scroll at 320px on four routes; worst payload 122.9 KB of 150.
Nothing hit the L1 EACCES path in this environment.

I also ran my own Playwright measurements, because the three things this iteration actually
turns on — the scrolled corridor, the mobile record pitch, the reserved footer gap — are
all invisible to a scroll-0 capture (L3). Every number below is from that run.

---

## 1. What the iteration did, measured

**`/catalog` @1440.** `#catalog-table-wrap` is 661.3px (top 416.3, bottom 1077.7), a genuine
sticky scrollport parked below the 45.8px site header. `thead` is 28.7px pinned at its top;
`tbody` row 0 begins immediately beneath it; zero overlap. At maximum page scroll — 355px,
down from the anchor's 547px — `thTop` is 61.3px against `headerBottom` 45.8px, and I took
a screenshot there rather than trusting the assertion: it shows twenty labelled rows under
a persistent column header. **This is the Stripe mechanism, actually delivered**: the
column contract stays on screen while the data moves under it, on a 396-row table where
that contract is seven numeric columns a reader cannot decode from the values alone. The
anchor's set showed the opposite — `thead` at 462.3-491.1 lying on rows 445.1-476.9 and
476.9-508.2. I15 is **resolved**.

**`/catalog` @390.** `thead` computes `display: none`. Each record is a stacked block: name
as a heading, then Provider / In / Out / Context / Status / Read as label-value lines, all
cells spanning x 14-376 in a 390px viewport, `scrollWidth 390 == clientWidth 390`. R12's
four required fields are all present and all reachable. I1, open since iteration 0, is
**resolved**.

**The third round, which landed after the manifest.** The harness now declares viewports
and refuses an invariant that declares none. S1/S2/S5/S6 run at 390x844 as well as
1440x900. The first thing that instrument did was catch a `border-bottom` between every
pair of stacked mobile records — R8's original desktop finding, relocated wholesale into
the layout built to fix I1 — which was then removed in favour of padding-only rhythm. I
confirmed the removal in a judge-run 390px capture at scroll 3000: no rules between
records. Two things follow. The standing note that "R7-R10 have never been verified at
390px" is closed. And the contract's relocation clause caught a live instance inside this
iteration, by instrument rather than by eye, which is the first time that has happened in
this loop.

---

## 2. What it cost, also measured

**Desktop density.** The capped scrollport is 661.3px of which 28.7px is thead, so 19.9
rows are visible. Before the cap, the same 900px viewport below a 45.8px header carried
about 26 rows of 31.83px. That is a 23% reduction in rows per screen, and roughly three of
the six lost rows are pure waste: at maximum scroll there is a **96px gap** between the
wrap's bottom edge (722.7) and the footer's top (818.7) that nothing occupies at any scroll
position.

**Mobile density.** Record pitch is 215.9px — a 31.2px heading, six 24.9px lines, 35.2px of
padding — so the document is 86,776px, 103 viewport-heights, 3.9 records per screen. The
anchor's table gave roughly 24 names per screen and no numbers. The comparison a reference
catalogue exists to support has become expensive in exactly the measure it was cheap in
before. And there is a second, separable fact: **the first record's top edge is at y=776 of
an 844px screen**, so screen one is 129px of sticky header plus a title, three lines of
prose, three meta lines and four filter controls, and carries no complete record at all.

Both are the relocation clause applied to geometry. Data hidden behind a horizontal
container scroll has been re-issued as vertical distance; a page-scroll geometry defect has
been re-issued as a shorter reading window.

**And one relocation into chrome, which I file rather than score.** At maximum scroll the
table is a 661px `--panel` box terminating 96px above the footer on `--paper` ground. It
reads as a card. Linear's mechanism — the benchmark this rubric names for chrome restraint
— is that the table *is* the page, not a box on it; the panel background pre-dates this
iteration, but the cap and the 96px terminus are what turn a content field into a widget. I
did not move `chrome_restraint` for it, because the change is one container on one route
against a category spanning eleven templates, and a -0.25 taste move sits under NF1. I
folded it into **I25** as its second symptom, where the remedy that removes the gap also
removes the card reading.

---

## 3. Scores

| category | iter-01 | iter-02 re-judge | moved by |
|---|---|---|---|
| First-read hierarchy | 7.5 | 7.5 | held — no named change |
| Chrome restraint | 7.5 | 7.5 | held — see §2 on the card reading, filed as I25 |
| Information density | 6.5 | **6.0** | -23% rows/screen @1440, 3.9 records/screen @390, 96px reserved |
| List and table craft | 5.5 | **7.0** | I15 + I1 closed; persistent column contract measured at max scroll |
| Typographic system | 7.0 | 7.0 | held — no named change |
| Colour discipline | 8.0 | 8.0 | held — no named change |
| Family coherence | 6.0 | 6.0 | held — no named change |
| Responsive integrity | 6.5 | **7.5** | 390px data reachable; four invariants now execute at 390x844 |
| Accessibility | 7.0 | 7.0 | lookup: 0 axe violations, lowest sweep 150/817 = 0.18 < 0.5 |
| Payload discipline | 9.0 | 9.0 | lookup: 122.9 KB of 150 = 81.9%, at or under 85% |
| Visual distinctiveness | 6.0 | 6.0 | held — capped contributor, not the reason for anything |
| **overall** | **7.0** | **7.1** | mean of eleven = 7.136 |

The two hard-measured rows are lookups and I performed them as lookups, reading exactly the
two values the mapping asks for and nothing else. Accessibility: zero axe violations in both
themes on all four sampled routes, lowest printed sweep ratio 150 of 817 on `/catalog` →
0.18 → row "7". Payload: worst route 122.9 KB gzipped against the 150 KB bound in
`data/launch.json` → 81.9% → row "9". Note for the record that **I filed an accessibility
finding without touching the accessibility score** (I27, below): the mapping contains no
judgement, and T1 exists because a previous version of it did.

### The arithmetic, where resolved items and costs pull against each other

+1.5 (list and table craft) and +1.0 (responsive integrity) against -0.5 (information
density), spread over eleven categories: **+2.0 / 11 = +0.18**, reported as +0.1. NF1's
measured floor on the overall is 0.2. **This iteration did not move the artifact by a
measurable amount, and saying otherwise would be reading the instrument past its
resolution.**

Four reasons that is the honest number rather than a harsh one, in order of weight:

1. **Only one of the two closures is forward progress.** I15 was created by this loop in
   iteration 1. The anchor's 7.0 was scored on a tree carrying it, so removing it restores
   ground the loop already held and had already been scored for. Counterfactually — what
   iteration 1 would have earned had it not shipped its own regression — list-and-table
   craft was worth about 6.3 rather than 5.5, and the trajectory reads **6.8 → ~7.1 → 7.1**:
   one round of genuine gain, one round of self-repair. The loop has spent one of its two
   post-baseline iterations paying off a debt it incurred itself.
2. **The one genuine gain paid for itself in another category.** I1 and I15 both bought
   their result by spending screen area (§2). Both trades are defensible; both are real.
3. **One route was worked.** Nine of the anchor's fifteen items were untouched, four of
   them deferred by scope and explicitly not declined (I16, I17, I18, I19). Six categories
   were held by construction, not by judgement — I re-verified I16 and I20 live on
   `current/data--light--1440.png` rather than carrying them on report, and both are still
   plainly true.
4. **The measured categories are unchanged lookups.** Neither can move without work nobody
   did this round.

**Ladder: Competent.** Not "Well-designed reference site". The flagship table is now
genuinely well-made at 1440 and the site clears every hard gate — but family coherence sits
at 6.0 with four content right-edges across the property, R9 reaches three of five index
templates, `/tools` is still 35 rows of prose-as-data under a rule apiece, the body face is
whatever the reader's machine happens to have, and the mobile form of the site's primary
surface is 103 screens long. A well-designed reference site does not have one excellent
template and four dialects.

---

## 4. Where I agreed with my predecessor, and where I departed

I read `iter-02.json` and `iter-02-prose.md` before measuring, and then measured
independently. My numbers reproduce its numbers to the decimal — record pitch 215.9px,
document 86,776px, header 129.3px on four routes, wrap 661.3px, gap 96px, thTop 61.3 vs
headerBottom 45.8. That is worth stating plainly: **its findings about the ARTIFACT were
correct even though its instrument was broken, because it stopped trusting the instrument
and went to the DOM.** The corrected evidence confirms rather than overturns it.

**Agreed, and carried:**

- **The rig items were right and it was right to file them.** I21 and I22 at impact 8 each,
  and a refusal to score confidently on evidence it distrusted, is the protocol working. I
  have confirmed I22 resolved and I21 only partially so.
- **The counterfactual trajectory.** Scoring the removal of a self-inflicted defect as
  repair rather than progress, and stating the 6.8 → ~7.1 → 7.1 reading, is the right call
  and I have kept it verbatim in substance.
- **The three category deltas and their magnitudes**, and the +0.1 landing under NF1. I
  arrived at these by re-derivation: two of eleven categories up on the one route worked,
  one down, capped category untouched. Landing on the same number is what a sound
  measurement of an unchanged artifact should do, and differing from it to demonstrate
  independence would be the failure mode, not the proof of one.
- **I23, I24, I16, I5, I17, I18, I19, I11, I12, I8, I9, I10, I13, I20, I14** — carried at
  the same impacts, with evidence re-checked where I could see it.

**Departed, with reasons:**

1. **I25's cause is wrong as filed, and I have restated it.** The previous verdict says
   `--footer-h` "over-reserves… because the token absorbs `<main>`'s trailing padding, the
   footer's own margin-top and a 16px safety buffer as well as the footer", and asks for
   "the footer term to be measured tightly". It is already measured tightly. The token must
   cover the whole distance from the wrap's bottom edge to the document's bottom, and that
   distance genuinely is 177px + buffer, because the padding and the margin genuinely exist
   between them — S7's falsifier break (6) records an earlier attempt to use the footer's
   own 81px and its failure at thTop -49.7px. Prescribing a tighter measurement would have
   sent an implementer to re-derive a number that is already right and to come back
   declining. The real defect is that this route spends its trailing whitespace twice: once
   as page padding below the table, and again as headroom subtracted from the scrollport
   above it. The remedy is to shrink the padding and the margin and let the derived token
   follow. Same item, same impact, correct cause.
2. **I21 is partially-resolved, not resolved.** The previous verdict could not know this —
   the fix landed after it. But the substance matters: had I taken "buildStamp is now
   recorded" on trust, I would have been protected on 32 captures and silently unprotected
   on 8, in the exact class of failure the field was added to prevent. Impact 6.
3. **I26 is new.** The predecessor's I22 invariant had two clauses; one shipped, one did
   not, and the one that did not is the general one. Filing the residual keeps the loop from
   recording a signature-specific patch as a closed class.
4. **I27 is new, and it partly disarms the concern it files.** The manifest disclosed the
   `content: attr(data-label)` question and invited a finding; the predecessor filed
   nothing, and `state.md` records that it "correctly REFUSED to file it into a
   hard-measured category". Refusing to *score* it was right. Refusing to *file* it left
   the loop carrying silence. So I measured it: at 390px the aria snapshot still reports
   `table / rowgroup / row / rowheader / cell`, and every cell's accessible name *includes*
   the generated label — `cell "Provider ~anthropic"`, `cell "In / Mtok $1.00"`. In
   Chromium the pattern works. What remains open is cross-AT variance, which no screenshot,
   no axe run and no Chromium snapshot answers — so it is a keeper-gate `reader` item at
   impact 4, not a defect, and it does not touch the accessibility score. The measurement
   is the point: the loop was carrying a worry that is smaller than it looked, and it now
   has the evidence to say so.
5. **I added the y=776 preamble measurement to I23** and a filter-availability mitigation
   to I14. The preamble is a separately actionable half of the mobile density problem — the
   record form is 216px, but the reader also spends the entire first screen before reaching
   one. The mitigation matters in the other direction: four working filters at 390px mean a
   reader who knows what to type never sees 103 screens, which lowers I14's urgency without
   closing it.
6. **I declined to move `chrome_restraint`** despite seeing the card reading, and said why
   in §2 rather than burying it. A sub-NF1 taste move on one container is noise; the finding
   belongs in an item, and it is in one.

**One thing neither of us can say from evidence, and I want it on the record.** The gate was
green and the surface was broken in iteration 1, and again in round 1 of iteration 2. It is
green now, and this time I have looked at a faithful rendering *and* scrolled the page
myself *and* re-derived the geometry, which is three oracles agreeing. That is the most
confidence this loop has been able to put behind a `/catalog` verdict. It is still not proof
that a fourth kind of defect is not sitting in the state none of the three examines — and
I13 exists because the evidence set still only ever looks at scroll zero.

---

**Files written:** `loops/ui-loop/verdicts/iter-02-rejudge.json` (parse-verified, 19 items,
impact-ordered, `invariant` and `governing_rule` present on every `ui-fixable` and
`evidence-fix` item) and this file. Throwaway probe scripts deleted.
