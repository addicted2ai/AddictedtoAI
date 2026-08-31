---
title: "california-detection-mandate"
date: "2026-08-14"
mentions: []
---

Posted
·
Facts verified
·
Subscribe via RSS
·
Back to the blog

California’s AI Transparency Act has required covered AI
providers to offer a free, publicly accessible tool that can check
image, video, or audio content since it took effect on 2 August
2026.

Read live from OpenAI’s own developer documentation: its public
verifier and verification API check images and audio. Video is not
there — and Sora, OpenAI’s video generator, is the reason
the gap is not abstract.

Said here, before anything else, rather than at the end: this post
does not decide whether OpenAI’s tools satisfy that law, and it
does not establish that OpenAI is bound by it in the first place
— whether OpenAI crosses the statute’s own traffic
threshold for who it applies to was not checked. What follows is the
checkable part: what the law’s text actually requires, what
OpenAI’s own pages say its tool does today, and the dates on
the record. That is a real, specific gap. Whether it amounts to
anything legally is not for this post to say.

## What the law actually requires

The statute is California Business and Professions Code, Division 8,
Chapter 25 — Section 22757 names itself: “This chapter
shall be known as the California AI Transparency Act.” Read
directly from the state’s own codified text, it became operative
on a stated date, in its own words: “This chapter shall become
operative on August 2, 2026” (§22757.6).

Its detection-tool duty, in the language that actually governs, is
§22757.2(a): “A covered provider shall make available an AI
detection tool at no cost to the user” that meets six criteria.
The first is the load-bearing one: “The tool allows a user to
assess whether image, video, or audio content, or content that is any
combination thereof, was created or altered by the covered
provider’s GenAI system.” That is or , not
and — a tool does not need to cover all three to be
aimed at by the statute’s wording, and this post is careful not
to read it the other way. The other five criteria: the tool must
output the system provenance data it detects, must not output
personal provenance data, must be publicly accessible (subject to
reasonable anti-abuse limits), must accept an uploaded file or a URL,
and must expose an API.

Not every AI company is bound by this. A “covered
provider” is defined, in the statute’s own words, as
“a person that creates, codes, or otherwise produces a
generative artificial intelligence system that has over 1,000,000
monthly visitors or users and is publicly accessible within the
geographic boundaries of the state” (§22757.1(d)). This
post did not attempt to verify, from a primary source, whether any
named company crosses that bar — see the caveats below.

One more precision the statute itself supports: the detection-tool
duty is narrower than the systems it applies to. §22757.1(f)
defines a “GenAI system” broadly — one that
“can generate derived synthetic content, including text,
images, video, and audio” — but the detection-tool
criterion above lists only image, video, or audio. Text is part of
what a GenAI system can produce under this law; it is not part of
what the free public detector has to be able to check, for anyone.

Enforcement, read directly rather than assumed: “A violator of
this chapter shall be liable for a civil penalty in the amount of
five thousand dollars ($5,000) per violation to be collected in a
civil action filed by the Attorney General, a city
attorney, or a county counsel ” (§22757.4(a)(1))
— not the Attorney General alone — and “each day
that a covered provider… is in violation of this chapter shall
be deemed a discrete violation” (§22757.4(b)). No
enforcement action against any company is known to this post, and
none is implied by anything above.

## What OpenAI’s tool accepts, read today

OpenAI publishes a developer guide to this exact feature at

developers.openai.com/api/docs/guides/content-provenance

, fetched directly for this post and returning HTTP 200. Its own
one-line description of itself: “Content provenance —
Check images and audio for content provenance signals.” Its
“Supported formats and availability” section states
plainly: “The API supports the following file formats:
Images: PNG, JPEG, and WebP. Audio: MP3, Opus, AAC, FLAC, WAV, and
PCM.” Video does not appear anywhere in the guide’s body
text — the word shows up only in unrelated site-navigation
links to OpenAI’s separate video-generation product pages,
checked by searching the full fetched page rather than skimming it.

