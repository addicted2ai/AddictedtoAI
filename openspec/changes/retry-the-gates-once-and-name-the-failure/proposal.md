# Retry the gates once and name the failure

## What was re-measured before designing anything

`addictedtoai-icpb` was filed 2026-09-02 and triaged 2026-09-04. Between then
and now the code moved a very long way, and a second triage lane in the same
sweep concluded it was **resolved** while a third reclassified it as
**spec-bound**. Both readings are partly right, and the measurement below is why
this change is small and why it is not nothing. Everything was read on
**2026-09-06** at `impl/spec-review`, cut from `main` at `e76fb30`.

**What the bead claimed, and what is true now.**

| the bead's claim (2026-09-02 / 09-04 triage) | measured 2026-09-06 |
|---|---|
| `loop/run.mjs:357` records every gate failure as the flat note `gates failed` | **FALSE now.** `loop/run.mjs:499` calls `gateFailureNote` (`loop/lib/gates.mjs:101-119`), which names each failing script with its exit status and says either `transport-marked` or `no transport marker in the captured output`, plus `retried once and failed again` where that happened. |
| "The Desk discards a job's work on ANY gate failure" | **FALSE now.** `loop/run.mjs:443-495` runs the gates a second time on **any** failure and continues normally if the retry passes. Commits `9f9139a` and `637398d`, both present on this branch. |
| `loop/lib/breakers.mjs:63-68` counts failed/discarded by type with no cause read | **TRUE, unchanged.** `checkConsecutiveFailures` reads `outcome` and `type` and nothing else; the file greps clean for `environmental`, `transport` and `TRANSPORT`. |
| The marker to key on is `pulse/tests/helpers.mjs` | **MOVED.** The one declared wording is now `TRANSPORT_FAILURE_MARKER` in `loop/lib/gates.mjs:64`, and both emitting sites interpolate it. `loop/tests/gate-transport-retry.test.mjs:276` scans `pulse/` and fails on a re-invented wording. |
| — | **NEW, and it is the finding this change acts on.** The retry, the classification and the note are described by **no requirement in `openspec/specs/loop/spec.md`.** The word "retry" appears there eleven times and never about the gates; `grep` over the file for `transport` returns nothing. |

`loop/tests/gate-transport-retry.test.mjs` carries 18 tests over this
mechanism, including that a retried-then-passed gate is not a failure toward
breaker 1, that a marker truncated out of the log is still read, and that the
retry runs the same gates in the same worktree. So the mechanism is built and
measured. It is simply undescribed.

**One measurement the beads do not contain.** `loop/tests/breakers.test.mjs:31`
proves three consecutive same-type failures write `HOLD.md` and that two failed
plus a blocked do not. There is **no** test that a *marked* twice-failed
failure still counts — because no exemption exists for one to disprove. That
absence is what makes the refusal below worth writing down rather than leaving
implicit.

## The finding

Two different things were tangled in one bead, and separating them is most of
the work.

**The half that is done.** The ledger line the bead asked for — *"a ledger line
that says `gates failed (environmental: connect EADDRINUSE)` rather than `gates
failed` ... costs nothing, changes no control flow, loosens nothing"* — exists.
So does something the bead did not ask for and that supersedes most of its
motivation: the gates are retried once on any failure, so the sound work the
bead was trying to rescue is now rescued, without any classifier being trusted
to rescue it.

**The half that is not done, and it is not code.** None of this is in the spec.
`specs/loop`'s breaker requirement reads as though one gate run settles an
outcome, and nothing states that the retry is unconditional, that the marker has
one declared wording, that the classification is computed before truncation, or
that it decides nothing. A mechanism whose safety argument lives only in a
source comment is a mechanism the next refactor is free to invert — and the
specific inversion this one invites is the obvious "optimisation" of retrying
only marked failures, which is exactly the shape `addictedtoai-xzdd` already
had to undo once.

**And the open question both beads carry is undecided in writing.** `juig` — a
duplicate of `icpb` by its own triage note, still open — proposes that a failure
whose note names an environmental cause should not advance breaker 1's count.
Nothing records an answer.

## The decision

**Transcribe the mechanism, and refuse the exemption.**

The retry stays unconditional and the classification stays inert. Written as
requirements: the loop retries once on any failure, classifies from a
single-wording marker the observing code emits, computes that classification
over the full captured output before truncation, names both facts in the ledger
note and on the job record — and **the classification removes a failure from no
count, no breaker and no budget.**

The refusal is the substantive decision and it goes against the shape `juig`
proposed. Its own hazard paragraph is the argument: *"a classifier that lets
failures off the count is a classifier that can be wrong in the direction of
never halting."* The Desk already has the safety property that mattered — a real
defect fails twice — and it has it from the retry, which trusts nothing. Adding
a second mechanism that *does* trust the classifier would put a spoofable string
between three consecutive real failures and the brake, to buy a halt that is
already avoided by the retry in every case the beads actually observed. Both
observed instances (`j-20260902-09`/`-10`, `j-20260903-04`,
`j-20260904-38`) were single failures that a retry clears.

The honest limit, stated: this leaves one case unrescued — a machine sick enough
to fail the same gates twice, three jobs in a row. That halts the Desk, and it
should. A machine in that state is not producing trustworthy gate results for
anyone, and `HOLD.md` naming it is a better outcome than a Desk that keeps
authoring against gates nobody can believe.

## What is out of scope

- **Changing the breaker enumeration.** "Breakers halt the loop, and only the
  named ones" is not modified and its closed list of counting outcomes is
  unchanged. The decision above is precisely the decision not to touch it, and
  the new requirement says so in its own words so the two cannot drift.
- **Widening the marker.** The delta requires one declared wording and forbids
  downstream string-guessing. It does not add a second marker, and
  `addictedtoai-brsp`'s fix — both emitters interpolating one constant — is
  transcribed, not reopened.
- **The suppliers of these failures.** `addictedtoai-ovrk` (a lock test that
  flakes under load), `addictedtoai-ucbv` (loopback fixtures) and
  `addictedtoai-e71c` (resident processes taking ports) are the conditions that
  produce the failures this classifies. Fixing them is better than classifying
  them and is not this change.
- **A third gate run.** Explicitly forbidden by the delta. Retrying until green
  is the loop the repository's own rule about guardrails refuses.
- **`data/config.json`.** No bound, cap or threshold changes; the retry has no
  configuration and the delta gives it none.

## The beads this serves

- `addictedtoai-icpb` — the Desk cannot tell an environmental gate failure from
  a real one, and the breaker counts both. The telling is built; this writes it
  into the spec and records that the counting is deliberate.
- `addictedtoai-juig` — breaker 1 counts an environmental gate failure the same
  as a real one, so a flake can halt the Desk. Its own triage note calls it a
  duplicate of `icpb`; it is answered here, with a refusal and a stated reason,
  rather than left open behind an implied one.
