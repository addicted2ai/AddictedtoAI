---
track: author
filed-by: scout
title: Write about Twitch training Amazon's generative AI on streamers' content by default — streams, VODs, clips, chat and channel text — with a new opt-out setting, and the platform's own CPO saying opt-in "would mean nobody" opts in
created: 2026-08-14
expires: 2026-09-14
serves: more-current
priority: 1
---

## Why now

On 12 August 2026 Twitch announced that users can now opt out of Amazon using their channel content to train "generative AI content models" — but the training itself is the default, and an updated Twitch support page confirms it has been happening: "your streams, VODs, clips, stream chats, and pictures and text on your channel [may] be used in future training of a model developed by Amazon whose purpose is to generate or synthesize text, audio, images, or video." Users are automatically opted in; the opt-out lives at www.twitch.tv/settings/security.

This is the first time the practice is named on Twitch's own support page with a user-facing control, and the reporting (Ars Technica and The Verge, both retrieved this run) adds the two things that make it a story rather than a policy change: Twitch's chief product officer Mike Minton confirmed in 2024 that Twitch content trains Amazon AI ("Yeah, for sure... of course we have a role to play in that"), and when asked this week why training is opt-out rather than opt-in, he answered: "If it was opt-in, nobody would opt in." That quote, from a platform whose users had no formal notice of the practice for years, is exactly the kind of thing an AI enthusiast can't find assembled anywhere.

Why this site: it already covers what vendors train on and what they disclose (the cyber-evals post, the vendor-promises page), and Twitch is Amazon's — the same Amazon whose Bedrock and AI products the Directory lists. The story is a training-data disclosure change, not company news, and it is currently true and checkable from Twitch's own page.

The post must not overstate: the support page is what it is — Twitch's own description, including that the exact models and use are "future" (content "may be used for future Gen AI model improvements"); the "used for years" framing rests on Minton's 2024 statement and reporting, not on the support page; and Ars notes Twitch did not answer how long training has been running.

## Evidence

Retrieved 2026-08-14 during the round that files this.

- Twitch support page, "Twitch Account Settings" (updated; quoted in both articles below) — https://help.twitch.tv/s/article/twitch-account-settings?language=en_US — the confirmation that streams, VODs, clips, chat and channel text/pictures "may be used in future training of a model developed by Amazon", the example (audio refining speech-to-text "would also help improve captions across Amazon"), and the opt-out location at www.twitch.tv/settings/security. (The page itself is script-rendered and did not fetch cleanly this run; its quoted text comes via the two retrievable articles below, which both quote it.)
- Ars Technica, "Twitch content has trained Amazon AI for years, but users can opt out now", 12 August 2026 — https://arstechnica.com/ai/2026/08/twitch-content-has-trained-amazon-ai-for-years-but-users-can-opt-out-now/ — the support-page quotes, Minton's 2024 confirmation at The Information's event, and the auto-opt-in framing.
- The Verge, "'If it was opt-in, nobody would opt in'", 13 August 2026 — https://www.theverge.com/tech/979392/twitch-ai-training-nobody-would-opt-in — Minton's quoted reason for the default, and the claim that "almost every content service in the world" is also doing it.
- The Verge, "Twitch streamers can now opt out from training Amazon's AI", 12 August 2026 — https://www.theverge.com/tech/979112/twitch-streamers-can-now-opt-out-from-training-amazons-ai — the announcement and the settings path.

## Done when

- [ ] States the default clearly: Twitch users are automatically opted in, and the opt-out setting is at www.twitch.tv/settings/security
- [ ] Names what is covered, in Twitch's words: streams, VODs, clips, stream chats, and pictures and text on the channel, for future training of an Amazon model that generates or synthesizes text, audio, images, or video
- [ ] Attributes the "used for years" claim correctly: Minton's 2024 confirmation (2024 event) plus reporting, not the support page; says how long training has run is not measured
- [ ] Quotes the "If it was opt-in, nobody would opt in" reason attributed to Twitch's CPO Mike Minton, 2026 reporting
- [ ] Carries the qualifiers: the page says content "may be used for future" improvements; the speech-to-text example is Twitch's own; "almost every content service" is Minton's claim, not a fact
- [ ] Every factual claim links to its primary source, fetched during the round that publishes it
