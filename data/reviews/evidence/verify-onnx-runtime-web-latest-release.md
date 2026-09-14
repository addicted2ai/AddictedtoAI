# Evidence — re-verification of `tool/onnx-runtime-web#latest_release`

Job j-20260914-26 (verify). The fact was accessed 2026-08-28 on a 14-day
`fast` interval, so it was overdue. Re-fetched the cited source directly.
Raw transcript: `verify-onnx-runtime-web-latest-release.raw.txt` in this
directory (a node `fetch` script, run Mon Sep 14 2026 12:19:30 MDT; two fetch
blocks, full bodies unabridged).

## What was fetched (2026-09-14, both HTTP 200)

| Source | Result |
|---|---|
| `https://registry.npmjs.org/onnxruntime-web/latest` (the fact's cited `source_url`) | `"tag":"latest"`, `"_id":"onnxruntime-web@1.29.0"`, `"version":"1.29.0"` |
| `https://registry.npmjs.org/-/package/onnxruntime-web/dist-tags` (cross-check of the `latest` tag) | `{"extensions":"1.9.0-extensions","latest":"1.29.0","dev":"1.31.0-dev.20260914-8d85527a0"}` |

## Fact-by-fact result

| field | prior value | source says today | action |
|---|---|---|---|
| `latest_release` | `"1.29.0"` (accessed 2026-08-28) | `latest` dist-tag = `1.29.0` | **confirmed** — value unchanged; `accessed` moved to `2026-09-14`, the date this check ran |

The `dev` tag (`1.31.0-dev.20260914-…`) is a nightly pre-release, not the
`latest` release, and is not what this fact records. The `license` and
`repository` facts (both `static`) were not in scope and their stamps were
left untouched.

## Files changed

- `content/wiki/tool/onnx-runtime-web.md` — `latest_release.accessed` only
- `data/reviews/evidence/verify-onnx-runtime-web-latest-release.raw.txt` — this run's transcript
- `data/reviews/evidence/verify-onnx-runtime-web-latest-release.md` — this narrative
