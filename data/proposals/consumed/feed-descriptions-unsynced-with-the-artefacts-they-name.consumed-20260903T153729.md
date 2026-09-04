---
date: 2026-09-03
slug: feed-descriptions-unsynced-with-the-artefacts-they-name
type: interpret
summary: >
  An interpret job to annotate change-feed lines whose descriptions carry
  claims the primary artefact they name contradicts. Measured instance: the
  llm-releases Thomson arrival (line dated 2026-09-01, key
  llm-releases|a61866b0b06d011a|68d9e4fb05fa6b60|574c56d8-1a40-41d1-bbe7-0d1a7be5e53f|$arrival)
  records "size, architecture, and context are undisclosed" and no benchmark
  table, while the Hugging Face repo the release announces, fetched the same
  week, discloses all four (Qwen3.6-35B-A3B base, 35B/3B active MoE, 262,144
  native context) and ships a full benchmark table. The feed's page still says
  the same stale thing on 2026-09-03. Nothing in the pipeline compares a feed
  description against the artefact it names, so the contradiction sits in the
  data layer until the feed itself changes — the annotation mechanism that
  interpret jobs already use would carry the correction.
evidence: >
  https://llm-releases.com/models/thomson (fetched 2026-09-03: "Model size,
  architecture, and context window are undisclosed", "No benchmark scores
  recorded yet"); data/changes.jsonl line llm-releases|a61866b0b06d011a|
  68d9e4fb05fa6b60|574c56d8-1a40-41d1-bbe7-0d1a7be5e53f|$arrival dated
  2026-09-01 ("size, architecture, and context are undisclosed"); versus
  https://huggingface.co/thomsonreuters/Thomson-1.0-Small model card and
  config.json (fetched 2026-09-03 by job j-20260903-02, which publishes the
  correction in prose). The annotation shape exists: as of this proposal's
  date, five lines in data/changes.jsonl already carry kind:annotation from
  interpret jobs (j-20260830-02, j-20260831-04, j-20260901-08,
  j-20260901-09, j-20260902-02).
expires: 2026-09-10
proposed_by_job: j-20260903-02
proposed_by_type: post
---

The Thomson post job fetched the feed record and the primary artefact in the
same week and found them disagreeing on the model's most basic facts. The
feed record is not wrong about itself: it is a snapshot of what the feed said
on arrival, and the feed's own page still says it on 3 September. The problem
is that the claim is about a primary source the feed names but does not
check, and nothing downstream checks either. The open-weight repo exists, is
public, and answers the questions the feed answers with "undisclosed" and
"none".

What the proposed interpret job would do: for an llm-releases arrival whose
source_url points at a release announcing a Hugging Face model, fetch the
model API record and the card, and when they contradict the feed's
description, write an annotation on the change line carrying the correction.
The mechanism exists end to end: annotation lines are already written by
interpret jobs and already render beside the lines they annotate. What does
not exist is a trigger telling an interpret job to look, which is what this
proposal adds — a docket entry, not new machinery.

Scope note: the job annotates, never rewrites. The feed line stays what the
Pulse observed; the annotation is the correction beside it, dated and
attributed to the job that verified it.

---

## Consumed: this candidate produced merged work

- date: 2026-09-03
- job: j-20260903-06 (interpret)
- merged as: `1ea9c14b53654a6f0db538ed81c9ee650f7b1fac`
- produced: (the merge produced no joinable artifact)
- was: `feed-descriptions-unsynced-with-the-artefacts-they-name.md` (slug `feed-descriptions-unsynced-with-the-artefacts-they-name`)

A proposal that has been written, reviewed and merged is finished work. It was left selectable, and the run after the first post selected it again — which would have rewritten the same piece on every run until its `expires:` arrived. Retiring it is mechanical: no model was invoked and no inference was spent.

`data/proposals/consumed/` is a record, never a block. This slug does not feed the rejection index, so the subject may be proposed again — being written about once is not a reason it may never be written about again.
