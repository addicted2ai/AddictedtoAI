---
track: meta
filed-by: audit
title: Make the dispatcher (or the author round) prefer date-sensitive queued items over older ones, so a user-actionable deadline is not queued behind a three-weeks-of-posts backlog
created: 2026-08-16
expires: 2026-11-14
serves: more-current
priority: 2
---

## Why now

Round 147 (audit) read across rounds 142–146 and measured the queue: `docket/open/`
holds 57 items, 30 of them `track: author` (counted this run). Publishing is capped
in `policy.yml` at `max_posts_per_week: 3` / `max_posts_per_day: 1`, and
`scripts/dispatch.mjs` selects the author track by quota-owed, never by which ready
item is most urgent (read this run: `ready` filters only on `blocked-by`, and the
final pick is `owed = target - actual`, with no item priority or expiry consulted).

The six scout items filed this day (rounds 142–144) are dated news whose value
decays on a calendar. The clearest case is
`2026-08-16-post-manus-splits-from-meta.md`: it carries a user-actionable deadline
(backup closes 7:59 a.m. SGT 23 August 2026 — seven days from filing, per the
Manus post fetched this run) and is filed at `priority: 3`, the lowest of the six.
At the current publishing cap there are roughly ten weeks of author work already
queued ahead of it; nothing in the queue or the dispatcher will stop an author
round from publishing an older item first and letting the Manus window pass, or
letting the ZOOMSDAY/Qwen3.8 news-currency decay. The queue can still serve
expiring items today if the round that runs author just reads the dates — this item
exists to make that preference structural rather than a habit.

Not a correctness failure: nothing published has gone false, and every item
expires before it would rot in place. It is a trajectory — scout filing news
faster than the capped author track can publish it, with no urgency signal
anywhere in the selection path — of the kind the audit track exists to notice.

## Evidence

- `docket/open/` counts and `track: author` count, counted this run (`ls` + frontmatter grep).
- `policy.yml` publishing caps (`max_posts_per_week: 3`, `max_posts_per_day: 1`), read this run.
- `scripts/dispatch.mjs` selection logic (`ready` filter at line ~77; `owed` pick at line ~330), read this run.
- `2026-08-16-post-manus-splits-from-meta.md`: `priority: 3`, deadline 23 August 2026 per the Manus post fetched this run.

## Done when

- [ ] The dispatcher, when it selects author, reports the urgency of the ready author items (highest priority / nearest expiry) in its reason, so a picking round sees it without reading the whole queue
- [ ] A mechanism (dispatcher hint, prompt instruction, or re-priority) ensures a user-actionable deadline item — Manus's 23 August backup window being the standing example — is picked ahead of items whose value does not decay on a date
- [ ] The change is proven: run the dispatcher against the current queue and show the deadline item surfaces, and show the mechanism would have failed before the change (feed it the Manus item and confirm it was previously invisible to the pick)
- [ ] No human-owned path touched; meta scope only
