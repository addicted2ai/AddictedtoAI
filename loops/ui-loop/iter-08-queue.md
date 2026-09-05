# Iteration 8 — work queue

**Likely the final artifact round.** Four items, sized to the gate. Falsify with
`--only <id> --break "<css>"` (~3s), not rebuilds (~106s). Batch breaks; full gate once at
the end.

**Scope.** `app/globals.css`, `app/layout.tsx`, and the `/blog`, `/catalog`, `/tools`
templates. `RULES.md` and `tools/ui-invariants.mjs` are ALWAYS in scope.

**Verify each item's checkable specifics against source before building on it.** A previous
verdict itemised four fields on `/tools` — licence, pricing, verification-date, link — and
named a licence field that does not exist anywhere on that surface. The fabrication was in
`problem` and `invariant`, the fields this loop treats as authoritative, and it survived
into a work queue. Authoritative means *act on this rather than the prescription*; it does
not mean true. Correct any item you find wrong, in your report.

**The registry enforces two-sided falsifiers.** Every invariant needs
`brokenBy`/`observed` AND `brokenByOpposite`/`observedOpposite`, or a real `oneSidedBecause`
argument about the property. 5 of 14 checks were found one-sided when actually tested; three
of those nobody had spotted by eye. Assume yours is one-sided until you have seen it fire on
both ends.

---

## I35 — impact 5 — app/blog index template (.rail-posts, app/globals.css)

**Problem (authoritative — but verify its specifics).** Unchanged and re-verified live by me at 1440x900. The rule introducing the post list now sits on .rail-posts itself - which was half my iter-05 prescription and the right half - but .rail-posts' own box still spans 144.0 to 1296.0 (1152px, the full shell) while the widest rendered content inside the list ends at 644.0px. A 652px overhang: a full-width line over a list occupying just over half of it, visible in evidence/current/index-blog--light--1440.png. This is R10's exact defect, the one I20 fixed on /data and the wiki entry at iteration 4, on the one index template S5 does not sample - which is why the gate is green over it. /data demonstrates the correct behaviour on the very same build: its four section rules each match their own section's content width (measured: four different widths, all flush at x=144), so the mechanism exists and is applied everywhere except here.

**Invariant.** On /blog, the rule introducing the post list spans the same rendered width as the widest rendered row of that list, within 2px; and S5's route list includes /blog.

**Governing rule.** RULES.md R10

