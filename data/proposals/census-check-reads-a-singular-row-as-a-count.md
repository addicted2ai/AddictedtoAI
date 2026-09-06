---
date: 2026-09-06
slug: census-check-reads-a-singular-row-as-a-count
type: machinery
summary: >
  `lib/snapshot-census.mjs`'s `CENSUS_RE` allows up to three words between a
  number and the unit `rows?|listings?`, and does not care whether the unit is
  singular and indefinite. So "None of the three has a router row" — a sentence
  in which the number counts models, not rows, and "a router row" is one
  hypothetical row — matches, is scoped in by the word `catalog` elsewhere in
  the section, finds no anchoring date, and fails the BUILD as an unanchored
  census. This job would add the narrow exclusion the shape needs (a unit
  preceded by `a`, `an` or `its own` is not a count) with tests for the three
  measured instances and for the real censuses the module's own tests already
  pin, so the check keeps catching what it was built for.
evidence: >
  Measured in this worktree on 2026-09-06 while writing `content/wiki/org/
  nous-research.md`, which hit it as a build error and was rephrased to get
  past it. Calling `scanSnapshotCensus(body, 1, '2026-09-05')` directly:
  "None of the three has a router row, and the catalog says so." -> one hit,
  `undated:three has a router row`; "None of the four carries a listing in that
  snapshot." -> `undated:four carries a listing`; "None of the three has its own
  row in the catalog." -> `undated:three has its own row`. The control "The
  router lists none of them, and the catalog agrees." -> zero hits, which is
  the rephrasing that unblocked the build. None of the three flagged sentences
  states a row count, so no date could ever anchor them and the `undated`
  advice ("date it against the snapshot ... or drop the exact figure") names a
  repair that does not apply. The module's header at
  `lib/snapshot-census.mjs:135-147` enumerates what the check MISSES and
  records nothing it over-catches, so this class is undocumented as well as
  unfixed; the corpus is green today only because no shipped page happens to
  use the shape.
proposed_by_job: j-20260906-03
proposed_by_type: entry
---

The cost is not the corpus, which is green. It is per-author and it is paid in
the worst currency: a build error whose stated repair is impossible, met by a
job with no session, no memory and a wall-clock cap. The two exits are to
rephrase correct prose until a regex stops matching it — which is what this
entry did, and which quietly moves the corpus's voice toward whatever the
pattern happens to allow — or to spend budget reading the module to discover
that the sentence was never a census at all.

The fix is small and stays inside the module's own design. `CENSUS_RE` already
carries two measured exclusions written exactly this way — `(?!['’])` after the
unit, because `row's` is a possessive singular naming one row, and
`(?<!factor of )` before the number, because a ratio counts factors. Both were
added for the same reason: a singular, specific `row` is not a count. `a row`,
`an entry's own listing` and `its own row` are the same observation one
determiner over, and the module's header already argues the principle it needs
("a number immediately before a duration noun is counting TIME, not rows").

Two things worth pinning in the tests beyond the three sentences above. First,
the exclusion is `a`, `an` and `its own` and not a general determiner sweep:
"thirteen of the sixteen rows" and "fourteen of its sixteen rows" are real
corpus shapes the header names, and `the`/`its` before a plural unit must keep
matching. Second, the fix must not clear the shapes the module's existing tests
assert, which are the three historical defects it was built from — a check that
goes green on its own regression corpus has been switched off, which is the
outcome `lib/snapshot-census.mjs:88-92` refuses for the hedge branch and should
refuse here for the same reason.
