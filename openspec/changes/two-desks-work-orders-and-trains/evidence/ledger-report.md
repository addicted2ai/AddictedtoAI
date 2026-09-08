# Desk job ledger audit — 2026-08-28 through 2026-09-08

Read-only measurement. Nothing in the repository was modified; no gate, build,
test, Pulse or Desk run was executed. All numbers below are computed from four
data sources, joined on job id (`j-YYYYMMDD-NN`):

1. **`D:/AddictedtoAI/data/ledger.jsonl`** (242 lines / 241 unique job ids,
   schema read from `loop/lib/ledger.mjs`) — one line per job outcome, carrying
   `ts`, `type`, `outcome`, `mm` (total model-minutes across all invocations),
   and an optional `phases[]` array with `{role, mm, outcome}` per invocation
   (author / review1 / revision / review2).
2. **`git -C D:/AddictedtoAI log --since=2026-08-28 ... --numstat`** — every commit
   on `main` since the greenfield rebuild. Commits are grouped by the job id in
   their subject line (`job j-YYYYMMDD-NN[ (type)]: ...`). For each job, the net
   diff is `git diff <parent-of-earliest-commit>..<latest-commit> --numstat`, which
   nets out intermediate scaffolding adds/removes (`.job/brief.md`, etc.) rather
   than summing each commit's numstat separately.
3. **`C:/Users/BadBitch/.claude/usage/*.json`** (377 files) — session cost records.
   Only `"source":"transcript-sweep"` files (Desk/print-mode sessions, priced from
   transcripts per `usage-sweep.mjs`) carrying a `job_id` are used; `"source":
   "statusline"` files are interactive sessions and are excluded. 322 of 365
   transcript-sweep files carry a job_id; they cover 201 of 241 unique ledger job ids
   (a review pass's worktree, e.g. `...-j-20260906-18-review-1`, is folded onto its
   parent job id by `usage-sweep.mjs`'s own `jobIdForCwd()`, so a job's total cost
   sums its author + review + revision sessions).
4. **`data/reviews/j-*.md` and `data/proposals/**`** — review-verdict front matter
   (parsed with the repo's own `gray-matter` dependency, same parser
   `loop/lib/verdict.mjs` uses) and proposal counts by directory/type.

**What could NOT be computed, stated up front rather than estimated:**
- Wall-clock duration is measurable from git commit timestamps ONLY for merged
  (`outcome:"done"`) jobs — see the caveat in section C. A non-merging job leaves
  a single bookkeeping commit on `main`, so its actual run duration is not
  reconstructable from this repository's git history.
- `mm` (model-minutes) is the loop's own per-invocation spend and is **not**
  inclusive of gate runs (`npm test`, `npm run build`, etc.) between phases —
  those happen between invocations, outside any priced model session, so they
  are captured only in the wall-clock gap (median wall-clock 24.3 min vs median
  total mm 18.4 min — roughly 6 minutes/job of gates+merge overhead not billed
  to any model).
- 40 of 242 ledger lines (16.5%) have no matching costed usage file (older
  sessions whose transcripts may have been pruned, or jobs run before usage-sweep
  existed) — cost figures below are computed over the 201-job joined subset only,
  named explicitly wherever used.

---
## A. Jobs per day (by ledger line, since 2026-08-28)

