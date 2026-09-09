authority: two-desks-work-orders-and-trains@d75275c

# Two enforcement gaps, both of the same class

You are the AUTHOR. Work only in the worktree you were started in — its path is
your working directory. Never write anything under `D:/AddictedtoAI`, which is a
shared live checkout.

Read the authority read-only from that shared checkout:

    git -C D:/AddictedtoAI show d75275c:openspec/changes/two-desks-work-orders-and-trains/tasks.md

Your subject is **task 22's two ENFORCEMENT items** — the bullet beginning
"Added 2026-09-08 from B1 round 3's sealed review" through "an allow-list wider
than its reason is an expectation file whose unlisted case is permitted but
unguarded". **Task 22's `enabled: false` half is NOT in scope and must not be
touched.**

## THE CLASS BOTH ITEMS SHARE

A check that passes on ABSENCE, and a permission wider than the reason given for
it. In the task's words:

> widening a scan that
> cannot tell "found nothing" from "read nothing" widens what it claims
> without widening what it can catch.

and

> an allow-list wider than its reason is an
> expectation file whose unlisted case is permitted but unguarded.

## ITEM 1 — `loop/tests/portability.test.mjs`

The runner-id scan's targets are `loop/`, `pulse/`, `scripts/` and
`data/config.json`. `lib/`, `app/` and `tools/` are in neither of the file's two
scans, and a runner id has no legitimate reason to appear under any of them.
Separately, both scans assert `deepEqual(scan(targets, …), [])` with nothing
asserting that `targets` is non-empty — they pass on absence and would pass
identically if `filesUnder` returned nothing.

The task requires three parts:

> extend the runner-id targets to `lib/`, `app/`
> and `tools/`; plant a fixture id under EACH of the three roots and
> require the arm to go red for each, named as mutations; and assert a
> floor on the number of files actually scanned in BOTH tests

**DO NOT WIDEN THE MODEL/PROVIDER/HARNESS-NAME SCAN.** Its narrowing over
`pulse/` and `scripts/` is DELIBERATE and recorded at `:115-123`, and `lib/` and
`app/` name models as subject matter — the same false positive at scale. Only the
RUNNER-ID scan's targets change. The floor applies to BOTH scans.

## ITEM 2 — `scripts/no-change-dir-refs.test.mjs`

Its allow-list at `:33-47` grants per FILE with a blanket `match: CHANGE_DIR`, so
any change-directory reference anywhere in an allowed file passes — including the
named, pre-archive path `openspec/changes/build-initial-site/specs/<cap>/spec.md`
in `loop/lib/specs.mjs`'s comment at `:23`. Each stated reason justifies GENERIC
path construction over every in-flight change, not a named one.

The task requires three parts:

> narrow each allow-list entry to the generic form its reason
> describes (a template or `join` over a variable change name), so a
> literal `openspec/changes/<name>/` in an allowed file fails; reword the
> `:23` comment to the archive form, which is what a document that must
> name the change writes; and plant a named path in an allow-listed
> fixture file and require the test red, named as a mutation.

The archive form is `openspec/changes/archive/<YYYY-MM-DD>-<name>/...`.

## WHAT "REQUIRE IT RED" MEANS, AND IT IS THE POINT OF BOTH ITEMS

For every planted fixture and every floor you add: **apply the mutation, watch
the check go RED with its real output, restore, and prove the restoration
byte-identical by SHA-256.** A check you have not seen fail proves your own
mental model, not the code. There are five such proofs owed: one planted runner
id under each of `lib/`, `app/` and `tools/`; the files-scanned floor going red
when a targets list is emptied; and a planted named change path in an
allow-listed fixture file.

**Every legitimate existing use must stay green.** The narrowing must not break
the generic path construction the allowed files actually do.

## FILES YOU MAY CHANGE

    loop/tests/portability.test.mjs
    scripts/no-change-dir-refs.test.mjs
    loop/lib/specs.mjs        (the `:23` comment ONLY)

Nothing else. No new test file. `package.json` untouched.

## WHAT TO RUN

On the live tree, targeted only, by absolute path:

    node --test <worktree>/loop/tests/portability.test.mjs
    node --test <worktree>/scripts/no-change-dir-refs.test.mjs

**DO NOT run the full `npm test`, `npm run build`, any `verify-*` script, or the
Pulse.** That is the merge step's, once, later.

**Assert the TEST COUNT in everything you report.** Exit 0 cannot distinguish
"all passed" from "zero tests ran", and node's default reporter prints `✖`, not
`not ok`, so a TAP-shaped grep silently returns nothing — use
`--test-reporter=tap`, or check that your parsed failure count equals the
reported `fail` count.

## WHAT TO WRITE — `RESULT.md` in your worktree

- What you changed, by file and line.
- Each of the five red proofs: the mutation, its REAL output with counts, the
  restoration, the SHA-256 before and after.
- The clean runs of both test files with their counts.
- Anything you could not do, and why.

## HARD RULES

- Never use the token `cd` in a command, including in a comment. Absolute paths
  and `git -C <dir>`.
- Prefer reading and writing files directly over shell equivalents. Keep commands
  short; write a `.mjs` and run it rather than using `node -e`.
- **NEVER `git worktree remove`** and never delete a `node_modules`: a forced
  removal follows the junction and once deleted 177 packages.
- A blocked or refused command is REPORTED, not routed around, and never retried
  into a lock.
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
  goes to a sealed reviewer and nothing closes on your say. MEASURED 2026-09-07:
  an agent here followed it and closed its own bead 22 seconds after committing,
  unmerged and unreviewed. `bd create` is welcome; closing is not.
- No `git push`, `git merge`, or `gh`. Commit to your branch only.

Trailer:

    Claude-Session: https://claude.ai/code/session_01Xk6K1DZ2qvXaL72jvBc1w5
