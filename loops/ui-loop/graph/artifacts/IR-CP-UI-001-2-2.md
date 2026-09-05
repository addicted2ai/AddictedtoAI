# IR-CP-UI-001-2-2 — implementer report, Players Board (RD-002)

```yaml
id: IR-CP-UI-001-2-2
version: 1
schema: loops/ui-loop/graph/schemas.md#implementer-report
depends_on: [RD-002, IR-CP-UI-001-2-1, CP-UI-001-2.v2]
branch: ui/concept-2
worktree: D:\AddictedtoAI-c2
head: 26a11d571d2409247e3fa14a5d02be92f562d1a3
```

## Gates
- build PASS (log clean; only pre-existing `currency-literal` warnings; JS 103 kB)
- verify-design PASS 46/46 (`data/launch.json` restored) · verify-surfaces PASS
- ui-invariants PASS 23/23 — S22, S22b, S23, S24 new; S5, S17, S18 amended

## Fixes (all five MET)

**1 — VENDOR CLAIM is a claim about the row's own model.** `firstCitedFact` is gone;
`vendorClaimFact(modelDoc)` takes only `source: cited` facts ON THE MODEL whose `field` names a
performance/capability claim (score·bench·eval·index·throughput·latency·speed·performance·
capabilit·claim·role·description·verified·accuracy·swe·agent). No org doc is read here by any
path. 4 of 16 rows carry a claim; 12 render the blank.
**Hatched: 12 of 96 value cells at 1440 (12 in the first viewport) and 12 at 390 (10 in it).**
No founding date, founder or company fact anywhere on /frontier, asserted by S22(a): it reads
every `cited` fact out of `content/wiki/org/*.md` and fails if one appears in the page.
Δ `frontier--light--1440/390.png` VENDOR CLAIM: 16 chips (several org founding facts) → 4 claims,
12 hatched blanks.

**2 — >90% state once above the board; claim clamped; READ on screen.** The per-row `.badge` is
gone. `.board-claim` clamps to one line at `--board-claim-max` (11rem) with `text-overflow:
ellipsis`; the board is then 1152px in a 1152px shell at 1440 — READ on screen, no scroll. The >90% state the gate found was not the claim column (after fix 1 it runs 75/25) but
**READ, repeating `openrouter-models · 2026-09-05` on 16 of 16 rows at the price columns' ink
weight**. Answered with /catalog's own mechanism: `renderFetchLine` reused verbatim above the
board, unexceptional rows `--muted` via `data-default`. `renderPlayersBoard` still emits
`p.board-note` if a claim state clears 90%. No copy authored.
Δ `frontier--light--1440.png`: 16 chips, claim cut mid-word, READ off-screen → no chip, a fetch
line above, one-line ellipsised claims, READ in the shell.

**3 — Door by recency, lead-pair weight, nav at 390.** `boardExcerpt` ranks orgs by the newest
dated change touching the org's entry or any model its matched catalog rows point at
(`site.changes`), stable-falling back to A–Z where there is none. Door cells carry `.board-lead`,
the board's own treatment, over a row rule matching `#frontier-board tbody tr`, which the board
now carries because R8's surface test (16×7) requires it. No per-row rules (AR-001 D3). 390 is the
nav item (K25), asserted by S24.
Δ `home--light--1440.png` door: Alibaba Cloud/Anthropic/Cohere (alphabetical, frozen — RT FM3) →
Alibaba Cloud/OpenAI/Mistral AI, at the board's lead weight over its rule.

**4 — `.entry-rails` one flow; heading rules span their own content.** What the findings call
`.entry-rails` is this build's `.rails` (`div.rails` > `aside.rail-referenced`/`.rail-appears-in`);
its 292px tracks and 44.9% are F-struct-2/3's numbers (a check against the literal selector would
be vacuous). `.rails` becomes one `fit-content` flow — R13's other permitted answer; letting the
shorter rail set the row is unavailable, list lengths being data. Each rail takes
`width: fit-content`, so its `border-top` spans its own list.
Δ `wiki-entry--light--1440.png`: two 292px tracks, 162.0/76.0px overhang, 44.9% → one flow, each
rule on its own list.

