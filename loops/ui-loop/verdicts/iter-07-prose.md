# iter-07 — judging iterations 6 and 7 together

**Anchor: `iter-05.json`, overall 8.00. This verdict: 8.25.**
Verdict on the ladder: **Well-designed reference site.**

---

## 0. The one thing that makes this number different

The previous two verdicts each carried an instrument correction. Iteration 4 changed the
aggregate from an eleven-category mean to a ten-category one, worth +0.114 on the same
scores. Iteration 5 corrected the accessibility mapping's denominator, worth +3.0 in that
category and +0.3 on the overall — the *entire* iter-04→iter-05 delta was instrument, and
that verdict said so in its own disclosure block.

**This round has no mapping change at all.** I read accessibility from the same table
against the same printed phrases, payload against the same 150 KB bound in
`data/launch.json`, and the overall as the same unweighted mean of the same ten uncapped
categories. Nothing in the rubric, nothing in the aggregation, nothing in the two
hard-measured mappings moved.

**Therefore every one of the +0.25 is artifact.** That is the first time in three verdicts
that sentence has been true, and it is why a +0.25 here is worth more than the +0.3 and the
+0.7 that preceded it. Recorded prominently because D7's standing consequence — record both
numbers whenever the instrument changes mid-trajectory, or the log stops measuring the
artifact — has a mirror image: say plainly when it *didn't*, or the log stops being able to
tell the two kinds of movement apart in retrospect.

For the record and for comparability, the old eleven-category mean on these same scores
reads **8.045**.

---

## 1. Gates, run by me, read from logs

- `npm run build` — clean. First-load JS shared by all: 103 kB.
- `node scripts/verify-design.mjs` — **45 checks, 0 failures.** Zero axe violations in light
  and dark on all four sampled routes (45 / 47 / 51 / 45 rules passed). Every focus sweep
  prints *"the complete tab order"*: 83, 27, 421 and 98 stops. Reflow clean at 320px on all
  four. `/catalog` first-load 122.7 KB gzipped of 150 = 81.8%.
- `node tools/ui-invariants.mjs` — **PASS, 17 of 17.**

I did not read a piped exit code anywhere; every number above is from the log text. L1's
`serve-static exited with 1` did not appear — this environment can bind a socket.

**L6 checked rather than accepted.** All 40 captures carry `buildStamp`
`2026-09-01T05:01:51Z`. `find app lib content data tools scripts -newermt '2026-09-01
05:01:51'` returns nothing, so no presentation source was touched after the capture. My own
build re-stamped `out/` to `05:10:23Z` without changing the tree — the identical situation
iter-05 recorded. The evidence is current.

**L5 checked.** Exactly two manifest entries carry `capture: "viewport"`, both the
`/catalog` 1440 pair, both with a stated reason. I judged those two on what is in frame and
routed nothing below their fold.

One side effect worth pinning down before anyone reads it as a regression: **`/catalog`'s
tab order fell from 817 stops to 421.** That is exactly the 396 Read-column links I8
removed. It is a real improvement — 396 redundant, identical tab stops gone from the
flagship table — and the accessibility mapping correctly cannot see it, because the mapping
asks whether every stop shows an indicator, not how many stops exist. The category holds at
10 for the right reason.

---

## 2. Interrogating the checks — I tested rather than read the records

The manifest claims 17 of 17 with two-sided falsifier evidence and zero `oneSidedBecause`
escape hatches. Three claims, checked three ways.

**The refusal is structural, not exhortative.** `auditRegistry()` refuses any entry lacking
`brokenByOpposite` *and* `observedOpposite` unless `oneSidedBecause` is declared, and it
refuses before any check runs. That is the same move as making the distinctiveness cap
arithmetic instead of prose, and it is the right one.

**Zero escape hatches, verified.** `oneSidedBecause` appears exactly twice in
`tools/ui-invariants.mjs` — both occurrences are inside the audit code itself. Zero
declarations. state.md's pre-registered failure mode ("`oneSidedBecause` will be abused")
did not materialise, and the state file records the miss rather than quietly dropping it.
A pre-registration only cited when it is right is decoration; this one is not.

