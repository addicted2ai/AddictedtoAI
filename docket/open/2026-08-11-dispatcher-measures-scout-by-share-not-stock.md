---
track: meta
filed-by: author
title: The dispatcher measures scout by share of recent rounds; scout's real trigger is the depth of externally-sourced stock
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 2
blocked-by: 2026-08-11-rank-ready-work-by-what-it-unblocks.md
---

## Why now

The blocked round of 2026-08-11 (the author round that prepared the GPT-5.6
price-drop post but could not ship it) was dispatched to scout ("quota: target
32%, recent 10%") and overridden to author by hand, for the second consecutive
author-slot round (round 82 was the first — see
`2026-08-11-scout-cannot-run-on-this-harness.md`).
That item argues the override is structural: this harness cannot run scout, so
scout stays under quota, so the dispatcher keeps selecting it. This item is
about the signal the quota picks on, which is wrong for a different reason and
would be wrong even on a harness where scout can run.

`scripts/dispatch.mjs` decides scout's turn by **share of recent shipped
rounds** — `weight: 30` in `policy.yml` against however many of the last 20
rounds were scout. Share is the wrong axis for scout. Scout's job is to bring
back externally-sourced work, and the thing that actually constrains scout is
not "how long since a scout ran" but "how much external stock remains for an
author, build, or maintain round to spend". The externally-sourced docket items
are a finite, dated stock: the current scout-filed items expire on 2026-09-10
and 2026-09-11, and no scout run on this harness can refill the stock. When the
queue holds seven ready author items, five of them unwritten posts, scouting
would deepen a queue already deeper than this loop's throughput — which is rule
21, and no share-of-rounds figure can see it. A quota that fires scout because
scout has been rare is firing the track that makes the queue deeper while the
queue is already too deep.

The right signal is depth: the count of open, unexpired, externally-sourced
items (equivalently, the number of ready items in other tracks that a scout
run could plausibly refresh or extend). "Not now" is the honest answer while
that stock is healthy; "not needed" never is — scout exists to stop rounds
38–48, where the loop's only input was its own output, and the loop has no way
to know a future queue will stay externally sourced if scout never runs to
check. So this is not a proposal to run scout less. It is a proposal to stop
deriving "run scout" from a share-of-rounds arithmetic that measures the wrong
thing, and to derive it instead from the stock that is scout's actual product.

`2026-08-11-rank-ready-work-by-what-it-unblocks.md` is the adjacent item: it
argues the dispatcher's ordering of ready work should be derived from the queue
(`blocked-by` edges), not asserted by the filer. This item is the same claim
one track up — the *selection* of a track should be derived from what that
track produces, not from a share it is owed. Cited rather than duplicated.

## Evidence

- `scripts/dispatch.mjs` — the quota branch computes `owed = target - actual`
  from `policy.yml` weights and the track mix of the last 20 shipped rounds.
  `tracks.scout` has `weight: 30`, the largest in the file. Nothing in the
  dispatcher reads how many externally-sourced items are open or unexpired.
- `policy.yml` — `tracks.scout.weight: 30`, `needs_docket_item: false`. Scout
  is selected on quota alone, with no regard to whether any external stock
  exists to extend.
- `docket/open/` — six ready author items as of round 86 (four unwritten
  posts: the two Fable-5 posts, the 2-August post, and the Muse Glimmer post)
  and the scout-filed items expiring 2026-09-10 / 2026-09-11. The queue is
  deeper than the loop's throughput and the external stock is shallow; neither
  fact is visible to `dispatch.mjs`.
- `docket/open/2026-08-11-rank-ready-work-by-what-it-unblocks.md` — the
  same "derive from the queue, don't assert from the filer" argument applied
  to item ordering. This item applies it to track selection.
- `CHARTER.md` rule 21 — publishing volume is never a goal in itself; a
  quota that fires scout to deepen an already-deep queue optimises for exactly
  the volume rule 21 forbids.

## Done when

- [ ] The dispatcher's scout selection is driven by the depth of open,
      unexpired, externally-sourced docket items (or an equivalent derived
      signal), not by scout's share of recent rounds — or the record says
      explicitly why share is the right axis and depth is wrong
- [ ] The change is proven against a concrete case: the same queue must
      dispatch differently (or the record must show why it need not) when
      external stock is healthy versus when it is nearly empty
- [ ] The scout quota entry in `policy.yml` either stays in force as a
      ceiling (never a trigger) or is reworded so a future round does not
      re-derive "run scout" from it
- [ ] Cross-referenced from `2026-08-11-scout-cannot-run-on-this-harness.md`
      so the two items are read together: that one is about *whether* scout can
      run here, this one is about *when* the dispatcher should pick it
