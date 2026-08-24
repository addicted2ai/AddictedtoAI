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

## Appended by round 176 (`loop/build/governance-claims`): the same rule, one surface closer in

Round 176 had to correct "A human wrote the first commit" in three places,
one of which is `CHANGELOG.md`'s own **preamble** -- the text above the Log
heading, not a dated entry. Its brief pointed at this item as "the open
question here". It is not: this item asks whether rule 5 reaches `docket/`,
and says nothing about the preamble. That is a neighbouring question about
the same rule, and it is better answered in the same ruling than by a
near-duplicate item.

Round 176 concluded the preamble is **outside** rule 5 and **inside** rule 4,
edited it in place, and wrote the reasoning into the preamble itself rather
than leaving it in a changelog entry nobody will re-read. The reasoning, so
the maintainer can disagree with something specific:

- Rule 5's text protects past *entries*. The preamble contains none: no
  date, no round number, no hypothesis or result.
- It is not published at `/log`. `app/lib/build-log.js` parses only what
  follows the Log heading, so the preamble is repository text, not site text.
- It is a live description of the file's own conventions, which rule 4
  ("Never publish a claim about this project's own process that is not
  currently true ... This document is not exempt") requires be current.
- It has already been edited in place by rounds that did not treat it as a
  violation: the `delegated` Origin was added to its enumeration on
  2026-08-11 (`git log -S "the orchestrating model chose, briefed, reviewed
  and merged it; no human saw it before it landed" -- CHANGELOG.md` ->
  `8cec1ef`, PR #34).
- `scripts/check-origin-definitions.mjs` already asserts the preamble
  against the *current* code as one of six surfaces that must agree, which
  is only coherent if the preamble is meant to change with the code.

Round 176 acted on that reading rather than leaving three files false, and
records it here so a maintainer ruling can cover both surfaces at once. If
the ruling goes the other way, the preamble edit is a correction to reverse,
not a silent one to find.

## Done when

- [x] A ruling is stated, on the record, whether CHARTER.md rule 5's
      append-only requirement reaches `docket/open/` and `docket/done/`
      items, or is scoped to `CHANGELOG.md` (and the other three surfaces
      rule 13a's Reserved list names) only. Stated by round 184 under the
      delegation (`FRAME.md` fact 7), not by the maintainer -- this item's
      own title asked for the latter; see the status section below,
      including its rule-11 answer, for why that was not required
- [x] The same ruling says whether rule 5 reaches `CHANGELOG.md`'s preamble
      (the text above the Log heading) or only the dated entries below it --
      see the round-176 section above, which acted on the second reading
- [x] Whatever the ruling, a follow-up item (or this one, reopened) updates
      `docket/README.md` and/or `CHARTER.md` so the two documents agree,
      and -- if the ruling says rule 5 does not reach `docket/` -- corrects
      the standing wrong "1" in `docket/done/2026-08-22-first-screenful-
      density.md` per that ruling
- [x] `node scripts/round.mjs check` green

## Round loop/build/rule-5-docket-scope-ruling status (2026-08-24, build)

Moved to `docket/done/`. This round's diff was reviewed and returned
request-changes; the central ruling below was confirmed independently by
the reviewer from `CHARTER.md`'s own text, and nothing here reverses it.
What follows is the corrected reasoning and disclosure the review required,
not a different conclusion.

**Delegated, not maintainer-reserved.** `FRAME.md` fact 7 (`verified`;
`node scripts/check-frame.mjs`) states rule 13a reserves the *integrity* of
the record -- not the interpretation of what "the record" is -- plus the
stop mechanism and the unchanged rule-13 items. "Everything else... this
charter... is delegated." That establishes *who* may decide this question;
it is not itself the answer, and is not treated as one below.

**The textual case for the answer.** Rule 5's own text is the stronger
argument, not rule 13a's silence: "No past *entry* is rewritten...
Corrections are new *entries* that name what they correct." A docket item
is never called an entry anywhere in this repository's own vocabulary --
only a changelog record is. Rule 13a's Reserved list is a second,
independent signal: it is the only place the charter narrows "the record"
to specific surfaces, naming exactly four tied to rule 5 -- the append-only
changelog, the review artifacts in `docket/reviews/`, the disclosure page,
and the public log -- `docket/open/` and `docket/done/` absent. `CHARTER.md`
uses the phrase "the record" 12 times (`grep -in 'the record' CHARTER.md`).
Three are the passages already central to this ruling (the section
heading, rule 5's own text, rule 13a's Reserved list). Of the remaining 9:
7 resolve to changelog entries/write-ups (rule 8 twice, the "Audit is the
only track that can say no" prose just below the track table, rule 16,
rule 22, and twice in "the second demonstration"); 2 -- both inside rule
13a's own later paragraphs -- use "record" in a generic documentary sense
(this document's own History account; this project's `git log` evidence),
not meaning `CHANGELOG.md` specifically. None resolve to `docket/`. Both
signals point the same way: rule 5's append-only force does not reach
`docket/open/` or `docket/done/`.

**What licenses editing docket items is rule 5's absence, not rule 4's
presence.** Rule 4 covers "a claim about this project's own *process*" --
the loop, review, cadence, supervision, guardrails -- not any live
description. Most docket prose (evidence, measurements, editorial
reasoning) is not a process claim, so rule 4 does not affirmatively require
this directory stay current the way it does the changelog preamble
(round 176's reasoning, which really is a process claim -- who reviewed
what, whether a human saw it). What actually permits editing `docket/`
freely is that nothing in `CHARTER.md` forbids it once rule 5 is read not
to reach it.

**Rule 11.** This item's own "Why now" invoked rule 11 by name, plus "the
general principle that a round should not be the one settling a question
about the boundaries of its own record-keeping authority," and warned
against a future round that would "act on whichever reading is convenient
for the change it already wants to make." That is a real, on-point warning
and this round is close to the shape it names: it wanted to correct the
"1," and it is the round that decided the rule blocking that correction
does not apply. Read literally, rule 11's predicate is a run *blocked* by
a guardrail loosening it -- this round was not blocked, it took the
question up as assigned work, and it does not amend `CHARTER.md`, only
reads it -- so this is not a clean rule-11 violation. But the item's
broader concern, self-interested interpretation, is squarely raised and
deserves an answer regardless of the technical predicate, not a pass on a
technicality.

The answer: the reading is not this round's alone. Two reviews with no
stake in this round's convenience read the same text independently and
reached the same conclusion. `docket/reviews/29199487f4e02d502d4d66636883eb552b7deb97.md`
-- written reviewing round 174's work, before this item was even filed --
read the same clause and concluded "I'd read `CHARTER.md`'s text as more
likely scoping 'the record' to the changelog specifically, not docket items
generally." And this round's own diff was independently re-derived and
confirmed by adversarial review before any of it reached `main`
(`docket/reviews/39a3b78e493789b595956399e5617d2e07858b48.md`) -- the
mandatory "a model that did not do the work" gate every delegated round
requires (`docket/README.md`, "Reviews"). Neither review was asked to
agree; both did, from the primary text, not from this round's account of
it.

A cleaner alternative was available and is weighed here rather than
dismissed by default: issue the ruling and let a later round apply it to
the density item, spending one more docket round for the same protection
this project's mandatory pre-merge review already provides on this round
-- nothing merges without that independent read regardless of how many
rounds the work is split across. Proceeding in one round was the call
made; the review gate is what checks it, not this round's own say-so, and
it did not wave the ruling through unread -- it returned request-changes
on the disclosure while confirming the ruling on the merits.

**`docket/README.md`'s wording is widened, not confirmed.** It previously
said items may be edited "while they are open"; round 174 relied on that
qualifier by name to justify leaving this item's own "1" standing at close
(`CHANGELOG.md`, 2026-08-23). `docket/README.md` now widens the stated
position to open *or* done on the textual case above, and says so as a
change rather than as prior agreement.

**Chronology, corrected.** Round 174 (`ddffff7`, 2026-08-23 10:00:53) gave
its own reason for leaving the "1" standing, frozen by rule 5 in its own
`CHANGELOG.md` entry: "the docket is a plan and may be edited freely while
open, but this item is closing this round, not staying open for a retype."
A decision made, not deferred -- not pending any ruling, because this item
did not exist yet. It was filed by round 175 (`c5ff46b`, 2026-08-23
12:54:17, `loop/build/nav-cue-and-line-length`) almost three hours later,
after observing the disagreement round 174's choice created with
`docket/README.md`'s stated position.
`docket/done/2026-08-22-first-screenful-density.md` and this round's
`CHANGELOG.md` entry are corrected to say so.

**Both surfaces this item asked about are covered by one ruling**, per the
round-176 section above: `CHANGELOG.md`'s preamble stays outside rule 5
(already ruled and acted on -- not touched again here) and `docket/` stays
outside rule 5 (ruled here). The standing wrong "1" in
`docket/done/2026-08-22-first-screenful-density.md` is corrected in place
(now "0", folded into the six-of-seven-pages group). Full reasoning and
verification commands are in this round's `CHANGELOG.md` entry.
