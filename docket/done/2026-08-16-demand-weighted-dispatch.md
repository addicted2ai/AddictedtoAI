---
track: meta
filed-by: maintainer
title: Weight the dispatcher by measured demand — a consuming track rises with its queue, and scout falls with the same number
created: 2026-08-16
expires: 2026-11-16
serves: more-checkable
priority: 1
---

## Why now

### What happened first, so the record is straight

On 15–16 August the loop was asked to design its own redesign. That
conversation produced a programme plan: a bounded queue, a round↔item
decoupling, a self-model written by audit, an action catalogue in `policy.yml`,
a seventh `design` track behind a charter amendment, an external design-score
ledger, and a Lighthouse retune — eight phases. A second model reviewed the
plan and returned "sound with major changes," with ten blocking findings, most
of which proposed further machinery.

The maintainer **deliberately did not read either document**. The stated reason
was to avoid steering the project: the product of this site is a demonstration
that an autonomous loop can build and honestly record real work, and a human
hand on every decision spends that product. He asked the orchestrating model to
read both and assess them instead.

The assessment found the diagnosis sound and the response disproportionate, and
proposed a much smaller correction, measured below. The maintainer then read
the assessment, decided a course correction was warranted, and delegated the
correction and its execution back to the orchestrator.

So the honest division for this item and the ones it names is:

- **The maintainer decided** that the loop had drifted, that intervening was
  warranted, and which of the two competing plans to follow. He also set the
  hard lines that bound all of it and stopped the loop while it lands.
- **The orchestrating model decided everything else** — the diagnosis, the
  measurements, the mechanism, the numbers below, the rejection of the loop's
  own eight-phase plan, and the sequencing. It briefs the rounds, reviews them
  and merges them.

That is closer to `delegated` than to `maintainer`, and the rounds that
implement it should record `Origin: delegated` and say so in the entry rather
than let the field imply a human chose the mechanism. A human chose the
direction. He did not choose the design.

### The measured diagnosis

The loop's own plan opened with "the queue is a growing graveyard" and treated
it as one problem needing one general solution. Measured on `origin/main` at
2026-08-16, it is two problems, and neither needs new machinery.

**Problem one: scout files perishable stock into a track that cannot spend it.**
Thirty of the fifty-eight open items are author items, every one filed by
scout, and every one of the thirty is a news peg — "Write about <this week's
announcement>". Scout files roughly seven a day. Author's outflow is capped by
`publishing.max_posts_per_week: 3`, which is 0.43 a day. That is a filing rate
sixteen times the drain rate, into items that rot.

The loop's plan rejected expiry as the primary drain mechanism (its D8) and
chose per-track budgets instead. For durable process work that is right. For
half of this queue it is backwards: perishable, mutually substitutable items
are drained by expiry and by picking the freshest, not by a budget and a
first-in-first-out order that guarantees every post is three weeks stale before
it is written.

**Problem two: meta is starved by its weight, not by its cap.** The plan
attributed meta's starvation to `max_share_of_runs: 0.10`. Measured over the
last forty shipped rounds: build 13, scout 9, maintain 8, audit 7, meta 2,
author 1. Meta ran at 5%. Its weight is 5 of 100. **The 10% cap never bound
once.** Removing the cap changes nothing; the weight is the whole story. The
dispatcher is faithfully executing a weight table written when the queue was
empty.

**And the loop had already found this.** `docket/open/2026-08-11-dispatcher-measures-scout-by-share-not-stock.md`,
filed by an author round on 11 August, says:

> Share is the wrong axis for scout. […] the thing that actually constrains
> scout is not "how long since a scout ran" but "how much external stock
> remains for an author, build, or maintain round to spend".

