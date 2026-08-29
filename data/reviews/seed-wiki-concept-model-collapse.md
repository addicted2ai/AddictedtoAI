---
job: seed-wiki-concept-model-collapse
verdict: approve
reasons: []
would-cite: >-
  Someone claiming the Nature model-collapse result predicts that a web filling
  with generated text must degrade the models trained on it: this entry shows
  the demonstration replaced its data every generation, and that the fourteen
  authors who tested the accumulating case instead proved a finite test-error
  bound independent of iteration count.
reviewer: rr1b
date: 2026-08-29
---

Round 2, sealed. Findings written before opening round 1. Sources fetched
2026-08-29, every quotation confirmed by literal substring match against the
fetched bytes. Every quoted string in this entry is exact.

- https://arxiv.org/abs/2305.17493: the definition fact is present verbatim —
  "use of model-generated content in training causes irreversible defects in
  the resulting models, where tails of the original content distribution
  disappear". Dateline `[Submitted on 27 May 2023`, matching the timeline.
  Six `citation_author` tags, first `Shumailov, Ilia` — "Ilia Shumailov and
  colleagues" is right.
- https://api.crossref.org/works/10.1038/s41586-024-07566-y: `container-title`
  Nature, `volume` 631, `issue` 8022, `page` 755-759, `published` and
  `published-online` both 2024-07-24. Every field of the journal_publication
  fact is exact. (`published-print` is 2024-07-25; the fact says "published
  24 July 2024", which is the online date and the one the prose uses.)
- https://arxiv.org/abs/2404.01413: both quotations verbatim — "largely
  assumed that new data replace old data over time, where an arguably more
  realistic assumption is that data accumulate over time" and "accumulating
  the successive generations of synthetic data alongside the original real
  data avoids model collapse". Also verbatim: "we extend this argument to
  prove that if data instead accumulate, the test error has a finite upper
  bound independent of the number of iterations", and "diffusion models for
  molecule conformation generation and variational autoencoders for image
  generation". Dateline `[Submitted on 1 Apr 2024`. **Fourteen**
  `citation_author` tags, so "Matthias Gerstgrasser and thirteen co-authors"
  is exact rather than approximate.
- https://arxiv.org/html/2305.17493v3 (the full paper, for the two claims the
  abstract cannot support): "We fine-tune the model on the wikitext2 dataset.
  For data generation from the trained models we use a 5-way beam-search" and
  "produce an artificial dataset of the same size" — the experiment_setup fact
  verbatim. Both arms named exactly as the entry describes them: "5 epochs, no
  original training data" and "10% of original training data preserved – ...
  every new generation of training, a random 10% of the original data points
  are sampled". "one keeps a random tenth of it each generation" is the
  source's own construction.
- Same file, the example figure, checked generation by generation because the
  generation labels are the one thing here that can silently drift: Input ends
  "...early examples of Perpendicular"; `Gen 0:` "Revival architecture such as
  St. John's Cathedral in London"; `Gen 1:` "architecture such as St. Peter's
  Basilica in Rome or St. Peter's Basilica in Buenos Aires. There is no
  evidence that any of these buildings were built during the reign of Pope
  Innocent III"; `Gen 9:` "black @-@ tailed jackrabbits, white @-@ tailed
  jackrabbits, blue @-@ tailed jackrabbits, red @-@ tailed jackrabbits,
  yellow @-". Recording the method so a later pass does not "correct" a
  correct quotation: the entry renders `@-@` as a plain hyphen, which is the
  standard reading of wikitext2's tokenisation artefact, not a misquotation.

Round 1 (r4-fable) found: the jackrabbit enumeration was attributed to
generation 7 when it is generation 9's output, generation 7 being the "In an
interview with The New York Times" passage — **fixed**, and I re-found the
same generation labels independently before opening that record, from a fetch
of the paper rather than from the prior finding. Nothing else was flagged and
nothing new has appeared: the fix touched one numeral and introduced no claim.

It clears the bar comfortably and is the strongest piece in my slice. The
payload is a correction rather than a summary — the load-bearing assumption is
*replacement*, and it is the accumulation paper's own stated objection, in the
words quoted — and the entry earns it by naming the setup precisely enough
that a reader can check whether the assumption applies to their case. Nothing
volatile is typed anywhere in the body.
