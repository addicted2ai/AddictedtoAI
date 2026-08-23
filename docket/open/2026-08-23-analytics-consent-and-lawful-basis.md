---
track: build
filed-by: build
title: Get a maintainer decision on whether Google Analytics needs a consent banner before it loads
created: 2026-08-23
expires: 2026-11-21
serves: more-true
priority: 2
---

## Why now

On 2026-08-23 the maintainer configured `NEXT_PUBLIC_GA_MEASUREMENT_ID` in
the hosting environment. `app/layout.js` renders `<GoogleAnalytics>` whenever
that value parses, so the measurement script began loading on every page at
the first deploy after that -- round 176's own merge. Before that day the
code existed and was inert, which is why the site has never had to answer
this question.

Round 176 disclosed the collection (`/disclosure`, "What this site collects")
and removed the only event that conflicted with a published promise. It did
not decide the legal question, and deliberately said so on the page rather
than resolving it quietly:

- The ePrivacy Directive's Article 5(3) requires consent before storing or
  reading information on a user's terminal equipment, with a narrow
  exemption for what is strictly necessary to provide a service the user
  requested. Analytics cookies are not obviously inside that exemption, and
  several supervisory authorities have said they are not.
- The GDPR requires a lawful basis for processing personal data. Whether
  GA4's client identifier plus IP-derived location is personal data here,
  and if so on what basis it is processed, is not something this loop can
  settle.
- A consent banner is also a design and honesty question, not only a legal
  one: this site's whole argument is that it tells visitors the truth about
  itself before they have to ask.

CHARTER.md rule 11's shape applies. The run that benefits from a permissive
answer is not the run that should give it, and round 176 is the run that
switched the analytics on.

This item asks for a decision, not for an implementation. If the answer is
"a banner is required", a follow-up item builds it; if the answer is "the
disclosure page is sufficient for this site's traffic and purpose", that
reasoning is recorded on `/disclosure` in place of the open-question
paragraph currently there.

## Evidence

- `app/layout.js` -- `<GoogleAnalytics gaId={gaMeasurementId} />`, rendered
  only when `getAnalyticsMeasurementId()` returns non-null.
- `app/lib/analytics.js` -- the measurement-ID gate both the layout and
  `/disclosure` read.
- `app/disclosure/page.js`, "What this site collects" -- the current
  disclosure and the paragraph naming this as unsettled.
- `CHARTER.md` rule 17 -- "Collect nothing personal. No accounts, no
  personal data, no tracking beyond aggregate analytics." Permits the
  collection; says nothing about consent.
- `CHANGELOG.md`, round 176, item 6 -- the full account of what changed and
  why this was filed rather than decided.

## Done when

- [ ] The maintainer states, on the record, whether this site loads Google
      Analytics without a consent banner, or gates it behind one
- [ ] If a banner is required, a follow-up item specifies it (default state,
      what the "reject" path does to the measurement script, and where the
      choice is stored) and this item closes pointing at it
- [ ] Either way, `/disclosure`'s open-question paragraph is replaced with
      the decision and its reasoning
- [ ] `node scripts/round.mjs check` green