That is this item's mechanism, designed five days earlier by the loop itself.
It has never been worked. It is `blocked-by`
`2026-08-11-rank-ready-work-by-what-it-unblocks.md`, which is also still open —
so the queue contains a deadlock whose key is inside the deadlock, and the key
is the item whose whole purpose is to make blockers rise to the top. On 16
August the orchestrator independently rediscovered the same finding and shipped
a cruder version of it (`scout.max_runs_per_day: 1`, PR #105) without knowing
the item existed.

That is the argument against the eight-phase plan in one fact. The loop does
not need a seventh track, a self-model, an action catalogue and a verdict
ledger in order to notice that its dispatcher is mis-specified. It noticed. It
could not get a round.

## Evidence

All measured on `origin/main` at commit `c492961`, 2026-08-16 local
(2026-08-17T03:48Z).

- **Queue composition.** 58 open, 47 done, **0 ever dropped** (`docket/dropped/`
  contains only `.gitkeep`). Open by track: author 30, meta 28, and zero for
  build, scout, maintain and audit.
- **Every open author item is a news peg**, and all 30 are `filed-by: scout`.
  Creation dates: 3 on 08-10, 20 on 08-11, 4 on 08-13, 15 on 08-14, 8 on 08-15,
  8 on 08-16 — read across `docket/open/*.md` frontmatter.
- **Inflow versus outflow.** Items added to `docket/open/` per day, from
  `git log --diff-filter=A`: 25, 24, 5, 22, 16, 10 (08-10 … 08-16) = 102 filed.
  Items added to `docket/done/`: 8, 8, 1, 14, 12, 4 = 47 closed.
- **Author's ceiling is policy, not effort.** `publishing.max_posts_per_week: 3`.
  Thirty items against three a week is ten weeks of queue, for items whose
  subject is this week's news.
- **Track share over the last 40 shipped rounds** (`- Track:` lines in
  `CHANGELOG.md`): build 13, scout 9, maintain 8, audit 7, meta 2, author 1.
  Meta's measured share is 5%; `meta.max_share_of_runs` is 0.10. The cap has
  never been the binding constraint.
- **Measured drain per track**, whole history, from `docket/done/` frontmatter
  over the seven days 08-10 to 08-16: build 20, author 11, meta 7, maintain 7,
  scout 1.
- **Today's dispatch, before this change:** `track: maintain`,
  `quota: target 71%, recent 25%`; scout blocked only by the crude day cap from
  PR #105; meta available with 23 ready items and a 7% target.

## The design

Every number below is two weeks of the measured drain rate above, which is the
only sizing rule used. None is an appetite.

### `policy.yml`

Add `queue_budget` to the tracks that consume a queue:

- `author: 6` — 3 posts/week × 2 weeks. The publishing cap, not the effort, is
  what author can spend.
- `build: 14` — 20 closed in 7 days is 40 in 14; 14 is the ceiling applied to
  every budget, because a queue deeper than a fortnight of work is a wishlist.
- `meta: 14` — 7 closed in 7 days is 14 in 14. Note honestly in the file that
  this figure was measured while meta's weight suppressed its own drain, so it
  must be re-measured after this change rather than trusted.

Add `feeds: [author]` to scout, naming the track whose stock it supplies.

`[author]` and not `[author, build]`, which is the first shape this design took
and is wrong. Measured: of scout's 47 filed items, **41 are author**, 3 build,
3 maintain and 0 meta. Scout is 87% an author feeder. Giving build's empty
14-slot budget a vote would pull scout hard toward filing work it has almost
never filed — the signal would say "there is room" while the room is in a track
scout does not stock. Scout may still file build and maintain items and should;
they are simply not what triggers it.

With `[author]` alone the pair becomes a servo. Author at 6 of 6 drives scout's
weight to its 0.1 floor; author publishes and falls to 3 of 6, scout's weight
returns to about half; scout refills author to 6 and switches itself back off.
Nothing has to decide that — it falls out of one measurement read with two
signs.

Remove `scout.max_runs_per_day` and `meta.max_share_of_runs`, and say in the
file why each is going:

- `max_runs_per_day: 1` was the right diagnosis with the wrong instrument. A
  clock cap bounds a burst but cannot tell a full queue from an empty one, and
  it keeps scout off on the day the queue finally drains.
- `max_share_of_runs: 0.10` never bound — measured share 5% against a 10% cap —
  and the 2× ceiling below bounds meta by construction, which is a stronger
  guarantee than a cap that was never reached.

### `scripts/dispatch.mjs`

A track's weight becomes a function of measured demand rather than a constant.

    pressure(track) = readyCount(track) / queue_budget(track)      // 1.0 = at budget

For a **consuming** track (one with a `queue_budget`):

    effectiveWeight = weight * min(pressure, 2)

For the **supplying** track (one with `feeds`), the same measurement carries the
opposite sign — the more stock it has already delivered, the less it is owed:

    fill  = sum(readyCount(f) for f in feeds with a budget)
          / sum(queue_budget(f) for f in feeds with a budget)
    effectiveWeight = weight * clamp(1 - fill, 0.1, 1)

A track with neither a budget nor `feeds` keeps its weight unchanged. `target`
is then `effectiveWeight / sum of effectiveWeight over the candidates`, and the
existing most-owed comparison is untouched.

Two constants are load-bearing and must be commented as such:

- **The 2× ceiling** is what makes meta's removed cap unnecessary. A queue that
  runs away can at most double its track's weight; it can never take the
  rotation.
- **The 0.1 floor on scout** is deliberate and must never be zero. External
  input is the one thing this loop cannot generate for itself, and a scout that
  can be switched off completely is the 38–48 spiral with a new switch.

The human-readable output must print each track's ready count, budget and
pressure, so the reason a track won is legible without re-deriving it.

## Done when

- [x] `policy.yml` carries `queue_budget` for author (6), build (14) and meta
      (14), `feeds: [author]` on scout, and no longer carries
      `scout.max_runs_per_day` or `meta.max_share_of_runs` — each removal
      explained in the file
- [x] `scripts/dispatch.mjs` computes effective weight as specified, with the
      2× ceiling and the 0.1 floor both commented as load-bearing
- [x] The `dispatch.mjs` header comment describes demand weighting, so the file
      does not go on claiming a fixed-weight rotation it no longer runs
- [x] **Measured, not reasoned:** the round records `node scripts/dispatch.mjs`
      output before and after on the same tree, with meta's target rising from
      7% and scout's falling from its fixed share
- [x] **Negative control 1:** with author's ready items removed from a scratch
      copy of the tree, scout's effective weight returns to its full 30 —
      proving the demotion tracks the queue and is not hardcoded
- [x] **Negative control 2:** with meta's `queue_budget` raised to 100, meta's
      target falls back to roughly its old share — proving the weight tracks
      the budget and not merely the item count
- [x] The changelog entry records the division of decisions stated in
      "Why now": a human chose the direction, the orchestrating model chose the
      design

## Correction recorded

Round 151's changelog entry corrects this item's bold claim — "**The 10% cap
never bound once.**" — as false. Measured over the dispatcher's actual 20-round
window meta was at exactly 10% (2 of 20), so `max_share_of_runs` was excluding
meta from every dispatch decision while meta held 25 ready items; the 5% figure
the claim rests on was measured over 40 rounds, a different window. The
correction strengthens the case for this change rather than weakening it: the
cap was not a dead letter but an active exclusion. Measurements pasted in the
round's entry were run by the orchestrator on 2026-08-16 (61 open, 55 ready).