| Date | Total | done | failed | discarded | blocked | interrupted | capacity | abandoned | top types |
|---|---|---|---|---|---|---|---|---|---|
| 2026-08-28 | 2 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | entry:1 verify:1 |
| 2026-08-29 | 3 | 1 | 2 | 0 | 0 | 0 | 0 | 0 | verify:2 repair:1 |
| 2026-08-30 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | repair:1 interpret:1 |
| 2026-08-31 | 15 | 12 | 2 | 0 | 1 | 0 | 0 | 0 | post:5 entry:3 repair:3 scout:2 interpret:2 |
| 2026-09-01 | 23 | 23 | 0 | 0 | 0 | 0 | 0 | 0 | repair:19 interpret:2 scout:1 entry:1 |
| 2026-09-02 | 25 | 22 | 3 | 0 | 0 | 0 | 0 | 0 | repair:19 scout:2 entry:2 interpret:1 post:1 |
| 2026-09-03 | 23 | 21 | 1 | 1 | 0 | 0 | 0 | 0 | repair:12 entry:4 post:4 interpret:1 scout:1 verify:1 |
| 2026-09-04 | 56 | 55 | 1 | 0 | 0 | 0 | 0 | 0 | repair:45 machinery:4 post:3 scout:1 entry:1 verify:1 interpret:1 |
| 2026-09-05 | 26 | 22 | 4 | 0 | 0 | 0 | 0 | 0 | interpret:9 repair:8 post:3 machinery:2 verify:2 scout:1 entry:1 |
| 2026-09-06 | 19 | 16 | 2 | 0 | 1 | 0 | 0 | 0 | entry:10 post:3 machinery:2 verify:2 interpret:1 scout:1 |
| 2026-09-07 | 35 | 26 | 4 | 0 | 4 | 0 | 1 | 0 | repair:25 post:4 machinery:4 entry:1 scout:1 |
| 2026-09-08 | 13 | 8 | 2 | 1 | 2 | 0 | 0 | 0 | repair:8 entry:3 interpret:1 machinery:1 |

Totals by type: {"entry":27,"verify":9,"repair":141,"interpret":19,"scout":10,"post":23,"machinery":13}

Totals by outcome: {"failed":22,"blocked":9,"done":208,"discarded":2,"capacity":1}

Outcome by type (which types ever merge):
- **entry**: {"failed":5,"done":22}
- **verify**: {"blocked":1,"failed":2,"done":6}
- **repair**: {"failed":6,"done":129,"blocked":5,"discarded":1}
- **interpret**: {"done":16,"blocked":1,"failed":2}
- **scout**: {"done":9,"failed":1}
- **post**: {"done":18,"discarded":1,"failed":3,"blocked":1}
- **machinery**: {"done":8,"failed":3,"blocked":1,"capacity":1}

Duplicate ledger ids (same job id, >1 ledger line): [{"id":"j-20260907-13","count":2}]
  - j-20260907-13: 2026-09-07T15:17:19.710Z outcome=capacity mm=29.27 note="RESULT.md is absent; the runner's declared capacity_stderr_pattern matched its stderr" | 2026-09-07T16:07:41.943Z outcome=failed mm=28.86 note="reserved-path edit attempt"

## B. Per-job size for MERGED jobs (outcome=done), from `git diff <parent-of-first-commit>..<last-commit> --numstat`

Ledger lines with outcome=done: 208 (unique ids: 208)
Of those, job ids found in git history (main) since 2026-08-28: 208
Job ids with commits on main but ledger outcome != done: [["j-20260828-01","failed"],["j-20260828-02","blocked"],["j-20260829-01","failed"],["j-20260829-03","failed"],["j-20260831-02","blocked"],["j-20260831-09","failed"],["j-20260831-14","failed"],["j-20260902-06","failed"],["j-20260902-09","failed"],["j-20260902-10","failed"],["j-20260903-03","discarded"],["j-20260903-04","failed"],["j-20260904-38","failed"],["j-20260905-02","failed"],["j-20260905-17","failed"],["j-20260905-20","failed"],["j-20260905-23","failed"],["j-20260906-04","failed"],["j-20260906-10","blocked"],["j-20260906-13","failed"],["j-20260907-03","failed"],["j-20260907-10","failed"],["j-20260907-13","capacity"],["j-20260907-14","blocked"],["j-20260907-18","blocked"],["j-20260907-22","blocked"],["j-20260907-27","blocked"],["j-20260908-01","discarded"],["j-20260908-03","failed"],["j-20260908-04","failed"],["j-20260908-06","blocked"],["j-20260908-07","blocked"]]

- **content/ files changed per merged job**: n=208 min=0 median=1.0 mean=2.4 p90=1.0 max=325
- **content/ lines changed (added+removed) per merged job**: n=208 min=0 median=4.0 mean=35.1 p90=124.1 max=1001
- **non-content files changed per merged job**: n=208 min=0 median=7.0 mean=7.7 p90=13.0 max=51
- **non-content lines changed per merged job**: n=208 min=0 median=233.0 mean=647.1 p90=785.6 max=21756
- **TOTAL files changed per merged job**: n=208 min=1 median=7.0 mean=10.0 p90=14.0 max=376
- **TOTAL lines changed per merged job**: n=208 min=17 median=245.5 mean=682.1 p90=873.9 max=22757

