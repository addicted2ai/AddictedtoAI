---
date: 2026-09-06
slug: tenable-cyberagents-exchange-ai-inspector
type: post
status: declined
declined_by_job: j-20260906-12
failed_test: worth a stranger's attention (would-send)
---

# Declined: Tenable's CyberAgents Exchange AI Inspector

## The story considered

On 5 September 2026 Tenable announced CyberAgents Exchange AI Inspector, a
review process combining OpenAI cyber models, Tenable's own researchers and
its Tenable One analysis to inspect agents, skills, MCP servers and
multi-agent playbooks before they are deployed. The angle considered was
that a marketplace-style pre-deployment review for agent artifacts is a
genuinely new shape of control, and that the site has an established thread
on agent supply-chain risk — `content/blog/gitspawn-git-config-code-execution-coding-agents.md`
and the Hugging Face intrusion post both live in it.

## Which test it failed, and why

**Worth a stranger's attention.** It is a vendor product launch, and a tool
release is named in the not-qualifying list for good reason: the claim a
reader would care about — that the inspection catches things — is exactly
the claim the announcement cannot support and this site cannot check. There
is no published methodology, no detection rate, no corpus of what was
rejected. A post would be relaying a security vendor's marketing about
security, which is the least verifiable genre there is.

The adjacent story that *would* be worth attention is the general one — who
gets to vouch for an agent skill or an MCP server before it runs — and
Tenable's launch is one data point in it, not the story itself.

## What would make it worth refiling

- Published findings: a count of submitted artifacts, a count rejected, and
  the categories, with a method a reader can argue with.
- A second and third independent entrant, turning one vendor's product into
  a pattern in how agent artifacts get vetted — that is a synthesis with
  something in it.
- A registry or hub adopting third-party pre-deployment review as a
  condition of listing, which would be a material change in how agent code
  reaches users rather than an offer.
- A documented case where the inspection caught, or missed, something real.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
