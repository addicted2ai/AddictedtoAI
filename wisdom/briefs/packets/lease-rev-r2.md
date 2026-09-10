# THE LEASE ROUND 2 — A STATE WITH A RANGE, TESTED AT ONE CONVENIENT POINT

authority: two-desks-work-orders-and-trains@a5e873b

Round 1 is good work and most of it stands. The suite is 17 for 17, the state
sweep enumerated twenty-six states and dismissed six of them in writing with
reasons, and I verified independently that the guard is bound rather than merely
present: four mutations of your own code — the stale branch neutered, the refusal
removed, a failed timing read made to refuse, and absent treated as fresh — each
turned the suite red, and it was green again after every restore.

**Section 4 is wrong, and the way it is wrong is the thing this round is about.**

## The finding, measured

Section 4 answers **None** to the question *which states can make the Pulse
refuse forever*, and defends row 11 — an mtime ahead of the wall clock — with
the argument that a negative age *"still crosses the max on its own"*.

The control behind row 11 is a touch **one minute** ahead. Here is the same
state at other points, measured against your own shipped `checkLease`:

    mtime ahead of now     state    the Pulse refuses for
    one minute             fresh    16 minutes      <- the point that was tested
    one hour               fresh    1.3 hours
    one day                fresh    24.3 hours
    one year               fresh    365 days
    ten years              fresh    3650 days

The argument is true and it is not a bound. **"It ages out on its own" says
nothing about when**, and the when is the entire property. Four scheduled
firings a day fall inside every window past a few hours. One file with a wrong
timestamp — a restored virtual machine, a corrected clock, a copy from a machine
whose clock was wrong, a timestamp set by hand — refuses the engine for as long
as the skew lasts.

**This is the forever-refuse the whole design was built to prevent, arriving
through the one door nobody thought to measure, in the row that names the state.**

## THE CLASS, AND THE SWEEP THIS ROUND OWES

**THE CLASS: a state that spans a RANGE, given a control at one convenient point
inside it, and a conclusion drawn across the whole range.**

Row 11 is not "an mtime one minute ahead". It is "an mtime ahead of the wall
clock", which runs from a millisecond to a decade, and one instance was chosen
from the near end — the end where the property happens to survive.

Go back through your own sweep and find every row whose state has a range:
duration, size, length, count, distance, depth, how far ahead or behind. **For
each one, either put a control at the end of the range that threatens the
property, or write down why the range is bounded.** The age rows already do this
correctly — max and max-plus-one-millisecond, on a pinned clock — so the standard
is one you already met somewhere in the same file.

**A CONTROL AT A CONVENIENT POINT INSIDE A RANGE PROVES THE POINT, NOT THE
RANGE.**

Report the sweep as a table again, and **re-derive section 4 rather than
re-asserting it**: hold every row against the sentence a second time, now that
one row is known to have failed it.

## The repair itself

The requirement, and the mechanism is yours to choose:

**No state of this file may cause the Pulse to refuse past the maximum age.**
That is the original sentence with the loophole closed — *forever* was too weak
a word, because a decade is not forever and is worse than any outage this brake
was built to prevent.

Two cautions, because the obvious repairs each have a failure of their own:

- **A repair must not create a new forever-refuse**, which is what treating an
  unreadable timing read as fresh would have done and is why round 1 correctly
  proceeds on it. Check your own repair against the sentence before you write
  the test for it.
- **Do not make a slightly fast clock unusable.** A holder writing from a machine
  a few seconds ahead is doing nothing wrong, and a brake that refuses to
  function under ordinary clock jitter gets switched off within a week. Say what
  tolerance you chose and what it costs at both ends.

Whatever you choose, it must be **loud** when it fires — a lease disregarded for
a reason other than age is a fact somebody needs to see, and it is a different
fact from an aged-out lease.

## The mutation contract, which round 1's brief did not carry and should have

For every branch you add or change: a vehicle that passes, a twin that fails, and
**a mutation of your own code that turns your own twin red** — applied, run,
restored, run again, all three states recorded, named precisely enough that
someone else can reapply it.

**A TWIN PROVES A BRANCH CAN FIRE. ONLY A MUTATION PROVES IT MUST.**

That check was run against round 1 by hand and it passed on all four
load-bearing branches. Round 2 carries it itself, so nobody has to.

## The correction owed to RESULT1

Put the correction in `RESULT2.md` section 1, and append exactly this as the
**last line** of `RESULT1.md`, changing nothing else in that file:

    CORRECTION 2026-09-10: section 4's answer of None is refuted for row 11; see RESULT2.md section 1.

**Use that date verbatim, including if your run crosses midnight.** It is the
local date the refutation was measured, not the date you happen to type it, and
it is the only date in your work that is not yours to set. Every other date you
write is this machine's local date at the time you write it.

Leaving a refuted claim standing while its correction lives somewhere else is how
a wrong statement outlives its own correction. Do both halves.

## Scope, unchanged from round 1

- **The Pulse only.** The Desk is a separate decision and a separate packet.
- **Do not touch `STOP`'s handling**, and keep the lease check after it.
- **Do not write the harness side.** The creator and refresher live outside this
  repository.
- **Do not loosen the maximum age** to make a case pass. The number is a stated
  trade with a reason; changing it is a finding for your report, argued, not an
  edit that makes a red go away.

## Files

Work only in these; a diff touching any other path is a scope finding.

- `pulse/lib/core.mjs` — the reader and the repair
- `pulse/run.mjs` — the guard, if the repair needs a new line there
- `pulse/tests/lease.test.mjs` — (new) round 1 wrote it in this worktree and it
  is not in the repository yet; the controls, the range ends and the mutations
- `RESULT2.md` — (new) your report, in the repository root
- `RESULT1.md` — one appended line pointing at the correction

**Do not edit** `package.json`, `runners.yml`, anything under `data/`,
`CLAUDE.md`, `AGENTS.md`, `pulse/lib/publish.mjs`, or anything under `openspec/`.

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
- **Never run the Pulse against this repository.** Your tests build throwaway
  repositories under the OS temp directory, as round 1's do.
- Never run `npm run build`, the whole `npm test`, any `verify-*` script, or the
  Desk. `node --test` on `pulse/tests/lease.test.mjs` is exactly right.
- **Do not delete or replace the `node_modules` link at the root of this
  worktree.** It points at the main tree's installed packages; removing it
  removes theirs.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `RESULT2.md`

    # THE PULSE LEASE — RESULT2

    ## 1. The correction owed to RESULT1 section 4
    ## 2. THE RANGE SWEEP — every state with a range, and where its control sits
    | state | the range | control at the threatening end, or why the range is bounded |
    ## 3. The repair — what I chose, the tolerance, and what it costs at both ends
    ## 4. SECTION 4 RE-DERIVED — every state held against the sentence again
    ## 5. The mutations — one per branch added or changed
    | branch | mutation | before | mutated | restored | files identical |
    ## 6. The new log line, quoted, and how it differs from the aged-out one
    ## 7. What I could not determine
    ## 8. Blocked or refused calls

Section 2 is the acceptance criterion. Section 4 is the one that was wrong in
round 1, so it is re-derived rather than carried forward — an answer reached on
one attempt and then repeated is not evidence the second time.
