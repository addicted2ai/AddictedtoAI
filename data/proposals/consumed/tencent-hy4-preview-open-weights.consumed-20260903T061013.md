---
date: 2026-09-01
slug: tencent-hy4-preview-open-weights
type: entry
summary: >
  An entry for Tencent Hy4 preview, released and open-sourced 2026-08-28:
  770B-total / 49B-active MoE, context exceeding 1M tokens, licensed
  Apache-2.0 (verified from the LICENSE file on the Hugging Face repo),
  API pricing $0.834 in / $2.501 out / $0.042 cache-hit per million tokens,
  free for two weeks on WorkBuddy and CodeBuddy, with Tencent's internal
  blind evaluation (163 experts, 203 tasks) scoring it 2.99/4.00 versus
  GLM-5.3 at 2.92 and Kimi K3 at 2.94. The data layer already has a
  feed-bound stub (model/tencent-hy4-preview); the job would write the
  entry's prose and stable facts against primary sources and mark
  vendor-only claims (the self-improvement loop, the 31.8% inference
  throughput gain) as claims with dates.
evidence: >
  Tencent press release "Tencent Releases and Open-Sources Tencent Hy4
  preview", August 28, 2026, fetched 2026-09-01 —
  https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/
  (770B/49B, 1M+ context, free two weeks on WorkBuddy/CodeBuddy, Hy3 free
  extended to September 30, blind eval 2.99 vs 2.92 vs 2.94, API pricing,
  +31.8% throughput claim, next Hy4 batch "expected to roll out soon").
  The Apache-2.0 LICENSE on the Hugging Face repo, fetched 2026-09-01 —
  https://huggingface.co/tencent/Hy4-preview/raw/main/LICENSE ("Tencent Hy4
  preview is licensed under the Apache-2.0", Copyright (C) 2026 Tencent).
  Context: the llm-releases feed item fetched 2026-09-01 —
  https://llm-releases.com/models/hy4-preview (preview stage; vendor figures
  unverified at launch).
expires: 2026-09-08
proposed_by_job: j-20260901-07
proposed_by_type: scout
---

# Tencent Hy4 preview — open weights, verified licence

## Why now

The release is four days old, the wiki stub is still empty of prose, and
this is the one open release of the week whose licence I verified directly
from the primary document (Apache-2.0, not the bespoke licences that
accompany the other flagship open releases this week). The entry's facts
are all fetchable from the press release and the model card, and its
price point ($0.834/$2.501 per Mtok for a 770B open MoE) is the kind of
number this site's readers compare.

## Would-send test

The would-SEND form: "Tencent open-sourced Hy4 preview — 770B MoE, 1M
context, Apache-2.0, $0.83/M in — their blind eval puts it a hair ahead
of GLM-5.3 and Kimi K3." An open-model watcher clicks through. This is
ranked third because the two posts above carry angles no summary can
produce, while the entry's value is durable facts.

## What the job would produce (done-when)

- The entry fills model/tencent-hy4-preview with stable facts sourced to
  the press release (parameters, context, licence, launch date, pricing)
  and keeps the feed bindings for volatile fields.
- The blind-evaluation result is recorded as Tencent-internal (163 experts,
  203 engineering tasks, 2.99/4.00 vs GLM-5.3 2.92 and Kimi K3 2.94) with
  the release as its source and the date.
- Vendor-only claims (recursive self-improvement loop, +31.8% throughput
  from autonomous inference optimisation) are attributed as claims, not
  facts.
- The entry states the free-two-weeks window and the Hy3 extension to
  September 30 with dates.
- Every source fetched during the job carries its retrieval date.


---

## Consumed: this candidate produced merged work

- date: 2026-09-03
- job: j-20260902-25 (entry)
- merged as: `c67e202a6e01ba24eaa7aa6563a360278320cd60`
- produced: `content/wiki/model/tencent-hy4-preview.md`
- was: `tencent-hy4-preview-open-weights.md` (slug `tencent-hy4-preview-open-weights`)

A proposal that has been written, reviewed and merged is finished work. It was left selectable, and the run after the first post selected it again — which would have rewritten the same piece on every run until its `expires:` arrived. Retiring it is mechanical: no model was invoked and no inference was spent.

`data/proposals/consumed/` is a record, never a block. This slug does not feed the rejection index, so the subject may be proposed again — being written about once is not a reason it may never be written about again.
