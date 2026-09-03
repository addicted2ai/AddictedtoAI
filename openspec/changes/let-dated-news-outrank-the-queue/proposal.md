# Let dated news outrank the queue

## Why

The maintainer noticed the blog had gone quiet and asked whether posts had been
deleted. Nothing had: `git log --diff-filter=D -- content/blog/` returns exactly
one commit in the repository's history, a deliberate deletion on 2026-08-30, and
all six live posts were confirmed present on the site by literal substring match
against a fetch of `/blog`. What he had actually seen is a real hole in
production — five posts on 2026-08-31, **zero on 2026-09-01**, one on 2026-09-02.

Of the twenty-three jobs that ran on 2026-09-01, not one was a `post`: nineteen
`repair`, two `interpret`, one `scout`, one `entry`.

### What was re-measured before designing anything

Two explanations were proposed and both are wrong. They are recorded because
each is the obvious answer and each would have produced a fix that changed
nothing.

- **Not the upkeep floor.** It does not bind on the tier that runs the work:
  the cheap tier sits at 74.9% upkeep against an `upkeep_floor_pct` of 40. It
  binds on the frontier tier (22.0%), which is where the observed
  `[budget:upkeep-floor]` refusals came from — but that is not the tier the
  Desk has been running.
- **Not cooling, and cooling is not a news delay at all.** An audit of all 23
  live proposals splits perfectly: every `post` proposal carries `expires:` and
  skips cooling, and not one of the 18 proposals lacking `expires:` is a post —
  they are `machinery`, `entry`, `scout` and `verify`. All 7 proposals ever
  consumed carry `expires:`. Cooling has never once been the route to a
  published post, so the 3-day soak has never delayed a single piece of news.
- **Neither budget bound is binding.** `new_writing` sits at 23.1% against a
  `new_writing_ceiling_pct` of 45.

### The actual cause

Work-source ranking, which `specs/loop` states normatively: directives, then
the derived queue, then proposals. **News is source 3, and source 2 never
empties.**

Reviewers file carried findings into source 2 at the rate they are retired —
37 filed and 35 retired over three days — and 28 of those 37 (76%) land on a
file that had already been carried. Ten concern one topic. The mechanism is
that each repair creates a fresh reviewable surface on the same file, and a
reviewer asked whether anything else is worth noting will almost always find
something. Every individual finding examined was correct and narrower than its
predecessor; this is a missing termination condition, not a quality problem.

The proof of mechanism is observational rather than argued: on 2026-09-01 the
queue never emptied and no post ran; on 2026-09-02 the queue rederived to zero
for the first time and the very next selection was a `post`, which merged and
published.

### Why it is urgent rather than merely untidy

Three `post` proposals are selectable now and losing to the queue:

| proposal | expires |
|---|---|
| `claude-fable-5-1-mythos-5-1` | 2026-09-09 |
| `openai-astra-critical-cyber-designation` | 2026-09-09 |
| `thomson-reuters-fiduciary-model` | 2026-09-08 |

`expires:` sweeps a proposal to `dropped/` at its date. The derived queue has no
deadline — an item it does not reach today it recomputes tomorrow — so ordering
the deadline-free source ahead of the deadline-bearing one spends the only thing
that cannot be recovered.

## What changes

An expiring proposal is selected before the derived queue and after the
maintainer's directives. A proposal with no `expires:` is unchanged: it stays at
source 3, behind the queue, because with no deadline there is nothing to
preempt for.

The budget bounds are untouched and still bind. This reorders **which** work is
reached first, never **how much** of each kind may run: an expiring proposal
that would breach the new-writing ceiling is still refused, and the upkeep floor
still holds the queue's share. That is what keeps this from becoming the
opposite failure — writing endlessly while the corpus rots.

## What is deliberately not changed

- **The upkeep floor is not weakened.** It is not the cause, and it is the brake
  against the failure this site was built to avoid.
- **Cooling is not shortened.** It never delayed news, so shortening it would
  trade a real filter on unripe *ideas* for no gain on *evidence*.
- **Carried findings are not capped.** The 76% concentration is worth its own
  treatment; capping it here would bundle an unrelated redesign into an
  ordering fix. Carried by `addictedtoai-mtnk`.

## The regression this change caused, and why the fix lives here

The ordering above assumed something it never stated: that a proposal, once
reached, gets **done**. It does not always. A discarded job deliberately does
not consume its proposal — only a merged `done` may, because what a reviewer
refused was the writing rather than the idea — and while proposals sat below
the derived queue that was self-limiting: a refused candidate waited behind
however much upkeep existed, which on this repository is effectively always
some. Ranking an expiring proposal above the queue removed that spacing without
replacing it.

Observed 2026-09-03, hours after task 1 shipped, and filed as
`addictedtoai-z5dj`. `j-20260903-03` was refused twice and discarded at 34.61
model-minutes; the next dry run selected the identical proposal, with the same
brief and nothing between the attempts changed. Unattended that is ~35 model-
minutes a run until the candidate expires or three consecutive discards trip
breaker 1 and halt the Desk.

The second defect was in the same job and is the worse of the two. Both
findings the reviewer carried named
`content/blog/claude-fable-5-1-mythos-5-1.md` — a file that never existed,
because the branch carrying it was discarded. A repair job dispatched at either
would have found nothing. So the one fact that would have stopped the retry
repeating itself was written down in a form nothing could act on, while the
proposal that produced it went back to the front of the queue untouched. That
is the deferral-that-dies-with-its-container failure in mechanical form.

**Two fixes, addressing different halves, and neither substitutes for the
other.** The demotion makes the retry slower; the record in the proposal makes
it smarter. A slower retry that repeats the same mistake is still waste, and an
informed one that runs every single run still costs a job's spend every run.

This is fixed inside this change rather than in a new one because the
precedence and its bound are a single rule. Archiving the first without the
second would put a constitution on record stating that dated news outranks the
queue and saying nothing about what happens when that news cannot be written —
which is exactly the untasked-SHALL shape this repository keeps catching.

## What is deliberately still not changed

- **A discarded candidate is not rejected.** It is demoted, and its expiry
  still sweeps it on time. Nothing about it reaches the rejection index:
  deleting a candidate on the strength of one bad attempt is not a judgment the
  loop is entitled to make, and the requirement above says so already.
- **No retry counter halts anything.** Breaker 1 already halts the Desk on
  three consecutive discards of a type, and adding a second, narrower halt
  would be a fifth breaker in a closed list. The demotion is a bound on rate,
  not a new stop.
