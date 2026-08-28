# Evidence — tutorial `openrouter-catalog-watch`

Real-run transcripts backing every output shown in
`content/tutorials/openrouter-catalog-watch.md`.

- **Date of run:** 2026-08-28
- **Where:** a scratch directory outside this repository
  (`…/scratchpad/price-watch/`). No packages installed; the scripts use only
  Node built-ins and global `fetch`.
- **Machine:** Windows 10, Node `v24.13.0`.
- **Credentials:** none. The endpoint is fetched unauthenticated.

## 1. Two snapshots

```
$ node snapshot.mjs
HTTP 200 application/json
398 rows -> snapshots/2026-08-28T20-26-39-358Z.json

$ node snapshot.mjs
HTTP 200 application/json
398 rows -> snapshots/2026-08-28T20-40-24-918Z.json
```

Both files are 657,669 bytes on disk and byte-for-byte identical (verified by
string comparison of the two file contents).

## 2. `report.mjs`

```
$ node report.mjs
snapshot 2026-08-28T20-40-24-918Z.json
rows                       398
priced input               372
zero-priced input          21
carry expiration_date      8
price cached input reads   236
context_length disagrees   40

cheapest input at >= 200k context (248 rows qualify)
    in/Mtok  out/Mtok    context  id
      0.021      0.063      262144  inclusionai/ling-3.0-flash
      0.025      0.100      262144  nex-agi/nex-n2-mini
      0.030      0.120      524288  upstage/solar-pro4
      0.030      0.100     1310720  ~deepseek/deepseek-v4-flash-latest
      0.030      0.130     1000000  qwen/qwen3.7-flash
      0.048      0.193      262144  qwen/qwen3-30b-a3b-instruct-2507
      0.050      0.100     1310720  deepseek/deepseek-v4-flash-0731
      0.050      0.200      262144  nvidia/nemotron-3-nano-30b-a3b
```

## 3. `fields.mjs`

```
$ node fields.mjs
-- rows whose pricing.prompt is neither > 0 nor exactly 0
   openrouter/auto-beta     "-1"  ctx 2000000
   openrouter/fusion        "-1"  ctx 1000000
   openrouter/pareto-code   "-1"  ctx 2000000
   openrouter/bodybuilder   "-1"  ctx 128000
   openrouter/auto          "-1"  ctx 2000000

-- rows with an expiration_date
   2026-08-31  moonshotai/kimi-k2.5
   2026-09-30  dots-studio/dots-3-note-preview:free
   2026-12-31  z-ai/glm-4.5v
   2026-12-31  z-ai/glm-4.5
   2098-12-31  z-ai/glm-5.3-flash
   2098-12-31  z-ai/glm-5.3
   2098-12-31  z-ai/glm-5v-turbo
   2098-12-31  z-ai/glm-5-turbo

-- id suffix census
   (none)=339  :batch=41  :free=18

-- zero-priced rows without a :free suffix
   google/lyria-3-pro-preview
   google/lyria-3-clip-preview
   openrouter/free

-- biggest context_length / top_provider.context_length gaps
   meta-llama/llama-4-scout           listed  1310720   top provider  131072
   ~z-ai/glm-latest                   listed  1310720   top provider  262144
   thedrummer/unslopnemo-12b          listed  1024000   top provider   32768
   anthropic/claude-sonnet-4          listed  1000000   top provider  200000
   qwen/qwen3.8-2.4t-a95b             listed  1048576   top provider  262144

-- ids beginning with ~
   ~anthropic/claude-fable-latest
   ~anthropic/claude-haiku-latest
   ~anthropic/claude-opus-latest
   ~anthropic/claude-sonnet-latest
   ~deepseek/deepseek-v4-flash-latest
   ~google/gemini-flash-latest
   ~google/gemini-pro-latest
   ~moonshotai/kimi-latest
   ~openai/gpt-latest
   ~openai/gpt-mini-latest
   ~x-ai/grok-latest
   ~z-ai/glm-latest

-- biggest prompt : input_cache_read price ratios
   xiaomi/mimo-v2.5-pro                   120.8x
   xiaomi/mimo-v2.5                       50.0x
   meituan/longcat-2.0                    50.0x
   meta/muse-spark-1.2-contributor        50.0x
```

## 4. The real diff, and the canary

```
$ node changes.mjs
2026-08-28T20-26-39-358Z.json
2026-08-28T20-40-24-918Z.json
0 changes

$ node canary.mjs
doctored copy written; dropped openai/gpt-4-turbo

$ node changes.mjs canary
1-real.json
2-doctored.json
arrived   fictional/never-shipped-1
changed   openai/gpt-3.5-turbo  context: 16385 -> 4096
changed   openai/gpt-4  price in: 0.00003 -> 0.000015
gone      openai/gpt-4-turbo
4 changes
```

A first version of `canary.mjs` removed the last array element, which happened
to be the same row whose price it had just edited, so only 3 of the 4 signals
fired. The published version drops a named row instead.

## 5. The `expiration_date` visibility check

Raw fetch of the model page and the listing page, then the same two pages
rendered in headless Chromium `151.0.7922.34` with `document.body.innerText`
searched:

```
$ node kimi.mjs
200 https://openrouter.ai/moonshotai/kimi-k2.5 758821B
   2026-08-31: not in visible text
   expir: not in visible text
   retir: not in visible text
   deprecat: not in visible text
   sunset: not in visible text
   "2026-08-31" anywhere in raw HTML: true
200 https://openrouter.ai/models?q=kimi 556953B
   … all of the above absent …
   "2026-08-31" anywhere in raw HTML: false

$ node kimi-render.mjs
=== https://openrouter.ai/moonshotai/kimi-k2.5 (14936 chars of visible text) ===
  2026-08-31: ABSENT
  Aug 31: ABSENT
  expir: ABSENT
  Expir: ABSENT
  retir: ABSENT
  deprecat: ABSENT
  sunset: ABSENT

=== https://openrouter.ai/models?q=kimi (6899 chars of visible text) ===
  … all ABSENT …
```

The tutorial's claim is limited to what this measures: the date is in the
model page's data payload, is not in its rendered text, and is not in the
listing page at all.

## What was not executed

- No run spanning more than one day, so no output shows a real arrival,
  departure or price change. The only non-empty diff in this evidence is the
  canary, and it is labelled as such in the tutorial.
- No authenticated request, and no endpoint other than `/api/v1/models`.
