# ROUND 4 — the last one, and it ends in dispositions rather than in tests

authority: two-desks-work-orders-and-trains@a5e873b

The sealed review of round 3 returned **revise**, and it is the most useful
artifact this packet has produced. It also contains one claim that is wrong, and
correcting it is the first thing in this brief because building on it would send
you at a problem that does not exist.

**THIS IS THE LAST ROUND.** It ends when every arm named below has a
**disposition** — bound, deleted, or recorded with an owner and an expiry — not
when every arm has a test. A sufficiently determined reviewer can extend this
forever, and a round that ends when the reviewer runs out of ideas never ends.

## FIRST: a claim in the review is wrong, and I measured it rather than argued it

The review reports the zone control as carrying two defects: **time-brittle**
(true) and **platform-brittle**, on the grounds that *"Windows Node does not
provide POSIX TZ semantics"* and that an override *"never tainted direct or child
in any probe"*.

**Windows Node honours `TZ` correctly.** Measured on this machine, node v24.13.0,
at 05:21 local:

    no override              getters 2026-09-10   offset 360
    TZ=Pacific/Niue          getters 2026-09-10   offset 660
    TZ=Pacific/Kiritimati    getters 2026-09-11   offset -840

Kiritimati moves the date. Niue moves the **offset** from 360 to 660 and leaves
the date alone **because Niue is genuinely on 2026-09-10 at that hour** — an
override working perfectly produces exactly the reading the review recorded.

So the review had **one observation and offered two causes, and the first
explains it completely**. Its own section 7 says so — *"whether the zone control
ever passes on this Windows machine… I did not run on POSIX"* — while section 3
states the platform claim as a finding. Take section 7's version.

This matters more than a correction usually would, because of the direction it
points: a platform claim would make the caller-override threat look **inert on
this machine**, and a threat that looks inert is one somebody stops guarding
against. **A false finding that argues a guard is unnecessary is the most
expensive kind to get wrong.**

## THE ZONE CONTROL — the design is settled and I have run it

The control's real defect is that it can only observe its property while two
zones are on different calendar dates. `Pacific/Niue` and this machine share a
date for **19 of every 24 hours** — measured by walking a local day in ten-minute
steps. The suite was green when it was committed and red fifteen minutes later
with no edit in between.

**Do not repair this by choosing a different fixed zone.** Every fixed pair has a
window; `Etc/GMT+12` merely moves the edge to 05:50. The split below is settled,
and I built and ran it before writing this down:

**(a) "an override reaches a direct read" is separable and needs no clock.**
Format a **fixed instant** under two zones that differ at that instant. Verified:
`2026-01-01T06:30:00Z` reads `2025-12-31` in `America/Denver` and `2026-01-01` in
`Pacific/Kiritimati`. Deterministic at every hour of every day.

**(b) "the live wall ignores the override" genuinely needs a real now**, so it
must **select** a zone at run time whose current date differs from the system
date, and **refuse** when it can find none. A control that cannot find its own
instrument must fail, never skip — a skip reads as a pass. Verified across all
144 ten-minute instants of a local day: **0 instants with no instrument
available**, `Pacific/Kiritimati` chosen at 120 and `Etc/GMT+12` at 24. Those two
are complements rather than alternatives — GMT+12 covers exactly Kiritimati's own
four-hour hole.

**(c) The refusal in (b) cannot be reached by waiting**, because candidates
spanning both directions always leave one available. So it ships unproved unless
you **force** it. Force it and show it: a candidate list containing only the
system zone must refuse.

**Order any candidate list EASTWARD**, and this is not a style note. Two sessions
independently reached for zones in the 4-to-6-hour band and neither considered
the 15-to-20-hour band, because *a different date* gets searched as *far away*,
far away reaches west, and from UTC-6 every wide instrument is east. Measured:
Kiritimati 20.0 hours, Apia 19.0, Tokyo 15.0, against GMT+12 6.0, UTC 6.0, Niue
5.0, Midway 5.0, Honolulu 4.0.

**And write down WHY the fixed pair in (a) differs at that instant**, in the
test, beside the constant — the offsets and the date-line crossing. Otherwise the
next reader sees two zone strings and a date and cannot tell whether the pair was
chosen or inherited, and the same bad pool re-forms in that gap.

One more, taken from the same source: **a control that establishes its own
baseline must refuse to claim it detected anything on its first run.** A first
run cannot detect drift, and one that reports *no drift* is an echo.

## THE CLASS FOR THIS ROUND — and it cannot be closed, only priced

The review's class, which was the one I set it: **a legitimate-looking edit to
one side of a pair, with the other side re-derived from it.** Its enumeration,
each built and run:

- **Careful deletion.** Remove a record, update the count, the identity list, the
  map entry and the batch pins together. Suite stays green. The count that
  follows is a number with the guard removed.
- **Careful anchor substitution.** Replace one record's anchor with another
  record's anchor in both the map and the records. Each string still occurs a
  single time, so counts agree twice, ties agree, everything is green — and the
  arm the first record claimed now stands unguarded while the second stands
  guarded twice.
