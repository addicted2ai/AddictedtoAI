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
  `input_tokens`, `cached_input_tokens`, `cache_write_input_tokens`,
  `output_tokens`, `reasoning_output_tokens` (all five present in the
  rollouts, verified by Luna-Boss-2 on round 4's author run; mapping by
  dispatch timestamp, exact only because the runs are sequential);
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
  effort rungs, nor that effort is the question, nor that the two came from
  the same model ("independent" must not invite a guess about what differs).
  AMENDED 20:16, before any dispatch, on Luna-Boss-2's objection: TWO blind
  judges, not one, with X and Y SWAPPED between them — same prompt, same
  sealing, the key held outside both workspaces. A pairwise comparison on
  this pipeline earlier today measured a POSITION EFFECT (two blind
  assessors, order mirrored, each chose the candidate in FIRST position,
  each citing specifics that checked out); a single judge with a coin flip
  randomises position but cannot control for it, and its verdict cannot
  distinguish "chose the better diff" from "chose the first diff". Decision
  rule for the judges: agreement on the same CANDIDATE is the quality
  signal; agreement on the same POSITION is the position effect and the
  quality comparison is VOID — reported as such, with the mechanical checks
  standing alone; disagreement on candidate with disagreement on position is
  a split, reported as no preference. Cost: one extra max review, spent so
  the verdict is defensible.

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

### The two runs (appended 22:23, before either judge reported)

Same brief (sha256 `4DCBAD94625827CD3679DA08D76D397C7EFFF3B3B7C03E7C1435B8B147EA8197`,
quote verifier 4 of 4 verbatim against `d75275c`), same base `96e15fa`,
sequential, machine measured quiet before each dispatch (zero codex exec
processes; the only other codex.exe was the wedged 2026-09-07 app-server pid
38088, not an exec session). Times are the launcher's clock reads; tokens are
the last `token_count` event of the one rollout naming each worktree.

| | medium | max | max ÷ medium |
|---|---|---|---|
| dispatched → exited | 21:44:08 → ~21:51:08, **7 min** | 21:51:22 → ~22:19:13, **28 min** | **4.0x** |
| commit | `f05cfb6` (21:50) | `8abe800` (22:20:25) | |
| files / lines | 3 files, +59 −22 | 3 files, +84 −23 | |
| `portability.test.mjs` lines changed | 67 | 93 | |
| input_tokens | 2,809,319 | 18,332,786 | 6.5x |
| cached_input_tokens | 2,674,432 | 17,855,232 | 6.7x |
| cache_write_input_tokens | 0 | 0 | |
| output_tokens | 16,231 | 70,102 | 4.3x |
| reasoning_output_tokens | 6,281 | 43,023 | **6.9x** |
| total_tokens | 2,825,550 | 18,402,888 | 6.5x |

Sources: `rollout-2026-09-08T21-44-06-01a08444-….jsonl` (medium) and
`rollout-2026-09-08T21-51-20-01a0844a-….jsonl` (max) under
`~/.codex/sessions/2026/09/08/`, read by Luna-Boss-2's `f6-exp-tokens.mjs`
(one match each, so attribution is unambiguous); transcripts
`f6-exp-medium.log` and `f6-exp-max.log` in its scratchpad. Both workers
touched only the three permitted files and left task 22's `enabled: false`
half alone; both report their five mutation proofs red — the workers' own
claims, which the judges verify.

Scored against the pre-registration, by the coordinator before the judges
were dispatched and adopted here as written: **H1 is FALSIFIED as written**
(predicted a wall-clock ratio between 1.0 and 2.0; measured 4.0). **H2 holds
in direction** (total tokens 6.5x exceed the 4.0x clock ratio; reasoning
6.9x) **and fails on its "output tokens close" clause** (4.3x is not close).
n = 1, one task shape. Caution recorded before any verdict: the diffs differ
in size (93 against 67 changed test lines) and more is not better; the
judges are the instrument for quality and are not told which is which. The
make-judges script prints the mapping, so the architect knew it before the
verdicts; the judges did not, and the decision rule is mechanical.

### The judges (appended between 23:52 and 23:56, both verdicts in; sources named)

Two sealed codex Luna max reviewers, each given the brief, two diffs labelled
X and Y against `96e15fa`, and read-only access to both worktrees; neither
told the rungs, that effort was the question, or that both came from one
model. Mapping, sealed at 20:16:15 before any dispatch
(`evidence/reviews/experiment-medium-vs-max/sealed-key.md`): judge 1 X =
medium, Y = max; judge 2 X = max, Y = medium. The mirrored diffs are
byte-identical pairs (`cmp` at 23:55: judge 2's X equals judge 1's Y, judge
2's Y equals judge 1's X). The architect knew the mapping; the judges did
not; the decision rule was pre-registered above.

| | judge 1 | judge 2 |
|---|---|---|
| dispatched → exited | 22:52:13 → 23:19:57, **27.7 min** | 23:20:19 → 23:51:37, **31.3 min** |
| tests run | TAP 13/13 and 3/3 per tree; 22 armed mutations per tree, hash-restored | TAP 13/13 and 3/3 per tree; 16 armed mutations per tree, hash-restored |
| total_tokens / reasoning | 8,972,569 / 46,771 | 23,056,487 / 44,431 |
| verdict | **Y** | **X** |
| verdict decoded | **max** | **max** |

