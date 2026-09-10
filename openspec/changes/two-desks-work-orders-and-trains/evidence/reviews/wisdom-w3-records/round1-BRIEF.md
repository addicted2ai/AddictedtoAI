# TWENTY-FOUR JUDGEMENTS WITH EXPIRY DATES NOTHING READS

authority: two-desks-work-orders-and-trains@a5e873b

Phase 0 shipped `scripts/brief-lint.mjs` and a 79-test suite after three rounds.
Its last round dispositioned every unbound arm of the linter into one of three
outcomes: **BIND** it with a fixture and prove the fixture must fire, **DELETE**
it, or **RECORD** it — keep the arm unbound, and write down who owns that
decision and when it expires.

Eleven arms were bound, by thirteen tests — the six-line pointer window and
the twenty-character phrase threshold each carry a pair, because a boundary
needs a control on both sides of it. One arm was deleted. **Twenty-four were
RECORDED, and the records live in a report.** Eleven plus one plus twenty-four
is thirty-six, which is every arm the round dispositioned.

## The finding, which is stated in the commit message rather than hidden

A report is not a mechanism. **Nothing reads those expiry dates.** On the day
they pass, nothing happens; no run refuses, no check turns red, no reader is
told. The twenty-four are notes in finished work under a better name, and the
rule they were written to satisfy says exactly that:

**A judgement with an owner and an expiry is only a disposition when something
refuses on the expiry.** Until then it is prose with a date in it, and prose with
a date in it reads MORE settled than prose without one, which makes it worse
than the note it replaced.

That is what you are fixing.

## THE CONSTRAINT THAT DECIDES THE SHAPE, AND IT IS NOT NEGOTIABLE

**Whatever refuses on a passed expiry must be reachable from a gate.** A check
that has to be remembered is a check nobody runs — a note about notes, which is
the same defect one level up.

The repository already makes this free if you take the obvious route:
`scripts/run-tests.mjs` discovers every `*.test.mjs` under the source
directories, and the gate sequence begins with the whole suite. **A check written
as a test inherits gate-reachability rather than arranging it.** Anything else
you propose has to say how it is reached, every time, by someone who does not
know it exists.

## THE CLASS, AND THE SWEEP THAT IS YOUR DELIVERABLE

**THE CLASS: a record that can be satisfied without anyone re-checking anything.**

The expiry exists to force a re-decision. Every way of clearing it that does not
involve a re-decision is a hole, and the check is only worth building if those
are closed. **Enumerate them.** Below are the two I found while writing this
brief — the second of them measured, not reasoned. They are the FLOOR, not the list — a sweep that returns only this will be
read as a sweep that did not happen.

**TWENTY-THREE OF THE TWENTY-FOUR CARRY THE SAME EXPIRY DATE, 2026-10-10. The
twenty-fourth, `B3`, expires 2026-12-01.** Counted from the committed blob, in
two independent populations that agree: the section-2 rows marked RECORD and the
section-5 bullets carrying an owner and a date.

Twenty-three checks failing at one moment is a wall, not a signal. The natural
response to a wall is to move all twenty-three dates at a stroke — **which is
precisely the rubber stamp the expiry exists to prevent.** A shared expiry
converts twenty-three separate judgements into one all-or-nothing event and hands
back the exact property the disposition was supposed to remove: the record is
still there, the date is still in the future, and nobody has re-checked anything.

**THE ONE OUTLIER IS EVIDENCE, NOT AN EXCEPTION.** `B3` got its own date because
someone thought about `B3` specifically. The other twenty-three got a default.
That is the difference between a judgement and a batch, and it is visible in the
data before any of this is built.

**AND IT IS WORSE THAN AN INVITATION — THE WALL MAKES THE RUBBER STAMP THE ONLY
OPTION.** Follow the gate constraint through. The check is a test, so it runs in
the whole suite, which is the FIRST gate, and every other gate leans on it. The
push bar in this repository is *push only what has passed the gates*. So on the
day those dates pass, **nothing can be pushed at all** — not an urgent fix, not
an unrelated change, **not even a fix to the expiry check itself** — until
twenty-three judgements have been re-decided.

