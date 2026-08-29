# pulse — delta for harden-seed-wave-guardrails

## ADDED Requirements

### Requirement: Declared corroborations are compared every run, and disagreement becomes work

The Pulse treats a source as truth by construction: it fetches, hashes, diffs,
and never adjudicates. That is right, and it is why nothing noticed when two
sources disagreed and the feed was the wrong one. Comparing a feed-bound value
against a cited value for the same quantity on the same entry is arithmetic, not
judgment, and it costs nothing on top of a run that already resolves both.

- Every Pulse run SHALL compare each pair declared by `corroborates` (see
  `wiki`), resolving the feed-bound side from the latest snapshot through the
  entry's declared row id and the fact's field path, and the cited side from the
  fact's written value.
- Where either side does not resolve — no snapshot yet, a vanished declared row,
  a field path absent from the row — the Pulse SHALL make no comparison and
  SHALL produce no finding. Absence is not disagreement; the vanished-row case
  already has its own rendering and its own repair finding, and reporting it
  twice under two names would make both less legible.
- Two resolved values SHALL be compared by: trimming, collapsing internal
  whitespace, and case-folding both; then extracting from each the first numeric
  magnitude with its optional currency symbol and optional `K`/`M`/`B`/`T`
  suffix. When both sides yield a magnitude they agree exactly when the
  magnitudes are equal; otherwise they agree exactly when the normalised strings
  are equal. There is no tolerance: a tolerance is a policy nobody has set, and
  the observed case (`284B` against `304B`) needs none.
- A disagreement SHALL enter the derived work queue as an item proposing a
  `verify` job, naming the entry, both fields, both resolved values, and both
  sources — the feed's registry id for one side and the cited `source_url` for
  the other, so the job begins with the two things it has to compare in front of
  it.
- The Pulse SHALL NOT edit either fact, mark either source authoritative, or
  fail the build on a disagreement. It reports that two sources disagree; which
  one is right is judgment, and judgment is a job.
- The item SHALL leave the queue when the values agree again or the
  `corroborates` declaration is removed, with no close or archive action by
  anyone — it is derived state like every other queue item and SHALL NOT
  accumulate.

#### Scenario: Two sources disagree and a verify job is proposed

- **WHEN** an entry's feed-bound `parameters` resolves to `284B total` and its
  cited `card_parameters` declaring `corroborates: parameters` says `304B params`
- **THEN** the next Pulse run's queue carries a `verify` item naming the entry,
  both fields, both values and both sources, and neither fact is changed

#### Scenario: The Pulse does not pick a winner

- **WHEN** a declared pair disagrees
- **THEN** the feed-bound fact still renders its source's value verbatim, the
  cited fact still renders its own, and the build succeeds

#### Scenario: A vanished row is not a disagreement

- **WHEN** a declared row id is absent from the latest snapshot, so the
  feed-bound side of a declared pair does not resolve
- **THEN** no corroboration finding is produced, and the existing vanished-row
  rendering and repair finding are what report it

#### Scenario: Agreement empties the item

- **WHEN** the source is corrected so both sides resolve to the same magnitude
- **THEN** the next run's queue no longer contains the corroboration item