**Prescription (hypothesis).** Give .rail-posts width: fit-content (it is already flush at x=144, so R13's shared-rail clause is undisturbed - this is exactly what iter-06 did to .browse when it dropped margin-inline: auto and kept fit-content). Its tracks are var(--rail-col) + minmax(0, var(--measure-list)) plus the gap, so fit-content resolves to the list's own rendered width and the border-top follows it. Extend S5's route list to /blog in the same change so this cannot silently recur, and while there check /tutorials and /learn for the same shape - both have full-shell section containers over measure-bounded content and neither is sampled either.

---

## I36 — impact 5 — app/catalog page template (lib/render/catalog.mjs Read cell) and app/tools page template (lib/render/tools.mjs .listing-verified), plus tools/ui-invariants.mjs S17's scope

**Problem (authoritative — but verify its specifics).** R8's iter-07 addendum generalised the badge clause correctly - 'a repeated, non-discriminating value shall not carry the SAME visual weight as a column a reader compares across - bordered or linked or otherwise emphasised' - but S17 enforces only ONE surface and only ONE emphasis mechanism, and the rule's own text is now violated on both surfaces it should govern. (a) /tools, measured by me at 1440x900 on the shipped build: all 35 .listing-verified spans render the identical string 'verified 2026-08-28' - 1 unique value, 100% share - at computed color rgb(90,95,107), 13px, weight 400, ui-monospace, which is BYTE-IDENTICAL to .listing-pricing's computed treatment, the column a reader crosses the row to compare. It occupies 144.7px of the 1152px row and, because I11 just gave it a dedicated shared column at x=1047.5, it now stacks 35 identical strings in a perfectly aligned vertical band down the whole page. I11's fix did not create the repetition but it made it far more legible: previously the date was buried mid-sentence in a run-on middot line; now it is a column reserved for a constant. (b) /catalog, measured by me: the Read cell's link was correctly removed (0 of 396 linked, text-decoration 'none') but the value was demoted to rgb(26,27,34) - full ink, identical to the IN / OUT / CONTEXT numerals - where the STATUS column's own default state sits at muted. A constant on 396 of 396 rows is still competing at the ink weight of the four columns that discriminate. S17 tests only for the presence of an <a>, so it is green over both. This is the check being narrower than the rule it enforces, which is the shape L4 and D8 both describe.

**Invariant.** On any row-based list or record table, a value identical on more than 90% of the surface's rows renders at a lower visual weight than the columns a reader compares across - measured as computed colour, not only as the absence of a link - and only a row whose own value differs from the collection's dominant one may rise to the compared columns' weight. S17's assertion covers both /catalog's Read column and /tools' .listing-verified column, and compares computed colour as well as link presence.

**Governing rule.** RULES.md R8 (the iter-07 addendum's own general statement, which is broader than the check registered for it)

**Prescription (hypothesis).** Two CSS changes and one check widening. (1) /catalog: give the Read cell the muted token when its value equals the collection default, keeping ink for the exception - this is the treatment STATUS already uses for its own default state on the same table, so it imports no new vocabulary. (2) /tools: same, on .listing-verified, so the constant date sits below .listing-pricing's weight rather than at it; the entry link keeps accent+underline and remains the row's discriminating anchor. (3) Widen S17 from 'does the cell contain an <a>' to 'is the dominant value's computed colour distinguishable from the compared columns' computed colour', and add /tools' .listing-verified to its route list. Falsify both directions on each surface: a constant raised to ink (should fire) and an exception demoted to muted (should fire) - the second is the direction S17's synthetic fixture already covers for /catalog and would need a real minority row or an equivalent fixture for /tools.

---

## I31 — impact 4 — app/page.tsx home template (the Impossible-to-Routine delta strip and the .door grid, app/globals.css)

**Problem (authoritative — but verify its specifics).** Unchanged, held correctly by the loop as predating the anchor, and re-verified by me this round including through the I9 relocation. Two instances on one page. (a) .door[data-feature='yes'] takes border-top-color: var(--accent) while its seven siblings take var(--rule) - a full-strength accent hairline marking one navigation door as featured, which is decoration rather than state; it moved into the right rail with the I9 relocation and is still there. (b) The first .delta article carries an accent border-top while its structurally identical sibling below carries the neutral rule. Neither instance encodes a state a reader can act on: nothing else on the page says what 'featured' means or why the first pair is marked and the second is not. RULES.md R9 reserves --accent for hover and focus rather than for resting state, and the cross-cutting property all three benchmarks agree on is colour reserved for state and meaning rather than for decoration.

**Invariant.** On the home page, no resting-state border, rule or divider uses --accent; a sibling in a repeated list carries a border colour different from its siblings only where that difference encodes a state the page names elsewhere.

**Governing rule.** RULES.md R9

**Prescription (hypothesis).** Drop the data-feature accent override on .door and the equivalent on the first .delta article; both revert to var(--rule) so every sibling in each list reads the same at rest. If 'featured' is a real editorial state worth marking, mark it with a word rather than a hairline - the doors already carry a blurb line and a two-word tag there would say what the colour cannot. Extend S6's assertion (it already forbids --accent as a resting link colour) to cover resting border-colour on repeated list siblings, falsified both ways: an accent border where none belongs, and a genuinely stateful marker losing its distinction.

---

## I38 — impact 4 — tools/ui-invariants.mjs, checks S1/S15 (the 3-line allowance) and S18 (the 60% floor)

**Problem (authoritative — but verify its specifics).** Two of this round's bounds are constants fitted to today's content on surfaces the build regenerates, in a loop whose charter forbids changing content - so when either fires there is no permitted remedy and the red will be misread as a presentation regression. Measured by me on the shipped build. (a) S1/S15's 3-line allowance: all four /blog titles wrap to exactly 3 lines at a track measuring exactly 384.0px. Three of three. A post whose title is one line longer than the current longest (117 characters) turns S15 red, and neither available lever is permitted - widening --measure-list was rejected with cause in R7's own addendum, and shortening the title is a content edit. (b) S18's 60% floor: .home-side 1079.3px, .rail-changes 1230.8px, ratio 87.7%. The feed is 24 entries: 23 at 43.4px and one annotated at 209.3px. S18 fires when the feed exceeds 1079.3 / 0.6 = 1798.8px, which is 568px of headroom - 3.4 more annotated entries in the top 24. data/changes.jsonl is regenerated daily; a day with five annotated changes takes the home page's gate red with no presentation remedy left, since the rail's content is now fully committed and relocating a second section is not a repeatable move. Neither bound is wrong, and both are structurally sound, which I verified adversarially: forcing /data's track to 350px (only 34px under the cap, wrapping just 2 lines) fires the COLLAPSED branch, and forcing /blog's to 350px at exactly 3 lines fires it too, so the line allowance genuinely cannot mask an undersized track. The defect is not the bound; it is that a bound with zero declared headroom reports PASS without saying how close it is - D2's own lesson (read what a check MEASURED, not its verdict line) applied to a margin instead of to a coverage ratio.

**Invariant.** Every check whose threshold is derived from the artifact's current content prints its remaining headroom alongside its PASS - the measured worst case, the bound, and the margin between them - and records in its falsifier the content assumption the bound rests on, so a future failure is diagnosable as content growth rather than as a presentation regression.

**Governing rule.** RULES.md R7 (iter-07 addendum, which states the 3-line bound as 'the largest line count either bounded surface's real content presently needs' - the word 'presently' is the whole of this finding) and RULES.md R13 (iter-07 addendum a)

**Prescription (hypothesis).** Have S1, S15 and S18 print their margin on success, not only their message on failure: for S15, 'worst case 3 of 3 lines allowed - NO HEADROOM'; for S18, 'shorter side at 87.7% of taller, floor 60%, headroom 568px of feed growth'. That alone converts a silent cliff into a visible one and costs nothing. Then record in each falsifier what the bound assumes about content and what the loop should do when it is exceeded - for S15, that a 4-line title signals the surface has outgrown --measure-list on that template and needs its own token rather than a widened shared one; for S18, that a feed grown past 1798.8px signals .home-grid's split needs a different mechanism, not more rail content. Do NOT loosen either bound to buy headroom: a bound relaxed in advance of the case that would test it is exactly the miscalibration iter-06 retired the occupancy clause for.

---

## I23 — impact 5 — app/catalog page template (the 33.999rem stacked-record block in app/globals.css)

**Problem (authoritative — but verify its specifics).** Unchanged from the anchor and not worked this round. At 390x844 /catalog presents 396 records as stacked blocks of ~215.9px each, producing an 86,653px document - 102 screens - with the first record not beginning until y=724.5, so the first complete record is entirely below the fold. R12 is satisfied (name, in, out and status are all present per record, no page-level horizontal scroll) and R2 is satisfied, and the surface still fails its reader: this is D1's own class, a green check over a surface that does not work. Stripe's mechanism for a long record set is a tabular surface a reader can scan vertically at a few rows per screen; at 390 this surface gives four records per screen with the first one below the fold.

**Invariant.** At 390x844 on /catalog, the first complete record is fully visible within the first viewport, and a record's rendered height does not exceed 120px.

**Governing rule.** RULES.md R12 (satisfied as written; this item is that R12's floor is too low, not that R12 is broken) and RULES.md R14

**Prescription (hypothesis).** Cut the per-record height by dropping the ::before attr(data-label) field labels from the columns whose values are self-labelling at a glance (input price, output price and status all read unambiguously as $-prefixed numbers and a lifecycle token) and keeping them only where the value is ambiguous; and move the four preamble paragraphs above the filter controls behind a <details> at this breakpoint so the first record clears the fold. R14's activation floor applies to that disclosure: it must remain a genuine tab stop that exposes its content on Enter. Note that I27 is a live keeper on exactly the attr(data-label) question - whether those generated labels are announced by assistive technology is unmeasured - so resolve I27 before removing any of them, or remove none and take the height out of the preamble alone.

---

