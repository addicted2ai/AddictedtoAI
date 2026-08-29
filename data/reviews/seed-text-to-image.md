---
job: seed-text-to-image
verdict: approve
reasons: []
would-cite: "For the how-fast-did-generative-AI-actually-move argument: eighteen months separate the closed lab paper from weights running in 6.9 GB of VRAM on a home graphics card, each end dated by its own source."
reviewer: task-6.5 seed reviewer (fresh context, no edit rights)
date: 2026-08-28
---

Checked both ends by fetching.

- End A: fetched https://arxiv.org/abs/2102.12092. Submission history shows
  "[v1] Wed, 24 Feb 2021" — front-matter date exact. The paper is "Zero-Shot
  Text-to-Image Generation," describing "a transformer that autoregressively
  models the text and image tokens as a single stream of data" — the delta's
  sentence ("a transformer trained to generate images from text captions")
  is supported, and the page mentions no model or weights release, which is
  what makes it the closed end.
- End B: fetched the Stability AI public-release post (August 22, 2022,
  matching). It announces the weights, model card, and code publicly on
  Hugging Face, and states verbatim: "The final memory usage on the release
  of the model should be 6.9 Gb of VRAM" — the delta's oddly specific
  metric turns out to be an exact quote, which is the right kind of odd.

On the author's self-assessment: it calls this impossible end "close to the
weak form," and that is fair — nobody in the source says text-to-image
cannot be done; the paper itself is the doing. But the spec's end A
explicitly admits "the date it was a research result," and this is that
form: the dated proof the capability existed only inside a lab, against
weights on a consumer GPU eighteen months later. The lived experience of
that flip is one of the most widely felt in the field. Approve, mid-pack.

## Recheck 2026-08-29 (wave addictedtoai-flh) — approve stands

Re-examined because this delta was approved in the earlier seed round, which
the 2026-08-29 seed wave never revisited. Both ends re-fetched.

- End A, `arxiv.org/abs/2102.12092` (41,371 bytes, HTTP 200) — submission
  history carries "**[v1] Wed, 24 Feb 2021**", matching the front-matter date
  exactly. Title "**Zero-Shot Text-to-Image Generation**" and the abstract's
  "a transformer that **autoregressively models the text and image tokens as a
  single stream of data**", both raw. The delta's "a transformer trained to
  generate images from text captions" is supported, and the page still
  announces no weights and no model release, which is what makes it the closed
  end.
- End B, the Stability AI public-release post (476,189 bytes, HTTP 200) —
  `itemprop="datePublished" content="2022-08-22T18:06:20+0000"`, matching the
  front-matter date; the page's rendered date is written by script from that
  meta tag, so the metadata is the right thing to read. Body carries verbatim
  "**You can find the weights, model card, and code here**" (supporting
  "weights are published for anyone to download") and "**The final memory
  usage on the release of the model should be 6.9 Gb of VRAM**" — the metric
  is an exact quote, and the surrounding paragraph's "Currently, NVIDIA chips
  are recommended" is what anchors "one consumer graphics card".

Nothing changed.
