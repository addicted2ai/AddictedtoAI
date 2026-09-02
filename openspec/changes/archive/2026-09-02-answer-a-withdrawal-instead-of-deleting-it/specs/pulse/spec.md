# pulse — delta for answer-a-withdrawal-instead-of-deleting-it

One requirement, amended in one clause and its scenarios. The clause said
retirement is by DELETING the record. That is wrong, and it was wrong in a way
that reimplemented the defect the requirement exists to remove.

## MODIFIED Requirements

### Requirement: A withdrawn feed row is recorded once and retires when the site answers it

A declared feed row that leaves its source does not come back on a schedule and
may never come back at all. The condition is therefore permanent, and a finding
computed directly from it can never retire: it is re-emitted on every
recomputation, forever, and at a high rank it starves every finding beneath it.
That is the failure `A carried finding is queue state, and its file is the
state` already names — a retirement that depends on anything other than the
fixing job's own diff is how a high-rank item becomes permanently un-retirable
— and it is why this class is specified separately from the level signal it is
derived from.

What is fixable here is not the world but the site's answer to it: whether the
corpus tells a reader what happened to the model. That is the state this
finding tracks.

A permanent condition needs a durable record of the ANSWER, not of the
question. This is the one place where the carried-finding analogy breaks and
must not be followed: a carried finding may be retired by deleting its file
because its source is a one-time verdict record, and once the file is gone
nothing recreates it. A withdrawn row's source is the continuing absence of a
row from a snapshot, so a deleted record is simply re-derived on the next run.
Retiring by deletion would leave the finding immortal — the original defect,
with extra steps.

- The Pulse SHALL write one durable record per declared row absent from its
  source's latest snapshot, under a directory at the data root, and SHALL write
  it **once**: a record that already exists SHALL NOT be rewritten. Idempotency
  is by presence, not by comparing dates, so a run cannot overwrite pinned
  evidence with a later, emptier reading.
- The derived queue SHALL produce its `vanished-feed-row` items from the
  **pending** records and SHALL NOT produce them from the computed absence
  itself. The computed list remains as reporting and as the input that decides
  which records to write.
- Retirement SHALL be by **moving the record into an answered store**,
  performed by the fixing job's own diff, and SHALL NOT be by deletion. A row
  named in the answered store SHALL NOT be recorded again, however long it
  stays absent from its source.
- The Pulse SHALL commit the records it writes. A record that is written and
  queued from but never committed is durable queue state that exists on one
  machine, invisible to a fresh clone and to every other actor.
- Each record SHALL pin the row's **last-known values** as of the moment it was
  written. A source's `previous` snapshot is only rotated when a fetch's rows
  differ from `latest`, so once rotation passes a withdrawal the row is present
  in neither snapshot and its last values are unrecoverable. A finding whose
  evidence expires before the finding does is not dispatchable work.
- A record that cannot be read as a finding — no front matter, or no title —
  SHALL be skipped rather than queued under a manufactured name, on the same
  terms as every other reader of a record directory.
- Nothing in this requirement SHALL cause an entry or its `feeds:` binding to be
  removed. A binding removed after its row vanishes is what makes that row
  permanently unmintable if it re-lists, which is the condition `A row whose
  slug is already taken is a finding, not a silent refusal` exists to report.

#### Scenario: The finding survives recomputation until it is answered

- **WHEN** a declared row is absent from its source's latest snapshot and its
  record is still pending
- **THEN** every recomputation produces exactly one `vanished-feed-row` item for
  it, never more, and the item does not duplicate across runs

#### Scenario: The fixing job's own diff retires it

- **WHEN** a job dispatched against a withdrawn row moves that row's record into
  the answered store in the same change as its fix
- **THEN** no later recomputation produces an item for that row, and no later
  run re-records it, even though the row remains absent from the latest
  snapshot indefinitely

#### Scenario: Deleting a record does not retire it

- **WHEN** a pending record is deleted without being answered and the row is
  still absent from the latest snapshot
- **THEN** the next run records it again, and the item returns — deletion is not
  a retirement path

#### Scenario: Absence alone is not a finding

- **WHEN** a row is absent from the latest snapshot and no record exists for it
  in either store
- **THEN** no `vanished-feed-row` item is produced

#### Scenario: The evidence outlives the snapshots

- **WHEN** a row's record is written and the source is later fetched with
  changed rows, rotating `previous` past the withdrawal
- **THEN** the row's last-known values are still readable from the record,
  though they are no longer present in either snapshot
