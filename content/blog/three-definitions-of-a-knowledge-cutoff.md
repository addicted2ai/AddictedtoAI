---
title: "One vendor publishes two knowledge cutoffs, one publishes one, one publishes none in its API docs"
date: "2026-08-14"
mentions:
  - org/openai
  - org/anthropic
  - org/google-deepmind
  - model/openai-gpt-5-6-sol
  - model/openai-gpt-5-6-terra
  - model/openai-gpt-5-6-luna
  - model/anthropic-claude-opus-5
  - model/anthropic-claude-fable-5
  - model/anthropic-claude-sonnet-5
  - model/anthropic-claude-haiku-4-5
  - model/google-gemini-3-7-flash
---

Gemini's newest model, `gemini-3.7-flash`, shipped yesterday, and its
[model card](https://deepmind.google/models/model-cards/gemini-3-7-flash/)
gives it two knowledge cutoffs at once. The cutoff, it says, "is March
2026 – users can expect updated information for some domains while in
others they may experience the model's knowledge is limited to January
2025". Fourteen months of spread inside a single
model's own description of what it knows.

That sentence is a good excuse to line up what the three biggest vendors
actually publish under the phrase "knowledge cutoff" for the models they
sell today. It turns out to be three different quantities, in three
different places, with three different precisions.

## OpenAI: one number, to the day

The [models page](https://developers.openai.com/api/docs/models) lists the
current flagship family — `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna` —
each with the identical cutoff `Feb 16, 2026`. Day precision is unusual;
so is the uniformity: one training-data date across three tiers. The
family was released 2026-07-09 per
[the changelog](https://developers.openai.com/api/docs/changelog), so the
flagship line reached customers with knowledge 143 days old. What "cutoff"
means — most reliable date, last date present, or something else — the
page does not say.

## Anthropic: two numbers, defined

The [models overview](https://platform.claude.com/docs/en/models/overview)
publishes two dated fields per model and defines both: "reliable knowledge
cutoff" is "the date through which the model's knowledge is most extensive
and reliable", while "training data cutoff" is described as the broader
range of data used.

```text
model             released     reliable cutoff   training cutoff
claude-opus-5     2026-07-24   May 2026          May 2026
claude-fable-5    2026-06-09   Jan 2026          Jan 2026
claude-sonnet-5   —            Jan 2026          Jan 2026
claude-haiku-4-5  2025-10-01   Feb 2025          Jul 2025
```

On the two newest models the numbers coincide. On the older Haiku they sit
five months apart — which is precisely the information a single-number
cutoff erases: data between March and July 2025 is in the model, but
Anthropic won't vouch for how well. Claude Opus 5 is the freshest current
model on any of the three sites: released 2026-07-24 with a May 2026
reliable cutoff, its knowledge was between eight and twelve weeks old on
day one, depending on where in May the cutoff falls.

## Google: not in the API docs at all

The Gemini API documentation for the current lineup — the
[models index](https://ai.google.dev/gemini-api/docs/models) and the pages
for `gemini-3.7-flash` and `gemini-3.6-flash` — lists token limits,
capabilities, versions and an update month, and no knowledge cutoff. The
number exists, but it lives on `deepmind.google`, in the model card quoted
above, phrased as a range across domains rather than a date. A developer
choosing a model inside the API docs is the one reader who never sees it.

## The same phrase, sixteen months apart

Put the published numbers for currently-sold models on one line and the
word "cutoff" is doing very different work at each vendor:

```text
claude-opus-5        May 2026        reliable-knowledge date
gpt-5.6 family       2026-02-16      undefined single date
claude-fable-5       Jan 2026        reliable-knowledge date
claude-haiku-4-5     Feb 2025        reliable-knowledge date
gemini-3.7-flash     Mar 2026        "some domains"
  ... and            Jan 2025        "in others"
```

Sixteen months separate the best and worst dated knowledge sold as
current — May 2026 at one end, January 2025 at the other, and the same
January 2025 appears *inside* the newest Gemini model's own range. Staleness
at birth runs from roughly two months (Claude Opus 5) through 143 days (the
GPT-5.6 family) to about seven months for `claude-haiku-4-5` when it
launched — a model still in Anthropic's current lineup today, whose
reliable knowledge now ends more than seventeen months ago.

None of this is hidden. All of it is published, by the vendors, on the
pages linked here. It just is not published in the same units, to the same
precision, with the same definition, or in the same place — so a
cross-vendor cutoff table, the kind that shows up in announcement posts
and leaderboard footnotes, is comparing three different quantities.

## Method and limits

Dates come from the pages linked above, read when this was written; release
dates for the Claude models are stated on their own model pages, and
GPT-5.6's comes from the dated changelog entry. Limits: month-granular
cutoffs make gap arithmetic a range, not a number (the Opus figure above
spans the month); "released" means first API availability on the vendor's
own platform; and the absence of a cutoff in Google's API docs is a claim
about the three pages named here on the day of writing, not about every
page Google operates. Definitions are quoted so that when a vendor changes
one — which is how this piece will age — the difference is checkable.
