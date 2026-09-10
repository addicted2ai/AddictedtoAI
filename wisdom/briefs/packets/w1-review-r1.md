# SEALED REVIEW — WISDOM PHASE 0: the brief linter becomes a repository file

authority: two-desks-work-orders-and-trains@a5e873b

You are reviewing an author's work. **Report, do not repair.** You are working in
a disposable copy and you may break anything in it in order to test it — but a
fixed version of the author's file is not a product here and will be thrown away
with the directory. The only thing that survives you is `REVIEW1.md`, so a defect
you quietly corrected instead of writing down is a defect that ships.

## What was asked of the author

An instrument that has been refusing this project's own draft briefs for two days
lived only in a session scratchpad, where it dies when a terminal closes. The job
was to move it into the repository as `scripts/brief-lint.mjs`, change **exactly
two** things in the move — the repository root and the change name stop being
hard-coded — and write `scripts/brief-lint.test.mjs` giving **every check a
negative control**: a passing fixture and a minimally-different failing twin that
must be observed going red.

The property that makes this host real is **self-enrolment**: a new `*.test.mjs`
placed under a source directory must reach `npm test`, and therefore the release
gates, without anyone registering it anywhere. That property is enforced by the
project's own test runner — **find** which file does it, read how it decides what
to run, and confirm the new file is actually inside that set. Do not take this
paragraph for it; a brief asserting its own enrolment is the shape that has been
wrong here before.

## What you are reviewing, and the one thing to understand about your sandbox

**YOUR WORKING DIRECTORY IS A DISPOSABLE COPY, NOT THE AUTHOR'S WORKTREE.** It is
a detached git worktree at the same commit, with the author's four files copied
in. Nothing you do here reaches the author's work or the repository, and the
whole directory is deleted after your review.

That is deliberate, and it changes what you are able to do: **you may edit,
break, mutate and delete anything in this directory.** A reviewer who can only
describe a mutation is guessing about whether the test would catch it. You can
apply it and watch.

    scripts/brief-lint.mjs        the moved and parameterised linter
    scripts/brief-lint.test.mjs   the test
    RESULT1.md                    the author's own report
    brief-lint.source.mjs         the pre-move original — the only way to check
                                  the move; coordinator scaffolding, not the
                                  author's work and not part of the diff

**One observation is mine and not yours to re-derive**, because your copy cannot
show it: in the author's own worktree, `git status --porcelain` printed exactly
five lines, all untracked, and no modified tracked file:

    ?? .agent-brief.md
    ?? RESULT1.md
    ?? brief-lint.source.mjs
    ?? scripts/brief-lint.mjs
    ?? scripts/brief-lint.test.mjs

So the scope question — did this job touch anything it was not permitted to
touch — is answered, and you should spend your time on the three questions
below instead.

## The three questions, in order of what they are worth

### 1. IS THE MOVE HONEST?

The author asserts that only the two declared parameterisations changed and that
every check, message and comment is otherwise byte-identical. **Check it against
`brief-lint.source.mjs` yourself.** The comments in that file are the most
valuable thing in it — several of them record a defect the check they sit above
used to have, and two of them state a limit the check knowingly has. A limit a
check states about itself is not a defect to fix silently, and a comment quietly
dropped in a move is unrecoverable.

A behaviour change hidden inside a move is the hardest kind of change to review,
and this file's whole value is that its behaviour was known before it moved.

### 2. WHAT WOULD THIS TEST STILL PASS ON?

**This is the question the review exists for, and a green suite does not answer
it.** The suite reports 28 passing. That tells you the assertions held. It does
not tell you the assertions bind.

So: **find a way to break `scripts/brief-lint.mjs` that this test does not
notice.** Apply the mutation to your copy, run `node --test` on
`scripts/brief-lint.test.mjs`, and report what happened. A mutation the suite
does not catch is the most valuable finding you can return; a mutation it does
catch is worth reporting too, because it tells me which checks are genuinely
bound.

Restore the file between mutations — the cheapest way is to keep an untouched
copy under the OS temp directory and copy it back — and say in your report
whether the suite was green again after each restore. A mutation result from an
un-restored file is two mutations reported as one.

Kinds of break worth trying against the text before you conclude there are none:

- a check made **constant** rather than deleted — always passing, never absent
- a check whose **refusal path** still runs but whose exit status stops carrying
- a check narrowed so it still refuses the fixture and stops refusing the real
  shape the fixture stands for
- a fixture that passes for a reason **other than the property named** — the
  twin differs minimally, but does the difference exercise the check, or
  something adjacent to it?

