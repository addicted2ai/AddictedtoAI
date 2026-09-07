# loop — delta for let-the-queue-see-a-judgment

One requirement added. Nothing about job identity, budgets, breakers or the
publish step changes; the merge step gains one exception, scoped to one queue
reason `specs/pulse`'s new producer mints.

The queue-side half of this change (`A review that no longer describes its
file is work the queue can see`) states that its item "SHALL retire by
recomputation alone: a newer record whose recorded hash equals the file's
current reviewed hash removes it at the next run." That is true of the
queue's own computation, and it is not enough on its own: the record has to
get written with the right `subject:`/`reviewed:` for the join to see it as
that match, and the merge step that writes them
(`One job is one outcome with one merge or discard`; the mechanism is
`loop/lib/review.mjs`'s `joinableSubjects`/`writeRecordSubjects`, invoked at
merge in `loop/run.mjs`) derives both keys from the merged branch diff's own
content paths — nothing else. A `verify` job dispatched at this reason is
often correctly finished by *not* touching the file: the honest finding is
that the edit was fine and only the approval had lapsed, which is a
conclusion, not a correction. That job's branch diff then names no path under
`content/`, so the merge either writes a record with no bound subject (the
diff held only evidence files) or never reaches the merge at all (an empty
branch diff is `failed` before any merge is attempted) — and the mismatched
record it was sent to retire keeps winning the join. That is exactly the
un-retirable high-rank item `specs/pulse`'s producer states this change must
not create.

## ADDED Requirements

### Requirement: A review-mismatch job's merge binds by the item it was dispatched at, not by its diff

A job whose queue item carries the `review-mismatch` reason (see `pulse`, "A
review that no longer describes its file is work the queue can see") is
verifying that an approval still describes its file. The item names the
piece as its own **subject** — a bare content path — and the honest finding
may be that the piece is fine as it stands, which changes no file under
`content/`: there is nothing wrong with the file to change.

- At merge, for a job whose queue item carries the `review-mismatch` reason,
  the loop SHALL union that item's subject into the set of paths bound to the
  job's verdict record — that path written into `subject:` and, computed the
  same way as for every other bound path, that path's current
  reviewed-surface hash written into `reviewed:` from the merged tree —
  whether or not the branch diff touched that path.
- The item's reason and subject SHALL be recorded on the job's branch at
  selection, so that a run resuming that branch binds by the same subject a
  first run of the same job would. This is not a resumption detail: a
  dispatched-but-interrupted `review-mismatch` job that resumes and reaches
  merge without it would lose the exemption above, merge a record that binds
  nothing, and leave the item it was dispatched to retire immortal — exactly
  what this requirement exists to prevent.
- A branch diff with no file under `content/`, on such a job, SHALL NOT be
  treated as `done with an empty diff`: it SHALL proceed to the ordinary gate
  and merge path exactly as a non-empty diff does, so that a `done` outcome
  it earns there is an ordinary successful merge — never counted toward the
  consecutive-failure breaker, which counts only `failed`/`discarded`
  outcomes, because none was produced.
- A job whose queue item carries any other reason, or none, is unaffected by
  this requirement: an empty branch diff SHALL still finish `failed` with the
  note `done with an empty diff`, exactly as before this requirement existed.

#### Scenario: A verify job that finds nothing wrong still binds the record

- **WHEN** a `review-mismatch` job's honest finding is that the file was
  already correct, and its branch diff carries no file under `content/`
- **THEN** the merge writes the item's subject path into the verdict record's
  `subject:`, that path's current reviewed-surface hash into `reviewed:`, and
  the run's outcome is `done`

#### Scenario: Evidence files alone do not leave the record unbound

- **WHEN** such a job's branch diff carries only files under
  `data/reviews/evidence/` and no file under `content/`
- **THEN** the bound path is still the item's subject, not an empty set, and
  the verdict record is not left unjoinable

#### Scenario: An empty diff on any other job still fails

- **WHEN** a job whose queue item carries a reason other than
  `review-mismatch` merges a branch with no diff at all
- **THEN** the run finishes `failed` with the note `done with an empty diff`,
  unchanged from before this requirement
