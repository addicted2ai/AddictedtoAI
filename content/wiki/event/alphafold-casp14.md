---
id: event/alphafold-casp14
kind: event
display_name: "AlphaFold at CASP14"
status: dead
maintenance: dormant
themes:
  - history
aliases:
  - name: "AlphaFold at CASP14"
    class: exclusive
  - name: "CASP14"
    class: shared
  - name: "AlphaFold 2"
    class: shared
  - name: "AlphaFold"
    class: manual
facts:
  - field: median_gdt
    source: cited
    value: "92.4 across all targets"
    source_url: "https://deepmind.google/discover/blog/alphafold-a-solution-to-a-50-year-old-grand-challenge-in-biology/"
    accessed: "2026-08-28"
    volatility: static
  - field: summed_zscore_margin
    source: cited
    value: "244.0 for AlphaFold2 (group 427) against 90.8 for the second-placed group"
    source_url: "https://predictioncenter.org/casp14/zscores_final.cgi"
    accessed: "2026-08-28"
    volatility: static
  - field: backbone_accuracy
    source: cited
    value: "median 0.96 angstrom r.m.s.d., against 2.8 for the next best method"
    source_url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8371605/"
    accessed: "2026-08-28"
    volatility: static
  - field: nature_citation
    source: cited
    value: "Jumper et al., Nature 596 (7873), 583-589"
    source_url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8371605/"
    accessed: "2026-08-28"
    volatility: static
timeline:
  - date: "2020-11-30"
    event: "CASP14 results are announced; the organisers recognise AlphaFold as a solution to the structure-prediction grand challenge"
    source_url: "https://deepmind.google/discover/blog/alphafold-a-solution-to-a-50-year-old-grand-challenge-in-biology/"
  - date: "2021-07-15"
    event: "the methods paper is published in Nature"
    source_url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8371605/"
  - date: "2024-10-09"
    event: "Demis Hassabis and John Jumper share the Nobel Prize in Chemistry for AlphaFold, alongside David Baker for computational protein design"
    source_url: "https://deepmind.google/discover/blog/demis-hassabis-john-jumper-awarded-nobel-prize-in-chemistry/"
mentions:
  - org/google-deepmind
---

CASP is a blind exam. Every two years since 1994, the organisers of the
Critical Assessment of protein Structure Prediction have collected protein
structures that experimentalists have solved but not yet published, handed
the bare amino-acid sequences to every research group that enters, and
scored the predicted three-dimensional structures against the withheld
answers. It exists because the field had a fifty-year-old promissory note
to service: if a protein's sequence determines its structure, prediction
should be possible; Cyrus Levinthal had pointed out in 1969 that blind
enumeration of foldings could never be the mechanism.

On 30 November 2020, the fourteenth CASP announced its results, and
DeepMind's entry — AlphaFold, entered as group 427, "AlphaFold2" — was
"recognised as a solution to this grand challenge by the organisers." The
number carrying that sentence: a median of 92.4 across all targets on the
GDT scale, where, per CASP co-founder John Moult, "a score of around 90
GDT is informally considered to be competitive with results obtained from
experimental methods." Moult, who had been running the exam for
twenty-six years: "We have been stuck on this one problem – how do
proteins fold up – for nearly 50 years. To see DeepMind produce a
solution for this ... is a very special moment."

The official ranking table shows what kind of win it was. CASP ranks
groups by summed Z-scores across targets; AlphaFold2 finished on 244.0.
Second place, the Baker laboratory, finished on 90.8; third on 89.0;
fourth on 72.5. The gap between first and second place was larger than
second place's entire score — the same shape as the 2012 ImageNet
results table, two regimes printed on one page.

The methods paper, published in Nature on 15 July 2021 (Jumper et al.,
*Nature* 596, 583–589), states the accuracy in experimental units: on
CASP14 domains, "AlphaFold structures had a median backbone accuracy of
0.96 Å r.m.s.d.95 ... whereas the next best performing method had a median
backbone accuracy of 2.8 Å r.m.s.d.95" — an error DeepMind's announcement
had described, at an average of about 1.6 angstroms across targets, as
"comparable to atomic width." Structures the system had never seen,
predicted from sequence alone, to within roughly an atom.

What makes this event different from a benchmark being beaten is that the
benchmark was a standing scientific institution with a fixed definition of
victory, set by the field itself before deep learning existed, administered
blind — and its own founders declared it met. Machines had won contests
against people before. This was a contest a machine ended.

The institutional world then did something slower and stranger than the
result itself. On 9 October 2024 the Nobel Prize in Chemistry went half to
Demis Hassabis and John Jumper for AlphaFold — a chemistry prize for a
computation — with the other half to David Baker for computational protein
design. By DeepMind's accounting at the time, the AlphaFold Protein
Structure Database had "given more than 2 million scientists and
researchers from 190 countries" its predictions to work from. The exam had
outlived the question it was founded to keep honest.
