# Reviewer A5 (sonnet, sealed) — gate protocol evidence + independent test re-runs

## Part 1 — Protocol findings

**P1 — Ratchet value 2066 is unverifiable from anything reachable in or from the repo.**
The tracked ratchet is `wisdom/tools/orch/baselines/test-count-history.tsv`, committed once at `8823d2d` (an ancestor of `72bc5cb`, i.e. it predates the whole reviewed range). Its last row is `2026-09-10 07:00:40  c15e901  1926`. Zero commits in `72bc5cb..1334b9b` touch it, and `git status`/`diff` show it unmodified now. This matches the tool's own README: "`baselines/` are SEEDS, not the live state... the harness appends to them during a run" in `$ORCH_RUNS` (default `${TMPDIR:-/tmp}/orch-gate-runs`), which is untracked and session-scoped. Searched `C:/Users/BadBitch/AppData/Local/Temp`, `/tmp`, `D:/addictedtoai-coord` for an `orch-gate-runs` dir, and user/machine/process env for an `ORCH_RUNS` override — found none. **The number 2066 exists nowhere except A2AI-Spark.md's own prose.**

**P1 — No external record exists for any of the six pushes; the board's sentence is the only record.**
The repo shows real precedent for committing gate evidence: `openspec/.../evidence/gate-run-2026-09-09-08ae8b0/summary.txt` quotes all six exit codes verbatim ("1-test EXIT=0 328s ... 1797 passed ... ALL SIX GATES GREEN at 08ae8b0"). That directory-per-run convention exists for `0ed3448`/`f74f606`/`08ae8b0` (pre-Spark) but **not once** for `f1e75c2`, `88d4144`, `03d1f87`, `3f6914f`, or `1334b9b`. (Note: "16/17+2b" and `f1e75c2` are the same push — one gate run covering two merged items; five pushes, not six.) For every push the only evidence is a board sentence — a claim, not a measurement.

**P1 — Repair re-runs: cannot confirm full six gates ran, only that the board says "full green."**
For the 2032/2033→88d4144 and 2040/2041→03d1f87 repairs, the board writes "16/16 x3 then full green" and "full green" — no per-gate breakdown. Given the absence of any rundir evidence, there is no way to distinguish "reran only the affected test file(s)" from "reran all six gates end to end."

**P1 — launch.json: protocol says record-then-revert; successor did neither, and the drift is bigger than described.**
`wisdom/HANDOFF-orch.md` §5 (`6dpj`): "Every sample is reverted after being recorded... a revert without the record is an observation with nothing durable to show." The board's `holds:` line says the drift was "left local... uncommitted" — dirty but not reverted, still dirty now. The actual diff of `data/launch.json` shows **four** numeric fields moved, not the two cited: home `total_kb_gzipped` 110.7→110.6, catalog `inline_kb_gzipped` 18.8→18.9, catalog `total_kb_gzipped` 123.6→123.7, catalog `html_kb_gzipped` 35.8→35.9 (plus three date rolls to 2026-09-10). HANDOFF-orch.md flags a 3+-field move as the "sample eight/nine" anomaly, not the simple two-state case — so "known 6dpj shape" undersells it. On hysteresis: 0.1 KB exceeds the 62-byte floor, so nominally a "legitimate advance" — but that rule assumes deterministic measurement below 62 bytes of noise, the exact assumption `6dpj` found broken. The documented answer is revert-after-record, not commit; the successor did neither.

**P1 — Board timestamps drift up to 96 minutes from measured deploy times, growing monotonically.**
- f1e75c2: 16:32:34Z=10:32:34 vs logged 10:45 (+13m)
- 88d4144: 17:34:47Z=11:34:47 vs logged 11:40 (+6m)
- 03d1f87: 19:00:55Z=13:00:55 vs logged 12:05 (−55m)
- 3f6914f: 19:35:23Z=13:35:23 vs logged 12:35 (−60m)
- 1334b9b: 20:26:45Z=14:26:45 vs logged 12:50 (−96m)
Independently measured `data/launch.json`'s on-disk mtime: **2026-09-10 14:26:18 local**, 27s from the decoded 14:26:45 — corroborating the real time, not the logged 12:50. The error flips sign and grows monotonically — the same "invented timestamp, not clock-read" defect HANDOFF-orch.md documents A2AI-Orch catching in itself. `A2AI-Spark.md`'s `updated: 12:50` header is ~96 minutes stale.

**P2** — no other material process deviations found; the working tree at every checkpoint matched the expected baseline dirt exactly.

## Part 2 — independent counts (serial, `node --test <file>`, tree checked before/after each)

`wisdom/tools/suite.mjs` exports only `requireCleanEnv`/`makeRunner` helpers (no CLI entry) — used `node --test <file>`. No test file required an env var.

| file | tests | pass | fail | seconds | tree clean after |
|---|---|---|---|---|---|
| scripts/tests/lint-deferrals.test.mjs | 12 | 12 | 0 | 1 | Y |
| loop/tests/brief-reconcile.test.mjs | 7 | 7 | 0 | 2 | Y |
| scripts/tests/truncation-shape.test.mjs | 5 | 5 | 0 | 0 | Y |
| loop/tests/brief-required.test.mjs | 9 | 9 | 0 | 2 | Y |
| scripts/brief-closure.test.mjs | 8 | 8 | 0 | 37 | Y |
| loop/tests/lineage.test.mjs | 10 | 10 | 0 | 0 | Y |
| scripts/figure-provenance.test.mjs | 15 | 15 | 0 | 1 | Y |
| scripts/no-change-dir-refs.test.mjs | 4 | 4 | 0 | 1 | Y |

Totals: 70/70/0. `git status --porcelain` + `diff --stat` before and after every run matched the expected baseline dirt (eleven `.agents/skills/` deletions, `M data/launch.json`, `?? .agents/unused_skills/`) with no additional paths at any checkpoint — the two mutation tests restored `loop/lib/brief.mjs` byte-identical each time. `loop/tests/lib-mutate.mjs`'s lock (`%TEMP%\atai-brief-lib-mutation-lock`) absent before the first run and after the last. `GATE-RUNNING` absent when checked.

## Environment
A stray `node ... shell-token-guard.mjs` hook process from 07:46 this morning is still alive; `claude --resume A2AI-mem-cond` from yesterday is still a live process though its board is stale since 2026-09-09 13:47.
