# Revision brief — SPEC DELTA CORRECTIONS, round 2

authority: two-desks-work-orders-and-trains@12b4ea3

Round 1's diff was sealed-reviewed and came back **REVISE with five blocking
findings**. This round fixes them. Your round-1 work was not wasted — validate
passes, all four `lane` collisions are gone, both dangling removals now have
MODIFIED blocks, and the reviewer confirmed the shape of the work. What it
found is that several of the new sentences are underdetermined in ways a later
implementer would resolve differently from each other.

## WHERE YOU WORK

The same worktree, **`D:/addictedtoai-worktrees/fleet6-specfix`**, with your
round-1 edits already in it. Do not revert them; amend them.

The machine is now clear, so the earlier no-build reasoning has lapsed — but the
instruction has not: still no `npm run build` and no `npm test`. No code
changed, so neither can tell you anything `openspec validate` cannot.

## Files

Work only in:

- `openspec/changes/two-desks-work-orders-and-trains/specs/loop/spec.md` — reason: carries F1 through F5 and F7, all of the blocking work.
- `openspec/changes/two-desks-work-orders-and-trains/specs/review/spec.md` — reason: carries F6 alone, a one-clause qualification.
- `RESULT2.md` — (new) reason: your report, at the WORKTREE root, specified below.

That list is the closure over this change: nothing else may be edited, created
or deleted. **In particular `openspec/specs/loop/spec.md` — the LIVE spec — is
read-only, and F2 below is the reason that needs saying out loud.**

## THE CLASS, AND THE SWEEP IT REQUIRES

Five of the seven findings are one defect wearing different clothes, and fixing
them one at a time is how the round-1 versions survived in the first place.

**THE CLASS: a requirement whose body was rewritten to a new model, while
sentences inside it still speak the model it replaced.** F1 is body-says-
`failed`-or-`discarded` against scenario-says-`failed`/`done`. F2 and F2b are a
requirement that now defines a WINDOW while its heading and two of its scenarios
still say `streak`, `consecutive` and `running`. F5 is a rule that forbids one
ordering and names none, leaving the old one implied. In every case the new norm
and the old vocabulary sit inside the same requirement, so whoever implements
picks one and the other becomes permanently wrong.

**THE SWEEP, and it is not optional.** After fixing the named instances, read
**every requirement you touched in round 1 or this round, end to end**, and for
each ask the single question this class turns on: *does any sentence in this
requirement describe a mechanism the requirement itself replaced?* Report the
sweep in RESULT2 as a list of every requirement you read and the verdict for
each — including the ones that were clean. A sweep that reports only its hits is
indistinguishable from a sweep that stopped early.

Do not widen this into a rewrite. The sweep looks for one thing: leftover
vocabulary from a superseded model.

## THE FIVE BLOCKING FINDINGS

### F1 — the breaker scenario's window vocabulary excludes what its own body counts

The body defines a failure as `failed` **or** `discarded`, and says the window
is drawn from "outcomes that are a failure or a `done`". Your scenario says
"within the last five `failed`/`done` jobs" — which, read literally, has no
`discarded` slot. The scenario's own case ("fail review twice") IS `discarded`,
so the scenario excludes the very case it exists to show.

Fix: `within the last five failure/done jobs (failure = failed or discarded)`.

### F2 — "One real run clears it" is now a false title, AND THE OBVIOUS FIX IS WRONG

Your body is right; the heading above it is not. Under a window, one producing
run does not clear a refusal in general — the very next scenario proves it
("empty, empty, producing, empty" stays refused).

**The reviewer's suggested fix is to rename the scenario in the live spec and
the delta together. DO NOT DO THAT.** The live spec is law that this change may
only alter by being archived; editing it directly to satisfy a validator would
be the tail wagging the dog, and it is outside this change's remit. You already
discovered by experiment that renaming in the delta alone is refused, and you
reported it — that report is what makes this decision possible, and it was the
right thing to write down.

**ARCHITECT'S RULING — take the third option: keep the heading and make it
true.** "One real run clears it" is a true statement about a runner sitting at
exactly the threshold. Scope the scenario to that case:

- **WHEN** a refused runner whose last five invocations include exactly three
  empty ones is repaired, and its next run produces a diff
- **THEN** that producing invocation replaces one window slot, two of the last
  five remain empty, and the runner is selectable again, with no other action

