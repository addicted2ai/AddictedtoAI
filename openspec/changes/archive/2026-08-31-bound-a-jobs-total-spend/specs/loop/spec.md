# loop — delta for bound-a-jobs-total-spend

One requirement, modified. The existing body left a question open in writing —
*"Whether a job's total should be bounded is a question this requirement leaves
open, tracked as `addictedtoai-o5t`"* — and the code has now answered it. The
spec wins on disagreement, so it moves.

**Why the body is `MODIFIED` and not merely extended.** The open-question
sentence has to be repealed, and an added requirement cannot repeal a sentence
in another one. Everything else in the body is reproduced unchanged: both
existing bullets, both existing scenarios, and both scenario headings verbatim —
`openspec validate --strict` treats a scenario heading as identity and refuses a
block that renames one, because the archive cannot tell a rename from a
deletion.

**Why the numbers are not in `data/config.json`.** `data/README.md` documents
that file as four key groups and `build-initial-site` task 1.3 verifies the
count; deriving the total from the per-type cap keeps it at four and keeps the
two coherent when a cap is edited — the argument `budget.mjs` already makes for
its warm-up denominator. The constants live in `loop/lib/config.mjs` beside
`LANE_BACKOFF_*`, `PROPOSAL_COOLING_DAYS` and `RESUMABLE_MAX_AGE_DAYS`, the
established home for values that are normative here and deliberately not
operator-tunable. The requirement below therefore fixes the *property* the
multiple must satisfy rather than the digit, so the digit can move without a
spec change and cannot move to a value that defeats the bound.

## MODIFIED Requirements

### Requirement: A job's total spend is measured, and the cap is named for what it is

`data/config.json` maps each job type to one wall-clock cap. A job revised once
makes four invocations — the author, the revision, and each review pass — and a
brief that printed only "wall clock cap: N minutes" would state something true
of the run reading it and read like a budget for the job. A job's total spend is
both **bounded** and **honestly named**.

- The ledger SHALL record a job's model-minutes broken down by invocation phase
  — authoring, revision, and each review pass — so that a job's total spend is
  the sum of recorded measurements and never an estimate.
- Every brief the loop assembles SHALL state the cap it prints as a
  per-invocation limit on that invocation, SHALL state the job's total spend so
  far and how many invocations have already run, and SHALL NOT describe the cap
  as a budget for the job.
- A job SHALL have a total wall-clock budget, **derived** from its per-type cap
  in `data/config.json` rather than separately configured, so that editing a cap
  cannot leave the two disagreeing. The multiple SHALL be the smallest one that
  leaves **the author and one review pass each their full per-invocation guard
  unconditionally** — a smaller multiple would let an author consume the budget
  a review must have, and a multiple as large as the number of invocations a job
  can make would bound nothing.
- Before each invocation the loop SHALL compute the job's remaining budget as
  its total minus the model-minutes already recorded against that job on the
  ledger plus those spent in the current run, and SHALL cap that invocation at
  the smaller of the per-type per-invocation cap and that remainder. This SHALL
  only ever lower an invocation's cap and never raise it: the per-invocation cap
  remains a runaway-process guard and keeps that meaning. Where the remainder
  falls below a minimum invocation length, the invocation SHALL NOT be started
  and the job SHALL be recorded `abandoned`, naming the spend, the total and the
  remainder. A bound that stopped a job *after* letting one more invocation run
  to its full cap would overstate itself by exactly one cap.
- `abandoned` SHALL NOT count toward the consecutive-failure breaker: a job that
  ran out of budget says nothing about whether its type is sound.
- A resumed job SHALL inherit its accumulated spend from the ledger and SHALL
  NOT receive a fresh allowance. Where a resumable branch's job has no budget
  left, the loop SHALL abandon it in the same sweep that abandons branches past
  the resumable age limit — before selection — rather than resuming it. The
  bound counts what the ledger records; a run whose process ends before writing
  its ledger line contributes nothing to it.

#### Scenario: The total is recoverable from the ledger

- **WHEN** a job completes after an author run, one revision and two review
  passes
- **THEN** its ledger record carries the model-minutes of each phase and their
  sum is the job's total spend

#### Scenario: A brief does not imply a budget it does not have

- **WHEN** a reviewer brief is assembled for the second review pass of a job
  that has already spent 20.9 model-minutes
- **THEN** the brief states the cap as this invocation's limit, states the 20.9
  already spent and the number of invocations so far, and calls the cap nothing
  else

#### Scenario: A revised job cannot spend its cap four times

- **WHEN** a job has spent its total budget across an author run, a revision and
  a review pass
- **THEN** the next invocation is not started, and the job is abandoned with a
  ledger line naming the exhausted budget

#### Scenario: A resumed job does not start again at zero

- **WHEN** a branch is resumable and the ledger records spend against its job id
  that leaves less than the minimum invocation length
- **THEN** the branch is not resumed, and an `abandoned` line is written naming
  the spend, the total and the remainder

#### Scenario: A job inside its budget is untouched

- **WHEN** a job makes an author run, two review passes and a revision, and
  their sum stays below its total
- **THEN** every invocation runs under the full per-type per-invocation cap and
  nothing is refused
