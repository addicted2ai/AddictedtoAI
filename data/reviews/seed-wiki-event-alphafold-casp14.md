---
job: seed-wiki-event-alphafold-casp14
verdict: revise
reasons:
  - false-or-unsupported-claim
would-cite: >-
  Someone disputing whether AlphaFold2's CASP14 result was an ordinary
  benchmark improvement — this entry reproduces the official summed-Z-score
  table where the gap between first and second place is larger than second
  place's entire score.
reviewer: r3-opus
date: 2026-08-28
---

Checklist: wiki entry (event). Sources fetched 2026-08-28.

- predictioncenter.org/casp14/zscores_final.cgi: resolves and is live. The
  official table gives group 427 AlphaFold2 at 244.0217; group 473 BAKER at
  90.8241; group 403 BAKER-experimental at 88.9672; group 480 FEIG-R2 at
  72.5351. The entry's 244.0 / 90.8 / 89.0 / 72.5 are correct roundings, and
  "Second place, the Baker laboratory" is right. The arithmetic claim that
  the first-to-second gap (153.2) exceeds second place's whole score (90.8)
  holds.
- pmc.ncbi.nlm.nih.gov/articles/PMC8371605/: resolves to Jumper et al.,
  Nature 596 (7873), 583-589, published 15 July 2021 — citation and date
  both as the entry states. The accuracy sentence is verbatim: "AlphaFold
  structures had a median backbone accuracy of 0.96 Å r.m.s.d.95 (95%
  confidence interval = 0.85-1.16 Å) whereas the next best performing method
  had a median backbone accuracy of 2.8 Å r.m.s.d.95". The entry's ellipsis
  elides only the confidence interval, which is legitimate.
- deepmind.google/.../alphafold-a-solution-to-a-50-year-old-grand-challenge-
  in-biology/: resolves. Verified: median 92.4 GDT across all targets;
  Moult's "a score of around 90 GDT is informally considered to be
  competitive with results obtained from experimental methods"; Moult's "We
  have been stuck on this one problem - how do proteins fold up - for nearly
  50 years..."; "recognised as a solution to this grand challenge by the
  organisers"; and the 30 November 2020 announcement date.
- **Defect — a quotation that is not verbatim.** The entry writes that
  DeepMind's announcement described the error "at an average of about 1.6
  angstroms across targets, as 'comparable to atomic width.'" I asked the
  page for that sentence exactly. It reads: "This means that our predictions
  have an average error (RMSD) of approximately 1.6 Angstroms, which is
  comparable to the width of an atom (or 0.1 of a nanometer)." The source
  says "comparable to the width of an atom"; "comparable to atomic width" is
  a paraphrase presented inside quotation marks. The 1.6 Å figure itself is
  correct. Fix: quote the real phrase, or drop the quotation marks.
- deepmind.google/.../demis-hassabis-john-jumper-awarded-nobel-prize-in-
  chemistry/: resolves. Verbatim: "have given more than 2 million scientists
  and researchers from 190 countries a powerful tool for making new
  discoveries", and 9 October 2024 as the announcement date, both matching.
- Not independently verified: the halves of the Nobel split (Baker one half,
  Hassabis and Jumper the other) are correct as a matter of record but are
  not stated on the DeepMind page the entry cites — that page only confirms
  the three shared it. Also uncited in this file: Levinthal 1969, which the
  entry uses for the "fifty-year-old promissory note" framing where the
  DeepMind page reaches for Anfinsen instead. Both are low-risk background,
  not load-bearing numbers.

One fix, one line long. Everything else here verified exactly, including a
four-way crosstable and a Nature sentence to the decimal — this is careful
work, and the "a contest a machine ended" framing is earned by the numbers
rather than asserted over them.

It fails only on quotation fidelity, which is the one thing a wiki built on
primary documents cannot be loose about, and which I flagged consistently
across this slice. Revise.
