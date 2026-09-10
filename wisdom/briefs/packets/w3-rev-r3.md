# ROUND 3 — the class was named, one instance of it was closed, and the rest of the class is still open

authority: two-desks-work-orders-and-trains@a5e873b

Round 2 was strong and the sealed review says so: five things are load-bearing
and survived adversarial re-runs, and the review names them so nobody narrows
them by accident. The identity pin, the strict inequality, the expiry boundary,
the naming, the live-versus-effective split and the one twin all hold.

Then it found a second way to green the whole wall at one stroke.

## What was measured, and I re-ran it myself before writing this

Move one record's expiry into the past — genuinely past, not pinned — and the
live check refuses, as it should. Then set a time zone in the environment.

    B6trim expiry 2026-09-09, nothing else changed
      no zone set          12 pass, 5 fail   the live check REFUSES
      TZ=Pacific/Niue      14 pass, 3 fail   the live check PASSES
      TZ=Pacific/Midway    14 pass, 3 fail   the live check PASSES
      TZ=Etc/GMT+12        14 pass, 3 fail   the live check PASSES

Three zone values green a wall that is really expired. Restored, 17 pass 0 fail,
byte-identical.

## THE RULING, WHICH IS ABOUT MY OWN BRIEF AND NOT ABOUT YOUR WORK

Round 2's brief named the class in these words: **an environment variable that
greens every record at one stroke.** You closed the variable it named, correctly
and provably — I verified that repair by mutation and it is load-bearing, a
genuinely expired record now refuses even with the old pin set to a rescuing
day. **That result is correct and it answered a smaller question than the one
the class asks.**

**A FIX AIMED AT THE NAMED INSTANCE LEAVES THE CLASS OPEN, AND EVERYONE INVOLVED
READS THE CLOSED INSTANCE AS THE CLOSED CLASS** — the author, the verifier and
the reviewer of the round before. My verification had a list with one item on
it and I never asked what a list of one is missing, in the same hours I was
writing down that the first question about any list is what shape of defect
would not appear on it.

So the class is restated, wider, and it is the round's subject:

**THE CLASS: any state outside this file that changes a check's verdict without
the file being edited.** Not environment variables — that word is what made the
first version too narrow. Ambient state: the environment in every form, the
working directory, the machine's configuration, the locale, the clock, argv,
anything a process inherits.

**Sweep it and report the enumeration.** For each thing you find: does it change
a verdict, in which direction, and can the file refuse it. The zone is the
instance in hand and it is the FLOOR, not the list.

## What the wall must hold when you are done

**The verdict of the live expiry check is a function of this file's contents and
the machine's real calendar, and of nothing a caller supplies.** Where you
cannot make that true, say which input remains and why, in the source.

One constraint on the repair, because it is easy to fix this the wrong way: the
corpus convention is deliberately the LOCAL date of the writing machine, argued
at length in `CLAUDE.md` and already paid for in a night of split dates. **Do not convert this file
to UTC to dodge the problem.** A wall that reads a different calendar from the
corpus it guards is a second convention, and two conventions are what the rule
exists to prevent.

The repository-wide half of this is not yours: four non-test files derive a
local calendar date and every date they write is zone-dependent. That is filed
as its own issue and this round does not touch it. **Your scope is this file.**

## The two controls that are furniture

The review broke each and the suite stayed at 17 pass, 0 fail:

- `localToday` replaced by a fixed past date. Nothing reds. The live wall passes
  because the fixed date precedes every expiry, the live-ignores-pin control
  passes because both its arms read the same broken value, and the pinned
  control passes because both arms agree.
- `shapeBad`'s `seen` set moved inside the loop, so duplicate detection is
  blinded. Nothing reds, because the duplicate control exercises `shapeErrors`
  directly with its own external set and never goes through the shared path.

**A CONTROL THAT CANNOT GO RED FOR ITS OWN SUBJECT IS FURNITURE, AND IT READS AS
COVERAGE IN A TABLE.** Both of these were listed in your sweep as bound.
`RESULT2.md` states that controls are terminal binders whose colour change is
itself the proof and that no further layer is required or the regress never
ends. **That is true where a binder exists and it is not an argument that one
does** — for these two the regress ended by stipulation. Bind them or say what
makes them unbindable.

## The record's fields, and which ties are worth building

The review swept all six and found only `anchor` to `expect` tied. The rest
survive substitution at 17 pass, 0 fail: `id` swapped between two records of the
same batch, `owner` rewritten, `reason` replaced with plausible filler,
`anchor` and `expect` moved together to a different arm at the same count.

**Build the ties that are mechanisable and say plainly which are not.** A tie
between a record and its own prose is not mechanisable and pretending otherwise
would be worse than the gap; a tie that keeps a record pointing at the arm its
own identity claims may be. Report which you built, which you judged
impossible, and for the impossible ones what a reader is therefore trusting.

## THE DISPOSITION CHANGE, WHICH IS MINE AND CHANGES THE COUNT

`I4star` and `J2star` are not records. **They are binds nobody attempted.**

