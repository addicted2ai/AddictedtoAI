# ROUND 3 — the future arm refuses, and the property it was built against was mine and was wrong

authority: two-desks-work-orders-and-trains@a5e873b

Round 2 was reviewed by a sealed reviewer that read the tree and your two
reports and never saw the brief. Its verdict is **revise**. The reasoning half
of the review is correct and the attribution half is not, and the second half
is mine to correct rather than yours.

## What the review measured, and none of the measurements are arguable

- The equivalent-mutant claim in `RESULT2.md` is **PROVEN**. Twenty-seven ages
  including both infinities and a non-number, both branch orders, zero
  mismatches, plus a live branch swap in `pulse/lib/core.mjs` that ran 28 pass
  0 fail and restored to the same hash. A surviving equivalent mutant is a
  defect in the mutation set and not in the tests, and this is that case.
  **Nothing in this round revisits it.**
- The tolerance value is pinned by literals — the 30 second and 90 second
  trials bracket it, and the ten-year trial's output assert names it exactly,
  so 61 seconds already fails the suite.
- **`LEASE_MAX_AGE_MS`'s value is pinned by NOTHING.** Every stale fixture is
  `MAX + 60s`, every boundary fixture is `MAX` or `MAX + 1`, every fresh
  fixture is a 60 second literal that stays fresh under growth, and no output
  assert names the max in seconds. **Multiplying the maximum age by ten leaves
  the suite at 28 pass, 0 fail.**
- Four further mutations survive: dropping the finite half of the timing guard
  at `pulse/lib/core.mjs:190`, deleting `path` from the `future` return at
  `:200`, dropping the sign on the ahead magnitude at `pulse/run.mjs:109`, and
  the branch swap already dissolved above.

## THE RULING, WHICH IS MINE AND REVERSES THE PACKET'S CENTRAL CHOICE

**The `future` arm refuses. It stops proceeding.**

The reviewer priced all four dispositions and ruled that proceeding beyond a
sixty second tolerance is not defensible: a live holder whose clock is more
than sixty seconds fast has its lease disregarded at the instant it is read,
which is the exact overlap this file exists to prevent, and the overlap is
silent — exit 0, the queue written, every later line indistinguishable from an
ordinary run. Refusing costs at most a single skipped firing on a grid that
fires four times a day.

**AND THERE IS A SECOND REASON THE REVIEWER DID NOT REACH, WHICH IS ABOUT WHAT
THE CONSTANT IS FOR.**

Under the shipped arrangement `LEASE_FUTURE_TOLERANCE_MS` separates a refusal
from a proceed. That makes it a safety boundary, and a safety boundary has to
be measured — which is why the review's section 7 has to record that the live
skew distribution is undeterminable and that sixty seconds, five minutes and
one hour are all guesses with different safety costs.

Under refusal, both sides of that line refuse. The number then decides only
which diagnostic line prints.

**A CONSTANT THAT SEPARATES TWO SAFE OUTCOMES DOES NOT HAVE TO BE MEASURED. ONE
THAT SEPARATES A SAFE OUTCOME FROM AN UNSAFE ONE DOES.** This packet moved the
constant across that boundary without noticing that it had changed what the
number was for, and the repair puts it back — not by choosing a better number,
but by removing the number's authority over anything dangerous. A larger
tolerance would have been safer and would have kept the number load-bearing;
this keeps it small and makes it harmless.

## THE PROVENANCE CORRECTION — the property you built against was mine

The review reads the proceed decision as yours, and quotes your own concession
that the live skew population is unknown. That attribution is wrong, and the
reason it is wrong matters more than the correction.

**My round 2 brief set the property as: no state of this file may cause the
Pulse to refuse past the maximum age.** Your `RESULT2.md` section 4 derives the
whole disposition from that sentence, correctly. Given that property, the
`future` arm has to proceed. You did what the property required.

