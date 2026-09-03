---
slug: annotations-need-a-durable-html-surface
type: machinery
date: 2026-09-03
origin: review of job j-20260903-06
noted_by: the reviewer of job j-20260903-06 (claude-code-opus)
proposed_by_job: j-20260903-06
proposed_by_type: interpret
---
An interpret job's whole output is one annotation line, and on the built site that line has an HTML lifetime of at most 24 changed-feed rows. The home page renders annotations under the change they annotate, capped at 24 (lib/render/home.mjs, opts.limit ?? 24); /catalog/changed never renders one at all, because pulse/lib/derive.mjs filters kind === 'annotation' out of changed_30d before the page ever sees it, and the page's lede states that exclusion as deliberate. Only the RSS feed keeps them, at limit 100 (lib/feeds.mjs). A machinery job should give annotations a durable HTML home — a permalink per change key, an annotations section, or lifting the derive-level exclusion so /catalog/changed can render them as a visibly separate line the way the home rail already does — so that the most expensive output the loop produces per line does not become invisible on the site within a day or two of being written.

## Evidence

Measured in this worktree on 2026-09-03 by calling changedFeed on data/changes.jsonl directly: the annotated Thomson line (llm-releases|...|574c56d8-1a40-41d1-bbe7-0d1a7be5e53f|$arrival) sits at index 22 of 158 feed rows, i.e. two rows inside the home page's limit of 24, one day after the change it annotates. Nine feed rows are already dated 2026-09-03 and nine 2026-09-02; the next Pulse run's arrivals push it out of the HTML entirely. pulse/lib/derive.mjs:148 excludes annotations from changed_30d; lib/feeds.mjs:97-109 is the only surface that keeps them past 24.

## Origin

Transcribed by the loop from the verdict record for job j-20260903-06 (`j-20260903-06.md`), which is the one channel a review has: the reviewer's edits to the tree it reviewed are discarded, so a proposal it noticed reaches the work sources only by being written in its record and copied here. The reviewing job is named above as its origin.