**I falsified five of the seventeen myself, across eight injected breaks**, including all
three new checks and both rewritten ones. Every one fired, and — the part that actually
matters — each routed to the branch its own message predicts, none crossing into the other's.

| check | direction | what I did | result |
|---|---|---|---|
| S18 | opposite | `--break ".home-side{min-height:2400px}"` | fired: `.rail-changes 51.3% of .home-side` |
| S18 | **primary, my own break, not the recorded one** | `--break ".home-side > .section:last-child{display:none}"` | fired: `.home-side (576.7px) reaches only 46.9%` |
| S19 | primary | `--break ".listing{display:block}"` | fired: `.listing-verified varies by 91.4px` |
| S19 | opposite | `--break ".listings{...max-content 900px}"` | fired: `.listing-pricing 67.3px, below the 200px floor` |
| S1 | at-cap over bound | `--break ".browse-name{font-size:40px}"` | fired: *"wraps across 4 lines **even at the cap**"* |
| S1 | collapsed | `--break ".browse{...100px...}"` | fired: *"the label column **has collapsed** to 100.0px"* |
| S1 | **adversarial, mine** | track forced to **350px** — only 34px under the cap, wrapping only **2** lines | fired on the **collapsed** branch |
| S15 | **adversarial, mine** | track forced to 350px at **exactly 3 lines** — inside the line allowance | fired on the **collapsed** branch |
| S17 | opposite | source edit: `isDefaultFetch = true` unconditionally | fired: *"the ONE row with a genuinely different date lost its link"* |
| S17 | primary | source edit: condition reverted to `row.source_url` | fired: *"9 of 9 majority-date rows still render as a link"* |

`lib/render/catalog.mjs` restored byte-identical afterwards (`diff` clean), and the full
gate re-run at 17/17.

The last two S1/S15 rows are the ones I went looking for. **The danger ITEM 0 introduces is
that a line-count tolerance could mask a genuinely collapsed column** — precisely S1's own
historical 40px/9-line break passing a lenient cap. It does not: the width floor is
independent and it bites at a **34px** undershoot even when the line count is inside the
allowance. The two clauses are genuinely orthogonal. That is the property the R7 addendum
claims, and it holds under adversarial test rather than merely under the test its author
chose.

S17 deserves a specific note. Its clause 2 calls `renderCatalogTable` directly with a
synthetic 10-row fixture (9 sharing a date, 1 differing) because **the real data cannot
exercise the badge clause's other half** — every row shares one source today. The check
says so in its own `independent` field rather than letting the reader assume the branch is
covered. That is the honest form of a check whose property outruns its data, and it is a
better answer than either pretending or leaving the branch untested.

**Verdict on the instrument: I now trust it more than I trusted it at iter-05, and I did
not take that on report.** Iteration 6 bought no visible quality and it is still the highest
-leverage round the loop has run: a third of the instrument was half-blind, three of the
five were invisible to inspection, and the count is the deliverable.

---

## 3. ITEM 0 — is the 3-line allowance a resolution or a fitted tolerance?

**Both, and the two halves need separating.**

**The structural half is a genuine resolution.** The tension was real: R7 forbids a track
wider than `--measure-list`, iter-06's new wrap clause forbade any wrap at all, and two
surfaces sat exactly at 384.0px with content longer than one line holds there. Widening the
cap would re-cap every short label on the same shared `fit-content` track, reopening I32's
dead-air drift; content is read-only. Both exits were closed. Splitting the rule into two
independent clauses on the same property — *stop at the cap* and *hold it wrapped rather
than stretched* — is the correct resolution of a genuine conflict, and I verified above
that the width floor is not weakened by the line allowance. It is also the round's second
masked defect found en route: S1 lacked the narrow-viewport gate S15/S16 already had, so
`/data` was silently wrapping at 390px, and the harness's stop-at-first-failing-viewport
behaviour meant nothing would ever have reported it. Good work.

