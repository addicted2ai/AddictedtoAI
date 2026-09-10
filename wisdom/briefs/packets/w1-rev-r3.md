# ROUND 3 — EVERY UNBOUND ARM GETS A DISPOSITION, NOT NECESSARILY A TEST

authority: two-desks-work-orders-and-trains@a5e873b

The round-2 sealed review returned `revise`. It attempted **46 mutations** of
`scripts/brief-lint.mjs`, and **34 of them left the suite 66/66 green**. Its
report is `REVIEW1.md` in your working directory and it is line-anchored: every
miss names the file line and the twin that is absent.

**Before you read the number as a regression, read the method.** Round 1's
reviewer attempted about eight mutations and found six holes. This one attempted
forty-six. The suite did not get worse between rounds; the search got deeper, and
it will get deeper again next round. That fact is the reason this brief is shaped
the way it is.

**The findings are corroborated, not taken on the reviewer's word.** Three of the
claimed misses and one of the claimed catches were re-applied independently
against the author's file, by exact substring, restored by hash between: the
misses stayed 66/66 green and the catch went 65/1 red. A sample of misses alone
would be indistinguishable from a suite that never runs, which is why the catch
was in it.

## THE RULING, AND IT IS THE WHOLE BRIEF: THIS IS A DISPOSITION ROUND

**Do not try to bind all thirty-four. That job has no terminating condition** —
bind these and the next sweep finds sixty more at the next level of granularity,
because character classes, anchors, flags and thresholds multiply faster than
fixtures can be written. A round that ends when the reviewer runs out of ideas
is a round that never ends.

**So the unit of work is not a test. It is a DISPOSITION, and there are exactly
three.** For every unbound arm the review names, and for any you find yourself:

1. **BIND** — write the vehicle and the twin, and prove with a mutation that the
   twin must fire.
2. **DELETE** — remove the arm from the linter. **This option is live and it is
   the one nobody has considered.** An alternation arm that no real brief has
   ever exercised, that no test binds, and that nobody can name a use for is not
   coverage. It is decoration that reads as coverage, and it is the exact
   artifact class this host exists to refuse. Deleting it makes the linter
   smaller, the suite honest, and the next sweep shorter.
3. **RECORD** — keep the arm, do not bind it, and write down **who owns that
   decision and when it expires.** A recorded judgement with an owner and a date
   is a real disposition. An unowned note is not, and is not accepted here.

**THE SWEEP TERMINATES WHEN EVERY ARM HAS A DISPOSITION, NOT WHEN EVERY ARM HAS
A TEST.** That is the acceptance criterion for this round, and section 2 of your
report is where it is met or missed.

Every arm in `REVIEW1.md` section 4 must appear in that table. So must anything
you find that it did not.

## THE FLOOR — these seven get BIND, and DELETE is not available for them

These are not tail. Each is a live escape or a defect in the host's own
self-description, and the reasons are given so you can disagree in writing rather
than silently.

1. **`:138` prefix-versus-full authority equality, and `:133`'s 7-character
   lower bound.** The authority check is the single most load-bearing check in
   this file — everything else is scoped by it. The review supplies the vehicle
   and it invents nothing: the linter accepts a 7-to-40 character sha and the
   argument is a free string, so one existing object against its own prefix is
   the pair. Round 2 declined this as uncontrivable; that judgement was wrong,
   and the reviewer's phrase for it is *convenient, not sound as applied*.
2. **`:200`'s `n > 0` arm.** A `## Files` header with zero bullets. Under the
   correct code this refuses; under the mutation it passes, and file-list closure
   is defeated entirely. The vehicle is an existing green fixture with its
   bullets deleted.
3. **`:274`'s own-lines quote exclusion.** The comment at `:269-271` states the
   exclusion exists so a report name appearing only inside a quoted block does
   not count. **Nothing tests that.** A comment that claims a purpose with no
   control behind it, sitting inside the host built to mechanise that very
   class — this one is bound before any of the others.
4. **`:225`'s global flag, for the property rather than for the crash.** Removing
   it throws, so the suite goes red for the wrong reason. The property that
   matters is whether ALL stray paths in a sentence are collected or only the
   first, and no fixture carries two. A brief with two stray paths would have
   only its first caught today.
5. **`:338`'s six-line window and `:342`'s `git `-prefix exclusion.** Deferred by
   round 2 as buildable, confirmed unbound, and the review writes out both
   vehicles precisely enough to build.
6. **`:259`'s two boundary guards, each on its own.** The current green fixture
   has letters on both sides, so it proves the pair and neither side. Deleting
   either guard alone leaves the suite green. Two more greens — a letter on one
   side and a boundary on the other, then the mirror — bind each.
7. **The space arm at `:342`, on purpose rather than by accident.** See below;
   this one comes with a correction you must make.

## A TWIN THAT PASSES FOR A REASON ITS AUTHOR DID NOT INTEND

`RESULT2.md` section 4 claims that the short spaced phrase distinguishes the
length requirement from the space requirement. **It cannot, and the review proves
it:** the phrase is too short to survive the collection pattern at `:340-341`, so
it never reaches the `:342` filter at all. The space arm does turn out to be
bound, but incidentally — every pointer vehicle carries long backticked
`scripts/...` paths with no spaces, which the space filter normally discards and
which become collected failures the moment it is removed. **A base brief with
short paths would silently unbind it.**

