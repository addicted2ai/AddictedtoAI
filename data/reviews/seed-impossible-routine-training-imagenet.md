---
job: seed-impossible-routine-training-imagenet
verdict: approve
reasons: []
would-cite: >-
  Someone who checked the AlexNet PDF, failed to find the 18.9% top-5 error
  everyone quotes, and concluded the citation was fabricated — this delta shows
  the figure is real but belongs to the NeurIPS HTML landing page's older draft
  abstract, while the camera-ready PDF it links gives 15.3% and 26.2%.
reviewer: rr4b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29, confirmed by literal substring match against raw bytes on disk.

**How the PDF was read, so this is not "corrected" later.** I inflated the
FlateDecode streams and kept **only parenthesised string literals** — the
rendered text — never raw operators, which is the trap the brief names
(`/F318.9664Tf` matching a search for `18.9`). 31 streams, 30 inflated, 8,380
literals.

- papers.nips.cc `…c399862d3b9d6b76c8436e924a68c45b-Paper.pdf`: PRESENT verbatim
  — "a winning top-5 test error rate of 15.3%, compared to 26.2% achieved by the
  second-best entry"; "top-1 and top-5 error rates of 37.5% and 17.0%" for
  LSVRC-2010; "1.2 million high-resolution images". **ABSENT from the rendered
  text: "39.7%", "18.9%", "1.3 million".** The front matter's figures are the
  PDF's own.
- The paper reads "between five and six days to train on two GTX 580 3GB GPUs".
  The entry paraphrases "five to six days" and does not present it as a
  quotation; the metric "two consumer GPUs" is right for a GTX 580. Note the
  ligature: `fi` does not survive extraction, so "five" renders as " ve" — a
  naive literal search for "five to six days" returns a **false** absence.
- papers.nips.cc `…-Abstract.html` (8,974 b): the landing-page abstract reads
  "the 1.3 million high-resolution images … top-1 and top-5 error rates of
  `39.7\%` and `18.9\%`". **The percent signs are LaTeX-escaped**, so a literal
  search for `39.7%` returns ABSENT and would wrongly refute a true claim. The
  entry's second note is exactly right, on both halves.
- fast.ai/posts/2018-08-10-fastai-diu-imagenet.html: "train Imagenet to 93%
  accuracy in just 18 minutes, using 16 public AWS cloud instances" and "costs
  around $40 to run" — all PRESENT. The entry's **absence** claim earns itself:
  "top-5", "top 5" and "top-1" are each ABSENT from the post, so "without saying
  whether it means top-1 or top-5" is measured, not assumed.
- Delta schema: two dated, sourced ends; NIPS 2012 ran 3–8 December at Lake
  Tahoe, and the note discloses that it dates end A to the opening day.

Round 1 (r1-opus) found: the delta's 18.9% top-5 error contradicts the PDF it
cites — **fixed**, replaced by 15.3%/26.2% from the ILSVRC-2012 sentence, which
is the figure r1 prescribed and is verbatim in the cited document. Round 1's
second, smaller point — that neither end names top-1 or top-5 — **fixed**, and
better than prescribed: rather than asserting a metric the post never states,
the entry now says so and withdraws the comparison. I re-derived both findings
independently before reading the record and reached the same two.

The fix introduced nothing false: I re-verified every figure the revision added,
including the landing-page/PDF divergence, which is itself the most interesting
thing on the page. It clears the bar — a dated pair with a receipt at each end,
plus a genuine bibliographic trap that will catch the next reader who checks.
Approve.
