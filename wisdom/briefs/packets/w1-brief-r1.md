# WISDOM PHASE 0 — commit the host. `scripts/brief-lint.mjs`, with a negative control per check.

authority: two-desks-work-orders-and-trains@a5e873b

You are implementing ONE thing: moving an existing, working linter out of a
session scratchpad and into the repository, where it survives the session and
runs in `npm test`.

## Why this is first, and why it is not a finding

The project has just distilled two and a half days of five sessions into an
analysis of how lessons get relearned. The conclusion that governs the work: of
the load-bearing lessons relearned in that window, **seven were recorded AND in
the session's context and still did not fire.** Writing things down is the remedy
for the rarest case. Only mechanism fires.

So the plan is to convert findings into checks that refuse. **But a second model
reading the proposal found that two of the four hosts it named DO NOT EXIST IN
THE REPOSITORY** — and that was verified independently:
`git ls-files | grep -i 'brief.*lint'` returns nothing, and every `brief-review`
hit under `openspec/` is banked EVIDENCE of a review that happened, not an
executable.

**The most productive instrument this project has built recently is not in the
repository and dies when a terminal closes.** It has refused more than eleven of
the architect's own draft briefs; two more on 2026-09-09; and its ninth check
caught a citation that pointed at a file not containing what its sentence named
— with a negative control **found in the wild rather than injected**, which is
the strong form.

Routing findings to a host that does not exist is storage wearing a different
costume. So: commit the host first, with its own proof, before anything is routed
to it.

## The file to move

    brief-lint.source.mjs — a copy placed in your working directory, so you never read outside it

Read it whole before you change one line. It is heavily commented and several
comments record a defect the check itself used to have — those comments are the
most valuable part of the file and **must survive the move verbatim**. In particular
it already documents its own limits (check 3 sees one line at a time and says so;
check 6 was half case-sensitive and says so). A limit a check states about itself
is not a defect to fix silently.

## What must change, and nothing else

1. **The change name must stop being hard-coded.** The linter READS one
   change's task file, and the path to it is a literal inside the script. Take
   the change name from the authority line the brief under test carries, and
   build the task-file path from that name, so the linter serves any unarchived
   change. Nothing under `openspec/` is edited by this job; that tree is
   read-only to you and the linter only ever reads from it. **If the named change
   directory does not exist at that sha, that is a FAIL with the path named** —
   not a silent skip.
2. **The repository root must stop being hard-coded** to an absolute path. Derive
   it from the script's own location.
3. Everything else — every check, every message, every comment — moves unchanged.

**Do not add a check. Do not remove a check. Do not "improve" a message.** This
job is a move plus two parameterisations. A behaviour change hidden inside a move
is the hardest kind of change to review, and this file's whole value is that its
behaviour is known.

## THE TEST IS THE POINT OF THIS JOB

`scripts/brief-lint.test.mjs`, and it is not optional decoration:
`scripts/run-tests.mjs` walks `['app', 'lib', 'loop', 'pulse', 'scripts',
'tests']`, so this file is automatically in `npm test` and therefore in the
release gates. That is what makes the host real.

**EVERY CHECK GETS A NEGATIVE CONTROL — a fixture that must make it go RED.** The
standing bar on this project, and it is not a slogan: **a check that has never
been seen refuse something is not yet a check.**

So for each check the linter has, write two fixtures: one brief that **passes**
it and one minimally-different brief that **fails** it, and assert the exit code
and the failing check's name. A test that only asserts the passing case is
exactly the "artifact that cannot fail" this whole exercise exists to eliminate,
and it would be the funniest possible place to put one.

**THERE IS NO `node_modules` IN YOUR WORKING DIRECTORY, AND THAT IS CORRECT.**
The linter imports only Node built-ins (`node:fs`, `node:child_process`) and your
test needs only built-ins too (`node:test`, `node:assert`, `node:fs`, `node:os`,
`node:path`). `node --test <absolute path>` on your own file runs fine without
dependencies. **Do not run `npm install`, do not run `npm test`, and do not add a
dependency.** If you find yourself wanting one, the design is wrong and you
should say so in your report instead.

