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
- **K8** — `STOP` created by the keeper 2026-09-05. **K9** — Reader test: the keeper alone (weaker
  than strangers, still the only human measurement). No usage ceiling "within reason".
- **K10 — THE BRIEF'S CENTRE (keeper, verbatim in substance).** "A shining example of what
  frontier AI can do when handed the reins. I want people to be truly amazed at the quality of the
  site, and even more so once they realize a human didn't write any of it." Content largely liked.
  Layout "ok, but a bit mechanical"; "great for machine reading (also important!) but not very
  alluring or exciting for a human." → Visual identity and human allure are PRIMARY requirements
  of `BRIEF-UI-001`, not a capped afterthought. Findability, WCAG AA, 320px reflow, 150 KB payload,
  machine-readability and "content above the fold, decoration never displaces information"
  (`openspec/specs/site` design bar) are the FENCE: never worse. **Lesson recorded:** the old
  rubric scored "a reader's tool, not a showcase piece" and capped distinctiveness at impact 4;
  the keeper's goal was never in a brief, so nine rounds optimised the wrong objective.
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
- **Round-1 rulings (keeper, 2026-09-05).** **K16** typeface: "open to change" → judge-system's
  reading stands (inheriting the stack is not a decision); each finalist names a self-hosted face
  with licence, or argues the stack as a choice. **K17** finalists: `CP-UI-001-1` Dated Ledger and
  `CP-UI-001-2` Players Board (Proof Rail, Provenance Gutter not built; their rule items moot).
  **K18** R13 rail-track addendum (a); R7 board clarification (b, delegated). **K19** "No": the
  Frontier LEADS with a players board (K11 stands); Dated Ledger's per-index spine must read as one.
  **K20** (delegated) family: a finalist names a treatment for EVERY template; "unchanged, because"
  is allowed. Worktrees `D:\AddictedtoAI-c1` (`ui/concept-1`), `-c2` (`ui/concept-2`). **K21** board
  membership is EDITORIAL, never feed-gated: a player is on the board because the site covers it;
  feeds fill cells; no label assumes one source. **K22** a closed, small cross-cutting `domain` facet
  (models/orgs/tools/indices) joins the **Desk order** (post-pick note: Frontier data, K21 coverage,
  K22); vocabulary researched by Opus → `graph/knowledge/EN-domain-facet.md`; keeper picks it.

## Known evidence lies (live-specific; continues JUDGE.md's L-series)

- **L7** — Seven model pages render "not published" mid-sentence (worst: `gemini-3-1-pro-preview`,
  `z-ai-glm-5-1`). Desk backlog in `DIRECTIVES.md`, pre-existing, NOT a presentation defect. A
  judge who files it has filed a content lie.
- **L8** — Two concurrent `next build`s share `.next/`, die with `ENOENT pages-manifest.json`: process
  defect, not content. One build at a time.

## Failure modes to guard

- Keeper items age: open 3 rounds FAILs the sweep (F17). Instrument work never answers a blocked ruling.
- A gate that can see nothing fails: rig coverage (routes × viewports × themes named by each judge
  contract) is checked BEFORE any judge spawns.
- Two writers, one judge, one score: never again. Judges are scoped by oracle; code totals.
- **Build lock with a reused pid** (2026-09-05): compare the lock's `started` to the pid's creation
  time; remove only with no build process alive (else it gates a STALE `out/`).
- **This file was committed over budget twice** (8394, 8316 B). `gates.mjs` now FAILs it; run before commit.

## Next (keeper decisions)

1. ~~Anchors read, GO given (2026-09-05).~~ Round 1 running. [r0]
2. ~~Round-1 rulings 1–8~~ → K16–K20 (concept page
   https://claude.ai/code/artifact/0242a21f-b528-4116-9ee4-ed9ae7c11551). [r1]
3. Schedule MR-UI-001..003 (find-tasks; hatched blank; spine cadence) once finalist captures exist. [r1]

## Next (loop work, in order)

1.–6. Port `2d0f3fa`, rig `f08a3c6`, baseline, anchors, brief, GO: all done (archive has detail).
7. **Round 1 (concept).** Packets `CP-UI-001-1..4` committed `efa1b35` (Dated Ledger, Players Board,
   Proof Rail, Provenance Gutter; all pass `gates.mjs --packet`). Panel dispatched 2026-09-05:
   judge-hierarchy + judge-system (Opus) → `JV-hier|sys-CP-UI-001-n-1.json`; red-team (Sonnet) →
   `RT-CP-UI-001-n-1.md`. If resuming: check which of those 12 files exist; re-dispatch only the
   missing ones (independence: never show a judge a sibling's verdict).
8. ~~Verdicts, scores, DRs, concept page, rulings~~ done. 9. **Finalist builds running** (Sonnet,
   `contracts/implementer.md`): c1 port 3111, c2 port 3112; one `next build` at a time via the lock.
   Then: rig captures per worktree incl. /frontier → `--coverage` → full panel (3 judges + red team)
   → score → DR → jury (Fable, order-swapped) → keeper pick → ≤3 revisions → MRs → merge decision (K3).
