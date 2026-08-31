# Tasks: bound-a-jobs-total-spend

Everything in section 1 shipped in `aae2330` before this change existed. It is
ticked because it was **verified in the tree**, each item naming the file and
the symbol read — not because a commit message says so.

## 1. What shipped, verified in the tree

- [x] **1.1 — The two constants exist and are derived, not configured.**
  *Verified*: `loop/lib/config.mjs:124` `JOB_TOTAL_CAP_MULTIPLIER = 2` and
  `:148` `MIN_INVOCATION_MINUTES = 15`, beside `LANE_BACKOFF_*`,
  `PROPOSAL_COOLING_DAYS` and `RESUMABLE_MAX_AGE_DAYS`. `data/config.json` is
  unchanged and still carries four key groups.
- [x] **1.2 — The allowance lowers a cap and never raises it.** *Verified*:
  `loop/lib/budget.mjs` exports `jobTotalMinutes`, `minInvocationMinutes` and
  `invocationAllowance`, the last returning `min(per-invocation cap, remainder)`
  and refusing below the floor with the arithmetic stated.
- [x] **1.3 — It is consulted before EVERY invocation.** *Verified*:
  `loop/run.mjs` calls it before the author run, each review pass and the
  revision.
- [x] **1.4 — A resumed job inherits its spend.** *Verified*: `spent()` is
  `prior.mm` (from `jobSpendSoFar(ledger, jobId)`) plus the current run's, and a
  sweep beside the 14-day abandon sweep refuses to resume a branch whose job has
  no budget left, writing `abandoned` with `mm: 0`.
- [x] **1.5 — The outcome at the bound is `abandoned`.** *Verified*: nothing was
  added to `OUTCOMES`; `abandoned` is already absent from `FAILURE_OUTCOMES` and
  already non-resumable.
- [x] **1.6 — Two defects found by the tests were fixed.** *Verified*:
  `loop/run.mjs:379` and `:456` pass `mmSoFar:` **named** — previously
  `jobSpendSoFar()`'s `{mm, invocations}` was SPREAD into a function reading
  `mmSoFar`, so every resumed brief printed "0.00 model-minutes across 4
  completed invocations". The trap is written down at `:716`. And
  `min(cap, remainder)` is floored to 2dp **downward**, because the number is
  both a kill deadline and a figure printed in a brief.

## 2. Verification this change ran

- [x] **2.1** `node --test loop/tests/job-budget.test.mjs` → **14/14**. Seven
  tests in the stopping direction and seven in the untouched direction, the
  latter including the real anchor job.
- [x] **2.2** The whole loop suite → **235 pass, 0 fail**.
- [x] **2.3** Mutation testing: **10 deliberate breaks, 10 caught**. The first
  pass caught 9 — the revision boundary was uncovered because it lies *between*
  two invocations and a sub-second mock cannot straddle it, which is why
  `mock-executor.mjs` gained `--sleep-ms`.
- [x] **2.4** The anchor job is reproduced verbatim as a fixture:
  `j-20260831-08`'s four phases sum to 54.55 model-minutes against a 240-minute
  bound, so **this change refuses nothing the Desk has actually run**. The reach
  is that the worst case falls 480 → 240.
- [x] **2.5** Delta collision check, re-derived from the deltas rather than read
  off a report: `make-the-blog-worth-sending` modifies four `loop` headings
  (*"One job is one outcome…"*, *"Work comes from three sources…"*, *"Spending
  is budgeted…"*, *"Capacity exhaustion…"*) and `group-tool-listings-by-category`
  touches `directory` only. This change modifies *"A job's total spend is
  measured…"*, which neither touches. No heading is modified by two unarchived
  changes.
- [x] **2.6** `node scripts/check-spec-deltas.mjs --strict` → 0 errors, 0
  warnings, including the narration scan over this delta's requirement body.

## 3. Deltas

- `specs/loop/spec.md` — 1 MODIFIED, 0 ADDED.
