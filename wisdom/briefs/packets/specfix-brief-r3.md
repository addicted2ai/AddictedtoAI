# Revision brief — SPEC DELTA CORRECTIONS, round 3

authority: two-desks-work-orders-and-trains@12b4ea3

Round 2 was sealed-reviewed: **REVISE, four blocking**. Three of the four are
consequences of a ruling I gave you that was underspecified, and the fourth is a
ruling I gave you that was **arithmetically wrong**. Your round-2 work is sound
where it was not following me; the sweep in particular found leftover vocabulary
in four requirements I never named, and your refusal to invent a priority band
was right.

## FIRST, THE TWO RULINGS OF MINE THAT WERE WRONG

I am stating these plainly because a brief that quietly re-rules is a brief that
teaches you to distrust the parts that were right.

**(1) F5's unit — you were right and I was wrong, and I have adopted your
version.** I said "the five most recently appended ledger entries for that
runner in that role". Breaker 1 counts per **governing job type** (`:1462`);
"that runner in that role" is the runner-health window's unit (`:2118`), a
different requirement. Your `for jobs of that governing type` stands. Nothing to
change.

**(2) F2's threshold scenario — my ruling was arithmetically false, and the
reviewer is right.** I told you to scope "One real run clears it" to a runner
whose last five include exactly three empty ones. Under a SLIDING window a
producing run **evicts the oldest slot**, so:

    old [producing, producing, empty, empty, empty]  -> 3 of 5 empty, refused
    + producing f, evicting the oldest (producing)
    new [producing, empty, empty, empty, producing]  -> STILL 3 of 5, still refused

"Exactly three empty" is not sufficient; the **evicted slot must itself be
empty**. Fix the WHEN accordingly — the oldest of the five being one of the
empties — so the THEN's "two of the last five remain empty, and the runner is
selectable again" is unconditionally true. Keep the heading, as before.

## WHERE YOU WORK

The same worktree, **`D:/addictedtoai-worktrees/fleet6-specfix`**, round-2 edits
in place. Amend, do not revert.

`openspec validate` is **cwd-relative and there is no path flag**, and the `cd` token is never permitted here — so do not try to "run it against the worktree". Run exactly:

    node C:/Users/BadBitch/AppData/Local/Temp/claude/D--AddictedtoAI/47a211cc-a047-4474-bb53-9cfe0505f2b9/scratchpad/arch-validate-wt.mjs

It spawns validate with `{ cwd: <the worktree> }`, which is the mechanism the
ground rules prescribe for a command that needs a working directory. Previous
briefs told you to run the bare command "against your worktree" without saying
how, which left you to guess; that was my defect and it is fixed here.

**READ FROM THE INSTALLED CLI (v1.11.0), so you do not have to guess either.**
Absent `--store`, validate resolves its root as `nearest`: it walks UP FROM THE
CURRENT WORKING DIRECTORY looking for a qualifying `openspec/` directory (one
carrying `specs/`, `changes/`, or a config file). So cwd alone decides which
tree is validated, and a bare run from the harness default directory validates
`D:/AddictedtoAI`, not your worktree.

There IS a sanctioned targeting flag — `--store <id>` — but it requires
registering the path first (`openspec store register <path>`), and
`--store-path` is deliberately rejected with exactly that advice. Registering a
store writes machine-global state for a one-off worktree, so the `{ cwd }`
script is the right tool here. Do not register a store.

Still no `npm run build` and no `npm test`.

## Files

Work only in:

- `openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md` — reason: carries every finding this round except F6.
- `openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md` — reason: untouched this round unless the sweep finds something; listed so it stays in scope.
- `RESULT3.md` — (new) reason: your report, at the WORKTREE root, specified below.

That list is the closure over this change. `openspec/specs/loop/spec.md` — the
LIVE spec — remains read-only.

## THE CLASS, AND THE SWEEP IT REQUIRES

**THE CLASS THIS ROUND: a bound stated without the three things that make a
bound checkable — the key that carries it, the period it is measured over, and
its relationship to the bounds already beside it.** Findings 1, 2 and 3 are one
defect seen from three sides. A share with no key cannot be configured, a share
with no period cannot be computed, and a share that contradicts the rule
governing its neighbours cannot be obeyed by anyone reading both.

**THE SWEEP: every bound, ceiling, floor and share in the loop delta.** For each,
state the key, the period and the denominator, or say that it inherits them and
from where. Report the clean ones too.

**AND A SECOND SWEEP, because round 2's sweep under-reported.** Your round-2
sweep was good and still missed occurrences: it listed four surviving uses of
`consecutive` where the file has ten. The cause is structural and worth naming —
**you enumerated the requirements you read, not the occurrences of the word, and
a sweep over units can miss an occurrence inside a unit it correctly judged
clean.** So this round: run the raw count, classify EVERY occurrence, and
reconcile the total against your per-requirement verdicts. The numbers must
agree, and if they do not, the raw count wins.

