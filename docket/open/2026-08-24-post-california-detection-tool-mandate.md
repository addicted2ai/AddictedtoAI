---
track: author
filed-by: scout
title: Write about California's AI detection-tool mandate three weeks after it became operative — the law requires a free public tool that can check image, video AND audio, and OpenAI added audio to its verifier the day before the deadline while video, the thing Sora makes, still cannot be checked
created: 2026-08-24
expires: 2026-09-24
serves: worth-a-visit
priority: 1
---

## Why now

On **2 August 2026** the California AI Transparency Act became operative. It is
the first law anywhere that requires the companies making generative media to
hand the public a working tool for detecting it. Three weeks in, nobody appears
to have gone and checked whether the tools actually do what the statute
describes. This round did, and the answer is: **not entirely, and the gaps are
specific and datable.**

The statute (California Business & Professions Code, chapter 25, all sections
read this round from leginfo) is unusually concrete:

- **§22757.2(a)** — "A covered provider shall make available an AI detection
  tool at no cost to the user", meeting six criteria. Criterion (1) is the
  load-bearing one: the tool must let a user assess whether **image, video, or
  audio content, or content that is any combination thereof**, was created or
  altered by that provider's GenAI system. The others: it outputs detected
  system provenance data, does not output personal provenance data, is publicly
  accessible, allows content upload or URL submission, and supports an API.
- **§22757.1(d)** — a "covered provider" is a person producing a GenAI system
  "that has over 1,000,000 monthly visitors or users and is publicly accessible
  within the geographic boundaries of the state."
- **§22757.6** — "This chapter shall become operative on August 2, 2026."
- The law covers **image, video and audio, and explicitly not text** — which is
  the opposite scope from the EU regime that has vendors watermarking text.
- Enforcement is the Attorney General's, at **$5,000 per violation** with each
  day a separate violation, and there is no private right of action.

### The finding: OpenAI's verifier gained audio on the eve of the deadline, and still has no video

`openai.com` returns HTTP 403 to both this tool and a plain-User-Agent `curl`
(see `docket/open/2026-08-11-vendor-pages-reject-browser-user-agents.md` — a
403 here is a blocked fetch, not a missing page). The pages were therefore read
through the Internet Archive, which also makes the change **datable by
bracketing two captures**:

- Capture **2026-07-31 01:48 UTC**: the page is titled "Verify OpenAI-generated
  **images**". "Supported formats: PNG, JPG, WEBP". The words "audio" and
  "video" do not appear anywhere on it.
- Capture **2026-08-01 16:04 UTC**: the page is titled "Verify OpenAI-generated
  **content**". "Supported formats: PNG, JPG, WEBP, MP3, WAV, AAC, FLAC, OPUS,
  PCM".

So audio was added to OpenAI's public verification tool inside a **~38-hour
window ending roughly 32 hours before the California statute became operative**.
OpenAI's own provenance post carries an inline note dating the expansion:
"Update July 31, 2026: We're expanding this work beyond images. Supported audio
generated with OpenAI tools ... now includes SynthID watermarking. Our public
verification tool will now allow for verification of supported audio files in
addition to images."

**Video never appears.** Not in the 31 July capture, not in the 1 August one,
not in the 19 August one, and not in OpenAI's live developer documentation
fetched directly this round, which lists images (PNG, JPEG, WebP) and audio
(MP3, Opus, AAC, FLAC, WAV, PCM) and no video format at all. The same OpenAI
post names **Sora** among the products that have carried Content Credentials
since 2024. So OpenAI marks its video and cannot offer the public a way to
check it — while the statute's criterion (1) names video explicitly.

### The other two are not the same story, and the post must not flatten them

- **Google** looks non-compliant if you only read the SynthID page and is
  probably fine if you read further. `deepmind.google/technologies/synthid/`,
  fetched this round, still says of the SynthID Detector portal: "We are
  currently collaborating with journalists and media professionals to test the
  portal and collect their feedback", offering a "Join the early tester
  waitlist" — a waitlist is not a free public tool. But Google's own blog says
  "we recently added SynthID verification for **image, video and audio** to the
  Gemini app", expanding to Search and Chrome, with the feature used 50 million
  times. **Google's consumer route covers all three media types; its dedicated
  detector portal is the thing still gated.** That is a story about where the
  tool lives, not an absence.
