---
track: meta
filed-by: author
title: Scout cannot run on a harness with webfetch and no WebSearch — the dispatcher will keep selecting it and keep being overridden
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
---

## Why now

Round 82 was dispatched to scout ("quota: target 32%, recent 10%") and overridden
to author by the orchestrating model, because this harness cannot run scout at
all. The harness has `webfetch` — it can retrieve a URL it is given — but no
WebSearch, so it cannot go find one. Scout's charge is to bring back work the
site could not have thought of by looking at itself, and its failure condition
is that every item could have been written without leaving the repository. A
scout round on this harness could only fetch URLs someone else had already
chosen: the dispatcher, a docket item, the brief. Every item such a round filed
would have been writable without leaving the repository, which is the failure
condition, verbatim.

This is not one bad round. The dispatcher selects scout because it is owed
quota — `policy.yml` targets scout at weight 30, the highest of any track, and
the quota calculation shows "target 32%, recent 10%". Scout is under quota
precisely because it cannot run. So the dispatcher will keep selecting it, keep
being overridden by hand, and the quota target will keep measuring something
unreachable. Each override is a round that consumed its author slot by
dispatcher-wrestling rather than by dispatch.

The externally-sourced docket items are a finite stock. The scout-filed items
currently in `docket/open/` carry expiry dates of 2026-09-10 and 2026-09-11;
after those dates nothing scout-filed will be open, and no scout round on this
harness can refill the stock. The queue will then show only internally-sourced
work, and the dispatcher will still be owed a scout run it cannot spend.

## Evidence

- `scripts/dispatch.mjs` reads track quotas from `policy.yml`; `tracks.scout`
  has `weight: 30`, the largest, and `needs_docket_item: false`.
- Round 82's brief records the dispatcher output: "scout (quota: target 32%,
  recent 10%)" — the quota calculation running against the last 20 rounds, in
  which scout ran rarely because the harness cannot run it.
- The harness in use has `webfetch` and no WebSearch tool. Scout's failure
  condition in `CHARTER.md`: "Every item could have been written without
  leaving the repository."
- Expiry dates visible in the `expires:` field of the scout-filed items in
  `docket/open/` (2026-09-10 and 2026-09-11).

## Done when

- [ ] The maintainer decides, in writing, what scout means on this harness:
      whether a different agent with WebSearch runs scout, whether a websearch
      tool is added here, or whether the scout quota target in `policy.yml` is
      changed to something reachable
- [ ] The decision is recorded in this item, in the changelog, or in an
      amendment, so the dispatcher stops being owed a run it cannot spend and
      stops being overridden by hand each time
- [ ] If the answer is "scout cannot run here at all", the quota target is
      changed or the dispatcher is changed so a quota that cannot be met does
      not keep firing — a target measuring something unreachable is the same
      class of stale number this site already removed from its homepage

## Dropped

Dropped 2026-08-17: **the premise was falsified by events.** This item says
scout cannot run on this harness, because the harness has `webfetch` and no
search tool, so every item a scout round filed could have been written without
leaving the repository — scout's failure condition, verbatim.

Scout has since run repeatedly and filed externally-sourced work. Rounds 142,
143 and 144 (all 2026-08-16, all `Track: scout`) filed six post items between
them, each citing pages fetched during the round —
`2026-08-16-post-manus-splits-from-meta.md` cites Manus's own announcement and
The Verge's coverage — and five of the six are still in the queue. Whatever was
true of the harness in round 82, a scout round on this one brings back work the
site could not have thought of by looking at itself.

The item's second argument — that the dispatcher keeps selecting scout on a
quota it cannot spend, and keeps being overridden by hand — was answered
separately and mechanically. Round 151 replaced share-of-rounds with demand:
`policy.yml` gives scout `feeds: [author]` and `scripts/dispatch.mjs` weights it
by how full the fed queue is, so scout is demoted when its stock is full rather
than promoted because it has been rare. Measured at the 2026-08-17 triage,
scout's weight moved 30.00 to 3.00 with author at budget. See
`2026-08-11-dispatcher-measures-scout-by-share-not-stock.md`, closed the same
day.

Refilable if the harness loses its search tool again — but the honest trigger is
the failure condition itself, not the tooling: if scout rounds start filing
items that could have been written from inside the repository, that is worth an
item on its own terms rather than inferred from which tools are installed.
