# Iteration 1 — assessment

**Anchor:** `iter-00-b`, overall 6.8, ladder entry `Competent`, 14 items.
**This pass:** overall **7.0**, ladder entry **Competent**. Delta **+0.2**, which is exactly
the measured noise floor and understates the round — see *The arithmetic*, below.

Scope worked since the anchor: the shared design system only (`app/globals.css` +
`app/layout.tsx`), seven items S1–S7, two declines DC1 and DC2. No page template was
touched. Evidence: 40 baseline captures against 40 re-captures at HEAD, plus a live
`verify-design.mjs` run (45 checks, 0 failures) and one targeted browser measurement.

---

## The headline

Six of the seven shipped items did real, visible good. Two categories moved by more than
a point each — the largest single-category moves this loop has recorded — and three of the
anchor's items are fully discharged.

One shipped item, **S7, broke the site's primary surface.** The `/catalog` column-header
row is now displaced downward by exactly `--header-h` and lies on top of its own first two
data rows, at scroll position zero, in both themes, at both viewports. A 396-row price
table currently has no legible column labels. That is filed as **I15 at impact 9** and it
is the single most important thing in this verdict.

It also matters *how* that happened, because it is a verdict on my own predecessor's
reasoning, not only on the implementer's. Iteration-0 `I7` asserted, from reading the CSS
alone, that `.site-header` and `.data-table thead th` were sticky in the same scroll
context and would collide. They are not. `.table-wrap` declares `overflow-x: auto`, and
per the CSS overflow spec a `visible` cross-axis coerces to `auto`, so `.table-wrap`
computes `overflow-y: auto` and **is** the thead's nearest scrolling ancestor. The thead
never stuck to the viewport; the site header could never have occluded it. The prescribed
offset was applied faithfully to a collision that did not exist, and inside that scroll
container the offset pushes the header down onto its own rows instead. The loop's own
doctrine — *detection is trusted, remedies are hypotheses* — is exactly right, and this is
the case that proves it: the problem statement was wrong at its root, so the remedy could
not have been right.

I verified this two ways rather than trusting the captures. Live `getBoundingClientRect`
over the built output:

| viewport | thead rect | body row 1 | body row 2 | `--header-h` |
|---|---|---|---|---|
| 1440×900 | 462–491 | 445–477 | 477–508 | 46px |
| 390×844 | 905–934 | 868–899 | 899–930 | 129px |

The thead intersects two body rows at 1440 and one at 390, and the displacement equals the
site header's measured `offsetHeight` exactly. The captures agree:
`current/table-catalog--light--1440.png` and `--dark--1440.png` print MODEL / PROVIDER /
IN / OUT / CONTEXT / STATUS / READ across "Anthropic Claude Haiku Latest" and "Anthropic
Claude Sonnet Latest"; `current/table-catalog--light--390.png` strands the word MODEL
between the third and fourth rows of the list. Every baseline counterpart renders the
header correctly. This is a regression, not a capture artifact.

**And every gate passed while it shipped.** `verify-design.mjs` was green, and
`ui-invariants.mjs` reported 5 registered, 5 pass — including `S7`. Reading that check
(`tools/ui-invariants.mjs` lines 200–224) explains why: it returns true whenever
`thTop >= headerBottom - 0.5` and asserts nothing else. It is **one-sided**. Displacing
the thead arbitrarily far *downward*, including onto the rows it labels, satisfies it
trivially. This is the same failure class R5's preserved post-mortem was written about — a
check that passes for the wrong reason — and it is why I13 is re-filed and widened rather
than carried unchanged.

---

## Per-category reasoning

### Chrome restraint — 5.0 → **7.5** (+2.5)

The largest move in the verdict, and it is earned. S2/R8 removed the per-row
`border-bottom` from `.browse-row`, `.rail-item`, `.strip-item` and `.data-table th/td`,
removed the `.table-wrap` outer box, and made `.badge:not([data-tone])` borderless. In
round numbers that is ~396 rules gone from `/catalog`, ~85 from `/wiki`, 24 from the home
feed and 11 from `/data`, plus roughly 480 grey `ACTIVE` chips that said the same thing on
every row.

