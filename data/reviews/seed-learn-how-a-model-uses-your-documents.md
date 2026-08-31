---
job: seed-learn-how-a-model-uses-your-documents
verdict: approve
reasons: []
would-cite: >-
  Someone debugging a chat product that answered wrongly while citing the
  correct section of their own handbook — this page names the four stages, gives
  each one its distinguishing fingerprint in the retrieved text, and shows why
  the instinctive repair of fetching more passages makes it worse by promoting
  near misses into the middle of the input where they are read least well.
reviewer: independent record reviewer, seven-page set (fresh context, no edit rights)
date: 2026-08-30
---

Checklist: education page (mechanics, Area D), against `openspec/curriculum/learn.md`
§2, §3 and the §4 entry, plus the `teach-the-whole-subject` delta for
`specs/education-static`. Four paper citations, all fetched to disk and probed
by literal substring 2026-08-30.

**Sendable sentence, verbatim** — the closing pair:

> You are not debugging a model. You are reviewing a search result.

The page also bolds a longer candidate ("The retriever's second-best guess does
more damage than a random passage…"), and it is the better *argument*; but the
closer is the sentence that would actually get pasted into a thread, and it
reframes the reader's whole task in nine words. Either satisfies the spec; the
page is nowhere near `not-worth-reading`.

## What I verified at source

- **arXiv 2312.05934** — both quoted spans present verbatim: "while
  unsupervised fine-tuning offers some improvement, RAG consistently outperforms
  it, both for existing knowledge encountered during training and entirely new
  knowledge", and "LLMs struggle to learn new factual information through
  unsupervised fine-tuning". December 2023 is right.
- **arXiv 2401.14887** — "negatively impact the effectiveness of the LLM" and
  the counter-intuitive one, "adding random documents in the prompt improves the
  LLM accuracy by up to 35%", both present verbatim. The title *The Power of
  Noise* checks, and January 2024 is right.
- **arXiv 2304.09848** — "fluent and appear informative, but frequently contain
  unsupported statements and inaccurate citations" and "a mere 51.5% of
  generated sentences are fully supported by citations and only 74.5% of
  citations support their associated sentence", both verbatim; "facade of
  trustworthiness" present. I also checked the attribution the page makes in
  prose: the authors really are Nelson F. Liu, Tianyi Zhang and Percy Liang, and
  v1 was submitted 19 April 2023, so "In April 2023" is exact. The paper's own
  phrase is "four popular generative search engines"; the page says "four
  commercial", which is a characterisation outside the quotation marks and is
  accurate to what those four were.
- **arXiv 2104.08663 (BEIR)** — "Our results show BM25 is a robust baseline" and
  "often underperform other approaches" present verbatim, and the page's counts
  are the abstract's own: "18 publicly available datasets" and "10
  state-of-the-art retrieval systems" against the page's "ten retrieval systems
  across eighteen datasets". April 2021 is right.

One inference the page makes is its own rather than a source's, and it is
labelled as such — the bolded second-best-guess claim is drawn by putting the
two *Power of Noise* results side by side, and the page says "Put those two
results side by side" before drawing it. That is the honest construction, and I
record it because a hasty reader could mistake it for a quoted finding.

## Unearned assumptions

Closure: `how-machines-represent-meaning`, `why-context-is-not-memory`,
`how-models-are-trained`, and behind them `how-a-language-model-works`,
`what-a-neural-network-is`, `what-a-model-is`, `learning-from-examples`,
`what-ai-actually-is`. Every lean checks out — weights fixed at training end,
the map's roughly/exactly signature, one flat sequence with position effects,
and the training-run argument for why facts belong in files.

The one outbound link outside the closure is
`/learn/why-models-are-confidently-wrong`, and it is a deferral, not a lean: the
page supplies the mechanism itself in the preceding sentence ("The citation was
generated the way the sentence was, by the same process, in the same pass") and
then hands the *why* to the other page. §5 permits exactly this, and §5's own
edge list for this page deliberately excludes that edge. Legal.

Terms of art all defined where they land: chunk, embedder, index, RAG (with the
excellent aside that "the letters explain nothing"), reranker, hybrid search,
BM25. Front matter matches §4 exactly — level, three prerequisites in order,
outcome verbatim. All three mentions and all seven internal links resolve on
disk.

## Coverage and bounds

Every §4 must-cover is present, and the entry's organising demand — that the
page be built around the failures rather than the happy path — is met
structurally, not just in one section: each stage is introduced together with
its characteristic failure, and the final section turns the whole thing into a
four-way differential diagnosis keyed to what the retrieved text looks like.
The exceptions-suffer-most paragraph is the best thing on the page and I could
not find it made anywhere else: the qualification follows the rule in prose, so
the qualification is the part most likely to be orphaned by a cut, which is
"the exact recipe for a confident, sourced, wrong answer about your own policy."

Must-nots respected: no vector-database comparisons, no agent loops, no chunking
recipes ("passages of a few hundred words" is descriptive of what happened, not
a parameter to copy).

Rot: no model names, no products, no prices, no benchmark scores, no version
numbers. Every number is a quotation from a dated paper.

## Taken on trust

The deferral to `/wiki/technique/retrieval-augmented-generation` for "the
measurement, and what a reranker buys" — I confirmed the entry exists but did
not read it to check that it carries a reranker measurement. The sentence stands
without it. Same for `concept/effective-context-length` and
`concept/embeddings`: confirmed to exist, contents not audited.

Approve. The opening is the page's cleverest move — a citation that resolves, to
the right section, attached to a wrong answer — because it makes the reader want
the mechanism before any vocabulary arrives, and every term afterwards is
introduced to explain that one opening.
