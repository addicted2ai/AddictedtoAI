# loop — delta for catch-the-constitution-up-to-the-code

This change adds no behaviour. Every clause below describes something the code
already does and something an existing test already measures; `tasks.md` names
that implementation and that check for each one, in place of the usual "task
that implements it", because the implementing task was completed under another
change and is cited there.

Three requirement bodies are replaced rather than amended, because a MODIFIED
block replaces a whole body and two of the three need their opening paragraph
rewritten as well as their bullets extended.

## MODIFIED Requirements

### Requirement: Spending is budgeted in model-minutes with floors and ceilings

The loop's cost unit is the **model-minute (MM)**: one minute of wall-clock
time during which a configured model was actively working, measured by the
loop itself from invocation to return, recorded per tier (`frontier` /
`cheap`) and never summed across tiers. Rationale: tokens are unobservable
across consumer subscriptions, and "rounds" ranged 200K–9M tokens on the
previous site; wall-clock per tier is measurable by the orchestrator alone,
comparable across providers, and readable by a non-programmer. Every job
records its MM actuals in a run ledger.

Shares SHALL be computed **within each tier separately**: a category's
share is its MM divided by that tier's total MM over the rolling 30 days,
and the bounds below SHALL hold in each tier independently (frontier shares
of the frontier total; cheap shares of the cheap total):

| Category | Bound |
|---|---|
| Upkeep (`interpret`, `verify`, `repair`, `prune`) | floor: ≥ 40% |
| New writing (`entry`, `tutorial`, `post`, `education`, `scout`) | ceiling: ≤ 45% |
| `machinery` | ceiling: ≤ 10% |

`scout` spends from the new-writing share deliberately: discovery is the
first stage of writing, and when writing is over its ceiling, finding more
to write is the first thing to stop. Review MM counts toward the job it
reviews. Each bound has its own
enforcement point: when a ceiling is reached, jobs of that category are not
selectable until the window rolls; when the upkeep share in a tier is below
its floor and any upkeep job is available in that tier, only upkeep jobs
are selectable in that tier until the floor is met — the floor binds on its
own, not merely as the arithmetic residue of the ceilings. The bounds, the
per-type wall-clock caps, and the degradation thresholds all live in
**`data/config.json`** — the one normative home for loop configuration;
changing the bounds requires an OpenSpec change. The
machinery ceiling exists because the previous site spent roughly seven lines
of process per line of site — the loop improving its own tooling is capped,
permanently, and the cap is enforced by the selector, not by good
intentions.

A percentage of a very small total is not a bound, it is a rounding artifact:
on the first day of a window, one job of any kind is 100% of everything, and a
ceiling read against the observed total alone would refuse every category
before the loop had done enough work for a share to mean anything. The
denominator therefore has a floor of its own.

- A **ceiling** SHALL be measured against the larger of the tier's observed
  rolling total and a **warm-up window**, so that a ceiling binds on a
  meaningful denominator from the first run rather than on whatever happens to
  have run first. Implemented by `warmUpMm()` in `loop/lib/budget.mjs`;
  measured by `loop/tests/budget.test.mjs`.
- The **upkeep floor** SHALL always read the tier's observed rolling total, and
  SHALL NOT be measured against the warm-up window. The floor and the ceilings
  fail in opposite directions: a ceiling read against a tiny denominator
  refuses everything, while a floor read against an inflated one would compel
  upkeep the loop has no evidence it needs. Implemented in
  `loop/lib/budget.mjs`'s floor path; measured by `loop/tests/budget.test.mjs`.
- The warm-up window SHALL be **derived** — (100 ÷ the tightest configured
  ceiling percentage) × the largest per-type wall-clock cap in
  `data/config.json` — and SHALL NOT be a configuration key of its own. A key
  would be a second place to state a bound that is already stated, and the two
  would drift. Implemented by `warmUpMm()` and `largestCapMinutes()` in
  `loop/lib/budget.mjs`; measured by `loop/tests/budget.test.mjs`.
- The unit of "the largest per-type wall-clock cap" in that formula SHALL be
  one **invocation's** cap, NOT one whole job's bounded total under `A job's
  total spend is measured, and the cap is named for what it is` — a job's total
  may reach a multiple of an invocation's cap, so reading the formula the other
  way would silently widen the window without any number changing. Implemented
  in `loop/lib/budget.mjs`; measured by the `dyw the warm-up denominator
  measures one invocation` test in `loop/tests/budget.test.mjs`.

#### Scenario: Writing cannot crowd out upkeep

- **WHEN** new-writing MM reaches 45% of the rolling window
- **THEN** the selector refuses new-writing jobs and only upkeep, repair,
  prune, and (under its own cap) machinery jobs are selectable

#### Scenario: Machinery work hits its ceiling

- **WHEN** `machinery` MM reaches 10% of the rolling window
- **THEN** no further machinery job is selectable until the window rolls,
  regardless of how appealing the improvement looks

#### Scenario: The upkeep floor binds on its own

- **WHEN** upkeep MM in a tier is below 40% of that tier's rolling total
  and an upkeep job is available
- **THEN** the selector offers only upkeep jobs in that tier until the
  floor is met

#### Scenario: A ceiling does not bind on a nearly empty window

- **WHEN** a tier's observed rolling total is far below the warm-up window and
  a single job would exceed a ceiling as a share of that observed total
- **THEN** the ceiling is measured against the warm-up window instead, the job
  is not refused on that arithmetic, and the substitution is stated in the
  refusal record whenever a refusal is printed

#### Scenario: The floor is not warmed up

- **WHEN** a tier's observed rolling total is far below the warm-up window and
  upkeep's observed share is below its floor
