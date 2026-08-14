# Reviewing a round

Read by every session dispatched to review another round's work. The reviewer did
not write the code and is not there to bless it. It is there to find what is wrong.

The orchestrator writes the specifics — which pull request, which claims to attack.
This file carries the parts that are the same every time, and that have each cost a
session when they were left to a brief to remember.

## The artifact you must produce

Create `docket/reviews/<SHA>.md`, where `<SHA>` is the **full 40-character sha** of
the commit you reviewed, and use it as the filename.

**All four header fields are required.** `scripts/check-review-artifact.mjs` treats a
file missing any of them as a *failure*, not as an absence — so an incomplete
artifact fails the gate for the whole branch, including for a round that was reviewed
properly:

    Commit: <full 40-char sha>
    Verdict: approve
    Reviewer: opencode (deepseek-v4-flash)
    Round: <round number, from the entry you are reviewing>

`Verdict:` is exactly one of `approve`, `request-changes`, `reject`. Below the header,
in prose: the commands you ran, their real output, every concern including the
non-blocking ones, and — separately and explicitly — anything you could not check.

An artifact with no prose is rejected too. A review that verified nothing by running
anything is not a review.

Confirm your own file parses before you push:

    node scripts/check-review-artifact.mjs origin/main

Artifacts from already-merged rounds report as `note` — informational, belonging to
squashed trees, counting for nothing. That is expected and is not your problem. What
you are checking is that *your* file is not listed as a problem.

Then commit only your review file and push:

    git add docket/reviews/<SHA>.md
    git commit -m "review: <what you reviewed>"
    git push

Nothing outside `docket/reviews/` may change after the commit you reviewed. If you
had to modify anything to test it, restore it and confirm `git status` is clean.

This contract lived only in the orchestrator's working notes until 14 August 2026,
when a brief asked for `Commit:` and `Verdict:` alone. The resulting artifact was
unparseable, merged to `main`, and failed the gate for every branch afterwards until
a later round taught the checker to ignore artifacts naming commits that no longer
exist. That is why it is a file in the repository now.

## What you are looking for

> **A claim written from what a change was meant to do, rather than a measurement of
> what it does. Or a universal generalised from a small sample.**

This is the defect class this project rejects rounds for, and nearly every real
finding here has been an instance of it. For each claim in the entry, ask what
command would prove it false, and run that command.

Two questions worth asking of any proof:

- **Does the thing tested have the same shape as the thing that will run?** A harness
  once passed fourteen assertions about killing a process while proving nothing about
  the case that mattered, because its stub's work sat in a different process tree from
  a real round's.
- **Can the test fail?** Break the implementation, watch the specific assertion go
  red, restore it, watch it pass. Show both. A test that cannot fail proves nothing.

A round's own numbers are worth re-running rather than reading. Figures go stale
inside a single branch: a page-size measurement changes when the entry describing it
is edited, and a figure measured against one revision of a script is not true of the
next.

## Verdicts

`approve` means you measured the claims and they hold. It does not mean you found
nothing to say — say the non-blocking things too.

`request-changes` is the normal outcome when the code is sound and the record is not.
A falsified claim in a changelog entry is blocking on its own: the entry is permanent
once merged, and the record is the product. The numbers being true does not save a
sentence that describes them wrongly.

`reject` is for work that should not land in this shape at all.

If the corrections you asked for come back done, approve them. A correction round that
fixed what was asked and introduced nothing new is an approval — do not go looking for
a further finding to keep a streak alive.

## Do not

- Do not merge, and do not arm auto-merge.
- Do not fix the code. Report the defect; the author fixes it. A reviewer who edits
  the work is no longer an independent check on it.
- Do not edit the changelog, the docket, or any existing review file — including one
  that requested changes. Its verdict stands as the record of what was found. You add
  to the record; you do not revise it.
- Do not create, read, or search for a credential.

## Hazards that end a session instantly

Each of these has killed at least one session on this machine. None of them produces
an error you can catch or recover from: the session simply ends, and any uncommitted
work is lost. **Commit as you go.**

- **Never `cd` anywhere, and never create a scratch directory inside the repository.**
  The permission layer reads a working directory outside the project as leaving it
  (`permission requested: external_directory (D:\*); auto-rejecting`) and ends the
  session. Run every command from the repository root. To read a file at another ref
  use `git show <ref>:<path>` — never a checkout, which also drags uncommitted work
  with it. Put temporary files under `C:/Users/BadBitch/AppData/Local/Temp/opencode/`.
- **Never touch any path beginning with `/proc`** — not `/proc/<pid>/winpid`, not
  `ls /proc/`, not `cat /proc/version`. The permission layer resolves it against the
  working directory's drive, asks for `D:\proc\*`, and auto-rejects. This killed two
  sessions in a row on 14 August.
- **Never background a process bare.** `cmd &` inherits the tool's stdout, and both
  command substitution and the tool's reader wait for EOF on that pipe — which a
  long-running background process never closes. The call then hangs forever even
  though every statement finished. Always redirect:
  `cmd > /tmp/opencode/x.log 2>&1 &`. Never background inside `$( )`.
- **Never call `process.exit()`** in a `node -e` probe. Calling it while async handles
  are still closing aborts with a libuv assertion and takes the session with it.
- **Never kill a process by name or command-line pattern.** Such a query matches your
  own process — a marker-matching PowerShell query returns two results until it
  excludes `$PID`. A session killed the maintainer's OpenCode server this way, by
  walking a process tree into its own ancestry, and ended itself.
- Kill orphaned listeners on ports 3000 and 8101 before starting, and leave none
  behind. A stale server on 8101 once deadlocked a session under `spawnSync` for 94
  minutes; it returned the instant that server was killed.
