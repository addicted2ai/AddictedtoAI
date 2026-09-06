---
date: 2026-09-06
slug: alaya-lab-evoke-world-model
type: post
status: declined
declined_by_job: j-20260906-12
failed_test: true, checkable and current — fails "current"
frontier_criterion_weighed: F3
---

# Declined: Alaya Lab's EVOKE interactive world model

## The story considered

Alaya Lab released EVOKE, a 14B-parameter interactive world model that
generates 384x640 video at 24 fps in three denoising steps with no
classifier-free guidance, keeping scene geometry in an external
camera-indexed world-state bank so a session can run indefinitely without
the denoiser context growing. Weights for every training stage are published
on Hugging Face (`AlayaLab/Evoke`, roughly 57 GB for the final model) under
Apache-2.0, with code on GitHub and a paper at arXiv 2608.13546. The angle
considered was the release discipline as much as the model: publishing every
training-stage checkpoint, not just the final weights, is rare and is the
thing a reproducibility-minded reader would actually want.

## Which test it failed, and why

**True, checkable and current — it fails on currency.** The release is dated
mid-August 2026 (ComfyUI Wiki's news entry is `2026-08-15`, and the arXiv id
`2608.13546` is an August submission). That is roughly three weeks before
this sweep. A daily outward sweep filing it as news would be filing a story
that was already reported when it happened; the site would be arriving last
with nothing added.

## Weighed against the frontier criteria, and why the flag fails

**F3** — "an open-weights release matching a covered lab's frontier on a
published measure." The release is open-weights and the paper claims SOTA on
WBench, but two things stop the flag. Alaya Lab is not a covered
organisation in this corpus, and no published measure was found that puts
EVOKE against a covered lab's frontier video or world model — WBench results
against other open models are not that comparison. Beyond that, F-criteria
mark a *record on a date*, and this date is three weeks stale.

## What would make it worth refiling

- A published head-to-head on a named index against a covered lab's video or
  world model, with EVOKE leading or moving the leader — that is F2 or F3 on
  its own footing and the age of the weights stops mattering.
- A licence change, or a resolution of the mismatch already visible in the
  release: the EVOKE repository is Apache-2.0 but the ViGeo depth backend
  and Depth-Anything-3 ship CC-BY-NC-4.0, so the practical terms of the
  whole system are not the terms on the headline licence. That gap is a
  genuine story if it is confirmed against the actual LICENSE files, and it
  is a `verify` or `entry` job rather than a post.
- Adoption evidence with a date — a covered lab, a major product, or a
  measured download curve.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
