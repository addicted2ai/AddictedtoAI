# BRIEF-UI-002 — The Frontier by domain, and the three items round 1 deferred

```yaml
id: BRIEF-UI-002
version: 1
schema: loops/ui-loop/graph/schemas.md#concept-brief
status: queued — keeper approval required (drafted by the orchestrator 2026-09-06 under K7; no node runs until GO)
depends_on: [BRIEF-UI-001.v1, state.md (K30, K38, K46, K47, K48, K49), DESK-ORDER-001.v1 (as implemented f0fb938),
  SPEC-REVIEW-GUIDE.v1, JURY-BRIEF-UI-001, SCORE-CP-UI-001-2-6, JV-hier-CP-UI-001-2-4 (F-hier-7), JV-struct-CP-UI-001-2-3 (q5),
  JV-sys-CP-UI-001-2-6 (downstream: claim clamp), implementer-ledger.v1]
concept_count: 3
concept_round_panel: [judge-hierarchy, judge-system]     # red team + gates always run
finalists_built: 1          # the Players Board identity is settled (K23); this brief extends it, it does not re-open it
revision_cap: 3
implementer_tier: opus      # K37
```

## Context

Round 1 (BRIEF-UI-001) chose the Players Board identity (K23) and shipped it: `/frontier` with the
board, honest blanks, vendor claims verbatim and attributed, Space Grotesk, prose-before-facts on
wiki entries, two-line catalog rows at 390 (main `b6ac95d`, final score 88.3, zero red-team
criticals). The Desk then implemented the data the surface was waiting for (K49, `f0fb938`):
`frontier: true` / `frontier_reason` / `domains` on posts (K46: `domains` optional, absent = general),
the closed domain facet on entries and tools (`domains_seeded` machine, `domains` editorial,
`domains_excluded`; eight values, "general" unmarked, K38/K47), the claim record beside the entry with
the vendor-sourced test (K48), and `data/derived/frontier.json` (today `metrics: []` with the snapshot
date; both index publishers dark by rule, K24). None of it has a display yet. This brief gives it one,
and closes the three layout items round 1 deferred at the K7 stop.

## Requirements (each → clause)

- **R-A The Frontier's domain section** (K30, K46; DESK-ORDER-001 §1 display contract). Below the
  board: one lane per domain in the closed vocabulary, ordered by domain id (K34), plus a **general**
  lane for flagged records with no domain (K46). Each lane shows the three most recent
  frontier-flagged records by `anchor.date` with kind, title verbatim, source, date, and the F1–F5
  criterion named. A lane with nothing in the window shows its LAST flagged record and its age
  ("nothing flagged in N days"), never feed arrivals as filler. One date meaning per record kind,
  labelled. Fixed copy digit-free inside a `[data-derived]` fence; counts derived. Optional muted
  machine line per lane: catalog arrivals this week (from `changes.jsonl`), visibly separate.
- **R-B `frontier.json` rendered honestly** (K24, ledger #6). The board's index-position columns
  render from `frontier.json` only for metrics that exist there; with `metrics: []` the column is
  absent and the page stands (look up, then collapse — never a hard-wired empty). When a metric
  appears, the lead-change strip renders the derived `lead-change` records distinguishing arrival
  from rescoring, and an F2 record's copy carries no value, ratio, rank or median.
- **R-C The domain facet visible** (K22, K38). On entries and tools the rendered domain set
  `(domains_seeded ∪ domains) − domains_excluded` shows as a fact row / listing field; the tools and
  wiki indexes gain a domain filter or grouping alongside category, no template fork; "general" is
  the unmarked state and shows nothing rather than a "general" chip.
- **R-D Claim records on the subject page** (K44, K48, BRIEF-UI-001 R-B). A model or org entry
  renders its claim records in three states: absent (nothing), `verified: false` ("not verified",
  verbatim quote, source host, accessed date, vendor name first), verified ({by, url, date} shown).
  The board's claim cell and the entry's claim block are one component, not two.
- **R-E The three deferred layout items** (JURY for_keeper; K35 check-in): the wiki entry's empty
  right half at 1440 (F-hier-7: one measure column leaves ~48% of the viewport empty — fill the
  track with the rails/claims/facts or narrow the shell; R13); the catalog at 768 keeping seven
  columns and clipping four (JV-struct q5; R2/R12); the claim cell's one-line clamp eating the value
  (JV-sys v6 downstream: vendor name first must stay, the value must read; ≤85% rule stands).

## What is law and what is challengeable (K14 stands)

`RULES.md` R1–R6 are law. R7–R16 and their round-1..5 addenda are challengeable with cause via
`open_questions` tagged `keeper`. The Players Board identity (grotesk labels, ruled board, hatched
honest blank, paper/ink with one state colour) is **settled by K23 and not re-opened here**: concepts
propose how the new sections join that system, not a new system.

## Anti-requirements

- No content edits; no copy in JSX beyond digit-free fixed template copy (CHARTER slot 1). No new
  routes. No rubric or contract edits in-round.
- No sample or invented data. A lane, column or block with no data renders its honest empty state.
- No index value, ratio, rank or median from any publisher until `frontier.json` carries a cleared
  metric (K24). Both publishers are dark today.
- No hype lexicon; vendor language only verbatim, attributed, labelled (the claim component).
- No external origins; first-load JS ≤ 150 KB; no second board, entry or claim component.
- Three concepts are three different bets on how the lanes read, not trim levels.

## Mandatory first steps (generator)

1. Read `state.md` K23, K30, K38, K44–K49; `DESK-ORDER-001.md` §1 display contract and its
   amendments; `SPEC-REVIEW-GUIDE.md`; the archived changes' specs (`openspec/specs/blog`, `wiki`,
   `pulse`, `directory`, `review`) for the field names and gates as implemented; `RULES.md` addenda
   round 1–5; `implementer-ledger.md`.
2. Look at the live captures of `/frontier`, `/`, a wiki entry, `/catalog` at 1440 and 390 (rig:
   `node tools/ui-evidence.mjs`), and `data/derived/frontier.json` as it is.
3. For every element that shows a number or a claim, name the data path first; the flagged-record
   count today is the backfill's result — read it, do not assume it.
4. Write `reuses:` per surface: the board, the claim cell, `renderFetchLine`, the catalog's grouped
   rows, `.rails` — ≥80% the same means extend.
5. Write all three packets rough first, then refine.

## Success criteria

- Keeper picks one built concept; its branch passes every hard gate; ALLR ≥ 8, HIER ≥ 8, and the three
  deferred dimensions (HIER, DENS, RESP) reach the floor of 8 or the keeper retires the item with cause.
- The section renders honestly on the day's real data (flagged records after backfill; `metrics: []`).
- Zero red-team criticals; rig coverage complete for `/frontier` at 320, 390, 768, 1440, both themes.
- Ledger continues; tier Opus (K37).
