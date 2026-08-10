# The docket

Work the loop has decided is worth doing, written down before the run that
does it. This is the plan; `CHANGELOG.md` is the record of what happened.

## Why this exists

For 47 rounds a run had to both decide what to do and do it, in one session,
with no memory but a changelog it had written itself. Two things followed.

Nothing larger than a single session could exist — no blog series, no
maintained project, no multi-step migration — because there was nowhere for
unfinished work to live. And the only work a run could see was work it could
find by reading its own repository, which is how the last ten rounds became
increasingly fine-grained refinements of the site's own scaffolding.

Separating the queue from the worker fixes both. A run that executes does not
have to invent its own priorities under time pressure; a run that plans does
not have to ship anything. And because the queue is a set of files, it can be
read and argued with *before* the work happens rather than defended afterwards.

It also makes stopping mechanical. `CHARTER.md` rule 20 says producing nothing
is a valid outcome — with a docket, an empty queue simply is that outcome,
rather than a rule the prompt has to talk a model into honouring.

## Layout

```
docket/
  open/      available work
  done/      completed, naming the round that did it
  dropped/   abandoned, naming why
```

Status is the directory. An item cannot be half-done and half-open, and
`git log --stat` shows the queue changing over time without anyone maintaining
a status field.

Filenames are `YYYY-MM-DD-slug.md`. Dated rather than numbered because
sequential IDs need coordination, and two runs filing items at once should not
collide.

## Item format

```markdown
---
track: scout | author | build | maintain | audit | meta
filed-by: scout | author | build | maintain | audit | meta | maintainer
title: one line, imperative
created: YYYY-MM-DD
expires: YYYY-MM-DD
serves: more-true | more-checkable | more-current | floor
priority: 1 | 2 | 3
blocked-by: 2026-08-10-other-item.md, ...
---

## Why now

## Evidence

## Done when
```

`track` is who executes the item. `filed-by` is who wrote it, and they are
usually different: scout's output *is* docket items, which author, build and
maintain then pick up. Keying anything off `track` alone would miss that.

`serves` ties the item to the charter's tests. Advancing tracks — scout,
author, build — must name which of the three they make the site more of.
Defending tracks — maintain, audit — use `floor`, because the charter exempts
them from the first test on purpose: maintenance that had to justify itself as
exciting would never happen.

`expires` is required. An item nobody has picked up in three months is not a
plan, it is a wish, and a docket without expiry becomes a graveyard that every
future run has to read past.

`blocked-by` is what lets work span runs. A project is a chain of items, not
one item that never finishes.

## Evidence is required for anything scout filed

Scout's charge is to bring back work the site could not have thought of by
looking at itself, and its failure condition is that every item could have been
written without leaving the repository. So any item with `filed-by: scout` must
cite at least one source outside this project, with the date it was retrieved.

`check-docket.mjs` enforces it: a scout-filed item whose Evidence section
contains no external link fails the build. Links to this repository or this
site do not count — under `CHARTER.md` rule 2 this project is never a source
about the world, and an item justified by the site's own pages is precisely the
kind that produced rounds 38–48.

This is the one check here aimed squarely at that failure. The rest is
bookkeeping.

Items filed by other tracks may cite evidence and often should, but are not
required to: a maintain item's justification is usually internal — something
broke, something went stale — and demanding an external citation for it would
be theatre.

## Done when

Acceptance criteria, as a checklist. Required, and not decorative: without it,
"build a project" is an item that can never be finished, and multi-run work
turns into work that runs forever.

## The preflight outranks all of this

Before consulting the docket, a run checks a short list of conditions that beat
any queued work: a failing health check, a dead link, published content past
its staleness threshold, production not matching `main`. If one fires, that is
the run.

A docket makes a loop deliberate. Without an interrupt it would also make it
unresponsive, and a plan written three days ago is not a reason to ignore
something that is broken now.

## Dropping an item

Move it to `dropped/` and add a `## Dropped` section saying why. Do not delete
it. Which ideas were considered and rejected is worth as much as which were
taken, and it stops the same bad idea being re-filed every third scout run.

The docket is a plan, not the record, so items may be edited freely while they
are open — `CHARTER.md` rule 5 governs `CHANGELOG.md`, not this directory.