Fraction of merged jobs touching EXACTLY ONE content/ file: 110/208 = 52.9%
Fraction of merged jobs touching ZERO content/ files (machinery/openspec-only work): 80/208 = 38.5%
Fraction of merged jobs changing FEWER THAN 50 content/ lines: 166/208 = 79.8%

By job type (median content lines, median total files):
- **verify** (n=6): median content lines=2.0, mean=170.2; median content files=0.5
- **repair** (n=129): median content lines=2.0, mean=10.5; median content files=1.0
- **interpret** (n=16): median content lines=0.0, mean=12.4; median content files=0.0
- **scout** (n=9): median content lines=0.0, mean=0.0; median content files=0.0
- **post** (n=18): median content lines=75.0, mean=105.8; median content files=1.0
- **entry** (n=22): median content lines=142.5, mean=127.8; median content files=1.0
- **machinery** (n=8): median content lines=0.0, mean=0.0; median content files=0.0

## C. Per-job wall-clock

Method: for each job, `firstCommitDate` = timestamp of its earliest commit on main
(normally the ".job/brief.md" / "brief" commit — i.e. job dispatch), `lastCommitDate`
= timestamp of its latest commit (normally the "records (<outcome>)" commit written
at merge). Duration = lastCommitDate - firstCommitDate, in MINUTES. This spans the
whole job: author run, gates, review pass(es), any revision, and the merge itself —
it is wall-clock, not compute time.

CAVEAT, measured directly: a job that does NOT merge (failed/blocked/discarded/
capacity) leaves only ONE commit on main — the bookkeeping "records (<outcome>)"
commit that appends to data/ledger.jsonl (and sometimes DIRECTIVES.md). Its actual
authoring work happened on a branch/worktree that was never merged, so no "brief"
commit for it exists on main and wall-clock cannot be measured from git history for
these jobs. Measured: of 240 job-id commit groups on main, the 208 with ledger
outcome=done have 3-10 commits each (median commits); the 32 with a non-done
outcome have exactly 1 commit (one has 2). So this wall-clock figure is computed
ONLY over merged jobs.

- **wall-clock minutes per MERGED job (dispatch to merge/close commit)**: n=208 min=12 median=24.3 mean=29.0 p90=42.7 max=352

Model-minutes (`mm`, the loop's own per-invocation wall-clock spend, NOT including
gate runs between phases) — total job `mm` and per-phase breakdown:

- **total mm per ledger line (all outcomes)**: n=242 min=2 median=18.4 mean=21.3 p90=36.0 max=73
- **total mm per MERGED job**: n=208 min=8 median=18.4 mean=21.8 p90=37.2 max=73
- **phase "author" mm**: n=239 min=2 median=12.8 mean=14.9 p90=24.4 max=52
- **phase "review1" mm**: n=211 min=1 median=4.6 mean=4.8 p90=7.9 max=13
- **phase "revision" mm**: n=38 min=2 median=8.3 mean=9.5 p90=13.9 max=29
- **phase "review2" mm**: n=38 min=2 median=4.4 mean=4.8 p90=7.4 max=11

## D. Per-job cost in dollars (usage sweep files, `source":"transcript-sweep"`, joined on `job_id`)

Usage files scanned: 377. Of those, "transcript-sweep" source: 365. Of those, carrying a job_id: 322.
Distinct job ids with at least one costed session: 201
Job ids with cost data but NOT in ledger (still running / dispatched after ledger cutoff / id mismatch): 0
Ledger job ids with NO cost data found: 40 of 242 (16.5%)

