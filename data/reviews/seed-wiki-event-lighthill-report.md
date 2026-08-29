---
job: seed-wiki-event-lighthill-report
verdict: revise
reasons:
  - broken-reference
would-cite: >-
  Someone arguing British AI funding collapsed in 1973 because the research
  had failed — this entry shows Lighthill endorsed two of his three
  categories and recommended defunding none of them, and that McCarthy's
  objection was that the taxonomy had no slot for AI at all.
reviewer: r3-opus
date: 2026-08-28
---

Checklist: wiki entry (event). Sources fetched 2026-08-28.

- chilton-computing.org.uk/.../lighthill_report/p001.htm: resolves to
  "Artificial Intelligence: A General Survey" by Sir James Lighthill FRS
  (dated July 1972 on the page). "In no part of the field have the
  discoveries made so far produced the major impact that was then promised"
  is verbatim. Categories A, B and C as the entry describes them: A is
  advanced automation aimed at replacing humans for industrial, military,
  mathematical or scientific purposes; C is computer-based CNS research; B is
  the bridge activity, building robots, justified by what it carries between
  A and C. "Combinatorial explosion" is Lighthill's named cause, described as
  "a general obstacle to the construction of a self-organising system on a
  large knowledge base" — the entry's paraphrase is faithful.
- chilton-computing.org.uk/.../lighthill_report/overview.htm: resolves.
  Verbatim and matching the entry: "Lighthill's report was commissioned by
  the Science Research Council (SRC) to give an unbiased view of the state of
  AI research primarily in the UK in 1973" (which carries the entry's opening
  framing); "highly critical of basic research in the foundation areas";
  "provoked a massive loss of confidence in AI by the academic establishment
  in the UK including the funding body"; "persisted for almost a decade"; the
  September 1982 Research Area Review Meeting on Intelligent Knowledge-Based
  Systems becoming "the IKBS part of the Alvey Programme"; and the four reply
  authors Sutherland, Needham, Longuet-Higgins and Michie.
- aiai.ed.ac.uk/events/lighthill1973/: resolves. BBC TV, June 1973, Royal
  Institution, Lighthill against Michie, Gregory and McCarthy, "81 minutes".
  All four details confirmed.
- **Defect 1 — an uncited primary document.** The entry quotes John
  McCarthy's review twice. Both quotations are genuine: I found them at
  www-formal.stanford.edu/jmc/reviews/lighthill/lighthill.html ("Review of
  'Artificial Intelligence: A General Survey'"). But that document appears
  nowhere in the entry — not in `facts`, not as a `source_url`, not inline.
  Every other quoted source in this file is carried by a fact with a URL, so
  this is an inconsistency within the piece as well as a gap: a reader cannot
  check the two quotations the entry's central argument turns on.
- **Defect 2 — a quotation truncated without an ellipsis.** The entry renders
  McCarthy as "...studying the structure of information and the structure of
  problem solving processes independently of applications." The sentence
  continues: "...independently of applications and independently of its
  realization in animals or humans." Nothing is misrepresented, but the
  quotation is presented as complete when it is cut mid-clause.
- **Defect 3 — a fact not supported by its own citation.** The `published`
  fact sources the volume title "Artificial Intelligence: a paper symposium"
  to overview.htm. I queried that page twice with different prompts; it
  states "The Lighthill Report was published early in 1973" and lists the
  four repliers, but never names the volume. The volume title is not in
  dispute historically; the citation simply does not support it.
- Not independently verified: that no other page in the Chilton archive names
  the symposium volume — I checked the two pages the entry cites, not the
  whole site. A different `source_url` may well fix Defect 3 outright.

Three cheap, precise fixes: add a fact for McCarthy's review with the
Stanford URL; restore the elided clause or mark it with an ellipsis; and
point the volume-title fact at a page that actually carries it. Nothing here
is false — I verified every substantive claim — which is why this is a revise
and not a reject.

The payload is real and unusual: the report recommended defunding nothing,
and the collapse came from how a funding culture read a taxonomy. That is
worth publishing once the document it quotes is named. Revise.
