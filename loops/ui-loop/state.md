# ui-loop — resume file (pointer, not journal)

≤8000 B; a sweep gate enforces it from round 0. Narrative and every pre-revival section live in
`state-archive.md` (the 44 KB journal the old loop kept; append-only, never edited). A fresh
process each round knows only what this file says. Every claim cites an artifact.

## Where things are (2026-09-05)

- **Revival, round 0** (2026-09-05): `ui/graph-round-0` off live `main` `4f2314e` (frozen by the
  orchestrator; Pulse off, `publish: false`; keeper's `STOP`). `2d0f3fa` port of the sandbox loop
  (iters 0–9; sandbox = live `bfeb382`; `app/robots.ts` not restored), `f08a3c6` rig. Evidence:
  `baseline/` = main, `current/` = `f08a3c6`, 90/90. KP1 page:
  https://claude.ai/code/artifact/550cc939-50e4-4ac5-9bb8-f49071f4cbce. Catalog @390: 14,974px (main)
  -> 93,963px (branch) = I14 in one number. Sandbox scores VOID for live; R1–R16 + invariants carry.
- Gates: `npm test` · `npm run build` (read the LOG) · `verify-design` · `verify-surfaces` ·
  `tools/ui-invariants.mjs` · `graph/gates.mjs`. Method: graph engineering (playbook in
  `D:\shared_workspace\dean-loop-engineering-2\docs\`). Anchors `loops/ui-loop/graph/`.

## Live rulings (keeper, 2026-09-05; K1–K2 in the archive)

- **K3** — No merge to `main` until the keeper says everything is in order.
- **K4** — No push to the remote until done, absent a good reason.
- **K5** — `STOP` and `HOLD.md` are the keeper's alone; the loop never touches either.
- **K6** — Reserved paths untouched: `openspec/specs/`, `data/config.json`, `runners.yml`,
  `package.json`. Content read-only (charter slot 1). Unfreeze is the orchestrator's.
- **K7 (delegated defaults)** — ≤3 revisions then keeper check-in; jury (order-swapped pairwise) once,
  on ≤2 finalists; 8.5 target REPORTED, not a stop.
- **K8** — `STOP` is the keeper's. **K9** — Reader test: the keeper alone.
- **K10 — THE BRIEF'S CENTRE (keeper, verbatim in substance).** "A shining example of what
  frontier AI can do when handed the reins. I want people to be truly amazed at the quality of the
  site, and even more so once they realize a human didn't write any of it." Layout "ok, but a bit
  mechanical … great for machine reading (also important!) but not very alluring or exciting for a
  human." → identity and allure are PRIMARY; findability, WCAG AA, 320px reflow, 150 KB, machine-
  readability, content above the fold are the FENCE. The old rubric scored "a reader's tool, not a
  showcase": nine rounds optimised an objective the keeper did not hold.
- **K11** — `/frontier` MAY be prototyped on the branch; merge waits for the Desk's OpenSpec change.
- **K12 (KP1)** — Port CONFIRMED except the ai-winter entry ("FACTS displayed first with no context …
  out of place"). F-K12: on prose entries the reader meets the subject BEFORE any facts table.
- **K13** — Models: generator + jury FABLE; judges OPUS; implementers + red team SONNET; gates/scoring
  code; session effort MEDIUM for dispatch. **K15**: analyzer HAIKU -> SONNET (capabilities worlds apart).
- **K14** (delegated, 2026-09-05) — `RULES` R1–R6 are law; **R7–R16 are the old loop's taste and
  CHALLENGEABLE** by a concept with cause, keeper rules; the port is a start, not a design to keep.
- **Check-in rulings (keeper, 2026-09-05).** **K35** one narrow 4th iteration authorised (`RD-003`:
  claim allow-list; visible "not verified" lede; door hairlines). **K36** reader tests SKIPPED: MR-UI-
  001..003 retired by the keeper; CAL-UI-001 not required before merge. **K37** implementer tier OPUS
  for all (K13 amended). **K38** domain vocabulary: "general" is the unmarked default, `text` is not a
  tag. **K39** DESK-ORDER-001 and the DIRECTIVES lines signed off; merge (K3), push (K4) and handoff
  (K31) authorised after RD-003 passes. **K40** blanket delegation while the keeper is away. **K41**
  (under K40): RT FM-N3 (a measured throughput rendered as a VENDOR CLAIM) → `RD-004` before merge.
  **K42** (under K40): `RD-005` micro-fix (vendor name first in the claim cell; eTLD+1 host match), then
  merge. v5: 88.3, zero RT criticals, hard gates pass; HIER/DENS/RESP under 8 are next-brief items.
  **K43** (keeper, 2026-09-05): "Make this the last iteration! Address any findings directly and begin
  the handoff process after." Iteration 6 is final; findings are fixed directly, no further RD.
  **K44** (under K40, answers to the orchestrator 2026-09-05): F2 records may describe a publisher's
  rescoring qualitatively (no values) under K24; §3 gets an implementation line, seeded `domains` are
  machine-maintained (beside `timeline`), editorial ones go through review; the vendor-claim record
  lives BESIDE the entry as its own OpenSpec change, source host + tri-state `verified`.
- **Round-2 rulings (2026-09-05; K23 keeper, K24–K29 delegated).** **K23** PLAYERS BOARD carried
  forward; Dated Ledger's branch kept as a record. **K24** index columns only when a registry index
  exists. **K25** the nav discharges K19 at 390. **K26** door rows by most-recent change. **K27** PB's
  S13/S14/S18 rewrite ratified; R13's 60% floor holds. **K28** catalog@390 flat two-line stack (I14).
  **K29** RD-002 on OPUS. K7 check-in held; RD-002 = iteration 3.
- **K30 (keeper, 2026-09-05).** Frontier domain section = scout-flagged, domain-tagged EDITORIAL
  records (`frontier: true`, `frontier_reason: F1–F5`, `domains`), 3 most recent per domain; index
  leaders secondary where licensed; flagged stories exempt from the 3/day cap, not the budget;
  feeds are the scout's radar, never display. Spec `knowledge/DESK-ORDER-001.md` §1; UI: next brief.
- **Round-1 rulings (keeper, 2026-09-05).** **K16** a typeface decision is required (inheriting the
  stack is not one). **K17** finalists CP-UI-001-1 Dated Ledger + CP-UI-001-2 Players Board. **K18**
  R13 rail-track addendum; R7 board clarification. **K19** the Frontier LEADS with a players board.
  **K20** a finalist names a treatment for EVERY template. Worktrees `D:\AddictedtoAI-c1`
  (`ui/concept-1`), `-c2` (`ui/concept-2`). **K21** board membership is EDITORIAL, never feed-gated;
  feeds fill cells; no label assumes one source. **K22** a closed, small `domain` facet joins the Desk
  order (`EN-domain-facet.md`); the graph ASSUMES it: finalists absorb a domain as data, no template edit.

## Known evidence lies

L7 (model pages render "not published": Desk backlog, never a UI finding), L8 (concurrent builds
ENOENT): text in `state-archive.md`; also `JUDGE.md` L1–L8. Binding.

## Failure modes to guard

Binding; text in `state-archive.md`: build-lock pid reuse; keeper items age (F17); a gate that sees
nothing fails; judges scoped by oracle, code totals; this file over budget (now 4×) — check first.

## Next (keeper decisions)

1. Nothing open for the keeper (K35–K43 closed rounds 3–6; struck items in `state-archive.md`). Next
   brief (BRIEF-UI-002, keeper-drafted when back): wiki entry's empty right half at 1440 (F-hier-7),
   catalog at 768 (JV-struct q5), claim clamp eats the value (JV-sys v6 downstream), Frontier domain
   section once DESK-ORDER-001 §1 data exists. [r6]

## Next (loop work, in order)

1.–10. Rounds 0–6 done 2026-09-05 (six iterations). **MERGED to `main` @ `b6ac95d`, pushed** with the
   three record branches; gates on main green (build, verify-design 46/46, surfaces, invariants 24/24,
   tests 1229). Final `SCORE-CP-UI-001-2-6` 88.3, zero RT criticals. Handoff ACCEPTED (K31); STOP
   removed (K33); Desk running, publish still false; K44 in DIRECTIVES (4578d8a). Machinery at its 10%
   ceiling → specs, backfill, rights, org entries first; implementations when the window rolls.
11. Next: BRIEF-UI-002 when the keeper drafts it. This session answers the orchestrator; K32 applies.
