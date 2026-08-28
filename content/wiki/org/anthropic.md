---
id: org/anthropic
kind: org
display_name: Anthropic
status: active
maintenance: stable
aliases:
  - name: Anthropic
    class: exclusive
  - name: Anthropic PBC
    class: shared
facts:
  - field: founded
    source: cited
    value: "January 2021"
    source_url: "https://en.wikipedia.org/wiki/Anthropic"
    accessed: "2026-08-28"
    volatility: static
  - field: headquarters
    source: cited
    value: "San Francisco, California"
    source_url: "https://en.wikipedia.org/wiki/Anthropic"
    accessed: "2026-08-28"
    volatility: slow
  - field: corporate_form
    source: cited
    value: "public benefit corporation"
    source_url: "https://en.wikipedia.org/wiki/Anthropic"
    accessed: "2026-08-28"
    volatility: slow
  - field: valuation
    source: cited
    value: "US$965 billion (May 2026)"
    source_url: "https://en.wikipedia.org/wiki/Anthropic"
    accessed: "2026-08-28"
    volatility: dated
  - field: model_tiers
    source: cited
    value: "Haiku, Sonnet, Opus, Fable, Mythos"
    source_url: "https://www.anthropic.com/news/claude-fable-5-mythos-5"
    accessed: "2026-08-28"
    volatility: slow
  - field: top_tier_access
    source: cited
    value: "Mythos 5 is available to a small set of initial testing partners for cybersecurity, and soon, biology research"
    source_url: "https://www.anthropic.com/claude/mythos"
    accessed: "2026-08-28"
    volatility: slow
timeline:
  - date: "2026-04-07"
    event: "Project Glasswing announced with AWS, Apple, Broadcom, Cisco, CrowdStrike, Google, JPMorganChase, the Linux Foundation, Microsoft, NVIDIA and Palo Alto Networks"
    source_url: "https://www.anthropic.com/claude/mythos"
  - date: "2026-06-09"
    event: "Claude Fable 5 and Claude Mythos 5 announced as a tier above the Opus class"
    source_url: "https://www.anthropic.com/news/claude-fable-5-mythos-5"
  - date: "2026-06-12"
    event: "access to Claude Fable 5 and Claude Mythos 5 suspended"
    source_url: "https://www.anthropic.com/news/claude-fable-5-mythos-5"
  - date: "2026-07-01"
    event: "access restored; Mythos 5 returned to a set of US organisations following US government approval"
    source_url: "https://www.anthropic.com/claude/mythos"
  - date: "2026-07-24"
    event: "Claude Opus 5 released"
    source_url: "https://www.anthropic.com/news/claude-opus-5"
mentions:
  - model/anthropic-claude-opus-5
  - model/anthropic-claude-fable-5
  - model/anthropic-claude-opus-4-5
  - model/anthropic-claude-opus-4-7
  - model/anthropic-claude-opus-4-8
---

Anthropic's most capable model is not on general sale. On 9 June 2026 the
company announced Claude Fable 5 and Claude Mythos 5 in a single post, calling
them "a tier of Claude models that sit above our Opus class in capability" —
and describing them as the same underlying model, separated only by which
safeguards are switched on. Fable 5 shipped everywhere. Mythos 5 went to
Project Glasswing partners with cyber safeguards lifted; select biology
researchers, with biology and chemistry safeguards lifted, are still listed as
coming. The distinction between the model anyone can buy and the model almost
nobody can is a policy setting, not a checkpoint.

Three days later both were withdrawn. The same announcement page carries a
12 June note — "We are suspending access to Claude Fable 5 and Claude Mythos
5" — and a 1 July note saying they were available again. The
[Mythos page](https://www.anthropic.com/claude/mythos) is more specific about
what changed in between: access was restored "for a set of US organizations,
following the US government's approval." A frontier tier was off the market
for nineteen days and came back through a clearance rather than a deploy.

Below that line, the price ladder has been remarkably still. Every Claude
Opus release since `anthropic/claude-opus-4.5`, listed 24 November 2025,
carries the same list price in the OpenRouter catalog — five releases
(`claude-opus-4.5`, `-4.6`, `-4.7`, `-4.8`, `claude-opus-5`) over nine
months at {{fact:model/anthropic-claude-opus-5#price_input}} and
{{fact:model/anthropic-claude-opus-5#price_output}} per token. Anthropic
said as much when it shipped
[Opus 5](https://www.anthropic.com/news/claude-opus-5): improved performance
"for the same cost as its predecessor."

What moved instead was everything else on the row. The listed context window
quintupled at `anthropic/claude-opus-4.6` on 4 February 2026 and now stands
at {{fact:model/anthropic-claude-opus-5#context_window}}. The Artificial
Analysis intelligence index the catalog carries went from
{{fact:model/anthropic-claude-opus-4-7#intelligence_index}} on the April
release to {{fact:model/anthropic-claude-opus-4-8#intelligence_index}} in May
to {{fact:model/anthropic-claude-opus-5#intelligence_index}} in July. Two
step-ups in ninety-nine days, neither of them charged for.
