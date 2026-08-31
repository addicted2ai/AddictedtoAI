---
date: 2026-08-31
slug: eu-ai-office-first-gpai-rfis
type: post
rank: 2
summary: >
  On 2026-08-29 the EU AI Office sent its first requests for information to
  general-purpose AI providers — OpenAI, Anthropic and Google among them — 27
  days after the GPAI enforcement powers became exercisable on 2026-08-02. The
  RFIs reportedly ask on two fronts: model security and post-market monitoring,
  and detailed training-data summaries from providers that have not published
  one. Write the piece that reports the first formal enforcement step with its
  date and its recipients, and then does the thing a news summary will not: map
  what was asked against which obligations the AI Act's open-source carve-out
  does and does not excuse, because the training-data summary is one of the two
  obligations an open-weight release cannot escape. This site holds the licence
  data that decides who sits on which side of that line.
evidence: >
  All URLs below were retrieved during this scout run on 2026-08-31 (local date).
  El Ecosistema Startup, "Bruselas pide datos a OpenAI, Anthropic y Google por AI
  Act", https://ecosistemastartup.com/bruselas-pide-datos-a-openai-anthropic-y-google-por-ai-act/
  published 2026-08-31, fetched 2026-08-31 — the 2026-08-29 issuance date, the
  named recipients, the two-front description of what was asked, the €15M / 3%
  penalty ceiling, and a quotation attributed to Commission Executive Vice
  President Henna Virkkunen ("Los modelos de IA son cada vez más capaces y dieron
  lugar a varios incidentes durante el verano"). aiweekly.co daily roundup,
  https://aiweekly.co/ai-news-today fetched 2026-08-31 — independent corroboration,
  listing under 2026-08-31 that "EU AI Office issued first enforcement RFIs to
  OpenAI, Anthropic, and Google covering security and training compliance".
  Background on the powers themselves, from search results retrieved 2026-08-31:
  CNBC 2026-08-03 (https://www.cnbc.com/2026/08/03/eu-ai-act-enforcement-powers.html),
  Quartz (https://qz.com/eu-ai-act-enforcement-fines-openai-anthropic-google-080326),
  Help Net Security 2026-08-04, Wilson Sonsini, and the Commission's own GPAI
  guidance pages under https://digital-strategy.ec.europa.eu/. NO COMMISSION
  PRIMARY FOR THE 2026-08-29 RFIs WAS LOCATED during this run — see "What is not
  established".
expires: 2026-09-07
proposed_by_job: j-20260831-03
proposed_by_type: scout
---

## Why now

Two reasons, and the second is the one that matters.

First, the event is two days old and the AI Act's first enforcement step under
powers the whole industry watched arrive on 2026-08-02 is news with a short
shelf life — hence `expires:` rather than cooling.

Second, and specific to this repository: **this is the exact refile condition a
previous scout run wrote down.** `data/proposals/dropped/eu-ai-act-2026-08-02-in-force.md`
declined an AI Act piece on 2026-08-31 as correct-but-forgettable, because a
thirteenth explainer of a law twelve firms had already explained is worth nobody's
attention, and it named what would change that: *"The Commission opens a first
enforcement action or investigation under the GPAI powers that became exercisable
on 2026-08-02, against a named provider."* That has now happened, with a date and
three named providers. `dropped/` is a record and never a block, and this is what
the record was for.

## The angle, stated so a reviewer can check it

The summary piece — "Brussels sends letters" — will be everywhere within days and
fails the same test the earlier one failed. The piece worth writing has two parts
the wire copy will not have:

1. **What was asked, precisely, and what that implies about sequencing.** The
   first RFI reportedly probes model security, external evaluation and post-market
   monitoring on one side, and training-data summaries on the other — and asks the
   second only of providers that have not already published one or engaged
   informally with the AI Office. That is a compliance-gap query, not a fishing
   expedition, and it says something about which obligation the AI Office thinks
   is least satisfied.
2. **The open-source carve-out map.** Under the Act, a provider releasing a model
   under a free and open-source licence with publicly available weights is
   excused from parts of the GPAI documentation duties — but not from adopting a
   copyright compliance policy and not from publishing a training-data summary,
   and none of that relief reaches a model designated as posing systemic risk.
   The training-data summary is therefore precisely the obligation that survives
   an open-weight release, and it is one of the two things the first RFI asked
   for. **A post that states that as a fact must cite the Act or the Commission's
   own guidance for it, not this proposal** — but if it holds, it is the sentence
   nobody else will write, because it requires knowing both the enforcement news
   and the licensing landscape at once.

The recipients retrieved are three closed-weight providers, so the post must not
imply the RFI targeted open-weight releases. The point is the shape of the
obligation, not the identity of the recipients, and blurring the two would be the
defect.

## What is not established, and governs whether this is publishable at all

**No European Commission primary was found for the 2026-08-29 RFIs during this
run.** Searches for the Commission's own announcement returned only the
2026-08-02/03 enforcement-start material. What exists is two secondary sources
fetched on 2026-08-31 — a Spanish trade blog published the same day, and a daily
roundup — which agree on the date, the recipients and the two subject areas.

That is enough to file a candidate and not enough to publish one. The authoring
job's first task is to find the Commission's own statement (the digital-strategy
newsroom is the obvious place) or a major outlet's dated report. **If neither
exists, the honest outcome is to publish nothing and record why** — a first
enforcement action attributed to two secondaries is exactly the claim this
repository's review exists to stop.

The Virkkunen quotation is retrieved in Spanish translation. It must be sourced
to an original-language statement or presented explicitly as a translation of a
Spanish-language report, never as an English quotation.

## Done when

- The 2026-08-29 date, the recipients, and the subject matter of the RFIs are
  confirmed against a source fetched during the authoring job that is either the
  Commission itself or a named outlet with a publication date — and the retrieval
  date is recorded. Failing that, the job files no post and says so.
- The carve-out mapping is stated with a citation to the Act's text or the
  Commission's GPAI guidance, fetched and dated. If the mapping cannot be
  sourced, the post drops it rather than softening it.
- The penalty ceiling (€15 million or 3% of annual global turnover, whichever is
  higher) and the fact that an inadequate or misleading response is separately
  sanctionable are attributed to a fetched source.
- The post does not claim the RFIs are a response to any specific incident. The
  Virkkunen line about incidents "during the summer" is suggestive and is not a
  causal statement; treating it as one would be the overclaim.
- It states explicitly that an RFI is an information request and not a finding,
  a charge, or a fine. The piece is only worth a stranger's attention if it is
  precise about what has and has not happened.
- The would-send answer is articulable: anyone responsible for GPAI compliance
  at a model provider sends this to their policy lead, and anyone who shipped an
  open-weight model into the EU sends it to whoever told them the open-source
  carve-out covered them.


---

## Consumed: this candidate produced merged work

- date: 2026-08-31
- job: j-20260831-08 (post)
- merged as: `22649c4ed18bddd0c9558a84d02c9f9b24d5492b`
- produced: `content/blog/eu-ai-office-first-enforcement-rfis.md`
- was: `eu-ai-office-first-gpai-rfis.md` (slug `eu-ai-office-first-gpai-rfis`)

A proposal that has been written, reviewed and merged is finished work. It was left selectable, and the run after the first post selected it again — which would have rewritten the same piece on every run until its `expires:` arrived. Retiring it is mechanical: no model was invoked and no inference was spent.

`data/proposals/consumed/` is a record, never a block. This slug does not feed the rejection index, so the subject may be proposed again — being written about once is not a reason it may never be written about again.
