# SEALED REVIEW — twenty-four records now refuse. Is the anchor the same thing as the arm?

authority: two-desks-work-orders-and-trains@a5e873b

You are reviewing an implementation. **Report, do not repair.** You work in a
disposable copy and may break anything in it to test it, but a fixed version of
the author's file is thrown away with the directory. The only thing that survives
you is `REVIEW1.md`, so a defect you quietly corrected instead of writing down is
a defect that ships.

## What this packet is, and what it already survived

Phase 0 dispositioned 36 arms of the brief linter: 11 BIND, 1 DELETE, **24
RECORD** — kept unbound, with a named owner and a date it expires. Those records
lived in a report, and a report is not a mechanism: nothing read the dates.

Worse, and measured rather than feared: **all 24 records pinned their arm by LINE
NUMBER, and all 24 pins had already gone stale** — 0 of 24 resolved — invalidated
by an unrelated repair three hours after they were written.

The author replaced line pins with **ANCHORS**: a content substring of
`scripts/brief-lint.mjs` plus its expected occurrence count. `brief-lint.mjs` is
**byte-identical**; the whole mechanism is `scripts/brief-lint-records.test.mjs`,
nine tests, three checks (anchors resolve at expected counts, no record expired,
shape holds with the count pinned at 24).

**ALREADY VERIFIED BY THE COORDINATOR. DO NOT SPEND THE REVIEW REDOING THESE:**

- Inserting three lines at the top of the linter leaves the suite **green** —
  renumbering is genuinely immaterial.
- Corrupting each of the 24 anchors in turn, restoring between, turns the suite
  **red 24 times out of 24**.
- All 24 reasons are **verbatim** against the committed blob, matched on the
  whole reason.

## The questions, in order of what they are worth

### 1. THE ANCHOR IS A PROXY FOR THE ARM. WHERE THEY DIVERGE, THE RECORD IS BLIND.

**This is the question and it is the one nobody has asked.**

The property under review is that no arm of the linter can change behaviour
while its record stays green. This brief does not name what enforces that
property, so find it, run it, and say what you ran.

What has been proven is that **corrupting an anchor refuses**. That is not the
property. The property is that **any behaviour-changing edit to the arm refuses**,
and those two claims are different whenever the anchor is narrower than the arm
it stands for.

Take `E2chg`. Its record is about the edit-verb list; its anchor is
`change|changes`. Delete a *different* arm of that same alternation and the
anchor still matches at its expected count, so the record stays green while the
thing it describes has changed. Whether that is true of `E2chg` specifically is
for you to determine — **I am naming the SHAPE, not the instance.**

**THE CLASS: an arm whose behaviour can change while its anchor survives
untouched.** Sweep all 24. For each, read the record's reasoning, find the arm it
actually describes, and ask whether there is an edit that changes what that arm
DOES while leaving the anchor substring present at its expected count. Where
there is, construct it, apply it, run the suite, and report the colour.

Report the enumeration in full — including the ones you checked and found sound,
because a sweep that lists only failures is indistinguishable from a sweep that
stopped early.

Then rule on the general question: **is a content substring the right anchor at
all**, or does the gap between substring and behaviour make this a mechanism that
will drift into decoration? If you think there is a better anchor, say what it is
and what it costs. If you think substrings are right and the gap is acceptable,
say why — that is a real answer and I would rather have it argued than assumed.

### 2. THE CLOCK CAN BE TOLD WHAT DAY IT IS

`BRIEF_RECORDS_NOW` overrides today's date. The author's own sweep calls this
"narrowed", on the grounds that a pinned run prints a notice saying it is pinned.

Push on it. **AN ENVIRONMENT VARIABLE THAT MOVES THE CLOCK IS A WAY TO SATISFY
EVERY RECORD AT THE SAME TIME WITHOUT RE-DECIDING ANYTHING** — which is, word for word,
the class this entire packet was built to close, sitting inside the mechanism
that closes it.

Determine: can a gate run carry that variable? What actually reads it, and does
anything outside the suite refuse when it is set? Is the printed notice visible
in a gate log, or only on a terminal nobody is watching at 04:00? Is "the runner
will not set it" a mechanism or a convention — and if it is a convention, say so
in those words, because the author's section 7 already concedes it might be.

Then rule: leave it, remove it, or constrain it. **A pin the controls genuinely
need is a legitimate thing to have** — the controls must not depend on the day
they run — so "remove it" has a cost too. Name that cost if you take that side.

