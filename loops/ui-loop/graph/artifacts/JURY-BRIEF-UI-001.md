# JURY-BRIEF-UI-001 — finalist jury, merged frontier (both orders)

```yaml
id: JURY-BRIEF-UI-001
version: 1
schema: loops/ui-loop/graph/schemas.md#jury
depends_on: [JURY-BRIEF-UI-001-AB, JURY-BRIEF-UI-001-BA, DR-CP-UI-001-1-2, DR-CP-UI-001-2-2, SCORE-CP-UI-001-1-2, SCORE-CP-UI-001-2-2]
finalists: "PB = CP-UI-001-2 Players Board (ui/concept-2); DL = CP-UI-001-1 Dated Ledger (ui/concept-1)"
merge_rule: "a preference stands only where AB and BA agree (contract rule 5); anything else is no preference"
```

Merge pass only: no new evidence, no new rankings. Each half read the pointwise JVs, RT, DR and
SCORE before the pairwise, then the same capture sets. `score.mjs` records the rankings; no numbers here.

## Per dimension, merged

| Dim | AB (A=PB, B=DL) | BA (A=DL, B=PB) | Merged | Evidence both halves rest on |
|---|---|---|---|---|
| HIER | PB | PB | **PB** | DL `/frontier` 928px document at 390, no nav item, door last in side list (F-hier-2-1, F-hier-2-2); PB leads every route from the first viewport, `frontier` first in nav and rail (JV-hier-2-2 q1/q2 PASS) |
| DENS | PB | PB | **PB** (caveat: DL wins catalog@390 outright, 3,041px vs 48,520px) | DL board = 32 copies of one sentence (F-hier-2-3, F-sys-2-1, RT FM11); PB board = 16 rows of real values, R8 classes correct (JV-hier-2-2 q5) |
| TABL | DL | DL | **DL** | PB clips its last column mid-word 16/16 at 1440 and READ off-screen (F-struct-5, F-sys-2-1b); DL board well-formed at 1440; both box a default-state chip (F-struct-3 DL, F-struct-4 PB); both overhang a rule (F-struct-5 DL, F-struct-2 PB) |
| RESP | PB | PB | **PB** | both break R2 on `/tutorials/<entry>` at 390 (DL 473px, PB 465px); only DL adds page-level scroll on the flagship at 390 and 768 (F-struct-1 DL); PB's board scrolls in its container |
| TYPE | none | none | **none** | both self-host an OFL face on `--mono` with overrides and licence, 2/2 PASS (JV-sys q1–q2 both); JetBrains Mono vs Space Grotesk is a value call |
| COLR | none | none | **none** | both state-only colour; both carry the pre-existing accent-at-rest elapsed label on home (F-sys-2-3 DL, unfiled PB) |
| FAM | PB | PB | **PB** | DL's two data tables take opposite narrow treatments (F-sys-2-2); PB's 16 tiles are one vocabulary through one token (JV-sys-2-2 q4 PASS) |
| ALLR | PB (weak) | DL | **none (order-flipped)** | the only shipped gesture no template ships is DL's THE PACE (JV-sys-1-2 q6/q7 PASS) but third block down behind 32 empties; PB's hatch fires on 0/112 cells (F-sys-2-3, RT FM2). Both halves predicted this flip. |
| K19 board-leads | PB | PB | **PB** | DL's `renderIndexBoard` ignores org and source and can never resolve a value (RT-DL FM11); PB leads with a populated row per org from `catalog.json` |
| K22 domain-absorbable | none | PB | **none (order-flipped)** | no capture or gate exercises a domain row in either build; BA's PB lean rests on code reading (cells read row fields), not on evidence both halves share. Needs a gate that renders a fixture domain row (evidence-fix). |

Six rows agree (HIER, DENS, RESP, FAM, K19 for PB; TABL for DL), two are no-preference by
construction (TYPE, COLR), two flipped with order and are recorded as no preference (ALLR, K22).
The flipped rows are exactly the identity rows; that is the frontier, not a tie to break.

## Frontier (two entries, maintained — contract rule 2)

**PB — Players Board** is the best available answer to K19 and K20 with the data the repo holds
today: sixteen organisations, current model, price and context, ruled and tracked across; one face
reaching all sixteen templates through one token; `/frontier` reachable from every first viewport;
the board reflowing at 390 inside its container. Measured cost: the identity move never renders (0
hatched cells across 112, RT FM2); the VENDOR CLAIM column launders founding facts as model claims
(RT FM1) and truncates 16/16 at 1440 (F-struct-5); catalog@390 is a 48,520px flat stack; the home
door names the same three alphabetical orgs every day (RT FM3). It reads as the catalog with an org
key, "mechanical in exactly the way K10 named" (both halves).