Whoever is orchestrating that morning faces a frozen repository on one side and
twenty-three date edits on the other. They will edit the dates, and not from
laziness: the alternative is a repository that cannot ship.

**AN EXPIRY WALL DOES NOT TEST WHETHER ANYONE WILL RE-CHECK TWENTY-THREE
JUDGEMENTS. IT TESTS WHETHER THEY WILL ACCEPT AN OUTAGE TO AVOID EDITING A DATE,
AND THE ANSWER IS ALWAYS NO.** A mechanism whose failure mode is an indefinite
stop gets cleared rather than satisfied — the same finding that shaped the Pulse
lease, arriving here in a different costume.

**THIS IS NOT AN ARGUMENT FOR WARNING INSTEAD OF FAILING.** Loosening a guardrail
to make its symptom go away is the one move this repository forbids everywhere,
and a warning nobody must act on is where these twenty-four records already are.
**The check fails hard. It is BECAUSE it fails hard that the dates must not be
simultaneous** — which is an argument for staggering that does not depend on
anybody's good intentions, and that is the kind worth having.


### THE SECOND HOLE, AND IT IS NOT A PREDICTION — I MEASURED IT AFTER WRITING THE PARAGRAPH ABOVE

Every one of the twenty-four records pins its arm by LINE NUMBER in
`scripts/brief-lint.mjs`. At 02:47 on 2026-09-10 I read all twenty-four pins out
of the committed report and compared what stood at each line when the report was
committed with what stands there now.

**ZERO OF TWENTY-FOUR STILL RESOLVE. ALL TWENTY-FOUR MOVED**, most by twenty-three
lines, and one — `B3` — cannot be located by its own text at all, because the
same edit rewrote that line.

The edit had nothing to do with any record. It removed a reference to an
unarchived change directory that a repository guard refused. **THE RECORDS
OUTLIVED THE THING THEY DESCRIBE IN UNDER THREE HOURS, AND NO EXPIRY DATE HAD
ANYTHING TO DO WITH IT.**

Take that consequence seriously, because it moves the whole design. **THE EXPIRY
WAS NEVER THE THING THAT WOULD BREAK FIRST.** A date fires a single time, a month
from now. An ordinary edit invalidates a pointer constantly, and it already has. A mechanism
watching only dates would have sat green through this morning and then gone red
on 2026-10-10 over twenty-four records that stopped describing anything on
2026-09-10 — **a check that is precisely on time about the wrong event.**

So the trigger worth building may not be *a date passed* at all. It may be *the
arm moved, changed or vanished*, and whatever anchors a record may have to move
WITH the code rather than sit beside it in another file. **I am not making that
decision for you.** It is the strongest evidence in this brief and you have to
rule on it: does the check watch dates, watch anchors, or watch both — and say
what each one costs.

### STAGGERING DOES NOT REMOVE THE FREEZE, AND THAT IS A SECOND RULING I OWE YOU

Follow the wall argument further than I first did. A hard-failing check lives in
the suite, the suite is the first gate, and the push bar is *push only what has
passed the gates* — so **ONE expired record blocks exactly as much as twenty-four
do.** Staggering does not remove the outage. It converts one large rare outage
into many small frequent ones.

Which makes **the cost of a SINGLE disposition** the load-bearing number, not the
count of records. Measured, by reading them: each record is two to four sentences
carrying its own reasoning — the arm, why no twin exists, what removing it would
do, why DELETE was rejected — so re-DECIDING one is a short read. But FINDING the
arm it describes is now a search rather than a lookup, for the reason directly
above. **The cost of a disposition is inflated by exactly the defect that makes
the pins stale**, which is why these are one question and not two.

And the outlier is evidence here too. `B3` carries a date nearly two months later
than the batch because someone thought about `B3`. If a considered judgement
produces a long interval, then a default clustering everything at thirty days
manufactures dispositions nobody has new information for — **and a disposition
made with no new information is the rubber stamp arriving on a schedule instead
of arriving all together.**