The result is exactly the **Linear** mechanism: structure carried by row rhythm and type
weight rather than by a ladder of 1px lines. Compare `current/index-wiki--light--1440.png`
with its baseline — the baseline is a ruled ledger with a bordered chip on every row; the
current capture is a list. The dark theme benefits most, because `--rule` (#2c303b) against
`--paper` (#14161c) read as a stronger ladder than the light equivalent, so the
over-spent chrome budget was over-spent worse there.

Not 9, for one specific reason: `/tools` still draws a rule under all 35 entries
(`current/index-tools--light--1440.png`). Filed as I19. Before this round every list ruled
every row — over-chromed but uniform. Now four templates don't and one does, so the
divider policy reads as an oversight rather than a decision.

### Colour discipline — 7.0 → **8.0** (+1.0)

S4/S6/R9 took `--accent` out of the resting state. It had been the ambient colour of 396
model names *and* 396 READ dates on `/catalog` — two of seven columns entirely coloured —
plus every `/blog` post title. It is now reserved for hover and focus, so the only colour
left on an index is the ember `DEAD` / `RETIRED` / `DEPRECATED` chip.

This is the cross-cutting principle all three exemplars agree on — *colour reserved for
state and meaning rather than decoration* — actually implemented, and the before/after pair
on the catalog mid-table region shows it cleanly. Held at 8 because the principle is not
yet universal: the home changed-feed and rail still set record links in `--accent`
(`current/home--light--1440.png`), so the site's front door is the one page still using
colour as the ambient treatment of a list.

### First-read hierarchy — 7.0 → **7.5** (+0.5)

Two named causes up. Default-state badges de-chipped, so on `/wiki` the RETIRED/DEAD/
DEPRECATED rows are now the only marked ones and read as genuine exceptions rather than
competing with ~60 identical grey `ACTIVE` chips. And S5/R10 stopped the prose header
rules at the content edge instead of running 545px past it — compare
`current/wiki-entry--light--1440.png` and `current/article--light--1440.png` against
baseline, where the meta rule spanned to x=1295 while the body it introduced stopped at
751. The **Vercel** mechanism here is a rhythm that stays visible across every page; the
header rule finally agrees with the column it heads.

Only +0.5 net, because I15 damages the first read of the flagship surface: a table whose
column labels lie on top of its data has no first read at all.

### Family coherence — 5.5 → **6.0** (+0.5)

Gains: one record-link treatment shared by `/wiki`, `/catalog` and `/blog`; one divider
policy across `/wiki`, `/catalog`, `/data` and home; block-width matching on the prose
templates. Three iteration-0 items filed by two judges about three templates converged on
one fix, which is the system behaving like a system.

Only +0.5 because the same iteration split the family three new ways:

1. `/tools` rules every row while four templates no longer do (I19).
2. R9 reaches 3 of 5 index surfaces. The home feed keeps `--accent`; `/learn` keeps plain
   ink with **no underline at all** — which is precisely the resting-affordance defect the
   anchor filed as I6 against `/wiki`, still alive on another index (I18). The site now has
   three resting treatments for "click this record" where it had three before; the
   composition changed, the count did not.
3. `--measure-list` added a **fourth** content right-edge. The anchor counted three; there
   are now four: ~660 (wiki/data rows), 751 (prose), 1005 (learn), 1295 (catalog/blog).

### Responsive integrity — 7.0 → **6.5** (−0.5, regression)

Moved down, with the change and the capture cited. At 390 the `/catalog` header is
displaced 129px and renders as a stray MODEL label between body rows 3 and 4
(`current/table-catalog--light--390.png` vs baseline). Everything else at 390 is unchanged
or marginally better.

Worth stating plainly: **R2's reflow oracle is green throughout.** No measured check on
this project catches a table header lying on its own data. That is not a criticism of R2,
which measures what it claims to; it is the reason the screenshot class exists.

### Information density — 6.5 → **6.5** (hold)

Held, and the hold is the interesting finding. Pages barely moved: `/wiki` 3624→3563px,
`/catalog` 13427→13029px, `/tools` 4595→4583px — under 3% each. Meanwhile `/wiki` now
leaves **55% of the shell empty** beside all 85 rows and `/data` about 44%.

S1 was right and the row reads far better for it. But the anchor's complaint was 950px of
dead space *inside* the row, and the current state is ~635px of dead space *outside* it.
The invariant R7 states is satisfied; the width it freed was not reassigned to anything.
Per the contract, a fix that satisfies its invariant while relocating the defect into a
different channel is still a defect — filed as I16. **Linear's** density mechanism is
tight uniform rows *filling their container*; this is now tight uniform rows stranded in a
container twice their width.

### List and table craft — 5.5 → **5.5** (hold)

The most contested number in the verdict, so the ledger explicitly:

**Up:** I4 resolved. On `/wiki` the kind and status now begin at x≈538, immediately after
the 24rem name column, instead of at x≈1170 — the name-to-attribute traverse drops from
~950px to ~40px, across 85 rows, and `/data` gets the same treatment. Rules gone. Resting
link affordance present. That is a substantial gain on two of the four primary surfaces.

**Down:** I15 leaves the primary table's column labels on top of its first two data rows in
both themes at both viewports. I17 is a *new* alignment defect S1 introduced: `.browse-row`
is `minmax(0, var(--measure-list)) auto auto` and each row is its own independent grid, so
the trailing tracks size per-row and nothing aligns across rows. `ACTIVE` begins at x≈578
after "org", 584 after "tool", 585 after "event", 592 after "model", 603 after "concept",
620 after "technique" — a six-position ragged edge down 85 rows, so the one thing a reader
scans this index for vertically cannot be scanned vertically. **Stripe's** mechanism is the
direct contrast: a listing is one table, so every column shares one track across all rows,
which is what makes a status column readable at a glance. The anchor had no alignment
defect here; the columns were merely too far apart.

**Untouched:** I1 (390px catalog delivers 396 names and no numbers) and I11 (`/tools` sets
four identical fields as 35 run-on prose lines).

Net: a wash. 5.5 holds.

### Typographic system — 7.0 → **7.0** (hold)

Nothing in S1–S7 touched the type scale, the weights, the measure or the face. Underlines
were added to record links, which is decoration, not scale. I10 stands unchanged: no
`@font-face`, no `next/font`, no bundled face anywhere in `app/`. The serif/mono split is a
genuinely good domain choice applied with discipline; the defect is that the fallback chain
(Charter → Sitka Text → Cambria → Georgia → Times New Roman) differs materially in x-height
and set width, so the controlled 38rem measure yields a different character count per
platform and the `--step-*` rhythm lands on different baselines. **Vercel's** mechanism is
one face chosen for the property and *served with it*, so the grid's rhythm is identical
for every reader; here it is identical only for readers who happen to have Charter
installed. ~28 KB of payload headroom exists for a subset woff2.

### Accessibility — 8.5 → **7.0** (instrument correction, not a regression)

A lookup, not a judgement. Zero axe violations in both themes across all four sampled
routes. Lowest printed focus-sweep ratio: `/catalog` at **150 of 817 = 0.18**, which is
< 0.5. The mapping's third row returns **7**.

The anchor's 8.5 is not a value the mapping can produce; the rubric says as much in its own
text. **The artifact's measured accessibility is unchanged from the baseline.** This costs
1.5 points for an instrument change, and the loop should read it as such.

### Payload discipline — 9.5 → **9.0** (instrument correction, not a regression)

Also a lookup. Worst route `/catalog`: 122.2 KB gzipped against the 150 KB bound in
`data/launch.json` = **81.5%** — over 60%, at or under 85% → **9**. The anchor's 9.5 is not
a value the mapping can produce. The artifact in fact improved fractionally, 122.3 → 122.2 KB.

### Visual distinctiveness — 6.0 → **6.0** (hold, capped)

Held. This round was subtractive — chrome removed, colour withdrawn — and subtraction does
not add identity. There is an honest argument in both directions (the site reads quieter
and more editorial; it also reads closer to an unstyled document now that links are
underlined and rules are gone), and neither is a named observable change, so it holds.
Observing the cap: this is not a reason the overall is held down, and no item in this
verdict rests on "looks generic".

---

## Acknowledgement of every implemented item

| item | status | note |
|---|---|---|
| **I2** | **resolved** | S2/R8. Rules and the outer box gone from `/catalog`, `/wiki`, `/data`, home; default badges borderless. Exception re-filed as I19 (`/tools`). |
| **I4** | **resolved** | S1/R7. Metadata sits immediately after the label on `/wiki` and `/data`. Residue unspent (I16); trailing tracks ragged (I17). |
| **I6** | **resolved** | S6/R9. `.browse-name` is ink with an always-on underline; a `/wiki` row reads as a link with no hover. |
| **I7** | **resolved** | Shipped, premise false, remedy harmful. See I15. |
| **I3** | **partially-resolved** | Link half largely done (3 of 5 index surfaces); grid half declined as DC2 and re-filed as I16 per DC2's invitation. |
| **I8** | **partially-resolved** | S4 removed the accent competition. 396 identical strings and 396 redundant tab stops remain; `/catalog` still reports 817 focusables. |
| I1, I5, I9, I10, I11, I12, I13, I14 | **not-visible-in-evidence** | Per-template or evidence-rig items, deliberately not worked this round. All re-filed. |

## On the two declines

**DC1 (column-start alignment) — accepted, and I am not re-filing it.** The adjudication is
sound on both legs: satisfying it requires deleting the `.facts` label column, whose markup
lives outside the two-file scope, and unlabelled facts genuinely do read worse than
misaligned ones. Block-width matching shipped as R10 and that was the right half to take.

I do file one thing *adjacent* to it, and it is not the declined clause: on
`/wiki/concept/ai-winter` the **FACTS section heading's rule** still spans to x=1295 while
the facts block stops at x=751 — 2.1× the width of the block it introduces. The same page
gets it right twice immediately below (REFERENCED HERE, APPEARS IN stop at their own
columns' edges). That is R10 not yet being true for headings, not DC1's column-start
alignment. Filed as I20, impact 4.

**DC2 (track convergence) — accepted for the iteration, and re-filed exactly as invited.**
The manifest is right that its stated reason was wrong and right that the conclusion
survived anyway. It says: *"This is achievable work that was out of scope, not work that is
wrong. If it is still a defect in the current evidence, re-file it."* It is still a defect,
and it is now a slightly larger one — the count of distinct content right-edges went from
three to four because `--measure-list` added a track. Re-filed as I16 at impact 6.

---

## The arithmetic

The eleven-category mean is 6.955, which rounds to 7.0 against the anchor's 6.8 — a rise of
exactly the measured noise floor. That number understates the round, and the reason is
worth stating precisely.

**Two of the eleven categories moved on instrument change, not on the artifact.** Applying
the rubric's new hard mappings costs accessibility 1.5 and payload 0.5 — 2.0 raw points,
0.18 off the mean — for an artifact whose measured accessibility and payload are unchanged
(payload marginally improved). Scored on the anchor's own unmapped numbers for those two
rows, the overall would be 7.1. The mapping is right and I applied it as a lookup, as the
contract demands; but the loop should not read those two rows as the implementer losing
ground.

**The genuine artifact deltas are strongly positive and broad**: +2.5 chrome restraint,
+1.0 colour discipline, +0.5 each on hierarchy and coherence, discharging I2 (impact 8),
I4 (7) and I6 (6). They are prevented from compounding by one severe regression (I15,
impact 9) and by the untouched per-template backlog, which is where the two impact-9 items
now both live.

**Two categories are held rather than raised for a reason that matters more than the
arithmetic.** S1 and S2 improved how a row *reads* without changing how much a screen
*delivers*. The dead space did not disappear; it moved from inside the row to outside it,
and no template spends it. That is the contract's relocated-defect case, and I have filed
it (I16) rather than quietly crediting the move as density.

## Verdict — Competent

Unchanged from the anchor, and the reason is specific rather than a hedge. The system-level
work this round was genuinely good: the chrome budget is now defensible, colour is now a
signal rather than an ambient wash, and three templates share one link treatment where none
did before. On the shared design system alone this site is arguably approaching
*Well-designed reference site*.

It cannot hold that entry while its primary surface is broken. `/catalog` is the reason
most readers arrive; it is 396 rows of price data; and its column headers currently sit on
top of its first two data rows in both themes at both viewports. Add that at 390px the same
table still delivers names and no numbers, and the site's flagship page fails at both the
viewport a reader most often uses and the one it was designed for. A reference site is
judged as its reader's tool, and that tool is currently mis-labelled.

The path back is short and unusually well-specified. I15 is likely a one-line revert; I1
and I11 are bounded template work; I17, I18, I19 and I20 are each a handful of lines in the
shared system, and three of them are simply *finishing* rules R8, R9 and R10 across the
surfaces they already name. If I15 and I1 close and the R8/R9/R10 gaps are swept, list
craft, density, coherence and responsive integrity all move together, and the next pass has
a real claim on the ladder's next entry.

## Note to the loop's instrument

Two additions belong in JUDGE.md's *Known evidence lies*:

- **L3** — a full-page capture does not show the scrolled configuration of sticky elements.
  It is easy to mistake for coverage of the scrolled state, because it *does* show the
  content below the fold, just never in its scrolled configuration.
- **L4** — a one-sided geometric invariant can be satisfied by displacing the element in the
  opposite direction. `S7` asserted only `thTop >= headerBottom` and passed while the thead
  lay on its own data. Assert both bounds.

L4 is the more valuable of the two. Every rule this loop promotes from a verdict item is
enforced by an assertion written at the same time, and a one-sided assertion is how a green
gate ships a regression.
