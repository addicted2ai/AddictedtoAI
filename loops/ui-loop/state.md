# ui-loop — resume file (pointer, not journal)

≤8000 B; a sweep gate enforces it from round 0. Narrative and every pre-revival section live in
`state-archive.md` (the 44 KB journal the old loop kept; append-only, never edited). A fresh
process each round knows only what this file says. Every claim cites an artifact.

## Where things are (2026-09-05)

- **Revival, round 0.** Branch `ui/graph-round-0` off live `main` `4f2314e`, frozen 2026-09-05 by the
  AddictedtoAI orchestrator (Pulse task disabled, `publish: false`, tree clean, no worktrees; keeper
  created `STOP`). Commits: `2d0f3fa` port (78 files), `f08a3c6` rig (+/tutorials, /impossible-routine,
  wiki model record, 768px; freshness = presentation hash, verified 3 ways). Evidence: `baseline/`
  = main `4f2314e`, `current/` = `f08a3c6`, 90/90 each. **Keeper review page (KP1):**
  https://claude.ai/code/artifact/550cc939-50e4-4ac5-9bb8-f49071f4cbce (light, 1440+390; dark and
  768 captured, not shown). Measured there: catalog @390 went 14,974px (main, scrolling table) ->
  93,963px (branch, stacked records) — I14 in one number.
- **Port of the sandbox loop (iterations 0–9, stopped on max_iters at 8.475).** Sandbox = git-less copy of
  live `bfeb382`; merge detail in commit `2d0f3fa`. `app/robots.ts` NOT restored (live deleted it,
  `be34c70`). Screenshots never enter history.
- **Every sandbox verdict and score is VOID for live.** `RULES.md` R1–R16 and `tools/ui-invariants.mjs`
  carry; scores do not.
- Gates: `npm test` · `npm run build` (read the LOG) · `verify-design` · `verify-surfaces` ·
  `tools/ui-invariants.mjs` · `loops/ui-loop/graph/gates.mjs`. Method: graph engineering
  (`D:\shared_workspace\dean-loop-engineering-2\docs\graph-engineering-playbook.md`); plan of record:
  **keep the artifact, replace the loop** — one concept round (Frontier flagship, wiki-entry
  template, catalog@390, identity), keeper picks from a frontier. Anchors: `loops/ui-loop/graph/`.

## Live rulings (keeper, 2026-09-05; K1–K2 in the archive)

- **K3** — No merge to `main` until the keeper says everything is in order. Branch-only until then.
- **K4** — No push to the remote until done, absent a stated really good reason.
- **K5** — `STOP` and `HOLD.md` are the keeper's alone. The loop never creates or removes either.
- **K6** — Reserved paths untouched: `openspec/specs/`, `data/config.json`, `runners.yml`,
  `package.json`. Content read-only (charter slot 1). Unfreeze is the orchestrator's job, not ours.
- **K7 (delegated defaults, overturnable)** — ≤3 revision iterations then mandatory keeper check-in;
  jury (order-swapped pairwise) once, on ≤2 finalists; the 8.5 pointwise target is REPORTED, not a
  stop condition. Convergence = empty `ui-fixable` queue AND complete rig coverage AND empty
  keeper section. Judge tier Opus, implementers Sonnet (K2 stands).
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
  rubric told its judge to score "a reader's tool, not a showcase piece" and capped distinctiveness
  at impact 4 — the keeper's actual goal was never in a brief, so nine rounds optimised an
  objective the keeper did not hold. The brief carries intent; a loop cannot infer it.
- **K11** — `/frontier` MAY be prototyped on the branch; merge waits for the Desk's OpenSpec change.
- **K12 (KP1, first ever, 2026-09-05)** — Port CONFIRMED: "everything looks better changed, except
  the ai-winter wiki entry. Having the FACTS displayed first with no context makes them feel out of
  place." Finding F-K12 against the wiki-entry template (prose entries): the reader must meet the
  subject (title + one sentence of context) BEFORE any facts table; the old loop's "answer first"
  order (S14) is overruled for entries with prose bodies. Feeds BRIEF-UI-001, not a hotfix.
- **K13** — Models: concept generator + finalist jury FABLE; judges OPUS; implementers + red team
  SONNET; analyzer HAIKU; gates/scoring code. Session effort -> MEDIUM at the first dispatch.
- **K14** (delegated, 2026-09-05, after the keeper asked whether resuming locks in a narrow optimum)
  — `RULES` R1–R6 are law (site spec); **R7–R16 are the old loop's taste and CHALLENGEABLE** by a
  concept with cause, keeper rules; the port is a starting point, not a design to preserve.

## Known evidence lies (live-specific; continues JUDGE.md's L-series)

- **L7** — Seven model pages render "not published" mid-sentence (worst: `gemini-3-1-pro-preview`,
  `z-ai-glm-5-1`). Desk backlog in `DIRECTIVES.md`, pre-existing, NOT a presentation defect. A
  judge who files it has filed a content lie.
- **L8** — Two concurrent `next build`s share `.next/`, die with `ENOENT pages-manifest.json`: process
  defect, not content. One build at a time.

## Failure modes to guard

- Concurrent writers: confirm quiescence before capturing; only this loop writes during the freeze.
- Keeper items age. An item open 3 rounds FAILs the sweep (builder F17). Instrument work is never
  the answer to a blocked ruling.
- A gate that can see nothing fails: rig coverage (routes × viewports × themes named by each judge
  contract) is checked BEFORE any judge spawns.
- Two writers, one judge, one score: never again. Judges are scoped by oracle; code totals.
- **Build lock with a reused pid** (2026-09-05): a stale `atai-build-locks/*.lock` named a pid Windows
  had reused for OUR shell; the build waited on itself, then would have gated a STALE `out/`. Compare
  the lock's `started` to the pid's creation time; remove only with no build process alive.
- **This file was committed over budget twice** (8394, 8316 B). `gates.mjs` now FAILs it; run before commit.

## Next (keeper decisions)

1. ~~Anchors read, GO given (2026-09-05).~~ Round 1 running. [r0]
2. Catalog at 390px: choose from the round-1 concept frontier (supersedes the delegated I14). [r0]
3. Rule challenges under K14, as concepts raise them: retire, amend, or keep each. [r0]

## Next (loop work, in order)

1.–6. Port `2d0f3fa`, rig `f08a3c6`, baseline, anchors, brief, GO: all done (archive has detail).
7. **Round 1 (concept).** Packets `CP-UI-001-1..4` committed `efa1b35` (Dated Ledger, Players Board,
   Proof Rail, Provenance Gutter; all pass `gates.mjs --packet`). Panel dispatched 2026-09-05:
   judge-hierarchy + judge-system (Opus) → `JV-hier|sys-CP-UI-001-n-1.json`; red-team (Sonnet) →
   `RT-CP-UI-001-n-1.md`. If resuming: check which of those 12 files exist; re-dispatch only the
   missing ones (independence: never show a judge a sibling's verdict).
8. Validate verdicts (`gates.mjs --jv … --contract …`), `score.mjs <packet> 1 --round 1` dry then
   `--write`, disagreement-analyzer (Haiku) → `DR-*`; keeper-tagged items to the section above.
9. Concept page for the keeper: four bets flat, scores reported never collapsed, rule challenges
   listed. Keeper picks ≤2 finalists (K7) → implementers (Sonnet) on `ui/concept-<n>`.
