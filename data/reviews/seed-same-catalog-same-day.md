---
job: seed-same-catalog-same-day
verdict: approve
reasons: []
would-cite: >-
  A person claiming AI prices collapsed — or that they stopped falling — the
  single-response derivation dates both: a 526x fall by mid-2024, then a
  flat floor while context grew tenfold, all from one fetch.
reviewer: seed-review-6.5
date: 2026-08-28
---

Checklist: blog post. The post's single source is the OpenRouter models
endpoint; I fetched it myself today (2026-08-28T21:15Z) and re-derived every
table and number with my own script rather than reading the author's.

- **Headline comparison reproduces**: openai/gpt-4 created 2023-05-28,
  ctx 8191, 30.00 in / 60.00 out per Mtok; ~deepseek/deepseek-v4-flash-latest
  created 2026-08-01, ctx 1310720, 0.03 in / 0.10 out. Arithmetic: 1,161
  days (2023-05-28 to 2026-08-01), 160.0x context, 1000x input, 600x output
  — the title's numbers are the body's numbers and both are the endpoint's.
- **Both progressions reproduce row for row**: the six context record
  holders (gpt-3.5-turbo 16385 -> gpt-4-turbo-preview 128000 ->
  claude-3-haiku 200000 -> unslopnemo-12b 1024000 -> llama-4-scout 1310720
  -> grok-4.20 2000000, with the same dates and prices; 1,038 days checked)
  and the six-step price floor ending 0.019 (mistral-nemo, 2024-07-19) ->
  0.017 (granite-4.0-h-micro, 2025-10-20). Paid rows >=100k: 332;
  zero-priced: 20; 10/0.019 = 526.3; (0.019-0.017)/0.019 = 10.5%; nemo 770
  days listed. All as published.
