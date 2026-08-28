# Evidence — post `same-catalog-same-day`

Every date and every price in the post comes from one document: the response
of `https://openrouter.ai/api/v1/models`, fetched unauthenticated at
`2026-08-28T20:26:39Z`, 657,669 bytes on disk, 398 rows. A second fetch at
`2026-08-28T20:40:24Z` was byte-for-byte identical.

The fetch transcript is in
`data/reviews/evidence/tutorial-openrouter-catalog-watch.md`; the derivations
below were run over that saved snapshot.

## Ages and lifecycle

```
$ node lifecycle.mjs
snapshot 2026-08-28T20-26-39-358Z.json  rows 398
age in days: min 0, median 221, max 1188
listed within 90 days: 96
listed within 180 days: 170

oldest listings still served
  2023-05-28  ctx     16385  in/Mtok     0.50  openai/gpt-3.5-turbo
  2023-05-28  ctx      8191  in/Mtok    30.00  openai/gpt-4
  2023-07-02  ctx      8192  in/Mtok     0.06  gryphe/mythomax-l2-13b
  2023-07-22  ctx      6144  in/Mtok     0.45  undi95/remm-slerp-l2-13b
  2023-08-02  ctx      8000  in/Mtok     0.50  mancer/weaver
  2023-08-28  ctx     16385  in/Mtok     3.00  openai/gpt-3.5-turbo-16k

rows with a real (non-sentinel) expiration_date
  listed 2026-01-27 -> expires 2026-08-31  (216 days)  moonshotai/kimi-k2.5
  listed 2026-08-14 -> expires 2026-09-30  (47 days)   dots-studio/dots-3-note-preview:free
  listed 2025-08-11 -> expires 2026-12-31  (507 days)  z-ai/glm-4.5v
  listed 2025-07-25 -> expires 2026-12-31  (524 days)  z-ai/glm-4.5

cheapest paid row at each context bar (today)
  >=128000: 0.017 in / 0.112 out per Mtok  ibm-granite/granite-4.0-h-micro (listed 2025-10-20)
  >=200000: 0.021 in / 0.063 out per Mtok  inclusionai/ling-3.0-flash (listed 2026-07-23)
  >=1000000: 0.030 in / 0.100 out per Mtok  ~deepseek/deepseek-v4-flash-latest (listed 2026-08-01)

most expensive paid rows (input)
     150.00  openai/o1-pro (listed 2025-03-19)
      30.00  anthropic/claude-opus-4.7-fast (listed 2026-05-12)
      30.00  openai/gpt-5.5-pro (listed 2026-04-24)
      30.00  openai/gpt-5.4-pro (listed 2026-03-05)
      30.00  openai/gpt-4 (listed 2023-05-28)
```

## The two dated progressions published in the post

```
$ node progression.mjs
rows after dropping "-1" routers: 393

context-window record holders, by first listing date (routers excluded)
  2023-05-28      16385 ctx  in/Mtok     0.500  openai/gpt-3.5-turbo
  2024-01-25     128000 ctx  in/Mtok    10.000  openai/gpt-4-turbo-preview
  2024-03-13     200000 ctx  in/Mtok     0.250  anthropic/claude-3-haiku
  2024-11-08    1024000 ctx  in/Mtok     0.400  thedrummer/unslopnemo-12b
  2025-04-05    1310720 ctx  in/Mtok     0.110  meta-llama/llama-4-scout
  2026-03-31    2000000 ctx  in/Mtok     1.250  x-ai/grok-4.20

cheapest paid input price ever listed at >=100k context, by listing date
  2024-01-25    10.000 in/Mtok  ctx    128000  openai/gpt-4-turbo-preview
  2024-02-26     2.000 in/Mtok  ctx    128000  mistralai/mistral-large
  2024-03-13     0.250 in/Mtok  ctx    200000  anthropic/claude-3-haiku
  2024-07-18     0.150 in/Mtok  ctx    128000  openai/gpt-4o-mini
  2024-07-19     0.019 in/Mtok  ctx    131072  mistralai/mistral-nemo
  2025-10-20     0.017 in/Mtok  ctx    131000  ibm-granite/granite-4.0-h-micro

GPT-4 family rows still listed
  2023-05-28  ctx     8191  in   30.00  out   60.00  openai/gpt-4
  2024-01-25  ctx   128000  in   10.00  out   30.00  openai/gpt-4-turbo-preview
  2024-04-09  ctx   128000  in   10.00  out   30.00  openai/gpt-4-turbo
  2025-04-14  ctx  1047576  in    0.10  out    0.40  openai/gpt-4.1-nano
  2025-04-14  ctx  1047576  in    0.40  out    1.60  openai/gpt-4.1-mini
  2025-04-14  ctx  1047576  in    2.00  out    8.00  openai/gpt-4.1
```

