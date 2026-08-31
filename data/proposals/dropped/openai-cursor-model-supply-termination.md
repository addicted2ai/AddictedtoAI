---
date: 2026-08-31
slug: openai-cursor-model-supply-termination
type: post
status: declined
declined_by_job: j-20260831-03
failed_test: worth a stranger's attention (would-send)
---

# Declined: OpenAI cutting off Cursor after the SpaceX acquisition

## The story considered

On 2026-08-29 OpenAI said it would stop supplying its models to Cursor, with a
cutoff date of **2026-11-12**, following SpaceX's acquisition of Anysphere
(reported as a $60 billion deal closing 2026-08-14). Engadget, fetched
2026-08-31 (https://www.engadget.com/2246969/openai-pull-its-models-from-cursor-due-to-spacexai-acquisition/,
published 2026-08-29), carries OpenAI saying it "can't be confident that SpaceX
will use its technology within its terms of services" and citing "experience with
Elon Musk's companies violating contracts", and quotes Cursor co-founder Michael
Truell putting the exposure at "five percent of the tool's customers".

The candidate angle was not the news but the clause: **which model providers can
terminate supply when their customer changes hands, and does that right appear in
the public terms a developer can actually read?** A survey of change-of-control
and assignment provisions across OpenAI, Anthropic and Google's published
agreements, anchored by the first prominent invocation.

## Which test it failed, and why

**Worth a stranger's attention.** The news half is the most-covered AI story of
the week — CNBC, Engadget, TechCrunch-adjacent trade press, at least ten outlets
in one search retrieved 2026-08-31 — so a recap sends to nobody.

The angle half is the part this site could own, and **the evidence it needs could
not be retrieved during this run.** `https://openai.com/policies/services-agreement/`
returned HTTP 403 to direct fetch on 2026-08-31, as did OpenAI's own statement at
`https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/`
and CNBC's report. Engadget explicitly notes that no specific contractual
provision was publicly identified. Filing a candidate whose entire value rests on
clause text nobody has read would be handing the authoring job a piece it cannot
write honestly — and the failure mode, a post that gestures at "change-of-control
clauses" using consultancy checklists instead of the actual agreements, is the
"correct, sourced and forgettable" outcome this bar exists to refuse.

## What would make it worth refiling

- **OpenAI's business/service terms become fetchable** (a mirror, a versioned
  copy, a regulatory filing) and are found to contain — or conspicuously not to
  contain — a change-of-control termination right. Either result is publishable;
  the absence is arguably the better story, because it would mean the right lives
  only in negotiated enterprise contracts that no developer sees.
- A second provider invokes a similar right against a named customer, which turns
  one incident into a pattern with two data points instead of one.
- The 2026-11-12 cutoff arrives and something measurable changes — model
  availability inside Cursor, pricing, or a migration path — which this site can
  observe directly rather than report at second hand.
- OpenAI or Anysphere/SpaceX files or publishes the notice itself.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing and may be refiled the moment one of the above arrives.
