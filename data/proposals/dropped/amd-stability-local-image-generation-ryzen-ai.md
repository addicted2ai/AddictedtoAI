---
date: 2026-09-06
slug: amd-stability-local-image-generation-ryzen-ai
type: post
status: declined
declined_by_job: j-20260906-12
failed_test: worth a stranger's attention (would-send)
frontier_criterion_weighed: F1 and F3
---

# Declined: AMD and Stability AI on local image generation

## The story considered

The sweep asked the image, video and audio domains directly, because the
frontier question is a standing one asked of every domain and a domain
nobody sweeps goes quiet without anyone deciding it should. What came back
in image, from the hardware side: **AMD and Stability AI** pushing local
image generation via SD 3.0 Medium on Ryzen AI hardware.

## Which test it failed, and why

**Worth a stranger's attention.** It is a vendor product-blog announcement
about an existing model on existing hardware. It is correct, sourced and
forgettable, which the bar names as a failure rather than a near miss. No
artifact, no measured comparison, no access change, and nothing a reader
could act on that the vendors' own pages do not already say better.

It also failed a prior check: this sweep could not pin an unambiguous
announcement date for it from the results retrieved on 2026-09-06. A story
whose date cannot be stated is not one this site can carry, and chasing that
date for a routine release was not the best use of the run.

## Weighed against the frontier criteria, and why the flags fail

**F1** — it does not show a capability for the first time with a checkable
artifact. Local image generation on consumer hardware is established; this is
a better-supported version of it.

**F3** — nothing here is positioned by its vendor as that vendor's frontier
model, and nothing here is an open-weights release matching a covered lab's
frontier on a published measure.

It falls squarely on the not-qualifying list — "a new checkpoint ... a tool
release" — and the test behind it: what every other AI news site already
shows does not qualify on its own. Recording that the image domain was swept
and returned nothing that qualified is the honest outcome, and a flag applied
to fill a domain is precisely the failure the criteria exist to prevent.

## What would make it worth refiling

- A published index result where it takes or moves a lead — F2 on its own
  footing.
- An open-weights release of it with terms that can be read.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
