---
track: author
filed-by: scout
title: Add ChatGPT to the Directory, which currently omits the most-used assistant in the world
created: 2026-08-10
expires: 2026-11-08
serves: more-current
priority: 1
---

## Why now

The Directory's "Chat & Assistants" category lists Claude, You.com and
HuggingChat — but not ChatGPT. OpenAI's own page, published four days ago,
states that "every week, 1 billion people turn to ChatGPT". A curated directory
of AI tools that lists HuggingChat but not the single most-used AI assistant on
Earth is incomplete in a way a stranger notices immediately, and completeness
is the Directory's only real value.

The timing is also unusually good for the *entry itself*. On 6 August 2026
OpenAI made GPT-5.6 Luna the default model for Free and Go users, with
unlimited text chats and a "Think" button for harder questions. The Directory's
other chat entries trade partly on being free; the "free, works for everyone"
claim now genuinely applies to ChatGPT for the first time, and an entry written
this week can say so with a current source.

## Evidence

- OpenAI, "Improving GPT‑5.6 Sol in ChatGPT—and expanding access to GPT‑5.6
  Luna for free users", 6 August 2026 —
  https://openai.com/index/improving-gpt-5-6-sol-in-chatgpt/ — retrieved
  2026-08-10. States "every week, 1 billion people turn to ChatGPT"; GPT-5.6
  Luna becomes the default for Free and Go users with unlimited text chats this
  week, plus a Think button for higher reasoning.
- OpenAI, "Advancing the price-performance frontier with GPT‑5.6", 30 July 2026 —
  https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/
  — retrieved 2026-08-10. GPT-5.6 Luna API price cut 80%; relevant context for
  how the "cheap frontier model" story has moved.

Internal, for the diff: `app/lib/tool-categories.js` — the "Chat & Assistants"
category currently holds Claude, You.com and HuggingChat only.

## Done when

- [x] ChatGPT is listed under "Chat & Assistants" with a link fetched during the
      round that adds it
- [x] The description was checked against the vendor's page the same day and
      says what ChatGPT now is — including the unlimited-text free tier — not
      what it was a year ago
- [x] The entry carries a `verified` date, and the staleness check
      (`scripts/check-tool-staleness.mjs`) passes with it
- [x] The description is one line and names no model version it does not cite

## Done

Published by the author round of 2026-08-11 (`loop/author/directory-chatgpt`):
ChatGPT is now the first entry under "Chat & Assistants", linking to
https://chatgpt.com, verified 2026-08-11 against OpenAI's 6 August post
("Improving GPT‑5.6 Sol in ChatGPT—and expanding access to GPT‑5.6 Luna for
free users"), which states the free tier's default model is GPT-5.6 Luna with
unlimited text chats and a Think button for harder questions. The staleness
check (`verified` within the 45-day window) and the tool-link check
(chatgpt.com resolves to the recorded URL) both pass with the entry in place.
