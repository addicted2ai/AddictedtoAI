# THE PULSE LEASE — a brake that binds the one writer nobody can talk to

authority: two-desks-work-orders-and-trains@a5e873b

You are adding **one guard** to the Pulse and its test. It is small, and the
reason it is small is that the design work is already done and written below —
your job is to implement exactly this shape and to prove it refuses.

## What happened, because the guard is unreadable without it

At **00:00:41 on 2026-09-10** the Pulse fired on its scheduler and committed 16
files and 8,294 insertions to the working tree, unattended, while two sessions
were mid-conversation about something else and five ungated commits were standing
on that tree. It did not reach the remote, and the only reason was that
`publish` was switched off in configuration for an unrelated purpose.

**The scheduled task has four daily triggers — 00:00, 06:00, 12:00 and 18:00
local. A full gate run takes about seven minutes.** A gate run that straddles a
firing has tracked files rewritten underneath it mid-flight, and the gates then
measure a tree that no longer exists. That has already cost one run tonight from
a different writer.

**EVERY OTHER COORDINATION IN THIS PROJECT IS AN AGREEMENT BETWEEN SESSIONS THAT
CAN READ A BOARD. A SCHEDULER READS NOTHING, ANSWERS NOTHING, AND CANNOT BE
TOLD.** That is the whole problem, and it is why the brake has to live in the
Pulse's own code rather than in anyone's procedure.

### The brake that looks right and is not

`HOLD.md` is the obvious candidate and it is the wrong one. Read it yourself
before you believe this paragraph: `HOLD.md` is consulted only in
`pulse/lib/publish.mjs`, and it suspends **phase 2 only** — fetch, snapshot,
diff, derive and **commit** all still run. It protects the remote and does
nothing for the tree.

The only existing brake that stops this writer is `STOP` (`pulse/run.mjs`, the
first thing the file does), and **`STOP` is the maintainer's alone — created and
removed only by him.** So the available brake is the wrong one and the correct
one is not ours to touch. That is why a new one is needed rather than a reuse.

## The design, and the parts that are not negotiable

**A LEASE, NOT A LOCK.** The distinction is the entire safety argument. A lock is
held until released; if its holder dies, it is held forever. **A crashed gate run
must never be able to stop the Pulse permanently** — a Pulse that stops silently
produces no commits, and *no commits is indistinguishable from nothing changed in
the world*. That is the exact defect class this project keeps finding, and
installing it inside the brake meant to prevent a different one would be the
worst possible place for it.

So:

1. **The lease file's MODIFICATION TIME is the authority on whether it is live,
   not any field inside it.** A field can be written wrong, written in the wrong
   timezone, or written by a version that has drifted. An mtime cannot.
2. **The holder keeps the lease alive by touching it.** A lease is held only
   while its holder keeps saying so. If the holder stops — crash, kill, power
   loss — the lease ages out on its own with nobody to clean up.
3. **Past its maximum age the Pulse IGNORES it and says so LOUDLY**, naming the
   file, its age and the fact that it is being disregarded. A stale lease must be
   noisy, because a stale lease means a gate run died and nobody noticed.
4. **The contents are advisory and are for the log only** — who holds it, why,
   since when. The Pulse reads them to name the holder in its own output. **A
   malformed or unreadable file must not throw and must not be treated as
   absent**: treat it as a lease with no name and let the mtime decide, exactly
   as `pulse/lib/core.mjs` already does for one bad line in an append-only
   history.
   **AND THE CASE THAT SENTENCE DOES NOT COVER, WHICH IS THE DANGEROUS ONE: it
   assumes an mtime exists to decide with.** `core.mjs`'s precedent is bad
   CONTENTS behind a readable stat; it says nothing about the stat itself
   failing. **If the mtime cannot be read at all, PROCEED and say so loudly** —
   never refuse. A stat that fails on one attempt will usually fail on the next
   attempt too, so refusing on it is the forever-refuse of the property below,
   arriving through the one door the rest of this design left open.
5. **The refusal exits 0 and is unmistakable in the log.** `STOP`'s comment
   already gives the reasoning and you should follow it: a stopped Pulse is an
   instruction obeyed, not an error for a scheduler to alarm about. But the line
   must not read like a normal quiet run, and **it must not read like `STOP`
   either** — someone who confuses the two will eventually clear the wrong one,
   and one of them is the maintainer's.
6. **The writer of this file is OUTSIDE the repository** — it is the gate
   harness, which lives in a session's scratchpad. Say so in a comment where the
   path is defined. A brake whose writer is invisible reads as dead code to the
   next person, and dead-looking code gets deleted.

**Choose the maximum age deliberately and write down why.** A gate run measured
at about seven minutes, with a refresh while it runs, does not need a long one;
too long converts a crash into a long outage, too short lets a slow run lose its
own lease mid-flight. State the number and the trade in a comment.

## THE CONTROLS — A CLASS AND A SWEEP, NOT A LIST TO TICK OFF

The standing bar on this project: **a check that has never been seen refuse
something is not yet a check.** For a brake there is a second half — **a brake
that has never been seen RELEASE is an outage waiting to happen.**

