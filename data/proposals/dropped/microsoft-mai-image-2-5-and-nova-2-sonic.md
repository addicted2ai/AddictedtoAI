---
date: 2026-09-06
slug: microsoft-mai-image-2-5-and-nova-2-sonic
type: post
status: declined
declined_by_job: j-20260906-12
failed_test: worth a stranger's attention (would-send)
frontier_criterion_weighed: F1 and F3
---

# Declined: the image and audio releases this sweep turned up

## The stories considered

The sweep asked the image, video and audio domains directly, because the
frontier question is a standing one asked of every domain and a domain
nobody sweeps goes quiet without anyone deciding it should. What came back:

- **Microsoft MAI-Image-2.5** in Microsoft Foundry, an updated image
  generation model adding image-to-image editing and "control with
  preservation", plus a faster MAI-Image-2.5 Flash variant.
- **Amazon Nova 2 Sonic**, a native speech-to-speech model in the Nova 2
  series, positioned for fast natural conversation.
- **AMD and Stability AI** pushing local image generation via SD 3.0 Medium
  on Ryzen AI hardware.

## Which test they failed, and why

**Worth a stranger's attention.** All three are point releases of existing
product lines announced through vendor product blogs. Each is correct,
sourced and forgettable, which the bar names as a failure rather than a near
miss. No artifact, no measured comparison, no access change, and nothing a
reader could act on that the vendor's own page does not already say better.

They also failed a prior check: this sweep could not pin an unambiguous
announcement date for any of them from the results retrieved on 2026-09-06.
A story whose date cannot be stated is not one this site can carry, and
chasing three dates for three routine releases was not the best use of the
run.

## Weighed against the frontier criteria, and why the flags fail

**F1** — none shows a capability for the first time with a checkable
artifact. Image-to-image editing and speech-to-speech are both established
capabilities; these are better versions of them.

**F3** — none is positioned by its vendor as that vendor's frontier model,
and none is an open-weights release matching a covered lab's frontier on a
published measure.

They fall squarely on the not-qualifying list — "a new checkpoint ... a tool
release" — and the test behind it: what every other AI news site already
shows does not qualify on its own. Recording that the image and audio
domains were swept and returned nothing that qualified is the honest
outcome, and a flag applied to fill either domain is precisely the failure
the criteria exist to prevent.

## What would make them worth refiling

- A published index result where one of them takes or moves a lead — F2 on
  its own footing.
- An open-weights release of any of them with terms that can be read.
- For Nova 2 Sonic specifically: a measured latency or interruption-handling
  figure from a third party, since that is the only claim in the category
  that a reader cannot verify by looking and where a real number would be
  worth sending.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
