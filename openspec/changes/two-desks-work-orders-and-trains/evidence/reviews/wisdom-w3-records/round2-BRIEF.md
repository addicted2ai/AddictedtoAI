# ROUND 2 — the anchors are blind in all twenty-four, and RECORD was never a third outcome

authority: two-desks-work-orders-and-trains@a5e873b

Round 1 built the mechanism and it was reviewed hard. **The tripwire half works
and is not in question.** The half that was claimed closed is open in every
instance, and one ruling from the review changes what this packet is for.

## What the review found, and none of it is arguable

A sealed reviewer took each of the 24 records, found the arm its reason
describes, constructed an edit that **changes what that arm does while leaving
the anchor substring present at its expected count**, applied it, ran the suite,
restored, and re-ran.

**Twenty-four of twenty-four stayed GREEN. Zero sound.**

Your `RESULT1.md` marks the hole *"arm edited but anchor still matches"* as
**Closed by precise anchors**. It is not closed. It is open in every case, and
the reviewer proved three of them by flipping the linter's own verdict on a
fixture while the records suite stayed green.

**AND THE GAP IS STRUCTURAL, NOT A MATTER OF CHOOSING LONGER SUBSTRINGS.**
Behaviour lives in flags, in `&&` versus `||`, in an added conjunct, in a dropped
conjunct, in an upstream definition, in a sibling arm of one alternation, in a
call site that bypasses a definition. A substring pins none of those unless it
spans them, and spanning them is the whole linter quoted back — which then fails
on any reformat. **DO NOT TRY TO FIX THE ANCHORS. There is no version of this
that works, and an afternoon spent lengthening substrings would produce a
mechanism that fails more often and detects the same nothing.**

## THE RULING, WHICH IS MINE AND CHANGES THE DESIGN

The reviewer's recommendation is adopted, and it corrects a rule I wrote:

**A RECORD WITHOUT A TWIN BY ITS DATE IS DEBT, NOT A DISPOSITION.**

Which means **BIND / DELETE / RECORD was never three outcomes. RECORD IS BIND
DEFERRED WITH A DEADLINE.** Calling it a third outcome is exactly what let 24
arms sit unbound while reading as dispositioned — a name doing work no mechanism
ever did.

So the expiry stops meaning *"re-decide this"* and starts meaning **"by this
date, this arm has a behaviour twin, or it is deleted, or someone writes down why
neither happened."** The date is a deadline for WORK, not for a decision, and the
cheap way out — editing the date — stops being a way out at all, because the
thing the date now gates is a fixture that either exists or does not.

**YOU ARE NOT WRITING TWENTY-FOUR TWINS IN THIS ROUND.** You are writing **one**,
and measuring what it cost. The reviewer estimates 24 fixtures with several
fiddly ones; an estimate is not a measurement, and the decision about whether to
commit to 24 is mine to make from a real number rather than from a guess.

## THE CLASS FOR THIS ROUND'S SWEEP

**THE CLASS: a check in this file whose own logic no fixture binds.**

The reviewer applied nine mutations to the mechanism itself. **Seven were
missed.** Not to the linter — to your own file, the one that is supposed to be
the guard:

- `rec.expect < 1` → `rec.expect < 0`, so `expect: 0` becomes legal
- Check A's loop → `RECORDS.slice(0, 1)`, so only the first record is ever checked
- Check S's assert → `assert.equal(0, 0, …)`, so errors are collected and never asserted on
- Check A's assert → `assert.equal(bad.length, bad.length, …)`, so the check is dead and always green
- Check E's `late` → `[]` with the filter computed and discarded, so the live expiry is dead
- the count pin → `RECORDS.length` against `RECORDS.length`, self-comparing
- `got !== rec.expect` → `got < rec.expect`, so an anchor appearing twice passes

**Every one of those leaves a mechanism that reads as present and does nothing.**
That is the defect this entire packet exists to end, sitting inside the packet.

**Sweep your own file for the class and report the enumeration.** Those seven are
the FLOOR, not the list — the reviewer stopped at nine mutations, not at
exhaustion. For every function and every assertion you have written, ask: *is
there a fixture whose colour changes when I break this?* Where there is not,
either build the twin or say why the arm cannot be bound, with the reason.

## The other findings, each of which you fix

### F2 — the clock override satisfies the whole wall without re-deciding anything

`BRIEF_RECORDS_NOW` moves the date the live check reads. The reviewer measured
the path rather than reasoning about it: `loop/lib/gates.mjs:467` and `:559` spawn
children with `...process.env` and never clear it, so an outer value reaches
`npm test` and reaches your check; and `loop/lib/gates.mjs:655` keeps only the
last 6000 characters of each script's output, so your "pinned now" notice is
buried under a thousand passing lines on a green run.

