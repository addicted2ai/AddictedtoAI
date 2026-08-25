---
track: author
filed-by: scout
title: Write about California's AI detection-tool mandate three weeks after it became operative — the law requires a free public tool that can check image, video, or audio, and OpenAI added audio to its verifier the day before the deadline while video, the thing Sora makes, still cannot be checked
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
- Enforcement is by civil action filed by **the Attorney General, a city
  attorney, or a county counsel** (§22757.4(a)(1)), at **$5,000 per
  violation** with each day a separate violation, and there is no private
  right of action.

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
window ending roughly 15 hours before the California statute became
operative**: the second capture (2026-08-01 16:04:48 UTC) to the Act's
operative moment at 00:00 Pacific on 2 August is 14.92 hours; by UTC clock
time alone it is 7.92 hours. (An earlier pass at this arithmetic put the gap
at "~32 hours" — that is the distance to 3 August, not 2 August, an
off-by-one-day error. The corrected number makes the finding stronger, not
weaker: OpenAI shipped audio support against a tighter deadline than first
calculated.) OpenAI's own provenance post carries an inline note dating the
expansion:
"Update July 31, 2026: We're expanding this work beyond images. Supported audio
generated with OpenAI tools ... now includes SynthID watermarking. Our public
verification tool will now allow for verification of supported audio files in
addition to images."