**The defect is in the property, and the missing word is `dead`.** The round 1
finding was real — a lease left with a far-future mtime refuses for the skew
plus the max, and ten years ahead is a ten-year outage. But the sentence I
wrote bounds every refusal, and a live holder refusing the Pulse for as long as
it holds the tree **is the brake working**. **A BOUND WRITTEN ON THE SYMPTOM OF
A FAILURE ALSO BINDS THE MECHANISM WORKING CORRECTLY, UNLESS THE PROPERTY NAMES
WHICH ONE IT MEANS.** The property should have said no **dead** lease may
refuse past the maximum age, and that word was carrying the entire distinction.

The reviewer reconstructed a different property from the tree — the Pulse never
rewrites tracked files while a live holder holds the lease — and judged against
that. **The two properties disagree about exactly one state, and that state is
`future`.**

So the honest statement of what we are choosing, and it goes in the source:
a stateless mtime read cannot tell a live holder with a fast clock from a dead
file left ahead, because at any instant the two look identical. One of the two
errors has to be made. **Refusing accepts an unbounded outage for a dead future
lease, and that outage announces itself on every run and a person clears it in
a second. Proceeding accepts a silent overlap with a live one, and the harm is
a tree rewritten under a running gate, which nothing announces and nobody
diffs.** We take the error that is visible.

## THE CLASS FOR THIS ROUND'S SWEEP

**THE CLASS: a constant in these files whose VALUE no fixture pins, because
every fixture that mentions it is computed from it.**

The maximum age is the instance the reviewer found and it is the FLOOR, not the
list. Sweep every constant and every deciding literal in `pulse/lib/core.mjs`
and `pulse/run.mjs` that the lease path touches, and for each report: which
fixture pins the value, which pins only the edge relative to the value, and
what changing the value by a factor of ten does to the suite. Where nothing
pins a value, add the pin or say why the value cannot be pinned.

A computed edge fixture is not wrong and is not to be removed — `MAX` against
`MAX + 1` on a pinned clock proves the comparison is strict, which a literal
cannot. **The edge fixture and the value pin answer different questions and the
file needs both.** The tolerance already has both; the maximum age has only the
first.

Pin the value as a failing tripwire in the test and never as a restated number
in prose. A prose copy reads like a measurement and stays green while it drifts;
a test literal fails when it drifts and forces a conscious edit. That edit is
the point, not the cost.

## The repair, arm by arm

### The `future` arm refuses, under its own line

In `pulse/run.mjs`, `future` leaves the group of loud proceeds and joins the
refusals. Exit 0, nothing written, the same shape as the fresh refusal and a
**distinct line**, because the defect round 2 repaired was precisely that these
two printed the same sentence with the age clamped to zero.

STOP stays first and that ordering is not yours to move.

The line must carry the path, the holder, the ahead magnitude, the tolerance,
and the word refusing. It must state the remedy **conditionally** — that the
file may be deleted when no gate run is active, or the writer clock corrected —
and it must **NOT** suggest raising the tolerance. **AN ERROR MESSAGE THAT
SUGGESTS A REMEDY IS PRESCRIBING, AND A GUARD THAT PRESCRIBES THE EDIT THAT
SILENCES IT IS WORSE THAN ONE THAT SIMPLY REFUSES.** Deleting an abandoned
advisory file when nothing holds the tree is maintenance; widening the band
until the guard stops speaking is not.

### The magnitude has to be readable by a person at four in the morning

`mtime 315360000s ahead` scans as noise. Choose a rendering rule, state it in
the source, and give it fixtures on both sides of its own threshold. That
threshold is a display constant and no safety depends on it, which is worth one
sentence in the comment so a later reader does not go looking for the
measurement behind it.

### The value pin for the maximum age

Assert the stale line's max in seconds literally, and add a stale fixture whose
age is a fixed literal past the current maximum rather than an expression built
from it. Multiplying the maximum by ten must fail the suite after this round.

### The four surviving mutations

- The finite half of the timing guard at `pulse/lib/core.mjs:190`: add mtime
  cases of positive and negative infinity expecting `stat-failed`. The code is
  already correct; the fixture is missing.
- The `path` field on the `future` return at `:200`: assert it is present and
  is the lease path. Deleting it currently leaves the suite green while the
  guard prints an undefined value into its own line.
