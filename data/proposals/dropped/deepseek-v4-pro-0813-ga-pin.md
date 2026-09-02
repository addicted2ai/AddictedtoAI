---
date: 2026-09-02
slug: deepseek-v4-pro-0813-ga-pin
type: interpret
status: declined
declined_by_job: j-20260902-07
failed_test: worth a stranger's attention (would-send)
---

# Declined: DeepSeek pins the V4-Pro GA build as 0813

## The story considered

The llm-releases feed item dated 2026-09-01 — "DeepSeek pins the V4-Pro GA
build as 0813" — recorded that the dated GA build behind the `deepseek-v4-pro`
API id is 0813 (the Pro-tier counterpart to V4-Flash-0731),
https://llm-releases.com/models/deepseek-v4-pro-0813, fetched 2026-09-02.
The candidate angle was a version-pin note: the model behind an API id is
now a dated build, with implications for anyone tracking what "V4-Pro"
means.

## Which test it failed, and why

**Worth a stranger's attention.** A version pin with no behavioral claim is
a catalog fact: the architecture (1.6T/49B MoE, 1M context) is unchanged,
no benchmark moved, no price changed, and no weights appeared. The
sendable form — "DeepSeek's V4-Pro GA is build 0813" — has no "look at
this" in it; it is the kind of row this site's own data layer records
routinely. The feed already carries the `:batch` twin of V4-Pro 0813, so
the pin is visible to the site's own readers through the change feed
without prose. The batch-lane price view that would make the row
comparable is already filed as machinery
(`data/proposals/derived-batch-vs-sync-price-view.md`).

## What would make it worth refiling

- DeepSeek announcing the pin with a change log — what the 0813 build
  changes relative to the earlier preview, which would give the pin a
  behavioral claim.
- Independent measurement showing the pinned build differs measurably from
  its predecessor on a public benchmark.
- The pin being accompanied by a price or context change, turning a
  version row into a checkable event.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.