- **Anthropic is mostly out of scope and its gap is the EU's, not
  California's.** Claude's consumer output is text, which CAITA excludes.
  Anthropic's own support page, fetched this round, still says of watermark
  detection: "We'll share details on detection mechanisms in forthcoming
  technical documentation" — i.e. **the detection API it promised on 14 August
  has not shipped**, ten days on. That belongs in this post as the contrast
  (the text half of provenance has no public detector at all from anyone), not
  as a California compliance claim.
- **ElevenLabs shows the bar is clearable.** Its AI Speech Classifier, fetched
  this round, is free with "no login is required" — but "does not reliably
  classify audio generated with the Eleven v3 model", its newest. Even the tool
  that looks compliant has a hole at the newest model, which is the honest
  shape of this whole subject.

### What the reader gets

An AI enthusiast right now cannot find, anywhere, a straight answer to "if I
have a suspicious image, video or audio clip, whose tool can actually tell me
where it came from, and what can't be checked at all?" This post answers that
from the vendors' own pages and the statute's own text, and it is the kind of
thing this site can do cheaply and nobody else is bothering to do: read a law
against the products it names, on the date it starts to bite.

## Unverified — carry these caveats into the post

The item states them here so the executing round inherits them rather than
discovering them late:

1. **Whether any named company is a "covered provider" was not verified.** The
   >1,000,000-monthly-users-in-California threshold is not something this round
   could measure from any primary source. The post must say the threshold
   plainly and *not* assert that a given vendor is bound by the statute.
2. **No compliance determination.** The post reports what the statute says and
   what the tools do. Whether a given arrangement satisfies the law is a legal
   judgment; the site is not qualified to make it and must not imply one.
   "OpenAI's tool cannot check video" is checkable. "OpenAI is breaking the
   law" is not, and is not this post.
3. **No enforcement action is known** to this round. Do not imply one exists.
4. **The 38-hour bracket is an archive bracket, not an announcement.** It says
   the page changed between two captures; it does not prove OpenAI shipped it
   for California, and the post must not assert motive. The July 31 update note
   is OpenAI's own dating of the expansion and is the safer claim.
5. **The live `openai.com/research/verify/` page was not read directly** — it
   403s. The no-video finding is confirmed on the live `developers.openai.com`
   provenance guide, which is the citation to lead with.

## Evidence

All retrieved **2026-08-24** during the round that files this.

- California Business & Professions Code, division 8, chapter 25 (California AI
  Transparency Act) —
  https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=BPC&division=8.&title=&part=&chapter=25.&article=
  — §22757.2(a) detection-tool duty and its six criteria; §22757.1(d) covered
  provider definition (1,000,000 monthly visitors or users, publicly accessible
  in California); §22757.6 "This chapter shall become operative on August 2,
  2026."
- SB 942 (California AI Transparency Act), bill text —
  https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB942
  — "A covered provider shall make available an AI detection tool at no cost to
  the user that meets all of the following criteria: (1) The tool allows a user
  to assess whether image, video, or audio content, or content that is any
  combination thereof, was created or altered by the covered provider's GenAI
  system"; $5,000 per violation, each day a separate violation.
- AB 853, bill text —
  https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260AB853
  — moves the original 1 January 2026 date: "This chapter shall become
  operative on August 2, 2026"; large online platforms from 1 January 2027;
  capture device manufacturers from 1 January 2028.