Build the fixtures as **files under the OS temp directory** — `node:os`'s
`tmpdir()`, a fresh directory per test, cleaned up after. Every other test in
this repository does this and none of them touch the working tree. **Do not write
a fixture into the repository.**

**AND ONE FIXTURE IS NOT OPTIONAL AND IS NOT NEGOTIABLE: THE NINTH CHECK'S WILD
NEGATIVE CONTROL.** That check — every `git show <sha>:<path>` must resolve AND
hold the phrases the sentences around it quote — was added on 2026-09-09 because
two briefs, one of them already dispatched, pointed their reader at a delta file
that did not contain the requirement they named. The blob existed, the command
ran, and it printed seventeen other requirements: a correct answer to a question
nobody asked.

Its negative control was **found in the wild, not injected** — two broken briefs
already existed and the new check refused both, naming the missing phrase in
each. A check whose refusing case survives only in a transcript is a check with
no evidence of ever having refused, and is the one most easily loosened later by
someone who has never seen it fire.

**ONE OF THE TWO IS BANKED AND THE OTHER IS LOST, AND YOU ARE TOLD THAT RATHER
THAN LEFT TO DISCOVER IT.** The surviving one is
`openspec/changes/two-desks-work-orders-and-trains/evidence/reviews/stage0-packet-C1/round1-agent-brief.md`,
whose line 207 carries the wrong pointer, committed and readable. **Use it. Read
it there; do not reconstruct it from this description** — a reconstructed fixture
is indistinguishable from a recorded one after it is written, and the value of
this fixture is that it is what actually went out.

The other was a draft that was regenerated over before it was banked, and it
survives only as quotation inside the review that refused it. That is a real
loss, it is the same class as everything else here, and one wild control is
enough for the test. Do not invent a second and present it as wild; if you want a
second fixture, write an obviously-synthetic one and label it synthetic.

Two more fixtures are harder than the rest and are called out so you do not skip
them:

- the AUTHORITY check needs a real reachable sha; use one from `git log` in the
  test itself rather than a literal, and for the failing case use a sha-shaped
  string that does not resolve.
- the QUOTES check compares against a real `tasks.md` blob; the failing fixture
  is a `>` block with **one word changed**, because a paraphrase is where a
  clause leaves.

## Files

Work only in these; a diff touching any other path is a scope finding.

- `scripts/brief-lint.mjs` — (new) the linter, moved and parameterised
- `scripts/brief-lint.test.mjs` — (new) two fixtures per check, the failing one asserted RED
- `RESULT1.md` — (new) your report, in the repository root

**Do not edit** `package.json` (the runner finds the test by walking, so nothing
needs registering), `runners.yml`, anything under `data/`, `CLAUDE.md`,
`AGENTS.md`, or any file under `openspec/`.

## Ground rules (non-negotiable)

- **Never use the token `cd` anywhere** — not in a command, not in a comment, not
  as a shell function name. A guard matches the token, not the intent. Absolute
  paths, and `git -C <dir>` for git.
- Keep command strings short; write a `.mjs` and run it rather than `node -e`.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you are using as evidence.** No
  `| head`, no `| tail`, no `-First N` on a counting or enumerating command.
  Truncated output is indistinguishable from complete output — and this is one of
  the findings the linter exists to mechanise, so producing it here would be
  especially poor.
- Never run `npm run build`, the whole `npm test`, any `verify-*` script whole,
  the Pulse or the Desk. `node --test <absolute path>` on your own new test file
  is exactly right.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands.

## Your report — `RESULT1.md`

    # WISDOM PHASE 0 — RESULT1

    ## 1. What moved, and what changed in the move
    (the two parameterisations, by line; and the assertion that nothing else changed)
    ## 2. The checks, one row each
    | check | passing fixture | FAILING fixture | red observed |
    ## 3. The test run
    (`node --test` on your own file, counts quoted, not truncated)
    ## 4. Every check seen red — the counts, verbatim
    ## 5. What I could NOT give a negative control, and why
    ## 6. Blocked or refused calls
    ## 7. Where I disagreed with this brief

Section 5 is not a failure. If a check genuinely cannot be made to refuse
something in a fixture, **say so plainly and say why** — that is a finding about
the check, and it is worth more than a fixture contrived until it goes red.
