# Batch carried findings by subject

## Why

The maintainer asked to try "the 1 subject method" after being shown the
arithmetic of the carried-finding queue. This change is that method.

`specs/pulse` currently requires the derived queue to produce **one item per
file** under `data/carried/`. That was the right first shape — it made the
file's presence the state, which is what lets a finding retire by being
deleted — but it fixed the unit of WORK to the unit of STORAGE, and the two
are not the same thing.

### What was measured before designing anything

Read directly out of `data/carried/` on 2026-09-03, after job
`j-20260903-14` merged:

- **27 standing findings on 16 subjects.**
- The largest subject, `content/blog/glm-5-3-license-revenue-gate.md`, holds
  **four** findings; a model entry holds three; another post holds three.
- The top seven subjects hold 18 of the 27.

Dispatched one per file, those four findings are four jobs that each check out
the same post, re-fetch the same bilingual licence, and rebuild the same
context, followed by four review passes over four one-line diffs to the same
few paragraphs — three of which are reviewing a file the other three are also
editing. The repeated cost is not the fix; it is everything around the fix.

The concentration is not incidental to this queue, it is characteristic of it.
A reviewer reads one file closely and notices several things about it at once,
so findings arrive in clusters by construction. `loop/lib/select.mjs` already
records the same observation from the other end — "76% of them onto a file
already carried" — as an explanation for why work source 2 never empties.

### What this does NOT claim to fix

It does not slow the rate at which findings are filed, and it is not a
selector change: the ordering in `computeQueue` is untouched. It changes how
many jobs the same backlog costs to drain — 27 to 16 as measured, and by more
than that ratio in model-minutes, because the context a repair job must build
is per-subject rather than per-finding.

## What Changes

- The derived queue produces **one item per subject** rather than one per
  file: every finding naming the same `subject:` is handed to one job.
- A finding with no `subject:` keys on its own path and therefore never groups
  with anything — two subject-less findings stay two items, correctly, because
  nothing says they concern the same file.
- A batched item's `detail` states each finding in the reviewer's own words
  under its own heading, names the carried file that holds it, and closes with
  **one** retirement instruction listing every path to delete.
- A lone finding is byte-identical to what it was: same title, same detail.

Everything the original requirement exists to protect is unchanged. The file is
still the state; retirement is still the fixing job's own diff deleting it, with
no merge-step bookkeeping; the rank is still 25; a partially-fixed batch shrinks
to exactly the findings whose files remain.

### Why the groups are NOT ordered by size

Ordering the carried block by batch size would put the largest batch
permanently at the head of it, which is the shape `addictedtoai-5hn` and
`-cct` both warn about: an item that cannot retire becomes the head of the
queue forever and starves everything beneath it. The existing total order —
rank, then reason, then subject — drains just as completely and cannot starve,
so it is left exactly as it is.
