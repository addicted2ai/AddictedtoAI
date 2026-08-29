---
job: seed-wiki-event-gpt-2-staged-release
verdict: approve
reasons: []
would-cite: >-
  Someone arguing that withholding weights buys safety — this entry quotes
  OpenAI's own report conceding "security through obscurity" is not a valid
  release strategy, while showing what the nine months did buy: partnership
  templates, detection baselines and a vocabulary for the argument.
reviewer: r3-opus
date: 2026-08-28
---

Checklist: wiki entry (event). Sources fetched 2026-08-28.

- cdn.openai.com/.../language_models_are_unsupervised_multitask_learners.pdf:
  resolves. WebFetch could not read the PDF, so I inflated its content
  streams locally and searched the extracted text. Verified verbatim:
  "GPT-2, is a 1.5B parameter Transformer that achieves state of the art
  results on 7 out of 8 tested language modeling datasets in a zero-shot
  setting but still underfits WebText"; the WebText construction — "we
  scraped all outbound links from Reddit, a social media platform, which
  received at least 3 karma. This can be thought of as a heuristic indicator
  for whether other users found the link interesting, educational, or just
  funny." — and "slightly over 8 million documents for a total of 40 GB of
  text". Table 2 gives 1542M parameters at 48 layers, matching the fact.
- Same PDF, the two closing details, both exact. Footnote 3 reads: "Alec,
  who previously thought of himself as good at random trivia, answered 17 of
  100 randomly sampled examples correctly when tested in the same setting as
  GPT-2. He actually only got 14 right but he should have gotten those other
  3". Table 13's caption reads: "Conditional generation on an
  out-of-distribution context by GPT-2. Cherry pick of 10 samples generated
  with k=40." So both the joke and the "cherry-pick of ten samples" label are
  the paper's, quoted correctly.
- arxiv.org/abs/1908.09203: resolves, title and author list as expected.
  Version history confirms the entry's two timeline dates exactly — v1
  submitted 24 August 2019, v2 submitted 13 November 2019.
- **How I verified the report's internal quotations, and what remains on
  trust.** The report PDF defeats text extraction: it uses subset fonts with
  custom encodings and hex-encoded strings, and two decoders I wrote (raw
  stream inflation, then a ToUnicode-CMap-aware pass) returned mojibake from
  both the v1 and v2 files and from a third mirror. WebFetch also could not
  read it. So I corroborated its content from search results that reproduce
  the document's own text rather than from the PDF: the Connor Leahy sentence
  came back word for word as the entry has it ("wrote about his intent to
  publish a replicated version of GPT-2 but changed his mind after discussion
  with researchers"); the Cornell figures came back as 355M rated credible
  "about 66% of the time" with 774M and 1.5B "at around 75%", matching the
  entry; the detector came back as "approximately 95% accuracy" on 1.5B
  output and RoBERTa-based, matching; and the "prudent to mistrust everything
  they read a little more" phrase was confirmed present in the report. The
  Brown/Munich replication contrast was confirmed in substance.
- Not independently verified, and standing on the author's transcription:
  the exact wording of "security through obscurity", "a cat and mouse game",
  the threat-monitoring sentence, "limited technical understanding of ML",
  and "This delay of nine months...". Search confirms these phrases belong to
  this document, but I could not read them in place to check word order.
  The risk is acceptable because every quotation I *could* check — the whole
  paper half, plus three of the report's figures — came back exact, and
  because none of the unchecked strings carries a number.
- Minor, not blocking: the v2 report is dated 13 November 2019 while the 1.5B
  weights went out on 5 November; "accompanies the release" is a fair
  description of the November report, not a date claim.

Clears the bar. The payload is the report's candour against its own press —
that monitoring found discussion of misuse but no misuse, and that the
company wrote down the objection its critics had made — plus two era details
(internet points as a data filter, a footnote in which a human pads his
trivia score) that a daily follower will not have. Approve.
