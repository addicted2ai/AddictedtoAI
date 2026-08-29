---
job: seed-protein-structure-prediction
verdict: approve
reasons: []
would-cite: "The strongest AI-for-science citation available anywhere: CASP's own co-founder calling the problem stuck for nearly fifty years, and 200 million predicted structures free to bulk-download twenty months later."
reviewer: task-6.5 seed reviewer (fresh context, no edit rights)
date: 2026-08-28
---

Checked both ends by fetching.

- End A: fetched the DeepMind CASP14 post; publication date November 30,
  2020 matches. Observed verbatim: "our latest AlphaFold system achieves a
  median score of 92.4 GDT overall across all targets" — the metric is
  exact. The "assessors had called a 50-year grand challenge" claim is
  supported by the post quoting Professor John Moult, co-founder of CASP:
  "We have been stuck on this one problem – how do proteins fold up – for
  nearly 50 years." The attribution to the assessors, not the vendor, is
  what makes the impossible end solid, and it holds.
- End B: fetched the July 28, 2022 DeepMind post; date matches. Observed
  verbatim: "All 200+ million structures will also be available for bulk
  download via Google Cloud Public Datasets," with the resources described
  as open and free — supporting "over 200 million proteins ... free to
  search and to bulk-download" and the "200 million structures, no cost"
  metric.

Noted, not blocking: both ends cite the same organization's blog. The
end-B claim (free search and bulk download) is independently checkable by
anyone at the database itself, so the sourcing carries.

Quality: the largest real-world consequence of any delta in the set, with a
genuine third-party impossibility framing. Top three on the surface.

## Recheck 2026-08-29 (addictedtoai-flh) — holds, no change

Both ends re-fetched to disk and matched literally. Note both URLs now
redirect from `/discover/blog/` to `/blog/`; same content, 200 on both.

- End A, DeepMind CASP14 post (173,778 bytes): "our latest AlphaFold system
  achieves a median score of 92.4 GDT overall across all targets" verbatim,
  so the 92.4 metric is exact. The impossibility framing is third-party and
  attributed on the page: "We have been stuck on this one problem - how do
  proteins fold up - for nearly 50 years", credited to "Professor John Moult
  / Co-founder and Chair of CASP, University of Maryland". This is the load-
  bearing part of the delta — it is the assessors' characterisation, not the
  vendor's — and it holds.
- Date checked a second way because the rendered page's format is not the
  front matter's: the article's own metadata carries
  `article:published_time` = `2020-11-30T00:00:00+00:00` and the visible
  byline reads "November 30, 2020". The literal "30 November 2020" is absent
  from the page; that is a format variant, not a missing date.
- End B, DeepMind protein-universe post (167,658 bytes): "All 200+ million
  structures will also be available for bulk download via Google Cloud
  Public Datasets"; "expand the AlphaFold DB by over 200x - from nearly 1
  million structures to over 200 million structures"; and the database
  described as created "to freely share this scientific knowledge with the
  world". `article:published_time` = `2022-07-28T00:00:00+00:00`, byline
  "July 28, 2022" — front-matter date exact.

Round one's noted-not-blocking point stands and is worth keeping: both ends
cite the same organisation's blog. The mitigation it named is real — the
end-B claim is checkable at the database itself — and the end-A
impossibility claim is a quoted third party rather than the vendor's own
voice, which is the half that mattered.

No claim in this delta required correction.
