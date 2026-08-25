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
- **The "4D framework" is Anthropic's own stated term, on the homepage,
  verbatim.** Correction: an earlier draft of this item said this
  terminology "did not appear in the text this round fetched" — that was
  false, caught by adversarial review and re-verified independently before
  this edit. The academy.claude.com homepage's own "AI Fluency: Framework &
  Foundations" course-card description reads, verbatim: *"Learn to
  collaborate with AI effectively, efficiently, ethically, and safely using
  the 4D framework: Delegation, Description, Discernment, and Diligence."*
  It is on the homepage specifically, not the `/courses` listing page — the
  original search simply looked in the wrong fetched file.
- **Individual course pages are also gate-free.** Fetched
  `academy.claude.com/courses/claude-101` (one course page, sampled) raw:
  HTTP 200, full content, no login redirect. The only auth-related element
  is a "Sign in to save progress" button linking to `/login?returnTo=...`
  — opt-in progress tracking, not a content gate. This does not establish
  every course page behaves the same way; it is one sample.

What this item does **not** verify and secondary sources claim: a total
resource count beyond the 22 structured courses ("355 tutorials" is reported
by at least one outlet but this round found no primary-source count of
tutorials/use-cases separate from the 22 courses, since much of the site's
content loads client-side and a full inventory was not attempted); and
completion badges / LinkedIn integration, also unverified here.

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
  Framework & Foundations" card text: "14 lessons · 1 quiz". The 4D-framework
  sentence quoted above is **not** on this page — it is on the homepage only
  (see below); the two fetched pages have different content and were
  checked separately.
- `https://academy.claude.com/` (re-checked): the 4D-framework sentence
  quoted above sits directly in the "AI Fluency: Framework & Foundations"
  course-card description in the homepage HTML, not hidden behind any
  course-content page.
- `https://academy.claude.com/courses/claude-101` — HTTP 200, 66,002 bytes.
  Full course content, no login wall; one "Sign in to save progress" CTA
  (`href="/login?returnTo=..."`) is the only auth-related element found.

Not fetched or verified this round: any individual course's actual lesson
content beyond the `claude-101` landing page sampled above; the "355
resources" figure from secondary coverage (Superhuman.ai, BigGo Finance,
Termdock) — cited by those outlets, not confirmed here, and this round found
no primary-source count of tutorials/use-cases separate from the 22
structured courses; whether progress tracking or completion badges actually
work, which would require an authenticated account this round did not
create.

## Done when

- [ ] States the free, no-login access as directly verified (fetch without
      credentials returns full content), not merely asserted
- [ ] States the 22-course count as counted from the live `/courses` page at
      publication time, re-counting rather than reusing this item's number
      if the catalog has changed
- [ ] May state the 4D framework quote (Delegation, Description,
      Discernment, Diligence) — it is verified verbatim on the homepage as
      of this item — but re-fetches and re-quotes it directly rather than
      copying this item's text, and does not extend it to claim every course
      teaches it
- [ ] Does not repeat the "355 resources" figure unless independently
      confirmed from Anthropic's own site or another primary source at
      publication time
- [ ] Names at least one concrete course a reader could start today, with
      its actual stated structure (e.g. "14 lessons · 1 quiz" for the
      flagship fluency course), rather than describing the site only in the
      abstract
