---
date: 2026-09-02
slug: qwen38-flash-next-recheck
type: entry
status: declined
declined_by_job: j-20260902-07
failed_test: worth a stranger's attention (would-send)
---

# Declined: Qwen3.8-Flash-Next (Qwen4 preview) — recheck

## The story considered

The llm-releases feed item dated 2026-09-01 — "Alibaba releases
Qwen3.8-Flash-Next (Qwen4 preview)" — re-surfaced in this run's assembled
context (https://llm-releases.com/models/qwen3-8-flash-next, fetched
2026-09-02): an open-weight 125B/6B sparse MoE previewing the Qwen4
architecture (Gated-DeltaNet + Qwen Sparse Attention), 262K context
extensible to 1M, weights under the Qwen Community License 1.0. The
candidate was a recheck of the entry angle, since the feed's original
listing predates this run's window.

## Which test it failed, and why

**Worth a stranger's attention.** The story was already weighed and declined
on 2026-08-31 (`data/proposals/dropped/qwen38-flash-next-qwen4-preview.md`),
and the recheck finds nothing that has changed since: the weights remain
under the bespoke Qwen Community License 1.0, the release is still a
preview with vendor figures unverified, and the managed API twin
(Qwen3.8-Flash, $0.15/$0.47) was already part of the same announcement
wave. An entry would be a recap of a recap — the earlier decline's refile
conditions have not arrived. The adjacent license-angle question is already
covered by `data/proposals/dropped/qwen38-max-revenue-share-licence.md`'s
record on this site's own side.

## What would make it worth refiling

- Independent benchmarks of the Qwen4-preview architecture (a measurement
  of the Gated-DeltaNet + Qwen Sparse Attention claims) from a third party.
- The Qwen Community License changing to a mainstream licence, which would
  be a checkable licensing event rather than a launch recap.
- A dated deployment story — a named organisation running Qwen3.8-Flash-Next
  in production.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.