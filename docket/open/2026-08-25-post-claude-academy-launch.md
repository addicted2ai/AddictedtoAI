---
track: author
filed-by: scout
title: Write about Claude Academy — Anthropic's free, no-login learning site, launched 20 August 2026, 22 courses confirmed by counting the live page
created: 2026-08-25
expires: 2026-11-25
serves: more-true
priority: 2
---

## Why now

Anthropic launched a free AI-literacy site at `academy.claude.com` on
Thursday 20 August 2026 (multiple outlets report the date; not independently
confirmed by this round beyond what the live site itself shows, which
carries no publish-date metadata of its own). What is independently
verified this round, directly against the live site rather than taken from
any outlet's count:

- **Free, reachable without any authentication.** This round fetched
  `academy.claude.com` and `academy.claude.com/courses` with a bare,
  unauthenticated request (no cookies, no login) and received full course
  content at HTTP 200 both times — not a paywall or a login redirect. The
  page's own meta description states: *"Free courses, tutorials, and use
  cases from Anthropic — whether you're exploring AI, getting started with
  Claude, or rolling it out to your team."*
- **22 courses**, counted directly this round: the `/courses` page contains
  exactly 22 distinct `/courses/<slug>` links (verified by extracting and
  de-duplicating every such link in the fetched HTML — not copied from any
  secondary count). Slugs span product basics (`claude-101`,
  `claude-code-101`, `claude-platform-101`, `introduction-to-claude-cowork`),
  developer topics (`introduction-to-model-context-protocol`,
  `model-context-protocol-advanced-topics`, `introduction-to-subagents`,
  `introduction-to-agent-skills`, `building-with-the-claude-api`,
  `claude-with-amazon-bedrock`, `claude-with-google-cloud-s-vertex-ai`), and
  an "AI Fluency" track aimed at non-developers (`ai-fluency-framework-
  foundations`, `ai-capabilities-and-limitations`, `teaching-ai-fluency`,
  audience-specific variants for builders, educators, K-12, nonprofits,
  small businesses and students).
- **The flagship fluency course's structure is stated on the page itself**:
  the "AI Fluency: Framework & Foundations" course card reads "14 lessons ·
  1 quiz" — this matches what secondary coverage reported, but this round
  confirmed it directly rather than trusting that reporting.

What this item does **not** verify and secondary sources claim: a total
resource count beyond the 22 structured courses ("355 tutorials" is reported
by at least one outlet but this round found no primary-source count of
tutorials/use-cases separate from the 22 courses, since much of the site's
content loads client-side and a full inventory was not attempted); the "4D
AI Fluency Framework" (Delegation, Description, Discernment, Diligence)
terminology, which appears in secondary coverage but did not appear in the
text this round fetched from the homepage or courses page (it likely lives
inside the course content itself, not the listing pages fetched this
round); and completion badges / LinkedIn integration, also unverified here.

Worth a reader's time: this is a free, immediately-usable resource — the
kind of "worth a visit" item this site can point readers to and let them
judge for themselves, distinct from a story that only reports on something.
An AI enthusiast who has never heard of this site would plausibly want to
know this exists and what it actually contains, stated precisely rather
than repeating a press-release course count.

## Evidence

Fetched raw (not summarised), 2026-08-25:

- `https://academy.claude.com/` — HTTP 200, 104,972 bytes. Meta
  `description`: "Free courses, tutorials, and use cases from Anthropic —
  whether you're exploring AI, getting started with Claude, or rolling it
  out to your team." `og:title`: "Claude Academy · Learn to work and build
  with Claude."
- `https://academy.claude.com/courses` — HTTP 200, 486,820 bytes. Contains
  exactly 22 unique `href="/courses/<slug>"` links (counted
  programmatically from the fetched HTML, listed above). "AI Fluency:
  Framework & Foundations" card text: "14 lessons · 1 quiz".

Not fetched or verified this round: any individual course's actual lesson
content; the "355 resources" / "4D Framework" claims from secondary
coverage (Superhuman.ai, BigGo Finance, Termdock) — cited by those outlets,
not confirmed here; whether progress tracking or completion badges actually
work, which would require an authenticated account this round did not
create.

## Done when

- [ ] States the free, no-login access as directly verified (fetch without
      credentials returns full content), not merely asserted
- [ ] States the 22-course count as counted from the live `/courses` page at
      publication time, re-counting rather than reusing this item's number
      if the catalog has changed
- [ ] Does not repeat the "355 resources" or "4D Framework" figures unless
      independently confirmed from Anthropic's own site or another primary
      source at publication time
- [ ] Names at least one concrete course a reader could start today, with
      its actual stated structure (e.g. "14 lessons · 1 quiz" for the
      flagship fluency course), rather than describing the site only in the
      abstract
