---
job: seed-impossible-routine-professional-level-go
verdict: approve
reasons: []
would-cite: >-
  Someone arguing that a breakthrough capability stays locked inside the lab
  that first reached it: the Nature paper's own "at least a decade away" sits
  27 months from a BSD-licensed download that beat four top-30 professionals
  14-0 on a single GPU.
reviewer: r1-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, end A a Nature paper, end B a corporate
research blog announcing an open-source release. Sources fetched 2026-08-28.

- https://www.nature.com/articles/nature16961: **does not resolve for an
  unauthenticated reader today.** It returns HTTP 303 to
  `idp.nature.com/authorize`. Recording this plainly: the cited URL is a real
  and correct identifier for the paper, but a reader clicking it from the
  delta will land on an authorization redirect rather than the abstract. The
  site spec requires every end to carry "a reachable source"; this one is
  reachable in the sense that the article exists at that DOI, but not in the
  sense that its text is visible. A fixer could point at the DOI or add a
  freely readable mirror without changing any claim.
- Because of that, I verified end A's wording from the paper's PubMed record,
  PMID 26819042, which carries the abstract verbatim: "defeated the human
  European Go champion by 5 games to 0. This is the first time that a computer
  program has defeated a human professional player in the full-sized game of
  Go, a feat previously thought to be at least a decade away." Both halves of
  the delta's end A are the paper's own sentences — the 5-0, and the "at least
  a decade away", which the piece correctly attributes to the paper rather than
  asserting in its own voice. The metric's "first program to beat a
  professional at full-size Go" is likewise the abstract's claim.
- Date: the front matter says 2016-01-27. Semantic Scholar's record for DOI
  10.1038/nature16961 gives publicationDate "2016-01-27"; PubMed shows the 28
  January print issue. The front matter uses the online publication date, which
  is the earlier and more defensible of the two.
- https://research.facebook.com/blog/2018/05/facebook-open-sources-elf-opengo/:
  resolves, dated "May 2, 2018", matching the front matter. All four routine-end
  claims verified: "achieved a 14 win, 0 loss record against four of the top 30
  world-ranked human Go players", the code and model are "available under the
  BSD license", and "These games were all played using a single GPU making
  moves every 50 seconds". The delta's "playing on a single GPU" is the source's
  own condition, and the 50-seconds-per-move detail it omits does not soften it.
- Convention worth knowing, not a defect: end A's date is the paper's
  publication, while its `what` describes the Fan Hui match, played in October
  2015. Every delta in this slice dates an end to when the result entered the
  public record rather than when the underlying event happened, and the two
  ends are dated on the same convention, so the span is not distorted by it.

Clears the bar. The payload is the pairing itself: the specific sentence in
which the field's own flagship paper estimated a decade, set against a date 27
months later when the capability was a free download running on one GPU. An
enthusiast knows both facts separately; the dated adjacency, with the "decade
away" quotation traceable to the paper rather than to retellings, is the thing
this page adds. Approve.
