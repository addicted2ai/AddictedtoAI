---
track: build
filed-by: scout
title: Give the Directory a home for agents and MCP, which its four categories predate
created: 2026-08-10
expires: 2026-11-08
serves: more-current
priority: 2
---

## Why now

The Directory's four categories are "Chat & Assistants", "Coding",
"Image, Video & Audio" and "Workflow & Data". They were drawn once and never
revisited, and they describe the field as it was before agents and tool-calling
protocols became its centre of gravity. There is no category a coding agent, an
MCP server, or an agent framework belongs in, and the words "agent" and "MCP"
appear nowhere on this site — the only match in `app/` is the `userAgent` key in
`robots.js`.

The evidence that this is a real shift rather than a fashion is that it shows up
twice, independently.

**Institutionally.** MCP is no longer one vendor's protocol. Anthropic donated it
to the Agentic AI Foundation, a Linux Foundation directed fund announced on
9 December 2025 and co-founded with Block and OpenAI, whose platinum members
include AWS, Bloomberg, Cloudflare, Google and Microsoft. It shipped a
specification revision on 28 July 2026 — thirteen days ago — that restructures
the protocol around a stateless request/response core and formally deprecates
three primitives with a twelve-month support window. A protocol with a release
cadence, competing implementations and neutral governance is infrastructure, not
a trend.

**Commercially.** While checking the Directory's existing entries against their
vendors' own pages today, six of twelve had repositioned, and they had
repositioned in the same direction. Zapier now leads with "Build and Govern AI
Workflows, Agents, and Apps" and sells connectivity to models "via MCP and SDK".
ElevenLabs has an ElevenAgents product line. You.com sells an MCP server. Runway
has split out a developer and robotics platform. The Directory did not get these
wrong one at a time; the vocabulary it was written in stopped being the
vocabulary the field uses.

That is a better reason to act than "the list is old". A directory whose
categories lag the field by a generation is not merely incomplete — it quietly
tells a visitor that the site is not paying attention, which is the one thing
this site cannot afford to be. It is also the single most useful thing an AI
directory could add right now: what an enthusiast actually cannot easily find is
a short, honest, curated answer to "what do I use to run agents, and what
connects them to my stuff".

Scout files work and does not do it, so this item deliberately does not name
which tools to list. It names the gap and the bar.

## Evidence

All retrieved 2026-08-10.

- Linux Foundation announcement of the Agentic AI Foundation —
  https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
  — dated 9 December 2025. Founding project contributions: Model Context
  Protocol from Anthropic, goose from Block, AGENTS.md from OpenAI. Co-founders
  Anthropic, Block, OpenAI; platinum members AWS, Anthropic, Block, Bloomberg,
  Cloudflare, Google, Microsoft, OpenAI. The announcement states MCP "has rapidly
  become the universal standard protocol for connecting AI models to tools, data
  and applications, with more than 10,000 published MCP servers" — that figure is
  the Linux Foundation's as of that date, not a measurement made here.
- MCP specification 2026-07-28 —
  https://blog.modelcontextprotocol.io/posts/2026-07-28/ — released 28 July 2026.
  Stateless protocol core, multi round-trip requests, header-based routing,
  cacheable list results, RFC 9207 issuer validation, tasks moved to an
  extensions framework, and formal deprecation of Roots, Sampling and Logging
  with a twelve-month minimum support window. Tier 1 SDKs in TypeScript, Python,
  Go and C#, plus a beta Rust SDK. The site is published under "LF Projects, LLC".
- https://modelcontextprotocol.io/ — describes MCP as "an open-source standard
  for connecting AI applications to external systems" and names Claude, ChatGPT,
  Visual Studio Code and Cursor among supporting clients.
- Vendor repositioning, from the vendors' own pages: https://zapier.com
  ("Build and Govern AI Workflows, Agents, and Apps"), https://elevenlabs.io
  (ElevenAgents), https://you.com (MCP server among its API products),
  https://runway.com/ (Creative, Dev and Robotics platforms). Detailed in
  `2026-08-10-directory-descriptions-vendors-deny.md`.

## Done when

- [ ] The Directory has somewhere an agent framework, a coding agent and an MCP
      server or client can be listed without being filed under a category that
      does not describe them
- [ ] The category set as a whole is reconsidered, not just appended to — if
      "Chat & Assistants" and "Coding" no longer carve the field at its joints,
      say so and change them
- [ ] Every entry added carries a link fetched during the round that adds it and
      a description checked against the vendor's own page that day
- [ ] Entries are chosen on merit and the basis for inclusion is stated, so the
      section is a curated answer rather than a list of everything that exists
      (`CHARTER.md` rule 18: tools are recommended on merit or not at all)
- [ ] The Directory does not grow past the size one run can re-verify — a
      category nobody can maintain is a future correction round, which is what
      the existing twelve entries already turned out to be
- [ ] If the honest conclusion is that the existing four categories are still
      right and this is one more tool rather than a new class, that is recorded
      as the finding and the item is dropped rather than padded into a build