### One candidate, named so you can refuse it

I considered requiring that **renewing a record restate its reason rather than
move its date**, so a renewal cannot be a pure date edit. I am not asking you to
build it: it may need history the check cannot read, and I do not know whether it
is buildable here.

**It is in this brief because a named-and-refused option is part of the
enumeration and a withheld one is not.** Rule on it — buildable and worth it,
buildable and not worth it, or not buildable and here is why. *"Cannot be done
because X"* is a result. Silence is not.

Work out the rest yourself and report the enumeration in full, including any hole
you decided needs no code, with the reason. Some directions worth walking, none
of them exhaustive: what happens when the arm a record describes is edited, or
deleted, or renumbered; what a record that cannot be parsed should mean; whether
a record can name something that no longer exists; what stops a record being
added without a reason; whether the owner field can be empty, or a role nobody
holds.

**A hole you considered and dismissed in writing is a judgement I can overturn. A
hole you never listed is one nobody will look at again** — which is the sentence
this entire packet exists because of.

## Two properties, and the layout is yours to choose

I am not telling you where the records live. Two properties constrain it and
they are what your choice has to satisfy:

1. **A record must not be able to outlive the thing it describes.** A record for
   an arm that has been deleted or rewritten is a stale restatement, and this
   project has measured what those cost — a second source that goes stale
   silently while reading exactly like a measurement.
2. **Deleting the arm must take its record with it, or the check must notice.**
   One of those two. Say which you chose and why.

## THE TRANSCRIPTION IS THE RISKIEST PART OF THIS JOB

The twenty-four records exist in `wisdom/phase-0-RESULT3.md`, section 5. **READ
THEM FROM `HEAD`, NOT FROM THE AUTHORITY SHA. `wisdom/` DOES NOT EXIST AT
`a5e873b`** — it arrived at `d4c2dba`, so resolving the report against the
authority sha fails, and it fails with a message about the file existing on disk
that reads like a tree problem rather than a sha problem. The pre-flight review of
this brief resolved it against the authority sha, hit exactly that error, and
worked out the cause for itself.

I wrote that warning with the failing command spelled out, and **this brief's own
linter refused it** — check 9 parsed the illustration as a live pointer, tried to
resolve it, and reported that it does not resolve. The check was right and the
command is gone: a pointer-resolver cannot tell an illustration from an
instruction, and neither can a tired reader at 03:00. A brief that lets its worker discover its own trap has spent the worker on
the brief instead of the work. **That count is 24, measured from the committed blob in two
independent populations that agree — and the first draft of this brief said 23.**
It was wrong because I read the list and did not count it, which is the defect
this section is about, committed in the sentence that orders you to avoid it.
Count it yourself and tell me the number you got.

Moving them is copying, and **lossy copying between a source and a work order is
this project's most-measured defect**: quantifiers dropped, a word
changed, a requirement present in the source and absent from the copy.

So: **verify the transcription against the committed source, by count and by
content, and say in your report how you verified it.** Not "I copied them
carefully." A count that matches and a check that each record's arm reference and
reason survived. If a record is unclear in the source, carry it across unchanged and say so —
do not improve it in transit.

**ONE EXCEPTION, AND IT IS A RULING RATHER THAN A JUDGEMENT LEFT TO YOU, BECAUSE
THIS BRIEF OTHERWISE TELLS YOU TWO OPPOSITE THINGS ABOUT THE SAME TWENTY-FOUR
STRINGS.** The section above establishes that all twenty-four LINE PINS are
already wrong. "Carry it across unchanged" would have you transcribe twenty-four
pointers you have just been told point at nothing.

So: **transcribe each record’s REASONING verbatim, and treat its LINE PIN as data
to be RE-DERIVED rather than text to be copied.** Say which twenty-four you
re-derived and how you found each one. The reason the pin is not prose is that it
is the only part of a record that can be checked mechanically — and it is the
only part already known to be false.

## THE MUTATION CONTRACT

