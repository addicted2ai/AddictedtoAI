# AddictedtoAI UI loop — Charter

The specification of the `ui-loop` loop. Eight slots, decided in the builder
interview on 2026-08-31; every other loop file derives from them. Keeper rulings outrank
this charter: a ruling that contradicts it is recorded here as an edit with its
reasoning, never smuggled past it as an exception.

## The eight slots

| # | Slot | Decision |
|---|---|---|
| 1 | Artifact | the presentation layer of the AddictedtoAI static site - how it looks and lays out, never what it says — lives at `app/globals.css`, `app/layout.tsx`, the JSX STRUCTURE of `app/**/page.tsx`, and `app/_components/*.tsx`. Read-only to this loop: `content/`, `data/`, `public/`, and every string of user-facing copy inside JSX; target unit: one presentation surface - either the shared design system (`globals.css` + `layout.tsx`) or one page template per implementer (the file-conflict boundary). |
| 2 | Oracle stack | See table below. |
| 3 | Normative source | `loops/ui-loop/RULES.md`, cited as `RULES.md R4`. Rule numbers are an API: never renumber, retire to tombstones. Every accepted invariant becomes a numbered rule there. |
| 4 | Rubric | First-read hierarchy, Chrome restraint, Information density, List and table craft, Typographic system, Colour discipline, Family coherence, Responsive integrity, Accessibility, Payload discipline, Visual distinctiveness; overall target 8.5; capped contributors: Visual distinctiveness (item impact ceiling 4). |
| 5 | Stateful resource | None. Each evidence run starts its own static server on its own port, so verify parallelises and no phase is serialised behind a shared resource|
| 6 | Gates | Iteration: `npm run build` completes with a written `out/` (read the LOG, never the exit code - a piped build reports the pipe's status and has already masked a real failure in this project), and `node scripts/verify-design.mjs` exits 0. Loop: overall ≥ 8.5, or zero `ui-fixable` items remain, or max_iters 6. |
| 7a | Keeper, and fallback | Held by the user. **The user has delegated ruling authority for this experiment ("I'll leave it up to your judgement, this is all an experiment"), so the orchestrator decides at keeper gates and records each as `keeper-by-delegation` in `state.md` with its reasoning, reviewable and reversible.** Escalate and WAIT only for what is irreversible, outside this sandbox, or outside the delegation. A gate nobody is available to answer stops the loop — that is a spin signature, not caution. Recorded because the orchestrator got this wrong: it stalled iteration 3 asking for a rubric ruling already delegated twice. |
| 7 | Keeper points | | id | When | What only the keeper can do |
|---|---|---|
| KP1 | Before any RESTRUCTURE commits. **Blocking.** | Approve the change from its before/after screenshot pair. Refinements do not need this. A restructure can pass axe, reflow, payload and traversal while being worse for a reader - this review is the only thing in the loop that can see that. |
| KP2 | Each verdict | Trim the item list. The judge over-files; the keeper decides what is worth a round trip. |
| KP3 | Each final report | Close or re-prioritise `keeper-gate` items. The loop cannot close them and must never re-file them as actionable. |
| KP4 | Whenever the rubric feels wrong | Change the rubric, the benchmarks or the cap. The loop may not re-weight its own scoring: a loop that grades its own exam sets its own grade. | |
| 8 | Out-of-loop class | `keeper-gate`: findings this loop cannot close by changing presentation. Two subclasses, both queued and neither ever re-filed as actionable: `content` - the fix requires changing what a page says or which pages exist, which slot 1 forbids absolutely; and `reader` - the finding turns on whether a real person can find what they came for, which no screenshot answers. Closed by the keeper; queued in every final report, never re-filed as actionable. |

## Oracle stack

Cheapest first; the blind-spot column is binding on the judge (no property is judged
from a source declared invalid for it).

| Source | Cost | Valid for | Lies about / blind to |
|---|---|---|---|
| axe-core, both themes, every sampled route | cheap | contrast, labels, roles, keyboard traps | anything visual that is not a violation - it cannot see ugly |
| 320px reflow probe | cheap | horizontal page overflow | overflow inside a container, which is correct by design |
| gzipped first-load JS against the 150 KB bound | cheap | payload discipline | perceived speed, layout cost |
| screenshots, per route x theme x viewport | medium | hierarchy, density, rhythm, proportion, list and table craft, coherence | hover and focus states, anything below the captured fold, motion, and whether a restructure broke a reader's intent |
| before/after screenshot pairs | medium | whether a change improved the page or merely altered it | the same blind spots as above, but it removes taste drift between runs |
| keyboard and focus-ring traversal | medium | reachability, focus visibility | whether the tab ORDER is sensible |

Freshness check (opens every iteration): `git status --porcelain app/` is clean AND every PNG under `loops/ui-loop/evidence/` is newer than the newest file under `app/`. Both true means the filed evidence is current and the judge runs with no build at all.
Refresh procedure: `npm run build` (check the LOG, not the exit code), then `node tools/ui-evidence.mjs`, which serves `out/` on its own port and captures every sampled route x theme x viewport into `loops/ui-loop/evidence/`.

## Kill criteria

The loop stops, permanently or for keeper review, when any of these holds:

1. **Converged** — zero new `ui-fixable` items filed; hand the out-of-loop queue to
   the keeper. Convergence is an empty item queue, not a high score.
2. **Spinning** — any two spin signatures (listed in the loop skill's spin check) hold
   for three consecutive iterations.
3. **Uneconomic** — the keeper judges cost per resolved item to exceed its value.
4. **Oracle degraded** — the evidence stack no longer satisfies independence (an
   evidence source turned out to be derivable by the implementer), until repaired.

## Copies

Sections of the agent files that are instantiated copies of this charter — a change
here regenerates them:

| Charter content | Copied into |
|---|---|
| Oracle stack table + validity rules | JUDGE.md § Evidence |
| Rubric, caps, target | JUDGE.md § Rubric |
| Iteration gate | IMPLEMENT.md contract; loop skill Phase 5 |
| Tags and routing | JUDGE.md § Items; loop skill Phase 3 |
| Keeper points | loop skill § Keeper points |
