---
date: 2026-09-05
slug: flag-declared-feed-fields-that-go-null
type: machinery
summary: >
  Give the Pulse's freshness computation a field-level analogue of the
  vanished-row rule it already has: a declared feed field that carried a
  value in the previous snapshot and carries null in the latest one, on a
  row that is still present, SHALL produce a finding naming the entry, the
  field and the two snapshot dates. Today the Pulse detects only whole rows
  going missing (`vanished_feed_rows` in pulse/lib/freshness.mjs, "a declared
  row id absent from the latest snapshot"), so a publisher that withdraws one
  measurement from every row it still publishes is invisible to every
  detector the site has. The page keeps rendering — an absent field renders
  as "not published", which is the honest per-value behaviour — but any
  sentence that narrated a comparison across that field silently becomes
  false, and nothing in the corpus notices.
evidence: >
  Measured from the committed snapshot blobs in this worktree on 2026-09-05,
  not inferred. Between data/sources/openrouter-models/previous.json
  (fetched 2026-09-04T06:00:03Z, 427 rows) and latest.json
  (2026-09-05T06:00:04Z, 431 rows), rows carrying a number for
  benchmarks.artificial_analysis.intelligence_index fell from 164 to 52;
  114 rows lost the number while the row itself stayed live. No row
  vanished, so `vanished_feed_rows` produced nothing and no queue item
  existed. The defect reached the live site instead: five org pages
  published sentences narrating index trajectories over values that were
  gone, quoted in the directive that produced job j-20260905-13 and repaired
  by it. Sweeping the rebuilt out/ after that repair, 16 further pages still
  render an absent feed index transclusion, and five of those carry a
  CROSS-ENTRY comparison whose target value is now gone — the same defect
  shape, unrepaired: wiki/model/anthropic-claude-opus-4-8 (against
  opus-4-7), wiki/model/moonshotai-kimi-k3 (against kimi-k2-5),
  wiki/model/openai-gpt-5-6-luna (against gpt-5-4-nano, on both
  intelligence_index and agentic_index), wiki/model/openai-gpt-5-6-terra
  (against gpt-5-5), and wiki/model/z-ai-glm-5-1 (against glm-5-2). Each was
  found by reading the built HTML for a feed-sourced index span in state
  `absent`, which is a check nothing in the repository currently runs.
---

The Pulse's own spec argues this case for rows and stops one level short of
where the world actually broke it. `specs/pulse` requires the run to compute
"which declared feed rows have vanished (a row id an entry's `feeds` map
declares that is absent from the latest snapshot)". That rule exists because
a page bound to a row that disappeared would otherwise render a number the
world no longer publishes. A field that disappears from a surviving row is
the identical hazard with a smaller blast radius per row and, as measured
above, a far larger one in aggregate — 114 rows in one overnight fetch.

The asymmetry is worth stating plainly, because it is why nobody caught this:
the rendering layer already handles the field correctly. `lib/facts.mjs`
resolves it to state `absent` and prints "not published" rather than guessing
or retaining a stale number, and `lib/facts.test.mjs` measures that. Nothing
is wrong with any single value on any of these pages. What breaks is the
PROSE AROUND the value — "went from X to Y to Z", "lands within a point",
"fractionally below" — sentences that were true when written and are false
now, with no edit to the corpus and no signal anywhere. A detector that fires
on the field transition is the only thing that could reach them, because by
the time the page renders, the absence is indistinguishable from a field the
source never published at all.

Two design points that seem load-bearing, both inherited from rules already
written down here:

- The finding SHALL name the entry, the field, and both snapshot dates, and
  SHALL stop there — the same restraint `specs/pulse` requires of the
  slug-collision finding, which "SHALL NOT choose between the two readings"
  and leaves the judgment to a repair job with a reviewer. Whether a
  withdrawn measurement is a publisher rebase, a transient extractor fault or
  a genuine retirement is a question about the world, and this job is exactly
  the case that proves a model-free engine cannot answer it: on 2026-09-04
  the honest reading needed an announcement ("Intelligence Index v4.2") that
  lives nowhere in any snapshot.
- A field that has been null since the entry was minted SHALL NOT fire. The
  distinction is the transition, not the absence — most rows in this catalog
  have never carried an index, and reporting them would bury the 114 real
  cases in several hundred ordinary ones. This is the same shape as the
  slug-collision rule's insistence that "a row with nowhere to land is an
  ordinary unminted row".

Sibling, not duplicate: [[flag-flapping-feed-fields]] proposes recognising a
field that returns to a value it recently held. That is a field moving
between two values; this is a field ceasing to have one while its row lives
on. The two would likely share the diff-step plumbing and neither subsumes
the other.

Filed as a side-output of job j-20260905-13, which repaired the five org
pages by hand. The repair was the right scope for that job and is complete
for those five files; it does nothing about the next rebase, and the sweep
above shows it did not even reach every page hit by this one.
