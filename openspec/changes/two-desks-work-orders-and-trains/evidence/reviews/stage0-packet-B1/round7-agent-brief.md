# Stage 0, packet B1, ROUND 7 — one CLASS, swept across one file

You are the AUTHOR. Work only in:

    D:/addictedtoai-worktrees/fleet6-stage0-B1

Branch `stage0/b1-brief-diet`, currently `8930036`. Merge base `fbe1306`.

**AUTHORITY, frozen at `4d86826`, not in this worktree.** Read read-only from the
shared checkout, and never write under `D:/AddictedtoAI`:

    git -C D:/AddictedtoAI show 4d86826:openspec/changes/two-desks-work-orders-and-trains/tasks.md

## WHY THIS ROUND EXISTS — READ THIS BEFORE THE TASK

Five rounds of this packet each fixed the exact lines a review named, and each
time the same class reappeared on a different line. Round 6 is the sharpest
case: it was sent to fix an assertion that had no failure message, it fixed that
one correctly, **and four lines below it added a new assertion with no failure
message.** The author did exactly what the brief said. **The brief was the
defect: it named lines, so the lines got fixed and the class walked.**

Measured before this brief was written: `brief-excerpt-budget.test.mjs` has
**52 assertion calls — 14 carry a message, 32 carry none, and 6 pass a trailing
VALUE that looks like a message but is not** (e.g. `, ex.text)`, which prints the
whole excerpt and names nothing). **Five rounds of review named three of them.**

**So this round is not a list of lines. It is one class, swept across the whole
file, and you are asked to find every instance yourself.**

## THE CLASS

**An assertion whose failure would print a bare number or an unlabelled value.**
When that arm fails, the reader gets `900 !== 902`, or the entire excerpt dumped
to the terminal, and has to re-run the test to learn what was being compared. A
failure message must make the failure refusable without re-running it.

## WHAT TO CHANGE

1. **Every length, count, cap and `chars` comparison** carries a message stating
   **both numbers** — the value observed and the bound or expectation it was
   compared against. Not one, not a description: both.
2. **The six assertions passing a raw value as the third argument** get a real
   message instead. These are the worst of the three groups, because they LOOK
   like they carry a message and do not.
3. **A MESSAGE MAY ONLY STATE THE NUMBERS ITS OWN ASSERTION COMPARES, AND MUST
   DERIVE THEM FROM THE SAME VALUES THE ASSERTION USES.** Round 6 produced the
   counter-example, at `:357`:

       assert.equal(ex.chars, ex.text.length, `emitted length ${ex.text.length}, cap 24000; chars field mismatch`);

   That assertion compares `ex.chars` with `ex.text.length` and does not use the
   cap at all — but its message announces `cap 24000`, a literal hardcoded
   beside an assertion that never reads it. A `chars` mismatch would print a cap
   as though it were relevant, and the literal can drift from the real cap with
   nothing to catch it: the delta review confirmed that editing `cap 24000` to
   `cap 1` leaves the suite green at `23/23/0`, because a message is only
   rendered when its assertion FAILS.

   **The fix is not to test the message. It is to remove the duplication.**
   State the numbers this assertion actually compares — here, `ex.chars` and
   `ex.text.length` — and take any cap from the same constant or variable the
   cap assertion uses, never a re-typed literal. Apply this everywhere in the
   sweep: **if a number in a message is not one the assertion compares, either
   derive it from the value in scope or take it out.**

4. **Everything else is listed in `RESULT7.md` as deliberately unchanged, with
   one reason each.** A structural assertion whose failure is already legible
   (`assert.match(text, /PENDING AMENDMENT/)`, a heading-order `indexOf`
   comparison, a `deepEqual` on heading arrays) does not need prose bolted onto
   it. **Say so per assertion. A silent omission is indistinguishable from a
   miss, and that is the class this round exists to remove.**

## HOW TO FIND THEM — USE THE INSTRUMENT, THEN CHECK IT

A census script is at:

    C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/d005b682-58b5-4330-b9ab-4eac8f7af78d/scratchpad/f6-B1r7-census.mjs

Run it. It classifies every `assert.*` call into three buckets and **reports an
unsure bucket separately rather than folding it into either side**. It is
APPROXIMATE and says so. **Do not treat its output as the complete list** —
read the file as well, and if you find an instance it missed, say which and why
it missed it. A census that hides its uncertainty is the same defect wearing a
different hat.

