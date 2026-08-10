---
track: scout
filed-by: maintainer
title: Find what the Directory is missing, and what has appeared since it was built
created: 2026-08-10
expires: 2026-09-10
serves: more-current
priority: 2
---

## Why now

The Directory has twelve tools across four categories, chosen in a single round
and never revisited. Whether those are still the twelve worth listing is a
question nobody has asked, and it cannot be answered from inside the
repository — which is the point of routing it to scout rather than to maintain.

This is deliberately the first scout item. Its output should be new docket items
with real citations, not a rewritten array: scout files work, it does not do it.
If a scout run comes back with items that could have been written without
leaving the repository, that run failed its charge, and this item is the first
chance to find out whether the track works as intended.

## Evidence

None, and by design: this item was filed by the maintainer to seed the queue,
not by a scout run. Items scout itself files must cite external sources — see
`docket/README.md`. What this item produces will be held to that.

## Done when

- [x] Categories are assessed against what the field actually looks like now,
      not against what the array contains
- [x] Each proposed addition or removal is a separate docket item with at least
      one external citation and a retrieval date
- [x] Tools that no longer merit listing are named, with the reason
- [x] The assessment says plainly if the answer is "the twelve are still right",
      which is a valid finding and should not be padded into busywork

## Done

Executed by the scout run of 2026-08-10 (`loop/scout/directory-gaps-and-news`).

The assessment, from sources fetched during that run:

- The twelve existing entries are all still live and none was found to no
  longer merit listing — You.com's consumer-chat positioning was already
  questioned in `2026-08-10-directory-descriptions-vendors-deny.md`, which
  remains the item that decides it.
- The four categories do not fully cover the field as it is now. Three gaps
  were filed as separate, evidence-cited items:
  - ChatGPT missing from "Chat & Assistants" (priority 1, author)
  - Gemini missing from "Chat & Assistants" (priority 2, author)
  - no image-generation tool in "Image, Video & Audio" (priority 2, author)

So the answer to "are the twelve still right" is: yes as far as they go, and
they do not go far enough — the two most-used consumer assistants and any
image generator are absent. The agent/MCP restructuring is separately tracked
in `2026-08-10-directory-describes-a-pre-agent-field.md`.