- **Order is furniture.** The identity list is compared with `includes` and never
  by order, while a comment calls it ordered identity.
- **Narration drifts silently.** The test's own display name says twenty-two and
  nothing compares it to the constant. The header comment says the same and
  comments never run.
- **The spawned helper's source is unpinned.** No record anchors it, so rewriting
  it to read UTC, or to return a fixed past date, passes.

**You will not close this class and you are not being asked to.** The review's
own soundest sentence is that the second map is worth keeping *even though it is
a second source*, because **it raises the cost of the careful edit from one place
to two.** That is the right frame and it is the one to work in:

**A REMEDY THAT CAN BE PERFORMED WITHOUT KNOWING ANYTHING IS A LAUNDERING PATH;
A REMEDY THAT CARRIES A COST IS NOT.**

So for **every pair** in the enumeration — the ones above and any the sweep adds
— give a disposition, and there are exactly three:

1. **RAISE THE COST** — make the careful edit touch one more place, or derive one
   side from the other so there is no second place to keep in step. Deriving is
   strictly better than pinning where it is available; a name computed from the
   constant cannot drift from it.
2. **DELETE** — an arm no real edit exercises, that nothing binds, and that
   nobody can name a use for is not coverage, it is decoration that reads as
   coverage.
3. **RECORD** — with a named owner and a date, saying plainly that the cost is
   one edit and that review is what stands behind it.

**Unowned prose is not a fourth option.** A sentence in a report that nobody
re-reads is the thing this host exists to refuse.

State for each which you chose and why. **A row saying "recorded, cost is one
edit, review carries it" is a complete answer** and costs you nothing; a row that
claims a bind it did not build costs the round.

## Scope

- **Do not convert any date read to UTC.** A wall reading a different calendar
  from the corpus it guards is a second convention, and two conventions are what
  the convention exists to prevent. This is not available as a remedy and is not
  a finding.
- **Do not change the system-zone dependence.** It is filed repository-wide and
  is explicitly not this packet's.
- **Do not touch `scripts/brief-lint.mjs`** except to restore it after a
  mutation. The packet's standing claim is that the records file moves and the
  linter does not; its digest must be unchanged at the end.
- **Do not run the Pulse, the Desk, a build, any `verify-*` script, or the whole
  suite.** `node --test` on the one file, direct linter runs against briefs you
  build under the OS temp area, and temp helpers are exactly right.
- Keep an untouched copy of every file you mutate under the OS temp area, restore
  between mutations, and report whether the suite was green again after each.
- **The baseline is currently 24 pass 1 fail**, and the one failure is the zone
  control this round repairs. Say what your baseline was before you start and
  what it is at the end.

## Files

Work only in these; a diff touching any other path is a scope finding.

- `scripts/brief-lint-records.test.mjs` — the zone control, the dispositions, and whatever a raised cost needs
- `RESULT4.md` — (new) your report, in the repository root beside the three before it

**Do not edit** anything under `lib/`, `loop/`, `pulse/`, `app/`, `tools/`,
`content/`, `data/`, `wisdom/` or `openspec/`, and not `package.json`,
`runners.yml`, `CLAUDE.md` or `AGENTS.md`.

## Ground rules (non-negotiable, and they do not carry over from anywhere)

- **Never use the token `cd` anywhere** — not in a command, not in a comment, not
  as a shell function name. A guard matches the token and not the intent.
  Absolute paths, and `git -C <dir>` for git.
- Keep command strings short; write a `.mjs` under the OS temp area and run it
  rather than passing a program on the command line.
- **Never manipulate or print a credential**, including a partial token.
- **A blocked or refused command is REPORTED, not routed around.**
- **Do not truncate the output of anything you use as evidence.** Nothing piped
  into a pager and no count limit on a command whose job is to enumerate.
- Every date you write is this machine's LOCAL date.
- No `git push`, no `gh`, no `bd` write commands, no commits.

## Your report — `RESULT4.md`

    # THE RECORD EXPIRY CHECK — RESULT4

    ## 1. THE DISPOSITION TABLE — every pair, and which of the three it got
    | pair | disposition | what it now costs to defeat | ran |
    ## 2. The zone control — the two halves, and the forced refusal
    ## 3. What I derived rather than pinned, and what could not be derived
    ## 4. The mutations — every one, including those that changed nothing
    | arm | mutation | before | mutated | restored | went red |
    ## 5. What this file still does NOT catch, said plainly
    ## 6. What I could not determine
    ## 7. Blocked or refused calls

**Section 1 is the acceptance criterion and it is graded on completeness, not on
how many rows say BOUND.** Every pair gets a row. A row reading *recorded, cost
is one edit, review carries it* is a complete answer.

Section 2 must show the forced refusal actually firing. **A branch that cannot be
reached by waiting must be reached by forcing, and a branch nobody has reached is
a branch nobody has run** — however obviously correct it looks in the source.