Report the before and after counts from that script in `RESULT7.md`.

## NO PRODUCTION CHANGE IS EXPECTED

This is a message-and-diagnostics round. **Every existing assertion must keep
asserting exactly what it asserts now.** If adding a message tempts you to
change what an assertion compares, do not — and if you believe an assertion is
wrong, STOP AND REPORT IT rather than fixing it here.

**Prove that nothing moved:** after the sweep, re-run the four mutations below
and confirm each still reddens, with restoration proved byte-identical by
SHA-256. These are the arms this packet spent four rounds building and they must
not be weakened by a diagnostics pass:

- `loop/lib/specs.mjs`: `const shortfall = 1;`
- `loop/lib/specs.mjs`: `floorMinimumTotal` set to a wrong constant
- `loop/lib/specs.mjs`: `chars: 0`
- `loop/lib/specs.mjs`: the inter-chunk `.join('\n\n---\n\n')` replaced by
  `.join('')`

## FILES YOU MAY CHANGE

    loop/tests/brief-excerpt-budget.test.mjs

Only this one. `loop/tests/portability.test.mjs` is **OUT OF SCOPE** — work on
it is assigned elsewhere and a change to it here would collide. No new test
file; `package.json` untouched; `loop/run.mjs` not in scope. No production
change expected; if one is genuinely required, say so explicitly.

## WHAT TO WRITE — `RESULT7.md`

Not `RESULT.md`, and not `RESULT4/5/6.md`, which are committed.

- The census before and after, from the script, with its unsure bucket.
- Every assertion you changed, by line, and what its message now states.
- **Every assertion you deliberately left alone, by line, with one reason.**
- Any instance the census missed and why.
- The four mutation re-runs: real output, counts, restoration, SHA-256.
- **Assert the TEST COUNT in everything you report.** Exit 0 cannot distinguish
  "all passed" from "zero tests ran", and node's default reporter prints `✖`,
  not `not ok`, so a TAP-shaped grep silently returns nothing — use
  `--test-reporter=tap`, or check that your parsed failure count equals the
  reported `fail` count.
- The full suite, run once at the end, with at least a 600,000 ms timeout.
  **"Once" governs ITERATION, not ATTEMPTS**: a run cut off by a timeout is a
  RE-RUN, not a result. Report `tests`/`pass`/`fail` and the duration.
- **State every number with the tree it came from.** 853 is the live tree's
  floor; 833 is the fixture's three-marker minimum. Neither may be written
  without saying which.

## HARD RULES

- **NEVER `npm run build`, never any `verify-*`, never the Pulse.** The full
  `npm test` runs ONCE, at the end. Targeted work is
  `node --test <absolute path>`.
- Never use the token `cd` in a command, including in a comment. Absolute paths
  and `git -C <dir>`.
- Prefer reading and writing files directly over shell equivalents. Keep commands
  short; write a `.mjs` rather than using `node -e`.
- **NEVER `git worktree remove`** and never delete a `node_modules`: a forced
  removal follows the junction and once deleted 177 packages.
- A blocked or refused command is REPORTED, not routed around, never retried into
  a lock.
- Never manipulate credentials on a command line; never print a secret.
- Dates are this machine's LOCAL date from
  `node -p "new Date().toLocaleString('sv-SE')"`; a DURATION is a subtraction of
  two readings.
- Delete any probe file you create, and say that you did.
- **DO NOT RUN `bd close`, and do not run `bd update` on any bead, ever.** THIS
  IS HERE BECAUSE THE OPPOSITE INSTRUCTION IS ALREADY IN YOUR CONTEXT AND IS NOT
  ADDRESSED TO YOU: a hook injects `bd prime`, whose "SESSION CLOSE PROTOCOL"
  says in capitals that before saying "done" you MUST `bd close` the issue. That
  is written for an agent that owns a task end to end. You do not — your work
  goes to a reviewer and nothing closes on your say. MEASURED 2026-09-07: an
  agent here followed it and closed its own bead 22 seconds after committing,
  unmerged and unreviewed. `bd create` is welcome; closing is not.
- No `git push`, `git merge`, or `gh`. Commit to the branch only.

Trailer:

    Claude-Session: https://claude.ai/code/session_01Xk6K1DZ2qvXaL72jvBc1w5