- **Aging block reproduces**: median 221 (mine: 220-221 depending on
  time-of-day anchor), 96 within 90 days, 170 within 180, by-year
  8/39/150/201, gpt-4.1-nano 501 days / 127.9x / 300x, ling-3.0-flash
  cheapest >=200k at 0.021, kimi-k2.5 listed 2026-01-27 expiring 2026-08-31
  (216-day scheduled life, 3 days left on the post's date).
- **One drift observed in my live fetch**: rows carrying an
  expiration_date are now 7, not 8 — z-ai/glm-4.5v no longer carries one —
  so "four rows carry a real expiration_date" was true of the post's
  snapshot and is three on my fetch. The post is dated, states "every
  number above is dated 2026-08-28", and the evidence shows two
  byte-identical snapshots backing its numbers; this is the catalog moving
  within the day, not an error in the post.
- **The limits section is the best part and is accurate**: prices are
  today's, not listing-date prices (stated twice, at the exact spots a
  reader would misread); created is listing date, not release date; the
  survivor-set caveat is applied to the floor claim correctly ("of 332 paid
  rows, none undercuts" — present tense, catalog-as-it-stands). The
  evidence file additionally records three drafted overclaims corrected
  before publication (the 600 ratio, the paid-only floor, the "original
  price" cut), and the published text matches the corrected versions.
- **Title vs body**: the title claims exactly the two ratios and the day
  count the body derives; no motive or conduct claims anywhere; the scout
  ceiling-vs-served caveat is volunteered right under the record table.
- Mentions: all thirteen referenced model/tool entry ids resolve to files
  in content/wiki/.

No source failed to support its claim. Approve.

## Recheck 2026-08-29 (wave addictedtoai-flh) — one false number found and corrected

This pass re-examined the pieces approved in the earlier seed round, which the
2026-08-29 seed wave never revisited. **The round-one approval above was wrong
on one number**, and the sentence above that says "No source failed to support
its claim" and the bullet that says "gpt-4.1-nano 501 days / 127.9x / 300x"
reproduced are both partly false. The post has been corrected; this section
records what was wrong and the bytes that show it.

**The defect.** The body read:

> `openai/gpt-4` and `openai/gpt-4.1-nano`, **501 days apart**, same catalog,
> same day

501 is not the gap between those two rows. It is the **age of the
`gpt-4.1-nano` row on the post's own date**. The endpoint's own `created`
fields, read out of the committed snapshots
`data/sources/openrouter-models/previous.json` (date `2026-08-28`,
`fetched_at 2026-08-28T18:19:35.242Z`) and `latest.json` (date `2026-08-29`,
`fetched_at 2026-08-29T07:27:34.466Z`) — byte-identical on this point:

```text
openai/gpt-4          created 1685232000 = 2023-05-28T00:00:00.000Z
openai/gpt-4.1-nano   created 1744651369 = 2025-04-14T17:22:49.000Z
```

2023-05-28 → 2025-04-14 is **687** days (688 if taken from the raw timestamps,
which differ by 687.72 days). 2025-04-14 → 2026-08-28, the post's date, is
exactly 501. The post's evidence transcript,
`data/reviews/evidence/post-same-catalog-same-day.md`, carries the author's own
script output and shows the confusion at its source — the transcript is
*correct*, and the post misread it:

```text
2023-05-28 -> 2026-08-01 : 1161 days
2023-05-28 -> 2026-08-28 : 1188 days
2025-04-14 -> 2026-08-28 : 501 days      <- this line
2024-07-19 -> 2026-08-28 : 770 days
2023-05-28 -> 2026-03-31 : 1038 days
```

**The correction, verified as rigorously as the refutation.** `687` is the
calendar-date difference, which is the convention every other day count in the
post uses and which I confirmed reproduces for all three of them: 2023-05-28 →
2026-08-01 = 1161 (post: "1,161 days apart"); 2023-05-28 → 2026-03-31 = 1038
(post: "Six steps, 1,038 days"); 2024-07-19 → 2026-08-28 = 770 (post:
"on the list for 770 days"). Taking those same three from raw timestamps gives
1162 / 1039 / 770, so the calendar convention is the one in force and 687, not
688, is the value that belongs in the sentence. The body now reads "687 days
apart"; nothing else in the paragraph changed, and its other three numbers
(`1,047,576` ctx, 127.9x, 300x) were re-derived and hold.

**Everything else in the post re-derived and holds.** Against
`latest.json` (2026-08-29, 396 rows — a *later* snapshot than the post's, so
agreement is stronger evidence than agreement with its own would be):

- Ratios, all exact: 1310720/8191 = 160.0195 ("160.0x"); 30/0.03 = 1000;
  60/0.10 = 600; 1047576/8191 = 127.8935 ("127.9x"); 30/0.100 = 300;
  10/0.019 = 526.32 ("a factor of 526"); (0.019−0.017)/0.019 = 10.53%
  ("10.5% below").
- The six context record holders reproduce row for row, same ids, same dates,
  same prices: gpt-3.5-turbo 16385 (2023-05-28, 0.500) → gpt-4-turbo-preview
  128000 (2024-01-25, 10.000) → claude-3-haiku 200000 (2024-03-13, 0.250) →
  unslopnemo-12b 1024000 (2024-11-08, 0.400) → llama-4-scout 1310720
  (2025-04-05, 0.110) → grok-4.20 2000000 (2026-03-31, 1.250). The claim that
  "the row that first crossed 128k is the dearest thing in the table" holds:
  10.000 is the maximum of that column.
- The six-step price floor reproduces row for row and ends at the same two
  rows: mistral-nemo 0.019 (2024-07-19, ctx 131072) then
  granite-4.0-h-micro 0.017 (2025-10-20, ctx 131000). Sorting all paid rows
  with ≥100k of context by price puts those two first and second, so "none
  undercuts that two-year-old listing by more than a rounding error" holds.
  Paid ≥100k rows: 331 now, 332 in the post. Zero-priced ≥100k: 20, exact.
- `meta-llama/llama-4-scout` ceiling 1310720 against `top_provider.context_length`
  131072 — exactly 10.00x, so "a tenfold gap" is right.
- `inclusionai/ling-3.0-flash` at 0.021 is still the cheapest paid row with
  ≥200k of context (next: nex-agi/nex-n2-mini 0.025).
- The aging block reproduces almost exactly, counting all rows as the post
  does: median age 221.1 days (post: 221), 96 within 90 days (exact), 170
  within 180 days (exact), by year 8 / 39 / 148 / 201 (post: 8 / 39 / 150 /
  201 — two 2025 rows have since left the list). The eight 2023 rows include
  the sentinel `openrouter/auto`, and exactly three are `openai/gpt-3.5-turbo`
  variants (`gpt-3.5-turbo`, `-16k`, `-instruct`), as written.
- `moonshotai/kimi-k2.5` created 2026-01-27, `expiration_date` 2026-08-31 —
  216 days, three of them left on the post's date. Exact.
- Rows carrying a non-sentinel `expiration_date` are 3 now (the post says 4);
  the drift the round-one review already recorded. Dated claim, still honest.

The only unreproducible numbers are the ones the post itself scopes to a fetch
it names and timestamps (398 rows, 657,669 bytes, 2026-08-28T20:26:39Z, the
byte-identical second fetch). Those stand on the evidence transcript.
