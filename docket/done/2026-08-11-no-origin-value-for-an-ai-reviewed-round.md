---
track: meta
filed-by: author
title: The three Origin values all describe human involvement — none describes a round an AI reviewed and a human never saw
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
---

## Why now

Round 80's Origin was assigned `supervised` by `scripts/round.mjs start`,
caught in review before merge, and corrected to `unsupervised`. Both labels
were the least-wrong of three, and neither describes what actually happened.

The three Origin values are all degrees of *human* involvement:

- `unsupervised` — a run that merged itself with nobody reading it first
- `supervised` — a human triggered the run and could veto before merge
- `maintainer` — a human decided what and why; an assistant did the typing

Round 80 was none of those. A model wrote it. A different, more capable model
reviewed the diff and independently verified the post's figures against the
primary sources before allowing the merge. No human saw either side. The
`supervised` label assigned at start was a lie about a human who was absent;
`unsupervised` is the honest choice available today only because its operative
clause — nobody could veto — is true, but it undersells the review that
actually happened. This is the same gap `2026-08-11-unsupervised-origin-assumes-scheduled.md`
describes, one round later: the label is assigned at start, before anyone
knows whether a veto will exist, and the set of values never anticipated a
model review of a model's work.

Whether a fourth value is wanted — one that names "an AI reviewed it and no
human saw it" as its own category — is the maintainer's decision, not the
loop's. The record and the site already state the facts in prose; what is
missing is a label that lets the site's disclosure badges and its "ran
unattended" count say them without a reader having to open the entry. This
item exists so that decision is made deliberately rather than by drift, and so
a future round does not quietly widen `ORIGINS` to a fourth value on its own.

## Evidence

Internal — this is a property of this repository's own records and labels:

- `app/lib/build-log.js` — `ORIGINS = ["unsupervised", "supervised", "maintainer"]`
  and the `declaredOrigin` split; the homepage's "ran unattended" count is
  derived from it.
- `app/components/AiDisclosure.js` — `ORIGIN_SENTENCES`, the published meaning
  of each value rendered on every page.
- `CHANGELOG.md`, round 80's entry — the Origin correction, which records the
  review path that no label describes.
- `docket/open/2026-08-11-unsupervised-origin-assumes-scheduled.md` — the
  prior finding that `supervised`'s operative clause is "can veto before
  merge" and that the label is assigned at start.

## Done when

- [x] The maintainer decides, in writing, whether the three Origin values
      suffice or a fourth (e.g. `ai-reviewed`) is added, and the decision is
      recorded in this item, in the changelog, or in an amendment — decided
      2026-08-11: a fourth value, named `delegated`, is added by the charter
      amendment in round 85 and defined there and in the round's entry
- [x] If a fourth value is added, the homepage's counts, `/log`'s badges,
      `/disclosure`'s meanings, and `scripts/check-routes.sh`'s assertions all
      render it without drifting — a value counted at build time but never
      rendered, or rendered but never counted, is the exact split the route
      checks already guard against elsewhere — done in round 85: the value is
      accepted by the build-log parser, labelled on the log badges and page
      disclosures, published on `/disclosure`, and covered by the no-Origin
      assertion, which was shown to still fail
- [x] If no fourth value is added, the record says why, and a round that has
      been AI-reviewed states the review path in its entry prose rather than
      leaning on a label that cannot carry it — not applicable: a fourth value
      was added

## Done

Decided and implemented in round 85 (meta), 2026-08-11. The maintainer decided
to add a fourth Origin value, `delegated`, defined as "the orchestrating model
chose this work, briefed it, reviewed it and merged it; no human saw it before
it landed". The decision and the definition are recorded in the charter
amendment's History entry and in the round's changelog entry, and the value is
propagated through the parser, the badges, the page disclosures, and the route
check.