- The ahead magnitude at `pulse/run.mjs:109`: assert a small magnitude
  literally, so dropping the sign fails. The ten-year trial cannot catch it,
  because a dropped sign there still prints a number that satisfies the match.
- The branch swap: **proven equivalent, and nothing is owed.** Record it in
  your report as dissolved rather than as fixed.

### The non-finite clock, and why this one is dissolved rather than repaired

The reviewer flags that an injected non-numeric `nowMs` yields `fresh`. Under
the ruling above `fresh` refuses, so the surprising path now lands on the
conservative outcome and the finding loses its force. **A FINDING DISSOLVED BY A
DECISION MADE SOMEWHERE ELSE STILL NEEDS ITS FIXTURE, BECAUSE WHAT DISSOLVED IT
IS A DECISION AND A DECISION CAN BE REVERSED.** Add a fixture pinning that a
non-finite injected clock refuses, and say in the comment that it refuses
because refusing is the safe direction and not because anyone measured it.

## Scope

- **Do not change `LEASE_FUTURE_TOLERANCE_MS` or `LEASE_MAX_AGE_MS`.** Their
  values are settled; what changes is what the first one decides.
- **Do not touch the STOP arm, the `absent` arm, or the `stat-failed` arm.**
  The last of those proceeds for a reason that still holds: a timing read that
  fails will usually fail again.
- **Do not run the Pulse against this repository, the Desk, a build, any
  `verify-*` script, or the whole suite.** `node --test` on the lease suite and
  the fixture roots the suite already builds under the OS temp area are exactly
  right.
- Keep an untouched copy of every file you mutate under the OS temp area,
  restore from it between mutations, and report whether the suite was green
  again after each restore.

## Files

Work only in these; a diff touching any other path is a scope finding.

- `pulse/run.mjs` — the `future` arm moves from proceed to refuse, with its own line and its magnitude rendering
- `pulse/lib/core.mjs` — comments only, recording what the tolerance now decides and which error we are choosing
- `pulse/tests/lease.test.mjs` — the four beyond-tolerance trials flip to refuse, plus the value pin, the infinities, the path assert, the magnitude assert and the non-finite clock
- `RESULT3.md` — (new) your report, in the repository root beside the two that came before it

**Do not edit** anything under `lib/`, `loop/`, `scripts/`, `app/`, `tools/`,
`content/`, `data/`, `wisdom/` or `openspec/`, and not `package.json`,
`runners.yml`, `CLAUDE.md` or `AGENTS.md`.

## Ground rules (non-negotiable, and they do not carry over from anywhere)

- **Never use the token `cd` anywhere** — not in a command, not in a comment,
  not as a shell function name. A guard matches the token and not the intent.
  Absolute paths, and `git -C <dir>` for git.
- Keep command strings short; write a `.mjs` under the OS temp area and run it
  rather than passing a program on the command line.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you use as evidence.** Nothing piped
  into a pager and no count limit on a command whose job is to enumerate.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `RESULT3.md`

    # THE PULSE LEASE, REFUSING ON FUTURE — RESULT3

    ## 1. THE SWEEP — every constant and deciding literal, and what pins its value
    | constant | value | fixture pinning the VALUE | fixture pinning only the EDGE | suite at ten times the value |
    ## 2. The future arm, refusing — the line, quoted, and how it differs from the fresh refusal
    ## 3. The magnitude rendering — the rule, its threshold, and the fixtures either side
    ## 4. The four surviving mutations — each now caught, or dissolved with the reason
    ## 5. The mutations — one per arm added or changed
    | arm | mutation | before | mutated | restored | files identical |
    ## 6. What refusing on future costs, measured rather than argued
    ## 7. What the suite still does NOT catch, said plainly
    ## 8. What I could not determine
    ## 9. Blocked or refused calls

Section 1 is the acceptance criterion. Section 6 is where I need a number
rather than a paragraph: for a dead lease left one hour ahead, one day ahead
and ten years ahead, how long does the engine now refuse, and what does a
person have to do to clear it. Section 7 costs you nothing and the last round's
report was graded on exactly that section's honesty.
