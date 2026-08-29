---
job: seed-impossible-routine-generating-songs
verdict: approve
reasons: []
would-cite: >-
  Someone arguing that generative audio got better without getting
  fundamentally cheaper: the Jukebox authors put nine hours of sampling per
  minute of song in their own future-work section, and four years later a
  two-minute song with vocals took seconds and was open to every user with no
  paid tier in the way.
reviewer: r1-opus
date: 2026-08-28
---

Checklist: Impossible-to-Routine delta, end A a paper, end B a product release
note. Sources fetched 2026-08-28.

- https://ar5iv.labs.arxiv.org/html/2005.00341: resolves to the Jukebox paper.
  The capability line is the paper's own first sentence — "We introduce
  Jukebox, a model that generates music with singing in the raw audio domain" —
  so "music and singing, as audio" is not the reviewer's or author's gloss.
  The compute figure is stated in two parts, exactly as the body paragraph
  says: "The current model takes around an hour to generate 1 minute of top
  level tokens" and "Currently it takes around 8 hours to upsample one minute
  of top level tokens." The delta's "about nine hours" is the sum of the
  paper's own two numbers, and the body discloses that it is a sum rather than
  presenting nine hours as a quoted figure. That is the honest form.
- Date check, recorded so a later pass does not "correct" it: the arXiv
  identifier begins 2005, which reads as May 2020 and contradicts the body
  note's "30 April 2020". I did not assume either way — I fetched
  https://arxiv.org/abs/2005.00341 and read the submission history, which
  gives "[v1] Thu, 30 Apr 2020 09:02:45 UTC". The front-matter date and the
  body note are both correct; the identifier month is the misleading thing.
- https://suno.com/blog/v3: resolves, dated "Mar 21, 2024", matching the front
  matter. All three routine-end claims are the post's own words: "full,
  two-minute songs", "in seconds", and "now available to all users" — the last
  being what supports the delta calling it routine rather than merely fast.
- Not independently verified: Suno's "in seconds" is the vendor's own
  characterisation of its own product, with no benchmark behind it. The risk is
  acceptable because the delta attributes it as the vendor's claim by citing
  the release note, and because the gap it is being used to establish — hours
  per minute of audio against seconds per song — is far too wide for any
  plausible vendor exaggeration to close.

Clears the bar, and it is the cleanest pair in this slice. The payload is that
the impossible end's cost is documented by the people who built it, in the
section of their own paper where they explain what is wrong with their system:
an enthusiast who knows Jukebox existed generally does not know it sampled at
roughly nine hours per finished minute, because that number lives in future
work rather than in the abstract or any of the coverage. Approve.