## THE FOUR BLOCKING FINDINGS

### 1 — the back-desk bound names no key

**RULING, measured from `data/config.json` rather than invented.** The existing
bounds live at `budget.bounds` and are integer percentages:
`upkeep_floor_pct: 40`, `new_writing_ceiling_pct: 45`, `machinery_ceiling_pct: 30`.
Name the new one **`budget.bounds.back_desk_ceiling_pct`**, in both restatement
bodies and in the scenario WHEN, and make the existence trigger that key's
presence.

### 2 — the global share states no period

**RULING: it uses the same rolling window as every other share, and you must not
invent a second one.** `data/config.json` already carries `budget.window_days`
(currently **30**), and the live law computes shares "over the rolling 30 days"
(`openspec/specs/loop/spec.md:275`). Say `budget.window_days`, not a literal 30 —
the number is configuration and the spec should name the key. Replace
"over the same period" and "until the window rolls" with that named window.

### 3 — the tier-separate rule and the global exception contradict each other

`:2282` says "Shares SHALL be computed **within each tier separately** ... and
the bounds below SHALL hold in each tier independently", and the bounds below it
are the three CATEGORY bounds.

**RULING, and note that it corrects my own stated reason from round 2.** I
justified "global" by saying a per-tier share "cannot be reasoned about against a
ledger that records spend without tiers". **That premise was false** — live law
at `:275` computes per-tier shares, so tiers plainly are computable. The
conclusion survives for a better reason: **the back-desk share is on a different
AXIS.** Tiers and categories partition spend one way; the front and back desks
partition kinds of work another way. The tier rule was never about this bound.

So do not write it as an "exception" to the tier rule. Scope the tier rule to
what it actually governs — the category bounds — and state the back-desk bound
as a bound on a different axis, measured globally over `budget.window_days`.

### 4 — "One real run clears it" is arithmetically false

See the top of this brief. Condition the WHEN on the evicted oldest slot being
empty.

## THE TWO NON-BLOCKING FINDINGS

- **5** — the breaker window uses `succeeded`/`success`, which the requirement
  never defines, and its second exclusion list drops `evicted-at-train` while the
  first excludes it. Define the term (or use `done`) and restore the exclusion.
- **6** — `parked line` is used and never defined. Define it where you define
  `pending`.

## AND ONE THE SEALED REVIEW DID NOT FIND

I found this checking your sweep, and it is the same class as F2b.

**`:305` — "until it expires or three consecutive discards trip breaker 1 and
halt the Desk".** This states the superseded consecutive model AND NAMES BREAKER
1, the mechanism that replaced it, in one clause. Under the delta's own rule
three discards trip breaker 1 only if they fall among the last five failed-or-
done jobs of that governing type. Conform it.

For the record, the other unlisted `consecutive` survivors I checked are
legitimate and must NOT be touched: `:314` and `:397` are the queue floor, which
genuinely counts consecutive runs in which the queue was not reached, and
`:2236`/`:2259`/`:2262` are conformance supersession, a different model again.

## VERIFY

1. `node .../arch-validate-wt.mjs` — must print `is valid` and exit 0.
2. The `consecutive` reconciliation described in the sweep section.
3. Re-read every requirement you edited this round end to end.

## RESULT

Write `RESULT3.md` at your WORKTREE root:

1. Finding → what you changed → line.
2. The validate invocation and its exact output.
3. The bound sweep: every bound with its key, period and denominator.
4. The `consecutive` reconciliation: raw count, every occurrence classified,
   and agreement with your per-requirement verdicts.
5. Anywhere you disagreed with a ruling above, what you did, and why. **This
   clause has now caught two wrong rulings of mine in two rounds. It is the most
   valuable paragraph in this brief — use it.**
6. Anything you did NOT do that this brief asked for.

## GROUND RULES — not inherited by working here, so repeated

- **Never `cd`.** Not at the start of a command, in the middle of one, in a
  comment, or as a shell function name — the approval classifier matches the
  token, not the intent. Absolute paths; `git -C D:/AddictedtoAI ...` for git.
- **Keep command strings short.** Write a `.mjs` and run it rather than a long
  `node -e` or a multi-step one-liner.
- **Prefer file tools over shell equivalents** — they handle Windows paths and
  line endings correctly. This machine is win32/pwsh: `grep -c` and `wc -l` are
  not available, so use `Select-String` and `Measure-Object`, and say which you
  used when you report a count.
- **Never manipulate credentials on a command line**, and **never print a
  secret**, including a partial token.
- **If a tool call is blocked, report it and stop.** Do not route around a
  denial, and do not edit a permission or settings file to clear your own path.
- **Never run two builds concurrently**, and here run none at all.
- **Do not commit, push, create or remove a git worktree, or touch `STOP` or
  `HOLD.md`.** Leave your edits in the working tree; the commit is mine.
- **Every date is the LOCAL date of this machine**, not UTC.
- A guardrail that blocks you is reported and stopped at, never loosened.
