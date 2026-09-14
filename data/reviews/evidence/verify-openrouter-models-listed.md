# Evidence — re-verification of `tool/openrouter#models_listed`

Job j-20260914-28 (verify). The fact was accessed 2026-08-28 on a 14-day
`fast` interval, so it was overdue. Re-fetched the cited source directly.
Raw transcript: `verify-openrouter-models-listed.raw.txt` in this directory
(a node `fetch` script, run Mon Sep 14 2026 12:35:23 MDT). It records the
status line, the response's top-level keys, `links`, the row count, the
distinct-id count, `total_count`, and every row `id` in response order, so a
reader can count them. The 738 KB body itself was not committed.

## What was fetched (2026-09-14, HTTP 200)

`GET https://openrouter.ai/api/v1/models` (the fact's cited `source_url`),
unauthenticated:

| measurement | result |
|---|---|
| top-level keys | `data`, `total_count`, `links` |
| `links` | `{"next":null}` — one page, nothing more to fetch |
| `data.length` | **447** |
| distinct `id` values | 447 |
| `total_count` (the API's own figure) | 447 |

## Fact-by-fact result

| field | prior value | source says today | action |
|---|---|---|---|
| `models_listed` | `398` (accessed 2026-08-28) | 447 rows, `total_count` 447 | **value changed** — `398` no longer matches the source. Set to `447`, and `accessed` moved to `2026-09-14`, the date this check ran |

The old figure could not simply get a new date: 398 is not what the source
says today, so stamping it `2026-09-14` would be false. This is a `fast`
count that changes, and the fetch measured its current value, so the value
and its date were updated together, both from this one fetch.

Cross-check against the repository's own feed:
`data/sources/openrouter-models/latest.json` (the Pulse snapshot fetched
`2026-09-14T12:31:37.751Z`) has `row_count: 445`. That fetch was about six
hours before this one (`18:35:24 GMT`). Earlier fetches on 2026-08-28 also
differed by hour (388 vs 398, per `data/reviews/j-20260831-10.md`). The
catalog moves within a day, so each count is true only for its own fetch
time. 447 is what the cited URL returned when this check ran.

The `models_endpoint` (`slow`) and `row_id_field` (`static`) facts were out
of scope, so their stamps were not changed. This fetch happens to agree with
both: no auth needed, `links.next` null, and every row has a string `id`.

## Files changed

- `content/wiki/tool/openrouter.md` — `models_listed.value` and `models_listed.accessed` only
- `data/reviews/evidence/verify-openrouter-models-listed.raw.txt` — this run's transcript
- `data/reviews/evidence/verify-openrouter-models-listed.md` — this narrative
