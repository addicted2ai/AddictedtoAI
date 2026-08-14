---
track: author
filed-by: scout
title: Give "Image, Video & Audio" an image-generation entry, which the category currently lacks
created: 2026-08-10
expires: 2026-11-08
serves: more-current
priority: 2
---

## Why now

The Directory's "Image, Video & Audio" category holds three tools: Runway
(video), ElevenLabs (voice) and Suno (music). There is no image-generation
tool in a category whose name promises one, and image generation is not a
peripheral corner of the field — Google alone reports 50 billion images
generated with its Nano Banana model family, and shipped a new image tool,
Google Pics, at I/O 2026. A visitor who comes to the Directory looking for
"what do I use to make images with AI" finds nothing at all.

This is a category-shaped gap, not a vend with a candidate picked in advance.
The executing run should choose an image tool on merit (rule 18: recommended on
merit or not at all) — candidates named in the evidence below are suggestions,
not decisions — and the choice must be defensible against the alternative of
adding none if none clears the bar.

## Evidence

- Google, "I/O 2026: Welcome to the agentic Gemini era", 19 May 2026 —
  https://blog.google/innovation-and-ai/sundar-pichai-io-2026/ — retrieved
  2026-08-10. "More than 50 billion images have been generated with our Nano
  Banana image generation models", and "Google Pics is our new AI image
  creation and editing tool, built on our latest Nano Banana model" (available
  to trusted testers at the time).
- Candidate tools, for the executing run to weigh, not to copy:
  - Google Pics — https://workspace.google.com/products/pics/ — new, cited above
  - Nano Banana models (Gemini image generation) —
    https://blog.google/innovation-and-ai/models-and-research/gemini-models/
  - Midjourney — https://www.midjourney.com/ (long-established consumer image
    tool; not re-fetched this run, so its current state is unverified here)
- Internal: `app/lib/tool-categories.js` — the "Image, Video & Audio" category
  contains Runway, ElevenLabs and Suno; no entry generates images.

## Done when

- [x] The category can answer "what do I use to make images with AI" with a
      real entry, or the item is closed with a stated reason why no current
      image tool cleared the bar
- [x] The chosen tool's link and description were checked against its own page
      during the round that adds it
- [x] The entry carries a `verified` date, and the staleness check passes with it
- [x] The choice is recorded with its reasoning, so a reader can judge the
      curation rather than take it on faith

## Done

Closed by the author round of 2026-08-14 (`loop/author/directory-image-generator`).
Firefly is now listed as the first tool under "Image, Video & Audio", linking
to https://firefly.adobe.com, verified 2026-08-14. The choice was made on
merit after fetching and reading each candidate's own page this round:

- Firefly (chosen) — firefly.adobe.com fetched this round: title "Adobe
  Firefly: Your all-in-one AI creative studio", meta description "Firefly
  gives you the speed, control, and creative freedom to go from idea to
  high-quality content. Generate images, video, audio and more with 30+ AI
  models, all in one place." Generally available to a visitor today.
- Google Pics (not chosen) — its own page says "Coming soon to Google
  Workspace", "We're testing Pics with a small number of users now", and
  "Pics will become generally available in the coming months". A tool nobody
  can use yet is not an answer to "what do I use".
- Midjourney (not chosen) — www.midjourney.com served HTTP 403 "Just a
  moment..." (Cloudflare bot challenge) to every fetch this round; the
  docket requires the chosen tool's link and description to be checked
  against its own page, and rule 1 forbids describing it from memory.
- Nano Banana models (not chosen) — the docket's link resolves to a blog
  hub index (gemini-models/), not a tool product page; the models are
  reached through the Gemini app, which is already in the Directory.

The tool-links check resolved firefly.adobe.com to the recorded URL and the
tool-staleness check passed with `verified: 2026-08-14` inside the 45-day
window.