**DL — Dated Ledger** is the best available answer to K10's "pace through structure, zero
adjectives": THE PACE (dated clusters at unequal distances under a digit-free legend), a real
monospace as the spine face, attributed claim cards, and the round's only material R-D win
(catalog@390 93,963 → 3,041px). Measured cost: the flagship's leading element is a board with no
lookup behind it — 32 identical empty cells (RT FM11, mitigation_exists:false); `/frontier` is the
only route in either build that scrolls the page sideways at 390 (928px) and 768 (937px), breaking
R2; the spine's five one-day gaps show no variation yet (RT "wrong in a week"); S18 promised and not
delivered (34.5% vs 60%). It is the one a human would remember and, today, the one a human would
bounce from.

## Identity read against K10 (merged)

**PB.** Both halves, both orders: a competent, trustworthy price sheet — bold org/model lead pair,
tabular figures, a grotesk that reads as printed. The visitor trusts it and keeps reading because
the numbers are real and comparable; nothing tells them a machine drew the shape of what it does not
know, because every cell is full and the CLAIMED · UNVERIFIED chip repeats into noise. Home is the
round-0 page with a three-line door in a new label face. The allure exists in the packet, not yet in
the pixels: "great for machine reading, a bit mechanical" is K10's own description of the port.

**DL.** Both halves, both orders: on `/frontier` the visitor first meets a grid saying the same
sentence 32 times and reads it as broken before honest; at 390 it is a shrunken desktop to pan. Below
it, THE PACE and the four-column claims grid are the first things in either build that feel authored
rather than generated, and the mono dates give the family a ledger character. Alluring in one place,
mechanical-to-broken on the way there. Only DL's move is describable to someone afterwards; only
PB's page is usable on arrival.

## Revision directives

Issued separately: `RD-001` (DL, ui/concept-1) and `RD-002` (PB, ui/concept-2), each ranked, one
iteration, affected judges only. Anchored rulings on the routed disagreements: `AR-001`.

## for_keeper (value calls; deduplicated across AB, BA, DR-1, DR-2)

1. **Identity choice** — quiet mono ledger whose move is time-as-spacing (DL) vs a grotesk board
   whose move is drawn absence (PB, not yet firing). K16 met by both; no clause separates faces or
   gestures. ALLR flipped with order, so the residual is yours: day-one usefulness with the gesture
   still to come (PB) or the higher ceiling with the first screen still to fix (DL).
2. **Flagship with no index data** (DR-1 C2 data half, RT-DL FM11, DR-1 keeper item) — no snapshot
   carries an index value. Ship DL's board on a real lookup that today collapses every column, borrow
   PB's catalog-derived columns (makes DL's board PB's board — a frontier collapse by fiat, rule 2),
   or hold the route for the Desk order (K11/K22). AR-001 D2 rules the lookup mandatory; the columns
   are yours.
3. **K19 at home 390** (F-hier-10 PB; F-hier-2-2 DL) — must a door to `/frontier` sit in home's first
   viewport at 390, or does the nav item discharge it? R6 forbids displacing the feed; K19 says the
   Frontier leads. AR-001 D3 takes the nav as the anchored minimum.
4. **Home door ordering** (RT-PB FM3, K21) — rows by recency of change rather than alphabet is
   content-adjacent (CHARTER slot 1); RD-002 fix 3 assumes recency. Confirm or strike.
5. **PB's unilateral S13/S14/S18 rewrite** (IR-CP-UI-001-2-1 rule_changes; DR-2 keeper item) —
   ratify, or send back through K14. AR-001 D4 holds R13's floor regardless.
6. **Catalog@390** (R-D, I14) — DL: 3,041px of closed `<details>`, rows visible only after opening;
   PB: 48,520px flat, every row in the document. Closed `<details>` is not reliably Ctrl-F-able;
   neither gives "one addressable page" and "fewer screens" at once.
7. **MR-UI-001 must include the blank** (F-sys-2-8) — RD-002 deliberately introduces hatched cells;
   DL already shows what 32 blanks do to a first read. Both frontier entries depend on a reader
   calling a blank honest, not broken; only the keeper can run that test (K9).
8. **Check-in** — both SCOREs report `all_met:false` with MR-UI-001/002/003 open and a keeper item
   open; this is iteration 2 of the K7 cap. RD-001/RD-002 are the third; the check-in follows them.
