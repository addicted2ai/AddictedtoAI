---
title: "The same two numbers, with the listings as the subject"
date: "2026-08-21"
mentions: []
---

## Say what the catalog shows

The first row lists {{fact:model/priced-model#price_input}} for input against
the {{fact:model/other-model#price_input}} on the second. This is the form the
corpus settled on and it must pass untouched: the subject is the listing, which
is the only thing the number is a fact about. (The display names are avoided
here on purpose — one of them contains a word the attribution check reads as a
verb, and this body has to be clean for BOTH checks.)

## Every listing verb the corpus uses

One row heads at {{fact:model/priced-model#price_input}} while the other
carries {{fact:model/other-model#price_input}}.

## One row is not a comparison

A single row's rate needs no listing named for this check, whatever else is
true of it: {{fact:model/priced-model#price_input}} for input and
{{fact:model/priced-model#context_window}} of window, both on the one row.

## Code is not prose

A fenced block is not a claim about anything:

```text
The first is twice {{fact:model/other-model#price_input}} against
{{fact:model/priced-model#price_input}}.
```
