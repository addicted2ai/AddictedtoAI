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
  `D:\shared_workspace\dean-loop-engineering-2\docs\`); **keep the artifact, replace the loop**:
  one concept round, keeper picks from a frontier. Anchors: `loops/ui-loop/graph/`.

## Live rulings (keeper, 2026-09-05; K1–K2 in the archive)

- **K3** — No merge to `main` until the keeper says everything is in order. Branch-only until then.
- **K4** — No push to the remote until done, absent a stated really good reason.
- **K5** — `STOP` and `HOLD.md` are the keeper's alone. The loop never creates or removes either.
- **K6** — Reserved paths untouched: `openspec/specs/`, `data/config.json`, `runners.yml`,
  `package.json`. Content read-only (charter slot 1). Unfreeze is the orchestrator's job, not ours.
- **K7 (delegated defaults)** — ≤3 revisions then keeper check-in; jury (order-swapped pairwise) once,
  on ≤2 finalists; 8.5 target REPORTED, not a stop. Convergence = empty `ui-fixable` queue AND full
  rig coverage AND empty keeper section.
- **K8** — `STOP` created by the keeper 2026-09-05. **K9** — Reader test: the keeper alone. No usage
  ceiling "within reason".
- **K10 — THE BRIEF'S CENTRE (keeper, verbatim in substance).** "A shining example of what
  frontier AI can do when handed the reins. I want people to be truly amazed at the quality of the
  site, and even more so once they realize a human didn't write any of it." Layout "ok, but a bit
  mechanical … great for machine reading (also important!) but not very alluring or exciting for a
  human." → identity and allure are PRIMARY; findability, WCAG AA, 320px reflow, 150 KB, machine-
  readability, content above the fold are the FENCE. The old rubric scored "a reader's tool, not a
  showcase": nine rounds optimised an objective the keeper did not hold.
- **K11** — `/frontier` MAY be prototyped on the branch; merge waits for the Desk's OpenSpec change.
- **K12 (KP1, 2026-09-05)** — Port CONFIRMED except the ai-winter entry: "FACTS displayed first with
  no context … feel out of place." F-K12: on prose entries the reader meets the subject (title + one
  sentence) BEFORE any facts table; the old "answer first" order (S14) is overruled there.
- **K13** — Models: concept generator + finalist jury FABLE; judges OPUS; implementers + red team
  SONNET; gates/scoring code. Session effort -> MEDIUM at the first dispatch. **K15** (2026-09-05):
  analyzer HAIKU -> SONNET from the next run (keeper: capabilities worlds apart; contract edit between rounds).
  JV budget 9000 was binding for all 8 r1 verdicts: re-baseline once, between rounds.
- **K14** (delegated, 2026-09-05) — `RULES` R1–R6 are law; **R7–R16 are the old loop's taste and
  CHALLENGEABLE** by a concept with cause, keeper rules; the port is a start, not a design to keep.
- **Round-2 rulings (2026-09-05; K23 keeper, K24–K29 delegated: "defer to you").** **K23** carry
  PLAYERS BOARD forward; Dated Ledger's branch stays as a frontier record, RD-001 not run. **K24**
  index columns appear only when a registry index exists (Desk order); until then the board carries
  catalog-derived columns. **K25** the nav item discharges K19 at 390 (AR-001 D3). **K26** door rows
  by most-recent change: a data ordering, not a content edit. **K27** PB's S13/S14/S18 rewrite
  ratified; R13's 60% floor holds (AR-001 D4; RD-002 fix 4). **K28** catalog@390 = flat two-line
  stack, every row in the document (I14 Ctrl-F clause); more density is a later brief. **K29** the
  RD-002 revision runs on OPUS (7 ledger entries, semantic class recurring); ledger continues. K7
  check-in held here; RD-002 is iteration 3 of 3 — hard stop after it regardless of score.
- **Round-1 rulings (keeper, 2026-09-05).** **K16** typeface: "open to change" → judge-system's
  reading stands (inheriting the stack is not a decision); each finalist names a self-hosted face
  with licence, or argues the stack as a choice. **K17** finalists: `CP-UI-001-1` Dated Ledger and
  `CP-UI-001-2` Players Board (CP-3, CP-4 not built; their rule items moot).
  **K18** R13 rail-track addendum (a); R7 board clarification (b, delegated). **K19** "No": the
  Frontier LEADS with a players board (K11 stands); Dated Ledger's per-index spine must read as one.
  **K20** (delegated) family: a finalist names a treatment for EVERY template; "unchanged, because"
  is allowed. Worktrees `D:\AddictedtoAI-c1` (`ui/concept-1`), `-c2` (`ui/concept-2`). **K21** board
  membership is EDITORIAL, never feed-gated: a player is on the board because the site covers it;
  feeds fill cells; no label assumes one source. **K22** a closed, small cross-cutting `domain` facet
  (models/orgs/tools/indices) joins the **Desk order** (post-pick note: Frontier data, K21 coverage,
  K22); Opus research → `graph/knowledge/EN-domain-facet.md`; keeper picks. The graph ASSUMES the
  facet: finalists absorb a domain as data (column/filter/row), no template edit — jury question.

## Known evidence lies

L7 (model pages render "not published": Desk backlog, never a UI finding), L8 (concurrent builds
ENOENT): text in `state-archive.md`; also `JUDGE.md` L1–L8. Binding.

## Failure modes to guard

Binding; text in `state-archive.md`: build-lock pid reuse; keeper items age (F17); a gate that sees
nothing fails; judges scoped by oracle, code totals; this file over budget (now 4×) — check first.

## Next (keeper decisions)

1. MR-UI-001..003 on the revised Players Board preview (MR-UI-001 must include a hatched blank). [r3]
2. After the K7 hard stop: merge decision (K3), push decision (K4), Desk-order note sign-off. [r3]
3. **K30?** "top 3 models per domain" section on /frontier (keeper, 2026-09-05): ruling pending. [r3]

## Next (loop work, in order)

1.–9. Port, rig, anchors, brief, round 1 (concepts), round 2 (both finalists built, panelled, scored,
   jury with no collapse, `RD-001`/`RD-002`/`AR-001`): done; detail in `state-archive.md` + commit log.
   Finalists page: https://claude.ai/code/artifact/4c3688bb-c784-4e64-8bcf-e28f5aa29994
10. **Round 3 (revision), 2026-09-05.** RD-002 on `ui/concept-2` (D:\AddictedtoAI-c2, port 3112),
   implementer OPUS (K29) → `IR-CP-UI-001-2-2` → re-capture c2 → ONLY RD-002's re_evaluate judges
   (anchored on the v2 verdicts) + red-team anchored FM1–3 → `score.mjs CP-UI-001-2 3 --round 3 --prev
   SCORE-CP-UI-001-2-2` → K7 hard stop: present to the keeper → MRs → merge decision → Desk note
   (K21, K22, K24, Frontier data; `EN-domain-facet.md` questions).
