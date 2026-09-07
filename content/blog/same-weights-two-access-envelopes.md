---
title: "Anthropic and Google each shipped one model in two safeguard tiers in three days, and OpenAI promised the second tier without shipping it. Two of the three describe the permissive cyber tier in the future tense."
date: "2026-09-07"
mentions:
  - org/anthropic
  - org/google-deepmind
  - org/openai
  - model/anthropic-claude-fable-5-1
  - model/google-gemini-3-8-flash
  - model/openai-gpt-6-astra
  - concept/openai-daybreak
frontier: true
frontier_reason: "F5"
---

Between 1 and 3 September 2026 three labs released a new frontier model, and each of them described two safeguard settings for it rather than one. Anthropic gave the looser setting its own name and its own release. So did Google. OpenAI did not, and said the loosening is coming. In all three, reaching the looser setting means being admitted to a programme the vendor runs.

The thing being rationed is not the model. It is the permission to use it, and the gate is a programme the vendor admits you to.

## Anthropic says "identical". Google says "the same foundational intelligence". The distance between those matters.

[Anthropic](/wiki/org/anthropic) is the blunt one. Its announcement page opens on the pair: "Claude Fable 5.1 and Claude Mythos 5.1 are the same model, but with different levels of safeguards. Fable 5.1 is generally available, while Mythos 5.1 is available only through our trusted access programs." Further down it repeats the claim without hedging: "Claude Mythos 5.1 is identical to Fable 5.1, but it offers more permissive safeguards for vetted individuals and organizations whose work is affected by the cybersecurity and life sciences restrictions outlined above." Two products, one model, two safeguard configurations.

[Google](/wiki/org/google-deepmind), a day later, says something adjacent but weaker: "While tailored for different deployment environments, both of today's releases are powered by the same foundational intelligence." Same core, tailored differently. Not the same artefact. Gemini 3.8 Flash Cyber "ships with a more permissive set of mitigations for cybersecurity, and as such, is only available to trusted defenders who require a more comprehensive set of cyber capabilities."

[OpenAI](/wiki/org/openai) shipped one model id and split it on the time axis instead. The GPT-6 Astra release page, dated 3 September, says defenders can use the launch version "to complete tasks such as secure code review and patching. However, Astra will refuse to comply with more advanced cybersecurity tasks such as creating proof-of-concept exploits for vulnerabilities." Then: "Through OpenAI [Daybreak](/wiki/concept/openai-daybreak), we plan to expand access and roll out less restrictive safeguards in the coming weeks." Same trade, no second name.

This site covered the OpenAI half twice as it happened, in [the Critical designation on 1 September](/blog/openai-astra-critical-designation) and [the $1B Daybreak commitment on 3 September](/blog/openai-daybreak-frontline-defenders). What neither post had was the other two labs doing the same thing on the days either side of it.

## The gate opened before the thing behind it did

Anthropic names two trusted access programmes for Mythos 5.1. Only one of them can hand you the model today.

The Life Sciences Verification Program has people in it: "In partnership with the US government, we have enrolled our first participants, and we plan to expand access to this program to the broader life sciences community." The Cyber Verification Program does not, and Anthropic says so on the same page, in a sentence that is easy to read past: "The CVP currently provides access to certain Opus- and Sonnet-class models with reduced cyber safeguards for defensive security work. In the near future, this program will also include access to Claude Mythos-class models."

So on 7 September, six days after launch, a cyberdefender admitted to the CVP gets Opus- and Sonnet-class models with reduced safeguards. Not Mythos 5.1. The page's own call to action matches: "To register interest in access to Claude Mythos 5.1 for cyberdefense through the CVP, head here." Register interest. That is a waiting list, not a door.

OpenAI is in the same position by its own wording. The 3 September release page promises the less restrictive safeguards "in the coming weeks", and the 1 September Path to Astra page it follows says that "Access to Astra for advanced cybersecurity workflows will initially be available to a small group of alpha testers, with access through Daybreak Blue expanding afterward to support defensive use." A small group, then a bigger one, at some point.

Google is the exception. Fairwind is described in the present tense — "Through our new Fairwind Program, we're providing trusted government authorities, as well as critical infrastructure operators and software maintainers with prioritized access to Gemini 3.8 Flash Cyber" — and the page ends with a live "Apply for access" link. Whether anyone has been let through, the page does not say.

## The refused tasks have names, and they are the ones security teams do

Both companies are specific enough about what the general tier still refuses that a reader can check their own work against it.