**THE CLASS: every distinguishable state this file can be in on disk is a case,
and each one needs a test that asserts what the Pulse actually did in it.** Not
what it should do — what it did, observed, asserted.

**Enumerating that state space is your job, and the enumeration is part of the
deliverable.** Below are the three I arrived at in one sitting. They are the
FLOOR, not the list: I am naming them because each one carries a reason that must
not be lost, not because I believe they are complete. **A sweep that returns only
these three will be read as a sweep that did not happen.** Go through the ways a
file can exist, fail to exist, or exist wrongly, and give each its own case.

| | the lease | the Pulse must | why this one exists |
|---|---|---|---|
| 1 | absent | **proceed** | the ordinary case; proves the guard is not always-on |
| 2 | present, fresh | **refuse**, naming the holder | proves it is a brake at all |
| 3 | present, aged past the maximum | **proceed**, saying loudly that it ignored a stale lease | **proves a dead holder cannot cause a permanent silent outage** |

**Case 3 is the one that would get skipped**, because it is the case where
nothing goes wrong. It is also the only one standing between a crashed gate run
and a Pulse that quietly stops working.

**THE PROPERTY THE SWEEP IS ACTUALLY TESTING, and it is one sentence: NO STATE OF
THIS FILE MAY MAKE THE PULSE REFUSE FOREVER.** Every state you enumerate gets
held against that sentence. A state that refuses and then ages out is fine. A
state that refuses and never ages out is this brake installing the exact outage
it exists to prevent, and it is the finding worth the whole packet. Check the
arithmetic of "aged", not just the intended path through it.

Report the enumeration in full — including any state you decided needed no case,
with the reason. A state you considered and dismissed in writing is a judgement I
can overturn; a state you never listed is one nobody will ever look at again.

Build fixtures as throwaway repositories under the OS temp directory, the way
every other test in this repository does — set the file's mtime directly rather
than sleeping, so the suite stays fast and every timing case is exact rather than
approximate.

## Scope, and what is deliberately NOT in it

**The Pulse only.** The Desk (`loop/run.mjs`) is also a writer, but it is started
by a session that can read a board and be told to wait; the Pulse is the writer
that cannot. Extending the lease to the Desk is a separate decision and a
separate packet — **do not do it here**, and if you think it should happen, say
so in your report rather than doing it.

**Do not touch `STOP`'s handling.** Not to refactor it, not to share code with
it, not to move it. It is the maintainer's brake and the one guard in this file
that must keep behaving exactly as it does today.

**AND THE ORDER IS PART OF THAT: check the lease only AFTER the `STOP` check has
had its turn.** A lease check placed first would, in a run where both files are
present, exit on the lease and never mention `STOP` — a log line saying a gate
run holds the tree when what is actually true is that the maintainer stopped the
engine. The two brakes must never be able to hide each other, and `STOP` is the
one that must always be the visible reason when it is present.

**Do not write the harness side.** The thing that creates and refreshes the lease
is outside this repository and belongs to another session. You are building the
reader and its proof.

## Files

Work only in these; a diff touching any other path is a scope finding.

- `pulse/run.mjs` — the guard itself, beside the existing stop-file check
- `pulse/lib/core.mjs` — the lease path joins the existing `paths()` entries
- `pulse/tests/lease.test.mjs` — (new) the three controls, each asserted
- `RESULT1.md` — (new) your report, in the repository root

**Do not edit** `package.json`, `runners.yml`, anything under `data/`,
`CLAUDE.md`, `AGENTS.md`, `pulse/lib/publish.mjs`, or any file under `openspec/`.

## Ground rules (non-negotiable, and they do not carry over from anywhere)

- **Never use the token `cd` anywhere** — not in a command, not in a comment, not
  as a shell function name. A guard matches the token, not the intent. Absolute
  paths, and `git -C <dir>` for git.
- Keep command strings short; write a `.mjs` and run it rather than `node -e`.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you use as evidence.** No `| head`, no
  `| tail`, no `-First N` on a counting or enumerating command — an exit code
  read through a pipe has already been wrong twice on this project today.
- **Never run the Pulse against this repository.** `node pulse/run.mjs` here would
  fetch sources and write the data tree. Your test builds throwaway repositories
  under the OS temp directory and runs against those; that is the only way the
  Pulse gets run in this job.
- Never run `npm run build`, the whole `npm test`, any `verify-*` script whole,
  or the Desk. `node --test` on your own new test file is exactly right.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `RESULT1.md`

    # THE PULSE LEASE — RESULT1

    ## 1. The guard, by line
    ## 2. The maximum age I chose, and the trade I made
    ## 3. THE STATE SWEEP — every state of the lease file I enumerated
    | state | expected | observed | asserted where | or: dismissed, and why |
    ## 4. States I found that can make the Pulse refuse forever
    ## 5. What I did NOT do, and why
    ## 6. Where the refusal line differs from STOP's, verbatim, both quoted
    ## 7. Blocked or refused calls

Section 3 is the deliverable, not a formality: it is the enumeration, and the
three cases above are its floor. Section 4 may honestly be empty — but it is
empty only after you have held every state in section 3 against the sentence, and
say that is what you did.

Section 6 exists because the two must not be confusable by a reader in a hurry.
Quote both lines and let them be compared.
