---
job: seed-imagenet-2012
verdict: approve
reasons: []
would-cite: >-
  A person arguing the 2012 result was a regime change rather than a narrow
  win — the entry reproduces the official table's ten-point gap and the
  extra-training-data footnote that retellings drop, straight from
  image-net.org's still-live scoreboard.
reviewer: seed-review-6.5
date: 2026-08-28
---

Checklist: wiki entry. Sources fetched 2026-08-28.

- image-net.org/challenges/LSVRC/2012/results.html: confirmed live and
  matches every number claimed. SuperVision (University of Toronto;
  Krizhevsky, Sutskever, Hinton) tops classification at 0.15315 annotated
  "Using extra training data from ImageNet Fall 2011 release" and 0.16422
  with "only supplied training data". Following entries verified in order:
  ISI 0.26172, 0.26602, 0.26646, 0.26952; OXFORD_VGG 0.26979; XRCE/INRIA
  0.27058; OXFORD_VGG 0.27079 and 0.27302. Localization: SuperVision
  0.335463 and 0.341905, next OXFORD_VGG 0.500342. The "two regimes on one
  page" reading is the table as published, not embellishment.
- computerhistory.org press release: dated March 20, 2025; contains verbatim
  "a Google team led by David Bieber worked with CHM for five years to
  secure its release to the public" and "on a computer with two NVIDIA
  cards"; partnership with Google confirmed in the opening.
- papers.nips.cc AlexNet PDF: abstract reads "60 million parameters ...
  five convolutional layers, some of which are followed by max-pooling
  layers, and two globally connected layers with a final 1000-way softmax" —
  the entry's architecture sentence and parameter fact match the cited copy.
- Closing comparison checked by arithmetic: five years of negotiation
  (per CHM) vs contest (Oct 2012 results) to transformer paper (Jun 2017),
  about 4.7 years — "longer than" holds.
- Aliases sanely classed: "AlexNet" as manual (names the model, entry is the
  event) and "SuperVision" as shared are the conservative right calls.
- No volatile literals; facts static; status dead / maintenance dormant fits
  a concluded contest.

The two details the piece is built on (the team name, the two-entry
asterisk) are real, checked, and genuinely absent from most retellings.
Approve.

## Recheck 2026-08-29 (addictedtoai-flh) — one superlative corrected

**Corrected: "Every serious non-neural system in the world that year finished
within about one percentage point of every other one" → "The eight best
non-neural submissions finished within 1.2 percentage points of each
other".**

Round one verified every number the entry prints and stopped there. It did
not read *past* the rows the entry enumerates, and that is where the
superlative fails. Fetched
https://www.image-net.org/challenges/LSVRC/2012/results.html (22,545 bytes)
and read the whole Task 1 table rather than the top of it. Below the eight
entries the piece lists, the same table continues:

    University of Amsterdam | final-UvA-lsvoc2012test.results.val | 0.29576
    XRCE/INRIA              | res_64k_svm.txt                     | 0.33419
    LEAR-XRCE               | submit_i12_d0512_mix.txt            | 0.34464
    LEAR-XRCE               | submit_i12_d0512_k1.txt             | 0.36184
    LEAR-XRCE               | submit_i10_d0512_mix.txt            | 0.38006
    LEAR-XRCE               | submit_i10_d0512_k1.txt             | 0.41048

Fifteen non-SuperVision classification submissions, not eight. They span
0.26172 to 0.41048 — 14.9 percentage points, not "about one". The nearest
one the entry omitted, University of Amsterdam at 0.29576, is 2.3 points
below the band it claimed was universal. "Every ... in the world" was the
kind of claim a table can refute and this one does.

The replacement is measured, not merely hedged: 0.27302 − 0.26172 = 0.0113,
so "within 1.2 percentage points" is a bound the table supports, and
counting the enumerated rows (ISI ×4, OXFORD_VGG, XRCE/INRIA, OXFORD_VGG ×2)
gives eight. The argument the sentence serves is untouched — the gap to the
winner is still there and still the point.

**Everything else in the entry holds, re-matched literally against the same
22,545 bytes:** SuperVision 0.15315 with "Using extra training data from
ImageNet Fall 2011 release" and 0.16422 with "Using only supplied training
data"; ISI 0.26172 / 0.26602 / 0.26646 / 0.26952; OXFORD_VGG 0.26979;
XRCE/INRIA 0.27058; OXFORD_VGG 0.27079 and 0.27302 — all present, all in the
order the entry gives them. Localization: SuperVision 0.335463 and 0.341905,
next OXFORD_VGG 0.500342. "Krizhevsky, Sutskever, Hinton / University of
Toronto" is on the abstracts section of the same page. The gap arithmetic
survives the like-for-like reading: 0.26172 − 0.16422 = 9.75 points, and
10.86 against the extra-data number, so "a gap of ten points" is fair either
way.

- computerhistory.org press release (87,747 bytes): "March 20, 2025" in the
  dateline, "In partnership with Google", "a Google team led by David Bieber
  worked with CHM for five years to secure its release to the public", and
  "on a computer with two NVIDIA cards" — all verbatim. The closing
  comparison rechecked: five years of negotiation against Oct 2012 → 12 June
  2017 (≈4.7 years) to the transformer paper, so "longer than" holds; and
  contest to 20 March 2025 is 12.4 years, so "another twelve years" holds.

**Also corrected: "two fully connected layers, a thousand-way softmax" →
"three fully connected layers ending in a thousand-way softmax".**

Round one recorded this quote as coming from "papers.nips.cc AlexNet PDF".
It does not. Downloaded the cited PDF
(papers.nips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf,
1,418,820 bytes), inflated its 30 FlateDecode streams and extracted only the
parenthesised text literals (696,244 characters). The camera-ready abstract
reads:

> The neural network, which has 60 million parameters and 650,000 neurons,
> consists of five convolutional layers, some of which are followed by
> max-pooling layers, and **three fully-connected layers** with a final
> 1000-way softmax.

The "two globally connected layers" wording round one quoted is real, but it
is on a *different document* — the papers.nips.cc landing page (8,974
bytes), which carries the superseded submitted abstract. The two versions
disagree on more than the layer count: the landing page says "500,000
neurons" and "39.7\% and 18.9\%", the PDF says "650,000 neurons" and "37.5%
and 17.0%". Since the entry's `parameters` fact and the body sentence both
cite the PDF, the body now matches the PDF.

Not a factual error about AlexNet either way — 5 conv + fc6 + fc7 + fc8 is
three FC layers, and the old abstract's phrasing counted the 1000-way output
separately — but it was a claim attributed to a document that says something
else, which is the exact failure mode this pass exists to find.

Two traps worth recording for later passes on this PDF. **Ligatures:** `fi`
drops in extraction, so "five" comes out as `\002ve` and "final" as
`\002nal`; searching for "five convolutional" returns a false absence.
**LaTeX escaping on the landing page:** its error rates appear as `39.7\%`
and `18.9\%`, so a search for "39.7%" fails there too.
