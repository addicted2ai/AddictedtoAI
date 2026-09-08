# Stage 0, packet A — ROUND 6. One arm, one declaration, one table. Small.

You are the AUTHOR. Same worktree, same branch, a sixth commit on top.

    D:/addictedtoai-worktrees/fleet6-stage0-A      branch stage0/a-gates-launch

Rounds so far: `f9bf386`, `46865e7`, `317832b`, `ad087aa`, `dc62d39`. Your
round-5 report is at `<worktree>/RESULT.md`; the five verdicts are `REVIEW.md`,
`REVIEW2.md`, `REVIEW3.md`, `REVIEW4.md`, `REVIEW5.md`. All are yours to read.
**Overwrite `RESULT.md`.**

**THIS IS A SMALL ROUND: roughly one new test arm, a declaration section, and a
table. It is not a redesign, and nothing round 5 did is being undone.**

## READ THIS FIRST: THE RULE YOU WERE GIVEN LAST ROUND WAS UNSATISFIABLE

Round 5 was told that **every** injected dependency must have an arm taking the
production default. You implemented that for `floorSet` and `isCurrent`, proved
both by mutation, and enumerated all nine seams in your report — which was the
right response and is what made the rest of this findable.

**The rule itself was wrong.** `root` and `spawn` have production defaults that
ARE a real repository and a live `npm run build`, so an arm taking those defaults
cannot exist in a unit test. **The change's architect has recorded that as its own
defect**, not yours, and amended the task. You are not being asked to fix a
mistake of your own here.

**What round 5's sealed reviewer did find, and I verified every one myself:**

    now      = Date.now              -> () => 0            tests=12 fail=0  GREEN
    localNow = () => new Date()      -> () => new Date(0)  tests=12 fail=0  GREEN
    write    = out                   -> () => {}           tests=12 fail=0  GREEN
    report   = record                -> () => null         tests=12 fail=0  GREEN

All four production defaults can be replaced and nothing goes red.

## YOUR AUTHORITY — read it yourself, from the frozen blob

Tasks 1-4 and the loop delta's floor and reuse bullets are **frozen at commit
`658625d`** for this run. Your worktree's `openspec/` is OLD — **do not use it.**

    git -C D:/AddictedtoAI show 658625d:openspec/changes/two-desks-work-orders-and-trains/tasks.md
    git -C D:/AddictedtoAI show 658625d:openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md

**Never write anything under `D:/AddictedtoAI`** — shared checkout, live work.

**A task is a hypothesis; the requirement is the standard. If this brief
contradicts the requirement, this brief is the defect** — report it and do the
right thing. Reviewers have found real defects in my briefs in three of five
rounds, so treat that as live rather than boilerplate.

## THE WORK — TASK 4(ii) AS AMENDED, QUOTED VERBATIM FROM `658625d`

My commentary is below the quote and marked as mine. **Where the two differ, the
quote governs.**

> (ii) **Every injected dependency that carries a DECISION
> has at least one arm that takes the PRODUCTION DEFAULT, and every other
> injected dependency is DECLARED in RESULT.md with the reason it is not
> armed** — a declared exemption is fine; a claimed coverage that mutation
> refutes is not, and that distinction is the whole finding. The
> decision-carrying seams of `checkBuild` are `floorSet` (called without one
> it must apply the repository build floor: observe the floor failure on a
> below-floor spawn, or assert the reported `floorMs` equals
> `GATE_FLOORS.build.floorMs`), `isCurrent` (without one it must use
> `hasCurrentBuild`), and **`now`**, the clock whose difference the floor is
> compared against: a default-clock arm asserts an observed positive
> duration reaches the floor comparison, because a constant clock computes
> the floor decision on a fabricated number, the exact failure the floors
> exist to catch, unmeasured, in the packet built to measure it. The rest
> are declared, not armed: `root` and `spawn`, whose defaults are a real
> repository and a live `npm run build` (forbidden in a unit test by the
> sealed limits and the machine-wide build lock — the rule's first draft
> said "every injected dependency" and was unsatisfiable as written, the
> architect's defect, found by round 5's sealed reviewer); `write`,
> `report` and `localNow`, output and record-timestamp seams.

> **mutation H**: replace `now` with a constant and confirm the
> default-clock arm fails.

**My commentary, which is not the standard.** `floorSet` and `isCurrent` are
already armed and proved — leave them alone. The new work is:

1. **ONE ARM for `now`.** Call `checkBuild` WITHOUT an injected clock, on a path
   that reaches the floor comparison, and assert the observed duration is a
   positive number that actually reached that comparison. **Mutation H is the
   acceptance**: replace `now = Date.now` with a constant and this arm must go
   red. I ran that mutation on the current tree and it is GREEN, so if it is
   still green after your change, the arm does not measure what it names — and
   that is the finding to report, not a mutation to abandon.

   The trap here is real and it is the one this whole packet keeps hitting: an
   arm that injects its own clock and asserts arithmetic on it proves the
   injection works. The property is what happens when NOBODY passes a clock.

2. **THE DECLARATION.** In `RESULT.md`, a section naming every injected
   dependency of `checkBuild` that is NOT armed, with the reason. The task names
   the five and their reasons; state them in your own words and add any seam the
   task's list misses — the signature is the authority on what the seams are, not
   the task's enumeration of them. If you find a seam the task did not list, that
   is a finding worth having.

## THE MUTATION TABLE — REQUIRED THIS ROUND, ONE ROUND EARLY

