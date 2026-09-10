# SEALED REVIEW — the Pulse lease learned a future state. Is the cure smaller than the disease?

authority: two-desks-work-orders-and-trains@a5e873b

You are reviewing an implementation. **Report, do not repair.** You work in a
disposable copy and may break anything in it to test it, but a fixed version of
the author's file is thrown away with the directory. The only thing that survives
you is `REVIEW1.md`, so a defect you quietly corrected instead of writing down is
a defect that ships.

## What was wrong, because it is the reason this packet exists

The Pulse takes a lease before it runs. `checkLease` classified a lease by the
age of its mtime: older than the maximum age is `stale`, otherwise `fresh`. A
lease whose mtime is in the **future** fell through to `fresh`, and was therefore
indistinguishable from a lease written one second ago.

Measured on the unmodified code:

    one minute ahead    fresh    16 min
    one hour ahead      fresh    1.3 hours
    one day ahead       fresh    24.3 hours
    one year ahead      fresh    365.0 DAYS
    ten years ahead     fresh    3650.0 DAYS

A lease ten years ahead held the Pulse off for ten years and every reading said
`fresh`.

**THE REASON IT SURVIVED IS THE PART WORTH CARRYING, AND IT IS THE THING YOU ARE
BEING PAID TO LOOK FOR AGAIN.** A control existed. It sat **one minute ahead** —
inside the range, at the convenient point — and it was green, correctly, for the
value it tested. Every additional sample near it was more evidence for a
conclusion that failed two lines further out. **A CONTROL AT A CONVENIENT POINT
INSIDE A RANGE PROVES THE POINT, NOT THE RANGE.**

## What changed

`LEASE_FUTURE_TOLERANCE_MS` is 60 seconds. A lease more than that far ahead
returns a distinct `future` state instead of `fresh`. `pulse/run.mjs` reads that
state, prints a warning naming the holder and how far ahead the clock is, **and
proceeds.** 28 tests, 28 passing, committed at `10b998f` on `pulse/lease`.

Verified by the coordinator already, so do not spend the review re-proving it:
five mutations applied by hand, four caught. **The fifth — swapping the order of
the `future` and `stale` branches — was NOT caught, and I claim it is an
EQUIVALENT MUTANT**, because the two conditions are mutually exclusive and no
input can distinguish the orders. Question 3 is whether that claim is true.

## The questions, in order of what they are worth

### 1. THE CURE PROCEEDS WHERE THE DISEASE WAITED. IS THAT RIGHT?

**This is the question, and I do not know the answer.**

The property under review is that the Pulse never runs while a live holder is
holding the lease. This brief deliberately does not tell you what enforces that
property in the tree, so find it, run it, and say what you ran — a review scoped
by its brief is a review of the brief.

Before this change, a future-dated lease held the Pulse off indefinitely and
silently. After it, a future-dated lease is **disregarded** and the Pulse runs.

Consider the case that is not obviously wrong: a holder is **genuinely alive and
working**, and its clock is five minutes fast. It writes a legitimate lease. The
new code calls that lease `future`, warns, and proceeds — **so two Pulse runs
execute concurrently, which is the exact outcome the lease exists to prevent.**

An indefinite hold is a visible, diagnosable outage. Concurrent runs are a silent
corruption. **A FIX THAT CONVERTS A LOUD FAILURE INTO A QUIET ONE HAS TO ARGUE
FOR ITSELF, AND THIS ONE HAS NOT.**

Work out what the alternatives are and rule between them. At least these, and
find any I have missed: refuse on `future` as if it were held; treat `future` as
held but bounded by the maximum age measured from the mtime; proceed as it does
now; proceed only when the lease is ahead by more than some larger amount that
cannot be a live clock. Say which, and say what each costs in both directions —
**the cost of running when you should not, and the cost of not running when you
should.**

Then say plainly whether the shipped choice is defensible. `approve` is available
if it is. If the answer depends on facts about how the Pulse writes and refreshes
leases, go and read that rather than reasoning from the names.

### 2. THE CLASS: A FIXTURE COMPUTED FROM THE CONSTANT IT IS MEANT TO BIND CANNOT DETECT A CHANGE TO THAT CONSTANT

Sweep the suite for this and report the enumeration.

The boundary trials build their fixtures from `LEASE_FUTURE_TOLERANCE_MS`
itself — one at the tolerance, one a millisecond past it. That is the right
shape for pinning *where the boundary is relative to the constant*, and it is
exactly the wrong shape for pinning *what the constant is*: change 60 seconds to
600 and the fixture moves with it, and the trial stays green.

