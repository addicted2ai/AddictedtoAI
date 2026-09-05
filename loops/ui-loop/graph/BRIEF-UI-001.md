# BRIEF-UI-001 — A site that amazes a human without a word of hype

```yaml
id: BRIEF-UI-001
version: 1
schema: loops/ui-loop/graph/schemas.md#concept-brief
status: active — keeper GO pending (K13 confirmed models 2026-09-05; GO after reading the anchors)
depends_on: [CHARTER.md, RULES.md (R1–R16 + tombstones), openspec/specs/site (design bar), state.md (K10–K13),
  JUDGE.md (Known evidence lies L1–L8), frontier-plan (bead addictedtoai-s8gz, §1 §2.3 §11.3 §11.4; review §7),
  evidence/baseline (main 4f2314e), evidence/current (f08a3c6)]
concept_count: 4
concept_round_panel: [judge-hierarchy, judge-system]     # red team + gates always run
finalists_built: 2
revision_cap: 3
```

## Context

Nine iterations of an item-fixing loop took the presentation layer to "well-designed reference
site" (ported: `2d0f3fa`). The keeper then said what the loop was never told (K10, verbatim in
substance): **"A shining example of what frontier AI can do when handed the reins. I want people to
be truly amazed at the quality of the site, and even more so once they realize a human didn't write
any of it."** The layout is "ok, but a bit mechanical … great for machine reading (also important!)
but not very alluring or exciting for a human." The old rubric scored "a reader's tool, not a
showcase" and capped distinctiveness; this brief inverts that. A polish loop cannot produce an
identity; a concept round can.

## Requirements (each → clause)

- **R-A Identity and allure** (K10; site spec design bar "deliberately designed, not templated: a
  distinctive typographic identity"). A first-time visitor wants to keep reading; the design conveys
  the field's pace through structure and data, never through adjectives. Judged as `ALLR` (20) plus
  `MR-UI-001`.
- **R-B The Frontier, flagship surface** (K11; plan §1/§2.3/§11.3–11.4 as the data contract; keeper
  inputs 2026-09-05). Prototype route `/frontier` on the branch. Keeper's shape, as inputs not the
  answer: a running board of the major players and their current frontier model(s) with claims
  **verbatim from the source and unmistakably labelled unverified** unless a cited verification
  exists; the compression of release cadence; new proven abilities (deltas, tutorials, anchored
  notes); the lead-change timeline as one rail among several. Every element names a data source
  present in the repo today (`data/sources/*/latest.json`, `data/derived/*`, `content/wiki/**`
  timeline events, deltas, tutorials, blog notes). Structured vendor claims do not exist yet: the
  concept must show how an **honest empty cell** reads. Fixed copy is digit-free inside a
  `[data-derived]` fence (plan §11.4).
- **R-C Wiki entry template** (I40, `RULES R13`/S18, **F-K12**). On entries with a prose body the
  reader meets the subject (title plus one sentence of context) BEFORE any facts table; the dead
  second column is resolved (S18's 60% floor met, or the keeper retires the clause with cause).
  Model records without prose may stay facts-first.
- **R-D Catalog at 390px** (I14 ruling: one addressable, Ctrl-F-able page; `RULES R12`). At least one
  concept presents the 396 rows in materially fewer screens than the current 93,963px while every
  row stays reachable without a route change (filtering, chosen fields, collapsing allowed;
  pagination is not).
- **R-E Home** (site spec scenario "content above the fold"). The changed feed stays the lead; The
  Frontier gets a door; no full-viewport hero.

## What is law and what is challengeable (K14, 2026-09-05)

`RULES.md` R1–R6 are constitutional: they transcribe the site spec's measured design bar
(accessibility, reflow, payload, keyboard, focus, content above the fold) and no concept may
break them. **R7–R16 are the previous loop's accepted invariants**, its taste encoded as checks. A
concept MAY propose to retire or amend any of them, with cause, as an `open_questions` entry tagged
`keeper` that names the rule and what replaces it; judges score the argument, not the compliance;
the matching `tools/ui-invariants.mjs` check is suspended for that concept's build pending the
keeper's ruling, and a ruling lands as a tombstone or an addendum in `RULES.md` (rules are an API:
never renumbered, retired to tombstones). The port is the measured starting point on live, not a
design to preserve: a concept may replace the visual system wholesale as long as it EXTENDS the
existing templates and components rather than forking a second set.

## Anti-requirements (this round)

- No content edits, no copy edits inside JSX (CHARTER slot 1). No new routes except `/frontier` (K11).
- No rubric or contract edits inside a round (KP4); rule challenges go through K14 above.
  Implementers never edit the rig or the bounds in `scripts/verify-design.mjs`.
- No sample, placeholder or invented data in any concept build. An empty state is the honest render.
- No dependency on a single third-party index (Artificial Analysis republication rights are
  unsettled, `addictedtoai-ego8`); a concept that dies without AA indices fails the fence.
- No hype lexicon in fixed copy (revolutionary, game-changing, unprecedented, best-in-class,
  blazing, insane, mind-blowing, and kin); quoted vendor language is allowed only verbatim, attributed,
  and labelled.
- No external origins: a new typeface must be self-hosted under `public/` with a licence that allows
  it, or the build's allowlist gate fails (site spec). No new client JS beyond the 150 KB bound.
- Four concepts are four different bets, not one idea with trim levels.

## Mandatory first steps (generator)

1. Read K10–K13 in `state.md`, `CHARTER.md` slot 1 and the oracle stack, `RULES.md` R1–R16 and
   tombstones, `JUDGE.md` Known evidence lies, and this brief. Then the Frontier plan §1, §2.3,
   §11.3, §11.4 and the review's §7.
2. Look at `evidence/current/*--light--1440.png` and `*--light--390.png` (the site as it is now).
3. For every element that shows a number or a claim, name the data source path first; if none exists
   today, the element is an empty state or it does not exist.
4. Write the `reuses:` line per surface before designing it: nearest existing template or component,
   what differs. ≥80% the same means extend, never fork.
5. Write all four packets rough first, then refine.

## Success criteria

- Keeper picks a built finalist from a frontier of two; its branch passes every hard gate.
- `ALLR ≥ 8` and `HIER ≥ 8` on the built finalist; F-K12 satisfied; S18 green or retired with cause.
- `MR-UI-001` (keeper find-task test, five tasks, success and seconds, main vs finalist): no task
  slower or failed on the finalist; recorded as `CAL-UI-001` before any merge (K3).
- Rig coverage complete for every judge contract; zero red-team criticals.