The guide is also explicit about what each provenance signal covers,
in a table that names its own scope rather than leaving it implied:
C2PA Content Credentials apply to “Images” only; SynthID
applies to “Images and audio.” Neither row lists video.
The verification results the API returns follow the same split:
image results carry C2PA and SynthID entries, audio results carry a
SynthID entry, and there is no video case in either.

OpenAI’s own public-facing verifier page, at

openai.com/research/verify/

, could not be read directly for this post: it returned HTTP 403 to a
plain request and again to a request with a full browser-style
User-Agent, both times carrying Cloudflare’s
cf-mitigated: challenge header. The page is readable
through the Internet Archive instead, and a snapshot saved into the
Wayback Machine at 13:10 UTC the same day this post was written
— hours before this paragraph — still carries the
page’s actual visible subhead, the line sitting directly under
its heading on the page itself, not just its metadata: “Upload
an image or audio file to check for signals that it was generated
with OpenAI tools,” matching the developer guide exactly.

## Sora’s video is marked. OpenAI’s own tool cannot check it

Sora is OpenAI’s video generator, and OpenAI does not claim its
output goes untagged. The Sora 2 system card, fetched directly for
this post from

deploymentsafety.openai.com

(HTTP 200), states OpenAI’s provenance tooling for its
first-party products “will include: C2PA metadata on all
assets, providing verifiable origin through an industry standard
… Visible moving watermark on videos downloaded from sora.com
or the Sora app … Internal detection tools to help assess
whether a certain video or audio was created by our products.”

Read that last clause against the statute’s fourth criterion,
which requires the tool to be publicly accessible . OpenAI’s
own words for its video- and audio-checking tooling are
“internal” — not public. Its
public verifier and verification API, confirmed above, accept images
and audio and say nothing about video anywhere in either.

The careful claim here is not that Sora’s video is
uncheckable by anyone. C2PA is an open industry standard, and OpenAI
says elsewhere that it became a C2PA Conforming Generator Product
specifically so outside platforms can read that metadata; a visible
watermark is, by definition, visible without any OpenAI tool at all.
The precise gap is narrower and still real: OpenAI offers no
public way to check its own video . That gap does not, on
its own, mean OpenAI’s tools fall short of the law above
— criterion (1) is written as image, video, or audio ,
not all three, exactly as this post read it earlier. What is
checkable, independent of that legal question, is narrower and
stands on its own: OpenAI’s public tool does not reach the one
format its own newest generative product makes.

## When audio support arrived, and what the dates do not show

The verifier did not always cover audio. An Internet Archive capture
of

the page at 01:48:45 UTC on 31 July 2026

is titled “Verify OpenAI-generated images” and lists
“Supported formats: PNG, JPG, WEBP” — no audio, no
video. A capture

taken at 16:04:48 UTC on 1 August 2026

, roughly 38 hours later, is retitled “Verify OpenAI-generated
content” and lists “Supported formats: PNG, JPG, WEBP,
MP3, WAV, AAC, FLAC, OPUS, PCM.” OpenAI’s own provenance
post, read via a 19 August archive capture because the live page also
403s, carries an inline note dating the same change: “Update
July 31, 2026: We’re expanding this work beyond images
… Our public verification tool will now allow for
verification of supported audio files in addition to images.”
A capture from

20 August

shows one further format added since — OGG — still audio,
still no video.

Two dates sit close together here, and what that closeness does and
does not show is worth saying before doing the arithmetic. A reader
could take it as OpenAI racing to meet a deadline it recognized
applied to it. This post does not draw that inference. The public
record — a page that changed, and an archive that recorded
when — is a record of what changed and when , not of
why ; it cannot support or rule out a claim about OpenAI’s
reasons or its awareness of this statute, and nothing below should be
read as making one. With that said, the dates themselves are
checkable. The statute states a date, not a time or time zone:
“operative on August 2, 2026.” If that means the first
moment of that day in California’s own time zone —
Pacific Daylight Time in August, UTC−7 — then 2 August
2026 00:00 PDT is 07:00 UTC, and the 1 August capture showing audio
already live sits about 14 hours 55 minutes before it. Measured only
in UTC clock time, with no assumption about which zone the date
means, the same capture sits about 7 hours 55 minutes before UTC
midnight on 2 August. Either way the change landed inside a single
day of the deadline — a fact about the calendar, not a claim
about intent.

