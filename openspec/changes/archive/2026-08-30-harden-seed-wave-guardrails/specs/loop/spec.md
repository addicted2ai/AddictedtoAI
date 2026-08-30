# loop — delta for harden-seed-wave-guardrails

These three requirements are the part of `addictedtoai-pfv`, `-tr8` and `-o5t`
that is not in dispute. Each of those issues also contains a decision the
maintainer has read and not made — a fifth breaker, the low-n ceiling
denominator, and a bound on a job's total spend. Those are drafted as
alternatives in this change's `design.md` (D7, D8, D9) and are deliberately
absent from the requirements below. Nothing here changes the breaker list, the
budget bounds, the job-type list, or `data/config.json`.

## ADDED Requirements

### Requirement: A runner proven unable to run is refused, and refusal is not a halt

An expired credential makes an executor exit in seconds with no `RESULT.md`.
That classifies `interrupted`, correctly — and `interrupted` is not a failure:
the branch is kept, it is resumed oldest-first before new work, no retry is
consumed, and the three-consecutive-failures breaker counts only `failed` and
`discarded`. The Desk would resume the same branch forever, halting nothing and
telling nobody. The mechanism that ends that spin exists in `loop/lib/health.mjs`
and this specification does not describe it, which is the same species of gap as
the ones this change is for: a machine behaviour with no rule behind it drifts
without anything noticing.

- The loop SHALL treat a run that produced nothing at all — no `RESULT.md`, no
  executor output, and no diff on the branch — as evidence about the runner
  rather than about the job, recorded as a signal on that run's ledger line.
- After three consecutive such runs on one runner, the loop SHALL refuse that
  runner for the `author` and `reviewer` roles, on the same terms and with the
  same consequence `A swap has a stated procedure and a conformance check` gives
  a runner with a conformance FAIL. The evidence is different — runtime rather
  than a suite the maintainer has to remember to run — and the conclusion is the
  same: a runner that cannot be trusted to run is not used.
- The refusal SHALL be applied both before an executor is invoked and before a
  branch is resumed, since the spin this ends is a resumption loop and a check
  only at selection would never reach it.
- The refusal SHALL name the cause and the exact command that clears it, and the
  streak SHALL clear as soon as one run on that runner produces anything.
- Lines that record no invocation at all SHALL neither count toward the streak
  nor end it — the 14-day abandon sweep writes a line carrying the dead runner's
  id and zero model-minutes, and counting it as evidence would clear a refusal
  that nothing had fixed. This is the same treatment the failure breaker gives
  outcomes that are not failures, and it is the stickier reading: a guardrail is
  only ever moved in that direction.
- Refusing a runner SHALL NOT write `HOLD.md`. The breaker list in `Breakers
  halt the loop, and only the named ones` is closed and is unchanged by this
  requirement; whether a Desk with no usable runner should halt is open and is
  drafted in this change's `design.md`.

#### Scenario: The spin ends at the third empty run

- **WHEN** a runner's last three runs each produced no `RESULT.md`, no output
  and no diff
- **THEN** the loop refuses that runner for authoring and review, printing the
  cause and the conformance command that clears it, and does not invoke it or
  resume a branch with it

#### Scenario: Refusal is not a halt

- **WHEN** a runner is refused for producing nothing three times running
- **THEN** no `HOLD.md` is written and the Desk's other runners remain usable

#### Scenario: One real run clears it

- **WHEN** a refused runner is repaired and its next run produces a diff
- **THEN** the streak is zero and the runner is selectable again with no other
  action

### Requirement: A budget refusal states the arithmetic it refused on

A share is a percentage of something, and the something is not always the number
the reader assumes. `loop/lib/budget.mjs` measures ceilings against
`max(observed total, warm-up)` while this specification says a category's share
is its MM over the tier's rolling total; the divergence is defensible and was
invisible, because a refusal prints a percentage and a percentage hides its own
denominator. This requirement does not settle which denominator is right — that
is D8 in `design.md`. It makes the answer impossible to hide either way.

- When a ceiling or the upkeep floor refuses a job, the loop SHALL record and
  print the category's model-minutes, the denominator the percentage was
  computed against, and the origin of that denominator.
- Where the denominator is not the tier's observed rolling total, the refusal
  SHALL say which value was used instead and why it was substituted. A
  substituted denominator that announces itself is a recorded reading; one that
  does not is a silent divergence from this specification, and the second is how
  a spec and its code stop describing the same system.

#### Scenario: A refusal names its denominator

- **WHEN** the selector refuses a new-writing job on the new-writing ceiling
- **THEN** the printed refusal and the recorded reason state the category's MM,
  the denominator used, and where that denominator came from

#### Scenario: A substituted denominator announces itself

- **WHEN** a ceiling is measured against anything other than the tier's observed
  rolling total
- **THEN** the refusal states the substitution and its reason, rather than
  printing only a percentage

### Requirement: A job's total spend is measured, and the cap is named for what it is

`data/config.json` maps each job type to one wall-clock cap and the loop passes
it unchanged to every invocation: the author, the revision, and each review
pass. A job revised once therefore makes four invocations, each entitled to the
full cap — with today's caps, 480 minutes for one job. Every brief prints "wall
clock cap: N minutes", which is true of the run reading it and reads like a
budget for the job. Whether a job's total should be *bounded* is open (D9 in
`design.md`); that it should be *known and honestly named* is not.

- The ledger SHALL record a job's model-minutes broken down by invocation phase
  — authoring, revision, and each review pass — so that a job's total spend is
  the sum of recorded measurements and never an estimate.
- Every brief the loop assembles SHALL state the cap it prints as a
  per-invocation limit on that invocation, SHALL state the job's total spend so
  far and how many invocations have already run, and SHALL NOT describe the cap
  as a budget for the job.

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