**A TWIN THAT PASSES FOR A REASON ITS AUTHOR DID NOT INTEND IS BOUND TO THE BASE
FIXTURE, NOT TO THE CHECK.** Build a control that binds the space arm
deliberately, and while you are there: the length threshold has slack in both
directions and can be moved freely between 17 and 29 without any fixture
noticing.

**Two corrections are owed, and both must be written down.** Put the correction
in `RESULT3.md` section 1, and append exactly this as the **last line** of
`RESULT2.md`, changing nothing else in that file:

    CORRECTION 2026-09-10: section 4's claim about the short phrase is refuted; see RESULT3.md section 1.

Leaving the refuted claim standing while the correction lives somewhere else is
how a wrong statement outlives its own correction — do both halves.

The other fragile control is `scope: cited path without verb stays green`, which
does control its property but only because the cited path happens to contain a
word from the verb list. Swap the example path for one without such a word and
the twin proves nothing, silently. Pin the reason at the twin so a future edit
cannot take it away by accident.

## THE MUTATION CONTRACT — unchanged, and it now applies to deletions too

For every check you add or change: a vehicle that passes, a twin that fails, and
**a mutation of your own check that turns your own twin red** — applied, run,
restored, run again, all three states recorded, named precisely enough to
reapply.

A TWIN PROVES A CHECK CAN FIRE. ONLY A MUTATION PROVES IT MUST.

**And a deletion is a change to the linter, so it carries the same obligation in
reverse:** show that removing the arm leaves every remaining fixture green, and
say what would now pass that did not before. A deletion whose blast radius was
never measured is not a disposition, it is a hope.

**The linter's digest will move this round**, unlike round 2. Record it before
and after in your report. **Digest here means the SHA-256 of the file's bytes:
`Get-FileHash -Algorithm SHA256 <path>`, recorded in full.** Do not use
`git hash-object` for this — without `-w` it computes a value and writes nothing,
and a sha that resolves to nothing has already been recorded as evidence twice on
this project today.

**AND THE COUNT MATTERS MORE THAN THE DIGEST, because of something outside this
worktree.** The gate harness that runs before any of this merges carries a
**ratchet on the number of passing tests**: it compares against the last recorded
run and refuses on any decrease at all, and it appends nothing on a refusal, so
the baseline stays the last known-good number. **A DELETE disposition removes an
arm and the tests bound to it, so the count falls — legitimately — and no ratchet
can tell a correct deletion from a broken collection.**

So the deletions have to arrive carrying their own evidence:

- **the passing-test count before and after**, as `node --test` reports it;
- **every deleted test named**, one line each, beside the arm it was bound to.

"Some tests were removed" is not enough for this. The person who has to write the
exception line needs to name what went and why, and reconstructing that from a
diff after a refusal costs more than writing it down now.

## Scope

**Do not loosen a check to make a fixture pass.** If a check is wrong, that is a
finding and a disposition, argued in the report — not a quiet widening.

**Do not spell the guarded two-letter token.** The suite assembles it at runtime
from character codes and the reports match on the tail `outside a prohibition
line`. Neither your report nor any file you touch may spell it.

**Do not build the reviewer-side mutation harness.** A separate packet covers
generating controls from a merge-base diff. Note anything you learn about it in
your report; do not implement it.

## Files

Work only in these; a diff touching any other path is a scope finding.

- `scripts/brief-lint.mjs` — binds and deletions land here
- `scripts/brief-lint.test.mjs` — the vehicles, the twins and the mutation record
- `RESULT3.md` — (new) your report, in the repository root
- `RESULT2.md` — one appended line pointing at the correction in `RESULT3.md`

**Do not edit** `REVIEW1.md`, `RESULT1.md`, `package.json`, `runners.yml`,
anything under `data/`, `CLAUDE.md`, `AGENTS.md`, or any file under `openspec/`.

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
  between mutations**, and say whether the suite was green again after each
  restore. A result from an un-restored file is two mutations reported as one.
- Every date you write is this machine's LOCAL date.
- `node_modules` is deliberately absent and no dependency is needed. **Do not run
  `npm install`, `npm test`, the build, any `verify-*` script, the Pulse or the
  Desk.** `node --test` on `scripts/brief-lint.test.mjs`, and direct
  `node scripts/brief-lint.mjs` runs, are exactly right.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `RESULT3.md`

    # WISDOM PHASE 0 ROUND 3 — RESULT3

    ## 1. The two corrections owed to RESULT2 section 4
    ## 2. THE DISPOSITION TABLE — every arm in REVIEW1 section 4, plus any I found
    | file:line | arm | BIND / DELETE / RECORD | evidence, or owner + expiry |
    ## 3. Binds — vehicle, twin, and the mutation that proves the twin must fire
    | check | mutation | before | mutated | restored | digest identical |
    ## 4. Deletions — what I removed, what now passes that did not before
    | arm removed | tests removed with it | what now passes that did not |
    ## 4b. THE COUNT — passing tests before, passing tests after, difference
    ## 5. Records — each with a named owner and a date it expires
    ## 6. The linter's SHA-256 before and after
    ## 7. What I could not determine
    ## 8. Anything I learned about the reviewer-side harness, which I did not build
    ## 9. Blocked or refused calls

Section 2 is the acceptance criterion. An arm missing from it is an arm nobody
decided about, and this round exists to end that. Section 5 may be long and that
is a legitimate outcome — what is not legitimate is an arm that appears nowhere.
