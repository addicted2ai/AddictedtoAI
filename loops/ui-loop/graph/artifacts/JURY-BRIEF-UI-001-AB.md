# JURY-BRIEF-UI-001-AB — finalist jury, order A then B

```yaml
id: JURY-BRIEF-UI-001-AB
version: 1
schema: loops/ui-loop/graph/schemas.md#jury
order: "A=CP-UI-001-2, B=CP-UI-001-1"
depends_on: [SCORE-CP-UI-001-2-2, SCORE-CP-UI-001-1-2, DR-CP-UI-001-2-2, DR-CP-UI-001-1-2]
juror: Fable (K13); sibling runs B then A; a flip = no preference
```

Pointwise verdicts read first (JV-hier/struct/sys -2 for both, RT, DR, SCORE), then captures in
`<worktree>\loops\ui-loop\evidence\current\` (c2 = A, c1 = B). Rankings and reasons only.

## Per dimension

| Dim | Pref | One observable reason (evidence) | Loser flips it by |
|---|---|---|---|
| HIER | A | B's flagship is a 928px document at a 390 viewport, index columns off-frame, and /frontier is absent from B's nav and last in the side list (c1 frontier--light--390.png, home--light--1440.png; F-hier-2-1, F-hier-2-2). A's 16 routes lead with eyebrow/H1/lede at both widths and frontier is first in nav and first rail block (c2 home--light--1440.png). | B: fold the board below 48rem; add /frontier to nav. |
| DENS | A | A's board carries real values in five of six columns for 16 rows; B's first screen is 32 copies of "no index published for this window" (c2 vs c1 frontier--light--1440.png; F-hier-2-3, F-sys-2-1). A's own defects (16/16 chip, clipped last column: F-hier-5/6) are lighter than a screen with no discriminating value. | B: collapse a wholly-empty column to header + one line. |
| TABL | B | B's catalog@390 is 3,041px of provider groups against A's 48,520px flat stack of 431 rows (c1/c2 table-catalog--light--390.png; S22 ok vs F-hier-9); A's flagship truncates its last column mid-word on 16 rows at 1440 (F-struct-5). Both box a default-state chip on every claim (F-struct-4 A, F-struct-3 B); both have a rule overhang (F-struct-2 A, F-struct-5 B). | A: clamp the claim cell; group the catalog at 390. |
| RESP | A | Both ship the inherited tutorial overflow at 390 (c2 465px, c1 473px wide; F-struct-1 A, JV-hier q8 B). Only B adds a page-level scroll on the flagship at 390 and 768 (928/937px; F-struct-1 B). A's board scrolls inside its own container (c2 frontier--light--390.png). | B: same board fold as HIER. |
| TYPE | none | Both self-host an OFL face under 11 KB/weight with licence and metric overrides, both 2/2 PASS (JV-sys q1–q2). Space Grotesk vs JetBrains Mono is a value call (for_keeper). | — |
| COLR | none | Both paper/ink, ember on state only, accent on links; both carry the pre-existing accent-at-rest elapsed label on home (c2/c1 home--light--1440.png "2 YEARS, 3 MONTHS"; F-sys-2-3 B, unfiled A). | — |
| FAM | A | A's 16 tiles read as one system incl. 390 (c2 contact-sheet--light--390.png); B's two data tables take opposite narrow treatments, the frontier tile alone wider than its column (c1 contact-sheet--light--390.png; F-sys-2-2). | B: reuse renderCatalogGroups for the board at 390. |
| ALLR | A (weak) | On shipped pixels a first-time visitor to A's flagship meets a filled, ruled board; to B's, a wall of identical absence before the one real move (c2/c1 frontier--light--1440.png; JV-sys q5 both critical FAIL). A's gesture (hatch) renders zero times (F-sys-2-3); B's gesture (PACE spine) renders but third block down. This is the row most likely to flip with order. | B: column collapse so THE PACE sits in the first screen. A cannot flip B on ceiling — see frontier. |
| K19 board-leads | A | A leads with a populated players board (org, current model, price, context). B's board has no lookup that can ever resolve a value — columns are source ids (RT FM11, c1 frontier--light--1440.png); it is a board in name. | B: source price/context/current-model from catalog.json as A does, or collapse per packet empty_state (scope call, for_keeper). |
| K22 domain-absorbable | none | Both IRs name additive column arrays (BOARD_COLUMNS / COLUMNS), data-attribute filters and a generic facts loop; neither is exercised by any capture or gate, so nothing observable separates them. | — (add a gate that renders a fixture domain row). |

## Frontier

**A — Players Board** is the best available answer to "a flagship that is useful on day one with the
data the repo has": sixteen organisations, current model, price and context, ruled and tracked across,
reachable from nav and home, reflowing at 390 inside its container, one face reaching all sixteen
templates through one token. Its cost is that the identity move never renders — zero hatched cells
across 112 (FM2) — so /frontier reads as a second catalog with an org key, and its default-state chip
and clipped claim column are the loudest and least readable things on the page.

**B — Dated Ledger** is the best available answer to "an identity gesture no template site ships":
a time-proportional spine with a digit-free legend, a real monospace as the spine face, attributed
claim cards, and the round's largest measured density win (catalog@390 93,963 → 3,041px). Its cost is
that the flagship's first screen is 32 identical empty cells with no lookup behind them, the route is
the only one in either build that scrolls sideways at 390 and 768, and the spine's five one-day gaps
show no variation yet (RT "wrong in a week").

## Identity read against K10

**A.** As a first-time human on c2 frontier--light--1440.png I see a competent, trustworthy price
sheet: bold org/model lead pair, tabular figures, a grotesk that reads as printed. I keep reading
because the numbers are real and comparable. I am not amazed — this is exactly K10's "great for
machine reading, a bit mechanical"; nothing on the page tells me a machine drew the shape of what it
does not know, because every cell is full and the CLAIMED · UNVERIFIED chips repeat into noise. Home
(c2 home--light--1440.png) is the round-0 page with a three-line door and a new label face. The
allure exists in the packet, not yet in the pixels.

**B.** On c1 frontier--light--1440.png I first see a heading "The Frontier", then a grid that says
the same sentence 32 times — I read it as broken before I read it as honest. If I scroll, THE PACE
(dated clusters at unequal distances, a legend saying a longer gap is a longer gap in the world) and
the four-column claims grid are the first things in either build that feel authored rather than
generated; the mono nav and dates give the whole family a ledger character (c1 contact-sheet). At 390
(c1 frontier--light--390.png) the page is a shrunken desktop I must pan. B is the one a human would
remember, and today the one a human would bounce from.

## Revision targets (one iteration each)

**A (ui/concept-2)** — ranked: 1 F-sys-2-7 (type the vendor claim at source, drop
`firstCitedFact(org)` fallback; repairs F-sys-2-3/FM1/FM2, renders the hatch for the first time);
2 F-hier-6 + F-struct-5 + F-sys-2-1b (clamp claim cell to one ellipsised line, read date ahead of
claim); 3 F-hier-5 + F-struct-4 (default-state chip unboxed, muted; state once above board);
4 F-struct-1 (`overflow-wrap:anywhere` on prose inline code; widen reflow sample to every route);
5 F-struct-2 + F-struct-3 + F-hier-7 (.entry-rails one flow or fit-content; add to S5/S18 lists).
Evidence fix alongside: F-hier-9 (catalog@390 as viewport capture), F-sys-2-6 (un-stamped theme pair).
do_not_touch: `--mono` Space Grotesk and its overrides; board grid and column tokens; K21 all-orgs
iteration; F-K12 prose-before-facts order; home feed lead and the fixed two-column door (F-hier-2
accepted; F-sys-2-4 row rules only if free); catalog 1440 table; nav. re_evaluate: judge-hierarchy
(HIER q4, DENS q6–q7), judge-structure (RESP q4, TABL q2/q6, RESP q7), judge-system (ALLR q5/q7/q8
only). TYPE, COLR, FAM stand.

**B (ui/concept-1)** — ranked: 1 F-struct-1 + F-hier-2-1 + F-sys-2-2 (board reflows below 48rem via
renderCatalogGroups; add /frontier to reflow sample); 2 F-sys-2-1 + F-hier-2-3 (wholly-unpublished
column collapses to header + one line at column level — presentation half of C2; the data half is
for_keeper); 3 F-hier-2-2 (/frontier in nav; door above the side list); 4 F-struct-3 (claims chip
unboxed at default tone, stated once under the section lede) + F-struct-5 (fit-content section rules);
5 F-struct-4 (S18 content-ratio single-column fallback on prose entries). do_not_touch: JetBrains Mono
and its overrides; THE PACE spine, its clamp and legend (F-sys-1-2 routed to measure); catalog@390
provider groups and S22; F-K12 lede/facts split; home feed; unruled link indexes (F-hier-1 stands).
re_evaluate: judge-hierarchy (HIER q1–q2, DENS q5–q6), judge-structure (RESP q4–q5, TABL q2/q6/q7),
judge-system (FAM q4, ALLR q5). TYPE, COLR stand.

## for_keeper

1. Typeface as identity (K16 met by both): a grotesk that reads as print (A) or a monospace that
   reads as a ledger (B). No clause separates them.
2. C2 / FM11 (B): may the flagship ship on a column collapse carrying zero comparative data, or must
   B's board borrow A's catalog-derived columns first? The second makes B's board A's board and
   collapses the frontier by fiat — that is a value call, not a fix.
3. K19 at 390 on home (F-hier-10, both builds): does the board need a first-viewport door at 390, or
   is the nav item enough?
4. K21 ordering (A, RT FM3): the home door names the alphabetically first three orgs forever.
   Editorial order by recency of the org's newest listing is a content-adjacent decision.
5. A's unilateral S13/S14/S18 rewrite (DR-2 keeper item) — ratify, given F-struct-3 shows the shape
   survived on .entry-rails.
6. MR-UI-001 must include the blank: A's remedy introduces hatched cells; B already shows what 32
   blanks do to a first read. Both frontiers depend on a reader calling a blank honest, not broken.
7. ALLR is the row the sibling is most likely to flip. If it flips, the residual question is yours:
   day-one usefulness with the gesture still to come (A) or the higher ceiling with the first screen
   still to fix (B). Both fixes are one iteration; only B's needs decision 2.
