# Experiment: one brief, two effort rungs (codex Luna medium vs max)

Pre-registered 2026-09-08 20:11 local by A2AI-Fable-Arch on the maintainer's
instruction ("Try your suggested experiment of giving an identical brief to a
medium and a max effort Luna agent and then compare their time, tokens, and
quality"). Run by A2AI-Luna-Boss-2 (worktrees, workers, sealed judge). This
file is written BEFORE dispatch; the results section is appended afterwards
and nothing above it is edited once a run starts.

## Why it is needed

Every medium-versus-max comparison available today confounds the rung with the
task: no medium and max round has ever done the same work (Luna-Boss-2's
timing corpus, 18:11: 11.6 min at medium for one arm, 30 min at medium for
five tasks, 38 and 27 min at max for one rewrite and one review; "the rung
changed quality, not duration" is an impression, not a measurement). The
maintainer's standing rule — medium for routine, max for complex work and all
review — rests on absence of evidence.

## Subject

Task 22's two ENFORCEMENT items as written at `d75275c` (the bullet beginning
"Added 2026-09-08 from B1 round 3's sealed review" through "an allow-list
wider than its reason is an expectation file whose unlisted case is permitted
but unguarded"), and NOT task 22's `enabled: false` half:

1. `loop/tests/portability.test.mjs`: extend the runner-id targets to `lib/`,
   `app/` and `tools/`; plant a fixture id under EACH of the three roots and
   require the arm red for each (named mutations); assert a floor on the
   number of files actually scanned in BOTH tests.
2. `scripts/no-change-dir-refs.test.mjs`: narrow each allow-list entry to the
   generic form its reason describes; reword `loop/lib/specs.mjs:23` to the
   archive form; plant a named change path in an allow-listed fixture file
   and require the test red (named mutation).

Chosen because it is fully specified, test-dominated, mechanically gradable,
real Stage 0 work (packet F's brief drops these bullets once one branch
merges), and independent of B1's files except one comment line in
`specs.mjs`, which merges cleanly after B1.

## Protocol

- ONE brief, byte-identical for both runs (sha256 of the brief file recorded
  below; Luna-Boss-2's literal-quote verifier run over it against `d75275c`).
  Authority line: `authority: two-desks-work-orders-and-trains@d75275c`.
- Same base commit for both worktrees (recorded below), two worktrees whose
  names match the fleet serial guard (`fleet6-exp-medium`, `fleet6-exp-max`).
- Runs are SEQUENTIAL, never concurrent (one codex worker at a time; the
  machine quiet: no gate run, no full suite, no other worker during either),
  medium first, then max; the order is recorded, not randomised, because two
  runs cannot be counterbalanced and the machine condition is recorded
  instead.
- Each run: dispatch time and exit time from the clock and the process table
  (not estimated); tokens from the codex session rollout for that worktree,
  by the method of `evidence/scripts/codex-spend-capture.mjs` (last
  `token_count` event's `total_token_usage`, attributed by worktree path):
  input, cached input, output, and reasoning if the rollout separates it;
  files changed and lines +/−; the targeted tests the worker ran and their
  counts.
- Same worker brief for both: run the two named test files and
  `scripts/no-change-dir-refs.test.mjs` on the live tree; do not run the
  full suite (that is the merge step's, once, on the branch that merges).
- QUALITY, two instruments. (a) Mechanical, applied to both branches by
  Luna-Boss-2 after both exit: the three planted-id fixtures each go red and
  restore; the files-scanned floor goes red when the targets list is emptied
  (a mutation) and restores; the allow-list narrowing keeps every legitimate
  generic use green and a planted named path red; the two test files and
  `no-change-dir-refs` pass on the live tree; nothing names a model, provider,
  harness or runner id; nothing references a change directory. (b) BLIND
  JUDGE: one sealed codex Luna max reviewer receives BOTH diffs labelled X and
  Y, the mapping chosen by coin flip and sealed in a file before dispatch,
  told only that they are two independent implementations of the same brief;
  asked to review each against the brief under the standing review rules
  (properties, find and run the enforcement; the merge-base diff as the list
  of changed behavioural lines, at least one mutation per changed function),
  list findings per implementation, then say which better meets the brief
  and why, or that they are indistinguishable. The judge is NOT told the
  effort rungs, nor that effort is the question.

## Hypotheses (before any run)

- H1 wall clock: max ≥ medium, ratio between 1.0 and 2.0.
- H2 tokens: max's total exceeds medium's by MORE than the wall-clock ratio
  (reasoning tokens), and output tokens are close.
- H3 quality: on a fully specified edit both pass every mechanical check and
  the blind judge reports them indistinguishable in correctness; any
  difference it reports is in the thoroughness of the test arms (a stronger
  planted fixture, an edge in the allow-list narrowing), not in the
  production edit.
- H4 both runs leave the naming and change-directory properties intact.

## Decision rule (before any run)

- If H3 holds: medium is the default rung for fully specified Stage 0
  authoring from here (B2, E, D, F, C), max for review; the maintainer's rule
  confirmed with one measurement (n = 1, stated as such).
- If the judge prefers max on a finding that matters (a fixture that should
  go red and does not; a narrowing that breaks a legitimate use; a missed
  root): max stays for anything that touches enforcement, medium elsewhere.
- Either way the better branch — the medium one on a tie, being cheaper —
  goes through the normal handover (Orch's diff read, the full suite once on
  its tip, merge --no-ff after B1 lands); the other worktree is torn down by
  the refusing form and its branch is kept unmerged for the record.
- A run over 60 minutes is a data point, not a stop.

## Results (appended after both runs; sources named)

(pending)
