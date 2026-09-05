# IR-CP-UI-001-2-3 — implementer report, Players Board (RD-003)

```yaml
id: IR-CP-UI-001-2-3
version: 1
schema: loops/ui-loop/graph/schemas.md#implementer-report
depends_on: [RD-003, IR-CP-UI-001-2-2, CP-UI-001-2.v3]
branch: ui/concept-2
worktree: D:\AddictedtoAI-c2
head: HEAD_SHA
```

## Gates
- build PASS (log read; only pre-existing `currency-literal` warnings; JS 103 kB)
- verify-design PASS 46/46 (`data/launch.json` restored) · verify-surfaces PASS
- ui-invariants PASS 24/24 — S25 NEW; S22 (d) NEW; S2 widened; S22 (c) fixed (below)

## Fixes (all three MET)

**1 — allow-list, not a regex (RT FM-N1 + FM-N2).** `CLAIM_FIELD` is gone. Two ranked Sets in
`frontier.mjs`, from the field names that occur as `source: cited` facts across
`content/wiki/model/*.md` (read first, read-only).
**Tier 1, benchmark** (18): agentic_index,
capture_the_flag_score, coding_index, cybergym_score, deepswe_score, deepswe_v1_1,
frontiercode_score, harveys_legal_agent_benchmark, hle_verified, intelligence_index,
intelligence_index_by_effort, internal_blind_eval, preview_cybergym_score,
preview_terminal_bench_score, terminal_bench_score, terminalbench_comparison,
terminalbench_score, vals_finance_agent_v2. **Tier 2, quantified** (5): cost_per_task,
fast_mode_speed, observed_latency_p50, observed_throughput_p50, output_tokens_per_task. Everything else — every positioning field (vendor_description, vendor_role,
tier_role, generation_claim, architecture, structure, quantization, distilled_from, open_weights,
local_hardware, the free-access windows) and every metadata field — is excluded **by default**, so a
marketing field invented tomorrow is blank on the day it lands. A SECOND, independent guard: a value
with no digit in it is not a quantified claim whatever its field is called (`deepswe_v1_1`'s
"outperforms most larger frontier models…" is excluded too). FM-N2: `find()` (document order) → a ranked scan, tier 1 over tier 2,
document order breaking ties inside a tier, so `openai-gpt-5-6-terra`'s `vendor_role` can no longer
preempt its own `capture_the_flag_score`.
**Counts: 3 of 16 rows carry a claim, 13 render the labelled blank — identical at 1440 and 390**
(server-rendered). Was 4/12; the row that left is RT FM-N1's — x-ai / `model/x-ai-grok-4-6`,
`vendor_description`, "SpaceXAI's smartest model…". The three remaining all carry numbers:
`intelligence_index_by_effort`, `observed_throughput_p50`, `internal_blind_eval`.
Δ `frontier--light--1440/390.png` VENDOR CLAIM: 4 claims / 12 hatched → 3 / 13.

**2 — lede, verbatim as shipped:** *"Vendor claims are quoted verbatim from the vendor and are
not verified by this site; a blank means no claim on file — today 13 of 16 organisations have
none."* One sentence, from `renderPlayersBoard`, directly above the board, inside
`<p class="board-lede" data-derived="frontier-board">`. Fixed copy carries **no digit**; both counts
come from the resolved rows, inside the `frontier-board` fence. It takes `.board-note`'s exact
treatment (mono, `--step--1`, `--muted`) — no new vocabulary, no literal.
**"not verified" in the first viewport: 1440 top 268.2 / bottom 308.5 of 900; 390 top 398.4 /
bottom 458.8 of 844 — both themes** (S25 stamps each theme and reads the resolved colours back).
The only copy authored (CHARTER slot 1); it also answers F-sys-3-2 / F-sys-3-3's "name the count"
without touching the door or the board.

**3 — no rule between the door's rows.** `border-bottom` dropped from `.frontier-door-row`.
`.frontier-door`'s single `border-top` stays (R8 permits the container's boundary mark drawn once).
`.board-lead` weight untouched. S24 asserts nothing about the rule and is unchanged
(`do_not_touch`);
the invariant landed in **S2**, R8's executable form, whose `/` branch now asserts BOTH directions
on one route — the ragged feed carries the rule, the door does not. Δ `home--light/dark--1440.png` rail: three hairlines between the door's rows → none.

## Declines
None. Nothing in `do_not_touch` edited: grid, columns, hatch, clamp, READ, fetch line, door order,
lead pair, nav, tokens, catalog, `.rails`, tutorials stand; S23/S24 untouched; S22 extended only
per fix 1. No content, data or copy beyond the one sentence.

## rule_changes (paired RULES.md + ui-invariants.mjs, falsified both ways)
- **R8 round-3 addendum** (two clauses) + **S2** widened + **S25** NEW. (i) the door is R8's
  forbidden side; (ii) where R8 removes a per-row mark carrying a DISCLOSURE, it is restated once
  above the surface in words. S2 break `.frontier-door-row{border-bottom:1px solid var(--rule)}` →
  fired. S25: `display:none` → fired; `position:absolute;top:4000px` → fired; per theme,
  `color:rgb(246,246,248)` → **[light] only**, `color:rgb(20,22,28)` → **[dark] only**.
- **S22 clause (d)** NEW under R13, stated over the MODEL corpus with its OWN denied-field list, so
  widening the render module's allow-list does not widen the gate. Break (allow-list
  `vendor_description` **and** drop the digit test, rebuilt) → fired with FM-N1's exact row.
  Opposite (both Sets emptied, rebuilt) → "renders ZERO claims across 16 rows".

## Falsifier honesty — 3 misses, one a REAL DEFECT IN A CHECK
1. **S22 (c) was measuring an artifact, and my change exposed it.** Line boxes were binned by
   ABSOLUTE page coordinate (`round(top / lineHeight*0.75)`): one cell measured ONE line at 1440
   (tops 519.36/520.36) and TWO at 390 (701.97/702.97) — 32.3px cell, 20.15px line height, no wrap
   either way; the bin edge moved under it when rows shifted. Rewritten to cluster rects by DISTANCE
   (60% of line height). Re-falsified: clip → fired; `white-space:normal` → 8 lines.
2. **S25 was theme-aware in prose only.** Stamping and measuring in one `evaluate` — with a forced
   reflow, then with two rAFs — the dark pass read the LIGHT ground (`--paper` already #14161c on
   `:root`, `background-color` still rgb(246,246,248)), so the dark break reported 0 of 1. Fixed
   with two round trips and a settle. Found by falsification, not review.
3. **S22 (c)'s narrow-cap opposite does not reproduce** and never violated the property: a table
   cell floors at its content's minimum — `max-width:1px` still rendered 116.5px against the
   narrowest other column at 85.5px. A width clause written for it was unfalsifiable and REMOVED
   rather than kept green. Also: allow-listing `vendor_description` alone did NOT fire — the digit
   guard held.

## Files
Changed: `app/globals.css`, `lib/render/frontier.mjs`, `loops/ui-loop/RULES.md`,
`tools/ui-invariants.mjs`. New: this report. `app/frontier/page.tsx` NOT touched (the lede is
rendered, not authored in JSX). Untouched: rig, evidence/, content/, data/, public/.

## Notes for verify
/frontier at 390 still scrolls the BOARD inside `.table-wrap` (R2's remedy, R12's expectation). The
lede's counts move with the data; its words do not. `GR-coverage-current.json` was dirty before
this round; left alone.
