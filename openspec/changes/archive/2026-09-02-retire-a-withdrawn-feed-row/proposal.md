# Retire a withdrawn feed row

## Why

`vanished-feed-row` had no retirement condition. `deriveDataLayer` emits one
finding for every declared binding whose row is absent from the source's latest
snapshot, and a withdrawn row is absent forever, so the item regenerated on
every run at rank 85 — the highest rank in the queue.

Measured on 2026-09-02, not reasoned about. Three Anthropic "(Fast)" rows were
withdrawn together. Job `j-20260902-01` repaired all three pages, was approved
on review, merged and deployed. The very next `loop/run.mjs --dry-run` selected
the same item again:

```
selected: repair from queue — declared row id absent from the latest
snapshot; last seen 2026-09-01 — bound facts render last-known values
with an as-of date
```

Two costs, and the second is worse than the first. The Desk would have re-done
finished work on every run, spending a metered subscription each time. And
because queue items have no duplicate suppression — that mechanism exists for
proposals only — **everything ranked below 85 was unreachable**: the daily
`scout`, which is the site's only outward-looking producer, sat unselectable
through two consecutive Pulse cycles, along with every carried finding.

The requirement this violates was already written. `The work queue is derived,
never accumulated` says an item "leaves the queue the moment the underlying
state is fixed". For a permanently withdrawn row, the underlying state is not
the world — which never reverts — but whether the site has answered it.

## What was re-measured before designing anything

Two candidate fixes were tried on paper and rejected on evidence.

**Edge-trigger on "absent from `latest`, present in `previous`."** It looks like
three lines, because `inPrevious` is already computed on the line above. It is
wrong twice. `pulse/lib/sources.mjs` states the rotation rule: *"previous is
only replaced when the fetched body's rows differ from latest."* On a quiet
source the condition stays true, so the edge trigger is a level trigger with
extra steps. And when rotation does happen, the row is in neither snapshot, so
`row = inLatest ?? inPrevious ?? null` goes null and the entry's bound facts
stop rendering last-known values — meaning the finding and the evidence needed
to act on it disappear together, silently. Losing both is worse than the bug.

**Remove the `feeds:` binding.** This is the documented trap: a retired entry
whose binding was removed can never re-mint if the row re-lists, which is the
permanent-refusal case `addictedtoai-javv` exists for and that `specs/pulse`
gained a requirement about on 2026-09-01.

**Keying retirement off the entry's `status` field** was also considered and
rejected: it conflates "is this model alive" with "have we acknowledged the
delisting". Those are different questions, and conflating them is what produced
the K2.5 status dispute (`addictedtoai-qupq`).

Also measured: `pulse/lib/mint.mjs`'s `appendTimelineEvents` fires only on
`kind === 'field_change' && field === 'status'`, so a **retirement never
produces a timeline event at all**. That is why the three affected pages carry
`timeline: []`, and it is why no existing field in the record could serve as the
acknowledgement signal.

## What changes

The shape is not invented here; it is the one the constitution already chose for
this exact failure. `A carried finding is queue state, and its file is the
state` requires retirement "by deletion of the file, performed by the fixing
job's own diff", because "a retirement that depended on a separate step
recording 'this one is done' is how a high-rank item becomes permanently
un-retirable and blocks everything beneath it forever". That sentence is a
description of this defect, written before it was found.

- **`pulse/lib/vanished.mjs`** (new) writes one record per withdrawn declared
  row under `data/vanished/`, once, and pins the row's last-known values into
  it so snapshot rotation cannot take the evidence.
- **`pulse/lib/queue.mjs`** produces `vanished-feed-row` from that directory
  instead of from `freshness.vanished_feed_rows`, mirroring
  `carriedFindingItems`. The computed list stays as reporting.
- **`pulse/run.mjs`** calls the recorder after the derived tree is built.
- Rank is unchanged at 85. It was never the defect: the RANKS table's own
  comment justifies it as "a fact the site already asserts is now stale", and
  two entries below it the table explains that `reference-drift` sits low
  precisely to avoid "the unrepairable top-of-queue item that halted the loop on
  `addictedtoai-5hn`". With retirement working, 85 is bounded rather than
  permanent.

## What this does not do

- It does not change how any page renders. An entry whose row has rotated out of
  both snapshots still renders its bound facts as absent, with no announcement.
  That half of `addictedtoai-64fk` stays open; only the evidence-loss half is
  addressed, by pinning.
- It does not batch a cohort into one finding. Three rows withdrawn in one
  vendor event still produce three records. `data/proposals/batch-cohort-
  vanished-row-repairs.md` argues for batching and is still cooling; pre-empting
  it here would decide a live proposal by side effect.
- It does not make retirements append timeline events. That gap is real and is
  worth its own change; doing it here would give the Pulse a way to satisfy this
  finding mechanically, which would defeat the point.
