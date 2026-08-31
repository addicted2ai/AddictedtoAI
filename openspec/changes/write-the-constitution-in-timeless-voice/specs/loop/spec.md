# loop — delta for write-the-constitution-in-timeless-voice

Three requirements, prose only, each edited in its framing paragraph and — in
the first — in one bullet. Every SHALL is reproduced byte-for-byte; every
scenario is reproduced byte-for-byte. What changes, and only what changes:

**1. *A runner proven unable to run is refused, and refusal is not a halt*.**
Two edits, in the opening paragraph and in the last bullet.

- The opening said the spin-ending mechanism *"exists in `loop/lib/health.mjs`
  and this specification does not describe it, which is the same species of gap
  as the ones this change is for"*. Both halves fail on merge: the
  specification does describe it — immediately below — and *"this change"* names
  a directory the reader cannot reach. Rewritten to state the diagnosis and the
  reason a rule is needed, which is the durable part.
- The last bullet deferred an open question to *"this change's `design.md`"*.
  The question — whether a Desk with no usable runner should halt — is genuinely
  open and worth knowing about, so the pointer is kept and redirected to
  `addictedtoai-pfv`, which resolves under `bd show` and will not be moved by an
  archive.

**2. *A budget refusal states the arithmetic it refused on*.** The framing
paragraph deferred the denominator question to *"D8 in `design.md`"*. Redirected
to `addictedtoai-tr8`. *"was invisible"* becomes *"is invisible wherever the
arithmetic is not printed"* — the same observation, stated as the standing
hazard the requirement answers rather than as a fact about a past state.

**3. *A job's total spend is measured, and the cap is named for what it is*.**
The framing paragraph deferred the bounding question to *"D9 in `design.md`"*.
Redirected to `addictedtoai-o5t`. In the same paragraph, *"Every brief prints
'wall clock cap: N minutes' … and reads like a budget for the job"* asserts a
state of the briefs that this requirement's own second bullet forbids; it is
restated in the conditional, as the hazard the rule prevents. *"today's caps"*
becomes *"the caps as configured"*, since the illustrative 480 minutes is a
function of configuration, not of the day.

No SHALL is added, removed, weakened or strengthened. No scenario changes.

## MODIFIED Requirements

### Requirement: A runner proven unable to run is refused, and refusal is not a halt

An expired credential makes an executor exit in seconds with no `RESULT.md`.
That classifies `interrupted`, correctly — and `interrupted` is not a failure:
the branch is kept, it is resumed oldest-first before new work, no retry is
consumed, and the three-consecutive-failures breaker counts only `failed` and
`discarded`. With no rule against it the Desk resumes the same branch forever,
halting nothing and telling nobody. The mechanism that ends that spin lives in
`loop/lib/health.mjs`, and it is specified here rather than left to the code
alone: a machine behaviour with no rule behind it drifts without anything
noticing.

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
  halt the loop, and only the named ones` is closed and is not extended by this
  requirement; whether a Desk with no usable runner should halt is a separate
  question, left open here and tracked as `addictedtoai-pfv`.

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
is its MM over the tier's rolling total; the divergence is defensible and is
invisible wherever the arithmetic is not printed, because a refusal prints a
percentage and a percentage hides its own denominator. This requirement does not
settle which denominator is right — that question is open and tracked as
`addictedtoai-tr8`. It makes the answer impossible to hide either way.

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
full cap — with the caps as configured, 480 minutes for one job. A brief that
printed only "wall clock cap: N minutes" would state something true of the run
reading it and read like a budget for the job. Whether a job's total should be
*bounded* is a question this requirement leaves open, tracked as
`addictedtoai-o5t`; that it should be *known and honestly named* is not open.

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
