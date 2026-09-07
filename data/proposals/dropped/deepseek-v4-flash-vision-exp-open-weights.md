---
date: 2026-09-07
slug: deepseek-v4-flash-vision-exp-open-weights
type: post
status: declined
declined_by_job: j-20260907-05
failed_test: worth a stranger's attention — and F3, weighed and failed on the measure it would have to match
---

# Declined: DeepSeek-V4-Flash-Vision-Exp open weights under MIT

## The story considered

DeepSeek uploaded the full 305B-parameter `DeepSeek-V4-Flash-Vision-Exp`
checkpoint to Hugging Face on 2026-08-31 under the MIT licence, with a
tokenizer and a PyTorch inference implementation. It is the first multimodal
model in the V4 family — a vision encoder and aligner bolted onto the V4-Flash
architecture with continued training. It is the **top trending model on the
Hugging Face hub** as of this sweep, at 251,611 downloads and 773 likes.

Retrieved 2026-09-07:
- `https://huggingface.co/api/models?sort=trendingScore...` (the registered
  radar feed) — rank 1, `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp`, author
  `deepseek-ai`, createdAt 2026-08-31, `image-text-to-text`, licence `mit`, not
  gated.
- `https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp` — model
  card, describing "Our first experimental multimodal model in the DeepSeek-V4
  family", and reporting Terminal Bench 2.1 83.9, DeepSWE 59.3,
  Toolathlon-Verified 75.9, ApexBench (Pass@1) 36.5, Chartography 64.3.

## Which frontier criterion it was weighed against, and why it failed

**F3** — "a release by a covered organisation of a model it positions as its
frontier, or an open-weights release matching a covered lab's frontier on a
published measure." The first half does not apply: DeepSeek positions this as
*experimental*, in the model card's own word, and the V4-Pro GA build is its
frontier. The second half is the one that had to be measured rather than
assumed, and it fails on the measure: **83.9 on Terminal Bench 2.1 against
Claude Opus 4.8's 85.0** is close, and it is not matching. "Nearly matching" is
not a criterion, and stretching F3 to cover it would make F3 mean "a good open
release", which is a category this hub's front page refills every week.

The non-qualifying list is also explicit that a new checkpoint does not qualify
on its own, and an experimental variant of an existing architecture is exactly
that.

## Which of the two tests it failed

**Worth a stranger's attention.** The would-send form is "DeepSeek open-sourced
a 305B multimodal model under MIT" — and by 7 September that sentence has been
sent already, a week ago, by everyone who was going to send it. The weights went
up on 31 August; there is no dated development in the last seven days. A post
now would be this site restating a week-old release that every model-tracking
site carries, which is the precise failure the charge names.

It is true, and it is checkable. It is not current, and it is not worth a
stranger's attention *from this site*.

## What would make it worth refiling

- A **licence or access change** on the checkpoint — MIT withdrawn, replaced
  with a bespoke term, or territorially restricted. This corpus has recorded
  three of those in six weeks (`glm-5-3-license-revenue-gate`,
  `minimax-h3-licence-excluded-territories`, `qwen38-max-revenue-share-licence`),
  so it is a live pattern rather than a hypothetical, and it would be F5.
- An **independent** reproduction of the Terminal Bench 2.1 figure, or a
  rescoring that puts it at or above a closed frontier model — that would be F2
  or F3 on the measure this decline turned on.
- The non-experimental V4 multimodal release, which the "Exp" suffix implies is
  coming.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
