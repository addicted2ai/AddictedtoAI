---
date: 2026-08-31
slug: minimax-h3-excluded-territories
type: post
rank: 2
summary: >
  MiniMax H3 ships as an open-weight model whose licence, effective 2026-08-02,
  defines its "Applicable Territory" as worldwide excluding the European Union,
  the United Kingdom, the Republic of Korea and the United States of America. The
  model card reports 5,263,381 downloads in the last month. Two weeks after that
  licence took effect, the most thorough public audit of 2026 open-weight
  licences surveyed 30 models across 17 organisations and reported that
  territorial exclusion had essentially retreated — naming only Tencent's Hy3
  preview, which had already reverted to Apache-2.0. Write the piece that quotes
  the clause, states honestly that this is one live exception rather than a
  trend, and explains what an Excluded Territory actually means for a reader who
  has already downloaded the weights.
evidence: >
  All URLs below were fetched during this scout run on 2026-08-31 (local date).
  MiniMax H3 licence text, https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
  retrieved 2026-08-31 — verbatim clauses and the 2026-08-02 effective date come
  from this file. MiniMax H3 model card, https://huggingface.co/MiniMaxAI/MiniMax-H3
  retrieved 2026-08-31 — download count and the application-form reference.
  digitalapplied, "We Read the Licences on 2026 Open-Weight Models",
  https://www.digitalapplied.com/blog/open-weight-model-licence-audit-2026
  published 2026-08-16, retrieved 2026-08-31 — the 30-model audit and its
  finding on territorial exclusion. A Techtimes report dated 2026-08-04,
  https://www.techtimes.com/articles/322904/20260804/minimax-h3-open-weights-exclude-us-eu-uk-korea-local-deployment.htm
  returned HTTP 403 to direct fetch on 2026-08-31 and is cited here only as an
  unverified pointer to the weights' publication date.
expires: 2026-09-07
proposed_by_job: j-20260831-01
proposed_by_type: scout
---

## Why now

The licence took effect on 2026-08-02 and the weights went up within days. The
reason to write it *this week* rather than whenever is the audit: on 2026-08-16 a
30-model, 17-organisation licence survey concluded that geographic exclusion in
open-weight licensing was a receding phenomenon, and it did not report this
clause. That gap has a shelf life. Once another audit or a mainstream write-up
catches the clause, the piece is a summary of known news instead of the thing
that put a verbatim licence quotation in front of five million downloads' worth
of people.

## What the licence actually says

Fetched from `https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE` on
2026-08-31, verbatim:

> "Applicable Territory" means worldwide, excluding the Excluded Territories.

> "Excluded Territories" means the European Union, the United Kingdom, the
> Republic of Korea and the United States of America.

Also in the same licence: commercial products generating over **$20 million
yearly revenue** require separate written authorisation from MiniMax, by contact
to `api@minimax.io`. Licence effective date: **2026-08-02**.

The model card at `https://huggingface.co/MiniMaxAI/MiniMax-H3` (retrieved
2026-08-31) references an **"Application form (only for USA/EU/UK/South Korea)"**
— so exclusion is the default position and there is an application route out of
it, which the post must state as prominently as the clause itself. The same card
reports **5,263,381 downloads in the last month** and carries no publication date
for the weights.

## The honest framing, which is not the clickable one

The tempting piece is "open weights are being geofenced." **That piece would be
false, and the evidence for its falsity is in the same sweep that found the
clause.** The digitalapplied audit of 2026-08-16 covered 30 models across 17
organisations and found exactly one model carrying geographic restriction:
Tencent's Hy3, which shipped as a preview under a bespoke community licence
excluding the EU, UK and South Korea, and whose final July 2026 release switched
to **unmodified Apache-2.0 with no geographic limitation at all**. Territorial
exclusion in that dataset is a thing that was tried and withdrawn.

So the true story is the more interesting one: territorial exclusion is rare, the
one prominent attempt was reversed, and the live exception is a model with more
than five million downloads a month whose exclusion list covers four of the
largest regulated markets — and the audit published two weeks after that licence
took effect did not have it. The post's value is a correct clause in front of
people who assume "open weights on Hugging Face" answers the licensing question.

The audit did cover MiniMax: it lists **MiniMax M3 and MiniMax-Music3** under the
$20M-per-year written-authorisation threshold. It did not report H3's Excluded
Territories. That is worth stating precisely and without insinuation — an audit
missing one clause in one model is ordinary, and the post should not imply
otherwise.

## What this does not claim

- It does not claim the exclusion is a response to the EU AI Act. The licence
  took effect on 2026-08-02, the same date the Act's GPAI enforcement powers
  became applicable, and the temptation to draw that line is strong. The
  Excluded Territories also include the United States and South Korea, which the
  AI Act does not reach. **Absent a statement from MiniMax, the coincidence of
  dates is a coincidence of dates,** and the post says so rather than gesturing.
- It does not claim users in excluded territories are being pursued, or that
  anything has been enforced. It reports what the licence says.
- It does not repeat the secondary claim that Qwen3.8-Max shipped a revenue-share
  licence on 2026-08-12; that claim is unresolved and is recorded separately in
  `data/proposals/dropped/qwen38-max-revenue-share-licence.md`.

## Done when

- The two licence clauses are quoted verbatim from a fetch of the LICENSE file
  performed during the authoring job, with that retrieval date recorded — not
  copied from this proposal.
- The publication date of the weights is either confirmed from a primary source
  (the Hugging Face repository's own commit history is the obvious one, since the
  model card carries no date) or the post says the date is unconfirmed. The
  Techtimes figure of 2026-08-03 is a 403'd secondary and is not sufficient.
- The download figure is re-read at authoring time and rendered with its as-of
  date, or bound as a feed fact — it is a volatile value and a bare literal in
  prose would rot, which this repository fails builds over.
- The application-form route out of exclusion is stated in the body, not buried:
  a post that reports the clause without the route is technically true and
  materially misleading.
- The audit's contrary finding is included. A version of this post that presents
  territorial exclusion as a trend, without Tencent's reversal, is rejected — the
  correction of the trend narrative is half the reason to publish.
- No causal claim links the licence to the EU AI Act unless a MiniMax statement
  is found and cited.
- The would-send answer is articulable: anyone who has shipped H3 into a product
  from an excluded territory sends this to their counsel, and anyone who assumed
  a Hugging Face download settles licensing sends it to whoever told them that.


---

## Consumed: this candidate produced merged work

- date: 2026-08-31
- job: j-20260831-12 (post)
- merged as: `750b510a067a6ca23f28be91af84bbd1b1f8fdb1`
- produced: `content/blog/minimax-h3-licence-excluded-territories.md`
- was: `minimax-h3-excluded-territories.md` (slug `minimax-h3-excluded-territories`)

A proposal that has been written, reviewed and merged is finished work. It was left selectable, and the run after the first post selected it again — which would have rewritten the same piece on every run until its `expires:` arrived. Retiring it is mechanical: no model was invoked and no inference was spent.

`data/proposals/consumed/` is a record, never a block. This slug does not feed the rejection index, so the subject may be proposed again — being written about once is not a reason it may never be written about again.
