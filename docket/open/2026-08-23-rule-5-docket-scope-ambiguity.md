---
track: build
filed-by: build
title: Get a maintainer ruling on whether CHARTER.md rule 5 (append-only) reaches docket/ items or only CHANGELOG.md
created: 2026-08-23
expires: 2026-11-21
serves: more-checkable
priority: 3
---

## Why now

CHARTER.md rule 5 reads, in full: "The record is append-only. No past entry
is rewritten, deleted, softened, or quietly amended. Corrections are new
entries that name what they correct." Rule 5's own text does not say what
"the record" is. The only place CHARTER.md itself narrows that phrase is
rule 13a's Reserved list (around line 321), which ties it specifically to
"the integrity of the record -- the append-only changelog (rule 5), the
review artifacts in `docket/reviews/`, the disclosure page, and the public
log" -- `docket/open/` and `docket/done/` are not named in that enumeration
at all.

Round 174 (`loop/build/first-screenful-density`) found a real 1-vs-0
discrepancy inside a docket item's own prose while closing it (the item's
"Why now" summary line said "1" content unit was visible on
`/model-retirement-calendar`; its own band-by-band breakdown two lines later
implied 0; the round's re-render found 0, agreeing with the breakdown). The
round left the wrong "1" standing in the closed item's prose and appended a
note below it explaining the discrepancy, reasoning this was required by
CHARTER.md rule 5. Adversarial review on that round
(`docket/reviews/29199487f4e02d502d4d66636883eb552b7deb97.md`, "The docket
item: convention, and the internal 1-vs-0 discrepancy") read rule 5's own
citation in the Reserved list closely and reached the opposite reading: "I'd
read CHARTER.md's text as more likely scoping 'the record' to the changelog
specifically, not docket items generally," and noted that the same round's
own act of closing the item -- ticking its checkboxes, appending a new
"Round ... status" section -- is itself an edit to the file, performed
without treating it as a rule-5 violation, which the review called "not
obviously consistent with the position that rule 5 forbids touching the
item's pre-existing prose." The review filed this as "a matter for the
maintainer to settle, not a functional or safety problem with what
shipped."

`docket/README.md` already states a position -- "The docket is a plan, not
the record, so items may be edited freely while they are open --
CHARTER.md rule 5 governs CHANGELOG.md, not this directory" -- but that
sentence is the loop's own unreviewed prose, not a maintainer ruling, and it
sits alongside a live, disclosed case (round 174's) where a round read the
same rule the other way and left a known-wrong number standing rather than
correct it in place. Two documents in this repository now disagree with
each other about the same rule's scope, and this round (`loop/build/nav-cue-
and-line-length`) was explicitly briefed not to resolve that disagreement
itself -- CHARTER.md rule 11 ("a run blocked by a guardrail may not be the
run that loosens it") and the general principle that a round should not be
the one settling a question about the boundaries of its own record-keeping
authority.

This item does not correct the "1" in the closed docket item, does not edit
`docket/README.md`'s stated position, and does not amend CHARTER.md rule 5
or 13a. It only asks the maintainer to say, once, which reading is correct,
so a third round does not re-derive the question from scratch or -- worse
-- act on whichever reading is convenient for the change it already wants to
make.

## Evidence

- `CHARTER.md` -- rule 5's own text (section II, "The record"), and rule
  13a's Reserved list, which is the only place "the record" gets narrowed to
  a specific enumeration of surfaces, `docket/` absent from it.
- `docket/README.md`, "The docket is a plan, not the record" (final
  paragraph) -- the loop's own stated position, not a maintainer ruling.
- `docket/reviews/29199487f4e02d502d4d66636883eb552b7deb97.md`, the section
  "The docket item: convention, and the internal 1-vs-0 discrepancy" --
  independent adversarial review reaching the narrower reading and flagging
  it as maintainer territory.
- `docket/done/2026-08-22-first-screenful-density.md` -- the live example:
  a wrong "1" left standing in closed prose, annotated but not corrected in
  place, under round 174's reading of rule 5.

## Done when

- [ ] The maintainer states, on the record, whether CHARTER.md rule 5's
      append-only requirement reaches `docket/open/` and `docket/done/`
      items, or is scoped to `CHANGELOG.md` (and the other three surfaces
      rule 13a's Reserved list names) only
- [ ] Whatever the ruling, a follow-up item (or this one, reopened) updates
      `docket/README.md` and/or `CHARTER.md` so the two documents agree,
      and -- if the ruling says rule 5 does not reach `docket/` -- corrects
      the standing wrong "1" in `docket/done/2026-08-22-first-screenful-
      density.md` per that ruling
- [ ] `node scripts/round.mjs check` green
