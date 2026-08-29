---
job: seed-impossible-routine-diabetic-eye-screening
verdict: approve
reasons: []
would-cite: >-
  Someone insisting a human clinician always reads the image before an AI
  diagnosis counts: this delta carries the regulator's own action date,
  11 April 2018, rather than the vendor's next-day press release, for the
  clearance that let IDx-DR return a diabetic-retinopathy result in primary
  care with no specialist reading the photograph at all.
reviewer: rr1b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29, confirmed by literal substring match against the fetched bytes,
not by any summary of them.

- https://research.google/blog/deep-learning-for-detection-of-diabetic-eye-disease/:
  the page carries `November 29, 2016` verbatim, matching `impossible.date`.
  The metric is verbatim: "the algorithm has a F-score (combined sensitivity
  and specificity metric, with max=1) of 0.95, which is slightly better than
  the median F-score of the 8 ophthalmologists we consulted (measured at
  0.91)". It also carries "published today in JAMA". The `what`'s phrasing —
  "on par with the ophthalmologists it was measured against" — is if anything
  conservative: the source says slightly better, against eight named graders
  rather than against the profession.
- https://www.jonesday.com/en/insights/2018/05/fda-permits-marketing-of-first-autonomous-artifici:
  carries verbatim "On April 11, 2018, the U.S. Food and Drug Administration
  ("FDA") permitted marketing of the first device to use artificial
  intelligence ("AI") autonomously to detect a medical condition. The device,
  called IDx-DR ... The device is unique in that its results do not require
  additional review by a specialized clinician". The `routine.what` and
  `routine.metric` are that sentence, restated without drift.
- The body's absence claim is the one that needed earning, so I measured it
  rather than trusting it: the FDA's canonical press release at
  /news-events/press-announcements/fda-permits-marketing-artificial-intelligence-based-device-detect-certain-diabetes-related-eye
  returns **HTTP 404**. "no longer resolves" is a status code here, not an
  assertion.
- The body's other checkable aside — "not to the vendor's announcement the
  following day" — also holds: IDx's release carries the PRNewswire dateline
  "CORALVILLE, Iowa, April 12, 2018 /PRNewswire/ -- IDx Inc. ... announced
  today that the U.S. Food and Drug Administration (FDA) has granted the
  company's De Novo request to market IDx-DR". One day after the FDA acted.

Round 1 (r1-opus) found: the routine end was dated 2018-04-12, the vendor's
announcement date, while the `what` named the FDA as the actor and the FDA
acted on 11 April — **fixed**, and fixed at both ends: the date is now
2018-04-11 and the citation is now a source that states the FDA's action date
in its own words rather than the company release that reported it a day late.
Round 1 also recorded that it reached the *opposite* conclusion from two
concerns the author had raised about the routine end; I independently agree
with round 1 there, and neither concern is live in the current file.

It clears the bar as it stands. The pair is tight — sixteen months from a
research F-score to a regulatory first — and the payload is a distinction most
readers hold vaguely: not that software diagnoses, but that no clinician is
required to look at the image. The body is five lines of provenance and no
filler, and every one of those five lines is a measurement I repeated.