That is title-true, window-true, needs no live-spec edit, satisfies validate's
no-drop rule because the heading never changes, and does not contradict the
sibling scenario — which is about a runner NOT at the threshold.

### F2b — TWO MORE SCENARIOS IN THAT BLOCK STILL SPEAK STREAK, and the review did not catch them

I found these reading the block to settle F2; they are the same defect and it
would be silly to fix one and leave two.

- "A reviewer-only runner accumulates a streak" — "completes three
  **consecutive** review invocations" and "the **streak** reaches three".
- "Refusal is not a halt" — "produces nothing three times **running**".

Both are streak semantics inside a requirement that now defines a window.
Conform both to window vocabulary, keeping their headings unchanged for the
same no-drop reason as F2.

### F3 — `DIRECTIVES.md retires` leaves `pending` undefined

Define `pending` as a line without a `[done <date> <job-id>]` marker, and state
the priority each migrated bead carries. `tasks.md:2205-2208` is the migration's
surviving record — read it and make the spec agree with it rather than
inventing a second answer.

### F4 — the back-desk share bound has no denominator and no trigger

Two competent readers build a global total and a per-tier gate from this text.
State which, and give an OBSERVABLE predicate for "both desks exist" — the
declared config key being present is the kind of thing that qualifies; "when
both desks are running" is not, because nothing can check it.

**ARCHITECT'S RULING: the share is GLOBAL, not per-tier.** A per-tier share
cannot be reasoned about against the ledger, which records spend without tiers,
and the whole point of the bound is that the ledger can see it.

### F5 — the window forbids ledger ordering and then names no ordering

"SHALL NOT be a backwards walk" rules out one ordering and supplies none, so
under concurrency two implementations disagree about which five are last.

**ARCHITECT'S RULING: order by the ledger's own append order — that is,
completion order — and say so.** The phrase "not a backwards walk" was about
not re-deriving a streak by scanning history backwards from the present; it was
never about refusing the ledger as the source of truth for sequence. Name it
explicitly: the last five are the five most recently appended ledger entries for
that runner in that role. If you find that this contradicts something else in
the requirement, STOP and say so in RESULT2 rather than choosing.

## THE TWO NON-BLOCKING FINDINGS — fix both, they are one clause each

- **F6** (review delta): qualify the final `would-cite-for` sentence with
  "where more than one prose piece is present", so it stops reading as covering
  the N=1 case.
- **F7**: `Desk` (capitalised, the loop as a whole) and `desk` (lowercase, the
  front/back partition) are now one word doing two jobs in permanent law —
  exactly the defect the `lane`/`desk` reservation was written to end. Reserve
  the capitalisation distinction explicitly, in the same sentence as that
  reservation.

## VERIFY

    openspec validate two-desks-work-orders-and-trains --type change --strict --no-interactive

Must pass. Then re-read the runner-health requirement end to end and confirm no
sentence in it still says `streak`, `consecutive` or `running` in the counting
sense — that is F2 and F2b's real test, and a grep is not enough because the
words appear legitimately elsewhere.

## RESULT

Write `RESULT2.md` at your WORKTREE root:

1. Finding → what you changed → line.
2. The validate command and its exact output.
3. The runner-health re-read: every sentence you judged, and why the survivors
   are legitimate uses.
4. Anywhere you disagreed with a ruling above, what you did, and why. A ruling
   of mine that turns out to be wrong is worth more to me than a silent
   compliance that buries it.
5. Anything you did NOT do that this brief asked for.

## GROUND RULES — not inherited by working here, so repeated

- **Never `cd`.** Not at the start of a command, in the middle of one, in a
  comment, or as a shell function name — the approval classifier matches the
  token, not the intent. Absolute paths; `git -C D:/AddictedtoAI ...` for git.
- **Keep command strings short.** Write a `.mjs` and run it rather than a long
  `node -e` or a multi-step one-liner.
- **Prefer file tools over shell equivalents** — they handle Windows paths and
  line endings correctly.
- **Never manipulate credentials on a command line**, and **never print a
  secret**, including a partial token.
- **If a tool call is blocked, report it and stop.** Do not route around a
  denial, and do not edit a permission or settings file to clear your own path.
- **Never run two builds concurrently**, and here run none at all.
- **Do not commit, push, create or remove a git worktree, or touch `STOP` or
  `HOLD.md`.** Leave your edits in the working tree; the commit is mine.
- **Every date is the LOCAL date of this machine**, not UTC.
- A guardrail that blocks you is reported and stopped at, never loosened.
