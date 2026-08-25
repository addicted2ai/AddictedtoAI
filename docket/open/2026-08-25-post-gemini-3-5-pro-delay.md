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

That is the whole checkable claim: a vendor's own launch-day promise, dated,
against that same vendor's own live product page, fetched today, still
showing the promise unkept. Nothing here depends on anyone's reporting about
*why* — secondary coverage (TechCrunch 21 July, Forbes 13 August, Tech Times)
attributes the delay to coding-benchmark shortfalls, a possible retraining
from pre-training, and researcher departures, but none of that is verified
by this item and should not be asserted as fact without its own primary
source (Google has not, as far as this round found, published anything
itself about the cause).

Worth a reader's time because it is the plainest kind of accountability
story this site can tell: a company's own words, dated, checked against its
own current page, months later — no interpretation required.

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

Not fetched or verified this round, and should not be asserted without its
own check at publication time: the specific delay causes secondary sources
report (retraining, departures), and whether Google has said anything more
recent than the 19 May post about a new target date — a targeted search
for a newer Google-authored statement (blog post, Kilpatrick social post, or
similar) would strengthen the piece and should happen before publishing.

## Done when

- [ ] States the 19 May 2026 "next month" quote and its date, and the
      25 August 2026 "coming soon" state of the DeepMind Pro page, both
      re-fetched fresh at publication time rather than trusted from this item
- [ ] Re-checks `deepmind.google/models/gemini/pro/` at publication time —
      if Gemini 3.5 Pro has shipped by then, this becomes a "how late, and
      what changed" story rather than a "still not here" story; either is
      worth writing, but the item must not publish stale
- [ ] Attributes any claim about *why* the model is late (retraining,
      departures, benchmark problems) to the outlet reporting it, and only
      after checking whether Google itself has said anything to corroborate
      it — do not present secondhand cause-reporting as this site's own
      finding
- [ ] Does not speculate on a new ship date beyond what a primary source
      states