**The numeric half is a tolerance fitted to current content, and it has zero headroom.**
Measured by me on the shipped build: all four `/blog` titles wrap to **exactly 3 lines** on
a track measuring **exactly 384.0px**. Three of three.

So: what happens when a longer title is added? The check fires — correctly, and I confirmed
it fires at 4 lines at the cap. But **neither lever the loop possesses is permitted.**
Widening `--measure-list` was rejected with cause in R7's own addendum. Shortening the title
is a content edit, which slot 1 forbids absolutely. The gate goes red on the next long post
title with no move available, and the red will read like a presentation regression when it
is nothing of the kind.

`/data` has one line of headroom (2 of 3). `/blog` has none.

The same shape recurs in S18, which is why I filed them as one item. `.home-side` 1079.3px
against `.rail-changes` 1230.8px is 87.7% against a 60% floor. The feed is 24 entries: 23 at
43.4px and one annotated at 209.3px. S18 fires when the feed passes 1798.8px — **3.4 more
annotated entries in the top 24**, on a feed `data/changes.jsonl` regenerates daily. And the
rail's content is now fully committed: relocating a second section is not a repeatable move.

I am **not** asking for either bound to be loosened. A bound relaxed ahead of the case that
would test it is exactly the miscalibration iter-06 retired the occupancy clause for. I am
asking for the margin to be *printed*. D2's lesson — read what a check MEASURED, not its
verdict line — applies to a margin as much as to a coverage ratio, and `PASS` with no
headroom left looks identical to `PASS` with plenty. Filed as **I38**, `evidence-fix`, with
I34 as the precedent for tagging an invariant-harness concern that way.

---

## 4. Adjudicating the I9 decline

**The decline is correct. The remedy is correct. Both are correct on stronger grounds than
were argued, and one part of the stated argument does not survive contact.**

### Is the DOM-order argument sound?

*As stated, imprecisely.* The comment in `app/page.tsx` says the float mechanism "would
require moving `.home-side` before `.home-lead`… which would place a secondary nav widget
ahead of the page's own H1." Strictly, a float must precede the content that **wraps around
it**, not the H1. `<h1>What changed</h1>` is at the top of the same `<section>` as the feed,
so there exists a DOM slot — after the H1, before the feed `<div>` — where the float would
work without preceding the H1.