If you find none, say so plainly and say what you tried. "I could not break it"
after four named attempts is a finding. "It looks thorough" is not.

### 3. IS EACH NEGATIVE CONTROL A CONTROL FOR THE PROPERTY IT CLAIMS?

For each row of the author's table in `RESULT1.md` section 2, the failing twin
must go red **because of the check it names**, not because it happens to trip a
different check. A twin that fails for the wrong reason is a test that will stay
green when its own check is deleted.

The ninth check's fixture deserves separate attention because it was
non-negotiable in the job. That check requires every `git show <sha>:<path>`
pointer in a brief to resolve **and** to hold the phrases the sentences around it
quote. Its negative control was **found in the wild**: a brief that had already
been dispatched pointed its reader at a delta file that did not contain the
requirement it named — the blob existed, the command ran, and it printed
seventeen other requirements.

The surviving wild fixture is the banked file
`openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/stage0-packet-C1/round1-agent-brief.md`.
Two things to check about how the test uses it, and both are the kind of thing
that decays silently:

- the test must read the **banked, committed** file, not a reconstruction of it.
  A reconstructed fixture is indistinguishable from a recorded one after it is
  written, and the entire value of this one is that it is what actually went out.
- the second broken brief **is lost** — it was regenerated over before it could
  be banked and survives only as quotation inside the review that refused it.
  The job forbade inventing a second and presenting it as wild. If the test
  contains a second fixture labelled or implied as wild, that is a finding.

## Also worth your attention, briefly

- The author reports two branches it could not give a separate negative control
  and argues both share logic already proven red elsewhere (`RESULT1.md`
  section 5). **Decide whether that argument is sound or convenient.** Shared
  logic proven elsewhere is a real argument; it is also the easiest place to hide
  a branch nobody exercised.
- The linter takes the change name from the brief under test. Ask what happens
  for a brief with **no** authority line, and for one naming a change directory
  that does not exist. The author says the second refuses with the path named
  rather than skipping. Verify that, because a silent skip here would make the
  whole quotes check vacuous for any brief that misspells its change.
- The test builds fixtures under the OS temp directory. Confirm no fixture is
  written into the repository and no directory is left behind.
- `node_modules` is deliberately absent from this working directory and the
  design needs no dependency. **Do not run `npm install`, `npm test`, the build,
  any `verify-*` script, the Pulse or the Desk.** `node --test` on the author's
  file, and direct `node scripts/brief-lint.mjs` runs, are exactly right.

## Files

Everything in this disposable copy is yours to modify; only the first is a
product, and only the first is read by anyone after you finish.

- `REVIEW1.md` — (new) your verdict and findings; the one file that outlives this
  directory
- `scripts/brief-lint.mjs` — the moved linter under review; read it whole, and
  mutate it as question 2 requires
- `scripts/brief-lint.test.mjs` — the test under review, and the main subject of
  question 2
- `RESULT1.md` — the author's own report, whose claims you are checking
- `brief-lint.source.mjs` — the pre-move original; the only way to check that the
  move was honest

Do not reach outside this directory to write anything. Scratch copies for
restoring after a mutation go under the OS temp directory.

## Ground rules (non-negotiable, and they do not carry over from anywhere)

- **Never use the token `cd` anywhere** — not in a command, not in a comment, not
  as a shell function name. A guard matches the token, not the intent. Absolute
  paths, and `git -C <dir>` for git.
- Keep command strings short; write a `.mjs` under the temp directory and run it
  rather than `node -e`.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you use as evidence.** No `| head`, no
  `| tail`, no `-First N` on a counting or enumerating command. Truncated output
  cannot be told apart from complete output — and the file you are reviewing
  exists to mechanise findings of exactly that class, so producing one here would
  be particularly poor.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `REVIEW1.md`

Write it in the working directory, with this shape:

    # WISDOM PHASE 0 — REVIEW1

    ## VERDICT
    approve | revise | reject     (one word, on its own line, first)

    ## 1. The move — what I diffed and what I found
    ## 2. What this test would still pass on
    (every mutation attempted, whether the suite caught it, and for each miss the
     test that should have caught it)
    ## 3. Negative controls that do not control their own property
    ## 4. The ninth check's wild fixture
    ## 5. Findings, each with file and line
    ## 6. What I could not determine
    ## 7. Blocked or refused calls

`revise` is a normal outcome and is worth more to me than an approval that found
nothing. If you approve, section 2 must still list what you tried — an approval
whose section 2 is empty will be read as a review that did not happen.
