# ui-loop — resume file (pointer, not journal)

≤8000 B; a sweep gate enforces it from round 0. Narrative and every pre-revival section live in
`state-archive.md` (the 44 KB journal the old loop kept; append-only, never edited). A fresh
process each round knows only what this file says. Every claim cites an artifact.

## Where things are (2026-09-05)

- **Revival, round 0.** Branch `ui/graph-round-0` off live `main` `4f2314e`, frozen 2026-09-05 by the
  AddictedtoAI orchestrator (Pulse task disabled, `publish: false`, tree clean, no worktrees).
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

## Next (keeper decisions)

1. Confirm the port from before/after screenshot pairs (KP1, firing for the first time). Link follows.
2. Catalog at 390px: choose from the round-1 concept frontier (supersedes the delegated I14 ruling).
3. Readers for the find-task test: who and when.

## Next (loop work, in order)

1. Gates green on the port → commit on the branch (no push, K4).
2. Rig: add `/tutorials`, `/impossible-routine`, the 768px band; content-hash freshness stamp
   (replaces the wall clock, L6).
3. Round-0 baseline capture on the ported build; keeper pair-review page.
4. Anchors: 3 judge contracts scoped by oracle + red team + code scoring + rig-coverage gate +
   size gate; `BRIEF-UI-001` (requirements, anti-requirements, mandatory first steps).
