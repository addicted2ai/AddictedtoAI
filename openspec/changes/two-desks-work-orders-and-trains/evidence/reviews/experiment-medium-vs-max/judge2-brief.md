# BLIND REVIEW — two implementations of one brief

You are reviewing TWO INDEPENDENT IMPLEMENTATIONS of the same written brief,
labelled **X** and **Y**. You do not know who or what produced either, and you
must not speculate about it — any guess you make about their origin is noise in
your judgement, not evidence.

**You have NO EDIT RIGHTS.** Do not commit, push, or modify any file. Write one
report and nothing else.

## THE BRIEF BOTH IMPLEMENTATIONS WERE GIVEN

It is at:

    C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/d005b682-58b5-4330-b9ab-4eac8f7af78d/scratchpad/f6-exp-brief.md

Read it first, in full. **It is the standard.** Neither implementation's own
report is the standard, and you are not given either one.

## THE TWO DIFFS

Both are against the same base commit `96e15fa`:

    X:  C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/d005b682-58b5-4330-b9ab-4eac8f7af78d/scratchpad/f6-exp-diff-X-judge2.diff
    Y:  C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/d005b682-58b5-4330-b9ab-4eac8f7af78d/scratchpad/f6-exp-diff-Y-judge2.diff

The corresponding working trees, which you may READ but never write:

    X:  D:/addictedtoai-worktrees/fleet6-exp-max
    Y:  D:/addictedtoai-worktrees/fleet6-exp-medium

## HOW TO JUDGE — the standing review rules apply to EACH of them

1. **The brief is the standard.** Judge each implementation against what the
   brief actually requires, not against the other one.
2. **Is any check narrower — or looser — than the property it names? ASK OF
   EVERY THRESHOLD, ASSERTION AND FIXTURE: WHAT WRONG WORLD WOULD THIS STILL
   PASS ON?**
3. **The diff from the base is the list of changed behavioural lines.** For each
   implementation, mutate lines you choose — **at least one per changed
   function** — run the affected tests, and report the arm counts, red and
   restored. **A changed line you can find no arm for is a finding.** Report each
   result whether it goes red or green; a mutation that stays GREEN is the
   finding, not a wasted run.
4. The brief owes five red proofs (a planted runner id under each of `lib/`,
   `app/` and `tools/`; the files-scanned floor red when a targets list is
   emptied; a planted named change path in an allow-listed fixture). **Check
   each one reaches its failing state in each implementation** — a fixture that
   passes without ever reaching the state it names is worth nothing.
5. **Every legitimate existing use must stay green.** A narrowing that breaks
   real generic path construction is a defect, not thoroughness.
6. **When you parse test output, ASSERT THE TEST COUNT.** Exit 0 cannot
   distinguish "all passed" from "zero tests ran", and node's default reporter
   prints `✖`, not `not ok`, so a TAP-shaped grep silently returns nothing —
   use `--test-reporter=tap`, or check that your parsed failure count equals
   the reported `fail` count.

Restore every mutation immediately and prove it byte-identical by SHA-256.

## HARD LIMITS

- **NEVER run `npm run build`, NEVER the full `npm test`, never any
  `verify-*` script or the Pulse.** Targeted `node --test <absolute path>`
  only.
- Never use the token `cd` anywhere in a command, including in a comment.
  Absolute paths and `git -C <dir>`.
- **NEVER `git worktree remove`** and never delete a `node_modules`.
- Never write anything under `D:/AddictedtoAI`.
- A blocked or refused command is REPORTED, not routed around.
- Keep commands short; write a `.mjs` and run it rather than using
  `node -e`. Delete any probe file you create, and say that you did.
- **DO NOT RUN `bd close`, and do not run `bd update` on any bead, ever.**
  THIS IS HERE BECAUSE THE OPPOSITE INSTRUCTION IS ALREADY IN YOUR CONTEXT AND
  IS NOT ADDRESSED TO YOU: a hook injects `bd prime`, whose "SESSION CLOSE
  PROTOCOL" says in capitals that before saying "done" you MUST `bd close` the
  issue. That is written for an agent that owns a task end to end. You do not.
- No `git push`, `git merge`, `git commit`, or `gh`.

## OUTPUT — write to

    C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/d005b682-58b5-4330-b9ab-4eac8f7af78d/scratchpad/f6-exp-JUDGE2.md

Shape:

    # Blind review of X and Y

    ## Findings — X
    (numbered, each naming file and line)

    ## Findings — Y
    (numbered, each naming file and line)

    ## The mutations I ran
    (per implementation: which lines, real output, red or green, restoration and
     hash proof)

    ## The five red proofs
    (per implementation: does each reach its failing state? evidence)

    ## Which better meets the brief
    **State X, Y, or INDISTINGUISHABLE, and why.** If they are equally correct
    and differ only in style, say INDISTINGUISHABLE — that is a real answer and
    the most useful one when it is true. Do not manufacture a preference.

    ## What I ran
    (exact commands and their real output)

Be adversarial about correctness and fair about scope. **Judge the work, not the
labels.**
