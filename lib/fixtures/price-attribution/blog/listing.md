---
title: "The house style, which must pass untouched"
date: "2026-08-22"
mentions: []
---

## What the listing does

The OpenRouter row for it lists at {{fact:model/priced-model#price_input}}
input, and `vendor/demo-model` heads at {{fact:model/other-model#price_input}}.
Both sentences say what the listing does rather than what a company does, which
is the form the corpus settled on, and neither may be flagged.

## A price with no attributing verb at all

Its window is {{fact:model/priced-model#context_window}} and its input figure
is {{fact:model/priced-model#price_input}}.

## Words that only look like attributions

Opus lands within half a percent of the peak score at half the cost per task,
on a tier whose whole name is a promise about cost. Those are the two measured
false positives of a bare noun match, and both must stay clean beside
{{fact:model/priced-model#price_input}}.

## Code is not prose

A fenced block naming a verb is not a claim:

```text
Priced Model charges {{fact:model/priced-model#price_input}} per token.
```

And neither is inline code: `charges {{fact:model/other-model#price_input}}`.
