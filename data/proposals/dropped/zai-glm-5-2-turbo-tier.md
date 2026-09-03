---
date: 2026-09-03
slug: zai-glm-5-2-turbo-tier
type: interpret
status: declined
declined_by_job: j-20260903-09
failed_test: worth a stranger's attention (would-send)
---

# Declined: Z.ai's GLM-5.2 Turbo fast-serving tier

## The story considered

The change feed records an arrival dated 2026-09-01 on the `llm-releases`
source: "Z.ai surfaces GLM-5.2 Turbo fast-serving tier". The candidate
angle was a note on Z.ai adding a latency-focused serving tier to the
GLM-5.2 line, in the same week as the GLM-5.3-Flash arrival (2026-08-29).

## Which test it failed, and why

**Worth a stranger's attention.** The feed item names a tier and nothing
else: no pricing, no latency figures, no availability details, and the
llm-releases catalog page for GLM-5.2 Turbo was not locatable in this run,
so no externally checkable fact exists to anchor a piece. The GLM fast-tier
story is already covered on the same judgment: GLM-5.3-Flash's arrival was
recorded 2026-08-29, and the "latest alias" follow-up was declined on
2026-09-02 (`zai-glm-flash-latest-alias`) for being naming without news.
A fast-serving tier with no stated spec is the same shape: a name in the
feed with no checkable difference from the models the corpus already rows.

## What would make it worth refiling

- Z.ai's own page or the llm-releases catalog page for the tier, carrying
  pricing, latency, or availability dates that make it comparable against
  the existing GLM-5.3-Flash row.
- A benchmark or measured latency figure giving the "fast" claim a
  checkable edge.
- The tier appearing as OpenRouter rows, turning the feed item into
  catalog facts the corpus can join.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.