### 3. WHAT DOES THE NINE-TEST SUITE STILL PASS ON?

The author mutated the three CHECKS: the expiry comparison, the counting
function, the owner shape rule. Three mutations for nine tests.

**A twin proves a check can fire; only a mutation proves it must.** Find the
mutations this suite survives. Kinds worth trying: a comparison flipped, a
threshold moved by one either way, a loop that stops after its first record
instead of checking all 24, a conjunction reduced to one term, an error collected
but never asserted on, a `filter` whose result is computed and discarded, the
count pin compared against itself rather than a literal.

Apply each to your copy, run `node --test` on
`scripts/brief-lint-records.test.mjs`, and report **caught and missed both**.
Keep an untouched copy under the OS temp directory, restore from it between
mutations, and say whether that test file was green again after each restore. A
result from an un-restored file is two mutations reported as one.

### 4. IS THE COUNT PIN LOAD-BEARING OR DECORATIVE?

The shape check pins the record count at 24. The author says this makes a silent
deletion fail, and concedes that an actor who edits the count in the same edit
passes — narrowed, not closed, and section 7 says so, which is the right way to
say it.

Test the half that is claimed. Delete one record and leave the count at 24: does
it fail, and does the failure NAME the missing record or only report a number?
Then delete one record and set the count to 23: does anything else notice — an
anchor, a shape rule, anything — or is review genuinely the only remaining
detector? **Say which, precisely**, because "review is the backstop" is either a
true statement about a designed boundary or a phrase that ends an inquiry.

### 5. THE REASONS ARE THE PRODUCT, AND THEY ARE NOW IN A TEST FILE

Twenty-four paragraphs of reasoning moved from a report into a `.mjs` as string
literals. Read a sample of them **as the person who meets them on the day one
expires**, with no memory of tonight.

Does the reason say enough to re-decide the arm — what it guards, what removing
it would cost, why DELETE was rejected? Or does it say enough only to recognise a
decision already made? **A RECORD THAT CAN BE RE-READ BUT NOT RE-DECIDED IS A
NOTE WITH A DATE ON IT**, which is precisely the state this packet was built to
end.

## Files

Everything in this disposable copy is yours to modify; only the first is a
product, and only the first outlives the directory.

- `REVIEW1.md` — (new) your verdict and findings; the one file that survives
- `scripts/brief-lint-records.test.mjs` — the mechanism under review
- `scripts/brief-lint.mjs` — the linter the anchors point into; byte-identical,
  and the thing you mutate to test whether an anchor notices
- `RESULT1.md` — the author's report, whose claims you are testing
- `wisdom/phase-0-RESULT3.md` — the committed source the records came from

Scratch copies for restoring after a mutation go under the OS temp directory.

## Ground rules (non-negotiable, and they do not carry over from anywhere)

- **Never use the token `cd` anywhere** — not in a command, not in a comment, not
  as a shell function name. A guard matches the token, not the intent. Absolute
  paths, and `git -C <dir>` for git.
- **Do not spell the guarded two-letter token** in your report or in any file you
  touch. The existing suite assembles it at runtime from character codes; follow
  that method and match on tail words that name no token.
- Keep command strings short; write a `.mjs` under the OS temp directory and run
  it rather than `node -e`.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you use as evidence.** No `| head`, no
  `| tail`, no `-First N` on a counting or enumerating command.
- **Do not run the Pulse, the Desk, a build, any `verify-*` script, or the whole
  suite.** `node --test` on the two test files, and direct
  `node scripts/brief-lint.mjs` runs, are exactly right.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `REVIEW1.md`

    # THE RECORD EXPIRY CHECK — REVIEW1

    ## VERDICT
    approve | revise | reject     (one word, on its own line, first)

    ## 1. THE SWEEP — for each of the 24, can the arm change while the anchor
    ##    survives? (every record listed, sound or not, with the edit tried)
    ## 2. My ruling on content substrings as anchors
    ## 3. The clock override — mechanism or convention, and what I would do
    ## 4. What the suite still passes on
    | mutation | before | mutated | restored | caught |
    ## 5. The count pin — what fails, what names the missing record
    ## 6. The reasons, read cold by someone re-deciding
    ## 7. Findings, each with file and line
    ## 8. What I could not determine
    ## 9. Blocked or refused calls

**`approve` is a real outcome and I am not fishing for a revision.** Section 1 is
the acceptance criterion: an approval whose section 1 does not list all
twenty-four will be read as a review that answered the easy questions.