Anthropic loosened the general tier and published the residue. Fable 5.1 may now be used "to conduct the kind of defensive work that improves software security", and Claude Code users "can expect an average of around 60% fewer interventions per session from our cyber safeguards, relative to the previous safeguards on Fable 5." But the safeguards "still redirect several kinds of dual-use cybersecurity tasks (tasks that might have helpful or harmful applications) to our Opus models. This includes penetration testing, exploit generation, and binary-based vulnerability scanning."

OpenAI's residue is one clause: Astra "will refuse to comply with more advanced cybersecurity tasks such as creating proof-of-concept exploits for vulnerabilities."

Penetration testing, exploit generation, binary vulnerability scanning, proof-of-concept exploits. That is not an exotic edge of the field; it is a red team's Tuesday. On the general tier of two of the three new flagships, that work is refused or downgraded to an older model, and the route to the version that will do it runs through a form.

## A government is named in the admission criteria, and once in the reason access came back

Anthropic's page puts the US government in twice. The biology programme was "developed in partnership with the US government", and geography is a condition of entry: Mythos 5.1 "is available to vetted cyberdefenders and life scientists. Currently, it is only available to a set of US organizations, though we're coordinating with the US government to expand access to a broader set of domestic and international partners as quickly as possible."

Google's Fairwind names "trusted government authorities" first among its three eligible categories, ahead of critical infrastructure operators and software maintainers.

The Anthropic case has a precedent with a date on it, on Anthropic's own Mythos product page. Under the heading "Claude Mythos 5 export controls have been lifted", dated 1 July 2026: "We have restored access to Mythos 5 for a set of US organizations, following the US government's approval." Three weeks earlier the same page carries "Claude Mythos 5 is currently unavailable", dated 12 June 2026. What that approval covered, the page does not say.

## What the vendors publish is the gate, not the roll

No count of the organisations actually inside the CVP, the LSVP or Fairwind appears on any of the five vendor pages, and there is no way to get one from outside. Anthropic says "a set of US organizations" and "our first participants". Google says "trusted defenders". OpenAI said "a small group of alpha testers" on 1 September and has not published a number since. Every one of those is a quantity written as a word.

There is one thing the outside can see. The change feed behind this site holds 186 recorded changes, of which 95 are gateway catalog rows, each keyed to an individual model id. Not one of those 95 ids contains "mythos" or "cyber". The feed does carry both gated models — as release announcements, on 3 and 4 September — but a release announcement is the vendor talking, not a row you can buy from. The generally available twin of each release turned up in the gateway on schedule: `anthropic/claude-fable-5.1` on 2 September, `google/gemini-3.8-flash` on 3 September, `openai/gpt-6-astra` on 5 September.

That absence proves nothing by itself. A model you have to apply for has nothing for a router to route, so its absence from a routing catalog is the gate working as designed rather than evidence of it. What it shows is the consequence. Every ordinary way of reaching a new frontier model, a gateway or a model card or a price per million tokens, is built around models you can simply buy. For the permissive half of these three releases none of that machinery has anything to point at, and it is not going to.

## The pages, and how they were read

The shape above came from five vendor pages, fetched on 7 September 2026, filtered to releases in the first week of September 2026 where the vendor's own page states two access settings over one underlying model. For each, three sentences: what the vendor says about the two versions being one model, who may use the permissive version, and how admission works. Then a fourth question, which is where the finding came from. Is the new model available through the programme now, in the vendor's own tense?

The Anthropic announcement page carries no publication date in its markup. The 1 September date is Anthropic's, from its Claude Mythos product page, which lists "Introducing Claude Mythos 5.1" as dated Sep 1, 2026 and links to it. The other pages date themselves.

- Anthropic, *Claude Fable 5.1 and Claude Mythos 5.1*, dated 1 September 2026 by Anthropic's Mythos page — [anthropic.com](https://www.anthropic.com/claude-fable-and-mythos-5-1)
- Anthropic, *Claude Mythos* product page, carrying the Mythos announcement timeline including the 1 July 2026 export-controls entry — [anthropic.com/claude/mythos](https://www.anthropic.com/claude/mythos)
- Google, *Gemini 3.8 Flash and 3.8 Flash Cyber*, `datePublished` 2 September 2026 — [blog.google](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/)
- OpenAI, *GPT-6 Astra: A new generation of intelligence*, dated 3 September 2026 — [openai.com](https://openai.com/index/gpt-6-astra/)
- OpenAI, *Path to Astra: critical capabilities and frontier safeguards*, dated 1 September 2026 — [openai.com](https://openai.com/index/path-to-astra/)
