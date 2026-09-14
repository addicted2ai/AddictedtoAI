# Evidence — re-verification of `tool/transformers-js#version`

Job j-20260914-29 (verify). The fact was accessed 2026-08-28 on a 14-day
`fast` interval, so it was overdue. Re-fetched the cited source directly with
`curl -sS -i`. Raw transcript: `verify-transformers-js-version.raw.txt` in this
directory. It has the status line, the response headers and the full body,
verbatim. The only change is that two Cloudflare `set-cookie` headers were
removed.

## What was fetched (2026-09-14, HTTP 200)

`GET https://registry.npmjs.org/@huggingface/transformers/latest` (the fact's
cited `source_url`). Server `date: Mon, 14 Sep 2026 18:43:53 GMT`, which is
12:43:53 MDT local.

| measurement | result |
|---|---|
| `name` | `@huggingface/transformers` |
| `version` | **`4.2.0`** |
| `_id` | `@huggingface/transformers@4.2.0` |
| `dist.tarball` | `https://registry.npmjs.org/@huggingface/transformers/-/transformers-4.2.0.tgz` |

Cross-check, same session. `GET https://registry.npmjs.org/-/package/@huggingface/transformers/dist-tags`
returned HTTP 200 at `18:43:59 GMT` with the body
`{"next":"4.0.0-next.11","latest":"4.2.0"}`. This agrees with the `latest`
document. (This cross-check's transcript is quoted here and not saved as a
separate file.)

## Fact-by-fact result

| field | prior value | source says today | action |
|---|---|---|---|
| `version` | `4.2.0` (accessed 2026-08-28) | `4.2.0` | **confirmed unchanged**. `accessed` moved to `2026-09-14`, the local date this check ran. The value was not touched |

The `license` (`static`) and `repository` (`static`) facts are out of scope,
so their stamps were not changed. This same fetch agrees with both anyway:
`license` is `"Apache-2.0"` and `repository.url` is
`git+https://github.com/huggingface/transformers.js.git`.

## Files changed

- `content/wiki/tool/transformers-js.md`: `version.accessed` only
- `data/reviews/evidence/verify-transformers-js-version.raw.txt`: this run's transcript
- `data/reviews/evidence/verify-transformers-js-version.md`: this narrative
