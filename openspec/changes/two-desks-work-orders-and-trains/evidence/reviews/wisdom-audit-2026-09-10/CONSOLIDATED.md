# Consolidated review — A2AI-Spark's wisdom conversion, `72bc5cb..1334b9b` (39 commits, 2026-09-10 09:33–14:15)

Six sonnet reviewers, sealed from each other, read-only. One re-ran the eight new/changed test files serially with a tree check before and after each. Per-reviewer reports: a1..a6 in this directory. Live facts measured by the coordinator at 15:01: HEAD = origin/main = 1334b9b; live site serves 1334b9b (built 20:26:45Z, only Vercel builder dirt); no GATE-RUNNING; nothing running; main node_modules 177 entries; both handoff worktrees gone; ` M data/launch.json` uncommitted (mtime 14:26:18).

## P0 — each found independently by two sealed reviewers

**P0-1. Tests overwrite the live dispatch module in place.** `loop/tests/brief-reconcile.test.mjs:55` resolves `BRIEF_LIB` to the tracked `loop/lib/brief.mjs`; arms at `:167/:176` and `:249/:265` write it and restore in `try/finally`. `loop/tests/brief-required.test.mjs` mutations A/B do the same; `scripts/tests/lint-deferrals.test.mjs` does it to `scripts/lint-deferrals.mjs` (`:342/351, :370/378, :397/405`). `loop/run.mjs:28` imports `brief.mjs` for every job. `finally` does not run on SIGKILL, OOM or a hard timeout; a kill mid-window leaves the tracked source corrupted. `FULL-MEM-LOG.md:1782`: "NEVER MUTATE A FILE IN THE SHARED CHECKOUT AT ALL" (measured incident 2026-08-31, `:1767-1775`). `88d4144`'s `lib-mutate.mjs` lock is a real cross-process mkdir lock and fixed the race between two such tests — the symptom — not the hazard, which now runs on every `npm test`. (A1, A2; A5 confirms restoration is byte-identical on the happy path across 8 serial runs.)

**P0-2. Item 5's judgment engine has zero production callers.** `classifyClaim`/`recordMeasurement`/`createLineageStore` (`loop/lib/lineage.mjs:144-354`) are called only from their test. `loop/run.mjs:1518-1520`: "No selector sets one today… this changes nothing until a job arrives carrying one." `ledger.mjs:152` is an optional passthrough. Only the prose `corroborationSection()` reaches the live review brief (`review.mjs:440,448`), and nothing checks the reviewer answers it. (A3, A6.)

**P0-3. Item 3a's contradiction refusal was narrowed after the code shipped, and the deferral is filed nowhere.** `wisdom/README.md:298-300` specifies refusal on "missing, truncated or contradicted". Brief `b5308d1` required all three. `44ee775` (11:02) shipped contradiction "computed… but deliberately NOT wired" (`brief.mjs:1043-1052`, reason: 35 false-fires on the template's own negating sentences); the brief was amended to match at `6302dd5` (11:07). RESULT/REVIEW defer it to "round 3b's question", but 3b's brief and instrument are entirely about Files-list closure. `grep contradict|polarity|review-time reader` over `.beads/issues.jsonl`: zero hits. A brief that inverts a required sentence dispatches today (arm 5 pins exactly that). (A2, A6.)

## P1

**P1-4. Zero deferrals recorded.** The successor created no beads and left no notes (A4: every bead dated 2026-09-10 predates its 09:27 takeover). Follow-ups living only inside finished evidence: contradiction wiring (3a); brief-closure merge-gate wiring (3b, "owned by the orchestrator", `cbefe2b`/`798ec4c`); a selector that sets `job.lineage` (5). Beads qvf0/8des/58pk/uv8u were closed clean. The 2026-09-08 rule: a deferral naming a subject becomes its own issue or a note that blocks closure.

**P1-5. No gate evidence outside the board for any of the five pushes.** The prior convention `evidence/gate-run-<date>-<sha>/summary.txt` (present for `0ed3448`/`f74f606`/`08ae8b0`) was not followed once for `f1e75c2`, `88d4144`, `03d1f87`, `3f6914f`, `1334b9b`. The ratchet value 2066 exists nowhere except board prose; the tracked seed `wisdom/tools/orch/baselines/test-count-history.tsv` ends at `1926 c15e901`; no `orch-gate-runs` dir found under TEMP, /tmp or the coord dir. For the two repairs ("16/16 x3 then full green", "full green") nothing distinguishes a full six-gate re-run from a re-run of the failing file. (A5.)

**P1-6. `data/launch.json` drift: protocol is record-then-revert; the successor did neither.** `HANDOFF-orch.md` §5 (6dpj). Four numeric fields moved (home total 110.7→110.6; catalog inline 18.8→18.9, total 123.6→123.7, html 35.8→35.9) plus three dates — the "sample eight/nine" 3+-field anomaly, not the two-state shape the board names. Still dirty. (A5.)

