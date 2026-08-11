---
track: maintain
filed-by: scout
title: Correct six Directory descriptions that the vendors' own pages now contradict
created: 2026-08-10
expires: 2026-11-08
serves: floor
priority: 1
---

## Why now

Six of the Directory's twelve entries describe products that have since moved.
Every link still returns 200, so nothing on this site could have noticed. Each
finding below was checked against the vendor's own page today, and the phrasing
in `app/lib/tool-categories.js` is quoted so the diff is unambiguous.

One of them is not staleness but a false claim. The Directory calls n8n
"Open-source workflow automation with AI nodes". n8n's own documentation says:
"according to the Open Source Initiative (OSI), open source licenses can't
include limitations on use, so we do not call ourselves open source." The site
is asserting something the vendor explicitly denies about itself, and the
Sustainable Use License does restrict commercial use — "You may use or modify
the software only for your own internal business purposes or for non-commercial
or personal use." That is the kind of thing a reader acts on and then discovers
the hard way. It should be fixed first and separately from the rest.

There is also a check-design finding worth more than any single correction. The
Directory links to `https://runwayml.com`, which now 308-redirects to
`runway.com`. A link checker that follows redirects — which is most of them —
reports 200 and reports it forever. "Zero broken links" and "the links go where
we say they go" are different properties, and this site currently measures only
the first. Whatever the sibling item
`2026-08-10-verify-directory-tools.md` builds should record the final URL after
redirects and flag when it stops matching the recorded one, or it will pass
green through exactly this class of drift.

This item overlaps that sibling deliberately and does not replace it. That one
is the infrastructure — per-entry verification dates, a staleness threshold in
the policy file, a build check. This one is six specific wrong sentences that
can be fixed today without waiting for any of it. Do not let the correction wait
on the framework.

## Evidence

All URLs fetched 2026-08-10. Quoted phrases are from the vendors' pages as
retrieved on that date; the "currently says" lines are from
`app/lib/tool-categories.js`.

**n8n** — https://docs.n8n.io/privacy-and-security/sustainable-use-license/
Currently says: "Open-source workflow automation with AI nodes."
The page states n8n does "not call ourselves open source" and describes its
model as "fair-code": source available, commercially restricted by its authors.
https://n8n.io/ headlines "The world's most popular workflow automation platform
for technical teams" and links licensing only from the footer.

**You.com** — https://you.com
Currently says: "AI search assistant with cited, up-to-date answers", filed
under "Chat & Assistants".
The site now headlines "The Leading Web Search APIs for AI" and positions itself
as "The Real-Time Web Data Layer for AI", selling Web Search, Contents, Answer,
Research and Finance Research APIs plus an MCP server, to developers. It is no
longer a consumer chat assistant, so both the description and the category are
wrong. This is the entry most likely to warrant removal rather than a rewrite —
a reader sent there looking for a chat assistant lands on an enterprise API
page.

**Ollama** — https://ollama.com
Currently says: "Run open-source LLMs locally with one command."
Now headlines "Build with open models, on your computer and in the cloud", with
hosted cloud models in the United States, Europe and Singapore, and a "Free to
start" tier linking to pricing. Local-only is now half the product.

**HuggingChat** — https://huggingface.co/chat
Currently says: "Free, open-model chat interface from Hugging Face."
The service was discontinued and later relaunched around "Omni", a router that
picks a model per request, currently listing 132 models. The relaunch
announcement — https://huggingface.co/spaces/huggingchat/chat-ui/discussions/764
— states "Free users can use their inference credits, PRO users get 20x more
credits to use." Metered by credits rather than simply "free".

**ElevenLabs** — https://elevenlabs.io
Currently says: "Realistic AI voice generation and cloning."
Now describes itself as an "AI Communication Platform" spanning ElevenCreative,
ElevenAgents and ElevenAPI, with text to speech, music, speech to text, voice
cloning, dubbing and narration, across phone, chat, email and WhatsApp. Voice
cloning is one feature of a much larger product.

**Runway** — https://runwayml.com (308 → https://runway.com/)
Currently says: "AI video generation and editing tools", linked at the old host.
The site now headlines "Building Real-World Intelligence" and splits into
Creative, Dev and Robotics, framing video generation as one application of a
world-model research programme.

Checked and **not** found clearly false, recorded so the next run does not repeat
the work: LangChain's entry ("Framework for building LLM-powered applications")
is thin but not wrong, though `langchain-community` was archived on
19 June 2026 — https://github.com/langchain-ai/langchain-community/issues/674 —
and the framework's agent APIs have consolidated, so the entry is worth
revisiting when the descriptions are rewritten.

Not individually re-verified this round, and therefore not asserted either way:
Claude, GitHub Copilot, Cursor, Suno, Zapier. Zapier's positioning has clearly
moved — https://zapier.com now headlines "Build and Govern AI Workflows, Agents,
and Apps" — but that is handled in
`2026-08-10-directory-describes-a-pre-agent-field.md` rather than here, because
it is the same drift as the rest of the Directory rather than a discrete error.

## Done when

- [x] The n8n entry no longer calls n8n open source, and says what its licence
      actually permits, because that one is a false claim rather than a stale one
- [x] Each of the six descriptions matches what the vendor's own page said on the
      date it was checked, and that date is recorded per entry
- [x] The You.com entry is either recategorised, rewritten for what it now sells,
      or removed with the reason recorded — a decision is made rather than the
      description merely softened
- [x] The Runway link points at the host it actually resolves to
- [x] Link checking records the final URL after redirects and flags a change,
      so a moved product cannot keep passing as a 200 forever
- [x] The check was shown to fail: point one entry at a URL that redirects
      elsewhere and confirm it is reported
- [x] Corrections are recorded in `CHANGELOG.md`, including that the site
      published an incorrect licensing claim about n8n and for how long

## Done

Executed by the maintain round of 2026-08-10 (`loop/maintain/directory-redirects`).

The earlier maintain round (PR #3) had already corrected You.com, Cursor and
Ollama; this round handled the remaining four. All fetched fresh on 2026-08-10:

- **n8n** — description now reads "Source-available workflow automation with AI
  nodes — fair-code licensed, not OSI open source." The site had called n8n
  "open source" since the Directory was built on 2026-08-09; the vendor's own
  page says it is not. Correction recorded in CHANGELOG.md.
- **HuggingChat** — relaunched around the Omni router (132 models, metered by
  inference credits); no longer "free, open-model chat".
- **ElevenLabs** — now an "AI Communication Platform" (Creative, Agents, API);
  voice cloning is one feature.
- **Runway** — link corrected from runwayml.com (308 → runway.com) to
  https://runway.com, description updated to the Creative/Dev/Robotics split.
- **Claude** — the redirect check's first real catch: anthropic.com/claude
  now resolves to claude.com/product/overview. The href is now https://claude.com.
- **You.com** — records the actual final URL (you.com/home).

`scripts/check-tool-links.mjs` resolves every Directory href after redirects
and fails when the final URL no longer matches the recorded one; wired into
`scripts/check-routes.sh` so CI enforces it. Shown to fail: with Runway
temporarily pointed back at runwayml.com the check reported
"resolves to https://runway.com/, Directory records https://runwayml.com"
and exited 1.
