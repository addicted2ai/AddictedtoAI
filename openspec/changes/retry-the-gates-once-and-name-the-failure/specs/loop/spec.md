# loop — delta for retry-the-gates-once-and-name-the-failure

One requirement added. Nothing is modified, and in particular the breaker list
is not: `failed` still means "gates or review rejected finished work", and
`failed` and `discarded` still count toward breaker 1 while `blocked`,
`interrupted`, `capacity` and `abandoned` still do not. The closed enumeration
in "Breakers halt the loop, and only the named ones" is untouched, deliberately.

**This transcribes a mechanism that already runs and states the decision that
closes the question around it.** The Desk retries a failed gate run exactly once
and records what kind of failure it was
(`loop/run.mjs:443-502`, `loop/lib/gates.mjs:64-119`, measured on this tree on
2026-09-06). No requirement anywhere says so, so the spec reads as though a
single gate run settled the outcome, and an implementer restoring the file from
the spec would delete the retry without a red spec check anywhere.

**The decision, and it is a refusal.** `addictedtoai-icpb` and its duplicate
`addictedtoai-juig` both ask whether a gate failure the machine can prove
environmental should be kept off breaker 1's count. The answer here is **no**,
and the reason is the hazard both beads name themselves: *"a classifier that
lets failures off the count is a classifier that can be wrong in the direction
of never halting."* The safety property this repository actually needs — **a
real defect still fails twice** — is supplied by the retry, and it is supplied
without any classifier being trusted for it. The retry is unconditional, so a
marker that were spoofed, mis-emitted or invented by a future fixture buys
nothing: it changes what the log and the ledger *say*, never what the loop
*does*. That is why the classification below is required to exist and forbidden
to decide anything.

What the beads asked for that this does grant is the honest ledger line. Three
jobs were recorded `gates failed` with no qualification on 2026-09-02, the
breaker counted all three, and the record still reads as though the code were at
fault. A note naming the failing script and whether the captured output carried
the marker costs nothing, changes no control flow, and makes the line answerable
on its own.

## ADDED Requirements

### Requirement: A gate failure is retried once, and the record names which kind it was

The mechanical gates run a job's branch before review. When they fail, the loop
SHALL run them exactly once more — the same scripts, in the same worktree — and
SHALL NOT run them a third time. A retry that passes SHALL let the run continue
normally and SHALL NOT be recorded as a failure of any kind; a retry that fails
SHALL settle the job `failed`.

- **The decision to retry SHALL NOT depend on any classification of the
  failure.** Every gate failure is retried, whatever its output said. The
  property that makes the retry safe is that a real defect fails twice, and that
  property holds for any retry-once policy; making it conditional on a marker
  would make a spoofable string the thing that decides whether work is examined
  again.
- The loop SHALL classify each gate failure as **machine** or **unexplained**,
  by reading a marker that the code which observed the failure emits — never by
  matching a guessed error string downstream of it. The marker SHALL have
  exactly one declared wording, in exactly one place in the source tree, and the
  emitting sites SHALL interpolate that declaration rather than restate it. A
  failure carrying no marker SHALL classify as **unexplained**; there is no
  third state and no inference.
- The classification SHALL be computed over each gate script's **full captured
  output**, at the point of capture, before any truncation the loop performs for
  human-readable logging. A decision made over a truncated log is a decision
  that changes with the length of the run.
- **The classification SHALL NOT remove a failure from any count, any breaker or
  any budget.** A twice-failed gate run is `failed` whether its output carried
  the marker or not, it advances breaker 1's consecutive count exactly as any
  other `failed` outcome does, and its spend is recorded exactly as any other.
  The classification exists to make the record answerable and for nothing else.
- The ledger note for a job settled `failed` at the gates SHALL name **which
  gate scripts failed** and **whether the captured output carried the marker**,
  in place of an unqualified "gates failed". A note that named only the
  classification would leave the ledger unable to tell a first failure from a
  confirmed one.
- A job whose gates were retried SHALL carry on its permanent job record that a
  retry happened, whether the retry passed, whether the first run's output
  carried the marker, and which scripts the first run failed on. A job whose
  gates passed on the first run SHALL carry none of these. Without the record a
  retried-then-passed job is indistinguishable from one that never failed, and
  nothing could measure whether the policy is paying for itself.

#### Scenario: A machine failure that clears on the retry costs the job nothing

- **WHEN** a gate run fails with output carrying the machine-failure marker and
  the second run of the same gates passes
- **THEN** the job continues to review, no failure is recorded, no breaker sees
  anything, and the job's record carries that a retry happened, that it passed,
  that the first output was marked, and which script had failed

#### Scenario: A real defect still fails twice

- **WHEN** a job's diff genuinely breaks a test and both gate runs fail
- **THEN** the job is settled `failed`, the ledger note names the failing script
  and says no marker was present, and the outcome advances breaker 1's count
  exactly as any other `failed` outcome does

#### Scenario: A marked failure that repeats is still a failure

- **WHEN** a gate run fails with the machine-failure marker and the retry fails
  with it too
- **THEN** the job is settled `failed`, the note says the output was marked and
  that the retry failed again, and the outcome advances breaker 1's count — the
  classification changes the note and nothing else

#### Scenario: Three marked twice-failed jobs halt the Desk

- **WHEN** three consecutive jobs of one type each fail their gates twice with
  the machine-failure marker present every time
- **THEN** breaker 1 trips and `HOLD.md` is written, because a classification
  that could prevent a halt is a classification that can be wrong in the
  direction of never halting

#### Scenario: A marker pushed out of the truncated log is still read

- **WHEN** a gate script emits the marker early in an output long enough that
  the loop's truncated log no longer contains it
- **THEN** the classification still reads **machine**, because it was computed
  over the full output at capture

#### Scenario: An unexplained failure is not talked into being a machine failure

- **WHEN** a gate run fails with an error that resembles a connection problem
  but carries no marker from the code that observed it
- **THEN** the failure classifies as unexplained, the retry runs anyway, and the
  note says no marker was present
