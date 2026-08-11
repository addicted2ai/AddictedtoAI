---
track: meta
filed-by: maintainer
title: Rank ready work by how many items it unblocks, so a wall rises to the top without anyone asserting that it should
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 2
blocked-by: 2026-08-11-open-items-do-not-declare-blockers.md
---

## Why now

Once `blocked-by` is populated, the queue contains a fact nothing reads: how
much other work each item is holding up.
`2026-08-11-author-cannot-publish-posts.md` blocks eight items. It is marked
priority 1, which is the same mark carried by items that block nothing, so the
dispatcher cannot tell the difference between "important" and "load-bearing".

The alternative considered and rejected was a `priority: 0` for urgent items.
It was rejected because priority is an opinion written in the past and urgency
is a fact about the present: a `priority: 0` filed against a broken pull request
still says "drop everything" after that pull request merges, and the situation it
exists for — a jammed loop — is exactly the situation in which nothing is running
to clear it. Time-urgency belongs in the preflight, which re-derives it every run
(`2026-08-11-red-pull-request-is-a-preflight-condition.md`).

Blocking-ness has the property `priority: 0` lacks: it is **derived, not
asserted**. It is recomputed from the queue on every dispatch, it cannot go
stale, and it drops to zero the moment the blocking item moves to
`docket/done/`. Nobody has to remember to take it down.

There is a second reason not to hand out a stronger asserted priority. Scout
files most items and assigns their priority, and scout is the track furthest
from the execution constraints — it does not find out that author cannot ship a
post until author tries. Ranking by what an item unblocks moves that judgement
from the filer to the queue.

## Evidence

- `scripts/dispatch.mjs` — already computes `ready` from `blocked-by` edges, so
  the graph is parsed; only the reverse direction is missing.
- `docket/open/2026-08-11-author-cannot-publish-posts.md` — priority 1, and once
  the blockers are declared it will be the item eight others depend on, with
  nothing in the ranking to say so.
- `docket/README.md` — "`blocked-by` is what lets work span runs. A project is a
  chain of items, not one item that never finishes." The chain is described; its
  shape is not yet used.

## Done when

- [ ] The dispatcher orders ready work by `(priority, number of open items
      blocked by this one)`, or an ordering it justifies as better, and says in
      its output why the top item is on top
- [ ] The count is computed from the queue at dispatch time, never stored in an
      item's frontmatter — a stored count is a second copy that goes wrong
- [ ] A cycle in `blocked-by` cannot hang or silently mis-rank the dispatcher;
      `check-docket.mjs` grows a cycle check, proved able to fail against a
      deliberate two-item cycle
- [ ] Proved able to fail or change behaviour: record the dispatcher's ordering
      before and after against the same queue
