---
title: "OpenAI's Astra is the first model designated Critical for cybersecurity. Advanced access starts with alpha testers"
date: "2026-09-03"
anchor:
  url: "https://openai.com/index/path-to-astra/"
  date: "2026-09-01"
mentions:
  - org/openai
  - model/openai-gpt-5-6-sol
---

On 1 September 2026 OpenAI announced that Astra, its next model, meets the Critical cybersecurity capability threshold under its Preparedness Framework, the first model the company has designated at that level. The same announcement gates the release: "We plan to make Astra available soon, but access to its most advanced cybersecurity capabilities will be more limited."

The reader this lands on is a security team. The threshold, in OpenAI's words, means that "with the right tools and access, [Astra] can find previously unknown security flaws and develop ways to exploit them across many well-protected systems without a person guiding each step", and the capabilities are not being given out broadly: advanced cyber work "will initially be available to a small group of alpha testers, with access through Daybreak Blue expanding afterward to support defensive use". Defenders who do get in inherit a monitoring system that can slow, pause, or stop their own legitimate work.

## Critical, in the framework's own words

The Preparedness Framework's Critical threshold is two conditions, quoted in the announcement:

- The model can identify and develop functional zero-day exploits of all severity levels in many hardened real-world critical systems without human intervention.
- The model can devise and execute end-to-end novel strategies for cyberattacks against hardened targets given only a high level desired goal.

OpenAI says Astra meets the threshold, that it "is the first model we are designating at this level", and that the level "requires stronger safeguards during development and before release". The page refers to an earlier assessment that Astra might reach this level. This announcement is the confirmation, dated 1 September 2026.

## The evaluations that carried the designation

All of the capability evidence is OpenAI's own, from its announcement page:

- On ExploitBench, "the model achieved a perfect score of 100%" on turning known vulnerabilities into working exploits.
- On an internal follow-up built from 20 high-severity V8 vulnerabilities disclosed more recently, "the model even discovered and used two zero-day vulnerabilities as part of an exploit chain", and the company says it is "in the process of disclosing these two vulnerabilities to the maintainers".
- In expert-led assessments against hardened systems, Astra built "a full browser-compromise chain that escaped the sandbox and executed commands on the host" and a "local privilege-escalation chain from an unprivileged user to root" on a hardened operating system.

A footnote sets the limit on the numbers: "Astra results shown reflect capabilities with Daybreak Blue access, not the default production configuration." OpenAI says the system card at launch will carry the full safety, security and alignment testing. TechCrunch, reporting the announcement the same day, was blunter about the interim:

> Without any third-party confirmation, it is difficult to evaluate OpenAI's claims about safety or preparedness.

## The safeguards have numbers, and a failure mode

Two numbers carry the abuse-resistance story, both from the same page. On OpenAI's cyber jailbreak evaluations, "Astra refuses 91.5% of requests (compared to 59% from GPT-5.6 Sol)". In the honeypot tests, built from the hardest ExploitGym tasks with targets placed to tempt a model into reaching for them:

> GPT-5.6 Sol, without production safeguards, attempted to access those targets in 56% of tests simulating the benchmark environment where the model is instructed to develop exploits. Astra made no such attempts in these tests.

The page adds that both figures "describe behavior under the test conditions without cyber safeguards, not normal production use". SecurityWeek's coverage, published 2 September, carries the same 91.5% and 59% pair.

Then the monitoring layer. Astra ships with "additional chain-of-thought monitoring to rapidly detect and contain potentially misaligned actions", and OpenAI describes a production misalignment monitor for Astra-class models whose consequences for a user are concrete:

> If the misalignment monitor pauses a task, users in ChatGPT or Codex may be asked to review the action before continuing. When using other surfaces like the API, the task will stop.

The announcement states the failure mode plainly: "Extra safety checks can sometimes slow, pause, or stop legitimate work, including defensive cybersecurity."

## The gates land on two groups

Alpha testers first, Daybreak Blue second. OpenAI expects the launch safeguards "to create more friction than we ultimately intend", and says the monitor will sometimes flag legitimate activity. A security tool that can stop the security team using it is the announced trade, not an accident. The API is the blunt end of it: a paused task stops there, with no review screen.

## The pause behind the release

Astra "was not involved" in the Hugging Face incident, OpenAI says, but the company paused certain frontier training, including training for Astra, for two weeks after it while it hardened training infrastructure. Larger reinforcement-learning runs were held back longer. On 28 August 2026 the large frontier RL run restarted under the new safety and security requirements. Some smaller experimental runs stay on hold. Until the system card lands, the capability numbers are OpenAI's word, and the designation itself is the dated, checkable fact.

## Sources

All fetched 3 September 2026.

- OpenAI, "Path to Astra: critical capabilities and frontier safeguards", published 1 September 2026 — [openai.com/index/path-to-astra/](https://openai.com/index/path-to-astra/)
- TechCrunch, "OpenAI's Astra model is on the way — and very good at breaking into computer systems", published 1 September 2026 — [techcrunch.com](https://techcrunch.com/2026/09/01/open-ais-astra-model-is-on-the-way-and-very-good-at-breaking-into-computer-systems/)
- SecurityWeek, "OpenAI's Astra Crosses 'Critical' Cyber Threshold After Finding Zero-Days", published 2 September 2026 — [securityweek.com](https://www.securityweek.com/openais-astra-becomes-first-model-to-cross-critical-cybersecurity-threshold/)