**I FOUND ONE INSTANCE. IT IS THE FLOOR, NOT THE LIST.** Go through every trial
in `pulse/tests/lease.test.mjs` and report, for each, whether its fixture is
computed from a constant under test or written as a literal — and for every one
computed from a constant, whether any trial anywhere would fail if that constant
changed. Where nothing would, say so; that is the finding.

Then rule on the general question, because it is not obvious and I do not want a
reflex: **should a value like this be pinned by a literal somewhere, and if so,
what stops that literal from becoming the stale second source this project has
measured the cost of four times?** Both horns are real. Name the one you would
take and why.

### 3. IS THE EQUIVALENT-MUTANT CLAIM HONEST OR CONVENIENT?

I claim that reordering the `future` and `stale` branches cannot change any
behaviour because the conditions are mutually exclusive. **Test it rather than
believing it.** Construct an input that reaches both, or demonstrate that none
exists. Pay attention to the edges — equality, zero, a non-finite `ageMs`, a
`statSync` that returns something unexpected — because "mutually exclusive" is a
claim about the whole domain and I checked it by reading.

If it is genuinely equivalent, say so and it is settled. **A SURVIVING EQUIVALENT
MUTANT IS A DEFECT IN THE MUTATION SET, NOT IN THE TESTS** — but that sentence is
only true when the equivalence is proven, and until then it is an excuse in the
shape of a principle.

### 4. WHAT DOES THE 28-TEST SUITE STILL PASS ON?

Four of my five mutations were caught. Find the ones it survives. **A twin proves
a check can fire; only a mutation proves it must.** Kinds of break worth trying:
a comparison flipped, a threshold moved by one in either direction, a sign
dropped, a conjunction reduced to one term, a returned field deleted, an early
return removed so a later branch runs, a constant replaced by a different
constant of the same units.

Apply each to your copy, run `node --test` on `pulse/tests/lease.test.mjs`, and
report what happened — **caught and missed both.** Keep an untouched copy under
the OS temp directory, restore from it between mutations, and say whether the
lease suite was green again after each restore. A result from an un-restored file
is two mutations reported as one.

### 5. DOES THE WARNING SAY SOMETHING A HUMAN CAN ACT ON?

`run.mjs` prints a warning and proceeds. Read it as the person who finds it in a
log at 04:00 with no context. Does it name the holder, the magnitude, and what to
check? Does it say what the run then DID, or only what it saw? **A WARNING THAT
REPORTS AN OBSERVATION WITHOUT REPORTING THE DECISION IT DROVE LEAVES THE READER
TO GUESS THE DECISION**, and the guess will be that nothing happened.

## Files

Everything in this disposable copy is yours to modify; only the first is a
product, and only the first outlives the directory.

- `REVIEW1.md` — (new) your verdict and findings; the one file that survives
- `pulse/lib/core.mjs` — `checkLease`, the tolerance, the states
- `pulse/run.mjs` — the caller, and the proceed-on-future decision
- `pulse/tests/lease.test.mjs` — the 28 trials under review
- `RESULT2.md` — the author's report for this round, whose claims you are testing
- `RESULT1.md` — round 1's report, for context on what was already argued

Scratch copies for restoring after a mutation go under the OS temp directory.

## Ground rules (non-negotiable, and they do not carry over from anywhere)

- **Never use the token `cd` anywhere** — not in a command, not in a comment, not
  as a shell function name. A guard matches the token, not the intent. Absolute
  paths, and `git -C <dir>` for git.
- Keep command strings short; write a `.mjs` under the OS temp directory and run
  it rather than `node -e`.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you use as evidence.** No `| head`, no
  `| tail`, no `-First N` on a counting or enumerating command.
- **Do not run the Pulse, the Desk, a build, any `verify-*` script, or the whole
  suite.** `node --test` on `pulse/tests/lease.test.mjs` is exactly right.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `REVIEW1.md`

    # THE PULSE LEASE, FUTURE STATE — REVIEW1

    ## VERDICT
    approve | revise | reject     (one word, on its own line, first)

    ## 1. Proceed-on-future — the alternatives, their costs, and my ruling
    ## 2. THE SWEEP — every trial, fixture-from-constant or literal, and what
    ##    would fail if the constant changed
    ## 3. The equivalent-mutant claim — proven, refuted, or undetermined
    ## 4. What the suite still passes on
    | mutation | before | mutated | restored | caught |
    ## 5. The warning, read cold
    ## 6. Findings, each with file and line
    ## 7. What I could not determine
    ## 8. Blocked or refused calls

**`approve` is a real outcome and I am not fishing for a revision.** But section 1
is the acceptance criterion: an approval that does not rule on proceed-on-future,
with its costs in both directions, will be read as a review that answered the
easy question.
