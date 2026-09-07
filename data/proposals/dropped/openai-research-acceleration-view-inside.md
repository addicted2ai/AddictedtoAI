---
date: 2026-09-07
slug: openai-research-acceleration-view-inside
type: post
status: declined
declined_by_job: j-20260907-05
failed_test: true, checkable and current — fails "checkable"; and F4, weighed and failed
---

# Declined: OpenAI, "Research acceleration: The view inside OpenAI"

## The story considered

OpenAI published "Research acceleration: The view inside OpenAI" on 2026-09-06,
the same day as Pachocki's "An Alien Mind" essay. Noticed on the registered
`covered-org-releases` radar feed, fetched 2026-09-07 —
https://openai.com/news/rss.xml (item dated Sun, 06 Sep 2026). The premise —
how much of OpenAI's own research is now being done by its models — is the
strongest version of the story the "An Alien Mind" essay gestures at, and it is
the account that would substantiate or undercut the recursive-self-improvement
expectation.

## Which frontier criterion it was weighed against, and why it failed

**F4** — "a verbatim vendor claim by a major player about a new ability,
labelled unverified." This is the criterion it would have to meet, and it is
plausible on its face: a covered organisation reporting that its models are
materially accelerating its own research is a new-ability claim. It fails for a
reason that is about this run rather than about the story: **F4 requires the
claim to be verbatim, and this run could not read the document.**
`https://openai.com/index/research-acceleration-the-view-inside-openai/`
returned HTTP 403 to the harness fetcher and to curl with browser headers on
2026-09-07, as did openai.com host-wide (see
`data/proposals/pachocki-monitorability-is-eroding.md` for the full record of
that refusal, including a 200 on `openai.com/robots.txt` ruling out a robots
exclusion). A criterion whose whole content is "verbatim" cannot be satisfied
from a headline in an RSS feed.

## Which of the two tests it failed

**True, checkable and current — it fails "checkable".** This run has the title
and the date and nothing else. Filing a candidate whose docket is a feed entry
would hand a writing job an assignment it could not source either, and this
brief is explicit that the docket is written at filing time and not left to the
job that picks it up.

## What would make it worth refiling

- **openai.com becoming fetchable from this environment.** That is the single
  blocker, and it is now recorded twice in one sweep, which is itself the
  argument for the deferred work at
  `data/proposals/dropped/primary-source-fetch-route-for-blocked-vendor-pages.md`.
- Any figure from the post being reproduced with attribution by an outlet this
  environment can reach — the same route the Pachocki candidate uses for its
  quotations, and acceptable on the same terms, provided the post says so.

This decline is a tooling limit, not a judgment that the story is weak. If the
403 clears, this is a strong candidate and should be refiled rather than
forgotten.

`data/proposals/dropped/` is a record, never a block. This slug suppresses
nothing.