Their reasons say the arm has no colour change because a sibling conjunct
refuses the same input anyway. That is true of the **exit status** and false of
the **detail line the check already prints** — `numbered=... bare=...` and its
review-branch twin. `I4star`'s own reason names the twin that would bind it and
then files a record regardless.

**TWO CONJUNCTS THAT REFUSE THE SAME INPUT CANNOT BE BOUND SEPARATELY BY A TWIN
THAT ASSERTS THE EXIT STATUS, BECAUSE THE STATUS IS IDENTICAL WITH EITHER ONE
ALONE. THEY ARE BINDABLE ONLY AGAINST A DIFFERENT OBSERVABLE**, and that
observable is already being printed.

Build both twins against the detail line. **If a twin binds, remove its record
and update the count and the identity list in the same edit with the
justification in the file.** If a twin cannot be built, leave the record and say
what stopped you. The count is a consequence of that work and not a target: do
not edit it to a number I have named.

Two reasons get re-decided rather than rewritten, and these are mine, so
transcribe them exactly as given:

- `G7hy` — replace the reason with: **"KEEP. Deleting the hyphen from the class
  makes a hyphen a word boundary, so any kebab-case identifier carrying these
  two letters as a segment newly refuses, and it catches nothing real: a token
  flanked by hyphens is an identifier and not a command. Re-decided 2026-09-10
  from the arm rather than from the previous reason."**
- `G8sent` — replace the reason with: **"KEEP. The cost sits in the exclusion,
  not the match. Evaluated per physical line, a prohibition that wraps between
  the excusing word and the token refuses falsely; evaluated per sentence, the
  false refusal goes and a `never` anywhere in a sentence excuses a token
  anywhere in it. A whitelist evaluated over a longer unit is a larger
  whitelist, so the tighter unit wins: a false refusal is visible and costs one
  edit, and the hole is invisible. Re-decided 2026-09-10."**

## Scope

- **Do not lengthen or re-derive the anchors.** Round 2's ruling settles it and
  the review confirmed the gap is structural.
- **Do not change any existing check in `scripts/brief-lint.mjs`**, and do not
  change any disposition, date or owner other than the four named above.
- **Do not run the Pulse, the Desk, a build, any `verify-*` script, or the whole
  suite.** `node --test` on your own file and direct `scripts/brief-lint.mjs`
  runs are exactly right.
- **Do not spell the guarded two-letter token.** Assemble it at runtime from
  character codes, as the existing suite does.
- Keep an untouched copy under the OS temp area, restore from it between
  mutations, and say whether the suite was green again and the file
  byte-identical after each restore.

## Files

Work only in these; a diff touching any other path is a scope finding. A
mutation you apply, run and restore byte-identical is not a diff.

- `scripts/brief-lint-records.test.mjs` — the sweep, the zone repair, the two furniture controls, the field ties, the two twins and the two re-decided reasons
- `RESULT3.md` — (new) your report, in the repository root

**Do not edit** `scripts/brief-lint.mjs`, `scripts/brief-lint.test.mjs`,
`RESULT1.md`, `RESULT2.md`, anything under `wisdom/`, `lib/`, `loop/`, `pulse/`,
`app/`, `tools/`, `content/`, `data/` or `openspec/`, and not `package.json`,
`runners.yml`, `CLAUDE.md` or `AGENTS.md`.

## Ground rules (non-negotiable, and they do not carry over from anywhere)

- **Never use the token `cd` anywhere** — not in a command, not in a comment,
  not as a shell function name. A guard matches the token and not the intent.
  Absolute paths, and `git -C <dir>` for git.
- Keep command strings short; write a `.mjs` under the OS temp area and run it
  rather than passing a program on the command line. **Do not compose a
  throwaway one-liner that chains a real command to an echo describing it** —
  that shape caused real damage elsewhere tonight, because the echo said one
  thing and the command did another.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you use as evidence.**
- **Every time you write is a clock you actually read**, by its own call, in the
  turn you write it. A time recalled from your sense of elapsed minutes is a
  fabrication nothing downstream can detect.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `RESULT3.md`

    # THE RECORD EXPIRY CHECK — RESULT3

    ## 1. THE SWEEP — every ambient input, and whether the file can refuse it
    | input | changes a verdict | direction | refused now | or: why not
    ## 2. The zone, closed — what the live check now depends on, and what it does not
    ## 3. The two furniture controls — bound, or why unbindable
    ## 4. The record's fields — ties built, ties judged impossible, what a reader trusts instead
    ## 5. I4star and J2star — the detail-line twins, and what the count became
    ## 6. The two re-decided reasons, transcribed
    ## 7. The mutations — one per check added or changed
    | check | mutation | before | mutated | restored | files identical |
    ## 8. What the mechanism still does NOT catch, said plainly
    ## 9. What I could not determine
    ## 10. Blocked or refused calls

Section 1 is the acceptance criterion and section 8 costs you nothing. **The
round before this one closed the instance its brief named and reported the class
closed, and three separate parties read it that way** — so a claim of closure
here will be tested by someone who has already made that exact mistake.
