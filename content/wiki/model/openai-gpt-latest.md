---
id: model/openai-gpt-latest
kind: model
display_name: OpenAI GPT Latest
status: active
maintenance: living
aliases:
  - name: OpenAI GPT Latest
    class: manual
feeds:
  openrouter-models: ~openai/gpt-latest
facts:
  - field: price_input
    source: feed
    feed: openrouter-models
    path: pricing.prompt
    volatility: fast
  - field: price_output
    source: feed
    feed: openrouter-models
    path: pricing.completion
    volatility: fast
  - field: context_window
    source: feed
    feed: openrouter-models
    path: context_length
    volatility: fast
  - field: status
    source: feed
    feed: openrouter-models
    path: $status
    volatility: fast
timeline: [ { date: "2026-09-11", event: retired, source_url: https://openrouter.ai/api/v1/models } ]
mentions:
  - model/openai-gpt-sol-latest
  - model/openai-gpt-5-6-sol
  - model/openai-gpt-6-astra
domains_seeded:
  - image
---

This page was never a model. `~openai/gpt-latest` was one of OpenRouter's
floating aliases, a row whose tokenizer is listed as `Router` and whose
description read "This model always redirects to the latest model in the OpenAI
GPT family." OpenRouter's
[Latest Model Resolution](https://openrouter.ai/docs/guides/routing/routers/latest-resolution)
guide documents the `~author/family-latest` form. So the alias is the router's
construct, not OpenAI's, and when the row left the catalog no OpenAI model was
retired. The model it last pointed at, `openai/gpt-5.6-sol`, was still a listed
row when the catalog was fetched on 2026-09-14.

What happened is that one pointer became four. The Pulse recorded this row's
withdrawal on 2026-09-11, and in that same run it recorded four new OpenAI
pointer rows arriving: `~openai/gpt-sol-latest`, `~openai/gpt-terra-latest`,
`~openai/gpt-luna-latest` and `~openai/gpt-astra-latest`. Each one follows a
single tier, not the whole family. The Sol pointer is the direct successor. Its
`alias_target` is the same `openai/gpt-5.6-sol` this row last named. At arrival
it also listed the same prompt and completion rates that this row listed at its
last sighting. Those last-known values are pinned in this row's withdrawal
record, `data/vanished/answered/openrouter-models--openai-gpt-latest.md`. It is still a new row and not
this one renamed: its `created` stamp is 2026-09-11, while this row's was
2026-04-27. The current values are carried on OpenAI GPT Sol Latest.

The old slug still answers, and it answers as the Sol pointer. Fetched on
2026-09-14,
[`…/models/~openai/gpt-latest/endpoints`](https://openrouter.ai/api/v1/models/~openai/gpt-latest/endpoints)
returns HTTP 200 with a payload whose `"id"` is `"~openai/gpt-sol-latest"`, and
[openrouter.ai/~openai/gpt-latest](https://openrouter.ai/~openai/gpt-latest)
responds with HTTP 307 to `/~openai/gpt-sol-latest`. Both records show
`"endpoints":[]`, and so does the live Sol pointer's own record. For a pointer
row, that empty list says nothing about whether requests are served.

The split changes what the old name means. At its last sighting, on 2026-09-10,
this pointer resolved to GPT-5.6 Sol. But OpenAI: GPT-6 Astra had entered the
same catalog on 2026-09-05. So for about five days, "the latest model in the
OpenAI GPT family" named a model a generation behind the newest OpenAI row
OpenRouter listed. After the split, code that still sends the old slug is
redirected to the Sol tier, not to the newest generation.

Neither publisher explains the change. No note from OpenRouter or OpenAI about
retiring the family-wide pointer turned up, and OpenRouter's resolution guide
names only two Anthropic aliases as examples. Whether OpenRouter dropped it
because Astra started a tier of its own, or for some other reason, is not
answered by any source consulted here, so this page leaves it open.

The `feeds:` binding stays. If `~openai/gpt-latest` ever returns as a catalog
row, it will bind straight back to this entry.
