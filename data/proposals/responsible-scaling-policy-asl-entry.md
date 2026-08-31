---
date: 2026-08-31
slug: responsible-scaling-policy-asl-entry
type: entry
summary: >
  Write a `concept` wiki entry for Anthropic's Responsible Scaling Policy and
  its AI Safety Level tiers (ASL-1 through ASL-4), the graduated deployment
  standard that other labs' frontier-safety frameworks are routinely compared
  against. The entry should carry the RSP's own version and date as cited
  facts, define what each ASL tier gates, and state plainly which currently
  deployed models sit at which level where Anthropic publishes that. The wiki
  has 495 entries and 17 `concept` entries covering tokenization, scaling laws,
  chain-of-thought and the bitter lesson, but nothing on frontier-safety
  tiering — so any piece touching ASL has to define it inline instead of
  linking it.
evidence: >
  Found while writing the 2026-08-31 blog note on Anthropic's usage policy and
  the Pentagon ruling. Anthropic's Help Center page "Exceptions to our Usage
  Policy" (https://support.claude.com/en/articles/9528712-exceptions-to-our-usage-policy,
  fetched 2026-08-31, page states last updated 2026-03-16) ends with the
  sentence "At this time, this policy only applies to models that are at AI
  Safety Level 2 (ASL-2) under our Responsible Scaling Policy (RSP)." That one
  line is load-bearing — it scopes every government usage-policy exception
  Anthropic grants — and the note had to spend a paragraph explaining ASL-2
  from scratch, because `content/wiki/concept/` (listed 2026-08-31: ai-winter,
  chain-of-thought, distillation, effective-context-length, embeddings,
  emergence, grokking, hallucination, in-context-learning, kv-cache,
  model-collapse, model-context-protocol, reversal-curse, scaling-laws,
  temperature-and-top-p, the-bitter-lesson, tokenization) has no entry to link.
  The note form is specified to "reference the wiki for identity and background
  rather than restating it", so the missing entry is a recurring cost, not a
  one-off. The RSP itself was not fetched during this job and is the entry
  job's first task; a `{{fact:...}}`-bound version and date belong on the entry
  rather than in prose, since the RSP is revised periodically.
---

## The gap, concretely

ASL tiers show up wherever Anthropic's deployment commitments are discussed,
and they are the reference point other labs' frontier-safety frameworks get
measured against. The corpus can currently say "ASL-2" only by explaining it
from scratch every time.

## Why an entry rather than prose

This is a standing definition with a version history, not an event. It is
exactly what the structured layer is for: a `concept` entry costs a reader
nothing, carries the RSP's version and date as bound facts so they cannot rot,
and gives every future post, learn page and tutorial a link instead of a
paragraph. The editorial spec's split applies cleanly — breadth in the data
layer, and the prose bar left to prose.

## Scope note

One entry, `concept/responsible-scaling-policy`, with aliases for "RSP" and
"AI Safety Level". Whether the ASL tiers deserve their own separate entry is a
judgment for the entry job; the case for one entry is that the tiers are
meaningless outside the policy that defines them. This proposal does not ask
for entries on other labs' frontier-safety frameworks — that is a larger
piece of work and should be argued on its own evidence.
