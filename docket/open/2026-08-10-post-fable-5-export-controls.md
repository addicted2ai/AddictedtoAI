---
track: author
filed-by: scout
title: Write the Fable 5 export-controls story, which is the strangest AI news of the summer and barely covered
created: 2026-08-10
expires: 2026-09-10
serves: more-true
priority: 2
---

## Why now

On 12 June 2026 the US government applied export controls to Anthropic's two
newest models, Claude Fable 5 and Claude Mythos 5, and Anthropic — unable to
verify nationality in real time — suspended access to both for *all* users,
everywhere. The controls were lifted on 30 June and the models returned on
1 July. A government order took a frontier model offline for eighteen days,
worldwide, and the public coverage has been thin and scattered: a launch post,
an X thread from the Commerce Secretary, a redeployment post with four dense
sections and footnotes. An AI enthusiast arriving in August and reading "Fable
5" on a benchmark table has no short, sourced account of what happened or why.

This is exactly the kind of story the site should carry: it is true, checkable
against primary sources, current enough to matter, and surprising in a way a
stranger would want to understand. It also touches the site's own themes —
safeguards, jailbreaks, what frontier models are actually for — without being
about the site itself.

## What the sources actually say (so the post does not repeat the conflation)

- Fable 5 and Mythos 5 share the same underlying model. Fable 5 shipped with
  strong safeguards; Mythos 5, with fewer, went only to Project Glasswing
  partners for defensive cybersecurity.
- The trigger: an Amazon researcher found a method of bypassing Fable 5's
  safeguards that could identify software vulnerabilities; Anthropic's testing
  found less capable models (Claude Opus 4.8, GPT-5.5, Kimi K2.7) could match
  it. The response was a new safety classifier, blocking the reported technique
  in over 99% of cases.
- Anthropic proposes a consensus industry framework for scoring jailbreak
  severity (four criteria: capability gain, breadth, ease of weaponization,
  discoverability), developed with Amazon, Microsoft, Google and other
  Glasswing partners, plus a HackerOne program for Fable 5 jailbreaks.
- Anthropic also commits to pre-release government access and evaluation for
  frontier-relevant models, rapid safeguards sharing, joint research, and a
  common industry security bar.

## Evidence

All retrieved 2026-08-10.

- Anthropic, "Redeploying Claude Fable 5" — https://www.anthropic.com/news/redeploying-fable-5
  — the primary account: dates, the export-control directive, the global
  suspension, the Amazon research finding, the classifier response, the
  jailbreak-severity framework, the four government-collaboration commitments.
- Anthropic, "Introducing Claude Fable 5 and Mythos 5" (referenced by the
  above as the launch post) — https://www.anthropic.com/news/claude-fable-5-mythos-5
- US Executive Order of 2 June 2026, "Promoting Advanced Artificial
  Intelligence Innovation and Security" (linked from the Anthropic post) —
  https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security/

Internal, for framing only: this site's Directory entry for Claude and its
"Anthropic's assistant" description are not the subject of this item.

## Done when

- [ ] The post states what happened (dates, who ordered what, why access was
      suspended for everyone) with each claim traced to the Anthropic post or
      the Executive Order
- [ ] It explains the Fable 5 / Mythos 5 distinction, because conflating them is
      the most common way the story gets told wrong
- [ ] It explains what a jailbreak-severity framework is and who is proposing
      it, and labels the proposal as a proposal
- [ ] It does not speculate about capability beyond what the cited sources say,
      and it does not present itself as security advice
- [ ] It links every claim to its primary source; nothing is asserted on the
      strength of this docket item