- **$ per ledger job (joined subset)**: n=201 min=1 median=3.4 mean=5.3 p90=12.0 max=24
- **$ per MERGED job (joined subset)**: n=184 min=1 median=3.2 mean=5.1 p90=12.0 max=24
- **$ per job that did NOT merge (joined subset)**: n=17 min=1 median=5.9 mean=6.8 p90=12.2 max=18
Total $ merged-job subset: 941.63 | Total $ non-merged-job subset: 115.78
Total $ across ALL costed jobs (joined subset): 1057.42

Top 10 most expensive jobs (joined subset):
  - j-20260906-02 (entry, done): $23.58
  - j-20260907-02 (post, done): $20.81
  - j-20260906-05 (entry, done): $20.54
  - j-20260906-01 (entry, done): $20.15
  - j-20260905-13 (repair, done): $18.74
  - j-20260907-06 (post, done): $18.32
  - j-20260906-04 (entry, failed): $18.02
  - j-20260906-06 (entry, done): $17.94
  - j-20260906-08 (entry, done): $17.16
  - j-20260906-03 (entry, done): $16.40

## E. Review rounds (from ledger `phases`, role=review1/review2)

Jobs with a review1 phase recorded: 211
  - review1 = approve: 173 (82.0%)
  - review1 = non-approve (revise/reject/other): 38 (18.0%)
Jobs that reached a review2 (i.e. review1 did not approve, or otherwise triggered a second pass): 38
  - review2 = approve: 36 (94.7%)
  - review2 = non-approve: 2 (5.3%)

Cross-check from review-record files: 213 jobs have at least one review record; of those, jobs with a pass2 file: 38

review1 non-approve outcomes breakdown: {"revise":37,"reject":1}

## F. Headline ratios

Total merged content/ lines changed (added+removed, over 208 merged jobs with a found diff): 7293
Total $ of merged jobs (joined cost subset, n=184): $941.63
Total $ of ALL costed Desk jobs (joined subset, n=201): $1057.42

**$ per merged content line** = totalMergedCost / totalMergedContentLines = $941.63 / 7293 = $0.1291/line
**$ per merged job** (mean) = $941.63 / 184 = $5.12
**median $ per merged job** = $3.20
Days spanned in ledger: 12 (2026-08-28 .. 2026-09-08)
**Merged content lines per day** = 7293 / 12 = 607.8 lines/day
**Fraction of total (joined) Desk spend on jobs that merged nothing** = $115.78 / $1057.42 = 10.9%

## G. Proposals

Filed (still open, root of data/proposals/): 77
Consumed: 35
Dropped: 54
Rejected (data/proposals/rejected/, README only — no actual rejected-proposal files found): 0

By job type declared in the proposal front matter:
- **filed**: {"verify":7,"machinery":49,"entry":8,"repair":6,"scout":1,"post":4,"education":1,"tutorial":1}
- **consumed**: {"post":18,"entry":8,"machinery":4,"repair":1,"interpret":2,"verify":2}
- **dropped**: {"post":42,"entry":7,"interpret":5}
- **rejected**: {}

## H. Surprising / notable, with job ids

Types that appear in the ledger but NEVER reach outcome=done:
  - (none — every job type reached outcome=done at least once)

A non-merging job leaves almost no trace on main. Measured: of the 240 job-id commit
groups found on main, the 208 with outcome=done carry 3-10 commits each (brief, one
or more work commits, sometimes a "drop derived state" commit, scaffolding removal,
records); the 32 with a non-done outcome carry exactly 1 commit (one carries 2) — a
bare "records (<outcome>)" commit that only appends to data/ledger.jsonl (and
sometimes DIRECTIVES.md). The authoring work for a failed/blocked/discarded/capacity
job happens on a branch or worktree that is discarded, never reaching main.