- **THEN** the floor binds on the observed total, unaffected by the warm-up
  window that the ceilings use

### Requirement: A budget refusal states the arithmetic it refused on

A share is a percentage of something, and the something is not always the
number the reader assumes. A refusal prints a percentage, and a percentage
hides its own denominator: two refusals reading 46% and 46% can be measured
against different totals, and nothing in the printed line would say so. The
denominator question itself is settled in `Spending is budgeted in
model-minutes with floors and ceilings` — ceilings against the larger of the
observed rolling total and the warm-up window, the floor always against the
observed total. This requirement is what keeps that settlement legible at the
moment it bites, so a reader never has to re-derive which denominator was used.

- When a ceiling or the upkeep floor refuses a job, the loop SHALL record and
  print the category's model-minutes, the denominator the percentage was
  computed against, and the origin of that denominator. Implemented by
  `refusalArithmetic()` in `loop/lib/budget.mjs`; measured by
  `loop/tests/budget.test.mjs`.
- Where the denominator is not the tier's observed rolling total, the refusal
  SHALL say which value was used instead and why it was substituted. A
  substituted denominator that announces itself is a recorded reading; one that
  does not is a silent divergence between this specification and its code, and
  that divergence is how the two stop describing the same system. Implemented
  by `refusalArithmetic()`; measured by `loop/tests/budget.test.mjs`.

#### Scenario: A refusal names its denominator

- **WHEN** the selector refuses a new-writing job on the new-writing ceiling
- **THEN** the printed refusal and the recorded reason state the category's MM,
  the denominator used, and where that denominator came from

#### Scenario: A substituted denominator announces itself

- **WHEN** a ceiling is measured against anything other than the tier's observed
  rolling total
- **THEN** the refusal states the substitution and its reason, rather than
  printing only a percentage

### Requirement: A runner proven unable to run is refused, and refusal is not a halt

An expired credential makes an executor exit in seconds with no `RESULT.md`.
That classifies `interrupted`, correctly — and `interrupted` is not a failure:
the branch is kept, it is resumed oldest-first before new work, no retry is
consumed, and the three-consecutive-failures breaker counts only `failed` and
`discarded`. With no rule against it a Desk would resume the same branch
forever, halting nothing and telling nobody. The mechanism that ends that spin
lives in `loop/lib/health.mjs`, and it is specified here rather than left to the
code alone: a machine behaviour with no rule behind it drifts without anything
noticing.

Detection has to be stated twice, because the two roles leave different
evidence. An author writes a `RESULT.md` and a branch diff; a reviewer's
worktree is discarded unconditionally, as a mechanism, so it has neither. A
criterion written only in the author's terms cannot be satisfied for the
reviewer role at all, and a refusal that claims to cover both roles while its
detection covers one is a rule that reads as present and does nothing.

- The loop SHALL treat a run that produced nothing at all — no `RESULT.md`, no
  executor output, and no diff on the branch — as evidence about the runner
  rather than about the job, recorded as a signal on that run's ledger line.
  Implemented in `loop/lib/result.mjs` and `loop/run.mjs`; measured by
  `loop/tests/runner-health.test.mjs`.
- For the **reviewer** role, where there is no `RESULT.md` and no branch diff to
  read, the equivalent evidence SHALL be an absent verdict record together with
  nothing on stdout. A verdict record that exists but is malformed is **output,
  not silence**, and SHALL be handled instead by the existing malformed-verdict
  merge-gate refusal — treating it as silence would blame the runner for a
  fault the reviewer demonstrably ran to produce. Implemented by
  `reviewProducedNothing()` in `loop/lib/result.mjs`, recorded per invocation by
  `loop/run.mjs`'s `phase()` call for `review*` roles, and read by
  `noOutputStreak()` in `loop/lib/health.mjs`; measured by the `G8A` tests in
  `loop/tests/runner-health.test.mjs`.
- The streak SHALL be accumulated **per invocation and per role**, not from a
  ledger line's runner field alone. A line's runner field names the author, so a
  runner configured only as reviewer could otherwise never accumulate a streak
  however many times it produced nothing. Implemented by `noOutputStreak()`'s
  `invocationsFor` helper in `loop/lib/health.mjs`; measured by the `G8A` tests
  in `loop/tests/runner-health.test.mjs`.
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
  requirement. Whether a Desk with **every** author-cleared runner refused
  should halt is a separate question: it has been ruled in the affirmative as a
  target state and is tracked, unimplemented, as `addictedtoai-8wm0`.

#### Scenario: The spin ends at the third empty run

- **WHEN** a runner's last three runs each produced no `RESULT.md`, no output
  and no diff
- **THEN** the loop refuses that runner for authoring and review, printing the
  cause and the conformance command that clears it, and does not invoke it or
  resume a branch with it

#### Scenario: A reviewer-only runner accumulates a streak

- **WHEN** a runner configured only for the reviewer role completes three
  consecutive review invocations that each wrote no verdict record and printed
  nothing
- **THEN** the streak reaches three and that runner is refused for review, even
  though no ledger line names it as an author

#### Scenario: A malformed verdict record is output, not silence

- **WHEN** a reviewer invocation writes a verdict record that the merge gate
  refuses as malformed
- **THEN** the no-output streak is cleared rather than advanced, and the
  malformed record is handled by the merge gate's own refusal

#### Scenario: Refusal is not a halt

- **WHEN** a runner is refused for producing nothing three times running
- **THEN** no `HOLD.md` is written and the Desk's other runners remain usable

#### Scenario: One real run clears it

- **WHEN** a refused runner is repaired and its next run produces a diff
- **THEN** the streak is zero and the runner is selectable again with no other
  action
