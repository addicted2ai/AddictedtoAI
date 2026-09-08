# Workflow-adjusted cost of a merged job, per author runner x job type

Read-only measurement. Nothing in the repository was modified; no gate,
build, test, Pulse or Desk run was executed.

**Ledger read:** `D:/AddictedtoAI/data/ledger.jsonl`
**Line count:** 243 (242 unique job ids — `j-20260907-13` is recorded twice:
`capacity` then `failed`, both counted as separate lines/invocations, per the
ledger's append-only "one line per run" design)
**Timestamp range:** `2026-08-28T23:44:58.339Z` .. `2026-09-08T14:01:47.839Z`
**Report date:** 2026-09-08

**Invocation:**
```
node D:/AddictedtoAI/openspec/changes/two-desks-work-orders-and-trains/evidence/scripts/runner-workflow-cost.mjs
```

## Method

**What "workflow-adjusted" means.** `orch-runner-quality.mjs` (same
`evidence/scripts/` directory) prices a runner on its own author-phase
minutes alone. That undercounts a runner whose output gets revised a lot,
because the revision pass, the second review pass, and the minutes spent on
jobs in the same cell that never merged at all are real cost the workflow
paid before a result reached `main` — they just land on a different `role`
than `author`, or (for 3 lines written before `phases` existed) on no role
breakdown at all. This script sums **every** minute recorded against a cell
— every role, every outcome, including jobs that failed/blocked/discarded/
capacity'd with nothing merged — and divides by the jobs that actually
merged (`outcome: "done"`), so the denominator is "results delivered" and the
numerator is "everything the workflow spent trying."

**Fields read**, all from `data/ledger.jsonl` per the schema comment in
`loop/lib/ledger.mjs`:
- `type`, `outcome`, `mm` (job total, all invocations) — top-level, on every line.
- `phases[]` — optional/additive array of `{role, runner, mm, outcome}`, one
  entry per invocation. Roles observed in this ledger: `author`, `review1`,
  `revision`, `review2`. No other role value appears.
- `runner` (top-level) — used as the author-runner fallback only for the 3
  lines with no `phases` at all (`j-20260828-01`, `j-20260828-02`,
  `j-20260829-01`, all pre-`phases`-era `entry`/`verify` attempts by
  `claude-code-sonnet` that never reached review). Their entire `mm` is
  counted under role `author` here, since there is nothing in the line to
  attribute it elsewhere and the job never got past the author attempt
  (outcome `failed`/`blocked`).
- A review phase's own `runner` field (`review1.runner`, `review2.runner`) —
  used for the reviewer-runner-mix tables.

**`authorRunner(j)`** reuses the exact field access from
`orch-runner-quality.mjs`: `phases.find(role === 'author').runner`, falling
back to the job's own top-level `runner`. **Counting unit** also matches that
script: one ledger LINE is one row (`for (const j of ledger)`, unconditional
`n++`), not one unique job id — so the two tables' `n` values agree.

**Verified before computing anything**, directly against the raw file: every
`phases[]` array's `mm` sums to that line's top-level `mm` within 0.02 across
all 240 phased lines (0 mismatches); no line has two phase entries with the
same role (0 duplicates); the top-level `runner` field equals the author
phase's `runner` on every one of the 240 phased lines (0 mismatches). The
per-role sums below are reading consistent, non-redundant data.

**Metrics, per cell:**
- **n** = ledger lines in the cell; outcome counts (`done`/`failed`/
  `discarded`/`blocked`/`interrupted`/`capacity`/`abandoned`) sum to n.
- **model-minutes by role**, summed over ALL lines in the cell regardless of
  outcome: `author-mm`, `review1-mm`, `revision-mm`, `review2-mm`, `other-mm`
  (any role not in that list — none observed), `total-mm` (= job `mm` summed).
- **merged** = count of `outcome: "done"` lines in the cell.
- **workflow-mm/merged** = `total-mm` (all roles, all outcomes) ÷ `merged`.
- **author-mm/merged** = `author-mm` (all lines' author-role minutes only,
  same cell, same denominator) ÷ `merged` — the "author phase alone" number
  for direct comparison against workflow-mm/merged, same denominator, only
  the numerator's scope differs.
- **revision-share** = `(revision-mm + review2-mm) / total-mm`.
- Rates are **not** combined into one score — revise-rate and fail-rate have
  different denominators, and none of the tables below compute a blended one.

**Small cells are exactly that.** Many (runner, type) cells have n in the
single digits; a per-merged-job number computed from n=1 is one job's mm, not
a rate. Every table prints n so this is visible rather than implied.

---

## By author runner x type

n < 10 is a small cell.

| key | n | done | failed | disc | blk | int | cap | abn | author-mm | review1-mm | revision-mm | review2-mm | other-mm | total-mm | merged | workflow-mm/merged | author-mm/merged | revision-share |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| opencode-deepseek / repair | 80 | 76 | 4 | 0 | 0 | 0 | 0 | 0 | 926.7 | 282.2 | 102.5 | 53.4 | 0.0 | 1364.8 | 76 | 18.0 | 12.2 | 11% |
| claude-code-opus / repair | 34 | 32 | 2 | 0 | 0 | 0 | 0 | 0 | 433.8 | 111.1 | 11.6 | 8.9 | 0.0 | 565.4 | 32 | 17.7 | 13.6 | 4% |
| codex-gpt-luna-medium / repair | 19 | 15 | 0 | 1 | 3 | 0 | 0 | 0 | 177.5 | 87.4 | 54.8 | 28.9 | 0.0 | 348.6 | 15 | 23.2 | 11.8 | 24% |
| claude-code-opus / interpret | 12 | 9 | 2 | 0 | 1 | 0 | 0 | 0 | 213.7 | 47.6 | 7.8 | 2.9 | 0.0 | 272.1 | 9 | 30.2 | 23.7 | 4% |
| claude-code-opus / post | 12 | 10 | 2 | 0 | 0 | 0 | 0 | 0 | 266.0 | 75.0 | 30.7 | 18.6 | 0.0 | 390.4 | 10 | 39.0 | 26.6 | 13% |
| claude-code-opus / entry | 12 | 11 | 1 | 0 | 0 | 0 | 0 | 0 | 302.4 | 95.8 | 11.6 | 10.4 | 0.0 | 420.2 | 11 | 38.2 | 27.5 | 5% |
| opencode-deepseek / entry | 11 | 10 | 1 | 0 | 0 | 0 | 0 | 0 | 200.6 | 67.7 | 50.5 | 25.0 | 0.0 | 343.7 | 10 | 34.4 | 20.1 | 22% |
| opencode-deepseek / post | 10 | 8 | 1 | 1 | 0 | 0 | 0 | 0 | 194.1 | 65.8 | 33.0 | 14.3 | 0.0 | 307.3 | 8 | 38.4 | 24.3 | 15% |
| claude-code-opus / machinery | 9 | 6 | 2 | 0 | 1 | 0 | 0 | 0 | 177.2 | 37.7 | 0.0 | 0.0 | 0.0 | 214.9 | 6 | 35.8 | 29.5 | 0% |
| codex-gpt-luna / repair | 8 | 6 | 0 | 0 | 2 | 0 | 0 | 0 | 142.9 | 19.5 | 0.0 | 0.0 | 0.0 | 162.4 | 6 | 27.1 | 23.8 | 0% |
| opencode-deepseek / interpret | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 93.8 | 35.9 | 10.4 | 4.5 | 0.0 | 144.6 | 6 | 24.1 | 15.6 | 10% |
| claude-code-opus / scout | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 75.0 | 26.4 | 0.0 | 0.0 | 0.0 | 101.4 | 5 | 20.3 | 15.0 | 0% |
| opencode-deepseek / scout | 5 | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 68.0 | 14.9 | 0.0 | 0.0 | 0.0 | 83.0 | 4 | 20.7 | 17.0 | 0% |
| claude-code-opus / verify | 4 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 57.4 | 15.6 | 0.0 | 0.0 | 0.0 | 73.0 | 3 | 24.3 | 19.1 | 0% |
| claude-code-sonnet / verify | 3 | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 31.7 | 3.7 | 0.0 | 0.0 | 0.0 | 35.4 | 1 | 35.4 | 31.7 | 0% |
| codex-gpt-luna-medium / entry | 3 | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 34.5 | 5.1 | 0.0 | 0.0 | 0.0 | 39.6 | 1 | 39.6 | 34.5 | 0% |
| opencode-deepseek / verify | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 23.9 | 8.2 | 8.4 | 3.3 | 0.0 | 43.7 | 2 | 21.8 | 11.9 | 27% |
| codex-gpt-luna-medium / machinery | 2 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 71.0 | 20.9 | 24.1 | 13.6 | 0.0 | 129.6 | 1 | 129.6 | 71.0 | 29% |
| claude-code-sonnet / entry | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 12.2 | 0.0 | 0.0 | 0.0 | 0.0 | 12.2 | 0 | n/a | n/a | 0% |
| opencode-muse-spark / machinery | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 29.3 | 0.0 | 0.0 | 0.0 | 0.0 | 29.3 | 0 | n/a | n/a | 0% |
| opencode-zen-muse-spark / machinery | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 28.9 | 0.0 | 0.0 | 0.0 | 0.0 | 28.9 | 0 | n/a | n/a | 0% |
| codex-gpt-luna / post | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 11.2 | 0.0 | 0.0 | 0.0 | 0.0 | 11.2 | 0 | n/a | n/a | 0% |
| codex-gpt-luna / machinery | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 24.3 | 9.9 | 28.7 | 4.4 | 0.0 | 67.3 | 1 | 67.3 | 24.3 | 49% |
| codex-gpt-luna-medium / interpret | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 14.4 | 5.1 | 0.0 | 0.0 | 0.0 | 19.5 | 1 | 19.5 | 14.4 | 0% |

## By author runner, overall (all job types combined)

| key | n | done | failed | disc | blk | int | cap | abn | author-mm | review1-mm | revision-mm | review2-mm | other-mm | total-mm | merged | workflow-mm/merged | author-mm/merged | revision-share |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| opencode-deepseek (all types) | 114 | 106 | 7 | 1 | 0 | 0 | 0 | 0 | 1507.0 | 474.8 | 204.7 | 100.5 | 0.0 | 2287.0 | 106 | 21.6 | 14.2 | 13% |
| claude-code-opus (all types) | 88 | 76 | 10 | 0 | 2 | 0 | 0 | 0 | 1525.6 | 409.3 | 61.7 | 40.9 | 0.0 | 2037.4 | 76 | 26.8 | 20.1 | 5% |
| codex-gpt-luna-medium (all types) | 25 | 18 | 2 | 2 | 3 | 0 | 0 | 0 | 297.4 | 118.5 | 78.9 | 42.5 | 0.0 | 537.3 | 18 | 29.9 | 16.5 | 23% |
| codex-gpt-luna (all types) | 10 | 7 | 0 | 0 | 3 | 0 | 0 | 0 | 178.4 | 29.3 | 28.7 | 4.4 | 0.0 | 240.9 | 7 | 34.4 | 25.5 | 14% |
| claude-code-sonnet (all types) | 4 | 1 | 2 | 0 | 1 | 0 | 0 | 0 | 43.9 | 3.7 | 0.0 | 0.0 | 0.0 | 47.6 | 1 | 47.6 | 43.9 | 0% |
| opencode-muse-spark (all types) | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 29.3 | 0.0 | 0.0 | 0.0 | 0.0 | 29.3 | 0 | n/a | n/a | 0% |
| opencode-zen-muse-spark (all types) | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 28.9 | 0.0 | 0.0 | 0.0 | 0.0 | 28.9 | 0 | n/a | n/a | 0% |

## Reviewer runner mix per (author runner, type) cell

Counts are jobs in that cell naming the given runner on that review role.

| author runner / type | review1 runner(s) : n jobs | review2 runner(s) : n jobs |
|---|---|---|
| opencode-deepseek / repair | claude-code-opus:77 | claude-code-opus:11 |
| claude-code-opus / repair | claude-code-opus:32 | claude-code-opus:1 |
| codex-gpt-luna-medium / repair | codex-gpt-luna:16 | codex-gpt-luna:6 |
| claude-code-opus / interpret | claude-code-opus:9 | claude-code-opus:1 |
| claude-code-opus / post | claude-code-opus:10 | claude-code-opus:4 |
| claude-code-opus / entry | claude-code-opus:11 | claude-code-opus:2 |
| opencode-deepseek / entry | claude-code-opus:10 | claude-code-opus:5 |
| opencode-deepseek / post | claude-code-opus:9 | claude-code-opus:4 |
| claude-code-opus / machinery | claude-code-opus:6 | - |
| codex-gpt-luna / repair | codex-gpt-luna:5, claude-code-opus:1 | - |
| opencode-deepseek / interpret | claude-code-opus:6 | claude-code-opus:1 |
| claude-code-opus / scout | claude-code-opus:5 | - |
| opencode-deepseek / scout | claude-code-opus:4 | - |
| claude-code-opus / verify | claude-code-opus:3 | - |
| claude-code-sonnet / verify | claude-code-opus:1 | - |
| codex-gpt-luna-medium / entry | codex-gpt-luna:1 | - |
| opencode-deepseek / verify | claude-code-opus:2 | claude-code-opus:1 |
| codex-gpt-luna-medium / machinery | codex-gpt-luna:2 | codex-gpt-luna:2 |
| codex-gpt-luna / machinery | codex-gpt-luna:1 | codex-gpt-luna:1 |
| codex-gpt-luna-medium / interpret | codex-gpt-luna:1 | - |

Cells not listed (`claude-code-sonnet / entry`, `opencode-muse-spark /
machinery`, `opencode-zen-muse-spark / machinery`, `codex-gpt-luna / post`)
have no review1 or review2 phase recorded at all — every job in those cells
either has no `phases` array or stopped before reaching review.

## Reviewer runner mix per author runner, overall

| author runner | review1 runner(s) : n jobs | review2 runner(s) : n jobs |
|---|---|---|
| opencode-deepseek | claude-code-opus:108 | claude-code-opus:22 |
| claude-code-opus | claude-code-opus:76 | claude-code-opus:8 |
| codex-gpt-luna-medium | codex-gpt-luna:20 | codex-gpt-luna:8 |
| codex-gpt-luna | codex-gpt-luna:6, claude-code-opus:1 | codex-gpt-luna:1 |
| claude-code-sonnet | claude-code-opus:1 | - |
| opencode-muse-spark | - | - |
| opencode-zen-muse-spark | - | - |

## Type = repair only, by author runner

| key | n | done | failed | disc | blk | int | cap | abn | author-mm | review1-mm | revision-mm | review2-mm | other-mm | total-mm | merged | workflow-mm/merged | author-mm/merged | revision-share |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| opencode-deepseek / repair | 80 | 76 | 4 | 0 | 0 | 0 | 0 | 0 | 926.7 | 282.2 | 102.5 | 53.4 | 0.0 | 1364.8 | 76 | 18.0 | 12.2 | 11% |
| claude-code-opus / repair | 34 | 32 | 2 | 0 | 0 | 0 | 0 | 0 | 433.8 | 111.1 | 11.6 | 8.9 | 0.0 | 565.4 | 32 | 17.7 | 13.6 | 4% |
| codex-gpt-luna-medium / repair | 19 | 15 | 0 | 1 | 3 | 0 | 0 | 0 | 177.5 | 87.4 | 54.8 | 28.9 | 0.0 | 348.6 | 15 | 23.2 | 11.8 | 24% |
| codex-gpt-luna / repair | 8 | 6 | 0 | 0 | 2 | 0 | 0 | 0 | 142.9 | 19.5 | 0.0 | 0.0 | 0.0 | 162.4 | 6 | 27.1 | 23.8 | 0% |

No `type=repair` jobs are recorded with `claude-code-sonnet`,
`opencode-muse-spark`, or `opencode-zen-muse-spark` as author runner (0 rows).

---

## Workflow mm per merged job vs. author-only mm per merged job, by runner (overall)

Plain statement, no ranking or recommendation — numbers only, from the "By
author runner, overall" table above:

- **opencode-deepseek**: workflow 21.6 mm/merged job vs. author-only 14.2
  mm/merged job (n=114, 106 merged; revision-share of total cell mm 13%).
- **claude-code-opus**: workflow 26.8 mm/merged job vs. author-only 20.1
  mm/merged job (n=88, 76 merged; revision-share 5%).
- **codex-gpt-luna-medium**: workflow 29.9 mm/merged job vs. author-only 16.5
  mm/merged job (n=25, 18 merged; revision-share 23%).
- **codex-gpt-luna**: workflow 34.4 mm/merged job vs. author-only 25.5
  mm/merged job (n=10, 7 merged; revision-share 14%).
- **claude-code-sonnet**: workflow 47.6 mm/merged job vs. author-only 43.9
  mm/merged job (n=4, only 1 merged — single-job figure, not a rate).
- **opencode-muse-spark**: n=1, 0 merged — workflow-mm/merged and
  author-mm/merged are both n/a (no jobs merged in this cell to divide by).
- **opencode-zen-muse-spark**: n=1, 0 merged — same, both n/a.

And restricted to **type=repair** only, by runner:

- **opencode-deepseek / repair**: workflow 18.0 mm/merged job vs. author-only
  12.2 mm/merged job (n=80, 76 merged; revision-share 11%).
- **claude-code-opus / repair**: workflow 17.7 mm/merged job vs. author-only
  13.6 mm/merged job (n=34, 32 merged; revision-share 4%).
- **codex-gpt-luna-medium / repair**: workflow 23.2 mm/merged job vs.
  author-only 11.8 mm/merged job (n=19, 15 merged; revision-share 24%).
- **codex-gpt-luna / repair**: workflow 27.1 mm/merged job vs. author-only
  23.8 mm/merged job (n=8, 6 merged; revision-share 0%).
