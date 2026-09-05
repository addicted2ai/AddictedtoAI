---
date: 2026-09-05
slug: wiki-entries-for-cli-coding-agents
type: entry
summary: >
  The wiki has no entry for any command-line AI coding agent except Cursor. No
  `tool/claude-code`, no `tool/openai-codex`, no `tool/goose`, no
  `tool/qwen-code`, and no `org/nous-research`. Write the entries, starting with
  the four CLI agents that carry a named CVE for the same class of bug —
  identity, vendor, what the product is, install channel and current published
  version bound to the registry rather than typed into prose. The directory has
  `cursor`, `aider` and `continue`, all IDE-shaped; the terminal agents that a
  large share of this site's readers actually run are absent from both the
  directory and the wiki.
evidence: >
  Working the GitSpawn post (content/blog/gitspawn-git-config-code-execution-coding-agents.md,
  2026-09-05) surfaced this as a concrete blocker rather than a tidiness
  complaint: the post names seven affected agents and could resolve `mentions:`
  for none of them. It had to point at vendor org entries (org/anthropic,
  org/openai, org/alibaba-cloud, org/spacexai) instead, and Nous Research —
  the vendor of Hermes Agent, one of the four findings unpatched at disclosure —
  has no entry to point at in any form. `content/wiki/tool/` and
  `content/directory/tools/` both hold 35+ files and neither carries
  claude-code, codex, goose or qwen-code (listed 2026-09-05).

  The subjects are well-documented and the facts are feed-shaped. npm publishes
  the version and release history for `@anthropic-ai/claude-code`,
  `@openai/codex` and `@qwen-code/qwen-code` (all three queried 2026-09-05:
  latest 2.1.261, 0.153.4 and 0.23.0 respectively); goose and Hermes Agent
  publish releases on GitHub (github.com/aaif-goose/goose,
  github.com/NousResearch/hermes-agent, both read 2026-09-05). Each also carries
  a public security advisory history that an entry's mentions would make
  navigable — Anthropic's list for claude-code alone held 30 records on
  2026-09-05 (https://github.com/anthropics/claude-code/security/advisories).

  The gap has a cost beyond one post. `specs/wiki` makes the wiki the substrate
  other surfaces reference rather than restate, and the blog is now restating
  product identity inline because there is nothing to link. Every further
  incident, price change or release in this product category will pay the same
  cost.
---

# Wiki entries for the CLI coding agents

The wiki covers models exhaustively and vendors well. It does not cover the
category of software that the models are mostly reached through.

`content/wiki/tool/` has 38 entries. One of them, `cursor`, is a coding agent,
and it is the IDE. `aider` and `continue` are there. `claude-code`, `codex`,
`goose`, `qwen-code`, `hermes-agent` and `grok-build` are not, in the wiki or in
the directory, and neither is `org/nous-research`.

That was invisible until a post needed to link them. Writing up the GitSpawn
disclosure meant naming seven products in one piece and having nowhere to send a
reader for what any of them is, who ships it, or how to get it. The post
compensated by pointing `mentions:` at four vendor orgs, which is the wrong
granularity: the affected artifact is the CLI, not the company.

## What the job would produce

Four entries first, chosen because each already has a named CVE and a public
release channel, so the facts are cited rather than asserted:

- `tool/claude-code` — Anthropic, npm `@anthropic-ai/claude-code`
- `tool/openai-codex` — OpenAI, npm `@openai/codex`, CLI and Desktop are
  distinct products with separate version schemes and that distinction is worth
  the entry's space
- `tool/goose` — GitHub releases at `aaif-goose/goose`, the vendor named in
  CVE-2026-72718
- `tool/qwen-code` — Alibaba, npm `@qwen-code/qwen-code`

Then `org/nous-research` as the vendor entry Hermes Agent needs, and
`tool/hermes-agent` beside it.

Version and release-date facts bind to the registry, per the volatile-values
rule, so an entry written today does not go stale next week — this category
ships several times a week, which is exactly why typed literals would rot.

## What it is not

Not a security roundup. The CVE history belongs in mentions and in dated posts;
the entries are identity and background. And not the whole category at once:
six entries, the ones a reader arriving from an incident actually looks up.
