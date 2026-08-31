# Proposal: let-the-site-see-its-own-gaps

## Why

The maintainer raised `addictedtoai-3zf` on 2026-08-30. His words: the new site
*"did not fall into the trap of the old site but it did it by just completely
ignoring the self improving aspect of the machinery all together."*

The issue's own diagnosis is that every one of the queue's reasons is either
*the world changed* or *a timer elapsed*. Nothing in the queue originates from
the site's own gaps. **The scout looks outward by design; nothing looks
inward.** That sentence is the whole of this change's subject.

### What was re-measured on 2026-08-31, before designing anything

The issue is three days old and this repository moves faster than its issue
text. Four of its claims were re-derived from committed state, and **two of
them no longer hold**. Both corrections are load-bearing, so they are recorded
here rather than in a commit message.

**1. "It has never written a published sentence" is false.** `data/ledger.jsonl`
now carries eighteen jobs, of which four `post` and two `entry` jobs completed
on 2026-08-31. The machinery writes. Nothing in this change addresses that
complaint, because it has closed.

**2. Three job types have no producer of any kind: `education`, `tutorial`,
`prune`.** Confirmed twice over. The queue can ask for five types — `scout`,
`verify`, `repair`, `interpret`, `entry` — and for no others; that is every
`item(...)` call in `pulse/lib/queue.mjs`. And of 23 proposals across every
state, the count by proposed type is `post` 15, `machinery` 4, `entry` 3,
`scout` 1, and **zero** for the other six. The indirect route — a proposal that
happens to propose one — is not theoretical for `post`, and is entirely
theoretical for these three. A route that exists in principle and is never
taken is the same as no route.

**3. "`machinery` proposes and is never selected" does not survive
measurement, and the reason matters.** Four machinery proposals are filed and
none is consumed, which reads as starvation. It is not.

`PROPOSAL_COOLING_DAYS` is 3, measured on file mtime, and every live proposal in
`data/proposals/` is **under 0.7 days old** — the proposal channel itself is
about a day old, since the first scout ran at 06:22 on 2026-08-31. So no
machinery proposal has ever been *eligible* for selection, and nothing can be
concluded about how the selector treats them.

The selection mechanism that has actually been operating is `expires:`, which
skips cooling entirely. It is worth stating precisely, because it is decisive:
**every one of the five consumed proposals carries `expires: 2026-09-07`, and so
does the only ripe live one. No proposal without an `expires:` key has ever been
consumed.** All four machinery proposals correctly carry none — a machinery
defect does not stop being true in a week — so they take the cooling path by
design, and three days have not passed.

The structural story — priority 3, behind the queue, then the upkeep floor on
top — also fails on its own terms today: the derived queue currently holds
**zero** items, `DIRECTIVES.md` has no pending lines, and `applyUpkeepFloor`
binds only when an upkeep job is available among the candidates, of which there
are none. The selector reaches the proposal tier immediately.

What survives, and is not settled by any of this: proposals *are* priority 3
behind directives and the whole derived queue, and no decision anywhere records
that the machinery's own self-improvement work should sit last. That is a real
design question. It is not answerable from a population that has never been
selectable, so it carries its own issue (`addictedtoai-wemx`) rather than a guess
here.

**4. The learn surface's coverage gap is now zero.** The issue's sharpest
example was ten published pages against a subject mapped at 37.
`openspec/changes/archive/2026-08-30-teach-the-whole-subject` closed that by
hand: `openspec/curriculum/learn.md` enumerates 38 pages and `content/learn/`
publishes 38, with no entry unpublished and no page undeclared.

### The finding that actually justifies this change

Point 4 looks like it removes the reason to build anything. It does the
opposite, and it points at a defect the issue never named.

`specs/education-static` already carries this requirement, in force today:

> The curriculum of record is `openspec/curriculum/learn.md`. **A learn page
> SHALL NOT publish unless it appears in the curriculum**; a page worth writing
> that the curriculum lacks SHALL be added to the curriculum — visibly, with its
> area, rung and prerequisites — in the same change that adds the page. Silent
> drift is the named enemy: the map must keep describing the territory, or
> coverage claims become unverifiable.

