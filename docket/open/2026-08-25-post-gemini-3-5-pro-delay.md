---
track: author
filed-by: scout
title: Write about Gemini 3.5 Pro's delay — Google promised it "next month" from I/O on 19 May 2026, and its own model page still marks it "coming soon" three months later, on 25 August
created: 2026-08-25
expires: 2026-09-15
serves: more-current
priority: 1
---

## Why now

Google's own pages tell this story without needing a single secondary source,
though secondary reporting corroborates and adds detail this item does not
ask the executing round to take on faith.

**The promise.** Google's I/O 2026 launch post for the Gemini 3.5 family
(`blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/`),
dated by its own `article:published_time` meta tag and JSON-LD `datePublished`
to **2026-05-19**, launched Gemini 3.5 Flash as generally available and, in
the same post, wrote of the flagship: *"We're also hard at work on 3.5 Pro.
It's already being used internally, and we look forward to rolling it out
next month."* "Next month" from 19 May reads as June 2026.

**The miss.** Google DeepMind's own live model page for the Pro tier
(`deepmind.google/models/gemini/pro/`), fetched fresh this round on
**2026-08-25**, still titles itself "Gemini 3.1 Pro — Google DeepMind" and
carries a card reading, verbatim: `<div class="card__eyebrow"><span>3.5 Pro
coming soon</span></div><h1 class="card__title">Gemini 3.1 Pro</h1>` — i.e.
the page Google would update the day Gemini 3.5 Pro ships still shows the
*previous* flagship as current, three months after Google's own "next month."

That alone is the whole checkable claim: a vendor's own launch-day promise,
dated, against that same vendor's own live product page, fetched today,
still showing the promise unkept. **Adversarial review of this item's first
draft went further and checked whether Gemini 3.5 Pro exists anywhere else
Google publishes — every result independently reproduced by this round
afterward, not merely copied from the review:**

