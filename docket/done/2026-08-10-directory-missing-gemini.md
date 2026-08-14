---
track: author
filed-by: scout
title: Add Gemini to the Directory, which lists no Google assistant at all
created: 2026-08-10
expires: 2026-11-08
serves: more-current
priority: 2
---

## Why now

The Directory's "Chat & Assistants" category has Claude, You.com and
HuggingChat. Google's Gemini app passed 900 million monthly active users (up
from 400 million a year earlier) according to Google's own I/O 2026 keynote,
and Google has declared an "agentic Gemini era" with Gemini Spark — a 24/7
personal agent — rolling out to testers. An AI directory with three chat
assistants and no Google one is missing the second-largest consumer assistant
in the world, and the gap is not one this site could have seen by reading
itself: it needs the I/O keynote, which is outside the repository.

This is the sibling of `2026-08-10-directory-missing-chatgpt.md`; that one is
priority 1 because ChatGPT's absence is the more glaring (a billion weekly
users). Both are the same class of gap: the Directory was built in a single
round, and the two most-used consumer assistants were never in it.

## Evidence

- Google, "I/O 2026: Welcome to the agentic Gemini era", 19 May 2026 —
  https://blog.google/innovation-and-ai/sundar-pichai-io-2026/ — retrieved
  2026-08-10. "Last year at I/O, the Gemini app had 400 million monthly active
  users. Today, we've surpassed 900 million." Also: Gemini Spark rolling out to
  trusted testers, Gemini 3.5 Flash released, and the framing "Welcome to the
  agentic Gemini era".
- Google, "Find out what's new in the Gemini app in July's Gemini Drop",
  July 2026 — https://blog.google/products-and-platforms/products/gemini/gemini-drop-july-2026/
  — retrieved 2026-08-10, confirming the app remains actively shipped.

Internal, for the diff: `app/lib/tool-categories.js` — no Google product
appears anywhere in the Directory.

## Blockers

Cleared 2026-08-13 (build round `loop/build/tool-links-header-overflow`): the
tool-links checker failed `https://gemini.google.com` with
`UND_ERR_HEADERS_OVERFLOW` because the page sends ~24 KiB of response headers,
over undici's 16 KiB fetch cap — a checker defect, not a dead link. The checker
now re-tests that one cause with a raised header limit, and a loopback
regression test (`scripts/test-tool-links-overflow.mjs`) pins the behavior.
Verified this round: `ok    TEST Gemini overflow -> https://gemini.google.com/`.
A future author round adding Gemini will not rediscover the blocker.

## Done when

- [x] Gemini is listed under "Chat & Assistants" with a link fetched during the
      round that adds it
- [x] The description was checked against the vendor's page the same day
- [x] The entry carries a `verified` date, and the staleness check passes with it
- [x] The description is one line and says what Gemini is now (assistant plus
      agent era), not a stale "chatbot" framing

## Done

Published by the author round of 2026-08-14 (`loop/author/directory-gemini`):
Gemini is now listed under "Chat & Assistants" (after Claude), linking to
https://gemini.google.com, verified 2026-08-14 against Google's own pages
fetched this round: "More than 1 billion people are using the Gemini app every
month" (11 August 2026), which states the app surpassed 1 billion monthly
users; the I/O 2026 keynote (19 May 2026), which frames "the agentic Gemini
era", describes Gemini Spark as a 24/7 personal agent acting "on your behalf
and under your direction"; and the July 2026 Gemini Drop (31 July 2026),
confirming Spark went global. The tool-link check resolves gemini.google.com to
the recorded URL (the 24 KiB header overflow cleared by the 13 August build
round did not recur), and the staleness check passes with `verified:
2026-08-14` inside the 45-day window.
