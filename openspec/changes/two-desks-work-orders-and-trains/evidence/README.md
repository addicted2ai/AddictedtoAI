# Evidence for `two-desks-work-orders-and-trains`

Every number in `proposal.md` and `design.md` cites one of these files, a bead id,
or a script here. They were produced on 2026-09-08 (local) by research agents and
peer sessions and copied out of session-scoped temporary directories so the
evidence outlives the sessions that made it. Point-in-time counts carry the moment
they were taken; the repository moved while they were being measured.

Nothing under `lib/`, `loop/`, `pulse/`, `scripts/`, `app/` or `tools/` may import
or reference this directory: archiving moves it to
`openspec/changes/archive/<date>-<change>/evidence/`.

## Reports

| File | Produced by | What it supports |
|---|---|---|
| `architect-outline.md` | A2AI-Fable-Arch (the architect) | The decision record the artifacts were drafted from: reserved property, measured problem, D1–D7, staging, risks. |
| `desk-mech-report.md` | Opus research agent, read-only | The lifecycle of one Desk job with file:line per step; fixed vs proportional cost; brief growth 16,181 → 103,881 chars; the review-diff median 8,101 and p90 55,034 (§B); the places that assume one item per job and the places that already generalise; inflow producers; candidate inefficiencies. |
| `ledger-report.md` | Sonnet research agent, read-only | Jobs per day, per-job size (median 1 content file / 4 lines), wall-clock, dollars (sweep-priced, a floor), review rounds, proposals; method and scripts named. |
| `hist-report.md` | Opus research agent, read-only | Dated timeline since 2026-08-28, recurring failure classes, every recorded cost/time measurement, how the Desk is chained today, open machinery beads by theme, things tried and reverted, structural sources of waste (G1–G10). |
| `beads-report.md` | Sonnet research agent, read-only | Inflow sources, churn (0.3–0.6 new per closed), open backlog shape at 13:56 UTC, the `h0z0` front/back-desk comment (§F). Its per-day table is UTC-bucketed and **superseded** by `scripts/orch-beads-flow-local.mjs`; its "81 machinery / 14 content" split is **superseded** by the backlog classification (see the provenance gap below). |
| `spend-report.md` | Sonnet research agent, read-only | Workspace spend split (interactive 85.6% / Desk 14.3%, fork-corrected), lines changed by bucket (content 4.15%), caveats on what the usage files cannot see. |
| `stale-report.md` | Sonnet research agent, read-only | All 27 open beads created 2026-08-31 (local) checked against the tree: 25 still valid, 1 partial, 1 fixed-but-open; seven natural batches. |
| `stale2-report.md` | Sonnet research agent, read-only; corrected by the architect 2026-09-08 | The 21 open beads created 2026-08-29 and 2026-08-30 (local): **17 still valid** (the first totals omitted `addictedtoai-4w2`, which the table lists), 4 partial, 0 fixed; ten already carry same-day directives in `DIRECTIVES.md:116-141`, none run. With `stale-report.md`, the whole 48-bead opening cohort is checked: **42 valid, 5 partial, 1 fixed** (`en3s`, since closed) — 47 of the 48 still open at the check. |
| `runner-workflow-cost.md` | Sonnet measurement agent, read-only | Workflow-adjusted model-minutes per **merged** job per author runner × type — every role and every outcome in the cell, over the jobs that merged — beside author-only minutes. The D7 pricing table. 243 ledger lines, 2026-08-28..09-08. |
| `stage0-baseline.md` | Sonnet measurement agent, read-only (task 30) | The Stage-0 baseline on **both** definitions, n = 206 of 208 merged jobs: brief-commit → merge median 22.81 min all-time / 23.35 since 09-01, overhead 3.85 / 3.90 min; brief-commit → records-commit overhead 5.497 / 5.52 min, reproducing `desk-mech-report.md`'s 5.5. `brief_chars` median 37,183 all-time with p90 102K and the day series 16,181 → 33,491 → 70,349 → 103,881, which is why the gate's comparator is the recent window and not the all-time median. Records that **41 of the 206 have no records commit at all** (`addictedtoai-l7cx`). |
| `bd-measurements.md` | Sonnet measurement agent, 2026-09-08, against a throwaway store only (task 26) | The real `bd` CLI's behaviour the Stage-3 choke point must be built on: `show --json` wraps in an array; comment bodies need `--include-comments` and never appear in `list --json`; a second `--claim` by another actor fails (exit 1); re-closing a closed issue is a silent exit-0 no-op that discards the new reason; `reopen` clears `close_reason`; metadata round-trips as JSON objects and `--set-metadata` merges; no argv ceiling found up to 200 ids; `--json` stdout is clean. Safety finding: `bd init --db <path>` with the process cwd inside the repository auto-detected the real remote and cloned the project's Dolt history into `~/.beads/embeddeddolt/`; the stray store was deleted. The choke point must pin cwd to the store it means. |
| `codex-spend-2026-09-08.json`, `scripts/codex-spend-capture.mjs` | A2AI-Luna-Boss-2, 2026-09-08 about 10:00 local | The captured, immutable output of the codex-lane measurement (the round-2 review's spot-check 4 found the script present and its input absent): per-session rows and two aggregates — the 48 sessions started before 08:00 local: 182,873,547 total tokens / 688,798 output (the earlier 182.4M / 685K was read while three sessions were still running, so it was a running total); all 67 sessions at capture, partial day: 238,067,103 / 828,209, 96.8% of input cached, 286:1 input to output. Carries its own caveat that raw totals overstate cost because cached input bills far below fresh. Invocation: `node scripts/codex-spend-capture.mjs ~/.codex/sessions` (session-scoped input). Worktree names in the rows include conformance worktrees that name a model; evidence/ is outside the portability scan. |
| `draft-report.md` | Sonnet research agent, read-only | Digest of the tabled `addictedtoai-7z07` draft on branch `impl/spec`: what it proposes, its requirement headings, its open must-fixes, what is reusable and what conflicts. |
| `gate-timings-final.txt` | A2AI-Orch, on `main` at `78c6361`, publishing off | **Cite this one.** The combined six-gate table; `gate-timings.txt` and `gate-timings-npm.txt` are the two partial files it supersedes and are kept only as the record of how it was assembled. |
| `scripts/sha-sweep.mjs` | A2AI-mem-cond, 2026-09-08; placed here by the architect because a session scratchpad dies | Read-only; takes any file path; lists every commit sha the document cites and whether it is REACHABLE from a ref. `git cat-file -t` passing is NOT the check: an amended commit still resolves as a dangling object, and its orphan carries the PREVIOUS message, so a reader following the citation gets a confident, specific and false description of the commit until git collects it — strictly worse than a dead link. Found on the pre-amend object `b34f58…` (statement 21's amendment; the reachable, byte-identical object is `08b627f`; the orphan is written here in a form nothing resolves, so this sweep stays clean); the sweep of design.md's ten candidates found that one. Run it over proposal.md, design.md, tasks.md and this file before archiving. |
| `scripts/orch-gate-distribution.mjs` | A2AI-Orch, 2026-09-08 11:17; placed here by the architect | The script behind `gate-timings-surfaces-5runs.txt`: five serial runs of `verify-surfaces` against the existing `out/`, with the exact cwd and argument, no build and no lock; prints min / median / mean / max, the spread, and the 25% floor as a fraction of the observed minimum. Extend RUNS or the gate list only when the machine-wide lock is free. |
| `gate-timings-surfaces-5runs.txt` | A2AI-Orch, 2026-09-08 about 11:20 local, against the 08:12 export, no lock taken; relayed by message and recorded by the architect | The first multi-sample gate timing: `verify-surfaces` five runs, min 3.54 s / median 4.35 s / max 5.87 s, spread 1.66x. Shows the 25%-of-one-run floor rule has real margin (0.93 s is 26% of the observed minimum), that the recorded single sample was lucky (1.05x the minimum), and that the six-gate percentages are single-sample arithmetic: ranking safe, percentages approximate. |
| `gate-timings.txt`, `gate-timings-npm.txt` | A2AI-Orch, superseded by `gate-timings-final.txt` | The six-gate **push-bar** table: 442.5s total, `npm test` 314.8s (70.7%), `verify-launch` 39.6s of which its own build is 39s; 1,709/1,709 tests in 298,091 ms across 122 files. A job runs four of the six. |
| `rerun-efficiency.txt` | A2AI-Fable-Arch re-running `scripts/orch-efficiency.mjs` | Reproduction of Orch's ledger figures (242 jobs, model-minutes by role, the 1.45× gap ratio as an upper bound). |
| `rerun-beads-utc-superseded.txt` | A2AI-Fable-Arch re-running Orch's original UTC-bucketed script | Kept only to show what the UTC bucketing produced. **Superseded** by the local-day script. |

## Reviews

| File | Reviewer | What it found |
|---|---|---|
| `reviews/round1-sealed-opus-high.md` | Sealed Opus, high effort, 2026-09-08 | 1 blocker, 12 majors, 8 minors, plus §4 (the plan) and §6 (the strongest alternative per decision). Verdict: revise before implementation — and the reserved property survives every path walked. |
| `reviews/round1-sealed-luna-max.md` | Sealed codex `gpt-5.6-luna` at maximum effort, run by A2AI-Luna-Boss-2, 2026-09-08 | 2 blockers, 8 majors, 1 minor; the seven specified hunts; every path bytes take to the live site; five spot-checks; an independent requirement-to-task coverage script. Verdict: not ready. Four findings no other review raised. |
| `reviews/round2-sealed-luna-max.md` | Sealed codex `gpt-5.6-luna` at maximum effort, round 2, 2026-09-08 | 1 blocker, 8 majors; the publication contract found internally contradictory; the Pulse-to-train handoff, the train bound taken before the bytes it bounds are final, and the ordered-access seal. **Its seal broke by its own report** — it read the revision records early while checking a line count, and says so in its first paragraph — so it is not a strictly independent second reading. That is itself evidence for its own finding that an ordered-access seal is an instruction rather than a mechanism. |
| `reviews/round2-opus-closure.md` | Sealed Opus, closure check on rounds 1 and 2, 2026-09-08 | Which of F1–F21, §4 and §6 actually closed: **20 of 21**, with F21 open because its fix landed in a task and not in the requirement. Seven new text-level defects the revision itself introduced, three of them consequences of round-1 fixes. Carries the findings-per-kilobyte arithmetic and the reviewer's two cautions about reading it. |

Both reviewers ran `openspec validate --strict` and
`node scripts/check-spec-deltas.mjs --strict` themselves. `design.md`'s
**Revision record** lists every finding id and the disposition applied, including
the two not applied and why.

## Scripts

Reference copies, run from a session scratchpad. They read `data/ledger.jsonl`,
`bd list --json` output, or `~/.codex/sessions`, and **write nothing**.

| Script | Produced by | Invocation | Supports |
|---|---|---|---|
| `scripts/orch-efficiency.mjs` | A2AI-Orch | `node <script>` — reads `D:/AddictedtoAI/data/ledger.jsonl` by absolute path | Jobs/day by outcome, model-minutes by phase role, invocations per job, the gap/mm ratio. Its header states what the ledger cannot answer. |
| `scripts/orch-runner-quality.mjs` | A2AI-Orch | `node <script>` — reads the ledger by absolute path | First-pass revise rate by author runner and by type; the D7 agreement table. |
| `scripts/runner-workflow-cost.mjs` | Sonnet measurement agent | `node <script>` — reads the ledger by absolute path | Workflow-adjusted minutes per merged job per runner × type; the D7 pricing table. Reuses `orch-runner-quality.mjs`'s author-runner field so `n` agrees. |
| `scripts/orch-beads-flow-local.mjs` | A2AI-Orch | `node <script>` — **session-scoped**: spawns `bd list --all --json` through a hard-coded absolute path to `bd.js` under the user profile | Beads filed/closed per LOCAL day (313/212; last 7 days 99/69 = 1.43). Its header explains why the UTC bucketing it replaces was wrong. |
| `scripts/orch-cohort-0831.mjs` | A2AI-Orch | `node <script>` — **session-scoped**, same `bd.js` path | Re-triage status of the 08-31 cohort. |
| `scripts/orch-create-shaped.mjs` | A2AI-Orch | `node <script>` — **session-scoped**, same `bd.js` path | The triage that found no create-shaped site work left for the fleet. |
| `scripts/stage0-baseline.mjs` | A2AI-Orch | `node <script>` — reads `data/ledger.jsonl` and `git log` by absolute path | The Stage-0 baseline on both definitions, anchored per job on its ledger line's `ts` and the parent of its records commit. |
| `scripts/orch-backlog-classify.mjs` | A2AI-Orch | `node <script>` — **session-scoped**, same `bd.js` path | The backlog classification quoted in `proposal.md`: of 101 open at 2026-09-08, 52 name a code path only, 18 a content path only, 15 both, 16 neither; review-gate floor 33. Its header states what it deliberately does not do — it reports the overlap between two keyword classifications honestly rather than inventing a better classifier, so the argument rests on a number that is defined. |
| `scripts/machinery-share.mjs` | A2AI-Luna-Boss-2 | `node <script> <beads-export.json>` — takes a `bd list --json` dump as its one argument | Path-based classification of beads filed since 09-01. |
| `scripts/open-by-day.mjs` | A2AI-Luna-Boss-2 | `node <script> <beads-export.json>` | Open beads by creation day (the barbell). |
| `scripts/codex-spend.mjs` | A2AI-Luna-Boss-2 (method also on `addictedtoai-f4vy`) | `node <script> <sessions-dir>` — **session-scoped**: point it at `~/.codex/sessions` | The original codex-lane script. Its reading of 182.4M / 685K was a **running total** — three sessions were still live — and is **superseded** by `codex-spend-2026-09-08.json`, the captured fixture. |
| `scripts/fleet-worker-retired.ps1` | A2AI-luna-boss (a session that **ended** 2026-09-08 06:36), copied by A2AI-Luna-Boss-2 | **Not to be run.** Kept as the record of what D6 retires. | The hand-driven fleet's worker launcher. It names a model, a harness and an absolute path, which is why it could never enter `loop/` — see `design.md` D3, constraint 3. The fleet ran from it all day after that session had ended. |

**Session-scoped** means the script hard-codes a path under the user profile —
the `bd.js` entry point or the codex sessions directory — so it will not run
unchanged on another machine. Recorded rather than fixed: these are the scripts as
run, and editing them would break the correspondence with the outputs above.

## Provenance, and why this directory exists

A sealed reviewer's strongest procedural finding was that three load-bearing
measurements — the local-day beads flow, the gate table and the codex token
figures — were unreachable from the reports as cited. Every one of them is now
here, with the script that produced it. The backlog classification, the last
figure still resting on attribution at the end of round 1, is reproducible as of
round 2: `scripts/orch-backlog-classify.mjs` is in the table above.

Not copied: `test-raw.txt` (160 KB of raw test-reporter output; its distribution
figures are in `design.md` D2) and the UTC-bucketed `orch-beads-flow.mjs`.
