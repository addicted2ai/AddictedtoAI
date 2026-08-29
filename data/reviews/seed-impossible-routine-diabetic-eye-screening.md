---
job: seed-impossible-routine-diabetic-eye-screening
verdict: revise
reasons: [false-or-unsupported-claim]
would-cite: >-
  Someone arguing that medical AI still always has a doctor checking its work:
  this is the dated point at which a regulator permitted a machine to return a
  diagnosis in primary care with no clinician reading the image — provided the
  page carries the date the regulator acted rather than the date the vendor
  announced it.
reviewer: r1-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, end A a corporate research blog
reporting a JAMA paper, end B a company press release carried by BioSpace.
Sources fetched 2026-08-28.

- https://research.google/blog/deep-learning-for-detection-of-diabetic-eye-disease/:
  resolves, dated "November 29, 2016", matching the front matter. Carries the
  metric verbatim — "the algorithm has a F-score (combined sensitivity and
  specificity metric, with max=1) of 0.95" — against a median of 0.91 for the
  eight ophthalmologists on the validation set, and confirms the JAMA paper was
  "published today". The delta's careful phrasing "on par with the
  ophthalmologists it was measured against" is right and better than the
  shorthand this result usually gets: the comparison is to eight specific
  graders, not to the profession.
- https://www.biospace.com/fda-permits-marketing-of-idx-dr-for-automated-detection-of-diabetic-retinopathy-in-primary-care:
  resolves. It is IDx Inc.'s own PRNewswire release, dated April 12, 2018. It
  carries both routine-end claims verbatim: "IDx-DR is the first autonomous,
  AI-based diagnostic system authorized for commercialization by the FDA", and
  "As an autonomous, AI-based system, IDx-DR is unique in that it makes an
  assessment without the need for a clinician to also interpret the image or
  results."
- Confirmed the author's report that the FDA's own page is gone: I fetched
  https://www.fda.gov/news-events/press-announcements/fda-permits-marketing-artificial-intelligence-based-device-detect-certain-diabetes-related-eye
  today and received HTTP 404. Falling back to the company release was a
  reasonable response to that, not a shortcut.
- **DEFECT — the date belongs to the announcement, not to the act the end
  describes.** The end's `what` says "The FDA authorizes IDx-DR", dated
  2018-04-12. The FDA authorized it on **11 April 2018**. Verified two ways
  today, neither from memory: Jones Day's note states verbatim "On April 11,
  2018, the U.S. Food and Drug Administration ("FDA") permitted marketing of
  the first device to use artificial intelligence ("AI") autonomously to detect
  a medical condition"; and the University of Iowa College of Engineering page,
  itself dated "Thursday, April 12, 2018", says the FDA "issued the following
  statement in a press release yesterday". 12 April is the day IDx announced,
  which is the date of the source the delta cites.
- Fix: set the routine date to 2018-04-11, and cite something that states the
  FDA's action date. This is one day and no claim changes, but a delta is a
  dated pair whose only job is to be right about dates, and the `what` names
  the FDA as the actor.
- On the author's own flag, I reach the opposite conclusion, so recording the
  reasoning: the routine end is sound. The `what` says "authorizes" and
  "permitted", not "became ubiquitous", so it does not overclaim adoption, and
  a regulatory threshold is a *better* end-B marker than a usage statistic —
  it is a single dated event with a documentary record, where "ubiquity" has no
  date at all. The company-press-release sourcing is a genuine weakness, but
  every claim in it is corroborated by the third-party sources above. Neither
  concern the author raised is what should hold this piece; the date is.

Worth saving, and the fix is one day plus one citation. The payload is a
specific, checkable regulatory first that a daily AI-follower will have heard
of vaguely and cannot usually date or characterise precisely — the distinction
being not that software diagnoses, but that no clinician is required to look at
the image at all. Revise.
