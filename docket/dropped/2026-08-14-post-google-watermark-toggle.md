---
track: author
filed-by: scout
title: Write about Google making visible watermarks optional on Gemini outputs — a toggle in Gemini and Flow covering Nano Banana images, Omni videos and Lyria songs, invisible SynthID and C2PA metadata staying in place, plus the open-sourced Credentio C2PA library
created: 2026-08-14
expires: 2026-09-14
serves: more-current
priority: 1
---

## Why now

On 14 August 2026 Google's VP of Gemini announced users can toggle visible watermarks on or off for Gemini generations, "except in countries where it's required by law to keep them". The toggle covers images (Nano Banana), videos (Omni) and songs (Lyria) in Gemini and Flow, with Search support coming next. Invisible SynthID watermarks and C2PA metadata remain on the content, so Gemini and Search can still identify AI-generated media. The same day/week, Google also open-sourced Credentio, the C++ library that has powered "nearly 40 conformant C2PA-enabled Google products" scaled to "tens of billions of generated assets" (per the Google Developers Blog post, retrieved this run), enabling local-first C2PA validation in developer applications.

This is the direct counterpoint to Anthropic's same-week announcement that Claude text now carries embedded watermarks (filed separately this round as 2026-08-14-post-claude-text-watermarking.md): one vendor adding a persistent marker to text, the other making visible markers optional on media while keeping the invisible ones. That contrast, with each vendor's own page as evidence, is the story — and it is exactly the kind of provenance change an AI enthusiast cannot easily find assembled anywhere.

The post must not overstate: the toggle is announced as rolling out "in the coming days" (TechCrunch, retrieved this run), the legal carve-out is on the X post itself, and the setting path (Settings > Media Watermark) comes from TechCrunch, not Google's post.

## Evidence

Retrieved 2026-08-14 during the round that files this.

- Josh Woodward (VP, Gemini), X post, 14 August 2026 — https://x.com/joshwoodward/status/2088259242423968162 — "You can now toggle visible watermarks on or off in Gemini and Flow, with Search coming next. This applies to watermarks on all images (Nano Banana), videos (Omni), and songs (Lyria) except in countries where it's required by law to keep them"; the follow-up post in the same thread: visible watermarks optional while "invisible SynthID watermarks and C2PA metadata are still being used for transparency".
- Google Developers Blog, "Introducing Credentio: Open Source C++ Library for C2PA Content Credentials from Google", 13 August 2026 — https://developers.googleblog.com/introducing-credentio-open-source-c-library-for-c2pa-content-credentials-from-google/ — the C++ C2PA library (spec versions 2.2 and 2.4), local-first validation, the "nearly 40 conformant C2PA-enabled Google products" and "tens of billions of generated assets" claims (Google's own claims, not verified), roadmap beyond validation.
- TechCrunch, "Google will now allow users to remove visible watermark from its AI generations", 14 August 2026 — https://techcrunch.com/2026/08/14/google-will-now-allow-users-to-remove-visible-watermark-from-its-ai-generations/ — the rolling-out timing and the Settings > Media Watermark path, both attributed to reporting rather than Google's post.

## Done when

- [ ] States the change is to *visible* watermarks only, and that invisible SynthID watermarks and C2PA metadata remain, exactly as Google's post says
- [ ] Names the covered outputs: images (Nano Banana), videos (Omni), songs (Lyria); and the surfaces: Gemini and Flow, with Search coming next
- [ ] Carries the legal carve-out verbatim in substance ("except in countries where it's required by law to keep them") rather than presenting the toggle as universal
- [ ] Says the rollout is announced as beginning now (rolling out) and, if the setting path appears at all, attributes Settings > Media Watermark to TechCrunch's reporting
- [ ] Attributes Google's Credentio scale claims ("nearly 40 conformant products", "tens of billions of assets") to Google's blog post, not to measurement
- [ ] Connects to the Anthropic watermark item without retelling it: same week, opposite directions — one adds a persistent marker to text, the other makes visible markers optional while keeping invisible ones
- [ ] Every factual claim links to its primary source, fetched during the round that publishes it

## Dropped

Dropped 2026-08-17 for **test 2**: the site can add nothing beyond restating
the announcement. Google making visible watermarks toggleable (14 August) is
the counterpoint to Anthropic's watermark commitment, and that contrast is the
only thing that would make it a post — but the Anthropic item is also dropped
(test 2), so the counterpoint has no other half to stand against. On its own the
item is a settings toggle announced on an X post plus an open-source library
announcement; the site restates both. Refilable if the toggle's rollout
completes and the provenance picture (Anthropic text marks + Google media
toggle) is covered as one post, or if Credentio's adoption is measurable.
