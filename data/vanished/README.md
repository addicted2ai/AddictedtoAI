# data/vanished/ — declared feed rows that went missing, awaiting a repair

One file per (source, row id) where an entry declares a feed row that is no
longer in that source's latest snapshot. `pulse/lib/vanished.mjs` writes them
during a Pulse run; nothing else does.

**The file's presence is the whole of the state.** `pulse/lib/queue.mjs`'s
`vanishedRowItems` reads this directory on every run and emits one
`vanished-feed-row` item per file. There is no "resolved" flag, no merge-step
bookkeeping, and nothing anywhere else that records a withdrawal as handled.

**Retirement is MOVING the record into `answered/`, performed by the fixing
job's own diff. Not deleting it.** A job dispatched against one of these moves
the file, unchanged, into `data/vanished/answered/` in the same change as its
prose fix.

Deletion does not work, and the first version of this mechanism shipped that
mistake. A carried finding can be retired by deleting its file because its
source is a one-time verdict record — once the file is gone, nothing recreates
it. A withdrawn row's source is the *continuing absence* of a row from a
snapshot, which is re-derived on every run, so a deleted record is simply
written again. Measured: after three records were deleted by hand, the next
Pulse run logged `3 newly recorded`. The finding was still immortal; it had
merely acquired a file.

A row named in `answered/` is never recorded again, however long it stays
absent. That store is the durable evidence that the site has responded, and it
is the only thing that stops the question being asked forever.

That rule is not a convenience. `specs/pulse` requires it of a retirable
finding and says why: *"a retirement that depended on a separate step recording
'this one is done' is how a high-rank item becomes permanently un-retirable and
blocks everything beneath it forever."* This directory exists because that is
exactly what happened (`addictedtoai-u0n5`). The finding used to be computed
from the derived tree, and since a withdrawn row is absent from the latest
snapshot forever, it could never retire: it re-dispatched already-completed
work on every run at rank 85, and starved every finding below it — including
the daily `scout`.

## What is in a record

Front matter carries `title`, `subject` (the entry's path), `source`, `row_id`,
`entry_id`, `last_seen` and `date`. The body states what is known, what must
not be assumed, and pins the row's **last-known values** at the moment it went
missing.

The pinning matters. `previous` is only rotated when a fetch's rows differ from
`latest` (`pulse/lib/sources.mjs`), and once rotation passes a withdrawal the
row is in neither snapshot — so the values a repair job needs disappear, with
no warning (`addictedtoai-64fk`). Recording them here means the evidence
outlives the snapshots. It does **not** change how any page renders; an entry
whose row has rotated out still renders its bound facts as absent, and that
half of `64fk` is still open.

## What a job must not do

Do not delete the entry, and do not remove its `feeds:` binding. A binding
removed after a row vanishes is what makes the row permanently unmintable if it
ever re-lists — the permanent-refusal case `addictedtoai-javv` documents and
that `specs/pulse` now carries a requirement about.

Do not assume a vanished row means a dead model. It can mean retired, renamed,
folded into another service tier, or delisted by one router while still served
elsewhere. Those are different facts and a reader needs them told apart;
`blocked` is a successful outcome when the sources do not settle it.