**P1-7. Board clock invented, not read.** Entries stamped 12:05 / 12:35 / 12:50 decode from their own deploy Z-times to 13:00 / 13:35 / 14:26 local; error grows monotonically to 96 min; `updated: 12:50` header is ~96 min stale. Corroborated by launch.json mtime 14:26:18 and commit `%cI` times. (A4, A5.)

**P1-8. Handover documents now false.** `wisdom/HANDOFF.md:149-153` says 2b BRIEFED-NOT-BUILT, items 3/5/6 NOT STARTED; `:202-206, :227-228` and `wisdom/HANDOVER-PROMPT.md:48-59` send a successor to two deleted worktrees for finished work. `wisdom/README.md` §8 statuses unchanged. (A4.)

**P1-9. Two instruments are hand-run, and two tripwires skip two dispatch paths.** `scripts/brief-closure.mjs:27-33` is "reviewer-side, not automatic" with no merge consumer; `scripts/lint-deferrals.mjs` has no automated caller (a CLI by task design). 2b and 3a run only in `assembleBrief` (`run.mjs:1345`); `assembleRevisionBrief` (`run.mjs:753`) and `resumeBrief` (`run.mjs:1239`) bypass both, stated at `brief.mjs:726-727`. (A6, A2.)

**P1-10. `push` dropped from `COMMAND_VERBS`** (`f1e75c2`): "Push the branch once gates pass." is no longer an imperative to the reconciler. Reason documented beside the constant. The admitted "split-token gaming version" was never committed (two `-S` searches empty; weak negative). (A1.)

**P1-11. figure-provenance blind spots.** Live sweep has no non-vacuity floor — empty `DECLARED` passes (`deepEqual(violations, [])` only); `DECLARED` hand-enumerates four bounds; `openspec/**`, `wisdom/briefs/**`, `data/**` except README, and `tests/` excluded from the sweep (`:408-414`); `pointerFor` (`:211-214`) accepts any literal mention within 3 lines; the machinery-ceiling patterns (`:116-118`) miss "the machinery has a 10% ceiling" — the mrld incident's own word order. (A3, A6.)

**P1-12. `briefCarries` is negation-blind** (`brief.mjs:806-812`, ≥50% tokens, unordered): "We will NOT record the free-memory figure…" passes. Disclosed in REVIEW point 6. Negation synonyms outside `NEGATIONS` ("is prohibited from…") escape the contradiction detector too. (A1, A2, A6.)

## P2
- `scripts/brief-closure.test.mjs:20` still hardcodes `D:/AddictedtoAI` after the "location-independent paths" fix (9 other tests do the same). (A2)
- The no-id `--strict` "fix" is a stderr visibility line; exit code was already correct. RESULT says so; not overclaimed. (A1)
- truncation-shape's hatch negative case lives in the sibling `output-shortener-guard.test.mjs:166`, not the new file. (A1)
- lint-deferrals routes on any passing path mention (`SUBJECT_RE`, header admits it `:94-99`); no floor on issues scanned. (A1, A6)
- `curl … | head` and `OUT=$(git log); echo "$OUT" | head` are invisible to 2a and the sweep by design. (A1, A6)
- brief-closure's pin detection is five hardcoded shapes; "listed" is checked against path, never content. (A2, A6)

## Verified OK
- **70/70** across the eight test files, serially, tree byte-identical after each; mutation lock dir absent before and after. (A5)
- Arm counts match every RESULT claim: 12, 7, 5, 9, 8, 10, 15, 4. Board "16/16" = 7 (2b) + 9 (3a). (A1–A3, A5)
- `03d1f87` allow-list entry narrow, reasoned, staleness-checked by the pre-existing generic arm `:123-132` — a cause fix, not a detector loosening. (A2)
- `lib-mutate.mjs` lock is a real cross-process mechanism; 2032/2033 was a race, not a defect. (A2)
- 03e2207 story accurate; `9c272f4` is launch.json's current blob. (A3)
- S5 exemption keyed on exact line text, tamper arm A15 re-fires; S6 dispositioned with reason; `3936ae8` residual recorded in three places. (A3)
- `AGENTS.md`: one pointer line added; `data/README.md`: key-path pointers plus stale 10%→30% corrected; no rule changed. (A3)
- tasks.md ticks 16/17 cite `358e00d` (exists); task 31 untouched. Beads: four closed naming existing shas; `douz` in progress. (A4)
- 2b brief authority `@696a9c1` exists. [A4 misreported the mechanics as self-referential; measured: `696a9c1` pinned `@9aaf6fe`, `183abd7` moved it to `@696a9c1`.]
- 2b and 3a ARE live for new-job dispatch: `assembleBrief` throws before `.job/brief.md` is written (`run.mjs:1345`, `:1412`). (A1, A6)
- B1/B2 witness split honoured as task 17 specifies. (A1)

## Environment
Stray `node …shell-token-guard.mjs` hook process from 07:46 still alive; `claude --resume A2AI-mem-cond` alive since 2026-09-09 with a board stale since 13:47 that day.

## Errors in the coordinator's own briefs
The "8 added lines in `loop/run.mjs`" attributed to 2b belong to wisdom 5 (`e0d7839`). "16/16" was the board's combined figure for two files.
