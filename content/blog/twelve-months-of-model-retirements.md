---
title: "Twelve months of model retirements: 79 ids across three vendors, and the one-year lifespan keeps landing exactly"
date: "2026-08-17"
mentions:
  - org/openai
  - org/anthropic
  - org/google-deepmind
  - model/openai-gpt-4
  - model/openai-gpt-5
  - model/openai-o3-pro
  - model/anthropic-claude-opus-4-1
  - model/anthropic-claude-fable-5
  - model/anthropic-claude-opus-5
  - model/google-gemini-2-5-flash-image
  - model/google-gemini-3-1-flash-lite
---

Today is the listed shutdown date for the three `imagen-4.0` generation ids
on Google's API, 419 days after their release date. That closes a tidy
window: in the 365 days ending
2026-08-17, the deprecation pages of
[OpenAI](https://developers.openai.com/api/docs/deprecations),
[Anthropic](https://platform.claude.com/docs/en/about-claude/model-deprecations)
and [Google](https://ai.google.dev/gemini-api/docs/deprecations) record the
shutdown of 79 model identifiers:

```text
model ids shut down, 2025-08-18 .. 2026-08-17

OpenAI      35   across 9 shutdown days
Google      35   across 17 shutdown days
Anthropic    9   across 6 shutdown days
```

Identifiers, not distinct weights. Both large counts are inflated by aliases
the pages list as separate rows: `text-moderation-stable` and
`text-moderation-latest` died with `text-moderation-007`, which they pointed
at; `gemini-2.0-flash-001` is the pinned twin of `gemini-2.0-flash`; OpenAI's
March entry notes `gpt-4-0125-preview` took `gpt-4-turbo-preview` down with
it because the alias resolved to that snapshot. Nobody publishes a
deduplicated count, which is why the id count is the honest one to assemble:
it is what the vendors themselves enumerate.

## The chat model is dying faster each generation

OpenAI's flagship chat aliases now carry version numbers to their graves on a
schedule that shortens each time. Release dates from
[the API changelog](https://developers.openai.com/api/docs/changelog),
shutdown dates from the deprecations page:

```text
id                    available    shut down    lifespan
gpt-5-chat-latest     2025-08-07*  2026-07-23   at most 350 days
gpt-5.2-chat-latest   2025-12-11   2026-08-10   242 days
gpt-5.3-chat-latest   2026-03-03   2026-08-10   160 days

* the GPT-5 family's snapshot date; the changelog's history does not
  reach the alias's own launch, so 350 days is a ceiling
```

What replaced the pattern is not a longer-lived version but the end of
versions: a single rolling `chat-latest` id whose changelog entry says "the
underlying model snapshot will be regularly updated." The version number on
a chat model, the thing these three ids died of, no longer exists to die.

## One shutdown day, a 673-day age gap

Scheduled for 2026-10-23, one OpenAI announcement retires snapshots whose
ages at death will span nearly two years:

```text
gpt-4-0613            2023-06-13 -> 2026-10-23   1,228 days
gpt-3.5-turbo-0125    2024-01-25 -> 2026-10-23   1,002 days
gpt-4o-2024-05-13     2024-05-13 -> 2026-10-23     893 days
o1-2024-12-17         2024-12-17 -> 2026-10-23     675 days
o3-mini-2025-01-31    2025-01-31 -> 2026-10-23     630 days
o4-mini-2025-04-16    2025-04-16 -> 2026-10-23     555 days
```

Age at death does not track release order. `gpt-4-0613`, from June 2023,
outlives the core GPT-5 snapshot: `gpt-5-2025-08-07` is scheduled to go dark
on 2026-12-11 at 491 days old, younger at death than every row in that
table. The same December date takes `o3-2025-04-16` and `o3-pro-2025-06-10`;
with `o1-preview` gone in July 2025, `o1-mini` in October 2025, and `o1`,
`o1-pro`, `o3-mini` and `o4-mini` scheduled for October 2026, every o-series
identifier the page lists will be out of the API by 2026-12-11 — the
reasoning line as a separately-named thing, begun and ended within the
page's history.

## The floor became the schedule

Anthropic's policy promises "at least 60 days' notice before model
retirement for publicly released models." Its last seven deprecation
announcements, measured announcement-to-retirement:

```text
2025-06-30  Opus 3          189 days notice
2025-08-13  Sonnet 3.5       76
2025-10-28  Sonnet 3.7      114
2025-12-19  Haiku 3.5        62
2026-02-19  Haiku 3          60
2026-04-14  Sonnet 4/Opus 4  62
2026-06-05  Opus 4.1         61
```

Four consecutive announcements within two days of the minimum. The total
lifespan converged the same way: `claude-3-7-sonnet-20250219` retired
2026-02-19 and `claude-opus-4-1-20250805` retired 2026-08-05 — each exactly
365 days after the date in its own snapshot id. And the forward commitments
are now exactly that number: Claude Fable 5, released 2026-06-09 per
[its model page](https://platform.claude.com/docs/en/models/fable-5/overview),
carries "not sooner than June 9, 2027"; Claude Opus 5, released 2026-07-24,
carries "not sooner than July 24, 2027". Release plus 365, to the day.

Google's page frames its dates as "the earliest possible" shutdown, and its
recent generally-available models land on the same anniversary arithmetic:
`gemini-2.5-flash-image` (released 2025-10-02) is scheduled to shut down
2026-10-02, and `gemini-3.1-flash-lite` (released 2026-05-07) on 2027-05-07 —
365 days each. Completed GA lifespans have run both under and over the year
(`veo-3.0-generate-001` got 294 days; `gemini-2.0-flash` got 481), but what a
production model is *promised* has visibly settled at twelve months on both
of the vendors that promise anything. OpenAI publishes no floor, and its
completed lifespans above are the spread you get without one.

The consistent exception is embeddings, where retiring a model invalidates
every vector a customer ever stored: `text-embedding-004` got 645 days, and
`gemini-embedding-001` is scheduled for 1,035 — nearly three years, the
longest runway on any of the three pages.

Anthropic's page is also unusually plain about why any of this happens:
"Anthropic currently deprecates and retires models to ensure capacity for
new model releases," followed by a list of the downsides and a
[commitment](https://www.anthropic.com/research/deprecation-commitments) to
preserve the weights of what it retires.

## Read the replacement column

The right-hand column of a deprecation table says what a vendor thinks the
retired thing *was*. Three substitutions stand out:

- **A model became a parameter.** The recommended replacement for
  `o3-pro-2025-06-10` is `gpt-5.6-sol` with `reasoning.mode: pro` — what
  shipped as a separate model with its own price is now a setting on the
  flagship.
- **The dedicated image model line ended twice.** OpenAI points `dall-e-2`
  and `dall-e-3` (both retired 2026-05-12) at `gpt-image-2`; Google points
  the retired `imagen-4.0` family at `gemini-3.1-flash-image`. Both vendors
  now route image generation through their multimodal main line rather than
  a separate lineage.
- **A product's official migration path is a third-party tool.** For the
  Evals platform, deprecated 2026-06-03, OpenAI's page says: "See Moving
  from OpenAI Evals to Promptfoo for a migration path." The replacement for
  reusable prompts is "your application code."

## Method and limits

Counts and dates are transcribed from the three deprecation pages linked
above, plus release dates from the OpenAI changelog and the Claude model
pages; every lifespan is a plain difference between two dates that appear on
those pages. Three limits. The window's edges matter: OpenAI retired
o1-preview and Anthropic retired the Claude 2 family in July 2025, just
before this window opens. Scheduled dates (everything after 2026-08-17 here)
are floors, not facts, and Google says so explicitly. And these pages cover
each vendor's own API only — Bedrock and Vertex AI set different dates for
the same weights, which the Anthropic page states outright.