Sources: `evidence/reviews/experiment-medium-vs-max/JUDGE1.md` and
`JUDGE2.md` (verbatim copies of the judges' reports), `judge1.runner.txt`
and `judge2.runner.txt` (the launcher's clock lines), the token figures from
the rollouts `rollout-2026-09-08T22-52-16-…` and `rollout-2026-09-08T23-20-21-…`
under `~/.codex/sessions/2026/09/08/` read by `f6-exp-tokens.mjs` (captured
in `tokens.txt`; the judges' rollouts name BOTH worktrees, so the tool now
reports four matches per worktree and attribution is by dispatch timestamp,
exact because every run was sequential). Judge 1's FIRST run (22:22:12 →
22:39, `rollout-…T22-22-12-…`, 3,137,734 tokens) is VOID and excluded: the
maintainer had accidentally moved the worktree directories, so it executed
zero tests and read the diffs statically; its report is kept as
`JUDGE1-void-static-trees-absent.md` with its runner file, and it too
preferred Y = max. The trees were restored, `git worktree repair` run, the
`node_modules` junctions re-created, both trees re-verified green (13/13 and
3/3), and judge 1 re-dispatched from scratch.

**Decision rule applied: same CANDIDATE from OPPOSITE POSITIONS.** Judge 1
chose its second-listed diff, judge 2 its first-listed; both chose the max
tree. This is the pre-registered quality signal; the position effect measured
earlier today is excluded by construction.

**On what the judges agreed, independently, sealed from each other** (the
architect verified each claim below in the raw files of both trees at 23:21
and 23:53, not from the reports):

- The scanned-files floor: max asserts `MIN_SCANNED_FILES = 2`
  (`loop/tests/portability.test.mjs:31`); medium asserts `> 0`. A mutant that
  reduces the model scan to one file passes medium (13/13) and fails max
  (13/12/1) — judge 1's row "modelTargets() returns only data/config.json",
  judge 2's finding Y.4.
- The per-root fixture assertions: max asserts each of `lib/`, `app/`,
  `tools/` independently with the exact fixture count; medium asserts an
  aggregate. Both went red on each root's removal (13/12/1 each), so this
  is a strength difference, not a correctness one.
- Judge 2 alone: medium's allow-list keeps join-expression alternatives
  (`no-change-dir-refs.test.mjs:36`, `:46`: `join(openspecRoot, 'changes')`,
  `join(repoRoot, 'openspec', 'changes'…)`), so a named change path appended
  to those generic join lines passes medium (3/3) and fails max (3/2/1) —
  judge 2's finding Y.2, two arms. Max narrowed each entry to the literal
  template form. This is "a narrowing that is looser than its reason", the
  hazard task 22's bullet names.

**What both trees share, found by both judges** (carried to task 22 for
packet F; neither branch fixes them):

- `scripts/no-change-dir-refs.test.mjs:70` decides per LINE: a named path on
  the same line as an allowed generic template passes in both (3/3). The
  brief's planted-path proof was written as a separate line, so it goes red
  in both and does not reach this case.
- The scan's extension list is `.mjs .md .json .yml` in both, so `app/`'s
  `.tsx` source is unscanned; a planted runner id in a `.tsx` file passes
  both (judge 1). **Sharpened by A2AI-Orch's diff read (diff read received before 23:56; Orch's board row carries its send time), measured on
  the live tree: `app/` holds 32 files and 0 of them are scannable — the
  root is LISTED AND CONTRIBUTES ZERO FILES until `.tsx`/`.ts` join the
  extensions; `tools/` contributes 11 and `lib/` 227.** The per-root fixture
  test passes for `app/` only because it plants a `.mjs` fixture under a
  temporary `app/`: it proves the target LIST names `app/`, not that any
  `app/` file is ever scanned — a check narrower than the property it names,
  in the shape where a green reads as coverage that does not exist. Recorded
  as listed-not-covered, never as covered.
- The floor VALUE has no arm in either: mutating the floor assertion to
  `>= 0` stays green in both (judge 2, rows 8-9); the recursive `skipTests`
  propagation has no arm in either (judge 2, row 1). And the floor itself,
  in max's stronger form, is a COLLAPSE detector, not a coverage one
  (Orch, 23:58): `MIN_SCANNED_FILES = 2` catches "the walk returned
  nothing" and cannot catch "the walk returned 3 of 238". The mechanical
  stronger form is per root — each listed root contributes at least one
  file — which would have failed `app/` today without anyone measuring.

**Scored against the pre-registration.** H3 is FALSIFIED in its first clause
(the judges did not report the two indistinguishable; they agreed max is
stronger) and HOLDS in its second (every reported difference is in the test
arms and the allow-list's breadth, never in the production edit — the one
production line, `loop/lib/specs.mjs:23`, is identical in both trees, hash
`BB082B83…` in both judges' tables). H4 holds: both trees pass
`portability` 13/13 and `no-change-dir-refs` 3/3 on the live tree (every
judge run, and the architect's own run at 22:50 after the trees were
restored). The pre-registered outcome for "the judge prefers max on a
finding that matters" applies — a floor that should go red and does not, a
narrowing looser than its reason: **max stays for anything that touches
enforcement; medium elsewhere.** n = 1 task shape, two judges, stated as
such.

**Cost of the verdict.** The two judges together spent 32.0M tokens and 59
minutes to distinguish a 7-minute, 2.8M-token run from a 28-minute,
18.4M-token one; the void run added 3.1M and 17 minutes. The experiment's
own cost, workers and judges, is about 53M tokens and two hours of wall
clock, against a ~15M-token, ~21-minute difference between the rungs on
this one task.

**Handover.** The max branch `exp/max-d75275c` at `8abe800` goes through the
normal handover: the full suite on `8abe800` (started 23:53:09 by the
architect, the machine quiet), A2AI-Orch's diff read, `merge --no-ff` under a
hold, the record, then Orch's gates on the pinned tip. The medium branch
`exp/medium-d75275c` at `f05cfb6` stays unmerged for the record and its
worktree is torn down by the refusing form only.