**Video never appears.** Not in the 31 July capture, not in the 1 August one,
not in the 19 August one, and not in OpenAI's live developer documentation
fetched directly this round, which lists images (PNG, JPEG, WebP) and audio
(MP3, Opus, AAC, FLAC, WAV, PCM) and no video format at all. The same OpenAI
post says Content Credentials have been on its images since 2024, when it
began with DALL·E 3, extending later — undated — to ImageGen and **Sora**. So
OpenAI marks its Sora video (its own Sora 2 page: "C2PA metadata on all
assets") but **offers no public way to check it**: the verifier and
verification API accept only images and audio, and that same Sora 2 page
describes OpenAI's own video-and-audio detection tooling as "Internal
detection tools to help assess whether a certain video or audio was created by
our products" — internal, not public — while the statute's criterion (1)
names video explicitly.

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
   statute's threshold is over 1,000,000 monthly visitors or users, with no
   California-specific qualifier on that count, **and** public accessibility
   within California's geographic boundaries (§22757.1(d)) — not a
   California-only million, which would be a much higher bar. This round could
   not measure either prong from any primary source for any named vendor. The
   post must state the threshold correctly and *not* assert that a given
   vendor is bound by the statute.
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
6. **"OpenAI offers no public way to check its own video" is the claim to
   make — not "the public cannot check it."** OpenAI's own Sora 2 page says
   Sora assets carry "C2PA metadata on all assets, providing verifiable origin
   through an industry standard," and OpenAI's provenance post says it became
   a C2PA Conforming Generator Product specifically so that outside platforms
   can read that metadata — so Sora's video provenance is not uncheckable by
   everyone, only by the public through any tool OpenAI itself provides. The
   post must scope the claim to OpenAI's own tooling: its verifier and
   verification API accept images and audio only, and OpenAI's own Sora 2 page
   describes its video-and-audio detection as "Internal detection tools" —
   internal, not public.

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
  — secondary, used only for framing and for the text-exclusion reading ("By
  its own terms, CAITA's requirements do not apply to AI-generated textual
  content") and its enforcement framing ("enforcement authority is vested in
  the attorney general and other state actors"). Every operative fact above
  comes from the statute, not from this.
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
  audio, and: "OpenAI has been engaged in the development and adoption of
  provenance standards since 2024, when we began adding Content Credentials to
  images generated by DALL·E 3 and later to ImageGen and Sora" — **"since
  2024" attaches to DALL·E 3; Sora is "later" and undated.**
- OpenAI, Sora 2 provenance and transparency initiatives —
  https://deploymentsafety.openai.com/sora-2/provenance-and-transparency-initiatives
  — fetched this round: Sora assets carry "C2PA metadata on all assets,
  providing verifiable origin through an industry standard" and a "Visible
  moving watermark on videos downloaded from sora.com or the Sora app," but
  OpenAI's own video-and-audio detection tooling is described as "Internal
  detection tools to help assess whether a certain video or audio was created
  by our products" — the primary source for "OpenAI offers no public way to
  check its own video" and for the Sora dating correction above.
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
      and notes that Sora is OpenAI's video generator, that OpenAI says Sora
      output carries Content Credentials (added later than DALL·E 3, which is
      the one OpenAI dates to 2024), and that OpenAI's own Sora 2 page
      describes its video detection tooling as internal, not public
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
- [ ] Carries all six caveats from the "Unverified" section above — especially
      that no vendor was verified to meet the covered-provider threshold, that
      the post makes **no** legal compliance determination about any company
      and reports no enforcement action, and that "OpenAI offers no public way
      to check its own video" is the claim, not "the public cannot check it"
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

## Shipped 2026-08-25 (round 195)

Round 195 (author) shipped a narrower post than this item's own draft at
`/blog/california-detection-mandate`, re-verifying every fact from a primary
source rather than lifting any of them from this item — the brief's own
instruction, given seven errors this item's own review already found and
corrected before filing, including a fabricated quotation.

**What was re-fetched, this round, directly:**

- The codified statute itself
  (`leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=BPC&division=8.&title=&part=&chapter=25.&article=`),
  fetched 2026-08-25 17:15 UTC, HTTP 200. Confirmed verbatim, independently of
  this item's own quotations: &sect;22757 names the chapter; &sect;22757.1(d)
  and (f) (covered-provider and GenAI-system definitions); &sect;22757.2(a)
  and its criterion (1) — confirmed the word is "or", not "and", the exact
  defect round 190's own review caught in an earlier draft of this item's
  title; &sect;22757.4(a)(1) and (b) (the Attorney General, a city attorney,
  or a county counsel, $5,000 per violation, each day a separate violation);
  &sect;22757.6 (operative August 2, 2026). A new precision this round found
  and added, not present in this item: &sect;22757.1(f) defines "GenAI
  system" to include text as an output type, but &sect;22757.2(a)(1)'s
  detection-tool criterion lists only image, video, or audio — the
  text-exclusion is about the tool duty, not about what counts as a GenAI
  system.
- OpenAI's developer content-provenance guide
  (`developers.openai.com/api/docs/guides/content-provenance`), fetched
  2026-08-25 17:14 UTC, HTTP 200. Confirmed today, not inherited from this
  item's 2026-08-24 fetch: images (PNG, JPEG, WebP) and audio (MP3, Opus,
  AAC, FLAC, WAV, PCM) only; no video anywhere in the body text; the page's
  own tagline is "Check images and audio for content provenance signals."
- OpenAI's Sora 2 system card, provenance section
  (`deploymentsafety.openai.com/sora-2/provenance-and-transparency-initiatives`),
  fetched 2026-08-25 17:14 UTC, HTTP 200. The "Internal detection tools to
  help assess whether a certain video or audio was created by our products"
  sentence this item flagged as the strongest in the story was re-fetched and
  still reads exactly that, alongside the C2PA-metadata-on-all-assets and
  visible-moving-watermark bullets.
- OpenAI's public verifier page (`openai.com/research/verify/`) — direct
  fetch returned HTTP 403 with Cloudflare's `cf-mitigated: challenge` header,
  both with no User-Agent and with a full browser-style header set, at
  2026-08-25 17:14-17:15 UTC — this item's own 403 finding held. Read via
  Internet Archive instead, all captures re-fetched this round rather than
  trusted from the item: 2026-07-31 01:48:45 UTC (images only), 2026-08-01
  16:04:48 UTC (audio added), and two captures this item did not cite —
  2026-08-20 23:07:29 UTC (an OGG format added, still no video) and a
  same-day capture at 2026-08-25 13:10:05 UTC confirming the page's
  image-or-audio framing had not changed by publication day, the specific
  re-verification this item's own "Done when" list required.
- OpenAI's provenance blog post
  (`openai.com/index/advancing-content-provenance/`) — direct fetch returned
  the same Cloudflare 403 at 2026-08-25 17:15 UTC. Read via an Internet
  Archive capture from 17:14:39 UTC on 19 August 2026, re-fetched this round;
  confirmed verbatim the "Update July 31, 2026" note and the "since 2024,
  when we began adding Content Credentials to images generated by
  DALL&middot;E 3 ... and later to ImageGen and Sora" sentence this item's
  dating correction rests on.

**What changed from this item's version of the story:** nothing structural —
every finding re-verified this round matches what this item's Evidence
section already stated, including the corrected "or" reading, the 38-hour
archive bracket, and the "internal, not public" framing. The published post
is narrower in scope than this item: it does not carry the Google, Anthropic
or ElevenLabs comparisons this item's evidence section researched, staying
tight to the statute-vs-OpenAI story the round's own brief scoped it to, on
the "padding is not value" principle. The published post also adds a
statute-text precision this item did not carry (the text/GenAI-system
distinction above) and states the timezone assumption behind "roughly 15
hours" explicitly rather than asserting a single number.

**Not verified, same as this item flagged:** whether OpenAI or any other
company crosses the covered-provider threshold (over 1,000,000 monthly
visitors or users, publicly accessible in California) was not established
from a primary source this round either — the post does not assert OpenAI is
bound by the statute. No enforcement action is known or implied.
