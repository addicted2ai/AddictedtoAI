---
date: 2026-09-02
slug: claude-fable-5-1-mythos-5-1
type: post
summary: >
  A post on Anthropic's Claude Fable 5.1 and Claude Mythos 5.1 launch
  (announced September 1, 2026; OpenRouter rows 2026-09-02) — the same model
  shipped under two safeguard regimes, anchored on the announcement page and
  the llm-releases feed. The note-shaped claims: cache-read pricing cut 75% to
  $0.25/M, making Fable 5.1 about 25% cheaper than Fable 5 on typical
  workloads and up to ~45% on highly agentic ones at unchanged base pricing
  ($10/$50 per Mtok); the benchmark table (Terminal-Bench-Science 52.6% vs
  Fable 5's 24.7%, CursorBench 3.2.0 73.4%, Humanity's Last Exam 65.0% with
  tools); Mythos 5.1 available only through the Cyber Verification Program and
  the Life Sciences Verification Program, the latter developed in partnership
  with the US government; Enterprise Frontier Safeguards giving eligible
  enterprise customers zero-data-retention privacy by hosting data on their
  own cloud infrastructure; and the anti-distillation API change — new API
  accounts can no longer manually edit Claude's prior context in multi-turn
  conversations. Fable 5.1 is also Anthropic's first release carrying the EU
  AI Act text watermark.
evidence: >
  Anthropic announcement "Introducing Claude Fable 5.1 and Claude Mythos
  5.1", fetched 2026-09-02 — https://www.anthropic.com/claude-fable-and-mythos-5-1
  (same model, different safeguards; "Cache reads now cost 75% less, or $0.25
  per million tokens"; typical-workload savings ~25% and up to ~45% for
  "highly agentic" workloads; "$10 per million input tokens and $50 per
  million output tokens"; benchmark table incl. Terminal-Bench-Science 52.6%
  vs 24.7% and CursorBench 3.2.0 73.4% and HLE 65.0% with tools; Mythos 5.1
  via CVP and LSVP, LSVP "developed in partnership with the US government";
  EFS "customers store their data on their own cloud infrastructure"; "it is
  no longer possible for new API accounts... to manually edit Claude's prior
  context"; watermarked outputs per the EU AI Act Code of Practice for models
  released after August 2, 2026). llm-releases feed items, fetched
  2026-09-02 — https://llm-releases.com/models/claude-fable-5-1 and
  https://llm-releases.com/models/claude-mythos-5-1 (pubDate Sep 1, 2026;
  cache reads cut 75% to $0.25/Mtok; 1M context / 128K output; first Anthropic
  release with the EU watermark; Mythos 5.1 "available only through the Cyber
  Verification Program and Life Sciences Verification Program... Access
  limited to vetted US organizations; not publicly token-billed"). The change
  feed carries the OpenRouter arrival rows for anthropic/claude-fable-5.1 and
  its :batch twin, dated 2026-09-02.
expires: 2026-09-09
proposed_by_job: j-20260902-07
proposed_by_type: scout
---

# Claude Fable 5.1 and Claude Mythos 5.1 — one model, two safeguard regimes, ~25–45% cheaper

## Why now

The launch is one day old, it is the largest model announcement of the week,
and most of what a stranger would want to know is not in the change feed: the
cache-read repricing is a cost change every token-paying reader can act on,
the Mythos 5.1 access regime is a policy story with a named partner (the US
government), and the anti-distillation API change lands on every developer
who uses Claude. The feed lines alone — one arrival row plus its batch twin —
capture none of it.

## Would-send test

"Anthropic shipped Fable 5.1 — same model as Mythos 5.1, but 25–45% cheaper
to run via a cache-read repricing, and new API accounts can't edit prior
context anymore." Anyone who pays for Claude tokens, or watches frontier
deployment policy, clicks through. This is the most sendable story of the
sweep: it combines a price change, a safety regime, and a developer-facing
API change in one dated launch, all verified from the announcement page
fetched during this run.

## What the job would produce (done-when)

- The post is anchored on the Anthropic announcement page and the llm-releases
  feed items, both fetched and quoted in this docket, and dated Sep 1–2, 2026.
- The cost math is stated exactly as the announcement states it: cache reads
  at $0.25/M (75% lower), ~25% typical / up to ~45% agentic savings, $10/$50
  per Mtok otherwise, measured "at default effort over four weeks of actual
  usage in August 2026".
- The benchmark claims are reported as Anthropic-reported, with the table's
  own caveats (safeguard interventions zeroing OSWorld/AutomationBench runs,
  the OSWorld 2.0 task-release non-comparability footnote, the
  Terminal-Bench-Science leaderboard reproduction note).
- Mythos 5.1's access programs (CVP, LSVP with US government partnership)
  are stated with their source, including that access is currently limited to
  US organizations.
- Enterprise Frontier Safeguards are described as the announcement describes
  them: customer-hosted infrastructure, phased rollout from this fall, zero
  data retention for eligible customers until then.
- The anti-distillation change (new API accounts cannot manually edit prior
  context in multi-turn conversations, rolling out gradually) is stated with
  the Help Center reference the announcement names.
- The EU AI Act watermark is stated with the Code of Practice date (models
  released after August 2, 2026) and the detection-API rollout.