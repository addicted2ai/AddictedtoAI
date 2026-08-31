---
date: 2026-08-31
slug: batch-lane-half-price-pricing
type: post
status: declined
declined_by_job: j-20260831-01
failed_test: worth a stranger's attention (would-send)
---

# Declined: the batch lane and the eight `:batch` arrivals

## The story considered

The queue item's assembled feed context for this run carries eight `:batch`
model arrivals recorded on 2026-08-29 in a single sweep — `deepseek/deepseek-v4-flash-0731:batch`,
`deepseek/deepseek-v4-pro-0813:batch`, `google/gemma-4-31b-it:batch`,
`meta/muse-glimmer-30b:batch`, `moonshotai/kimi-k3:batch`,
`openai/gpt-oss-120b:batch`, `openai/gpt-oss-20b:batch`,
`qwen/qwen3.5-9b:batch`, `thinkingmachines/inkling-small:batch` and
`z-ai/glm-5.3-flash:batch` among them. The candidate was a piece on the
asynchronous batch lane: near-universal 50%-of-synchronous pricing, and how
little of it shows up in anyone's cost planning.

## Which test it failed, and why

**Worth a stranger's attention.** Derivative, and knowably so.

External sweep on 2026-08-31 found the thesis already published under almost the
exact headline the piece would have carried: digitalapplied, "LLM Batch APIs: The
Half-Price Lane Nobody Budgets"
(https://www.digitalapplied.com/blog/llm-batch-api-pricing-landscape-2026,
retrieved 2026-08-31), which establishes that Google, OpenAI and Anthropic each
charge exactly half their synchronous rate for asynchronous work. Writing the
same observation from the same public prices adds nothing.

It also came close to failing the scout's own charge. Strip out the external
pricing pages and what remains is the change feed — a story assembled by looking
at the repository, which is the thing this job type exists not to do.

One thing did surface that the existing coverage does not carry, and it is
recorded here so it is not lost: OpenRouter began advertising a 50% discount on
eligible GPT-5.6 Sol routes on 2026-08-17, with eligible OpenAI routes currently
at $2/$10 per million input/output tokens (retrieved 2026-08-31, unverified
against OpenRouter's own pages). That is a promotion, not a structural batch
discount, and conflating the two would have been the piece's first error.

## What would make it worth refiling

- **A provider breaks the convention.** The story is not that batch costs half;
  it is the day someone prices it at something other than half, or withdraws a
  batch lane, or introduces tiering within it. A divergence from a uniform
  convention is checkable, dated, and genuinely news.
- A provider publishes batch-lane latency or completion-rate figures, making the
  half price comparable against something other than itself.
- The site's own directory grows a derived view of synchronous-versus-batch rates
  across providers — a live view nobody else shows would satisfy the editorial
  bar's third clause on its own, where prose restating public prices does not.
  That is a `machinery` or `entry` job, not a `post`, and should be filed as one.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