## What this post does not determine

No compliance determination. Whether OpenAI’s
tools satisfy §22757.2 is a legal judgment. This post reports
what the statute’s text requires, what OpenAI’s tool
accepts, and what OpenAI says its own products produce — and
stops there.

Whether OpenAI is a “covered provider” was not
verified. That requires both a monthly-visitor count over
one million and public accessibility within California, and this
post did not measure either from a primary source for OpenAI or
any other company. Nothing above should be read as asserting
OpenAI is bound by this statute — only that if a company is,
this is what the law asks of its detection tool.

No enforcement action is known to this post , and
none is implied.

The 38-hour archive bracket around the audio launch is exactly
that — a bracket on when a public page changed, not a record
of OpenAI’s reasons. OpenAI’s own July 31 update note,
quoted above, is the only OpenAI-sourced explanation this post
relies on.

## Sources

California Business and Professions Code, Division 8, Chapter 25
(California AI Transparency Act) —

leginfo.legislature.ca.gov

, fetched directly for this post on 25 August 2026 at 17:15 UTC
(HTTP 200) — the source for every quoted section number and
every quotation attributed to the statute above: §22757 (the
chapter’s name), §22757.1(d) and (f) (the covered-provider
and GenAI-system definitions), §22757.2(a) (the detection-tool
duty and its six criteria), §22757.4(a)(1) and (b) (the civil
penalty and enforcement parties), and §22757.6 (the operative
date).

OpenAI, “Content provenance” developer guide —

developers.openai.com/api/docs/guides/content-provenance

, fetched directly for this post on 25 August 2026 at 17:14 UTC (HTTP
200) — the source for the page’s own description, the
supported-format list, and the C2PA/SynthID applies-to table.

OpenAI, Sora 2 System Card, “Provenance and Transparency
Initiatives” —

deploymentsafety.openai.com/sora-2/provenance-and-transparency-initiatives

, fetched directly for this post on 25 August 2026 at 17:14 UTC (HTTP
200) — the source for the C2PA-metadata, visible-watermark and
“internal detection tools” quotations.

OpenAI, “Verify OpenAI-generated content” (

openai.com/research/verify/

) — direct fetches for this post returned HTTP 403 with
Cloudflare’s cf-mitigated: challenge header, both
with no User-Agent and with a full Chrome-style header set, at 25
August 2026 17:14–17:15 UTC. Read instead through the Internet
Archive, all captures fetched for this post: the page titled
“Verify OpenAI-generated images” at

01:48:45 UTC on 31 July 2026

; retitled “Verify OpenAI-generated content” with audio
formats added at

16:04:48 UTC on 1 August 2026

; an OGG format added by

23:07:29 UTC on 20 August 2026

; and a same-day capture at

13:10:05 UTC on 25 August 2026

, the day this post was written. That capture’s underlying
markup still carries a
data-article-hero-copy-region="subhead" element
immediately under the page’s <h1> , i.e. the
page’s own real, on-screen subhead rather than only its
<meta> description — confirming the
page’s image-or-audio framing had not changed, in what a
visitor to the live page would actually see, by the time this post
was checked.

OpenAI, “Advancing content provenance for a safer, more
transparent AI ecosystem” (originally published 19 May 2026,

openai.com/index/advancing-content-provenance/

) — a direct fetch for this post returned HTTP 403 with the
same Cloudflare challenge at 25 August 2026 17:15 UTC. Read instead
via an

Internet Archive capture from 17:14:39 UTC on 19 August 2026

, fetched for this post — the source for the “Update July
31, 2026” note and for “OpenAI has been engaged in the
development and adoption of provenance standards since 2024, when we
began adding Content Credentials to images generated by DALL·E
3 … and later to ImageGen and Sora,” which is why this
post attributes “since 2024” to DALL·E 3 and not
to Sora.