**5 — /tutorials/<entry> at 390.** `.prose code` takes `overflow-wrap: anywhere` (`.prose pre
code` untouched — inside a scrollport, R2's remedy). Widening is NEW invariant S23: ONE ROUTE PER
TEMPLATE (18) at 390 and R2's own 320; `scripts/verify-design.mjs` not touched.
**The widened sample found a second R2 violation at once**: /tutorials (the index) 330px wide at
320, from an unbroken stamp token in `.listing-line`. Fixed with `overflow-wrap: break-word` on
`.listing` — not `anywhere`, which shrinks min-content, these rows sitting in the subgrid set
S19 holds to a 200px floor.
Δ `tutorial--light--390.png`: 465×10275 → 390px wide; no page scroll on 18 templates at 390/320.

## Declines
None; nothing in `do_not_touch` edited. F-sys-2-1b's "read date ahead of the claim" was NOT taken:
reordering columns is the board grid; the cap meets the invariant instead.

## rule_changes (paired RULES.md + ui-invariants.mjs, falsified both ways)
- **R2 + S23** NEW. `.prose code{overflow-wrap:normal}` fired at 469px on /tutorials/<entry>
  (verdict 465px); scope end `body{min-width:1200px}` fired on the first sampled route.
- **R6 + S24** NEW (flagship reachable at 390 AND feed still leads). Hiding the nav item fired;
  lifting `.home-side` above the feed fired (door 137.8px, feed 1598.6px) — the trade a
  reachability-only check would score a win.
- **R8 + S17** widened to /frontier (no boxed chip; no column repeating a value on >90% of rows at
  the compared weight); `#frontier-board tbody tr` rule added per R8's surface test. (a) falsified
  by source edit (chip restored, rebuilt) → 16 chips; (b) fired on the real gate before any break
  (READ), and under `--break` after.
- **R10 + S5** widened to `.rails` → "292.0px, 160.1px from its own widest child" (verdict
  162.0px); opposite sign 60.0 vs 102.6px. **R13 + S18** 2nd clause (one flow, or 60%) → 52.4%;
  opposite (roles swapped) 24.8%.
- **S22 / S22b** NEW: board identity, hatch floor and ceiling, one-line claim, last column on
  screen — six breaks, all fired.

**Falsifier honesty — four breaks missed first time; one was a real defect in a CHECK.** (1) S5's
`.rails` break omitted `width:auto`; `fit-content` collapses auto-fit/1fr to ONE track. (2) S18's,
same cause, then missed AGAIN with two real columns — that was the check: a grid row stretches
every item to the row height, so an item-BOX ratio is 100% by construction. Rewritten to measure
OCCUPIED height — S1's own vacuous-box mistake, caught only because the falsifier ran. (3) S22
(c)'s break removed the cap, which overruns the TABLE, not the CELL. (4) S22b's opposite widened
`.board-wrap` alone; the table is `width:100%` of it and tracked the new edge. Also, S5's clause
first used `.rails > section`, matching nothing.

## Files
Changed: `app/globals.css`, `app/frontier/page.tsx`, `lib/render/frontier.mjs`,
`lib/render/home.mjs`, `loops/ui-loop/RULES.md`, `tools/ui-invariants.mjs`. New: this report.
Untouched: rig, `loops/ui-loop/evidence/`, `content/`, `data/`, `public/`, K6 paths.

## Notes for verify
- K23–K29 are not in `loops/ui-loop/state.md` (it stops at K22); they came in the dispatch.
- /frontier at 390 still scrolls the BOARD inside `.table-wrap` (1148px in 362px): R2's remedy,
  R12's expectation, not a defect. S22b declares no opinion at 390.
