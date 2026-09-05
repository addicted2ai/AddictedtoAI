---
name: ui-loop
description: Run the judge→implement→verify→re-judge improvement loop over the presentation layer of the AddictedtoAI static site - how it looks and lays out, never what it says. Use when the user asks to run an evaluation pass, raise its score, or iterate on its quality. Args: [target=8.5] [max_iters=6] [auto] [scope=<presentation surface - either the shared design system (`globals.css` + `layout.tsx`) or one page template>|all].
---

# AddictedtoAI UI loop — improvement loop

Judge the presentation layer of the AddictedtoAI static site - how it looks and lays out, never what it says from evidence, implement the judge's items, verify, refresh evidence,
re-judge. Defaults: `target=8.5`, `max_iters=6`, interactive
(pause after each verdict for the keeper to pick items; `auto` takes all in-loop items,
highest impact first), `scope=all`.

You are the ORCHESTRATOR.
There is no stateful resource in this loop: each evidence run starts its own static
server on its own port, so every agent phase may run in parallel.

Rule numbers are an API: cite them (`ui-loop L3`), never renumber, retire numbers
as tombstones.

- **L1.** The problem is authoritative; the prescription is a hypothesis. Track the
  ratio in `loops/ui-loop/state.md` § Measured trust asymmetry.
- **L2.** Update `loops/ui-loop/state.md` at the end of every phase. It is the handoff:
  this loop outlives any one context window, and an iteration whose only record is your
  context gets redone.
- **L3.** Review every decline yourself and re-derive its arithmetic — a decline is
  sometimes the implementer dodging work.
- **L4.** Never send an implementer to change the artifact over a defect the judge could
  not see; that is an `evidence-fix`, and it is yours.
- **L5.** Verify evidence identity before filing it: correct target, current version,
  no timeout in the producing step.
- **L6.** Pass `model` EXPLICITLY on every agent spawn; never omit it and let it resolve by
  inheritance. A run whose model is unknown cannot be attributed to an instrument, and a
  verdict that cannot be attributed cannot anchor anything. Changing the pinned model
  retires the noise floor (state.md § Noise floor).

## Phase 0 — Resume

Read `loops/ui-loop/state.md` first, every session, before anything else. It names the
iteration, phase, open items, declines carried, and what is blocked on the keeper.
If iteration 0 has not run: this first pass is evidence + a baseline verdict scored from
scratch (no anchor exists). Recommended once: run two judges over identical evidence and
record the spread in `state.md` § Noise floor — a later delta smaller than the spread is
noise, not progress.

## Phase 1 — Evidence freshness (cheapest first)

Check whether cached evidence is current: `node tools/ui-evidence.mjs --hash` prints the content hash of the built `out/` (build stamp normalised away), and it must EQUAL `contentHash` in `loops/ui-loop/evidence/current/manifest.json`. Equal means the filed evidence is current and the judge runs with no capture at all. (Revival round 0, 2026-09-05: this replaces the wall-clock rule — file mtimes and `buildStamp` moved on every mandated rebuild even when nothing changed, so the old check manufactured a fatal mismatch, L6/I48.) All fresh → skip to
Phase 2 at zero evidence cost. Any stale → refresh via `npm run build` (check the LOG, not the exit code), then `node tools/ui-evidence.mjs`, which serves `out/` on its own port and captures every sampled route x theme x viewport into `loops/ui-loop/evidence/`, and apply
L5 to everything produced. If the artifact changed substantially outside the loop since
the last verdict, declare a re-baseline in `state.md`: the anchor is void, and the next
score may fall — that is measurement, not regression.

## Phase 2 — Judge

Spawn a judge agent (**Opus 5**, passed explicitly per L6) with `loops/ui-loop/JUDGE.md` as its full
instructions, plus the scope and the evidence inventory. From the second verdict on,
ALSO paste the previous verdict block verbatim plus `iter-NN-changes.md` — the judge
prompt's anchored re-scoring only activates when the baseline is supplied; without it
the score is a re-roll of judge taste, not a measurement.