That slot is not usable, and the reason is the same reason, one step further in: it puts an
`<aside aria-label="Today's shape">` **between an H1 and the content that H1 labels**, inside
`<section aria-labelledby="changed">`. Every non-CSS consumer — a screen reader, a reader
mode, a feed extractor — gets the secondary widget announced inside "What changed", before
any changed line. The stated design ("No hero. The first thing under the header is the first
dated line of the changed feed") is broken exactly as the comment claims; it is just broken
in a different DOM position than the comment names. **The conclusion survives the
correction.**

### The decisive objection the implementer did not make

`.rail-item { display: grid }`. Each feed row is its own grid container in normal flow.
Beside a float, each would independently shrink to avoid it and then widen once past its
bottom edge — which means the feed's rows would resolve **different trailing track widths
above and below the float**, with a visible width discontinuity mid-list on the site's
flagship surface. That is R13's own shared-track-set clause — *"a row-based list surface's
trailing columns shall share ONE set of grid tracks across every row of that surface"* —
violated by the remedy for R13. The prescription was self-contradicting under the governing
rule, and neither of us noticed at filing time. I did not: this is my own item, and my
prescription's reflow half was wrong for a reason I could have derived from a rule I cited
in the same field.

D6's standing lesson generalises here: **verify the premise, not only the prescription** —
and this round adds that a judge should verify its own prescription against the rule it
cites in `governing_rule`, which is currently a field nothing cross-checks.

### Does relocating an existing section satisfy the invariant, or merely fill space?

My invariant was a disjunction: *the rail reaches 60% of the feed's height, **or** the feed
reflows below the rail's end.* The second branch is now shown unavailable. The first is
satisfied at **87.7%**.

But "satisfies the invariant" is the low bar; JUDGE.md's *Relocation is not resolution*
asks what took the old thing's place and whether the defect moved into another channel. I
checked three ways.

1. **Is the fill real, or padding?** `--break ".home-side > .section:last-child{display:none}"`
   returns `.home-side` to **576.7px / 46.9%** — the anchor's own measurement to the tenth
   of a pixel. The relocated section is the entire increment; nothing else grew. And S18 is
   stated *symmetrically* (shorter vs taller, not `homeSide/railChanges`), so a rail padded
   artificially tall would fail it — I confirmed that by breaking it at `min-height: 2400px`.
   The check cannot be satisfied by inflation.

2. **Did the place it came from get weaker?** No. The home document is **2386px** against
   the anchor's 2559px: the same content, 173px less page. The page now closes on
   Impossible → Routine rather than on a doors grid, which is a stronger terminus, and
   nothing was left behind that now reads as truncated. At 390px the doors move *earlier*
   in reading order, which is neutral to mildly good for a site index.

3. **Did the noise move channels?** No rule, border, background or accent was added. The
   doors carry the rail's existing vocabulary — mono bold name, muted blurb, one rule above
   — rather than importing a foreign one, which is visible in `home--light--1440.png`.

**One honest cost, which I record rather than wave past.** `.doors` is
`repeat(auto-fit, minmax(15rem, 1fr))`. In the 1152px shell that resolved to 4 columns; in
the 404px rail it resolves to 1. The same 7 doors now occupy **470.6px instead of ~130px** —
3.6× the vertical space for identical content. Taken alone that is a density loss. Taken in
context it is not: the space it now occupies was empty, and the page total still fell by
173px. Content-per-screen is up. I counted it in `information_density` accordingly, at +0.5
rather than more.

**Ruling: I9 resolved.** The decline saved a round trip on a prescription that would have
broken R13, and the substitute is a real improvement rather than a space-filler. This is the
loop's decline mechanism working exactly as JUDGE.md says it should: *declining with cause is
a SUCCESS of this loop.*

---

## 5. I11's correction — verified in source, and it was my error

iter-05's I11 named "licence, pricing model, verified date and link" — **four** fields.
`lib/render/tools.mjs` `renderListingRow` emits exactly three: `.listing-pricing`,
`.listing-verified`, `.listing-entry`. The detail page's `facts()` `<dl>` carries Site,
Category, Pricing, Last verified and Wiki entry — no licence there either. **There is no
licence field anywhere on this surface.**

The implementer is right and my predecessor was wrong. This matters more than a typo,
because JUDGE.md's own contract is that *"the loop treats your `problem` as authoritative
and your `prescription` as a hypothesis."* An authoritative field carried a fabricated
detail for two iterations, and the loop's only defence was an implementer reading the source
carefully enough to notice. Recorded plainly rather than buried in an acknowledgement, since
the trust asymmetry the loop runs on is the thing it damages.

The fix itself is the round's best visible work. Anchor: six sampled field right edges at
1134.3 / 1004.8 / 1294.2 (wrapping to 2 lines) / 799.1 / 867.7 / 623.9, no two fields sharing
an x. Now, measured by me across **all 12 categories**: pricing left 144.0, verified left
1047.5, entry left 1212.2 — identical on every entry, with the 2-line entry back to one line
at 20.1px. Keeping pricing on `minmax(0, 1fr)` because it is genuine prose up to 148 chars,
while giving the two short fixed-format tokens `max-content`, is exactly the right
discrimination and it avoids reproducing R7's tension at a worse scale. And the implementer
found its own mobile regression — pricing squeezed to a sliver at 390px — and fixed it
before shipping; I verified the fix live at 362px of 390, full width.

---

## 6. Benchmarks — the mechanism, not the adjective

**Stripe.** Stripe treats a comparison across records as a *column* problem and gives every
field one track shared down the list; the property of Stripe's content that makes this
transfer is that a reader crosses a long list of records to compare a small fixed field set.
That is precisely `/tools`, and as of this round `/tools` finally does it — three shared
columns, verified identical across 12 categories. It is the single clearest visible gain of
the round (`index-tools--light--1440.png`). Where the artifact still falls short of Stripe:
at 390px `/catalog` abandons tabular presentation for 396 stacked blocks over 86,653px, with
the first complete record below the fold. Stripe's mechanism there is a surface that stays
scannable at a few rows per screen; this one gives four, starting below the fold. I23.

**Linear.** Density without clutter, structure carried by type weight and spacing rather
than by marks. The `/tools` middot separator run is gone, replaced by column position — and
here Linear's transferring property genuinely holds, which R8's own post-mortem insists a
citation must establish: 35 short, near-uniform-height entries with a small fixed field set,
not a 396-row seven-column price table. Where the artifact still falls short: `/catalog`'s
Read column, having lost its 396 underlines, kept **full ink** — the same weight as the
numerals a reader crosses the row to compare — where Linear would put a collection-constant
at the quietest weight on the surface. I36.

**Vercel.** A grid whose rhythm stays visible across every page of the property. I33's
restoration of the shared 144px rail is exactly this, and `/data` now demonstrates it
cleanly: H1, lede, four section headings and every row on one edge, with four *different*
rule widths that read as correct because they share that edge. Where it still falls short:
`/blog`'s list rule spans 1152px over 644px of content, a template writing its own dialect
of a rule enforced everywhere else. I35.

---

## 7. The arithmetic, where resolved items and regressions pull against each other

Four categories moved. Every other category held, and each hold is stated in
`score_hold_justification` as a checked claim, not a default.

| category | from | to | net |
|---|---|---|---|
| family_coherence | 6.0 | 7.0 | **+1.0** |
| chrome_restraint | 8.5 | 9.0 | +0.5 |
| list_and_table_craft | 8.0 | 8.5 | +0.5 |
| information_density | 7.0 | 7.5 | +0.5 |

`+2.5 / 10 = +0.25`. Anchor 8.00 → **8.25**, just clear of NF1's 0.2 floor.

**Where the pull is real, category by category.**

*family_coherence, +1.0 — the only full point, and it is mostly a recovery.* The anchor
itself moved this category **6.5 → 6.0** for the centring remedy; iteration 6 reverted it,
which buys back the 6.5 and nothing more. The further half-step is I11: `.browse-row`,
`.rung` and now `.listing` all use R13's one shared-track-set mechanism, where `/tools` was
the standing exception. Against that: I35 (`/blog`'s rule) and I36 (the repeated date now
treated three different ways across three templates) are both live coherence defects, which
is why this stops at 7.0 rather than going higher. A category recovering ground it lost
last round is not the same as a category advancing, and the log should be able to tell.

*chrome_restraint, +0.5, pulled two ways.* 396 underlines removed from the flagship table
and 35 middot runs removed from `/tools` is substantial, and I checked specifically for
relocation — no rule, border or background was added anywhere to compensate, and `.listing`'s
per-entry rule is unchanged and R8-required. Pulling the other way: the /catalog Read value
landed on full ink rather than muted, so half the weight that was removed as *underline* is
still present as *ink*. That is not a relocation into another channel — it is an incomplete
demotion — but it is enough to hold this at 9.0 rather than 9.5.

*list_and_table_craft, +0.5, and this is the clearest pull of the round.* I11's columns are
a real gain. But the same fix gave the 35 identical "verified 2026-08-28" strings a
**dedicated, perfectly aligned column**, so a repetition that was previously buried mid-line
now stacks in a visible band down the page. **The fix made the defect more legible, not
less.** This is not "relocation is not resolution" in its strict sense — nothing moved
channels — but it is the same family: a genuine improvement whose side effect is to surface
a second defect at higher contrast. I scored the gain and filed the exposure (I36) rather
than netting them to zero, because netting is how the iter-03 chrome_restraint failure
happened: opposing effects averaged inside one number that could not express the
distinction.

*information_density, +0.5, with a counted cost.* The home page is 173px shorter for
identical content and its dead column fell from ~688px to ~152px. Against it: the doors'
`auto-fit` collapse from 4 columns to 1, which costs 340px of vertical space for the same
seven items. Net positive because the space consumed was previously empty, but the cost is
real and I have not pretended otherwise.

**No `score_hold_justification` for a suppressed rise is needed** — resolved items did
outweigh regressions and the overall did rise, by more than the noise floor. The
justification field instead documents the four categories I held, which is the direction the
anchored-re-scoring protocol actually needs policing in.

**On not inflating.** The eight taste categories average **7.94**. The rubric's own iter-04
computation says overall ≥ 8.5 requires them to average **8.3**. The gap is 0.36 across
eight categories — closer than the +1.25 the anchor faced, and still not there. I could have
reached 8.5 by giving three categories another half-step each, and every one of those steps
would have been unearned. The target is a stopping condition; a loop that reaches it by
drift has destroyed the only instrument it had.

---

## 8. Convergence — the loop has NOT converged, and the reason is concrete

The manifest asks me to say plainly whether any `ui-fixable` item remains that an
implementer could act on. **Yes. Three, and I verified each of them live on this build.**

- **I35** — `/blog`'s list rule spans 144.0→1296.0 (1152px) while the widest rendered
  content in the list ends at 644.0px. A **652px** overhang, R10's exact defect, on the one
  index template `S5` does not sample. It was knowingly not worked and the manifest lists it
  as still live. The fix is one declaration (`width: fit-content` on `.rail-posts`, already
  flush at x=144 so the rail clause is undisturbed) plus one route added to S5's list. This
  is not a judgement call, a taste question or a keeper: **it is a one-line change with a
  measured defect behind it.** That alone settles the convergence question.
- **I36** — new, and created by this round's own work interacting with this round's own rule
  amendment. R8's addendum states the clause generally; S17 enforces it on one route through
  one mechanism; both surfaces the general clause governs violate it. Two CSS tokens and one
  check widening.
- **I31** — a full-strength accent hairline used as decoration in two places on the home
  page, predating the anchor, unworked, and now carried along into the relocated rail.

Plus three `evidence-fix` items (I13, I26, the new I38) and three keeper-gates (I14, I27,
the new I39).

**Ten items, three of them actionable presentation changes. The queue is not empty and it is
not padded.** The manifest's own framing is the right one and it cuts this way: *a loop that
stops because it has run out of real findings has succeeded; one that stops at a number has
not.* This loop has run out of neither.

**A caution against reading a small item count as convergence, since it will get smaller.**
D3 is the loop's own measurement on exactly this: `iter-00-a` and `iter-00-b` filed 13 and
14 items over one identical evidence set with only partial overlap, so the true defect count
is the union and no single judge sees all of it. *"Never read 'zero items remain' as proof
the artifact is clean — read it as 'this judge has nothing further', and confirm with a
second judge before declaring the loop converged."* When the queue does empty, that
confirmation is owed, and this verdict does not discharge it.

---

## 9. Verdict

**Well-designed reference site.**

The site does the reference job well and now does it consistently. Hierarchy comes from
weight and space; `/tools` and `/data` are genuinely well-made list surfaces; the shared
144px rail holds across every template again; accessibility is measured clean on every
sampled route in both themes with complete tab orders; payload sits comfortably inside its
bound. The instrument beneath all of that is materially more trustworthy than it was two
rounds ago, and that was bought at a round with nothing visible to show for it, which was
the right trade.

It is not best-in-class, and one defect is most of the reason: **`/catalog` at 390px.** The
site's flagship surface presents 396 records over 86,653px — 102 screens — with the first
complete record below the fold. R12 passes over it and R2 passes over it, which is D1's own
class of failure: a green check over a surface that does not serve its reader. It has been
carried at impact 5 for several rounds; two independent iteration-0 judges scored this shape
at 9. I hold the anchor's 5 because nothing about it changed this round and re-scoring an
untouched item is drift — but the discrepancy is now on the record and should be settled the
next time the item is actually worked, because "best-in-class reference site" is not
available to a property whose primary table is unusable on a phone.

The round earned its quarter point. It should be read as a quarter point of artifact, which
is the first honest one in three verdicts.
