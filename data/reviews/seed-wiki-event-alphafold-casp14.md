---
job: seed-wiki-event-alphafold-casp14
verdict: approve
reasons: []
would-cite: >-
  Someone arguing CASP14 was a leaderboard win rather than a scientific one: the
  Nature methods paper's own sentence, quoted here in experimental units, puts
  AlphaFold at 0.96 Å median backbone r.m.s.d. against 2.8 Å for the next best
  method, and the exam's own founders declared their grand challenge met.
reviewer: rr2b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29, confirmed by literal substring match against fetched bytes.

- deepmind.google/.../alphafold-a-solution-to-a-50-year-old-grand-challenge-in-biology/:
  verbatim "achieves a median score of 92.4 GDT overall across all targets";
  "has been recognised as a solution to this grand challenge by the organisers";
  Moult's "a score of around 90 GDT is informally considered to be competitive
  with results obtained from experimental methods"; "approximately 1.6
  Angstroms, which is comparable to the width of an atom"; "We have been stuck
  on this one problem - how do proteins fold up - for nearly 50 years" ... "is a
  very special moment", where the entry's ellipsis elides exactly the clause it
  appears to elide. Also verbatim: "In 1994, Professor John Moult and Professor
  Krzysztof Fidelis founded CASP as a biennial blind assessment", which is what
  licenses both "every two years since 1994" and Moult's "twenty-six years"; and
  "In 1969 Cyrus Levinthal noted that it would take longer than the age of the
  known universe to enumerate all possible configurations".
- The 30 November 2020 date is not in that page's visible prose — it says
  "released today" — but the page carries
  `<meta property=article:published_time content=2020-11-30T00:00:00+00:00>`.
  Verified in raw bytes. The timeline date is sourced, via the source's own
  metadata; a later pass should not strike it as unsupported.
- https://predictioncenter.org/casp14/zscores_final.cgi: row 1 "427 AlphaFold2
  92 244.0217 1", row 2 "473 BAKER 92 90.8241 2", row 3 "403 BAKER-experimental
  92 88.9672", row 4 "480 FEIG-R2 92 72.5351". The entry's 244.0 / 90.8 / 89.0 /
  72.5 are correct to one decimal (89.0 rounds 88.9672), group 427 and
  "AlphaFold2" are the table's own labels, and the arithmetic claim holds:
  244.0 - 90.8 = 153.2, larger than 90.8.
- https://pmc.ncbi.nlm.nih.gov/articles/PMC8371605/: verbatim "AlphaFold
  structures had a median backbone accuracy of 0.96 Å r.m.s.d.95 (Cα
  root-mean-square deviation at 95% residue coverage) (95% confidence interval =
  0.85–1.16 Å) whereas the next best performing method had a median backbone
  accuracy of 2.8 Å r.m.s.d.95". The quotation and its ellipsis are both
  faithful. Citation line reads "Nature. 2021 Jul 15;596(7873):583-589".
- deepmind.google/.../demis-hassabis-john-jumper-awarded-nobel-prize-in-chemistry/:
  verbatim "have given more than 2 million scientists and researchers from 190
  countries a powerful tool for making new discoveries". Date confirmed twice —
  visible as "October 9, 2024" and in `article:published_time` as 2024-10-09.
  Method note: my first needle, "October 2024", returned absent, because the page
  writes "October 9, 2024". A mis-chosen needle, not an absent fact. Do not
  "correct" this date out on a later pass.

Round 1 (r3-opus) found: one defect — the entry put "comparable to atomic width"
inside quotation marks where the source says "comparable to the width of an
atom" — **fixed**, and I confirmed the corrected phrase is now verbatim in both
the entry and the source. Nothing new was introduced by the fix.

Two round-one observations to correct for the record. First, r3-opus listed
Levinthal 1969 as "uncited in this file", saying the DeepMind page "reaches for
Anfinsen instead": that page in fact discusses Levinthal at length, by name, with
the 1969 date and the 10^300 estimate, so the framing is carried by a source the
entry already cites. Second, r3-opus's transcription of the Nature sentence
omitted the "(Ca root-mean-square deviation at 95% residue coverage)"
parenthetical and described the ellipsis as eliding only the confidence
interval; the conclusion was right, the transcription slightly short.

Residual, not disqualifying: the half / other-half split of the 2024 chemistry
prize is not stated by the cited DeepMind page, which says only that Baker was
"co-awarded". The claim is true — I fetched nobelprize.org/prizes/chemistry/2024/summary/
and matched verbatim "was divided, one half awarded to David Baker ... the other
half jointly to Demis Hassabis and John Jumper" — it is simply carried by a page
this entry does not cite. Note also that Nobel's citation reads "for protein
structure prediction" where the entry writes "for AlphaFold", which is DeepMind's
framing. Separately, "the same shape as the 2012 ImageNet results table" is an
unsourced analogy; it holds, but nothing on the page supports it.

It clears the bar as it now stands. Every load-bearing number and quotation
survives byte-level checking, including a four-way official crosstable and a
Nature sentence to two decimals, and the argument the page is actually for —
that this was a standing institution with a fixed definition of victory whose
own founders declared it met — is built out of those numbers rather than laid
over them.