**Nothing implements it.** Not the schema, not `lib/learn.mjs`, not
`lib/site.mjs`, not a prebuild step, not a test. A learn page added tomorrow
with no curriculum entry validates, builds, renders and publishes. The
correspondence between map and corpus was established by a human reading both
and has been unguarded ever since — the check quoted above was run for this
proposal with a throwaway script, which is exactly the "anyone's recollection"
the requirement's own scenario says it must not be.

So the gap being zero today is not evidence that the mechanism is unnecessary.
It is the strongest possible argument for building it now: **the correspondence
is currently perfect and completely unprotected**, and the cheapest moment to
install a guard is while there is nothing to fix.

### Why this is the issue's shape (a), and why it is not the old site's trap

The issue names four shapes and says shape (a), *declared coverage*, is the one
to try first because a blueprint proves it works. This is that shape,
generalised from a human doing it once into a mechanism that does it every
build and every Pulse run.

It is not a quota, a cadence, or "write something today" — the failure that
filled the previous site's blog with censuses nobody asked for. It is not a
model scoring its own corpus on a rubric. **It is a set difference between two
committed files**, computed without inference, falsifiable by anyone who can
read a directory listing, and it retires the instant the page is written.

## What Changes

**The build refuses an undeclared learn page.** `checkCurriculumCoverage` joins
`checkPrerequisiteCycles` and `checkPrerequisiteLevels` in `lib/learn.mjs`,
called from the same place in `lib/site.mjs`, before any page renders. A
published learn page with no entry in the curriculum of record fails the build,
naming the page, the missing slug and the curriculum path. This implements an
existing `SHALL NOT` that has never had an implementation.

**The Pulse queues the reverse gap as an `education` job.** A curriculum entry
with no published page becomes one queue item, `type: education`, `reason:
curriculum-gap`, rank 28. This is the first producer of any kind for
`education` — the surface's first inward-looking signal, and the first queue
reason that originates from the site's own declaration rather than from the
world changing or a timer elapsing.

**The decision about which types the queue may produce stops being an
accident.** `pulse/lib/queue.mjs` gains `QUEUE_PRODUCIBLE_TYPES`, a stated
closed list, with a test that every item `computeQueue` emits carries a type
from it. Today's answer — that `tutorial`, `post`, `prune` and `machinery` are
proposal- and maintainer-initiated by design — becomes a decision on record with
a mechanism behind it, rather than the absence of one. Adding a producer for a
sixth type now requires editing a constant that says, in place, why the list is
what it is. That is `addictedtoai-3zf` part (d), answered.

**Two readers, deliberately, and a test that they agree.** The Pulse keeps its
own tolerant parse of the curriculum rather than importing the build's, because
`pulse/lib/corpus.mjs` states the boundary in its own header: *"The build owns
schema validation and fails loudly on a malformed file. The Pulse deliberately
does not share that code and deliberately does not throw."* An absent or
unreadable curriculum yields no queue items and stops nothing; the same file
missing at build time fails the build. The drift risk that duplication creates
is answered by measurement rather than by breaking the boundary: a test reads
the real curriculum through both parsers and asserts they return identical
slugs.

## What This Deliberately Does Not Change

`tutorial` gets no producer, because the declared-coverage shape needs a
declaration and `specs/education-dynamic` names no map of record. Inventing one
is an editorial decision about what this site should teach by doing, not a
machinery decision, and it belongs to whoever makes it (`addictedtoai-kat1`).

`prune` gets no producer, and that is a decision rather than a deferral —
argued in `design.md` D4 and recorded in the constant.

`machinery` gets no queue producer, for the same kind of reason and on the
strength of measurement 3 above (`design.md` D5).

The other three shapes the issue names — stale approvals (b) and generalised
wants (c) — are untouched, and each carries its own issue.