The Stage 0 preamble at `658625d` requires this from packet B1 onward. It is
being asked of this round because the round is four lines long and it is the
first live test of whether the table is worth its cost. `RESULT.md` carries it
under this exact heading:

    ## MUTATION TABLE
    Every line this round changed is either a ROW below or listed under
    NON-BEHAVIOURAL with a reason. A changed line that is neither is an
    incomplete table, not a tidy one.

    | # | file:line | the mutation | the arm that must go red | red run: exit + the failing assertion | restored (hash) |
    |---|-----------|--------------|--------------------------|----------------------------------------|-----------------|

    NON-BEHAVIOURAL (no mutation possible; say why):
    - <file:line> — <why no mutation can distinguish this line>

**Four ways this table can be as vacuous as the tests it exists to fix:**

1. **A ROW THAT WAS NEVER RUN** is the same defect wearing a table's clothes.
   Each row records the RED RUN'S ACTUAL OUTPUT — exit code and the failing
   assertion's text — not a claim that it would fail.
2. **YOU PICK THE MUTATION, SO YOU WILL PICK AN EASY ONE.** For `if (a && b)`,
   mutating to `if (false)` is caught by any arm that ever ran; `if (a)` is the
   near-miss a competent author actually writes by mistake. **The bar: a mistake
   a competent author could plausibly have made.** Where only an absurd mutation
   is available, that is itself a finding about the arm.
3. **AN INJECTED DEPENDENCY NEEDS AN ARM ON THE PRODUCTION DEFAULT** — an arm
   that passes its own stub proves the stub works. That is this round's subject.
4. **COMPLETENESS IS THE HALF THAT ROTS FIRST.** The value is not the rows, it is
   that every changed line is accounted for, so a line with no possible mutation
   is DECLARED rather than merely absent.

## PROOF BY MUTATION IS THE ACCEPTANCE

Run **mutation H** at minimum: apply to production code, run the test, confirm
**RED naming the assertion**, restore, verify **byte-identical by hash** (print
before and after), paste real red and green output, and say how many arms moved.

**When you parse test output, assert the TEST COUNT.** Exit 0 cannot distinguish
"all passed" from "zero tests ran". I made exactly that mistake today in a script
written to verify this packet's own findings.

## SCOPE — the same four files, and this round should touch one or two

    loop/lib/gates.mjs
    loop/tests/gates.test.mjs
    scripts/verify-launch.mjs
    scripts/tests/verify-launch.test.mjs

`package.json` is forbidden. **Production code should not need to change this
round.** If you find that it does, say why in `RESULT.md` — it may be right, but
it is not what the round is for. Anything outside these four files is a **finding
in `RESULT.md`, not an edit.**

## GROUND RULES — these do not come with the repository, so they are here

- **Never use the token `cd`** anywhere in a command, not even in a comment or a
  string: an approval guard matches the token, not the intent. Absolute paths and
  `git -C <dir>`.
- **Keep commands short.** Write a `.mjs` and run it rather than using `node -e`.
- **Prefer Read, Write, Edit, Grep and Glob** over `cat`, `sed`, `echo >`,
  `grep`, `find`.
- **Multi-line prose to any CLI goes through a file**, never a command line.
- **A blocked tool call is reported, not routed around.**
- **Never print or manipulate a credential**, even partially.
- **Every date you write is this machine's LOCAL date**, from
  `node -p "new Date().toLocaleString('sv-SE')"`, not from elapsed-time sense.
- **Nothing under `loop/`, `lib/`, `pulse/`, `scripts/`, `app/` or `tools/` may
  name a model, provider, harness or runner id**, including in a comment, a string
  or a test name, and nothing there may reference an `openspec/changes/<name>/`
  path. Cite evidence files by BASENAME.
- **Do not run `npm run build`, and never run two builds at once.** The build lock
  is machine-wide and other work is live on this machine.
- **While iterating run the single test file** with `node --test <absolute path>`.
  Run the full `npm --prefix <worktree> test` **once, at the end**.
- **Never `git worktree remove`** and never delete a `node_modules`: a forced
  removal follows the junction and once deleted 177 packages from the real one.
- **No `git push`, no `git merge`, no `gh`.**
- **DO NOT RUN `bd close`, AND DO NOT RUN `bd update` ON ANY BEAD, EVER.** This is
  here because the opposite instruction is already in your context and is not
  addressed to you: a hook injects `bd prime`, whose "SESSION CLOSE PROTOCOL" says
  in capitals that before saying "done" you MUST `bd close` the issue. That is
  written for an agent that owns a task end to end. You do not — your work goes to
  a sealed reviewer and then to an architect who merges it, and nothing closes on
  your say. Measured 2026-09-07: an agent here followed that protocol and closed
  its own bead 22 seconds after committing, unmerged and unreviewed. `bd create`
  for something you find and cannot fix is welcome; closing and updating are not
  yours.

## COMMIT

A sixth commit on `stage0/a-gates-launch`, permitted files only. End with:

    Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
    Claude-Session: https://claude.ai/code/session_01Xk6K1DZ2qvXaL72jvBc1w5

## RESULT.md — overwrite `<worktree>/RESULT.md`, uncommitted

First line exactly one of: `done`, `blocked: <why>`, `capacity`.

Then:

- **the `now` default-clock arm** — what it asserts, as `file:line`, and
  **mutation H**'s real red output, restoration, before-and-after hash, green
  output, and how many arms moved;
- **the DECLARATION** — every injected dependency of `checkBuild` not armed, with
  its reason, and any seam the task's list missed;
- **the MUTATION TABLE**, in the format above;
- **the full suite** result;
- **anything the frozen task text or this brief got wrong about the tree.**