j-20260907-13 is the one job with TWO ledger lines (one id, two outcomes): first
`capacity` ("RESULT.md is absent; the runner's declared capacity_stderr_pattern
matched its stderr"), then on retry `failed` ("reserved-path edit attempt") — i.e.
the retried run tried to edit a reserved path (data/config.json) and was refused,
exactly the guardrail CLAUDE.md describes. Its 2 ledger lines both count toward
2026-09-07's per-day total in table A.

Days with the most non-done (failed/discarded/blocked/interrupted) outcomes:
  - 2026-09-07: 9/35 non-done
  - 2026-09-08: 5/13 non-done
  - 2026-09-05: 4/26 non-done
  - 2026-08-31: 3/15 non-done
  - 2026-09-02: 3/25 non-done
  - 2026-09-06: 3/19 non-done
  - 2026-08-28: 2/2 non-done
  - 2026-08-29: 2/3 non-done

Cost outliers (joined subset), top 5 by $:
  - j-20260906-02 (entry, done): $23.58
  - j-20260907-02 (post, done): $20.81
  - j-20260906-05 (entry, done): $20.54
  - j-20260906-01 (entry, done): $20.15
  - j-20260905-13 (repair, done): $18.74

Largest merged jobs by content lines:
  - j-20260906-18 (verify): 1001 content lines, 325 content files
  - j-20260906-09 (entry): 274 content lines, 1 content files
  - j-20260906-05 (entry): 271 content lines, 1 content files
  - j-20260906-06 (entry): 260 content lines, 1 content files
  - j-20260906-15 (post): 219 content lines, 1 content files

Slowest merged jobs by wall-clock:
  - j-20260906-18 (verify): 351.6 wall-clock minutes
  - j-20260906-17 (verify): 97.0 wall-clock minutes
  - j-20260908-13 (machinery): 79.8 wall-clock minutes
  - j-20260907-02 (post): 78.4 wall-clock minutes
  - j-20260907-16 (machinery): 73.3 wall-clock minutes

**j-20260906-18 is both the largest merged job (325 content files, 1001 content
lines — a `verify` job, i.e. a source-recheck sweep) and the slowest (351.6 wall-
clock minutes, ~5.9h — vs. a 24.3-minute median). Its own `mm` total was only
14.26 model-minutes, so almost all of that wall-clock time was NOT
model compute — consistent with the loop's lane-backoff mechanism (up to 6h /
360 min per specs/loop `LANE_BACKOFF_MAX_MS`), though the ledger line itself
carries no field recording a backoff wait, so this is inferred from the gap
between mm and wall-clock, not measured directly.**

**Non-content diff size is mostly regenerated/snapshot noise, not authored work.**
Spot-checked the two next-largest non-content diffs by path prefix:
  - j-20260904-01 (repair): of 15,387 non-content lines, 9,238 are
    `data/sources/openrouter-models` (a re-fetched source snapshot) and 5,329 are
    `data/derived/feed-rows.json` (fully recomputed derived state, per CLAUDE.md
    "data/derived/ is a pure function of state" — every Pulse run rewrites it whole).
    The actual authored change was 118 lines in `content/wiki/model/*` — i.e. 0.8%
    of that job's total line count was human-legible authored content.
  - j-20260906-18 (verify, the size/duration outlier above): cost only $11.69
    across 3 sessions (author + 1 review + a second author invocation), despite
    the 325-file, 21,756-line non-content footprint — consistent with the same
    pattern: bulk of the diff is regenerated derived/snapshot state, not tokens
    spent by the model writing it by hand.
  This means the git-numstat size figures in section B systematically OVERSTATE
  how much a job actually "wrote" — the content/-only figures are the closer proxy
  for authored output, and even those do not net out `data/derived/*` regeneration
  when a job is typed as a data-layer job (verify/interpret/machinery/scout).

Merged jobs touching ZERO content files (machinery/data/openspec-only), sample:
  - j-20260829-02 (verify): 4 non-content files, 233 non-content lines
  - j-20260830-02 (interpret): 3 non-content files, 152 non-content lines
  - j-20260831-01 (scout): 16 non-content files, 3587 non-content lines
  - j-20260831-03 (scout): 12 non-content files, 972 non-content lines
  - j-20260831-04 (interpret): 6 non-content files, 304 non-content lines
  - j-20260901-07 (scout): 11 non-content files, 537 non-content lines
  - j-20260901-08 (interpret): 5 non-content files, 166 non-content lines
  - j-20260901-09 (interpret): 5 non-content files, 167 non-content lines
  - j-20260901-12 (repair): 6 non-content files, 196 non-content lines
  - j-20260901-13 (repair): 6 non-content files, 137 non-content lines