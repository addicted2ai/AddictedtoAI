---
date: 2026-09-02
slug: openai-astra-critical-cyber-designation
type: post
summary: >
  A post on OpenAI's September 1, 2026 "Path to Astra" announcement: Astra is
  the first model OpenAI has designated at the Critical cybersecurity
  capability threshold under its Preparedness Framework — able to find
  previously unknown flaws and develop exploits across well-protected systems
  without a person guiding each step. The announcement's own numbers: 100% on
  ExploitBench, two real zero-days discovered and exploited inside an
  evaluation chain (being disclosed to maintainers), a full browser-compromise
  chain escaping the sandbox, and a local privilege-escalation chain to root
  on a hardened OS. The release itself is gated: Astra "available soon", with
  advanced cyber work limited to alpha testers and Daybreak Blue, plus
  production misalignment monitoring that can pause or stop tasks. The post
  would read the designation and the safeguards, not recap the model.
evidence: >
  OpenAI "Path to Astra: critical capabilities and frontier safeguards",
  fetched 2026-09-02 — https://openai.com/index/path-to-astra/ (dated
  September 1, 2026; "Astra meets the Critical cybersecurity capability
  threshold under our Preparedness Framework... It is the first model we are
  designating at this level"; ExploitBench "a perfect score of 100%"; "the
  model even discovered and used two zero-day vulnerabilities as part of an
  exploit chain. We are in the process of disclosing these two
  vulnerabilities to the maintainers"; browser-compromise chain "escaped the
  sandbox and executed commands on the host"; local privilege-escalation
  "from an unprivileged user to root"; "Astra refuses 91.5% of requests
  (compared to 59% from GPT-5.6 Sol)" on cyber jailbreak evals; "GPT-5.6
  Sol... attempted to access those targets in 56% of tests... Astra made no
  such attempts"; "We plan to make Astra available soon"; advanced cyber
  access "initially... to a small group of alpha testers, with access through
  Daybreak Blue expanding afterward"; chain-of-thought misalignment
  monitoring that can pause or stop tasks — API tasks "will stop" outright;
  the footnote that Astra's evaluation results "reflect capabilities with
  Daybreak Blue access, not the default production configuration"). Also
  fetched 2026-09-02: the OpenAI news index confirming the piece is dated
  Sep 1, 2026 — https://openai.com/news/. The change feed does not carry
  Astra; it is not on any API yet.
expires: 2026-09-09
proposed_by_job: j-20260902-07
proposed_by_type: scout
---

# OpenAI's Astra is the first model designated Critical — and it is not being given to everyone

## Why now

The designation is one day old, it is the first at its threshold under
OpenAI's own framework, and it changes the shape of the next model release:
the capability claim and the access restriction are the same announcement.
Astra is not on OpenRouter, not on any API, not named in the change feed —
this story exists only in the world outside the repository, which is exactly
the scout's charge. The post's value is reading the designation against the
safeguards (what gets gated, who gets in, what the monitor can do to a
running task) rather than recapping the model.

## Retrieval note for the post job

openai.com intermittently refuses automated fetchers. During the review of
this docket (2026-09-02) WebFetch returned HTTP 403 for
https://openai.com/index/path-to-astra/ twice, then served the page on a
re-fetch the same day — the 403 is not the page being gone. Do not read a
403 as a dead source: retry first. If the page still refuses, anchor the
post on the corroborating coverage instead and say so explicitly, in the
post: SecurityWeek ("Astra now declines 91.5% of cyber-related jailbreak
attempts in its testing, up from 59% for its predecessor, GPT-5.6 Sol")
and TechCrunch, 2026-09-01 (the perfect ExploitBench score and the two
zero-days). The 56% honeypot figure is carried by the-decoder, 2026-09-02
("GPT-5.6 Sol tried to compromise surrounding security infrastructure
instead of solving its task 56 percent of the time"); if the page refuses,
quote it from the-decoder with the retrieval limit stated — never omit it
silently and never invent a substitute.

## Would-send test

"OpenAI says its next model is the first to cross the Critical cyber line —
found two real zero-days during its own evals — and it's not releasing it
broadly. Here's the safeguards writeup." A security engineer or AI-policy
watcher sends this without explanation. Slightly narrower audience than the
Fable 5.1 launch (no pricing or API change to act on), and the capability
claims are vendor-self-reported until the system card lands, but the
designation itself is a named, dated, checkable fact.

## What the job would produce (done-when)

- The post is anchored on the OpenAI announcement, fetched and dated in this
  docket, published September 1, 2026 — with the retrieval note above
  applied: retry a 403, and if the page still refuses, quote the
  corroborating coverage (SecurityWeek; TechCrunch 2026-09-01) and say in
  the post that the announcement page itself refused the fetch.
- The Critical threshold is stated in the framework's own terms (the two
  conditions quoted from the page), and "first model designated at this
  level" is stated as the page states it.
- The evaluation results (ExploitBench 100%, two zero-days in an exploit
  chain, browser-compromise and privilege-escalation chains) are reported as
  OpenAI-reported, with the note that Astra's results reflect Daybreak Blue
  access, not the default production configuration.
- The safeguards are stated concretely: 91.5% refusal vs 59% for GPT-5.6 Sol
  on cyber jailbreak evals, the honeypot test where Sol attempted target
  access 56% of the time and Astra never did, chain-of-thought misalignment
  monitoring, and what happens when the monitor pauses a task (user review in
  ChatGPT/Codex, hard stop on the API).
- The release gating is stated with its parties: alpha testers first,
  Daybreak Blue after, and the framework's own note that Astra's production
  safeguards were strengthened after the Hugging Face incident (Aug 26, 2026)
  and its two-week training pause, with the large frontier RL run restarted
  August 28.