For every check you add: a vehicle that passes, a twin that fails, and **a
mutation of your own check that turns your own twin red** — applied, run,
restored, run again, all three states recorded, named precisely enough to
reapply.

**A TWIN PROVES A CHECK CAN FIRE. ONLY A MUTATION PROVES IT MUST.**

And this check has a property that makes its controls unusually easy to get
wrong: **it is a check about DATES, so a fixture that passes today can fail in a
month for reasons that have nothing to do with the code.** Pin the clock. A
control whose colour depends on the day it is run is not a control.

## Scope

- **Do not change any existing check in the linter**, and do not change any of
  the twenty-four dispositions themselves. You are building the thing that reads
  them, not re-deciding them. If a record looks wrong, that is a finding for your
  report.
- **Do not run the Pulse, the Desk, a build, any `verify-*` script, or the whole
  suite.** `node --test` on your own new test file, and direct
  `node scripts/brief-lint.mjs` runs, are exactly right.
- **Do not spell the guarded two-letter token.** The existing suite assembles it
  at runtime from character codes; follow that method.

## Files

Work only in these; a diff touching any other path is a scope finding.

- `scripts/brief-lint.mjs` — only if your layout puts records here, and then under the two rulings below
- `scripts/brief-lint-records.test.mjs` — (new) the check and its controls
- `RESULT1.md` — (new) your report, in the repository root

**Do not edit** `scripts/brief-lint.test.mjs`, anything under `wisdom/`,
`package.json`, `runners.yml`, anything under `data/`, `CLAUDE.md`, `AGENTS.md`,
or any file under `openspec/`.

### The two rulings that govern `scripts/brief-lint.mjs`

These are rulings rather than judgements left to you, because the scope rule
above and the permission to work in that file agreed in my head and not on the
page, and a reader who has to guess which one governs is reading a defective
brief.

**FIRST: APPEND-ONLY MEANS BOTH HALVES.** New data and the wiring that reads it,
with every existing line left byte-identical — **AND** the appended wiring must
not change any existing check’s verdict or exit code on the existing fixtures.
Both, because the first does not imply the second: you could leave every
existing line untouched, append a refusal to the exit path, and turn every
existing fixture run red on the expiry date without one existing line having
changed. **BYTE-IDENTICAL IS A FACT ABOUT THE DIFF; UNCHANGED IS A FACT ABOUT
THE BEHAVIOUR, AND A DIFF-SHAPED CONSTRAINT CANNOT EXPRESS THE SECOND.** The
refusal belongs in your new test file.

**SECOND: A PIN OUTSIDE YOUR SCOPE CONSTRAINS THAT FILE.** A trial in
`scripts/brief-lint.test.mjs` — which you may not edit — asserts that **no
openspec change directory is NAMED anywhere in the linter source, comments
included.** Spell one while transcribing and that trial turns red, and you
cannot repair it, because the file holding it is out of bounds. Do not spell
one; the records contain none. If you hit it anyway, that is a blocked finding
to report, not an obstacle to work around.

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
  between mutations**, and say whether **your own new test file** was green
  again after each restore. Not "the suite" — the scope above forbids running
  the whole suite, so a ground rule asking about "the suite" orders the
  forbidden thing in the same document that forbids it.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `RESULT1.md`

    # THE RECORD EXPIRY CHECK — RESULT1

    ## 1. Where the records live now, and which of the two properties I chose
    ## 2. THE SWEEP — every way a record can be satisfied without a re-decision
    | hole | closed how, or dismissed and why |
    ## 3. The common-expiry wall — what I did about it, and my ruling on the
    ##    restate-the-reason candidate
    ## 4. How I verified the transcription, by count and by content
    ## 5. The controls, with the clock pinned
    ## 6. The mutations — one per check added
    | check | mutation | before | mutated | restored | files identical |
    ## 7. What the check does NOT catch, said plainly
    ## 8. What I could not determine
    ## 9. Blocked or refused calls

Section 2 is the acceptance criterion, and section 7 is the one that will be read
in a year. A check whose limits are stated is a check somebody can rely on; one
whose limits are implied is the artifact this whole plan is about.