## Raw rows behind the headline comparison

```
$ node total.mjs
top-level keys: data, total_count, links
total_count: 398 | data length: 398 | links: {"next":null}
gpt-4 row: { "id": "openai/gpt-4", "created": 1685232000, "ctx": 8191,
             "pricing": { "prompt": "0.00003", "completion": "0.00006" } }
gpt-4.1-nano row: { "created": 1744651369, "ctx": 1047576,
             "pricing": { "prompt": "0.0000001", "completion": "0.0000004",
                          "web_search": "0.01", "input_cache_read": "0.00000003" } }
```

`created` 1685232000 is 2023-05-28; 1744651369 is 2025-04-14.

## Arithmetic

```
$ node days.mjs
2023-05-28 -> 2026-08-01 : 1161 days
2023-05-28 -> 2026-08-28 : 1188 days
2025-04-14 -> 2026-08-28 : 501 days
2024-07-19 -> 2026-08-28 : 770 days
2023-05-28 -> 2026-03-31 : 1038 days
2026-01-27 -> 2026-08-31 : 216 days
30/0.030 = 1000 | 1310720/8191 = 160.0
1047576/8191 = 127.9 | 30/0.10 = 300
0.019 -> 0.017 change = 10.5%

$ node verify-post2.mjs
two snapshots byte-identical: true
60/0.1 = 600 | 10/0.019 = 526.3
rows created in 2023:
   2023-05-28  openai/gpt-3.5-turbo
   2023-05-28  openai/gpt-4
   2023-07-02  gryphe/mythomax-l2-13b
   2023-07-22  undi95/remm-slerp-l2-13b
   2023-08-02  mancer/weaver
   2023-08-28  openai/gpt-3.5-turbo-16k
   2023-09-28  openai/gpt-3.5-turbo-instruct
   2023-11-08  openrouter/auto
zero-priced rows with >=100k context: 20
cheapest PAID >=100k row: ibm-granite/granite-4.0-h-micro @ 0.017 /Mtok, listed 2025-10-20
paid rows >=100k: 332
```

Eight rows created in 2023, three of them `openai/gpt-3.5-turbo` variants —
the basis for that sentence in the post.

## Corrections made before publication

- The draft said the output-price ratio was "six hundredths"; `60 / 0.1 = 600`,
  so it is one six-hundredth.
- The draft's floor claim did not exclude the 20 zero-priced rows with 100k or
  more context. The published version says "paid" and gives the count (332).
- The draft asserted `openai/gpt-4` is "still listed at its original price".
  No source for the 2023 price was fetched, so the claim was cut down to what
  the snapshot shows: it is still listed at `30.000`.

## Limits stated in the post, and why

- `created` is the date the router listed the row, not a release date. The
  endpoint documents no other date.
- The endpoint carries no price history — a row's `pricing` is its price now,
  with no record of what it was. So no date/price pair may be read as "that is
  what it cost then". The post says this explicitly.
- Delisted rows are absent, so every cohort is a survivor set. This is why the
  floor finding is stated as a fact about today's catalog ("of 332 paid rows,
  none undercuts …") rather than as a price history.