**AN ENVIRONMENT VARIABLE THAT GREENS EVERY RECORD AT ONE STROKE IS THE EXACT
CLASS THIS PACKET CLOSES, SITTING INSIDE THE MECHANISM THAT CLOSES IT.** "The
runner will not set it" is a convention, and the review says so in those words.

Adopt the reviewer's fix: **the live expiry check ignores the pin and always
reads the local date. The pin stays available to the controls**, which genuinely
need day-independence and must not be broken. Prove the constraint with a control
that sets the pin and shows the live check ignoring it.

### F4 — the failure reports a number, not a name

Delete a record and leave the count at 24 and the check fails with `record count
23, want 24`. It does not say **which** record went missing, and the batch
control lists the survivors so the absent one is inferred rather than accused.

**PRINT THE THING, NOT ONLY THE COUNT OF THINGS.** Every refusal in this file
names the record or records responsible. This is small and it is the difference
between a failure someone can act on at 04:00 and one they have to reconstruct.

### F5 — three reasons are recognisable but not re-decidable

`G8sent`, `G7hy`, and the `I4star`/`J2star` pair say what the arm is and not what
DELETE would cost, so a reader meeting them on the expiry day can recognise the
decision but cannot remake it.

**THIS ONE IS NOT YOURS TO FIX** — rewriting a reason is re-deciding a
disposition, and that is mine. Carry them across unchanged. It is here so you
know why the twin requirement is not optional: the reviewer placed those three
precisely, and the wall forces all 23 to be re-decided on one morning, **so the
weakest records and the highest-pressure moment are the same event by
construction.**

## The one twin, and the measurement that is its real product

Pick **one** record and build the behaviour twin its reason describes: a vehicle
the linter passes, a minimally-different twin it refuses, and a mutation of the
arm that flips the twin — applied, run, restored, run again.

Choose the one you judge most representative of the middle of the distribution.
**Not the easiest, and not the worst** — say which you chose and why, because the
number I need is the cost of a typical twin, and a number taken from the easiest
would be the control-at-a-convenient-point defect that produced this packet.

Then report, in wall-clock minutes and in lines of fixture: **what did that one
twin cost?** If you hit something that makes a particular arm unbindable rather
than merely fiddly, that is a finding worth more than the twin.

## Scope

- **Do not lengthen or re-derive the anchors.** The ruling above settles it.
- **Do not change any existing check in `scripts/brief-lint.mjs`**, and do not
  change any of the 24 dispositions, dates, owners or reasons.
- **Do not run the Pulse, the Desk, a build, any `verify-*` script, or the whole
  suite.** `node --test` on your own file and direct `node scripts/brief-lint.mjs`
  runs are exactly right.
- **Do not spell the guarded two-letter token.** Assemble it at runtime from
  character codes, as the existing suite does.

## Files

Work only in these; a diff touching any other path is a scope finding.

- `scripts/brief-lint-records.test.mjs` — the mechanism, its controls and the one twin
- `RESULT2.md` — (new) your report, in the repository root

**Do not edit** `scripts/brief-lint.mjs`, `scripts/brief-lint.test.mjs`, anything
under `wisdom/`, `package.json`, `runners.yml`, anything under `data/`,
`CLAUDE.md`, `AGENTS.md`, or any file under `openspec/`.

## Ground rules (non-negotiable, and they do not carry over from anywhere)

- **Never use the token `cd` anywhere** — not in a command, not in a comment, not
  as a shell function name. A guard matches the token, not the intent. Absolute
  paths, and `git -C <dir>` for git.
- Keep command strings short; write a `.mjs` under the OS temp directory and run
  it rather than `node -e`.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you use as evidence.** No `| head`, no
  `| tail`, no `-First N` on a counting or enumerating command.
- **Keep an untouched copy under the OS temp directory and restore from it
  between mutations**, and say whether **your own test file** was green again
  after each restore.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `RESULT2.md`

    # THE RECORD EXPIRY CHECK — RESULT2

    ## 1. THE SWEEP — every check in this file, and the fixture that binds it
    | check | fixture that binds it | mutation that proves it | or: why unbindable |
    ## 2. The seven missed mutations — each one now caught, or why not
    ## 3. The clock, constrained — the live check and the controls
    ## 4. Every refusal now names the record
    ## 5. The one twin — which record, why that one, and WHAT IT COST
    ## 6. The mutations — one per check added or changed
    | check | mutation | before | mutated | restored | files identical |
    ## 7. What the mechanism still does NOT catch, said plainly
    ## 8. What I could not determine
    ## 9. Blocked or refused calls

Section 1 is the acceptance criterion. **The last round's report claimed a hole
closed that was open twenty-four times out of twenty-four** — so a claim of
closure in this report will be tested by someone who has already done exactly that.
Where you are not sure, section 7 is the honest place, and it costs you nothing.
