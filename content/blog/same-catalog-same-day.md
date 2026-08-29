---
title: "Same catalog, same day: 1,000x on price and 160x on context, 1,161 days apart"
date: "2026-08-28"
mentions:
  - tool/openrouter
  - model/openai-gpt-4
  - model/openai-gpt-4-1-nano
  - model/openai-gpt-3-5-turbo
  - model/openai-gpt-4-turbo-preview
  - model/deepseek-deepseek-v4-flash-latest
  - model/meta-llama-llama-4-scout
  - model/anthropic-claude-3-haiku
  - model/mistralai-mistral-nemo
  - model/mistralai-mistral-large
  - model/ibm-granite-granite-4-0-h-micro
  - model/x-ai-grok-4-20
  - model/moonshotai-kimi-k2-5
---

Comparing a price from 2023 to a price from 2026 is usually an argument about
sources. This one is not: both rows were served by
[the same endpoint](https://openrouter.ai/api/v1/models) in the same response
on 2026-08-28, and each row carries its own `created` timestamp. No archive,
no memory, no press release.

```text
listed 2023-05-28   openai/gpt-4                          8,191 ctx    30.000 in / 60.000 out per Mtok
listed 2026-08-01   ~deepseek/deepseek-v4-flash-latest 1,310,720 ctx     0.030 in /  0.100 out per Mtok
```

1,161 days apart. 160.0x the context window, one one-thousandth the input
price, one six-hundredth the output price. Both rows were on sale at those
prices in the same second.

Stay inside one vendor and the shape survives.
[`openai/gpt-4`](https://openrouter.ai/openai/gpt-4) and
[`openai/gpt-4.1-nano`](https://openrouter.ai/openai/gpt-4.1-nano), 687 days
apart, same catalog, same day: `8,191` against `1,047,576` tokens of context —
127.9x — at `30.000` against `0.100` per million input tokens, which is 300x.
The 2023 row is still on the list, at `30.000`, beside a row from the same
vendor that does more for a three-hundredth of it.

## The record holders, dated by the day they were listed

Filter out the five router rows whose price is the sentinel `-1`, sort the
remaining 393 by `created`, and print every row that set a new maximum
`context_length`:

```text
2023-05-28      16385 ctx     0.500 in/Mtok  openai/gpt-3.5-turbo
2024-01-25     128000 ctx    10.000 in/Mtok  openai/gpt-4-turbo-preview
2024-03-13     200000 ctx     0.250 in/Mtok  anthropic/claude-3-haiku
2024-11-08    1024000 ctx     0.400 in/Mtok  thedrummer/unslopnemo-12b
2025-04-05    1310720 ctx     0.110 in/Mtok  meta-llama/llama-4-scout
2026-03-31    2000000 ctx     1.250 in/Mtok  x-ai/grok-4.20
```

Six steps, 1,038 days, 16,385 to 2,000,000. Two things about that column of
prices, because it is the part most likely to be misread.

The prices are **today's** prices for those rows, not the price on the listing
date — this endpoint carries no history, and nothing here shows what any row
cost when it appeared. And `context_length` is the advertised ceiling, not
what you will get: `meta-llama/llama-4-scout` lists `1310720` while its top
provider serves `131072`, a tenfold gap that the same response reports in
`top_provider.context_length`.

What the column does show, honestly, is that the widest window on the list
stopped being the expensive one. The row that first crossed 128k is the
dearest thing in the table.

## The floor, and the thing that did not happen

The same treatment on price. Among the 332 **paid** rows with at least 100k of
context — the 20 zero-priced ones are a different market — walk forward by
listing date and print each new minimum input price:

```text
2024-01-25    10.000 in/Mtok  ctx    128000  openai/gpt-4-turbo-preview
2024-02-26     2.000 in/Mtok  ctx    128000  mistralai/mistral-large
2024-03-13     0.250 in/Mtok  ctx    200000  anthropic/claude-3-haiku
2024-07-18     0.150 in/Mtok  ctx    128000  openai/gpt-4o-mini
2024-07-19     0.019 in/Mtok  ctx    131072  mistralai/mistral-nemo
2025-10-20     0.017 in/Mtok  ctx    131000  ibm-granite/granite-4.0-h-micro
```

Read the last two lines. The cheapest paid long-context row in the catalog
today, [`ibm-granite/granite-4.0-h-micro`](https://openrouter.ai/ibm-granite/granite-4.0-h-micro),
is 10.5% below
[`mistralai/mistral-nemo`](https://openrouter.ai/mistralai/mistral-nemo) —
which has been on the list for 770 days. Of 332 paid rows with 100k or more of
context, none undercuts that two-year-old listing by more than a rounding
error.

This is a claim about the catalog as it stands, not a price history, and the
difference matters. A row listed in July 2024 may have been cut to `0.019`
later; the endpoint would not say so. Rows that were delisted are simply
absent, so every earlier cohort here is a survivor. What survives that caveat
is the fact stated in the present tense: 398 rows are on sale, and the least
you can pay for 100k of context is a hair under what a row listed in 2024
already charges.

So the two halves of the delta run on different clocks. Between January and
July 2024 the cheapest long-context listing fell by a factor of 526. Since
then the money has stopped moving and the capability has not: `0.019` in July
2024 bought `131072` tokens of context; `0.030` today buys `1310720`, and the
cheapest 200k-context row on the whole list is
[`inclusionai/ling-3.0-flash`](https://openrouter.ai/inclusionai/ling-3.0-flash)
at `0.021`. The floor held; what stands on it grew by an order of magnitude.

## How old the catalog is

The 398 rows, aged by their own `created` field against 2026-08-28:

```text
median age          221 days
listed within  90 days    96 rows
listed within 180 days   170 rows
created in 2023             8 rows
created in 2024            39 rows
created in 2025           150 rows
created in 2026           201 rows
```

Half the catalog is younger than eight months. Eight rows have been listed
since 2023 and three of those are `openai/gpt-3.5-turbo` variants, which is
why the 2023 end of the first comparison was available to make at all.

The other end of the lifecycle is thinner but dated too. Four rows carry a
real `expiration_date` — the rest use `2098-12-31` as a "never" sentinel — and
the nearest is
[`moonshotai/kimi-k2.5`](https://openrouter.ai/moonshotai/kimi-k2.5), listed
2026-01-27 and expiring 2026-08-31: a scheduled life of 216 days, three of
which are left.

## What this is and is not

Every date above is the endpoint's own `created` or `expiration_date` field,
and every price is that row's `pricing.prompt` or `pricing.completion` in the
same response, multiplied by a million. The derivation is a filter, a sort and
a print, over a single 657,669-byte JSON document fetched at
`2026-08-28T20:26:39Z`. A second fetch fourteen minutes later was byte-for-byte
identical, so nothing here turns on which of the two was read.

Three limits, stated rather than buried. `created` is the date the router
listed the row, which is not the date the model was released or the date it
was trained. Prices are current, so no pair of a date and a price on this page
should be read as "that is what it cost then" — only as "that row, listed
then, costs this now". And the catalog is a survivor set: what left it is
invisible from inside it, which is precisely why the dates that *are* there
are worth writing down.
