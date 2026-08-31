---
title: "A comparison between two rows that names no listing"
date: "2026-08-20"
mentions: []
---

## The defect

Priced Model is twice the price of Other Model on input —
{{fact:model/priced-model#price_input}} against
{{fact:model/other-model#price_input}}. Nothing here says the two numbers are
listings, so the sentence asserts a relation between the models that the
catalog cannot support: the two rows need not be headed by the same provider,
and one provider lists one row at several service tiers.

## The hedge in a later sentence does not repair it

Priced Model is dearer than Other Model on input,
{{fact:model/priced-model#price_input}} against
{{fact:model/other-model#price_input}}. Both are the top listed provider's rate
for their row rather than necessarily either company's own. The clause is true
and the comparison it follows is still a claim about the two models, so this
must be flagged as well — the repair is a change of subject, not an appended
caveat.
