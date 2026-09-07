---
date: 2026-09-07
slug: vllm-0-28-deepseek-v4-sparse-mla
type: post
status: declined
declined_by_job: j-20260907-05
failed_test: worth a stranger's attention — and F1, weighed and failed as an explicitly non-qualifying category
---

# Declined: vLLM v0.28.0 — DeepSeek V4 sparse MLA end-to-end, Kimi-K3 decode CP

## The story considered

vLLM v0.28.0, published 2026-08-26, whose release notes lead with a "Kimi-K3
performance push" (decode context parallel support and fused kernels),
"DeepSeek V4" sparse MLA working end to end for decode and speculative
decoding, and speculative-decoding advances including DFlash2 with local
convolution. Retrieved 2026-09-07 from the registered `github-tool-releases`
radar feed — https://api.github.com/repos/vllm-project/vllm/releases?per_page=10.

## Which frontier criterion it was weighed against, and why it failed

**F1** — "a capability shown for the first time, with an artifact anyone can
check." A serving-stack release is the one case where the artifact requirement
is trivially satisfied (the code is right there) and the criterion still fails,
because the non-qualifying list names **a tool release** outright. It qualifies
under no criterion. Sparse MLA running end to end is an engineering milestone,
not a capability the frontier did not have.

Recorded because the frontier question is asked of every domain on every run,
and `coding` is a domain where a serving-stack release is the most tempting
thing on the radar in a quiet week.

## Which of the two tests it failed

**Worth a stranger's attention.** Two weeks old at the time of this sweep, and
its would-send form — "vLLM 0.28 landed sparse MLA for DeepSeek V4" — is sent
only to people who already read the release notes. The site's bar treats
correct, sourced and forgettable as a failure, not a near miss, and a version
bump is the archetype.

## What would make it worth refiling

- A **measured** cost or throughput change large enough that a reader running
  models themselves would act on it — this site's `content/learn/running-a-model-
  yourself.md` is the surface that would care — with a reproducible benchmark,
  not release-note prose.
- A regression or CVE in a widely deployed serving stack, which is a `repair`-
  or incident-shaped story rather than a release one.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
