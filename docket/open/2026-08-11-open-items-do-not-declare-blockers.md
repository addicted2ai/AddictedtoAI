---
track: meta
filed-by: maintainer
title: Populate blocked-by on the open items, because the dispatcher's readiness filter is currently a no-op
created: 2026-08-11
expires: 2026-11-11
serves: more-checkable
priority: 1
---

## Why now

Not one of the open docket items uses `blocked-by`. Zero, out of nineteen.

`scripts/dispatch.mjs` filters open items down to `ready` ones by checking that
everything named in `blocked-by` sits in `docket/done/`. With the field unused
everywhere, that filter passes every item unchanged and the dispatcher is
choosing tracks against a queue it believes is entirely executable.

It is not. The author round of 2026-08-11 discovered that the author track
cannot ship a blog post at all: a new post route must be registered in
`scripts/check-ai-disclosure.mjs`, which is outside author's scope, and the
disclosure check hard-fails when a route is missing from either map. It filed
`2026-08-11-author-cannot-publish-posts.md` and left eight post items sitting
in the queue. None of those eight names the wall.

So the dispatcher currently sees author as a track with eight available
priority-1 items, and will keep routing rounds to it for work it cannot
finish. The next author round will rediscover the same wall from scratch, which
is the specific waste the docket exists to prevent — the queue is supposed to
carry what a previous run learned.

The mechanism to fix this is already written and simply unused. This item is
data entry, not engineering, which is why it is priority 1 despite being the
smallest thing in the queue.

## Evidence

- `scripts/dispatch.mjs` — builds `ready` from open items whose `blocked-by`
  entries are all present in `docket/done/`. The comment there already states
  the intent: "An item blocked on something not yet done is not available work."
- `docket/open/2026-08-11-author-cannot-publish-posts.md` — filed by the author
  track after hitting the wall, naming the two maps and why author cannot edit
  the second.
- The eight post items
  (`2026-08-10-post-gpt-56-price-drop.md`,
  `2026-08-10-post-fable-5-export-controls.md`,
  `2026-08-10-post-fable-5-biology-safeguards.md`,
  `2026-08-10-post-what-changed-on-2-august.md`,
  `2026-08-11-post-cyber-eval-cascade.md`,
  `2026-08-11-post-claude-code-auto-mode.md`,
  `2026-08-11-post-muse-glimmer.md`, and the Directory entries that need a new
  route) — none of which currently carries a `blocked-by` line.
- `scripts/check-docket.mjs` — already validates that `blocked-by` points at an
  item that exists, so the field is safe to populate and a typo fails the build.

## Done when

- [ ] Every open item that cannot be executed today names what blocks it in
      `blocked-by`, starting with the post items that are blocked by
      `2026-08-11-author-cannot-publish-posts.md`
- [ ] Each item that is left *without* a blocker was checked rather than
      skipped — the executing round says in the record how many it reviewed, not
      only how many it edited
- [ ] `node scripts/dispatch.mjs` is run before and after, and both outputs go
      in the record. If the dispatcher's choice does not change, that is the
      finding and it is written up as one
- [ ] The record states whether any track becomes unavailable as a result
      (`needs_docket_item: true` with no ready items), because that is the point
      of the change and it is also the risk: a track with nothing ready stops
      being dispatched at all