**Require the judge to WRITE its verdict, never merely return it**: create
`loops/ui-loop/verdicts/iter-NN.json` (the verdict block alone — valid JSON, no fence, no
prose) and `iter-NN-prose.md`, and verify the JSON parses before finishing. An agent can
complete its analysis and go idle without the report arriving; a file survives that.
Parse the file yourself; on malformed JSON ask the judge once to re-emit only the block.

Append one line to `loops/ui-loop/eval-log.md` (see its header for the format) and write
the iteration's post-mortem section there before Phase 6 closes.

## Phase 3 — Gate and select

Stop and report when: `overall >= target`, no `ui-fixable` items remain, or
`max_iters` reached. Always list `keeper-gate` items separately in the final
report — the loop cannot close them; they terminate at the keeper.

Otherwise select: interactive → show the verdict summary and ask the keeper which items
to implement; `auto` → all `ui-fixable` items, highest impact first. Route:
`ui-fixable` → Phase 4; `evidence-fix` → you, in Phase 5's evidence work (L4);
`keeper-gate` → final report only.

You may add your own items in the same schema — you have seen what the judge has not —
marked plainly as yours. Then ask what the judge cannot see: - Do the templates still read as ONE site when opened side by side, or has one drifted
  into its own dialect?
- Did anything become harder to FIND than it was last iteration?
- Does the change hold at 390px, and in the un-stamped theme state where neither
  `data-theme` attribute is present and only `prefers-color-scheme` decides?
- Is any fix a content change wearing a layout costume?.

## Phase 4 — Implement (parallel)

Group selected items by presentation surface - either the shared design system (`globals.css` + `layout.tsx`) or one page template. Spawn one implementer agent (**Sonnet 5**, passed explicitly per L6)
per presentation surface - either the shared design system (`globals.css` + `layout.tsx`) or one page template in a single message so they run concurrently — one target per agent
is what keeps them off each other's files. Each gets `loops/ui-loop/IMPLEMENT.md` as its
contract plus its items verbatim. Collect per-item reports: `files`, `expected_delta`,
`notes`, and any `declined_with_cause`.

## Phase 5 — Verify

