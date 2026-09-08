# Stage-0 baseline — task 28

Read-only measurement. Nothing in the repository was modified; no gate, build,
Pulse or Desk run was invoked. `data/launch.json` was **not** edited by this
report — task 28 assigns that write to the orchestrator/architect applying
these numbers, not to this measurement pass.

## Invocation

```
node D:/AddictedtoAI/openspec/changes/two-desks-work-orders-and-trains/evidence/scripts/stage0-baseline.mjs
```

The script is committed at
`openspec/changes/two-desks-work-orders-and-trains/evidence/scripts/stage0-baseline.mjs`,
reads only `data/ledger.jsonl` and `git log`/`git show` history (via
`execFileSync` — never `git show "rev:path"` through a shell, which the
project's Windows notes record as silently returning zero bytes under Git
Bash/MSYS), writes nothing, and prints one JSON object to stdout. It is
re-runnable by anyone with the repository; no session-scoped path appears in
it. Generated at `2026-09-08T15:48:37.494Z` against 243 ledger lines / 208
`outcome: "done"` jobs.

## Why this exists (F13)

`design.md`'s Measurement plan and Opus review finding **F13**
(`evidence/reviews/round1-sealed-opus-high.md`, "The Stage-2 decision rule
compares two different quantities") both make the same point: the pre-change
baseline in `desk-mech-report.md` §A was measured **brief-commit → records
commit, per job**. Once Stage 1 moves the records commit to the train
(`specs/loop`: *"A train run SHALL be, in this order: … the records commit;
the publish"*), that span will cover up to `K` merges plus a full train and
will no longer be the quantity the historical figure measured. Task 34's
Stage-2 gate (*"if the ledger's median brief→records overhead is not below 2.5
minutes …"*) needs a baseline taken **on the new definition, before anything
moves** — that is this task. This script takes it now, on
`brief-commit → merge-onto-main` (the Stage-1-safe proxy for
`brief → merge-onto-train`, since there is no train yet), and also computes
the old brief→records definition for the same job set so the difference F13
describes is a measured number, not an assertion.

## Definitions

1. **NEW (Stage-1-safe) — brief-commit → merge, per merged job.** The commit
   `job <id>: brief` (`loop/run.mjs:1350`) to the `--no-ff` merge commit
   `mergeLocal` makes onto `main` (`loop/lib/git.mjs:207`, subject
   `job <id> (<type>): <title>`). Reported two ways: **wall-clock** (raw
   merge-minus-brief, what task 28 literally asks for) and **overhead**
   (wall-clock minus that job's own ledger `mm`) — the second is the quantity
   the historical "5.5-minute" figure and task 34's 2.5-minute threshold are
   actually stated on (F13's evidence quotes desk-mech-report.md's *"5.5 min
   median **overhead**"*, not raw wall-clock), so both are given rather than
   silently picking one and inviting a mismatched comparison exactly like the
   one F13 flagged.
2. **OLD — brief-commit → records-commit, per job.** The same brief commit to
   `job <id>: records (done)` (`loop/run.mjs:2244`), the definition
   `desk-mech-report.md` used before the change. Computed the same two ways
   (wall-clock, overhead) on the same job set, for direct comparison.
3. **Gate seconds.** Not computable from `data/ledger.jsonl` — no ledger line
   in the corpus carries a per-gate timing field (checked: the schema is
   `ts, id, type, runner, provider, tier, mm, outcome, note`, optionally
   `phases`; no `gate_seconds`). Reported instead as a transcription of
   `evidence/gate-timings.txt` and `evidence/gate-timings-npm.txt` — Orch's
   single **push-bar** measurement on commit `78c6361`, publishing off — with
   the caveat stated in both the JSON and this report: it is one measurement,
   not a per-job series.

## Method note: why job id is not enough

A job id in this ledger is *usually* globally unique across git history, but
not always. Six ids on 2026-08-31 (`j-20260831-03..07,12`) each have **two**
sets of `brief` / merge-shaped / `records` commits reachable from `git log
--all`: one real merged set, and one leftover set. For two of those six
(`j-20260831-07`, `j-20260831-12`) the leftover commits are **single-parent**
commits carrying a merge-shaped subject (`job <id> (<type>): <title>`) whose
committer date trails its author date by roughly an hour — the signature of a
manually replayed/cherry-picked commit, not a live `mergeLocal` merge. A naive
"first/last commit matching this subject text" pairing (the shape of the
pre-existing `desk-mech-*.mjs` scratch scripts) would have silently paired a
brief from one attempt with a merge or records commit from the other for these
ids, which can badly distort that job's measured wall-clock.

This script instead **anchors on the ledger line's own timestamp**
(`ts`, written by `recordOutcome` immediately after the merge, before the
records commit — `loop/run.mjs:2014`,`:2244`), finds the `records (done)`
commit closest to that timestamp, takes **its parent** as the merge commit
(`commitJobRecords` commits the tree exactly at the merge), and walks the
merge commit's **second parent** (the branch tip — `mergeLocal` does
`git merge --no-ff branch`) backward through single-parent ancestry to the
`job <id>: brief` commit. This derives the brief commit from the *correct*
merge's own branch history rather than a repository-wide subject search, so a
duplicate-id leftover branch cannot be substituted in silently. Only when this
fails (no records commit reachable, or the walk never reaches a brief commit)
does the script fall back to a direct **unique**-merge-commit search; an id
with more than one merge-shaped candidate and no records commit to
disambiguate is excluded and named.

**Validation this method is not overfit:** the OLD-definition **overhead**
figure it produces (median **5.497 min**, all-time, n=165) reproduces
`desk-mech-report.md`'s independently-computed **"5.5 min median overhead"**
almost exactly, despite this script using a different (stricter,
anchor-then-walk) pairing method and a different n. The brief_chars-by-day
series below also reproduces that report's spot-checked figures (16,181 on
08-28, 33,491 on 09-02, 70,349 on 09-06 vs. this script's per-day medians
16,240 / 33,901 / 70,681).

## Results

### 1. Brief-commit → merge, wall-clock and overhead (n, exclusions)

| Window | n | excluded | wall-clock median / mean / p90 (min) | overhead median / mean / p90 (min) |
|---|---|---|---|---|
| All-time | 206 | 2 | 22.81 / 27.83 / 41.48 | 3.85 / 6.15 / 5.82 |
| Since 2026-09-01 | 193 | 2 | 23.35 / 28.11 / 41.53 | 3.90 / 6.38 / 6.02 |

**Excluded (both windows, same 2 ids — both predate 2026-09-01):**

| id | reason |
|---|---|
| `j-20260831-07` | no merge commit found — two merge-shaped-subject commits share this id and neither is reachable as a `records(done)` commit's parent; the true merge cannot be disambiguated from the manually-replayed leftover (see Method note) |
| `j-20260831-12` | same reason |

**Interpretation.** The **overhead** figure (3.85–3.90 min median) is the one
comparable to the historical 5.5-minute baseline and to task 34's 2.5-minute
Stage-2 threshold. It is *already* below 2.5×2 = 5 min and meaningfully below
the old 5.5-minute figure — expected, since brief→merge is a strict prefix of
brief→records (the merge happens before the pre-records cleanup/rederive
work), so this is not evidence Stage 1 improved anything; it is evidence the
two spans measure different amounts of work, exactly F13's point. **Do not
compare 3.85/3.90 directly against the 5.5-minute historical figure** — compare
it against whatever Stage 1 measures on the *same* new definition later.

### 2. Old definition, same set, for comparison (F13's two quantities side by side)

| Window | n | missing records commit | wall-clock median / mean / p90 (min) | overhead median / mean / p90 (min) |
|---|---|---|---|---|
| All-time | 165 (of 206) | 41 | 25.67 / 31.00 / 43.08 | 5.50 / 8.09 / 7.04 |
| Since 2026-09-01 | 155 (of 193) | 38 | 25.85 / 31.32 / 43.08 | 5.52 / 8.39 / 7.09 |

The all-time OLD-definition **overhead** median (5.50 min) matches
`desk-mech-report.md`'s 5.5-minute figure to within rounding — see Validation
above. `desk-mech-report.md` reported n=172 for its since-2026-09-01 window;
this script finds n=155 satisfying the stricter one-to-one anchored pairing.
The difference is not a discrepancy to resolve here — it is the reason this
script exists: this script requires a *found, uniquely-paired*
`records (done)` commit rather than the first/last subject-text match, and (as
below) **41 of 206 (19.9%) all-time / 38 of 193 (19.7%) since-09-01 done jobs
have NO discoverable `records (done)` commit in git history at all**, which
the looser method would not have flagged as missing.

### 3. brief_chars — median, mean, p90, and growth by day

| Window | n | median | mean | p90 |
|---|---|---|---|---|
| All-time | 206 | 37,183.5 | 50,819.4 | 101,952.5 |
| Since 2026-09-01 | 193 | 37,611 | 52,224.5 | 102,154 |

By local calendar day of the brief commit (bytes of `.job/brief.md` at that
commit; no `done` job's brief commit falls on 2026-08-30, hence the gap):

| date | n | median | mean | min | max |
|---|---|---|---|---|---|
| 2026-08-28 | 1 | 16,240 | 16,240 | 16,240 | 16,240 |
| 2026-08-29 | 2 | 16,167.5 | 16,167.5 | 14,784 | 17,551 |
| 2026-08-31 | 10 | 35,740 | 34,089.9 | 24,118 | 38,324 |
| 2026-09-01 | 23 | 37,804 | 38,428.3 | 33,877 | 61,933 |
| 2026-09-02 | 22 | 33,901 | 35,867.8 | 33,423 | 57,296 |
| 2026-09-03 | 21 | 36,414 | 38,125.1 | 33,592 | 63,371 |
| 2026-09-04 | 55 | 34,140 | 35,635.6 | 33,515 | 61,368 |
| 2026-09-05 | 22 | 42,422 | 49,251.9 | 33,839 | 72,531 |
| 2026-09-06 | 16 | 70,681 | 71,528.5 | 66,622 | 92,438 |
| 2026-09-07 | 26 | 102,596.5 | 100,116.0 | 66,569 | 117,547 |
| 2026-09-08 | 8 | 104,117 | 101,848.5 | 89,427 | 104,751 |

The growth `desk-mech-report.md` §B described (16,181 → 33,491 → 70,349 →
103,881 chars, "a 6.4× rise in eleven days", attributed to
`BRIEF_EXCERPT_MAX_CHARS` being raised four times) is visible directly in this
table, from an independent measurement.

### 4. Gate seconds — not a per-job series; Orch's push-bar table, transcribed

Measured on commit `78c6361`, publishing off, serial (not this script's
output — `evidence/gate-timings.txt` and `evidence/gate-timings-npm.txt`,
transcribed here and embedded verbatim in the script's JSON):

| gate | exit | secs | share |
|---|---|---|---|
| npm test | — | (not run this pass; separate npm-gates pass below) | — |
| npm run build | — | (not run this pass; separate npm-gates pass below) | — |
| verify-launch | 0 | 39.6 | 40.2% |
| verify-design | 0 | 35.7 | 36.3% |
| verify-surfaces | 0 | 3.7 | 3.7% |
| verify-analytics | 0 | 19.5 | 19.8% |
| **verify-gates total** | | **98.5** | |

Separate npm-gates pass (`cmd.exe /c`):

| gate | exit | secs |
|---|---|---|
| npm test | 0 | 314.8 |
| npm run build | 0 | 29.2 |

A job's own `DEFAULT_GATES` (`loop/lib/gates.mjs:346`) run four of these six —
`npm test`, `npm run build`, `verify-surfaces`, `verify-design` — not
`verify-launch` or `verify-analytics`, which run only in this push-bar
measurement. This is **one measurement on one commit**, not a distribution
over jobs; it cannot be given an n, median or p90 the way the other two
quantities can.

## The JSON the script printed

The script's stdout is one JSON object. Its aggregate sections (`meta`,
`brief_to_merge`, `brief_chars`, `gate_seconds`, `excluded_jobs`) are
reproduced below verbatim. The full per-job `jobs` array (206 rows — id,
type, ledger `mm`, method, short SHAs and dates for brief/merge/records, both
wall-clock and overhead minutes, `brief_chars`) and the embedded raw text of
`gate-timings.txt`/`gate-timings-npm.txt` are omitted from this copy only for
length (3,760 lines / 123 KB in full); a representative 6-row excerpt (the
three earliest and three most recent included jobs) follows, and the complete
array is reproduced byte-for-byte by running the invocation line above.

```json
{
  "meta": {
    "script": "openspec/changes/two-desks-work-orders-and-trains/evidence/scripts/stage0-baseline.mjs",
    "generated_at": "2026-09-08T15:48:37.494Z",
    "repo": "D:/AddictedtoAI",
    "ledger_path": "data/ledger.jsonl",
    "ledger_lines": 243,
    "done_jobs": 208,
    "since_cutoff_local_date": "2026-09-01"
  },
  "brief_to_merge": {
    "definition": "merge commit (\"job <id> (<type>): ...\", the --no-ff commit made by mergeLocal, loop/lib/git.mjs:207) minus brief commit (\"job <id>: brief\", loop/run.mjs:1350) wall-clock, per merged (outcome=done) job. \"_wallclock\" is the raw figure task 28 asks for; \"_overhead\" subtracts the ledger's own model-minutes (mm) for that job and is the quantity desk-mech-report.md's \"5.5-minute median overhead\" and task 34's 2.5-minute Stage-2 threshold (per F13) are actually stated on — reported so the two are not conflated.",
    "all_time": {
      "n": 206,
      "excluded_n": 2,
      "excluded_ids": ["j-20260831-07", "j-20260831-12"],
      "brief_to_merge_wallclock": { "n": 206, "median": 22.80833333333333, "mean": 27.82912621359224, "p90": 41.475 },
      "brief_to_merge_overhead": { "n": 206, "median": 3.8533333333333326, "mean": 6.146893203883495, "p90": 5.8166666666666655 },
      "brief_to_records_wallclock_old_definition": { "n": 165, "median": 25.666666666666668, "mean": 30.99646464646467, "p90": 43.083333333333336 },
      "brief_to_records_overhead_old_definition": { "n": 165, "median": 5.496666666666666, "mean": 8.092525252525252, "p90": 7.044 },
      "brief_to_records_n_missing": 41
    },
    "since_2026_09_01": {
      "n": 193,
      "excluded_n": 2,
      "excluded_ids": ["j-20260831-07", "j-20260831-12"],
      "brief_to_merge_wallclock": { "n": 193, "median": 23.35, "mean": 28.106908462867008, "p90": 41.53 },
      "brief_to_merge_overhead": { "n": 193, "median": 3.9033333333333324, "mean": 6.377167530224527, "p90": 6.016666666666667 },
      "brief_to_records_wallclock_old_definition": { "n": 155, "median": 25.85, "mean": 31.324408602150545, "p90": 43.083333333333336 },
      "brief_to_records_overhead_old_definition": { "n": 155, "median": 5.52, "mean": 8.393956989247311, "p90": 7.087999999999999 },
      "brief_to_records_n_missing": 38
    }
  },
  "brief_chars": {
    "definition": "byte size of .job/brief.md read at the brief commit (git show <brief_sha>:.job/brief.md), for every job in brief_to_merge.all_time's included set.",
    "all_time": { "n": 206, "median": 37183.5, "mean": 50819.446601941745, "p90": 101952.5 },
    "since_2026_09_01": { "n": 193, "median": 37611, "mean": 52224.51813471503, "p90": 102154 },
    "excluded": [],
    "by_day": [
      { "date": "2026-08-28", "n": 1, "median": 16240, "mean": 16240, "min": 16240, "max": 16240 },
      { "date": "2026-08-29", "n": 2, "median": 16167.5, "mean": 16167.5, "min": 14784, "max": 17551 },
      { "date": "2026-08-31", "n": 10, "median": 35740, "mean": 34089.9, "min": 24118, "max": 38324 },
      { "date": "2026-09-01", "n": 23, "median": 37804, "mean": 38428.260869565216, "min": 33877, "max": 61933 },
      { "date": "2026-09-02", "n": 22, "median": 33901, "mean": 35867.818181818184, "min": 33423, "max": 57296 },
      { "date": "2026-09-03", "n": 21, "median": 36414, "mean": 38125.09523809524, "min": 33592, "max": 63371 },
      { "date": "2026-09-04", "n": 55, "median": 34140, "mean": 35635.63636363636, "min": 33515, "max": 61368 },
      { "date": "2026-09-05", "n": 22, "median": 42422, "mean": 49251.90909090909, "min": 33839, "max": 72531 },
      { "date": "2026-09-06", "n": 16, "median": 70681, "mean": 71528.5, "min": 66622, "max": 92438 },
      { "date": "2026-09-07", "n": 26, "median": 102596.5, "mean": 100116.03846153847, "min": 66569, "max": 117547 },
      { "date": "2026-09-08", "n": 8, "median": 104117, "mean": 101848.5, "min": 89427, "max": 104751 }
    ]
  },
  "gate_seconds": {
    "caveat": "NOT a per-job series and NOT computed by this script — the ledger carries no per-gate timing field. This is Orch's single push-bar measurement on commit 78c6361, publishing off, transcribed verbatim from evidence/gate-timings.txt and evidence/gate-timings-npm.txt.",
    "measured_on_commit": "78c6361",
    "verify_gates": [
      { "gate": "npm test", "exit": null, "secs": 0, "share_pct": 0, "note": "not run in this pass; see npm-gates row below" },
      { "gate": "npm run build", "exit": null, "secs": 0, "share_pct": 0, "note": "not run in this pass; see npm-gates row below" },
      { "gate": "verify-launch", "exit": 0, "secs": 39.6, "share_pct": 40.2 },
      { "gate": "verify-design", "exit": 0, "secs": 35.7, "share_pct": 36.3 },
      { "gate": "verify-surfaces", "exit": 0, "secs": 3.7, "share_pct": 3.7 },
      { "gate": "verify-analytics", "exit": 0, "secs": 19.5, "share_pct": 19.8 }
    ],
    "verify_gates_total_secs": 98.5,
    "npm_gates_separate_pass": [
      { "gate": "npm test", "exit": 0, "secs": 314.8 },
      { "gate": "npm run build", "exit": 0, "secs": 29.2 }
    ],
    "note_on_job_gates": "A job runs four of the six gates (npm test, npm run build, verify-surfaces, verify-design — DEFAULT_GATES, loop/lib/gates.mjs:346), not all six; verify-launch and verify-analytics run only in this push-bar measurement, not inside a job."
  },
  "excluded_jobs": [
    { "id": "j-20260831-07", "reason": "no merge commit found (no records(done) commit, and no unique merge-shaped commit by subject)" },
    { "id": "j-20260831-12", "reason": "no merge commit found (no records(done) commit, and no unique merge-shaped commit by subject)" }
  ]
}
```

**Excerpt of the omitted `jobs` array** (first 3 and last 3 of 206, in the
order the script emits them):

```json
[
  {
    "id": "j-20260829-02", "type": "verify", "mm": 10.16, "method": "records-anchored",
    "brief_sha": "da073796e483", "merge_sha": "8455341fabd7", "records_sha": "c9204f920edf",
    "brief_date": "2026-08-28T20:32:03-06:00", "merge_date": "2026-08-28T20:43:48-06:00", "records_date": "2026-08-28T20:44:15-06:00",
    "brief_to_merge_min": 11.75, "brief_to_merge_overhead_min": 1.59,
    "brief_to_records_min": 12.2, "brief_to_records_overhead_min": 2.04,
    "brief_chars": 16240
  },
  {
    "id": "j-20260830-01", "type": "repair", "mm": 11.72, "method": "direct-unique-merge",
    "brief_sha": "42f3e98de4f4", "merge_sha": "a2f59a031c9b", "records_sha": "5cbbca56c31b",
    "brief_date": "2026-08-29T20:22:12-06:00", "merge_date": "2026-08-29T20:36:25-06:00", "records_date": "2026-08-29T20:37:43-06:00",
    "brief_to_merge_min": 14.217, "brief_to_merge_overhead_min": 2.497,
    "brief_to_records_min": 15.517, "brief_to_records_overhead_min": 3.797,
    "brief_chars": 14784
  },
  {
    "id": "j-20260830-02", "type": "interpret", "mm": 23.26, "method": "direct-unique-merge",
    "brief_sha": "4b678cb9d8d9", "merge_sha": "d9e79bd0a85e", "records_sha": "fe7126001216",
    "brief_date": "2026-08-29T20:44:43-06:00", "merge_date": "2026-08-29T21:09:54-06:00", "records_date": "2026-08-29T21:11:10-06:00",
    "brief_to_merge_min": 25.183, "brief_to_merge_overhead_min": 1.923,
    "brief_to_records_min": 26.45, "brief_to_records_overhead_min": 3.19,
    "brief_chars": 17551
  },
  {
    "id": "j-20260908-11", "type": "interpret", "mm": 19.46, "method": "records-anchored",
    "brief_sha": "a9a7771ff082", "merge_sha": "22ddfa4f843d", "records_sha": "3d8014f95d14",
    "brief_date": "2026-09-08T04:18:13-06:00", "merge_date": "2026-09-08T04:44:19-06:00", "records_date": "2026-09-08T04:45:01-06:00",
    "brief_to_merge_min": 26.1, "brief_to_merge_overhead_min": 6.64,
    "brief_to_records_min": 26.8, "brief_to_records_overhead_min": 7.34,
    "brief_chars": 104012
  },
  {
    "id": "j-20260908-12", "type": "repair", "mm": 35.1, "method": "records-anchored",
    "brief_sha": "3f38aa9a87af", "merge_sha": "146c65502fb0", "records_sha": "03bcf6bea6b2",
    "brief_date": "2026-09-08T04:46:21-06:00", "merge_date": "2026-09-08T05:27:20-06:00", "records_date": "2026-09-08T05:27:57-06:00",
    "brief_to_merge_min": 40.983, "brief_to_merge_overhead_min": 5.883,
    "brief_to_records_min": 41.6, "brief_to_records_overhead_min": 6.5,
    "brief_chars": 101765
  },
  {
    "id": "j-20260908-13", "type": "machinery", "mm": 72.69, "method": "records-anchored",
    "brief_sha": "f1525754f7c1", "merge_sha": "2af5ffbe37de", "records_sha": "fa55c743ef79",
    "brief_date": "2026-09-08T05:37:06-06:00", "merge_date": "2026-09-08T06:56:12-06:00", "records_date": "2026-09-08T06:56:53-06:00",
    "brief_to_merge_min": 79.1, "brief_to_merge_overhead_min": 6.41,
    "brief_to_records_min": 79.783, "brief_to_records_overhead_min": 7.093,
    "brief_chars": 89427
  }
]
```

## What could not be measured from the repository

**Per-gate wall-clock, per job.** The ledger records total `mm`
(model-minutes) and, on 239 lines, per-phase `mm` by role — never a per-gate
timing. There is exactly one gate measurement in the whole repository
(`gate-timings.txt`/`gate-timings-npm.txt`), taken once, on one commit, with
publishing off, serially. It cannot be decomposed into a distribution the way
brief→merge or brief_chars can; reporting a median/p90 for it would imply a
sample size this repository does not have. Task 28's own text anticipates this
by asking for "per-gate seconds" without asking for n/median/p90 the way it
does for the other two quantities.

**41 (all-time) / 38 (since 09-01) of the 208 `done` jobs have no discoverable
`job <id>: records (done)` commit anywhere in git history**, confirmed by
direct `git log --all` search on several of them (e.g. `j-20260831-10`,
`j-20260901-02`, `j-20260901-06`) — not merely "the script's method missed
it." In every sampled case, the commit immediately following that job's merge
(within 20–75 seconds) is a `pulse: <date> data and content update` commit
from a concurrent process, consistent with `commitJobRecords`'s own
early-return path (`loop/run.mjs:2133-2137`, *"no record path existed to
stage"*) firing because the ledger/derived paths it would have staged were
already committed by that concurrent Pulse run. This is an observed pattern
across a sample, not a verified cause for all 41/38 individually — stated at
that level of confidence deliberately. Its effect on this report: the OLD
definition's n is smaller than the NEW definition's n (165 vs 206 all-time,
155 vs 193 since 09-01), which is itself evidence for adopting the NEW
definition — it is measurable for more of the corpus, not only conceptually
correct per F13.

**Two jobs' true merge history is unrecoverable by subject search alone**
(`j-20260831-07`, `j-20260831-12` — see Method note). Their commits exist in
`git log --all` but with a topology (single-parent, author/committer date gap)
consistent with manual replay rather than a live `mergeLocal` run, and no
`records(done)` commit exists to anchor which of the two candidate histories
is real. Excluded rather than guessed.

**Token count was not measured** — only bytes (`brief_chars`, per task 28's
own wording, "the byte size of `.job/brief.md`"). `desk-mech-report.md`'s
~4-chars/token estimate is not re-derived here.

**Wall-clock, not model cost, and not isolated from concurrent activity.**
Both the NEW and OLD wall-clock figures are real elapsed time between two git
commit timestamps; they include whatever else the machine was doing in that
window (a concurrent Pulse run, another process's git operations, an operator
pause) exactly as `desk-mech-report.md`'s own gap-based proxies do, and this
script makes no attempt to net that out beyond the `_overhead` subtraction of
that job's own `mm` (which nets out that job's own model call, not
unrelated concurrent work). The `_overhead` figures should be read as an
upper bound on true fixed cost, not an exact one, for the same reason
`desk-mech-report.md` §A states for its own figure.

**Per-train figures do not exist yet** — there is no train mechanism in this
repository as of this measurement (Stage 1, tasks 30–33, is unimplemented),
so nothing here characterizes train-level cost; that is out of scope for a
Stage-0 baseline by construction (design.md: *"the per-train figure is
separate"*).
