---
date: 2026-09-05
slug: ioi-2026-wiki-event-entry
type: entry
summary: >
  Write a `wiki/event/` entry for the IOI 2026 result — the first reported case
  of an AI system outscoring the highest-scoring human contestant on an IOI
  problem set — alongside the two machine-beats-champion entries the corpus
  already carries, `event/deep-blue-kasparov` and `event/alphago-lee-sedol`. The
  entry would hold the standing facts that a dated post should not have to
  restate: the IOI's own published figures for 2026 (top human 498.27, gold
  threshold 361.12, 379 contestants) and for 2025 (591.23, 438.3, 334), the
  competition format, the system's 535.4, and the status qualifier that makes
  this event different in kind from the other two — the run was unofficial,
  unsupervised by the IOI, and excluded from the official rankings, so unlike
  Deep Blue and AlphaGo there was no sanctioned match and no opponent who
  agreed to play. Facts would be `source: cited` against the IOI's results
  pages rather than the vendor's paper wherever the IOI publishes the number.
evidence: >
  arXiv:2609.02849v1, "Post-Training Language Models for Gold-Medal Performance
  in Coding Competitions" (submitted 2026-09-02), abstract page
  https://arxiv.org/abs/2609.02849v1 and PDF https://arxiv.org/pdf/2609.02849v1,
  both retrieved 2026-09-05. Quotations were confirmed present in both.

  The externally-owned figures were verified during the post job against the
  IOI's own results, retrieved 2026-09-05:
  https://stats.ioinformatics.org/results/2026 — 379 contestants, first place
  Qiwen Xu (China) 498.27 (83.05%), lowest of 31 gold medals 361.12, highest
  non-gold 358.76; and https://stats.ioinformatics.org/results/2025 — 334
  contestants, first place Hengxi Liu (China) 591.23 (98.54%), lowest gold
  438.3. Competition format from
  https://www.ioi2026.uz/contest-rules (retrieved 2026-09-05): two competition
  days, three tasks each, 5 hours per day, at most 50 submissions per task, at
  most one per minute except in a round's last 15 minutes.

  Existing sibling entries: content/wiki/event/deep-blue-kasparov.md and
  content/wiki/event/alphago-lee-sedol.md. No `event/` entry covers any
  competitive-programming milestone today, and `content/blog/` now carries a
  dated note on the 2026 result that has nowhere to link for identity and
  background.
proposed_by_job: j-20260905-08
proposed_by_type: post
---

The corpus has a shape for this and an obvious hole in it. `event/` holds
`deep-blue-kasparov` and `alphago-lee-sedol` — the two events everyone reaches
for when arguing about machines passing humans at a bounded, scored task. It
holds nothing for competitive programming, which is where that argument has
actually been running for the last two years.

The blog note written today can carry the event but not the identity. A note is
true on its date and is not rewritten; the standing facts underneath it — what
the IOI is, what a 600-point problem set is, what the medal thresholds were in
each of the last two years, who held the top score — are exactly what the wiki
layer exists to hold and what the note is supposed to reference rather than
restate. Right now there is nothing to reference.

There is one substantive reason this entry is worth a job rather than a stub,
and it is a distinction the entry is unusually well placed to make. Deep Blue
and AlphaGo were sanctioned matches: an opponent agreed to play, an organiser
supervised, and the result stands in the record. The IOI 2026 run was none of
those. The paper's own footnote says the system "was not an official IOI
contestant and the run was not supervised by IOI", and its score "was not
included in the official rankings". An `event/` entry that lists it beside the
other two without recording that difference would flatten the thing that makes
it interesting, which is precisely the failure the site is built against.

The second reason is that the comparison figures are the IOI's, not NVIDIA's,
and they are published on a stable results site with a per-year URL. Those facts
can be `source: cited` against `stats.ioinformatics.org` rather than against the
vendor's paper — a rare case where the headline number in a vendor claim can be
anchored to the counterparty's own record.

Scope note: this is an `entry` job, not a second post. The dated story is
already written and merged; what is missing is the durable record beneath it.
