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
- **Port of the sandbox loop (iterations 0–9, stopped on max_iters at 8.475).** Sandbox was a git-less
  copy of live `bfeb382`. 7 loop-only files copied; 4 three-way merged; 2 conflicts resolved
  (`app/globals.css`: both comment blocks kept; `scripts/verify-design.mjs`: LIVE's derived
  focus-sweep bound kept, the loop's fixed 2000 cap dropped as superseded). `app/robots.ts` NOT
  restored — live deleted it deliberately (`be34c70`). Screenshots never enter history (`.gitignore`).
- **Every sandbox verdict and score is VOID as evidence for live.** `RULES.md` R1–R16 and
  `tools/ui-invariants.mjs` carry; scores do not. Round 0 is a fresh baseline on the ported build.
- Gates, in order: `npm test` · `npm run build` (read the LOG, never the exit code) ·
  `scripts/verify-design.mjs` · `scripts/verify-surfaces.mjs` · `tools/ui-invariants.mjs`.
  Latest result: `eval-log.md`, last entry.
- Method: graph engineering per `D:\shared_workspace\dean-loop-engineering-2\docs\graph-engineering-playbook.md`.
  Plan of record (2026-09-05, keeper: "I trust your judgement"): **keep the artifact, replace the
  loop** — port, then ONE concept round on the questions an item-fixing loop cannot answer
  (catalog at 390px; wiki-entry template, 495 pages; visual identity), keeper picks from a frontier.

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
- **K8** — STOP file created by the keeper (2026-09-05). Keeper will review screenshot pairs.
- **K9** — Reader test: the keeper alone. Recorded as weaker evidence than strangers; still the
  only human measurement the loop has. No usage ceiling "within reason"; keeper flags rate limits.
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

## Known evidence lies (live-specific; continues JUDGE.md's L-series)

- **L7** — Seven model pages render "not published" mid-sentence (worst: `gemini-3-1-pro-preview`,
  `z-ai-glm-5-1`). Desk backlog in `DIRECTIVES.md`, pre-existing, NOT a presentation defect. A
  judge who files it has filed a content lie.
- **L8** — Two concurrent `next build`s share `.next/` and die with `ENOENT pages-manifest.json`.
  Looks like a content defect; is a process one. One build at a time, always.

## Failure modes to guard

- Concurrent writers (iter-02): confirm quiescence before capturing evidence. During the freeze
  only this loop writes to the tree.
- Keeper items age. An item open 3 rounds FAILs the sweep (builder F17). Instrument work is never
  the answer to a blocked ruling.
- A gate that can see nothing fails: rig coverage (routes × viewports × themes named by each judge
  contract) is checked BEFORE any judge spawns.
- Two writers, one judge, one score: never again. Judges are scoped by oracle; code totals.
- **Build lock with a reused pid** (2026-09-05): `atai-build-locks/*.lock` named a pid that Windows
  had reused for OUR shell, so the build waited on itself for 10 min, then would have run the
  browser gates against a STALE `out/`. Check the lock's `started` against the pid's creation time;
  remove only when no `prebuild`/`next build` process exists. Never run two builds; never trust
  `out/` you did not just build.
- Orphan `serve-static out 3000` (pid 6416, since 2026-08-29) is not ours; harmless (rig uses free
  ports, verify-design uses 3111). Orchestrator's to clean on unfreeze.

## Next (keeper decisions)

1. **KP1: confirm the port** from the review page above (or name any pair where After is worse).
2. **K11 (proposed): allow the graph to prototype `/frontier` on the branch** — charter slot 1 forbids
   new routes; merge waits for the Desk's OpenSpec change (`addictedtoai-s8gz`, plan + sealed review in
   the orchestrator scratchpad; review verdict "build with changes", blocker = hash-chain immutability).
   Keeper 2026-09-05: the plan over-indexed on provable claims (verif- 70, benchmark 60, reader 4,
   visual/visitor/excite 0 in 983 lines; timeline = AA-index lead changes, not releases). The Frontier
   is the concept round's FLAGSHIP surface; keeper inputs: players board (lab x frontier model x claimed
   verbatim/labelled x independently verified), release-cadence compression, new abilities, no hype.
3. **Models + effort** (asked to be discussed before any dispatch): proposal in the 2026-09-05 chat;
   open question whether the concept generator runs on Fable rather than Opus. Session effort to
   MEDIUM before the first dispatch (agents inherit it).
4. Catalog at 390px: choose from the round-1 concept frontier (supersedes the delegated I14 ruling).

## Next (loop work, in order)

1. ~~Gates green → port commit~~ `2d0f3fa`. 2. ~~Rig~~ `f08a3c6`. 3. ~~Baseline + review page~~ done.
4. Anchors, as FILES for the keeper to read before anything runs: 3 judge contracts scoped by oracle
   (screens: hierarchy/density/chrome test; DOM+screens: tables/responsive; contact sheet+tokens:
   type/colour/family/identity) + red team + code scoring (PASS/total, critical caps, anchored
   fallback, ANDed stop) + rig-coverage gate + size gate + keeper-item ageing gate.
5. `BRIEF-UI-001`: K10 centre; Frontier flagship (K11); catalog@390; wiki-entry template; fence =
   site spec design bar + R1–R16; anti-req: no content edits, no rubric edits in-round, no single
   third-party index dependency (AA licence open, `addictedtoai-ego8`), digit-free fixed copy.
6. Round 1 only after: KP1 confirmed, K11 ruled, models confirmed, session at medium effort.
