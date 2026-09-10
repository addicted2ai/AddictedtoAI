# SEALED REVIEW, ROUND 2 — the suite went from 28 twins to 66. Does it bind now?

authority: two-desks-work-orders-and-trains@a5e873b

You are reviewing a revision. **Report, do not repair.** You work in a disposable
copy and may break anything in it to test it, but a fixed version of the author's
file is thrown away with the directory. The only thing that survives you is
`REVIEW1.md`, so a defect you quietly corrected instead of writing down is a
defect that ships.

## What happened in round 1, because it is the reason you exist

Round 1 shipped a linter with **28 tests: a passing vehicle and a failing twin
for every check.** It looked complete. A reviewer with edit rights on a
disposable copy then applied mutations to the linter and found **six checks the
suite did not bind at all** — each twin exercised *part* of its check and left
the rest free, so the check could be broken while the suite stayed 28/28 green.

**A twin proves a check CAN fire. Only a mutation proves it MUST.** That is the
bar here, and round 1 passed the weaker one.

Round 1 also argued that two unexercised branches were covered by shared logic
proven elsewhere. **That argument was wrong** — the branches shared a sub-test,
not their logic — and the reviewer called it *"convenient, not sound"*. Keep that
in mind for question 3.

## What has changed

The suite is now **66 tests**. The linter itself is **byte-identical to round
1** — the revision was test-only, and that has been verified by digest, so do not
spend time re-diffing it.

The six mutations that defeated round 1 have been **independently confirmed to
turn the suite red**, by the coordinator, applying each one to the author's file
and restoring by hash between. **You do not need to re-prove those six.** They
are settled; re-running them is the least valuable thing you could do here.

## The three questions, in order of what they are worth

### 1. WHAT DOES THE 66-TEST SUITE STILL PASS ON?

**This is the question.** Round 1's suite survived six mutations. Find the ones
this suite survives.

The property under review is that **every check in the linter is enforced by at
least one fixture whose colour changes when that check is broken.** Nothing in
this brief tells you which fixture binds which check — **find that mapping
yourself** from the two files, and report where no fixture binds a check at all.

Work down the linter check by check and ask, for each sub-expression: *is there a
fixture whose colour changes when I break this?* Kinds of break that found gaps
last round and are worth trying again:

- an alternation with one arm removed (the edit-verb list, the `class` / `every
  ... in this file` pair, the `never|token` exemption)
- a flag dropped — case-insensitivity, multiline, global
- a threshold moved by one in either direction
- a conjunction reduced to one of its terms
- a boundary guard deleted, so a match spreads
- a filter deleted, so something that should be ignored is now collected
- a loop that stops after its first item instead of checking all of them

Apply each mutation to your copy, run `node --test` on
`scripts/brief-lint.test.mjs`, and report what happened. **Keep an untouched copy
under the OS temp directory and restore from it between mutations**, and say
whether the suite was green again after each restore — a result from an
un-restored file is two mutations reported as one.

Report both kinds of outcome. A mutation the suite catches tells me a check is
genuinely bound; a mutation it misses is the finding.

### 2. IS EACH NEW TWIN A CONTROL FOR THE PROPERTY IT NAMES?

Thirty-eight twins were added. For a sample of them — you will not get through
all thirty-eight, so choose the ones whose names promise the most — check that
the fixture goes its colour **because of the check it names**, not because it
happens to trip a different one. A twin that fails for the wrong reason is a test
that will stay green when its own check is deleted, which is the round-1 defect
wearing a new fixture.

Two specific ones to look at, because they are the most likely to be subtly
wrong:

- **`scope: cited path without verb stays green`.** The author's own note says
  this binds the cited-path removal, and that without the removal *"the word
  `changes` inside the path reads as a verb"*. Verify that reasoning — it depends
  on a path containing a word that is also in the edit-verb list, which is a
  coincidence of this particular path.
- **`check 6: embedded letters stay green`.** It relies on the word `anecdote`
  containing the guarded two-letter sequence between alphanumerics. Confirm the
  boundary guard is what makes it green, and not something else.

### 3. ARE THE FOUR "COULD NOT BIND" CLAIMS HONEST OR CONVENIENT?

`RESULT2.md` section 6 names four checks it says cannot be bound by a fixture in
this tree without contrivance:

1. authority **prefix versus full equality** — no same-prefix-different-sha pair
   exists to cite
2. the pointer **six-line window** and the **`git `-prefix exclusion** — both
   buildable, deliberately deferred
3. quotes **`blob.length > 0`** versus the missing-task-file case
4. files **`n > 0`** — a scope block with zero bullets

**Round 1 made exactly this kind of claim and it did not survive contact.** For
each of the four, decide: is this a real limit of the tree, or a fixture that was
simply not built? Say which, and for any you think is buildable, describe the
vehicle precisely enough that someone else can build it.

Note the asymmetry the author draws and judge whether it is sound: it declined to
invent a sha collision on the grounds that **"inventing a collision would
manufacture the domain that would make the claim true"**. That is either a good
principle or an excuse, and the difference matters beyond this file.

## Also worth a moment

- The author reports that the two mutations round 1 *did* catch are still caught.
  Confirmed independently. Not your job.
- **Do not spell the guarded two-letter token.** The test assembles it at runtime
  from character codes and the reports match on the tail `outside a prohibition
  line`. Follow that method: neither your report nor any file you touch may spell
  it.
- `node_modules` is deliberately absent and no dependency is needed. **Do not run
  `npm install`, `npm test`, the build, any `verify-*` script, the Pulse or the
  Desk.** `node --test` on the test file, and direct `node scripts/brief-lint.mjs`
  runs, are exactly right.

## Files

Everything in this disposable copy is yours to modify; only the first is a
product, and only the first outlives the directory.

- `REVIEW1.md` — (new) your verdict and findings; the one file that survives
- `scripts/brief-lint.mjs` — the linter; unchanged since round 1, and the thing
  you mutate
- `scripts/brief-lint.test.mjs` — the 66-test suite under review
- `RESULT2.md` — the author's report for this round, whose claims you are testing
- `RESULT1.md` — round 1's report, for context on what was already argued

Scratch copies for restoring after a mutation go under the OS temp directory.

## Ground rules (non-negotiable, and they do not carry over from anywhere)

- **Never use the token `cd` anywhere** — not in a command, not in a comment, not
  as a shell function name. A guard matches the token, not the intent. Absolute
  paths, and `git -C <dir>` for git.
- Keep command strings short; write a `.mjs` under the temp directory and run it
  rather than `node -e`.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you use as evidence.** No `| head`, no
  `| tail`, no `-First N` on a counting or enumerating command — an exit code
  read through a pipe has been wrong twice on this project today, and the file
  you are reviewing exists to mechanise findings of exactly that class.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `REVIEW1.md`

    # WISDOM PHASE 0 ROUND 2 — REVIEW1

    ## VERDICT
    approve | revise | reject     (one word, on its own line, first)

    ## 1. What this suite still passes on
    (every mutation attempted, caught or missed, with the counts; for each miss,
     the twin that should have caught it)
    ## 2. Twins that do not control their own property
    ## 3. The four "could not bind" claims — real limit or unbuilt fixture
    ## 4. Findings, each with file and line
    ## 5. What I could not determine
    ## 6. Blocked or refused calls

**`approve` is a real outcome here and I am not fishing for a second revision.**
Round 1's suite was defeated six times; if this one holds up under a genuine
attempt to defeat it, that is the result and it is worth recording as such. But
section 1 must list what you actually tried — an approval whose section 1 is thin
will be read as a review that did not happen.