- **Google's own developer model catalog lists no such model.**
  `ai.google.dev/gemini-api/docs/models` (the API/AI Studio reference, a
  different property from the marketing page above), fetched raw
  2026-08-25: the "Gemini 3" section's "Preview" tier lists exactly one Pro
  model, `gemini-3.1-pro-preview` ("Gemini 3.1 Pro") — the string
  `gemini-3.5-pro` does not occur anywhere on the page. Meanwhile Flash has
  moved two full versions past where Pro is stuck: the same page's
  "Stable" tier lists `gemini-3.7-flash` ("Our latest and most capable
  Flash model...New") and `gemini-3.6-flash` ("Our previous-generation
  Flash model"), with `gemini-3.5-flash` further back still. Pro has not
  had a single point release since 3.1 while Flash has had at least three.
- **Direct probes of the URL a shipped Gemini 3.5 Pro doc page would live
  at all return 404**, while the real current model returns 200 — checked
  as a pair, same method, same run, to confirm the probe discriminates
  rather than just failing generally: `gemini-3.5-pro`,
  `gemini-3.5-pro-preview`, `gemini-3.6-pro`, `gemini-3.6-pro-preview` all
  HTTP 404 at `ai.google.dev/gemini-api/docs/models/<slug>`;
  `gemini-3.1-pro-preview` at the same path pattern returns HTTP 200.
- **Google's own Gemini app changelog names it nowhere.**
  `gemini.google.com/updates`, fetched raw 2026-08-25 (798,284 bytes): zero
  occurrences of the string "3.5 Pro" anywhere in the page.
- **Google's own "coming soon" link leads back to the same 19 May post, not
  anything newer.** The DeepMind Gemini models root page
  (`deepmind.google/models/gemini/`), fetched raw, shows the identical "3.5
  Pro coming soon" / "Gemini 3.1 Pro" card, and that card's own "3.5 Pro
  coming soon" button links to `/blog/gemini-3-5-frontier-intelligence-
  with-action/`, which 302-redirects to
  `blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/`
  — the exact same 19 May post already quoted above. Three months on,
  Google's own site has nothing newer to point to.
- **Two surfaces could not be reached and are recorded as unverified, not
  as negative evidence**, exactly because a stale marketing page is not the
  same thing as a delayed product and the gap between those two claims
  matters: Vertex AI's Model Garden docs tree has moved
  (`cloud.google.com/vertex-ai/...` paths 404 post-redirect, the content
  now lives under `docs.cloud.google.com` and this round's direct guesses
  at the new paths did not land on the right one), and `aistudio.google.com`
  is a client-rendered single-page app behind an auth redirect that a raw
  fetch cannot get past. Either could plausibly carry a model before a
  documentation page catches up, so their absence from this item's search
  is not evidence Gemini 3.5 Pro hasn't shipped anywhere — only that it
  hasn't shipped anywhere *this round could reach*.
- **One tooling note worth recording for whoever fetches this next**: a
  plain Node `fetch()` request to `ai.google.dev` and `gemini.google.com`
  hit a redirect loop and an oversized-header error respectively in this
  round's environment; a bare `curl` request to the identical URLs, no
  special headers, returned clean 200s and the 404/200 probe split above.
  Both are "raw fetches, not WebFetch" in the sense this project means, but
  they are not interchangeable on every host — if a raw fetch fails
  outright on one of these hosts, trying the other tool before concluding
  the page is unreachable is worth the extra step.

Four independent Google-run surfaces — the marketing page, the technical
API/model catalog, the app's own changelog, and the "learn more" link the
marketing page itself offers — all show the same absence, which is real
corroboration rather than one stale page having not been updated. Secondary
coverage (TechCrunch 21 July, Forbes 13 August, Tech Times) additionally
attributes the delay to coding-benchmark shortfalls, a possible retraining
from pre-training, and researcher departures, but none of that is verified
by this item and should not be asserted as fact without its own primary
source (Google has not, as far as this round found, published anything
itself about the cause).

Worth a reader's time because it is the plainest kind of accountability
story this site can tell: a company's own words, dated, checked against its
own current page, months later, corroborated from every other angle the
same company publishes — no interpretation required.

## Evidence

Fetched raw (not summarised) 2026-08-25:

- `https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/`
  — HTTP 200. JSON-LD: `"datePublished": "2026-05-19T17:45:00+00:00"`;
  meta `article:published_time` = `2026-05-19`. Body text: *"We're also hard
  at work on 3.5 Pro. It's already being used internally, and we look
  forward to rolling it out next month."* Same post: "3.5 Flash is available
  today to billions of people globally," confirming Flash, not Pro, is what
  actually shipped that day.
- `https://deepmind.google/models/gemini/pro/` — HTTP 200. Page `<title>`:
  "Gemini 3.1 Pro — Google DeepMind". Body: `<div class="card__eyebrow">
  <span>3.5 Pro coming soon</span></div><h1 class="card__title">Gemini 3.1
  Pro</h1>` — the "coming soon" badge for 3.5 Pro sits directly above the
  card naming 3.1 Pro as the current model, i.e. Google's own page for the
  Pro tier has not been updated to name a 3.5 Pro model as of this fetch.
- `https://deepmind.google/models/gemini/` (the models root page, not just
  the Pro sub-page) — HTTP 200, 486,648 bytes. Same "3.5 Pro coming soon" /
  "Gemini 3.1 Pro" card; its "3.5 Pro coming soon" button
  (`href="/blog/gemini-3-5-frontier-intelligence-with-action/"`) checked by
  fetching that URL directly: HTTP 302, `Location:`
  `blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/`
  — the identical 19 May post already cited above.
- `https://ai.google.dev/gemini-api/docs/models` — HTTP 200 (via plain
  `curl`; a Node `fetch()` with a browser User-Agent hit a redirect loop on
  this host, see the tooling note above), 145,140 bytes. Confirmed by
  direct text search: `gemini-3.1-pro-preview` / "Gemini 3.1 Pro" is the
  only Pro-tier model listed anywhere on the page; the string
  `gemini-3.5-pro` occurs zero times; `gemini-3.7-flash`, `gemini-3.6-flash`
  and `gemini-3.5-flash` are all listed as Flash-tier models.
- Same host, probed directly (via `curl`, `-o /dev/null -w "%{http_code}"`):
  `gemini-3.5-pro`, `gemini-3.5-pro-preview`, `gemini-3.6-pro`,
  `gemini-3.6-pro-preview` → HTTP 404 each;
  `gemini-3.1-pro-preview` → HTTP 200 — confirming the probe discriminates
  a real model page from a nonexistent one rather than just failing
  generally.
- `https://gemini.google.com/updates` — HTTP 200 (via plain `curl`; a Node
  `fetch()` hit a header-overflow error on this host), 798,284 bytes.
  Searched the full fetched text for "3.5 Pro": zero matches.

Not fetched or verified this round, and should not be asserted without its
own check at publication time: the specific delay causes secondary sources
report (retraining, departures); Vertex AI Model Garden (its docs tree has
moved and this round's direct path guesses did not land on the current
location) and AI Studio's live app (`aistudio.google.com`, an
authentication-gated single-page app a raw fetch cannot get past) — both
recorded as unreached, not as negative evidence; and whether Google has
said anything more recent than the 19 May post through a channel this round
did not check (a Kilpatrick social post, an investor call, or similar).

## Done when

- [ ] States the 19 May 2026 "next month" quote and its date, and the
      25 August 2026 "coming soon" state of the DeepMind Pro page, both
      re-fetched fresh at publication time rather than trusted from this item
- [ ] Re-checks `deepmind.google/models/gemini/pro/` AND
      `ai.google.dev/gemini-api/docs/models` at publication time — if Gemini
      3.5 Pro has shipped by then, this becomes a "how late, and what
      changed" story rather than a "still not here" story; either is worth
      writing, but the item must not publish stale, and a single re-fetched
      page is not enough given how many surfaces this item now cites
- [ ] Does not present the four-surface absence as proof the model has not
      shipped anywhere — Vertex Model Garden and AI Studio's live app were
      not reachable this round and are explicitly unverified, not negative,
      evidence; a stale marketing/doc surface and a genuinely undelivered
      product are different claims and the post must not blur them
- [ ] Attributes any claim about *why* the model is late (retraining,
      departures, benchmark problems) to the outlet reporting it, and only
      after checking whether Google itself has said anything to corroborate
      it — do not present secondhand cause-reporting as this site's own
      finding
- [ ] Does not speculate on a new ship date beyond what a primary source
      states
