---
date: 2026-08-31
slug: un-gated-main-edits-bind-wholesale
type: machinery
summary: >
  A prose edit made directly on main by a non-job commit (a wave or a repair
  sweep) is invisible to the `reviewed:` hash backstop until some later job
  re-approves the whole file — and that later approval binds the un-scrutinised
  line wholesale. Measured on this very entry: the "tool-using HLE-Full —
  though not the plain one" wording entered main via the 2026-08-29 wave
  commit (9b229be), was bound without scrutiny by j-20260831-10's whole-file
  approval, and its only citation said neither half of it. It was caught only
  because a *second* direct edit (addictedtoai-7q8) happened to create a
  mismatch that triggered this re-review. The job: sweep git history for
  content-file prose edits whose commits are not job-branch merges, judge each
  against the current corpus, and report (or add a mechanism so that) a file
  whose bytes include an un-gated edit cannot bind wholesale at the next
  approval.
evidence: >
  `git log --follow -- content/wiki/model/moonshotai-kimi-k2-5.md` shows three
  direct-to-main prose commits beside the two job revisions: 7602fc8 (task
  6.1 authoring wave), 9b229be (2026-08-29 wave), a2807fb (addictedtoai-7q8
  repair sweep). 9b229be changed "topped the HLE-Full evaluation" to "topped
  the tool-using HLE-Full evaluation — though not the plain one —"; the cited
  siliconangle article (fetched 2026-08-31) says only "achieved the highest
  score on HLE-Full". j-20260831-10's record (data/reviews/j-20260831-10.md)
  then bound the whole file, tool-using sentence included, without re-checking
  it. lib/reviews.mjs can only report REVIEWED THEN CHANGED for edits made
  after a binding — an edit made before binding is approved by osmosis. Fixed
  in j-20260831-11 by citing the model card's table (50.2 with tools vs 30.1
  plain, Gemini 3 Pro 37.5 top).
---