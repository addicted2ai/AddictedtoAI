# JURY-BRIEF-UI-001-BA — finalist jury, order A then B

```yaml
id: JURY-BRIEF-UI-001-BA
version: 1
schema: loops/ui-loop/graph/schemas.md#jury
order: "A=CP-UI-001-1, B=CP-UI-001-2"
depends_on: [SCORE-CP-UI-001-1-2, SCORE-CP-UI-001-2-2, DR-CP-UI-001-1-2, DR-CP-UI-001-2-2]
juror: Fable (K13); pointwise JVs read before any pairwise (rule 5); rankings only, no numbers
```

## Pairwise, per dimension (same evidence for both: `evidence/current/` of each worktree)

| Dim | Prefers | One observable reason (evidence) | Loser flips it by |
|---|---|---|---|
| HIER | B | A's flagship is a 928px document at a 390 viewport, board columns off-frame, and its only home door is the last side-list row with no nav item (A `frontier--light--390.png`, F-hier-2-1/2-2); B leads every route from the first viewport, `/frontier` in the nav and top of the rail (B `home--light--1440.png`, JV-hier q1/q2 PASS) | A folds the board below the shell width and adds `frontier` to the nav |
| DENS | B | A's flagship first screen is 32 copies of one sentence (A `frontier--dark--1440.png`, F-hier-2-3); B's first screen is 16 rows of real model, price and context values with R8 classes correct (B JV-hier q5 PASS). Caveat A wins catalog@390 outright: 3,041px against B's 48,520px (`table-catalog--light--390.png` both) | A collapses wholly-empty columns at column level and gives cells a value lookup (FM11) |
| TABL | A | Both catalog tables hold (S7/S19 PASS both). B's board clips its last column mid-word on 16/16 rows at the widest viewport and puts READ off-screen (B `frontier--light--1440.png`, F-struct-5, F-sys-2-1b); A's board is well-formed at 1440 and its catalog@390 is one addressable 3,041px page (A F-struct q3) | B caps the claim cell to a token and moves READ ahead of it |
| RESP | B | Both break R2 on `/tutorials/<entry>` at 390 (A 473px, B 465px; A's struct judge did not file it). A additionally overflows the flagship at 390 (928px) and 768 (937px) (A F-struct-1); B's flagship capture is exactly 390 wide with container scroll (B `frontier--light--390.png`) | A reuses `renderCatalogGroups` for the board's narrow state |
| TYPE | none | Both self-host an OFL face on the existing `--mono` token with metric overrides and licence beside (JV-sys q2 PASS both); JetBrains Mono is truer to A's "dates as the spine face" thesis, Space Grotesk reaches more of B's felt identity; the one measure outlier (WHAT IT MEANS ~90ch) is on both homes | — |
| COLR | none | Both: state-only colour, no accent rules, the same pre-existing accent-at-rest elapsed label on home (`home--dark--1440.png` both, F-sys-2-3 A) | — |
| FAM | B | A's two data tables take opposite narrow treatments in one build: catalog folds, board holds three columns (A `contact-sheet--light--390.png`, F-sys-2-2); B's contact sheet is one vocabulary across 16 tiles, the face reaching every template through one token (B JV-sys q4 PASS) | A gives the board the catalog's narrow treatment |
| ALLR | A | The only gesture on either build no template site ships renders on A: THE PACE, dated clusters at unequal distances under a digit-free legend (A `frontier--light--1440.png`, JV-sys q6/q7 PASS); B's flagship is the catalog table re-cut with orgs as rows, its signature hatch firing on 0 of 112 cells (B F-sys-2-3, JV-sys q7). Caveat: A's FIRST screen is worse (32 empties) and this pick may flip with order | B drops the `firstCitedFact(org)` fallback so blanks appear, and carries board rules onto the home door |
| K19 board-leads | B | A's board leads but `renderIndexBoard` ignores org and source and can never resolve a value (RT-A FM11, `lib/render/frontier.mjs`); B's board leads with a populated row per org from `catalog.json` (B `frontier--light--1440.png`) | A wires a value lookup per (org, column), not a CSS collapse |
| K22 domain-absorbable | B | Both IRs name additive column arrays, generic `renderFacts`, filter attrs; neither demonstrates a row. B's `BOARD_COLUMNS` cells read row fields so a domain column would show a value; A's board cell renderer ignores its row, so a domain column would print the same filler (FM11) | A's cell renderer reads its row |

Tutorial overprint (A F-hier-2-6, B F-hier-8) and the R2 code-token overflow are shared port debt.

## Frontier (maintained, not collapsed)

**A — Dated Ledger** is the best available answer to K10's "pace through structure, zero adjectives": time as spacing is a real move the visitor can feel, its legend says it in words, and the catalog@390 provider ledger is the round's only material R-D win (93,963 → 3,041px). Its cost is that the flagship's leading element is a board that cannot ever hold a value and does not reflow, so the signature is met third and only at desktop.

**B — Players Board** is the best available answer to K19 and K20: a board that leads with real rows on day one, one face carried to sixteen templates by one token, `/frontier` reachable from every first viewport. Its cost is that it is not yet distinct from the catalog it reuses — the honesty mechanism that was the bet has no live cell, and the claim column launders founding dates as vendor claims.

## Identity read against K10 (first-time human visitor)

**A.** On `/` (`home--light--1440.png`) I see the port in a crisper mono; nothing says a frontier exists until the ninth side-list row. On `/frontier` I meet a grid saying sixteen times that nothing is published — it reads as broken, not honest, and at 390 it spills off the right edge. Then THE PACE: five dated shelves at uneven distances, a sentence telling me a longer gap here is a longer gap in the world. That is the one thing on either site I would describe to someone. Verdict: alluring in one place, mechanical-to-broken on the way there.

**B.** On `/` the rail opens with THE FRONTIER and three org/model pairs — a door, but the same three alphabetical names every day (RT-B FM3). `/frontier` (`frontier--light--1440.png`) reads instantly: who ships what at what price, in a warmer grotesk. I trust it; I would not remember it — it is the catalog with fewer rows, last column trailing off mid-word. At 390 it folds cleanly. Verdict: confident and legible, mechanical in exactly the way K10 named; the thing meant to be memorable (the hatch) never appears.

## Revision targets (one iteration each)

**A — ranked invariants**
1. F-struct-1 / F-hier-2-1 / F-sys-2-2 — `/frontier` document width equals viewport at 390 and 768; reuse `renderCatalogGroups`.
2. RT FM11 + F-sys-2-1 / F-hier-2-3 — board cells look up a value per (org, column); add current-model / price / context columns from `catalog.json` (the data B proves exists) and collapse wholly-unpublished index columns to one line.
3. F-hier-2-2 — `frontier` in the primary nav and the door above the side list.
4. F-struct-3 + RT FM12 — unbox the 16/16 chip, state "none verified" once, and show the claim's field name.
5. F-struct-2 — `/frontier` joins the reflow sample and S5/S17/S18 route lists (evidence-fix, free).
`do_not_touch`: THE PACE spine, clamp and legend; JetBrains Mono and `--mono`; catalog@390 provider groups; F-K12 lede/facts order; PROVEN rail; home feed; the S18 fallback (routed, DR-A C1).
`re_evaluate`: judge-hierarchy q1/q2/q5/q6; judge-structure q4/q5/q6; judge-system q4/q5; red-team FM11/FM12 only.

**B — ranked invariants**
1. F-sys-2-7 / F-sys-2-3 / RT FM1 — drop `firstCitedFact(org)`; a cell under VENDOR CLAIM is a claim about that row's model or the labelled blank. The hatch fires for the first time.
2. F-hier-6 / F-struct-5 / F-sys-2-1b — no board cell clipped at 1440; READ ahead of the claim; claim capped to a token.
3. F-hier-5 / F-struct-4 — claim state unboxed at `--muted`, stated once above the board; chip reserved for a differing row.
4. F-struct-1 — `overflow-wrap:anywhere` on inline code in `.prose`; widen the reflow list (R2 is constitutional).
5. F-sys-2-4 + RT FM3 — home door carries the board's row rules and `.board-lead` weight, and picks rows by recency, not alphabet.
`do_not_touch`: Space Grotesk and `--mono`; catalog 1440 table; catalog@390 two-line rows; F-K12 order and the S14 repurpose (pending keeper); NEWEST PROOFS; nav; the fixed two-column door form (declined with cause, accepted).
`re_evaluate`: judge-system q5/q7/q8; judge-hierarchy q6/q7; judge-structure q2/q4/q5; red-team FM1–FM3 only.

## for_keeper (value calls with no clause to anchor)

1. **Flagship with no index data.** No snapshot carries an independent index value (DR-A C2, RT-A FM11). Ship `/frontier` as a prices-and-context board (B's shape; A could adopt it) and add index columns when a feed publishes, or hold the route for the Desk order. Nothing rules which board is "a players board" without an index.
2. **Identity choice.** Quiet mono ledger whose move is time-as-spacing (A) versus a grotesk board whose move is drawn absence (B, not yet firing). Taste; MR-UI-001 should ask a reader "what does the spacing mean" (A) and "why is this cell striped" (B, F-sys-2-8).
3. **Catalog@390.** A: 3,041px of closed groups, a row visible only after opening. B: 48,520px flat, every row in the document. I14 wants "one addressable, Ctrl-F-able page"; closed `<details>` is not reliably find-in-page. Neither gives both.
4. **B's unilateral RULES rewrite** (S13/S14/S18 retired, S14 repurposed, IR-B rule_changes) while F-struct-3 shows the governed shape surviving at 44.9%. Ratify, or send back through K14.
5. **A's S18 scope** (DR-A C1): the packet promised to fill the dead column and reached 34.5% — inside scope and critical (JV-struct), or accepted cross-packet debt (JV-hier)?
6. **K19 at home 390** (B F-hier-10): does the board have to be reachable from the home first viewport at 390, or only from the route and nav?
7. **Order sensitivity.** ALLR and TABL rest on caveats; if the sibling flips either, record no preference.