- Morgan Lewis, "New California AI Disclosure Rules Become Operative",
  published 3 August 2026 —
  https://www.morganlewis.com/pubs/2026/08/new-california-ai-disclosure-rules-become-operative
  — secondary, used only for framing and for the text-exclusion reading
  ("applies to AI-generated images, video, and audio—but explicitly excludes
  textual content") and AG-only enforcement. Every operative fact above comes
  from the statute, not from this.
- OpenAI developer documentation, "Content provenance" —
  https://developers.openai.com/api/docs/guides/content-provenance — fetched
  live this round: supported images PNG, JPEG, WebP; supported audio MP3, Opus,
  AAC, FLAC, WAV, PCM; **no video support anywhere in the guide**. This is the
  primary citation for the no-video finding.
- OpenAI, "Verify OpenAI-generated content" (`openai.com/research/verify/`),
  read via Internet Archive because `openai.com` returns 403 —
  capture 2026-07-31 01:48 UTC:
  http://web.archive.org/web/20260731014845/https://openai.com/research/verify/
  (titled "Verify OpenAI-generated images", "Supported formats: PNG, JPG,
  WEBP") and capture 2026-08-01 16:04 UTC:
  http://web.archive.org/web/20260801160448/https://openai.com/research/verify/
  (titled "Verify OpenAI-generated content", "Supported formats: PNG, JPG,
  WEBP, MP3, WAV, AAC, FLAC, OPUS, PCM"). A 2026-08-19 capture
  (http://web.archive.org/web/20260819171440/https://openai.com/research/verify/)
  still shows no video.
- OpenAI, "Advancing content provenance for a safer, more transparent AI
  ecosystem" (19 May 2026), read via Internet Archive capture 2026-08-19 —
  http://web.archive.org/web/20260819171439/https://openai.com/index/advancing-content-provenance/
  — the inline "Update July 31, 2026" note expanding the verification tool to
  audio, and Content Credentials on DALL·E 3, ImageGen and **Sora** since 2024.
- Google DeepMind, SynthID —
  https://deepmind.google/technologies/synthid/ — fetched this round: the
  SynthID Detector portal is still "collaborating with journalists and media
  professionals to test the portal", with a "Join the early tester waitlist".
- Google, "Making it easier to understand how content was created and edited",
  19 May 2026 —
  https://blog.google/innovation-and-ai/products/identifying-ai-generated-media-online/
  — "we recently added SynthID verification for image, video and audio to the
  Gemini app"; expansion to Search and Chrome; "used 50 million times globally".
- Anthropic support, "How Claude marks AI-generated content" —
  https://support.claude.com/en/articles/16266773-how-claude-marks-ai-generated-content
  — fetched this round: "We'll share details on detection mechanisms in
  forthcoming technical documentation" — detection still not shipped.
- ElevenLabs, AI Speech Classifier — https://elevenlabs.io/ai-speech-classifier
  — fetched this round: free, "no login is required"; "does not reliably
  classify audio generated with the Eleven v3 model"; not a general-purpose
  detector for other providers.

## Done when

- [ ] States the statute correctly and from the statute: the free-detection-tool
      duty (§22757.2(a)), that criterion (1) names **image, video, or audio**,
      the 1,000,000-monthly-user covered-provider threshold (§22757.1(d)), the
      2 August 2026 operative date (§22757.6), and that the Act covers
      image/video/audio and **not text** — each cited to a source fetched during
      the round that publishes it, not to this item
- [ ] Leads with the checkable finding: OpenAI's public verification tool and
      verification API support images and audio and **not video**, cited to
      `developers.openai.com`'s content-provenance guide fetched that round —
      and notes that Sora is OpenAI's video generator and that OpenAI says Sora
      output has carried Content Credentials since 2024
- [ ] Dates the audio expansion two ways: OpenAI's own "Update July 31, 2026"
      note, and the archive bracket (images-only at 2026-07-31 01:48 UTC,
      images+audio at 2026-08-01 16:04 UTC) — presenting the bracket as
      evidence of *when the page changed*, never as evidence of *why*
- [ ] Treats Google fairly: the SynthID Detector portal is still waitlisted for
      journalists and media professionals, **and** SynthID verification for
      image, video and audio is live in the Gemini app per Google's own blog.
      Does not report the waitlist alone as "Google has no detector"
- [ ] Treats Anthropic fairly: text is outside this Act; the unshipped
      watermark-detection API is the EU-side contrast, not a California
      compliance failure
- [ ] Carries all five caveats from the "Unverified" section above — especially
      that no vendor was verified to meet the covered-provider threshold, and
      that the post makes **no** legal compliance determination about any
      company and reports no enforcement action
- [ ] Records that `openai.com` returns 403 to direct fetches and that those
      pages were read through the Internet Archive, so a reader can reproduce
      the check
- [ ] Re-verifies every vendor claim on the day it publishes. This item's whole
      value is that these pages are moving; a fact from 24 August is not a fact
      on publication day, and OpenAI adding video support would turn the lead
      finding into a different (and still publishable) story
- [ ] Is not a "what the California AI Transparency Act means for your business"
      compliance explainer. Law firms have written that. The post is the check
      nobody ran
