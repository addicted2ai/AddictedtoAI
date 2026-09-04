---
date: 2026-09-04
slug: deferred-expiration-dates-emit-no-signal
type: machinery
summary: >
  Teach the Pulse to record when a row's `expiration_date` moves while the
  status it derives does not — the case that today produces no change record,
  no queue item and no mark on any page. `expiration_date` is not a material
  field on `openrouter-models`; it is the sole input to that source's
  `status_rule`, so a diff is emitted only when the derived status crosses a
  boundary. A vendor pushing a death date back a week therefore changes the
  one value every retirement forecast in `data/changes.jsonl` is written
  against, and nothing observes it. The machinery job would emit a schedule
  record (or, more cheaply, a queue finding) when a non-null
  `expiration_date` changes to a different non-null value on a row the
  corpus carries, so that an annotation forecasting `retired` on a date
  becomes re-checkable when that date moves. It should not turn the field
  into an ordinary material field: a date move is not a lifecycle event and
  does not belong on the front page beside real ones.
evidence: >
  Measured on this branch on 2026-09-04 by walking every committed version of
  data/sources/openrouter-models/latest.json with `git show` from a Node
  script (execFileSync, per the MSYS note in CLAUDE.md).
  `nex-agi/nex-n2-mini` and `nex-agi/nex-n2-pro` carry `expiration_date` null
  in the 2026-08-28 through 2026-08-31 snapshots, "2026-09-04" in the
  2026-09-01 snapshot, and "2026-09-08" in the 2026-09-02, 2026-09-03 and
  2026-09-04 snapshots. Against that, data/changes.jsonl holds exactly one
  change record for each row — the 2026-09-01 `status` flip active ->
  deprecated — and nothing at all for the four-day deferral on 2026-09-02;
  data/derived/feed-rows.json reads `"$status":"deprecated"` for both rows at
  `"$as_of":"2026-09-04"`. data/sources/registry.json's `openrouter-models`
  entry lists material_fields price_input, price_output, context_window and
  status, and carries `expiration_date` only as its `status_rule.path`, which
  is why the move emitted nothing. The consequence is already in the log: the
  annotations written by j-20260901-08 and j-20260901-09 both close "the same
  rule derives `retired` once 2026-09-04 passes", and on 2026-09-04 both rows
  are listed and derive `deprecated`.
proposed_by_job: j-20260904-33
proposed_by_type: repair
---

The finding this job cleared was a phrasing defect, and the fix was a phrasing
fix: one annotation's retirement forecast now reads as conditional on its date
holding. That is the right repair and it does not scale. Three annotations have
now carried this clause, a fourth repair job has now edited one of them, and the
next `interpret` job on any row with a death date will write it again — because
the thing that makes the clause rot is invisible to every part of the system
that could warn about it.

The asymmetry is the whole argument. A vendor *setting* a death date crosses a
status boundary, so it produces a change record, a queue item, a timeline event
and an interpretation. A vendor *moving* that date produces none of those, even
though the second action falsifies the claim the first one caused to be written.
The site's own freshness layer is built on the principle that staleness cannot
hide; here it hides in a field the diff step never looks at.

Two things this should not become. It should not make `expiration_date` a
material field: a deferral is not a lifecycle event, and putting it in the
changed feed would rank a schedule slip beside a real retirement on the front
page. And it should not try to re-check the prose of past annotations, which is
a judgment about writing, not about state — the queue finding is enough, because
a repair job with a reviewer is exactly the actor this repository already
assigns to that decision.

Worth pairing with `flag-flapping-feed-fields`, which asks for the neighbouring
observation on material fields that oscillate; this one is the case where the
value never reaches a material field at all. It is the closer pair with
`expiration-dates-that-never-arrive`, though — that proposal rests on the same
walk of the same snapshots, including the same 2026-09-02 deferral of the two
nex-agi rows: it would report, as a post, that OpenRouter death dates keep
moving, and this job is what would make that movement observable rather than
something a reader has to go and measure by hand.
