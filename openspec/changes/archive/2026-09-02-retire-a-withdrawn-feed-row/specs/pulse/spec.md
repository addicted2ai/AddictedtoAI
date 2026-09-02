# pulse — delta for retire-a-withdrawn-feed-row

The enumeration in `The work queue is derived, never accumulated` is unchanged:
a vanished feed row is still a queue class. What was missing is how that class
satisfies the rule that requirement already states — "an item leaves the queue
the moment the underlying state is fixed" — for a condition whose underlying
state never reverts.

## ADDED Requirements

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

- The Pulse SHALL write one durable record per declared row absent from its
  source's latest snapshot, under a directory at the data root, and SHALL write
  it **once**: a record that already exists SHALL NOT be rewritten. Idempotency
  is by presence, not by comparing dates, so a run cannot revive a finding a job
  has just retired nor overwrite pinned evidence with a later, emptier reading.
- The derived queue SHALL produce its `vanished-feed-row` items from those
  records and SHALL NOT produce them from the computed absence itself. The
  computed list remains as reporting and as the input that decides which records
  to write.
- Retirement SHALL be by deletion of the record, performed by the fixing job's
  own diff, with no separate step recording that the withdrawal was handled.
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
  record has not been deleted
- **THEN** every recomputation produces exactly one `vanished-feed-row` item for
  it, never more, and the item does not duplicate across runs

#### Scenario: The fixing job's own diff retires it

- **WHEN** a job dispatched against a withdrawn row deletes that row's record in
  the same change as its fix
- **THEN** the next recomputation produces no item for that row, even though the
  row is still absent from the latest snapshot, and nothing else recorded that
  the work was done

#### Scenario: Absence alone is not a finding

- **WHEN** a row is absent from the latest snapshot and no record exists for it
- **THEN** no `vanished-feed-row` item is produced

#### Scenario: The evidence outlives the snapshots

- **WHEN** a row's record is written and the source is later fetched with
  changed rows, rotating `previous` past the withdrawal
- **THEN** the row's last-known values are still readable from the record,
  though they are no longer present in either snapshot
