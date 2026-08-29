---
job: seed-blog-three-definitions-of-a-knowledge-cutoff
verdict: approve
reasons: []
would-cite: >-
  Someone pasting a cross-vendor knowledge-cutoff comparison table into a
  model-selection thread — this post shows the three columns are three
  different quantities, including one current model card that publishes two
  cutoffs fourteen months apart.
reviewer: r3-opus
date: 2026-08-28
---

Checklist: blog post built on a census of three vendors' published fields.
Sources fetched 2026-08-28.

- deepmind.google/models/model-cards/gemini-3-7-flash/: resolves. The
  knowledge-cutoff sentence is verbatim as quoted: the cutoff "is March 2026
  – users can expect updated information for some domains while in others
  they may experience the model's knowledge is limited to January 2025".
  March 2026 to January 2025 is the fourteen months the post claims. The card
  is published 13 August 2026, and the post is dated 2026-08-14 — "shipped
  yesterday" is literally right.
- developers.openai.com/api/docs/models: resolves. `gpt-5.6-sol`,
  `gpt-5.6-terra` and `gpt-5.6-luna` each carry the identical cutoff
  "Feb 16, 2026", exactly as the post states, and the page nowhere defines
  what "knowledge cutoff" means — which is the post's claim, checked rather
  than assumed.
- developers.openai.com/api/docs/changelog: the GPT-5.6 family is dated
  2026-07-09. I recomputed the gap: 16 February 2026 to 9 July 2026 is 143
  days. Exact.
- platform.claude.com/docs/en/models/overview: resolves. Both definitions are
  on the page and quoted faithfully — "Reliable knowledge cutoff: The date
  through which the model's knowledge is most extensive and reliable" and
  training data cutoff as "the broader range of data used". The four-row
  table reproduces exactly: opus-5 May 2026 / May 2026; fable-5 Jan 2026 /
  Jan 2026; sonnet-5 Jan 2026 / Jan 2026; haiku-4-5 Feb 2025 / Jul 2025. The
  five-month split on the older Haiku — the post's central illustration of
  what a single-number cutoff erases — is real and is the only row where the
  two fields differ. No release date is published on this page, consistent
  with the post's "—" for sonnet-5 and its sourcing of release dates to the
  individual model pages.
- ai.google.dev/gemini-api/docs/models: resolves, and confirms the post's
  most falsifiable claim — there is no knowledge cutoff on the page, for
  gemini-3.7-flash, gemini-3.6-flash or any other model. The number exists
  only on deepmind.google. "A developer choosing a model inside the API docs
  is the one reader who never sees it" is an accurate description of what I
  found, not a rhetorical flourish.
- Arithmetic checked rather than accepted: Jan 2025 to May 2026 is the
  "sixteen months" of the closing section. Claude Opus 5 released 2026-07-24
  against a May 2026 cutoff gives 54 to 84 days depending on where in May the
  cutoff falls — the post's "between eight and twelve weeks" rounds the low
  end from 7.7, which its own limits section licenses by saying month-granular
  cutoffs make this a range rather than a number. haiku-4-5's Feb 2025 cutoff
  against its 2025-10-01 release is seven to eight months, and the post says
  "about seven months"; against the post's own date it is seventeen to
  eighteen months, and the post says "more than seventeen months". Both are
  stated at the conservative end, which is the right direction to round.
- Minor, not blocking: the post describes the Gemini API models index as
  listing "token limits, capabilities, versions and an update month". I could
  confirm capabilities, version labels and a page update stamp; the fetch did
  not surface per-model token limits. This is a descriptive aside about a page
  whose load-bearing property — the absence of a cutoff — is confirmed.
- Not independently verified: the individual Claude model pages carrying the
  release dates 2026-07-24 and 2026-06-09 were not opened here, but both
  dates are corroborated by the companion retirements post's independently
  checked release-plus-365 retirement commitments on the deprecations page.

The payload is precise and genuinely assembled rather than restated: three
vendors, three quantities, three precisions, three locations — and the
observation that the same January 2025 which is the worst dated knowledge on
sale also sits *inside* the newest Gemini model's own range. Every definition
is quoted so the piece can be re-checked when a vendor changes one, which the
limits section says outright is how it will age. Approve.
