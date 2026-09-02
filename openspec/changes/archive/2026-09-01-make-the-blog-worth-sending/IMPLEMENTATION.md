# Implementation plan: make-the-blog-worth-sending

Written 2026-08-30, after the post-review-2 repairs landed in this
directory's artifacts. Read `tasks.md` for what each task is; this file
is only the execution order, the parallelism, and — the part that
matters when waves run as separate agents — **which files each wave
writes**, so no two concurrent agents touch the same file.

Ground rules for every wave agent, non-negotiable and to be repeated
verbatim in each brief: never use the token `cd` (use `git -C`,
`npm --prefix`, absolute paths); prefer Read/Write/Edit/Grep/Glob over
shell file tools; keep shell strings short — write a `.mjs` and run it;
never edit `package.json` or `data/config.json` (the latter is reserved:
task 2.1's config half is the orchestrator's, done before the waves
start); do not run `pulse/verify-zero-model.mjs` or `pulse/run.mjs` or
`loop/run.mjs` as a "check" — the zero-model verifier spawns a full
production Pulse run whose publish step pushes when publishing is armed;
if a tool call is blocked, report and stop.

## Wave 0 — DONE

Tasks 1.1–1.4 were executed at commit `bde5a6e` (2026-08-30) and are
verified in-tree; the boxes in `tasks.md` carry the verification notes.
No wave agent should touch the deletion again.

## Wave 1 — the config spine (serial, before everything)

**Task 2.1.** Two actors, in order:

1. The **orchestrator** (reserved path): `data/config.json` gains
   `job_caps_minutes.scout: 60` and `scout` in
   `budget.categories.new_writing`. (`scout` is already in all three
   `degradation.shed_levels[].exclude_types` — applied 2026-08-30, do
   not redo.)
2. One agent: `loop/lib/config.mjs` adds `scout` to `JOB_TYPES`, plus
   the tests named in the task.

Order is load-bearing: `loadConfig` throws on a `JOB_TYPES` entry with
no cap (`loop/lib/config.mjs:99`), so the code edit landing first breaks
every loop invocation.

**Writes**: `data/config.json` (orchestrator only), `loop/lib/config.mjs`,
loop config/selector test files (including the degradation test asserting
a level-1 shed excludes a `scout` candidate).

Wave 1 goes first because most of wave 2 reads `JOB_TYPES` or the config,
and because it is the one file two waves would otherwise both touch.

## Wave 2 — six parallel lanes, disjoint files

Every lane runs `npm test` green on its own files before finishing; the
cross-lane build check happens in wave 3. Lanes A–D and G are mutually
independent and independent of E/F. Lane E must finish before lane F
starts (F's compliant-post fixtures need 3.4's schema keys), so E and F
are one lane run serially, parallel to everything else.

| lane | tasks | writes | notes |
|---|---|---|---|
| **A — Pulse** | 2.2 | `pulse/lib/queue.mjs`; `pulse/tests/` (queue tests) | pure derivation; fixture tree, pinned clock |
| **B — briefs** | 2.3, 3.3, 3.8 (brief half) | `loop/lib/brief.mjs`; its tests | one agent owns the whole file: scout acceptance, post acceptance rewrite, per-job proposal rule |
| **C — review + verdict** | 2.6, 3.1, 3.2, 3.8 (review-brief half) | `loop/lib/review.mjs` (checklists, `mergeGate` at :323, review brief), `loop/lib/verdict.mjs` (`REASONS`); their tests | `mergeGate` lives in `review.mjs`, so the `reads-human` refusal is this lane's, not D's |
| **D — proposals + merge mechanics** | 2.4, 2.5 | `loop/lib/proposals.mjs`, `loop/run.mjs` (merge wiring around :317–:666); their tests | reads verdict record files for transcription but does not edit `verdict.mjs` (C owns it); candidate caps, stamping, same-type discard, expiry sweep |
| **E — schema + render** | 3.4, 3.6 | `lib/schema.mjs`; `lib/render/blog.mjs`; their tests | disjoint pair; 1.4's empty-state work in `blog.mjs` is done — only the anchor rendering is left |
| **F — the two prebuild checks** (after E) | 3.5, 3.7 | new anchor-check module + new `scripts/check-post-voice.mjs`; `scripts/prebuild.mjs` (both `STEPS` entries — the ONLY file two tasks share, which is why one lane holds both); pinned corpus fixtures; their tests | the lint **warns, never fails**; expected firing counts come from `openspec/style/blog-voice-calibration.md` (12/12 and 1/9 at the union), and entity decoding before counting is mandatory — the calibration record documents the `&sect;` artifact |
| **G — the blocked-streak witness** | 2.7 | `lib/stamp.mjs`; its test | derives the streak from `data/ledger.jsonl` into `/status.json`; must not disturb the stamp fields `verify-surfaces` compares |

File-collision summary, stated once: `loop/lib/brief.mjs` → B only;
`loop/lib/review.mjs` and `loop/lib/verdict.mjs` → C only;
`loop/lib/proposals.mjs` and `loop/run.mjs` → D only;
`scripts/prebuild.mjs` → F only; `lib/schema.mjs` and
`lib/render/blog.mjs` → E only; `pulse/lib/queue.mjs` → A only;
`lib/stamp.mjs` → G only; `data/config.json` and `loop/lib/config.mjs`
→ wave 1 only. Shared *test* directories are fine as long as each lane
creates its own new test files and edits only test files beside its own
modules.

## Wave 3 — integration (serial, one agent, after all of wave 2)

**Tasks 4.1 and 4.2.** Full `npm test`; `npm run build`; `openspec
validate make-the-blog-worth-sending --type change --strict
--no-interactive`; then the end-to-end fixture run 4.2 describes, with
its date/method/output recorded against the task. **Run builds serially,
never two at once** (`addictedtoai-6s7`). Publishing gates per
`CLAUDE.md` apply to whoever pushes.

## Wave 4 — the record (serial, cheap, after wave 3)

**Task 5.1.** Beads only — comment/close `addictedtoai-18c`,
`addictedtoai-6ov`, `addictedtoai-3zf` per the task, and file the one
new issue (first live scout cycle measured end to end). No repository
files.

## Dependency graph, one line each

- 1.x (done) → everything.
- 2.1 → 2.2 (the selector must accept the derived type in any live run),
  2.3–2.6 (briefs/checklists for a type that exists), and all loop tests
  that load config.
- 3.4 → 3.5, 3.6, 3.7 fixtures (strict schema admits `covers:`/`anchor:`).
- 2.4 and 2.5 interlock (one lane).
- 3.1 → 4.2's simulated verdicts; 2.2+2.3+2.4+2.5+2.6 → 4.2's
  end-to-end path.
- Nothing depends on 2.7 and 2.7 depends on nothing — it can land any
  time before wave 3.