1. Run the iteration gate yourself after merging all agent edits — implementers pass
   individually and collide in aggregate: `npm run build` completes with a written `out/` (read the LOG, never the exit code - a piped build reports the pipe's status and has already masked a real failure in this project), and `node scripts/verify-design.mjs` exits 0.
2. Refresh evidence for every changed presentation surface - either the shared design system (`globals.css` + `layout.tsx`) or one page template and confirm each `expected_delta`
   is actually observable in it. A failed confirmation goes back to the same implementer
   with the evidence attached. A fix the evidence cannot show scores as unfixed no
   matter how correct it is — route the gap as `evidence-fix` if the artifact is right.
3. Apply L3 to every decline. Accepted declines go into
   `loops/ui-loop/verdicts/iter-NN-changes.md` with their reasoning — the judge has no
   memory and re-files the same forbidden remedy otherwise.

## Phase 6 — Commit and iterate

One commit per iteration: artifact + docs + refreshed evidence + eval-log line
(`feat(ui-loop): iteration N — <overall>`). Update `state.md`. Every third
iteration, run the spin check below before continuing. Then return to Phase 2.

**Spin check.** Any two holding for three consecutive iterations → stop and take the
loop to the keeper: score rising smoothly and monotonically; zero declines ever; zero
`evidence-fix`/`keeper-gate` tags ever; wisdom sections still empty after five
iterations; new-items-per-iteration not trending down; no keeper decision has altered
the loop's course; a score moved with no named observable change.

## Model policy

Downgrade mechanical work, never judgement or the change that ships. A judge that
scores 7.1 when the truth is 5.8 sends implementers to fix the wrong things for the
rest of the loop's life.

| Phase | Model |
|---|---|
| Judge; iteration-0 proposal | **Opus 5** (keeper directive K2) |
| Implement | **Sonnet 5** (K2) |
| Mechanical edits verified immediately by the gate; research fan-out | Sonnet 5 |

Every value in this table is passed EXPLICITLY on the spawn (L6). Changing a row is a
keeper directive and retires the noise floor: a different model is a different
instrument, so the prior baseline and spread do not carry across.

The judge row is the one that was measured rather than assumed. A cheaper judge here
was tested and rejected on RECALL, not on accuracy: see state.md D3. Do not economise
on this row without re-measuring recall against a known item set.
| Resume, routing, gate checks | — (orchestrator) |

## Keeper points

Named, irreplaceable, not optional: | id | When | What only the keeper can do |
|---|---|---|
| KP1 | Before any RESTRUCTURE commits. **Blocking.** | Approve the change from its before/after screenshot pair. Refinements do not need this. A restructure can pass axe, reflow, payload and traversal while being worse for a reader - this review is the only thing in the loop that can see that. |
| KP2 | Each verdict | Trim the item list. The judge over-files; the keeper decides what is worth a round trip. |
| KP3 | Each final report | Close or re-prioritise `keeper-gate` items. The loop cannot close them and must never re-file them as actionable. |
| KP4 | Whenever the rubric feels wrong | Change the rubric, the benchmarks or the cap. The loop may not re-weight its own scoring: a loop that grades its own exam sets its own grade. |. A keeper ruling that contradicts
the charter is a charter edit recorded with its reasoning, not an exception smuggled
past it.

## Final report

Score trajectory, items implemented (with commits), items the keeper skipped, declines
and their dispositions, and the open `keeper-gate` list.

## Hard-won rules — do not rediscover

Append-only. Every incident that costs real time lands here (orchestration and tooling
traps), in the judge file's "Known evidence lies" (evidence traps), or in the state
file's defect-class and rejected-remedy sections — in the same commit as its fix.
Deliberately empty at birth: the loop is a machine for converting incidents into rules,
and this is where they accumulate.

**H1 (iter-00) — `serve-static` dies with `EACCES` on `listen 127.0.0.1` inside a
sandboxed session.** Every check that starts its own server then fails with
`serve-static exited with 1`, which reads exactly like a broken oracle and is not one:
`scripts/verify-design.mjs`, `tools/ui-evidence.mjs`, `tools/ui-invariants.mjs`. Re-run
outside the sandbox — the identical command completed 45 checks with 0 failures. Do not
debug the script.

**H4 (iter-02) — LOOK AT THE RENDERED PAGE before accepting a green gate. Twice now the
gate has been green over a plainly visible defect on the flagship surface.** Iteration 1
shipped `/catalog`'s column headers lying on top of their own data rows with build, axe,
payload and all five invariants passing. Iteration 2 round 1 shipped labels that vanished
behind the site header the moment the page scrolled, with six of six invariants passing —
and the check that certified it was one written specifically to catch the previous
instance. Both were found by opening a capture and looking.

A capture is not enough on its own either: every screenshot in `evidence/` is at scroll 0,
so a viewport crop at a real scroll position is sometimes the only thing that can show the
defect. Budget one deliberate look per iteration at whatever surface changed. **Treat "all
checks passed" as the beginning of verification.** The gate tests the properties someone
already named; the expensive defects are the ones nobody had named yet.

**H3 (iter-01) — a per-iteration scope line must exempt the artifacts the contract makes
mandatory.** The iteration-1 implementer was told "you may edit only `app/globals.css` and
`app/layout.tsx`", while `IMPLEMENT.md` obligates landing every accepted item's invariant
as an executable check in the same change. The two instructions contradicted each other.
The implementer resolved it correctly and FLAGGED it rather than silently picking one — but
every implementer would otherwise have to re-adjudicate the same conflict. State the
visual-surface scope, then say explicitly that `RULES.md` and `tools/ui-invariants.mjs` are
always in scope. Orchestrator's defect, not the agent's.

**H2 (iter-00) — a piped command reports the PIPE's exit status, not the command's.**
`npm run build | tail` returned 0 over a build that had died with `ERR_MODULE_NOT_FOUND`,
and `node tools/ui-evidence.mjs | tail` returned 0 over a run that failed 4 of its 40
identity checks. Both were caught only by reading the log. This is why the iteration gate
reads logs and never exit codes.
