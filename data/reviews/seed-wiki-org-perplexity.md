---
job: seed-wiki-org-perplexity
verdict: revise
reasons: [false-or-unsupported-claim]
would-cite: >-
  For the argument about whether Perplexity charges you for its own
  homework: the documented billing model — retrieved citation tokens billed
  back as input, the catalog's highest per-search fee at $18 per thousand,
  and the only separate reasoning meter outside Google's Gemini family —
  each figure re-measured against the snapshot.
reviewer: r6-fable
date: 2026-08-28
---

Checklist: wiki org entry built on pricing-structure censuses over the
OpenRouter snapshot. Censuses re-run by script against
`data/sources/openrouter-models/latest.json` (2026-08-28, 388 rows); sources
fetched 2026-08-28.

Verified by measurement (r6-fable-census.mjs):
- Exactly 30 rows price internal_reasoning above zero; 29 are gemini-* rows
  (27 `google/` + 2 `~google/` alias rows, every id containing "gemini");
  the thirtieth is perplexity/sonar-deep-research at $3/M. "Outside Google's
  family, no vendor bills reasoning separately at all" — confirmed across
  the whole snapshot.
- Exactly 123 rows carry a per-search (web_search) price above zero;
  sonar-pro-search's $0.018/search is the maximum; Google's top is $0.014,
  OpenAI's and Anthropic's $0.010 — "above Google's, and nearly twice what
  OpenAI and Anthropic charge" is measured (1.8x).
- Five perplexity rows, none with a Hugging Face id; newest is
  sonar-pro-search, created 2025-10-30. Exact.

Verified by fetching:
- openrouter.ai/perplexity/sonar-deep-research — "Input tokens comprise of
  Prompt tokens (user prompt) + Citation tokens (these are processed tokens
  from running searches)" verbatim; reasoning at $3/M; $5 per thousand
  searches. Matches the snapshot.
- openrouter.ai/perplexity/sonar-reasoning-pro — "Sonar Reasoning Pro is a
  premier reasoning model powered by DeepSeek R1 with Chain of Thought
  (CoT)." Verbatim.
- openrouter.ai/perplexity/sonar-pro-search — "Exclusively available on the
  OpenRouter API" verbatim; October 30, 2025; $18 per thousand calls.
- en.wikipedia.org/wiki/Perplexity_AI — founded August 2022 by Srinivas,
  Yarats, Ho, Konwinski; San Francisco; $21.21B after the Series E-6 round,
  early 2026; the August 2025 Cloudflare stealth-crawler finding with
  robots.txt non-compliance; the February 2026 move from advertising to
  subscriptions. The routing fact's "Moonshot AI" is supported via "Kimi
  K2.6" in the article's engine list (the article never says "Moonshot" —
  the identification runs through Kimi being Moonshot's model family, which
  is safe; noting the method so a later pass does not "correct" it).

Required change (the revise):
1. `false-or-unsupported-claim` — "The New York Times, the BBC, Dow Jones
   and Japanese newspaper publishers have filed copyright suits against
   it." Per the cited article, two of the four have not filed suit: the NYT
   "sent a cease-and-desist notice" (October 2024) and the BBC "threatened
   legal action" (June 2025), with no later filing mentioned for either.
   Dow Jones (with the New York Post) and the Japanese publishers (Yomiuri,
   Asahi, Nikkei) did file. Rewrite to the source, e.g. "Dow Jones and
   Japanese newspaper publishers have sued it for copyright infringement;
   The New York Times has sent a cease-and-desist and the BBC has
   threatened legal action."

Everything else held under fetch and measurement, and the closing argument
— a company that owns no weights competing on retrieval, so its disputes
are about crawling — is earned by the verified facts around it. One
sentence flattens three kinds of legal action into "filed suits"; fix that
and this publishes. revise
